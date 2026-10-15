import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description:
    "Scaled, cloven-hooved chimera with branching gold antlers, a dragon-like face, and a billowing cloud mane and tail, cel-shaded in pearl, aqua and gold.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const GOLD = "#f2c14e";
const GOLD_D = "#b8842a";
const HOOF = "#e9b53c";
const GEM = "#46f0e0";
const FLAME = "#ffb14a";

const SCALE_P = cel(scales(["#f7f2e8", "#ece7f3", "#faf5ea"], "#a9cfd6", { size: 0.045, width: 0.12 }));
const BELLY = cel("#ffe6c4", "#e8b7a0");
const RIDGE = cel("#4fcfdc");
const SOCK = cel("#49c3d0", "#2a7fb0");
const COAT = paint((p, n) => {
  if (p.y < 0.3) return SOCK;
  if (n.y < -0.25) return BELLY;
  if (n.y > 0.7 && Math.abs(p.x) < 0.035) return RIDGE;
  return SCALE_P;
});
const CREAM = cel("#fff1d6", "#e9c4a8");
const AQUA = cel("#5fd3e0", "#2f8fc4");
const PALE = cel("#d8f6f8", "#8fc8e4");
const DEEP = cel("#3a9bd4", "#2a58a8");

const WISP = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 62 C3 48 5 36 13 30 C20 24 11 14 18 2 C27 14 27 24 22 32 C31 40 29 52 16 62Z" fill="#ffffff"/></svg>`,
  { size: 128 },
);
const SWIRL = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke-linecap="round">
  <path d="M32 32 c0-6 8-8 12-4 c5 6-2 16-12 14 c-12-3-14-18-4-24 c10-6 26 0 24 16" stroke="#2a7fb0" stroke-width="8"/>
  <path d="M32 32 c0-6 8-8 12-4 c5 6-2 16-12 14 c-12-3-14-18-4-24 c10-6 26 0 24 16" stroke="#ffd86b" stroke-width="4"/>
  <path d="M8 52 c-4-6 2-12 8-9 M52 10 c6-2 8 4 4 8" stroke="#7fe3ee" stroke-width="4"/></g></svg>`,
  { size: 256 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin" });
  const R = rng(11);

  // ---------- body ----------
  const body = b.sweep(
    catmull([
      [0, 1.08, -0.85],
      [0, 1.15, -0.45],
      [0, 1.17, 0.05],
      [0, 1.2, 0.5],
    ]),
    [0.24, 0.3, 0.31, 0.28],
    COAT,
    { sides: 12 },
  );
  const neckPath = catmull([
    [0, 1.2, 0.5],
    [0, 1.4, 0.65],
    [0, 1.62, 0.82],
    [0, 1.75, 0.93],
  ]);
  const neck = b.sweep(neckPath, [0.2, 0.15, 0.12], COAT, { sides: 10 });

  // haunch and shoulder masses
  for (const s of [1, -1]) {
    b.capsule([s * 0.2, 1.08, -0.78], [s * 0.18, 0.78, -0.6], [0.14, 0.1], COAT, { sides: 8 });
    b.capsule([s * 0.2, 1.1, 0.48], [s * 0.18, 0.82, 0.5], [0.12, 0.09], COAT, { sides: 8 });
  }

  // dorsal ridge spines
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.1;
    b.stick(new THREE.ConeGeometry(0.03, 0.1 - i * 0.004, 5), GOLD, body.at(t, 0));
  }

  // flank swirls
  for (const s of [1, -1]) {
    b.decal(body, SWIRL, { at: [s * 0.3, 1.2, -0.1], dir: [s, 0, 0], size: [0.42, 0.42], mirror: s < 0 });
    b.decal(body, SWIRL, { at: [s * 0.25, 1.15, -0.62], dir: [s, 0, 0], size: [0.3, 0.3], mirror: s > 0, roll: 40 });
  }

  // ---------- legs ----------
  const flameFrames: ReturnType<typeof frame>[] = [];
  for (const s of [1, -1]) {
    const x = s * 0.19;
    const legs: Array<{ pts: number[][]; fz: number }> = [
      {
        pts: [
          [x, 1.0, 0.5],
          [x, 0.72, 0.5],
          [x, 0.5, 0.54],
          [x, 0.3, 0.5],
          [x, 0.1, 0.52],
        ],
        fz: 0.52,
      },
      {
        pts: [
          [x, 1.0, -0.75],
          [x * 1.05, 0.72, -0.55],
          [x, 0.45, -0.78],
          [x, 0.28, -0.76],
          [x, 0.1, -0.72],
        ],
        fz: -0.72,
      },
    ];
    for (const L of legs) {
      b.sweep(catmull(L.pts), [0.1, 0.07, 0.05, 0.04, 0.035], COAT, { sides: 8 });
      b.part(new THREE.CylinderGeometry(0.05, 0.058, 0.1, 8), HOOF, { at: [x, 0.048, L.fz] });
      b.part(new THREE.BoxGeometry(0.008, 0.09, 0.12), GOLD_D, { at: [x, 0.05, L.fz + 0.004] });
      b.part(new THREE.TorusGeometry(0.043, 0.012, 5, 10), GOLD, { at: [x, 0.14, L.fz], rotation: [90, 0, 0] });
      b.part(new THREE.TorusGeometry(0.06, 0.012, 5, 10), GOLD, { at: [x, 0.5, L.pts[2][2]], rotation: [90, 0, 0] });
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI * 2;
        flameFrames.push(frame([x + Math.cos(a) * 0.03, 0.15, L.fz + Math.sin(a) * 0.03], [Math.cos(a) * 0.7, 0.5, Math.sin(a) * 0.7]));
      }
    }
  }
  glow(b.cards(flameFrames, WISP, { size: [0.07, 0.17], lean: 40, bend: 30, flow: [0, 0.3, -1], cross: true, color: FLAME, vary: 0.25, rng: rng(5) }), 1);

  // ---------- chest collar ----------
  b.part(new THREE.TorusGeometry(0.2, 0.022, 6, 16), GOLD, { at: neckPath.at(0.1), rotation: [-60, 0, 0] });
  b.part(new THREE.TorusGeometry(0.2, 0.012, 5, 16), GOLD_D, { at: neckPath.at(0.18), rotation: [-60, 0, 0] });
  glow(b.part(new THREE.OctahedronGeometry(0.045), GEM, { at: [0, 1.2, 0.8], scale: [1, 1.4, 0.8] }), 1.3);
  b.part(new THREE.TorusGeometry(0.06, 0.01, 5, 10), GOLD, { at: [0, 1.2, 0.79] });

  // ---------- head ----------
  const HEAD: [number, number, number] = [0, 1.8, 1.0];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), COAT, { at: HEAD, scale: [0.11, 0.1, 0.14] });
  const skin = b.surface(skull);
  b.capsule([0, 1.76, 1.08], [0, 1.7, 1.32], [0.085, 0.06], COAT, { sides: 8 });
  b.capsule([0, 1.7, 1.06], [0, 1.66, 1.3], [0.05, 0.045], CREAM, { sides: 8 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), INK, { at: [s * 0.03, 1.72, 1.4] });
    b.rod([s * 0.075, 1.86, 1.0], [s * 0.05, 1.83, 1.22], 0.018, GOLD_D, { sides: 6 });
    b.spike([s * 0.025, 1.64, 1.28], [s * 0.1, -0.8, 0.3], 0.03, 0.007, "#ffffff", { sides: 5 });
    b.spike([s * 0.1, 1.86, 0.88], [s * 0.7, 0.4, -0.6], 0.17, 0.045, COAT, { sides: 6 });
    b.spike([s * 0.1, 1.85, 0.9], [s * 0.7, 0.4, -0.6], 0.1, 0.025, AQUA, { sides: 6 });
    // cheek fins
    b.spike([s * 0.1, 1.75, 0.95], [s * 0.6, -0.3, -0.7], 0.14, 0.03, AQUA, { sides: 5 });
    // whiskers
    b.sweep(
      catmull([
        [s * 0.04, 1.7, 1.3],
        [s * 0.16, 1.66, 1.2],
        [s * 0.3, 1.55, 0.95],
        [s * 0.36, 1.4, 0.7],
      ]),
      [0.01, 0.004],
      GOLD,
      { sides: 5 },
    );
    const hit = skin.around(HEAD).at(s * 50, 5);
    if (hit) b.decal(skin, animeEye({ iris: "#ffa51f", irisLight: "#ffe27a" }), { at: hit, size: [0.06, 0.082], mirror: s > 0 });
  }
  const gemHit = skin.around(HEAD).at(0, 55);
  if (gemHit) glow(b.stick(new THREE.OctahedronGeometry(0.025), GEM, gemHit), 1.4);
  b.rod([0, 1.88, 1.07], [0, 1.78, 1.2], 0.012, GOLD, { sides: 5 });
  // chin beard
  for (let i = 0; i < 3; i++) b.spike([0, 1.65, 1.1 + i * 0.05], [0, -1, -0.5], 0.1 - i * 0.02, 0.018, PALE, { sides: 5 });

  // ---------- antlers ----------
  for (const s of [1, -1]) {
    const main = catmull([
      [s * 0.05, 1.88, 0.93],
      [s * 0.09, 2.05, 0.88],
      [s * 0.12, 2.2, 0.78],
      [s * 0.14, 2.34, 0.66],
    ]);
    b.sweep(main, [0.024, 0.008], GOLD, { sides: 6 });
    b.part(new THREE.TorusGeometry(0.026, 0.01, 5, 8), GOLD_D, { at: main.at(0.04), rotation: [90, 0, 0] });
    const branches: Array<[number, number[], number]> = [
      [0.3, [s * 0.9, 0.5, 0.1], 0.2],
      [0.5, [s * 0.8, 0.6, -0.3], 0.22],
      [0.72, [s * 0.7, 0.6, 0.4], 0.16],
    ];
    for (const [t, dir, len] of branches) {
      const base = main.at(t);
      b.spike(base, dir, len, 0.014, GOLD, { sides: 5 });
      const d = new THREE.Vector3(...dir).normalize().multiplyScalar(len);
      glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GEM, { at: base.clone().add(d) }), 1.2);
    }
    glow(b.part(new THREE.SphereGeometry(0.016, 6, 4), GEM, { at: main.at(1) }), 1.2);
  }

  // ---------- cloud mane ----------
  const maneHits = b.surface(neck).scatter(110, {
    rng: rng(3),
    minDist: 0.03,
    filter: (h) => h.n.y > 0.2 && Math.abs(h.n.x) < 0.6,
  });
  b.cards(maneHits, WISP, { size: [0.08, 0.24], lean: 55, bend: 30, vary: 0.3, rng: rng(4), color: "#59d0df", cross: true });
  const puffC = [AQUA, PALE, DEEP, PALE];
  for (let i = 0; i < 10; i++) {
    const t = 0.02 + i * 0.1;
    const p = neckPath.at(t);
    const r = 0.1 - i * 0.003 + R() * 0.02;
    b.part(new THREE.SphereGeometry(r, 8, 6), puffC[i % 4], { at: [p.x, p.y + 0.11, p.z - 0.12 - r * 0.3], scale: [0.9, 1, 1] });
    b.part(new THREE.SphereGeometry(r * 0.6, 7, 5), puffC[(i + 1) % 4], { at: [p.x + (i % 2 ? 0.07 : -0.07), p.y + 0.06, p.z - 0.18] });
    b.part(new THREE.TorusGeometry(r * 0.7, 0.007, 4, 10), GOLD, { at: [p.x, p.y + 0.11, p.z - 0.12 - r * 0.3 + 0.03], rotation: [10, 90, 0] });
  }
  // shoulder / back cloud tufts
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      b.part(new THREE.SphereGeometry(0.07 - i * 0.008, 7, 5), puffC[i], { at: [s * 0.26, 0.98 + i * 0.02, 0.5 - i * 0.28] });
    }
    // forearm feathered fins
    b.spike([s * 0.22, 0.75, 0.42], [s * 0.7, -0.2, -1], 0.2, 0.04, AQUA, { sides: 5 });
    b.spike([s * 0.22, 0.85, -0.65], [s * 0.7, -0.2, -1], 0.22, 0.045, AQUA, { sides: 5 });
  }

  // ---------- tail ----------
  const tail = b.sweep(
    catmull([
      [0, 1.12, -0.85],
      [0, 1.22, -1.1],
      [0, 1.15, -1.4],
      [0, 0.92, -1.62],
    ]),
    [0.06, 0.03],
    COAT,
    { sides: 8 },
  );
  const tipP = new THREE.Vector3(0, 0.92, -1.62);
  b.cards(b.surface(tail).scatter(40, { rng: rng(8), minDist: 0.04 }), WISP, { size: [0.08, 0.25], lean: 60, bend: 30, color: "#59d0df", cross: true, rng: rng(9) });
  for (let i = 0; i < 4; i++) {
    b.part(new THREE.SphereGeometry(0.09 - i * 0.012, 8, 6), puffC[i], { at: [(i % 2 ? 0.04 : -0.04), tipP.y - 0.02 - i * 0.04, tipP.z - 0.04 - i * 0.07] });
  }
  b.part(new THREE.TorusGeometry(0.07, 0.01, 5, 12), GOLD, { at: tail.at(0.9), rotation: [0, 0, 0] });

  return b.root;
}
