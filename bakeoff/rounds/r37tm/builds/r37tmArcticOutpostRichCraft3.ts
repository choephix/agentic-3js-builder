import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";

export const meta = {
  name: "arctic-research-outpost",
  description: "A stylized Firewatch-inspired arctic research outpost with a snow island, cabin, radio mast, solar array, dish, supplies, and warm graphic details.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#eaf4f4";
  const SNOW_SHADOW = "#b9d4dc";
  const ICE = "#8fc8d8";
  const SKY_BLUE = "#3e7894";
  const DEEP_BLUE = "#183d59";
  const NAVY = "#102c43";
  const WOOD = "#8a583e";
  const WOOD_DARK = "#51382f";
  const WOOD_LIGHT = "#b9784d";
  const ROOF = "#263d50";
  const ROOF_LIGHT = "#3d6071";
  const ORANGE = "#df6b3f";
  const ORANGE_DARK = "#8d392e";
  const YELLOW = "#f3bd55";
  const CREAM = "#fff1c2";
  const METAL = "#6f8790";
  const METAL_DARK = "#344f5e";
  const BLACK = "#172632";
  const GLASS = "#83c9d2";
  const RED = "#c7473d";
  const GREEN = "#607d68";

  const windowTex = svg(
    `<svg viewBox="0 0 128 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="96" fill="#17384d"/>
      <rect x="8" y="8" width="112" height="80" fill="#83c9d2"/>
      <path d="M8 68 Q42 43 70 57 T120 43 V88 H8Z" fill="#4d96aa"/>
      <path d="M8 73 Q40 54 72 65 T120 52 V88 H8Z" fill="#b8e3e1"/>
      <circle cx="93" cy="25" r="10" fill="#fff1c2"/>
      <path d="M9 10H119V87H9Z" fill="none" stroke="#fff1c2" stroke-width="5"/>
      <path d="M64 9V88M9 48H119" stroke="#fff1c2" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const signTex = svg(
    `<svg viewBox="0 0 256 96" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="96" rx="8" fill="#172632"/>
      <path d="M16 78 L35 20 L54 78" fill="none" stroke="#df6b3f" stroke-width="8"/>
      <path d="M27 55 H48" stroke="#df6b3f" stroke-width="8"/>
      <text x="69" y="60" font-family="sans-serif" font-weight="bold" font-size="29" letter-spacing="2" fill="#fff1c2">NORTH 12</text>
    </svg>`,
    { size: 512 },
  );

  const warningTex = svg(
    `<svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path d="M64 8 L120 112 H8 Z" fill="#f3bd55" stroke="#172632" stroke-width="8"/>
      <path d="M64 34V76" stroke="#172632" stroke-width="11" stroke-linecap="round"/>
      <circle cx="64" cy="94" r="7" fill="#172632"/>
    </svg>`,
    { size: 256 },
  );

  const solarTex = svg(
    `<svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#183d59"/>
      <g stroke="#8fc8d8" stroke-width="2" opacity=".75">
        <path d="M40 0V100M80 0V100M120 0V100"/>
        <path d="M0 25H160M0 50H160M0 75H160"/>
      </g>
      <path d="M4 4H156V96H4Z" fill="none" stroke="#d5eef0" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const mapTex = svg(
    `<svg viewBox="0 0 256 160" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="160" fill="#ead6a5"/>
      <path d="M12 118 Q50 70 88 102 T165 55 T246 74" fill="none" stroke="#789b7f" stroke-width="7"/>
      <path d="M16 30 Q75 45 104 22 T236 32" fill="none" stroke="#bb8b65" stroke-width="4"/>
      <path d="M24 140 L65 95 L105 124 L150 80 L215 112" fill="none" stroke="#486f75" stroke-width="3"/>
      <circle cx="178" cy="91" r="8" fill="#df6b3f"/>
      <path d="M178 72V110M159 91H197" stroke="#df6b3f" stroke-width="3"/>
      <text x="17" y="22" font-family="sans-serif" font-size="15" font-weight="bold" fill="#263d50">FIELD SECTOR 04</text>
    </svg>`,
    { size: 512 },
  );

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) {
    return b.part(geometry, color, {
      at,
      flat: true,
      ...options,
    });
  }

  function box(
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    options: Record<string, unknown> = {},
  ) {
    return part(new THREE.BoxGeometry(...size), color, at, { rotation, ...options });
  }

  function cylinder(
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    radial = 10,
  ) {
    return part(new THREE.CylinderGeometry(radius, radius, height, radial), color, at, { rotation });
  }

  function snowCap(x: number, z: number, sx: number, sy: number, sz: number) {
    const p = part(new THREE.SphereGeometry(1, 8, 5), SNOW, [x, sy, z]);
    p.scale.set(sx, sy, sz);
    return p;
  }

  // Snow island and faceted ice shelves.
  cylinder(3.9, 0.22, SNOW_SHADOW, [0, 0.11, 0], [0, 0, 0], 12);
  cylinder(3.55, 0.12, SNOW, [0, 0.25, 0], [0, 0, 0], 12);

  const iceRocks: Array<[number, number, number, number, number, number]> = [
    [-3.0, 0.36, -1.8, 0.62, 0.28, 0.5],
    [2.9, 0.33, -1.55, 0.55, 0.26, 0.38],
    [-2.8, 0.31, 1.6, 0.75, 0.22, 0.42],
    [2.95, 0.3, 1.45, 0.52, 0.22, 0.44],
    [-1.8, 0.3, -2.75, 0.55, 0.2, 0.3],
    [1.55, 0.3, -2.8, 0.72, 0.2, 0.34],
  ];
  for (const [x, y, z, sx, sy, sz] of iceRocks) {
    const r = part(new THREE.DodecahedronGeometry(1, 0), ICE, [x, y, z]);
    r.scale.set(sx, sy, sz);
    snowCap(x, z, sx * 0.65, sy * 0.45, sz * 0.7);
  }

  // Cabin body.
  box([3.55, 1.75, 2.35], WOOD, [0, 1.18, 0.15]);
  box([3.62, 0.16, 2.42], WOOD_DARK, [0, 0.36, 0.15]);
  box([3.62, 0.12, 2.42], WOOD_LIGHT, [0, 1.92, 0.15]);

  // Horizontal plank bands.
  for (const y of [0.62, 0.94, 1.26, 1.58]) {
    box([3.62, 0.035, 2.39], WOOD_DARK, [0, y, 0.15]);
  }
  for (const x of [-1.68, 1.68]) {
    box([0.09, 1.72, 2.43], WOOD_DARK, [x, 1.19, 0.15]);
  }

  // Gabled roof and snow ridge.
  const roofOutline: [number, number, "sharp"][] = [
    [-2.15, 0, "sharp"],
    [2.15, 0, "sharp"],
    [1.72, 0.54, "sharp"],
    [0, 1.12, "sharp"],
    [-1.72, 0.54, "sharp"],
  ];
  b.extrude(roofOutline, {
    at: [0, 1.9, 0.15],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 2.62,
    bevel: 0.035,
    color: ROOF,
    flat: true,
  });
  box([0.35, 0.16, 2.7], SNOW, [0, 3.02, 0.15], [0, 0, 0]);
  box([3.9, 0.1, 0.12], SNOW_SHADOW, [0, 1.94, 1.43]);
  box([3.9, 0.1, 0.12], SNOW_SHADOW, [0, 1.94, -1.13]);

  // Front door, door frame, handle, and sign.
  box([0.78, 1.45, 0.08], WOOD_DARK, [0.78, 1.12, 1.36]);
  box([0.65, 1.32, 0.045], WOOD_LIGHT, [0.78, 1.13, 1.405]);
  box([0.76, 0.08, 0.08], WOOD_DARK, [0.78, 1.78, 1.45]);
  box([0.08, 1.5, 0.08], WOOD_DARK, [0.37, 1.12, 1.43]);
  box([0.08, 1.5, 0.08], WOOD_DARK, [1.19, 1.12, 1.43]);
  cylinder(0.045, 0.03, YELLOW, [1.02, 1.12, 1.46], [90, 0, 0], 8);
  part(new THREE.PlaneGeometry(1.55, 0.58), CREAM, [0, 2.05, 1.39], {
    dir: [0, 0, 1],
    axis: "z",
    texture: signTex,
  });

  // Front windows.
  for (const x of [-1.12, 1.52]) {
    box([0.86, 0.09, 0.98], WOOD_DARK, [x, 1.35, 1.37]);
    part(new THREE.PlaneGeometry(0.68, 0.76), "#ffffff", [x, 1.37, 1.43], {
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTex,
    });
    box([0.055, 0.86, 0.08], WOOD_DARK, [x, 1.37, 1.48]);
    box([0.78, 0.055, 0.08], WOOD_DARK, [x, 1.37, 1.48]);
  }

  // Side window and exterior red equipment cabinet.
  box([1.0, 0.09, 0.82], WOOD_DARK, [-1.82, 1.28, -0.25], [0, 90, 0]);
  part(new THREE.PlaneGeometry(0.72, 0.62), "#ffffff", [-1.88, 1.28, -0.25], {
    dir: [1, 0, 0],
    axis: "z",
    texture: windowTex,
  });
  box([0.52, 0.78, 0.28], RED, [2.02, 0.83, 0.72]);
  box([0.42, 0.12, 0.03], YELLOW, [2.02, 1.0, 0.87]);
  cylinder(0.035, 0.04, BLACK, [2.02, 0.82, 0.88], [90, 0, 0], 8);

  // Chimney, vent cap, and warm beacon.
  box([0.28, 0.72, 0.28], METAL_DARK, [-0.78, 3.28, -0.3]);
  cylinder(0.23, 0.08, METAL, [-0.78, 3.67, -0.3], [0, 0, 0], 10);
  cylinder(0.1, 0.05, ORANGE, [-0.78, 3.73, -0.3], [0, 0, 0], 8);

  // Rear radio mast.
  cylinder(0.07, 3.35, METAL_DARK, [0, 2.25, -1.18], [0, 0, 0], 8);
  cylinder(0.11, 0.12, METAL, [0, 0.52, -1.18], [0, 0, 0], 8);
  for (const y of [1.15, 1.85, 2.55, 3.25]) {
    box([1.16, 0.045, 0.045], METAL, [0, y, -1.18]);
    box([0.045, 0.045, 0.92], METAL, [0, y, -1.18]);
  }
  cylinder(0.04, 0.85, METAL, [0, 4.0, -1.18], [0, 0, 0], 8);
  cylinder(0.095, 0.08, RED, [0, 4.46, -1.18], [0, 0, 0], 8);

  // Guy wires.
  for (const [x, z] of [
    [-1.05, -0.45],
    [1.05, -0.45],
    [-1.0, -2.05],
    [1.0, -2.05],
  ] as Array<[number, number]>) {
    b.rod([0, 3.65, -1.18], [x, 0.38, z], 0.012, { color: METAL });
    cylinder(0.1, 0.09, METAL_DARK, [x, 0.36, z], [0, 0, 0], 8);
  }

  // Satellite dish on a short rear platform.
  box([1.2, 0.12, 0.9], WOOD_DARK, [1.55, 2.68, -0.82]);
  cylinder(0.09, 0.8, METAL_DARK, [1.55, 3.08, -0.82]);
  const dish = part(new THREE.ConeGeometry(0.58, 0.22, 12, 1, true), METAL, [1.55, 3.48, -0.82], {
    rotation: [-58, 0, 0],
  });
  cylinder(0.035, 0.75, METAL_DARK, [1.55, 3.72, -0.58], [58, 0, 0], 8);
  cylinder(0.075, 0.08, RED, [1.55, 3.93, -0.42], [58, 0, 0], 8);
  void dish;

  // Solar panel rack behind and to the left.
  box([1.8, 0.12, 0.1], METAL_DARK, [-1.48, 0.55, -1.45], [0, 0, -18]);
  box([0.1, 0.75, 1.9], METAL_DARK, [-1.48, 1.14, -1.45], [0, 0, -18]);
  part(new THREE.BoxGeometry(1.52, 0.055, 1.55), DEEP_BLUE, [-1.48, 1.47, -1.45], {
    rotation: [18, 0, -18],
    texture: solarTex,
  });
  for (const x of [-2.13, -1.48, -0.83]) {
    box([0.025, 0.04, 1.42], ICE, [x, 1.47, -1.45], [18, 0, -18]);
  }
  for (const z of [-2.05, -1.45, -0.85]) {
    box([1.45, 0.04, 0.025], ICE, [-1.48, 1.47, z], [18, 0, -18]);
  }

  // Generator shed and fuel cans.
  box([1.1, 0.82, 0.8], ORANGE_DARK, [-2.0, 0.75, -1.02]);
  box([1.18, 0.08, 0.9], SNOW, [-2.0, 1.18, -1.02]);
  box([0.82, 0.42, 0.05], BLACK, [-2.0, 0.72, -1.45]);
  cylinder(0.22, 0.08, METAL, [-2.0, 0.72, -1.5], [90, 0, 0], 12);
  for (const x of [-2.52, -2.3]) {
    box([0.18, 0.45, 0.28], RED, [x, 0.5, -0.2]);
    box([0.11, 0.07, 0.08], YELLOW, [x, 0.75, -0.2]);
  }

  // Crates and stacked expedition supplies.
  const crates: Array<[number, number, number, number, number, number]> = [
    [2.05, 0.5, -0.45, 0.64, 0.42, 0.56],
    [2.48, 0.5, -0.45, 0.5, 0.42, 0.56],
    [2.26, 0.9, -0.45, 0.58, 0.3, 0.5],
    [-2.7, 0.52, 0.35, 0.58, 0.42, 0.5],
    [-2.7, 0.91, 0.35, 0.46, 0.32, 0.4],
    [2.25, 0.52, 1.55, 0.5, 0.42, 0.42],
  ];
  for (const [x, y, z, sx, sy, sz] of crates) {
    box([sx, sy, sz], WOOD_LIGHT, [x, y, z]);
    box([sx + 0.02, 0.045, 0.04], WOOD_DARK, [x, y - sy * 0.12, z + sz / 2 + 0.012]);
    box([0.04, sy + 0.02, 0.04], WOOD_DARK, [x - sx * 0.28, y, z + sz / 2 + 0.012]);
    box([0.04, sy + 0.02, 0.04], WOOD_DARK, [x + sx * 0.28, y, z + sz / 2 + 0.012]);
  }

  // Orange sled beside the building.
  box([1.5, 0.13, 0.52], ORANGE, [-1.2, 0.38, 1.9], [0, 0, -4]);
  box([0.12, 0.3, 1.48], ORANGE_DARK, [-1.83, 0.31, 1.9], [0, 0, -4]);
  box([0.12, 0.3, 1.48], ORANGE_DARK, [-0.57, 0.31, 1.9], [0, 0, -4]);
  for (const x of [-1.78, -1.18, -0.58]) {
    box([0.07, 0.1, 0.6], YELLOW, [x, 0.64, 1.9], [0, 0, -4]);
  }

  // Antenna cases and rooftop instrument boxes.
  box([0.42, 0.38, 0.35], METAL_DARK, [0.7, 2.15, -0.35]);
  box([0.34, 0.06, 0.18], YELLOW, [0.7, 2.36, -0.35]);
  box([0.3, 0.22, 0.28], METAL, [-0.25, 2.21, -0.35]);
  cylinder(0.06, 0.3, RED, [-0.25, 2.48, -0.35]);

  // Warning plaque on the side.
  part(new THREE.PlaneGeometry(0.42, 0.42), "#ffffff", [1.82, 1.52, 0.44], {
    dir: [-1, 0, 0],
    axis: "z",
    texture: warningTex,
  });

  // Snow piles tucked against walls and equipment.
  snowCap(-1.45, 1.34, 0.72, 0.2, 0.25);
  snowCap(1.65, 1.3, 0.58, 0.18, 0.22);
  snowCap(-2.1, -1.42, 0.62, 0.16, 0.3);
  snowCap(2.35, -0.9, 0.5, 0.15, 0.25);

  // Painted trail markers and flag.
  cylinder(0.035, 0.85, WOOD_DARK, [2.82, 0.66, 0.25]);
  box([0.5, 0.3, 0.025], ORANGE, [3.02, 1.0, 0.25], [0, 18, 0]);
  box([0.5, 0.035, 0.04], YELLOW, [3.02, 0.9, 0.25], [0, 18, 0]);

  // A small freestanding field map board.
  box([1.15, 0.08, 0.08], WOOD_DARK, [-2.05, 0.45, 2.55], [0, 0, 0]);
  box([0.08, 1.0, 0.08], WOOD_DARK, [-2.48, 0.9, 2.55]);
  box([0.08, 1.0, 0.08], WOOD_DARK, [-1.62, 0.9, 2.55]);
  box([1.0, 0.76, 0.04], CREAM, [-2.05, 1.1, 2.51]);
  part(new THREE.PlaneGeometry(0.88, 0.62), CREAM, [-2.05, 1.1, 2.54], {
    dir: [0, 0, -1],
    axis: "z",
    texture: mapTex,
  });

  // Compact trail of boot prints leading to the door.
  const prints: Array<[number, number, number, number]> = [
    [0.25, 0.285, 2.55, -12],
    [-0.08, 0.286, 2.25, 12],
    [0.2, 0.287, 1.95, -10],
    [-0.1, 0.288, 1.66, 10],
    [0.17, 0.289, 1.42, -8],
  ];
  for (const [x, y, z, rz] of prints) {
    box([0.14, 0.018, 0.3], SNOW_SHADOW, [x, y, z], [0, 0, rz]);
  }

  // Small blue ice shards around the island edge.
  for (const [x, z, r, h] of [
    [-3.2, 0.5, 0.14, 0.42],
    [-2.55, -2.2, 0.11, 0.3],
    [2.7, 1.95, 0.13, 0.35],
    [3.25, -0.3, 0.12, 0.38],
    [-0.8, -3.05, 0.1, 0.28],
    [0.75, 2.95, 0.12, 0.32],
  ] as Array<[number, number, number, number]>) {
    part(new THREE.ConeGeometry(r, h, 5), ICE, [x, 0.32 + h / 2, z]);
  }

  // A few bold red and yellow graphic accents on the cabin.
  box([0.07, 0.64, 0.07], RED, [-1.48, 1.12, 1.48]);
  box([0.07, 0.64, 0.07], YELLOW, [1.18, 1.12, 1.48]);
  box([0.5, 0.07, 0.07], RED, [0, 0.68, 1.39]);

  return b.root;
}
