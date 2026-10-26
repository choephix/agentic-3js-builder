```ts
import * as THREE from "three";
import { createBuilder, catmull, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: an oversized faceted sword fused with a revolver drum, ornate guard, glowing runes, brass fittings, and a heavy mechanical hilt.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#596273";
  const STEEL_DARK = "#202735";
  const STEEL_LIGHT = "#aebbd0";
  const EDGE = "#dbe7f5";
  const BLACK = "#111522";
  const IRON = "#343b4b";
  const BRASS = "#b9792d";
  const GOLD = "#f0c15b";
  const GOLD_DARK = "#75451d";
  const RED = "#a83235";
  const LEATHER = "#43251e";
  const LEATHER_LIGHT = "#754337";
  const CYAN = "#50e7ff";
  const CYAN_DARK = "#176b8c";
  const WHITE = "#f4fbff";

  const detailRng = rng(42);

  // ---------------------------------------------------------------------------
  // Main blade: a broad, aggressive Final Fantasy silhouette.
  // ---------------------------------------------------------------------------

  const bladeOutline: [number, number, "sharp"?][] = [
    [-0.075, 0.51, "sharp"],
    [-0.145, 0.66, "sharp"],
    [-0.155, 1.23, "sharp"],
    [-0.125, 1.48, "sharp"],
    [-0.055, 1.69, "sharp"],
    [0.0, 1.78, "sharp"],
    [0.055, 1.69, "sharp"],
    [0.125, 1.48, "sharp"],
    [0.155, 1.23, "sharp"],
    [0.145, 0.66, "sharp"],
    [0.075, 0.51, "sharp"],
  ];

  const blade = b.extrude(bladeOutline, {
    at: [0, 0, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.008,
    color: STEEL,
    name: "bladeMain",
    group: "blade",
  });

  // Shadowed rear face and a bright central blade plane.
  b.extrude(
    [
      [-0.038, 0.61, "sharp"],
      [-0.083, 0.72, "sharp"],
      [-0.086, 1.24, "sharp"],
      [-0.054, 1.46, "sharp"],
      [0.0, 1.66, "sharp"],
      [0.054, 1.46, "sharp"],
      [0.086, 1.24, "sharp"],
      [0.083, 0.72, "sharp"],
      [0.038, 0.61, "sharp"],
    ],
    {
      at: [0, 0, 0.041],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.008,
      bevel: 0.003,
      color: STEEL_LIGHT,
      name: "bladeFace",
      group: "blade",
    },
  );

  // Gold fuller and dark inset channels.
  b.extrude(
    [
      [-0.022, 0.64, "sharp"],
      [-0.043, 0.74, "sharp"],
      [-0.043, 1.31, "sharp"],
      [-0.021, 1.49, "sharp"],
      [0.0, 1.59, "sharp"],
      [0.021, 1.49, "sharp"],
      [0.043, 1.31, "sharp"],
      [0.043, 0.74, "sharp"],
      [0.022, 0.64, "sharp"],
    ],
    {
      at: [0, 0, 0.049],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.007,
      bevel: 0.002,
      color: GOLD,
      name: "goldenFuller",
      group: "blade",
    },
  );

  b.part(new THREE.BoxGeometry(0.018, 0.86, 0.009), STEEL_DARK, {
    at: [0, 1.08, 0.058],
    name: "fullerShadow",
    group: "blade",
  });

  // Strong cutting-edge rails.
  b.rod([-0.125, 0.73, 0.052], [-0.11, 1.39, 0.052], 0.012, {
    color: EDGE,
    name: "edgeL",
    group: "blade",
  });
  b.rod([0.125, 0.73, 0.052], [0.11, 1.39, 0.052], 0.012, {
    color: EDGE,
    name: "edgeR",
    group: "blade",
  });
  b.rod([-0.11, 1.39, 0.052], [-0.045, 1.67, 0.052], 0.009, {
    color: EDGE,
    name: "tipEdgeL",
    group: "blade",
  });
  b.rod([0.11, 1.39, 0.052], [0.045, 1.67, 0.052], 0.009, {
    color: EDGE,
    name: "tipEdgeR",
    group: "blade",
  });

  // Decorative blade shoulder plates.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.105, 0.035, "sharp"],
        [0.09, 0.105, "sharp"],
        [0.025, 0.075, "sharp"],
      ],
      {
        at: [s * 0.075, 0.49, 0.057],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.014,
        bevel: 0.003,
        color: GOLD,
        name: `shoulderPlate${s > 0 ? "L" : "R"}`,
        group: "blade",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Glowing runes and small blade ornaments.
  // ---------------------------------------------------------------------------

  const runeShapes: [number, number][][] = [
    [
      [-0.018, -0.025],
      [0.0, -0.052],
      [0.018, -0.025],
      [0.0, 0.025],
    ],
    [
      [-0.014, -0.026],
      [0.0, 0.04],
      [0.014, -0.026],
      [0.0, -0.006],
    ],
    [
      [-0.022, -0.01],
      [0.0, 0.04],
      [0.022, -0.01],
      [0.0, -0.036],
    ],
  ];

  for (let i = 0; i < 6; i++) {
    const y = 0.72 + i * 0.135;
    const shape = runeShapes[i % runeShapes.length];
    const rune = b.extrude(shape, {
      at: [0, y, 0.066],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bevel: 0.001,
      color: i % 2 ? CYAN : CYAN_DARK,
      name: `rune${i}`,
      group: "runes",
    });
    glow(rune, i % 2 ? 2.2 : 1.35);
  }

  // Small gold rivets down the spine.
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.SphereGeometry(0.012, 8, 5), GOLD, {
      at: [0, 0.69 + i * 0.115, 0.071],
      name: `bladeRivet${i}`,
      group: "blade",
    });
  }

  // ---------------------------------------------------------------------------
  // Guard: a wide swept crossguard with hooked terminals.
  // ---------------------------------------------------------------------------

  const guardPath = catmull([
    [-0.31, 0.52, 0.01],
    [-0.23, 0.55, 0.035],
    [0.0, 0.57, 0.06],
    [0.23, 0.55, 0.035],
    [0.31, 0.52, 0.01],
  ]);

  b.sweep(guardPath, 0.038, {
    color: BRASS,
    sides: 8,
    name: "sweptGuard",
    group: "guard",
  });

  for (const s of [-1, 1]) {
    b.rod([s * 0.275, 0.525, 0.01], [s * 0.36, 0.58, 0.01], 0.029, {
      color: GOLD_DARK,
      name: `guardHook${s > 0 ? "L" : "R"}`,
      group: "guard",
    });
    b.spike([s * 0.35, 0.585, 0.01], [s * 0.11, 0.08, 0.0], 0.13, 0.027, {
      color: GOLD,
      name: `guardClaw${s > 0 ? "L" : "R"}`,
      group: "guard",
    });
  }

  for (let i = -3; i <= 3; i++) {
    b.part(new THREE.SphereGeometry(0.018, 8, 5), GOLD, {
      at: [i * 0.075, 0.563 + Math.abs(i) * -0.002, 0.087],
      name: `guardBolt${i + 3}`,
      group: "guard",
    });
  }

  // Central guard socket.
  b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.11, 10), IRON, {
    at: [0, 0.53, 0.07],
    dir: [0, 0, 1],
    name: "guardSocket",
    group: "guard",
  });
  b.part(new THREE.CylinderGeometry(0.066, 0.066, 0.118, 10), GOLD, {
    at: [0, 0.53, 0.075],
    dir: [0, 0, 1],
    name: "guardSocketTrim",
    group: "guard",
  });

  // ---------------------------------------------------------------------------
  // Revolver drum and gun mechanism.
  // ---------------------------------------------------------------------------

  const drumCenter: [number, number, number] = [0, 0.68, 0.15];

  b.part(new THREE.CylinderGeometry(0.14, 0.14, 0.17, 12), STEEL_DARK, {
    at: drumCenter,
    dir: [0, 0, 1],
    name: "revolverDrum",
    group: "mechanism",
  });
  b.part(new THREE.CylinderGeometry(0.118, 0.118, 0.178, 12), STEEL, {
    at: [0, 0.68, 0.156],
    dir: [0, 0, 1],
    name: "drumFace",
    group: "mechanism",
  });
  b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.194, 10), GOLD_DARK, {
    at: [0, 0.68, 0.162],
    dir: [0, 0, 1],
    name: "drumAxle",
    group: "mechanism",
  });
  b.part(new THREE.CylinderGeometry(0.027, 0.027, 0.204, 10), GOLD, {
    at: [0, 0.68, 0.168],
    dir: [0, 0, 1],
    name: "drumAxleCap",
    group: "mechanism",
  });

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.sin(a) * 0.078;
    const y = 0.68 + Math.cos(a) * 0.078;

    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.014, 8), BLACK, {
      at: [x, y, 0.255],
      dir: [0, 0, 1],
      name: `chamber${i}`,
      group: "mechanism",
    });
    b.part(new THREE.CylinderGeometry(0.032, 0.032, 0.008, 8), GOLD_DARK, {
      at: [x, y, 0.263],
      dir: [0, 0, 1],
      name: `chamberRim${i}`,
      group: "mechanism",
    });
    b.part(new THREE.SphereGeometry(0.009, 6, 4), GOLD, {
      at: [x, y, 0.272],
      name: `chamberRivet${i}`,
      group: "mechanism",
    });
  }

  // Drum side straps and rotation teeth.
  for (const z of [0.065, 0.235]) {
    b.part(new THREE.CylinderGeometry(0.145, 0.145, 0.018, 12), BRASS, {
      at: [0, 0.68, z],
      dir: [0, 0, 1],
      name: `drumBand${z}`,
      group: "mechanism",
    });
  }

  // Barrel, sight, and muzzle.
  b.rod([0, 0.68, 0.255], [0, 0.68, 0.49], 0.047, {
    color: STEEL_DARK,
    name: "barrel",
    group: "mechanism",
  });
  b.rod([0, 0.68, 0.285], [0, 0.68, 0.475], 0.025, {
    color: STEEL_LIGHT,
    name: "barrelHighlight",
    group: "mechanism",
  });
  b.part(new THREE.CylinderGeometry(0.067, 0.057, 0.042, 10), GOLD, {
    at: [0, 0.68, 0.49],
    dir: [0, 0, 1],
    name: "muzzleCollar",
    group: "mechanism",
  });
  b.part(new THREE.CylinderGeometry(0.046, 0.046, 0.052, 10), BLACK, {
    at: [0, 0.68, 0.52],
    dir: [0, 0, 1],
    name: "muzzleBore",
    group: "mechanism",
  });
  b.part(new THREE.BoxGeometry(0.045, 0.045, 0.11), GOLD, {
    at: [0, 0.738, 0.31],
    name: "frontSight",
    group: "mechanism",
  });
  b.part(new THREE.BoxGeometry(0.075, 0.018, 0.06), STEEL_LIGHT, {
    at: [0, 0.79, 0.33],
    name: "rearSight",
    group: "mechanism",
  });

  // Upper receiver plates.
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.055, 0.25, 0.035), IRON, {
      at: [s * 0.1, 0.67, 0.095],
      name: `receiverSide${s > 0 ? "L" : "R"}`,
      group: "mechanism",
    });
    b.part(new THREE.BoxGeometry(0.018, 0.19, 0.045), GOLD, {
      at: [s * 0.132, 0.68, 0.12],
      name: `receiverTrim${s > 0 ? "L" : "R"}`,
      group: "mechanism",
    });
  }

  // Trigger guard and trigger.
  const triggerPath = catmull([
    [-0.055, 0.49, 0.12],
    [-0.065, 0.42, 0.16],
    [-0.025, 0.37, 0.17],
    [0.035, 0.4, 0.16],
  ]);
  b.sweep(triggerPath, 0.014, {
    color: GOLD_DARK,
    sides: 7,
    name: "triggerGuard",
    group: "mechanism",
  });
  b.spike([0.008, 0.455, 0.18], [0.015, -0.075, 0.01], 0.09, 0.012, {
    color: GOLD,
    name: "trigger",
    group: "mechanism",
  });

  // Small glowing status lamp.
  const lamp = b.part(new THREE.SphereGeometry(0.022, 8, 5), CYAN, {
    at: [0.13, 0.72, 0.145],
    name: "statusLamp",
    group: "mechanism",
  });
  glow(lamp, 2.5);

  // ---------------------------------------------------------------------------
  // Grip, pommel, and leather wrapping.
  // ---------------------------------------------------------------------------

  const gripPath = catmull([
    [0, 0.48, 0.015],
    [0.015, 0.36, -0.005],
    [0.035, 0.22, -0.07],
    [0.055, 0.115, -0.12],
  ]);

  b.sweep(gripPath, (t) => 0.066 - t * 0.012, {
    color: LEATHER,
    sides: 8,
    name: "grip",
    group: "hilt",
  });

  // Wrapped leather bands.
  for (let i = 0; i < 7; i++) {
    const t = 0.09 + i * 0.125;
    const p = gripPath.at(t);
    const tangent = gripPath.tangentAt(t);
    const a = p.clone().addScaledVector(tangent, -0.035);
    const c = p.clone().addScaledVector(tangent, 0.035);
    b.rod(a, c, 0.009, {
      color: i % 2 ? LEATHER_LIGHT : GOLD_DARK,
      name: `gripWrap${i}`,
      group: "hilt",
    });
  }

  // Grip side rails.
  for (const s of [-1, 1]) {
    b.rod(
      [s * 0.053, 0.44, 0.035],
      [s * 0.085, 0.15, -0.09],
      0.011,
      {
        color: BRASS,
        name: `gripRail${s > 0 ? "L" : "R"}`,
        group: "hilt",
      },
    );
  }

  // Pommel assembly, resting nearly on the floor.
  b.part(new THREE.CylinderGeometry(0.075, 0.09, 0.05, 10), IRON, {
    at: [0.055, 0.075, -0.125],
    dir: [0, 1, 0],
    name: "pommelBase",
    group: "hilt",
  });
  b.part(new THREE.SphereGeometry(0.071, 10, 6), GOLD_DARK, {
    at: [0.055, 0.055, -0.145],
    name: "pommel",
    group: "hilt",
  });
  b.part(new THREE.SphereGeometry(0.038, 8, 5), CYAN, {
    at: [0.055, 0.057, -0.205],
    name: "pommelGem",
    group: "hilt",
  });
  const pommelGlow = b.part(new THREE.SphereGeometry(0.025, 8, 5), WHITE, {
    at: [0.055, 0.057, -0.228],
    name: "pommelGemHighlight",
    group: "hilt",
  });
  glow(pommelGlow, 1.8);

  // Pommel guard prongs.
  for (const s of [-1, 1]) {
    b.spike(
      [0.055 + s * 0.045, 0.09, -0.16],
      [s * 0.07, 0.02, -0.04],
      0.09,
      0.018,
      {
        color: GOLD,
        name: `pommelProng${s > 0 ? "L" : "R"}`,
        group: "hilt",
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Final decorative hardware: bolt rows, tiny fins, and engraved plates.
  // ---------------------------------------------------------------------------

  for (let i = 0; i < 5; i++) {
    const y = 0.28 + i * 0.055;
    b.part(new THREE.SphereGeometry(0.013, 7, 5), GOLD, {
      at: [0.105, y, 0.12],
      name: `receiverBolt${i}`,
      group: "mechanism",
    });
  }

  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.095, 0.02, "sharp"],
        [0.065, 0.085, "sharp"],
        [0.02, 0.06, "sharp"],
      ],
      {
        at: [s * 0.16, 0.66, 0.06],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: GOLD_DARK,
        name: `sideFin${s > 0 ? "L" : "R"}`,
        group: "mechanism",
      },
    );
  }

  // Tiny colored inspection marks on the mechanism.
  for (let i = 0; i < 4; i++) {
    const mark = b.part(new THREE.BoxGeometry(0.012, 0.032, 0.006), i % 2 ? RED : CYAN, {
      at: [-0.145, 0.59 + i * 0.055, 0.12],
      name: `inspectionMark${i}`,
      group: "mechanism",
    });
    if (i % 2 === 0) glow(mark, 1.2);
  }

  return b.root;
}
```