import * as THREE from "three";
import { createBuilder, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Neon Vector Arcade Cabinet",
  description:
    "A stylized 1980s upright arcade cabinet with a glowing synthwave marquee, CRT screen, control deck, joystick, buttons, coin door, speaker grille, side art, neon trim, and chunky feet.",
};

export default function build() {
  const b = createBuilder({ name: "neonVectorArcade", detail: 1 });

  const INK = "#090719";
  const BODY = "#17102f";
  const BODY2 = "#241044";
  const EDGE = "#391466";
  const PURPLE = "#7624b8";
  const MAGENTA = "#ff238d";
  const PINK = "#ff5dbb";
  const CYAN = "#20e7ff";
  const BLUE = "#376dff";
  const YELLOW = "#ffe86b";
  const ORANGE = "#ff8d3b";
  const WHITE = "#fff8f0";
  const RED = "#ef3156";
  const METAL = "#62637f";
  const DARKMETAL = "#25253d";
  const SCREEN = "#07152d";
  const SCREENBLUE = "#063b91";
  const GREEN = "#52ffbd";

  const front = new THREE.Vector3(0, 0, 1);

  function part(
    geometry: THREE.BufferGeometry,
    color: string,
    at: [number, number, number],
    options: any = {},
  ) {
    return b.part(geometry, color, { at, ...options });
  }

  function box(
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    options: any = {},
  ) {
    return part(new THREE.BoxGeometry(...size), color, at, options);
  }

  function glowBox(
    size: [number, number, number],
    color: string,
    at: [number, number, number],
    strength = 1.5,
    options: any = {},
  ) {
    return glow(box(size, color, at, options), strength);
  }

  function cylinder(
    radius: number,
    height: number,
    color: string,
    at: [number, number, number],
    options: any = {},
  ) {
    return part(new THREE.CylinderGeometry(radius, radius, height, 12), color, at, options);
  }

  function rod(
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    options: any = {},
  ) {
    return b.rod(a, z, radius, { color, ...options });
  }

  function neonRod(
    a: [number, number, number],
    z: [number, number, number],
    radius: number,
    color: string,
    strength = 2,
  ) {
    return glow(rod(a, z, radius, color), strength);
  }

  // Cabinet silhouette: the thick central shell.
  box([0.72, 1.56, 0.72], BODY, [0, 0.82, -0.02]);
  box([0.68, 0.56, 0.70], BODY2, [0, 0.34, 0.0]);
  box([0.69, 0.28, 0.68], INK, [0, 1.49, 0.0]);

  // Feet keep the cabinet firmly planted on the floor.
  box([0.22, 0.08, 0.48], INK, [-0.25, 0.04, -0.04]);
  box([0.22, 0.08, 0.48], INK, [0.25, 0.04, -0.04]);
  box([0.17, 0.035, 0.34], DARKMETAL, [-0.25, 0.095, 0.0]);
  box([0.17, 0.035, 0.34], DARKMETAL, [0.25, 0.095, 0.0]);

  // Heavy polygonal side cheeks, giving the unmistakable arcade profile.
  const sideProfile: [number, number, "sharp"][] = [
    [-0.43, 0, "sharp"],
    [0.40, 0, "sharp"],
    [0.40, 0.67, "sharp"],
    [0.33, 0.77, "sharp"],
    [0.30, 1.40, "sharp"],
    [0.22, 1.62, "sharp"],
    [-0.23, 1.62, "sharp"],
    [-0.31, 1.43, "sharp"],
    [-0.34, 0.78, "sharp"],
    [-0.43, 0.69, "sharp"],
  ];

  for (const s of [-1, 1]) {
    const cheek = b.extrude(sideProfile, {
      at: [s * 0.365, 0.02, -0.38],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.055,
      bevel: 0.008,
      color: BODY2,
      name: `sideCheek${s}`,
    });

    // Magenta and cyan side-piping.
    neonRod(
      [s * 0.398, 0.12, -0.39],
      [s * 0.398, 0.68, -0.39],
      0.012,
      s > 0 ? MAGENTA : CYAN,
      1.4,
    );
    neonRod(
      [s * 0.398, 0.76, -0.39],
      [s * 0.398, 1.41, -0.39],
      0.010,
      s > 0 ? CYAN : MAGENTA,
      1.4,
    );
    neonRod(
      [s * 0.398, 1.43, -0.39],
      [s * 0.398, 1.59, -0.25],
      0.010,
      PINK,
      1.5,
    );

    // Side graphic: a large angular lightning bolt.
    b.extrude(
      [
        [0.02, 0.02, "sharp"],
        [0.18, 0.02, "sharp"],
        [0.075, 0.27, "sharp"],
        [0.19, 0.27, "sharp"],
        [-0.03, 0.61, "sharp"],
        [0.025, 0.36, "sharp"],
        [-0.09, 0.36, "sharp"],
      ],
      {
        at: [s * 0.405, 0.0, -0.17],
        x: [0, 0, s],
        y: [0, 1, 0],
        thickness: 0.012,
        color: s > 0 ? MAGENTA : CYAN,
        name: `sideBolt${s}`,
      },
    );

    // Three little starbursts around the side logo.
    for (let i = 0; i < 3; i++) {
      const yy = 0.32 + i * 0.16;
      const zz = -0.02 + (i % 2) * 0.12;
      neonRod([s * 0.414, yy - 0.035, zz], [s * 0.414, yy + 0.035, zz], 0.006, YELLOW, 1.7);
      neonRod([s * 0.414, yy, zz - 0.035], [s * 0.414, yy, zz + 0.035], 0.006, YELLOW, 1.7);
    }

    // Decorative side rivets.
    for (const [y, z] of [
      [0.12, -0.28],
      [0.72, -0.31],
      [1.48, -0.22],
      [1.53, 0.15],
    ] as [number, number][]) {
      cylinder(0.017, 0.012, YELLOW, [s * 0.414, y, z], {
        dir: [s, 0, 0],
        axis: "y",
      });
    }
  }

  // Front bevel rails around the lower cabinet.
  box([0.70, 0.045, 0.045], PURPLE, [0, 0.15, 0.368]);
  box([0.70, 0.045, 0.045], MAGENTA, [0, 0.70, 0.368]);
  box([0.70, 0.025, 0.025], CYAN, [0, 0.18, 0.395]);
  box([0.70, 0.025, 0.025], CYAN, [0, 0.67, 0.395]);

  // CRT monitor hood, angled slightly toward the player.
  const screenDir: [number, number, number] = [0, -0.22, 1];
  box([0.60, 0.57, 0.11], INK, [0, 1.26, 0.335], { dir: screenDir, axis: "z" });
  box([0.55, 0.50, 0.035], DARKMETAL, [0, 1.26, 0.398], { dir: screenDir, axis: "z" });

  const screenTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 220">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#16045c"/>
          <stop offset="0.52" stop-color="#081b64"/>
          <stop offset="1" stop-color="#03051d"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#ffef67"/>
          <stop offset="1" stop-color="#ff329d"/>
        </linearGradient>
      </defs>
      <rect width="320" height="220" fill="url(#bg)"/>
      <circle cx="160" cy="112" r="42" fill="url(#sun)"/>
      <g stroke="#ff4bb2" stroke-width="2" opacity=".85">
        <path d="M0 150H320 M0 164H320 M0 178H320 M0 192H320 M0 206H320"/>
        <path d="M160 150L10 220 M160 150L55 220 M160 150L100 220 M160 150L220 220 M160 150L265 220 M160 150L310 220"/>
      </g>
      <path d="M0 143 L48 127 L87 139 L127 120 L172 132 L220 110 L260 125 L320 101 L320 150 L0 150Z" fill="#091044"/>
      <path d="M95 94 L120 66 L134 91 L157 52 L178 93 L205 72 L223 103" fill="none" stroke="#39f7ff" stroke-width="5"/>
      <path d="M95 94 L120 66 L134 91 L157 52 L178 93 L205 72 L223 103" fill="none" stroke="#ffffff" stroke-width="1.2"/>
      <text x="160" y="30" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="15" font-weight="bold">VECTOR//84</text>
      <text x="17" y="211" fill="#ffe86b" font-family="monospace" font-size="10">1UP 024500</text>
      <text x="245" y="211" fill="#ff5dbb" font-family="monospace" font-size="10">HI 990000</text>
    </svg>`,
    { size: 512 },
  );

  const screen = glow(
    part(new THREE.PlaneGeometry(0.495, 0.405), WHITE, [0, 1.27, 0.421], {
      dir: screenDir,
      axis: "z",
      texture: screenTexture,
      name: "crtScreen",
    }),
    0.6,
  );

  // CRT glass highlight and scanline-like neon edges.
  part(new THREE.PlaneGeometry(0.07, 0.29), "#9bbcff", [0.19, 1.30, 0.426], {
    dir: screenDir,
    axis: "z",
    rotation: [0, 0, -0.12],
    name: "screenReflection",
  });
  neonRod([-0.265, 1.01, 0.405], [0.265, 1.01, 0.405], 0.008, CYAN, 1.8);
  neonRod([-0.265, 1.52, 0.315], [0.265, 1.52, 0.315], 0.009, MAGENTA, 1.8);

  // Four chunky bezel corner caps.
  for (const x of [-0.285, 0.285]) {
    for (const y of [1.015, 1.515]) {
      glowBox([0.035, 0.035, 0.035], x > 0 ? MAGENTA : CYAN, [x, y, 0.435], 1.7, {
        dir: screenDir,
        axis: "z",
      });
    }
  }

  // Control deck: a projecting, sloped shelf.
  box([0.74, 0.13, 0.36], INK, [0, 0.79, 0.36], {
    dir: [0, 0.18, 1],
    axis: "y",
  });
  box([0.69, 0.035, 0.30], BODY2, [0, 0.865, 0.39], {
    dir: [0, 0.18, 1],
    axis: "y",
  });
  neonRod([-0.33, 0.89, 0.41], [0.33, 0.89, 0.41], 0.009, CYAN, 1.8);
  neonRod([-0.32, 0.74, 0.27], [-0.32, 0.88, 0.39], 0.008, MAGENTA, 1.5);
  neonRod([0.32, 0.74, 0.27], [0.32, 0.88, 0.39], 0.008, MAGENTA, 1.5);

  // Joystick base, shaft, ball, and an illuminated collar.
  cylinder(0.075, 0.025, DARKMETAL, [-0.19, 0.905, 0.32], { dir: [0, 1, 0] });
  glowBox([0.11, 0.018, 0.11], MAGENTA, [-0.19, 0.925, 0.32], 1.5);
  rod([-0.19, 0.925, 0.32], [-0.19, 1.035, 0.32], 0.014, METAL);
  glow(part(new THREE.SphereGeometry(0.055, 10, 7), RED, [-0.19, 1.075, 0.32]), 1.2);

  // Button wells and jewel buttons.
  const buttons: [number, string][] = [
    [0.07, YELLOW],
    [0.16, MAGENTA],
    [0.25, CYAN],
  ];
  for (const [x, c] of buttons) {
    cylinder(0.045, 0.018, INK, [x, 0.925, 0.345], { dir: [0, 1, 0] });
    glow(part(new THREE.CylinderGeometry(0.032, 0.032, 0.022, 12), c, [x, 0.943, 0.345]), 1.8);
    cylinder(0.012, 0.005, WHITE, [x - 0.01, 0.958, 0.34], { dir: [0, 1, 0] });
  }

  // Start buttons and tiny instruction label.
  for (const x of [-0.28, 0.29]) {
    cylinder(0.026, 0.015, DARKMETAL, [x, 0.92, 0.20], { dir: [0, 1, 0] });
    glow(part(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 10), x < 0 ? BLUE : ORANGE, [x, 0.937, 0.20]), 1.5);
  }

  const instructionTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 38">
      <rect width="180" height="38" rx="4" fill="#100a29" stroke="#ff37ad" stroke-width="3"/>
      <text x="90" y="16" text-anchor="middle" fill="#20e7ff" font-family="monospace" font-size="9" font-weight="bold">MOVE  FIRE  HYPERJUMP</text>
      <text x="90" y="29" text-anchor="middle" fill="#ffe86b" font-family="monospace" font-size="8">INSERT COIN TO CONTINUE</text>
    </svg>`,
    { size: 256 },
  );
  part(new THREE.PlaneGeometry(0.22, 0.047), WHITE, [0.02, 0.935, 0.18], {
    dir: [0, 1, 0],
    axis: "z",
    texture: instructionTexture,
    name: "controlInstructions",
  });

  // Lower coin door assembly.
  box([0.31, 0.34, 0.035], DARKMETAL, [0, 0.41, 0.378]);
  box([0.27, 0.29, 0.018], INK, [0, 0.41, 0.401]);
  neonRod([-0.13, 0.555, 0.415], [0.13, 0.555, 0.415], 0.006, PURPLE, 1.2);
  neonRod([-0.13, 0.265, 0.415], [0.13, 0.265, 0.415], 0.006, PURPLE, 1.2);

  // Coin slot and return button.
  box([0.075, 0.14, 0.025], METAL, [0, 0.46, 0.425]);
  box([0.042, 0.105, 0.012], INK, [0, 0.46, 0.443]);
  glowBox([0.018, 0.065, 0.008], YELLOW, [0, 0.46, 0.451], 1.8);
  cylinder(0.028, 0.012, RED, [0.09, 0.36, 0.44], { dir: [0, 0, 1], axis: "y" });
  cylinder(0.012, 0.006, WHITE, [0.085, 0.37, 0.448], { dir: [0, 0, 1], axis: "y" });

  // Coin-door screws.
  for (const x of [-0.12, 0.12]) {
    for (const y of [0.275, 0.545]) {
      cylinder(0.012, 0.008, YELLOW, [x, y, 0.425], { dir: [0, 0, 1], axis: "y" });
    }
  }

  // Speaker panel and speaker perforations under the marquee.
  box([0.42, 0.19, 0.025], INK, [0, 1.69, 0.35]);
  box([0.37, 0.145, 0.012], DARKMETAL, [0, 1.69, 0.368]);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const x = -0.15 + col * 0.05;
      const y = 1.64 + row * 0.048;
      cylinder(0.009, 0.008, CYAN, [x, y, 0.38], { dir: [0, 0, 1], axis: "y" });
    }
  }

  // Hero marquee housing.
  box([0.72, 0.22, 0.14], INK, [0, 1.76, 0.18], {
    dir: [0, -0.08, 1],
    axis: "z",
  });
  const marqueeTexture = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 130">
      <defs>
        <linearGradient id="m" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1e0d68"/>
          <stop offset="0.5" stop-color="#ef168d"/>
          <stop offset="1" stop-color="#4212b5"/>
        </linearGradient>
        <filter id="g"><feGaussianBlur stdDeviation="2"/></filter>
      </defs>
      <rect x="5" y="5" width="510" height="120" rx="12" fill="url(#m)" stroke="#20e7ff" stroke-width="6"/>
      <path d="M20 105 L108 18 L185 98 L259 18 L340 103 L430 18 L500 97" fill="none" stroke="#ffec69" stroke-width="4" opacity=".75" filter="url(#g)"/>
      <text x="260" y="79" text-anchor="middle" font-family="sans-serif" font-style="italic" font-weight="900" font-size="58" letter-spacing="4" fill="#fff7c4" stroke="#ff2caa" stroke-width="5" paint-order="stroke">NEON</text>
      <text x="260" y="112" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#20e7ff">VECTOR // 84</text>
    </svg>`,
    { size: 512 },
  );
  glow(
    part(new THREE.PlaneGeometry(0.63, 0.16), WHITE, [0, 1.765, 0.262], {
      dir: [0, -0.08, 1],
      axis: "z",
      texture: marqueeTexture,
      name: "neonMarquee",
    }),
    1.4,
  );

  // Marquee edge tubing.
  neonRod([-0.32, 1.68, 0.275], [0.32, 1.68, 0.275], 0.009, CYAN, 2);
  neonRod([-0.32, 1.85, 0.25], [0.32, 1.85, 0.25], 0.009, MAGENTA, 2);
  neonRod([-0.34, 1.69, 0.27], [-0.34, 1.84, 0.25], 0.009, YELLOW, 1.8);
  neonRod([0.34, 1.69, 0.27], [0.34, 1.84, 0.25], 0.009, YELLOW, 1.8);

  // Tiny marquee corner bolts.
  for (const x of [-0.33, 0.33]) {
    glow(part(new THREE.SphereGeometry(0.018, 8, 5), YELLOW, [x, 1.755, 0.285]), 1.4);
    glow(part(new THREE.SphereGeometry(0.018, 8, 5), YELLOW, [x, 1.84, 0.27]), 1.4);
  }

  // Front lower trim, two glowing chevrons.
  for (const x of [-0.22, 0.22]) {
    b.extrude(
      [
        [0, 0, "sharp"],
        [0.07, 0.05, "sharp"],
        [0.035, 0.05, "sharp"],
        [0.035, 0.13, "sharp"],
        [-0.035, 0.13, "sharp"],
        [-0.035, 0.05, "sharp"],
        [-0.07, 0.05, "sharp"],
      ],
      {
        at: [x, 0.17, 0.418],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        color: x < 0 ? CYAN : MAGENTA,
        name: "frontChevron",
      },
    );
  }

  // A small power badge and illuminated side power switch.
  cylinder(0.038, 0.012, DARKMETAL, [0.27, 0.24, 0.415], { dir: [0, 0, 1], axis: "y" });
  glow(part(new THREE.CircleGeometry(0.025, 12), GREEN, [0.27, 0.24, 0.424], {
    dir: [0, 0, 1],
    axis: "z",
  }), 2);
  box([0.055, 0.09, 0.018], DARKMETAL, [-0.29, 0.27, 0.418]);
  glowBox([0.025, 0.045, 0.008], RED, [-0.29, 0.27, 0.432], 1.6);

  // Rear-facing suggestion: top vent fins visible above the shell.
  for (let i = 0; i < 8; i++) {
    box([0.045, 0.025, 0.20], DARKMETAL, [-0.27 + i * 0.078, 1.58, -0.31]);
  }

  // A final pair of bright corner strips makes the silhouette pop against a dark scene.
  neonRod([-0.37, 0.12, 0.39], [-0.37, 0.69, 0.39], 0.006, BLUE, 1.8);
  neonRod([0.37, 0.12, 0.39], [0.37, 0.69, 0.39], 0.006, PINK, 1.8);

  return b.root;
}
