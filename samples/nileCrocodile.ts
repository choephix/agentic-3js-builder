// Nile crocodile, 4 m, in a low sprawl: one seamless trunk, neck and tail lofted over chains rooted at the hips,
// and a flat, triangular head whose upper and lower jaws are separate lofts, opened after building to show interlocking
// teeth and a pale mouth. Teeth are cones seated on rays cast at the real jaw surfaces. Keeled osteoderms (a
// hand-built tile geometry) run in banded rows down the back, gather into the nuchal shield behind the head and
// become the double, then single, tail crest in step with the tail's crossbands. Legs come from `limb`, elbows and
// knees out; fingers and webbed toes are two-joint chains.
import { BufferGeometry, ConeGeometry, CylinderGeometry, Float32BufferAttribute, SphereGeometry, Vector3 } from "three";
import { createBuilder } from "../src/builder";
import { frame } from "../src/frame";
import { limb } from "../src/ik";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { Sweep } from "../src/sweep";
import { catmull } from "../src/path";

export const meta = {
  name: "Nile Crocodile",
  description:
    "A 4 m Nile crocodile in a sprawling rest pose: keeled scute rows, a double-crested tail and an open, toothy jaw.",
  builtBy: "Claude Opus 5.5",
};

const BACK = "#3d4226";
const SCUTE = "#585c34";
const FLANK = "#7b7843";
const SPOT = "#2b2d1b";
const LATERAL = "#a39a58";
const BELLY = "#e2d39b";
const BAND = "#2f3320";
const MOUTH = "#e9cf8f";
const TOOTH = "#f4ecd4";
const EYE = "#c2b23a";
const PUPIL = "#141410";
const CLAW = "#2a241d";
const NOSTRIL = "#1b1a12";
const WEB = "#6a6a3a";

