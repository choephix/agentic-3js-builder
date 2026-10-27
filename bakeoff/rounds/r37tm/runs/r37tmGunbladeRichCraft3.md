```ts
import * as THREE from "three";
import {
  createBuilder,
  bezier,
  paint,
  svg,
} from "agentic-3js-builder";
import {
  metal,
  panelled,
} from "agentic-3js-builder/kits/clockwork";
import {
  glow,
} from "agentic-3js-builder/kits/glow";
import {
  cel,
} from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Astral Gunblade",
  description:
    "A Final Fantasy-inspired gunblade: a broad runed sword blade fused to a revolver receiver, with a heavy grip, crossguard, chamber, barrel, trigger, riveted plates, and luminous blue weapon markings.",
};

export default function build() {
  const b = createBuilder({ name: "astral-gunblade", detail: 1 });

  const STEEL = metal("steel", {
    polish: 0.62,
    tarnish: 0.12,
    size: 0.09,
    seed: 11,
  });
  const DARK_STEEL = metal("iron", {
    polish: 0.28,
    tarnish: 0.16,
    size: 0.075,
    seed: 17,
  });
  const BLUE_STEEL = metal("blued", {
    polish: 0.72,
    tarnish: 0.08,
    size: 0.065,
    seed: 23,
  });
  const BRASS = metal("brass", {
    polish: 0.72,
    tarnish: 0.08,
    verdigris: 0.08,
    size: 0.07,
    seed: 31,
  });
  const COPPER = metal("copper", {
    polish: 0.52,
    tarnish: 0.15,
    size: 0.06,
    seed: 41,
  });
  const GOLD = metal("gilt", {
    polish: 0.8,
    tarnish: 0.04,
    size: 0.06,
    seed: 47,
  });

  const INK = "#111521";
  const EDGE = "#d9e8ff";
  const RUNEBLUE = "#41bfff";
  const RUNEDARK = "#123d85";
  const MAGENTA = "#e45cff";
  const LEATHER = cel("#321d2b", "#170f1a", { threshold: 0.18 });
  const GRIP_WRAP = cel("#7f3447", "#38162a", { threshold: 0.08 });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...extra,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
    extra: Record<string, any> = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      { at, dir, ...extra },
    );

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    extra: Record<string, any> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 10, 7), color, {
      at,
      ...extra,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    extra: Record<string, any> = {},
  ) => b.rod(a, c, radius, { color, ...extra });

  const spike = (
    base: [number, number, number],
    tip: [number, number, number],
    radius: number,
    color: any,
  ) => b.spike(base, tip, null, radius, { color });

  // ---------------------------------------------------------------------------
  // Sword blade: an exaggerated Final Fantasy silhouette with a clipped tip,
  // shoulder notches, a central fuller, and bright edge rails.
  // ---------------------------------------------------------------------------

  const bladeOutline: [number, number][][] = [
    [
      [-0.105, 0.0],
      [0.105, 0.0],
      [0.145, 0.16],
      [0.12, 0.26],
      [0.18, 0.34],
      [0.125, 0.47],
      [0.115, 1.36],
      [0.205, 1.49],
      [0.155, 1.61],
      [0.09, 1.74],
      [0.0, 1.98],
      [-0.09, 1.74],
      [-0.155, 1.61],
      [-0.205, 1.49],
      [-0.115, 1.36],
      [-0.125, 0.47],
      [-0.18, 0.34],
      [-0.12, 0.26],
      [-0.145, 0.16],
    ],
  ];

  const blade = b.extrude(bladeOutline[0], {
    at: [0, 0.82, 0],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.075,
    bevel: 0.012,
    smoothing: 0,
    color: STEEL,
    name: "blade",
    group: "blade",
  });

  // Dark inset face makes the blade read as layered rather than a single slab.
  const fullerOutline: [number, number][] = [
    [-0.028, 0.16],
    [0.028, 0.16],
    [0.042, 0.42],
    [0.034, 1.36],
    [0.065, 1.51],
    [0.028, 1.72],
    [0.0, 1.86],
    [-0.028, 1.72],
    [-0.065, 1.51],
    [-0.034, 1.36],
    [-0.042, 0.42],
  ];

  const fuller = b.extrude(fullerOutline, {
    at: [0, 0.82, 0.041],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    color: BLUE_STEEL,
    name: "bladeFuller",
    group: "blade",
  });

  const leftEdge = b.extrude(
    [
      [-0.008, 0],
      [0.018, 0],
      [0.03, 0.3],
      [0.038, 1.37],
      [0.11, 1.51],
      [0.07, 1.59],
      [0.02, 1.75],
      [0.0, 1.86],
    ],
    {
      at: [-0.125, 0.82, 0.044],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: EDGE,
      name: "bladeEdgeL",
      group: "blade",
    },
  );

  const rightEdge = b.extrude(
    [
      [-0.018, 0],
      [0.008, 0],
      [-0.03, 0.3],
      [-0.038, 1.37],
      [-0.11, 1.51],
      [-0.07, 1.59],
      [-0.02, 1.75],
      [0.0, 1.86],
    ],
    {
      at: [0.125, 0.82, 0.044],
      x: [-1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      bevel: 0.002,
      color: EDGE,
      name: "bladeEdgeR",
      group: "blade",
    },
  );

  // Luminous blade glyph, deliberately large enough to read in a thumbnail.
  const runeTexture = svg(
    `<svg viewBox="0 0 128 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="r" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stop-color="#c8f7ff"/>
          <stop offset=".35" stop-color="#36c6ff"/>
          <stop offset="1" stop-color="#2462df"/>
        </linearGradient>
        <filter id="g"><feGaussianBlur stdDeviation="3"/></filter>
      </defs>
      <path d="M64 18 L84 66 L68 112 L104 160 L72 210 L88 257 L60 306 L72 358 L44 412 L62 494"
        fill="none" stroke="#1b6cff" stroke-width="18" opacity=".5" filter="url(#g)"/>
      <path d="M64 18 L84 66 L68 112 L104 160 L72 210 L88 257 L60 306 L72 358 L44 412 L62 494"
        fill="none" stroke="url(#r)" stroke-width="8" stroke-linecap="square"/>
      <path d="M31 90 L65 112 L39 160 L72 210 L39 257 L60 306 L28 365"
        fill="none" stroke="#b8faff" stroke-width="4"/>
      <circle cx="64" cy="18" r="8" fill="#ffffff"/>
      <circle cx="72" cy="210" r="7" fill="#ffffff"/>
      <circle cx="62" cy="494" r="8" fill="#ffffff"/>
    </svg>`,
    { size: 256 },
  );

  const rune = glow(
    b.part(new THREE.PlaneGeometry(0.13, 1.58), "#ffffff", {
      at: [0, 1.79, 0.052],
      dir: [0, 0, 1],
      axis: "z",
      texture: runeTexture,
      name: "bladeRune",
      group: "blade",
    }),
    2.2,
  );

  // Small floating-looking but physically seated glyph nodes.
  for (const y of [1.13, 1.42, 1.71, 2.02, 2.32]) {
    glow(
      sphere(0.018, [0, y, 0.062], RUNEBLUE, { name: "runeNode", group: "blade" }),
      2.5,
    );
  }

  // ---------------------------------------------------------------------------
  // Receiver / gun body. A dense angular housing sits at the blade root.
  // ---------------------------------------------------------------------------

  const receiverPaint = panelled(DARK_STEEL, {
    size: 0.105,
    aspect: 0.72,
    rivets: 0.06,
  });

  box([0.29, 0.36, 0.27], [0, 0.92, 0.075], receiverPaint, {
    name: "receiverCore",
    group: "receiver",
  });
  box([0.22, 0.26, 0.34], [0, 0.98, 0.22], BLUE_STEEL, {
    name: "receiverFront",
    group: "receiver",
  });
  box([0.33, 0.08, 0.31], [0, 0.75, 0.11], BRASS, {
    name: "receiverLowerBand",
    group: "receiver",
  });

  // Angular side plates, one on each side of the weapon.
  for (const s of [-1, 1]) {
    const side = s as -1 | 1;
    box([0.035, 0.25, 0.22], [side * 0.17, 0.96, 0.09], STEEL, {
      name: side > 0 ? "leftSidePlate" : "rightSidePlate",
      group: "receiver",
    });
    cyl(0.035, 0.035, [side * 0.196, 0.96, 0.105], GOLD, [1, 0, 0], 8, {
      name: "sidePlateRivet",
      group: "receiver",
    });
    cyl(0.019, 0.04, [side * 0.198, 0.89, 0.075], COPPER, [1, 0, 0], 8, {
      name: "sidePin",
      group: "receiver",
    });
  }

  // Crossguard: the wide wings make the object immediately read as a sword.
  box([0.72, 0.075, 0.11], [0, 0.72, 0.02], BRASS, {
    name: "crossguardMain",
    group: "guard",
  });
  box([0.46, 0.095, 0.14], [0, 0.78, 0.035], STEEL, {
    name: "crossguardUpper",
    group: "guard",
  });

  for (const s of [-1, 1]) {
    const side = s as -1 | 1;
    const wing = b.extrude(
      [
        [0, 0],
        [0.18, 0.01],
        [0.28, 0.09],
        [0.22, 0.16],
        [0.08, 0.13],
      ],
      {
        at: [side * 0.18, 0.70, 0.035],
        x: [side, 0, 0],
        y: [0, 1, 0],
        thickness: 0.075,
        bevel: 0.008,
        color: GOLD,
        name: side > 0 ? "guardWingL" : "guardWingR",
        group: "guard",
      },
    );
    cyl(0.026, 0.11, [side * 0.39, 0.77, 0.06], COPPER, [0, 1, 0], 8, {
      name: "guardWingPin",
      group: "guard",
    });
  }

  // Blade root collar and decorative teeth.
  cyl(0.13, 0.11, [0, 0.77, 0.025], GOLD, [0, 1, 0], 10, {
    name: "bladeCollar",
    group: "guard",
  });
  for (const s of [-1, 1]) {
    spike([s * 0.09, 0.78, 0.035], [s * 0.16, 0.78, 0.035], 0.018, BRASS);
  }

  // ---------------------------------------------------------------------------
  // Revolver chamber and barrel aimed toward +Z, the model's front.
  // ---------------------------------------------------------------------------

  const chamber = cyl(0.145, 0.20, [0, 1.00, 0.25], BRASS, [0, 0, 1], 12, {
    name: "revolverChamber",
    group: "firearm",
  });
  cyl(0.095, 0.212, [0, 1.00, 0.257], DARK_STEEL, [0, 0, 1], 12, {
    name: "chamberInset",
    group: "firearm",
  });

  // Six cartridge bosses around the front plate.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = Math.cos(a) * 0.087;
    const y = 1.0 + Math.sin(a) * 0.087;
    cyl(0.018, 0.025, [x, y, 0.37], GOLD, [0, 0, 1], 7, {
      name: "cartridgeBoss",
      group: "firearm",
    });
  }

  // Barrel shroud, muzzle brake, and glowing bore.
  box([0.16, 0.15, 0.30], [0, 1.01, 0.42], BLUE_STEEL, {
    name: "barrelShroud",
    group: "firearm",
  });
  b.frustumBox(
    [0, 1.01, 0.56],
    [0, 1.01, 0.75],
    [0.105, 0.105],
    [0.075, 0.075],
    { color: STEEL, name: "barrelTaper", group: "firearm" },
  );
  cyl(0.10, 0.07, [0, 1.01, 0.78], DARK_STEEL, [0, 0, 1], 10, {
    name: "muzzleBrake",
    group: "firearm",
  });
  cyl(0.047, 0.076, [0, 1.01, 0.818], INK, [0, 0, 1], 10, {
    name: "muzzleBore",
    group: "firearm",
  });
  glow(
    cyl(0.026, 0.079, [0, 1.01, 0.821], RUNEBLUE, [0, 0, 1], 8, {
      name: "muzzleGlow",
      group: "firearm",
    }),
    2.8,
  );

  // Barrel bands and side vents.
  for (const z of [0.39, 0.58, 0.74]) {
    cyl(0.105, 0.026, [0, 1.01, z], GOLD, [0, 0, 1], 10, {
      name: "barrelBand",
      group: "firearm",
    });
  }
  for (const s of [-1, 1]) {
    box([0.015, 0.05, 0.13], [s * 0.087, 1.01, 0.48], INK, {
      name: "barrelVent",
      group: "firearm",
    });
  }

  // ---------------------------------------------------------------------------
  // Trigger cage and sculpted grip.
  // ---------------------------------------------------------------------------

  const triggerPath = bezier(
    [0, 0.79, 0.17],
    [0, 0.70, 0.24],
    [0, 0.60, 0.20],
    [0, 0.59, 0.10],
  );
  b.sweep(triggerPath, 0.018, {
    color: GOLD,
    caps: "round",
    name: "triggerGuard",
    group: "trigger",
  });

  rod([0, 0.74, 0.16], [0, 0.62, 0.16], 0.018, COPPER, {
    name: "trigger",
    group: "trigger",
  });
  sphere(0.027, [0, 0.62, 0.16], GOLD, {
    name: "triggerTip",
    group: "trigger",
  });

  // Grip leans slightly back for a heroic silhouette.
  b.frustumBox(
    [0, 0.69, 0.02],
    [0, 0.14, -0.055],
    [0.125, 0.15],
    [0.095, 0.12],
    { color: LEATHER, name: "gripCore", group: "grip" },
  );

  // Leather wrap bands follow the slanted grip.
  const gripBands = [
    [0.22, -0.038],
    [0.31, -0.026],
    [0.40, -0.014],
    [0.49, -0.002],
    [0.58, 0.010],
  ] as const;
  for (const [y, z] of gripBands) {
    box([0.205, 0.026, 0.155], [0, y, z], GRIP_WRAP, {
      name: "gripWrap",
      group: "grip",
    });
    box([0.218, 0.010, 0.166], [0, y + 0.016, z], GOLD, {
      name: "gripWrapRivetBand",
      group: "grip",
    });
  }

  // Grip side scales: stepped dark plates with brass studs.
  for (const s of [-1, 1]) {
    const side = s as -1 | 1;
    for (let i = 0; i < 4; i++) {
      const y = 0.23 + i * 0.095;
      const z = -0.06 + i * 0.018;
      box([0.014, 0.078, 0.075], [side * 0.108, y, z], BLUE_STEEL, {
        name: "gripScale",
        group: "grip",
      });
      sphere(0.012, [side * 0.123, y, z + 0.024], GOLD, {
        name: "gripStud",
        group: "grip",
      });
    }
  }

  // Pommel, counterweight, and a small glowing gem.
  cyl(0.115, 0.09, [0, 0.10, -0.075], BRASS, [0, 1, 0], 10, {
    name: "pommelCollar",
    group: "grip",
  });
  sphere(0.085, [0, 0.065, -0.08], DARK_STEEL, {
    name: "pommel",
    group: "grip",
  });
  glow(
    b.part(new THREE.SphereGeometry(0.035, 8, 6), MAGENTA, {
      at: [0, 0.065, -0.156],
      name: "pommelGem",
      group: "grip",
    }),
    2.4,
  );

  // ---------------------------------------------------------------------------
  // Signature ornamental spine: a short line of brass fins behind the blade.
  // ---------------------------------------------------------------------------

  for (const y of [1.17, 1.42, 1.67, 1.92, 2.17]) {
    const h = y < 1.6 ? 0.06 : 0.045;
    b.extrude(
      [
        [0, -h],
        [0.055, -h * 0.45],
        [0.075, 0],
        [0.055, h * 0.45],
        [0, h],
        [-0.025, 0],
      ],
      {
        at: [0, y, -0.047],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.018,
        bevel: 0.003,
        color: BRASS,
        name: "bladeSpineFin",
        group: "ornament",
      },
    );
  }

  // Tiny silver fasteners at the blade shoulders and receiver corners.
  for (const x of [-0.13, 0.13]) {
    sphere(0.014, [x, 0.84, 0.055], EDGE, {
      name: "bladeFastener",
      group: "ornament",
    });
    sphere(0.014, [x, 1.10, 0.22], EDGE, {
      name: "receiverFastener",
      group: "ornament",
    });
  }

  return b.root;
}
```