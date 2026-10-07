```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  mix,
  smoothstep,
  cells,
  noise,
  interpolate,
  bezier,
  catmull,
  frame,
  flatten,
  DEG,
} from "agentic-3js-builder";
import type { JointRef } from "agentic-3js-builder";

export const meta = {
  name: "Unicorn Foal",
  description:
    "A long-legged pastel unicorn foal in a rigging rest pose: pearl coat with lilac appaloosa sparkle-spots, rainbow brush mane and fluffy tail, faceted spiral horn, big painted eyes, split jaw.",
};

export default function build() {
  const b = createBuilder({ name: "unicornFoal", paintSize: 2048 });
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---------------------------------------------------------------- palette
  const COAT = "#fdf8f3";
  const SHADE = "#e4d8f4";
  const SHEEN = "#fff4e2";
  const SOCK = "#ffd2e2";
  const MUZZLE = "#f6c1d0";
  const BLUSH = "#ffb3cb";
  const TIP = "#d9c6ff";
  const HOOF = "#c3a2ee";
  const GOLD = "#f4c95e";
  const LASH = "#2b1a40";
  const FEATHER = "#fff0f6";
  const SPOTS = ["#d6c2ff", "#ffc6df", "#bfe6ff"];
  const RAINBOW = ["#ffa9c4", "#ffc79a", "#fff09c", "#b2eec6", "#a3d6ff", "#c7afff"];

  const rainbowAt = (u: number) => {
    const x = Math.min(Math.max(u, 0), 1) * (RAINBOW.length - 1);
    const i = Math.min(Math.floor(x), RAINBOW.length - 2);
    return mix(RAINBOW[i], RAINBOW[i + 1], x - i);
  };

  const blushL = V(0.068, 1.155, 0.6);
  const blushR = V(-0.068, 1.155, 0.6);

  // One coat paint for body, legs, neck, head: countershade, sheen, socks, muzzle, blush, rump sparkle spots.
  const coat = paint((p, n) => {
    let c = mix(SHADE, COAT, smoothstep(-0.7, 0.15, n.y));
    c = mix(c, SHEEN, smoothstep(0.5, 0.95, n.y) * 0.6);
    c = mix(c, SOCK, smoothstep(0.3, 0.15, p.y) * 0.85);
    if (p.y > 0.95) {
      c = mix(c, MUZZLE, smoothstep(0.615, 0.67, p.z));
      const d = Math.min(p.distanceTo(blushL), p.distanceTo(blushR));
      c = mix(c, BLUSH, smoothstep(0.03, 0.01, d) * 0.75);
      c = mix(c, TIP, smoothstep(1.34, 1.4, p.y));
    }
    const w = smoothstep(-0.1, -0.26, p.z) * smoothstep(0.58, 0.72, p.y);
    if (w > 0) {
      const cell = cells(p, 0.065, 4);
      if (cell.id < 0.65) {
        const r = 0.2 + 0.18 * cell.id;
        const k = smoothstep(r + 0.05, r - 0.05, cell.d1) * w;
        if (k > 0) c = mix(c, SPOTS[Math.floor((cell.id / 0.65) * 3) % 3], k);
      }
    }
    return c;
  });

  const tuftPaint = (u: number) => {
    const base = rainbowAt(u);
    return paint((p, n, s) => mix(mix(base, "#9a76d6", 0.18 * (1 - s[0])), "#ffffff", 0.5 * s[0] * s[0]));
  };

  // A curved, faceted tuft of hair: stands out along `up`, curls toward `back`.
  const tuft = (
    base: THREE.Vector3,
    up: THREE.Vector3,
    back: THREE.Vector3,
    len: number,
    r: number,
    u: number,
    bone: JointRef,
  ) => {
    const p1 = base.clone().addScaledVector(up, len * 0.6);
    const p2 = p1.clone().addScaledVector(back, len * 0.65).addScaledVector(up, len * 0.15);
    b.sweep(bezier(base, p1, p2), (t: number) => r * Math.pow(1 - t, 0.8) + 0.0005, {
      color: tuftPaint(u),
      sides: 5,
      smooth: false,
      bone,
      caps: { start: "round", end: "point" },
    });
  };

  // ---------------------------------------------------------------- skeleton: torso
  b.joint("hips", { at: [0, 0.8, -0.28], dir: [0, 0, 1] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.8, -0.28],
      [0, 0.8, -0.04],
      [0, 0.83, 0.18],
      [0, 0.87, 0.3],
    ],
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );

  b.loft(
    [
      { at: [0, 0.8, -0.47], w: 0.14, h: 0.14 },
      { at: [0, 0.81, -0.38], w: 0.27, h: 0.29 },
      { at: [0, 0.79, -0.15], w: 0.27, h: 0.3 },
      { at: [0, 0.8, 0.1], w: 0.27, h: 0.31 },
      { at: [0, 0.84, 0.28], w: 0.23, h: 0.29 },
      { at: [0, 0.87, 0.38], w: 0.13, h: 0.16 },
    ],
    { color: coat, bone: [spine], sides: 12, name: "body" },
  );

  // ---------------------------------------------------------------- legs
  const buildLeg = (side: "L" | "R", front: boolean) => {
    const sx = side === "L" ? 1 : -1;
    const x = 0.1 * sx;
    const pts: number[][] = front
      ? [
          [x, 0.8, 0.24],
          [x * 1.05, 0.57, 0.2],
          [x, 0.33, 0.22],
          [x, 0.12, 0.22],
          [x, 0.05, 0.25],
        ]
      : [
          [x, 0.82, -0.3],
          [x * 1.1, 0.58, -0.19],
          [x, 0.37, -0.38],
          [x, 0.12, -0.35],
          [x, 0.05, -0.31],
        ];
    const zEnd = pts[4][2];
    const names = front
      ? [`shoulder${side}`, `elbow${side}`, `knee${side}`, `fetlockF${side}`, `hoofF${side}`]
      : [`hip${side}`, `stifle${side}`, `hock${side}`, `fetlockH${side}`, `hoofH${side}`];
    const leg = b.chain(`leg${front ? "F" : "H"}${side}`, pts, {
      parent: front ? "chest" : "hips",
      names,
      role: "leg",
      contact: [x, 0, zEnd],
    });
    const ts = leg.ts;
    const keysT = [0, ts[1] * 0.5, ts[1], (ts[1] + ts[2]) / 2, ts[2], (ts[2] + ts[3]) / 2, ts[3], 1];
    const keysR = front
      ? [0.068, 0.058, 0.046, 0.04, 0.037, 0.026, 0.033, 0.028]
      : [0.085, 0.072, 0.056, 0.045, 0.038, 0.027, 0.033, 0.028];
    b.sweep(leg, (t: number) => interpolate(keysT, keysR, t), { color: coat, sides: 8 });

    // muscle masses: shoulder blade / haunch
    if (front)
      b.part(new THREE.SphereGeometry(0.085, 10, 8), coat, {
        at: [sx * 0.09, 0.74, 0.22],
        scale: [0.7, 1.25, 0.9],
        bone: leg.joints[0],
      });
    else
      b.part(new THREE.SphereGeometry(0.1, 10, 8), coat, {
        at: [sx * 0.095, 0.73, -0.31],
        scale: [0.75, 1.15, 1.05],
        bone: leg.joints[0],
      });

    // hoof, coronet and fetlock feathering
    const hoofJ = leg.joints[4];
    const fetJ = leg.joints[3];
    b.lathe(
      [
        [0, 0],
        [0.043, 0],
        [0.041, 0.03],
        [0.035, 0.068],
        [0, 0.068],
      ],
      { color: HOOF, at: [x, 0, zEnd], segments: 10, bone: hoofJ },
    );
    b.part(new THREE.TorusGeometry(0.034, 0.008, 5, 12), GOLD, {
      at: [x, 0.07, zEnd],
      rotation: [90, 0, 0],
      bone: hoofJ,
    });
    b.ring(frame([x, 0.1, zEnd - 0.01], [0, -1, 0]), { count: 7, radius: 0.026, tilt: 50 }, (item) => {
      b.spike(item, item, 0.038, 0.011, { color: FEATHER, bone: fetJ, sides: 4, smooth: false });
    });
  };
  buildLeg("L", true);
  buildLeg("R", true);
  buildLeg("L", false);
  buildLeg("R", false);

  // ---------------------------------------------------------------- neck & head
  const neck = b.chain(
    "neck",
    [
      [0, 0.86, 0.28],
      [0, 1.03, 0.38],
      [0, 1.18, 0.44],
    ],
    { parent: "chest", names: ["neck1", "neck2"], role: "neck", up: [0, 0, 1] },
  );
  const neckSweep = b.sweep(neck, (t: number): [number, number] => [0.072 - 0.02 * t, 0.095 - 0.03 * t], {
    color: coat,
    sides: 10,
  });

  b.joint("head", { at: [0, 1.2, 0.45], aim: [0, 1.11, 0.7], parent: "neck2", role: "head" });
  const headLoft = b.loft(
    [
      { at: [0, 1.235, 0.43], w: 0.12, h: 0.12 },
      { at: [0, 1.225, 0.48], w: 0.175, h: 0.175 },
      { at: [0, 1.19, 0.56], w: 0.16, h: 0.15 },
      { at: [0, 1.145, 0.63], w: 0.12, h: 0.115 },
      { at: [0, 1.115, 0.68], w: 0.115, h: 0.105 },
      { at: [0, 1.1, 0.705], w: 0.08, h: 0.07 },
    ],
    { color: coat, bone: "head", sides: 10, name: "head" },
  );
  const headSurf = b.surface(headLoft);

  // lower jaw (separate, hinged)
  b.joint("jaw", { at: [0, 1.135, 0.5], aim: [0, 1.055, 0.665], parent: "head", role: "jaw" });
  b.sweep(
    [
      [0, 1.135, 0.5],
      [0, 1.055, 0.665],
    ],
    (t: number): [number, number] => [0.045 - 0.017 * t, 0.034 - 0.012 * t],
    { color: coat, bone: "jaw", sides: 8, name: "lowerJaw" },
  );

  // nostrils
  for (const sx of [1, -1]) {
    const origin = V(sx * 0.15, 1.13, 0.95);
    const target = V(sx * 0.028, 1.12, 0.715);
    const hit = headSurf.ray(origin, target.clone().sub(origin)) ?? headSurf.nearest(target);
    b.stick(new THREE.SphereGeometry(0.012, 8, 6), "#c9799a", hit, {
      scale: [1, 0.4, 1.5],
      embed: 0.5,
      bone: "head",
      flow: [0, 1, -0.3],
    });
  }

  // eyes: one painted sphere each (rim, iris gradient, pupil, two highlights) + lashes
  const eyeR = 0.033;
  for (const sx of [1, -1]) {
    const dir = V(sx * 0.82, 0.1, 0.56).normalize();
    const target = V(sx * 0.05, 1.215, 0.525);
    const hit =
      headSurf.ray(target.clone().addScaledVector(dir, 0.6), dir.clone().negate()) ??
      headSurf.nearest(target.clone().addScaledVector(dir, 0.1));
    const n = hit.n;
    const c = hit.at.addScaledVector(n, -0.3 * eyeR);
    const L = n.clone().add(V(0, -0.05, 0.3)).normalize();
    const H1 = L.clone().add(V(0, 0.75, 0.35)).normalize();
    const H2 = L.clone().add(V(0, -0.5, -0.25)).normalize();
    const eyePaint = paint((p) => {
      const q = p.clone().sub(c).normalize();
      if (q.dot(H1) > 0.97) return "#ffffff";
      if (q.dot(H2) > 0.99) return "#fff6ff";
      const d = q.dot(L);
      if (d > 0.84) return "#1a0f2e";
      if (d > 0.5) {
        const iris = mix("#5f3bb8", "#9fe4f5", smoothstep(-0.5, 0.6, -q.y));
        return mix(iris, "#2a1846", smoothstep(0.6, 0.5, d) + smoothstep(0.8, 0.84, d) * 0.6);
      }
      return "#24163a";
    });
    b.part(new THREE.SphereGeometry(eyeR, 16, 12), eyePaint, {
      at: c,
      bone: "head",
      name: sx > 0 ? "eyeL" : "eyeR",
    });

    const upE = flatten(V(0, 1, 0), L).normalize();
    const fwE = flatten(V(0, 0, 1), L).normalize();
    for (const th of [-20, -50, -80]) {
      const phi = 62 * DEG;
      const a = th * DEG;
      const rim = L.clone()
        .multiplyScalar(Math.cos(phi))
        .add(upE.clone().multiplyScalar(Math.cos(a)).addScaledVector(fwE, Math.sin(a)).multiplyScalar(Math.sin(phi)));
      const base = c.clone().addScaledVector(rim, eyeR * 0.98);
      const lashDir = rim.clone().addScaledVector(upE, 0.5).addScaledVector(fwE, -0.25).normalize();
      b.spike(base, lashDir, 0.026, 0.005, { color: LASH, bone: "head", sides: 4, smooth: false });
    }
  }

  // ears with pink inner ear
  for (const sx of [1, -1]) {
    const side = sx > 0 ? "L" : "R";
    const base = V(sx * 0.048, 1.285, 0.445);
    const dir = V(sx * 0.38, 1, -0.12).normalize();
    const mid = base.clone().addScaledVector(dir, 0.06).add(V(0, 0, 0.012));
    const tip = base.clone().addScaledVector(dir, 0.12);
    const ear = b.joint(`ear${side}`, { at: base, aim: tip, parent: "head" });
    const path = catmull([base, mid, tip]);
    b.sweep(
      path,
      (t: number): [number, number] => [0.034 * Math.sin(Math.PI * (0.22 + 0.78 * t)), 0.013 * (1 - 0.5 * t) + 0.002],
      { color: coat, bone: ear, up: [0, 0, 1], sides: 8 },
    );
    b.sweep(path, (t: number): [number, number] => [0.02 * Math.sin(Math.PI * (0.22 + 0.78 * t)), 0.006], {
      color: "#f7a9c9",
      bone: ear,
      up: [0, 0, 1],
      sides: 8,
      shift: [0, 0.009],
      from: 0.12,
      to: 0.88,
    });
  }

  // horn: stacked faceted rings with a double-helix gold/pearl stripe, a gold collar and a forehead gem
  const hornHit = headSurf.ray([0, 1.8, 0.535], [0, -1, 0]) ?? headSurf.nearest([0, 1.3, 0.535]);
  const hornBase = hornHit.at;
  const hornDir = V(0, 1, 0.5).normalize();
  const horn = b.joint("horn", { at: hornBase, dir: hornDir, parent: "head" });
  const HH = 0.16;
  const R0 = 0.024;
  const N = 5;
  const prof: Array<[number, number]> = [
    [0, 0],
    [R0, 0],
  ];
  for (let i = 0; i < N; i++) {
    const y0 = (HH * 0.9 * i) / N;
    const y1 = (HH * 0.9 * (i + 1)) / N;
    const r = R0 * (1 - (0.8 * i) / N);
    if (i > 0) prof.push([r, y0 + 0.003]);
    prof.push([r * 0.8, y1]);
  }
  prof.push([0, HH]);
  const hornPaint = paint((p, n, s) => {
    const f = (((s[0] / 0.045 + s[1] / 180) % 1) + 1) % 1;
    const band = smoothstep(0.42, 0.5, f) * smoothstep(0.92, 0.84, f);
    const base = mix(GOLD, "#fff1c4", smoothstep(0, HH, s[0]));
    return mix(base, "#fffaf2", band);
  });
  b.lathe(prof, {
    color: hornPaint,
    at: hornBase.clone().addScaledVector(hornDir, -0.012),
    axis: hornDir,
    segments: 8,
    bone: horn,
    name: "horn",
  });
  b.part(new THREE.TorusGeometry(0.026, 0.008, 6, 14), GOLD, {
    at: hornBase.clone().addScaledVector(hornDir, 0.004),
    dir: hornDir,
    axis: "z",
    bone: horn,
  });
  const gemHit = headSurf.ray([0, 1.25, 1.0], [0, 0, -1]);
  if (gemHit)
    b.stick(new THREE.OctahedronGeometry(0.013), "#ff8cc6", gemHit, { embed: 0.35, bone: "head", flat: true });

  // ---------------------------------------------------------------- mane: rainbow brush along the crest
  const back = V(0, -0.3, -1).normalize();
  for (let i = 0; i < 9; i++) {
    const t = 0.35 + 0.65 * (i / 8);
    const u = (1 - t) / 0.65;
    const bone = neck.jointAt(Math.min(t, 0.999));
    for (const [ang, sc] of [
      [0, 1],
      [-38, 0.72],
      [38, 0.72],
    ] as const) {
      const sp = neckSweep.at(Math.min(t, 0.98), ang);
      const base = sp.at.addScaledVector(sp.n, -0.008);
      tuft(base, sp.n, back, 0.085 * sc, 0.022 * sc, u, bone);
    }
  }
  // forelock framing the horn
  const pollHit = headSurf.ray([0, 1.8, 0.47], [0, -1, 0]) ?? headSurf.nearest([0, 1.31, 0.47]);
  for (const sx of [1, -1]) {
    tuft(
      pollHit.at.add(V(sx * 0.012, -0.006, 0)),
      V(sx * 0.3, 1, 0.3).normalize(),
      V(sx * 0.5, -0.4, 1).normalize(),
      0.09,
      0.02,
      sx > 0 ? 0.05 : 0.2,
      "head",
    );
  }
  tuft(pollHit.at.add(V(0, -0.008, -0.01)), V(0, 1, -0.2).normalize(), back, 0.08, 0.02, 0.12, "head");

  // ---------------------------------------------------------------- tail: fluffy rainbow plume
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.88, -0.42],
      [0, 0.87, -0.53],
      [0, 0.78, -0.63],
      [0, 0.64, -0.68],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const tailPaint = paint((p, n, s) => {
    const u = s[0] * 1.05 + 0.05 * Math.sin(s[1] * DEG * 3) - 0.08;
    const c = mix(COAT, rainbowAt(u), smoothstep(0.05, 0.2, s[0]));
    return mix(c, "#ffffff", 0.3 * smoothstep(0.55, 0.75, noise(p, 0.02, 9)));
  });
  const tailSweep = b.sweep(tail, (t: number) => 0.022 + 0.045 * Math.sin(Math.PI * Math.pow(t, 0.75)), {
    color: tailPaint,
    sides: 10,
    name: "tail",
  });
  for (let k = 0; k < 7; k++) {
    const t = 0.5 + 0.45 * (k / 6);
    const ang = ((k * 103) % 360) - 180;
    const sp = tailSweep.at(t, ang);
    const base = sp.at.addScaledVector(sp.n, -0.01);
    const curl = sp.tangent.add(V(0, -0.2, -0.2)).normalize();
    tuft(base, sp.n, curl, 0.07, 0.022, t, tail.jointAt(Math.min(t, 0.999)));
  }
  const tipPt = tail.at(1);
  const tipDir = tipPt.tangent;
  tuft(
    tipPt.at.addScaledVector(tipDir, -0.01),
    tipDir,
    tipDir.clone().add(V(0, 0, -0.4)).normalize(),
    0.1,
    0.03,
    1,
    tail.jointAt(0.999),
  );

  return b.root;
}
```