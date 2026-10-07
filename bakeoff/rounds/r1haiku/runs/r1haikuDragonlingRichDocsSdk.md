```ts
import * as THREE from "three";
import { createBuilder, catmull, countershade, polyline, scales, spots } from "agentic-3js-builder";
import type { OutlinePoint } from "agentic-3js-builder";

const TEAL = "#2aa597";
const TEAL_DEEP = "#17766d";
const BELLY = "#ecd28a";
const SPINE = "#f0892e";
const HORN = "#f4ead2";
const TEETH = "#fff7e6";
const CLAW = "#f6efdc";
const AMBER = "#ffae2e";
const PUPIL = "#1c1410";
const WING = "#f5b65a";
const SMOKE = "#dfe4ea";
const SHELL = "#efe4cc";
const SPECK = "#8c6a4c";
const SPADE = "#f2a93b";

const COAT = countershade(scales(TEAL, TEAL_DEEP, { size: 0.021, width: 0.003 }), BELLY, { level: -0.1 });
const EGG = spots(SHELL, SPECK, { size: 0.025, amount: 0.35, seed: 4 });

export const meta = {
  name: "Baby dragon",
  description: "A cat-sized teal baby dragon with amber wings and spines, beside its speckled broken eggshell.",
};

export default function build() {
  const b = createBuilder({ name: "baby-dragon" });

  // ---- skeleton -----------------------------------------------------------
  const hips = b.joint("hips", { at: [0, 0.07, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.07, 0],
      [0, 0.14, 0.014],
      [0, 0.21, 0.035],
      [0, 0.27, 0.056],
    ]),
    { parent: hips, names: ["spine1", "spine2", "spine3"], role: "spine" },
  );
  const neck = b.chain(
    "neck",
    catmull([
      [0, 0.25, 0.056],
      [0, 0.32, 0.1],
      [0, 0.39, 0.14],
    ]),
    { parent: spine.joints[2], names: ["neck1", "neck2"], role: "neck" },
  );
  const head = b.joint("head", {
    parent: neck.joints[1],
    at: [0, 0.43, 0.17],
    aim: [0, 0.49, 0.24],
    role: "head",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: head.local({ forward: -0.014, up: -0.035 }),
    aim: head.local({ forward: 0.105, up: -0.056 }),
    role: "jaw",
  });
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.07, -0.014],
      [0, 0.063, -0.112],
      [0, 0.042, -0.21],
      [0, 0.049, -0.266],
    ]),
    { parent: hips, names: ["tail1", "tail2", "tail3"], role: "tail" },
  );

  // ---- body, neck, tail ---------------------------------------------------
  const body = b.sweep(spine, (t: number) => 0.06 + 0.021 * Math.sin(Math.PI * (0.15 + 0.7 * t)), { color: COAT });
  b.along(
    body,
    7,
    (at) => {
      b.spike(at, at, 0.035, 0.011, { color: SPINE });
    },
    { from: 0.12, to: 0.82 },
  );

  const neckSweep = b.sweep(neck, (t: number) => 0.04 - 0.013 * t, { color: COAT });
  b.along(
    neckSweep,
    2,
    (at) => {
      b.spike(at, at, 0.022, 0.008, { color: SPINE });
    },
    { from: 0.3, to: 0.8 },
  );

  const tailSweep = b.sweep(tail, (t: number) => 0.032 - 0.02 * t, { color: COAT });
  b.along(
    tailSweep,
    4,
    (at) => {
      b.spike(at, at, 0.021, 0.007, { color: SPINE });
    },
    { from: 0.15, to: 0.75 },
  );

  // Spade at the tail tip, drawn in the tail's side plane.
  const spadeOutline: OutlinePoint[] = [
    [0, 0],
    [0.014, 0.014],
    [0.035, 0.032],
    [0.06, 0.021],
    [0.07, 0],
    [0.06, -0.021],
    [0.035, -0.032],
    [0.014, -0.014],
  ];
  const tipPoint = tail.at(1);
  b.extrude(spadeOutline, {
    at: tipPoint.at,
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.008,
    bevel: 0.002,
    smoothing: 1,
    color: SPADE,
  });

  // ---- head ---------------------------------------------------------------
  const skull = b.loft(
    [
      { at: head.local({ forward: -0.03, up: 0.0 }), w: 0.085, h: 0.085 },
      { at: head.local({ forward: 0.014, up: 0.007 }), w: 0.09, h: 0.09 },
      { at: head.local({ forward: 0.05, up: -0.007 }), w: 0.07, h: 0.063 },
      { at: head.local({ forward: 0.085, up: -0.021 }), w: 0.05, h: 0.046 },
      { at: head.local({ forward: 0.105, up: -0.025 }), w: 0.035, h: 0.035 },
    ],
    { bone: head, color: COAT },
  );

  const jawMesh = b.loft(
    [
      { at: head.local({ forward: -0.007, up: -0.035 }), w: 0.056, h: 0.021 },
      { at: head.local({ forward: 0.05, up: -0.035 }), w: 0.042, h: 0.018 },
      { at: head.local({ forward: 0.09, up: -0.035 }), w: 0.025, h: 0.015 },
    ],
    { bone: jaw, color: BELLY },
  );
  void jawMesh;

  const skin = b.surface(skull);

  for (const s of [1, -1]) {
    // big amber eyes with slit pupils
    const eyeHit = skin.nearest(head.local({ forward: 0.02, right: s * 0.032, up: 0.025 }));
    b.stick(new THREE.SphereGeometry(0.021, 10, 8), AMBER, eyeHit, { embed: 0.25 });
    b.stick(new THREE.SphereGeometry(0.01, 6, 4).scale(0.5, 1, 1), PUPIL, eyeHit.moved([0, 0.014, 0]));

    // stubby swept-back horns
    const hornHit = skin.nearest(head.local({ forward: -0.014, right: s * 0.025, up: 0.046 }));
    b.spike(hornHit, [-s * 0.25, 0.9, -0.35], 0.04, 0.012, { color: HORN });
  }

  // grin: upper teeth hang from the snout, lower teeth rise from the jaw
  for (const f of [0.035, 0.06, 0.085]) {
    for (const r of [-0.018, -0.006, 0.006, 0.018]) {
      b.spike(head.local({ forward: f, right: r, up: -0.04 }), [0, -1, 0], 0.013, 0.0035, {
        bone: head,
        color: TEETH,
      });
    }
  }
  for (const f of [0.03, 0.055, 0.08]) {
    for (const r of [-0.015, 0.015]) {
      b.spike(head.local({ forward: f, right: r, up: -0.03 }), [0, 1, 0], 0.01, 0.0035, {
        bone: jaw,
        color: TEETH,
      });
    }
  }

  // smoke wisp from one nostril
  const N = head.local({ forward: 0.1, right: 0.008, up: -0.008 });
  const n = [N.x, N.y, N.z];
  const P = (dx: number, dy: number, dz: number) => [n[0] + dx, n[1] + dy, n[2] + dz];
  const smokePath = catmull([P(0, 0, 0), P(0.008, 0.02, 0.007), P(0.014, 0.05, 0.02), P(0, 0.077, 0.02), P(-0.014, 0.1, 0)]);
  b.sweep(smokePath, (t: number) => 0.004 + 0.007 * t, { bone: head, color: SMOKE });
  b.part(new THREE.SphereGeometry(0.017, 7, 5), SMOKE, { bone: head, at: P(-0.018, 0.11, 0) });

  // ---- legs, feet, arms, hands -------------------------------------------
  for (const s of [1, -1]) {
    const S = s === 1 ? "L" : "R";

    // folded hind leg, sitting
    const leg = b.chain(
      `leg${S}`,
      catmull([
        [s * 0.063, 0.07, 0],
        [s * 0.105, 0.042, 0.126],
        [s * 0.063, 0.021, 0.168],
      ]),
      { parent: hips, names: [`hip${S}`, `knee${S}`, `ankle${S}`], role: "leg" },
    );
    b.sweep(leg, (t: number) => 0.035 - 0.01 * t, { color: COAT });
    const ankle = leg.tip!;
    b.part(new THREE.SphereGeometry(0.032, 8, 6).scale(1, 0.5, 1.35), TEAL, {
      bone: ankle,
      at: [s * 0.063, 0.017, 0.178],
    });
    for (const k of [-0.016, 0, 0.016]) {
      b.capsule([s * 0.063 + k, 0.011, 0.19], [s * 0.063 + k * 1.3, 0.009, 0.214], 0.009, {
        bone: ankle,
        color: CLAW,
      });
    }

    // small front arm with a three-clawed hand
    const arm = b.chain(
      `arm${S}`,
      catmull([
        [s * 0.06, 0.19, 0.05],
        [s * 0.077, 0.126, 0.119],
        [s * 0.067, 0.091, 0.14],
      ]),
      { names: [`armUp${S}`, `armFore${S}`, `hand${S}`], role: "arm" },
    );
    b.sweep(arm, (t: number) => 0.017 - 0.004 * t, { color: COAT });
    const hand = arm.tip!;
    b.part(new THREE.SphereGeometry(0.021, 8, 6), TEAL, { bone: hand, at: [s * 0.067, 0.088, 0.144] });
    for (const k of [-0.009, 0, 0.009]) {
      b.spike([s * 0.067 + k, 0.083, 0.158], [0, -0.4, 1], 0.013, 0.0035, { bone: hand, color: CLAW });
    }

    // oversized wing, spread but not flying
    const wing = b.chain(
      `wing${S}`,
      catmull([
        [s * 0.056, 0.21, 0.028],
        [s * 0.14, 0.25, 0],
        [s * 0.25, 0.21, -0.042],
      ]),
      { parent: spine.joints[1], names: [`wingRoot${S}`, `wingElbow${S}`, `wingWrist${S}`], role: "wing" },
    );
    const wrist = [s * 0.25, 0.21, -0.042];
    const tips = [
      [s * 0.39, 0.14, -0.098],
      [s * 0.364, 0.21, -0.19],
      [s * 0.28, 0.294, -0.175],
    ];
    const fingers = tips.map((tp, i) =>
      b.chain(`finger${S}${i}`, polyline([wrist, tp]), {
        parent: wing.tip!,
        names: [`digit${S}${i}`],
        role: "digit",
      }),
    );
    b.membrane(fingers[0], fingers[1], { color: WING, thickness: 0.008, scallop: 0.15 });
    b.membrane(fingers[1], fingers[2], { color: WING, thickness: 0.008, scallop: 0.15 });
    b.membrane(fingers[2], polyline([wrist, [s * 0.063, 0.14, -0.028]]), {
      color: WING,
      thickness: 0.008,
      bone: wing.tip!,
    });
  }

  // ---- egg shell beside the dragon ---------------------------------------
  const shell: OutlinePoint[] = [
    [0, 0],
    [0.05, 0],
    [0.06, 0.021],
    [0.062, 0.06],
    [0.057, 0.085],
    [0.056, 0.1, "sharp"],
    [0.049, 0.086],
    [0.046, 0.107, "sharp"],
    [0.042, 0.085],
    [0.038, 0.096, "sharp"],
    [0.04, 0.06],
    [0.046, 0.021],
    [0.044, 0.007],
    [0, 0.007],
  ];
  b.lathe(shell, {
    at: [-0.154, 0, 0],
    axis: [0, 1, 0],
    segments: 14,
    smoothing: 0,
    color: EGG,
  });

  const shard: OutlinePoint[] = [
    [0, 0],
    [0.021, 0],
    [0.008, 0.032, "sharp"],
  ];
  b.extrude(shard, {
    at: [-0.216, 0, 0.07],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.005,
    color: EGG,
  });

  // ---- spines on the back, tail spade already placed ---------------------
  void skin;

  return b.root;
}
```