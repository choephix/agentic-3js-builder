// Sprinter (Sculpt): a beach lifeguard, an athletic man about 1.85 m tall, blocked out with sweeps and lofts and
// then sculpted with brushes (src/experimental/sculpt.ts).
import { BoxGeometry, ConeGeometry, CylinderGeometry, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { sculpt } from "../src/experimental/sculpt";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import type { Station } from "../src/sugar";
import { interpolate } from "../src/sweep";
import { svg } from "../src/texture";
import type { Sweep } from "../src/sweep";

export const meta = {
  name: "Sprinter (Sculpt)",
  description:
    "Sprinter: an athletic woman in a crop top with a race bib, running briefs, spikes and a high ponytail, sculpted from a blockout.",
};

type V3 = [number, number, number];

const SKIN = "#c98f6b";
const NAIL = "#e8c3aa";
const EYE = "#f2efe6";
const IRIS = "#4f86a6";
const PUPIL = "#101318";
const LIP = "#b0555c";
const BROW = "#6b4a28";
const HAIR = "#3a2a1e";
const TRUNKS = "#16203a";
const TRIM = "#f4f2ea";
const TOP = "#e8337a";
const SHOE = "#f2e13a";
const SPIKE = "#c9ced6";

/** A radius function from keys `[t, rx, ry]`, smooth between them. */
const keyed = (keys: ReadonlyArray<readonly [number, number, number]>) => {
  const ts = keys.map((k) => k[0]);
  const rx = keys.map((k) => k[1]);
  const ry = keys.map((k) => k[2]);
  return (t: number): [number, number] => [interpolate(ts, rx, t), interpolate(ts, ry, t)];
};

const mirror = (s: number, p: readonly [number, number, number]): V3 => [s * p[0], p[1], p[2]];

export default function build() {
  const b = createBuilder({ name: "sprinter" });

  // ---- Skeleton -------------------------------------------------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.8688, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.896, 0],
      [0, 1.023, 0.00724],
      [0, 1.167, 0.00362],
      [0, 1.357, -0.01086],
    ]),
    { parent: hips, names: ["spine", "spine1", "spine2"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.371, -0.01086], aim: [0, 1.507, 0.00905], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.507, 0.00905], dir: [0, 0.905, 0.0362], role: "head" });

  // Hand frame for the left side (mirrored for the right): fingers along a, palm normal n, thumb side t.
  const elbowP: V3 = [0.3738, 1.151, 0.01086];
  const wristP: V3 = [0.5457, 0.9792, 0.04072];
  const a = new Vector3(...wristP).sub(new Vector3(...elbowP)).normalize();
  const flat = new Vector3(a.y, -a.x, 0).normalize();
  const n = flat
    .clone()
    .multiplyScalar(Math.cos(0.6))
    .addScaledVector(new Vector3(0, 0, 1), Math.sin(0.6));
  n.addScaledVector(a, -n.dot(a)).normalize();
  const t = new Vector3().crossVectors(n, a).normalize();
  const knuckle = new Vector3(...wristP).addScaledVector(a, 0.08779);

  const sides = [1, -1] as const;
  const armTubes: Sweep[] = [];
  const legTubes: Sweep[] = [];
  const feet: Joint[] = [];
  const palms: Sweep[] = [];
  const footTubes: Sweep[] = [];
  const toeTubes: Sweep[] = [];
  const fingerTubes: Sweep[] = [];
  const P = (v: Vector3, s: number) => mirror(s, v.toArray() as V3);
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const clavicle = b.joint(`shoulder${S}`, {
      parent: chest,
      at: mirror(s, [0.02715, 1.362, 0.03168]),
      aim: mirror(s, [0.1584, 1.367, 0]),
    });
    const arm = b.chain(`arm${S}`, catmull([mirror(s, [0.1629, 1.362, 0]), mirror(s, elbowP), mirror(s, wristP)]), {
      parent: clavicle,
      names: [`upperArm${S}`, `lowerArm${S}`],
      up: P(n, s),
      role: "arm",
    });
    armTubes.push(
      b.sweep(
        arm,
        keyed([
          [0, 0.04977, 0.04977],
          [0.14, 0.04887, 0.04887],
          [0.35, 0.04254, 0.04344],
          [0.53, 0.03529, 0.0362],
          [0.63, 0.0362, 0.03801],
          [0.82, 0.02715, 0.02806],
          [0.94, 0.02444, 0.01991],
          [1, 0.02353, 0.01901],
        ]),
        { color: SKIN, sides: 12, name: `arm${S}` },
      ),
    );
    const hand = b.joint(`hand${S}`, { parent: arm.joints[1], at: mirror(s, wristP), aim: P(knuckle, s), up: P(n, s) });
    // The palm is a flat loft on the hand bone; the fingers hang from it on their own joints.
    palms.push(
      b.loft(
        [
          { at: P(new Vector3(...wristP).addScaledVector(a, -0.0181), s), w: 0.05249, h: 0.02896 },
          { at: P(new Vector3(...wristP).addScaledVector(a, 0.0362), s), w: 0.06878, h: 0.02625 },
          { at: P(knuckle.clone().addScaledVector(a, -0.02353), s), w: 0.07964, h: 0.02172 },
        ],
        { bone: hand, up: P(n, s), color: SKIN, sides: 12, name: `palm${S}` },
      ),
    );
    const spread = [0.13, 0.02, -0.1, -0.24];
    const across = [0.03, 0.011, -0.009, -0.027].map((x) => x * 0.905);
    const lens = [
      [0.03891, 0.02353, 0.01901],
      [0.04254, 0.02715, 0.01991],
      [0.03891, 0.02534, 0.01901],
      [0.02987, 0.0181, 0.01719],
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
      let p = knuckle.clone().addScaledVector(t, across[f]).addScaledVector(a, -0.00362);
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
      const dir = a.clone().multiplyScalar(0.72).addScaledVector(t, 0.4978).addScaledVector(n, 0.181).normalize();
      let p = knuckle.clone().addScaledVector(a, -0.07059).addScaledVector(t, 0.01991).addScaledVector(n, 0.00362);
      const pts: Vector3[] = [p.clone()];
      const dirs: Vector3[] = [];
      [0.04525, 0.03349, 0.02715].forEach((len, k) => {
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

  const HEM = 0.05;
  const legR = keyed([
    [0, 0.08598, 0.0905],
    [0.14, 0.08688, 0.0905],
    [0.3, 0.07964, 0.08326],
    [0.44, 0.05611, 0.05973],
    [0.505, 0.04887, 0.05249],
    [0.56, 0.04887, 0.0543],
    [0.66, 0.05068, 0.05792],
    [0.8, 0.0362, 0.03891],
    [0.92, 0.02806, 0.02987],
    [1, 0.02715, 0.02806],
  ]);
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const leg = b.chain(
      `leg${S}`,
      catmull([
        mirror(s, [0.08145, 0.8417, 0]),
        mirror(s, [0.08869, 0.457, 0.01086]),
        mirror(s, [0.09412, 0.08598, -0.0181]),
      ]),
      {
        parent: hips,
        names: [`upLeg${S}`, `leg${S}`],
        role: "leg",
        contact: mirror(s, [0.09412, 0, 0.0181]),
      },
    );
    legTubes.push(
      b.sweep(leg, legR, {
        color: (u) => (u < HEM ? TRUNKS : SKIN),
        sides: 14,
        name: `leg${S}`,
      }),
    );
    const foot = b.joint(`foot${S}`, {
      parent: leg.joints[1],
      at: mirror(s, [0.09412, 0.08598, -0.0181]),
      aim: mirror(s, [0.09412, 0.0362, 0.1086]),
      role: "leg",
    });
    feet.push(foot);
    b.joint(`toe${S}`, {
      parent: foot,
      at: mirror(s, [0.09412, 0.02715, 0.1131]),
      aim: mirror(s, [0.09412, 0.02534, 0.181]),
      role: "leg",
    });
    footTubes.push(
      b.sweep(
        catmull([
          mirror(s, [0.09412, 0.06788, -0.03258]),
          mirror(s, [0.09412, 0.04525, 0]),
          mirror(s, [0.09412, 0.03439, 0.0543]),
          mirror(s, [0.09412, 0.02534, 0.1014]),
        ]),
        keyed([
          [0, 0.02987, 0.03258],
          [0.25, 0.03349, 0.03439],
          [0.65, 0.03982, 0.02896],
          [1, 0.04254, 0.02444],
        ]),
        { color: SHOE, sides: 12, bone: foot, name: `shoe${S}` },
      ),
    );
  }

  // ---- Torso ----------------------------------------------------------------------------------------------------
  const torsoStations: Station[] = [
    { at: [0, 0.7511, -0.00905], w: 0.2534, h: 0.181 },
    { at: [0, 0.8417, -0.00724], w: 0.372, h: 0.2082 },
    { at: [0, 0.9322, -0.00362], w: 0.33, h: 0.1946 },
    { at: [0, 1.023, 0], w: 0.2715, h: 0.181 },
    { at: [0, 1.14, 0.00362], w: 0.3077, h: 0.2036 },
    { at: [0, 1.249, 0.00724], w: 0.295, h: 0.2117 },
    { at: [0, 1.33, 0], w: 0.305, h: 0.2027 },
    { at: [0, 1.367, -0.00543], w: 0.25, h: 0.171 },
    { at: [0, 1.398, -0.01086], w: 0.1539, h: 0.1131 },
  ];
  const stationPath = catmull(torsoStations.map((st) => st.at));
  const WAIST = stationPath.closestT([0, 0.9865, 0]);
  const TOP0 = stationPath.closestT([0, 1.13, 0]);
  const TOP1 = stationPath.closestT([0, 1.3, 0]);
  const torso = b.loft(torsoStations, {
    bone: [hips, spine],
    color: (u) => (u < WAIST ? TRUNKS : u > TOP0 && u < TOP1 ? TOP : SKIN),
    sides: 20,
    name: "torso",
  });

  const neckTube = b.sweep(
    catmull([
      [0, 1.357, -0.01086],
      [0, 1.43, -0.01629],
      [0, 1.507, -0.0181],
    ]),
    [0.058, 0.048],
    { bone: [neck, head, chest], color: SKIN, sides: 12, name: "neck" },
  );

  // ---- Head -----------------------------------------------------------------------------------------------------
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.528, -0.02715], aim: [0, 1.473, 0.06335], role: "jaw" });
  const skull = b.part(new SphereGeometry(1, 30, 20), SKIN, {
    bone: head,
    at: [0, 1.577, -0.00724],
    scale: [0.07059, 0.09593, 0.08869],
    name: "skull",
  });
  const chin = b.part(new SphereGeometry(1, 26, 16), SKIN, {
    bone: jaw,
    at: [0, 1.5, 0.00543],
    scale: [0.04887, 0.03439, 0.05792],
    name: "jaw",
  });

  // ---- Sculpt: torso ----------------------------------------------------------------------------------------------
  const sc = sculpt(b);
  const trunk = b.surface(torso);
  /** A point on the torso's front (or back) surface at (x, y). */
  const front = (x: number, y: number, lift = 0): V3 => {
    const h = trunk.ray([x, y, 1], [0, 0, -0.905])!;
    return [x, y, h.at.z + lift];
  };
  const back = (x: number, y: number, lift = 0): V3 => {
    const h = trunk.ray([x, y, -1], [0, 0, 0.905])!;
    return [x, y, h.at.z - lift];
  };
  const side = (y: number, z: number): V3 => {
    const h = trunk.ray([1, y, z], [-0.905, 0, 0])!;
    return [h.at.x, y, z];
  };
  // Chest: pectorals, their lower borders, the sternum, collarbones, trapezius.
  sc.inflate(torso, {
    path: [front(0.02715, 1.267), front(0.08145, 1.281), front(0.1358, 1.294)],
    radius: [0.06, 0.07, 0.05],
    amount: [0.028, 0.055, 0.03],
  });
  sc.crease(torso, { path: [front(0, 1.33), front(0, 1.186)], radius: 0.009955, depth: 0.004525 });
  sc.inflate(torso, {
    path: [front(0.0181, 1.362, -0.00905), front(0.08145, 1.353, -0.0181), front(0.1448, 1.339, -0.02715)],
    radius: 0.01267,
    amount: 0.00543,
  });
  sc.push(torso, {
    path: [back(0.0362, 1.367), back(0.0905, 1.357), back(0.1403, 1.344)],
    dir: [0, 0.905, 0],
    radius: [0.02457, 0.04095, 0.03276],
    amount: [0.01474, 0.02129, 0.004914],
  });
  // Abdomen: rectus blocks with their tendinous lines, navel, obliques, the iliac furrow.
  sc.inflate(torso, { path: [front(0.02987, 1.186), front(0.02987, 1.023)], radius: 0.03258, amount: 0.003 });
  sc.crease(torso, { path: [front(0, 1.213), front(0, 0.9865)], radius: 0.009955, depth: 0.004 });
  for (const y of [1.158, 1.109, 1.059])
    sc.crease(torso, { path: [front(0.004, y), front(0.062, y - 0.004)], radius: 0.009955, depth: 0.0035 });
  sc.inflate(torso, {
    path: [side(1.186, 0.04525), side(1.068, 0.02715), side(0.9774, 0.0181)],
    radius: 0.04525,
    amount: [0.006552, 0.009828, 0.004914],
  });
  sc.crease(torso, {
    path: [front(0.09502, 0.9684), front(0.0543, 0.8914), front(0.02263, 0.8417)],
    radius: 0.01448,
    depth: [0.003276, 0.005733, 0.003276],
  });
  // Back: spine, erectors, shoulder blades, lats.
  sc.crease(torso, { path: [back(0, 1.376), back(0, 0.905)], radius: 0.01086, depth: 0.004525 });
  sc.inflate(torso, { path: [back(0.03439, 1.231), back(0.03439, 0.9593)], radius: 0.02715, amount: 0.00724 });
  sc.inflate(torso, { path: [back(0.08145, 1.303), back(0.09955, 1.231)], radius: 0.04525, amount: 0.01267 });
  sc.inflate(torso, {
    path: [back(0.1177, 1.267), back(0.1041, 1.086)],
    radius: [0.04095, 0.04914, 0.03276],
    amount: [0.009828, 0.01474, 0.004914],
  });
  // Pelvis: glutes, the gluteal fold and the hips.
  sc.inflate(torso, { path: [back(0.04977, 0.8869), back(0.06788, 0.8236)], radius: 0.06788, amount: 0.02353 });
  sc.crease(torso, { path: [back(0.00905, 0.7647), back(0.0905, 0.7692)], radius: 0.01267, depth: 0.006335 });
  sc.inflate(torso, { at: side(0.8507, 0), radius: 0.0543, amount: 0.00724 });

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
  const FRONT: V3 = [0, 0, 0.905];
  const BACK: V3 = [0, 0, -0.905];
  const OUT: V3 = [0.905, 0, 0];
  const IN: V3 = [-0.905, 0, 0];
  const legAt = (t: number, dir: V3) => on(legL, t, dir);
  // Thigh: quadriceps (rectus, vastus lateralis and medialis) with their grooves, adductors, hamstrings.
  sc.inflate(thighs, {
    path: [legAt(0.1, FRONT), legAt(0.22, FRONT), legAt(0.38, FRONT)],
    radius: [0.04095, 0.04504, 0.03276],
    amount: [0.003931, 0.009828, 0.004914],
  });
  sc.inflate(thighs, {
    path: [legAt(0.1, [0.905, 0, 0.724]), legAt(0.25, [0.905, 0, 0.724]), legAt(0.4, [0.905, 0, 0.543])],
    radius: [0.03276, 0.04095, 0.03276],
    amount: [0.003931, 0.008844, 0.004914],
  });
  sc.inflate(thighs, {
    path: [legAt(0.3, [-0.905, 0, 0.6335]), legAt(0.42, [-0.905, 0, 0.6335])],
    radius: 0.03258,
    amount: [0.006516, 0.009774],
  });
  sc.inflate(thighs, {
    path: [legAt(0.1, BACK), legAt(0.26, BACK), legAt(0.42, BACK)],
    radius: [0.04095, 0.04504, 0.03276],
    amount: [0.004914, 0.00786, 0.003931],
  });
  sc.inflate(thighs, { path: [legAt(0.16, IN), legAt(0.36, IN)], radius: 0.0362, amount: 0.00543 });
  // Knee and calf.
  sc.inflate(legs, { at: legAt(0.5, FRONT), radius: 0.03077, amount: 0.004344 });
  sc.crease(legs, {
    path: [legAt(0.5, [0.905, 0, -0.905]), legAt(0.5, BACK), legAt(0.5, [-0.905, 0, -0.905])],
    radius: 0.01267,
    depth: 0.006335,
  });
  sc.inflate(legs, {
    path: [legAt(0.55, [-0.6335, 0, -0.905]), legAt(0.63, [-0.6335, 0, -0.905]), legAt(0.72, [-0.4525, 0, -0.905])],
    radius: [0.02457, 0.03276, 0.02048],
    amount: [0.002948, 0.01081, 0.002948],
  });
  sc.inflate(legs, {
    path: [legAt(0.55, [0.6335, 0, -0.905]), legAt(0.62, [0.6335, 0, -0.905]), legAt(0.7, [0.4525, 0, -0.905])],
    radius: [0.02293, 0.02948, 0.01802],
    amount: [0.001966, 0.008358, 0.001966],
  });
  sc.crease(legs, { path: [legAt(0.56, BACK), legAt(0.7, BACK)], radius: 0.00905, depth: 0.004525 });
  sc.inflate(legs, { path: [legAt(0.72, BACK), legAt(0.85, BACK)], radius: 0.0181, amount: 0.002172 });
  // Shin, ankle bones.
  sc.inflate(legs, { path: [legAt(0.56, FRONT), legAt(0.85, FRONT)], radius: 0.01086, amount: 0.002715 });
  sc.inflate(legs, {
    path: [legAt(0.58, [0.905, 0, 0.543]), legAt(0.74, [0.905, 0, 0.543])],
    radius: 0.02353,
    amount: 0.004344,
  });
  sc.inflate(legs, { at: legAt(0.93, IN), radius: 0.0181, amount: 0.004344 });
  sc.inflate(legs, { at: legAt(0.95, OUT), radius: 0.0181, amount: 0.003258 });
  // Arms: deltoid, biceps, triceps, elbow, forearm, hand.
  const armAt = (t: number, dir: V3) => on(armL, t, dir);
  sc.inflate(arms, {
    path: [armAt(0.035, [0.905, 0.905, 0]), armAt(0.175, [0.905, 0.905, 0]), armAt(0.338, [0.905, 0.543, 0])],
    radius: [0.04095, 0.04914, 0.03276],
    amount: [0.005897, 0.0118, 0.003931],
  });
  sc.inflate(arms, { path: [armAt(0.035, FRONT), armAt(0.233, FRONT)], radius: 0.0362, amount: [0.007602, 0.004344] });
  sc.inflate(arms, { path: [armAt(0.035, BACK), armAt(0.233, BACK)], radius: 0.0362, amount: [0.007602, 0.004344] });
  sc.inflate(arms, {
    path: [armAt(0.187, [0, 0.362, 0.905]), armAt(0.35, [0, 0.362, 0.905]), armAt(0.49, [0, 0.362, 0.905])],
    radius: [0.02293, 0.03112, 0.02129],
    amount: [0.002948, 0.008358, 0.002948],
  });
  sc.inflate(arms, {
    path: [armAt(0.14, [0, 0.362, -0.905]), armAt(0.327, [0, 0.362, -0.905]), armAt(0.49, [0, 0.362, -0.905])],
    radius: [0.02457, 0.03276, 0.02457],
    amount: [0.003931, 0.009828, 0.003931],
  });
  sc.crease(arms, {
    path: [armAt(0.163, [0.362, 0, 0.905]), armAt(0.338, [0.362, 0, 0.905]), armAt(0.49, [0.362, 0, 0.905])],
    radius: 0.008145,
    depth: 0.004525,
  });
  sc.inflate(arms, { at: armAt(0.548, BACK), radius: 0.01991, amount: 0.004344 });
  sc.inflate(arms, {
    path: [
      armAt(0.584, [0.6335, 0.6335, 0.181]),
      armAt(0.677, [0.6335, 0.6335, 0.181]),
      armAt(0.84, [0.6335, 0.6335, 0.181]),
    ],
    radius: [0.02457, 0.02948, 0.01966],
    amount: [0.005897, 0.006882, 0.001966],
  });
  sc.inflate(arms, {
    path: [armAt(0.584, [-0.6335, -0.543, 0]), armAt(0.724, [-0.6335, -0.543, 0]), armAt(0.887, [-0.6335, -0.543, 0])],
    radius: [0.02457, 0.02785, 0.01638],
    amount: [0.003931, 0.005897, 0.001966],
  });
  sc.inflate(arms, { at: armAt(0.969, BACK), radius: 0.01448, amount: 0.002172 });
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
    radius: [0.01638, 0.02129, 0.01638],
    amount: [0.004914, 0.009009, 0.004095],
  });
  sc.inflate(palms, { path: [palmAt(0.15, -0.9), palmAt(0.5, -1.2)], radius: 0.0181, amount: 0.00543 });
  sc.inflate(palms, { at: palmAt(0.62, 0), radius: 0.01991, amount: -0.004 });
  for (const k of [1.4, 0.45, -0.4, -1.3])
    sc.inflate(palms, { at: palmAt(0.93, k, -1), radius: 0.009955, amount: 0.00362 });
  const footL = footTubes[0];
  const footAt = (u: number, dir: V3) => on(footL, u, dir);
  sc.inflate(footTubes, {
    path: [footAt(0.06, [0, 0.905, 0.181]), footAt(0.3, [0, 0.905, 0.2715]), footAt(0.55, [0, 0.905, 0.4525])],
    radius: [0.02457, 0.02785, 0.02293],
    amount: [0.004914, 0.009828, 0.003276],
  });
  sc.push(footTubes, {
    at: footAt(0, [0, -0.181, -0.905]),
    dir: [0, -0.1358, -0.905],
    radius: 0.03077,
    amount: 0.01086,
  });
  sc.inflate(footTubes, { at: footAt(0.42, [-0.543, -0.905, 0]), radius: 0.02896, amount: -0.009 });
  sc.inflate(footTubes, { at: footAt(0.86, [-0.6335, -0.362, 0.4525]), radius: 0.02715, amount: 0.00543 });
  sc.flatten(footTubes, {
    path: [
      [0.09412, 0.01, -0.05883],
      [0.09412, 0.01, 0.09955],
    ],
    dir: [0, -0.905, 0],
    radius: 0.03077,
    core: 0.5,
    side: "front",
  });

  // ---- Sculpt: neck and face ------------------------------------------------------------------------------------
  const cranium = [skull.mesh, chin.mesh];
  const headSurface = b.surface(cranium);
  /** A point on the face at (x, y): the front-most surface there. */
  const face = (x: number, y: number, lift = 0): V3 => [x, y, headSurface.ray([x, y, 1], [0, 0, -0.905])!.at.z + lift];
  const neckAt = (u: number, dir: V3) => on(neckTube, u, dir);
  sc.inflate(neckTube, {
    path: [neckAt(0.85, [0.724, 0, -0.4525]), neckAt(0.5, [0.724, 0, 0.2715]), neckAt(0.12, [0.543, 0, 0.724])],
    radius: [0.01638, 0.01966, 0.01638],
    amount: [0.003276, 0.009828, 0.006552],
  });
  sc.inflate(neckTube, { at: neckAt(0.45, FRONT), radius: 0.01267, amount: 0.00543 });
  // Brow ridge, eye sockets, nose, cheeks, lips, chin.
  sc.inflate(cranium, {
    path: [face(0.00362, 1.596), face(0.0362, 1.598), face(0.05883, 1.591)],
    radius: 0.01267,
    amount: [0.004914, 0.007371, 0.004095],
  });
  sc.inflate(cranium, { at: face(0.02806, 1.578), radius: 0.01991, amount: -0.007 });
  sc.push(cranium, {
    path: [face(0, 1.584), face(0, 1.561), face(0, 1.541)],
    dir: [0, 0.1358, 0.905],
    radius: [0.009828, 0.01393, 0.0172],
    amount: [0.004914, 0.02129, 0.0344],
  });
  sc.inflate(cranium, { at: face(0.0181, 1.539, 0.0181), radius: 0.01176, amount: 0.009955 });
  sc.inflate(cranium, { at: face(0, 1.535, 0.02896), radius: 0.009955, amount: 0.00362 });
  sc.inflate(cranium, { at: face(0.04706, 1.554), radius: 0.02534, amount: 0.00724 });
  sc.inflate(cranium, { at: face(0.04344, 1.523), radius: 0.02353, amount: -0.006 });
  sc.push(cranium, { at: face(0, 1.477), dir: [0, 0.2715, 0.905], radius: 0.02534, amount: 0.01086 });
  sc.crease(cranium, {
    path: [face(-0.02715, 1.505), face(0, 1.505), face(0.02715, 1.505)],
    radius: 0.004525,
    depth: 0.002715,
  });
  sc.inflate(cranium, { at: face(0, 1.584), radius: 0.02715, amount: 0.002715 });
  sc.smooth(cranium, { at: [0, 1.62, 0], radius: 0.0543, strength: 0.5 });

  // Eyes: eyeball, iris, pupil and two lids, seated in the sockets.
  for (const s of sides) {
    const S = s > 0 ? "L" : "R";
    const ez = face(0.02806, 1.578)[2] - 0.0035;
    const eye = mirror(s, [0.02806, 1.578, ez]);
    const seat = (geometry: SphereGeometry, color: string, dir: V3, name: string) =>
      b.part(geometry, color, { bone: head, at: eye, dir: [s * dir[0], dir[1], dir[2]], name: `${name}${S}` });
    b.part(new SphereGeometry(0.0132, 12, 8), EYE, { bone: head, at: eye, name: `eyeball${S}` });
    seat(new SphereGeometry(0.0135, 10, 4, 0, Math.PI * 2, 0, 0.78), IRIS, [s * 0.12, 0, 1], "iris");
    seat(new SphereGeometry(0.01358, 8, 3, 0, Math.PI * 2, 0, 0.34), PUPIL, [s * 0.12, 0, 1], "pupil");
    seat(new SphereGeometry(0.0141, 10, 4, 0, Math.PI * 2, 0, 0.62), SKIN, [0, 0.7873, 0.4525], "lidUp");
    seat(new SphereGeometry(0.014, 10, 3, 0, Math.PI * 2, 0, 0.45), SKIN, [0, -0.7964, 0.4254], "lidLow");
  }
  // Lips, brows, ears follow the sculpted face.
  const draped = (pts: V3[], lift = 0.001) => headSurface.drape(catmull(pts), { lift });
  b.sweep(
    draped([face(-0.02444, 1.507), face(-0.01176, 1.511), face(0, 1.51), face(0.01176, 1.511), face(0.02444, 1.507)]),
    0.0028,
    {
      color: LIP,
      sides: 6,
      name: "upperLip",
    },
  );
  b.sweep(
    draped([face(-0.02263, 1.506), face(-0.01086, 1.502), face(0, 1.5), face(0.01086, 1.502), face(0.02263, 1.506)]),
    0.0034,
    {
      color: LIP,
      sides: 6,
      name: "lowerLip",
    },
  );
  for (const s of sides)
    b.sweep(
      draped([face(s * 0.01086, 1.6), face(s * 0.03439, 1.605), face(s * 0.05973, 1.598)]),
      (u) => 0.0044 * (1 - 0.45 * u) + 0.0006,
      {
        color: BROW,
        sides: 6,
        name: "brow",
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
      at: [s * 0.06923, 1.5584, -0.00543],
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
  const skullCentre = new Vector3(0, 1.742 * 0.905, -0.008 * 0.905);
  const tilt = new Vector3(0, 0.894, -0.447);
  const hair = b.loft(
    [0.0114, 0.035, 0.06, 0.08, 0.095, 0.105, 0.11]
      .map((d0) => d0 * 0.905)
      .map((d) => {
        const k = Math.sqrt(1 - (d / (0.111 * 0.905)) ** 2);
        return {
          at: skullCentre.clone().addScaledVector(tilt, d).toArray() as V3,
          w: 1.81 * 0.085 * k,
          h: 1.81 * 0.1066 * k,
        };
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
    return hairSurface.nearest(skullCentre.clone().addScaledVector(out, 0.181));
  };
  sc.push(hair, {
    path: [onHair(0, 40), onHair(0, 62)],
    dir: [0, 0.4525, 0.905],
    radius: [0.03077, 0.04072],
    amount: [0.00724, 0.01267],
  });
  for (const az of [12.67, 28.96, 47.06])
    sc.crease(hair, { path: [onHair(az, 30), onHair(az, 56), onHair(az * 0.6, 80)], radius: 0.006335, depth: 0.00362 });

  // ---- Kit: waistband, crop top straps, race bib, ponytail, spikes ----------------------------------------------
  const bodySurface = b.surface([torso, neckTube]);
  const ring = (y: number, rx: number, rz: number) =>
    catmull(
      Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return [rx * Math.sin(a), y, rz * Math.cos(a) - 0.001] as V3;
      }),
      { closed: true },
    );
  b.sweep(bodySurface.drape(ring(0.9865, 0.15, 0.103), { lift: 0.004 }), 0.006, {
    color: TRIM,
    sides: 6,
    name: "briefsBand",
  });
  for (const s of sides) {
    const strap = [front(s * 0.05, 1.29), front(s * 0.062, 1.34), back(s * 0.06, 1.34), back(s * 0.05, 1.29)];
    b.sweep(bodySurface.drape(catmull(strap), { lift: 0.003 }), 0.006, { color: TOP, sides: 6, name: "strap" });
  }
  const bibPoint = bodySurface.nearest([0, 1.2, 0.2]).moved([0, 0.02, 0]);
  const bibTexture = svg(
    `<svg viewBox="0 0 150 100"><rect width="150" height="100" fill="#fafafa"/><rect x="4" y="4" width="142" height="92" fill="none" stroke="#e8337a" stroke-width="5"/><text x="75" y="72" font-size="62" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="#16203a">247</text></svg>`,
    { size: 150 },
  );
  b.stick(new BoxGeometry(0.15, 0.004, 0.1), "#ffffff", bibPoint, {
    embed: 0,
    spin: 180,
    bone: chest,
    texture: bibTexture,
    name: "bib",
  });
  const tail = b.chain(
    "ponytail",
    catmull([
      [0, 1.63, -0.075],
      [0, 1.655, -0.125],
      [0, 1.6, -0.165],
      [0, 1.5, -0.18],
      [0, 1.4, -0.165],
    ] as V3[]),
    { parent: head, names: ["ponytail1", "ponytail2", "ponytail3", "ponytail4"], role: "tail" },
  );
  b.sweep(tail, [0.024, 0.03, 0.026, 0.016, 0.005], { color: HAIR, sides: 10, name: "ponytail" });
  b.part(new CylinderGeometry(0.03, 0.03, 0.012, 12), TOP, {
    bone: head,
    at: [0, 1.635, -0.086],
    dir: [0, 0.3, -1],
    name: "hairTie",
  });
  const soleY = 0.005;
  for (const s of sides)
    for (const [x, z] of [
      [-0.028, 0.06],
      [0.0, 0.075],
      [0.028, 0.06],
      [-0.022, 0.105],
      [0.022, 0.105],
      [0, -0.045],
    ])
      b.part(new ConeGeometry(0.0035, 0.01, 5), SPIKE, {
        bone: feet[s > 0 ? 0 : 1],
        at: mirror(s, [0.0941 + x, soleY, z]),
        dir: [0, -1, 0],
        name: "spike",
      });
  void [toeTubes, fingerTubes];
  return b.root;
}
