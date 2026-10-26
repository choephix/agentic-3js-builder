```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
} from "agentic-3js-builder";
import { metal, panelled, gearTrain } from "agentic-3js-builder/kits/clockwork";
import { cel, furEdge } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Aeolian Strandwalker",
  description:
    "An abstract Theo Jansen-inspired wind-walking beach creature assembled from articulated tubes, crank axles, sails, ribs, gears, and twelve stilted kinetic legs.",
};

export default function build() {
  const b = createBuilder({ name: "aeolian-strandwalker", detail: 0.8, paintSize: 1024 });

  const PVC = panelled(metal("steel", { polish: 0.18, tarnish: 0.12 }), {
    size: 0.12,
    aspect: 0.52,
    rivets: 0.055,
    seam: "#26313a",
  });
  const PVC_LIGHT = furEdge(
    "#f0e5c5",
    "#9e9276",
    {
      axis: [0, 1, 0],
      level: 0.05,
      teeth: 0.18,
      period: 0.08,
      along: [0, 0, 1],
      ink: "#5b5545",
      inkWidth: 0.025,
    },
  );
  const JOINT = metal("copper", { polish: 0.5, tarnish: 0.1, verdigris: 0.08 });
  const DARK = metal("iron", { polish: 0.1, tarnish: 0.42 });
  const BRASS = metal("brass", { polish: 0.55, tarnish: 0.18 });
  const SAIL = cel("#d47b43", "#703842", { threshold: 0.0 });
  const SAIL_PALE = cel("#e9c77b", "#8d5940", { threshold: -0.05 });
  const INK = "#211b20";
  const SEA_BLUE = "#326b78";

  const root = b.joint("pelvis", {
    at: [0, 0.98, 0],
    dir: [0, 0, 1],
    role: "spine",
    group: "main",
  });

  const spinePath = catmull([
    [0, 1.02, -0.78],
    [0, 1.05, -0.48],
    [0, 1.06, -0.12],
    [0, 1.05, 0.26],
    [0, 1.02, 0.62],
    [0, 1.0, 0.82],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spine0", "spine1", "spine2", "spine3", "spine4", "spineTip"],
    role: "spine",
    group: "main",
  });

  const legChains: Array<{ side: number; index: number; chain: any }> = [];
  const zStations = [-0.62, -0.38, -0.12, 0.16, 0.43, 0.68];

  // Skeleton first: six articulated legs on each side.
  for (const side of [1, -1]) {
    for (let i = 0; i < zStations.length; i++) {
      const z = zStations[i];
      const forward = i % 2 === 0 ? 0.075 : -0.06;
      const pts = [
        [side * 0.27, 1.01, z],
        [side * 0.39, 0.73, z + forward],
        [side * 0.61, 0.39, z - forward * 0.8],
        [side * 0.79, 0.075, z + forward * 1.25],
      ];
      const prefix = side > 0 ? "legL" : "legR";
      const names = [
        `${prefix}${i}_hip`,
        `${prefix}${i}_knee`,
        `${prefix}${i}_ankle`,
        `${prefix}${i}_foot`,
      ];
      const chain = b.chain(`${prefix}${i}`, pts, {
        parent: root,
        names,
        role: "leg",
        group: "legs",
        contact: [side * 0.79, 0, z + forward * 1.25],
      });
      legChains.push({ side, index: i, chain });
    }
  }

  const mast = b.joint("mast", {
    parent: spine.joints[2],
    at: [0, 1.08, -0.05],
    dir: [0, 1, 0],
    role: "hinge",
    group: "sails",
  });
  const vane = b.joint("vane", {
    parent: mast,
    at: [0, 1.86, -0.05],
    dir: [0, 0, 1],
    role: "fan",
    group: "sails",
  });

  // Secondary hinge skeleton for the rear wind fan.
  const fanRoot = b.joint("tailHinge", {
    parent: spine.tip,
    at: [0, 1.01, 0.8],
    dir: [0, 0, 1],
    role: "hinge",
    group: "tail",
  });
  const fanChains: any[] = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const end = [side * (0.25 + i * 0.13), 1.34 + i * 0.045, 1.25 + i * 0.1];
      const c = b.chain(`tailFan${side > 0 ? "L" : "R"}${i}`, [
        [0, 1.01, 0.8],
        [side * (0.12 + i * 0.035), 1.12 + i * 0.025, 1.02],
        end,
      ], {
        parent: fanRoot,
        names: [
          `tail${side > 0 ? "L" : "R"}${i}_base`,
          `tail${side > 0 ? "L" : "R"}${i}_mid`,
          `tail${side > 0 ? "L" : "R"}${i}_tip`,
        ],
        role: "tail",
        group: "tail",
      });
      fanChains.push(c);
    }
  }

  // Kinetic axle skeletons from the clockwork train.
  const leftDrive = gearTrain(b, {
    at: [0.39, 1.06, -0.08],
    axis: [1, 0, 0],
    up: [0, 1, 0],
    module: 0.014,
    spin: "driveL",
    bone: root,
    group: "drive",
    style: "solid",
    color: [BRASS, JOINT, DARK],
    gears: [
      { teeth: 18, spokes: 5, bore: 0.018 },
      { teeth: 10, angle: 92, bore: 0.014 },
      { teeth: 14, from: 1, angle: -104, spokes: 4, bore: 0.014 },
    ],
  });
  const rightDrive = gearTrain(b, {
    at: [-0.39, 1.06, 0.22],
    axis: [1, 0, 0],
    up: [0, 1, 0],
    module: 0.014,
    spin: "driveR",
    bone: root,
    group: "drive",
    style: "solid",
    color: [BRASS, JOINT, DARK],
    gears: [
      { teeth: 18, spokes: 5, bore: 0.018 },
      { teeth: 10, angle: -92, bore: 0.014 },
      { teeth: 14, from: 1, angle: 104, spokes: 4, bore: 0.014 },
    ],
  });
  leftDrive.spin(8);
  rightDrive.spin(-8);

  // Main articulated tube.
  const body = b.sweep(spine, (t) => [0.145 - 0.025 * t, 0.105 - 0.018 * t], {
    color: PVC,
    section: "box",
    sides: 8,
    group: "body",
  });

  // Tapered belly keel, deliberately offset beneath the spine like a real frame.
  b.sweep(catmull([
    [0, 0.99, -0.74],
    [0, 0.91, -0.3],
    [0, 0.89, 0.18],
    [0, 0.93, 0.66],
  ]), (t) => [0.075 - t * 0.025, 0.065 - t * 0.018], {
    bone: spine,
    color: DARK,
    section: "box",
    group: "body",
  });

  // Six transverse ribs and their paired diagonal braces.
  for (let i = 0; i < 6; i++) {
    const z = zStations[i];
    b.rod([-0.34, 1.04, z], [0.34, 1.04, z], 0.018, DARK, {
      bone: root,
      group: "ribs",
      name: `crossRib${i}`,
    });
    b.rod([-0.31, 1.1, z - 0.035], [0.31, 0.98, z + 0.035], 0.011, PVC_LIGHT, {
      bone: root,
      group: "ribs",
      name: `ribBraceA${i}`,
    });
    b.rod([0.31, 1.1, z - 0.035], [-0.31, 0.98, z + 0.035], 0.011, PVC_LIGHT, {
      bone: root,
      group: "ribs",
      name: `ribBraceB${i}`,
    });
  }

  // Leg tubes, knee blocks, pivot collars, and flat beach feet.
  for (const { side, index, chain } of legChains) {
    b.sweep(chain, (t) => t < 0.38 ? 0.042 : t < 0.75 ? 0.032 : 0.024, {
      color: PVC_LIGHT,
      section: "box",
      skin: "rigid",
      group: "legs",
      name: `tubeLeg${side > 0 ? "L" : "R"}${index}`,
    });

    for (let j = 0; j < 3; j++) {
      const joint = chain.joints[j];
      b.part(new THREE.CylinderGeometry(0.064, 0.064, 0.037, 10), JOINT, {
        bone: joint,
        at: joint.at,
        dir: joint.axis,
        flat: true,
        group: "legPivots",
        name: `pivot${side > 0 ? "L" : "R"}${index}_${j}`,
      });
      b.part(new THREE.SphereGeometry(0.075, 8, 5), DARK, {
        bone: joint,
        at: joint.at,
        scale: [1, 0.58, 1],
        flat: true,
        group: "legPivots",
        name: `hub${side > 0 ? "L" : "R"}${index}_${j}`,
      });
    }

    const tip = chain.tip;
    b.part(new THREE.BoxGeometry(0.13, 0.045, 0.16), DARK, {
      bone: tip,
      at: tip.at,
      dir: [0, 0, 1],
      flat: true,
      group: "feet",
      name: `sole${side > 0 ? "L" : "R"}${index}`,
    });
    b.part(new THREE.BoxGeometry(0.07, 0.018, 0.025), BRASS, {
      bone: tip,
      at: [side * 0.79, 0.102, zStations[index] + (index % 2 === 0 ? 0.09 : -0.05)],
      dir: [0, 1, 0],
      flat: true,
      group: "feet",
      name: `solePlate${side > 0 ? "L" : "R"}${index}`,
    });
  }

  // Crankshafts running across the frame, with offset crank arms feeding alternate legs.
  for (let i = 0; i < 6; i++) {
    const z = zStations[i];
    b.rod([-0.48, 1.04, z], [0.48, 1.04, z], 0.018, DARK, {
      bone: root,
      group: "axles",
      name: `axle${i}`,
    });
    for (const side of [-1, 1]) {
      const phase = (i % 2 === 0 ? 1 : -1) * side;
      b.rod(
        [side * 0.34, 1.04, z],
        [side * 0.34, 1.04 + 0.095 * phase, z + 0.08 * phase],
        0.014,
        JOINT,
        { bone: root, group: "cranks", name: `crank${side > 0 ? "L" : "R"}${i}` },
      );
      b.part(new THREE.CylinderGeometry(0.033, 0.033, 0.022, 8), BRASS, {
        bone: root,
        at: [side * 0.34, 1.04, z],
        dir: [1, 0, 0],
        flat: true,
        group: "cranks",
        name: `crankPin${side > 0 ? "L" : "R"}${i}`,
      });
    }
  }

  // Tall catching mast and two broad fabric-like triangular sails.
  b.sweep(catmull([
    [0, 1.02, -0.08],
    [0, 1.42, -0.06],
    [0, 1.88, -0.04],
  ]), [0.035, 0.022], {
    bone: mast,
    color: DARK,
    section: "box",
    group: "mast",
  });

  const sailGlyph = svg(`
    <svg viewBox="0 0 128 128">
      <path d="M18 105 Q49 72 103 18" fill="none" stroke="#fff1bd" stroke-width="8"/>
      <path d="M22 75 Q50 55 82 58 Q51 69 28 94Z" fill="#332331" opacity=".8"/>
      <circle cx="94" cy="30" r="10" fill="#e9c77b" stroke="#332331" stroke-width="4"/>
    </svg>`, { size: 192 });

  for (const side of [-1, 1]) {
    const sail = b.extrude(
      [
        [-0.48, 0],
        [0.42, 0],
        [0.22, 0.37],
        [-0.12, 0.72],
        [-0.42, 0.93],
        [-0.52, 0.43],
      ],
      {
        at: [side * 0.035, 1.1, -0.34],
        x: [0, 0, side],
        y: [0, 1, 0],
        thickness: [0.014, 0.006],
        bevel: 0.006,
        smoothing: 1,
        color: side > 0 ? SAIL : SAIL_PALE,
        bone: mast,
        group: "sails",
        name: `triangularSail${side > 0 ? "L" : "R"}`,
      },
    );
    b.part(new THREE.PlaneGeometry(0.25, 0.25), "#ffffff", {
      bone: mast,
      at: [side * 0.052, 1.48, -0.33],
      dir: [side, 0, 0],
      axis: "z",
      texture: sailGlyph,
      group: "sailMarks",
      name: `sailMark${side > 0 ? "L" : "R"}`,
    });
  }

  // A high wind vane, made from two swept blades and a small counterweight.
  b.sweep(catmull([
    [0, 1.83, -0.05],
    [0, 1.98, 0.02],
    [0, 2.08, 0.27],
  ]), [0.018, 0.006], {
    bone: vane,
    color: PVC_LIGHT,
    caps: "point",
    group: "vane",
  });
  b.extrude(
    [
      [-0.05, 0],
      [0.34, 0.03],
      [0.49, 0.12],
      [0.24, 0.19],
      [-0.02, 0.11],
    ],
    {
      at: [0, 2.02, 0.12],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.012,
      bevel: 0.004,
      color: SAIL_PALE,
      bone: vane,
      group: "vane",
      name: "windFlag",
    },
  );

  // Rear fan: a spread of thin, elegant tubes like a tail made from wind-catching reeds.
  for (const chain of fanChains) {
    b.sweep(chain, [0.018, 0.006], {
      color: sideColor(chain),
      skin: "rigid",
      caps: "point",
      group: "tail",
      name: `fanTube${fanChains.indexOf(chain)}`,
    });
    const tip = chain.tip;
    b.part(new THREE.SphereGeometry(0.028, 7, 5), BRASS, {
      bone: tip,
      at: tip.at,
      flat: true,
      group: "tail",
      name: `fanCap${fanChains.indexOf(chain)}`,
    });
  }

  // Small repeated wind-baffle fins along the spine.
  for (let i = 0; i < 5; i++) {
    const z = -0.58 + i * 0.28;
    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.08, 0.13],
        [0.025, 0.21],
        [-0.03, 0.09],
      ],
      {
        at: [0, 1.13, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color: i % 2 ? SAIL : SAIL_PALE,
        bone: spine.joints[Math.min(i, spine.joints.length - 1)],
        group: "spineFins",
        name: `spineFin${i}`,
      },
    );
  }

  // A few visible fasteners and ceramic-colored spacers make the mechanism read as assembled.
  for (let i = 0; i < 14; i++) {
    const z = -0.7 + i * 0.105;
    const side = i % 2 === 0 ? 1 : -1;
    b.part(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 8), BRASS, {
      bone: root,
      at: [side * 0.151, 1.11, z],
      dir: [side, 0, 0],
      flat: true,
      group: "fasteners",
      name: `fastener${i}`,
    });
  }

  return b.root;

  function sideColor(chain: any) {
    const x = chain.joints?.[0]?.at?.x ?? 0;
    return x >= 0 ? PVC_LIGHT : PVC;
  }
}
```