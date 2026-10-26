import * as THREE from "three";
import { createBuilder, polyline, svg } from "../../../../src/index";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful Animal Crossing-inspired Dutch windmill with a tapered brick tower, thatched cap, gallery, windows, door, ladder, weather vane, and four broad wooden sails.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const TAU = Math.PI * 2;

  const BRICK = "#b96649";
  const BRICK_LIGHT = "#d7825e";
  const BRICK_DARK = "#8e443b";
  const MORTAR = "#704b48";
  const STONE = "#a69a82";
  const STONE_LIGHT = "#c7b995";
  const STONE_DARK = "#766f63";
  const WOOD = "#70462f";
  const WOOD_DARK = "#3e2b2b";
  const WOOD_LIGHT = "#a06d43";
  const ROOF = "#557567";
  const ROOF_LIGHT = "#78917a";
  const ROOF_DARK = "#354f4b";
  const SAIL = "#f0dfb0";
  const SAIL_SHADE = "#d3b978";
  const WINDOW = "#75b8bd";
  const WINDOW_LIGHT = "#b8e3d5";
  const WINDOW_DARK = "#315962";
  const BRASS = "#d4a34e";
  const INK = "#392a2a";
  const SIGN_CREAM = "#f4e2ae";
  const SIGN_RED = "#a94e43";

  const towerBottomY = 0.36;
  const towerTopY = 8.12;

  function circlePoints(radius: number, y: number, count = 16, phase = 0) {
    const points: number[][] = [];
    for (let i = 0; i < count; i++) {
      const a = phase + (i / count) * TAU;
      points.push([Math.sin(a) * radius, y, Math.cos(a) * radius]);
    }
    return points;
  }

  function towerRadius(y: number) {
    const t = Math.min(1, Math.max(0, (y - towerBottomY) / (towerTopY - towerBottomY)));
    return 2.26 + (1.68 - 2.26) * t;
  }

  function roofRadius(y: number) {
    const t = Math.min(1, Math.max(0, (y - 8.15) / 1.88));
    return 2.04 + (0.11 - 2.04) * t;
  }

  function addCylinder(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 12,
    rotation?: [number, number, number],
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      {
        at,
        rotation,
        flat: true,
      },
    );
  }

  function addCone(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    segments = 10,
  ) {
    return b.part(new THREE.ConeGeometry(radius, height, segments), color, {
      at,
      flat: true,
    });
  }

  function addSphere(
    radius: number,
    at: [number, number, number],
    color: string,
    widthSegments = 10,
    heightSegments = 6,
  ) {
    return b.part(
      new THREE.SphereGeometry(radius, widthSegments, heightSegments),
      color,
      {
        at,
        flat: true,
      },
    );
  }

  function addBox(
    width: number,
    height: number,
    depth: number,
    at: [number, number, number],
    color: string,
    rotation?: [number, number, number],
  ) {
    return b.part(new THREE.BoxGeometry(width, height, depth), color, {
      at,
      rotation,
      flat: true,
    });
  }

  function addBeam(
    a: [number, number, number] | THREE.Vector3,
    c: [number, number, number] | THREE.Vector3,
    radius: number,
    color: string,
  ) {
    return b.rod(a, c, radius, { color, section: { ngon: 6 } });
  }

  function addRing(
    radius: number,
    y: number,
    tube: number,
    color: string,
    count = 16,
    phase = 0,
  ) {
    return b.sweep(polyline(circlePoints(radius, y, count, phase), { closed: true }), tube, {
      color,
      sides: 6,
      caps: "none",
    });
  }

  function addTorus(
    major: number,
    minor: number,
    at: [number, number, number],
    color: string,
    rotation: [number, number, number],
    radial = 12,
    tubular = 6,
  ) {
    return b.part(
      new THREE.TorusGeometry(major, minor, tubular, radial),
      color,
      {
        at,
        rotation,
        flat: true,
      },
    );
  }

  function bladePoint(theta: number, across: number, along: number, z: number) {
    const xAxis = new THREE.Vector3(Math.cos(theta), -Math.sin(theta), 0);
    const yAxis = new THREE.Vector3(Math.sin(theta), Math.cos(theta), 0);
    return new THREE.Vector3(0, 8.56, z)
      .addScaledVector(xAxis, across)
      .addScaledVector(yAxis, along);
  }

  // -----------------------------------------------------------------------------------------------
  // Stone foundation and chunky footings

  addCylinder(2.5, 0.22, [0, 0.11, 0], STONE_DARK, 12);
  addCylinder(2.36, 0.34, [0, 0.36, 0], STONE, 12);
  addRing(2.38, 0.54, 0.075, STONE_LIGHT, 12);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const r = 2.34;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    const tangentWidth = 1.12;
    addBox(
      tangentWidth,
      0.38,
      0.43,
      [x, 0.31, z],
      i % 3 === 0 ? STONE_LIGHT : i % 3 === 1 ? STONE : STONE_DARK,
      [0, a, 0],
    );
  }

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + Math.PI / 8;
    const r = 2.12;
    addBox(
      0.86,
      0.26,
      0.24,
      [Math.sin(a) * r, 0.59, Math.cos(a) * r],
      i % 2 === 0 ? STONE_LIGHT : STONE,
      [0, a, 0],
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Main tapered brick tower

  const tower = b.lathe(
    [
      [0, 0],
      [2.26, 0],
      [2.26, 0.22],
      [2.18, 0.42],
      [2.10, 1.4],
      [2.02, 3.0],
      [1.90, 5.2],
      [1.77, 7.35],
      [1.69, 7.76],
      [0, 7.76],
    ],
    {
      at: [0, towerBottomY, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: BRICK,
      name: "brickTower",
    },
  );

  addRing(2.27, 0.76, 0.027, MORTAR, 16);
  addRing(2.20, 1.62, 0.026, MORTAR, 16);
  addRing(2.13, 2.48, 0.026, MORTAR, 16);
  addRing(2.06, 3.34, 0.026, MORTAR, 16);
  addRing(1.99, 4.20, 0.026, MORTAR, 16);
  addRing(1.92, 5.06, 0.026, MORTAR, 16);
  addRing(1.85, 5.92, 0.026, MORTAR, 16);
  addRing(1.78, 6.78, 0.026, MORTAR, 16);
  addRing(1.71, 7.48, 0.029, MORTAR, 16);

  const brickRows = 10;
  const brickColumns = 12;

  for (let row = 0; row < brickRows; row++) {
    const y = 0.83 + row * 0.67;
    const radius = towerRadius(y) + 0.035;
    const offset = row % 2 === 0 ? 0 : Math.PI / brickColumns;
    const rowHeight = 0.52;
    const brickWidth = (TAU * radius / brickColumns) * 0.83;

    for (let col = 0; col < brickColumns; col++) {
      const a = offset + (col / brickColumns) * TAU;
      const x = Math.sin(a) * radius;
      const z = Math.cos(a) * radius;
      const color =
        (row + col) % 5 === 0
          ? BRICK_LIGHT
          : (row * 3 + col) % 7 === 0
            ? BRICK_DARK
            : BRICK;

      addBox(
        brickWidth,
        rowHeight,
        0.105,
        [x, y, z],
        color,
        [0, a, 0],
      );
    }
  }

  // Quoin blocks make the base feel hand-built and slightly storybook-like.
  for (let side = 0; side < 4; side++) {
    const a = side * Math.PI / 2;
    for (let row = 0; row < 5; row++) {
      const y = 0.78 + row * 0.56;
      const r = towerRadius(y) + 0.065;
      const x = Math.sin(a) * r;
      const z = Math.cos(a) * r;
      addBox(
        0.48,
        0.43,
        0.18,
        [x, y, z],
        row % 2 === 0 ? STONE_LIGHT : STONE,
        [0, a, 0],
      );
      const a2 = a + Math.PI / 2;
      const x2 = Math.sin(a2) * r;
      const z2 = Math.cos(a2) * r;
      addBox(
        0.48,
        0.43,
        0.18,
        [x2, y + 0.12, z2],
        row % 2 === 0 ? STONE : STONE_LIGHT,
        [0, a2, 0],
      );
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Surface-based windows

  const towerSurface = b.surface(tower);

  function makeWindow(
    hit: any,
    width: number,
    height: number,
    xDirection: THREE.Vector3,
  ) {
    const yDirection = new THREE.Vector3(0, 1, 0);
    const outer: [number, number][] = [
      [-width * 0.5, -height * 0.5],
      [width * 0.5, -height * 0.5],
      [width * 0.5, height * 0.12],
      [width * 0.43, height * 0.29],
      [width * 0.27, height * 0.46],
      [0, height * 0.58],
      [-width * 0.27, height * 0.46],
      [-width * 0.43, height * 0.29],
      [-width * 0.5, height * 0.12],
    ];

    const inner: [number, number][] = outer.map(([x, y]) => [
      x * 0.76,
      y * 0.76,
    ]);

    b.extrude(outer, {
      at: hit.at,
      x: xDirection,
      y: yDirection,
      thickness: 0.095,
      bevel: 0.012,
      color: WOOD_DARK,
      name: "windowFrame",
    });

    const face = hit.moved([0, 0.058, 0]);

    b.extrude(inner, {
      at: face.at,
      x: xDirection,
      y: yDirection,
      thickness: 0.028,
      bevel: 0.004,
      color: WINDOW,
      name: "windowGlass",
    });

    const center = face.at.clone();
    const halfW = width * 0.29;
    const halfH = height * 0.25;
    const h1 = center.clone().addScaledVector(xDirection, -halfW);
    const h2 = center.clone().addScaledVector(xDirection, halfW);
    h1.y += 0.02;
    h2.y += 0.02;
    addBeam(h1, h2, 0.022, WOOD_LIGHT);

    const v1 = center.clone().addScaledVector(yDirection, -halfH);
    const v2 = center.clone().addScaledVector(yDirection, halfH);
    v1.addScaledVector(xDirection, 0);
    v2.addScaledVector(xDirection, 0);
    addBeam(v1, v2, 0.022, WOOD_LIGHT);

    addSphere(
      0.035,
      center.clone().addScaledVector(hit.n, 0.08) as unknown as [number, number, number],
      WINDOW_LIGHT,
      6,
      4,
    );
  }

  const frontWindowYs = [3.35, 5.05, 6.55];
  for (const y of frontWindowYs) {
    const hit = towerSurface.nearest([0, y, 2.4]);
    makeWindow(hit, y > 6 ? 0.63 : 0.72, y > 6 ? 0.9 : 1.03, new THREE.Vector3(1, 0, 0));
  }

  const leftWindowYs = [2.7, 4.55, 6.25];
  for (const y of leftWindowYs) {
    const hit = towerSurface.nearest([2.4, y, 0]);
    makeWindow(hit, 0.62, 0.88, new THREE.Vector3(0, 0, -1));
  }

  const rearWindow = towerSurface.nearest([0, 5.85, -2.3]);
  makeWindow(rearWindow, 0.58, 0.82, new THREE.Vector3(-1, 0, 0));

  // Small circular attic windows.
  for (const a of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    const p = new THREE.Vector3(
      Math.sin(a) * 1.9,
      7.15,
      Math.cos(a) * 1.9,
    );
    const n = new THREE.Vector3(Math.sin(a), 0, Math.cos(a));
    b.part(new THREE.CircleGeometry(0.27, 10), WINDOW_DARK, {
      at: p.clone().addScaledVector(n, 0.035),
      dir: n,
      axis: "z",
      flat: true,
      name: "atticOculus",
    });
    b.part(CircleGeometrySafe(0.19, WINDOW_LIGHT), WINDOW_LIGHT, {
      at: p.clone().addScaledVector(n, 0.052),
      dir: n,
      axis: "z",
      flat: true,
      name: "atticOculusGlass",
    });
  }

  // -----------------------------------------------------------------------------------------------
  // Main door, frame, planks, handle, and sign

  const doorOuter: [number, number][] = [
    [-0.72, -0.98],
    [0.72, -0.98],
    [0.72, 0.30],
    [0.62, 0.58],
    [0.43, 0.83],
    [0.19, 1.02],
    [0, 1.08],
    [-0.19, 1.02],
    [-0.43, 0.83],
    [-0.62, 0.58],
    [-0.72, 0.30],
  ];

  const doorInner: [number, number][] = doorOuter.map(([x, y]) => [
    x * 0.83,
    y * 0.86,
  ]);

  b.extrude(doorOuter, {
    at: [0, 1.18, 2.17],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.13,
    bevel: 0.025,
    color: WOOD_DARK,
    name: "doorStoneFrame",
  });

  b.extrude(doorInner, {
    at: [0, 1.18, 2.255],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.065,
    bevel: 0.012,
    color: WOOD,
    name: "frontDoor",
  });

  for (const x of [-0.47, -0.16, 0.16, 0.47]) {
    addBeam([x, 0.32, 2.30], [x, 2.00, 2.30], 0.024, WOOD_LIGHT);
  }

  addBeam([-0.62, 0.32, 2.35], [0.62, 0.32, 2.35], 0.035, WOOD_DARK);
  addBeam([-0.56, 2.05, 2.35], [0.56, 2.05, 2.35], 0.035, WOOD_LIGHT);

  addCylinder(
    0.075,
    0.045,
    [0.42, 1.13, 2.36],
    BRASS,
    8,
    [Math.PI / 2, 0, 0],
  );
  addSphere(0.065, [0.42, 1.13, 2.405], BRASS, 8, 5);

  const signBack = addBox(1.46, 0.48, 0.12, [0, 2.56, 2.05], WOOD_DARK);
  addBox(1.30, 0.34, 0.035, [0, 2.56, 2.125], SIGN_CREAM);

  const signTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 68">
      <rect width="260" height="68" fill="#f4e2ae"/>
      <rect x="3" y="3" width="254" height="62" rx="9" fill="none" stroke="#7d4b3d" stroke-width="6"/>
      <path d="M25 50V25M14 36h22M25 25l-9-10M25 25l10-10M25 36l-10 14M25 36l11 14" stroke="#a94e43" stroke-width="5" stroke-linecap="round"/>
      <circle cx="25" cy="36" r="5" fill="#d4a34e"/>
      <text x="53" y="46" font-family="Trebuchet MS, sans-serif" font-size="31" font-weight="bold" fill="#70462f">MILL</text>
    </svg>`,
    { size: 256 },
  );

  b.part(new THREE.PlaneGeometry(1.24, 0.324), "#ffffff", {
    at: [0, 2.56, 2.151],
    dir: [0, 0, 1],
    axis: "z",
    texture: signTexture,
    name: "millSign",
  });

  // -----------------------------------------------------------------------------------------------
  // Side ladder and service braces

  const ladderX = 1.83;
  const ladderZ = 0.60;
  addBeam([ladderX, 2.0, ladderZ], [ladderX, 7.25, ladderZ], 0.055, WOOD_DARK);
  addBeam([ladderX + 0.48, 2.0, ladderZ - 0.10], [ladderX + 0.48, 7.25, ladderZ - 0.10], 0.055, WOOD_DARK);

  for (let i = 0; i < 10; i++) {
    const y = 2.18 + i * 0.50;
    addBeam(
      [ladderX - 0.03, y, ladderZ],
      [ladderX + 0.51, y, ladderZ - 0.10],
      0.038,
      WOOD_LIGHT,
    );
  }

  addBeam([1.54, 2.0, 0.53], [1.88, 2.18, 0.55], 0.045, WOOD_DARK);
  addBeam([1.53, 7.13, 0.55], [1.87, 7.28, 0.58], 0.045, WOOD_DARK);

  // -----------------------------------------------------------------------------------------------
  // Gallery balcony beneath the cap

  addCylinder(2.03, 0.16, [0, 7.82, 0], WOOD_DARK, 12);
  addCylinder(1.92, 0.11, [0, 7.93, 0], WOOD_LIGHT, 12);
  addRing(2.07, 7.92, 0.045, WOOD_DARK, 16);

  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU + Math.PI / 16;
    const r = 1.89;
    const x = Math.sin(a) * r;
    const z = Math.cos(a) * r;
    addBeam([x, 7.95, z], [x, 8.58, z], 0.038, WOOD);
    addSphere(0.065, [x, 8.59, z], WOOD_LIGHT, 7, 4);
  }

  addRing(1.91, 8.22, 0.035, WOOD_DARK, 16);
  addRing(1.91, 8.57, 0.055, WOOD_LIGHT, 16);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    const outer = new THREE.Vector3(Math.sin(a) * 1.92, 7.79, Math.cos(a) * 1.92);
    const inner = new THREE.Vector3(Math.sin(a) * 1.42, 7.43, Math.cos(a) * 1.42);
    addBeam(outer, inner, 0.055, WOOD_DARK);
  }

  // Gallery flower-box-like brackets add the friendly toy-town silhouette.
  for (const a of [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]) {
    const x = Math.sin(a) * 2.05;
    const z = Math.cos(a) * 2.05;
    addBox(0.46, 0.14, 0.18, [x, 7.75, z], WOOD_LIGHT, [0, a, 0]);
    addBeam(
      [x, 7.70, z],
      [x * 0.86, 7.38, z * 0.86],
      0.042,
      WOOD_DARK,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Conical cap and roof trim

  const roof = b.lathe(
    [
      [0, 0],
      [2.05, 0],
      [2.09, 0.10],
      [1.96, 0.22],
      [1.78, 0.46],
      [1.55, 0.77],
      [1.30, 1.07],
      [1.01, 1.36],
      [0.68, 1.62],
      [0.34, 1.83],
      [0, 1.94],
    ],
    {
      at: [0, 8.10, 0],
      axis: [0, 1, 0],
      segments: 12,
      color: ROOF,
      name: "thatchCap",
    },
  );

  addRing(2.09, 8.20, 0.065, ROOF_DARK, 16);
  addRing(1.91, 8.47, 0.035, ROOF_LIGHT, 16);
  addRing(1.70, 8.76, 0.035, ROOF_DARK, 16);
  addRing(1.44, 9.05, 0.032, ROOF_LIGHT, 16);
  addRing(1.18, 9.34, 0.030, ROOF_DARK, 16);
  addRing(0.89, 9.61, 0.028, ROOF_LIGHT, 16);
  addRing(0.57, 9.83, 0.025, ROOF_DARK, 12);

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const base = new THREE.Vector3(
      Math.sin(a) * 2.0,
      8.18,
      Math.cos(a) * 2.0,
    );
    const tip = new THREE.Vector3(
      Math.sin(a) * 0.20,
      9.98,
      Math.cos(a) * 0.20,
    );
    addBeam(base, tip, 0.038, i % 3 === 0 ? ROOF_DARK : ROOF_LIGHT);
  }

  addCylinder(0.27, 0.30, [0, 10.12, 0], WOOD_DARK, 10);
  addCylinder(0.20, 0.26, [0, 10.38, 0], BRASS, 10);
  addSphere(0.23, [0, 10.56, 0], WOOD_LIGHT, 9, 5);
  addBeam([0, 10.58, 0], [0, 11.12, 0], 0.035, WOOD_DARK);

  // Weather-vane arrow, in a thin horizontal slab.
  b.extrude(
    [
      [-0.92, 0],
      [0.44, 0],
      [0.44, -0.13],
      [0.83, -0.13],
      [0.35, -0.36],
      [0.44, -0.13],
      [-0.92, -0.13],
      [-0.92, 0],
    ],
    {
      at: [0, 11.03, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.055,
      bevel: 0.008,
      color: BRASS,
      name: "weatherVaneArrow",
    },
  );

  b.extrude(
    [
      [-0.82, -0.05],
      [-0.52, 0.28],
      [-0.20, -0.05],
      [-0.52, -0.35],
    ],
    {
      at: [0, 11.03, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.058,
      bevel: 0.008,
      color: WOOD_LIGHT,
      name: "weatherVaneTail",
    },
  );

  // -----------------------------------------------------------------------------------------------
  // Rear tail pole and rudder

  addBeam([0, 8.65, -1.15], [0, 8.72, -3.05], 0.105, WOOD_DARK);
  addBeam([0, 8.60, -1.20], [0, 8.67, -3.02], 0.045, WOOD_LIGHT);

  b.extrude(
    [
      [-0.78, 0],
      [0.66, 0],
      [0.46, 0.38],
      [0.12, 0.77],
      [-0.38, 0.56],
      [-0.78, 0.25],
    ],
    {
      at: [0, 8.42, -2.94],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.12,
      bevel: 0.018,
      color: WOOD,
      name: "rearRudder",
    },
  );

  addBeam([-0.62, 8.47, -3.02], [0.51, 8.47, -3.02], 0.034, WOOD_LIGHT);
  addBeam([0, 8.25, -3.02], [0, 8.85, -3.02], 0.034, WOOD_LIGHT);

  // -----------------------------------------------------------------------------------------------
  // Four broad sails

  const bladeWood: [number, number][] = [
    [-0.36, 0.10],
    [0.36, 0.10],
    [0.32, 0.72],
    [0.27, 1.55],
    [0.22, 2.42],
    [0.15, 3.55],
    [-0.16, 3.55],
    [-0.23, 2.42],
    [-0.29, 1.55],
    [-0.34, 0.72],
  ];

  const bladeCanvas: [number, number][] = [
    [-0.21, 0.34],
    [0.22, 0.34],
    [0.20, 0.76],
    [0.16, 1.52],
    [0.13, 2.35],
    [0.08, 3.19],
    [-0.09, 3.19],
    [-0.14, 2.35],
    [-0.18, 1.52],
    [-0.21, 0.76],
  ];

  for (let i = 0; i < 4; i++) {
    const theta = (i / 4) * TAU;
    const xAxis: [number, number, number] = [
      Math.cos(theta),
      -Math.sin(theta),
      0,
    ];
    const yAxis: [number, number, number] = [
      Math.sin(theta),
      Math.cos(theta),
      0,
    ];

    b.extrude(bladeWood, {
      at: [0, 8.56, 2.16],
      x: xAxis,
      y: yAxis,
      thickness: 0.16,
      bevel: 0.018,
      color: WOOD_DARK,
      name: `sailWood${i}`,
    });

    const canvasAt = new THREE.Vector3(0, 8.56, 2.285)
      .add(new THREE.Vector3(xAxis[0], xAxis[1], xAxis[2]).multiplyScalar(0))
      .add(new THREE.Vector3(0, 0, 0));

    b.extrude(bladeCanvas, {
      at: canvasAt,
      x: xAxis,
      y: yAxis,
      thickness: 0.045,
      bevel: 0.008,
      color: i % 2 === 0 ? SAIL : SAIL_SHADE,
      name: `canvasSail${i}`,
    });

    const leftBase = bladePoint(theta, -0.27, 0.18, 2.34);
    const leftTip = bladePoint(theta, -0.14, 3.48, 2.34);
    const rightBase = bladePoint(theta, 0.27, 0.18, 2.34);
    const rightTip = bladePoint(theta, 0.14, 3.48, 2.34);

    addBeam(leftBase, leftTip, 0.045, WOOD_LIGHT);
    addBeam(rightBase, rightTip, 0.045, WOOD_LIGHT);

    for (const along of [0.70, 1.48, 2.30, 3.08]) {
      const across = 0.25 - along * 0.031;
      const a = bladePoint(theta, -across, along, 2.38);
      const c = bladePoint(theta, across, along, 2.38);
      addBeam(a, c, 0.034, WOOD);
    }

    const diagonalA = bladePoint(theta, -0.19, 0.30, 2.39);
    const diagonalB = bladePoint(theta, 0.15, 2.96, 2.39);
    addBeam(diagonalA, diagonalB, 0.025, WOOD_LIGHT);
  }

  // Sail hub and layered cap.
  addCylinder(
    0.54,
    0.52,
    [0, 8.56, 2.32],
    WOOD_DARK,
    12,
    [Math.PI / 2, 0, 0],
  );
  addCylinder(
    0.42,
    0.58,
    [0, 8.56, 2.62],
    WOOD,
    12,
    [Math.PI / 2, 0, 0],
  );
  addTorus(0.39, 0.055, [0, 8.56, 2.93], BRASS, [0, 0, 0], 12, 6);
  addCylinder(
    0.20,
    0.16,
    [0, 8.56, 3.00],
    BRASS,
    10,
    [Math.PI / 2, 0, 0],
  );
  addSphere(0.16, [0, 8.56, 3.10], STONE_LIGHT, 9, 5);

  // Decorative small bolts around the hub.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    addSphere(
      0.045,
      [
        Math.cos(a) * 0.32,
        8.56 + Math.sin(a) * 0.32,
        3.105,
      ],
      BRASS,
      6,
      4,
    );
  }

  // -----------------------------------------------------------------------------------------------
  // Friendly painted trim and a few final masonry accents

  addRing(2.27, 0.67, 0.032, WOOD_DARK, 16);
  addRing(1.70, 7.63, 0.045, WOOD_LIGHT, 16);

  for (const y of [1.02, 2.18, 3.46, 4.82, 6.12]) {
    const side = y % 2 < 1 ? 1 : -1;
    const r = towerRadius(y) + 0.08;
    addBox(
      0.10,
      0.31,
      0.08,
      [side * r, y, 0.42],
      STONE_LIGHT,
      [0, Math.PI / 2, 0],
    );
    addBox(
      0.10,
      0.31,
      0.08,
      [-side * r, y + 0.12, -0.42],
      STONE,
      [0, Math.PI / 2, 0],
    );
  }

  // A little pair of flower-like colored shutters beside the front door.
  for (const s of [-1, 1]) {
    addBox(0.22, 0.54, 0.075, [s * 0.93, 2.02, 2.13], ROOF_LIGHT, [0, 0, 0]);
    addBeam(
      [s * 0.93, 1.80, 2.185],
      [s * 0.93, 2.24, 2.185],
      0.018,
      WOOD_DARK,
    );
  }

  return b.root;
}

// A tiny local helper keeps the circular attic glass construction readable.
function CircleGeometrySafe(radius: number, color: string) {
  return new THREE.CircleGeometry(radius, 10);
}
