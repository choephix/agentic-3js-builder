```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "raw-concrete-housing-block",
  description:
    "A stylized brutalist social-housing block assembled from raw concrete masses, recessed glazing, cantilevered balconies, heavy parapets, service structures, vents, seams, and rooftop water tanks.",
};

export default function build() {
  const b = createBuilder({ name: "raw-concrete-housing-block", detail: 1 });

  const CONCRETE = "#8b8b82";
  const CONCRETE_LIGHT = "#a5a49a";
  const CONCRETE_DARK = "#686a65";
  const CONCRETE_SHADOW = "#555954";
  const CONCRETE_WARM = "#98958a";
  const GLASS = "#182326";
  const GLASS_BLUE = "#243a3d";
  const GLASS_GLOW = "#435854";
  const METAL = "#3d403e";
  const RUST = "#71483b";
  const BLACK = "#141817";
  const PALE = "#c3c0ad";

  const box = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      name,
      ...opts,
    });

  const cylinder = (
    name: string,
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    radial = 8,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, radial), color, {
      at,
      flat: true,
      name,
      ...opts,
    });

  const slab = (
    name: string,
    size: [number, number, number],
    at: [number, number, number],
    color = CONCRETE,
  ) => box(name, size, at, color);

  const rod = (
    name: string,
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color = METAL,
  ) => b.rod(a, c, radius, { color, name, caps: "flat" });

  // -----------------------------------------------------------------------------------------------
  // Foundation, plinth, and the massive lower silhouette.

  box("foundation", [3.72, 0.18, 2.08], [0, 0.09, 0], CONCRETE_DARK);
  box("foundation_cap", [3.9, 0.08, 2.18], [0, 0.22, 0], CONCRETE_LIGHT);

  box("lower_mass", [3.42, 2.95, 1.56], [0, 1.72, 0], CONCRETE);
  box("lower_mass_rear", [3.18, 2.66, 0.45], [0, 1.58, -0.92], CONCRETE_SHADOW);

  // Lower flanking wings make the block read as an accumulated municipal megastructure.
  box("left_wing", [0.76, 2.45, 1.73], [-1.47, 1.46, -0.02], CONCRETE_WARM);
  box("right_wing", [0.62, 2.84, 1.72], [1.5, 1.66, -0.02], CONCRETE_DARK);
  box("left_wing_cap", [0.88, 0.16, 1.88], [-1.47, 2.72, -0.02], CONCRETE_LIGHT);
  box("right_wing_cap", [0.72, 0.16, 1.87], [1.5, 3.1, -0.02], CONCRETE_LIGHT);

  // Deep horizontal floor bands and irregular exposed construction joints.
  for (const y of [0.42, 1.08, 1.74, 2.4, 3.06]) {
    slab(`front_floor_band_${y}`, [3.48, 0.075, 0.12], [0, y, 0.79], CONCRETE_LIGHT);
    slab(`rear_floor_band_${y}`, [3.3, 0.06, 0.1], [0, y, -0.79], CONCRETE_SHADOW);
  }

  for (const x of [-1.62, -0.81, 0, 0.81, 1.62]) {
    box(`vertical_pour_joint_${x}`, [0.035, 3.18, 0.018], [x, 1.82, 0.806], CONCRETE_SHADOW);
  }

  // Large board-formed concrete panels, slightly proud of the front wall.
  for (let floor = 0; floor < 4; floor++) {
    const y = 0.72 + floor * 0.66;
    for (const x of [-1.52, -0.76, 0.0, 0.76, 1.52]) {
      box(
        `board_panel_${floor}_${x}`,
        [0.68, 0.55, 0.025],
        [x, y, 0.815],
        floor % 2 === 0 ? CONCRETE_WARM : CONCRETE_LIGHT,
      );
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Recessed front glazing: dark punched openings surrounded by thick concrete reveals.

  const frontXs = [-1.26, -0.42, 0.42, 1.26];
  const floorYs = [0.72, 1.38, 2.04, 2.7];

  for (let f = 0; f < floorYs.length; f++) {
    for (let c = 0; c < frontXs.length; c++) {
      const x = frontXs[c];
      const y = floorYs[f];
      const glassColor = (f + c) % 3 === 0 ? GLASS_GLOW : GLASS;

      box(`front_window_${f}_${c}`, [0.42, 0.39, 0.035], [x, y, 0.828], glassColor);
      box(`front_window_recess_top_${f}_${c}`, [0.5, 0.065, 0.12], [x, y + 0.235, 0.78], CONCRETE_DARK);
      box(`front_window_recess_left_${f}_${c}`, [0.06, 0.5, 0.12], [x - 0.245, y, 0.78], CONCRETE_SHADOW);
      box(`front_window_recess_right_${f}_${c}`, [0.06, 0.5, 0.12], [x + 0.245, y, 0.78], CONCRETE_SHADOW);

      if ((f + c) % 2 === 0) {
        box(`window_mullion_${f}_${c}`, [0.022, 0.39, 0.045], [x, y, 0.855], METAL);
      }
    }
  }

  // A few blank concrete panels interrupt the regular grid.
  box("blank_panel_left_top", [0.62, 0.47, 0.06], [-1.28, 3.18, 0.79], CONCRETE_LIGHT);
  box("blank_panel_center_low", [0.62, 0.48, 0.06], [0.0, 0.39, 0.79], CONCRETE_DARK);
  box("blank_panel_right_mid", [0.62, 0.47, 0.06], [1.27, 1.72, 0.79], CONCRETE_WARM);

  // -----------------------------------------------------------------------------------------------
  // Cantilevered balconies. Each has a heavy slab, side cheek, shadow soffit, and blunt steel rails.

  const balconies = [
    { x: -1.26, y: 0.9, w: 0.72 },
    { x: 0.42, y: 1.56, w: 0.72 },
    { x: 1.26, y: 2.22, w: 0.72 },
    { x: -0.42, y: 2.88, w: 0.72 },
  ];

  balconies.forEach((bal, i) => {
    const z = 1.0;
    box(`balcony_slab_${i}`, [bal.w, 0.13, 0.52], [bal.x, bal.y - 0.27, z], CONCRETE_LIGHT);
    box(`balcony_soffit_${i}`, [bal.w * 0.9, 0.08, 0.42], [bal.x, bal.y - 0.36, 0.91], CONCRETE_DARK);
    box(`balcony_left_cheek_${i}`, [0.09, 0.5, 0.48], [bal.x - bal.w / 2 + 0.045, bal.y, z], CONCRETE);
    box(`balcony_right_cheek_${i}`, [0.09, 0.5, 0.48], [bal.x + bal.w / 2 - 0.045, bal.y, z], CONCRETE);

    const railY = bal.y + 0.19;
    rod(`balcony_rail_top_${i}`, [bal.x - bal.w / 2, railY, 1.27], [bal.x + bal.w / 2, railY, 1.27], 0.018);
    rod(`balcony_rail_mid_${i}`, [bal.x - bal.w / 2, railY - 0.18, 1.27], [bal.x + bal.w / 2, railY - 0.18, 1.27], 0.012);
    for (const dx of [-bal.w / 2, -bal.w / 4, 0, bal.w / 4, bal.w / 2]) {
      rod(`balcony_post_${i}_${dx}`, [bal.x + dx, bal.y - 0.25, 1.27], [bal.x + dx, railY, 1.27], 0.012);
    }
  });

  // A larger communal gallery on the left side, deeply shadowed.
  box("gallery_slab", [1.15, 0.16, 0.72], [-1.1, 2.78, 1.02], CONCRETE_LIGHT);
  box("gallery_back_shadow", [1.02, 0.56, 0.06], [-1.1, 3.03, 0.79], BLACK);
  for (const x of [-1.55, -1.3, -1.05, -0.8, -0.65]) {
    rod(`gallery_post_${x}`, [x, 2.8, 1.25], [x, 3.18, 1.25], 0.014);
  }
  rod("gallery_top_rail", [-1.58, 3.18, 1.25], [-0.62, 3.18, 1.25], 0.02);

  // -----------------------------------------------------------------------------------------------
  // Side elevations: narrow horizontal slit windows and projecting vertical fins.

  const sideYs = [0.65, 1.28, 1.91, 2.54];
  for (let i = 0; i < sideYs.length; i++) {
    const y = sideYs[i];
    box(`left_side_window_${i}`, [0.035, 0.28, 0.62], [-1.872, y, -0.18], GLASS_BLUE);
    box(`right_side_window_${i}`, [0.035, 0.34, 0.72], [1.827, y + 0.02, -0.08], GLASS);
    box(`left_side_lintel_${i}`, [0.1, 0.055, 0.72], [-1.84, y + 0.18, -0.18], CONCRETE_LIGHT);
    box(`right_side_lintel_${i}`, [0.1, 0.055, 0.82], [1.8, y + 0.22, -0.08], CONCRETE_SHADOW);
  }

  for (const z of [-0.67, -0.12, 0.43]) {
    box(`left_vertical_fin_${z}`, [0.1, 2.78, 0.18], [-1.9, 1.68, z], CONCRETE_LIGHT);
    box(`right_vertical_fin_${z}`, [0.1, 3.03, 0.2], [1.86, 1.78, z], CONCRETE_DARK);
  }

  // Rear fire-stair / service face, visible in silhouette from oblique views.
  box("rear_stair_tower", [0.72, 3.38, 0.42], [-0.62, 1.88, -1.02], CONCRETE_DARK);
  for (let i = 0; i < 5; i++) {
    box(`rear_stair_opening_${i}`, [0.42, 0.28, 0.035], [-0.62, 0.62 + i * 0.63, -1.25], BLACK);
    box(`rear_stair_lintel_${i}`, [0.52, 0.065, 0.08], [-0.62, 0.79 + i * 0.63, -1.23], CONCRETE_LIGHT);
  }

  // -----------------------------------------------------------------------------------------------
  // Roofline: thick parapet, stepped penthouse, ventilation blocks, and exposed services.

  box("roof_deck", [3.48, 0.16, 1.62], [0, 3.46, 0], CONCRETE_DARK);
  box("front_parapet", [3.58, 0.33, 0.16], [0, 3.66, 0.72], CONCRETE_LIGHT);
  box("rear_parapet", [3.44, 0.28, 0.14], [0, 3.62, -0.72], CONCRETE_SHADOW);
  box("left_parapet", [0.16, 0.3, 1.42], [-1.68, 3.64, 0], CONCRETE_WARM);
  box("right_parapet", [0.14, 0.38, 1.48], [1.68, 3.69, 0], CONCRETE_DARK);

  box("penthouse_core", [1.28, 0.62, 0.84], [0.25, 3.91, -0.08], CONCRETE);
  box("penthouse_shadow_door", [0.38, 0.42, 0.035], [0.25, 3.9, 0.355], BLACK);
  box("penthouse_cap", [1.48, 0.1, 1.0], [0.25, 4.27, -0.08], CONCRETE_LIGHT);

  // Angled-looking stepped concrete blocks are kept as simple overlapping brutalist volumes.
  box("roof_service_block", [0.62, 0.48, 0.5], [-0.88, 3.9, -0.18], CONCRETE_WARM);
  box("roof_service_block_cap", [0.74, 0.08, 0.62], [-0.88, 4.18, -0.18], CONCRETE_LIGHT);
  box("roof_vent_bank", [0.9, 0.25, 0.38], [1.05, 3.84, -0.28], CONCRETE_SHADOW);

  // Repeating roof vents, louvers, and small cap blocks.
  for (let i = 0; i < 5; i++) {
    const x = -1.35 + i * 0.42;
    box(`roof_louver_${i}`, [0.28, 0.26, 0.16], [x, 3.88, 0.32], CONCRETE_LIGHT);
    for (let j = 0; j < 3; j++) {
      box(`roof_louver_slit_${i}_${j}`, [0.18, 0.018, 0.022], [x, 3.83 + j * 0.075, 0.415], BLACK);
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Twin rooftop water tanks: squat, faceted, and intentionally infrastructural.

  for (const [i, x] of [-0.18, 0.72].entries()) {
    cylinder(`water_tank_${i}`, 0.27, 0.48, [x, 4.53, -0.15], CONCRETE_DARK, 10);
    cylinder(`water_tank_cap_${i}`, 0.29, 0.07, [x, 4.8, -0.15], CONCRETE_LIGHT, 10);
    cylinder(`water_tank_foot_${i}`, 0.075, 0.24, [x, 4.17, -0.15], METAL, 8);
    cylinder(`water_tank_pipe_${i}`, 0.028, 0.8, [x + 0.17, 4.42, -0.15], RUST, 6);
    box(`water_tank_band_${i}`, [0.56, 0.045, 0.045], [x, 4.53, 0.1], METAL);
  }
  rod("tank_link_pipe", [0.0, 4.42, -0.15], [0.9, 4.42, -0.15], 0.025, RUST);

  // Antenna mast, deliberately short and chunky rather than delicate.
  cylinder("antenna_mast", 0.035, 0.68, [1.28, 4.42, -0.22], METAL, 8);
  rod("antenna_crossbar", [1.08, 4.62, -0.22], [1.48, 4.62, -0.22], 0.018, METAL);
  rod("antenna_tip", [1.28, 4.76, -0.22], [1.28, 4.98, -0.22], 0.014, RUST);

  // -----------------------------------------------------------------------------------------------
  // Ground-level service details and entrances.

  box("entry_portal_shadow", [0.78, 1.18, 0.08], [0.38, 0.82, 0.815], BLACK);
  box("entry_door_left", [0.32, 1.0, 0.035], [0.18, 0.8, 0.86], GLASS_BLUE);
  box("entry_door_right", [0.32, 1.0, 0.035], [0.58, 0.8, 0.86], GLASS);
  box("entry_header", [0.96, 0.16, 0.18], [0.38, 1.43, 0.78], CONCRETE_LIGHT);
  box("entry_step", [1.05, 0.12, 0.42], [0.38, 0.28, 0.99], CONCRETE_DARK);
  rod("entry_handle", [0.42, 0.78, 0.9], [0.42, 0.78, 0.92], 0.014, PALE);

  box("service_door", [0.42, 0.9, 0.045], [-1.42, 0.76, 0.82], BLACK);
  box("service_door_frame", [0.52, 1.02, 0.08], [-1.42, 0.76, 0.78], CONCRETE_LIGHT);
  box("mailbox_panel", [0.38, 0.55, 0.06], [1.1, 0.73, 0.83], CONCRETE_DARK);
  for (let i = 0; i < 5; i++) {
    box(`mail_slot_${i}`, [0.26, 0.045, 0.018], [1.1, 0.56 + i * 0.085, 0.87], METAL);
  }

  // Heavy guard blocks at the base echo the building's repetitive mass.
  for (const x of [-1.48, -0.98, 0.98, 1.48]) {
    box(`base_guard_block_${x}`, [0.32, 0.36, 0.42], [x, 0.4, 1.0], CONCRETE_WARM);
  }

  // A few blunt rain leaders and exposed downpipes break the facade without becoming decoration.
  for (const x of [-1.62, 1.62]) {
    cylinder(`rain_leader_${x}`, 0.027, 3.25, [x, 1.82, 0.9], METAL, 6);
    box(`rain_leader_sill_${x}`, [0.15, 0.07, 0.13], [x, 0.48, 0.86], CONCRETE_LIGHT);
  }

  // Small, offset concrete name plaque: abstract typography-like bars rather than a texture.
  box("building_plaque", [0.65, 0.24, 0.035], [1.12, 1.13, 0.85], CONCRETE_LIGHT);
  for (let i = 0; i < 5; i++) {
    box(`plaque_mark_${i}`, [0.035, 0.12 + (i % 2) * 0.05, 0.014], [0.9 + i * 0.1, 1.13, 0.875], BLACK);
  }

  return b.root;
}
```