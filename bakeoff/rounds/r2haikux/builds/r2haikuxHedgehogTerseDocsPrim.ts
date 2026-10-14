import * as THREE from "three";
import { countershade, createBuilder, paint, rng } from "../../../../src/index";

// Palette: warm brown spines tipped in cream, a pale snout, dark eyes and nose.
const BODY = "#6b4a33";
const BELLY = "#eddcc0";
const CAP = "#5a3d2a";
const FACE = "#ecdcc3";
const SPINE_ROOT = "#4a2f22";
const SPINE_MID = "#8b5e3c";
const SPINE_TIP = "#f4e8d0";
const INK = "#1a120f";
const GLINT = "#ffffff";
const NOSE = "#2b1d1a";
const EAR = "#d9a09a";
const EAR_IN = "#b8746c";
const LEG = "#3f2c23";
const PAD = "#c4877c";
const MOUTH = "#b57a70";

export const meta = {
  name: "hedgehog",
  description:
    "A stylised hedgehog: a round body under a crown of cream-tipped spines, a pale snout with a dark nose, and stubby legs.",
};

export default function build() {
  const b = createBuilder({ name: "hedgehog" });

  const spines = paint((_p, _n, s) => (s[0] < 0.4 ? SPINE_ROOT : s[0] < 0.7 ? SPINE_MID : SPINE_TIP));
  const bodySkin = countershade(BODY, BELLY);
  const headSkin = paint((p, n) => (n.y > 0.45 && p.z < 0.11 ? CAP : FACE));

  // Skeleton: hips, spine, neck, head with a lower jaw, and four legs.
  const hips = b.joint("hips", { at: [0, 0.075, -0.085], dir: [0, 0, 1], role: "spine" });
  const spine = b.chain(
    "spine",
    [
      [0, 0.075, -0.07],
      [0, 0.077, -0.02],
      [0, 0.077, 0.02],
      [0, 0.074, 0.04],
    ],
    { parent: hips, names: ["spineA", "spineB", "spineC"], role: "spine" },
  );
  const neck = b.joint("neck", { parent: spine, at: [0, 0.074, 0.04], aim: [0, 0.076, 0.07], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 0.077, 0.07], aim: [0, 0.072, 0.125], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.062, 0.08], aim: [0, 0.056, 0.12], role: "jaw" });

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const fore = b.chain(
      `foreLeg${side}`,
      [
        [s * 0.036, 0.062, 0.02],
        [s * 0.04, 0.03, 0.03],
        [s * 0.04, 0.012, 0.025],
        [s * 0.04, 0.009, 0.05],
      ],
      {
        parent: spine,
        names: [`foreHip${side}`, `foreKnee${side}`, `foreAnkle${side}`, `forePaw${side}`],
        role: "leg",
      },
    );
    const hind = b.chain(
      `hindLeg${side}`,
      [
        [s * 0.04, 0.062, -0.08],
        [s * 0.045, 0.032, -0.09],
        [s * 0.045, 0.012, -0.095],
        [s * 0.045, 0.009, -0.062],
      ],
      {
        parent: hips,
        names: [`hindHip${side}`, `hindKnee${side}`, `hindAnkle${side}`, `hindPaw${side}`],
        role: "leg",
      },
    );
    for (const leg of [fore, hind]) {
      b.sweep(leg, [0.014, 0.009], { color: LEG, bands: [[0.8, LEG], [1, PAD]] });
    }
  }

  // Round body: a stubby loft that bends along the spine.
  const body = b.loft(
    [
      { at: [0, 0.075, -0.085], w: 0.08, h: 0.08 },
      { at: [0, 0.077, -0.04], w: 0.11, h: 0.09 },
      { at: [0, 0.077, 0.0], w: 0.12, h: 0.095 },
      { at: [0, 0.075, 0.04], w: 0.11, h: 0.09 },
      { at: [0, 0.073, 0.058], w: 0.085, h: 0.08 },
    ],
    { bone: [hips, spine, neck], color: bodySkin },
  );

  // Head: wide skull tapering to a pointed snout.
  const skull = b.loft(
    [
      { at: [0, 0.078, 0.05], w: 0.085, h: 0.085 },
      { at: [0, 0.082, 0.075], w: 0.085, h: 0.08 },
      { at: [0, 0.075, 0.1], w: 0.06, h: 0.06 },
      { at: [0, 0.07, 0.118], w: 0.034, h: 0.037 },
      { at: [0, 0.068, 0.128], w: 0.016, h: 0.018 },
    ],
    { bone: head, color: headSkin },
  );

  // Spines: a cone standing off the skin and laid back toward the tail.
  const bodyHits = b.surface(body);
  type Hit = ReturnType<typeof bodyHits.scatter>[number];

  const quill = (h: Hit, len: number, r: number) => {
    const d = [h.axis.x, h.axis.y, h.axis.z - 0.7];
    const k = Math.hypot(d[0], d[1], d[2]);
    b.spike(h.moved([0, -0.003, 0]), [d[0] / k, d[1] / k, d[2] / k], len, r, {
      color: spines,
      caps: { start: "flat", end: "none" },
    });
  };

  bodyHits
    .scatter(260, {
      rng: rng(7),
      minDist: 0.0095,
      filter: (h) => h.axis.y > -0.15 && h.at.z < 0.05,
    })
    .forEach((h, i) =>
      quill(h, (0.024 + 0.018 * ((i * 0.618034) % 1)) * (h.at.z < -0.03 ? 1.15 : 1), 0.0042),
    );

  const crownHits = b.surface(skull);
  crownHits
    .scatter(40, {
      rng: rng(11),
      minDist: 0.011,
      filter: (h) => h.axis.y > 0.6 && h.at.z > 0.045 && h.at.z < 0.115,
    })
    .forEach((h, i) => quill(h, 0.016 + 0.01 * ((i * 0.618034) % 1), 0.0035));

  // Eyes with glints, round ears with pink inner plates.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.012, 8, 6), INK, {
      bone: head,
      at: [s * 0.039, 0.086, 0.085],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0038, 6, 4), GLINT, {
      bone: head,
      at: [s * 0.047, 0.094, 0.097],
    });
    b.part(new THREE.SphereGeometry(0.011, 8, 6).scale(1, 0.3, 1), EAR, {
      bone: head,
      at: [s * 0.037, 0.099, 0.056],
      dir: [s, 0, 0],
      flat: true,
    });
    b.part(new THREE.SphereGeometry(0.0085, 8, 6).scale(1, 0.2, 1), EAR_IN, {
      bone: head,
      at: [s * 0.0415, 0.099, 0.056],
      dir: [s, 0, 0],
    });
  }

  // Dark nose on the snout tip.
  b.part(new THREE.SphereGeometry(0.0125, 8, 6).scale(1.15, 0.85, 1), NOSE, {
    bone: head,
    at: [0, 0.068, 0.13],
    flat: true,
  });

  // Lower jaw, rigged to its own joint.
  b.capsule([0, 0.062, 0.08], [0, 0.056, 0.122], [0.011, 0.007], { bone: jaw, color: MOUTH });

  return b.root;
}
