```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-style Dutch windmill with a chunky brick tower, teal cap, striped sails, glowing windows, door, balcony and colorful trim.",
};

export default function build() {
  const b = createBuilder({ name: "dutchWindmill", detail: 1 });

  const BRICK = "#c97852";
  const BRICK_DARK = "#9e4e3d";
  const BRICK_LIGHT = "#eaa276";
  const CREAM = "#fff0c5";
  const WOOD = "#7c4933";
  const WOOD_DARK = "#4c2b26";
  const TEAL = "#4fb8a4";
  const TEAL_DARK = "#287e78";
  const ROOF = "#376c6a";
  const ROOF_LIGHT = "#6fc2ae";
  const GOLD = "#f3c85b";
  const SKY = "#9be4e5";
  const WINDOW = "#75d7dc";
  const FLOWER = "#f17d91";
  const INK = "#352630";

  const root = b.joint("millRoot", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const tower = b.joint("tower", {
    parent: root,
    at: [0, 0.02, 0],
    dir: [0, 1, 0],
    role: "spine",
  });

  const roofJoint = b.joint("cap", {
    parent: tower,
    at: [0, 2.28, 0],
    dir: [0, 1, 0],
    role: "hinge",
  });

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) {
    return b.part(geometry, color, {
      bone: tower,
      at,
      flat: true,
      ...extra,
    });
  }

  function roofPart(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    extra: Record<string, unknown> = {},
  ) {
    return b.part(geometry, color, {
      bone: roofJoint,
      at,
      flat: true,
      ...extra,
    });
  }

  function box(
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    bone = tower,
  ) {
    return b.part(new THREE.BoxGeometry(...size), color, {
      bone,
      at,
      flat: true,
    });
  }

  function cylinder(
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 10,
    bone = tower,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      bone,
      at,
      flat: true,
    });
  }

  function rod(
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
    bone = tower,
  ) {
    return b.rod(a, c, radius, {
      bone,
      color,
      section: { ngon: 6 },
      caps: "flat",
    });
  }

  // Broad, slightly tapered tower body.
  b.loft(
    [
      { at: [-0.68, 0.06, 0], w: 1.36, h: 1.18 },
      { at: [-0.58, 0.72, 0], w: 1.16, h: 1.08 },
      { at: [-0.46, 1.42, 0], w: 0.92, h: 0.88 },
      { at: [-0.38, 2.18, 0], w: 0.76, h: 0.66 },
    ],
    {
      bone: tower,
      color: BRICK,
      section: "box",
      caps: "flat",
      name: "taperedBrickTower",
    },
  );

  // Large cream foundation stones and masonry courses.
  for (let y = 0.1; y <= 1.95; y += 0.28) {
    const half = 0.68 - (y / 2.2) * 0.28;
    rod([-half, y, -0.025], [half, y, -0.025], 0.018, BRICK_DARK, tower);
  }

  // Irregular warm brick highlights, kept blocky and graphic.
  const brickRows = [
    [0.18, -0.45, 0.26],
    [0.18, 0.08, 0.26],
    [0.46, -0.25, 0.22],
    [0.74, 0.22, 0.2],
    [1.02, -0.38, 0.22],
    [1.3, 0.1, 0.18],
    [1.58, -0.18, 0.18],
    [1.86, 0.04, 0.16],
  ];
  for (const [y, x, w] of brickRows) {
    box([w, 0.1, 0.025], BRICK_LIGHT, [x, y, 0.595]);
  }

  // White-painted base skirt.
  box([1.43, 0.13, 1.18], CREAM, [0, 0.075, 0.01]);
  rod([-0.72, 0.15, 0.61], [0.72, 0.15, 0.61], 0.025, TEAL_DARK, tower);

  // Door with dark outline, warm planks and golden handle.
  box([0.38, 0.68, 0.06], INK, [0, 0.43, 0.61]);
  box([0.31, 0.61, 0.07], WOOD, [0, 0.43, 0.65]);
  rod([-0.13, 0.18, 0.692], [0.13, 0.18, 0.692], 0.012, WOOD_DARK);
  rod([-0.13, 0.39, 0.692], [0.13, 0.39, 0.692], 0.012, WOOD_DARK);
  rod([-0.13, 0.6, 0.692], [0.13, 0.6, 0.692], 0.012, WOOD_DARK);
  rod([-0.12, 0.17, 0.704], [0.12, 0.59, 0.704], 0.014, WOOD_DARK);
  part(new THREE.SphereGeometry(0.035, 8, 5), GOLD, [0.105, 0.43, 0.715]);

  // Upper windows: dark frames, blue glass, and cream mullions.
  function window(at: [number, number, number], width: number, height: number) {
    box([width + 0.075, height + 0.075, 0.045], INK, at);
    box([width, height, 0.055], WINDOW, [at[0], at[1], at[2] + 0.025]);
    box([0.025, height, 0.065], CREAM, [at[0], at[1], at[2] + 0.055]);
    box([width, 0.025, 0.065], CREAM, [at[0], at[1], at[2] + 0.055]);
  }
  window([-0.25, 1.52, 0.48], 0.22, 0.29);
  window([0.27, 1.52, 0.48], 0.22, 0.29);
  window([0, 1.98, 0.40], 0.19, 0.22);

  // Tiny flower boxes beneath the upper windows.
  for (const x of [-0.25, 0.27]) {
    box([0.31, 0.07, 0.12], WOOD, [x, 1.31, 0.55]);
    box([0.34, 0.045, 0.14], TEAL_DARK, [x, 1.36, 0.55]);
    for (const dx of [-0.09, 0, 0.09]) {
      rod([x + dx, 1.38, 0.56], [x + dx, 1.49, 0.56], 0.012, "#4b9b55");
      part(new THREE.SphereGeometry(0.035, 7, 5), FLOWER, [x + dx, 1.51, 0.56]);
    }
  }

  // Cap roof: broad teal polygonal bonnet.
  roofPart(
    new THREE.CylinderGeometry(0.62, 0.82, 0.24, 10),
    ROOF_DARK(ROOF),
    [0, 2.3, 0],
  );
  roofPart(
    new THREE.ConeGeometry(0.66, 0.52, 10),
    ROOF,
    [0, 2.67, 0],
  );
  roofPart(
    new THREE.CylinderGeometry(0.69, 0.69, 0.07, 10),
    ROOF_LIGHT,
    [0, 2.43, 0],
  );
  roofPart(
    new THREE.CylinderGeometry(0.18, 0.18, 0.1, 8),
    GOLD,
    [0, 2.96, 0],
  );

  // Decorative roof ribs.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const x = Math.sin(a) * 0.48;
    const z = Math.cos(a) * 0.48;
    rod([x * 0.45, 2.47, z * 0.45], [x, 2.82, z], 0.018, ROOF_LIGHT, roofJoint);
  }

  // Wooden balcony ring around the cap.
  const balcony = b.surface(b.root).loop([0, 2.28, 0], { dir: [0, 1, 0], lift: 0.02 });
  b.sweep(balcony, 0.035, { bone: roofJoint, color: WOOD_DARK, section: { ngon: 6 } });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const x = Math.sin(a) * 0.74;
    const z = Math.cos(a) * 0.74;
    rod([x, 2.28, z], [x, 2.43, z], 0.018, WOOD, roofJoint);
  }

  // Central axle and four bold striped sails on the front.
  const hub: [number, number, number] = [0, 1.77, 0.78];
  cylinder(0.16, 0.18, WOOD_DARK, hub, 10, roofJoint);
  cylinder(0.1, 0.2, GOLD, [0, 1.77, 0.9], 10, roofJoint);

  const sailAngles = [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4];
  for (let i = 0; i < sailAngles.length; i++) {
    const a = sailAngles[i];
    const ux = Math.sin(a);
    const uy = Math.cos(a);
    const end = new THREE.Vector3(ux * 0.95, 1.77 + uy * 0.95, 0.8);
    const start = new THREE.Vector3(ux * 0.12, 1.77 + uy * 0.12, 0.8);
    rod(start, end, 0.065, WOOD_DARK, roofJoint);

    // Alternating cream and teal sail cloth as chunky transverse slats.
    const px = Math.cos(a);
    const py = -Math.sin(a);
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      const cx = ux * (0.16 + t * 0.7);
      const cy = 1.77 + uy * (0.16 + t * 0.7);
      const span = 0.16 - t * 0.055;
      const aa: [number, number, number] = [
        cx - px * span,
        cy - py * span,
        0.83,
      ];
      const bb: [number, number, number] = [
        cx + px * span,
        cy + py * span,
        0.83,
      ];
      rod(aa, bb, 0.035, j % 2 === 0 ? CREAM : TEAL, roofJoint);
    }

    // Gold cap at each sail tip.
    part(new THREE.SphereGeometry(0.055, 7, 5), GOLD, [end.x, end.y, end.z], {
      bone: roofJoint,
    });
  }

  // Small side braces behind the sails.
  rod([-0.48, 1.28, 0.66], [0.48, 2.26, 0.66], 0.025, WOOD_DARK, roofJoint);
  rod([0.48, 1.28, 0.66], [-0.48, 2.26, 0.66], 0.025, WOOD_DARK, roofJoint);

  // Painted heart emblem above the door.
  const heart = b.extrude(
    [
      [0, 0],
      [0.09, 0.1],
      [0.18, 0.16],
      [0.27, 0.1],
      [0.27, 0],
      [0.135, -0.12],
      [0, 0],
    ],
    {
      at: [0, 1.03, 0.68],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.025,
      color: FLOWER,
      bone: tower,
      name: "paintedHeart",
    },
  );

  // A few bright foundation corner stones.
  for (const x of [-0.57, 0.57]) {
    for (let i = 0; i < 3; i++) {
      box([0.18, 0.13, 0.12], i % 2 ? CREAM : BRICK_LIGHT, [x, 0.12 + i * 0.14, 0.59]);
    }
  }

  return b.root;
}

function ROOF_DARK(color: string) {
  return color;
}
```