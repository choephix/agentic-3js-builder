```ts
import * as THREE from "three";
import { createBuilder, mix, mottle, paint, rng, smoothstep } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse on a tiny island",
  description:
    "A striped red-and-white lighthouse with a lit lantern room on a grassy rock islet in turquoise shallows, with a keeper's cottage, a flagpole, a jetty, a moored boat and a seagull.",
};

const DEG = Math.PI / 180;

/** The islet's top from the centre out, [radius, height] in metres. The rim below it is the rock cliff. */
const ISLET_TOP: ReadonlyArray<readonly [number, number]> = [
  [0, 3.05],
  [1.6, 3.0],
  [3.6, 2.7],
  [5.6, 2.2],
  [7.4, 1.5],
  [8.6, 1.0],
  [9.2, 0.5],
  [9.6, 0.2],
];

/** The tower's outer radius by height, [height, radius]. */
const TOWER: ReadonlyArray<readonly [number, number]> = [
  [3.6, 2.45],
  [8.0, 2.05],
  [12.0, 1.85],
  [15.0, 1.72],
];

/** Piecewise-linear lookup in a profile whose keys ascend, clamped at both ends. */
function profile(points: ReadonlyArray<readonly [number, number]>, key: number): number {
  if (key <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    const [k1, v1] = points[i];
    if (key <= k1) {
      const [k0, v0] = points[i - 1];
      return v0 + ((v1 - v0) * (key - k0)) / (k1 - k0);
    }
  }
  return points[points.length - 1][1];
}

/** The islet's surface height above the point (x, z). */
const groundAt = (x: number, z: number) => profile(ISLET_TOP, Math.hypot(x, z));
/** The tower's outer radius at height y. */
const towerRadius = (y: number) => profile(TOWER, y);
/** [x, z] at radius r and bearing deg (0 = +Z, 90 = +X, the model's left). */
const polar = (r: number, deg: number): [number, number] => [r * Math.sin(deg * DEG), r * Math.cos(deg * DEG)];

const COLOUR = {
  white: "#f4f0e6",
  cottage: "#f1ead9",
  cottageRoof: "#6e3a33",
  brick: "#8d5a48",
  iron: "#3b3f48",
  navy: "#1f3a57",
  lamp: "#ffe27a",
  roof: "#8c2b22",
  gold: "#d8aa42",
  wood: "#86603f",
  darkWood: "#4a3326",
  door: "#3d2a22",
  blueDoor: "#2f5d7c",
  boat: "#d86a3a",
  stone: "#8a847a",
  bush: "#3f7d3a",
  bushLight: "#55934a",
  tuft: "#7aa84a",
  deep: "#2b7fae",
  shallow: "#6ccfc2",
  foam: "#e8fbf4",
  gull: "#f6f6f1",
  gullWing: "#8d98a6",
  beak: "#f2a03d",
  flag: "#c8402d",
};

export default function lighthouse(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse", detail: 1, paintSize: 1024 });
  const random = rng(11);
  const CX = -4.9; // keeper's cottage centre
  const CZ = 1.3;

  // Skeleton: the islet's base, and the lantern room on its own joint so the lamp can turn.
  const base = b.joint("base", { at: [0, 0, 0] });
  const lamp = b.joint("lantern", { at: [0, 16.4, 0], parent: base });

  // Paints: the islet's rock, grass and beach, and the tower's white and red bands.
  const rock = mottle("#948c7f", "#6d675d", { size: 0.8, seed: 4 });
  const grass = mottle("#9dc46a", "#66984a", { size: 1.2, seed: 6 });
  const sand = mottle("#f2deaa", "#dcc184", { size: 0.5, seed: 8 });
  const islet = paint((p, n) => {
    const top = mix(rock.at(p, n), grass.at(p, n), smoothstep(0.8, 0.9, n.y));
    return mix(top, sand.at(p, n), smoothstep(0.45, 0.1, p.y));
  });

  const whitePaint = mottle("#f6f3ec", "#e6e0d1", { size: 1.6, seed: 2, contrast: 0.5 });
  const redPaint = mottle("#d1472f", "#ae3926", { size: 0.9, seed: 3, contrast: 0.6 });
  const BANDS: ReadonlyArray<readonly [number, number]> = [
    [5.6, 7.2],
    [9.4, 11.0],
    [13.0, 14.6],
  ];
  const towerPaint = paint((p, n) => {
    let cover = 0;
    for (const [y0, y1] of BANDS)
      cover = Math.max(cover, smoothstep(y0 - 0.05, y0 + 0.05, p.y) - smoothstep(y1 - 0.05, y1 + 0.05, p.y));
    return mix(whitePaint.at(p, n), redPaint.at(p, n), cover);
  });

  // The sea: deep water, pale shallows, and a foam ring where the islet meets them.
  b.lathe([[0, -0.3], [15.5, -0.3], [15.5, -0.12], [0, -0.12]], { color: COLOUR.deep, at: [0, 0, 0], segments: 24 });
  b.lathe([[0, -0.25], [11, -0.25], [11, 0], [0, 0]], { color: COLOUR.shallow, at: [0, 0, 0], segments: 24 });
  b.lathe([[8.4, 0], [11.2, 0], [11.2, 0.05], [8.4, 0.05]], { color: COLOUR.foam, at: [0, 0, 0], segments: 24 });

  // The islet: a rock ring with a grassy top and a sandy beach at the waterline.
  b.lathe([[0, -0.2], [8.8, -0.2], ...ISLET_TOP.slice().reverse()], { color: islet, at: [0, 0, 0], segments: 16 });

  // Boulders around the rim.
  const boulders: ReadonlyArray<readonly [number, number, number]> = [
    [6.6, 205, 0.85],
    [8.1, 150, 0.7],
    [8.7, 262, 0.5],
    [9.5, 302, 0.6],
  ];
  for (const [r, deg, size] of boulders) {
    const [x, z] = polar(r, deg);
    b.part(new THREE.SphereGeometry(size, b.segments(9), b.segments(6)), COLOUR.stone, {
      at: [x, groundAt(x, z) - 0.35 * size, z],
      scale: [1.25, 0.75, 1.1],
    });
  }

  // A seagull standing on the boulder at 205 degrees, facing the lighthouse.
  const [gx, gz] = polar(6.6, 205);
  const boulderTop = groundAt(gx, gz) + 0.4 * 0.85;
  const gy = boulderTop + 0.16;
  b.part(new THREE.SphereGeometry(0.2, b.segments(8), b.segments(6)), COLOUR.gull, {
    at: [gx, gy, gz],
    scale: [0.85, 0.8, 1.5],
  });
  b.part(new THREE.SphereGeometry(0.11, b.segments(7), b.segments(5)), COLOUR.gull, {
    at: [gx, gy + 0.13, gz + 0.24],
  });
  b.spike([gx, gy + 0.13, gz + 0.32], [0, 0, 1], 0.17, 0.035, { color: COLOUR.beak });
  for (const side of [-1, 1])
    b.part(new THREE.BoxGeometry(0.05, 0.2, 0.5), COLOUR.gullWing, {
      at: [gx + side * 0.19, gy + 0.02, gz - 0.05],
    });
  b.part(new THREE.BoxGeometry(0.14, 0.04, 0.24), COLOUR.gullWing, { at: [gx, gy + 0.04, gz - 0.36] });

  // Bushes on the grass.
  const bush = (x: number, z: number, s: number) => {
    const y = groundAt(x, z);
    b.part(new THREE.SphereGeometry(s, b.segments(9), b.segments(6)), COLOUR.bush, {
      at: [x, y + 0.3 * s, z],
      scale: [1.2, 0.8, 1.1],
    });
    b.part(new THREE.SphereGeometry(0.6 * s, b.segments(8), b.segments(5)), COLOUR.bushLight, {
      at: [x + 0.5 * s, y + 0.35 * s, z - 0.3 * s],
      scale: [1.1, 0.85, 1.0],
    });
  };
  bush(-2.4, 4.6, 0.75);
  bush(2.9, 4.6, 0.6);
  bush(4.9, 0.2, 0.7);
  bush(-0.6, -5.4, 0.8);

  // Grass tufts and wildflowers scattered over the grass, from a fixed seed.
  const flowerColours = ["#f6e05e", "#f29bc2", "#fbfbf6", "#f2855a"];
  let placed = 0;
  for (let tries = 0; tries < 80 && placed < 22; tries++) {
    const [x, z] = polar(3.9 + random() * 3.1, random() * 360);
    if (Math.hypot(x - CX, z - CZ) < 3.0 || Math.hypot(x - 3.4, z + 3.1) < 1.2) continue;
    placed++;
    const y = groundAt(x, z);
    if (placed % 2 === 0)
      b.spike([x, y - 0.05, z], [random() - 0.5, 1, random() - 0.5], 0.4, 0.09, { color: COLOUR.tuft });
    else
      b.part(new THREE.SphereGeometry(0.1, b.segments(6), b.segments(4)), flowerColours[placed % flowerColours.length], {
        at: [x, y + 0.05, z],
      });
  }

  // The tower: a flared plinth, a tapering shaft, and a gallery deck.
  b.lathe(
    [
      [0, 2.4],
      [3.1, 2.4],
      [3.1, 2.95],
      [2.6, 3.3],
      [2.45, 3.6],
      [2.05, 8.0],
      [1.85, 12.0],
      [1.72, 15.0],
      [0, 15.0],
    ],
    { color: towerPaint, at: [0, 0, 0], segments: 16 },
  );

  // Door on the front (+Z): a white surround, a dark arched door.
  const doorR = towerRadius(4.4);
  b.part(new THREE.BoxGeometry(1.2, 0.12, 1.25), COLOUR.white, { at: [0, 4.33, doorR - 0.02], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.6, 0.6, 0.12, b.segments(10)), COLOUR.white, {
    at: [0, 4.95, doorR - 0.02],
    dir: [0, 0, 1],
  });
  b.part(new THREE.BoxGeometry(0.95, 0.22, 1.2), COLOUR.door, { at: [0, 4.35, doorR], dir: [0, 0, 1] });
  b.part(new THREE.CylinderGeometry(0.475, 0.475, 0.22, b.segments(10)), COLOUR.door, {
    at: [0, 4.95, doorR],
    dir: [0, 0, 1],
  });

  // Windows on all four sides: a white frame, a dark pane and a sill.
  const DIRS: ReadonlyArray<readonly [number, number]> = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];
  const towerWindows = (y: number) => {
    const r = towerRadius(y);
    for (const [x, z] of DIRS) {
      const dir: [number, number, number] = [x, 0, z];
      const spot = (out: number, up = 0): [number, number, number] => [x * (r + out), y + up, z * (r + out)];
      b.part(new THREE.BoxGeometry(0.74, 0.2, 1.14), COLOUR.white, { at: spot(0), dir });
      b.part(new THREE.BoxGeometry(0.5, 0.16, 0.86), COLOUR.navy, { at: spot(0.06), dir });
      b.part(new THREE.BoxGeometry(0.9, 0.14, 0.08), COLOUR.white, { at: spot(0.05, -0.62), dir });
    }
  };
  towerWindows(8.3);
  towerWindows(12.0);

  // Gallery deck and iron railing.
  b.lathe(
    [
      [0, 14.92],
      [2.85, 14.92],
      [2.92, 15.02],
      [2.85, 15.12],
      [0, 15.12],
    ],
    { color: COLOUR.iron, at: [0, 0, 0], segments: 16 },
  );
  for (let i = 0; i < 16; i++) {
    const [x, z] = polar(2.7, (i / 16) * 360);
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.9, b.segments(5)), COLOUR.iron, { at: [x, 15.57, z] });
  }
  b.part(new THREE.TorusGeometry(2.7, 0.05, b.segments(6), b.segments(32)), COLOUR.iron, {
    at: [0, 16.03, 0],
    rotation: [90, 0, 0],
  });

  // Lantern room, on the lamp joint: a warm eight-sided glass room with dark mullions.
  b.lathe(
    [
      [0, 15.12],
      [1.6, 15.12],
      [1.62, 15.3],
      [1.42, 15.42],
      [0, 15.42],
    ],
    { color: COLOUR.iron, at: [0, 0, 0], segments: 8, bone: lamp },
  );
  b.lathe(
    [
      [0, 15.3],
      [1.3, 15.3],
      [1.3, 17.5],
      [0, 17.5],
    ],
    { color: COLOUR.lamp, at: [0, 0, 0], segments: 8, bone: lamp },
  );
  for (let i = 0; i < 8; i++) {
    const [x, z] = polar(1.3, (i / 8) * 360);
    b.part(new THREE.BoxGeometry(0.1, 0.12, 2.1), COLOUR.iron, { at: [x, 16.4, z], dir: [x, 0, z], bone: lamp });
  }

  // Red roof cap, gold finial and lightning rod.
  b.lathe(
    [
      [0, 17.4],
      [1.72, 17.4],
      [1.62, 17.6],
      [1.02, 18.3],
      [0.4, 18.95],
      [0, 19.1],
    ],
    { color: COLOUR.roof, at: [0, 0, 0], segments: 8, bone: lamp },
  );
  b.part(new THREE.SphereGeometry(0.13, b.segments(8), b.segments(6)), COLOUR.gold, { at: [0, 19.2, 0], bone: lamp });
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 1.0, b.segments(5)), COLOUR.gold, {
    at: [0, 19.83, 0],
    bone: lamp,
  });

  // Keeper's cottage: white walls, a gable roof, a chimney, a blue door and a window.
  b.part(new THREE.BoxGeometry(3.0, 2.9, 2.6), COLOUR.cottage, { at: [CX, 2.75, CZ] });
  b.extrude(
    [
      [-1.85, 0],
      [1.85, 0],
      [0, 1.6],
    ],
    { color: COLOUR.cottageRoof, at: [CX, 4.2, CZ], x: [1, 0, 0], thickness: 3.0 },
  );
  b.part(new THREE.BoxGeometry(0.5, 1.3, 0.5), COLOUR.brick, { at: [CX + 0.9, 4.95, CZ - 0.45] });
  b.part(new THREE.BoxGeometry(0.7, 0.14, 1.2), COLOUR.blueDoor, {
    at: [CX - 0.55, 2.55, CZ + 1.33],
    dir: [0, 0, 1],
  });
  b.part(new THREE.BoxGeometry(0.72, 0.14, 0.72), COLOUR.white, { at: [CX + 0.8, 3.15, CZ + 1.3], dir: [0, 0, 1] });
  b.part(new THREE.BoxGeometry(0.5, 0.12, 0.5), COLOUR.navy, { at: [CX + 0.8, 3.15, CZ + 1.34], dir: [0, 0, 1] });

  // Flagpole at the back, with a red flag.
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 3.2, b.segments(5)), COLOUR.white, { at: [3.4, 3.8, -3.1] });
  b.extrude(
    [
      [0.05, 0],
      [1.2, 0.12],
      [1.1, 0.36],
      [1.2, 0.6],
      [0.05, 0.7],
    ],
    { color: COLOUR.flag, at: [3.4, 4.7, -3.1], x: [1, 0, 0], thickness: 0.05 },
  );

  // Jetty on the front-right, with a moored boat alongside.
  const theta = 35 * DEG;
  const along: [number, number, number] = [Math.sin(theta), 0, Math.cos(theta)];
  const across: [number, number, number] = [Math.cos(theta), 0, -Math.sin(theta)];
  const onJetty = (r: number, side: number, y: number): [number, number, number] => [
    along[0] * r + across[0] * side,
    y,
    along[2] * r + across[2] * side,
  ];
  b.part(new THREE.BoxGeometry(1.2, 5.0, 0.14), COLOUR.wood, { at: onJetty(11.3, 0, 0.36), dir: along });
  for (const r of [10.3, 12.5])
    for (const side of [-0.5, 0.5])
      b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.6, b.segments(5)), COLOUR.darkWood, {
        at: onJetty(r, side, 0),
      });
  b.extrude(
    [
      [-1.2, 0.22],
      [1.2, 0.22],
      [0.8, -0.15],
      [-0.75, -0.15],
    ],
    { color: COLOUR.boat, at: onJetty(12.0, 1.45, 0), x: along, thickness: [0.6, 1.0] },
  );

  return b.root;
}
```