import * as THREE from "three";
import { catmull, createBuilder, frame, limb, mottle, rng, spots } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Red rock crab",
  description:
    "A feisty brick-red rock crab with a speckled, knobbly shell, eyes on stalks, eight pointed walking legs, one oversized claw raised in challenge, and a barnacle and seaweed on its back.",
};

type V = [number, number, number];

const add = (p: V, d: V): V => [p[0] + d[0], p[1] + d[1], p[2] + d[2]];
const dist = (a: V, b: V) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Paints and colours
const SHELL = spots(mottle("#9c3a22", "#772615", { size: 0.07 }), "#e8772f", { size: 0.03, amount: 0.3 });
const SHELL_TOP = spots(SHELL, "#f1d9b2", { size: 0.011, amount: 0.12 });
const CLAW = spots(mottle("#c4502e", "#8e3220", { size: 0.035 }), "#f0a04a", { size: 0.012, amount: 0.22 });
const CLAWF = "#c4502e";
const STALK = "#9c3a22";
const LEG = "#a03e27";
const TIPC = "#2a1310";
const KNOB = "#7b2817";
const CREAMK = "#eedcb8";
const EYE = "#17110f";
const HILITE = "#fbf6ea";
const BARN = "#dccfb0";
const BARN_HOLE = "#3e3029";
const WEED = "#4d6a2a";
const WEED_L = "#8aaa4e";

const UP: V = [0, 1, 0];

const leafOutline = (): OutlinePoint[] => [
  [0, 0],
  [0.008, 0.02],
  [0, 0.05, "sharp"],
  [-0.008, 0.02],
];

