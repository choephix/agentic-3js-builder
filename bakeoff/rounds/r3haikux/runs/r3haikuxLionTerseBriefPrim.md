```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";

type V = [number, number, number];
type Joint = ReturnType<ReturnType<typeof createBuilder>["joint"]>;

// Palette: golden coat, dark layered mane, cream muzzle and paws, amber eyes, ivory teeth.
const GOLD = "#c98a3d";
const GOLD_DARK = "#a86a2c";
const BELLY = "#e6b774";
const CREAM = "#f2d9a4";
const PAW = "#e9c98e";
const MANE_DARK = "#3e2310";
const MANE_MID = "#6d4019";
const MANE_LIGHT = "#a06628";
const BROW = "#3a200f";
const NOSE = "#241510";
const AMBER = "#f2b024";
const PUPIL = "#120a06";
const IVORY = "#fbf3e0";
const INNER_EAR = "#7b4424";
const MOUTH = "#4a1d1d";
const TAIL_TUFT = "#2a160a";

const add = (p: V, q: V): V => [p[0] + q[0], p[1] + q[1], p[2] + q[2]];
const sub = (p: V, q: V): V => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const mul = (p: V, s: number): V => [p[0] * s, p[1] * s, p[2] * s];
const mix = (p: V, q: V, t: number): V => add(p, mul(sub(q, p), t));
const len = (p: V) => Math.hypot(p[0], p[1], p[2]);
const norm = (p: V): V => mul(p, 1 / (len(p) || 1));
const dot = (p: V, q: V) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];

export const meta = {
  name: "Lion",
  description:
    "A stylised male lion in a rest pose: blocky golden body, layered dark mane, amber eyes and ivory fangs.",
};

export default function build() {
  const b = createBuilder({ name: "lion" });
  const rand = rng(1907);
  const H: V = [0, 1.36, 0.66]; // head pivot

  // ---------- helpers (all geometry goes through b.part so it rides a bone)
  const ball = (bone: Joint, at: V, r: number, color: string, scale: V = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 10, 7), color, { at, bone, scale });

  const seg = (bone: Joint, from: V, to: V, r: number, color: string) =>
    b.part(new THREE.CapsuleGeometry(r, Math.max(len(sub(to, from)) - 2 * r, 0.01), 4, 8), color, {
      at: mix(from, to, 0.5),
      bone,
      dir: norm(sub(to, from)),
    });

  const cone = (bone: Joint, at: V, dir: V, r: number, h: number, color: string) =>
    b.part(new THREE.ConeGeometry(r, h, 5, 1), color, { at, bone, dir: norm(dir) });

  const box = (bone: Joint, at: V, size: V, color: string) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, bone });

  // ---------- skeleton: spine, neck, head, jaw, tail
  const hips = b.joint("hips", { at: [0, 0.98, -0.38] });
  const chest = b.joint("chest", { at: [0, 1.0, 0.2], parent: hips });
  const neck = b.joint("neck", { at: [0, 1.2, 0.44], parent: chest });
  const head = b.joint("head", { at: H, parent: neck });
  const jaw = b.joint("jaw", { at: [0, 1.31, 0.7], parent: head });

  const tailPts: V[] = [
    [0, 0.98, -0.5],
    [0, 0.94, -0.82],
    [0, 0.8, -1.06],
    [0, 0.6, -1.2],
    [0, 0.4, -1.24],
  ];
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, role: "tail" });

  // ---------- head: skull, muzzle, ears, eyes, brows, whisker pads, fangs
  ball(head, H, 0.19, GOLD, [1.05, 0.95, 1.05]);
  ball(head, [0, 1.31, 0.82], 0.1, CREAM, [1.25, 0.85, 1.1]);
  ball(head, [0, 1.36, 0.92], 0.045, NOSE, [1.5, 0.85, 0.8]);
  box(head, [0, 1.245, 0.8], [0.09, 0.03, 0.14], MOUTH);

  const whisk: V[] = [
    [0.1, 1.34, 0.88],
    [0.09, 1.31, 0.9],
    [0.11, 1.29, 0.86],
  ];

  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const ear = b.joint(`ear${S}`, { at: [0.13 * s, 1.56, 0.6], parent: head });
    ball(ear, [0.13 * s, 1.56, 0.6], 0.055, GOLD, [1, 1, 0.45]);
    ball(ear, [0.13 * s, 1.565, 0.62], 0.03, INNER_EAR, [1, 1, 0.35]);

    ball(head, [0.075 * s, 1.4, 0.85], 0.04, AMBER, [1, 0.85, 0.6]);
    ball(head, [0.075 * s, 1.4, 0.872], 0.018, PUPIL, [1, 1.3, 0.5]);
    box(head, [0.075 * s, 1.445, 0.83], [0.085, 0.024, 0.05], BROW);

    for (const p of whisk) ball(head, [p[0] * s, p[1], p[2]], 0.014, NOSE);

    cone(head, [0.05 * s, 1.235, 0.9], [0, -1, 0], 0.013, 0.05, IVORY);
    cone(jaw, [0.035 * s, 1.275, 0.88], [0, 1, 0], 0.012, 0.04, IVORY);
  }

  // lower jaw, hinged at the back so it can open
  seg(jaw, [0, 1.31, 0.7], [0, 1.22, 0.9], 0.04, CREAM);
  ball(jaw, [0, 1.22, 0.9], 0.045, CREAM, [1.2, 0.9, 1.1]);

  // ---------- body: barrel chest, haunches, lighter underside, neck
  seg(hips, [0, 1.0, 0.2], [0, 0.98, -0.36], 0.24, GOLD);
  ball(chest, [0, 1.0, 0.2], 0.26, GOLD, [0.92, 0.92, 1.1]);
  ball(hips, [0, 0.98, -0.38], 0.25, GOLD, [0.92, 0.95, 1.0]);
  ball(hips, [0, 0.8, 0.02], 0.2, BELLY, [0.8, 0.45, 1.5]);
  seg(chest, [0, 1.0, 0.2], [0, 1.2, 0.44], 0.2, GOLD);
  seg(neck, [0, 1.2, 0.44], H, 0.17, GOLD);

  // ---------- legs: mirrored left (+X) and right (-X)
  for (const [S, s] of [["L", 1], ["R", -1]] as const) {
    const m = (p: V): V => [p[0] * s, p[1], p[2]];

    const shP = m([0.17, 0.94, 0.24]);
    const elP = m([0.17, 0.52, 0.27]);
    const wrP = m([0.17, 0.13, 0.32]);
    const hiP = m([0.19, 0.96, -0.36]);
    const knP = m([0.19, 0.58, -0.28]);
    const anP = m([0.17, 0.15, -0.48]);

    const sh = b.joint(`shoulder${S}`, { at: shP, parent: chest });
    const el = b.joint(`elbow${S}`, { at: elP, parent: sh });
    const wr = b.joint(`wrist${S}`, { at: wrP, parent: el });
    const hp = b.joint(`hip${S}`, { at: hiP, parent: hips });
    const kn = b.joint(`knee${S}`, { at: knP, parent: hp });
    const an = b.joint(`ankle${S}`, { at: anP, parent: kn });

    // foreleg: golden arm, darker forearm, cream paw with three ivory claws
    ball(sh, m([0.17, 0.97, 0.22]), 0.12, GOLD, [0.9, 1.15, 1.0]);
    seg(sh, shP, elP, 0.085, GOLD);
    seg(el, elP, wrP, 0.062, GOLD_DARK);
    ball(wr, m([0.17, 0.04, 0.38]), 0.075, PAW, [0.95, 0.6, 1.2]);
    for (const dx of [-0.03, 0, 0.03]) {
      cone(wr, m([0.17 + dx, 0.03, 0.455]), [0, -0.45, 1], 0.011, 0.035, IVORY);
    }

    // hindleg: big haunch, dark lower leg, hock, cream paw
    ball(hp, m([0.19, 0.92, -0.36]), 0.15, GOLD, [0.9, 1.15, 1.05]);
    seg(hp, hiP, knP, 0.1, GOLD);
    seg(kn, knP, anP, 0.06, GOLD_DARK);
    ball(an, anP, 0.06, GOLD_DARK);
    ball(an, m([0.17, 0.04, -0.42]), 0.07, PAW, [0.95, 0.6, 1.25]);
  }

  // ---------- mane: rings of tufts round the head and neck, face kept clear
  const earDirs = [norm([0.13, 0.2, -0.06]), norm([-0.13, 0.2, -0.06])];

  const tuft = (d: V, base: number, L: number, sweep: number, r: number, color: string) => {
    const t = norm(add(d, [0, -0.25 * sweep, -0.4 * sweep]));
    const p = add(H, mul(d, base));
    b.part(new THREE.ConeGeometry(r, L, 5, 1), color, {
      at: add(p, mul(t, L / 2)),
      bone: head,
      dir: t,
    });
  };

  const rings: [number, number][] = [
    [-0.62, 16],
    [-0.2, 20],
    [0.2, 20],
    [0.56, 18],
    [0.9, 10],
  ];
  rings.forEach(([e, n], k) => {
    for (let i = 0; i < n; i++) {
      const a = ((i + (k % 2) * 0.5) / n) * Math.PI * 2 + (rand() - 0.5) * 0.2;
      const d: V = [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
      if (d[2] > 0.45 || earDirs.some((ed) => dot(d, ed) > 0.9)) continue;

      // outer: long, dark, swept back and down; front-facing ones lighter
      tuft(d, 0.12, 0.2 + rand() * 0.06, 0.6, 0.06, d[2] > 0.1 ? MANE_MID : MANE_DARK);
      // inner: short, pale, lifting out of the dark layer
      const d2 = norm(add(d, [(rand() - 0.5) * 0.3, 0.12, (rand() - 0.5) * 0.3]));
      tuft(d2, 0.09, 0.12 + rand() * 0.05, 0.2, 0.05, MANE_LIGHT);
    }
  });

  // throat ruff under the chin
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.04;
    cone(neck, [x, 1.16, 0.5], [x * 1.5, -0.7, 0.6], 0.04, 0.14, MANE_MID);
  }

  // ---------- tail: bending chain, dark tuft at the tip
  b.sweep(tail, 0.05, { color: GOLD });
  const tip = tail.at(1);
  const TIP = tailPts[tailPts.length - 1];
  b.part(new THREE.SphereGeometry(0.085, 9, 6), TAIL_TUFT, { at: tip, scale: [1, 1.35, 1] });
  for (let i = 0; i < 6; i++) {
    const d = norm([(rand() - 0.5) * 1.2, (rand() - 0.5) * 0.8 - 0.1, -0.6 - rand() * 0.6]);
    b.part(new THREE.ConeGeometry(0.025, 0.08, 5, 1), TAIL_TUFT, {
      at: tip.moved(add(TIP, mul(d, 0.07))),
      dir: d,
    });
  }

  return b.root;
}
```