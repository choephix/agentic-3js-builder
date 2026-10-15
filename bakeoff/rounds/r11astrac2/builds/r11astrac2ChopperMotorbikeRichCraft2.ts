import * as THREE from "three";
import {
  createBuilder,
  catmull,
  frame,
  rng,
  svg,
  paint,
  mix,
  noise,
} from "../../../../src/index";
import type { Fill, Joint } from "../../../../src/index";
import { coil, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "JACKAL / V9 — Custom Chopper",
  description:
    "An armored hero-shooter chopper: ivory and petrol-teal bodywork, forged gold wheels, exposed V-twin, orange coilovers, twin swept exhausts and an ice-blue segmented headlight.",
};

export default function build(): THREE.Object3D {
  /*
   * 1. Shorten the rear mudguard: the former low-hanging tail diluted the
   *    chopper silhouette. Move its missing number onto the visible crown.
   * 2. Replace projected saddle stitching with an explicitly fitted drawing,
   *    eliminating the raised, needle-like artifacts.
   * 3. Connect the brake hose to its control and give it a natural service
   *    loop instead of the detached, straight black antenna.
   * 4. Integrate the lamp with a small armored instrument brow, a dark inset
   *    and an orange chevron: a more deliberate hero-vehicle face.
   * 5. Add restrained tire lettering, crankcase emblems, vent insets and
   *    fasteners. Preserve the clean palette and open mechanical silhouette.
   */
  const b = createBuilder({ name: "JACKAL_V9", detail: 1, paintSize: 2048 });
  const random = rng(1907);
  const C = {
    ink: "#17232d",
    black: "#10171e",
    rubber: "#242c33",
    tread: "#333d44",
    teal: "#147d86",
    ivory: "#eee7d6",
    orange: "#ff762e",
    gold: "#dca455",
    silver: "#afc1c8",
    darkSilver: "#647a85",
    blue: "#8ff4ff",
    red: "#ff423f",
  };

  const STEEL = paint((_p, n) =>
    mix("#627985", "#d9e4e6", 0.54 + n.y * 0.31 + n.z * 0.10),
  );
  const IRON = paint((_p, n) =>
    mix("#15212b", "#445762", 0.37 + n.y * 0.32 + n.z * 0.10),
  );
  const ALLOY = paint((_p, n) =>
    mix("#966029", "#f5cb78", 0.58 + n.y * 0.27 + n.z * 0.09),
  );
  const PIPE = paint((p, n) => {
    const heat = Math.max(0, Math.min(1, (p.y - 0.59) / 0.43));
    const shade = 0.57 + 0.26 * n.y + 0.10 * n.z;
    return mix(mix("#617985", "#c1d0d2", shade), "#625879", heat * 0.48);
  });
  const ENAMEL = paint((_p, n) =>
    mix("#095c69", "#28999e", 0.59 + 0.26 * n.y + 0.10 * n.z),
  );
  const CERAMIC = paint((_p, n) =>
    mix("#acb8b8", "#fff0d7", 0.67 + 0.22 * n.y + 0.06 * n.z),
  );
  const LEATHER = paint((p, n) =>
    mix(
      "#15242b",
      "#35464c",
      0.22 + 0.26 * Math.max(0, n.y) + 0.035 * noise(p, 0.015, 7),
    ),
  );

  const chassis = b.joint("chassis", {
    at: [0, 0.65, -0.2],
    dir: [0, 0, 1],
  });
  const steering = b.joint("steering", {
    parent: chassis,
    at: [0, 1.34, 0.35],
    dir: [0, -0.68, 0.74],
    role: "hinge",
  });
  const rearWheel = b.joint("rearWheel", {
    parent: chassis,
    at: [0, 0.515, -1.02],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const frontWheel = b.joint("frontWheel", {
    parent: steering,
    at: [0, 0.535, 1.23],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const stand = b.joint("kickstand", {
    parent: chassis,
    at: [0.22, 0.38, -0.32],
    dir: [1, -1, -0.3],
    role: "hinge",
  });
  const setting = b.joint("displayPad", {
    parent: chassis,
    at: [0, 0, 0],
    dir: [0, 1, 0],
  });

  function box(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint = chassis,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at, bone, rotation, name,
    });
  }

  function cylinder(
    name: string,
    at: number[],
    radius: number,
    length: number,
    color: Fill,
    dir: number[] = [1, 0, 0],
    bone: Joint = chassis,
    sides = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, length, sides),
      color,
      { at, dir, bone, name },
    );
  }

  function bolt(
    at: number[],
    dir: number[],
    bone: Joint = chassis,
    radius = 0.013,
    color: Fill = STEEL,
  ) {
    return cylinder(
      "hexFastener", at, radius, 0.012, color, dir, bone, 6,
    );
  }

  function tube(
    name: string,
    points: number[][],
    radius: number | number[],
    color: Fill,
    bone: Joint = chassis,
    sides = 8,
  ) {
    return b.sweep(catmull(points), radius, {
      bone, color, sides, caps: "flat", name,
    });
  }

  function rod(
    name: string,
    a: number[],
    c: number[],
    radius: number,
    color: Fill,
    bone: Joint = chassis,
  ) {
    return b.rod(a, c, radius, {
      bone, color, sides: 8, name,
    });
  }

  function ring(
    name: string,
    at: number[],
    radius: number,
    thickness: number,
    color: Fill,
    dir: number[] = [1, 0, 0],
    bone: Joint = chassis,
    segments = 32,
  ) {
    return b.part(
      new THREE.TorusGeometry(radius, thickness, 6, segments),
      color,
      { at, dir, axis: "z", bone, name },
    );
  }

  function annulus(
    name: string,
    at: number[],
    outer: number,
    inner: number,
    thickness: number,
    color: Fill,
    bone: Joint,
  ) {
    return b.lathe(
      [
        [inner, -thickness / 2],
        [outer, -thickness / 2],
        [outer, thickness / 2],
        [inner, thickness / 2],
      ],
      {
        at,
        axis: [1, 0, 0],
        segments: 32,
        color,
        bone,
        name,
      },
    );
  }

  function sidePlate(
    name: string,
    x: number,
    y: number,
    z: number,
    outline: number[][],
    thickness: number,
    color: Fill,
    bone: Joint = chassis,
    bevel = 0.006,
  ) {
    return b.extrude(outline, {
      at: [x, y, z],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness,
      bevel,
      color,
      bone,
      name,
    });
  }

  function drawing(
    name: string,
    texture: THREE.Texture,
    at: number[],
    size: number[],
    dir: number[],
    bone: Joint = chassis,
    up: number[] = [0, 1, 0],
  ) {
    return b.part(
      new THREE.PlaneGeometry(size[0], size[1]),
      "#ffffff",
      { at, dir, up, axis: "z", texture, bone, name },
    );
  }

  const tankGraphic = svg(
    `<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 35 L85 14 L131 44 L151 11 L167 86 L111 150 L92 109 L41 110 L66 77 Z" fill="#17232d"/>
      <path d="M39 43 L82 31 L107 52 L81 53 L68 75 Z" fill="#ff762e"/>
      <path d="M109 75 L143 54 L132 99 Z" fill="#eee7d6"/>
      <path d="M175 161 H624" stroke="#17232d" stroke-width="8"/>
      <text x="179" y="115" font-family="Arial,sans-serif" font-size="87" font-weight="900"
        font-style="italic" letter-spacing="-5" fill="#17232d">JACKAL</text>
      <text x="184" y="193" font-family="Arial,sans-serif" font-size="25"
        font-weight="bold" letter-spacing="7" fill="#17232d">CUSTOM / V9</text>
      <path d="M520 25 H564 L546 45 H502 Z M572 25 H616 L598 45 H554 Z" fill="#ff762e"/>
    </svg>`,
    { size: 1024 },
  );

  const raceNumber = svg(
    `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 8 H190 L167 140 H8 Z" fill="#eee7d6"/>
      <path d="M8 8 H36 L13 140 H8 Z" fill="#ff762e"/>
      <text x="99" y="111" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="113" font-weight="900" font-style="italic" fill="#17232d">07</text>
      <path d="M40 126 H151" stroke="#147d86" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const warning = svg(
    `<svg viewBox="0 0 300 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="300" height="100" rx="9" fill="#17232d"/>
      <path d="M13 77 L47 14 L82 77 Z" fill="#ff762e"/>
      <path d="M47 34 V54 M47 62 V68" stroke="#17232d" stroke-width="8"/>
      <text x="96" y="38" font-family="Arial,sans-serif" font-weight="bold"
        font-size="24" fill="#eee7d6">HIGH TORQUE</text>
      <text x="97" y="68" font-family="Arial,sans-serif" font-size="18"
        letter-spacing="2" fill="#72b8ba">V9 / 1800 CC</text>
      <path d="M98 83 H281" stroke="#ff762e" stroke-width="4"/>
    </svg>`,
    { size: 384 },
  );

  const saddleStitch = svg(
    `<svg viewBox="0 0 240 320" xmlns="http://www.w3.org/2000/svg">
      <path d="M25 30 Q120 4 215 30 L221 234 Q184 302 120 307 Q55 302 19 234 Z"
        fill="none" stroke="#bd956e" stroke-width="4" stroke-dasharray="9 8"/>
      <g fill="none" stroke="#6c8183" stroke-width="2.7">
        <path d="M41 48 L192 199 M33 94 L173 234 M28 143 L139 254
          M60 28 L207 175 M102 22 L209 129 M147 25 L210 88"/>
        <path d="M197 48 L46 199 M205 94 L65 234 M210 143 L99 254
          M180 28 L33 175 M138 22 L31 129 M93 25 L30 88"/>
      </g>
      <path d="M97 276 H145" stroke="#ff762e" stroke-width="9"/>
    </svg>`,
    { size: 512 },
  );

  const speedometer = svg(
    `<svg viewBox="0 0 240 160" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="234" height="154" rx="21" fill="#111e29" stroke="#698b98" stroke-width="6"/>
      <path d="M25 43 H207" stroke="#244b58" stroke-width="9"/>
      <path d="M25 43 H134" stroke="#89f5ff" stroke-width="9"/>
      <text x="25" y="117" font-family="monospace" font-size="71" font-weight="bold" fill="#b4faff">00</text>
      <text x="142" y="106" font-family="Arial,sans-serif" font-size="22" fill="#89f5ff">KM/H</text>
      <text x="24" y="143" font-family="monospace" font-size="16" fill="#ffad60">N / SYSTEM READY</text>
      <circle cx="206" cy="24" r="7" fill="#ff762e"/>
    </svg>`,
    { size: 384 },
  );

  const lensDrawing = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M57 8 H143 L192 57 V143 L143 192 H57 L8 143 V57 Z"
        fill="#134555" stroke="#70ccdf" stroke-width="8"/>
      <path d="M52 38 H148 L168 58 V78 H32 V58 Z" fill="#cffcff"/>
      <path d="M29 94 H171 V122 H29 Z" fill="#86f2ff"/>
      <path d="M39 137 H161 L143 162 H57 L39 137 Z" fill="#e3ffff"/>
      <path d="M58 25 H142 M48 178 H152" stroke="#ffffff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const padGraphic = svg(
    `<svg viewBox="0 0 640 130" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="634" height="124" rx="12" fill="#17232d" stroke="#4b646e" stroke-width="5"/>
      <path d="M25 29 H45 V99 H25 Z M57 29 H70 V99 H57 Z" fill="#ff762e"/>
      <text x="99" y="64" font-family="Arial,sans-serif" font-size="47"
        font-weight="900" letter-spacing="7" fill="#eee7d6">JACKAL V9</text>
      <text x="100" y="103" font-family="Arial,sans-serif" font-size="22"
        letter-spacing="5" fill="#66b4ba">CUSTOM MOTOR WORKS / 07</text>
    </svg>`,
    { size: 768 },
  );

  const crankEmblem = svg(
    `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="93" fill="#17232d" stroke="#edc17a" stroke-width="7"/>
      <circle cx="100" cy="100" r="78" fill="none" stroke="#647a85" stroke-width="3"/>
      <text x="98" y="126" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="91" font-style="italic" font-weight="900" fill="#eee7d6">V9</text>
      <path d="M62 147 H137" stroke="#ff762e" stroke-width="9"/>
      <path d="M85 43 H114 M30 93 V112 M171 93 V112"
        stroke="#edc17a" stroke-width="5"/>
    </svg>`,
    { size: 256 },
  );

  const tireMark = svg(
    `<svg viewBox="0 0 480 100" xmlns="http://www.w3.org/2000/svg">
      <text x="240" y="48" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="40" font-weight="900" font-style="italic"
        letter-spacing="5" fill="#87918f">JACKAL</text>
      <text x="240" y="81" text-anchor="middle" font-family="Arial,sans-serif"
        font-size="18" font-weight="bold" letter-spacing="4"
        fill="#697776">STREET / RADIAL</text>
      <path d="M16 37 H81 M399 37 H464" stroke="#a4a896" stroke-width="7"/>
      <path d="M30 55 H70 M410 55 H450" stroke="#697776" stroke-width="5"/>
    </svg>`,
    { size: 512 },
  );

  const pressureFace = gaugeTexture({
    needle: 52,
    label: "BOOST",
    face: "#f4e5c6",
    size: 192,
  });

  // Tight garage display plinth.
  b.part(new THREE.CylinderGeometry(1, 1, 0.052, 12), C.ink, {
    at: [0, 0.026, 0.02],
    scale: [0.77, 1, 1.87],
    bone: setting,
    name: "twelveSidedGaragePad",
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.013, 12), "#3b4e57", {
    at: [0, 0.0585, 0.02],
    scale: [0.744, 1, 1.836],
    bone: setting,
    name: "padTopInset",
  });
  for (const s of [-1, 1]) {
    box(
      "padEdgeOrange",
      [s * 0.63, 0.067, 0.07],
      [0.028, 0.006, 0.92],
      C.orange,
      setting,
    );
    for (let i = 0; i < 5; i++) {
      box(
        "paintedGarageTick",
        [s * (0.5 + i * 0.025), 0.069, -1.24 + i * 0.075],
        [0.055, 0.004, 0.03],
        i % 2 ? C.ivory : C.orange,
        setting,
        [0, 30, 0],
      );
    }
  }
  drawing(
    "workshopPlaque",
    padGraphic,
    [0, 0.0705, 1.63],
    [0.65, 0.132],
    [0, 1, 0],
    setting,
    [0, 0, -1],
  );

  function wheel(
    name: string,
    y: number,
    z: number,
    r: number,
    halfWidth: number,
    bone: Joint,
    isRear: boolean,
  ) {
    const inner = r * 0.64;
    const tire = b.lathe(
      [
        [inner, -halfWidth * 0.83],
        [r * 0.81, -halfWidth],
        [r * 0.93, -halfWidth * 0.90],
        [r, -halfWidth * 0.54],
        [r, halfWidth * 0.54],
        [r * 0.93, halfWidth * 0.90],
        [r * 0.81, halfWidth],
        [inner, halfWidth * 0.83],
      ],
      {
        at: [0, y, z],
        axis: [1, 0, 0],
        segments: 40,
        color: C.rubber,
        bone,
        name: `${name}BalloonTire`,
      },
    );

    const treadCount = isRear ? 32 : 28;
    for (let i = 0; i < treadCount; i++) {
      const a = i * Math.PI * 2 / treadCount;
      box(
        `${name}TreadBlock`,
        [
          0,
          y + Math.cos(a) * (r - 0.005),
          z + Math.sin(a) * (r - 0.005),
        ],
        [halfWidth * 1.18, 0.009, isRear ? 0.038 : 0.035],
        C.tread,
        bone,
        [a * 180 / Math.PI, 0, i % 2 ? -12 : 12],
      );
    }

    annulus(
      `${name}OpenRimBarrel`,
      [0, y, z],
      inner * 0.99,
      inner * 0.86,
      halfWidth * 1.52,
      IRON,
      bone,
    );
    cylinder(
      `${name}AxleSleeve`,
      [0, y, z],
      0.065,
      halfWidth * 1.9,
      IRON,
      [1, 0, 0],
      bone,
    );

    for (const s of [-1, 1]) {
      const face = s * halfWidth * 0.83;
      annulus(
        `${name}ForgedRim`,
        [face, y, z],
        inner * 1.02,
        inner * 0.85,
        0.033,
        ALLOY,
        bone,
      );
      ring(
        `${name}RimPinstripe`,
        [s * (Math.abs(face) + 0.02), y, z],
        inner * 0.98,
        0.005,
        C.ivory,
        [1, 0, 0],
        bone,
      );
      ring(
        `${name}SidewallRidge`,
        [s * halfWidth * 0.97, y, z],
        r * 0.84,
        0.005,
        "#465057",
        [1, 0, 0],
        bone,
      );
      cylinder(
        `${name}Hub`,
        [face, y, z],
        0.081,
        0.055,
        STEEL,
        [1, 0, 0],
        bone,
      );

      for (let j = 0; j < 5; j++) {
        const a = j * Math.PI * 2 / 5 + 0.22;
        const a2 = a + 0.20;
        b.frustumBox(
          [
            face,
            y + Math.cos(a) * 0.065,
            z + Math.sin(a) * 0.065,
          ],
          [
            face,
            y + Math.cos(a2) * inner * 0.93,
            z + Math.sin(a2) * inner * 0.93,
          ],
          [0.045, 0.058],
          [0.029, 0.042],
          { bone, color: ALLOY, name: `${name}SweptSpoke` },
        );
      }
      bolt(
        [s * (halfWidth + 0.005), y, z],
        [s, 0, 0],
        bone,
        0.029,
        IRON,
      );
      b.decal(tire, tireMark, {
        at: [s * halfWidth, y + r * 0.79, z],
        dir: [s, 0, 0],
        up: [0, 1, 0],
        size: [0.28, 0.058],
        segments: 12,
        lift: 0.0016,
        bone,
        name: `${name}MoldedSidewallLettering`,
      });
    }

    const rotorX = halfWidth + 0.028;
    annulus(
      `${name}BrakeRotor`,
      [rotorX, y, z],
      inner * 0.76,
      inner * 0.53,
      0.014,
      STEEL,
      bone,
    );
    annulus(
      `${name}RotorHub`,
      [rotorX, y, z],
      0.089,
      0.056,
      0.014,
      IRON,
      bone,
    );
    for (let j = 0; j < 5; j++) {
      const a = j * Math.PI * 2 / 5;
      rod(
        `${name}RotorArm`,
        [
          rotorX,
          y + Math.cos(a) * 0.08,
          z + Math.sin(a) * 0.08,
        ],
        [
          rotorX,
          y + Math.cos(a + 0.15) * inner * 0.56,
          z + Math.sin(a + 0.15) * inner * 0.56,
        ],
        0.012,
        IRON,
        bone,
      );
    }
    for (let j = 0; j < 10; j++) {
      const a = j * Math.PI * 2 / 10;
      cylinder(
        `${name}RotorDrilling`,
        [
          rotorX + 0.008,
          y + Math.cos(a) * inner * 0.65,
          z + Math.sin(a) * inner * 0.65,
        ],
        0.009,
        0.0015,
        C.ink,
        [1, 0, 0],
        bone,
        8,
      );
    }
  }

  wheel("rear", 0.515, -1.02, 0.45, 0.205, rearWheel, true);
  wheel("front", 0.535, 1.23, 0.47, 0.12, frontWheel, false);

  function fender(
    name: string,
    y: number,
    z: number,
    radius: number,
    width: number,
    start: number,
    end: number,
    bone: Joint,
    color: Fill,
  ) {
    const outline: number[][] = [];
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const a = (start + (end - start) * i / n) * Math.PI / 180;
      outline.push([
        Math.sin(a) * (radius + 0.036),
        Math.cos(a) * (radius + 0.036),
      ]);
    }
    for (let i = n; i >= 0; i--) {
      const a = (start + (end - start) * i / n) * Math.PI / 180;
      outline.push([
        Math.sin(a) * radius,
        Math.cos(a) * radius,
      ]);
    }
    const result = sidePlate(
      name, 0, y, z, outline, width, color, bone, 0.005,
    );

    for (const s of [-1, 1]) {
      const path: number[][] = [];
      for (let i = 0; i <= n; i++) {
        const a = (start + (end - start) * i / n) * Math.PI / 180;
        path.push([
          s * (width / 2 + 0.001),
          y + Math.cos(a) * (radius + 0.019),
          z + Math.sin(a) * (radius + 0.019),
        ]);
      }
      tube(`${name}EdgeBead`, path, 0.007, C.gold, bone, 6);
    }
    return result;
  }

  const rearFender = fender(
    "rearArmorFender",
    0.515, -1.02, 0.489, 0.47,
    -75, 48,
    chassis,
    ENAMEL,
  );
  fender(
    "frontFloatingFender",
    0.535, 1.23, 0.507, 0.279,
    -63, 45,
    steering,
    CERAMIC,
  );

  const stripePath: number[][] = [];
  for (let i = 0; i <= 12; i++) {
    const a = (-61 + i * 8.7) * Math.PI / 180;
    stripePath.push([
      0,
      0.535 + Math.cos(a) * 0.544,
      1.23 + Math.sin(a) * 0.544,
    ]);
  }
  b.sweep(stripePath, () => [0.031, 0.002], {
    section: "box",
    color: C.orange,
    bone: steering,
    caps: "flat",
    name: "frontFenderOrangeStripe",
  });

  for (const s of [-1, 1]) {
    rod(
      "frontFenderStay",
      [s * 0.16, 0.56, 1.22],
      [s * 0.145, 0.91, 0.94],
      0.012,
      STEEL,
      steering,
    );
    bolt([s * 0.154, 0.92, 0.94], [s, 0, 0], steering);
  }

  b.decal(rearFender, raceNumber, {
    at: [0, 1.008, -1.20],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.258, 0.175],
    segments: 16,
    lift: 0.002,
    bone: chassis,
    name: "rearFenderCrownRaceNumber",
  });

  // Double cradle and articulated rear suspension.
  for (const s of [-1, 1]) {
    tube(
      "lowerCradleRail",
      [
        [s * 0.145, 1.26, 0.34],
        [s * 0.205, 0.83, 0.30],
        [s * 0.215, 0.39, 0.15],
        [s * 0.225, 0.33, -0.40],
        [s * 0.225, 0.55, -0.70],
        [s * 0.16, 0.94, -0.57],
      ],
      0.034,
      C.ink,
    );
    tube(
      "upperFrameRail",
      [
        [s * 0.125, 1.29, 0.34],
        [s * 0.17, 1.15, -0.12],
        [s * 0.16, 0.95, -0.60],
        [s * 0.18, 0.96, -0.91],
      ],
      0.03,
      C.ink,
    );

    b.frustumBox(
      [s * 0.255, 0.50, -0.40],
      [s * 0.265, 0.515, -1.02],
      [0.062, 0.10],
      [0.047, 0.07],
      { bone: chassis, color: IRON, name: "boxedRearSwingarm" },
    );
    bolt(
      [s * 0.30, 0.515, -1.02],
      [s, 0, 0],
      chassis,
      0.025,
    );
    cylinder(
      "swingarmPivot",
      [s * 0.258, 0.50, -0.40],
      0.062,
      0.035,
      ALLOY,
    );
    bolt(
      [s * 0.287, 0.50, -0.40],
      [s, 0, 0],
      chassis,
      0.023,
    );

    const top = [s * 0.28, 0.95, -0.69];
    const bottom = [s * 0.28, 0.56, -0.96];
    rod("rearShockPiston", bottom, top, 0.028, STEEL);
    b.sweep(coil(bottom, top, 0.052, 6), 0.013, {
      bone: chassis,
      color: C.orange,
      sides: 6,
      name: "orangeRearCoilover",
    });
    for (const p of [top, bottom]) {
      cylinder("shockEyelet", p, 0.046, 0.045, C.ink);
      bolt(
        [p[0] + s * 0.029, p[1], p[2]],
        [s, 0, 0],
        chassis,
        0.018,
      );
    }
  }

  rod(
    "engineFrontCrossmember",
    [-0.23, 0.38, 0.12],
    [0.23, 0.38, 0.12],
    0.031,
    IRON,
  );
  box(
    "ribbedBellyPan",
    [0, 0.35, -0.16],
    [0.38, 0.095, 0.48],
    IRON,
  );
  for (let i = 0; i < 4; i++) {
    box(
      "bellyPanRib",
      [0, 0.30, -0.32 + i * 0.1],
      [0.31, 0.025, 0.022],
      C.darkSilver,
    );
  }

  // Exposed V-twin.
  cylinder(
    "transverseCrankcase",
    [0, 0.61, -0.23],
    0.205,
    0.39,
    IRON,
  );
  for (const s of [-1, 1]) {
    cylinder(
      "crankcaseCoverRim",
      [s * 0.214, 0.61, -0.23],
      0.183,
      0.041,
      STEEL,
    );
    cylinder(
      "crankcaseCover",
      [s * 0.242, 0.61, -0.23],
      0.147,
      0.025,
      C.ink,
    );
    cylinder(
      "crankcaseMedallion",
      [s * 0.262, 0.61, -0.23],
      0.080,
      0.016,
      ALLOY,
    );
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      bolt(
        [
          s * 0.239,
          0.61 + Math.cos(a) * 0.164,
          -0.23 + Math.sin(a) * 0.164,
        ],
        [s, 0, 0],
        chassis,
        0.012,
      );
    }
    drawing(
      "V9CrankcaseEmblem",
      crankEmblem,
      [s * 0.271, 0.61, -0.23],
      [0.135, 0.135],
      [s, 0, 0],
    );
  }

  const cylinders = [
    { root: [0, 0.68, -0.29], tip: [0, 1.00, -0.52] },
    { root: [0, 0.69, -0.17], tip: [0, 1.04, 0.08] },
  ];
  cylinders.forEach((engine, index) => {
    const start = new THREE.Vector3(
      engine.root[0], engine.root[1], engine.root[2],
    );
    const tip = new THREE.Vector3(
      engine.tip[0], engine.tip[1], engine.tip[2],
    );
    const axis = tip.clone().sub(start).normalize();

    b.frustumBox(
      start, tip, [0.275, 0.225], [0.285, 0.235],
      {
        bone: chassis,
        color: C.ink,
        name: `cylinder${index}Core`,
      },
    );
    for (let i = 0; i < 8; i++) {
      b.part(
        new THREE.BoxGeometry(0.343, 0.024, 0.263),
        i === 7 ? ALLOY : STEEL,
        {
          at: start.clone().lerp(tip, 0.16 + i * 0.103),
          dir: axis,
          bone: chassis,
          name: "stackedCoolingFin",
        },
      );
    }
    b.part(
      new THREE.BoxGeometry(0.36, 0.077, 0.278),
      CERAMIC,
      {
        at: tip.clone().addScaledVector(axis, 0.019),
        dir: axis,
        bone: chassis,
        name: "facetedRockerCover",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.23, 0.085, 0.14),
      ENAMEL,
      {
        at: tip.clone().addScaledVector(axis, 0.034),
        dir: axis,
        bone: chassis,
        name: "rockerCoverInset",
      },
    );
    for (const s of [-1, 1]) {
      rod(
        "externalPushrod",
        [s * 0.183, engine.root[1] + 0.01, engine.root[2]],
        [s * 0.183, engine.tip[1], engine.tip[2]],
        0.015,
        STEEL,
      );
      bolt(
        [s * 0.193, engine.tip[1], engine.tip[2]],
        [s, 0, 0],
        chassis,
        0.013,
      );
    }
  });

  cylinder("intakeElbow", [0.245, 0.89, -0.16], 0.10, 0.22, IRON);
  cylinder("airFilterRim", [0.36, 0.89, -0.16], 0.132, 0.07, ALLOY);
  cylinder("airFilterDarkFace", [0.400, 0.89, -0.16], 0.110, 0.013, C.ink);
  for (let i = 0; i < 5; i++) {
    box(
      "intakeFilterLouver",
      [0.410, 0.89 + (i - 2) * 0.032, -0.16],
      [0.015, 0.012, 0.166 - Math.abs(i - 2) * 0.015],
      STEEL,
    );
  }
  for (const dy of [-0.093, 0.093]) {
    bolt([0.412, 0.89 + dy, -0.16], [1, 0, 0], chassis, 0.009, ALLOY);
  }

  tube(
    "orangeIgnitionLead",
    [
      [-0.20, 1.02, 0.03],
      [-0.28, 1.00, -0.04],
      [-0.29, 0.81, -0.17],
      [-0.21, 0.79, -0.39],
      [-0.19, 0.98, -0.50],
    ],
    0.014,
    C.orange,
  );
  cylinder(
    "oilReservoir",
    [-0.18, 0.74, -0.61],
    0.084,
    0.23,
    ENAMEL,
    [0, 1, 0],
  );
  cylinder(
    "oilCap",
    [-0.18, 0.866, -0.61],
    0.058,
    0.025,
    ALLOY,
    [0, 1, 0],
  );

  annulus(
    "rearBeltPulley",
    [-0.246, 0.515, -1.02],
    0.226,
    0.177,
    0.032,
    IRON,
    chassis,
  );
  cylinder(
    "drivePulley",
    [-0.273, 0.525, -0.43],
    0.10,
    0.035,
    IRON,
  );
  tube(
    "upperDriveBelt",
    [
      [-0.267, 0.726, -1.05],
      [-0.267, 0.714, -0.84],
      [-0.267, 0.62, -0.43],
    ],
    0.025,
    C.black,
    chassis,
    4,
  );
  tube(
    "lowerDriveBelt",
    [
      [-0.267, 0.302, -1.03],
      [-0.267, 0.328, -0.80],
      [-0.267, 0.43, -0.43],
    ],
    0.025,
    C.black,
    chassis,
    4,
  );
  sidePlate(
    "beltGuard",
    -0.291, 0.68, -1.08,
    [
      [0, 0.063],
      [0.23, 0.055],
      [0.70, -0.055],
      [0.68, -0.105],
      [0.18, 0.007],
      [0, 0.014],
    ],
    0.027,
    ENAMEL,
  );
  for (const p of [[-0.311, 0.713, -0.94], [-0.311, 0.626, -0.47]]) {
    bolt(p, [-1, 0, 0], chassis, 0.01);
  }

  // Separate header routes leave the intake and cooling fins readable.
  tube(
    "frontCylinderHeader",
    [
      [0.18, 0.99, 0.05],
      [0.29, 0.93, 0.13],
      [0.32, 0.66, 0.11],
      [0.32, 0.47, -0.10],
      [0.32, 0.47, -0.58],
      [0.32, 0.56, -1.11],
    ],
    0.038,
    PIPE,
  );
  tube(
    "rearCylinderHeader",
    [
      [0.18, 0.96, -0.49],
      [0.30, 0.90, -0.53],
      [0.39, 0.74, -0.52],
      [0.396, 0.605, -0.58],
      [0.396, 0.685, -1.11],
    ],
    0.038,
    PIPE,
  );

  for (let i = 0; i < 2; i++) {
    const x = 0.32 + i * 0.076;
    const yy = 0.47 + i * 0.125;
    b.rod(
      [x, yy + 0.012, -0.59],
      [x, yy + 0.11, -1.17],
      [0.069, 0.057],
      {
        bone: chassis,
        color: CERAMIC,
        sides: 8,
        name: "ivoryExhaustHeatShield",
      },
    );
    b.rod(
      [x, yy + 0.082, -1.005],
      [x, yy + 0.117, -1.205],
      0.06,
      {
        bone: chassis,
        color: IRON,
        sides: 8,
        name: "exhaustEndCap",
      },
    );
    cylinder(
      "blackExhaustOpening",
      [x, yy + 0.12, -1.208],
      0.045,
      0.008,
      C.black,
      [0, 0.17, -1],
    );
    for (const z of [-0.66, -0.92]) {
      const y = yy + 0.012 + (-z - 0.59) / 0.58 * 0.098;
      cylinder(
        "exhaustClamp",
        [x, y, z],
        0.073,
        0.027,
        STEEL,
        [0, 0.17, -1],
      );
      bolt([x + 0.076, y, z], [1, 0, 0], chassis, 0.009, IRON);
    }
    for (let j = 0; j < 3; j++) {
      box(
        "exhaustShieldVent",
        [x + 0.066, yy + 0.044 + j * 0.012, -0.74 - j * 0.07],
        [0.004, 0.019, 0.041],
        C.ink,
      );
    }
  }

  // The tank remains a broad, simple hero shape.
  const tank = sidePlate(
    "sculptedIvoryFuelTank",
    0, 1.047, -0.46,
    [
      [0, 0.005],
      [0.13, 0.26],
      [0.53, 0.35],
      [0.85, 0.20],
      [0.77, -0.02],
      [0.18, -0.075],
    ],
    0.48,
    CERAMIC,
    chassis,
    0.026,
  );

  for (const s of [-1, 1]) {
    sidePlate(
      "lowerTankPetrolInset",
      s * 0.241, 1.047, -0.46,
      [
        [0.10, 0.005],
        [0.20, -0.040],
        [0.71, 0],
        [0.77, 0.095],
        [0.30, 0.061],
      ],
      0.014,
      ENAMEL,
      chassis,
      0.004,
    );
    b.decal(tank, tankGraphic, {
      at: [s * 0.243, 1.23, -0.037],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.585, 0.201],
      bone: chassis,
      name: "JACKALtankLivery",
    });
    bolt(
      [s * 0.25, 1.113, -0.32],
      [s, 0, 0],
      chassis,
      0.011,
    );
    bolt(
      [s * 0.25, 1.14, 0.247],
      [s, 0, 0],
      chassis,
      0.011,
    );

    for (let i = 0; i < 3; i++) {
      sidePlate(
        "tankInsetVent",
        s * 0.250, 1.086, 0.065 + i * 0.047,
        [[-0.007, -0.012], [0.004, -0.012], [0.021, 0.017], [0.009, 0.017]],
        0.003,
        C.ink,
        chassis,
        0,
      );
    }
  }

  b.slab(
    [
      [-0.027, 1.309, -0.33],
      [0.027, 1.309, -0.33],
      [0.027, 1.399, 0.07],
      [-0.027, 1.399, 0.07],
    ],
    {
      color: C.orange,
      thickness: 0.003,
      bone: chassis,
      name: "tankRoofStripeRear",
    },
  );
  b.slab(
    [
      [-0.027, 1.399, 0.07],
      [0.027, 1.399, 0.07],
      [0.027, 1.255, 0.377],
      [-0.027, 1.255, 0.377],
    ],
    {
      color: C.orange,
      thickness: 0.003,
      bone: chassis,
      name: "tankRoofStripeFront",
    },
  );
  cylinder(
    "fuelCapSocket",
    [0, 1.401, 0.04],
    0.084,
    0.024,
    C.ink,
    [0, 1, 0],
  );
  cylinder(
    "fuelCap",
    [0, 1.417, 0.04],
    0.065,
    0.018,
    ALLOY,
    [0, 1, 0],
    chassis,
    8,
  );
  box(
    "fuelCapLatch",
    [0, 1.429, 0.04],
    [0.067, 0.013, 0.020],
    STEEL,
  );

  for (const s of [-1, 1]) {
    sidePlate(
      "triangularBatteryArmor",
      s * 0.225, 0.82, -0.70,
      [
        [0, 0],
        [0.08, 0.17],
        [0.27, 0.11],
        [0.28, -0.035],
        [0.10, -0.075],
      ],
      0.06,
      ENAMEL,
      chassis,
      0.012,
    );
    drawing(
      "engineWarningLabel",
      warning,
      [s * 0.259, 0.877, -0.54],
      [0.19, 0.063],
      [s, 0, 0],
    );
    for (let i = 0; i < 3; i++) {
      box(
        "batteryCoverSlit",
        [s * 0.26, 0.79, -0.61 + i * 0.043],
        [0.005, 0.012, 0.026],
        C.ink,
      );
    }
  }

  // Saddle: exact top profile shared with its surface drawing.
  sidePlate(
    "stitchedSoloSaddle",
    0, 0.987, -1.00,
    [
      [0, 0.078],
      [0.08, 0.126],
      [0.23, 0.064],
      [0.44, 0.038],
      [0.56, 0.078],
      [0.59, 0.025],
      [0.44, -0.031],
      [0.12, -0.016],
      [0.015, 0.026],
    ],
    0.388,
    LEATHER,
    chassis,
    0.017,
  );

  const stitchedProfile = [
    [-0.88, 1.0964667],
    [-0.77, 1.051],
    [-0.56, 1.025],
    [-0.46, 1.0583333],
  ];
  const stitchPositions: number[] = [];
  const stitchUVs: number[] = [];
  const stitchIndices: number[] = [];

  stitchedProfile.forEach(([z, y], i) => {
    stitchPositions.push(-0.15, y + 0.0025, z, 0.15, y + 0.0025, z);
    const v = (z + 0.88) / 0.42;
    stitchUVs.push(0, v, 1, v);
    if (i < stitchedProfile.length - 1) {
      const k = i * 2;
      stitchIndices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
    }
  });
  const stitchGeometry = new THREE.BufferGeometry();
  stitchGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(stitchPositions, 3),
  );
  stitchGeometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(stitchUVs, 2),
  );
  stitchGeometry.setIndex(stitchIndices);
  stitchGeometry.computeVertexNormals();
  b.part(stitchGeometry, "#ffffff", {
    at: [0, 0, 0],
    bone: chassis,
    texture: saddleStitch,
    name: "flushDiamondSaddleStitching",
  });

  for (const s of [-1, 1]) {
    tube(
      "saddleOrangePiping",
      [
        [s * 0.193, 1.073, -0.976],
        [s * 0.193, 1.096, -0.90],
        [s * 0.193, 1.04, -0.73],
        [s * 0.193, 1.029, -0.56],
        [s * 0.193, 1.054, -0.44],
      ],
      0.005,
      C.orange,
      chassis,
      6,
    );
  }

  box(
    "tailLampHousing",
    [0, 0.702, -1.509],
    [0.31, 0.087, 0.065],
    C.ink,
    chassis,
    [-19, 0, 0],
  );
  glow(
    box(
      "tailLamp",
      [0, 0.713, -1.546],
      [0.25, 0.038, 0.012],
      C.red,
      chassis,
      [-19, 0, 0],
    ),
    1.6,
  );
  box(
    "tailLampDivider",
    [0, 0.713, -1.556],
    [0.012, 0.042, 0.008],
    C.ink,
    chassis,
    [-19, 0, 0],
  );
  rod(
    "plateBracket",
    [-0.23, 0.515, -1.02],
    [-0.30, 0.66, -1.31],
    0.016,
    IRON,
  );
  box(
    "smallLicensePlate",
    [-0.30, 0.68, -1.34],
    [0.16, 0.095, 0.017],
    C.ivory,
  );
  drawing(
    "plateNumber",
    raceNumber,
    [-0.30, 0.68, -1.352],
    [0.136, 0.079],
    [0, 0, -1],
  );

  // Long raked forks.
  const forkAxis = [0, -0.68, 0.74];
  cylinder(
    "steeringHeadTube",
    [0, 1.278, 0.376],
    0.091,
    0.27,
    IRON,
    forkAxis,
    chassis,
  );

  for (const s of [-1, 1]) {
    const upper = [s * 0.205, 1.425, 0.30];
    const lower = [s * 0.205, 0.535, 1.23];
    rod(
      "polishedForkStanchion",
      upper,
      lower,
      0.033,
      STEEL,
      steering,
    );
    b.rod(
      lower,
      [s * 0.205, 0.925, 0.826],
      [0.061, 0.051],
      {
        bone: steering,
        color: ENAMEL,
        sides: 8,
        name: "armoredForkSlider",
      },
    );
    cylinder(
      "forkWiperCollar",
      [s * 0.205, 0.941, 0.807],
      0.062,
      0.044,
      C.orange,
      forkAxis,
      steering,
    );
    cylinder(
      "forkTopCap",
      upper,
      0.048,
      0.036,
      ALLOY,
      forkAxis,
      steering,
    );
    cylinder(
      "frontAxleBoss",
      lower,
      0.079,
      0.074,
      CERAMIC,
      [1, 0, 0],
      steering,
    );
    bolt(
      [s * 0.253, 0.535, 1.23],
      [s, 0, 0],
      steering,
      0.025,
    );
    sidePlate(
      "forkSideShield",
      s * 0.233, 0.67, 1.067,
      [
        [0.10, -0.11],
        [0.16, -0.10],
        [-0.075, 0.165],
        [-0.11, 0.143],
      ],
      0.026,
      CERAMIC,
      steering,
      0.006,
    );
    bolt(
      [s * 0.25, 0.755, 0.999],
      [s, 0, 0],
      steering,
      0.012,
    );
  }

  for (const p of [[0, 1.39, 0.336], [0, 1.16, 0.574]]) {
    b.part(new THREE.BoxGeometry(0.51, 0.063, 0.113), IRON, {
      at: p,
      dir: forkAxis,
      bone: steering,
      name: "tripleClamp",
    });
    for (const s of [-1, 1]) {
      bolt(
        [s * 0.256, p[1], p[2]],
        [s, 0, 0],
        steering,
        0.018,
      );
    }
  }

  sidePlate(
    "frontBrakeCaliper",
    0.196, 0.64, 1.07,
    [
      [-0.025, -0.062],
      [0.04, -0.06],
      [0.11, 0.018],
      [0.078, 0.095],
      [0.005, 0.09],
      [-0.044, 0.03],
    ],
    0.058,
    C.orange,
    steering,
    0.006,
  );
  bolt([0.231, 0.697, 1.104], [1, 0, 0], steering, 0.012);

  // The brake hose is plugged into the control and guided by the fork.
  tube(
    "braidedFrontBrakeHose",
    [
      [0.407, 1.623, 0.340],
      [0.342, 1.552, 0.374],
      [0.286, 1.480, 0.434],
      [0.275, 1.333, 0.484],
      [0.247, 1.181, 0.575],
      [0.250, 0.905, 0.831],
      [0.230, 0.700, 1.075],
    ],
    0.009,
    C.black,
    steering,
    6,
  );
  cylinder(
    "brakeLineUpperFerrule",
    [0.407, 1.623, 0.340],
    0.015,
    0.036,
    STEEL,
    [-0.55, -0.70, 0.35],
    steering,
    8,
  );
  cylinder(
    "caliperHoseUnion",
    [0.230, 0.701, 1.075],
    0.016,
    0.031,
    STEEL,
    [0, 1, -0.25],
    steering,
    8,
  );
  for (const p of [[0.246, 1.18, 0.575], [0.250, 0.905, 0.831]]) {
    box(
      "brakeHoseGuide",
      p,
      [0.048, 0.019, 0.029],
      C.ink,
      steering,
    );
    bolt(
      [p[0] + 0.025, p[1], p[2]],
      [1, 0, 0],
      steering,
      0.008,
    );
  }

  // Armored headlight.
  cylinder(
    "headlampBucket",
    [0, 1.187, 0.68],
    0.149,
    0.22,
    C.ink,
    [0, 0, 1],
    steering,
    8,
  );
  cylinder(
    "headlampArmorRing",
    [0, 1.187, 0.779],
    0.167,
    0.065,
    CERAMIC,
    [0, 0, 1],
    steering,
    8,
  );
  cylinder(
    "headlampBlackBezel",
    [0, 1.187, 0.817],
    0.140,
    0.026,
    C.ink,
    [0, 0, 1],
    steering,
    8,
  );
  glow(
    drawing(
      "segmentedIceBlueHeadlight",
      lensDrawing,
      [0, 1.187, 0.832],
      [0.248, 0.248],
      [0, 0, 1],
      steering,
    ),
    1.4,
  );
  sidePlate(
    "sculptedHeadlightBrow",
    0, 1.187, 0.68,
    [
      [-0.09, 0.088],
      [-0.032, 0.153],
      [0.115, 0.157],
      [0.177, 0.115],
      [0.174, 0.093],
      [0.105, 0.112],
      [-0.038, 0.109],
    ],
    0.334,
    ENAMEL,
    steering,
    0.006,
  );

  // Low flyscreen ties the lamp back into the upper steering assembly.
  const browX = [1, 0, 0];
  const browY = [0, 0.9396926, -0.3420201];
  const browNormal = new THREE.Vector3(0, 0.3420201, 0.9396926);
  const browOrigin = new THREE.Vector3(0, 1.305, 0.655);

  b.extrude(
    [
      [-0.154, 0],
      [0.154, 0],
      [0.132, 0.116],
      [0.089, 0.144],
      [-0.089, 0.144],
      [-0.132, 0.116],
    ],
    {
      at: browOrigin,
      x: browX,
      y: browY,
      thickness: 0.031,
      bevel: 0.005,
      color: ENAMEL,
      bone: steering,
      name: "armoredInstrumentBrow",
    },
  );
  b.extrude(
    [
      [-0.125, 0.018],
      [0.125, 0.018],
      [0.108, 0.104],
      [0.077, 0.120],
      [-0.077, 0.120],
      [-0.108, 0.104],
    ],
    {
      at: browOrigin.clone().addScaledVector(browNormal, 0.017),
      x: browX,
      y: browY,
      thickness: 0.003,
      bevel: 0,
      color: C.ink,
      bone: steering,
      name: "smokedInstrumentBrowInset",
    },
  );
  b.extrude(
    [
      [-0.070, 0.091],
      [0, 0.058],
      [0.070, 0.091],
      [0.064, 0.108],
      [0, 0.079],
      [-0.064, 0.108],
    ],
    {
      at: browOrigin.clone().addScaledVector(browNormal, 0.020),
      x: browX,
      y: browY,
      thickness: 0.002,
      bevel: 0,
      color: C.orange,
      bone: steering,
      name: "browOrangeChevron",
    },
  );

  for (const s of [-1, 1]) {
    rod(
      "instrumentBrowMount",
      [s * 0.112, 1.386, 0.367],
      [s * 0.112, 1.379, 0.616],
      0.014,
      IRON,
      steering,
    );
    bolt(
      [s * 0.112, 1.337, 0.663],
      [0, 0.342, 0.94],
      steering,
      0.008,
      STEEL,
    );

    sidePlate(
      "headlightCheekArmor",
      s * 0.151, 1.187, 0.68,
      [
        [-0.065, 0.072],
        [0.09, 0.106],
        [0.11, -0.081],
        [0.035, -0.136],
        [-0.07, -0.062],
      ],
      0.024,
      ENAMEL,
      steering,
      0.006,
    );
    bolt(
      [s * 0.169, 1.198, 0.704],
      [s, 0, 0],
      steering,
      0.015,
    );
    rod(
      "headlightMount",
      [s * 0.11, 1.16, 0.58],
      [s * 0.15, 1.187, 0.71],
      0.024,
      IRON,
      steering,
    );
    rod(
      "indicatorMountBridge",
      [s * 0.205, 1.173, 0.577],
      [s * 0.215, 1.23, 0.65],
      0.022,
      IRON,
      steering,
    );
    box(
      "frontIndicatorStalk",
      [s * 0.251, 1.23, 0.65],
      [0.13, 0.033, 0.046],
      C.ink,
      steering,
    );
    glow(
      box(
        "frontAmberIndicator",
        [s * 0.299, 1.232, 0.68],
        [0.075, 0.029, 0.019],
        C.orange,
        steering,
      ),
      1.3,
    );
  }

  // Swept mini-ape bars.
  for (const s of [-1, 1]) {
    rod(
      "handlebarRiser",
      [s * 0.11, 1.403, 0.33],
      [s * 0.11, 1.535, 0.30],
      0.025,
      IRON,
      steering,
    );
    tube(
      "sweptHandlebar",
      [
        [s * 0.03, 1.535, 0.30],
        [s * 0.24, 1.54, 0.30],
        [s * 0.36, 1.63, 0.29],
        [s * 0.52, 1.62, 0.36],
        [s * 0.60, 1.605, 0.40],
      ],
      0.022,
      STEEL,
      steering,
    );
    rod(
      "rubberGrip",
      [s * 0.435, 1.624, 0.322],
      [s * 0.605, 1.605, 0.40],
      0.032,
      C.black,
      steering,
    );
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      cylinder(
        "gripRaisedRib",
        [
          s * (0.454 + 0.126 * t),
          1.622 - 0.014 * t,
          0.331 + 0.058 * t,
        ],
        0.034,
        0.009,
        "#3b474d",
        [s, -0.1, 0.46],
        steering,
      );
    }
    cylinder(
      "barEndWeight",
      [s * 0.611, 1.604, 0.403],
      0.039,
      0.022,
      C.orange,
      [s, -0.1, 0.46],
      steering,
    );
    box(
      "switchgear",
      [s * 0.416, 1.635, 0.315],
      [0.066, 0.065, 0.07],
      C.ink,
      steering,
    );
    box(
      "orangeKillSwitch",
      [s * 0.419, 1.67, 0.321],
      [0.021, 0.009, 0.025],
      C.orange,
      steering,
    );
    tube(
      "brakeLever",
      [
        [s * 0.402, 1.62, 0.362],
        [s * 0.433, 1.595, 0.438],
        [s * 0.55, 1.587, 0.486],
      ],
      0.011,
      STEEL,
      steering,
      6,
    );
    cylinder(
      "leverEnd",
      [s * 0.55, 1.587, 0.486],
      0.015,
      0.017,
      STEEL,
      [0, 1, 0],
      steering,
      8,
    );
    rod(
      "mirrorStem",
      [s * 0.396, 1.654, 0.304],
      [s * 0.443, 1.783, 0.282],
      0.011,
      IRON,
      steering,
    );

    const mirror = b.part(
      new THREE.BoxGeometry(0.142, 0.082, 0.034),
      C.ink,
      {
        at: [s * 0.455, 1.797, 0.274],
        rotation: [8, s * -14, s * -6],
        bone: steering,
        name: "angularBarMirrorHousing",
      },
    );

    // Glass and back stripe use the housing's exact orientation.
    b.part(
      new THREE.BoxGeometry(0.117, 0.060, 0.005),
      "#9bc5cf",
      {
        at: mirror.local([0, 0, -0.019]),
        quat: mirror.quat,
        bone: steering,
        name: "mirrorReflectiveInset",
      },
    );
    b.part(
      new THREE.BoxGeometry(0.072, 0.009, 0.004),
      C.orange,
      {
        at: mirror.local([0, -0.022, 0.019]),
        quat: mirror.quat,
        bone: steering,
        name: "mirrorBackOrangeSignature",
      },
    );
  }

  box(
    "digitalInstrumentPod",
    [0, 1.501, 0.267],
    [0.234, 0.047, 0.16],
    C.ink,
    steering,
    [-20, 0, 0],
  );
  glow(
    drawing(
      "digitalSpeedDisplay",
      speedometer,
      [0, 1.527, 0.258],
      [0.208, 0.139],
      [0, 0.94, -0.342],
      steering,
      [0, -0.342, -0.94],
    ),
    0.8,
  );
  cylinder(
    "boostGaugeCase",
    [0.18, 1.404, 0.223],
    0.049,
    0.027,
    ALLOY,
    [0, 0.90, -0.44],
    steering,
    16,
  );
  drawing(
    "analogBoostGauge",
    pressureFace,
    [0.18, 1.419, 0.215],
    [0.085, 0.085],
    [0, 0.90, -0.44],
    steering,
    [0, -0.44, -0.90],
  );
  tube(
    "cockpitCableBundle",
    [
      [-0.416, 1.616, 0.303],
      [-0.33, 1.548, 0.216],
      [-0.26, 1.49, 0.20],
      [-0.16, 1.38, 0.20],
      [-0.15, 1.17, 0.34],
      [-0.18, 1.03, 0.19],
    ],
    0.012,
    C.black,
    steering,
    6,
  );

  for (const s of [-1, 1]) {
    rod(
      "forwardControlBracket",
      [s * 0.20, 0.39, 0.12],
      [s * 0.38, 0.43, 0.12],
      0.023,
      STEEL,
    );
    cylinder(
      "footpeg",
      [s * 0.415, 0.43, 0.12],
      0.039,
      0.17,
      C.black,
      [1, 0, 0],
    );
    for (let i = 0; i < 4; i++) {
      cylinder(
        "footpegRib",
        [s * (0.365 + i * 0.032), 0.43, 0.12],
        0.042,
        0.009,
        C.darkSilver,
      );
    }
    rod(
      "controlPedalArm",
      [s * 0.30, 0.43, 0.09],
      [s * 0.33, 0.48, 0.28],
      0.013,
      ALLOY,
    );
    cylinder(
      "pedalToeRubber",
      [s * 0.36, 0.48, 0.28],
      0.024,
      0.095,
      C.black,
    );
  }

  rod(
    "kickstandLeg",
    [0.22, 0.38, -0.32],
    [0.54, 0.095, -0.46],
    0.023,
    IRON,
    stand,
  );
  box(
    "kickstandShoe",
    [0.54, 0.08, -0.46],
    [0.11, 0.025, 0.105],
    STEEL,
    stand,
  );
  bolt(
    [0.252, 0.38, -0.32],
    [1, 0, 0],
    stand,
    0.023,
  );
  b.sweep(
    coil(
      [0.23, 0.35, -0.30],
      [0.37, 0.24, -0.37],
      0.017,
      5,
    ),
    0.004,
    {
      color: STEEL,
      bone: stand,
      sides: 5,
      name: "standReturnSpring",
    },
  );

  // Localized wear: just a few little nicks on the colored tank edge.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.23 + i * 0.12 + random() * 0.008;
      box(
        "tankEdgeWearTick",
        [s * 0.249, 1.109 + i * 0.007, z],
        [0.003, 0.004, 0.025],
        C.ivory,
      );
    }
  }

  return b.root;
}
