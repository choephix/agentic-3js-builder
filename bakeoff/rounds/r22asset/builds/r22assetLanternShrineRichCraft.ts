// Roadside shrine: vermilion torii with shimenawa, glowing stone lanterns, fox guardians, a small hokora with
// offerings, a purification basin, an ema rack, paper lantern strings, a sakura and bamboo. Genshin-style cel shading.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, patches, stripes } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Roadside Lantern Shrine",
  description:
    "A roadside shrine with a vermilion torii, glowing stone lanterns, fox guardians, a hokora with offerings, a water basin, ema rack, paper lanterns, sakura and bamboo.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type Col = string | Paint;

export default function build() {
  const b = createBuilder({ name: "lanternShrine", detail: 0.8 });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const G = 0.16;

  // ---- helpers
  const box = (w: number, h: number, d: number, c: Col, p: V3, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: p, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: Col, p: V3, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: p, ...o });
  const ball = (r: number, c: Col, p: V3, sc: V3 = [1, 1, 1], seg = 8, o: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(3, Math.round(seg * 0.7))), c, { at: p, scale: sc, ...o });
  const torus = (r: number, t: number, c: Col, p: V3, rot: V3 = [90, 0, 0], seg = 10) =>
    b.part(new THREE.TorusGeometry(r, t, 4, seg), c, { at: p, rotation: rot });
  const plane = (tex: THREE.Texture, w: number, h: number, p: V3, dir: V3) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: p, dir, axis: "z", texture: tex });

  // ---- palette (cel paints)
  const STONE = cel(mottle("#bdb8ab", "#a29e93", { size: 0.14, seed: 2 }));
  const MOSS = cel(
    mottle(mottle("#bdb8ab", "#a29e93", { size: 0.14, seed: 2 }), "#72a05a", { size: 0.3, seed: 6, contrast: 1.4 }),
  );
  const STONE_DK = cel("#8c887e");
  const SLAB = cel(patches("#78746b", ["#bab5a8", "#c8c3b4", "#aeaa9d"], { size: 0.4, gap: 0.08, seed: 4 }));
  const RED = cel("#dc3b2a");
  const GOLD = cel("#f6c453", "#d9922b");
  const BLACK = cel("#2b2431");
  const WOOD = cel(grain("#b57a45", "#9a6236", { size: 0.03, axis: "y" }));
  const WOOD_DK = cel(grain("#8a5530", "#6f4220", { size: 0.03, axis: "y" }));
  const PLASTER = cel("#f4e8cf");
  const ROOF = cel(stripes("#3a6b86", "#2c5068", { size: 0.1, axis: "y", width: 0.4, wobble: 0.1 }));
  const STRAW = cel("#e3c987", "#c9a85f");
  const WHITE = cel("#fbf6ea");
  const ORANGE = cel("#ff9a2e");
  const PINK = cel(mottle("#f7b4cc", "#ffd2e2", { size: 0.5, seed: 8 }));
  const BARK = cel(grain("#6b4a35", "#4e3425", { size: 0.04 }));
  const BAMBOO = cel("#8fc25a");
  const BAMBOO_DK = cel("#5f8f3c");
  const GROUND = cel(mottle("#86c25a", "#6aab4f", { size: 0.6, seed: 9 }));
  const GRAVEL = cel(mottle("#e2d9bd", "#c9bf9f", { size: 0.07, seed: 3 }));
  const IRON = cel("#4a4658");
  const BLUE = cel("#4a7fc4");
  const LEAF = cel("#4fa04a");
  const ROPE = stripes("#fbf6ea", "#d93a2b", { size: 0.06, axis: "y", width: 0.5, wobble: 0 });

  // ---- textures
  const SHIDE = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 0 L22 8 L6 18 L22 28 L6 38 L22 48 L12 62 L2 48 L18 38 L2 28 L18 18 L2 8Z" fill="#ffffff" stroke="#c9c2b0" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 48 Q12 24 4 4 Q18 20 20 48Z" fill="#6fb552"/><path d="M16 48 Q18 22 16 0 Q24 22 24 48Z" fill="#8fd05a"/><path d="M14 48 Q22 28 30 12 Q26 34 22 48Z" fill="#5aa046"/></svg>`,
    { size: 96 },
  );
  const PETAL = svg(
    `<svg viewBox="0 0 32 32"><path d="M16 30 Q2 18 6 4 Q11 8 16 2 Q21 8 26 4 Q30 18 16 30Z" fill="#ffc3da"/><path d="M16 28 Q16 16 16 6" stroke="#f08db0" stroke-width="2" fill="none"/></svg>`,
    { size: 64 },
  );
  const BLADE = svg(
    `<svg viewBox="0 0 24 64"><path d="M12 64 Q2 36 12 0 Q22 36 12 64Z" fill="#6fae44"/><path d="M12 62 L12 6" stroke="#4f8a32" stroke-width="2"/></svg>`,
    { size: 96 },
  );
  const CREST = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="29" fill="#f6c453"/><circle cx="32" cy="32" r="23" fill="#b02a2a"/><path d="M32 12 l6 14 14 2 -10 10 3 15 -13 -8 -13 8 3 -15 -10 -10 14 -2z" fill="#fff3d6"/></svg>`,
    { size: 128 },
  );
  const PLAQUE = svg(
    `<svg viewBox="0 0 100 76"><rect width="100" height="76" fill="#1f2f52"/><rect x="4" y="4" width="92" height="68" fill="none" stroke="#f6c453" stroke-width="3"/><circle cx="50" cy="38" r="17" fill="#f6c453"/><circle cx="50" cy="38" r="10" fill="#d93a2b"/><path d="M12 38 H26 M74 38 H88 M50 8 V18 M50 58 V68" stroke="#f6c453" stroke-width="4"/><path d="M18 22 L28 26 M82 22 L72 26 M18 54 L28 50 M82 54 L72 50" stroke="#f6c453" stroke-width="3"/></svg>`,
    { size: 256 },
  );
  const LATTICE = svg(
    `<svg viewBox="0 0 52 78"><rect width="52" height="78" fill="#c9302a"/><rect x="2" y="2" width="48" height="74" fill="none" stroke="#f6c453" stroke-width="2.5"/><path d="M2 2 L50 76 M50 2 L2 76 M26 2 L50 39 L26 76 L2 39Z" stroke="#f6c453" stroke-width="2" fill="none"/><circle cx="26" cy="39" r="7" fill="#f6c453"/><circle cx="26" cy="39" r="3.5" fill="#c9302a"/></svg>`,
    { size: 256 },
  );
  const EMA_FOX = svg(
    `<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="6" fill="#f6e7c8"/><path d="M8 10 L22 22 L38 22 L52 10 L50 36 Q30 58 10 36Z" fill="#ef7a2a"/><path d="M14 38 Q30 56 46 38 Q30 44 14 38Z" fill="#ffffff"/><path d="M17 31 q4 -4 8 0 M35 31 q4 -4 8 0" stroke="#22112f" stroke-width="3" fill="none"/><circle cx="30" cy="42" r="2.5" fill="#22112f"/></svg>`,
    { size: 128 },
  );
  const EMA_MOON = svg(
    `<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="6" fill="#2c3f7a"/><circle cx="28" cy="30" r="16" fill="#ffd25a"/><circle cx="36" cy="26" r="14" fill="#2c3f7a"/><circle cx="48" cy="12" r="2.5" fill="#fff3d6"/><circle cx="12" cy="48" r="2" fill="#fff3d6"/><circle cx="50" cy="46" r="2" fill="#fff3d6"/></svg>`,
    { size: 128 },
  );
  const EMA_BLOOM = svg(
    `<svg viewBox="0 0 60 60"><rect width="60" height="60" rx="6" fill="#f6e7c8"/><g fill="#ff9fc0"><circle cx="30" cy="16" r="9"/><circle cx="44" cy="27" r="9"/><circle cx="39" cy="43" r="9"/><circle cx="21" cy="43" r="9"/><circle cx="16" cy="27" r="9"/></g><circle cx="30" cy="31" r="6" fill="#ffd25a"/></svg>`,
    { size: 128 },
  );

  // ---- ground and path
  cyl(4.2, 4.35, 0.16, 14, GROUND, [0, 0.08, 0]);
  box(1.3, 0.02, 5.2, GRAVEL, [0, G, 1.0]);
  for (let i = 0; i < 9; i++) {
    const z = 3.4 - i * 0.58;
    box(0.78, 0.06, 0.5, SLAB, [(R() - 0.5) * 0.14, G + 0.02, z], { rotation: [0, (R() - 0.5) * 8, 0] });
  }
  for (const s of [1, -1])
    for (let i = 0; i < 8; i++)
      box(0.1, 0.07, 0.4, STONE_DK, [s * 0.68, G + 0.02, 3.3 - i * 0.62], { rotation: [0, (R() - 0.5) * 10, 0] });

  // ---- torii
  const TZ = 1.0;
  for (const s of [1, -1]) {
    b.rod([s, G - 0.02, TZ], [s, 3.02, TZ], [0.16, 0.12], { color: RED, sides: 10 });
    cyl(0.21, 0.23, 0.3, 10, BLACK, [s, G + 0.15, TZ]);
    cyl(0.215, 0.215, 0.05, 10, GOLD, [s, G + 0.32, TZ]);
    cyl(0.15, 0.15, 0.05, 10, GOLD, [s, 2.72, TZ]);
    cyl(0.14, 0.14, 0.05, 10, GOLD, [s, 2.38, TZ]);
    box(0.06, 0.2, 0.2, GOLD, [s * 1.46, 2.55, TZ]);
  }
  box(2.9, 0.13, 0.11, RED, [0, 2.55, TZ]);
  box(0.56, 0.44, 0.1, GOLD, [0, 2.82, TZ]);
  box(0.48, 0.36, 0.13, BLACK, [0, 2.82, TZ]);
  plane(PLAQUE, 0.46, 0.35, [0, 2.82, TZ + 0.066], [0, 0, 1]);
  plane(PLAQUE, 0.46, 0.35, [0, 2.82, TZ - 0.066], [0, 0, -1]);
  b.extrude(
    [
      [-1.8, 0.12],
      [-1.35, 0],
      [1.35, 0],
      [1.8, 0.12],
      [1.8, 0.26],
      [1.35, 0.16],
      [-1.35, 0.16],
      [-1.8, 0.26],
    ],
    { at: [0, 3.0, TZ], x: [1, 0, 0], thickness: 0.3, bevel: 0.015, color: RED },
  );
  b.extrude(
    [
      [-1.9, 0.14],
      [-1.4, 0.02],
      [1.4, 0.02],
      [1.9, 0.14],
      [1.9, 0.22],
      [1.4, 0.1],
      [-1.4, 0.1],
      [-1.9, 0.22],
    ],
    { at: [0, 3.16, TZ], x: [1, 0, 0], thickness: 0.36, bevel: 0.015, color: BLACK },
  );
  for (const s of [1, -1]) box(0.04, 0.12, 0.38, GOLD, [s * 1.9, 3.34, TZ]);

  // shimenawa rope with paper streamers
  const rope = catmull([
    [-1.0, 2.44, 1.2],
    [-0.5, 2.3, 1.2],
    [0, 2.27, 1.2],
    [0.5, 2.3, 1.2],
    [1.0, 2.44, 1.2],
  ]);
  b.sweep(rope, 0.04, { color: STRAW, sides: 6 });
  for (const s of [1, -1]) ball(0.06, STRAW, [s * 1.0, 2.44, 1.2], [1, 1.3, 1], 6);
  b.cards(
    [0.14, 0.3, 0.46, 0.62, 0.78, 0.92].map((t) => frame(rope.at(t), [0, 1, 0])),
    SHIDE,
    { size: [0.1, 0.3], lean: 180, flow: [0, 0, 1], color: "#ffffff" },
  );

  // paper lantern strings
  const chochin = (x: number, y: number, z: number) => {
    glow(b.part(new THREE.SphereGeometry(0.16, 8, 6), "#f0503a", { at: [x, y, z], scale: [1, 1.2, 1] }), 1.2);
    cyl(0.07, 0.09, 0.04, 8, BLACK, [x, y + 0.2, z]);
    cyl(0.08, 0.06, 0.04, 8, BLACK, [x, y - 0.2, z]);
    torus(0.163, 0.008, GOLD, [x, y + 0.05, z]);
    torus(0.163, 0.008, GOLD, [x, y - 0.05, z]);
    b.spike([x, y - 0.22, z], [0, -1, 0], 0.14, 0.025, { color: GOLD });
    b.rod([x, y + 0.2, z], [x, y + 0.28, z], 0.01, { color: BLACK });
  };
  for (const s of [1, -1]) {
    const line = catmull([
      [s * 1.12, 2.46, TZ],
      [s * 1.6, 2.36, TZ],
      [s * 2.2, 2.32, TZ],
      [s * 2.8, 2.4, TZ],
      [s * 3.18, 2.62, TZ],
    ]);
    b.sweep(line, 0.02, { color: IRON, sides: 4 });
    for (const t of [0.2, 0.4, 0.6, 0.8]) {
      const p = line.at(t);
      chochin(p.x, p.y - 0.3, p.z);
    }
    b.rod([s * 3.2, G, TZ], [s * 3.2, 2.7, TZ], [0.07, 0.05], { color: WOOD_DK, sides: 6 });
    ball(0.07, GOLD, [s * 3.2, 2.74, TZ], [1, 1, 1], 6);
    cyl(0.16, 0.2, 0.2, 8, STONE, [s * 3.2, G + 0.1, TZ]);
  }

  // ---- stone lanterns
  const toro = (x: number, z: number) => {
    cyl(0.3, 0.34, 0.1, 6, MOSS, [x, G + 0.05, z]);
    cyl(0.1, 0.12, 0.5, 8, MOSS, [x, G + 0.35, z]);
    cyl(0.24, 0.2, 0.1, 6, STONE, [x, G + 0.65, z]);
    glow(box(0.22, 0.26, 0.22, "#ffcf6a", [x, G + 0.83, z]), 1.4);
    for (const dx of [1, -1])
      for (const dz of [1, -1]) box(0.045, 0.28, 0.045, STONE, [x + dx * 0.12, G + 0.83, z + dz * 0.12]);
    box(0.34, 0.05, 0.34, STONE_DK, [x, G + 0.99, z]);
    cyl(0.4, 0.44, 0.05, 6, STONE, [x, G + 1.03, z]);
    b.part(new THREE.ConeGeometry(0.44, 0.3, 6), STONE, { at: [x, G + 1.2, z] });
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3;
      ball(0.035, STONE, [x + Math.sin(a) * 0.44, G + 1.05, z + Math.cos(a) * 0.44], [1, 1, 1], 5);
    }
    ball(0.07, STONE, [x, G + 1.38, z], [1, 1.2, 1], 6);
    b.spike([x, G + 1.42, z], [0, 1, 0], 0.1, 0.03, { color: GOLD });
    torus(0.1, 0.012, GOLD, [x, G + 0.58, z], [90, 0, 0], 8);
  };
  toro(1.5, 2.4);
  toro(-1.5, 2.4);

  // ---- hokora
  const HZ = -2.0;
  const Y0 = G + 0.28;
  box(2.0, 0.2, 1.7, STONE, [0, G + 0.1, -1.9]);
  box(0.95, 0.14, 0.26, STONE, [0, G + 0.07, -1.04]);
  box(1.0, 0.08, 0.3, STONE_DK, [0, G + 0.04, -0.85]);
  box(1.5, 0.08, 1.3, WOOD, [0, G + 0.24, -1.9]);
  for (const sx of [1, -1]) {
    for (const pz of [-1.5, -2.45]) box(0.1, 0.9, 0.1, RED, [sx * 0.6, Y0 + 0.45, pz]);
    box(0.05, 0.8, 0.9, PLASTER, [sx * 0.6, Y0 + 0.42, -1.97]);
    box(0.12, 0.08, 1.1, RED, [sx * 0.6, Y0 + 0.86, -1.97]);
    box(0.52, 0.78, 0.05, RED, [sx * 0.27, Y0 + 0.42, -1.5]);
    plane(LATTICE, 0.48, 0.72, [sx * 0.27, Y0 + 0.42, -1.5 + 0.03], [0, 0, 1]);
    ball(0.025, GOLD, [sx * 0.04, Y0 + 0.4, -1.47], [1, 1, 1], 5);
  }
  box(1.2, 0.8, 0.05, PLASTER, [0, Y0 + 0.42, -2.45]);
  box(1.3, 0.08, 0.12, RED, [0, Y0 + 0.86, -1.5]);
  box(1.3, 0.08, 0.12, RED, [0, Y0 + 0.86, -2.45]);
  box(1.34, 0.03, 0.14, GOLD, [0, Y0 + 0.92, -1.5]);
  for (const sx of [1, -1]) box(0.03, 0.12, 0.16, GOLD, [sx * 0.68, Y0 + 0.86, -1.5]);
  b.part(new THREE.ConeGeometry(1.41, 0.75, 4), ROOF, { at: [0, Y0 + 1.325, HZ], rotation: [0, 45, 0] });
  for (const z of [-1.0, -3.0]) box(2.0, 0.07, 0.07, GOLD, [0, Y0 + 0.97, z]);
  for (const x of [1, -1]) box(0.07, 0.07, 2.0, GOLD, [x, Y0 + 0.97, HZ]);
  for (const sx of [1, -1])
    for (const sz of [1, -1]) {
      b.rod([0, Y0 + 1.7, HZ], [sx, Y0 + 0.97, HZ + sz], 0.03, { color: GOLD, sides: 5 });
      b.spike([sx, Y0 + 0.97, HZ + sz], [sx * 0.5, 0.7, sz * 0.5], 0.2, 0.05, { color: GOLD });
    }
  ball(0.07, GOLD, [0, Y0 + 1.74, HZ], [1, 1, 1], 6);
  b.spike([0, Y0 + 1.74, HZ], [0, 1, 0], 0.2, 0.04, { color: GOLD });
  // bell and rope
  for (const sx of [1, -1]) b.rod([sx * 0.4, Y0 + 0.9, -1.2], [sx * 0.4, Y0 + 0.9, -1.5], 0.025, { color: WOOD_DK, sides: 5 });
  b.rod([-0.4, Y0 + 0.9, -1.2], [0.4, Y0 + 0.9, -1.2], 0.03, { color: WOOD_DK, sides: 5 });
  b.rod([0, Y0 + 0.88, -1.2], [0, Y0 + 0.1, -1.2], 0.028, { color: ROPE, sides: 6 });
  ball(0.09, GOLD, [0, Y0 + 0.72, -1.2], [1, 1, 1], 8);
  box(0.12, 0.012, 0.01, BLACK, [0, Y0 + 0.69, -1.11]);
  b.spike([0, Y0 + 0.12, -1.2], [0, -1, 0], 0.1, 0.035, { color: RED });

  // offering box
  box(0.8, 0.38, 0.42, WOOD_DK, [0, G + 0.19, -0.55]);
  box(0.84, 0.03, 0.46, GOLD, [0, G + 0.33, -0.55]);
  for (let i = 0; i < 7; i++) box(0.03, 0.03, 0.4, IRON, [-0.33 + i * 0.11, G + 0.4, -0.55]);
  for (const z of [-0.77, -0.33]) box(0.84, 0.05, 0.04, WOOD, [0, G + 0.4, z]);
  for (const x of [-0.41, 0.41]) box(0.04, 0.05, 0.46, WOOD, [x, G + 0.4, -0.55]);
  plane(CREST, 0.22, 0.22, [0, G + 0.18, -0.335], [0, 0, 1]);
  for (let i = 0; i < 6; i++)
    cyl(0.03, 0.03, 0.008, 6, "#ffd25a", [-0.28 + R() * 0.56, G + 0.418, -0.65 + R() * 0.2], { rotation: [(R() - 0.5) * 20, 0, 0] });

  // fox guardians
  for (const s of [1, -1]) {
    const x = s * 1.05;
    const z = -0.95;
    const B = G + 0.4;
    box(0.46, 0.34, 0.46, STONE, [x, G + 0.17, z]);
    box(0.52, 0.06, 0.52, STONE_DK, [x, G + 0.37, z]);
    ball(0.2, MOSS, [x, B + 0.26, z - 0.03], [0.9, 1.25, 0.9], 8);
    for (const e of [1, -1]) {
      ball(0.14, STONE, [x + e * 0.13, B + 0.13, z - 0.08], [0.7, 0.9, 1.2], 7);
      cyl(0.045, 0.055, 0.3, 6, STONE, [x + e * 0.07, B + 0.15, z + 0.12]);
      ball(0.06, STONE, [x + e * 0.07, B + 0.03, z + 0.15], [0.9, 0.5, 1.3], 6);
      b.part(new THREE.ConeGeometry(0.06, 0.2, 4), STONE, { at: [x + e * 0.075, B + 0.76, z + 0.03], dir: [e * 0.2, 1, -0.1] });
      b.part(new THREE.ConeGeometry(0.03, 0.12, 4), RED, { at: [x + e * 0.075, B + 0.75, z + 0.045], dir: [e * 0.2, 1, -0.1] });
      box(0.03, 0.012, 0.01, INK, [x + e * 0.06, B + 0.66, z + 0.15]);
    }
    ball(0.13, STONE, [x, B + 0.62, z + 0.05], [1, 1, 1], 8);
    b.part(new THREE.ConeGeometry(0.065, 0.16, 6), STONE, { at: [x, B + 0.58, z + 0.17], dir: [0, -0.15, 1] });
    ball(0.02, INK, [x, B + 0.58, z + 0.25], [1, 1, 1], 4);
    b.sweep(
      catmull([
        [x, B + 0.12, z - 0.18],
        [x, B + 0.1, z - 0.4],
        [x + s * 0.15, B + 0.3, z - 0.45],
        [x + s * 0.12, B + 0.55, z - 0.38],
      ]),
      [0.06, 0.11, 0.09, 0.03],
      { color: MOSS, sides: 6, caps: { end: "point" } },
    );
    const neck: V3[] = [];
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      neck.push([x + Math.sin(a) * 0.14, B + 0.48, z + 0.03 + Math.cos(a) * 0.14]);
    }
    b.sweep(catmull(neck, { closed: true }), 0.028, { color: RED, sides: 5 });
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0, -0.15],
      ],
      { at: [x, B + 0.48, z + 0.17], x: [1, 0, 0], thickness: 0.015, color: RED },
    );
    ball(0.04, GOLD, [x, B + 0.44, z + 0.19], [1, 1, 1], 6);
  }

  // ---- offering table
  const TX = 1.95;
  const TZ2 = -1.0;
  const T = G + 0.365;
  box(0.9, 0.05, 0.5, WOOD, [TX, G + 0.34, TZ2]);
  for (const dx of [1, -1])
    for (const dz of [1, -1]) box(0.06, 0.32, 0.06, WOOD_DK, [TX + dx * 0.4, G + 0.16, TZ2 + dz * 0.2]);
  // sanbo with oranges
  box(0.14, 0.1, 0.14, WOOD_DK, [TX - 0.3, T + 0.05, TZ2]);
  cyl(0.17, 0.13, 0.03, 10, WOOD, [TX - 0.3, T + 0.115, TZ2]);
  for (const [dx, dz] of [
    [0.07, 0.04],
    [-0.07, 0.05],
    [0, -0.08],
  ])
    ball(0.055, ORANGE, [TX - 0.3 + dx, T + 0.18, TZ2 + dz], [1, 0.9, 1], 6);
  ball(0.055, ORANGE, [TX - 0.3, T + 0.25, TZ2], [1, 0.9, 1], 6);
  b.spike([TX - 0.3, T + 0.3, TZ2], [0.3, 1, 0], 0.08, 0.025, { color: LEAF });
  // kagami mochi
  box(0.14, 0.1, 0.14, WOOD_DK, [TX, T + 0.05, TZ2]);
  cyl(0.17, 0.13, 0.03, 10, WOOD, [TX, T + 0.115, TZ2]);
  ball(0.095, WHITE, [TX, T + 0.17, TZ2], [1, 0.6, 1], 8);
  ball(0.065, WHITE, [TX, T + 0.225, TZ2], [1, 0.65, 1], 8);
  ball(0.04, ORANGE, [TX, T + 0.27, TZ2], [1, 0.9, 1], 6);
  b.spike([TX, T + 0.29, TZ2], [0, 1, 0], 0.07, 0.02, { color: LEAF });
  // rice bowl
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.09, 0.08],
      [0.082, 0.08],
      [0, 0.045],
    ],
    { at: [TX + 0.3, T, TZ2 + 0.1], color: WHITE, segments: 8 },
  );
  ball(0.07, WHITE, [TX + 0.3, T + 0.055, TZ2 + 0.1], [1, 0.6, 1], 6);
  // tokkuri and cups
  b.lathe(
    [
      [0, 0],
      [0.045, 0],
      [0.055, 0.06],
      [0.04, 0.11],
      [0.02, 0.14],
      [0.025, 0.17],
      [0, 0.17],
    ],
    { at: [TX + 0.3, T, TZ2 - 0.12], color: BLUE, segments: 8 },
  );
  for (const dx of [-0.1, -0.2]) cyl(0.03, 0.022, 0.035, 8, WHITE, [TX + 0.3 + dx, T + 0.018, TZ2 - 0.15]);
  // incense burner
  cyl(0.07, 0.06, 0.07, 8, IRON, [TX - 0.05, T + 0.035, TZ2 + 0.2]);
  cyl(0.055, 0.055, 0.01, 8, STONE, [TX - 0.05, T + 0.072, TZ2 + 0.2]);
  for (const dx of [-0.02, 0, 0.02]) {
    b.rod([TX - 0.05 + dx, T + 0.07, TZ2 + 0.2], [TX - 0.05 + dx * 2, T + 0.2, TZ2 + 0.2], 0.005, { color: RED, sides: 4 });
    glow(ball(0.008, "#ff7a3a", [TX - 0.05 + dx * 2, T + 0.2, TZ2 + 0.2], [1, 1, 1], 4), 1.5);
  }
  // flower vase
  b.lathe(
    [
      [0, 0],
      [0.04, 0],
      [0.05, 0.05],
      [0.03, 0.1],
      [0.035, 0.12],
      [0, 0.12],
    ],
    { at: [TX + 0.1, T, TZ2 + 0.18], color: BLUE, segments: 8 },
  );
  for (const [dx, h, c] of [
    [-0.03, 0.26, RED],
    [0.02, 0.3, WHITE],
    [0.04, 0.23, PINK],
  ] as const) {
    b.rod([TX + 0.1, T + 0.1, TZ2 + 0.18], [TX + 0.1 + dx, T + h, TZ2 + 0.18], 0.006, { color: LEAF, sides: 4 });
    ball(0.035, c, [TX + 0.1 + dx, T + h + 0.02, TZ2 + 0.18], [1, 0.8, 1], 6);
  }

  // ---- sake barrels
  const barrel = (x: number, y: number, z: number) => {
    b.lathe(
      [
        [0, 0],
        [0.28, 0],
        [0.32, 0.15],
        [0.33, 0.3],
        [0.32, 0.45],
        [0.28, 0.6],
        [0, 0.6],
      ],
      { at: [x, y, z], color: WOOD, segments: 10 },
    );
    for (const h of [0.1, 0.5]) torus(0.315, 0.016, IRON, [x, y + h, z], [90, 0, 0], 12);
    torus(0.335, 0.025, STRAW, [x, y + 0.3, z], [90, 0, 0], 12);
    plane(CREST, 0.2, 0.2, [x, y + 0.3, z + 0.37], [0, 0, 1]);
    cyl(0.1, 0.1, 0.02, 8, RED, [x, y + 0.61, z]);
  };
  barrel(-1.9, G, -1.0);
  barrel(-2.56, G, -1.0);
  barrel(-2.23, G + 0.58, -1.0);
  box(0.3, 0.02, 0.2, WHITE, [-2.23, G + 0.3, -0.58]);

  // ---- water basin
  const BX = 3.0;
  const BZ = -0.8;
  cyl(0.4, 0.44, 0.5, 8, MOSS, [BX, G + 0.25, BZ]);
  torus(0.38, 0.04, STONE, [BX, G + 0.52, BZ], [90, 0, 0], 8);
  cyl(0.35, 0.35, 0.02, 10, "#8fe3ee", [BX, G + 0.5, BZ]);
  b.rod([3.55, G, BZ], [3.55, G + 1.1, BZ], 0.045, { color: BAMBOO, sides: 6 });
  b.rod([3.6, G + 1.1, BZ], [3.15, G + 0.98, BZ], 0.04, { color: BAMBOO, sides: 6 });
  b.rod([3.15, G + 0.98, BZ], [3.15, G + 0.52, BZ], 0.012, { color: "#8fe3ee", sides: 4 });
  cyl(0.06, 0.05, 0.08, 8, BAMBOO, [2.75, G + 0.55, -0.7]);
  b.rod([2.75, G + 0.58, -0.7], [2.45, G + 0.74, -0.45], 0.012, { color: BAMBOO_DK, sides: 4 });
  for (let k = 0; k < 4; k++) box(0.14, 0.1, 0.14, STONE_DK, [BX - 0.55 + k * 0.1, G + 0.05, BZ + 0.55 - k * 0.12]);

  // ---- ema rack
  const EX = -3.0;
  const EZ = -0.3;
  for (const s of [1, -1]) b.rod([EX + s * 0.7, G, EZ], [EX + s * 0.7, G + 1.7, EZ], [0.06, 0.05], { color: WOOD_DK, sides: 6 });
  b.rod([EX - 0.75, G + 1.55, EZ], [EX + 0.75, G + 1.55, EZ], 0.04, { color: WOOD_DK, sides: 6 });
  box(0.95, 0.04, 0.55, ROOF, [EX - 0.34, G + 1.8, EZ], { rotation: [0, 0, 18] });
  box(0.95, 0.04, 0.55, ROOF, [EX + 0.34, G + 1.8, EZ], { rotation: [0, 0, -18] });
  b.rod([EX - 0.05, G + 1.9, EZ], [EX + 0.05, G + 1.9, EZ], 0.03, { color: GOLD, sides: 5 });
  const emas = [EMA_FOX, EMA_MOON, EMA_BLOOM];
  for (let i = 0; i < 7; i++) {
    const x = EX - 0.54 + i * 0.18;
    const y = G + 1.12 + (i % 2) * 0.06;
    b.rod([x, G + 1.55, EZ], [x, y + 0.24, EZ], 0.007, { color: STRAW, sides: 4 });
    b.extrude(
      [
        [-0.075, 0],
        [0.075, 0],
        [0.075, 0.17],
        [0, 0.24],
        [-0.075, 0.17],
      ],
      { at: [x, y, EZ], x: [1, 0, 0], thickness: 0.018, color: WOOD },
    );
    plane(emas[i % 3], 0.13, 0.13, [x, y + 0.09, EZ + 0.011], [0, 0, 1]);
  }

  // ---- sakura
  b.sweep(
    catmull([
      [-2.0, G - 0.05, -3.0],
      [-2.05, G + 1.0, -3.0],
      [-1.7, G + 1.9, -3.1],
      [-1.5, G + 2.8, -3.0],
    ]),
    [0.3, 0.22, 0.16, 0.1],
    { color: BARK, sides: 7 },
  );
  b.sweep(
    catmull([
      [-2.05, G + 1.2, -3.0],
      [-2.8, G + 2.0, -2.9],
      [-3.3, G + 2.9, -2.9],
    ]),
    [0.1, 0.04],
    { color: BARK, sides: 6 },
  );
  b.sweep(
    catmull([
      [-1.7, G + 1.9, -3.1],
      [-1.0, G + 2.6, -3.0],
      [-0.5, G + 3.3, -3.2],
    ]),
    [0.09, 0.035],
    { color: BARK, sides: 6 },
  );
  const canopy = (
    [
      [-1.5, 3.4, -3.0, 1.1],
      [-2.5, 3.2, -2.9, 0.9],
      [-3.2, 3.1, -2.9, 0.8],
      [-0.8, 3.5, -3.2, 0.8],
      [-1.9, 4.0, -3.2, 0.8],
      [-1.0, 2.9, -2.9, 0.55],
      [-2.8, 2.5, -2.8, 0.55],
    ] as const
  ).map(([x, y, z, r]) => ball(r, PINK, [x, G + y, z], [1, 0.8, 1], 8, { flat: true }));
  const petalHits = b.surface(canopy).scatter(140, { rng: R, minDist: 0.15 });
  b.cards(petalHits, PETAL, { size: 0.14, lean: 70, vary: 0.3, spin: 180, rng: R, color: "#ffffff" });
  const fall: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 90; i++) {
    const x = -4.0 + R() * 4.0;
    const z = -3.8 + R() * 5.6;
    if ((Math.abs(x) < 1.15 && z < -0.4) || Math.abs(x) < 0.5 || Math.hypot(x + 2.2, z + 1) < 0.8) continue;
    fall.push(frame([x, G + 0.01, z], [0, 1, 0]));
  }
  b.cards(fall, PETAL, {
    size: 0.1,
    lean: 90,
    mirror: true,
    spin: 180,
    rng: R,
    flow: (_f, i) => [Math.cos(i * 2.3), 0, Math.sin(i * 2.3)],
    color: "#ffffff",
  });

  // ---- bamboo
  const leafFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 6; i++) {
    const x = 2.35 + (i % 3) * 0.32 + R() * 0.1;
    const z = -2.4 - Math.floor(i / 3) * 0.45 - R() * 0.2;
    const h = 3.0 + R() * 1.3;
    b.rod([x, G - 0.02, z], [x, G + h, z], 0.045, { color: BAMBOO, sides: 6 });
    for (let k = 1; k * 0.55 < h; k++) cyl(0.055, 0.055, 0.03, 6, BAMBOO_DK, [x, G + k * 0.55, z]);
    for (let k = 0; k < 4; k++) leafFrames.push(frame([x, G + h - 0.1 - k * 0.28, z], [0, 1, 0]));
  }
  b.cards(leafFrames, BLADE, {
    size: [0.1, 0.42],
    lean: 65,
    bend: 25,
    cross: false,
    rng: R,
    flow: (_f, i) => [Math.cos(i * 1.9), 0, Math.sin(i * 1.9)],
    color: "#ffffff",
  });

  // ---- grass tufts
  const avoid = (x: number, z: number) =>
    (Math.abs(x) < 0.8 && z > -1.2) ||
    (Math.abs(x) < 1.5 && z < -0.2 && z > -3.1) ||
    Math.hypot(x - 3, z + 0.8) < 0.7 ||
    Math.hypot(x + 3, z + 0.3) < 1.2 ||
    Math.hypot(x + 2.2, z + 1) < 1.0 ||
    Math.hypot(x - 1.95, z + 1) < 0.7 ||
    (Math.abs(z - 1) < 0.4 && Math.abs(Math.abs(x) - 3.2) < 0.3) ||
    Math.hypot(Math.abs(x) - 1.5, z - 2.4) < 0.5 ||
    (Math.abs(x) < 1.2 && Math.abs(z - TZ) < 0.35);
  const tufts: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 260 && tufts.length < 120; i++) {
    const a = R() * Math.PI * 2;
    const r = Math.sqrt(R()) * 4.0;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (avoid(x, z)) continue;
    tufts.push(frame([x, G, z], [0, 1, 0]));
  }
  b.cards(tufts, TUFT, { size: [0.16, 0.22], cross: true, vary: 0.4, spin: 180, bend: 20, rng: R, color: "#ffffff" });

  return b.root;
}
