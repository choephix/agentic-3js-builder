```ts
import * as THREE from "three";
import { createBuilder, catmull } from "agentic-3js-builder";

export const meta = {
  name: "Wind-Walking Beach Creature",
  description:
    "A stylized Theo Jansen-inspired strandbeest assembled from faceted tubes, articulated walking legs, crank linkages, and a four-bladed wind rotor.",
};

export default function build() {
  const b = createBuilder({ name: "wind-walking-beach-creature", detail: 1 });

  const IVORY = "#e8dfc7";
  const IVORY_LIGHT = "#fff4d2";
  const GRAPHITE = "#242832";
  const CHARCOAL = "#11151d";
  const ORANGE = "#d66b32";
  const RUST = "#8e3f28";
  const BRASS = "#c59a52";
  const SAND = "#b8a98a";

  const core = b.joint("core", {
    at: [0, 1.33, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "body",
  });

  const bodyPath = catmull([
    [0, 1.34, -1.04],
    [0, 1.35, -0.62],
    [0, 1.36, 0],
    [0, 1.35, 0.62],
    [0, 1.34, 1.04],
  ]);

  const spine = b.chain("spine", bodyPath, {
    parent: core,
    count: 5,
    names: ["spineRear", "spine2", "spine3", "spine4", "spineFront"],
    role: "spine",
    group: "body",
  });

  const legChains: Array<{
    side: number;
    index: number;
    chain: any;
    points: THREE.Vector3[];
    hip: THREE.Vector3;
    knee: THREE.Vector3;
    ankle: THREE.Vector3;
    foot: THREE.Vector3;
  }> = [];

  const zStations = [-0.78, -0.28, 0.28, 0.78];

  // Skeleton first: eight long, deliberately angular walking legs.
  for (let i = 0; i < zStations.length; i++) {
    const z = zStations[i];

    for (const side of [1, -1]) {
      const frontBias = i % 2 === 0 ? 1 : -1;
      const hip = new THREE.Vector3(side * 0.19, 1.34, z);
      const knee = new THREE.Vector3(
        side * (0.43 + (i % 2) * 0.035),
        0.91,
        z + frontBias * 0.15,
      );
      const ankle = new THREE.Vector3(
        side * 0.61,
        0.38,
        z - frontBias * 0.22,
      );
      const foot = new THREE.Vector3(
        side * 0.68,
        0.075,
        z + frontBias * 0.28,
      );

      const suffix = side > 0 ? "L" : "R";
      const names = [
        `hip${suffix}${i + 1}`,
        `knee${suffix}${i + 1}`,
        `ankle${suffix}${i + 1}`,
        `foot${suffix}${i + 1}`,
      ];

      const parent = spine.joints[Math.min(4, Math.max(0, i))];
      const chain = b.chain(
        `leg${suffix}${i + 1}`,
        [hip, knee, ankle, foot],
        {
          parent,
          names,
          role: "leg",
          group: "walkingLegs",
          contact: [foot.x, 0, foot.z],
        },
      );

      legChains.push({ side, index: i, chain, points: [hip, knee, ankle, foot], hip, knee, ankle, foot });
    }
  }

  // A raised mast and rotor hub form the wind-catching silhouette.
  const mast = b.chain(
    "mast",
    [
      [0, 1.43, -0.84],
      [0, 1.78, -0.84],
      [0, 2.24, -0.84],
    ],
    {
      parent: core,
      names: ["mastBase", "mastMid", "mastTop"],
      role: "spine",
      group: "windmill",
    },
  );

  const windHub = b.joint("windHub", {
    parent: mast.tip,
    at: mast.tip.at,
    dir: [0, 0, 1],
    role: "hinge",
    group: "windmill",
  });

  // Main body, like a large pale PVC pneumatic tube.
  const body = b.sweep(spine, (t) => 0.135 - 0.012 * Math.abs(t - 0.5), {
    color: IVORY,
    sides: 8,
    section: "circle",
    caps: "round",
    group: "body",
    name: "mainBody",
    sectors: [
      [-55, 55, IVORY_LIGHT],
      [125, 235, SAND],
    ],
  });

  // Dark end caps and orange collar rings make the body read as assembled tubing.
  for (const t of [0, 1]) {
    const p = spine.at(t);
    b.part(new THREE.CylinderGeometry(0.112, 0.112, 0.035, 8), GRAPHITE, {
      at: p.at,
      dir: p.tangent,
      axis: "y",
      bone: p.bone,
      group: "bodyDetails",
      name: t === 0 ? "rearEndCap" : "frontEndCap",
    });
  }

  for (const t of [0.08, 0.28, 0.5, 0.72, 0.92]) {
    const p = spine.at(t);
    b.part(new THREE.TorusGeometry(0.139, 0.012, 6, 12), ORANGE, {
      at: p.at,
      dir: p.tangent,
      axis: "y",
      bone: p.bone,
      group: "bodyDetails",
      name: `bodyCollar${Math.round(t * 100)}`,
    });
  }

  // Walking legs: ivory tubes, dark socket blocks, orange ankle collars, and broad beach feet.
  for (const leg of legChains) {
    const { side, index, chain, points } = leg;

    b.sweep(chain, [0.062, 0.048, 0.041], {
      color: IVORY_LIGHT,
      section: { ngon: 6 },
      skin: "rigid",
      caps: "round",
      group: "walkingLegs",
      name: `legTube${side > 0 ? "L" : "R"}${index + 1}`,
    });

    for (let j = 0; j < chain.joints.length; j++) {
      const joint = chain.joints[j];
      const radius = j === 0 ? 0.082 : j === 1 ? 0.073 : 0.064;

      b.part(new THREE.SphereGeometry(radius, 8, 6), CHARCOAL, {
        bone: joint,
        at: joint.at,
        group: "legJoints",
        name: `${joint.name}Socket`,
      });

      if (j > 0) {
        b.part(new THREE.TorusGeometry(radius * 0.88, 0.012, 6, 10), ORANGE, {
          bone: joint,
          at: joint.at,
          group: "legJoints",
          name: `${joint.name}Collar`,
        });
      }
    }

    const footBone = chain.tip ?? chain.joints[chain.joints.length - 1];
    b.part(new THREE.BoxGeometry(0.15, 0.065, 0.28), GRAPHITE, {
      bone: footBone,
      at: points[3],
      group: "feet",
      name: `footPad${side > 0 ? "L" : "R"}${index + 1}`,
    });

    b.part(new THREE.BoxGeometry(0.11, 0.022, 0.25), SAND, {
      bone: footBone,
      at: [points[3].x, 0.039, points[3].z + side * 0.008],
      group: "feet",
      name: `footSole${side > 0 ? "L" : "R"}${index + 1}`,
    });

    // A visible crank/linkage rod runs from the upper leg toward the body axle.
    const crankZ = points[0].z;
    const crankPoint = new THREE.Vector3(side * 0.28, 1.24, crankZ + (index % 2 ? -0.075 : 0.075));
    b.rod(points[1], crankPoint, 0.018, GRAPHITE, {
      group: "linkages",
      name: `thighLink${side > 0 ? "L" : "R"}${index + 1}`,
    });

    const lowerLinkEnd = new THREE.Vector3(
      side * 0.32,
      0.91,
      points[2].z + (index % 2 ? 0.06 : -0.06),
    );
    b.rod(points[2], lowerLinkEnd, 0.014, BRASS, {
      group: "linkages",
      name: `shinLink${side > 0 ? "L" : "R"}${index + 1}`,
    });
  }

  // Transverse crankshaft and eccentric discs.
  for (let i = 0; i < zStations.length; i++) {
    const z = zStations[i];

    b.rod(
      [-0.58, 1.245, z],
      [0.58, 1.245, z],
      0.026,
      GRAPHITE,
      { group: "crankshaft", name: `crankAxle${i + 1}` },
    );

    for (const side of [1, -1]) {
      const eccentricZ = z + (i % 2 === 0 ? side * 0.085 : -side * 0.085);

      b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.034, 10), ORANGE, {
        at: [side * 0.26, 1.245, eccentricZ],
        dir: [1, 0, 0],
        axis: "y",
        group: "crankshaft",
        name: `eccentric${i + 1}${side > 0 ? "L" : "R"}`,
      });

      b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 8), BRASS, {
        at: [side * 0.29, 1.245, eccentricZ],
        dir: [1, 0, 0],
        axis: "y",
        group: "crankshaft",
        name: `eccentricPin${i + 1}${side > 0 ? "L" : "R"}`,
      });
    }
  }

  // Mast and its bracing.
  b.sweep(mast, 0.045, {
    color: IVORY,
    sides: 8,
    section: { ngon: 6 },
    caps: "round",
    group: "windmill",
    name: "mastTube",
  });

  b.rod([0, 1.48, -0.84], [0.33, 2.18, -0.84], 0.018, GRAPHITE, {
    group: "windmill",
    name: "mastBraceL",
  });
  b.rod([0, 1.48, -0.84], [-0.33, 2.18, -0.84], 0.018, GRAPHITE, {
    group: "windmill",
    name: "mastBraceR",
  });

  // Rotor hub, axle, spokes, and four broad, slightly asymmetrical beach sails.
  b.part(new THREE.CylinderGeometry(0.115, 0.115, 0.18, 10), GRAPHITE, {
    bone: windHub,
    at: windHub.at,
    dir: [0, 0, 1],
    axis: "y",
    group: "windmill",
    name: "windHubHousing",
  });

  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.28, 8), BRASS, {
    bone: windHub,
    at: windHub.at,
    dir: [0, 0, 1],
    axis: "y",
    group: "windmill",
    name: "windAxle",
  });

  const bladeOutline: [number, number, "sharp"][] = [
    [0, -0.06, "sharp"],
    [0.48, -0.075, "sharp"],
    [0.74, 0.015, "sharp"],
    [0.58, 0.105, "sharp"],
    [0.14, 0.075, "sharp"],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const radial = [Math.cos(angle), Math.sin(angle), 0];
    const tangent = [-Math.sin(angle), Math.cos(angle), 0];

    b.rod(
      windHub.at,
      [
        windHub.at.x + radial[0] * 0.66,
        windHub.at.y + radial[1] * 0.66,
        windHub.at.z,
      ],
      0.019,
      GRAPHITE,
      { bone: windHub, group: "windmill", name: `bladeSpoke${i + 1}` },
    );

    b.extrude(bladeOutline, {
      at: windHub.at,
      x: radial,
      y: tangent,
      thickness: 0.025,
      bevel: 0.006,
      smoothing: 0,
      color: IVORY_LIGHT,
      bone: windHub,
      group: "windmillSails",
      name: `windSail${i + 1}`,
    });

    const tipAt = new THREE.Vector3(
      windHub.at.x + radial[0] * 0.62,
      windHub.at.y + radial[1] * 0.62,
      windHub.at.z,
    );

    b.extrude(
      [
        [0, -0.045, "sharp"],
        [0.18, -0.05, "sharp"],
        [0.23, 0.045, "sharp"],
        [0, 0.05, "sharp"],
      ],
      {
        at: tipAt,
        x: radial,
        y: tangent,
        thickness: 0.032,
        bevel: 0.004,
        color: ORANGE,
        bone: windHub,
        group: "windmillSails",
        name: `sailTip${i + 1}`,
      },
    );
  }

  // Small riveted-looking face plates at the body sockets.
  for (const z of zStations) {
    for (const side of [1, -1]) {
      const plateAt = [side * 0.145, 1.34, z] as [number, number, number];
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.018, 8), GRAPHITE, {
        at: plateAt,
        dir: [side, 0, 0],
        axis: "y",
        group: "bodyDetails",
        name: `socketPlate${side > 0 ? "L" : "R"}${z}`,
      });

      b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, {
        at: [side * 0.158, 1.38, z + 0.035],
        group: "bodyDetails",
        name: `socketRivetA${side > 0 ? "L" : "R"}${z}`,
      });
      b.part(new THREE.SphereGeometry(0.014, 6, 4), BRASS, {
        at: [side * 0.158, 1.30, z - 0.035],
        group: "bodyDetails",
        name: `socketRivetB${side > 0 ? "L" : "R"}${z}`,
      });
    }
  }

  return b.root;
}
```