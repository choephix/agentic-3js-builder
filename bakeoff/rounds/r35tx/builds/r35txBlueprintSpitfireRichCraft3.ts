import * as THREE from "three";
import {
  createBuilder,
  frame,
  line,
  rng,
  catmull,
  polyline,
  paint,
  mix,
  noise,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "Spitfire Fighter — Cyanotype Blueprint",
  description:
    "A stylized low-poly Spitfire fighter plane rendered as a cyanotype blueprint, with faceted airframe panels, luminous cyan technical linework, RAF roundels, cockpit glazing, propeller, guns, exhausts and landing gear.",
};

const NAVY = "#062849";
const DEEP = "#02162d";
const BLUE = "#0a4b72";
const CYAN = "#35c6e1";
const LIGHT = "#b8f8ff";
const ICE = "#e2ffff";
const GLASS = "#0a5779";
const TIRE = "#031321";
const SHADOW = "#041d38";
const EDGE = "#5ee5f1";
const WARM_BLUE = "#12698d";

const KEY_LIGHT = new THREE.Vector3(0.3, 0.82, 0.5).normalize();

const AIRFRAME = paint((p, n, _s) => {
  const lighting = Math.max(0, n.dot(KEY_LIGHT));
  const wave = 0.5 + 0.5 * Math.sin(p.z * 4.2 + p.x * 1.7 + noise(p, 0.7, 11) * 2.4);
  return mix(NAVY, BLUE, 0.12 + lighting * 0.38 + wave * 0.1);
});

const WING_PAINT = paint((p, n, _s) => {
  const lighting = Math.max(0, n.dot(KEY_LIGHT));
  const panel = 0.5 + 0.5 * Math.sin(p.z * 8.0 + p.x * 1.4);
  return mix("#073052", "#0b6689", 0.16 + lighting * 0.31 + panel * 0.08);
});

const TAIL_PAINT = paint((p, n, _s) => {
  const lighting = Math.max(0, n.dot(KEY_LIGHT));
  return mix("#062746", "#0d5b7d", 0.14 + lighting * 0.34);
});

const CANOPY_PAINT = paint((p, n, _s) => {
  const lighting = Math.max(0, n.dot(KEY_LIGHT));
  const blue = 0.5 + 0.5 * Math.sin(p.z * 7 + p.y * 10);
  return mix(DEEP, GLASS, 0.2 + lighting * 0.35 + blue * 0.08);
});

const ROUNDAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill="#062849" stroke="#b8f8ff" stroke-width="3"/>
    <circle cx="50" cy="50" r="32" fill="#35c6e1"/>
    <circle cx="50" cy="50" r="18" fill="#062849"/>
    <circle cx="50" cy="50" r="13" fill="#e2ffff"/>
    <path d="M50 4v10M50 86v10M4 50h10M86 50h10" stroke="#b8f8ff" stroke-width="2"/>
  </svg>`,
  { size: 256 },
);

const SERIAL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 48">
    <rect width="240" height="48" rx="5" fill="#03162d" stroke="#b8f8ff" stroke-width="2"/>
    <path d="M10 12h220M10 36h220" stroke="#35c6e1" stroke-width="1"/>
    <text x="120" y="31" text-anchor="middle" font-family="monospace" font-size="23" font-weight="bold" letter-spacing="3" fill="#e2ffff">R-7 1942</text>
  </svg>`,
  { size: 512 },
);

const STENCIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 52">
    <rect width="240" height="52" fill="#03162d" stroke="#5ee5f1" stroke-width="2"/>
    <path d="M10 9h220M10 43h220M22 9v34M218 9v34" stroke="#35c6e1" stroke-width="1"/>
    <text x="120" y="33" text-anchor="middle" font-family="monospace" font-size="22" letter-spacing="4" fill="#b8f8ff">MK IX / RAF</text>
  </svg>`,
  { size: 512 },
);

const BLUEPRINT_LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 72">
    <rect x="2" y="2" width="316" height="68" fill="#03162d" stroke="#35c6e1" stroke-width="2"/>
    <path d="M12 16h296M12 54h296M18 16v38M302 16v38" stroke="#12698d" stroke-width="1"/>
    <text x="160" y="39" text-anchor="middle" font-family="monospace" font-size="22" letter-spacing="3" fill="#e2ffff">SUPERMARINE / S-9</text>
  </svg>`,
  { size: 512 },
);

