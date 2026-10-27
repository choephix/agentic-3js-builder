import * as THREE from "three";
import { createBuilder, catmull, frame, line, rng } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A stylized Theo Jansen-inspired beach walker assembled from cream pneumatic tubes, articulated legs, crank wheels, rods, and wind-catching sails.",
};

export default function build() {
  const b = createBuilder({ name: "windWalkingBeachCreature", detail: 1 });

  const PVC = cel("#e9dfbd", "#9a8966");
  const PVC_LIGHT = cel("#fff4d0", "#b7a77d");
  const JOINT = cel("#343b3b", "#111719");
  const ROD = cel("#667171", "#293335");
  const RUST = cel("#b56b3b", "#613529");
  const SAIL = cel("#d9c28a", "#806849");
  const INKISH = INK;

  const tube = (points: number[][], radius: number, color = PVC, options: any = {}) =>
    b.sweep(catmull(points), radius, {
      color,
      sides: 6,
      caps: "round",
      ...options,
    });

  const ball = (p: any, r: number, color = JOINT, bone?: any) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, {
      at: p,
      bone,
      flat: true,
    });

  const pin = (a: any, c: any, radius = 0.032, color = JOINT) =>
    b.rod(a, c, radius, {
      color,
      sides: 8,
      caps: "round",
      section: "circle",
    });

  // One root skeleton, followed by the long segmented thorax.
  const root = b.joint("pelvis", {
    at: [0, 1.12, 0],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 1.12, -1.02],
    [0, 1.16, -0.56],
    [0, 1.2, 0],
    [0, 1.16, 0.56],
    [0, 1.12, 1.02],
  ]);

  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spine0", "spine1", "spine2", "spine3", "spine4"],
    role: "spine",
    count: 5,
  });

  const body = b.sweep(spine, (t) => 0.16 - 0.025 * Math.abs(t - 0.5), {
    color: PVC,
    sides: 8,
    caps: "round",
    section: "circle",
    shift: [0, -0.015],
  });

  // Cream ribs make the long tube read as a lightweight kinetic chassis.
  for (let i = 0; i < 7; i++) {
    const z = -0.88 + i * 0.293;
    const rib = b.ring(frame([0, 1.18, z], [0, 1, 0]), {
      count: 10,
      radius: 0.165,
      fromDeg: 0,
      toDeg: 360,
    });
    b.sweep(catmull(rib.items.map((h: any) => h.at), { closed: true }), 0.012, {
      color: PVC_LIGHT,
      sides: 5,
      caps: "round",
    });
  }

  // Six pairs of tall, splayed, unmistakably Jansen-like legs.
  const legZ = [-0.82, -0.28, 0.28, 0.82];
  const sides = [1, -1];

  legZ.forEach((z, index) => {
    sides.forEach((side) => {
      const x = side * 0.105;
      const hip = [x, 1.17, z];
      const knee = [side * 0.48, 0.72 + (index % 2) * 0.035, z + side * 0.13];
      const ankle = [side * 0.69, 0.27, z - side * 0.16];
      const toe = [side * 0.77, 0.075, z + 0.22];

      const legName = `leg${index}${side > 0 ? "L" : "R"}`;
      const pts = [hip, knee, ankle, toe];

      const leg = b.chain(legName, catmull(pts), {
        parent: spine.joints[Math.min(4, Math.max(0, index))],
        names: [
          `${legName}_hip`,
          `${legName}_knee`,
          `${legName}_ankle`,
          `${legName}_foot`,
        ],
        role: "leg",
        count: 4,
        contact: toe,
      });

      b.sweep(leg, (t) => (t < 0.34 ? 0.058 : t < 0.7 ? 0.045 : 0.032), {
        color: PVC_LIGHT,
        sides: 6,
        caps: "round",
        section: "circle",
      });

      // Dark bearing housings at every articulated corner.
      ball(hip, 0.071, JOINT, leg.joints[0]);
      ball(knee, 0.065, JOINT, leg.joints[1]);
      ball(ankle, 0.057, JOINT, leg.joints[2]);
      ball(toe, 0.045, JOINT, leg.joints[3]);

      // Broad flat beach foot, slightly ahead of the ankle.
      b.part(
        new THREE.BoxGeometry(0.115, 0.045, 0.29),
        JOINT,
        {
          at: [toe[0], 0.045, toe[2] + 0.095],
          bone: leg.joints[3],
          flat: true,
        },
      );

      // Parallel triangular tension strut: a signature Strandbeest silhouette.
      const strutTop = [side * 0.30, 0.92, z + side * 0.08];
      pin(hip, strutTop, 0.018, ROD);
      pin(strutTop, ankle, 0.018, ROD);
      pin(knee, [side * 0.68, 0.52, z + side * 0.02], 0.016, ROD);

      // A small pale sleeve around the upper joint.
      b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.035, 8), PVC, {
        at: [hip[0], hip[1], hip[2]],
        bone: leg.joints[0],
        dir: [1, 0, 0],
        flat: true,
      });
    });
  });

  // Crankshaft running through the thorax.
  const crank = b.rod(
    [-0.31, 1.2, -0.98],
    [0.31, 1.2, 0.98],
    0.026,
    RUST,
    { caps: "round", sides: 8 },
  );

  // Three visible eccentric crank wheels on the creature's left side.
  [-0.62, 0, 0.62].forEach((z, i) => {
    const axle = [0.205, 1.2, z];
    const wheel = b.part(
      new THREE.CylinderGeometry(0.145, 0.145, 0.035, 12),
      RUST,
      {
        at: axle,
        dir: [1, 0, 0],
        flat: true,
        name: `crankWheel${i}`,
      },
    );

    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.043, 8), JOINT, {
      at: [0.232, 1.2, z],
      dir: [1, 0, 0],
      flat: true,
    });

    const eccentric = [0.244, 1.2 + 0.083, z + 0.045];
    ball(eccentric, 0.027, JOINT);
    pin(eccentric, [0.46, 0.78, z + 0.13], 0.014, ROD);
  });

  // Matching dark crank discs on the far side give the machine a readable rhythm.
  [-0.62, 0, 0.62].forEach((z, i) => {
    b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.025, 10), JOINT, {
      at: [-0.205, 1.2, z],
      dir: [1, 0, 0],
      flat: true,
      name: `farCrank${i}`,
    });
  });

  // A raised wind vane / sail frame, kept behind the face and above the body.
  const mastBase = [0, 1.28, 0.72];
  const mastTop = [0, 2.08, 0.72];
  tube([mastBase, mastTop], 0.035, ROD, { caps: "flat" });
  ball(mastTop, 0.055, JOINT);

  const sailFrame = [
    [0, 2.02, 0.72],
    [0.42, 1.88, 0.72],
    [0.34, 1.42, 0.72],
    [0, 1.46, 0.72],
  ];
  for (let i = 0; i < sailFrame.length; i++) {
    const a = sailFrame[i];
    const c = sailFrame[(i + 1) % sailFrame.length];
    pin(a, c, 0.018, ROD);
  }

  b.extrude(
    [
      [0, 0],
      [0.42, 0.14],
      [0.34, 0.6],
      [0, 0.56],
    ],
    {
      at: [0.012, 1.46, 0.73],
      x: [1, 0, 0],
      y: [0, 0.99, 0.12],
      thickness: 0.012,
      bevel: 0.004,
      smoothing: 1,
      color: SAIL,
      name: "windSail",
    },
  );

  // A small front-facing nose plate makes the +Z orientation and character readable.
  b.part(new THREE.BoxGeometry(0.22, 0.18, 0.035), PVC_LIGHT, {
    at: [0, 1.2, 1.14],
    bone: spine.joints[4],
    flat: true,
    name: "nosePlate",
  });
  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.045, 8), INKISH, {
    at: [0, 1.2, 1.17],
    bone: spine.joints[4],
    dir: [0, 0, 1],
    flat: true,
    name: "noseBearing",
  });

  // Decorative short tubes below the chassis echo the countless wind-blown beach struts.
  [-0.72, -0.36, 0, 0.36, 0.72].forEach((z, i) => {
    pin(
      [-0.11, 1.02, z],
      [0.11, 0.88, z + 0.13],
      0.014,
      i % 2 ? PVC_LIGHT : ROD,
    );
  });

  return b.root;
}
