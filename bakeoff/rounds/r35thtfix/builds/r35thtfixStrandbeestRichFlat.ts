import * as THREE from "three";
import { catmull, createBuilder } from "../../../../src/index";

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A stylized Theo Jansen-inspired beach walker assembled from faceted ivory tubes, articulated linkage legs, dark bearings, and a six-bladed wind rotor.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  const IVORY = "#e8dfc5";
  const BONE = "#fff2d0";
  const SAND = "#b89c6a";
  const DARK = "#262522";
  const CHARCOAL = "#48443b";
  const OCHRE = "#d18b32";
  const RUST = "#a95432";
  const SEA = "#638f87";
  const BLACK = "#151515";

  type AnyPoint = any;

  const P = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  const add = (p: THREE.Vector3, d: THREE.Vector3, amount: number) =>
    p.clone().addScaledVector(d, amount);

  const pipe = (
    a: AnyPoint,
    c: AnyPoint,
    radius: number,
    color: string,
    extra: Record<string, any> = {},
  ) =>
    b.rod(a, c, radius, {
      color,
      sides: 6,
      smooth: false,
      caps: "round",
      ...extra,
    });

  const bearing = (at: AnyPoint, radius = 0.07, color = DARK) => {
    b.part(new THREE.CylinderGeometry(radius, radius, 0.052, 8), color, {
      at,
      dir: [1, 0, 0],
      flat: true,
      name: "bearing",
    });
    b.part(new THREE.SphereGeometry(radius * 0.52, 8, 5), OCHRE, {
      at,
      flat: true,
      name: "bearingPin",
    });
  };

  const rivet = (at: AnyPoint, radius = 0.025, color = OCHRE) =>
    b.part(new THREE.SphereGeometry(radius, 7, 5), color, {
      at,
      flat: true,
      name: "rivet",
    });

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton first: one chassis root, a flexible central spine, six articulated walking legs, and a wind rotor mast.

  const chassis = b.joint("chassis", {
    at: [0, 1.34, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "chassis",
  });

  const spine = b.chain(
    "spine",
    catmull(
      [
        [0, 1.34, -0.92],
        [0, 1.39, -0.36],
        [0, 1.41, 0.28],
        [0, 1.36, 0.92],
      ],
      { tension: 0.35 },
    ),
    {
      parent: chassis,
      names: ["spineRear", "spineMidRear", "spineMidFront", "spineFront"],
      role: "spine",
      group: "chassis",
    },
  );

  type LegInfo = {
    side: number;
    sideName: string;
    index: number;
    z: number;
    footZ: number;
    chain: any;
  };

  const legs: LegInfo[] = [];

  const legZ = [-0.7, 0, 0.7];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const footZ = z + (i === 0 ? -0.23 : i === 2 ? 0.25 : 0.08);

      const points = [
        [side * 0.16, 1.36, z],
        [side * 0.58, 0.87 + (i === 1 ? 0.03 : 0), z + (i === 0 ? 0.18 : i === 2 ? -0.16 : 0)],
        [side * 0.91, 0.38, z + (i === 0 ? -0.08 : i === 2 ? 0.07 : -0.02)],
        [side * 1.06, 0.105, footZ],
      ];

      const leg = b.chain(`leg${sideName}${i + 1}`, points, {
        parent: chassis,
        names: [
          `hip${sideName}${i + 1}`,
          `knee${sideName}${i + 1}`,
          `ankle${sideName}${i + 1}`,
          `foot${sideName}${i + 1}`,
        ],
        role: "leg",
        contact: [side * 1.08, 0, footZ],
        group: "walkingMechanism",
      });

      legs.push({ side, sideName, index: i, z, footZ, chain: leg });
    }
  }

  const mast = b.chain(
    "mast",
    [
      [0, 1.38, 0.22],
      [0, 1.7, 0.22],
      [0, 2.08, 0.22],
    ],
    {
      parent: chassis,
      names: ["mastBase", "mastBrace", "windHub"],
      role: "fan",
      group: "windMechanism",
    },
  );

  const windHub = mast.tip ?? mast.joints[mast.joints.length - 1];

  // ---------------------------------------------------------------------------------------------------------------
  // Central body: an open rib cage around a slightly bowed central tube.

  b.sweep(spine, [0.145, 0.13], {
    color: IVORY,
    sides: 8,
    smooth: false,
    caps: "round",
    sectors: [[135, 225, SAND]],
    name: "centralSpine",
    group: "chassis",
  });

  const railZ0 = -0.9;
  const railZ1 = 0.92;

  for (const side of [1, -1]) {
    pipe(
      [side * 0.22, 1.53, railZ0],
      [side * 0.22, 1.53, railZ1],
      0.038,
      BONE,
      { name: `upperRail${side > 0 ? "L" : "R"}`, bone: chassis },
    );

    pipe(
      [side * 0.23, 1.17, railZ0],
      [side * 0.23, 1.17, railZ1],
      0.035,
      IVORY,
      { name: `lowerRail${side > 0 ? "L" : "R"}`, bone: chassis },
    );

    pipe(
      [side * 0.19, 1.35, railZ0],
      [side * 0.19, 1.35, railZ1],
      0.024,
      CHARCOAL,
      { name: `shadowRail${side > 0 ? "L" : "R"}`, bone: chassis },
    );
  }

  const cageStations = [-0.82, -0.42, 0, 0.42, 0.82];

  for (let i = 0; i < cageStations.length; i++) {
    const z = cageStations[i];
    const width = i === 0 || i === cageStations.length - 1 ? 0.27 : 0.31;

    pipe(
      [-width, 1.18, z],
      [width, 1.18, z],
      0.027,
      DARK,
      { name: "lowerCrossbar", bone: chassis },
    );

    pipe(
      [-width, 1.52, z],
      [width, 1.52, z],
      0.027,
      DARK,
      { name: "upperCrossbar", bone: chassis },
    );

    pipe(
      [-width, 1.18, z],
      [width, 1.52, z],
      0.022,
      OCHRE,
      { name: "uprightCrossbar", bone: chassis },
    );

    rivet([-width, 1.18, z], 0.026, OCHRE);
    rivet([width, 1.18, z], 0.026, OCHRE);
    rivet([-width, 1.52, z], 0.026, OCHRE);
    rivet([width, 1.52, z], 0.026, OCHRE);
  }

  // Angular side gussets make the open frame legible as a kinetic machine rather than a plain tube.
  for (const side of [1, -1]) {
    const out = side > 0 ? "L" : "R";
    for (const z of [-0.62, 0, 0.62]) {
      b.extrude(
        [
          [-0.11, 0],
          [0.12, 0],
          [0.08, 0.18],
          [-0.03, 0.24],
          [-0.1, 0.13],
        ],
        {
          at: [side * 0.255, 1.25, z],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.018,
          bevel: 0.003,
          color: SEA,
          bone: chassis,
          name: `sideGusset${out}`,
          group: "chassis",
        },
      );
    }
  }

  // Dark collars around the main spine, a characteristic exposed-tube construction detail.
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const at = spine.at(t);
    b.part(new THREE.TorusGeometry(0.151, 0.012, 6, 12), DARK, {
      at: at.at,
      dir: at.tangent,
      axis: "z",
      flat: true,
      name: "spineCollar",
      group: "chassis",
    });
  }

  // Three crank axles cross the body and visually connect the two rows of legs.
  for (let i = 0; i < legZ.length; i++) {
    const z = legZ[i];
    pipe(
      [-0.39, 1.35, z],
      [0.39, 1.35, z],
      0.031,
      CHARCOAL,
      { name: "crankAxle", bone: chassis },
    );

    for (const side of [1, -1]) {
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.058, 10), DARK, {
        at: [side * 0.3, 1.35, z],
        dir: [1, 0, 0],
        flat: true,
        bone: chassis,
        name: "crankWheel",
        group: "walkingMechanism",
      });

      b.part(new THREE.CylinderGeometry(0.043, 0.043, 0.07, 8), OCHRE, {
        at: [side * 0.34, 1.35, z],
        dir: [1, 0, 0],
        flat: true,
        bone: chassis,
        name: "crankPin",
        group: "walkingMechanism",
      });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Six articulated legs, with contrasting link rods and oversized visible bearings.

  for (const info of legs) {
    const { chain: leg, side, sideName, index: i, footZ } = info;

    b.sweep(leg, (t: number) => (t > 0.73 ? 0.048 : t > 0.32 ? 0.053 : 0.06), {
      color: IVORY,
      sides: 6,
      smooth: false,
      caps: "round",
      bands: [
        [0.34, BONE],
        [0.73, IVORY],
        [0.92, SAND],
        [1, IVORY],
      ],
      name: `legTube${sideName}${i + 1}`,
      group: "walkingMechanism",
    });

    const hip = leg.joints[0];
    const knee = leg.joints[1];
    const ankle = leg.joints[2];
    const foot = leg.joints[3];

    bearing(hip, 0.082, DARK);
    bearing(knee, 0.075, DARK);
    bearing(ankle, 0.067, DARK);
    bearing(foot, 0.06, CHARCOAL);

    // The long triangular linkage is deliberately offset from the ivory leg tube.
    pipe(hip, ankle, 0.019, DARK, {
      name: `longLink${sideName}${i + 1}`,
      group: "walkingMechanism",
    });

    pipe(knee, foot, 0.018, CHARCOAL, {
      name: `rearLink${sideName}${i + 1}`,
      group: "walkingMechanism",
    });

    pipe(hip, foot, 0.014, OCHRE, {
      name: `goldLink${sideName}${i + 1}`,
      group: "walkingMechanism",
    });

    // A second, shorter brace forms a readable triangular elbow.
    pipe(
      leg.at(0.18),
      leg.at(0.57),
      0.016,
      SEA,
      {
        name: `elbowBrace${sideName}${i + 1}`,
        group: "walkingMechanism",
      },
    );

    pipe(
      leg.at(0.52),
      leg.at(0.88),
      0.014,
      RUST,
      {
        name: `shinBrace${sideName}${i + 1}`,
        group: "walkingMechanism",
      },
    );

    // Crank-to-knee actuator, attached to the nearby axle position.
    const crank = [side * 0.34, 1.35, info.z] as const;
    pipe(crank, knee, 0.017, OCHRE, {
      name: `crankLink${sideName}${i + 1}`,
      bone: chassis,
      group: "walkingMechanism",
    });

    // Flat sliding foot, just above the beach plane.
    b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.23, 8), DARK, {
      at: [side * 1.09, 0.074, footZ + 0.095],
      dir: [0, 0, 1],
      flat: true,
      bone: foot,
      name: `footShoe${sideName}${i + 1}`,
      group: "walkingMechanism",
    });

    b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 8), OCHRE, {
      at: [side * 1.09, 0.074, footZ + 0.095],
      dir: [0, 0, 1],
      flat: true,
      bone: foot,
      name: `footStripe${sideName}${i + 1}`,
      group: "walkingMechanism",
    });

    // Small toe cap at the leading edge of every skid.
    rivet([side * 1.09, 0.105, footZ + 0.205], 0.035, BONE);
  }

  // A pair of diagonal braces under the belly ties the two leg rows to the center frame.
  for (const z of [-0.7, 0, 0.7]) {
    pipe(
      [-0.23, 1.17, z],
      [0.23, 1.53, z],
      0.022,
      CHARCOAL,
      { name: "bellyDiagonal", bone: chassis, group: "chassis" },
    );
    pipe(
      [0.23, 1.17, z],
      [-0.23, 1.53, z],
      0.022,
      CHARCOAL,
      { name: "bellyDiagonal", bone: chassis, group: "chassis" },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Mast and wind mechanism.

  b.sweep(mast, [0.052, 0.038], {
    color: IVORY,
    sides: 7,
    smooth: false,
    caps: "round",
    name: "windMast",
    group: "windMechanism",
  });

  pipe(
    [-0.29, 1.43, 0.22],
    [0, 2.04, 0.22],
    0.025,
    DARK,
    { bone: chassis, name: "mastLeftStay", group: "windMechanism" },
  );

  pipe(
    [0.29, 1.43, 0.22],
    [0, 2.04, 0.22],
    0.025,
    DARK,
    { bone: chassis, name: "mastRightStay", group: "windMechanism" },
  );

  pipe(
    [0, 1.43, 0.22],
    [0, 2.04, 0.22],
    0.02,
    OCHRE,
    { bone: chassis, name: "mastCenterStay", group: "windMechanism" },
  );

  const hub = windHub.at.clone();

  // Rotor axle and layered bearing housing.
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.19, 10), DARK, {
    at: hub,
    dir: [0, 0, 1],
    flat: true,
    bone: windHub,
    name: "windRotorHub",
    group: "windMechanism",
  });

  b.part(new THREE.CylinderGeometry(0.071, 0.071, 0.22, 8), OCHRE, {
    at: hub,
    dir: [0, 0, 1],
    flat: true,
    bone: windHub,
    name: "windRotorPin",
    group: "windMechanism",
  });

  rivet(hub, 0.052, BONE);

  // Six broad angular sails. Each is a flat, slightly beveled slab framed by a slim tube.
  const rotorBlade = [
    [0.08, -0.065],
    [0.57, -0.16],
    [0.78, -0.055],
    [0.72, 0.075],
    [0.18, 0.11],
  ] as [number, number][];

  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI * 2) / 6 + Math.PI / 6;
    const radial = P(Math.cos(a), Math.sin(a), 0);
    const tangent = P(-Math.sin(a), Math.cos(a), 0);
    const bladeColor = i % 3 === 0 ? OCHRE : i % 3 === 1 ? BONE : SEA;

    b.extrude(rotorBlade, {
      at: hub,
      x: radial,
      y: tangent,
      thickness: [0.025, 0.012],
      bevel: 0.006,
      color: bladeColor,
      bone: windHub,
      name: `windSail${i + 1}`,
      group: "windMechanism",
    });

    pipe(
      add(hub, radial, 0.08),
      add(hub, radial, 0.73),
      0.021,
      IVORY,
      {
        bone: windHub,
        name: `windSailSpine${i + 1}`,
        group: "windMechanism",
      },
    );

    pipe(
      add(hub, radial, 0.58).addScaledVector(tangent, -0.14),
      add(hub, radial, 0.75).addScaledVector(tangent, -0.055),
      0.012,
      DARK,
      {
        bone: windHub,
        name: `windSailEdge${i + 1}`,
        group: "windMechanism",
      },
    );

    b.part(new THREE.SphereGeometry(0.033, 7, 5), OCHRE, {
      at: add(hub, radial, 0.77),
      bone: windHub,
      flat: true,
      name: `windTip${i + 1}`,
      group: "windMechanism",
    });
  }

  // A small rear vane keeps the rotor silhouette asymmetric and gives the sculpture a wind-facing direction.
  b.extrude(
    [
      [0, 0],
      [0.25, 0.02],
      [0.37, 0.12],
      [0.15, 0.18],
      [0, 0.09],
    ],
    {
      at: [0, 1.89, 0.08],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: RUST,
      bone: chassis,
      name: "rearWindVane",
      group: "windMechanism",
    },
  );

  pipe(
    [-0.02, 1.9, 0.08],
    [0.34, 2.03, 0.08],
    0.018,
    DARK,
    { bone: chassis, name: "vaneBrace", group: "windMechanism" },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Small repeated machine details: collars, bolts, and colored inspection markers.

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    for (const z of [-0.7, 0, 0.7]) {
      const p = P(side * 0.245, 1.38, z);

      b.part(new THREE.TorusGeometry(0.078, 0.009, 6, 10), RUST, {
        at: p,
        dir: [0, 1, 0],
        axis: "z",
        flat: true,
        bone: chassis,
        name: `sideCollar${sideName}`,
        group: "chassis",
      });

      rivet([side * 0.275, 1.53, z], 0.021, OCHRE);
      rivet([side * 0.275, 1.17, z], 0.021, SEA);
    }
  }

  for (let i = 0; i < 5; i++) {
    const t = (i + 0.5) / 5;
    const p = spine.at(t);
    b.part(new THREE.SphereGeometry(0.028, 7, 5), OCHRE, {
      at: p.at,
      flat: true,
      name: "spineMarker",
      group: "chassis",
    });
  }

  return b.root;
}
