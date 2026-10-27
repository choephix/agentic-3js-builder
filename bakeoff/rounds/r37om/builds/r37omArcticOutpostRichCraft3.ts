import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "Arctic Research Outpost",
  description: "A stylized Firewatch-inspired arctic research station diorama with snow, cabin, antenna, solar array, wind turbine, supplies, flags, and glowing windows.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#e8f2f1";
  const SNOW_BLUE = "#b9d7dc";
  const SHADOW = "#7295a1";
  const SKY_BLUE = "#244b68";
  const DEEP_BLUE = "#17364f";
  const CABIN = "#c65a3e";
  const CABIN_DARK = "#813b36";
  const TRIM = "#f1c16b";
  const WOOD = "#70483f";
  const WOOD_LIGHT = "#a66a4d";
  const METAL = "#526d78";
  const METAL_DARK = "#293e4b";
  const GLASS = "#79c9d2";
  const GLASS_DARK = "#315d72";
  const ORANGE = "#f08a45";
  const RED = "#d94c43";
  const WHITE = "#fff7d6";
  const BLACK = "#17202b";
  const GREEN = "#536f62";

  const windowTexture = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#18394d"/>
      <rect x="7" y="7" width="86" height="86" rx="3" fill="#71cbd0"/>
      <path d="M50 7V93M7 50H93" stroke="#d9e9df" stroke-width="7"/>
      <path d="M13 20L42 42M57 58L87 82M10 77L40 55M58 41L89 16" stroke="#c3edf0" stroke-width="3" opacity=".45"/>
    </svg>`,
    { size: 128 },
  );

  const warningTexture = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" rx="7" fill="#263744"/>
      <path d="M9 55L32 9L55 55Z" fill="#f2bd55" stroke="#151d27" stroke-width="5"/>
      <path d="M32 20V39" stroke="#263744" stroke-width="6" stroke-linecap="round"/>
      <circle cx="32" cy="47" r="3.5" fill="#263744"/>
      <text x="65" y="39" fill="#f2bd55" font-family="sans-serif" font-size="20" font-weight="bold">ICE FIELD</text>
    </svg>`,
    { size: 256 },
  );

  const logoTexture = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="58" fill="#f1c16b" stroke="#273d4b" stroke-width="7"/>
      <path d="M24 80L48 38L63 62L79 34L106 80Z" fill="#315d72"/>
      <path d="M24 91H105" stroke="#273d4b" stroke-width="7"/>
      <circle cx="91" cy="28" r="9" fill="#d94c43"/>
    </svg>`,
    { size: 128 },
  );

  const auroraTexture = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" fill="#142d48"/>
      <path d="M0 44 Q22 4 44 35T83 19T128 32V64H0Z" fill="#4db6a4" opacity=".9"/>
      <path d="M0 50 Q28 20 54 43T93 28T128 39" fill="none" stroke="#d6efb2" stroke-width="5" opacity=".8"/>
      <circle cx="95" cy="14" r="3" fill="#fff5c9"/>
      <circle cx="111" cy="25" r="2" fill="#fff5c9"/>
    </svg>`,
    { size: 256 },
  );

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
    name?: string,
  ) {
    return b.part(geometry, color, {
      at,
      rotation,
      flat: true,
      name,
      group: "outpost",
    });
  }

  function box(
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation?: [number, number, number],
    name?: string,
  ) {
    return part(new THREE.BoxGeometry(...size), color, at, rotation, name);
  }

  function cyl(
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    sides = 8,
    rotation?: [number, number, number],
    name?: string,
  ) {
    return part(new THREE.CylinderGeometry(radius, radius, height, sides), color, at, rotation, name);
  }

  function sphere(
    radius: number,
    color: string,
    at: [number, number, number],
    name?: string,
  ) {
    return part(new THREE.SphereGeometry(radius, 8, 5), color, at, undefined, name);
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: "flat",
      section: { ngon: 6 },
      name,
      group: "outpost",
    });
  }

  // Snow island and layered wind-carved edges.
  b.slab(
    [
      [-2.75, 0.02, -1.85],
      [-1.75, 0.02, -2.18],
      [-0.45, 0.02, -2.04],
      [0.8, 0.02, -2.2],
      [2.55, 0.02, -1.62],
      [2.85, 0.02, -0.42],
      [2.65, 0.02, 1.36],
      [1.55, 0.02, 1.86],
      [0.15, 0.02, 2.12],
      [-1.35, 0.02, 1.92],
      [-2.65, 0.02, 1.2],
      [-2.95, 0.02, -0.35],
    ],
    { color: SNOW, thickness: 0.16, name: "snow-island" },
  );
  box([5.3, 0.08, 3.7], SHADOW, [0, 0.035, 0], undefined, "blue-shadow-under-snow");
  box([5.0, 0.11, 3.42], SNOW, [0, 0.105, 0], undefined, "snow-platform");

  // Low snow banks around the footprint.
  for (const p of [
    [-2.2, 0.2, -1.25],
    [-1.45, 0.18, 1.45],
    [1.55, 0.19, 1.35],
    [2.18, 0.22, -1.05],
    [-2.4, 0.15, 0.25],
  ] as [number, number, number][]) {
    sphere(0.34, SNOW_BLUE, p, "wind-packed-snow");
  }

  // Main raised cabin.
  box([2.42, 1.32, 1.62], CABIN, [0, 0.91, 0.05], undefined, "research-cabin");
  box([2.52, 0.13, 1.73], CABIN_DARK, [0, 0.29, 0.05], undefined, "cabin-foundation");
  box([2.62, 0.11, 1.78], WOOD, [0, 0.18, 0.05], undefined, "cabin-skirt");

  // Roof with strong graphic silhouette.
  box([1.47, 0.16, 1.92], CABIN_DARK, [-0.62, 1.72, 0.05], [0, 0, -17], "left-roof-slope");
  box([1.47, 0.16, 1.92], CABIN_DARK, [0.62, 1.72, 0.05], [0, 0, 17], "right-roof-slope");
  box([2.82, 0.12, 0.18], WOOD, [0, 1.93, 0.05], undefined, "roof-ridge");
  box([2.55, 0.12, 0.28], SNOW, [0, 1.84, -0.53], [0, 0, 0], "roof-snow-front");
  box([2.25, 0.12, 0.24], SNOW, [0, 1.91, 0.52], undefined, "roof-snow-back");

  // Front door, frame, handle and small porch.
  box([0.58, 1.08, 0.07], CABIN_DARK, [0, 0.87, 0.88], undefined, "door");
  box([0.68, 1.17, 0.09], WOOD_LIGHT, [0, 0.9, 0.91], undefined, "door-frame");
  box([0.43, 0.34, 0.018], GLASS_DARK, [0, 1.22, 0.958], undefined, "door-window");
  box([0.04, 0.04, 0.025], TRIM, [0.2, 0.83, 0.98], undefined, "door-handle");
  box([0.86, 0.1, 0.44], WOOD, [0, 0.32, 1.2], undefined, "porch-step");
  rod([-0.5, 0.43, 1.24], [-0.5, 0.88, 1.24], 0.025, METAL, "porch-post-L");
  rod([0.5, 0.43, 1.24], [0.5, 0.88, 1.24], 0.025, METAL, "porch-post-R");
  rod([-0.5, 0.88, 1.24], [0.5, 0.88, 1.24], 0.025, METAL, "porch-rail");

  // Cabin front windows and cross mullions.
  for (const x of [-0.78, 0.78]) {
    box([0.58, 0.58, 0.055], WOOD, [x, 1.08, 0.865], undefined, "front-window-frame");
    box([0.46, 0.46, 0.018], GLASS, [x, 1.08, 0.902], undefined, "front-window-glass");
    box([0.035, 0.47, 0.025], TRIM, [x, 1.08, 0.925], undefined, "window-mullion-v");
    box([0.47, 0.035, 0.025], TRIM, [x, 1.08, 0.926], undefined, "window-mullion-h");
  }

  // Side windows facing the viewer's left.
  box([0.055, 0.62, 0.82], WOOD, [-1.235, 1.02, -0.2], undefined, "side-window-frame");
  box([0.018, 0.48, 0.65], GLASS, [-1.27, 1.02, -0.2], undefined, "side-window-glass");
  box([0.025, 0.5, 0.035], TRIM, [-1.29, 1.02, -0.2], undefined, "side-mullion-v");
  box([0.025, 0.035, 0.68], TRIM, [-1.29, 1.02, -0.2], undefined, "side-mullion-h");

  // Glowing-looking interior panes as inset decals.
  for (const x of [-0.78, 0.78]) {
    b.part(new THREE.PlaneGeometry(0.39, 0.39), WHITE, {
      at: [x, 1.08, 0.934],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      flat: true,
      name: "warm-window-pane",
      group: "outpost",
    });
  }

  // Research emblem and warning placard.
  b.part(new THREE.PlaneGeometry(0.32, 0.32), WHITE, {
    at: [-0.92, 0.53, 0.94],
    dir: [0, 0, 1],
    axis: "z",
    texture: logoTexture,
    name: "station-emblem",
    group: "outpost",
  });
  b.part(new THREE.PlaneGeometry(0.74, 0.37), WHITE, {
    at: [1.28, 0.62, 0.91],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "ice-warning-sign",
    group: "outpost",
  });

  // Chimney and exhaust cap.
  cyl(0.1, 0.64, METAL_DARK, [0.7, 2.18, -0.32], 8, undefined, "chimney");
  box([0.28, 0.08, 0.28], METAL, [0.7, 2.49, -0.32], undefined, "chimney-cap");
  rod([0.56, 2.53, -0.32], [0.84, 2.53, -0.32], 0.018, METAL_DARK, "chimney-cap-bar");

  // Rear utility annex and fuel drums.
  box([0.9, 0.72, 0.7], METAL_DARK, [1.62, 0.57, -0.28], undefined, "utility-shed");
  box([0.98, 0.08, 0.78], SNOW, [1.62, 0.96, -0.28], undefined, "utility-shed-snow");
  for (const z of [-0.62, -0.28, 0.06]) {
    cyl(0.17, 0.34, ORANGE, [2.18, 0.36, z], 10, [Math.PI / 2, 0, 0], "fuel-drum");
    cyl(0.08, 0.015, BLACK, [2.18, 0.36, z + 0.18], 8, [Math.PI / 2, 0, 0], "fuel-drum-cap");
  }

  // Solar array on the right: two chunky framed panels with graphic cells.
  rod([1.0, 0.36, 1.56], [1.0, 1.18, 1.56], 0.035, METAL_DARK, "solar-support");
  rod([1.0, 1.16, 1.56], [2.05, 1.5, 1.56], 0.035, METAL_DARK, "solar-tilt-bar");
  for (const x of [1.42, 1.92]) {
    box([0.42, 0.055, 0.72], METAL_DARK, [x, 1.34 + (x - 1.42) * 0.31, 1.57], [0, 0, -17], "solar-panel-frame");
    box([0.35, 0.018, 0.62], SKY_BLUE, [x, 1.38 + (x - 1.42) * 0.31, 1.58], [0, 0, -17], "solar-panel");
    for (const xx of [-0.1, 0, 0.1]) {
      box([0.012, 0.024, 0.58], GLASS, [x + xx, 1.38 + (x - 1.42) * 0.31, 1.595], [0, 0, -17], "solar-cell-line");
    }
    for (const yy of [-0.18, 0, 0.18]) {
      box([0.34, 0.024, 0.012], GLASS, [x, 1.38 + (x - 1.42) * 0.31 + yy, 1.6], [0, 0, -17], "solar-cell-line");
    }
  }

  // Tall radio mast with triangular guy wires.
  rod([-0.62, 1.2, -0.4], [-0.62, 3.15, -0.4], 0.035, METAL_DARK, "radio-mast");
  rod([-0.73, 1.2, -0.4], [-0.62, 3.15, -0.4], 0.018, METAL, "mast-brace-L");
  rod([-0.51, 1.2, -0.4], [-0.62, 3.15, -0.4], 0.018, METAL, "mast-brace-R");
  rod([-0.62, 2.16, -0.4], [-1.42, 0.25, -1.28], 0.012, METAL, "guy-wire-front");
  rod([-0.62, 2.16, -0.4], [0.18, 0.25, -1.28], 0.012, METAL, "guy-wire-front-right");
  rod([-0.62, 2.65, -0.4], [-1.75, 0.25, 0.42], 0.012, METAL, "guy-wire-back");
  rod([-0.62, 2.65, -0.4], [0.25, 0.25, 0.55], 0.012, METAL, "guy-wire-back-right");
  cyl(0.11, 0.055, RED, [-0.62, 3.17, -0.4], 10, undefined, "mast-beacon");
  rod([-0.62, 3.18, -0.4], [-0.62, 3.34, -0.4], 0.012, METAL_DARK, "mast-tip");
  for (const y of [1.76, 2.32, 2.88]) {
    rod([-0.84, y, -0.4], [-0.4, y, -0.4], 0.018, METAL, "mast-crossbar");
  }

  // Small wind turbine on the left.
  rod([-2.05, 0.3, 0.62], [-2.05, 2.05, 0.62], 0.045, METAL_DARK, "wind-turbine-tower");
  box([0.22, 0.18, 0.22], METAL, [-2.05, 2.13, 0.62], undefined, "turbine-nacelle");
  cyl(0.065, 0.12, WHITE, [-2.05, 2.13, 0.76], 8, [Math.PI / 2, 0, 0], "turbine-hub");
  const hub: [number, number, number] = [-2.05, 2.13, 0.84];
  for (const [x, y] of [
    [-2.05, 2.75],
    [-2.55, 2.35],
    [-1.55, 2.35],
  ] as [number, number][]) {
    rod(hub, [x, y, 0.84], 0.045, WHITE, "turbine-blade");
  }
  sphere(0.09, RED, hub, "turbine-hub-cap");

  // Crates, radio case, and orange equipment by the porch.
  box([0.48, 0.4, 0.42], WOOD, [-1.58, 0.37, 1.07], undefined, "supply-crate");
  box([0.52, 0.05, 0.46], WOOD_LIGHT, [-1.58, 0.59, 1.07], undefined, "crate-lid");
  for (const x of [-1.72, -1.44]) {
    rod([x, 0.18, 0.84], [x, 0.57, 0.84], 0.018, CABIN_DARK, "crate-slats");
  }
  box([0.44, 0.33, 0.3], METAL_DARK, [-1.05, 0.34, 1.2], undefined, "radio-case");
  box([0.25, 0.14, 0.018], GLASS, [-1.05, 0.43, 1.36], undefined, "radio-display");
  for (const x of [-1.13, -1.05, -0.97]) {
    cyl(0.025, 0.03, ORANGE, [x, 0.34, 1.36], 6, [Math.PI / 2, 0, 0], "radio-knob");
  }

  // Snowmobile parked at the front-left.
  box([0.58, 0.3, 1.02], RED, [-1.48, 0.43, -0.55], [0, 0, 0], "snowmobile-body");
  box([0.4, 0.18, 0.42], CABIN_DARK, [-1.48, 0.68, -0.4], [0, 0, 0], "snowmobile-seat");
  rod([-1.68, 0.24, -1.0], [-1.68, 0.24, -0.16], 0.055, WHITE, "snowmobile-left-ski");
  rod([-1.28, 0.24, -1.0], [-1.28, 0.24, -0.16], 0.055, WHITE, "snowmobile-right-ski");
  rod([-1.68, 0.47, -0.85], [-1.48, 0.78, -0.55], 0.025, METAL_DARK, "snowmobile-handle-L");
  rod([-1.28, 0.47, -0.85], [-1.48, 0.78, -0.55], 0.025, METAL_DARK, "snowmobile-handle-R");
  cyl(0.16, 0.08, BLACK, [-1.48, 0.43, -0.13], 10, [Math.PI / 2, 0, 0], "snowmobile-track");

  // Boundary posts and ropes around the station.
  for (const [x, z] of [
    [-2.45, 1.25],
    [-2.45, -1.45],
    [2.42, 1.28],
    [2.42, -1.48],
  ] as [number, number][]) {
    cyl(0.045, 0.58, WOOD, [x, 0.39, z], 6, undefined, "boundary-post");
    sphere(0.07, SNOW, [x, 0.7, z], "post-snow-cap");
  }
  rod([-2.45, 0.61, 1.25], [0, 0.61, 1.25], 0.012, ORANGE, "boundary-rope");
  rod([0, 0.61, 1.25], [2.42, 0.61, 1.28], 0.012, ORANGE, "boundary-rope");
  rod([-2.45, 0.61, -1.45], [0, 0.61, -1.45], 0.012, ORANGE, "boundary-rope");
  rod([0, 0.61, -1.45], [2.42, 0.61, -1.48], 0.012, ORANGE, "boundary-rope");

  // Two bright expedition flags.
  rod([-2.35, 0.65, -1.2], [-2.35, 1.5, -1.2], 0.018, METAL_DARK, "flagpole");
  b.part(new THREE.PlaneGeometry(0.42, 0.24), RED, {
    at: [-2.13, 1.38, -1.2],
    dir: [1, 0, 0],
    axis: "z",
    rotation: [0, Math.PI / 2, 0],
    name: "red-expedition-flag",
    group: "outpost",
  });
  rod([1.95, 0.62, 1.2], [1.95, 1.45, 1.2], 0.018, METAL_DARK, "flagpole");
  b.part(new THREE.PlaneGeometry(0.42, 0.24), TRIM, {
    at: [2.16, 1.34, 1.2],
    dir: [1, 0, 0],
    axis: "z",
    rotation: [0, Math.PI / 2, 0],
    name: "yellow-expedition-flag",
    group: "outpost",
  });

  // A dark graphic plaque in the snow, giving the diorama a Firewatch-like composition.
  b.part(new THREE.PlaneGeometry(1.2, 0.6), WHITE, {
    at: [0.2, 0.19, -1.62],
    dir: [0, 1, 0],
    axis: "z",
    texture: auroraTexture,
    name: "snow-aurora-plaque",
    group: "outpost",
  });

  // A few angular snow chunks soften the hard construction while retaining the flat-colour style.
  for (const [x, y, z, s] of [
    [-2.6, 0.22, 0.25, 0.27],
    [2.48, 0.2, 0.45, 0.23],
    [1.15, 0.18, -1.62, 0.22],
    [-0.62, 0.18, -1.8, 0.3],
    [2.15, 0.18, -0.1, 0.18],
  ] as [number, number, number, number][]) {
    part(new THREE.DodecahedronGeometry(s, 0), SNOW_BLUE, [x, y, z], undefined, "snow-chunk");
  }

  return b.root;
}
