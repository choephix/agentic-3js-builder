```ts
import * as THREE from "three";
import {
  createBuilder,
  mottle,
  paint,
  spots,
  rng,
  svg,
} from "agentic-3js-builder";

export const meta = {
  name: "brutalist housing block",
  description:
    "A raw-concrete brutalist housing block with stepped massing, deep balconies, repetitive dark windows, rooftop utility structures, vents, rails, and weathered concrete.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#777875", "#a09f98", {
    size: 0.42,
    contrast: 1.35,
    seed: 17,
  });
  const DARK_CONCRETE = mottle("#535653", "#777a75", {
    size: 0.28,
    contrast: 1.2,
    seed: 22,
  });
  const SHADOW = "#202725";
  const WINDOW = "#111b1c";
  const WINDOW_BLUE = "#253536";
  const FRAME = "#454b48";
  const RAIL = "#343a38";
  const RUST = "#754d39";
  const GRAVEL = mottle("#4b4d49", "#71716b", {
    size: 0.16,
    contrast: 1.4,
    seed: 31,
  });

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    name = "concrete",
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      name,
      flat: true,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name: string,
    segments = 8,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      { at, name, flat: true },
    );

  const slab = (
    width: number,
    depth: number,
    y: number,
    z: number,
    thickness = 0.16,
    color: any = CONCRETE,
    name = "floor-slab",
  ) => box([width, thickness, depth], [0, y, z], color, name);

  const frontWindow = (
    x: number,
    y: number,
    z: number,
    w = 0.3,
    h = 0.55,
    color: any = WINDOW,
    name = "window",
  ) => {
    box([w, h, 0.035], [x, y, z], color, name);
    box([0.035, h + 0.035, 0.045], [x - w / 2, y, z - 0.008], FRAME, "window-jamb");
    box([0.035, h + 0.035, 0.045], [x + w / 2, y, z - 0.008], FRAME, "window-jamb");
    box([w + 0.035, 0.035, 0.045], [x, y - h / 2, z - 0.008], FRAME, "window-sill");
    box([w + 0.035, 0.035, 0.045], [x, y + h / 2, z - 0.008], FRAME, "window-lintel");
  };

  const sideWindow = (
    x: number,
    y: number,
    z: number,
    w = 0.44,
    h = 0.55,
    name = "side-window",
  ) => {
    box([0.035, h, w], [x, y, z], WINDOW_BLUE, name);
    box([0.045, h + 0.035, 0.035], [x, y, z - w / 2], FRAME, "side-jamb");
    box([0.045, h + 0.035, 0.035], [x, y, z + w / 2], FRAME, "side-jamb");
    box([0.045, 0.035, w + 0.035], [x, y - h / 2, z], FRAME, "side-sill");
    box([0.045, 0.035, w + 0.035], [x, y + h / 2, z], FRAME, "side-lintel");
  };

  const balcony = (x: number, y: number, z: number, w: number, d: number) => {
    box([w, 0.14, d], [x, y, z], CONCRETE, "cantilever-balcony");
    box([w, 0.12, 0.12], [x, y + 0.55, z - d / 2 + 0.045], CONCRETE, "balcony-parapet");
    box([w, 0.12, 0.12], [x, y + 0.55, z + d / 2 - 0.045], CONCRETE, "balcony-parapet");
    box([0.12, 0.12, d], [x - w / 2 + 0.06, y + 0.55, z], CONCRETE, "balcony-parapet");
    box([0.12, 0.12, d], [x + w / 2 - 0.06, y + 0.55, z], CONCRETE, "balcony-parapet");

    for (let i = 1; i < 5; i++) {
      const px = x - w / 2 + (w * i) / 5;
      b.rod(
        [px, y + 0.08, z - d / 2 + 0.04],
        [px, y + 0.5, z - d / 2 + 0.04],
        0.014,
        { color: RAIL, name: "balcony-rail" },
      );
      b.rod(
        [px, y + 0.08, z + d / 2 - 0.04],
        [px, y + 0.5, z + d / 2 - 0.04],
        0.014,
        { color: RAIL, name: "balcony-rail" },
      );
    }
  };

  // Dark, slightly raised architectural base.
  box([5.9, 0.18, 3.9], [0, 0.09, 0], DARK_CONCRETE, "foundation-plinth");
  box([5.55, 0.22, 3.55], [0, 0.29, 0], CONCRETE, "podium-roof");
  box([5.1, 0.16, 3.15], [0, 0.48, 0], SHADOW, "podium-shadow-joint");

  // Broad podium, deliberately heavy and asymmetrical.
  box([5.2, 1.2, 3.05], [0, 1.08, 0], CONCRETE, "low-podium");
  box([1.45, 1.18, 3.16], [-1.86, 1.08, 0], DARK_CONCRETE, "podium-service-wing");
  box([1.2, 1.18, 3.16], [1.98, 1.08, 0], DARK_CONCRETE, "podium-service-wing");

  // Deep recessed entrance.
  box([1.12, 0.88, 0.16], [0, 0.72, 1.56], SHADOW, "entrance-recess");
  box([0.11, 0.88, 0.22], [-0.58, 0.72, 1.48], CONCRETE, "entrance-pier");
  box([0.11, 0.88, 0.22], [0.58, 0.72, 1.48], CONCRETE, "entrance-pier");
  box([0.92, 0.11, 0.18], [0, 1.16, 1.43], CONCRETE, "entrance-lintel");
  box([0.7, 0.62, 0.035], [0, 0.72, 1.67], WINDOW_BLUE, "entry-glass");
  box([0.035, 0.62, 0.05], [-0.35, 0.72, 1.69], FRAME, "entry-mullion");
  box([0.035, 0.62, 0.05], [0.35, 0.72, 1.69], FRAME, "entry-mullion");

  // Repetitive podium windows.
  for (const y of [0.82, 1.32]) {
    for (const x of [-2.5, -1.7, -0.9, 0.9, 1.7, 2.5]) {
      frontWindow(x, y, 1.555, 0.43, 0.3, WINDOW, "podium-window");
    }
  }

  // Main tower: a tall, offset slab with exposed vertical side piers.
  box([3.35, 4.7, 1.72], [-0.58, 3.88, 0.08], CONCRETE, "main-residential-tower");
  box([0.34, 4.88, 1.98], [-2.34, 3.88, 0.08], DARK_CONCRETE, "tower-left-pier");
  box([0.28, 4.88, 1.98], [1.1, 3.88, 0.08], DARK_CONCRETE, "tower-right-pier");
  box([3.85, 0.24, 2.05], [-0.58, 6.27, 0.08], CONCRETE, "tower-crown");
  box([3.62, 0.16, 2.12], [-0.58, 1.48, 0.08], CONCRETE, "tower-foot");

  // Main tower's front windows and alternating projecting balconies.
  const towerRows = [1.9, 2.72, 3.54, 4.36, 5.18, 6.0];
  for (let r = 0; r < towerRows.length; r++) {
    const y = towerRows[r];
    for (const x of [-1.72, -1.05, -0.38, 0.29]) {
      frontWindow(x, y, 0.965, 0.42, 0.54, r % 2 ? WINDOW_BLUE : WINDOW, "tower-window");
    }
    if (r === 0 || r === 2 || r === 4) {
      balcony(-1.06, y - 0.37, 1.12, 1.25, 0.55);
      balcony(0.3, y - 0.37, 1.12, 0.72, 0.55);
    }
  }

  // Side elevation on the left, with narrow strip windows.
  for (const y of [1.94, 2.76, 3.58, 4.4, 5.22, 6.04]) {
    for (const z of [-0.55, 0.05, 0.65]) {
      sideWindow(-2.525, y, z, 0.32, 0.48, "tower-side-window");
    }
  }

  // Smaller offset block creates the characteristic stepped skyline.
  box([2.05, 3.35, 1.48], [1.38, 3.2, -0.52], CONCRETE, "east-wing");
  box([0.28, 3.55, 1.72], [2.47, 3.2, -0.52], DARK_CONCRETE, "east-wing-pier");
  box([2.25, 0.2, 1.8], [1.38, 4.91, -0.52], CONCRETE, "east-wing-cap");
  box([2.2, 0.14, 1.8], [1.38, 1.48, -0.52], CONCRETE, "east-wing-foot");

  for (const y of [1.92, 2.72, 3.52, 4.32]) {
    for (const x of [0.72, 1.38, 2.04]) {
      frontWindow(x, y, 0.24, 0.4, 0.52, WINDOW, "east-wing-window");
    }
  }
  for (const y of [1.92, 2.72, 3.52, 4.32]) {
    sideWindow(2.62, y, -0.65, 0.42, 0.5, "east-side-window");
  }

  // Recessed horizontal joints and oversized concrete bands.
  for (const y of [2.32, 4.0, 5.66]) {
    box([3.45, 0.075, 2.02], [-0.58, y, 0.99], SHADOW, "horizontal-joint");
    box([3.65, 0.13, 2.08], [-0.58, y + 0.07, 0.98], CONCRETE, "floor-band");
  }
  for (const y of [2.36, 4.04]) {
    box([2.12, 0.07, 1.8], [1.38, y, 0.24], SHADOW, "wing-joint");
  }

  // Rooftop mechanical penthouses and parapets.
  box([1.45, 0.92, 1.02], [-0.78, 6.86, 0.08], DARK_CONCRETE, "roof-mechanical-room");
  box([0.72, 0.7, 0.78], [0.48, 6.75, 0.08], CONCRETE, "roof-stair-head");
  box([2.15, 0.18, 1.98], [-0.58, 6.52, 0.08], CONCRETE, "roof-parapet-front");
  box([3.85, 0.18, 0.16], [-0.58, 6.52, 0.99], CONCRETE, "roof-parapet-side");
  box([3.85, 0.18, 0.16], [-0.58, 6.52, -0.83], CONCRETE, "roof-parapet-side");

  // Small rooftop vents, pipes, and brutalist utility silhouettes.
  for (const x of [-1.48, -1.1, -0.72, -0.34, 0.04]) {
    cyl(0.075, 0.32, [x, 7.48, 0.08], DARK_CONCRETE, "roof-vent", 8);
    box([0.18, 0.045, 0.18], [x, 7.65, 0.08], FRAME, "vent-cap");
  }
  for (const x of [0.15, 0.42, 0.69]) {
    b.rod([x, 6.85, 0.08], [x, 7.7, 0.08], 0.025, {
      color: RUST,
      name: "rusted-service-pipe",
    });
    box([0.18, 0.045, 0.045], [x, 7.18, 0.08], RUST, "pipe-bracket");
  }

  // Water tanks / rooftop cylindrical services.
  cyl(0.32, 0.62, [1.45, 5.38, -0.52], DARK_CONCRETE, "utility-tank", 10);
  cyl(0.36, 0.07, [1.45, 5.73, -0.52], FRAME, "utility-tank-lid", 10);
  cyl(0.06, 0.32, [1.45, 5.93, -0.52], RUST, "tank-pipe", 8);

  // Entrance canopy, oversized like a civic shelter.
  box([1.55, 0.14, 0.72], [0, 1.42, 1.86], CONCRETE, "entrance-canopy");
  box([0.11, 0.75, 0.11], [-0.62, 1.05, 1.93], CONCRETE, "canopy-support");
  box([0.11, 0.75, 0.11], [0.62, 1.05, 1.93], CONCRETE, "canopy-support");

  // A few isolated facade lamps, intentionally sparse and industrial.
  const lampTexture = svg(
    `<svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="12" fill="#d6c38e"/><circle cx="16" cy="16" r="7" fill="#fff5c8"/></svg>`,
    { size: 64 },
  );
  for (const x of [-0.42, 0.42]) {
    b.part(new THREE.BoxGeometry(0.12, 0.18, 0.025), "#c9b979", {
      at: [x, 1.2, 1.665],
      texture: lampTexture,
      name: "entry-lamp",
    });
  }

  // Vertical service ladders on the rear-facing side.
  for (const x of [-1.98, 1.98]) {
    b.rod([x, 1.3, -1.03], [x, 6.2, -1.03], 0.018, {
      color: RAIL,
      name: "service-ladder-rail",
    });
    for (let y = 1.6; y < 6.1; y += 0.34) {
      b.rod([x - 0.08, y, -1.03], [x + 0.08, y, -1.03], 0.014, {
        color: RAIL,
        name: "service-ladder-rung",
      });
    }
  }

  // Hard-edged paving seams around the building.
  for (const x of [-2.8, -1.4, 0, 1.4, 2.8]) {
    box([0.018, 0.025, 3.65], [x, 0.405, 0], SHADOW, "paving-seam");
  }
  for (const z of [-1.45, -0.72, 0, 0.72, 1.45]) {
    box([5.65, 0.025, 0.018], [0, 0.405, z], SHADOW, "paving-seam");
  }

  // Low concrete bollards and battered planters; no greenery, keeping the scene severe.
  for (const x of [-2.9, -2.55, 2.55, 2.9]) {
    cyl(0.105, 0.42, [x, 0.58, 1.82], CONCRETE, "bollard", 6);
  }
  for (const x of [-2.15, 2.15]) {
    box([0.65, 0.38, 0.5], [x, 0.7, 1.62], DARK_CONCRETE, "empty-planter");
    box([0.72, 0.055, 0.57], [x, 0.91, 1.62], SHADOW, "planter-soil");
  }

  // A few exposed tie-rod marks, characteristic facade details.
  for (const y of [1.7, 2.55, 3.4, 4.25, 5.1, 5.95]) {
    for (const x of [-2.12, 0.96]) {
      cyl(0.032, 0.018, [x, y, 1.0], RUST, "tie-rod-mark", 8);
    }
  }

  return b.root;
}
```