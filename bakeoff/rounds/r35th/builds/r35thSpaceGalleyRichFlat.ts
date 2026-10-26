import * as THREE from "three";
import { createBuilder, catmull, svg } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Spaceship Galley",
  description:
    "A detailed industrial spaceship galley kitchen inspired by 1970s working spacecraft interiors: olive panels, riveted bulkheads, tiled backsplash, cooker, sink, coffee station, pipes, storage, utensils, warning placards and fluorescent lights.",
};

type V3 = readonly [number, number, number];

const C = {
  floor: "#252b29",
  floorLight: "#4d554d",
  wall: "#5d6458",
  wallDark: "#343b35",
  olive: "#626a59",
  oliveDark: "#3f4940",
  panel: "#737766",
  panelLight: "#9a9a83",
  edge: "#252c29",
  black: "#111617",
  charcoal: "#1d2422",
  rubber: "#242927",
  steel: "#9b9d8f",
  steelDark: "#555c56",
  steelLight: "#c0bfa7",
  brass: "#aa7a3c",
  brassLight: "#d0a35b",
  copper: "#a85d3f",
  cream: "#d0c6a9",
  paper: "#ded7ba",
  red: "#a53e35",
  redDark: "#632a28",
  amber: "#d39a3b",
  yellow: "#c5a33e",
  blue: "#547b82",
  green: "#607c58",
  glass: "#83a59b",
  white: "#e1dfc6",
};

const GROUP = "galley";

