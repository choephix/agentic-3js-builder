import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  countershade,
  scales,
  stripes,
  spots,
  limb,
} from "../../../../src/index";

export const meta = {
  name: "Baby Dragon with Hatched Egg",
  description:
    "A house-cat-sized teal baby dragon sitting beside its broken speckled egg, with orange back spines, stubby horns, amber eyes, oversized amber-webbed wings, a spade-tipped tail and a wisp of smoke from one nostril.",
};

const TEAL = "#2fa59c";
const TEAL_D = "#1c7d7e";
const BELLY = "#f7e6a8";
const BELLY2 = "#efd37e";
const SPINE = "#f28a3a";
const HORN = "#f3dca6";
const CLAW = "#f6ecd0";
const EYE = "#ffb21e";
const PUPIL = "#1a1210";
const WHITE = "#ffffff";
const PINK = "#f0907c";
const TONGUE = "#e8728a";
const MEM1 = "#f5b24c";
const MEM2 = "#eea03c";
const MEM3 = "#f8c266";
const SMOKE1 = "#cdd7d9";
const SMOKE2 = "#e8eeee";
const SHELL = "#f4ead2";
const FRECKLE = "#7f5a3a";
const GOO = "#f2cf6e";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "babyDragon" });

  const coat = countershade(
    scales(TEAL, TEAL_D, { size: 0.03 }),
    stripes(BELLY, BELLY2, { size: 0.02, axis: "z" }),
    { level: -0.25 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.085, -0.08] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.085, -0.08],
      [0, 0.135, -0.03],
      [0, 0.19, 0.03],
      [0, 0.25, 0.065],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.25, 0.065],
      [0, 0.285, 0.085],
      [0, 0.32, 0.105],
    ]),
    { parent: chest, names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.32, 0.105],
    dir: [0, 0.05, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, down: 0.04 }),
    aim: head.local({ forward: 0.12, down: 0.04 }),
    role: "jaw",
  });

  // ---------- body ----------
  const keys = [0.085, 0.1, 0.095, 0.075, 0.056];
  const R = (t: number) => {
    const x = Math.min(Math.max(t, 0), 1) * (keys.length - 1);
    const i = Math.min(Math.floor(x), keys.length - 2);
    return keys[i] + (keys[i + 1] - keys[i]) * (x - i);
  };
  const body = b.sweep(spine, (t) => [R(t), R(t) * 0.95], {
    color: coat,
    shift: (t) => [0, -0.012 * Math.sin(Math.PI * t)],
  });
  const neckTube = b.sweep(neck, [0.056, 0.046], { color: coat });

  // ---------- tail ----------
  const tailPts: number[][] = [
    [0, 0.075, -0.11],
    [0, 0.055, -0.19],
    [0.09, 0.04, -0.24],
    [0.17, 0.032, -0.17],
    [0.2, 0.026, -0.07],
  ];
  const tail = b.chain("tail", catmull(tailPts), {
    parent: hips,
    count: 5,
    names: (i: number) => `tail${i + 1}`,
    role: "tail",
  });
  const tailTube = b.sweep(tail, [0.058, 0.045, 0.037, 0.03, 0.025], { color: coat });
  const tailEnd = tail.joints[tail.joints.length - 1];
  b.extrude(
    [
      [-0.01, -0.012],
      [0.015, -0.035],
      [0.05, -0.02],
      [0.085, 0, "sharp"],
      [0.05, 0.02],
      [0.015, 0.035],
      [-0.01, 0.012],
    ],
    {
      at: [0.2, 0.03, -0.075],
      x: [0.25, 0, 0.97],
      y: [0.97, 0, -0.25],
      thickness: 0.012,
      bevel: 0.003,
      color: SPINE,
      bone: tailEnd,
    },
  );

  // ---------- spines ----------
  b.along(body, 9, (at) => {
    const k = 0.7 + 0.5 * Math.sin(Math.PI * at.t);
    b.stick(new THREE.ConeGeometry(0.013 * k, 0.05 * k, 5), SPINE, at);
  });
  b.along(neckTube, 3, (at) => {
    const k = 0.6 - 0.1 * at.t;
    b.stick(new THREE.ConeGeometry(0.012 * k, 0.045 * k, 5), SPINE, at);
  });
  b.along(tailTube, 8, (at) => {
    const k = 1 - 0.65 * at.t;
    b.stick(new THREE.ConeGeometry(0.013 * k, 0.045 * k, 5), SPINE, at);
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 10, 8), coat, {
    bone: head,
    at: head.local({ forward: 0.05, up: 0.015 }),
    scale: [0.058, 0.05, 0.06],
  });
  // upper snout
  b.frustumBox(
    head.local({ forward: 0.07, up: 0.0 }),
    head.local({ forward: 0.15, up: 0.0 }),
    [0.075, 0.055],
    [0.05, 0.04],
    { bone: head, color: coat },
  );
  // lower jaw
  b.frustumBox(
    head.local({ forward: 0.035, down: 0.045 }),
    head.local({ forward: 0.145, down: 0.042 }),
    [0.06, 0.02],
    [0.04, 0.016],
    { bone: jaw, color: BELLY },
  );
  b.frustumBox(
    head.local({ forward: 0.05, down: 0.034 }),
    head.local({ forward: 0.12, down: 0.034 }),
    [0.03, 0.008],
    [0.02, 0.008],
    { bone: jaw, color: TONGUE },
  );

  for (const s of [1, -1]) {
    // teeth
    for (const f of [0.095, 0.115, 0.135]) {
      b.spike(head.local({ forward: f, down: 0.025, left: s * 0.02 }), [0, -1, 0], 0.014, 0.006, {
        color: CLAW,
        bone: head,
      });
      b.spike(head.local({ forward: f + 0.005, down: 0.037, left: s * 0.018 }), [0, 1, 0], 0.012, 0.005, {
        color: CLAW,
        bone: jaw,
      });
    }
    // nostrils
    b.part(new THREE.SphereGeometry(0.006, 6, 4), PUPIL, {
      bone: head,
      at: head.local({ forward: 0.149, up: 0.01, left: s * 0.014 }),
    });
    // eyes
    const ec = { forward: 0.065, up: 0.028, left: s * 0.048 };
    b.part(new THREE.SphereGeometry(0.024, 10, 8), EYE, { bone: head, at: head.local(ec) });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), PUPIL, {
      bone: head,
      at: head.local({ forward: ec.forward + 0.009, up: ec.up, left: s * (0.048 + 0.012) }),
    });
    b.part(new THREE.SphereGeometry(0.005, 6, 4), WHITE, {
      bone: head,
      at: head.local({ forward: ec.forward + 0.014, up: ec.up + 0.008, left: s * (0.048 + 0.013) }),
    });
    // cheeks
    b.part(new THREE.SphereGeometry(1, 6, 5), PINK, {
      bone: head,
      at: head.local({ forward: 0.05, down: 0.012, left: s * 0.054 }),
      scale: [0.006, 0.012, 0.014],
    });
    // brow
    b.capsule(
      head.local({ forward: 0.075, up: 0.055, left: s * 0.025 }),
      head.local({ forward: 0.055, up: 0.058, left: s * 0.06 }),
      0.008,
      { bone: head, color: TEAL_D },
    );
    // horns
    const hb = head.local({ forward: 0.02, up: 0.045, left: s * 0.03 });
    const hc = head.local({ forward: 0.0, up: 0.075, left: s * 0.04 });
    const ht = head.local({ forward: -0.025, up: 0.1, left: s * 0.052 });
    b.sweep(polyline([hb, hc, ht]), [0.017, 0], {
      bone: head,
      color: HORN,
      caps: { start: "flat", end: "point" },
      sides: 6,
    });
  }

  // smoke wisp from the left nostril
  const smoke = catmull([
    head.local({ forward: 0.16, up: 0.012, left: 0.014 }),
    head.local({ forward: 0.18, up: 0.04, left: 0.03 }),
    head.local({ forward: 0.17, up: 0.07, left: 0.01 }),
    head.local({ forward: 0.15, up: 0.1, left: 0.03 }),
    head.local({ forward: 0.17, up: 0.13, left: 0.05 }),
  ]);
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    b.part(new THREE.SphereGeometry(0.007 + 0.014 * t, 7, 5), i % 2 ? SMOKE2 : SMOKE1, {
      bone: head,
      at: smoke.at(t),
      flat: true,
    });
  }

  // ---------- toes helper ----------
  const toes = (tip: any, x: number, z: number, s: number) => {
    for (const k of [-1, 0, 1]) {
      const a: number[] = [x + k * 0.02, 0.013, z + 0.005];
      const e: number[] = [x + k * 0.027, 0.012, z + 0.045];
      b.capsule(a, e, 0.012, { bone: tip, color: TEAL, sides: 6 });
      b.spike(e, [k * 0.2 + s * 0.05, 0, 1], 0.02, 0.008, { bone: tip, color: CLAW, sides: 5 });
    }
  };

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";

    // hind legs
    const hipP: number[] = [s * 0.085, 0.085, -0.06];
    const footP: number[] = [s * 0.115, 0.02, 0.06];
    const hind = limb(hipP, footP, [0.09, 0.09], [s * 0.5, 1, 0.2]);
    const hindChain = b.chain(`legH${S}`, hind, {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [footP[0], 0, footP[2]],
    });
    b.sweep(hindChain, [0.045, 0.034, 0.024], { color: coat });
    b.part(new THREE.SphereGeometry(1, 9, 7), coat, {
      bone: hindChain.joints[0],
      at: [s * 0.095, 0.075, -0.04],
      scale: [0.05, 0.065, 0.075],
    });
    toes(hindChain.tip, footP[0], footP[2], s);

    // front arms
    const shP: number[] = [s * 0.07, 0.19, 0.05];
    const handP: number[] = [s * 0.075, 0.02, 0.14];
    const arm = limb(shP, handP, [0.1, 0.1], [s * 0.3, 0, -1]);
    const armChain = b.chain(`armF${S}`, arm, {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `hand${S}`],
      role: "arm",
      contact: [handP[0], 0, handP[2]],
    });
    b.sweep(armChain, [0.034, 0.027, 0.02], { color: coat });
    b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, { bone: armChain.joints[0], at: shP });
    toes(armChain.tip, handP[0], handP[2], s);

    // wings
    const W0: number[] = [s * 0.06, 0.245, 0.01];
    const W1: number[] = [s * 0.16, 0.31, -0.06];
    const W2: number[] = [s * 0.27, 0.36, -0.03];
    const wing = b.chain(`wing${S}`, catmull([W0, W1, W2]), {
      parent: chest,
      names: [`wingShoulder${S}`, `wingElbow${S}`, `wingWrist${S}`],
      role: "wing",
    });
    b.sweep(wing, [0.024, 0.017, 0.012], { color: coat });
    b.spike(W2, [s * 0.4, 0.8, 0.2], 0.04, 0.012, { bone: wing.tip, color: CLAW, sides: 5 });

    const fingerTips: number[][][] = [
      [[s * 0.38, 0.45, -0.04], [s * 0.52, 0.5, -0.1]],
      [[s * 0.37, 0.4, -0.14], [s * 0.5, 0.38, -0.24]],
      [[s * 0.32, 0.32, -0.16], [s * 0.4, 0.24, -0.3]],
    ];
    const fingers = fingerTips.map((f, i) => {
      const ch = b.chain(`finger${i + 1}${S}`, catmull([W2, f[0], f[1]]), {
        parent: wing.tip,
        names: [`wf${i + 1}a${S}`, `wf${i + 1}b${S}`, `wf${i + 1}tip${S}`],
        role: "digit",
      });
      b.sweep(ch, [0.009, 0.006, 0.0035], { color: coat, sides: 6 });
      return ch;
    });
    b.membrane(fingers[0], fingers[1], { thickness: 0.006, color: MEM1, bone: chest });
    b.membrane(fingers[1], fingers[2], { thickness: 0.006, color: MEM2, bone: chest });
    b.membrane(fingers[2], [W2, W1, [s * 0.1, 0.13, -0.07]], {
      thickness: 0.006,
      color: MEM3,
      bone: chest,
    });
  }

  // ---------- egg ----------
  const ex = -0.27;
  const ez = 0.12;
  const eggPaint = spots(SHELL, FRECKLE, { size: 0.025, amount: 0.35 });
  b.lathe(
    [
      [0, 0],
      [0.045, 0.004],
      [0.075, 0.03],
      [0.085, 0.07],
      [0.083, 0.095],
      [0.074, 0.095],
      [0.076, 0.07],
      [0.066, 0.035],
      [0.04, 0.012],
      [0, 0.01],
    ],
    { at: [ex, 0, ez], segments: 14, color: eggPaint, bone: hips },
  );
  b.part(new THREE.CylinderGeometry(0.066, 0.06, 0.012, 12), GOO, {
    bone: hips,
    at: [ex, 0.017, ez],
  });
  const heights = [0.03, 0.012, 0.04, 0.02, 0.05, 0.016, 0.028, 0.01, 0.036];
  heights.forEach((h, i) => {
    const a = (i / heights.length) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.018, h, 3), eggPaint, {
      bone: hips,
      at: [ex + Math.cos(a) * 0.0795, 0.09 + h / 2, ez + Math.sin(a) * 0.0795],
      rotation: [0, 90 - (a * 180) / Math.PI, 0],
      scale: [1, 1, 0.25],
    });
  });
  b.extrude(
    [
      [0, 0],
      [0.05, 0.005],
      [0.07, 0.04],
      [0.03, 0.065],
      [-0.02, 0.035],
    ],
    { at: [ex + 0.06, 0.004, ez + 0.1], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.006, color: eggPaint, bone: hips },
  );
  b.extrude(
    [
      [0, 0],
      [0.04, -0.01],
      [0.055, 0.02],
      [0.01, 0.045],
    ],
    { at: [ex - 0.12, 0.004, ez + 0.06], x: [0.8, 0, 0.6], y: [-0.6, 0, 0.8], thickness: 0.006, color: eggPaint, bone: hips },
  );

  // open the grin a little
  b.pose(jaw, { axis: [1, 0, 0], deg: 14 });

  return b.root;
}
