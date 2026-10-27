```ts
import * as THREE from "three";
import { createBuilder, svg } from "agentic-3js-builder";
import { metal, panelled, TINT } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "nostromo-alien-galley",
  description:
    "A dense, low-poly Alien-era spaceship galley kitchen: ribbed steel cabinets, yellowed worktops, a deep sink, burner bank, pressure pipes, food canisters, vents, warning labels and sickly green control lights.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 0.8, paintSize: 1024 });

  const IRON = metal("iron", { tarnish: 0.72, verdigris: 0.12, polish: 0.08, size: 0.14, seed: 7 });
  const DARK_IRON = metal("iron", { tarnish: 0.9, polish: 0.03, size: 0.09, seed: 18 });
  const STEEL = metal("steel", { tarnish: 0.35, polish: 0.42, size: 0.1, seed: 21 });
  const BRASS = metal("brass", { tarnish: 0.62, verdigris: 0.25, polish: 0.18, size: 0.08, seed: 4 });
  const COPPER = metal("copper", { tarnish: 0.45, verdigris: 0.42, polish: 0.2, size: 0.07, seed: 12 });
  const PANEL = panelled(IRON, { size: 0.17, aspect: 0.75, rivets: 0.055 });
  const PANEL_DARK = panelled(DARK_IRON, { size: 0.12, aspect: 0.8, rivets: 0.045 });

  const BLACK = "#171716";
  const RUBBER = "#292825";
  const GASKET = "#463d31";
  const IVORY = "#b1a27d";
  const DIRTY_WHITE = "#d0c5a2";
  const WARNING = "#c35a32";
  const RED = "#a92520";
  const GREEN = "#83d48a";
  const AMBER = "#e6a13e";
  const BLUE = "#5c9a9d";
  const GLASS = "#263d37";

  const labelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 96">
      <rect width="256" height="96" fill="#d8cfa8"/>
      <rect x="5" y="5" width="246" height="86" fill="none" stroke="#241b16" stroke-width="7"/>
      <path d="M18 22h220M18 74h220" stroke="#8a241e" stroke-width="5"/>
      <text x="128" y="58" text-anchor="middle" font-family="monospace" font-size="31" font-weight="bold" fill="#241b16">AUTHORIZED GALLEY</text>
    </svg>`,
    { size: 384 },
  );

  const hazardTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#171514"/>
      <path d="M64 9L119 112H9Z" fill="#d19d38" stroke="#080808" stroke-width="7"/>
      <path d="M64 35v39M64 88v7" stroke="#211918" stroke-width="12" stroke-linecap="round"/>
    </svg>`,
    { size: 192 },
  );

  const gaugeTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r="75" fill="#d9cfaa" stroke="#211c19" stroke-width="8"/>
      <path d="M30 105A58 58 0 0 1 130 38" fill="none" stroke="#25201c" stroke-width="5"/>
      <path d="M44 112L55 101M35 94l14-5M34 70h15M42 48l13 8M62 31l8 14M87 27l-2 15M110 35l-8 13M126 53l-13 7" stroke="#25201c" stroke-width="5"/>
      <path d="M80 80L115 54" stroke="#a32721" stroke-width="7"/>
      <circle cx="80" cy="80" r="9" fill="#25201c"/>
      <text x="80" y="130" text-anchor="middle" font-family="monospace" font-size="16" fill="#25201c">PRESS</text>
    </svg>`,
    { size: 256 },
  );

  const readoutTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 80">
      <rect width="220" height="80" rx="5" fill="#111817" stroke="#718077" stroke-width="5"/>
      <text x="110" y="51" text-anchor="middle" font-family="monospace" font-size="35" fill="#8ce19a">04:17:09</text>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    name = "box",
    extra: any = {},
  ) => b.part(new THREE.BoxGeometry(...size), color, { at, name, flat: true, ...extra });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    name = "cylinder",
    extra: any = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius * 1.02, height, 10, 1), color, {
      at,
      name,
      flat: true,
      ...extra,
    });

  const sphere = (
    radius: number,
    at: [number, number, number],
    color: any,
    name = "knob",
    extra: any = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      name,
      flat: true,
      ...extra,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    name = "pipe",
  ) => b.rod(a, c, radius, { color, name, section: { ngon: 6 }, caps: "round" });

  const ring = (
    radius: number,
    tube: number,
    at: [number, number, number],
    color: any,
    name = "ring",
  ) =>
    b.part(
      new THREE.TorusGeometry(radius, tube, 6, 12),
      color,
      { at, name, rotation: [90, 0, 0], flat: true },
    );

  // Floor plinth and rear bulkhead.
  box([2.72, 0.12, 1.08], [0, 0.06, -0.02], DARK_IRON, "floor_plinth");
  box([2.62, 1.96, 0.12], [0, 1.02, -0.53], PANEL_DARK, "rear_bulkhead");
  box([0.13, 1.88, 0.88], [-1.31, 0.99, -0.03], IRON, "left_end_wall");
  box([0.13, 1.88, 0.88], [1.31, 0.99, -0.03], IRON, "right_end_wall");

  // Strong vertical ribs and overhead structural rails.
  for (const x of [-1.16, -0.72, -0.26, 0.26, 0.72, 1.16]) {
    box([0.075, 1.78, 0.16], [x, 0.91, -0.43], DARK_IRON, `bulkhead_rib_${x}`);
    sphere(0.045, [x, 1.77, -0.34], BRASS, `rib_bolt_top_${x}`);
    sphere(0.045, [x, 0.08, -0.34], BRASS, `rib_bolt_bottom_${x}`);
  }
  box([2.48, 0.15, 0.22], [0, 1.86, -0.4], IRON, "top_crossbeam");
  box([2.48, 0.08, 0.15], [0, 1.7, -0.4], STEEL, "top_shadow_rail");

  // Lower cabinets and continuous worktop.
  box([2.44, 0.63, 0.74], [0, 0.37, -0.03], PANEL, "lower_cabinet_bank");
  box([2.54, 0.12, 0.84], [0, 0.72, -0.01], DIRTY_WHITE, "yellowed_worktop");
  box([2.53, 0.035, 0.86], [0, 0.79, -0.01], BLACK, "worktop_edge");

  // Cabinet doors, hinges and handles.
  for (const x of [-0.98, -0.58, -0.18, 0.22, 0.62, 1.02]) {
    box([0.34, 0.47, 0.035], [x, 0.37, 0.365], IRON, `cabinet_door_${x}`);
    sphere(0.026, [x - 0.12, 0.51, 0.39], BRASS, `door_hinge_a_${x}`);
    sphere(0.026, [x - 0.12, 0.23, 0.39], BRASS, `door_hinge_b_${x}`);
    rod([x + 0.04, 0.4, 0.405], [x + 0.15, 0.4, 0.405], 0.015, STEEL, `door_pull_${x}`);
  }

  // Front warning placard.
  b.part(new THREE.PlaneGeometry(0.62, 0.23), "#ffffff", {
    at: [0, 0.92, 0.415],
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTex,
    name: "authorized_galley_label",
  });

  // Sink basin with thick rim and drain.
  box([0.78, 0.09, 0.52], [-0.73, 0.83, 0.05], STEEL, "sink_rim");
  box([0.64, 0.13, 0.39], [-0.73, 0.78, 0.05], BLACK, "sink_basin");
  ring(0.12, 0.018, [-0.73, 0.855, 0.05], STEEL, "sink_rim_ring");
  cyl(0.045, 0.018, [-0.73, 0.855, 0.05], DARK_IRON, "sink_drain");
  rod([-0.73, 1.13, -0.18], [-0.73, 1.13, 0.06], 0.035, STEEL, "faucet_stem");
  rod([-0.73, 1.13, 0.06], [-0.58, 1.13, 0.1], 0.035, STEEL, "faucet_spout");
  sphere(0.06, [-0.84, 0.93, 0.24], RED, "hot_tap");
  sphere(0.06, [-0.63, 0.93, 0.24], BLUE, "cold_tap");

  // Four alien stove rings and controls.
  const burners = [
    [-0.05, 0.02],
    [0.4, 0.02],
    [-0.05, 0.28],
    [0.4, 0.28],
  ] as const;
  for (let i = 0; i < burners.length; i++) {
    const [x, z] = burners[i];
    ring(0.16, 0.027, [x, 0.88, z], DARK_IRON, `burner_ring_${i}`);
    ring(0.105, 0.018, [x, 0.89, z], BRASS, `burner_inner_${i}`);
    cyl(0.055, 0.025, [x, 0.91, z], BLACK, `burner_cap_${i}`);
  }
  for (let i = 0; i < 4; i++) {
    const x = -0.18 + i * 0.2;
    cyl(0.048, 0.035, [x, 0.87, 0.43], BRASS, `stove_control_${i}`);
    sphere(0.017, [x, 0.9, 0.46], i === 1 ? RED : GREEN, `control_lamp_${i}`);
  }

  // Stove side panel and hazard decal.
  box([0.74, 0.34, 0.035], [0.18, 1.08, 0.43], DARK_IRON, "stove_control_panel");
  b.part(new THREE.PlaneGeometry(0.16, 0.16), "#ffffff", {
    at: [0.18, 1.1, 0.455],
    dir: [0, 0, 1],
    axis: "z",
    texture: hazardTex,
    name: "stove_hazard_triangle",
  });

  // Upper shelves and their yellowed liners.
  box([2.35, 0.09, 0.48], [0, 1.37, -0.18], IRON, "upper_shelf_back");
  box([2.38, 0.07, 0.5], [0, 1.32, 0.08], DIRTY_WHITE, "upper_shelf_liner");
  box([2.3, 0.08, 0.2], [0, 1.54, -0.24], DARK_IRON, "upper_shelf_lip");
  for (const x of [-1.02, -0.52, 0, 0.52, 1.02]) {
    rod([x, 1.3, -0.39], [x, 1.58, -0.39], 0.018, STEEL, `shelf_support_${x}`);
    sphere(0.035, [x, 1.58, -0.39], BRASS, `shelf_support_bolt_${x}`);
  }

  // Cans, ration tins and alien food vessels on the shelf.
  const cans = [
    [-0.88, 0.04, 0.18, 0.14, RED],
    [-0.58, 0.04, 0.2, 0.17, IVORY],
    [-0.24, 0.04, 0.15, 0.13, BLUE],
    [0.02, 0.04, 0.22, 0.18, BRASS],
    [0.35, 0.04, 0.17, 0.12, GREEN],
    [0.67, 0.04, 0.2, 0.16, IVORY],
    [0.95, 0.04, 0.14, 0.12, RED],
  ] as const;
  cans.forEach(([x, z, h, r, color], i) => {
    cyl(r, h, [x, 1.32 + h / 2, z], color, `ration_can_${i}`);
    cyl(r * 0.84, 0.012, [x, 1.32 + h + 0.008, z], STEEL, `ration_lid_${i}`);
    ring(r * 0.78, 0.009, [x, 1.32 + h * 0.56, z], DARK_IRON, `ration_band_${i}`);
  });

  // Overhead extraction hood with deep throat.
  box([1.72, 0.13, 0.56], [0.25, 1.77, 0.06], PANEL_DARK, "extractor_hood");
  box([1.45, 0.26, 0.42], [0.25, 1.62, 0.13], BLACK, "extractor_throat");
  for (let x = -0.35; x <= 0.85; x += 0.2) {
    rod([x, 1.51, -0.08], [x, 1.75, -0.08], 0.018, STEEL, `hood_grille_${x}`);
  }
  rod([-0.6, 1.86, 0.05], [-0.6, 1.98, 0.05], 0.055, DARK_IRON, "hood_duct_left");
  rod([0.92, 1.86, 0.05], [0.92, 1.98, 0.05], 0.055, DARK_IRON, "hood_duct_right");
  rod([-0.6, 1.98, 0.05], [0.92, 1.98, 0.05], 0.055, DARK_IRON, "hood_duct_cross");

  // Large ribbed pressure canister at the left.
  cyl(0.22, 0.67, [-1.03, 1.02, 0.17], COPPER, "pressure_canister");
  ring(0.22, 0.035, [-1.03, 0.77, 0.17], DARK_IRON, "canister_bottom_band");
  ring(0.22, 0.035, [-1.03, 1.28, 0.17], DARK_IRON, "canister_top_band");
  ring(0.205, 0.018, [-1.03, 0.93, 0.17], BRASS, "canister_mid_band");
  cyl(0.1, 0.05, [-1.03, 1.38, 0.17], STEEL, "canister_neck");
  sphere(0.09, [-1.03, 1.43, 0.17], BRASS, "canister_valve");
  b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
    at: [-1.03, 1.03, 0.395],
    dir: [0, 0, 1],
    axis: "z",
    texture: gaugeTex,
    name: "pressure_gauge",
  });

  // Tall right-side hot-water / waste canister.
  cyl(0.2, 0.82, [1.03, 1.1, 0.12], DARK_IRON, "right_utility_tank");
  ring(0.2, 0.03, [1.03, 0.75, 0.12], BRASS, "utility_lower_ring");
  ring(0.2, 0.03, [1.03, 1.45, 0.12], BRASS, "utility_upper_ring");
  cyl(0.12, 0.08, [1.03, 1.57, 0.12], STEEL, "utility_cap");
  rod([1.03, 1.61, 0.12], [1.03, 1.82, 0.12], 0.035, COPPER, "utility_vent");
  sphere(0.05, [1.03, 1.84, 0.12], RED, "utility_warning");

  // Exposed plumbing, deliberately overbuilt and asymmetrical.
  rod([-1.2, 1.48, 0.35], [-1.2, 1.82, 0.35], 0.025, COPPER, "left_vertical_pipe");
  rod([-1.2, 1.82, 0.35], [-0.35, 1.82, 0.35], 0.025, COPPER, "left_header_pipe");
  rod([-0.35, 1.82, 0.35], [-0.35, 1.48, 0.35], 0.025, COPPER, "left_drop_pipe");
  rod([0.72, 0.92, 0.4], [0.72, 1.63, 0.4], 0.028, BRASS, "right_supply_pipe");
  rod([0.72, 1.63, 0.4], [1.12, 1.63, 0.4], 0.028, BRASS, "right_supply_elbow");
  rod([1.12, 1.63, 0.4], [1.12, 1.38, 0.4], 0.028, BRASS, "right_supply_drop");
  for (const y of [1.08, 1.29, 1.5]) {
    box([0.12, 0.055, 0.12], [0.72, y, 0.4], DARK_IRON, `pipe_clamp_${y}`);
  }

  // Three hanging utensils under the shelf.
  const utensil = (x: number, y: number, length: number, kind: number) => {
    rod([x, y, 0.29], [x, y - length, 0.29], 0.012, STEEL, `hanging_utensil_stem_${kind}`);
    if (kind === 0) {
      ring(0.065, 0.012, [x, y - length - 0.05, 0.29], STEEL, `hanging_utensil_ladle_${kind}`);
    } else if (kind === 1) {
      box([0.13, 0.035, 0.055], [x, y - length - 0.035, 0.29], STEEL, `hanging_utensil_spatula_${kind}`);
    } else {
      rod([x - 0.045, y - length, 0.29], [x + 0.045, y - length, 0.29], 0.009, STEEL, `hanging_utensil_tongs_${kind}`);
    }
    sphere(0.022, [x, y, 0.29], BRASS, `utensil_hook_${kind}`);
  };
  utensil(-0.35, 1.31, 0.34, 0);
  utensil(-0.08, 1.31, 0.39, 1);
  utensil(0.22, 1.31, 0.3, 2);

  // Side-mounted control panel.
  box([0.62, 0.42, 0.08], [0.86, 1.03, 0.43], PANEL_DARK, "control_panel");
  box([0.44, 0.18, 0.025], [0.86, 1.18, 0.475], BLACK, "control_panel_window");
  b.part(new THREE.PlaneGeometry(0.4, 0.14), "#ffffff", {
    at: [0.86, 1.18, 0.492],
    dir: [0, 0, 1],
    axis: "z",
    texture: readoutTex,
    name: "green_digital_readout",
  });
  for (let i = 0; i < 5; i++) {
    cyl(0.032, 0.032, [0.66 + i * 0.1, 0.9, 0.48], i === 0 ? RED : STEEL, `panel_button_${i}`);
    sphere(0.015, [0.66 + i * 0.1, 0.96, 0.49], i === 0 ? RED : GREEN, `panel_indicator_${i}`);
  }
  for (const x of [0.69, 0.82, 0.95, 1.08]) {
    rod([x, 1.29, 0.48], [x, 1.38, 0.48], 0.009, BRASS, `panel_switch_${x}`);
    sphere(0.018, [x, 1.39, 0.48], AMBER, `panel_switch_tip_${x}`);
  }

  // Sickly green indicator bulbs along the upper rail.
  for (const x of [-0.92, -0.46, 0, 0.46, 0.92]) {
    const lamp = sphere(0.042, [x, 1.77, 0.38], GREEN, `upper_status_lamp_${x}`);
    glow(lamp, 1.8);
    ring(0.052, 0.012, [x, 1.77, 0.38], STEEL, `upper_status_bezel_${x}`);
  }

  // A final set of industrial rivets and cable guides gives the wall its dense used appearance.
  for (const x of [-1.22, -0.98, -0.74, -0.5, -0.26, 0, 0.26, 0.5, 0.74, 0.98, 1.22]) {
    sphere(0.021, [x, 1.13, -0.465], BRASS, `rear_rivet_high_${x}`);
    sphere(0.021, [x, 0.34, -0.465], BRASS, `rear_rivet_low_${x}`);
  }
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) {
    rod([x, 0.92, -0.47], [x + 0.14, 0.92, -0.47], 0.012, GASKET, `rear_cable_${x}`);
  }

  return b.root;
}
```