```ts
import * as THREE from "three";
import {
  createBuilder,
  rng,
  paint,
  mottle,
  countershade,
  mix,
  smoothstep,
  noise,
  svg,
  catmull,
} from "agentic-3js-builder";

export const meta = {
  name: "Red Panda",
  description:
    "A stylized red panda in a neutral rest pose: rust coat with a sooty belly and legs, a white-masked face with tear stripes, white-rimmed ears, puffed cheeks with fur tufts, and a fluffy ringed tail.",
};

export default function build() {
  const b = createBuilder({ name: "redPanda", paintSize: 1024 });

  // ---------- palette ----------
  const DARK = "#2a1811";
  const WHITE = "#f3ede2";
  const TEAR = "#7e2f13";
  const NOSE = "#17100d";
  const CLAW = "#e2d9c6";

  const coatTop = mottle("#cf5c22", "#ab421a", { size: 0.05, seed: 3 });
  const coatBelly = mottle(DARK, "#3b2217", { size: 0.04, seed: 4 });
  const coat = countershade(coatTop, coatBelly, { level: -0.4, soft: 0.2 });
  const legPaint = mottle(DARK, "#3b2217", { size: 0.035, seed: 8 });

  const tailBase = mottle("#c4521f", "#a4401a", { size: 0.05, seed: 21 });
  const tailLight = mottle("#e6a86c", "#d18e55", { size: 0.05, seed: 22 });
  const tailPaint = paint((p, n) => {
    const s = (-p.z - 0.25) / 0.068 + 0.35 * (noise(p, 0.06, 5) - 0.5);
    const base0 = tailBase.at(p, n);
    let col = base0;
    if (s >= 0) {
      const f = s - Math.floor(s);
      const lit = smoothstep(0.4, 0.48, f) * (1 - smoothstep(0.88, 0.96, f));
      col = mix(base0, tailLight.at(p, n), lit);
    }
    const tip = smoothstep(-0.6, -0.68, p.z);
    return mix(col, "#5e2410", tip * 0.85);
  });

  const HC = new THREE.Vector3(0, 0.355, 0.28);
  const headCoat = mottle("#d46e2e", "#bf5322", { size: 0.035, seed: 11 });
  const facePaint = paint((p) => {
    const qx = p.x - HC.x;
    const qy = p.y - HC.y;
    const qz = p.z - HC.z;
    const ax = Math.abs(qx);
    const brow = Math.hypot((ax - 0.03) / 0.017, (qy - 0.046) / 0.012);
    const eye = Math.hypot((ax - 0.038) / 0.022, (qy - 0.013) / 0.02);
    const stripeX = 0.043 - 0.25 * Math.max(0, -qy);
    const tear = Math.abs(ax - stripeX);
    if (qz > 0.01 && brow < 1) return WHITE;
    if (qz > 0.0 && eye < 1) return TEAR;
    if (qz > -0.005 && qy < 0.004 && qy > -0.075 && tear < 0.011) return TEAR;
    if (qy < -0.004 && qz > -0.03) return WHITE;
    return headCoat;
  });

  // fur tuft drawing (greys: tinted by colour / paint)
  const tuft = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><path d="M8 96 C 6 60, 18 32, 30 2 C 34 28, 42 38, 50 20 C 52 48, 60 70, 56 96 Z" fill="#ffffff"/><path d="M30 92 C 30 62, 31 40, 31 14" stroke="#c4c4c4" stroke-width="3" fill="none"/><path d="M44 92 C 46 70, 48 52, 48 34" stroke="#d2d2d2" stroke-width="2.5" fill="none"/></svg>`,
    { size: 128 },
  );

  // ---------- skeleton ----------
  b.joint("hips", { at: [0, 0.27, -0.16] });
  const spine = b.chain(
    "spine",
    [
      [0, 0.272, -0.14],
      [0, 0.282, -0.01],
      [0, 0.292, 0.12],
    ],
    { parent: "hips", names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    [
      [0, 0.3, 0.13],
      [0, 0.322, 0.195],
      [0, 0.345, 0.245],
    ],
    { parent: "chest", names: ["neck1", "neck2"], role: "neck" },
  );
  b.joint("head", { parent: "neck2", at: [0, 0.348, 0.25], dir: [0, 0.15, 1], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.318, 0.33], dir: [0, -0.15, 1], role: "jaw" });

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.275, -0.22],
      [0, 0.28, -0.33],
      [0, 0.27, -0.44],
      [0, 0.255, -0.55],
      [0, 0.24, -0.65],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tail4", "tail5"], role: "tail" },
  );

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.272, -0.27], w: 0.1, h: 0.1 },
      { at: [0, 0.278, -0.17], w: 0.175, h: 0.165 },
      { at: [0, 0.284, -0.02], w: 0.165, h: 0.155 },
      { at: [0, 0.29, 0.1], w: 0.15, h: 0.15 },
      { at: [0, 0.3, 0.18], w: 0.1, h: 0.1 },
    ],
    { color: coat, bone: ["hips", spine], sides: 10 },
  );
  b.sweep(neck, (t: number) => 0.068 - 0.01 * t, { color: coat, sides: 10 });

  const tailSweep = b.sweep(tail, (t: number) => 0.03 + 0.034 * Math.sin(Math.PI * (0.12 + 0.8 * t)), {
    color: tailPaint,
    sides: 10,
  });

  // fur tufts on back and tail
  const backHits = b.surface(body).scatter(45, {
    rng: rng(3),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.3 && h.at.z > -0.25 && h.at.z < 0.15,
  });
  b.cards(backHits, tuft, {
    size: [0.04, 0.05],
    lean: 70,
    flow: [0, -0.1, -1],
    bend: 20,
    vary: 0.25,
    spin: 15,
    rng: rng(9),
    color: coat,
    sink: 0.2,
  });
  const tailHits = b.surface(tailSweep).scatter(70, { rng: rng(5), minDist: 0.022 });
  b.cards(tailHits, tuft, {
    size: [0.045, 0.06],
    lean: 65,
    flow: [0, 0, -1],
    bend: 20,
    vary: 0.25,
    spin: 20,
    rng: rng(13),
    color: tailPaint,
    sink: 0.2,
  });

  // ---------- legs ----------
  const toeOffsets = [-0.018, -0.006, 0.006, 0.018];
  const leg = (side: number, front: boolean) => {
    const s = side > 0 ? "L" : "R";
    const x = (v: number) => v * side;
    const pts = front
      ? [
          [x(0.072), 0.25, 0.11],
          [x(0.08), 0.15, 0.09],
          [x(0.08), 0.045, 0.115],
          [x(0.08), 0.012, 0.165],
        ]
      : [
          [x(0.075), 0.24, -0.15],
          [x(0.088), 0.15, -0.095],
          [x(0.09), 0.05, -0.17],
          [x(0.09), 0.012, -0.1],
        ];
    const names = front
      ? [`shoulder${s}`, `elbow${s}`, `wrist${s}`, `paw${s}`]
      : [`hip${s}`, `knee${s}`, `ankle${s}`, `foot${s}`];
    const chain = b.chain(front ? `legF${s}` : `legH${s}`, pts, {
      parent: front ? "chest" : "hips",
      names,
      role: "leg",
    });
    const wristT = chain.ts[2];
    const r0 = front ? 0.036 : 0.05;
    const r1 = front ? 0.022 : 0.024;
    b.sweep(chain, (t: number) => r0 + (r1 - r0) * Math.min(t / wristT, 1), {
      color: legPaint,
      to: wristT,
      sides: 8,
    });

    const cx = x(front ? 0.08 : 0.09);
    const cz = front ? 0.135 : -0.135;
    const sz = front ? 0.045 : 0.058;
    const sx = front ? 0.03 : 0.032;
    b.part(new THREE.SphereGeometry(1, 10, 6), legPaint, {
      at: [cx, 0.018, cz],
      scale: [sx, 0.018, sz],
      bone: names[3],
    });
    const frontZ = cz + sz;
    for (const xo of toeOffsets) {
      b.part(new THREE.SphereGeometry(0.0095, 6, 4), DARK, {
        at: [cx + xo, 0.011, frontZ - 0.009],
        bone: names[3],
        flat: true,
      });
      b.spike([cx + xo, 0.009, frontZ - 0.002], [0, -0.35, 1], 0.013, 0.003, {
        color: CLAW,
        sides: 4,
        bone: names[3],
      });
    }
  };
  for (const side of [1, -1]) {
    leg(side, true);
    leg(side, false);
  }

  // ---------- head ----------
  const head = b.part(new THREE.SphereGeometry(1, 14, 10), facePaint, {
    at: HC.toArray(),
    scale: [0.085, 0.075, 0.075],
    bone: "head",
  });
  b.part(new THREE.SphereGeometry(1, 10, 7), WHITE, {
    at: [0, 0.335, 0.352],
    scale: [0.045, 0.033, 0.048],
    bone: "head",
  });
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    at: [0, 0.348, 0.396],
    scale: [0.017, 0.011, 0.011],
    bone: "head",
    flat: true,
  });
  b.rod([0, 0.34, 0.398], [0, 0.321, 0.394], 0.0016, { color: NOSE, sides: 4, bone: "head" });
  // lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 5), WHITE, {
    at: [0, 0.304, 0.358],
    scale: [0.03, 0.013, 0.036],
    bone: "jaw",
  });
  b.part(new THREE.SphereGeometry(1, 6, 4), "#c96a6a", {
    at: [0, 0.312, 0.37],
    scale: [0.016, 0.004, 0.016],
    bone: "jaw",
  });

  const headSurf = b.surface(head);
  for (const side of [1, -1]) {
    // eyes
    const hit = headSurf.ray([side * 0.038, HC.y + 0.014, 0.6], [0, 0, -1]);
    if (hit) {
      const eye = b.stick(new THREE.SphereGeometry(0.012, 10, 8), "#120c0a", hit, { embed: 0.35, bone: "head" });
      const glint = hit.n
        .clone()
        .add(new THREE.Vector3(-side * 0.25, 0.6, 0))
        .normalize()
        .multiplyScalar(0.0112)
        .add(eye.at);
      b.part(new THREE.SphereGeometry(0.0035, 6, 4), "#ffffff", { at: glint, bone: "head" });
    }

    // puffed cheeks
    const cheek = b.part(new THREE.SphereGeometry(1, 7, 5), WHITE, {
      at: [side * 0.07, 0.328, 0.302],
      scale: [0.034, 0.03, 0.036],
      bone: "head",
      flat: true,
    });
    const cheekHits = b.surface(cheek).scatter(9, {
      rng: rng(side > 0 ? 31 : 37),
      minDist: 0.012,
      filter: (h) => h.n.x * side > 0.25 && h.n.y < 0.5,
    });
    b.cards(cheekHits, tuft, {
      size: [0.03, 0.04],
      lean: 50,
      flow: [side, -0.5, -0.15],
      bend: 15,
      vary: 0.2,
      spin: 15,
      rng: rng(side > 0 ? 41 : 43),
      color: WHITE,
      mirror: side < 0,
      bone: "head",
    });

    // whiskers
    for (let k = 0; k < 3; k++) {
      const y0 = 0.33 - k * 0.006;
      b.rod([side * 0.03, y0, 0.385], [side * 0.1, y0 + 0.012 - k * 0.012, 0.395 - k * 0.012], 0.0011, {
        color: "#f8f4ec",
        sides: 3,
        bone: "head",
      });
    }

    // ears
    const s = side > 0 ? "L" : "R";
    const earBase = new THREE.Vector3(side * 0.055, 0.396, 0.265);
    const up = new THREE.Vector3(side * 0.42, 1, 0).normalize();
    const across = new THREE.Vector3(1, -side * 0.42, 0).normalize();
    const facing = across.clone().cross(up).normalize();
    b.joint(`ear${s}`, { parent: "head", at: earBase, dir: up, role: "hinge" });
    const EAR: Array<[number, number]> = [
      [-0.034, 0],
      [0.034, 0],
      [0.015, 0.046],
      [0, 0.058],
      [-0.015, 0.046],
    ];
    const shape = (k: number, dy: number) => EAR.map(([u, v]) => [u * k, v * k + dy] as [number, number]);
    b.extrude(shape(1, 0), {
      color: WHITE,
      at: earBase,
      x: across,
      y: up,
      thickness: 0.011,
      bevel: 0.003,
      smoothing: 2,
      bone: `ear${s}`,
    });
    b.extrude(shape(0.62, 0.008), {
      color: "#5a2615",
      at: earBase.clone().addScaledVector(facing, 0.0058),
      x: across,
      y: up,
      thickness: 0.004,
      smoothing: 2,
      bone: `ear${s}`,
    });
    b.extrude(shape(0.88, 0.004), {
      color: "#a8411a",
      at: earBase.clone().addScaledVector(facing, -0.0058),
      x: across,
      y: up,
      thickness: 0.005,
      smoothing: 2,
      bone: `ear${s}`,
    });
  }

  return b.root;
}
```