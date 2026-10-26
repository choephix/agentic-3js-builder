```ts
import * as THREE from "three";
import {
  createBuilder,
  paint,
  noise,
  mix,
  smoothstep,
  svg,
} from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled, INK as CLOCK_INK } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A dense, low-poly industrial spaceship galley kitchen in the grimy 1979 Nostromo style, with ribbed bulkheads, cabinets, stove, sink, pipes, screens, gauges, mugs, utensils, warning labels, and amber service lights.",
};

const VOID = "#111317";
const BLACK = "#191b1d";
const DEEP = "#24272a";
const RUBBER = "#303234";
const OLIVE = "#505448";
const OLIVE_DARK = "#363a35";
const CREAM = "#aaa995";
const BONE = "#c4bda5";
const ORANGE = "#c86b25";
const AMBER = "#f2a531";
const RED = "#a83b2d";
const GREEN = "#87a36d";
const BLUE = "#577b89";
const WHITE = "#d8d4bd";
const BRASS = "#a67a3c";
const STEEL = metal("iron", {
  tarnish: 0.72,
  verdigris: 0.08,
  polish: 0.18,
  size: 0.11,
  seed: 9,
});
const OLD_BRASS = metal("brass", {
  tarnish: 0.66,
  verdigris: 0.18,
  polish: 0.22,
  size: 0.08,
  seed: 12,
});
const COPPER = metal("copper", {
  tarnish: 0.46,
  verdigris: 0.24,
  polish: 0.25,
  size: 0.1,
  seed: 17,
});
const PANEL = panelled(STEEL, {
  size: 0.22,
  aspect: 0.72,
  rivets: 0.085,
  seam: "#252324",
});
const OLIVE_PANEL = panelled(OLIVE, {
  size: 0.28,
  aspect: 0.68,
  rivets: 0.11,
  seam: "#252825",
});
const COUNTER_TOP = paint((p, n) => {
  const grain = noise(p, 0.08, 44);
  const edge = smoothstep(-0.2, 0.7, n.y);
  return mix(
    mix("#55564e", "#777568", grain),
    "#8e8b76",
    edge * 0.28,
  );
});
const RUBBER_GRAIN = paint((p, n) => {
  const v = noise(p, 0.045, 61);
  const shade = 0.74 + 0.2 * v + Math.max(0, n.y) * 0.06;
  return [shade * 0.18, shade * 0.19, shade * 0.18];
});
const WALL_PAINT = paint((p, n) => {
  const v = noise(p, 0.34, 24);
  const top = smoothstep(-0.2, 0.8, n.y);
  return mix(
    mix("#3d413d", "#5a5b50", v),
    "#686858",
    top * 0.22,
  );
});

const cautionTexture = svg(
  `<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="48" fill="#d28a25"/>
    <path d="M-20 48L28 0M18 48L66 0M56 48L104 0M94 48L142 0M132 48L180 0M170 48L218 0M208 48L256 0" stroke="#171718" stroke-width="13"/>
    <rect x="18" y="8" width="204" height="32" rx="3" fill="#2a2520" stroke="#e0a440" stroke-width="2"/>
    <text x="120" y="30" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="17" fill="#f4bd52" letter-spacing="2">CAUTION</text>
  </svg>`,
  { size: 384 },
);

const nostromoTexture = svg(
  `<svg viewBox="0 0 320 72" xmlns="http://www.w3.org/2000/svg">
    <rect width="320" height="72" fill="#bab7a1"/>
    <rect x="5" y="5" width="310" height="62" fill="#303535" stroke="#d8d1b2" stroke-width="3"/>
    <path d="M18 18H302M18 54H302" stroke="#747b6c" stroke-width="2"/>
    <text x="160" y="39" text-anchor="middle" font-family="monospace" font-size="24" font-weight="bold" fill="#d4c9a4" letter-spacing="5">NOSTROMO</text>
    <text x="160" y="57" text-anchor="middle" font-family="monospace" font-size="9" fill="#d78638" letter-spacing="3">GALLEY / DECK 03</text>
  </svg>`,
  { size: 512 },
);

const screenTexture = svg(
  `<svg viewBox="0 0 256 160" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="160" fill="#0b1717"/>
    <rect x="8" y="8" width="240" height="144" fill="#142c2b" stroke="#668c77" stroke-width="4"/>
    <path d="M20 116H236M20 132H236M20 36H236M20 52H236" stroke="#284b42" stroke-width="2"/>
    <path d="M24 104L48 87L65 95L88 63L108 72L131 48L151 70L176 43L199 60L232 29" fill="none" stroke="#aecf83" stroke-width="4"/>
    <circle cx="48" cy="87" r="4" fill="#f4b049"/><circle cx="176" cy="43" r="4" fill="#f4b049"/>
    <text x="21" y="26" font-family="monospace" font-size="12" fill="#e1c879">GALLEY ENVIRONMENT</text>
    <text x="22" y="146" font-family="monospace" font-size="11" fill="#d8793e">TEMP 18.4 C   AIR 92%</text>
  </svg>`,
  { size: 384 },
);

const warningTexture = svg(
  `<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
    <rect width="96" height="96" fill="#2a2924"/>
    <path d="M48 10L88 82H8Z" fill="#d68b27" stroke="#171719" stroke-width="6"/>
    <path d="M48 29V57" stroke="#171719" stroke-width="8" stroke-linecap="round"/>
    <circle cx="48" cy="69" r="5" fill="#171719"/>
  </svg>`,
  { size: 192 },
);

const galleyTexture = svg(
  `<svg viewBox="0 0 256 80" xmlns="http://www.w3.org/2000/svg">
    <rect width="256" height="80" fill="#41453f"/>
    <path d="M10 12H246M10 68H246" stroke="#8e927b" stroke-width="3"/>
    <path d="M25 24H231M25 56H231" stroke="#202323" stroke-width="2"/>
    <text x="128" y="50" text-anchor="middle" font-family="monospace" font-size="21" font-weight="bold" fill="#d0c59f" letter-spacing="4">SERVICE GALLEY</text>
  </svg>`,
  { size: 384 },
);

const tinyReadout = svg(
  `<svg viewBox="0 0 160 48" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="48" fill="#121817" stroke="#9e9a78" stroke-width="3"/>
    <rect x="12" y="12" width="52" height="24" fill="#bb542d"/>
    <rect x="72" y="12" width="18" height="24" fill="#91ad72"/>
    <rect x="96" y="12" width="52" height="24" fill="#3c756e"/>
    <text x="38" y="29" text-anchor="middle" font-family="monospace" font-size="12" fill="#f2d399">HOT</text>
    <text x="121" y="29" text-anchor="middle" font-family="monospace" font-size="11" fill="#c1e1a2">OK</text>
  </svg>`,
  { size: 320 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  name: string,
  size: [number, number, number],
  at: [number, number, number],
  color: any = STEEL,
  options: any = {},
) {
  return b.part(new THREE.BoxGeometry(...size), color, {
    at,
    flat: true,
    name,
    group: "galley",
    ...options,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  name: string,
  radius: number,
  height: number,
  at: [number, number, number],
  color: any,
  segments = 12,
  dir: [number, number, number] = [0, 1, 0],
  options: any = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, segments, 1),
    color,
    {
      at,
      dir,
      flat: true,
      name,
      group: "galley",
      ...options,
    },
  );
}

function cone(
  b: ReturnType<typeof createBuilder>,
  name: string,
  r0: number,
  r1: number,
  height: number,
  at: [number, number, number],
  color: any,
  segments = 10,
  options: any = {},
) {
  return b.part(
    new THREE.ConeGeometry(r0, height, segments, 1),
    color,
    { at, flat: true, name, group: "galley", ...options },
  );
}

function rod(
  b: ReturnType<typeof createBuilder>,
  name: string,
  a: [number, number, number],
  c: [number, number, number],
  radius: number,
  color: any = STEEL,
  options: any = {},
) {
  return b.rod(a, c, radius, color, {
    name,
    group: "galley",
    section: { ngon: 8 },
    ...options,
  });
}

function label(
  b: ReturnType<typeof createBuilder>,
  name: string,
  texture: THREE.Texture,
  size: [number, number],
  at: [number, number, number],
  color = "#ffffff",
) {
  return b.part(new THREE.PlaneGeometry(size[0], size[1]), color, {
    at,
    dir: [0, 0, 1],
    axis: "z",
    texture,
    name,
    group: "labels",
  });
}

function bolt(
  b: ReturnType<typeof createBuilder>,
  name: string,
  at: [number, number, number],
  radius = 0.018,
  color: any = OLD_BRASS,
) {
  return cylinder(b, name, radius, 0.018, at, color, 8, [0, 0, 1]);
}

function handle(
  b: ReturnType<typeof createBuilder>,
  name: string,
  x: number,
  y: number,
  z: number,
  width = 0.2,
  color: any = OLD_BRASS,
) {
  box(b, `${name}_mountL`, [0.025, 0.045, 0.028], [x - width * 0.5, y, z], color);
  box(b, `${name}_mountR`, [0.025, 0.045, 0.028], [x + width * 0.5, y, z], color);
  rod(
    b,
    `${name}_bar`,
    [x - width * 0.5, y, z + 0.01],
    [x + width * 0.5, y, z + 0.01],
    0.014,
    color,
  );
}

function vent(
  b: ReturnType<typeof createBuilder>,
  name: string,
  x: number,
  y: number,
  z: number,
  width: number,
  count: number,
  color: any = BLACK,
) {
  for (let i = 0; i < count; i++) {
    const xx = x - width * 0.5 + (i + 0.5) * (width / count);
    box(
      b,
      `${name}_${i}`,
      [0.018, 0.11, 0.025],
      [xx, y, z],
      color,
      { rotation: [0, 0, -18] },
    );
  }
}

function mug(
  b: ReturnType<typeof createBuilder>,
  name: string,
  at: [number, number, number],
  bodyColor: any,
) {
  cylinder(b, `${name}_body`, 0.075, 0.145, at, bodyColor, 10);
  cylinder(
    b,
    `${name}_rim`,
    0.077,
    0.012,
    [at[0], at[1] + 0.073, at[2]],
    BONE,
    10,
  );
  b.part(
    new THREE.TorusGeometry(0.047, 0.012, 6, 10),
    bodyColor,
    {
      at: [at[0] + 0.075, at[1] + 0.005, at[2]],
      rotation: [0, 90, 0],
      flat: true,
      name: `${name}_handle`,
      group: "galley",
    },
  );
  cylinder(
    b,
    `${name}_coffee`,
    0.055,
    0.006,
    [at[0], at[1] + 0.083, at[2]],
    "#171514",
    10,
  );
}

function canister(
  b: ReturnType<typeof createBuilder>,
  name: string,
  at: [number, number, number],
  radius: number,
  height: number,
  color: any,
) {
  cylinder(b, `${name}_body`, radius, height, at, color, 10);
  cylinder(
    b,
    `${name}_top`,
    radius * 0.9,
    0.026,
    [at[0], at[1] + height * 0.5 + 0.014, at[2]],
    OLD_BRASS,
    10,
  );
  cylinder(
    b,
    `${name}_foot`,
    radius * 0.92,
    0.022,
    [at[0], at[1] - height * 0.5 - 0.012, at[2]],
    RUBBER,
    10,
  );
  box(
    b,
    `${name}_stripe`,
    [radius * 1.82, 0.035, 0.008],
    [at[0], at[1] + 0.005, at[2] + radius * 0.93],
    ORANGE,
  );
}

export default function build() {
  const b = createBuilder({
    name: "nostromo-galley-kitchen",
    detail: 1,
    paintSize: 1024,
  });

  // -------------------------------------------------------------------------------------------------------------
  // Floor, ceiling, rear bulkhead, and the heavy ship architecture.

  box(b, "floor_deck", [3.35, 0.12, 2.18], [0, 0.06, 0], RUBBER_GRAIN);
  box(b, "floor_front_threshold", [3.18, 0.09, 0.16], [0, 0.13, 0.98], STEEL);
  box(b, "floor_back_threshold", [3.18, 0.09, 0.14], [0, 0.13, -0.92], STEEL);
  box(b, "rear_bulkhead", [3.34, 2.32, 0.16], [0, 1.28, -0.94], WALL_PAINT);
  box(b, "ceiling_panel", [3.3, 0.13, 2.05], [0, 2.38, 0], PANEL);

  box(b, "left_arch_pillar", [0.18, 2.28, 0.34], [-1.57, 1.27, -0.63], STEEL);
  box(b, "right_arch_pillar", [0.18, 2.28, 0.34], [1.57, 1.27, -0.63], STEEL);
  box(b, "left_front_rib", [0.14, 2.16, 0.22], [-1.47, 1.2, 0.34], OLIVE_DARK);
  box(b, "right_front_rib", [0.14, 2.16, 0.22], [1.47, 1.2, 0.34], OLIVE_DARK);
  box(b, "top_crossbeam", [3.12, 0.18, 0.29], [0, 2.16, -0.7], STEEL);
  box(b, "bottom_service_beam", [3.08, 0.15, 0.22], [0, 0.29, -0.76], STEEL);

  for (const x of [-1.28, -0.78, -0.27, 0.27, 0.78, 1.28]) {
    box(b, `rear_vertical_seam_${x}`, [0.045, 1.96, 0.045], [x, 1.3, -0.835], OLIVE_DARK);
    bolt(b, `rear_bolt_top_${x}`, [x, 2.12, -0.79], 0.016);
    bolt(b, `rear_bolt_bottom_${x}`, [x, 0.42, -0.79], 0.016);
  }

  // Large horizontal ribs give the rear wall the unmistakable spacecraft-galley rhythm.
  for (let i = 0; i < 5; i++) {
    const y = 0.54 + i * 0.31;
    box(b, `rear_rib_${i}`, [3.02, 0.045, 0.075], [0, y, -0.79], STEEL);
    for (const x of [-1.35, -0.7, 0, 0.7, 1.35]) {
      bolt(b, `rear_rib_bolt_${i}_${x}`, [x, y + 0.01, -0.73], 0.012);
    }
  }

  label(b, "nostromo_plaque", nostromoTexture, [0.92, 0.207], [-1.03, 2.08, -0.69]);
  label(b, "galley_plaque", galleyTexture, [0.82, 0.256], [0.92, 2.08, -0.69]);

  // -------------------------------------------------------------------------------------------------------------
  // Lower counter run, toe-kick, and cabinet carcasses.

  box(b, "counter_carcase", [2.92, 0.62, 0.62], [0, 0.69, -0.49], OLIVE_PANEL);
  box(b, "counter_top", [3.02, 0.12, 0.72], [0, 1.055, -0.44], COUNTER_TOP);
  box(b, "counter_front_lip", [3.04, 0.09, 0.09], [0, 0.92, -0.07], STEEL);
  box(b, "counter_toe_kick", [2.87, 0.13, 0.12], [0, 0.36, -0.12], RUBBER);
  box(b, "left_end_cap", [0.16, 0.7, 0.75], [-1.48, 0.69, -0.46], STEEL);
  box(b, "right_end_cap", [0.16, 0.7, 0.75], [1.48, 0.69, -0.46], STEEL);

  const lowerDoors = [
    { x: -1.14, w: 0.62, name: "lower_left" },
    { x: -0.42, w: 0.65, name: "lower_mid_left" },
    { x: 0.35, w: 0.66, name: "lower_mid_right" },
    { x: 1.1, w: 0.56, name: "lower_right" },
  ];
  for (const d of lowerDoors) {
    box(
      b,
      `${d.name}_door`,
      [d.w, 0.48, 0.055],
      [d.x, 0.68, -0.078],
      OLIVE_DARK,
    );
    box(
      b,
      `${d.name}_inset`,
      [d.w - 0.09, 0.39, 0.014],
      [d.x, 0.68, -0.111],
      PANEL,
    );
    handle(b, `${d.name}_handle`, d.x, 0.69, -0.14, d.w * 0.38);
    bolt(b, `${d.name}_boltL`, [d.x - d.w * 0.42, 0.88, -0.125], 0.012);
    bolt(b, `${d.name}_boltR`, [d.x + d.w * 0.42, 0.88, -0.125], 0.012);
  }

  // A narrow drawer bank beneath the prep surface.
  for (let i = 0; i < 3; i++) {
    const y = 0.83 - i * 0.13;
    box(b, `drawer_${i}`, [0.52, 0.095, 0.045], [-0.07, y, -0.13], STEEL);
    handle(b, `drawer_handle_${i}`, -0.07, y, -0.16, 0.18, OLD_BRASS);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Upper storage lockers and their inset doors.

  box(b, "upper_storage_shell", [2.93, 0.75, 0.33], [0, 1.78, -0.78], OLIVE_PANEL);
  const upper = [
    { x: -1.09, w: 0.78, h: 0.58 },
    { x: -0.18, w: 0.82, h: 0.58 },
    { x: 0.76, w: 0.82, h: 0.58 },
    { x: 1.26, w: 0.22, h: 0.58 },
  ];
  for (let i = 0; i < upper.length; i++) {
    const d = upper[i];
    box(
      b,
      `upper_door_${i}`,
      [d.w, d.h, 0.052],
      [d.x, 1.78, -0.585],
      i === 1 ? CREAM : OLIVE_DARK,
    );
    box(
      b,
      `upper_door_inset_${i}`,
      [Math.max(0.1, d.w - 0.1), d.h - 0.11, 0.012],
      [d.x, 1.78, -0.619],
      PANEL,
    );
    handle(b, `upper_handle_${i}`, d.x, 1.78, -0.655, Math.min(0.3, d.w * 0.52));
    bolt(b, `upper_bolt_a_${i}`, [d.x - d.w * 0.4, 2.03, -0.65], 0.012);
    bolt(b, `upper_bolt_b_${i}`, [d.x + d.w * 0.4, 2.03, -0.65], 0.012);
  }
  box(b, "upper_under_shelf", [2.98, 0.08, 0.37], [0, 1.35, -0.72], STEEL);
  vent(b, "upper_under_vents", 0.14, 1.38, -0.535, 0.86, 9, BLACK);

  // -------------------------------------------------------------------------------------------------------------
  // Left cooking block: range, hotplate, knobs, and overhead extractor.

  box(b, "range_face", [0.94, 0.46, 0.08], [-0.82, 1.13, -0.09], BLACK);
  box(b, "range_top_plate", [0.98, 0.075, 0.6], [-0.82, 1.12, -0.42], STEEL);
  box(b, "range_back_guard", [0.98, 0.19, 0.07], [-0.82, 1.22, -0.69], OLIVE_DARK);

  for (let i = 0; i < 3; i++) {
    const x = -1.12 + i * 0.3;
    cylinder(b, `burner_${i}`, 0.105, 0.024, [x, 1.17, -0.42], RUBBER, 12);
    cylinder(b, `burner_cap_${i}`, 0.052, 0.031, [x, 1.19, -0.42], OLD_BRASS, 10);
    b.part(
      new THREE.TorusGeometry(0.087, 0.012, 5, 12),
      STEEL,
      {
        at: [x, 1.2, -0.42],
        rotation: [0, 0, 0],
        name: `burner_ring_${i}`,
        group: "galley",
      },
    );
  }

  for (let i = 0; i < 4; i++) {
    const x = -1.13 + i * 0.21;
    cylinder(b, `range_knob_${i}`, 0.035, 0.038, [x, 1.09, -0.15], OLD_BRASS, 8, [0, 0, 1]);
    box(b, `range_knob_mark_${i}`, [0.008, 0.028, 0.007], [x, 1.125, -0.18], WHITE);
  }
  box(b, "range_status_strip", [0.52, 0.04, 0.012], [-0.82, 1.29, -0.17], ORANGE);
  label(b, "range_hot_label", tinyReadout, [0.3, 0.09], [-0.82, 1.39, -0.55]);

  // Extractor hood made as a broad industrial stepped assembly.
  box(b, "hood_upper", [1.2, 0.16, 0.38], [-0.82, 2.08, -0.55], STEEL);
  box(b, "hood_lower", [1.3, 0.14, 0.68], [-0.82, 1.93, -0.42], OLIVE_DARK);
  box(b, "hood_front_lip", [1.37, 0.1, 0.09], [-0.82, 1.84, -0.07], STEEL);
  vent(b, "hood_vents", -0.82, 1.92, -0.055, 0.96, 11, BLACK);
  for (const x of [-1.34, -0.3]) {
    box(b, `hood_side_${x}`, [0.09, 0.3, 0.57], [x, 1.98, -0.38], PANEL);
  }
  rod(b, "hood_pipe_left", [-1.25, 2.15, -0.68], [-1.25, 2.3, -0.68], 0.035, COPPER);
  rod(b, "hood_pipe_right", [-0.39, 2.15, -0.68], [-0.39, 2.3, -0.68], 0.035, COPPER);

  // -------------------------------------------------------------------------------------------------------------
  // Sink, faucet, drain, soap, and dish rack.

  box(b, "sink_basin", [0.73, 0.11, 0.48], [0.69, 1.13, -0.42], BLACK);
  box(b, "sink_rim_front", [0.8, 0.045, 0.06], [0.69, 1.21, -0.15], OLD_BRASS);
  box(b, "sink_rim_back", [0.8, 0.045, 0.06], [0.69, 1.21, -0.69], OLD_BRASS);
  box(b, "sink_rim_left", [0.05, 0.045, 0.49], [0.3, 1.21, -0.42], OLD_BRASS);
  box(b, "sink_rim_right", [0.05, 0.045, 0.49], [1.08, 1.21, -0.42], OLD_BRASS);
  cylinder(b, "sink_drain", 0.095, 0.018, [0.69, 1.205, -0.42], STEEL, 12);
  cylinder(b, "sink_drain_inner", 0.048, 0.021, [0.69, 1.218, -0.42], BLACK, 10);

  rod(b, "faucet_post", [0.92, 1.19, -0.63], [0.92, 1.53, -0.63], 0.025, OLD_BRASS);
  rod(b, "faucet_arm_a", [0.92, 1.53, -0.63], [0.92, 1.6, -0.5], 0.024, OLD_BRASS);
  rod(b, "faucet_arm_b", [0.92, 1.6, -0.5], [0.69, 1.6, -0.5], 0.024, OLD_BRASS);
  rod(b, "faucet_drop", [0.69, 1.6, -0.5], [0.69, 1.25, -0.5], 0.02, OLD_BRASS);
  cylinder(b, "faucet_handle", 0.035, 0.08, [0.82, 1.29, -0.63], OLD_BRASS, 8, [1, 0, 0]);

  canister(b, "soap_dispenser", [1.19, 1.36, -0.57], 0.045, 0.17, BONE);
  rod(b, "soap_spout", [1.19, 1.46, -0.57], [1.28, 1.46, -0.57], 0.012, OLD_BRASS);

  box(b, "dish_rack_back", [0.67, 0.38, 0.035], [0.72, 1.55, -0.67], STEEL);
  for (let i = 0; i < 7; i++) {
    const x = 0.44 + i * 0.09;
    rod(b, `dish_rack_rail_${i}`, [x, 1.34, -0.57], [x, 1.78, -0.57], 0.009, OLD_BRASS);
  }
  rod(b, "dish_rack_bottom", [0.4, 1.34, -0.57], [1.03, 1.34, -0.57], 0.014, OLD_BRASS);

  // -------------------------------------------------------------------------------------------------------------
  // Central service console, monitor, gauges, and switch bank.

  box(b, "console_panel", [0.72, 0.62, 0.09], [0, 1.59, -0.57], STEEL);
  box(b, "console_bezel", [0.55, 0.39, 0.035], [0, 1.61, -0.625], BLACK);
  const screen = label(b, "green_monitor", screenTexture, [0.46, 0.288], [0, 1.61, -0.65]);
  glow(screen, 0.65);
  box(b, "console_lower_shelf", [0.79, 0.08, 0.26], [0, 1.26, -0.52], OLIVE_DARK);

  for (let i = 0; i < 5; i++) {
    const x = -0.27 + i * 0.135;
    box(b, `console_switch_guard_${i}`, [0.09, 0.11, 0.04], [x, 1.22, -0.67], BLACK);
    cylinder(
      b,
      `console_switch_${i}`,
      0.018,
      0.06,
      [x, 1.24, -0.7],
      i === 2 ? RED : AMBER,
      8,
      [0, 0, 1],
    );
  }

  for (let i = 0; i < 3; i++) {
    const x = -0.28 + i * 0.28;
    cylinder(b, `console_dial_${i}`, 0.065, 0.028, [x, 1.92, -0.65], RUBBER, 12, [0, 0, 1]);
    cylinder(b, `console_dial_cap_${i}`, 0.044, 0.034, [x, 1.92, -0.672], OLD_BRASS, 10, [0, 0, 1]);
    box(b, `console_dial_tick_${i}`, [0.008, 0.035, 0.01], [x, 1.945, -0.695], WHITE);
  }

  label(b, "console_warning", warningTexture, [0.13, 0.13], [0.46, 1.91, -0.675]);
  box(b, "console_right_box", [0.28, 0.44, 0.12], [0.59, 1.63, -0.58], OLIVE_DARK);
  vent(b, "console_right_vent", 0.59, 1.64, -0.65, 0.16, 4, BLACK);

  // -------------------------------------------------------------------------------------------------------------
  // Prep area details: kettle, mugs, trays, cans, and an alienly over-engineered food warmer.

  box(b, "prep_tray", [0.56, 0.025, 0.36], [0.08, 1.13, -0.24], OLD_BRASS);
  box(b, "prep_tray_inner", [0.47, 0.012, 0.27], [0.08, 1.15, -0.24], BLACK);
  mug(b, "mug_left", [-0.06, 1.25, -0.31], BONE);
  mug(b, "mug_right", [0.19, 1.25, -0.31], OLIVE_DARK);

  canister(b, "canister_a", [-0.27, 1.3, -0.5], 0.055, 0.21, BONE);
  canister(b, "canister_b", [-0.1, 1.3, -0.5], 0.052, 0.18, OLIVE_DARK);
  canister(b, "canister_c", [0.08, 1.3, -0.5], 0.046, 0.16, ORANGE);

  // Low-poly kettle with a turned profile and separate lid.
  b.lathe(
    [
      [0, -0.16],
      [0.09, -0.16],
      [0.12, -0.1],
      [0.13, 0.05],
      [0.1, 0.14],
      [0.055, 0.18],
      [0, 0.18],
    ],
    {
      at: [0.28, 1.34, -0.39],
      axis: [0, 1, 0],
      segments: 10,
      smoothing: 0,
      color: STEEL,
      name: "kettle_body",
      group: "galley",
    },
  );
  cylinder(b, "kettle_lid", 0.07, 0.025, [0.28, 1.545, -0.39], OLD_BRASS, 10);
  cylinder(b, "kettle_lid_button", 0.024, 0.035, [0.28, 1.58, -0.39], RUBBER, 8);
  rod(b, "kettle_handle_a", [0.16, 1.45, -0.39], [0.13, 1.62, -0.39], 0.016, OLD_BRASS);
  rod(b, "kettle_handle_b", [0.13, 1.62, -0.39], [0.38, 1.62, -0.39], 0.016, OLD_BRASS);
  rod(b, "kettle_handle_c", [0.38, 1.62, -0.39], [0.4, 1.46, -0.39], 0.016, OLD_BRASS);
  rod(b, "kettle_spout_a", [0.4, 1.44, -0.39], [0.52, 1.53, -0.39], 0.022, STEEL);
  rod(b, "kettle_spout_b", [0.52, 1.53, -0.39], [0.57, 1.63, -0.39], 0.018, STEEL);

  // Food warmer / toaster on the right end of the counter.
  box(b, "warmer_body", [0.42, 0.31, 0.38], [1.18, 1.29, -0.39], STEEL);
  box(b, "warmer_front", [0.34, 0.19, 0.035], [1.18, 1.3, -0.195], BLACK);
  for (let i = 0; i < 3; i++) {
    box(b, `warmer_slot_${i}`, [0.07, 0.025, 0.02], [1.04 + i * 0.14, 1.36, -0.22], AMBER);
  }
  cylinder(b, "warmer_dial", 0.045, 0.025, [1.29, 1.38, -0.22], OLD_BRASS, 10, [0, 0, 1]);
  label(b, "warmer_status", tinyReadout, [0.22, 0.066], [1.17, 1.2, -0.22]);

  // -------------------------------------------------------------------------------------------------------------
  // Hanging utensils and the dense overhead service line.

  box(b, "utensil_rail", [0.92, 0.045, 0.05], [0.35, 1.93, -0.42], OLD_BRASS);
  for (let i = 0; i < 5; i++) {
    const x = 0.02 + i * 0.165;
    rod(b, `utensil_hook_${i}`, [x, 1.9, -0.42], [x, 1.73, -0.42], 0.009, OLD_BRASS);
  }
  rod(b, "utensil_spoon", [0.02, 1.72, -0.42], [0.02, 1.42, -0.42], 0.011, STEEL);
  b.part(
    new THREE.SphereGeometry(0.058, 8, 5),
    STEEL,
    { at: [0.02, 1.39, -0.42], name: "utensil_spoon_bowl", group: "galley" },
  );
  rod(b, "utensil_ladle", [0.18, 1.72, -0.42], [0.18, 1.49, -0.42], 0.011, STEEL);
  b.part(
    new THREE.TorusGeometry(0.06, 0.012, 5, 10),
    STEEL,
    {
      at: [0.18, 1.44, -0.42],
      rotation: [90, 0, 0],
      name: "utensil_ladle_bowl",
      group: "galley",
    },
  );
  rod(b, "utensil_tongs_a", [0.35, 1.72, -0.42], [0.32, 1.43, -0.42], 0.009, STEEL);
  rod(b, "utensil_tongs_b", [0.39, 1.72, -0.42], [0.42, 1.43, -0.42], 0.009, STEEL);

  // Ceiling trunking.
  box(b, "ceiling_trunk_left", [0.22, 0.15, 1.7], [-1.22, 2.25, -0.18], STEEL);
  box(b, "ceiling_trunk_right", [0.16, 0.12, 1.5], [1.22, 2.25, -0.2], OLIVE_DARK);
  rod(b, "ceiling_cable_a", [-1.05, 2.27, 0.5], [-0.53, 2.27, 0.5], 0.025, COPPER);
  rod(b, "ceiling_cable_b", [-0.48, 2.27, 0.5], [0.1, 2.27, 0.5], 0.018, RUBBER);
  rod(b, "ceiling_cable_c", [0.2, 2.27, 0.5], [0.78, 2.27, 0.5], 0.026, COPPER);
  for (let i = 0; i < 7; i++) {
    const x = -1.05 + i * 0.31;
    cylinder(b, `ceiling_cable_clip_${i}`, 0.035, 0.045, [x, 2.27, 0.5], OLD_BRASS, 8);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Side racks, service tubes, and visual clutter.

  box(b, "left_side_rack", [0.29, 1.24, 0.12], [-1.29, 1.08, -0.42], STEEL);
  box(b, "left_side_rack_top", [0.34, 0.07, 0.2], [-1.29, 1.72, -0.42], OLD_BRASS);
  for (let i = 0; i < 5; i++) {
    const y = 0.56 + i * 0.23;
    rod(b, `left_rack_shelf_${i}`, [-1.43, y, -0.47], [-1.15, y, -0.47], 0.012, OLD_BRASS);
  }
  for (let i = 0; i < 4; i++) {
    canister(b, `left_rack_can_${i}`, [-1.35 + (i % 2) * 0.12, 0.71 + Math.floor(i / 2) * 0.25, -0.5], 0.035, 0.12, i % 2 ? OLIVE_DARK : BONE);
  }

  box(b, "right_service_box", [0.39, 0.71, 0.15], [1.27, 1.18, -0.68], PANEL);
  vent(b, "right_service_vent", 1.27, 1.18, -0.585, 0.27, 7, BLACK);
  box(b, "right_service_latch", [0.08, 0.14, 0.035], [1.12, 1.18, -0.575], OLD_BRASS);
  rod(b, "right_service_pipe_vertical", [1.42, 0.34, -0.72], [1.42, 1.84, -0.72], 0.035, COPPER);
  rod(b, "right_service_pipe_top", [1.42, 1.84, -0.72], [1.06, 1.84, -0.72], 0.035, COPPER);
  rod(b, "right_service_pipe_elbow", [1.06, 1.84, -0.72], [1.06, 2.12, -0.72], 0.025, COPPER);
  for (const y of [0.56, 1.02, 1.52, 1.95]) {
    box(b, `pipe_clamp_${y}`, [0.1, 0.055, 0.08], [1.42, y, -0.72], OLD_BRASS);
  }

  // Two little amber service lamps under the cabinets.
  for (const x of [-1.38, 1.37]) {
    cylinder(b, `service_lamp_housing_${x}`, 0.064, 0.075, [x, 1.39, -0.52], BLACK, 10, [0, 0, 1]);
    const lamp = cylinder(
      b,
      `service_lamp_${x}`,
      0.043,
      0.018,
      [x, 1.39, -0.565],
      AMBER,
      10,
      [0, 0, 1],
    );
    glow(lamp, 1.8);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Front-facing safety placards and small tactile hardware.

  label(b, "caution_strip_left", cautionTexture, [0.58, 0.116], [-1.2, 0.45, 0.0]);
  label(b, "caution_strip_right", cautionTexture, [0.58, 0.116], [1.2, 0.45, 0.0]);
  label(b, "warning_placard", warningTexture, [0.16, 0.16], [-1.47, 1.7, -0.43]);
  label(b, "service_placard", galleyTexture, [0.54, 0.169], [0.9, 0.42, -0.02]);

  // Bolted plates on the front architecture.
  for (let i = 0; i < 6; i++) {
    const x = -1.35 + i * 0.54;
    bolt(b, `front_floor_bolt_${i}_a`, [x, 0.2, 0.2], 0.014);
    bolt(b, `front_floor_bolt_${i}_b`, [x, 0.2, -0.92], 0.014);
  }

  // A few chunky, readable alien-industrial handles at the side posts.
  handle(b, "left_arch_handle", -1.47, 1.17, -0.42, 0.22, OLD_BRASS);
  handle(b, "right_arch_handle", 1.47, 1.17, -0.42, 0.22, OLD_BRASS);

  // Small exposed fasteners and a cable junction box finish the silhouette.
  box(b, "junction_box", [0.28, 0.24, 0.18], [-1.4, 2.03, -0.69], OLIVE_DARK);
  for (const y of [1.96, 2.1]) {
    bolt(b, `junction_bolt_l_${y}`, [-1.5, y, -0.58], 0.013);
    bolt(b, `junction_bolt_r_${y}`, [-1.3, y, -0.58], 0.013);
  }
  rod(b, "junction_wire", [-1.25, 2.0, -0.58], [-1.02, 1.78, -0.58], 0.013, RUBBER);
  rod(b, "junction_wire_2", [-1.02, 1.78, -0.58], [-0.98, 1.53, -0.58], 0.013, RUBBER);

  // Return the builder's root object exactly as required by the lab.
  return b.root;
}
```