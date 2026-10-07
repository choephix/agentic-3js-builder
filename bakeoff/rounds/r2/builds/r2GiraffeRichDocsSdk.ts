import * as THREE from "three";
import { createBuilder, rng, catmull, limb, patches, countershade, gradient } from "../../../../src/index";

export const meta = {
  name: "Young Reticulated Giraffe",
  description:
    "A young reticulated giraffe with chestnut patches outlined in cream, a stiff brown mane, fuzzy black-tufted ossicones, big ears, long lashes, a dark tongue and cream-fading legs. Rigged with spine, neck, head, jaw, tail and four legs.",
};

const CREAM = "#f6e8c0";
const CH1 = "#a8562a";
const CH2 = "#8d4420";
const CH3 = "#b9692f";
const TAN = "#c99c66";
const MUZ = "#a47a52";
const MANE = "#4a2a16";
const BLACK = "#1a1412";
const TONGUE = "#3b2838";
const HOOF = "#2b211c";
const EARIN = "#dba08e";
const FUZZ = "#8a5a36";

export default function build() {
  const b = createBuilder({ name: "giraffe" });

  const base = patches(CREAM, [CH1, CH2, CH3], { size: 0.2 });
  const coat = countershade(base, "#f1e4c4", { level: -0.6 });
  const legCoat = gradient(coat, CREAM, [0, 0.52, 0], [0, 0.28, 0]);

  // ---- skeleton ----
  const hips = b.joint("hips", { at: [0, 1.4, -0.62], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.4, -0.62],
      [0, 1.4, -0.2],
      [0, 1.46, 0.2],
      [0, 1.52, 0.42],
    ]),
    { parent: hips, role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.52, 0.42],
      [0, 1.88, 0.62],
      [0, 2.24, 0.82],
      [0, 2.6, 1.0],
    ]),
    { parent: spine.joints[2], role: "neck" },
  );
  const head = b.joint("head", { parent: neck.joints[2], at: neck.at(1), dir: [0, 0.2, 1], role: "head" });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.1, down: 0.08 }),
    aim: head.local({ forward: 0.45, down: 0.11 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.38, -0.6],
      [0, 1.2, -0.78],
      [0, 0.88, -0.84],
      [0, 0.58, -0.82],
    ]),
    { parent: hips, role: "tail" },
  );

  // ---- body ----
  b.sweep(spine, (t) => [0.17 + 0.05 * t, 0.23 + 0.07 * t], { color: coat });
  const neckTube = b.sweep(neck, [0.17, 0.075], { color: coat });

  // mane down the neck
  b.along(neckTube, 28, (at) => b.spike(at, [0, 0.8, -0.5], 0.085, 0.014, { color: MANE, sides: 4 } as any), {
    from: 0.02,
    to: 1,
  });

  // tail
  b.sweep(tail, [0.03, 0.016], {
    bands: [
      [0.9, CH2],
      [1, BLACK],
    ],
  });
  b.part(new THREE.ConeGeometry(0.05, 0.22, 6), BLACK, {
    bone: tail.joints[2],
    at: [0, 0.5, -0.82],
    dir: [0, -1, 0],
  });

  // ---- legs ----
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const x = s * 0.17;
    const front = limb(
      [x, 1.2, 0.36],
      [x, 0.12, 0.4],
      [0.52, 0.52, 0.22],
      [
        [0, 0, -1],
        [0, 0, 1],
      ],
    );
    const fl = b.chain(`legF${side}`, front, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hoofF${side}`],
      role: "leg",
      contact: [x, 0, 0.4],
    });
    b.sweep(fl, [0.09, 0.062, 0.044, 0.04, 0.044], { color: legCoat });
    b.part(new THREE.CylinderGeometry(0.052, 0.066, 0.12, 6), HOOF, {
      bone: fl.tip!,
      at: [x, 0.06, 0.41],
    });

    const hind = limb(
      [x, 1.3, -0.5],
      [x, 0.12, -0.5],
      [0.52, 0.52, 0.22],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    const hl = b.chain(`legH${side}`, hind, {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `hoofH${side}`],
      role: "leg",
      contact: [x, 0, -0.5],
    });
    b.sweep(hl, [0.1, 0.065, 0.045, 0.04, 0.044], { color: legCoat });
    b.part(new THREE.CylinderGeometry(0.052, 0.066, 0.12, 6), HOOF, {
      bone: hl.tip!,
      at: [x, 0.06, -0.49],
    });
  }

  // ---- head ----
  const pA = head.local({ back: 0.05 });
  const pB = head.local({ forward: 0.24, down: 0.02 });
  const pC = head.local({ forward: 0.46, down: 0.06 });
  b.sweep([pA, pB], (t) => [0.09 - 0.025 * t, 0.105 - 0.04 * t], { bone: head, color: TAN });
  b.sweep([pB, pC], (t) => [0.065 - 0.008 * t, 0.068 - 0.01 * t], { bone: head, color: MUZ });
  b.part(new THREE.SphereGeometry(0.06, 8, 6), BLACK, {
    bone: head,
    at: head.local({ forward: 0.495, down: 0.07 }),
    scale: [0.95, 0.7, 0.85],
  });
  // lower jaw
  b.sweep([jaw.at, head.local({ forward: 0.43, down: 0.115 })], [0.045, 0.034], {
    bone: jaw,
    color: MUZ,
  });
  // tongue peeking out
  b.rod(head.local({ forward: 0.38, down: 0.11 }), head.local({ forward: 0.53, down: 0.15 }), [0.02, 0.016], {
    bone: jaw,
    color: TONGUE,
  });

  for (const s of [1, -1]) {
    // nostrils
    b.part(new THREE.SphereGeometry(0.012, 5, 4), "#050505", {
      bone: head,
      at: head.local({ left: s * 0.03, forward: 0.535, down: 0.085 }),
    });
    // eyes
    const eye = b.part(new THREE.SphereGeometry(0.038, 8, 6), BLACK, {
      bone: head,
      at: head.local({ left: s * 0.088, forward: 0.1, up: 0.035 }),
      dir: [s, 0.1, 0.5],
    });
    b.part(new THREE.SphereGeometry(0.01, 5, 4), "#ffffff", {
      bone: head,
      at: head.local({ left: s * 0.118, forward: 0.12, up: 0.055 }),
    });
    b.ring(eye, { count: 7, radius: 0.032, fromDeg: -80, toDeg: 80, tilt: 35 }, (lash) =>
      b.spike(lash, lash, 0.055, 0.006, { color: BLACK, sides: 4 } as any),
    );

    // big ears
    const outline: any = [
      [0, -0.05],
      [0.1, -0.09],
      [0.2, -0.06],
      [0.3, 0.0, "sharp"],
      [0.2, 0.07],
      [0.1, 0.09],
      [0, 0.05],
    ];
    const earAt = head.local({ left: s * 0.07, up: 0.085, back: 0.03 });
    const xdir: [number, number, number] = [s, 0.3, 0];
    const ydir: [number, number, number] = [-0.3 * s, 1, 0];
    b.extrude(outline, { at: earAt, x: xdir, y: ydir, thickness: 0.012, smoothing: 1, color: TAN, bone: head });
    const inner: any = outline.map((p: any) => [p[0] * 0.7 + 0.03, p[1] * 0.6, ...(p[2] ? [p[2]] : [])]);
    b.extrude(inner, { at: earAt, x: xdir, y: ydir, thickness: 0.017, smoothing: 1, color: EARIN, bone: head });

    // ossicones
    const oBase = head.local({ left: s * 0.04, up: 0.085, forward: 0.0 });
    const oTip = head.local({ left: s * 0.035, up: 0.3, back: 0.04 });
    const stalk = b.rod(oBase, oTip, [0.034, 0.024], { bone: head, color: "#9a6a42", sides: 6 } as any);
    const hits = b.surface(stalk).scatter(18, { rng: rng(11 + (s > 0 ? 0 : 5)) });
    for (const h of hits)
      b.stick(new THREE.ConeGeometry(0.009, 0.035, 4), FUZZ, h, { embed: 0.2 });
    const tuft = b.part(new THREE.SphereGeometry(0.036, 6, 4), BLACK, { bone: head, at: oTip });
    b.ring(tuft, { count: 9, radius: 0.022, tilt: 50 }, (it) =>
      b.spike(it, it, 0.07, 0.012, { color: BLACK, sides: 4 } as any),
    );
    b.spike(tuft, tuft, 0.08, 0.016, { color: BLACK, sides: 4 } as any);
  }

  return b.root;
}
