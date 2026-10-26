import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  frame,
  limb,
  mottle,
  countershade,
  paint,
  rng,
  svg,
} from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cathedral Gargoyle",
  description:
    "A crouching gothic stone gargoyle with folded bat wings, horns, fangs, claws, a ridged tail, and ominous glowing eyes, perched on a carved ledge.",
};

export default function build() {
  const b = createBuilder({ name: "cathedral-gargoyle", detail: 1 });

  const STONE = mottle("#687078", "#363d44", { size: 0.16, contrast: 1.25, seed: 17 });
  const STONE_LIGHT = countershade(STONE, "#252b31", { level: -0.1, soft: 0.22 });
  const DARK_STONE = mottle("#3d454b", "#171b20", { size: 0.12, contrast: 1.5, seed: 23 });
  const BELLY = countershade("#737a7d", "#30363b", { level: -0.22, soft: 0.3 });
  const EDGE = "#20252a";
  const EYE_GLOW = "#ff4c2f";
  const EYE_CORE = "#ffd28a";
  const HORN = mottle("#4b5154", "#1f2529", { size: 0.12, contrast: 1.4, seed: 31 });
  const CLAW = "#191d20";
  const LEDGE = mottle("#4b5357", "#24292d", { size: 0.25, contrast: 1.1, seed: 7 });
  const MOSS = "#293a35";

  const eyeTexture = svg(
    `<svg viewBox="0 0 96 128" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="iris" cx="50%" cy="42%" r="60%">
          <stop offset="0" stop-color="#fff7c0"/>
          <stop offset=".34" stop-color="#ff9e47"/>
          <stop offset=".72" stop-color="#cc241e"/>
          <stop offset="1" stop-color="#35120f"/>
        </radialGradient>
      </defs>
      <path d="M7 66 Q45 10 89 66 Q45 118 7 66Z" fill="#111518" stroke="#090b0c" stroke-width="7"/>
      <ellipse cx="48" cy="65" rx="29" ry="40" fill="url(#iris)" stroke="#30110e" stroke-width="4"/>
      <ellipse cx="48" cy="65" rx="8" ry="35" fill="#120d0d"/>
      <ellipse cx="36" cy="45" rx="8" ry="12" fill="#fffbe2"/>
      <circle cx="60" cy="79" r="4" fill="#fff6d0"/>
      <path d="M10 52 Q44 20 86 52" fill="none" stroke="#d63c2d" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const foreheadRune = svg(
    `<svg viewBox="0 0 128 160" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8 L79 56 L112 72 L78 83 L64 151 L49 83 L16 72 L50 56Z"
        fill="#bd4540" stroke="#160f12" stroke-width="7" stroke-linejoin="round"/>
      <path d="M64 29 L68 63 L89 72 L67 76 L64 124 L60 76 L39 72 L60 63Z"
        fill="#ffb36b"/>
    </svg>`,
    { size: 256 },
  );

  // Skeleton first: one rooted spine, a neck and head, a hinged jaw, limbs, wings, and tail.
  const hips = b.joint("hips", {
    at: [0, 0.92, -0.18],
    dir: [0, 0.15, 1],
    role: "spine",
  });

  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.92, -0.32],
      [0, 1.05, -0.12],
      [0, 1.18, 0.13],
      [0, 1.27, 0.35],
    ]),
    {
      parent: hips,
      names: ["pelvis", "waist", "chest", "sternum"],
      role: "spine",
      count: 4,
    },
  );

  const neck = b.chain(
    "neck",
    catmull([
      [0, 1.26, 0.32],
      [0, 1.35, 0.43],
      [0, 1.44, 0.51],
    ]),
    {
      parent: spine.tip,
      names: ["neckBase", "neckTip"],
      role: "neck",
      count: 2,
    },
  );

  const head = b.joint("head", {
    parent: neck.tip,
    at: [0, 1.48, 0.56],
    dir: [0, 0, 1],
    role: "head",
    group: "face",
  });

  const jaw = b.joint("jaw", {
    parent: head,
    at: [0, 1.39, 0.67],
    dir: [0, -0.24, 1],
    role: "jaw",
    group: "face",
  });

  const hipLegs: Record<string, ReturnType<typeof b.chain>> = {};
  const foreLegs: Record<string, ReturnType<typeof b.chain>> = {};

  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";

    const hind = limb(
      [s * 0.22, 0.98, -0.16],
      [s * 0.38, 0.15, -0.43],
      [0.28, 0.31, 0.27],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    hipLegs[side] = b.chain(`legH${side}`, hind, {
      parent: spine.joints[0],
      names: [`hip${side}`, `knee${side}`, `ankle${side}`, `foot${side}`],
      role: "leg",
      contact: [s * 0.38, 0, -0.43],
    });

    const arm = limb(
      [s * 0.2, 1.22, 0.29],
      [s * 0.42, 0.13, 0.62],
      [0.25, 0.28, 0.29],
      [
        [0, 0, 1],
        [0, 0, -1],
      ],
    );
    foreLegs[side] = b.chain(`armF${side}`, arm, {
      parent: spine.joints[2],
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`, `hand${side}`],
      role: "arm",
      contact: [s * 0.42, 0, 0.62],
    });
  }

  const tail = b.chain(
    "tail",
    catmull([
      [0, 0.96, -0.31],
      [0, 0.82, -0.62],
      [0, 0.73, -0.94],
      [0, 0.65, -1.22],
      [0, 0.72, -1.48],
    ]),
    {
      parent: hips,
      names: ["tail1", "tail2", "tail3", "tail4", "tailTip"],
      role: "tail",
      count: 5,
    },
  );

  const wingChains: Record<string, ReturnType<typeof b.chain>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wingChains[side] = b.chain(
      `wing${side}`,
      catmull([
        [s * 0.18, 1.24, 0.14],
        [s * 0.47, 1.62, 0.01],
        [s * 0.82, 1.78, -0.15],
        [s * 1.05, 1.38, -0.28],
        [s * 0.94, 0.89, -0.33],
      ]),
      {
        parent: spine.joints[2],
        names: [`wingRoot${side}`, `wingElbow${side}`, `wingMid${side}`, `wingTip${side}`],
        role: "wing",
        count: 4,
      },
    );
  }

  // Body mass: deliberately chunky and faceted, with a lighter belly plane.
  b.sweep(spine, (t) => 0.31 - t * 0.055, {
    color: STONE,
    sides: 8,
    section: "circle",
    caps: "round",
    group: "body",
  });
  b.sweep(neck, [0.24, 0.18], {
    color: STONE_LIGHT,
    sides: 8,
    group: "body",
  });
  b.sweep(tail, (t) => 0.16 * (1 - t) + 0.025, {
    color: STONE,
    sides: 7,
    caps: { start: "round", end: "point" },
    bands: [
      [0.72, DARK_STONE],
      [0.9, HORN],
    ],
    group: "tail",
  });

  // Rib-like belly plates and shoulder masses.
  b.part(new THREE.SphereGeometry(1, 10, 7), BELLY, {
    at: [0, 1.07, 0.27],
    scale: [0.27, 0.29, 0.34],
    group: "body",
  });

  for (const s of [1, -1]) {
    const shoulder = [s * 0.2, 1.23, 0.26] as [number, number, number];
    b.part(new THREE.SphereGeometry(1, 9, 6), STONE_LIGHT, {
      at: shoulder,
      scale: [0.19, 0.26, 0.22],
      group: "body",
    });

    for (let i = 0; i < 4; i++) {
      const y = 1.02 + i * 0.075;
      b.frustumBox(
        [s * (0.14 + i * 0.008), y, 0.34 - i * 0.012],
        [s * (0.13 + i * 0.008), y + 0.045, 0.39 - i * 0.01],
        [0.12 - i * 0.01, 0.028],
        [0.105 - i * 0.01, 0.025],
        { bone: spine.joints[2], color: EDGE, group: "ribs" },
      );
    }
  }

  // Hind legs, short and powerful, with ankle cuffs.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const leg = hipLegs[side];
    b.sweep(leg, (t) => (t < 0.55 ? 0.115 : 0.09), {
      color: STONE,
      sides: 7,
      group: "legs",
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), DARK_STONE, {
      bone: leg.joints[1],
      at: leg.joints[1].at,
      scale: [0.14, 0.14, 0.16],
      group: "knees",
    });
    b.sweep(
      catmull([
        leg.joints[2].at,
        [s * 0.37, 0.22, -0.42],
        [s * 0.38, 0.11, -0.43],
      ]),
      [0.09, 0.12],
      { bone: leg.joints[2], color: STONE_LIGHT, sides: 7, group: "feet" },
    );

    const foot = leg.tip;
    b.part(new THREE.BoxGeometry(0.22, 0.09, 0.28), STONE_LIGHT, {
      bone: foot,
      at: [s * 0.38, 0.105, -0.45],
      scale: [1, 1, 1],
      group: "feet",
    });

    for (let i = -1; i <= 1; i++) {
      const base = [s * (0.38 + i * 0.055), 0.11, -0.57] as [number, number, number];
      b.spike(base, [s * (0.38 + i * 0.06), 0.055, -0.71], null, 0.035, {
        bone: foot,
        color: CLAW,
        group: "claws",
      });
    }
  }

  // Long forelimbs reaching over the ledge.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const arm = foreLegs[side];
    b.sweep(arm, (t) => 0.095 - t * 0.025, {
      color: STONE_LIGHT,
      sides: 7,
      group: "arms",
    });
    b.part(new THREE.SphereGeometry(1, 8, 5), DARK_STONE, {
      bone: arm.joints[1],
      at: arm.joints[1].at,
      scale: [0.12, 0.12, 0.13],
      group: "elbows",
    });
    b.part(new THREE.BoxGeometry(0.2, 0.09, 0.25), STONE_LIGHT, {
      bone: arm.tip,
      at: [s * 0.42, 0.105, 0.66],
      group: "hands",
    });

    for (let i = -1; i <= 1; i++) {
      b.spike(
        [s * (0.42 + i * 0.055), 0.11, 0.74],
        [s * (0.42 + i * 0.06), 0.055, 0.88],
        null,
        0.032,
        { bone: arm.tip, color: CLAW, group: "claws" },
      );
    }
  }

  // Wing bones and membranes. The outer edge is scalloped into five gothic points.
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const wing = wingChains[side];
    b.sweep(wing, [0.075, 0.035], {
      color: STONE,
      sides: 7,
      group: "wing-bones",
    });

    const root = [s * 0.18, 1.24, 0.14] as [number, number, number];
    const shoulder = [s * 0.47, 1.62, 0.01] as [number, number, number];
    const tip = [s * 0.94, 0.89, -0.33] as [number, number, number];
    const lower = [
      [s * 0.18, 1.24, 0.14],
      [s * 0.43, 1.07, -0.08],
      [s * 0.67, 0.84, -0.22],
      tip,
    ] as [number, number, number][];

    b.membrane(wing, lower, {
      color: countershade("#515b61", "#1c252b", { level: -0.08, soft: 0.25 }),
      thickness: 0.018,
      rows: 4,
      cols: 8,
      scallop: 0.16,
      bone: wing.joints[0],
      group: "wing-membrane",
    });

    const fingerPoints = [
      shoulder,
      [s * 0.76, 1.85, -0.04],
      [s * 1.03, 1.66, -0.16],
    ] as [number, number, number][];
    b.rod(shoulder, fingerPoints[1], 0.027, { bone: wing.joints[1], color: STONE_LIGHT, group: "wing-ribs" });
    b.rod(fingerPoints[1], fingerPoints[2], 0.021, {
      bone: wing.joints[2],
      color: STONE_LIGHT,
      group: "wing-ribs",
    });

    for (let i = 0; i < 4; i++) {
      const a = [s * (0.28 + i * 0.18), 1.28 + i * 0.07, 0.07 - i * 0.08] as [number, number, number];
      const z = [s * (0.45 + i * 0.13), 1.02 + i * 0.02, -0.13 - i * 0.045] as [number, number, number];
      b.rod(a, z, 0.012, { bone: wing.joints[Math.min(i, 2)], color: EDGE, group: "wing-ribs" });
    }
  }

  // Skull, muzzle, brow shelves, and separate lower jaw.
  const skull = b.part(new THREE.SphereGeometry(1, 14, 10), STONE_LIGHT, {
    bone: head,
    at: [0, 1.51, 0.61],
    scale: [0.31, 0.28, 0.3],
    group: "head",
    name: "carved-skull",
  });

  b.frustumBox(
    [0, 1.43, 0.72],
    [0, 1.41, 0.91],
    [0.22, 0.19],
    [0.15, 0.12],
    { bone: head, color: BELLY, group: "muzzle" },
  );

  b.part(new THREE.BoxGeometry(0.18, 0.07, 0.2), DARK_STONE, {
    bone: jaw,
    at: [0, 1.34, 0.78],
    group: "jaw",
    name: "lower-jaw",
  });

  b.rod([0, 1.39, 0.69], [0, 1.36, 0.83], 0.018, {
    bone: jaw,
    color: EDGE,
    group: "mouth",
  });

  // Open mouth, tongue, and prominent carved fangs.
  b.part(new THREE.BoxGeometry(0.16, 0.055, 0.14), "#151719", {
    bone: jaw,
    at: [0, 1.365, 0.83],
    group: "mouth",
  });
  b.part(new THREE.ConeGeometry(0.035, 0.11, 6), "#d1c1a0", {
    bone: head,
    at: [-0.095, 1.38, 0.83],
    dir: [0, -1, 0],
    group: "fangs",
  });
  b.part(new THREE.ConeGeometry(0.035, 0.11, 6), "#d1c1a0", {
    bone: head,
    at: [0.095, 1.38, 0.83],
    dir: [0, -1, 0],
    group: "fangs",
  });
  b.part(new THREE.SphereGeometry(1, 7, 4), "#74383a", {
    bone: jaw,
    at: [0, 1.365, 0.865],
    scale: [0.07, 0.018, 0.07],
    group: "mouth",
  });

  // Heavy brow ridges, cheek flanges, ears, and horns.
  for (const s of [1, -1]) {
    b.frustumBox(
      [s * 0.095, 1.62, 0.79],
      [s * 0.16, 1.6, 0.83],
      [0.11, 0.055],
      [0.09, 0.045],
      { bone: head, color: DARK_STONE, group: "brows" },
    );

    b.part(new THREE.SphereGeometry(1, 8, 5), STONE, {
      bone: head,
      at: [s * 0.23, 1.48, 0.63],
      scale: [0.13, 0.2, 0.16],
      group: "cheeks",
    });

    const ear = b.extrude(
      [
        [0, 0],
        [0.14, 0.02],
        [0.19, 0.23, "sharp"],
        [0.08, 0.17],
        [0.02, 0.06],
      ],
      {
        at: [s * 0.19, 1.62, 0.55],
        x: [s, 0, 0],
        y: [0, 1, 0],
        thickness: 0.055,
        bevel: 0.012,
        color: STONE,
        bone: head,
        group: "ears",
      },
    );

    const hornPath = bezier(
      [s * 0.12, 1.68, 0.53],
      [s * 0.22, 1.88, 0.43],
      [s * 0.32, 1.95, 0.24],
      [s * 0.27, 1.8, 0.08],
    );
    b.sweep(hornPath, [0.07, 0.012], {
      bone: head,
      color: HORN,
      sides: 7,
      caps: { start: "round", end: "point" },
      group: "horns",
    });

    // Small cheek spines.
    for (let i = 0; i < 3; i++) {
      const base = [s * (0.25 + i * 0.025), 1.42 - i * 0.08, 0.55 - i * 0.025] as [
        number,
        number,
        number,
      ];
      b.spike(base, [s * (0.38 + i * 0.025), 1.4 - i * 0.07, 0.5 - i * 0.02], null, 0.026, {
        bone: head,
        color: EDGE,
        group: "cheek-spines",
      });
    }
  }

  // Eyes are recessed black sockets with bright inset carved glass.
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(1, 10, 6), "#101416", {
      bone: head,
      at: [s * 0.115, 1.53, 0.82],
      scale: [0.09, 0.105, 0.045],
      group: "eye-sockets",
    });
    const eye = b.decal(skull, eyeTexture, {
      bone: head,
      at: [s * 0.115, 1.535, 0.855],
      dir: [0, 0, 1],
      up: [0, 1, 0],
      size: [0.105, 0.13],
      lift: 0.004,
      mirror: s > 0,
      group: "eyes",
    });
    glow(eye, 2.2);
  }

  // Central forehead sigil and carved nose bridge.
  b.decal(skull, foreheadRune, {
    bone: head,
    at: [0, 1.7, 0.75],
    dir: [0, 0.35, 1],
    up: [0, 1, 0],
    size: [0.1, 0.16],
    lift: 0.006,
    group: "runes",
  });

  b.spike([0, 1.57, 0.84], [0, 1.52, 0.94], null, 0.045, {
    bone: head,
    color: EDGE,
    group: "nose",
  });

  // Dorsal ridge and tail stones.
  b.along(spine, 5, (at) =>
    b.spike(at, at, 0.09, 0.035, {
      color: EDGE,
      group: "dorsal-ridge",
    }),
  );
  b.along(tail, 4, (at) =>
    b.spike(at, at, 0.075, 0.026, {
      color: EDGE,
      group: "tail-spines",
    }),
  );

  // Gothic ledge: a restrained stage, sized to the crouched silhouette.
  b.part(new THREE.BoxGeometry(2.35, 0.18, 1.55), LEDGE, {
    at: [0, 0.02, 0.08],
    group: "ledge",
    name: "stone-ledge",
  });
  b.part(new THREE.BoxGeometry(2.05, 0.08, 1.38), DARK_STONE, {
    at: [0, 0.14, 0.08],
    group: "ledge",
    name: "ledge-cap",
  });

  // Blocky carved corbels beneath the ledge.
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.34, 0.38, 0.48), LEDGE, {
      at: [s * 0.75, -0.13, -0.22],
      group: "ledge",
    });
    b.part(new THREE.ConeGeometry(0.19, 0.32, 4), DARK_STONE, {
      at: [s * 0.75, -0.32, -0.22],
      rotation: [0, 45, 0],
      group: "ledge",
    });
  }

  // Moss caught only along the exposed top/front lip, as small flattened chips.
  for (const x of [-0.88, -0.66, -0.42, 0.38, 0.62, 0.91]) {
    b.part(new THREE.BoxGeometry(0.14, 0.018, 0.05), MOSS, {
      at: [x, 0.235, 0.78],
      rotation: [0.1, x * 0.35, 0],
      group: "moss",
    });
  }

  return b.root;
}
