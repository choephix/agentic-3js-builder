```ts
import * as THREE from "three";
import { createBuilder, paint, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Nostromo Galley Kitchen",
  description:
    "A dense industrial spaceship galley in the style of Alien (1979): ribbed bulkheads, stained cabinets, a steel sink, hotplate, oven, analog controls, pipes, warning labels, and amber CRT instrumentation.",
};

export default function build() {
  const b = createBuilder({ name: "nostromo_galley", detail: 1 });

  const INK = "#171917";
  const WALL = "#3b413a";
  const WALL_DARK = "#252b28";
  const PANEL = "#55584e";
  const PANEL_LIGHT = "#73776a";
  const STEEL = "#9b9b86";
  const STEEL_DARK = "#4c5049";
  const BLACK = "#111514";
  const RUBBER = "#202523";
  const ORANGE = "#c66e2b";
  const AMBER = "#ffad36";
  const RED = "#b63c2d";
  const GREEN = "#819b69";
  const CREAM = "#c7bda1";
  const BONE = "#9d947c";
  const BLUE = "#5e8790";

  const grime = paint((p, n) => {
    const a = 0.83 + 0.12 * Math.max(0, n.y);
    const streak = 0.04 * Math.sin(p.y * 38 + p.z * 7);
    return [
      Math.max(0, 0.23 * a + streak),
      Math.max(0, 0.25 * a + streak),
      Math.max(0, 0.22 * a + streak),
    ];
  });

  const brushed = paint((p, n) => {
    const v = 0.5 + 0.5 * Math.sin(p.x * 80 + p.y * 9 + p.z * 17);
    const light = 0.84 + v * 0.14 + Math.max(0, n.y) * 0.06;
    return [light * 0.54, light * 0.55, light * 0.49];
  });

  const hazard = svg(
    `<svg viewBox="0 0 128 48" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="48" fill="#131615"/>
      <path d="M4 4h120v40H4z" fill="none" stroke="#d18432" stroke-width="3"/>
      <path d="M12 36L29 12l17 24zm34 0L63 12l17 24zm34 0l17-24 17 24z" fill="#c66e2b"/>
      <path d="M29 19v9m0 4v2M63 19v9m0 4v2M97 19v9m0 4v2" stroke="#171917" stroke-width="4"/>
    </svg>`,
    { size: 256, pixelated: true },
  );

  const galley = svg(
    `<svg viewBox="0 0 180 72" xmlns="http://www.w3.org/2000/svg">
      <rect width="180" height="72" fill="#1b201e"/>
      <path d="M8 9h164v54H8z" fill="#353e38" stroke="#a29e80" stroke-width="3"/>
      <path d="M18 22h144M18 37h144M18 52h144" stroke="#697362" stroke-width="2"/>
      <text x="90" y="34" fill="#d0bb82" font-family="monospace" font-size="14" text-anchor="middle">GALLEY / C-04</text>
      <text x="90" y="50" fill="#8d9b82" font-family="monospace" font-size="9" text-anchor="middle">NARCISSUS SYSTEMS</text>
    </svg>`,
    { size: 360 },
  );

  const crt = svg(
    `<svg viewBox="0 0 160 110" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="110" fill="#101714"/>
      <rect x="9" y="9" width="142" height="78" rx="4" fill="#263f35" stroke="#9a9d78" stroke-width="4"/>
      <path d="M18 70h22l7-33 12 25 9-12 8 8 11-25 9 37h20" fill="none" stroke="#c5ce82" stroke-width="3"/>
      <path d="M18 24h50M18 31h32" stroke="#84936b" stroke-width="2"/>
      <circle cx="129" cy="24" r="5" fill="#ce5a32"/>
      <text x="80" y="103" fill="#c6b680" font-family="monospace" font-size="10" text-anchor="middle">PRESSURE / FLOW</text>
    </svg>`,
    { size: 320 },
  );

  const warning = svg(
    `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#d28a2e"/>
      <path d="M50 14L90 84H10z" fill="#171917"/>
      <path d="M50 33v25m0 10v4" stroke="#d28a2e" stroke-width="8"/>
    </svg>`,
    { size: 128, pixelated: true },
  );

  const status = svg(
    `<svg viewBox="0 0 128 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="128" height="64" fill="#121715"/>
      <text x="8" y="18" fill="#d59b4b" font-family="monospace" font-size="11">GALLEY STATUS</text>
      <circle cx="16" cy="36" r="5" fill="#71a46e"/><text x="28" y="40" fill="#9ba689" font-family="monospace" font-size="10">WATER OK</text>
      <circle cx="16" cy="53" r="5" fill="#c75838"/><text x="28" y="57" fill="#9ba689" font-family="monospace" font-size="10">HEAT OFF</text>
    </svg>`,
    { size: 256 },
  );

  const label = (text: string, color = CREAM) =>
    svg(
      `<svg viewBox="0 0 180 36" xmlns="http://www.w3.org/2000/svg">
        <rect width="180" height="36" fill="#1b201d"/>
        <text x="90" y="24" text-anchor="middle" fill="${color}" font-family="monospace" font-weight="bold" font-size="16">${text}</text>
      </svg>`,
      { size: 360 },
    );

  const box = (
    size: [number, number, number],
    at: [number, number, number],
    color: any,
    opts: any = {},
  ) =>
    b.part(new THREE.BoxGeometry(...size), color, {
      at,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: [number, number, number],
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    sides = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides), color, {
      at,
      dir,
    });

  const button = (x: number, y: number, z: number, color: any, r = 0.018) =>
    cyl(r, 0.018, [x, y, z], color, [0, 0, 1], 10);

  const rivet = (x: number, y: number, z: number, color = STEEL_DARK, r = 0.012) =>
    b.part(new THREE.SphereGeometry(r, 7, 5), color, { at: [x, y, z] });

  const pipe = (
    points: [number, number, number][],
    radius: number,
    color = STEEL_DARK,
  ) => {
    for (let i = 0; i < points.length - 1; i++) b.rod(points[i], points[i + 1], radius, { color });
    for (const p of points) cyl(radius * 1.12, radius * 1.3, p, color, [0, 1, 0], 8);
  };

  // Main freestanding bulkhead and floor plinth.
  box([2.82, 2.28, 0.16], [0, 1.18, -0.56], grime);
  box([2.98, 0.12, 0.76], [0, 0.06, -0.20], WALL_DARK);
  box([2.98, 0.08, 0.78], [0, 0.18, -0.20], PANEL);

  // Vertical structural ribs and overhead beam.
  for (const x of [-1.31, -0.98, -0.65, 0.65, 0.98, 1.31]) {
    box([0.085, 2.1, 0.12], [x, 1.26, -0.44], PANEL_LIGHT);
    rivet(x, 2.17, -0.365);
    rivet(x, 0.35, -0.365);
  }
  box([2.82, 0.16, 0.17], [0, 2.26, -0.45], PANEL_LIGHT);
  box([2.82, 0.07, 0.05], [0, 2.17, -0.34], ORANGE);
  box([2.82, 0.055, 0.05], [0, 2.35, -0.34], CREAM);

  // Large upper storage cabinets.
  box([0.93, 0.63, 0.42], [-0.91, 1.91, -0.16], WALL_DARK);
  box([0.93, 0.63, 0.42], [0.06, 1.91, -0.16], WALL_DARK);
  box([0.93, 0.63, 0.42], [1.03, 1.91, -0.16], WALL_DARK);
  for (const x of [-0.91, 0.06, 1.03]) {
    box([0.82, 0.52, 0.035], [x, 1.91, 0.065], PANEL);
    box([0.82, 0.035, 0.045], [x, 2.16, 0.08], STEEL_DARK);
    box([0.82, 0.035, 0.045], [x, 1.66, 0.08], STEEL_DARK);
    button(x, 1.91, 0.096, ORANGE, 0.022);
    rivet(x - 0.36, 2.12, 0.098, STEEL);
    rivet(x + 0.36, 2.12, 0.098, STEEL);
  }

  // Counter body and thick lip.
  box([2.66, 0.74, 0.67], [0, 0.73, -0.05], WALL_DARK);
  box([2.72, 0.105, 0.73], [0, 1.13, -0.02], brushed);
  box([2.72, 0.045, 0.76], [0, 1.19, -0.02], STEEL_DARK);
  box([2.56, 0.045, 0.04], [0, 1.25, 0.30], ORANGE);

  // Lower cabinet doors and drawers.
  for (const x of [-1.03, -0.35, 0.35, 1.03]) {
    box([0.59, 0.54, 0.045], [x, 0.72, 0.295], PANEL);
    box([0.59, 0.035, 0.05], [x, 0.99, 0.32], STEEL_DARK);
    box([0.59, 0.035, 0.05], [x, 0.45, 0.32], STEEL_DARK);
    button(x, 0.72, 0.335, ORANGE, 0.018);
    rivet(x - 0.25, 0.95, 0.34, STEEL);
    rivet(x + 0.25, 0.95, 0.34, STEEL);
  }

  // Left sink basin with rim, drain and faucet.
  box([0.76, 0.055, 0.52], [-0.88, 1.225, 0.05], STEEL_DARK);
  box([0.65, 0.04, 0.41], [-0.88, 1.252, 0.05], brushed);
  cyl(0.105, 0.012, [-0.88, 1.278, 0.05], BLACK, [0, 1, 0], 16);
  cyl(0.035, 0.018, [-0.88, 1.29, 0.05], STEEL_DARK, [0, 1, 0], 8);
  pipe(
    [
      [-0.56, 1.28, 0.07],
      [-0.48, 1.28, 0.07],
      [-0.48, 1.57, 0.07],
      [-0.62, 1.66, 0.07],
    ],
    0.027,
    STEEL,
  );
  cyl(0.045, 0.08, [-0.48, 1.54, 0.07], STEEL_DARK, [0, 1, 0], 8);
  button(-0.48, 1.31, 0.12, RED, 0.025);

  // Center cooktop: four rugged hotplates and control rail.
  box([0.88, 0.035, 0.53], [0.13, 1.27, 0.05], BLACK);
  for (const x of [-0.16, 0.38]) {
    for (const z of [-0.09, 0.18]) {
      cyl(0.14, 0.025, [x, 1.305, z], STEEL_DARK, [0, 1, 0], 12);
      cyl(0.095, 0.027, [x, 1.322, z], BLACK, [0, 1, 0], 12);
      cyl(0.055, 0.029, [x, 1.337, z], ORANGE, [0, 1, 0], 12);
    }
  }
  box([0.92, 0.14, 0.06], [0.12, 1.405, 0.27], PANEL);
  for (const x of [-0.18, 0.03, 0.24, 0.45]) {
    cyl(0.045, 0.034, [x, 1.49, 0.27], STEEL_DARK, [0, 1, 0], 8);
    button(x, 1.51, 0.31, x === 0.24 ? RED : ORANGE, 0.015);
  }

  // Right oven / warming drawer.
  box([0.82, 0.87, 0.58], [1.02, 0.69, -0.03], BLACK);
  box([0.72, 0.54, 0.045], [1.02, 0.79, 0.29], STEEL_DARK);
  box([0.62, 0.40, 0.025], [1.02, 0.79, 0.32], "#1d2724");
  box([0.74, 0.045, 0.05], [1.02, 1.065, 0.34], STEEL);
  box([0.74, 0.045, 0.05], [1.02, 0.51, 0.34], STEEL);
  pipe(
    [
      [0.72, 1.05, 0.37],
      [1.32, 1.05, 0.37],
    ],
    0.018,
    STEEL,
  );
  for (const x of [0.80, 0.98, 1.16, 1.29]) rivet(x, 1.05, 0.39, ORANGE, 0.014);
  button(1.38, 0.86, 0.36, RED, 0.027);
  button(1.38, 0.72, 0.36, ORANGE, 0.027);
  box([0.65, 0.03, 0.04], [1.02, 0.23, 0.32], PANEL_LIGHT);
  box([0.40, 0.02, 0.018], [1.02, 0.23, 0.35], ORANGE);

  // Left vertical utility console.
  box([0.36, 0.84, 0.06], [-1.28, 0.69, 0.34], PANEL);
  box([0.27, 0.34, 0.025], [-1.28, 0.88, 0.385], BLACK);
  b.part(new THREE.PlaneGeometry(0.25, 0.29), CREAM, {
    at: [-1.28, 0.88, 0.402],
    dir: [0, 0, 1],
    axis: "z",
    texture: status,
  });
  for (const y of [0.57, 0.68, 0.79]) {
    button(-1.28, y, 0.40, y === 0.68 ? RED : GREEN, 0.018);
  }
  box([0.24, 0.06, 0.04], [-1.28, 0.46, 0.40], ORANGE);

  // Upper right CRT housing and screen.
  box([0.78, 0.68, 0.15], [0.84, 1.32, -0.34], BLACK);
  box([0.66, 0.51, 0.035], [0.84, 1.34, -0.255], PANEL);
  b.part(new THREE.PlaneGeometry(0.54, 0.38), "#ffffff", {
    at: [0.84, 1.38, -0.232],
    dir: [0, 0, 1],
    axis: "z",
    texture: crt,
  });
  box([0.62, 0.035, 0.05], [0.84, 1.04, -0.22], STEEL_DARK);
  for (const x of [0.60, 0.75, 0.90, 1.05]) button(x, 1.05, -0.18, AMBER, 0.014);

  // Warning and identity plates.
  b.part(new THREE.PlaneGeometry(0.26, 0.26), "#ffffff", {
    at: [-1.05, 1.40, -0.345],
    dir: [0, 0, 1],
    axis: "z",
    texture: warning,
  });
  b.part(new THREE.PlaneGeometry(0.58, 0.16), "#ffffff", {
    at: [-0.27, 1.43, -0.35],
    dir: [0, 0, 1],
    axis: "z",
    texture: galley,
  });
  b.part(new THREE.PlaneGeometry(0.49, 0.10), "#ffffff", {
    at: [0.40, 0.48, 0.355],
    dir: [0, 0, 1],
    axis: "z",
    texture: label("OVEN / HOT", ORANGE),
  });
  b.part(new THREE.PlaneGeometry(0.53, 0.13), "#ffffff", {
    at: [-0.90, 0.46, 0.36],
    dir: [0, 0, 1],
    axis: "z",
    texture: label("POTABLE WATER", CREAM),
  });

  // Horizontal steam and coolant plumbing across the bulkhead.
  pipe(
    [
      [-1.30, 1.53, -0.28],
      [-1.30, 1.67, -0.28],
      [-0.30, 1.67, -0.28],
      [-0.30, 1.55, -0.28],
    ],
    0.026,
    STEEL_DARK,
  );
  pipe(
    [
      [1.30, 1.53, -0.29],
      [1.30, 1.72, -0.29],
      [0.30, 1.72, -0.29],
      [0.30, 1.56, -0.29],
    ],
    0.019,
    BLUE,
  );
  for (const x of [-1.25, -0.95, -0.65, 0.65, 0.95, 1.25]) {
    cyl(0.048, 0.10, [x, 1.67, -0.28], STEEL_DARK, [1, 0, 0], 8);
  }

  // Cluster of analog gauges above the cooktop.
  for (const x of [-0.28, 0.02, 0.32]) {
    cyl(0.115, 0.035, [x, 1.83, -0.31], STEEL_DARK, [0, 0, 1], 16);
    cyl(0.088, 0.016, [x, 1.83, -0.333], CREAM, [0, 0, 1], 16);
    cyl(0.012, 0.025, [x, 1.83, -0.35], RED, [0, 0, 1], 8);
    b.rod([x, 1.83, -0.353], [x + 0.038, 1.89, -0.353], 0.006, { color: INK });
  }

  // Small amber indicator lamps and exposed fasteners.
  for (const y of [1.48, 1.58, 1.68]) {
    cyl(0.028, 0.018, [1.34, y, -0.34], AMBER, [0, 0, 1], 8);
    cyl(0.012, 0.02, [1.34, y, -0.355], "#fff0a0", [0, 0, 1], 8);
  }
  for (const x of [-1.42, -1.12, -0.82, 0.72, 1.02, 1.32]) {
    rivet(x, 1.34, -0.355, BONE, 0.014);
    rivet(x, 1.02, -0.355, STEEL_DARK, 0.012);
  }

  // Hanging utensils and a magnetic rail, giving the group a lived-in galley silhouette.
  pipe(
    [
      [0.48, 1.48, 0.40],
      [1.25, 1.48, 0.40],
    ],
    0.018,
    STEEL,
  );
  for (const x of [0.62, 0.82, 1.02, 1.20]) {
    cyl(0.018, 0.18, [x, 1.36, 0.40], STEEL, [0, 1, 0], 8);
    b.part(new THREE.BoxGeometry(0.07, 0.12, 0.025), STEEL, {
      at: [x, 1.23, 0.40],
    });
  }

  // Bundled conduit at the right edge and under-counter cable loops.
  pipe(
    [
      [1.43, 0.27, -0.37],
      [1.43, 0.65, -0.37],
      [1.35, 0.83, -0.37],
      [1.35, 1.10, -0.37],
    ],
    0.034,
    RUBBER,
  );
  pipe(
    [
      [1.20, 0.24, 0.37],
      [1.20, 0.12, 0.37],
      [0.82, 0.12, 0.37],
      [0.72, 0.25, 0.37],
    ],
    0.022,
    ORANGE,
  );
  for (const x of [0.76, 1.15, 1.42]) {
    box([0.08, 0.12, 0.08], [x, 0.28, -0.42], STEEL_DARK);
    rivet(x, 0.34, -0.465, ORANGE, 0.014);
  }

  // Repeated panel seams, bolts, and narrow service grilles.
  for (const x of [-1.17, -0.87, -0.57, 0.57, 0.87, 1.17]) {
    box([0.018, 0.29, 0.018], [x, 1.40, -0.355], STEEL_DARK);
  }
  for (const y of [1.31, 1.37, 1.43, 1.49]) {
    box([0.30, 0.012, 0.018], [-1.18, y, -0.36], BLACK);
  }

  return b.root;
}
```