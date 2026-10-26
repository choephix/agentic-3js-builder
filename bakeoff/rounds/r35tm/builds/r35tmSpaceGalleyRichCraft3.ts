import * as THREE from "three";
import {
  createBuilder,
  mottle,
  grain,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Nostromo Alien Galley Kitchen",
  description:
    "A grimy industrial spaceship galley kitchen with ribbed bulkheads, steel cabinets, sink, cooker, oven, overhead lockers, pipework, gauges, warning placards and amber control lights.",
};

export default function build() {
  const b = createBuilder({ name: "nostromoGalley", detail: 1 });

  const STEEL = mottle("#59605b", "#252b2b", { size: 0.22, contrast: 1.4, seed: 7 });
  const DARK_STEEL = mottle("#303838", "#12191a", { size: 0.16, contrast: 1.2, seed: 9 });
  const PALE_STEEL = grain("#a4a69a", "#525952", { size: 0.035, axis: "y", seed: 4 });
  const OLIVE = mottle("#777966", "#393d37", { size: 0.18, contrast: 1.5, seed: 12 });
  const RUBBER = "#171b1a";
  const BLACK = "#080c0b";
  const CREAM = "#c2bda2";
  const RUST = "#763c26";
  const AMBER = "#d88924";
  const RED = "#b53527";
  const GREEN = "#7b9a67";
  const GLASS = "#253331";
  const WHITE = "#d8d5bd";

  const labelGalley = svg(`
    <svg viewBox="0 0 256 64" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="64" fill="#202725" stroke="#b6ad83" stroke-width="5"/>
      <text x="128" y="43" text-anchor="middle" font-family="monospace" font-size="31" font-weight="bold" fill="#d6cda5">GALLEY 03</text>
    </svg>`, { size: 256 });

  const warning = svg(`
    <svg viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="160" height="100" fill="#252a26" stroke="#d8952d" stroke-width="5"/>
      <path d="M80 12 L143 82 L17 82 Z" fill="#d8952d" stroke="#171b19" stroke-width="5"/>
      <path d="M80 35v25 M80 69v5" stroke="#171b19" stroke-width="9" stroke-linecap="round"/>
      <text x="80" y="97" text-anchor="middle" font-family="monospace" font-size="11" fill="#e2d8b1">HOT SURFACE</text>
    </svg>`, { size: 192 });

  const hazard = svg(`
    <svg viewBox="0 0 256 56" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="56" fill="#25221c"/>
      <path d="M0 56L28 0h20L20 56zM70 56L98 0h20L90 56zM140 56l28-56h20l-28 56zM210 56l28-56h20l-28 56z" fill="#c88d2c"/>
      <text x="128" y="37" text-anchor="middle" font-family="monospace" font-size="22" font-weight="bold" fill="#e7d7a0">AUTHORIZED CREW ONLY</text>
    </svg>`, { size: 256 });

  const gaugeFace = svg(`
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <circle cx="64" cy="64" r="59" fill="#c9c3a9" stroke="#131917" stroke-width="7"/>
      <path d="M25 88 A48 48 0 1 1 103 88" fill="none" stroke="#272d29" stroke-width="4"/>
      <path d="M92 31 A48 48 0 0 1 108 65" fill="none" stroke="#a83d2d" stroke-width="8"/>
      <g stroke="#272d29" stroke-width="3">
        <path d="M28 81l8-4M23 65h10M28 46l9 4M41 28l6 9M64 21v11M87 28l-6 9M100 46l-9 4"/>
      </g>
      <path d="M64 64L87 35" stroke="#a52f22" stroke-width="5"/>
      <circle cx="64" cy="64" r="8" fill="#262a26"/>
      <text x="64" y="101" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="13" fill="#202522">O2 PSI</text>
    </svg>`, { size: 256 });

  const button = svg(`
    <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill="#151a18" stroke="#98977d" stroke-width="5"/>
      <circle cx="40" cy="40" r="22" fill="#d88a27" stroke="#34281b" stroke-width="5"/>
      <circle cx="34" cy="33" r="6" fill="#ffe0a0"/>
    </svg>`, { size: 128 });

  const screw = (at: [number, number, number], r = 0.018, color = PALE_STEEL) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.012, 8), color, {
      at,
      dir: [0, 0, 1],
      axis: "y",
      name: "hexRivet",
    });
  };

  const box = (
    at: [number, number, number],
    size: [number, number, number],
    color: any,
    name = "panel",
    texture?: THREE.Texture,
  ) => b.part(new THREE.BoxGeometry(...size), color, {
    at,
    name,
    texture,
  });

  const cyl = (
    at: [number, number, number],
    radius: number,
    height: number,
    color: any,
    dir: [number, number, number] = [0, 1, 0],
    name = "pipe",
    segments = 10,
  ) => b.part(new THREE.CylinderGeometry(radius, radius, height, segments), color, {
    at,
    dir,
    name,
  });

  // Floor, rear bulkhead, and side ribs.
  box([0, 0.045, 0], [3.25, 0.09, 2.15], DARK_STEEL, "deck");
  box([0, 1.3, -0.98], [3.25, 2.55, 0.12], STEEL, "rearBulkhead");
  box([-1.59, 1.3, 0], [0.12, 2.55, 2.05], DARK_STEEL, "leftBulkhead");
  box([1.59, 1.3, 0], [0.12, 2.55, 2.05], DARK_STEEL, "rightBulkhead");

  // Broad structural ribs on the back wall.
  for (const x of [-1.38, -0.78, -0.18, 0.42, 1.02, 1.42]) {
    box([x, 1.34, -0.89], [0.075, 2.28, 0.09], DARK_STEEL, "bulkheadRib");
    for (const y of [0.25, 1.05, 1.86, 2.25]) screw([x, y, -0.825], 0.016);
  }

  // Horizontal utility conduits.
  b.rod([-1.42, 2.25, -0.76], [1.4, 2.25, -0.76], 0.035, {
    color: RUST,
    name: "rustedGasLine",
  });
  b.rod([-1.37, 2.16, -0.7], [1.35, 2.16, -0.7], 0.027, {
    color: PALE_STEEL,
    name: "utilityConduit",
  });
  for (const x of [-1.1, -0.35, 0.4, 1.12]) {
    cyl([x, 2.2, -0.74], 0.055, 0.045, DARK_STEEL, [1, 0, 0], "pipeClamp", 8);
  }

  // Lower galley cabinet carcass.
  box([0, 0.63, -0.14], [3.02, 1.08, 0.72], OLIVE, "cabinetCarcass");
  box([0, 1.16, 0.03], [3.13, 0.12, 0.86], PALE_STEEL, "countertop");
  box([0, 1.23, 0.04], [3.18, 0.055, 0.9], BLACK, "countertopRubberEdge");

  // Cabinet doors and drawers.
  const doors = [
    [-1.25, 0.64, "storageDoor"],
    [-0.72, 0.64, "storageDoor"],
    [0.82, 0.64, "ovenDoor"],
    [1.36, 0.64, "utilityDoor"],
  ] as const;
  for (const [x, y, name] of doors) {
    box([x, y, 0.245], [0.43, 0.86, 0.045], DARK_STEEL, name);
    box([x, y + 0.34, 0.273], [0.31, 0.018, 0.018], PALE_STEEL, "doorHandle");
    screw([x - 0.17, y - 0.34, 0.278], 0.014);
    screw([x + 0.17, y - 0.34, 0.278], 0.014);
  }
  for (const y of [0.32, 0.53, 0.74, 0.95]) {
    box([-0.18, y, 0.28], [0.38, 0.035, 0.018], PALE_STEEL, "drawerPull");
  }

  // Oven door and dark viewing window.
  box([0.82, 0.64, 0.275], [0.39, 0.45, 0.016], BLACK, "ovenWindow");
  box([0.82, 0.64, 0.288], [0.32, 0.34, 0.008], GLASS, "smokedOvenGlass");
  for (const x of [0.63, 1.01]) {
    box([x, 0.64, 0.31], [0.025, 0.49, 0.025], PALE_STEEL, "ovenFrame");
  }
  box([0.82, 0.92, 0.31], [0.42, 0.025, 0.025], PALE_STEEL, "ovenFrame");

  // Sink basin and heavy industrial faucet.
  box([-0.72, 1.22, 0.08], [0.68, 0.08, 0.53], BLACK, "sinkRim");
  box([-0.72, 1.255, 0.08], [0.54, 0.05, 0.4], DARK_STEEL, "sinkBasin");
  cyl([-0.72, 1.29, -0.03], 0.035, 0.012, BLACK, [0, 1, 0], "drain", 8);
  b.rod([-0.42, 1.29, -0.05], [-0.42, 1.72, -0.05], 0.035, { color: PALE_STEEL, name: "faucetStem" });
  b.rod([-0.42, 1.72, -0.05], [-0.67, 1.72, -0.05], 0.035, { color: PALE_STEEL, name: "faucetSpout" });
  cyl([-0.97, 1.32, -0.05], 0.04, 0.07, RED, [0, 1, 0], "hotTap", 8);
  cyl([-0.47, 1.32, -0.05], 0.04, 0.07, GREEN, [0, 1, 0], "coldTap", 8);

  // Four burner plates and pan supports.
  for (const x of [0.28, 0.72]) {
    for (const z of [-0.08, 0.25]) {
      cyl([x, 1.275, z], 0.14, 0.025, BLACK, [0, 1, 0], "burnerPlate", 12);
      cyl([x, 1.297, z], 0.082, 0.018, RUST, [0, 1, 0], "burnerRing", 12);
      for (const a of [0, Math.PI / 2]) {
        b.rod(
          [x - Math.cos(a) * 0.12, 1.315, z - Math.sin(a) * 0.12],
          [x + Math.cos(a) * 0.12, 1.315, z + Math.sin(a) * 0.12],
          0.012,
          { color: PALE_STEEL, name: "burnerGrate" },
        );
      }
    }
  }

  // Stove control strip.
  box([0.55, 1.39, 0.12], [0.78, 0.13, 0.08], DARK_STEEL, "stoveControlStrip");
  for (const x of [0.28, 0.49, 0.7, 0.91]) {
    cyl([x, 1.39, 0.17], 0.035, 0.025, PALE_STEEL, [0, 0, 1], "stoveKnob", 10);
    cyl([x, 1.39, 0.19], 0.012, 0.008, AMBER, [0, 0, 1], "knobMark", 8);
  }

  // Upper overhead lockers.
  box([-0.88, 1.93, -0.58], [1.1, 0.78, 0.62], OLIVE, "upperLocker");
  box([0.45, 1.93, -0.58], [1.45, 0.78, 0.62], OLIVE, "upperLocker");
  for (const x of [-1.24, -0.82, -0.4, -0.05, 0.45, 0.95, 1.4]) {
    box([x, 1.93, -0.245], [0.025, 0.69, 0.025], PALE_STEEL, "lockerSeam");
    box([x + 0.12, 1.93, -0.21], [0.14, 0.035, 0.025], BLACK, "lockerHandle");
  }
  for (const x of [-1.27, -0.48, 0.02, 0.88, 1.46]) {
    screw([x, 2.28, -0.235], 0.017);
    screw([x, 1.58, -0.235], 0.017);
  }

  // Central wall control panel.
  box([1.04, 1.28, -0.79], [0.68, 0.62, 0.045], DARK_STEEL, "controlPanel");
  box([1.04, 1.54, -0.82], [0.51, 0.17, 0.012], BLACK, "controlScreen");
  box([1.04, 1.54, -0.829], [0.42, 0.09, 0.006], GLASS, "greenScreen");
  for (const x of [0.82, 1.04, 1.26]) {
    b.part(new THREE.PlaneGeometry(0.1, 0.1), WHITE, {
      at: [x, 1.25, -0.831],
      dir: [0, 0, 1],
      axis: "z",
      texture: button,
      name: "illuminatedButton",
    });
  }
  for (const y of [1.08, 1.18]) {
    box([1.04, y, -0.832], [0.46, 0.025, 0.008], PALE_STEEL, "controlSlot");
  }

  // Gauge and placards on the rear wall.
  b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.035, 16), PALE_STEEL, {
    at: [-1.28, 1.46, -0.79],
    dir: [0, 0, 1],
    name: "gaugeHousing",
  });
  b.part(new THREE.CircleGeometry(0.155, 20), WHITE, {
    at: [-1.28, 1.46, -0.814],
    dir: [0, 0, 1],
    axis: "z",
    texture: gaugeFace,
    name: "oxygenGauge",
  });
  b.part(new THREE.PlaneGeometry(0.72, 0.18), WHITE, {
    at: [-0.18, 2.43, -0.82],
    dir: [0, 0, 1],
    axis: "z",
    texture: labelGalley,
    name: "galleyLabel",
  });
  b.part(new THREE.PlaneGeometry(0.42, 0.26), WHITE, {
    at: [1.2, 0.83, 0.31],
    dir: [0, 0, 1],
    axis: "z",
    texture: warning,
    name: "hotWarning",
  });
  b.part(new THREE.PlaneGeometry(1.0, 0.22), WHITE, {
    at: [-0.15, 0.18, 0.34],
    dir: [0, 0, 1],
    axis: "z",
    texture: hazard,
    name: "crewHazardStripe",
  });

  // Overhead service rail, hanging utensils, and hooks.
  b.rod([-1.35, 2.34, 0.35], [1.35, 2.34, 0.35], 0.025, {
    color: PALE_STEEL,
    name: "utensilRail",
  });
  for (const x of [-1.05, -0.65, -0.25, 0.22, 0.68, 1.08]) {
    cyl([x, 2.29, 0.35], 0.022, 0.14, PALE_STEEL, [0, -1, 0], "railHook", 8);
  }
  // Ladle, spatula, and a hanging pan.
  b.rod([-0.99, 2.16, 0.35], [-0.99, 1.73, 0.35], 0.014, { color: PALE_STEEL, name: "ladleHandle" });
  cyl([-0.99, 1.67, 0.35], 0.09, 0.022, BLACK, [0, 1, 0], "hangingLadle", 12);
  b.rod([-0.58, 2.16, 0.35], [-0.58, 1.73, 0.35], 0.012, { color: PALE_STEEL, name: "spatulaHandle" });
  box([-0.58, 1.66, 0.35], [0.13, 0.18, 0.018], PALE_STEEL, "hangingSpatula");
  b.rod([0.2, 2.16, 0.35], [0.2, 1.73, 0.35], 0.014, { color: PALE_STEEL, name: "panHandle" });
  cyl([0.2, 1.65, 0.35], 0.18, 0.025, BLACK, [0, 1, 0], "hangingPan", 12);

  // Small shelves and alien utilitarian crockery.
  b.rod([-1.42, 1.78, 0.46], [-0.15, 1.78, 0.46], 0.025, { color: PALE_STEEL, name: "shelfFront" });
  b.rod([-1.42, 1.78, 0.46], [-1.42, 1.78, -0.42], 0.025, { color: PALE_STEEL, name: "shelfSide" });
  for (const x of [-1.18, -0.88, -0.58, -0.3]) {
    cyl([x, 1.88, 0.35], 0.09, 0.15, CREAM, [0, 1, 0], "cup", 10);
    cyl([x, 1.97, 0.35], 0.065, 0.012, BLACK, [0, 1, 0], "cupOpening", 10);
  }

  // Exposed vertical plumbing on the side.
  b.rod([1.4, 0.14, -0.62], [1.4, 2.2, -0.62], 0.045, { color: RUST, name: "verticalGasPipe" });
  b.rod([1.48, 0.14, -0.54], [1.48, 1.9, -0.54], 0.028, { color: PALE_STEEL, name: "verticalWaterPipe" });
  for (const y of [0.42, 1.05, 1.65, 2.12]) {
    cyl([1.44, y, -0.59], 0.07, 0.055, DARK_STEEL, [1, 0, 0], "pipeCollar", 8);
  }

  // Floor drain and two chunky anti-slip strips.
  cyl([-1.25, 0.101, 0.62], 0.13, 0.012, BLACK, [0, 1, 0], "floorDrain", 12);
  cyl([-1.25, 0.11, 0.62], 0.09, 0.014, PALE_STEEL, [0, 1, 0], "drainGrate", 8);
  for (const x of [-0.32, 0.06, 0.44]) {
    box([x, 0.108, 0.66], [0.22, 0.018, 0.05], RUBBER, "antiSlipStrip");
  }

  // Scattered bolts give the whole assembly a hand-maintained, shipboard character.
  for (const p of [
    [-1.48, 0.27, -0.82], [-1.48, 1.12, -0.82], [-0.02, 0.29, -0.82],
    [0.02, 2.3, -0.82], [1.48, 0.28, -0.82], [1.48, 1.14, -0.82],
    [-1.5, 2.31, -0.82], [1.5, 2.31, -0.82],
  ] as [number, number, number][]) screw(p, 0.022, RUST);

  return b.root;
}
