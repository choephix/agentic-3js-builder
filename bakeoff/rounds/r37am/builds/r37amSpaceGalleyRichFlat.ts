import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";
import { svg } from "../../../../src/index";

export const meta = {
  name: "nostromo-galley-kitchen",
  description:
    "A dense Alien-era Nostromo spaceship galley: stained cream industrial cabinetry, ribbed bulkheads, steel counters, stove, sink, pipes, service panels, mugs, utensils, warning labels and sickly fluorescent lights.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo-galley-kitchen", detail: 1 });

  const C = {
    wall: "#b8b29b",
    wallHi: "#d0c8ae",
    wallDark: "#77786d",
    olive: "#62685d",
    oliveDark: "#3f4943",
    steel: "#7d8580",
    steelDark: "#343b3a",
    steelHi: "#aeb4aa",
    black: "#171c1b",
    rubber: "#252a27",
    rust: "#713f2b",
    rustHi: "#a4613d",
    cream: "#d7ceb5",
    yellow: "#c98f32",
    warning: "#d5a42e",
    red: "#8b332c",
    green: "#667b61",
    cyan: "#79a6a1",
    glass: "#7a9a91",
    paper: "#d6d1b9",
    darkPaper: "#282d2a",
  };

  const rand = rng(1979);

  function part(
    geo: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    name: string,
    opts: Record<string, any> = {},
  ) {
    return b.part(geo, color, {
      at,
      name,
      flat: true,
      ...opts,
    });
  }

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    name: string,
    opts: Record<string, any> = {},
  ) {
    return part(new THREE.BoxGeometry(...size), color, at, name, opts);
  }

  function cyl(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    name: string,
    segments = 10,
    opts: Record<string, any> = {},
  ) {
    return part(
      new THREE.CylinderGeometry(radius, radius, height, segments, 1),
      color,
      at,
      name,
      opts,
    );
  }

  function sphere(
    radius: number,
    at: [number, number, number],
    color: string,
    name: string,
    opts: Record<string, any> = {},
  ) {
    return part(new THREE.SphereGeometry(radius, 8, 5), color, at, name, opts);
  }

  function rod(
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    name: string,
  ) {
    return b.rod(a, z, radius, { color, name, flat: true });
  }

  function frontPanel(
    size: [number, number],
    at: [number, number, number],
    color: string,
    name: string,
  ) {
    return box([size[0], size[1], 0.035], at, color, name);
  }

  function rivet(x: number, y: number, z: number, name: string, color = C.steelHi) {
    sphere(0.012, [x, y, z], color, name);
  }

  function warningStripe(
    x: number,
    y: number,
    w: number,
    h: number,
    z: number,
    name: string,
  ) {
    const stripe = box([w, h, 0.006], [x, y, z], C.warning, name);
    for (let i = -2; i <= 2; i++) {
      box(
        [0.014, h * 1.25, 0.008],
        [x + i * 0.055, y, z + 0.006],
        C.black,
        `${name}.slash${i}`,
        { rotation: [0, 0, -32] },
      );
    }
    return stripe;
  }

  const labelTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 64">
      <rect width="240" height="64" fill="#282d2a"/>
      <rect x="4" y="4" width="232" height="56" fill="none" stroke="#c9bd9c" stroke-width="3"/>
      <text x="120" y="42" text-anchor="middle" font-family="monospace" font-size="27" font-weight="bold" letter-spacing="3" fill="#d8cda9">GALLEY 04</text>
    </svg>`,
    { size: 256 },
  );

  const cautionTex = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48">
      <rect width="240" height="48" fill="#c98f32"/>
      <path d="M0 0L34 48M42 0L76 48M84 0L118 48M126 0L160 48M168 0L202 48M210 0L244 48" stroke="#171c1b" stroke-width="15"/>
      <text x="120" y="31" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#eee0ae">CAUTION / HOT</text>
    </svg>`,
    { size: 256 },
  );

  // Grounded galley footprint and rear bulkhead.
  box([2.45, 0.055, 1.45], [0, 0.028, 0.05], C.black, "rubber_floor");
  box([2.35, 2.22, 0.12], [0, 1.13, -0.58], C.wallDark, "rear_bulkhead");
  box([2.14, 1.96, 0.035], [0, 1.17, -0.645], C.wall, "rear_inner_skin");

  // Ribbed wall framing.
  for (let x = -1.03; x <= 1.03; x += 0.26) {
    box([0.045, 2.02, 0.06], [x, 1.15, -0.68], C.oliveDark, `bulkhead_rib_${x.toFixed(2)}`);
    rivet(x, 0.24, -0.72, `rib_bottom_rivet_${x.toFixed(2)}`);
    rivet(x, 2.04, -0.72, `rib_top_rivet_${x.toFixed(2)}`);
  }
  for (const y of [0.32, 0.72, 1.12, 1.52, 1.92]) {
    box([2.15, 0.025, 0.035], [0, y, -0.675], C.wallDark, `bulkhead_seam_${y}`);
  }

  // Ceiling service rail and harsh fluorescent fixtures.
  box([2.26, 0.08, 0.34], [0, 2.13, -0.27], C.oliveDark, "ceiling_service_rail");
  box([2.18, 0.08, 0.34], [0, 2.13, 0.31], C.oliveDark, "ceiling_front_rail");
  for (const x of [-0.72, 0, 0.72]) {
    box([0.42, 0.035, 0.12], [x, 2.075, -0.2], C.steelDark, `fluoro_housing_${x}`);
    box([0.32, 0.012, 0.07], [x, 2.05, -0.2], C.cyan, `fluoro_tube_${x}`);
  }

  // Left tall storage bank.
  box([0.54, 1.92, 0.52], [-0.86, 1.03, -0.31], C.olive, "left_storage_case");
  box([0.055, 1.88, 0.55], [-1.14, 1.03, -0.31], C.steelDark, "left_storage_edge");
  box([0.055, 1.88, 0.55], [-0.58, 1.03, -0.31], C.steelDark, "left_storage_edge_r");
  for (let i = 0; i < 5; i++) {
    const y = 0.31 + i * 0.36;
    frontPanel([0.48, 0.30], [-0.86, y, -0.045], i % 2 ? C.wall : C.wallHi, `left_locker_${i}`);
    box([0.055, 0.035, 0.028], [-0.86, y, 0.0], C.rubber, `left_locker_handle_${i}`);
    rivet(-1.065, y - 0.105, -0.01, `left_locker_rivet_a_${i}`);
    rivet(-0.655, y - 0.105, -0.01, `left_locker_rivet_b_${i}`);
  }
  warningStripe(-0.86, 1.84, 0.34, 0.075, 0.01, "left_caution");

  // Right tall pantry / refrigerator with rounded mechanical corners.
  box([0.66, 1.87, 0.50], [0.79, 1.04, -0.30], C.wallDark, "right_pantry_body");
  frontPanel([0.58, 1.66], [0.79, 1.02, -0.03], C.wall, "right_pantry_door");
  box([0.08, 1.72, 0.045], [0.46, 1.02, -0.005], C.oliveDark, "pantry_left_stile");
  box([0.08, 1.72, 0.045], [1.12, 1.02, -0.005], C.oliveDark, "pantry_right_stile");
  box([0.075, 1.42, 0.06], [0.91, 1.02, 0.03], C.rubber, "pantry_vertical_handle");
  for (const y of [0.27, 1.78]) {
    box([0.55, 0.035, 0.035], [0.79, y, 0.02], C.steelDark, `pantry_crossbar_${y}`);
  }
  for (const y of [0.30, 0.62, 0.94, 1.26, 1.58, 1.79]) {
    rivet(0.53, y, 0.035, `pantry_rivet_l_${y}`);
    rivet(1.05, y, 0.035, `pantry_rivet_r_${y}`);
  }
  box([0.34, 0.16, 0.025], [0.78, 1.62, 0.047], C.black, "pantry_status_window");
  box([0.055, 0.045, 0.012], [0.67, 1.62, 0.065], C.red, "pantry_red_status");
  box([0.055, 0.045, 0.012], [0.77, 1.62, 0.065], C.green, "pantry_green_status");
  box([0.055, 0.045, 0.012], [0.87, 1.62, 0.065], C.cyan, "pantry_cyan_status");

  // Main counter carcass.
  box([1.55, 0.76, 0.63], [0.10, 0.52, -0.27], C.oliveDark, "counter_carcass");
  box([1.68, 0.13, 0.70], [0.10, 0.92, -0.26], C.steelDark, "countertop_underrail");
  box([1.72, 0.10, 0.70], [0.10, 0.98, -0.26], C.steelHi, "countertop");
  box([1.69, 0.035, 0.66], [0.10, 1.04, -0.26], C.rust, "countertop_front_wear");
  box([1.69, 0.018, 0.64], [0.10, 1.075, -0.26], C.steelDark, "countertop_front_lip");

  // Lower cupboard doors and drawers.
  for (let i = 0; i < 4; i++) {
    const x = -0.48 + i * 0.39;
    frontPanel([0.32, 0.47], [x, 0.51, 0.055], i % 2 ? C.wall : C.wallHi, `lower_door_${i}`);
    box([0.06, 0.025, 0.03], [x, 0.51, 0.082], C.rubber, `lower_handle_${i}`);
    rivet(x - 0.13, 0.33, 0.09, `lower_rivet_a_${i}`);
    rivet(x + 0.13, 0.33, 0.09, `lower_rivet_b_${i}`);
  }
  for (let i = 0; i < 2; i++) {
    const x = 0.38 + i * 0.34;
    frontPanel([0.28, 0.17], [x, 0.78, 0.062], C.wall, `drawer_${i}`);
    box([0.09, 0.018, 0.026], [x, 0.78, 0.09], C.rubber, `drawer_handle_${i}`);
  }

  // Counter backsplash and overhead cupboards.
  box([1.67, 0.52, 0.085], [0.10, 1.30, -0.57], C.olive, "backsplash");
  box([1.68, 0.045, 0.10], [0.10, 1.57, -0.56], C.steelDark, "backsplash_cap");
  box([1.64, 0.47, 0.36], [0.10, 1.78, -0.40], C.wallDark, "upper_cupboard_bank");
  for (let i = 0; i < 4; i++) {
    const x = -0.50 + i * 0.40;
    frontPanel([0.34, 0.38], [x, 1.78, -0.205], i % 2 ? C.wallHi : C.wall, `upper_door_${i}`);
    box([0.075, 0.018, 0.028], [x, 1.78, -0.18], C.rubber, `upper_handle_${i}`);
    rivet(x - 0.13, 1.63, -0.17, `upper_rivet_a_${i}`);
    rivet(x + 0.13, 1.63, -0.17, `upper_rivet_b_${i}`);
  }
  box([1.64, 0.035, 0.38], [0.10, 1.55, -0.19], C.steelDark, "upper_cupboard_bottom_rail");

  // Sink basin on left side.
  box([0.53, 0.08, 0.41], [-0.43, 1.11, -0.29], C.steel, "sink_basin");
  box([0.58, 0.035, 0.045], [-0.43, 1.16, -0.29], C.steelHi, "sink_rim_front");
  box([0.58, 0.035, 0.045], [-0.43, 1.16, -0.50], C.steelHi, "sink_rim_back");
  box([0.035, 0.035, 0.42], [-0.72, 1.16, -0.29], C.steelHi, "sink_rim_left");
  box([0.035, 0.035, 0.42], [-0.14, 1.16, -0.29], C.steelHi, "sink_rim_right");
  cyl(0.055, 0.012, [-0.43, 1.17, -0.29], C.black, "sink_drain", 10);
  cyl(0.018, 0.29, [-0.61, 1.39, -0.46], C.steelDark, "faucet_stem", 8);
  b.rod([-0.61, 1.53, -0.46], [-0.61, 1.53, -0.27], 0.018, { color: C.steelDark, name: "faucet_spout" });
  cyl(0.034, 0.025, [-0.61, 1.39, -0.46], C.rustHi, "faucet_valve", 8);

  // Hotplate and four industrial burner rings.
  box([0.88, 0.055, 0.48], [0.54, 1.115, -0.28], C.steelDark, "hotplate_base");
  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 2; col++) {
      const x = 0.27 + col * 0.50;
      const z = -0.42 + row * 0.28;
      cyl(0.12, 0.018, [x, 1.155, z], C.black, `burner_${row}_${col}`, 12);
      cyl(0.075, 0.021, [x, 1.17, z], C.steel, `burner_inner_${row}_${col}`, 10);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        box(
          [0.018, 0.013, 0.055],
          [x + Math.cos(a) * 0.095, 1.183, z + Math.sin(a) * 0.095],
          C.rustHi,
          `burner_glow_${row}_${col}_${k}`,
          { rotation: [0, -a * 57.3, 0] },
        );
      }
    }
  }
  for (let i = 0; i < 5; i++) {
    cyl(0.026, 0.035, [0.18 + i * 0.16, 1.205, 0.04], C.steelHi, `stove_switch_${i}`, 8);
    box([0.014, 0.025, 0.03], [0.18 + i * 0.16, 1.23, 0.065], C.red, `stove_switch_mark_${i}`);
  }

  // Front oven / warming drawer.
  box([0.62, 0.49, 0.48], [0.55, 0.52, 0.09], C.steelDark, "oven_body");
  box([0.52, 0.31, 0.035], [0.55, 0.59, 0.345], C.black, "oven_window");
  box([0.43, 0.025, 0.035], [0.55, 0.84, 0.37], C.steelHi, "oven_handle");
  for (const x of [0.31, 0.55, 0.79]) {
    rivet(x, 0.30, 0.35, `oven_rivet_${x}`);
  }
  box([0.62, 0.035, 0.43], [0.55, 0.27, 0.08], C.rust, "oven_bottom_wear");
  warningStripe(0.55, 0.91, 0.34, 0.045, 0.38, "oven_hot_warning");

  // Control console at backsplash.
  box([0.60, 0.28, 0.06], [0.61, 1.43, -0.535], C.black, "control_console");
  box([0.53, 0.19, 0.012], [0.61, 1.46, -0.57], C.steel, "console_face");
  for (let i = 0; i < 8; i++) {
    const colors = [C.red, C.green, C.cyan, C.yellow];
    sphere(0.018, [0.40 + (i % 4) * 0.14, 1.51 - Math.floor(i / 4) * 0.10, -0.585], colors[i % 4], `console_lamp_${i}`);
  }
  for (let i = 0; i < 3; i++) {
    cyl(0.033, 0.018, [0.47 + i * 0.14, 1.37, -0.585], C.steelHi, `console_knob_${i}`, 8);
  }
  box([0.12, 0.055, 0.012], [0.82, 1.50, -0.59], C.cyan, "console_display");
  box([0.14, 0.018, 0.012], [0.82, 1.42, -0.59], C.red, "console_alarm_bar");

  // Small exhaust hood.
  box([0.95, 0.10, 0.30], [0.52, 1.92, -0.45], C.steelDark, "hood_top");
  box([0.84, 0.30, 0.035], [0.52, 1.76, -0.58], C.black, "hood_grille");
  for (let i = 0; i < 9; i++) {
    box([0.025, 0.22, 0.025], [0.13 + i * 0.10, 1.76, -0.605], C.steel, `hood_grille_bar_${i}`);
  }
  box([0.62, 0.035, 0.055], [0.52, 1.58, -0.57], C.rust, "hood_grease_lip");
  for (let i = 0; i < 4; i++) {
    cyl(0.035, 0.08, [0.22 + i * 0.20, 2.02, -0.45], C.rubber, `hood_mount_${i}`, 8);
  }

  // Overhead pipework and conduit.
  rod([-1.10, 1.97, -0.48], [-0.78, 1.97, -0.48], 0.025, C.rustHi, "pipe_left_horizontal");
  rod([-0.78, 1.97, -0.48], [-0.78, 1.65, -0.48], 0.025, C.rustHi, "pipe_left_drop");
  rod([1.02, 1.94, -0.50], [1.02, 1.40, -0.50], 0.031, C.steel, "pipe_right_drop");
  rod([1.02, 1.94, -0.50], [0.72, 1.94, -0.50], 0.031, C.steel, "pipe_right_top");
  for (const p of [
    [-1.10, 1.97, -0.48],
    [-0.78, 1.97, -0.48],
    [1.02, 1.94, -0.50],
    [0.72, 1.94, -0.50],
  ] as [number, number, number][]) {
    sphere(0.045, p, C.rust, `pipe_joint_${p[0]}_${p[1]}`);
  }
  for (let i = 0; i < 6; i++) {
    box([0.12, 0.018, 0.018], [-1.00 + i * 0.10, 1.86, -0.52], C.steelHi, `pipe_clamp_${i}`);
  }

  // Galley name plate.
  part(
    new THREE.PlaneGeometry(0.62, 0.165),
    C.paper,
    [0, 1.78, -0.706],
    "galley_nameplate",
    { dir: [0, 0, 1], axis: "z", texture: labelTex },
  );

  // Warning label beside stove.
  part(
    new THREE.PlaneGeometry(0.48, 0.096),
    C.warning,
    [0.60, 1.29, -0.595],
    "hot_surface_label",
    { dir: [0, 0, 1], axis: "z", texture: cautionTex },
  );

  // Hanging utensil rail.
  rod([-0.88, 1.29, -0.62], [-0.28, 1.29, -0.62], 0.014, C.steelHi, "utensil_rail");
  for (let i = 0; i < 5; i++) {
    const x = -0.80 + i * 0.12;
    cyl(0.022, 0.035, [x, 1.29, -0.62], C.rust, `utensil_hook_${i}`, 8);
  }
  // Hanging ladles and spatulas.
  rod([-0.80, 1.28, -0.62], [-0.80, 0.94, -0.62], 0.009, C.steel, "ladle_handle");
  sphere(0.045, [-0.80, 0.90, -0.62], C.steel, "ladle_bowl");
  rod([-0.68, 1.28, -0.62], [-0.68, 0.95, -0.62], 0.009, C.steelDark, "spatula_handle");
  box([0.10, 0.015, 0.12], [-0.68, 0.90, -0.62], C.steel, "spatula_head");
  rod([-0.56, 1.28, -0.62], [-0.56, 1.00, -0.62], 0.009, C.rustHi, "tongs_left");
  rod([-0.54, 1.28, -0.62], [-0.54, 1.00, -0.62], 0.009, C.rustHi, "tongs_right");

  // Mugs and mess on the counter.
  function mug(x: number, z: number, color: string, id: string) {
    cyl(0.075, 0.14, [x, 1.22, z], color, `${id}_body`, 10);
    cyl(0.055, 0.008, [x, 1.294, z], C.black, `${id}_coffee`, 10);
    b.sweep(
      [
        [x + 0.07, 1.26, z],
        [x + 0.13, 1.26, z],
        [x + 0.13, 1.16, z],
        [x + 0.07, 1.16, z],
      ],
      0.012,
      { color, name: `${id}_handle`, caps: "round", section: { ngon: 6 } },
    );
    rivet(x - 0.042, 1.24, z + 0.065, `${id}_maker_mark`, C.yellow);
  }
  mug(-0.88, -0.18, C.red, "red_mug");
  mug(-0.99, -0.39, C.wallHi, "cream_mug");
  mug(0.98, -0.18, C.green, "green_mug");

  // Mess tin and ration canisters.
  cyl(0.11, 0.045, [-0.18, 1.18, -0.12], C.steel, "mess_tin", 12);
  cyl(0.095, 0.012, [-0.18, 1.205, -0.12], C.rustHi, "mess_tin_lid", 12);
  for (let i = 0; i < 4; i++) {
    cyl(0.055, 0.17, [0.90 + i * 0.075, 1.22, -0.44], i % 2 ? C.yellow : C.red, `ration_can_${i}`, 10);
    cyl(0.058, 0.012, [0.90 + i * 0.075, 1.31, -0.44], C.steelHi, `ration_can_lid_${i}`, 10);
  }

  // Small wall-mounted intercom / meal computer.
  box([0.36, 0.40, 0.10], [-0.32, 1.50, -0.69], C.steelDark, "wall_computer_body");
  box([0.27, 0.20, 0.018], [-0.32, 1.56, -0.75], C.green, "wall_computer_screen");
  box([0.22, 0.025, 0.018], [-0.32, 1.42, -0.75], C.steelHi, "wall_computer_keyboard");
  for (let i = 0; i < 8; i++) {
    box([0.018, 0.012, 0.012], [-0.40 + (i % 4) * 0.055, 1.42 - Math.floor(i / 4) * 0.027, -0.765], C.black, `keyboard_key_${i}`);
  }
  for (let i = 0; i < 4; i++) {
    sphere(0.014, [-0.44 + i * 0.08, 1.67, -0.75], [C.red, C.green, C.yellow, C.cyan][i], `computer_lamp_${i}`);
  }

  // Industrial corner bumpers, feet, and exposed fasteners.
  for (const x of [-1.17, 1.18]) {
    box([0.10, 2.05, 0.10], [x, 1.08, -0.48], C.rust, `corner_guard_${x}`);
    for (const y of [0.18, 0.68, 1.18, 1.68]) {
      rivet(x, y, -0.54, `corner_guard_rivet_${x}_${y}`, C.yellow);
    }
  }
  for (const x of [-1.03, -0.52, 0, 0.52, 1.03]) {
    box([0.12, 0.06, 0.22], [x, 0.09, -0.28], C.rubber, `cabinet_foot_${x}`);
  }

  // A few deliberately uneven stains and repair plates.
  box([0.21, 0.13, 0.012], [-0.12, 0.37, 0.091], C.rustHi, "repair_patch_lower");
  box([0.13, 0.20, 0.012], [0.22, 0.72, 0.092], C.rust, "repair_patch_drawer");
  box([0.20, 0.08, 0.012], [0.87, 0.34, 0.096], C.rustHi, "repair_patch_oven");
  for (let i = 0; i < 6; i++) {
    const x = -0.98 + rand() * 1.95;
    const y = 1.10 + rand() * 0.25;
    sphere(0.009 + rand() * 0.006, [x, y, -0.705], C.rust, `wall_smut_${i}`);
  }

  // Loose floor-level service conduits.
  rod([-1.12, 0.12, -0.53], [-0.42, 0.12, -0.53], 0.018, C.rubber, "floor_conduit_left");
  rod([0.48, 0.12, -0.53], [1.10, 0.12, -0.53], 0.018, C.rubber, "floor_conduit_right");
  for (let i = 0; i < 7; i++) {
    box([0.045, 0.035, 0.06], [-1.05 + i * 0.10, 0.13, -0.53], C.steelHi, `conduit_clip_l_${i}`);
  }
  for (let i = 0; i < 7; i++) {
    box([0.045, 0.035, 0.06], [0.55 + i * 0.085, 0.13, -0.53], C.steelHi, `conduit_clip_r_${i}`);
  }

  return b.root;
}
