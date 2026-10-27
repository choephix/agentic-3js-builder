import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Arctic Research Outpost",
  description: "A stylized Firewatch-inspired arctic field station diorama with snow, cabin, antenna mast, solar array, generator, crates, lights, and expedition details.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#e8f1f2";
  const SNOW_SHADOW = "#b9d1d9";
  const ICE = "#8dbbc8";
  const NIGHT = "#173047";
  const NAVY = "#244b63";
  const BLUE = "#3b7186";
  const ORANGE = "#d8753f";
  const ORANGE_LIGHT = "#f0a35a";
  const RED = "#b9483d";
  const WOOD = "#765242";
  const WOOD_DARK = "#493a3b";
  const METAL = "#536975";
  const DARK = "#182631";
  const GLASS = "#a9d8df";
  const YELLOW = "#ffd36a";
  const ICE_DARK = "#5f8d9c";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) => b.part(geometry, color, { at, ...opts });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) => part(new THREE.BoxGeometry(...size), color, at, opts);

  const cyl = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, opts.segments as number ?? 8),
      color,
      at,
      opts,
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    opts: Record<string, unknown> = {},
  ) => part(new THREE.SphereGeometry(radius, 10, 6), color, at, opts);

  const beam = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) => b.rod(a, c, radius, { color });

  const slab = (points: [number, number, number][], color: string) =>
    b.slab(points, { color, thickness: 0.025 });

  // Broad cutaway snow island.
  box([5.8, 0.18, 4.6], ICE, [0, 0.02, 0]);
  box([5.45, 0.18, 4.25], SNOW, [0, 0.15, 0]);
  box([4.6, 0.12, 3.55], SNOW_SHADOW, [0, 0.26, -0.05]);

  // Angular snow drifts around the island.
  slab(
    [
      [-2.8, 0.24, -1.9],
      [-1.65, 0.24, -2.05],
      [-1.1, 0.55, -1.75],
      [-2.3, 0.68, -1.52],
    ],
    SNOW,
  );
  slab(
    [
      [1.75, 0.24, 1.7],
      [2.8, 0.24, 1.5],
      [2.65, 0.65, 1.05],
      [1.95, 0.5, 1.1],
    ],
    SNOW,
  );
  slab(
    [
      [-2.7, 0.25, 0.7],
      [-2.15, 0.25, 1.35],
      [-1.6, 0.62, 1.15],
      [-1.8, 0.48, 0.55],
    ],
    SNOW_SHADOW,
  );

  // Cabin foundation and main insulated module.
  box([2.15, 0.16, 1.55], DARK, [0, 0.36, -0.12]);
  box([2.05, 1.35, 1.45], ORANGE, [0, 1.08, -0.12]);
  box([1.98, 0.16, 1.38], ORANGE_LIGHT, [0, 1.7, -0.12]);

  // Dark side wall panels and corner rails.
  box([0.12, 1.3, 1.47], RED, [-1.02, 1.08, -0.12]);
  box([0.12, 1.3, 1.47], RED, [1.02, 1.08, -0.12]);
  for (const x of [-0.72, -0.36, 0, 0.36, 0.72]) {
    box([0.035, 1.28, 1.49], ORANGE_LIGHT, [x, 1.08, -0.12]);
  }

  // Heavy slanted-looking roof made from overlapping slabs.
  box([2.35, 0.14, 1.7], SNOW, [0, 1.86, -0.12], {
    rotation: [0, 0, -0.06],
  });
  box([2.05, 0.18, 0.17], SNOW_SHADOW, [0, 1.76, 0.66]);
  box([2.05, 0.18, 0.17], SNOW_SHADOW, [0, 1.76, -0.9]);

  // Front door, frame, handle, and emergency placard.
  box([0.48, 1.05, 0.055], WOOD_DARK, [0, 0.91, 0.62]);
  box([0.38, 0.92, 0.065], NAVY, [0, 0.88, 0.655]);
  box([0.3, 0.26, 0.025], GLASS, [0, 1.26, 0.692]);
  box([0.06, 0.06, 0.035], YELLOW, [0.14, 0.82, 0.7]);
  box([0.23, 0.13, 0.025], RED, [0.34, 1.4, 0.7]);
  box([0.08, 0.08, 0.03], SNOW, [0.34, 1.4, 0.72]);

  // Front windows with orange mullions and dark inset borders.
  for (const x of [-0.67, 0.67]) {
    box([0.48, 0.55, 0.055], DARK, [x, 1.18, 0.63]);
    box([0.39, 0.46, 0.065], GLASS, [x, 1.18, 0.665]);
    box([0.035, 0.48, 0.025], ORANGE_LIGHT, [x, 1.18, 0.705]);
    box([0.43, 0.035, 0.025], ORANGE_LIGHT, [x, 1.18, 0.705]);
    box([0.54, 0.06, 0.09], RED, [x, 0.82, 0.64]);
  }

  // Small lit interior rectangles.
  box([0.21, 0.22, 0.012], YELLOW, [-0.67, 1.2, 0.705]);
  box([0.16, 0.12, 0.012], ORANGE_LIGHT, [0.73, 1.28, 0.705]);

  // Roof vent, stove chimney, and cap.
  cyl(0.075, 0.45, METAL, [0.62, 2.08, -0.28], { segments: 8 });
  cyl(0.12, 0.06, DARK, [0.62, 2.31, -0.28], { segments: 8 });
  box([0.2, 0.08, 0.16], SNOW, [0.62, 2.34, -0.28]);

  // Antenna mast behind the cabin.
  beam([-0.72, 1.72, -0.7], [-0.72, 3.45, -0.7], 0.035, METAL);
  beam([-0.94, 1.72, -0.7], [-0.72, 3.45, -0.7], 0.025, METAL);
  beam([-0.5, 1.72, -0.7], [-0.72, 3.45, -0.7], 0.025, METAL);
  beam([-0.9, 2.35, -0.7], [-0.54, 2.35, -0.7], 0.018, METAL);
  beam([-0.9, 2.85, -0.7], [-0.54, 2.85, -0.7], 0.018, METAL);
  cyl(0.055, 0.1, RED, [-0.72, 3.48, -0.7], { segments: 8 });
  sphere(0.08, YELLOW, [-0.72, 3.57, -0.7]);

  // Signal pennant.
  b.extrude(
    [
      [0, 0],
      [0.48, 0.12],
      [0.34, 0.28],
      [0, 0.22],
    ],
    { at: [-0.72, 3.17, -0.7], x: [1, 0, 0], thickness: 0.012, color: RED },
  );

  // Raised solar panel rack to the right.
  beam([0.95, 0.4, -0.86], [1.65, 1.35, -0.86], 0.035, METAL);
  beam([1.65, 0.4, -0.86], [1.65, 1.35, -0.86], 0.035, METAL);
  beam([0.95, 0.4, -0.86], [0.95, 1.25, -0.86], 0.035, METAL);
  box([1.18, 0.08, 0.86], DARK, [1.3, 1.55, -0.86], {
    rotation: [0, 0, -0.3],
  });
  box([1.05, 0.035, 0.72], BLUE, [1.3, 1.6, -0.9], {
    rotation: [0, 0, -0.3],
  });
  for (const x of [0.96, 1.2, 1.44, 1.68]) {
    box([0.025, 0.04, 0.73], GLASS, [x, 1.6, -0.92], {
      rotation: [0, 0, -0.3],
    });
  }
  box([1.07, 0.04, 0.025], GLASS, [1.3, 1.6, -0.92], {
    rotation: [0, 0, -0.3],
  });

  // Dish antenna on a short rear post.
  cyl(0.045, 0.62, METAL, [0.95, 0.7, -1.05], { segments: 8 });
  b.extrude(
    [
      [0, 0],
      [0.42, 0],
      [0.3, 0.16],
      [0.08, 0.28],
    ],
    { at: [0.95, 1.02, -1.05], x: [1, 0, 0], thickness: 0.035, color: SNOW_SHADOW },
  );
  beam([0.95, 1.1, -1.04], [1.16, 1.3, -1.04], 0.018, METAL);
  sphere(0.045, RED, [1.17, 1.31, -1.04]);

  // Generator shed at the left rear.
  box([0.82, 0.64, 0.72], NAVY, [-1.62, 0.68, -0.78]);
  box([0.9, 0.08, 0.8], SNOW, [-1.62, 1.05, -0.78]);
  box([0.52, 0.28, 0.045], DARK, [-1.62, 0.7, -0.4]);
  for (const x of [-1.83, -1.65, -1.47]) {
    box([0.025, 0.21, 0.025], METAL, [x, 0.7, -0.43]);
  }
  cyl(0.13, 0.08, RED, [-1.62, 0.72, -0.19], { segments: 10 });
  cyl(0.08, 0.12, METAL, [-1.62, 1.24, -0.78], { segments: 8 });
  box([0.42, 0.05, 0.22], SNOW_SHADOW, [-1.62, 1.3, -0.78]);

  // Fuel canisters and expedition crates.
  box([0.35, 0.42, 0.3], RED, [1.65, 0.52, 0.42]);
  box([0.38, 0.05, 0.33], ORANGE_LIGHT, [1.65, 0.75, 0.42]);
  cyl(0.07, 0.08, DARK, [1.65, 0.79, 0.42], { segments: 8 });

  box([0.5, 0.35, 0.42], WOOD, [-1.65, 0.48, 0.52]);
  box([0.54, 0.045, 0.46], WOOD_DARK, [-1.65, 0.67, 0.52]);
  box([0.04, 0.37, 0.04], ORANGE_LIGHT, [-1.83, 0.48, 0.75]);
  box([0.04, 0.37, 0.04], ORANGE_LIGHT, [-1.47, 0.48, 0.75]);

  // Fuel drums.
  for (const z of [0.62, 0.9]) {
    cyl(0.16, 0.38, METAL, [1.92, 0.51, z], { segments: 10 });
    cyl(0.165, 0.035, RED, [1.92, 0.7, z], { segments: 10 });
    cyl(0.055, 0.045, DARK, [1.92, 0.73, z], { segments: 8 });
  }

  // Snowmobile parked in front: blocky skis, body, windshield, cargo.
  box([0.48, 0.22, 1.0], RED, [1.0, 0.45, 1.15]);
  box([0.36, 0.18, 0.5], ORANGE, [1.0, 0.64, 1.28]);
  box([0.3, 0.22, 0.22], GLASS, [1.0, 0.82, 1.18]);
  box([0.08, 0.06, 1.1], DARK, [0.82, 0.21, 1.15]);
  box([0.08, 0.06, 1.1], DARK, [1.18, 0.21, 1.15]);
  box([0.28, 0.18, 0.3], NAVY, [1.0, 0.67, 1.65]);
  box([0.38, 0.05, 0.42], WOOD, [1.0, 0.82, 1.65]);

  // Trail markers leading toward the outpost.
  for (const [x, z] of [
    [-2.25, 1.75],
    [-1.7, 1.92],
    [-1.1, 2.02],
    [-0.45, 2.08],
  ] as [number, number][]) {
    cyl(0.035, 0.38, WOOD_DARK, [x, 0.5, z], { segments: 6 });
    box([0.16, 0.1, 0.035], ORANGE_LIGHT, [x, 0.67, z]);
  }

  // Direction signpost and three arrow boards.
  cyl(0.045, 0.72, WOOD_DARK, [-2.25, 0.66, 0.2], { segments: 7 });
  box([0.62, 0.14, 0.055], RED, [-2.25, 0.92, 0.2]);
  box([0.5, 0.1, 0.06], ORANGE_LIGHT, [-2.25, 1.1, 0.2]);
  box([0.42, 0.1, 0.06], NAVY, [-2.25, 1.28, 0.2]);
  for (const y of [0.92, 1.1, 1.28]) {
    box([0.18, 0.025, 0.012], SNOW, [-2.25, y, 0.235]);
  }

  // Communications cable from mast to cabin.
  beam([-0.72, 2.85, -0.7], [0.2, 2.08, -0.65], 0.012, DARK);

  // Icy rocks, kept low and clustered around the footprint.
  const rocks: [number, number, number, number][] = [
    [-2.3, 0.37, -1.35, 0.22],
    [-2.0, 0.36, -1.52, 0.16],
    [2.32, 0.4, -0.72, 0.25],
    [2.55, 0.35, -0.4, 0.14],
    [-0.95, 0.36, 1.75, 0.2],
    [1.95, 0.36, 1.62, 0.17],
    [-2.45, 0.35, 0.92, 0.14],
  ];
  for (const [x, y, z, r] of rocks) {
    sphere(r, ICE_DARK, [x, y, z], { scale: [1.25, 0.7, 0.9] });
    sphere(r * 0.7, SNOW, [x - r * 0.2, y + r * 0.35, z + r * 0.05], {
      scale: [1.15, 0.35, 0.8],
    });
  }

  // Tiny rooftop warning beacon and front flood lamps.
  cyl(0.06, 0.08, DARK, [0, 1.98, 0.35], { segments: 8 });
  sphere(0.055, RED, [0, 2.08, 0.35]);
  for (const x of [-0.86, 0.86]) {
    cyl(0.045, 0.09, DARK, [x, 1.77, 0.65], { segments: 8 });
    sphere(0.035, YELLOW, [x, 1.82, 0.69]);
  }

  return b.root;
}
