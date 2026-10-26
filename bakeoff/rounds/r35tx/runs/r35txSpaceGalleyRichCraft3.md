```ts
import * as THREE from "three";
import { catmull, createBuilder, svg } from "agentic-3js-builder";
import { gaugeTexture, metal, panelled } from "agentic-3js-builder/kits/clockwork";
import { glow } from "agentic-3js-builder/kits/glow";

type V = [number, number, number];
type Opts = Record<string, any>;

const HULL = panelled(
  metal("iron", { tarnish: 0.62, verdigris: 0.18, polish: 0.08, size: 0.2, seed: 17 }),
  { size: 0.28, aspect: 0.72, rivets: 0.09 },
);
const HULL_DARK = metal("iron", { tarnish: 0.8, verdigris: 0.05, polish: 0.04, size: 0.13, seed: 31 });
const STEEL = metal("steel", { tarnish: 0.28, polish: 0.58, size: 0.07, seed: 4 });
const OLD_STEEL = metal("steel", { tarnish: 0.58, polish: 0.2, size: 0.11, seed: 8 });
const BRASS = metal("brass", { tarnish: 0.5, verdigris: 0.25, polish: 0.22, size: 0.06, seed: 12 });
const COPPER = metal("copper", { tarnish: 0.35, verdigris: 0.38, polish: 0.28, size: 0.08, seed: 6 });
const BRONZE = metal("bronze", { tarnish: 0.62, verdigris: 0.42, polish: 0.12, size: 0.1, seed: 9 });

const BLACK = "#090b0c";
const RUBBER = "#171a19";
const SEAL = "#282a26";
const OLIVE = "#676b5c";
const ENAMEL = "#b5b4a0";
const ENAMEL_DARK = "#7c8073";
const CREAM = "#d6cfb1";
const AMBER = "#ffad38";
const AMBER_DARK = "#7d3d1b";
const RED = "#a62e25";
const RED_LIGHT = "#e05a32";
const BLUE = "#5b9cb0";
const GREEN = "#83a66d";
const PAPER = "#d8d1ae";
const INK = "#171512";

const HAZARD_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 28">
    <rect width="160" height="28" fill="#171612"/>
    <path d="M-18 28L10 0h18L0 28zm38 0L66 0h18L46 28zm38 0L104 0h18L84 28zm38 0L142 0h18l-28 28z" fill="#d39a32"/>
    <path d="M0 4h160M0 24h160" stroke="#9b241d" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const GALLEY_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 72">
    <rect width="320" height="72" rx="4" fill="#22231f" stroke="#bb9b55" stroke-width="3"/>
    <rect x="10" y="10" width="300" height="52" fill="#676a5c" stroke="#131512" stroke-width="3"/>
    <text x="160" y="35" text-anchor="middle" font-family="monospace" font-size="25" font-weight="bold" fill="#ded1a3">GALLEY 04</text>
    <text x="160" y="54" text-anchor="middle" font-family="monospace" font-size="9" letter-spacing="3" fill="#e15a31">FOOD SERVICE / DECK C</text>
  </svg>`,
  { size: 384 },
);

const SERIAL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 44">
    <rect width="240" height="44" fill="#d3cba9"/>
    <rect x="4" y="4" width="232" height="36" fill="#34372f" stroke="#151612" stroke-width="3"/>
    <text x="120" y="20" text-anchor="middle" font-family="monospace" font-size="12" fill="#d8d0ad">NOSTROMO / M-772</text>
    <text x="120" y="33" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="2" fill="#e25b32">AUTHORIZED CREW ONLY</text>
  </svg>`,
  { size: 320 },
);

const CONTROL_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 120">
    <rect width="180" height="120" rx="4" fill="#101514" stroke="#b49a60" stroke-width="4"/>
    <rect x="12" y="12" width="156" height="45" fill="#273d36" stroke="#6d806e" stroke-width="2"/>
    <path d="M20 42h24l8-20 10 27 12-15 8 8h48" fill="none" stroke="#a7d183" stroke-width="3"/>
    <path d="M20 70h140M20 83h120M20 96h70" stroke="#c59d42" stroke-width="3"/>
    <circle cx="138" cy="81" r="10" fill="#a62e25" stroke="#e0aa45" stroke-width="3"/>
    <circle cx="112" cy="101" r="6" fill="#78a5a8"/>
    <circle cx="132" cy="101" r="6" fill="#d39a32"/>
    <circle cx="152" cy="101" r="6" fill="#a5bd72"/>
  </svg>`,
  { size: 256 },
);

const SCREEN_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 120">
    <defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#18312b"/><stop offset="1" stop-color="#091514"/></linearGradient></defs>
    <rect width="220" height="120" fill="#050908" stroke="#b28e46" stroke-width="5"/>
    <rect x="14" y="13" width="192" height="94" fill="url(#g)" stroke="#53786a" stroke-width="2"/>
    <path d="M22 82 C48 18 66 97 92 45 S137 27 156 69 S185 84 199 34" fill="none" stroke="#e2a642" stroke-width="3"/>
    <path d="M22 29h180M22 52h180M22 75h180M22 98h180" stroke="#3c695b" stroke-width="1"/>
    <text x="24" y="25" font-family="monospace" font-size="10" fill="#b0d393">TEMP 064 / FLOW OK</text>
  </svg>`,
  { size: 320 },
);

const VENT_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80">
    <rect width="200" height="80" fill="#171918"/>
    <path d="M5 8h190M5 20h190M5 32h190M5 44h190M5 56h190M5 68h190" stroke="#768078" stroke-width="5"/>
    <path d="M0 0l30 80M45 0l30 80M90 0l30 80M135 0l30 80M180 0l20 54" stroke="#282d2a" stroke-width="5"/>
    <rect x="2" y="2" width="196" height="76" fill="none" stroke="#c19d51" stroke-width="3"/>
  </svg>`,
  { size: 256 },
);

