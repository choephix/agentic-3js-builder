import * as THREE from "three";
import {
  createBuilder,
  paint,
  scales,
  spots,
  countershade,
  mix,
  limb,
  catmull,
} from "../../../../src/index";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby teal hatchling with a big head, golden slit eyes, coral wings and back spikes, belly plates, and a speckled eggshell still stuck on its head. Rigged with spine, neck, head, jaw, tail, four legs and two wings, each wing with three digits.",
};

export default function build() {
  const b = createBuilder({ name: "babyDragon" });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------- palette ----------
  const CORAL = "#ff7f57";
  const CORAL_DARK = "#e0583a";
  const HORN = "#f4e3c1";
  const HORN_RIDGE = "#d7bd91";
  const CLAW = "#fff1d6";
  const SCLERA = "#fffaf0";
  const IRIS = "#ffb000";
  const IRIS_IN = "#ffd84a";
  const PUPIL = "#1a1420";
  const MOUTH = "#7a1f2b";
  const TONGUE = "#ff8fa3";
  const BLUSH = "#ff9eaa";
  const NOSTRIL = "#1d3b36";

  const backScales = scales(["#43b59b", "#3aa88f", "#4cc2a6"], "#2d8f79", { size: 0.03, width: 0.14 });
  const backPattern = spots(backScales, ["#2f8c8f", "#28788a"], { size: 0.09, amount: 0.3, seed: 4 });
  const belly = paint((p) => {
    const u = (p.z - 0.9 * p.y) / 0.04;
    const f = u - Math.floor(u);
    return f < 0.14 ? "#e2b862" : "#f7df98";
  });
  const skin = countershade(backPattern, belly, { level: -0.4, soft: 0.15 });
  const membranePaint = paint((_p, _n, s) => {
    const base = mix("#ff8a5e", "#ffc9a0", Math.min(1, s[0] * 0.9));
    const v = Math.abs(((s[1] * 4) % 1) - 0.5);
    return v > 0.44 ? mix(base, CORAL_DARK, 0.6) : base;
  });
  const shellPaint = spots("#fbf2df", ["#c9a77a", "#9fc7b8"], { size: 0.025, amount: 0.35, seed: 9 });

  const sphere = new THREE.SphereGeometry(1, 14, 10);
  const smallSphere = new THREE.SphereGeometry(1, 8, 6);

  // ---------- skeleton: trunk ----------
  const root = b.joint("root", { at: [0, 0.3, -0.1] });
  const spine = b.chain("spine", [[0, 0.3, -0.1], [0, 0.32, 0.02], [0, 0.34, 0.13]], {
    parent: root,
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neck = b.chain("neck", [[0, 0.355, 0.14], [0, 0.45, 0.2], [0, 0.535, 0.235]], {
    parent: "spine2",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  const head = b.joint("head", { parent: "neck2", at: [0, 0.55, 0.245], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.53, 0.28], dir: [0, -0.1, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.28, -0.2],
      [0, 0.24, -0.36],
      [0, 0.19, -0.52],
      [0, 0.17, -0.66],
      [0, 0.19, -0.8],
      [0, 0.23, -0.88],
    ]),
    { parent: root, count: 5, role: "tail" },
  );

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.27, -0.24], w: 0.14, h: 0.13 },
      { at: [0, 0.29, -0.12], w: 0.27, h: 0.25 },
      { at: [0, 0.31, 0.02], w: 0.3, h: 0.28 },
      { at: [0, 0.34, 0.13], w: 0.24, h: 0.23 },
      { at: [0, 0.4, 0.19], w: 0.13, h: 0.13 },
    ],
    { color: skin, bone: [spine, neck], name: "body" },
  );
  const neckTube = b.sweep(neck, (t) => [0.072 - 0.02 * t, 0.068 - 0.018 * t], { color: skin, name: "neckTube" });
  const tailTube = b.sweep(tail, (t) => 0.07 * Math.pow(1 - t, 1.2) + 0.01, { color: skin, name: "tailTube" });

  // tail spade
  const tailEnd = tail.at(1);
  b.extrude(
    [
      [-0.01, -0.012],
      [0.04, -0.05, "sharp"],
      [0.105, 0, "sharp"],
      [0.04, 0.05, "sharp"],
      [-0.01, 0.012],
    ],
    {
      color: CORAL,
      at: tailEnd.at,
      x: tailEnd.tangent,
      y: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.004,
      bone: "tail5",
      name: "tailSpade",
    },
  );

  // back spikes: flat little plates
  const spikeGeo = new THREE.ConeGeometry(0.022, 0.055, 4);
  b.along(body, 5, (pt) => b.stick(spikeGeo, CORAL, pt, { embed: 0.3, scale: [0.5, 1, 1] }), { from: 0.22, to: 0.85 });
  b.along(neckTube, 2, (pt) => b.stick(spikeGeo, CORAL, pt, { embed: 0.3, scale: [0.45, 0.85, 0.85] }), {
    from: 0.1,
    to: 0.8,
  });
  b.along(
    tailTube,
    7,
    (pt) => {
      const k = 1 - 0.6 * pt.t;
      b.stick(spikeGeo, CORAL, pt, { embed: 0.3, scale: [0.5 * k, k, k] });
    },
    { from: 0.05, to: 0.9 },
  );

  // ---------- head ----------
  b.part(sphere, skin, { bone: head, at: [0, 0.6, 0.27], scale: [0.125, 0.11, 0.115], name: "cranium" });
  b.part(sphere, skin, { bone: head, at: [0, 0.555, 0.37], scale: [0.08, 0.055, 0.095], name: "snout" });
  b.part(smallSphere, MOUTH, { bone: head, at: [0, 0.52, 0.36], scale: [0.062, 0.028, 0.075], name: "mouth" });
  // lower jaw
  b.part(sphere, skin, { bone: jaw, at: [0, 0.505, 0.355], scale: [0.068, 0.032, 0.085], name: "lowerJaw" });
  b.part(smallSphere, TONGUE, { bone: jaw, at: [0, 0.53, 0.37], scale: [0.04, 0.012, 0.05], name: "tongue" });

  const tooth = new THREE.ConeGeometry(0.008, 0.02, 4);
  for (const x of [-1, 1]) {
    b.part(tooth, CLAW, { bone: head, at: [x * 0.04, 0.51, 0.42], rotation: [180, 0, 0], name: `fang${x > 0 ? "L" : "R"}` });
    b.part(tooth, CLAW, { bone: jaw, at: [x * 0.028, 0.532, 0.425], scale: 0.7 });
  }
  // nostrils & nub horn
  for (const x of [-1, 1])
    b.part(smallSphere, NOSTRIL, { bone: head, at: [x * 0.028, 0.576, 0.451], scale: [0.011, 0.007, 0.008] });
  b.spike([0, 0.598, 0.41], [0, 0.8, 0.6], 0.035, 0.012, { color: HORN, bone: head, name: "noseHorn" });

  // eyes, lids, blush, horns, frills
  for (const x of [-1, 1]) {
    const S = x > 0 ? "L" : "R";
    const eye = V(x * 0.07, 0.61, 0.355);
    const d = V(x * 0.5, 0.05, 1).normalize();
    const up = V(0, 1, 0);
    const side = V(x, 0, 0);
    b.part(sphere, SCLERA, { bone: head, at: eye, scale: 0.045, name: `eye${S}` });
    b.part(sphere, IRIS, {
      bone: head,
      at: eye.clone().addScaledVector(d, 0.034),
      dir: d,
      axis: "z",
      scale: [0.033, 0.033, 0.016],
      name: `iris${S}`,
    });
    b.part(sphere, IRIS_IN, {
      bone: head,
      at: eye.clone().addScaledVector(d, 0.038),
      dir: d,
      axis: "z",
      scale: [0.021, 0.021, 0.014],
    });
    b.part(sphere, PUPIL, {
      bone: head,
      at: eye.clone().addScaledVector(d, 0.041),
      dir: d,
      axis: "z",
      scale: [0.007, 0.023, 0.014],
      name: `pupil${S}`,
    });
    b.part(smallSphere, "#ffffff", {
      bone: head,
      at: eye.clone().addScaledVector(d, 0.047).addScaledVector(up, 0.014).addScaledVector(side, -0.008),
      scale: 0.0075,
    });
    b.part(smallSphere, "#ffffff", {
      bone: head,
      at: eye.clone().addScaledVector(d, 0.047).addScaledVector(up, -0.012).addScaledVector(side, 0.008),
      scale: 0.004,
    });
    // sleepy-cute upper lid
    b.part(new THREE.SphereGeometry(0.049, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.36), skin, {
      bone: head,
      at: eye,
      dir: V(0.25 * x, 0.85, 0.45).normalize(),
      name: `lid${S}`,
    });
    // blush
    b.part(smallSphere, BLUSH, { bone: head, at: [x * 0.08, 0.548, 0.35], scale: [0.012, 0.02, 0.03] });
    // horns with ridge bands
    b.sweep(catmull([[x * 0.055, 0.68, 0.25], [x * 0.072, 0.73, 0.21], [x * 0.085, 0.752, 0.13]]), (t) => 0.022 * (1 - t) + 0.002, {
      bands: [
        [0.3, HORN],
        [0.37, HORN_RIDGE],
        [0.62, HORN],
        [0.69, HORN_RIDGE],
        [1, "#fff6e2"],
      ],
      caps: { start: "flat", end: "point" },
      bone: head,
      name: `horn${S}`,
    });
    // ear frills
    b.extrude(
      [
        [0, -0.02],
        [0.06, -0.04, "sharp"],
        [0.05, 0],
        [0.085, 0.02, "sharp"],
        [0.045, 0.035],
        [0.06, 0.07, "sharp"],
        [0, 0.03],
      ],
      {
        color: CORAL,
        at: [x * 0.105, 0.6, 0.22],
        x: V(x * 0.8, 0.1, -0.6).normalize(),
        y: [0, 1, 0],
        thickness: 0.008,
        bevel: 0.003,
        bone: head,
        name: `frill${S}`,
      },
    );
  }
  // head ridge spikes
  const headSpikes: Array<[number, number, number, number]> = [
    [0, 0.69, 0.19, 0.8],
    [0, 0.65, 0.155, 0.7],
    [0, 0.6, 0.14, 0.6],
  ];
  for (const [x, y, z, k] of headSpikes)
    b.part(spikeGeo, CORAL, { bone: head, at: [x, y, z], dir: [0, 0.6, -0.8], scale: [0.5 * k, k, k] });

  // eggshell hat with a zigzag rim
  const shellC = V(0, 0.68, 0.3);
  b.part(new THREE.SphereGeometry(0.055, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.4), shellPaint, {
    bone: head,
    at: shellC,
    rotation: [-8, 0, 6],
    name: "eggshell",
  });
  const shard = new THREE.ConeGeometry(0.012, 0.026, 3);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const out = V(Math.cos(a), 0, Math.sin(a));
    b.part(shard, "#fbf2df", {
      bone: head,
      at: shellC.clone().addScaledVector(out, 0.05).add(V(0, 0.022, 0)),
      dir: out.clone().multiplyScalar(0.35).add(V(0, 1, 0)),
      scale: [1, 1, 0.4],
    });
  }

  // ---------- legs ----------
  const cone = new THREE.ConeGeometry(0.008, 0.026, 5);
  const leg = (x: number, front: boolean) => {
    const S = x > 0 ? "L" : "R";
    const top = front ? V(0.1 * x, 0.28, 0.14) : V(0.11 * x, 0.26, -0.09);
    const ankle = front ? V(0.12 * x, 0.06, 0.17) : V(0.13 * x, 0.06, -0.08);
    const pts = limb(top, ankle, front ? [0.12, 0.11] : [0.13, 0.12], front ? [0, 0, -1] : [0, 0, 1]);
    const toe = ankle.clone().add(V(0, -0.03, 0.09));
    const names = front
      ? [`shoulder${S}`, `elbow${S}`, `wrist${S}`, `hand${S}`]
      : [`hip${S}`, `knee${S}`, `ankle${S}`, `toe${S}`];
    const ch = b.chain(front ? `foreLeg${S}` : `hindLeg${S}`, [pts[0], pts[1], pts[2], toe], {
      parent: front ? "spine2" : "root",
      names,
      role: "leg",
    });
    const [j0, j1, j2] = ch.joints;
    if (front) b.part(sphere, skin, { bone: j0, at: pts[0].clone().lerp(pts[1], 0.25).add(V(0.01 * x, 0, 0)), scale: [0.05, 0.06, 0.055] });
    else b.part(sphere, skin, { bone: j0, at: pts[0].clone().lerp(pts[1], 0.35).add(V(0.015 * x, 0, 0)), scale: [0.065, 0.08, 0.085] });
    b.capsule(pts[0], pts[1], front ? [0.045, 0.035] : [0.05, 0.038], { color: skin, bone: j0 });
    b.capsule(pts[1], pts[2], [0.034, 0.03], { color: skin, bone: j1 });
    b.part(sphere, skin, { bone: j2, at: [ankle.x, 0.032, ankle.z + 0.03], scale: [0.045, 0.032, 0.062] });
    for (const k of [-1, 0, 1]) {
      b.part(smallSphere, skin, { bone: j2, at: [ankle.x + k * 0.026, 0.019, ankle.z + 0.072], scale: 0.019 });
      b.part(cone, CLAW, { bone: j2, at: [ankle.x + k * 0.026, 0.015, ankle.z + 0.094], dir: [0, -0.25, 1] });
    }
  };
  for (const x of [-1, 1]) {
    leg(x, true);
    leg(x, false);
  }

  // ---------- wings (spread, rest pose) ----------
  const wing = (x: number) => {
    const S = x > 0 ? "L" : "R";
    const R = V(0.09 * x, 0.42, 0.07);
    const E = V(0.22 * x, 0.52, 0.03);
    const W = V(0.35 * x, 0.56, -0.01);
    const tips = [V(0.52 * x, 0.57, -0.09), V(0.47 * x, 0.47, -0.15), V(0.34 * x, 0.38, -0.17)];
    const A = V(0.09 * x, 0.36, -0.09);
    const arm = b.chain(`wing${S}`, [R, E, W], {
      parent: "spine2",
      names: [`wing${S}1`, `wing${S}2`, `wing${S}3`],
      role: "wing",
    });
    b.sweep(arm, [0.024, 0.013], { color: skin, name: `wingArm${S}` });
    const wrist = arm.joints[2];
    b.spike(W, V(0.2 * x, 0.6, 1), 0.04, 0.011, { color: CLAW, bone: wrist, name: `thumbClaw${S}` });
    const fingers = tips.map((tip, k) => {
      const f = b.chain(`finger${S}${k + 1}`, [W, tip], {
        parent: wrist,
        count: 2,
        names: [`finger${S}${k + 1}a`, `finger${S}${k + 1}b`],
        role: "digit",
      });
      b.sweep(f, [0.011, 0.004], { color: CORAL_DARK });
      b.spike(tip, tip.clone().sub(W), 0.02, 0.005, { color: CLAW, bone: f.joints[1] });
      return f;
    });
    b.membrane(fingers[0], fingers[1], { color: membranePaint, thickness: 0.004, scallop: 0.18, name: `wingWeb${S}1` });
    b.membrane(fingers[1], fingers[2], { color: membranePaint, thickness: 0.004, scallop: 0.18, name: `wingWeb${S}2` });
    b.membrane(fingers[2], [E, R, A], {
      color: membranePaint,
      thickness: 0.004,
      scallop: 0.12,
      bone: `wing${S}1`,
      name: `wingWeb${S}3`,
    });
  };
  wing(1);
  wing(-1);

  // a little open mouth to show the tongue and teeth
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
