// Lifeguard (Sculpt): a beach lifeguard, an athletic man about 1.85 m tall, blocked out with sweeps and lofts and
// then sculpted with brushes (src/experimental/sculpt.ts).
import { CylinderGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { sculpt } from "../src/experimental/sculpt";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Station } from "../src/sugar";
import { interpolate } from "../src/sweep";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Lifeguard (Sculpt)",
  description:
    "Beach lifeguard: an athletic man with red swim trunks, whistle, sunglasses and zinc, sculpted from a blockout.",
};

type V3 = [number, number, number];

const SKIN = "#d9a07c";
const NAIL = "#e8c3aa";
const EYE = "#f2efe6";
const IRIS = "#4f86a6";
const PUPIL = "#101318";
const LIP = "#b76a62";
const BROW = "#6b4a28";
const HAIR = "#a67c45";
const TRUNKS = "#c8202a";
const TRIM = "#f4f2ea";
const CORD = "#1b2a48";
const WHISTLE = "#f0c320";
const FRAME = "#17181b";
const LENS = "#27495e";
const ZINC = "#f6f5ef";

/** A radius function from keys `[t, rx, ry]`, smooth between them. */
const keyed = (keys: ReadonlyArray<readonly [number, number, number]>) => {
  const ts = keys.map((k) => k[0]);
  const rx = keys.map((k) => k[1]);
  const ry = keys.map((k) => k[2]);
  return (t: number): [number, number] => [interpolate(ts, rx, t), interpolate(ts, ry, t)];
};

const mirror = (s: number, p: readonly [number, number, number]): V3 => [s * p[0], p[1], p[2]];

