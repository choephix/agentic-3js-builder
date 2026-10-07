import * as THREE from "three";
import { catmull, countershade, createBuilder, mottle, rng, spots } from "../../../../src/index";

export const meta = {
  name: "Octopus",
  description:
    "A stylised vermilion octopus: a bulbous mantle with gold eyes and slit pupils, eight arms with cream suckers and gold spots, two arms coiled on the floor, six raised in hooks, and a beak tucked under the crown.",
};

// Palette (flat colours)
const SKIN = "#d9542b";
const SKIN_DEEP = "#8f2a1c";
const BELLY = "#f7a072";
const SPOT = "#ffd166";
const SUCKER = "#fff1e3";
const GOLD = "#ffb627";
const PUPIL = "#1d1024";
const CREAM = "#fffaf0";
const BEAK = "#3a1f3d";
const WART = "#7d2418";

// Paints
const bodyPaint = countershade(mottle(SKIN, SKIN_DEEP, { size: 0.07, contrast: 0.55, seed: 3 }), BELLY, { level: 0 });
const armPaint = countershade(spots(SKIN, SPOT, { size: 0.06, amount: 0.3, seed: 6 }), BELLY, { level: -0.15 });

type V = [number, number, number];

const UP: V = [0, 1, 0];
const EYES: V[] = [
  [0.118, 0.26, 0.092],
  [-0.118, 0.26, 0.092],
];

const add = (a: V, b: V, k = 1): V => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]);
  return [a[0] / l, a[1] / l, a[2] / l];
};
const dist = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

// Arm thickness along its length: t = 0 where it leaves the mantle, 1 at the tip.
const armR = (t: number) => 0.066 * Math.pow(1 - t, 0.75) + 0.011;

interface Arm {
  id: string;
  th: number; // azimuth in degrees, left side positive (right side is mirrored)
  mode: "up" | "floor"; // a hook lifted in the air, or a coil lying on the floor
  reach: number; // length of the straight run before the curl
  sway: number; // sideways bow of the run
  coil: number; // length of the curl
  k0: number; // curvature at the start of the curl
  k1: number; // curvature at the tip of the curl
}

const ARMS: Arm[] = [
  { id: "F", th: 26, mode: "up", reach: 0.3, sway: 0.03, coil: 0.34, k0: 9, k1: 18 },
  { id: "S", th: 70, mode: "floor", reach: 0.36, sway: -0.03, coil: 0.36, k0: 10, k1: 24 },
  { id: "B", th: 118, mode: "up", reach: 0.3, sway: 0.05, coil: 0.34, k0: 9, k1: 18 },
  { id: "R", th: 158, mode: "up", reach: 0.26, sway: 0.02, coil: 0.32, k0: 10, k1: 20 },
];

// Integrates a curl: the heading turns with a curvature that grows from k0 to k1.
function curl(o: V, u: V, v: V, len: number, k0: number, k1: number, sign: number, steps = 22): V[] {
  const out: V[] = [];
  const ds = len / steps;
  let x = 0;
  let y = 0;
  let h = 0;
  for (let i = 0; i <= steps; i++) {
    const q = i / steps;
    out.push(add(add(o, u, x), v, y));
    h += sign * (k0 + (k1 - k0) * q * q) * ds;
    x += Math.cos(h) * ds;
    y += Math.sin(h) * ds;
  }
  return out;
}

// One arm as a point list: out of the mantle, a run, then a curl.
function armPath(a: Arm, s: number): V[] {
  const th = (s * a.th * Math.PI) / 180;
  const d: V = [Math.sin(th), 0, Math.cos(th)]; // outward
  const sd: V = [Math.cos(th), 0, -Math.sin(th)]; // sideways
  const up = a.mode === "up";
  const sw = a.sway * s;

  const p0 = add([0, 0.155, 0], d, 0.02);
  const p1 = add([0, 0.13, 0], d, 0.11);
  const p2 = add(add([0, 0.07, 0], d, a.reach * 0.5), sd, sw * 0.4);
  const p3 = add(add([0, 0.04, 0], d, a.reach), sd, sw);
  const tip = curl(p3, d, up ? UP : sd, a.coil, a.k0, a.k1, up ? 1 : s);
  const pts: V[] = [p0, p1, p2, p3, ...tip.slice(1)];

  // Lay the run and coil on the floor: the tube's lowest line sits at y = radius.
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + dist(pts[i], pts[i - 1]));
  const total = cum[cum.length - 1];
  return pts.map((p, i): V => {
    const r = armR(cum[i] / total);
    return [p[0], !up && i >= 3 ? r : Math.max(p[1], r), p[2]];
  });
}

