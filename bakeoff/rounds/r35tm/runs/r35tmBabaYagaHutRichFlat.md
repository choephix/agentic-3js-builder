```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { cel } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Baba Yaga's Hut on Chicken Legs",
  description:
    "A richly decorated Slavic folk-art diorama of Baba Yaga's crooked wooden hut, perched on two articulated chicken legs with talons, carved trim, shutters, glowing windows, and a steep patterned roof.",
};

export default function build() {
  const b = createBuilder({ name: "baba-yaga-hut", detail: 1 });

  const WOOD = cel("#8b482c", "#4d241d");
  const WOOD_LIGHT = cel("#bd7040", "#713326");
  const WOOD_DARK = cel("#52251e", "#29151a");
  const ROOF = cel("#392b54", "#17152d");
  const ROOF_LIGHT = cel("#694878", "#2d2144");
  const TRIM = cel("#e2aa48", "#9a4f2c");
  const CREAM = cel("#f4d18b", "#b66b3c");
  const RED = cel("#b63732", "#641e2b");
  const BLUE = cel("#3e6f82", "#203b55");
  const TEAL = cel("#4f9a87", "#24544f");
  const BLACK = "#21151c";
  const BONE = cel("#e6d19b", "#8d674b");
  const FEATHER = cel("#d6a43e", "#80532d");
  const EYE = "#ffd75b";
  const WINDOW_GLOW = "#f7b83e";
  const GROUND = cel("#5f4937", "#302b2c");
  const MOSS = cel("#657b3f", "#30442e");

  const hips = b.joint("hips", {
    at: [0, 1.02, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const part = (
    geometry: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    options: Record<string, any> = {},
  ) =>
    b.part(geometry, color, {
      at,
      bone: options.bone ?? hips,
      ...options,
    });

  const box = (
    size: [number, number, number],
    color: any,
    at: [number, number, number],
    options: Record<string, any> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      options,
    );

  const cylinder = (
    radius: number,
    height: number,
    color: any,
    at: [number, number, number],
    options: Record<string, any> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, options.segments ?? 8),
      color,
      at,
      options,
    );

  const sphere = (
    radius: number,
    color: any,
    at: [number, number, number],
    options: Record<string, any> = {},
  ) =>
    part(
      new THREE.SphereGeometry(
        radius,
        options.widthSegments ?? 8,
        options.heightSegments ?? 6,
      ),
      color,
      at,
      options,
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: any,
    options: Record<string, any> = {},
  ) => b.rod(a, z, radius, { color, bone: options.bone ?? hips, ...options });

  const plank = (
    at: [number, number, number],
    size: [number, number, number],
    color: any = WOOD_LIGHT,
    rotation: [number, number, number] = [0, 0, 0],
  ) => box(size, color, at, { rotation });

  // ---------------------------------------------------------------------------
  // Diorama plinth: a small painted woodland platform, kept subordinate to the hut.
  // ---------------------------------------------------------------------------

  cylinder(0.82, 0.12, GROUND, [0, 0.06, 0], { bone: hips, segments: 12 });
  cylinder(0.72, 0.035, WOOD_DARK, [0, 0.13, 0], {
    bone: hips,
    segments: 12,
  });

  for (const p of [
    [-0.62, 0.17, -0.28],
    [0.52, 0.17, -0.33],
    [-0.5, 0.17, 0.35],
    [0.56, 0.17, 0.3],
  ] as [number, number, number][]) {
    sphere(0.09, MOSS, p, { bone: hips, widthSegments: 6, heightSegments: 4 });
  }

  for (const p of [
    [-0.35, 0.17, -0.49],
    [-0.12, 0.17, -0.56],
    [0.16, 0.17, -0.53],
    [0.38, 0.17, -0.45],
  ] as [number, number, number][]) {
    cylinder(0.018, 0.055, TEAL, p, {
      bone: hips,
      segments: 5,
      rotation: [0, 0, 0],
    });
  }

  // ---------------------------------------------------------------------------
  // Chicken legs: skeleton first, then broad faceted skin and little talons.
  // ---------------------------------------------------------------------------

  const leftLegPoints = [
    [0.28, 1.12, 0.0],
    [0.37, 0.73, 0.02],
    [0.28, 0.37, 0.09],
    [0.22, 0.18, 0.13],
  ] as [number, number, number][];

  const rightLegPoints = [
    [-0.28, 1.12, 0.0],
    [-0.37, 0.73, 0.02],
    [-0.28, 0.37, 0.09],
    [-0.22, 0.18, 0.13],
  ] as [number, number, number][];

  const leftLeg = b.chain("legL", leftLegPoints, {
    parent: hips,
    names: ["hipL", "kneeL", "ankleL", "footL"],
    role: "leg",
    contact: [0.22, 0, 0.13],
  });

  const rightLeg = b.chain("legR", rightLegPoints, {
    parent: hips,
    names: ["hipR", "kneeR", "ankleR", "footR"],
    role: "leg",
    contact: [-0.22, 0, 0.13],
  });

  b.sweep(leftLeg, (t) => 0.095 - t * 0.035, {
    color: FEATHER,
    section: { ngon: 6 },
    sides: 7,
  });
  b.sweep(rightLeg, (t) => 0.095 - t * 0.035, {
    color: FEATHER,
    section: { ngon: 6 },
    sides: 7,
  });

  // Dark joint bands make the puppet-like anatomy readable.
  for (const s of [1, -1]) {
    cylinder(0.108, 0.055, WOOD_DARK, [s * 0.34, 0.76, 0.025], {
      bone: s > 0 ? leftLeg.joints[1] : rightLeg.joints[1],
      segments: 7,
    });
    cylinder(0.072, 0.05, RED, [s * 0.275, 0.38, 0.095], {
      bone: s > 0 ? leftLeg.joints[2] : rightLeg.joints[2],
      segments: 7,
    });
  }

  // Three chunky forward-pointing toes on each foot, plus a small rear spur.
  for (const s of [1, -1]) {
    const leg = s > 0 ? leftLeg : rightLeg;
    const foot: [number, number, number] = [s * 0.22, 0.17, 0.13];

    rod(foot, [s * 0.39, 0.065, 0.35], 0.027, FEATHER, { bone: leg.tip });
    rod(foot, [s * 0.22, 0.06, 0.43], 0.027, FEATHER, { bone: leg.tip });
    rod(foot, [s * 0.07, 0.065, 0.34], 0.027, FEATHER, { bone: leg.tip });
    rod(foot, [s * 0.18, 0.08, -0.03], 0.022, FEATHER, { bone: leg.tip });

    for (const x of [0.39, 0.22, 0.07]) {
      cylinder(0.032, 0.04, BONE, [s * x, 0.045, 0.34], {
        bone: leg.tip,
        segments: 6,
      });
    }
  }

  // Loose feather tufts around the thighs.
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = -0.07 + i * 0.035;
      const y = 0.9 + Math.sin(i * 1.7) * 0.035;
      b.spike(
        [s * (0.31 + i * 0.006), y, z],
        [s * 0.05, 0.06, -0.02],
        0.12,
        0.035,
        { color: CREAM, bone: s > 0 ? leftLeg.joints[0] : rightLeg.joints[0] },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Crooked hut body: broad timber box, leaning beam accents, and log ends.
  // ---------------------------------------------------------------------------

  box([1.02, 0.72, 0.82], WOOD, [0, 1.48, 0], {
    bone: hips,
    rotation: [0, 0, -2],
  });

  // Slightly irregular lower course.
  plank([0.0, 1.16, 0.01], [1.08, 0.12, 0.86], WOOD_DARK, [0, 0, -1]);
  plank([-0.03, 1.29, 0.01], [1.1, 0.065, 0.87], WOOD_LIGHT, [0, 0, 1]);

  // Horizontal log courses on both visible sides.
  for (let i = 0; i < 4; i++) {
    const y = 1.31 + i * 0.17;
    plank([0, y, 0.426], [1.1, 0.035, 0.035], WOOD_DARK);
    plank([0.535, y, 0], [0.035, 0.035, 0.84], WOOD_DARK);
    plank([-0.535, y, 0], [0.035, 0.035, 0.84], WOOD_DARK);
  }

  // Exaggerated protruding log ends, a strong folk-art silhouette.
  for (let i = 0; i < 4; i++) {
    const y = 1.31 + i * 0.17;
    for (const s of [1, -1]) {
      cylinder(0.058, 0.13, WOOD_LIGHT, [s * 0.57, y, 0.0], {
        bone: hips,
        dir: [s, 0, 0],
        segments: 7,
      });
    }
  }

  // Corner posts and dark carved base rail.
  box([0.095, 0.79, 0.095], WOOD_DARK, [0.49, 1.5, 0.39], {
    bone: hips,
    rotation: [0, 0, -2],
  });
  box([0.095, 0.79, 0.095], WOOD_DARK, [-0.49, 1.5, 0.39], {
    bone: hips,
    rotation: [0, 0, -2],
  });
  box([1.13, 0.07, 0.1], TRIM, [0, 1.11, 0.4], { bone: hips });

  // Moss on the upward-facing roofline and one corner.
  for (const p of [
    [-0.42, 1.91, -0.38],
    [-0.25, 1.93, -0.4],
    [0.26, 1.94, -0.4],
    [0.44, 1.91, -0.37],
    [0.51, 1.73, 0.4],
  ] as [number, number, number][]) {
    sphere(0.045, MOSS, p, { bone: hips, widthSegments: 6, heightSegments: 4 });
  }

  // ---------------------------------------------------------------------------
  // Front door and glowing shuttered windows.
  // ---------------------------------------------------------------------------

  box([0.28, 0.46, 0.035], WOOD_DARK, [0, 1.39, 0.435], { bone: hips });
  box([0.22, 0.39, 0.025], WOOD_LIGHT, [0, 1.37, 0.458], { bone: hips });

  // Door planks and crooked iron strap.
  for (const x of [-0.075, 0, 0.075]) {
    box([0.018, 0.36, 0.012], WOOD_DARK, [x, 1.37, 0.476], {
      bone: hips,
    });
  }
  box([0.025, 0.39, 0.012], BLACK, [0, 1.38, 0.481], {
    bone: hips,
    rotation: [0, 0, -18],
  });
  sphere(0.026, TRIM, [0.08, 1.38, 0.49], {
    bone: hips,
    widthSegments: 7,
    heightSegments: 5,
  });

  // Door lintel, threshold, and little folk-art diamond.
  box([0.38, 0.06, 0.07], TRIM, [0, 1.625, 0.44], { bone: hips });
  box([0.36, 0.06, 0.08], WOOD_DARK, [0, 1.13, 0.45], { bone: hips });
  b.extrude(
    [
      [0, 0.065],
      [0.06, 0],
      [0, -0.065],
      [-0.06, 0],
    ],
    {
      at: [0, 1.48, 0.493],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: RED,
      bone: hips,
    },
  );

  const window = (x: number, y: number, side: number) => {
    box([0.28, 0.25, 0.032], WOOD_DARK, [x, y, 0.435], { bone: hips });
    box([0.22, 0.19, 0.018], WINDOW_GLOW, [x, y, 0.458], {
      bone: hips,
    });
    box([0.018, 0.19, 0.022], TRIM, [x, y, 0.47], { bone: hips });
    box([0.22, 0.018, 0.022], TRIM, [x, y, 0.47], { bone: hips });

    // Blue-and-red carved shutters.
    box([0.075, 0.27, 0.04], BLUE, [x - side * 0.185, y, 0.44], {
      bone: hips,
      rotation: [0, side * 12, side * 3],
    });
    box([0.075, 0.27, 0.04], RED, [x + side * 0.185, y, 0.44], {
      bone: hips,
      rotation: [0, -side * 12, -side * 3],
    });

    for (const yy of [y - 0.075, y, y + 0.075]) {
      cylinder(0.012, 0.055, TRIM, [x - side * 0.185, yy, 0.468], {
        bone: hips,
        dir: [0, 0, 1],
        segments: 5,
      });
      cylinder(0.012, 0.055, TRIM, [x + side * 0.185, yy, 0.468], {
        bone: hips,
        dir: [0, 0, 1],
        segments: 5,
      });
    }
  };

  window(-0.31, 1.55, 1);
  window(0.31, 1.55, -1);

  // Window glints and candle-like warm dots.
  for (const x of [-0.31, 0.31]) {
    sphere(0.025, CREAM, [x - 0.055, 1.59, 0.482], {
      bone: hips,
      widthSegments: 6,
      heightSegments: 4,
    });
    sphere(0.018, RED, [x + 0.055, 1.51, 0.482], {
      bone: hips,
      widthSegments: 6,
      heightSegments: 4,
    });
  }

  // ---------------------------------------------------------------------------
  // Gable, roof, chimney, and graphic Slavic roof pattern.
  // ---------------------------------------------------------------------------

  b.extrude(
    [
      [-0.52, 0],
      [0.52, 0],
      [0.43, 0.16],
      [0.0, 0.53, "sharp"],
      [-0.43, 0.16],
    ],
    {
      at: [0, 1.78, 0.42],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.06,
      bevel: 0.008,
      color: WOOD_LIGHT,
      bone: hips,
    },
  );

  // Front gable border.
  box([1.0, 0.045, 0.055], TRIM, [0, 1.79, 0.463], {
    bone: hips,
    rotation: [0, 0, 0],
  });
  rod([-0.49, 1.8, 0.47], [0, 2.25, 0.47], 0.027, TRIM, { bone: hips });
  rod([0, 2.25, 0.47], [0.49, 1.8, 0.47], 0.027, TRIM, { bone: hips });

  // Two thick roof planes.
  box([1.18, 0.075, 0.66], ROOF, [0, 1.98, 0.22], {
    bone: hips,
    rotation: [35, 0, 0],
  });
  box([1.18, 0.075, 0.66], ROOF_LIGHT, [0, 1.98, -0.22], {
    bone: hips,
    rotation: [-35, 0, 0],
  });

  // Roof ridge and painted ridge balls.
  box([1.24, 0.09, 0.09], WOOD_DARK, [0, 2.2, 0], {
    bone: hips,
    rotation: [0, 0, 0],
  });
  for (const x of [-0.56, -0.28, 0, 0.28, 0.56]) {
    sphere(0.034, TRIM, [x, 2.205, 0], {
      bone: hips,
      widthSegments: 6,
      heightSegments: 4,
    });
  }

  // Alternating golden roof slats, kept broad and graphic.
  for (const s of [1, -1]) {
    for (let i = -4; i <= 4; i++) {
      const x = i * 0.115;
      const z = s * (0.16 + Math.abs(i) * 0.035);
      const y = 2.11 - Math.abs(i) * 0.027;
      box([0.035, 0.018, 0.12], i % 2 === 0 ? TRIM : RED, [x, y, z], {
        bone: hips,
        rotation: [s * 35, 0, 0],
      });
    }
  }

  // Crooked chimney with cap.
  box([0.19, 0.28, 0.19], WOOD_DARK, [0.27, 2.25, -0.12], {
    bone: hips,
    rotation: [0, 0, -5],
  });
  box([0.24, 0.06, 0.24], TRIM, [0.27, 2.405, -0.12], {
    bone: hips,
    rotation: [0, 0, -5],
  });
  box([0.15, 0.08, 0.15], BLACK, [0.27, 2.45, -0.12], {
    bone: hips,
    rotation: [0, 0, -5],
  });

  // ---------------------------------------------------------------------------
  // Baba Yaga folk motifs: sun, diamonds, hanging charm, and carved side marks.
  // ---------------------------------------------------------------------------

  cylinder(0.105, 0.025, TRIM, [0, 1.93, 0.49], {
    bone: hips,
    dir: [0, 0, 1],
    segments: 12,
  });
  cylinder(0.052, 0.032, RED, [0, 1.93, 0.51], {
    bone: hips,
    dir: [0, 0, 1],
    segments: 10,
  });

  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * 0.15;
    const y = 1.93 + Math.sin(a) * 0.15;
    rod([x * 0.75, y * 0.75 + 1.93 - 1.93, 0], [x, y, 0], 0.012, TRIM, {
      bone: hips,
    });
  }

  // A cleaner explicit ring of sun rays around the gable medallion.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const x0 = Math.cos(a) * 0.105;
    const y0 = 1.93 + Math.sin(a) * 0.105;
    const x1 = Math.cos(a) * 0.15;
    const y1 = 1.93 + Math.sin(a) * 0.15;
    rod([x0, y0, 0.515], [x1, y1, 0.515], 0.011, TRIM, { bone: hips });
  }

  // Diamond charms on both side walls.
  for (const s of [1, -1]) {
    for (const y of [1.38, 1.62]) {
      b.extrude(
        [
          [0, 0.06],
          [0.055, 0],
          [0, -0.06],
          [-0.055, 0],
        ],
        {
          at: [s * 0.565, y, 0.1],
          x: [0, 0, 1],
          y: [0, 1, 0],
          thickness: 0.012,
          color: s > 0 ? RED : BLUE,
          bone: hips,
        },
      );
    }
  }

  // Hanging horseshoe / protective charm beside the door.
  b.sweep(
    [
      [0.22, 1.84, 0.49],
      [0.28, 1.9, 0.49],
      [0.35, 1.84, 0.49],
      [0.35, 1.76, 0.49],
    ],
    0.014,
    { color: BLACK, bone: hips, caps: "round" },
  );
  sphere(0.021, TRIM, [0.22, 1.84, 0.5], {
    bone: hips,
    widthSegments: 6,
    heightSegments: 4,
  });
  sphere(0.021, TRIM, [0.35, 1.76, 0.5], {
    bone: hips,
    widthSegments: 6,
    heightSegments: 4,
  });

  // ---------------------------------------------------------------------------
  // A small witchy broom tucked behind the hut, which reinforces the subject.
  // ---------------------------------------------------------------------------

  rod([0.63, 0.35, -0.25], [0.78, 1.24, -0.35], 0.018, WOOD_DARK, {
    bone: hips,
  });
  for (let i = -3; i <= 3; i++) {
    const x = 0.78 + i * 0.025;
    rod([x, 1.18, -0.35], [x + i * 0.012, 0.96, -0.35], 0.012, CREAM, {
      bone: hips,
    });
  }
  box([0.23, 0.045, 0.07], RED, [0.78, 1.18, -0.35], {
    bone: hips,
    rotation: [0, 0, 5],
  });

  // ---------------------------------------------------------------------------
  // A few deliberately chunky nail heads and timber scars.
  // ---------------------------------------------------------------------------

  const nailPositions: [number, number, number][] = [
    [-0.44, 1.27, 0.47],
    [0.44, 1.27, 0.47],
    [-0.44, 1.72, 0.47],
    [0.44, 1.72, 0.47],
    [-0.55, 1.35, 0.2],
    [-0.55, 1.61, -0.1],
    [0.55, 1.44, -0.18],
    [0.55, 1.7, 0.16],
  ];

  for (const p of nailPositions) {
    sphere(0.018, BLACK, p, {
      bone: hips,
      widthSegments: 6,
      heightSegments: 4,
    });
  }

  // Small carved curls under the eaves.
  for (const s of [1, -1]) {
    for (let i = -3; i <= 3; i++) {
      const x = i * 0.14;
      b.spike(
        [x, 1.82, s * 0.44],
        [0, -0.09, s * 0.015],
        0.12,
        0.022,
        { color: TRIM, bone: hips },
      );
    }
  }

  // The hut's wooden underside, visually connecting the cabin to its legs.
  box([0.86, 0.1, 0.72], WOOD_DARK, [0, 1.1, 0], { bone: hips });
  for (const x of [-0.33, -0.11, 0.11, 0.33]) {
    cylinder(0.035, 0.12, TRIM, [x, 1.04, 0.02], {
      bone: hips,
      segments: 6,
    });
  }

  return b.root;
}
```