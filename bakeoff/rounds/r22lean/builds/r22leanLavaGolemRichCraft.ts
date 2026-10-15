import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { mottle, scales } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel, INK } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description: "A hulking golem of cel-shaded basalt plates, molten seams, gold-trimmed pauldrons and a pyro sigil core.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

const BASALT = cel(mottle("#6a5a86", "#54466f", { size: 0.2, seed: 3, contrast: 0.6 }), "#2e2446");
const PLATE = cel(scales("#756492", "#3a2d55", { size: 0.22, width: 0.025, seed: 5 }), "#30264a");
const DARK = cel("#3c3058", "#221a38");
const GOLD = cel("#f2c24f", "#b9762a");
const ORANGE = "#ff7a1c";
const HOT = "#ffc247";
const EYE = "#fff0a0";

const EMBLEM = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<circle cx="50" cy="50" r="48" fill="#3a1410"/>
<circle cx="50" cy="50" r="43" fill="none" stroke="#ffd66b" stroke-width="4"/>
<path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#ffb03a" stroke-width="3"/>
<circle cx="50" cy="8" r="3" fill="#ffd66b"/><circle cx="92" cy="50" r="3" fill="#ffd66b"/>
<circle cx="50" cy="92" r="3" fill="#ffd66b"/><circle cx="8" cy="50" r="3" fill="#ffd66b"/>
<path d="M50 24 C64 40 70 52 62 66 C58 74 42 74 38 66 C30 52 38 44 44 36 C46 42 48 44 52 44 C52 38 50 32 50 24 Z" fill="#ff6a1a"/>
<path d="M50 48 C58 57 60 63 54 70 C50 72 46 70 44 66 C42 60 46 55 50 48 Z" fill="#ffe08a"/>
</svg>`,
  { size: 256 },
);

const FLAME = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 80">
<path d="M20 2 C28 22 36 36 32 56 C30 70 24 78 20 78 C14 78 8 70 8 56 C6 40 14 30 16 18 C18 24 19 26 22 28 C22 18 20 10 20 2 Z" fill="#ff6a1a"/>
<path d="M20 30 C26 42 28 54 25 64 C23 72 17 72 15 64 C13 54 16 44 20 30 Z" fill="#ffd25a"/>
</svg>`,
  { size: 128 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lavaGolem" });
  const rand = rng(11);

  const box = (at: number[], size: number[], color: any, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { at, rotation: rot });
  const rock = (at: number[], size: number[], color: any, rot: number[] = [0, 0, 0]) =>
    b.part(new THREE.IcosahedronGeometry(1, 0), color, { at, scale: size, rotation: rot });
  const seam = (pts: number[][], r = 0.025, color: string = ORANGE) =>
    glow(b.sweep(pts, r, color, { sides: 4 }));
  const ring = (at: number[], r: number, tube: number, rot: number[]) =>
    b.part(new THREE.TorusGeometry(r, tube, 5, 10), GOLD, { at, rotation: rot });

  // ---- legs ----
  for (const s of [1, -1]) {
    const x = s * 0.45;
    box([x, 0.125, 0.08], [0.58, 0.25, 0.8], DARK);
    for (const t of [-1, 0, 1]) rock([x + t * 0.17, 0.16, 0.5], [0.12, 0.13, 0.15], BASALT);
    box([x, 0.58, 0.04], [0.52, 0.66, 0.52], PLATE, [0, s * 4, 0]);
    box([x, 0.32, 0.36], [0.46, 0.16, 0.12], BASALT, [-12, 0, 0]);
    rock([x, 0.98, 0.14], [0.36, 0.3, 0.36], BASALT);
    box([x, 1.06, 0.0], [0.62, 0.36, 0.6], PLATE, [0, -s * 3, 0]);
    ring([x, 0.9, 0.04], 0.34, 0.035, [90, 0, 0]);
    seam([[x + 0.08 * s, 0.28, 0.32], [x - 0.07 * s, 0.46, 0.32], [x + 0.06 * s, 0.6, 0.32], [x - 0.05 * s, 0.76, 0.32], [x, 0.84, 0.32]], 0.022);
    seam([[x - 0.1 * s, 0.98, 0.32], [x + 0.08 * s, 1.1, 0.32], [x - 0.06 * s, 1.2, 0.32]], 0.02, HOT);
    seam([[x + s * 0.27, 0.35, 0.0], [x + s * 0.27, 0.6, 0.1], [x + s * 0.27, 0.82, -0.05]], 0.02);
  }

  // ---- hips and loincloth ----
  box([0, 1.36, 0], [1.4, 0.4, 0.82], PLATE);
  box([0, 1.2, 0.0], [1.5, 0.1, 0.9], GOLD);
  box([0, 1.5, 0.0], [1.46, 0.08, 0.88], GOLD);
  for (const [i, x] of [-0.45, 0, 0.45].entries()) {
    box([x, 1.0, 0.45], [0.3, 0.52, 0.07], BASALT, [-6, 0, i === 1 ? 0 : (i - 1) * -6]);
    seam([[x, 0.78, 0.5], [x + 0.04, 0.95, 0.5], [x - 0.03, 1.1, 0.5]], 0.014, HOT);
  }
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 6), GOLD, { at: [0, 1.36, 0.43], rotation: [90, 0, 0] });

  // ---- torso ----
  box([0, 1.72, 0], [1.1, 0.52, 0.76], PLATE);
  for (const s of [1, -1]) {
    box([s * 0.4, 1.72, 0.4], [0.3, 0.4, 0.08], BASALT, [0, 0, s * 8]);
    box([s * 0.0, 1.74 + s * 0.1, 0.4], [0.5, 0.1, 0.07], DARK);
  }
  seam([[-0.5, 1.6, 0.4], [-0.25, 1.76, 0.4], [-0.1, 1.64, 0.4], [0.1, 1.8, 0.4], [0.28, 1.66, 0.4], [0.5, 1.82, 0.4]], 0.02);
  box([0, 2.35, 0], [1.8, 0.8, 1.0], PLATE);
  box([0, 2.78, -0.05], [1.5, 0.1, 0.8], BASALT);
  for (const s of [1, -1]) {
    box([s * 0.55, 2.4, 0.55], [0.62, 0.6, 0.2], BASALT, [-6, -s * 10, 0]);
    box([s * 0.55, 2.15, 0.52], [0.5, 0.1, 0.14], DARK, [0, -s * 10, 0]);
    seam([[s * 0.3, 2.12, 0.56], [s * 0.5, 2.2, 0.6], [s * 0.7, 2.12, 0.56]], 0.015, HOT);
    seam([[s * 0.92, 2.1, 0.2], [s * 0.92, 2.35, 0.0], [s * 0.92, 2.6, 0.1]], 0.025);
  }
  // pyro sigil core
  glow(b.part(new THREE.CircleGeometry(0.2, 12), "#ffffff", { at: [0, 2.36, 0.515], dir: [0, 0, 1], axis: "z", texture: EMBLEM }), 1.4);
  ring([0, 2.36, 0.52], 0.21, 0.025, [0, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.OctahedronGeometry(0.035), GOLD, { at: [Math.cos(a) * 0.27, 2.36 + Math.sin(a) * 0.27, 0.53] });
  }

  // back plates and vents
  for (const [i, y] of [2.58, 2.3, 2.02].entries()) {
    box([0, y, -0.55], [1.4 - i * 0.1, 0.3, 0.14], BASALT, [8, 0, 0]);
    seam([[-0.6, y - 0.17, -0.58], [-0.2, y - 0.14, -0.62], [0.2, y - 0.17, -0.62], [0.6, y - 0.14, -0.58]], 0.015);
    const d = new THREE.Vector3(0, 0.6, -1).normalize();
    b.spike([0, y, -0.62], d, 0.5 - i * 0.08, 0.11, BASALT, { sides: 5 });
    b.spike([0, y + 0.05, -0.7], d, 0.3 - i * 0.05, 0.05, ORANGE, { sides: 5 });
  }
  seam([[0, 1.55, -0.4], [0.1, 1.75, -0.4], [-0.08, 1.9, -0.4], [0.06, 2.0, -0.4]], 0.025, HOT);

  // ---- shoulders and arms ----
  for (const s of [1, -1]) {
    rock([s * 1.15, 2.62, 0], [0.5, 0.36, 0.5], BASALT);
    rock([s * 1.22, 2.84, 0], [0.4, 0.22, 0.4], PLATE);
    ring([s * 1.15, 2.62, 0], 0.46, 0.04, [90, 0, 0]);
    const sd = new THREE.Vector3(s * 0.5, 1, 0.0).normalize();
    b.spike([s * 1.3, 2.95, 0], sd, 0.55, 0.1, BASALT, { sides: 5 });
    b.spike([s * 1.0, 2.95, 0.2], new THREE.Vector3(s * 0.2, 1, 0.5).normalize(), 0.35, 0.07, ORANGE, { sides: 5 });
    b.rod([s * 1.2, 2.45, 0], [s * 1.4, 1.62, 0.04], [0.3, 0.27], PLATE, { sides: 6 });
    seam([[s * 1.5, 2.3, 0.2], [s * 1.55, 2.05, 0.18], [s * 1.5, 1.8, 0.2]], 0.02);
    rock([s * 1.4, 1.55, 0.02], [0.34, 0.3, 0.34], BASALT);
    seam([[s * 1.2, 1.5, 0.3], [s * 1.4, 1.58, 0.34], [s * 1.6, 1.5, 0.28]], 0.02, HOT);
    b.rod([s * 1.43, 1.48, 0.1], [s * 1.46, 0.62, 0.3], [0.33, 0.43], PLATE, { sides: 6 });
    ring([s * 1.44, 1.18, 0.16], 0.37, 0.045, [90, 0, 0]);
    ring([s * 1.45, 0.82, 0.24], 0.41, 0.045, [90, 0, 0]);
    seam([[s * 1.45, 1.4, 0.48], [s * 1.5, 1.2, 0.52], [s * 1.46, 1.0, 0.54], [s * 1.5, 0.84, 0.56]], 0.02);
    rock([s * 1.46, 0.43, 0.3], [0.44, 0.4, 0.44], BASALT);
    for (const t of [-1, 0, 1]) rock([s * 1.46 + t * 0.2, 0.2, 0.56], [0.1, 0.11, 0.1], DARK);
    seam([[s * 1.3, 0.5, 0.64], [s * 1.46, 0.56, 0.7], [s * 1.62, 0.5, 0.64]], 0.016, HOT);
  }

  // ---- head ----
  box([0, 2.84, 0], [0.46, 0.2, 0.46], DARK);
  rock([0, 2.97, 0.08], [0.37, 0.3, 0.33], BASALT);
  box([0, 3.04, 0.33], [0.62, 0.1, 0.16], DARK, [-8, 0, 0]);
  box([0, 2.78, 0.2], [0.46, 0.14, 0.3], PLATE, [10, 0, 0]);
  for (const s of [1, -1]) {
    box([s * 0.14, 2.96, 0.36], [0.14, 0.05, 0.04], EYE, [0, 0, -s * 16]);
    const e = b.part(new THREE.BoxGeometry(0.14, 0.05, 0.04), EYE, { at: [s * 0.14, 2.96, 0.375], rotation: [0, 0, -s * 16] });
    glow(e, 1.8);
    const hd = new THREE.Vector3(s * 0.6, 1, -0.3).normalize();
    b.spike([s * 0.26, 3.12, -0.02], hd, 0.55, 0.09, BASALT, { sides: 5 });
    ring([s * 0.28, 3.16, -0.03], 0.075, 0.025, [30, 0, s * -30]);
    box([s * 0.4, 2.95, 0.0], [0.08, 0.18, 0.2], DARK);
  }
  seam([[-0.16, 2.8, 0.36], [-0.08, 2.76, 0.4], [0, 2.8, 0.4], [0.08, 2.76, 0.4], [0.16, 2.8, 0.36]], 0.014, HOT);
  const crest: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 7; i++) {
    const a = ((i - 3) / 3) * 0.9;
    crest.push(frame([Math.sin(a) * 0.3, 3.2 + Math.cos(a) * 0.04, -0.12], [Math.sin(a) * 0.7, 1, -0.25]));
  }
  glow(b.cards(crest, FLAME, { size: [0.2, 0.5], lean: 0, cross: true, vary: 0.25, spin: 8, rng: rand, flow: [0, 0, 1] }), 1.3);

  // ---- ground debris ----
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
    const r = 1.3 + rand() * 0.9;
    const sz = 0.07 + rand() * 0.12;
    rock([Math.sin(a) * r, sz * 0.9, Math.cos(a) * r], [sz * 1.2, sz, sz * 1.1], i % 3 === 0 ? DARK : BASALT, [0, rand() * 90, 0]);
    if (i % 3 === 0) glow(b.part(new THREE.OctahedronGeometry(0.035), HOT, { at: [Math.sin(a) * r + 0.1, sz * 2.1, Math.cos(a) * r] }), 1.5);
  }
  b.part(new THREE.BoxGeometry(0.01, 0.01, 0.01), INK, { at: [0, 0.005, 0] });

  return b.root;
}
