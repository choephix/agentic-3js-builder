```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "nostromo-spaceship-galley",
  description:
    "A detailed retro-industrial spaceship galley kitchen inspired by the 1979 Nostromo: ribbed bulkheads, dark olive cabinets, stainless counters, oven, sink, pipes, ducts, rivets, warning stripes and utilitarian food-prep equipment.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const OLIVE = "#343a2b";
  const OLIVE_DARK = "#20251e";
  const OLIVE_LIGHT = "#59604a";
  const CHARCOAL = "#161a18";
  const BLACK = "#090c0b";
  const STEEL = "#8b9189";
  const STEEL_DARK = "#4c534e";
  const ALUMINUM = "#b4b9ae";
  const RUBBER = "#252b27";
  const AMBER = "#d08a27";
  const RED = "#9c3228";
  const CREAM = "#c8b98d";
  const YELLOW = "#c59d2e";
  const GLASS = "#49645e";
  const FOOD = "#79613d";

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name?: string,
    bevel = 0,
  ) => {
    const g = new THREE.BoxGeometry(...size);
    if (bevel > 0) {
      // A subtle bevel-like layered face is added by callers; keep base primitives crisp.
    }
    return b.part(g, color, { at, name, flat: true });
  };

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    dir: [number, number, number] = [0, 1, 0],
    name?: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      dir,
      name,
      flat: true,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: string,
    name?: string,
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, caps: "round", sides: 8 });

  // Overall deck and raised anti-slip floor.
  box([3.25, 0.12, 2.45], [0, 0.06, 0], CHARCOAL, "deck");
  box([3.05, 0.045, 2.25], [0, 0.145, 0], RUBBER, "ribbed_floor");
  for (let x = -1.35; x <= 1.35; x += 0.18) {
    box([0.035, 0.012, 2.1], [x, 0.174, 0], STEEL_DARK, "floor_rib");
  }

  // Rear bulkhead: heavy, segmented, slightly claustrophobic.
  box([3.2, 2.65, 0.16], [0, 1.48, -1.12], OLIVE_DARK, "rear_bulkhead");
  box([2.82, 2.34, 0.035], [0, 1.5, -1.025], OLIVE, "rear_inner_panel");
  for (const x of [-1.43, -0.72, 0, 0.72, 1.43]) {
    box([0.055, 2.26, 0.045], [x, 1.5, -0.99], STEEL_DARK, "bulkhead_vertical_seam");
    for (const y of [0.42, 1.1, 1.78, 2.38]) {
      cyl(0.025, 0.018, [x, y, -0.95], STEEL, [0, 0, 1], "bulkhead_rivet", 8);
    }
  }
  for (const y of [0.34, 2.55]) {
    box([3.0, 0.06, 0.06], [0, y, -0.95], STEEL_DARK, "bulkhead_horizontal_seam");
  }

  // Left and right side utility frames.
  box([0.15, 2.55, 2.35], [-1.58, 1.43, 0], OLIVE_DARK, "left_sidewall");
  box([0.15, 2.55, 2.35], [1.58, 1.43, 0], OLIVE_DARK, "right_sidewall");
  for (const s of [-1, 1]) {
    for (const z of [-0.86, -0.25, 0.36, 0.97]) {
      box([0.05, 2.15, 0.04], [s * 1.49, 1.45, z], STEEL_DARK, "sidewall_rib");
    }
    for (const y of [0.42, 1.22, 2.02]) {
      cyl(0.028, 0.04, [s * 1.39, y, -0.8], STEEL, [1, 0, 0], "side_rivet", 8);
    }
  }

  // Main counter cabinets.
  box([3.0, 0.72, 0.64], [0, 0.52, -0.67], OLIVE, "base_cabinet");
  box([3.1, 0.12, 0.74], [0, 0.95, -0.67], STEEL_DARK, "counter_underplate");
  box([3.12, 0.07, 0.77], [0, 1.015, -0.67], ALUMINUM, "countertop");

  // Cabinet door layout, dark seams, pulls and warning labels.
  for (const x of [-1.18, -0.4, 0.4, 1.18]) {
    box([0.67, 0.53, 0.035], [x, 0.53, -0.29], OLIVE_LIGHT, "cabinet_door");
    box([0.025, 0.49, 0.018], [x - 0.33, 0.53, -0.265], CHARCOAL, "door_seam");
    box([0.025, 0.49, 0.018], [x + 0.33, 0.53, -0.265], CHARCOAL, "door_seam");
    rod([x - 0.18, 0.54, -0.235], [x + 0.18, 0.54, -0.235], 0.018, STEEL, "cabinet_pull");
    cyl(0.027, 0.02, [x - 0.27, 0.53, -0.24], AMBER, [0, 0, 1], "door_indicator", 8);
  }

  // Left sink basin and faucet.
  box([0.78, 0.08, 0.52], [-1.02, 1.075, -0.67], BLACK, "sink_rim");
  box([0.62, 0.18, 0.38], [-1.02, 0.99, -0.67], STEEL_DARK, "sink_basin");
  box([0.5, 0.035, 0.27], [-1.02, 1.095, -0.67], CHARCOAL, "sink_opening");
  cyl(0.045, 0.4, [-0.72, 1.28, -0.67], STEEL, [0, 1, 0], "faucet_stem", 10);
  rod([-0.72, 1.48, -0.67], [-0.72, 1.48, -0.47], 0.04, STEEL, "faucet_spout");
  cyl(0.07, 0.025, [-0.72, 1.48, -0.47], STEEL_DARK, [0, 0, 1], "faucet_nozzle", 10);
  for (const x of [-0.85, -0.58]) cyl(0.035, 0.025, [x, 1.21, -0.67], RED, [0, 0, 1], "tap_marker", 8);

  // Right cooking module and oven.
  box([1.25, 1.42, 0.66], [0.9, 1.63, -0.66], OLIVE, "oven_module");
  box([1.05, 0.75, 0.045], [0.9, 1.52, -0.305], BLACK, "oven_face");
  box([0.93, 0.58, 0.025], [0.9, 1.46, -0.275], GLASS, "oven_window");
  box([0.99, 0.055, 0.06], [0.9, 1.82, -0.25], STEEL, "oven_handle");
  box([1.05, 0.045, 0.17], [0.9, 2.09, -0.3], CHARCOAL, "control_strip");
  for (const x of [0.52, 0.83, 1.16, 1.47]) {
    cyl(0.075, 0.045, [x, 2.11, -0.25], STEEL, [0, 0, 1], "oven_knob", 10);
    cyl(0.025, 0.012, [x, 2.11, -0.22], AMBER, [0, 0, 1], "knob_marker", 8);
  }
  box([1.08, 0.07, 0.04], [0.9, 1.12, -0.27], RED, "oven_warning_strip");
  for (const x of [0.45, 0.72, 0.99, 1.26, 1.53]) {
    box([0.11, 0.02, 0.045], [x, 1.12, -0.24], YELLOW, "warning_dash");
  }

  // Upper storage cabinets.
  box([3.0, 0.68, 0.48], [0, 2.16, -0.74], OLIVE, "upper_storage");
  for (const x of [-1.2, -0.4, 0.4, 1.2]) {
    box([0.68, 0.54, 0.035], [x, 2.17, -0.46], OLIVE_LIGHT, "upper_door");
    rod([x - 0.19, 2.17, -0.43], [x + 0.19, 2.17, -0.43], 0.016, STEEL, "upper_pull");
    cyl(0.024, 0.018, [x + 0.27, 2.17, -0.42], AMBER, [0, 0, 1], "upper_lamp", 8);
  }
  box([3.05, 0.05, 0.06], [0, 1.79, -0.42], STEEL_DARK, "upper_bottom_rail");

  // Open shelf on the left with galley clutter.
  box([0.95, 0.06, 0.48], [-1.05, 1.46, -0.73], STEEL_DARK, "open_shelf");
  box([0.95, 0.06, 0.48], [-1.05, 1.88, -0.73], STEEL_DARK, "open_shelf_top");
  box([0.05, 0.48, 0.5], [-1.52, 1.67, -0.73], STEEL_DARK, "shelf_side");
  box([0.05, 0.48, 0.5], [-0.58, 1.67, -0.73], STEEL_DARK, "shelf_side");
  cyl(0.105, 0.28, [-1.32, 1.63, -0.7], CREAM, [0, 1, 0], "metal_mug", 10);
  cyl(0.11, 0.22, [-1.04, 1.62, -0.7], STEEL, [0, 1, 0], "ration_can", 10);
  cyl(0.09, 0.32, [-0.78, 1.66, -0.7], AMBER, [0, 1, 0], "amber_bottle", 9);
  box([0.18, 0.06, 0.22], [-1.28, 1.93, -0.67], RED, "food_pack");
  box([0.22, 0.04, 0.12], [-0.92, 1.92, -0.67], CREAM, "food_label");

  // Central vertical service spine and overhead vent.
  box([0.28, 1.35, 0.3], [0, 1.48, -0.93], CHARCOAL, "service_spine");
  box([0.2, 0.78, 0.03], [0, 1.43, -0.765], STEEL_DARK, "service_panel");
  for (const y of [1.12, 1.35, 1.58, 1.81]) {
    cyl(0.025, 0.022, [-0.07, y, -0.74], AMBER, [0, 0, 1], "status_light", 8);
    cyl(0.025, 0.022, [0.07, y, -0.74], RED, [0, 0, 1], "status_light", 8);
  }
  box([0.48, 0.22, 0.9], [0, 2.65, -0.67], STEEL_DARK, "overhead_vent_box");
  box([0.38, 0.04, 0.68], [0, 2.54, -0.19], BLACK, "vent_face");
  for (const z of [-0.42, -0.25, -0.08, 0.09]) {
    box([0.32, 0.018, 0.035], [0, 2.54, z], STEEL, "vent_louver");
  }

  // Large overhead and side piping, characteristic industrial plumbing.
  rod([-1.38, 2.58, -0.84], [-1.38, 2.58, 0.9], 0.055, STEEL_DARK, "overhead_pipe_L");
  rod([1.38, 2.58, -0.84], [1.38, 2.58, 0.9], 0.055, STEEL_DARK, "overhead_pipe_R");
  rod([-1.38, 2.58, 0.9], [0.65, 2.58, 0.9], 0.055, STEEL_DARK, "overhead_crosspipe");
  rod([1.38, 2.58, 0.9], [0.65, 2.58, 0.9], 0.045, STEEL, "overhead_crosspipe");
  rod([-1.35, 2.34, -0.91], [-1.35, 1.1, -0.91], 0.035, OLIVE_LIGHT, "water_pipe");
  rod([1.34, 2.32, -0.91], [1.34, 1.08, -0.91], 0.035, RED, "gas_pipe");
  for (const y of [1.25, 1.75, 2.3]) {
    cyl(0.075, 0.045, [-1.35, y, -0.91], STEEL, [1, 0, 0], "pipe_collar", 10);
    cyl(0.075, 0.045, [1.34, y, -0.91], STEEL, [1, 0, 0], "pipe_collar", 10);
  }

  // Hanging utensil rail and tools.
  rod([-0.45, 1.95, -0.25], [0.45, 1.95, -0.25], 0.025, STEEL, "utensil_rail");
  for (const x of [-0.32, -0.08, 0.16, 0.38]) {
    cyl(0.028, 0.12, [x, 1.86, -0.25], STEEL_DARK, [0, 1, 0], "utensil_hook", 8);
  }
  rod([-0.32, 1.82, -0.25], [-0.32, 1.48, -0.25], 0.018, STEEL, "ladle_handle");
  sphere(0.085, [-0.32, 1.42, -0.25], STEEL, "ladle_bowl");
  rod([0.02, 1.82, -0.25], [0.02, 1.51, -0.25], 0.018, STEEL, "spatula_handle");
  box([0.16, 0.025, 0.18], [0.02, 1.43, -0.25], STEEL, "spatula_head");

  // Small wall-mounted terminal with amber screen.
  box([0.56, 0.48, 0.08], [1.19, 1.45, -0.88], CHARCOAL, "terminal_housing");
  box([0.4, 0.25, 0.018], [1.19, 1.5, -0.835], AMBER, "terminal_screen");
  box([0.43, 0.035, 0.03], [1.19, 1.28, -0.83], STEEL, "terminal_keyboard");
  for (let i = 0; i < 6; i++) {
    box([0.035, 0.018, 0.018], [1.02 + i * 0.07, 1.28, -0.805], CREAM, "terminal_key");
  }
  cyl(0.025, 0.025, [1.42, 1.34, -0.82], RED, [0, 0, 1], "terminal_alert", 8);

  // Right-side canisters and pressure hardware.
  box([0.42, 0.72, 0.38], [1.32, 0.55, 0.25], OLIVE_DARK, "side_canister_box");
  cyl(0.14, 0.48, [1.32, 0.92, 0.25], STEEL_DARK, [0, 1, 0], "gas_cylinder", 10);
  cyl(0.105, 0.025, [1.32, 1.17, 0.25], RED, [0, 1, 0], "gas_cap", 10);
  cyl(0.055, 0.035, [1.32, 1.21, 0.25], STEEL, [0, 1, 0], "gas_valve", 8);
  box([0.16, 0.18, 0.035], [1.32, 0.82, 0.055], YELLOW, "hazard_label");
  for (const z of [0.02, 0.2, 0.38, 0.56]) {
    box([0.36, 0.025, 0.028], [1.32, 0.55, z], STEEL_DARK, "canister_strap");
  }

  // A chunky floor-level refuse / food crate.
  box([0.62, 0.42, 0.5], [-1.15, 0.3, 0.48], OLIVE_DARK, "floor_crate");
  box([0.5, 0.03, 0.32], [-1.15, 0.53, 0.48], STEEL_DARK, "crate_lid");
  for (const x of [-1.35, -1.15, -0.95]) {
    box([0.035, 0.32, 0.035], [x, 0.31, 0.48], OLIVE_LIGHT, "crate_rib");
  }
  box([0.22, 0.04, 0.12], [-1.15, 0.55, 0.48], RED, "crate_marking");

  // Ceiling ribs and exposed fasteners.
  for (const x of [-1.25, -0.62, 0, 0.62, 1.25]) {
    box([0.08, 0.12, 2.18], [x, 2.76, 0], STEEL_DARK, "ceiling_rib");
    cyl(0.035, 0.035, [x, 2.68, -0.85], STEEL, [0, 1, 0], "ceiling_fastener", 8);
    cyl(0.035, 0.035, [x, 2.68, 0.85], STEEL, [0, 1, 0], "ceiling_fastener", 8);
  }

  // Foreground service bollards / handrails frame the galley entrance.
  for (const x of [-1.5, 1.5]) {
    rod([x, 0.18, 0.98], [x, 1.28, 0.98], 0.045, STEEL_DARK, "entry_handrail");
    cyl(0.075, 0.08, [x, 0.21, 0.98], STEEL, [0, 1, 0], "handrail_foot", 8);
    cyl(0.075, 0.08, [x, 1.3, 0.98], STEEL, [0, 1, 0], "handrail_cap", 8);
  }
  rod([-1.5, 1.2, 0.98], [-0.78, 1.2, 0.98], 0.04, STEEL_DARK, "left_entry_rail");
  rod([1.5, 1.2, 0.98], [0.78, 1.2, 0.98], 0.04, STEEL_DARK, "right_entry_rail");

  // Small scattered rivets make the otherwise simple primitives feel manufactured.
  for (const x of [-1.25, -0.75, -0.25, 0.25, 0.75, 1.25]) {
    cyl(0.018, 0.018, [x, 1.07, -0.27], STEEL_DARK, [0, 0, 1], "counter_rivet", 8);
  }
  for (const x of [-1.3, -0.65, 0, 0.65, 1.3]) {
    cyl(0.02, 0.02, [x, 2.48, -0.46], STEEL, [0, 0, 1], "upper_rivet", 8);
  }

  return b.root;
}
```