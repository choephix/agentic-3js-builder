```ts
import * as THREE from "three";
import {
  catmull,
  countershade,
  createBuilder,
  interpolate,
  mix,
  mottle,
  paint,
  rng,
  scales,
  smoothstep,
} from "agentic-3js-builder";

type V = [number, number, number];

// Palette: dusty pinkish-tan shell, paler plates, pink-cream belly, dark seams, ivory claws, pale hairs.
const SHELL = "#b98f7c";
const SHELL_LIGHT = "#d8b4a2";
const SHELL_DEEP = "#9a7261";
const SEAM = "#68463b";
const BELLY = "#ebd3c9";
const LEG = "#a6826f";
const FOOT = "#8c6858";
const EAR = "#dea99a";
const CLAW = "#f0e5d2";
const HAIR = "#f6eee2";
const EYE = "#15100e";
const GLINT = "#fbf8f1";
const NOSE = "#2b201d";

// Shell half-width (x) and half-height (y) along the spine, by source t: 0 = rump, 1 = shoulders.
const BODY_T = [0, 0.2, 0.41, 0.72, 1];
const BODY_RX = [0.046, 0.068, 0.079, 0.08, 0.07];
const BODY_RY = [0.058, 0.066, 0.072, 0.074, 0.067];
const bodyR = (t: number): [number, number] => [
  interpolate(BODY_T, BODY_RX, t),
  interpolate(BODY_T, BODY_RY, t),
];

// Neck and head by source t along the neck: 0 = base of the neck, 1 = tip of the snout.
const NECK_T = [0, 0.3, 0.55, 0.72, 0.87, 1];
const NECK_RX = [0.06, 0.054, 0.046, 0.036, 0.022, 0.011];
const NECK_RY = [0.062, 0.056, 0.043, 0.031, 0.02, 0.011];
const neckR = (t: number): [number, number] => [
  interpolate(NECK_T, NECK_RX, t),
  interpolate(NECK_T, NECK_RY, t),
];

const tailR = (t: number) => 0.026 * Math.pow(1 - t, 0.85) + 0.0038;
const legR = (t: number) => interpolate([0, 0.46, 1], [0.024, 0.017, 0.013], t);

export const meta = {
  name: "Nine-banded armadillo",
  description:
    "A nine-banded armadillo mid-trot: nine overlapping movable bands between pebbled shield plates, a pointed snout, tall leathery ears, clawed feet, pale coarse hairs between the bands and a long armoured tail tapering to a point.",
};

export default function armadillo() {
  const b = createBuilder({ name: "nine-banded armadillo", detail: 1, paintSize: 1024 });

  // ---- Paints
  const pebbles = scales([SHELL, SHELL_LIGHT, SHELL_DEEP], SEAM, { size: 0.0125, width: 0.22, seed: 4 });
  const shield = countershade(pebbles, BELLY, { level: -0.2, soft: 0.45 });
  const plateTone = countershade(mottle(SHELL_LIGHT, SHELL, { size: 0.04, seed: 9, contrast: 1.4 }), BELLY, {
    level: -0.2,
    soft: 0.45,
  });
  const tailTone = countershade(mottle(SHELL_DEEP, SHELL, { size: 0.03, seed: 13 }), BELLY, {
    level: -0.2,
    soft: 0.45,
  });
  // One plate between source t = a and c: a dark seam at its rear lip, the plate's tone toward its front edge.
  const plate = (a: number, c: number) =>
    paint((p, n, s) => {
      const f = Math.min(Math.max((s[0] - a) / (c - a), 0), 1);
      return mix(SEAM, plateTone.at(p, n), smoothstep(0.12, 0.28, f));
    });

  // ---- Spine: a rest-pose chain from the rump to the shoulders, rooted on the hips.
  b.joint("hips", { at: [0, 0.14, -0.15] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.14, -0.17],
      [0, 0.145, -0.05],
      [0, 0.15, 0.04],
      [0, 0.155, 0.12],
    ]),
    { parent: "hips", names: ["spine1", "spine2", "spine3", "shoulders"], role: "spine" },
  );

  // Body: the shield-plated shell, pebbled over the shoulders and rump.
  b.sweep(spine, bodyR, { color: shield, sides: 10, name: "body" });

  // Nine movable bands between the shields. Each stands proud at its rear lip and tucks under the next one.
  const zone = Array.from({ length: 10 }, (_, i) => spine.path.closestT([0, 0.15, -0.11 + (0.15 * i) / 9]));
  const bands = zone.slice(0, -1).map((a, k) => {
    const c = zone[k + 1];
    const lip = (t: number): [number, number] => {
      const f = Math.min(Math.max((t - a) / (c - a), 0), 1);
      const rise = 0.0018 + 0.0055 * (1 - f) * (1 - f);
      const [rx, ry] = bodyR(t);
      return [rx + rise, ry + rise];
    };
    return b.sweep(spine, lip, {
      from: a,
      to: c,
      color: plate(a, c),
      sides: 10,
      caps: "none",
      name: `band${k + 1}`,
    });
  });

  // ---- Neck and head: one tube from the shoulders to the snout; its last span is the head.
  const neckChain = b.chain(
    "neck",
    catmull([
      [0, 0.158, 0.135],
      [0, 0.176, 0.19],
      [0, 0.182, 0.25],
      [0, 0.162, 0.36],
    ]),
    { parent: "shoulders", names: ["neck1", "neck2", "head"], role: "neck" },
  );
  const neck = b.sweep(neckChain, neckR, { color: shield, sides: 10, name: "neck" });

  // Lower jaw: its own joint under the head, so the mouth can open.
  const jaw = b.joint("jaw", { parent: "head", at: [0, 0.158, 0.3], dir: [0, -0.25, 1], role: "jaw" });
  b.capsule(jaw, [0, 0.146, 0.345], 0.0064, { color: LEG, bone: "jaw", sides: 8, name: "lowerJaw" });

  // Tall leathery ears: thin flat shapes on top of the skull, leaning out.
  const earShape: [number, number][] = [
    [-0.013, 0],
    [0.013, 0],
    [0.015, 0.035],
    [0.006, 0.066],
    [-0.006, 0.066],
    [-0.015, 0.035],
  ];
  for (const side of [1, -1]) {
    b.extrude(earShape, {
      name: side > 0 ? "earL" : "earR",
      color: EAR,
      at: [0.022 * side, 0.196, 0.238],
      x: [0, 0, 1],
      y: [0.35 * side, 1, -0.2],
      thickness: 0.0042,
      bevel: 0.0014,
      smoothing: 1,
      bone: "head",
    });
  }

  // Small beady eyes with a glint, and a dark nose pad, seated on the real head surface.
  const headSurface = b.surface(neck);
  for (const side of [1, -1]) {
    const hit = headSurface.nearest([side * 0.07, 0.178, 0.285]);
    const at = hit.at.addScaledVector(hit.n, 0.002);
    const glint = hit.n.multiplyScalar(0.8).add(new THREE.Vector3(0, 0.5, 0.6)).normalize();
    b.part(new THREE.SphereGeometry(0.0055, 8, 6), EYE, {
      at,
      bone: "head",
      name: side > 0 ? "eyeL" : "eyeR",
    });
    b.part(new THREE.SphereGeometry(0.0017, 6, 4), GLINT, {
      at: at.clone().addScaledVector(glint, 0.0052),
      bone: "head",
      name: side > 0 ? "glintL" : "glintR",
    });
  }
  const tip = headSurface.nearest([0, 0.16, 0.42]);
  b.part(new THREE.SphereGeometry(0.0095, 8, 6), NOSE, {
    at: tip.at.addScaledVector(tip.n, 0.0025),
    bone: "head",
    scale: [1, 0.8, 0.85],
    name: "nose",
  });

  // ---- Tail: a long chain tapering to a point, with twelve bony rings.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.14, -0.16],
      [0, 0.134, -0.24],
      [0, 0.122, -0.32],
      [0, 0.106, -0.4],
      [0, 0.092, -0.47],
      [0, 0.084, -0.53],
    ]),
    { parent: "hips", names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"], role: "tail" },
  );
  b.sweep(tail, tailR, {
    color: tailTone,
    sides: 8,
    caps: { start: "round", end: "point" },
    name: "tail",
  });
  for (let k = 0; k < 12; k++) {
    const a = 0.06 + (0.9 * k) / 12;
    const c = 0.06 + (0.9 * (k + 1)) / 12;
    b.sweep(
      tail,
      (t: number): [number, number] => {
        const f = Math.min(Math.max((t - a) / (c - a), 0), 1);
        const r = tailR(t) + 0.0014 + 0.0026 * (1 - f) * (1 - f);
        return [r, r];
      },
      { from: a, to: c, color: plate(a, c), sides: 8, caps: "none", name: `tailBand${k + 1}` },
    );
  }

  // ---- Legs in a trot: front-left and hind-right reach forward, front-right and hind-left trail back.
  const limb = (
    names: [string, string, string],
    parent: string,
    pts: [V, V, V],
    toeZ: number,
    claws: number,
    clawLen: number,
    clawR: number,
  ) => {
    const chain = b.chain(names[0], pts, { parent, names, role: "leg" });
    b.sweep(chain, legR, { color: LEG, sides: 8, name: `${names[0]}Limb` });
    const ankle = pts[2];
    b.capsule(ankle, [ankle[0], 0.016, toeZ], 0.016, {
      color: FOOT,
      bone: names[2],
      sides: 8,
      name: `${names[2]}Foot`,
    });
    for (let i = 0; i < claws; i++) {
      const x = ankle[0] + (i - (claws - 1) / 2) * 0.0085;
      b.spike([x, 0.016, toeZ + 0.008], [0, -0.45, 1], clawLen, clawR, {
        color: CLAW,
        bone: names[2],
        sides: 6,
      });
    }
  };
  limb(
    ["shoulderL", "elbowL", "wristL"],
    "spine3",
    [
      [0.05, 0.125, 0.09],
      [0.058, 0.07, 0.108],
      [0.062, 0.03, 0.14],
    ],
    0.17,
    4,
    0.022,
    0.0042,
  );
  limb(
    ["shoulderR", "elbowR", "wristR"],
    "spine3",
    [
      [-0.05, 0.125, 0.09],
      [-0.058, 0.07, 0.08],
      [-0.062, 0.03, 0.05],
    ],
    0.08,
    4,
    0.022,
    0.0042,
  );
  limb(
    ["hipL", "kneeL", "ankleL"],
    "hips",
    [
      [0.06, 0.13, -0.12],
      [0.072, 0.07, -0.1],
      [0.066, 0.03, -0.145],
    ],
    -0.085,
    3,
    0.016,
    0.0032,
  );
  limb(
    ["hipR", "kneeR", "ankleR"],
    "hips",
    [
      [-0.06, 0.13, -0.12],
      [-0.072, 0.07, -0.085],
      [-0.066, 0.03, -0.11],
    ],
    -0.05,
    3,
    0.016,
    0.0032,
  );

  // ---- Coarse pale hairs standing out of the seams between the bands.
  const plates = b.surface(bands);
  const fraction = (t: number) => {
    for (let k = 0; k < zone.length - 1; k++)
      if (t >= zone[k] && t < zone[k + 1]) return (t - zone[k]) / (zone[k + 1] - zone[k]);
    return -1;
  };
  const hairLength = rng(11);
  const hairs = plates.scatter(56, {
    rng: rng(7),
    minDist: 0.01,
    filter: (hit) => fraction(spine.path.closestT(hit.at)) > 0.7 && hit.n.y > -0.35,
  });
  for (const hit of hairs) {
    const lean = hit.n.add(new THREE.Vector3(0, -0.15, -0.4));
    b.spike(hit, lean, 0.011 + 0.008 * hairLength(), 0.0019, { color: HAIR, sides: 5 });
  }

  return b.root;
}
```