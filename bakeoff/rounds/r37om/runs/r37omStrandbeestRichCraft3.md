```ts
import * as THREE from "three";
import { createBuilder, catmull, bezier, svg } from "agentic-3js-builder";
import { cel, furEdge, inkLines, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Windwalker Beach Strider",
  description:
    "A Theo Jansen-inspired wind-walking beach creature assembled from faceted tubes, articulated legs, orange joint hubs, a dorsal wind rotor, and little mechanical beach feet.",
};

export default function build() {
  const b = createBuilder({ name: "windwalker", detail: 1 });

  const PVC = cel("#e7e0c9", "#8b8d7c", { threshold: 0.05 });
  const PVC_DARK = cel("#b9b7a6", "#565951");
  const ORANGE = cel("#f18a35", "#9c3e24");
  const ORANGE_EDGE = furEdge(ORANGE, "#6e3028", {
    level: -0.1,
    teeth: 0.15,
    period: 0.035,
    along: [0, 0, 1],
  });
  const BLACK = "#252a27";
  const RUBBER = cel("#383d39", "#151917");
  const BEACH = cel("#dfb96c", "#96713e");
  const BLUE = cel("#5ba9b1", "#245b67");

  // ---------------------------------------------------------------------------
  // Skeleton first: one long thorax and eight fully articulated walking legs.
  // ---------------------------------------------------------------------------

  const bodyPath = catmull([
    [0, 1.02, -0.82],
    [0, 1.10, -0.38],
    [0, 1.10, 0.12],
    [0, 1.04, 0.58],
    [0, 1.00, 0.86],
  ]);

  const body = b.chain("spine", bodyPath, {
    names: ["spineRear", "spineMidA", "spineMidB", "spineFront", "spineTip"],
    role: "spine",
  });

  const legChains: { chain: any; side: number; index: number }[] = [];
  const legZ = [-0.68, -0.25, 0.22, 0.68];

  for (const side of [1, -1]) {
    for (let i = 0; i < legZ.length; i++) {
      const z = legZ[i];
      const stagger = i % 2 === 0 ? 0.07 : -0.07;

      const points = [
        [side * 0.115, 1.055, z],
        [side * 0.39, 0.72, z + stagger],
        [side * 0.68, 0.30, z - stagger * 0.7],
        [side * 0.80, 0.072, z + stagger * 0.25],
        [side * 0.88, 0.052, z + stagger * 0.25],
      ] as number[][];

      const label = side > 0 ? "L" : "R";
      const chain = b.chain(`leg${label}${i + 1}`, points, {
        parent: body.joints[Math.min(i + 1, body.joints.length - 1)],
        names: [
          `hip${label}${i + 1}`,
          `knee${label}${i + 1}`,
          `ankle${label}${i + 1}`,
          `heel${label}${i + 1}`,
          `foot${label}${i + 1}`,
        ],
        role: "leg",
        contact: [side * 0.88, 0, z + stagger * 0.25],
      });

      legChains.push({ chain, side, index: i });
    }
  }

  const mast = b.joint("windMast", {
    parent: body.joints[2],
    at: [0, 1.08, 0.02],
    aim: [0, 1.78, 0.02],
    role: "spine",
  });

  const rotorHub = b.joint("rotorHub", {
    parent: mast,
    at: [0, 1.76, 0.04],
    dir: [0, 0, 1],
    role: "hinge",
  });

  // ---------------------------------------------------------------------------
  // Main pneumatic-looking body tubes.
  // ---------------------------------------------------------------------------

  const thorax = b.sweep(body, (t) => 0.105 - 0.012 * Math.abs(t - 0.5), {
    color: ORANGE_EDGE,
    sides: 8,
    caps: "round",
    name: "facetedThorax",
    group: "body",
  });

  // A dark underside rail makes the body read as a mechanical chassis.
  b.sweep(
    catmull([
      [0, 0.98, -0.72],
      [0, 0.96, -0.28],
      [0, 0.96, 0.22],
      [0, 0.94, 0.72],
    ]),
    0.035,
    {
      color: RUBBER,
      sides: 6,
      caps: "flat",
      bone: body.joints[1],
      name: "underslungRail",
      group: "body",
    },
  );

  // Cross axles visible between the paired legs.
  for (let i = 0; i < legZ.length; i++) {
    const z = legZ[i];
    b.rod(
      [ -0.28, 1.045, z ],
      [ 0.28, 1.045, z ],
      0.024,
      BLACK,
      {
        bone: body.joints[Math.min(i + 1, body.joints.length - 1)],
        name: `crossAxle${i + 1}`,
        section: { ngon: 6 },
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs: continuous tubes, orange pivots, dark hinge sleeves, and split feet.
  // ---------------------------------------------------------------------------

  for (const { chain, side, index } of legChains) {
    const label = side > 0 ? "L" : "R";

    b.sweep(chain, (t) => (t < 0.25 ? 0.047 : t < 0.58 ? 0.038 : 0.031), {
      color: PVC,
      sides: 7,
      caps: "round",
      name: `legTube${label}${index + 1}`,
      group: "legs",
    });

    // Broad orange pivot bosses at each articulated point.
    const pivotTs = [0, 0.25, 0.54, 0.79, 1];
    for (let j = 0; j < pivotTs.length; j++) {
      const p = chain.at(pivotTs[j]);
      const r = j === 0 ? 0.065 : j === 4 ? 0.045 : 0.054;

      b.part(new THREE.SphereGeometry(r, 8, 6), ORANGE, {
        at: p.at,
        bone: p.bone,
        name: `pivot${label}${index + 1}_${j}`,
        group: "joints",
      });

      if (j > 0 && j < 4) {
        b.part(
          new THREE.CylinderGeometry(r * 0.58, r * 0.58, 0.055, 8),
          BLACK,
          {
            at: p.at,
            bone: p.bone,
            dir: p.tangent,
            name: `hingeSleeve${label}${index + 1}_${j}`,
            group: "joints",
          },
        );
      }
    }

    // The characteristic broad two-pronged beach foot.
    const foot = chain.at(1);
    const toe = chain.at(0.98).at;
    const fz = toe.z;
    const fx = toe.x;

    b.rod(
      toe,
      [fx, 0.045, fz + 0.13],
      0.026,
      BEACH,
      {
        bone: chain.tip,
        section: { ngon: 6 },
        name: `frontSole${label}${index + 1}`,
        group: "feet",
      },
    );

    b.rod(
      toe,
      [fx, 0.045, fz - 0.13],
      0.026,
      BEACH,
      {
        bone: chain.tip,
        section: { ngon: 6 },
        name: `rearSole${label}${index + 1}`,
        group: "feet",
      },
    );

    b.part(new THREE.BoxGeometry(0.16, 0.035, 0.055), RUBBER, {
      at: [fx, 0.035, fz],
      bone: chain.tip,
      name: `sandPad${label}${index + 1}`,
      group: "feet",
    });

    // Small orange end pin and a dark tread stripe.
    b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.075, 8), ORANGE, {
      at: toe,
      bone: chain.tip,
      dir: [0, 0, 1],
      name: `footPin${label}${index + 1}`,
      group: "feet",
    });
  }

  // Mechanical braces running diagonally between neighboring leg roots.
  for (let i = 0; i < 3; i++) {
    const a = body.at((i + 1) / 5);
    const c = body.at((i + 2) / 5);

    for (const side of [1, -1]) {
      b.rod(
        [side * 0.15, a.at.y + 0.01, a.at.z],
        [side * 0.34, c.at.y - 0.02, c.at.z],
        0.016,
        PVC_DARK,
        {
          bone: body.joints[i + 1],
          name: `diagonalBrace${side > 0 ? "L" : "R"}${i}`,
          group: "bracing",
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Dorsal wind-catching rotor and triangular sail blades.
  // ---------------------------------------------------------------------------

  b.sweep(
    catmull([
      [0, 1.08, 0.02],
      [0, 1.30, 0.02],
      [0, 1.59, 0.03],
      [0, 1.76, 0.04],
    ]),
    0.032,
    {
      color: PVC,
      sides: 7,
      caps: "round",
      bone: mast,
      name: "windMastTube",
      group: "rotor",
    },
  );

  b.part(new THREE.CylinderGeometry(0.105, 0.105, 0.075, 10), ORANGE, {
    at: [0, 1.76, 0.04],
    bone: rotorHub,
    dir: [0, 0, 1],
    name: "rotorHubCap",
    group: "rotor",
  });

  b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.18, 8), BLACK, {
    at: [0, 1.76, 0.04],
    bone: rotorHub,
    dir: [0, 0, 1],
    name: "rotorAxle",
    group: "rotor",
  });

  const hub = new THREE.Vector3(0, 1.76, 0.085);
  const rotorAngles = [0, 120, 240];

  for (let i = 0; i < rotorAngles.length; i++) {
    const a = (rotorAngles[i] * Math.PI) / 180;
    const ux = Math.cos(a);
    const uy = Math.sin(a);

    const inner = hub.clone().add(new THREE.Vector3(ux * 0.055, uy * 0.055, 0));
    const outer = hub.clone().add(new THREE.Vector3(ux * 0.49, uy * 0.49, 0));
    const swept = hub
      .clone()
      .add(new THREE.Vector3(Math.cos(a + 0.26) * 0.33, Math.sin(a + 0.26) * 0.33, 0));

    b.sweep(
      bezier(inner, swept, swept.clone().add(new THREE.Vector3(ux * 0.10, uy * 0.10, 0)), outer),
      [0.036, 0.012],
      {
        color: PVC,
        bone: rotorHub,
        caps: { start: "round", end: "point" },
        sides: 6,
        name: `rotorBladeTube${i + 1}`,
        group: "rotor",
      },
    );

    const p1 = new THREE.Vector3(
      hub.x + ux * 0.075,
      hub.y + uy * 0.075,
      0.086,
    );
    const p2 = new THREE.Vector3(
      hub.x + Math.cos(a + 0.28) * 0.31,
      hub.y + Math.sin(a + 0.28) * 0.31,
      0.086,
    );
    const p3 = new THREE.Vector3(
      hub.x + ux * 0.47,
      hub.y + uy * 0.47,
      0.086,
    );

    b.slab([p1, p2, p3], {
      color: BLUE,
      thickness: 0.012,
      bone: rotorHub,
      name: `windSail${i + 1}`,
      group: "rotor",
    });

    b.part(new THREE.SphereGeometry(0.018, 6, 4), ORANGE, {
      at: outer,
      bone: rotorHub,
      name: `bladeTip${i + 1}`,
      group: "rotor",
    });
  }

  // A small rear pennant makes the wind direction readable from the silhouette.
  const pennant = b.extrude(
    [
      [0, 0],
      [0.18, 0.035],
      [0.34, 0.12],
      [0.17, 0.18],
      [0, 0.13],
    ],
    {
      at: [-0.002, 1.54, -0.78],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.004,
      color: BLUE,
      bone: body.joints[0],
      name: "windPennant",
      group: "detail",
    },
  );

  // ---------------------------------------------------------------------------
  // Small readable surface details: warning badge, bolts, and a front maker mark.
  // ---------------------------------------------------------------------------

  const badge = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <rect x="3" y="3" width="122" height="58" rx="8" fill="#252a27" stroke="#f3a447" stroke-width="5"/>
      <path d="M18 48 L31 16 L44 48 Z" fill="#f3a447"/>
      <path d="M31 25 L31 38" stroke="#252a27" stroke-width="5" stroke-linecap="round"/>
      <circle cx="31" cy="44" r="3" fill="#252a27"/>
      <text x="54" y="39" font-family="sans-serif" font-size="18" font-weight="bold" fill="#f3a447">WIND</text>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.PlaneGeometry(0.27, 0.135), "#ffffff", {
    at: [0, 1.105, 0.875],
    bone: body.joints[3],
    dir: [0, 0, 1],
    axis: "z",
    texture: badge,
    name: "windWarningBadge",
    group: "markings",
  });

  for (const side of [1, -1]) {
    for (const z of [-0.57, 0.03, 0.60]) {
      b.part(new THREE.SphereGeometry(0.018, 6, 4), ORANGE, {
        at: [side * 0.112, 1.108, z],
        bone: body.joints[2],
        name: `bodyRivet${side > 0 ? "L" : "R"}${Math.round((z + 0.6) * 10)}`,
        group: "rivets",
      });
    }
  }

  // A narrow front bumper and two bright end caps finish the kinetic-sculpture silhouette.
  b.rod(
    [-0.16, 1.02, 0.87],
    [0.16, 1.02, 0.87],
    0.028,
    ORANGE,
    {
      bone: body.joints[3],
      section: { ngon: 6 },
      name: "frontBumper",
      group: "body",
    },
  );

  b.part(new THREE.SphereGeometry(0.045, 8, 5), ORANGE, {
    at: [-0.17, 1.02, 0.87],
    bone: body.joints[3],
    name: "frontCapL",
    group: "body",
  });

  b.part(new THREE.SphereGeometry(0.045, 8, 5), ORANGE, {
    at: [0.17, 1.02, 0.87],
    bone: body.joints[3],
    name: "frontCapR",
    group: "body",
  });

  return b.root;
}
```