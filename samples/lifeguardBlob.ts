// Lifeguard (Blob): a beach lifeguard, an athletic man 1.85 m tall, built from blended volumes (src/experimental/blob).
// Body, head, jaw, hands, feet, hair and trunks are each one closed mesh grown from spheres, ellipsoids, capsules and
// tubes merged with smooth junctions; the skeleton is a full humanoid rig with five-finger hands, toes and a jaw.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { blob, capsule, carve, ellipsoid, grow, plane, sphere, tube } from "../src/experimental/blob";
import type { Ingredient } from "../src/experimental/blob";
import { paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import type { Chain, Joint } from "../src/skeleton";

export const meta = {
  name: "Lifeguard (Blob)",
  description:
    "A 1.85 m athletic beach lifeguard in red swim trunks, barefoot, with a whistle on a cord, sunglasses pushed up on his head and a zinc stripe on his nose. Every body part is a blended volume: smooth sculpted junctions at shoulders, armpits, hips and neck.",
};

type V3 = [number, number, number];

const SKIN = "#dca17a";
const LIP = "#b0665c";
const HAIR = "#a98450";
const BROW = "#7d5e36";
const EYE = "#f1eee6";
const IRIS = "#3f7396";
const PUPIL = "#101418";
const TRUNKS = "#d3252b";
const TRUNKS_DARK = "#a51b22";
const BAND = "#f3efe6";
const ZINC = "#f8f8f4";
const NAIL = "#efc3aa";
const LENS = "#1c2733";
const FRAME = "#f1f1ec";
const CORD = "#f0c419";
const WHISTLE = "#e23a2f";

const v3 = (p: V3) => new THREE.Vector3(...p);

/** Piecewise-linear radius through `[t, r]` keys, t along the path. */
const along =
  (...keys: Array<[number, number]>) =>
  (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++)
      if (t <= keys[i][0])
        return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (t - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
    return keys[keys.length - 1][1];
  };

export default function build() {
  const b = createBuilder({ name: "lifeguardBlob" });
  const sides = [1, -1] as const;
  const suffix = (s: number) => (s > 0 ? "L" : "R");

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton.

  const hips = b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 1.02, 0], aim: [0, 1.17, 0], role: "spine" });
  const spine1 = b.joint("spine1", { parent: spine, at: [0, 1.17, 0], aim: [0, 1.33, 0], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.33, 0], aim: [0, 1.5, 0.005], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 1.5, 0.005], aim: [0, 1.61, 0.02], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.61, 0.02], aim: [0, 1.85, 0.0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.688, -0.03], aim: [0, 1.632, 0.05], role: "jaw" });

  type Limb = {
    shoulder: Joint;
    arm: Chain;
    leg: Chain;
    foot: Joint;
    toe: Joint;
    wrist: THREE.Vector3;
    handDir: THREE.Vector3;
  };
  const limbs: Record<number, Limb> = {};
  for (const s of sides) {
    const S = suffix(s);
    const shoulder = b.joint(`shoulder${S}`, {
      parent: spine2,
      at: [s * 0.025, 1.515, 0.02],
      aim: [s * 0.19, 1.49, 0],
    });
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.19, 1.49, 0],
        [s * 0.416, 1.264, 0],
        [s * 0.607, 1.073, 0],
        [s * 0.678, 1.002, 0],
      ]),
      { parent: shoulder, names: [`upperArm${S}`, `lowerArm${S}`, `hand${S}`], role: "arm" },
    );
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.09, 0.925, 0],
        [s * 0.096, 0.495, 0.012],
        [s * 0.1, 0.082, -0.008],
      ]),
      { parent: hips, names: [`upLeg${S}`, `leg${S}`], role: "leg" },
    );
    const foot = b.joint(`foot${S}`, {
      parent: leg.joints[1],
      at: [s * 0.1, 0.082, -0.008],
      aim: [s * 0.1, 0.03, 0.12],
    });
    const toe = b.joint(`toe${S}`, { parent: foot, at: [s * 0.1, 0.03, 0.12], aim: [s * 0.1, 0.02, 0.2] });
    limbs[s] = {
      shoulder,
      arm,
      leg,
      foot,
      toe,
      wrist: v3([s * 0.607, 1.073, 0]),
      handDir: v3([s * 0.7071, -0.7071, 0]),
    };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Body: torso, pelvis, neck, arms and legs are one blob so armpits, shoulders and crotch blend.

  /** Pelvis, glutes, thighs and calves: the body's own volumes, which the trunks grow. */
  const lowerBody = (): Ingredient[] => [
    ellipsoid([0, 0.985, 0], [0.158, 0.105, 0.105], { bone: hips, blend: 0.05 }),
    ...sides.flatMap((s) => {
      const { leg } = limbs[s];
      const thigh = along(
        [0, 0.098],
        [0.16, 0.094],
        [0.32, 0.086],
        [0.42, 0.07],
        [0.5, 0.058],
        [0.58, 0.057],
        [0.68, 0.06],
        [0.85, 0.044],
        [1, 0.033],
      );
      return [
        ellipsoid([s * 0.085, 0.905, -0.055], [0.085, 0.085, 0.08], { bone: hips, blend: 0.05 }),
        tube(leg.path, thigh, { bone: leg, blend: 0.04 }),
        ellipsoid([s * 0.106, 0.72, 0.028], [0.056, 0.15, 0.064], { bone: leg.joints[0], blend: 0.05 }),
        ellipsoid([s * 0.098, 0.7, -0.04], [0.05, 0.14, 0.05], { bone: leg.joints[0], blend: 0.05 }),
        ellipsoid([s * 0.106, 0.35, -0.03], [0.05, 0.115, 0.055], { bone: leg.joints[1], blend: 0.05 }),
      ];
    }),
  ];

  const body: Ingredient[] = [
    // Ribcage and chest.
    ellipsoid([0, 1.375, -0.005], [0.165, 0.135, 0.115], { bone: spine2 }),
    ellipsoid([0, 1.255, -0.008], [0.148, 0.14, 0.105], { bone: spine1 }),
    // Waist and abdomen.
    ellipsoid([0, 1.125, 0], [0.132, 0.12, 0.092], { bone: spine, blend: 0.05 }),
    // Neck.
    capsule([0, 1.5, 0.0], [0, 1.625, 0.018], 0.058, { bone: neck, blend: 0.05 }),
    ...lowerBody(),
  ];
  for (const s of sides) {
    const { arm } = limbs[s];
    const upperArm = arm.joints[0];
    const lowerArm = arm.joints[1];
    const armDir: V3 = [s * 0.7071, -0.7071, 0];
    body.push(
      // Pecs, lats, traps, deltoid.
      ellipsoid([s * 0.078, 1.39, 0.07], [0.082, 0.062, 0.055], { bone: spine2, blend: 0.03 }),
      ellipsoid([s * 0.125, 1.3, -0.045], [0.04, 0.1, 0.05], { bone: spine1, blend: 0.05 }),
      capsule([0, 1.565, -0.03], [s * 0.15, 1.52, -0.015], [0.05, 0.04], { bone: spine2, blend: 0.06 }),
      ellipsoid([s * 0.205, 1.485, 0.0], [0.062, 0.075, 0.068], { bone: upperArm, blend: 0.05 }),
      ellipsoid([s * 0.075, 1.4, -0.1], [0.042, 0.055, 0.015], { bone: spine2, blend: 0.04 }),
      // Abs.
      ...[1.185, 1.13, 1.075].map((y) =>
        ellipsoid([s * 0.03, y, 0.078], [0.03, 0.024, 0.02], { bone: spine1, blend: 0.02 }),
      ),
      // Arm.
      tube(
        arm.path.slice(0, 0.86),
        along([0, 0.05], [0.12, 0.054], [0.3, 0.052], [0.5, 0.042], [0.6, 0.043], [0.78, 0.045], [1, 0.028]),
        { bone: arm, blend: 0.04 },
      ),
      ellipsoid([s * 0.3, 1.38, 0.0], [0.046, 0.115, 0.05], { bone: upperArm, dir: armDir, blend: 0.04 }),
      ellipsoid([s * 0.5, 1.185, 0.0], [0.043, 0.12, 0.044], { bone: lowerArm, dir: armDir, blend: 0.04 }),
    );
  }
  const bodyPart = blob(b, body, { color: SKIN, blend: 0.045, cell: 0.02, spread: 0.07, name: "body" });

  // ---------------------------------------------------------------------------------------------------------------
  // Hands: palm, thenar and hypothenar pads, four fingers and a thumb, every phalanx on its own joint.

  const unit = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).normalize();
  for (const s of sides) {
    const S = suffix(s);
    const { arm, wrist, handDir } = limbs[s];
    const handJoint = arm.joints[2];
    const u = handDir.clone();
    const w = unit(-s * 0.7071 * Math.cos(0.436), -0.7071 * Math.cos(0.436), Math.sin(0.436));
    const v = w.clone().cross(u);
    if (v.z < 0) v.negate();
    const at = (a: number, c: number, d: number) =>
      wrist.clone().addScaledVector(u, a).addScaledVector(v, c).addScaledVector(w, d);
    const toward = (d: THREE.Vector3, sideways: number, curl: number) =>
      d
        .clone()
        .multiplyScalar(Math.cos(sideways))
        .addScaledVector(v, Math.sin(sideways))
        .multiplyScalar(Math.cos(curl))
        .addScaledVector(w, Math.sin(curl))
        .normalize();
    const parts: Ingredient[] = [
      ellipsoid(at(-0.01, 0, 0), [0.03, 0.04, 0.024], { bone: handJoint, dir: u, up: w }),
      ellipsoid(at(0.058, -0.001, 0), [0.043, 0.056, 0.0165], { bone: handJoint, dir: u, up: w, blend: 0.02 }),
      ellipsoid(at(0.034, 0.034, 0.011), [0.018, 0.032, 0.013], { bone: handJoint, dir: toward(u, 0.5, 0), up: w }),
      ellipsoid(at(0.05, -0.034, 0.008), [0.013, 0.034, 0.011], { bone: handJoint, dir: u, up: w }),
    ];
    // [knuckle across, knuckle along, spread deg, lengths, radii].
    const fingers: Array<[string, number, number, number, number[], number]> = [
      ["index", 0.036, 0.099, 7, [0.043, 0.026, 0.021], 0.0092],
      ["middle", 0.0125, 0.101, 1, [0.047, 0.029, 0.022], 0.0096],
      ["ring", -0.011, 0.097, -5, [0.044, 0.027, 0.021], 0.009],
      ["pinky", -0.033, 0.089, -13, [0.034, 0.019, 0.019], 0.0082],
    ];
    for (const [name, across, along, spread, lengths, r] of fingers) {
      const pts = [at(along, across, 0.001)];
      const curls = [0.06, 0.16, 0.25];
      lengths.forEach((len, i) =>
        pts.push(pts[i].clone().addScaledVector(toward(u, (spread * Math.PI) / 180, curls[i]), len)),
      );
      const chain = b.chain(`${name}${S}`, polyline(pts), {
        parent: handJoint,
        names: [`${name}1${S}`, `${name}2${S}`, `${name}3${S}`],
        role: "digit",
      });
      const tip = pts[3].clone().addScaledVector(toward(u, (spread * Math.PI) / 180, curls[2]), -0.0065);
      b.part(new THREE.SphereGeometry(1, 8, 5), NAIL, {
        bone: chain.joints[2],
        at: tip.addScaledVector(w, -r * 0.62),
        dir: toward(u, (spread * Math.PI) / 180, curls[2]),
        up: w.clone().negate(),
        scale: [r * 0.62, 0.0075, 0.0016],
        name: "nail",
      });
      chain.joints.forEach((joint, i) =>
        parts.push(
          capsule(pts[i], pts[i + 1], [r * (1 - 0.09 * i), r * (1 - 0.09 * (i + 1))], { bone: joint, blend: 0.003 }),
        ),
      );
    }
    // Thumb: apart from the fingers, angled out from the palm.
    const thumbPts = [at(0.024, 0.026, 0.006)];
    const thumbLengths = [0.046, 0.034, 0.029];
    const thumbCurls = [0.12, 0.2, 0.32];
    thumbLengths.forEach((len, i) =>
      thumbPts.push(thumbPts[i].clone().addScaledVector(toward(u, 0.72, thumbCurls[i]), len)),
    );
    const thumb = b.chain(`thumb${S}`, polyline(thumbPts), {
      parent: handJoint,
      names: [`thumb1${S}`, `thumb2${S}`, `thumb3${S}`],
      role: "digit",
    });
    const thumbRadii = [0.0135, 0.0118, 0.0105, 0.0092];
    const thumbTip = thumbPts[3].clone().addScaledVector(toward(u, 0.72, thumbCurls[2]), -0.007);
    b.part(new THREE.SphereGeometry(1, 8, 5), NAIL, {
      bone: thumb.joints[2],
      at: thumbTip.addScaledVector(w, -0.0062),
      dir: toward(u, 0.72, thumbCurls[2]),
      up: w.clone().negate(),
      scale: [0.0072, 0.009, 0.0018],
      name: "nail",
    });
    thumb.joints.forEach((joint, i) =>
      parts.push(
        capsule(thumbPts[i], thumbPts[i + 1], [thumbRadii[i], thumbRadii[i + 1]], { bone: joint, blend: 0.008 }),
      ),
    );
    blob(b, parts, { color: SKIN, blend: 0.012, cell: 0.0065, spread: 0.008, name: `hand${S}` });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Feet: heel, instep, ball, five toes; a carve at the floor makes the sole flat.

  for (const s of sides) {
    const S = suffix(s);
    const { foot, toe, leg } = limbs[s];
    const x = s * 0.1;
    const parts: Ingredient[] = [
      capsule([x, 0.075, -0.01], [x, 0.16, -0.01], 0.031, { bone: leg.joints[1], blend: 0.02 }),
      ellipsoid([x, 0.085, -0.012], [0.036, 0.04, 0.04], { bone: foot }),
      ellipsoid([x, 0.036, -0.038], [0.031, 0.034, 0.037], { bone: foot }),
      ellipsoid([x, 0.058, 0.032], [0.038, 0.04, 0.078], { bone: foot }),
      ellipsoid([x, 0.03, 0.11], [0.05, 0.03, 0.04], { bone: foot }),
      carve(ellipsoid([x - s * 0.034, -0.004, 0.03], [0.028, 0.03, 0.06])),
    ];
    const toes: Array<[number, number, number, number]> = [
      [-0.03, 0.13, 0.062, 0.0148],
      [-0.0085, 0.128, 0.056, 0.0118],
      [0.0105, 0.122, 0.05, 0.0112],
      [0.028, 0.113, 0.044, 0.0104],
      [0.0435, 0.103, 0.036, 0.0095],
    ];
    for (const [dx, z, len, r] of toes)
      parts.push(
        capsule([x + s * dx, r * 0.95, z], [x + s * dx, r * 0.95, z + len], [r, r * 0.86], { bone: toe, blend: 0.004 }),
      );
    for (const [dx, z, len, r] of toes)
      b.part(new THREE.SphereGeometry(1, 8, 5), NAIL, {
        bone: toe,
        at: [x + s * dx, r * 1.72, z + len - 0.006],
        scale: [r * 0.6, 0.0016, r * 0.75],
        name: "toenail",
      });
    parts.push(carve(plane([0, 0, 0], [0, -1, 0], { blend: 0.004 })));
    blob(b, parts, { color: SKIN, blend: 0.025, cell: 0.0075, spread: 0.02, name: `foot${S}` });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head and jaw.

  // The head's skin is painted where it needs to be: the white zinc stripe down the nose and the two brows. The brows
  // are lines on the built face (filled in below, before the paint is baked): points of the surface, so the strip
  // lies flush on it.
  const browLines: THREE.Vector3[][] = [];
  const skinPaint = paint((p, n) => {
    if (Math.abs(p.x) < 0.0065 && p.y > 1.708 && p.y < 1.753 && p.z > 0.075 && n.z > 0.25) return ZINC;
    for (const line of browLines)
      for (let i = 0; i < line.length - 1; i++) {
        const ab = line[i + 1].clone().sub(line[i]);
        const f = Math.min(Math.max(p.clone().sub(line[i]).dot(ab) / ab.lengthSq(), 0), 1);
        const width = 0.0058 * (1 - (0.3 * (i + f)) / (line.length - 1));
        if (p.distanceTo(line[i].clone().addScaledVector(ab, f)) < width && n.z > 0.1) return BROW;
      }
    return SKIN;
  });
  const skull: Ingredient[] = [
    ellipsoid([0, 1.75, -0.012], [0.077, 0.09, 0.098], { blend: 0.03 }),
    ellipsoid([0, 1.7, -0.035], [0.06, 0.05, 0.07], { blend: 0.03 }),
    ellipsoid([0, 1.69, 0.02], [0.06, 0.058, 0.072], { blend: 0.03 }),
    capsule([0, 1.56, 0.0], [0, 1.66, 0.01], 0.055, { bone: neck, blend: 0.04 }),
    // Brow ridge, nose, upper lip.
    capsule([-0.05, 1.762, 0.082], [0.05, 1.762, 0.082], 0.0095, { blend: 0.02 }),
    capsule([0, 1.75, 0.086], [0, 1.71, 0.108], [0.01, 0.014], { blend: 0.015 }),
    sphere([0, 1.706, 0.112], 0.0145, { blend: 0.012 }),
    ellipsoid([0, 1.698, 0.102], [0.022, 0.012, 0.012], { blend: 0.012 }),
    ellipsoid([0, 1.672, 0.078], [0.028, 0.014, 0.014], { blend: 0.015 }),
    // Cheekbones, ears, eyelids.
    ...sides.map((s) => ellipsoid([s * 0.05, 1.715, 0.045], [0.026, 0.024, 0.03], { blend: 0.03 })),
    ...sides.map((s) => ellipsoid([s * 0.077, 1.722, -0.012], [0.009, 0.029, 0.019], { blend: 0.012 })),
    ...sides.flatMap((s) => {
      // Upper lids hug the eyeball: an arc just above its centre.
      const c: V3 = [s * 0.031, 1.738, 0.0765];
      const p = (dx: number, dy: number, dz: number): V3 => [c[0] + dx, c[1] + dy, c[2] + dz];
      return [
        capsule(p(-0.012, 0.004, 0.0045), p(0, 0.0095, 0.0085), 0.0042, { blend: 0.005 }),
        capsule(p(0, 0.0095, 0.0085), p(0.012, 0.004, 0.0045), 0.0042, { blend: 0.005 }),
      ];
    }),
    // Nostrils.
    ...sides.map((s) => carve(sphere([s * 0.009, 1.693, 0.111], 0.0055, { blend: 0.004 }))),
  ];
  const headBlob = blob(b, skull, {
    color: skinPaint,
    blend: 0.03,
    cell: 0.009,
    spread: 0.02,
    bone: head,
    name: "head",
  });
  const face = b.surface(headBlob);
  for (const s of sides)
    browLines.push(
      [
        [s * 0.012, 1.7605],
        [s * 0.03, 1.7625],
        [s * 0.052, 1.7585],
      ].map(([x, y]) => face.ray([x, y, 0.4], [0, 0, -1])!.at),
    );
  const jawParts: Ingredient[] = [
    ellipsoid([0, 1.652, 0.022], [0.047, 0.026, 0.062], { bone: jaw, blend: 0.03 }),
    ellipsoid([0, 1.636, 0.068], [0.022, 0.016, 0.016], { bone: jaw, blend: 0.02 }),
    ...sides.map((s) =>
      capsule([s * 0.044, 1.7, -0.015], [s * 0.04, 1.648, -0.012], 0.015, { bone: jaw, blend: 0.03 }),
    ),
    ...sides.map((s) =>
      capsule([s * 0.04, 1.648, -0.012], [s * 0.026, 1.63, 0.058], 0.016, { bone: jaw, blend: 0.03 }),
    ),
  ];
  blob(b, jawParts, { color: SKIN, blend: 0.03, cell: 0.009, spread: 0.01, bone: jaw, name: "jaw" });

  // Face details: eyes, brows, lips.
  for (const s of sides) {
    const eye: V3 = [s * 0.031, 1.738, 0.0765];
    b.part(new THREE.SphereGeometry(0.0135, 10, 8), EYE, { bone: head, at: eye, name: "eyeball" });
    b.part(new THREE.SphereGeometry(0.0075, 8, 6), IRIS, {
      bone: head,
      at: [eye[0], eye[1], eye[2] + 0.0116],
      scale: [1, 1, 0.35],
      name: "iris",
    });
    b.part(new THREE.SphereGeometry(0.0036, 6, 4), PUPIL, {
      bone: head,
      at: [eye[0], eye[1], eye[2] + 0.0132],
      scale: [1, 1, 0.35],
      name: "pupil",
    });
  }
  b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: head,
    at: [0, 1.6735, 0.0915],
    scale: [0.0235, 0.0058, 0.0075],
    name: "upperLip",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: jaw,
    at: [0, 1.6585, 0.0865],
    scale: [0.0215, 0.0068, 0.0078],
    name: "lowerLip",
  });

  // Hair: a crop over the skull, cut by a hairline across the forehead and a level nape line, with the ears left out.
  const hairParts: Ingredient[] = [
    ellipsoid([0, 1.752, -0.014], [0.084, 0.097, 0.105], { blend: 0.03 }),
    ellipsoid([0, 1.705, -0.04], [0.066, 0.055, 0.076], { blend: 0.03 }),
    ellipsoid([0, 1.812, 0.03], [0.05, 0.03, 0.06], { blend: 0.03 }),
    carve(plane([0, 1.806, 0.07], [0, -0.35, 0.94], { blend: 0.01 })),
    carve(plane([0, 1.712, 0], [0, -1, 0], { blend: 0.01 })),
    ...sides.map((s) => carve(ellipsoid([s * 0.08, 1.722, -0.012], [0.022, 0.036, 0.028], { blend: 0.006 }))),
  ];
  const hairBlob = blob(b, hairParts, { color: HAIR, blend: 0.03, cell: 0.01, spread: 0.01, bone: head, name: "hair" });

  // Sunglasses pushed up on the hair: lenses lying on the crown, temples along the hair, all seated by surface hits.
  const crown = b.surface(hairBlob);
  for (const s of sides) {
    const hit = crown.nearest([s * 0.033, 1.84, 0.05]);
    const n = hit.n;
    const at = hit.at.clone().addScaledVector(n, 0.0078);
    b.part(new THREE.SphereGeometry(1, 12, 8), FRAME, {
      bone: head,
      at,
      dir: n,
      axis: "z",
      scale: [0.031, 0.0235, 0.0042],
      name: "rim",
    });
    b.part(new THREE.SphereGeometry(1, 12, 8), LENS, {
      bone: head,
      at: at.clone().addScaledVector(n, 0.001),
      dir: n,
      axis: "z",
      scale: [0.0275, 0.0205, 0.0042],
      name: "lens",
    });
    const temple = [
      [s * 0.062, 1.8, 0.035],
      [s * 0.078, 1.79, -0.02],
      [s * 0.076, 1.765, -0.06],
    ].map((p) => {
      const h = crown.nearest(p as V3);
      return h.at.addScaledVector(h.n, 0.0035);
    });
    b.sweep(polyline(temple), 0.0036, { bone: head, color: FRAME, sides: 6, name: "temple" });
  }
  b.capsule([-0.008, 1.832, 0.058], [0.008, 1.832, 0.058], 0.0038, { bone: head, color: FRAME, name: "bridge" });

  // Whistle on a cord: the cord is a loop draped over neck and chest.
  const torso = b.surface(bodyPart);
  const loop = catmull(
    [
      [0, 1.585, -0.06],
      [0.065, 1.56, -0.045],
      [0.08, 1.535, 0.03],
      [0.03, 1.46, 0.12],
      [0, 1.41, 0.13],
      [-0.03, 1.46, 0.12],
      [-0.08, 1.535, 0.03],
      [-0.065, 1.56, -0.045],
    ],
    { closed: true },
  );
  b.sweep(torso.drape(loop, { lift: 0.0035 }), 0.0035, { color: CORD, sides: 6, bone: spine2, name: "cord" });
  const top = torso.ray([0, 1.42, 0.5], [0, 0, -1])!;
  const bottom = torso.ray([0, 1.385, 0.5], [0, 0, -1])!;
  b.capsule(top.at.addScaledVector(top.n, 0.006), bottom.at.addScaledVector(bottom.n, 0.008), 0.0085, {
    bone: spine2,
    color: WHISTLE,
    name: "whistle",
  });

  // Trunks: the pelvis and thighs again, a little bigger, cut at the waist and mid thigh. A paint draws the white
  // waistband, the dark hem and a white stripe down each outer side, so they bend with the cloth.
  const trunkPaint = paint((p, n) => {
    if (p.y > 1.03) return BAND;
    if (Math.abs(n.x) > 0.82 && Math.abs(p.z) < 0.011 && p.y < 1.03) return BAND;
    if (p.y < 0.705) return TRUNKS_DARK;
    return TRUNKS;
  });
  blob(
    b,
    [
      ...lowerBody().map((part) => grow(part, 0.008)),
      carve(plane([0, 1.055, 0], [0, 1, 0], { blend: 0.012 })),
      carve(plane([0, 0.68, 0], [0, -1, 0], { blend: 0.012 })),
    ],
    { color: trunkPaint, blend: 0.045, cell: 0.016, spread: 0.07, name: "trunks" },
  );

  return b.root;
}
