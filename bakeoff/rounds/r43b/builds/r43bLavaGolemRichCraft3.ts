import * as THREE from "three";
import { createBuilder, frame, rng, catmull, limb, paint, cells, svg } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description: "Cel-shaded basalt-plate golem with glowing molten seams, rune heart, flame crest and lava fists.",
};

const LAVA = "#ff6a10";
const LAVA_HOT = "#ffc23a";
const LAVA_RED = "#ff3b0a";
const OBSIDIAN = cel("#262633");
const BASALT = cel("#454658");
const BASALT_L = cel("#6a6c84");
const CRACKED = paint((p, n) => {
  const c = cells(p, 0.2, 4);
  if (c.d2 - c.d1 < 0.05) return LAVA;
  return BASALT;
});
const CRACKED_D = paint((p, n) => {
  const c = cells(p, 0.16, 9);
  if (c.d2 - c.d1 < 0.045) return LAVA_RED;
  return OBSIDIAN;
});

const RUNE = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="none" stroke="#ff8a1c" stroke-width="7"/>
  <circle cx="50" cy="50" r="33" fill="none" stroke="#ffe08a" stroke-width="3"/>
  <path d="M50 18 L78 66 L22 66 Z" fill="none" stroke="#ffe08a" stroke-width="5" stroke-linejoin="round"/>
  <path d="M50 38 L50 80 M36 56 L64 56" stroke="#fff3c4" stroke-width="4" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="6" fill="#ffffff"/></svg>`,
  { size: 192 },
);
const EYES = svg(
  `<svg viewBox="0 0 100 32"><path d="M6 8 L42 16 L38 26 L10 20 Z" fill="#ffe27a" stroke="#ff7a1a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M94 8 L58 16 L62 26 L90 20 Z" fill="#ffe27a" stroke="#ff7a1a" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="30" cy="18" r="3" fill="#ffffff"/><circle cx="70" cy="18" r="3" fill="#ffffff"/></svg>`,
  { size: 192 },
);
const FLAME = svg(
  `<svg viewBox="0 0 32 64"><path d="M16 2 C22 18 30 28 28 44 C27 56 20 62 16 62 C10 62 4 56 4 44 C4 34 10 30 12 20 C14 26 14 28 16 2Z" fill="#ff7a1a"/>
  <path d="M16 20 C20 30 24 38 22 48 C21 56 18 58 16 58 C12 58 10 54 10 48 C10 40 14 34 16 20Z" fill="#ffc23a"/>
  <path d="M16 38 C18 44 19 48 17 54 C16 56 15 56 14 54 C13 48 14 44 16 38Z" fill="#fff3c4"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "lavaGolem" });
  const rand = rng(11);

  // ---------- skeleton
  const hips = b.joint("hips", { at: [0, 1.25, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.25, 0],
      [0, 1.7, 0],
      [0, 2.2, 0.02],
    ]),
    { parent: hips, names: ["spine1", "chest", "neckBase"], role: "spine" },
  );
  const chest = spine.joints[1];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.38, 0.03], dir: [0, 1, 0.25], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.55, 0.1], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.6, 0.1], dir: [0, 0, 1], role: "jaw" });

  // ---------- helpers
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const rock = (r: number) => new THREE.IcosahedronGeometry(r, 0);
  const P = (geo: THREE.BufferGeometry, color: any, bone: any, at: number[], o: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });
  const G = (geo: THREE.BufferGeometry, color: string, bone: any, at: number[], o: any = {}, s = 1.4) =>
    glow(P(geo, color, bone, at, o), s);

  // ---------- pelvis and torso
  P(box(0.95, 0.3, 0.55), BASALT, hips, [0, 1.3, 0]);
  G(box(1.0, 0.06, 0.6), LAVA, hips, [0, 1.47, 0]);
  G(rock(1), LAVA, chest, [0, 1.6, 0], { scale: [0.38, 0.3, 0.3] });
  for (const [y, w] of [[1.66, 0.85], [1.86, 0.95]] as [number, number][]) {
    for (const s of [1, -1]) P(box(w / 2 - 0.05, 0.17, 0.3), CRACKED_D, chest, [s * (w / 4 + 0.07), y, 0.2], { rotation: [-6, 0, s * 4] });
  }
  // chest: glowing core framed by plates
  G(rock(1), LAVA, chest, [0, 2.0, 0.04], { scale: [0.55, 0.55, 0.4] }, 1.5);
  for (const s of [1, -1]) {
    P(box(0.5, 0.62, 0.3), CRACKED, chest, [s * 0.4, 2.02, 0.26], { rotation: [-8, s * 6, s * 6] });
    P(box(0.3, 0.2, 0.2), BASALT_L, chest, [s * 0.4, 2.36, 0.3], { rotation: [-15, 0, s * 8] });
  }
  P(box(1.1, 0.8, 0.3), CRACKED_D, chest, [0, 2.0, -0.3]);
  P(box(1.6, 0.3, 0.75), BASALT, chest, [0, 2.4, 0]);
  G(box(1.62, 0.04, 0.77), LAVA, chest, [0, 2.24, 0]);
  glow(
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      bone: chest, at: [0, 2.0, 0.465], dir: [0, 0, 1], axis: "z", texture: RUNE,
    }),
    1.6,
  );
  // back vents
  const back: [number, number, number, number][] = [[0, 2.55, 0.9, 0.12], [-0.3, 2.2, 0.7, 0.1], [0.3, 2.2, 0.7, 0.1], [0, 1.9, 0.6, 0.09], [0.28, 1.75, 0.45, 0.07], [-0.28, 1.75, 0.45, 0.07]];
  for (const [x, y, l, r] of back) {
    P(rock(r * 1.8), BASALT_L, chest, [x, y, -0.42]);
    glow(b.spike([x, y, -0.42], [x * 0.8, 0.5, -0.9], l, r, { color: LAVA_HOT, bone: chest, sides: 5 }), 1.5);
  }

  // ---------- head
  P(box(0.52, 0.36, 0.44), BASALT, head, [0, 2.74, 0.12]);
  P(box(0.56, 0.1, 0.3), OBSIDIAN, head, [0, 2.9, 0.2], { rotation: [12, 0, 0] });
  P(box(0.58, 0.1, 0.12), CRACKED_D, head, [0, 2.86, 0.33], { rotation: [-8, 0, 0] });
  P(box(0.3, 0.12, 0.16), BASALT_L, head, [0, 2.68, 0.38]);
  glow(
    b.part(new THREE.PlaneGeometry(0.46, 0.15), "#ffffff", {
      bone: head, at: [0, 2.77, 0.336], dir: [0, 0, 1], axis: "z", texture: EYES,
    }),
    1.8,
  );
  P(box(0.46, 0.13, 0.4), BASALT, jaw, [0, 2.5, 0.14]);
  G(box(0.36, 0.04, 0.3), LAVA_HOT, jaw, [0, 2.58, 0.18]);
  for (let i = 0; i < 4; i++) P(box(0.05, 0.08, 0.04), BASALT_L, jaw, [-0.14 + i * 0.093, 2.6, 0.34]);
  for (const s of [1, -1]) {
    P(rock(0.1), BASALT_L, head, [s * 0.3, 2.72, 0.1]);
    b.spike([s * 0.2, 2.9, 0.0], [s * 0.6, 0.8, -0.4], 0.5, 0.075, { color: OBSIDIAN, bone: head, sides: 5 });
    glow(b.spike([s * 0.42, 3.25, -0.18], [s * 0.4, 0.9, -0.2], 0.16, 0.035, { color: LAVA_HOT, bone: head, sides: 5 }), 1.5);
  }
  P(box(0.6, 0.12, 0.5), OBSIDIAN, neck, [0, 2.42, 0.02]);
  // flame crest
  const flameFrames = [[0, 0.02], [-0.14, -0.05], [0.14, -0.05], [-0.07, -0.14], [0.07, -0.14]].map(([x, z]) => frame([x, 2.92, z], [0, 1, 0]));
  glow(b.cards(flameFrames, FLAME, { size: [0.22, 0.5], flow: [0, 0, 1], lean: 5, bend: 15, cross: true, vary: 0.3, rng: rand, bone: head }), 1.6);

  // ---------- legs
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const pts = limb([s * 0.36, 1.25, 0], [s * 0.4, 0.22, 0.02], [0.58, 0.52], [[0, 0, 1]]);
    const leg = b.chain(`leg${n}`, pts, { parent: hips, names: [`hip${n}`, `knee${n}`, `ankle${n}`], role: "leg" });
    b.sweep(leg, [0.27, 0.19], { color: BASALT, sides: 6 });
    const [hipJ, kneeJ, ankle] = [leg.joints[0], leg.joints[1], leg.tip!];
    P(rock(0.3), CRACKED, kneeJ, [pts[1].x, pts[1].y + 0.02, pts[1].z + 0.18], { scale: [1.1, 0.9, 0.8] });
    G(new THREE.TorusGeometry(0.22, 0.03, 5, 8), LAVA, kneeJ, [pts[1].x, pts[1].y - 0.12, pts[1].z], { rotation: [90, 0, 0] });
    P(box(0.42, 0.34, 0.4), BASALT_L, hipJ, [s * 0.4, 1.0, 0.1], { rotation: [-6, 0, s * 4] });
    P(box(0.4, 0.26, 0.36), OBSIDIAN, kneeJ, [pts[1].x, pts[1].y - 0.3, pts[1].z - 0.02]);
    G(box(0.2, 0.03, 0.4), LAVA, hipJ, [s * 0.4, 1.17, 0.12]);
    P(box(0.46, 0.2, 0.62), CRACKED_D, ankle, [s * 0.4, 0.1, 0.12]);
    P(box(0.4, 0.14, 0.2), BASALT_L, ankle, [s * 0.4, 0.07, 0.46]);
    for (let i = 0; i < 3; i++) P(rock(0.07), OBSIDIAN, ankle, [s * (0.4 + (i - 1) * 0.14), 0.08, 0.58]);
    G(box(0.26, 0.04, 0.1), LAVA, ankle, [s * 0.4, 0.21, -0.08]);
  }

  // ---------- arms
  for (const s of [1, -1]) {
    const n = s > 0 ? "L" : "R";
    const sh = [s * 0.88, 2.25, 0];
    const wr = [s * 1.3, 0.9, 0.2];
    const pts = limb(sh, wr, [0.82, 0.8], [[0, 0, -1]]);
    const arm = b.chain(`arm${n}`, pts, { parent: chest, names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`], role: "arm" });
    b.sweep(arm, [0.24, 0.2], { color: BASALT, sides: 6 });
    const sj = arm.joints[0], ej = arm.joints[1], wj = arm.tip!;
    // pauldron
    P(rock(0.42), CRACKED_D, sj, [s * 0.98, 2.42, 0], { scale: [1.15, 0.8, 1] });
    P(rock(0.3), BASALT_L, sj, [s * 1.12, 2.62, 0], { scale: [1, 0.8, 0.9] });
    G(new THREE.TorusGeometry(0.3, 0.035, 5, 10), LAVA, sj, [s * 0.92, 2.2, 0], { dir: [s, 0, 0], axis: "z" });
    for (let i = 0; i < 3; i++) {
      b.spike([s * (0.9 + i * 0.12), 2.66 - i * 0.04, (i - 1) * 0.2], [s * 0.4, 1, 0], 0.32 - i * 0.04, 0.07, { color: OBSIDIAN, bone: sj, sides: 5 });
    }
    // forearm
    const mid = [(pts[1].x + pts[2].x) / 2, (pts[1].y + pts[2].y) / 2, (pts[1].z + pts[2].z) / 2];
    P(box(0.46, 0.5, 0.46), CRACKED_D, ej, mid, { dir: pts[2].clone().sub(pts[1]) });
    G(new THREE.TorusGeometry(0.24, 0.03, 5, 8), LAVA, ej, [pts[1].x, pts[1].y - 0.03, pts[1].z], { rotation: [90, 0, 0] });
    P(rock(0.2), BASALT_L, ej, [pts[1].x, pts[1].y + 0.02, pts[1].z - 0.2]);
    // fist
    P(rock(0.27), BASALT, wj, [wr[0], wr[1] - 0.1, wr[2]], { scale: [1.15, 1, 1.05] });
    G(box(0.34, 0.05, 0.3), LAVA, wj, [wr[0], wr[1] - 0.18, wr[2] + 0.08]);
    for (let i = 0; i < 3; i++) {
      const fx = wr[0] + (i - 1) * 0.12;
      const f = b.joint(`finger${n}${i + 1}`, { parent: wj, at: [fx, wr[1] - 0.25, wr[2] + 0.12], dir: [0, -1, 0.3], role: "digit" });
      P(box(0.1, 0.24, 0.1), BASALT_L, f, [fx, wr[1] - 0.37, wr[2] + 0.15], { rotation: [-15, 0, 0] });
      G(box(0.07, 0.05, 0.07), LAVA_HOT, f, [fx, wr[1] - 0.5, wr[2] + 0.18]);
    }
    G(new THREE.SphereGeometry(0.035, 5, 4), LAVA, wj, [wr[0] + s * 0.04, wr[1] - 0.58, wr[2] + 0.1], {}, 1.6);
  }

  return b.root;
}
