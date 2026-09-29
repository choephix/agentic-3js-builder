// Snow leopard. A long, low, smooth-skinned body from rump tip through the tail to the head (one loft over the tail,
// hips and spine joints) with a deep chest and tucked loin, countershaded smoky grey over a white belly. Digitigrade
// legs placed joint by joint, each ending in a toe segment flat on the floor under a broad snowshoe paw; a very thick
// tail on eight joints with dark rings and a solid black tip. A domed, short-muzzled head on a region: eyes and nose
// set onto the face by ray
// hits, a separate lower jaw with canines and tongue, dotted whisker pads, whiskers, and small rounded ears with
// dark backs. Broken rosettes (partial tori around a fawn centre) are scattered over the real skin and bend with it;
// solid spots on the head and legs, dashes down the spine.
import { CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { createBuilder } from "../src/builder";
import { aim, offset, rng } from "../src/math";
import type { FrameInput, V3 } from "../src/math";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";

export const meta = {
  name: "Snow Leopard",
  description: "A smoky-grey snow leopard with broken rosettes, snowshoe paws and a thick ringed tail.",
  builtBy: "Claude Opus 5.5",
};

const FUR = "#d8d5cd";
const BACK = "#c6bfb0";
const BELLY = "#f3f2ee";
const PAW = "#e4e1da";
const ROSETTE = "#2e2e31";
const ROSE_FILL = "#b1a791";
const SPOT = "#353336";
const NOSE = "#c99590";
const LIP = "#262325";
const IRIS = "#a7c79a";
const PUPIL = "#141414";
const TOOTH = "#f4efe2";
const TONGUE = "#c9727a";
const EAR_IN = "#e8dcd6";

/** Change this one number to resize the head; joints move, never scale. */
const HEAD_SCALE = 1.12;

export default function build() {
  const b = createBuilder({ name: "snowLeopard" });
  const random = rng(11);

  // One profile from tail tip through the hips to the base of the skull; w/h are full width and height.
  const stations = [
    { at: [0, 0.49, -1.4], w: 0.14, h: 0.14 },
    { at: [0, 0.43, -1.21], w: 0.145, h: 0.145 },
    { at: [0, 0.42, -0.96], w: 0.15, h: 0.15 },
    { at: [0, 0.46, -0.7], w: 0.145, h: 0.145 },
    { at: [0, 0.48, -0.48], w: 0.14, h: 0.14 },
    { at: [0, 0.49, -0.35], w: 0.33, h: 0.32 },
    { at: [0, 0.48, -0.08], w: 0.3, h: 0.3 },
    { at: [0, 0.48, 0.16], w: 0.33, h: 0.35 },
    { at: [0, 0.51, 0.32], w: 0.29, h: 0.31 },
    { at: [0, 0.59, 0.43], w: 0.24, h: 0.25 },
    { at: [0, 0.67, 0.5], w: 0.19, h: 0.2 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[4];
  const hips = b.joint("hips", { at: stations[4].at });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "chest", "neck1", "neck2"],
    role: "spine",
    group: "body",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), { parent: hips, count: 8, role: "tail", group: "tail" });
  const zAt = (t: number) => curve.at(t).z;
  const stripe = (t: number) => {
    const z = zAt(t);
    if (z < -1.3) return ROSETTE;
    if ((z > -1.23 && z < -1.17) || (z > -1.1 && z < -1.04) || (z > -0.99 && z < -0.93)) return ROSETTE;
    return FUR;
  };
  const belly = (z: number) => Math.exp(-(((z - 0.02) / 0.18) ** 2));
  const tailBody = b.loft(stations, {
    bone: [tail, hips, spine],
    from: 0,
    to: hipsT,
    color: (t) => stripe(t / hipsT),
    shift: (t) => [0, -0.035 * belly(zAt(t / hipsT))],
    sides: 10,
    caps: { start: "round", end: "none" },
    group: "body",
  });
  const body = b.loft(stations, {
    bone: [tail, hips, spine],
    from: hipsT,
    to: 1,
    color: (t) => stripe((t - hipsT) / (1 - hipsT)),
    sectors: [
      [-60, 60, BACK],
      [130, 230, BELLY],
    ],
    shift: (t) => [0, -0.035 * belly(zAt((t - hipsT) / (1 - hipsT)))],
    sides: 10,
    caps: { start: "none", end: "round" },
    group: "body",
  });
  // Elongated dark dashes running down the spine, laid along the skin.
  b.along(
    body,
    9,
    (at) =>
      b.stick(new CylinderGeometry(0.014, 0.014, 0.005, 7), ROSETTE, at, {
        embed: 0.5,
        flow: at.tangent,
        scale: [1, 1, 2.6],
      }),
    { from: hipsT + 0.03 * (1 - hipsT), to: hipsT + 0.62 * (1 - hipsT) },
  );

  // Legs, digitigrade: upper, lower and metapodial bones, then a toe segment flat on the floor under a broad paw.
  // Front: the humerus slopes back to the elbow, the forearm stands straight, the wrist flexes forward. Hind: the
  // femur runs forward to the knee, the shank back to a high hock, the long metatarsal down to the ball.
  const toeR = 0.03;
  const legs: { chain: Chain; front: boolean; s: number }[] = [];
  for (const [s, side] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const front = b.chain(
      `legF${side}`,
      [
        [s * 0.1, 0.45, 0.3],
        [s * 0.105, 0.26, 0.23],
        [s * 0.105, 0.085, 0.265],
        [s * 0.105, toeR, 0.33],
        [s * 0.105, toeR, 0.41],
      ],
      {
        parent: spine.joints[2],
        names: ["shoulder", "elbow", "wrist", "paw"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.105, 0, 0.38],
        group: `legF${side}`,
      },
    );
    const hind = b.chain(
      `legH${side}`,
      [
        [s * 0.11, 0.47, -0.33],
        [s * 0.12, 0.3, -0.2],
        [s * 0.12, 0.14, -0.34],
        [s * 0.12, toeR, -0.28],
        [s * 0.12, toeR, -0.2],
      ],
      {
        parent: hips,
        names: ["hip", "knee", "hock", "foot"].map((n) => n + side),
        role: "leg",
        contact: [s * 0.12, 0, -0.23],
        group: `legH${side}`,
      },
    );
    legs.push({ chain: front, front: true, s }, { chain: hind, front: false, s });
  }

  for (const { chain, front, s } of legs) {
    const [, t1, t2, t3] = chain.ts;
    // Heavy upper leg, thick furry forearm or shank, slimming into the ankle; ry runs front to back.
    const keys: [number, number, number][] = front
      ? [
          [0, 0.068, 0.085],
          [t1, 0.056, 0.062],
          [t2, 0.044, 0.046],
          [t3, toeR, toeR],
        ]
      : [
          [0, 0.09, 0.12],
          [t1, 0.058, 0.07],
          [t2, 0.04, 0.05],
          [t3, toeR, toeR],
        ];
    const radius = (t: number): [number, number] => {
      const i = Math.min(keys.findIndex((k) => k[0] > t) - 1, 2);
      const [ta, xa, ya] = keys[i < 0 ? 2 : i];
      const [tb, xb, yb] = keys[i < 0 ? 3 : i + 1];
      const k = Math.min(Math.max((t - ta) / (tb - ta), 0), 1);
      const e = k * k * (3 - 2 * k);
      return [xa + (xb - xa) * e, ya + (yb - ya) * e];
    };
    const legTube = b.sweep(chain, radius, {
      to: t3,
      color: FUR,
      sides: 10,
      caps: { start: "round", end: "flat" },
    });

    // Paw: a broad flattened pad on the toe joint, four toes in front of it, bottoms on the floor.
    const paw = chain.joints[3];
    const heel = chain.at(t3).at;
    const tip = chain.at(1).at;
    const pawH = 0.034;
    b.sweep(
      [
        [heel.x, pawH, heel.z - 0.03],
        [tip.x, pawH, tip.z - 0.03],
      ],
      () => [0.054, pawH],
      { bone: paw, color: PAW, sides: 10 },
    );
    for (const [dx, dz] of [
      [-0.034, -0.014],
      [-0.012, 0],
      [0.012, 0],
      [0.034, -0.014],
    ]) {
      b.part(new SphereGeometry(0.022, 7, 5), PAW, {
        bone: paw,
        at: [tip.x + dx * s, 0.022 * 0.85, tip.z + dz],
        scale: [1, 0.85, 1.15],
        group: chain.name,
      });
    }
    // Solid spots on the outer upper leg.
    const legSkin = b.surface(legTube);
    for (const hit of legSkin.scatter(front ? 7 : 9, {
      rng: random,
      minDist: 0.045,
      filter: (h) => h.n.x * s > 0.2 && h.at.y > 0.14,
    }))
      b.stick(new CylinderGeometry(0.012, 0.012, 0.005, 7), SPOT, hit, {
        embed: 0.5,
        scale: 0.7 + random() * 0.6,
      });
  }

  // Head: a region on the skull joint, +Z forward and +Y up in head units.
  const headDir: V3 = [0, -0.12, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, scale: HEAD_SCALE, quat: aim(headDir, [0, 1, 0], "z") });
  // A domed cranium and a short, broad muzzle.
  const cranium = b.loft(
    [
      { at: head.p([0, 0.02, -0.05]), w: head.s(0.16), h: head.s(0.15) },
      { at: head.p([0, 0.04, 0.03]), w: head.s(0.2), h: head.s(0.18) },
      { at: head.p([0, 0.03, 0.1]), w: head.s(0.18), h: head.s(0.15) },
      { at: head.p([0, 0.0, 0.15]), w: head.s(0.13), h: head.s(0.11) },
      { at: head.p([0, -0.01, 0.18]), w: head.s(0.105), h: head.s(0.08) },
    ],
    { bone: skull, color: FUR, sectors: [[135, 225, BELLY]], sides: 12, group: "head" },
  );
  const face = b.surface(cranium);
  const front = (x: number, y: number) => face.ray(head.p([x, y, 0.4]), head.d([0, 0, -1]));
  for (const s of [1, -1]) {
    // Full cheeks and white whisker pads dotted with dark follicles.
    head.part(new SphereGeometry(0.046, 8, 6), FUR, {
      at: [s * 0.056, -0.02, 0.055],
      scale: [0.85, 0.8, 1.35],
      group: "head",
    });
    const pad = head.part(new SphereGeometry(0.03, 8, 6), BELLY, {
      at: [s * 0.028, -0.03, 0.176],
      scale: [1, 0.85, 0.85],
      group: "head",
    });
    const padSkin = b.surface(pad);
    for (const [az, el] of [
      [40, 18],
      [58, 12],
      [34, 0],
      [52, -4],
      [68, 2],
    ]) {
      const dot = padSkin.around(pad.at).at(s * az, el);
      if (dot) b.stick(new SphereGeometry(0.0028, 4, 3), SPOT, dot, { embed: 0.4, bone: skull });
    }
    // Whiskers fanning out and back from each pad.
    for (let i = 0; i < 4; i++) {
      const root = head.p([s * 0.038, -0.026 - i * 0.006, 0.174 - i * 0.004]);
      const dir = head.d([s * 1, 0.12 - i * 0.12, -0.25]);
      b.spike(root, dir, head.s(0.13 - i * 0.012), head.s(0.0025), { bone: skull, color: BELLY, sides: 4 });
    }
    // Eye: a pale green iris set into the face along its gaze, a round pupil and catchlight on its front, and a
    // thin dark rim.
    const gaze = head.d([s * 0.4, 0.1, 1]);
    const eyeR = 0.021 * HEAD_SCALE;
    const socket = front(s * 0.048, 0.045);
    if (!socket) throw new Error("snowLeopard: no face under the eye");
    const iris = b.part(new SphereGeometry(eyeR, 10, 7), IRIS, {
      bone: skull,
      at: offset(socket, gaze, -eyeR * 0.3),
      dir: gaze,
      axis: "z",
      scale: [1, 1, 0.75],
      group: "head",
    });
    b.part(new SphereGeometry(eyeR * 0.5, 7, 5), PUPIL, {
      frame: iris.moved([0, 0, eyeR * 0.62]),
      bone: skull,
      scale: [0.9, 1, 0.4],
      group: "head",
    });
    b.part(new SphereGeometry(eyeR * 0.17, 5, 4), "#ffffff", {
      at: iris.local([-s * eyeR * 0.28, eyeR * 0.34, eyeR * 0.74]),
      bone: skull,
      group: "head",
    });
    b.part(new TorusGeometry(eyeR * 1.02, 0.003, 4, 12), LIP, {
      frame: iris,
      bone: skull,
      group: "head",
    });
    // Tear line from the inner eye corner down the side of the muzzle.
    b.capsule(
      iris.local([-s * eyeR * 0.6, -eyeR * 0.7, eyeR * 0.3]),
      head.p([s * 0.036, -0.004, 0.16]),
      head.s(0.0035),
      {
        bone: skull,
        color: SPOT,
      },
    );

    // Ears: small and rounded, set wide; dark backs with a pale patch, pale fur inside.
    const c: V3 = [s * 0.075, 0.095, 0.015];
    const ex: V3 = [s * 0.94, -0.34, 0];
    const ey: V3 = [s * 0.3, 0.95, -0.12];
    const ear = (r: number, dz: number): V3[] => {
      const pts: V3[] = [];
      for (let i = 0; i <= 8; i++) {
        const a = (Math.PI * i) / 8;
        const cx = Math.cos(a) * r;
        const cy = Math.sin(a) * r;
        pts.push([c[0] + ex[0] * cx + ey[0] * cy, c[1] + ex[1] * cx + ey[1] * cy, c[2] + ex[2] * cx + ey[2] * cy + dz]);
      }
      return pts;
    };
    b.slab(
      ear(0.036, 0).map((p) => head.p(p)),
      { thickness: head.s(0.014), color: SPOT, bone: skull, group: "head" },
    );
    b.slab(
      ear(0.026, 0.009).map((p) => head.p(p)),
      { thickness: head.s(0.006), color: EAR_IN, bone: skull, group: "head" },
    );
    b.slab(
      ear(0.016, -0.009).map((p) => head.p(p)),
      { thickness: head.s(0.004), color: FUR, bone: skull, group: "head" },
    );
  }

  // Nose leather and the dark philtrum under it.
  const noseHit = front(0, 0.004);
  if (!noseHit) throw new Error("snowLeopard: no muzzle under the nose");
  // A faceted triangular nose leather, point down.
  b.stick(new CylinderGeometry(0.016 * HEAD_SCALE, 0.021 * HEAD_SCALE, 0.012, 3), NOSE, noseHit, {
    embed: 0.35,
    flow: head.d([0, -1, 0]),
    scale: [1.15, 1, 0.8],
    bone: skull,
  });
  b.capsule(head.p([0, -0.012, 0.19]), head.p([0, -0.034, 0.188]), head.s(0.0035), { bone: skull, color: LIP });
  // Upper canines under the muzzle.
  for (const s of [1, -1])
    b.spike(head.p([s * 0.026, -0.042, 0.17]), head.d([0, -1, 0.1]), head.s(0.024), head.s(0.006), {
      bone: skull,
      color: TOOTH,
    });

  // Lower jaw: its own joint, a white chin, a tongue and lower canines.
  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.035, 0.04],
    aim: [0, -0.055, 0.165],
    role: "jaw",
    group: "jaw",
  });
  b.sweep([jaw.at, head.p([0, -0.058, 0.165])], (t) => [head.s(0.05 - 0.018 * t), head.s(0.02 - 0.003 * t)], {
    bone: jaw,
    color: BELLY,
    sides: 8,
    group: "jaw",
  });
  b.sweep([head.p([0, -0.045, 0.07]), head.p([0, -0.05, 0.145])], (t) => [head.s(0.024 - 0.006 * t), head.s(0.008)], {
    bone: jaw,
    color: TONGUE,
    group: "jaw",
  });
  for (const s of [1, -1])
    b.spike(head.p([s * 0.02, -0.05, 0.157]), head.d([0, 1, 0.05]), head.s(0.017), head.s(0.005), {
      bone: jaw,
      color: TOOTH,
    });

  // Solid spots on the forehead and crown.
  const crown = b.surface(cranium);
  for (const hit of crown.scatter(36, {
    rng: random,
    minDist: 0.014,
    filter: (h) => h.n.y > 0.4,
  }))
    b.stick(new CylinderGeometry(0.0038, 0.0038, 0.003, 6), SPOT, hit, {
      embed: 0.5,
      scale: 0.55 + random() * 0.8,
    });

  // Broken rosettes: two or three dark arcs around a slightly darker centre, stuck on the skin so they bend with it.
  const rosette = (hit: FrameInput, r: number, tube: number) => {
    b.stick(new CylinderGeometry(r * 0.75, r * 0.75, 0.004, 8), ROSE_FILL, hit, { embed: 0.5 });
    const arcs = 2 + Math.floor(random() * 2);
    let start = random() * 360;
    for (let i = 0; i < arcs; i++) {
      const sweepDeg = 360 / arcs - 30 - random() * 25;
      const geo = new TorusGeometry(r, tube, 3, 6, (sweepDeg * Math.PI) / 180).rotateX(Math.PI / 2);
      b.stick(geo, ROSETTE, hit, { embed: 0.4, spin: start, scale: [1, 0.5, 1] });
      start += 360 / arcs;
    }
  };
  const skin = b.surface(body);
  const tailSkin = b.surface(tailBody);
  for (const hit of skin.scatter(60, {
    rng: random,
    minDist: 0.065,
    filter: (h) => h.n.y > -0.25 && h.at.z < 0.52 && h.at.z > -0.45,
  }))
    rosette(hit, 0.024 + random() * 0.012, 0.0055);
  for (const hit of tailSkin.scatter(14, {
    rng: random,
    minDist: 0.07,
    filter: (h) => h.n.y > -0.3 && h.at.z > -0.93 && h.at.z < -0.6,
  }))
    rosette(hit, 0.022 + random() * 0.008, 0.005);

  // Rest pose: the mouth just open so the two jaws read apart.
  b.pose(jaw, { axis: [1, 0, 0], deg: 8 });

  return b.root;
}
