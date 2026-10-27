```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "arctic-research-outpost",
  description:
    "A stylized Firewatch-colour diorama of a compact arctic research outpost, with a snow island, warm cabin, solar panels, antenna mast, satellite dish, supply sled, crates, fuel drums, flags, snow drifts, and icy details.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#e9f3f4";
  const SNOW_BLUE = "#b9d9e3";
  const ICE = "#75c9d4";
  const DEEP_ICE = "#397f99";
  const SKY = "#183b59";
  const NAVY = "#102b43";
  const INK = "#091b2c";
  const RED = "#e95b4f";
  const ORANGE = "#f18a45";
  const GOLD = "#f7c85b";
  const WOOD = "#704837";
  const WOOD_LIGHT = "#a9684b";
  const RUST = "#a7433c";
  const STEEL = "#708796";
  const DARK_STEEL = "#354b5b";
  const GLASS = "#8fe0e1";
  const SOLAR = "#263d62";
  const WHITE = "#fff8dc";
  const GREEN = "#4f8a72";
  const PURPLE = "#624d83";

  type V3 = [number, number, number];

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: V3,
    options: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, ...options });

  const box = (
    size: V3,
    color: string,
    at: V3,
    rotation: V3 = [0, 0, 0],
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      { rotation, flat: true, ...options },
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: V3,
    segments = 8,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      { flat: true, ...options },
    );

  const cone = (
    radius: number,
    height: number,
    color: string,
    at: V3,
    segments = 6,
    options: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.ConeGeometry(radius, height, segments),
      color,
      at,
      { flat: true, ...options },
    );

  const rod = (
    a: V3,
    c: V3,
    radius: number,
    color: string,
    options: Record<string, unknown> = {},
  ) => b.rod(a, c, radius, { color, ...options });

  const snowCap = (x: number, z: number, w: number, d: number, y: number) => {
    box([w, 0.09, d], SNOW, [x, y, z], [0, 0, 0]);
    box([w * 0.78, 0.07, d * 0.8], SNOW, [x, y + 0.07, z], [0, 0, 0]);
  };

  const rivets = (
    x0: number,
    x1: number,
    y: number,
    z: number,
    color = GOLD,
    count = 5,
  ) => {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      cylinder(0.028, 0.025, color, [x0 + (x1 - x0) * t, y, z], 6, {
        dir: [0, 0, 1],
      });
    }
  };

  const window = (x: number, y: number, z: number, w: number, h: number) => {
    box([w + 0.12, h + 0.12, 0.08], INK, [x, y, z]);
    box([w, h, 0.035], GLASS, [x, y, z + 0.047]);
    box([0.035, h, 0.05], ORANGE, [x, y, z + 0.075]);
    box([w, 0.035, 0.05], ORANGE, [x, y, z + 0.075]);
    box([0.025, h, 0.055], NAVY, [x, y, z + 0.087]);
    box([w, 0.025, 0.055], NAVY, [x, y, z + 0.087]);
  };

  const solarPanel = (x: number, y: number, z: number, side: number) => {
    const angle = side > 0 ? -22 : 22;
    box([1.35, 0.055, 0.72], SOLAR, [x, y, z], [angle, 0, 0]);
    box([1.17, 0.02, 0.56], ICE, [x, y + 0.035, z], [angle, 0, 0]);
    for (const dx of [-0.39, 0, 0.39]) {
      box([0.018, 0.03, 0.56], DEEP_ICE, [x + dx, y + 0.05, z], [angle, 0, 0]);
    }
    for (const dz of [-0.18, 0.18]) {
      box([1.17, 0.03, 0.018], DEEP_ICE, [x, y + 0.05, z + dz], [angle, 0, 0]);
    }
    box([0.06, 1.25, 0.06], DARK_STEEL, [x, y - 0.48, z], [0, 0, 0]);
    box([0.75, 0.05, 0.05], DARK_STEEL, [x, y - 0.88, z], [0, 0, 0]);
  };

  // Snow island and layered low-poly drifts.
  cylinder(4.25, 0.24, SNOW_BLUE, [0, 0.12, 0], 12);
  cylinder(3.92, 0.13, SNOW, [0, 0.29, 0], 12);
  cone(1.25, 0.56, SNOW_BLUE, [-2.8, 0.55, -1.8], 7);
  cone(1.05, 0.42, SNOW, [2.9, 0.47, -1.7], 7);
  cone(0.9, 0.38, SNOW_BLUE, [2.9, 0.43, 1.9], 7);
  cone(0.7, 0.32, SNOW, [-3.3, 0.39, 1.7], 7);
  for (const p of [
    [-2.4, 0.35, 2.5],
    [-1.7, 0.34, 2.8],
    [1.7, 0.34, 2.55],
    [3.35, 0.35, 0.55],
    [-3.5, 0.35, -0.4],
  ] as V3[]) {
    cone(0.35, 0.18, SNOW_BLUE, p, 6);
  }

  // Main cabin: bold orange-red field station with navy shadow planes.
  box([3.45, 2.1, 2.35], RED, [0, 1.48, 0.15]);
  box([3.28, 1.82, 0.07], NAVY, [0, 1.43, 1.34]);
  box([3.42, 0.13, 2.18], NAVY, [0, 0.46, 0.15]);
  box([3.6, 0.16, 2.5], ORANGE, [0, 2.62, 0.15]);

  // Corner posts and horizontal siding.
  for (const x of [-1.58, 1.58]) {
    box([0.16, 2.32, 0.18], ORANGE, [x, 1.52, 1.31]);
    box([0.16, 2.32, 0.18], ORANGE, [x, 1.52, -1.02]);
  }
  for (const y of [0.86, 1.28, 1.7, 2.12]) {
    box([3.25, 0.045, 0.045], GOLD, [0, y, 1.37]);
    box([3.2, 0.04, 0.04], WOOD_LIGHT, [0, y, -1.05]);
  }

  // Pitched roof, thick and graphic.
  box([3.9, 0.2, 1.6], NAVY, [0, 2.88, 0.72], [-24, 0, 0]);
  box([3.9, 0.2, 1.6], NAVY, [0, 2.88, -0.42], [24, 0, 0]);
  box([4.05, 0.12, 0.15], ORANGE, [0, 3.19, 0.15]);
  box([4.0, 0.1, 0.14], GOLD, [0, 2.77, 1.38], [-24, 0, 0]);
  box([4.0, 0.1, 0.14], GOLD, [0, 2.77, -1.08], [24, 0, 0]);

  // Front door and porch.
  box([0.72, 1.52, 0.1], WOOD, [0, 1.25, 1.42]);
  box([0.58, 1.38, 0.035], WOOD_LIGHT, [0, 1.25, 1.49]);
  box([0.09, 0.09, 0.05], GOLD, [0.22, 1.27, 1.53]);
  box([1.12, 0.13, 0.62], NAVY, [0, 0.48, 1.58]);
  box([1.25, 0.12, 0.16], ORANGE, [0, 0.61, 1.58]);
  for (const x of [-0.42, 0, 0.42]) {
    box([0.08, 0.47, 0.08], WOOD_LIGHT, [x, 0.8, 1.58]);
  }

  // Front windows.
  window(-1.05, 1.73, 1.4, 0.72, 0.7);
  window(1.05, 1.73, 1.4, 0.72, 0.7);
  box([0.08, 0.82, 0.04], GOLD, [-1.05, 1.73, 1.48]);
  box([0.08, 0.82, 0.04], GOLD, [1.05, 1.73, 1.48]);

  // Side windows and emergency light.
  window(-1.77, 1.7, 0.25, 0.72, 0.62);
  window(1.77, 1.7, 0.25, 0.72, 0.62);
  cylinder(0.12, 0.12, GOLD, [0, 2.55, 1.48], 8, { dir: [0, 0, 1] });
  cylinder(0.075, 0.13, RED, [0, 2.55, 1.56], 8, { dir: [0, 0, 1] });

  // Snow sitting on the roof edges and window ledges.
  snowCap(0, 3.26, 3.75, 0.24, 0);
  box([0.86, 0.12, 0.18], SNOW, [-1.05, 2.2, 1.48]);
  box([0.86, 0.12, 0.18], SNOW, [1.05, 2.2, 1.48]);
  box([0.82, 0.11, 0.18], SNOW, [-1.77, 2.08, 0.38]);
  box([0.82, 0.11, 0.18], SNOW, [1.77, 2.08, 0.38]);

  // Rear generator shed.
  box([1.4, 1.0, 1.25], NAVY, [2.05, 0.82, -1.65]);
  box([1.52, 0.12, 1.38], RED, [2.05, 1.38, -1.65]);
  box([1.45, 0.1, 0.1], GOLD, [2.05, 1.43, -1.65]);
  box([0.58, 0.72, 0.06], WOOD, [2.05, 0.82, -2.31]);
  box([0.48, 0.6, 0.035], ORANGE, [2.05, 0.82, -2.35]);
  cylinder(0.24, 0.12, STEEL, [1.6, 0.78, -1.02], 10, { dir: [0, 0, 1] });
  cylinder(0.08, 0.16, GOLD, [1.6, 0.78, -0.94], 8, { dir: [0, 0, 1] });
  snowCap(2.05, -1.65, 1.48, 1.35, 1.43);

  // Tall radio mast behind the cabin.
  rod([0, 2.9, -0.45], [0, 5.35, -0.45], 0.045, DARK_STEEL);
  rod([-0.58, 3.0, -0.45], [0, 5.0, -0.45], 0.025, DARK_STEEL);
  rod([0.58, 3.0, -0.45], [0, 5.0, -0.45], 0.025, DARK_STEEL);
  rod([-0.58, 3.0, -0.45], [0.58, 3.0, -0.45], 0.025, DARK_STEEL);
  rod([-0.45, 3.65, -0.45], [0.45, 3.65, -0.45], 0.022, DARK_STEEL);
  rod([-0.3, 4.32, -0.45], [0.3, 4.32, -0.45], 0.022, DARK_STEEL);
  cylinder(0.09, 0.18, RED, [0, 5.37, -0.45], 8);
  cylinder(0.045, 0.12, GOLD, [0, 5.52, -0.45], 8);
  for (const y of [3.12, 3.8, 4.48]) {
    cylinder(0.06, 0.07, GOLD, [0, y, -0.45], 8);
  }

  // Satellite dish on a short side tower.
  box([0.46, 0.7, 0.46], DARK_STEEL, [-2.22, 1.0, -0.95]);
  cylinder(0.08, 1.15, STEEL, [-2.22, 1.78, -0.95], 8);
  cylinder(0.55, 0.12, SNOW_BLUE, [-2.22, 2.37, -0.95], 10, {
    rotation: [22, 0, 0],
  });
  cylinder(0.44, 0.06, ICE, [-2.22, 2.43, -0.74], 10, {
    rotation: [22, 0, 0],
  });
  rod([-2.22, 2.4, -0.72], [-2.22, 2.75, -0.55], 0.025, GOLD);
  cylinder(0.08, 0.08, RED, [-2.22, 2.78, -0.53], 8);

  // Solar array on the left, with chunky supports.
  box([2.5, 0.13, 0.16], DARK_STEEL, [-2.15, 0.65, 0.7]);
  solarPanel(-2.55, 1.45, 0.35, 1);
  solarPanel(-1.1, 1.45, 0.35, 1);
  rod([-2.55, 0.68, 0.35], [-2.55, 1.22, 0.35], 0.045, DARK_STEEL);
  rod([-1.1, 0.68, 0.35], [-1.1, 1.22, 0.35], 0.045, DARK_STEEL);

  // Second small panel rack at rear.
  solarPanel(2.55, 1.15, 1.9, -1);
  solarPanel(3.72, 1.15, 1.9, -1);
  box([2.45, 0.1, 0.12], DARK_STEEL, [3.12, 0.57, 1.9]);

  // Supply sled in the right foreground.
  box([1.65, 0.18, 0.86], WOOD, [2.0, 0.55, 1.65]);
  box([1.5, 0.12, 0.7], WOOD_LIGHT, [2.0, 0.69, 1.65]);
  for (const x of [1.3, 2.7]) {
    rod([x, 0.3, 1.28], [x, 0.3, 2.08], 0.055, DARK_STEEL);
    rod([x, 0.3, 2.08], [x, 0.62, 2.08], 0.055, DARK_STEEL);
  }
  box([1.9, 0.1, 0.1], RED, [2.0, 0.82, 1.65]);
  box([0.9, 0.38, 0.58], ORANGE, [1.62, 0.98, 1.65]);
  box([0.62, 0.3, 0.52], GOLD, [2.35, 0.94, 1.65]);
  rivets(1.3, 2.7, 0.7, 1.22, GOLD, 4);

  // Fuel drums and stacked expedition crates.
  for (const z of [-0.35, -0.75]) {
    cylinder(0.31, 0.62, RUST, [-2.95, 0.63, z], 10, { dir: [0, 1, 0] });
    cylinder(0.23, 0.025, GOLD, [-2.95, 0.95, z], 10);
    box([0.5, 0.05, 0.05], GOLD, [-2.95, 0.63, z], [0, 0, 90]);
  }
  box([0.85, 0.7, 0.72], WOOD, [-1.95, 0.68, 2.0]);
  box([0.76, 0.58, 0.64], WOOD_LIGHT, [-1.95, 0.72, 2.0]);
  box([0.9, 0.08, 0.08], GOLD, [-1.95, 0.68, 2.37]);
  box([0.08, 0.72, 0.08], GOLD, [-1.95, 0.68, 2.0]);
  box([0.82, 0.52, 0.68], NAVY, [-1.05, 0.59, 2.18]);
  box([0.72, 0.08, 0.08], ORANGE, [-1.05, 0.59, 2.53]);
  box([0.08, 0.52, 0.08], ORANGE, [-1.05, 0.59, 2.18]);

  // Flag poles, bright pennants, and warning signs.
  rod([-3.28, 0.35, 0.85], [-3.28, 2.15, 0.85], 0.025, STEEL);
  box([0.6, 0.3, 0.025], RED, [-3.0, 1.92, 0.85]);
  box([0.3, 0.3, 0.025], GOLD, [-2.7, 1.92, 0.85]);
  rod([3.25, 0.35, -0.65], [3.25, 1.9, -0.65], 0.025, STEEL);
  box([0.7, 0.27, 0.025], ORANGE, [3.58, 1.68, -0.65]);
  box([0.28, 0.27, 0.025], WHITE, [3.96, 1.68, -0.65]);

  box([0.9, 0.55, 0.08], NAVY, [-3.18, 1.1, 1.48]);
  box([0.7, 0.34, 0.03], GOLD, [-3.18, 1.1, 1.53]);
  box([0.48, 0.07, 0.025], RED, [-3.18, 1.2, 1.56]);
  box([0.34, 0.07, 0.025], RED, [-3.18, 1.06, 1.56]);
  rod([-3.18, 0.78, 1.48], [-3.18, 0.38, 1.48], 0.02, STEEL);

  // Small orange utility boxes and beacon cases.
  box([0.65, 0.55, 0.55], ORANGE, [3.0, 0.62, 0.72]);
  box([0.52, 0.08, 0.08], GOLD, [3.0, 0.68, 1.01]);
  box([0.08, 0.55, 0.08], GOLD, [3.0, 0.62, 0.72]);
  box([0.5, 0.36, 0.48], DARK_STEEL, [3.25, 0.53, 0.05]);
  cylinder(0.09, 0.06, RED, [3.25, 0.74, 0.3], 8);
  cylinder(0.055, 0.09, GOLD, [3.25, 0.74, 0.35], 8);

  // Cable runs between cabin, mast, and generator.
  rod([1.45, 2.55, -0.95], [0.15, 4.65, -0.45], 0.018, INK);
  rod([0.15, 4.65, -0.45], [2.1, 1.42, -1.48], 0.018, INK);
  for (const p of [
    [1.45, 2.55, -0.95],
    [0.15, 4.65, -0.45],
    [2.1, 1.42, -1.48],
  ] as V3[]) {
    cylinder(0.045, 0.08, GOLD, p, 6);
  }

  // Decorative ice shards and icicles around the outpost.
  for (const p of [
    [-3.75, 0.55, 0.1],
    [-3.55, 0.5, 0.45],
    [3.7, 0.55, -0.2],
    [3.45, 0.55, 1.05],
    [-0.55, 0.42, -2.75],
    [0.35, 0.43, -2.8],
    [1.0, 0.42, -2.6],
  ] as V3[]) {
    cone(0.12, 0.42, ICE, p, 5);
  }

  // Snow-packed cable trench and stepping stones.
  box([0.16, 0.08, 2.45], SNOW_BLUE, [-2.55, 0.36, 1.55]);
  box([0.18, 0.08, 2.2], SNOW_BLUE, [2.55, 0.36, 1.15]);
  for (const z of [0.8, 1.2, 1.6, 2.0, 2.4]) {
    box([0.42, 0.08, 0.24], DEEP_ICE, [0.72, 0.37, z]);
  }

  // A compact meteorological instrument at the front.
  rod([2.85, 0.35, 2.75], [2.85, 1.55, 2.75], 0.025, STEEL);
  rod([2.55, 1.42, 2.75], [3.15, 1.42, 2.75], 0.018, STEEL);
  cylinder(0.13, 0.08, WHITE, [2.55, 1.42, 2.75], 8);
  cylinder(0.13, 0.08, WHITE, [3.15, 1.42, 2.75], 8);
  cylinder(0.08, 0.08, RED, [2.85, 1.62, 2.75], 8);
  rod([2.85, 1.62, 2.75], [2.85, 1.93, 2.75], 0.018, RED);

  // Cabin identification emblem: a simple polar star on the facade.
  cylinder(0.22, 0.035, GOLD, [0, 2.4, 1.51], 8, { dir: [0, 0, 1] });
  for (const r of [0, 45, 90, 135]) {
    box([0.06, 0.33, 0.035], WHITE, [0, 2.4, 1.54], [0, 0, r]);
  }

  // Extra snow ledges on equipment and sled, keeping the whole diorama visually unified.
  snowCap(2.0, 1.65, 1.7, 0.9, 1.25);
  snowCap(-1.95, 2.0, 0.92, 0.75, 1.12);
  snowCap(-1.05, 2.18, 0.88, 0.7, 0.91);
  snowCap(3.0, 0.72, 0.72, 0.62, 0.93);

  // A few bold dark rocks break up the perfect white base.
  for (const [x, y, z, sx, sy, sz] of [
    [-3.4, 0.43, -2.35, 0.46, 0.25, 0.34],
    [3.45, 0.42, 2.35, 0.5, 0.22, 0.34],
    [-0.9, 0.4, 3.1, 0.35, 0.2, 0.25],
    [1.1, 0.4, -3.2, 0.42, 0.2, 0.3],
  ] as number[][]) {
    box([sx, sy, sz], DEEP_ICE, [x, y, z]);
  }

  return b.root;
}
```