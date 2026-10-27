import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "brutalist-housing-block",
  description:
    "A low-poly raw-concrete brutalist housing block with stepped massing, deep window bays, projecting balconies, heavy fins, rooftop machinery, vents, and a monumental recessed entrance.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = "#8b8d87";
  const CONCRETE_LIGHT = "#a8aaa3";
  const CONCRETE_DARK = "#666a67";
  const SHADOW_CONCRETE = "#505552";
  const WINDOW = "#172329";
  const WINDOW_BLUE = "#263b43";
  const GLASS_LIGHT = "#46616a";
  const RAIL = "#343a39";
  const DOOR = "#202827";
  const METAL = "#777e78";
  const RUST = "#68483b";
  const PLANT = "#4d6355";

  const cube = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color = CONCRETE,
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      group: "architecture",
    });
  };

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color = CONCRETE_DARK,
    radial = 8,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, radial, 1, false),
      color,
      { at, name, group: "architecture" },
    );
  };

  const frontWindow = (
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    color = WINDOW,
  ) => {
    cube(name + "_glass", [w, h, 0.055], [x, y, 1.735], color);
    cube(name + "_top", [w + 0.095, 0.075, 0.12], [x, y + h / 2 + 0.045, 1.70], CONCRETE_LIGHT);
    cube(name + "_bottom", [w + 0.095, 0.075, 0.12], [x, y - h / 2 - 0.045, 1.70], CONCRETE_DARK);
    cube(name + "_left", [0.075, h + 0.09, 0.12], [x - w / 2 - 0.045, y, 1.70], CONCRETE_LIGHT);
    cube(name + "_right", [0.075, h + 0.09, 0.12], [x + w / 2 + 0.045, y, 1.70], CONCRETE_DARK);
    cube(name + "_mullion", [0.035, h - 0.02, 0.13], [x, y, 1.70], CONCRETE_DARK);
  };

  const sideWindow = (
    name: string,
    x: number,
    y: number,
    z: number,
    side: number,
    w: number,
    h: number,
  ) => {
    cube(name + "_glass", [0.055, h, w], [x, y, z], WINDOW_BLUE);
    cube(name + "_top", [0.12, 0.075, w + 0.09], [x, y + h / 2 + 0.045, z], CONCRETE_LIGHT);
    cube(name + "_bottom", [0.12, 0.075, w + 0.09], [x, y - h / 2 - 0.045, z], CONCRETE_DARK);
    cube(name + "_outer", [0.12, h + 0.09, 0.075], [x + side * 0.035, y, z - w / 2 - 0.045], CONCRETE_DARK);
    cube(name + "_inner", [0.12, h + 0.09, 0.075], [x + side * 0.035, y, z + w / 2 + 0.045], CONCRETE_LIGHT);
  };

  const balcony = (index: number, x: number, y: number, width: number, depth: number) => {
    const z = 1.98;
    cube(`balcony${index}_slab`, [width, 0.15, depth], [x, y - 0.30, z + depth / 2], CONCRETE_DARK);
    cube(`balcony${index}_underside`, [width + 0.08, 0.12, depth + 0.08], [x, y - 0.39, z + depth / 2], SHADOW_CONCRETE);

    const railY = y + 0.12;
    const railZ = z + depth - 0.10;
    cube(`balcony${index}_rail_top`, [width, 0.07, 0.07], [x, railY, railZ], RAIL);
    cube(`balcony${index}_rail_bottom`, [width, 0.055, 0.055], [x, y - 0.10, railZ], RAIL);
    const posts = Math.max(3, Math.round(width / 0.28));
    for (let p = 0; p < posts; p++) {
      const px = x - width / 2 + (width * p) / (posts - 1);
      cube(`balcony${index}_post${p}`, [0.045, 0.48, 0.045], [px, y + 0.01, railZ], RAIL);
    }

    cube(`balcony${index}_sideL`, [0.10, 0.52, depth], [x - width / 2, y - 0.02, z + depth / 2], CONCRETE_LIGHT);
    cube(`balcony${index}_sideR`, [0.10, 0.52, depth], [x + width / 2, y - 0.02, z + depth / 2], CONCRETE_DARK);
  };

  const planter = (name: string, x: number, y: number, z: number, width: number) => {
    cube(name + "_box", [width, 0.18, 0.34], [x, y, z], CONCRETE_DARK);
    cube(name + "_soil", [width - 0.05, 0.035, 0.25], [x, y + 0.105, z], "#302d27");
    for (let i = 0; i < Math.max(3, Math.floor(width / 0.18)); i++) {
      const px = x - width / 2 + 0.09 + i * 0.17;
      cylinder(name + "_plant" + i, 0.025, 0.17 + (i % 3) * 0.035, [px, y + 0.20, z], PLANT, 5);
      cube(name + "_leaf" + i, [0.12, 0.025, 0.035], [px + 0.035, y + 0.27, z], PLANT);
    }
  };

  // Main monolithic housing mass.
  cube("main_mass", [5.9, 4.20, 3.42], [0, 2.20, 0], CONCRETE);
  cube("lower_shadow_band", [6.02, 0.28, 3.54], [0, 0.25, 0], CONCRETE_DARK);
  cube("base_plinth", [6.35, 0.22, 3.82], [0, 0.11, 0], SHADOW_CONCRETE);

  // Strong side cores and offset upper blocks create an uneven brutalist silhouette.
  cube("left_service_core", [0.72, 4.58, 3.62], [2.59, 2.37, -0.02], CONCRETE_DARK);
  cube("right_service_core", [0.72, 4.02, 3.62], [-2.59, 2.08, -0.02], CONCRETE_LIGHT);
  cube("upper_offset_block", [4.20, 0.65, 3.66], [0.34, 4.33, -0.02], CONCRETE_LIGHT);
  cube("upper_recess_shadow", [3.10, 0.18, 3.72], [0.62, 3.91, 0.0], SHADOW_CONCRETE);
  cube("roof_cap", [6.26, 0.20, 3.78], [0, 4.67, 0], CONCRETE_DARK);

  // Roof parapet, deliberately chunky and irregular.
  cube("parapet_front", [6.25, 0.34, 0.18], [0, 4.85, 1.79], CONCRETE_LIGHT);
  cube("parapet_back", [6.25, 0.30, 0.18], [0, 4.83, -1.79], CONCRETE_DARK);
  cube("parapet_left", [0.18, 0.34, 3.45], [3.04, 4.85, 0], CONCRETE_DARK);
  cube("parapet_right", [0.18, 0.32, 3.45], [-3.04, 4.83, 0], CONCRETE_LIGHT);
  cube("roof_step_high", [1.38, 0.28, 1.15], [1.72, 5.08, -0.42], CONCRETE_DARK);
  cube("roof_step_low", [1.05, 0.18, 0.82], [-1.62, 5.01, -0.54], CONCRETE_LIGHT);

  // Repeated front elevation: deep punched-in windows and heavy floor bands.
  const bays = [-2.25, -1.35, -0.45, 0.45, 1.35, 2.25];
  const floors = [0.85, 1.63, 2.41, 3.19, 3.78];
  for (let f = 0; f < floors.length; f++) {
    cube(`front_floor_band_${f}`, [5.78, 0.13, 0.22], [0, floors[f] - 0.34, 1.70], CONCRETE_DARK);
    cube(`front_floor_shadow_${f}`, [5.72, 0.07, 0.18], [0, floors[f] - 0.42, 1.72], SHADOW_CONCRETE);

    for (let j = 0; j < bays.length; j++) {
      const x = bays[j];
      const h = f === 4 ? 0.39 : 0.47;
      const windowColor = (f + j) % 4 === 0 ? GLASS_LIGHT : WINDOW;
      frontWindow(`front_f${f}_b${j}`, x, floors[f], 0.69, h, windowColor);

      if ((f + j) % 3 === 0) {
        cube(`shutter_f${f}_b${j}`, [0.075, h + 0.03, 0.16], [x - 0.39, floors[f], 1.69], CONCRETE_DARK);
      }
      if ((f + j) % 4 === 1) {
        cube(`sunshade_f${f}_b${j}`, [0.78, 0.055, 0.30], [x, floors[f] + 0.30, 1.80], CONCRETE_LIGHT);
      }
    }
  }

  // Vertical front fins divide the elevation into monolithic structural bays.
  for (let i = 0; i < 7; i++) {
    const x = -2.70 + i * 0.90;
    cube(`front_vertical_fin_${i}`, [0.13, 3.94, 0.28], [x, 2.30, 1.73], i % 2 ? CONCRETE_LIGHT : CONCRETE_DARK);
  }

  // Asymmetrical balcony stack.
  balcony(0, -1.80, 1.62, 1.28, 0.70);
  balcony(1, 1.76, 2.40, 1.30, 0.74);
  balcony(2, -0.96, 3.18, 1.30, 0.68);
  balcony(3, 1.84, 3.96, 1.18, 0.68);
  planter("planter0", -1.80, 1.48, 2.27, 0.72);
  planter("planter1", 1.76, 2.26, 2.28, 0.78);
  planter("planter2", -0.96, 3.04, 2.25, 0.72);

  // Deep side elevations.
  const sideLevels = [0.86, 1.65, 2.44, 3.23];
  for (let f = 0; f < sideLevels.length; f++) {
    cube(`left_side_band_${f}`, [0.22, 0.12, 3.40], [2.92, sideLevels[f] - 0.34, 0], CONCRETE_DARK);
    cube(`right_side_band_${f}`, [0.22, 0.12, 3.40], [-2.92, sideLevels[f] - 0.34, 0], CONCRETE_LIGHT);
    sideWindow(`left_side_f${f}_a`, 2.955, sideLevels[f], -0.85, 1, 0.48, 0.45);
    sideWindow(`left_side_f${f}_b`, 2.955, sideLevels[f], 0.15, 1, 0.48, 0.45);
    sideWindow(`left_side_f${f}_c`, 2.955, sideLevels[f], 1.10, 1, 0.40, 0.45);
    sideWindow(`right_side_f${f}_a`, -2.955, sideLevels[f], -1.10, -1, 0.40, 0.45);
    sideWindow(`right_side_f${f}_b`, -2.955, sideLevels[f], -0.12, -1, 0.48, 0.45);
    sideWindow(`right_side_f${f}_c`, -2.955, sideLevels[f], 0.88, -1, 0.48, 0.45);
  }

  // Tall edge buttresses, slightly proud of the facade.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      cube(
        `buttress_${side > 0 ? "L" : "R"}_${i}`,
        [0.22, 4.12 - i * 0.12, 0.36],
        [side * (2.94 - i * 0.04), 2.28 + i * 0.06, -1.25 + i * 1.18],
        i % 2 ? CONCRETE_LIGHT : CONCRETE_DARK,
      );
    }
  }

  // Rear face: fewer openings, massive service slabs.
  cube("rear_spine", [2.15, 3.65, 0.22], [0, 2.34, -1.76], CONCRETE_DARK);
  for (let f = 0; f < 4; f++) {
    const y = 0.88 + f * 0.80;
    for (let j = 0; j < 4; j++) {
      const x = -1.95 + j * 1.30;
      cube(`rear_window_${f}_${j}`, [0.76, 0.42, 0.055], [x, y, -1.79], WINDOW);
      cube(`rear_lintel_${f}_${j}`, [0.86, 0.07, 0.12], [x, y + 0.25, -1.76], CONCRETE_LIGHT);
      cube(`rear_sill_${f}_${j}`, [0.86, 0.07, 0.12], [x, y - 0.25, -1.76], CONCRETE_DARK);
    }
    cube(`rear_band_${f}`, [5.75, 0.12, 0.18], [0, y - 0.36, -1.76], CONCRETE_DARK);
  }

  // Monumental recessed entrance, centered but deliberately heavy.
  cube("entrance_portal_left", [0.38, 2.42, 0.62], [-0.92, 1.28, 1.83], CONCRETE_DARK);
  cube("entrance_portal_right", [0.38, 2.42, 0.62], [0.92, 1.28, 1.83], CONCRETE_LIGHT);
  cube("entrance_portal_top", [2.22, 0.42, 0.62], [0, 2.40, 1.83], CONCRETE_LIGHT);
  cube("entrance_recess", [1.55, 2.02, 0.08], [0, 1.18, 1.78], DOOR);
  cube("entrance_door_left", [0.70, 1.72, 0.055], [-0.38, 1.12, 1.84], WINDOW_BLUE);
  cube("entrance_door_right", [0.70, 1.72, 0.055], [0.38, 1.12, 1.84], DOOR);
  cube("door_mullion", [0.07, 1.72, 0.10], [0, 1.12, 1.87], METAL);
  cube("door_bar_left", [0.24, 0.055, 0.07], [-0.38, 1.12, 1.90], METAL);
  cube("door_bar_right", [0.24, 0.055, 0.07], [0.38, 1.12, 1.90], METAL);
  cube("entrance_canopy", [2.50, 0.16, 1.00], [0, 2.58, 2.12], CONCRETE_DARK);
  cube("entrance_canopy_shadow", [2.22, 0.10, 0.82], [0, 2.48, 2.20], SHADOW_CONCRETE);

  // Entry stair and broad landing.
  cube("entry_landing", [2.45, 0.12, 1.12], [0, 0.19, 2.18], CONCRETE_LIGHT);
  cube("entry_step_1", [2.18, 0.12, 0.32], [0, 0.11, 2.72], CONCRETE_DARK);
  cube("entry_step_2", [1.88, 0.10, 0.28], [0, 0.055, 2.98], CONCRETE_LIGHT);
  for (const side of [-1, 1]) {
    cube(`entry_bollard_${side}_a`, [0.14, 0.42, 0.14], [side * 1.15, 0.37, 2.65], RAIL);
    cube(`entry_bollard_${side}_b`, [0.14, 0.58, 0.14], [side * 1.15, 0.64, 2.65], RAIL);
  }

  // Rooftop service yard: blocky plant rooms, ducts, tanks, and a small satellite dish.
  cube("roof_plant_room", [1.55, 0.92, 1.15], [-1.35, 5.25, -0.38], CONCRETE_DARK);
  cube("roof_plant_room_cap", [1.72, 0.14, 1.30], [-1.35, 5.78, -0.38], CONCRETE_LIGHT);
  cube("roof_plant_door", [0.62, 0.54, 0.055], [-1.35, 5.23, 0.22], DOOR);
  cube("roof_vent_block", [1.06, 0.62, 0.86], [0.72, 5.05, -0.40], CONCRETE_LIGHT);
  cube("roof_vent_shadow", [0.78, 0.12, 0.70], [0.72, 5.40, -0.40], SHADOW_CONCRETE);

  for (let i = 0; i < 5; i++) {
    cylinder(`roof_duct_${i}`, 0.11, 0.32 + (i % 2) * 0.12, [1.28 + i * 0.22, 5.10, -0.88], METAL, 8);
    cube(`roof_duct_cap_${i}`, [0.27, 0.06, 0.27], [1.28 + i * 0.22, 5.28 + (i % 2) * 0.06, -0.88], CONCRETE_DARK);
  }

  // Cylindrical rooftop water tank with concrete supports.
  cylinder("water_tank_body", 0.48, 0.82, [2.05, 5.26, 0.55], CONCRETE_DARK, 10);
  cylinder("water_tank_top", 0.43, 0.10, [2.05, 5.72, 0.55], CONCRETE_LIGHT, 10);
  cylinder("water_tank_bottom", 0.43, 0.08, [2.05, 4.84, 0.55], SHADOW_CONCRETE, 10);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    cube(
      `water_tank_leg_${i}`,
      [0.10, 0.42, 0.10],
      [2.05 + Math.cos(a) * 0.30, 4.72, 0.55 + Math.sin(a) * 0.30],
      METAL,
    );
  }
  cube("water_tank_pipe", [0.08, 0.72, 0.08], [1.58, 5.18, 0.55], RUST);
  cube("water_tank_pipe_elbow", [0.18, 0.08, 0.08], [1.67, 4.84, 0.55], RUST);

  // Roof antenna mast and angular dish.
  cylinder("antenna_mast", 0.045, 1.24, [-2.25, 5.56, 0.70], METAL, 8);
  cylinder("antenna_base", 0.16, 0.10, [-2.25, 4.96, 0.70], CONCRETE_DARK, 8);
  b.part(
    new THREE.ConeGeometry(0.42, 0.12, 8, 1, true),
    METAL,
    { at: [-2.25, 5.82, 0.70], dir: [0, 1, 0], name: "antenna_dish", group: "architecture" },
  );
  cube("antenna_crossbar", [0.62, 0.045, 0.045], [-2.25, 5.98, 0.70], METAL);

  // A few large concrete scars and horizontal construction joints for raw massing.
  for (let i = 0; i < 6; i++) {
    cube(`scar_front_${i}`, [0.38 + (i % 2) * 0.22, 0.045, 0.025], [-2.55 + i * 0.86, 3.62 - (i % 3) * 0.06, 1.865], CONCRETE_DARK);
  }
  for (let i = 0; i < 5; i++) {
    cube(`scar_side_${i}`, [0.025, 0.30 + (i % 2) * 0.20, 0.045], [3.02, 1.02 + i * 0.63, -1.36 + (i % 2) * 0.20], SHADOW_CONCRETE);
  }

  // Repetitive square ventilation grilles on the service cores.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const x = side * 2.98;
      const z = -0.82 + i * 0.54;
      cube(`service_grille_${side}_${i}_outer`, [0.055, 0.36, 0.42], [x, 3.58, z], DOOR);
      for (let j = 0; j < 4; j++) {
        cube(
          `service_grille_${side}_${i}_bar${j}`,
          [0.075, 0.025, 0.48],
          [x + side * 0.035, 3.45 + j * 0.09, z],
          METAL,
        );
      }
    }
  }

  return b.root;
}
