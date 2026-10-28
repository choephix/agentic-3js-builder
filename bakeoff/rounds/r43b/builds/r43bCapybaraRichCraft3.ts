import * as THREE from "three";
import { createBuilder, rng, catmull, limb, countershade, mottle, gradient, svg } from "../../../../src/index";

export const meta = {
  name: "Capybara with a small bird",
  description: "A chubby, sleepy-eyed rigged capybara with a little blue bird perched on its head.",
};

export default function build() {
  const b = createBuilder({ name: "capybara" });

  // ---------- palette ----------
  const FUR = countershade(
    mottle("#a06f40", "#8a5b32", { size: 0.1, seed: 3 }),
    mottle("#d4a66c", "#c4955c", { size: 0.1, seed: 4 }),
    { level: -0.15 },
  );
  const FUR_FACE = mottle("#b5824c", "#a26f3e", { size: 0.06, seed: 5 });
  const MUZZLE = countershade(mottle("#c08c55", "#b07c48", { size: 0.05, seed: 6 }), "#dcb27c", { level: -0.2 });
  const DARK = "#3a2a20";
  const PAD = "#4a3228";
  const PINK = "#f2a0a0";
  const CREAM = "#fff1c2";
  const BLUE = "#4aa8e0";
  const BLUE_D = "#2f7fc4";
  const ORANGE = "#ffa22e";
  const WHITE = "#ffffff";
  const FOOT = "#5a3d28";
  const bodyFur = (c: any) => c;

  // ---------- textures ----------
  const EYE = svg(
    `<svg viewBox="0 0 64 64">
      <ellipse cx="32" cy="36" rx="16" ry="18" fill="#1d130e"/>
      <ellipse cx="32" cy="36" rx="16" ry="18" fill="none" stroke="#4a2f1c" stroke-width="3"/>
      <circle cx="26" cy="29" r="6.5" fill="#fff"/>
      <circle cx="38" cy="43" r="3" fill="#fff"/>
      <path d="M13 28 Q32 6 51 28 Q32 16 13 28Z" fill="#6e4726" stroke="#3a2415" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M14 26 L7 20 M17 20 L12 12" stroke="#3a2415" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  const TUFT = svg(
    `<svg viewBox="0 0 32 64">
      <path d="M2 64 Q6 28 10 4 Q14 30 16 64Z" fill="#ffffff"/>
      <path d="M12 64 Q18 20 22 0 Q26 30 30 64Z" fill="#e4e4e4"/>
      <path d="M8 64 Q12 40 16 20 Q19 40 22 64Z" fill="#cfcfcf"/>
    </svg>`,
    { size: 96 },
  );

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.36, -0.3], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.36, -0.3],
      [0, 0.35, -0.08],
      [0, 0.35, 0.14],
      [0, 0.37, 0.32],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.4, 0.3],
      [0, 0.44, 0.44],
      [0, 0.46, 0.56],
    ]),
    { parent: spine.joints[spine.joints.length - 1], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[neck.joints.length - 1],
    at: [0, 0.46, 0.56],
    aim: [0, 0.46, 0.8],
    role: "head",
  });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.335, 0.68], aim: [0, 0.335, 0.9], role: "jaw" });

  // ---------- body ----------
  const body = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * Math.min(1, Math.max(0, t * 0.9 + 0.05)));
      return [0.17 + 0.04 * k, 0.17 + 0.04 * k];
    },
    { color: bodyFur(FUR), sides: 12 },
  );
  b.sweep(neck, [0.16, 0.14], { color: FUR, sides: 10 });
  // tail nub
  b.part(new THREE.SphereGeometry(0.03, 8, 6), FUR, { bone: hips, at: [0, 0.34, -0.5] });

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const front = limb([s * 0.13, 0.3, 0.24], [s * 0.13, 0.035, 0.26], [0.17, 0.15], [[0, 0, -1]]);
    const hind = limb([s * 0.14, 0.3, -0.24], [s * 0.14, 0.035, -0.3], [0.17, 0.15], [[0, 0, 1]]);
    const defs = [
      { pts: front, names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`], role: "arm" as const, z: 0.26, x: s * 0.13, n: 4 },
      { pts: hind, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" as const, z: -0.3, x: s * 0.14, n: 3 },
    ];
    for (const d of defs) {
      const parent = spine.nearestJoint(d.pts[0]);
      const leg = b.chain(`leg${d.role}${S}`, d.pts, { parent, names: d.names, role: d.role === "arm" ? "arm" : "leg", contact: [d.x, 0, d.z] });
      b.sweep(leg, [0.085, 0.052], {
        color: gradient(FUR, FOOT, [0, 0.12, 0], [0, 0.03, 0]),
        sides: 8,
      });
      const tip = leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(1, 8, 6), FOOT, {
        bone: tip,
        at: [d.x, 0.03, d.z + 0.03],
        scale: [0.055, 0.03, 0.075],
      });
      for (let i = 0; i < d.n; i++) {
        const ox = (i - (d.n - 1) / 2) * 0.03;
        b.part(new THREE.SphereGeometry(0.02, 6, 5), FOOT, {
          bone: tip,
          at: [d.x + ox, 0.022, d.z + 0.1],
          scale: [1, 0.85, 1.25],
        });
        b.part(new THREE.SphereGeometry(0.009, 5, 4), "#2a1c14", {
          bone: tip,
          at: [d.x + ox, 0.02, d.z + 0.125],
          scale: [1, 0.8, 0.8],
        });
      }
    }
  }

  // ---------- head ----------
  const C: [number, number, number] = [0, 0.46, 0.66];
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), FUR_FACE, { bone: head, at: C, scale: [0.155, 0.15, 0.2] });
  b.frustumBox([0, 0.45, 0.68], [0, 0.45, 0.86], [0.22, 0.24], [0.2, 0.21], { bone: head, color: MUZZLE });
  // nose pad & nostrils
  b.part(new THREE.SphereGeometry(1, 10, 8), PAD, { bone: head, at: [0, 0.52, 0.86], scale: [0.105, 0.06, 0.045] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#150d09", { bone: head, at: [s * 0.04, 0.535, 0.9], scale: [1, 0.8, 0.7] });
  }
  // lower jaw
  b.part(new THREE.BoxGeometry(0.19, 0.07, 0.18), "#d6a870", { bone: jaw, at: [0, 0.3, 0.77] });
  b.part(new THREE.BoxGeometry(0.2, 0.012, 0.19), "#5a2a28", { bone: jaw, at: [0, 0.336, 0.77] });
  b.part(new THREE.SphereGeometry(0.03, 6, 5), PAD, { bone: jaw, at: [0, 0.285, 0.855], scale: [1.4, 0.8, 0.8] });
  // incisors
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.02, 0.03, 0.012), "#fff6dc", { bone: head, at: [s * 0.014, 0.322, 0.852] });

  const skin = b.surface(skull);
  const on = (az: number, el: number) => skin.around(C).at(az, el)!;
  for (const s of [1, -1]) {
    const eyeHit = on(s * 68, 25);
    b.decal(skin, EYE, { at: eyeHit, size: [0.075, 0.075], mirror: s > 0, lift: 0.002 });
    // cheeks
    b.stick(new THREE.CylinderGeometry(0.032, 0.032, 0.01, 10), PINK, on(s * 75, -12), { embed: 0.5 });
    // ears
    const ear = on(s * 138, 42);
    b.stick(new THREE.SphereGeometry(0.04, 8, 6).scale(1, 1.3, 0.6), "#7d5230", ear, { embed: 0.35 });
    b.stick(new THREE.SphereGeometry(0.025, 7, 5).scale(1, 1.2, 0.5), PINK, ear.moved([0, 0.012, 0.02]), { embed: 0.3 });
    // brow bump
    b.stick(new THREE.SphereGeometry(0.03, 6, 5).scale(1.4, 0.6, 1), "#8c5c32", on(s * 55, 50), { embed: 0.5 });
    // whiskers
    for (let i = 0; i < 3; i++) {
      b.rod([s * 0.095, 0.44 + i * 0.012, 0.845], [s * 0.2, 0.43 + i * 0.03 - 0.02, 0.9 + i * 0.01], 0.002, DARK, { bone: head, sides: 4 });
    }
  }

  // ---------- fur tufts ----------
  const hitsBody = b.surface(body).scatter(150, { rng: rng(3), minDist: 0.045, filter: (h) => h.n.y > -0.1 });
  b.cards(hitsBody, TUFT, { size: [0.035, 0.055], lean: 70, bend: 20, vary: 0.3, rng: rng(4), color: "#9a6a3c" });
  const hitsHead = skin.scatter(30, { rng: rng(8), minDist: 0.035, filter: (h) => h.n.y < 0.5 && h.n.z < 0.5 });
  b.cards(hitsHead, TUFT, { size: [0.025, 0.035], lean: 70, vary: 0.3, rng: rng(9), color: "#b07a44" });

  // ---------- bird ----------
  const birdBody = b.joint("birdBody", { parent: head, at: [0, 0.65, 0.64], aim: [0, 0.7, 0.66] });
  const birdHead = b.joint("birdHead", { parent: birdBody, at: [0, 0.7, 0.665], aim: [0, 0.75, 0.69] });
  const beakLow = b.joint("beakLow", { parent: birdHead, at: [0, 0.71, 0.715], aim: [0, 0.71, 0.74], role: "jaw" });
  const wings: Record<number, any> = {};
  for (const s of [1, -1])
    wings[s] = b.joint(s > 0 ? "wingL" : "wingR", {
      parent: birdBody,
      at: [s * 0.055, 0.665, 0.635],
      aim: [s * 0.15, 0.68, 0.6],
      role: "wing",
    });
  const birdTail = b.joint("birdTail", { parent: birdBody, at: [0, 0.655, 0.6], aim: [0, 0.67, 0.53], role: "tail" });

  b.part(new THREE.SphereGeometry(1, 10, 8), countershade(BLUE, CREAM, { level: -0.1 }), {
    bone: birdBody,
    at: [0, 0.655, 0.64],
    scale: [0.058, 0.055, 0.068],
  });
  b.part(new THREE.SphereGeometry(1, 10, 8), BLUE, { bone: birdHead, at: [0, 0.72, 0.68], scale: [0.04, 0.038, 0.04] });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 6), ORANGE, { bone: birdHead, at: [0, 0.722, 0.73], dir: [0, 0, 1] });
  b.part(new THREE.ConeGeometry(0.011, 0.028, 6), "#e88a1e", { bone: beakLow, at: [0, 0.709, 0.725], dir: [0, 0, 1] });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 6, 5), "#111111", { bone: birdHead, at: [s * 0.03, 0.73, 0.7] });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, { bone: birdHead, at: [s * 0.034, 0.734, 0.708] });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), "#ff8aa0", { bone: birdHead, at: [s * 0.034, 0.712, 0.698], scale: [0.6, 1, 1] });
    // wings
    b.part(new THREE.SphereGeometry(1, 8, 6), BLUE_D, {
      bone: wings[s],
      at: [s * 0.1, 0.667, 0.62],
      dir: [s, 0.25, -0.3],
      scale: [0.03, 0.05, 0.011],
    });
    b.part(new THREE.SphereGeometry(1, 6, 5), "#1f5a96", {
      bone: wings[s],
      at: [s * 0.145, 0.678, 0.605],
      dir: [s, 0.25, -0.3],
      scale: [0.02, 0.025, 0.008],
    });
    // legs
    b.rod([s * 0.02, 0.64, 0.65], [s * 0.02, 0.605, 0.66], 0.004, ORANGE, { bone: birdBody, sides: 4 });
    b.part(new THREE.BoxGeometry(0.018, 0.006, 0.03), ORANGE, { bone: birdBody, at: [s * 0.02, 0.606, 0.672] });
  }
  b.part(new THREE.SphereGeometry(1, 6, 5), BLUE_D, {
    bone: birdTail,
    at: [0, 0.665, 0.56],
    dir: [0, 0.2, -1],
    scale: [0.03, 0.05, 0.008],
  });
  // crest
  for (let i = -1; i <= 1; i++) {
    b.part(new THREE.ConeGeometry(0.008, 0.035, 5), BLUE_D, {
      bone: birdHead,
      at: [i * 0.012, 0.755, 0.67 - Math.abs(i) * 0.004],
      dir: [i * 0.4, 1, -0.5],
    });
  }

  return b.root;
}
