// Lifeguard (Control arm): a beach lifeguard, an athletic man about 1.85 m tall, built with the plain SDK.
import * as THREE from "three";
import { createBuilder } from "../src/builder";
import { rng } from "../src/math";
import { catmull, polyline } from "../src/path";
import type { Surface } from "../src/surface";

export const meta = {
  name: "Lifeguard (Control)",
  description:
    "Athletic beach lifeguard, 1.85 m: shirtless, red swim trunks, barefoot, whistle on a cord, sunglasses pushed up on his head, zinc on his nose. A-pose, full finger and toe rig.",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette

const SKIN = "#cf9468";
const LIP = "#b26558";
const NAIL = "#e6b995";
const HAIR = "#e6c46e";
const BROW = "#b58f4a";
const EYE_WHITE = "#f3efe6";
const IRIS = "#3c7ea8";
const PUPIL = "#15151a";
const TRUNK = "#d92d2d";
const TRUNK_DARK = "#a51f22";
const TRIM = "#f6f1e4";
const WHISTLE = "#f2c318";
const FRAME = "#1b1b20";
const LENS = "#2e6f9c";
const ZINC = "#fbfbf6";

// ---------------------------------------------------------------------------------------------------------------
// Helpers

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Monotone cubic through `[u, a, b, ...]` keys: `f(u)` gives every channel, no overshoot between keys. */
function spline(keys: readonly number[][]) {
  const n = keys.length;
  const ch = keys[0].length - 1;
  const xs = keys.map((k) => k[0]);
  const slopes: number[][] = [];
  for (let c = 1; c <= ch; c++) {
    const ys = keys.map((k) => k[c]);
    const d = ys.slice(1).map((y, i) => (y - ys[i]) / (xs[i + 1] - xs[i]));
    const m = ys.map((_, i) =>
      i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2,
    );
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) m[i] = m[i + 1] = 0;
      else {
        const a = m[i] / d[i];
        const bb = m[i + 1] / d[i];
        const s = a * a + bb * bb;
        if (s > 9) {
          const tau = 3 / Math.sqrt(s);
          m[i] = tau * a * d[i];
          m[i + 1] = tau * bb * d[i];
        }
      }
    }
    slopes.push(m);
  }
  return (u: number) => {
    const x = Math.min(Math.max(u, xs[0]), xs[n - 1]);
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return slopes.map((m, c) => {
      const y0 = keys[i][c + 1];
      const y1 = keys[i + 1][c + 1];
      return (
        (2 * t3 - 3 * t2 + 1) * y0 + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * y1 + (t3 - t2) * h * m[i + 1]
      );
    });
  };
}

/** A sweep radius / shift pair out of a spline sample `[rx, ry, shift]`. */
const rad = ([rx, ry]: number[]): [number, number] => [rx, ry];
const shf = ([, , z]: number[]): [number, number] => [0, z];

/** Orientation whose local x, y, z axes point along the given model-space directions. */
const basis = (x: THREE.Vector3, y: THREE.Vector3, z: THREE.Vector3) =>
  new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));

/** `v` with its component along the unit vector `n` removed. */
const flat = (v: THREE.Vector3, n: THREE.Vector3) => v.clone().addScaledVector(n, -v.dot(n));

/** A unit sphere squashed to half axes (x, y, z): muscle bellies and pads for `stick`. */
const lump = (x: number, y: number, z: number, w = 10, h = 7) => new THREE.SphereGeometry(1, w, h).scale(x, y, z);

// ---------------------------------------------------------------------------------------------------------------

