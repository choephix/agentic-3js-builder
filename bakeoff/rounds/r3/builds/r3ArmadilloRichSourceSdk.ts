import * as THREE from "three";
import { createBuilder, rng, svg, catmull, paint, mottle, scales, countershade } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A trotting-pose nine-banded armadillo: banded pinkish-tan shell, pointed snout, tall leathery ears, clawed feet, a long ringed tail and pale hairs between the bands. Rigged with spine, neck, head, jaw, four legs and tail.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "armadillo" });

  const TAN = "#b98f7c";
  const TAN2 = "#a77f6e";
  const EDGE = "#7d5b50";
  const BELLY = "#dcbfae";
  const SKIN = mottle("#a98473", "#94725f", { size: 0.03, seed: 3 });
  const CLAW = "#3a2e29";

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0.2, -0.05] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, 0.12],
      [0, 0.205, 0.0],
      [0, 0.2, -0.13],
      [0, 0.175, -0.25],
    ]),
    { names: ["spine1", "spine2", "spine3"], role: "spine" },
  );

  b.joint("neck", { parent: spine.joints[0], at: [0, 0.2, 0.12], aim: [0, 0.185, 0.17], role: "neck" });
  b.joint("head", { parent: "neck", at: [0, 0.185, 0.17], aim: [0, 0.145, 0.33], role: "head" });
  b.joint("jaw", { parent: "head", at: [0, 0.15, 0.2], dir: [0, -0.07, 1], role: "jaw" });

  // ---------- body ----------
  const base = (t: number) => 0.045 + 0.05 * Math.sin(Math.PI * Math.min(1, 0.15 + 0.8 * t));
  const body = (k: number) => (t: number) => [base(t) * k, base(t) * k * 0.85] as [number, number];

  // soft skin core
  b.sweep(spine, { radius: body(0.93), color: "#a8806f", sides: 10 });

  const shellSweeps: any[] = [];
  const shellPaint = countershade(
    scales([TAN, "#c29b88", TAN2], EDGE, { size: 0.022, width: 0.18, seed: 2 }),
    BELLY,
    { level: -0.2, soft: 0.3 },
  );
  const bandPaint = countershade(mottle(TAN, TAN2, { size: 0.05, seed: 5 }), BELLY, { level: -0.1, soft: 0.3 });

  shellSweeps.push(
    b.sweep(spine, {
      radius: body(1.02),
      color: shellPaint,
      from: 0,
      to: 0.285,
      sides: 10,
      caps: { start: "round", end: "flat" },
    }),
  );
  const BW = 0.049;
  for (let k = 0; k < 9; k++) {
    const a = 0.28 + k * BW;
    const e = a + BW + 0.006;
    shellSweeps.push(
      b.sweep(spine, {
        radius: (t: number) => {
          const s = Math.min(1, Math.max(0, (t - a) / (e - a)));
          const r = base(t) * (0.99 + 0.075 * s);
          return [r, r * 0.85] as [number, number];
        },
        color: bandPaint,
        from: a,
        to: e,
        sides: 10,
        caps: { start: "flat", end: "flat" },
      }),
    );
  }
  shellSweeps.push(
    b.sweep(spine, {
      radius: body(1.0),
      color: shellPaint,
      from: 0.72,
      to: 1,
      sides: 10,
      caps: { start: "flat", end: "round" },
    }),
  );

  // ---------- head ----------
  b.sweep([[0, 0.185, 0.17], [0, 0.145, 0.33]], {
    radius: (t: number) => [0.04 * (1 - t) + 0.008, 0.032 * (1 - t) + 0.007] as [number, number],
    color: SKIN,
    bone: "head",
    sides: 8,
    caps: { start: "round", end: "round" },
  });
  b.sweep([[0, 0.152, 0.2], [0, 0.14, 0.31]], {
    radius: (t: number) => [0.024 * (1 - t) + 0.005, 0.012 * (1 - t) + 0.004] as [number, number],
    color: "#cfa898",
    bone: "jaw",
    sides: 8,
  });
  const ball = new THREE.SphereGeometry(1, 8, 6);
  b.part(ball, "#6b4a47", { at: [0, 0.147, 0.335], bone: "head", scale: [0.009, 0.007, 0.009] });
  for (const sd of [1, -1]) {
    b.part(ball, "#14100f", { at: [sd * 0.029, 0.178, 0.235], bone: "head", scale: 0.008 });
    b.part(ball, "#ffffff", { at: [sd * 0.034, 0.181, 0.241], bone: "head", scale: 0.0024 });
    b.part(ball, "#2a1d1c", { at: [sd * 0.005, 0.15, 0.331], bone: "head", scale: 0.0028 });
    // ears
    const outline: [number, number][] = [
      [0, 0], [0.022, 0.004], [0.03, 0.03], [0.022, 0.065], [0.01, 0.078], [-0.002, 0.05], [-0.004, 0.015],
    ];
    const earAt: [number, number, number] = [sd * 0.034, 0.198, 0.195];
    b.extrude(outline, {
      color: "#b08475", at: earAt, x: [sd, 0, 0.1], y: [0, 1, -0.2], thickness: 0.005, bevel: 0.001,
      smoothing: 1, bone: "head",
    });
    b.extrude(outline.map((p) => [0.004 + p[0] * 0.6, 0.006 + p[1] * 0.78] as [number, number]), {
      color: "#c98f86", at: earAt, x: [sd, 0, 0.1], y: [0, 1, -0.2], thickness: 0.007, smoothing: 1, bone: "head",
    });
  }

  // ---------- legs ----------
  const leg = (
    sd: number,
    pts: [number, number, number][],
    nm: [string, string, string],
    parent: any,
    r0: number,
    r1: number,
  ) => {
    const sfx = sd > 0 ? "L" : "R";
    const chain = b.chain(`leg${nm[0]}${sfx}`, pts.map((p) => [p[0] * sd, p[1], p[2]] as [number, number, number]), {
      names: nm.map((n) => n + sfx),
      parent,
      role: "leg",
    });
    b.sweep(chain, { radius: (t: number) => r0 + (r1 - r0) * t, color: SKIN, sides: 8 });
    const tipName = nm[2] + sfx;
    const [fx, , fz] = pts[2];
    const x = fx * sd;
    b.part(ball, "#a08070", { at: [x, 0.015, fz + 0.02], bone: tipName, scale: [0.028, 0.015, 0.045] });
    for (const dx of [-0.013, 0, 0.013]) {
      b.spike([x + dx, 0.016, fz + 0.045], [dx * 3, -0.25, 1], 0.03, 0.0058, { color: CLAW, bone: tipName, sides: 5 });
    }
  };
  for (const sd of [1, -1]) {
    leg(sd, [[0.06, 0.165, 0.1], [0.08, 0.09, 0.085], [0.072, 0.03, 0.12]], ["shoulder", "elbow", "wrist"], spine.joints[0], 0.034, 0.02);
    leg(sd, [[0.065, 0.165, -0.15], [0.085, 0.085, -0.125], [0.075, 0.03, -0.16]], ["hip", "knee", "ankle"], spine.joints[2], 0.04, 0.022);
  }

  // ---------- tail ----------
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.175, -0.25],
      [0, 0.13, -0.42],
      [0, 0.08, -0.58],
      [0, 0.04, -0.74],
    ]),
    { names: ["tail1", "tail2", "tail3"], parent: spine.joints[2], role: "tail" },
  );
  const tr = (t: number) => 0.032 * (1 - t) + 0.004;
  b.sweep(tail, { radius: (t: number) => tr(t) * 0.92, color: "#a8806f", sides: 8 });
  const tailPaint = countershade(mottle(TAN, TAN2, { size: 0.04, seed: 8 }), BELLY, { level: -0.1, soft: 0.3 });
  const TB = 0.1;
  for (let k = 0; k < 10; k++) {
    const a = k * TB;
    const e = Math.min(1, a + TB + 0.012);
    b.sweep(tail, {
      radius: (t: number) => {
        const s = Math.min(1, Math.max(0, (t - a) / (e - a)));
        return tr(t) * (0.98 + 0.22 * s);
      },
      color: tailPaint,
      from: a,
      to: e,
      sides: 8,
      caps: { start: "flat", end: k === 9 ? "point" : "flat" },
    });
  }

  // ---------- coarse pale hairs ----------
  const tuft = svg(
    `<svg viewBox="0 0 32 64" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#f2e8d8" stroke-width="3" stroke-linecap="round">
        <path d="M16 64 Q14 40 10 8"/><path d="M16 64 Q17 36 20 4"/><path d="M16 64 Q20 44 28 16"/>
      </g></svg>`,
    { size: 64 },
  );
  const hits = b.surface(shellSweeps).scatter(80, {
    rng: rng(7),
    minDist: 0.02,
    filter: (h) => h.n.y < 0.55,
  });
  if (hits.length)
    b.cards(hits, tuft, {
      size: [0.014, 0.024],
      lean: 25,
      flow: [0, -0.3, -1],
      bend: 20,
      cross: true,
      vary: 0.3,
      spin: 180,
      rng: rng(11),
    });

  return b.root;
}
