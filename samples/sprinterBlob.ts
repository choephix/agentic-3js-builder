// Sprinter (Blob): an athletic woman 1.70 m tall in a crop top with a race bib, running briefs and spikes, hair in a
// high ponytail. Built from blended volumes (src/experimental/blob): body, head, jaw, hands, hair, shoes and garments
// are closed meshes grown from spheres, ellipsoids, capsules and tubes merged with smooth junctions. Garments are the
// body's own volumes grown a few millimetres and cut with carves; the bib is a thin cut of the chest painted with
// its number. The skeleton is a full humanoid rig with five-finger hands, toe joints, a jaw and a ponytail chain.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { blob, capsule, carve, ellipsoid, grow, plane, sphere, tube } from "../src/experimental/blob";
import type { Ingredient } from "../src/experimental/blob";
import { paint } from "../src/paint";
import { catmull, polyline } from "../src/path";
import type { Chain, Joint } from "../src/skeleton";

export const meta = {
  name: "Sprinter (Blob)",
  description:
    "A 1.70 m athletic sprinter in a teal crop top with a numbered race bib, running briefs and orange spikes, hair in a high ponytail. Every body part is a blended volume with smooth sculpted junctions; clothes are the body's volumes grown and cut.",
};

type V3 = [number, number, number];

const SKIN = "#d19a76";
const LIP = "#b85f5b";
const HAIR = "#6d3318";
const BROW = "#4a2412";
const LASH = "#2a1610";
const EYE = "#f3f0e8";
const IRIS = "#4a7f4c";
const PUPIL = "#101418";
const NAIL = "#e9a9a0";
const TOP = "#15b3c4";
const TRIM = "#0d6e7c";
const BRIEFS = "#15b3c4";
const WHITE = "#f4f4ef";
const INK = "#16191d";
const RED = "#d8262d";
const SHOE = "#ff6a1a";
const SOLE = "#f2f2ee";
const SPIKE = "#c9ced4";
const TIE = "#f2d21b";

const v3 = (p: V3) => new THREE.Vector3(...p);

/** Piecewise-linear value through `[t, v]` keys, t along the path. */
const along =
  (...keys: Array<[number, number]>) =>
  (t: number) => {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++)
      if (t <= keys[i][0])
        return keys[i - 1][1] + ((keys[i][1] - keys[i - 1][1]) * (t - keys[i - 1][0])) / (keys[i][0] - keys[i - 1][0]);
    return keys[keys.length - 1][1];
  };

/** 5 × 7 pixel digits for the bib. */
const GLYPHS: Record<string, string[]> = {
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
};