const CAUTION_TEX = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100">
    <rect width="120" height="100" fill="#a33a26" stroke="#e2af45" stroke-width="5"/>
    <path d="M60 18L106 82H14Z" fill="#e1b248" stroke="#201a12" stroke-width="4"/>
    <path d="M60 36v22M60 69v5" stroke="#201a12" stroke-width="7" stroke-linecap="round"/>
    <text x="60" y="96" text-anchor="middle" font-family="monospace" font-size="8" fill="#f4e5b4">HOT SURFACE</text>
  </svg>`,
  { size: 256 },
);

const GAUGE_A = gaugeTexture({ needle: -35, label: "PSI", size: 192 });
const GAUGE_B = gaugeTexture({ needle: 18, label: "TEMP", size: 192 });
const GAUGE_C = gaugeTexture({ needle: 68, label: "FLOW", size: 192 });

function box(
  b: any,
  name: string,
  size: V,
  at: V,
  color: any,
  options: Opts = {},
) {
  return b.part(
    new THREE.BoxGeometry(size[0], size[1], size[2]),
    color,
    { ...options, at, name, flat: options.flat ?? true },
  );
}

function cyl(
  b: any,
  name: string,
  radius: number,
  height: number,
  at: V,
  color: any,
  segments = 10,
  options: Opts = {},
) {
  return b.part(
    new THREE.CylinderGeometry(radius, radius, height, segments, 1, options.openEnded ?? false),
    color,
    { ...options, at, name, flat: options.flat ?? true },
  );
}

function sphere(
  b: any,
  name: string,
  radius: number,
  at: V,
  color: any,
  scale?: V,
  options: Opts = {},
) {
  return b.part(
    new THREE.SphereGeometry(radius, options.widthSegments ?? 10, options.heightSegments ?? 6),
    color,
    { ...options, at, name, scale: scale ?? options.scale, flat: options.flat ?? true },
  );
}

function torus(
  b: any,
  name: string,
  major: number,
  minor: number,
  at: V,
  color: any,
  options: Opts = {},
) {
  return b.part(
    new THREE.TorusGeometry(major, minor, options.radialSegments ?? 6, options.tubularSegments ?? 12),
    color,
    { ...options, at, name, flat: options.flat ?? true },
  );
}

function plane(
  b: any,
  name: string,
  width: number,
  height: number,
  at: V,
  texture: any,
  color: any = "#ffffff",
  options: Opts = {},
) {
  return b.part(
    new THREE.PlaneGeometry(width, height),
    color,
    {
      ...options,
      at,
      name,
      texture,
      axis: "z",
      dir: options.dir ?? [0, 0, 1],
      up: options.up,
    },
  );
}

function rod(
  b: any,
  name: string,
  a: V,
  c: V,
  radius: number,
  color: any,
  options: Opts = {},
) {
  return b.rod(a, c, radius, color, {
    ...options,
    name,
    sides: options.sides ?? 8,
    caps: options.caps ?? "round",
    flat: options.flat ?? true,
  });
}

function curvedPipe(
  b: any,
  name: string,
  points: V[],
  radius: number,
  color: any,
  options: Opts = {},
) {
  return b.sweep(catmull(points), radius, {
    ...options,
    name,
    color,
    sides: options.sides ?? 8,
    caps: options.caps ?? "round",
    smooth: false,
  });
}

function frontRivet(
  b: any,
  name: string,
  x: number,
  y: number,
  z: number,
  radius = 0.018,
  color: any = BRASS,
) {
  return cyl(b, name, radius, 0.018, [x, y, z], color, 8, {
    dir: [0, 0, 1],
    axis: "y",
  });
}

function frontRivetRect(
  b: any,
  prefix: string,
  x0: number,
  x1: number,
  y0: number,
  y1: number,
  z: number,
  color: any = BRASS,
) {
  frontRivet(b, `${prefix}.bl`, x0, y0, z, 0.015, color);
  frontRivet(b, `${prefix}.br`, x1, y0, z, 0.015, color);
  frontRivet(b, `${prefix}.tl`, x0, y1, z, 0.015, color);
  frontRivet(b, `${prefix}.tr`, x1, y1, z, 0.015, color);
}

function frontFrame(
  b: any,
  prefix: string,
  x: number,
  y: number,
  width: number,
  height: number,
  z: number,
  color: any,
  thickness = 0.035,
) {
  box(b, `${prefix}.top`, [width, thickness, 0.035], [x, y + height / 2, z], color);
  box(b, `${prefix}.bottom`, [width, thickness, 0.035], [x, y - height / 2, z], color);
  box(b, `${prefix}.left`, [thickness, height, 0.035], [x - width / 2, y, z], color);
  box(b, `${prefix}.right`, [thickness, height, 0.035], [x + width / 2, y, z], color);
  frontRivetRect(
    b,
    `${prefix}.rivets`,
    x - width / 2 + 0.04,
    x + width / 2 - 0.04,
    y - height / 2 + 0.04,
    y + height / 2 - 0.04,
    z + 0.025,
    BRASS,
  );
}

function handle(
  b: any,
  prefix: string,
  x: number,
  y: number,
  z: number,
  length: number,
  color: any = BRASS,
) {
  rod(b, `${prefix}.bar`, [x - length / 2, y, z], [x + length / 2, y, z], 0.014, color);
  sphere(b, `${prefix}.left`, 0.022, [x - length / 2, y, z], color, undefined, {
    widthSegments: 8,
    heightSegments: 5,
  });
  sphere(b, `${prefix}.right`, 0.022, [x + length / 2, y, z], color, undefined, {
    widthSegments: 8,
    heightSegments: 5,
  });
}

function indicator(
  b: any,
  prefix: string,
  at: V,
  color: string,
  radius = 0.022,
  strength = 1.4,
) {
  const part = cyl(b, prefix, radius, 0.018, at, color, 10, {
    dir: [0, 0, 1],
    axis: "y",
  });
  glow(part, strength);
  return part;
}

function label(
  b: any,
  prefix: string,
  width: number,
  height: number,
  at: V,
  texture: any,
  options: Opts = {},
) {
  return plane(b, prefix, width, height, at, texture, options.color ?? "#ffffff", options);
}

export const meta = {
  name: "Nostromo Galley Kitchen",
  description:
    "A dense Alien-era spaceship galley: ribbed iron bulkheads, enamel cabinets, sink, stove, oven, gauges, ducts, pipes, mugs, controls and amber work lights.",
};

export default function build() {
  const b = createBuilder({
    name: "nostromo-galley-kitchen",
    detail: 1,
    paintSize: 1024,
  });

  // ---------------------------------------------------------------------------
  // Floor deck, walls and the heavy ribbed shell.

  box(b, "deck.floor", [2.82, 0.1, 1.48], [0, 0.05, -0.02], HULL_DARK, {
    group: "shell",
  });
  box(b, "deck.frontThreshold", [2.82, 0.12, 0.1], [0, 0.16, 0.68], HULL, {
    group: "shell",
  });
  box(b, "deck.backSeal", [2.72, 0.08, 0.08], [0, 0.15, -0.64], RUBBER, {
    group: "shell",
  });

  for (let i = 0; i < 7; i++) {
    box(
      b,
      `deck.grip.${i}`,
      [2.48, 0.018, 0.038],
      [0, 0.112, -0.53 + i * 0.18],
      i % 2 ? SEAL : OLD_STEEL,
      { group: "shell" },
    );
  }
  for (let i = 0; i < 8; i++) {
    const x = -1.17 + i * 0.335;
    frontRivet(b, `deck.bolt.front.${i}`, x, 0.125, 0.62, 0.017, BRASS);
    cyl(b, `deck.bolt.top.${i}`, 0.017, 0.012, [x, 0.116, -0.57], BRASS, 8, {
      group: "shell",
    });
  }

  box(b, "bulkhead.back", [2.8, 2.4, 0.14], [0, 1.28, -0.72], HULL, {
    group: "shell",
  });
  box(b, "bulkhead.inset", [2.56, 1.86, 0.032], [0, 1.45, -0.632], HULL_DARK, {
    group: "shell",
  });

  const backRibs = [-1.18, -0.58, 0, 0.58, 1.18];
  for (let i = 0; i < backRibs.length; i++) {
    box(
      b,
      `bulkhead.verticalRib.${i}`,
      [0.075, 1.92, 0.06],
      [backRibs[i], 1.46, -0.595],
      OLD_STEEL,
      { group: "shell" },
    );
  }
  for (let i = 0; i < 4; i++) {
    box(
      b,
      `bulkhead.horizontalRib.${i}`,
      [2.55, 0.06, 0.06],
      [0, 0.63 + i * 0.56, -0.59],
      OLD_STEEL,
      { group: "shell" },
    );
  }

  frontRivetRect(b, "bulkhead.frame", -1.26, 1.26, 0.35, 2.32, -0.55, BRASS);
  for (let i = 0; i < 5; i++) {
    frontRivet(b, `bulkhead.centerBolt.${i}`, -1.31 + i * 0.655, 2.28, -0.545, 0.016, BRASS);
  }

  box(b, "side.left", [0.14, 2.4, 1.4], [-1.37, 1.28, -0.02], HULL, {
    group: "shell",
  });
  box(b, "side.right", [0.14, 2.4, 1.4], [1.37, 1.28, -0.02], HULL, {
    group: "shell",
  });
  box(b, "side.left.innerPanel", [0.028, 1.72, 1.08], [-1.292, 1.42, -0.06], HULL_DARK, {
    group: "shell",
  });
  box(b, "side.right.innerPanel", [0.028, 1.72, 1.08], [1.292, 1.42, -0.06], HULL_DARK, {
    group: "shell",
  });

  for (const side of [-1, 1]) {
    box(b, `side.post.${side}`, [0.11, 2.22, 0.1], [side * 1.27, 1.25, 0.58], OLD_STEEL, {
      group: "shell",
    });
    box(b, `side.post.cap.${side}`, [0.18, 0.12, 0.16], [side * 1.27, 2.35, 0.58], BRASS, {
      group: "shell",
    });
    for (let j = 0; j < 5; j++) {
      frontRivet(b, `side.post.rivet.${side}.${j}`, side * 1.27, 0.55 + j * 0.42, 0.64, 0.014, BRASS);
    }
  }

  box(b, "ceiling.main", [2.82, 0.12, 1.46], [0, 2.48, -0.02], HULL, {
    group: "shell",
  });
  box(b, "ceiling.frontLip", [2.66, 0.14, 0.09], [0, 2.39, 0.66], OLD_STEEL, {
    group: "shell",
  });
  for (let i = 0; i < 6; i++) {
    box(
      b,
      `ceiling.crossRib.${i}`,
      [0.065, 0.08, 1.24],
      [-1.12 + i * 0.448, 2.39, -0.03],
      OLD_STEEL,
      { group: "shell" },
    );
  }
  for (let i = 0; i < 6; i++) {
    frontRivet(b, `ceiling.frontBolt.${i}`, -1.1 + i * 0.44, 2.38, 0.61, 0.014, BRASS);
  }

  // ---------------------------------------------------------------------------
  // Backsplash and the lower industrial cabinet bank.

  box(b, "cabinet.base", [2.62, 0.82, 0.7], [0, 0.55, -0.25], HULL, {
    group: "cabinetry",
  });
  box(b, "cabinet.toeKick", [2.5, 0.14, 0.08], [0, 0.17, 0.13], RUBBER, {
    group: "cabinetry",
  });
  box(b, "cabinet.countertop", [2.76, 0.13, 0.84], [0, 1.025, -0.18], STEEL, {
    group: "cabinetry",
  });
  box(b, "cabinet.counter.frontLip", [2.74, 0.075, 0.055], [0, 1.095, 0.25], BRASS, {
    group: "cabinetry",
  });
  rod(b, "cabinet.counter.edge", [-1.34, 1.09, 0.285], [1.34, 1.09, 0.285], 0.018, OLD_STEEL);

  for (let i = 0; i < 4; i++) {
    const x = -1.0 + i * 0.67;
    box(b, `cabinet.door.${i}`, [0.6, 0.64, 0.032], [x, 0.55, 0.125], OLIVE, {
      group: "cabinetry",
    });
    box(b, `cabinet.door.inset.${i}`, [0.47, 0.49, 0.018], [x, 0.55, 0.148], HULL_DARK, {
      group: "cabinetry",
    });
    frontFrame(b, `cabinet.door.frame.${i}`, x, 0.55, 0.58, 0.62, 0.164, OLD_STEEL, 0.028);
    handle(b, `cabinet.handle.${i}`, x, 0.58, 0.19, 0.2, BRASS);
  }

  for (let i = 0; i < 5; i++) {
    box(b, `cabinet.foot.${i}`, [0.12, 0.12, 0.16], [-1.1 + i * 0.55, 0.13, 0.08], RUBBER, {
      group: "cabinetry",
    });
  }

  const backsplashTiles: V[] = [
    [-1.03, 1.28, -0.608],
    [-0.34, 1.28, -0.608],
    [0.35, 1.28, -0.608],
    [1.04, 1.28, -0.608],
    [-1.03, 1.53, -0.608],
    [-0.34, 1.53, -0.608],
    [0.35, 1.53, -0.608],
    [1.04, 1.53, -0.608],
  ];
  backsplashTiles.forEach((p, i) => {
    box(
      b,
      `backsplash.tile.${i}`,
      [0.61, 0.2, 0.028],
      p,
      i % 3 === 0 ? ENAMEL_DARK : i % 3 === 1 ? HULL_DARK : OLIVE,
      { group: "backsplash" },
    );
    frontRivetRect(b, `backsplash.tile.rivets.${i}`, p[0] - 0.26, p[0] + 0.26, p[1] - 0.07, p[1] + 0.07, -0.584, BRASS);
  });

  // ---------------------------------------------------------------------------
  // Upper cabinets, shelves and the central extraction hood.

  for (const side of [-1, 1]) {
    const x = side * 0.82;
    box(b, `upper.body.${side}`, [1.02, 0.57, 0.46], [x, 1.91, -0.43], HULL, {
      group: "upper-cabinets",
    });
    box(b, `upper.bottom.${side}`, [1.08, 0.075, 0.52], [x, 1.61, -0.38], OLD_STEEL, {
      group: "upper-cabinets",
    });

    for (let j = 0; j < 2; j++) {
      const dx = side * (0.55 + j * 0.01) - side * (0.27 + j * 0.01);
      const doorX = side * (0.55 + j * 0.27);
      box(b, `upper.door.${side}.${j}`, [0.47, 0.47, 0.034], [doorX, 1.92, -0.177], OLIVE, {
        group: "upper-cabinets",
      });
      box(b, `upper.door.inset.${side}.${j}`, [0.36, 0.35, 0.018], [doorX, 1.92, -0.198], HULL_DARK, {
        group: "upper-cabinets",
      });
      frontFrame(b, `upper.frame.${side}.${j}`, doorX, 1.92, 0.45, 0.45, -0.214, OLD_STEEL, 0.023);
      handle(b, `upper.handle.${side}.${j}`, doorX, 1.91, -0.238, 0.14, BRASS);
      void dx;
    }

    box(b, `upper.sideRail.${side}`, [0.07, 0.52, 0.055], [side * 1.33, 1.91, -0.18], BRASS, {
      group: "upper-cabinets",
    });
  }

  box(b, "hood.body", [1.0, 0.27, 0.56], [0, 1.53, -0.16], HULL, {
    group: "extraction",
  });
  box(b, "hood.frontPanel", [0.86, 0.17, 0.045], [0, 1.49, 0.13], HULL_DARK, {
    group: "extraction",
  });
  frontFrame(b, "hood.frontFrame", 0, 1.49, 0.86, 0.16, 0.16, BRASS, 0.023);
  for (let i = 0; i < 7; i++) {
    box(
      b,
      `hood.grille.${i}`,
      [0.69, 0.012, 0.035],
      [-0.345 + i * 0.115, 1.49, 0.188],
      STEEL,
      { group: "extraction" },
    );
  }
  box(b, "hood.chimney", [0.45, 0.58, 0.38], [0, 1.91, -0.42], HULL_DARK, {
    group: "extraction",
  });
  box(b, "hood.chimney.flange", [0.6, 0.055, 0.48], [0, 1.63, -0.4], BRASS, {
    group: "extraction",
  });
  label(b, "hood.serial", 0.36, 0.065, [0, 1.65, -0.145], SERIAL_TEX, {
    color: "#ffffff",
  });

  // ---------------------------------------------------------------------------
  // Sink, faucet, cooktop and oven.

  box(b, "sink.basin", [0.68, 0.12, 0.44], [-0.84, 1.075, -0.13], BLACK, {
    group: "sink",
  });
  box(b, "sink.innerBottom", [0.53, 0.018, 0.3], [-0.84, 1.015, -0.12], SEAL, {
    group: "sink",
  });
  rod(b, "sink.rim.front", [-1.15, 1.135, 0.1], [-0.53, 1.135, 0.1], 0.018, STEEL);
  rod(b, "sink.rim.back", [-1.15, 1.135, -0.36], [-0.53, 1.135, -0.36], 0.018, STEEL);
  rod(b, "sink.rim.left", [-1.16, 1.135, -0.36], [-1.16, 1.135, 0.1], 0.018, STEEL);
  rod(b, "sink.rim.right", [-0.52, 1.135, -0.36], [-0.52, 1.135, 0.1], 0.018, STEEL);

  curvedPipe(
    b,
    "sink.faucet",
    [
      [-0.84, 1.11, -0.38],
      [-0.84, 1.28, -0.38],
      [-0.84, 1.42, -0.31],
      [-0.84, 1.42, -0.12],
      [-0.84, 1.34, -0.06],
    ],
    0.026,
    COPPER,
    { sides: 8 },
  );
  cyl(b, "sink.faucet.base", 0.065, 0.025, [-0.84, 1.115, -0.38], BRASS, 10);
  rod(b, "sink.faucet.handleL", [-0.98, 1.18, -0.36], [-0.98, 1.25, -0.36], 0.018, BRASS);
  rod(b, "sink.faucet.handleR", [-0.7, 1.18, -0.36], [-0.7, 1.25, -0.36], 0.018, BRASS);
  sphere(b, "sink.faucet.knobL", 0.042, [-0.98, 1.26, -0.36], BRASS);
  sphere(b, "sink.faucet.knobR", 0.042, [-0.7, 1.26, -0.36], BRASS);

  box(b, "cooktop.base", [0.84, 0.035, 0.53], [0.18, 1.115, -0.1], BLACK, {
    group: "cooktop",
  });
  frontFrame(b, "cooktop.frame", 0.18, 1.115, 0.82, 0.5, 0.178, STEEL, 0.02);

  const burners: V[] = [
    [0.0, 1.145, -0.27],
    [0.36, 1.145, -0.27],
    [0.0, 1.145, 0.11],
    [0.36, 1.145, 0.11],
  ];
  burners.forEach((p, i) => {
    torus(b, `burner.ring.${i}`, 0.105, 0.014, p, BRASS, {
      dir: [0, 1, 0],
      axis: "z",
      radialSegments: 6,
      tubularSegments: 12,
    });
    cyl(b, `burner.cap.${i}`, 0.045, 0.018, [p[0], p[1] + 0.01, p[2]], OLD_STEEL, 8);
    indicator(b, `burner.led.${i}`, [p[0] + 0.09, 1.145, p[2]], i % 2 ? RED_LIGHT : AMBER, 0.012, 0.8);
  });

  box(b, "cooktop.controls", [0.84, 0.13, 0.055], [0.18, 1.08, 0.27], HULL_DARK, {
    group: "cooktop",
  });
  for (let i = 0; i < 4; i++) {
    cyl(b, `cooktop.knob.${i}`, 0.042, 0.035, [-0.12 + i * 0.2, 1.09, 0.31], BRASS, 10, {
      dir: [0, 0, 1],
      axis: "y",
    });
    box(b, `cooktop.knobMark.${i}`, [0.012, 0.045, 0.008], [-0.12 + i * 0.2, 1.135, 0.33], CREAM, {
      group: "cooktop",
    });
  }

  box(b, "oven.body", [0.72, 0.72, 0.58], [0.92, 0.55, -0.18], HULL_DARK, {
    group: "oven",
  });
  box(b, "oven.window", [0.61, 0.39, 0.025], [0.92, 0.6, 0.125], BLACK, {
    group: "oven",
  });
  plane(b, "oven.window.glass", 0.54, 0.3, [0.92, 0.6, 0.143], SCREEN_TEX, "#ffffff", {
    group: "oven",
  });
  frontFrame(b, "oven.window.frame", 0.92, 0.6, 0.67, 0.45, 0.165, STEEL, 0.035);
  handle(b, "oven.handle", 0.92, 0.86, 0.205, 0.42, BRASS);
  box(b, "oven.control", [0.69, 0.14, 0.05], [0.92, 0.94, 0.12], HULL, {
    group: "oven",
  });
  for (let i = 0; i < 3; i++) {
    cyl(b, `oven.knob.${i}`, 0.038, 0.036, [0.72 + i * 0.2, 0.95, 0.15], BRASS, 10, {
      dir: [0, 0, 1],
      axis: "y",
    });
  }
  indicator(b, "oven.ready", [1.14, 0.95, 0.17], GREEN, 0.018, 1.1);
  label(b, "oven.warning", 0.18, 0.075, [0.92, 0.42, 0.158], CAUTION_TEX, {
    color: "#ffffff",
  });

  // ---------------------------------------------------------------------------
  // Kettle, food containers and a compact shelf of galley objects.

  sphere(b, "kettle.body", 0.18, [0.48, 1.27, 0.08], STEEL, [1.08, 0.8, 0.95], {
    widthSegments: 10,
    heightSegments: 6,
    group: "props",
  });
  cyl(b, "kettle.bottom", 0.14, 0.025, [0.48, 1.12, 0.08], BRASS, 10, {
    group: "props",
  });
  cyl(b, "kettle.lid", 0.105, 0.025, [0.48, 1.42, 0.08], BRASS, 10, {
    group: "props",
  });
  sphere(b, "kettle.lid.knob", 0.032, [0.48, 1.46, 0.08], BRASS);
  curvedPipe(
    b,
    "kettle.spout",
    [
      [0.63, 1.3, 0.08],
      [0.76, 1.35, 0.1],
      [0.81, 1.47, 0.16],
      [0.75, 1.54, 0.18],
    ],
    0.028,
    STEEL,
    { sides: 7 },
  );
  torus(b, "kettle.handle", 0.19, 0.018, [0.48, 1.37, 0.08], BRASS, {
    dir: [0, 0, 1],
    axis: "z",
    rotation: [0, 0, 0],
    radialSegments: 6,
    tubularSegments: 14,
  });

  box(b, "spice.shelf", [0.98, 0.045, 0.3], [0.87, 1.34, -0.32], OLD_STEEL, {
    group: "props",
  });
  rod(b, "spice.shelf.front", [0.4, 1.37, -0.13], [1.34, 1.37, -0.13], 0.014, BRASS);

  const jars = [-0.02, 0.25, 0.52, 0.79, 1.06];
  jars.forEach((x, i) => {
    cyl(b, `spice.jar.${i}`, 0.07, 0.22, [x, 1.49, -0.3], i % 2 ? ENAMEL : CREAM, 10, {
      group: "props",
    });
    cyl(b, `spice.jar.cap.${i}`, 0.075, 0.028, [x, 1.615, -0.3], BRASS, 10, {
      group: "props",
    });
    plane(b, `spice.jar.label.${i}`, 0.1, 0.065, [x, 1.48, -0.229], SERIAL_TEX, "#ffffff", {
      group: "decals",
    });
  });

  // ---------------------------------------------------------------------------
  // Hanging rack, mugs and utensils under the left cabinet.

  rod(b, "mug.rack", [-1.27, 1.5, -0.02], [-0.27, 1.5, -0.02], 0.018, BRASS);
  for (let i = 0; i < 5; i++) {
    const x = -1.17 + i * 0.2;
    rod(b, `mug.hook.${i}`, [x, 1.49, -0.02], [x, 1.39, -0.02], 0.012, STEEL);
  }

  const mugXs = [-1.12, -0.72, -0.32];
  mugXs.forEach((x, i) => {
    cyl(b, `mug.body.${i}`, 0.075, 0.16, [x, 1.31, 0.02], i === 1 ? ENAMEL_DARK : ENAMEL, 10, {
      group: "props",
    });
    torus(b, `mug.handle.${i}`, 0.055, 0.014, [x + 0.075, 1.32, 0.02], BRASS, {
      dir: [0, 0, 1],
      axis: "z",
      radialSegments: 5,
      tubularSegments: 10,
      group: "props",
    });
    torus(b, `mug.band.${i}`, 0.074, 0.008, [x, 1.35, 0.02], i === 1 ? RED : BRASS, {
      dir: [0, 1, 0],
      axis: "z",
      radialSegments: 5,
      tubularSegments: 12,
      group: "props",
    });
    sphere(b, `mug.rim.${i}`, 0.078, [x, 1.395, 0.02], BLACK, [1, 0.18, 1], {
      widthSegments: 8,
      heightSegments: 4,
      group: "props",
    });
  });

  rod(b, "utensil.rail", [-1.2, 1.25, 0.23], [-0.32, 1.25, 0.23], 0.014, STEEL);
  for (let i = 0; i < 4; i++) {
    const x = -1.1 + i * 0.2;
    rod(b, `utensil.handle.${i}`, [x, 1.235, 0.23], [x, 0.98, 0.23], 0.012, i % 2 ? BRASS : STEEL);
    cyl(b, `utensil.tip.${i}`, 0.025, 0.11, [x, 0.94, 0.23], i % 2 ? STEEL : BRASS, 7, {
      dir: [0, 0, 1],
      axis: "y",
      group: "props",
    });
  }

  // ---------------------------------------------------------------------------
  // Instrument wall: gauges, display, switches and warning plates.

  const gaugePositions: V[] = [
    [-1.04, 1.82, -0.575],
    [-0.72, 1.82, -0.575],
    [-1.04, 1.49, -0.575],
  ];
  const gaugeTextures = [GAUGE_A, GAUGE_B, GAUGE_C];
  gaugePositions.forEach((p, i) => {
    cyl(b, `gauge.rim.${i}`, 0.135, 0.035, p, BRASS, 14, {
      dir: [0, 0, 1],
      axis: "y",
      group: "controls",
    });
    cyl(b, `gauge.face.${i}`, 0.112, 0.012, [p[0], p[1], p[2] + 0.022], CREAM, 16, {
      dir: [0, 0, 1],
      axis: "y",
      group: "controls",
    });
    plane(b, `gauge.dial.${i}`, 0.2, 0.2, [p[0], p[1], p[2] + 0.032], gaugeTextures[i], "#ffffff", {
      group: "decals",
    });
  });

  box(b, "control.box", [0.66, 0.5, 0.06], [1.0, 1.72, -0.58], HULL_DARK, {
    group: "controls",
  });
  plane(b, "control.face", 0.59, 0.39, [1.0, 1.72, -0.542], CONTROL_TEX, "#ffffff", {
    group: "decals",
  });
  frontFrame(b, "control.frame", 1.0, 1.72, 0.64, 0.48, -0.53, BRASS, 0.025);

  for (let i = 0; i < 4; i++) {
    const x = 0.78 + i * 0.145;
    box(b, `control.toggle.${i}`, [0.045, 0.09, 0.025], [x, 1.48, -0.52], i === 2 ? RED : STEEL, {
      group: "controls",
    });
    rod(b, `control.toggle.lever.${i}`, [x, 1.54, -0.512], [x + (i % 2 ? 0.018 : -0.018), 1.59, -0.512], 0.009, BRASS);
    indicator(b, `control.indicator.${i}`, [x, 1.91, -0.515], [AMBER, BLUE, RED_LIGHT, GREEN][i], 0.018, 1.2);
  }

  box(b, "screen.housing", [0.82, 0.57, 0.09], [0.35, 2.17, -0.56], HULL, {
    group: "controls",
  });
  plane(b, "screen.display", 0.68, 0.39, [0.35, 2.17, -0.505], SCREEN_TEX, "#ffffff", {
    group: "decals",
  });
  const displayGlow = plane(b, "screen.display.glow", 0.68, 0.39, [0.35, 2.17, -0.503], SCREEN_TEX, "#ffffff", {
    group: "decals",
  });
  glow(displayGlow, 0.75);
  frontRivetRect(b, "screen.rivets", -0.01, 0.71, 1.91, 2.43, -0.495, BRASS);

  const signPlate = b.extrude(
    [
      [0, 0],
      [0.68, 0],
      [0.68, 0.2],
      [0, 0.2],
    ],
    {
      at: [-0.2, 2.18, -0.48],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: BRASS,
      name: "galley.sign.plate",
      group: "decals",
    },
  );
  void signPlate;
  label(b, "galley.sign", 0.61, 0.14, [0.14, 2.28, -0.455], GALLEY_TEX);

  label(b, "hazard.left", 0.52, 0.095, [-1.0, 2.28, -0.49], HAZARD_TEX);
  label(b, "hazard.oven", 0.34, 0.06, [0.91, 1.04, 0.165], HAZARD_TEX);

  box(b, "emergency.box", [0.34, 0.42, 0.12], [1.14, 1.28, -0.5], RED, {
    group: "controls",
  });
  frontFrame(b, "emergency.frame", 1.14, 1.28, 0.3, 0.38, -0.425, BRASS, 0.018);
  label(b, "emergency.label", 0.22, 0.18, [1.14, 1.3, -0.415], CAUTION_TEX);
  indicator(b, "emergency.light", [1.14, 1.55, -0.415], RED_LIGHT, 0.028, 1.6);

  // ---------------------------------------------------------------------------
  // Industrial pipework, corrugated ducts and exposed service lines.

  curvedPipe(
    b,
    "duct.left",
    [
      [-1.12, 2.12, -0.57],
      [-1.12, 2.2, -0.35],
      [-1.12, 2.22, 0.05],
      [-1.06, 2.22, 0.5],
    ],
    0.062,
    HULL_DARK,
    { sides: 7 },
  );
  curvedPipe(
    b,
    "duct.right",
    [
      [1.12, 2.12, -0.57],
      [1.12, 2.22, -0.26],
      [1.12, 2.24, 0.12],
      [1.04, 2.24, 0.5],
    ],
    0.052,
    OLD_STEEL,
    { sides: 7 },
  );

  for (let i = 0; i < 6; i++) {
    torus(b, `duct.left.collar.${i}`, 0.069, 0.009, [-1.12, 2.21, -0.4 + i * 0.18], BRASS, {
      dir: [0, 0, 1],
      axis: "z",
      radialSegments: 6,
      tubularSegments: 12,
      group: "pipework",
    });
  }
  for (let i = 0; i < 6; i++) {
    torus(b, `duct.right.collar.${i}`, 0.059, 0.008, [1.12, 2.23, -0.39 + i * 0.18], BRASS, {
      dir: [0, 0, 1],
      axis: "z",
      radialSegments: 6,
      tubularSegments: 12,
      group: "pipework",
    });
  }

  rod(b, "service.pipe.left", [-1.2, 0.28, -0.57], [-1.2, 2.12, -0.57], 0.034, COPPER);
  rod(b, "service.pipe.left.return", [-1.08, 0.28, -0.53], [-1.08, 2.02, -0.53], 0.022, STEEL);
  rod(b, "service.pipe.right", [1.18, 0.38, -0.57], [1.18, 2.12, -0.57], 0.037, BRASS);
  rod(b, "service.pipe.right.return", [1.06, 0.35, -0.54], [1.06, 1.9, -0.54], 0.022, COPPER);

  for (let i = 0; i < 8; i++) {
    const y = 0.47 + i * 0.19;
    torus(b, `service.left.clamp.${i}`, 0.043, 0.009, [-1.2, y, -0.57], BRASS, {
      dir: [0, 1, 0],
      axis: "z",
      radialSegments: 5,
      tubularSegments: 10,
      group: "pipework",
    });
    torus(b, `service.right.clamp.${i}`, 0.046, 0.009, [1.18, y + 0.1, -0.57], STEEL, {
      dir: [0, 1, 0],
      axis: "z",
      radialSegments: 5,
      tubularSegments: 10,
      group: "pipework",
    });
  }

  curvedPipe(
    b,
    "counter.flex.hose",
    [
      [1.26, 1.12, -0.42],
      [1.28, 1.23, -0.39],
      [1.25, 1.34, -0.33],
      [1.2, 1.4, -0.25],
    ],
    0.018,
    RUBBER,
    { sides: 7 },
  );
  for (let i = 0; i < 5; i++) {
    torus(b, `counter.flex.rib.${i}`, 0.024, 0.006, [1.25, 1.19 + i * 0.045, -0.4 + i * 0.02], STEEL, {
      dir: [0, 1, 0],
      axis: "z",
      radialSegments: 5,
      tubularSegments: 9,
      group: "pipework",
    });
  }

  // ---------------------------------------------------------------------------
  // Overhead work light, ceiling vent and a few final industrial details.

  box(b, "ceiling.lightHousing", [1.62, 0.09, 0.28], [0, 2.38, 0.24], HULL_DARK, {
    group: "lighting",
  });
  box(b, "ceiling.lightTrim", [1.47, 0.035, 0.19], [0, 2.323, 0.24], BRASS, {
    group: "lighting",
  });
  const workLight = box(b, "ceiling.workLight", [1.28, 0.022, 0.105], [0, 2.295, 0.24], AMBER, {
    group: "lighting",
  });
  glow(workLight, 2.3);
  for (let i = 0; i < 5; i++) {
    box(b, `ceiling.lightDivider.${i}`, [0.012, 0.026, 0.115], [-0.5 + i * 0.25, 2.285, 0.24], RED, {
      group: "lighting",
    });
  }

  box(b, "ceiling.ventHousing", [0.76, 0.04, 0.42], [0.98, 2.39, -0.38], HULL_DARK, {
    group: "ventilation",
  });
  plane(b, "ceiling.ventGrille", 0.64, 0.3, [0.98, 2.365, -0.38], VENT_TEX, "#ffffff", {
    dir: [0, -1, 0],
    up: [0, 0, 1],
    group: "ventilation",
  });
  frontRivetRect(b, "ceiling.vent.rivets", 0.64, 1.32, 2.16, 2.6, -0.14, BRASS);

  label(b, "serial.left", 0.55, 0.1, [-1.2, 0.91, 0.17], SERIAL_TEX);
  label(b, "serial.right", 0.48, 0.085, [1.05, 0.22, 0.17], SERIAL_TEX);

  box(b, "small.access.panel", [0.36, 0.34, 0.035], [0.1, 0.36, 0.16], HULL_DARK, {
    group: "cabinetry",
  });
  frontFrame(b, "small.access.frame", 0.1, 0.36, 0.32, 0.3, 0.185, BRASS, 0.018);
  for (let i = 0; i < 3; i++) {
    indicator(b, `small.access.led.${i}`, [-0.01 + i * 0.11, 0.36, 0.21], [GREEN, AMBER, RED_LIGHT][i], 0.014, 1.1);
  }

  // A small row of stamped rivets and warning marks completes the unmistakable
  // utilitarian, lived-in Nostromo silhouette without cluttering the hero forms.
  for (let i = 0; i < 8; i++) {
    frontRivet(b, `counter.rivet.${i}`, -1.27 + i * 0.36, 1.12, 0.29, 0.013, BRASS);
  }
  for (let i = 0; i < 5; i++) {
    box(b, `back.stencil.block.${i}`, [0.15, 0.018, 0.012], [-0.52 + i * 0.23, 2.04, -0.515], RED, {
      group: "decals",
    });
  }

  return b.root;
}
```