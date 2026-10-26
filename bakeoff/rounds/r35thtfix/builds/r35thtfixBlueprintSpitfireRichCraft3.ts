import * as THREE from "three";
import {
  createBuilder,
  catmull,
  paint,
  rng,
  svg,
} from "../../../../src/index";

export const meta = {
  name: "cyanotype-spitfire",
  description: "A low-poly Spitfire fighter plane rendered as a richly detailed cyanotype blueprint.",
};

const NAVY = "#062950";
const DEEP = "#02162f";
const BLUE = "#0a4778";
const BLUE2 = "#126b9a";
const CYAN = "#64dbe5";
const PALE = "#c9ffff";
const WHITE = "#edffff";
const INK = "#011127";
const RUBBER = "#031323";
const WARM_BLUE = "#174f78";

const blueprintMetal = paint((p, n) => {
  const top = n.y > 0.45;
  const side = Math.abs(n.z) > 0.58;
  const base = top ? BLUE2 : side ? BLUE : NAVY;
  const gx = Math.abs(p.x - Math.round(p.x / 0.48) * 0.48);
  const gy = Math.abs(p.y - Math.round(p.y / 0.32) * 0.32);
  const gz = Math.abs(p.z - Math.round(p.z / 0.56) * 0.56);
  if (gx < 0.009 || gy < 0.009 || gz < 0.009) return CYAN;
  return base;
});

const wingPaint = paint((p, n) => {
  const base = n.y > 0.5 ? BLUE2 : NAVY;
  const rib = Math.abs(p.x - Math.round(p.x / 0.62) * 0.62);
  const station = Math.abs(p.z - Math.round(p.z / 0.52) * 0.52);
  if (rib < 0.012 || station < 0.01) return CYAN;
  return base;
});

const lightEdge = paint((p, n) => {
  const v = 0.55 + 0.25 * n.y + 0.15 * n.z;
  return v > 0.72 ? PALE : v > 0.48 ? CYAN : BLUE2;
});

const ROUNDel = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <circle cx="128" cy="128" r="108" fill="#062950" stroke="#c9ffff" stroke-width="10"/>
    <circle cx="128" cy="128" r="77" fill="#64dbe5" stroke="#02162f" stroke-width="7"/>
    <circle cx="128" cy="128" r="39" fill="#02162f" stroke="#edffff" stroke-width="5"/>
    <path d="M32 128h192M128 32v192" stroke="#c9ffff" stroke-width="3" opacity=".65"/>
  </svg>`,
  { size: 256 },
);

const WING_GRID = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 256">
    <rect width="512" height="256" fill="#062950" fill-opacity=".18"/>
    <g fill="none" stroke="#9cfbff" stroke-width="4" opacity=".86">
      <path d="M8 30H504M8 82H504M8 134H504M8 186H504M8 238H504"/>
      <path d="M32 8V248M96 8V248M160 8V248M224 8V248M288 8V248M352 8V248M416 8V248M480 8V248"/>
      <path d="M15 220L170 35L486 35"/>
      <path d="M24 228L183 55L474 55"/>
    </g>
    <g fill="#c9ffff" font-family="monospace" font-size="24" letter-spacing="3">
      <text x="24" y="28">WING PLAN / A-1</text>
      <text x="352" y="224">11.23 M</text>
    </g>
  </svg>`,
  { size: 512 },
);

const CANOPY_WINDOW = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 128">
    <path d="M8 112 Q26 20 158 12 Q278 10 312 48 L312 112Z" fill="#02162f" stroke="#b9ffff" stroke-width="7"/>
    <path d="M36 101 Q54 39 153 29 L153 101Z" fill="#126b9a" stroke="#64dbe5" stroke-width="5"/>
    <path d="M166 29 Q253 28 286 54 L286 101 L166 101Z" fill="#0a4778" stroke="#64dbe5" stroke-width="5"/>
    <path d="M158 20V106" stroke="#c9ffff" stroke-width="5"/>
    <path d="M26 112H300" stroke="#c9ffff" stroke-width="4"/>
  </svg>`,
  { size: 320 },
);

const SIDE_LABEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 128">
    <rect x="5" y="5" width="630" height="118" rx="10" fill="#02162f" fill-opacity=".88" stroke="#64dbe5" stroke-width="5"/>
    <g fill="#c9ffff" font-family="monospace">
      <text x="28" y="51" font-size="30" letter-spacing="5">SUPERMARINE</text>
      <text x="28" y="91" font-size="27" letter-spacing="4">SPITFIRE / Mk IX</text>
      <text x="503" y="84" font-size="25">A-17</text>
    </g>
    <path d="M28 105H470" stroke="#64dbe5" stroke-width="3"/>
  </svg>`,
  { size: 640 },
);

