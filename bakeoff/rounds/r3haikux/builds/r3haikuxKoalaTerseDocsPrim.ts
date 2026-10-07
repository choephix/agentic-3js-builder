import * as THREE from "three";
import { catmull, createBuilder, grain, limb, mottle, paint, polyline, svg } from "../../../../src/index";
import type { OutlinePoint } from "../../../../src/index";

export const meta = {
  name: "Koala",
  description:
    "A koala sitting upright on the floor beside a fallen eucalyptus sprig: big round fluffy ears, a black nose, a grey coat with a cream chest and muzzle.",
};

/** An ellipsoid: a unit sphere scaled to three half-sizes in metres. */
const blob = (rx: number, ry: number, rz: number, seg = 12) =>
  new THREE.SphereGeometry(1, seg, Math.max(6, Math.round(seg * 0.7))).scale(rx, ry, rz);

/** The surface point that has to exist. */
function must<T>(hit: T | null, what: string): T {
  if (!hit) throw new Error(`koala: no surface point for the ${what}`);
  return hit;
}

// Eucalyptus leaf, drawn in metres. Tip and base are sharp corners.
const LEAF_OUTLINE: OutlinePoint[] = [
  [0, 0, "sharp"],
  [0.024, 0.011],
  [0.056, 0.009],
  [0.082, 0, "sharp"],
  [0.056, -0.009],
  [0.024, -0.011],
];

