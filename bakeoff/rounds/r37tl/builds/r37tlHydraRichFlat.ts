import * as THREE from "three";
import {
  createBuilder,
  catmull,
  polyline,
  rng,
  limb,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "five-headed hydra",
  description:
    "A brutal five-headed hydra in a God of War-inspired low-poly style, with plated scales, open jaws, horns, dorsal spines, heavy legs, and glowing ember eyes.",
};

export default function build() {
  const b = createBuilder({ name: "five-headed-hydra", detail: 1 });

  const CHAR = "#17151a";
  const SCALE = "#302b2b";
  const SCALE_HI = "#544544";
  const SCALE_DARK = "#211a1d";
  const BELLY = "#574238";
  const BONE = "#b89b70";
  const BONE_DARK = "#73563d";
  const CLAW = "#d1b27b";
  const MOUTH = "#240b12";
  const GUM = "#7e2532";
  const TONGUE = "#bf4650";
  const EYE = "#ff8b18";
  const EYE_HI = "#ffd35c";
  const WOUND = "#7b2632";
  const BRONZE = "#6e4931";
  const INK = "#08070a";

  const hips = b.joint("hips", {
    at: [0, 0.88, -0.18],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 0.88, -0.9],
    [0, 0.98, -0.55],
    [0, 0.96, -0.1],
    [0, 1.03, 0.38],
    [0, 1.12, 0.72],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: hips,
    count: 5,
    names: ["spine1", "spine2", "spine3", "spine4", "spine5"],
    role: "spine",
  });

  const tailPath = catmull([
    [0, 0.89, -0.72],
    [0, 0.76, -1.18],
    [0.04, 0.62, -1.63],
    [-0.05, 0.47, -2.04],
    [0.12, 0.39, -2.38],
    [0.22, 0.35, -2.66],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: hips,
    count: 6,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  const legData = [
    {
      side: "L",
      x: 0.42,
      z: 0.38,
      foot: [0.53, 0.16, 0.58] as [number, number, number],
      bends: [[0, 0, 1], [0, 0, -1]],
    },
    {
      side: "R",
      x: -0.42,
      z: 0.38,
      foot: [-0.53, 0.16, 0.58] as [number, number, number],
      bends: [[0, 0, 1], [0, 0, -1]],
    },
    {
      side: "L",
      x: 0.42,
      z: -0.42,
      foot: [0.54, 0.15, -0.62] as [number, number, number],
      bends: [[0, 0, -1], [0, 0, 1]],
    },
    {
      side: "R",
      x: -0.42,
      z: -0.42,
      foot: [-0.54, 0.15, -0.62] as [number, number, number],
      bends: [[0, 0, -1], [0, 0, 1]],
    },
  ];

  const legs: any[] = [];
  for (let i = 0; i < legData.length; i++) {
    const d = legData[i];
    const root = [d.x, 0.91, d.z] as [number, number, number];
    const pts = limb(root, d.foot, [0.34, 0.32, 0.29], d.bends);
    const chain = b.chain(`leg${i < 2 ? "F" : "H"}${d.side}`, pts, {
      parent: spine.joints[i < 2 ? 3 : 1],
      names: [
        `hip${d.side}${i}`,
        `knee${d.side}${i}`,
        `ankle${d.side}${i}`,
      ],
      role: "leg",
      contact: d.foot,
    });
    legs.push(chain);
  }

  const headSpecs = [
    {
      id: "C",
      root: [0, 1.08, 0.54] as [number, number, number],
      mid: [0, 1.48, 0.75] as [number, number, number],
      head: [0, 1.92, 0.88] as [number, number, number],
      scale: 1.04,
    },
    {
      id: "L",
      root: [0.25, 1.06, 0.48] as [number, number, number],
      mid: [0.48, 1.42, 0.69] as [number, number, number],
      head: [0.66, 1.77, 0.86] as [number, number, number],
      scale: 0.88,
    },
    {
      id: "R",
      root: [-0.25, 1.06, 0.48] as [number, number, number],
      mid: [-0.48, 1.42, 0.69] as [number, number, number],
      head: [-0.66, 1.77, 0.86] as [number, number, number],
      scale: 0.88,
    },
    {
      id: "LL",
      root: [0.4, 1.02, 0.3] as [number, number, number],
      mid: [0.72, 1.26, 0.55] as [number, number, number],
      head: [1.02, 1.49, 0.7] as [number, number, number],
      scale: 0.72,
    },
    {
      id: "RR",
      root: [-0.4, 1.02, 0.3] as [number, number, number],
      mid: [-0.72, 1.26, 0.55] as [number, number, number],
      head: [-1.02, 1.49, 0.7] as [number, number, number],
      scale: 0.72,
    },
  ];

  const necks: any[] = [];
  const heads: any[] = [];
  const jaws: any[] = [];

  for (const spec of headSpecs) {
    const neck = b.chain(
      `neck${spec.id}`,
      catmull([spec.root, spec.mid, spec.head]),
      {
        parent: spine.joints[4],
        count: 3,
        names: [`neck${spec.id}1`, `neck${spec.id}2`, `neck${spec.id}3`],
        role: "neck",
      },
    );
    necks.push(neck);

    const head = b.joint(`head${spec.id}`, {
      parent: neck.tip,
      at: spec.head,
      dir: [0, 0, 1],
      role: "head",
      group: "heads",
    });
    heads.push(head);

    const jaw = b.joint(`jaw${spec.id}`, {
      parent: head,
      at: head.local([0, 0.12 * spec.scale, -0.12 * spec.scale]),
      dir: [0, 0.7, -0.25],
      role: "jaw",
      group: "jaws",
    });
    jaws.push(jaw);
  }

  // Main body, belly, and tail.
  b.sweep(spine, (t) => 0.28 - t * 0.035, {
    color: SCALE,
    section: { ngon: 8 },
    sides: 8,
    bands: [
      [0.22, SCALE_DARK],
      [0.56, SCALE],
      [0.82, SCALE_HI],
      [1, SCALE_DARK],
    ],
  });

  b.sweep(spine.path, (t) => 0.205 - t * 0.02, {
    bone: spine,
    color: BELLY,
    shift: [0, -0.09],
    section: { ngon: 8 },
    from: 0.08,
    to: 0.95,
  });

  b.sweep(tail, (t) => 0.22 * (1 - t) + 0.025, {
    color: SCALE_DARK,
    section: { ngon: 7 },
    bands: [
      [0.35, SCALE],
      [0.68, SCALE_HI],
      [0.88, WOUND],
      [1, BONE_DARK],
    ],
  });

  // Tail blade.
  b.extrude(
    [
      [0, 0],
      [0.13, 0.18],
      [0.07, 0.52],
      [0, 0.78],
      [-0.07, 0.52],
      [-0.13, 0.18],
    ],
    {
      at: tail.at(0.77).at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      color: BONE_DARK,
      bone: tail.at(0.77).bone,
      name: "tailBlade",
    },
  );

  // Dorsal armored ridge.
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + i * 0.095;
    const p = spine.at(t);
    b.spike(
      p.at,
      [0, 1, 0],
      0.12 + Math.sin(t * Math.PI) * 0.1,
      0.065,
      {
        color: BONE_DARK,
        bone: p.bone,
        name: `dorsalSpine${i}`,
      },
    );
  }

  // Neck tubes.
  for (let i = 0; i < necks.length; i++) {
    const neck = necks[i];
    const s = headSpecs[i].scale;
    b.sweep(neck, (t) => (0.16 - t * 0.065) * s, {
      color: SCALE,
      section: { ngon: 7 },
      sectors: [
        [-60, 60, SCALE_HI],
        [120, 240, BELLY],
      ],
    });

    for (let j = 0; j < 4; j++) {
      const p = neck.at(0.18 + j * 0.18);
      b.spike(p.at, [0, 1, 0], (0.1 - j * 0.012) * s, 0.038 * s, {
        color: BONE_DARK,
        bone: p.bone,
        name: `neckSpine${i}_${j}`,
      });
    }
  }

  // Legs and feet.
  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i];
    b.sweep(leg, (t) => (t < 0.48 ? 0.105 : 0.078) - t * 0.025, {
      color: SCALE_DARK,
      section: { ngon: 6 },
      skin: "rigid",
    });

    const tip = leg.tip;
    b.part(new THREE.SphereGeometry(0.11, 8, 5), SCALE, {
      bone: tip,
      at: tip.at,
      scale: [1, 0.55, 1.2],
      name: `foot${i}`,
    });

    for (let toe = -1; toe <= 1; toe++) {
      const start = tip.local([toe * 0.052, -0.045, 0.045]);
      const end = tip.local([toe * 0.074, -0.085, 0.19]);
      b.spike(start, end, null, 0.028, {
        color: CLAW,
        bone: tip,
        name: `claw${i}_${toe}`,
      });
    }
  }

  // Chest plates and shoulder armor.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.18, 8, 6), BRONZE, {
      bone: spine.joints[3],
      at: spine.joints[3].local([s * 0.25, 0.01, 0]),
      scale: [0.72, 1.08, 1.18],
      name: `shoulderPlate${s}`,
    });
    b.part(new THREE.BoxGeometry(0.13, 0.24, 0.28), BONE_DARK, {
      bone: spine.joints[3],
      at: spine.joints[3].local([s * 0.31, -0.02, 0.1]),
      rotation: [0, s * 18, s * 10],
      name: `shoulderRidge${s}`,
    });
  }

  // Five heads.
  for (let i = 0; i < headSpecs.length; i++) {
    const spec = headSpecs[i];
    const head = heads[i];
    const jaw = jaws[i];
    const s = spec.scale;
    const center = head.local([0, 0.11 * s, 0.08 * s]);

    const skull = b.part(
      new THREE.SphereGeometry(0.24 * s, 10, 7),
      SCALE,
      {
        bone: head,
        at: center,
        scale: [1.08, 1.0, 1.0],
        name: `skull${spec.id}`,
      },
    );

    b.part(new THREE.SphereGeometry(0.18 * s, 8, 6), SCALE_HI, {
      bone: head,
      at: head.local([0, 0.25 * s, 0.015 * s]),
      scale: [0.92, 1.1, 0.82],
      name: `browMass${spec.id}`,
    });

    b.part(new THREE.BoxGeometry(0.2 * s, 0.16 * s, 0.28 * s), SCALE_DARK, {
      bone: head,
      at: head.local([0, 0.32 * s, -0.015 * s]),
      rotation: [0, 0, 0],
      name: `muzzle${spec.id}`,
    });

    // Upper jaw plate and separate lower jaw.
    b.part(new THREE.BoxGeometry(0.22 * s, 0.1 * s, 0.3 * s), BONE_DARK, {
      bone: head,
      at: head.local([0, 0.43 * s, -0.02 * s]),
      name: `upperJaw${spec.id}`,
    });

    b.part(new THREE.BoxGeometry(0.2 * s, 0.105 * s, 0.29 * s), MOUTH, {
      bone: jaw,
      at: jaw.local([0, 0.11 * s, -0.035 * s]),
      name: `lowerMouth${spec.id}`,
    });

    b.part(new THREE.BoxGeometry(0.18 * s, 0.055 * s, 0.25 * s), GUM, {
      bone: jaw,
      at: jaw.local([0, 0.13 * s, 0.015 * s]),
      name: `lowerGum${spec.id}`,
    });

    b.part(new THREE.BoxGeometry(0.12 * s, 0.025 * s, 0.16 * s), TONGUE, {
      bone: jaw,
      at: jaw.local([0, 0.16 * s, 0.055 * s]),
      name: `tongue${spec.id}`,
    });

    // Teeth on both jaws.
    for (const side of [-1, 1]) {
      for (let tooth = 0; tooth < 4; tooth++) {
        const x = side * (0.055 + (tooth % 2) * 0.025) * s;
        const z = (tooth - 1.5) * 0.052 * s;
        b.spike(
          head.local([x, 0.43 * s, z]),
          [0, -1, 0],
          0.095 * s,
          0.021 * s,
          { color: BONE, bone: head, name: `upperFang${spec.id}_${side}_${tooth}` },
        );
        b.spike(
          jaw.local([x, 0.16 * s, z]),
          [0, 1, 0],
          0.07 * s,
          0.018 * s,
          { color: CLAW, bone: jaw, name: `lowerFang${spec.id}_${side}_${tooth}` },
        );
      }
    }

    // Eyes, placed on the front-facing brow.
    for (const side of [-1, 1]) {
      const eye = b.part(new THREE.SphereGeometry(0.041 * s, 8, 5), EYE, {
        bone: head,
        at: head.local([side * 0.105 * s, 0.27 * s, 0.095 * s]),
        scale: [1, 0.62, 1.16],
        name: `eye${spec.id}_${side}`,
      });
      glow(eye, 2.2);

      b.part(new THREE.SphereGeometry(0.013 * s, 6, 4), EYE_HI, {
        bone: head,
        at: head.local([side * 0.092 * s, 0.286 * s, 0.14 * s]),
        name: `eyeSpark${spec.id}_${side}`,
      });

      b.spike(
        head.local([side * 0.14 * s, 0.285 * s, 0.16 * s]),
        [0, 0.45, 0.9],
        0.075 * s,
        0.018 * s,
        { color: SCALE_DARK, bone: head, name: `browHorn${spec.id}_${side}` },
      );
    }

    // Crown horns.
    for (const side of [-1, 1]) {
      b.spike(
        head.local([side * 0.135 * s, 0.08 * s, 0.2 * s]),
        [side * 0.42, -0.05, 0.9],
        0.24 * s,
        0.055 * s,
        { color: BONE_DARK, bone: head, name: `crownHorn${spec.id}_${side}` },
      );
      b.spike(
        head.local([side * 0.17 * s, 0.02 * s, 0.14 * s]),
        [side * 0.6, -0.12, 0.8],
        0.18 * s,
        0.042 * s,
        { color: BONE, bone: head, name: `sideHorn${spec.id}_${side}` },
      );
    }

    // Brow and cheek armor plates.
    for (const side of [-1, 1]) {
      b.part(new THREE.BoxGeometry(0.12 * s, 0.045 * s, 0.16 * s), BONE_DARK, {
        bone: head,
        at: head.local([side * 0.11 * s, 0.31 * s, 0.18 * s]),
        rotation: [side * 16, 0, side * 20],
        name: `browPlate${spec.id}_${side}`,
      });
      b.part(new THREE.SphereGeometry(0.085 * s, 7, 5), SCALE_HI, {
        bone: head,
        at: head.local([side * 0.18 * s, 0.19 * s, 0.015 * s]),
        scale: [0.7, 0.92, 1.1],
        name: `cheekPlate${spec.id}_${side}`,
      });
    }

    // Head mane spikes running behind each skull.
    for (let k = 0; k < 4; k++) {
      const p = head.local([0, -0.04 * s - k * 0.065 * s, 0.16 * s]);
      b.spike(
        p,
        [0, -0.35, 0.94],
        (0.13 - k * 0.014) * s,
        0.035 * s,
        { color: BONE_DARK, bone: head, name: `mane${spec.id}_${k}` },
      );
    }

    // Open the jaws into a threatening rest pose.
    b.pose(jaw, { axis: [1, 0, 0], deg: -18 });
  }

  // Small scale studs over the shoulders and flanks.
  const studLocations = [
    [0.28, 1.11, 0.3],
    [-0.28, 1.11, 0.3],
    [0.34, 1.02, -0.03],
    [-0.34, 1.02, -0.03],
    [0.22, 1.06, -0.36],
    [-0.22, 1.06, -0.36],
  ];
  for (let i = 0; i < studLocations.length; i++) {
    b.part(new THREE.ConeGeometry(0.045, 0.09, 6), BONE_DARK, {
      bone: hips,
      at: studLocations[i],
      dir: [0, 1, 0],
      name: `armorStud${i}`,
    });
  }

  // Scars across the central neck and chest.
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.045;
    b.part(new THREE.BoxGeometry(0.018, 0.006, 0.16), WOUND, {
      bone: spine.joints[4],
      at: spine.joints[4].local([x, 0.06, 0.18]),
      rotation: [0.15, x * 3, 0.35],
      name: `scar${i}`,
    });
  }

  // A heavy central chest crest.
  b.extrude(
    [
      [0, 0],
      [0.18, 0.06],
      [0.13, 0.26],
      [0.06, 0.43],
      [0, 0.56],
      [-0.06, 0.43],
      [-0.13, 0.26],
      [-0.18, 0.06],
    ],
    {
      at: [0, 0.87, 0.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.045,
      bevel: 0.008,
      color: BRONZE,
      bone: spine.joints[3],
      name: "chestCrest",
    },
  );

  // Ground-contact talon tips are deliberately just above y=0.
  for (const d of legData) {
    b.part(new THREE.SphereGeometry(0.025, 6, 4), CLAW, {
      at: [d.foot[0], 0.035, d.foot[2]],
      bone: hips,
      name: "talonContact",
    });
  }

  return b.root;
}
