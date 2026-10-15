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
import type { Fill, Joint, PointInput } from "../../../../src/index";
import { metal, coil, gaugeTexture } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "JACKAL / V9 — Custom Chopper",
  description:
    "A hero-shooter custom chopper: stretched rake, massive rear rubber, ivory-and-petrol armor, exposed V-twin, orange coilovers, twin swept exhausts, and an ice-blue cyclops headlight.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "JACKAL_V9",
    detail: 1,
    paintSize: 2048,
  });

  const random = rng(1907);
  const C = {
    ink: "#17232d",
    black: "#10171e",
    rubber: "#242c33",
    tread: "#333d44",
    teal: "#147d86",
    tealLight: "#31a5aa",
    ivory: "#eee7d6",
    orange: "#ff762e",
    orangeDark: "#ad3f22",
    gold: "#dca455",
    silver: "#afc1c8",
    darkSilver: "#647a85",
    blue: "#8ff4ff",
    red: "#ff423f",
  };

  const STEEL = metal("steel", { polish: 0.65, tarnish: 0.12, size: 0.09 });
  const IRON = metal("iron", { polish: 0.2, tarnish: 0.1 });
  const ALLOY = metal("brass", { polish: 0.45, tarnish: 0.08 });
  const PIPE = metal("blued", { polish: 0.55, tarnish: 0.1, size: 0.11 });

  const ENAMEL = paint((p, n) =>
    mix(
      "#09606d",
      "#23949a",
      Math.min(1, 0.52 + n.y * 0.28 + n.z * 0.1 + noise(p, 0.16, 8) * 0.12),
    ),
  );
  const CERAMIC = paint((p, n) =>
    mix("#b5bdba", "#fff0d7", 0.6 + 0.23 * n.y + 0.07 * noise(p, 0.12, 2)),
  );
  const LEATHER = paint((p, n) =>
    mix("#15242b", "#35464c", 0.2 + 0.25 * Math.max(0, n.y) + 0.15 * noise(p, 0.012, 7)),
  );

  // Skeleton first. Wheels and the steering assembly have independent pivots.
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

  // Shared placement helpers. Dimensions are full dimensions, in meters.
  function box(
    name: string,
    at: number[],
    size: number[],
    color: Fill,
    bone: Joint = chassis,
    rotation: number[] = [0, 0, 0],
  ) {
    return b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, {
      at,
      bone,
      rotation,
      name,
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
    return b.part(new THREE.CylinderGeometry(radius, radius, length, sides), color, {
      at,
      dir,
      bone,
      name,
    });
  }

  function bolt(
    at: number[],
    dir: number[],
    bone: Joint = chassis,
    radius = 0.013,
    color: Fill = STEEL,
  ) {
    return cylinder("hexFastener", at, radius, 0.012, color, dir, bone, 6);
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
      bone,
      color,
      sides,
      caps: "flat",
      name,
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
    return b.rod(a, c, radius, { bone, color, sides: 8, name });
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
    return b.part(new THREE.TorusGeometry(radius, thickness, 6, segments), color, {
      at,
      dir,
      axis: "z",
      bone,
      name,
    });
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
    return b.part(new THREE.PlaneGeometry(size[0], size[1]), "#ffffff", {
      at,
      dir,
      up,
      axis: "z",
      texture,
      bone,
      name,
    });
  }

  // Original livery: a sharp jackal/arrow mark, condensed racing typography,
  // enamel labels, a stitched saddle, and an electronic speedometer.
  const tankGraphic = svg(
    `<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 35 L85 14 L131 44 L151 11 L167 86 L111 150 L92 109 L41 110 L66 77 Z"
        fill="#17232d"/>
      <path d="M39 43 L82 31 L107 52 L81 53 L68 75 Z" fill="#ff762e"/>
      <path d="M109 75 L143 54 L132 99 Z" fill="#eee7d6"/>
      <path d="M175 161 H624" stroke="#17232d" stroke-width="8"/>
      <text x="179" y="115" font-family="Arial,sans-serif" font-size="87"
        font-weight="900" font-style="italic" letter-spacing="-5" fill="#17232d">JACKAL</text>
      <text x="184" y="193" font-family="Arial,sans-serif" font-size="25"
        font-weight="bold" letter-spacing="7" fill="#17232d">CUSTOM / V9</text>
      <path d="M520 25 H564 L546 45 H502 Z M572 25 H616 L598 45 H554 Z"
        fill="#ff762e"/>
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
      <path d="M25 30 Q120 4 215 30 L221 234 Q184 302 120 307
        Q55 302 19 234 Z" fill="none" stroke="#df9a61" stroke-width="4"
        stroke-dasharray="9 7"/>
      <g fill="none" stroke="#738080" stroke-width="3" opacity=".75">
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
      <rect x="3" y="3" width="234" height="154" rx="21" fill="#111e29"
        stroke="#698b98" stroke-width="6"/>
      <path d="M25 43 H207" stroke="#244b58" stroke-width="9"/>
      <path d="M25 43 H134" stroke="#89f5ff" stroke-width="9"/>
      <text x="25" y="117" font-family="monospace" font-size="71"
        font-weight="bold" fill="#b4faff">00</text>
      <text x="142" y="106" font-family="Arial,sans-serif" font-size="22"
        fill="#89f5ff">KM/H</text>
      <text x="24" y="143" font-family="monospace" font-size="16"
        fill="#ffad60">N  /  SYSTEM READY</text>
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
      <path d="M39 137 H161 L143 162 H57 Z" fill="#e3ffff"/>
      <path d="M58 25 H142 M48 178 H152" stroke="#ffffff" stroke-width="4"/>
    </svg>`,
    { size: 256 },
  );

  const padGraphic = svg(
    `<svg viewBox="0 0 640 130" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="634" height="124" rx="12" fill="#17232d"
        stroke="#4b646e" stroke-width="5"/>
      <path d="M25 29 H45 V99 H25 Z M57 29 H70 V99 H57 Z" fill="#ff762e"/>
      <text x="99" y="64" font-family="Arial,sans-serif" font-size="47"
        font-weight="900" letter-spacing="7" fill="#eee7d6">JACKAL V9</text>
      <text x="100" y="103" font-family="Arial,sans-serif" font-size="22"
        letter-spacing="5" fill="#66b4ba">CUSTOM MOTOR WORKS / 07</text>
    </svg>`,
    { size: 768 },
  );

  const pressureFace = gaugeTexture({
    needle: 52,
    label: "BOOST",
    face: "#f4e5c6",
    size: 192,
  });

  // Compact garage display pad, with real tire contact on its top face.
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
    box("padEdgeOrange", [s * 0.63, 0.067, 0.07], [0.028, 0.006, 0.92], C.orange, setting);
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

  // Wheels: squared balloon profiles instead of smooth generic torus tires.
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
    b.lathe(
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
      const a = (i * Math.PI * 2) / treadCount;
      const rr = r - 0.005;
      box(
        `${name}TreadBlock`,
        [0, y + Math.cos(a) * rr, z + Math.sin(a) * rr],
        [halfWidth * 1.18, 0.009, isRear ? 0.038 : 0.035],
        i % 4 === 0 ? "#3a454b" : C.tread,
        bone,
        [(a * 180) / Math.PI, 0, i % 2 === 0 ? 12 : -12],
      );
    }

    cylinder(`${name}RimBarrel`, [0, y, z], inner * 0.96, halfWidth * 1.52, C.ink, [1, 0, 0], bone, 24);
    // A dark inset behind the spokes preserves the readable five-spoke design.
    for (const s of [-1, 1]) {
      const face = s * halfWidth * 0.83;
      annulus(`${name}ForgedRim`, [face, y, z], inner * 1.02, inner * 0.85, 0.033, ALLOY, bone);
      ring(`${name}RimPinstripe`, [s * (Math.abs(face) + 0.02), y, z], inner * 0.98, 0.006, C.ivory, [1, 0, 0], bone);
      ring(`${name}SidewallRidge`, [s * halfWidth * 0.97, y, z], r * 0.84, 0.006, "#465057", [1, 0, 0], bone);
      cylinder(`${name}Hub`, [face, y, z], 0.081, 0.055, STEEL, [1, 0, 0], bone);

      for (let j = 0; j < 5; j++) {
        const a = (j * Math.PI * 2) / 5 + 0.22;
        const a2 = a + 0.20;
        const p0 = [face, y + Math.cos(a) * 0.07, z + Math.sin(a) * 0.07];
        const p1 = [face, y + Math.cos(a2) * inner * 0.90, z + Math.sin(a2) * inner * 0.90];
        b.frustumBox(p0, p1, [0.04, 0.05], [0.026, 0.039], {
          bone,
          color: ALLOY,
          name: `${name}SweptSpoke`,
        });
      }
      bolt([s * (halfWidth + 0.005), y, z], [s, 0, 0], bone, 0.029, IRON);
    }

    const rotorX = halfWidth + 0.028;
    annulus(`${name}BrakeRotor`, [rotorX, y, z], inner * 0.76, inner * 0.53, 0.014, STEEL, bone);
    annulus(`${name}RotorSpider`, [rotorX - 0.003, y, z], inner * 0.54, 0.058, 0.010, IRON, bone);
    for (let j = 0; j < 10; j++) {
      const a = (j * Math.PI * 2) / 10;
      const rr = inner * 0.65;
      // Recessed drilled-rotor marks, rather than floating studs.
      cylinder(
        `${name}RotorDrilling`,
        [rotorX + 0.008, y + Math.cos(a) * rr, z + Math.sin(a) * rr],
        0.011,
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

  // Curved sheet-metal fenders built as thick low-poly arches.
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
      const a = ((start + ((end - start) * i) / n) * Math.PI) / 180;
      outline.push([Math.sin(a) * (radius + 0.036), Math.cos(a) * (radius + 0.036)]);
    }
    for (let i = n; i >= 0; i--) {
      const a = ((start + ((end - start) * i) / n) * Math.PI) / 180;
      outline.push([Math.sin(a) * radius, Math.cos(a) * radius]);
    }
    const result = sidePlate(name, 0, y, z, outline, width, color, bone, 0.005);
    for (const s of [-1, 1]) {
      const path: number[][] = [];
      for (let i = 0; i <= n; i++) {
        const a = ((start + ((end - start) * i) / n) * Math.PI) / 180;
        path.push([
          s * (width / 2 + 0.001),
          y + Math.cos(a) * (radius + 0.019),
          z + Math.sin(a) * (radius + 0.019),
        ]);
      }
      tube(`${name}EdgeBead`, path, 0.008, C.gold, bone, 6);
    }
    return result;
  }

  const rearFender = fender("rearArmorFender", 0.515, -1.02, 0.489, 0.47, -104, 48, chassis, ENAMEL);
  fender("frontFloatingFender", 0.535, 1.23, 0.507, 0.279, -63, 45, steering, CERAMIC);

  // Front fender central racing stripe; its support brackets are visibly attached.
  const frontStripe: number[][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = ((-60 + i * 10.2) * Math.PI) / 180;
    frontStripe.push([0, 0.535 + Math.cos(a) * 0.546, 1.23 + Math.sin(a) * 0.546]);
  }
  b.sweep(frontStripe, () => [0.031, 0.0025], {
    section: "box",
    color: C.orange,
    bone: steering,
    caps: "flat",
    name: "frontFenderOrangeStripe",
  });

  for (const s of [-1, 1]) {
    rod("frontFenderStay", [s * 0.16, 0.56, 1.22], [s * 0.145, 0.91, 0.94], 0.012, STEEL, steering);
    bolt([s * 0.154, 0.92, 0.94], [s, 0, 0], steering);
    b.decal(rearFender, raceNumber, {
      at: [s * 0.236, 0.864, -1.27],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [0.22, 0.165],
      bone: chassis,
      name: "rearRaceNumber",
    });
  }

  // Welded double-cradle chassis, with a long low space around the engine.
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
    bolt([s * 0.30, 0.515, -1.02], [s, 0, 0], chassis, 0.025);
    cylinder("swingarmPivot", [s * 0.258, 0.50, -0.40], 0.062, 0.035, ALLOY);
    bolt([s * 0.287, 0.50, -0.40], [s, 0, 0], chassis, 0.023);

    const shockTop = [s * 0.28, 0.95, -0.69];
    const shockBottom = [s * 0.28, 0.56, -0.96];
    rod("rearShockPiston", shockBottom, shockTop, 0.028, STEEL);
    b.sweep(coil(shockBottom, shockTop, 0.052, 6), 0.013, {
      bone: chassis,
      color: C.orange,
      sides: 6,
      name: "orangeRearCoilover",
    });
    for (const p of [shockTop, shockBottom]) {
      cylinder("shockEyelet", p, 0.046, 0.045, C.ink);
      bolt([p[0] + s * 0.029, p[1], p[2]], [s, 0, 0], chassis, 0.018);
    }
  }

  rod("engineFrontCrossmember", [-0.23, 0.38, 0.12], [0.23, 0.38, 0.12], 0.031, IRON);
  box("ribbedBellyPan", [0, 0.35, -0.16], [0.38, 0.095, 0.48], IRON);
  for (let i = 0; i < 4; i++) {
    box("bellyPanRib", [0, 0.30, -0.32 + i * 0.1], [0.31, 0.025, 0.022], C.darkSilver);
  }

  // The exaggerated exposed V-twin is the chopper's visual center.
  cylinder("transverseCrankcase", [0, 0.61, -0.23], 0.205, 0.39, IRON);
  for (const s of [-1, 1]) {
    cylinder("crankcaseCoverRim", [s * 0.214, 0.61, -0.23], 0.183, 0.041, STEEL);
    cylinder("crankcaseCover", [s * 0.242, 0.61, -0.23], 0.147, 0.025, C.ink);
    cylinder("crankcaseMedallion", [s * 0.262, 0.61, -0.23], 0.080, 0.016, ALLOY);
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      bolt(
        [s * 0.239, 0.61 + Math.cos(a) * 0.164, -0.23 + Math.sin(a) * 0.164],
        [s, 0, 0],
        chassis,
        0.012,
      );
    }
  }

  const cylinders = [
    { root: [0, 0.68, -0.29], tip: [0, 1.00, -0.52] },
    { root: [0, 0.69, -0.17], tip: [0, 1.04, 0.08] },
  ];

  cylinders.forEach((engine, index) => {
    const start = new THREE.Vector3(...(engine.root as [number, number, number]));
    const tip = new THREE.Vector3(...(engine.tip as [number, number, number]));
    const axis = tip.clone().sub(start).normalize();

    b.frustumBox(start, tip, [0.275, 0.225], [0.285, 0.235], {
      bone: chassis,
      color: C.ink,
      name: `cylinder${index}Core`,
    });

    for (let i = 0; i < 8; i++) {
      const p = start.clone().lerp(tip, 0.16 + i * 0.103);
      b.part(new THREE.BoxGeometry(0.343, 0.024, 0.263), i === 7 ? ALLOY : STEEL, {
        at: p,
        dir: axis,
        bone: chassis,
        name: "stackedCoolingFin",
      });
    }

    b.part(new THREE.BoxGeometry(0.36, 0.077, 0.278), CERAMIC, {
      at: tip.clone().addScaledVector(axis, 0.019),
      dir: axis,
      bone: chassis,
      name: "facetedRockerCover",
    });
    b.part(new THREE.BoxGeometry(0.23, 0.085, 0.14), ENAMEL, {
      at: tip.clone().addScaledVector(axis, 0.034),
      dir: axis,
      bone: chassis,
      name: "rockerCoverInset",
    });

    for (const s of [-1, 1]) {
      const root = [s * 0.183, engine.root[1] + 0.01, engine.root[2]];
      const end = [s * 0.183, engine.tip[1], engine.tip[2]];
      rod("externalPushrod", root, end, 0.015, STEEL);
      bolt([s * 0.193, engine.tip[1], engine.tip[2]], [s, 0, 0], chassis, 0.013);
    }
  });

  // Intake, filter and electrical conduits.
  cylinder("intakeElbow", [0.245, 0.89, -0.16], 0.10, 0.22, IRON);
  cylinder("airFilterRim", [0.36, 0.89, -0.16], 0.132, 0.07, ALLOY);
  cylinder("airFilterDarkFace", [0.400, 0.89, -0.16], 0.110, 0.013, C.ink);
  for (let i = 0; i < 5; i++) {
    const yy = 0.89 + (i - 2) * 0.032;
    box("intakeFilterLouver", [0.410, yy, -0.16], [0.015, 0.012, 0.166 - Math.abs(i - 2) * 0.015], STEEL);
  }
  tube(
    "orangeIgnitionLead",
    [[-0.20, 1.02, 0.03], [-0.28, 1.00, -0.04], [-0.29, 0.81, -0.17], [-0.21, 0.79, -0.39], [-0.19, 0.98, -0.50]],
    0.014,
    C.orange,
  );
  cylinder("oilReservoir", [-0.18, 0.74, -0.61], 0.084, 0.23, ENAMEL, [0, 1, 0]);
  cylinder("oilCap", [-0.18, 0.866, -0.61], 0.058, 0.025, ALLOY, [0, 1, 0]);

  // Low belt final drive on the right side.
  annulus("rearBeltPulley", [-0.246, 0.515, -1.02], 0.226, 0.177, 0.032, IRON, chassis);
  cylinder("drivePulley", [-0.273, 0.525, -0.43], 0.10, 0.035, IRON);
  tube(
    "upperDriveBelt",
    [[-0.267, 0.726, -1.05], [-0.267, 0.714, -0.84], [-0.267, 0.62, -0.43]],
    0.025,
    C.black,
    chassis,
    4,
  );
  tube(
    "lowerDriveBelt",
    [[-0.267, 0.302, -1.03], [-0.267, 0.328, -0.80], [-0.267, 0.43, -0.43]],
    0.025,
    C.black,
    chassis,
    4,
  );
  sidePlate(
    "beltGuard",
    -0.291,
    0.68,
    -1.08,
    [[0, 0.063], [0.23, 0.055], [0.70, -0.055], [0.68, -0.105], [0.18, 0.007], [0, 0.014]],
    0.027,
    ENAMEL,
  );

  // Two independent exhaust paths bend out of the heads into swept slash-cut cans.
  for (let i = 0; i < 2; i++) {
    const x = 0.31 + i * 0.076;
    const yy = 0.47 + i * 0.125;
    const start = i === 0 ? [0.18, 0.99, 0.05] : [0.18, 0.95, -0.49];
    tube(
      "heatBluedHeader",
      [
        start,
        [x, start[1] - 0.07, start[2] + 0.06],
        [x, yy + 0.12, 0.07],
        [x, yy, -0.17],
        [x, yy, -0.60],
        [x, yy + 0.09, -1.11],
      ],
      0.041,
      PIPE,
    );
    const a = [x, yy + 0.012, -0.59];
    const c = [x, yy + 0.11, -1.17];
    b.rod(a, c, [0.069, 0.057], { bone: chassis, color: CERAMIC, sides: 8, name: "ivoryExhaustHeatShield" });
    b.rod(
      [x, yy + 0.082, -1.005],
      [x, yy + 0.117, -1.205],
      0.06,
      { bone: chassis, color: IRON, sides: 8, name: "exhaustEndCap" },
    );
    cylinder("blackExhaustOpening", [x, yy + 0.12, -1.208], 0.045, 0.008, C.black, [0, 0.17, -1]);
    for (const z of [-0.66, -0.92]) {
      const y = yy + 0.012 + ((-z - 0.59) / 0.58) * 0.098;
      cylinder("exhaustClamp", [x, y, z], 0.073, 0.027, STEEL, [0, 0.17, -1]);
    }
    for (let j = 0; j < 3; j++) {
      box("exhaustShieldVent", [x + 0.066, yy + 0.044 + j * 0.012, -0.74 - j * 0.07], [0.004, 0.019, 0.041], C.ink);
    }
  }

  // Angular fuel tank: broad simple volume, rich graphic on each planar cheek.
  const tankOutline = [
    [0.00, 0.005],
    [0.13, 0.26],
    [0.53, 0.35],
    [0.85, 0.20],
    [0.77, -0.02],
    [0.18, -0.075],
  ];
  const tank = sidePlate("sculptedIvoryFuelTank", 0, 1.047, -0.46, tankOutline, 0.48, CERAMIC, chassis, 0.026);

  for (const s of [-1, 1]) {
    sidePlate(
      "lowerTankPetrolInset",
      s * 0.241,
      1.047,
      -0.46,
      [[0.10, 0.005], [0.20, -0.040], [0.71, 0.0], [0.77, 0.095], [0.30, 0.061]],
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
    bolt([s * 0.25, 1.113, -0.32], [s, 0, 0], chassis, 0.011);
    bolt([s * 0.25, 1.14, 0.247], [s, 0, 0], chassis, 0.011);
  }

  // Top spine stripe and recessed filler cap.
  tube(
    "tankTopOrangeInlay",
    [[0, 1.305, -0.31], [0, 1.393, 0.07], [0, 1.32, 0.26]],
    0.028,
    C.orange,
    chassis,
    4,
  );
  cylinder("fuelCapSocket", [0, 1.402, 0.04], 0.084, 0.024, C.ink, [0, 1, 0]);
  cylinder("fuelCap", [0, 1.418, 0.04], 0.065, 0.018, ALLOY, [0, 1, 0], chassis, 8);
  box("fuelCapLatch", [0, 1.430, 0.04], [0.067, 0.013, 0.020], STEEL);

  // Side battery armor, with protected slits and service labels.
  for (const s of [-1, 1]) {
    sidePlate(
      "triangularBatteryArmor",
      s * 0.225,
      0.82,
      -0.70,
      [[0, 0], [0.08, 0.17], [0.27, 0.11], [0.28, -0.035], [0.10, -0.075]],
      0.06,
      ENAMEL,
      chassis,
      0.012,
    );
    drawing("engineWarningLabel", warning, [s * 0.259, 0.877, -0.54], [0.19, 0.063], [s, 0, 0]);
    for (let i = 0; i < 3; i++) {
      box("batteryCoverSlit", [s * 0.26, 0.79, -0.61 + i * 0.043], [0.005, 0.012, 0.026], C.ink);
    }
  }

  // A solo saddle, scooped at the front and lifted at the back.
  const seat = sidePlate(
    "stitchedSoloSaddle",
    0,
    0.987,
    -1.00,
    [
      [0.00, 0.078],
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
  b.decal(seat, saddleStitch, {
    at: [0, 1.065, -0.725],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.34, 0.47],
    segments: 14,
    bone: chassis,
    name: "saddleDiamondStitch",
  });
  for (const s of [-1, 1]) {
    tube(
      "saddleOrangePiping",
      [[s * 0.193, 1.073, -0.976], [s * 0.193, 1.096, -0.90], [s * 0.193, 1.04, -0.73], [s * 0.193, 1.029, -0.56], [s * 0.193, 1.054, -0.44]],
      0.005,
      C.orange,
      chassis,
      6,
    );
  }

  // Rear lighting tucked into the fender, with a small plate carrier.
  box("tailLampHousing", [0, 0.702, -1.509], [0.31, 0.087, 0.065], C.ink, chassis, [-19, 0, 0]);
  glow(box("tailLamp", [0, 0.713, -1.546], [0.25, 0.038, 0.012], C.red, chassis, [-19, 0, 0]), 1.6);
  box("tailLampDivider", [0, 0.713, -1.556], [0.012, 0.042, 0.008], C.ink, chassis, [-19, 0, 0]);
  rod("plateBracket", [-0.23, 0.515, -1.02], [-0.30, 0.66, -1.31], 0.016, IRON);
  box("smallLicensePlate", [-0.30, 0.68, -1.34], [0.16, 0.095, 0.017], C.ivory);
  drawing("plateNumber", raceNumber, [-0.30, 0.68, -1.352], [0.136, 0.079], [0, 0, -1]);

  // Raked front end: wide crowns, long exposed stanchions, chunky sliders.
  cylinder("steeringHeadTube", [0, 1.278, 0.376], 0.091, 0.27, IRON, [0, -0.68, 0.74], chassis);

  const forkAxis = [0, -0.68, 0.74];
  for (const s of [-1, 1]) {
    const upper = [s * 0.205, 1.425, 0.30];
    const lower = [s * 0.205, 0.535, 1.23];
    rod("polishedForkStanchion", upper, lower, 0.033, STEEL, steering);
    b.rod(
      [s * 0.205, 0.535, 1.23],
      [s * 0.205, 0.925, 0.826],
      [0.061, 0.051],
      { bone: steering, color: ENAMEL, sides: 8, name: "armoredForkSlider" },
    );
    cylinder("forkWiperCollar", [s * 0.205, 0.941, 0.807], 0.062, 0.044, C.orange, forkAxis, steering);
    cylinder("forkTopCap", upper, 0.048, 0.036, ALLOY, forkAxis, steering);
    cylinder("frontAxleBoss", lower, 0.079, 0.074, CERAMIC, [1, 0, 0], steering);
    bolt([s * 0.253, 0.535, 1.23], [s, 0, 0], steering, 0.025);

    sidePlate(
      "forkSideShield",
      s * 0.233,
      0.67,
      1.067,
      [[0.10, -0.11], [0.16, -0.10], [-0.075, 0.165], [-0.11, 0.143]],
      0.026,
      CERAMIC,
      steering,
      0.006,
    );
    bolt([s * 0.25, 0.755, 0.999], [s, 0, 0], steering, 0.012);
  }

  for (const p of [[0, 1.39, 0.336], [0, 1.16, 0.574]]) {
    b.part(new THREE.BoxGeometry(0.51, 0.063, 0.113), IRON, {
      at: p,
      dir: forkAxis,
      bone: steering,
      name: "tripleClamp",
    });
    for (const s of [-1, 1]) bolt([s * 0.256, p[1], p[2]], [s, 0, 0], steering, 0.018);
  }

  // Fixed caliper and a braided brake line down the leading fork.
  sidePlate(
    "frontBrakeCaliper",
    0.196,
    0.64,
    1.07,
    [[-0.025, -0.062], [0.04, -0.06], [0.11, 0.018], [0.078, 0.095], [0.005, 0.09], [-0.044, 0.03]],
    0.058,
    C.orange,
    steering,
    0.006,
  );
  bolt([0.231, 0.697, 1.104], [1, 0, 0], steering, 0.012);
  tube(
    "braidedFrontBrakeHose",
    [[0.39, 1.56, 0.32], [0.31, 1.38, 0.39], [0.24, 1.18, 0.56], [0.25, 0.90, 0.83], [0.23, 0.70, 1.075]],
    0.009,
    C.black,
    steering,
    6,
  );

  // Cyclops headlamp, physically layered: alloy bucket, armored octagon,
  // bezel, luminous segmented lens and a dark upper brow.
  cylinder("headlampBucket", [0, 1.187, 0.68], 0.157, 0.22, C.ink, [0, 0, 1], steering, 8);
  cylinder("headlampArmorRing", [0, 1.187, 0.779], 0.167, 0.065, CERAMIC, [0, 0, 1], steering, 8);
  cylinder("headlampBlackBezel", [0, 1.187, 0.817], 0.140, 0.026, C.ink, [0, 0, 1], steering, 8);
  glow(drawing("segmentedIceBlueHeadlight", lensDrawing, [0, 1.187, 0.832], [0.248, 0.248], [0, 0, 1], steering), 1.4);

  box("headlampBrow", [0, 1.326, 0.812], [0.33, 0.038, 0.14], ENAMEL, steering, [-8, 0, 0]);
  for (const s of [-1, 1]) {
    rod("headlightMount", [s * 0.11, 1.16, 0.58], [s * 0.15, 1.187, 0.71], 0.024, IRON, steering);
    bolt([s * 0.164, 1.187, 0.714], [s, 0, 0], steering, 0.018);
    box("frontIndicatorStalk", [s * 0.251, 1.23, 0.65], [0.13, 0.033, 0.046], C.ink, steering);
    glow(box("frontAmberIndicator", [s * 0.299, 1.232, 0.68], [0.075, 0.029, 0.019], C.orange, steering), 1.3);
  }

  // Broad mini-ape handlebars leave the central headlight completely clear.
  for (const s of [-1, 1]) {
    rod("handlebarRiser", [s * 0.11, 1.403, 0.33], [s * 0.11, 1.535, 0.30], 0.025, IRON, steering);
    tube(
      "sweptHandlebar",
      [[s * 0.03, 1.535, 0.30], [s * 0.24, 1.54, 0.30], [s * 0.36, 1.63, 0.29], [s * 0.52, 1.62, 0.36], [s * 0.60, 1.605, 0.40]],
      0.022,
      STEEL,
      steering,
    );
    rod("rubberGrip", [s * 0.435, 1.624, 0.322], [s * 0.605, 1.605, 0.40], 0.032, C.black, steering);
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      cylinder(
        "gripRaisedRib",
        [s * (0.454 + 0.126 * t), 1.622 - 0.014 * t, 0.331 + 0.058 * t],
        0.034,
        0.009,
        "#3b474d",
        [s, -0.1, 0.46],
        steering,
      );
    }
    cylinder("barEndWeight", [s * 0.611, 1.604, 0.403], 0.039, 0.022, C.orange, [s, -0.1, 0.46], steering);
    box("switchgear", [s * 0.416, 1.635, 0.315], [0.066, 0.065, 0.07], C.ink, steering);
    box("orangeKillSwitch", [s * 0.419, 1.67, 0.321], [0.021, 0.009, 0.025], C.orange, steering);
    tube(
      "brakeLever",
      [[s * 0.402, 1.62, 0.362], [s * 0.433, 1.595, 0.438], [s * 0.55, 1.587, 0.486]],
      0.011,
      STEEL,
      steering,
      6,
    );
    cylinder("leverEnd", [s * 0.55, 1.587, 0.486], 0.015, 0.017, STEEL, [0, 1, 0], steering, 8);

    rod("mirrorStem", [s * 0.396, 1.654, 0.304], [s * 0.443, 1.783, 0.282], 0.011, IRON, steering);
    const mirror = b.part(new THREE.BoxGeometry(0.142, 0.082, 0.034), C.ink, {
      at: [s * 0.455, 1.797, 0.274],
      rotation: [8, s * -14, s * -6],
      bone: steering,
      name: "angularBarMirrorHousing",
    });
    b.stick(
      new THREE.BoxGeometry(0.117, 0.010, 0.060),
      "#9bc5cf",
      frame(mirror.at.clone().add(new THREE.Vector3(0, 0.001, -0.021)), [s * 0.15, 0.08, -1]),
      { bone: steering, name: "mirrorReflectiveInset", embed: 0 },
    );
  }

  // Cockpit instruments angle toward the rider.
  box("digitalInstrumentPod", [0, 1.501, 0.267], [0.234, 0.047, 0.16], C.ink, steering, [-20, 0, 0]);
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
  cylinder("boostGaugeCase", [0.18, 1.404, 0.223], 0.049, 0.027, ALLOY, [0, 0.90, -0.44], steering, 16);
  drawing("analogBoostGauge", pressureFace, [0.18, 1.419, 0.215], [0.085, 0.085], [0, 0.90, -0.44], steering, [0, -0.44, -0.90]);
  tube(
    "cockpitCableBundle",
    [[-0.39, 1.60, 0.31], [-0.26, 1.49, 0.20], [-0.16, 1.38, 0.20], [-0.15, 1.17, 0.34], [-0.18, 1.03, 0.19]],
    0.015,
    C.black,
    steering,
    6,
  );

  // Forward controls, wide peg rubbers, rear brake pedal, and a planted stand.
  for (const s of [-1, 1]) {
    rod("forwardControlBracket", [s * 0.20, 0.39, 0.12], [s * 0.38, 0.43, 0.12], 0.023, STEEL);
    cylinder("footpeg", [s * 0.415, 0.43, 0.12], 0.039, 0.17, C.black, [1, 0, 0]);
    for (let i = 0; i < 4; i++) {
      cylinder("footpegRib", [s * (0.365 + i * 0.032), 0.43, 0.12], 0.042, 0.009, C.darkSilver);
    }
    rod("controlPedalArm", [s * 0.30, 0.43, 0.09], [s * 0.33, 0.48, 0.28], 0.013, ALLOY);
    cylinder("pedalToeRubber", [s * 0.36, 0.48, 0.28], 0.024, 0.095, C.black);
  }

  rod("kickstandLeg", [0.22, 0.38, -0.32], [0.54, 0.095, -0.46], 0.023, IRON, stand);
  box("kickstandShoe", [0.54, 0.08, -0.46], [0.11, 0.025, 0.105], STEEL, stand);
  bolt([0.252, 0.38, -0.32], [1, 0, 0], stand, 0.023);
  b.sweep(coil([0.23, 0.35, -0.30], [0.37, 0.24, -0.37], 0.017, 5), 0.004, {
    color: STEEL,
    bone: stand,
    sides: 5,
    name: "standReturnSpring",
  });

  // Restrained little witness marks on armor, never noisy all-over weathering.
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const z = -0.23 + i * 0.12 + random() * 0.008;
      box("tankEdgeWearTick", [s * 0.249, 1.109 + i * 0.007, z], [0.003, 0.004, 0.025], C.ivory);
    }
  }

  return b.root;
}