/** Piecewise-linear lookup through sorted `[x, y]` keys. */
function interp(keys: readonly (readonly [number, number])[], x: number) {
  if (x <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [x1, y1] = keys[i];
    if (x <= x1) {
      const [x0, y0] = keys[i - 1];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return keys[keys.length - 1][1];
}

/**
 * A keeled osteoderm, base centred on the origin: a tapered tile `w` wide, `l` long and `h` tall, with a ridge along
 * its middle that rises `keel` at the back (-Z) and `keel * front` at the front. Flat-shaded.
 */
function scuteGeometry(w: number, l: number, h: number, keel: number, front = 0.35) {
  const a = w * 0.36;
  const c = l * 0.4;
  const B = [
    [-w / 2, 0, -l / 2],
    [w / 2, 0, -l / 2],
    [w / 2, 0, l / 2],
    [-w / 2, 0, l / 2],
  ];
  const T = [
    [-a, h, -c],
    [a, h, -c],
    [a, h, c],
    [-a, h, c],
  ];
  const R0 = [0, h + keel, -c];
  const R1 = [0, h + keel * front, c * 0.9];
  const faces = [
    [B[0], B[1], B[2], B[3]],
    [B[0], B[1], T[1], T[0]],
    [B[1], B[2], T[2], T[1]],
    [B[2], B[3], T[3], T[2]],
    [B[3], B[0], T[0], T[3]],
    [T[0], R0, R1, T[3]],
    [T[1], T[2], R1, R0],
    [T[0], T[1], R0],
    [T[3], R1, T[2]],
  ];
  const centre = new Vector3(0, h * 0.5, 0);
  const pos: number[] = [];
  const tri = (p: number[], q: number[], r: number[]) => {
    const A = new Vector3(...p);
    const Bv = new Vector3(...q);
    const C = new Vector3(...r);
    const n = Bv.clone().sub(A).cross(C.clone().sub(A));
    const out = A.clone().add(Bv).add(C).divideScalar(3).sub(centre);
    if (n.dot(out) < 0) pos.push(...p, ...r, ...q);
    else pos.push(...p, ...q, ...r);
  };
  for (const f of faces) {
    tri(f[0], f[1], f[2]);
    if (f.length === 4) tri(f[0], f[2], f[3]);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export default function build() {
  const b = createBuilder({ name: "nileCrocodile" });
  const random = rng(11);

  // ---------------------------------------------------------------- trunk, neck and tail
  // One station curve runs from the tail tip through the hips to the base of the skull.
  const bodyStations = [
    { at: [0, 0.08, -2.28], w: 0.032, h: 0.07 },
    { at: [0, 0.12, -2.02], w: 0.11, h: 0.07 },
    { at: [0, 0.2, -1.6], w: 0.11, h: 0.17 },
    { at: [0, 0.28, -1.1], w: 0.2, h: 0.25 },
    { at: [0, 0.33, -0.62], w: 0.32, h: 0.3 },
    { at: [0, 0.34, -0.22], w: 0.5, h: 0.33 },
    { at: [0, 0.35, 0.05], w: 0.62, h: 0.35 },
    { at: [0, 0.35, 0.32], w: 0.66, h: 0.36 },
    { at: [0, 0.34, 0.58], w: 0.56, h: 0.33 },
    { at: [0, 0.325, 0.86], w: 0.4, h: 0.26 },
    { at: [0, 0.315, 1.1], w: 0.34, h: 0.22 },
  ] as const;
  const curve = catmull(bodyStations.map((s) => s.at));
  const hipsT = curve.closestT([0, 0.34, -0.22]);
  const hips = b.joint("hips", { at: [0, 0.34, -0.22], role: "spine", group: "body" });
  const tail = b.chain("tail", curve.slice(hipsT, 0), { parent: hips, count: 8, role: "tail", group: "tail" });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const bodyHalfW = bodyStations.map((s) => [s.at[2], s.w / 2] as const);
  const belly = (t: number) => Math.sin(Math.PI * Math.min(Math.max((t - 0.12) / 0.6, 0), 1));
  const tailColor = (t: number) =>
    t > 0.17 && t < 0.98 && (t - 0.12) / 0.09 - Math.floor((t - 0.12) / 0.09) > 0.61 ? BAND : FLANK;
  const tailBody = b.loft(bodyStations, {
    bone: [tail, hips, spine],
    from: 0,
    to: hipsT,
    color: (t) => tailColor(1 - t / hipsT),
    sectors: [
      [-40, 40, BACK],
      [132, 228, BELLY],
    ],
    caps: { start: "round", end: "none" },
    sides: 12,
    group: "tail",
  });
  const body = b.loft(bodyStations, {
    bone: [tail, hips, spine],
    from: hipsT,
    to: 1,
    color: FLANK,
    sectors: [
      [-62, 62, BACK],
      [104, 128, LATERAL],
      [128, 232, BELLY],
      [232, 256, LATERAL],
    ],
    shift: (t) => [0, -0.035 * belly((t - hipsT) / (1 - hipsT))],
    caps: { start: "none", end: "round" },
    sides: 12,
    group: "body",
  });

  // ---------------------------------------------------------------- head
  const headDir: V3 = [0, -0.05, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, quat: aim(headDir, [0, 1, 0], "z") });
  // Upper skull and snout, head-local (+Z forward, +Y up): z, centre y, full width, full height.
  const upperKeys = [
    [-0.1, 0.0, 0.33, 0.19],
    [0.04, 0.025, 0.37, 0.14],
    [0.14, 0.018, 0.32, 0.12],
    [0.25, 0.005, 0.235, 0.09],
    [0.36, -0.005, 0.19, 0.075],
    [0.46, -0.01, 0.148, 0.065],
    [0.53, -0.008, 0.17, 0.07],
    [0.59, -0.012, 0.11, 0.05],
  ] as const;
  const upper = b.loft(
    upperKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: skull,
      color: FLANK,
      sectors: [
        [-58, 58, BACK],
        [132, 228, MOUTH],
      ],
      sides: 10,
      group: "head",
    },
  );
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.055, -0.03],
    aim: [0, -0.07, 0.58],
    role: "jaw",
    group: "jaw",
  });
  const lowerKeys = [
    [-0.09, -0.06, 0.26, 0.07],
    [0.04, -0.075, 0.35, 0.085],
    [0.16, -0.074, 0.29, 0.07],
    [0.3, -0.07, 0.2, 0.056],
    [0.44, -0.066, 0.148, 0.05],
    [0.52, -0.064, 0.155, 0.05],
    [0.58, -0.06, 0.1, 0.04],
  ] as const;
  const lower = b.loft(
    lowerKeys.map(([z, y, w, h]) => ({ at: head.p([0, y, z]), w, h })),
    {
      bone: jaw,
      color: FLANK,
      sectors: [
        [-50, 50, MOUTH],
        [125, 235, BELLY],
      ],
      sides: 10,
      group: "jaw",
    },
  );
  // Teeth: rays up at the upper jaw's underside and down at the lower jaw's top, near their outer edges.
  const upperHalfW = upperKeys.map((k) => [k[0], k[2] / 2] as const);
  const lowerHalfW = lowerKeys.map((k) => [k[0], k[2] / 2] as const);
  const upperSurface = b.surface(upper);
  const lowerSurface = b.surface(lower);
  for (const s of [1, -1]) {
    for (let i = 0; i < 13; i++) {
      const z = 0.57 - i * 0.037;
      const hit = upperSurface.ray(head.p([s * interp(upperHalfW, z) * 0.7, -0.3, z]), head.d([0, 1, 0]));
      if (!hit) continue;
      const big = i === 2 || i === 5 ? 1.45 : i > 9 ? 0.7 : 1;
      const len = (0.026 + random() * 0.008) * big;
      b.stick(new ConeGeometry(len * 0.3, len, 5), TOOTH, frame(hit, head.d([s * 0.18, -1, 0.06])), {
        bone: skull,
        embed: 0.3,
      });
    }
    for (let i = 0; i < 12; i++) {
      const z = 0.537 - i * 0.038;
      const hit = lowerSurface.ray(head.p([s * interp(lowerHalfW, z) * 0.62, 0.3, z]), head.d([0, -1, 0]));
      if (!hit) continue;
      const big = i === 3 ? 1.7 : i === 0 ? 1.2 : i > 9 ? 0.7 : 1;
      const len = (0.024 + random() * 0.008) * big;
      b.stick(new ConeGeometry(len * 0.3, len, 5), TOOTH, frame(hit, head.d([s * 0.12, 1, 0.04])), {
        bone: jaw,
        embed: 0.3,
      });
    }
  }

  // Eyes: raised turrets on the back of the skull, yellow irises with a slit pupil, a bony brow over the top.
  for (const s of [1, -1]) {
    const socket = head.p([s * 0.08, 0.072, 0.12]);
    b.part(new SphereGeometry(0.046, 8, 5), BACK, { bone: skull, at: socket, scale: [1, 0.85, 1.2] });
    const gaze = head.d([s * 0.8, 0.35, 0.5]).normalize();
    const eye = offset(socket, gaze, 0.02);
    b.part(new SphereGeometry(0.033, 8, 6), EYE, { bone: skull, at: eye });
    b.part(new SphereGeometry(0.5, 6, 4), PUPIL, {
      bone: skull,
      at: offset(eye, gaze, 0.031),
      dir: gaze,
      axis: "z",
      scale: [0.008, 0.042, 0.01],
    });
    // Brow: a flat bony lid over the top and back of the eye.
    b.part(new SphereGeometry(0.5, 8, 4), SCUTE, {
      bone: skull,
      at: offset(offset(eye, head.d([0, 1, 0]), 0.026), head.d([0, 0, -1]), 0.012),
      dir: head.d([0, 0, 1]),
      axis: "z",
      scale: [0.062, 0.02, 0.058],
    });
  }

  // Nostrils on a raised dome at the snout tip.
  const noseHit = upperSurface.ray(head.p([0, 0.3, 0.545]), head.d([0, -1, 0]));
  if (noseHit) {
    const dome = b.stick(new SphereGeometry(0.5, 8, 5), BACK, noseHit, {
      bone: skull,
      scale: [0.075, 0.035, 0.06],
      embed: 0.45,
    });
    for (const s of [1, -1])
      b.part(new SphereGeometry(0.5, 6, 4), NOSTRIL, {
        bone: skull,
        at: dome.local([s * 0.011, 0.016, 0.004]),
        dir: head.d([s * 0.4, 0, 1]),
        axis: "z",
        scale: [0.009, 0.007, 0.02],
      });
  }

  // ---------------------------------------------------------------- legs
  const legTubes: Sweep[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    // Sprawl: upper arm and thigh swing out from the body, elbow and knee stand clear of the flanks, forearm and
    // shin drop to hands and feet that lie flat and point forward and out.
    const handR = 0.024;
    const front = b.chain(
      `armF${side}`,
      limb(
        [s * 0.22, 0.3, 0.58],
        [s * 0.5, handR + 0.018, 0.72],
        [0.22, 0.2, 0.09],
        [
          [s, 0.1, -0.4],
          [0, 1, -0.5],
        ],
        { sole: [s * 0.35, -0.3, 1] },
      ),
      {
        parent: spine.joints[2],
        names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
        role: "leg",
        group: `legF${side}`,
      },
    );
    const fT = front.ts;
    const frontRx: [number, number][] = [
      [0, 0.075],
      [fT[1], 0.056],
      [fT[2], 0.042],
      [fT[2] + 0.03, 0.046],
      [1, 0.044],
    ];
    const frontRy: [number, number][] = [
      [0, 0.08],
      [fT[1], 0.056],
      [fT[2], 0.04],
      [fT[2] + 0.03, handR],
      [1, handR],
    ];
    const armTube = b.sweep(front, (t) => [interp(frontRx, t), interp(frontRy, t)], {
      color: FLANK,
      sides: 8,
      sectors: [[110, 250, BELLY]],
      group: `legF${side}`,
    });

    const footR = 0.026;
    const hind = b.chain(
      `legH${side}`,
      limb(
        [s * 0.2, 0.3, -0.2],
        [s * 0.56, footR + 0.008, -0.02],
        [0.26, 0.23, 0.15],
        [
          [s, 0.3, 0.5],
          [0, 1, -0.5],
        ],
        { sole: [s * 0.3, -0.15, 1] },
      ),
      { parent: hips, names: [`hip${side}`, `knee${side}`, `ankle${side}`], role: "leg", group: `legH${side}` },
    );
    const hT = hind.ts;
    const hindRx: [number, number][] = [
      [0, 0.1],
      [hT[1], 0.068],
      [hT[2], 0.048],
      [hT[2] + 0.03, 0.052],
      [1, 0.05],
    ];
    const hindRy: [number, number][] = [
      [0, 0.11],
      [hT[1], 0.07],
      [hT[2], 0.045],
      [hT[2] + 0.03, footR],
      [1, footR],
    ];
    const legTube = b.sweep(hind, (t) => [interp(hindRx, t), interp(hindRy, t)], {
      color: FLANK,
      sides: 8,
      sectors: [[110, 250, BELLY]],
      group: `legH${side}`,
    });
    legTubes.push(armTube, legTube);

    // Digits: fanned two-joint chains lying on the floor. Digit 1 is medial (toward the body); the inner three
    // carry claws.
    const digitSet = (leg: typeof front, lens: number[], spread: number[], r: number, gap: number, prefix: string) => {
      const tip = leg.at(1);
      const end = leg.joints[leg.joints.length - 1];
      const fwd = tip.tangent.clone().setY(0).normalize();
      const outward = new Vector3(fwd.z, 0, -fwd.x).multiplyScalar(s); // across the hand, away from the body
      const chains = [];
      for (let i = 0; i < lens.length; i++) {
        const base = tip.at
          .clone()
          .addScaledVector(outward, (i - (lens.length - 1) / 2) * gap)
          .addScaledVector(fwd, -0.02);
        base.y = r;
        const dir = fwd.clone().applyAxisAngle(new Vector3(0, 1, 0), (s * spread[i] * Math.PI) / 180);
        const m = base.clone().addScaledVector(dir, lens[i] * 0.55);
        const e = base.clone().addScaledVector(dir, lens[i]);
        m.y = r * 0.9;
        e.y = r * 0.75;
        const ch = b.chain(`${prefix}${side}${i + 1}`, [base, m, e], {
          parent: end,
          names: [`${prefix}${side}${i + 1}a`, `${prefix}${side}${i + 1}b`],
          role: "digit",
          group: leg === front ? `legF${side}` : `legH${side}`,
        });
        b.sweep(ch, (t) => [r * 1.05 * (1 - 0.35 * t), r * (1 - 0.3 * t)], { color: FLANK, sides: 6 });
        if (i < 3) b.spike(ch.at(1).at, dir.clone().setY(-0.2), 0.034, r * 0.6, { bone: ch.joints[1], color: CLAW });
        chains.push(ch);
      }
      return chains;
    };
    digitSet(front, [0.07, 0.095, 0.105, 0.09, 0.07], [-46, -22, 0, 22, 44], 0.015, 0.024, "finger");
    const toes = digitSet(hind, [0.11, 0.15, 0.16, 0.135], [-30, -8, 14, 36], 0.017, 0.03, "toe");
    for (let i = 0; i < toes.length - 1; i++)
      b.membrane(toes[i], toes[i + 1], { thickness: 0.006, color: WEB, scallop: 0.3, rows: 2, cols: 4 });
  }

  // ---------------------------------------------------------------- osteoderms
  // Dorsal shield: transverse rows of keeled scutes from the shoulders to the hips, on the built skin. Every third
  // row is dark, continuing the tail's crossbands up the back.
  const scute = scuteGeometry(0.06, 0.068, 0.014, 0.016);
  const smallScute = scuteGeometry(0.045, 0.05, 0.012, 0.012);
  // A point on the skin at full-curve t: the tail range below the hips, the body range above.
  const skinAt = (t: number, angle: number) => (t < hipsT ? tailBody.at(t, angle) : body.at(t, angle));
  let row = 0;
  for (let z = 0.74; z > -0.3; z -= 0.072, row++) {
    const t = curve.closestT([0, 0.35, z]);
    const hw = interp(bodyHalfW, z);
    const cols = hw > 0.3 ? 8 : hw > 0.25 ? 6 : 4;
    for (let c = 0; c < cols; c++) {
      const x = (c - (cols - 1) / 2) * 0.062;
      const ang = (Math.asin(Math.min(0.95, Math.abs(x) / hw)) * 180) / Math.PI;
      const at = skinAt(t, x > 0 ? -ang : ang);
      b.stick(Math.abs(x) > 0.14 ? smallScute : scute, row % 3 === 1 ? BAND : SCUTE, at, {
        flow: [0, 0, 1],
        embed: 0.3,
      });
    }
  }

  // Nuchal shield: a cluster of big keeled scutes on the neck, and a pair of post-occipitals behind the skull.
  const nuchal = scuteGeometry(0.075, 0.08, 0.016, 0.03);
  const postOccipital = scuteGeometry(0.04, 0.045, 0.012, 0.014);
  for (const [z, x, geo] of [
    [0.98, 0.045, nuchal],
    [0.98, -0.045, nuchal],
    [0.9, 0.045, nuchal],
    [0.9, -0.045, nuchal],
    [0.94, 0.12, nuchal],
    [0.94, -0.12, nuchal],
    [1.06, 0.05, postOccipital],
    [1.06, -0.05, postOccipital],
  ] as const) {
    const t = curve.closestT([0, 0.32, z]);
    const ang = (Math.asin(Math.min(0.95, Math.abs(x) / interp(bodyHalfW, z))) * 180) / Math.PI;
    b.stick(geo, SCUTE, skinAt(t, x > 0 ? -ang : ang), { flow: [0, 0, 1], embed: 0.3 });
  }

  // Tail crests: two rows of tall keeled scutes that merge into one along the last part of the tail, two per band
  // period so every other crest sits on a dark band. A row of small keeled scales runs along each side.
  const crest = scuteGeometry(0.042, 0.078, 0.012, 0.075, 0.2);
  const sideScale = scuteGeometry(0.035, 0.04, 0.01, 0.012);
  for (let t = 0.0525; t < 0.97; t += 0.045) {
    const u = 1 - t;
    const color = tailColor(t) === BAND ? BAND : SCUTE;
    const scale = 1 - 0.5 * t;
    if (t < 0.55)
      for (const s of [1, -1])
        b.stick(crest, color, tailBody.at(u * hipsT, s * 27), { flow: [0, 0, 1], embed: 0.3, scale });
    else
      b.stick(crest, color, tailBody.at(u * hipsT, 0), {
        flow: [0, 0, 1],
        embed: 0.3,
        scale: [scale, scale * 1.1, scale],
      });
    if (t < 0.8)
      for (const s of [1, -1])
        b.stick(
          sideScale,
          tailColor(t + 0.0225) === BAND ? BAND : SCUTE,
          tailBody.at((1 - t - 0.0225) * hipsT, s * 72),
          {
            flow: [0, 0, 1],
            embed: 0.3,
            scale: 1.2 - 0.6 * t,
          },
        );
  }

  // Dark spots on the flanks and legs.
  const spot = new CylinderGeometry(0.02, 0.02, 0.006, 8);
  const skin = b.surface([tailBody, body]);
  for (const hit of skin.scatter(40, {
    rng: random,
    minDist: 0.07,
    filter: (h) => Math.abs(h.n.y) < 0.55 && h.at.z > -0.3 && h.at.z < 0.8,
  }))
    b.stick(spot, SPOT, hit, { embed: 0.5, scale: 0.6 + random() * 0.8 });
  for (const tube of legTubes)
    for (const hit of b.surface(tube).scatter(9, { rng: random, minDist: 0.05, filter: (h) => h.n.y > 0.1 }))
      b.stick(spot, SPOT, hit, { embed: 0.5, scale: 0.4 + random() * 0.5 });

  // Raised, keeled scales scattered along the upper flanks, between the dorsal shield and the spots.
  const flankScute = scuteGeometry(0.035, 0.04, 0.01, 0.01);
  for (const hit of skin.scatter(34, {
    rng: random,
    minDist: 0.075,
    filter: (h) => h.n.y > 0.25 && h.n.y < 0.75 && h.at.z > -0.25 && h.at.z < 0.75,
  }))
    b.stick(flankScute, SCUTE, hit, { flow: [0, 0, 1], embed: 0.35, scale: 0.55 + random() * 0.4 });

  // Sensory pits: tiny dark dots peppering the sides of both jaws.
  const pit = new SphereGeometry(0.0032, 4, 3);
  for (const [surface, count] of [
    [upperSurface, 40],
    [lowerSurface, 30],
  ] as const)
    for (const hit of surface.scatter(count, {
      rng: random,
      minDist: 0.022,
      filter: (h) => Math.abs(h.n.y) < 0.75 && h.at.z > 1.32,
    }))
      b.stick(pit, SPOT, hit, { embed: 0.6 });

  // Rugose bumps on the snout between the eyes and the nose.
  const bump = new SphereGeometry(0.5, 6, 4);
  for (const hit of upperSurface.scatter(26, {
    rng: random,
    minDist: 0.035,
    filter: (h) => h.n.y > 0.8 && h.at.z > 1.3 && h.at.z < 1.6,
  }))
    b.stick(bump, BACK, hit, { embed: 0.5, scale: [0.022, 0.009, 0.03] });

  // Rest pose: jaw a little open.
  b.pose(jaw, { axis: head.d([1, 0, 0]), deg: 16 });
  return b.root;
}