export default function build() {
  const b = createBuilder({ name: "nostromo-galley", detail: 1 });

  const box = (
    size: V3,
    at: V3,
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      flat: true,
      group: GROUP,
      ...opts,
    });

  const cyl = (
    radius: number,
    height: number,
    at: V3,
    color: string,
    radial = 10,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(radius, radius, height, radial, 1, false),
      color,
      { at, flat: true, group: GROUP, ...opts },
    );

  const tapered = (
    top: number,
    bottom: number,
    height: number,
    at: V3,
    color: string,
    radial = 8,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(
      new THREE.CylinderGeometry(top, bottom, height, radial, 1, false),
      color,
      { at, flat: true, group: GROUP, ...opts },
    );

  const sphere = (
    radius: number,
    at: V3,
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.part(new THREE.SphereGeometry(radius, 8, 5), color, {
      at,
      flat: true,
      group: GROUP,
      ...opts,
    });

  const rod = (
    a: V3,
    z: V3,
    radius: number,
    color: string,
    opts: Record<string, unknown> = {},
  ) => b.rod(a, z, radius, { color, group: GROUP, ...opts });

  const pipe = (
    points: V3[],
    radius: number,
    color: string,
    opts: Record<string, unknown> = {},
  ) =>
    b.sweep(catmull(points), radius, {
      color,
      sides: 7,
      caps: "round",
      group: GROUP,
      ...opts,
    });

  const rivet = (at: V3, color = C.steelLight, r = 0.018) =>
    sphere(r, at, color, { name: "rivet" });

  const screw = (at: V3, color = C.brass, r = 0.012) =>
    cyl(r, 0.008, at, color, 8, {
      dir: [0, 0, 1],
      name: "screw",
    });

  const frontPlate = (
    size: V3,
    at: V3,
    color = C.panel,
    trim = C.edge,
    name = "frontPlate",
  ) => {
    box(size, at, color, { name });
    const x = size[0] / 2;
    const y = size[1] / 2;
    const z = size[2] / 2 + 0.006;
    box([size[0] + 0.025, 0.018, 0.018], [at[0], at[1] + y, at[2] + z], trim, {
      name: `${name}-topTrim`,
    });
    box([size[0] + 0.025, 0.018, 0.018], [at[0], at[1] - y, at[2] + z], trim, {
      name: `${name}-bottomTrim`,
    });
    box([0.018, size[1], 0.018], [at[0] - x, at[1], at[2] + z], trim, {
      name: `${name}-leftTrim`,
    });
    box([0.018, size[1], 0.018], [at[0] + x, at[1], at[2] + z], trim, {
      name: `${name}-rightTrim`,
    });
    rivet([at[0] - x + 0.035, at[1] + y - 0.035, at[2] + z + 0.008]);
    rivet([at[0] + x - 0.035, at[1] + y - 0.035, at[2] + z + 0.008]);
    rivet([at[0] - x + 0.035, at[1] - y + 0.035, at[2] + z + 0.008]);
    rivet([at[0] + x - 0.035, at[1] - y + 0.035, at[2] + z + 0.008]);
  };

  const label = (
    text: string,
    at: V3,
    size: V3,
    background = C.black,
    ink = C.cream,
    name = "stencil",
  ) => {
    const texture = svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 96">
        <rect width="256" height="96" fill="${background}"/>
        <rect x="5" y="5" width="246" height="86" fill="none" stroke="${ink}" stroke-width="5"/>
        <text x="128" y="62" fill="${ink}" text-anchor="middle"
          font-family="monospace" font-weight="bold" font-size="34"
          letter-spacing="2">${text}</text>
      </svg>`,
      { size: 256 },
    );
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), ink, {
      at,
      dir: [0, 0, 1],
      axis: "z",
      texture,
      flat: true,
      name,
      group: GROUP,
    });
  };

  const warning = (at: V3, size: V3, text: string, name: string) => {
    const p = label(text, at, size, C.yellow, C.black, name);
    box(
      [size[0] + 0.018, size[1] + 0.018, 0.018],
      [at[0], at[1], at[2] - 0.012],
      C.black,
      { name: `${name}-backing` },
    );
    return p;
  };

  const vent = (
    at: V3,
    width: number,
    height: number,
    slats: number,
    name: string,
  ) => {
    box([width, height, 0.025], at, C.black, { name: `${name}-opening` });
    for (let i = 0; i < slats; i++) {
      const y = at[1] - height / 2 + (i + 0.5) * (height / slats);
      box(
        [width - 0.04, 0.018, 0.035],
        [at[0], y, at[2] + 0.018],
        i % 2 ? C.steelDark : C.steel,
        { name: `${name}-slat-${i}` },
      );
    }
    for (const x of [-width / 2 + 0.025, width / 2 - 0.025]) {
      for (const y of [-height / 2 + 0.025, height / 2 - 0.025]) {
        rivet([at[0] + x, at[1] + y, at[2] + 0.038]);
      }
    }
  };

  const hazardStripe = (
    x: number,
    y: number,
    z: number,
    width: number,
    count: number,
    angle = 0,
    name = "hazard",
  ) => {
    for (let i = 0; i < count; i++) {
      const s = i % 2 === 0 ? C.yellow : C.black;
      box(
        [width / count + 0.008, 0.055, 0.012],
        [x - width / 2 + (i + 0.5) * (width / count), y, z],
        s,
        { rotation: [0, 0, angle], name: `${name}-${i}` },
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Primary room shell: low, heavy, modular and deliberately overbuilt.

  box([3.55, 0.07, 1.95], [0, 0.035, 0], C.floor, {
    name: "deck-plate",
  });
  box([3.25, 0.025, 1.66], [0, 0.087, 0.02], C.floorLight, {
    name: "deck-inset",
  });

  for (const x of [-1.48, -0.74, 0, 0.74, 1.48]) {
    box([0.018, 0.022, 1.58], [x, 0.103, 0.02], C.edge, {
      name: "deck-seam",
    });
  }
  for (const z of [-0.69, -0.23, 0.23, 0.69]) {
    box([3.18, 0.022, 0.018], [0, 0.103, z], C.edge, {
      name: "deck-seam",
    });
  }

  box([3.45, 2.45, 0.12], [0, 1.275, -0.89], C.wallDark, {
    name: "rear-bulkhead",
  });
  box([3.18, 2.16, 0.035], [0, 1.25, -0.815], C.wall, {
    name: "rear-inner-skin",
  });

  box([0.13, 2.25, 1.85], [-1.69, 1.16, 0.02], C.wallDark, {
    name: "left-wall",
  });
  box([0.13, 2.25, 1.85], [1.69, 1.16, 0.02], C.wallDark, {
    name: "right-wall",
  });

  box([3.42, 0.16, 0.17], [0, 2.33, -0.79], C.edge, {
    name: "top-crossbeam",
  });
  box([0.17, 2.33, 0.18], [-1.56, 1.17, -0.78], C.edge, {
    name: "left-rear-upright",
  });
  box([0.17, 2.33, 0.18], [1.56, 1.17, -0.78], C.edge, {
    name: "right-rear-upright",
  });

  for (const x of [-1.54, 1.54]) {
    for (const y of [0.22, 1.0, 1.78, 2.25]) {
      rivet([x, y, -0.69], C.brassLight, 0.022);
    }
  }

  // Exterior-looking vertical ribs on the back bulkhead.
  for (const x of [-1.34, -0.68, 0, 0.68, 1.34]) {
    box([0.045, 2.0, 0.045], [x, 1.23, -0.782], C.wallDark, {
      name: "bulkhead-rib",
    });
    for (const y of [0.35, 1.15, 1.95]) {
      rivet([x, y, -0.75], C.steel, 0.014);
    }
  }

  // ---------------------------------------------------------------------------
  // Lower cabinet run and thick counter.

  box([3.14, 0.17, 0.72], [0, 0.17, -0.06], C.edge, {
    name: "lower-plinth",
  });
  box([3.05, 0.08, 0.69], [0, 0.28, -0.06], C.oliveDark, {
    name: "lower-kickboard",
  });

  const cabinetXs = [-1.14, -0.38, 0.38, 1.14];
  for (let i = 0; i < cabinetXs.length; i++) {
    const x = cabinetXs[i];
    box([0.72, 0.78, 0.59], [x, 0.68, -0.06], C.oliveDark, {
      name: `base-cabinet-${i}`,
    });
    frontPlate(
      [0.63, 0.62, 0.045],
      [x, 0.68, 0.254],
      i === 1 ? C.panel : C.olive,
      C.edge,
      `base-door-${i}`,
    );
    box([0.54, 0.025, 0.035], [x, 0.96, 0.285], C.panelLight, {
      name: `base-door-top-${i}`,
    });
    box([0.54, 0.025, 0.035], [x, 0.40, 0.285], C.wallDark, {
      name: `base-door-bottom-${i}`,
    });
    rod([x - 0.12, 0.68, 0.292], [x + 0.12, 0.68, 0.292], 0.018, C.brass, {
      name: `base-handle-${i}`,
    });
    rivet([x - 0.30, 0.39, 0.292]);
    rivet([x + 0.30, 0.39, 0.292]);
  }

  box([3.18, 0.15, 0.78], [0, 1.095, -0.05], C.counter, {
    name: "countertop",
  });
  box([3.2, 0.045, 0.035], [0, 1.178, 0.34], C.steelDark, {
    name: "counter-front-edge",
  });
  box([3.12, 0.035, 0.035], [0, 1.178, -0.41], C.steelDark, {
    name: "counter-back-edge",
  });
  for (const x of [-1.53, -0.77, 0, 0.77, 1.53]) {
    rivet([x, 1.18, 0.35], C.brassLight, 0.015);
  }

  // Galley station dividers.
  for (const x of [-1.52, -0.76, 0, 0.76, 1.52]) {
    box([0.026, 0.09, 0.73], [x, 1.19, -0.05], C.steelDark, {
      name: "counter-divider",
    });
  }

  // ---------------------------------------------------------------------------
  // Tiled backsplash, with heavy industrial grout.

  box([3.05, 0.68, 0.035], [0, 1.55, -0.785], C.wallDark, {
    name: "backsplash-ground",
  });

  const tileXs = [-1.28, -0.96, -0.64, -0.32, 0, 0.32, 0.64, 0.96, 1.28];
  const tileYs = [1.28, 1.61, 1.94];
  for (let row = 0; row < tileYs.length; row++) {
    for (let col = 0; col < tileXs.length; col++) {
      const x = tileXs[col] + (row % 2 ? 0.16 : 0);
      box([0.285, 0.295, 0.025], [x, tileYs[row], -0.762], row === 1 ? C.panel : C.wall, {
        name: "backsplash-tile",
      });
      box([0.255, 0.012, 0.012], [x, tileYs[row] + 0.14, -0.745], C.steelDark, {
        name: "tile-highlight",
      });
      rivet([x - 0.11, tileYs[row] - 0.11, -0.742], C.brass, 0.009);
    }
  }

  box([3.05, 0.045, 0.055], [0, 1.19, -0.748], C.brass, {
    name: "backsplash-lower-rail",
  });
  box([3.05, 0.04, 0.055], [0, 2.14, -0.75], C.edge, {
    name: "backsplash-upper-rail",
  });

  // ---------------------------------------------------------------------------
  // Four-burner cooker on the left.

  box([1.14, 0.06, 0.52], [-0.98, 1.198, -0.045], C.black, {
    name: "cooker-top",
  });
  box([1.04, 0.025, 0.46], [-0.98, 1.235, -0.045], C.steelDark, {
    name: "cooker-metal-inset",
  });

  const burners: V3[] = [
    [-1.27, 1.255, 0.075],
    [-0.69, 1.255, 0.075],
    [-1.27, 1.255, -0.17],
    [-0.69, 1.255, -0.17],
  ];
  for (let i = 0; i < burners.length; i++) {
    const [x, y, z] = burners[i];
    cyl(0.105, 0.012, [x, y, z], C.edge, 12, { name: `burner-${i}` });
    cyl(0.074, 0.014, [x, y + 0.008, z], C.steelDark, 10, {
      name: `burner-ring-${i}`,
    });
    cyl(0.022, 0.02, [x, y + 0.017, z], C.brass, 8, {
      name: `burner-cap-${i}`,
    });
  }

  box([1.12, 0.16, 0.07], [-0.98, 1.07, 0.34], C.edge, {
    name: "cooker-control-ledge",
  });
  for (const x of [-1.32, -1.1, -0.86, -0.64]) {
    cyl(0.045, 0.035, [x, 1.08, 0.39], C.brass, 10, {
      dir: [0, 0, 1],
      name: "cooker-knob",
    });
    cyl(0.012, 0.041, [x, 1.08, 0.414], C.red, 7, {
      dir: [0, 0, 1],
      name: "knob-marker",
    });
  }
  warning([-0.98, 1.08, 0.425], [0.58, 0.075, 0.012], "HOT", "hot-warning");

  // Heavy oven face below cooker.
  frontPlate([1.08, 0.44, 0.045], [-0.98, 0.65, 0.255], C.panel, C.edge, "oven-door");
  box([0.74, 0.045, 0.17], [-0.98, 0.73, 0.286], C.black, {
    name: "oven-window",
  });
  box([0.68, 0.012, 0.022], [-0.98, 0.81, 0.31], C.steelLight, {
    name: "oven-window-top",
  });
  rod([-1.25, 0.93, 0.31], [-0.71, 0.93, 0.31], 0.021, C.brass, {
    name: "oven-handle",
  });
  label("OVEN", [-0.98, 0.485, 0.305], [0.38, 0.07], C.redDark, C.cream, "oven-label");

  // ---------------------------------------------------------------------------
  // Deep sink and faucet on the right.

  box([0.88, 0.055, 0.54], [0.82, 1.2, -0.02], C.steelDark, {
    name: "sink-deck-cutout",
  });
  box([0.78, 0.18, 0.43], [0.82, 1.125, -0.025], C.black, {
    name: "sink-basin",
  });
  box([0.86, 0.045, 0.06], [0.82, 1.22, 0.255], C.steel, {
    name: "sink-front-rim",
  });
  box([0.86, 0.045, 0.06], [0.82, 1.22, -0.305], C.steel, {
    name: "sink-back-rim",
  });
  box([0.05, 0.045, 0.49], [0.39, 1.22, -0.025], C.steel, {
    name: "sink-left-rim",
  });
  box([0.05, 0.045, 0.49], [1.25, 1.22, -0.025], C.steel, {
    name: "sink-right-rim",
  });
  cyl(0.06, 0.014, [0.82, 1.225, -0.025], C.steel, 12, {
    name: "drain",
  });
  cyl(0.027, 0.025, [0.82, 1.242, -0.025], C.black, 8, {
    name: "drain-hole",
  });

  rod([0.82, 1.23, -0.25], [0.82, 1.58, -0.25], 0.032, C.brass, {
    name: "faucet-upright",
  });
  pipe(
    [
      [0.82, 1.58, -0.25],
      [0.82, 1.68, -0.18],
      [0.82, 1.68, 0.02],
      [0.82, 1.53, 0.12],
    ],
    0.032,
    C.brass,
    { name: "faucet-neck" },
  );
  cyl(0.043, 0.06, [0.82, 1.48, 0.12], C.steelDark, 9, {
    rotation: [90, 0, 0],
    name: "faucet-nozzle",
  });
  cyl(0.045, 0.025, [0.58, 1.235, -0.285], C.red, 9, {
    name: "hot-tap",
  });
  cyl(0.045, 0.025, [1.06, 1.235, -0.285], C.blue, 9, {
    name: "cold-tap",
  });

  // ---------------------------------------------------------------------------
  // Coffee / ration station between the cooker and sink.

  box([0.48, 0.48, 0.36], [-0.02, 1.48, -0.19], C.oliveDark, {
    name: "coffee-machine-body",
  });
  box([0.38, 0.16, 0.025], [-0.02, 1.69, 0.0], C.black, {
    name: "coffee-machine-top",
  });
  box([0.34, 0.18, 0.025], [-0.02, 1.48, 0.005], C.steelDark, {
    name: "coffee-machine-face",
  });
  box([0.18, 0.09, 0.02], [-0.02, 1.54, 0.025], C.glass, {
    name: "coffee-display",
  });
  glow(
    box([0.14, 0.045, 0.008], [-0.02, 1.54, 0.04], C.green, {
      name: "coffee-display-glow",
    }),
    0.8,
  );
  cyl(0.055, 0.03, [-0.14, 1.39, 0.025], C.brass, 10, {
    dir: [0, 0, 1],
    name: "coffee-button",
  });
  cyl(0.055, 0.03, [0.10, 1.39, 0.025], C.red, 10, {
    dir: [0, 0, 1],
    name: "coffee-button",
  });
  box([0.25, 0.09, 0.08], [-0.02, 1.26, 0.02], C.black, {
    name: "coffee-cup-shelf",
  });
  cyl(0.075, 0.09, [-0.02, 1.35, 0.02], C.cream, 10, {
    name: "coffee-mug",
  });
  cyl(0.082, 0.018, [-0.02, 1.395, 0.02], C.black, 10, {
    name: "coffee-mug-rim",
  });
  box([0.38, 0.025, 0.035], [-0.02, 1.74, 0.02], C.steelLight, {
    name: "coffee-machine-top-rail",
  });

  // Three ration tins / ingredient canisters.
  const tins: { x: number; color: string; label: string }[] = [
    { x: 0.18, color: C.red, label: "R" },
    { x: 0.33, color: C.green, label: "F" },
    { x: 0.48, color: C.brass, label: "S" },
  ];
  for (const t of tins) {
    cyl(0.065, 0.16, [t.x, 1.31, 0.18], t.color, 10, {
      name: "ration-tin",
    });
    cyl(0.068, 0.014, [t.x, 1.395, 0.18], C.steelLight, 10, {
      name: "ration-tin-lid",
    });
    cyl(0.04, 0.01, [t.x, 1.404, 0.18], C.black, 8, {
      name: "ration-tin-cap",
    });
    box([0.085, 0.045, 0.008], [t.x, 1.32, 0.25], C.paper, {
      name: `ration-label-${t.label}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Upper cabinets and service lockers.

  box([3.03, 0.74, 0.38], [0, 1.99, -0.61], C.oliveDark, {
    name: "upper-cabinet-bank",
  });
  const upperXs = [-1.08, -0.36, 0.36, 1.08];
  for (let i = 0; i < upperXs.length; i++) {
    const x = upperXs[i];
    frontPlate(
      [0.62, 0.57, 0.045],
      [x, 1.99, -0.40],
      i === 2 ? C.panel : C.olive,
      C.edge,
      `upper-door-${i}`,
    );
    rod([x - 0.14, 1.98, -0.36], [x + 0.14, 1.98, -0.36], 0.017, C.brass, {
      name: `upper-handle-${i}`,
    });
    label(
      i === 0 ? "DRY" : i === 1 ? "CUPS" : i === 2 ? "RATIONS" : "TOOLS",
      [x, 1.76, -0.372],
      [0.34, 0.065],
      C.black,
      C.cream,
      `upper-label-${i}`,
    );
  }
  box([3.1, 0.06, 0.06], [0, 2.37, -0.61], C.steelDark, {
    name: "upper-top-cap",
  });
  for (const x of upperXs) {
    rivet([x - 0.29, 2.27, -0.365]);
    rivet([x + 0.29, 2.27, -0.365]);
  }

  // Narrow open shelf beneath the cabinets.
  box([2.9, 0.055, 0.5], [0, 1.50, -0.49], C.steelDark, {
    name: "open-shelf-back",
  });
  box([3.0, 0.06, 0.42], [0, 1.30, -0.28], C.edge, {
    name: "open-shelf-lip",
  });
  box([3.0, 0.05, 0.05], [0, 1.27, -0.03], C.steel, {
    name: "open-shelf-front-rail",
  });
  for (const x of [-1.28, -0.64, 0, 0.64, 1.28]) {
    box([0.035, 0.05, 0.47], [x, 1.49, -0.28], C.steelDark, {
      name: "shelf-divider",
    });
  }

  // Under-cabinet fluorescent light.
  box([2.72, 0.08, 0.11], [0, 1.265, -0.23], C.black, {
    name: "under-cabinet-light-housing",
  });
  const underLight = box(
    [2.35, 0.035, 0.025],
    [0, 1.265, -0.17],
    C.white,
    { name: "under-cabinet-fluorescent" },
  );
  glow(underLight, 1.6);
  for (const x of [-1.22, 1.22]) {
    box([0.04, 0.09, 0.12], [x, 1.265, -0.22], C.steelDark, {
      name: "light-endcap",
    });
  }

  // ---------------------------------------------------------------------------
  // Shelf contents: mugs, jars, bottles and a folded ration packet.

  const mugs = [
    [-1.22, 1.42, -0.25],
    [-0.98, 1.42, -0.25],
    [1.30, 1.42, -0.25],
  ] as V3[];
  for (let i = 0; i < mugs.length; i++) {
    const [x, y, z] = mugs[i];
    cyl(0.075, 0.16, [x, y + 0.07, z], i === 1 ? C.red : C.cream, 10, {
      name: "shelf-mug",
    });
    cyl(0.083, 0.015, [x, y + 0.153, z], C.black, 10, {
      name: "shelf-mug-rim",
    });
    pipe(
      [
        [x + 0.07, y + 0.12, z],
        [x + 0.13, y + 0.12, z],
        [x + 0.13, y + 0.04, z],
        [x + 0.07, y + 0.04, z],
      ],
      0.012,
      C.cream,
      { name: "mug-handle" },
    );
  }

  const bottles = [
    { x: -0.62, h: 0.28, c: C.blue },
    { x: -0.34, h: 0.22, c: C.green },
    { x: 0.92, h: 0.30, c: C.amber },
    { x: 1.18, h: 0.24, c: C.red },
  ];
  for (const bottle of bottles) {
    tapered(0.05, 0.08, bottle.h, [bottle.x, 1.27 + bottle.h / 2, -0.23], bottle.c, 8, {
      name: "shelf-bottle",
    });
    cyl(0.052, 0.025, [bottle.x, 1.27 + bottle.h + 0.012, -0.23], C.steel, 8, {
      name: "bottle-cap",
    });
    box([0.10, 0.055, 0.008], [bottle.x, 1.27 + bottle.h * 0.52, -0.305], C.paper, {
      name: "bottle-label",
    });
  }

  box([0.30, 0.19, 0.05], [0.35, 1.38, -0.22], C.redDark, {
    rotation: [0, 0, -8],
    name: "ration-packet",
  });
  box([0.24, 0.035, 0.012], [0.35, 1.43, -0.25], C.yellow, {
    rotation: [0, 0, -8],
    name: "ration-packet-band",
  });

  // ---------------------------------------------------------------------------
  // Hanging utensils and rail.

  rod([-1.42, 1.30, -0.19], [1.42, 1.30, -0.19], 0.024, C.brass, {
    name: "utensil-rail",
  });
  for (const x of [-1.30, -0.98, -0.64, 0.04, 0.38, 0.70, 1.08]) {
    cyl(0.025, 0.07, [x, 1.30, -0.19], C.steelDark, 8, {
      name: "utensil-hook",
    });
    cyl(0.018, 0.07, [x, 1.24, -0.19], C.brass, 8, {
      name: "utensil-hook-ring",
    });
  }

  // Ladle.
  rod([-1.30, 1.18, -0.19], [-1.30, 0.82, -0.19], 0.014, C.steelLight, {
    name: "ladle-handle",
  });
  cyl(0.075, 0.026, [-1.30, 0.77, -0.19], C.steelLight, 12, {
    dir: [0, 0, 1],
    name: "ladle-bowl",
  });

  // Spatula.
  box([0.045, 0.34, 0.018], [-0.98, 1.01, -0.19], C.steelLight, {
    rotation: [0, 0, -5],
    name: "spatula-blade",
  });
  rod([-0.98, 1.18, -0.19], [-0.98, 1.40, -0.19], 0.014, C.steelDark, {
    name: "spatula-handle",
  });

  // Knife with a broad, simple blade.
  b.extrude(
    [
      [0, 0],
      [0.25, 0],
      [0.30, 0.055],
      [0.25, 0.10],
      [0, 0.10],
    ],
    {
      at: [-0.64, 0.90, -0.20],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.016,
      color: C.steelLight,
      bevel: 0.003,
      group: GROUP,
      name: "hanging-knife-blade",
    },
  );
  rod([-0.44, 0.95, -0.20], [-0.29, 0.95, -0.20], 0.026, C.redDark, {
    name: "knife-handle",
  });

  // Fork and spoon as deliberately chunky silhouette pieces.
  rod([0.04, 1.17, -0.19], [0.04, 0.82, -0.19], 0.012, C.steelLight, {
    name: "fork-handle",
  });
  for (const dx of [-0.025, 0, 0.025]) {
    rod([0.04 + dx, 0.82, -0.19], [0.04 + dx, 0.70, -0.19], 0.006, C.steelLight, {
      name: "fork-tine",
    });
  }
  rod([0.38, 1.17, -0.19], [0.38, 0.84, -0.19], 0.012, C.steelLight, {
    name: "spoon-handle",
  });
  cyl(0.055, 0.018, [0.38, 0.78, -0.19], C.steelLight, 10, {
    dir: [0, 0, 1],
    name: "spoon-bowl",
  });

  // ---------------------------------------------------------------------------
  // Left-side dry stores and a little service panel.

  box([0.42, 0.78, 0.42], [-1.46, 0.90, 0.02], C.panel, {
    name: "side-store",
  });
  frontPlate([0.32, 0.61, 0.035], [-1.46, 0.90, 0.245], C.olive, C.edge, "side-store-door");
  box([0.04, 0.34, 0.025], [-1.46, 0.91, 0.275], C.black, {
    name: "side-store-window",
  });
  for (const y of [0.78, 0.88, 0.98]) {
    box([0.025, 0.015, 0.015], [-1.46, y, 0.296], C.red, {
      name: "side-store-led",
    });
  }
  label("DRY", [-1.46, 0.58, 0.275], [0.22, 0.05], C.black, C.cream, "dry-store-label");

  // Side-mounted cylinder rack.
  box([0.045, 0.78, 0.48], [-1.61, 1.58, -0.15], C.edge, {
    name: "cylinder-rack-back",
  });
  for (let i = 0; i < 3; i++) {
    const y = 1.34 + i * 0.25;
    cyl(0.075, 0.20, [-1.56, y, -0.15], i === 1 ? C.redDark : C.steel, 10, {
      rotation: [0, 0, 90],
      name: "side-cylinder",
    });
    box([0.12, 0.035, 0.025], [-1.48, y, -0.15], C.brass, {
      name: "cylinder-strap",
    });
  }

  // Right-side service panel.
  box([0.36, 0.62, 0.055], [1.46, 0.74, 0.30], C.edge, {
    name: "service-panel",
  });
  box([0.28, 0.46, 0.025], [1.46, 0.74, 0.335], C.panel, {
    name: "service-panel-face",
  });
  for (const y of [0.55, 0.66, 0.77, 0.88]) {
    box([0.18, 0.025, 0.012], [1.43, y, 0.355], C.steelDark, {
      name: "service-panel-slot",
    });
    cyl(0.018, 0.018, [1.58, y, 0.36], y === 0.66 ? C.red : C.green, 8, {
      dir: [0, 0, 1],
      name: "service-led",
    });
  }
  label("AUX", [1.46, 0.43, 0.355], [0.18, 0.045], C.black, C.amber, "aux-label");

  // ---------------------------------------------------------------------------
  // Industrial plumbing and overhead ductwork.

  pipe(
    [
      [-1.54, 2.16, -0.70],
      [-1.54, 2.36, -0.70],
      [-1.18, 2.43, -0.70],
      [-0.82, 2.27, -0.70],
    ],
    0.038,
    C.steelDark,
    { name: "upper-left-conduit" },
  );
  pipe(
    [
      [1.47, 2.18, -0.70],
      [1.47, 2.42, -0.70],
      [1.14, 2.47, -0.70],
      [0.82, 2.25, -0.70],
    ],
    0.044,
    C.brass,
    { name: "upper-right-conduit" },
  );
  for (const x of [-1.40, -1.08, 1.36, 1.08]) {
    box([0.07, 0.08, 0.10], [x, 2.26, -0.70], C.edge, {
      name: "conduit-clamp",
    });
    rivet([x - 0.025, 2.26, -0.64], C.brassLight, 0.012);
    rivet([x + 0.025, 2.26, -0.64], C.brassLight, 0.012);
  }

  // A pressure line drops beside the sink.
  pipe(
    [
      [1.38, 2.17, -0.71],
      [1.38, 1.91, -0.71],
      [1.47, 1.82, -0.58],
      [1.47, 1.30, -0.48],
    ],
    0.022,
    C.copper,
    { name: "sink-pressure-line" },
  );
  for (const y of [1.94, 1.66, 1.38]) {
    box([0.12, 0.035, 0.06], [1.38, y, -0.72], C.brass, {
      name: "pressure-line-clamp",
    });
  }

  // Exposed drain / waste pipe below the sink.
  pipe(
    [
      [0.82, 1.02, -0.02],
      [0.82, 0.82, -0.02],
      [0.62, 0.60, -0.02],
      [0.62, 0.34, -0.02],
    ],
    0.035,
    C.steelDark,
    { name: "sink-drain-pipe" },
  );
  box([0.12, 0.05, 0.12], [0.62, 0.54, -0.02], C.edge, {
    name: "drain-trap",
  });

  // ---------------------------------------------------------------------------
  // Analog gauge and control plate on the back wall.

  box([0.64, 0.48, 0.05], [1.08, 1.94, -0.735], C.edge, {
    name: "gauge-control-plate",
  });
  box([0.56, 0.40, 0.025], [1.08, 1.94, -0.765], C.panel, {
    name: "gauge-control-face",
  });
  cyl(0.145, 0.035, [0.91, 2.04, -0.79], C.brass, 16, {
    dir: [0, 0, 1],
    name: "pressure-gauge-bezel",
  });
  cyl(0.115, 0.018, [0.91, 2.04, -0.815], C.cream, 16, {
    dir: [0, 0, 1],
    name: "pressure-gauge-face",
  });
  rod([0.91, 2.04, -0.83], [0.96, 2.13, -0.83], 0.010, C.red, {
    name: "pressure-gauge-needle",
  });
  for (let i = 0; i < 7; i++) {
    const a = -135 + i * 45;
    const r0 = 0.095;
    const r1 = 0.108;
    const rad = (a * Math.PI) / 180;
    rod(
      [0.91 + Math.sin(rad) * r0, 2.04 + Math.cos(rad) * r0, -0.835],
      [0.91 + Math.sin(rad) * r1, 2.04 + Math.cos(rad) * r1, -0.835],
      0.006,
      C.black,
      { name: "gauge-tick" },
    );
  }
  label("PRESS", [1.25, 2.03, -0.80], [0.20, 0.05], C.black, C.cream, "pressure-label");
  cyl(0.035, 0.025, [1.24, 1.87, -0.80], C.red, 8, {
    dir: [0, 0, 1],
    name: "alarm-button",
  });
  cyl(0.035, 0.025, [1.13, 1.87, -0.80], C.green, 8, {
    dir: [0, 0, 1],
    name: "ready-button",
  });
  cyl(0.035, 0.025, [1.02, 1.87, -0.80], C.amber, 8, {
    dir: [0, 0, 1],
    name: "heat-button",
  });

  // ---------------------------------------------------------------------------
  // Nostromo-style warning placards and stencilled panel markings.

  warning([-0.98, 2.19, -0.725], [0.58, 0.09, 0.012], "CAUTION", "rear-caution");
  hazardStripe(-0.98, 2.10, -0.724, 0.56, 8, 0, "rear-hazard");

  warning([0.10, 2.19, -0.725], [0.62, 0.09, 0.012], "SERVICE", "rear-service");
  label("GALLEY 07", [-0.35, 0.48, 0.305], [0.44, 0.07], C.redDark, C.cream, "galley-number");
  label("AUTHORIZED CREW", [0.38, 0.48, 0.305], [0.54, 0.07], C.black, C.amber, "crew-label");

  // Small yellow diagonal bars on both side walls.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      box(
        [0.045, 0.26, 0.018],
        [s * 1.625, 0.34 + i * 0.055, -0.36],
        i % 2 ? C.black : C.yellow,
        { rotation: [0, 0, s * -20], name: "side-hazard" },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Ceiling light cassette and a visible service hatch.

  box([2.25, 0.12, 0.48], [0, 2.29, -0.23], C.edge, {
    name: "ceiling-light-cassette",
  });
  box([1.85, 0.035, 0.28], [0, 2.225, -0.23], C.steelDark, {
    name: "ceiling-light-recess",
  });
  const ceilingLight = box(
    [1.65, 0.022, 0.18],
    [0, 2.20, -0.23],
    C.white,
    { name: "ceiling-fluorescent" },
  );
  glow(ceilingLight, 1.8);
  for (const x of [-0.92, 0.92]) {
    box([0.08, 0.10, 0.32], [x, 2.29, -0.23], C.steel, {
      name: "ceiling-light-end",
    });
  }

  box([0.58, 0.035, 0.38], [-1.24, 2.25, -0.50], C.black, {
    name: "ceiling-service-hatch",
  });
  box([0.49, 0.018, 0.29], [-1.24, 2.23, -0.50], C.panel, {
    name: "ceiling-service-hatch-face",
  });
  for (const x of [-1.45, -1.03]) {
    for (const z of [-0.61, -0.39]) {
      rivet([x, 2.25, z], C.brassLight, 0.014);
    }
  }
  label("E-17", [-1.24, 2.25, -0.475], [0.20, 0.06], C.redDark, C.cream, "hatch-label");

  // ---------------------------------------------------------------------------
  // Floor-level equipment: waste bin, foot rail and a loose service crate.

  box([0.48, 0.62, 0.45], [1.32, 0.42, 0.33], C.oliveDark, {
    name: "waste-bin",
  });
  tapered(0.19, 0.23, 0.08, [1.32, 0.76, 0.33], C.steelDark, 8, {
    name: "waste-bin-lid",
  });
  box([0.38, 0.04, 0.025], [1.32, 0.79, 0.33], C.steel, {
    name: "waste-bin-lid-handle",
  });
  warning([1.32, 0.44, 0.565], [0.27, 0.07, 0.012], "WASTE", "waste-label");

  rod([-1.52, 0.30, 0.39], [1.52, 0.30, 0.39], 0.032, C.steel, {
    name: "foot-rail",
  });
  for (const x of [-1.34, -0.68, 0, 0.68, 1.34]) {
    box([0.045, 0.16, 0.10], [x, 0.25, 0.39], C.edge, {
      name: "foot-rail-bracket",
    });
  }

  box([0.58, 0.36, 0.46], [-1.28, 0.35, -0.42], C.panel, {
    name: "service-crate",
  });
  box([0.48, 0.035, 0.30], [-1.28, 0.35, -0.175], C.black, {
    name: "service-crate-inset",
  });
  box([0.40, 0.025, 0.08], [-1.28, 0.35, -0.155], C.yellow, {
    name: "service-crate-stripe",
  });
  for (const x of [-1.53, -1.03]) {
    for (const y of [0.20, 0.50]) {
      rivet([x, y, -0.165], C.brassLight, 0.015);
    }
  }
  label("TOOLS", [-1.28, 0.35, -0.145], [0.30, 0.07], C.black, C.cream, "crate-label");

  // ---------------------------------------------------------------------------
  // Loose small prop: a metal tray with a mug and nutrient tube.

  box([0.42, 0.025, 0.28], [0.25, 1.28, 0.30], C.steelDark, {
    name: "counter-tray",
  });
  box([0.35, 0.018, 0.20], [0.25, 1.303, 0.30], C.black, {
    name: "tray-inset",
  });
  cyl(0.06, 0.11, [0.15, 1.37, 0.28], C.cream, 10, {
    name: "tray-mug",
  });
  cyl(0.065, 0.012, [0.15, 1.43, 0.28], C.black, 10, {
    name: "tray-mug-rim",
  });
  pipe(
    [
      [0.21, 1.40, 0.28],
      [0.27, 1.40, 0.28],
      [0.27, 1.34, 0.28],
      [0.21, 1.34, 0.28],
    ],
    0.010,
    C.cream,
    { name: "tray-mug-handle" },
  );
  cyl(0.035, 0.22, [0.34, 1.40, 0.29], C.red, 8, {
    rotation: [0, 0, 12],
    name: "nutrient-tube",
  });
  cyl(0.042, 0.018, [0.34, 1.515, 0.29], C.steelLight, 8, {
    rotation: [0, 0, 12],
    name: "nutrient-tube-cap",
  });
  box([0.07, 0.04, 0.008], [0.34, 1.40, 0.33], C.paper, {
    rotation: [0, 0, 12],
    name: "nutrient-tube-label",
  });

  // ---------------------------------------------------------------------------
  // Final structural accents: corner guards, pipe collars, and floor bolts.

  for (const s of [-1, 1]) {
    box([0.09, 1.72, 0.10], [s * 1.58, 1.16, 0.48], C.edge, {
      name: "front-corner-guard",
    });
    for (const y of [0.35, 0.92, 1.49, 2.05]) {
      rivet([s * 1.58, y, 0.54], C.brass, 0.016);
    }
  }

  for (const x of [-1.45, -0.48, 0.48, 1.45]) {
    for (const z of [-0.68, 0.67]) {
      cyl(0.032, 0.018, [x, 0.12, z], C.brass, 8, {
        name: "deck-bolt",
      });
    }
  }

  for (const [x, y, z] of [
    [-1.52, 1.88, -0.71],
    [-1.52, 1.50, -0.71],
    [1.52, 1.88, -0.71],
    [1.52, 1.50, -0.71],
  ] as V3[]) {
    cyl(0.07, 0.035, [x, y, z], C.steelDark, 10, {
      dir: [1, 0, 0],
      name: "bulkhead-port",
    });
    cyl(0.045, 0.04, [x + (x > 0 ? 0.018 : -0.018), y, z], C.brass, 8, {
      dir: [1, 0, 0],
      name: "bulkhead-port-inner",
    });
  }

  return b.root;
}
