import * as THREE from "three";
import {
  createBuilder,
  mix,
  mottle,
  noise,
  paint,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "brutalist housing block",
  description:
    "A monumental raw-concrete brutalist housing block with recessed windows, stacked balconies, a central stair spine, rooftop machinery, water tanks, antennae, and weathered architectural details.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist-housing-block", detail: 1 });

  const CONCRETE = paint((p, n) => {
    const broad = noise(p, 0.72, 21);
    const fine = noise(p, 0.16, 44);
    const stain = noise(new THREE.Vector3(p.x, p.y * 0.42, p.z), 0.38, 9);
    let c = mix("#888985", "#5d5e5b", broad * 0.62 + fine * 0.2);
    c = mix(c, "#4c4d4a", Math.max(0, stain - 0.68) * 0.8);
    c = mix(c, "#aaa9a2", Math.max(0, n.y) * 0.12);
    c = mix(c, "#4a4b49", Math.max(0, -n.y) * 0.1);
    return c;
  });

  const LIGHT_CONCRETE = mottle("#a8a7a0", "#777873", {
    size: 0.46,
    contrast: 1.15,
    seed: 31,
  });

  const DARK_CONCRETE = mottle("#686965", "#41423f", {
    size: 0.3,
    contrast: 1.2,
    seed: 17,
  });

  const PANEL_SHADOW = "#454641";
  const WINDOW_FRAME = "#62635f";
  const WINDOW_RECESS = "#202a2b";
  const GLASS_BLUE = "#52737a";
  const RAIL = "#343b3a";
  const RUST = "#8c4c32";
  const WARNING_YELLOW = "#d4a331";
  const NEON_RED = "#c84435";
  const ROOF_DARK = "#252b2a";
  const BLACK = "#111817";

  const WINDOW = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#172322"/>
      <rect x="7" y="7" width="114" height="114" fill="#263b3c" stroke="#111817" stroke-width="8"/>
      <path d="M64 8V120M8 64H120" stroke="#0c1414" stroke-width="7"/>
      <path d="M13 12H60M70 12H115M13 71H60M70 71H115" stroke="#71959a" stroke-width="3" opacity=".65"/>
      <rect x="14" y="15" width="42" height="43" fill="#3c6268"/>
      <rect x="73" y="15" width="41" height="43" fill="#203536"/>
      <rect x="14" y="73" width="42" height="42" fill="#263f42"/>
      <rect x="73" y="73" width="41" height="42" fill="#52777a"/>
      <path d="M16 17L55 55M75 75L112 112" stroke="#b4d0c9" stroke-width="2" opacity=".48"/>
    </svg>`,
    { size: 256 },
  );

  const WINDOW_WARM = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#182221"/>
      <rect x="7" y="7" width="114" height="114" fill="#594f35" stroke="#101615" stroke-width="8"/>
      <path d="M64 8V120M8 64H120" stroke="#111817" stroke-width="7"/>
      <rect x="14" y="15" width="42" height="43" fill="#b48d4d"/>
      <rect x="73" y="15" width="41" height="43" fill="#665738"/>
      <rect x="14" y="73" width="42" height="42" fill="#735f3a"/>
      <rect x="73" y="73" width="41" height="42" fill="#c49a51"/>
      <path d="M16 17L55 55M75 75L112 112" stroke="#ffe0a0" stroke-width="2" opacity=".65"/>
    </svg>`,
    { size: 256 },
  );

  const DOOR = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 220">
      <rect width="120" height="220" fill="#131b1b"/>
      <rect x="8" y="8" width="104" height="204" fill="#274447" stroke="#0a1010" stroke-width="7"/>
      <path d="M60 10V210" stroke="#111b1b" stroke-width="5"/>
      <path d="M14 30H106M14 105H106" stroke="#7d9b98" stroke-width="2" opacity=".55"/>
      <circle cx="52" cy="161" r="4" fill="#d0a957"/>
      <circle cx="68" cy="161" r="4" fill="#d0a957"/>
      <path d="M17 15L49 48M72 17L103 49" stroke="#bad4ca" stroke-width="3" opacity=".5"/>
    </svg>`,
    { size: 256 },
  );

  const SIGN = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 100">
      <rect width="400" height="100" fill="#252b29" stroke="#121615" stroke-width="8"/>
      <path d="M22 76L48 24H68L95 76H76L70 62H44L38 76ZM50 49H64L57 32Z" fill="#d1b46b"/>
      <path d="M113 24H132V61H161V76H113ZM180 24H199V76H180ZM222 24H241V61H270V76H222ZM292 24H312V76H292ZM335 24H355V76H335Z" fill="#d1b46b"/>
      <path d="M22 86H378" stroke="#b64534" stroke-width="5"/>
    </svg>`,
    { size: 512 },
  );

  const WARNING = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" fill="#303331"/>
      <path d="M64 10L119 111H9Z" fill="#d4a331" stroke="#171b19" stroke-width="8"/>
      <path d="M64 38V76" stroke="#171b19" stroke-width="12" stroke-linecap="round"/>
      <circle cx="64" cy="94" r="7" fill="#171b19"/>
    </svg>`,
    { size: 192 },
  );

  const VENT = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 100">
      <rect width="160" height="100" fill="#1b211f"/>
      <path d="M12 18H148M12 38H148M12 58H148M12 78H148" stroke="#87908a" stroke-width="8"/>
      <path d="M25 10V90M55 10V90M85 10V90M115 10V90M145 10V90" stroke="#4d5651" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  let id = 0;
  const tag = (prefix: string) => `${prefix}_${++id}`;

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: any = CONCRETE,
    prefix = "concrete",
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      name: tag(prefix),
    });
  }

  function cylinder(
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    prefix: string,
    segments = 12,
  ) {
    return b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
      at,
      flat: true,
      name: tag(prefix),
    });
  }

  function plane(
    size: [number, number],
    at: [number, number, number],
    texture: any,
    prefix: string,
    dir: [number, number, number] = [0, 0, 1],
  ) {
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir,
      axis: "z",
      up: [0, 1, 0],
      texture,
      name: tag(prefix),
    });
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: any,
    prefix: string,
  ) {
    return b.rod(a, c, radius, {
      color,
      caps: "flat",
      name: tag(prefix),
    });
  }

  // Foundation and primary brutalist masses.
  box([12.8, 0.58, 8.5], [0, 0.29, 0], DARK_CONCRETE, "foundation");
  box([12.2, 0.34, 8.15], [0, 0.74, 0], CONCRETE, "foundation_cap");
  box([11.6, 17.0, 7.25], [0, 9.25, 0], CONCRETE, "main_block");

  // Rear block gives the building a heavy, layered silhouette.
  box([10.7, 11.5, 1.45], [0, 9.25, -4.18], DARK_CONCRETE, "rear_wing");
  box([2.35, 16.9, 0.85], [-4.68, 9.25, 3.98], LIGHT_CONCRETE, "left_pier");
  box([2.35, 16.9, 0.85], [4.68, 9.25, 3.98], LIGHT_CONCRETE, "right_pier");

  // Deep central stair/elevator spine.
  box([3.15, 16.45, 1.05], [0, 9.18, 4.08], LIGHT_CONCRETE, "central_spine");
  box([2.85, 15.65, 0.18], [0, 9.18, 4.63], DARK_CONCRETE, "spine_shadow");
  plane([1.28, 12.9], [0, 9.18, 4.745], WINDOW, "stair_glazing");

  for (let f = 0; f < 8; f++) {
    const y = 2.15 + f * 2.05;
    box([3.0, 0.1, 0.16], [0, y - 0.82, 4.76], CONCRETE, "stair_floor_band");
  }

  // Deep roof slab and parapets.
  box([12.35, 0.36, 7.9], [0, 17.82, -0.05], LIGHT_CONCRETE, "roof_slab");
  box([12.35, 0.82, 0.3], [0, 18.23, 3.78], CONCRETE, "front_parapet");
  box([12.35, 0.82, 0.3], [0, 18.23, -3.88], DARK_CONCRETE, "rear_parapet");
  box([0.3, 0.82, 7.45], [-6.02, 18.23, -0.05], CONCRETE, "left_parapet");
  box([0.3, 0.82, 7.45], [6.02, 18.23, -0.05], CONCRETE, "right_parapet");

  // Strong horizontal seams on the facade.
  for (let i = 0; i < 9; i++) {
    const y = 0.98 + i * 2.04;
    box([11.45, 0.075, 0.2], [0, y, 3.69], PANEL_SHADOW, "facade_seam");
  }

  // Vertical structural fins and corner joints.
  for (const x of [-5.45, -1.52, 1.52, 5.45]) {
    box([0.19, 16.35, 0.32], [x, 9.15, 3.77], LIGHT_CONCRETE, "vertical_fin");
  }
  for (const x of [-5.72, 5.72]) {
    box([0.18, 17.05, 7.48], [x, 9.2, 0], DARK_CONCRETE, "corner_joint");
  }

  function frontWindow(
    x: number,
    y: number,
    lit: boolean,
    label: string,
    w = 1.66,
    h = 1.42,
  ) {
    box([w + 0.23, h + 0.23, 0.18], [x, y, 3.69], WINDOW_RECESS, `${label}_recess`);
    plane([w, h], [x, y, 3.805], lit ? WINDOW_WARM : WINDOW, `${label}_glass`);
    box([0.11, h + 0.32, 0.12], [x - w / 2 - 0.08, y, 3.84], WINDOW_FRAME, `${label}_jamb`);
    box([0.11, h + 0.32, 0.12], [x + w / 2 + 0.08, y, 3.84], WINDOW_FRAME, `${label}_jamb`);
    box([w + 0.32, 0.11, 0.12], [x, y + h / 2 + 0.08, 3.84], WINDOW_FRAME, `${label}_lintel`);
    box([w + 0.32, 0.1, 0.14], [x, y - h / 2 - 0.08, 3.86], WINDOW_FRAME, `${label}_sill`);
  }

  const frontXs = [-4.28, -2.22, 2.22, 4.28];
  for (let f = 0; f < 7; f++) {
    const y = 1.72 + f * 2.1;
    for (let c = 0; c < frontXs.length; c++) {
      const balconyFloor = f < 7 && (c === 0 || c === 3) && f % 2 === 0;
      if (!balconyFloor) {
        frontWindow(
          frontXs[c],
          y,
          (f * 3 + c * 5) % 7 === 0 || (f === 5 && c === 2),
          `front_${f}_${c}`,
        );
      }
    }
  }

  // Narrow service windows in the central spine.
  for (let f = 0; f < 7; f++) {
    const y = 1.72 + f * 2.1;
    box([1.45, 1.45, 0.12], [0, y, 4.72], WINDOW_RECESS, "spine_window_recess");
    plane([1.22, 1.22], [0, y, 4.8], f % 3 === 0 ? WINDOW_WARM : WINDOW, "spine_window");
  }

  // Side elevations: regular openings on the long concrete walls.
  function sideWindow(
    side: number,
    z: number,
    y: number,
    lit: boolean,
    label: string,
  ) {
    box([0.18, 1.43, 1.52], [side * 5.82, y, z], WINDOW_RECESS, `${label}_recess`);
    plane([1.32, 1.25], [side * 5.94, y, z], lit ? WINDOW_WARM : WINDOW, `${label}_glass`, [
      side,
      0,
      0,
    ]);
    box([0.12, 1.6, 0.1], [side * 5.99, y, z - 0.76], WINDOW_FRAME, `${label}_jamb`);
    box([0.12, 1.6, 0.1], [side * 5.99, y, z + 0.76], WINDOW_FRAME, `${label}_jamb`);
    box([0.12, 0.11, 1.68], [side * 5.99, y + 0.78, z], WINDOW_FRAME, `${label}_lintel`);
    box([0.12, 0.1, 1.68], [side * 5.99, y - 0.78, z], WINDOW_FRAME, `${label}_sill`);
  }

  for (const side of [-1, 1]) {
    for (let f = 0; f < 7; f++) {
      const y = 1.75 + f * 2.1;
      for (let c = 0; c < 3; c++) {
        const z = -2.45 + c * 2.45;
        sideWindow(
          side,
          z,
          y,
          (f * 2 + c + (side > 0 ? 1 : 0)) % 6 === 0,
          `side_${side}_${f}_${c}`,
        );
      }
    }
  }

  // Stacked cantilevered balcony bays.
  function balcony(side: number, floor: number) {
    const y = 1.15 + floor * 2.1;
    const cx = side * 3.72;
    const front = 4.98;
    const leftEdge = cx - side * 1.55;
    const rightEdge = cx + side * 1.55;

    box([3.1, 0.24, 1.48], [cx, y, 4.32], LIGHT_CONCRETE, "balcony_slab");
    box([0.17, 1.1, 1.48], [leftEdge, y + 0.62, 4.32], CONCRETE, "balcony_cheek");
    box([0.17, 1.1, 1.48], [rightEdge, y + 0.62, 4.32], CONCRETE, "balcony_cheek");

    plane([1.17, 1.78], [cx, y + 1.02, 3.77], DOOR, "balcony_door");

    rod(
      [leftEdge, y + 1.2, front],
      [rightEdge, y + 1.2, front],
      0.045,
      RAIL,
      "balcony_top_rail",
    );

    for (let i = 0; i < 5; i++) {
      const x = leftEdge + (i / 4) * (rightEdge - leftEdge);
      rod([x, y + 0.15, front], [x, y + 1.2, front], 0.028, RAIL, "balcony_bar");
    }

    rod(
      [leftEdge, y + 0.96, 3.66],
      [leftEdge, y + 0.96, front],
      0.032,
      RAIL,
      "balcony_side_rail",
    );
    rod(
      [rightEdge, y + 0.96, 3.66],
      [rightEdge, y + 0.96, front],
      0.032,
      RAIL,
      "balcony_side_rail",
    );

    // A small service light tucked beneath each balcony.
    cylinder(0.045, 0.05, [cx, y - 0.15, 4.88], WARNING_YELLOW, "balcony_light", 8);
  }

  for (const side of [-1, 1]) {
    for (let floor = 0; floor < 7; floor++) balcony(side, floor);
  }

  // Entrance plinth, stairs, canopy, and monumental doorway.
  box([3.5, 0.18, 1.5], [0, 1.03, 4.75], LIGHT_CONCRETE, "entrance_canopy");
  box([0.23, 2.45, 0.42], [-1.7, 1.86, 4.45], CONCRETE, "entrance_column");
  box([0.23, 2.45, 0.42], [1.7, 1.86, 4.45], CONCRETE, "entrance_column");
  box([2.35, 2.5, 0.2], [0, 1.65, 4.7], BLACK, "entrance_recess");
  plane([1.7, 2.1], [0, 1.68, 4.82], DOOR, "main_door");

  for (let i = 0; i < 3; i++) {
    box(
      [3.15 - i * 0.18, 0.18, 0.42],
      [0, 0.15 + i * 0.18, 4.95 + i * 0.22],
      CONCRETE,
      "entry_step",
    );
  }

  plane([2.1, 0.52], [0, 3.25, 4.72], SIGN, "building_sign");
  plane([0.34, 0.34], [-1.33, 3.26, 4.74], WARNING, "entry_warning");
  plane([0.34, 0.34], [1.33, 3.26, 4.74], WARNING, "entry_warning");

  // Brutalist projecting service boxes on the right side.
  for (let i = 0; i < 4; i++) {
    const y = 4.0 + i * 3.0;
    box([1.25, 1.45, 1.15], [5.98, y, 1.05], DARK_CONCRETE, "service_box");
    box([0.08, 0.95, 0.76], [6.61, y, 1.05], BLACK, "service_slot");
    for (let j = 0; j < 3; j++) {
      rod(
        [6.67, y - 0.35 + j * 0.35, 0.7],
        [6.67, y - 0.35 + j * 0.35, 1.4],
        0.016,
        RAIL,
        "service_grille",
      );
    }
  }

  // Rooftop mechanical penthouse.
  box([4.85, 1.7, 3.65], [0, 18.85, -0.35], DARK_CONCRETE, "penthouse");
  box([5.15, 0.22, 3.92], [0, 19.72, -0.35], LIGHT_CONCRETE, "penthouse_cap");
  box([0.18, 1.9, 3.85], [-2.3, 18.88, -0.35], CONCRETE, "penthouse_fin");
  box([0.18, 1.9, 3.85], [2.3, 18.88, -0.35], CONCRETE, "penthouse_fin");
  plane([1.55, 0.7], [-1.15, 19.0, 1.52], VENT, "mechanical_vent");
  plane([1.55, 0.7], [1.15, 19.0, 1.52], VENT, "mechanical_vent");

  // Roof access door and warning placards.
  plane([0.9, 1.45], [0, 18.9, 1.5], DOOR, "roof_access");
  plane([0.42, 0.42], [-1.55, 19.03, 1.52], WARNING, "roof_warning");
  plane([0.42, 0.42], [1.55, 19.03, 1.52], WARNING, "roof_warning");

  // Two squat cylindrical rooftop water tanks.
  for (const x of [-3.45, 3.45]) {
    cylinder(0.86, 1.48, [x, 19.22, -1.22], CONCRETE, "water_tank", 12);
    cylinder(0.91, 0.16, [x, 19.98, -1.22], LIGHT_CONCRETE, "tank_cap", 12);
    cylinder(0.2, 0.34, [x, 20.23, -1.22], DARK_CONCRETE, "tank_vent", 8);

    for (let band = 0; band < 2; band++) {
      const y = 18.88 + band * 0.58;
      rod(
        [x - 0.87, y, -1.22],
        [x + 0.87, y, -1.22],
        0.026,
        RUST,
        "tank_band",
      );
    }

    rod([x + 0.67, 18.55, -1.22], [x + 0.67, 20.05, -1.22], 0.035, RAIL, "tank_pipe");
  }

  // Rooftop ductwork and low vents.
  for (let i = 0; i < 5; i++) {
    const x = -1.65 + i * 0.82;
    box([0.48, 0.45, 0.72], [x, 20.02, 0.55], ROOF_DARK, "roof_vent_box");
    plane([0.38, 0.28], [x, 20.04, 0.92], VENT, "roof_vent_face");
  }

  // Tall antenna mast and broadcast crossbars.
  rod([0, 19.75, 2.35], [0, 21.1, 2.35], 0.045, RAIL, "antenna_mast");
  rod([-0.95, 20.55, 2.35], [0.95, 20.55, 2.35], 0.025, RAIL, "antenna_crossbar");
  rod([-0.6, 20.9, 2.35], [0.6, 20.9, 2.35], 0.02, RAIL, "antenna_crossbar");
  box([0.18, 0.28, 0.18], [0, 21.25, 2.35], RUST, "antenna_beacon");

  // Exposed conduits descending from the roof, a signature of utilitarian brutalism.
  for (const x of [-2.7, 2.7]) {
    rod([x, 17.62, 3.25], [x, 0.92, 3.25], 0.035, RUST, "facade_conduit");
    for (let y = 3.0; y < 17.2; y += 2.8) {
      box([0.28, 0.12, 0.22], [x, y, 3.25], CONCRETE, "conduit_clamp");
    }
  }

  // Sparse red maintenance marks and concrete repair patches.
  for (let i = 0; i < 6; i++) {
    const x = i % 2 === 0 ? -5.77 : 5.77;
    const y = 4.5 + Math.floor(i / 2) * 3.4;
    box([0.035, 0.62, 0.42], [x, y, 3.9], RUST, "repair_mark");
  }

  // A few projecting raw-concrete sun-breakers over the upper facade.
  for (let i = 0; i < 4; i++) {
    const y = 8.0 + i * 2.1;
    box([10.9, 0.16, 0.85], [0, y, 4.05], LIGHT_CONCRETE, "sun_breaker");
  }

  // Small rooftop edge lights make the silhouette legible without changing its raw material language.
  for (const x of [-5.35, -2.7, 2.7, 5.35]) {
    cylinder(0.055, 0.06, [x, 18.68, 3.7], WARNING_YELLOW, "roof_marker", 8);
  }

  return b.root;
}
