```ts
import * as THREE from "three";
import { createBuilder, mottle, paint, svg } from "agentic-3js-builder";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw concrete brutalist social-housing block with stepped massing, deep window bays, projecting balconies, heavy parapets, service towers, vents, and weathered concrete surfaces.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#858783", "#626563", { size: 0.42, contrast: 1.5, seed: 18 });
  const LIGHT_CONCRETE = mottle("#aaa9a2", "#777b78", { size: 0.3, contrast: 1.25, seed: 31 });
  const DARK_CONCRETE = mottle("#666a68", "#404544", { size: 0.28, contrast: 1.35, seed: 44 });
  const SHADOW = "#202728";
  const WINDOW = "#101c20";
  const WINDOW_BLUE = "#1e3035";
  const FRAME = "#454d4c";
  const RUST = "#814c35";
  const INTERIOR = "#0a1011";
  const PLANT = "#33443d";

  const windowTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96">
      <rect width="64" height="96" fill="#10191c"/>
      <rect x="4" y="4" width="56" height="88" fill="#1d3035"/>
      <path d="M32 4v88M4 48h56" stroke="#11191b" stroke-width="4"/>
      <path d="M8 8h48M8 52h48" stroke="#668083" stroke-width="1.5" opacity=".38"/>
      <path d="M9 12v28M37 56v27" stroke="#9cb0ad" stroke-width="2" opacity=".18"/>
    </svg>`,
    { size: 128 },
  );

  const ventTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
      <rect width="80" height="80" fill="#282f2e"/>
      <g stroke="#0b1111" stroke-width="5">
        <path d="M8 12h64M8 28h64M8 44h64M8 60h64"/>
      </g>
    </svg>`,
    { size: 64, pixelated: true },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    options: Record<string, any> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      ...options,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    segments = 8,
    options: Record<string, any> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      flat: true,
      ...options,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
  ) => b.rod(a, c, radius, { color, section: { ngon: 6 }, caps: "flat" });

  // Main stepped concrete mass, deliberately asymmetrical like a postwar housing estate.
  box([8.8, 3.8, 3.2], [0, 1.9, 0], CONCRETE);
  box([7.9, 2.7, 3.0], [0.35, 5.15, 0.02], CONCRETE);
  box([6.9, 2.3, 2.8], [-0.35, 7.65, 0.08], DARK_CONCRETE);
  box([5.5, 1.8, 2.4], [0.45, 9.7, 0.05], LIGHT_CONCRETE);

  // Heavy side buttresses and projecting end walls.
  for (const s of [-1, 1]) {
    box([0.58, 9.0, 3.75], [s * 4.35, 4.45, -0.02], DARK_CONCRETE);
    box([0.85, 4.2, 4.05], [s * 4.42, 1.95, 0.02], CONCRETE);
    box([0.72, 2.9, 3.65], [s * 4.05, 6.0, 0.03], LIGHT_CONCRETE);
    box([0.64, 2.1, 3.45], [s * 3.7, 8.45, 0.04], CONCRETE);
  }

  // Horizontal floor bands and crude cast-in-place seams.
  for (const y of [0.15, 3.85, 6.55, 8.82, 10.6]) {
    box([9.15, 0.18, 3.48], [0, y, 0.02], LIGHT_CONCRETE);
  }
  for (const x of [-3.45, -1.15, 1.15, 3.45]) {
    box([0.07, 9.2, 0.035], [x, 4.55, 1.615], DARK_CONCRETE);
  }

  // Deep-set front windows arranged as irregular housing modules.
  const frontRows = [
    { y: 1.35, xs: [-3.35, -1.8, -0.25, 1.35, 2.9], w: 1.05, h: 1.45 },
    { y: 4.7, xs: [-3.45, -1.7, 0.05, 1.82, 3.35], w: 1.18, h: 1.42 },
    { y: 7.18, xs: [-2.95, -1.0, 1.0, 2.95], w: 1.28, h: 1.38 },
    { y: 9.48, xs: [-2.15, 0.0, 2.15], w: 1.42, h: 1.15 },
  ];

  for (const row of frontRows) {
    for (const x of row.xs) {
      // recessed black cavity, concrete lintel, sill and side reveals
      box([row.w + 0.18, row.h + 0.2, 0.12], [x, row.y, 1.64], INTERIOR);
      box([row.w, row.h, 0.035], [x, row.y, 1.735], WINDOW_BLUE, {
        texture: windowTexture,
      });
      box([row.w + 0.18, 0.16, 0.32], [x, row.y + row.h / 2 + 0.1, 1.61], LIGHT_CONCRETE);
      box([row.w + 0.18, 0.14, 0.36], [x, row.y - row.h / 2 - 0.09, 1.61], DARK_CONCRETE);
      box([0.13, row.h + 0.18, 0.3], [x - row.w / 2 - 0.07, row.y, 1.61], DARK_CONCRETE);
      box([0.13, row.h + 0.18, 0.3], [x + row.w / 2 + 0.07, row.y, 1.61], DARK_CONCRETE);
      box([0.035, row.h, 0.03], [x, row.y, 1.765], FRAME);
      box([row.w, 0.035, 0.03], [x, row.y, 1.765], FRAME);
    }
  }

  // Side elevation windows: narrow slots cut into the end walls.
  for (const side of [-1, 1]) {
    for (const y of [1.35, 4.7, 7.2]) {
      for (const z of [-1.12, -0.15, 0.82]) {
        box([0.04, 1.18, 0.58], [side * 4.73, y, z], WINDOW);
        box([0.04, 1.02, 0.46], [side * 4.76, y, z], WINDOW_BLUE, {
          texture: windowTexture,
        });
      }
    }
  }

  // Balconies: large slabs, dark undersides, parapets and chunky concrete dividers.
  const balconies = [
    [-2.9, 2.45, 1.05],
    [0.1, 5.82, 0.95],
    [2.8, 5.82, 0.95],
    [-1.55, 8.25, 0.86],
    [1.75, 8.25, 0.86],
  ] as const;

  for (const [x, y, depth] of balconies) {
    box([2.25, 0.18, depth], [x, y, 2.03], LIGHT_CONCRETE);
    box([2.18, 0.11, depth + 0.08], [x, y - 0.13, 2.02], DARK_CONCRETE);
    box([2.25, 0.72, 0.15], [x, y + 0.42, 2.03], CONCRETE);
    box([0.16, 0.72, depth], [x - 1.05, y + 0.42, 2.03], CONCRETE);
    box([0.16, 0.72, depth], [x + 1.05, y + 0.42, 2.03], CONCRETE);

    for (const gx of [-0.78, -0.39, 0, 0.39, 0.78]) {
      rod([x + gx, y - 0.02, 2.03 - depth / 2], [x + gx, y + 0.58, 2.03 - depth / 2], 0.018, FRAME);
      rod([x + gx, y - 0.02, 2.03 + depth / 2], [x + gx, y + 0.58, 2.03 + depth / 2], 0.018, FRAME);
    }
    rod([x - 1.0, y + 0.58, 2.03 - depth / 2], [x + 1.0, y + 0.58, 2.03 - depth / 2], 0.026, FRAME);
    rod([x - 1.0, y + 0.58, 2.03 + depth / 2], [x + 1.0, y + 0.58, 2.03 + depth / 2], 0.026, FRAME);
    rod([x - 1.0, y + 0.58, 2.03 - depth / 2], [x - 1.0, y + 0.58, 2.03 + depth / 2], 0.026, FRAME);
    rod([x + 1.0, y + 0.58, 2.03 - depth / 2], [x + 1.0, y + 0.58, 2.03 + depth / 2], 0.026, FRAME);
  }

  // Ground-level pilotis and recessed communal entrance.
  for (const x of [-3.25, -1.65, 1.65, 3.25]) {
    box([0.5, 3.75, 0.58], [x, 1.88, 1.05], CONCRETE);
  }
  box([2.35, 2.65, 0.09], [0, 1.34, 1.665], SHADOW);
  box([2.05, 2.32, 0.025], [0, 1.36, 1.715], WINDOW, { texture: windowTexture });
  box([2.5, 0.22, 0.32], [0, 2.7, 1.58], LIGHT_CONCRETE);
  box([0.22, 2.6, 0.35], [-1.16, 1.35, 1.59], DARK_CONCRETE);
  box([0.22, 2.6, 0.35], [1.16, 1.35, 1.59], DARK_CONCRETE);

  // Entrance canopy and a brutalist concrete stair/ramp wedge.
  box([3.15, 0.24, 1.55], [0, 3.05, 1.15], DARK_CONCRETE);
  box([3.55, 0.22, 1.9], [0, 0.12, 1.16], LIGHT_CONCRETE);
  for (let i = 0; i < 7; i++) {
    box([2.6 - i * 0.18, 0.14, 0.75], [0, 0.24 + i * 0.18, 0.94], CONCRETE);
  }

  // Roof parapets, stepped terraces, and a projecting mechanical penthouse.
  box([8.95, 0.48, 3.45], [0, 10.95, 0], DARK_CONCRETE);
  box([7.15, 0.34, 2.7], [-0.25, 11.33, 0.1], CONCRETE);
  box([3.1, 2.0, 1.65], [1.35, 12.28, -0.2], DARK_CONCRETE);
  box([3.45, 0.18, 1.9], [1.35, 13.3, -0.2], LIGHT_CONCRETE);
  box([1.85, 1.1, 0.14], [1.35, 13.8, -0.2], CONCRETE);

  // Stair tower slit windows.
  for (const z of [-0.75, -0.22, 0.31, 0.84]) {
    box([0.85, 0.7, 0.035], [1.35, 12.25, z], WINDOW);
    box([0.66, 0.5, 0.02], [1.35, 12.25, z + 0.025], WINDOW_BLUE, {
      texture: windowTexture,
    });
  }

  // Rooftop ventilation stacks and squat exhaust caps.
  for (const [x, z, r, h] of [
    [-2.65, -0.75, 0.24, 0.8],
    [-2.0, -0.75, 0.18, 1.15],
    [2.75, 0.65, 0.2, 0.9],
    [3.25, 0.65, 0.14, 0.65],
  ] as const) {
    cylinder(r, h, [x, 11.6 + h / 2, z], DARK_CONCRETE, 8);
    cylinder(r + 0.08, 0.12, [x, 11.6 + h, z], LIGHT_CONCRETE, 8);
    cylinder(r * 0.67, 0.03, [x, 11.68 + h, z], SHADOW, 8);
  }

  // Repeated service vents below the balconies.
  for (const x of [-3.5, -2.5, 2.55, 3.55]) {
    box([0.62, 0.42, 0.04], [x, 0.52, 1.63], FRAME, { texture: ventTexture });
    box([0.62, 0.08, 0.13], [x, 0.79, 1.57], LIGHT_CONCRETE);
  }

  // A few oversized rusted fire-escape brackets and facade stains.
  for (const x of [-3.78, 3.78]) {
    for (const y of [2.7, 5.95, 8.35]) {
      box([0.08, 0.75, 0.14], [x, y, 1.78], RUST);
      cylinder(0.07, 0.16, [x, y - 0.38, 1.78], RUST, 6, { dir: [1, 0, 0] });
    }
  }

  // Small brutalist planters on balconies: plain, heavy, and sparsely planted.
  for (const [x, y, z] of [
    [-3.55, 2.48, 1.9],
    [-1.15, 5.85, 1.88],
    [3.62, 5.85, 1.88],
    [0.05, 8.28, 1.82],
  ] as const) {
    box([0.45, 0.34, 0.35], [x, y, z], DARK_CONCRETE);
    cylinder(0.12, 0.42, [x, y + 0.24, z], PLANT, 6);
    cylinder(0.06, 0.55, [x - 0.08, y + 0.43, z + 0.02], PLANT, 5);
    cylinder(0.055, 0.48, [x + 0.1, y + 0.38, z - 0.02], PLANT, 5);
  }

  // Cast-in-place tie holes: tiny dark dots in disciplined rows.
  for (const y of [2.9, 5.7, 8.55, 10.55]) {
    for (const x of [-3.95, -2.65, -1.35, 0, 1.35, 2.65, 3.95]) {
      cylinder(0.027, 0.018, [x, y, 1.76], SHADOW, 8, { dir: [0, 0, 1] });
    }
  }

  return b.root;
}
```