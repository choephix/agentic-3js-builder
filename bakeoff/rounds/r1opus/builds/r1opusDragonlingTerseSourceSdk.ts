import * as THREE from "three";
import {
  createBuilder,
  paint,
  scales,
  mix,
  smoothstep,
  svg,
  catmull,
} from "../../../../src/index";
import type { Frame } from "../../../../src/index";

export const meta = {
  name: "Baby Dragon",
  description:
    "A chubby emerald baby dragon in a rest pose: big amber eyes, ivory ringed horns, orange ear frills, glowing dorsal spikes, a spade tail and outstretched veined wings.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "babyDragon", detail: 1, paintSize: 1024 });

  // ---------------- palette & paints ----------------
  const DEEP = "#1b7462";
  const WINGBONE = "#1f8a72";
  const PAW = "#239a7e";
  const CLAW = "#fff3d6";

  const scaleP = scales(["#2bb08f", "#27a386", "#33bd99"], "#1a6c5a", { size: 0.024, seed: 3 });
  const bellyP = paint((p) => {
    const f = (((p.z * 28) % 1) + 1) % 1;
    return f < 0.14 ? "#d9a94f" : "#f6d98a";
  });
  const bodyPaint = paint((p, n) => {
    const back = scaleP.at(p, n);
    const ridge = smoothstep(0.75, 0.97, n.y);
    const top = mix(back, DEEP, ridge * 0.6);
    const belly = smoothstep(-0.12, -0.5, n.y);
    if (belly <= 0) return top;
    return mix(top, bellyP.at(p, n), belly);
  });
  const headPaint = paint((p, n) => {
    const base = bodyPaint.at(p, n);
    const d = Math.hypot(Math.abs(p.x) - 0.062, p.y - 0.44, p.z - 0.325);
    return mix(base, "#ff8c8c", smoothstep(0.032, 0.012, d) * 0.6);
  });
  const spikePaint = paint((_p, _n, s) => mix("#ff7432", "#ffd56b", smoothstep(0.1, 1, s[0])));
  const hornPaint = paint((_p, _n, s) => {
    const t = s[0];
    const base = mix("#fbf1d6", "#e0954a", smoothstep(0.3, 1, t));
    const f = (t * 6) % 1;
    return f < 0.13 && t < 0.8 ? mix(base, "#b07a45", 0.6) : base;
  });
  const wingPaint = paint((_p, _n, s) => {
    const base = mix("#ffb057", "#e4523c", smoothstep(0, 1, s[0]));
    const f = (s[1] * 3) % 1;
    const d = Math.min(f, 1 - f);
    const vein = smoothstep(0.05, 0.012, d) * smoothstep(0.05, 0.25, s[0]);
    return mix(base, "#a8342a", vein * 0.7);
  });

  const irisTex = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#fff08a"/><stop offset="55%" stop-color="#ffc23a"/><stop offset="100%" stop-color="#e3701a"/>
      </radialGradient></defs>
      <circle cx="50" cy="50" r="45" fill="url(#g)" stroke="#5a2a0a" stroke-width="5"/>
      <ellipse cx="50" cy="52" rx="9" ry="30" fill="#140a04"/>
      <circle cx="36" cy="32" r="10" fill="#ffffff"/>
      <circle cx="63" cy="68" r="5" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  // ---------------- skeleton: torso, neck, head, tail ----------------
  b.joint("hips", { at: [0, 0.24, -0.16], dir: [0, 0, 1] });
  const spine = b.chain("spine", [[0, 0.245, -0.08], [0, 0.255, 0.02], [0, 0.27, 0.12]], {
    parent: "hips",
    names: ["spine1", "spine2"],
    role: "spine",
  });
  const neckChain = b.chain("neck", [[0, 0.29, 0.12], [0, 0.36, 0.19], [0, 0.43, 0.23]], {
    parent: "spine2",
    names: ["neck1", "neck2"],
    role: "neck",
  });
  b.joint("head", { at: [0, 0.45, 0.24], dir: [0, 0, 1], parent: "neck2", role: "head" });
  b.joint("jaw", { at: [0, 0.425, 0.25], dir: [0, -0.08, 1], parent: "head", role: "jaw" });
  const tailChain = b.chain(
    "tail",
    catmull([[0, 0.235, -0.2], [0, 0.2, -0.34], [0, 0.14, -0.48], [0, 0.11, -0.62], [0, 0.125, -0.74]]),
    { parent: "hips", count: 5, role: "tail" },
  );

  // ---------------- body volumes ----------------
  const body = b.loft(
    [
      { at: [0, 0.235, -0.24], w: 0.09, h: 0.09 },
      { at: [0, 0.245, -0.15], w: 0.17, h: 0.165 },
      { at: [0, 0.255, -0.03], w: 0.19, h: 0.19 },
      { at: [0, 0.265, 0.08], w: 0.17, h: 0.18 },
      { at: [0, 0.29, 0.17], w: 0.11, h: 0.12 },
    ],
    { color: bodyPaint, bone: ["hips", spine], sides: 10, name: "body" },
  );
  const neck = b.sweep(neckChain, [0.055, 0.045], { color: bodyPaint, sides: 10, name: "neck" });
  const tail = b.sweep(tailChain, (t) => 0.052 * (1 - t) + 0.011 * t, {
    color: bodyPaint,
    extend: [0.04, 0],
    sides: 10,
    name: "tail",
  });

  const head = b.loft(
    [
      { at: [0, 0.465, 0.2], w: 0.12, h: 0.11 },
      { at: [0, 0.47, 0.25], w: 0.16, h: 0.145 },
      { at: [0, 0.462, 0.3], w: 0.14, h: 0.11 },
      { at: [0, 0.452, 0.35], w: 0.1, h: 0.07 },
      { at: [0, 0.448, 0.385], w: 0.08, h: 0.05 },
    ],
    { color: headPaint, bone: "head", sides: 12, name: "head" },
  );
  b.loft(
    [
      { at: [0, 0.418, 0.25], w: 0.1, h: 0.045 },
      { at: [0, 0.41, 0.32], w: 0.08, h: 0.035 },
      { at: [0, 0.414, 0.365], w: 0.05, h: 0.026 },
    ],
    { color: headPaint, bone: "jaw", sides: 10, name: "lowerJaw" },
  );
  const headSurf = b.surface(head);

  // ---------------- spikes ----------------
  const dorsal = (pt: Frame, h: number, r: number) => {
    const base = pt.moved([0, -0.004, 0]);
    const tip = pt.at.addScaledVector(pt.axis, h).add(new THREE.Vector3(0, 0, -0.45 * h));
    b.spike(base, tip, null, r, { color: spikePaint, sides: 6 });
  };
  b.along(body, 6, (pt) => dorsal(pt, 0.022 + 0.012 * Math.sin(Math.PI * pt.t), 0.012), { from: 0.12, to: 0.88 });
  b.along(neck, 3, (pt) => dorsal(pt, 0.02, 0.009));
  b.along(tail, 7, (pt) => dorsal(pt, 0.028 * (1 - 0.65 * pt.t), 0.011 * (1 - 0.5 * pt.t)), { from: 0.04, to: 0.86 });
  for (const [z, h] of [
    [0.215, 0.026],
    [0.185, 0.018],
  ] as const) {
    const hit = headSurf.nearest([0, 0.55, z]);
    const tip = hit.at.addScaledVector(hit.n, h).add(new THREE.Vector3(0, 0, -0.4 * h));
    b.spike(hit.moved([0, -0.004, 0]), tip, null, 0.009, { color: spikePaint, sides: 6, bone: "head" });
  }

  // tail spade
  const tailEnd = tailChain.at(1);
  const tangent = tailEnd.tangent;
  b.extrude(
    [[0, 0], [0.03, 0.042], [0.066, 0.036], [0.105, 0, "sharp"], [0.066, -0.036], [0.03, -0.042]],
    {
      color: "#ff7a3a",
      at: tailEnd.at.addScaledVector(tangent, -0.02),
      x: tangent,
      y: [1, 0, 0],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      bone: "tail5",
      name: "tailSpade",
    },
  );

  // ---------------- face details ----------------
  for (const s of [1, -1]) {
    const P = (x: number, y: number, z: number) => [s * x, y, z];

    // eyes
    const hit = headSurf.nearest(P(0.07, 0.5, 0.29));
    const eyeDir = new THREE.Vector3(s * 0.55, 0.12, 0.83).normalize();
    const c = hit.at.addScaledVector(hit.n, -0.008);
    const eye = b.part(new THREE.SphereGeometry(0.03, 16, 12), "#fff8ec", { at: c, bone: "head" });
    b.decal(eye, irisTex, {
      at: c.clone().addScaledVector(eyeDir, 0.03),
      dir: eyeDir,
      size: [0.046, 0.046],
      bone: "head",
      mirror: s < 0,
    });
    b.capsule(
      c.clone().add(new THREE.Vector3(-s * 0.012, 0.03, 0.01)),
      c.clone().add(new THREE.Vector3(s * 0.022, 0.026, -0.012)),
      0.008,
      { color: DEEP, bone: "head", sides: 6 },
    );

    // nostrils
    const nose = headSurf.nearest(P(0.018, 0.48, 0.39));
    b.stick(new THREE.SphereGeometry(0.0065, 8, 6), "#0f3a31", nose, { embed: 0.6, bone: "head" });

    // baby fangs
    b.spike(P(0.03, 0.428, 0.37), [0, -1, 0.1], 0.02, 0.0055, { color: CLAW, bone: "head", sides: 5 });

    // horns
    const root = P(0.04, 0.5, 0.215);
    b.sweep(catmull([root, P(0.058, 0.555, 0.17), P(0.07, 0.578, 0.115), P(0.088, 0.568, 0.07)]), [0.017, 0.003], {
      color: hornPaint,
      bone: "head",
      caps: { start: "flat", end: "point" },
      sides: 8,
      name: `horn${s > 0 ? "L" : "R"}`,
    });

    // ear frills: three fanned spines
    const tips = [P(0.135, 0.505, 0.17), P(0.14, 0.462, 0.158), P(0.122, 0.425, 0.175)];
    tips.forEach((tip, k) => {
      const y = 0.475 - k * 0.022;
      b.slab([P(0.06, y + 0.011, 0.228), tip, P(0.062, y - 0.011, 0.215)], {
        color: k === 1 ? "#ff9d4a" : "#ff7a3a",
        thickness: 0.005,
        bone: "head",
      });
    });
  }

  // ---------------- legs ----------------
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const P = (x: number, y: number, z: number) => [s * x, y, z];
    for (const front of [true, false]) {
      const pts = front
        ? [P(0.075, 0.23, 0.08), P(0.085, 0.13, 0.05), P(0.09, 0.05, 0.085), P(0.09, 0.022, 0.115)]
        : [P(0.085, 0.21, -0.13), P(0.1, 0.14, -0.06), P(0.1, 0.06, -0.15), P(0.1, 0.022, -0.1)];
      const names = front
        ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`]
        : [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`];
      const chain = b.chain(front ? `arm${side}` : `leg${side}`, pts, {
        parent: front ? "spine2" : "hips",
        names,
        role: "leg",
      });
      b.sweep(chain, front ? [0.042, 0.032, 0.026, 0.022] : [0.06, 0.045, 0.03, 0.024], {
        color: bodyPaint,
        extend: [0.03, 0],
        sides: 10,
      });
      const pawC = front ? P(0.09, 0.02, 0.105) : P(0.1, 0.02, -0.105);
      const bone = chain.joints[2];
      b.part(new THREE.SphereGeometry(0.032, 10, 7), PAW, { at: pawC, bone, scale: [1, 0.62, 1.25] });
      for (let k = -1; k <= 1; k++) {
        b.spike([pawC[0] + k * 0.018, 0.021, pawC[2] + 0.03], [0, -0.35, 1], 0.02, 0.006, {
          color: CLAW,
          bone,
          sides: 5,
        });
      }
    }

    // ---------------- wings ----------------
    const arm = b.chain(`wing${side}`, [P(0.06, 0.33, 0.04), P(0.19, 0.4, 0.0), P(0.31, 0.44, -0.03)], {
      parent: "spine2",
      names: [`wingArm${side}`, `wingFore${side}`, `wingWrist${side}`],
      role: "wing",
    });
    b.sweep(arm, [0.016, 0.011, 0.008], { color: WINGBONE, sides: 8 });
    const wrist = P(0.31, 0.44, -0.03);
    const fingerDefs = [
      [P(0.44, 0.475, -0.07), P(0.57, 0.48, -0.13)],
      [P(0.42, 0.42, -0.16), P(0.5, 0.37, -0.28)],
      [P(0.33, 0.39, -0.18), P(0.34, 0.33, -0.32)],
    ];
    const fingers = fingerDefs.map((d, i) => {
      const c = b.chain(`finger${side}${i + 1}`, catmull([wrist, d[0], d[1]]), {
        parent: arm.tip!,
        count: 2,
        names: [`finger${side}${i + 1}a`, `finger${side}${i + 1}b`],
        role: "digit",
      });
      b.sweep(c, [0.007, 0.0025], { color: WINGBONE, caps: { start: "round", end: "point" }, sides: 6 });
      return c;
    });
    b.membrane(fingers[0], fingers[1], { color: wingPaint, thickness: 0.004, scallop: 0.18 });
    b.membrane(fingers[1], fingers[2], { color: wingPaint, thickness: 0.004, scallop: 0.18 });
    b.membrane(arm, catmull([P(0.07, 0.305, -0.1), P(0.2, 0.34, -0.2), fingerDefs[2][1]]), {
      color: wingPaint,
      thickness: 0.004,
    });
    // thumb claw
    b.spike(arm.tip!, [s * 0.2, 0.6, 0.8], 0.028, 0.006, { color: CLAW, bone: arm.tip!, sides: 5 });
  }

  return b.root;
}
