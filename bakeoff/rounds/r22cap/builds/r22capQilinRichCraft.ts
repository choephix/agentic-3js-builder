import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { paint, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { frame } from "../../../../src/frame";
import { animeEye, cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Qilin",
  description: "Jade-scaled hooved chimera with golden antlers, dragon head, cloud mane, flame fetlocks and a glowing chest jewel.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const GOLD = "#f2b83a";
const GOLD_D = "#b9791f";
const HOOF = "#7a4a1a";
const CREAM = "#fff0c4";
const WHITE = "#ffffff";
const CYAN = "#7ff6ff";
const RED = "#e8493a";

const TEAL = cel(scales(["#2fb5a4", "#27a396", "#3cc6b0"], "#14636b", { size: 0.055, width: 0.012 }));
const BELLY = cel(scales("#ffe7ad", "#e0b050", { size: 0.05, width: 0.01 }));
const GOLDP = cel("#f2b83a", "#c0701c");
const COAT = paint((_p, n) => (n.y < -0.25 ? BELLY : TEAL));
const LEG = paint((p, n) => (p.y < 0.3 ? GOLDP : n.y < -0.4 ? BELLY : TEAL));
const CLOUD = cel("#ffffff", "#a9c6f2");
const CLOUD2 = cel("#bff3ff", "#7fb6e8");
const CLOUD3 = cel("#ffd6ec", "#d79ad8");

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "qilin" });
  const R = rng(11);

  const WISP = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C2 48 22 36 10 22 C8 14 18 6 26 0 C20 14 30 26 22 40 C16 52 30 56 16 64Z" fill="#bfe8ff"/><path d="M16 60 C8 48 20 38 14 24 C14 18 18 12 22 6 C20 18 26 28 20 40 C16 50 24 54 16 60Z" fill="#ffffff"/></svg>`,
    { size: 128 },
  );
  const FLAME = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 64 C0 50 8 34 14 22 C14 30 18 30 18 22 C20 12 16 6 20 0 C26 14 34 34 30 48 C28 58 22 62 16 64Z" fill="#e8493a"/><path d="M16 62 C6 52 12 38 16 28 C18 36 22 38 24 46 C25 54 20 60 16 62Z" fill="#ff9a2e"/><path d="M16 60 C12 54 14 46 17 40 C20 46 21 52 16 60Z" fill="#ffe27a"/></svg>`,
    { size: 128 },
  );
  const SWIRL = svg(
    `<svg viewBox="0 0 64 64"><path d="M32 32 C32 26 40 26 40 33 C40 42 26 44 24 32 C22 18 42 14 48 28 C52 38 44 50 32 50" stroke="#f2b83a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="32" cy="32" r="3" fill="#f2b83a"/><path d="M10 54 C16 48 22 56 28 52" stroke="#f2b83a" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const EYE = animeEye({ iris: "#ffb02e", irisLight: "#fff08a" });

  // ---------- body ----------
  const bodyPath = catmull([
    [0, 1.15, -0.85],
    [0, 1.2, -0.4],
    [0, 1.24, 0.1],
    [0, 1.27, 0.6],
  ]);
  const prof = [0.2, 0.27, 0.31, 0.33, 0.34, 0.31];
  const bodyR = (t: number) => {
    const f = Math.min(0.9999, t) * 5;
    const i = Math.floor(f);
    const u = f - i;
    return prof[i]! * (1 - u) + prof[i + 1]! * u;
  };
  const body = b.sweep(bodyPath, (t) => [bodyR(t) * 0.95, bodyR(t) * 1.05], COAT, { sides: 10 });
  const skin = b.surface(body);

  // flank decals
  for (const s of [1, -1]) {
    const h = skin.around(V(0, 1.2, -0.1)).at(s * 90, 0);
    if (h) b.decal(skin, SWIRL, { at: h, dir: [s, 0, 0], size: [0.42, 0.42], mirror: s < 0 });
  }

  // chest jewel
  const jh = skin.ray([0, 1.18, 2], [0, 0, -1]);
  if (jh) {
    b.stick(new THREE.SphereGeometry(0.06, 8, 6), GOLD, jh);
    const inner = b.stick(new THREE.SphereGeometry(0.04, 6, 5), CYAN, jh.moved([0, 0.03, 0]));
    glow(inner, 1.6);
  }

  // dorsal spines
  for (let i = 0; i < 16; i++) {
    const t = 0.04 + i * 0.058;
    const p = bodyPath.at(t);
    const h = bodyR(t) * 1.05 * 0.95;
    b.spike([p.x, p.y + h, p.z], [0, 1, -0.7], 0.09 - 0.002 * i, 0.016, GOLD, { sides: 5 });
  }
  // belly band rings (gold girth straps)
  for (const t of [0.42, 0.66]) {
    const p = bodyPath.at(t);
    const tg = bodyPath.tangentAt(t);
    b.part(new THREE.TorusGeometry(bodyR(t) * 1.02, 0.012, 5, 16), GOLD, { at: p, dir: tg, axis: "z", scale: [0.95, 1.05, 1] });
  }

  // ---------- neck & head ----------
  const neckPath = catmull([
    [0, 1.4, 0.55],
    [0, 1.7, 0.86],
    [0, 1.98, 1.0],
  ]);
  const neckR = (t: number) => 0.19 - 0.08 * t;
  b.sweep(neckPath, [0.19, 0.15, 0.11], COAT, { sides: 9 });
  for (const t of [0.25, 0.5, 0.75]) {
    b.part(new THREE.TorusGeometry(neckR(t) + 0.008, 0.013, 5, 14), GOLD, { at: neckPath.at(t), dir: neckPath.tangentAt(t), axis: "z" });
  }

  const HC = V(0, 2.02, 1.1);
  const head = b.capsule([0, 2.03, 1.02], [0, 1.93, 1.42], [0.125, 0.075], COAT, { sides: 10 });
  b.part(new THREE.SphereGeometry(1, 10, 8), COAT, { at: [0, 2.06, 1.0], scale: [0.13, 0.12, 0.14] });
  b.capsule([0, 1.95, 1.1], [0, 1.87, 1.4], [0.085, 0.05], BELLY, { sides: 8 });
  const hs = b.surface(head);
  b.part(new THREE.SphereGeometry(1, 8, 6), "#14636b", { at: [0, 1.91, 1.47], scale: [0.075, 0.055, 0.06] });
  for (const s of [1, -1]) {
    const eh = hs.around(HC).at(s * 62, 8);
    if (eh) b.decal(hs, EYE, { at: eh, size: [0.062, 0.085], mirror: s > 0 });
    b.part(new THREE.SphereGeometry(0.011, 5, 4), INK, { at: [s * 0.035, 1.925, 1.5] });
    b.rod([s * 0.075, 1.885, 1.27], [s * 0.05, 1.875, 1.45], 0.005, INK, { sides: 4 });
    b.spike([s * 0.05, 1.885, 1.38], [0, -1, 0.2], 0.05, 0.011, WHITE, { sides: 5 });
    b.capsule([s * 0.105, 2.125, 1.07], [s * 0.065, 2.145, 1.22], 0.017, GOLD, { sides: 6 });
    // ears
    b.extrude(
      [[0, 0], [0.05, 0.04], [0.045, 0.14], [0, 0.22, "sharp"], [-0.025, 0.1]],
      { at: [s * 0.1, 2.08, 0.93], x: [s, 0, -0.5], y: [s * 0.5, 1, 0], thickness: 0.014, bevel: 0.004, color: TEAL },
    );
    b.extrude(
      [[0.005, 0.02], [0.03, 0.05], [0.025, 0.12], [0, 0.17, "sharp"], [-0.01, 0.09]],
      { at: [s * 0.1, 2.08, 0.945], x: [s, 0, -0.5], y: [s * 0.5, 1, 0], thickness: 0.016, color: "#ffb7c5" },
    );
    // whiskers
    const wp = catmull([
      [s * 0.05, 1.93, 1.43],
      [s * 0.2, 1.84, 1.58],
      [s * 0.42, 1.96, 1.5],
      [s * 0.55, 2.16, 1.2],
    ]);
    b.sweep(wp, [0.009, 0.004], "#ffe9a8", { sides: 4 });
    for (const t of [0.7, 0.95]) b.part(new THREE.IcosahedronGeometry(0.03, 0), CLOUD2, { at: wp.at(t) });
    // cheek fins
    b.extrude(
      [[0, 0], [0.12, 0.03], [0.2, -0.02], [0.14, -0.07], [0.04, -0.06]],
      { at: [s * 0.12, 1.98, 1.12], x: [s, 0.05, -0.4], y: [0, 1, 0], thickness: 0.012, bevel: 0.003, color: GOLD },
    );
  }

  // antlers
  for (const s of [1, -1]) {
    const beam = catmull([
      [s * 0.06, 2.15, 0.96],
      [s * 0.11, 2.36, 0.86],
      [s * 0.16, 2.54, 0.76],
      [s * 0.2, 2.72, 0.8],
    ]);
    b.sweep(beam, [0.028, 0.011], GOLD, { sides: 6 });
    b.part(new THREE.CylinderGeometry(0.036, 0.04, 0.03, 6), GOLD_D, { at: [s * 0.06, 2.15, 0.96] });
    const tipPts: THREE.Vector3[] = [beam.at(1)];
    for (const [t, dz, dx] of [
      [0.3, 0.12, 0.08],
      [0.55, 0.14, 0.1],
      [0.8, -0.1, 0.09],
    ] as const) {
      const p = beam.at(t);
      const tine = catmull([p, V(p.x + s * dx * 0.5, p.y + 0.07, p.z + dz * 0.6), V(p.x + s * dx, p.y + 0.17, p.z + dz)]);
      b.sweep(tine, [0.018, 0.005], GOLD, { sides: 5 });
      tipPts.push(tine.at(1));
    }
    for (const p of tipPts) glow(b.part(new THREE.IcosahedronGeometry(0.02, 0), CYAN, { at: p }), 1.4);
    for (const t of [0.2, 0.45, 0.7]) {
      const p = beam.at(t);
      b.part(new THREE.TorusGeometry(0.024 - 0.012 * t, 0.006, 4, 8), GOLD_D, { at: p, dir: beam.tangentAt(t), axis: "z" });
    }
  }

  // ---------- mane (clouds) ----------
  const maneFrames: ReturnType<typeof frame>[] = [];
  const manePts: THREE.Vector3[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const p = neckPath.at(t);
    p.y += neckR(t) * 0.85;
    p.z -= 0.07;
    manePts.push(p);
    for (const ox of [-0.05, 0, 0.05]) maneFrames.push(frame(V(p.x + ox, p.y, p.z), [0, 1, -0.3]));
    const mats = [CLOUD, CLOUD2, CLOUD3, CLOUD];
    const q = mats[i % 4]!;
    b.part(new THREE.IcosahedronGeometry(0.075 - 0.01 * t, 1), q, { at: [p.x, p.y + 0.02, p.z - 0.02] });
    if (i % 2 === 0) {
      b.part(new THREE.IcosahedronGeometry(0.055, 1), mats[(i + 1) % 4]!, { at: [p.x + 0.07, p.y - 0.02, p.z - 0.05] });
      b.part(new THREE.IcosahedronGeometry(0.055, 1), mats[(i + 2) % 4]!, { at: [p.x - 0.07, p.y - 0.02, p.z - 0.05] });
    }
  }
  // withers cloud sweep down the back
  for (let i = 0; i < 4; i++) {
    const t = 0.78 - i * 0.12;
    const p = bodyPath.at(t);
    b.part(new THREE.IcosahedronGeometry(0.08 - 0.01 * i, 1), [CLOUD, CLOUD2, CLOUD3, CLOUD][i]!, { at: [0, p.y + bodyR(t) * 1.0 + 0.02, p.z] });
  }
  b.cards(maneFrames, WISP, { size: [0.09, 0.22], lean: 55, flow: [0, -0.3, -1], bend: 30, vary: 0.3, spin: 15, rng: R, cross: true });
  // gold crest ring around mane tuft
  const crest = catmull(manePts);
  b.sweep(crest, 0.008, GOLD, { sides: 4, caps: "flat" });

  // chest cloud beard
  for (const [x, y, z, r, k] of [
    [0, 1.0, 0.86, 0.1, 0],
    [0.11, 1.05, 0.82, 0.075, 1],
    [-0.11, 1.05, 0.82, 0.075, 2],
    [0, 0.9, 0.78, 0.07, 1],
    [0, 1.62, 1.1, 0.06, 0],
  ] as const) {
    b.part(new THREE.IcosahedronGeometry(r, 1), [CLOUD, CLOUD2, CLOUD3][k]!, { at: [x, y, z] });
  }

  // ---------- tail ----------
  const tailPath = catmull([
    [0, 1.22, -0.88],
    [0, 1.42, -1.18],
    [0, 1.38, -1.52],
    [0, 1.1, -1.72],
  ]);
  b.sweep(tailPath, [0.075, 0.045, 0.035], COAT, { sides: 8 });
  const tailEnd = tailPath.at(1);
  for (const [dx, dy, dz, r, k] of [
    [0, -0.02, -0.08, 0.1, 0],
    [0.09, 0.05, -0.02, 0.07, 1],
    [-0.09, 0.05, -0.02, 0.07, 2],
    [0, -0.12, -0.12, 0.07, 1],
  ] as const) {
    b.part(new THREE.IcosahedronGeometry(r, 1), [CLOUD, CLOUD2, CLOUD3][k]!, { at: [tailEnd.x + dx, tailEnd.y + dy, tailEnd.z + dz] });
  }
  const tailFrames = [0.15, 0.4, 0.65, 0.9, 1].map((t) => frame(tailPath.at(t), [0, 1, 0]));
  b.cards(tailFrames, FLAME, { size: [0.1, 0.24], lean: 140, flow: [0, 0, -1], bend: 25, vary: 0.25, spin: 30, rng: R, cross: true });
  for (const t of [0.3, 0.6]) {
    b.part(new THREE.TorusGeometry(0.06 - 0.02 * t, 0.01, 4, 10), GOLD, { at: tailPath.at(t), dir: tailPath.tangentAt(t), axis: "z" });
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const x = s * 0.19;
    // front
    b.capsule([x, 1.12, 0.5], [x, 0.84, 0.55], [0.14, 0.095], LEG, { sides: 8 });
    b.sweep(
      catmull([[x, 0.88, 0.55], [x, 0.6, 0.55], [x, 0.3, 0.53], [x, 0.14, 0.54]]),
      [0.095, 0.055, 0.04, 0.042],
      LEG,
      { sides: 8 },
    );
    // hind
    b.capsule([x * 1.1, 1.12, -0.72], [x * 1.1, 0.82, -0.56], [0.17, 0.11], LEG, { sides: 8 });
    b.sweep(
      catmull([[x * 1.1, 0.85, -0.58], [x, 0.58, -0.8], [x, 0.32, -0.74], [x, 0.14, -0.73]]),
      [0.1, 0.05, 0.04, 0.042],
      LEG,
      { sides: 8 },
    );
    for (const z of [0.54, -0.73]) {
      // cloven hooves
      for (const d of [-0.024, 0.024]) {
        b.frustumBox([x + d, 0.12, z], [x + d, 0, z + 0.0], [0.04, 0.07], [0.048, 0.11], { color: GOLD_D });
        b.frustumBox([x + d, 0.045, z + 0.02], [x + d, 0, z + 0.02], [0.044, 0.1], [0.046, 0.11], { color: HOOF });
      }
      b.part(new THREE.TorusGeometry(0.052, 0.012, 4, 10), GOLD, { at: [x, 0.15, z], rotation: [90, 0, 0] });
      // fetlock cloud puffs
      b.part(new THREE.IcosahedronGeometry(0.06, 1), CLOUD, { at: [x + s * 0.03, 0.2, z - 0.03] });
      b.part(new THREE.IcosahedronGeometry(0.045, 1), CLOUD2, { at: [x - s * 0.01, 0.23, z - 0.07] });
    }
    // knee/hock bands and flame wisps
    b.part(new THREE.TorusGeometry(0.065, 0.011, 4, 10), GOLD, { at: [x, 0.6, 0.55], rotation: [90, 0, 0] });
    b.part(new THREE.TorusGeometry(0.06, 0.011, 4, 10), GOLD, { at: [x, 0.5, -0.8], rotation: [90, 0, 0] });
    b.cards(
      [frame(V(x + s * 0.03, 0.56, 0.5), [s, 0.3, -0.5]), frame(V(x + s * 0.03, 0.5, -0.84), [s, 0.3, -0.5])],
      FLAME,
      { size: [0.09, 0.2], lean: 35, flow: [0, 1, -0.3], bend: 20, cross: true },
    );
    // shoulder & hip armour plates (gold scale lobes)
    b.part(new THREE.SphereGeometry(1, 8, 6), GOLD, { at: [s * 0.3, 1.3, 0.45], scale: [0.04, 0.1, 0.1], rotation: [0, 0, -s * 15] });
    b.part(new THREE.SphereGeometry(1, 8, 6), GOLD, { at: [s * 0.3, 1.3, -0.68], scale: [0.04, 0.11, 0.11], rotation: [0, 0, -s * 15] });
  }

  return b.root;
}
