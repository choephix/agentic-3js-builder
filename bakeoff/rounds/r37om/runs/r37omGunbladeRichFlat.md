```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "gunblade",
  description:
    "A stylized Final Fantasy-inspired gunblade: an oversized silver greatsword fused to a revolver mechanism, with a jeweled guard, engraved blade, brass hardware, exposed cylinder, trigger, barrel and ornate pommel.",
};

export default function build() {
  const b = createBuilder({ name: "gunblade", detail: 1 });

  const STEEL = "#b9c4d0";
  const STEEL_DARK = "#384352";
  const STEEL_EDGE = "#e9f3ff";
  const BLUE_STEEL = "#607b9c";
  const BLACK = "#111721";
  const RUBBER = "#20252d";
  const BRASS = "#c9963e";
  const BRASS_LIGHT = "#f1c86a";
  const BRASS_DARK = "#68431b";
  const RED = "#9d2635";
  const RED_DARK = "#48131d";
  const CRYSTAL = "#63d8ff";
  const CRYSTAL_DARK = "#16749a";
  const INK = "#17111a";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    b.part(geometry, color, {
      at,
      flat: true,
      ...options,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      options,
    );

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    sides = 10,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, sides),
      color,
      at,
      options,
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.SphereGeometry(radius, 8, 6),
      color,
      at,
      options,
    );

  const ring = (
    outer: number,
    inner: number,
    color: string,
    at: [number, number, number],
    z = 0.0,
  ) => {
    const r = outer;
    const t = outer - inner;
    const g = new THREE.TorusGeometry((outer + inner) * 0.5, t * 0.5, 6, 12);
    return part(g, color, [at[0], at[1], at[2] + z], {
      dir: [0, 0, 1],
    });
  };

  const plate = (
    outline: [number, number][],
    color: string,
    z = 0,
    thickness = 0.018,
  ) =>
    b.extrude(outline, {
      at: [0, 0, z],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.002,
      color,
      name: `plate.${color}`,
    });

  // ---------------------------------------------------------------------------
  // Main blade: a broad, angular gunblade silhouette.
  // ---------------------------------------------------------------------------

  plate(
    [
      [-0.105, 0.66],
      [0.105, 0.66],
      [0.165, 0.84],
      [0.155, 1.18],
      [0.12, 1.48],
      [0.07, 1.77],
      [0.0, 1.94],
      [-0.07, 1.77],
      [-0.12, 1.48],
      [-0.155, 1.18],
      [-0.165, 0.84],
    ],
    STEEL_DARK,
    0,
    0.085,
  );

  plate(
    [
      [-0.07, 0.68],
      [0.07, 0.68],
      [0.12, 0.88],
      [0.11, 1.18],
      [0.08, 1.45],
      [0.038, 1.72],
      [0.0, 1.87],
      [-0.038, 1.72],
      [-0.08, 1.45],
      [-0.11, 1.18],
      [-0.12, 0.88],
    ],
    STEEL,
    0.047,
    0.018,
  );

  // Bright cutting edges.
  plate(
    [
      [-0.105, 0.68],
      [-0.07, 0.68],
      [-0.12, 0.9],
      [-0.11, 1.2],
      [-0.08, 1.47],
      [-0.038, 1.73],
      [0.0, 1.89],
      [-0.014, 1.70],
      [-0.06, 1.42],
      [-0.09, 1.16],
      [-0.1, 0.88],
    ],
    STEEL_EDGE,
    0.06,
    0.009,
  );

  plate(
    [
      [0.105, 0.68],
      [0.07, 0.68],
      [0.12, 0.9],
      [0.11, 1.2],
      [0.08, 1.47],
      [0.038, 1.73],
      [0.0, 1.89],
      [0.014, 1.70],
      [0.06, 1.42],
      [0.09, 1.16],
      [0.1, 0.88],
    ],
    STEEL_EDGE,
    0.06,
    0.009,
  );

  // Central fuller and angular blue inlay.
  plate(
    [
      [-0.026, 0.78],
      [0.026, 0.78],
      [0.05, 1.15],
      [0.028, 1.47],
      [0.0, 1.76],
      [-0.028, 1.47],
      [-0.05, 1.15],
    ],
    BLUE_STEEL,
    0.064,
    0.008,
  );

  plate(
    [
      [-0.014, 0.88],
      [0.014, 0.88],
      [0.022, 1.15],
      [0.0, 1.55],
      [-0.022, 1.15],
    ],
    CRYSTAL_DARK,
    0.073,
    0.006,
  );

  // Blade rune / lightning emblem, made from several gold strokes.
  const runeStroke = (x: number, y: number, w: number, h: number, rot = 0) =>
    box([w, h, 0.009], BRASS_LIGHT, [x, y, 0.078], {
      rotation: [0, 0, rot],
    });

  runeStroke(-0.047, 1.14, 0.012, 0.18, -0.34);
  runeStroke(-0.018, 1.08, 0.012, 0.14, 0.55);
  runeStroke(0.02, 1.2, 0.012, 0.19, -0.42);
  runeStroke(0.046, 1.12, 0.012, 0.13, 0.48);
  runeStroke(0, 1.33, 0.009, 0.12, 0.0);

  // Blade shoulder collars.
  box([0.28, 0.035, 0.11], BRASS_DARK, [0, 0.69, 0]);
  box([0.22, 0.018, 0.125], BRASS_LIGHT, [0, 0.714, 0.055]);
  for (const x of [-0.105, 0.105]) {
    cyl(0.019, 0.13, BRASS, [x, 0.715, 0], 8, {
      dir: [0, 0, 1],
    });
    sphere(0.022, BRASS_LIGHT, [x, 0.715, 0.073]);
  }

  // ---------------------------------------------------------------------------
  // Revolver housing running alongside the lower-right side of the blade.
  // ---------------------------------------------------------------------------

  box([0.19, 0.43, 0.14], BLACK, [0.17, 0.77, -0.005]);
  box([0.16, 0.34, 0.17], STEEL_DARK, [0.17, 0.79, 0.055]);
  box([0.11, 0.27, 0.19], STEEL, [0.17, 0.8, 0.078]);

  // Sloped receiver plates.
  plate(
    [
      [0.08, 0.62],
      [0.27, 0.64],
      [0.29, 0.74],
      [0.26, 0.92],
      [0.1, 0.94],
    ],
    STEEL_DARK,
    0.125,
    0.018,
  );
  plate(
    [
      [0.11, 0.67],
      [0.245, 0.68],
      [0.255, 0.75],
      [0.235, 0.88],
      [0.13, 0.89],
    ],
    BRASS_DARK,
    0.137,
    0.009,
  );

  // Long top barrel, parallel to the blade.
  cyl(0.043, 0.66, BLACK, [0.205, 1.02, 0.055], 10);
  cyl(0.029, 0.69, STEEL, [0.205, 1.02, 0.078], 8);
  cyl(0.016, 0.71, BLACK, [0.205, 1.02, 0.099], 8);

  // Muzzle crown and front sight.
  cyl(0.052, 0.045, BRASS_DARK, [0.205, 1.365, 0.055], 10);
  cyl(0.039, 0.052, STEEL_EDGE, [0.205, 1.39, 0.055], 8);
  cyl(0.018, 0.06, BLACK, [0.205, 1.425, 0.055], 8);
  box([0.025, 0.055, 0.025], BRASS_LIGHT, [0.205, 1.46, 0.055]);

  // Barrel reinforcement bands.
  for (const y of [0.78, 0.9, 1.08, 1.25, 1.34]) {
    cyl(0.05, 0.025, BRASS, [0.205, y, 0.055], 10);
  }

  // Revolver cylinder, its axis points toward the viewer.
  cyl(0.105, 0.115, BRASS_DARK, [0.17, 0.77, 0.145], 12, {
    dir: [0, 0, 1],
  });
  cyl(0.084, 0.024, BRASS_LIGHT, [0.17, 0.77, 0.21], 12, {
    dir: [0, 0, 1],
  });
  cyl(0.045, 0.028, BLACK, [0.17, 0.77, 0.23], 10, {
    dir: [0, 0, 1],
  });
  cyl(0.018, 0.032, STEEL_EDGE, [0.17, 0.77, 0.25], 8, {
    dir: [0, 0, 1],
  });

  // Six visible chamber inserts and the six outer cylinder flutes.
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const x = 0.17 + Math.cos(a) * 0.062;
    const y = 0.77 + Math.sin(a) * 0.062;
    cyl(0.014, 0.019, BLACK, [x, y, 0.242], 7, { dir: [0, 0, 1] });
    sphere(0.017, BRASS_LIGHT, [x, y, 0.257]);
  }

  // Cylinder side pin and rear ratchet.
  cyl(0.028, 0.18, STEEL, [0.17, 0.77, 0.08], 8, { dir: [0, 0, 1] });
  ring(0.098, 0.075, BRASS, [0.17, 0.77, 0.225]);
  ring(0.075, 0.055, STEEL_EDGE, [0.17, 0.77, 0.239]);

  // Small ammunition / mechanism rivets.
  for (const y of [0.64, 0.7, 0.86, 0.92]) {
    sphere(0.014, BRASS_LIGHT, [0.275, y, 0.137]);
    sphere(0.012, STEEL_EDGE, [0.075, y, 0.136]);
  }

  // ---------------------------------------------------------------------------
  // Crossguard: a dramatic swept guard with red crystal center.
  // ---------------------------------------------------------------------------

  plate(
    [
      [-0.46, 0.62],
      [-0.43, 0.69],
      [-0.24, 0.73],
      [-0.12, 0.69],
      [0.12, 0.69],
      [0.24, 0.73],
      [0.43, 0.69],
      [0.46, 0.62],
      [0.25, 0.63],
      [0.1, 0.59],
      [-0.1, 0.59],
      [-0.25, 0.63],
    ],
    BLACK,
    0.02,
    0.105,
  );

  plate(
    [
      [-0.4, 0.635],
      [-0.22, 0.68],
      [-0.1, 0.655],
      [0.1, 0.655],
      [0.22, 0.68],
      [0.4, 0.635],
      [0.23, 0.615],
      [0.1, 0.6],
      [-0.1, 0.6],
      [-0.23, 0.615],
    ],
    BRASS,
    0.082,
    0.018,
  );

  // Guard tips.
  for (const s of [-1, 1]) {
    plate(
      [
        [s * 0.24, 0.64],
        [s * 0.46, 0.62],
        [s * 0.52, 0.56],
        [s * 0.42, 0.59],
        [s * 0.25, 0.615],
      ],
      STEEL_EDGE,
      0.092,
      0.012,
    );
    sphere(0.028, BRASS_LIGHT, [s * 0.43, 0.625, 0.105]);
    sphere(0.018, RED, [s * 0.33, 0.64, 0.105]);
  }

  // Center guard jewel.
  const jewel = part(
    new THREE.OctahedronGeometry(0.055, 0),
    RED,
    [0, 0.638, 0.108],
    { rotation: [0, 0, Math.PI / 4] },
  );
  glow(jewel, 1.4);
  ring(0.075, 0.056, BRASS_LIGHT, [0, 0.638, 0.108], 0.008);

  // ---------------------------------------------------------------------------
  // Grip and trigger assembly.
  // ---------------------------------------------------------------------------

  cyl(0.074, 0.30, BLACK, [0, 0.43, 0], 10);
  cyl(0.061, 0.27, RUBBER, [0, 0.43, 0.045], 8);

  // Grip facets and wrap bands.
  for (const y of [0.315, 0.375, 0.435, 0.495, 0.555]) {
    cyl(0.078, 0.018, BRASS_DARK, [0, y, 0], 10);
    cyl(0.066, 0.009, BRASS_LIGHT, [0, y + 0.012, 0.047], 8);
  }

  // Front grip spine, angled slightly forward.
  box([0.032, 0.27, 0.045], STEEL_EDGE, [-0.055, 0.44, 0.055], {
    rotation: [0, 0, -0.12],
  });
  box([0.022, 0.235, 0.022], BRASS, [0.055, 0.44, 0.059], {
    rotation: [0, 0, 0.12],
  });

  // Trigger guard.
  ring(0.078, 0.054, STEEL, [0.11, 0.52, 0.065], 0);
  box([0.03, 0.115, 0.035], STEEL_DARK, [0.11, 0.46, 0.065], {
    rotation: [0, 0, -0.2],
  });
  cyl(0.018, 0.055, BRASS_LIGHT, [0.11, 0.485, 0.102], 8, {
    dir: [0, 0, 1],
    rotation: [0, 0, -0.2],
  });

  // Trigger.
  cyl(0.012, 0.07, BRASS, [0.11, 0.48, 0.112], 7, {
    dir: [0, 0, 1],
    rotation: [0, 0, -0.28],
  });

  // Pommel cap and hanging jewel.
  cyl(0.09, 0.06, BRASS_DARK, [0, 0.255, 0], 10);
  cyl(0.07, 0.045, BRASS_LIGHT, [0, 0.215, 0], 10);
  sphere(0.071, BLACK, [0, 0.16, 0]);
  ring(0.073, 0.052, BRASS, [0, 0.16, 0]);
  const pommel = part(
    new THREE.OctahedronGeometry(0.045, 0),
    CRYSTAL,
    [0, 0.09, 0.055],
    { rotation: [0, 0, Math.PI / 4] },
  );
  glow(pommel, 1.2);
  cyl(0.018, 0.045, BRASS, [0, 0.035, 0], 8);

  // ---------------------------------------------------------------------------
  // Decorative side plates, screws, and raised insignia.
  // ---------------------------------------------------------------------------

  plate(
    [
      [-0.16, 0.77],
      [-0.22, 0.82],
      [-0.18, 0.91],
      [-0.12, 0.96],
      [-0.105, 0.78],
    ],
    BLUE_STEEL,
    0.073,
    0.012,
  );

  plate(
    [
      [-0.19, 0.81],
      [-0.16, 0.84],
      [-0.145, 0.91],
      [-0.17, 0.94],
      [-0.205, 0.9],
    ],
    BRASS_LIGHT,
    0.088,
    0.007,
  );

  // A stylized winged emblem on the lower blade.
  plate(
    [
      [-0.09, 0.83],
      [-0.16, 0.87],
      [-0.105, 0.89],
      [-0.14, 0.96],
      [-0.045, 0.91],
      [0, 0.84],
      [0.045, 0.91],
      [0.14, 0.96],
      [0.105, 0.89],
      [0.16, 0.87],
      [0.09, 0.83],
      [0, 0.86],
    ],
    RED,
    0.083,
    0.006,
  );

  // Tiny brass rivets down both blade shoulders.
  for (const s of [-1, 1]) {
    for (const y of [0.78, 0.87, 0.97, 1.08, 1.2, 1.32]) {
      sphere(0.009, BRASS_LIGHT, [s * 0.13, y, 0.075]);
    }
  }

  // Dark rear saw-like teeth along the gun housing.
  for (let i = 0; i < 7; i++) {
    const y = 0.62 + i * 0.052;
    plate(
      [
        [0.265, y - 0.018],
        [0.315, y],
        [0.265, y + 0.018],
      ],
      STEEL_EDGE,
      0.135,
      0.01,
    );
  }

  // Small safety lever and rear hammer.
  box([0.07, 0.025, 0.035], BRASS, [0.285, 0.97, 0.135], {
    rotation: [0, 0, 0.2],
  });
  box([0.025, 0.09, 0.04], BLACK, [0.285, 1.0, 0.13], {
    rotation: [0, 0, -0.45],
  });
  sphere(0.028, BRASS_LIGHT, [0.305, 1.045, 0.14]);

  // Front blade cap, with an inset crystal point.
  plate(
    [
      [-0.045, 1.82],
      [0, 1.96],
      [0.045, 1.82],
      [0.02, 1.85],
      [0, 1.9],
      [-0.02, 1.85],
    ],
    BRASS_LIGHT,
    0.075,
    0.01,
  );

  const tip = part(
    new THREE.OctahedronGeometry(0.028, 0),
    CRYSTAL,
    [0, 1.88, 0.09],
  );
  glow(tip, 1.3);

  // A few very thin front-facing seams make the blade read as assembled metal.
  for (const y of [0.75, 1.02, 1.39, 1.61]) {
    box([0.11, 0.006, 0.006], BLUE_STEEL, [0, y, 0.078]);
  }

  return b.root;
}
```