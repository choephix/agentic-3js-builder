```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];
type Anchor = { moved(p: V): any };

type ClawSpec = {
  arm: V[];
  armR: number;
  palm: V;
  palmR: V;
  F0: V;
  F1: V;
  R1: number;
  H: V;
  T: V;
  R2: number;
  fixedTeeth: number[];
  movingTeeth: number[];
};

const add = (p: V, q: V): V => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const sub = (p: V, q: V): V => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const scl = (p: V, s: number): V => [p[0] * s, p[1] * s, p[2] * s];
const lenOf = (p: V): number => Math.hypot(p[0], p[1], p[2]);
const unit = (p: V): V => scl(p, 1 / (lenOf(p) || 1));
const lerp = (p: V, q: V, t: number): V => add(p, scl(sub(q, p), t));

// a stretched icosahedron: a low-poly ellipsoid with radii r
const ellipsoid = (r: V, detail: number) => {
  const g = new THREE.IcosahedronGeometry(1, detail);
  g.scale(r[0], r[1], r[2]);
  return g;
};

export const meta = {
  name: "Red rock crab",
  description:
    "A feisty brick-red rock crab with one oversized claw raised in challenge, eyes on stalks, eight walking legs, and a barnacle and seaweed clinging to its shell.",
};

export default function build() {
  const b = createBuilder({ name: "red-rock-crab" });

  const C = {
    shell: "#a8412b",
    knob: "#7b2819",
    orange: "#e8822f",
    cream: "#f1e1bd",
    stalk: "#963a26",
    eye: "#f5ecd2",
    pupil: "#17100d",
    glint: "#fffaf0",
    mouth: "#3a1d15",
    leg: "#8f3322",
    legTip: "#3b1a13",
    knee: "#d9692b",
    claw: "#bd4c2d",
    clawTip: "#2a1510",
    tooth: "#efe2c2",
    barnacle: "#d8ccb0",
    barnacleTop: "#4a3a30",
    weed: "#4f7a2c",
    weedLight: "#7a9e3e",
  };

  // a cone running from `from` to `to`, its tip at `to`, riding the anchor's bones
  const spike = (anchor: Anchor, from: V, to: V, r: number, col: string) => {
    b.part(new THREE.ConeGeometry(r, lenOf(sub(to, from)), 8), col, {
      at: anchor.moved(lerp(from, to, 0.5)),
      dir: unit(sub(to, from)),
    });
  };

  // a small pointed tooth standing off a finger edge
  const tooth = (anchor: Anchor, p: V, dir: V, r: number, h: number, col: string) => {
    const d = unit(dir);
    b.part(new THREE.ConeGeometry(r, h, 5), col, {
      at: anchor.moved(add(p, scl(d, h * 0.4))),
      dir: d,
    });
  };

  // ---------- carapace ----------
  const SC: V = [0, 0.125, 0];
  const SR: V = [0.165, 0.062, 0.135];

  // point and outward normal on the carapace; phi from the top, th round from the front
  const onShell = (phi: number, th: number): { p: V; n: V } => {
    const x = SR[0] * Math.sin(phi) * Math.sin(th);
    const y = SR[1] * Math.cos(phi);
    const z = SR[2] * Math.sin(phi) * Math.cos(th);
    const n = unit([x / (SR[0] * SR[0]), y / (SR[1] * SR[1]), z / (SR[2] * SR[2])]);
    return { p: add(SC, [x, y, z]), n };
  };

  const body = b.joint("body", { at: SC });
  b.part(ellipsoid(SR, 2), C.shell, { at: SC, bone: body });

  // knobbles over the shell, spread by a golden-angle spiral
  for (let i = 0; i < 26; i++) {
    const t = (i + 0.5) / 26;
    const { p } = onShell(Math.acos(1 - t * 0.7), i * 2.39996);
    const r = 0.014 + (0.006 * ((i * 5) % 4)) / 3;
    b.part(new THREE.IcosahedronGeometry(r, 0), C.knob, { at: p, bone: body });
  }

  // orange and cream speckles
  for (let i = 0; i < 54; i++) {
    const t = (i + 0.5) / 54;
    const { p } = onShell(Math.acos(1 - t * 0.85), i * 2.39996 + 0.9);
    const r = 0.0055 + 0.0025 * ((i * 3) % 2);
    b.part(new THREE.IcosahedronGeometry(r, 0), i % 3 === 0 ? C.cream : C.orange, {
      at: p,
      bone: body,
    });
  }

  // three frontal spines on the carapace rim
  for (const th of [0, 0.6, -0.6]) {
    const { p, n } = onShell(1.45, th);
    b.part(new THREE.ConeGeometry(0.008, 0.026, 6), C.orange, {
      at: add(p, scl(n, 0.011)),
      dir: n,
      bone: body,
    });
  }

  // mouth: upper lip on the body, lower jaw on its own joint
  const jaw = b.joint("jaw", { at: [0, 0.098, 0.128], parent: body });
  b.part(ellipsoid([0.024, 0.01, 0.014], 1), C.mouth, { at: [0, 0.106, 0.136], bone: body });
  b.part(ellipsoid([0.02, 0.009, 0.013], 1), C.mouth, { at: [0, 0.093, 0.139], bone: jaw });

  // barnacle on the back, a little volcano with a dark opening
  const bn = onShell(0.55, Math.PI + 0.4);
  b.part(new THREE.CylinderGeometry(0.0085, 0.0125, 0.0105, 7), C.barnacle, {
    at: add(bn.p, scl(bn.n, 0.0045)),
    dir: bn.n,
    bone: body,
  });
  b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 6), C.barnacleTop, {
    at: add(bn.p, scl(bn.n, 0.0105)),
    dir: bn.n,
    bone: body,
  });

  // seaweed strand clinging to the back of the shell
  const weed = b.chain(
    "weed",
    [
      [0.044, 0.16, -0.099],
      [0.056, 0.2, -0.122],
      [0.046, 0.245, -0.146],
      [0.06, 0.287, -0.162],
      [0.05, 0.325, -0.148],
    ],
    { role: "tentacle" },
  );
  b.sweep(weed, 0.0045, { color: C.weed });
  const leafSpec: [V, V, string][] = [
    [[0.056, 0.2, -0.122], [0.85, 0.4, -0.15], C.weedLight],
    [[0.046, 0.245, -0.146], [-0.8, 0.5, -0.25], C.weed],
    [[0.06, 0.287, -0.162], [0.75, 0.55, -0.3], C.weedLight],
  ];
  for (const [j, d, col] of leafSpec) {
    const dir = unit(d);
    b.part(ellipsoid([0.0065, 0.024, 0.0028], 0), col, {
      at: weed.at(0.5).moved(add(j, scl(dir, 0.022))),
      dir,
    });
  }

  // ---------- eyes on stalks ----------
  const SIDES: [number, string][] = [
    [1, "L"],
    [-1, "R"],
  ];
  for (const [s, tag] of SIDES) {
    const stalk = b.chain(
      `stalk${tag}`,
      [
        [s * 0.052, 0.145, 0.095],
        [s * 0.06, 0.2, 0.12],
        [s * 0.064, 0.245, 0.135],
      ],
      { role: "neck" },
    );
    b.sweep(stalk, 0.0105, { color: C.stalk });
    const top = stalk.at(1);
    const eye: V = [s * 0.064, 0.265, 0.141];
    b.part(new THREE.SphereGeometry(0.03, 14, 10), C.eye, { at: top.moved(eye) });
    b.part(new THREE.SphereGeometry(0.014, 10, 8), C.pupil, {
      at: top.moved([s * 0.064, 0.269, 0.167]),
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), C.glint, {
      at: top.moved([s * 0.067, 0.274, 0.177]),
    });
  }

  // ---------- eight walking legs ----------
  const LEGS: { id: number; xe: number; z: number; k: V; a: V; t: [number, number] }[] = [
    { id: 1, xe: 0.125, z: 0.08, k: [0.08, 0.165, 0.035], a: [0.16, 0.07, 0.065], t: [0.19, 0.085] },
    { id: 2, xe: 0.14, z: 0.02, k: [0.09, 0.16, 0.0], a: [0.18, 0.06, 0.01], t: [0.22, 0.025] },
    { id: 3, xe: 0.14, z: -0.04, k: [0.09, 0.16, -0.035], a: [0.18, 0.06, -0.06], t: [0.22, -0.08] },
    { id: 4, xe: 0.105, z: -0.1, k: [0.08, 0.165, -0.065], a: [0.15, 0.07, -0.105], t: [0.19, -0.135] },
  ];
  for (const [s, tag] of SIDES) {
    for (const L of LEGS) {
      const P0: V = [s * L.xe, 0.105, L.z];
      const P1: V = [s * (L.xe + L.k[0]), L.k[1], L.z + L.k[2]];
      const P2: V = [s * (L.xe + L.a[0]), L.a[1], L.z + L.a[2]];
      const T: V = [s * (L.xe + L.t[0]), 0, L.z + L.t[1]];
      const leg = b.chain(`leg${tag}${L.id}`, [P0, P1, P2], { role: "leg" });
      b.sweep(leg, 0.0135, { color: C.leg });
      b.part(new THREE.SphereGeometry(0.0165, 10, 8), C.knee, { at: P1 });
      spike(leg.at(1), P2, T, 0.0135, C.legTip);
    }
  }

  // ---------- claws ----------
  const claw = (tag: string, c: ClawSpec) => {
    const armC = b.chain(`arm${tag}`, c.arm, { role: "arm" });
    b.sweep(armC, c.armR, { color: C.claw });
    const wrist = armC.at(1);
    b.part(ellipsoid(c.palmR, 1), C.claw, { at: wrist.moved(c.palm) });

    // fixed finger, rigid on the wrist; dark tip over its last 38%
    spike(wrist, c.F0, c.F1, c.R1, C.claw);
    spike(wrist, lerp(c.F0, c.F1, 0.62), c.F1, c.R1 * 0.4, C.clawTip);
    for (const t of c.fixedTeeth) {
      const p = add(lerp(c.F0, c.F1, t), [0, -c.R1 * (1 - t) * 0.9, 0]);
      tooth(wrist, p, [0, -1, 0.25], c.R1 * 0.3, c.R1 * 0.7, C.tooth);
    }

    // moving finger on its own hinge joint, parented to the wrist
    const pin = b.chain(`pincer${tag}`, [wrist.moved(c.H), wrist.moved(c.T)], {
      role: "hinge",
    });
    const hinge = pin.at(0);
    spike(hinge, c.H, c.T, c.R2, C.claw);
    spike(hinge, lerp(c.H, c.T, 0.62), c.T, c.R2 * 0.4, C.clawTip);
    for (const t of c.movingTeeth) {
      const p = add(lerp(c.H, c.T, t), [0, c.R2 * (1 - t) * 0.9, 0]);
      tooth(hinge, p, [0, 1, 0.25], c.R2 * 0.3, c.R2 * 0.7, C.tooth);
    }
  };

  // the oversized claw, raised in challenge on the crab's left
  claw("L", {
    arm: [
      [0.13, 0.14, 0.03],
      [0.2, 0.235, 0.1],
      [0.215, 0.335, 0.21],
    ],
    armR: 0.021,
    palm: [0.215, 0.345, 0.285],
    palmR: [0.072, 0.066, 0.074],
    F0: [0.205, 0.378, 0.33],
    F1: [0.19, 0.4, 0.5],
    R1: 0.03,
    H: [0.21, 0.31, 0.335],
    T: [0.195, 0.285, 0.505],
    R2: 0.027,
    fixedTeeth: [0.22, 0.42, 0.58],
    movingTeeth: [0.2, 0.4, 0.56],
  });

  // the smaller claw held low in front of the mouth on the right
  claw("R", {
    arm: [
      [-0.115, 0.135, 0.05],
      [-0.165, 0.13, 0.17],
      [-0.14, 0.135, 0.265],
    ],
    armR: 0.015,
    palm: [-0.14, 0.14, 0.3],
    palmR: [0.042, 0.038, 0.044],
    F0: [-0.135, 0.163, 0.318],
    F1: [-0.125, 0.185, 0.4],
    R1: 0.0165,
    H: [-0.135, 0.118, 0.318],
    T: [-0.124, 0.1, 0.385],
    R2: 0.015,
    fixedTeeth: [0.25, 0.55],
    movingTeeth: [0.3, 0.6],
  });

  return b.root;
}
```