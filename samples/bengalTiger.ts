import { CylinderGeometry, SphereGeometry, TorusGeometry } from "three";
import { createBuilder } from "../src/builder";
import { aim, offset, rng } from "../src/math";
import type { V3 } from "../src/math";
import type { Chain } from "../src/skeleton";
import { catmull } from "../src/path";
import { countershade, spots, stripes } from "../src/paint";

export const meta = {
  name: "Bengal Tiger",
  description:
    "A full-size Bengal tiger in a quiet standing rest pose: orange-and-black striped coat, white belly and cheeks, spotted ears, heavy paws, whiskered broad head, open jaw with fangs, and a long ringed tail.",
  builtBy: "GPT-6 Astra",
};

const ORANGE = "#d96a19";
const ORANGE_LIT = "#ef8a24";
const BLACK = "#171319";
const BELLY = "#f5e3c1";
const PAW = "#c99a75";
const NOSE = "#3b2022";
const EYE = "#c8a43a";
const PUPIL = "#120e12";
const TOOTH = "#fff4d5";
const TONGUE = "#b84c58";
const INNER_EAR = "#e8a08c";

const COAT = countershade(
  stripes(ORANGE_LIT, BLACK, { size: 0.19, width: 0.32, wobble: 0.18, axis: [0, 0, 1] }),
  BELLY,
  { level: -0.24 },
);
const LEG_COAT = countershade(
  stripes(ORANGE, BLACK, { size: 0.16, width: 0.24, wobble: 0.12, axis: [0, 1, 0] }),
  BELLY,
  { level: -0.42 },
);
const FACE_COAT = countershade(
  stripes(ORANGE_LIT, BLACK, { size: 0.17, width: 0.28, wobble: 0.1, axis: [0, 0, 1] }),
  BELLY,
  { level: -0.18 },
);
const EAR_SPOTS = spots(INNER_EAR, BLACK, { size: 0.028, amount: 0.42, seed: 9 });

