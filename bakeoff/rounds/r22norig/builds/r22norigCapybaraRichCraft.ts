import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { grain } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel, furEdge } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with a Small Bird",
  description: "A chubby, sleepy capybara with a round yellow bird napping on its head, a daisy behind one ear.",
  style: "whimsical",
  commit: "88fc1f0",
};

const BELLY = "#e2bd88";
const NOSE = "#3f2a22";
const TOE = "#4a3025";
const INK = "#2a1a14";
const BIRD = "#ffd34a";
const BIRD_DARK = "#f2a93a";
const ORANGE = "#ff8f2e";

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(7);

  const furTop = grain("#b9803f", "#a56d38", { size: 0.025, axis: "z", seed: 2 });
  const coat = cel(furEdge(furTop, BELLY, { level: -0.3, teeth: 0.25, period: 0.03 }));
  const noseCoat = cel("#5a3a2c");

  const ball = (at: [number, number, number], scale: [number, number, number], color: string, seg = 8) =>
    b.part(new THREE.SphereGeometry(1, seg, Math.max(4, seg - 2)), color, { at, scale });

  // ---- body ----
  const body = b.loft(
    [
      { at: [0, 0.27, -0.52], w: 0.3, h: 0.3 },
      { at: [0, 0.31, -0.38], w: 0.46, h: 0.46 },
      { at: [0, 0.33, -0.05], w: 0.52, h: 0.52 },
      { at: [0, 0.34, 0.28], w: 0.46, h: 0.46 },
      { at: [0, 0.34, 0.46], w: 0.34, h: 0.38 },
    ],
    { color: coat },
  );

  // ---- head ----
  const head = b.loft(
    [
      { at: [0, 0.37, 0.4], w: 0.3, h: 0.32 },
      { at: [0, 0.37, 0.62], w: 0.28, h: 0.3 },
      { at: [0, 0.34, 0.8], w: 0.26, h: 0.27 },
      { at: [0, 0.32, 0.86], w: 0.24, h: 0.23 },
    ],
    { color: coat },
  );
  // muzzle bulb and nose
  ball([0, 0.325, 0.865], [0.125, 0.115, 0.05], "#6a4634");
  ball([0, 0.34, 0.9], [0.1, 0.05, 0.03], NOSE);
  for (const s of [1, -1]) {
    ball([s * 0.04, 0.345, 0.925], [0.017, 0.014, 0.01], "#150c09", 6);
    // eye
    ball([s * 0.125, 0.43, 0.655], [0.024, 0.03, 0.024], INK);
    ball([s * 0.131, 0.44, 0.672], [0.009, 0.011, 0.007], "#ffffff", 6);
    // sleepy lid
    ball([s * 0.126, 0.447, 0.655], [0.027, 0.012, 0.027], "#8c5c30");
    // blush cheek
    ball([s * 0.128, 0.375, 0.73], [0.01, 0.025, 0.03], "#f08a78");
    // ears
    ball([s * 0.095, 0.525, 0.5], [0.032, 0.038, 0.02], "#8a5a30");
    ball([s * 0.095, 0.525, 0.512], [0.02, 0.026, 0.012], "#4a2c20");
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.07, 0.31 + i * 0.012, 0.92], [s * 0.16, 0.3 + i * 0.035, 0.95], 0.002, INK);
    }
    // brow tufts
    b.rod([s * 0.1, 0.475, 0.68], [s * 0.14, 0.462, 0.64], 0.006, "#7a4c28");
  }
  // mouth and buck teeth
  b.sweep(
    catmull([
      [-0.07, 0.285, 0.9],
      [-0.03, 0.272, 0.915],
      [0.03, 0.272, 0.915],
      [0.07, 0.285, 0.9],
    ]),
    0.004,
    { color: INK },
  );
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.016, 0.026, 0.008), "#fff6df", { at: [s * 0.01, 0.255, 0.912] });
  }
  // forehead tuft
  for (let i = 0; i < 3; i++) {
    b.spike([(i - 1) * 0.025, 0.515, 0.45], [(i - 1) * 0.3, 1, -0.3], 0.04, 0.008, "#8a5a30", { sides: 5 });
  }

  // ---- legs ----
  for (const s of [1, -1]) {
    // front legs
    b.rod([s * 0.16, 0.2, 0.3], [s * 0.165, 0.0, 0.32], [0.075, 0.062], coat);
    b.part(new THREE.BoxGeometry(0.1, 0.03, 0.12), "#7a4c28", { at: [s * 0.165, 0.014, 0.35] });
    // hind thighs and legs
    ball([s * 0.21, 0.22, -0.32], [0.14, 0.17, 0.2], "#a56d38", 9);
    b.rod([s * 0.2, 0.12, -0.3], [s * 0.2, 0.0, -0.28], [0.08, 0.065], "#8a5a30");
    b.part(new THREE.BoxGeometry(0.11, 0.03, 0.14), "#7a4c28", { at: [s * 0.2, 0.014, -0.24] });
    // toes
    for (const [fz, bx] of [[0.41, 0.165], [0.3 + 0.0, 0]] as Array<[number, number]>) {
      if (bx === 0) continue;
      for (let k = -1; k <= 1; k++) ball([s * bx + k * 0.032, 0.016, fz], [0.017, 0.016, 0.024], TOE, 6);
    }
    for (let k = -1; k <= 1; k++) ball([s * 0.2 + k * 0.034, 0.016, -0.16], [0.018, 0.016, 0.025], TOE, 6);
  }
  // tail nub
  ball([0, 0.27, -0.55], [0.04, 0.035, 0.03], "#8a5a30");

  // ---- fur tufts ----
  const tuft = svg(
    `<svg viewBox="0 0 16 32"><path d="M2 32 Q6 14 8 0 Q11 14 14 32 Z" fill="#ffffff"/></svg>`,
    { size: 64 },
  );
  const hits = b.surface(body).scatter(150, { rng: rand, minDist: 0.045, filter: (h) => h.n.y > -0.2 });
  b.cards(hits, tuft, { size: [0.035, 0.065], lean: 65, bend: 20, vary: 0.3, rng: rng(4), color: "#c18a4a" });

  // ---- daisy behind the ear ----
  const dc: [number, number, number] = [-0.11, 0.53, 0.44];
  ball(dc, [0.014, 0.01, 0.014], "#f5b800", 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ball([dc[0] + Math.cos(a) * 0.026, dc[1] - 0.004, dc[2] + Math.sin(a) * 0.026], [0.013, 0.006, 0.013], "#ffffff", 6);
  }

  // ---- little bird on the head ----
  const bz = 0.58;
  ball([0, 0.565, bz], [0.045, 0.042, 0.055], BIRD);
  ball([0, 0.6, bz + 0.035], [0.034, 0.032, 0.034], BIRD);
  ball([0, 0.55, bz + 0.02], [0.03, 0.025, 0.035], "#fff2b0", 6);
  b.spike([0, 0.597, bz + 0.065], [0, -0.1, 1], 0.026, 0.011, ORANGE, { sides: 6 });
  for (const s of [1, -1]) {
    ball([s * 0.016, 0.608, bz + 0.058], [0.006, 0.007, 0.005], INK, 6);
    ball([s * 0.04, 0.57, bz - 0.005], [0.012, 0.028, 0.04], BIRD_DARK, 6);
    ball([s * 0.026, 0.592, bz + 0.07], [0.007, 0.004, 0.004], "#ff9a8a", 5);
    b.rod([s * 0.014, 0.52, bz + 0.005], [s * 0.014, 0.54, bz + 0.005], 0.003, ORANGE, { sides: 4 });
  }
  for (let i = -1; i <= 1; i++) {
    b.spike([0, 0.565, bz - 0.04], [i * 0.25, 0.25, -1], 0.06, 0.012, BIRD_DARK, { sides: 4 });
  }
  b.spike([0, 0.628, bz + 0.03], [0, 1, 0.3], 0.03, 0.006, BIRD_DARK, { sides: 4 });

  return b.root;
}
