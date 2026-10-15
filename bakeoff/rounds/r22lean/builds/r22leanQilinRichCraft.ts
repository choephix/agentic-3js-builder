import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull, spiral } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Jade-scaled hooved chimera with branching golden antlers, a dragon face, whiskers and a mane of crimson and amber cloud locks.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const GOLD = "#f2b632";
const GOLD_D = "#a8691a";
const CREAM_F = "#fff1c8";
const TEAL_F = "#27a592";
const PEARL = "#a6f8ff";
const GEM = "#ff4a5a";

const SCALE_BASE = scales(["#2db5a0", "#27a592", "#38c4ac"], "#0e5754", { size: 0.05, width: 0.12, seed: 3 });
const BELLY = scales(["#fff1c8", "#ffe5a0"], "#d6a85a", { size: 0.05, width: 0.1, seed: 4 });
const COAT = cel(paint((_p, n) => (n.y < -0.25 ? BELLY : SCALE_BASE)));
const RED = cel("#e8353f");
const ORANGE = cel("#ff8a2b");
const AMBER = cel("#ffc83a");
const LOCKS = [RED, ORANGE, AMBER];

const LOCK: Array<[number, number]> = [
  [0, 0],
  [0.06, 0.03],
  [0.14, 0.02],
  [0.2, 0.07],
  [0.28, 0.06],
  [0.34, 0.12],
  [0.3, 0.17],
  [0.22, 0.15],
  [0.16, 0.13],
  [0.1, 0.1],
  [0.04, 0.08],
  [-0.02, 0.04],
];

const SWIRL = svg(
  `<svg viewBox="0 0 100 100">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M52 52 C52 44 62 44 62 52 C62 64 44 66 40 52 C36 34 62 28 72 42 C82 58 64 80 42 76" stroke="#22112f" stroke-width="11"/>
    <path d="M14 88 C6 88 6 74 18 74 C20 64 34 64 38 72 C44 66 56 68 56 76 C66 74 72 86 62 88 Z" stroke="#22112f" stroke-width="10"/>
    <path d="M52 52 C52 44 62 44 62 52 C62 64 44 66 40 52 C36 34 62 28 72 42 C82 58 64 80 42 76" stroke="#ffd45a" stroke-width="5"/>
    <path d="M14 88 C6 88 6 74 18 74 C20 64 34 64 38 72 C44 66 56 68 56 76 C66 74 72 86 62 88 Z" stroke="#ffb02e" stroke-width="4" fill="#ff8a2b"/>
  </g></svg>`,
  { size: 256 },
);

const TUFT = svg(
  `<svg viewBox="0 0 40 80"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#e8353f"/><stop offset="0.6" stop-color="#ff8a2b"/><stop offset="1" stop-color="#ffd45a"/></linearGradient></defs>
  <path d="M20 78 C4 60 8 36 22 24 C26 16 22 8 20 2 C34 14 36 40 30 56 C28 66 24 72 20 78Z" fill="url(#g)" stroke="#22112f" stroke-width="2.5"/></svg>`,
  { size: 128 },
);

