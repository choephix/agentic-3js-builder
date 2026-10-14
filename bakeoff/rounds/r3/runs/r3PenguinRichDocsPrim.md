```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, bezier, paint, gradient, scales, countershade } from "agentic-3js-builder";

export const meta = {
  name: "Emperor Penguin with Chick",
  description:
    "Proud emperor penguin parent with glossy blue-black back, white belly fading to golden neck and ear patches, slender orange-pink beak, stubby flippers and big black feet, with a fluffy grey chick peeking out between its feet.",
};

const BLACKHEAD = "#0f1822";
const FOOT = "#0c0e13";
const WHITE = "#f6f6f0";
const GOLD = "#f0b92a";
const PALEGOLD = "#f5de8c";
const BEAK_UP = "#2d2a2e";
const BEAK_LOW = "#f58f66";
const STRIPE = "#ff9a6c";

export default function build() {
  const b = createBuilder({ name: "emperorPenguin" });

  // ---------- paints ----------
  const BACK = scales("#1f3048", "#121b29", { size: 0.05, width: 0.12 });
  const FRONT = gradient(WHITE, GOLD, [0, 0.76, 0], [0, 1.02, 0]);
  const bodyPaint = paint((p, n) => {
    if (p.y > 1.06 && n.z > 0 && Math.abs(n.x) < 0.55) return BLACKHEAD;
    const f = n.z - 0.45 * Math.abs(n.x) + (p.y > 0.9 ? 0.5 : 0);
    return f > -0.05 ? FRONT : BACK;
  });
  const flipperPaint = paint((_p, n) => (n.z > 0.5 ? "#e9ecea" : BACK));

  // ---------- skeleton: body ----------
  const hips = b.joint("hips", { at: [0, 0.17, -0.06] });
  const P = catmull([
    [0, 0.17, -0.06],
    [0, 0.35, -0.055],
    [0, 0.6, -0.025],
    [0, 0.85, 0.02],
    [0, 1.02, 0.05],
    [0, 1.13, 0.085],
  ]);
  const spine = b.chain("spine", P.slice(0, 0.72), { parent: hips, count: 3, role: "spine" });
  const neck = b.chain("neck", P.slice(0.72, 1), { parent: spine.joints[2], count: 2, role: "neck" });
  b.sweep(P, [0.1, 0.2, 0.255, 0.215, 0.12, 0.066], { bone: [spine, neck], color: bodyPaint, sides: 10 });

  // ---------- head ----------
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.17, 0.09], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.165, 0.12], aim: [0, 1.15, 0.3], role: "jaw" });

  b.part(new THREE.SphereGeometry(0.075, 12, 9), BLACKHEAD, {
    bone: head, at: [0, 1.19, 0.1], scale: [1, 1, 1.2], flat: true,
  });
  // upper beak, long and slender with a slight droop
  b.sweep(bezier([0, 1.185, 0.16], [0, 1.188, 0.26], [0, 1.15, 0.345]), (t) => [0.021 * (1 - t) + 0.006, 0.019 * (1 - t) + 0.006], {
    bone: head, color: BEAK_UP, sides: 6, caps: { start: "flat", end: "point" },
  });
  // lower mandible on the jaw joint
  b.sweep(bezier([0, 1.163, 0.13], [0, 1.158, 0.25], [0, 1.135, 0.33]), [0.018, 0.004], {
    bone: jaw, color: BEAK_LOW, sides: 6, caps: { start: "flat", end: "point" },
  });
  for (const s of [1, -1]) {
    // orange-pink beak stripe
    b.rod([s * 0.019, 1.176, 0.17], [s * 0.011, 1.163, 0.305], 0.0045, { bone: head, color: STRIPE, sides: 5 });
    // ear patch
    b.part(new THREE.SphereGeometry(0.05, 8, 6), gradient(GOLD, PALEGOLD, [0, 1.2, 0], [0, 1.1, 0]), {
      bone: head, at: [s * 0.066, 1.165, 0.075], scale: [0.35, 1.25, 0.95],
    });
    // eyes
    b.part(new THREE.SphereGeometry(0.012, 6, 4), "#050607", { bone: head, at: [s * 0.062, 1.215, 0.13] });
    b.part(new THREE.SphereGeometry(0.0045, 4, 3), "#ffffff", { bone: head, at: [s * 0.07, 1.22, 0.138] });
  }

  // ---------- tail ----------
  const tail = b.chain("tail", catmull([[0, 0.2, -0.17], [0, 0.1, -0.27], [0, 0.03, -0.38]]), {
    parent: hips, names: ["tail1", "tail2"], role: "tail",
  });
  b.sweep(tail, (t) => [0.045 * (1 - t) + 0.015, 0.012], { section: "box", color: "#16202d", caps: "flat" });

  // ---------- flippers & legs ----------
  const paddle: [number, number, string?][] = [
    [0, -0.035], [0.1, -0.06], [0.25, -0.065], [0.38, -0.045], [0.44, 0, "sharp"], [0.37, 0.035],
    [0.2, 0.045], [0.08, 0.05], [0, 0.035],
  ] as any;
  const footOutline: [number, number][] = [
    [-0.055, -0.03], [-0.08, 0.07], [-0.09, 0.17], [-0.065, 0.22], [-0.04, 0.17], [-0.025, 0.2], [0, 0.235],
    [0.025, 0.2], [0.04, 0.17], [0.065, 0.22], [0.09, 0.17], [0.08, 0.07], [0.055, -0.03], [0, -0.05],
  ];

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    // flipper
    const fl = b.chain(
      `flipper${S}`,
      [[s * 0.17, 0.85, 0], [s * 0.3, 0.685, -0.005], [s * 0.43, 0.52, -0.01]],
      { parent: spine.joints[2], names: [`shoulder${S}`, `elbow${S}`, `hand${S}`], role: "arm" },
    );
    b.extrude(paddle as any, {
      at: [s * 0.17, 0.85, 0],
      x: [0.62 * s, -0.78, 0],
      y: [0.78 * s, 0.62, 0],
      thickness: 0.024, bevel: 0.007, smoothing: 1, color: flipperPaint, bone: fl.joints[0],
    });

    // leg + foot
    const leg = b.chain(
      `leg${S}`,
      [[s * 0.115, 0.2, -0.01], [s * 0.115, 0.09, 0.0], [s * 0.13, 0.04, 0.05]],
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg", contact: [s * 0.145, 0, 0.1] },
    );
    b.sweep(leg, 0.04, { color: FOOT, sides: 6 });
    const fx = s * 0.145;
    b.extrude(footOutline, {
      at: [fx, 0.0175, 0], x: [1, 0, 0], y: [0, 0, 1],
      thickness: 0.035, bevel: 0.008, color: FOOT, bone: leg.tip!,
    });
    for (const [kx, kz] of [[-0.065, 0.225], [0, 0.24], [0.065, 0.225]]) {
      b.part(new THREE.ConeGeometry(0.014, 0.045, 5), "#2c2c33", {
        at: [fx + kx, 0.02, kz], dir: [0, -0.15, 1], bone: leg.tip!,
      });
    }
  }

  // ---------- the chick ----------
  const cBody = b.joint("chickBody", { parent: hips, at: [0, 0.12, 0.07], dir: [0, 1, 0] });
  const cHead = b.joint("chickHead", { parent: cBody, at: [0, 0.215, 0.12], dir: [0, 0.3, 1] });
  const GREY = countershade("#8f949c", "#c9ccd0", { level: -0.2 });
  const chickBody = b.part(new THREE.SphereGeometry(0.085, 10, 8), GREY, {
    bone: cBody, at: [0, 0.12, 0.07], scale: [1, 1.1, 1],
  });
  const fluff = b.surface(chickBody).scatter(44, { rng: rng(5), minDist: 0.028, filter: (h) => h.n.y > -0.4 });
  for (const h of fluff) b.stick(new THREE.ConeGeometry(0.014, 0.04, 5), "#b8bcc2", h, { embed: 0.3 });

  b.part(new THREE.SphereGeometry(0.058, 10, 8), "#2b2e34", { bone: cHead, at: [0, 0.225, 0.13] });
  b.part(new THREE.ConeGeometry(0.014, 0.045, 5), "#17181c", {
    bone: cHead, at: [0, 0.215, 0.185], dir: [0, 0.1, 1],
  });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.03, 7, 5), "#e8e8e3", {
      bone: cHead, at: [s * 0.032, 0.225, 0.155], scale: [0.7, 1.1, 0.8],
    });
    b.part(new THREE.SphereGeometry(0.011, 6, 4), "#050607", { bone: cHead, at: [s * 0.036, 0.235, 0.172] });
    b.part(new THREE.SphereGeometry(0.0035, 4, 3), "#ffffff", { bone: cHead, at: [s * 0.039, 0.239, 0.18] });
    b.part(new THREE.BoxGeometry(0.04, 0.02, 0.06), "#2a2a2e", { bone: cBody, at: [s * 0.035, 0.01, 0.1] });
    // tiny chick wing
    b.part(new THREE.SphereGeometry(0.03, 6, 4), "#7d838b", {
      bone: cBody, at: [s * 0.085, 0.12, 0.06], scale: [0.4, 1.2, 0.8],
    });
    for (let k = 0; k < 3; k++)
      b.part(new THREE.ConeGeometry(0.012, 0.035, 5), "#b8bcc2", {
        bone: cHead, at: [s * (0.02 + k * 0.01), 0.275 - k * 0.006, 0.1 + k * 0.01], dir: [s * 0.3, 1, 0],
      });
  }

  return b.root;
}
```