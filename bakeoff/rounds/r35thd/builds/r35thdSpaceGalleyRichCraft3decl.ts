import * as THREE from "three";
import { createBuilder, rng, svg } from "../../../../src/index";
import type { Fill } from "../../../../src/index";
import {
  gaugeTexture,
  gearGeometry,
  gearTexture,
  metal,
  panelled,
  TINT,
} from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Spaceship Galley",
  description:
    "A densely dressed, retro-industrial spaceship galley kitchen inspired by the worn mechanical interiors of Alien-era spacecraft.",
};

const GALLEY_LABEL = svg(
  `<svg viewBox="0 0 240 64" xmlns="http://www.w3.org/2000/svg">
    <rect width="240" height="64" rx="3" fill="#e8dfc7"/>
    <rect x="4" y="4" width="232" height="56" fill="none" stroke="#211f1b" stroke-width="4"/>
    <path d="M13 13h214M13 51h214" stroke="#8c372c" stroke-width="3"/>
    <text x="120" y="39" text-anchor="middle" font-family="monospace" font-size="25" font-weight="bold" fill="#27251f">NOSTROMO</text>
  </svg>`,
  { size: 256 },
);

const UNIT_LABEL = svg(
  `<svg viewBox="0 0 180 58" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="58" fill="#d9d1b9"/>
    <rect x="5" y="5" width="170" height="48" fill="none" stroke="#26231e" stroke-width="3"/>
    <text x="90" y="24" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="#26231e">GALLEY MODULE</text>
    <text x="90" y="43" text-anchor="middle" font-family="monospace" font-size="12" fill="#8d342a">G-03 / PORT SERVICE</text>
  </svg>`,
  { size: 256 },
);

const WARNING_LABEL = svg(
  `<svg viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">
    <rect width="160" height="90" fill="#e2d6a7"/>
    <path d="M80 8 L151 78 H9 Z" fill="#d29c25" stroke="#211e18" stroke-width="6"/>
    <path d="M80 29v25M80 64v5" stroke="#211e18" stroke-width="8" stroke-linecap="round"/>
    <text x="80" y="87" text-anchor="middle" font-family="monospace" font-size="10" font-weight="bold" fill="#211e18">HOT SURFACE</text>
  </svg>`,
  { size: 256 },
);

const SAFETY_LABEL = svg(
  `<svg viewBox="0 0 210 74" xmlns="http://www.w3.org/2000/svg">
    <rect width="210" height="74" fill="#bf3a2d"/>
    <rect x="4" y="4" width="202" height="66" fill="none" stroke="#f0dfb4" stroke-width="3"/>
    <text x="105" y="29" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#f5e9c9">EMERGENCY</text>
    <text x="105" y="53" text-anchor="middle" font-family="monospace" font-size="18" font-weight="bold" fill="#f5e9c9">SHUTOFF</text>
  </svg>`,
  { size: 256 },
);

const SCREEN_TEXTURE = svg(
  `<svg viewBox="0 0 180 108" xmlns="http://www.w3.org/2000/svg">
    <rect width="180" height="108" fill="#14251f"/>
    <rect x="6" y="6" width="168" height="96" fill="#203e31" stroke="#a6aa80" stroke-width="3"/>
    <g fill="none" stroke="#80d27e" stroke-width="2">
      <path d="M15 25h52l8 8h84M15 43h35l7-7h50l9 7h48M15 63h75l8-8h65M15 83h38l8 7h98"/>
      <path d="M32 14v77M109 14v78M151 14v78"/>
    </g>
    <g fill="#d8d77b" font-family="monospace" font-size="9">
      <text x="14" y="19">GALLEY ENVIRONMENT</text>
      <text x="14" y="101">O2 20.8%  TEMP 19.4C</text>
    </g>
  </svg>`,
  { size: 256 },
);

const MENU_TEXTURE = svg(
  `<svg viewBox="0 0 120 160" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="160" fill="#d8c9a5"/>
    <rect x="5" y="5" width="110" height="150" fill="none" stroke="#383027" stroke-width="3"/>
    <text x="60" y="22" text-anchor="middle" font-family="serif" font-size="12" font-weight="bold" fill="#343029">MESS MENU</text>
    <path d="M18 31h84M18 68h84M18 105h84M18 137h84" stroke="#85775d" stroke-width="2"/>
    <g fill="#4e4537" font-family="monospace" font-size="8">
      <text x="15" y="46">PROTEIN RATION</text>
      <text x="15" y="58">HYDRATED SOUP</text>
      <text x="15" y="83">COFFEE / TEA</text>
      <text x="15" y="95">NUTRIENT PASTE</text>
      <text x="15" y="120">SHIFT SPECIAL</text>
      <text x="15" y="132">ASK GALLEY AI</text>
    </g>
  </svg>`,
  { size: 256 },
);

const PIPING_LABEL = svg(
  `<svg viewBox="0 0 150 44" xmlns="http://www.w3.org/2000/svg">
    <rect width="150" height="44" fill="#c7bfa9"/>
    <text x="75" y="18" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#292723">POTABLE WATER</text>
    <text x="75" y="34" text-anchor="middle" font-family="monospace" font-size="10" fill="#2b5d72">LINE P-07</text>
  </svg>`,
  { size: 256 },
);

