import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
} from "../../../../src/index";

export const meta = {
  name: "wind-walking beach creature",
  description:
    "A stylized Theo Jansen-inspired beach walker built from ivory tubes, black rotating joints, articulated stilt legs, crank linkages, and a tall wind-catching sail.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  const IVORY = "#e7dfc8";
  const IVORY_LIGHT = "#fff7df";
  const IVORY_DARK = "#b9ad91";
  const CHARCOAL = "#24282b";
  const GRAPHITE = "#41484b";
  const RUST = "#b86b42";
  const TURQUOISE = "#48aaa6";
  const SAND = "#d6b878";
  const RED = "#d94e3f";

  const tube = (a: any, c: any, r = 0.027, color = IVORY, extra: any = {}) =>
    b.rod(a, c, r, { color, sides: 8, caps: "flat", ...extra });

  const capsule = (a: any, c: any, r = 0.035, color = IVORY, extra: any = {}) =>
    b.capsule(a, c, r, { color, sides: 8, ...extra });

  const hub = (p: any, radius = 0.07, depth = 0.055, color = CHARCOAL, bone?: any) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, 12), color, {
      at: p,
      bone,
      dir: [1, 0, 0],
      name: "rotary-hub",
    });

  const pin = (p: any, radius = 0.018, color = IVORY_LIGHT, bone?: any) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      bone,
      name: "joint-pin",
    });

  // Root and main thoracic spine. The creature is long, narrow, and elevated like a beach machine.
  const root = b.joint("pelvis", {
    at: [0, 0.96, -0.72],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.96, -0.72],
    [0, 1.01, -0.28],
    [0, 1.04, 0.22],
    [0, 1.02, 0.72],
    [0, 1.0, 1.2],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: root,
    count: 5,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
    group: "body",
  });

  const body = b.sweep(spine, (t) => 0.105 - 0.018 * Math.abs(t - 0.48), {
    color: IVORY,
    sides: 8,
    caps: "round",
    group: "body",
    name: "continuous-body-tube",
  });

  // A second narrow dorsal tube makes the silhouette more mechanical and carries the wind apparatus.
  const dorsal = b.sweep(
    catmull([
      [0, 1.04, -0.83],
      [0, 1.18, -0.42],
      [0, 1.23, 0.05],
      [0, 1.18, 0.54],
      [0, 1.06, 1.28],
    ]),
    0.027,
    { color: IVORY_LIGHT, bone: spine, sides: 8, caps: "flat", name: "dorsal-rail" },
  );

  // Black circular bulkheads along the body.
  for (let i = 0; i < 6; i++) {
    const z = -0.74 + i * 0.39;
    hub([0, 1.03 + (i === 2 || i === 3 ? 0.015 : 0), z], 0.115, 0.048, GRAPHITE, spine.joints[Math.min(i, 4)]);
    pin([0, 1.03, z], 0.027, RUST, spine.joints[Math.min(i, 4)]);
  }

  // A rear counterweight and tapered tail fork.
  const tail = b.chain(
    "tail",
    polyline([
      [0, 1.0, -0.72],
      [0, 0.94, -1.12],
      [0, 0.79, -1.48],
    ]),
    { parent: root, names: ["tail1", "tail2"], role: "tail", group: "body" },
  );
  b.sweep(tail, [0.075, 0.025], {
    color: IVORY_DARK,
    sides: 8,
    caps: "round",
    name: "tapered-tail",
  });
  tube([0, 0.84, -1.22], [0.23, 0.64, -1.52], 0.022, IVORY_LIGHT);
  tube([0, 0.84, -1.22], [-0.23, 0.64, -1.52], 0.022, IVORY_LIGHT);
  hub([0, 0.83, -1.23], 0.06, 0.045, CHARCOAL, tail.joints[0]);

  // Twelve long articulated legs. Each is a neutral, readable, spread rest pose.
  const legs: { side: number; index: number; chain: any; pts: any[] }[] = [];
  const legZ = [-0.58, -0.2, 0.2, 0.6, 0.98, 1.27];

  for (const side of [-1, 1]) {
    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const x = side * 0.075;
      const kneeX = side * (0.29 + (i % 2) * 0.035);
      const ankleX = side * (0.49 + (i % 3) * 0.025);
      const footX = side * (0.59 + (i % 2) * 0.035);

      const footZ = z + (i % 2 === 0 ? -0.17 : 0.16);
      const pts = [
        [x, 1.01, z],
        [kneeX, 0.63 + (i % 2) * 0.045, z + (i % 2 ? 0.13 : -0.13)],
        [ankleX, 0.23, footZ],
        [footX, 0.075, footZ + (side * 0.045)],
      ];

      const chain = b.chain(
        `leg${side > 0 ? "L" : "R"}${i + 1}`,
        polyline(pts),
        {
          parent: spine.joints[Math.min(4, Math.floor((i + 1) * 0.78))],
          names: [
            `hip${side > 0 ? "L" : "R"}${i + 1}`,
            `knee${side > 0 ? "L" : "R"}${i + 1}`,
            `ankle${side > 0 ? "L" : "R"}${i + 1}`,
          ],
          role: "leg",
          contact: [footX, 0, footZ],
          group: "legs",
        },
      );

      b.sweep(chain, [0.052, 0.038], {
        color: i % 2 ? IVORY : IVORY_LIGHT,
        sides: 7,
        caps: "round",
        name: `leg-tube-${side > 0 ? "L" : "R"}${i + 1}`,
        group: "legs",
      });

      hub(pts[1], 0.062, 0.046, CHARCOAL, chain.joints[0]);
      hub(pts[2], 0.052, 0.04, GRAPHITE, chain.joints[1]);
      pin(pts[1], 0.021, RUST, chain.joints[0]);
      pin(pts[2], 0.018, IVORY_LIGHT, chain.joints[1]);

      // Flat articulated foot, extended in the walking direction.
      tube(
        [footX - side * 0.055, 0.07, footZ],
        [footX + side * 0.13, 0.07, footZ + 0.025],
        0.035,
        IVORY_DARK,
        { bone: chain.tip! },
      );
      b.part(new THREE.SphereGeometry(0.042, 8, 5), SAND, {
        at: [footX + side * 0.13, 0.065, footZ + 0.025],
        bone: chain.tip,
        name: "sand-shoe",
      });

      legs.push({ side, index: i, chain, pts });
    }
  }

  // Long diagonal control rods: the defining wind-walker web of synchronized motion.
  for (let i = 0; i < legZ.length - 1; i++) {
    const left = legs.find((l) => l.side === 1 && l.index === i)!;
    const right = legs.find((l) => l.side === -1 && l.index === i + 1)!;
    const leftNext = legs.find((l) => l.side === 1 && l.index === i + 1)!;
    const rightNext = legs.find((l) => l.side === -1 && l.index === i)!;

    tube(left.pts[1], right.pts[2], 0.013, GRAPHITE);
    tube(rightNext.pts[1], leftNext.pts[2], 0.013, GRAPHITE);
    pin(left.pts[1], 0.018, RED);
    pin(right.pts[2], 0.016, RED);
  }

  // Side crankshafts running the length of the body.
  for (const side of [-1, 1]) {
    const crank = b.chain(
      `crank${side > 0 ? "L" : "R"}`,
      polyline([
        [side * 0.13, 1.02, -0.66],
        [side * 0.13, 1.02, 0.0],
        [side * 0.13, 1.02, 0.66],
        [side * 0.13, 1.02, 1.28],
      ]),
      { parent: spine.joints[1], role: "spine", group: "drive" },
    );
    b.sweep(crank, 0.019, {
      color: CHARCOAL,
      sides: 8,
      caps: "flat",
      name: `crankshaft-${side > 0 ? "L" : "R"}`,
    });

    for (let i = 0; i < 4; i++) {
      const z = -0.66 + i * 0.65;
      const offset = i % 2 === 0 ? 0.095 : -0.095;
      tube(
        [side * 0.13, 1.02, z],
        [side * (0.18 + offset), 0.93, z + 0.08],
        0.014,
        RUST,
      );
      hub([side * 0.13, 1.02, z], 0.045, 0.035, CHARCOAL, crank.joints[Math.min(i, crank.joints.length - 1)]);
    }
  }

  // Short rods from each crank eccentric to the upper leg pivots.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 6; i++) {
      const leg = legs.find((l) => l.side === side && l.index === i)!;
      const crankZ = -0.66 + i * 0.39;
      const crankPoint = [side * 0.13, 1.02, crankZ];
      tube(crankPoint, leg.pts[1], 0.011, GRAPHITE);
    }
  }

  // A tall rear mast, a recognizable wind-catcher, made from open tubes rather than a solid sail.
  const mast = b.chain(
    "mast",
    polyline([
      [0, 1.08, -0.28],
      [0, 1.55, -0.3],
      [0, 2.03, -0.28],
    ]),
    { parent: spine.joints[1], names: ["mastBase", "mastTop"], role: "fan", group: "sail" },
  );
  b.sweep(mast, [0.035, 0.022], {
    color: IVORY_LIGHT,
    sides: 8,
    caps: "flat",
    name: "wind-mast",
  });

  // Triangular open-frame sail oriented toward +Z, with a turquoise inset strip.
  const sailTop = [0, 1.98, -0.28];
  const sailBottom = [0, 1.22, -0.28];
  const sailL = [0.42, 1.58, -0.28];
  const sailR = [-0.42, 1.58, -0.28];

  tube(sailTop, sailL, 0.018, IVORY_LIGHT);
  tube(sailTop, sailR, 0.018, IVORY_LIGHT);
  tube(sailL, sailBottom, 0.018, IVORY_DARK);
  tube(sailR, sailBottom, 0.018, IVORY_DARK);
  tube(sailL, sailR, 0.015, GRAPHITE);
  tube([0, 1.25, -0.28], sailTop, 0.014, TURQUOISE);

  b.extrude(
    [
      [-0.02, 0],
      [0.36, 0.31],
      [0.02, 0.73],
      [-0.02, 0.73],
      [-0.36, 0.31],
    ],
    {
      at: [0, 1.24, -0.235],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: TURQUOISE,
      bone: mast.joints[0],
      name: "wind-sail-membrane",
    },
  );

  // Small red pennant and a top cap add a strong moving silhouette.
  b.extrude(
    [
      [0, 0],
      [0.24, 0.06],
      [0.03, 0.19],
      [0, 0.19],
    ],
    {
      at: [0.015, 1.92, -0.28],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.008,
      color: RED,
      bone: mast.joints[mast.joints.length - 1],
      name: "wind-pennant",
    },
  );
  hub([0, 2.03, -0.28], 0.052, 0.04, CHARCOAL, mast.tip);

  // Two forward feeler tubes, giving the abstract machine a creature-like face.
  const feelerL = b.sprout(
    "feelerL",
    b.surface(body).around(new THREE.Vector3(0, 1.03, 1.2)).at(35, 8)!,
    catmull([
      [0.09, 1.04, 1.24],
      [0.24, 1.15, 1.48],
      [0.35, 1.3, 1.62],
    ]),
    [0.028, 0.008],
    { count: 1, role: "tentacle", color: IVORY_LIGHT, caps: "point", group: "head" },
  );
  const feelerR = b.sprout(
    "feelerR",
    b.surface(body).around(new THREE.Vector3(0, 1.03, 1.2)).at(-35, 8)!,
    catmull([
      [-0.09, 1.04, 1.24],
      [-0.24, 1.15, 1.48],
      [-0.35, 1.3, 1.62],
    ]),
    [0.028, 0.008],
    { count: 1, role: "tentacle", color: IVORY_LIGHT, caps: "point", group: "head" },
  );
  pin(feelerL.chain!.tip!.at, 0.028, TURQUOISE, feelerL.chain!.tip!);
  pin(feelerR.chain!.tip!.at, 0.028, TURQUOISE, feelerR.chain!.tip!);

  // Four little open rings around the main pivots read as bearings and catch highlights.
  for (const z of [-0.56, -0.18, 0.2, 0.58]) {
    const ring = b.ring(
      { at: [0, 1.035, z], axis: [1, 0, 0] },
      { count: 8, radius: 0.13, fromDeg: 0, toDeg: 360, group: "bearings" },
    );
    for (const item of ring.items) {
      if (item.i % 2 === 0) {
        b.part(new THREE.SphereGeometry(0.012, 6, 4), SAND, {
          at: item.at,
          name: "bearing-bead",
        });
      }
    }
  }

  // A low central keel keeps the lowest solid body safely above the beach.
  tube([0, 0.83, -0.5], [0, 0.83, 0.85], 0.028, IVORY_DARK);
  hub([0, 0.83, 0.15], 0.055, 0.04, CHARCOAL);

  return b.root;
}
