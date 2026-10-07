import * as THREE from "three";
import { createBuilder, catmull, polyline, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Koala",
  description: "A stylized sitting koala with big fluffy ears, a leathery nose, and clasping claws, rigged in a rest pose.",
};

const GRAY = "#8d9096";
const DARK = "#6c6f75";
const CREAM = "#e0dccf";
const NOSE = "#1e1b1c";
const EAR_IN = "#efe9dc";
const CLAW = "#2b2929";
const PAD = "#4a4446";

export default function build() {
  const b = createBuilder({ name: "koala" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.15, -0.03], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.15, -0.03],
      [0, 0.32, -0.02],
      [0, 0.48, 0.02],
      [0, 0.58, 0.05],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3", "neck"], role: "spine" },
  );
  const head = b.joint("head", { parent: spine.tip!, at: [0, 0.58, 0.05], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.07, down: 0.04 }),
    dir: [0, -0.05, 1],
    role: "jaw",
  });

  // ---------- body ----------
  const fur = countershade(mottle(GRAY, DARK, { size: 0.07, contrast: 0.5, seed: 3 }), CREAM, { level: -0.45, soft: 0.5 });
  const body = b.sweep(spine, [0.15, 0.19, 0.16, 0.1], { color: fur, sides: 10 });

  // chest patch
  b.part(new THREE.SphereGeometry(1, 10, 8), CREAM, {
    bone: spine.joints[1],
    at: [0, 0.34, 0.12],
    scale: [0.1, 0.15, 0.06],
    flat: true,
  });

  // ---------- head ----------
  b.part(new THREE.SphereGeometry(1, 12, 9), fur, {
    bone: head,
    at: head.local({ forward: 0.03, up: 0.06 }),
    scale: [0.17, 0.13, 0.14],
    flat: true,
  });
  // cheek fluff
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const base = head.local({ left: s * 0.13, forward: 0.03 + i * 0.01, up: 0.0 - i * 0.025 });
      const tip = head.local({ left: s * (0.22 + i * 0.01), forward: 0.04, up: -0.03 - i * 0.04 });
      b.spike(base, tip, null, 0.04, { bone: head, color: CREAM, sides: 5 });
    }
  }
  // muzzle
  b.part(new THREE.SphereGeometry(1, 10, 8), "#a9acb0", {
    bone: head,
    at: head.local({ forward: 0.13, up: 0.03 }),
    scale: [0.07, 0.06, 0.07],
    flat: true,
  });
  // upper lip/ lower jaw
  b.part(new THREE.SphereGeometry(1, 8, 6), CREAM, {
    bone: jaw,
    at: jaw.local({ forward: 0.05, up: -0.005 }),
    scale: [0.06, 0.06, 0.035],
    flat: true,
  });
  // nose
  b.part(new THREE.SphereGeometry(1, 8, 6), NOSE, {
    bone: head,
    at: head.local({ forward: 0.185, up: 0.06 }),
    scale: [0.05, 0.035, 0.065],
    flat: true,
  });
  // eyes + highlights, ears
  for (const s of [1, -1]) {
    const eyeAt = head.local({ left: s * 0.07, forward: 0.13, up: 0.1 });
    b.part(new THREE.SphereGeometry(0.02, 8, 6), NOSE, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.006, 5, 4), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.07 + s * 0.003, forward: 0.147, up: 0.11 }),
    });
    const earAt = head.local({ left: s * 0.145, forward: -0.01, up: 0.14 });
    b.part(new THREE.SphereGeometry(1, 10, 8), fur, {
      bone: head,
      at: earAt,
      scale: [0.035, 0.09, 0.09],
      rotation: [0, 0, s * -10],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(1, 10, 8), EAR_IN, {
      bone: head,
      at: head.local({ left: s * 0.16, forward: 0.0, up: 0.14 }),
      scale: [0.03, 0.07, 0.07],
      rotation: [0, 0, s * -10],
      flat: true,
    });
    // ear fringe tufts
    for (let i = 0; i < 5; i++) {
      const a = (-0.9 + i * 0.45) * 1.0;
      const base = head.local({ left: s * 0.17, forward: -0.01 + Math.sin(a) * 0.07, up: 0.14 + Math.cos(a) * 0.075 });
      const tip = head.local({ left: s * 0.185, forward: -0.01 + Math.sin(a) * 0.105, up: 0.14 + Math.cos(a) * 0.11 });
      b.spike(base, tip, null, 0.016, { bone: head, color: EAR_IN, sides: 4 });
    }
  }

  // ---------- legs ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${side}`,
      catmull([
        [s * 0.12, 0.16, 0.0],
        [s * 0.2, 0.12, 0.2],
        [s * 0.17, 0.05, 0.34],
      ]),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", contact: [s * 0.17, 0, 0.38] },
    );
    b.sweep(leg, [0.09, 0.075, 0.05], { color: fur, sides: 8 });
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), PAD, {
      bone: ankle,
      at: [s * 0.17, 0.028, 0.37],
      scale: [0.055, 0.03, 0.09],
      flat: true,
    });
    for (let i = 0; i < 3; i++) {
      const ang = (i - 1) * 0.28;
      const from: [number, number, number] = [s * 0.17 + Math.sin(ang) * 0.02, 0.026, 0.38];
      const to: [number, number, number] = [s * 0.17 + Math.sin(ang) * 0.09, 0.024, 0.38 + Math.cos(ang) * 0.07];
      b.capsule(from, to, 0.022, { bone: ankle, color: GRAY, sides: 6 });
      b.spike(to, [Math.sin(ang), -0.1, Math.cos(ang)], 0.04, 0.012, { bone: ankle, color: CLAW, sides: 5 });
    }
  }

  // ---------- arms ----------
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wrist: [number, number, number] = [s * 0.29, 0.3, 0.26];
    const arm = b.chain(
      `arm${side}`,
      catmull([
        [s * 0.15, 0.46, 0.04],
        [s * 0.25, 0.38, 0.14],
        wrist,
      ]),
      { parent: spine.joints[2], names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`], role: "arm" },
    );
    b.sweep(arm, [0.065, 0.05, 0.04], { color: fur, sides: 8 });
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(1, 8, 6), PAD, {
      bone: hand,
      at: [s * 0.29, 0.28, 0.285],
      scale: [0.04, 0.035, 0.05],
      flat: true,
    });
    for (let i = 0; i < 3; i++) {
      const ang = (i - 1) * 0.45;
      const tip: [number, number, number] = [wrist[0] + s * Math.sin(ang) * 0.09 + s * 0.02, wrist[1] - 0.07, wrist[2] + Math.cos(ang) * 0.08];
      const dgt = b.chain(`finger${side}${i}`, polyline([wrist, tip]), {
        parent: hand,
        names: [`finger${side}${i}`],
        role: "digit",
      });
      b.sweep(dgt, [0.024, 0.018], { color: GRAY, sides: 6 });
      const d = [tip[0] - wrist[0], tip[1] - wrist[1], tip[2] - wrist[2]];
      b.spike(tip, d, 0.05, 0.013, { bone: dgt.joints[0], color: CLAW, sides: 5 });
    }
  }

  // body reference to avoid unused warning
  void body;
  return b.root;
}
