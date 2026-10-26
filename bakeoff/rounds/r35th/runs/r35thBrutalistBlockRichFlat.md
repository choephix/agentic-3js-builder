```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw-concrete brutalist housing block with heavy podiums, recessed windows, cantilevered balconies, stair towers, roof machinery, water tanks, vents, service pipes, and monumental structural bays.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#706f6a";
  const CONCRETE_LIGHT = "#898781";
  const CONCRETE_PALE = "#9b9890";
  const CONCRETE_DARK = "#555752";
  const CONCRETE_DEEP = "#424541";
  const CONCRETE_WARM = "#7c766b";
  const CONCRETE_COLD = "#646963";
  const CONCRETE_PATCH = "#817d74";
  const SHADOW_CONCRETE = "#343735";
  const WINDOW = "#182124";
  const WINDOW_BLUE = "#26383b";
  const WINDOW_DARK = "#101719";
  const LIT_WINDOW = "#a77d4f";
  const LIT_WINDOW_PALE = "#d6b77c";
  const RUST = "#713f2c";
  const RUST_LIGHT = "#9b5d3b";
  const METAL = "#474e4e";
  const METAL_LIGHT = "#737674";
  const BLACK = "#191d1d";

  type V3 = readonly [number, number, number];

  let partIndex = 0;

  const box = (
    name: string,
    at: V3,
    size: V3,
    color: string = CONCRETE,
    rotation?: V3,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      rotation,
      flat: true,
      name: `${name}_${partIndex++}`,
      group: "architecture",
    });
  };

  const cylinder = (
    name: string,
    at: V3,
    radius: number,
    height: number,
    color: string,
    segments = 8,
    rotation?: V3,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1, false),
      color,
      {
        at,
        rotation,
        flat: true,
        name: `${name}_${partIndex++}`,
        group: "architecture",
      },
    );
  };

  const slab = (
    name: string,
    at: V3,
    size: V3,
    color: string = CONCRETE,
  ) => box(name, at, size, color);

  const diagonal = (
    name: string,
    a: V3,
    c: V3,
    width: number,
    depth: number,
    color: string = CONCRETE_DARK,
  ) => {
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dx, dy) * 180) / Math.PI;
    return box(
      name,
      [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2],
      [width, length, depth],
      color,
      [0, 0, angle],
    );
  };

  const pipe = (
    name: string,
    a: V3,
    c: V3,
    radius: number,
    color: string = METAL,
  ) => {
    return b.rod(a, c, radius, {
      color,
      section: { ngon: 6 },
      caps: "round",
      name: `${name}_${partIndex++}`,
      group: "services",
    });
  };

  const concreteVariants = [
    CONCRETE,
    CONCRETE_LIGHT,
    CONCRETE_DARK,
    CONCRETE_WARM,
    CONCRETE_COLD,
    CONCRETE_PATCH,
  ];

  const variant = (i: number) =>
    concreteVariants[((i % concreteVariants.length) + concreteVariants.length) % concreteVariants.length];

  // ---------------------------------------------------------------------------------------------------------------
  // Foundation, shadow plinth, and enormous podium.

  box("foundation_lower", [0, 0.12, 0], [14.8, 0.24, 9.8], CONCRETE_DEEP);
  box("foundation_upper", [0, 0.34, 0], [14.2, 0.22, 9.25], CONCRETE_DARK);
  box("podium_body", [0, 0.96, 0], [13.8, 1.05, 8.8], CONCRETE);
  box("podium_front_cap", [0, 1.52, 0.2], [14.4, 0.18, 9.15], CONCRETE_LIGHT);
  box("podium_left_return", [-6.9, 0.98, 0], [0.3, 1.25, 8.9], CONCRETE_DARK);
  box("podium_right_return", [6.9, 0.98, 0], [0.3, 1.25, 8.9], CONCRETE_DARK);

  for (const x of [-6.05, -4.15, -2.25, -0.35, 1.55, 3.45, 5.35]) {
    box("podium_vertical_joint", [x, 1.07, 4.43], [0.085, 1.12, 0.025], CONCRETE_DEEP);
  }

  for (const x of [-5.6, -2.8, 0, 2.8, 5.6]) {
    box("podium_shadow_bay", [x, 1.05, 4.47], [2.15, 0.72, 0.055], WINDOW_DARK);
    box("podium_bay_header", [x, 1.49, 4.51], [2.35, 0.13, 0.18], CONCRETE_PALE);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Main monolithic residential mass and offset side volumes.

  box("main_residential_mass", [0, 5.95, 0], [11.35, 8.55, 6.55], CONCRETE);
  box("main_mass_left_cheek", [-5.78, 5.88, 0], [0.46, 8.7, 6.9], CONCRETE_DARK);
  box("main_mass_right_cheek", [5.78, 5.88, 0], [0.46, 8.7, 6.9], CONCRETE_LIGHT);

  box("left_stair_tower", [-6.65, 6.2, -0.15], [2.15, 9.75, 5.95], CONCRETE_COLD);
  box("left_stair_tower_front", [-6.65, 6.25, 2.9], [2.35, 9.85, 0.3], CONCRETE_DARK);
  box("right_service_tower", [6.35, 5.65, -0.55], [1.5, 8.7, 5.4], CONCRETE_WARM);
  box("right_service_tower_cap", [6.35, 10.15, -0.55], [1.75, 0.22, 5.75], CONCRETE_PALE);

  // Offset blocks make the silhouette less symmetrical and more like assembled housing megastructure.

  box("upper_left_offset_block", [-3.15, 9.72, -0.15], [5.4, 1.85, 6.95], CONCRETE_LIGHT);
  box("upper_right_offset_block", [3.75, 9.55, 0.28], [3.9, 1.55, 6.35], CONCRETE_DARK);
  box("upper_rear_block", [0.8, 10.42, -1.85], [8.2, 1.25, 2.5], CONCRETE_COLD);
  box("cantilevered_top_bar", [1.6, 11.2, 0.05], [8.9, 0.42, 6.2], CONCRETE);
  box("top_bar_shadow", [1.6, 10.95, 3.2], [9.25, 0.24, 0.22], CONCRETE_DEEP);

  // Heavy horizontal floor plates and projecting seams.

  const floorHeights = [1.62, 3.16, 4.7, 6.24, 7.78, 9.32, 10.82];
  floorHeights.forEach((y, i) => {
    box(`front_floor_band_${i}`, [0, y, 3.34], [11.85, 0.16, 0.3], variant(i + 1));
    box(`left_floor_band_${i}`, [-5.91, y, 0], [0.3, 0.16, 6.8], variant(i + 3));
    box(`right_floor_band_${i}`, [5.92, y, 0], [0.3, 0.16, 6.8], variant(i + 4));
  });

  for (const x of [-5.58, 5.58]) {
    for (const y of [2.15, 3.68, 5.22, 6.76, 8.3, 9.86]) {
      box("corner_pilaster", [x, y, 2.9], [0.28, 1.32, 0.34], CONCRETE_PALE);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Front facade: deep window grid, lintels, sills, mullions, and thick concrete reveals.

  const frontXs = [-4.5, -2.7, -0.9, 0.9, 2.7, 4.5];
  const frontYs = [2.35, 3.89, 5.43, 6.97, 8.51];

  frontYs.forEach((y, row) => {
    frontXs.forEach((x, col) => {
      const id = row * frontXs.length + col;
      const glass = id % 7 === 0 || id % 11 === 0 ? WINDOW_BLUE : WINDOW;
      box("front_recess", [x, y, 3.285], [1.38, 1.08, 0.12], glass);
      box("front_lintel", [x, y + 0.62, 3.38], [1.64, 0.16, 0.36], variant(id));
      box("front_sill", [x, y - 0.62, 3.39], [1.64, 0.16, 0.38], variant(id + 2));
      box("front_reveal_left", [x - 0.76, y, 3.38], [0.14, 1.18, 0.38], CONCRETE_DARK);
      box("front_reveal_right", [x + 0.76, y, 3.38], [0.14, 1.18, 0.38], CONCRETE_LIGHT);
      box("front_mullion", [x, y, 3.405], [0.075, 1.05, 0.04], CONCRETE_DEEP);

      if ((row + col) % 5 === 0) {
        const lit = box("warm_lit_window", [x - 0.22, y + 0.04, 3.42], [0.3, 0.62, 0.028], LIT_WINDOW);
        glow(lit, 0.35);
      }

      if ((row * 2 + col) % 9 === 0) {
        box("window_shutter_panel", [x + 0.51, y + 0.02, 3.425], [0.22, 0.88, 0.025], CONCRETE_WARM);
      }
    });
  });

  // Selective blank concrete panels break the window rhythm.

  box("blank_panel_a", [-5.0, 7.0, 3.43], [0.72, 1.24, 0.08], CONCRETE_PATCH);
  box("blank_panel_b", [5.0, 5.44, 3.43], [0.72, 1.24, 0.08], CONCRETE_DARK);
  box("blank_panel_c", [-2.7, 8.52, 3.43], [1.32, 1.1, 0.08], CONCRETE_LIGHT);
  box("blank_panel_d", [2.7, 3.9, 3.43], [1.32, 1.1, 0.08], CONCRETE_COLD);

  // Tall vertical facade fins give the front its severe monumental rhythm.

  for (const x of [-5.42, -1.8, 1.8, 5.42]) {
    box("vertical_facade_fin", [x, 5.92, 3.6], [0.22, 8.65, 0.34], CONCRETE_PALE);
    box("fin_shadow_strip", [x + 0.17, 5.92, 3.79], [0.05, 8.28, 0.06], CONCRETE_DEEP);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Cantilevered balconies: staggered slabs, thick parapets, side cheeks, and diagonal braces.

  const balconyLevels = [2.08, 3.62, 5.16, 6.7, 8.24];
  const balconyXs = [-3.65, 0, 3.65];

  balconyLevels.forEach((y, row) => {
    balconyXs.forEach((x, col) => {
      const id = row * 3 + col;
      const deep = row % 2 === 0 ? 1.78 : 1.52;
      const front = 3.55 + deep / 2;

      slab("balcony_slab", [x, y, 3.58 + deep / 2 - 0.15], [3.08, 0.22, deep], variant(id + 1));
      box("balcony_front_parapet", [x, y + 0.57, front], [3.12, 0.78, 0.22], CONCRETE_LIGHT);
      box("balcony_left_cheek", [x - 1.44, y + 0.45, 3.58], [0.22, 0.76, deep], CONCRETE_DARK);
      box("balcony_right_cheek", [x + 1.44, y + 0.45, 3.58], [0.22, 0.76, deep], CONCRETE_PALE);
      box("balcony_shadow_band", [x, y - 0.18, front - 0.04], [2.9, 0.12, 0.18], CONCRETE_DEEP);

      diagonal(
        "balcony_left_brace",
        [x - 1.16, y - 0.04, 3.22],
        [x - 0.72, y + 0.47, 3.95],
        0.22,
        0.24,
        CONCRETE_DARK,
      );
      diagonal(
        "balcony_right_brace",
        [x + 1.16, y - 0.04, 3.22],
        [x + 0.72, y + 0.47, 3.95],
        0.22,
        0.24,
        CONCRETE_DARK,
      );

      if (row % 2 === 1) {
        box("balcony_divider", [x, y + 0.53, 3.58], [0.17, 0.72, deep - 0.12], CONCRETE_COLD);
      }
    });
  });

  // Balcony drain mouths and rough patch repairs.

  balconyLevels.forEach((y, i) => {
    balconyXs.forEach((x, j) => {
      cylinder("balcony_drain", [x + (j - 1) * 0.92, y - 0.14, 4.35], 0.045, 0.035, BLACK, 8, [90, 0, 0]);
      box("balcony_patch", [x + (i % 2 ? 0.64 : -0.66), y + 0.13, 4.17], [0.32, 0.08, 0.08], CONCRETE_WARM);
    });
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Monumental entrance under a deep canopy.

  box("entrance_portal_left", [-1.35, 1.82, 4.04], [0.32, 2.18, 0.7], CONCRETE_PALE);
  box("entrance_portal_right", [1.35, 1.82, 4.04], [0.32, 2.18, 0.7], CONCRETE_DARK);
  box("entrance_portal_top", [0, 2.86, 4.04], [3.02, 0.32, 0.7], CONCRETE_LIGHT);
  box("entrance_recess", [0, 1.8, 3.69], [2.35, 1.92, 0.08], WINDOW_DARK);
  box("entrance_left_door", [-0.57, 1.72, 3.76], [1.0, 1.68, 0.035], WINDOW_BLUE);
  box("entrance_right_door", [0.57, 1.72, 3.76], [1.0, 1.68, 0.035], WINDOW);
  box("entrance_center_mullion", [0, 1.72, 3.8], [0.12, 1.75, 0.07], METAL);
  box("entrance_handle_left", [-0.12, 1.7, 3.84], [0.025, 0.38, 0.025], METAL_LIGHT);
  box("entrance_handle_right", [0.12, 1.7, 3.84], [0.025, 0.38, 0.025], METAL_LIGHT);
  box("entrance_canopy", [0, 3.06, 4.22], [4.05, 0.26, 1.65], CONCRETE);
  box("entrance_canopy_shadow", [0, 2.89, 4.98], [3.78, 0.05, 1.32], CONCRETE_DEEP);

  for (let i = 0; i < 5; i++) {
    box(
      "entrance_step",
      [0, 0.46 + i * 0.11, 4.0 + i * 0.23],
      [3.25 - i * 0.2, 0.18, 0.42],
      i % 2 ? CONCRETE_LIGHT : CONCRETE_DARK,
    );
  }

  box("entrance_address_panel", [2.02, 2.07, 4.05], [0.48, 0.72, 0.08], CONCRETE_DEEP);
  box("address_1_vertical", [1.96, 2.12, 4.12], [0.055, 0.48, 0.025], RUST_LIGHT);
  box("address_0_top", [2.13, 2.34, 4.12], [0.16, 0.05, 0.025], RUST_LIGHT);
  box("address_0_bottom", [2.13, 1.9, 4.12], [0.16, 0.05, 0.025], RUST_LIGHT);
  box("address_0_left", [2.05, 2.12, 4.12], [0.05, 0.42, 0.025], RUST_LIGHT);
  box("address_0_right", [2.21, 2.12, 4.12], [0.05, 0.42, 0.025], RUST_LIGHT);

  // ---------------------------------------------------------------------------------------------------------------
  // Left stair tower: slit windows, landings, exposed stair flights and roof openings.

  for (let i = 0; i < 6; i++) {
    const y = 2.35 + i * 1.28;
    box("stair_slit", [-6.65, y, 3.07], [0.7, 0.58, 0.08], WINDOW_DARK);
    box("stair_slit_lintel", [-6.65, y + 0.37, 3.15], [0.9, 0.12, 0.23], CONCRETE_LIGHT);
    box("stair_slit_sill", [-6.65, y - 0.37, 3.15], [0.9, 0.12, 0.23], CONCRETE_DEEP);
  }

  for (let i = 0; i < 7; i++) {
    const y = 1.8 + i * 1.25;
    slab("stair_landing", [-6.65, y, 3.56], [1.7, 0.13, 1.1], CONCRETE_WARM);
    diagonal(
      "stair_flight",
      [-7.25, y - 0.48, 3.06],
      [-6.05, y + 0.35, 3.95],
      0.16,
      0.78,
      CONCRETE_DARK,
    );
  }

  box("stair_roof_box", [-6.65, 11.25, 0], [2.45, 1.15, 6.25], CONCRETE_DARK);
  box("stair_roof_hatch", [-6.65, 11.88, 2.72], [1.0, 0.12, 1.25], CONCRETE_PALE);
  box("stair_roof_louver", [-6.65, 11.58, 3.03], [1.28, 0.5, 0.1], WINDOW_DARK);

  // ---------------------------------------------------------------------------------------------------------------
  // Right service tower: narrow slit windows, utility cabinets, ladders and pipes.

  for (let i = 0; i < 5; i++) {
    const y = 2.6 + i * 1.48;
    box("service_slit", [5.62, y, 2.18], [0.1, 0.82, 0.48], WINDOW_DARK);
    box("service_slit_frame", [5.55, y, 2.18], [0.08, 1.03, 0.68], CONCRETE_PALE);
  }

  box("service_cabinet_a", [6.34, 4.1, 2.25], [0.22, 1.05, 1.12], CONCRETE_DEEP);
  box("service_cabinet_b", [6.34, 6.0, 2.25], [0.22, 0.75, 0.9], RUST);
  box("service_panel_face", [6.48, 6.0, 2.25], [0.03, 0.48, 0.58], RUST_LIGHT);

  for (let i = 0; i < 5; i++) {
    const y = 2.25 + i * 1.45;
    pipe("service_vertical_pipe", [5.52, y - 0.62, 2.72], [5.52, y + 0.62, 2.72], 0.035, METAL);
    box("service_pipe_clamp", [5.52, y, 2.72], [0.16, 0.08, 0.16], METAL_LIGHT);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Side facades: sparse windows and aggressive blank concrete fields.

  const sideWindowYs = [2.38, 3.92, 5.46, 7.0, 8.54];
  const sideWindowZs = [-2.15, -0.55, 1.05, 2.35];

  for (const side of [-1, 1]) {
    sideWindowYs.forEach((y, row) => {
      sideWindowZs.forEach((z, col) => {
        const id = row * 4 + col;
        const x = side * 5.78;
        box("side_window_recess", [x, y, z], [0.12, 1.05, 1.12], id % 6 === 0 ? WINDOW_BLUE : WINDOW_DARK);
        box("side_window_top", [side * 5.9, y + 0.61, z], [0.32, 0.14, 1.38], variant(id + 2));
        box("side_window_bottom", [side * 5.9, y - 0.61, z], [0.32, 0.14, 1.38], variant(id + 4));
        box("side_window_front_edge", [side * 5.9, y, z + 0.63], [0.32, 1.2, 0.14], CONCRETE_LIGHT);
        box("side_window_back_edge", [side * 5.9, y, z - 0.63], [0.32, 1.2, 0.14], CONCRETE_DARK);

        if ((row + col + (side > 0 ? 1 : 0)) % 8 === 0) {
          const lit = box("side_warm_window", [side * 5.94, y + 0.04, z], [0.035, 0.56, 0.34], LIT_WINDOW_PALE);
          glow(lit, 0.3);
        }
      });
    });

    for (let i = 0; i < 6; i++) {
      box(
        "side_vertical_seam",
        [side * 5.96, 2.25 + i * 1.45, -3.17],
        [0.08, 0.07, 5.8],
        i % 2 ? CONCRETE_DEEP : CONCRETE_PATCH,
      );
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Roof terraces and parapets.

  box("roof_main_slab", [0.55, 11.7, -0.05], [13.55, 0.32, 7.25], CONCRETE_PALE);
  box("roof_front_parapet", [0.55, 12.12, 3.18], [13.7, 0.68, 0.34], CONCRETE_LIGHT);
  box("roof_back_parapet", [0.55, 12.12, -3.23], [13.7, 0.68, 0.34], CONCRETE_DARK);
  box("roof_left_parapet", [-6.25, 12.12, -0.03], [0.34, 0.68, 6.2], CONCRETE_COLD);
  box("roof_right_parapet", [7.35, 12.12, -0.03], [0.34, 0.68, 6.2], CONCRETE_WARM);

  for (let i = 0; i < 8; i++) {
    box("parapet_vertical_joint", [-5.9 + i * 1.8, 12.13, 3.37], [0.08, 0.52, 0.04], CONCRETE_DEEP);
  }

  box("roof_mechanical_left", [-3.55, 12.65, -0.75], [3.2, 1.12, 2.25], CONCRETE_DARK);
  box("roof_mechanical_right", [2.25, 12.58, -0.9], [3.5, 0.96, 2.45], CONCRETE_COLD);
  box("roof_mechanical_cap_left", [-3.55, 13.23, -0.75], [3.45, 0.16, 2.48], CONCRETE_PALE);
  box("roof_mechanical_cap_right", [2.25, 13.08, -0.9], [3.72, 0.15, 2.68], CONCRETE_LIGHT);

  for (const x of [-4.65, -3.55, -2.45]) {
    box("mechanical_louver_left", [x, 12.68, 0.4], [0.68, 0.45, 0.08], WINDOW_DARK);
    box("mechanical_louver_left_top", [x, 12.97, 0.4], [0.8, 0.08, 0.16], CONCRETE_PALE);
  }

  for (const x of [1.15, 2.25, 3.35]) {
    box("mechanical_louver_right", [x, 12.58, 0.36], [0.7, 0.42, 0.08], WINDOW_DARK);
    box("mechanical_louver_right_top", [x, 12.84, 0.36], [0.82, 0.08, 0.16], CONCRETE_DARK);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Rooftop water tank, supports, ductwork, vents, and a skeletal maintenance cage.

  for (const x of [2.05, 3.35]) {
    for (const z of [-1.7, -0.65]) {
      box("tank_support", [x, 13.56, z], [0.18, 0.88, 0.18], CONCRETE_DEEP);
    }
  }

  cylinder("rooftop_water_tank", [2.7, 14.28, -1.18], 0.76, 1.45, CONCRETE_WARM, 10);
  cylinder("water_tank_cap", [2.7, 15.04, -1.18], 0.82, 0.18, CONCRETE_PALE, 10);
  cylinder("water_tank_base_ring", [2.7, 13.56, -1.18], 0.84, 0.16, CONCRETE_DARK, 10);
  box("water_tank_access_box", [2.7, 14.3, -0.42], [0.34, 0.52, 0.08], RUST);
  pipe("water_tank_overflow", [3.45, 14.15, -1.18], [3.45, 12.4, -1.18], 0.045, METAL);
  pipe("water_tank_top_pipe", [2.7, 15.15, -1.18], [2.7, 15.58, -1.18], 0.035, METAL_LIGHT);

  // Maintenance cage behind the tank.

  for (const x of [0.9, 4.45]) {
    box("maintenance_cage_post", [x, 13.45, -2.35], [0.08, 1.55, 0.08], METAL);
    box("maintenance_cage_post_front", [x, 13.45, -0.1], [0.08, 1.55, 0.08], METAL);
  }
  box("maintenance_cage_top", [2.68, 14.2, -1.23], [3.7, 0.08, 2.3], METAL_LIGHT);
  box("maintenance_cage_midrail", [2.68, 13.58, -0.1], [3.7, 0.06, 0.06], METAL);
  box("maintenance_cage_midrail_back", [2.68, 13.58, -2.35], [3.7, 0.06, 0.06], METAL);
  for (const x of [1.45, 2.05, 2.65, 3.25, 3.85]) {
    box("maintenance_cage_bar", [x, 13.45, -0.1], [0.045, 1.55, 0.045], METAL_LIGHT);
    box("maintenance_cage_bar_back", [x, 13.45, -2.35], [0.045, 1.55, 0.045], METAL_LIGHT);
  }

  // Roof vents.

  const ventPositions: V3[] = [
    [-1.05, 12.38, 1.2],
    [-0.15, 12.38, 1.2],
    [4.65, 12.32, 1.0],
    [5.35, 12.32, 1.0],
    [-5.2, 12.32, -2.0],
  ];

  ventPositions.forEach((p, i) => {
    box("roof_vent_base", [p[0], p[1], p[2]], [0.62, 0.28, 0.62], CONCRETE_DEEP);
    box("roof_vent_body", [p[0], p[1] + 0.36, p[2]], [0.45, 0.55, 0.45], variant(i + 1));
    box("roof_vent_lid", [p[0], p[1] + 0.68, p[2]], [0.62, 0.1, 0.62], CONCRETE_PALE);
    for (let j = 0; j < 3; j++) {
      box("roof_vent_slit", [p[0] - 0.18 + j * 0.18, p[1] + 0.34, p[2] + 0.24], [0.08, 0.25, 0.025], WINDOW_DARK);
    }
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Exterior fire-escape / maintenance balconies on the rear-facing side.

  for (let i = 0; i < 5; i++) {
    const y = 2.4 + i * 1.55;
    slab("rear_maintenance_platform", [-1.25, y, -3.63], [4.3, 0.14, 0.72], CONCRETE_COLD);
    box("rear_platform_front_beam", [-1.25, y + 0.12, -4.0], [4.35, 0.22, 0.14], CONCRETE_DARK);
    box("rear_platform_left_wall", [-3.28, y + 0.42, -3.68], [0.16, 0.68, 0.7], CONCRETE_LIGHT);
    box("rear_platform_right_wall", [0.78, y + 0.42, -3.68], [0.16, 0.68, 0.7], CONCRETE_PALE);
    for (let j = 0; j < 7; j++) {
      box("rear_guardrail_bar", [-2.85 + j * 0.53, y + 0.45, -4.0], [0.05, 0.7, 0.05], METAL);
    }
  }

  pipe("rear_downpipe", [1.65, 10.55, -4.08], [1.65, 0.7, -4.08], 0.045, RUST_LIGHT);
  pipe("rear_downpipe_bend", [1.65, 0.7, -4.08], [1.65, 0.7, -4.52], 0.045, RUST_LIGHT);

  // ---------------------------------------------------------------------------------------------------------------
  // Deep facade scars, patch plates, service conduits, and concrete repair details.

  const patchLocations: V3[] = [
    [-4.95, 9.55, 3.51],
    [-3.7, 7.22, 3.51],
    [-1.8, 2.04, 3.51],
    [1.8, 6.55, 3.51],
    [4.86, 8.9, 3.51],
    [4.95, 2.08, 3.51],
    [-5.35, 4.65, 3.51],
    [0.15, 9.76, 3.51],
  ];

  patchLocations.forEach((p, i) => {
    box("facade_repair_patch", p, [0.38 + (i % 3) * 0.12, 0.08, 0.035], variant(i + 2));
    box(
      "facade_repair_patch_shadow",
      [p[0] + 0.18, p[1] - 0.07, p[2] + 0.025],
      [0.05, 0.21 + (i % 2) * 0.13, 0.025],
      CONCRETE_DEEP,
    );
  });

  for (const x of [-5.25, -4.95, 5.0, 5.28]) {
    pipe("front_service_conduit", [x, 1.68, 3.74], [x, 9.8, 3.74], 0.022, METAL);
    for (const y of [2.7, 5.2, 7.7, 9.2]) {
      box("conduit_clamp", [x, y, 3.75], [0.16, 0.06, 0.06], METAL_LIGHT);
    }
  }

  // Small inset electrical boxes and intercoms make the lower facade inhabited.

  const utilityXs = [-5.5, -3.95, 3.95, 5.5];
  utilityXs.forEach((x, i) => {
    box("utility_box", [x, 1.98, 4.0], [0.48, 0.72, 0.1], i % 2 ? CONCRETE_DARK : RUST);
    box("utility_box_face", [x, 2.0, 4.07], [0.3, 0.46, 0.025], BLACK);
    for (let j = 0; j < 3; j++) {
      box("utility_box_slot", [x - 0.1 + j * 0.1, 2.02, 4.1], [0.04, 0.22, 0.025], METAL_LIGHT);
    }
  });

  // ---------------------------------------------------------------------------------------------------------------
  // Chunky roof-edge buttresses and projecting corner masses.

  diagonal("left_corner_buttress", [-5.95, 1.7, 2.95], [-5.95, 8.65, 2.95], 0.42, 0.46, CONCRETE_DEEP);
  diagonal("right_corner_buttress", [5.95, 1.7, 2.95], [5.95, 8.65, 2.95], 0.42, 0.46, CONCRETE_LIGHT);

  for (const side of [-1, 1]) {
    box("upper_corner_block", [side * 5.1, 10.45, 2.55], [1.25, 1.3, 1.18], side > 0 ? CONCRETE_PALE : CONCRETE_DARK);
    box("upper_corner_shadow", [side * 5.1, 10.4, 3.18], [1.48, 1.0, 0.12], SHADOW_CONCRETE);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Roof signage / abstract concrete fins: not commercial, just a strong sculptural silhouette.

  box("roof_sculptural_fin_left", [-1.0, 13.3, 2.42], [0.32, 2.0, 0.46], CONCRETE_PALE);
  box("roof_sculptural_fin_mid", [-0.15, 13.15, 2.42], [0.22, 1.68, 0.38], CONCRETE_DARK);
  box("roof_sculptural_fin_right", [0.65, 13.42, 2.42], [0.4, 2.22, 0.52], CONCRETE_LIGHT);
  diagonal("roof_sculptural_brace", [-1.0, 12.42, 2.42], [0.65, 12.62, 2.42], 0.14, 0.48, CONCRETE_DEEP);

  // A few horizontal scars under the roof emphasize the poured-concrete construction.

  for (let i = 0; i < 10; i++) {
    const x = -5.3 + i * 1.15;
    box("roof_pour_seam", [x, 11.02 + (i % 2) * 0.12, 3.48], [0.58, 0.055, 0.04], CONCRETE_DEEP);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Ground-level corner bollards and drainage slots, kept subordinate to the building.

  for (const x of [-6.2, -4.2, 4.2, 6.2]) {
    cylinder("concrete_bollard", [x, 0.72, 4.78], 0.16, 0.72, CONCRETE_DARK, 6);
    cylinder("bollard_cap", [x, 1.1, 4.78], 0.19, 0.09, CONCRETE_PALE, 6);
  }

  for (let i = 0; i < 12; i++) {
    box("podium_drain_slot", [-5.65 + i * 1.03, 0.54, 4.63], [0.34, 0.035, 0.04], BLACK);
  }

  // Final low slabs and little offsets make the contact with the ground feel deliberately heavy.

  box("front_ground_shadow", [0, 0.46, 4.78], [13.4, 0.1, 0.24], CONCRETE_DEEP);
  box("left_ground_shadow", [-7.18, 0.47, 0], [0.2, 0.1, 8.8], CONCRETE_DARK);
  box("right_ground_shadow", [7.18, 0.47, 0], [0.2, 0.1, 8.8], CONCRETE_LIGHT);

  return b.root;
}
```