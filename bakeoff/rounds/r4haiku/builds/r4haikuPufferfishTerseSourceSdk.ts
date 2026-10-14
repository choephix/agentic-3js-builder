import * as THREE from "three";
import { countershade, createBuilder, gradient, rng, spots } from "../../../../src/index";

export const meta = {
  name: "Pufferfish",
  description:
    "A pufferfish puffed round on the sea floor: golden spotted back, cream belly, a coat of spines, teal fan fins, blue-irised eyes and a beaked mouth on a jointed jaw.",
};

/** Height of the body's centre line. The widest ring's belly touches y = 0. */
const MID = 0.074;

const GOLD = "#dcab3c";
const SPOT_DARK = "#4a3414";
const SPOT_BROWN = "#6e4f1c";
const CREAM = "#f7f0da";
const SPINE = "#6b5124";
const SCLERA = "#fbf7ea";
const IRIS = "#2f8fc0";
const PUPIL = "#120d08";
const BEAK = "#efe5c4";
const MOUTH = "#2a1c0b";
const NOSTRIL = "#3a2a10";
const FIN = "#4fb6b0";
const PECTORAL = "#9adccd";
const TAIL_ROOT = "#4fb6b0";
const TAIL_TIP = "#2a6e9e";

/** Pectoral fan in its own plane: x runs back along the fin, y out from the body. */
const PECTORAL_OUTLINE = [
  [-0.012, 0.008],
  [0.012, 0.03],
  [0.04, 0.036],
  [0.062, 0.018],
  [0.064, -0.006],
  [0.046, -0.024],
  [0.016, -0.02],
  [-0.012, -0.008],
];

/** Caudal fin: x runs back from the tail tip, y up. The sharp root corners sit inside the peduncle. */
const CAUDAL_OUTLINE = [
  [-0.02, 0.03, "sharp"],
  [0.02, 0.05],
  [0.05, 0.063],
  [0.078, 0.046],
  [0.09, 0],
  [0.078, -0.046],
  [0.05, -0.063],
  [0.02, -0.05],
  [-0.02, -0.03, "sharp"],
];

