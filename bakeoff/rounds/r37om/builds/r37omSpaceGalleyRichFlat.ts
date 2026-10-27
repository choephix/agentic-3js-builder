import * as THREE from "three";
import { createBuilder, rng, svg } from "../../../../src/index";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A dense industrial spaceship galley kitchen prop group inspired by the utilitarian 1979 Nostromo: ribbed bulkheads, dark worn cabinets, amber work lights, sink, cooktop, ducting, pipes, warning labels and chunky mechanical details.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const INK = "#111316";
  const BLACK = "#090b0c";
  const CHARCOAL = "#202427";
  const PANEL = "#343a3b";
  const PANEL_LIGHT = "#59605f";
  const PANEL_DARK = "#181c1d";
  const OLIVE = "#4a5049";
  const OLIVE_LIGHT = "#69705f";
  const STEEL = "#7b8580";
  const STEEL_DARK = "#3d4544";
  const ALUMINUM = "#a5aaa0";
  const RUBBER = "#17191a";
  const AMBER = "#d58a29";
  const AMBER_BRIGHT = "#ffd36b";
  const RED = "#9a2d24";
  const YELLOW = "#d2ad38";
  const CREAM = "#c7b993";
  const WHITE = "#d6d7cb";
  const BLUE = "#3f6066";
  const GREEN = "#596c51";

  const metalRng = rng(19);

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    opts: any = {},
  ) => {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      name,
      flat: true,
      ...opts,
    });
  };

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
    radial = 10,
  ) => {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, height, radial, 1, false),
      color,
      { at, dir, name, flat: true },
    );
  };

  const ring = (
    radius: number,
    tube: number,
    at: [number, number, number],
    color: string,
    name: string,
    dir: [number, number, number] = [0, 1, 0],
  ) => {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, 16), color, {
      at,
      dir,
      name,
      flat: true,
    });
  };

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) => b.rod(a, c, radius, { color, name, section: { ngon: 8 } });

  const rivet = (x: number, y: number, z: number, name: string, color = STEEL) =>
    cylinder(0.018, 0.012, [x, y, z], color, name, [0, 0, 1], 8);

  const amberLight = (x: number, y: number, z: number, w: number, name: string) => {
    const p = box([w, 0.035, 0.018], [x, y, z], AMBER_BRIGHT, name);
    const mat = (p.mesh.material as THREE.MeshStandardMaterial).clone();
    mat.emissive = new THREE.Color(AMBER);
    mat.emissiveIntensity = 1.6;
    p.mesh.material = mat;
    return p;
  };

  // Floor plate and rear bulkhead.
  box([3.35, 0.08, 1.85], [0, 0.04, -0.02], PANEL_DARK, "galley_floor");
  box([3.35, 2.55, 0.12], [0, 1.28, -0.78], PANEL, "rear_bulkhead");
  box([3.35, 0.14, 0.22], [0, 2.42, -0.68], PANEL_DARK, "bulkhead_header");
  box([3.35, 0.16, 0.22], [0, 0.18, -0.68], PANEL_DARK, "bulkhead_foot");
  box([0.11, 2.18, 0.18], [-1.58, 1.28, -0.62], PANEL_DARK, "left_vertical_frame");
  box([0.11, 2.18, 0.18], [1.58, 1.28, -0.62], PANEL_DARK, "right_vertical_frame");

  // Vertical structural ribs.
  for (const x of [-1.32, -0.66, 0, 0.66, 1.32]) {
    box([0.075, 2.1, 0.08], [x, 1.28, -0.68], PANEL_DARK, `bulkhead_rib_${x}`);
    for (let y = 0.38; y < 2.3; y += 0.34) {
      rivet(x, y, -0.625, `rear_rivet_${x}_${y}`);
    }
  }

  // Left and right side return walls.
  box([0.12, 2.3, 1.65], [-1.67, 1.18, 0.02], PANEL, "left_side_return");
  box([0.12, 2.3, 1.65], [1.67, 1.18, 0.02], PANEL, "right_side_return");
  box([0.2, 2.3, 0.11], [-1.56, 1.18, 0.82], PANEL_DARK, "left_edge_trim");
  box([0.2, 2.3, 0.11], [1.56, 1.18, 0.82], PANEL_DARK, "right_edge_trim");

  // Ceiling service rail.
  box([3.1, 0.12, 0.5], [0, 2.42, -0.18], PANEL_DARK, "ceiling_service_box");
  box([2.4, 0.045, 0.36], [0, 2.35, 0.03], BLACK, "ceiling_shadow_panel");
  rod([-1.36, 2.29, 0.25], [1.36, 2.29, 0.25], 0.026, STEEL_DARK, "ceiling_pipe_front");
  for (const x of [-1.1, -0.55, 0, 0.55, 1.1]) {
    cylinder(0.037, 0.08, [x, 2.25, 0.25], STEEL_DARK, `ceiling_hanger_${x}`);
    amberLight(x, 2.19, 0.25, 0.22, `ceiling_worklight_${x}`);
  }

  // Main counter carcass.
  box([3.12, 0.68, 0.72], [0, 0.72, 0.05], OLIVE, "lower_counter_body");
  box([3.24, 0.1, 0.8], [0, 1.08, 0.05], STEEL_DARK, "countertop_edge");
  box([3.18, 0.08, 0.76], [0, 1.13, 0.05], PANEL_LIGHT, "countertop");
  box([3.06, 0.035, 0.65], [0, 1.18, 0.04], CHARCOAL, "countertop_inset");

  // Toe kick and feet.
  box([3.05, 0.16, 0.66], [0, 0.34, 0.05], PANEL_DARK, "toe_kick");
  for (const x of [-1.35, -0.45, 0.45, 1.35]) {
    cylinder(0.075, 0.16, [x, 0.18, 0.05], RUBBER, `counter_foot_${x}`);
    box([0.18, 0.045, 0.22], [x, 0.1, 0.05], BLACK, `foot_pad_${x}`);
  }

  // Lower cabinet doors and drawer stack.
  const doorXs = [-1.18, -0.72, 0.72, 1.18];
  for (let i = 0; i < doorXs.length; i++) {
    const x = doorXs[i];
    box([0.38, 0.48, 0.035], [x, 0.73, 0.425], PANEL_DARK, `lower_door_${i}`);
    box([0.32, 0.4, 0.018], [x, 0.73, 0.447], OLIVE_LIGHT, `lower_door_inset_${i}`);
    cylinder(0.018, 0.18, [x, 0.73, 0.477], STEEL, `lower_handle_${i}`, [1, 0, 0], 8);
    rivet(x - 0.14, 0.53, 0.47, `lower_rivet_a_${i}`);
    rivet(x + 0.14, 0.93, 0.47, `lower_rivet_b_${i}`);
  }

  box([0.54, 0.49, 0.04], [-0.04, 0.74, 0.445], PANEL_DARK, "drawer_stack");
  for (let i = 0; i < 3; i++) {
    const y = 0.53 + i * 0.18;
    box([0.47, 0.14, 0.025], [-0.04, y, 0.475], STEEL_DARK, `drawer_${i}`);
    box([0.22, 0.025, 0.025], [-0.04, y, 0.495], STEEL, `drawer_pull_${i}`);
  }

  // Sink basin on the left.
  box([0.68, 0.075, 0.5], [-1.03, 1.205, 0.02], BLACK, "sink_rim");
  box([0.57, 0.09, 0.39], [-1.03, 1.16, 0.02], STEEL_DARK, "sink_basin");
  box([0.43, 0.018, 0.28], [-1.03, 1.21, 0.02], BLACK, "sink_bottom");
  ring(0.08, 0.012, [-1.03, 1.23, 0.12], STEEL, "sink_drain", [0, 1, 0]);
  cylinder(0.035, 0.18, [-0.78, 1.42, 0.11], STEEL, "faucet_stem", [0, 1, 0], 8);
  rod([-0.78, 1.51, 0.11], [-0.78, 1.51, 0.28], 0.035, STEEL, "faucet_neck");
  cylinder(0.05, 0.035, [-0.78, 1.51, 0.28], STEEL_DARK, "faucet_head", [0, 0, 1], 8);
  rod([-0.78, 1.41, 0.1], [-0.62, 1.45, 0.1], 0.012, RUBBER, "faucet_side_pipe");

  // Cooktop on the right.
  box([0.85, 0.055, 0.54], [0.83, 1.22, 0.03], BLACK, "cooktop_plate");
  for (const x of [0.58, 1.08]) {
    ring(0.16, 0.018, [x, 1.26, 0.03], STEEL_DARK, `burner_ring_${x}`);
    ring(0.08, 0.012, [x, 1.27, 0.03], STEEL, `burner_inner_${x}`);
    cylinder(0.026, 0.04, [x, 1.29, 0.03], RUBBER, `burner_cap_${x}`);
  }
  box([0.18, 0.055, 0.04], [1.35, 1.25, 0.03], RED, "cooktop_warning");
  for (const x of [0.48, 0.68, 0.88, 1.08, 1.28]) {
    cylinder(0.018, 0.04, [x, 1.29, 0.31], AMBER, `control_knob_${x}`, [0, 1, 0], 8);
  }

  // Upright galley backsplash and hotplate shield.
  box([1.38, 0.72, 0.08], [0.65, 1.66, -0.55], PANEL_DARK, "backsplash");
  box([1.1, 0.45, 0.045], [0.65, 1.69, -0.50], STEEL_DARK, "backsplash_inset");
  for (const x of [0.2, 0.55, 0.9, 1.1]) {
    box([0.025, 0.32, 0.015], [x, 1.69, -0.47], PANEL_LIGHT, `backsplash_slot_${x}`);
  }
  box([0.72, 0.48, 0.055], [0.85, 1.65, -0.43], BLACK, "cooktop_splash_guard");
  rod([0.5, 1.48, -0.42], [1.2, 1.48, -0.42], 0.022, STEEL, "splash_guard_bar");

  // Upper cupboards.
  box([3.05, 0.66, 0.58], [0, 2.02, -0.39], OLIVE, "upper_cupboard_body");
  box([3.12, 0.08, 0.65], [0, 2.38, -0.39], PANEL_DARK, "upper_cupboard_top");
  box([3.12, 0.08, 0.65], [0, 1.68, -0.39], PANEL_DARK, "upper_cupboard_bottom");

  for (let i = 0; i < 6; i++) {
    const x = -1.25 + i * 0.5;
    box([0.43, 0.52, 0.035], [x, 2.03, -0.055], PANEL, `upper_door_${i}`);
    box([0.36, 0.4, 0.018], [x, 2.03, -0.078], PANEL_LIGHT, `upper_door_inset_${i}`);
    cylinder(0.014, 0.13, [x, 1.86, -0.105], STEEL, `upper_latch_${i}`, [1, 0, 0], 8);
    rivet(x - 0.16, 1.83, -0.1, `upper_rivet_low_${i}`);
    rivet(x + 0.16, 2.23, -0.1, `upper_rivet_high_${i}`);
  }

  // Narrow under-cabinet service rail and warm lamps.
  box([2.85, 0.09, 0.13], [0, 1.62, -0.04], BLACK, "under_cabinet_rail");
  for (const x of [-1.05, -0.35, 0.35, 1.05]) {
    amberLight(x, 1.57, -0.02, 0.27, `under_cabinet_lamp_${x}`);
    cylinder(0.026, 0.06, [x, 1.64, -0.04], STEEL, `lamp_mount_${x}`);
  }

  // Right-side vertical locker / refrigerator.
  box([0.72, 1.98, 0.62], [1.25, 1.35, 0.42], PANEL_DARK, "right_locker_body");
  box([0.62, 1.82, 0.035], [1.25, 1.38, 0.755], OLIVE, "right_locker_door");
  box([0.5, 1.52, 0.018], [1.25, 1.38, 0.78], OLIVE_LIGHT, "right_locker_inset");
  box([0.08, 0.8, 0.045], [1.0, 1.36, 0.81], STEEL, "locker_handle");
  box([0.3, 0.04, 0.02], [1.25, 2.03, 0.8], AMBER, "locker_status");
  box([0.3, 0.04, 0.02], [1.25, 1.0, 0.8], RED, "locker_fault");
  for (const y of [0.55, 1.1, 1.6, 2.1]) {
    rivet(0.95, y, 0.81, `locker_rivet_l_${y}`);
    rivet(1.55, y, 0.81, `locker_rivet_r_${y}`);
  }

  // Left-side open shelf and galley canisters.
  box([0.7, 1.3, 0.58], [-1.25, 1.56, 0.36], PANEL_DARK, "left_open_shelf");
  for (const y of [1.02, 1.48, 1.94]) {
    box([0.58, 0.055, 0.48], [-1.25, y, 0.43], STEEL_DARK, `left_shelf_${y}`);
    box([0.61, 0.045, 0.06], [-1.25, y + 0.045, 0.18], PANEL_LIGHT, `shelf_lip_${y}`);
  }
  for (const [x, y, r, h, c] of [
    [-1.43, 1.12, 0.12, 0.28, STEEL],
    [-1.17, 1.12, 0.1, 0.3, ALUMINUM],
    [-1.4, 1.58, 0.1, 0.26, OLIVE_LIGHT],
    [-1.14, 1.58, 0.12, 0.3, STEEL],
    [-1.3, 2.04, 0.1, 0.22, AMBER],
  ] as [number, number, number, number, string][]) {
    cylinder(r, h, [x, y, 0.38], c, `galley_can_${x}_${y}`, [0, 1, 0], 10);
    ring(r * 0.88, 0.012, [x, y + h / 2, 0.38], RUBBER, `can_lid_${x}_${y}`);
  }

  // Large overhead extraction hood.
  box([1.35, 0.18, 0.72], [0.68, 2.38, 0.18], PANEL_DARK, "extraction_hood");
  box([1.12, 0.05, 0.5], [0.68, 2.27, 0.48], BLACK, "hood_underface");
  box([0.92, 0.045, 0.3], [0.68, 2.24, 0.5], STEEL_DARK, "hood_filter");
  for (let x = 0.3; x <= 1.05; x += 0.15) {
    box([0.035, 0.025, 0.22], [x, 2.245, 0.5], PANEL_LIGHT, `hood_filter_slit_${x}`);
  }
  box([0.18, 0.08, 0.25], [1.3, 2.31, 0.2], RED, "hood_warning_lamp");
  amberLight(0.68, 2.29, 0.52, 0.5, "hood_worklight");

  // Extraction duct rising into the ceiling.
  cylinder(0.17, 0.4, [0.68, 2.57, 0.18], STEEL_DARK, "hood_duct", [0, 1, 0], 12);
  ring(0.2, 0.025, [0.68, 2.39, 0.18], STEEL, "duct_flange");
  ring(0.19, 0.022, [0.68, 2.76, 0.18], STEEL, "duct_top_flange");
  box([0.5, 0.04, 0.32], [0.68, 2.82, 0.18], BLACK, "duct_ceiling_plate");

  // Exposed pipe bundle at the rear.
  rod([-1.42, 0.35, -0.59], [-1.42, 2.32, -0.59], 0.035, STEEL_DARK, "rear_pipe_left");
  rod([-1.3, 0.42, -0.55], [-1.3, 2.28, -0.55], 0.023, RED, "rear_pipe_red");
  rod([1.42, 0.32, -0.57], [1.42, 2.3, -0.57], 0.04, STEEL_DARK, "rear_pipe_right");
  rod([1.42, 1.92, -0.57], [0.72, 1.92, -0.57], 0.026, BLUE, "rear_pipe_blue");
  rod([1.42, 1.78, -0.57], [0.9, 1.78, -0.57], 0.021, AMBER, "rear_pipe_amber");
  for (const y of [0.62, 1.14, 1.66, 2.15]) {
    cylinder(0.06, 0.05, [-1.42, y, -0.59], STEEL, `left_pipe_clamp_${y}`, [1, 0, 0]);
    cylinder(0.06, 0.05, [1.42, y, -0.57], STEEL, `right_pipe_clamp_${y}`, [1, 0, 0]);
  }

  // Front-left utility console.
  box([0.52, 0.72, 0.28], [-1.23, 1.48, 0.78], CHARCOAL, "utility_console");
  box([0.42, 0.3, 0.025], [-1.23, 1.63, 0.94], BLACK, "utility_console_face");
  box([0.24, 0.08, 0.018], [-1.23, 1.74, 0.96], CREAM, "utility_console_label");
  for (const x of [-1.37, -1.23, -1.09]) {
    cylinder(0.025, 0.035, [x, 1.54, 0.97], x < -1.2 ? RED : AMBER, `utility_button_${x}`, [0, 0, 1], 8);
  }
  for (let i = 0; i < 5; i++) {
    amberLight(-1.38 + i * 0.075, 1.4, 0.97, 0.04, `console_indicator_${i}`);
  }

  // Small overhead status box with a screen.
  box([0.72, 0.28, 0.16], [-0.45, 2.39, 0.31], PANEL_DARK, "status_box");
  box([0.42, 0.14, 0.012], [-0.45, 2.39, 0.405], BLUE, "status_screen");
  for (let i = 0; i < 5; i++) {
    box([0.045, 0.012, 0.012], [-0.62 + i * 0.085, 2.4, 0.415], i === 4 ? RED : AMBER, `screen_bar_${i}`);
  }
  cylinder(0.022, 0.025, [-0.16, 2.39, 0.405], RED, "status_alarm", [0, 0, 1], 8);

  // Warning stripe panels on the counter ends.
  for (const s of [-1, 1]) {
    box([0.18, 0.32, 0.012], [s * 1.52, 0.72, 0.45], YELLOW, `hazard_panel_${s}`);
    for (let i = 0; i < 4; i++) {
      box([0.045, 0.32, 0.018], [s * (1.52 + (i - 1.5) * 0.05), 0.72, 0.47], INK, `hazard_stripe_${s}_${i}`, {
        rotation: [0, 0, s * -18],
      });
    }
  }

  // Heavy floor tie-downs and drainage grates.
  for (const x of [-1.42, 1.42]) {
    for (const z of [-0.5, 0.42]) {
      cylinder(0.07, 0.025, [x, 0.1, z], STEEL_DARK, `floor_tiedown_${x}_${z}`, [0, 1, 0], 8);
      ring(0.055, 0.012, [x, 0.12, z], STEEL, `floor_tiedown_ring_${x}_${z}`);
    }
  }
  box([0.52, 0.018, 0.18], [-0.25, 0.085, -0.5], BLACK, "floor_drain");
  for (let x = -0.45; x <= -0.05; x += 0.08) {
    box([0.025, 0.022, 0.14], [x, 0.1, -0.5], STEEL_DARK, `drain_slit_${x}`);
  }

  // Nostromo-style stencil labels and panel markings.
  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 64">
      <rect width="256" height="64" fill="#171a19"/>
      <text x="8" y="25" font-family="monospace" font-size="18" font-weight="bold" fill="#c8b987">GALLEY / 03</text>
      <text x="8" y="48" font-family="monospace" font-size="12" fill="#9a2d24">AUTHORIZED CREW ONLY</text>
      <path d="M205 10h38v38h-38z" fill="none" stroke="#d2ad38" stroke-width="4"/>
      <path d="M212 40l12-24 12 24z" fill="#d2ad38"/>
    </svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.62, 0.155), WHITE, {
    at: [-0.55, 1.35, 0.795],
    dir: [0, 0, 1],
    axis: "z",
    texture: labelTexture,
    name: "galley_stencil_label",
  });

  const warningTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 64">
      <rect width="128" height="64" fill="#181b1b"/>
      <path d="M12 51L35 10l23 41z" fill="#d2ad38" stroke="#111316" stroke-width="4"/>
      <path d="M35 22v14M35 43v3" stroke="#111316" stroke-width="5"/>
      <text x="65" y="28" font-family="monospace" font-size="13" fill="#d2ad38">HOT</text>
      <text x="65" y="46" font-family="monospace" font-size="11" fill="#c7b993">SURFACE</text>
    </svg>`,
    { size: 128 },
  );
  b.part(new THREE.PlaneGeometry(0.38, 0.19), WHITE, {
    at: [0.83, 1.39, 0.8],
    dir: [0, 0, 1],
    axis: "z",
    texture: warningTexture,
    name: "hot_surface_warning",
  });

  // A few intentionally irregular fasteners for hand-built industrial character.
  const fasteners = [
    [-1.49, 2.27, -0.57],
    [-1.49, 1.9, -0.57],
    [1.49, 2.27, -0.57],
    [1.49, 1.9, -0.57],
    [-1.53, 1.2, 0.78],
    [1.53, 1.2, 0.78],
    [-1.53, 0.55, 0.78],
    [1.53, 0.55, 0.78],
  ] as [number, number, number][];
  fasteners.forEach((p, i) => {
    const wobble = (metalRng() - 0.5) * 0.006;
    cylinder(0.026, 0.018, [p[0] + wobble, p[1], p[2]], STEEL, `structural_fastener_${i}`, [0, 0, 1], 8);
  });

  return b.root;
}
