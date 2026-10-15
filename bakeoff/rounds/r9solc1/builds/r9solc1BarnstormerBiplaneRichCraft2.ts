import * as THREE from "three";
import {
  createBuilder,
  frame,
  catmull,
  polyline,
  paint,
  grain,
  mottle,
  mix,
  noise,
  rng,
  svg,
  Paint,
} from "../../../../src/index";
import type { Joint } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Bumble — the little barnstormer",
  description:
    "A whimsical, lovingly patched air-circus biplane: golden fabric wings, vermilion fuselage, an exposed radial engine, a wooden propeller and an open leather-lined cockpit. Presented on a little grass airfield.",
};

type Finish = string | Paint;

export default function build(): THREE.Object3D {
  const b = createBuilder({
    name: "Bumble barnstormer",
    detail: 1,
    paintSize: 2048,
  });
  const random = rng(1907);

  const C = {
    red: "#c7473e",
    redDark: "#8d2e35",
    coral: "#ef7353",
    yellow: "#edbd55",
    cream: "#fff0c6",
    gold: "#d69d42",
    teal: "#328f91",
    tealDark: "#245b66",
    navy: "#243b48",
    ink: "#302b32",
    rubber: "#34363c",
    silver: "#a8b5b6",
    silverLight: "#d9e0cf",
    brass: "#d3ad62",
    leather: "#875039",
    leatherDark: "#4a3029",
    wood: "#b9793e",
    grass: "#819779",
    paleGrass: "#b5be8b",
    straw: "#c8a85e",
  };

  const fabric = paint((p, n) => {
    const tip = Math.abs(p.x) > 2.97;
    if (tip) {
      const stripe = Math.floor((p.z + 1.7) / 0.19) % 2 === 0;
      return stripe ? C.red : C.cream;
    }
    const rib = Math.abs(Math.sin((p.x * Math.PI) / 0.29));
    const weave =
      Math.sin(p.x * 850) * Math.sin(p.z * 850) * 0.017;
    const light = Math.max(0, n.y) * 0.16 + weave;
    const col = mix("#d5a54a", "#ffe7a0", 0.42 + light);
    return rib < 0.11 ? mix(col, C.cream, 0.35) : col;
  });

  const fuselagePaint = paint((p, n) => {
    if (n.y < -0.38) return "#efd2a0";
    const warm = 0.22 + Math.max(0, n.y) * 0.40;
    let col = mix("#a6373c", "#ec6750", warm);
    const wear = noise(p, 0.10, 7);
    if (wear > 0.73 && n.y > 0.2)
      col = mix(col, "#f6b17c", 0.2);
    return col;
  });

  const wood = grain("#91582f", "#d8a76a", {
    size: 0.016,
    axis: "y",
    seed: 9,
  });
  const leather = grain("#74432f", "#a26c48", {
    size: 0.018,
    axis: "z",
    seed: 11,
  });
  const groundPaint = paint((p, n) => {
    if (n.y < 0.3) return "#38525a";
    const broad = noise(p, 0.65, 23);
    const fine = noise(p, 0.045, 17);
    return mix("#7d9274", "#a2ad83", 0.22 + broad * 0.48 + fine * 0.10);
  });
  const strawPaint = paint((p, n) => {
    const across = Math.abs(n.z) > Math.abs(n.y) ? p.y : p.z;
    const strand = Math.sin(across * 410 + Math.sin(p.x * 11) * 0.55);
    const broad = noise(p, 0.18, 14);
    const base = mix("#bc9e59", "#ddc17d", 0.32 + broad * 0.35);
    return strand > 0.90 ? mix(base, "#f1d994", 0.24)
      : strand < -0.93 ? mix(base, "#96773d", 0.18)
      : base;
  });
  const steel = mottle("#626e72", "#b8c1b9", {
    size: 0.085,
    contrast: 0.8,
    seed: 21,
  });

  // The whole vehicle is a rigid assembly; moving pieces have useful pivots.
  const scene = b.joint("scene", { at: [0, 0, 0] });
  const aircraft = b.joint("fuselage", {
    parent: scene,
    at: [0, 1.4, 0],
    dir: [0, 0, 1],
  });
  const propeller = b.joint("propeller", {
    parent: aircraft,
    at: [0, 1.5, 2.19],
    dir: [0, 0, 1],
    role: "hinge",
  });
  const rudder = b.joint("rudder", {
    parent: aircraft,
    at: [0, 1.14, -3.02],
    dir: [0, 1, 0],
    role: "hinge",
  });
  const elevator = b.joint("elevator", {
    parent: aircraft,
    at: [0, 1.13, -2.96],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const wheelL = b.joint("wheelL", {
    parent: aircraft,
    at: [1.05, 0.59, 1.0],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const wheelR = b.joint("wheelR", {
    parent: aircraft,
    at: [-1.05, 0.59, 1.0],
    dir: [-1, 0, 0],
    role: "hinge",
  });
  const tailWheel = b.joint("tailWheel", {
    parent: aircraft,
    at: [0, 0.33, -2.72],
    dir: [1, 0, 0],
    role: "hinge",
  });

  function box(
    at: number[],
    size: number[],
    color: Finish,
    bone: Joint = aircraft,
    rotation?: number[],
  ) {
    return b.part(
      new THREE.BoxGeometry(size[0], size[1], size[2]),
      color,
      { at, bone, rotation },
    );
  }

  function ellipsoid(
    at: number[],
    size: number[],
    color: Finish,
    bone: Joint = aircraft,
    name?: string,
  ) {
    return b.part(new THREE.SphereGeometry(1, 10, 6), color, {
      at,
      bone,
      scale: size,
      name,
      flat: true,
    });
  }

  function pin(
    at: number[],
    radius: number,
    color: Finish = C.brass,
    bone: Joint = aircraft,
  ) {
    return b.part(new THREE.SphereGeometry(radius, 6, 4), color, {
      at,
      bone,
      flat: true,
    });
  }

  function cylinder(
    at: number[],
    radius: number,
    length: number,
    color: Finish,
    dir: number[],
    bone: Joint = aircraft,
    segments = 12,
  ) {
    return b.part(
      new THREE.CylinderGeometry(radius, radius, length, segments),
      color,
      { at, bone, dir, flat: true },
    );
  }

  function ring(
    at: number[],
    radius: number,
    tube: number,
    color: Finish,
    dir: number[],
    bone: Joint = aircraft,
    segments = 24,
  ) {
    return b.part(new THREE.TorusGeometry(radius, tube, 6, segments), color, {
      at,
      dir,
      axis: "z",
      bone,
      flat: true,
    });
  }

  function image(
    texture: THREE.Texture,
    at: number[],
    width: number,
    height: number,
    dir: number[],
    bone: Joint = aircraft,
    up: number[] = [0, 1, 0],
  ) {
    return b.part(new THREE.PlaneGeometry(width, height), "#ffffff", {
      at,
      bone,
      dir,
      up,
      axis: "z",
      texture,
    });
  }

  function drawing(content: string, viewBox = "0 0 256 256", size = 512) {
    return svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`,
      { size },
    );
  }

  // A coherent little air-circus identity, reused on wings, fin and field props.
  const roundel = drawing(`
    <circle cx="128" cy="128" r="119" fill="#303b43"/>
    <circle cx="128" cy="128" r="110" fill="#fff0c6"/>
    <circle cx="128" cy="128" r="92" fill="#328f91"/>
    <path d="M128 40 L151 100 L217 103 L166 143 L182 207
             L128 171 L74 207 L90 143 L39 103 L105 100 Z"
          fill="#fff0c6" stroke="#245b66" stroke-width="7"/>
    <circle cx="128" cy="128" r="22" fill="#c7473e"/>
    <path d="M124 115 L137 115 L137 141 L124 141 Z" fill="#fff0c6"/>
    <path d="M61 223 Q128 245 195 223" fill="none"
          stroke="#d69d42" stroke-width="5"/>
  `);

  const sideBrand = drawing(`
    <path d="M15 53 Q58 10 200 18 Q301 24 346 50
             Q301 103 177 104 Q63 102 15 53 Z"
          fill="#fff0c6" stroke="#8d2e35" stroke-width="5"/>
    <path d="M38 51 Q80 24 171 28 M189 94 Q280 91 325 62"
          fill="none" stroke="#d69d42" stroke-width="3"/>
    <text x="180" y="65" text-anchor="middle" font-family="Georgia,serif"
          font-weight="bold" font-style="italic" font-size="57"
          fill="#a6373c">BUMBLE</text>
    <text x="181" y="87" text-anchor="middle" font-family="sans-serif"
          font-weight="bold" font-size="15" letter-spacing="5"
          fill="#245b66">AIR CIRCUS</text>
    <path d="M21 55 L2 42 L7 71 Z M339 55 L357 40 L352 72 Z"
          fill="#fff0c6"/>
  `, "0 0 360 120");

  const number07 = drawing(`
    <rect x="6" y="6" width="168" height="128" rx="24"
          fill="#fff0c6" stroke="#8d2e35" stroke-width="8"/>
    <rect x="17" y="17" width="146" height="106" rx="16"
          fill="none" stroke="#d69d42" stroke-width="3"/>
    <text x="89" y="102" text-anchor="middle" font-family="Georgia,serif"
          font-weight="bold" font-size="107" fill="#245b66">07</text>
  `, "0 0 180 140");

  const registration = drawing(`
    <text x="250" y="68" text-anchor="middle" font-family="Georgia,serif"
          font-weight="bold" font-size="74" letter-spacing="8"
          fill="#8d2e35">BUMBLE</text>
    <path d="M36 89 H464" stroke="#8d2e35" stroke-width="5"/>
    <text x="250" y="115" text-anchor="middle" font-family="sans-serif"
          font-weight="bold" font-size="20" letter-spacing="8"
          fill="#245b66">THE FLYING MARVEL</text>
  `, "0 0 500 130");

  const patchTexture = drawing(`
    <rect x="5" y="5" width="150" height="102" rx="8" fill="#fff0c6"/>
    <rect x="14" y="14" width="132" height="84" rx="4"
          fill="none" stroke="#8d2e35" stroke-width="4" stroke-dasharray="7 6"/>
    <path d="M42 78 L78 32 L115 78 Z" fill="none"
          stroke="#d69d42" stroke-width="5"/>
    <path d="M79 43 L79 62 M79 71 L79 75"
          stroke="#8d2e35" stroke-width="6"/>
  `, "0 0 160 112", 256);

  const dashboardTexture = drawing(`
    <rect width="320" height="160" rx="30" fill="#4a3029"/>
    <path d="M10 146 V46 Q160 -20 310 46 V146 Z"
          fill="none" stroke="#c69250" stroke-width="5"/>
    ${[
      [72, 78, 42],
      [163, 69, 49],
      [254, 78, 34],
    ].map(([x, y, r], i) => {
      let ticks = "";
      for (let k = 0; k < 12; k++) {
        const a = (k * Math.PI * 2) / 12;
        ticks += `<path d="M${x + Math.sin(a) * (r - 6)} ${y - Math.cos(a) * (r - 6)}
                  L${x + Math.sin(a) * (r - 12)} ${y - Math.cos(a) * (r - 12)}"
                  stroke="#fff0c6" stroke-width="3"/>`;
      }
      return `
        <circle cx="${x}" cy="${y}" r="${r}" fill="#d3ad62"/>
        <circle cx="${x}" cy="${y}" r="${r - 4}" fill="#243b48"/>
        ${ticks}
        <path d="M${x} ${y} L${x + 16 - i * 9} ${y - r + 17}"
              stroke="#ef7353" stroke-width="4"/>
        <circle cx="${x}" cy="${y}" r="4" fill="#fff0c6"/>
      `;
    }).join("")}
    <text x="164" y="135" text-anchor="middle" font-family="serif"
          font-size="12" letter-spacing="3" fill="#fff0c6">ALT • AIR • OIL</text>
    <circle cx="24" cy="128" r="6" fill="#328f91"/>
    <circle cx="296" cy="128" r="6" fill="#c7473e"/>
  `, "0 0 320 160");

  const plaqueTexture = drawing(`
    <rect x="4" y="4" width="472" height="156" rx="12"
          fill="#243b48" stroke="#d3ad62" stroke-width="5"/>
    <path d="M24 26 H456 M24 138 H456" stroke="#d3ad62" stroke-width="2"/>
    <text x="240" y="77" text-anchor="middle" font-family="Georgia,serif"
          font-weight="bold" font-style="italic" font-size="58"
          fill="#fff0c6">Bumble</text>
    <text x="240" y="113" text-anchor="middle" font-family="sans-serif"
          font-size="19" letter-spacing="5" fill="#e5b95f">BARNSTORMER • No. 07</text>
    <path d="M27 70 L47 63 L67 70 L47 77 Z M413 70 L433 63 L453 70 L433 77 Z"
          fill="#d3ad62"/>
  `, "0 0 480 164");

  const fuelLabel = drawing(`
    <rect x="3" y="3" width="122" height="154" rx="8"
          fill="#fff0c6" stroke="#243b48" stroke-width="5"/>
    <path d="M64 21 L91 63 L64 86 L37 63 Z" fill="#c7473e"/>
    <path d="M64 36 L74 59 L61 72 L56 57 Z" fill="#edbd55"/>
    <text x="64" y="115" text-anchor="middle" font-family="sans-serif"
          font-size="22" font-weight="bold" fill="#243b48">AVIATION</text>
    <text x="64" y="139" text-anchor="middle" font-family="serif"
          font-size="22" fill="#8d2e35">SPIRIT</text>
  `, "0 0 128 160", 256);

  // Small, shallow airfield presentation base. The tyres contact its top.
  b.part(new THREE.CylinderGeometry(1, 1, 0.14, 48), groundPaint, {
    at: [0, 0.07, -0.38],
    scale: [4.23, 1, 3.47],
    bone: scene,
    name: "oval grass airfield",
    flat: true,
  });
  b.part(new THREE.CylinderGeometry(1, 1, 0.045, 48), C.tealDark, {
    at: [0, 0.035, -0.38],
    scale: [4.245, 1, 3.485],
    bone: scene,
    flat: true,
  });
  const baseTrim = Array.from({ length: 49 }, (_, i) => {
    const a = (i * Math.PI * 2) / 48;
    return [4.237 * Math.cos(a), 0.069, -0.38 + 3.475 * Math.sin(a)];
  });
  b.sweep(polyline(baseTrim.slice(0, -1), { closed: true }), 0.013, {
    color: C.brass,
    bone: scene,
    sides: 6,
  });

  // Fuselage shell. Leaving the upper four panels out here makes a real cockpit,
  // not a black spot stuck on a solid body.
  const stations = [
    { z: -3.13, y: 1.10, rx: 0.075, ry: 0.09 },
    { z: -2.82, y: 1.13, rx: 0.14, ry: 0.15 },
    { z: -2.28, y: 1.22, rx: 0.25, ry: 0.26 },
    { z: -1.42, y: 1.34, rx: 0.37, ry: 0.37 },
    { z: -1.10, y: 1.39, rx: 0.43, ry: 0.42 },
    { z: -0.72, y: 1.42, rx: 0.45, ry: 0.43 },
    { z: -0.20, y: 1.46, rx: 0.46, ry: 0.44 },
    { z: 0.18, y: 1.47, rx: 0.47, ry: 0.45 },
    { z: 0.80, y: 1.49, rx: 0.48, ry: 0.47 },
    { z: 1.35, y: 1.50, rx: 0.45, ry: 0.44 },
    { z: 1.70, y: 1.50, rx: 0.42, ry: 0.41 },
  ];
  const hullPositions: number[] = [];
  const hullUV: number[] = [];
  const hullIndices: number[] = [];
  const sides = 12;
  for (let j = 0; j < stations.length; j++) {
    const st = stations[j];
    for (let k = 0; k <= sides; k++) {
      const a = (k / sides) * Math.PI * 2;
      hullPositions.push(
        Math.sin(a) * st.rx,
        st.y + Math.cos(a) * st.ry,
        st.z,
      );
      hullUV.push(k / sides, (st.z + 3.13) / 4.83);
    }
  }
  for (let j = 0; j < stations.length - 1; j++) {
    for (let k = 0; k < sides; k++) {
      const opening =
        stations[j].z >= -1.101 &&
        stations[j + 1].z <= -0.199 &&
        (k < 2 || k >= 10);
      if (opening) continue;
      const a = j * (sides + 1) + k;
      const d = a + sides + 1;
      hullIndices.push(a, d, a + 1, a + 1, d, d + 1);
    }
  }
  const hullGeometry = new THREE.BufferGeometry();
  hullGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(hullPositions, 3),
  );
  hullGeometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(hullUV, 2),
  );
  hullGeometry.setIndex(hullIndices);
  hullGeometry.computeVertexNormals();
  const hull = b.part(hullGeometry, fuselagePaint, {
    at: [0, 0, 0],
    bone: aircraft,
    flat: true,
    name: "open cockpit fuselage shell",
  });
  const hullSurface = b.surface(hull);

  // Long cream cheat-lines follow the actual hull surface.
  for (const s of [-1, 1]) {
    const rough = [
      [s * 0.15, 1.10, -2.92],
      [s * 0.30, 1.20, -2.1],
      [s * 0.47, 1.30, -1.1],
      [s * 0.52, 1.35, 0.1],
      [s * 0.49, 1.40, 1.45],
    ];
    b.sweep(hullSurface.drape(catmull(rough), { lift: 0.006 }), 0.012, {
      color: C.cream,
      bone: aircraft,
      sides: 6,
    });
    b.decal(hull, sideBrand, {
      at: [s * 0.47, 1.47, 0.45],
      dir: [s, 0, 0],
      up: [0, 1, 0],
      size: [1.06, 0.35],
      segments: 12,
      lift: 0.006,
      bone: aircraft,
      name: `air circus branding ${s > 0 ? "L" : "R"}`,
    });
    b.decal(hull, roundel, {
      at: [s * 0.245, 1.26, -2.10],
      dir: [s, 0, 0],
      size: [0.36, 0.36],
      segments: 8,
      lift: 0.005,
      bone: aircraft,
    });
  }

  // Nose bonnet and panel edges.
  b.lathe(
    [
      [0.39, 0],
      [0.47, 0.03],
      [0.52, 0.17],
      [0.53, 0.29],
      [0.47, 0.31],
      [0.45, 0.16],
      [0.38, 0.03],
    ],
    {
      at: [0, 1.5, 1.49],
      axis: [0, 0, 1],
      color: C.teal,
      bone: aircraft,
      segments: 16,
      name: "turquoise engine bonnet",
    },
  );
  ring([0, 1.5, 1.54], 0.463, 0.018, C.cream, [0, 0, 1]);
  ring([0, 1.5, 1.78], 0.515, 0.030, C.brass, [0, 0, 1]);
  b.ring(frame([0, 1.5, 1.72], [0, 0, 1]), {
    count: 16,
    radius: 0.516,
  }, (at) => {
    b.part(new THREE.SphereGeometry(0.013, 6, 4), C.brass, {
      at,
      bone: aircraft,
      flat: true,
    });
  });

  // The exposed radial engine is the hero mechanical detail.
  cylinder([0, 1.5, 1.88], 0.247, 0.21, C.navy, [0, 0, 1]);
  cylinder([0, 1.5, 2.008], 0.192, 0.065, steel, [0, 0, 1]);
  ring([0, 1.5, 2.047], 0.178, 0.016, C.brass, [0, 0, 1]);
  for (let i = 0; i < 9; i++) {
    const a = (i * Math.PI * 2) / 9;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const radial = [dx, dy, 0];
    const tangent = [dy, -dx, 0];
    const atR = (r: number, z = 1.9) => [
      dx * r,
      1.5 + dy * r,
      z,
    ];

    b.rod(atR(0.19), atR(0.46), 0.071, {
      color: C.ink,
      bone: aircraft,
      sides: 8,
    });
    for (let f = 0; f < 5; f++) {
      cylinder(
        atR(0.265 + f * 0.039),
        0.090 - f * 0.002,
        0.017,
        f % 2 === 0 ? steel : C.silverLight,
        radial,
        aircraft,
        8,
      );
    }
    cylinder(atR(0.48), 0.069, 0.061, C.silver, radial, aircraft, 8);
    box(
      [dx * 0.496, 1.5 + dy * 0.496, 1.953],
      [0.056, 0.042, 0.027],
      C.tealDark,
    );
    const t = 0.032;
    b.rod(
      [dx * 0.195 + tangent[0] * t, 1.5 + dy * 0.195 + tangent[1] * t, 2.00],
      [dx * 0.46 + tangent[0] * t, 1.5 + dy * 0.46 + tangent[1] * t, 2.00],
      0.009,
      { color: C.brass, bone: aircraft, sides: 6 },
    );
    pin([dx * 0.143, 1.5 + dy * 0.143, 2.054], 0.018, C.ink);
    pin([dx * 0.143, 1.5 + dy * 0.143, 2.067], 0.010, C.brass);
    b.sweep(
      catmull([
        atR(0.46, 1.83),
        [dx * 0.49, 1.5 + dy * 0.49, 1.73],
        [dx * 0.36, 1.5 + dy * 0.36, 1.64],
      ]),
      0.025,
      { color: "#76503f", bone: aircraft, sides: 6 },
    );
  }

  // Exhausts turn down beside the bonnet; dark mouths and copper bands.
  for (const s of [-1, 1]) {
    const exhaust = b.sweep(
      catmull([
        [s * 0.36, 1.20, 1.69],
        [s * 0.51, 1.16, 1.47],
        [s * 0.53, 1.04, 1.20],
        [s * 0.55, 0.98, 1.06],
      ]),
      [0.052, 0.048],
      {
        color: "#77533f",
        bone: aircraft,
        sides: 8,
        caps: "flat",
      },
    );
    cylinder([s * 0.55, 0.977, 1.054], 0.039, 0.012, C.ink, [0, -0.3, -1]);
    const collarPoint = exhaust.curve().at(0.32);
    const collarAxis = exhaust.curve().tangentAt(0.32);
    b.part(new THREE.CylinderGeometry(0.059, 0.059, 0.026, 8), C.brass, {
      at: collarPoint,
      dir: collarAxis,
      bone: aircraft,
      flat: true,
      name: `exhaust retaining collar ${s}`,
    });
  }

  // Two hand-laminated wooden propeller blades, poised rather than blurred.
  cylinder([0, 1.5, 2.14], 0.080, 0.24, C.silver, [0, 0, 1], propeller);
  const bladeAngle = 32 * Math.PI / 180;
  const propWood = paint((p, n) => {
    const cross = p.x * Math.cos(bladeAngle)
      - (p.y - 1.5) * Math.sin(bladeAngle);
    const along = Math.abs(p.x * Math.sin(bladeAngle)
      + (p.y - 1.5) * Math.cos(bladeAngle));
    const layer = Math.floor((cross + 0.20) / 0.037);
    const base = layer % 2 === 0 ? "#c28a4f" : "#e3b577";
    const grainLine = Math.sin(cross * 710 + Math.sin(along * 8) * 0.9);
    const shade = mix(base, "#855333", n.z < 0 ? 0.24 : 0.04);
    return grainLine > 0.95 ? mix(shade, "#89582f", 0.18) : shade;
  });
  for (const s of [-1, 1]) {
    const radial = [s * Math.sin(bladeAngle), s * Math.cos(bladeAngle), 0];
    const across = [Math.cos(bladeAngle), -Math.sin(bladeAngle), 0];
    b.extrude(
      [
        [-0.059, 0.09],
        [-0.108, 0.33],
        [-0.150, 0.74],
        [-0.115, 1.13],
        [-0.012, 1.26],
        [0.092, 1.19],
        [0.125, 0.95],
        [0.089, 0.53],
        [0.045, 0.12],
      ],
      {
        at: [0, 1.5, 2.225],
        x: across,
        y: radial,
        thickness: 0.047,
        bevel: 0.008,
        color: propWood,
        bone: propeller,
        name: `wooden propeller blade ${s}`,
      },
    );
    b.extrude(
      [
        [-0.118, 1.045],
        [-0.115, 1.13],
        [-0.012, 1.26],
        [0.092, 1.19],
        [0.12, 1.045],
      ],
      {
        at: [0, 1.5, 2.227],
        x: across,
        y: radial,
        thickness: 0.052,
        color: C.red,
        bone: propeller,
      },
    );
    b.extrude(
      [
        [-0.132, 0.992],
        [-0.125, 1.040],
        [0.120, 1.040],
        [0.123, 0.992],
      ],
      {
        at: [0, 1.5, 2.23],
        x: across,
        y: radial,
        thickness: 0.054,
        color: C.cream,
        bone: propeller,
      },
    );
  }
  cylinder([0, 1.5, 2.266], 0.15, 0.075, C.brass, [0, 0, 1], propeller);
  b.part(new THREE.ConeGeometry(0.129, 0.225, 12), C.teal, {
    at: [0, 1.5, 2.405],
    dir: [0, 0, 1],
    bone: propeller,
    flat: true,
    name: "propeller spinner",
  });
  b.ring(frame([0, 1.5, 2.31], [0, 0, 1]), {
    count: 6,
    radius: 0.116,
  }, (at) => {
    b.part(new THREE.SphereGeometry(0.014, 6, 4), C.cream, {
      at,
      bone: propeller,
    });
  });

  // Golden fabric wings. Thin, tapered elliptical sections keep the silhouette
  // recognisably primitive-built while looking like real little aerofoils.
  const upperWing = b.loft(
    [
      { at: [-3.62, 2.60, 0.65], w: 0.75, h: 0.064 },
      { at: [-3.36, 2.60, 0.60], w: 1.12, h: 0.102 },
      { at: [-2.8, 2.60, 0.56], w: 1.37, h: 0.133 },
      { at: [0, 2.60, 0.56], w: 1.39, h: 0.145 },
      { at: [2.8, 2.60, 0.56], w: 1.37, h: 0.133 },
      { at: [3.36, 2.60, 0.60], w: 1.12, h: 0.102 },
      { at: [3.62, 2.60, 0.65], w: 0.75, h: 0.064 },
    ],
    {
      color: fabric,
      bone: aircraft,
      sides: 8,
      caps: "flat",
      smooth: false,
      name: "upper fabric wing",
    },
  );
  const lowerWing = b.loft(
    [
      { at: [-3.35, 1.13, 0.35], w: 0.71, h: 0.057 },
      { at: [-3.12, 1.13, 0.32], w: 1.06, h: 0.093 },
      { at: [-2.70, 1.13, 0.29], w: 1.30, h: 0.117 },
      { at: [0, 1.13, 0.29], w: 1.33, h: 0.128 },
      { at: [2.70, 1.13, 0.29], w: 1.30, h: 0.117 },
      { at: [3.12, 1.13, 0.32], w: 1.06, h: 0.093 },
      { at: [3.35, 1.13, 0.35], w: 0.71, h: 0.057 },
    ],
    {
      color: fabric,
      bone: aircraft,
      sides: 8,
      caps: "flat",
      smooth: false,
      name: "lower fabric wing",
    },
  );

  for (const wing of [
    { part: upperWing, y: 2.60, z: 0.56, chord: 1.39, span: 3.62 },
    { part: lowerWing, y: 1.13, z: 0.29, chord: 1.33, span: 3.35 },
  ]) {
    const skin = b.surface(wing.part);
    for (let i = -10; i <= 10; i++) {
      if (Math.abs(i) < 2 && wing.y < 2) continue;
      const x = i * 0.29;
      const seam = skin.drape(
        polyline([
          [x, wing.y + 0.12, wing.z - wing.chord * 0.43],
          [x, wing.y + 0.12, wing.z - wing.chord * 0.18],
          [x, wing.y + 0.12, wing.z + wing.chord * 0.18],
          [x, wing.y + 0.12, wing.z + wing.chord * 0.43],
        ]),
        { lift: 0.003 },
      );
      b.sweep(seam, 0.0045, {
        color: "#f6d787",
        bone: aircraft,
        sides: 4,
        caps: "flat",
      });
    }
    // Stitched trailing-edge reinforcement, plus separate aileron hinge lines.
    for (const s of [-1, 1]) {
      const trailing = skin.drape(
        polyline([
          [s * 0.65, wing.y, wing.z - wing.chord * 0.49],
          [s * 2.70, wing.y, wing.z - wing.chord * 0.49],
          [s * (wing.span - 0.17), wing.y, wing.z - 0.37],
        ]),
        { lift: 0.006 },
      );
      b.sweep(trailing, 0.011, {
        color: C.redDark,
        bone: aircraft,
        sides: 6,
      });
      const hinge = skin.drape(
        polyline([
          [s * 1.87, wing.y + 0.10, wing.z - 0.37],
          [s * 2.66, wing.y + 0.10, wing.z - 0.37],
          [s * 3.08, wing.y + 0.10, wing.z - 0.30],
        ]),
        { lift: 0.004 },
      );
      b.sweep(hinge, 0.006, {
        color: "#ae803b",
        bone: aircraft,
        sides: 4,
      });
      for (const x of [1.99, 2.45, 2.88]) {
        const hit = skin.nearest([s * x, wing.y + 0.15, wing.z - 0.38]);
        b.stick(new THREE.BoxGeometry(0.068, 0.018, 0.11), C.brass, hit, {
          embed: 0.25,
          bone: aircraft,
        });
      }
    }
  }

  b.decal(upperWing, registration, {
    at: [0, 2.70, 0.55],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [2.65, 0.69],
    lift: 0.004,
    segments: 14,
    bone: aircraft,
  });
  b.decal(upperWing, roundel, {
    at: [2.43, 2.70, 0.59],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.73, 0.73],
    lift: 0.004,
    segments: 8,
    bone: aircraft,
  });
  b.decal(upperWing, number07, {
    at: [-2.37, 2.70, 0.59],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.77, 0.59],
    lift: 0.004,
    segments: 8,
    bone: aircraft,
  });
  for (const s of [-1, 1]) {
    b.decal(lowerWing, roundel, {
      at: [s * 2.68, 1.23, 0.32],
      dir: [0, 1, 0],
      up: [0, 0, -1],
      size: [0.64, 0.64],
      lift: 0.004,
      bone: aircraft,
    });
  }
  for (const s of [-1, 1]) {
    b.decal(lowerWing, roundel, {
      at: [s * 2.42, 1.02, 0.32],
      dir: [0, -1, 0],
      up: [0, 0, 1],
      size: [0.65, 0.65],
      lift: 0.004,
      segments: 8,
      bone: aircraft,
      name: `underwing circus insignia ${s}`,
    });
  }

  b.decal(upperWing, patchTexture, {
    at: [1.13, 2.70, 0.15],
    dir: [0, 1, 0],
    up: [0, 0, -1],
    size: [0.31, 0.22],
    lift: 0.006,
    bone: aircraft,
  });

  // Interplane N-struts, cabanes, and visibly contrasting bracing wires.
  for (const s of [-1, 1]) {
    const lowerFront = [s * 2.36, 1.17, 0.79];
    const lowerRear = [s * 2.36, 1.17, -0.16];
    const upperFront = [s * 2.45, 2.55, 1.04];
    const upperRear = [s * 2.45, 2.55, 0.02];
    for (const [a, z] of [
      [lowerFront, upperFront],
      [lowerRear, upperRear],
      [lowerFront, upperRear],
    ]) {
      b.frustumBox(a, z, [0.072, 0.058], [0.063, 0.050], {
        color: C.tealDark,
        bone: aircraft,
      });
    }
    for (const point of [lowerFront, lowerRear, upperFront, upperRear]) {
      ellipsoid(point, [0.073, 0.034, 0.076], C.brass);
      pin([point[0], point[1] + 0.025, point[2]], 0.021, C.cream);
    }

    for (const z of [0.07, 0.96]) {
      b.frustumBox(
        [s * 0.36, 1.78, z - 0.08],
        [s * 0.76, 2.55, z + 0.08],
        [0.055, 0.048],
        [0.048, 0.043],
        { color: C.tealDark, bone: aircraft },
      );
      pin([s * 0.76, 2.55, z + 0.08], 0.042, C.brass);
    }

    const wireRoutes = [
      [[s * 0.51, 1.16, 0.77], upperFront],
      [[s * 0.51, 1.16, -0.10], upperRear],
      [[s * 0.76, 2.55, 1.02], lowerFront],
      [[s * 0.76, 2.55, 0.02], lowerRear],
    ];
    for (const route of wireRoutes) {
      b.rod(route[0], route[1], 0.009, {
        color: C.silverLight,
        bone: aircraft,
        sides: 4,
      });
      const a = new THREE.Vector3(...route[0]);
      const z = new THREE.Vector3(...route[1]);
      b.rod(a.clone().lerp(z, 0.14), a.clone().lerp(z, 0.23), 0.017, {
        color: C.brass,
        bone: aircraft,
        sides: 6,
      });
    }
  }

  // True leather cockpit coaming, inset floor, seat, harness and instruments.
  const cockpitRim = polyline([
    [-0.372, 1.600, -1.10],
    [-0.390, 1.635, -0.72],
    [-0.398, 1.680, -0.20],
    [-0.230, 1.841, -0.20],
    [0, 1.900, -0.20],
    [0.230, 1.841, -0.20],
    [0.398, 1.680, -0.20],
    [0.390, 1.635, -0.72],
    [0.372, 1.600, -1.10],
    [0.215, 1.754, -1.10],
    [0, 1.810, -1.10],
    [-0.215, 1.754, -1.10],
  ], { closed: true });
  b.sweep(cockpitRim, 0.032, {
    color: leather,
    bone: aircraft,
    sides: 8,
    name: "padded cockpit coaming",
  });
  box([0, 1.17, -0.65], [0.54, 0.07, 0.78], C.leatherDark);
  box([0, 1.32, -0.80], [0.36, 0.15, 0.35], leather);
  box([0, 1.56, -1.00], [0.37, 0.46, 0.085], leather, aircraft, [-8, 0, 0]);
  box([0, 1.80, -1.038], [0.26, 0.12, 0.10], C.leatherDark);

  // The absent aviator's cap and goggles rest on the seat back.
  ellipsoid(
    [0, 1.859, -1.018],
    [0.157, 0.083, 0.107],
    leather,
    aircraft,
    "resting leather flying cap",
  );
  for (const s of [-1, 1]) {
    b.slab([
      [s * 0.124, 1.871, -1.005],
      [s * 0.155, 1.829, -1.013],
      [s * 0.143, 1.747, -0.999],
      [s * 0.103, 1.769, -0.981],
    ], {
      thickness: 0.016,
      color: leather,
      bone: aircraft,
      name: `flying cap ear flap ${s}`,
    });
    cylinder(
      [s * 0.074, 1.857, -0.919],
      0.057,
      0.022,
      C.leatherDark,
      [0, 0, 1],
      aircraft,
      12,
    );
    cylinder(
      [s * 0.074, 1.857, -0.903],
      0.044,
      0.010,
      "#a9d8d3",
      [0, 0, 1],
      aircraft,
      12,
    );
    ring(
      [s * 0.074, 1.857, -0.894],
      0.050,
      0.008,
      C.brass,
      [0, 0, 1],
      aircraft,
      16,
    );
    b.rod(
      [s * 0.093, 1.875, -0.887],
      [s * 0.064, 1.878, -0.887],
      0.004,
      { color: "#e9f5db", bone: aircraft, sides: 4 },
    );
    pin([s * 0.142, 1.788, -0.983], 0.011, C.brass);
  }
  b.rod([-0.025, 1.864, -0.903], [0.025, 1.864, -0.903], 0.009, {
    color: C.brass,
    bone: aircraft,
    sides: 6,
  });
  b.sweep(catmull([
    [-0.13, 1.854, -0.926],
    [-0.154, 1.852, -1.017],
    [0, 1.873, -1.124],
    [0.154, 1.852, -1.017],
    [0.13, 1.854, -0.926],
  ]), 0.012, {
    color: C.leatherDark,
    bone: aircraft,
    sides: 6,
    name: "goggle leather strap",
  });

  for (const s of [-1, 1]) {
    b.sweep(
      polyline([
        [s * 0.095, 1.76, -0.948],
        [s * 0.106, 1.56, -0.915],
        [s * 0.065, 1.40, -0.74],
        [s * 0.15, 1.41, -0.64],
      ]),
      () => [0.024, 0.008],
      { color: "#d9c28b", bone: aircraft, section: "box", caps: "flat" },
    );
  }
  box([0, 1.426, -0.744], [0.063, 0.022, 0.060], C.brass);
  box([0, 1.44, -0.744], [0.028, 0.012, 0.027], C.ink);
  b.rod([0, 1.22, -0.48], [0, 1.58, -0.55], 0.020, {
    color: C.navy,
    bone: aircraft,
    sides: 8,
  });
  ellipsoid([0, 1.59, -0.55], [0.045, 0.037, 0.052], C.leatherDark);
  box([0, 1.18, -0.26], [0.33, 0.032, 0.052], steel);
  for (const s of [-1, 1])
    box([s * 0.13, 1.23, -0.28], [0.090, 0.09, 0.025], C.ink);

  b.extrude(
    [
      [-0.32, 0],
      [0.32, 0],
      [0.29, 0.18],
      [0.16, 0.25],
      [-0.16, 0.25],
      [-0.29, 0.18],
    ],
    {
      at: [0, 1.50, -0.17],
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.047,
      color: C.leatherDark,
      bone: aircraft,
      name: "instrument panel",
    },
  );
  image(dashboardTexture, [0, 1.626, -0.198], 0.59, 0.295, [0, 0, -1]);
  for (const s of [-1, 1])
    pin([s * 0.27, 1.544, -0.205], 0.014, C.brass);

  // A little three-pane windscreen, translucent in spirit but deliberately
  // opaque pastel glass, so the primitive-puppet style survives export.
  const panes = [
    [
      [-0.24, 1.84, -0.19],
      [0.24, 1.84, -0.19],
      [0.18, 2.105, -0.12],
      [-0.18, 2.105, -0.12],
    ],
    [
      [0.24, 1.84, -0.19],
      [0.38, 1.69, -0.34],
      [0.30, 1.95, -0.27],
      [0.18, 2.105, -0.12],
    ],
    [
      [-0.38, 1.69, -0.34],
      [-0.24, 1.84, -0.19],
      [-0.18, 2.105, -0.12],
      [-0.30, 1.95, -0.27],
    ],
  ];
  for (const pane of panes) {
    b.slab(pane, {
      color: "#a9d8d3",
      thickness: 0.012,
      bone: aircraft,
      name: "windscreen glass",
    });
    b.sweep(polyline(pane, { closed: true }), 0.012, {
      color: C.brass,
      bone: aircraft,
      sides: 6,
    });
  }
  b.rod([-0.16, 2.045, -0.135], [0.10, 2.045, -0.135], 0.009, {
    color: "#e9f5db",
    bone: aircraft,
    sides: 4,
  });

  // Tailplane and the bold fan-shaped sunburst rudder.
  b.loft(
    [
      { at: [-1.19, 1.13, -2.66], w: 0.47, h: 0.045 },
      { at: [-0.98, 1.13, -2.72], w: 0.72, h: 0.070 },
      { at: [0, 1.13, -2.74], w: 0.83, h: 0.084 },
      { at: [0.98, 1.13, -2.72], w: 0.72, h: 0.070 },
      { at: [1.19, 1.13, -2.66], w: 0.47, h: 0.045 },
    ],
    {
      color: C.teal,
      bone: aircraft,
      sides: 8,
      caps: "flat",
      smooth: false,
      name: "horizontal tailplane",
    },
  );
  for (const s of [-1, 1]) {
    b.extrude(
      [
        [0.13, 0],
        [0.93, 0],
        [1.11, 0.12],
        [0.98, 0.25],
        [0.13, 0.25],
      ],
      {
        at: [0, 1.137, -2.97],
        x: [s, 0, 0],
        y: [0, 0, -1],
        thickness: 0.04,
        color: C.cream,
        bone: elevator,
      },
    );
    b.rod([s * 0.17, 1.162, -2.97], [s * 1.00, 1.162, -2.97], 0.008, {
      color: C.tealDark,
      bone: elevator,
      sides: 4,
    });
    b.rod([s * 0.18, 1.51, -2.49], [s * 0.91, 1.17, -2.72], 0.011, {
      color: C.silverLight,
      bone: aircraft,
      sides: 4,
    });
  }

  const sunburst = paint((_p, n, uv) => {
    if (Math.abs(n.x) < 0.55) return C.redDark;
    const angle = Math.atan2(uv[1] - 0.12, uv[0] + 0.37);
    return Math.floor((angle + 4) * 6.5) % 2 === 0 ? C.red : C.cream;
  });
  const fin = b.extrude(
    [
      [-0.41, 0.015],
      [-0.42, 0.34],
      [-0.29, 0.78],
      [-0.08, 1.08],
      [0.16, 1.17],
      [0.39, 1.10],
      [0.51, 0.86],
      [0.53, 0.20],
      [0.40, -0.035],
    ],
    {
      at: [0, 1.14, -2.77],
      x: [0, 0, -1],
      y: [0, 1, 0],
      thickness: 0.075,
      bevel: 0.009,
      color: sunburst,
      bone: rudder,
      name: "sunburst vertical tail",
    },
  );

  for (const s of [-1, 1]) {
    b.decal(fin, number07, {
      at: [s * 0.05, 1.86, -2.92],
      dir: [s, 0, 0],
      size: [0.43, 0.33],
      lift: 0.004,
      bone: rudder,
      segments: 6,
    });
    b.rod([s * 0.041, 1.23, -3.075], [s * 0.041, 2.17, -3.075], 0.010, {
      color: C.redDark,
      bone: rudder,
      sides: 4,
    });
    for (const y of [1.38, 1.74, 2.06])
      cylinder([s * 0.047, y, -3.075], 0.020, 0.06, C.brass, [0, 1, 0], rudder, 6);
  }
  b.sweep(
    polyline([
      [0, 1.46, -2.38],
      [0, 1.92, -2.47],
      [0, 2.22, -2.69],
      [0, 2.31, -2.93],
      [0, 2.24, -3.16],
      [0, 2.00, -3.28],
      [0, 1.34, -3.30],
      [0, 1.105, -3.17],
    ]),
    0.013,
    { color: C.gold, bone: rudder, sides: 6 },
  );

  // Rudder and elevator control runs along the rear fuselage.
  for (const s of [-1, 1]) {
    b.rod([s * 0.34, 1.39, -1.18], [s * 0.085, 1.31, -3.02], 0.007, {
      color: C.silver,
      bone: aircraft,
      sides: 4,
    });
    b.slab([
      [s * 0.035, 1.29, -3.00],
      [s * 0.15, 1.30, -3.01],
      [s * 0.04, 1.41, -3.01],
    ], { thickness: 0.018, color: C.brass, bone: rudder });
  }

  // Wide-track, delightfully chunky vintage undercarriage.
  b.rod([-1.12, 0.59, 1.0], [1.12, 0.59, 1.0], 0.055, {
    color: C.navy,
    bone: aircraft,
    sides: 8,
  });
  for (const s of [-1, 1]) {
    for (const z of [-0.13, 1.22]) {
      b.frustumBox(
        [s * 0.34, 1.16, z],
        [s * 0.86, 0.59, 1.0],
        [0.080, 0.068],
        [0.071, 0.062],
        { color: C.tealDark, bone: aircraft },
      );
    }
    const wheel = s > 0 ? wheelL : wheelR;
    const x = s * 1.05;
    cylinder([x, 0.59, 1.0], 0.45, 0.215, C.rubber, [s, 0, 0], wheel, 20);
    ring([x + s * 0.093, 0.59, 1.0], 0.355, 0.057, "#424448", [s, 0, 0], wheel);
    cylinder([x + s * 0.117, 0.59, 1.0], 0.274, 0.031, C.cream, [s, 0, 0], wheel, 16);
    ring([x + s * 0.140, 0.59, 1.0], 0.245, 0.014, C.brass, [s, 0, 0], wheel);
    cylinder([x + s * 0.145, 0.59, 1.0], 0.153, 0.031, C.teal, [s, 0, 0], wheel, 12);
    cylinder([x + s * 0.172, 0.59, 1.0], 0.069, 0.056, C.brass, [s, 0, 0], wheel, 8);

    b.ring(frame([x + s * 0.169, 0.59, 1.0], [s, 0, 0]), {
      count: 8,
      radius: 0.203,
    }, (at) => {
      b.part(new THREE.SphereGeometry(0.017, 6, 4), C.red, {
        at,
        bone: wheel,
      });
    });
    // Pale chalk witness mark, rather than excessive tread geometry.
    box([x, 0.996, 1.10], [0.217, 0.028, 0.037], "#b9b8a7", wheel, [14, 0, 0]);
    cylinder([s * 0.85, 0.64, 1.0], 0.093, 0.12, C.brass, [s, 0, 0]);

    // Bundled elastic suspension cord.
    for (let k = 0; k < 4; k++) {
      ring([s * (0.76 + k * 0.035), 0.61, 1.0], 0.075, 0.011,
        "#dfc899", [s, 0, 0], aircraft, 12);
    }
  }

  b.sweep(
    catmull([
      [0, 1.00, -2.64],
      [0, 0.72, -2.77],
      [0, 0.49, -2.77],
      [0, 0.34, -2.72],
    ]),
    [0.032, 0.026],
    { color: C.tealDark, bone: aircraft, sides: 6 },
  );
  cylinder([0, 0.33, -2.72], 0.19, 0.105, C.rubber, [1, 0, 0], tailWheel, 12);
  for (const s of [-1, 1])
    cylinder([s * 0.058, 0.33, -2.72], 0.086, 0.017, C.brass, [s, 0, 0], tailWheel, 8);

  // A tiny side access hatch with a latch and visible hinge fittings.
  const hatchHit = hullSurface.nearest([0.43, 1.46, -0.72]);
  b.stick(new THREE.BoxGeometry(0.27, 0.025, 0.24), C.redDark, hatchHit, {
    bone: aircraft,
    embed: 0.4,
  });
  b.stick(new THREE.BoxGeometry(0.23, 0.031, 0.20), C.coral, hatchHit, {
    bone: aircraft,
    embed: 0.15,
  });
  for (const z of [-0.80, -0.63])
    pin([0.459, 1.40, z], 0.014, C.brass);
  cylinder([0.472, 1.49, -0.70], 0.018, 0.016, C.brass, [1, 0, 0]);
  b.rod([0.485, 1.49, -0.70], [0.485, 1.44, -0.70], 0.008, {
    color: C.ink,
    bone: aircraft,
    sides: 4,
  });

  // The restrained airfield vignette: a short windsock, two straw bales,
  // fuel tin, wheel chocks, and tufts outside the aircraft's silhouette.
  const windsockX = -3.41;
  const windsockZ = -1.80;
  cylinder([windsockX, 0.19, windsockZ], 0.19, 0.10, C.tealDark, [0, 1, 0], scene, 10);
  b.rod([windsockX, 0.20, windsockZ], [windsockX, 2.02, windsockZ], 0.025, {
    color: C.brass,
    bone: scene,
    sides: 8,
  });
  pin([windsockX, 2.05, windsockZ], 0.061, C.red, scene);
  b.rod([windsockX, 1.97, windsockZ], [windsockX + 0.20, 1.97, windsockZ], 0.016, {
    color: C.navy,
    bone: scene,
    sides: 6,
  });
  const sockPath = catmull([
    [windsockX + 0.20, 1.97, windsockZ],
    [windsockX + 0.46, 1.97, windsockZ - 0.04],
    [windsockX + 0.73, 1.88, windsockZ - 0.10],
    [windsockX + 0.99, 1.73, windsockZ - 0.12],
  ]);
  b.sweep(sockPath, [0.14, 0.045], {
    bone: scene,
    sides: 8,
    caps: "none",
    bands: [
      [0.20, C.cream],
      [0.40, C.red],
      [0.60, C.cream],
      [0.80, C.red],
      [1.00, C.cream],
    ],
    name: "little striped windsock",
  });
  ring([windsockX + 0.20, 1.97, windsockZ], 0.14, 0.015,
    C.brass, [1, 0, -0.15], scene, 16);
  cylinder([windsockX + 0.204, 1.97, windsockZ], 0.116, 0.012,
    C.redDark, [1, 0, -0.15], scene, 12);

  function hayBale(x: number, z: number, width: number) {
    box([x, 0.35, z], [width, 0.42, 0.48], strawPaint, scene);
    for (const s of [-1, 1]) {
      const xx = x + s * width * 0.28;
      b.sweep(polyline([
        [xx, 0.17, z - 0.247],
        [xx, 0.565, z - 0.247],
        [xx, 0.565, z + 0.247],
        [xx, 0.17, z + 0.247],
      ]), 0.012, { color: "#746c47", bone: scene, sides: 4 });
    }
    for (let i = 0; i < 4; i++) {
      const xx = x - width * 0.37 + i * width * 0.22;
      b.rod([xx, 0.567, z - 0.16], [xx + 0.08, 0.567, z + 0.15], 0.009, {
        color: "#ead29a",
        bone: scene,
        sides: 4,
      });
    }
  }
  hayBale(2.64, -2.24, 0.70);
  hayBale(3.28, -1.77, 0.58);

  box([2.29, 0.43, -1.78], [0.28, 0.58, 0.23], C.teal, scene);
  box([2.29, 0.72, -1.78], [0.25, 0.055, 0.23], C.tealDark, scene);
  cylinder([2.36, 0.771, -1.78], 0.035, 0.05, C.brass, [0, 1, 0], scene, 8);
  b.sweep(polyline([
    [2.20, 0.73, -1.78],
    [2.20, 0.825, -1.78],
    [2.31, 0.825, -1.78],
    [2.31, 0.73, -1.78],
  ]), 0.014, { color: C.tealDark, bone: scene, sides: 6 });
  image(fuelLabel, [2.29, 0.44, -1.660], 0.225, 0.28, [0, 0, 1], scene);

  for (const s of [-1, 1]) {
    b.extrude(
      [[-0.17, 0], [0.17, 0], [0.09, 0.13], [-0.09, 0.13]],
      {
        at: [s * 1.05, 0.14, 1.44],
        x: [0, 0, 1],
        y: [0, 1, 0],
        thickness: 0.27,
        color: wood,
        bone: scene,
      },
    );
  }
  b.sweep(catmull([
    [-1.07, 0.19, 1.57],
    [-0.65, 0.154, 1.74],
    [0.10, 0.154, 1.70],
    [0.68, 0.154, 1.80],
    [1.08, 0.19, 1.56],
  ]), 0.012, { color: "#c9b381", bone: scene, sides: 6 });

  // Painted chalk dashes hint at a grass runway without competing with the wings.
  for (const z of [2.05, 2.58, -1.86, -2.42, -2.95]) {
    box([0.63, 0.143, z], [0.075, 0.006, 0.25], "#d7d2aa", scene);
    box([-0.63, 0.143, z], [0.075, 0.006, 0.25], "#d7d2aa", scene);
  }

  function tuft(x: number, z: number, height: number) {
    for (let k = 0; k < 3; k++) {
      const a = k * 2.1 + random() * 0.45;
      const dx = Math.sin(a);
      const dz = Math.cos(a);
      b.slab([
        [x - dz * 0.045, 0.145, z + dx * 0.045],
        [x + dz * 0.045, 0.145, z - dx * 0.045],
        [x + dx * 0.055, 0.145 + height, z + dz * 0.055],
      ], {
        thickness: 0.007,
        color: k % 2 ? "#8c9e71" : "#b0b982",
        bone: scene,
      });
    }
  }
  for (const [x, z] of [
    [-3.67, -0.58], [-3.82, 0.10], [3.71, -0.42],
    [3.68, 0.69], [-2.84, -2.35], [1.96, -2.66],
    [2.43, 1.72], [-2.33, 1.91], [1.58, 2.39],
    [-1.66, 2.48], [0.88, -3.30], [-1.12, -3.28],
  ]) {
    tuft(x, z, 0.10 + random() * 0.07);
  }

  // A pair of tiny golden wildflowers on the verge.
  for (const [x, z] of [[-2.34, 1.86], [2.39, 1.76]]) {
    b.rod([x, 0.145, z], [x, 0.33, z], 0.008, {
      color: "#5f795f",
      bone: scene,
      sides: 4,
    });
    b.ring(frame([x, 0.33, z], [0, 1, 0]), {
      count: 5,
      radius: 0.025,
    }, (at) => {
      b.part(new THREE.SphereGeometry(1, 6, 4), C.cream, {
        at,
        scale: [0.028, 0.012, 0.039],
        bone: scene,
      });
    });
    pin([x, 0.344, z], 0.022, C.yellow, scene);
  }

  // A warm, tiny navigation jewel is tucked into each wingtip.
  for (const s of [-1, 1]) {
    ellipsoid([s * 3.575, 2.605, 0.78], [0.061, 0.033, 0.067], C.brass);
    glow(ellipsoid(
      [s * 3.593, 2.62, 0.788],
      [0.035, 0.024, 0.045],
      s > 0 ? "#d85448" : "#83c7ac",
    ), 0.7);
  }

  // Museum-like title plate is small and low, never in front of the aircraft.
  box([0, 0.193, 2.85], [1.44, 0.105, 0.46], C.tealDark, scene, [-14, 0, 0]);
  image(
    plaqueTexture,
    [0, 0.253, 2.856],
    1.36,
    0.465,
    [0, 0.97, 0.242],
    scene,
    [0, 0.242, -0.97],
  );
  for (const s of [-1, 1])
    pin([s * 0.64, 0.276, 2.79], 0.018, C.brass, scene);

  return b.root;
}