export default function build() {
  const b = createBuilder({ name: "bengalTiger", detail: 0.9, paintSize: 2048 });
  const random = rng(17);

  // The whole back-to-neck curve is authored once. Tail and torso share its joints, so the skin never seams.
  const stations = [
    { at: [0, 0.82, -1.95], w: 0.13, h: 0.18 },
    { at: [0, 0.84, -1.62], w: 0.18, h: 0.23 },
    { at: [0, 0.86, -1.25], w: 0.23, h: 0.29 },
    { at: [0, 0.88, -0.82], w: 0.43, h: 0.42 },
    { at: [0, 0.91, -0.5], w: 0.56, h: 0.54 },
    { at: [0, 0.96, -0.15], w: 0.62, h: 0.64 },
    { at: [0, 1.0, 0.18], w: 0.64, h: 0.66 },
    { at: [0, 1.04, 0.43], w: 0.57, h: 0.58 },
    { at: [0, 1.1, 0.63], w: 0.44, h: 0.45 },
    { at: [0, 1.16, 0.77], w: 0.3, h: 0.32 },
  ] as const;
  const curve = catmull(stations.map((s) => s.at));
  const hipsT = curve.knots[4];
  const hips = b.joint("hips", { at: stations[4].at, role: "spine", group: "body" });
  const spine = b.chain("spine", curve.slice(hipsT, 1), {
    parent: hips,
    count: 5,
    names: ["lumbar", "chest", "shoulders", "neckBase", "neckTop"],
    role: "spine",
    group: "body",
  });
  const tail = b.chain("tail", curve.slice(hipsT, 0), {
    parent: hips,
    count: 9,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tail6", "tail7", "tail8", "tail9"],
    role: "tail",
    group: "tail",
  });

  // Faceted torso with a warm orange back and a substantial white underside.
  b.loft(stations, {
    bone: [tail, hips, spine],
    from: hipsT,
    to: 1,
    color: COAT,
    sectors: [
      [-58, 58, ORANGE_LIT],
      [124, 236, BELLY],
    ],
    sides: 10,
    group: "body",
  });
  b.sweep(tail, (t) => 0.13 * (1 - t) ** 0.55 + 0.032, {
    color: COAT,
    bands: [
      [0.16, BLACK],
      [0.25, COAT],
      [0.38, BLACK],
      [0.47, COAT],
      [0.6, BLACK],
      [0.7, COAT],
      [0.82, BLACK],
      [0.91, BLACK],
    ],
    sides: 9,
    group: "tail",
  });

  // Four weighty digitigrade legs, ending in broad paw pads and separate toes.
  const legs: { chain: Chain; front: boolean; side: number }[] = [];
  for (const [side, label] of [
    [1, "L"],
    [-1, "R"],
  ] as const) {
    const front = b.chain(
      `legF${label}`,
      [
        [side * 0.22, 1.02, 0.39],
        [side * 0.23, 0.69, 0.33],
        [side * 0.23, 0.3, 0.4],
        [side * 0.23, 0.09, 0.49],
        [side * 0.23, 0.045, 0.59],
      ],
      {
        parent: spine.joints[2],
        names: [`shoulder${label}`, `elbow${label}`, `wrist${label}`, `frontPaw${label}`],
        role: "leg",
        contact: [side * 0.23, 0, 0.55],
        group: `legF${label}`,
      },
    );
    const hind = b.chain(
      `legH${label}`,
      [
        [side * 0.24, 0.93, -0.42],
        [side * 0.27, 0.64, -0.56],
        [side * 0.26, 0.3, -0.68],
        [side * 0.26, 0.09, -0.58],
        [side * 0.26, 0.045, -0.48],
      ],
      {
        parent: hips,
        names: [`hip${label}`, `knee${label}`, `hock${label}`, `hindPaw${label}`],
        role: "leg",
        contact: [side * 0.26, 0, -0.52],
        group: `legH${label}`,
      },
    );
    legs.push({ chain: front, front: true, side }, { chain: hind, front: false, side });
  }

  for (const { chain, front, side } of legs) {
    const end = chain.joints[3];
    const tube = b.sweep(
      chain,
      (t) => {
        const r = front ? 0.105 - 0.054 * t : 0.14 - 0.075 * t;
        return [r * 0.86, r];
      },
      { to: chain.ts[chain.ts.length - 2], color: LEG_COAT, sides: 9, group: chain.name },
    );
    const heel = chain.at(chain.ts[chain.ts.length - 2]).at;
    const toe = chain.at(1).at;
    const pawH = 0.048;
    b.sweep(
      [
        [heel.x, pawH, heel.z - 0.035],
        [toe.x, pawH, toe.z + 0.015],
      ],
      () => [0.1, pawH],
      { bone: end, color: PAW, sides: 9, group: chain.name },
    );
    for (const [dx, dz] of [
      [-0.055, 0.02],
      [-0.018, 0.04],
      [0.018, 0.04],
      [0.055, 0.02],
    ]) {
      const p: V3 = [toe.x + side * dx, 0.032, toe.z + dz + 0.07];
      b.part(new SphereGeometry(0.031, 7, 5), PAW, {
        bone: end,
        at: p,
        scale: [1.25, 0.7, 1.55],
        group: chain.name,
      });
      b.spike(p, [0, -0.15, 1], 0.035, 0.012, { bone: end, color: BLACK, group: chain.name });
    }
    // Dark pads on the underside make the heavy feet read from the low hero camera.
    b.part(new SphereGeometry(0.06, 8, 5), BLACK, {
      bone: end,
      at: [toe.x, 0.025, toe.z + 0.035],
      scale: [1.15, 0.35, 1.25],
      group: chain.name,
    });
    const legSurface = b.surface(tube);
    for (const hit of legSurface.scatter(front ? 5 : 7, {
      rng: random,
      minDist: 0.08,
      filter: (h) => h.n.x * side > 0.3 && h.at.y > 0.25,
    }))
      b.stick(new CylinderGeometry(0.014, 0.014, 0.006, 7), BLACK, hit, { embed: 0.5, scale: 0.8 + random() * 0.5 });
  }

  // Broad head and cheeks, attached to the end of the spine.
  const headDir: V3 = [0, -0.1, 1];
  const skull = b.joint("head", {
    parent: spine.joints[4],
    at: curve.at(1),
    dir: headDir,
    role: "head",
    group: "head",
  });
  const head = b.region({ at: skull, scale: 1.28, quat: aim(headDir, [0, 1, 0], "z") });
  const cranium = b.loft(
    [
      { at: head.p([0, 0.04, -0.08]), w: head.s(0.22), h: head.s(0.2) },
      { at: head.p([0, 0.06, 0.01]), w: head.s(0.29), h: head.s(0.25) },
      { at: head.p([0, 0.04, 0.12]), w: head.s(0.26), h: head.s(0.22) },
      { at: head.p([0, 0.0, 0.22]), w: head.s(0.18), h: head.s(0.16) },
      { at: head.p([0, -0.01, 0.29]), w: head.s(0.14), h: head.s(0.11) },
    ],
    { bone: skull, color: FACE_COAT, sectors: [[132, 228, BELLY]], sides: 11, group: "head" },
  );
  const face = b.surface(cranium);
  const front = (x: number, y: number) => face.ray(head.p([x, y, 0.48]), head.d([0, 0, -1]));

  for (const side of [1, -1]) {
    head.part(new SphereGeometry(0.075, 9, 7), FACE_COAT, {
      at: [side * 0.08, -0.035, 0.18],
      scale: [1.08, 0.95, 1.32],
      group: "head",
    });
    const pad = head.part(new SphereGeometry(0.054, 9, 7), BELLY, {
      at: [side * 0.043, -0.07, 0.275],
      scale: [1.15, 0.9, 1.0],
      group: "head",
    });
    const padSkin = b.surface(pad);
    for (const [az, el] of [
      [38, 18],
      [54, 12],
      [32, 1],
      [50, -6],
    ]) {
      const dot = padSkin.around(pad.at).at(side * az, el);
      if (dot) b.stick(new SphereGeometry(0.0042, 5, 4), BLACK, dot, { embed: 0.4, bone: skull });
    }
    // Four long whiskers per cheek, deliberately sparse so the silhouette stays bold.
    for (let i = 0; i < 4; i++) {
      const root = head.p([side * 0.06, -0.06 - i * 0.01, 0.285 - i * 0.009]);
      b.spike(root, head.d([side * 1.05, 0.1 - i * 0.08, -0.22]), head.s(0.2 - i * 0.018), head.s(0.0032), {
        bone: skull,
        color: BELLY,
        sides: 4,
        group: "head",
      });
    }

    const gaze = head.d([side * 0.38, 0.08, 1]);
    const eyeR = head.s(0.028);
    const socket = front(side * 0.076, 0.076);
    if (!socket) throw new Error("bengalTiger: no face under the eye");
    const iris = b.part(new SphereGeometry(eyeR, 10, 7), EYE, {
      bone: skull,
      at: offset(socket, gaze, -eyeR * 0.35),
      dir: gaze,
      axis: "z",
      scale: [1.05, 0.92, 0.7],
      group: "head",
    });
    b.part(new SphereGeometry(eyeR * 0.42, 7, 5), PUPIL, {
      frame: iris.moved([0, 0, eyeR * 0.65]),
      bone: skull,
      scale: [0.85, 1.2, 0.45],
      group: "head",
    });
    b.part(new SphereGeometry(eyeR * 0.16, 5, 4), "#ffffff", {
      at: iris.local([-side * eyeR * 0.3, eyeR * 0.35, eyeR * 0.78]),
      bone: skull,
      group: "head",
    });
    b.part(new TorusGeometry(eyeR * 1.05, 0.0035, 4, 12), BLACK, { frame: iris, bone: skull, group: "head" });

    // Round ears with the characteristic dark ocelli / white ear spots.
    const earCenter: V3 = [side * 0.13, 0.16, 0.02];
    const ear = (r: number, dz: number): V3[] => {
      const points: V3[] = [];
      for (let i = 0; i <= 8; i++) {
        const a = (Math.PI * i) / 8;
        points.push(head.p([earCenter[0] + side * Math.cos(a) * r, earCenter[1] + Math.sin(a) * r, earCenter[2] + dz]));
      }
      return points;
    };
    b.slab(ear(0.062, 0), { thickness: head.s(0.018), color: BLACK, bone: skull, group: "head" });
    b.slab(ear(0.044, 0.012), { thickness: head.s(0.008), color: EAR_SPOTS, bone: skull, group: "head" });
    b.part(new SphereGeometry(0.012, 6, 4), BELLY, { bone: skull, at: head.p([side * 0.13, 0.17, 0.03]), group: "head" });
  }

  // Nose leather, mouth line, and the independently hinged lower jaw.
  const noseHit = front(0, 0.015);
  if (!noseHit) throw new Error("bengalTiger: no muzzle under nose");
  b.stick(new CylinderGeometry(head.s(0.024), head.s(0.03), head.s(0.016), 5), NOSE, noseHit, {
    embed: 0.35,
    flow: head.d([0, -1, 0]),
    scale: [1.2, 1, 0.8],
    bone: skull,
    group: "head",
  });
  b.capsule(head.p([0, -0.025, 0.295]), head.p([0, -0.055, 0.29]), head.s(0.005), { bone: skull, color: BLACK, group: "head" });
  for (const side of [1, -1])
    b.spike(head.p([side * 0.043, -0.06, 0.278]), head.d([0, -1, 0.08]), head.s(0.045), head.s(0.008), {
      bone: skull,
      color: TOOTH,
      group: "head",
    });

  const jaw = head.joint("jaw", {
    parent: skull,
    at: [0, -0.05, 0.13],
    aim: [0, -0.08, 0.3],
    role: "jaw",
    group: "jaw",
  });
  b.sweep([jaw.at, head.p([0, -0.085, 0.3])], (t) => [head.s(0.07 - 0.022 * t), head.s(0.024 - 0.004 * t)], {
    bone: jaw,
    color: BELLY,
    sides: 8,
    group: "jaw",
  });
  b.sweep([head.p([0, -0.067, 0.17]), head.p([0, -0.076, 0.27])], (t) => [head.s(0.031 - 0.009 * t), head.s(0.009)], {
    bone: jaw,
    color: TONGUE,
    sides: 8,
    group: "jaw",
  });
  for (const side of [1, -1])
    b.spike(head.p([side * 0.034, -0.078, 0.278]), head.d([0, 1, 0.05]), head.s(0.031), head.s(0.006), {
      bone: jaw,
      color: TOOTH,
      group: "jaw",
    });

  // A few dark forehead spots and cheek freckles complement the painted stripes.
  for (const hit of b.surface(cranium).scatter(28, {
    rng: random,
    minDist: 0.025,
    filter: (h) => h.n.y > 0.35 || (h.n.z > 0.35 && h.at.y > 1.1),
  }))
    b.stick(new CylinderGeometry(0.005, 0.005, 0.004, 6), BLACK, hit, { embed: 0.5, scale: 0.7 + random() * 0.7 });

  // Resting tiger: mouth is slightly open but all four feet stay planted.
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  return b.root;
}
