import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { lerp } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { cells, mottle, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Lava Golem",
  description:
    "A towering basalt golem whose armour plates float over a molten body: glowing seams, a gold-ringed furnace core, hex-column pauldrons, gold filigree and rune glyphs.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type T3 = [number, number, number];

// ---- palette (cel-shaded) ----
const crackStone = (litA: string, litB: string, shA: string, shB: string, size: number, seed: number, crack: string): Paint =>
  cel(
    paint((p) => (cells(p, size * 1.6, seed + 5).d2 - cells(p, size * 1.6, seed + 5).d1 < 0.02 ? "#ff7a22" : mottle(litA, litB, { size, seed }))),
    paint((p) => (cells(p, size * 1.6, seed + 5).d2 - cells(p, size * 1.6, seed + 5).d1 < 0.02 ? crack : mottle(shA, shB, { size, seed }))),
  );

const STONE = crackStone("#6a5a78", "#7b6a8a", "#3a2f4e", "#463a5c", 0.22, 1, "#d4501a");
const DARK = crackStone("#4a3e5a", "#574a68", "#291f3a", "#33284a", 0.18, 2, "#c0401a");
const PLAIN = cel(mottle("#5a4c68", "#6a5b7a", { size: 0.2, seed: 9 }), mottle("#30263f", "#3c3050", { size: 0.2, seed: 9 }));
const GOLD = cel("#ffd35a", "#c0782a");
const CREAM = cel("#f3e6c8", "#b9a0b8");
const RED = cel("#ff4a2a", "#b01a3a");
const LAVA = "#ff6a1a";
const LAVA2 = "#ffb52e";
const EYE = "#fff2a0";

const runeA = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#ffb52e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 6 L32 58"/><path d="M14 18 L32 30 L50 18"/><path d="M16 44 L32 34 L48 44"/><circle cx="32" cy="32" r="3"/></g></svg>`,
  { size: 192 },
);
const runeB = svg(
  `<svg viewBox="0 0 64 64"><g fill="none" stroke="#ffb52e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M32 6 C46 22 48 40 32 58 C16 40 18 22 32 6 Z"/><path d="M32 24 L32 44"/><path d="M22 34 L42 34"/></g></svg>`,
  { size: 192 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lavaGolem" });
  const lava = (geo: THREE.BufferGeometry, col: string, at: T3, rotation: T3 = [0, 0, 0], strength = 1.2) =>
    glow(b.part(geo, col, { at, rotation }), strength);
  const box = (at: T3, size: T3, col: string | Paint, rotation: T3 = [0, 0, 0]) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), col, { at, rotation });
  const ico = (at: T3, r: number, scale: T3, col: string | Paint, rotation: T3 = [0, 0, 0]) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), col, { at, scale, rotation });

  // plates stacked along a limb with glowing gaps between them
  const limbPlates = (a: T3, c: T3, w0: number, w1: number, d0: number, d1: number, n: number, gap: number, cols: Array<string | Paint>) => {
    for (let i = 0; i < n; i++) {
      const ta = i / n + gap / 2;
      const tb = (i + 1) / n - gap / 2;
      const wa = w0 + (w1 - w0) * ta;
      const wb = w0 + (w1 - w0) * tb;
      const da = d0 + (d1 - d0) * ta;
      const db = d0 + (d1 - d0) * tb;
      b.frustumBox(lerp(a, c, ta), lerp(a, c, tb), [wa, da], [wb, db], { color: cols[i % cols.length] });
    }
  };

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const hip: T3 = [s * 0.5, 1.3, 0];
    const ank: T3 = [s * 0.5, 0.3, 0.05];
    glow(b.rod(hip, ank, 0.22, { color: LAVA, sides: 6 }), 1.2);
    limbPlates(hip, ank, 0.64, 0.54, 0.6, 0.5, 3, 0.1, [STONE, DARK, STONE]);
    // knee
    ico([s * 0.5, 0.88, 0.3], 0.24, [1, 0.9, 0.9], DARK);
    b.spike([s * 0.5, 0.88, 0.5], [0, 0.1, 1], 0.2, 0.08, GOLD, { sides: 6 });
    // side shin guards
    box([s * 0.8, 0.68, 0.0], [0.1, 0.5, 0.36], PLAIN);
    box([s * 0.84, 1.0, 0.0], [0.08, 0.3, 0.3], DARK);
    // foot
    box([s * 0.5, 0.14, 0.15], [0.62, 0.28, 0.92], STONE);
    for (const k of [-1, 0, 1]) {
      box([s * 0.5 + k * 0.2, 0.1, 0.66], [0.17, 0.2, 0.22], DARK, [0, k * 8, 0]);
      b.spike([s * 0.5 + k * 0.2, 0.1, 0.77], [0, -0.1, 1], 0.12, 0.07, CREAM, { sides: 6 });
    }
    // ankle ring
    lava(new THREE.TorusGeometry(0.28, 0.03, 4, 10), LAVA2, [s * 0.5, 0.32, 0.05], [90, 0, 0]);
    // thigh rune
    glow(
      b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
        at: [s * 0.5, 1.12, 0.32],
        dir: [0, 0, 1],
        axis: "z",
        texture: s > 0 ? runeA : runeB,
      }),
    );
    // gold knee band
    lava(new THREE.TorusGeometry(0.3, 0.025, 4, 10), "#ffd35a", [s * 0.5, 1.28, 0], [90, 0, 0], 0.6);
  }

  // ---------- hips and belt ----------
  lava(new THREE.BoxGeometry(1.2, 0.4, 0.6), LAVA, [0, 1.38, 0]);
  for (const s of [1, -1]) {
    box([s * 0.45, 1.38, 0], [0.7, 0.32, 0.8], STONE);
    box([s * 0.8, 1.55, 0], [0.12, 0.3, 0.7], DARK, [0, 0, s * 12]);
  }
  box([0, 1.55, 0], [1.56, 0.07, 0.86], GOLD);
  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.05, 8), GOLD, { at: [0, 1.45, 0.43], dir: [0, 0, 1], axis: "y" });
  lava(new THREE.SphereGeometry(0.07, 6, 4), LAVA2, [0, 1.45, 0.47]);
  for (const s of [1, -1]) {
    for (const k of [0.3, 0.55]) {
      b.rod([s * k, 1.3, 0.43], [s * k + s * 0.02, 0.85, 0.45], 0.022, { color: RED, sides: 4 });
      b.part(new THREE.SphereGeometry(0.045, 6, 4), GOLD, { at: [s * k + s * 0.02, 0.82, 0.45] });
      b.rod([s * k + s * 0.02, 0.82, 0.45], [s * k + s * 0.02, 0.66, 0.45], [0.03, 0.005], { color: RED, sides: 4 });
    }
  }

  // ---------- torso ----------
  glow(b.frustumBox([0, 1.5, 0], [0, 2.5, 0.05], [1.0, 0.7], [1.7, 1.0], { color: LAVA }), 1.2);
  // abdomen plates
  for (let i = 0; i < 3; i++) {
    const y = 1.68 + i * 0.2;
    box([0, y, 0.4 + i * 0.01], [0.9 + i * 0.1, 0.15, 0.22], i % 2 ? DARK : STONE);
    box([0, y, -0.38], [0.9 + i * 0.1, 0.15, 0.22], i % 2 ? DARK : STONE);
  }
  // chest plates with a glowing centre seam
  for (const s of [1, -1]) {
    box([s * 0.5, 2.22, 0.5], [0.8, 0.72, 0.22], STONE, [-6, 0, 0]);
    box([s * 0.5, 2.62, 0.4], [0.8, 0.16, 0.2], DARK, [-12, 0, 0]);
    glow(
      b.part(new THREE.PlaneGeometry(0.3, 0.3), "#ffffff", {
        at: [s * 0.6, 2.22, 0.615],
        dir: [0, 0.05, 1],
        axis: "z",
        texture: s > 0 ? runeB : runeA,
      }),
    );
    // flank plates
    box([s * 0.9, 2.05, 0.05], [0.14, 0.8, 0.7], PLAIN, [0, 0, s * -8]);
    b.spike([s * 0.95, 2.35, 0.25], [s, 0.5, 0.3], 0.35, 0.09, DARK, { sides: 6 });
  }
  // furnace core
  lava(new THREE.SphereGeometry(0.17, 8, 6), LAVA2, [0, 2.2, 0.52], [0, 0, 0], 1.6);
  lava(new THREE.TorusGeometry(0.25, 0.035, 5, 12), "#ffd35a", [0, 2.2, 0.6], [0, 0, 0], 0.7);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.27, 2.2 + Math.sin(a) * 0.27, 0.6], [Math.cos(a), Math.sin(a), 0.2], 0.07, 0.025, GOLD, { sides: 4 });
  }
  // back armour and spine spikes
  box([0, 2.05, -0.5], [1.5, 1.0, 0.2], STONE);
  glow(
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { at: [0, 2.1, -0.612], dir: [0, 0, -1], axis: "z", texture: runeA }),
  );
  for (let i = 0; i < 6; i++) {
    const y = 1.6 + i * 0.2;
    const base: T3 = [0, y, -0.62];
    const dir: T3 = [0, 0.55, -1];
    const len = 0.5 + (i % 3) * 0.12;
    b.spike(base, dir, len, 0.13 - i * 0.008, i % 2 ? DARK : STONE, { sides: 5 });
    const n = Math.hypot(dir[0], dir[1], dir[2]);
    const tip: T3 = [base[0] + (dir[0] / n) * len * 0.68, y + (dir[1] / n) * len * 0.68, base[2] + (dir[2] / n) * len * 0.68];
    glow(b.spike(tip, dir, 0.2, 0.045, LAVA2, { sides: 4 }), 1.4);
  }

  // ---------- neck, head ----------
  lava(new THREE.BoxGeometry(0.5, 0.3, 0.4), LAVA, [0, 2.6, 0.12]);
  box([0, 2.98, 0.25], [0.68, 0.46, 0.62], STONE);
  box([0, 3.15, 0.5], [0.72, 0.13, 0.2], DARK, [14, 0, 0]);
  box([0, 3.0, 0.02], [0.5, 0.3, 0.12], PLAIN);
  box([0, 2.64, 0.32], [0.58, 0.22, 0.52], DARK);
  lava(new THREE.BoxGeometry(0.5, 0.05, 0.1), LAVA2, [0, 2.76, 0.5]);
  for (const s of [1, -1]) {
    lava(new THREE.BoxGeometry(0.19, 0.07, 0.05), EYE, [s * 0.17, 2.98, 0.57], [0, 0, -s * 14], 1.6);
    box([s * 0.17, 3.05, 0.6], [0.21, 0.04, 0.05], "#22112f", [0, 0, -s * 14]);
    box([s * 0.37, 2.93, 0.26], [0.1, 0.32, 0.5], PLAIN);
    for (const k of [0, 1, 2]) {
      b.spike([s * (0.1 + k * 0.1), 2.76, 0.58], [0, 1, 0.15], 0.1, 0.035, CREAM, { sides: 4 });
    }
    // horns
    b.sweep(catmull([[s * 0.28, 3.14, 0.2], [s * 0.5, 3.28, 0.12], [s * 0.64, 3.55, 0.02], [s * 0.52, 3.85, -0.1]]), [0.1, 0.015], {
      color: DARK,
      sides: 6,
      caps: "point",
    });
    b.rod([s * 0.34, 3.2, 0.17], [s * 0.38, 3.24, 0.15], 0.115, { color: GOLD, sides: 6, caps: "flat" });
    glow(b.spike([s * 0.58, 3.7, -0.03], [-s * 0.3, 1, -0.4], 0.16, 0.03, LAVA2, { sides: 4 }), 1.4);
  }
  // gold halo behind the head
  lava(new THREE.TorusGeometry(0.62, 0.028, 4, 20), "#ffd35a", [0, 3.02, -0.32], [0, 0, 0], 0.7);
  lava(new THREE.TorusGeometry(0.5, 0.015, 4, 20), "#ffd35a", [0, 3.02, -0.31], [0, 0, 0], 0.7);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.spike([Math.cos(a) * 0.65, 3.02 + Math.sin(a) * 0.65, -0.32], [Math.cos(a), Math.sin(a), 0], 0.1, 0.022, GOLD, { sides: 4 });
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const sh: T3 = [s * 1.2, 2.3, 0];
    const el: T3 = [s * 1.5, 1.55, 0.2];
    const wr: T3 = [s * 1.55, 0.95, 0.62];
    // pauldron
    ico([s * 1.2, 2.45, 0], 0.55, [1.0, 0.75, 1.0], STONE, [0, s * 20, 0]);
    ico([s * 1.25, 2.72, 0.05], 0.3, [1, 0.6, 1], DARK, [10, 0, 0]);
    lava(new THREE.TorusGeometry(0.5, 0.03, 4, 12), "#ffd35a", [s * 1.28, 2.22, 0], [90, 0, s * 8], 0.6);
    const cols: Array<[number, number, number]> = [[0, 0.35, 0.18], [0.18, 0.28, -0.05], [-0.18, 0.3, -0.1], [0.05, 0.4, -0.22]];
    cols.forEach(([dx, h, dz], i) => {
      const cx = s * 1.2 + dx;
      b.part(new THREE.CylinderGeometry(0.09, 0.1, h, 6), i % 2 ? DARK : STONE, { at: [cx, 2.82 + h / 2 - 0.06, dz] });
      lava(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 6), LAVA2, [cx, 2.82 + h - 0.05, dz]);
    });
    // upper arm
    glow(b.rod(sh, el, [0.25, 0.27], { color: LAVA, sides: 6 }), 1.2);
    limbPlates(lerp(sh, el, 0.1) as unknown as T3, el, 0.56, 0.6, 0.56, 0.6, 2, 0.14, [STONE, DARK]);
    // elbow
    ico(el, 0.3, [1, 0.9, 1], DARK);
    b.spike([s * 1.65, 1.6, 0.0], [s, 0.2, -0.5], 0.4, 0.1, STONE, { sides: 5 });
    glow(b.spike([s * 1.77, 1.64, -0.12], [s, 0.2, -0.5], 0.16, 0.04, LAVA2, { sides: 4 }), 1.4);
    // forearm
    glow(b.rod(el, wr, [0.28, 0.32], { color: LAVA, sides: 6 }), 1.2);
    limbPlates(el, wr, 0.64, 0.74, 0.64, 0.74, 3, 0.12, [STONE, DARK, STONE]);
    const fd: T3 = [wr[0] - el[0], wr[1] - el[1], wr[2] - el[2]];
    b.part(new THREE.TorusGeometry(0.38, 0.035, 4, 12), GOLD, { at: lerp(el, wr, 0.88), dir: fd, axis: "z" });
    b.part(new THREE.TorusGeometry(0.4, 0.03, 4, 12), GOLD, { at: lerp(el, wr, 0.2), dir: fd, axis: "z" });
    // fist
    lava(new THREE.BoxGeometry(0.4, 0.2, 0.4), LAVA, [s * 1.56, 0.78, 0.68]);
    box([s * 1.55, 0.5, 0.8], [0.7, 0.6, 0.66], STONE);
    box([s * 1.55, 0.78, 0.82], [0.6, 0.14, 0.6], DARK);
    for (let k = 0; k < 4; k++) {
      box([s * 1.55 + (k - 1.5) * 0.17, 0.62, 1.15], [0.15, 0.2, 0.12], k % 2 ? DARK : PLAIN);
      glow(b.spike([s * 1.55 + (k - 1.5) * 0.17, 0.62, 1.2], [0, 0, 1], 0.07, 0.04, LAVA2, { sides: 4 }), 1.3);
    }
    lava(new THREE.BoxGeometry(0.6, 0.03, 0.04), LAVA2, [s * 1.55, 0.36, 1.14]);
    b.spike([s * 1.9, 0.6, 0.8], [s, 0.1, 0], 0.18, 0.08, CREAM, { sides: 5 });
  }

  return b.root;
}
