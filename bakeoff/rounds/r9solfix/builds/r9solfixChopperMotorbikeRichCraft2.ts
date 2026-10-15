import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  bezier,
  polyline,
  rng,
  paint,
  grain,
  noise,
  mix,
  svg,
} from "../../../../src/index";
import type { Joint, Fill, PointInput } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { coil } from "../../../../kits/clockwork";

export const meta = {
  name: "HELLION 07 — custom chopper",
  description:
    "A hero-scale futuristic chopper: raked ivory forks, oversized rear rubber, orange armored tank, exposed V-twin reactor, twin exhausts and ice-blue running lights, on a compact service-bay plinth.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Hellion07",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(707);

  const C = {
    ink: "#101b27",
    dark: "#203241",
    rubber: "#171e27",
    tread: "#29323c",
    steel: "#90a4ad",
    bright: "#d5e1de",
    ivory: "#eee8d7",
    orange: "#ee6428",
    amber: "#ffc25b",
    cyan: "#66f4ef",
    blue: "#126b82",
    red: "#ff475c",
    floor: "#283a49",
    floorEdge: "#172633",
  };

  const armor = paint((p, n) => {
    const top = Math.max(0, n.y);
    const base = mix("#c1c5b9", C.ivory, 0.56 + 0.35 * top);
    const scuff = noise(p, 0.033, 19);
    return scuff > 0.75 && n.y < 0.6
      ? mix(base, "#7f9697", 0.3)
      : base;
  });

  const orange = paint((p, n) =>
    mix(
      "#bb3b22",
      "#ff8236",
      0.50 + 0.25 * n.y + 0.16 * noise(p, 0.08, 7),
    ),
  );

  const alloy = paint((p, n) => {
    const fine = noise(p, 0.008, 22);
    return mix(
      "#526874",
      "#d8e3df",
      0.38 + 0.3 * Math.max(n.y, 0) + 0.18 * fine,
    );
  });

  const saddlePaint = grain("#192731", "#33424b", {
    size: 0.0035,
    axis: "z",
    seed: 12,
  });

  const tankPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (ax < 0.085) return orange;
    if (ax < 0.101) return C.ink;
    if (ax < 0.115) return C.amber;
    return armor;
  });

  const floorPaint = paint((p, n) => {
    if (n.y < 0.5) return C.floorEdge;
    const lines =
      Math.abs(Math.sin(p.x * 7.8)) < 0.012 ||
      Math.abs(Math.sin(p.z * 7.8)) < 0.012;
    return lines ? "#415563" : "#2c404e";
  });

  // The few functional bones are authored before their geometry.
  const chassis = b.joint("chassis", { at: [0, 0, 0] });
  const steering = b.joint("steering", {
    parent: chassis,
    at: [0, 1.22, 0.43],
    dir: [0, 0.68, -0.73],
    role: "hinge",
  });
  const rearAxle = b.joint("rearAxle", {
    parent: chassis,
    at: [0, 0.56, -0.99],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const frontAxle = b.joint("frontAxle", {
    parent: steering,
    at: [0, 0.59, 1.27],
    dir: [1, 0, 0],
    role: "hinge",
  });

  function box(
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint = chassis,
    rotation: number[] = [0, 0, 0],
    name?: string,
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
    });
  }

  function cylinder(
    at: PointInput,
    radius: number,
    depth: number,
    color: Fill,
    direction: number[] = [1, 0, 0],
    bone: Joint = chassis,
    segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, depth, segments, 1),
      color,
      { at, bone, dir: direction },
    );
  }

  function ring(
    at: number[],
    radius: number,
    tube: number,
    color: Fill,
    bone: Joint = chassis,
    axis: "x" | "y" | "z" = "x",
    segments = 32,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, segments), color, {
      at,
      bone,
      rotation:
        axis === "x" ? [0, 90, 0] : axis === "y" ? [90, 0, 0] : [0, 0, 0],
    });
  }

  function bolt(
    at: number[],
    direction: number[],
    bone: Joint = chassis,
    radius = 0.012,
    color: Fill = alloy,
  ) {
    const head = cylinder(at, radius, 0.012, color, direction, bone, 6);
    const p = new THREE.Vector3(...at).addScaledVector(
      new THREE.Vector3(...direction).normalize(),
      0.007,
    );
    cylinder(p, radius * 0.38, 0.002, C.ink, direction, bone, 6);
    return head;
  }

  function tube(
    points: PointInput[],
    radius: number,
    color: Fill,
    bone: Joint = chassis,
    sides = 8,
  ) {
    return b.sweep(polyline(points), radius, {
      color,
      bone,
      sides,
      smooth: false,
      caps: "flat",
    });
  }

  function face(
    at: PointInput,
    w: number,
    h: number,
    texture: THREE.Texture,
    normal: number[],
    bone: Joint = chassis,
    up: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", {
      at,
      dir: normal,
      axis: "z",
      up,
      bone,
      texture,
    });
  }

  // Original insignia and industrial drawings: no licensed game logo.
  const emblem = svg(
    `<svg viewBox="0 0 160 160">
      <path d="M80 7 L142 42 L142 116 L80 153 L18 116 L18 42 Z"
        fill="#152635" stroke="#efb653" stroke-width="5"/>
      <path d="M34 46 L66 65 L80 38 L94 65 L126 46
        L108 96 L89 108 L80 133 L71 108 L52 96 Z" fill="#ed692b"/>
      <path d="M48 58 L70 77 L80 58 L90 77 L112 58
        L96 90 L80 99 L64 90 Z" fill="#eee8d7"/>
      <path d="M80 79 L88 96 L80 116 L72 96 Z" fill="#66f4ef"/>
      <path d="M28 121 L54 137 M106 137 L132 121" stroke="#efb653"
        stroke-width="4" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const tankLabel = svg(
    `<svg viewBox="0 0 320 140">
      <path d="M8 18 L304 18 L312 28 L312 118 L16 118 L8 108Z"
        fill="#152635" stroke="#ed692b" stroke-width="5"/>
      <path d="M22 30H293 M22 107H293" stroke="#dddccc" stroke-width="2"/>
      <text x="26" y="78" font-family="sans-serif" font-weight="900"
        font-style="italic" font-size="51" fill="#eee8d7">HELLION</text>
      <text x="27" y="99" font-family="monospace" font-size="13"
        letter-spacing="4" fill="#ffc25b">CUSTOM // REACTOR SERIES</text>
      <path d="M267 36 l17 0 -13 14 19 0" stroke="#66f4ef"
        stroke-width="5" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const warning = svg(
    `<svg viewBox="0 0 220 90">
      <rect x="2" y="2" width="216" height="86" rx="7" fill="#ed692b"
        stroke="#172633" stroke-width="4"/>
      <path d="M18 62 L43 19 L68 62Z" fill="#172633"/>
      <path d="M43 32V46 M43 53V57" stroke="#ffc25b" stroke-width="6"/>
      <text x="81" y="38" font-family="sans-serif" font-weight="900"
        font-size="17" fill="#152635">HOT CORE</text>
      <text x="81" y="61" font-family="monospace" font-size="12"
        fill="#eee8d7">DO NOT UNSEAL</text>
    </svg>`,
    { size: 256 },
  );

  const dash = svg(
    `<svg viewBox="0 0 240 140">
      <rect width="240" height="140" rx="13" fill="#071b29"/>
      <path d="M10 30V10H64 M176 10H230V30 M10 110V130H64
        M176 130H230V110" fill="none" stroke="#3da7ad" stroke-width="3"/>
      <text x="19" y="32" font-family="monospace" font-size="14"
        fill="#66f4ef">HELLION / READY</text>
      <text x="20" y="100" font-family="sans-serif" font-weight="900"
        font-size="72" fill="#d6fff5">00</text>
      <text x="124" y="73" font-family="monospace" font-size="15"
        fill="#80b7bd">KM/H</text>
      <text x="127" y="99" font-family="monospace" font-size="13"
        fill="#ffc25b">BOOST 07</text>
      <path d="M21 118h20m7 0h20m7 0h20m7 0h20m7 0h20m7 0h20"
        stroke="#66f4ef" stroke-width="7"/>
      <circle cx="211" cy="96" r="8" fill="#ed692b"/>
    </svg>`,
    { size: 384 },
  );

  const plate = svg(
    `<svg viewBox="0 0 240 110">
      <rect x="3" y="3" width="234" height="104" rx="9"
        fill="#eee8d7" stroke="#142936" stroke-width="6"/>
      <text x="120" y="29" text-anchor="middle" font-family="monospace"
        font-size="14" letter-spacing="5" fill="#ed692b">CUSTOM WORKS</text>
      <text x="120" y="79" text-anchor="middle" font-family="sans-serif"
        font-weight="900" font-size="47" fill="#152635">HLN • 07</text>
      <path d="M18 94H222" stroke="#ed692b" stroke-width="4"/>
      <circle cx="15" cy="15" r="4" fill="#152635"/>
      <circle cx="225" cy="15" r="4" fill="#152635"/>
    </svg>`,
    { size: 384 },
  );

  let rotorHoles = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    const x = 100 + Math.sin(a) * 68;
    const y = 100 + Math.cos(a) * 68;
    rotorHoles += `<circle cx="${x}" cy="${y}" r="5.5" fill="#1b2b36"/>`;
  }
  const rotor = svg(
    `<svg viewBox="0 0 200 200">
      <path d="M100 5 A95 95 0 1 1 99.99 5
        M100 62 A38 38 0 1 0 100.01 62Z" fill="#aebfc1" fill-rule="evenodd"/>
      <circle cx="100" cy="100" r="89" fill="none" stroke="#eef0df"
        stroke-width="3"/>
      <circle cx="100" cy="100" r="51" fill="none" stroke="#506775"
        stroke-width="4"/>
      ${rotorHoles}
      <path d="M48 55L58 65 M148 55L138 65 M48 145L58 135
        M148 145L138 135" stroke="#ed692b" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const seatStitches = svg(
    `<svg viewBox="0 0 160 240">
      <rect width="160" height="240" rx="20" fill="#192731"/>
      <rect x="12" y="12" width="136" height="216" rx="14"
        fill="none" stroke="#e29a56" stroke-width="3" stroke-dasharray="6 7"/>
      <path d="M25 55Q80 73 135 55 M25 95Q80 113 135 95
        M25 135Q80 153 135 135 M25 175Q80 193 135 175"
        stroke="#40515c" stroke-width="5" fill="none"/>
      <path d="M25 61Q80 79 135 61 M25 101Q80 119 135 101
        M25 141Q80 159 135 141 M25 181Q80 199 135 181"
        stroke="#0e1923" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const lamp = svg(
    `<svg viewBox="0 0 300 135">
      <rect width="300" height="135" rx="13" fill="#0a2532"/>
      <path d="M20 20H280 M20 116H280" stroke="#417e85"
        stroke-width="3"/>
      <path d="M28 37H100L119 65L100 93H28L47 65Z
        M112 37H184L203 65L184 93H112L131 65Z
        M196 37H267L286 65L267 93H196L215 65Z"
        fill="#66f4ef"/>
      <path d="M40 43H95 M124 43H179 M208 43H262"
        stroke="#e1fff6" stroke-width="5"/>
      <circle cx="26" cy="105" r="5" fill="#ffc25b"/>
      <circle cx="274" cy="105" r="5" fill="#ffc25b"/>
    </svg>`,
    { size: 384 },
  );

  // A low, cut-corner service platform keeps the bike the hero.
  b.extrude(
    [
      [-0.66, -1.76],
      [0.66, -1.76],
      [0.82, -1.56],
      [0.82, 1.62],
      [0.63, 1.83],
      [-0.63, 1.83],
      [-0.82, 1.62],
      [-0.82, -1.56],
    ],
    {
      at: [0, 0.05, 0.02],
      x: [1, 0, 0],
      y: [0, 0, 1],
      thickness: 0.1,
      bevel: 0.018,
      color: floorPaint,
      bone: chassis,
      name: "servicePlinth",
    },
  );

  for (const s of [-1, 1]) {
    box([s * 0.745, 0.105, 0.03], [0.025, 0.01, 2.94], C.steel);
    for (let i = 0; i < 7; i++) {
      box(
        [s * 0.64, 0.109, -1.53 + i * 0.092],
        [0.13, 0.012, 0.038],
        i % 2 ? C.ink : C.orange,
        chassis,
        [0, s * 35, 0],
      );
    }
    glow(
      box([s * 0.786, 0.062, 0.63], [0.013, 0.019, 0.61], C.cyan),
      0.65,
    );
  }
  box([0, 0.108, 1.65], [0.60, 0.014, 0.18], C.ink);
  face(
    [0, 0.118, 1.65],
    0.56,
    0.15,
    tankLabel,
    [0, 1, 0],
    chassis,
    [0, 0, -1],
  );

  // Wheels: broad rear tire, unusually tall narrow front, swept machined spokes.
  function wheel(
    joint: Joint,
    y: number,
    z: number,
    major: number,
    tireTube: number,
    widthScale: number,
    rimRadius: number,
    front: boolean,
  ) {
    const tire = b.part(
      new THREE.TorusGeometry(major, tireTube, 8, 40),
      C.rubber,
      {
        at: [0, y, z],
        bone: joint,
        rotation: [0, 90, 0],
        scale: [1, 1, widthScale],
        name: front ? "frontTire" : "rearTire",
      },
    );

    const outer = major + tireTube;
    const side = tireTube * widthScale * 0.87;
    for (const s of [-1, 1]) {
      ring([s * side, y, z], rimRadius, front ? 0.024 : 0.031, armor, joint);
      ring(
        [s * (side + 0.005), y, z],
        rimRadius - 0.035,
        0.009,
        orange,
        joint,
      );
      ring(
        [s * side, y, z],
        major + tireTube * 0.24,
        0.007,
        C.tread,
        joint,
      );
    }

    // Chevron blocks are actual chunky rubber, not high-resolution surface noise.
    const count = front ? 30 : 32;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const degrees = (a * 180) / Math.PI;
      if (front) {
        box(
          [0, y + (outer - 0.002) * Math.cos(a), z + (outer - 0.002) * Math.sin(a)],
          [0.115, 0.015, 0.050],
          i % 5 === 0 ? "#34404a" : C.tread,
          joint,
          [degrees, 0, 0],
        );
      } else {
        for (const s of [-1, 1]) {
          box(
            [
              s * 0.076,
              y + (outer - 0.014) * Math.cos(a),
              z + (outer - 0.014) * Math.sin(a),
            ],
            [0.125, 0.022, 0.061],
            i % 4 === 0 ? "#34404a" : C.tread,
            joint,
            [degrees, s * 18, 0],
          );
        }
      }
    }

    cylinder([0, y, z], front ? 0.077 : 0.097, side * 2 + 0.065, C.dark, [1, 0, 0], joint);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const r0 = front ? 0.077 : 0.095;
      const r1 = rimRadius - 0.018;
      const spoke = [
        [r0, -0.019],
        [r1, 0.015],
        [r1 - 0.012, 0.061],
        [r0, 0.024],
      ];
      b.extrude(spoke, {
        at: [0, y, z],
        x: [0, Math.cos(a), Math.sin(a)],
        y: [0, -Math.sin(a), Math.cos(a)],
        thickness: front ? 0.072 : 0.13,
        bevel: 0.004,
        color: alloy,
        bone: joint,
        name: `${front ? "front" : "rear"}SweptSpoke${i}`,
      });
    }

    for (const s of [-1, 1]) {
      cylinder(
        [s * (side + 0.021), y, z],
        front ? 0.069 : 0.084,
        0.033,
        orange,
        [1, 0, 0],
        joint,
      );
      bolt(
        [s * (side + 0.043), y, z],
        [s, 0, 0],
        joint,
        front ? 0.025 : 0.029,
      );
    }

    const brakeX = front ? -0.105 : -0.197;
    const brakeR = front ? 0.222 : 0.185;
    ring([brakeX, y, z], brakeR * 0.88, 0.025, alloy, joint);
    face(
      [brakeX - 0.006, y, z],
      brakeR * 2,
      brakeR * 2,
      rotor,
      [-1, 0, 0],
      joint,
    );
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.rod(
        [brakeX, y + 0.055 * Math.cos(a), z + 0.055 * Math.sin(a)],
        [brakeX, y + brakeR * 0.70 * Math.cos(a + 0.12), z + brakeR * 0.70 * Math.sin(a + 0.12)],
        0.013,
        { color: C.dark, bone: joint, sides: 6 },
      );
    }
    // Tire embossing accents live on the actual sidewalls.
    const sidewall = b.surface(tire);
    for (const s of [-1, 1]) {
      const hit = sidewall.nearest([s * tireTube * widthScale, y + major, z]);
      if (hit) {
        b.stick(new THREE.BoxGeometry(0.075, 0.006, 0.018), C.steel, hit, {
          embed: 0.35,
          bone: joint,
        });
      }
    }
  }

  wheel(rearAxle, 0.56, -0.99, 0.34, 0.12, 1.42, 0.292, false);
  wheel(frontAxle, 0.59, 1.27, 0.425, 0.065, 1.0, 0.389, true);

  // Two hardtail-like frame triangles surround, rather than hide, the V-twin.
  for (const s of [-1, 1]) {
    const x = s * 0.19;
    tube(
      [
        [x, 1.19, 0.42],
        [x, 0.35, 0.25],
        [x, 0.32, -0.54],
        [x, 0.56, -0.99],
      ],
      0.037,
      orange,
    );
    tube(
      [
        [x, 1.19, 0.42],
        [x, 1.03, -0.53],
        [x, 0.56, -0.99],
      ],
      0.036,
      orange,
    );
    b.frustumBox(
      [s * 0.205, 0.53, -0.35],
      [s * 0.205, 0.56, -0.99],
      [0.085, 0.105],
      [0.07, 0.075],
      { color: armor, bone: chassis },
    );
    box([s * 0.228, 0.56, -0.96], [0.065, 0.13, 0.16], C.dark);
    bolt([s * 0.265, 0.56, -0.99], [s, 0, 0], chassis, 0.029);
  }
  for (const z of [-0.53, 0.23]) {
    b.rod([-0.22, 0.34, z], [0.22, 0.34, z], 0.031, {
      color: C.dark,
      bone: chassis,
    });
  }
  b.rod([0, 1.18, 0.42], [0, 1.02, -0.57], 0.051, {
    color: C.dark,
    bone: chassis,
  });

  // Low belly armor and its recessed orange vent field.
  b.extrude(
    [
      [-0.36, 0.0],
      [0.29, 0.0],
      [0.41, 0.10],
      [0.25, 0.18],
      [-0.34, 0.15],
      [-0.43, 0.06],
    ],
    {
      at: [0, 0.29, -0.16],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.38,
      bevel: 0.018,
      color: armor,
      bone: chassis,
      name: "bellySkidArmor",
    },
  );
  for (const s of [-1, 1]) {
    box([s * 0.194, 0.375, -0.17], [0.018, 0.052, 0.31], C.ink);
    for (let i = 0; i < 5; i++) {
      box(
        [s * 0.207, 0.376, -0.285 + i * 0.058],
        [0.014, 0.041, 0.018],
        C.orange,
        chassis,
        [s * 22, 0, 0],
      );
    }
  }

  // Crankcase: dark cast housing, pale radial cover, and a bright reactor seal.
  cylinder([0, 0.615, -0.135], 0.226, 0.39, C.dark, [1, 0, 0], chassis, 12);
  cylinder([0.226, 0.615, -0.135], 0.194, 0.047, alloy, [1, 0, 0], chassis, 12);
  cylinder([-0.227, 0.615, -0.135], 0.188, 0.045, armor, [1, 0, 0], chassis, 12);
  ring([0.252, 0.615, -0.135], 0.156, 0.018, orange);
  glow(ring([0.267, 0.615, -0.135], 0.128, 0.009, C.cyan), 1.15);
  cylinder([0.262, 0.615, -0.135], 0.113, 0.026, C.ink);
  face([0.277, 0.615, -0.135], 0.153, 0.153, emblem, [1, 0, 0]);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    bolt(
      [0.256, 0.615 + Math.cos(a) * 0.178, -0.135 + Math.sin(a) * 0.178],
      [1, 0, 0],
      chassis,
      0.010,
    );
  }

  // Two sharply separated banks, with broad stacked cooling fins.
  const engineBanks = [
    {
      base: new THREE.Vector3(0, 0.715, -0.065),
      top: new THREE.Vector3(0, 0.998, 0.182),
    },
    {
      base: new THREE.Vector3(0, 0.715, -0.245),
      top: new THREE.Vector3(0, 0.986, -0.466),
    },
  ];

  engineBanks.forEach((bank, bankIndex) => {
    const axis = bank.top.clone().sub(bank.base).normalize();
    b.rod(bank.base, bank.top, 0.119, {
      color: C.ink,
      bone: chassis,
      sides: 8,
    });
    for (let i = 0; i < 8; i++) {
      const p = bank.base.clone().lerp(bank.top, 0.11 + i * 0.102);
      b.part(
        new THREE.CylinderGeometry(0.149, 0.149, 0.018, 8, 1),
        i === 7 ? orange : alloy,
        { at: p, dir: axis, bone: chassis },
      );
    }
    b.part(new THREE.CylinderGeometry(0.155, 0.16, 0.063, 8, 1), armor, {
      at: bank.top,
      dir: axis,
      bone: chassis,
      name: `cylinderHead${bankIndex}`,
    });
    b.part(new THREE.CylinderGeometry(0.118, 0.132, 0.028, 8, 1), C.dark, {
      at: bank.top.clone().addScaledVector(axis, 0.043),
      dir: axis,
      bone: chassis,
    });
    for (const s of [-1, 1]) {
      const a = bank.base.clone().add(new THREE.Vector3(s * 0.105, 0, 0));
      const c = bank.top.clone().add(new THREE.Vector3(s * 0.105, 0, 0));
      b.rod(a, c, 0.013, { color: C.bright, bone: chassis, sides: 6 });
    }
  });

  // Air cleaner on the uncluttered left side.
  cylinder([0.245, 0.86, -0.14], 0.102, 0.07, C.ink);
  cylinder([0.283, 0.86, -0.14], 0.091, 0.025, orange);
  cylinder([0.300, 0.86, -0.14], 0.070, 0.017, C.dark);
  for (let i = -2; i <= 2; i++) {
    box(
      [0.311, 0.86 + i * 0.021, -0.14],
      [0.012, 0.009, 0.113 - Math.abs(i) * 0.017],
      C.bright,
    );
  }
  face([0.220, 0.49, 0.081], 0.115, 0.048, warning, [1, 0, 0]);

  // Main armored fuel tank. A continuous central racing stripe follows its facets.
  const tank = b.loft(
    [
      { at: [0, 1.102, -0.40], w: 0.30, h: 0.16 },
      { at: [0, 1.165, -0.25], w: 0.56, h: 0.29 },
      { at: [0, 1.184, 0.035], w: 0.62, h: 0.31 },
      { at: [0, 1.151, 0.25], w: 0.45, h: 0.245 },
      { at: [0, 1.16, 0.385], w: 0.18, h: 0.13 },
    ],
    {
      color: tankPaint,
      bone: chassis,
      section: { ngon: 8 },
      caps: "flat",
      smooth: false,
      name: "armoredStripedTank",
    },
  );

  const tankSurface = b.surface(tank);
  for (const s of [-1, 1]) {
    const hit = tankSurface.nearest([s * 0.32, 1.185, -0.035]);
    b.decal(tank, tankLabel, {
      at: hit,
      dir: [s, 0, 0],
      size: [0.315, 0.137],
      lift: 0.002,
      bone: chassis,
      name: s > 0 ? "tankWordmarkL" : "tankWordmarkR",
    });
    const frontHit = tankSurface.nearest([s * 0.205, 1.2, 0.23]);
    b.decal(tank, emblem, {
      at: frontHit,
      dir: [s, 0.10, 0.18],
      size: [0.106, 0.106],
      lift: 0.002,
      bone: chassis,
    });
    const seam = tankSurface.drape(
      [
        [s * 0.18, 1.07, -0.31],
        [s * 0.28, 1.05, -0.06],
        [s * 0.25, 1.06, 0.17],
      ],
      { lift: 0.002 },
    );
    b.sweep(seam, 0.005, {
      color: C.ink,
      bone: chassis,
      sides: 4,
      caps: "flat",
    });
  }

  const capHit = tankSurface.nearest([0, 1.40, -0.055]);
  b.stick(new THREE.CylinderGeometry(0.063, 0.070, 0.019, 10), C.ink, capHit, {
    embed: 0.15,
    bone: chassis,
  });
  b.stick(new THREE.CylinderGeometry(0.049, 0.049, 0.032, 10), alloy, capHit, {
    embed: -0.38,
    bone: chassis,
  });
  box([0, 1.358, -0.055], [0.054, 0.010, 0.015], C.ink);

  // Solo saddle, a broad shaped shell with inset stitched leather.
  b.loft(
    [
      { at: [0, 1.078, -0.86], w: 0.30, h: 0.10 },
      { at: [0, 1.070, -0.70], w: 0.415, h: 0.105 },
      { at: [0, 1.035, -0.48], w: 0.31, h: 0.078 },
      { at: [0, 1.045, -0.37], w: 0.16, h: 0.065 },
    ],
    {
      color: C.ink,
      bone: chassis,
      section: { ngon: 8 },
      caps: "flat",
      smooth: false,
      name: "soloSaddleShell",
    },
  );
  box([0, 1.126, -0.668], [0.33, 0.038, 0.35], saddlePaint, chassis, [7, 0, 0]);
  face(
    [0, 1.148, -0.669],
    0.315,
    0.35,
    seatStitches,
    [0, 0.9925, 0.122],
    chassis,
    [0, 0.122, -0.9925],
  );
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.14, 1.12, -0.85],
        [s * 0.20, 1.10, -0.70],
        [s * 0.15, 1.065, -0.48],
      ]),
      0.007,
      { color: orange, bone: chassis, sides: 6 },
    );
  }

  // Rear fender is a real thick sheet over the wide tire.
  const rearEdge = (x: number) =>
    Array.from({ length: 13 }, (_, i) => {
      const a = ((-72 + (i * 144) / 12) * Math.PI) / 180;
      return [x, 0.56 + 0.492 * Math.cos(a), -0.99 + 0.492 * Math.sin(a)];
    });
  b.membrane(rearEdge(-0.218), rearEdge(0.218), {
    color: tankPaint,
    thickness: 0.027,
    rows: 2,
    cols: 12,
    bone: chassis,
    name: "rearArmorFender",
  });
  for (const s of [-1, 1]) {
    b.sweep(rearEdge(s * 0.219), 0.009, {
      color: C.ink,
      bone: chassis,
      sides: 6,
    });
    b.rod([s * 0.18, 0.60, -1.04], [s * 0.21, 0.86, -1.31], 0.017, {
      color: alloy,
      bone: chassis,
    });
  }

  box([0, 0.825, -1.464], [0.34, 0.108, 0.059], C.ink, chassis, [-16, 0, 0]);
  glow(
    box([0, 0.833, -1.498], [0.26, 0.030, 0.014], C.red, chassis, [-16, 0, 0]),
    1.4,
  );
  box([0, 0.683, -1.472], [0.24, 0.13, 0.027], C.dark, chassis, [-12, 0, 0]);
  face([0, 0.683, -1.489], 0.228, 0.105, plate, [0, 0.208, -0.978]);
  for (const s of [-1, 1]) {
    b.rod([s * 0.17, 0.80, -1.34], [s * 0.285, 0.80, -1.35], 0.015, {
      color: C.dark,
      bone: chassis,
    });
    glow(
      cylinder([s * 0.29, 0.80, -1.356], 0.028, 0.05, C.amber, [0, 0, -1]),
      0.85,
    );
  }

  // Compact shock absorbers, with chunky visible springs.
  for (const s of [-1, 1]) {
    const top = [s * 0.245, 1.018, -0.66];
    // Model-space endpoints keep both eyes, spring and shaft coaxial.
    const lower = [s * 0.245, 0.605, -0.91];
    b.rod(top, lower, 0.026, { color: alloy, bone: chassis });
    b.sweep(coil(top, lower, 0.053, 6.5), 0.009, {
      color: orange,
      bone: chassis,
      sides: 6,
      caps: "flat",
    });
    cylinder(top, 0.042, 0.055, C.dark);
    cylinder(lower, 0.042, 0.055, C.dark);
    bolt([s * 0.28, 1.018, -0.66], [s, 0, 0], chassis, 0.019);
    bolt([s * 0.28, 0.605, -0.91], [s, 0, 0], chassis, 0.019);
  }

  // Visible left-side belt drive.
  cylinder([0.239, 0.56, -0.99], 0.184, 0.043, C.ink);
  cylinder([0.267, 0.56, -0.99], 0.163, 0.015, orange);
  ring([0.279, 0.56, -0.99], 0.136, 0.012, alloy);
  cylinder([0.264, 0.56, -0.382], 0.092, 0.052, C.dark);
  cylinder([0.295, 0.56, -0.382], 0.065, 0.015, alloy);
  bolt([0.309, 0.56, -0.382], [1, 0, 0], chassis, 0.022);

  const belt = catmull(
    [
      [0.254, 0.741, -0.99],
      [0.254, 0.674, -0.382],
      [0.254, 0.56, -0.272],
      [0.254, 0.446, -0.382],
      [0.254, 0.379, -0.99],
      [0.254, 0.426, -1.118],
      [0.254, 0.56, -1.174],
      [0.254, 0.694, -1.118],
    ],
    { closed: true },
  );
  b.sweep(belt, () => [0.021, 0.015], {
    color: C.rubber,
    bone: chassis,
    sides: 4,
    caps: "flat",
  });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    box(
      [0.282, 0.56 + 0.108 * Math.cos(a), -0.99 + 0.108 * Math.sin(a)],
      [0.015, 0.047, 0.018],
      C.ink,
      chassis,
      [(a * 180) / Math.PI, 0, 0],
    );
  }
  face([0.294, 0.56, -0.99], 0.108, 0.108, emblem, [1, 0, 0]);

  // Long raked forks: inner stanchions, colored sleeves, lower armored castings.
  const forkTopY = 1.373;
  const forkTopZ = 0.358;
  for (const s of [-1, 1]) {
    const top = new THREE.Vector3(s * 0.15, forkTopY, forkTopZ);
    const axle = new THREE.Vector3(s * 0.15, 0.59, 1.27);
    const upperEnd = top.clone().lerp(axle, 0.43);
    const lowerStart = top.clone().lerp(axle, 0.68);

    b.rod(top, axle, 0.027, {
      color: alloy,
      bone: steering,
      sides: 10,
    });
    b.rod(top, upperEnd, 0.043, {
      color: orange,
      bone: steering,
      sides: 8,
    });
    b.rod(lowerStart, axle, 0.043, {
      color: armor,
      bone: steering,
      sides: 8,
    });

    for (const t of [0.08, 0.38, 0.71, 0.94]) {
      const at = top.clone().lerp(axle, t);
      b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.023, 8), C.dark, {
        at,
        dir: axle.clone().sub(top),
        bone: steering,
      });
    }

    b.extrude(
      [
        [-0.07, 0],
        [0.074, 0],
        [0.105, 0.13],
        [0.036, 0.22],
        [-0.065, 0.14],
      ],
      {
        at: [s * 0.15, 0.565, 1.25],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.080,
        bevel: 0.009,
        color: armor,
        bone: steering,
      },
    );
    bolt([s * 0.20, 0.59, 1.27], [s, 0, 0], steering, 0.025);
  }

  b.rod([-0.224, 0.59, 1.27], [0.224, 0.59, 1.27], 0.022, {
    color: alloy,
    bone: steering,
  });

  for (const t of [0.07, 0.29]) {
    const y = THREE.MathUtils.lerp(forkTopY, 0.59, t);
    const z = THREE.MathUtils.lerp(forkTopZ, 1.27, t);
    box([0, y, z], [0.395, 0.062, 0.093], C.dark, steering, [41, 0, 0]);
    for (const s of [-1, 1]) {
      bolt([s * 0.19, y + 0.028, z - 0.022], [0, 0.7, -0.7], steering, 0.015);
    }
  }

  // Small front blade fender retains the front wheel's tall, open silhouette.
  const frontEdge = (x: number) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = ((-42 + (i * 81) / 8) * Math.PI) / 180;
      return [x, 0.59 + 0.532 * Math.cos(a), 1.27 + 0.532 * Math.sin(a)];
    });
  b.membrane(frontEdge(-0.084), frontEdge(0.084), {
    color: orange,
    thickness: 0.022,
    rows: 2,
    cols: 8,
    bone: steering,
    name: "frontBladeFender",
  });
  for (const s of [-1, 1]) {
    b.rod([s * 0.13, 0.76, 1.085], [s * 0.083, 1.045, 1.02], 0.013, {
      color: C.dark,
      bone: steering,
    });
  }

  // Brake calipers do not ride the spinning wheel.
  box([-0.166, 0.72, 1.15], [0.067, 0.135, 0.091], orange, steering, [28, 0, 0]);
  box([-0.205, 0.72, 1.15], [0.025, 0.095, 0.072], C.dark, steering, [28, 0, 0]);
  bolt([-0.22, 0.76, 1.12], [-1, 0, 0], steering, 0.012);
  box([-0.235, 0.67, -0.90], [0.062, 0.12, 0.09], orange, chassis, [20, 0, 0]);

  // Angular headlamp: recessed three-chevron luminous optic, with a brow above it.
  b.frustumBox(
    [0, 1.168, 0.675],
    [0, 1.168, 0.852],
    [0.28, 0.19],
    [0.395, 0.224],
    { color: armor, bone: steering, name: "headlampArmor" },
  );
  box([0, 1.168, 0.867], [0.343, 0.172, 0.036], C.ink, steering);
  glow(
    face([0, 1.168, 0.888], 0.321, 0.145, lamp, [0, 0, 1], steering),
    1.25,
  );
  box([0, 1.293, 0.804], [0.416, 0.037, 0.19], orange, steering, [-5, 0, 0]);
  for (const s of [-1, 1]) {
    bolt([s * 0.171, 1.168, 0.891], [0, 0, 1], steering, 0.009);
    b.rod([s * 0.16, 1.10, 0.7], [s * 0.15, 1.10, 0.85], 0.018, {
      color: C.dark,
      bone: steering,
    });
    cylinder([s * 0.243, 1.167, 0.725], 0.027, 0.09, C.ink, [1, 0, 0], steering);
    glow(
      cylinder([s * 0.277, 1.167, 0.745], 0.020, 0.030, C.amber, [0, 0, 1], steering),
      0.9,
    );
  }

  // Mini ape-hangers: clean upward sweep and chunky segmented grips.
  for (const s of [-1, 1]) {
    tube(
      [
        [s * 0.076, 1.36, 0.36],
        [s * 0.12, 1.48, 0.30],
        [s * 0.28, 1.62, 0.31],
        [s * 0.40, 1.62, 0.36],
      ],
      0.024,
      alloy,
      steering,
    );
    cylinder([s * 0.075, 1.397, 0.35], 0.038, 0.04, C.dark, [0, 1, 0], steering, 8);
    b.rod([s * 0.37, 1.62, 0.36], [s * 0.55, 1.62, 0.36], 0.031, {
      color: C.rubber,
      bone: steering,
      sides: 10,
    });
    for (let i = 0; i < 6; i++) {
      cylinder(
        [s * (0.404 + i * 0.022), 1.62, 0.36],
        0.034,
        0.007,
        C.tread,
        [1, 0, 0],
        steering,
        10,
      );
    }
    cylinder([s * 0.555, 1.62, 0.36], 0.035, 0.025, orange, [1, 0, 0], steering, 8);
    box([s * 0.36, 1.617, 0.362], [0.065, 0.071, 0.083], C.dark, steering);
    glow(box([s * 0.36, 1.648, 0.401], [0.026, 0.016, 0.006], C.cyan, steering), 0.7);
    b.sweep(
      bezier(
        [s * 0.35, 1.62, 0.404],
        [s * 0.40, 1.615, 0.49],
        [s * 0.54, 1.60, 0.49],
      ),
      [0.013, 0.008],
      { color: alloy, bone: steering, sides: 6 },
    );

    // Short polished mirror stalk; mirrors sit to the sides, not over the cockpit.
    b.sweep(
      polyline([
        [s * 0.35, 1.64, 0.34],
        [s * 0.34, 1.72, 0.295],
        [s * 0.405, 1.73, 0.285],
      ]),
      0.010,
      { color: C.dark, bone: steering, sides: 6, caps: "flat" },
    );
    box([s * 0.435, 1.735, 0.285], [0.13, 0.067, 0.030], C.dark, steering, [0, s * 12, 0]);
    box([s * 0.435, 1.735, 0.304], [0.107, 0.045, 0.006], alloy, steering, [0, s * 12, 0]);
  }

  box([0, 1.449, 0.354], [0.227, 0.142, 0.057], C.ink, steering, [-25, 0, 0]);
  glow(
    face(
      [0, 1.457, 0.388],
      0.203,
      0.119,
      dash,
      [0, 0.4226, 0.9063],
      steering,
    ),
    0.85,
  );

  // Functional cable runs retain a readable empty space beneath the bars.
  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.33, 1.60, 0.365],
        [s * 0.26, 1.41, 0.43],
        [s * 0.12, 1.20, 0.52],
        [s * 0.17, 0.94, 0.70],
      ]),
      0.008,
      { color: C.ink, bone: steering, sides: 6 },
    );
  }
  b.sweep(
    catmull([
      [-0.36, 1.60, 0.38],
      [-0.22, 1.39, 0.47],
      [-0.19, 1.05, 0.7],
      [-0.18, 0.81, 1.015],
      [-0.19, 0.74, 1.13],
    ]),
    0.008,
    { color: C.ink, bone: steering, sides: 6 },
  );

  // Foot controls and sturdy textured platforms.
  for (const s of [-1, 1]) {
    b.rod([s * 0.16, 0.40, -0.055], [s * 0.41, 0.40, -0.055], 0.022, {
      color: C.dark,
      bone: chassis,
    });
    b.extrude(
      [
        [-0.12, -0.06],
        [0.12, -0.06],
        [0.15, -0.035],
        [0.15, 0.055],
        [-0.12, 0.055],
        [-0.15, 0.025],
      ],
      {
        at: [s * 0.425, 0.397, -0.05],
        x: [0, 0, 1],
        y: [1, 0, 0],
        thickness: 0.032,
        bevel: 0.005,
        color: alloy,
        bone: chassis,
      },
    );
    for (let i = 0; i < 5; i++) {
      box([s * 0.43, 0.419, -0.145 + i * 0.048], [0.092, 0.012, 0.016], C.rubber);
    }
    b.rod([s * 0.24, 0.445, 0.08], [s * 0.42, 0.445, 0.08], 0.012, {
      color: orange,
      bone: chassis,
    });
    cylinder([s * 0.438, 0.445, 0.08], 0.020, 0.065, C.rubber);
  }

  // Twin right-side exhausts: separated headers, heat shields and open hex nozzles.
  const exhausts = [
    {
      route: [
        [-0.145, 0.978, 0.165],
        [-0.285, 0.935, 0.225],
        [-0.392, 0.61, 0.18],
        [-0.405, 0.478, -0.02],
        [-0.405, 0.478, -0.58],
        [-0.405, 0.478, -1.235],
      ],
      x: -0.405,
      y: 0.478,
    },
    {
      route: [
        [-0.145, 0.965, -0.459],
        [-0.30, 0.905, -0.515],
        [-0.464, 0.738, -0.54],
        [-0.464, 0.708, -0.76],
        [-0.464, 0.708, -1.275],
      ],
      x: -0.464,
      y: 0.708,
    },
  ];

  exhausts.forEach((ex, i) => {
    b.sweep(catmull(ex.route), 0.044, {
      color: alloy,
      bone: chassis,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: `exhaustHeader${i}`,
    });
    const startZ = i === 0 ? -0.55 : -0.73;
    const endZ = i === 0 ? -1.24 : -1.28;
    b.rod([ex.x, ex.y, startZ], [ex.x, ex.y, endZ], 0.078, {
      color: C.dark,
      bone: chassis,
      sides: 8,
    });
    b.rod([ex.x, ex.y, startZ + 0.013], [ex.x, ex.y, startZ - 0.060], 0.082, {
      color: orange,
      bone: chassis,
      sides: 8,
    });
    b.rod([ex.x, ex.y, endZ + 0.105], [ex.x, ex.y, endZ + 0.065], 0.083, {
      color: armor,
      bone: chassis,
      sides: 8,
    });

    // Flat side shields create the exaggerated layered armor language.
    box(
      [ex.x - 0.066, ex.y, (startZ + endZ) / 2 + 0.015],
      [0.028, 0.11, Math.abs(startZ - endZ) * 0.76],
      armor,
    );
    for (let j = 0; j < 4; j++) {
      box(
        [ex.x - 0.083, ex.y, startZ - 0.13 - j * 0.083],
        [0.008, 0.062, 0.024],
        C.ink,
        chassis,
        [23, 0, 0],
      );
    }
    for (const z of [startZ - 0.08, endZ + 0.14]) {
      bolt([ex.x - 0.089, ex.y, z], [-1, 0, 0], chassis, 0.009);
    }

    b.lathe(
      [
        [0.047, 0],
        [0.082, 0],
        [0.089, 0.05],
        [0.074, 0.092],
        [0.048, 0.092],
        [0.047, 0.062],
      ],
      {
        at: [ex.x, ex.y, endZ + 0.035],
        axis: [0, 0, -1],
        segments: 8,
        color: alloy,
        bone: chassis,
        name: `openExhaustNozzle${i}`,
      },
    );
    cylinder([ex.x, ex.y, endZ - 0.011], 0.046, 0.008, C.ink, [0, 0, 1]);
    glow(
      ring([ex.x, ex.y, endZ - 0.022], 0.037, 0.005, C.blue, chassis, "z", 16),
      0.65,
    );
  });

  // A small electronics pod and coolant hose below the tank.
  box([0.02, 0.82, 0.30], [0.25, 0.20, 0.14], C.dark, chassis, [-12, 0, 0]);
  box([0.02, 0.82, 0.379], [0.20, 0.145, 0.018], armor, chassis, [-12, 0, 0]);
  for (let i = 0; i < 4; i++) {
    box([0.02, 0.776 + i * 0.029, 0.395], [0.133, 0.011, 0.012], C.ink);
  }
  glow(box([0.02, 0.897, 0.393], [0.133, 0.010, 0.008], C.cyan), 0.8);
  b.sweep(
    catmull([
      [0.11, 0.78, 0.30],
      [0.15, 0.60, 0.24],
      [0.13, 0.48, 0.13],
      [0.15, 0.48, -0.02],
    ]),
    0.018,
    { color: C.ink, bone: chassis, sides: 8 },
  );
  for (const p of [[0.11, 0.78, 0.30], [0.15, 0.48, -0.02]]) {
    cylinder(p, 0.024, 0.036, orange, [0, 1, 0]);
  }

  // Deployable stand reaches the service floor; no floating vehicle silhouette.
  b.rod([0.21, 0.34, -0.36], [0.48, 0.123, -0.48], 0.018, {
    color: alloy,
    bone: chassis,
    sides: 6,
  });
  box([0.48, 0.111, -0.48], [0.12, 0.022, 0.085], C.dark);
  bolt([0.23, 0.34, -0.36], [1, 0, 0], chassis, 0.019);

  // A handful of shallow service marks on the stage, kept outside the wheels.
  for (let i = 0; i < 5; i++) {
    const z = -0.85 + i * 0.38;
    const length = 0.055 + random() * 0.035;
    box([0.60, 0.107, z], [0.025, 0.008, length], C.steel);
  }

  return b.root;
}
