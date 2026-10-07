import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Rgb } from "../src/paint";
import { catmull, polyline, spiral } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Rally Hatchback",
  description:
    "Mud-spattered rally hatchback with swept fender flares, sharp mud flaps, hextech-glow light pods, an open-net cage cabin and a blade wing, in bold League-of-Legends colour blocking.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---- palette -----------------------------------------------------------------------------------------------------
const BLUE = "#2358f0";
const BLUE_D = "#132f86";
const NAVY = "#0a1030";
const NAVY_L = "#1b2557";
const GOLD = "#ffbd2b";
const GOLD_D = "#b97616";
const CYAN = "#33f3ff";
const CYAN_D = "#139bb5";
const MAG = "#ff2e78";
const WHITE = "#f2f5ff";
const STEEL = "#aeb8d2";
const STEEL_D = "#5a6384";
const RUBBER = "#15151d";
const TREAD = "#0b0b11";
const MUD = "#573720";
const MUD_L = "#80582f";
const GLASS = "#0b2354";
const LAMP = "#fff3c4";
const TAIL = "#e0102c";

// ---- layout (meters, +Z forward, +X the car's left) ---------------------------------------------------------------
const FZ = 1.2; // front axle
const RZ = -1.2; // rear axle
const WX = 0.78; // wheel centre x
const WY = 0.385; // wheel centre height (tyre radius 0.385 with the treads)
const ARCH_R = 0.47;
const ARCH_YB = 0.28;
const BELT = 1.05; // beltline
const ROOF = 1.395; // roof panel centre

type Pt = [number, number] | [number, number, "sharp"];
type V3 = [number, number, number];

const wx = (y: number) => 0.74 - 0.364 * (y - BELT); // half-width of the greenhouse at height y

// ---- paints ------------------------------------------------------------------------------------------------------
function mudAmount(p: THREE.Vector3) {
  const wide = noise(p, 0.34, 3);
  const fine = noise(p, 0.045, 8);
  let a = 1 - smoothstep(0.26, 0.5 + (wide - 0.5) * 0.55, p.y);
  for (const z of [FZ, RZ]) {
    const d = Math.hypot(p.z - z, p.y - WY);
    const spray = (1 - smoothstep(0.55, 1.1, d)) * smoothstep(0.5, 0.68, fine) * (1 - smoothstep(0.5, 0.8, p.y)) * 0.9;
    a = Math.max(a, spray);
  }
  return Math.min(1, a * (0.5 + 0.5 * smoothstep(0.3, 0.6, fine)));
}
const mudColor = (p: THREE.Vector3) => mix(MUD_L, MUD, noise(p, 0.07, 5));

const bodyPaint = paint((p, n) => {
  const ax = Math.abs(p.x);
  let c: string = BLUE;
  if (Math.abs(n.x) > 0.6 && n.x * p.x < 0) return NAVY_L; // inner wall of the tub
  if (n.y > 0.55 && p.y > 1.3) {
    // roof: twin gold blades, cyan spine
    if (ax < 0.03) c = CYAN;
    else if (ax > 0.2 && ax < 0.32) c = GOLD;
    else if (ax > 0.34 && ax < 0.38) c = NAVY;
    else if (ax > 0.55) c = BLUE_D;
  } else if (n.y > 0.55 && p.z > 0.6 && ax < 0.66) {
    // hood: forward-pointing chevrons
    const q = (p.z + 1.15 * ax) / 0.36;
    const f = q - Math.floor(q);
    if (ax < 0.07) c = GOLD;
    else if (f < 0.2) c = GOLD;
    else if (f > 0.26 && f < 0.32) c = CYAN;
    else c = BLUE;
  } else {
    const t = p.y + 0.3 * p.z;
    if (p.y < 0.46) c = NAVY;
    else if (p.y < 0.495) c = GOLD;
    else if (t < 0.62) c = BLUE_D;
    else if (t < 0.76) c = GOLD;
    else if (t < 0.79) c = NAVY;
    else if (t < 0.83) c = MAG;
  }
  const m = mudAmount(p);
  return m > 0.02 ? mix(c, mudColor(p), m) : c;
});

const plasticPaint = paint((p) => {
  const m = mudAmount(p);
  return m > 0.02 ? mix(NAVY_L, mudColor(p), Math.min(1, m * 1.15)) : NAVY_L;
});

const tirePaint = paint((p, nrm) => {
  const n = noise(p, 0.06, 2);
  const a = (1 - smoothstep(0.1, 0.42 + (n - 0.5) * 0.3, p.y)) * 0.85;
  let base: string = RUBBER;
  if (Math.abs(nrm.x) > 0.7) {
    const zc = p.z > 0 ? FZ : RZ;
    const dy = p.y - WY;
    const dz = p.z - zc;
    const r = Math.hypot(dy, dz);
    const ang = (Math.atan2(dy, dz) + Math.PI) / (2 * Math.PI);
    if (r > 0.272 && r < 0.29 && (ang * 36) % 1 < 0.6) base = GOLD_D;
    else if (r > 0.318 && r < 0.326) base = STEEL_D;
  }
  return mix(base, mix(MUD_L, MUD, n), a);
});

const wingPaint = paint((p, n) => {
  const ax = Math.abs(p.x);
  if (n.y < -0.4) return NAVY;
  if (ax < 0.1) return CYAN;
  if (ax < 0.4) return GOLD;
  if (ax < 0.45) return NAVY;
  return BLUE;
});

const glassPaint = paint((p, _n, s) => {
  const q = (s[0] * 0.8 + s[1]) / 0.42;
  const f = q - Math.floor(q);
  let c: string | Rgb = GLASS;
  if (f < 0.07) c = mix(GLASS, WHITE, 0.35);
  else if (f > 0.14 && f < 0.17) c = mix(GLASS, CYAN, 0.4);
  const m = (1 - smoothstep(1.07, 1.2, p.y + (noise(p, 0.045, 2) - 0.5) * 0.14)) * 0.85;
  return m > 0.02 ? mix(c, MUD, m) : c;
});

const defrostPaint = paint((_p, _n, s) => {
  const f = (s[1] + 1) / 0.045;
  return f - Math.floor(f) < 0.14 ? mix(GLASS, STEEL, 0.5) : GLASS;
});

const flapPaint = paint((p, _n, s) => {
  const v = -s[1] + 1.1 * Math.abs(s[0]);
  const f = v / 0.1 - Math.floor(v / 0.1);
  let c: string = RUBBER;
  if (s[1] > -0.08) c = NAVY_L;
  else if (Math.abs(s[0]) > 0.18) c = GOLD_D;
  else if (s[1] > -0.38 && f < 0.4) c = GOLD;
  const m = (1 - smoothstep(-0.56, -0.3, s[1] + (noise(p, 0.05, 4) - 0.5) * 0.2)) * 0.95;
  return m > 0.02 ? mix(c, mudColor(p), m) : c;
});

const plankPaint = paint((_p, _n, s) => {
  const v = s[0] / 0.07;
  return v - Math.floor(v) < 0.5 ? NAVY : NAVY_L;
});

// ---- textures ----------------------------------------------------------------------------------------------------
function netSvg(w: number, h: number) {
  let g = "";
  for (let x = 0; x <= w; x += 4) g += `<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`;
  for (let y = 0; y <= h; y += 4) g += `<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`;
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><g stroke="#d6e6ff" stroke-width="0.34">${g}</g></svg>`,
    { size: 512 },
  );
}

function hexSvg(w: number, h: number, r: number, bg: string, line: string) {
  let g = "";
  const dx = r * 1.732;
  const dy = r * 1.5;
  for (let row = 0; row * dy < h + r; row++)
    for (let col = 0; col * dx < w + r; col++) {
      const cx = col * dx + (row % 2 ? dx / 2 : 0);
      const cy = row * dy;
      const pts = [0, 1, 2, 3, 4, 5]
        .map((k) => {
          const a = (Math.PI / 3) * k + Math.PI / 6;
          return `${(cx + r * 0.92 * Math.cos(a)).toFixed(2)},${(cy + r * 0.92 * Math.sin(a)).toFixed(2)}`;
        })
        .join(" ");
      g += `<polygon points="${pts}"/>`;
    }
  return svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/><g fill="none" stroke="${line}" stroke-width="1.2">${g}</g></svg>`,
    { size: 512 },
  );
}