const INSTRUMENTS = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 128">
    <rect width="256" height="128" rx="9" fill="#011127" stroke="#c9ffff" stroke-width="5"/>
    <g fill="#062950" stroke="#64dbe5" stroke-width="3">
      <circle cx="42" cy="43" r="25"/><circle cx="105" cy="43" r="25"/><circle cx="168" cy="43" r="25"/>
      <circle cx="73" cy="93" r="20"/><circle cx="137" cy="93" r="20"/><circle cx="200" cy="93" r="20"/>
    </g>
    <g stroke="#edffff" stroke-width="3">
      <path d="M42 43L53 25M105 43L93 29M168 43L180 30M73 93L84 83M137 93L128 78M200 93L211 82"/>
    </g>
    <g fill="#c9ffff" font-family="monospace" font-size="11">
      <text x="25" y="78">RPM</text><text x="87" y="78">OIL</text><text x="152" y="78">ALT</text>
    </g>
  </svg>`,
  { size: 256 },
);

const TAIL_MARK = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
    <path d="M128 12L155 92L235 119L155 145L128 244L101 145L21 119L101 92Z" fill="#64dbe5" fill-opacity=".2" stroke="#c9ffff" stroke-width="8"/>
    <circle cx="128" cy="119" r="28" fill="#02162f" stroke="#c9ffff" stroke-width="5"/>
    <path d="M128 52V186M61 119H195" stroke="#64dbe5" stroke-width="4"/>
  </svg>`,
  { size: 256 },
);

function box(
  b: ReturnType<typeof createBuilder>,
  size: [number, number, number],
  color: any,
  at: [number, number, number],
  name: string,
  bone: any,
) {
  return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
    at,
    bone,
    flat: true,
    name,
  });
}

function cylinder(
  b: ReturnType<typeof createBuilder>,
  radius: number,
  depth: number,
  color: any,
  at: [number, number, number],
  dir: [number, number, number],
  name: string,
  bone: any,
  segments = 10,
) {
  return b.part(new THREE.CylinderGeometry(radius, radius, depth, segments), color, {
    at,
    dir,
    bone,
    flat: true,
    name,
  });
}

