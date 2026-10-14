import * as THREE from "three";
import { createBuilder, catmull, limb, countershade, scales, stripes, svg } from "../../../../src/index";

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "Trotting-pose armadillo with a banded pink-tan shell, pointed snout, tall ears, clawed feet, tapering armoured tail and pale bristles between the bands.",
};

const SHELL = "#c79a88";
const EDGE = "#9a7263";
const BAND = "#b58573";
const BELLY = "#e3cdb8";
const SKIN = "#cfa795";
const EAR_IN = "#e4b5a8";
const CLAW = "#efe3cf";
const DARK = "#1a1412";

export default function build() {
  const b = createBuilder({ name: "armadillo" });

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 0.19, -0.14], dir: [0, 0.05, 1] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.19, -0.14],
      [0, 0.2, 0.0],
      [0, 0.2, 0.14],
      [0, 0.19, 0.26],
      [0, 0.175, 0.32],
    ]),
    { parent: hips, role: "spine" },
  );
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.18, -0.14],
      [0, 0.155, -0.28],
      [0, 0.105, -0.42],
      [0, 0.055, -0.54],
      [0, 0.022, -0.64],
    ]),
    { parent: hips, role: "tail" },
  );
  const head = b.joint("head", {
    parent: spine.joints[spine.joints.length - 1],
    at: [0, 0.17, 0.32],
    dir: [0, -0.2, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.14, 0.37],
    aim: [0, 0.125, 0.47],
    role: "jaw",
  });

  // ---- body shell ----
  const shellPaint = countershade(scales(SHELL, EDGE, { size: 0.03, width: 0.15, seed: 3 }), BELLY, {
    level: -0.3,
  });
  const body = b.sweep(
    spine,
    (t) => {
      const k = Math.sin(Math.PI * (0.08 + 0.84 * t));
      return [0.03 + 0.085 * k, 0.03 + 0.07 * k];
    },
    { color: shellPaint },
  );

  // tail
  b.sweep(tail, (t) => 0.048 * (1 - t) + 0.004, {
    color: stripes(SHELL, EDGE, { size: 0.03, axis: "z", width: 0.45 }),
    caps: { start: "round", end: "point" },
  });

  // ---- bands with bristles ----
  const skin = b.surface(body);
  const hair = svg(
    `<svg viewBox="0 0 8 32"><path d="M4 32 Q3 16 5 2" stroke="#f3e7d3" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>`,
    { size: 128 },
  );
  const hairFrames: any[] = [];
  const nb = 9;
  for (let i = 0; i < nb; i++) {
    const t = 0.38 + (0.34 * i) / (nb - 1);
    const f = spine.at(t);
    const loop = skin.loop(f, { lift: 0.004 });
    b.sweep(loop, 0.009, { color: i % 2 ? BAND : EDGE });
    const lp = skin.loop(f, { lift: 0.0 });
    b.along(lp, 16, (at: any) => {
      hairFrames.push(at);
    });
  }
  b.cards(hairFrames, hair, { size: [0.006, 0.03], lean: 65, bend: 20, vary: 0.3, spin: 25, rng: undefined as any });

  // ---- head ----
  b.sweep(
    [
      [0, 0.17, 0.3],
      [0, 0.125, 0.5],
    ],
    (t) => [0.052 * (1 - t) + 0.011, 0.042 * (1 - t) + 0.009],
    { bone: head, color: SKIN, caps: { start: "round", end: "round" } },
  );
  b.sweep(
    [
      [0, 0.125, 0.34],
      [0, 0.108, 0.45],
    ],
    [0.03, 0.008],
    { bone: jaw, color: BELLY, caps: { end: "round" } },
  );
  b.part(new THREE.SphereGeometry(0.012, 6, 4), DARK, { bone: head, at: [0, 0.124, 0.507] });
  b.part(new THREE.BoxGeometry(0.07, 0.01, 0.06), BAND, { bone: head, at: [0, 0.205, 0.33] });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.011, 6, 4), DARK, { bone: head, at: [s * 0.043, 0.176, 0.375] });
    const base: [number, number, number] = [s * 0.04, 0.195, 0.31];
    const outline: [number, number][] = [
      [-0.022, 0],
      [0.022, 0],
      [0.027, 0.065],
      [0, 0.11],
      [-0.027, 0.065],
    ];
    b.extrude(outline, {
      at: base,
      x: [1, 0, 0],
      y: [s * 0.35, 1, 0],
      thickness: 0.006,
      smoothing: 2,
      color: SKIN,
      bone: head,
    });
    const inner: [number, number][] = [
      [-0.013, 0.012],
      [0.013, 0.012],
      [0.017, 0.062],
      [0, 0.095],
      [-0.017, 0.062],
    ];
    b.extrude(inner, {
      at: base,
      x: [1, 0, 0],
      y: [s * 0.35, 1, 0],
      thickness: 0.0085,
      smoothing: 2,
      color: EAR_IN,
      bone: head,
    });
  }

  // ---- legs ----
  const legs: [string, number, number, number, number, number, number, number][] = [
    // name, hipZ, footZ, spine joint idx, bendZ, claw len, toe spread, rear
    ["F", 0.2, 0.25, 2, -1, 0.05, 0.013, 0],
    ["H", -0.1, -0.13, 0, 1, 0.04, 0.011, 1],
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    for (const [nm, hz, fz, si, bz, cl, sp] of legs) {
      const hip: [number, number, number] = [s * 0.08, 0.15, hz];
      const foot: [number, number, number] = [s * 0.092, 0.018, fz];
      const pts = limb(hip, foot, [0.075, 0.075], [[0, 0, bz]]);
      const names =
        nm === "F"
          ? [`shoulder${side}`, `elbow${side}`, `wrist${side}`]
          : [`hip${side}`, `knee${side}`, `ankle${side}`];
      const leg = b.chain(`leg${nm}${side}`, pts, {
        parent: spine.joints[si],
        names,
        role: "leg",
      });
      b.sweep(leg, [0.036, 0.02], { color: SKIN, caps: { start: "round", end: "round" } });
      const tipJ = leg.tip ?? leg.joints[leg.joints.length - 1];
      b.part(new THREE.SphereGeometry(0.02, 6, 4), SKIN, {
        bone: tipJ,
        at: [foot[0], 0.018, foot[2] + 0.008],
        scale: [1, 0.9, 1.3],
      });
      for (const d of [-1, 0, 1]) {
        b.spike(
          [foot[0] + d * sp, 0.014, foot[2] + 0.022],
          [d * 0.25, -0.2, 1],
          cl,
          0.0075,
          { bone: tipJ, color: CLAW, sides: 5 } as any,
        );
      }
    }
  }

  return b.root;
}
