import * as THREE from "three";
import { createBuilder, rng, mottle, spots, countershade, catmull } from "../../../../src/index";

export const meta = {
  name: "Red Rock Crab",
  description:
    "A feisty brick-red rock crab with one oversized raised claw, speckled knobbly shell, eyestalks, eight pointed walking legs, a barnacle cluster and a strand of seaweed on its back.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "rockCrab", paintSize: 2048 });

  const RED = "#a8321f";
  const DARK_RED = "#7e2216";
  const ORANGE = "#e07a2c";
  const CREAM = "#f1dcb4";
  const DARK = "#2e1612";

  const base = mottle(RED, DARK_RED, { size: 0.05, seed: 2 });
  const speck = spots(base, [ORANGE, CREAM], { size: 0.014, amount: 0.6, seed: 3 });
  const shellPaint = countershade(speck, "#e9c9a0", { level: -0.05, soft: 0.25 });
  const limbPaint = spots(base, [ORANGE, CREAM], { size: 0.01, amount: 0.3, seed: 8 });
  const clawPaint = spots(mottle("#b53a22", DARK_RED, { size: 0.04, seed: 5 }), [ORANGE, CREAM], {
    size: 0.012,
    amount: 0.5,
    seed: 11,
  });

  // ---------- skeleton root + body ----------
  b.joint("body", { at: [0, 0.065, 0], dir: [0, 0, 1] });

  const carapace = b.part(new THREE.SphereGeometry(0.1, 16, 9), shellPaint, {
    at: [0, 0.065, 0],
    scale: [1.2, 0.45, 0.9],
    bone: "body",
    name: "carapace",
  });
  b.part(new THREE.SphereGeometry(0.1, 16, 7), DARK_RED, {
    at: [0, 0.052, 0],
    scale: [1.27, 0.2, 0.96],
    bone: "body",
    name: "shellRim",
  });

  // knobs on the shell
  const skin = b.surface(carapace);
  const hits = skin.scatter(18, { rng: rng(5), minDist: 0.026, filter: (h) => h.n.y > 0.45 });
  hits.forEach((h, i) => {
    const big = i % 3 === 0;
    b.stick(new THREE.SphereGeometry(big ? 0.012 : 0.008, 6, 4), big ? "#c4472b" : ORANGE, h, {
      embed: 0.5,
      bone: "body",
    });
  });

  // spiky front and side rim
  for (const phi of [-62, -31, 0, 31, 62]) {
    const a = (phi * Math.PI) / 180;
    b.spike(
      [0.135 * Math.sin(a), 0.058, 0.086 * Math.cos(a)],
      [Math.sin(a), 0.3, Math.cos(a)],
      0.018,
      0.006,
      { color: "#c4472b", bone: "body" },
    );
  }
  for (const s of [-1, 1]) {
    b.spike([s * 0.135, 0.06, -0.012], [s, 0.3, -0.15], 0.032, 0.01, { color: "#c4472b", bone: "body" });
  }

  // ---------- eyes ----------
  for (const s of [-1, 1]) {
    const S = s > 0 ? "L" : "R";
    const baseP = new THREE.Vector3(s * 0.035, 0.085, 0.07);
    const tip = new THREE.Vector3(s * 0.042, 0.115, 0.088);
    const eye = b.joint(`eye${S}`, { parent: "body", at: baseP, aim: tip });
    b.capsule(baseP, tip, 0.006, { color: "#c4472b", bone: eye });
    b.part(new THREE.SphereGeometry(0.0125, 8, 6), "#f4ead0", { at: tip, bone: eye });
    b.part(new THREE.SphereGeometry(0.0075, 6, 5), "#111111", {
      at: [tip.x + s * 0.001, tip.y + 0.002, tip.z + 0.007],
      bone: eye,
    });
  }

  // ---------- mouth ----------
  b.part(new THREE.BoxGeometry(0.045, 0.008, 0.014), "#d9b98a", { at: [0, 0.053, 0.089], bone: "body", name: "upperJaw" });
  const jaw = b.joint("jaw", { parent: "body", at: [0, 0.046, 0.084], dir: [0, 0, 1], role: "jaw" });
  b.part(new THREE.BoxGeometry(0.04, 0.007, 0.014), "#b8946a", { at: [0, 0.041, 0.09], bone: jaw, name: "lowerJaw" });

  // ---------- walking legs ----------
  const hz = [0.05, 0.02, -0.012, -0.042];
  const tz = [0.09, 0.05, -0.01, -0.07];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const n = i + 1;
      const pts = [
        [s * 0.085, 0.05, hz[i]],
        [s * 0.14, 0.085, hz[i] + 0.2 * tz[i]],
        [s * 0.195, 0.075, hz[i] + 0.55 * tz[i]],
        [s * 0.235, 0.04, hz[i] + 0.85 * tz[i]],
        [s * 0.255, 0.0, hz[i] + tz[i]],
      ];
      const leg = b.chain(`leg${S}${n}`, pts, {
        parent: "body",
        names: [`hip${S}${n}`, `knee${S}${n}`, `ankle${S}${n}`, `foot${S}${n}`, `toe${S}${n}`],
        role: "leg",
      });
      b.sweep(leg, {
        radius: [0.012, 0.0105, 0.008, 0.006, 0.002],
        sides: 6,
        caps: { start: "round", end: "point" },
        bands: [
          [0.8, limbPaint],
          [1, DARK],
        ],
      });
      // knee knob
      b.part(new THREE.SphereGeometry(0.0125, 6, 5), "#c4472b", { at: pts[1], bone: leg.joints[1] });
    }
  }

  // ---------- claws ----------
  function claw(
    s: number,
    tag: string,
    pts: number[][],
    D: THREE.Vector3,
    k: number,
    palmLen: number,
    armK: number,
    knobs: boolean,
  ) {
    D.normalize();
    const arm = b.chain(`arm${tag}`, pts, {
      parent: "body",
      names: [`shoulder${tag}`, `elbow${tag}`, `carpus${tag}`, `wrist${tag}`],
      role: "arm",
    });
    b.sweep(arm, {
      radius: [0.017, 0.014, 0.013, 0.014].map((x) => x * armK),
      sides: 7,
      color: limbPaint,
    });
    b.part(new THREE.SphereGeometry(0.016 * armK, 6, 5), "#c4472b", { at: pts[1], bone: arm.joints[1] });
    const W = arm.tip!;
    const Wp = W.at;
    const E = Wp.clone().addScaledVector(D, palmLen);
    const palm = b.sweep([Wp, E], {
      radius: (t: number) => {
        const r = k * (0.02 + 0.024 * Math.sin(Math.PI * Math.min(1, t) ** 0.7));
        return [r * 1.05, r * 0.9];
      },
      sides: 9,
      color: clawPaint,
      bone: W,
      caps: "round",
    });
    const V = new THREE.Vector3().crossVectors(D, new THREE.Vector3(1, 0, 0)).normalize();
    const at = (d: number, c: number) =>
      E.clone().addScaledVector(D, d * k).addScaledVector(V, c * k);

    // pincer joint (movable finger)
    const pincer = b.joint(`pincer${tag}`, { parent: W, at: at(0, 0.011), dir: D, up: V });

    const fixedPath = catmull([at(-0.012, -0.012), at(0.03, -0.007), at(0.065, -0.002)]);
    b.sweep(fixedPath, {
      radius: [0.014 * k, 0.01 * k, 0.0015],
      sides: 7,
      caps: { start: "round", end: "point" },
      bands: [
        [0.7, clawPaint],
        [1, DARK],
      ],
      bone: W,
    });
    const dactylPath = catmull([at(-0.012, 0.012), at(0.03, 0.011), at(0.062, 0.006)]);
    b.sweep(dactylPath, {
      radius: [0.014 * k, 0.01 * k, 0.0015],
      sides: 7,
      caps: { start: "round", end: "point" },
      bands: [
        [0.7, clawPaint],
        [1, DARK],
      ],
      bone: pincer,
    });

    // teeth
    for (let j = 0; j < 4; j++) {
      const d = 0.014 + j * 0.013;
      const cf = -0.012 + 0.014 * (d / 0.065) ** 1.5;
      const rf = 0.013 * (1 - d / 0.065) + 0.002;
      b.spike(at(d, cf + rf * 0.6), V, 0.004 * k + 0.002, 0.0035 * k + 0.001, { color: CREAM, bone: W });
      const d2 = d + 0.006;
      const cd = 0.012 - 0.006 * (d2 / 0.062);
      const rd = 0.013 * (1 - d2 / 0.062) + 0.002;
      b.spike(at(d2, cd - rd * 0.6), V.clone().negate(), 0.004 * k + 0.002, 0.0035 * k + 0.001, {
        color: CREAM,
        bone: pincer,
      });
    }

    if (knobs) {
      const ps = b.surface(palm);
      ps.scatter(7, { rng: rng(21), minDist: 0.025, filter: (h) => h.n.y > -0.2 }).forEach((h) => {
        b.stick(new THREE.SphereGeometry(0.009, 6, 4), ORANGE, h, { embed: 0.5, bone: W });
      });
    }
  }

  // big raised claw (left, +X)
  claw(
    1,
    "L",
    [
      [0.1, 0.06, 0.06],
      [0.17, 0.07, 0.1],
      [0.2, 0.11, 0.145],
      [0.205, 0.155, 0.18],
    ],
    new THREE.Vector3(0.08, 0.74, 0.66),
    1,
    0.1,
    1,
    true,
  );
  // small lowered claw (right, -X)
  claw(
    -1,
    "R",
    [
      [-0.1, 0.055, 0.06],
      [-0.145, 0.062, 0.1],
      [-0.155, 0.058, 0.138],
      [-0.15, 0.05, 0.163],
    ],
    new THREE.Vector3(-0.1, 0.1, 0.95),
    0.5,
    0.05,
    0.62,
    false,
  );

  // ---------- barnacles ----------
  const profile: [number, number][] = [
    [0, 0],
    [0.013, 0],
    [0.012, 0.006],
    [0.009, 0.012],
    [0.006, 0.013],
    [0.0045, 0.01],
    [0, 0.01],
  ];
  const top = (x: number, z: number) => skin.ray([x, 0.4, z], [0, -1, 0]);
  const barn: Array<[number, number, number]> = [
    [-0.04, -0.03, 1],
    [-0.06, -0.015, 0.65],
    [-0.025, -0.045, 0.55],
  ];
  for (const [x, z, sc] of barn) {
    const h = top(x, z);
    if (!h) continue;
    b.lathe(
      profile.map(([r, y]) => [r * sc, y * sc] as [number, number]),
      { color: CREAM, at: h.local([0, -0.003, 0]), axis: h.n, segments: 7, bone: "body" },
    );
  }

  // ---------- seaweed ----------
  const strand = (x: number, z: number, offs: number[][], color: string, w: number) => {
    const h = top(x, z);
    if (!h) return;
    const pts = offs.map((o) => [h.at.x + o[0], h.at.y + o[1], h.at.z + o[2]]);
    b.sweep(catmull(pts), {
      radius: (t: number) => [w * (1 - 0.45 * t), 0.0012],
      section: "box",
      color,
      bone: "body",
      caps: "flat",
      name: "seaweed",
    });
    b.part(new THREE.SphereGeometry(0.007, 6, 5), "#7f9a3c", {
      at: pts[3],
      bone: "body",
    });
  };
  strand(
    0.045,
    -0.03,
    [
      [0, -0.004, 0],
      [0.005, 0.03, -0.01],
      [0.02, 0.055, -0.03],
      [0.045, 0.05, -0.055],
      [0.07, 0.0, -0.07],
      [0.09, -0.03, -0.08],
    ],
    "#4f6b2a",
    0.008,
  );
  strand(
    0.06,
    -0.012,
    [
      [0, -0.004, 0],
      [0.01, 0.022, 0.004],
      [0.03, 0.04, -0.005],
      [0.05, 0.03, -0.02],
      [0.065, 0.0, -0.03],
    ],
    "#6b8a35",
    0.006,
  );

  return b.root;
}
