import * as THREE from "three";
import { createBuilder, catmull, paint, rng } from "../../../../src/index";

const SUN = "#f7c52b";
const DEEP = "#e0951a";
const INK = "#3b2a14";
const WHITE = "#fbf6e6";
const ORANGE = "#ee7a2a";
const FIN = "#fff1b8";
const GRASS = "#4aa548";
const GRASS_DARK = "#2f7d3a";

export const meta = {
  name: "seahorse",
  description:
    "A sunny yellow seahorse with thin dark lines, white freckles, a crown of spikes, a tube snout, a fluttering dorsal fin and big eyes, curling its tail around a seagrass strand.",
};

// Body thickness along the trunk (t = 0 at the hips, 1 at the neck).
const bodyR = (t: number) => 0.018 + 0.024 * Math.sin(Math.PI * t) * (1 - 0.3 * t);

export default function build() {
  const b = createBuilder({ name: "seahorse" });

  // Thin dark longitudinal lines round the body and tail.
  const lined = paint((_p, _n, s) => (((s[1] % 40) + 40) % 40 < 1.6 ? INK : SUN));

  // ---- Skeleton: hips, curved trunk, neck and head ----
  const hips = b.joint("hips", { at: [0, 0.09, 0], role: "spine" });
  const torso = catmull([
    [0, 0.09, 0],
    [0, 0.125, 0.012],
    [0, 0.16, 0.024],
    [0, 0.195, 0.03],
    [0, 0.225, 0.036],
  ]);
  const spine = b.chain("spine", torso, {
    parent: hips,
    names: ["torso1", "torso2", "torso3", "neck"],
    role: "spine",
  });
  const neck = spine.joints[3];

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.248, 0.046],
    dir: [0, 0.4, 1],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: 0.03, up: -0.012 }),
    aim: head.local({ forward: 0.11, up: -0.022 }),
    role: "jaw",
  });

  // ---- Body: ridged trunk with rings and a lined skin ----
  const body = b.sweep(spine, (t) => bodyR(t), { section: { ngon: 8 }, color: lined });

  b.along(spine, 11, (at) => {
    b.part(new THREE.TorusGeometry(bodyR(at.t) + 0.001, 0.0045, 4, 12), DEEP, {
      at: at.at,
      dir: at.tangent,
      axis: "z",
    });
  }, { from: 0.08, to: 0.92 });

  // White freckles scattered over the trunk.
  for (const hit of b.surface(body).scatter(26, { rng: rng(7), minDist: 0.024 })) {
    b.stick(new THREE.SphereGeometry(0.0038, 5, 4), WHITE, hit, { embed: 0.3 });
  }

  // ---- Head, snout and eyes ----
  b.part(new THREE.SphereGeometry(0.034, 12, 9), SUN, { bone: head, at: head });

  b.rod(
    head.local({ forward: 0.02, up: 0.008 }),
    head.local({ forward: 0.115, up: 0.004 }),
    [0.013, 0.006],
    { bone: head, color: SUN },
  );
  b.rod(jaw, head.local({ forward: 0.105, up: -0.024 }), [0.01, 0.004], { bone: jaw, color: SUN });

  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.02, 10, 8), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.028, up: 0.012, forward: 0.012 }),
    });
    b.part(new THREE.SphereGeometry(0.011, 8, 6), INK, {
      bone: head,
      at: head.local({ left: s * 0.044, up: 0.014, forward: 0.017 }),
    });
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), WHITE, {
      bone: head,
      at: head.local({ left: s * 0.05, up: 0.02, forward: 0.02 }),
    });
  }

  // Crown of spikes running back over the skull.
  for (let i = 0; i < 4; i++) {
    const a = ((15 + i * 28) * Math.PI) / 180;
    const base = head.local({ up: 0.031 * Math.cos(a), back: 0.031 * Math.sin(a) });
    const len = 0.04 - i * 0.006;
    b.spike(base, [0, Math.cos(a) + 0.5, -Math.sin(a)], len, 0.007, { bone: head, color: ORANGE });
  }

  // ---- Fins ----
  // Dorsal fin: a thin sail in the YZ plane standing up off the back, scalloped behind.
  b.extrude(
    [
      [-0.01, 0],
      [0.02, 0.06],
      [0.09, 0.12, "sharp"],
      [0.1, 0.09],
      [0.085, 0.075],
      [0.11, 0.05, "sharp"],
      [0.08, 0.03],
      [0.06, 0],
    ],
    {
      at: spine.at(0.3).at,
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: [0.003, 0.0015],
      smoothing: 1,
      color: FIN,
      bone: spine.jointAt(0.3),
    },
  );

  // Small pectoral fins, mirrored, flat in the XY plane on each flank.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.015, 0],
        [0.06, 0.02],
        [0.065, 0.04],
        [0.035, 0.045],
        [0.015, 0.03],
      ],
      {
        at: spine.at(0.4).at,
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.003,
        smoothing: 1,
        color: FIN,
        bone: spine.jointAt(0.4),
      },
    );
  }

  // ---- Curled tail wrapped round the seagrass strand ----
  const cx = 0.07;
  const cz = -0.02;
  const R = 0.026;
  const tailPts: number[][] = [[0, 0.085, 0]];
  for (let k = 0; k <= 9; k++) {
    const th = Math.PI * 0.9 + (k * Math.PI * 2 * 1.8) / 9;
    const y = 0.074 - 0.0048 * k;
    tailPts.push([cx + R * Math.cos(th), y, cz + R * Math.sin(th)]);
  }
  const tail = b.chain("tail", catmull(tailPts), { parent: hips, count: 8, role: "tail" });
  b.sweep(tail, (t) => 0.012 - 0.0075 * t, {
    color: lined,
    caps: { end: "point" },
  });

  // ---- Seagrass strand the tail holds ----
  b.sweep(
    catmull([
      [cx, 0, cz],
      [cx + 0.002, 0.12, cz + 0.002],
      [cx - 0.002, 0.24, cz - 0.001],
      [cx + 0.004, 0.34, cz],
      [cx + 0.005, 0.37, cz + 0.001],
    ]),
    [0.009, 0.002],
    { color: GRASS, caps: { start: "flat", end: "point" } },
  );
  b.sweep(
    catmull([
      [cx, 0, cz + 0.004],
      [cx - 0.02, 0.1, cz + 0.006],
      [cx - 0.03, 0.18, cz + 0.01],
    ]),
    [0.007, 0.001],
    { color: GRASS_DARK, caps: { start: "flat", end: "point" } },
  );

  return b.root;
}