export default function build() {
  const b = createBuilder({ name: "cyanotype-spitfire", detail: 1 });
  const airframe = b.joint("airframe", {
    at: [0, 0, 0],
    dir: [0, 1, 0],
    role: "spine",
    group: "airframe",
  });

  const fuselagePath = catmull([
    [0, 2.22, -4.45],
    [0, 2.25, -3.7],
    [0, 2.3, -2.6],
    [0, 2.34, -1.2],
    [0, 2.37, 0.4],
    [0, 2.38, 1.8],
    [0, 2.36, 3.2],
    [0, 2.34, 4.18],
    [0, 2.34, 4.62],
  ]);

  const fuselage = b.sweep(
    fuselagePath,
    (t) => {
      if (t < 0.12) return 0.17 + t * 2.1;
      if (t < 0.36) return 0.42 + (t - 0.12) * 0.95;
      if (t < 0.68) return 0.65;
      if (t < 0.86) return 0.65 - (t - 0.68) * 0.65;
      return 0.53 - (t - 0.86) * 2.1;
    },
    {
      bone: airframe,
      color: blueprintMetal,
      sides: 10,
      smooth: false,
      caps: "round",
      name: "fuselage",
      group: "primary-airframe",
    },
  );

  const fuselageSurface = b.surface(fuselage);

  const mainWingOutline: [number, number][] = [
    [0, 0.92],
    [0.9, 0.83],
    [2.2, 0.67],
    [3.55, 0.43],
    [4.7, 0.12],
    [5.42, -0.24],
    [5.18, -0.72],
    [4.25, -0.9],
    [2.7, -0.83],
    [1.2, -0.67],
    [0, -0.55],
  ];

  const wings: any[] = [];
  for (const s of [1, -1]) {
    const wing = b.extrude(mainWingOutline, {
      at: [0, 2.27, 0.32],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.14,
      bevel: 0.045,
      smoothing: 1,
      bone: airframe,
      color: wingPaint,
      name: s > 0 ? "mainWingL" : "mainWingR",
      group: "wings",
    });
    wings.push(wing);

    b.decal(wing, ROUNDel, {
      at: [s * 2.75, 2.36, 0.28],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.86, 0.86],
      lift: 0.008,
      segments: 8,
      mirror: s < 0,
      name: s > 0 ? "roundelL" : "roundelR",
      group: "markings",
    });

    b.decal(wing, WING_GRID, {
      at: [s * 4.15, 2.36, -0.03],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [1.65, 0.82],
      lift: 0.01,
      segments: 6,
      mirror: s < 0,
      name: s > 0 ? "wingBlueprintL" : "wingBlueprintR",
      group: "blueprint",
    });

    b.rod(
      [s * 0.4, 2.38, 0.55],
      [s * 4.92, 2.38, -0.06],
      0.024,
      {
        color: PALE,
        bone: airframe,
        name: s > 0 ? "wingMainSparL" : "wingMainSparR",
        group: "blueprint",
      },
    );

    const ribStations = [0.8, 1.65, 2.55, 3.45, 4.25, 4.82];
    for (let i = 0; i < ribStations.length; i++) {
      const x = ribStations[i];
      const front = 0.32 + 0.89 - x * 0.145;
      const back = 0.32 - 0.54 - x * 0.04;
      b.rod(
        [s * x, 2.385, front],
        [s * x, 2.385, back],
        0.013,
        {
          color: CYAN,
          bone: airframe,
          name: `${s > 0 ? "wingRibL" : "wingRibR"}${i}`,
          group: "blueprint",
        },
      );
    }

    b.rod(
      [s * 0.15, 2.385, -0.42],
      [s * 4.75, 2.385, -0.46],
      0.014,
      {
        color: CYAN,
        bone: airframe,
        name: s > 0 ? "wingRearLineL" : "wingRearLineR",
        group: "blueprint",
      },
    );
  }

  const tailPlaneOutline: [number, number][] = [
    [0, 0.32],
    [0.68, 0.28],
    [1.5, 0.18],
    [2.25, 0.03],
    [2.62, -0.16],
    [2.42, -0.42],
    [1.55, -0.52],
    [0.65, -0.42],
    [0, -0.28],
  ];

  for (const s of [1, -1]) {
    const tailPlane = b.extrude(tailPlaneOutline, {
      at: [0, 2.42, -3.08],
      x: [s, 0, 0],
      y: [0, 0, 1],
      thickness: 0.1,
      bevel: 0.028,
      smoothing: 1,
      bone: airframe,
      color: wingPaint,
      name: s > 0 ? "tailPlaneL" : "tailPlaneR",
      group: "tail",
    });

    b.decal(tailPlane, TAIL_MARK, {
      at: [s * 1.3, 2.49, -3.08],
      dir: [0, 1, 0],
      up: [0, 0, 1],
      size: [0.52, 0.52],
      lift: 0.007,
      segments: 6,
      mirror: s < 0,
      name: s > 0 ? "tailMarkL" : "tailMarkR",
      group: "markings",
    });

    for (let i = 0; i < 3; i++) {
      const x = 0.65 + i * 0.62;
      b.rod(
        [s * x, 2.5, -2.9],
        [s * x, 2.5, -3.46],
        0.012,
        {
          color: CYAN,
          bone: airframe,
          name: `${s > 0 ? "tailRibL" : "tailRibR"}${i}`,
          group: "blueprint",
        },
      );
    }
  }

  const verticalFinOutline: [number, number][] = [
    [0, 0],
    [0.38, 0.36],
    [0.76, 0.95],
    [1.35, 1.42],
    [2.08, 1.58],
    [2.58, 1.36],
    [2.48, 0.88],
    [2.22, 0.18],
    [1.4, 0],
  ];

  const fin = b.extrude(verticalFinOutline, {
    at: [0, 2.36, -4.0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.12,
    bevel: 0.035,
    smoothing: 1,
    bone: airframe,
    color: blueprintMetal,
    name: "verticalTail",
    group: "tail",
  });

  b.decal(fin, TAIL_MARK, {
    at: [0.075, 3.08, -2.75],
    dir: [1, 0, 0],
    up: [0, 1, 0],
    size: [0.54, 0.54],
    lift: 0.01,
    segments: 6,
    name: "tailFinMark",
    group: "markings",
  });

  b.rod(
    [0.08, 2.52, -3.98],
    [0.08, 3.66, -2.05],
    0.018,
    {
      color: PALE,
      bone: airframe,
      name: "finLeadingEdge",
      group: "blueprint",
    },
  );

  const canopy = b.loft(
    [
      { at: [0, 2.66, 0.28], w: 0.7, h: 0.18 },
      { at: [0, 2.84, 0.66], w: 1.02, h: 0.48 },
      { at: [0, 2.91, 1.18], w: 1.08, h: 0.58 },
      { at: [0, 2.82, 1.72], w: 0.75, h: 0.43 },
      { at: [0, 2.67, 2.04], w: 0.28, h: 0.16 },
    ],
    {
      bone: airframe,
      color: DEEP,
      sides: 8,
      smooth: false,
      caps: "round",
      name: "cockpitCanopy",
      group: "cockpit",
    },
  );

  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.92, 0.32), WHITE, {
      texture: CANOPY_WINDOW,
      at: [s * 0.53, 2.86, 1.08],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      bone: airframe,
      name: s > 0 ? "canopySideL" : "canopySideR",
      group: "cockpit",
    });
  }

  b.part(new THREE.PlaneGeometry(0.76, 0.32), WHITE, {
    texture: CANOPY_WINDOW,
    at: [0, 2.91, 0.42],
    dir: [0, 0, 1],
    axis: "z",
    up: [0, 1, 0],
    bone: airframe,
    name: "windscreen",
    group: "cockpit",
  });

  b.part(new THREE.PlaneGeometry(0.52, 0.27), WHITE, {
    texture: INSTRUMENTS,
    at: [0, 2.93, 1.39],
    dir: [0, 1, 0],
    axis: "z",
    up: [0, 0, 1],
    bone: airframe,
    name: "instrumentPanel",
    group: "cockpit",
  });

  b.decal(fuselage, SIDE_LABEL, {
    at: [0.59, 2.28, -0.95],
    dir: [1, 0, 0],
    up: [0, 1, 0],
    size: [1.45, 0.29],
    lift: 0.012,
    segments: 8,
    name: "fuselageLabelL",
    group: "blueprint",
  });

  b.decal(fuselage, SIDE_LABEL, {
    at: [-0.59, 2.28, -0.95],
    dir: [-1, 0, 0],
    up: [0, 1, 0],
    size: [1.45, 0.29],
    lift: 0.012,
    segments: 8,
    mirror: true,
    name: "fuselageLabelR",
    group: "blueprint",
  });

  for (const s of [1, -1]) {
    b.decal(fuselage, ROUNDel, {
      at: [s * 0.61, 2.34, 0.02],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.78, 0.78],
      lift: 0.012,
      segments: 8,
      mirror: s < 0,
      name: s > 0 ? "fuselageRoundelL" : "fuselageRoundelR",
      group: "markings",
    });
  }

  for (const z of [-3.72, -3.05, -2.25, -1.35, -0.35, 0.72, 1.8, 2.72, 3.55]) {
    const loop = fuselageSurface.loop([0, 2.34, z], {
      dir: [0, 0, 1],
      lift: 0.01,
    });
    b.sweep(loop, 0.014, {
      bone: airframe,
      color: CYAN,
      sides: 6,
      caps: "none",
      name: `fuselageStation${z.toString().replace("-", "m").replace(".", "d")}`,
      group: "blueprint",
    });
  }

  for (const angle of [0, 90, 180, 270]) {
    b.sweep(fuselage.line(angle), 0.012, {
      bone: airframe,
      color: angle === 0 ? PALE : CYAN,
      sides: 6,
      caps: "none",
      name: `fuselageLongitudinal${angle}`,
      group: "blueprint",
    });
  }

  const rivets = fuselageSurface.scatter(58, {
    rng: rng(17),
    minDist: 0.28,
    filter: (h: any) => h.n.y > -0.15 && Math.abs(h.n.z) > 0.25,
  });
  for (let i = 0; i < rivets.length; i++) {
    b.stick(
      new THREE.SphereGeometry(0.026, 6, 4),
      PALE,
      rivets[i],
      {
        embed: 0.36,
        name: `fuselageRivet${i}`,
        group: "rivets",
      },
    );
  }

  cylinder(b, 0.63, 0.22, blueprintMetal, [0, 2.34, 4.54], [0, 0, 1], "engineCowlingRing", airframe, 12);
  cylinder(b, 0.45, 0.12, PALE, [0, 2.34, 4.68], [0, 0, 1], "engineFrontRing", airframe, 12);

  b.part(new THREE.ConeGeometry(0.28, 0.62, 12), lightEdge, {
    at: [0, 2.34, 4.91],
    dir: [0, 0, 1],
    bone: airframe,
    flat: true,
    name: "spinner",
    group: "propeller",
  });

  cylinder(b, 0.18, 0.18, INK, [0, 2.34, 5.2], [0, 0, 1], "propellerHub", airframe, 10);

  const propBlade: [number, number][] = [
    [-0.1, 0.09],
    [0.11, 0.1],
    [0.18, 0.46],
    [0.16, 0.92],
    [0.06, 1.48],
    [-0.08, 1.67],
    [-0.2, 1.28],
    [-0.22, 0.64],
  ];

  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3 + 0.18;
    const ux: [number, number, number] = [Math.cos(a), Math.sin(a), 0];
    const uy: [number, number, number] = [-Math.sin(a), Math.cos(a), 0];
    b.extrude(propBlade, {
      at: [0, 2.34, 5.2],
      x: ux,
      y: uy,
      thickness: 0.075,
      bevel: 0.018,
      smoothing: 1,
      bone: airframe,
      color: i === 1 ? PALE : CYAN,
      name: `propellerBlade${i}`,
      group: "propeller",
    });
  }

  for (const s of [1, -1]) {
    b.rod(
      [s * 0.7, 2.0, 0.45],
      [s * 1.42, 0.6, 0.35],
      0.075,
      {
        bone: airframe,
        color: lightEdge,
        name: s > 0 ? "mainGearStrutL" : "mainGearStrutR",
        group: "landingGear",
      },
    );

    cylinder(b, 0.32, 0.18, RUBBER, [s * 1.42, 0.34, 0.35], [1, 0, 0], s > 0 ? "mainWheelL" : "mainWheelR", airframe, 10);
    cylinder(b, 0.115, 0.2, PALE, [s * 1.42, 0.34, 0.35], [1, 0, 0], s > 0 ? "mainHubL" : "mainHubR", airframe, 10);
    cylinder(b, 0.045, 0.22, INK, [s * 1.42, 0.34, 0.35], [1, 0, 0], s > 0 ? "mainAxleL" : "mainAxleR", airframe, 8);
  }

  b.rod(
    [0, 1.84, -3.12],
    [0, 0.35, -3.55],
    0.055,
    {
      bone: airframe,
      color: lightEdge,
      name: "tailWheelFork",
      group: "landingGear",
    },
  );
  cylinder(b, 0.19, 0.13, RUBBER, [0, 0.19, -3.56], [1, 0, 0], "tailWheel", airframe, 10);
  cylinder(b, 0.07, 0.15, PALE, [0, 0.19, -3.56], [1, 0, 0], "tailWheelHub", airframe, 8);

  b.rod(
    [-0.03, 2.39, -4.4],
    [0.03, 2.39, -3.76],
    0.03,
    {
      bone: airframe,
      color: CYAN,
      name: "tailSternLine",
      group: "blueprint",
    },
  );

  b.part(new THREE.BoxGeometry(0.72, 0.055, 0.18), PALE, {
    at: [0, 2.24, -0.34],
    bone: airframe,
    flat: true,
    name: "wingRootFairing",
    group: "airframe",
  });

  b.part(new THREE.BoxGeometry(0.38, 0.06, 0.65), BLUE2, {
    at: [0, 2.2, 2.95],
    bone: airframe,
    flat: true,
    name: "noseTopPanel",
    group: "airframe",
  });

  const antenna = b.rod(
    [0, 2.92, -1.38],
    [0, 3.48, -1.82],
    0.018,
    {
      bone: airframe,
      color: PALE,
      name: "radioMast",
      group: "blueprint",
    },
  );

  b.part(new THREE.SphereGeometry(0.035, 6, 4), PALE, {
    at: [0, 3.49, -1.83],
    bone: airframe,
    name: "radioMastTip",
    group: "blueprint",
  });

  b.rod(
    [-0.03, 2.88, -1.42],
    [0.03, 2.88, -1.42],
    0.012,
    {
      bone: airframe,
      color: CYAN,
      name: "antennaBase",
      group: "blueprint",
    },
  );

  return b.root;
}
