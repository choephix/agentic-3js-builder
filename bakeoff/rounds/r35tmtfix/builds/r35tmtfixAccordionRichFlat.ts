import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Italian Mother-of-Pearl Piano Accordion",
  description:
    "A stylized low-poly piano accordion with jewel-like Italian mother-of-pearl cabinets, pleated bellows, piano keys, bass buttons, pearl inlays, straps, grillework, and brass trim.",
};

export default function build() {
  const b = createBuilder({ name: "italianMotherOfPearlAccordion", detail: 1 });

  const BLACK = "#16141d";
  const INK = "#241a2b";
  const EBONY = "#29202d";
  const BELLows = "#332b38";
  const BELLOWS_HIGHLIGHT = "#675462";
  const BRASS = "#c9953c";
  const BRASS_LIGHT = "#f0c96b";
  const BRASS_DARK = "#76501f";
  const IVORY = "#fff1cc";
  const IVORY_SHADOW = "#d8b98c";
  const PEARL = "#e9e6d8";
  const PEARL_BLUE = "#b6d4d8";
  const PEARL_PINK = "#edc4c6";
  const PEARL_GREEN = "#b8d4be";
  const PEARL_GOLD = "#e7c77c";
  const RED = "#8c2633";
  const RED_LIGHT = "#c94b5a";
  const BLUE = "#315c82";
  const WHITE = "#ffffff";

  type V = [number, number, number];

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: V,
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, ...options });

  const box = (
    size: V,
    color: string,
    at: V,
    options: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, options);

  const sphere = (
    radius: number,
    color: string,
    at: V,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.SphereGeometry(radius, 10, 6),
      color,
      at,
      { flat: true, ...options },
    );

  const cylinder = (
    radius: number,
    depth: number,
    color: string,
    at: V,
    dir: V = [0, 1, 0],
    radialSegments = 12,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, depth, radialSegments, 1),
      color,
      at,
      { dir, ...options },
    );

  const disc = (
    radius: number,
    color: string,
    at: V,
    options: Record<string, unknown> = {},
  ) =>
    cylinder(radius, 0.012, color, at, [0, 0, 1], 16, {
      ...options,
    });

  const rod = (
    a: V,
    c: V,
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, { color, ...options });

  const pearlTile = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    z = 0.031,
  ) => {
    box([w, h, 0.012], color, [x, y, z]);
    box([w + 0.012, 0.008, 0.006], BRASS_DARK, [x, y - h / 2, z + 0.003]);
    box([w + 0.012, 0.008, 0.006], BRASS_LIGHT, [x, y + h / 2, z + 0.003]);
    box([0.008, h, 0.006], BRASS_DARK, [x - w / 2, y, z + 0.003]);
    box([0.008, h, 0.006], BRASS_LIGHT, [x + w / 2, y, z + 0.003]);
  };

  const gem = (x: number, y: number, color: string, scale = 1) => {
    const outline: [number, number, "sharp"][] = [
      [0, 0.038 * scale, "sharp"],
      [0.032 * scale, 0.014 * scale, "sharp"],
      [0.021 * scale, -0.034 * scale, "sharp"],
      [-0.021 * scale, -0.034 * scale, "sharp"],
      [-0.032 * scale, 0.014 * scale, "sharp"],
    ];
    b.extrude(outline, {
      at: [x, y, 0.046],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.014,
      bevel: 0.004,
      color,
    });
  };

  const flower = (x: number, y: number, scale = 1) => {
    gem(x, y + 0.032 * scale, PEARL_PINK, 0.52 * scale);
    gem(x + 0.032 * scale, y, PEARL_BLUE, 0.52 * scale);
    gem(x, y - 0.032 * scale, PEARL_GREEN, 0.52 * scale);
    gem(x - 0.032 * scale, y, PEARL_GOLD, 0.52 * scale);
    sphere(0.011 * scale, BRASS_LIGHT, [x, y, 0.065]);
  };

  const diamond = (
    x: number,
    y: number,
    w: number,
    h: number,
    color: string,
    z = 0.046,
  ) => {
    b.extrude(
      [
        [0, h / 2, "sharp"],
        [w / 2, 0, "sharp"],
        [0, -h / 2, "sharp"],
        [-w / 2, 0, "sharp"],
      ],
      {
        at: [x, y, z],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.003,
        color,
      },
    );
  };

  // Overall silhouette: two rigid mother-of-pearl cases surrounding the dark bellows.
  // The bottom rails are at y = 0.075, so the instrument stands safely on the floor.
  box([0.33, 0.70, 0.28], INK, [-0.43, 0.435, 0.02]);
  box([0.33, 0.70, 0.28], INK, [0.43, 0.435, 0.02]);

  // Rounded-looking upper and lower caps.
  box([0.37, 0.075, 0.30], BRASS_DARK, [-0.43, 0.11, 0.015]);
  box([0.37, 0.075, 0.30], BRASS_DARK, [-0.43, 0.76, 0.015]);
  box([0.37, 0.075, 0.30], BRASS_DARK, [0.43, 0.11, 0.015]);
  box([0.37, 0.075, 0.30], BRASS_DARK, [0.43, 0.76, 0.015]);

  // Brass corner guards and vertical cabinet edging.
  for (const x of [-0.585, -0.275, 0.275, 0.585]) {
    rod([x, 0.13, 0.17], [x, 0.74, 0.17], 0.012, BRASS, {
      section: { ngon: 6 },
    });
    rod([x, 0.13, -0.12], [x, 0.74, -0.12], 0.009, BRASS_DARK, {
      section: { ngon: 6 },
    });
  }

  // Bellows body and its many dramatic pleats.
  box([0.46, 0.58, 0.22], BELLows, [0, 0.44, -0.005]);
  for (let i = 0; i < 9; i++) {
    const y = 0.17 + i * 0.067;
    box([0.49, 0.018, 0.245], BELLOWS_HIGHLIGHT, [0, y, 0.012]);
    box([0.43, 0.009, 0.255], BLACK, [0, y + 0.012, 0.019]);
    // Small alternating fold buttons make the bellows read as hand-folded leather.
    for (const x of [-0.205, 0.205]) {
      sphere(0.009, BRASS_DARK, [x, y, 0.143]);
    }
  }

  // Bellows end frames.
  box([0.07, 0.64, 0.27], BRASS_DARK, [-0.245, 0.44, 0.02]);
  box([0.07, 0.64, 0.27], BRASS_DARK, [0.245, 0.44, 0.02]);
  box([0.018, 0.56, 0.286], BRASS_LIGHT, [-0.205, 0.44, 0.033]);
  box([0.018, 0.56, 0.286], BRASS_LIGHT, [0.205, 0.44, 0.033]);

  // Mother-of-pearl front panels.
  box([0.285, 0.56, 0.026], PEARL, [-0.43, 0.44, 0.173]);
  box([0.285, 0.56, 0.026], PEARL_BLUE, [0.43, 0.44, 0.173]);

  // Large mosaic tiles on the left and right faces.
  pearlTile(-0.43, 0.61, 0.115, 0.16, PEARL_PINK);
  pearlTile(-0.43, 0.42, 0.115, 0.16, PEARL_GREEN);
  pearlTile(-0.43, 0.23, 0.115, 0.16, PEARL_GOLD);
  pearlTile(0.43, 0.61, 0.115, 0.16, PEARL);
  pearlTile(0.43, 0.42, 0.115, 0.16, PEARL_PINK);
  pearlTile(0.43, 0.23, 0.115, 0.16, PEARL_GREEN);

  // Brass seams between the mosaic panels.
  for (const x of [-0.43, 0.43]) {
    for (const y of [0.315, 0.515]) {
      box([0.265, 0.009, 0.014], BRASS, [x, y, 0.193]);
    }
    box([0.009, 0.52, 0.014], BRASS, [x - 0.067, 0.44, 0.193]);
    box([0.009, 0.52, 0.014], BRASS, [x + 0.067, 0.44, 0.193]);
  }

  // Ornamental floral medallions and diamonds.
  flower(-0.43, 0.675, 1.0);
  flower(-0.43, 0.205, 0.9);
  flower(0.43, 0.675, 1.0);
  flower(0.43, 0.205, 0.9);
  diamond(-0.43, 0.44, 0.13, 0.19, PEARL_BLUE, 0.066);
  diamond(0.43, 0.44, 0.13, 0.19, PEARL_PINK, 0.066);

  // Tiny brass rivets around the cabinet panels.
  for (const x of [-0.43, 0.43]) {
    for (const y of [0.16, 0.28, 0.60, 0.72]) {
      for (const dx of [-0.105, 0.105]) {
        sphere(0.009, BRASS_LIGHT, [x + dx, y, 0.207]);
      }
    }
  }

  // Right-hand piano keyboard housing, projecting toward the viewer.
  box([0.25, 0.58, 0.135], EBONY, [-0.48, 0.43, 0.235]);
  box([0.265, 0.055, 0.16], BRASS_DARK, [-0.48, 0.72, 0.23]);
  box([0.265, 0.055, 0.16], BRASS_DARK, [-0.48, 0.14, 0.23]);

  // Ivory piano keys: separate blocky keys with dark gaps.
  const whiteKeys = 12;
  const keyHeight = 0.52 / whiteKeys;
  for (let i = 0; i < whiteKeys; i++) {
    const y = 0.18 + keyHeight * (i + 0.5);
    box([0.205, keyHeight - 0.004, 0.085], IVORY, [-0.48, y, 0.32]);
    box([0.205, 0.006, 0.006], IVORY_SHADOW, [-0.48, y - keyHeight / 2, 0.366]);
  }

  // Black keys in a repeated piano pattern.
  const blackPattern = [0, 1, 3, 4, 5, 7, 8, 10, 11];
  for (const i of blackPattern) {
    const y = 0.18 + keyHeight * (i + 0.73);
    box([0.145, keyHeight * 0.58, 0.105], BLACK, [-0.485, y, 0.385]);
    box([0.145, 0.008, 0.006], EBONY, [-0.485, y + keyHeight * 0.29, 0.439]);
  }

  // Keyboard end cheek blocks and a bright name-plate strip.
  box([0.235, 0.035, 0.14], BRASS_LIGHT, [-0.48, 0.155, 0.32]);
  box([0.235, 0.035, 0.14], BRASS_LIGHT, [-0.48, 0.705, 0.32]);
  box([0.21, 0.022, 0.006], PEARL_PINK, [-0.48, 0.435, 0.447]);
  box([0.07, 0.012, 0.008], BRASS_DARK, [-0.48, 0.435, 0.452]);

  // Bass side: twelve pearl-topped bass buttons in a diagonal arrangement.
  box([0.235, 0.57, 0.09], BLACK, [0.48, 0.44, 0.24]);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const y = 0.25 + row * 0.125;
      const z = 0.315 + col * 0.038;
      const x = 0.48 + (col - 1) * 0.062;
      cylinder(0.024, 0.014, BRASS_DARK, [x, y, z], [0, 0, 1], 10);
      disc(0.018, [PEARL, PEARL_PINK, PEARL_GREEN][(row + col) % 3], [x, y, z + 0.009]);
      sphere(0.005, WHITE, [x - 0.006, y + 0.007, z + 0.022]);
    }
  }

  // Bass grille: an inset dark rectangle with vertical gold ribs.
  box([0.18, 0.12, 0.012], BLACK, [0.48, 0.65, 0.30]);
  for (let i = -3; i <= 3; i++) {
    rod([0.48 + i * 0.022, 0.60, 0.312], [0.48 + i * 0.022, 0.70, 0.312], 0.004, BRASS_LIGHT);
  }
  rod([0.39, 0.595, 0.319], [0.57, 0.595, 0.319], 0.005, BRASS);
  rod([0.39, 0.705, 0.319], [0.57, 0.705, 0.319], 0.005, BRASS);

  // Bass-side emblem.
  diamond(0.48, 0.65, 0.07, 0.07, PEARL_GOLD, 0.332);
  sphere(0.48, RED, [0.48, 0.65, 0.342]);

  // Top crown and bottom heel plates.
  box([0.68, 0.034, 0.32], BRASS_DARK, [0, 0.79, 0.02]);
  box([0.68, 0.018, 0.34], BRASS_LIGHT, [0, 0.812, 0.03]);
  box([0.68, 0.05, 0.31], BRASS_DARK, [0, 0.075, 0.02]);
  box([0.68, 0.016, 0.33], BRASS_LIGHT, [0, 0.105, 0.035]);

  // Central crown ornament.
  diamond(0, 0.79, 0.16, 0.045, PEARL_PINK, 0.07);
  diamond(-0.08, 0.79, 0.055, 0.028, PEARL_BLUE, 0.073);
  diamond(0.08, 0.79, 0.055, 0.028, PEARL_GREEN, 0.073);

  // Four small feet keep the heavy instrument grounded.
  for (const x of [-0.48, -0.30, 0.30, 0.48]) {
    cylinder(0.038, 0.055, BRASS_DARK, [x, 0.035, -0.075], [0, 1, 0], 8);
    cylinder(0.027, 0.012, RUBBER, [x, 0.006, -0.075], [0, 1, 0], 8);
  }

  // Rear shoulder blocks and leather strap anchor points.
  box([0.13, 0.20, 0.08], BRASS_DARK, [-0.43, 0.66, -0.16]);
  box([0.13, 0.20, 0.08], BRASS_DARK, [0.43, 0.66, -0.16]);
  for (const x of [-0.43, 0.43]) {
    cylinder(0.027, 0.018, BRASS_LIGHT, [x, 0.70, -0.207], [0, 0, 1], 12);
    cylinder(0.027, 0.018, BRASS_LIGHT, [x, 0.18, -0.207], [0, 0, 1], 12);
  }

  // Two broad rear straps are visible at the shoulders and below the cases.
  box([0.075, 0.46, 0.028], RED, [-0.43, 0.43, -0.21]);
  box([0.075, 0.46, 0.028], RED, [0.43, 0.43, -0.21]);
  box([0.091, 0.035, 0.035], BRASS, [-0.43, 0.68, -0.225]);
  box([0.091, 0.035, 0.035], BRASS, [0.43, 0.68, -0.225]);
  box([0.091, 0.035, 0.035], BRASS, [-0.43, 0.18, -0.225]);
  box([0.091, 0.035, 0.035], BRASS, [0.43, 0.18, -0.225]);

  // Decorative tassel-like strap ends, kept close to the instrument.
  for (const x of [-0.43, 0.43]) {
    box([0.085, 0.10, 0.035], RED, [x, 0.115, -0.22]);
    for (let i = -2; i <= 2; i++) {
      rod(
        [x + i * 0.014, 0.065, -0.245],
        [x + i * 0.014, 0.015, -0.245],
        0.004,
        BRASS_LIGHT,
      );
    }
  }

  // A row of tiny pearl pins along the lower edge, a characteristic luxury detail.
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.052;
    sphere(0.008, [PEARL, PEARL_PINK, PEARL_BLUE, PEARL_GREEN][(i + 5) % 4], [
      x,
      0.135,
      0.18,
    ]);
  }

  // Front bellows latch and central clasp.
  box([0.06, 0.14, 0.025], BRASS_DARK, [0, 0.445, 0.145]);
  box([0.04, 0.085, 0.022], BRASS_LIGHT, [0, 0.445, 0.165]);
  sphere(0.014, PEARL_PINK, [0, 0.445, 0.183]);
  rod([-0.025, 0.39, 0.19], [0.025, 0.39, 0.19], 0.004, BRASS_LIGHT);
  rod([-0.025, 0.50, 0.19], [0.025, 0.50, 0.19], 0.004, BRASS_LIGHT);

  // A few high-contrast highlights on the mother-of-pearl, like shell iridescence.
  for (const [x, y, c] of [
    [-0.43, 0.57, PEARL_GOLD],
    [-0.43, 0.33, PEARL_BLUE],
    [0.43, 0.57, PEARL_PINK],
    [0.43, 0.33, PEARL],
  ] as [number, number, string][]) {
    box([0.055, 0.012, 0.008], c, [x, y, 0.213]);
  }

  // Small side hinges and fasteners.
  for (const x of [-0.60, 0.60]) {
    for (const y of [0.22, 0.66]) {
      cylinder(0.015, 0.025, BRASS_LIGHT, [x, y, 0.08], [1, 0, 0], 8);
      sphere(0.007, PEARL, [x, y, 0.102]);
    }
  }

  // Thin top handle, characteristic of an accordion case.
  rod([-0.20, 0.82, -0.02], [0.20, 0.82, -0.02], 0.018, BLACK);
  rod([-0.20, 0.82, -0.02], [-0.20, 0.77, -0.02], 0.014, BRASS_DARK);
  rod([0.20, 0.82, -0.02], [0.20, 0.77, -0.02], 0.014, BRASS_DARK);
  sphere(0.023, BRASS_LIGHT, [-0.20, 0.82, -0.02]);
  sphere(0.023, BRASS_LIGHT, [0.20, 0.82, -0.02]);

  return b.root;
}

// A local alias used only to keep the repeated foot construction visually legible.
const RUBBER = "#17151b";