const SCREEN_GLOW = "#7dcc78";
const RED_GLOW = "#e43d2f";
const AMBER = "#d29b31";
const INK = "#292620";
const RUBBER = "#17191a";
const GLASS = "#263c3b";

const BRASS = metal("brass", { tarnish: 0.35, verdigris: 0.18, polish: 0.28, seed: 11 });
const OLD_BRASS = metal("brass", { tarnish: 0.7, verdigris: 0.3, polish: 0.08, seed: 14 });
const COPPER = metal("copper", { tarnish: 0.48, verdigris: 0.18, polish: 0.22, seed: 22 });
const STEEL = metal("steel", { tarnish: 0.34, polish: 0.18, seed: 5 });
const BLUED = metal("blued", { tarnish: 0.24, polish: 0.3, seed: 31 });
const IRON = metal("iron", { tarnish: 0.62, polish: 0.12, seed: 8 });
const PANEL = panelled(metal("iron", { tarnish: 0.38, polish: 0.24, seed: 41 }), {
  size: 0.18,
  aspect: 0.7,
  rivets: 0.075,
});
const CREAM_PANEL = panelled(metal("brass", { tarnish: 0.28, polish: 0.2, seed: 48 }), {
  size: 0.22,
  aspect: 0.78,
  rivets: 0.1,
});
const COPPER_PANEL = panelled(COPPER, { size: 0.13, aspect: 0.8, rivets: 0.055 });

const TEMP_GAUGE = gaugeTexture({
  label: "TEMP",
  needle: -28,
  face: "#e7d9b5",
  red: [65, 135],
  size: 192,
});
const PRESSURE_GAUGE = gaugeTexture({
  label: "PSI",
  needle: 51,
  face: "#e7d9b5",
  red: [88, 132],
  size: 192,
});
const FLOW_GAUGE = gaugeTexture({
  label: "FLOW",
  needle: -68,
  face: "#d5dfc8",
  red: [78, 130],
  size: 192,
});

