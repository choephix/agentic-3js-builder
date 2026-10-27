import * as THREE from "three";
import { createBuilder, mottle, paint, svg } from "../../../../src/index";

export const meta = {
  name: "Brutalist Housing Block",
  description:
    "A raw-concrete brutalist social housing megastructure with stepped massing, deep balconies, recessed windows, pilotis, rooftop plant, tanks, vents, and weathered facade details.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = mottle("#77736c", "#9b968d", {
    size: 0.42,
    contrast: 1.2,
    seed: 19,
  });
  const DARK_CONCRETE = mottle("#514f4b", "#716e68", {
    size: 0.28,
    contrast: 1.4,
    seed: 23,
  });
  const LIGHT_CONCRETE = mottle("#9d9991", "#c0bbb0", {
    size: 0.55,
    contrast: 0.9,
    seed: 31,
  });
  const WINDOW = "#161b1c";
  const WINDOW_REFLECT = "#293438";
  const SHADOW = "#292b2a";
  const METAL = "#555b59";
  const RUST = "#714b36";
  const WARNING = "#bd763d";
  const FLOOR = "#313230";

  const graffiti = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 80">
      <path d="M8 65 L20 12 L31 65 M13 45 L28 45 M42 63 L42 16 L61 16 Q76 17 76 31 Q75 45 43 43 M88 64 L88 16 L112 16 Q130 18 130 31 Q129 43 89 43 M106 43 L132 64 M144 16 L144 64"
        fill="none" stroke="#151718" stroke-width="7" stroke-linecap="square" stroke-linejoin="miter"/>
      <path d="M9 70 H151" stroke="#a95432" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    name?: string,
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      name,
      flat: true,
    });

  const cylinder = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    radial = 8,
    name?: string,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      name,
      flat: true,
    });

  const rod = (
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any = METAL,
    name?: string,
  ) => b.rod(a, c, radius, { color, name, caps: "flat" });

  // Broad foundation and shadowed undercroft.
  box([4.55, 0.16, 2.45], [0, 0.08, 0], DARK_CONCRETE, "foundation");
  box([4.15, 0.34, 2.05], [0, 0.30, 0], CONCRETE, "plinth");
  box([3.72, 0.18, 1.78], [0, 0.56, 0], LIGHT_CONCRETE, "entry_slab");

  // Main brutalist slab: heavy, monolithic, slightly overhanging.
  box([3.56, 4.72, 1.42], [0, 2.83, 0], CONCRETE, "main_slab");
  box([3.82, 0.18, 1.62], [0, 0.72, 0], LIGHT_CONCRETE, "lower_belt");
  box([3.84, 0.16, 1.64], [0, 5.22, 0], LIGHT_CONCRETE, "roof_cap");
  box([3.98, 0.10, 1.72], [0, 5.34, 0], DARK_CONCRETE, "roof_shadow_joint");

  // Side end walls and projecting vertical megacolumns.
  for (const s of [-1, 1]) {
    box([0.24, 4.85, 1.64], [s * 1.78, 2.86, 0], DARK_CONCRETE, `end_wall_${s}`);
    box([0.18, 5.00, 1.80], [s * 1.96, 2.86, 0], CONCRETE, `end_pier_${s}`);
  }
  for (const x of [-1.42, -0.48, 0.48, 1.42]) {
    box([0.13, 4.58, 0.15], [x, 2.93, 0.77], LIGHT_CONCRETE, "front_vertical_joint");
  }

  // Floors expressed as projecting horizontal bands.
  for (let floor = 0; floor < 10; floor++) {
    const y = 0.83 + floor * 0.46;
    box([3.82, 0.075, 1.58], [0, y, 0], LIGHT_CONCRETE, `floor_band_${floor}`);
    box([3.68, 0.035, 0.06], [0, y - 0.045, 0.82], SHADOW, `drip_shadow_${floor}`);
  }

  // Deep recessed front window bays. Each opening gets a black recess,
  // a blue-gray glass pane, mullions, and a concrete sill.
  for (let floor = 0; floor < 10; floor++) {
    const y = 0.98 + floor * 0.46;
    for (const x of [-1.30, -0.43, 0.43, 1.30]) {
      box([0.62, 0.27, 0.045], [x, y, 0.735], WINDOW, `recess_${floor}_${x}`);
      box([0.53, 0.19, 0.018], [x, y + 0.01, 0.762], WINDOW_REFLECT, `glass_${floor}_${x}`);
      box([0.035, 0.23, 0.035], [x, y, 0.785], METAL, `mullion_${floor}_${x}`);
      box([0.70, 0.045, 0.13], [x, y - 0.17, 0.77], LIGHT_CONCRETE, `sill_${floor}_${x}`);
    }
  }

  // Alternating deep balcony stacks, characteristic cantilevered concrete.
  for (let floor = 1; floor < 10; floor += 2) {
    const y = 0.76 + floor * 0.46;
    const x = floor % 4 === 1 ? 1.03 : -1.03;
    box([1.38, 0.10, 0.62], [x, y, 1.03], LIGHT_CONCRETE, `balcony_slab_${floor}`);
    box([1.38, 0.10, 0.08], [x, y + 0.23, 1.30], DARK_CONCRETE, `balcony_lip_${floor}`);
    box([0.10, 0.38, 0.10], [x - 0.58, y + 0.17, 1.30], CONCRETE, `balcony_side_a_${floor}`);
    box([0.10, 0.38, 0.10], [x + 0.58, y + 0.17, 1.30], CONCRETE, `balcony_side_b_${floor}`);

    for (const dx of [-0.48, -0.16, 0.16, 0.48]) {
      rod([x + dx, y + 0.07, 1.34], [x + dx, y + 0.38, 1.34], 0.018, METAL, `rail_post_${floor}`);
    }
    rod([x - 0.62, y + 0.38, 1.34], [x + 0.62, y + 0.38, 1.34], 0.026, METAL, `rail_top_${floor}`);
  }

  // The oversized central entrance, recessed beneath a heavy lintel.
  box([1.12, 0.10, 0.18], [0, 0.75, 0.76], LIGHT_CONCRETE, "entrance_lintel");
  box([1.18, 0.72, 0.08], [0, 1.07, 0.71], SHADOW, "entrance_void");
  box([0.49, 0.58, 0.025], [-0.27, 1.04, 0.765], "#202b2b", "entry_glass_left");
  box([0.49, 0.58, 0.025], [0.27, 1.04, 0.765], "#202b2b", "entry_glass_right");
  box([0.035, 0.63, 0.04], [0, 1.04, 0.79], METAL, "entry_mullion");
  box([1.38, 0.08, 0.12], [0, 0.71, 0.88], LIGHT_CONCRETE, "entry_threshold");

  // Pilotis and parking-like undercroft voids at the side of the entrance.
  for (const x of [-1.43, -0.86, 0.86, 1.43]) {
    box([0.22, 0.88, 0.28], [x, 0.94, 0.10], DARK_CONCRETE, "pilotis");
    box([0.30, 0.10, 0.38], [x, 1.39, 0.10], LIGHT_CONCRETE, "pilot_cap");
  }
  for (const x of [-1.35, -0.68, 0.68, 1.35]) {
    box([0.48, 0.035, 0.025], [x, 0.74, 0.87], "#0d1110", "undercroft_slit");
  }

  // Side facade: narrow horizontal service windows and brutal stair slots.
  for (const s of [-1, 1]) {
    for (let floor = 0; floor < 9; floor++) {
      const y = 1.02 + floor * 0.46;
      box([0.035, 0.18, 0.52], [s * 1.815, y, -0.23], WINDOW, `side_window_${s}_${floor}`);
      box([0.025, 0.09, 0.38], [s * 1.84, y, -0.23], WINDOW_REFLECT, `side_glass_${s}_${floor}`);
    }
    box([0.035, 3.50, 0.58], [s * 1.835, 2.78, 0.38], SHADOW, `stair_slot_${s}`);
    for (let i = 0; i < 9; i++) {
      box([0.04, 0.025, 0.60], [s * 1.86, 1.16 + i * 0.40, 0.38], LIGHT_CONCRETE, `stair_rung_${s}_${i}`);
    }
  }

  // Rooftop service penthouse, deliberately asymmetrical.
  box([1.62, 0.58, 1.02], [-0.56, 5.68, 0.03], DARK_CONCRETE, "roof_penthouse");
  box([1.78, 0.10, 1.16], [-0.56, 5.99, 0.03], LIGHT_CONCRETE, "penthouse_cap");
  box([0.72, 0.22, 0.03], [-0.56, 5.76, 0.56], WINDOW, "penthouse_glazing");
  box([0.05, 0.28, 0.06], [-0.88, 5.77, 0.60], METAL, "penthouse_mullion");
  box([0.05, 0.28, 0.06], [-0.24, 5.77, 0.60], METAL, "penthouse_mullion_b");

  // Roof tanks, vents, parapet blocks, and utility clutter.
  box([0.48, 0.24, 0.46], [0.62, 5.52, -0.30], CONCRETE, "roof_utility_box");
  box([0.58, 0.12, 0.56], [0.62, 5.70, -0.30], LIGHT_CONCRETE, "utility_cap");
  for (const x of [0.78, 1.10]) {
    cylinder(0.20, 0.54, [x, 5.72, 0.35], DARK_CONCRETE, 10, "water_tank");
    cylinder(0.215, 0.045, [x, 6.00, 0.35], LIGHT_CONCRETE, 10, "tank_lid");
    rod([x, 6.02, 0.35], [x, 6.25, 0.35], 0.018, METAL, "tank_pipe");
  }
  for (const x of [-1.55, -1.25, 1.42, 1.67]) {
    box([0.16, 0.25, 0.16], [x, 5.52, -0.62], CONCRETE, "parapet_block");
  }
  for (let i = 0; i < 5; i++) {
    cylinder(0.045, 0.38, [-1.30 + i * 0.18, 5.62, 0.55], METAL, 6, "vent_pipe");
  }

  // Thin rooftop mast, antenna crossbar, and lightning rod.
  rod([0.18, 5.98, 0.05], [0.18, 6.78, 0.05], 0.025, METAL, "antenna_mast");
  rod([-0.18, 6.42, 0.05], [0.55, 6.42, 0.05], 0.018, METAL, "antenna_crossbar");
  rod([0.18, 6.77, 0.05], [0.18, 6.98, 0.05], 0.012, RUST, "lightning_tip");

  // Repeated facade drain lines and tie holes.
  for (const x of [-1.66, -0.82, 0, 0.82, 1.66]) {
    rod([x, 0.84, 0.84], [x, 5.20, 0.84], 0.012, DARK_CONCRETE, "facade_drain");
    for (let y = 1.02; y < 5.15; y += 0.46) {
      cylinder(0.018, 0.012, [x, y, 0.855], SHADOW, 6, "tie_hole");
    }
  }

  // A few conspicuous raw-concrete repair patches.
  const patches: Array<[number, number, number, number, number]> = [
    [-1.52, 2.08, 0.22, 0.16, 0.012],
    [1.58, 3.42, 0.18, 0.24, 0.014],
    [-0.72, 4.36, 0.30, 0.10, 0.010],
    [0.73, 1.78, 0.16, 0.19, 0.012],
    [1.42, 4.75, 0.24, 0.14, 0.010],
  ];
  for (const [x, y, w, h, z] of patches) {
    box([w, h, z], [x, y, 0.846], DARK_CONCRETE, "repair_patch");
  }

  // Minimal civic sign and faded graffiti on the entrance facade.
  box([0.72, 0.24, 0.025], [0.02, 1.47, 0.775], "#b8b19d", "building_sign");
  b.part(new THREE.PlaneGeometry(0.52, 0.16), "#ffffff", {
    at: [0.02, 1.47, 0.792],
    dir: [0, 0, 1],
    axis: "z",
    texture: graffiti,
    name: "graffiti_tag",
  });

  // Small orange safety markers on balcony edges.
  for (let floor = 1; floor < 10; floor += 2) {
    const y = 0.76 + floor * 0.46;
    const x = floor % 4 === 1 ? 1.03 : -1.03;
    for (const dx of [-0.57, 0.57]) {
      box([0.08, 0.06, 0.025], [x + dx, y + 0.26, 1.345], WARNING, "balcony_marker");
    }
  }

  // Broad, dark horizontal shadow slots under selected slabs give the mass depth.
  for (let i = 0; i < 6; i++) {
    const y = 1.02 + i * 0.74;
    box([3.24, 0.035, 0.035], [0, y, 0.845], SHADOW, "deep_shadow_slot");
  }

  // Low concrete wheel stops / site elements, kept subordinate to the building.
  for (const x of [-1.55, -0.95, 0.95, 1.55]) {
    box([0.32, 0.12, 0.18], [x, 0.10, -1.18], DARK_CONCRETE, "wheel_stop");
  }

  return b.root;
}
