import * as THREE from "three";
import { createBuilder } from "../../../../src/index";
import { cel, INK } from "../../../../kits/toon";

export const meta = {
  name: "Arctic Research Outpost",
  description:
    "A stylized Firewatch-inspired arctic research station diorama with a bright orange cabin, snowdrifts, solar panels, antenna, crates, fuel drums, and windswept field equipment.",
};

export default function build() {
  const b = createBuilder({ name: "arctic-research-outpost", detail: 1 });

  const SNOW = cel("#eaf6ff", "#a9c7dc", { threshold: 0.18 });
  const SNOW_DARK = cel("#c4dfef", "#789bb8", { threshold: 0.1 });
  const ICE = cel("#b9e6f2", "#5f9fb5", { threshold: 0.2 });
  const ORANGE = cel("#e66b35", "#873c36", { threshold: 0.12 });
  const ORANGE_LIGHT = cel("#f28c43", "#a44736", { threshold: 0.18 });
  const RED = cel("#b84235", "#632d35", { threshold: 0.12 });
  const WOOD = cel("#8d553c", "#4c3540", { threshold: 0.15 });
  const WOOD_LIGHT = cel("#c27a4c", "#70403b", { threshold: 0.15 });
  const DARK = cel("#202c3d", "#101827", { threshold: 0.1 });
  const GLASS = cel("#75cbe0", "#24556b", { threshold: 0.2 });
  const YELLOW = cel("#ffd46a", "#a56738", { threshold: 0.18 });
  const METAL = cel("#8b9aa5", "#425366", { threshold: 0.15 });
  const BLACK = INK;

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      ...options,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 10), color, {
      at,
      ...options,
    });

  const prism = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    options: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, 6), color, {
      at,
      ...options,
    });

  // Low polygon snow island / diorama base.
  box([4.8, 0.16, 3.6], [0, 0.08, 0], SNOW_DARK, {
    name: "snow-island",
    flat: true,
  });
  box([4.45, 0.08, 3.25], [0, 0.19, 0], SNOW, {
    name: "snow-cap",
    flat: true,
  });

  // Layered angular drifts around the station.
  const drift = (
    at: [number, number, number],
    scale: [number, number, number],
    rotation = 0,
  ) =>
    b.part(
      new THREE.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2),
      SNOW,
      {
        at,
        scale,
        rotation: [0, rotation, 0],
        flat: true,
        name: "wind-drift",
      },
    );

  drift([-1.55, 0.34, 0.82], [0.9, 0.38, 0.55], -0.2);
  drift([1.68, 0.3, -0.92], [1.0, 0.32, 0.48], 0.5);
  drift([1.9, 0.28, 0.65], [0.62, 0.3, 0.42], -0.3);
  drift([-1.85, 0.27, -0.85], [0.72, 0.28, 0.4], 0.7);

  // Cabin foundation and lower shadow line.
  box([1.72, 0.16, 1.2], [0, 0.28, 0], DARK, {
    name: "cabin-foundation",
    flat: true,
  });
  box([1.64, 0.98, 1.1], [0, 0.83, 0], ORANGE, {
    name: "research-cabin",
    flat: true,
  });
  box([1.68, 0.075, 1.14], [0, 0.37, 0], RED, {
    name: "cabin-bottom-trim",
    flat: true,
  });

  // Roof: two broad, slightly offset slabs for a graphic pitched silhouette.
  box([1.93, 0.12, 0.7], [-0.38, 1.42, 0], RED, {
    rotation: [0, 0, -18],
    name: "roof-left-slope",
    flat: true,
  });
  box([1.93, 0.12, 0.7], [0.38, 1.42, 0], RED, {
    rotation: [0, 0, 18],
    name: "roof-right-slope",
    flat: true,
  });
  box([1.96, 0.08, 0.12], [0, 1.56, 0], DARK, {
    name: "roof-ridge",
    flat: true,
  });

  // Snow cap hanging over the roof edges.
  box([1.96, 0.09, 0.7], [-0.4, 1.51, 0], SNOW, {
    rotation: [0, 0, -18],
    name: "roof-snow-left",
    flat: true,
  });
  box([1.96, 0.09, 0.7], [0.4, 1.51, 0], SNOW, {
    rotation: [0, 0, 18],
    name: "roof-snow-right",
    flat: true,
  });

  // Door and frame on the front, facing +Z.
  box([0.42, 0.72, 0.045], [0, 0.75, 0.565], WOOD, {
    name: "front-door",
    flat: true,
  });
  box([0.49, 0.78, 0.055], [0, 0.75, 0.585], RED, {
    name: "door-frame",
    flat: true,
  });
  box([0.38, 0.65, 0.065], [0, 0.75, 0.605], WOOD, {
    name: "door-inset",
    flat: true,
  });
  cylinder(0.035, 0.025, [0.14, 0.76, 0.65], YELLOW, {
    dir: [0, 0, 1],
    name: "door-handle",
  });

  // Front windows with thick graphic frames.
  const window = (x: number, y: number, w: number, h: number, name: string) => {
    box([w + 0.1, h + 0.1, 0.055], [x, y, 0.57], RED, {
      name: `${name}-frame`,
      flat: true,
    });
    box([w, h, 0.07], [x, y, 0.605], GLASS, {
      name: `${name}-glass`,
      flat: true,
    });
    box([0.025, h, 0.08], [x, y, 0.65], DARK, {
      name: `${name}-mullion-v`,
      flat: true,
    });
    box([w, 0.025, 0.08], [x, y, 0.65], DARK, {
      name: `${name}-mullion-h`,
      flat: true,
    });
  };
  window([-0.57, 0.91][0], 0.92, 0.3, 0.28, "front-window-left");
  window(0.57, 0.92, 0.3, 0.28, "front-window-right");

  // Side window and a glowing interior light.
  box([0.055, 0.35, 0.48], [0.84, 0.91, -0.16], RED, {
    name: "side-window-frame",
    flat: true,
  });
  box([0.07, 0.27, 0.38], [0.875, 0.91, -0.16], GLASS, {
    name: "side-window",
    flat: true,
  });
  box([0.08, 0.34, 0.035], [0.91, 0.91, -0.16], YELLOW, {
    name: "side-window-light",
    flat: true,
  });

  // Chimney with cap and snow collar.
  cylinder(0.105, 0.48, [-0.56, 1.77, -0.18], DARK, {
    name: "chimney",
    flat: true,
  });
  box([0.24, 0.08, 0.24], [-0.56, 2.02, -0.18], DARK, {
    name: "chimney-cap",
    flat: true,
  });
  box([0.3, 0.1, 0.3], [-0.56, 1.98, -0.18], SNOW, {
    name: "chimney-snow",
    flat: true,
  });

  // Small rooftop radio mast and triangular braces.
  cylinder(0.035, 0.9, [0.48, 1.96, -0.18], METAL, {
    name: "radio-mast",
    flat: true,
  });
  b.rod([0.48, 1.72, -0.18], [0.25, 1.42, -0.18], 0.018, {
    color: METAL,
    name: "mast-brace-left",
  });
  b.rod([0.48, 1.72, -0.18], [0.71, 1.42, -0.18], 0.018, {
    color: METAL,
    name: "mast-brace-right",
  });
  cylinder(0.14, 0.025, [0.48, 2.42, -0.18], RED, {
    dir: [0, 1, 0],
    name: "radio-dish-base",
  });
  b.part(new THREE.SphereGeometry(0.17, 8, 4), METAL, {
    at: [0.48, 2.5, -0.18],
    scale: [1, 0.35, 1],
    name: "radio-dish",
    flat: true,
  });

  // Solar-panel rack on the right side.
  box([0.9, 0.08, 0.75], [1.2, 0.64, -0.34], METAL, {
    rotation: [0, 0, -28],
    name: "solar-rack",
    flat: true,
  });
  box([0.84, 0.045, 0.68], [1.2, 0.72, -0.34], DARK, {
    rotation: [0, 0, -28],
    name: "solar-panel",
    flat: true,
  });
  for (let i = -2; i <= 2; i++) {
    box([0.025, 0.055, 0.65], [1.2 + i * 0.16, 0.735, -0.34], GLASS, {
      rotation: [0, 0, -28],
      name: "solar-cell-divider",
      flat: true,
    });
  }
  for (let i = -1; i <= 1; i++) {
    box([0.8, 0.025, 0.04], [1.2, 0.735 + i * 0.18, -0.34], GLASS, {
      rotation: [0, 0, -28],
      name: "solar-cell-row",
      flat: true,
    });
  }
  cylinder(0.04, 0.55, [1.2, 0.34, -0.34], METAL, {
    name: "solar-support",
    flat: true,
  });

  // Two stacked supply crates beside the cabin.
  box([0.48, 0.34, 0.42], [-1.18, 0.48, 0.34], WOOD, {
    name: "supply-crate-lower",
    flat: true,
  });
  box([0.42, 0.27, 0.36], [-1.12, 0.78, 0.34], WOOD_LIGHT, {
    rotation: [0, -8, 0],
    name: "supply-crate-upper",
    flat: true,
  });
  for (const z of [0.14, 0.34, 0.54]) {
    box([0.52, 0.035, 0.035], [-1.18, 0.48, z], DARK, {
      name: "crate-band",
      flat: true,
    });
  }

  // Fuel drums and a warning placard.
  cylinder(0.18, 0.38, [1.45, 0.43, 0.57], RED, {
    dir: [0, 1, 0],
    name: "fuel-drum-red",
    flat: true,
  });
  cylinder(0.18, 0.38, [1.73, 0.43, 0.57], YELLOW, {
    dir: [0, 1, 0],
    name: "fuel-drum-yellow",
    flat: true,
  });
  cylinder(0.185, 0.035, [1.45, 0.64, 0.57], DARK, {
    dir: [0, 1, 0],
    name: "fuel-drum-red-lid",
    flat: true,
  });
  cylinder(0.185, 0.035, [1.73, 0.64, 0.57], DARK, {
    dir: [0, 1, 0],
    name: "fuel-drum-yellow-lid",
    flat: true,
  });

  box([0.38, 0.31, 0.035], [1.66, 0.92, 0.92], YELLOW, {
    name: "warning-sign",
    flat: true,
  });
  box([0.28, 0.035, 0.035], [1.66, 0.97, 0.945], BLACK, {
    name: "warning-sign-mark",
    rotation: [0, 0, 45],
    flat: true,
  });

  // Short snow-buried walkway leading from the door.
  for (let i = 0; i < 4; i++) {
    box([0.52, 0.055, 0.27], [0, 0.27, 0.78 + i * 0.28], SNOW_DARK, {
      rotation: [0, (i % 2 ? 2 : -2), 0],
      name: "walkway-slab",
      flat: true,
    });
  }

  // Wind sock / expedition marker at the left rear.
  cylinder(0.025, 1.05, [-1.62, 0.76, -0.72], METAL, {
    name: "marker-pole",
    flat: true,
  });
  b.extrude(
    [
      [0, 0],
      [0.48, 0.08],
      [0.57, 0.2],
      [0.2, 0.18],
      [0, 0.3],
    ],
    {
      at: [-1.62, 1.25, -0.72],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.018,
      color: ORANGE_LIGHT,
      name: "windsock",
      bevel: 0.004,
    },
  );
  box([0.12, 0.11, 0.05], [-1.62, 0.22, -0.72], SNOW_DARK, {
    name: "marker-foot",
    flat: true,
  });

  // A few angular blue ice chunks for scale and colour contrast.
  prism(0.22, 0.42, [-1.9, 0.4, 0.9], ICE, {
    rotation: [0, 0, -8],
    name: "ice-chunk-one",
    flat: true,
  });
  prism(0.16, 0.34, [-2.12, 0.35, 0.68], ICE, {
    rotation: [0, 0, 12],
    name: "ice-chunk-two",
    flat: true,
  });
  prism(0.19, 0.3, [1.95, 0.35, -1.2], ICE, {
    rotation: [0, 0, -14],
    name: "ice-chunk-three",
    flat: true,
  });

  // Thin dark tracks and cable from the solar rack to the cabin.
  b.rod([1.2, 0.24, -0.34], [0.75, 0.3, -0.28], 0.012, {
    color: DARK,
    name: "solar-cable",
  });
  b.rod([0.75, 0.3, -0.28], [0.63, 0.42, -0.1], 0.012, {
    color: DARK,
    name: "solar-cable-rise",
  });

  // A small flag on the roof gives the silhouette a readable vertical accent.
  cylinder(0.018, 0.55, [-0.12, 1.77, 0.14], METAL, {
    name: "flag-pole",
    flat: true,
  });
  b.extrude(
    [
      [0, 0],
      [0.3, -0.03],
      [0.42, 0.13],
      [0.3, 0.27],
      [0, 0.23],
    ],
    {
      at: [-0.12, 1.98, 0.14],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.012,
      color: RED,
      name: "expedition-flag",
      bevel: 0.003,
    },
  );

  return b.root;
}