const VALVE_SHAPE = {
  teeth: 12,
  module: 0.009,
  spokes: 4,
  bore: 0.009,
  thickness: 0.018,
};
const VALVE_TEXTURE = gearTexture(VALVE_SHAPE, { size: 128 });

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });
  const random = rng(73);

  const box = (
    size: readonly [number, number, number],
    at: readonly [number, number, number],
    color: Fill,
    name: string,
    texture?: THREE.Texture,
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      color,
      texture,
      flat: true,
      name,
      group: "galley",
    });

  const cyl = (
    radius: number,
    height: number,
    at: readonly [number, number, number],
    color: Fill,
    name: string,
    dir: readonly [number, number, number] = [0, 1, 0],
    sides = 12,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, height, sides, 1), color, {
      at,
      dir,
      axis: "y",
      flat: true,
      name,
      group: "galley",
    });

  const sphere = (
    radius: number,
    at: readonly [number, number, number],
    color: Fill,
    name: string,
    scale?: readonly [number, number, number],
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 6), color, {
      at,
      scale,
      flat: true,
      name,
      group: "galley",
    });

  const rod = (
    a: readonly [number, number, number],
    c: readonly [number, number, number],
    radius: number,
    color: Fill,
    name: string,
  ) =>
    b.rod(a, c, radius, color, {
      caps: "round",
      sides: 8,
      flat: true,
      name,
      group: "galley",
    });

  const torus = (
    major: number,
    minor: number,
    at: readonly [number, number, number],
    color: Fill,
    name: string,
    rotation: readonly [number, number, number] = [90, 0, 0],
  ) =>
    b.part(new THREE.TorusGeometry(major, minor, 6, 12), color, {
      at,
      rotation,
      flat: true,
      name,
      group: "galley",
    });

  const label = (
    width: number,
    height: number,
    at: readonly [number, number, number],
    texture: THREE.Texture,
    name: string,
    color = "#ffffff",
  ) =>
    b.part(new THREE.PlaneGeometry(width, height), color, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      name,
      group: "labels",
    });

  const rivet = (x: number, y: number, z: number, color: Fill, name: string) =>
    sphere(0.018, [x, y, z], color, name, [1, 0.75, 1]);

  const gauge = (
    x: number,
    y: number,
    z: number,
    texture: THREE.Texture,
    color: Fill,
    name: string,
  ) => {
    cyl(0.102, 0.026, [x, y, z], color, `${name}-housing`, [0, 0, 1], 16);
    const face = b.part(new THREE.CircleGeometry(0.084, 20), "#ffffff", {
      at: [x, y, z + 0.016],
      dir: [0, 0, 1],
      axis: "z",
      texture,
      flat: true,
      name: `${name}-face`,
      group: "instrumentation",
    });
    return face;
  };

  const switchToggle = (x: number, y: number, z: number, active: boolean, name: string) => {
    box([0.055, 0.034, 0.018], [x, y, z], IRON, `${name}-base`);
    cyl(0.012, 0.045, [x, y + 0.025, z + 0.018], active ? RED_GLOW : STEEL, `${name}-toggle`, [0, 0, 1], 8);
  };

  const knob = (x: number, y: number, z: number, color: Fill, name: string) => {
    cyl(0.026, 0.018, [x, y, z], color, `${name}-stem`, [0, 0, 1], 10);
    torus(0.028, 0.009, [x, y, z + 0.014], color, `${name}-grip`, [90, 0, 0]);
  };

  // -------------------------------------------------------------------------------------------------------------
  // Room shell, floor, ribs, and structural trim.

  box([3.18, 0.1, 2.08], [0, 0.05, 0], IRON, "floor-deck");
  box([3.12, 0.08, 2.0], [0, 0.13, 0], PANEL, "floor-wear-plate");

  for (const x of [-1.28, -0.64, 0, 0.64, 1.28]) {
    box([0.025, 0.018, 1.88], [x, 0.18, 0], OLD_BRASS, `floor-seam-${x}`);
  }
  for (const z of [-0.72, -0.24, 0.24, 0.72]) {
    box([2.92, 0.018, 0.024], [0, 0.18, z], OLD_BRASS, `floor-cross-seam-${z}`);
  }

  box([3.18, 2.38, 0.14], [0, 1.31, -0.98], PANEL, "rear-bulkhead");
  box([0.14, 2.38, 1.96], [-1.52, 1.31, 0], PANEL, "port-bulkhead");
  box([0.14, 2.38, 1.96], [1.52, 1.31, 0], PANEL, "starboard-bulkhead");
  box([3.18, 0.12, 1.96], [0, 2.51, 0], CREAM_PANEL, "ceiling-panel");

  box([3.05, 0.08, 0.1], [0, 0.22, -0.88], OLD_BRASS, "rear-floor-kick");
  box([0.1, 0.08, 1.78], [-1.42, 0.22, 0], OLD_BRASS, "port-floor-kick");
  box([0.1, 0.08, 1.78], [1.42, 0.22, 0], OLD_BRASS, "starboard-floor-kick");

  for (const x of [-1.35, -0.9, -0.45, 0, 0.45, 0.9, 1.35]) {
    box([0.035, 2.08, 0.035], [x, 1.31, -0.895], OLD_BRASS, `rear-vertical-rib-${x}`);
    rivet(x, 0.35, -0.82, BRASS, `rear-rivet-low-${x}`);
    rivet(x, 2.28, -0.82, BRASS, `rear-rivet-high-${x}`);
  }
  for (const y of [0.42, 0.9, 1.42, 1.94, 2.28]) {
    box([2.98, 0.034, 0.034], [0, y, -0.895], OLD_BRASS, `rear-horizontal-rib-${y}`);
  }

  label(0.82, 0.22, [-0.45, 2.27, -0.815], GALLEY_LABEL, "nostromo-plaque");
  label(0.62, 0.2, [0.54, 0.37, -0.808], UNIT_LABEL, "unit-plaque");

  // Ceiling ribbing and a fluorescent service light.

  for (const x of [-1.3, -0.65, 0, 0.65, 1.3]) {
    box([0.04, 0.07, 1.83], [x, 2.44, 0], OLD_BRASS, `ceiling-rib-${x}`);
  }
  box([1.0, 0.055, 0.22], [0, 2.39, 0.05], IRON, "ceiling-light-housing");
  const ceilingLight = box([0.78, 0.018, 0.09], [0, 2.37, 0.05], "#d8e6c2", "ceiling-light");
  glow(ceilingLight, 0.75);
  for (const x of [-0.36, -0.12, 0.12, 0.36]) {
    cyl(0.014, 0.035, [x, 2.34, 0.05], RED_GLOW, `ceiling-light-led-${x}`, [0, -1, 0], 8);
    glow(b.part(new THREE.SphereGeometry(0.014, 6, 4), RED_GLOW, {
      at: [x, 2.34, 0.05],
      name: `ceiling-led-glow-${x}`,
      group: "lighting",
    }), 1.5);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Rear lower counter and upper storage lockers.

  box([2.8, 0.52, 0.4], [0, 0.72, -0.72], CREAM_PANEL, "rear-lower-cabinet");
  box([2.86, 0.1, 0.46], [0, 1.02, -0.69], OLD_BRASS, "rear-counter-edge");
  box([2.74, 0.07, 0.42], [0, 1.08, -0.69], PANEL, "rear-countertop");

  for (const x of [-1.02, -0.34, 0.34, 1.02]) {
    box([0.62, 0.36, 0.035], [x, 0.7, -0.49], CREAM_PANEL, `rear-door-${x}`);
    box([0.43, 0.025, 0.026], [x, 0.69, -0.465], IRON, `rear-door-inset-${x}`);
    rod([x - 0.11, 0.71, -0.442], [x + 0.11, 0.71, -0.442], 0.012, BRASS, `rear-door-handle-${x}`);
    rivet(x - 0.255, 0.53, -0.45, BRASS, `rear-door-rivet-a-${x}`);
    rivet(x + 0.255, 0.53, -0.45, BRASS, `rear-door-rivet-b-${x}`);
  }

  const lockerXs = [-1.08, -0.36, 0.36, 1.08];
  for (let i = 0; i < lockerXs.length; i++) {
    const x = lockerXs[i];
    box([0.68, 0.58, 0.28], [x, 1.92, -0.73], PANEL, `overhead-locker-${i}`);
    box([0.59, 0.47, 0.035], [x, 1.91, -0.565], CREAM_PANEL, `overhead-door-${i}`);
    box([0.45, 0.018, 0.018], [x, 1.92, -0.54], IRON, `overhead-door-seam-${i}`);
    cyl(0.012, 0.07, [x, 1.91, -0.535], BRASS, `overhead-handle-${i}`, [0, 0, 1], 8);
    rivet(x - 0.245, 2.12, -0.535, BRASS, `locker-rivet-top-${i}`);
    rivet(x + 0.245, 2.12, -0.535, BRASS, `locker-rivet-top2-${i}`);
    rivet(x - 0.245, 1.69, -0.535, BRASS, `locker-rivet-bottom-${i}`);
    rivet(x + 0.245, 1.69, -0.535, BRASS, `locker-rivet-bottom2-${i}`);
  }

  // A labeled service panel between the upper lockers and counter.

  box([1.0, 0.43, 0.09], [0, 1.42, -0.61], IRON, "service-panel");
  box([0.94, 0.37, 0.018], [0, 1.42, -0.557], BLUED, "service-panel-face");
  for (const x of [-0.43, 0.43]) {
    rivet(x, 1.58, -0.54, BRASS, `service-rivet-top-${x}`);
    rivet(x, 1.26, -0.54, BRASS, `service-rivet-bottom-${x}`);
  }

  gauge(-0.3, 1.49, -0.542, TEMP_GAUGE, BRASS, "temp-gauge");
  gauge(0.3, 1.49, -0.542, PRESSURE_GAUGE, BRASS, "pressure-gauge");
  for (const x of [-0.13, 0, 0.13]) {
    const active = x !== 0;
    const led = sphere(0.014, [x, 1.31, -0.548], active ? SCREEN_GLOW : RED_GLOW, `service-led-${x}`);
    glow(led, active ? 1.2 : 0.9);
  }
  switchToggle(-0.28, 1.31, -0.548, true, "service-switch-a");
  switchToggle(0.28, 1.31, -0.548, false, "service-switch-b");

  // Hood, vent, and ducting over the work area.

  box([1.58, 0.1, 0.44], [0, 2.16, -0.31], PANEL, "hood-top");
  box([1.45, 0.48, 0.08], [0, 1.94, -0.43], IRON, "hood-front");
  box([1.3, 0.24, 0.06], [0, 1.74, -0.4], STEEL, "hood-lip");
  for (const x of [-0.58, -0.38, -0.18, 0.02, 0.22, 0.42, 0.62]) {
    box([0.035, 0.2, 0.035], [x, 1.91, -0.352], OLD_BRASS, `hood-vent-slat-${x}`);
  }
  rod([-0.66, 2.25, -0.18], [0.66, 2.25, -0.18], 0.026, COPPER, "hood-copper-header");
  rod([-0.57, 2.25, -0.18], [-0.57, 2.4, -0.18], 0.022, COPPER, "hood-duct-left");
  rod([0.57, 2.25, -0.18], [0.57, 2.4, -0.18], 0.022, COPPER, "hood-duct-right");

  // -------------------------------------------------------------------------------------------------------------
  // Central galley island.

  box([2.5, 0.76, 0.68], [0, 0.58, 0.12], CREAM_PANEL, "island-body");
  box([2.62, 0.1, 0.77], [0, 0.99, 0.12], OLD_BRASS, "island-counter-edge");
  box([2.48, 0.08, 0.7], [0, 1.06, 0.12], PANEL, "island-countertop");
  box([2.44, 0.045, 0.72], [0, 1.105, 0.12], CREAM_PANEL, "island-top-inset");

  for (const x of [-0.91, -0.3, 0.3, 0.91]) {
    box([0.52, 0.55, 0.038], [x, 0.58, 0.477], CREAM_PANEL, `island-front-door-${x}`);
    box([0.39, 0.02, 0.02], [x, 0.58, 0.502], IRON, `island-front-inset-${x}`);
    rod([x - 0.095, 0.61, 0.525], [x + 0.095, 0.61, 0.525], 0.012, BRASS, `island-front-handle-${x}`);
    rivet(x - 0.215, 0.35, 0.53, BRASS, `island-front-rivet-a-${x}`);
    rivet(x + 0.215, 0.35, 0.53, BRASS, `island-front-rivet-b-${x}`);
  }

  // Side gussets and legs.

  for (const x of [-1.1, 1.1]) {
    box([0.12, 0.8, 0.62], [x, 0.55, 0.12], IRON, `island-side-gusset-${x}`);
    box([0.22, 0.12, 0.7], [x, 0.2, 0.12], IRON, `island-foot-${x}`);
    for (const y of [0.35, 0.7]) {
      rivet(x + (x > 0 ? -0.055 : 0.055), y, 0.46, BRASS, `island-side-rivet-${x}-${y}`);
    }
  }

  // Stove plate and four chunky burners.

  box([1.03, 0.028, 0.49], [-0.64, 1.13, 0.04], IRON, "stove-plate");
  box([1.0, 0.012, 0.46], [-0.64, 1.151, 0.04], BLUED, "stove-plate-inset");
  const burners = [
    [-0.92, -0.08],
    [-0.36, -0.08],
    [-0.92, 0.17],
    [-0.36, 0.17],
  ];
  burners.forEach(([x, z], i) => {
    torus(0.115, 0.018, [x, 1.172, z], OLD_BRASS, `burner-ring-${i}`);
    torus(0.065, 0.011, [x, 1.178, z], STEEL, `burner-inner-${i}`);
    cyl(0.026, 0.03, [x, 1.18, z], IRON, `burner-cap-${i}`, [0, 1, 0], 8);
  });
  for (const x of [-0.9, -0.7, -0.5]) {
    knob(x, 0.83, 0.54, BRASS, `stove-knob-${x}`);
  }
  box([0.72, 0.035, 0.07], [-0.64, 0.83, 0.55], IRON, "stove-control-rail");
  label(0.36, 0.1, [-0.64, 0.83, 0.591], WARNING_LABEL, "stove-warning");

  // Sink basin with drain, rim, and utilitarian faucet.

  box([0.78, 0.045, 0.52], [0.67, 1.14, 0.06], IRON, "sink-basin");
  box([0.72, 0.018, 0.46], [0.67, 1.17, 0.06], GLASS, "sink-dark-water");
  for (const x of [0.31, 1.03]) {
    rod([x, 1.18, -0.19], [x, 1.18, 0.3], 0.018, OLD_BRASS, `sink-rim-x-${x}`);
  }
  for (const z of [-0.19, 0.3]) {
    rod([0.31, 1.18, z], [1.03, 1.18, z], 0.018, OLD_BRASS, `sink-rim-z-${z}`);
  }
  cyl(0.043, 0.012, [0.67, 1.185, 0.06], IRON, "sink-drain", [0, 1, 0], 12);
  cyl(0.015, 0.42, [1.1, 1.31, -0.03], COPPER, "faucet-upright", [0, 1, 0], 8);
  rod([1.1, 1.52, -0.03], [0.88, 1.58, -0.03], 0.018, COPPER, "faucet-curve-a");
  rod([0.88, 1.58, -0.03], [0.8, 1.48, -0.03], 0.018, COPPER, "faucet-curve-b");
  cyl(0.025, 0.06, [0.8, 1.445, -0.03], STEEL, "faucet-nozzle", [0, 1, 0], 8);
  knob(1.18, 1.18, -0.3, BRASS, "faucet-hot-knob");
  knob(1.18, 1.18, 0.3, STEEL, "faucet-cold-knob");

  // Oven / microwave module mounted beneath the countertop at the right.

  box([0.88, 0.56, 0.62], [1.02, 0.62, -0.1], PANEL, "oven-module");
  box([0.72, 0.38, 0.035], [1.02, 0.67, 0.218], IRON, "oven-door");
  box([0.6, 0.24, 0.018], [1.02, 0.69, 0.24], GLASS, "oven-window");
  box([0.72, 0.06, 0.025], [1.02, 0.45, 0.24], OLD_BRASS, "oven-door-rail");
  for (const x of [0.84, 1.02, 1.2]) {
    knob(x, 0.86, 0.241, x === 1.02 ? RED_GLOW : BRASS, `oven-control-${x}`);
  }
  const ovenLed = sphere(0.014, [1.31, 0.86, 0.25], RED_GLOW, "oven-red-led");
  glow(ovenLed, 1.4);

  // -------------------------------------------------------------------------------------------------------------
  // Port and starboard side utility areas.

  box([0.74, 0.72, 0.28], [-1.12, 0.67, -0.36], PANEL, "port-appliance-body");
  box([0.58, 0.45, 0.025], [-1.12, 0.78, -0.205], GLASS, "port-appliance-window");
  box([0.62, 0.06, 0.04], [-1.12, 0.48, -0.19], OLD_BRASS, "port-appliance-handle");
  for (const y of [0.55, 0.69, 0.83]) {
    cyl(0.013, 0.04, [-0.76, y, -0.185], BRASS, `port-appliance-led-${y}`, [0, 0, 1], 8);
  }
  label(0.35, 0.12, [-1.12, 0.98, -0.19], UNIT_LABEL, "port-appliance-label");

  box([0.56, 0.52, 0.36], [1.12, 1.35, -0.71], IRON, "small-microwave");
  box([0.4, 0.3, 0.025], [1.02, 1.37, -0.51], GLASS, "small-microwave-window");
  box([0.12, 0.3, 0.03], [1.31, 1.37, -0.5], BLUED, "small-microwave-controls");
  for (const y of [1.27, 1.38, 1.49]) {
    const led = sphere(0.012, [1.31, y, -0.475], y === 1.38 ? SCREEN_GLOW : AMBER, `microwave-led-${y}`);
    glow(led, 1.1);
  }

  // Port wall pipe manifold.

  box([0.48, 0.62, 0.08], [-1.39, 1.22, -0.35], PANEL, "port-pipe-panel");
  for (const y of [1.02, 1.18, 1.34, 1.5]) {
    rod([-1.34, y, -0.31], [-1.34, y, 0.5], 0.022, y < 1.25 ? COPPER : STEEL, `port-vertical-pipe-${y}`);
    cyl(0.045, 0.018, [-1.35, y, 0.53], y < 1.25 ? BRASS : BLUED, `port-pipe-valve-${y}`, [0, 0, 1], 10);
  }
  rod([-1.34, 1.02, 0.5], [-1.05, 1.02, 0.5], 0.026, COPPER, "port-pipe-elbow");
  rod([-1.05, 1.02, 0.5], [-1.05, 1.4, 0.5], 0.026, COPPER, "port-pipe-rise");
  label(0.42, 0.13, [-1.39, 1.72, -0.285], PIPING_LABEL, "port-piping-label");

  // Starboard wall utility rack and emergency box.

  box([0.62, 0.7, 0.12], [1.36, 1.42, -0.58], IRON, "starboard-rack");
  for (const y of [1.17, 1.39, 1.61]) {
    rod([1.12, y, -0.48], [1.6, y, -0.48], 0.018, OLD_BRASS, `starboard-rack-shelf-${y}`);
  }
  for (const y of [1.17, 1.39, 1.61]) {
    box([0.42, 0.02, 0.06], [1.35, y + 0.025, -0.42], CREAM_PANEL, `starboard-rack-lip-${y}`);
  }
  box([0.64, 0.38, 0.1], [1.2, 1.98, -0.54], SAFETY_LABEL, "emergency-box");
  label(0.56, 0.19, [1.2, 1.98, -0.475], SAFETY_LABEL, "emergency-label");
  for (const x of [0.94, 1.46]) {
    rivet(x, 2.13, -0.46, BRASS, `emergency-rivet-${x}`);
    rivet(x, 1.83, -0.46, BRASS, `emergency-rivet-low-${x}`);
  }
  const emergencyLamp = box([0.45, 0.055, 0.08], [1.2, 1.71, -0.44], RED_GLOW, "emergency-lamp");
  glow(emergencyLamp, 1.35);

  // -------------------------------------------------------------------------------------------------------------
  // Rear instrumentation, computer terminal, and valve wheels.

  box([0.84, 0.58, 0.1], [-0.95, 1.49, -0.57], PANEL, "computer-console");
  box([0.62, 0.38, 0.022], [-0.95, 1.55, -0.505], BLUED, "computer-screen-bezel");
  const screen = b.part(new THREE.PlaneGeometry(0.54, 0.3), "#ffffff", {
    at: [-0.95, 1.55, -0.488],
    dir: [0, 0, 1],
    axis: "z",
    texture: SCREEN_TEXTURE,
    name: "computer-screen",
    group: "instrumentation",
  });
  glow(screen, 0.55);
  for (const x of [-1.23, -1.08, -0.93, -0.78, -0.63]) {
    switchToggle(x, 1.19, -0.52, random() > 0.42, `computer-toggle-${x}`);
  }
  label(0.48, 0.13, [-0.95, 1.84, -0.49], UNIT_LABEL, "computer-label");

  for (const x of [-1.18, 1.18]) {
    b.part(gearGeometry(VALVE_SHAPE), TINT.brass, {
      at: [x, 1.63, -0.48],
      dir: [0, 0, 1],
      texture: VALVE_TEXTURE,
      flat: true,
      name: `wall-valve-wheel-${x}`,
      group: "machinery",
    });
    cyl(0.028, 0.06, [x, 1.63, -0.43], STEEL, `wall-valve-axle-${x}`, [0, 0, 1], 8);
  }

  // Ventilation grille on the rear wall.

  box([0.82, 0.42, 0.08], [0.92, 1.43, -0.55], IRON, "rear-vent-frame");
  for (let i = 0; i < 7; i++) {
    const x = 0.58 + i * 0.115;
    box([0.035, 0.3, 0.025], [x, 1.43, -0.495], STEEL, `rear-vent-slat-${i}`);
  }
  for (const x of [0.53, 1.31]) {
    rivet(x, 1.64, -0.48, BRASS, `rear-vent-rivet-top-${x}`);
    rivet(x, 1.22, -0.48, BRASS, `rear-vent-rivet-bottom-${x}`);
  }

  // -------------------------------------------------------------------------------------------------------------
  // Galley clutter: jars, mugs, canisters, utensils, cutting board, knife, and food tray.

  const jar = (
    x: number,
    y: number,
    z: number,
    radius: number,
    height: number,
    body: Fill,
    name: string,
  ) => {
    cyl(radius, height, [x, y, z], body, `${name}-body`, [0, 1, 0], 10);
    cyl(radius * 1.06, 0.018, [x, y + height / 2 + 0.011, z], OLD_BRASS, `${name}-lid`, [0, 1, 0], 10);
    box([radius * 1.55, height * 0.34, 0.012], [x, y, z + radius + 0.006], CREAM_PANEL, `${name}-label`);
  };

  jar(-1.11, 1.24, -0.55, 0.075, 0.16, COPPER, "spice-jar-red");
  jar(-0.91, 1.24, -0.55, 0.065, 0.14, BRASS, "spice-jar-gold");
  jar(-0.72, 1.24, -0.55, 0.07, 0.17, BLUED, "spice-jar-blue");

  const mug = (x: number, z: number, color: Fill, name: string) => {
    b.lathe(
      [
        [0, 0],
        [0.072, 0],
        [0.078, 0.014],
        [0.073, 0.11],
        [0.061, 0.13],
        [0, 0.13],
      ],
      {
        at: [x, 1.16, z],
        axis: [0, 1, 0],
        segments: 10,
        color,
        smoothing: 0,
        name: `${name}-cup`,
        group: "props",
      },
    );
    torus(0.044, 0.012, [x + 0.073, 1.23, z], color, `${name}-handle`, [90, 0, 0]);
    cyl(0.058, 0.012, [x, 1.232, z], GLASS, `${name}-coffee`, [0, 1, 0], 10);
  };

  mug(-0.95, 0.02, CREAM_PANEL, "crew-mug-a");
  mug(-0.78, 0.02, OLD_BRASS, "crew-mug-b");

  jar(0.1, 1.2, 0.48, 0.08, 0.18, IRON, "counter-canister");
  jar(0.29, 1.2, 0.48, 0.065, 0.14, COPPER, "counter-canister-small");

  box([0.42, 0.025, 0.32], [-0.05, 1.18, 0.39], OLD_BRASS, "cutting-board");
  box([0.36, 0.012, 0.26], [-0.05, 1.198, 0.39], "#9d6846", "cutting-board-top");
  rod([-0.18, 1.22, 0.3], [0.1, 1.22, 0.48], 0.012, STEEL, "chef-knife-blade");
  rod([0.1, 1.22, 0.48], [0.18, 1.22, 0.52], 0.022, RUBBER, "chef-knife-handle");

  box([0.42, 0.035, 0.27], [-0.55, 1.18, 0.42], IRON, "meal-tray");
  box([0.34, 0.018, 0.19], [-0.55, 1.205, 0.42], "#b8a36b", "meal-tray-food");
  for (const x of [-0.68, -0.55, -0.42]) {
    sphere(0.035, [x, 1.235, 0.42], x === -0.55 ? "#8c4a36" : "#7c8050", `meal-piece-${x}`);
  }

  // Hanging utensil rail and tools.

  rod([-0.92, 1.86, -0.47], [-0.16, 1.86, -0.47], 0.018, OLD_BRASS, "utensil-rail");
  for (const x of [-0.8, -0.61, -0.42, -0.23]) {
    cyl(0.01, 0.08, [x, 1.79, -0.47], BRASS, `utensil-hook-${x}`, [0, 1, 0], 8);
  }
  rod([-0.8, 1.75, -0.47], [-0.8, 1.44, -0.47], 0.012, STEEL, "hanging-spatula-handle");
  box([0.12, 0.13, 0.018], [-0.8, 1.38, -0.47], STEEL, "hanging-spatula-blade");
  rod([-0.61, 1.75, -0.47], [-0.61, 1.42, -0.47], 0.011, COPPER, "hanging-ladle-handle");
  sphere(0.06, [-0.61, 1.36, -0.47], COPPER, "hanging-ladle-bowl", [1.2, 0.5, 0.7]);
  rod([-0.42, 1.75, -0.47], [-0.42, 1.48, -0.47], 0.01, STEEL, "hanging-whisk-handle");
  for (const x of [-0.46, -0.42, -0.38]) {
    rod([x, 1.48, -0.47], [x + (x - -0.42) * 0.6, 1.37, -0.47], 0.006, STEEL, `whisk-wire-${x}`);
  }

  // A printed meal menu card clipped to the starboard cabinet.

  box([0.28, 0.035, 0.2], [1.05, 1.69, -0.45], BRASS, "menu-card-frame");
  label(0.22, 0.3, [1.05, 1.69, -0.425], MENU_TEXTURE, "meal-menu");

  // -------------------------------------------------------------------------------------------------------------
  // Pipes, conduit, and mechanical service details.

  rod([-1.3, 0.3, -0.7], [-1.3, 1.0, -0.7], 0.025, COPPER, "rear-port-copper-pipe");
  rod([-1.3, 1.0, -0.7], [-0.7, 1.0, -0.7], 0.025, COPPER, "rear-copper-cross-pipe");
  rod([-0.7, 1.0, -0.7], [-0.7, 1.5, -0.7], 0.025, COPPER, "rear-copper-rise");
  for (const y of [0.48, 0.7, 0.92]) {
    cyl(0.042, 0.028, [-1.3, y, -0.7], BRASS, `rear-pipe-collar-${y}`, [0, 1, 0], 10);
  }

  rod([1.3, 0.28, -0.75], [1.3, 1.0, -0.75], 0.023, STEEL, "rear-starboard-pipe");
  rod([1.3, 1.0, -0.75], [0.86, 1.0, -0.75], 0.023, STEEL, "rear-starboard-cross");
  for (const y of [0.45, 0.66, 0.88]) {
    cyl(0.039, 0.03, [1.3, y, -0.75], BLUED, `starboard-pipe-collar-${y}`, [0, 1, 0], 10);
  }

  // Flexible black hoses beneath the sink and oven.

  rod([0.86, 0.94, 0.02], [0.86, 0.48, 0.02], 0.025, RUBBER, "sink-drain-hose");
  rod([0.86, 0.48, 0.02], [0.55, 0.34, 0.02], 0.025, RUBBER, "sink-drain-hose-turn");
  rod([1.12, 0.93, -0.14], [1.12, 0.38, -0.14], 0.02, RUBBER, "oven-cable");
  for (const y of [0.45, 0.62, 0.79]) {
    torus(0.032, 0.007, [1.12, y, -0.14], OLD_BRASS, `oven-cable-clamp-${y}`, [0, 1, 0]);
  }

  // Small pressure canister and thermal bottle on the floor beside the island.

  cyl(0.13, 0.46, [-1.12, 0.42, 0.7], STEEL, "floor-pressure-cylinder", [0, 1, 0], 10);
  cyl(0.09, 0.05, [-1.12, 0.68, 0.7], BRASS, "floor-pressure-valve", [0, 1, 0], 10);
  cyl(0.045, 0.13, [-1.12, 0.76, 0.7], STEEL, "floor-pressure-neck", [0, 1, 0], 10);
  box([0.19, 0.22, 0.012], [-1.12, 0.42, 0.835], WARNING_LABEL, "floor-pressure-warning");
  rod([-1.25, 0.24, 0.7], [-1.0, 0.24, 0.7], 0.025, IRON, "pressure-cylinder-foot");

  cyl(0.1, 0.42, [1.16, 0.37, 0.68], COPPER, "thermal-bottle-body", [0, 1, 0], 10);
  cyl(0.075, 0.08, [1.16, 0.62, 0.68], BRASS, "thermal-bottle-neck", [0, 1, 0], 10);
  cyl(0.085, 0.035, [1.16, 0.68, 0.68], RUBBER, "thermal-bottle-cap", [0, 1, 0], 10);
  box([0.14, 0.16, 0.012], [1.16, 0.38, 0.785], UNIT_LABEL, "thermal-bottle-label");

  // -------------------------------------------------------------------------------------------------------------
  // Sidewall fasteners and small visual noise to sell the industrial construction.

  for (const side of [-1, 1]) {
    for (const y of [0.34, 0.87, 1.4, 1.93, 2.3]) {
      for (const z of [-0.72, -0.18, 0.36, 0.78]) {
        rivet(side * 1.445, y, z, side > 0 ? BRASS : OLD_BRASS, `sidewall-rivet-${side}-${y}-${z}`);
      }
    }
    box([0.04, 0.36, 0.5], [side * 1.4, 2.03, 0.32], IRON, `sidewall-upper-duct-${side}`);
    for (const z of [0.15, 0.25, 0.35, 0.45]) {
      box([0.02, 0.03, 0.08], [side * 1.375, 2.03, z], STEEL, `sidewall-duct-slot-${side}-${z}`);
    }
  }

  // Front edge warning stripes, built as repeated physical plates rather than a texture.

  for (let i = 0; i < 12; i++) {
    const x = -1.35 + i * 0.245;
    const tilt = i % 2 === 0 ? -18 : 18;
    box([0.18, 0.025, 0.035], [x, 0.185, 1.0], i % 2 === 0 ? AMBER : INK, `floor-warning-stripe-${i}`);
    b.part(new THREE.BoxGeometry(0.18, 0.026, 0.036), i % 2 === 0 ? AMBER : INK, {
      at: [x, 0.19, 1.0],
      rotation: [0, tilt, 0],
      flat: true,
      name: `floor-warning-stripe-angled-${i}`,
      group: "safety",
    });
  }

  // Exposed bolts around the island perimeter.

  for (const x of [-1.18, -0.6, 0, 0.6, 1.18]) {
    for (const z of [-0.24, 0.48]) {
      cyl(0.021, 0.018, [x, 1.16, z], BRASS, `island-top-bolt-${x}-${z}`, [0, 1, 0], 6);
    }
  }

  // One final front-facing identity plate and a tiny red status beacon.

  box([0.82, 0.24, 0.045], [0, 1.72, -0.48], CREAM_PANEL, "front-identity-plate");
  label(0.68, 0.16, [0, 1.72, -0.448], GALLEY_LABEL, "front-identity-label");
  cyl(0.035, 0.055, [0.52, 1.72, -0.41], RED_GLOW, "status-beacon", [0, 0, 1], 10);
  glow(
    b.part(new THREE.SphereGeometry(0.036, 8, 5), RED_GLOW, {
      at: [0.52, 1.72, -0.37],
      flat: true,
      name: "status-beacon-glow",
      group: "lighting",
    }),
    1.6,
  );

  return b.root;
}
