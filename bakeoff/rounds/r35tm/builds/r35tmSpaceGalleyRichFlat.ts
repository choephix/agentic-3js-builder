import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A dense industrial spaceship galley prop group inspired by 1970s retro-futurist spacecraft interiors: olive-grey cabinets, ribbed bulkheads, a battered worktop, sink, stove, vents, pipes, CRT controls, warning stripes, mugs, utensils and fluorescent lighting.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo_galley", detail: 1 });

  const FLOOR = "#343735";
  const FLOOR_EDGE = "#171a19";
  const WALL = "#59605a";
  const WALL_DARK = "#303532";
  const PANEL = "#70776d";
  const PANEL_DARK = "#454b46";
  const OLIVE = "#69715f";
  const OLIVE_DARK = "#41483d";
  const STEEL = "#9a9d92";
  const STEEL_DARK = "#4b514c";
  const ALUMINUM = "#c1c0ac";
  const BLACK = "#151918";
  const RUBBER = "#272b29";
  const RUST = "#713e2c";
  const ORANGE = "#b65b27";
  const RED = "#9b3028";
  const WARNING = "#d29a27";
  const CREAM = "#d8d0a9";
  const GREEN = "#89a47d";
  const SCREEN = "#8ca58d";
  const CYAN = "#73a39a";
  const BLUE = "#496c75";
  const WHITE = "#ded9bf";

  const rand = rng(1979);

  function box(
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      ...opts,
    });
  }

  function cyl(
    name: string,
    radius: number,
    length: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    segments = 10,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, length, segments), color, {
      at,
      dir,
      name,
    });
  }

  function rod(
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
  ) {
    return b.rod(a, c, radius, { color, name });
  }

  function bolt(
    name: string,
    at: [number, number, number],
    r = 0.018,
    color = STEEL,
    dir: [number, number, number] = [0, 0, 1],
  ) {
    return b.part(new THREE.SphereGeometry(r, 8, 5), color, {
      at,
      dir,
      name,
    });
  }

  function grille(
    name: string,
    at: [number, number, number],
    width: number,
    height: number,
    rows: number,
    color = BLACK,
  ) {
    box(`${name}_frameTop`, [width, 0.025, 0.025], [at[0], at[1] + height / 2, at[2]], color);
    box(`${name}_frameBottom`, [width, 0.025, 0.025], [at[0], at[1] - height / 2, at[2]], color);
    box(`${name}_frameL`, [0.025, height, 0.025], [at[0] - width / 2, at[1], at[2]], color);
    box(`${name}_frameR`, [0.025, height, 0.025], [at[0] + width / 2, at[1], at[2]], color);
    for (let i = 1; i < rows; i++) {
      const y = at[1] - height / 2 + (height * i) / rows;
      box(`${name}_bar${i}`, [width - 0.025, 0.012, 0.018], [at[0], y, at[2]], color);
    }
  }

  function warningStripe(
    name: string,
    x: number,
    y: number,
    z: number,
    width: number,
    count: number,
    vertical = false,
  ) {
    const cell = width / count;
    for (let i = 0; i < count; i++) {
      const col = i % 2 === 0 ? WARNING : BLACK;
      if (vertical) {
        box(
          `${name}_${i}`,
          [0.018, cell * 0.96, 0.012],
          [x, y - width / 2 + cell * (i + 0.5), z],
          col,
        );
      } else {
        box(
          `${name}_${i}`,
          [cell * 0.96, 0.018, 0.012],
          [x - width / 2 + cell * (i + 0.5), y, z],
          col,
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Floor, rear bulkhead, ceiling service rail and side partitions
  // ---------------------------------------------------------------------------

  box("floor_plate", [3.05, 0.08, 1.62], [0, 0.04, 0], FLOOR_EDGE);
  box("floor_inset", [2.82, 0.035, 1.40], [0, 0.105, 0.02], FLOOR);
  box("floor_front_sill", [2.92, 0.16, 0.12], [0, 0.16, 0.72], BLACK);
  box("floor_left_sill", [0.12, 0.13, 1.38], [-1.40, 0.145, 0.02], BLACK);
  box("floor_right_sill", [0.12, 0.13, 1.38], [1.40, 0.145, 0.02], BLACK);

  box("rear_bulkhead", [3.0, 2.38, 0.12], [0, 1.25, -0.67], WALL_DARK);
  box("rear_inner_panel", [2.78, 2.12, 0.045], [0, 1.28, -0.60], WALL);
  box("left_partition", [0.12, 2.28, 1.46], [-1.47, 1.22, 0], WALL_DARK);
  box("right_partition", [0.12, 2.28, 1.46], [1.47, 1.22, 0], WALL_DARK);
  box("ceiling_beam", [3.0, 0.16, 1.48], [0, 2.38, -0.01], BLACK);
  box("ceiling_inner", [2.78, 0.045, 1.30], [0, 2.30, -0.01], PANEL_DARK);

  // Rear bulkhead ribs and framed industrial panels.
  for (let i = -5; i <= 5; i++) {
    const x = i * 0.235;
    box(`bulkhead_rib_${i}`, [0.055, 2.05, 0.07], [x, 1.29, -0.545], PANEL_DARK);
    bolt(`bulkhead_boltL_${i}`, [x - 0.075, 2.17, -0.495], 0.014, STEEL);
    bolt(`bulkhead_boltB_${i}`, [x + 0.075, 0.39, -0.495], 0.014, STEEL);
  }

  box("rear_upper_header", [2.75, 0.18, 0.10], [0, 2.08, -0.49], OLIVE_DARK);
  box("rear_lower_header", [2.75, 0.12, 0.10], [0, 0.45, -0.49], OLIVE_DARK);
  box("rear_warning_band", [1.25, 0.05, 0.015], [-0.65, 1.98, -0.475], WARNING);
  warningStripe("header_warning", -0.65, 2.035, -0.465, 0.92, 8);

  // ---------------------------------------------------------------------------
  // Lower galley cabinets
  // ---------------------------------------------------------------------------

  box("lower_cabinet_left", [0.88, 0.72, 0.62], [-0.96, 0.56, -0.06], OLIVE_DARK);
  box("lower_cabinet_center", [0.90, 0.72, 0.62], [0, 0.56, -0.06], PANEL_DARK);
  box("lower_cabinet_right", [0.88, 0.72, 0.62], [0.96, 0.56, -0.06], OLIVE_DARK);

  box("cabinet_left_face", [0.76, 0.56, 0.035], [-0.96, 0.56, 0.265], OLIVE);
  box("cabinet_center_face", [0.78, 0.56, 0.035], [0, 0.56, 0.265], PANEL);
  box("cabinet_right_face", [0.76, 0.56, 0.035], [0.96, 0.56, 0.265], OLIVE);

  for (const x of [-0.96, 0, 0.96]) {
    box(`cabinet_seam_${x}`, [0.028, 0.56, 0.045], [x, 0.56, 0.29], BLACK);
    box(`cabinet_top_seam_${x}`, [0.76, 0.025, 0.04], [x, 0.83, 0.285], BLACK);
    bolt(`cabinet_bolt_top_${x}`, [x - 0.31, 0.78, 0.31], 0.016, STEEL_DARK);
    bolt(`cabinet_bolt_bottom_${x}`, [x + 0.31, 0.34, 0.31], 0.016, STEEL_DARK);
  }

  // Door pulls.
  rod("left_pull", [-1.21, 0.57, 0.32], [-0.71, 0.57, 0.32], 0.018, STEEL);
  rod("center_pull", [-0.24, 0.57, 0.32], [0.24, 0.57, 0.32], 0.018, STEEL);
  rod("right_pull", [0.71, 0.57, 0.32], [1.21, 0.57, 0.32], 0.018, STEEL);

  warningStripe("left_door_warning", -1.31, 0.33, 0.31, 0.40, 5, true);
  warningStripe("right_door_warning", 1.31, 0.33, 0.31, 0.40, 5, true);

  // Worktop, thick edge and rear splashback.
  box("worktop_core", [2.86, 0.15, 0.78], [0, 0.96, -0.03], STEEL_DARK);
  box("worktop_surface", [2.78, 0.075, 0.72], [0, 1.07, -0.01], STEEL);
  box("worktop_front_edge", [2.84, 0.09, 0.07], [0, 1.00, 0.36], ALUMINUM);
  box("worktop_rear_lip", [2.76, 0.14, 0.08], [0, 1.14, -0.37], BLACK);
  box("worktop_left_cap", [0.06, 0.18, 0.78], [-1.43, 1.05, -0.03], PANEL_DARK);
  box("worktop_right_cap", [0.06, 0.18, 0.78], [1.43, 1.05, -0.03], PANEL_DARK);

  for (let i = -12; i <= 12; i++) {
    box(`worktop_score_${i}`, [0.012, 0.008, 0.61], [i * 0.105, 1.112, -0.02], STEEL_DARK);
  }

  // ---------------------------------------------------------------------------
  // Sink basin and industrial faucet
  // ---------------------------------------------------------------------------

  box("sink_outer", [0.76, 0.08, 0.50], [-0.82, 1.125, -0.02], BLACK);
  box("sink_basin", [0.68, 0.09, 0.42], [-0.82, 1.16, -0.02], STEEL_DARK);
  box("sink_bottom", [0.54, 0.025, 0.28], [-0.82, 1.205, -0.02], BLACK);
  box("sink_drain", [0.06, 0.018, 0.06], [-0.82, 1.225, -0.02], STEEL);
  cyl("drain_ring", 0.075, 0.012, [-0.82, 1.238, -0.02], STEEL_DARK, [0, 1, 0], 12);
  cyl("faucet_base", 0.075, 0.045, [-0.82, 1.18, -0.34], STEEL_DARK);
  rod("faucet_riser", [-0.82, 1.20, -0.34], [-0.82, 1.60, -0.34], 0.035, STEEL);
  rod("faucet_arm", [-0.82, 1.60, -0.34], [-0.82, 1.60, -0.05], 0.035, STEEL);
  cyl("faucet_nozzle", 0.045, 0.12, [-0.82, 1.55, -0.02], STEEL_DARK, [0, -1, 0]);
  cyl("hot_valve", 0.055, 0.035, [-0.62, 1.19, -0.34], RED, [0, 1, 0], 8);
  cyl("cold_valve", 0.055, 0.035, [-1.02, 1.19, -0.34], BLUE, [0, 1, 0], 8);

  // A battered kettle in the sink.
  cyl("kettle_body", 0.18, 0.26, [-0.80, 1.34, -0.01], STEEL_DARK, [0, 1, 0], 10);
  cyl("kettle_lid", 0.13, 0.035, [-0.80, 1.49, -0.01], STEEL, [0, 1, 0], 10);
  cyl("kettle_knob", 0.035, 0.04, [-0.80, 1.535, -0.01], BLACK, [0, 1, 0], 8);
  rod("kettle_handleL", [-0.98, 1.39, -0.01], [-0.97, 1.66, -0.01], 0.025, BLACK);
  rod("kettle_handleR", [-0.62, 1.39, -0.01], [-0.63, 1.66, -0.01], 0.025, BLACK);
  rod("kettle_handleTop", [-0.97, 1.66, -0.01], [-0.63, 1.66, -0.01], 0.025, BLACK);
  rod("kettle_spout", [-0.64, 1.43, -0.01], [-0.47, 1.52, -0.01], 0.028, STEEL_DARK);

  // ---------------------------------------------------------------------------
  // Stove and oven section
  // ---------------------------------------------------------------------------

  box("stove_body", [0.88, 0.58, 0.64], [0.52, 0.60, -0.02], BLACK);
  box("stove_face", [0.72, 0.42, 0.035], [0.52, 0.65, 0.315], PANEL_DARK);
  box("oven_window_frame", [0.52, 0.22, 0.035], [0.52, 0.61, 0.34], STEEL_DARK);
  box("oven_window", [0.45, 0.14, 0.012], [0.52, 0.61, 0.363], BLACK);
  box("oven_glow", [0.31, 0.075, 0.006], [0.52, 0.60, 0.371], ORANGE);
  rod("oven_handle", [0.25, 0.78, 0.39], [0.79, 0.78, 0.39], 0.022, STEEL);
  for (let i = 0; i < 4; i++) {
    cyl(`stove_knob_${i}`, 0.038, 0.035, [0.25 + i * 0.18, 0.91, 0.33], i % 2 ? RED : STEEL, [0, 0, 1], 8);
    box(`stove_knob_mark_${i}`, [0.012, 0.08, 0.014], [0.25 + i * 0.18, 0.985, 0.355], WHITE);
  }

  box("stove_top", [0.82, 0.07, 0.63], [0.52, 0.92, -0.02], STEEL_DARK);
  for (const x of [0.30, 0.74]) {
    cyl("burner_outer", 0.17, 0.018, [x, 0.97, -0.02], BLACK, [0, 1, 0], 12);
    cyl("burner_inner", 0.10, 0.022, [x, 0.985, -0.02], STEEL, [0, 1, 0], 10);
    cyl("burner_center", 0.045, 0.024, [x, 0.997, -0.02], RED, [0, 1, 0], 8);
  }

  // Exhaust hood.
  box("hood_body", [1.02, 0.32, 0.62], [0.48, 1.94, -0.02], PANEL_DARK);
  box("hood_lower_lip", [1.08, 0.08, 0.70], [0.48, 1.76, -0.02], BLACK);
  box("hood_light", [0.60, 0.045, 0.22], [0.48, 1.80, 0.24], CREAM);
  box("hood_light_glow", [0.50, 0.012, 0.12], [0.48, 1.825, 0.247], WHITE);
  grille("hood_grille", [0.48, 1.91, 0.31], 0.70, 0.24, 7, BLACK);
  for (let i = 0; i < 5; i++) {
    bolt(`hood_bolt_${i}`, [0.10 + i * 0.19, 1.79, 0.34], 0.014, STEEL);
  }

  // ---------------------------------------------------------------------------
  // Upper cabinets, lockers and serving shelf
  // ---------------------------------------------------------------------------

  box("upper_left_cabinet", [1.08, 0.56, 0.44], [-0.91, 1.78, -0.30], OLIVE_DARK);
  box("upper_right_cabinet", [0.76, 0.56, 0.44], [1.07, 1.78, -0.30], OLIVE_DARK);
  box("upper_left_face", [0.96, 0.45, 0.035], [-0.91, 1.78, -0.06], OLIVE);
  box("upper_right_face", [0.64, 0.45, 0.035], [1.07, 1.78, -0.06], PANEL);
  box("upper_left_seam", [0.022, 0.45, 0.045], [-0.91, 1.78, -0.085], BLACK);
  box("upper_right_seam", [0.022, 0.45, 0.045], [1.07, 1.78, -0.085], BLACK);

  rod("upper_left_pull", [-1.20, 1.78, -0.11], [-0.62, 1.78, -0.11], 0.017, STEEL);
  rod("upper_right_pull", [0.89, 1.78, -0.11], [1.25, 1.78, -0.11], 0.017, STEEL);

  warningStripe("upper_left_warning", -1.29, 1.58, -0.10, 0.34, 5, true);
  warningStripe("upper_right_warning", 1.35, 1.58, -0.10, 0.34, 5, true);

  box("serving_shelf", [2.38, 0.07, 0.30], [0, 1.52, -0.27], STEEL_DARK);
  box("serving_shelf_front", [2.42, 0.10, 0.05], [0, 1.47, -0.10], ALUMINUM);
  for (let i = -10; i <= 10; i++) {
    box(`shelf_score_${i}`, [0.012, 0.014, 0.22], [i * 0.105, 1.565, -0.27], BLACK);
  }

  // Lockers above the shelf.
  for (let i = 0; i < 5; i++) {
    const x = -1.00 + i * 0.50;
    box(`locker_${i}`, [0.43, 0.37, 0.08], [x, 2.12, -0.48], i % 2 ? OLIVE : PANEL_DARK);
    box(`locker_slot_${i}`, [0.26, 0.018, 0.015], [x, 2.18, -0.425], BLACK);
    bolt(`locker_bolt_${i}`, [x - 0.15, 2.00, -0.42], 0.012, STEEL);
    bolt(`locker_bolt2_${i}`, [x + 0.15, 2.00, -0.42], 0.012, STEEL);
  }

  // ---------------------------------------------------------------------------
  // Microwave / ration warmer and service control console
  // ---------------------------------------------------------------------------

  box("ration_warmer", [0.72, 0.42, 0.42], [-0.96, 1.27, -0.30], BLACK);
  box("ration_warmer_face", [0.58, 0.30, 0.035], [-1.00, 1.27, -0.075], STEEL_DARK);
  box("ration_window", [0.37, 0.20, 0.012], [-1.07, 1.28, -0.099], BLACK);
  box("ration_window_green", [0.31, 0.13, 0.006], [-1.07, 1.28, -0.108], GREEN);
  cyl("warmer_dial", 0.055, 0.024, [-0.69, 1.34, -0.10], RED, [0, 0, 1], 10);
  cyl("warmer_dial2", 0.038, 0.028, [-0.69, 1.20, -0.10], STEEL, [0, 0, 1], 10);
  box("warmer_label", [0.13, 0.028, 0.008], [-0.69, 1.10, -0.11], CREAM);

  box("control_console", [0.72, 0.34, 0.30], [1.02, 1.30, -0.32], PANEL_DARK);
  box("console_face", [0.62, 0.24, 0.035], [1.02, 1.30, -0.15], BLACK);
  box("console_screen", [0.33, 0.14, 0.012], [0.92, 1.35, -0.175], SCREEN);
  box("console_screen_bar", [0.24, 0.012, 0.008], [0.92, 1.30, -0.184], GREEN);
  for (let i = 0; i < 5; i++) {
    cyl(`console_button_${i}`, 0.025, 0.024, [1.20 + (i % 2) * 0.09, 1.38 - Math.floor(i / 2) * 0.08, -0.17], i === 3 ? RED : ORANGE, [0, 0, 1], 8);
  }
  box("console_warning", [0.48, 0.026, 0.012], [1.02, 1.15, -0.18], WARNING);

  // ---------------------------------------------------------------------------
  // Countertop utensils, mugs and ration containers
  // ---------------------------------------------------------------------------

  // Mugs.
  for (const [i, x] of [-1.25, 0.05, 1.26].entries()) {
    cyl(`mug_${i}`, 0.075, 0.15, [x, 1.23, 0.19], i === 1 ? CREAM : STEEL_DARK, [0, 1, 0], 10);
    cyl(`mug_rim_${i}`, 0.082, 0.018, [x, 1.315, 0.19], ALUMINUM, [0, 1, 0], 10);
    rod(`mug_handle_${i}`, [x + 0.07, 1.29, 0.19], [x + 0.14, 1.29, 0.19], 0.018, i === 1 ? CREAM : STEEL);
  }

  // Utensil cup and tools.
  cyl("utensil_cup", 0.10, 0.23, [1.27, 1.25, 0.06], OLIVE_DARK, [0, 1, 0], 10);
  for (let i = 0; i < 5; i++) {
    const x = 1.22 + (i % 3) * 0.045;
    const z = 0.04 + Math.floor(i / 3) * 0.04;
    rod(`utensil_${i}`, [x, 1.34, z], [x + (i - 2) * 0.018, 1.64 + (i % 2) * 0.08, z], 0.009, i % 2 ? ALUMINUM : STEEL);
  }

  // Sealed ration cans.
  for (let i = 0; i < 4; i++) {
    cyl(`ration_can_${i}`, 0.055, 0.12, [-0.20 + i * 0.13, 1.20, 0.23], i % 2 ? RUST : OLIVE, [0, 1, 0], 10);
    cyl(`ration_can_lid_${i}`, 0.058, 0.012, [-0.20 + i * 0.13, 1.267, 0.23], STEEL, [0, 1, 0], 10);
    box(`ration_can_label_${i}`, [0.075, 0.035, 0.006], [-0.20 + i * 0.13, 1.20, 0.29], CREAM);
  }

  // ---------------------------------------------------------------------------
  // Side service conduits, exposed plumbing and cable bundles
  // ---------------------------------------------------------------------------

  box("left_service_box", [0.30, 1.02, 0.32], [-1.29, 1.42, -0.40], PANEL_DARK);
  box("left_service_door", [0.24, 0.78, 0.025], [-1.29, 1.42, -0.225], OLIVE);
  rod("left_service_handle", [-1.38, 1.42, -0.245], [-1.20, 1.42, -0.245], 0.015, STEEL);
  for (let i = 0; i < 4; i++) {
    box(`left_service_slot_${i}`, [0.12, 0.018, 0.01], [-1.29, 1.15 + i * 0.13, -0.245], BLACK);
  }

  box("right_service_box", [0.30, 1.02, 0.32], [1.29, 1.42, -0.40], PANEL_DARK);
  box("right_service_door", [0.24, 0.78, 0.025], [1.29, 1.42, -0.225], OLIVE_DARK);
  rod("right_service_handle", [1.20, 1.42, -0.245], [1.38, 1.42, -0.245], 0.015, STEEL);
  grille("right_service_grille", [1.29, 1.52, -0.245], 0.16, 0.28, 6, BLACK);

  // Thick copper and steel pipe runs.
  rod("pipe_left_vertical", [-1.16, 1.15, -0.51], [-1.16, 2.22, -0.51], 0.038, RUST);
  rod("pipe_left_top", [-1.16, 2.22, -0.51], [-0.50, 2.22, -0.51], 0.038, RUST);
  rod("pipe_right_vertical", [1.18, 1.18, -0.52], [1.18, 2.18, -0.52], 0.032, STEEL_DARK);
  rod("pipe_right_top", [1.18, 2.18, -0.52], [0.52, 2.18, -0.52], 0.032, STEEL_DARK);
  cyl("pipe_valve_left", 0.08, 0.04, [-1.16, 1.86, -0.51], RED, [1, 0, 0], 10);
  cyl("pipe_valve_right", 0.07, 0.04, [1.18, 1.75, -0.52], WARNING, [1, 0, 0], 10);

  // Cable bundles descending behind the counter.
  for (let i = 0; i < 6; i++) {
    const x = -0.34 + i * 0.13;
    rod(`cable_bundle_${i}`, [x, 2.20, -0.56], [x + 0.025 * (i - 2), 1.48, -0.56], 0.012, i % 2 ? BLACK : STEEL_DARK);
  }

  // ---------------------------------------------------------------------------
  // Wall vent, analogue display and warning placards
  // ---------------------------------------------------------------------------

  box("wall_vent_frame", [0.82, 0.47, 0.06], [0.05, 1.38, -0.48], BLACK);
  box("wall_vent_plate", [0.72, 0.37, 0.025], [0.05, 1.38, -0.445], PANEL_DARK);
  for (let i = -3; i <= 3; i++) {
    box(`wall_vent_slats_${i}`, [0.04, 0.31, 0.028], [0.05 + i * 0.095, 1.38, -0.425], BLACK);
  }
  bolt("vent_bolt1", [-0.30, 1.58, -0.40], 0.016, STEEL);
  bolt("vent_bolt2", [0.40, 1.58, -0.40], 0.016, STEEL);
  bolt("vent_bolt3", [-0.30, 1.18, -0.40], 0.016, STEEL);
  bolt("vent_bolt4", [0.40, 1.18, -0.40], 0.016, STEEL);

  box("analog_panel", [0.76, 0.36, 0.045], [-0.35, 1.70, -0.46], OLIVE_DARK);
  box("analog_face", [0.56, 0.23, 0.012], [-0.35, 1.70, -0.435], BLACK);
  for (let i = 0; i < 4; i++) {
    cyl(`analog_meter_${i}`, 0.065, 0.014, [-0.56 + i * 0.14, 1.70, -0.45], CREAM, [0, 0, 1], 12);
    rod(`analog_needle_${i}`, [-0.56 + i * 0.14, 1.70, -0.46], [-0.56 + i * 0.14 + 0.025, 1.735, -0.46], 0.008, RED);
  }

  box("placard_red", [0.52, 0.20, 0.014], [0.86, 2.05, -0.445], RED);
  box("placard_red_text", [0.34, 0.026, 0.008], [0.86, 2.05, -0.458], CREAM);
  box("placard_green", [0.46, 0.16, 0.014], [0.88, 1.86, -0.445], GREEN);
  box("placard_green_text", [0.30, 0.021, 0.008], [0.88, 1.86, -0.458], BLACK);

  // ---------------------------------------------------------------------------
  // CRT terminal at the galley end
  // ---------------------------------------------------------------------------

  box("crt_body", [0.54, 0.48, 0.42], [-1.12, 2.06, -0.28], PANEL_DARK);
  box("crt_bezel", [0.43, 0.31, 0.035], [-1.12, 2.08, -0.055], BLACK);
  box("crt_screen", [0.34, 0.22, 0.012], [-1.12, 2.09, -0.078], SCREEN);
  box("crt_scanline1", [0.27, 0.012, 0.008], [-1.12, 2.14, -0.087], GREEN);
  box("crt_scanline2", [0.22, 0.010, 0.008], [-1.12, 2.06, -0.087], CYAN);
  box("crt_scanline3", [0.29, 0.010, 0.008], [-1.12, 1.995, -0.087], GREEN);
  cyl("crt_power", 0.027, 0.018, [-0.87, 1.91, -0.075], RED, [0, 0, 1], 8);
  box("crt_slot", [0.23, 0.028, 0.012], [-1.12, 1.83, -0.075], BLACK);
  rod("crt_handle", [-1.32, 1.84, -0.15], [-0.92, 1.84, -0.15], 0.018, STEEL);

  // CRT top aerial and dangling handset.
  rod("crt_aerial", [-1.12, 2.31, -0.28], [-1.05, 2.55, -0.28], 0.012, STEEL);
  rod("crt_aerial_tip", [-1.05, 2.55, -0.28], [-0.92, 2.60, -0.28], 0.012, STEEL);
  box("handset_mount", [-0.001 as never, 0, 0] as never, [0, 0, 0], BLACK);

  // Replace the intentionally empty mount placeholder with a compact handset.
  box("handset_mount_plate", [0.18, 0.10, 0.035], [-0.74, 1.76, -0.28], BLACK);
  rod("handset_cradle", [-0.82, 1.81, -0.25], [-0.68, 1.81, -0.25], 0.022, STEEL);
  box("handset_body", [0.12, 0.27, 0.08], [-0.75, 1.96, -0.25], RUBBER);
  cyl("handset_top", 0.045, 0.12, [-0.75, 2.10, -0.25], RUBBER, [0, 1, 0], 8);
  cyl("handset_bottom", 0.045, 0.12, [-0.75, 1.82, -0.25], RUBBER, [0, 1, 0], 8);
  rod("handset_cable", [-0.75, 1.75, -0.25], [-0.65, 1.43, -0.25], 0.011, BLACK);

  // ---------------------------------------------------------------------------
  // Ceiling fluorescent fixture and structural ribs
  // ---------------------------------------------------------------------------

  box("ceiling_light_housing", [1.42, 0.12, 0.34], [0.02, 2.22, 0.19], STEEL_DARK);
  box("ceiling_light_diffuser", [1.16, 0.035, 0.20], [0.02, 2.145, 0.19], CREAM);
  box("ceiling_light_core", [0.94, 0.016, 0.10], [0.02, 2.128, 0.19], WHITE);
  for (const x of [-0.56, 0.60]) {
    cyl("light_mount", 0.025, 0.16, [x, 2.29, 0.19], BLACK);
  }

  for (let i = -4; i <= 4; i++) {
    box(`ceiling_rib_${i}`, [0.05, 0.10, 1.18], [i * 0.30, 2.40, -0.01], PANEL_DARK);
  }

  // Front overhead rail with hanging hooks and a towel.
  rod("front_overhead_rail", [-1.30, 2.12, 0.45], [1.30, 2.12, 0.45], 0.028, STEEL);
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.27;
    rod(`hook_${i}`, [x, 2.11, 0.45], [x, 1.92, 0.45], 0.012, BLACK);
    cyl(`hook_tip_${i}`, 0.026, 0.08, [x + 0.035, 1.88, 0.45], STEEL, [1, 0, 0], 8);
  }

  box("hanging_towel", [0.30, 0.46, 0.018], [0.67, 1.77, 0.45], CREAM);
  for (let i = 0; i < 5; i++) {
    box(`towel_stripe_${i}`, [0.30, 0.018, 0.022], [0.67, 1.60 + i * 0.09, 0.44], RED);
  }

  // ---------------------------------------------------------------------------
  // Floor-level details: toe kicks, drain and removable grates
  // ---------------------------------------------------------------------------

  box("toe_kick_left", [0.82, 0.12, 0.06], [-0.96, 0.24, 0.34], BLACK);
  box("toe_kick_center", [0.82, 0.12, 0.06], [0, 0.24, 0.34], BLACK);
  box("toe_kick_right", [0.82, 0.12, 0.06], [0.96, 0.24, 0.34], BLACK);

  box("floor_drain_frame", [0.54, 0.018, 0.36], [0.45, 0.13, 0.50], STEEL_DARK);
  for (let i = -4; i <= 4; i++) {
    box(`floor_drain_slot_${i}`, [0.018, 0.024, 0.30], [0.45 + i * 0.055, 0.145, 0.50], BLACK);
  }

  // Small scattered floor fasteners, deterministic but fixed in the model.
  const floorBolts: [number, number][] = [
    [-1.26, -0.52],
    [-0.74, 0.54],
    [0.02, 0.51],
    [0.94, -0.48],
    [1.27, 0.51],
    [-0.16, -0.57],
  ];
  for (let i = 0; i < floorBolts.length; i++) {
    const [x, z] = floorBolts[i];
    cyl(`floor_fastener_${i}`, 0.025, 0.012, [x, 0.145, z], STEEL, [0, 1, 0], 8);
  }

  // A few believable service tags and labels as layered plates.
  const tags = [
    [-1.25, 1.08, "tag_left"],
    [-0.25, 1.07, "tag_mid"],
    [0.94, 1.07, "tag_right"],
  ] as const;

  for (const [x, y, name] of tags) {
    box(name, [0.18, 0.055, 0.012], [x, y, 0.39], CREAM);
    box(`${name}_line`, [0.12, 0.009, 0.008], [x, y + 0.012, 0.398], BLACK);
    box(`${name}_line2`, [0.08, 0.008, 0.008], [x, y - 0.014, 0.398], RED);
  }

  // Make the model feel used rather than pristine: isolated rust plates and patches.
  box("rust_patch_left", [0.12, 0.09, 0.008], [-1.33, 1.00, -0.20], RUST);
  box("rust_patch_rear", [0.16, 0.10, 0.008], [0.63, 1.96, -0.47], RUST);
  box("paint_chip_1", [0.10, 0.025, 0.008], [-0.18, 1.95, -0.47], ALUMINUM);
  box("paint_chip_2", [0.06, 0.018, 0.008], [0.22, 0.48, 0.32], STEEL);
  box("paint_chip_3", [0.08, 0.022, 0.008], [1.28, 1.20, -0.24], ALUMINUM);

  // A small emergency shutoff assembly on the right wall.
  box("emergency_panel", [0.27, 0.38, 0.045], [1.32, 0.88, -0.44], RED);
  box("emergency_panel_inner", [0.20, 0.26, 0.012], [1.32, 0.88, -0.415], BLACK);
  cyl("emergency_button", 0.078, 0.035, [1.32, 0.93, -0.44], RED, [0, 0, 1], 10);
  box("emergency_label", [0.14, 0.028, 0.008], [1.32, 0.72, -0.46], CREAM);
  warningStripe("emergency_warning", 1.32, 1.14, -0.465, 0.20, 3, true);

  return b.root;
}