export default function build() {
  const b = createBuilder({ name: "sprinterBlob", paintSize: 2048 });
  const sides = [1, -1] as const;
  const suffix = (s: number) => (s > 0 ? "L" : "R");

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton.

  const hips = b.joint("hips", { at: [0, 0.885, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.joint("spine", { parent: hips, at: [0, 0.95, 0], aim: [0, 1.07, 0], role: "spine" });
  const spine1 = b.joint("spine1", { parent: spine, at: [0, 1.07, 0], aim: [0, 1.2, 0], role: "spine" });
  const spine2 = b.joint("spine2", { parent: spine1, at: [0, 1.2, 0], aim: [0, 1.38, 0.004], role: "spine" });
  const neck = b.joint("neck", { parent: spine2, at: [0, 1.38, 0.004], aim: [0, 1.487, 0.018], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.487, 0.018], aim: [0, 1.7, 0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.559, -0.028], aim: [0, 1.507, 0.046], role: "jaw" });

  type Limb = {
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
      at: [s * 0.022, 1.395, 0.02],
      aim: [s * 0.17, 1.372, 0],
    });
    const arm = b.chain(
      `arm${S}`,
      polyline([
        [s * 0.17, 1.372, 0],
        [s * 0.368, 1.174, 0],
        [s * 0.5412, 1.0008, 0],
        [s * 0.6119, 0.9301, 0],
      ]),
      { parent: shoulder, names: [`upperArm${S}`, `lowerArm${S}`, `hand${S}`], role: "arm" },
    );
    const leg = b.chain(
      `leg${S}`,
      polyline([
        [s * 0.083, 0.862, 0],
        [s * 0.088, 0.462, 0.01],
        [s * 0.094, 0.09, -0.006],
      ]),
      { parent: hips, names: [`upLeg${S}`, `leg${S}`], role: "leg" },
    );
    const foot = b.joint(`foot${S}`, {
      parent: leg.joints[1],
      at: [s * 0.094, 0.09, -0.006],
      aim: [s * 0.094, 0.035, 0.105],
    });
    const toe = b.joint(`toe${S}`, { parent: foot, at: [s * 0.094, 0.035, 0.105], aim: [s * 0.094, 0.03, 0.19] });
    limbs[s] = { arm, leg, foot, toe, wrist: v3([s * 0.5412, 1.0008, 0]), handDir: v3([s * 0.7071, -0.7071, 0]) };
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Body: torso, pelvis, neck, arms and legs are one blob so armpits, shoulders and crotch blend.

  /** Pelvis, glutes, thighs and calves: the body's own volumes, which the briefs grow. */
  const lowerBody = (): Ingredient[] => [
    ellipsoid([0, 0.905, 0], [0.152, 0.1, 0.1], { bone: hips, blend: 0.05 }),
    ...sides.flatMap((s) => {
      const { leg } = limbs[s];
      const thigh = along(
        [0, 0.084],
        [0.16, 0.081],
        [0.32, 0.072],
        [0.42, 0.06],
        [0.5, 0.049],
        [0.58, 0.048],
        [0.68, 0.05],
        [0.85, 0.04],
        [1, 0.029],
      );
      return [
        ellipsoid([s * 0.078, 0.83, -0.055], [0.082, 0.085, 0.078], { bone: hips, blend: 0.05 }),
        tube(leg.path, thigh, { bone: leg, blend: 0.04 }),
        ellipsoid([s * 0.097, 0.665, 0.026], [0.05, 0.135, 0.057], { bone: leg.joints[0], blend: 0.05 }),
        ellipsoid([s * 0.09, 0.65, -0.035], [0.046, 0.125, 0.046], { bone: leg.joints[0], blend: 0.05 }),
        ellipsoid([s * 0.098, 0.32, -0.028], [0.043, 0.1, 0.047], { bone: leg.joints[1], blend: 0.05 }),
      ];
    }),
  ];

  /** Ribcage and bust: the volumes the crop top and the bib grow. */
  const chest = (): Ingredient[] => [
    ellipsoid([0, 1.275, -0.005], [0.132, 0.115, 0.093], { bone: spine2 }),
    ellipsoid([0, 1.165, -0.005], [0.112, 0.12, 0.085], { bone: spine1 }),
    ...sides.flatMap((s) => [
      ellipsoid([s * 0.058, 1.245, 0.074], [0.056, 0.055, 0.05], { bone: spine2, blend: 0.03 }),
      ellipsoid([s * 0.06, 1.285, 0.06], [0.06, 0.045, 0.04], { bone: spine2, blend: 0.04 }),
    ]),
  ];

  /** Lats and shoulder blades, which the crop top must cover too. */
  const back = (): Ingredient[] =>
    sides.flatMap((s) => [
      ellipsoid([s * 0.11, 1.19, -0.04], [0.03, 0.085, 0.04], { bone: spine1, blend: 0.05 }),
      ellipsoid([s * 0.06, 1.29, -0.088], [0.036, 0.045, 0.013], { bone: spine2, blend: 0.04 }),
    ]);

  const body: Ingredient[] = [
    ...chest(),
    ...back(),
    // Waist and abdomen, neck.
    ellipsoid([0, 1.045, 0], [0.1, 0.1, 0.072], { bone: spine, blend: 0.05 }),
    capsule([0, 1.385, 0.0], [0, 1.5, 0.018], 0.043, { bone: neck, blend: 0.05 }),
    ...lowerBody(),
  ];
  for (const s of sides) {
    const { arm } = limbs[s];
    const upperArm = arm.joints[0];
    const lowerArm = arm.joints[1];
    const armDir: V3 = [s * 0.7071, -0.7071, 0];
    body.push(
      capsule([0, 1.44, -0.03], [s * 0.13, 1.395, -0.015], [0.034, 0.028], { bone: spine2, blend: 0.06 }),
      ellipsoid([s * 0.183, 1.368, 0], [0.046, 0.056, 0.05], { bone: upperArm, blend: 0.05 }),
      // Abs.
      ...[1.125, 1.085, 1.045].map((y) =>
        ellipsoid([s * 0.024, y, 0.068], [0.024, 0.019, 0.015], { bone: spine1, blend: 0.02 }),
      ),
      // Arm.
      tube(
        arm.path.slice(0, 0.86),
        along([0, 0.038], [0.12, 0.04], [0.3, 0.04], [0.5, 0.031], [0.6, 0.033], [0.78, 0.034], [1, 0.024]),
        { bone: arm, blend: 0.04 },
      ),
      ellipsoid([s * 0.27, 1.27, 0], [0.033, 0.09, 0.036], { bone: upperArm, dir: armDir, blend: 0.04 }),
      ellipsoid([s * 0.452, 1.09, 0], [0.031, 0.09, 0.031], { bone: lowerArm, dir: armDir, blend: 0.04 }),
    );
  }
  const bodyPart = blob(b, body, { color: SKIN, blend: 0.04, cell: 0.018, spread: 0.06, name: "body" });

  // ---------------------------------------------------------------------------------------------------------------
  // Hands: palm, thenar and hypothenar pads, four fingers and a thumb, every phalanx on its own joint. Slightly smaller
  // than a man's: everything is scaled by `k`.

  const k = 0.9;
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
      wrist
        .clone()
        .addScaledVector(u, a * k)
        .addScaledVector(v, c * k)
        .addScaledVector(w, d * k);
    const toward = (d: THREE.Vector3, sideways: number, curl: number) =>
      d
        .clone()
        .multiplyScalar(Math.cos(sideways))
        .addScaledVector(v, Math.sin(sideways))
        .multiplyScalar(Math.cos(curl))
        .addScaledVector(w, Math.sin(curl))
        .normalize();
    const parts: Ingredient[] = [
      ellipsoid(at(-0.01, 0, 0), [0.03 * k, 0.04 * k, 0.023 * k], { bone: handJoint, dir: u, up: w }),
      ellipsoid(at(0.058, -0.001, 0), [0.041 * k, 0.056 * k, 0.0155 * k], {
        bone: handJoint,
        dir: u,
        up: w,
        blend: 0.02,
      }),
      ellipsoid(at(0.034, 0.034, 0.011), [0.017 * k, 0.032 * k, 0.012 * k], {
        bone: handJoint,
        dir: toward(u, 0.5, 0),
        up: w,
      }),
      ellipsoid(at(0.05, -0.034, 0.008), [0.012 * k, 0.034 * k, 0.01 * k], { bone: handJoint, dir: u, up: w }),
    ];
    // [name, knuckle across, knuckle along, spread deg, phalanx lengths, radius].
    const fingers: Array<[string, number, number, number, number[], number]> = [
      ["index", 0.036, 0.099, 7, [0.043, 0.026, 0.021], 0.0092],
      ["middle", 0.0125, 0.101, 1, [0.047, 0.029, 0.022], 0.0096],
      ["ring", -0.011, 0.097, -5, [0.044, 0.027, 0.021], 0.009],
      ["pinky", -0.033, 0.089, -13, [0.034, 0.019, 0.019], 0.0082],
    ];
    for (const [name, across, along, spread, lengths, r0] of fingers) {
      const r = r0 * k;
      const pts = [at(along, across, 0.001)];
      const curls = [0.06, 0.16, 0.25];
      lengths.forEach((len, i) =>
        pts.push(pts[i].clone().addScaledVector(toward(u, (spread * Math.PI) / 180, curls[i]), len * k)),
      );
      const chain = b.chain(`${name}${S}`, polyline(pts), {
        parent: handJoint,
        names: [`${name}1${S}`, `${name}2${S}`, `${name}3${S}`],
        role: "digit",
      });
      const tipDir = toward(u, (spread * Math.PI) / 180, curls[2]);
      b.part(new THREE.SphereGeometry(1, 8, 5), NAIL, {
        bone: chain.joints[2],
        at: pts[3]
          .clone()
          .addScaledVector(tipDir, -0.0065 * k)
          .addScaledVector(w, -r * 0.62),
        dir: tipDir,
        up: w.clone().negate(),
        scale: [r * 0.62, 0.0075 * k, 0.0016],
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
      thumbPts.push(thumbPts[i].clone().addScaledVector(toward(u, 0.72, thumbCurls[i]), len * k)),
    );
    const thumb = b.chain(`thumb${S}`, polyline(thumbPts), {
      parent: handJoint,
      names: [`thumb1${S}`, `thumb2${S}`, `thumb3${S}`],
      role: "digit",
    });
    const thumbRadii = [0.0135, 0.0118, 0.0105, 0.0092].map((r) => r * k);
    const thumbDir = toward(u, 0.72, thumbCurls[2]);
    b.part(new THREE.SphereGeometry(1, 8, 5), NAIL, {
      bone: thumb.joints[2],
      at: thumbPts[3]
        .clone()
        .addScaledVector(thumbDir, -0.007 * k)
        .addScaledVector(w, -0.0062 * k),
      dir: thumbDir,
      up: w.clone().negate(),
      scale: [0.0072 * k, 0.009 * k, 0.0018],
      name: "nail",
    });
    thumb.joints.forEach((joint, i) =>
      parts.push(
        capsule(thumbPts[i], thumbPts[i + 1], [thumbRadii[i], thumbRadii[i + 1]], { bone: joint, blend: 0.007 }),
      ),
    );
    blob(b, parts, { color: SKIN, blend: 0.011, cell: 0.006, spread: 0.008, name: `hand${S}` });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Spikes: heel counter, midfoot, forefoot and toe box, a carve for the ankle opening and one at the sole, six spikes
  // under the forefoot. The paint draws the white sole and a side flash.

  const shoePaint = paint((p, n) => {
    if (p.y < 0.021) return SOLE;
    if (Math.abs(n.x) > 0.5 && Math.abs(p.y - 0.045 - 0.32 * (p.z + 0.02)) < 0.0045) return SOLE;
    return SHOE;
  });
  for (const s of sides) {
    const S = suffix(s);
    const { foot, toe } = limbs[s];
    const x = s * 0.094;
    blob(
      b,
      [
        ellipsoid([x, 0.05, -0.036], [0.034, 0.042, 0.042], { bone: foot }),
        ellipsoid([x, 0.052, 0.026], [0.037, 0.038, 0.075], { bone: foot }),
        ellipsoid([x, 0.032, 0.105], [0.04, 0.026, 0.06], { bone: toe }),
        ellipsoid([x - s * 0.004, 0.028, 0.15], [0.032, 0.021, 0.04], { bone: toe }),
        carve(capsule([x, 0.1, -0.012], [x, 0.22, -0.012], 0.036, { blend: 0.006 })),
        carve(plane([0, 0.007, 0], [0, -1, 0], { blend: 0.004 })),
      ],
      { color: shoePaint, blend: 0.025, cell: 0.008, spread: 0.02, name: `shoe${S}` },
    );
    for (const [dx, z] of [
      [-0.022, 0.14],
      [0, 0.158],
      [0.022, 0.14],
      [-0.02, 0.105],
      [0.02, 0.105],
      [0, 0.125],
    ])
      b.spike([x + dx, 0.0085, z], [0, -1, 0], 0.0092, 0.0034, { bone: toe, color: SPIKE, sides: 5, name: "spike" });
    for (const [dx, z] of [
      [-0.012, -0.045],
      [0.012, -0.045],
    ])
      b.spike([x + dx, 0.0085, z], [0, -1, 0], 0.0092, 0.0034, { bone: foot, color: SPIKE, sides: 5, name: "spike" });
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Head and jaw: the head is drawn at a man's proportions and scaled by `HS`, then softened (smaller nose and jaw,
  // bigger eyes, fuller lips).

  const HS = 0.925;
  const P = ([x, y, z]: V3): V3 => [x * HS, 1.487 + (y - 1.61) * HS, z * HS];
  const R = (r: number) => r * HS;
  const R3 = ([x, y, z]: V3): V3 => [x * HS, y * HS, z * HS];

  const browLines: THREE.Vector3[][] = [];
  const lashLines: THREE.Vector3[][] = [];
  const near = (
    p: THREE.Vector3,
    lines: THREE.Vector3[][],
    width: (f: number) => number,
    facing: (n: number) => boolean,
    n: THREE.Vector3,
  ) => {
    for (const line of lines)
      for (let i = 0; i < line.length - 1; i++) {
        const ab = line[i + 1].clone().sub(line[i]);
        const f = Math.min(Math.max(p.clone().sub(line[i]).dot(ab) / ab.lengthSq(), 0), 1);
        if (p.distanceTo(line[i].clone().addScaledVector(ab, f)) < width((i + f) / (line.length - 1)) && facing(n.z))
          return true;
      }
    return false;
  };
  const skinPaint = paint((p, n) => {
    if (
      near(
        p,
        browLines,
        (f) => 0.0048 * (1 - 0.4 * f),
        (z) => z > 0.1,
        n,
      )
    )
      return BROW;
    if (
      near(
        p,
        lashLines,
        () => 0.0026,
        (z) => z > 0.1,
        n,
      )
    )
      return LASH;
    return SKIN;
  });
  const skull: Ingredient[] = [
    ellipsoid(P([0, 1.75, -0.012]), R3([0.074, 0.09, 0.098]), { blend: 0.03 }),
    ellipsoid(P([0, 1.7, -0.035]), R3([0.058, 0.05, 0.07]), { blend: 0.03 }),
    ellipsoid(P([0, 1.69, 0.02]), R3([0.056, 0.058, 0.072]), { blend: 0.03 }),
    capsule(P([0, 1.56, 0.0]), P([0, 1.66, 0.01]), 0.047, { bone: neck, blend: 0.04 }),
    // Brow ridge, nose, upper lip.
    capsule(P([-0.047, 1.759, 0.082]), P([0.047, 1.759, 0.082]), R(0.0082), { blend: 0.02 }),
    capsule(P([0, 1.75, 0.084]), P([0, 1.712, 0.104]), [R(0.0078), R(0.0115)], { blend: 0.015 }),
    sphere(P([0, 1.71, 0.108]), R(0.0122), { blend: 0.012 }),
    ellipsoid(P([0, 1.702, 0.098]), R3([0.018, 0.01, 0.01]), { blend: 0.012 }),
    ellipsoid(P([0, 1.673, 0.078]), R3([0.028, 0.0145, 0.0145]), { blend: 0.015 }),
    // Cheekbones, ears, upper eyelids.
    ...sides.map((s) => ellipsoid(P([s * 0.05, 1.715, 0.045]), R3([0.027, 0.025, 0.03]), { blend: 0.03 })),
    ...sides.map((s) => ellipsoid(P([s * 0.075, 1.722, -0.012]), R3([0.008, 0.026, 0.017]), { blend: 0.012 })),
    ...sides.flatMap((s) => {
      const c = P([s * 0.031, 1.738, 0.0765]);
      const p = (dx: number, dy: number, dz: number): V3 => [c[0] + dx * HS, c[1] + dy * HS, c[2] + dz * HS];
      return [
        capsule(p(-0.012, 0.004, 0.0045), p(0, 0.0095, 0.0085), R(0.0042), { blend: 0.005 }),
        capsule(p(0, 0.0095, 0.0085), p(0.012, 0.004, 0.0045), R(0.0042), { blend: 0.005 }),
      ];
    }),
    // Nostrils.
    ...sides.map((s) => carve(sphere(P([s * 0.008, 1.696, 0.106]), R(0.0048), { blend: 0.004 }))),
  ];
  const headBlob = blob(b, skull, {
    color: skinPaint,
    blend: 0.03,
    cell: 0.0085,
    spread: 0.02,
    bone: head,
    name: "head",
  });
  const face = b.surface(headBlob);
  const onFace = (x: number, y: number) => face.ray([x, y, 0.4], [0, 0, -1])!.at;
  for (const s of sides) {
    const [x0, y0] = P([s * 0.012, 1.7565, 0]);
    const [x1, y1] = P([s * 0.032, 1.761, 0]);
    const [x2, y2] = P([s * 0.054, 1.7565, 0]);
    browLines.push([onFace(x0, y0), onFace(x1, y1), onFace(x2, y2)]);
  }
  const jawParts: Ingredient[] = [
    ellipsoid(P([0, 1.652, 0.022]), R3([0.043, 0.024, 0.058]), { bone: jaw, blend: 0.03 }),
    ellipsoid(P([0, 1.639, 0.06]), R3([0.017, 0.012, 0.012]), { bone: jaw, blend: 0.02 }),
    ...sides.map((s) =>
      capsule(P([s * 0.041, 1.7, -0.015]), P([s * 0.037, 1.648, -0.012]), R(0.014), { bone: jaw, blend: 0.03 }),
    ),
    ...sides.map((s) =>
      capsule(P([s * 0.037, 1.648, -0.012]), P([s * 0.022, 1.631, 0.056]), R(0.014), { bone: jaw, blend: 0.03 }),
    ),
  ];
  blob(b, jawParts, { color: SKIN, blend: 0.03, cell: 0.0085, spread: 0.01, bone: jaw, name: "jaw" });

  // Eyes (large), lashes along the upper lid, lips.
  for (const s of sides) {
    const eye = P([s * 0.031, 1.738, 0.0765]);
    b.part(new THREE.SphereGeometry(R(0.0142), 10, 8), EYE, { bone: head, at: eye, name: "eyeball" });
    b.part(new THREE.SphereGeometry(R(0.0082), 8, 6), IRIS, {
      bone: head,
      at: [eye[0], eye[1], eye[2] + R(0.0123)],
      scale: [1, 1, 0.35],
      name: "iris",
    });
    b.part(new THREE.SphereGeometry(R(0.0038), 6, 4), PUPIL, {
      bone: head,
      at: [eye[0], eye[1], eye[2] + R(0.014)],
      scale: [1, 1, 0.35],
      name: "pupil",
    });
  }
  b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: head,
    at: P([0, 1.6735, 0.0915]),
    scale: [0.0225, 0.0062, 0.0078],
    name: "upperLip",
  });
  b.part(new THREE.SphereGeometry(1, 10, 6), LIP, {
    bone: jaw,
    at: P([0, 1.6585, 0.0855]),
    scale: [0.0205, 0.0078, 0.0085],
    name: "lowerLip",
  });

  // Hair: pulled back from a high hairline, tight over the ears and short at the nape; the ponytail hangs on a chain.
  const hairParts: Ingredient[] = [
    ellipsoid(P([0, 1.753, -0.014]), R3([0.082, 0.097, 0.104]), { blend: 0.03 }),
    ellipsoid(P([0, 1.705, -0.04]), R3([0.064, 0.055, 0.076]), { blend: 0.03 }),
    carve(plane(P([0, 1.815, 0.07]), [0, -0.45, 0.9], { blend: 0.01 })),
    carve(plane(P([0, 1.735, 0]), [0, -1, 0], { blend: 0.01 })),
    ...sides.map((s) => carve(ellipsoid(P([s * 0.078, 1.722, -0.012]), R3([0.02, 0.034, 0.026]), { blend: 0.006 }))),
  ];
  blob(b, hairParts, { color: HAIR, blend: 0.03, cell: 0.009, spread: 0.01, bone: head, name: "hair" });
  const tail = b.chain(
    "ponytail",
    catmull([
      [0, 1.664, -0.084],
      [0, 1.684, -0.124],
      [0, 1.668, -0.174],
      [0, 1.618, -0.214],
      [0, 1.55, -0.236],
      [0, 1.48, -0.238],
      [0, 1.415, -0.228],
    ]),
    { parent: head, count: 4, role: "tail" },
  );
  blob(
    b,
    [
      sphere([0, 1.668, -0.088], 0.026, { bone: head, blend: 0.02 }),
      tube(tail, along([0, 0.02], [0.15, 0.026], [0.4, 0.03], [0.65, 0.027], [0.85, 0.02], [1, 0.006]), {
        blend: 0.03,
      }),
    ],
    { color: HAIR, blend: 0.03, cell: 0.009, spread: 0.03, name: "ponytail" },
  );
  const tieAt = tail.at(0.05);
  b.part(new THREE.TorusGeometry(0.0285, 0.0065, 6, 14), TIE, {
    bone: head,
    at: tieAt.at,
    dir: tieAt.tangent,
    axis: "z",
    name: "hairTie",
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Clothes: the body's volumes grown and cut.

  // Running briefs: pelvis and thighs, cut at the waist and high on each leg.
  const briefsPaint = paint((p, n) => {
    if (p.y > 0.955) return TRIM;
    if (Math.abs(n.x) > 0.8 && Math.abs(p.z) < 0.008) return WHITE;
    return BRIEFS;
  });
  blob(
    b,
    [
      ...lowerBody().map((part) => grow(part, 0.006)),
      carve(plane([0, 0.985, 0], [0, 1, 0], { blend: 0.01 })),
      ...sides.map((s) => carve(plane([s * 0.075, 0.815, 0], [s * 0.55, -0.83, 0], { blend: 0.012 }))),
    ],
    { color: briefsPaint, blend: 0.04, cell: 0.014, spread: 0.06, name: "briefs" },
  );

  // Crop top: ribcage and bust grown, cut under the bust and across the top, with a strap over each shoulder.
  const top = blob(
    b,
    [
      ...[...chest(), ...back()].map((part) => grow(part, 0.006)),
      carve(plane([0, 1.16, 0], [0, -1, 0], { blend: 0.01 })),
      carve(plane([0, 1.325, 0], [0, 1, 0], { blend: 0.01 })),
    ],
    { color: TOP, blend: 0.04, cell: 0.014, spread: 0.06, name: "top" },
  );
  const torso = b.surface(bodyPart);
  for (const s of sides) {
    const strap = polyline([
      [s * 0.06, 1.315, 0.09],
      [s * 0.068, 1.36, 0.06],
      [s * 0.072, 1.395, 0.0],
      [s * 0.066, 1.36, -0.05],
      [s * 0.058, 1.315, -0.08],
    ]);
    b.sweep(torso.drape(strap, { lift: 0.0035 }), [0.0135, 0.0026], {
      color: TOP,
      section: "box",
      bone: spine2,
      name: "strap",
    });
  }
  void top;

  // Race bib: the chest grown a bit more and cut to a rectangle, painted white with its number, a red band and pins.
  const bibPaint = paint((p, n) => {
    if (n.z < 0.3) return WHITE;
    const pixel = 0.0062;
    const x0 = -(17 * pixel) / 2;
    const col = Math.floor((p.x - x0) / pixel);
    const row = Math.floor((1.272 - p.y) / pixel);
    const digit = "217"[Math.floor(col / 6)];
    if (digit && col % 6 < 5 && row >= 0 && row < 7 && GLYPHS[digit][row][col % 6] === "1") return INK;
    if (p.y > 1.29) return RED;
    for (const sx of [-1, 1])
      for (const py of [1.297, 1.196]) if (Math.hypot(p.x - sx * 0.068, p.y - py) < 0.0045) return INK;
    return WHITE;
  });
  blob(
    b,
    [
      ...chest().map((part) => grow(part, 0.0125)),
      ...chest().map((part) => carve(grow(part, 0.0066), { blend: 0.002 })),
      carve(plane([0.077, 0, 0], [1, 0, 0], { blend: 0.002 })),
      carve(plane([-0.077, 0, 0], [-1, 0, 0], { blend: 0.002 })),
      carve(plane([0, 1.302, 0], [0, 1, 0], { blend: 0.002 })),
      carve(plane([0, 1.19, 0], [0, -1, 0], { blend: 0.002 })),
      carve(plane([0, 0, 0.02], [0, 0, -1], { blend: 0.002 })),
    ],
    { color: bibPaint, blend: 0.04, cell: 0.005, spread: 0.03, bone: spine2, name: "bib" },
  );

  return b.root;
}
