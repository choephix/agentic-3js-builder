```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { cel, furEdge, INK } from "agentic-3js-builder/kits/toon";

export const meta = {
  name: "Dutch Windmill",
  description:
    "A cheerful low-poly Dutch windmill with a candy-striped tower, flower-box windows, tiled roof, rotating-style sails, and Animal Crossing charm.",
};

export default function build() {
  const b = createBuilder({ name: "dutch-windmill", detail: 1 });

  const CREAM = cel("#fff1c7", "#e8c58f");
  const TOWER = furEdge("#f4ead0", "#d8b477", {
    level: 0.08,
    teeth: 0.16,
    period: 0.18,
    axis: [0, 1, 0],
    by: "position",
    along: [1, 0, 0],
    ink: "#b37b55",
    inkWidth: 0.012,
  });
  const BRICK = cel("#d66d57", "#a54243");
  const ROOF = cel("#4d8f91", "#285d68");
  const ROOF_DARK = "#24515b";
  const WOOD = cel("#9d5c3d", "#60352d");
  const WOOD_LIGHT = cel("#c88155", "#814534");
  const DARK = "#30243a";
  const GOLD = cel("#f4bf55", "#bb7135");
  const FLOWER = "#f28d9d";
  const LEAF = "#78aa65";
  const GLASS = "#94d5d1";
  const WHITE = "#fff8dc";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    rotation?: [number, number, number],
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      rotation,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, 10, 1),
      color,
      { at, dir, name, flat: true },
    );

  // Foundation stones: deliberately simple and chunky.
  box([0.92, 0.12, 0.78], [0, 0.06, 0], "#b7a995", undefined, "foundation");
  box([0.76, 0.08, 0.68], [0, 0.15, 0], "#d2c0a5", undefined, "foundation_cap");

  // Main tapered Dutch tower.
  b.frustumBox(
    [0, 0.16, 0],
    [0, 1.35, 0],
    [0.68, 0.54],
    [0.47, 0.40],
    { color: TOWER, name: "tapered_tower", section: { ngon: 8 } },
  );

  // Horizontal courses and warm corner blocks.
  for (let y = 0.27; y < 1.3; y += 0.22) {
    box([0.61 - y * 0.08, 0.026, 0.012], [0, y, 0.275], BRICK, undefined, "front_course");
  }

  // Dark timber braces on the face.
  box([0.045, 0.78, 0.035], [-0.27, 0.73, 0.282], WOOD, [0, 0, -28], "timber_left");
  box([0.045, 0.78, 0.035], [0.27, 0.73, 0.282], WOOD, [0, 0, 28], "timber_right");
  box([0.52, 0.045, 0.035], [0, 0.69, 0.285], WOOD, undefined, "timber_crossbar");

  // Door and round golden handle.
  box([0.23, 0.39, 0.045], [0, 0.355, 0.302], WOOD, undefined, "arched_door");
  b.part(
    new THREE.SphereGeometry(0.026, 8, 5),
    GOLD,
    { at: [0.065, 0.36, 0.333], name: "door_handle", flat: true },
  );
  box([0.18, 0.025, 0.018], [0, 0.555, 0.328], WOOD_LIGHT, undefined, "door_lintel");

  // Upper window pair with chunky white frames.
  const windowTexture = svg(
    `<svg viewBox="0 0 100 100">
      <rect width="100" height="100" rx="12" fill="#94d5d1"/>
      <path d="M50 4V96M4 50H96" stroke="#fff8dc" stroke-width="10"/>
      <path d="M12 18Q50 3 88 18" fill="none" stroke="#d9ffff" stroke-width="5"/>
    </svg>`,
    { size: 128 },
  );

  for (const x of [-0.18, 0.18]) {
    box([0.17, 0.22, 0.035], [x, 1.02, 0.285], WHITE, undefined, "window_frame");
    b.part(new THREE.PlaneGeometry(0.135, 0.18), WHITE, {
      at: [x, 1.02, 0.307],
      dir: [0, 0, 1],
      axis: "z",
      texture: windowTexture,
      name: "window_glass",
    });
    // Flower boxes.
    box([0.22, 0.055, 0.07], [x, 0.875, 0.33], WOOD, undefined, "flower_box");
    for (const dx of [-0.065, 0, 0.065]) {
      cylinder(0.018, 0.035, [x + dx, 0.925, 0.34], LEAF, [0, 1, 0], "leaf");
      b.part(new THREE.SphereGeometry(0.026, 7, 5), FLOWER, {
        at: [x + dx, 0.958, 0.34],
        name: "flower",
        flat: true,
      });
    }
  }

  // Decorative red-and-cream collar beneath the roof.
  box([0.82, 0.085, 0.59], [0, 1.37, 0], BRICK, undefined, "roof_collar");
  box([0.87, 0.045, 0.64], [0, 1.425, 0], WHITE, undefined, "roof_trim");

  // Broad faceted roof.
  b.part(
    new THREE.ConeGeometry(0.58, 0.32, 8),
    ROOF,
    { at: [0, 1.58, 0], name: "octagonal_roof", flat: true },
  );
  cylinder(0.075, 0.12, [0, 1.79, 0], ROOF_DARK, [0, 1, 0], "roof_cap");

  // Roof tile stripes, giving the simple cone a hand-built feel.
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI * 2) / 8;
    const x = Math.sin(a) * 0.30;
    const z = Math.cos(a) * 0.30;
    box(
      [0.025, 0.26, 0.018],
      [x, 1.59, z],
      ROOF_DARK,
      [0, (-a * 180) / Math.PI, 0],
      "roof_tile_seam",
    );
  }

  // Rear fantail peeking over the roof, a classic Dutch silhouette.
  const fantailZ = -0.24;
  for (const a of [-32, 0, 32]) {
    box(
      [0.035, 0.28, 0.12],
      [Math.sin((a * Math.PI) / 180) * 0.17, 1.64, fantailZ - 0.12],
      WOOD_LIGHT,
      [0, 0, a],
      "fantail_vane",
    );
  }
  cylinder(0.045, 0.2, [0, 1.64, fantailZ], WOOD, [0, 0, 1], "fantail_hub");

  // Front axle and hub, centered high on the gable.
  const hub = [0, 1.24, 0.34] as [number, number, number];
  cylinder(0.11, 0.10, hub, WOOD, [0, 0, 1], "sail_hub");
  cylinder(0.065, 0.13, [0, 1.24, 0.405], GOLD, [0, 0, 1], "hub_cap");

  // Four broad wooden sails. Each is a tapered-looking stepped assembly.
  for (let i = 0; i < 4; i++) {
    const deg = i * 90 + 10;
    const rad = (deg * Math.PI) / 180;
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const mid = [hub[0] + s * 0.36, hub[1] + c * 0.36, 0.405] as [
      number,
      number,
      number,
    ];

    box([0.085, 0.58, 0.045], mid, WOOD, [0, 0, -deg + 0], "sail_beam");
    box(
      [0.16, 0.34, 0.055],
      [hub[0] + s * 0.53, hub[1] + c * 0.53, 0.413],
      WOOD_LIGHT,
      [0, 0, -deg],
      "sail_panel",
    );
    box(
      [0.12, 0.025, 0.065],
      [hub[0] + s * 0.67, hub[1] + c * 0.67, 0.42],
      WHITE,
      [0, 0, -deg],
      "sail_tip",
    );

    // Small brass rivets at each sail root.
    b.part(new THREE.SphereGeometry(0.018, 6, 4), GOLD, {
      at: [hub[0] + s * 0.16, hub[1] + c * 0.16, 0.445],
      name: "sail_rivet",
      flat: true,
    });
  }

  // Tiny side windows make the building read in three-quarter views.
  for (const x of [-0.49, 0.49]) {
    b.part(new THREE.CircleGeometry(0.075, 8), GLASS, {
      at: [x, 0.78, 0.02],
      dir: [x, 0, 0],
      axis: "z",
      name: "side_window",
      flat: true,
    });
    cylinder(0.088, 0.025, [x, 0.78, 0.02], WHITE, [1, 0, 0], "side_window_frame");
  }

  // A little weather vane arrow on top.
  cylinder(0.018, 0.25, [0, 1.91, 0], GOLD, [0, 1, 0], "weather_vane_post");
  box([0.035, 0.035, 0.28], [0, 2.04, 0], GOLD, undefined, "weather_vane_arrow");
  box([0.12, 0.035, 0.035], [0.08, 2.04, 0], GOLD, undefined, "weather_vane_tail");
  b.part(new THREE.ConeGeometry(0.045, 0.12, 6), GOLD, {
    at: [0.17, 2.04, 0],
    dir: [1, 0, 0],
    name: "weather_vane_point",
    flat: true,
  });

  return b.root;
}
```