export default function build() {
  const b = createBuilder({ name: "lifeguard" });

  // ---- Skeleton -------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.96, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.99, 0],
      [0, 1.13, 0.008],
      [0, 1.29, 0.004],
      [0, 1.5, -0.012],
    ]),
    { parent: hips, names: ["spine", "spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.515, -0.012], aim: [0, 1.665, 0.01], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.665, 0.01], dir: [0, 1, 0.04], role: "head" });

  // Hand frame for the left side (mirrored for the right): fingers along a, palm normal n, thumb side t.
  const elbowP: V3 = [0.413, 1.272, 0.012];
  const wristP: V3 = [0.603, 1.082, 0.045];
  const a = new Vector3(...wristP).sub(new Vector3(...elbowP)).normalize();
  const flat = new Vector3(a.y, -a.x, 0).normalize();
  const n = flat
    .clone()
    .multiplyScalar(Math.cos(0.6))
    .addScaledVector(new Vector3(0, 0, 1), Math.sin(0.6));
  n.addScaledVector(a, -n.dot(a)).normalize();
  const t = new Vector3().crossVectors(n, a).normalize();
  const knuckle = new Vector3(...wristP).addScaledVector(a, 0.097);

  const sides = [1, -1] as const;
  const armTubes: Sweep[] = [];
  const legTubes: Sweep[] = [];
  const palms: Sweep[] = [];
  const footTubes: Sweep[] = [];
  const toeTubes: Sweep[] = [];
  const fingerTubes: Sweep[] = [];
  const P = (v: Vector3, s: number) => mirror(s, v.toArray() as V3);
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const clavicle = b.joint(`shoulder${S}`, {
      parent: chest,
      at: mirror(s, [0.03, 1.505, 0.035]),
      aim: mirror(s, [0.175, 1.51, 0.0]),
    });
    const arm = b.chain(`arm${S}`, catmull([mirror(s, [0.18, 1.505, 0]), mirror(s, elbowP), mirror(s, wristP)]), {
      parent: clavicle,
      names: [`upperArm${S}`, `lowerArm${S}`],
      up: P(n, s),
      role: "arm",
    });
    armTubes.push(
      b.sweep(
        arm,
        keyed([
          [0, 0.055, 0.055],
          [0.14, 0.054, 0.054],
          [0.35, 0.047, 0.048],
          [0.53, 0.039, 0.04],
          [0.63, 0.04, 0.042],
          [0.82, 0.03, 0.031],
          [0.94, 0.027, 0.022],
          [1, 0.026, 0.021],
        ]),
        { color: SKIN, sides: 12, name: `arm${S}` },
      ),
    );
    const hand = b.joint(`hand${S}`, { parent: arm.joints[1], at: mirror(s, wristP), aim: P(knuckle, s), up: P(n, s) });
    // The palm is a flat loft on the hand bone; the fingers hang from it on their own joints.
    palms.push(
      b.loft(
        [
          { at: P(new Vector3(...wristP).addScaledVector(a, -0.02), s), w: 0.058, h: 0.032 },
          { at: P(new Vector3(...wristP).addScaledVector(a, 0.04), s), w: 0.076, h: 0.029 },
          { at: P(knuckle.clone().addScaledVector(a, -0.026), s), w: 0.088, h: 0.024 },
        ],
        { bone: hand, up: P(n, s), color: SKIN, sides: 12, name: `palm${S}` },
      ),
    );
    const spread = [0.13, 0.02, -0.1, -0.24];
    const across = [0.03, 0.011, -0.009, -0.027];
    const lens = [
      [0.043, 0.026, 0.021],
      [0.047, 0.03, 0.022],
      [0.043, 0.028, 0.021],
      [0.033, 0.02, 0.019],
    ];
    const nail = (bone: Joint, p: Vector3, dir: Vector3, r: number) =>
      b.part(new SphereGeometry(1, 6, 4), NAIL, {
        bone,
        at: P(p.clone().addScaledVector(n, -r * 0.8), s),
        dir: P(dir, s),
        up: P(n.clone().negate(), s),
        scale: [r * 0.62, r * 1.05, r * 0.25],
        name: `nail${S}`,
      });
    ["index", "middle", "ring", "pinky"].forEach((name, f) => {
      const dir = a.clone().multiplyScalar(Math.cos(spread[f])).addScaledVector(t, Math.sin(spread[f]));
      let p = knuckle.clone().addScaledVector(t, across[f]).addScaledVector(a, -0.004);
      const pts: Vector3[] = [p.clone()];
      const dirs: Vector3[] = [];
      lens[f].forEach((len, k) => {
        const curl = 0.06 * (k + 1);
        dir.multiplyScalar(Math.cos(curl)).addScaledVector(n, Math.sin(curl)).normalize();
        dirs.push(dir.clone());
        p = p.clone().addScaledVector(dir, len);
        pts.push(p.clone());
      });
      const chain = b.chain(`${name}${S}`, catmull(pts.map((q) => P(q, s))), {
        parent: hand,
        names: [1, 2, 3].map((k) => `${name}${k}${S}`),
        role: "digit",
      });
      const r0 = 0.0094 - f * 0.0004;
      fingerTubes.push(b.sweep(chain, [r0, r0 * 0.68], { color: SKIN, sides: 6, name: `${name}${S}` }));
      nail(chain.joints[2], pts[2].clone().lerp(pts[3], 0.55), dirs[2], r0 * 0.8);
    });
    {
      const dir = a.clone().multiplyScalar(0.72).addScaledVector(t, 0.55).addScaledVector(n, 0.2).normalize();
      let p = knuckle.clone().addScaledVector(a, -0.078).addScaledVector(t, 0.022).addScaledVector(n, 0.004);
      const pts: Vector3[] = [p.clone()];
      const dirs: Vector3[] = [];
      [0.05, 0.037, 0.03].forEach((len, k) => {
        dir
          .addScaledVector(a, 0.06 * k)
          .addScaledVector(n, 0.05 * k)
          .normalize();
        dirs.push(dir.clone());
        p = p.clone().addScaledVector(dir, len);
        pts.push(p.clone());
      });
      const chain = b.chain(`thumb${S}`, catmull(pts.map((q) => P(q, s))), {
        parent: hand,
        names: [1, 2, 3].map((k) => `thumb${k}${S}`),
        role: "digit",
      });
      fingerTubes.push(b.sweep(chain, [0.0125, 0.0085], { color: SKIN, sides: 6, name: `thumb${S}` }));
      nail(chain.joints[2], pts[2].clone().lerp(pts[3], 0.55), dirs[2], 0.0105);
    }
  }

  const HEM = 0.372;
  const legR = keyed([
    [0, 0.095, 0.1],
    [0.14, 0.096, 0.1],
    [0.3, 0.088, 0.092],
    [0.44, 0.062, 0.066],
    [0.505, 0.054, 0.058],
    [0.56, 0.054, 0.06],
    [0.66, 0.056, 0.064],
    [0.8, 0.04, 0.043],
    [0.92, 0.031, 0.033],
    [1, 0.03, 0.031],
  ]);
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([mirror(s, [0.09, 0.93, 0]), mirror(s, [0.098, 0.505, 0.012]), mirror(s, [0.104, 0.095, -0.02])]),
      {
        parent: hips,
        names: [`upLeg${S}`, `leg${S}`],
        role: "leg",
        contact: mirror(s, [0.104, 0, 0.02]),
      },
    );
    legTubes.push(
      b.sweep(leg, legR, {
        color: (u) => (u < HEM ? TRUNKS : SKIN),
        sectors: [[70, 110, TRIM, 0, HEM]],
        sides: 14,
        name: `leg${S}`,
      }),
    );
    const foot = b.joint(`foot${S}`, {
      parent: leg.joints[1],
      at: mirror(s, [0.104, 0.095, -0.02]),
      aim: mirror(s, [0.104, 0.04, 0.12]),
      role: "leg",
    });
    const toe = b.joint(`toe${S}`, {
      parent: foot,
      at: mirror(s, [0.104, 0.03, 0.125]),
      aim: mirror(s, [0.104, 0.028, 0.2]),
      role: "leg",
    });
    footTubes.push(
      b.sweep(
        catmull([
          mirror(s, [0.104, 0.075, -0.036]),
          mirror(s, [0.104, 0.05, 0.0]),
          mirror(s, [0.104, 0.038, 0.06]),
          mirror(s, [0.104, 0.028, 0.112]),
        ]),
        keyed([
          [0, 0.033, 0.036],
          [0.25, 0.037, 0.038],
          [0.65, 0.044, 0.032],
          [1, 0.047, 0.027],
        ]),
        { color: SKIN, sides: 12, bone: foot, name: `foot${S}` },
      ),
    );
    const toes = [
      [0.075, 0.207, 0.0135],
      [0.093, 0.202, 0.0098],
      [0.107, 0.196, 0.009],
      [0.12, 0.186, 0.0082],
      [0.131, 0.173, 0.0076],
    ];
    for (const [x, z, r] of toes) {
      toeTubes.push(
        b.sweep(
          catmull([mirror(s, [x, 0.03, 0.12]), mirror(s, [x, 0.027, z - 0.012]), mirror(s, [x, 0.023, z])]),
          [r, r * 0.78],
          { color: SKIN, sides: 6, bone: toe, name: `toes${S}` },
        ),
      );
      b.part(new SphereGeometry(1, 6, 4), NAIL, {
        bone: toe,
        at: mirror(s, [x, 0.023 + r * 0.72, z - 0.007]),
        dir: mirror(s, [0, -0.1, 1]),
        up: [0, 1, 0],
        scale: [r * 0.66, r * 0.95, r * 0.25],
        name: `toenail${S}`,
      });
    }
  }

  // ---- Torso ----------------------------------------------------------------------------------------------------
  const torsoStations: Station[] = [
    { at: [0, 0.83, -0.01], w: 0.28, h: 0.2 },
    { at: [0, 0.93, -0.008], w: 0.375, h: 0.23 },
    { at: [0, 1.03, -0.004], w: 0.33, h: 0.215 },
    { at: [0, 1.13, 0.0], w: 0.3, h: 0.2 },
    { at: [0, 1.26, 0.004], w: 0.34, h: 0.225 },
    { at: [0, 1.38, 0.008], w: 0.37, h: 0.245 },
    { at: [0, 1.47, 0.0], w: 0.385, h: 0.235 },
    { at: [0, 1.51, -0.006], w: 0.32, h: 0.2 },
    { at: [0, 1.545, -0.012], w: 0.17, h: 0.125 },
  ];
  const WAIST = catmull(torsoStations.map((st) => st.at)).closestT([0, 1.09, 0]);
  const torso = b.loft(torsoStations, {
    bone: [hips, spine],
    color: (u) => (u < WAIST ? TRUNKS : SKIN),
    sides: 20,
    name: "torso",
  });

  const neckTube = b.sweep(
    catmull([
      [0, 1.5, -0.012],
      [0, 1.58, -0.018],
      [0, 1.665, -0.02],
    ]),
    [0.058, 0.048],
    { bone: [neck, head, chest], color: SKIN, sides: 12, name: "neck" },
  );

  // ---- Head -----------------------------------------------------------------------------------------------------
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.688, -0.03], aim: [0, 1.628, 0.07], role: "jaw" });
  const skull = b.part(new SphereGeometry(1, 30, 20), SKIN, {
    bone: head,
    at: [0, 1.742, -0.008],
    scale: [0.078, 0.106, 0.098],
    name: "skull",
  });
  const chin = b.part(new SphereGeometry(1, 26, 16), SKIN, {
    bone: jaw,
    at: [0, 1.657, 0.006],
    scale: [0.054, 0.038, 0.064],
    name: "jaw",
  });

  // ---- Sculpt: torso ----------------------------------------------------------------------------------------------
  const sc = sculpt(b);
  const trunk = b.surface(torso);
  /** A point on the torso's front (or back) surface at (x, y). */
  const front = (x: number, y: number, lift = 0): V3 => {
    const h = trunk.ray([x, y, 1], [0, 0, -1])!;
    return [x, y, h.at.z + lift];
  };
  const back = (x: number, y: number, lift = 0): V3 => {
    const h = trunk.ray([x, y, -1], [0, 0, 1])!;
    return [x, y, h.at.z - lift];
  };
  const side = (y: number, z: number): V3 => {
    const h = trunk.ray([1, y, z], [-1, 0, 0])!;
    return [h.at.x, y, z];
  };
  // Chest: pectorals, their lower borders, the sternum, collarbones, trapezius.
  sc.inflate(torso, {
    path: [front(0.03, 1.4), front(0.09, 1.415), front(0.15, 1.43)],
    radius: [0.05, 0.062, 0.045],
    amount: [0.012, 0.024, 0.012],
  });
  sc.crease(torso, {
    path: [front(0.02, 1.335), front(0.075, 1.325), front(0.13, 1.35), front(0.165, 1.385)],
    radius: 0.014,
    depth: [0.004, 0.008, 0.006, 0.004],
  });
  sc.crease(torso, { path: [front(0, 1.47), front(0, 1.31)], radius: 0.011, depth: 0.005 });
  sc.inflate(torso, {
    path: [front(0.02, 1.505, -0.01), front(0.09, 1.495, -0.02), front(0.16, 1.48, -0.03)],
    radius: 0.014,
    amount: 0.006,
  });
  sc.push(torso, {
    path: [back(0.04, 1.51), back(0.1, 1.5), back(0.155, 1.485)],
    dir: [0, 1, 0],
    radius: [0.03, 0.05, 0.04],
    amount: [0.018, 0.026, 0.006],
  });
  // Abdomen: rectus blocks with their tendinous lines, navel, obliques, the iliac furrow.
  sc.inflate(torso, { path: [front(0.033, 1.31), front(0.033, 1.13)], radius: 0.036, amount: 0.008 });
  sc.crease(torso, { path: [front(0, 1.34), front(0, 1.09)], radius: 0.011, depth: 0.008 });
  for (const y of [1.28, 1.225, 1.17])
    sc.crease(torso, { path: [front(0.004, y), front(0.062, y - 0.004)], radius: 0.011, depth: 0.009 });
  sc.inflate(torso, {
    path: [side(1.31, 0.05), side(1.18, 0.03), side(1.08, 0.02)],
    radius: 0.05,
    amount: [0.008, 0.012, 0.006],
  });
  sc.crease(torso, {
    path: [front(0.105, 1.07), front(0.06, 0.985), front(0.025, 0.93)],
    radius: 0.016,
    depth: [0.004, 0.007, 0.004],
  });
  // Back: spine, erectors, shoulder blades, lats.
  sc.crease(torso, { path: [back(0, 1.52), back(0, 1.0)], radius: 0.012, depth: 0.005 });
  sc.inflate(torso, { path: [back(0.038, 1.36), back(0.038, 1.06)], radius: 0.03, amount: 0.008 });
  sc.inflate(torso, { path: [back(0.09, 1.44), back(0.11, 1.36)], radius: 0.05, amount: 0.014 });
  sc.inflate(torso, {
    path: [back(0.13, 1.4), back(0.115, 1.2)],
    radius: [0.05, 0.06, 0.04],
    amount: [0.012, 0.018, 0.006],
  });
  // Pelvis: glutes, the gluteal fold and the hips.
  sc.inflate(torso, { path: [back(0.055, 0.98), back(0.075, 0.91)], radius: 0.075, amount: 0.026 });
  sc.crease(torso, { path: [back(0.01, 0.845), back(0.1, 0.85)], radius: 0.014, depth: 0.007 });
  sc.inflate(torso, { at: side(0.94, 0), radius: 0.06, amount: 0.008 });

  // ---- Sculpt: legs and arms ------------------------------------------------------------------------------------
  /** The point on a tube at t whose surface faces `dir` best (left-side tubes; the brushes mirror). */
  const on = (tube: Sweep, t: number, dir: V3, lift = 0): V3 => {
    let best = tube.at(t, 0);
    let score = -2;
    for (let deg = 0; deg < 360; deg += 10) {
      const p = tube.at(t, deg);
      const d = p.n.dot(new Vector3(...dir).normalize());
      if (d > score) [best, score] = [p, d];
    }
    return best.moved([0, lift, 0]).at.toArray() as V3;
  };
  const [legL, armL] = [legTubes[0], armTubes[0]];
  const legs = legTubes;
  const thighs = legTubes;
  const arms = armTubes;
  const FRONT: V3 = [0, 0, 1];
  const BACK: V3 = [0, 0, -1];
  const OUT: V3 = [1, 0, 0];
  const IN: V3 = [-1, 0, 0];
  const legAt = (t: number, dir: V3) => on(legL, t, dir);
  // Thigh: quadriceps (rectus, vastus lateralis and medialis) with their grooves, adductors, hamstrings.
  sc.inflate(thighs, {
    path: [legAt(0.1, FRONT), legAt(0.22, FRONT), legAt(0.38, FRONT)],
    radius: [0.05, 0.055, 0.04],
    amount: [0.008, 0.02, 0.01],
  });
  sc.inflate(thighs, {
    path: [legAt(0.1, [1, 0, 0.8]), legAt(0.25, [1, 0, 0.8]), legAt(0.4, [1, 0, 0.6])],
    radius: [0.04, 0.05, 0.04],
    amount: [0.008, 0.018, 0.01],
  });
  sc.inflate(thighs, {
    path: [legAt(0.3, [-1, 0, 0.7]), legAt(0.42, [-1, 0, 0.7])],
    radius: 0.036,
    amount: [0.012, 0.018],
  });
  sc.inflate(thighs, {
    path: [legAt(0.1, BACK), legAt(0.26, BACK), legAt(0.42, BACK)],
    radius: [0.05, 0.055, 0.04],
    amount: [0.01, 0.016, 0.008],
  });
  sc.inflate(thighs, { path: [legAt(0.16, IN), legAt(0.36, IN)], radius: 0.04, amount: 0.01 });
  // Knee and calf.
  sc.inflate(legs, { at: legAt(0.5, FRONT), radius: 0.034, amount: 0.008 });
  sc.crease(legs, {
    path: [legAt(0.5, [1, 0, -1]), legAt(0.5, BACK), legAt(0.5, [-1, 0, -1])],
    radius: 0.014,
    depth: 0.007,
  });
  sc.inflate(legs, {
    path: [legAt(0.55, [-0.7, 0, -1]), legAt(0.63, [-0.7, 0, -1]), legAt(0.72, [-0.5, 0, -1])],
    radius: [0.03, 0.04, 0.025],
    amount: [0.006, 0.022, 0.006],
  });
  sc.inflate(legs, {
    path: [legAt(0.55, [0.7, 0, -1]), legAt(0.62, [0.7, 0, -1]), legAt(0.7, [0.5, 0, -1])],
    radius: [0.028, 0.036, 0.022],
    amount: [0.004, 0.017, 0.004],
  });
  sc.crease(legs, { path: [legAt(0.56, BACK), legAt(0.7, BACK)], radius: 0.01, depth: 0.005 });
  sc.inflate(legs, { path: [legAt(0.72, BACK), legAt(0.85, BACK)], radius: 0.02, amount: 0.004 });
  // Shin, ankle bones.
  sc.inflate(legs, { path: [legAt(0.56, FRONT), legAt(0.85, FRONT)], radius: 0.012, amount: 0.005 });
  sc.inflate(legs, { path: [legAt(0.58, [1, 0, 0.6]), legAt(0.74, [1, 0, 0.6])], radius: 0.026, amount: 0.008 });
  sc.inflate(legs, { at: legAt(0.93, IN), radius: 0.02, amount: 0.008 });
  sc.inflate(legs, { at: legAt(0.95, OUT), radius: 0.02, amount: 0.006 });
  // Arms: deltoid, biceps, triceps, elbow, forearm, hand.
  const armAt = (t: number, dir: V3) => on(armL, t, dir);
  sc.inflate(arms, {
    path: [armAt(0.035, [1, 1, 0]), armAt(0.175, [1, 1, 0]), armAt(0.338, [1, 0.6, 0])],
    radius: [0.05, 0.06, 0.04],
    amount: [0.012, 0.024, 0.008],
  });
  sc.inflate(arms, { path: [armAt(0.035, FRONT), armAt(0.233, FRONT)], radius: 0.04, amount: [0.014, 0.008] });
  sc.inflate(arms, { path: [armAt(0.035, BACK), armAt(0.233, BACK)], radius: 0.04, amount: [0.014, 0.008] });
  sc.inflate(arms, {
    path: [armAt(0.187, [0, 0.4, 1]), armAt(0.35, [0, 0.4, 1]), armAt(0.49, [0, 0.4, 1])],
    radius: [0.028, 0.038, 0.026],
    amount: [0.006, 0.017, 0.006],
  });
  sc.inflate(arms, {
    path: [armAt(0.14, [0, 0.4, -1]), armAt(0.327, [0, 0.4, -1]), armAt(0.49, [0, 0.4, -1])],
    radius: [0.03, 0.04, 0.03],
    amount: [0.008, 0.02, 0.008],
  });
  sc.crease(arms, {
    path: [armAt(0.163, [0.4, 0, 1]), armAt(0.338, [0.4, 0, 1]), armAt(0.49, [0.4, 0, 1])],
    radius: 0.009,
    depth: 0.005,
  });
  sc.inflate(arms, { at: armAt(0.548, BACK), radius: 0.022, amount: 0.008 });
  sc.inflate(arms, {
    path: [armAt(0.584, [0.7, 0.7, 0.2]), armAt(0.677, [0.7, 0.7, 0.2]), armAt(0.84, [0.7, 0.7, 0.2])],
    radius: [0.03, 0.036, 0.024],
    amount: [0.012, 0.014, 0.004],
  });
  sc.inflate(arms, {
    path: [armAt(0.584, [-0.7, -0.6, 0]), armAt(0.724, [-0.7, -0.6, 0]), armAt(0.887, [-0.7, -0.6, 0])],
    radius: [0.03, 0.034, 0.02],
    amount: [0.008, 0.012, 0.004],
  });
  sc.inflate(arms, { at: armAt(0.969, BACK), radius: 0.016, amount: 0.004 });
  // ---- Sculpt: hands and feet -----------------------------------------------------------------------------------
  const palmL = palms[0];
  const nd = n.toArray() as V3;
  const td = t.toArray() as V3;
  const palmDir = (k: number, along = 1): V3 => [
    nd[0] * along + td[0] * k,
    nd[1] * along + td[1] * k,
    nd[2] * along + td[2] * k,
  ];
  const palmAt = (u: number, k: number, along = 1) => on(palmL, u, palmDir(k, along));
  sc.inflate(palms, {
    path: [palmAt(0.12, 0.9), palmAt(0.4, 1.1), palmAt(0.55, 0.9)],
    radius: [0.02, 0.026, 0.02],
    amount: [0.006, 0.011, 0.005],
  });
  sc.inflate(palms, { path: [palmAt(0.15, -0.9), palmAt(0.5, -1.2)], radius: 0.02, amount: 0.006 });
  sc.inflate(palms, { at: palmAt(0.62, 0), radius: 0.022, amount: -0.004 });
  for (const k of [1.4, 0.45, -0.4, -1.3]) sc.inflate(palms, { at: palmAt(0.93, k, -1), radius: 0.011, amount: 0.004 });
  const footL = footTubes[0];
  const footAt = (u: number, dir: V3) => on(footL, u, dir);
  sc.inflate(footTubes, {
    path: [footAt(0.06, [0, 1, 0.2]), footAt(0.3, [0, 1, 0.3]), footAt(0.55, [0, 1, 0.5])],
    radius: [0.03, 0.034, 0.028],
    amount: [0.006, 0.012, 0.004],
  });
  sc.push(footTubes, { at: footAt(0, [0, -0.2, -1]), dir: [0, -0.15, -1], radius: 0.034, amount: 0.012 });
  sc.inflate(footTubes, { at: footAt(0.42, [-0.6, -1, 0]), radius: 0.032, amount: -0.009 });
  sc.inflate(footTubes, { at: footAt(0.86, [-0.7, -0.4, 0.5]), radius: 0.03, amount: 0.006 });
  sc.flatten(footTubes, {
    path: [
      [0.104, 0, -0.065],
      [0.104, 0, 0.11],
    ],
    dir: [0, -1, 0],
    radius: 0.034,
    core: 0.5,
    side: "back",
  });

  // ---- Sculpt: neck and face ------------------------------------------------------------------------------------
  const cranium = [skull.mesh, chin.mesh];
  const headSurface = b.surface(cranium);
  /** A point on the face at (x, y): the front-most surface there. */
  const face = (x: number, y: number, lift = 0): V3 => [x, y, headSurface.ray([x, y, 1], [0, 0, -1])!.at.z + lift];
  const neckAt = (u: number, dir: V3) => on(neckTube, u, dir);
  sc.inflate(neckTube, {
    path: [neckAt(0.85, [0.8, 0, -0.5]), neckAt(0.5, [0.8, 0, 0.3]), neckAt(0.12, [0.6, 0, 0.8])],
    radius: [0.02, 0.024, 0.02],
    amount: [0.004, 0.012, 0.008],
  });
  sc.inflate(neckTube, { at: neckAt(0.45, FRONT), radius: 0.014, amount: 0.006 });
  // Brow ridge, eye sockets, nose, cheeks, lips, chin.
  sc.inflate(cranium, {
    path: [face(0.004, 1.763), face(0.04, 1.766), face(0.065, 1.758)],
    radius: 0.014,
    amount: [0.006, 0.009, 0.005],
  });
  sc.inflate(cranium, { at: face(0.031, 1.744), radius: 0.022, amount: -0.007 });
  sc.push(cranium, {
    path: [face(0, 1.75), face(0, 1.725), face(0, 1.703)],
    dir: [0, 0.15, 1],
    radius: [0.012, 0.017, 0.021],
    amount: [0.006, 0.026, 0.042],
  });
  sc.inflate(cranium, { at: face(0.02, 1.701, 0.02), radius: 0.013, amount: 0.011 });
  sc.inflate(cranium, { at: face(0, 1.696, 0.032), radius: 0.011, amount: 0.004 });
  sc.inflate(cranium, { at: face(0.052, 1.717), radius: 0.028, amount: 0.008 });
  sc.inflate(cranium, { at: face(0.048, 1.683), radius: 0.026, amount: -0.006 });
  sc.push(cranium, { at: face(0, 1.632), dir: [0, 0.3, 1], radius: 0.028, amount: 0.012 });
  sc.crease(cranium, { path: [face(-0.03, 1.6635), face(0, 1.6625), face(0.03, 1.6635)], radius: 0.005, depth: 0.003 });
  sc.inflate(cranium, { at: face(0, 1.75), radius: 0.03, amount: 0.003 });
  sc.smooth(cranium, { at: [0, 1.79, 0], radius: 0.06, strength: 0.5 });

  // Eyes: eyeball, iris, pupil and two lids, seated in the sockets.
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const ez = face(0.031, 1.744)[2] - 0.0035;
    const eye = mirror(s, [0.031, 1.744, ez]);
    const seat = (geometry: SphereGeometry, color: string, dir: V3, name: string) =>
      b.part(geometry, color, { bone: head, at: eye, dir: [s * dir[0], dir[1], dir[2]], name: `${name}${S}` });
    b.part(new SphereGeometry(0.0132, 12, 8), EYE, { bone: head, at: eye, name: `eyeball${S}` });
    seat(new SphereGeometry(0.0135, 10, 4, 0, Math.PI * 2, 0, 0.78), IRIS, [s * 0.12, 0, 1], "iris");
    seat(new SphereGeometry(0.01358, 8, 3, 0, Math.PI * 2, 0, 0.34), PUPIL, [s * 0.12, 0, 1], "pupil");
    seat(new SphereGeometry(0.0141, 10, 4, 0, Math.PI * 2, 0, 0.62), SKIN, [0, 0.87, 0.5], "lidUp");
    seat(new SphereGeometry(0.014, 10, 3, 0, Math.PI * 2, 0, 0.45), SKIN, [0, -0.88, 0.47], "lidLow");
  }
  // Lips, brows, the zinc stripe and ears follow the sculpted face.
  const draped = (pts: V3[], lift = 0.001) => headSurface.drape(catmull(pts), { lift });
  b.sweep(
    draped([face(-0.027, 1.6655), face(-0.013, 1.6695), face(0, 1.6685), face(0.013, 1.6695), face(0.027, 1.6655)]),
    0.0028,
    {
      color: LIP,
      sides: 6,
      name: "upperLip",
    },
  );
  b.sweep(
    draped([face(-0.025, 1.6645), face(-0.012, 1.6592), face(0, 1.6575), face(0.012, 1.6592), face(0.025, 1.6645)]),
    0.0034,
    {
      color: LIP,
      sides: 6,
      name: "lowerLip",
    },
  );
  for (const s of sides)
    b.sweep(
      draped([face(s * 0.012, 1.7685), face(s * 0.038, 1.774), face(s * 0.066, 1.7655)]),
      (u) => 0.0044 * (1 - 0.45 * u) + 0.0006,
      {
        color: BROW,
        sides: 6,
        name: "brow",
      },
    );
  b.sweep(
    draped([face(0, 1.751), face(0, 1.728), face(0, 1.71), face(0, 1.703)], 0.0012),
    (u) => [0.0046 * (1 - 0.2 * u), 0.0014],
    {
      color: ZINC,
      sides: 8,
      name: "zinc",
    },
  );
  const earShape: Array<[number, number]> = [
    [0, -0.02],
    [0.008, -0.03],
    [0.017, -0.022],
    [0.024, -0.006],
    [0.029, 0.012],
    [0.025, 0.028],
    [0.015, 0.035],
    [0.005, 0.03],
    [0, 0.018],
    [-0.003, 0],
  ];
  for (const s of sides)
    b.extrude(s > 0 ? earShape : earShape.map(([u, v]) => [-u, v] as [number, number]).reverse(), {
      at: [s * 0.0765, 1.722, -0.006],
      x: [0, 0, -s],
      y: [s * 0.2, 1, 0],
      thickness: 0.008,
      bevel: 0.0025,
      smoothing: 1,
      color: SKIN,
      bone: head,
      name: "ear",
    });

  // Hair: a short cap on a tilted axis, so the hairline is high at the front and low at the back.
  const skullCentre = new Vector3(0, 1.742, -0.008);
  const tilt = new Vector3(0, 0.894, -0.447);
  const hair = b.loft(
    [0.0114, 0.035, 0.06, 0.08, 0.095, 0.105, 0.11].map((d) => {
      const k = Math.sqrt(1 - (d / 0.111) ** 2);
      return { at: skullCentre.clone().addScaledVector(tilt, d).toArray() as V3, w: 2 * 0.085 * k, h: 2 * 0.1066 * k };
    }),
    { bone: head, color: HAIR, sides: 22, caps: { start: "flat", end: "flat" }, name: "hair" },
  );
  // Hair styling: a swept-back quiff and a few strands.
  const hairSurface = b.surface(hair);
  /** The hair surface in the direction (azimuth 0 = forward, 90 = left; elevation up) from the middle of the head. */
  const onHair = (azimuth: number, elevation: number) => {
    const a = (azimuth * Math.PI) / 180;
    const e = (elevation * Math.PI) / 180;
    const out = new Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e));
    return hairSurface.nearest(skullCentre.clone().addScaledVector(out, 0.2));
  };
  sc.push(hair, {
    path: [onHair(0, 40), onHair(0, 62)],
    dir: [0, 0.5, 1],
    radius: [0.034, 0.045],
    amount: [0.008, 0.014],
  });
  for (const az of [14, 32, 52])
    sc.crease(hair, { path: [onHair(az, 30), onHair(az, 56), onHair(az * 0.6, 80)], radius: 0.007, depth: 0.004 });

  // ---- Trunks trim, whistle and sunglasses ----------------------------------------------------------------------
  const waist = catmull(
    Array.from({ length: 12 }, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return [0.166 * Math.sin(a), 1.1, 0.114 * Math.cos(a) - 0.001] as V3;
    }),
    { closed: true },
  );
  const bodySurface = b.surface([torso, neckTube]);
  b.sweep(bodySurface.drape(waist, { lift: 0.004 }), 0.0065, { color: TRIM, sides: 6, name: "waistband" });
  const legSurface = b.surface(legTubes);
  for (const s of sides) {
    const hem = catmull(
      Array.from({ length: 14 }, (_, i) => legTubes[s > 0 ? 0 : 1].at(HEM, (i / 14) * 360).at),
      { closed: true },
    );
    b.sweep(legSurface.drape(hem, { lift: 0.003 }), 0.0055, { color: TRIM, sides: 6, name: "hem" });
  }
  const lanyard = catmull(
    [
      [0, 1.548, -0.058],
      [0.052, 1.538, -0.04],
      [0.062, 1.528, 0.03],
      [0.058, 1.47, 0.11],
      [0.026, 1.425, 0.135],
      [0, 1.405, 0.14],
      [-0.026, 1.425, 0.135],
      [-0.058, 1.47, 0.11],
      [-0.062, 1.528, 0.03],
      [-0.052, 1.538, -0.04],
    ] as V3[],
    { closed: true },
  );
  b.sweep(bodySurface.drape(lanyard, { lift: 0.003 }), 0.0028, { color: CORD, sides: 6, name: "lanyard" });
  const hang = bodySurface.nearest([0, 1.4, 0.16]);
  const whistleAt = hang.moved([0, 0.012, 0]);
  b.part(new CylinderGeometry(0.0125, 0.0125, 0.024, 14), WHISTLE, {
    bone: chest,
    at: whistleAt.local([0, 0.006, 0]),
    dir: [1, 0, 0],
    name: "whistleBarrel",
  });
  b.part(new CylinderGeometry(0.0062, 0.0062, 0.026, 8), WHISTLE, {
    bone: chest,
    at: whistleAt.local([0, 0.0, 0.017]),
    dir: [0, -0.2, 1],
    axis: "y",
    name: "whistleMouthpiece",
  });
  b.part(new SphereGeometry(0.0035, 8, 6), FRAME, {
    bone: chest,
    at: whistleAt.local([0, 0.0185, 0]),
    name: "whistleRing",
  });

  // Sunglasses pushed up on the hair: two lenses with dark rims, a bridge and arms that run back over the ears.
  for (const s of sides) {
    const centre = onHair(s * 21, 52);
    const lens = centre.moved([0, 0.003, 0]);
    b.stick(new CylinderGeometry(0.0275, 0.0275, 0.003, 18), LENS, lens, { embed: 0.2, bone: head, name: "lens" });
    const rim = b.ring(lens, { count: 14, radius: 0.0285, joints: 0 }, () => {});
    b.sweep(catmull(rim.items, { closed: true }), 0.0026, { color: FRAME, sides: 6, bone: head, name: "rim" });
    const arm = [onHair(s * 42, 46), onHair(s * 62, 34), onHair(s * 84, 24), onHair(s * 96, 12)].map((h) =>
      h.moved([0, 0.004, 0]),
    );
    b.sweep(catmull([onHair(s * 36, 52).moved([0, 0.004, 0]), ...arm]), 0.0026, {
      color: FRAME,
      sides: 6,
      bone: head,
      name: "arm",
    });
  }
  b.sweep(
    catmull([
      onHair(9, 55).moved([0, 0.004, 0]),
      onHair(0, 57).moved([0, 0.006, 0]),
      onHair(-9, 55).moved([0, 0.004, 0]),
    ]),
    0.0026,
    {
      color: FRAME,
      sides: 6,
      bone: head,
      name: "bridge",
    },
  );
  void [toeTubes, fingerTubes];
  return b.root;
}
