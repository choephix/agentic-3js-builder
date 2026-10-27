import * as THREE from "three";
import { createBuilder, catmull, polyline, svg, rng } from "../../../../src/index";

export const meta = {
  name: "wind-walking beach creature",
  description: "A stylized Theo Jansen-inspired kinetic beach walker built from articulated tubes, crankshafts, linkages, and wind-catching sails.",
};

export default function build() {
  const b = createBuilder({ name: "windWalker", detail: 1 });

  const IVORY = "#e7dfc7";
  const LIGHT = "#fff7df";
  const SAND = "#b9ad8e";
  const JOINT = "#3e5961";
  const DARK = "#263b40";
  const RUST = "#b87952";
  const SAIL = "#d9c98d";
  const SAIL_DARK = "#8d7655";

  // Skeleton first: one central chassis, then six articulated leg chains on each side.
  const chassisRoot = b.joint("chassis", {
    at: [0, 1.02, -0.52],
    dir: [0, 0, 1],
    role: "spine",
    group: "frame",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.0, 1.02, -0.52],
      [0, 1.06, -0.18],
      [0, 1.08, 0.18],
      [0, 1.03, 0.56],
    ]),
    {
      parent: chassisRoot,
      names: ["spineA", "spineB", "spineC", "spineD"],
      role: "spine",
      group: "frame",
    },
  );

  const legChains: ReturnType<typeof b.chain>[] = [];
  const legZ = [-0.48, -0.27, 0, 0.27, 0.48];
  const sides = [1, -1];

  for (const side of sides) {
    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const lean = side * (i % 2 === 0 ? 0.12 : -0.1);
      const knee = [side * 0.30, 0.72 + (i % 2) * 0.025, z + lean] as [number, number, number];
      const ankle = [side * 0.56, 0.32, z - side * 0.11] as [number, number, number];
      const foot = [side * 0.68, 0.065, z + side * (i % 2 === 0 ? 0.18 : -0.14)] as [number, number, number];
      const root = [side * 0.105, 1.055, z] as [number, number, number];

      const chain = b.chain(
        `leg${side > 0 ? "L" : "R"}${i + 1}`,
        polyline([root, knee, ankle, foot]),
        {
          parent: chassisRoot,
          names: [
            `hip${side > 0 ? "L" : "R"}${i + 1}`,
            `knee${side > 0 ? "L" : "R"}${i + 1}`,
            `ankle${side > 0 ? "L" : "R"}${i + 1}`,
            `foot${side > 0 ? "L" : "R"}${i + 1}`,
          ],
          role: "leg",
          group: "walkingLegs",
          contact: foot,
        },
      );
      legChains.push(chain);
    }
  }

  const mast = b.joint("windMast", {
    parent: spine.joints[1],
    at: [0, 1.09, -0.02],
    dir: [0, 1, 0],
    role: "hinge",
    group: "sail",
  });

  const sailHub = b.joint("sailHub", {
    parent: mast,
    at: [0, 1.72, 0],
    dir: [0, 0, 1],
    role: "fan",
    group: "sail",
  });

  // Main segmented body tube.
  const body = b.sweep(spine, (t) => 0.105 - t * 0.015, {
    bone: spine,
    color: IVORY,
    section: { ngon: 8 },
    caps: "round",
    group: "frame",
    name: "continuousChassis",
  });

  // Dark underside rail and upper rail make the creature read as a mechanical skeleton.
  b.sweep(
    catmull([
      [-0.105, 0.985, -0.5],
      [-0.105, 0.99, -0.15],
      [-0.105, 1.0, 0.18],
      [-0.105, 0.97, 0.55],
    ]),
    0.028,
    { color: DARK, bone: spine, caps: "round", group: "frame", name: "leftLowerRail" },
  );
  b.sweep(
    catmull([
      [0.105, 1.06, -0.5],
      [0.105, 1.075, -0.15],
      [0.105, 1.08, 0.18],
      [0.105, 1.05, 0.55],
    ]),
    0.025,
    { color: DARK, bone: spine, caps: "round", group: "frame", name: "rightUpperRail" },
  );

  // Articulated leg tubes plus characteristic triangulated linkages.
  for (let index = 0; index < legChains.length; index++) {
    const chain = legChains[index];
    const side = index < 5 ? 1 : -1;
    const local = index % 5;
    const z = legZ[local];
    const chainColor = local === 2 ? LIGHT : IVORY;

    b.sweep(chain, (t) => (t < 0.45 ? 0.047 : t < 0.76 ? 0.038 : 0.026), {
      bone: chain,
      color: chainColor,
      section: { ngon: 6 },
      caps: "round",
      group: "walkingLegs",
      name: `legTube${side > 0 ? "L" : "R"}${local + 1}`,
    });

    const hip = chain.at(0.04);
    const knee = chain.at(0.34);
    const ankle = chain.at(0.70);
    const foot = chain.at(0.96);

    // Pivot collars.
    for (const [p, r, name] of [
      [hip, 0.073, "hipPivot"],
      [knee, 0.064, "kneePivot"],
      [ankle, 0.052, "anklePivot"],
      [foot, 0.043, "footPivot"],
    ] as const) {
      b.stick(
        new THREE.CylinderGeometry(r, r, 0.034, 8),
        JOINT,
        p,
        { embed: 0.2, spin: 90, name: `${name}${side > 0 ? "L" : "R"}${local + 1}`, group: "joints" },
      );
    }

    // Long beach-walker struts from knee back toward the chassis.
    const braceStart = [side * 0.105, 1.025, z + side * 0.04] as [number, number, number];
    b.rod(braceStart, ankle.at, 0.018, {
      color: SAND,
      bone: chain.joints[0],
      caps: "flat",
      group: "linkages",
      name: `diagonalBrace${side > 0 ? "L" : "R"}${local + 1}`,
    });

    // Forward/back crank link, deliberately offset to expose the mechanism.
    const crank = [side * 0.18, 0.91, z + (local % 2 === 0 ? 0.13 : -0.13)] as [number, number, number];
    b.rod(knee.at, crank, 0.014, {
      color: RUST,
      bone: chain.joints[1],
      caps: "flat",
      group: "linkages",
      name: `crankLink${side > 0 ? "L" : "R"}${local + 1}`,
    });
    b.part(
      new THREE.SphereGeometry(0.027, 8, 6),
      RUST,
      { at: crank, bone: chain.joints[1], group: "linkages", name: `crankPin${side > 0 ? "L" : "R"}${local + 1}` },
    );

    // Flat, broad foot pads, just touching the beach.
    b.part(
      new THREE.BoxGeometry(0.13, 0.045, 0.22),
      DARK,
      {
        at: foot.at,
        bone: chain.tip ?? chain.joints[chain.joints.length - 1],
        scale: [1, 1, 1],
        group: "feet",
        name: `sandShoe${side > 0 ? "L" : "R"}${local + 1}`,
      },
    );
  }

  // Crosswise crankshaft through the chassis, with five visible eccentric discs.
  const shaft = b.rod(
    [-0.25, 1.085, -0.5],
    [0.25, 1.085, 0.5],
    0.022,
    {
      color: DARK,
      bone: chassisRoot,
      caps: "round",
      group: "drive",
      name: "diagonalDriveShaft",
    },
  );

  for (let i = 0; i < 5; i++) {
    const z = legZ[i];
    const axle = [0, 1.09, z] as [number, number, number];
    b.part(
      new THREE.CylinderGeometry(0.075, 0.075, 0.027, 12),
      RUST,
      {
        at: axle,
        bone: chassisRoot,
        dir: [1, 0, 0],
        group: "drive",
        name: `eccentricWheel${i + 1}`,
      },
    );
    b.part(
      new THREE.CylinderGeometry(0.027, 0.027, 0.05, 8),
      DARK,
      {
        at: axle,
        bone: chassisRoot,
        dir: [1, 0, 0],
        group: "drive",
        name: `axleCap${i + 1}`,
      },
    );
  }

  // Wind mast and a forked, angular sail frame.
  b.sweep(
    polyline([
      [0, 1.08, -0.03],
      [0, 1.38, -0.03],
      [0, 1.73, 0],
    ]),
    [0.046, 0.03],
    {
      bone: mast,
      color: IVORY,
      section: { ngon: 6 },
      caps: "round",
      group: "sail",
      name: "uprightWindMast",
    },
  );

  b.rod([-0.025, 1.55, 0], [0.025, 1.55, 0], 0.018, {
    color: DARK,
    bone: mast,
    group: "sail",
    name: "sailCrossbar",
  });

  // Three translucent-looking cloth-like solid sails, kept as geometric primitive membranes.
  b.extrude(
    [
      [0, 0],
      [0.38, 0.02],
      [0.31, 0.26],
      [0.05, 0.5],
      [0, 0.5, "sharp"],
    ],
    {
      at: [-0.01, 1.31, 0.018],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: SAIL,
      bone: mast,
      group: "sail",
      name: "leftWindSail",
    },
  );
  b.extrude(
    [
      [0, 0],
      [-0.38, 0.02],
      [-0.31, 0.26],
      [-0.05, 0.5],
      [0, 0.5, "sharp"],
    ],
    {
      at: [0.01, 1.31, 0.018],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: SAIL,
      bone: mast,
      group: "sail",
      name: "rightWindSail",
    },
  );

  // A rear vertical fin gives a strong silhouette and catches the wind.
  b.extrude(
    [
      [0, 0],
      [0.18, 0.08],
      [0.12, 0.43],
      [0.03, 0.58],
      [0, 0.58, "sharp"],
    ],
    {
      at: [0, 1.25, -0.07],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      color: SAIL_DARK,
      bone: mast,
      group: "sail",
      name: "rearWindFin",
    },
  );

  // Decorative wind glyph on the sail: a crisp, readable abstract spiral.
  const windMark = svg(
    `<svg viewBox="0 0 100 100">
      <path d="M16 56 C28 27 70 22 79 44 C87 64 61 78 43 67
               C29 59 32 43 48 39 C61 36 70 44 65 54"
            fill="none" stroke="#263b40" stroke-width="7" stroke-linecap="round"/>
      <path d="M20 78 C36 87 62 86 79 72" fill="none" stroke="#b87952" stroke-width="5" stroke-linecap="round"/>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.28, 0.28), "#ffffff", {
    texture: windMark,
    bone: mast,
    at: [-0.001, 1.51, 0.027],
    dir: [0, 0, 1],
    axis: "z",
    group: "markings",
    name: "windGlyph",
  });

  // Small repeated rivets and end caps unify the puppet-like construction.
  for (const side of sides) {
    for (const z of [-0.52, 0, 0.52]) {
      b.part(
        new THREE.SphereGeometry(0.024, 7, 5),
        LIGHT,
        {
          at: [side * 0.108, 1.11, z],
          bone: chassisRoot,
          group: "rivets",
          name: `frameRivet${side > 0 ? "L" : "R"}${z}`,
        },
      );
    }
  }

  // A restrained rest pose: the paired wind vanes angle slightly apart, while legs remain extended.
  b.pose(sailHub, { axis: [0, 1, 0], deg: -12 });

  return b.root;
}