const NET_F = netSvg(40, 28);
const NET_R = netSvg(88, 28);
const GRILLE = hexSvg(70, 24, 4, NAVY, CYAN);
const VENT = hexSvg(40, 40, 4.2, NAVY, GOLD);
const ROUNDEL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polygon points="50,3 91,26 91,74 50,97 9,74 9,26" fill="#0a1030" stroke="#ffbd2b" stroke-width="5" stroke-linejoin="round"/>
  <polygon points="50,14 82,32 82,68 50,86 18,68 18,32" fill="#f2f5ff"/>
  <path d="M18 68 L50 86 L82 68 L82 60 L50 78 L18 60 Z" fill="#ff2e78"/>
  <text x="50" y="62" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="36" text-anchor="middle" fill="#0a1030">07</text>
  </svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 22">
  <rect x="1" y="1" width="102" height="20" rx="4" fill="#f2f5ff" stroke="#0a1030" stroke-width="2"/>
  <rect x="5" y="4" width="12" height="14" fill="#2358f0"/>
  <text x="62" y="16.5" font-family="Arial Black, Impact, sans-serif" font-weight="900" font-size="14" text-anchor="middle" fill="#0a1030">RLY·07</text>
  </svg>`,
  { size: 416 },
);
const GAUGE = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <circle cx="16" cy="16" r="15" fill="#0a1030" stroke="#ffbd2b" stroke-width="2"/>
  <path d="M6 22 A11 11 0 1 1 26 22" fill="none" stroke="#33f3ff" stroke-width="2.4" stroke-linecap="round"/>
  <path d="M20 22 A11 11 0 0 1 26 22" fill="none" stroke="#ff2e78" stroke-width="2.4"/>
  <line x1="16" y1="17" x2="11" y2="9" stroke="#f2f5ff" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="16" cy="17" r="2" fill="#ffbd2b"/>
  </svg>`,
  { size: 128 },
);
const SLASH = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 16">
  <polygon points="0,16 6,0 64,0 58,16" fill="#33f3ff"/>
  <polygon points="10,12 14,4 54,4 50,12" fill="#f2f5ff"/>
  </svg>`,
  { size: 256 },
);

// ---- geometry helpers --------------------------------------------------------------------------------------------
/** A single quad facing `out`, uv mapped over its bounding box corners (a textured sheet with an arbitrary outline). */
function quadGeo(p0: V3, p1: V3, p2: V3, p3: V3, out: V3) {
  const g = new THREE.BufferGeometry();
  const pts = [p0, p1, p2, p3].map((p) => new THREE.Vector3(...p));
  const nrm = new THREE.Vector3().subVectors(pts[1], pts[0]).cross(new THREE.Vector3().subVectors(pts[3], pts[0]));
  const flip = nrm.dot(new THREE.Vector3(...out)) < 0;
  const pos: number[] = [];
  for (const p of pts) pos.push(p.x, p.y, p.z);
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  g.setIndex(flip ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3]);
  g.computeVertexNormals();
  return g;
}

function archPoints(cz: number, n = 10): [number, number][] {
  const f0 = Math.asin((ARCH_YB - WY) / ARCH_R);
  const out: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const phi = f0 + ((Math.PI - 2 * f0) * i) / n;
    out.push([cz + ARCH_R * Math.cos(phi), WY + ARCH_R * Math.sin(phi)]);
  }
  return out;
}

/** Hexagonal merged bolt heads for one run of positions (all facing along local +Y, then rotated by `quat`). */
function boltGeo(points: THREE.Vector3[], radius: number, height: number, quat: THREE.Quaternion) {
  const parts = points.map((p) =>
    new THREE.CylinderGeometry(radius, radius, height, 6)
      .applyQuaternion(quat)
      .translate(p.x, p.y, p.z),
  );
  return mergeGeometries(parts)!;
}

export default function build() {
  const b = createBuilder({ name: "rallyHatchback", paintSize: 2048 });

  // ---- skeleton --------------------------------------------------------------------------------------------------
  const chassis = b.joint("chassis", { at: [0, 0.6, 0], dir: [0, 0, 1], role: "spine" });
  const sides = [
    { s: 1, k: "L" },
    { s: -1, k: "R" },
  ];
  const axles = [
    { id: "FL", s: 1, z: FZ, steer: true },
    { id: "FR", s: -1, z: FZ, steer: true },
    { id: "RL", s: 1, z: RZ, steer: false },
    { id: "RR", s: -1, z: RZ, steer: false },
  ];
  const wheelBone: Record<string, Joint> = {};
  const armBone: Record<string, Joint> = {};
  const carrier: Record<string, Joint> = {};
  for (const a of axles) {
    const arm = b.joint(`arm${a.id}`, {
      parent: chassis,
      at: [a.s * 0.3, 0.36, a.z],
      aim: [a.s * WX, WY, a.z],
      role: "hinge",
    });
    const hub = a.steer
      ? b.joint(`steer${a.id}`, { parent: arm, at: [a.s * WX, WY, a.z], dir: [0, 1, 0], role: "hinge" })
      : arm;
    armBone[a.id] = arm;
    carrier[a.id] = hub;
    wheelBone[a.id] = b.joint(`wheel${a.id}`, { parent: hub, at: [a.s * WX, WY, a.z], dir: [a.s, 0, 0], role: "hinge" });
  }
  const doorJ: Record<string, Joint> = {};
  for (const { s, k } of sides)
    doorJ[k] = b.joint(`door${k}`, { parent: chassis, at: [s * 0.86, 0.7, 0.55], dir: [0, 1, 0], role: "hinge" });
  const hood = b.joint("hood", { parent: chassis, at: [0, 1.0, 0.64], dir: [0, 0, 1], role: "hinge" });
  const hatch = b.joint("hatch", { parent: chassis, at: [0, 1.38, -1.22], dir: [0, 0, -1], role: "hinge" });
  const WING = { y: 1.5, z: -1.9 };
  const wingFlap = b.joint("wingFlap", {
    parent: chassis,
    at: [0, WING.y + 0.04, WING.z - 0.1],
    dir: [1, 0, 0],
    role: "hinge",
  });
  const steeringWheel = b.joint("steeringWheel", {
    parent: chassis,
    at: [0.36, 0.93, 0.3],
    dir: [0, 0.35, -1],
    role: "hinge",
  });
  const flapJ: Record<string, Joint> = {};
  for (const a of axles)
    flapJ[a.id] = b.joint(`mudFlap${a.id}`, {
      parent: chassis,
      at: [a.s * 0.86, 0.66, a.z - 0.52],
      dir: [0, -1, 0],
      role: "hinge",
    });

  // ---- wrappers --------------------------------------------------------------------------------------------------
  type PartArgs = Parameters<typeof b.part>;
  const P = (g: THREE.BufferGeometry, color: PartArgs[1], o: NonNullable<PartArgs[2]> = {}) =>
    b.part(g, color, { bone: chassis, ...o });
  const X = (outline: readonly Pt[], o: Parameters<typeof b.extrude>[1]) => b.extrude(outline, { bone: chassis, ...o });
  const L = (outline: readonly (readonly number[])[], o: Parameters<typeof b.lathe>[1]) =>
    b.lathe(outline, { bone: chassis, ...o });
  const R = (a: V3, c: V3, r: number | [number, number], color: Fill, o: Parameters<typeof b.rod>[3] = {}) =>
    b.rod(a, c, r, { bone: chassis, color, ...o });
  const S = (pts: readonly (readonly number[])[], r: number, color: Fill, o: Parameters<typeof b.sweep>[2] = {}) =>
    b.sweep(pts, r, { bone: chassis, color, ...o });
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

  // ================================================================================================================
  // TUB: side sheets with wheel arches, floor, firewall, tail, nose
  // ================================================================================================================
  const sheet: Pt[] = [
    [-1.94, 0.3],
    [-2.0, 0.44],
    [-2.01, 0.8],
    [-1.96, 1.04],
    [-0.4, BELT],
    [0.62, BELT],
    [1.2, 0.98],
    [1.76, 0.93],
    [1.8, 0.8],
    [1.8, ARCH_YB],
    ...archPoints(FZ),
    ...archPoints(RZ),
  ];
  for (const { s, k } of sides)
    X(sheet, { at: [s * 0.75, 0, 0], thickness: 0.18, bevel: 0.035, color: bodyPaint, name: `sheet${k}` });

  // wheel-well back walls
  for (const { s, k } of sides)
    for (const [zz, tag] of [
      [FZ, "F"],
      [RZ, "R"],
    ] as const)
      X([...archPoints(zz), [zz - 0.52, ARCH_YB - 0.02], [zz + 0.52, ARCH_YB - 0.02]], {
        at: [s * 0.625, 0, 0],
        thickness: 0.04,
        color: NAVY,
        name: `well${tag}${k}`,
      });

  // floor, underbody plate, firewall, tail block
  X(
    [
      [-0.66, -1.45],
      [0.66, -1.45],
      [0.66, 0.66],
      [-0.66, 0.66],
    ],
    { at: [0, 0.36, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, color: NAVY_L, name: "floor" },
  );
  X(
    [
      [-0.64, -1.72],
      [0.64, -1.72],
      [0.64, 1.72],
      [-0.64, 1.72],
    ],
    { at: [0, 0.285, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.04, color: STEEL_D, name: "underbody" },
  );
  X(
    [
      [-0.5, 0.9],
      [0.5, 0.9],
      [0.38, 1.82],
      [-0.38, 1.82],
    ],
    { at: [0, 0.272, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.01, color: GOLD_D, name: "skidPlate" },
  );
  X(
    [
      [0.6, 0.3],
      [0.6, 0.94],
      [1.8, 0.78],
      [1.8, 0.3],
    ],
    { at: [0, 0, 0], thickness: 1.24, color: NAVY, name: "engineBay" },
  );
  X(
    [
      [-2.02, 0.3],
      [-2.02, 0.8],
      [-1.45, 0.8],
      [-1.45, 0.3],
    ],
    { at: [0, 0, 0], thickness: 1.3, bevel: 0.03, color: bodyPaint, name: "tail" },
  );
  // dash
  X(
    [
      [0.62, 0.4],
      [0.62, 0.98],
      [0.44, 0.93],
      [0.3, 0.7],
      [0.32, 0.4],
    ],
    { at: [0, 0, 0], thickness: 1.28, bevel: 0.02, color: NAVY_L, name: "dash" },
  );
  X(
    [
      [0.58, 0.96],
      [0.52, 1.07],
      [0.42, 1.08],
      [0.4, 0.94],
    ],
    { at: [0.37, 0, 0], thickness: 0.36, bevel: 0.01, color: NAVY, name: "binnacle" },
  );
  P(new THREE.PlaneGeometry(0.2, 0.2), "#ffffff", {
    at: [0.37, 1.0, 0.425],
    dir: [0, 0.22, -1],
    up: [0, 1, 0],
    axis: "z",
    texture: GAUGE,
    name: "gaugeL",
  });
  P(new THREE.PlaneGeometry(0.14, 0.14), "#ffffff", {
    at: [0.0, 0.93, 0.5],
    dir: [0, 0.6, -1],
    axis: "z",
    texture: GAUGE,
    name: "gaugeC",
  });
  glow(
    P(box(0.5, 0.012, 0.01), CYAN, { at: [0.0, 0.973, 0.585], name: "dashGlow" }),
    1.2,
  );
  // centre tunnel, handbrake, shifter
  X(
    [
      [0.3, 0.38],
      [0.3, 0.56],
      [0.1, 0.62],
      [-0.5, 0.56],
      [-0.5, 0.38],
    ],
    { at: [0, 0, 0], thickness: 0.2, bevel: 0.02, color: NAVY, name: "tunnel" },
  );
  R([0, 0.6, 0.0], [0, 0.68, -0.12], 0.012, GOLD_D);
  P(new THREE.SphereGeometry(0.03, 6, 5), GOLD, { at: [0, 0.7, -0.14], name: "shiftKnob" });
  R([0.0, 0.58, -0.3], [0.0, 0.76, -0.4], 0.016, STEEL);
  R([0.0, 0.76, -0.4], [0.0, 0.78, -0.45], 0.026, MAG);

  // ---- nose ------------------------------------------------------------------------------------------------------
  const nosePlan: Pt[] = [
    [-0.8, 1.62],
    [0.8, 1.62],
    [0.8, 1.86],
    [0.62, 2.06],
    [0.3, 2.12],
    [-0.3, 2.12],
    [-0.62, 2.06],
    [-0.8, 1.86],
  ];
  X(nosePlan, {
    at: [0, 0.55, 0],
    x: [1, 0, 0],
    y: [0, 0, 1],
    thickness: 0.52,
    bevel: 0.03,
    color: bodyPaint,
    name: "nose",
  });
  // splitter blade
  X(
    [
      [-0.88, 1.7],
      [0.88, 1.7],
      [0.96, 1.95],
      [0.7, 2.2, "sharp"],
      [0.34, 2.14],
      [0.0, 2.3, "sharp"],
      [-0.34, 2.14],
      [-0.7, 2.2, "sharp"],
      [-0.96, 1.95],
    ],
    { at: [0, 0.3, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.035, bevel: 0.008, color: NAVY, name: "splitter" },
  );
  glow(S([[-0.34, 0.275, 2.14], [-0.7, 0.275, 2.2], [-0.96, 0.275, 1.95], [-0.88, 0.275, 1.7]], 0.012, CYAN, { caps: "round" }), 1.3);
  glow(S([[0.34, 0.275, 2.14], [0.7, 0.275, 2.2], [0.96, 0.275, 1.95], [0.88, 0.275, 1.7]], 0.012, CYAN, { caps: "round" }), 1.3);
  // canards
  for (const { s } of sides)
    X(
      [
        [0, 0],
        [0.22, 0.08, "sharp"],
        [0.02, 0.16],
      ],
      {
        at: [s * 0.78, 0.55, 1.7],
        x: [s, 0, 0],
        y: [0, 0, 1],
        thickness: 0.02,
        color: GOLD,
        name: "canard",
      },
    );
  // grille
  P(new THREE.PlaneGeometry(0.56, 0.2), "#ffffff", {
    at: [0, 0.47, 2.125],
    dir: [0, 0, 1],
    axis: "z",
    texture: GRILLE,
    name: "grille",
  });
  for (const y of [0.37, 0.57]) R([-0.29, y, 2.125], [0.29, y, 2.125], 0.012, GOLD);
  for (const x of [-0.29, 0.29]) R([x, 0.37, 2.125], [x, 0.57, 2.125], 0.012, GOLD);
  P(new THREE.PlaneGeometry(0.34, 0.09), "#ffffff", {
    at: [0, 0.68, 2.125],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLATE,
    name: "plateF",
  });
  // headlight shards on each nose corner
  for (const { s } of sides) {
    const n: V3 = [s * 0.743, 0, 0.669];
    const off = 0.012;
    const pt = (t: number, y: number): V3 => [
      s * (0.8 - 0.18 * t) + n[0] * off,
      y,
      1.86 + 0.2 * t + n[2] * off,
    ];
    b.slab([pt(0.05, 0.6), pt(0.95, 0.66), pt(0.95, 0.76), pt(0.05, 0.78)], { bone: chassis, color: NAVY, thickness: 0.02, name: "lampHousing" });
    const inset = (t: number, y: number): V3 => {
      const p = pt(t, y);
      return [p[0] + n[0] * 0.012, p[1], p[2] + n[2] * 0.012];
    };
    glow(b.slab([inset(0.14, 0.66), inset(0.84, 0.69), inset(0.84, 0.74), inset(0.14, 0.75)], { bone: chassis, color: LAMP, thickness: 0.012, name: "headlamp" }), 1.8);
    glow(b.slab([inset(0.1, 0.62), inset(0.9, 0.645), inset(0.9, 0.66), inset(0.1, 0.635)], { bone: chassis, color: CYAN, thickness: 0.012, name: "drl" }), 1.4);
    P(
      quadGeo(
        [s * (0.8 - 0.18 * 0.12) + n[0] * 0.008, 0.34, 1.86 + 0.2 * 0.12 + n[2] * 0.008],
        [s * (0.8 - 0.18 * 0.9) + n[0] * 0.008, 0.34, 1.86 + 0.2 * 0.9 + n[2] * 0.008],
        [s * (0.8 - 0.18 * 0.9) + n[0] * 0.008, 0.52, 1.86 + 0.2 * 0.9 + n[2] * 0.008],
        [s * (0.8 - 0.18 * 0.12) + n[0] * 0.008, 0.52, 1.86 + 0.2 * 0.12 + n[2] * 0.008],
        n,
      ),
      "#ffffff",
      { at: [0, 0, 0], texture: VENT, name: "noseVent" },
    );
  }

  // ---- hood-front light pods bar --------------------------------------------------------------------------------
  function pod(at: V3, r: number, dir: V3 = [0, 0, 1], bone = chassis) {
    const outline: [number, number][] = [
      [0, -0.22],
      [r * 0.65, -0.22],
      [r * 0.95, -0.12],
      [r * 1.0, 0.0],
      [r * 1.12, 0.012],
      [r * 1.12, 0.045],
      [0, 0.045],
    ];
    b.lathe(outline, { at, axis: dir, segments: 12, bone, color: NAVY_L, name: "podBody" });
    b.lathe(
      [
        [r * 1.02, 0.02],
        [r * 1.2, 0.02],
        [r * 1.2, 0.07],
        [r * 1.02, 0.07],
      ],
      { at, axis: dir, segments: 12, bone, color: GOLD, name: "podRim" },
    );
    const lens = b.lathe(
      [
        [0, 0.05],
        [r * 0.92, 0.05],
        [r * 0.8, 0.075],
        [r * 0.45, 0.1],
        [0, 0.112],
      ],
      { at, axis: dir, segments: 12, bone, color: LAMP, name: "podLens" },
    );
    glow(lens, 2);
    const ring = b.lathe(
      [
        [r * 0.2, 0.108],
        [r * 0.42, 0.098],
        [r * 0.42, 0.108],
        [r * 0.2, 0.118],
      ],
      { at, axis: dir, segments: 8, bone, color: CYAN, name: "podCore" },
    );
    glow(ring, 1.5);
  }
  R([-0.62, 0.9, 1.8], [0.62, 0.9, 1.8], 0.026, GOLD, { caps: "round" });
  for (const x of [-0.6, 0.6]) {
    R([x, 0.9, 1.8], [x, 0.78, 1.84], 0.03, GOLD_D);
    P(box(0.1, 0.02, 0.1), GOLD_D, { at: [x, 0.79, 1.84], name: "barFoot" });
  }
  for (const x of [-0.2, 0.2]) {
    pod([x, 1.0, 1.88], 0.11);
    R([x, 0.9, 1.8], [x, 0.96, 1.8], 0.03, GOLD_D);
  }
  for (const x of [-0.52, 0.52]) {
    pod([x, 0.99, 1.88], 0.085);
    R([x, 0.9, 1.8], [x, 0.95, 1.8], 0.026, GOLD_D);
  }

  // ================================================================================================================
  // FLARES, bolts, wheel-arch trims, mud flaps
  // ================================================================================================================
  for (const { s, k } of sides)
    for (const [zz, tag] of [
      [FZ, "F"],
      [RZ, "R"],
    ] as const) {
      const band: [number, number, "sharp"?][] = [];
      const a0 = (-16 * Math.PI) / 180;
      const a1 = Math.PI - a0;
      const n = 12;
      for (let i = 0; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        band.push([zz + 0.585 * Math.cos(a), WY + 0.585 * Math.sin(a)]);
      }
      for (let i = n; i >= 0; i--) {
        const a = a0 + ((a1 - a0) * i) / n;
        band.push([zz + (ARCH_R + 0.005) * Math.cos(a), WY + (ARCH_R + 0.005) * Math.sin(a)]);
      }
      band[0] = [band[0][0], band[0][1], "sharp"];
      X(band as Pt[], {
        at: [s * 0.9, 0, 0],
        thickness: 0.14,
        bevel: 0.025,
        color: plasticPaint,
        name: `flare${tag}${k}`,
      });
      // bolts around the outer face
      const bolts: THREE.Vector3[] = [];
      for (let i = 1; i < 11; i++) {
        const a = a0 + ((a1 - a0) * i) / 11;
        bolts.push(new THREE.Vector3(s * 0.972, WY + 0.53 * Math.sin(a), zz + 0.53 * Math.cos(a)));
      }
      const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), (-s * Math.PI) / 2);
      P(boltGeo(bolts, 0.018, 0.014, quat), GOLD, { at: [0, 0, 0], name: `flareBolts${tag}${k}` });
      // gold edge line along the flare lip
      const lip: V3[] = [];
      for (let i = 0; i <= 16; i++) {
        const a = a0 + 0.05 + ((a1 - a0 - 0.1) * i) / 16;
        lip.push([s * 0.975, WY + 0.58 * Math.sin(a), zz + 0.58 * Math.cos(a)]);
      }
      S(lip, 0.008, GOLD, { caps: "flat" });
    }

  // mud flaps
  const yaw = (24 * Math.PI) / 180;
  for (const a of axles) {
    const j = flapJ[a.id];
    const x0 = a.s * 0.86;
    const z0 = a.z - 0.52;
    const d = new THREE.Vector3(a.s * Math.cos(yaw), 0, -Math.sin(yaw));
    b.extrude(
      [
        [-0.18, 0],
        [0.18, 0],
        [0.18, -0.44],
        [0.0, -0.56, "sharp"],
        [-0.18, -0.44],
      ],
      { bone: j, at: [x0, 0.66, z0], x: d, y: [0, 1, 0], thickness: 0.024, bevel: 0.006, color: flapPaint, name: `flap${a.id}` },
    );
    b.part(box(0.38, 0.06, 0.05), GOLD_D, { bone: j, at: [x0, 0.65, z0], rotation: [0, a.s * 24, 0], name: `flapBracket${a.id}` });
    const bolts: THREE.Vector3[] = [-0.14, 0, 0.14].map((u) => new THREE.Vector3(x0 + u * d.x, 0.65, z0 + u * d.z));
    b.part(boltGeo(bolts, 0.014, 0.012, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2)), GOLD, {
      bone: j,
      at: [0, 0, 0],
      name: `flapBolts${a.id}`,
    });
    glow(b.part(box(0.26, 0.012, 0.012), CYAN, { bone: j, at: [x0 + 0.012 * d.z, 0.5, z0 - 0.015], rotation: [0, a.s * 24, 0], name: `flapGlow${a.id}` }), 1.2);
  }

  // ================================================================================================================
  // WHEELS
  // ================================================================================================================
  const tireProfile: [number, number][] = [
    [0.21, -0.12],
    [0.3, -0.135],
    [0.35, -0.115],
    [0.37, -0.07],
    [0.37, 0.07],
    [0.35, 0.115],
    [0.3, 0.135],
    [0.21, 0.12],
  ];
  const spokes: Pt[] = [];
  const NSP = 6;
  for (let k = 0; k < NSP; k++) {
    const a = (k * 2 * Math.PI) / NSP;
    const pol = (r: number, da: number): Pt => [r * Math.cos(a + da), r * Math.sin(a + da)];
    spokes.push(pol(0.215, -0.13), pol(0.215, 0.13, ), [0.085 * Math.cos(a + 0.52), 0.085 * Math.sin(a + 0.52), "sharp"]);
  }
  for (const w of axles) {
    const wb = wheelBone[w.id];
    const c: V3 = [w.s * WX, WY, w.z];
    const out = (d: number): V3 => [c[0] + w.s * d, c[1], c[2]];
    const axis: V3 = [w.s, 0, 0];
    b.lathe(tireProfile, { at: c, axis, segments: 20, bone: wb, color: tirePaint, name: `tire${w.id}` });
    // chunky treads
    const blocks: THREE.BufferGeometry[] = [];
    const N = 22;
    for (let i = 0; i < N; i++) {
      for (const row of [-1, 1]) {
        const th = ((i + (row > 0 ? 0.5 : 0)) * 2 * Math.PI) / N;
        const g = new THREE.BoxGeometry(0.05, 0.085, 0.115);
        g.rotateY(-th);
        g.translate(0.36 * Math.cos(th), row * 0.055, 0.36 * Math.sin(th));
        blocks.push(g);
      }
    }
    b.part(mergeGeometries(blocks)!, TREAD, { bone: wb, at: c, dir: axis, flat: true, name: `tread${w.id}` });
    // rim
    b.lathe(
      [
        [0.185, 0.08],
        [0.25, 0.09],
        [0.255, 0.135],
        [0.185, 0.135],
      ],
      { at: c, axis, segments: 18, bone: wb, color: GOLD, name: `rimLip${w.id}` },
    );
    b.part(new THREE.CylinderGeometry(0.215, 0.215, 0.04, 16), NAVY, { bone: wb, at: out(-0.02), dir: axis, name: `barrel${w.id}` });
    b.extrude(spokes, {
      at: out(0.095),
      bone: wb,
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.035,
      bevel: 0.008,
      color: GOLD,
      name: `spokes${w.id}`,
    });
    b.lathe(
      [
        [0, 0.0],
        [0.075, 0.0],
        [0.06, 0.03],
        [0.025, 0.045],
        [0, 0.045],
      ],
      { at: out(0.105), axis, segments: 10, bone: wb, color: GOLD_D, name: `hub${w.id}` },
    );
    glow(
      b.lathe(
        [
          [0.028, 0.044],
          [0.05, 0.036],
          [0.05, 0.046],
          [0.028, 0.056],
        ],
        { at: out(0.105), axis, segments: 10, bone: wb, color: CYAN, name: `hubGlow${w.id}` },
      ),
      1.6,
    );
    // brake disc and caliper seen through the spokes
    b.lathe(
      [
        [0.07, 0.0],
        [0.19, 0.0],
        [0.19, 0.022],
        [0.07, 0.022],
      ],
      { at: out(0.035), axis, segments: 18, bone: wb, color: STEEL, name: `disc${w.id}` },
    );
    const calA = Math.PI * 0.62;
    b.part(box(0.07, 0.065, 0.11), MAG, {
      bone: carrier[w.id],
      at: [c[0] + w.s * 0.05, c[1] + 0.14 * Math.sin(calA), c[2] + 0.14 * Math.cos(calA)],
      rotation: [(-calA * 180) / Math.PI + 90, 0, 0],
      name: `caliper${w.id}`,
    });
    // lug nuts
    const lugs: THREE.Vector3[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 + 0.3;
      lugs.push(new THREE.Vector3(0.05 * Math.cos(a), 0, 0.05 * Math.sin(a)));
    }
    b.part(boltGeo(lugs, 0.014, 0.03, new THREE.Quaternion()), STEEL, {
      bone: wb,
      at: out(0.115),
      dir: axis,
      name: `lugs${w.id}`,
    });
    // hub/arm link visible inside the well
    b.rod([w.s * 0.3, 0.36, w.z], [w.s * 0.66, WY, w.z], 0.022, { bone: carrier[w.id], color: STEEL_D, name: `axle${w.id}` });
    b.part(box(0.07, 0.24, 0.12), GOLD_D, { bone: carrier[w.id], at: [w.s * 0.63, WY, w.z], name: `knuckle${w.id}` });
    if (w.steer) b.rod([w.s * 0.63, 0.3, w.z - 0.05], [w.s * 0.3, 0.3, w.z - 0.12], 0.016, { bone: carrier[w.id], color: STEEL, name: `tieRod${w.id}` });
  }
  // lower control arms and dampers (static dress in the wells)
  for (const { s } of sides)
    for (const z of [FZ, RZ]) {
      const id = `${z > 0 ? "F" : "R"}${s > 0 ? "L" : "R"}`;
      R([s * 0.3, 0.33, z - 0.08], [s * 0.6, 0.38, z - 0.04], 0.018, STEEL_D, { bone: armBone[id] });
      R([s * 0.3, 0.33, z + 0.08], [s * 0.6, 0.38, z + 0.04], 0.018, STEEL_D, { bone: armBone[id] });
      R([s * 0.585, 0.38, z], [s * 0.575, 0.86, z], 0.024, GOLD);
      const coil = spiral([s * 0.58, 0.45, z], [s * 0.58 + 0.045, 0.45, z], [0, 1, 0], { turns: 5, r1: 0.045, pitch: 0.075 });
      b.sweep(coil, 0.008, { bone: chassis, color: CYAN_D, sides: 4, caps: "flat" });
    }

  // ================================================================================================================
  // GREENHOUSE: pillars, roof, glass, nets, cage, seats
  // ================================================================================================================
  for (const { s } of sides) {
    // A pillars
    R([s * 0.74, 1.04, 0.62], [s * 0.62, 1.39, 0.12], 0.04, bodyPaint);
    // B pillars
    R([s * 0.74, 1.04, -0.34], [s * 0.63, 1.38, -0.34], 0.036, NAVY);
    // C pillars
    R([s * 0.74, 1.04, -1.9], [s * 0.62, 1.38, -1.2], 0.05, bodyPaint);
    // roof rails and window sills
    R([s * 0.62, 1.385, 0.12], [s * 0.63, 1.385, -1.2], 0.03, NAVY);
    R([s * 0.75, 1.07, 0.6], [s * 0.75, 1.07, -1.9], 0.022, GOLD);
  }
  // roof panel
  X(
    [
      [-0.6, 0.14],
      [0.6, 0.14],
      [0.66, -0.5],
      [0.66, -1.1],
      [0.6, -1.22],
      [-0.6, -1.22],
      [-0.66, -1.1],
      [-0.66, -0.5],
    ],
    { at: [0, ROOF, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.045, bevel: 0.012, color: bodyPaint, name: "roof" },
  );
  // roof scoop
  X(
    [
      [-0.42, 0],
      [0, 0.085, "sharp"],
      [0, 0],
    ],
    { at: [0, ROOF + 0.02, -0.5], thickness: [0.34, 0.28], bevel: 0.008, color: NAVY_L, name: "roofScoop" },
  );
  glow(P(box(0.24, 0.04, 0.012), CYAN, { at: [0, ROOF + 0.06, -0.495], name: "scoopGlow" }), 1.4);
  P(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
    at: [0, ROOF + 0.025, -1.0],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: VENT,
    name: "roofVent",
  });
  // roof number
  P(new THREE.PlaneGeometry(0.4, 0.4), "#ffffff", {
    at: [0, ROOF + 0.024, -0.2],
    dir: [0, 1, 0],
    up: [0, 0, 1],
    axis: "z",
    texture: ROUNDEL,
    name: "roofNumber",
  });
  // roof pod bar
  R([-0.52, 1.5, 0.2], [0.52, 1.5, 0.2], 0.024, GOLD, { caps: "round" });
  for (const x of [-0.5, 0, 0.5]) R([x, 1.42, 0.2], [x, 1.5, 0.2], 0.03, GOLD_D);
  for (const x of [-0.37, -0.125, 0.125, 0.37]) {
    pod([x, 1.58, 0.28], 0.075);
    R([x, 1.5, 0.2], [x, 1.55, 0.2], 0.026, GOLD_D);
  }

  // windshield (dark glass, glint paint), rear window on the hatch
  b.slab(
    [
      [0.7, 1.05, 0.6],
      [-0.7, 1.05, 0.6],
      [-0.6, 1.385, 0.13],
      [0.6, 1.385, 0.13],
    ],
    { bone: chassis, color: glassPaint, thickness: 0.02, name: "windshield" },
  );
  glow(S([[0.66, 1.355, 0.17], [-0.66, 1.355, 0.17]], 0.012, CYAN, { caps: "round" }), 1.3);
  b.slab(
    [
      [0.7, 1.05, 0.6],
      [-0.7, 1.05, 0.6],
      [-0.7, 1.08, 0.6],
      [0.7, 1.08, 0.6],
    ],
    { bone: chassis, color: NAVY, thickness: 0.03, name: "cowlGasket" },
  );
  // wipers
  for (const x of [0.25, -0.15]) R([x, 1.06, 0.6], [x + 0.32, 1.2, 0.5], 0.008, NAVY);
  // side nets
  for (const { s } of sides) {
    const out: V3 = [s, 0.33, 0];
    P(
      quadGeo([s * wx(1.06), 1.06, 0.57], [s * wx(1.06), 1.06, -0.31], [s * wx(1.37), 1.37, -0.31], [s * wx(1.37), 1.37, 0.15], out),
      "#ffffff",
      { at: [0, 0, 0], texture: NET_F, name: "netFront" },
    );
    P(
      quadGeo([s * wx(1.06), 1.06, -0.37], [s * wx(1.06), 1.06, -1.84], [s * wx(1.37), 1.37, -1.2], [s * wx(1.37), 1.37, -0.37], out),
      "#ffffff",
      { at: [0, 0, 0], texture: NET_R, name: "netRear" },
    );
  }

  // roll cage (visible through the nets)
  const cage = (pts: V3[], r = 0.022) => S(pts, r, STEEL);
  cage([[0.62, 0.36, -0.62], [0.62, 1.355, -0.62], [-0.62, 1.355, -0.62], [-0.62, 0.36, -0.62]]);
  cage([[0.62, 0.36, 0.5], [0.63, 1.0, 0.5], [0.6, 1.358, 0.14], [-0.6, 1.358, 0.14], [-0.63, 1.0, 0.5], [-0.62, 0.36, 0.5]]);
  for (const { s } of sides) {
    cage([[s * 0.63, 1.356, 0.14], [s * 0.63, 1.356, -0.62]]);
    cage([[s * 0.63, 1.356, -0.62], [s * 0.64, 1.22, -1.5]]);
    cage([[s * 0.62, 0.62, 0.5], [s * 0.64, 1.0, -0.4]], 0.018);
    cage([[s * 0.62, 1.0, 0.5], [s * 0.64, 0.62, -0.4]], 0.018);
    cage([[s * 0.62, 0.5, -0.62], [s * 0.64, 1.22, -1.5]], 0.018);
  }
  cage([[0.62, 0.36, -0.62], [-0.62, 1.355, -0.62]], 0.018);
  cage([[-0.62, 0.36, -0.62], [0.62, 1.355, -0.62]], 0.018);

  // seats and harness
  for (const { s } of sides) {
    const sx = s * 0.36;
    P(box(0.46, 0.12, 0.5), NAVY_L, { at: [sx, 0.46, -0.1], flat: true, name: "seatBase" });
    P(box(0.5, 0.64, 0.14), NAVY_L, { at: [sx, 0.82, -0.4], rotation: [-10, 0, 0], flat: true, name: "seatBack" });
    P(box(0.2, 0.2, 0.1), NAVY, { at: [sx, 1.2, -0.46], rotation: [-8, 0, 0], flat: true, name: "headrest" });
    for (const bx of [-1, 1]) {
      P(box(0.05, 0.4, 0.22), NAVY, { at: [sx + bx * 0.25, 0.8, -0.34], rotation: [-10, 0, bx * 6], flat: true, name: "bolster" });
      P(box(0.05, 0.1, 0.4), NAVY, { at: [sx + bx * 0.25, 0.5, -0.1], flat: true, name: "bolsterBase" });
      R([sx + bx * 0.12, 1.2, -0.42], [sx + bx * 0.05, 0.62, -0.34], 0.02, MAG);
    }
    glow(R([sx - 0.22, 0.54, -0.36], [sx + 0.22, 0.54, -0.36], 0.008, CYAN), 1.2);
    // harness belts across the shoulders
    R([sx + 0.12, 1.14, -0.43], [sx + 0.03, 0.9, -0.33], 0.02, MAG);
    R([sx - 0.12, 1.14, -0.43], [sx - 0.03, 0.9, -0.33], 0.02, MAG);
  }
  // steering column and wheel
  R([0.36, 0.78, 0.46], [0.36, 0.92, 0.3], 0.03, NAVY);
  b.part(new THREE.TorusGeometry(0.14, 0.02, 6, 14), NAVY_L, { bone: steeringWheel, at: [0.36, 0.93, 0.3], dir: [0, 0.35, -1], axis: "z", name: "steeringRim" });
  b.part(box(0.04, 0.26, 0.03), NAVY_L, { bone: steeringWheel, at: [0.36, 0.93, 0.3], dir: [0, 0.35, -1], axis: "z", name: "steeringSpoke" });
  b.part(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 8), GOLD, { bone: steeringWheel, at: [0.36, 0.93, 0.3], dir: [0, 0.35, -1], name: "steeringHub" });
  // extinguisher and battery in the rear
  P(new THREE.CylinderGeometry(0.06, 0.06, 0.34, 8), MAG, { at: [-0.5, 0.555, -0.98], name: "extinguisher" });
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 6), GOLD, { at: [-0.5, 0.744, -0.98], name: "extNozzle" });
  P(box(0.3, 0.22, 0.2), NAVY, { at: [0.42, 0.5, -1.2], name: "battery" });
  P(box(0.3, 0.02, 0.2), GOLD_D, { at: [0.42, 0.62, -1.2], name: "batteryTop" });

  // ================================================================================================================
  // HOOD
  // ================================================================================================================
  const hoodY: V3 = [0, -0.145, 1];
  b.extrude(
    [
      [-0.64, 0],
      [0.64, 0],
      [0.66, 0.6],
      [0.58, 1.1],
      [0.0, 1.42, "sharp"],
      [-0.58, 1.1],
      [-0.66, 0.6],
    ],
    { bone: hood, at: [0, 0.975, 0.62], x: [1, 0, 0], y: hoodY, thickness: 0.05, bevel: 0.012, color: bodyPaint, name: "hoodPanel" },
  );
  // hood scoop with glowing inlet
  b.extrude(
    [
      [-0.5, 0],
      [0.0, 0.1, "sharp"],
      [0.0, 0],
    ],
    { bone: hood, at: [0, 0.94, 1.52], thickness: [0.3, 0.22], bevel: 0.008, color: NAVY_L, name: "hoodScoop" },
  );
  glow(b.part(box(0.2, 0.05, 0.014), CYAN, { bone: hood, at: [0, 0.975, 1.53], name: "hoodInlet" }), 1.4);
  // hood vents: louvres each side
  for (const { s } of sides)
    for (let i = 0; i < 4; i++) {
      const z = 0.95 + i * 0.1;
      const y = 0.975 - 0.145 * (z - 0.62) + 0.028;
      b.part(box(0.26, 0.016, 0.035), NAVY, { bone: hood, at: [s * 0.4, y, z], rotation: [-8, -s * 14, 0], name: "louvre" });
      glow(b.part(box(0.2, 0.006, 0.012), CYAN_D, { bone: hood, at: [s * 0.4, y + 0.01, z + 0.014], rotation: [-8, -s * 14, 0], name: "louvreGlow" }), 1.1);
    }
  // hood pins
  for (const [x, z] of [
    [0.45, 0.78],
    [-0.45, 0.78],
    [0.3, 1.7],
    [-0.3, 1.7],
  ] as const) {
    const y = 0.975 - 0.145 * (z - 0.62) + 0.03;
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.045, 6), STEEL, { bone: hood, at: [x, y, z], name: "hoodPin" });
    b.part(new THREE.TorusGeometry(0.03, 0.005, 4, 8), STEEL, { bone: hood, at: [x + 0.03, y + 0.02, z], rotation: [80, 0, 0], name: "pinLoop" });
  }
  // fender gap lines
  for (const { s } of sides) b.rod([s * 0.655, 1.0, 0.62], [s * 0.655, 0.865, 1.9], 0.006, { bone: hood, color: NAVY });

  // ================================================================================================================
  // DOORS
  // ================================================================================================================
  for (const { s, k } of sides) {
    const dj = doorJ[k];
    const xo = s * 0.865;
    b.extrude(
      [
        [0.55, 0.42],
        [0.55, 1.03],
        [-0.2, 1.04],
        [-0.54, 1.03],
        [-0.5, 0.42],
      ],
      { bone: dj, at: [xo, 0, 0], thickness: 0.06, bevel: 0.015, color: bodyPaint, name: `door${k}` },
    );
    // belt trim and window frame rail
    b.rod([s * 0.9, 1.035, 0.54], [s * 0.9, 1.04, -0.53], 0.016, { bone: dj, color: GOLD });
    b.rod([s * 0.9, 0.44, 0.54], [s * 0.9, 0.44, -0.49], 0.014, { bone: dj, color: GOLD_D });
    // seam lines
    b.rod([s * 0.9, 0.43, 0.545], [s * 0.9, 1.02, 0.545], 0.007, { bone: dj, color: NAVY });
    b.rod([s * 0.9, 0.43, -0.5], [s * 0.9, 1.02, -0.535], 0.007, { bone: dj, color: NAVY });
    // handle
    b.part(box(0.02, 0.04, 0.16), GOLD, { bone: dj, at: [s * 0.915, 0.96, -0.36], name: "handle" });
    b.part(box(0.026, 0.05, 0.04), NAVY, { bone: dj, at: [s * 0.91, 0.96, -0.28], name: "handleBase" });
    // number roundel
    b.part(new THREE.PlaneGeometry(0.34, 0.34), "#ffffff", {
      bone: dj,
      at: [s * 0.9, 0.72, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      texture: ROUNDEL,
      name: "roundel",
    });
    // side-skirt dart (gold blade on the sill)
    b.extrude(
      [
        [0.52, 0],
        [-0.46, 0],
        [-0.52, 0.08, "sharp"],
        [0.4, 0.06],
      ],
      { bone: dj, at: [s * 0.9, 0.38, 0], thickness: 0.03, bevel: 0.006, color: NAVY, name: "skirt" },
    );
    glow(b.rod([s * 0.92, 0.395, 0.45], [s * 0.92, 0.395, -0.4], 0.01, { bone: dj, color: CYAN }), 1.4);
    // mirror
    b.rod([s * 0.86, 1.04, 0.45], [s * 0.92, 1.1, 0.4], 0.014, { bone: dj, color: NAVY });
    b.part(box(0.07, 0.1, 0.17), BLUE_D, { bone: dj, at: [s * 0.96, 1.13, 0.4], rotation: [0, 0, s * 6], flat: true, name: "mirror" });
    b.part(box(0.01, 0.075, 0.14), STEEL, { bone: dj, at: [s * 0.96, 1.13, 0.405], name: "mirrorGlass" });
    glow(b.part(box(0.012, 0.012, 0.1), CYAN, { bone: dj, at: [s * 0.995, 1.09, 0.4], name: "mirrorLight" }), 1.4);
    // fuel cap on right rear quarter handled below
  }

  // ================================================================================================================
  // HATCH, tail, wing
  // ================================================================================================================
  b.slab(
    [
      [0.7, 1.05, -1.88],
      [-0.7, 1.05, -1.88],
      [-0.6, 1.385, -1.2],
      [0.6, 1.385, -1.2],
    ],
    { bone: hatch, color: defrostPaint, thickness: 0.02, name: "rearGlass" },
  );
  b.extrude(
    [
      [-0.7, 0.8],
      [0.7, 0.8],
      [0.7, 1.04],
      [-0.7, 1.04],
    ],
    { bone: hatch, at: [0, 0, -1.94], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.07, bevel: 0.012, color: bodyPaint, name: "hatchPanel" },
  );
  b.part(new THREE.PlaneGeometry(0.34, 0.075), "#ffffff", {
    bone: hatch,
    at: [0, 0.9, -1.98],
    dir: [0, 0, -1],
    axis: "z",
    texture: PLATE,
    name: "plateR",
  });
  b.part(new THREE.PlaneGeometry(0.4, 0.1), "#ffffff", { bone: hatch, at: [0, 1.0, -1.981], dir: [0, 0, -1], axis: "z", texture: SLASH, name: "hatchSlash" });
  glow(b.rod([-0.5, 1.045, -1.92], [0.5, 1.045, -1.92], 0.01, { bone: hatch, color: CYAN }), 1.3);
  b.rod([0.7, 1.05, -1.88], [-0.7, 1.05, -1.88], 0.02, { bone: hatch, color: NAVY });
  b.rod([0.6, 1.385, -1.2], [-0.6, 1.385, -1.2], 0.022, { bone: hatch, color: NAVY });
  glow(b.rod([-0.34, 1.372, -1.226], [0.34, 1.372, -1.226], 0.012, { bone: hatch, color: TAIL }), 1.6);
  b.rod([0.0, 1.088, -1.84], [0.46, 1.16, -1.72], 0.008, { bone: hatch, color: NAVY });
  b.part(new THREE.SphereGeometry(0.02, 6, 4), NAVY, { bone: hatch, at: [0.0, 1.088, -1.84], name: "wiperPivot" });
  // tail lights: angular slashes
  for (const { s } of sides) {
    b.slab([[s * 0.34, 0.64, -2.04], [s * 0.82, 0.7, -2.04], [s * 0.82, 0.82, -2.04], [s * 0.34, 0.74, -2.04]], { bone: chassis, color: NAVY, thickness: 0.03, name: "tailHousing" });
    glow(b.slab([[s * 0.4, 0.67, -2.06], [s * 0.78, 0.72, -2.06], [s * 0.78, 0.79, -2.06], [s * 0.4, 0.73, -2.06]], { bone: chassis, color: TAIL, thickness: 0.016, name: "tailLamp" }), 1.8);
    glow(b.slab([[s * 0.4, 0.64, -2.06], [s * 0.6, 0.66, -2.06], [s * 0.6, 0.675, -2.06], [s * 0.4, 0.655, -2.06]], { bone: chassis, color: MAG, thickness: 0.016, name: "tailAccent" }), 1.4);
  }
  // rear bumper valance, diffuser fins, exhaust, tow loop
  X(
    [
      [-0.84, -1.75],
      [0.84, -1.75],
      [0.9, -1.98],
      [0.7, -2.12, "sharp"],
      [-0.7, -2.12, "sharp"],
      [-0.9, -1.98],
    ],
    { at: [0, 0.31, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.05, bevel: 0.01, color: NAVY, name: "rearValance" },
  );
  for (let i = -3; i <= 3; i++)
    X(
      [
        [-0.12, 0],
        [0.0, 0.0],
        [0.0, 0.14],
      ],
      { at: [i * 0.11, 0.33, -2.02], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, color: NAVY_L, name: "diffFin" },
    );
  for (const [x, y] of [[0.44, 0.42]] as const) {
    L(
      [
        [0.0, -0.14],
        [0.05, -0.14],
        [0.058, 0.1],
        [0.0, 0.1],
      ],
      { at: [x, y, -2.02], axis: [0, 0, -1], segments: 8, color: STEEL, name: "exhaust" },
    );
    L(
      [
        [0.0, 0.09],
        [0.045, 0.09],
        [0.045, 0.1],
        [0.0, 0.1],
      ],
      { at: [x, y, -2.02], axis: [0, 0, -1], segments: 8, color: NAVY, name: "exhaustMouth" },
    );
  }
  S([[0.55, 0.42, -2.03], [0.62, 0.34, -2.12], [0.7, 0.42, -2.06]], 0.014, MAG, { caps: "round" });
  S([[-0.55, 0.42, -2.03], [-0.62, 0.34, -2.12], [-0.7, 0.42, -2.06]], 0.014, MAG, { caps: "round" });
  // fuel cap
  P(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 8), GOLD, { at: [-0.855, 0.92, -1.62], dir: [-1, 0, 0], name: "fuelCap" });
  P(new THREE.CylinderGeometry(0.03, 0.03, 0.026, 6), NAVY, { at: [-0.862, 0.92, -1.62], dir: [-1, 0, 0], name: "fuelCapCore" });

  // wing: pylons, main plane, flap, end blades
  for (const { s } of sides)
    X(
      [
        [-1.8, 1.0],
        [-1.97, 1.0],
        [-1.94, 1.5],
        [-1.84, 1.5],
      ],
      { at: [s * 0.62, 0, 0], thickness: 0.055, bevel: 0.01, color: GOLD, name: "pylon" },
    );
  X(
    [
      [0.28, 0],
      [0.2, 0.045],
      [0.0, 0.07],
      [-0.1, 0.065],
      [-0.1, -0.015],
      [0.12, -0.02],
    ],
    { at: [0, WING.y, WING.z], thickness: 1.92, bevel: 0.006, color: wingPaint, name: "wingPlane" },
  );
  b.extrude(
    [
      [0.0, 0.0],
      [-0.2, -0.03],
      [-0.22, -0.06],
      [0.0, -0.075],
    ],
    { bone: wingFlap, at: [0, WING.y + 0.065, WING.z - 0.1], thickness: 1.92, bevel: 0.004, color: wingPaint, name: "wingFlap" },
  );
  for (const { s } of sides) {
    X(
      [
        [0.34, -0.14],
        [0.36, 0.08],
        [0.12, 0.12],
        [-0.22, 0.3, "sharp"],
        [-0.42, 0.32, "sharp"],
        [-0.34, 0.0],
        [-0.26, -0.14],
      ],
      { at: [s * 0.97, WING.y, WING.z], thickness: 0.03, bevel: 0.008, color: paint((_p, n, c) => (Math.abs(n.x) < 0.5 ? GOLD : c[0] < -0.1 && c[1] > 0.08 ? MAG : c[1] < -0.05 ? NAVY : BLUE)), name: "endBlade" },
    );
    glow(R([s * 0.99, WING.y + 0.1, WING.z + 0.1], [s * 0.99, WING.y + 0.27, WING.z - 0.2], 0.01, CYAN), 1.5);
    glow(R([s * 0.99, WING.y - 0.02, WING.z + 0.33], [s * 0.99, WING.y + 0.08, WING.z + 0.15], 0.01, CYAN), 1.3);
  }

  // underglow strips along the sills
  for (const { s } of sides) glow(R([s * 0.7, 0.27, 0.66], [s * 0.7, 0.27, -0.68], 0.014, CYAN), 1.6);

  // drivetrain under the plate: shaft, diffs, muffler
  R([0, 0.235, -1.2], [0, 0.235, 1.2], 0.035, STEEL_D);
  for (const z of [FZ, RZ]) {
    P(new THREE.SphereGeometry(0.1, 8, 6), GOLD_D, { at: [0, 0.24, z], scale: [1.5, 0.9, 1], name: "diff" });
    R([-0.3, 0.24, z], [0.3, 0.24, z], 0.02, STEEL_D);
  }
  L(
    [
      [0, 0],
      [0.08, 0],
      [0.1, 0.12],
      [0.1, 0.78],
      [0.08, 0.9],
      [0, 0.9],
    ],
    { at: [0.44, 0.235, -0.95], axis: [0, 0, -1], segments: 10, color: STEEL, name: "muffler" },
  );
  R([0.44, 0.235, -1.85], [0.44, 0.38, -2.0], 0.04, STEEL_D);

  // cyan light lines inside each wheel arch
  for (const { s } of sides)
    for (const zz of [FZ, RZ]) {
      const arcPts: V3[] = [];
      for (let i = 0; i <= 12; i++) {
        const a = ((-10 + (200 * i) / 12) * Math.PI) / 180;
        arcPts.push([s * 0.72, WY + (ARCH_R - 0.012) * Math.sin(a), zz + (ARCH_R - 0.012) * Math.cos(a)]);
      }
      glow(S(arcPts, 0.008, CYAN, { caps: "round" }), 1.3);
    }

  // fender blades
  for (const { s } of sides) {
    X(
      [
        [1.64, 0.92],
        [1.25, 1.04],
        [0.72, 1.26, "sharp"],
        [0.92, 1.02],
        [1.2, 0.98],
      ],
      { at: [s * 0.8, 0, 0], thickness: 0.03, bevel: 0.006, color: GOLD, name: "fenderBlade" },
    );
    glow(R([s * 0.8, 1.045, 1.24], [s * 0.8, 1.25, 0.74], 0.008, CYAN), 1.4);
    P(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", { at: [s * 0.847, 0.66, -1.84], dir: [s, 0, 0], axis: "z", texture: VENT, name: "quarterVent" });
  }

  // front tow loop
  for (const s of [1, -1]) S([[s * 0.5, 0.36, 2.1], [s * 0.52, 0.29, 2.17], [s * 0.64, 0.29, 2.17], [s * 0.66, 0.36, 2.1]], 0.016, MAG, { caps: "round" });

  // antenna
  R([-0.5, ROOF + 0.02, -1.15], [-0.5, ROOF + 0.2, -1.17], [0.012, 0.005], STEEL);
  P(new THREE.SphereGeometry(0.018, 6, 4), MAG, { at: [-0.5, ROOF + 0.21, -1.17], name: "antennaTip" });

  // wrap unused helper references
  void [WHITE, CYAN_D, BLUE_D, catmull, polyline, plankPaint];

  return b.root;
}