export default function build() {
  // Palette: grey coat, cream chest and muzzle, black nose, ink eyes.
  const CREAM = "#ece4d1";
  const NOSE = "#1d1a1a";
  const INK = "#16130f";
  const LEAF = "#8ea596";

  const COAT = mottle("#9c9891", "#7a776f", { size: 0.07, contrast: 0.7, seed: 3 });
  const TORSO = paint((p, n) => (n.z > 0.45 && p.y > 0.2 && p.y < 0.42 ? CREAM : COAT));
  const HEAD = paint((p, n) => (n.z > 0.5 && p.y < 0.525 ? CREAM : COAT));
  const BRANCH = grain("#7a5c43", "#9a7b5c", { size: 0.012, axis: [0.76, 0, -0.65], seed: 2 });
  const EYE = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="${INK}"/><circle cx="41" cy="22" r="8" fill="#ffffff"/></svg>`,
    { size: 128 },
  );

  const b = createBuilder({ name: "koala" });

  // ── Skeleton ─────────────────────────────────────────────────
  const hips = b.joint("hips", { at: [0, 0.09, -0.03], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.09, -0.03],
      [0, 0.22, -0.005],
      [0, 0.36, 0.01],
      [0, 0.47, 0.025],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const HEAD_AT: [number, number, number] = [0, 0.53, 0.05];
  const neck = b.joint("neck", { parent: spine.joints[2], at: [0, 0.47, 0.025], role: "neck" });
  const head = b.joint("head", { parent: neck, at: HEAD_AT, role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: head.local({ forward: 0.05, up: -0.045 }), role: "jaw" });

  // ── Body: one smooth, pear-shaped loft over the spine ────────
  b.loft(
    [
      { at: [0, 0.005, -0.02], w: 0.16, h: 0.2 },
      { at: [0, 0.09, -0.03], w: 0.3, h: 0.32 },
      { at: [0, 0.2, -0.01], w: 0.36, h: 0.34 },
      { at: [0, 0.33, 0], w: 0.36, h: 0.34 },
      { at: [0, 0.43, 0.02], w: 0.28, h: 0.28 },
      { at: [0, 0.5, 0.03], w: 0.2, h: 0.22 },
    ],
    { bone: spine, color: TORSO, detail: 1.5 },
  );

  // ── Head: big round head, cream lower face, black nose ───────
  const headMesh = b.part(blob(0.104, 0.092, 0.1, 14), HEAD, { at: HEAD_AT, bone: head });
  const nose = must(b.surface(headMesh).around(HEAD_AT).at(0, 6), "nose");
  b.stick(blob(0.036, 0.03, 0.028, 10), NOSE, nose);
  b.part(blob(0.03, 0.016, 0.032), CREAM, { at: jaw.local({ forward: 0.035, up: 0 }), bone: jaw });

  for (const s of [1, -1]) {
    const L = s > 0 ? "L" : "R";

    // Cheeks: soft fluffy bulges either side of the lower face.
    b.part(blob(0.05, 0.042, 0.058), COAT, {
      at: head.local({ left: s * 0.07, up: -0.03, forward: 0.03 }),
      bone: head,
    });

    // Ears: round fluffy discs facing out and forward, with a cream inner.
    const ear = new THREE.Vector3(s * 0.085, 0.615, 0.02);
    const facing = new THREE.Vector3(s * 0.55, 0.12, 0.83).normalize();
    b.part(blob(0.044, 0.048, 0.016), COAT, { at: ear, dir: facing, axis: "z", bone: head });
    b.part(blob(0.033, 0.037, 0.008), CREAM, {
      at: ear.clone().addScaledVector(facing, 0.012),
      dir: facing,
      axis: "z",
      bone: head,
    });

    // Eyes: a drawn decal with a glint, sitting on the head's surface.
    const eye = must(b.surface(headMesh).around(HEAD_AT).at(s * 36, 12), "eye");
    b.decal(headMesh, EYE, { at: eye, size: [0.036, 0.036], mirror: s < 0 });

    // Hind leg: thigh out and forward, foot flat on the floor.
    const footAt: [number, number, number] = [s * 0.13, 0.034, 0.22];
    const leg = b.chain(
      `leg${L}`,
      limb([s * 0.12, 0.13, 0], footAt, [0.17, 0.15], [[s * 0.35, 0.35, 1]]),
      { parent: hips, names: [`hip${L}`, `knee${L}`, `foot${L}`], role: "leg" },
    );
    const foot = leg.joints[2];
    b.sweep(leg, (t) => 0.07 - 0.024 * t, { color: COAT });
    b.part(blob(0.056, 0.034, 0.078), COAT, { at: footAt, bone: foot });
    for (const x of [-0.02, 0, 0.02]) {
      b.spike(foot.local({ left: x, forward: 0.08, up: -0.008 }), [0, -0.196, 0.981], 0.03, 0.0055, {
        color: CREAM,
        bone: foot,
      });
    }

    // Arm: elbow out, paw resting on the chest.
    const pawAt: [number, number, number] = [s * 0.09, 0.26, 0.21];
    const arm = b.chain(
      `arm${L}`,
      limb([s * 0.12, 0.44, 0.04], pawAt, [0.17, 0.16], [[s * 0.7, -0.5, 0.2]]),
      { parent: spine.joints[2], names: [`shoulder${L}`, `elbow${L}`, `hand${L}`], role: "arm" },
    );
    const hand = arm.joints[2];
    b.sweep(arm, (t) => 0.05 - 0.012 * t, { color: COAT });
    b.part(blob(0.05, 0.044, 0.052), COAT, { at: pawAt, bone: hand });
    for (const x of [-0.024, -0.008, 0.008, 0.024]) {
      b.spike(hand.local({ left: x, forward: 0.044, up: -0.012 }), [0, -0.287, 0.958], 0.022, 0.0045, {
        color: CREAM,
        bone: hand,
      });
    }
  }

  // ── A eucalyptus sprig lying on the floor beside the koala ───
  const P0 = new THREE.Vector3(0.26, 0.011, 0.36);
  const P1 = new THREE.Vector3(0.52, 0.011, 0.14);
  b.sweep(polyline([P0, P1]), 0.011, { color: BRANCH, bone: hips });

  const D = P1.clone().sub(P0).setY(0).normalize();
  const SIDE = new THREE.Vector3(-D.z, 0, D.x);
  const UP = new THREE.Vector3(0, 1, 0);
  [0.18, 0.36, 0.56, 0.78].forEach((t, i) => {
    const sign = i % 2 === 0 ? 1 : -1;
    // A horizontal leaf: its width runs along UP × x, its thickness along world Y.
    const x = D.clone().multiplyScalar(0.5).addScaledVector(SIDE, sign * 0.85).normalize();
    b.extrude(LEAF_OUTLINE, {
      at: P0.clone().lerp(P1, t),
      x,
      y: new THREE.Vector3().crossVectors(UP, x),
      thickness: 0.003,
      bevel: 0.0008,
      smoothing: 1,
      color: LEAF,
      bone: hips,
    });
  });

  return b.root;
}
