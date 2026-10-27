import * as THREE from "three";
import {
  createBuilder,
  catmull,
  limb,
  rng,
} from "../../../../src/index";
import { cel, furEdge, animeEye, INK } from "../../../../kits/toon";

export const meta = {
  name: "chibi axolotl",
  description:
    "A cheerful chibi axolotl with a chunky pink body, broad paddle feet, glossy eyes, a smiling split jaw, and an extravagant crown of frilly pink external gills.",
};

export default function build() {
  const b = createBuilder({ name: "chibi-axolotl", detail: 1 });

  const PINK = "#f28eaa";
  const PINK_LIGHT = "#ffb2c5";
  const PINK_DARK = "#c95578";
  const GILL = "#ff709d";
  const GILL_DARK = "#c94370";
  const CREAM = "#ffe7d2";
  const DARK = "#291a30";
  const BLACK = "#170f20";
  const WHITE = "#fff9f4";
  const MINT = "#9ad9c2";

  const BODY = cel(
    furEdge(PINK_LIGHT, PINK_DARK, {
      level: -0.2,
      teeth: 0.22,
      period: 0.055,
      ink: undefined,
    }),
    PINK_DARK,
    { threshold: 0.05 },
  );
  const HEAD = cel(PINK_LIGHT, PINK_DARK, { threshold: 0.0 });
  const BELLY = cel(CREAM, "#eeb7ac", { threshold: -0.05 });

  // ---------------------------------------------------------------------------
  // Authoring helpers

  function sphere(
    at: any,
    scale: [number, number, number],
    color: any,
    bone?: any,
    name?: string,
    segments = 10,
  ) {
    return b.part(new THREE.SphereGeometry(1, segments, Math.max(6, segments - 2)), color, {
      at,
      scale,
      bone,
      name,
      flat: true,
    });
  }

  function box(
    at: any,
    size: [number, number, number],
    color: any,
    bone?: any,
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      name,
      flat: true,
    });
  }

  function capsule(
    a: any,
    c: any,
    radius: number | [number, number],
    color: any,
    bone?: any,
    name?: string,
  ) {
    return b.capsule(a, c, radius, {
      color,
      bone,
      name,
      sides: 7,
      flat: true,
    });
  }

  function toe(
    root: THREE.Vector3,
    tip: THREE.Vector3,
    bone: any,
    side: string,
    index: number,
  ) {
    capsule(root, tip, [0.045, 0.018], PINK_DARK, bone, `toe${side}${index}`);
    sphere(tip, [0.028, 0.022, 0.035], PINK_LIGHT, bone, `toePad${side}${index}`, 7);
  }

  function gillBlade(
    side: number,
    base: THREE.Vector3,
    height: number,
    lean: number,
    index: number,
  ) {
    // A broad, angular frill silhouette in the side plane.
    const outline: any[] = [
      [0, 0],
      [0.055, height * 0.16],
      [0.018, height * 0.32],
      [0.075, height * 0.48],
      [0.025, height * 0.64],
      [0.085, height * 0.82],
      [lean, height],
      [lean * 0.58, height * 0.82],
      [lean * 0.42, height * 0.58],
      [lean * 0.25, height * 0.34],
      [lean * 0.18, height * 0.12],
    ];
    const frill = b.extrude(outline, {
      at: base,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.004,
      smoothing: 0,
      color: index % 2 === 0 ? GILL : PINK_LIGHT,
      bone: head,
      name: `gillFrill${side > 0 ? "L" : "R"}${index}`,
    });

    // Central raised vein and two little dark bars make each frill read as fleshy.
    const veinA = base.clone().add(new THREE.Vector3(0, height * 0.08, 0));
    const veinB = base.clone().add(new THREE.Vector3(lean * 0.82, height * 0.9, 0));
    capsule(veinA, veinB, [0.012, 0.007], GILL_DARK, head, `gillVein${side}${index}`);

    const barbA = base.clone().add(new THREE.Vector3(lean * 0.3, height * 0.37, 0.015));
    const barbB = base.clone().add(new THREE.Vector3(lean * 0.55, height * 0.53, 0.015));
    capsule(barbA, barbB, 0.009, GILL_DARK, head, `gillBarb${side}${index}`);
    return frill;
  }

  // ---------------------------------------------------------------------------
  // Skeleton first: one root and a readable neutral quadruped rig.

  const hips = b.joint("hips", {
    at: [0, 0.53, -0.17],
    dir: [0, 0, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [-0.0, 0.53, -0.78],
      [0, 0.56, -0.42],
      [0, 0.57, -0.08],
      [0, 0.59, 0.27],
      [0, 0.61, 0.52],
    ]),
    {
      parent: hips,
      names: ["spineTail", "spineMid", "spineChest", "spineNeck", "spineHead"],
      role: "spine",
      count: 5,
    },
  );

  const neck = b.joint("neck", {
    parent: spine.tip,
    at: [0, 0.63, 0.47],
    dir: [0, 0.08, 1],
    role: "neck",
  });

  const head = b.joint("head", {
    parent: neck,
    at: [0, 0.68, 0.66],
    dir: [0, 0.03, 1],
    role: "head",
    group: "head",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 0.585, 0.78],
    dir: [0, -0.06, 1],
    role: "jaw",
    group: "head",
  });

  const legData = [
    {
      side: 1,
      label: "L",
      hip: [0.22, 0.49, 0.18] as [number, number, number],
      foot: [0.28, 0.105, 0.31] as [number, number, number],
      front: true,
    },
    {
      side: -1,
      label: "R",
      hip: [-0.22, 0.49, 0.18] as [number, number, number],
      foot: [-0.28, 0.105, 0.31] as [number, number, number],
      front: true,
    },
    {
      side: 1,
      label: "L",
      hip: [0.22, 0.47, -0.34] as [number, number, number],
      foot: [0.29, 0.105, -0.46] as [number, number, number],
      front: false,
    },
    {
      side: -1,
      label: "R",
      hip: [-0.22, 0.47, -0.34] as [number, number, number],
      foot: [-0.29, 0.105, -0.46] as [number, number, number],
      front: false,
    },
  ];

  const legs: any[] = [];
  for (let i = 0; i < legData.length; i++) {
    const d = legData[i];
    const bend = d.front ? [0, 0, 1] : [0, 0, -1];
    const points = limb(
      d.hip,
      d.foot,
      [0.19, 0.17, 0.14],
      [bend, bend],
    );
    const leg = b.chain(`leg${d.label}${d.front ? "F" : "H"}`, points, {
      parent: hips,
      names: [
        `hip${d.label}${d.front ? "F" : "H"}`,
        `knee${d.label}${d.front ? "F" : "H"}`,
        `ankle${d.label}${d.front ? "F" : "H"}`,
        `paw${d.label}${d.front ? "F" : "H"}`,
      ],
      role: "leg",
      contact: d.foot,
      count: 4,
    });
    legs.push({ chain: leg, data: d, points });
  }

  // ---------------------------------------------------------------------------
  // Main low-poly body, belly, and tail.

  const body = b.sweep(spine, (t: number) => {
    if (t < 0.18) return 0.16;
    if (t < 0.45) return 0.255;
    if (t < 0.78) return 0.285;
    return 0.24;
  }, {
    color: BODY,
    sides: 8,
    flat: true,
    caps: "round",
    name: "softBody",
    sectors: [[118, 242, BELLY]],
  });

  const tailPath = catmull([
    [0, 0.53, -0.55],
    [0, 0.48, -0.92],
    [0, 0.42, -1.24],
    [0, 0.33, -1.53],
    [0, 0.23, -1.78],
  ]);

  const tail = b.chain("tail", tailPath, {
    parent: hips,
    names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
    role: "tail",
    count: 5,
  });

  b.sweep(tail, (t: number) => 0.15 * (1 - t) + 0.018, {
    color: BODY,
    sides: 7,
    flat: true,
    caps: { start: "round", end: "point" },
    name: "taperedTail",
    sectors: [[120, 240, BELLY]],
  });

  // A few darker tail chevrons, built as small raised fins on the dorsal side.
  for (let i = 0; i < 5; i++) {
    const t = 0.14 + i * 0.16;
    const p = tail.at(t);
    const s = Math.max(0.025, 0.075 * (1 - t));
    b.spike(
      p.at,
      [0, 0.55, -0.2],
      s,
      Math.max(0.009, s * 0.23),
      { color: PINK_DARK, bone: p.bone, name: `tailDorsal${i}` },
    );
  }

  // ---------------------------------------------------------------------------
  // Legs and big soft paddle feet.

  for (const item of legs) {
    const d = item.data;
    const c = item.chain;
    b.sweep(c, (t: number) => 0.075 - t * 0.028, {
      color: BODY,
      sides: 7,
      flat: true,
      caps: "round",
      name: `legTube${d.label}${d.front ? "F" : "H"}`,
      skin: "smooth",
    });

    const paw = c.tip;
    const foot = new THREE.Vector3(...d.foot);
    sphere(foot, [0.125, 0.07, 0.16], PINK_LIGHT, paw, `paddle${d.label}${d.front ? "F" : "H"}`, 8);

    // Three separated blunt toes point forward, the iconic axolotl silhouette.
    const forward = d.front ? 1 : 0.82;
    for (let j = 0; j < 3; j++) {
      const x = d.side * (0.045 + j * 0.055);
      const toeRoot = foot.clone().add(new THREE.Vector3(x * 0.45, 0.0, 0.035));
      const toeTip = foot.clone().add(new THREE.Vector3(x, -0.012, 0.035 + forward * (0.09 + (j % 2) * 0.025)));
      toe(toeRoot, toeTip, paw, d.label, j);
    }

    // A pair of round toe pads gives the feet a toy-like read.
    sphere(
      foot.clone().add(new THREE.Vector3(d.side * 0.045, 0.064, 0.065)),
      [0.038, 0.012, 0.035],
      CREAM,
      paw,
      `footPad${d.label}${d.front ? "F" : "H"}`,
      7,
    );
  }

  // ---------------------------------------------------------------------------
  // Oversized head and cream cheek/muzzle shapes.

  const skull = sphere([0, 0.69, 0.69], [0.34, 0.31, 0.32], HEAD, head, "roundHead", 12);

  // Pale lower face is layered in front of the pink skull.
  sphere([0, 0.625, 0.91], [0.265, 0.145, 0.115], BELLY, head, "creamMuzzle", 10);
  sphere([-0.145, 0.635, 0.86], [0.105, 0.135, 0.11], BELLY, head, "cheekL", 9);
  sphere([0.145, 0.635, 0.86], [0.105, 0.135, 0.11], BELLY, head, "cheekR", 9);

  // Tiny rounded nose, nostrils, and a wide separate lower jaw.
  sphere([0, 0.705, 1.028], [0.052, 0.035, 0.025], DARK, head, "nose", 8);
  sphere([-0.026, 0.712, 1.046], [0.009, 0.006, 0.006], BLACK, head, "nostrilL", 6);
  sphere([0.026, 0.712, 1.046], [0.009, 0.006, 0.006], BLACK, head, "nostrilR", 6);

  capsule(
    jaw.at,
    [0, 0.585, 0.94],
    [0.082, 0.055],
    DARK,
    jaw,
    "lowerJaw",
  );
  // Pink lip corners exaggerate the smile.
  sphere([-0.105, 0.638, 0.965], [0.026, 0.02, 0.018], PINK_DARK, jaw, "smileL", 7);
  sphere([0.105, 0.638, 0.965], [0.026, 0.02, 0.018], PINK_DARK, jaw, "smileR", 7);
  b.rod([-0.102, 0.651, 0.979], [0, 0.626, 1.002], 0.008, PINK_DARK, {
    bone: jaw,
    name: "smileLineL",
  });
  b.rod([0.102, 0.651, 0.979], [0, 0.626, 1.002], 0.008, PINK_DARK, {
    bone: jaw,
    name: "smileLineR",
  });

  // ---------------------------------------------------------------------------
  // Eyes: dark outer discs, huge white highlights, and warm golden irises.

  for (const s of [-1, 1]) {
    const x = s * 0.145;
    sphere([x, 0.785, 0.907], [0.102, 0.118, 0.055], DARK, head, `eyeSocket${s}`, 10);
    sphere([x, 0.79, 0.951], [0.075, 0.089, 0.026], "#ffbd55", head, `iris${s}`, 10);
    sphere([x, 0.792, 0.974], [0.033, 0.06, 0.012], BLACK, head, `pupil${s}`, 8);
    sphere([x - s * 0.027, 0.833, 0.987], [0.022, 0.026, 0.009], WHITE, head, `eyeGlintA${s}`, 7);
    sphere([x + s * 0.024, 0.77, 0.986], [0.011, 0.014, 0.006], WHITE, head, `eyeGlintB${s}`, 7);

    // Soft upper lid and a little brow ridge make the face especially chibi.
    capsule(
      [x - s * 0.075, 0.855, 0.966],
      [x + s * 0.075, 0.858, 0.968],
      0.014,
      PINK_DARK,
      head,
      `upperLid${s}`,
    );
    capsule(
      [x - s * 0.095, 0.906, 0.929],
      [x + s * 0.055, 0.918, 0.933],
      0.017,
      PINK_DARK,
      head,
      `brow${s}`,
    );
  }

  // Three tiny cheek freckles per side.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      sphere(
        [s * (0.205 + (i % 2) * 0.026), 0.675 + (i % 2) * 0.035, 0.974 - i * 0.012],
        [0.012, 0.012, 0.008],
        PINK_DARK,
        head,
        `freckle${s}${i}`,
        6,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Frilly external gills: three big fan blades on each side plus filaments.

  const gillRoots = [
    { x: 0.27, y: 0.77, z: 0.57 },
    { x: 0.295, y: 0.70, z: 0.54 },
    { x: 0.29, y: 0.625, z: 0.55 },
  ];

  for (const side of [-1, 1]) {
    for (let i = 0; i < gillRoots.length; i++) {
      const root = new THREE.Vector3(side * gillRoots[i].x, gillRoots[i].y, gillRoots[i].z);
      const h = 0.22 - i * 0.025;
      const lean = side * (0.11 + i * 0.018);
      gillBlade(side, root, h, lean, i);

      // Long rounded red-pink filaments branch from every fan.
      for (let j = 0; j < 3; j++) {
        const y0 = root.y + h * (0.18 + j * 0.22);
        const a = new THREE.Vector3(side * (gillRoots[i].x + 0.008), y0, gillRoots[i].z + 0.008);
        const c = new THREE.Vector3(
          side * (gillRoots[i].x + 0.09 + j * 0.012),
          y0 + 0.035 + j * 0.01,
          gillRoots[i].z - 0.015,
        );
        const d = new THREE.Vector3(
          side * (gillRoots[i].x + 0.155 + j * 0.012),
          y0 + 0.018 - j * 0.009,
          gillRoots[i].z - 0.03,
        );
        const filament = catmull([a, c, d]);
        b.sweep(filament, [0.014, 0.003], {
          color: j === 1 ? GILL_DARK : GILL,
          bone: head,
          sides: 6,
          caps: { start: "round", end: "point" },
          name: `gillFilament${side}${i}${j}`,
        });
      }
    }
    // A round gill base keeps the frills visibly attached rather than floating.
    sphere(
      [side * 0.282, 0.7, 0.575],
      [0.06, 0.13, 0.06],
      PINK_DARK,
      head,
      `gillBase${side}`,
      8,
    );
  }

  // Small head-top freckles and a soft dorsal ridge.
  for (let i = -2; i <= 2; i++) {
    sphere([i * 0.055, 0.955, 0.68 + Math.abs(i) * 0.01], [0.018, 0.012, 0.012], PINK_DARK, head, `crownDot${i}`, 6);
  }

  // Gentle pose: jaw slightly open so the two-jaw construction remains readable.
  b.pose(jaw, { axis: [1, 0, 0], deg: -5 });

  // Add a small mint dorsal spot motif, like a stylized aquarium-creature marking.
  for (let i = 0; i < 4; i++) {
    const z = 0.05 - i * 0.17;
    sphere([0, 0.84 - (i % 2) * 0.01, z], [0.035, 0.018, 0.05], MINT, spine.joints[2], `dorsalSpot${i}`, 7);
  }

  return b.root;
}