const bodyR = (t: number): [number, number] => {
  const k = Math.sin(Math.PI * (0.2 + 0.65 * t));
  return [0.17 + 0.1 * k, 0.22 + 0.12 * k];
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin" });
  const P3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // ---- body ----
  const bodyPath = catmull([
    [0, 1.0, -0.75],
    [0, 1.03, -0.3],
    [0, 1.05, 0.25],
    [0, 1.1, 0.65],
  ]);
  b.sweep(bodyPath, (t: number) => bodyR(t), COAT, { caps: "round" });

  // dorsal plates
  for (let i = 0; i < 10; i++) {
    const t = 0.06 + 0.09 * i;
    const pos = bodyPath.at(t);
    const r = bodyR(t)[1];
    b.spike([0, pos.y + r - 0.02, pos.z], [0, 1, -0.3], 0.07 - 0.003 * i, 0.02, GOLD, { sides: 6 });
  }

  // haunches and shoulders, each carrying a swirl decal
  for (const s of [1, -1]) {
    const haunch = b.part(new THREE.SphereGeometry(0.2, 10, 8), COAT, {
      at: [s * 0.2, 0.97, -0.55],
      scale: [0.85, 1.05, 1.0],
    });
    const shoulder = b.part(new THREE.SphereGeometry(0.17, 10, 8), COAT, {
      at: [s * 0.2, 0.95, 0.45],
      scale: [0.85, 1.05, 1.0],
    });
    b.decal(haunch, SWIRL, { at: [s * 0.37, 0.97, -0.55], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s < 0 });
    b.decal(shoulder, SWIRL, { at: [s * 0.345, 0.95, 0.45], dir: [s, 0, 0], size: [0.26, 0.26], mirror: s < 0 });
  }

  // ---- legs ----
  const legs: Array<{ pts: number[][]; radii: number[] }> = [];
  for (const s of [1, -1]) {
    legs.push({
      pts: [
        [s * 0.19, 1.0, 0.5],
        [s * 0.2, 0.72, 0.47],
        [s * 0.19, 0.48, 0.55],
        [s * 0.19, 0.2, 0.54],
        [s * 0.19, 0.09, 0.55],
      ],
      radii: [0.1, 0.07, 0.04, 0.037, 0.042],
    });
    legs.push({
      pts: [
        [s * 0.2, 1.0, -0.62],
        [s * 0.21, 0.72, -0.5],
        [s * 0.2, 0.47, -0.7],
        [s * 0.19, 0.2, -0.66],
        [s * 0.19, 0.09, -0.68],
      ],
      radii: [0.12, 0.085, 0.045, 0.04, 0.045],
    });
  }
  const dirsB = [
    [0.3, -0.3, -1],
    [0, -0.6, -1],
    [-0.3, -0.3, -1],
  ];
  legs.forEach((lg, li) => {
    const L = catmull(lg.pts);
    b.sweep(L, lg.radii, COAT, { caps: "round" });
    const end = lg.pts[4];
    const sx = end[0] > 0 ? 1 : -1;
    // cuff
    const cp = L.at(0.8);
    b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10), GOLD, { at: cp, rotation: [90, 0, 0] });
    const kp = L.at(0.42);
    b.part(new THREE.TorusGeometry(0.055, 0.01, 5, 10), GOLD_D, { at: kp, rotation: [90, 0, 0] });
    // hoof
    b.part(new THREE.CylinderGeometry(0.046, 0.058, 0.08, 6), GOLD, { at: [end[0], 0.04, end[2]] });
    b.part(new THREE.BoxGeometry(0.008, 0.07, 0.11), GOLD_D, { at: [end[0], 0.043, end[2] + 0.006] });
    // fetlock tuft
    dirsB.forEach((d, i) => {
      b.spike([end[0], 0.16, end[2] - 0.03], [d[0] * sx, d[1], d[2]], 0.13, 0.03, i === 1 ? "#e8353f" : i === 0 ? "#ff8a2b" : "#ffc83a", { sides: 5 });
    });
    // flame on elbow / hock
    const flameAt = li % 2 === 0 ? [sx * 0.22, 0.7, 0.4] : [sx * 0.2, 0.5, -0.72];
    b.extrude(
      LOCK.map(([x, y]) => [x * 0.7, y * 0.7] as [number, number]),
      { at: flameAt, x: [sx * 0.4, 0.3, -1], y: [0, 1, 0], thickness: [0.02, 0.004], bevel: 0.003, color: li % 2 === 0 ? ORANGE : RED },
    );
  });

  // ---- tail ----
  const tailP = catmull([
    [0, 1.05, -0.82],
    [0, 1.2, -1.1],
    [0, 1.05, -1.4],
    [0, 0.82, -1.52],
  ]);
  b.sweep(tailP, [0.05, 0.03, 0.018], COAT, { caps: "round" });
  for (let i = 0; i < 6; i++) {
    const t = 0.5 + i * 0.1;
    const o = tailP.at(t);
    b.extrude(
      LOCK.map(([x, y]) => [x * 1.1, y * 1.1] as [number, number]),
      {
        at: o,
        x: [((i % 3) - 1) * 0.5, -0.4, -1],
        y: [0, 1, 0],
        thickness: [0.02, 0.004],
        bevel: 0.003,
        color: LOCKS[i % 3],
      },
    );
  }
  b.sweep(
    spiral([0, 0.9, -1.55], [0, 0.82, -1.52], [1, 0, 0], { turns: 1.3, r1: 0.03 }),
    [0.016, 0.006],
    GOLD,
    { caps: "round" },
  );

  // ---- neck ----
  const neckP = catmull([
    [0, 1.1, 0.5],
    [0, 1.28, 0.72],
    [0, 1.5, 0.92],
    [0, 1.63, 1.08],
  ]);
  const neck = b.sweep(neckP, [0.2, 0.14, 0.105], COAT, { caps: "round" });
  // gold collar and pendant
  const cp0 = neckP.at(0.3);
  b.part(new THREE.TorusGeometry(0.18, 0.014, 6, 14), GOLD, { at: cp0, dir: neckP.tangentAt(0.3), axis: "z" });
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 5), PEARL, { at: [0, cp0.y - 0.05, cp0.z + 0.17] }), 1.5);
  b.part(new THREE.TorusGeometry(0.034, 0.008, 5, 8), GOLD, { at: [0, cp0.y - 0.05, cp0.z + 0.175] });

  // mane locks
  for (let i = 0; i < 10; i++) {
    const t = 0.05 + i * 0.1;
    const p = neckP.at(t);
    const r = 0.19 - 0.09 * t;
    const k = 0.95 - 0.4 * t;
    b.part(new THREE.SphereGeometry(0.05, 6, 5), LOCKS[i % 3], { at: [p.x, p.y + r * 0.95, p.z - 0.03] });
    for (const sx of [-1, 0, 1]) {
      b.extrude(
        LOCK.map(([x, y]) => [x * k, y * k] as [number, number]),
        {
          at: [sx * 0.07, p.y + r * (sx === 0 ? 1 : 0.7), p.z - 0.03],
          x: [sx * 0.5, -0.3, -1],
          y: [0, 1, 0],
          thickness: [0.022, 0.004],
          bevel: 0.003,
          color: LOCKS[(i + sx + 1) % 3],
        },
      );
    }
  }
  // fluffy flame cards on the neck
  const hits = b.surface(neck).scatter(60, { rng: rng(2), minDist: 0.05, filter: (h) => h.n.y > -0.1 });
  b.cards(hits, TUFT, { size: [0.07, 0.14], lean: 60, bend: 30, flow: [0, -0.2, -1], vary: 0.3, rng: rng(3), cross: true });

  // ---- head ----
  const HEAD_C = P3(0, 1.64, 1.14);
  const skull = b.part(new THREE.SphereGeometry(1, 12, 9), COAT, { at: HEAD_C, scale: [0.115, 0.11, 0.15] });
  b.capsule([0, 1.62, 1.17], [0, 1.56, 1.43], [0.095, 0.07], COAT);
  b.capsule([0, 1.5, 1.17], [0, 1.49, 1.42], [0.06, 0.04], BELLY_FLAT());
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.015, 5, 4), INK, { at: [s * 0.032, 1.575, 1.495] });
    b.spike([s * 0.04, 1.515, 1.4], [0, 1, 0.2], 0.04, 0.008, CREAM_F, { sides: 5 });
    b.capsule([s * 0.04, 1.69, 1.2], [s * 0.1, 1.68, 1.1], 0.018, GOLD_D);
    // ears
    b.extrude(
      [
        [0, 0],
        [0.04, 0.05],
        [0.02, 0.14],
        [0, 0.19, "sharp"],
        [-0.02, 0.14],
        [-0.04, 0.05],
      ],
      { at: [s * 0.1, 1.7, 1.03], x: [s, 0, 0], y: [s * 0.6, 0.8, -0.5], thickness: 0.012, bevel: 0.003, color: TEAL_F },
    );
    // cheek frills
    b.extrude(
      [
        [0, 0],
        [0.1, 0.05],
        [0.06, 0.0],
        [0.12, -0.05],
        [0.02, -0.06],
      ],
      { at: [s * 0.1, 1.6, 1.1], x: [s * 0.3, -0.2, -1], y: [0, 1, 0], thickness: 0.01, color: RED },
    );
    // whiskers
    const wp = catmull([
      [s * 0.05, 1.56, 1.38],
      [s * 0.18, 1.5, 1.5],
      [s * 0.3, 1.4, 1.3],
      [s * 0.42, 1.45, 1.0],
    ]);
    b.sweep(wp, [0.008, 0.003], CREAM_F, { caps: "round" });
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), PEARL, { at: wp.at(1) }), 1.5);
  }
  // eyes
  const EYE = animeEye({ iris: "#ffb21e" });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const hit = skin.around(HEAD_C).at(s * 52, 4)!;
    b.decal(skin, EYE, { at: hit, size: [0.05, 0.068], mirror: s > 0 });
  }
  // beard and forehead gem
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.03;
    b.sweep(
      catmull([
        [x, 1.48, 1.3],
        [x * 1.5, 1.38, 1.27],
        [x * 2, 1.28, 1.2],
      ]),
      [0.014, 0.004],
      LOCKS[i],
      { caps: "round" },
    );
  }
  glow(b.part(new THREE.SphereGeometry(0.02, 6, 5), GEM, { at: [0, 1.7, 1.24] }), 1.5);
  b.part(new THREE.TorusGeometry(0.026, 0.006, 5, 8), GOLD, { at: [0, 1.7, 1.235], rotation: [-15, 0, 0] });
  // forelock
  b.extrude(
    LOCK.map(([x, y]) => [x * 0.8, y * 0.8] as [number, number]),
    { at: [0, 1.74, 1.16], x: [0, 0.5, 0.6], y: [0, 1, -0.5], thickness: [0.02, 0.004], bevel: 0.003, color: RED },
  );

  // ---- antlers ----
  for (const s of [1, -1]) {
    const P = catmull([
      [s * 0.05, 1.73, 1.08],
      [s * 0.09, 1.9, 1.02],
      [s * 0.13, 2.06, 0.9],
      [s * 0.14, 2.22, 0.76],
    ]);
    b.sweep(P, [0.024, 0.008], GOLD, { caps: "round", sides: 6 });
    b.part(new THREE.TorusGeometry(0.03, 0.012, 5, 8), GOLD_D, { at: P.at(0.03), dir: P.tangentAt(0.03), axis: "z" });
    const tines: Array<[number, number[], number]> = [
      [0.3, [s * 0.6, 0.7, 0.5], 0.2],
      [0.5, [s * 0.7, 0.7, -0.2], 0.24],
      [0.7, [s * 0.6, 0.8, 0.3], 0.22],
    ];
    for (const [t, d, len] of tines) {
      const base = P.at(t);
      const dv = P3(d[0], d[1], d[2]).normalize();
      const mid = base.clone().addScaledVector(dv, len * 0.5).add(P3(0, 0.03, 0));
      const tip = base.clone().addScaledVector(dv, len).add(P3(0, 0.06, 0));
      b.sweep([base.toArray(), mid.toArray(), tip.toArray()], [0.013, 0.003], GOLD, { caps: "round", sides: 6 });
      glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), PEARL, { at: tip }), 1.5);
    }
    glow(b.part(new THREE.SphereGeometry(0.02, 6, 4), PEARL, { at: P.at(1) }), 1.5);
  }

  return b.root;
}

function BELLY_FLAT(): string {
  return "#f6dca0";
}
