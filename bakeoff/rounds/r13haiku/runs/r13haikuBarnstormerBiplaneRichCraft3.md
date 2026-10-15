```ts
import * as THREE from "three";
import { catmull, createBuilder, line, paint, svg } from "agentic-3js-builder";
import { cel, INK } from "agentic-3js-builder/kits/toon";

type V3 = [number, number, number];

export const meta = {
  name: "Barnstormer biplane",
  description:
    "A candy-striped open-cockpit biplane with a painted face on its cowling, a pilot in goggles and a scarf streaming behind.",
};

// ---------------------------------------------------------------------------------------------------------------
// Dimensions in meters. +Z is the nose, +X is the model's left, the wheels touch y = 0.

const BODY_Y = 1.38; // fuselage centre height
const HUB: V3 = [0, BODY_Y, 2.3]; // propeller hub, just ahead of the cowling
const HEAD: V3 = [0, 2.22, -0.4]; // pilot's head, behind the lower wing's trailing edge
const LOWER_Y = 0.92;
const UPPER_Y = 2.2;
const WING_Z = 0.2;
const WHEEL_X = 0.75;
const WHEEL_R = 0.36;
const WHEEL_Z = 0.2;

// ---------------------------------------------------------------------------------------------------------------
// Palette

const RED = "#e8432f";
const CREAM = "#fff1d0";
const YELLOW = "#ffc83d";
const BLUE = "#4fb6e8";
const WOOD = "#d69a4e";
const SKIN = "#f6c9a0";
const LEATHER = "#7a4a2a";
const DARK = "#3a2a24";
const GLASS = "#b8f0ff";
const BRASS = "#d9a53a";

// Flat cel materials for plain pieces.
const m = {
  red: cel(RED),
  cream: cel(CREAM),
  yellow: cel(YELLOW),
  blue: cel(BLUE),
  skin: cel(SKIN),
  leather: cel(LEATHER),
  dark: cel(DARK),
  glass: cel(GLASS),
  brass: cel(BRASS),
};

/** Cel-shaded paint from a function that returns colour strings. Use plain strings inside, one cel per surface. */
const toon = (fn: Parameters<typeof paint>[0]) => cel(paint(fn));

// ---------------------------------------------------------------------------------------------------------------
// Painted surfaces

const hullPaint = toon((p, n) => {
  if (p.z > 1.5) return YELLOW; // cowling
  if (p.z < -2.0) return CREAM; // tail cone
  if (n.y < -0.5) return CREAM; // belly
  if (Math.abs(n.x) > 0.5 && Math.abs(p.y - 1.14) < 0.045) return YELLOW; // side pinstripe
  return RED;
});

// Wing paints read s = [chord, span] in meters from the wing's centre.
const lowerPaint = toon((_p, _n, s) => (Math.abs(s[1]) > 3.3 ? BLUE : CREAM));
const upperPaint = toon((_p, _n, s) => (Math.floor((s[1] + 4) / 0.7) % 2 ? CREAM : RED));
const finPaint = toon((_p, _n, s) => (s[1] > 0.95 ? YELLOW : RED));
const spinnerPaint = toon((_p, _n, s) => (Math.floor(s[1] / 60) % 2 ? RED : YELLOW));
const bladePaint = toon((_p, _n, s) => (Math.abs(s[1]) > 0.9 ? RED : WOOD));
const scarfPaint = toon((_p, _n, s) => (Math.floor(s[0] * 6) % 2 ? YELLOW : RED));

// ---------------------------------------------------------------------------------------------------------------
// Drawings

/** A big googly eye for the cowling. */
const EYE = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="46" fill="#fffdf4" stroke="${INK}" stroke-width="7"/>
    <circle cx="56" cy="57" r="27" fill="${INK}"/>
    <circle cx="64" cy="48" r="9" fill="#ffffff"/>
    <circle cx="46" cy="66" r="4" fill="#ffffff"/>
  </svg>`,
  { size: 128 },
);

/** A roundel: cream ring, red field, blue boss. */
const ROUNDEL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="47" fill="#fffdf4" stroke="${INK}" stroke-width="5"/>
    <circle cx="50" cy="50" r="31" fill="${RED}"/>
    <circle cx="50" cy="50" r="15" fill="${BLUE}"/>
  </svg>`,
  { size: 192 },
);

/** A cheerful smile for the pilot. */
const SMILE = svg(
  `<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 14 Q50 56 90 14" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

