```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

type V = [number, number, number];

const RED = "#b8291a";
const DEEP = "#7a1610";
const ORANGE = "#ee7a22";
const WING = "#f08a2e";
const GOLD = "#f7c044";
const BEAK = "#e9a53a";
const DARK = "#2a1410";
const EYE = "#ffd21f";

const dist = (a: V, c: V) => Math.hypot(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
const avg = (a: V, c: V): V => [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2];
const mirror = (p: V, s: number): V => [p[0] * s, p[1], p[2]];

export const meta = {
  name: "Phoenix",
  description: "A standing phoenix with wings half-spread, a flaming tail and a crest of gold plumes.",
};

export default function build() {
  const b = createBuilder({ name: "phoenix" });

  // Helpers: every piece goes through b.part so it lands on a bone.
  const opt = (bone?: unknown, extra: Record<string, unknown> = {}) =>
    ({ ...extra, ...(bone ? { bone } : {}) }) as any;

  const seg = (a: V, c: V, r0: number, r1: number, color: string, bone?: unknown) => {
    const geo = new THREE.CylinderGeometry(r1, r0, dist(a, c), 6, 1);
    b.part(geo, color, opt(bone, { at: avg(a, c), aim: c }));
  };

  const cone = (base: V, tip: V, rad: number, color: string, bone?: unknown) => {
    const geo = new THREE.ConeGeometry(rad, dist(base, tip), 6, 1);
    b.part(geo, color, opt(bone, { at: avg(base, tip), aim: tip }));
  };

  const ball = (c: V, rad: number, color: string, sc?: V, bone?: unknown) => {
    const geo = new THREE.SphereGeometry(rad, 10, 8);
    b.part(geo, color, opt(bone, { at: c, ...(sc ? { scale: sc } : {}) }));
  };

  // ---- Skeleton (model space, +Z is forward, meters) ----
  const hips = b.joint("hips", { at: [0, 1.0, 0] } as any);
  const chest = b.joint("chest", { at: [0, 1.25, 0.12], parent: hips } as any);
  const neck1 = b.joint("neck1", { at: [0, 1.5, 0.28], parent: chest } as any);
  const neck2 = b.joint("neck2", { at: [0, 1.72, 0.42], parent: neck1 } as any);
  const head = b.joint("head", { at: [0, 1.9, 0.5], parent: neck2 } as any);
  const jaw = b.joint("jaw", { at: [0, 1.84, 0.6], parent: head } as any);

  const tail1 = b.joint("tail1", { at: [0, 0.95, -0.2], parent: hips } as any);
  const tail2 = b.joint("tail2", { at: [0, 0.8, -0.55], parent: tail1 } as any);
  const tail3 = b.joint("tail3", { at: [0, 0.7, -0.9], parent: tail2 } as any);

  // Paired limbs and wings. Left is +X.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hip = b.joint("hip" + side, { at: [0.14 * s, 1.0, 0.02], parent: hips } as any);
    const knee = b.joint("knee" + side, { at: [0.16 * s, 0.6, 0.12], parent: hip } as any);
    const ankle = b.joint("ankle" + side, { at: [0.14 * s, 0.2, -0.04], parent: knee } as any);
    const shoulder = b.joint("shoulder" + side, { at: [0.18 * s, 1.4, 0.12], parent: chest } as any);
    const elbow = b.joint("elbow" + side, { at: [0.6 * s, 1.52, 0.02], parent: shoulder } as any);
    const wrist = b.joint("wrist" + side, { at: [1.02 * s, 1.42, -0.12], parent: elbow } as any);
    const digit = b.joint("digit" + side, { at: [1.4 * s, 1.2, -0.3], parent: wrist } as any);

    // Legs: thigh, shin, foot and three talons touching the floor.
    const hipP: V = [0.14 * s, 1.0, 0.02];
    const kneeP: V = [0.16 * s, 0.6, 0.12];
    const ankleP: V = [0.14 * s, 0.2, -0.04];
    const footP: V = [0.14 * s, 0.04, 0.06];
    seg(hipP, kneeP, 0.045, 0.036, GOLD, hip);
    seg(kneeP, ankleP, 0.036, 0.03, GOLD, knee);
    seg(ankleP, footP, 0.03, 0.026, GOLD, ankle);
    for (const dx of [-0.04, 0, 0.04]) {
      cone([footP[0] + dx * s, 0.05, footP[2] - 0.01], [footP[0] + dx * 1.6 * s, 0.005, footP[2] + 0.12], 0.014, BEAK, ankle);
    }

    // Wing arm: shoulder, elbow, wrist, digit.
    const lead: V[] = [
      mirror([0.18, 1.42, 0.12], s),
      mirror([0.6, 1.52, 0.02], s),
      mirror([1.02, 1.42, -0.12], s),
      mirror([1.4, 1.2, -0.3], s),
    ];
    const trail: V[] = [
      mirror([0.14, 1.2, -0.1], s),
      mirror([0.5, 1.12, -0.28], s),
      mirror([0.95, 1.02, -0.46], s),
      mirror([1.42, 1.06, -0.44], s),
    ];
    seg(lead[0], lead[1], 0.05, 0.04, RED, shoulder);
    seg(lead[1], lead[2], 0.04, 0.032, RED, elbow);
    seg(lead[2], lead[3], 0.032, 0.02, RED, wrist);
    ball(lead[3], 0.035, GOLD, undefined, digit);

    // Wing membrane between the arm and the trailing edge.
    b.membrane(lead, trail, { color: WING } as any);

    // Primary feathers hanging off the trailing edge.
    const primaryColors = [GOLD, ORANGE, RED, ORANGE];
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const x = 0.95 + 0.47 * t;
      const y = 1.02 + 0.04 * t;
      const z = -0.46 + 0.02 * t;
      cone(
        mirror([x, y, z], s),
        mirror([x + 0.12, y - 0.06, z - 0.5], s),
        0.05,
        primaryColors[i],
        digit,
      );
    }

    // Coverts along the leading edge, pointing back.
    for (let i = 0; i < 3; i++) {
      const base = avg(lead[i], lead[i + 1]);
      cone(base, [base[0] + 0.05 * s, base[1] - 0.02, base[2] - 0.22], 0.035, GOLD, elbow);
    }
  }

  // ---- Body ----
  ball([0, 1.0, -0.02], 0.2, ORANGE, [0.95, 1.0, 1.05], hips);
  ball([0, 1.22, 0.08], 0.3, RED, [0.85, 1.05, 1.15], chest);
  ball([0, 1.14, 0.22], 0.2, GOLD, [0.9, 1.0, 0.8], chest);

  // Neck and head.
  seg([0, 1.25, 0.12], [0, 1.5, 0.28], 0.14, 0.1, RED, chest);
  seg([0, 1.5, 0.28], [0, 1.72, 0.42], 0.1, 0.085, ORANGE, neck1);
  seg([0, 1.72, 0.42], [0, 1.9, 0.5], 0.085, 0.09, ORANGE, neck2);
  ball([0, 1.9, 0.5], 0.17, RED, [1, 1.0, 1.05], head);

  // Crest of flame plumes.
  cone([0, 1.98, 0.46], [0, 2.22, 0.36], 0.06, GOLD, head);
  cone([0, 1.98, 0.46], [0.06, 2.1, 0.3], 0.05, ORANGE, head);
  cone([0, 1.98, 0.46], [-0.06, 2.1, 0.3], 0.05, ORANGE, head);

  // Split beak: upper on the head, lower on the jaw joint.
  cone([0, 1.92, 0.64], [0, 1.86, 0.9], 0.07, BEAK, head);
  cone([0, 1.84, 0.6], [0, 1.8, 0.82], 0.05, BEAK, jaw);

  // Eyes.
  for (const sx of [1, -1]) {
    ball([0.085 * sx, 1.95, 0.6], 0.04, EYE, undefined, head);
    ball([0.1 * sx, 1.95, 0.63], 0.02, DARK, undefined, head);
  }

  // ---- Tail flame ----
  seg([0, 0.95, -0.02], [0, 0.95, -0.2], 0.13, 0.11, RED, tail1);
  seg([0, 0.95, -0.2], [0, 0.8, -0.55], 0.11, 0.08, RED, tail2);
  seg([0, 0.8, -0.55], [0, 0.7, -0.9], 0.08, 0.05, DEEP, tail3);

  const flameTips: V[] = [
    [-0.3, 0.55, -1.5],
    [-0.15, 0.35, -1.62],
    [0, 0.25, -1.68],
    [0.15, 0.35, -1.62],
    [0.3, 0.55, -1.5],
  ];
  const flameColors = [GOLD, ORANGE, RED, ORANGE, GOLD];
  flameTips.forEach((tip, i) => {
    const base: V = [tip[0] * 0.15, 0.7, -0.88];
    cone(base, tip, 0.07, flameColors[i], tail3);
  });

  return b.root;
}
```