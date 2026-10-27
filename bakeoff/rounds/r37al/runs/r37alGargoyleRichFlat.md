```ts
import * as THREE from "three";
import { createBuilder, catmull, limb, rng } from "agentic-3js-builder";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle carved from heavy blocks, with folded-spread wings, horns, fangs, claws, a ridged tail, and a weathered cathedral ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = "#666873";
  const STONE_LIGHT = "#858893";
  const STONE_DARK = "#3c3e49";
  const STONE_SHADOW = "#292b35";
  const EDGE = "#a9abb0";
  const MOSS = "#526653";
  const MOSS_LIGHT = "#788b68";
  const EYE = "#d59a42";
  const EYE_DARK = "#311b18";
  const MOUTH = "#171820";
  const TOOTH = "#d0c6aa";
  const IRON = "#252730";

  const root = b.joint("pelvis", {
    at: [0, 1.03, -0.08],
    dir: [0, 0.05, 1],
    role: "spine",
  });

  const spinePath = catmull([
    [0, 1.03, -0.08],
    [0, 1.18, 0.08],
    [0, 1.39, 0.22],
    [0, 1.63, 0.27],
  ]);
  const spine = b.chain("spine", spinePath, {
    parent: root,
    names: ["spine1", "spine2", "shoulders", "neckBase"],
    role: "spine",
  });

  const neckPath = catmull([
    [0, 1.63, 0.27],
    [0, 1.78, 0.34],
    [0, 1.92, 0.43],
    [0, 2.02, 0.51],
  ]);
  const neck = b.chain("neck", neckPath, {
    parent: spine.tip,
    names: ["neck1", "neck2", "neck3", "neckTip"],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 2.04, 0.56],
    dir: [0, -0.04, 1],
    role: "head",
    group: "face",
  });
  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.91, 0.65],
    dir: [0, -0.45, 0.9],
    role: "jaw",
    group: "face",
  });

  const footL = [0.38, 0.22, 0.28] as const;
  const footR = [-0.38, 0.22, 0.28] as const;
  const hindL = limb([0.36, 1.02, -0.02], footL, [0.34, 0.38, 0.23], [
    [0, 0, 1],
    [0, 0, -1],
  ]);
  const hindR = limb([-0.36, 1.02, -0.02], footR, [0.34, 0.38, 0.23], [
    [0, 0, 1],
    [0, 0, -1],
  ]);
  const legL = b.chain("legL", hindL, {
    parent: root,
    names: ["hipL", "kneeL", "ankleL", "heelL"],
    role: "leg",
    contact: footL,
  });
  const legR = b.chain("legR", hindR, {
    parent: root,
    names: ["hipR", "kneeR", "ankleR", "heelR"],
    role: "leg",
    contact: footR,
  });

  const handL = [0.48, 0.78, 0.68] as const;
  const handR = [-0.48, 0.78, 0.68] as const;
  const armLPoints = limb([0.48, 1.55, 0.22], handL, [0.28, 0.3, 0.22], [
    [0, -1, 1],
    [0, 1, 1],
  ]);
  const armRPoints = limb([-0.48, 1.55, 0.22], handR, [0.28, 0.3, 0.22], [
    [0, -1, 1],
    [0, 1, 1],
  ]);
  const armL = b.chain("armL", armLPoints, {
    parent: spine.joints[2],
    names: ["shoulderL", "elbowL", "wristL", "handL"],
    role: "arm",
  });
  const armR = b.chain("armR", armRPoints, {
    parent: spine.joints[2],
    names: ["shoulderR", "elbowR", "wristR", "handR"],
    role: "arm",
  });

  const tailPath = catmull([
    [0, 0.98, -0.28],
    [0, 0.83, -0.65],
    [0.06, 0.67, -0.98],
    [0.17, 0.56, -1.27],
    [0.27, 0.62, -1.48],
    [0.31, 0.76, -1.65],
  ]);
  const tail = b.chain("tail", tailPath, {
    parent: root,
    names: ["tail1", "tail2", "tail3", "tail4", "tail5", "tailTip"],
    role: "tail",
  });

  const wingLPath = catmull([
    [0.39, 1.55, 0.14],
    [0.72, 1.71, 0.04],
    [1.01, 1.94, -0.08],
    [1.22, 2.18, -0.16],
  ]);
  const wingRPath = catmull([
    [-0.39, 1.55, 0.14],
    [-0.72, 1.71, 0.04],
    [-1.01, 1.94, -0.08],
    [-1.22, 2.18, -0.16],
  ]);
  const wingL = b.chain("wingL", wingLPath, {
    parent: spine.joints[2],
    names: ["wingRootL", "wingMidL", "wingTipL", "wingEdgeL"],
    role: "wing",
  });
  const wingR = b.chain("wingR", wingRPath, {
    parent: spine.joints[2],
    names: ["wingRootR", "wingMidR", "wingTipR", "wingEdgeR"],
    role: "wing",
  });

  const box = (
    size: [number, number, number],
    at: any,
    color = STONE,
    bone?: any,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      bone,
      flat: true,
      name,
    });

  const sphere = (
    radius: number,
    at: any,
    color = STONE,
    bone?: any,
    scale?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      bone,
      scale,
      flat: true,
      name,
    });

  const cone = (r: number, h: number, at: any, dir: any, color = STONE, bone?: any, name?: string) =>
    b.part(new THREE.ConeGeometry(r, h, 7), color, {
      at,
      dir,
      bone,
      flat: true,
      name,
    });

  // Cathedral ledge: broad chamfer-like stacked masonry.
  box([2.55, 0.18, 1.65], [0, 0.09, -0.18], STONE_DARK, undefined, "ledgeFoundation");
  box([2.32, 0.18, 1.48], [0, 0.27, -0.16], STONE, undefined, "ledgeTop");
  box([2.5, 0.08, 1.7], [0, 0.39, -0.16], EDGE, undefined, "ledgeCoping");
  box([2.65, 0.10, 0.16], [0, 0.43, 0.62], STONE_DARK, undefined, "frontDrip");
  for (const x of [-1.05, -0.35, 0.35, 1.05]) {
    box([0.035, 0.23, 1.45], [x, 0.28, -0.16], STONE_SHADOW, undefined, "masonrySeam");
  }
  for (const z of [-0.68, -0.05, 0.56]) {
    box([2.28, 0.025, 0.025], [0, 0.39, z], EDGE, undefined, "ledgeMoulding");
  }
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) {
    sphere(0.035, [x, 0.44, 0.57], MOSS, undefined, undefined, "ledgeMoss");
  }

  // Main body mass, with a pale carved belly.
  b.sweep(spine, (t) => 0.27 - t * 0.045, {
    color: STONE,
    section: { ngon: 8 },
    sides: 8,
    name: "stoneTorso",
  });
  b.sweep(spinePath, (t) => 0.22 - t * 0.035, {
    color: STONE_DARK,
    shift: [0, -0.13],
    section: { ngon: 8 },
    bone: [root, ...spine.joints],
    name: "lowerTorsoShadow",
  });
  box([0.32, 0.54, 0.045], [0, 1.31, 0.48], STONE_LIGHT, spine.joints[1], "chestKeystone");
  for (let i = 0; i < 5; i++) {
    const y = 1.13 + i * 0.09;
    b.rod([-0.16, y, 0.47], [0.16, y, 0.47], 0.012, EDGE, { bone: spine.joints[1], name: "ribCarving" });
  }

  // Neck, skull, muzzle, jaw.
  b.sweep(neck, (t) => 0.2 - t * 0.025, {
    color: STONE,
    section: { ngon: 8 },
    name: "thickNeck",
  });
  sphere(0.34, [0, 2.03, 0.53], STONE, head, [1.12, 0.95, 1.0], "gargoyleSkull");
  sphere(0.225, [0, 1.91, 0.78], STONE_LIGHT, jaw, [1.1, 0.72, 1.25], "muzzle");
  b.sweep(catmull([
    [-0.16, 1.88, 0.88],
    [0, 1.84, 0.93],
    [0.16, 1.88, 0.88],
  ]), 0.025, { color: MOUTH, bone: jaw, name: "mouthCrease" });
  box([0.28, 0.045, 0.12], [0, 1.83, 0.90], MOUTH, jaw, "openMouth");
  sphere(0.065, [0, 1.92, 0.99], EYE_DARK, jaw, [1.35, 0.65, 0.6], "nose");
  for (const s of [-1, 1]) {
    // brows and cheek plates
    b.rod([s * 0.12, 2.14, 0.78], [s * 0.29, 2.16, 0.69], 0.035, STONE_DARK, { bone: head, name: "heavyBrow" });
    sphere(0.115, [s * 0.23, 1.95, 0.79], STONE_LIGHT, jaw, [1, 0.8, 1.3], "cheekRuff");
    sphere(0.061, [s * 0.145, 2.06, 0.82], EYE, head, [1.0, 0.72, 0.5], "glowingEye");
    sphere(0.024, [s * 0.145, 2.06, 0.875], EYE_DARK, head, [0.7, 0.7, 0.35], "eyePupil");
    b.rod([s * 0.18, 2.095, 0.85], [s * 0.10, 2.105, 0.87], 0.012, EDGE, { bone: head, name: "eyeHighlight" });
  }

  // Horns and crown-like brow spikes.
  for (const s of [-1, 1]) {
    const horn = catmull([
      [s * 0.19, 2.23, 0.48],
      [s * 0.26, 2.43, 0.39],
      [s * 0.30, 2.57, 0.25],
    ]);
    b.sweep(horn, [0.075, 0.012], {
      color: STONE_DARK,
      bone: head,
      caps: { start: "round", end: "point" },
      name: "curvedHorn",
    });
    for (let i = 0; i < 3; i++) {
      b.ring(horn.at(0.18 + i * 0.22), { count: 1, radius: 0.068 }, (r: any) =>
        b.part(new THREE.TorusGeometry(0.057, 0.009, 5, 8), EDGE, {
          frame: r,
          bone: head,
          name: "hornRing",
        }),
      );
    }
    cone(0.055, 0.22, [s * 0.31, 2.29, 0.44], [s * 0.12, 0.9, -0.12], STONE_LIGHT, head, "browSpike");
  }

  // Teeth, individually readable and slightly uneven.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = s * (0.045 + i * 0.055);
      cone(0.018, 0.075 - i * 0.008, [x, 1.845, 0.948], [0, -1, 0.06], TOOTH, jaw, "fang");
    }
  }
  cone(0.045, 0.16, [0, 1.92, 1.04], [0, 0.2, 1], TOOTH, jaw, "noseFang");

  // Legs and armored haunches.
  for (const [s, chain] of [[1, legL], [-1, legR] as any]) {
    b.sweep(chain, (t: number) => 0.12 - t * 0.045, {
      color: STONE,
      section: { ngon: 6 },
      name: "crouchedLeg",
    });
    sphere(0.19, [s * 0.34, 0.88, -0.03], STONE_DARK, root, [1.05, 1.15, 1.2], "haunch");
    sphere(0.13, [s * 0.38, 0.54, 0.17], STONE_LIGHT, chain.joints[1], [1, 1.15, 1], "kneeKnuckle");
    box([0.22, 0.09, 0.36], [s * 0.38, 0.28, 0.31], STONE_DARK, chain.tip, "heelBlock");
    box([0.30, 0.09, 0.34], [s * 0.38, 0.22, 0.43], STONE, chain.tip, "footPad");
    for (let i = -1; i <= 1; i++) {
      b.spike([s * (0.38 + i * 0.075), 0.23, 0.55], [0, -0.05, 1], 0.16, 0.035, {
        color: EDGE,
        bone: chain.tip,
        name: "toeClaw",
      });
    }
  }

  // Arms, wrists, palms, three stone claws.
  for (const [s, chain] of [[1, armL], [-1, armR] as any]) {
    b.sweep(chain, (t: number) => 0.105 - t * 0.035, {
      color: STONE,
      section: { ngon: 6 },
      name: "forelimb",
    });
    sphere(0.145, [s * 0.47, 0.79, 0.66], STONE_LIGHT, chain.tip, [1.1, 0.8, 1.2], "palm");
    for (let i = -1; i <= 1; i++) {
      const p = [s * (0.47 + i * 0.075), 0.73, 0.79] as const;
      b.spike(p, [0, -0.28, 0.96], 0.2, 0.035, {
        color: TOOTH,
        bone: chain.tip,
        name: "fingerClaw",
      });
    }
    b.spike([s * 0.39, 0.82, 0.73], [s * 0.7, -0.15, 0.72], 0.18, 0.038, {
      color: TOOTH,
      bone: chain.tip,
      name: "thumbClaw",
    });
  }

  // Tail with increasingly angular dorsal barbs.
  b.sweep(tail, (t: number) => 0.13 * (1 - t) + 0.018, {
    color: STONE_DARK,
    section: { ngon: 7 },
    name: "segmentedTail",
  });
  for (let i = 0; i < 9; i++) {
    const at = tail.at(0.08 + i * 0.105);
    b.spike(at, [0, 0.7, -0.25], 0.12 - i * 0.008, 0.035, {
      color: EDGE,
      bone: at.bone,
      name: "tailDorsalSpine",
    });
  }
  b.spike(tail.at(1), [0.25, 0.28, -0.95], 0.25, 0.08, {
    color: STONE_LIGHT,
    bone: tail.tip,
    name: "tailArrowhead",
  });

  // Monumental wings: stone spars plus leathery carved membranes.
  for (const [wing, s] of [[wingL, 1], [wingR, -1] as any]) {
    const edge = b.sweep(wing, (t: number) => 0.075 - t * 0.045, {
      color: STONE_DARK,
      section: { ngon: 6 },
      name: "wingSpar",
    });
    b.membrane(
      wingPathFor(s, 0.0),
      wingPathFor(s, 1.0),
      { color: STONE_SHADOW, thickness: 0.018, rows: 4, cols: 7, scallop: 0.12, name: "wingMembrane" },
    );
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const p = wing.at(t);
      b.spike(p, [s * 0.7, 0.55, -0.25], 0.14 - i * 0.012, 0.028, {
        color: EDGE,
        bone: p.bone,
        name: "wingRib",
      });
    }
    b.spike(wing.at(1), [s * 0.18, 0.85, -0.22], 0.25, 0.045, {
      color: EDGE,
      bone: wing.tip,
      name: "wingTipClaw",
    });
  }

  // Wing membrane helper paths use built points so they inherit wing bones.
  function wingPathFor(side: number, edge: number) {
    if (edge === 0) {
      return catmull([
        [side * 0.40, 1.57, 0.13],
        [side * 0.69, 1.64, 0.01],
        [side * 0.98, 1.84, -0.12],
        [side * 1.18, 2.14, -0.17],
      ]);
    }
    return catmull([
      [side * 0.42, 1.48, 0.09],
      [side * 0.69, 1.42, -0.15],
      [side * 0.93, 1.56, -0.45],
      [side * 1.14, 1.90, -0.58],
    ]);
  }

  // Wing carved scallops and lower hanging stone points.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x = s * (0.62 + i * 0.13);
      const y = 1.43 + i * 0.07;
      const z = -0.22 - i * 0.06;
      cone(0.045, 0.22 - i * 0.018, [x, y, z], [s * 0.12, -0.7, -0.5], STONE_LIGHT, spine.joints[2], "wingScallop");
    }
  }

  // Gargoyle shoulder epaulettes and carved straps.
  for (const s of [-1, 1]) {
    sphere(0.16, [s * 0.42, 1.57, 0.19], EDGE, spine.joints[2], [1.2, 0.55, 1.3], "shoulderBoss");
    for (let i = 0; i < 4; i++) {
      b.rod([s * (0.31 + i * 0.06), 1.48, 0.38], [s * (0.35 + i * 0.06), 1.40, 0.40], 0.012, STONE_DARK, {
        bone: spine.joints[2],
        name: "shoulderGroove",
      });
    }
  }

  // Crown of small weathered spikes behind the skull.
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.075;
    cone(0.045, 0.18 - Math.abs(i) * 0.012, [x, 2.27, 0.34], [i * 0.07, 0.95, -0.12], STONE_DARK, head, "crownSpire");
  }

  // Moss and erosion plaques deliberately placed on upward ledges and shoulders.
  for (const p of [
    [-0.62, 1.72, 0.32],
    [0.67, 1.70, 0.31],
    [-0.18, 2.29, 0.48],
    [0.24, 2.30, 0.47],
    [-0.55, 0.46, 0.52],
    [0.51, 0.46, 0.51],
  ]) {
    sphere(0.055, p, MOSS, undefined, [1.8, 0.35, 0.8], "mossPatch");
  }
  for (const p of [
    [-0.59, 1.75, 0.36],
    [0.72, 1.73, 0.35],
    [0.30, 2.33, 0.48],
    [-0.32, 0.47, 0.54],
  ]) {
    sphere(0.025, p, MOSS_LIGHT, undefined, [2, 0.35, 0.9], "mossHighlight");
  }

  // Raised gothic tracery emblem on the chest.
  b.extrude(
    [
      [0, 0.24],
      [-0.065, 0.12],
      [-0.045, 0],
      [0, 0.075],
      [0.045, 0],
      [0.065, 0.12],
    ],
    {
      at: [0, 1.34, 0.515],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      color: EDGE,
      bone: spine.joints[1],
      name: "gothicChestEmblem",
    },
  );
  for (const s of [-1, 1]) {
    b.rod([s * 0.08, 1.24, 0.525], [s * 0.15, 1.34, 0.525], 0.012, EDGE, {
      bone: spine.joints[1],
      name: "emblemBranch",
    });
  }

  // Small iron hanging chain beneath the ledge, reinforcing the cathedral setting.
  for (let i = 0; i < 5; i++) {
    const y = 0.35 - i * 0.07;
    b.part(new THREE.TorusGeometry(0.045, 0.009, 5, 8), IRON, {
      at: [0.92, y, 0.53],
      rotation: [i % 2 ? 90 : 0, 0, i % 2 ? 18 : 0],
      name: "ironChain",
    });
  }

  return b.root;
}
```