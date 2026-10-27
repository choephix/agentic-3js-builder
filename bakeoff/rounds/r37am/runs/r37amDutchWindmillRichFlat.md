```ts
import * as THREE from "three";
import { createBuilder, polyline } from "agentic-3js-builder";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful low-poly Dutch windmill with a tapered brick tower, cap roof, balcony, windows, door, weather vane, and four layered cream sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 0.8 });

  const BRICK = "#c97858";
  const BRICK_LIGHT = "#e39a70";
  const BRICK_DARK = "#9c4d43";
  const MORTAR = "#f3c79c";
  const ROOF = "#355c55";
  const ROOF_DARK = "#233f3d";
  const WOOD = "#70452f";
  const WOOD_DARK = "#4b2d28";
  const CREAM = "#fff0bd";
  const CREAM_LIGHT = "#fff8d7";
  const WINDOW = "#273d4d";
  const GLASS = "#78b7bc";
  const GOLD = "#e4b04e";
  const FLOWER = "#e87872";

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      name,
      group: "architecture",
    });

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    name: string,
    radial = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      dir,
      name,
      group: "architecture",
    });

  const torus = (
    major: number,
    minor: number,
    color: string,
    at: [number, number, number],
    name: string,
    rotation?: [number, number, number],
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 16), color, {
      at,
      rotation,
      name,
      group: "architecture",
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name, group: "architecture" });

  const ringPoints = (
    y: number,
    radius: number,
    count: number,
    zCenter = 0,
    phase = 0,
  ): [number, number, number][] => {
    const points: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      const a = phase + (i / count) * Math.PI * 2;
      points.push([Math.sin(a) * radius, y, zCenter + Math.cos(a) * radius]);
    }
    return points;
  };

  const polygonExtrude = (
    points: [number, number][],
    depth: number,
    color: string,
    at: [number, number, number],
    angle: number,
    name: string,
  ) => {
    const shape = new THREE.Shape();
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
    shape.closePath();

    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: false,
      steps: 1,
      curveSegments: 1,
    });
    geometry.translate(0, 0, -depth / 2);

    const quat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle,
    );

    return b.part(geometry, color, {
      at,
      quat,
      name,
      group: "architecture",
    });
  };

  // Main tapered octagonal brick tower.
  b.lathe(
    [
      [0, 0],
      [0.56, 0],
      [0.61, 0.055],
      [0.59, 0.28],
      [0.52, 0.82],
      [0.45, 1.27],
      [0, 1.27],
    ],
    {
      at: [0, 0.025, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: BRICK,
      name: "taperedBrickTower",
      group: "tower",
    },
  );

  // Warm masonry courses. They intentionally sit proud like chunky painted trim.
  for (const y of [0.23, 0.48, 0.73, 0.98, 1.19]) {
    const radius = y < 0.35 ? 0.605 : y < 0.7 ? 0.57 : y < 1 ? 0.51 : 0.46;
    b.lathe(
      [
        [radius - 0.012, 0],
        [radius + 0.012, 0],
        [radius + 0.012, 0.025],
        [radius - 0.012, 0.025],
      ],
      {
        at: [0, y, 0],
        axis: [0, 1, 0],
        segments: 10,
        color: MORTAR,
        name: `mortarCourse${y}`,
        group: "masonry",
      },
    );
  }

  // Front-facing brick blocks, kept sparse and oversized for the toy-like style.
  const brickRows = [
    { y: 0.61, z: 0.562, width: 0.84 },
    { y: 0.69, z: 0.548, width: 0.82 },
    { y: 0.79, z: 0.523, width: 0.76 },
    { y: 0.89, z: 0.504, width: 0.72 },
    { y: 1.02, z: 0.482, width: 0.66 },
    { y: 1.12, z: 0.466, width: 0.59 },
  ];

  brickRows.forEach((row, r) => {
    const count = r < 2 ? 6 : 5;
    const gap = 0.018;
    const width = (row.width - gap * (count - 1)) / count;
    for (let i = 0; i < count; i++) {
      const x = -row.width / 2 + width / 2 + i * (width + gap);
      const stagger = r % 2 === 0 ? 0 : width * 0.48;
      const xx = x + stagger;
      if (Math.abs(xx) < 0.23 && row.y < 0.82) continue;
      box(
        [Math.min(width * 0.92, 0.15), 0.052, 0.018],
        (i + r) % 3 === 0 ? BRICK_LIGHT : BRICK_DARK,
        [xx, row.y, row.z + 0.006],
        `frontBrick${r}_${i}`,
      );
    }
  });

  // Small dark corner blocks suggest hand-laid masonry without making the tower noisy.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const y = 0.32 + i * 0.19;
      const radius = 0.58 - i * 0.035;
      box(
        [0.07, 0.13, 0.045],
        BRICK_DARK,
        [s * radius * 0.62, y, radius * 0.62],
        `cornerStone${s}_${i}`,
        [0, s * 0.12, 0],
      );
    }
  }

  // Tall arched-looking front door: rectangular lower body plus round lintel.
  box([0.225, 0.30, 0.035], WOOD_DARK, [0, 0.185, 0.59], "frontDoor");
  box([0.185, 0.255, 0.012], WOOD, [0, 0.19, 0.612], "frontDoorPanel");
  box([0.018, 0.255, 0.016], WOOD_DARK, [-0.055, 0.19, 0.622], "doorPlankL");
  box([0.018, 0.255, 0.016], WOOD_DARK, [0.055, 0.19, 0.622], "doorPlankR");
  cylinder(0.115, 0.036, WOOD_DARK, [0, 0.345, 0.59], "doorArch", 12, [0, 0, 1]);
  cylinder(0.083, 0.018, WOOD, [0, 0.348, 0.615], "doorArchInset", 12, [0, 0, 1]);

  // Door hardware.
  cylinder(0.018, 0.012, GOLD, [0.065, 0.205, 0.638], "doorHandle", 8, [0, 0, 1]);
  box([0.24, 0.025, 0.026], CREAM_LIGHT, [0, 0.035, 0.615], "doorSill");

  // Upper round window with chunky cream frame and blue glass.
  cylinder(0.105, 0.022, WINDOW, [0, 0.94, 0.495], "upperWindowDark", 12, [0, 0, 1]);
  cylinder(0.076, 0.026, GLASS, [0, 0.94, 0.511], "upperWindowGlass", 12, [0, 0, 1]);
  torus(0.092, 0.018, CREAM_LIGHT, [0, 0.94, 0.53], "upperWindowFrame");
  rod([-0.067, 0.94, 0.538], [0.067, 0.94, 0.538], 0.009, CREAM, "windowCrossHorizontal");
  rod([0, 0.873, 0.538], [0, 1.007, 0.538], 0.009, CREAM, "windowCrossVertical");

  // Two tiny side windows make the tower readable in three-quarter views.
  for (const s of [-1, 1]) {
    cylinder(
      0.065,
      0.022,
      WINDOW,
      [s * 0.49, 0.76, 0.05],
      `sideWindowDark${s}`,
      10,
      [s, 0, 0],
    );
    cylinder(
      0.043,
      0.026,
      GLASS,
      [s * 0.505, 0.76, 0.05],
      `sideWindowGlass${s}`,
      10,
      [s, 0, 0],
    );
    torus(
      0.055,
      0.012,
      CREAM_LIGHT,
      [s * 0.52, 0.76, 0.05],
      `sideWindowFrame${s}`,
      [0, Math.PI / 2, 0],
    );
  }

  // Balcony deck just below the cap.
  cylinder(0.515, 0.045, WOOD_DARK, [0, 1.275, 0], "balconyDeck", 12);
  cylinder(0.48, 0.027, WOOD, [0, 1.302, 0], "balconyDeckTop", 12);

  const balconyRail = ringPoints(1.415, 0.505, 18);
  b.sweep(polyline(balconyRail, { closed: true }), 0.018, {
    color: WOOD_DARK,
    caps: "none",
    name: "balconyUpperRail",
    group: "balcony",
  });

  for (let i = 0; i < balconyRail.length; i += 2) {
    const p = balconyRail[i];
    rod([p[0], 1.298, p[2]], [p[0], 1.415, p[2]], 0.014, WOOD, `balconyPost${i}`);
  }

  // A little cream trim under the balcony.
  b.sweep(polyline(ringPoints(1.255, 0.49, 16), { closed: true }), 0.014, {
    color: CREAM,
    caps: "none",
    name: "balconyTrim",
    group: "balcony",
  });

  // Broad faceted cap and steep green roof.
  b.lathe(
    [
      [0, 0],
      [0.52, 0],
      [0.52, 0.055],
      [0.43, 0.105],
      [0.28, 0.27],
      [0.12, 0.36],
      [0, 0.39],
    ],
    {
      at: [0, 1.305, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: ROOF,
      name: "greenCapRoof",
      group: "roof",
    },
  );

  // Roof bands and a bright cap highlight.
  b.lathe(
    [
      [0.47, 0],
      [0.52, 0],
      [0.52, 0.035],
      [0.47, 0.035],
    ],
    {
      at: [0, 1.305, 0],
      axis: [0, 1, 0],
      segments: 10,
      color: ROOF_DARK,
      name: "roofEaveBand",
      group: "roof",
    },
  );
  cylinder(0.09, 0.028, GOLD, [0, 1.695, 0], "roofTopCap", 8);

  // Weather-vane pole and arrow.
  rod([0, 1.70, 0], [0, 1.91, 0], 0.012, WOOD_DARK, "weatherVanePole");
  polygonExtrude(
    [
      [-0.22, 0.0],
      [0.12, 0.0],
      [0.12, 0.035],
      [0.24, 0.0],
      [0.12, -0.055],
      [0.12, -0.018],
      [-0.22, -0.018],
    ],
    0.018,
    GOLD,
    [0, 1.91, 0],
    0,
    "weatherVaneArrow",
  );
  cylinder(0.026, 0.04, GOLD, [0, 1.91, 0], "weatherVanePivot", 8);

  // Axle block, projecting clearly from the front of the cap.
  cylinder(0.085, 0.19, WOOD_DARK, [0, 1.45, 0.43], "sailAxle", 10, [0, 0, 1]);
  cylinder(0.12, 0.055, GOLD, [0, 1.45, 0.555], "sailHubBack", 10, [0, 0, 1]);

  const axle: [number, number, number] = [0, 1.45, 0.60];

  // Four broad Dutch sails. Each has a dark silhouette, cream face, spine, and two cross slats.
  const sailOutline: [number, number][] = [
    [-0.065, 0.035],
    [0.065, 0.035],
    [0.105, 0.29],
    [0.16, 0.67],
    [-0.16, 0.67],
    [-0.105, 0.29],
  ];
  const sailFace: [number, number][] = [
    [-0.042, 0.055],
    [0.042, 0.055],
    [0.08, 0.30],
    [0.128, 0.64],
    [-0.128, 0.64],
    [-0.08, 0.30],
  ];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;

    polygonExtrude(
      sailOutline,
      0.032,
      WOOD_DARK,
      axle,
      angle,
      `sailShadow${i}`,
    );
    polygonExtrude(
      sailFace,
      0.024,
      i % 2 === 0 ? CREAM_LIGHT : CREAM,
      [0, 1.45, 0.615],
      angle,
      `sailCanvas${i}`,
    );

    const radial = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0);
    const side = new THREE.Vector3(Math.cos(angle), -Math.sin(angle), 0);

    const p0 = new THREE.Vector3(axle[0], axle[1], 0.648);
    const p1 = p0.clone().addScaledVector(radial, 0.62);
    rod(
      [p0.x, p0.y, p0.z],
      [p1.x, p1.y, p1.z],
      0.018,
      WOOD_DARK,
      `sailSpine${i}`,
    );

    for (const distance of [0.29, 0.47]) {
      const center = p0.clone().addScaledVector(radial, distance);
      const half = distance < 0.35 ? 0.085 : 0.12;
      const left = center.clone().addScaledVector(side, -half);
      const right = center.clone().addScaledVector(side, half);
      rod(
        [left.x, left.y, left.z],
        [right.x, right.y, right.z],
        0.012,
        WOOD,
        `sailCrossbar${i}_${distance}`,
      );
    }
  }

  // The front hub hides sail joins and adds the bright toy-like focal point.
  cylinder(0.13, 0.065, WOOD_DARK, [0, 1.45, 0.665], "frontHubDark", 12, [0, 0, 1]);
  cylinder(0.095, 0.078, GOLD, [0, 1.45, 0.704], "frontHubGold", 12, [0, 0, 1]);
  cylinder(0.038, 0.09, WOOD_DARK, [0, 1.45, 0.758], "frontHubPeg", 10, [0, 0, 1]);

  // Small flower boxes under the side windows, a friendly Animal Crossing accent.
  for (const s of [-1, 1]) {
    box([0.19, 0.075, 0.10], WOOD, [s * 0.52, 0.65, 0.19], `flowerBox${s}`);
    for (let i = 0; i < 3; i++) {
      const x = s * (0.47 + i * 0.05);
      cylinder(0.025, 0.04, FLOWER, [x, 0.735, 0.19], `flower${s}_${i}`, 6);
      cylinder(0.012, 0.08, "#5d8846", [x, 0.69, 0.19], `stem${s}_${i}`, 5);
    }
  }

  // Friendly little foundation stones, sunk slightly into the floor.
  for (const p of [
    [-0.45, 0.035, 0.37],
    [-0.25, 0.035, 0.49],
    [0.25, 0.035, 0.49],
    [0.45, 0.035, 0.37],
    [-0.43, 0.035, -0.31],
    [0.43, 0.035, -0.31],
  ] as [number, number, number][]) {
    cylinder(0.09, 0.07, MORTAR, p, `foundationStone${p[0]}_${p[2]}`, 7);
  }

  return b.root;
}
```