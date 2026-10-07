```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle, gradient, catmull, bezier, polyline, svg } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Penguin Parent with Chick",
  description:
    "Emperor penguin with glossy blue-black back and head, white belly fading to golden neck and ear patches, slender orange-striped beak, stubby flippers and big black feet, with a fluffy grey chick between its feet.",
};

const DARK = "#1b2438";
const DARK2 = "#27344f";
const WHITE = "#f4f2ec";
const GOLD = "#f0b93c";
const BLACK = "#0a0a0e";
const PINK = "#ec8a5c";
const CHICK = "#aaa59d";

const prof = (k: number[]) => (t: number) => {
  const x = Math.min(Math.max(t, 0), 1) * (k.length - 1);
  const i = Math.min(Math.floor(x), k.length - 2);
  return k[i] + (k[i + 1] - k[i]) * (x - i);
};

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });

  // ---------- skeleton ----------
  const hips = b.joint("hips", { at: [0, 0.2, -0.06], aim: [0, 0.45, -0.04], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.2, -0.06],
      [0, 0.45, -0.04],
      [0, 0.68, 0],
      [0, 0.88, 0.03],
      [0, 1.0, 0.05],
    ]),
    { parent: hips, count: 4, role: "spine" },
  );
  const head = b.joint("head", { parent: spine.joints[3], at: [0, 1.0, 0.05], aim: [0, 1.06, 0.11], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.045, 0.115], aim: [0, 1.035, 0.2], role: "jaw" });

  // ---------- body ----------
  const frontGrad = gradient(WHITE, GOLD, [0, 0.68, 0], [0, 0.9, 0]);
  const backPaint = mottle(DARK, DARK2, { size: 0.12, contrast: 0.6, seed: 3 });
  const bodyPaint = paint((p, n) => {
    if (p.y > 0.84 && n.z > -0.5) return frontGrad;
    if (n.z > 0.3) return frontGrad;
    return backPaint;
  });
  const radius = prof([0.1, 0.17, 0.2, 0.19, 0.15, 0.09, 0.07]);
  b.sweep(spine, (t) => [radius(t), radius(t) * 0.9], { color: bodyPaint, sides: 12 });

  // tail wedge
  b.extrude(
    [
      [0, 0.0],
      [0.08, 0.0],
      [0.22, -0.13, "sharp"],
      [0.12, -0.16],
      [0, -0.1],
    ],
    { at: [0, 0.3, -0.15], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.03, color: DARK, bone: hips },
  );

  // ---------- head ----------
  const headPaint = paint((p, n) => {
    const d = Math.hypot(p.y - 1.045, p.z - 0.055);
    if (d < 0.034 && Math.abs(n.x) > 0.4) return GOLD;
    if (n.y < -0.4 && p.z > 0.03) return GOLD;
    return DARK;
  });
  b.part(new THREE.SphereGeometry(0.075, 12, 9), headPaint, {
    bone: head,
    at: [0, 1.06, 0.07],
    scale: [0.95, 1, 1.1],
  });

  // beak
  b.sweep(bezier([0, 1.065, 0.13], [0, 1.065, 0.22], [0, 1.03, 0.31]), [0.028, 0.006], {
    bone: head,
    color: BLACK,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });
  b.sweep(bezier([0, 1.04, 0.12], [0, 1.03, 0.2], [0, 1.0, 0.27]), [0.022, 0.006], {
    bone: jaw,
    color: PINK,
    sides: 6,
    caps: { start: "flat", end: "point" },
  });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    // beak stripe
    b.rod([s * 0.024, 1.052, 0.15], [s * 0.008, 1.03, 0.27], 0.006, { bone: head, color: PINK, sides: 5 });
    // eyes
    const eyeAt: [number, number, number] = [s * 0.06, 1.082, 0.115];
    b.part(new THREE.SphereGeometry(0.014, 6, 5), BLACK, { bone: head, at: eyeAt });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, { bone: head, at: [s * 0.068, 1.088, 0.124] });

    // ---------- flippers ----------
    const sh: [number, number, number] = [s * 0.12, 0.8, 0.02];
    const dir: [number, number, number] = [s * 0.45, -0.89, 0.0];
    const tip: [number, number, number] = [sh[0] + dir[0] * 0.34, sh[1] + dir[1] * 0.34, sh[2]];
    const arm = b.chain(`arm${side}`, polyline([sh, tip]), {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `wrist${side}`],
      role: "arm",
    });
    const flipPaint = paint((_p, n) => (n.x * s > 0.3 ? DARK : n.x * s < -0.3 ? WHITE : DARK));
    b.extrude(
      [
        [0, -0.03],
        [0.1, -0.055],
        [0.25, -0.048],
        [0.34, -0.01, "sharp"],
        [0.25, 0.03],
        [0.1, 0.045],
        [0, 0.03],
      ],
      {
        at: sh,
        x: dir,
        y: [0, 0, 1],
        thickness: [0.03, 0.012],
        bevel: 0.006,
        smoothing: 1,
        color: flipPaint,
        bone: arm.joints[0],
      },
    );

    // ---------- legs & feet ----------
    const fx = s * 0.1;
    const leg = b.chain(
      `leg${side}`,
      polyline([
        [s * 0.08, 0.2, 0.0],
        [fx, 0.05, 0.05],
      ]),
      { parent: spine.joints[0], names: [`hip${side}`, `ankle${side}`], role: "leg" },
    );
    const foot = leg.joints[leg.joints.length - 1];
    b.capsule([s * 0.08, 0.2, 0.0], [fx, 0.05, 0.05], 0.04, { color: DARK, bone: leg.joints[0] });
    b.capsule([fx, 0.03, 0.03], [fx, 0.03, 0.09], 0.03, { color: BLACK, bone: foot, sides: 8 });
    for (const k of [-1, 0, 1]) {
      const toe = b.capsule([fx + k * 0.012, 0.022, 0.07], [fx + k * 0.055, 0.022, 0.2], [0.024, 0.016], {
        color: BLACK,
        bone: foot,
        sides: 6,
      });
      b.spike([fx + k * 0.055, 0.022, 0.2], [0, 0, 1], 0.035, 0.012, { color: "#2a2a30", bone: foot, sides: 5 });
      void toe;
    }
  }

  // ---------- chick ----------
  const cBody = b.joint("chickBody", { parent: hips, at: [0, 0.14, 0.12], aim: [0, 0.25, 0.14] });
  const cHead = b.joint("chickHead", { parent: cBody, at: [0, 0.25, 0.17], aim: [0, 0.3, 0.2] });
  const cb = b.part(new THREE.SphereGeometry(0.1, 10, 8), CHICK, {
    bone: cBody,
    at: [0, 0.14, 0.12],
    scale: [1.05, 1.0, 0.95],
  });
  b.part(new THREE.SphereGeometry(0.065, 10, 8), "#45454b", { bone: cHead, at: [0, 0.285, 0.18] });
  b.part(new THREE.SphereGeometry(0.045, 8, 6), WHITE, {
    bone: cHead,
    at: [0, 0.272, 0.21],
    scale: [1.1, 1, 0.8],
  });
  b.spike([0, 0.268, 0.245], [0, -0.05, 1], 0.04, 0.012, { color: BLACK, bone: cHead, sides: 5 });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), BLACK, { bone: cHead, at: [s * 0.03, 0.29, 0.238] });
    b.part(new THREE.SphereGeometry(0.004, 4, 3), WHITE, { bone: cHead, at: [s * 0.034, 0.295, 0.248] });
  }

  const tuft = svg(
    `<svg viewBox="0 0 32 48"><path d="M16 2 C20 14 28 24 26 46 L6 46 C4 24 12 14 16 2 Z" fill="#c2bdb4"/><path d="M16 12 C18 22 22 30 20 46 L12 46 C10 30 14 22 16 12 Z" fill="#9a958d"/></svg>`,
    { size: 96 },
  );
  const hits = b.surface(cb).scatter(110, { rng: rng(5), minDist: 0.025, filter: (h) => h.n.y > -0.2 });
  b.cards(hits, tuft, { size: [0.045, 0.055], lean: 55, bend: 20, vary: 0.3, rng: rng(6), cross: true, bone: cBody });

  return b.root;
}
```