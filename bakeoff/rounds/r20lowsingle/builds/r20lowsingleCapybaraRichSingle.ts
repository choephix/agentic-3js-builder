import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { limb } from "../../../../src/ik";
import { rng } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { countershade, mottle } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { animeEye, cel, furEdge, INK } from "../../../../kits/toon";

export const meta = {
  name: "Capybara with a Bird",
  description: "A chubby, cel-shaded storybook capybara with a little blue bird napping on its head.",
  style: "whimsical",
  commit: "88fc1f0",
};

const FUR = "#b9824a";
const FURD = "#9a6636";
const BELLY = "#e2bd85";
const MUZZLE = "#d9a56a";
const NOSE = "#3b2a2a";
const PAD = "#5a3d30";
const PINK = "#f08fa0";
const BLUE = "#4fb8e6";
const BLUED = "#2f8fc4";
const CREAMB = "#fff0c4";
const ORANGE = "#ff9a2e";
const WHITE = "#fffaf0";
const YELLOW = "#ffd93a";

export default function build() {
  const b = createBuilder({ name: "capybara" });
  const rand = rng(11);

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.36, -0.25], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, -0.25],
      [0, 0.38, 0.0],
      [0, 0.39, 0.25],
      [0, 0.38, 0.45],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.38, 0.45],
      [0, 0.4, 0.56],
      [0, 0.42, 0.64],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 0.42, 0.64], aim: [0, 0.4, 0.85], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.36, 0.7], aim: [0, 0.34, 0.86], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, 0.4, -0.58],
      [0, 0.38, -0.65],
    ],
    { parent: hips, names: ["tail1"], role: "tail" },
  );

  // ---------- paints ----------
  const furBase = countershade(mottle(FUR, FURD, { size: 0.12, contrast: 0.8, seed: 3 }), BELLY, { level: -0.25 });
  const coat = cel(furBase);
  const headCoat = cel(
    furEdge(MUZZLE, furBase, { by: "position", axis: [0, 0, 1], level: 0.76, teeth: 0.03, period: 0.035, along: [1, 0, 0] }),
  );
  const padPaint = cel(PAD);
  const nosePaint = cel(NOSE, INK);
  const earPaint = cel(PINK);
  const chinPaint = cel(MUZZLE);
  const birdPaint = cel(countershade(BLUE, CREAMB, { level: -0.1 }));
  const birdWing = cel(BLUED);
  const beakPaint = cel(ORANGE);

  // ---------- body ----------
  const body = b.loft(
    [
      { at: [0, 0.37, -0.58], w: 0.26, h: 0.3 },
      { at: [0, 0.37, -0.4], w: 0.4, h: 0.42 },
      { at: [0, 0.38, -0.1], w: 0.44, h: 0.46 },
      { at: [0, 0.39, 0.2], w: 0.44, h: 0.46 },
      { at: [0, 0.4, 0.42], w: 0.36, h: 0.38 },
      { at: [0, 0.41, 0.56], w: 0.24, h: 0.26 },
    ],
    { bone: [hips, spine, neck], color: coat, name: "body" },
  );
  b.sweep(tail, [0.035, 0.02], { color: coat, name: "tailStub" });

  // fur tufts over the back and flanks
  const tuft = svg(
    `<svg viewBox="0 0 32 64"><path d="M16 2 Q26 30 30 62 L2 62 Q6 30 16 2 Z" fill="#ffffff"/><path d="M16 14 Q17 38 16 60" stroke="#b0b0b0" stroke-width="3" fill="none"/></svg>`,
    { size: 128 },
  );
  const hits = b.surface(body).scatter(240, { rng: rng(5), minDist: 0.05, filter: (h) => h.n.y > -0.25 });
  b.cards(hits, tuft, { size: [0.045, 0.06], lean: 72, bend: 30, vary: 0.3, spin: 25, rng: rng(6), color: "#c58f55" });

  // ---------- head ----------
  const headLoft = b.loft(
    [
      { at: [0, 0.44, 0.56], w: 0.26, h: 0.26 },
      { at: [0, 0.43, 0.7], w: 0.22, h: 0.22 },
      { at: [0, 0.42, 0.8], w: 0.2, h: 0.2 },
      { at: [0, 0.4, 0.88], w: 0.17, h: 0.18 },
    ],
    { bone: head, color: headCoat, name: "skull" },
  );
  b.frustumBox([0, 0.33, 0.72], [0, 0.33, 0.87], [0.15, 0.05], [0.12, 0.045], { bone: jaw, color: chinPaint, name: "lowerJaw" });
  b.part(new THREE.SphereGeometry(0.058, 8, 6), nosePaint, { bone: head, at: [0, 0.405, 0.9], scale: [1.1, 0.8, 0.75] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 6, 4), INK, { bone: head, at: [s * 0.028, 0.41, 0.945], scale: [1, 1.2, 0.6] });
    // cheeks
    b.part(new THREE.SphereGeometry(0.045, 8, 6), headCoat, { bone: head, at: [s * 0.085, 0.4, 0.8], scale: [0.8, 0.9, 1.1] });
    // ears
    b.part(new THREE.SphereGeometry(0.04, 8, 6), coat, { bone: head, at: head.local({ left: s * 0.08, up: 0.115, forward: -0.05 }), scale: [0.55, 1, 0.75] });
    b.part(new THREE.SphereGeometry(0.028, 6, 4), earPaint, { bone: head, at: head.local({ left: s * 0.088, up: 0.112, forward: -0.04 }), scale: [0.4, 0.9, 0.6] });
    // whiskers
    for (let k = 0; k < 3; k++) {
      b.rod([s * 0.06, 0.395 + k * 0.012, 0.86], [s * 0.17, 0.4 + k * 0.035 - 0.02, 0.84 - k * 0.02], 0.003, NOSE, { bone: head });
    }
    // mouth line
    b.rod([s * 0.012, 0.357, 0.9], [s * 0.065, 0.352, 0.85], 0.004, NOSE, { bone: head });
  }
  // buck teeth
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.02, 0.026, 0.01), WHITE, { bone: head, at: [s * 0.011, 0.35, 0.915] });

  // anime eyes
  const EYE = animeEye({ iris: "#6b3b1c", irisLight: "#c98a4a", blush: "#ff8f9f", brow: true, size: 256 });
  for (const s of [1, -1]) {
    b.decal(headLoft, EYE, {
      at: head.local({ left: s * 0.1, up: 0.05, forward: 0.06 }),
      dir: [s * 0.8, 0.2, 0.5],
      size: [0.06, 0.082],
      mirror: s > 0,
    });
  }

  // little flower behind the left ear
  const fc = [0.095, 0.52, 0.55] as const;
  b.ring(frame([fc[0], fc[1], fc[2]], [1, 0, 0]), { count: 6, radius: 0.02 }, (it) =>
    b.part(new THREE.SphereGeometry(0.014, 6, 4), WHITE, { bone: head, at: it }),
  );
  b.part(new THREE.SphereGeometry(0.011, 6, 4), YELLOW, { bone: head, at: [fc[0] + 0.006, fc[1], fc[2]] });

  // ---------- legs ----------
  const makeLeg = (side: string, s: number, front: boolean) => {
    const x = s * (front ? 0.17 : 0.19);
    const z = front ? 0.3 : -0.34;
    const root: [number, number, number] = [x, front ? 0.31 : 0.33, z];
    const foot: [number, number, number] = [x, 0.055, z];
    const pts = limb(root, foot, front ? [0.14, 0.14] : [0.15, 0.14], front ? [[0, 0, -1]] : [[0, 0, 1]]);
    const names = front ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`] : [`hip${side}`, `knee${side}`, `ankle${side}`];
    const leg = b.chain(`leg${side}${front ? "F" : "H"}`, pts, {
      parent: front ? spine.joints[2] : hips,
      names,
      role: "leg",
    });
    b.sweep(leg, front ? [0.085, 0.05] : [0.105, 0.055], { color: coat, name: `leg${side}${front ? "F" : "H"}` });
    const toes = front ? 4 : 3;
    for (let i = 0; i < toes; i++) {
      const dx = (i - (toes - 1) / 2) * 0.026;
      b.part(new THREE.SphereGeometry(0.026, 6, 4), padPaint, { bone: leg.tip!, at: [x + dx, 0.032, z + 0.05], scale: [0.9, 0.75, 1.35] });
    }
    b.part(new THREE.SphereGeometry(0.04, 6, 4), padPaint, { bone: leg.tip!, at: [x, 0.03, z - 0.01], scale: [1.2, 0.7, 1] });
  };
  for (const [side, s] of [["L", 1], ["R", -1]] as const) {
    makeLeg(side, s, true);
    makeLeg(side, s, false);
  }

  // ---------- the bird ----------
  const bird = b.joint("bird", { parent: head, at: [0, 0.6, 0.62], dir: [0, 0.1, 1] });
  const birdHead = b.joint("birdHead", { parent: bird, at: [0, 0.66, 0.66], aim: [0, 0.665, 0.72] });
  const birdTail = b.joint("birdTail", { parent: bird, at: [0, 0.6, 0.57], aim: [0, 0.62, 0.47], role: "tail" });
  const wings = [1, -1].map((s) =>
    b.joint(`wing${s > 0 ? "L" : "R"}`, {
      parent: bird,
      at: [s * 0.055, 0.61, 0.62],
      aim: [s * 0.06, 0.6, 0.54],
      role: "wing",
    }),
  );
  b.part(new THREE.SphereGeometry(0.06, 10, 8), birdPaint, { bone: bird, at: [0, 0.6, 0.62], scale: [0.9, 0.85, 1.1] });
  b.part(new THREE.SphereGeometry(0.042, 10, 8), birdPaint, { bone: birdHead, at: [0, 0.67, 0.66] });
  b.spike([0, 0.667, 0.7], [0, -0.1, 1], 0.04, 0.014, beakPaint, { bone: birdHead, name: "beak" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.009, 6, 4), INK, { bone: birdHead, at: [s * 0.03, 0.678, 0.685] });
    b.part(new THREE.SphereGeometry(0.003, 4, 3), WHITE, { bone: birdHead, at: [s * 0.033, 0.682, 0.692] });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), cel("#ff8fa0"), { bone: birdHead, at: [s * 0.036, 0.662, 0.682], scale: [0.5, 0.8, 1] });
    b.part(new THREE.SphereGeometry(0.05, 8, 6), birdWing, {
      bone: wings[s > 0 ? 0 : 1],
      at: [s * 0.058, 0.605, 0.6],
      scale: [0.35, 0.8, 1.3],
    });
    b.spike([s * 0.062, 0.6, 0.55], [s * 0.1, 0.1, -1], 0.04, 0.012, birdWing, { bone: wings[s > 0 ? 0 : 1] });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), beakPaint, { bone: bird, at: [s * 0.022, 0.552, 0.64], scale: [1.2, 0.6, 1.6] });
  }
  for (let k = -1; k <= 1; k++) {
    b.spike([0, 0.705, 0.655 + 0.012 * k], [0, 1, -0.6 - 0.3 * k], 0.04, 0.008, BLUED, { bone: birdHead });
    b.spike([k * 0.015, 0.605, 0.56], [k * 0.25, 0.05, -1], 0.07, 0.014, BLUED, { bone: birdTail });
  }

  return b.root;
}
