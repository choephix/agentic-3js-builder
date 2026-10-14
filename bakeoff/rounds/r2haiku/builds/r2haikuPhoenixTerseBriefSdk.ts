import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Phoenix",
  description: "A stylized phoenix in a rest pose: blocky body, fanned wings and tail, flame crest and ember-coloured plumage.",
};

const C = {
  body: "#e8452c",
  deep: "#9e1f14",
  belly: "#ffb020",
  amber: "#ff9a1f",
  gold: "#ffc83a",
  tip: "#ffd23f",
  red: "#ff2e4d",
  flame: "#ff5a1f",
  ember: "#ffe066",
  beak: "#ffb347",
  leg: "#f2a33a",
  eye: "#fff3a0",
  ink: "#1a0a05",
};

const lerp3 = (a: number[], c: number[], t: number) => [
  a[0] + (c[0] - a[0]) * t,
  a[1] + (c[1] - a[1]) * t,
  a[2] + (c[2] - a[2]) * t,
];

export default function build() {
  const b = createBuilder({ name: "phoenix" });
  b.joint("hips", { at: [0, 1.1, 0] });

  // Ellipsoid blob on a point.
  const ell = (c: number[], rx: number, ry: number, rz: number, col: string) => {
    const g = new THREE.SphereGeometry(1, 18, 12);
    g.scale(rx, ry, rz);
    b.part(g, col, { at: c });
  };

  // Flat feather plank: starts at `base`, runs `len` along `dir`.
  const plank = (base: number[], dir: number[], len: number, w: number, t: number, col: string) => {
    const n = Math.hypot(dir[0], dir[1], dir[2]);
    const d = [dir[0] / n, dir[1] / n, dir[2] / n];
    const g = new THREE.BoxGeometry(w, t, len);
    const pitch = Math.asin(d[1]);
    const yaw = Math.atan2(-d[0], -d[2]);
    g.rotateX(pitch);
    g.rotateY(yaw);
    const c = [base[0] + (d[0] * len) / 2, base[1] + (d[1] * len) / 2, base[2] + (d[2] * len) / 2];
    b.part(g, col, { at: c });
  };

  // Mirror a point or direction across the body (+X is the phoenix's left).
  const mir = (v: number[], s: number) => [v[0] * s, v[1], v[2]];

  // Torso
  b.chain("spine", [[0, 1.05, -0.15], [0, 1.3, 0.05], [0, 1.5, 0.3]], { role: "spine" });
  const spine = b.chain("spine2", [[0, 1.05, -0.15], [0, 1.3, 0.05], [0, 1.5, 0.3]], { role: "spine" });
  b.sweep(spine, 0.2, { color: C.body });
  ell([0, 1.36, 0.1], 0.3, 0.32, 0.36, C.body);
  ell([0, 1.28, 0.25], 0.19, 0.22, 0.2, C.belly);
  ell([0, 1.15, -0.12], 0.24, 0.22, 0.22, C.body);

  // Neck and head
  const neck = b.chain("neck", [[0, 1.5, 0.3], [0, 1.72, 0.45], [0, 1.9, 0.6]], { role: "neck" });
  b.sweep(neck, 0.1, { color: C.body });
  ell([0, 1.98, 0.66], 0.13, 0.14, 0.15, C.body);

  // Upper beak (cone tip points +Z)
  const upper = new THREE.ConeGeometry(0.055, 0.24, 6);
  upper.rotateX(Math.PI / 2);
  b.part(upper, C.beak, { at: [0, 2.0, 0.86] });

  // Lower jaw: its own chain so it can open
  b.chain("jaw", [[0, 1.93, 0.72], [0, 1.92, 0.9]], { role: "jaw" });
  const lower = new THREE.ConeGeometry(0.045, 0.2, 6);
  lower.rotateX(Math.PI / 2);
  b.part(lower, C.beak, { at: [0, 1.92, 0.84] });

  // Eyes, mirrored
  for (const s of [1, -1]) {
    ell([0.085 * s, 2.02, 0.72], 0.04, 0.04, 0.04, C.eye);
    ell([0.085 * s, 2.02, 0.755], 0.018, 0.018, 0.012, C.ink);
  }

  // Flame crest
  const crestCols = [C.flame, C.amber, C.tip, C.amber, C.flame];
  [-0.22, -0.11, 0, 0.11, 0.22].forEach((x, i) => {
    plank(
      [x * 0.5, 2.02, 0.6],
      [x * 0.6, 0.85, -0.55 - Math.abs(x) * 0.3],
      0.5 - Math.abs(x) * 0.4,
      0.08,
      0.02,
      crestCols[i],
    );
  });

  // Wings (spread at rest), built per side
  for (const s of [1, -1]) {
    const S = [0.2, 1.55, 0.12];
    const E = [0.95, 1.75, 0.02];
    const W = [1.85, 1.72, -0.18];
    const T = [2.55, 1.62, -0.5];
    const arm = b.chain(s > 0 ? "wingL" : "wingR", [mir(S, s), mir(E, s), mir(W, s), mir(T, s)], {
      role: "wing",
    });
    b.sweep(arm, 0.05, { color: C.deep });

    // Covert feathers along the forearm
    for (const t of [0.15, 0.4, 0.65, 0.9]) {
      const p = lerp3(E, W, t);
      plank(mir([p[0], p[1] - 0.03, p[2] - 0.02], s), mir([0.05, -0.15, -1], s), 0.5, 0.14, 0.02, C.amber);
    }

    // Primary feathers fanning from the wrist to the tip
    for (let k = 0; k < 6; k++) {
      const t = k / 5;
      const p = lerp3(W, T, t);
      const col = k >= 4 ? C.tip : k % 2 ? C.amber : C.red;
      plank(mir(p, s), mir([0.08, -0.12, -1], s), 0.9 - t * 0.1, 0.16, 0.02, col);
    }
  }

  // Legs with talons, mirrored
  for (const s of [1, -1]) {
    const leg = [[0.16, 1.12, 0.0], [0.2, 0.62, 0.12], [0.17, 0.14, -0.04]].map((p) => mir(p, s));
    const lc = b.chain(s > 0 ? "legL" : "legR", leg, { role: "leg" });
    b.sweep(lc, 0.065, { color: C.leg });
    ell(mir([0.18, 0.85, 0.06], s), 0.11, 0.2, 0.1, C.body);
    ell(mir([0.17, 0.14, -0.04], s), 0.05, 0.05, 0.05, C.leg);
    for (const xo of [-0.06, 0, 0.06]) {
      plank(mir([0.17 + xo, 0.03, -0.02], s), mir([xo * 2, -0.02, 1], s), 0.2, 0.035, 0.03, C.leg);
    }
  }

  // Tail: long chain with a fan of streamer feathers
  const tailEnd = [0, 0.9, -1.65];
  const tail = b.chain("tail", [[0, 1.12, -0.2], [0, 1.12, -0.75], [0, 1.02, -1.25], tailEnd], {
    role: "tail",
  });
  b.sweep(tail, 0.08, { color: C.deep });
  const tailCols = [C.flame, C.amber, C.red, C.ember];
  for (let i = 0; i < 7; i++) {
    const a = -0.6 + i * 0.2;
    const dir = [Math.sin(a) * 0.8, 0.3 - Math.abs(a) * 0.25, -1];
    plank(tailEnd, dir, 1.3, 0.16, 0.02, tailCols[i % 4]);
  }

  return b.root;
}
