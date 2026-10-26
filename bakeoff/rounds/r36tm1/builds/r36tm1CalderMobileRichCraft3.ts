import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "calder hanging mobile",
  description:
    "An asymmetrical Alexander Calder-inspired hanging mobile of thin black wire, primary-colored abstract plates, discs, crescents, and balancing forms.",
};

const INK = "#17151c";
const RED = "#e43b32";
const YELLOW = "#f4c62d";
const BLUE = "#2368bd";
const ORANGE = "#ed7a32";
const PINK = "#d84c8c";
const WHITE = "#f4eee1";
const GREEN = "#4d9b66";

const sunTexture = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#f4c62d"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#17151c" stroke-width="4"/>
    <path d="M50 12V88M12 50H88M23 23L77 77M77 23L23 77"
      stroke="#e43b32" stroke-width="4"/>
    <circle cx="50" cy="50" r="9" fill="#2368bd" stroke="#17151c" stroke-width="3"/>
  </svg>`,
  { size: 192 },
);

const bullseyeTexture = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#2368bd"/>
    <circle cx="50" cy="50" r="37" fill="#ed7a32" stroke="#17151c" stroke-width="4"/>
    <circle cx="50" cy="50" r="22" fill="#f4eee1" stroke="#17151c" stroke-width="4"/>
    <circle cx="50" cy="50" r="9" fill="#e43b32"/>
  </svg>`,
  { size: 192 },
);

const stripeTexture = svg(
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#d84c8c"/>
    <path d="M-20 100L20 140M-10 60L60 130M0 10L110 120M50-20L140 70"
      stroke="#f4eee1" stroke-width="13"/>
    <path d="M-20 100L20 140M-10 60L60 130M0 10L110 120M50-20L140 70"
      stroke="#17151c" stroke-width="3" opacity=".9"/>
  </svg>`,
  { size: 192 },
);

const dotTexture = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#4d9b66"/>
    <g fill="#f4eee1" stroke="#17151c" stroke-width="2">
      <circle cx="20" cy="20" r="8"/><circle cx="50" cy="20" r="8"/><circle cx="80" cy="20" r="8"/>
      <circle cx="35" cy="50" r="8"/><circle cx="65" cy="50" r="8"/>
      <circle cx="20" cy="80" r="8"/><circle cx="50" cy="80" r="8"/><circle cx="80" cy="80" r="8"/>
    </g>
  </svg>`,
  { size: 192 },
);

