import * as THREE from "three";
import { createBuilder, catmull, polyline, rng } from "../../../../src/index";
import { metal, gearTrain, TINT } from "../../../../kits/clockwork";

export const meta = {
  name: "wind-walking beach creature",
  description:
    "A stylized Theo Jansen-inspired kinetic beach creature assembled from angular tubes, mirrored walking linkages, a wind turbine, brass pivots, and broad sand feet.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  const TUBE = metal("iron", { polish: 0.2, tarnish: 0.18 });
  const DARK = metal("blued", { polish: 0.35, tarnish: 0.12 });
  const BRASS = metal("brass", { polish: 0.55, tarnish: 0.16 });
  const COPPER = metal("copper", { polish: 0.35, verdigris: 0.08 });
  const SAND = "#c99658";
  const PALE = "#e8c88f";
  const INK = "#171820";
  const ORANGE = "#d96b32";

  // One centered root bone. The sculpture's broad body is deliberately lifted,
  // leaving the walking feet as the lowest points.
  const core = b.joint("core", {
    at: [0, 0.92, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const spinePath = catmull([
    [0, 0.94, -1.02],
    [0, 0.98, -0.55],
    [0, 1.01, 0],
    [0, 0.98, 0.55],
    [0, 0.94, 1.02],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: core,
    names: ["spineRear", "spineMidRear", "spineCenter", "spineMidFront", "spineFront"],
    role: "spine",
  });
  const body = b.sweep(spine, (t) => 0.16 - t * 0.015, {
    bone: spine,
    color: TUBE,
    section: "box",
    sides: 8,
    caps: "round",
    group: "body",
    name: "facetedBodyTube",
  });

  // Raised central shell and blunt prow.
  b.sweep(
    catmull([
      [0, 1.02, -0.56],
      [0, 1.16, -0.2],
      [0, 1.22, 0.28],
      [0, 1.18, 0.72],
    ]),
    [0.17, 0.105],
    { bone: spine.joints[2], color: DARK, section: "box", caps: "round", name: "upperKeel" },
  );
  b.part(new THREE.BoxGeometry(0.48, 0.2, 0.3), TUBE, {
    bone: spine.joints[4],
    at: [0, 1.03, 0.93],
    rotation: [0, 0, 0],
    name: "frontNoseBlock",
  });

  // Decorative brass longitudinal rails and cross-braces.
  for (const x of [-0.13, 0.13]) {
    b.sweep(
      catmull([
        [x, 1.05, -0.87],
        [x, 1.11, -0.35],
        [x, 1.12, 0.2],
        [x, 1.06, 0.82],
      ]),
      0.018,
      { bone: spine.joints[2], color: BRASS, caps: "round", name: `brassRail${x > 0 ? "L" : "R"}` },
    );
  }
  for (const z of [-0.62, -0.18, 0.3, 0.7]) {
    b.rod([-0.15, 1.08, z], [0.15, 1.08, z], 0.014, {
      color: BRASS,
      bone: spine.joints[2],
      name: `bodyCrossbar${z}`,
    });
  }

  // Central wind rotor: a vertical axle, four broad low-poly blades,
  // and a small brass gear housing.
  const turbine = b.joint("turbine", {
    parent: core,
    at: [0, 1.17, 0.12],
    dir: [0, 0, 1],
    role: "fan",
    group: "windRotor",
  });
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.22, 10), BRASS, {
    bone: turbine,
    at: [0, 1.18, 0.12],
    dir: [0, 0, 1],
    name: "rotorHub",
  });
  const bladeOutline: [number, number, "sharp"][] = [
    [0, 0],
    [0.065, 0],
    [0.14, 0.5],
    [0.07, 0.92, "sharp"],
    [-0.015, 0.72],
  ];
  for (let i = 0; i < 4; i++) {
    const a = i * 90;
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), THREE.MathUtils.degToRad(a));
    b.extrude(bladeOutline, {
      at: [0, 1.18, 0.12],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.008,
      smoothing: 1,
      bone: turbine,
      color: PALE,
      rotation: [0, 0, a],
      name: `windSail${i}`,
    });
  }
  b.part(new THREE.TorusGeometry(0.16, 0.014, 6, 16), COPPER, {
    bone: turbine,
    at: [0, 1.18, 0.12],
    rotation: [Math.PI / 2, 0, 0],
    name: "rotorGuardRing",
  });

  // A visible compound gear train at the center of the animal.
  gearTrain(b, {
    at: [0, 1.01, -0.08],
    axis: [1, 0, 0],
    up: [0, 1, 0],
    module: 0.009,
    spin: "driveGear",
    bone: core,
    group: "drive",
    style: "solid",
    arbor: BRASS,
    gears: [
      { teeth: 24, spokes: 5, bore: 0.018, color: BRASS },
      { teeth: 12, angle: 62, spokes: 4, bore: 0.012, color: COPPER },
      { teeth: 18, from: 0, angle: -72, holes: 5, bore: 0.012, color: DARK },
      { teeth: 28, on: 1, shift: 0.035, spokes: 6, bore: 0.012, color: TINT.brass, texture: true },
    ],
  });

  const legZ = [-0.76, -0.38, 0, 0.38, 0.76];
  const sideValues = [-1, 1];

  function jointDisc(p: THREE.Vector3, bone: any, label: string, r = 0.055) {
    b.part(new THREE.CylinderGeometry(r, r, 0.035, 10), BRASS, {
      bone,
      at: p,
      dir: [1, 0, 0],
      name: label,
    });
    b.part(new THREE.SphereGeometry(r * 0.62, 8, 6), ORANGE, {
      bone,
      at: p,
      name: `${label}Cap`,
    });
  }

  // Five legs per side. Each is a readable Jansen-like linkage:
  // upper crank, long diagonal, lower strut, ankle, and a flat contact shoe.
  for (const side of sideValues) {
    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const front = i % 2 === 0 ? 1 : -1;
      const x = side * (0.15 + 0.035 * Math.abs(z));
      const hip = new THREE.Vector3(x, 0.98, z);
      const knee = new THREE.Vector3(side * (0.39 + 0.025 * front), 0.53, z + 0.13 * front);
      const ankle = new THREE.Vector3(side * (0.58 + 0.025 * front), 0.19, z + 0.27 * front);
      const toe = new THREE.Vector3(side * (0.72 + 0.02 * front), 0.065, z + 0.36 * front);

      const pts = [hip, knee, ankle, toe];
      const names = [
        `hip${side > 0 ? "L" : "R"}${i}`,
        `knee${side > 0 ? "L" : "R"}${i}`,
        `ankle${side > 0 ? "L" : "R"}${i}`,
        `foot${side > 0 ? "L" : "R"}${i}`,
      ];
      const chain = b.chain(`leg${side > 0 ? "L" : "R"}${i}`, pts, {
        parent: spine.joints[Math.min(4, Math.max(0, i))],
        names,
        role: "leg",
        contact: [toe.x, 0, toe.z],
      });

      b.sweep(chain, [0.052, 0.04, 0.032], {
        bone: chain,
        color: TUBE,
        section: "box",
        caps: "round",
        skin: "rigid",
        name: `legTube${side > 0 ? "L" : "R"}${i}`,
      });

      // Parallel triangular linkage bars create the characteristic kinetic silhouette.
      const crank = new THREE.Vector3(side * (0.24 + 0.025 * front), 0.76, z - 0.15 * front);
      b.rod(hip, crank, 0.022, { color: DARK, bone: chain.joints[0], name: `crank${side}_${i}` });
      b.rod(crank, ankle, 0.019, { color: BRASS, bone: chain.joints[0], name: `longLink${side}_${i}` });
      b.rod(knee, toe, 0.018, { color: DARK, bone: chain.joints[1], name: `rearLink${side}_${i}` });
      b.rod(hip, ankle, 0.014, { color: COPPER, bone: chain.joints[0], name: `innerLink${side}_${i}` });

      for (const [p, n] of [
        [hip, "hipPivot"],
        [crank, "crankPivot"],
        [knee, "kneePivot"],
        [ankle, "anklePivot"],
      ] as [THREE.Vector3, string][]) {
        jointDisc(p, chain.joints[0], `${n}${side > 0 ? "L" : "R"}${i}`, n === "hipPivot" ? 0.06 : 0.045);
      }

      // Broad, slightly angled sand shoes make the feet unmistakable and ground the silhouette.
      b.part(new THREE.BoxGeometry(0.19, 0.045, 0.13), PALE, {
        bone: chain.tip,
        at: [toe.x + side * 0.035, 0.045, toe.z + 0.02],
        rotation: [0, side * 0.16, side * 0.08],
        name: `sandShoe${side > 0 ? "L" : "R"}${i}`,
      });
      b.part(new THREE.SphereGeometry(0.032, 7, 5), ORANGE, {
        bone: chain.tip,
        at: [toe.x + side * 0.08, 0.06, toe.z + 0.02],
        name: `shoeRivet${side > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // Rear stabilizer tail / wind rudder.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.98, -0.86],
      [0, 0.78, -1.22],
      [0, 0.5, -1.47],
      [0, 0.28, -1.62],
    ]),
    { parent: spine.joints[0], names: ["tailBase", "tailMid", "tailTip"], role: "tail" },
  );
  b.sweep(tail, [0.09, 0.055], {
    bone: tail,
    color: DARK,
    section: "box",
    caps: "round",
    name: "rudderTail",
  });
  b.extrude(
    [
      [0, 0],
      [0.18, 0.02],
      [0.12, 0.38],
      [0, 0.56, "sharp"],
      [-0.12, 0.38],
      [-0.18, 0.02],
    ],
    {
      at: [0, 0.5, -1.46],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      bevel: 0.006,
      bone: tail.joints[1],
      color: PALE,
      name: "tailPennant",
    },
  );

  // Small repeated brass studs along the body, giving the simple tube base
  // the visual richness of a hand-built kinetic sculpture.
  for (let i = 0; i < 9; i++) {
    const z = -0.82 + i * 0.205;
    b.part(new THREE.SphereGeometry(0.018, 7, 5), BRASS, {
      bone: spine.joints[Math.min(4, Math.floor(i / 2))],
      at: [0.165, 1.04, z],
      name: `bodyStud${i}`,
    });
    b.part(new THREE.SphereGeometry(0.018, 7, 5), BRASS, {
      bone: spine.joints[Math.min(4, Math.floor(i / 2))],
      at: [-0.165, 1.04, z],
      name: `bodyStudMirror${i}`,
    });
  }

  return b.root;
}