/** The name painted along the fuselage. */
const SKY = svg(
  `<svg viewBox="0 0 440 90" xmlns="http://www.w3.org/2000/svg">
    <text x="220" y="70" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="74"
      fill="${INK}" stroke="#fffdf4" stroke-width="12" paint-order="stroke" stroke-linejoin="round">SKY CANDY</text>
  </svg>`,
  { size: 512 },
);

/** A fringed tassel on the end of the scarf. */
const TASSEL = svg(
  `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="12" r="8" fill="${RED}" stroke="${INK}" stroke-width="3"/>
    <path d="M20 18 L13 56 M30 18 L30 58 M40 18 L47 56" stroke="${YELLOW}" stroke-width="7" stroke-linecap="round"/>
  </svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------------------------------------------------------
// Shapes

/** A wing plan: chord along z (outline x), span along x (outline y). */
function wingOutline(span: number): [number, number][] {
  return [
    [0.62, -span],
    [0.62, span],
    [-0.58, span],
    [-0.58, -span],
  ];
}

/** Two-bladed propeller outline in its own plane (x across, y up). */
const BLADE: [number, number][] = [
  [0.1, 1.12],
  [0.07, 0.6],
  [0.14, 0.2],
  [0.14, -0.2],
  [0.07, -0.6],
  [0.1, -1.12],
  [-0.1, -1.12],
  [-0.07, -0.6],
  [-0.14, -0.2],
  [-0.14, 0.2],
  [-0.07, 0.6],
  [-0.1, 1.12],
];

export default function build() {
  const b = createBuilder({ name: "barnstormer" });

  // Skeleton: body root, spinning prop, pilot's head, two wheels and two ailerons.
  const root = b.joint("root", { at: [0, BODY_Y, 0], role: "spine" });
  const prop = b.joint("prop", { parent: root, at: HUB, dir: [0, 0, 1], role: "fan" });
  const head = b.joint("head", { parent: root, at: HEAD, role: "head" });
  const wheelL = b.joint("wheelL", { parent: root, at: [WHEEL_X, WHEEL_R, WHEEL_Z], dir: [1, 0, 0] });
  const wheelR = b.joint("wheelR", { parent: root, at: [-WHEEL_X, WHEEL_R, WHEEL_Z], dir: [1, 0, 0] });
  const aileronL = b.joint("aileronL", { parent: root, at: [3.1, UPPER_Y, WING_Z - 0.3], role: "hinge" });
  const aileronR = b.joint("aileronR", { parent: root, at: [-3.1, UPPER_Y, WING_Z - 0.3], role: "hinge" });

  // Fuselage: a chunky loft from a small nose to a slim tail.
  const hull = b.loft(
    [
      { at: [0, BODY_Y, 2.2], w: 0.7, h: 0.78 },
      { at: [0, BODY_Y, 1.8], w: 0.9, h: 0.96 },
      { at: [0, BODY_Y, 0.9], w: 0.96, h: 1.0 },
      { at: [0, BODY_Y, 0.0], w: 0.92, h: 0.98 },
      { at: [0, BODY_Y, -0.9], w: 0.74, h: 0.82 },
      { at: [0, BODY_Y - 0.08, -1.7], w: 0.46, h: 0.52 },
      { at: [0, BODY_Y - 0.16, -2.3], w: 0.2, h: 0.24 },
    ],
    { bone: root, color: hullPaint },
  );
  const hullSkin = b.surface(hull);

  // Pins round the cowling, like the heads of a radial engine.
  b.ring(line([0, BODY_Y, 2.1], [0, BODY_Y, 2.3]), { count: 7, radius: 0.4, tilt: 90 }, (item) =>
    b.spike(item, item, 0.13, 0.05, { color: m.dark }),
  );

  // Big googly eyes on the cowling.
  for (const s of [1, -1]) {
    const hit = hullSkin.around([0, BODY_Y + 0.02, 1.35]).at(s * 30, 6);
    if (hit) b.decal(hull, EYE, { at: hit, size: [0.26, 0.26] });
  }

  // Cream hoop round the body at the cockpit.
  const hoop = hullSkin.loop([0, BODY_Y, -0.4], { dir: [0, 0, 1], lift: 0.02 });
  b.sweep(hoop, 0.035, { color: m.cream, bone: root });

  // Brass rivets along the side pinstripe.
  for (const s of [1, -1])
    for (let i = 0; i < 16; i++) {
      const z = -1.6 + i * 0.2;
      if (Math.abs(z + 0.4) < 0.12) continue;
      const hit = hullSkin.around([0, 1.14, z]).at(s * 90, 0);
      if (hit) b.stick(new THREE.SphereGeometry(0.028, 6, 4), m.brass, hit, { embed: 0.4 });
    }

  // Roundels and the name on the fuselage sides.
  for (const s of [1, -1]) {
    const roundel = hullSkin.around([0, BODY_Y, -0.95]).at(s * 90, 0);
    if (roundel) b.decal(hull, ROUNDEL, { at: roundel, size: [0.4, 0.4] });
    const name = hullSkin.around([0, BODY_Y, 0.85]).at(s * 90, 0);
    if (name) b.decal(hull, SKY, { at: name, size: [1.3, 0.27] });
  }

  // Propeller: spinner, two wooden blades.
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.32, 0.08],
      [0.26, 0.22],
      [0.12, 0.34],
      [0, 0.38],
    ],
    { at: [0, BODY_Y, 2.2], axis: [0, 0, 1], segments: 14, smoothing: 1, color: spinnerPaint, bone: prop },
  );
  b.extrude(BLADE, {
    at: HUB,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.05, 0.02],
    bevel: 0.008,
    color: bladePaint,
    bone: prop,
  });

  // Wings: a lower and an upper plane, each a rounded slab with a striped paint.
  b.extrude(wingOutline(4.2), {
    at: [0, LOWER_Y, WING_Z],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.13,
    bevel: 0.02,
    smoothing: 1,
    color: lowerPaint,
    bone: root,
  });
  const upper = b.extrude(wingOutline(4.0), {
    at: [0, UPPER_Y, WING_Z],
    x: [0, 0, 1],
    y: [1, 0, 0],
    thickness: 0.13,
    bevel: 0.02,
    smoothing: 1,
    color: upperPaint,
    bone: root,
  });

  // Ailerons on the upper wing's trailing edge, one per side.
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-0.58, 3.1 * s],
        [-0.58, 3.95 * s],
        [-0.3, 3.95 * s],
        [-0.3, 3.1 * s],
      ],
      {
        at: [0, UPPER_Y, WING_Z],
        x: [0, 0, 1],
        y: [1, 0, 0],
        thickness: 0.17,
        bevel: 0.015,
        color: m.yellow,
        bone: s > 0 ? aileronL : aileronR,
      },
    );
  }

  // Interplane struts and cross-bracing wires.
  for (const s of [1, -1])
    for (const x of [1.5, 3.3])
      for (const z of [0.55, -0.15])
        b.rod([s * x, LOWER_Y + 0.06, z], [s * x, UPPER_Y - 0.06, z], 0.035, m.yellow, { bone: root });
  for (const s of [1, -1])
    for (const [x0, x1] of [
      [1.5, 3.3],
      [3.3, 3.95],
    ]) {
      b.rod([s * x0, LOWER_Y + 0.06, 0.55], [s * x1, UPPER_Y - 0.06, -0.15], 0.012, m.dark, { bone: root });
      b.rod([s * x0, UPPER_Y - 0.06, 0.55], [s * x1, LOWER_Y + 0.06, -0.15], 0.012, m.dark, { bone: root });
    }

  // Cabane struts from the fuselage top up to the upper wing.
  for (const s of [1, -1])
    for (const z of [0.55, -0.2])
      b.rod([s * 0.32, 1.55, z], [s * 0.32, UPPER_Y - 0.06, z], 0.035, m.yellow, { bone: root });

  // Landing gear: a V of legs per side, the axle, and the two wheels.
  for (const s of [1, -1])
    for (const z of [0.5, -0.1])
      b.rod([s * 0.28, 1.05, z], [s * WHEEL_X, WHEEL_R, WHEEL_Z], 0.04, m.dark, { bone: root });
  b.rod([-WHEEL_X, WHEEL_R, WHEEL_Z], [WHEEL_X, WHEEL_R, WHEEL_Z], 0.035, m.dark, { bone: root });

  for (const [wheel, x] of [
    [wheelL, WHEEL_X],
    [wheelR, -WHEEL_X],
  ] as const) {
    const at: V3 = [x, WHEEL_R, WHEEL_Z];
    b.part(new THREE.CylinderGeometry(WHEEL_R, WHEEL_R, 0.16, 18), m.dark, { bone: wheel, at, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.17, 0.17, 0.18, 12), m.yellow, { bone: wheel, at, dir: [1, 0, 0] });
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.2, 8), m.red, { bone: wheel, at, dir: [1, 0, 0] });
  }

  // Tail skid.
  b.rod([0, 1.15, -1.9], [0, 0.05, -2.3], 0.045, m.dark, { bone: root });

  // Tail: a fin with a yellow top band, and a cream tailplane.
  const fin = b.extrude(
    [
      [0.14, 0],
      [0.1, 0.55],
      [-0.12, 1.2],
      [-0.4, 1.22],
      [-0.44, 0],
    ],
    {
      at: [0, 1.2, -2.0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.05,
      bevel: 0.012,
      color: finPaint,
      bone: root,
    },
  );
  b.extrude(
    [
      [0.22, -1.15],
      [0.22, 1.15],
      [-0.22, 1.1],
      [-0.22, -1.1],
    ],
    {
      at: [0, 1.36, -2.0],
      x: [0, 0, 1],
      y: [1, 0, 0],
      thickness: 0.07,
      bevel: 0.015,
      smoothing: 1,
      color: m.cream,
      bone: root,
    },
  );
  const finSurf = b.surface(fin);
  const finRight = finSurf.ray([3, 1.9, -2.2], [-1, 0, 0]);
  if (finRight) b.decal(fin, ROUNDEL, { at: finRight, size: [0.4, 0.4] });
  const finLeft = finSurf.ray([-3, 1.9, -2.2], [1, 0, 0]);
  if (finLeft) b.decal(fin, ROUNDEL, { at: finLeft, size: [0.4, 0.4] });

  // Roundels on the upper wing's top, drawn from above.
  const upperSurf = b.surface(upper);
  for (const x of [2.3, -2.3]) {
    const top = upperSurf.ray([x, 6, WING_Z], [0, -1, 0]);
    if (top) b.decal(upper, ROUNDEL, { at: top, up: [0, 0, 1], size: [0.6, 0.6] });
  }

  // Pilot: head, neck, leather helmet, goggles and a smiling face.
  const headPart = b.part(new THREE.SphereGeometry(0.27, 16, 12), m.skin, { bone: head, at: HEAD });
  b.capsule([0, 1.6, -0.4], [0, 2.1, -0.4], 0.12, m.skin, { bone: root });
  b.lathe(
    [
      [0, 0],
      [0.3, 0],
      [0.31, 0.04],
      [0.27, 0.14],
      [0.15, 0.26],
      [0, 0.3],
    ],
    { at: [0, HEAD[1] + 0.1, HEAD[2]], axis: [0, 1, 0], segments: 14, smoothing: 1, color: m.leather, bone: head },
  );
  b.part(new THREE.TorusGeometry(0.285, 0.025, 6, 20), m.leather, {
    bone: head,
    at: [0, HEAD[1] + 0.03, HEAD[2]],
    rotation: [90, 0, 0],
  });
  for (const s of [1, -1]) {
    const at: V3 = [s * 0.11, HEAD[1] + 0.03, HEAD[2] + 0.24];
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 14), m.brass, { bone: head, at, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 14), m.glass, {
      bone: head,
      at: [at[0], at[1], at[2] + 0.02],
      dir: [0, 0, 1],
    });
  }
  const mouth = b.surface(headPart).nearest([0, HEAD[1] - 0.09, HEAD[2] + 0.25]);
  b.decal(headPart, SMILE, { at: mouth, size: [0.17, 0.085] });

  // Scarf: a ribbon at the neck, wrapped once and streaming back over the tail.
  b.part(new THREE.TorusGeometry(0.15, 0.05, 8, 14), m.red, {
    bone: root,
    at: [0, 1.93, -0.4],
    rotation: [90, 0, 0],
  });
  const scarfPath = catmull(
    [
      [0, 1.94, -0.5],
      [0.02, 2.05, -1.1],
      [0.1, 2.45, -1.7],
      [0.18, 2.85, -2.4],
      [0.14, 3.0, -3.2],
    ],
    {},
  );
  b.sweep(scarfPath, (t): [number, number] => [0.085 - 0.03 * t, 0.012], {
    color: scarfPaint,
    caps: "flat",
    bone: root,
  });
  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    bone: root,
    at: [0.14, 3.0, -3.3],
    dir: [0, 0, -1],
    axis: "z",
    texture: TASSEL,
  });

  return b.root;
}
```