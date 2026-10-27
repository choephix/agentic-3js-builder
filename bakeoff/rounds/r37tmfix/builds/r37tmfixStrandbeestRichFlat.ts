import * as THREE from "three";
import { createBuilder, catmull, rng } from "../../../../src/index";

export const meta = {
  name: "Wind-Walking Tube Creature",
  description:
    "A stylized Theo Jansen-inspired beach walker built from faceted PVC tubes, crank axles, articulated legs, wind-catching frames, collars, pivots, and mechanical linkages.",
};

export default function build() {
  const b = createBuilder({ name: "windWalker", detail: 1 });

  const WHITE = "#e9e0c9";
  const IVORY = "#fff5d8";
  const SAND = "#c7b89b";
  const SHADOW = "#403d3b";
  const STEEL = "#59636a";
  const BLUE = "#276b78";
  const TURQUOISE = "#43a9a0";
  const CORAL = "#d26a52";
  const ORANGE = "#e69a4a";
  const DARK = "#202c2d";
  const PALE = "#a9d4cb";

  const hips = b.joint("hips", {
    at: [0, 1.02, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "walker",
  });

  const body = b.chain(
    "spine",
    catmull([
      [0, 1.11, -0.98],
      [0, 1.13, -0.52],
      [0, 1.14, 0],
      [0, 1.13, 0.52],
      [0, 1.11, 0.98],
    ]),
    {
      parent: hips,
      names: ["bodyRear", "bodyMidRear", "bodyCenter", "bodyMidFront", "bodyFront"],
      role: "spine",
      group: "walker",
    },
  );

  const legChains: { side: number; z: number; chain: any; points: THREE.Vector3[] }[] = [];
  const stations = [-0.78, -0.26, 0.26, 0.78];

  for (let si = 0; si < 2; si++) {
    const side = si === 0 ? 1 : -1;
    for (let i = 0; i < stations.length; i++) {
      const z = stations[i];
      const forward = i % 2 === 0 ? 0.08 : -0.08;
      const kneeForward = i % 2 === 0 ? 0.16 : -0.12;
      const root = [side * 0.12, 1.08, z] as [number, number, number];
      const knee = [side * 0.34, 0.62, z + kneeForward] as [number, number, number];
      const hock = [side * 0.47, 0.24, z - forward] as [number, number, number];
      const foot = [side * 0.46, 0.07, z + 0.29] as [number, number, number];

      const points = [root, knee, hock, foot].map((p) => new THREE.Vector3(...p));
      const label = side > 0 ? "L" : "R";
      const names = [
        `hip${label}${i}`,
        `knee${label}${i}`,
        `hock${label}${i}`,
        `ankle${label}${i}`,
      ];

      const chain = b.chain(`leg${label}${i}`, points, {
        parent: hips,
        names,
        role: "leg",
        group: "walkingLegs",
        contact: foot,
      });

      legChains.push({ side, z, chain, points });
    }
  }

  const crankJoints: any[] = [];
  for (let i = 0; i < stations.length; i++) {
    crankJoints.push(
      b.joint(`crank${i}`, {
        parent: hips,
        at: [0, 1.06, stations[i]],
        dir: [1, 0, 0],
        role: "hinge",
        group: "cranks",
      }),
    );
  }

  const mastRear = b.joint("mastRear", {
    parent: hips,
    at: [0, 1.12, -0.66],
    dir: [0, 1, 0],
    role: "fan",
    group: "windSails",
  });

  const mastFront = b.joint("mastFront", {
    parent: hips,
    at: [0, 1.12, 0.34],
    dir: [0, 1, 0],
    role: "fan",
    group: "windSails",
  });

  const nose = b.joint("nose", {
    parent: body.tip,
    at: [0, 1.1, 1.08],
    dir: [0, 0, 1],
    role: "head",
    group: "walker",
  });

  const tube = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    extra: any = {},
  ) => b.rod(a, c, radius, { color, caps: "flat", section: { ngon: 8 }, ...extra });

  const roundTube = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: string,
    extra: any = {},
  ) => b.capsule(a, c, radius, { color, sides: 8, ...extra });

  // Main body, with a darker underside rail and a raised dorsal rail.
  b.sweep(body, 0.082, {
    color: WHITE,
    section: { ngon: 8 },
    caps: "round",
    name: "longBodyTube",
    group: "body",
  });

  tube([-0.055, 1.025, -0.91], [-0.055, 1.025, 0.91], 0.027, SHADOW, {
    bone: hips,
    name: "undersideRail",
    group: "body",
  });

  tube([0.055, 1.205, -0.82], [0.055, 1.205, 0.82], 0.022, TURQUOISE, {
    bone: hips,
    name: "dorsalRail",
    group: "body",
  });

  // Five characteristic body hoops and small saddle blocks.
  for (let i = 0; i < 5; i++) {
    const z = -0.86 + i * 0.43;
    const hoop = b.ring(body.at(i / 4), {
      count: 8,
      radius: 0.085,
      fromDeg: 0,
      toDeg: 360,
      name: `bodyHoop${i}`,
      group: "bodyBands",
    });
    for (let j = 0; j < hoop.items.length; j += 2) {
      b.part(new THREE.SphereGeometry(0.019, 6, 4), BLUE, {
        at: hoop.items[j],
        name: `bodyRivet${i}_${j}`,
        group: "bodyBands",
      });
    }
  }

  // Leg tubes and chunky joint collars.
  for (let li = 0; li < legChains.length; li++) {
    const leg = legChains[li];
    const label = leg.side > 0 ? "L" : "R";
    const i = li % stations.length;

    b.sweep(leg.chain, 0.034, {
      color: WHITE,
      section: { ngon: 6 },
      caps: "round",
      name: `legTube${label}${i}`,
      group: "walkingLegs",
    });

    const p0 = leg.chain.at(0);
    const p1 = leg.chain.at(1 / 3);
    const p2 = leg.chain.at(2 / 3);
    const p3 = leg.chain.at(1);

    b.part(new THREE.CylinderGeometry(0.061, 0.061, 0.043, 8), BLUE, {
      at: p0.at,
      dir: p0.tangent,

      name: `hipCollar${label}${i}`,
      group: "joints",
    });

    b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.047, 8), CORAL, {
      at: p1.at,
      dir: p1.tangent,

      name: `kneeCollar${label}${i}`,
      group: "joints",
    });

    b.part(new THREE.CylinderGeometry(0.052, 0.052, 0.043, 8), BLUE, {
      at: p2.at,
      dir: p2.tangent,

      name: `hockCollar${label}${i}`,
      group: "joints",
    });

    b.part(new THREE.CylinderGeometry(0.049, 0.049, 0.039, 8), CORAL, {
      at: p3.at,
      dir: p3.tangent,

      name: `ankleCollar${label}${i}`,
      group: "joints",
    });

    // Wide beach foot, oriented in the direction of travel.
    roundTube(
      [leg.side * 0.39, 0.065, leg.z + 0.19],
      [leg.side * 0.39, 0.065, leg.z + 0.42],
      0.047,
      SAND,
      { bone: leg.chain.tip, name: `sandFoot${label}${i}`, group: "feet" },
    );

    b.part(new THREE.SphereGeometry(0.052, 8, 5), DARK, {
      at: [leg.side * 0.39, 0.067, leg.z + 0.41],
      bone: leg.chain.tip,
      name: `footToe${label}${i}`,
      group: "feet",
    });

    // A pale diagonal brace gives the leg the unmistakable Jansen linkage silhouette.
    tube(
      [leg.side * 0.12, 1.075, leg.z],
      [leg.side * 0.47, 0.24, leg.z - (i % 2 === 0 ? 0.08 : -0.08)],
      0.018,
      PALE,
      { bone: leg.chain.joints[0], name: `diagonalBrace${label}${i}`, group: "linkages" },
    );
  }

  // Crankshaft and eccentric disks.
  for (let i = 0; i < stations.length; i++) {
    const z = stations[i];
    tube([-0.58, 1.06, z], [0.58, 1.06, z], 0.023, STEEL, {
      bone: crankJoints[i],
      name: `crossCrank${i}`,
      group: "cranks",
    });

    for (const side of [-1, 1]) {
      b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.034, 12), CORAL, {
        at: [side * 0.38, 1.06, z],
        dir: [1, 0, 0],
        bone: crankJoints[i],
        name: `crankDisk${i}_${side}`,
        group: "cranks",
      });

      b.part(new THREE.CylinderGeometry(0.037, 0.037, 0.042, 8), IVORY, {
        at: [side * 0.405, 1.06, z],
        dir: [1, 0, 0],
        bone: crankJoints[i],
        name: `crankHub${i}_${side}`,
        group: "cranks",
      });

      b.part(new THREE.SphereGeometry(0.028, 7, 5), ORANGE, {
        at: [side * 0.405, 1.06, z + (i % 2 === 0 ? 0.072 : -0.072)],
        bone: crankJoints[i],
        name: `eccentric${i}_${side}`,
        group: "cranks",
      });
    }

    // Eccentric bars are deliberately offset from the leg pivots.
    for (const leg of legChains.filter((x) => Math.abs(x.z - z) < 0.001)) {
      const phase = i % 2 === 0 ? 0.072 : -0.072;
      tube(
        [leg.side * 0.405, 1.06, z + phase],
        leg.points[1],
        0.018,
        BLUE,
        { bone: leg.chain.joints[0], name: `driveRod${leg.side > 0 ? "L" : "R"}${i}`, group: "linkages" },
      );

      tube(
        [leg.side * 0.405, 1.06, z - phase],
        leg.points[2],
        0.015,
        CORAL,
        { bone: leg.chain.joints[1], name: `returnRod${leg.side > 0 ? "L" : "R"}${i}`, group: "linkages" },
      );
    }
  }

  // End bearing towers make the axle read as a machine rather than a random bundle of sticks.
  for (const side of [-1, 1]) {
    tube(
      [side * 0.53, 0.9, -0.94],
      [side * 0.53, 1.27, -0.94],
      0.032,
      STEEL,
      { bone: hips, name: `rearBearingTower${side}`, group: "bearings" },
    );
    tube(
      [side * 0.53, 0.9, 0.94],
      [side * 0.53, 1.27, 0.94],
      0.032,
      STEEL,
      { bone: hips, name: `frontBearingTower${side}`, group: "bearings" },
    );
  }

  // Rear wind-catcher: a broad triangular tube frame.
  tube([0, 1.12, -0.66], [0, 1.88, -0.66], 0.031, TURQUOISE, {
    bone: mastRear,
    name: "rearMast",
    group: "windSails",
  });
  tube([-0.48, 1.22, -0.66], [0, 1.88, -0.66], 0.025, WHITE, {
    bone: mastRear,
    name: "rearSailLeft",
    group: "windSails",
  });
  tube([0.48, 1.22, -0.66], [0, 1.88, -0.66], 0.025, WHITE, {
    bone: mastRear,
    name: "rearSailRight",
    group: "windSails",
  });
  tube([-0.48, 1.22, -0.66], [0.48, 1.22, -0.66], 0.027, CORAL, {
    bone: mastRear,
    name: "rearSailFoot",
    group: "windSails",
  });
  tube([0, 1.23, -0.66], [0, 1.78, -0.66], 0.016, PALE, {
    bone: mastRear,
    name: "rearSailSpine",
    group: "windSails",
  });

  // A second smaller forward vane, angled like a stabilizer.
  tube([0, 1.12, 0.34], [0, 1.71, 0.34], 0.028, BLUE, {
    bone: mastFront,
    name: "frontMast",
    group: "windSails",
  });
  tube([-0.34, 1.23, 0.34], [0, 1.71, 0.34], 0.022, IVORY, {
    bone: mastFront,
    name: "frontVaneLeft",
    group: "windSails",
  });
  tube([0.34, 1.23, 0.34], [0, 1.71, 0.34], 0.022, IVORY, {
    bone: mastFront,
    name: "frontVaneRight",
    group: "windSails",
  });
  tube([-0.34, 1.23, 0.34], [0.34, 1.23, 0.34], 0.023, ORANGE, {
    bone: mastFront,
    name: "frontVaneCrossbar",
    group: "windSails",
  });

  // Thin internal braces in the sail frames.
  for (const side of [-1, 1]) {
    tube(
      [side * 0.23, 1.34, -0.66],
      [side * 0.08, 1.68, -0.66],
      0.012,
      SAND,
      { bone: mastRear, name: `rearSailLattice${side}`, group: "windSails" },
    );
    tube(
      [side * 0.17, 1.3, 0.34],
      [side * 0.06, 1.61, 0.34],
      0.011,
      SAND,
      { bone: mastFront, name: `frontVaneLattice${side}`, group: "windSails" },
    );
  }

  // Front prow: forked nose and two small whisker-like wind feelers.
  tube([0, 1.11, 0.93], [0, 1.11, 1.28], 0.053, WHITE, {
    bone: nose,
    name: "noseTube",
    group: "front",
  });
  tube([-0.02, 1.16, 1.16], [-0.25, 1.34, 1.36], 0.017, TURQUOISE, {
    bone: nose,
    name: "leftWindFeelers",
    group: "front",
  });
  tube([0.02, 1.16, 1.16], [0.25, 1.34, 1.36], 0.017, TURQUOISE, {
    bone: nose,
    name: "rightWindFeelers",
    group: "front",
  });

  b.part(new THREE.SphereGeometry(0.068, 8, 5), CORAL, {
    at: [0, 1.11, 1.3],
    bone: nose,
    name: "noseCap",
    group: "front",
  });

  // Repeating rivets along the top rail and axle ends.
  for (let i = 0; i < 11; i++) {
    const z = -0.82 + i * 0.164;
    b.part(new THREE.SphereGeometry(0.018, 6, 4), ORANGE, {
      at: [0.058, 1.205, z],
      bone: hips,
      name: `topRivet${i}`,
      group: "rivets",
    });
  }

  for (const side of [-1, 1]) {
    for (const z of stations) {
      b.part(new THREE.SphereGeometry(0.032, 7, 5), IVORY, {
        at: [side * 0.59, 1.06, z],
        bone: hips,
        name: `axleEnd${side}_${z}`,
        group: "bearings",
      });
    }
  }

  // A few deliberately asymmetrical colored tubes make the sculpture feel assembled and hand-tuned.
  tube([-0.16, 1.16, -0.93], [0.16, 1.16, -0.93], 0.013, CORAL, {
    bone: hips,
    name: "rearColorTie",
    group: "details",
  });
  tube([-0.16, 1.16, 0.93], [0.16, 1.16, 0.93], 0.013, TURQUOISE, {
    bone: hips,
    name: "frontColorTie",
    group: "details",
  });

  return b.root;
}
