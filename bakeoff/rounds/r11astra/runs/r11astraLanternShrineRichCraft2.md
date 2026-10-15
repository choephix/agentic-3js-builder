```ts
import * as THREE from "three";
import {
  createBuilder,
  frame,
  rng,
  svg,
  paint,
  grain,
  mottle,
  mix,
  noise,
  catmull,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Shrine of the Violet Fox",
  description:
    "An Inazuma-inspired roadside sanctuary: vermilion torii, luminous paper and stone lanterns, a miniature fox shrine, sacred rope, offerings and a mossy stone approach.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "VioletFoxShrine", paintSize: 2048 });
  const random = rng(418);
  const root = b.joint("shrineRoot", { at: [0, 0, 0] });

  type Finish = string | ReturnType<typeof paint>;
  const C = {
    ink: "#272438",
    blue: "#343650",
    roof: "#424b70",
    roofLight: "#657394",
    red: "#ba423d",
    redLight: "#e66551",
    redDark: "#742e38",
    gold: "#d8b568",
    goldLight: "#ffdfa0",
    wood: "#765044",
    woodDark: "#493439",
    ivory: "#fff1ce",
    white: "#f6eddf",
    purple: "#645087",
    lavender: "#a999c4",
    moss: "#687951",
    grass: "#839566",
    earth: "#3e454b",
    stone: "#879394",
    pink: "#e6acc8",
    light: "#ffd591",
  };

  const vermilion = grain("#b5413d", "#d65c4a", {
    size: 0.025,
    axis: "y",
    seed: 7,
  });
  const timber = grain("#60403a", "#956347", {
    size: 0.023,
    axis: "x",
    seed: 2,
  });
  const darkTimber = grain("#352d37", "#59404a", {
    size: 0.025,
    axis: "y",
    seed: 3,
  });
  const stone = paint((p, n) => {
    const v = noise(p, 0.18, 24);
    const col = mix("#626e7b", "#a3aca8", 0.28 + v * 0.57);
    return n.y > 0.65 && noise(p, 0.22, 18) > 0.63
      ? mix(col, "#6d8056", 0.62)
      : col;
  });
  const ground = mottle("#626d70", "#88918a", {
    size: 0.46,
    contrast: 0.7,
    seed: 10,
  });
  const moss = mottle("#52654c", "#849263", {
    size: 0.17,
    seed: 4,
  });
  const roofPaint = paint((p, n) =>
    mix(
      "#31364f",
      "#657595",
      Math.max(0, Math.min(1, 0.3 + n.y * 0.35 + noise(p, 0.2, 5) * 0.24)),
    ),
  );
  const brass = paint((p, n) =>
    mix("#9c783e", "#f4d48a", 0.34 + 0.38 * Math.max(n.y, 0) + noise(p, 0.07, 8) * 0.2),
  );

  function box(
    name: string,
    at: number[],
    size: number[],
    color: Finish,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  function cylinder(
    name: string,
    at: number[],
    rTop: number,
    rBottom: number,
    height: number,
    color: Finish,
    sides = 8,
    dir: number[] = [0, 1, 0],
  ) {
    return b.part(
      new THREE.CylinderGeometry(rTop, rBottom, height, sides),
      color,
      { at, dir, bone: root, name },
    );
  }

  function ellipsoid(
    name: string,
    at: number[],
    size: number[],
    color: Finish,
    detail = 0,
  ) {
    return b.part(new THREE.IcosahedronGeometry(1, detail), color, {
      at,
      scale: size,
      bone: root,
      name,
      flat: true,
    });
  }

  function line(
    name: string,
    points: number[][],
    radius: number,
    color: Finish,
  ) {
    return b.sweep(points, radius, {
      color,
      bone: root,
      sides: 6,
      caps: "round",
      name,
    });
  }

  function plate(
    name: string,
    points: number[][],
    color: Finish,
    thickness = 0.025,
  ) {
    return b.slab(points, { color, thickness, bone: root, name });
  }

  function drawing(
    name: string,
    tex: THREE.Texture,
    at: number[],
    w: number,
    h: number,
    dir: number[] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      texture: tex,
      dir,
      axis: "z",
      bone: root,
      name,
    });
  }

  function torus(
    name: string,
    at: number[],
    radius: number,
    tube: number,
    color: Finish,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 5, 16), color, {
      at,
      rotation,
      bone: root,
      name,
    });
  }

  // Drawings: the same fox-and-flame heraldry repeats through the sanctuary.
  const foxMark = `
    <path d="M25 59 L18 18 L40 34 Q50 29 60 34 L82 18 L75 59
      L62 78 L50 89 L38 78 Z" fill="#f8e6bb" stroke="#382c4b" stroke-width="3"/>
    <path d="M23 27 L28 49 L37 39 Z M77 27 L72 49 L63 39 Z" fill="#bd4f56"/>
    <path d="M29 54 L44 60 L37 65 Z M71 54 L56 60 L63 65 Z" fill="#6e4c85"/>
    <path d="M44 74 L50 79 L56 74 L50 70 Z" fill="#bd4f56"/>
    <path d="M46 42 L50 35 L54 42 L50 50 Z" fill="#d7ad58"/>`;

  const crest = svg(
    `<svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="47" fill="#665084" stroke="#e5c477" stroke-width="4"/>
      <circle cx="50" cy="50" r="40" fill="none" stroke="#baa0cb" stroke-width="1.5"/>
      <g transform="translate(10 8) scale(.8)">${foxMark}</g>
      <path d="M8 51 L13 47 L18 51 L13 55 Z M82 51 L87 47 L92 51 L87 55 Z" fill="#e5c477"/>
    </svg>`,
    { size: 384 },
  );

  const curtain = svg(
    `<svg viewBox="0 0 240 160">
      <rect width="240" height="160" fill="#665184"/>
      <path d="M0 12H240 M0 145H240" stroke="#d6b974" stroke-width="4"/>
      <path d="M0 21H240 M0 136H240" stroke="#b69bc9" stroke-width="2"/>
      <g fill="none" stroke="#9481b0" stroke-width="2" opacity=".55">
        ${Array.from({ length: 9 }, (_, i) =>
          `<path d="M${i * 30 - 25} 160 Q${i * 30} 100 ${i * 30 + 25} 160
          M${i * 30 - 25} 120 Q${i * 30} 60 ${i * 30 + 25} 120"/>`,
        ).join("")}
      </g>
      <g transform="translate(76 28) scale(.88)">${foxMark}</g>
      <path d="M13 38V117 M227 38V117" stroke="#cdb1d4" stroke-width="2" stroke-dasharray="6 6"/>
    </svg>`,
    { size: 512 },
  );

  const lanternArt = svg(
    `<svg viewBox="0 0 140 200">
      <path d="M21 12H119 M21 188H119" stroke="#9f633c" stroke-width="5"/>
      <path d="M29 26H111 M29 176H111" stroke="#c68f50" stroke-width="2"/>
      <g transform="translate(20 43)">${foxMark}</g>
      <path d="M70 141 C51 151 60 170 70 175 C82 164 85 148 70 141Z" fill="#b94948"/>
      <path d="M70 150 L70 165" stroke="#ffe5a8" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const ofuda = svg(
    `<svg viewBox="0 0 90 220">
      <rect x="2" y="2" width="86" height="216" fill="#f2dfb6" stroke="#aa6c59" stroke-width="4"/>
      <rect x="10" y="10" width="70" height="200" fill="none" stroke="#b33e49" stroke-width="2"/>
      <circle cx="45" cy="39" r="18" fill="none" stroke="#a9444b" stroke-width="3"/>
      <path d="M45 22 L57 43 L33 43 Z M24 72H66 M45 60V95 M28 84L62 97
        M29 115H61 M45 103V139 M26 135L65 119 M27 158H64 M35 147V179
        M55 147V179 M28 180H64" fill="none" stroke="#49363e" stroke-width="5"/>
      <rect x="33" y="190" width="24" height="15" fill="#b4484e"/>
    </svg>`,
    { size: 256 },
  );

  const sign = svg(
    `<svg viewBox="0 0 120 200">
      <rect width="120" height="200" rx="9" fill="#302a43"/>
      <rect x="7" y="7" width="106" height="186" rx="5" fill="none" stroke="#e1bc6d" stroke-width="4"/>
      <path d="M60 18L72 30L60 42L48 30Z" fill="#e1bc6d"/>
      <text x="60" y="96" text-anchor="middle" font-size="47" font-family="serif" fill="#f6df9e">稲</text>
      <text x="60" y="151" text-anchor="middle" font-size="47" font-family="serif" fill="#f6df9e">荷</text>
      <path d="M35 176H85" stroke="#e1bc6d" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  const prayer = svg(
    `<svg viewBox="0 0 160 100">
      <path d="M3 28L80 3L157 28V97H3Z" fill="#c79761" stroke="#603e39" stroke-width="5"/>
      <path d="M12 32L80 12L148 32" stroke="#efd39a" stroke-width="3" fill="none"/>
      <g transform="translate(47 21) scale(.54)">${foxMark}</g>
      <path d="M19 53V82 M29 55V76 M130 49V81 M140 58V77" stroke="#77474b" stroke-width="3"/>
    </svg>`,
    { size: 256 },
  );

  const offeringLabel = svg(
    `<svg viewBox="0 0 180 90">
      <rect x="2" y="2" width="176" height="86" rx="5" fill="#4b3440" stroke="#dfbd76" stroke-width="4"/>
      <path d="M16 45L25 32L34 45L25 58Z M146 45L155 32L164 45L155 58Z" fill="#dfbd76"/>
      <text x="90" y="58" text-anchor="middle" font-family="serif" font-size="37" fill="#efdba6">奉納</text>
    </svg>`,
    { size: 256 },
  );

  // A close-fitting, clipped stone island. Its bottom is the ground plane.
  b.extrude(
    [
      [-2.22, -1.42], [-1.8, -1.7], [1.76, -1.7], [2.23, -1.31],
      [2.23, 1.36], [1.83, 1.79], [-1.77, 1.79], [-2.22, 1.38],
    ],
    {
      at: [0, 0.095, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.19,
      color: C.earth,
      bone: root,
      name: "cutStoneIsland",
    },
  );
  b.extrude(
    [
      [-2.18, -1.39], [-1.77, -1.66], [1.73, -1.66], [2.18, -1.28],
      [2.18, 1.32], [1.79, 1.75], [-1.74, 1.75], [-2.18, 1.34],
    ],
    {
      at: [0, 0.193, 0],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.025,
      color: ground,
      bone: root,
      name: "gardenSurface",
    },
  );

  // Approach paving, a broad central step and a dressed foundation.
  for (let row = 0; row < 3; row++) {
    for (let side = 0; side < 2; side++) {
      box(
        "approachPaver",
        [(side - 0.5) * 0.48 + (row % 2 ? 0.028 : -0.014), 0.233, 1.52 - row * 0.34],
        [0.455, 0.065, 0.30],
        stone,
        [0, (random() - 0.5) * 3, 0],
      );
    }
  }

  box("foundationFoot", [0, 0.285, -0.61], [1.77, 0.16, 1.54], stone);
  box("foundationTop", [0, 0.39, -0.61], [1.86, 0.09, 1.63], stone);
  box("lowerStep", [0, 0.28, 0.40], [1.02, 0.15, 0.41], stone);
  box("upperStep", [0, 0.365, 0.23], [1.02, 0.13, 0.34], stone);
  box("verandaUnderframe", [0, 0.455, -0.60], [1.70, 0.08, 1.46], darkTimber);
  for (let i = 0; i < 9; i++) {
    box("verandaPlank", [0, 0.506, -1.24 + i * 0.16], [1.70, 0.035, 0.151], timber);
  }

  // Shrine cabinet: substantial simple forms, with a real recessed interior.
  box("sanctuaryBack", [0, 1.08, -1.13], [1.22, 1.15, 0.10], darkTimber);
  box("sanctuarySideL", [0.59, 1.08, -0.75], [0.085, 1.15, 0.76], timber);
  box("sanctuarySideR", [-0.59, 1.08, -0.75], [0.085, 1.15, 0.76], timber);
  box("innerAltar", [0, 0.675, -0.72], [0.89, 0.14, 0.55], C.redDark);
  box("innerAltarLip", [0, 0.755, -0.72], [0.98, 0.045, 0.61], brass);
  box("innerRecess", [0, 1.12, -1.068], [0.96, 0.86, 0.012], C.redDark);

  cylinder("sacredHalo", [0, 1.16, -1.04], 0.315, 0.315, 0.018, brass, 24, [0, 0, 1]);
  torus("haloEngraving", [0, 1.16, -1.025], 0.27, 0.012, C.goldLight);
  drawing("haloFoxSeal", crest, [0, 1.16, -1.012], 0.39, 0.39);

  for (const s of [-1, 1]) {
    const x = s * 0.57;
    box("frontShrinePillar", [x, 1.1, -0.325], [0.12, 1.18, 0.14], vermilion);
    box("pillarFoot", [x, 0.575, -0.325], [0.155, 0.11, 0.18], darkTimber);
    box("pillarGoldCollar", [x, 1.545, -0.325], [0.132, 0.045, 0.152], brass);
    box("pillarCapital", [x, 1.66, -0.325], [0.22, 0.095, 0.23], vermilion);

    // Narrow outer door leaves expose the figure in the middle.
    box("doorLeaf", [s * 0.438, 1.115, -0.285], [0.20, 0.89, 0.052], C.redDark);
    box("doorInset", [s * 0.438, 1.17, -0.253], [0.15, 0.66, 0.012], darkTimber);
    for (let j = 0; j < 3; j++) {
      box("doorVerticalLattice", [s * 0.438 + (j - 1) * 0.05, 1.17, -0.237],
        [0.014, 0.67, 0.022], brass);
    }
    for (let j = 0; j < 4; j++) {
      box("doorHorizontalLattice", [s * 0.438, 0.89 + j * 0.18, -0.227],
        [0.17, 0.013, 0.019], timber);
    }
    cylinder("doorPull", [s * 0.36, 0.99, -0.209], 0.022, 0.022, 0.02, brass, 8, [0, 0, 1]);
  }

  box("cabinetLintel", [0, 1.686, -0.72], [1.39, 0.13, 0.98], vermilion);
  box("lintelGoldEdge", [0, 1.624, -0.228], [1.36, 0.025, 0.023], brass);
  plate("frontGable", [
    [-0.70, 1.745, -0.23], [0.70, 1.745, -0.23], [0, 2.217, -0.23],
  ], darkTimber, 0.055);
  plate("gableInset", [
    [-0.49, 1.78, -0.194], [0.49, 1.78, -0.194], [0, 2.12, -0.194],
  ], vermilion, 0.02);
  drawing("gableCrest", crest, [0, 1.91, -0.172], 0.20, 0.20);

  // Indigo roof: broad faceted sweeps, upturned eaves and individual tile ribs.
  const roofX = [0, 0.28, 0.56, 0.80, 1.00];
  const roofY = [2.265, 2.13, 1.955, 1.87, 1.945];
  for (const s of [-1, 1]) {
    for (let k = 0; k < roofX.length - 1; k++) {
      plate("curvedRoofPanel", [
        [s * roofX[k], roofY[k], 0.045],
        [s * roofX[k + 1], roofY[k + 1], 0.045],
        [s * roofX[k + 1], roofY[k + 1], -1.43],
        [s * roofX[k], roofY[k], -1.43],
      ], roofPaint, 0.055);
    }
    for (let tile = 0; tile < 8; tile++) {
      const z = -1.39 + tile * 0.198;
      line("raisedTileRib",
        roofX.map((x, i) => [s * x, roofY[i] + 0.032, z]),
        0.019, C.roofLight);
    }
    for (const z of [0.074, -1.455]) {
      line("roofBargeboard",
        roofX.map((x, i) => [s * x, roofY[i] - 0.015, z]),
        0.046, C.ink);
      line("gildedRoofEdge",
        roofX.map((x, i) => [s * x, roofY[i] + 0.006, z + 0.025]),
        0.011, brass);
    }
    line("eaveRoll", [
      [s * 1.0, 1.948, -1.46], [s * 1.0, 1.948, 0.08],
    ], 0.038, C.blue);
    for (const z of [-1.46, 0.08]) {
      cylinder("eaveEndMedallion", [s * 1.0, 1.948, z + 0.019],
        0.034, 0.034, 0.012, brass, 8, [0, 0, 1]);
    }
  }
  line("roofRidge", [[0, 2.27, -1.47], [0, 2.27, 0.11]], 0.064, C.ink);
  line("roofRidgeGilding", [[0, 2.324, -1.47], [0, 2.324, 0.11]], 0.014, brass);
  for (const z of [-1.48, 0.12]) {
    line("ridgeHorn", [[0, 2.27, z], [0, 2.33, z + (z > 0 ? 0.09 : -0.09)],
      [0, 2.43, z + (z > 0 ? 0.11 : -0.11)]], 0.031, brass);
  }

  // Short textile hangings; the face and opening below remain unobstructed.
  line("curtainRail", [[-0.58, 1.59, -0.18], [0.58, 1.59, -0.18]], 0.018, brass);
  for (let i = -1; i <= 1; i++) {
    const x = i * 0.345;
    box("curtainBacking", [x, 1.43, -0.176], [0.327, 0.285, 0.018], C.purple);
    drawing("embroideredNoren", curtain, [x, 1.43, -0.165], 0.327, 0.285);
    for (const dx of [-0.11, 0.11]) {
      torus("curtainLoop", [x + dx, 1.578, -0.18], 0.022, 0.005, C.gold, [0, 90, 0]);
    }
  }

  // A carved votive fox, not a live creature: all pieces are part of the altar.
  ellipsoid("foxHaunches", [0, 0.91, -0.66], [0.16, 0.20, 0.14], C.white, 0);
  b.frustumBox([0, 0.82, -0.60], [0, 1.14, -0.59], [0.24, 0.19], [0.17, 0.14], {
    color: C.white, bone: root, name: "foxUprightChest",
  });
  ellipsoid("foxHead", [0, 1.20, -0.56], [0.155, 0.13, 0.12], C.white, 0);
  b.frustumBox([0, 1.18, -0.51], [0, 1.155, -0.365], [0.14, 0.10], [0.055, 0.05], {
    color: C.white, bone: root, name: "carvedFoxMuzzle",
  });
  ellipsoid("foxNose", [0, 1.158, -0.355], [0.033, 0.018, 0.021], C.redDark);
  for (const s of [-1, 1]) {
    plate("foxEar", [
      [s * 0.045, 1.26, -0.56], [s * 0.137, 1.25, -0.55], [s * 0.115, 1.43, -0.56],
    ], C.white, 0.075);
    plate("foxInnerEar", [
      [s * 0.067, 1.285, -0.513], [s * 0.119, 1.279, -0.513], [s * 0.111, 1.382, -0.513],
    ], C.red, 0.009);
    line("carvedFoxEye", [[s * 0.045, 1.217, -0.452], [s * 0.105, 1.235, -0.468]], 0.009, C.ink);
    box("foxForeleg", [s * 0.072, 0.88, -0.515], [0.064, 0.23, 0.075], C.white);
    ellipsoid("foxPaw", [s * 0.072, 0.784, -0.477], [0.056, 0.035, 0.073], C.white);
  }
  b.sweep(catmull([
    [0.11, 0.82, -0.73], [0.24, 0.87, -0.74], [0.28, 1.02, -0.71], [0.22, 1.14, -0.70],
  ]), [0.073, 0.08, 0.055, 0], {
    color: C.white, bone: root, sides: 6, name: "carvedFoxTail",
  });
  plate("foxRedBib", [
    [-0.101, 1.101, -0.477], [0.101, 1.101, -0.477],
    [0.08, 0.96, -0.449], [0, 0.92, -0.439], [-0.08, 0.96, -0.449],
  ], C.red, 0.018);
  cylinder("foxBibBell", [0, 1.023, -0.428], 0.025, 0.025, 0.017, brass, 8, [0, 0, 1]);

  // Veranda railings.
  for (const s of [-1, 1]) {
    for (const z of [-1.19, -0.67, -0.14]) {
      box("verandaPost", [s * 0.78, 0.695, z], [0.07, 0.37, 0.07], vermilion);
      box("verandaPostCap", [s * 0.78, 0.891, z], [0.105, 0.04, 0.105], C.ink);
      cylinder("verandaCapStud", [s * 0.78, 0.921, z], 0.025, 0.031, 0.02, brass);
    }
    box("verandaHandrail", [s * 0.78, 0.81, -0.66], [0.065, 0.055, 1.18], vermilion);
    box("verandaLowerRail", [s * 0.78, 0.625, -0.66], [0.045, 0.035, 1.10], darkTimber);
  }

  // Saisen offering chest in front of the steps.
  box("offeringChestFeet", [0, 0.295, 0.65], [0.78, 0.15, 0.40], darkTimber);
  box("offeringChest", [0, 0.48, 0.65], [0.88, 0.30, 0.43], timber);
  box("chestTopRim", [0, 0.648, 0.65], [0.96, 0.065, 0.49], darkTimber);
  box("chestSlotDarkness", [0, 0.683, 0.65], [0.84, 0.014, 0.39], C.ink);
  for (let i = 0; i < 7; i++) {
    box("offeringChestSlat", [(i - 3) * 0.116, 0.707, 0.65], [0.066, 0.043, 0.415], timber);
  }
  drawing("dedicationPlaque", offeringLabel, [0, 0.491, 0.871], 0.36, 0.18);
  for (const s of [-1, 1]) {
    box("chestCornerStrap", [s * 0.391, 0.49, 0.873], [0.035, 0.27, 0.017], brass);
    for (const y of [0.39, 0.58]) {
      cylinder("chestRivet", [s * 0.391, y, 0.887], 0.01, 0.01, 0.009, C.goldLight, 6, [0, 0, 1]);
    }
  }

  // Ceramic offerings: rice, fruit, sake, and a small votive candle.
  function dish(x: number, z: number, r: number, y = 0.535) {
    return b.lathe(
      [[0, 0], [r * 0.55, 0], [r, 0.031], [r, 0.045], [r * 0.82, 0.035], [0, 0.025]],
      { at: [x, y, z], color: C.redDark, segments: 12, bone: root, name: "lacquerOfferingDish" },
    );
  }
  dish(-0.56, 0.02, 0.16);
  for (const [dx, dy, dz] of [[-0.062, 0, 0], [0.065, 0, 0], [0, 0.095, -0.008]]) {
    ellipsoid("offeredMandarin", [-0.56 + dx, 0.625 + dy, 0.02 + dz],
      [0.068, 0.061, 0.065], "#e8a04f", 1);
    line("mandarinStem", [[-0.56 + dx, 0.679 + dy, 0.02 + dz],
      [-0.554 + dx, 0.694 + dy, 0.02 + dz]], 0.009, C.moss);
  }
  dish(0.56, 0.02, 0.15);
  cylinder("riceBowlFoot", [0.56, 0.586, 0.02], 0.065, 0.055, 0.065, C.white, 10);
  cylinder("riceBowl", [0.56, 0.637, 0.02], 0.12, 0.062, 0.09, C.white, 12);
  ellipsoid("riceMound", [0.56, 0.697, 0.02], [0.109, 0.063, 0.104], C.ivory, 1);
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const r = 0.064 * Math.sqrt(random());
    ellipsoid("riceGrain", [0.56 + Math.cos(a) * r, 0.742 - r * 0.25, 0.02 + Math.sin(a) * r],
      [0.009, 0.006, 0.016], C.white);
  }

  for (const s of [-1, 1]) {
    const x = s * 0.34;
    b.lathe(
      [[0, 0], [0.07, 0], [0.085, 0.05], [0.076, 0.145],
        [0.038, 0.205], [0.034, 0.27], [0.044, 0.278],
        [0.044, 0.293], [0, 0.293]],
      { at: [x, 0.525, -0.19], color: C.white, segments: 10, bone: root, name: "sakeBottle" },
    );
    cylinder("sakeCork", [x, 0.827, -0.19], 0.032, 0.035, 0.035, C.redDark, 8);
    drawing("bottlePaperSeal", ofuda, [x, 0.661, -0.111], 0.064, 0.145);
  }

  // Torii frame. The forward placement makes a legible portal around the shrine.
  const gateZ = 0.43;
  for (const s of [-1, 1]) {
    const footX = s * 1.25;
    cylinder("toriiStoneShoe", [footX, 0.29, gateZ], 0.245, 0.28, 0.17, stone, 8);
    cylinder("toriiBlackBoot", [footX, 0.51, gateZ], 0.145, 0.175, 0.35, C.ink, 8);
    b.rod([footX, 0.50, gateZ], [s * 1.16, 2.90, gateZ], [0.137, 0.112], {
      color: vermilion, bone: root, sides: 10, name: "vermilionToriiPillar",
    });
    cylinder("bootGoldBand", [s * 1.244, 0.69, gateZ], 0.148, 0.149, 0.044, brass, 10);
    cylinder("pillarUpperBand", [s * 1.174, 2.53, gateZ], 0.129, 0.132, 0.065, C.redDark, 10);
    box("toriiPillarCapital", [s * 1.16, 2.87, gateZ], [0.34, 0.11, 0.35], C.redDark);
    for (const y of [0.76, 2.43]) {
      cylinder("pillarFrontFastener", [s * (y < 1 ? 1.24 : 1.178), y, gateZ + 0.137],
        0.022, 0.022, 0.015, brass, 8, [0, 0, 1]);
    }
  }

  box("toriiLowerCrossbeam", [0, 2.53, gateZ], [3.02, 0.155, 0.21], vermilion);
  box("crossbeamUnderside", [0, 2.442, gateZ], [2.96, 0.028, 0.225], C.redDark);
  for (const s of [-1, 1]) {
    box("beamBlackEnd", [s * 1.48, 2.53, gateZ], [0.10, 0.182, 0.24], C.ink);
    box("beamEndGilt", [s * 1.428, 2.53, gateZ + 0.123], [0.018, 0.15, 0.012], brass);
    box("toriiUprightSpacer", [s * 0.49, 2.72, gateZ], [0.075, 0.32, 0.17], vermilion);
  }
  b.extrude(
    [
      [-1.70, 2.91], [-1.34, 2.85], [-0.70, 2.82], [0.70, 2.82],
      [1.34, 2.85], [1.70, 2.91], [1.70, 3.03], [1.30, 2.99],
      [0.70, 2.97], [-0.70, 2.97], [-1.30, 2.99], [-1.70, 3.03],
    ],
    { at: [0, 0, gateZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.29, color: vermilion, bone: root, name: "toriiSweepingLintel" },
  );
  b.extrude(
    [
      [-1.83, 3.01], [-1.32, 2.965], [-0.70, 2.945], [0.70, 2.945],
      [1.32, 2.965], [1.83, 3.01], [1.90, 3.145], [1.32, 3.087],
      [0.70, 3.065], [-0.70, 3.065], [-1.32, 3.087], [-1.90, 3.145],
    ],
    { at: [0, 0, gateZ], x: [1, 0, 0], y: [0, 1, 0],
      thickness: 0.38, color: C.ink, bone: root, name: "toriiBlackCrown" },
  );
  line("toriiCrownFineGilt", [
    [-1.82, 3.025, 0.628], [-1.30, 2.981, 0.628], [-0.70, 2.962, 0.628],
    [0.70, 2.962, 0.628], [1.30, 2.981, 0.628], [1.82, 3.025, 0.628],
  ], 0.012, brass);
  box("gateSignBacking", [0, 2.719, 0.601], [0.292, 0.435, 0.055], brass);
  drawing("gateCalligraphy", sign, [0, 2.719, 0.632], 0.264, 0.407);

  // Shimenawa: two visibly twisted straw strands over a sagging central core.
  const ropePoints: number[][] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    ropePoints.push([-1.15 + t * 2.30, 2.40 - 0.185 * Math.sin(Math.PI * t), 0.585]);
  }
  line("sacredRopeCore", ropePoints, 0.033, "#baa078");
  for (const phase of [0, Math.PI]) {
    const strand = ropePoints.map((p, i) => {
      const a = i / 40 * Math.PI * 2 * 15 + phase;
      return [p[0], p[1] + Math.cos(a) * 0.025, p[2] + Math.sin(a) * 0.025];
    });
    line("twistedStrawStrand", strand, 0.013, "#dfc796");
  }

  for (const x of [-0.80, -0.39, 0.39, 0.80]) {
    const y = 2.40 - 0.185 * Math.sin(Math.PI * ((x + 1.15) / 2.30));
    line("shideTie", [[x, y, 0.61], [x, y - 0.07, 0.62]], 0.009, C.ivory);
    b.extrude(
      [[-0.04, 0], [0.035, 0], [0.035, -0.075], [0.085, -0.075],
        [0.085, -0.14], [0.03, -0.14], [0.03, -0.22], [-0.035, -0.22],
        [-0.035, -0.115], [0.016, -0.115], [0.016, -0.055], [-0.04, -0.055]],
      {
        at: [x, y - 0.05, 0.622],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.009,
        color: C.white,
        bone: root,
        name: "foldedSacredPaper",
      },
    );
  }

  // Warm paper lanterns hang inside the portal, rather than covering the altar.
  for (const s of [-1, 1]) {
    const x = s * 0.99;
    const z = 0.45;
    line("paperLanternHanger", [[x, 2.45, z], [x, 2.275, z]], 0.012, C.ink);
    torus("paperLanternHandle", [x, 2.28, z], 0.041, 0.008, brass);
    const lantern = b.lathe(
      [[0, -0.235], [0.095, -0.235], [0.143, -0.17], [0.163, -0.07],
        [0.163, 0.08], [0.14, 0.18], [0.095, 0.225], [0, 0.225]],
      { at: [x, 2.015, z], segments: 12, color: C.light, bone: root, name: "glowingPaperLantern" },
    );
    glow(lantern, 0.8);
    for (let i = 0; i < 7; i++) {
      const y = 1.83 + i * 0.058;
      const d = Math.abs(y - 2.015);
      const r = d > 0.15 ? 0.13 : d > 0.10 ? 0.153 : 0.165;
      torus("paperLanternBambooHoop", [x, y, z], r, 0.0045, "#bd8a56", [90, 0, 0]);
    }
    cylinder("lanternTopCap", [x, 2.25, z], 0.101, 0.105, 0.036, C.ink, 10);
    cylinder("lanternBottomCap", [x, 1.78, z], 0.105, 0.095, 0.04, C.ink, 10);
    b.decal(lantern, lanternArt, {
      at: [x, 2.015, z + 0.17],
      dir: [0, 0, 1],
      size: [0.21, 0.37],
      lift: 0.002,
      segments: 10,
      bone: root,
      name: "paperLanternFoxDrawing",
    });
    line("lanternTasselCord", [[x, 1.76, z], [x, 1.69, z]], 0.011, C.redDark);
    cylinder("lanternTasselKnot", [x, 1.684, z], 0.024, 0.021, 0.035, brass);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 2 / 5;
      line("silkTassel", [
        [x + Math.cos(a) * 0.012, 1.67, z + Math.sin(a) * 0.012],
        [x + Math.cos(a) * 0.028, 1.54, z + Math.sin(a) * 0.028],
      ], 0.009, C.red);
    }
  }

  // Stone lanterns: heavy bases, square chambers, open luminous windows.
  function stoneLantern(x: number, z: number) {
    cylinder("lanternFoundation", [x, 0.255, z], 0.29, 0.33, 0.10, stone, 6);
    cylinder("lanternFoot", [x, 0.34, z], 0.21, 0.26, 0.10, stone, 6);
    cylinder("lanternPedestal", [x, 0.565, z], 0.105, 0.14, 0.36, stone, 6);
    cylinder("lanternShaftCollar", [x, 0.705, z], 0.15, 0.12, 0.07, stone, 6);
    cylinder("lanternChamberTray", [x, 0.79, z], 0.285, 0.18, 0.12, stone, 4);
    box("lanternWindowBottom", [x, 0.865, z], [0.36, 0.07, 0.36], stone);
    glow(box("lanternWarmCore", [x, 1.01, z], [0.255, 0.24, 0.255], "#ffc97d"), 1.15);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        box("lanternWindowCorner", [x + sx * 0.157, 1.015, z + sz * 0.157],
          [0.062, 0.30, 0.062], stone);
      }
    }
    for (const sx of [-1, 1]) {
      box("lanternFrontMullion", [x + sx * 0.062, 1.015, z + 0.163],
        [0.018, 0.24, 0.027], C.ink);
      box("lanternSideMullion", [x + 0.163, 1.015, z + sx * 0.062],
        [0.027, 0.24, 0.018], C.ink);
    }
    box("lanternWindowTop", [x, 1.18, z], [0.39, 0.07, 0.39], stone);
    b.lathe(
      [[0, 0], [0.37, 0], [0.40, 0.055], [0.30, 0.088],
        [0.155, 0.22], [0.10, 0.25], [0, 0.25]],
      { at: [x, 1.20, z], segments: 4, spin: 45, color: stone, bone: root, name: "stonePagodaRoof" },
    );
    cylinder("lanternFinialSeat", [x, 1.472, z], 0.10, 0.13, 0.055, stone, 8);
    ellipsoid("lanternJewelFinial", [x, 1.565, z], [0.087, 0.105, 0.087], stone);
    drawing("lanternShaftTalisman", ofuda, [x, 0.56, z + 0.123], 0.071, 0.18);
  }
  stoneLantern(-1.72, 0.93);
  stoneLantern(1.72, 0.93);

  // A little ema rack beside the shrine, behind the gate.
  for (const x of [1.28, 1.91]) {
    box("prayerRackLeg", [x, 0.75, -0.92], [0.065, 1.07, 0.075], timber);
    cylinder("prayerRackStoneFoot", [x, 0.255, -0.92], 0.10, 0.12, 0.09, stone, 6);
  }
  box("prayerRackTop", [1.595, 1.31, -0.92], [0.83, 0.09, 0.15], C.ink);
  box("prayerRackRail", [1.595, 1.08, -0.92], [0.69, 0.042, 0.055], timber);
  for (let i = 0; i < 3; i++) {
    const x = 1.37 + i * 0.225;
    const y = i === 1 ? 0.84 : 0.90;
    line("emaString", [[x - 0.025, 1.09, -0.89], [x, y + 0.105, -0.86],
      [x + 0.025, 1.09, -0.89]], 0.005, C.ivory);
    b.extrude(
      [[-0.095, -0.06], [0.095, -0.06], [0.095, 0.045], [0, 0.083], [-0.095, 0.045]],
      { at: [x, y, -0.86], x: [1, 0, 0], y: [0, 1, 0],
        thickness: 0.022, color: timber, bone: root, name: "woodenPrayerPlaque" },
    );
    drawing("emaFoxDrawing", prayer, [x, y + 0.006, -0.846], 0.181, 0.128);
  }

  // Moss, compact rocks, stylized grass and a restrained scattering of sakura.
  const rocks = [
    [-1.81, -1.19, 0.30, 0.24], [-1.51, -1.38, 0.25, 0.17],
    [-1.94, -0.67, 0.23, 0.18], [1.87, -1.35, 0.26, 0.18],
    [1.98, 0.09, 0.18, 0.12], [-1.94, 0.06, 0.19, 0.14],
    [1.13, 1.45, 0.19, 0.10], [-1.12, 1.42, 0.18, 0.10],
  ];
  for (const [x, z, r, h] of rocks) {
    ellipsoid("gardenBoulder", [x, 0.20 + h * 0.55, z], [r, h, r * 0.8], stone, 0);
    ellipsoid("boulderMossCap", [x - r * 0.12, 0.20 + h * 1.25, z],
      [r * 0.74, h * 0.24, r * 0.64], moss, 0);
  }
  const mossPatches = [
    [-1.68, -1.03, 0.47, 0.37], [1.73, -1.24, 0.38, 0.30],
    [-1.80, 0.12, 0.27, 0.25], [1.80, 0.14, 0.28, 0.25],
    [-1.16, 1.28, 0.29, 0.21], [1.17, 1.39, 0.30, 0.18],
  ];
  for (const [x, z, rx, rz] of mossPatches) {
    ellipsoid("lowMossPatch", [x, 0.217, z], [rx, 0.025, rz], moss, 1);
  }

  function grassTuft(x: number, z: number, height: number) {
    for (let i = 0; i < 5; i++) {
      const a = i * 2.4;
      const dx = Math.cos(a) * height * 0.33;
      const dz = Math.sin(a) * height * 0.33;
      plate("broadGrassBlade", [
        [x - 0.017, 0.21, z],
        [x + 0.017, 0.21, z],
        [x + dx * 0.6 + 0.01, 0.21 + height * 0.6, z + dz * 0.6],
        [x + dx, 0.21 + height, z + dz],
      ], i % 2 ? C.moss : C.grass, 0.004);
    }
  }
  for (const [x, z, h] of [
    [-1.99, -0.28, 0.23], [-1.20, -1.43, 0.22],
    [2.02, -0.33, 0.23], [1.05, -1.46, 0.19],
    [-0.96, 1.47, 0.14], [1.30, 1.45, 0.15],
    [-1.95, 1.39, 0.15], [1.99, 1.40, 0.14],
  ]) grassTuft(x, z, h);

  // A tiny flowering azalea gives the roadside garden its seasonal colour.
  line("azaleaTrunk", [[-1.57, 0.22, -0.96], [-1.58, 0.48, -0.98]], 0.037, darkTimber);
  for (let i = 0; i < 7; i++) {
    const a = i * 2.399;
    const r = i === 0 ? 0 : 0.19;
    const x = -1.57 + Math.cos(a) * r;
    const z = -0.98 + Math.sin(a) * r;
    const y = 0.49 + (i % 3) * 0.055;
    ellipsoid("azaleaLeafCloud", [x, y, z], [0.22, 0.145, 0.19], moss, 0);
    ellipsoid("azaleaBlossomCloud", [x - 0.025, y + 0.095, z + 0.035],
      [0.145, 0.065, 0.12], i % 2 ? C.pink : "#bd8bb0", 0);
  }

  for (let i = 0; i < 20; i++) {
    const x = (random() - 0.5) * 3.8;
    const z = (random() - 0.5) * 2.9;
    if (Math.abs(x) < 0.92 && z < 0.92) continue;
    const a = random() * Math.PI * 2;
    const dx = Math.cos(a) * 0.032;
    const dz = Math.sin(a) * 0.032;
    plate("fallenSakuraPetal", [
      [x - dx, 0.225, z - dz],
      [x - dz * 0.55, 0.228, z + dx * 0.55],
      [x + dx, 0.225, z + dz],
      [x + dz * 0.45, 0.227, z - dx * 0.45],
    ], i % 2 ? C.pink : "#f1c9d8", 0.003);
  }

  // Small votive flame at the back of the veranda.
  cylinder("votiveSaucer", [-0.67, 0.55, -0.70], 0.085, 0.075, 0.045, brass, 10);
  cylinder("votiveCandle", [-0.67, 0.615, -0.70], 0.042, 0.045, 0.11, C.ivory, 8);
  glow(ellipsoid("votiveFlame", [-0.67, 0.716, -0.70],
    [0.023, 0.048, 0.023], "#ffe1a2"), 1.7);

  return b.root;
}
```