export default function build() {
  const b = createBuilder({ name: "octopus" });

  // Skeleton: mantle root, head (carries the eyes), a jaw pair for the beak, and eight arm chains.
  const mantle = b.joint("mantle", { at: [0, 0.2, 0], dir: [0, 1, 0], role: "spine" });
  const head = b.joint("head", { parent: mantle, at: [0, 0.34, 0.03], aim: [0, 0.5, 0.1], role: "head" });
  const jawU = b.joint("jawU", { parent: mantle, at: [0, 0.12, 0.05], aim: [0, 0.06, 0.1], role: "jaw" });
  const jawL = b.joint("jawL", { parent: mantle, at: [0, 0.12, 0.05], aim: [0, 0.065, 0.09], role: "jaw" });

  // Arms: a chain per arm, a tube skinned over it, and two rows of suckers on its flanks.
  for (const a of ARMS) {
    for (const s of [1, -1]) {
      const id = `arm${s > 0 ? "L" : "R"}${a.id}`;
      const names = Array.from({ length: 12 }, (_, i) => `${id}_${i + 1}`);
      const arm = b.chain(id, catmull(armPath(a, s)), { parent: mantle, count: 12, names, role: "tentacle" });
      const tube = b.sweep(arm, armR, { color: armPaint, caps: { start: "round", end: "point" } });

      for (const deg of [125, 235]) {
        for (let i = 0; i < 16; i++) {
          const t = 0.14 + (0.82 * i) / 15;
          const r = Math.max(0.006, 0.42 * armR(t));
          b.stick(new THREE.CylinderGeometry(r, r * 0.85, r * 0.7, 7), SUCKER, tube.at(t, deg), {
            embed: 0.4,
            flat: true,
          });
        }
      }
    }
  }

  // Mantle: a turned sack, flat-bottomed, with a rounded crown.
  const body = b.lathe(
    [
      [0, 0.12, "sharp"],
      [0.09, 0.12],
      [0.13, 0.155],
      [0.15, 0.2],
      [0.157, 0.26],
      [0.152, 0.32],
      [0.13, 0.39],
      [0.09, 0.45],
      [0.045, 0.482],
      [0, 0.494, "sharp"],
    ],
    { at: [0, 0, 0], axis: [0, 1, 0], segments: 16, smoothing: 1, color: bodyPaint, bone: mantle, name: "mantle" },
  );

  // Warts scattered over the mantle, kept clear of the eyes.
  const warts = b.surface(body).scatter(70, {
    rng: rng(21),
    minDist: 0.045,
    filter: (h) => h.n.y > -0.25 && h.at.y > 0.15 && EYES.every((e) => dist([h.at.x, h.at.y, h.at.z], e) > 0.1),
  });
  for (const h of warts) b.stick(new THREE.SphereGeometry(0.013, 6, 4), WART, h, { embed: 0.45, flat: true });

  // Siphon under the eyes.
  b.capsule([0, 0.205, 0.12], [0, 0.175, 0.215], [0.034, 0.026], { bone: mantle, color: SKIN_DEEP });

  // Beak: upper and lower jaw, tucked under the arm crown.
  b.spike(jawU, [0, -0.85, 0.5], 0.058, 0.024, { color: BEAK });
  b.spike(jawL, [0, -0.9, 0.4], 0.045, 0.02, { color: BEAK });

  // Eyes: gold globes with a dark rim, a horizontal slit pupil and a highlight.
  for (const P of EYES) {
    const s = Math.sign(P[0]);
    const D = norm([s * 0.42, 0.05, 1]);
    b.part(new THREE.SphereGeometry(0.046, 12, 9), GOLD, { bone: head, at: P });
    b.part(new THREE.TorusGeometry(0.044, 0.007, 6, 14), SKIN_DEEP, { bone: head, at: P, dir: D, axis: "z" });
    b.part(new THREE.BoxGeometry(0.05, 0.013, 0.012), PUPIL, {
      bone: head,
      at: add(P, D, 0.042),
      dir: D,
      axis: "z",
      up: UP,
    });
    b.part(new THREE.SphereGeometry(0.0095, 6, 4), CREAM, { bone: head, at: add(add(P, D, 0.04), [0, 0.02, 0]) });
  }

  return b.root;
}