const INSTRUMENTS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 108">
    <rect width="280" height="108" rx="5" fill="#02162d" stroke="#5ee5f1" stroke-width="4"/>
    <g fill="#0a4b72" stroke="#b8f8ff" stroke-width="2">
      <circle cx="42" cy="51" r="27"/><circle cx="105" cy="51" r="27"/>
      <circle cx="168" cy="51" r="27"/><circle cx="231" cy="51" r="27"/>
    </g>
    <g stroke="#e2ffff" stroke-width="3">
      <path d="M42 51l-14-14M105 51l8-20M168 51l18-11M231 51l0-21"/>
      <path d="M20 84h44M83 84h44M146 84h44M209 84h44"/>
    </g>
    <g fill="#35c6e1" font-family="monospace" font-size="11" text-anchor="middle">
      <text x="42" y="96">ALT</text><text x="105" y="96">RPM</text>
      <text x="168" y="96">OIL</text><text x="231" y="96">FUEL</text>
    </g>
  </svg>`,
  { size: 512 },
);

const CANOPY_GLINT = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90">
    <path d="M16 72Q48 14 144 9" fill="none" stroke="#b8f8ff" stroke-width="7" stroke-linecap="round"/>
    <path d="M40 84Q73 34 151 25" fill="none" stroke="#35c6e1" stroke-width="3" stroke-linecap="round"/>
    <path d="M86 78Q107 53 155 48" fill="none" stroke="#5ee5f1" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
  { size: 256 },
);

const NOSE_BADGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill="#03162d" stroke="#e2ffff" stroke-width="4"/>
    <path d="M50 12v76M12 50h76" stroke="#35c6e1" stroke-width="4"/>
    <path d="M50 18l7 25 25 7-25 7-7 25-7-25-25-7 25-7z" fill="#b8f8ff"/>
    <circle cx="50" cy="50" r="9" fill="#062849"/>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({
    name: "spitfire-cyanotype-blueprint",
    detail: 1,
    paintSize: 2048,
  });

  const random = rng(7331);

  const rod = (
    a: THREE.Vector3 | [number, number, number],
    c: THREE.Vector3 | [number, number, number],
    radius: number,
    color: any = EDGE,
    name = "technicalRod",
  ) =>
    b.rod(a, c, radius, {
      color,
      caps: "flat",
      section: { ngon: 6 },
      name,
    });

  const cylinder = (
    radius: number,
    depth: number,
    at: THREE.Vector3 | [number, number, number],
    dir: THREE.Vector3 | [number, number, number],
    color: any,
    name: string,
    segments = 10,
  ) =>
    b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
      at,
      dir,
      flat: true,
      name,
    });

  const bolt = (on: any, radius: number, color: any, name: string) =>
    b.stick(new THREE.SphereGeometry(radius, 6, 4), color, on, {
      embed: 0.38,
      name,
    });

  const key = (t: number, values: number[]) => {
    const q = Math.min(values.length - 1, Math.max(0, t * (values.length - 1)));
    const i = Math.min(values.length - 2, Math.floor(q));
    const f = q - i;
    return values[i] + (values[i + 1] - values[i]) * f;
  };

  const fuselagePath = catmull(
    [
      [0, 1.5, 4.35],
      [0, 1.5, 3.75],
      [0, 1.48, 2.55],
      [0, 1.47, 1.1],
      [0, 1.51, -0.55],
      [0, 1.55, -2.3],
      [0, 1.62, -4.35],
      [0, 1.72, -5.48],
    ],
    { tension: 0.35 },
  );

  const fuselage = b.sweep(
    fuselagePath,
    (t) => [
      key(t, [0.1, 0.29, 0.61, 0.77, 0.8, 0.7, 0.45, 0.08]),
      key(t, [0.09, 0.24, 0.45, 0.57, 0.6, 0.53, 0.31, 0.055]),
    ],
    {
      color: AIRFRAME,
      section: "circle",
      sides: 10,
      smooth: false,
      caps: "round",
      name: "facetedFuselage",
    },
  );

  const bodyRing = (t: number, name: string, color: any = EDGE) => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 16; i++) {
      points.push(fuselage.at(t, i * 22.5, 0.012).at);
    }
    return b.sweep(polyline(points, { closed: true }), 0.009, {
      color,
      caps: "none",
      section: { ngon: 6 },
      name,
    });
  };

  b.sweep(fuselage.line(0, 0.012), 0.009, {
    color: EDGE,
    caps: "none",
    section: { ngon: 6 },
    name: "dorsalBlueprintSeam",
  });
  b.sweep(fuselage.line(180, 0.01), 0.008, {
    color: BLUE,
    caps: "none",
    section: { ngon: 6 },
    name: "bellyBlueprintSeam",
  });
  b.sweep(fuselage.line(90, 0.01), 0.007, {
    color: EDGE,
    caps: "none",
    section: { ngon: 6 },
    name: "leftSideBlueprintSeam",
  });
  b.sweep(fuselage.line(-90, 0.01), 0.007, {
    color: EDGE,
    caps: "none",
    section: { ngon: 6 },
    name: "rightSideBlueprintSeam",
  });

  [0.12, 0.23, 0.36, 0.5, 0.64, 0.77, 0.88].forEach((t, i) => {
    bodyRing(t, `fuselageFrame${i}`, i === 0 ? LIGHT : EDGE);
  });

  const bodyRivetAngles = [24, 58, 122, 156, 204, 238, 302, 336];
  [0.2, 0.31, 0.43, 0.55, 0.67, 0.79, 0.89].forEach((t, row) => {
    bodyRivetAngles.forEach((angle, column) => {
      const hit = fuselage.at(t, angle, 0.017);
      bolt(hit, 0.018, column % 3 === 0 ? ICE : CYAN, `fuselageRivet${row}_${column}`);
    });
  });

  const WING_OUTLINE: [number, number][] = [
    [0, -1.02],
    [1.35, -0.93],
    [3.55, -0.68],
    [5.08, -0.25],
    [5.66, 0.37],
    [5.42, 0.82],
    [4.62, 1.06],
    [2.55, 1.17],
    [0, 1.13],
  ];

  const AILERON_OUTLINE: [number, number][] = [
    [2.72, -0.78],
    [5.22, -0.28],
    [5.48, 0.12],
    [2.72, -0.46],
  ];

  const FLAP_OUTLINE: [number, number][] = [
    [0.25, -0.97],
    [2.62, -0.78],
    [2.62, -0.51],
    [0.25, -0.72],
  ];

  const wingParts: { side: number; part: any }[] = [];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    const wing = b.extrude(WING_OUTLINE, {
      at: [0, 1.31, 0.8],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.075, 0.032],
      bevel: 0.018,
      smoothing: 1,
      color: WING_PAINT,
      name: `mainWing${sideName}`,
    });
    wingParts.push({ side, part: wing });

    const aileron = b.extrude(AILERON_OUTLINE, {
      at: [0, 1.39, 0.8],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.025, 0.012],
      bevel: 0.008,
      smoothing: 1,
      color: BLUE,
      name: `aileron${sideName}`,
    });

    b.extrude(FLAP_OUTLINE, {
      at: [0, 1.4, 0.8],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.025, 0.01],
      bevel: 0.007,
      smoothing: 1,
      color: EDGE,
      name: `flap${sideName}`,
    });

    rod(
      [side * 0.18, 1.39, 1.91],
      [side * 5.4, 1.45, 1.27],
      0.047,
      BLUE,
      `leadingEdge${sideName}`,
    );
    rod(
      [side * 0.18, 1.38, -0.17],
      [side * 5.1, 1.43, 0.56],
      0.032,
      EDGE,
      `trailingEdge${sideName}`,
    );

    rod(
      [side * 2.72, 1.405, -0.02],
      [side * 5.27, 1.425, 0.42],
      0.012,
      LIGHT,
      `aileronHinge${sideName}`,
    );
    rod(
      [side * 0.32, 1.405, -0.08],
      [side * 2.58, 1.42, 0.02],
      0.013,
      CYAN,
      `flapHinge${sideName}`,
    );

    for (let i = 1; i <= 8; i++) {
      const x = i * 0.61;
      const front = 1.91 - x * 0.12;
      const rear = -0.17 + x * 0.14;
      rod(
        [side * x, 1.4 + x * 0.008, rear],
        [side * x, 1.4 + x * 0.008, front],
        0.009,
        i % 2 === 0 ? CYAN : EDGE,
        `wingRib${sideName}_${i}`,
      );
    }

    const wingSurface = b.surface(wing);
    for (let i = 1; i <= 7; i++) {
      const x = i * 0.68;
      const front = 1.91 - x * 0.12 - 0.16;
      const rear = -0.17 + x * 0.14 + 0.13;
      const jitterFront = (random() - 0.5) * 0.016;
      const jitterRear = (random() - 0.5) * 0.016;
      bolt(
        wingSurface.nearest([side * x, 1.39, front + jitterFront]),
        0.019,
        ICE,
        `wingFrontRivet${sideName}_${i}`,
      );
      bolt(
        wingSurface.nearest([side * x, 1.39, rear + jitterRear]),
        0.016,
        CYAN,
        `wingRearRivet${sideName}_${i}`,
      );
    }

    const rootHit = wingSurface.nearest([side * 0.35, 1.38, 0.75]);
    bolt(rootHit, 0.032, LIGHT, `wingRootFastener${sideName}`);
  }

  const TAIL_OUTLINE: [number, number][] = [
    [0, -0.54],
    [1.03, -0.43],
    [1.83, -0.16],
    [2.12, 0.16],
    [1.62, 0.46],
    [0.72, 0.56],
    [0, 0.49],
  ];

  const ELEVATOR_OUTLINE: [number, number][] = [
    [0.55, -0.47],
    [1.85, -0.17],
    [2.05, 0.1],
    [0.55, 0.03],
  ];

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const tailplane = b.extrude(TAIL_OUTLINE, {
      at: [0, 1.67, -4.04],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.052, 0.022],
      bevel: 0.014,
      smoothing: 1,
      color: TAIL_PAINT,
      name: `tailplane${sideName}`,
    });

    b.extrude(ELEVATOR_OUTLINE, {
      at: [0, 1.72, -4.04],
      x: [side, 0, 0],
      y: [0, 0, 1],
      thickness: [0.018, 0.009],
      bevel: 0.006,
      smoothing: 1,
      color: EDGE,
      name: `elevator${sideName}`,
    });

    rod(
      [side * 0.42, 1.73, -4.49],
      [side * 1.96, 1.76, -3.91],
      0.019,
      EDGE,
      `tailLeadingLine${sideName}`,
    );
    rod(
      [side * 0.55, 1.75, -4.42],
      [side * 1.89, 1.77, -4.0],
      0.011,
      CYAN,
      `elevatorHinge${sideName}`,
    );

    const tailSurface = b.surface(tailplane);
    for (let i = 1; i <= 4; i++) {
      const x = i * 0.4;
      bolt(
        tailSurface.nearest([side * x, 1.71, -4.03 + x * 0.12]),
        0.014,
        i % 2 ? LIGHT : CYAN,
        `tailRivet${sideName}_${i}`,
      );
    }
  }

  const FIN_OUTLINE: [number, number][] = [
    [-0.46, 0],
    [0.68, 0],
    [1.02, 0.35],
    [0.76, 0.82],
    [0.35, 1.38],
    [-0.12, 1.62],
    [-0.38, 0.7],
  ];

  const RUDDER_OUTLINE: [number, number][] = [
    [0.42, 0.04],
    [0.88, 0.32],
    [0.64, 0.82],
    [0.28, 1.39],
    [0.08, 1.55],
    [0.1, 0.12],
  ];

  const fin = b.extrude(FIN_OUTLINE, {
    at: [0, 1.6, -5.0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.07, 0.035],
    bevel: 0.014,
    smoothing: 1,
    color: TAIL_PAINT,
    name: "verticalTailFin",
  });

  b.extrude(RUDDER_OUTLINE, {
    at: [-0.044, 1.61, -5.0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.018, 0.01],
    bevel: 0.006,
    smoothing: 1,
    color: EDGE,
    name: "rudderBlueprintPlate",
  });

  rod([0, 1.63, -5.44], [0, 1.64, -4.03], 0.014, EDGE, "finTrailingLine");
  rod([0, 1.64, -4.99], [0, 2.98, -4.65], 0.012, LIGHT, "finLeadingLine");
  rod([0, 1.67, -4.92], [0, 2.95, -4.64], 0.009, CYAN, "rudderHingeLine");

  const finSurface = b.surface(fin);
  [0.2, 0.52, 0.82, 1.12].forEach((up, i) => {
    bolt(finSurface.nearest([0, 1.67 + up, -4.86 + up * 0.2]), 0.018, ICE, `finRivet${i}`);
  });

  const wingLeft = wingParts.find((w) => w.side === 1)!.part;
  const wingRight = wingParts.find((w) => w.side === -1)!.part;

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const wing = side > 0 ? wingLeft : wingRight;

    b.decal(wing, ROUNDAL, {
      at: [side * 2.72, 1.39, 0.92],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.92, 0.92],
      lift: 0.009,
      mirror: side < 0,
      name: `wingRoundel${sideName}`,
    });

    b.decal(wing, STENCIL, {
      at: [side * 1.2, 1.39, 0.18],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [1.08, 0.235],
      lift: 0.01,
      mirror: side < 0,
      name: `wingStencil${sideName}`,
    });

    b.part(new THREE.BoxGeometry(0.48, 0.3, 0.026), EDGE, {
      at: [side * 0.72, 1.66, 1.28],
      dir: [side, 0, 0],
      flat: true,
      name: `engineAccessPanel${sideName}`,
    });

    b.part(new THREE.BoxGeometry(0.25, 0.16, 0.032), LIGHT, {
      at: [side * 0.75, 1.68, 1.28],
      dir: [side, 0, 0],
      flat: true,
      name: `engineAccessLatch${sideName}`,
    });
  }

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    b.decal(fuselage, ROUNDAL, {
      at: [side * 0.78, 1.57, 0.05],
      dir: [side, 0, 0],
      up: [0, 1, 0],
      size: [0.67, 0.67],
      lift: 0.012,
      mirror: side > 0,
      name: `fuselageRoundel${sideName}`,
    });

    b.decal(fuselage, SERIAL, {
      at: [side * 0.61, 1.7, -2.25],
      dir: [side, 0, 0],
      up: [0, 1, 0],
      size: [1.04, 0.208],
      lift: 0.014,
      mirror: side > 0,
      name: `fuselageSerial${sideName}`,
    });

    b.decal(fuselage, BLUEPRINT_LABEL, {
      at: [side * 0.53, 1.69, -3.2],
      dir: [side, 0, 0],
      up: [0, 1, 0],
      size: [1.12, 0.25],
      lift: 0.014,
      mirror: side > 0,
      name: `fuselageBlueprintLabel${sideName}`,
    });
  }

  const cowling = b.part(
    new THREE.CylinderGeometry(0.7, 0.78, 0.48, 12),
    AIRFRAME,
    {
      at: [0, 1.5, 4.03],
      dir: [0, 0, 1],
      flat: true,
      name: "merlinCowling",
    },
  );

  cylinder(0.8, 0.052, [0, 1.5, 4.3], [0, 0, 1], EDGE, "cowlingFrontRing", 16);
  cylinder(0.69, 0.04, [0, 1.5, 3.78], [0, 0, 1], BLUE, "cowlingRearRing", 12);

  const spinner = b.lathe(
    [
      [0, -0.24],
      [0.2, -0.24],
      [0.3, -0.15],
      [0.37, -0.01],
      [0.32, 0.13],
      [0.23, 0.25],
      [0.08, 0.35],
      [0, 0.4],
    ],
    {
      at: [0, 1.5, 4.31],
      axis: [0, 0, 1],
      segments: 12,
      smoothing: 1,
      color: WARM_BLUE,
      name: "facetedSpinner",
    },
  );

  b.decal(spinner, NOSE_BADGE, {
    at: [0, 1.5, 4.69],
    dir: [0, 0, 1],
    up: [0, 1, 0],
    size: [0.25, 0.25],
    lift: 0.006,
    name: "spinnerBadge",
  });

  const propBlade: [number, number][] = [
    [0.19, -0.045],
    [0.43, -0.1],
    [0.92, -0.15],
    [1.3, -0.11],
    [1.39, -0.025],
    [1.23, 0.08],
    [0.7, 0.14],
    [0.3, 0.09],
  ];

  const propTip: [number, number][] = [
    [1.08, -0.1],
    [1.28, -0.09],
    [1.39, -0.025],
    [1.23, 0.08],
    [1.08, 0.07],
  ];

  const propCenter: [number, number, number] = [0, 1.5, 4.56];

  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2 + Math.PI / 4;
    const radial: [number, number, number] = [Math.sin(angle), Math.cos(angle), 0];
    const tangent: [number, number, number] = [-Math.cos(angle), Math.sin(angle), 0];

    b.extrude(propBlade, {
      at: propCenter,
      x: radial,
      y: tangent,
      thickness: [0.065, 0.035],
      bevel: 0.012,
      smoothing: 1,
      color: BLUE,
      name: `propellerBlade${i}`,
    });

    b.extrude(propTip, {
      at: propCenter,
      x: radial,
      y: tangent,
      thickness: [0.071, 0.038],
      bevel: 0.006,
      smoothing: 1,
      color: LIGHT,
      name: `propellerTip${i}`,
    });
  }

  const propLine = line([0, 1.5, 4.42], [0, 1.5, 4.75]);
  b.ring(
    propLine,
    {
      count: 8,
      radius: 0.2,
      fromDeg: 0,
      toDeg: 360,
      name: "spinnerBolts",
    },
    (item) => bolt(item, 0.022, ICE, `spinnerBolt${item.i}`),
  );

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    const rootFairing = catmull([
      [side * 0.12, 1.42, 1.25],
      [side * 0.4, 1.28, 0.85],
      [side * 0.78, 1.16, 0.54],
    ]);
    b.sweep(rootFairing, [0.11, 0.06], {
      color: AIRFRAME,
      section: "circle",
      sides: 8,
      caps: "round",
      name: `wingRootFairing${sideName}`,
    });

    const gunXs = [1.2, 1.78, 2.36, 2.94];
    gunXs.forEach((x, i) => {
      const leadingZ = 1.91 - x * 0.12;
      rod(
        [side * x, 1.385, leadingZ - 0.1],
        [side * x, 1.39, leadingZ + 0.69],
        0.026,
        DEEP,
        `machineGunBarrel${sideName}_${i}`,
      );
      cylinder(
        0.045,
        0.075,
        [side * x, 1.39, leadingZ + 0.67],
        [0, 0, 1],
        LIGHT,
        `machineGunMuzzle${sideName}_${i}`,
        8,
      );
    });

    [2.02, 2.29, 2.56].forEach((z, i) => {
      const exhaustDir: [number, number, number] = [side, 0.1, -0.24];
      cylinder(
        0.043,
        0.17,
        [side * 0.68, 1.49, z],
        exhaustDir,
        DEEP,
        `exhaustStack${sideName}_${i}`,
        8,
      );
      cylinder(
        0.056,
        0.028,
        [side * 0.68, 1.49, z + 0.08],
        exhaustDir,
        EDGE,
        `exhaustCollar${sideName}_${i}`,
        8,
      );
    });

    rod(
      [side * 0.68, 1.78, 2.88],
      [side * 0.68, 1.8, 3.6],
      0.009,
      EDGE,
      `cowlingPanelLine${sideName}`,
    );
  }

  const canopy = b.part(new THREE.SphereGeometry(1, 12, 8), CANOPY_PAINT, {
    at: [0, 2.03, 0.0],
    scale: [0.57, 0.4, 0.92],
    flat: true,
    name: "facetedBubbleCanopy",
  });

  b.decal(canopy, CANOPY_GLINT, {
    at: [0, 2.36, 0.22],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    size: [0.46, 0.27],
    lift: 0.008,
    name: "canopyReflection",
  });

  rod([0, 2.34, 0.78], [0, 2.36, -0.68], 0.021, LIGHT, "canopyCenterFrame");
  rod([-0.46, 2.15, 0.68], [-0.46, 2.13, -0.58], 0.018, EDGE, "canopyLeftRail");
  rod([0.46, 2.15, 0.68], [0.46, 2.13, -0.58], 0.018, EDGE, "canopyRightRail");
  rod([-0.46, 2.15, 0.68], [0, 2.34, 0.78], 0.017, CYAN, "canopyLeftFrontBrace");
  rod([0.46, 2.15, 0.68], [0, 2.34, 0.78], 0.017, CYAN, "canopyRightFrontBrace");
  rod([-0.46, 2.13, -0.58], [0, 2.3, -0.76], 0.014, EDGE, "canopyLeftRearBrace");
  rod([0.46, 2.13, -0.58], [0, 2.3, -0.76], 0.014, EDGE, "canopyRightRearBrace");

  b.part(new THREE.BoxGeometry(0.78, 0.27, 0.12), DEEP, {
    at: [0, 1.98, 0.57],
    flat: true,
    name: "instrumentCoaming",
  });

  b.part(new THREE.PlaneGeometry(0.7, 0.27), ICE, {
    at: [0, 2.0, 0.638],
    dir: [0, 0, 1],
    axis: "z",
    texture: INSTRUMENTS,
    name: "instrumentPanel",
  });

  b.part(new THREE.BoxGeometry(0.5, 0.46, 0.18), DEEP, {
    at: [0, 1.93, -0.34],
    flat: true,
    name: "pilotSeatBack",
  });
  b.part(new THREE.BoxGeometry(0.7, 0.08, 0.42), BLUE, {
    at: [0, 1.75, -0.18],
    flat: true,
    name: "pilotSeatCushion",
  });
  cylinder(0.12, 0.18, [0, 2.18, -0.53], [0, 0, 1], EDGE, "seatHeadrest", 8);

  rod([0, 2.38, -0.62], [0, 2.7, -0.95], 0.014, LIGHT, "radioMast");
  rod([0, 2.7, -0.95], [0, 2.04, -3.88], 0.006, EDGE, "radioWire");

  const radiator = b.part(new THREE.BoxGeometry(0.62, 0.2, 0.42), DEEP, {
    at: [0, 1.02, 0.74],
    flat: true,
    name: "radiatorIntake",
  });
  for (let i = -2; i <= 2; i++) {
    rod(
      [i * 0.09, 1.03, 0.54],
      [i * 0.09, 1.03, 0.94],
      0.009,
      CYAN,
      `radiatorSlat${i + 2}`,
    );
  }

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";

    rod(
      [side * 0.98, 0.96, 0.38],
      [side * 1.2, 0.39, 0.18],
      0.052,
      BLUE,
      `mainGearStrut${sideName}`,
    );
    rod(
      [side * 1.02, 0.91, 0.34],
      [side * 1.25, 0.39, 0.13],
      0.024,
      LIGHT,
      `mainGearBrace${sideName}`,
    );

    b.part(new THREE.BoxGeometry(0.38, 0.07, 0.28), AIRFRAME, {
      at: [side * 1.0, 0.55, 0.28],
      flat: true,
      name: `wheelBayDoor${sideName}`,
    });

    b.part(new THREE.TorusGeometry(0.17, 0.07, 6, 12), TIRE, {
      at: [side * 1.24, 0.25, 0.13],
      dir: [1, 0, 0],
      flat: true,
      name: `mainWheelTire${sideName}`,
    });

    cylinder(
      0.088,
      0.17,
      [side * 1.24, 0.25, 0.13],
      [1, 0, 0],
      LIGHT,
      `mainWheelHub${sideName}`,
      10,
    );
    cylinder(
      0.036,
      0.181,
      [side * 1.24, 0.25, 0.13],
      [1, 0, 0],
      DEEP,
      `mainWheelAxle${sideName}`,
      8,
    );
  }

  rod([0, 1.62, -4.38], [0, 0.38, -4.56], 0.035, BLUE, "tailWheelStrut");
  rod([0, 0.42, -4.56], [0, 0.25, -4.56], 0.018, LIGHT, "tailWheelFork");

  b.part(new THREE.TorusGeometry(0.105, 0.052, 6, 10), TIRE, {
    at: [0, 0.165, -4.56],
    dir: [1, 0, 0],
    flat: true,
    name: "tailWheelTire",
  });
  cylinder(0.045, 0.13, [0, 0.165, -4.56], [1, 0, 0], LIGHT, "tailWheelHub", 8);

  const leftWingSurface = b.surface(wingLeft);
  const rightWingSurface = b.surface(wingRight);

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const surface = side > 0 ? leftWingSurface : rightWingSurface;

    for (let i = 0; i < 5; i++) {
      const x = 0.75 + i * 0.84;
      const front = 1.91 - x * 0.12 - 0.37;
      const rear = -0.17 + x * 0.14 + 0.3;
      bolt(
        surface.nearest([side * x, 1.41, front]),
        0.012,
        CYAN,
        `wingPanelBoltFront${sideName}_${i}`,
      );
      bolt(
        surface.nearest([side * x, 1.41, rear]),
        0.012,
        CYAN,
        `wingPanelBoltRear${sideName}_${i}`,
      );
    }
  }

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const wing = side > 0 ? wingLeft : wingRight;

    b.decal(wing, BLUEPRINT_LABEL, {
      at: [side * 3.9, 1.41, 0.63],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.8, 0.18],
      lift: 0.011,
      mirror: side < 0,
      name: `wingEngineeringLabel${sideName}`,
    });
  }

  const propAxis = frame([0, 1.5, 4.54], [0, 0, 1]);
  b.ring(
    propAxis,
    {
      count: 6,
      radius: 0.12,
      fromDeg: 0,
      toDeg: 360,
      name: "noseInspectionBolts",
    },
    (item) => bolt(item, 0.014, CYAN, `noseInspectionBolt${item.i}`),
  );

  const tailLine = catmull([
    [0, 1.69, -4.95],
    [0, 1.71, -4.35],
    [0, 1.73, -3.86],
  ]);
  b.sweep(tailLine, 0.009, {
    color: EDGE,
    caps: "flat",
    section: { ngon: 6 },
    name: "tailSpineBlueprintLine",
  });

  cylinder(0.12, 0.08, [0, 1.71, -3.68], [0, 0, 1], LIGHT, "rearAntennaMount", 8);

  b.part(new THREE.BoxGeometry(0.28, 0.08, 0.42), BLUE, {
    at: [0, 1.25, 2.85],
    flat: true,
    name: "lowerEngineFairing",
  });

  for (let i = 0; i < 5; i++) {
    const x = -0.24 + i * 0.12;
    rod(
      [x, 1.16, 2.72],
      [x, 1.16, 2.99],
      0.008,
      CYAN,
      `lowerFairingVent${i}`,
    );
  }

  const pitot = catmull([
    [2.72, 1.31, 1.15],
    [2.94, 1.15, 1.12],
    [3.12, 1.02, 1.09],
  ]);
  b.sweep(pitot, [0.018, 0.006], {
    color: LIGHT,
    caps: { start: "flat", end: "point" },
    name: "pitotTube",
  });

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    const navColor = side > 0 ? ICE : CYAN;

    b.part(new THREE.SphereGeometry(0.085, 8, 5), navColor, {
      at: [side * 5.28, 1.4, 0.59],
      flat: true,
      name: `navigationLight${sideName}`,
    });

    b.part(new THREE.SphereGeometry(0.043, 7, 5), LIGHT, {
      at: [side * 5.3, 1.43, 0.6],
      flat: true,
      name: `navigationLightCore${sideName}`,
    });
  }

  b.part(new THREE.SphereGeometry(0.09, 8, 5), CYAN, {
    at: [0, 1.73, -5.47],
    flat: true,
    name: "tailBeacon",
  });

  const hatchPathL = catmull([
    [0.64, 1.83, 0.8],
    [0.69, 1.86, 0.15],
    [0.67, 1.84, -0.5],
  ]);
  const hatchPathR = catmull([
    [-0.64, 1.83, 0.8],
    [-0.69, 1.86, 0.15],
    [-0.67, 1.84, -0.5],
  ]);

  b.sweep(hatchPathL, 0.009, {
    color: LIGHT,
    caps: "none",
    section: { ngon: 6 },
    name: "leftCockpitHatchLine",
  });
  b.sweep(hatchPathR, 0.009, {
    color: LIGHT,
    caps: "none",
    section: { ngon: 6 },
    name: "rightCockpitHatchLine",
  });

  for (const side of [1, -1]) {
    const sideName = side > 0 ? "L" : "R";
    for (let i = 0; i < 4; i++) {
      const z = 0.55 - i * 0.32;
      const hit = fuselage.at(0.48 + i * 0.05, side > 0 ? 82 : -82, 0.019);
      bolt(hit, 0.015, i % 2 ? CYAN : ICE, `cockpitHatchRivet${sideName}_${i}`);
    }
  }

  const trimPath = catmull([
    [0, 1.93, 0.94],
    [0, 2.12, 0.77],
    [0, 2.29, 0.25],
    [0, 2.3, -0.42],
  ]);
  b.sweep(trimPath, 0.012, {
    color: EDGE,
    caps: "flat",
    section: { ngon: 6 },
    name: "canopyFrontTrim",
  });

  const leftWingtip = b.surface(wingLeft).nearest([5.3, 1.4, 0.54]);
  const rightWingtip = b.surface(wingRight).nearest([-5.3, 1.4, 0.54]);
  bolt(leftWingtip, 0.033, ICE, "leftWingtipFastener");
  bolt(rightWingtip, 0.033, CYAN, "rightWingtipFastener");

  const gearLine = line([0, 0.15, -4.56], [0, 0.45, -4.56]);
  b.ring(
    gearLine,
    {
      count: 4,
      radius: 0.08,
      fromDeg: 0,
      toDeg: 360,
      name: "tailGearBolts",
    },
    (item) => bolt(item, 0.011, LIGHT, `tailGearBolt${item.i}`),
  );

  return b.root;
}
