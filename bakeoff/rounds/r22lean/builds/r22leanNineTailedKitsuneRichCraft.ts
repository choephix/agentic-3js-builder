import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { rng } from "../../../../src/math";
import { paint, gradient } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, furEdge, INK, zigzag, animeEye } from "../../../../kits/toon";

export const meta = {
  name: "Nine-Tailed Kitsune",
  description: "A white spirit fox with crimson markings, gold bells and collar, nine fanned tails and drifting blue foxfire.",
  style: "high-fantasy anime",
  commit: "88fc1f0",
};

const IVORY = "#fffaf0";
const BELLY = "#f3dcc8";
const CRIMSON = "#d92c52";
const SOCK = "#5a1f4a";
const GOLD = "#f2b632";
const FIRE = "#5ec8ff";
const FIRE_CORE = "#e8fbff";
const FIRE_VIOLET = "#8f7bff";

type Pt = [number, number, boolean?];
const FL: Pt[] = [
  [0, 0],
  [0.05, 0.05],
  [0.045, 0.12],
  [0.015, 0.2],
  [0, 0.3, true],
  [-0.02, 0.2],
  [-0.05, 0.12],
  [-0.05, 0.05],
];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "nineTailedKitsune" });

  const flame = (at: number[], k: number, outer: string, core: string) => {
    const outline = (s: number): OutlinePoint[] =>
      FL.map((q) => (q[2] ? ([q[0] * s, q[1] * s, "sharp"] as OutlinePoint) : ([q[0] * s, q[1] * s] as OutlinePoint)));
    for (const x of [[1, 0, 0], [0, 0, 1]]) {
      glow(b.extrude(outline(k), { at, x, thickness: 0.02 * k / 0.6, smoothing: 1, color: outer }));
      glow(b.extrude(outline(k * 0.55), { at, x, thickness: 0.026 * k / 0.6, smoothing: 1, color: core }));
    }
  };

  // ---- paints
  const COAT = furEdge(IVORY, BELLY, { level: -0.3, teeth: 0.25, period: 0.03, ink: INK });
  const BODYP = cel(
    paint((p, n) => (n.y > 0.5 && Math.abs(p.x) < 0.008 + 0.012 * zigzag(p.z / 0.05) ? CRIMSON : COAT)),
  );
  const HEADP = cel(furEdge(IVORY, BELLY, { by: "position", axis: [0, 1, 0], level: 0.83, teeth: 0.012, period: 0.02, along: [1, 0, 0] }));
  const LEGP = cel(furEdge(IVORY, SOCK, { by: "position", axis: [0, 1, 0], level: 0.17, teeth: 0.03, period: 0.03, along: [1, 0, 0] }));
  const WHITE = cel(IVORY);
  const RED = cel(CRIMSON);

  // ---- body
  b.sweep(catmull([[0, 0.62, -0.38], [0, 0.64, -0.1], [0, 0.66, 0.15], [0, 0.66, 0.3]]), [0.11, 0.13, 0.14, 0.12], { color: BODYP, sides: 10 });
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 10, 8), BODYP, { at: [s * 0.12, 0.5, -0.32], scale: [0.09, 0.12, 0.13] });

  // neck and head
  const neck = b.capsule([0, 0.64, 0.26], [0, 0.82, 0.45], [0.1, 0.08], { color: HEADP, sides: 10 });
  const HEAD_C = [0, 0.87, 0.5];
  const skull = b.part(new THREE.SphereGeometry(1, 16, 12), HEADP, { at: HEAD_C, scale: [0.1, 0.088, 0.105] });
  b.sweep(catmull([[0, 0.85, 0.56], [0, 0.835, 0.64], [0, 0.82, 0.7]]), [0.055, 0.03, 0.02], { color: HEADP, sides: 8 });
  b.capsule([0, 0.8, 0.58], [0, 0.79, 0.67], [0.035, 0.02], { color: WHITE, sides: 8 });
  b.part(new THREE.SphereGeometry(1, 8, 6), INK, { at: [0, 0.822, 0.718], scale: [0.017, 0.012, 0.014] });

  // ears
  for (const s of [1, -1]) {
    const y: number[] = [s * 0.25, 1, 0];
    b.extrude([[-0.055, 0], [0.055, 0], [0.03, 0.12], [0, 0.22, "sharp"], [-0.03, 0.12]], {
      at: [s * 0.065, 0.935, 0.47], x: [s, 0, 0], y, thickness: 0.022, smoothing: 1, color: WHITE,
    });
    b.extrude([[-0.03, 0.01], [0.03, 0.01], [0.012, 0.12], [0, 0.16, "sharp"], [-0.012, 0.12]], {
      at: [s * 0.065, 0.935, 0.47], x: [s, 0, 0], y, thickness: 0.03, smoothing: 1, color: RED,
    });
    // cheek fur spikes
    for (const [yy, ln] of [[0.84, 0.09], [0.81, 0.075], [0.78, 0.06]]) {
      b.spike([s * 0.085, yy, 0.52], [s * 0.8, -0.25, -0.2], ln, 0.028, { color: WHITE, sides: 6 });
    }
    // whiskers
    for (const j of [0, 1]) {
      b.capsule([s * 0.03, 0.82 - j * 0.01, 0.66], [s * 0.19, 0.84 - j * 0.03, 0.6 - j * 0.04], 0.003, { color: IVORY, sides: 4 });
    }
  }

  // eyes and face marks
  const EYE = animeEye({ iris: "#f5b020" });
  const MARK = svg(
    `<svg viewBox="0 0 40 60"><path d="M20 2 L34 22 L20 40 L6 22Z" fill="#ff4f6a"/><path d="M20 44 L25 52 L20 58 L15 52Z" fill="#ff4f6a"/></svg>`,
    { size: 128 },
  );
  const STREAK = svg(`<svg viewBox="0 0 60 20"><path d="M2 10 Q30 0 58 6 Q30 14 2 10Z" fill="#d92c52"/></svg>`, { size: 128 });
  const skin = b.surface(skull);
  for (const s of [1, -1]) {
    const eyeHit = skin.around(HEAD_C).at(s * 38, 4);
    if (eyeHit) b.decal(skin, EYE, { at: eyeHit, size: [0.045, 0.062], mirror: s > 0 });
    const ch = skin.around(HEAD_C).at(s * 52, -14);
    if (ch) b.decal(skin, STREAK, { at: ch, size: [0.06, 0.02], mirror: s > 0 });
  }
  const fh = skin.around(HEAD_C).at(0, 52);
  if (fh) glow(b.decal(skin, MARK, { at: fh, size: [0.04, 0.06] }));

  // legs
  for (const s of [1, -1]) {
    b.sweep(catmull([[s * 0.1, 0.58, 0.26], [s * 0.095, 0.38, 0.3], [s * 0.09, 0.2, 0.3], [s * 0.09, 0.04, 0.33]]), [0.065, 0.045, 0.032, 0.03, 0.03], { color: LEGP, sides: 8 });
    b.sweep(catmull([[s * 0.12, 0.48, -0.3], [s * 0.11, 0.32, -0.43], [s * 0.1, 0.2, -0.47], [s * 0.095, 0.1, -0.42], [s * 0.09, 0.04, -0.37]]), [0.07, 0.045, 0.03, 0.03, 0.03], { color: LEGP, sides: 8 });
    for (const [z, x] of [[0.35, 0.09], [-0.34, 0.09]] as const) {
      b.part(new THREE.SphereGeometry(1, 8, 6), SOCK, { at: [s * x, 0.03, z], scale: [0.04, 0.03, 0.055] });
      for (const j of [-1, 0, 1]) b.spike([s * x + j * 0.017, 0.014, z + 0.05], [0, -0.2, 1], 0.022, 0.006, { color: INK, sides: 4 });
    }
    // gold anklet on the forelegs
    b.part(new THREE.TorusGeometry(0.036, 0.007, 5, 10), GOLD, { at: [s * 0.09, 0.14, 0.31], dir: [0, 1, 0], axis: "z" });
    // sash ribbons from the collar
    b.sweep(catmull([[s * 0.09, 0.74, 0.38], [s * 0.12, 0.77, 0.2], [s * 0.14, 0.82, 0.0], [s * 0.2, 0.8, -0.25], [s * 0.3, 0.9, -0.5]]), (): [number, number] => [0.022, 0.004], { color: RED, caps: "flat" });
  }

  // collar, bell and tassels
  b.part(new THREE.TorusGeometry(0.1, 0.012, 6, 16), GOLD, { at: [0, 0.723, 0.34], dir: [0, 0.18, 0.17], axis: "z" });
  b.part(new THREE.SphereGeometry(0.022, 8, 6), GOLD, { at: [0, 0.652, 0.416] });
  for (const x of [-0.02, 0, 0.02]) b.spike([x, 0.64, 0.42], [0, -1, 0], 0.08, 0.012, { color: CRIMSON, sides: 5 });

  // fur tufts
  const tuft = svg(`<svg viewBox="0 0 32 64"><path d="M16 0 Q30 30 26 64 L6 64 Q2 30 16 0Z" fill="#fffaf0" stroke="#e8c9b0" stroke-width="2"/></svg>`, { size: 128 });
  const r = rng(5);
  b.cards(b.surface(neck).scatter(40, { rng: r, minDist: 0.025, filter: (h) => h.n.y > -0.2 }), tuft, {
    size: [0.04, 0.08], lean: 60, bend: 25, vary: 0.3, rng: rng(6),
  });

  // ---- nine tails
  b.part(new THREE.SphereGeometry(1, 10, 8), WHITE, { at: [0, 0.6, -0.42], scale: [0.1, 0.1, 0.1] });
  for (let i = 0; i < 9; i++) {
    const k = (i - 4) / 4;
    const th = k * 80 * (Math.PI / 180);
    const dx = Math.sin(th);
    const dz = -Math.cos(th);
    const L = 1 + 0.12 * Math.cos(i * 1.7);
    const c = 1 - Math.abs(k) * 0.6;
    const pos = (rr: number, h: number) => [dx * rr * L, h, -0.4 + dz * rr * L];
    const path = catmull([[0, 0.6, -0.4], pos(0.25, 0.74), pos(0.45, 0.95 + 0.1 * c), pos(0.62, 1.15 + 0.2 * c)]);
    const tail = b.sweep(path, [0.04, 0.075, 0.09, 0.07, 0.03], {
      color: cel(gradient(IVORY, CRIMSON, path.at(0.55), path.at(0.95))), sides: 8,
    });
    b.part(new THREE.TorusGeometry(0.097, 0.008, 5, 12), GOLD, { at: path.at(0.4), dir: path.tangentAt(0.4), axis: "z" });
    b.cards(b.surface(tail).scatter(18, { rng: rng(20 + i), minDist: 0.04 }), tuft, {
      size: [0.04, 0.08], lean: 55, bend: 20, vary: 0.3, rng: rng(40 + i),
    });
    const tip = path.at(1);
    flame([tip.x, tip.y - 0.02, tip.z], 0.7 + 0.1 * c, i % 2 ? FIRE : FIRE_VIOLET, FIRE_CORE);
  }

  // ---- drifting foxfire orbs
  const orbs = [[0.55, 0.55, 0.5], [-0.6, 0.9, 0.3], [0.75, 0.35, -0.2], [-0.7, 0.4, -0.35], [0.45, 1.15, 0.7], [-0.35, 0.65, 0.85]];
  for (const [x, y, z] of orbs) {
    glow(b.part(new THREE.SphereGeometry(0.035, 8, 6), "#bfeaff", { at: [x, y, z] }));
    flame([x, y + 0.03, z], 0.3, FIRE, FIRE_CORE);
  }

  return b.root;
}