export default function pufferfish() {
  const b = createBuilder({ name: "pufferfish" });

  // Skeleton: the body is the root, the head carries the eyes and the jaw, the tail is a three-joint chain.
  const body = b.joint("body", { at: [0, MID, 0], dir: [0, 0, 1], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, MID, 0.05], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.058, 0.07], dir: [0, -0.15, 1], role: "jaw" });
  const tail = b.chain(
    "tail",
    [
      [0, MID, -0.02],
      [0, MID, -0.07],
      [0, MID, -0.1],
    ],
    { parent: body, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );
  const dorsal = b.joint("dorsal", { parent: body, at: [0, 0.12, -0.04], dir: [0, 1, 0], role: "fan" });
  const anal = b.joint("anal", { parent: body, at: [0, 0.04, -0.04], dir: [0, -1, 0], role: "fan" });
  const finL = b.joint("finL", { parent: body, at: [0.072, MID, 0.03], dir: [1, 0, -0.4], role: "fan" });
  const finR = b.joint("finR", { parent: body, at: [-0.072, MID, 0.03], dir: [-1, 0, -0.4], role: "fan" });

  // Body: a puffed ellipsoid lofted through stations, flat-faced at the front, skinned across tail, body and head.
  const coat = countershade(spots(GOLD, [SPOT_DARK, SPOT_BROWN], { size: 0.045, amount: 0.22, seed: 3 }), CREAM, {
    level: 0.1,
    soft: 0.42,
  });
  const trunk = b.loft(
    [
      { at: [0, MID, -0.1], w: 0.03, h: 0.035 },
      { at: [0, MID, -0.07], w: 0.075, h: 0.09 },
      { at: [0, MID, -0.03], w: 0.14, h: 0.14 },
      { at: [0, MID, 0.01], w: 0.16, h: 0.15 },
      { at: [0, MID, 0.05], w: 0.155, h: 0.145 },
      { at: [0, MID, 0.085], w: 0.12, h: 0.13 },
    ],
    {
      name: "body",
      color: coat,
      sides: 12,
      caps: { start: "round", end: "flat" },
      bone: [tail.joints[0], tail.joints[1], body, head],
    },
  );

  // Eyes: a white ball with a blue iris, a black pupil and a catchlight, one on each side of the head.
  for (const side of [1, -1]) {
    const eye = new THREE.Vector3(side * 0.069, 0.108, 0.05);
    const gaze = new THREE.Vector3(side * 0.75, 0.1, 0.65).normalize();
    const on = (d: number, dx = 0, dy = 0) => eye.clone().addScaledVector(gaze, d).add(new THREE.Vector3(dx, dy, 0));
    b.part(new THREE.SphereGeometry(0.017, b.segments(10), b.segments(7)), SCLERA, {
      at: eye,
      bone: head,
      name: "eye",
    });
    b.part(new THREE.CylinderGeometry(0.0125, 0.0125, 0.004, b.segments(10)), IRIS, {
      at: on(0.0165),
      dir: gaze,
      bone: head,
      name: "iris",
    });
    b.part(new THREE.CylinderGeometry(0.0068, 0.0068, 0.004, b.segments(8)), PUPIL, {
      at: on(0.0205),
      dir: gaze,
      bone: head,
      name: "pupil",
    });
    b.part(new THREE.SphereGeometry(0.0026, b.segments(5), b.segments(4)), "#ffffff", {
      at: on(0.0215, -side * 0.004, 0.005),
      bone: head,
      name: "catchlight",
    });
  }

  // Mouth: a fixed upper beak, a dark slit, and a lower beak hung from the jaw hinge, slightly open.
  b.part(new THREE.BoxGeometry(0.042, 0.014, 0.03), BEAK, { at: [0, 0.084, 0.1], bone: head, name: "upperBeak" });
  b.part(new THREE.BoxGeometry(0.03, 0.004, 0.028), MOUTH, { at: [0, 0.0705, 0.099], bone: head, name: "mouth" });
  b.part(new THREE.BoxGeometry(0.036, 0.013, 0.03), BEAK, { at: [0, 0.058, 0.1], bone: jaw, name: "lowerBeak" });
  for (const side of [1, -1])
    b.part(new THREE.CylinderGeometry(0.0038, 0.0038, 0.004, b.segments(6)), NOSTRIL, {
      at: [side * 0.03, 0.1, 0.087],
      dir: [0, 0, 1],
      bone: head,
      name: "nostril",
    });

  // Fins: two fan pectorals, a dorsal and an anal fin, and a rounded caudal fin running from teal to deep blue.
  for (const [fin, side] of [
    [finL, 1],
    [finR, -1],
  ] as const)
    b.extrude(PECTORAL_OUTLINE, {
      color: PECTORAL,
      at: fin,
      x: [0, 0, -1],
      y: [side, 0, 0],
      thickness: 0.004,
      smoothing: 1,
      name: "pectoralFin",
    });
  b.slab(
    [
      [0, 0.13, -0.005],
      [0, 0.178, -0.032],
      [0, 0.166, -0.066],
      [0, 0.118, -0.088],
    ],
    { color: FIN, thickness: 0.006, bone: dorsal, name: "dorsalFin" },
  );
  b.slab(
    [
      [0, 0.034, -0.015],
      [0, 0.02, -0.05],
      [0, 0.024, -0.078],
      [0, 0.044, -0.082],
    ],
    { color: FIN, thickness: 0.006, bone: anal, name: "analFin" },
  );
  b.extrude(CAUDAL_OUTLINE, {
    color: gradient(TAIL_ROOT, TAIL_TIP, [0, MID, -0.08], [0, MID, -0.19]),
    at: tail.joints[2],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.005,
    smoothing: 1,
    name: "caudalFin",
  });

  // Spines: a dense coat over the body, kept off the mouth, eyes, fin roots and the floor.
  const keepOut = (p: THREE.Vector3) => {
    if (p.z > 0.075 || p.z < -0.085) return true;
    if (Math.abs(p.x) < 0.014 && (p.y > 0.1 || p.y < 0.06) && p.z > -0.09 && p.z < 0) return true;
    for (const side of [1, -1]) {
      if (p.distanceTo(new THREE.Vector3(side * 0.072, MID, 0.03)) < 0.035) return true;
      if (p.distanceTo(new THREE.Vector3(side * 0.069, 0.108, 0.05)) < 0.03) return true;
    }
    return false;
  };
  const spines = b.surface(trunk).scatter(180, {
    rng: rng(7),
    minDist: 0.015,
    keepOut,
    filter: (hit) => hit.n.y > -0.25 && hit.at.y > 0.03,
  });
  const jitter = rng(11);
  for (const hit of spines)
    b.spike(hit.moved([0, -0.0015, 0]), hit, 0.011 + 0.005 * jitter(), 0.0022 + 0.0008 * jitter(), {
      color: SPINE,
      group: "spines",
    });

  return b.root;
}
