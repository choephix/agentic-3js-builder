```ts
import * as THREE from "three";
import {
  createBuilder,
  catmull,
  bezier,
  polyline,
  rng,
  paint,
  grain,
  noise,
  mix,
  svg,
} from "agentic-3js-builder";
import type { Joint, Fill, PointInput } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { coil } from "agentic-3js-builder/kits/clockwork";

/*
  Art-direction revision
  1. Connect the lights and controls properly; turn the instruments and mirrors
     toward the rider, and replace the floating filler cap detail.
  2. Replace the box-shaped headlight with a layered, beveled twin-optic mask.
     Tuck in the frame and soften the saddle silhouette.
  3. Remove the camouflage-like wear. Use clean ivory armor, warm orange
     highlights, restrained edge wear, and large, readable identification.
  4. Refine the road-tire tread, machined wheels, exhausts and service platform.
     Preserve the long forks, open V-twin, broad rear wheel and chopper stance.
*/

export const meta = {
  name: "HELLION 07 — custom chopper",
  description:
    "A heroic futuristic custom chopper with long raked forks, clean ivory-and-orange armor, an exposed V-twin reactor, twin cyan optics and stacked open exhausts. Presented on its compact service-bay platform.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Hellion07",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(707);

  const C = {
    ink: "#101c29",
    dark: "#243746",
    rubber: "#141d26",
    tread: "#26313b",
    steel: "#91a8b3",
    bright: "#dbe9e7",
    ivory: "#f1ead8",
    orange: "#f06b2d",
    amber: "#ffc764",
    cyan: "#78fff0",
    blue: "#167d92",
    red: "#ff4156",
    floor: "#283e4d",
    floorEdge: "#152633",
  };

  const armor = paint((p, n) => {
    const illumination = Math.max(0, n.y * 0.55 + n.z * 0.2 + 0.4);
    const base = mix("#c8d0c8", "#fff1d8", illumination);
    // Broad, almost invisible variation, rather than isolated camouflage patches.
    return mix(base, "#adbbb9", noise(p, 0.14, 19) * 0.035);
  });
  const orange = paint((p, n) =>
    mix(
      "#cb4328",
      "#ff913e",
      0.55 + 0.24 * n.y + 0.06 * (noise(p, 0.14, 7) - 0.5),
    ),
  );
  const alloy = paint((p, n) =>
    mix(
      "#647d8a",
      "#e2eeea",
      0.45 + 0.28 * Math.max(n.y, 0) + 0.075 * noise(p, 0.009, 22),
    ),
  );
  const leather = grain("#1a2935", "#293d49", {
    size: 0.0035,
    axis: "z",
    seed: 12,
  });
  const tankPaint = paint((p, _n) => {
    const x = Math.abs(p.x);
    if (x < 0.078) return orange;
    if (x < 0.092) return C.ink;
    if (x < 0.102) return C.amber;
    return armor;
  });
  const floorPaint = paint((p, n) => {
    if (n.y < 0.5) return C.floorEdge;
    const seam =
      Math.abs(Math.sin(p.x * 7.8)) < 0.012 ||
      Math.abs(Math.sin(p.z * 7.8)) < 0.012;
    return seam ? "#415765" : "#2c414f";
  });

  // Functional skeleton first.
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
    at: PointInput,
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
    cylinder(p, radius * 0.36, 0.002, C.ink, direction, bone, 6);
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
    width: number,
    height: number,
    texture: THREE.Texture,
    normal: number[],
    bone: Joint = chassis,
    up: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      dir: normal,
      axis: "z",
      up,
      bone,
      texture,
    });
  }

  function frontPlate(
    outline: number[][],
    at: number[],
    thickness: number,
    color: Fill,
    bone: Joint,
    bevel = 0.006,
  ) {
    return b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone,
    });
  }

  // Original graphics, shared across both sides of the vehicle.
  const emblem = svg(
    `<svg viewBox="0 0 160 160">
      <path d="M80 7L142 42V116L80 153L18 116V42Z"
        fill="#152635" stroke="#efb653" stroke-width="5"/>
      <path d="M34 46L66 65L80 38L94 65L126 46L108 96L89 108
        L80 133L71 108L52 96Z" fill="#ed692b"/>
      <path d="M48 58L70 77L80 58L90 77L112 58L96 90L80 99L64 90Z"
        fill="#eee8d7"/>
      <path d="M80 79L88 96L80 116L72 96Z" fill="#78fff0"/>
      <path d="M28 121L54 137M106 137L132 121" stroke="#efb653"
        stroke-width="4" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const wordmark = svg(
    `<svg viewBox="0 0 320 140">
      <path d="M8 18H304L312 28V118H16L8 108Z"
        fill="#152635" stroke="#ed692b" stroke-width="5"/>
      <path d="M22 30H293M22 107H293" stroke="#dddccc" stroke-width="2"/>
      <text x="26" y="78" font-family="sans-serif" font-weight="900"
        font-style="italic" font-size="51" fill="#eee8d7">HELLION</text>
      <text x="27" y="99" font-family="monospace" font-size="13"
        letter-spacing="4" fill="#ffc25b">CUSTOM // REACTOR SERIES</text>
      <path d="M267 36h17l-13 14h19" stroke="#78fff0"
        stroke-width="5" fill="none"/>
    </svg>`,
    { size: 512 },
  );

  const warning = svg(
    `<svg viewBox="0 0 220 90">
      <rect x="2" y="2" width="216" height="86" rx="7" fill="#ed692b"
        stroke="#172633" stroke-width="4"/>
      <path d="M18 62L43 19L68 62Z" fill="#172633"/>
      <path d="M43 32V46M43 53V57" stroke="#ffc25b" stroke-width="6"/>
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
      <path d="M10 30V10H64M176 10H230V30M10 110V130H64M176 130H230V110"
        fill="none" stroke="#3da7ad" stroke-width="3"/>
      <text x="19" y="32" font-family="monospace" font-size="14"
        fill="#78fff0">HELLION / READY</text>
      <text x="20" y="100" font-family="sans-serif" font-weight="900"
        font-size="72" fill="#d6fff5">00</text>
      <text x="124" y="73" font-family="monospace" font-size="15"
        fill="#80b7bd">KM/H</text>
      <text x="127" y="99" font-family="monospace" font-size="13"
        fill="#ffc25b">BOOST 07</text>
      <path d="M21 118h20m7 0h20m7 0h20m7 0h20m7 0h20m7 0h20"
        stroke="#78fff0" stroke-width="7"/>
      <circle cx="211" cy="96" r="8" fill="#ed692b"/>
    </svg>`,
    { size: 384 },
  );

  const license = svg(
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

  const number = svg(
    `<svg viewBox="0 0 200 110">
      <path d="M9 12H191V98H9Z" fill="#152635"/>
      <path d="M12 12H67M133 98H188" stroke="#ed692b" stroke-width="6"/>
      <text x="100" y="84" text-anchor="middle" font-family="sans-serif"
        font-size="86" font-style="italic" font-weight="900"
        fill="#eee8d7">07</text>
      <path d="M160 20l14 0M160 28h20" stroke="#78fff0" stroke-width="3"/>
    </svg>`,
    { size: 384 },
  );

  let rotorHoles = "";
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI * 2) / 16;
    rotorHoles += `<circle cx="${100 + Math.sin(a) * 68}"
      cy="${100 + Math.cos(a) * 68}" r="5" fill="#1b2b36"/>`;
  }
  const rotor = svg(
    `<svg viewBox="0 0 200 200">
      <path d="M100 5A95 95 0 1 1 99.99 5
        M100 62A38 38 0 1 0 100.01 62Z"
        fill="#aebfc1" fill-rule="evenodd"/>
      <circle cx="100" cy="100" r="89" fill="none"
        stroke="#eef0df" stroke-width="3"/>
      <circle cx="100" cy="100" r="51" fill="none"
        stroke="#506775" stroke-width="4"/>
      ${rotorHoles}
      <path d="M48 55L58 65M148 55L138 65M48 145L58 135M148 145L138 135"
        stroke="#ed692b" stroke-width="5"/>
    </svg>`,
    { size: 384 },
  );

  const stitches = svg(
    `<svg viewBox="0 0 160 240">
      <path d="M29 9H131Q149 9 149 31V183Q149 227 80 232
        Q11 227 11 183V31Q11 9 29 9Z" fill="#1a2935"/>
      <path d="M29 17H131Q141 17 141 33V181Q141 218 80 223
        Q19 218 19 181V33Q19 17 29 17Z" fill="none"
        stroke="#d3a470" stroke-width="2.7" stroke-dasharray="5 6"/>
      <path d="M28 53Q80 73 132 53M27 91Q80 111 133 91
        M27 129Q80 149 133 129M29 167Q80 187 131 167"
        stroke="#344957" stroke-width="5" fill="none"/>
      <path d="M28 59Q80 79 132 59M27 97Q80 117 133 97
        M27 135Q80 155 133 135M29 173Q80 193 131 173"
        stroke="#101e2a" stroke-width="3" fill="none"/>
    </svg>`,
    { size: 384 },
  );

  const optics = svg(
    `<svg viewBox="0 0 360 140">
      <path d="M12 25L33 12H149L173 70L149 122H33L12 102Z
        M348 25L327 12H211L187 70L211 122H327L348 102Z"
        fill="#173c4a" stroke="#4a8e96" stroke-width="3"/>
      <path d="M29 33H134L151 70L134 104H29L46 70Z
        M331 33H226L209 70L226 104H331L314 70Z" fill="#78fff0"/>
      <path d="M39 39H127L139 64M321 39H233L221 64"
        fill="none" stroke="#e2fff6" stroke-width="7"/>
      <path d="M56 36L71 70L56 102M98 36L113 70L98 102
        M304 36L289 70L304 102M262 36L247 70L262 102"
        fill="none" stroke="#2b8c94" stroke-width="5"/>
    </svg>`,
    { size: 512 },
  );

  // Compact, chamfered service plinth.
  b.extrude(
    [
      [-0.66, -1.76], [0.66, -1.76], [0.82, -1.56],
      [0.82, 1.62], [0.63, 1.83], [-0.63, 1.83],
      [-0.82, 1.62], [-0.82, -1.56],
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
    box([s * 0.745, 0.105, 0.03], [0.018, 0.01, 2.94], C.steel);
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
    // The larger brackets read as a designed parking cradle from above.
    tube(
      [
        [s * 0.49, 0.11, 0.91],
        [s * 0.60, 0.11, 0.91],
        [s * 0.60, 0.11, 1.33],
      ],
      0.009,
      C.amber,
    );
  }
  box([0, 0.108, 1.65], [0.60, 0.014, 0.18], C.ink);
  face([0, 0.118, 1.65], 0.56, 0.15, wordmark,
    [0, 1, 0], chassis, [0, 0, -1]);

  // Wheels. Front remains narrow and tall; rear is wide and heavily planted.
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
    b.part(
      new THREE.TorusGeometry(major, tireTube, 10, 40),
      C.rubber,
      {
        at: [0, y, z],
        bone: joint,
        rotation: [0, 90, 0],
        scale: [1, 1, widthScale],
        name: front ? "frontRoadTire" : "rearRoadTire",
      },
    );
    const outer = major + tireTube;
    const side = tireTube * widthScale * 0.87;

    for (const s of [-1, 1]) {
      ring([s * side, y, z], rimRadius, front ? 0.021 : 0.028, armor, joint);
      ring([s * (side + 0.007), y, z],
        rimRadius - 0.032, 0.008, orange, joint);
      ring([s * side, y, z],
        major + tireTube * 0.25, 0.005, C.tread, joint);
    }

    // Low-profile road blocks replace the conspicuous paddle-shaped lugs.
    const count = front ? 40 : 40;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2;
      const degrees = (a * 180) / Math.PI;
      if (front) {
        box(
          [0, y + (outer - 0.005) * Math.cos(a),
            z + (outer - 0.005) * Math.sin(a)],
          [0.093, 0.012, 0.048],
          C.tread,
          joint,
          [degrees, i % 2 ? 13 : -13, 0],
        );
      } else {
        for (const s of [-1, 1]) {
          const r = outer - 0.022;
          box(
            [s * 0.074, y + r * Math.cos(a), z + r * Math.sin(a)],
            [0.115, 0.017, 0.050],
            C.tread,
            joint,
            [degrees, s * 23, 0],
          );
        }
      }
    }

    cylinder([0, y, z], front ? 0.077 : 0.097,
      side * 2 + 0.065, C.dark, [1, 0, 0], joint);

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const r0 = front ? 0.077 : 0.095;
      const r1 = rimRadius - 0.017;
      b.extrude(
        [
          [r0, -0.028], [r1, 0.010], [r1, 0.037],
          [r1 - 0.035, 0.044], [r0 + 0.025, 0.025],
        ],
        {
          at: [0, y, z],
          x: [0, Math.cos(a), Math.sin(a)],
          y: [0, -Math.sin(a), Math.cos(a)],
          thickness: front ? 0.070 : 0.13,
          bevel: 0.004,
          color: alloy,
          bone: joint,
          name: `${front ? "front" : "rear"}SweptSpoke${i}`,
        },
      );
    }

    for (const s of [-1, 1]) {
      cylinder([s * (side + 0.021), y, z], front ? 0.069 : 0.084,
        0.033, orange, [1, 0, 0], joint);
      bolt([s * (side + 0.043), y, z], [s, 0, 0],
        joint, front ? 0.024 : 0.028);
    }

    const brakeX = front ? -0.105 : -0.197;
    const brakeR = front ? 0.222 : 0.185;
    ring([brakeX, y, z], brakeR * 0.88, 0.025, alloy, joint);
    face([brakeX - 0.006, y, z], brakeR * 2, brakeR * 2,
      rotor, [-1, 0, 0], joint);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.rod(
        [brakeX, y + 0.055 * Math.cos(a), z + 0.055 * Math.sin(a)],
        [brakeX, y + brakeR * 0.70 * Math.cos(a + 0.12),
          z + brakeR * 0.70 * Math.sin(a + 0.12)],
        0.013,
        { color: C.dark, bone: joint, sides: 6 },
      );
    }
  }

  wheel(rearAxle, 0.56, -0.99, 0.34, 0.12, 1.42, 0.292, false);
  wheel(frontAxle, 0.59, 1.27, 0.425, 0.065, 1.0, 0.389, true);

  // Tucked-in double-cradle frame. Its dogleg follows the motor instead of
  // making a large rectangular cage around the entire engine.
  for (const s of [-1, 1]) {
    const x = s * 0.19;
    tube(
      [
        [x, 1.19, 0.42],
        [x, 0.88, 0.32],
        [x, 0.39, 0.16],
        [x, 0.35, -0.47],
        [x, 0.56, -0.99],
      ],
      0.032,
      orange,
    );
    tube(
      [
        [x, 1.19, 0.42],
        [x, 1.03, -0.53],
        [x, 0.56, -0.99],
      ],
      0.034,
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

  for (const z of [-0.47, 0.16]) {
    b.rod([-0.22, 0.35, z], [0.22, 0.35, z], 0.028,
      { color: C.dark, bone: chassis });
  }
  b.rod([0, 1.18, 0.42], [0, 1.02, -0.57], 0.049,
    { color: C.dark, bone: chassis });

  b.extrude(
    [
      [-0.36, 0], [0.29, 0], [0.41, 0.10],
      [0.25, 0.18], [-0.34, 0.15], [-0.43, 0.06],
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
      box([s * 0.207, 0.376, -0.285 + i * 0.058],
        [0.014, 0.041, 0.018], C.orange, chassis, [s * 22, 0, 0]);
    }
  }

  // Large, exposed crankcase and cyan reactor seal.
  cylinder([0, 0.615, -0.135], 0.226, 0.39, C.dark);
  cylinder([0.226, 0.615, -0.135], 0.194, 0.047, alloy);
  cylinder([-0.227, 0.615, -0.135], 0.188, 0.045, armor);
  ring([0.252, 0.615, -0.135], 0.156, 0.018, orange);
  glow(ring([0.267, 0.615, -0.135], 0.128, 0.008, C.cyan), 1.05);
  cylinder([0.262, 0.615, -0.135], 0.113, 0.026, C.ink);
  face([0.277, 0.615, -0.135], 0.153, 0.153, emblem, [1, 0, 0]);

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    bolt(
      [0.256, 0.615 + Math.cos(a) * 0.178,
        -0.135 + Math.sin(a) * 0.178],
      [1, 0, 0],
      chassis,
      0.010,
    );
  }

  // An engraved reverse-side cover makes the exhaust-side view equally finished.
  ring([-0.254, 0.615, -0.135], 0.148, 0.010, C.dark);
  ring([-0.261, 0.615, -0.135], 0.095, 0.007, orange);
  cylinder([-0.263, 0.615, -0.135], 0.080, 0.014, C.dark);
  face([-0.273, 0.615, -0.135], 0.105, 0.105, emblem, [-1, 0, 0]);

  const banks = [
    {
      base: new THREE.Vector3(0, 0.715, -0.065),
      top: new THREE.Vector3(0, 0.998, 0.182),
    },
    {
      base: new THREE.Vector3(0, 0.715, -0.245),
      top: new THREE.Vector3(0, 0.986, -0.466),
    },
  ];

  banks.forEach((bank, index) => {
    const axis = bank.top.clone().sub(bank.base).normalize();
    b.rod(bank.base, bank.top, 0.119,
      { color: C.ink, bone: chassis, sides: 8 });

    for (let i = 0; i < 8; i++) {
      const p = bank.base.clone().lerp(bank.top, 0.11 + i * 0.102);
      b.part(new THREE.CylinderGeometry(0.149, 0.149, 0.018, 8),
        i === 7 ? orange : alloy, { at: p, dir: axis, bone: chassis });
    }
    b.part(new THREE.CylinderGeometry(0.155, 0.16, 0.063, 8), armor, {
      at: bank.top,
      dir: axis,
      bone: chassis,
      name: `cylinderHead${index}`,
    });
    b.part(new THREE.CylinderGeometry(0.118, 0.132, 0.028, 8), C.dark, {
      at: bank.top.clone().addScaledVector(axis, 0.043),
      dir: axis,
      bone: chassis,
    });
    for (const s of [-1, 1]) {
      b.rod(
        bank.base.clone().add(new THREE.Vector3(s * 0.105, 0, 0)),
        bank.top.clone().add(new THREE.Vector3(s * 0.105, 0, 0)),
        0.013,
        { color: C.bright, bone: chassis, sides: 6 },
      );
    }
  });

  cylinder([0.245, 0.86, -0.14], 0.102, 0.07, C.ink);
  cylinder([0.283, 0.86, -0.14], 0.091, 0.025, orange);
  cylinder([0.300, 0.86, -0.14], 0.070, 0.017, C.dark);
  for (let i = -2; i <= 2; i++) {
    box([0.311, 0.86 + i * 0.021, -0.14],
      [0.012, 0.009, 0.113 - Math.abs(i) * 0.017], C.bright);
  }
  face([0.220, 0.49, 0.081], 0.115, 0.048, warning, [1, 0, 0]);

  // Main tank: broad shoulders, a tapered tail, and a single racing stripe.
  const tank = b.loft(
    [
      { at: [0, 1.103, -0.41], w: 0.29, h: 0.15 },
      { at: [0, 1.165, -0.25], w: 0.55, h: 0.29 },
      { at: [0, 1.189, 0.035], w: 0.63, h: 0.32 },
      { at: [0, 1.166, 0.25], w: 0.46, h: 0.26 },
      { at: [0, 1.165, 0.385], w: 0.19, h: 0.14 },
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
    b.decal(tank, wordmark, {
      at: tankSurface.nearest([s * 0.32, 1.188, -0.035]),
      dir: [s, 0, 0],
      size: [0.335, 0.145],
      lift: 0.002,
      bone: chassis,
      name: s > 0 ? "tankWordmarkL" : "tankWordmarkR",
    });
    b.decal(tank, emblem, {
      at: tankSurface.nearest([s * 0.205, 1.2, 0.23]),
      dir: [s, 0.10, 0.18],
      size: [0.108, 0.108],
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
    b.sweep(seam, 0.0045,
      { color: C.ink, bone: chassis, sides: 4, caps: "flat" });
  }

  // Filler and locking bridge are all seated from the same surface frame.
  const capHit = tankSurface.nearest([0, 1.40, -0.055]);
  b.stick(new THREE.CylinderGeometry(0.063, 0.070, 0.019, 10),
    C.ink, capHit, { embed: 0.15, bone: chassis });
  b.stick(new THREE.CylinderGeometry(0.049, 0.049, 0.030, 10),
    alloy, capHit, { embed: -0.28, bone: chassis });
  b.stick(new THREE.BoxGeometry(0.054, 0.012, 0.014),
    C.ink, capHit, { embed: -2.0, bone: chassis });

  // Shaped leather saddle, not a rectangular cushion hovering over a shell.
  const saddle = b.loft(
    [
      { at: [0, 1.105, -0.865], w: 0.24, h: 0.075 },
      { at: [0, 1.091, -0.765], w: 0.39, h: 0.10 },
      { at: [0, 1.069, -0.62], w: 0.385, h: 0.095 },
      { at: [0, 1.045, -0.465], w: 0.26, h: 0.075 },
      { at: [0, 1.047, -0.36], w: 0.13, h: 0.058 },
    ],
    {
      color: leather,
      bone: chassis,
      section: { ngon: 8 },
      caps: "flat",
      smooth: false,
      name: "shapedSoloSaddle",
    },
  );
  b.decal(saddle, stitches, {
    at: [0, 1.15, -0.65],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.35, 0.43],
    lift: 0.0015,
    bone: chassis,
    segments: 12,
  });

  for (const s of [-1, 1]) {
    b.sweep(
      catmull([
        [s * 0.12, 1.093, -0.855],
        [s * 0.189, 1.081, -0.75],
        [s * 0.185, 1.059, -0.62],
        [s * 0.123, 1.032, -0.46],
        [s * 0.061, 1.032, -0.36],
      ]),
      0.006,
      { color: orange, bone: chassis, sides: 6 },
    );
    b.rod([s * 0.13, 1.025, -0.77], [s * 0.15, 0.99, -0.63],
      0.023, { color: C.dark, bone: chassis });
  }

  // Small numbered side cassettes repeat the angular armor language.
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [-0.15, -0.065], [0.10, -0.065], [0.16, 0.025],
        [0.11, 0.095], [-0.14, 0.085], [-0.18, 0.02],
      ],
      {
        at: [s * 0.198, 0.885, -0.655],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.045,
        bevel: 0.008,
        color: armor,
        bone: chassis,
      },
    );
    face([s * 0.223, 0.899, -0.66], 0.19, 0.105,
      number, [s, 0, 0]);
    bolt([s * 0.226, 0.872, -0.789], [s, 0, 0], chassis, 0.009);
  }

  const rearEdge = (x: number) =>
    Array.from({ length: 13 }, (_, i) => {
      const a = ((-72 + (i * 144) / 12) * Math.PI) / 180;
      return [x, 0.56 + 0.492 * Math.cos(a),
        -0.99 + 0.492 * Math.sin(a)];
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
    b.sweep(rearEdge(s * 0.219), 0.008,
      { color: C.ink, bone: chassis, sides: 6 });
    b.rod([s * 0.18, 0.60, -1.04], [s * 0.21, 0.86, -1.31],
      0.017, { color: alloy, bone: chassis });
  }

  box([0, 0.825, -1.464], [0.34, 0.108, 0.059],
    C.ink, chassis, [-16, 0, 0]);
  glow(box([0, 0.833, -1.498], [0.26, 0.030, 0.014],
    C.red, chassis, [-16, 0, 0]), 1.3);
  box([0, 0.683, -1.472], [0.24, 0.13, 0.027],
    C.dark, chassis, [-12, 0, 0]);
  face([0, 0.683, -1.489], 0.228, 0.105,
    license, [0, 0.208, -0.978]);

  // Rear indicators now have continuous stalks into the fender brackets.
  for (const s of [-1, 1]) {
    b.rod([s * 0.205, 0.818, -1.35], [s * 0.294, 0.80, -1.35],
      0.016, { color: C.dark, bone: chassis });
    cylinder([s * 0.29, 0.80, -1.35], 0.031, 0.048,
      C.ink, [0, 0, -1]);
    glow(cylinder([s * 0.29, 0.80, -1.377], 0.024, 0.012,
      C.amber, [0, 0, -1]), 0.8);
  }

  // Coaxial shock assemblies.
  for (const s of [-1, 1]) {
    const top = [s * 0.245, 1.018, -0.66];
    const lower = [s * 0.245, 0.605, -0.91];
    b.rod(top, lower, 0.026, { color: alloy, bone: chassis });
    b.sweep(coil(top, lower, 0.049, 6.5), 0.008,
      { color: orange, bone: chassis, sides: 6, caps: "flat" });
    cylinder(top, 0.042, 0.055, C.dark);
    cylinder(lower, 0.042, 0.055, C.dark);
    bolt([s * 0.28, 1.018, -0.66], [s, 0, 0], chassis, 0.019);
    bolt([s * 0.28, 0.605, -0.91], [s, 0, 0], chassis, 0.019);
  }

  // Visible belt drive with its broad rear pulley.
  cylinder([0.239, 0.56, -0.99], 0.184, 0.043, C.ink);
  cylinder([0.267, 0.56, -0.99], 0.163, 0.015, orange);
  ring([0.279, 0.56, -0.99], 0.136, 0.012, alloy);
  cylinder([0.264, 0.56, -0.382], 0.092, 0.052, C.dark);
  cylinder([0.295, 0.56, -0.382], 0.065, 0.015, alloy);
  bolt([0.309, 0.56, -0.382], [1, 0, 0], chassis, 0.022);

  const belt = catmull(
    [
      [0.254, 0.741, -0.99], [0.254, 0.674, -0.382],
      [0.254, 0.56, -0.272], [0.254, 0.446, -0.382],
      [0.254, 0.379, -0.99], [0.254, 0.426, -1.118],
      [0.254, 0.56, -1.174], [0.254, 0.694, -1.118],
    ],
    { closed: true },
  );
  b.sweep(belt, () => [0.021, 0.015],
    { color: C.rubber, bone: chassis, sides: 4, caps: "flat" });

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

  // Long raked forks.
  const forkTopY = 1.373;
  const forkTopZ = 0.358;
  for (const s of [-1, 1]) {
    const top = new THREE.Vector3(s * 0.15, forkTopY, forkTopZ);
    const axle = new THREE.Vector3(s * 0.15, 0.59, 1.27);
    const dir = axle.clone().sub(top);

    b.rod(top, axle, 0.027,
      { color: alloy, bone: steering, sides: 10 });
    b.rod(top, top.clone().lerp(axle, 0.43), 0.043,
      { color: orange, bone: steering, sides: 8 });
    b.rod(top.clone().lerp(axle, 0.68), axle, 0.043,
      { color: armor, bone: steering, sides: 8 });

    for (const t of [0.08, 0.38, 0.71, 0.94]) {
      b.part(new THREE.CylinderGeometry(0.047, 0.047, 0.023, 8), C.dark, {
        at: top.clone().lerp(axle, t),
        dir,
        bone: steering,
      });
    }
    b.extrude(
      [
        [-0.07, 0], [0.074, 0], [0.105, 0.13],
        [0.036, 0.22], [-0.065, 0.14],
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
    // A crisp cast-in inlay makes the fork guards look deliberately manufactured.
    box([s * 0.194, 0.689, 1.264], [0.006, 0.066, 0.043],
      C.orange, steering, [30, 0, 0]);
  }

  b.rod([-0.224, 0.59, 1.27], [0.224, 0.59, 1.27],
    0.022, { color: alloy, bone: steering });

  for (const t of [0.07, 0.29]) {
    const y = THREE.MathUtils.lerp(forkTopY, 0.59, t);
    const z = THREE.MathUtils.lerp(forkTopZ, 1.27, t);
    box([0, y, z], [0.395, 0.062, 0.093],
      C.dark, steering, [41, 0, 0]);
    for (const s of [-1, 1]) {
      bolt([s * 0.19, y + 0.028, z - 0.022],
        [0, 0.7, -0.7], steering, 0.015);
    }
  }

  const frontEdge = (x: number) =>
    Array.from({ length: 9 }, (_, i) => {
      const a = ((-42 + (i * 81) / 8) * Math.PI) / 180;
      return [x, 0.59 + 0.532 * Math.cos(a),
        1.27 + 0.532 * Math.sin(a)];
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
    b.rod([s * 0.13, 0.76, 1.085], [s * 0.083, 1.045, 1.02],
      0.013, { color: C.dark, bone: steering });
  }

  box([-0.166, 0.72, 1.15], [0.067, 0.135, 0.091],
    orange, steering, [28, 0, 0]);
  box([-0.205, 0.72, 1.15], [0.025, 0.095, 0.072],
    C.dark, steering, [28, 0, 0]);
  bolt([-0.22, 0.76, 1.12], [-1, 0, 0], steering, 0.012);
  box([-0.235, 0.67, -0.90], [0.062, 0.12, 0.09],
    orange, chassis, [20, 0, 0]);

  // Layered headlight mask: compact twin optics under a swept orange brow.
  const lampOutline = [
    [-0.215, 0.061], [-0.175, 0.105], [0.175, 0.105],
    [0.215, 0.061], [0.205, -0.065], [0.155, -0.102],
    [-0.155, -0.102], [-0.205, -0.065],
  ];
  frontPlate(lampOutline, [0, 1.184, 0.773],
    0.132, armor, steering, 0.014);
  frontPlate(
    [
      [-0.188, 0.052], [-0.157, 0.076], [0.157, 0.076],
      [0.188, 0.052], [0.18, -0.052], [0.145, -0.077],
      [-0.145, -0.077], [-0.18, -0.052],
    ],
    [0, 1.184, 0.848],
    0.027,
    C.ink,
    steering,
    0.006,
  );
  glow(face([0, 1.184, 0.864], 0.352, 0.137,
    optics, [0, 0, 1], steering), 1.15);

  frontPlate(
    [
      [-0.227, 0.005], [-0.186, 0.036], [0.186, 0.036],
      [0.227, 0.005], [0.193, -0.010], [-0.193, -0.010],
    ],
    [0, 1.28, 0.79],
    0.16,
    orange,
    steering,
    0.006,
  );
  box([0, 1.09, 0.782], [0.20, 0.025, 0.08], C.dark, steering);
  for (const s of [-1, 1]) {
    b.rod([s * 0.15, 1.12, 0.65], [s * 0.15, 1.16, 0.75],
      0.020, { color: C.dark, bone: steering });
    bolt([s * 0.191, 1.19, 0.856], [0, 0, 1], steering, 0.009);
    // Continuous stalks into both the fork assembly and the indicator housings.
    b.rod([s * 0.153, 1.165, 0.716], [s * 0.277, 1.165, 0.736],
      0.015, { color: C.dark, bone: steering });
    cylinder([s * 0.273, 1.165, 0.741], 0.027, 0.045,
      C.ink, [0, 0, 1], steering);
    glow(cylinder([s * 0.273, 1.165, 0.768], 0.020, 0.012,
      C.amber, [0, 0, 1], steering), 0.8);
  }

  // Mini ape-hangers with segmented grips, brake levers and correctly faced mirrors.
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
    cylinder([s * 0.075, 1.397, 0.35], 0.038, 0.04,
      C.dark, [0, 1, 0], steering, 8);
    b.rod([s * 0.37, 1.62, 0.36], [s * 0.55, 1.62, 0.36],
      0.031, { color: C.rubber, bone: steering, sides: 10 });

    for (let i = 0; i < 6; i++) {
      cylinder([s * (0.404 + i * 0.022), 1.62, 0.36],
        0.033, 0.007, C.tread, [1, 0, 0], steering, 10);
    }
    cylinder([s * 0.555, 1.62, 0.36], 0.035, 0.025,
      orange, [1, 0, 0], steering, 8);
    box([s * 0.36, 1.617, 0.362], [0.065, 0.071, 0.083],
      C.dark, steering);
    glow(box([s * 0.36, 1.648, 0.323], [0.026, 0.016, 0.006],
      C.cyan, steering), 0.6);
    b.sweep(
      bezier(
        [s * 0.35, 1.62, 0.404],
        [s * 0.40, 1.615, 0.49],
        [s * 0.54, 1.60, 0.49],
      ),
      [0.013, 0.008],
      { color: alloy, bone: steering, sides: 6 },
    );
    tube(
      [
        [s * 0.35, 1.64, 0.34],
        [s * 0.34, 1.72, 0.295],
        [s * 0.405, 1.73, 0.285],
      ],
      0.010,
      C.dark,
      steering,
      6,
    );
    frontPlate(
      [
        [-0.068, -0.021], [-0.046, -0.035], [0.056, -0.028],
        [0.069, 0.014], [0.048, 0.033], [-0.056, 0.028],
      ],
      [s * 0.435, 1.735, 0.285],
      0.028,
      C.dark,
      steering,
      0.004,
    );
    box([s * 0.435, 1.735, 0.267], [0.103, 0.044, 0.006],
      alloy, steering);
    box([s * 0.435, 1.728, 0.302], [0.068, 0.007, 0.005],
      orange, steering);
  }

  // Display is tilted upward and backward, toward the saddle.
  box([0, 1.449, 0.354], [0.227, 0.142, 0.057],
    C.ink, steering, [25, 0, 0]);
  glow(
    face([0, 1.464, 0.322], 0.203, 0.119, dash,
      [0, 0.4226, -0.9063], steering),
    0.8,
  );
  // The visible front is a clean armored back, not a second forward-facing dashboard.
  box([0, 1.439, 0.383], [0.184, 0.089, 0.014],
    armor, steering, [25, 0, 0]);
  face([0, 1.437, 0.394], 0.065, 0.065,
    emblem, [0, -0.4226, 0.9063], steering);

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
      [-0.36, 1.60, 0.38], [-0.22, 1.39, 0.47],
      [-0.19, 1.05, 0.7], [-0.18, 0.81, 1.015],
      [-0.19, 0.74, 1.13],
    ]),
    0.008,
    { color: C.ink, bone: steering, sides: 6 },
  );

  // Wide, serrated footboards and forward controls.
  for (const s of [-1, 1]) {
    b.rod([s * 0.16, 0.40, -0.055], [s * 0.41, 0.40, -0.055],
      0.022, { color: C.dark, bone: chassis });
    b.extrude(
      [
        [-0.12, -0.06], [0.12, -0.06], [0.15, -0.035],
        [0.15, 0.055], [-0.12, 0.055], [-0.15, 0.025],
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
      box([s * 0.43, 0.419, -0.145 + i * 0.048],
        [0.092, 0.012, 0.016], C.rubber);
    }
    b.rod([s * 0.24, 0.445, 0.08], [s * 0.42, 0.445, 0.08],
      0.012, { color: orange, bone: chassis });
    cylinder([s * 0.438, 0.445, 0.08], 0.020, 0.065, C.rubber);
  }

  // Stacked right-hand exhausts.
  const exhausts = [
    {
      route: [
        [-0.145, 0.978, 0.165], [-0.285, 0.935, 0.225],
        [-0.392, 0.61, 0.18], [-0.405, 0.478, -0.02],
        [-0.405, 0.478, -0.58], [-0.405, 0.478, -1.235],
      ],
      x: -0.405,
      y: 0.478,
    },
    {
      route: [
        [-0.145, 0.965, -0.459], [-0.30, 0.905, -0.515],
        [-0.464, 0.738, -0.54], [-0.464, 0.708, -0.76],
        [-0.464, 0.708, -1.275],
      ],
      x: -0.464,
      y: 0.708,
    },
  ];

  exhausts.forEach((ex, index) => {
    b.sweep(catmull(ex.route), 0.041, {
      color: alloy,
      bone: chassis,
      sides: 8,
      smooth: false,
      caps: "flat",
      name: `exhaustHeader${index}`,
    });
    const startZ = index === 0 ? -0.55 : -0.73;
    const endZ = index === 0 ? -1.24 : -1.28;

    b.rod([ex.x, ex.y, startZ], [ex.x, ex.y, endZ], 0.075,
      { color: C.dark, bone: chassis, sides: 8 });
    b.rod([ex.x, ex.y, startZ + 0.013],
      [ex.x, ex.y, startZ - 0.060], 0.080,
      { color: orange, bone: chassis, sides: 8 });
    b.rod([ex.x, ex.y, endZ + 0.105],
      [ex.x, ex.y, endZ + 0.065], 0.080,
      { color: armor, bone: chassis, sides: 8 });

    box([ex.x - 0.062, ex.y, (startZ + endZ) / 2 + 0.015],
      [0.028, 0.103, Math.abs(startZ - endZ) * 0.76], armor);

    for (let j = 0; j < 4; j++) {
      box([ex.x - 0.079, ex.y, startZ - 0.13 - j * 0.083],
        [0.008, 0.057, 0.020], C.ink, chassis, [23, 0, 0]);
    }
    for (const z of [startZ - 0.08, endZ + 0.14]) {
      bolt([ex.x - 0.084, ex.y, z], [-1, 0, 0], chassis, 0.009);
    }

    // Positive wall thickness and a deeply recessed dark throat.
    b.lathe(
      [
        [0.047, 0], [0.079, 0], [0.086, 0.05],
        [0.071, 0.092], [0.048, 0.092], [0.047, 0.062],
      ],
      {
        at: [ex.x, ex.y, endZ + 0.035],
        axis: [0, 0, -1],
        segments: 8,
        color: alloy,
        bone: chassis,
        name: `openExhaustNozzle${index}`,
      },
    );
    cylinder([ex.x, ex.y, endZ + 0.015], 0.046, 0.008,
      C.ink, [0, 0, 1]);
    glow(ring([ex.x, ex.y, endZ - 0.025],
      0.037, 0.004, C.blue, chassis, "z", 16), 0.55);
  });

  // Electronics and cooling pod, mounted behind the front down tubes.
  box([0.02, 0.82, 0.30], [0.25, 0.20, 0.14],
    C.dark, chassis, [-12, 0, 0]);
  box([0.02, 0.82, 0.379], [0.20, 0.145, 0.018],
    armor, chassis, [-12, 0, 0]);
  for (let i = 0; i < 4; i++) {
    box([0.02, 0.776 + i * 0.029, 0.395],
      [0.133, 0.011, 0.012], C.ink);
  }
  glow(box([0.02, 0.887, 0.393], [0.133, 0.010, 0.008], C.cyan), 0.75);
  b.sweep(
    catmull([
      [0.11, 0.78, 0.30], [0.15, 0.60, 0.24],
      [0.13, 0.48, 0.13], [0.15, 0.48, -0.02],
    ]),
    0.018,
    { color: C.ink, bone: chassis, sides: 8 },
  );
  cylinder([0.11, 0.78, 0.30], 0.024, 0.036, orange, [0, 1, 0]);
  cylinder([0.15, 0.48, -0.02], 0.024, 0.036, orange, [0, 1, 0]);

  // Connected stand: both tires and the foot rest on the platform's top.
  b.rod([0.19, 0.35, -0.36], [0.48, 0.123, -0.48],
    0.018, { color: alloy, bone: chassis, sides: 6 });
  box([0.48, 0.111, -0.48], [0.12, 0.022, 0.085], C.dark);
  cylinder([0.205, 0.35, -0.36], 0.033, 0.058, C.dark);
  bolt([0.239, 0.35, -0.36], [1, 0, 0], chassis, 0.019);

  for (let i = 0; i < 5; i++) {
    box([0.60, 0.107, -0.85 + i * 0.38],
      [0.025, 0.008, 0.055 + random() * 0.035], C.steel);
  }

  return b.root;
}
```