export default function build() {
  const b = createBuilder({ name: "rock-crab" });
  const rand = rng(21);

  // ---- carapace: a wide, flattened, faceted dome ----
  const C: V = [0, 0.112, -0.005];
  const R: V = [0.105, 0.045, 0.082];
  const body = b.joint("body", { at: C, role: "spine" });
  b.part(new THREE.SphereGeometry(1, 14, 10), SHELL_TOP, { at: C, bone: body, scale: R, flat: true });

  // A point on the carapace. theta: from the top; phi: round it (0 = +X, pi/2 = front).
  const onShell = (theta: number, phi: number, lift = 0) => {
    const d: V = [Math.sin(theta) * Math.cos(phi), Math.cos(theta), Math.sin(theta) * Math.sin(phi)];
    const g: V = [d[0] / R[0], d[1] / R[1], d[2] / R[2]];
    const l = Math.hypot(g[0], g[1], g[2]);
    const n: V = [g[0] / l, g[1] / l, g[2] / l];
    const p = add([C[0] + R[0] * d[0], C[1] + R[1] * d[1], C[2] + R[2] * d[2]], [n[0] * lift, n[1] * lift, n[2] * lift]);
    return { p, n };
  };

  const barnacle = onShell(0.5, -1.62, -0.002);
  const weedRoot = onShell(0.62, -2.0, -0.004);

  // Knobs over the shell, spread on a golden-angle spiral
  for (let i = 0; i < 46; i++) {
    const u = (i + 0.5) / 46;
    const s = onShell(Math.acos(0.96 - 0.84 * u), i * 2.39996);
    if (s.p[2] > 0.05 && s.p[1] < 0.16) continue; // keep the brow clear for the eyes
    if (dist(s.p, barnacle.p) < 0.035 || dist(s.p, weedRoot.p) < 0.03) continue;
    const r = 0.0048 + 0.0036 * rand();
    b.stick(new THREE.IcosahedronGeometry(r, 0), rand() < 0.35 ? CREAMK : KNOB, frame(s.p, s.n), {
      embed: 0.4,
      bone: body,
    });
  }

  // Lateral spines and brow spines
  for (const s of [1, -1]) {
    for (const ph of [0.2, -0.38]) {
      const sp = onShell(1.5, s > 0 ? ph : Math.PI - ph, -0.003);
      b.spike(sp.p, [sp.n[0], sp.n[1] + 0.2, sp.n[2]], 0.03, 0.0085, { color: CREAMK, bone: body });
    }
    const brow = onShell(1.45, Math.PI / 2 - s * 0.13, -0.002);
    b.spike(brow.p, [s * 0.1, 0.12, 1], 0.026, 0.0075, { color: CREAMK, bone: body });
  }

  // ---- eyes on stalks ----
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const stalk = b.chain(
      `eyeStalk${S}`,
      catmull([
        [s * 0.04, 0.122, 0.068],
        [s * 0.05, 0.146, 0.086],
        [s * 0.056, 0.17, 0.096],
      ]),
      { parent: body, names: [`stalk${S}`, `stalkMid${S}`, `eye${S}`], role: "tentacle" },
    );
    b.sweep(stalk, (t) => 0.0095 - 0.0025 * t, { color: STALK });
    const eyeJ = stalk.tip!;
    b.part(new THREE.SphereGeometry(0.017, 10, 8), EYE, { at: [s * 0.056, 0.17, 0.096], bone: eyeJ });
    b.part(new THREE.SphereGeometry(0.0055, 6, 4), HILITE, { at: [s * 0.058, 0.178, 0.11], bone: eyeJ });
  }

  // ---- eight jointed walking legs, pointed tips on the floor ----
  const legs: { hip: V; foot: V }[] = [
    { hip: [0.07, 0.1, 0.03], foot: [0.2, 0, 0.09] },
    { hip: [0.075, 0.1, -0.005], foot: [0.225, 0, 0] },
    { hip: [0.07, 0.1, -0.04], foot: [0.205, 0, -0.1] },
    { hip: [0.06, 0.1, -0.07], foot: [0.165, 0, -0.16] },
  ];
  legs.forEach((leg, i) => {
    for (const s of [1, -1]) {
      const S = s > 0 ? "L" : "R";
      const k = i + 1;
      const pts = limb(
        [s * leg.hip[0], leg.hip[1], leg.hip[2]],
        [s * leg.foot[0], leg.foot[1], leg.foot[2]],
        [0.085, 0.085, 0.07],
        [UP, UP],
      );
      const walk = b.chain(`walk${S}${k}`, pts, {
        parent: body,
        names: [`hip${S}${k}`, `knee${S}${k}`, `ankle${S}${k}`, `foot${S}${k}`],
        role: "leg",
      });
      b.sweep(walk, (t) => 0.015 * (1 - t) ** 0.7, {
        color: (t) => (t > 0.86 ? TIPC : LEG),
        caps: { start: "round", end: "point" },
      });
    }
  });

  // ---- claws: one oversized raised claw, one small one ----
  type Claw = { tag: string; s: number; k: number; arm: V[]; palm: V[]; fixed: V[]; mov: V[] };
  const claws: Claw[] = [
    {
      tag: "L",
      s: 1,
      k: 1.3,
      arm: [
        [0.06, 0.11, 0.06],
        [0.12, 0.18, 0.12],
        [0.12, 0.25, 0.2],
      ],
      palm: [
        [0.12, 0.25, 0.2],
        [0.115, 0.28, 0.24],
        [0.11, 0.31, 0.27],
      ],
      fixed: [
        [0.11, 0.296, 0.25],
        [0.107, 0.298, 0.3],
        [0.102, 0.304, 0.36],
      ],
      mov: [
        [0.11, 0.326, 0.25],
        [0.107, 0.342, 0.3],
        [0.1, 0.36, 0.35],
      ],
    },
    {
      tag: "R",
      s: -1,
      k: 0.75,
      arm: [
        [0.06, 0.105, 0.05],
        [0.1, 0.08, 0.13],
        [0.085, 0.085, 0.2],
      ],
      palm: [
        [0.085, 0.085, 0.2],
        [0.08, 0.09, 0.23],
        [0.075, 0.095, 0.26],
      ],
      fixed: [
        [0.075, 0.088, 0.245],
        [0.072, 0.088, 0.28],
        [0.068, 0.09, 0.31],
      ],
      mov: [
        [0.075, 0.102, 0.245],
        [0.072, 0.1, 0.28],
        [0.07, 0.1, 0.32],
      ],
    },
  ];

  for (const c of claws) {
    const m = (p: V): V => [c.s * p[0], p[1], p[2]];
    const k = c.k;

    const arm = b.chain(`arm${c.tag}`, catmull(c.arm.map(m)), {
      parent: body,
      names: [`shoulder${c.tag}`, `elbow${c.tag}`, `wrist${c.tag}`],
      role: "arm",
    });
    b.sweep(arm, (t) => k * (0.024 - 0.008 * t), { color: CLAWF });
    const wrist = arm.tip!;

    const palm = b.sweep(
      catmull(c.palm.map(m)),
      (t) => [k * (0.03 + 0.012 * Math.sin(Math.PI * t)), k * (0.026 + 0.008 * Math.sin(Math.PI * t))],
      { bone: wrist, color: CLAW },
    );
    // little cream knobs on the palm
    for (const t of [0.3, 0.6]) {
      for (const ang of [-70, 70]) {
        b.stick(new THREE.IcosahedronGeometry(0.0065 * k, 0), CREAMK, palm.at(t, ang), {
          embed: 0.4,
          bone: wrist,
        });
      }
    }

    // two pincers on their own joints, so they can open and close
    const lo = b.joint(`pincerLo${c.tag}`, { parent: wrist, at: m(c.fixed[0]), aim: m(c.fixed[2]), role: "digit" });
    const up = b.joint(`pincerUp${c.tag}`, { parent: wrist, at: m(c.mov[0]), aim: m(c.mov[2]), role: "digit" });
    const tipColor = (t: number) => (t > 0.7 ? TIPC : CLAWF);
    const fixed = b.sweep(catmull(c.fixed.map(m)), (t) => k * 0.0145 * (1 - t) ** 0.6, {
      bone: lo,
      color: tipColor,
      caps: { start: "round", end: "point" },
    });
    const mov = b.sweep(catmull(c.mov.map(m)), (t) => k * 0.0145 * (1 - t) ** 0.6, {
      bone: up,
      color: tipColor,
      caps: { start: "round", end: "point" },
    });

    // little dark teeth on the facing edges of the pincers
    for (const t of [0.34, 0.5, 0.64]) {
      const a = fixed.at(t, 0);
      b.spike(a, a, 0.012 * k, 0.0042 * k, { color: TIPC, bone: lo });
      const d = mov.at(t, 180);
      b.spike(d, d, 0.012 * k, 0.0042 * k, { color: TIPC, bone: up });
    }
  }

  // ---- a tiny barnacle on the back of the shell ----
  b.lathe(
    [
      [0, 0],
      [0.011, 0],
      [0.0125, 0.004],
      [0.007, 0.0105],
      [0, 0.011],
    ],
    { at: barnacle.p, axis: barnacle.n, segments: 7, color: BARN, bone: body },
  );
  const barTop = onShell(0.5, -1.62, 0.0094);
  b.lathe(
    [
      [0, 0],
      [0.0042, 0],
      [0.0046, 0.0012],
      [0, 0.0016],
    ],
    { at: barTop.p, axis: barTop.n, segments: 7, color: BARN_HOLE, bone: body },
  );

  // ---- a strand of seaweed clinging to the back ----
  const w0 = weedRoot.p;
  const weed = catmull([
    w0,
    add(w0, [-0.012, 0.035, -0.035]),
    add(w0, [0.004, 0.07, -0.07]),
    add(w0, [-0.012, 0.1, -0.11]),
    add(w0, [-0.03, 0.13, -0.14]),
  ]);
  b.sweep(weed, (t) => 0.0046 - 0.0022 * t, { bone: body, color: WEED });

  const fronds: [number, V][] = [
    [0.3, [0.6, 0.8, 0]],
    [0.55, [-0.6, 0.8, 0]],
    [0.8, [0.6, 0.8, 0]],
  ];
  for (const [t, y] of fronds) {
    // x = [y1, -y0, 0] keeps each frond's broad face toward the front and back
    b.extrude(leafOutline(), {
      at: weed.at(t),
      x: [y[1], -y[0], 0],
      y,
      thickness: 0.0016,
      smoothing: 1,
      color: WEED_L,
      bone: body,
    });
  }

  return b.root;
}
