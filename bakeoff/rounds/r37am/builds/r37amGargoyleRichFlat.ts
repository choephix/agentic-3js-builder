import * as THREE from "three";
import { createBuilder, catmull, limb } from "../../../../src/index";

export const meta = {
  name: "Cathedral Gargoyle",
  description: "A crouching gothic stone gargoyle perched on a carved cathedral ledge, with spread bat wings, horns, fangs, claws, and weathered architectural detail.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#777782";
  const STONE_LIGHT = "#a3a0a1";
  const STONE_DARK = "#3c3b47";
  const STONE_DEEP = "#282834";
  const EDGE = "#b9b2ad";
  const MOSS = "#4e6654";
  const EYE = "#d38b35";
  const EYE_DARK = "#341b16";
  const TEETH = "#c6bba4";
  const IRON = "#262630";

  const box = (
    size: [number, number, number],
    color: string,
    at: THREE.Vector3 | [number, number, number],
    bone?: any,
    name?: string,
  ) => b.part(new THREE.BoxGeometry(...size), color, {
    at,
    bone,
    name,
    flat: true,
  });

  const sphere = (
    radius: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    scale: [number, number, number],
    bone?: any,
    name?: string,
  ) => b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
    at,
    scale,
    bone,
    name,
    flat: true,
  });

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: THREE.Vector3 | [number, number, number],
    dir: [number, number, number],
    bone?: any,
    name?: string,
  ) => b.part(new THREE.CylinderGeometry(radius, radius, height, 8), color, {
    at,
    dir,
    bone,
    name,
    flat: true,
  });

  const foot = (s: number, y: number, z: number, bone: any) => {
    box([0.18, 0.13, 0.30], STONE_DARK, [s * 0.34, y, z + 0.10], bone, `footBlock${s}`);
    box([0.15, 0.09, 0.34], STONE, [s * 0.34, y + 0.06, z + 0.21], bone, `sole${s}`);
    for (let i = 0; i < 3; i++) {
      const x = s * (0.27 + i * 0.07);
      b.spike(
        [x, y + 0.09, z + 0.36],
        [s * (i - 1) * 0.12, -0.08, 0.7],
        0.11,
        0.035,
        { color: TEETH, bone, name: `hindClaw${s}_${i}` },
      );
    }
  };

  // Skeleton first: one continuous crouched spine, hinged jaw, four legs, and two wing chains.
  const hips = b.joint("hips", {
    at: [0, 1.12, 0],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, 0],
      [0, 1.30, 0.03],
      [0, 1.52, 0.08],
      [0, 1.69, 0.13],
    ]),
    {
      parent: hips,
      names: ["spineLow", "spineMid", "spineHigh"],
      role: "spine",
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.67, 0.13],
      [0, 1.78, 0.19],
      [0, 1.88, 0.25],
    ]),
    {
      parent: spine.tip,
      names: ["neck", "neckTip"],
      role: "neck",
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.90, 0.27],
    dir: [0, -0.04, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.78, 0.40],
    dir: [0, -0.38, 0.92],
    role: "jaw",
    group: "head",
  });

  const legChains: any[] = [];
  for (const s of [1, -1]) {
    const hip = [s * 0.25, 1.10, -0.01] as [number, number, number];
    const target = [s * 0.34, 0.25, 0.28] as [number, number, number];
    const points = limb(
      hip,
      target,
      [0.42, 0.39, 0.27],
      [[0, 0, 1], [0, 0, -1]],
    );
    const leg = b.chain(`leg${s > 0 ? "L" : "R"}`, points, {
      parent: hips,
      names: [
        `hip${s > 0 ? "L" : "R"}`,
        `knee${s > 0 ? "L" : "R"}`,
        `ankle${s > 0 ? "L" : "R"}`,
      ],
      role: "leg",
      contact: target,
    });
    legChains.push(leg);
  }

  const armChains: any[] = [];
  for (const s of [1, -1]) {
    const shoulder = [s * 0.30, 1.52, 0.13] as [number, number, number];
    const hand = [s * 0.48, 0.98, 0.37] as [number, number, number];
    const points = limb(
      shoulder,
      hand,
      [0.31, 0.31, 0.25],
      [[0, -1, 0.3], [0, 0, 1]],
    );
    const arm = b.chain(`arm${s > 0 ? "L" : "R"}`, points, {
      parent: spine.joints[1],
      names: [
        `shoulder${s > 0 ? "L" : "R"}`,
        `elbow${s > 0 ? "L" : "R"}`,
        `wrist${s > 0 ? "L" : "R"}`,
      ],
      role: "arm",
    });
    armChains.push(arm);
  }

  const wingChains: any[] = [];
  for (const s of [1, -1]) {
    const wing = b.chain(
      `wing${s > 0 ? "L" : "R"}`,
      catmull([
        [s * 0.13, 1.55, -0.06],
        [s * 0.48, 1.76, -0.18],
        [s * 0.90, 1.92, -0.27],
        [s * 1.22, 1.67, -0.30],
        [s * 1.38, 1.30, -0.27],
      ]),
      {
        parent: spine.joints[1],
        names: [
          `wingRoot${s > 0 ? "L" : "R"}`,
          `wingElbow${s > 0 ? "L" : "R"}`,
          `wingMid${s > 0 ? "L" : "R"}`,
          `wingTip${s > 0 ? "L" : "R"}`,
        ],
        role: "wing",
      },
    );
    wingChains.push(wing);
  }

  // Simple stone ledge: a heavy gothic sill beneath the crouching creature.
  box([2.35, 0.18, 1.05], STONE_DARK, [0, 0.09, 0.12], undefined, "ledgeMass");
  box([2.48, 0.13, 1.13], STONE, [0, 0.23, 0.12], undefined, "ledgeTop");
  box([2.55, 0.08, 1.18], EDGE, [0, 0.315, 0.12], undefined, "ledgeLip");
  box([2.30, 0.20, 0.10], STONE_DEEP, [0, 0.055, -0.43], undefined, "ledgeShadow");

  for (const s of [1, -1]) {
    box([0.46, 0.22, 0.12], STONE_LIGHT, [s * 0.76, 0.39, -0.23], undefined, `ledgeCorbel${s}`);
    box([0.35, 0.16, 0.18], STONE_DARK, [s * 0.76, 0.26, -0.18], undefined, `ledgeCorbelLow${s}`);
    b.spike([s * 0.76, 0.39, -0.15], [0, 0.75, 0.22], 0.22, 0.08, {
      color: STONE_LIGHT,
      name: `corbelPoint${s}`,
    });
  }

  // Rough dressed blocks across the ledge front.
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.25;
    const row = Math.abs(i) % 2 === 0 ? 0 : 1;
    box(
      [0.22, 0.12, 0.10],
      row ? STONE : STONE_LIGHT,
      [x, 0.075 + row * 0.13, -0.46],
      undefined,
      `masonry_${i}`,
    );
  }

  // Main crouched body and haunches.
  b.sweep(spine, [0.27, 0.31, 0.25], {
    color: STONE,
    section: { ngon: 8 },
    name: "carvedSpine",
  });
  b.sweep(neck, [0.19, 0.15], {
    color: STONE,
    section: { ngon: 8 },
    name: "thickNeck",
  });

  for (const s of [1, -1]) {
    const leg = legChains[s > 0 ? 0 : 1];
    b.sweep(leg, [0.15, 0.12, 0.095], {
      color: STONE_DARK,
      section: { ngon: 7 },
      name: `hindLeg${s}`,
    });
    sphere(0.21, STONE, [s * 0.27, 1.02, 0.02], [1.15, 1.12, 0.95], hips, `haunch${s}`);
    foot(s, 0.38, 0.17, leg.tip);

    const arm = armChains[s > 0 ? 0 : 1];
    b.sweep(arm, [0.115, 0.085, 0.06], {
      color: STONE,
      section: { ngon: 7 },
      name: `forelimb${s}`,
    });
    sphere(0.14, STONE_LIGHT, [s * 0.48, 0.92, 0.39], [1, 0.8, 1.15], arm.tip, `palm${s}`);
    for (let i = 0; i < 3; i++) {
      b.spike(
        [s * (0.47 + i * 0.065), 0.90, 0.53],
        [s * (0.08 + i * 0.03), -0.15, 0.60],
        0.15,
        0.026,
        { color: TEETH, bone: arm.tip, name: `fingerClaw${s}_${i}` },
      );
    }
  }

  // Broad chest shield and carved abdominal planes.
  b.part(
    new THREE.SphereGeometry(1, 10, 7),
    STONE_LIGHT,
    {
      bone: spine.joints[1],
      at: [0, 1.38, 0.22],
      scale: [0.29, 0.40, 0.10],
      name: "chestShield",
      flat: true,
    },
  );
  for (let i = 0; i < 4; i++) {
    const y = 1.15 + i * 0.105;
    box([0.17 - i * 0.018, 0.035, 0.025], STONE_DARK, [0, y, 0.315], spine.joints[1], `bellyGroove${i}`);
  }
  for (const s of [1, -1]) {
    b.spike([s * 0.16, 1.53, 0.23], [s * 0.22, 0.06, 0.68], 0.17, 0.045, {
      color: EDGE,
      bone: spine.joints[1],
      name: `pectoralRidge${s}`,
    });
  }

  // Head, muzzle, cheek stones, and separate open jaw.
  sphere(0.25, STONE, [0, 1.91, 0.31], [1.12, 1.04, 1.02], head, "gargoyleSkull");
  box([0.27, 0.19, 0.29], STONE_LIGHT, [0, 1.83, 0.48], head, "muzzleBlock");
  sphere(0.12, STONE_DARK, [0, 1.79, 0.62], [1.12, 0.70, 0.70], jaw, "lowerJaw");
  box([0.19, 0.07, 0.19], STONE_DEEP, [0, 1.80, 0.67], jaw, "mouthCavity");

  for (const s of [1, -1]) {
    // Brow ledges.
    b.frustumBox(
      [s * 0.055, 2.035, 0.49],
      [s * 0.17, 2.02, 0.55],
      [0.055, 0.045],
      [0.035, 0.03],
      { color: STONE_DARK, bone: head, name: `heavyBrow${s}` },
    );
    // Eye socket and amber inset.
    sphere(0.065, STONE_DEEP, [s * 0.105, 1.94, 0.535], [1.1, 0.75, 0.48], head, `eyeSocket${s}`);
    sphere(0.035, EYE_DARK, [s * 0.105, 1.94, 0.571], [1, 1, 0.45], head, `eyeDark${s}`);
    sphere(0.019, EYE, [s * 0.105, 1.945, 0.589], [1, 1, 0.32], head, `eyeAmber${s}`);
    // Cheek and jaw corner blocks.
    sphere(0.13, STONE_LIGHT, [s * 0.20, 1.84, 0.42], [0.75, 0.9, 0.72], head, `cheek${s}`);
    // Ear fins.
    b.extrude(
      [
        [0, 0],
        [0.13, 0.02],
        [0.19, 0.20],
        [0.08, 0.15],
        [0.02, 0.28],
      ],
      {
        at: [s * 0.16, 1.98, 0.27],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        color: STONE,
        bone: head,
        name: `pointedEar${s}`,
      },
    );
    // Short cheek spikes.
    for (let i = 0; i < 2; i++) {
      b.spike(
        [s * (0.22 + i * 0.035), 1.77 - i * 0.08, 0.42],
        [s * 0.35, -0.06, 0.25],
        0.11,
        0.035,
        { color: STONE_DARK, bone: head, name: `cheekSpine${s}_${i}` },
      );
    }
  }

  // Nose, nostrils, fangs, and a row of square lower teeth.
  sphere(0.075, STONE_DARK, [0, 1.86, 0.65], [1.25, 0.65, 0.65], head, "nose");
  for (const s of [1, -1]) {
    sphere(0.018, EYE_DARK, [s * 0.037, 1.875, 0.704], [1, 0.7, 0.3], head, `nostril${s}`);
    b.spike([s * 0.11, 1.81, 0.68], [0, -1, 0.12], 0.12, 0.028, {
      color: TEETH,
      bone: jaw,
      name: `fang${s}`,
    });
  }
  for (let i = -2; i <= 2; i++) {
    b.spike([i * 0.052, 1.785, 0.69], [0, -1, 0.08], 0.07, 0.018, {
      color: TEETH,
      bone: jaw,
      name: `lowerTooth${i}`,
    });
  }

  // Crown horns, swept back from the skull.
  for (const s of [1, -1]) {
    const hornPath = catmull([
      [s * 0.14, 2.06, 0.29],
      [s * 0.21, 2.23, 0.17],
      [s * 0.30, 2.34, -0.03],
      [s * 0.40, 2.37, -0.20],
    ]);
    b.sweep(hornPath, (t: number) => 0.065 * (1 - t) + 0.008, {
      color: STONE_DARK,
      caps: "point",
      section: { ngon: 6 },
      bone: head,
      name: `crownHorn${s}`,
    });
    for (let i = 0; i < 3; i++) {
      const p = hornPath.at((i + 1) / 4);
      b.ring(
        { at: p, axis: hornPath.tangentAt((i + 1) / 4) },
        { count: 6, radius: 0.004, fromDeg: 0, toDeg: 360 },
        (r: any) => b.spike(r, r, 0.018, 0.006, { color: EDGE, name: `hornRidge${s}_${i}` }),
      );
    }
  }

  // Tail curling behind the ledge, with a pointed tip.
  const tail = b.chain(
    "tail",
    catmull([
      [0, 1.05, -0.12],
      [0, 0.90, -0.40],
      [0.10, 0.72, -0.68],
      [0.28, 0.60, -0.86],
      [0.45, 0.67, -0.96],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4"],
      role: "tail",
    },
  );
  b.sweep(tail, (t: number) => 0.12 * (1 - t) + 0.018, {
    color: STONE_DARK,
    section: { ngon: 7 },
    caps: "point",
    name: "coilingTail",
  });
  for (let i = 0; i < 4; i++) {
    const t = 0.12 + i * 0.18;
    b.spike(tail.at(t), [0, -0.25, -0.95], 0.10, 0.025, {
      color: EDGE,
      name: `tailScale${i}`,
    });
  }

  // Bat wings: dark leathery-looking stone membranes, framed by thick ribs.
  for (let wi = 0; wi < 2; wi++) {
    const s = wi === 0 ? 1 : -1;
    const wing = wingChains[wi];
    b.sweep(wing, [0.12, 0.10, 0.07, 0.035], {
      color: STONE_DARK,
      section: { ngon: 7 },
      name: `wingArm${s}`,
    });

    const root = wing.at(0);
    const outer = wing.at(1);
    const tip = wing.at(1);
    const lower = [s * 1.36, 1.28, -0.28] as [number, number, number];

    b.membrane(
      wing,
      catmull([
        [s * 0.14, 1.48, -0.12],
        [s * 0.56, 1.40, -0.25],
        [s * 0.98, 1.16, -0.28],
        lower,
      ]),
      {
        color: STONE_DEEP,
        thickness: 0.018,
        rows: 4,
        cols: 7,
        scallop: 0.12,
        name: `wingMembrane${s}`,
      },
    );

    // Finger bones radiating from the elbow toward the scalloped wing edge.
    const rays = [
      [[s * 0.48, 1.75, -0.19], [s * 1.22, 1.67, -0.30]],
      [[s * 0.55, 1.67, -0.20], [s * 1.38, 1.30, -0.28]],
      [[s * 0.55, 1.57, -0.22], [s * 1.30, 1.05, -0.25]],
    ];
    rays.forEach((r, i) => {
      b.rod(r[0], r[1], 0.025, {
        color: STONE_LIGHT,
        bone: wing.joints[Math.min(i + 1, wing.joints.length - 1)],
        name: `wingFinger${s}_${i}`,
      });
      for (let j = 1; j < 4; j++) {
        const a = new THREE.Vector3(...r[0]);
        const z = new THREE.Vector3(...r[1]);
        const p = a.lerp(z, j / 4);
        b.part(new THREE.SphereGeometry(0.026, 7, 5), EDGE, {
          at: p,
          bone: wing.joints[Math.min(i + 1, wing.joints.length - 1)],
          name: `wingKnuckle${s}_${i}_${j}`,
          flat: true,
        });
      }
    });

    // Little triangular stone spurs along the upper wing edge.
    for (let i = 0; i < 4; i++) {
      const p = wing.at(0.18 + i * 0.18).at;
      b.spike(p, [s * 0.15, 0.24, -0.05], 0.11, 0.026, {
        color: EDGE,
        name: `wingSpur${s}_${i}`,
      });
    }
  }

  // Neck and shoulder masonry plates, like carved overlapping armour.
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++) {
      const y = 1.43 + i * 0.105;
      b.part(
        new THREE.CylinderGeometry(0.095 - i * 0.012, 0.095 - i * 0.012, 0.035, 6),
        STONE_LIGHT,
        {
          at: [s * (0.16 + i * 0.025), y, 0.10],
          dir: [0, 0, 1],
          bone: spine.joints[1],
          name: `shoulderPlate${s}_${i}`,
          flat: true,
        },
      );
    }
  }

  // Moss tucked into upward-facing seams, kept sparse so stone remains the hero.
  for (const p of [
    [-0.72, 0.34, -0.20],
    [0.76, 0.35, -0.18],
    [0.18, 0.34, -0.40],
    [-0.20, 0.34, -0.40],
    [0.34, 1.73, 0.10],
    [-0.34, 1.73, 0.10],
  ] as [number, number, number][]) {
    sphere(0.035, MOSS, p, [1.5, 0.35, 0.8], undefined, "mossPatch");
  }

  // Carved pointed finial under the ledge, a gothic silhouette accent.
  b.extrude(
    [
      [0, 0],
      [0.22, 0.02],
      [0.15, 0.22],
      [0.07, 0.42],
      [0, 0.56],
      [-0.07, 0.42],
      [-0.15, 0.22],
      [-0.22, 0.02],
    ],
    {
      at: [0, -0.01, -0.43],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.09,
      color: STONE_DARK,
      name: "gothicFinial",
    },
  );

  // Tiny weathering chips and rivet-like carved bosses on the plinth.
  for (let i = 0; i < 12; i++) {
    const x = -1.02 + (i % 6) * 0.40;
    const y = 0.34 + Math.floor(i / 6) * 0.08;
    sphere(0.018, EDGE, [x, y, -0.505], [1.5, 0.65, 0.35], undefined, `ledgeChip${i}`);
  }

  return b.root;
}
