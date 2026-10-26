import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Drive 1980s Arcade Cabinet",
  description:
    "A detailed low-poly 1980s upright arcade cabinet in a bold synthwave palette, with a glowing marquee, pixel-art screen, controls, coin door, speaker grille, side artwork, neon trim, vents, rivets and chunky feet.",
};

export default function build() {
  const b = createBuilder({ name: "neon-drive-arcade", detail: 1 });

  const NAVY = "#090b2a";
  const DEEP = "#10113a";
  const PURPLE = "#28104d";
  const VIOLET = "#5a1c83";
  const MAGENTA = "#ff2bd6";
  const HOT_PINK = "#ff4fae";
  const CYAN = "#27f6ff";
  const BLUE = "#315dff";
  const ORANGE = "#ff7438";
  const YELLOW = "#ffe66c";
  const CREAM = "#fff2d3";
  const BLACK = "#050511";
  const METAL = "#4b456a";
  const DARK_METAL = "#211d3d";
  const RED = "#ff315d";
  const GREEN = "#44f0ae";

  const screenTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#090b3a"/>
          <stop offset="0.52" stop-color="#32105a"/>
          <stop offset="1" stop-color="#ff3b94"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff7a8"/>
          <stop offset="1" stop-color="#ff7a38"/>
        </linearGradient>
      </defs>
      <rect width="320" height="200" fill="url(#sky)"/>
      <circle cx="160" cy="92" r="39" fill="url(#sun)"/>
      <g stroke="#ff2bd6" stroke-width="4" opacity="0.9">
        <path d="M120 72h80M116 84h88M114 96h92M119 108h82"/>
      </g>
      <path d="M0 116H320" stroke="#27f6ff" stroke-width="4"/>
      <g stroke="#27f6ff" stroke-width="2" opacity="0.95">
        <path d="M0 134H320M0 151H320M0 171H320M0 194H320"/>
        <path d="M160 116L0 200M160 116L35 200M160 116L75 200M160 116L110 200M160 116L210 200M160 116L245 200M160 116L285 200M160 116L320 200"/>
      </g>
      <path d="M0 133L56 125L96 130L137 121L180 128L229 119L270 126L320 119V137H0Z" fill="#090b2a"/>
      <text x="160" y="28" text-anchor="middle" fill="#fff3c7" font-family="monospace" font-size="13" font-weight="bold" letter-spacing="3">PLAYER ONE</text>
      <text x="160" y="188" text-anchor="middle" fill="#fff" font-family="monospace" font-size="11" font-weight="bold" letter-spacing="2">INSERT COIN</text>
    </svg>`,
    { size: 512 },
  );

  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180">
      <defs>
        <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#160b42"/>
          <stop offset="0.48" stop-color="#8d1d9d"/>
          <stop offset="1" stop-color="#ff3c86"/>
        </linearGradient>
      </defs>
      <rect width="640" height="180" rx="12" fill="url(#m)"/>
      <path d="M0 142L126 30L210 100L300 14L395 92L496 18L640 142" fill="none" stroke="#27f6ff" stroke-width="7" opacity=".75"/>
      <path d="M0 154L126 42L210 112L300 26L395 104L496 30L640 154" fill="none" stroke="#ffed70" stroke-width="3"/>
      <text x="320" y="91" text-anchor="middle" fill="#fff4db" stroke="#27f6ff" stroke-width="5" paint-order="stroke" font-family="sans-serif" font-size="54" font-style="italic" font-weight="900" letter-spacing="7">NEON</text>
      <text x="320" y="140" text-anchor="middle" fill="#ffe56c" stroke="#ff2bd6" stroke-width="3" paint-order="stroke" font-family="monospace" font-size="31" font-weight="bold" letter-spacing="8">DRIVE</text>
    </svg>`,
    { size: 512 },
  );

  const coinTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 260">
      <rect width="220" height="260" rx="12" fill="#110d29" stroke="#ff2bd6" stroke-width="8"/>
      <rect x="22" y="25" width="176" height="55" rx="9" fill="#261351" stroke="#27f6ff" stroke-width="4"/>
      <text x="110" y="60" text-anchor="middle" fill="#fff2c8" font-family="monospace" font-size="25" font-weight="bold">COIN</text>
      <rect x="47" y="105" width="126" height="28" rx="10" fill="#050511" stroke="#ff7438" stroke-width="5"/>
      <rect x="54" y="112" width="112" height="14" rx="7" fill="#ffe66c"/>
      <circle cx="110" cy="178" r="39" fill="#5a1c83" stroke="#27f6ff" stroke-width="6"/>
      <circle cx="110" cy="178" r="25" fill="#16103a" stroke="#ffe66c" stroke-width="4"/>
      <text x="110" y="188" text-anchor="middle" fill="#ff7438" font-family="monospace" font-size="25" font-weight="bold">25</text>
      <text x="110" y="235" text-anchor="middle" fill="#27f6ff" font-family="monospace" font-size="16" letter-spacing="3">CREDITS</text>
    </svg>`,
    { size: 384 },
  );

  const sideTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 620">
      <defs>
        <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#35126a"/>
          <stop offset="1" stop-color="#080b2b"/>
        </linearGradient>
      </defs>
      <rect width="260" height="620" fill="url(#s)"/>
      <path d="M8 472L132 72L252 472" fill="none" stroke="#ff2bd6" stroke-width="10"/>
      <path d="M28 492L132 126L232 492" fill="none" stroke="#27f6ff" stroke-width="5"/>
      <path d="M28 502H232M45 532H215M67 562H193M88 592H172" stroke="#ff7438" stroke-width="5"/>
      <path d="M132 75V460M132 127L52 460M132 127L212 460" stroke="#315dff" stroke-width="3" opacity=".7"/>
      <circle cx="132" cy="150" r="43" fill="#ff7438" stroke="#ffe66c" stroke-width="6"/>
      <path d="M91 151H173M96 166H168M105 181H159" stroke="#8d1d9d" stroke-width="7"/>
      <text x="130" y="295" text-anchor="middle" fill="#fff2c8" stroke="#ff2bd6" stroke-width="4" paint-order="stroke" font-family="sans-serif" font-size="55" font-style="italic" font-weight="900">80s</text>
      <text x="130" y="335" text-anchor="middle" fill="#27f6ff" font-family="monospace" font-size="16" font-weight="bold" letter-spacing="3">ARCADE</text>
    </svg>`,
    { size: 512 },
  );

  let piece = 0;

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: Record<string, unknown> = {},
  ) {
    return b.part(geometry, color, {
      at,
      name: options.name ?? `piece_${piece++}`,
      ...options,
    });
  }

  function box(
    size: [number, number, number],
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) {
    return part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, at, options);
  }

  function cylinder(
    radius: number,
    height: number,
    at: [number, number, number],
    color: string,
    options: Record<string, unknown> = {},
  ) {
    return part(new THREE.CylinderGeometry(radius, radius, height, options.segments ? Number(options.segments) : 12), color, at, options);
  }

  function glowPart(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    strength = 1.6,
    options: Record<string, unknown> = {},
  ) {
    return glow(part(geometry, color, at, options), strength);
  }

  function rod(
    a: [number, number, number],
    c: [number, number, number],
    radius: number,
    color: string,
    strength = 2,
    name = "neon_rod",
  ) {
    const sweep = b.rod(a, c, radius, { color, name });
    glow(sweep, strength);
    return sweep;
  }

  function neonRect(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    color: string,
    radius = 0.008,
    strength = 2,
    prefix = "neon_rect",
  ) {
    rod([x - width / 2, y - height / 2, z], [x + width / 2, y - height / 2, z], radius, color, strength, `${prefix}_bottom`);
    rod([x + width / 2, y - height / 2, z], [x + width / 2, y + height / 2, z], radius, color, strength, `${prefix}_right`);
    rod([x + width / 2, y + height / 2, z], [x - width / 2, y + height / 2, z], radius, color, strength, `${prefix}_top`);
    rod([x - width / 2, y + height / 2, z], [x - width / 2, y - height / 2, z], radius, color, strength, `${prefix}_left`);
  }

  function sideBolt(s: number, y: number, z: number, color: string, name: string) {
    return part(
      new THREE.SphereGeometry(0.018, 8, 5),
      color,
      [s * 0.404, y, z],
      {
        rotation: [0, 0, s > 0 ? 90 : -90],
        name,
      },
    );
  }

  // Four chunky feet establish the floor contact at y = 0.
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      box(
        [0.14, 0.08, 0.14],
        [sx * 0.245, 0.04, sz * 0.235],
        BLACK,
        { name: `rubber_foot_${sx}_${sz}` },
      );
      box(
        [0.105, 0.025, 0.105],
        [sx * 0.245, 0.092, sz * 0.235],
        DARK_METAL,
        { name: `foot_cap_${sx}_${sz}` },
      );
    }
  }

  // Lower plinth and the dark inner cabinet.
  box([0.72, 0.18, 0.70], [0, 0.15, -0.03], PURPLE, { name: "lower_plinth" });
  box([0.68, 0.07, 0.66], [0, 0.255, -0.035], DEEP, { name: "plinth_shadow" });
  box([0.66, 1.52, 0.58], [0, 0.98, -0.075], NAVY, { name: "main_cabinet_body" });
  box([0.62, 0.13, 0.55], [0, 1.73, -0.065], PURPLE, { name: "top_cap" });
  box([0.70, 0.045, 0.61], [0, 1.812, -0.065], BLACK, { name: "top_shadow_seam" });

  // Side cheeks use a true arcade-cabinet silhouette rather than a plain box.
  const profile: [number, number][] = [
    [-0.39, 0.00],
    [0.40, 0.00],
    [0.40, 0.54],
    [0.35, 0.64],
    [0.30, 1.42],
    [0.39, 1.61],
    [0.37, 1.80],
    [-0.31, 1.80],
    [-0.39, 1.67],
  ];

  for (const s of [-1, 1]) {
    b.extrude(profile, {
      at: [s * 0.355, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.065,
      bevel: 0.006,
      color: PURPLE,
      name: `side_cheek_${s}`,
    });

    part(
      new THREE.PlaneGeometry(0.51, 1.43),
      "#ffffff",
      [s * 0.392, 0.94, -0.015],
      {
        dir: [s, 0, 0],
        axis: "z",
        up: [0, 1, 0],
        texture: sideTexture,
        name: `side_art_${s}`,
      },
    );

    // Bright contour around the recognizable side profile.
    const outline: [number, number][] = [
      [0.40, 0.05],
      [0.40, 0.54],
      [0.35, 0.64],
      [0.30, 1.42],
      [0.39, 1.61],
      [0.37, 1.80],
    ];
    for (let i = 0; i < outline.length - 1; i++) {
      const a = outline[i];
      const c = outline[i + 1];
      rod(
        [s * 0.398, a[1], a[0]],
        [s * 0.398, c[1], c[0]],
        0.009,
        i % 2 === 0 ? CYAN : MAGENTA,
        2.2,
        `side_outer_trim_${s}_${i}`,
      );
    }

    rod([s * 0.398, 0.05, -0.39], [s * 0.398, 0.05, 0.40], 0.010, MAGENTA, 2.2, `side_bottom_trim_${s}`);
    rod([s * 0.398, 0.64, 0.35], [s * 0.398, 1.39, 0.30], 0.007, CYAN, 2.0, `side_front_trim_${s}`);

    // Decorative diagonal energy stripes sit over the side art.
    rod([s * 0.405, 0.40, -0.23], [s * 0.405, 0.86, 0.13], 0.006, ORANGE, 1.8, `side_stripe_a_${s}`);
    rod([s * 0.405, 0.33, -0.28], [s * 0.405, 0.79, 0.08], 0.004, YELLOW, 1.8, `side_stripe_b_${s}`);
    rod([s * 0.405, 0.93, -0.15], [s * 0.405, 1.34, 0.14], 0.005, CYAN, 2.0, `side_stripe_c_${s}`);

    sideBolt(s, 0.13, -0.29, CYAN, `side_bolt_bottom_front_${s}`);
    sideBolt(s, 0.13, 0.29, MAGENTA, `side_bolt_bottom_back_${s}`);
    sideBolt(s, 1.56, 0.31, YELLOW, `side_bolt_screen_${s}`);
    sideBolt(s, 1.73, -0.25, CYAN, `side_bolt_top_${s}`);
  }

  // Rear ventilation stack, visible around the cabinet's back edge.
  box([0.51, 0.54, 0.035], [0, 0.78, -0.38], BLACK, { name: "rear_vent_panel" });
  for (let i = 0; i < 8; i++) {
    const y = 0.57 + i * 0.058;
    rod([-0.22, y, -0.405], [0.22, y, -0.405], 0.004, i % 2 ? VIOLET : BLUE, 1.2, `rear_vent_${i}`);
  }
  box([0.42, 0.045, 0.04], [0, 1.19, -0.40], DARK_METAL, { name: "rear_service_rail" });
  for (const x of [-0.18, -0.06, 0.06, 0.18]) {
    cylinder(0.012, 0.045, [x, 1.19, -0.43], CYAN, {
      rotation: [90, 0, 0],
      name: `rear_service_rivet_${x}`,
      segments: 8,
    });
  }

  // Screen housing: layered bezel, inset glass and bright scanline border.
  box([0.61, 0.59, 0.075], [0, 1.285, 0.265], BLACK, { name: "screen_outer_bezel" });
  box([0.565, 0.535, 0.035], [0, 1.285, 0.312], VIOLET, { name: "screen_inner_bezel" });
  box([0.515, 0.455, 0.018], [0, 1.285, 0.335], BLACK, { name: "screen_cavity" });

  const screen = glow(
    part(
      new THREE.PlaneGeometry(0.485, 0.365),
      "#ffffff",
      [0, 1.285, 0.348],
      {
        dir: [0, 0, 1],
        axis: "z",
        up: [0, 1, 0],
        texture: screenTexture,
        name: "pixel_screen",
      },
    ),
    1.3,
  );

  neonRect(0, 1.285, 0.362, 0.505, 0.385, CYAN, 0.008, 2.5, "screen_cyan_frame");
  neonRect(0, 1.285, 0.366, 0.535, 0.415, MAGENTA, 0.004, 1.5, "screen_magenta_frame");

  // Small screen screws and a corner status light.
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      cylinder(
        0.012,
        0.018,
        [sx * 0.276, 1.285 + sy * 0.247, 0.372],
        sy > 0 ? YELLOW : CYAN,
        {
          rotation: [90, 0, 0],
          segments: 8,
          name: `screen_screw_${sx}_${sy}`,
        },
      );
    }
  }
  glowPart(new THREE.SphereGeometry(0.018, 8, 6), RED, [0.255, 1.02, 0.37], 2.5, { name: "screen_status_led" });

  // Header marquee and its layered neon frame.
  box([0.64, 0.245, 0.10], [0, 1.704, 0.235], BLACK, { name: "marquee_block" });
  box([0.59, 0.205, 0.035], [0, 1.704, 0.298], VIOLET, { name: "marquee_recess" });

  glow(
    part(
      new THREE.PlaneGeometry(0.555, 0.155),
      "#ffffff",
      [0, 1.704, 0.322],
      {
        dir: [0, 0, 1],
        axis: "z",
        up: [0, 1, 0],
        texture: marqueeTexture,
        name: "marquee_art",
      },
    ),
    1.7,
  );

  neonRect(0, 1.704, 0.341, 0.575, 0. eighteenth ?? 0.175, MAGENTA, 0.008, 2.5, "marquee_magenta_frame");
  neonRect(0, 1.704, 0.347, 0.602, 0.201, CYAN, 0.0045, 2.0, "marquee_cyan_frame");

  // The control deck projects forward from the cabinet.
  box([0.65, 0.11, 0.39], [0, 0.815, 0.285], BLACK, { name: "control_deck_base" });
  box([0.61, 0.055, 0.345], [0, 0.886, 0.295], PURPLE, { name: "control_deck_surface" });
  box([0.65, 0.075, 0.045], [0, 0.78, 0.475], VIOLET, { name: "control_front_lip" });
  rod([-0.305, 0.906, 0.468], [0.305, 0.906, 0.468], 0.008, CYAN, 2.4, "control_front_neon");
  rod([-0.305, 0.875, 0.111], [-0.305, 0.875, 0.468], 0.006, MAGENTA, 2.0, "control_left_neon");
  rod([0.305, 0.875, 0.111], [0.305, 0.875, 0.468], 0.006, MAGENTA, 2.0, "control_right_neon");

  // Joystick shaft, collar, and oversized ball.
  cylinder(0.019, 0.155, [0.115, 0.992, 0.285], METAL, { name: "joystick_stem", segments: 10 });
  cylinder(0.041, 0.018, [0.115, 0.915, 0.285], DARK_METAL, { name: "joystick_collar", segments: 12 });
  glowPart(new THREE.SphereGeometry(0.052, 12, 8), RED, [0.115, 1.085, 0.285], 1.5, { name: "joystick_ball" });
  cylinder(0.060, 0.012, [0.115, 0.915, 0.285], CYAN, { name: "joystick_collar_ring", segments: 16 });
  glowPart(new THREE.TorusGeometry(0.057, 0.006, 6, 16), MAGENTA, [0.115, 0.923, 0.285], 2.0, {
    rotation: [90, 0, 0],
    name: "joystick_ring",
  });

  // Three colorful action buttons, each with a dark socket and luminous rim.
  const buttons: Array<[number, string, string]> = [
    [-0.16, MAGENTA, "button_magenta"],
    [-0.045, YELLOW, "button_yellow"],
    [0.07, CYAN, "button_cyan"],
  ];
  for (const [x, color, name] of buttons) {
    cylinder(0.043, 0.019, [x, 0.924, 0.31], BLACK, { name: `${name}_socket`, segments: 12 });
    glowPart(new THREE.CylinderGeometry(0.034, 0.039, 0.026, 12), color, [x, 0.94, 0.31], 2.0, {
      name,
    });
    glowPart(new THREE.TorusGeometry(0.045, 0.005, 6, 16), color, [x, 0.927, 0.31], 1.5, {
      rotation: [90, 0, 0],
      name: `${name}_rim`,
    });
  }

  // Start and select buttons at the far right of the deck.
  for (const [x, color, name] of [
    [-0.23, GREEN, "start_button"],
    [-0.13, ORANGE, "select_button"],
  ] as Array<[number, string, string]>) {
    cylinder(0.022, 0.018, [x, 0.923, 0.205], DARK_METAL, { name: `${name}_socket`, segments: 10 });
    glowPart(new THREE.CylinderGeometry(0.016, 0.019, 0.022, 10), color, [x, 0.941, 0.205], 1.8, { name });
  }

  // Decorative control labels.
  const labelTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 70">
      <rect width="300" height="70" fill="#100a29"/>
      <text x="150" y="29" text-anchor="middle" fill="#27f6ff" font-family="monospace" font-size="18" font-weight="bold" letter-spacing="3">A   B   C</text>
      <text x="150" y="55" text-anchor="middle" fill="#ff7438" font-family="monospace" font-size="13" letter-spacing="2">FIRE  FIRE  FIRE</text>
    </svg>`,
    { size: 256 },
  );
  part(new THREE.PlaneGeometry(0.19, 0.043), "#ffffff", [-0.055, 0.939, 0.405], {
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    texture: labelTexture,
    name: "control_instruction_label",
  });

  // Speaker / vent strip beneath the screen.
  box([0.49, 0.19, 0.045], [0, 0.625, 0.289], BLACK, { name: "speaker_grille" });
  for (let i = 0; i < 11; i++) {
    const x = -0.215 + i * 0.043;
    const color = i % 3 === 0 ? MAGENTA : i % 3 === 1 ? CYAN : VIOLET;
    box([0.012, 0.135, 0.012], [x, 0.625, 0.317], color, { name: `speaker_slit_${i}` });
  }
  rod([-0.25, 0.735, 0.319], [0.25, 0.735, 0.319], 0.004, ORANGE, 1.7, "speaker_top_trim");
  rod([-0.25, 0.515, 0.319], [0.25, 0.515, 0.319], 0.004, BLUE, 1.7, "speaker_bottom_trim");

  // Lower front fascia and coin door.
  box([0.59, 0.46, 0.065], [0, 0.38, 0.255], DEEP, { name: "lower_front_fascia" });
  box([0.38, 0.39, 0.045], [0, 0.39, 0.298], BLACK, { name: "coin_door_recess" });

  part(
    new THREE.PlaneGeometry(0.338, 0.352),
    "#ffffff",
    [0, 0.39, 0.326],
    {
      dir: [0, 0, 1],
      axis: "z",
      up: [0, 1, 0],
      texture: coinTexture,
      name: "coin_door_art",
    },
  );

  neonRect(0, 0.39, 0.355, 0.365, 0.377, MAGENTA, 0.006, 2.0, "coin_door_frame");
  rod([-0.283, 0.16, 0.315], [0.283, 0.16, 0.315], 0.006, CYAN, 1.8, "lower_cyan_trim");
  rod([-0.28, 0.59, 0.315], [0.28, 0.59, 0.315], 0.005, ORANGE, 1.7, "lower_orange_trim");

  // Coin door physical details above the printed artwork.
  box([0.11, 0.027, 0.012], [0, 0.53, 0.357], DARK_METAL, { name: "coin_return_slot" });
  box([0.082, 0.011, 0.007], [0, 0.53, 0.367], YELLOW, { name: "coin_return_glint" });
  cylinder(0.018, 0.014, [-0.11, 0.23, 0.357], RED, {
    rotation: [90, 0, 0],
    name: "coin_service_led",
    segments: 10,
  });
  glowPart(new THREE.SphereGeometry(0.014, 8, 5), RED, [-0.11, 0.23, 0.37], 2.0, { name: "coin_service_glow" });
  cylinder(0.018, 0.014, [0.11, 0.23, 0.357], GREEN, {
    rotation: [90, 0, 0],
    name: "coin_power_led",
    segments: 10,
  });
  glowPart(new THREE.SphereGeometry(0.014, 8, 5), GREEN, [0.11, 0.23, 0.37], 2.0, { name: "coin_power_glow" });

  // Front corner rails make the cabinet silhouette especially readable.
  rod([-0.315, 0.17, 0.34], [-0.315, 0.57, 0.34], 0.008, MAGENTA, 2.0, "front_left_lower_rail");
  rod([0.315, 0.17, 0.34], [0.315, 0.57, 0.34], 0.008, MAGENTA, 2.0, "front_right_lower_rail");
  rod([-0.315, 0.66, 0.34], [-0.315, 1.55, 0.34], 0.007, CYAN, 2.1, "front_left_upper_rail");
  rod([0.315, 0.66, 0.34], [0.315, 1.55, 0.34], 0.007, CYAN, 2.1, "front_right_upper_rail");

  // A row of little front-panel rivets and pixel blocks.
  for (const x of [-0.255, -0.17, -0.085, 0, 0.085, 0.17, 0.255]) {
    glowPart(new THREE.SphereGeometry(0.010, 7, 5), x < 0 ? CYAN : MAGENTA, [x, 0.665, 0.353], 1.6, {
      name: `fascia_rivet_${x}`,
    });
  }

  // Tiny power toggle and a bright side-mounted service badge.
  box([0.075, 0.055, 0.035], [0.235, 0.18, 0.345], BLACK, { name: "power_switch_box" });
  cylinder(0.011, 0.055, [0.235, 0.205, 0.37], YELLOW, {
    rotation: [90, 0, 0],
    segments: 8,
    name: "power_switch",
  });
  const serviceTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 52">
      <rect width="120" height="52" rx="5" fill="#12103a" stroke="#27f6ff" stroke-width="5"/>
      <text x="60" y="34" text-anchor="middle" fill="#ffe66c" font-family="monospace" font-size="18" font-weight="bold">POWER</text>
    </svg>`,
    { size: 128 },
  );
  part(new THREE.PlaneGeometry(0.082, 0.036), "#ffffff", [0.235, 0.25, 0.369], {
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    texture: serviceTexture,
    name: "power_badge",
  });

  // A final under-cabinet glow strip and small corner pixels.
  rod([-0.27, 0.27, 0.352], [0.27, 0.27, 0.352], 0.005, BLUE, 1.7, "coin_underlight");
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const color = i % 2 === 0 ? CYAN : MAGENTA;
      glowPart(
        new THREE.BoxGeometry(0.022, 0.022, 0.012),
        color,
        [sx * (0.27 - i * 0.055), 0.285 + i * 0.045, 0.36],
        1.5,
        { name: `lower_pixel_${sx}_${i}` },
      );
    }
  }

  return b.root;
}
