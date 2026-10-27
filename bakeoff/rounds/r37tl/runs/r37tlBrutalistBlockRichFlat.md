```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw concrete brutalist housing block with heavy modular massing, recessed windows, projecting balconies, structural fins, rooftop machinery, and weathered architectural details.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#777873";
  const CONCRETE_LIGHT = "#96958b";
  const CONCRETE_DARK = "#555852";
  const CONCRETE_SHADOW = "#424641";
  const WINDOW = "#182228";
  const WINDOW_BLUE = "#263c43";
  const BALCONY_DARK = "#353936";
  const RAIL = "#262b2a";
  const RUST = "#8b4d32";
  const ORANGE = "#c86b35";
  const CURTAIN = "#a7a08c";
  const PLANT = "#394a3c";
  const WATER = "#253943";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) => {
    return b.part(new THREE.BoxGeometry(...size), color, {
      at,
      name,
      flat: true,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
    dir: [number, number, number] = [0, 1, 0],
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments),
      color,
      { at, dir, name, flat: true },
    );
  };

  const slab = (
    points: [number, number, number][],
    color: string,
    name: string,
    thickness = 0.08,
  ) => b.slab(points, { color, thickness, name });

  // Overall footprint: a broad, low, heavy plinth.
  box([6.8, 0.28, 4.25], [0, 0.14, 0], CONCRETE_DARK, "foundation_plinth");
  box([6.35, 0.35, 3.75], [0, 0.43, 0], CONCRETE, "raised_podium");
  box([5.95, 0.18, 3.45], [0, 0.695, 0], CONCRETE_LIGHT, "podium_cap");

  // Main monolithic housing mass, deliberately asymmetrical.
  box([5.7, 6.45, 3.18], [0, 3.88, 0.08], CONCRETE, "main_residential_mass");
  box([1.18, 6.7, 0.95], [-2.72, 4.02, 0.02], CONCRETE_DARK, "left_service_tower");
  box([0.82, 5.4, 0.78], [2.58, 3.45, -0.08], CONCRETE_SHADOW, "right_stair_tower");
  box([2.15, 0.72, 3.5], [-0.85, 7.43, -0.02], CONCRETE_LIGHT, "roof_step_a");
  box([1.25, 0.9, 2.35], [1.58, 7.52, 0.08], CONCRETE_DARK, "roof_step_b");

  // Floor bands and deep horizontal datum lines.
  for (let floor = 0; floor < 6; floor++) {
    const y = 1.04 + floor * 1.06;
    box([5.96, 0.105, 3.36], [0, y, 0.08], CONCRETE_DARK, `floor_band_${floor}`);
    box([5.72, 0.06, 3.4], [0, y + 0.11, 0.12], CONCRETE_LIGHT, `floor_highlight_${floor}`);
  }

  // Massive vertical facade piers.
  const pierXs = [-2.55, -1.35, -0.2, 0.95, 2.1, 2.62];
  for (let i = 0; i < pierXs.length; i++) {
    const x = pierXs[i];
    box(
      [0.18 + (i === 0 || i === pierXs.length - 1 ? 0.12 : 0), 6.65, 0.22],
      [x, 4.02, 1.63],
      i % 2 ? CONCRETE_LIGHT : CONCRETE_DARK,
      `front_pier_${i}`,
    );
  }

  // Recessed window fields on the front.
  for (let floor = 0; floor < 6; floor++) {
    const y = 1.32 + floor * 1.06;
    for (let bay = 0; bay < 5; bay++) {
      const x = -2.08 + bay * 1.08;
      const w = bay === 4 ? 0.78 : 0.82;
      box([w + 0.16, 0.72, 0.14], [x, y, 1.635], CONCRETE_SHADOW, `window_recess_${floor}_${bay}`);
      box([w, 0.51, 0.035], [x, y + 0.02, 1.718], WINDOW, `front_window_${floor}_${bay}`);
      box([0.035, 0.53, 0.045], [x, y + 0.02, 1.745], CONCRETE_LIGHT, `window_mullion_${floor}_${bay}`);
      box([w + 0.04, 0.045, 0.05], [x, y - 0.285, 1.75], CONCRETE_LIGHT, `window_sill_${floor}_${bay}`);
      if ((floor + bay) % 3 === 0) {
        box([0.19, 0.28, 0.012], [x - 0.22, y + 0.04, 1.77], CURTAIN, `curtain_${floor}_${bay}`);
      }
    }
  }

  // Side windows and alternating blind concrete openings.
  for (let floor = 0; floor < 6; floor++) {
    const y = 1.35 + floor * 1.06;
    for (let side = 0; side < 3; side++) {
      const z = -0.85 + side * 0.85;
      box([0.035, 0.54, 0.56], [-2.88, y, z], WINDOW_BLUE, `left_window_${floor}_${side}`);
      box([0.08, 0.61, 0.07], [-2.91, y, z - 0.35], CONCRETE_LIGHT, `left_sill_${floor}_${side}`);
      box([0.56, 0.54, 0.035], [2.87, y, z], WINDOW, `right_window_${floor}_${side}`);
    }
  }

  // Front balconies: strong projecting trays with chunky side cheeks.
  for (let floor = 0; floor < 5; floor++) {
    const y = 1.15 + floor * 1.06;
    const x = floor % 2 === 0 ? 1.62 : -1.62;
    box([1.72, 0.13, 0.92], [x, y, 2.02], CONCRETE_LIGHT, `balcony_slab_${floor}`);
    box([0.12, 0.78, 0.96], [x - 0.78, y + 0.4, 1.98], CONCRETE_DARK, `balcony_cheek_l_${floor}`);
    box([0.12, 0.78, 0.96], [x + 0.78, y + 0.4, 1.98], CONCRETE_DARK, `balcony_cheek_r_${floor}`);
    box([1.54, 0.72, 0.05], [x, y + 0.42, 2.42], RAIL, `balcony_rail_top_${floor}`);
    for (let post = 0; post < 6; post++) {
      const px = x - 0.7 + post * 0.28;
      box([0.035, 0.72, 0.035], [px, y + 0.42, 2.02], RAIL, `balcony_post_${floor}_${post}`);
    }
    box([1.5, 0.05, 0.06], [x, y + 0.09, 2.47], CONCRETE_LIGHT, `balcony_edge_${floor}`);
    if (floor === 1 || floor === 3) {
      box([0.4, 0.3, 0.28], [x - 0.38, y + 0.2, 2.15], CONCRETE_DARK, `planter_${floor}`);
      box([0.3, 0.08, 0.2], [x - 0.38, y + 0.39, 2.15], PLANT, `balcony_plant_${floor}`);
    }
  }

  // A tall recessed entrance cut-in, framed like a fortress gate.
  box([1.65, 2.2, 0.22], [0, 1.65, 1.67], CONCRETE_SHADOW, "entrance_recess");
  box([1.12, 1.72, 0.035], [0, 1.56, 1.805], WINDOW, "entrance_glass");
  box([0.14, 2.0, 0.32], [-0.84, 1.65, 1.72], CONCRETE_LIGHT, "entrance_left_pillar");
  box([0.14, 2.0, 0.32], [0.84, 1.65, 1.72], CONCRETE_DARK, "entrance_right_pillar");
  box([1.92, 0.18, 0.4], [0, 2.73, 1.7], CONCRETE_LIGHT, "entrance_lintel");
  box([0.26, 0.45, 0.04], [-0.35, 1.42, 1.83], ORANGE, "entry_light_left");
  box([0.26, 0.45, 0.04], [0.35, 1.42, 1.83], ORANGE, "entry_light_right");

  // Deep slit windows on the right-hand stair tower.
  for (let floor = 0; floor < 5; floor++) {
    const y = 1.18 + floor * 1.05;
    box([0.035, 0.52, 0.3], [2.98, y, -0.12], WINDOW_BLUE, `stair_slit_${floor}`);
    box([0.06, 0.58, 0.38], [3.01, y, -0.12], CONCRETE_LIGHT, `stair_slit_frame_${floor}`);
  }

  // Side-mounted external fire escape / access walkways.
  box([0.18, 5.1, 0.18], [-3.08, 3.3, -0.82], RAIL, "fire_escape_spine");
  for (let floor = 0; floor < 5; floor++) {
    const y = 1.16 + floor * 1.06;
    box([0.62, 0.1, 1.2], [-3.12, y, -0.45], CONCRETE_DARK, `fire_escape_landing_${floor}`);
    box([0.62, 0.06, 0.06], [-3.12, y + 0.55, -0.45], RAIL, `fire_escape_rail_${floor}`);
    for (let post = 0; post < 3; post++) {
      box(
        [0.035, 0.54, 0.035],
        [-3.12, y + 0.27, -0.9 + post * 0.45],
        RAIL,
        `fire_escape_post_${floor}_${post}`,
      );
    }
  }

  // Roof parapets and sawtooth silhouette.
  box([6.2, 0.38, 0.18], [0, 7.18, 1.63], CONCRETE_LIGHT, "front_parapet");
  box([6.2, 0.42, 0.18], [0, 7.22, -1.48], CONCRETE_DARK, "rear_parapet");
  box([0.18, 0.45, 3.1], [-2.9, 7.22, 0.05], CONCRETE_DARK, "left_parapet");
  box([0.18, 0.45, 3.1], [2.9, 7.22, 0.05], CONCRETE_LIGHT, "right_parapet");
  for (let i = 0; i < 7; i++) {
    const x = -2.55 + i * 0.85;
    box([0.48, 0.23, 0.28], [x, 7.49, 0.7], CONCRETE_LIGHT, `roof_tooth_${i}`);
  }

  // Rooftop service plant: concrete housings, vents, tanks, and ducts.
  box([1.42, 0.95, 1.3], [-1.25, 7.94, -0.35], CONCRETE_DARK, "roof_machine_house");
  box([0.78, 0.62, 0.76], [1.28, 7.78, -0.5], CONCRETE_LIGHT, "roof_lift_house");
  box([1.65, 0.12, 1.46], [-1.25, 8.45, -0.35], CONCRETE_LIGHT, "machine_cap");
  box([0.9, 0.13, 0.88], [1.28, 8.13, -0.5], CONCRETE_DARK, "lift_cap");

  for (let i = 0; i < 4; i++) {
    cylinder(0.34, 0.95, [2.05, 7.98, 0.42 + i * 0.58], WATER, `roof_water_tank_${i}`, 12);
    cylinder(0.37, 0.06, [2.05, 8.47, 0.42 + i * 0.58], CONCRETE_LIGHT, `tank_lid_${i}`, 12);
    cylinder(0.025, 0.5, [2.05, 8.74, 0.42 + i * 0.58], RAIL, `tank_vent_${i}`, 8);
  }

  for (let i = 0; i < 5; i++) {
    cylinder(0.12, 0.16, [-1.72 + i * 0.24, 8.55, -0.35], CONCRETE_SHADOW, `roof_vent_${i}`, 8);
    box([0.18, 0.05, 0.18], [-1.72 + i * 0.24, 8.65, -0.35], CONCRETE_LIGHT, `roof_vent_cap_${i}`);
  }

  // Large diagonal bracing on one flank: a sculptural, infrastructural gesture.
  const brace = (
    a: [number, number, number],
    c: [number, number, number],
    name: string,
  ) => {
    const av = new THREE.Vector3(...a);
    const cv = new THREE.Vector3(...c);
    const mid = av.clone().add(cv).multiplyScalar(0.5);
    const length = av.distanceTo(cv);
    const geo = new THREE.BoxGeometry(0.16, length, 0.22);
    return b.part(geo, CONCRETE_DARK, {
      at: mid,
      dir: cv.clone().sub(av),
      name,
      flat: true,
    });
  };
  brace([-2.96, 1.0, 1.62], [-2.96, 3.1, 0.4], "diagonal_brace_a");
  brace([-2.96, 3.1, 0.4], [-2.96, 5.2, 1.62], "diagonal_brace_b");
  brace([2.96, 1.0, 1.62], [2.96, 3.1, 0.4], "diagonal_brace_c");
  brace([2.96, 3.1, 0.4], [2.96, 5.2, 1.62], "diagonal_brace_d");

  // Narrow clerestory strips under the roof.
  for (let i = 0; i < 8; i++) {
    const x = -2.45 + i * 0.7;
    box([0.48, 0.28, 0.035], [x, 6.83, 1.78], WINDOW_BLUE, `clerestory_${i}`);
    box([0.52, 0.035, 0.08], [x, 6.99, 1.79], CONCRETE_LIGHT, `clerestory_lintel_${i}`);
  }

  // Ground-level hardscape pads and shadow gaps, kept tightly to the building footprint.
  box([2.1, 0.08, 0.72], [-2.0, 0.77, 2.4], CONCRETE_SHADOW, "front_paving_left");
  box([1.45, 0.08, 0.72], [1.95, 0.77, 2.4], CONCRETE_LIGHT, "front_paving_right");
  box([0.08, 0.04, 3.3], [-3.25, 0.82, 0], RUST, "service_cable_trench");
  box([0.08, 0.04, 3.3], [3.25, 0.82, 0], RUST, "right_cable_trench");

  // Sparse brutalist planters at the entrance: concrete cubes with angular vegetation.
  for (let i = 0; i < 3; i++) {
    const x = -1.55 + i * 1.55;
    box([0.62, 0.42, 0.62], [x, 0.99, 2.16], CONCRETE_DARK, `entry_planter_${i}`);
    box([0.42, 0.05, 0.42], [x, 1.22, 2.16], PLANT, `entry_earth_${i}`);
    for (let leaf = 0; leaf < 4; leaf++) {
      const dx = (leaf - 1.5) * 0.08;
      const dy = 0.16 + (leaf % 2) * 0.1;
      box([0.045, 0.28, 0.045], [x + dx, 1.38 + dy * 0.15, 2.16 + (leaf - 1.5) * 0.05], PLANT, `entry_leaf_${i}_${leaf}`);
    }
  }

  // A few deliberately oversized raw-concrete patch plates, suggesting repairs and additions.
  box([0.78, 1.5, 0.04], [-1.95, 4.55, 1.77], CONCRETE_LIGHT, "repair_patch_a");
  box([0.42, 0.85, 0.04], [1.1, 2.35, 1.77], CONCRETE_DARK, "repair_patch_b");
  box([0.66, 0.38, 0.04], [2.0, 5.75, 1.77], CONCRETE_LIGHT, "repair_patch_c");
  box([0.3, 1.18, 0.04], [-2.58, 2.65, 1.77], CONCRETE_DARK, "repair_patch_d");

  return b.root;
}
```