export default function build() {
  const b = createBuilder({ name: "lifeguardControl" });
  const ball = (w = 10, h = 8) => new THREE.SphereGeometry(1, w, h);

  /** Seat a muscle belly on a skin surface: the first hit of a ray, oriented with its local Z along `flow`. */
  const onSkin = (
    surface: Surface,
    from: [number, number, number],
    dir: [number, number, number],
    geometry: THREE.BufferGeometry,
    color: string,
    options: { embed?: number; flow?: [number, number, number]; spin?: number; group?: string },
  ) => {
    const hit = surface.ray(from, dir);
    return hit ? b.stick(geometry, color, hit, options) : null;
  };

  // ---- skeleton spine, neck, head ---------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.955, 0] });
  const spine = b.chain(
    "spineChain",
    polyline([
      [0, 1.03, 0],
      [0, 1.15, 0],
      [0, 1.29, 0.005],
      [0, 1.505, -0.005],
    ]),
    { parent: hips, names: ["spine", "spine1", "spine2"], up: [0, 0, 1], role: "spine" },
  );
  const spine2 = spine.joints[2];
  const neckChain = b.chain(
    "neckChain",
    polyline([
      [0, 1.505, -0.005],
      [0, 1.615, 0.008],
    ]),
    { parent: spine2, names: ["neck"], up: [0, 0, 1], role: "neck" },
  );
  const neck = neckChain.joints[0];
  const head = b.joint("head", { parent: neck, at: [0, 1.615, 0.008], aim: [0, 1.85, 0.0], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.688, -0.022], aim: [0, 1.625, 0.07], role: "jaw" });

  // ---- torso ----------------------------------------------------------------------------------------------
  // Section keys by height: [y, half width, half depth, forward shift of the section centre].
  const TY0 = 0.86;
  const TY1 = 1.53;
  const torsoAt = spline([
    [0.86, 0.1, 0.09, 0],
    [0.9, 0.146, 0.1, -0.004],
    [0.96, 0.166, 0.106, -0.004],
    [1.04, 0.158, 0.1, 0],
    [1.1, 0.146, 0.092, 0.006],
    [1.17, 0.14, 0.088, 0.01],
    [1.24, 0.152, 0.096, 0.012],
    [1.31, 0.172, 0.108, 0.014],
    [1.38, 0.184, 0.114, 0.016],
    [1.44, 0.176, 0.106, 0.008],
    [1.49, 0.13, 0.088, -0.004],
    [1.52, 0.06, 0.055, -0.012],
    [1.53, 0.04, 0.04, -0.012],
  ]);
  const torsoPath = catmull([
    [0, TY0, 0],
    [0, 1.0, 0],
    [0, 1.2, 0],
    [0, 1.4, 0],
    [0, TY1, 0],
  ]);
  const yOfT = (t: number) => TY0 + t * (TY1 - TY0);
  const torso = b.sweep(torsoPath, (t) => rad(torsoAt(yOfT(t))), {
    shift: (t) => shf(torsoAt(yOfT(t))),
    bone: [hips, spine, neck],
    color: SKIN,
    sides: 16,
    up: [0, 0, 1],
    group: "torso",
  });

  // neck
  const neckAt = spline([
    [0, 0.066, 0.061, -0.012],
    [0.4, 0.056, 0.053, -0.006],
    [1, 0.052, 0.052, 0.004],
  ]);
  const neckTube = b.sweep(
    catmull([
      [0, 1.47, -0.02],
      [0, 1.56, -0.006],
      [0, 1.65, 0.008],
    ]),
    (t) => rad(neckAt(t)),
    { shift: (t) => shf(neckAt(t)), bone: [spine2, neck, head], color: SKIN, sides: 10, up: [0, 0, 1], group: "neck" },
  );
  b.part(ball(), SKIN, { bone: neck, at: [0, 1.578, 0.047], scale: [0.011, 0.015, 0.011], group: "neck" });
  const neckSkin = b.surface(neckTube);
  for (const s of [1, -1])
    onSkin(neckSkin, [s * 0.03, 1.56, 0.6], [0, 0, -1], lump(0.011, 0.009, 0.06, 8, 5), SKIN, {
      embed: 0.5,
      flow: [-s * 0.35, -1, 0.2],
      group: "neck",
    });

  // ---- chest, abdomen, back -----------------------------------------------------------------------------------
  const skin = b.surface(torso);
  const pecs = [1, -1].map((s) =>
    onSkin(skin, [s * 0.09, 1.385, 0.6], [0, 0, -1], lump(0.105, 0.032, 0.066, 12, 8), SKIN, {
      embed: 0.35,
      flow: [0, -1, 0],
      spin: s * 12,
      group: "chest",
    }),
  );
  for (const s of [1, -1]) {
    // nipples on the pecs
    const pec = pecs[s > 0 ? 0 : 1];
    if (pec) {
      const hit = b.surface(pec).ray([s * 0.1, 1.372, 0.6], [0, 0, -1]);
      if (hit) b.stick(lump(0.0085, 0.003, 0.0085, 8, 4), LIP, hit, { embed: 0.3, group: "chest" });
    }
    // rectus abdominis blocks
    for (const y of [1.112, 1.163, 1.214, 1.265])
      onSkin(skin, [s * 0.0315, y, 0.6], [0, 0, -1], lump(0.0315, 0.019, 0.0245, 8, 6), SKIN, {
        embed: 0.4,
        flow: [0, -1, 0],
        group: "abdomen",
      });
    // ribcage flank, serratus digitations
    for (const [y, x] of [
      [1.335, 0.145],
      [1.29, 0.14],
      [1.245, 0.135],
    ])
      onSkin(skin, [s * x, y, 0.6], [0, 0, -1], lump(0.03, 0.012, 0.012, 6, 4), SKIN, {
        embed: 0.4,
        flow: [s * 0.6, -1, 0],
        group: "chest",
      });
    // back: trapezius, shoulder blades, lats, erector spinae
    onSkin(skin, [s * 0.075, 1.415, -0.6], [0, 0, 1], lump(0.062, 0.022, 0.058, 10, 6), SKIN, {
      embed: 0.3,
      flow: [0, -1, 0],
      spin: s * 20,
      group: "back",
    });
    onSkin(skin, [s * 0.12, 1.31, -0.6], [0, 0, 1], lump(0.06, 0.02, 0.1, 10, 6), SKIN, {
      embed: 0.3,
      flow: [s * 0.35, -1, 0],
      group: "back",
    });
    onSkin(skin, [s * 0.03, 1.24, -0.6], [0, 0, 1], lump(0.024, 0.015, 0.11, 8, 6), SKIN, {
      embed: 0.4,
      flow: [0, -1, 0],
      group: "back",
    });
  }
  onSkin(skin, [0, 1.42, -0.6], [0, 0, 1], lump(0.05, 0.02, 0.1, 10, 6), SKIN, {
    embed: 0.3,
    flow: [0, -1, 0],
    group: "back",
  });

  // glutes
  for (const s of [1, -1])
    b.part(ball(10, 8), SKIN, {
      bone: hips,
      at: [s * 0.07, 0.915, -0.055],
      scale: [0.088, 0.092, 0.082],
      group: "hips",
    });

  // ---- legs -------------------------------------------------------------------------------------------------
  const thigh = spline([
    [0, 0.078, 0.088, -0.005],
    [0.1, 0.091, 0.098, -0.004],
    [0.3, 0.088, 0.095, 0.004],
    [0.55, 0.08, 0.087, 0.006],
    [0.8, 0.067, 0.073, 0.003],
    [1, 0.059, 0.065, 0],
  ]);
  const shin = spline([
    [0, 0.059, 0.063, 0],
    [0.12, 0.066, 0.07, -0.006],
    [0.3, 0.068, 0.074, -0.014],
    [0.55, 0.052, 0.059, -0.01],
    [0.8, 0.037, 0.04, -0.004],
    [1, 0.031, 0.033, 0],
  ]);
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const hipP = V(s * 0.088, 0.945, 0);
    const kneeP = V(s * 0.09, 0.505, 0.01);
    const ankleP = V(s * 0.092, 0.088, -0.014);
    const path = catmull([hipP, kneeP, ankleP]);
    const chain = b.chain(`legChain${side}`, path, {
      parent: hips,
      names: [`upLeg${side}`, `leg${side}`],
      up: [0, 0, 1],
      role: "leg",
      contact: [s * 0.092, 0, 0.02],
    });
    const tKnee = path.closestT(kneeP);
    const at = (t: number) => (t < tKnee ? thigh(t / tKnee) : shin((t - tKnee) / (1 - tKnee)));
    const tube = b.sweep(chain, (t) => rad(at(t)), {
      shift: (t) => shf(at(t)),
      color: SKIN,
      sides: 14,
      group: `leg${side}`,
    });
    const legJoint = chain.joints[1];
    const footTip = V(s * 0.092, 0.03, 0.128);
    const foot = b.joint(`foot${side}`, { parent: legJoint, at: ankleP, aim: footTip });
    const toe = b.joint(`toe${side}`, { parent: foot, at: footTip, aim: [s * 0.092, 0.02, 0.24] });

    // calf heads and kneecap, seated on the skin so they bend with it
    const legSkin = b.surface(tube);
    const mu = { flow: [0, -1, 0] as [number, number, number], group: `leg${side}` };
    onSkin(legSkin, [s * 0.108, 0.335, -0.6], [0, 0, 1], lump(0.034, 0.022, 0.09), SKIN, { ...mu, embed: 0.55 });
    onSkin(legSkin, [s * 0.072, 0.345, -0.6], [0, 0, 1], lump(0.036, 0.024, 0.095), SKIN, { ...mu, embed: 0.55 });
    const knee = legSkin.ray([s * 0.09, 0.51, 0.6], [0, 0, -1]);
    if (knee) b.stick(lump(0.031, 0.018, 0.034, 8, 6), SKIN, knee, { ...mu, embed: 0.6 });

    // swim-trunk leg: the thigh tube again, a centimetre out, cut above the knee, with a stripe down the outside
    const tHem = tKnee * 0.62;
    const outer = -s * 90;
    b.sweep(
      chain,
      (t) => {
        const [rx, ry] = at(t);
        const loose = 0.016 + 0.008 * (t / tHem);
        return [rx + loose, ry + loose];
      },
      {
        shift: (t) => shf(at(t)),
        to: tHem,
        caps: { start: "round", end: "flat" },
        bands: [
          [tHem * 0.93, TRUNK],
          [tHem, TRIM],
        ],
        sectors: [[outer - 9, outer + 9, TRIM, 0, tHem * 0.93]],
        sides: 14,
        group: "trunks",
      },
    );

    // foot: heel, arch and ball in one tube on the foot and toe bones
    const fx = s * 0.092;
    const footAt = spline([
      [0, 0.03, 0.033],
      [0.3, 0.034, 0.046],
      [0.62, 0.04, 0.037],
      [0.9, 0.05, 0.027],
      [1, 0.047, 0.02],
    ]);
    b.sweep(
      catmull([
        [fx, 0.037, -0.048],
        [fx, 0.05, -0.02],
        [fx, 0.041, 0.05],
        [fx, 0.031, 0.118],
        [fx, 0.024, 0.15],
      ]),
      (t) => rad(footAt(t)),
      { bone: [foot, toe], color: SKIN, sides: 10, up: [0, 1, 0], group: `foot${side}` },
    );
    const toes = [
      { dx: -0.036, r: 0.0125, tip: 0.238 },
      { dx: -0.019, r: 0.0088, tip: 0.236 },
      { dx: -0.003, r: 0.0082, tip: 0.226 },
      { dx: 0.012, r: 0.0074, tip: 0.213 },
      { dx: 0.026, r: 0.0066, tip: 0.198 },
    ];
    for (const t of toes)
      b.capsule([fx + s * t.dx, t.r + 0.004, 0.135], [fx + s * t.dx, t.r, t.tip - t.r], [t.r, t.r * 0.9], {
        bone: toe,
        color: SKIN,
        sides: 6,
        group: `foot${side}`,
      });
    // ankle bones
    for (const o of [-1, 1])
      b.part(ball(8, 6), SKIN, {
        bone: foot,
        at: [fx + o * 0.029, 0.078, -0.018],
        scale: [0.013, 0.017, 0.017],
        group: `foot${side}`,
      });
  }

  // ---- arms and hands ---------------------------------------------------------------------------------------
  const armAt1 = spline([
    [0, 0.054, 0.054, 0],
    [0.15, 0.06, 0.062, 0.002],
    [0.5, 0.057, 0.066, 0.006],
    [0.8, 0.049, 0.054, 0.002],
    [1, 0.043, 0.047, 0],
  ]);
  const armAt2 = spline([
    [0, 0.043, 0.047, 0],
    [0.15, 0.05, 0.05, 0],
    [0.35, 0.05, 0.046, 0],
    [0.65, 0.038, 0.034, 0],
    [0.9, 0.031, 0.025, 0],
    [1, 0.029, 0.021, 0],
  ]);
  const palmAt = spline([
    [0, 0.028, 0.02, 0],
    [0.3, 0.036, 0.016, 0],
    [0.7, 0.043, 0.014, 0],
    [1, 0.044, 0.012, 0],
  ]);
  const FINGERS = [
    { n: "index", off: 0.031, ang: 7, len: [0.04, 0.025, 0.021], r: 0.0098 },
    { n: "middle", off: 0.0105, ang: 1, len: [0.045, 0.028, 0.022], r: 0.0102 },
    { n: "ring", off: -0.0105, ang: -5, len: [0.041, 0.027, 0.021], r: 0.0094 },
    { n: "pinky", off: -0.03, ang: -12, len: [0.031, 0.019, 0.019], r: 0.008 },
  ];
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const shoulder = b.joint(`shoulder${side}`, {
      parent: spine2,
      at: [s * 0.02, 1.495, 0.075],
      aim: [s * 0.175, 1.5, 0.0],
    });
    const S = V(s * 0.185, 1.468, 0);
    const a1 = V(s * 0.7, -0.7, 0.05).normalize();
    const E = S.clone().addScaledVector(a1, 0.3);
    const a2 = V(s * 0.7, -0.68, 0.16).normalize();
    const Wr = E.clone().addScaledVector(a2, 0.265);
    const d = a2.clone();
    const K = Wr.clone().addScaledVector(d, 0.098);
    // palm normal: down and a little forward; w runs across the palm toward the thumb
    const n = flat(V(0, -1, 0.28), d).normalize();
    const w = new THREE.Vector3().crossVectors(d, n).normalize();
    if (w.z < 0) w.negate();
    // roll from "biceps forward" to the palm normal, about the arm
    const n0 = flat(V(0, 0, 1), d).normalize();
    const twist = (Math.atan2(d.dot(new THREE.Vector3().crossVectors(n0, n)), n0.dot(n)) * 180) / Math.PI;
    const path = catmull([S, E, Wr, K]);
    const tE = path.closestT(E);
    const tW = path.closestT(Wr);
    const arm = b.chain(`armChain${side}`, path, {
      parent: shoulder,
      names: [`upperArm${side}`, `lowerArm${side}`, `hand${side}`],
      up: [0, 0, 1],
      twist: (t) => twist * Math.min(Math.max((t - tE * 0.9) / (tW - tE * 0.9), 0), 1),
      role: "arm",
    });
    const armAtT = (t: number) =>
      t < tE ? armAt1(t / tE) : t < tW ? armAt2((t - tE) / (tW - tE)) : palmAt((t - tW) / (1 - tW));
    const armTube = b.sweep(arm, (t) => rad(armAtT(t)), {
      shift: (t) => shf(armAtT(t)),
      color: SKIN,
      sides: 12,
      group: `arm${side}`,
    });
    const [upperArm, , hand] = arm.joints;

    // biceps, triceps, brachioradialis and forearm extensors, seated on the skin
    const armSkin = b.surface(armTube);
    const f1: [number, number, number] = [a1.x, a1.y, a1.z];
    const f2: [number, number, number] = [a2.x, a2.y, a2.z];
    const belly = (at: THREE.Vector3, dir: number, size: [number, number, number], flow: [number, number, number]) =>
      onSkin(armSkin, [at.x, at.y, dir * 0.6], [0, 0, -dir], lump(...size), SKIN, {
        embed: 0.5,
        flow,
        group: `arm${side}`,
      });
    belly(S.clone().addScaledVector(a1, 0.16), 1, [0.034, 0.024, 0.1], f1);
    belly(S.clone().addScaledVector(a1, 0.15), -1, [0.036, 0.024, 0.105], f1);
    belly(E.clone().addScaledVector(a2, 0.075), 1, [0.026, 0.02, 0.09], f2);
    belly(E.clone().addScaledVector(a2, 0.09), -1, [0.032, 0.02, 0.1], f2);

    // deltoid, along the upper arm; trapezius and clavicle
    const across = flat(V(0, 0, 1), a1).normalize();
    b.part(ball(12, 9), SKIN, {
      bone: upperArm,
      at: S.clone()
        .addScaledVector(a1, 0.04)
        .add(V(s * 0.006, 0.006, 0)),
      quat: basis(new THREE.Vector3().crossVectors(a1, across).normalize(), a1, across),
      scale: [0.06, 0.08, 0.066],
      group: `arm${side}`,
    });
    b.sweep(
      catmull([
        [s * 0.04, 1.535, -0.03],
        [s * 0.12, 1.516, -0.02],
        [s * 0.19, 1.494, -0.005],
      ]),
      [0.03, 0.026],
      { bone: shoulder, color: SKIN, sides: 8, group: "neck" },
    );
    onSkin(skin, [s * 0.085, 1.497, 0.6], [0, 0, -1], lump(0.011, 0.009, 0.075, 8, 5), SKIN, {
      embed: 0.55,
      flow: [s, 0.15, -0.3],
      group: "chest",
    });

    // thenar pad
    b.part(ball(8, 6), SKIN, {
      bone: hand,
      at: Wr.clone().addScaledVector(d, 0.036).addScaledVector(w, 0.022).addScaledVector(n, 0.008),
      quat: basis(w, n, d),
      scale: [0.024, 0.016, 0.034],
      group: `hand${side}`,
    });

    // fingers
    for (const f of FINGERS) {
      const rad3 = (f.ang * Math.PI) / 180;
      const dir = d.clone().multiplyScalar(Math.cos(rad3)).addScaledVector(w, Math.sin(rad3)).normalize();
      const p0 = K.clone().addScaledVector(w, f.off).addScaledVector(d, -0.006);
      const p1 = p0.clone().addScaledVector(dir, f.len[0]);
      const p2 = p1.clone().addScaledVector(dir, f.len[1]);
      const p3 = p2.clone().addScaledVector(dir, f.len[2]);
      const chain = b.chain(`${f.n}Chain${side}`, polyline([p0, p1, p2, p3]), {
        parent: hand,
        names: [1, 2, 3].map((i) => `${f.n}${i}${side}`),
        up: n,
        role: "digit",
      });
      b.sweep(chain, (t) => [f.r * (1 - 0.22 * t), f.r * 0.92 * (1 - 0.22 * t)], {
        color: SKIN,
        sides: 6,
        group: `hand${side}`,
      });
      b.part(ball(6, 4), NAIL, {
        bone: chain.joints[2],
        at: p3
          .clone()
          .addScaledVector(dir, -0.007)
          .addScaledVector(n, -f.r * 0.62),
        quat: basis(w, n, dir),
        scale: [0.0058, 0.0018, 0.0078],
        group: `hand${side}`,
      });
    }
    // thumb, apart from the fingers
    const dt = d
      .clone()
      .multiplyScalar(Math.cos(0.5))
      .addScaledVector(w, Math.sin(0.5))
      .addScaledVector(n, 0.2)
      .normalize();
    const t0 = Wr.clone().addScaledVector(d, 0.028).addScaledVector(w, 0.02).addScaledVector(n, 0.006);
    const t1 = t0.clone().addScaledVector(dt, 0.046);
    const dt2 = dt.clone().addScaledVector(n, 0.12).normalize();
    const t2 = t1.clone().addScaledVector(dt2, 0.032);
    const t3 = t2.clone().addScaledVector(dt2, 0.027);
    const thumb = b.chain(`thumbChain${side}`, polyline([t0, t1, t2, t3]), {
      parent: hand,
      names: [1, 2, 3].map((i) => `thumb${i}${side}`),
      up: n,
      role: "digit",
    });
    b.sweep(thumb, (t) => [0.0135 * (1 - 0.3 * t), 0.0125 * (1 - 0.3 * t)], {
      color: SKIN,
      sides: 7,
      group: `hand${side}`,
    });
    b.part(ball(6, 4), NAIL, {
      bone: thumb.joints[2],
      at: t3.clone().addScaledVector(dt2, -0.008).addScaledVector(n, -0.0082),
      quat: basis(w, n, dt2),
      scale: [0.0072, 0.002, 0.0095],
      group: `hand${side}`,
    });
  }

  // ---- head -------------------------------------------------------------------------------------------------
  const HY0 = 1.655;
  const HY1 = 1.812;
  const skullAt = spline([
    [1.655, 0.056, 0.073, 0.004],
    [1.685, 0.069, 0.084, 0.004],
    [1.715, 0.077, 0.093, 0],
    [1.75, 0.078, 0.097, -0.008],
    [1.775, 0.074, 0.093, -0.012],
    [1.795, 0.06, 0.076, -0.014],
    [1.812, 0.04, 0.05, -0.014],
  ]);
  const skull = b.sweep(
    polyline([
      [0, HY0, 0],
      [0, HY1, 0],
    ]),
    (t) => rad(skullAt(HY0 + t * (HY1 - HY0))),
    {
      shift: (t) => shf(skullAt(HY0 + t * (HY1 - HY0))),
      bone: head,
      color: SKIN,
      sides: 14,
      caps: { start: "round", end: "flat" },
      up: [0, 0, 1],
      group: "head",
    },
  );
  // lower face and chin on the jaw bone
  const jawAt = spline([
    [0, 0.062, 0.026, 0],
    [0.5, 0.052, 0.028, 0],
    [0.8, 0.036, 0.028, 0],
    [1, 0.024, 0.026, 0],
  ]);
  b.sweep(
    catmull([
      [0, 1.668, -0.03],
      [0, 1.646, 0.02],
      [0, 1.628, 0.058],
    ]),
    (t) => rad(jawAt(t)),
    { bone: jaw, color: SKIN, sides: 10, up: [0, 1, 0], group: "head" },
  );
  // brow ridge, nose, cheeks, ears
  b.sweep(
    catmull([
      [-0.058, 1.755, 0.064],
      [-0.03, 1.759, 0.081],
      [0, 1.757, 0.085],
      [0.03, 1.759, 0.081],
      [0.058, 1.755, 0.064],
    ]),
    0.0095,
    { bone: head, color: SKIN, sides: 8, group: "head" },
  );
  const nose = b.sweep(
    catmull([
      [0, 1.744, 0.082],
      [0, 1.714, 0.094],
      [0, 1.686, 0.104],
    ]),
    (t) => [0.0092 + 0.006 * t, 0.0085 + 0.0055 * t],
    { bone: head, color: SKIN, sides: 8, up: [0, 0, 1], group: "head" },
  );
  const tip = b.part(ball(8, 6), SKIN, {
    bone: head,
    at: [0, 1.677, 0.1085],
    scale: [0.0145, 0.0135, 0.0145],
    group: "head",
  });
  for (const s of [1, -1]) {
    b.part(ball(8, 6), SKIN, {
      bone: head,
      at: [s * 0.0155, 1.676, 0.093],
      scale: [0.0125, 0.0112, 0.0112],
      group: "head",
    });
    b.part(ball(6, 4), FRAME, {
      bone: head,
      at: [s * 0.0085, 1.667, 0.1],
      scale: [0.004, 0.0026, 0.004],
      group: "head",
    });
    b.part(ball(8, 6), SKIN, {
      bone: head,
      at: [s * 0.058, 1.703, 0.04],
      dir: [0, -0.3, 1],
      axis: "z",
      scale: [0.013, 0.011, 0.026],
      group: "head",
    });
    // ear
    b.extrude(
      [
        [0.004, 0.03],
        [-0.01, 0.036],
        [-0.025, 0.026],
        [-0.032, 0.006],
        [-0.027, -0.016],
        [-0.016, -0.03],
        [-0.004, -0.032],
        [0.004, -0.022],
        [0.006, 0],
      ],
      {
        at: [s * 0.075, 1.723, -0.005],
        x: [-s * 0.3, 0, 1],
        thickness: 0.011,
        bevel: 0.003,
        smoothing: 1,
        color: SKIN,
        bone: head,
        group: "head",
      },
    );
    // eye: ball, iris, pupil, lids
    const eye = V(s * 0.0335, 1.735, 0.0665);
    b.part(ball(10, 8), EYE_WHITE, { bone: head, at: eye, scale: 0.0162, group: "head" });
    b.part(new THREE.CircleGeometry(0.0088, 10), IRIS, {
      bone: head,
      at: eye.clone().add(V(0, -0.0008, 0.0157)),
      dir: [0, 0, 1],
      axis: "z",
      group: "head",
    });
    b.part(new THREE.CircleGeometry(0.0047, 8), PUPIL, {
      bone: head,
      at: eye.clone().add(V(0, -0.0008, 0.0161)),
      dir: [0, 0, 1],
      axis: "z",
      group: "head",
    });
    b.part(new THREE.SphereGeometry(1, 10, 4, 0, Math.PI * 2, 0, 1.0), SKIN, {
      bone: head,
      at: eye,
      scale: 0.0172,
      rotation: [-25, 0, 0],
      group: "head",
    });
    b.part(new THREE.SphereGeometry(1, 10, 3, 0, Math.PI * 2, 0, 0.5), SKIN, {
      bone: head,
      at: eye,
      scale: 0.0168,
      rotation: [155, 0, 0],
      group: "head",
    });
    // eyebrow
    b.sweep(
      catmull([
        [s * 0.013, 1.768, 0.086],
        [s * 0.033, 1.772, 0.084],
        [s * 0.056, 1.769, 0.073],
      ]),
      [0.0072, 0.0052],
      { bone: head, color: BROW, sides: 5, group: "head" },
    );
  }
  // mouth: upper lip on the head, lower lip on the jaw, a dark seam between
  b.sweep(
    catmull([
      [-0.026, 1.652, 0.073],
      [-0.012, 1.656, 0.082],
      [0, 1.654, 0.084],
      [0.012, 1.656, 0.082],
      [0.026, 1.652, 0.073],
    ]),
    0.0042,
    { bone: head, color: LIP, sides: 6, group: "head" },
  );
  b.sweep(
    catmull([
      [-0.022, 1.641, 0.075],
      [0, 1.639, 0.083],
      [0.022, 1.641, 0.075],
    ]),
    0.0052,
    { bone: jaw, color: LIP, sides: 6, group: "head" },
  );
  b.sweep(
    catmull([
      [-0.028, 1.649, 0.07],
      [0, 1.6465, 0.081],
      [0.028, 1.649, 0.07],
    ]),
    0.0022,
    { bone: jaw, color: TRUNK_DARK, sides: 4, group: "head" },
  );

  // hair: a cap, sideburns and messy tufts
  const hair = b.part(new THREE.SphereGeometry(1, 16, 9, 0, Math.PI * 2, 0, 1.85), HAIR, {
    bone: head,
    at: [0, 1.748, -0.014],
    scale: [0.087, 0.09, 0.108],
    rotation: [-20, 0, 0],
    group: "head",
  });
  const hairSkin = b.surface(hair);
  const dice = rng(11);
  for (let i = 0; i < 14; i++) {
    const x = (dice() - 0.5) * 0.11;
    const z = -0.05 + dice() * 0.12;
    const tuft = hairSkin.ray([x, 2, z], [0, -1, 0]);
    if (tuft)
      b.stick(new THREE.ConeGeometry(0.008 + dice() * 0.004, 0.022 + dice() * 0.014, 5), HAIR, tuft, {
        embed: 0.3,
        flow: [0, 0.2, -1],
        spin: dice() * 360,
        group: "head",
      });
  }
  for (const s of [1, -1])
    b.part(ball(6, 4), HAIR, {
      bone: head,
      at: [s * 0.0765, 1.74, 0.014],
      scale: [0.006, 0.018, 0.011],
      group: "head",
    });

  // ---- sunglasses pushed up on his head ------------------------------------------------------------------------
  const gN = V(0, 0.77, 0.64).normalize();
  const gY = V(0, 0.64, -0.77).normalize();
  const gC = V(0, 1.819, 0.058).addScaledVector(gN, 0.004);
  for (const s of [1, -1]) {
    const c = gC.clone().add(V(s * 0.031, 0, 0));
    const rim: [number, number][] = [
      [-0.03, -0.021],
      [0.03, -0.021],
      [0.03, 0.021],
      [-0.03, 0.021],
    ];
    const lens: [number, number][] = [
      [-0.026, -0.017],
      [0.026, -0.017],
      [0.026, 0.017],
      [-0.026, 0.017],
    ];
    b.extrude(rim, {
      at: c,
      x: [1, 0, 0],
      y: gY,
      thickness: 0.006,
      bevel: 0.0015,
      smoothing: 2,
      color: FRAME,
      bone: head,
      group: "glasses",
    });
    b.extrude(lens, {
      at: c.clone().addScaledVector(gN, 0.0012),
      x: [1, 0, 0],
      y: gY,
      thickness: 0.006,
      bevel: 0.001,
      smoothing: 2,
      color: LENS,
      bone: head,
      group: "glasses",
    });
    b.sweep(
      catmull([
        [s * 0.061, 1.819, 0.054],
        [s * 0.075, 1.797, 0.024],
        [s * 0.083, 1.765, -0.018],
        [s * 0.08, 1.75, -0.04],
      ]),
      0.0028,
      { bone: head, color: FRAME, sides: 5, group: "glasses" },
    );
  }
  b.rod(gC.clone().add(V(-0.008, 0.002, 0)), gC.clone().add(V(0.008, 0.002, 0)), 0.0028, {
    bone: head,
    color: FRAME,
    sides: 5,
    group: "glasses",
  });

  // ---- zinc stripe down the nose, draped on the nose surface -----------------------------------------------------
  const noseSkin = b.surface([nose, tip]);
  b.sweep(
    noseSkin.drape(
      catmull([
        [0, 1.747, 0.09],
        [0, 1.722, 0.1],
        [0, 1.7, 0.109],
        [0, 1.689, 0.116],
      ]),
      { lift: 0.0012 },
    ),
    (t) => [0.0052 * (1 - 0.15 * t), 0.0026],
    { bone: head, color: ZINC, sides: 6, caps: "round", up: [0, 0, 1], group: "head" },
  );
  void skull;

  // ---- swim trunks -----------------------------------------------------------------------------------------
  const TR0 = 0.865;
  const TR1 = 1.075;
  const trunkAt = (t: number) => torsoAt(TR0 + t * (TR1 - TR0));
  const trunk = b.sweep(
    catmull([
      [0, TR0, 0],
      [0, 0.95, 0],
      [0, TR1, 0],
    ]),
    (t) => {
      const [rx, ry] = trunkAt(t);
      return [rx + 0.011, ry + 0.011];
    },
    {
      shift: (t) => shf(trunkAt(t)),
      bone: [hips, spine, neck],
      bands: [
        [0.83, TRUNK],
        [1, TRIM],
      ],
      sectors: [
        [81, 99, TRIM, 0.18, 0.83],
        [-99, -81, TRIM, 0.18, 0.83],
      ],
      sides: 16,
      up: [0, 0, 1],
      group: "trunks",
    },
  );
  for (const s of [1, -1])
    b.part(ball(10, 8), TRUNK, {
      bone: hips,
      at: [s * 0.07, 0.91, -0.052],
      scale: [0.094, 0.098, 0.087],
      group: "trunks",
    });
  // drawstring bow and cords, draped on the waistband
  const trunkSkin = b.surface(trunk);
  const knot = trunkSkin.ray([0, 1.058, 0.6], [0, 0, -1]);
  if (knot) b.stick(lump(0.011, 0.007, 0.008, 6, 4), TRIM, knot, { embed: 0.3, flow: [0, -1, 0], group: "trunks" });
  for (const s of [1, -1])
    b.sweep(
      trunkSkin.drape(
        catmull([
          [s * 0.006, 1.056, 0.12],
          [s * 0.02, 1.02, 0.126],
          [s * 0.03, 0.98, 0.128],
        ]),
        { lift: 0.002 },
      ),
      0.0032,
      { color: TRIM, sides: 4, group: "trunks" },
    );

  // ---- whistle on a cord ------------------------------------------------------------------------------------
  const chest = b.surface([torso, neckTube, ...pecs.filter((p) => p !== null)]);
  b.sweep(
    chest.drape(
      catmull(
        [
          [0, 1.552, -0.062],
          [0.062, 1.545, -0.03],
          [0.078, 1.508, 0.04],
          [0.066, 1.44, 0.125],
          [0, 1.37, 0.16],
          [-0.066, 1.44, 0.125],
          [-0.078, 1.508, 0.04],
          [-0.062, 1.545, -0.03],
        ],
        { closed: true },
      ),
      { lift: 0.004 },
    ),
    0.0032,
    { color: TRIM, sides: 4, group: "whistle" },
  );
  const wh = chest.ray([0, 1.35, 0.6], [0, 0, -1]);
  if (wh) {
    b.stick(new THREE.CylinderGeometry(0.0125, 0.0125, 0.052, 8).rotateX(Math.PI / 2), WHISTLE, wh, {
      embed: 0.1,
      flow: [0, -1, 0],
      group: "whistle",
    });
    b.stick(new THREE.BoxGeometry(0.011, 0.011, 0.024).translate(0, 0, -0.036), FRAME, wh, {
      embed: 0.1,
      flow: [0, -1, 0],
      group: "whistle",
    });
  }

  return b.root;
}