const slashTexture = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#e43b32"/>
    <path d="M12 88L88 12" stroke="#f4eee1" stroke-width="15"/>
    <path d="M12 88L88 12" stroke="#17151c" stroke-width="4"/>
    <path d="M-10 55L45 0M55 100L110 45" stroke="#2368bd" stroke-width="8"/>
  </svg>`,
  { size: 192 },
);

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "calderMobile", detail: 1 });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius = 0.007,
    color = INK,
  ) => {
    return b.rod(a, c, radius, { color, section: { ngon: 6 }, caps: "round" });
  };

  const sphere = (
    p: [number, number, number],
    radius: number,
    color = INK,
  ) => {
    return b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at: p,
      flat: true,
    });
  };

  const disk = (
    p: [number, number, number],
    radius: number,
    depth: number,
    color: string,
    texture?: THREE.Texture,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, depth, 12, 1),
      color,
      {
        at: p,
        dir: [0, 0, 1],
        texture,
        flat: true,
      },
    );
  };

  const face = (
    p: [number, number, number],
    radius: number,
    color: string,
    texture: THREE.Texture,
  ) => {
    return b.part(new THREE.CircleGeometry(radius, 20), color, {
      at: [p[0], p[1], p[2] + 0.014],
      dir: [0, 0, 1],
      axis: "z",
      texture,
      flat: true,
    });
  };

  const plate = (
    outline: Array<[number, number]>,
    at: [number, number, number],
    color: string,
    thickness = 0.025,
  ) => {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel: 0.004,
      color,
      smoothing: 0,
      flat: true,
    });
  };

  const triangle = (
    at: [number, number, number],
    w: number,
    h: number,
    color: string,
    flip = false,
  ) => {
    const outline: [number, number][] = flip
      ? [
          [-w * 0.5, h * 0.5],
          [w * 0.5, h * 0.5],
          [0, -h * 0.5],
        ]
      : [
          [-w * 0.5, -h * 0.5],
          [w * 0.5, -h * 0.5],
          [0, h * 0.5],
        ];
    return plate(outline, at, color);
  };

  const crescent = (
    at: [number, number, number],
    w: number,
    h: number,
    color: string,
  ) => {
    const outline: [number, number][] = [
      [-w * 0.48, h * 0.35],
      [-w * 0.22, h * 0.5],
      [w * 0.2, h * 0.42],
      [w * 0.46, h * 0.18],
      [w * 0.27, -h * 0.2],
      [-w * 0.1, -h * 0.48],
      [-w * 0.43, -h * 0.38],
      [-w * 0.2, -h * 0.08],
      [w * 0.04, h * 0.12],
    ];
    return plate(outline, at, color);
  };

  const bar = (
    a: [number, number, number],
    c: [number, number, number],
    color = INK,
  ) => {
    rod(a, c, 0.009, color);
    sphere(a, 0.016, color);
    sphere(c, 0.016, color);
  };

  // Suspension crown: a tiny hook and the first vertical wire.
  b.part(new THREE.TorusGeometry(0.075, 0.009, 6, 14, Math.PI * 1.55), INK, {
    at: [0, 2.84, 0],
    rotation: [0, 0, -0.35],
    flat: true,
  });
  rod([0, 2.81, 0], [0, 2.55, 0], 0.008);
  sphere([0, 2.55, 0], 0.018);

  // Highest balancing arm: a long, slightly off-centre black line.
  bar([-0.62, 2.35, 0], [0.73, 2.35, 0]);
  rod([0, 2.55, 0], [0, 2.35, 0], 0.007);

  // High left red triangular plate.
  rod([-0.62, 2.35, 0], [-0.62, 2.08, 0], 0.006);
  triangle([-0.62, 1.88, 0], 0.42, 0.42, RED);
  b.part(new THREE.CircleGeometry(0.035, 8), WHITE, {
    at: [-0.62, 1.91, 0.018],
    dir: [0, 0, 1],
    axis: "z",
    flat: true,
  });

  // High right yellow disc with graphic face.
  rod([0.73, 2.35, 0], [0.73, 2.08, 0], 0.006);
  disk([0.73, 1.9, 0], 0.22, 0.035, YELLOW);
  face([0.73, 1.9, 0], 0.205, YELLOW, sunTexture);

  // A second arm hangs from the first arm's left half.
  rod([-0.18, 2.35, 0], [-0.18, 2.0, 0], 0.006);
  bar([-0.92, 1.98, 0], [0.52, 1.98, 0]);

  // Green crescent on the far left.
  rod([-0.92, 1.98, 0], [-0.92, 1.68, 0], 0.006);
  crescent([-0.92, 1.43, 0], 0.5, 0.48, GREEN);
  b.part(new THREE.CircleGeometry(0.055, 8), RED, {
    at: [-0.85, 1.5, 0.018],
    dir: [0, 0, 1],
    axis: "z",
    flat: true,
  });

  // Blue disc on the shorter right end.
  rod([0.52, 1.98, 0], [0.52, 1.68, 0], 0.006);
  disk([0.52, 1.46, 0], 0.19, 0.032, BLUE);
  face([0.52, 1.46, 0], 0.177, BLUE, bullseyeTexture);

  // Central drop to the middle arm.
  rod([-0.18, 2.0, 0], [-0.18, 1.58, 0], 0.007);
  bar([-0.68, 1.58, 0], [0.72, 1.58, 0]);

  // Large orange blade suspended at the left.
  rod([-0.68, 1.58, 0], [-0.68, 1.28, 0], 0.006);
  plate(
    [
      [-0.2, 0.25],
      [0.18, 0.18],
      [0.28, -0.04],
      [0.04, -0.34],
      [-0.25, -0.18],
    ],
    [-0.68, 1.02, 0],
    ORANGE,
  );
  b.part(new THREE.BoxGeometry(0.06, 0.06, 0.04), WHITE, {
    at: [-0.68, 1.02, 0.04],
    flat: true,
  });

  // Small pink striped disc at the middle-right.
  rod([0.72, 1.58, 0], [0.72, 1.28, 0], 0.006);
  disk([0.72, 1.03, 0], 0.18, 0.034, PINK);
  face([0.72, 1.03, 0], 0.168, PINK, stripeTexture);

  // A lower, deliberately counterweighted arm.
  rod([0.04, 1.58, 0], [0.04, 1.2, 0], 0.006);
  bar([-0.55, 1.2, 0], [0.43, 1.2, 0]);

  // Tiny yellow triangle at the left end.
  rod([-0.55, 1.2, 0], [-0.55, 0.91, 0], 0.005);
  triangle([-0.55, 0.69, 0], 0.28, 0.34, YELLOW, true);

  // Green patterned disc at the right end.
  rod([0.43, 1.2, 0], [0.43, 0.89, 0], 0.005);
  disk([0.43, 0.65, 0], 0.17, 0.03, GREEN);
  face([0.43, 0.65, 0], 0.158, GREEN, dotTexture);

  // Lowest independent arm, hung from the central drop.
  rod([0.04, 1.2, 0], [0.04, 0.86, 0], 0.006);
  bar([-0.34, 0.86, 0], [0.68, 0.86, 0]);

  // Lowest red slash plate and blue crescent.
  rod([-0.34, 0.86, 0], [-0.34, 0.59, 0], 0.005);
  plate(
    [
      [-0.2, -0.28],
      [-0.03, -0.34],
      [0.22, 0.25],
      [0.08, 0.34],
    ],
    [-0.34, 0.32, 0],
    RED,
    0.022,
  );
  b.part(new THREE.PlaneGeometry(0.27, 0.27), WHITE, {
    at: [-0.34, 0.32, 0.018],
    dir: [0, 0, 1],
    axis: "z",
    texture: slashTexture,
    flat: true,
  });

  rod([0.68, 0.86, 0], [0.68, 0.55, 0], 0.005);
  crescent([0.68, 0.29, 0], 0.38, 0.5, BLUE);

  // A few characteristic exposed balancing knots.
  sphere([0, 2.35, 0], 0.024);
  sphere([-0.18, 1.98, 0], 0.021);
  sphere([0.04, 1.2, 0], 0.021);

  // Slightly offset rear silhouettes make the mobile read as layered, not flat.
  triangle([0.18, 2.1, -0.06], 0.22, 0.25, WHITE);
  disk([-0.02, 1.72, -0.055], 0.11, 0.022, ORANGE);
  crescent([0.1, 0.94, -0.05], 0.26, 0.3, PINK);

  return b.root;
}
