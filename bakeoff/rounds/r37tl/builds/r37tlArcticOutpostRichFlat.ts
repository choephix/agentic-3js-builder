import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-inspired arctic research station diorama with a warm orange cabin, snowdrifts, radio mast, solar array, fuel sled, flags, crates, and scientific equipment.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = "#f2f5f2";
  const SNOW_BLUE = "#cbdce2";
  const SNOW_SHADOW = "#9ebdca";
  const ICE = "#79aebd";
  const SKY_BLUE = "#3d7183";
  const CABIN_RED = "#b95039";
  const CABIN_DARK = "#71372f";
  const CABIN_LIGHT = "#d8794e";
  const WOOD = "#765044";
  const WOOD_DARK = "#4d3531";
  const ORANGE = "#e7833d";
  const YELLOW = "#f4c667";
  const CREAM = "#f2d9a4";
  const TEAL = "#427f86";
  const TEAL_DARK = "#275760";
  const CHARCOAL = "#202b31";
  const STEEL = "#667982";
  const BLACK = "#182128";
  const GLASS = "#a7d9dd";
  const RED = "#d44b3e";
  const GREEN = "#567d68";

  const part = (
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: {
      rotation?: [number, number, number];
      scale?: [number, number, number];
      dir?: [number, number, number];
      axis?: "x" | "y" | "z";
      name?: string;
      group?: string;
    } = {},
  ) =>
    b.part(geometry, color, {
      at,
      rotation: options.rotation,
      scale: options.scale,
      dir: options.dir,
      axis: options.axis,
      name: options.name,
      group: options.group,
    });

  const box = (
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: {
      rotation?: [number, number, number];
      name?: string;
      group?: string;
    } = {},
  ) =>
    part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      at,
      options,
    );

  const cylinder = (
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    segments = 8,
    options: { rotation?: [number, number, number]; name?: string } = {},
  ) =>
    part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      at,
      options,
    );

  const sphere = (
    radius: number,
    color: string,
    at: [number, number, number],
    scale: [number, number, number],
    segments = 8,
    rings = 5,
    name?: string,
  ) =>
    part(
      new THREE.SphereGeometry(radius, segments, rings),
      color,
      at,
      { scale, name },
    );

  const rod = (
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, z, radius, { color, name });

  // -------------------------------------------------------------------------
  // Snow island and layered ice shelf
  // -------------------------------------------------------------------------

  box([3.65, 0.16, 3.05], SNOW_SHADOW, [0, 0.08, 0], {
    name: "snow-island-shadow",
    group: "ground",
  });
  box([3.42, 0.16, 2.83], SNOW, [0, 0.19, 0], {
    name: "snow-island-top",
    group: "ground",
  });
  box([3.05, 0.10, 2.45], SNOW_BLUE, [0, 0.30, -0.03], {
    name: "ice-shelf-edge",
    group: "ground",
  });
  box([2.55, 0.06, 2.08], SNOW, [0, 0.38, 0.02], {
    name: "fresh-snow-cap",
    group: "ground",
  });

  // Angular ice facets along the island rim.
  const rimIce: Array<[number, number, number, number, number, number]> = [
    [-1.58, 0.30, -0.94, 0.34, 0.26, 0.30],
    [-1.25, 0.29, -1.20, 0.38, 0.22, 0.23],
    [-0.70, 0.29, -1.33, 0.48, 0.18, 0.20],
    [0.72, 0.29, -1.32, 0.44, 0.20, 0.19],
    [1.33, 0.29, -1.10, 0.35, 0.24, 0.25],
    [1.57, 0.29, -0.50, 0.29, 0.22, 0.35],
    [1.60, 0.29, 0.67, 0.31, 0.20, 0.38],
    [1.13, 0.29, 1.20, 0.48, 0.19, 0.22],
    [-1.40, 0.29, 1.15, 0.40, 0.19, 0.25],
    [-1.64, 0.29, 0.52, 0.28, 0.21, 0.39],
  ];
  for (const [x, y, z, sx, sy, sz] of rimIce)
    box([sx, sy, sz], ICE, [x, y, z], { name: "ice-facet", group: "ground" });

  // Snow mounds. Low-poly flattened forms establish the diorama scale.
  const drifts: Array<[number, number, number, number, number, number]> = [
    [-1.28, 0.46, -0.77, 0.42, 0.22, 0.33],
    [-0.86, 0.43, 0.94, 0.55, 0.19, 0.26],
    [1.30, 0.44, 0.90, 0.38, 0.22, 0.30],
    [1.33, 0.43, -0.55, 0.32, 0.18, 0.25],
    [-1.25, 0.43, 0.48, 0.36, 0.16, 0.25],
    [0.36, 0.42, 1.22, 0.44, 0.17, 0.22],
  ];
  for (const [x, y, z, sx, sy, sz] of drifts)
    sphere(0.5, SNOW, [x, y, z], [sx, sy, sz], 8, 4, "snow-drift");

  // -------------------------------------------------------------------------
  // Main research cabin: chunky orange-red Firewatch silhouette
  // -------------------------------------------------------------------------

  box([1.34, 0.82, 0.92], CABIN_RED, [0, 0.88, 0.08], {
    name: "research-cabin",
    group: "cabin",
  });
  box([1.42, 0.10, 0.98], CABIN_DARK, [0, 1.31, 0.08], {
    name: "cabin-roof-shadow",
    group: "cabin",
  });

  // Sloping snow roof made from two broad slabs.
  box([0.82, 0.12, 1.04], SNOW, [-0.43, 1.50, 0.08], {
    rotation: [0, 0, -14],
    name: "left-snow-roof",
    group: "cabin",
  });
  box([0.82, 0.12, 1.04], SNOW, [0.43, 1.50, 0.08], {
    rotation: [0, 0, 14],
    name: "right-snow-roof",
    group: "cabin",
  });
  box([0.11, 0.16, 1.08], SNOW_SHADOW, [0, 1.62, 0.08], {
    name: "roof-snow-ridge",
    group: "cabin",
  });

  // Front porch and steps.
  box([0.78, 0.12, 0.34], WOOD_DARK, [0, 0.49, 0.64], {
    name: "porch",
    group: "cabin",
  });
  box([0.72, 0.12, 0.16], WOOD, [0, 0.40, 0.78], {
    name: "porch-step",
    group: "cabin",
  });
  box([0.78, 0.08, 0.38], SNOW, [0, 0.59, 0.72], {
    name: "porch-snow",
    group: "cabin",
  });

  // Cabin corner posts and dark timber seams.
  for (const x of [-0.60, 0.60]) {
    box([0.10, 0.82, 0.10], WOOD_DARK, [x, 0.88, 0.56], {
      name: "front-corner-post",
      group: "cabin",
    });
    box([0.10, 0.82, 0.10], WOOD_DARK, [x, 0.88, -0.40], {
      name: "back-corner-post",
      group: "cabin",
    });
  }
  box([1.28, 0.08, 0.08], WOOD_DARK, [0, 1.02, 0.57], {
    name: "front-crossbeam",
    group: "cabin",
  });
  box([1.28, 0.06, 0.06], CABIN_LIGHT, [0, 0.67, 0.57], {
    name: "front-wall-trim",
    group: "cabin",
  });

  // Front door, window, and glowing warm interior.
  box([0.34, 0.58, 0.035], WOOD_DARK, [0, 0.91, 0.575], {
    name: "front-door",
    group: "cabin",
  });
  box([0.25, 0.38, 0.012], ORANGE, [0, 0.98, 0.598], {
    name: "door-window-glow",
    group: "cabin",
  });
  box([0.29, 0.035, 0.035], WOOD, [0, 0.70, 0.62], {
    name: "door-threshold",
    group: "cabin",
  });
  cylinder(0.022, 0.018, YELLOW, [0.13, 0.94, 0.62], 8, {
    rotation: [90, 0, 0],
    name: "door-handle",
  });

  for (const x of [-0.38, 0.38]) {
    box([0.27, 0.27, 0.025], GLASS, [x, 0.98, 0.575], {
      name: "front-window",
      group: "cabin",
    });
    box([0.31, 0.035, 0.04], WOOD_DARK, [x, 0.98, 0.60], {
      name: "window-header",
      group: "cabin",
    });
    box([0.035, 0.29, 0.04], WOOD_DARK, [x, 0.98, 0.61], {
      name: "window-mullion",
      group: "cabin",
    });
  }

  // Side wall observation window.
  box([0.025, 0.32, 0.46], GLASS, [0.676, 1.00, -0.03], {
    name: "side-observation-window",
    group: "cabin",
  });
  box([0.04, 0.035, 0.52], WOOD_DARK, [0.70, 1.00, -0.03], {
    name: "side-window-frame",
    group: "cabin",
  });

  // Chimney with cap and little snow collar.
  cylinder(0.075, 0.42, CHARCOAL, [0.34, 1.78, -0.16], 8, {
    name: "stove-chimney",
    group: "cabin",
  });
  box([0.19, 0.06, 0.17], CHARCOAL, [0.34, 1.99, -0.16], {
    name: "chimney-cap",
    group: "cabin",
  });
  box([0.20, 0.06, 0.20], SNOW, [0.34, 1.59, -0.16], {
    name: "chimney-snow",
    group: "cabin",
  });

  // -------------------------------------------------------------------------
  // Rear radio mast and guy wires
  // -------------------------------------------------------------------------

  const mastBase: [number, number, number] = [0.98, 0.43, -0.62];
  cylinder(0.13, 0.16, STEEL, [mastBase[0], 0.48, mastBase[2]], 8, {
    name: "mast-foot",
    group: "communications",
  });
  rod([mastBase[0], 0.50, mastBase[2]], [mastBase[0], 2.52, mastBase[2]], 0.027, CHARCOAL, "radio-mast");
  rod([mastBase[0], 1.24, mastBase[2]], [0.54, 2.23, -0.62], 0.012, STEEL, "mast-brace");
  rod([mastBase[0], 1.24, mastBase[2]], [1.42, 2.18, -0.62], 0.012, STEEL, "mast-brace");
  rod([mastBase[0], 1.15, mastBase[2]], [0.98, 0.47, -1.22], 0.009, STEEL, "guy-wire");
  rod([mastBase[0], 1.15, mastBase[2]], [1.46, 0.47, -0.25], 0.009, STEEL, "guy-wire");

  cylinder(0.07, 0.12, RED, [0.98, 2.32, -0.62], 8, {
    name: "radio-beacon",
    rotation: [0, 0, 0],
  });
  cylinder(0.025, 0.23, YELLOW, [0.98, 2.50, -0.62], 6, {
    name: "beacon-antenna",
  });
  box([0.40, 0.07, 0.06], STEEL, [0.98, 1.42, -0.62], {
    name: "radio-crossbar",
    group: "communications",
  });
  cylinder(0.06, 0.05, CHARCOAL, [0.72, 1.42, -0.62], 8, {
    rotation: [90, 0, 0],
    name: "radio-dish-hub",
  });
  part(
    new THREE.ConeGeometry(0.23, 0.12, 8, 1, true),
    STEEL,
    [0.72, 1.42, -0.62],
    { rotation: [0, 90, 0], name: "radio-dish" },
  );

  // -------------------------------------------------------------------------
  // Solar panel rack on the right side
  // -------------------------------------------------------------------------

  box([0.72, 0.08, 0.60], CHARCOAL, [0.98, 0.48, 0.42], {
    rotation: [-28, 0, 0],
    name: "solar-panel-frame",
    group: "power",
  });
  box([0.62, 0.025, 0.50], TEAL_DARK, [0.98, 0.54, 0.38], {
    rotation: [-28, 0, 0],
    name: "solar-panel",
    group: "power",
  });
  for (const x of [0.78, 0.98, 1.18])
    box([0.012, 0.032, 0.49], ICE, [x, 0.56, 0.37], {
      rotation: [-28, 0, 0],
      name: "solar-cell-divider",
      group: "power",
    });
  box([0.60, 0.012, 0.025], ICE, [0.98, 0.56, 0.38], {
    rotation: [-28, 0, 0],
    name: "solar-cell-divider",
    group: "power",
  });
  rod([0.98, 0.42, 0.42], [0.98, 0.84, 0.42], 0.035, STEEL, "solar-leg");
  rod([0.76, 0.42, 0.42], [0.76, 0.69, 0.42], 0.025, STEEL, "solar-leg");
  box([0.43, 0.21, 0.28], CHARCOAL, [1.12, 0.49, 0.77], {
    name: "battery-box",
    group: "power",
  });
  box([0.30, 0.07, 0.015], YELLOW, [1.12, 0.58, 0.918], {
    name: "battery-label",
    group: "power",
  });

  // -------------------------------------------------------------------------
  // Fuel, supply, and science equipment
  // -------------------------------------------------------------------------

  // Red fuel drums beside the cabin.
  for (const [x, z] of [
    [-0.98, 0.48],
    [-1.18, 0.48],
    [-1.08, 0.68],
  ] as Array<[number, number]>) {
    cylinder(0.13, 0.30, RED, [x, 0.57, z], 10, {
      rotation: [0, 0, 0],
      name: "fuel-drum",
    });
    cylinder(0.07, 0.018, YELLOW, [x, 0.73, z], 8, {
      name: "fuel-cap",
    });
    box([0.16, 0.09, 0.018], CREAM, [x, 0.56, z + 0.125], {
      name: "fuel-drum-label",
    });
  }

  // Wooden supply crate with snow top and dark straps.
  box([0.46, 0.34, 0.42], WOOD, [-0.97, 0.58, -0.58], {
    name: "supply-crate",
    group: "supplies",
  });
  box([0.48, 0.055, 0.44], SNOW, [-0.97, 0.78, -0.58], {
    name: "crate-snow",
    group: "supplies",
  });
  for (const x of [-1.10, -0.84])
    box([0.035, 0.36, 0.44], WOOD_DARK, [x, 0.58, -0.58], {
      name: "crate-band",
      group: "supplies",
    });
  box([0.23, 0.12, 0.018], CREAM, [-0.97, 0.60, -0.80], {
    name: "crate-label",
    group: "supplies",
  });

  // Scientific weather station mast.
  cylinder(0.035, 0.72, STEEL, [-0.42, 0.77, -0.92], 6, {
    name: "weather-station-pole",
    group: "science",
  });
  box([0.36, 0.025, 0.025], STEEL, [-0.42, 1.12, -0.92], {
    name: "anemometer-arm",
    group: "science",
  });
  for (const [x, z] of [
    [-0.60, -0.92],
    [-0.24, -0.92],
  ] as Array<[number, number]>) {
    cylinder(0.045, 0.035, RED, [x, 1.12, z], 8, {
      rotation: [90, 0, 0],
      name: "anemometer-cup",
    });
  }
  sphere(0.075, CREAM, [-0.42, 1.20, -0.92], [1, 0.75, 1], 8, 5, "weather-sensor");
  box([0.18, 0.16, 0.14], TEAL_DARK, [-0.42, 0.46, -0.92], {
    name: "weather-data-box",
    group: "science",
  });
  box([0.11, 0.05, 0.015], YELLOW, [-0.42, 0.52, -0.996], {
    name: "weather-data-screen",
    group: "science",
  });

  // -------------------------------------------------------------------------
  // Snowmobile / utility sled in front of the station
  // -------------------------------------------------------------------------

  box([0.88, 0.23, 0.42], ORANGE, [0.75, 0.52, 1.00], {
    name: "utility-sled-body",
    group: "vehicle",
  });
  box([0.52, 0.16, 0.35], CABIN_DARK, [0.75, 0.72, 1.00], {
    name: "sled-seat",
    group: "vehicle",
  });
  box([0.22, 0.16, 0.08], CHARCOAL, [0.75, 0.83, 1.23], {
    rotation: [-18, 0, 0],
    name: "sled-dashboard",
    group: "vehicle",
  });
  rod([0.75, 0.78, 1.18], [0.75, 1.03, 1.22], 0.018, CHARCOAL, "sled-handlebar");
  box([0.32, 0.035, 0.07], CHARCOAL, [0.75, 0.40, 0.87], {
    rotation: [0, 0, -5],
    name: "sled-runner",
    group: "vehicle",
  });
  box([0.32, 0.035, 0.07], CHARCOAL, [0.75, 0.40, 1.13], {
    rotation: [0, 0, -5],
    name: "sled-runner",
    group: "vehicle",
  });
  cylinder(0.10, 0.06, CHARCOAL, [0.28, 0.49, 1.00], 8, {
    rotation: [0, 90, 0],
    name: "sled-engine",
  });
  box([0.13, 0.10, 0.015], YELLOW, [0.75, 0.69, 1.215], {
    name: "sled-console",
    group: "vehicle",
  });

  // Supply cylinders strapped to the rear of the sled.
  for (const x of [0.54, 0.78, 1.02]) {
    cylinder(0.085, 0.34, CREAM, [x, 0.70, 0.86], 8, {
      rotation: [90, 0, 0],
      name: "sled-supply-roll",
      group: "vehicle",
    });
    box([0.17, 0.035, 0.025], RED, [x, 0.70, 0.77], {
      name: "supply-strap",
      group: "vehicle",
    });
  }

  // -------------------------------------------------------------------------
  // Flags and visual wayfinding details
  // -------------------------------------------------------------------------

  rod([-1.35, 0.41, -0.02], [-1.35, 1.28, -0.02], 0.014, WOOD_DARK, "flag-pole");
  part(
    new THREE.PlaneGeometry(0.38, 0.22),
    RED,
    [-1.17, 1.18, -0.02],
    {
      dir: [0, 0, 1],
      axis: "z",
      name: "red-wind-flag",
      group: "wayfinding",
    },
  );
  box([0.18, 0.10, 0.035], CREAM, [-1.35, 0.50, -0.02], {
    name: "flag-base",
    group: "wayfinding",
  });

  // Orange trail markers around the safe path.
  for (const [x, z] of [
    [-1.50, 0.20],
    [-1.48, 0.88],
    [1.42, 0.18],
    [1.43, 0.78],
  ] as Array<[number, number]>) {
    rod([x, 0.35, z], [x, 0.70, z], 0.018, ORANGE, "trail-marker");
    box([0.09, 0.05, 0.08], SNOW, [x, 0.70, z], {
      name: "marker-cap",
    });
  }

  // -------------------------------------------------------------------------
  // Track marks and small graphic snow shadows
  // -------------------------------------------------------------------------

  const track = [
    [0.30, 0.405, 1.36],
    [0.30, 0.407, 1.16],
    [0.30, 0.409, 0.96],
    [0.30, 0.411, 0.76],
    [0.30, 0.413, 0.56],
    [0.30, 0.415, 0.36],
  ] as Array<[number, number, number]>;
  for (const p of track)
    box([0.12, 0.012, 0.07], SNOW_SHADOW, p, {
      rotation: [0, 0, -8],
      name: "snowmobile-track-mark",
      group: "ground-detail",
    });
  for (const p of [
    [-0.06, 0.406, 1.35],
    [-0.06, 0.408, 1.15],
    [-0.06, 0.410, 0.95],
    [-0.06, 0.412, 0.75],
    [-0.06, 0.414, 0.55],
    [-0.06, 0.416, 0.35],
  ] as Array<[number, number, number]>) {
    box([0.12, 0.012, 0.07], SNOW_SHADOW, p, {
      rotation: [0, 0, -8],
      name: "snowmobile-track-mark",
      group: "ground-detail",
    });
  }

  // A few deliberately graphic blue shadow planes make the snow read in flat colour.
  box([0.82, 0.018, 0.18], SNOW_SHADOW, [-0.04, 0.405, -1.05], {
    rotation: [0, 0, -5],
    name: "snow-shadow-plane",
    group: "ground-detail",
  });
  box([0.52, 0.018, 0.16], SNOW_SHADOW, [1.10, 0.406, -0.90], {
    rotation: [0, 0, 12],
    name: "snow-shadow-plane",
    group: "ground-detail",
  });
  box([0.45, 0.018, 0.13], SNOW_SHADOW, [-1.04, 0.406, 1.05], {
    rotation: [0, 0, -18],
    name: "snow-shadow-plane",
    group: "ground-detail",
  });

  // Small warning placard on the cabin.
  box([0.34, 0.24, 0.025], WOOD_DARK, [0.60, 0.92, 0.615], {
    rotation: [0, 0, -3],
    name: "warning-placard",
    group: "cabin-detail",
  });
  box([0.27, 0.16, 0.012], YELLOW, [0.60, 0.92, 0.634], {
    rotation: [0, 0, -3],
    name: "warning-placard-face",
    group: "cabin-detail",
  });
  box([0.11, 0.018, 0.014], BLACK, [0.60, 0.96, 0.645], {
    rotation: [0, 0, -3],
    name: "warning-mark",
    group: "cabin-detail",
  });
  box([0.16, 0.018, 0.014], BLACK, [0.60, 0.90, 0.645], {
    rotation: [0, 0, -3],
    name: "warning-mark",
    group: "cabin-detail",
  });

  return b.root;
}
