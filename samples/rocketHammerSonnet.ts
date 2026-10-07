import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { glow } from "../kits/glow";
import { aim } from "../src/math";
import { catmull } from "../src/path";
import { mix, noise, paint, smoothstep } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Thunderclap Rocket Hammer",
  description:
    "A rocket-boosted siege war hammer on a display stand: pale armour plates on a navy frame, a piston striker face, a big gimballed thruster bell with flame, two side booster pods, fuel tank with glowing gauge, hoses, trigger and wrist strap. Overwatch-style clean bevels, panel lines and one orange accent.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const PALE = "#e9eef3";
const PALE_SH = "#c3cddb";
const SEAM = "#8794a8";
const STEEL = "#8696ab";
const STEEL_L = "#b3c0d1";
const STEEL_D = "#4d5b6e";
const NAVY = "#243249";
const NAVY_D = "#161f30";
const GUN = "#30363f";
const GUN_L = "#4b535f";
const BLACK = "#11151b";
const RUBBER = "#1f242c";
const RUBBER_L = "#313945";
const ORANGE = "#ff7a14";
const ORANGE_D = "#c24a08";
const AMBER = "#ffb02e";
const YELLOW = "#ffd84d";
const HOT = "#fff3d0";

// ---------------------------------------------------------------- geometry helpers
const HY = 1.6; // head centre height
const rbox = (w: number, h: number, d: number, r = 0.008, seg = 1) => new RoundedBoxGeometry(w, h, d, seg, r);
const near = (v: number, c: number, w: number) => Math.abs(v - c) < w;
const fract = (v: number) => v - Math.floor(v);

// ---------------------------------------------------------------- paints (all in model space, so panel lines continue across parts)
const pale = (p: THREE.Vector3) => mix(PALE, PALE_SH, smoothstep(0.5, 0.85, noise(p, 0.07, 7)) * 0.65);

const headPaint = paint((p, n) => {
  const x = p.x;
  const y = p.y - HY;
  const z = p.z;
  if (Math.abs(n.z) > 0.7) return n.z > 0 ? NAVY_D : GUN;
  if (n.y > 0.7) {
    if (Math.abs(x) < 0.02) return ORANGE;
    if (near(Math.abs(x), 0.0, 0.026) && Math.abs(x) >= 0.02) return NAVY_D;
    if (near(z, -0.09, 0.003) || near(z, 0.11, 0.003) || near(Math.abs(x), 0.115, 0.003)) return SEAM;
    return pale(p);
  }
  if (n.y < -0.7) return GUN;
  // sides: navy underlay with pale lower seam
  if (near(y, -0.1, 0.004)) return ORANGE_D;
  return y < -0.1 ? NAVY_D : NAVY;
});

const platePaint = paint((p, n) => {
  const y = p.y - HY;
  const z = p.z;
  if (Math.abs(n.x) < 0.7) return PALE_SH;
  if (y < -0.105) return NAVY_D;
  if (near(y, -0.1, 0.004)) return ORANGE;
  if (near(z, 0.125, 0.0025) || near(z, -0.075, 0.0025) || near(y, 0.0, 0.0025 * (z > 0.125 ? 1 : 0))) return SEAM;
  // orange blaze at the rear top corner
  if (z < -0.075 && y > 0.045) {
    if (near(y, 0.045, 0.004)) return ORANGE_D;
    return ORANGE;
  }
  if (z > 0.125 && y < 0.0) return PALE_SH;
  return mix(pale(p), PALE_SH, smoothstep(-0.0, -0.1, y) * 0.55);
});

const crestPaint = paint((p, n, s) => {
  const z = s[0];
  const y = s[1];
  if (Math.abs(n.x) < 0.5) return NAVY;
  if (y > 0.0 && near(y, 0.04, 0.005)) return SEAM;
  if (z < -0.12 && y > 0.05) return ORANGE;
  if (near(z, -0.12, 0.003)) return ORANGE_D;
  return pale(p);
});

const ventPaint = paint((p, n) => {
  if (n.y < 0.5) return NAVY_D;
  return fract(p.z / 0.03) < 0.35 ? NAVY : PALE;
});

const strikerPaint = paint((p, n) => {
  const x = p.x;
  const y = p.y - HY;
  const r = Math.hypot(x, y);
  if (n.z > 0.75 && p.z > 0.46) {
    if (near(r, 0.233, 0.008)) return ORANGE;
    if (r > 0.215) return STEEL_D;
    if (near(r, 0.178, 0.005)) return ORANGE;
    if (near(r, 0.194, 0.004)) return GUN;
    if (r < 0.165) {
      const u = fract((x + y) / 0.024);
      const v = fract((x - y) / 0.024);
      if (u < 0.12 || v < 0.12) return STEEL_D;
      return (Math.floor((x + y) / 0.024) + Math.floor((x - y) / 0.024)) % 2 === 0 ? STEEL_L : STEEL;
    }
    return STEEL;
  }
  // rim / sides
  if (near(p.z, 0.43, 0.01)) return ORANGE;
  if (p.z < 0.41) return GUN;
  return p.z > 0.455 ? STEEL_L : STEEL;
});

const bellPaint = paint((p) => {
  const d = -0.4 - p.z; // metres behind the throat
  const r = Math.hypot(p.x, p.y - HY);
  if (d > 0.245) return ORANGE; // lip
  if (d < 0.0) return GUN;
  if (r < 0.15 + d * 0.15 - 0.012 && d > 0.02) {
    // inner wall: heat-stained
    return d < 0.1 ? "#7a3410" : d < 0.18 ? "#4a2a22" : GUN_L;
  }
  return near(d, 0.12, 0.006) || near(d, 0.2, 0.006) ? STEEL_D : GUN;
});

const chamberPaint = paint((p, n) => {
  const d = -0.26 - p.z;
  if (Math.abs(n.z) > 0.7) return GUN;
  if (near(d, 0.035, 0.012) || near(d, 0.1, 0.012)) return ORANGE;
  const a = Math.atan2(p.x, p.y - HY);
  return fract(a / (Math.PI / 6) + 0.5) < 0.08 ? BLACK : d < 0.0 ? NAVY : GUN_L;
});

const podPaint = paint((p) => {
  const d = 0.17 - p.z;
  if (d < 0.1) return ORANGE;
  if (near(d, 0.1, 0.006)) return ORANGE_D;
  if (d > 0.05 && near(d, 0.205, 0.012)) return NAVY_D;
  if (near(d, 0.3, 0.007)) return ORANGE;
  return PALE;
});

const gripPaint = paint((p) => {
  const y = p.y;
  if (y < 0.425 || y > 0.835) return ORANGE;
  if (y > 0.6 && y < 0.67) {
    if (near(y, 0.635, 0.004)) return ORANGE;
    return near(y, 0.617, 0.002) || near(y, 0.653, 0.002) ? SEAM : PALE;
  }
  const a = Math.atan2(p.x, p.z);
  const u = fract((a / (Math.PI * 2)) * 8 + y / 0.045);
  const v = fract((a / (Math.PI * 2)) * 8 - y / 0.045);
  if (u < 0.16 || v < 0.16) return RUBBER_L;
  return RUBBER;
});

const tankPaint = paint((p) => {
  const y = p.y;
  if (y < 1.062 || y > 1.278) return ORANGE;
  if (near(y, 1.07, 0.006) || near(y, 1.27, 0.006)) return NAVY_D;
  if (near(y, 1.17, 0.003)) return SEAM;
  return pale(p);
});

const shaftPaint = paint((p) => (near(p.y, 1.37, 0.012) || near(p.y, 1.325, 0.006) ? ORANGE : fract(p.y / 0.06) < 0.12 ? GUN_L : GUN));

const baseWallPaint = paint((p, n) => {
  if (n.y > 0.5) return NAVY;
  const a = Math.atan2(p.x, p.z);
  return near(fract(a / (Math.PI / 4) + 0.5), 0.5, 0.02) ? ORANGE_D : NAVY_D;
});

const baseTopPaint = paint((p, n) => {
  const r = Math.hypot(p.x, p.z);
  if (n.y < 0.5) return NAVY_D;
  const a = Math.atan2(p.x, p.z);
  if (r > 0.335 && r < 0.4) return fract((a / Math.PI) * 12) < 0.5 ? ORANGE : NAVY_D;
  if (near(r, 0.32, 0.004)) return STEEL;
  if (r < 0.3) {
    // hex-ish deck seams
    if (near(fract(p.x / 0.1), 0.0, 0.02) || near(fract(p.z / 0.1), 0.0, 0.02)) return GUN_L;
    return GUN;
  }
  return GUN;
});

const housingPaint = paint((p, n) => {
  if (n.z > 0.7 && near(p.x, 0, 0.005)) return ORANGE;
  return n.y > 0.7 ? NAVY : near(p.y, 0.975, 0.004) ? ORANGE_D : PALE_SH;
});

// ---------------------------------------------------------------- textures
const GAUGE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#f4f1e6"/>
  <path d="M 50 50 L 17 77 A 48 48 0 0 1 8 56 Z" fill="#ffb02e" opacity="0"/>
  <path d="M 78 20 A 40 40 0 0 1 90 50" fill="none" stroke="#e5551a" stroke-width="9"/>
  <path d="M 20 78 A 40 40 0 0 1 12 55" fill="none" stroke="#2f4e86" stroke-width="9"/>
  ${[...Array(9)]
    .map((_, i) => {
      const a = (-135 + i * 33.75) * (Math.PI / 180);
      const x1 = 50 + Math.sin(a) * 33;
      const y1 = 50 - Math.cos(a) * 33;
      const x2 = 50 + Math.sin(a) * 42;
      const y2 = 50 - Math.cos(a) * 42;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#1a2233" stroke-width="3"/>`;
    })
    .join("")}
  <line x1="50" y1="50" x2="71" y2="29" stroke="#c4300c" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="9" fill="#243249"/>
  <circle cx="50" cy="50" r="3.5" fill="#ff7a14"/>
  <rect x="38" y="66" width="24" height="9" rx="3" fill="#243249"/>
  </svg>`,
  { size: 192 },
);

const CHEVRONS = svg(
  `<svg viewBox="0 0 120 20"><rect width="120" height="20" fill="#161f30"/>
  ${[...Array(10)]
    .map((_, i) => `<polygon points="${i * 12 - 4},20 ${i * 12 + 2},20 ${i * 12 + 12},0 ${i * 12 + 6},0" fill="#ff7a14"/>`)
    .join("")}
  <rect width="120" height="2.2" fill="#e9eef3"/><rect y="17.8" width="120" height="2.2" fill="#e9eef3"/>
  </svg>`,
  { size: 512 },
);

const PLAQUE = svg(
  `<svg viewBox="0 0 120 24"><rect width="120" height="24" rx="3" fill="#161f30"/>
  <rect x="1.5" y="1.5" width="117" height="21" rx="2.5" fill="none" stroke="#ff7a14" stroke-width="1.6"/>
  <g transform="translate(10 12) rotate(45)">
    <path d="M -9 -2.2 L 3 -2.2 L 9 0 L 3 2.2 L -9 2.2 Z" fill="#e9eef3"/>
    <path d="M -9 -2.2 L -13 -4.5 L -13 4.5 L -9 2.2 Z" fill="#ff7a14"/>
    <circle cx="0" cy="0" r="1.1" fill="#243249"/>
  </g>
  <rect x="26" y="6" width="58" height="3.2" fill="#e9eef3"/>
  <rect x="26" y="11.2" width="40" height="2.4" fill="#8696ab"/>
  <rect x="26" y="15.6" width="48" height="2.4" fill="#8696ab"/>
  <rect x="92" y="5" width="3" height="14" fill="#ff7a14"/><rect x="98" y="5" width="3" height="14" fill="#ff7a14"/><rect x="104" y="5" width="3" height="14" fill="#ff7a14"/>
  </svg>`,
  { size: 512 },
);

const WARN = svg(
  `<svg viewBox="0 0 40 40"><polygon points="20,3 38,35 2,35" fill="#ff7a14" stroke="#161f30" stroke-width="3" stroke-linejoin="round"/>
  <rect x="18" y="14" width="4" height="12" rx="1" fill="#161f30"/><rect x="18" y="28" width="4" height="4" rx="1" fill="#161f30"/></svg>`,
  { size: 160 },
);

export default function build() {
  const b = createBuilder({ name: "rocketHammer", paintSize: 2048 });

  // ---------------------------------------------------------------- skeleton
  const stand = b.joint("stand", { at: [0, 0.05, 0], dir: [0, 1, 0] });
  const H = b.joint("hammer", { parent: stand, at: [0, 0.25, 0], dir: [0, 1, 0] });
  const trigger = b.joint("trigger", { parent: H, at: [0, 0.995, 0.062], dir: [0, -1, 0.35], role: "hinge" });
  const safety = b.joint("safety", { parent: H, at: [0.032, 0.99, 0.0], dir: [0, 0, 1], role: "hinge" });
  const valve = b.joint("valve", { parent: H, at: [0.098, 1.17, 0], dir: [1, 0, 0], role: "hinge" });
  const nozzle = b.joint("nozzle", { parent: H, at: [0, HY, -0.4], dir: [0, 0, -1], role: "hinge" });
  const ventL = b.joint("ventL", { parent: H, at: [0.085, HY + 0.18, -0.205], dir: [0, 0, 1], role: "hinge" });
  const ventR = b.joint("ventR", { parent: H, at: [-0.085, HY + 0.18, -0.205], dir: [0, 0, 1], role: "hinge" });
  const strap = b.joint("strap", { parent: H, at: [0.07, 0.37, 0], dir: [1, -0.4, 0], role: "hinge" });

  type Opt = Record<string, unknown>;
  const put = (geo: THREE.BufferGeometry, color: string | Paint, at: [number, number, number], o: Opt = {}) =>
    b.part(geo, color, { bone: H, at, ...o });
  const lat = (outline: OutlinePoint[], color: string | Paint, at: [number, number, number], o: Opt = {}) =>
    b.lathe(outline, { bone: H, color, at, ...o });

  // bolts: merged per colour
  const boltGeos: Record<string, THREE.BufferGeometry[]> = {};
  let boltOwner = "stand|";
  const bolt = (color: string, pos: [number, number, number], dir: [number, number, number], r = 0.008) => {
    const g = new THREE.CylinderGeometry(r, r * 1.08, r * 0.8, 6);
    g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...pos), aim(dir), new THREE.Vector3(1, 1, 1)));
    (boltGeos[boltOwner + color] ??= []).push(g);
  };

  // ---------------------------------------------------------------- display stand
  lat(
    [
      [0, 0],
      [0.5, 0],
      [0.5, 0.075],
      [0.46, 0.095],
      [0, 0.095],
    ],
    baseWallPaint,
    [0, 0, 0],
    { bone: stand, segments: 8, spin: 22.5, name: "baseTier1" },
  );
  lat(
    [
      [0, 0.095],
      [0.41, 0.095],
      [0.41, 0.112],
      [0.385, 0.128],
      [0, 0.128],
    ],
    baseTopPaint,
    [0, 0, 0],
    { bone: stand, segments: 16, name: "baseTier2" },
  );
  glow(
    lat(
      [
        [0.3, 0.126],
        [0.314, 0.126],
        [0.314, 0.1325],
        [0.3, 0.1325],
      ],
      ORANGE,
      [0, 0, 0],
      { bone: stand, segments: 32, name: "baseGlowRing" },
    ),
    1.1,
  );
  // pedestal cup
  lat(
    [
      [0, 0.128],
      [0.15, 0.128],
      [0.125, 0.15],
      [0.1, 0.205],
      [0.12, 0.215],
      [0.12, 0.25],
      [0.075, 0.255],
      [0.07, 0.232],
      [0, 0.232],
    ],
    paint((p) => (p.y > 0.21 ? STEEL : p.y < 0.15 ? NAVY_D : GUN)),
    [0, 0, 0],
    { bone: stand, segments: 12, name: "pedestal" },
  );
  // four clamp arms holding the pommel
  for (let k = 0; k < 4; k++) {
    const a = (45 + k * 90) * (Math.PI / 180);
    const radial: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
    b.extrude(
      [
        [0.1, 0.2],
        [0.15, 0.2],
        [0.15, 0.285],
        [0.12, 0.3],
        [0.098, 0.27],
      ],
      { at: [0, 0, 0], x: radial, y: [0, 1, 0], thickness: 0.026, bevel: 0.005, color: STEEL_D, bone: stand, name: "clampArm" },
    );
    bolt(ORANGE, [radial[0] * 0.152, 0.26, radial[2] * 0.152], radial, 0.011);
    b.part(new THREE.SphereGeometry(0.014, 6, 4), ORANGE, {
      bone: stand,
      at: [radial[0] * 0.125, 0.298, radial[2] * 0.125],
      name: "clampPad",
    });
  }
  // deck bolts
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22.5) * (Math.PI / 180);
    const bg = new THREE.CylinderGeometry(0.012, 0.013, 0.008, 6);
    bg.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(Math.sin(a) * 0.435, 0.099, Math.cos(a) * 0.435), aim([0, 1, 0]), new THREE.Vector3(1, 1, 1)));
    (boltGeos[boltOwner + (k % 2 ? ORANGE : STEEL_L)] ??= []).push(bg);
  }
  // plaque
  b.part(new THREE.PlaneGeometry(0.3, 0.06), "#ffffff", {
    bone: stand,
    at: [0, 0.04, 0.4625],
    dir: [0, 0, 1],
    axis: "z",
    texture: PLAQUE,
    name: "plaque",
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    bone: stand,
    at: [0.24, 0.04, 0.422],
    dir: [Math.sin(Math.PI / 4) * 0.55, 0, 0.84],
    axis: "z",
    texture: WARN,
    name: "warnL",
  });
  b.part(new THREE.PlaneGeometry(0.05, 0.05), "#ffffff", {
    bone: stand,
    at: [-0.24, 0.04, 0.422],
    dir: [-Math.sin(Math.PI / 4) * 0.55, 0, 0.84],
    axis: "z",
    texture: WARN,
    name: "warnR",
  });

  // ---------------------------------------------------------------- haft
  boltOwner = "hammer|";
  // pommel + butt
  lat(
    [
      [0, 0.245],
      [0.042, 0.245],
      [0.062, 0.262],
      [0.064, 0.3],
      [0.084, 0.33],
      [0.09, 0.372],
      [0.07, 0.398],
      [0, 0.398],
    ],
    paint((p) => (near(p.y, 0.32, 0.007) || near(p.y, 0.378, 0.006) ? ORANGE : p.y < 0.275 ? GUN : NAVY)),
    [0, 0, 0],
    { segments: 10, name: "pommel" },
  );
  // grip
  lat(
    [
      [0, 0.398],
      [0.056, 0.398],
      [0.056, 0.42],
      [0.048, 0.436],
      [0.048, 0.598],
      [0.056, 0.606],
      [0.056, 0.664],
      [0.048, 0.672],
      [0.048, 0.826],
      [0.056, 0.842],
      [0.056, 0.862],
      [0, 0.862],
    ],
    gripPaint,
    [0, 0, 0],
    { segments: 12, name: "grip" },
  );
  // hand-stop guard
  lat(
    [
      [0, 0.858],
      [0.115, 0.858],
      [0.122, 0.874],
      [0.116, 0.898],
      [0.075, 0.918],
      [0, 0.918],
    ],
    paint((p, n) => (n.y > 0.6 ? (Math.hypot(p.x, p.z) > 0.1 ? ORANGE : PALE) : near(p.y, 0.878, 0.007) ? ORANGE_D : NAVY)),
    [0, 0, 0],
    { segments: 8, spin: 22.5, name: "guard" },
  );
  // upper shaft
  lat(
    [
      [0, 0.905],
      [0.044, 0.905],
      [0.044, 1.43],
      [0, 1.43],
    ],
    shaftPaint,
    [0, 0, 0],
    { segments: 10, name: "shaft" },
  );
  // trigger housing
  put(rbox(0.08, 0.08, 0.07, 0.012), housingPaint, [0, 0.968, 0.062], { name: "triggerHousing" });
  put(rbox(0.1, 0.028, 0.1, 0.01), NAVY, [0, 0.93, 0.0], { name: "housingCollar" });
  bolt(ORANGE, [0.0, 0.968, 0.0985], [0, 0, 1], 0.011);
  bolt(STEEL_L, [0.041, 0.99, 0.062], [1, 0, 0], 0.008);
  bolt(STEEL_L, [-0.041, 0.99, 0.062], [-1, 0, 0], 0.008);
  // trigger guard
  b.sweep(
    catmull([
      [0, 1.002, 0.098],
      [0, 0.975, 0.142],
      [0, 0.935, 0.136],
      [0, 0.915, 0.09],
      [0, 0.915, 0.04],
    ]),
    0.0095,
    { bone: H, color: NAVY, sides: 6, name: "triggerGuard" },
  );
  // trigger lever (hinged)
  b.extrude(
    [
      [0, 0.012],
      [0.02, 0.0],
      [0.034, -0.045],
      [0.048, -0.08],
      [0.032, -0.084],
      [0.012, -0.05],
      [-0.006, -0.012],
    ],
    {
      at: [0, 0.995, 0.078],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: 0.018,
      bevel: 0.003,
      smoothing: 1,
      color: ORANGE,
      bone: trigger,
      name: "triggerLever",
    },
  );
  // safety toggle
  b.rod([0.042, 0.99, 0.02], [0.082, 0.99, 0.05], 0.0065, { bone: safety, color: STEEL, sides: 6, name: "safetyLever" });
  b.part(new THREE.SphereGeometry(0.012, 6, 4), ORANGE, { bone: safety, at: [0.084, 0.99, 0.052], name: "safetyKnob" });
  put(new THREE.CylinderGeometry(0.013, 0.013, 0.01, 8), GUN, [0.042, 0.99, 0.02], { dir: [1, 0, 0], name: "safetyBoss" });

  // fuel tank
  lat(
    [
      [0, 1.04],
      [0.082, 1.04],
      [0.1, 1.058],
      [0.106, 1.078],
      [0.106, 1.262],
      [0.1, 1.282],
      [0.082, 1.3],
      [0, 1.3],
    ],
    tankPaint,
    [0, 0, 0],
    { segments: 12, name: "fuelTank" },
  );
  for (const y of [1.075, 1.265]) {
    lat(
      [
        [0.104, y - 0.01],
        [0.114, y - 0.01],
        [0.114, y + 0.01],
        [0.104, y + 0.01],
      ],
      NAVY_D,
      [0, 0, 0],
      { segments: 12, name: "tankStrap" },
    );
  }
  // windows front/back with glowing fuel bars
  for (const s of [1, -1]) {
    put(rbox(0.046, 0.2, 0.014, 0.004), NAVY_D, [0, 1.17, s * 0.103], { name: "gaugeFrame" });
    for (let i = 0; i < 6; i++) {
      const lit = i >= 2;
      const bar = put(rbox(0.034, 0.025, 0.006, 0.002), lit ? ORANGE : RUBBER_L, [0, 1.095 + i * 0.0325, s * 0.1095], { name: "fuelBar" });
      if (lit) glow(bar, 1.3);
    }
    put(rbox(0.012, 0.012, 0.004, 0.001), ORANGE_D, [0.03, 1.27, s * 0.1085], { name: "tankTick" });
    put(rbox(0.012, 0.012, 0.004, 0.001), ORANGE_D, [-0.03, 1.27, s * 0.1085], { name: "tankTick" });
  }
  // valve handwheel (spins on its joint)
  b.rod([0.1, 1.17, 0], [0.128, 1.17, 0], 0.012, { bone: H, color: STEEL_D, sides: 6, name: "valveStem" });
  b.part(new THREE.TorusGeometry(0.04, 0.0065, 5, 10), ORANGE, { bone: valve, at: [0.134, 1.17, 0], dir: [1, 0, 0], axis: "z", name: "valveRing" });
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.018, 8), STEEL, { bone: valve, at: [0.134, 1.17, 0], dir: [1, 0, 0], name: "valveHub" });
  for (let k = 0; k < 3; k++) {
    const a = (k * 60 + 15) * (Math.PI / 180);
    b.rod(
      [0.134, 1.17 + Math.cos(a) * 0.038, Math.sin(a) * 0.038],
      [0.134, 1.17 - Math.cos(a) * 0.038, -Math.sin(a) * 0.038],
      0.005,
      { bone: valve, color: ORANGE_D, sides: 5, name: "valveSpoke" },
    );
  }
  // upper collar rings
  lat(
    [
      [0.042, 1.316],
      [0.064, 1.316],
      [0.064, 1.332],
      [0.042, 1.332],
    ],
    NAVY,
    [0, 0, 0],
    { segments: 10, name: "shaftRing" },
  );
  lat(
    [
      [0.042, 1.352],
      [0.062, 1.352],
      [0.07, 1.372],
      [0.062, 1.392],
      [0.042, 1.392],
    ],
    paint((p) => (near(p.y, 1.372, 0.006) ? ORANGE : STEEL_D)),
    [0, 0, 0],
    { segments: 10, name: "shaftCollar" },
  );
  lat(
    [
      [0, 1.4],
      [0.08, 1.4],
      [0.105, 1.418],
      [0.105, 1.436],
      [0, 1.436],
    ],
    NAVY,
    [0, 0, 0],
    { segments: 8, spin: 22.5, name: "headSocket" },
  );
  // braces from haft collar to head
  for (let k = 0; k < 4; k++) {
    const a = k * 90 * (Math.PI / 180);
    b.extrude(
      [
        [0.07, 1.41],
        [0.16, 1.435],
        [0.07, 1.436],
      ],
      { at: [0, 0, 0], x: [Math.sin(a), 0, Math.cos(a)], y: [0, 1, 0], thickness: 0.02, bevel: 0.003, color: ORANGE, bone: H, name: "brace" },
    );
  }

  // hoses
  const hose = (pts: number[][], r = 0.015) => {
    const path = catmull(pts);
    const len = path.length;
    b.sweep(path, r, {
      bone: H,
      sides: 6,
      caps: "flat",
      color: paint((_p, _n, s) => (Math.floor((s[0] * len) / 0.011) % 2 ? RUBBER_L : RUBBER)),
      name: "hose",
    });
    for (const t of [0, 1]) {
      const at = path.at(t);
      const dir = path.tangentAt(t);
      put(new THREE.CylinderGeometry(r * 1.45, r * 1.45, 0.026, 8), ORANGE, [at.x, at.y, at.z], { dir: [dir.x, dir.y, dir.z], name: "hoseFitting" });
    }
  };
  hose([
    [0, 1.3, -0.03],
    [0, 1.36, -0.11],
    [0, 1.43, -0.2],
    [0, 1.468, -0.3],
  ]);
  for (const s of [1, -1]) {
    hose([
      [s * 0.074, 1.288, -0.04],
      [s * 0.12, 1.335, -0.07],
      [s * 0.2, 1.4, -0.12],
      [s * 0.258, 1.484, -0.12],
    ]);
  }

  // ---------------------------------------------------------------- head
  put(rbox(0.34, 0.34, 0.5, 0.03, 2), headPaint, [0, HY, 0], { name: "headCore" });
  // front & back plates
  put(rbox(0.3, 0.3, 0.03, 0.01), NAVY_D, [0, HY, 0.265], { name: "frontPlate" });
  put(rbox(0.3, 0.3, 0.03, 0.01), NAVY_D, [0, HY, -0.265], { name: "backPlate" });
  // front frame trim
  put(rbox(0.352, 0.036, 0.044, 0.008), PALE, [0, HY + 0.148, 0.24], { name: "frontTrimTop" });
  put(rbox(0.352, 0.036, 0.044, 0.008), NAVY, [0, HY - 0.148, 0.24], { name: "frontTrimBottom" });
  for (const s of [1, -1]) {
    put(rbox(0.036, 0.28, 0.044, 0.008), PALE_SH, [s * 0.158, HY, 0.24], { name: "frontTrimSide" });
    put(rbox(0.032, 0.30, 0.04, 0.008), NAVY, [s * 0.16, HY, -0.24], { name: "backTrimSide" });
  }
  // side armour plates
  for (const s of [1, -1]) {
    put(rbox(0.024, 0.3, 0.42, 0.007), platePaint, [s * 0.18, HY, 0.0], { name: "sidePlate" });
    // gauge
    lat(
      [
        [0.04, 0.0],
        [0.054, 0.0],
        [0.054, 0.013],
        [0.04, 0.013],
      ],
      STEEL_D,
      [s * 0.19, HY + 0.06, 0.04],
      { axis: [s, 0, 0], segments: 12, name: "gaugeBezel" },
    );
    b.part(new THREE.CircleGeometry(0.041, 14), "#ffffff", {
      bone: H,
      at: [s * 0.1925, HY + 0.06, 0.04],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: GAUGE,
      name: "gaugeDial",
    });
    // chevron strip
    b.part(new THREE.PlaneGeometry(0.22, 0.037), "#ffffff", {
      bone: H,
      at: [s * 0.1925, HY - 0.128, 0.0],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: CHEVRONS,
      name: "chevronStrip",
    });
    // status lights
    for (let i = 0; i < 3; i++) {
      const l = put(rbox(0.004, 0.016, 0.016, 0.0015), i === 2 ? HOT : ORANGE, [s * 0.1935, HY - 0.02, 0.1 + i * 0.03 - 0.0], {
        name: "statusLight",
      });
      glow(l, 1.2);
    }
    // plate bolts
    for (const [z, y] of [
      [0.19, 0.13],
      [0.19, -0.075],
      [-0.19, 0.13],
      [-0.19, -0.075],
      [0.0, 0.13],
      [0.0, -0.075],
    ] as const) {
      bolt(STEEL_L, [s * 0.192, HY + y, z], [s, 0, 0], 0.0075);
    }
    // pod clamp arms (plate to pod)
    for (const z of [-0.1, 0.07]) {
      put(rbox(0.07, 0.04, 0.034, 0.008), NAVY, [s * 0.226, HY - 0.05, z], { name: "podArm" });
    }
  }

  // top deck: intake grille, vents, crest
  put(rbox(0.2, 0.006, 0.19, 0.002), BLACK, [0, HY + 0.172, -0.115], { name: "intake" });
  for (const [s, j] of [
    [1, ventL],
    [-1, ventR],
  ] as const) {
    put(rbox(0.1, 0.012, 0.17, 0.004), ventPaint, [s * 0.085, HY + 0.186, -0.12], { bone: j, name: "ventFlap" });
    put(rbox(0.1, 0.01, 0.014, 0.003), ORANGE, [s * 0.085, HY + 0.18, -0.2], { bone: j, name: "ventHinge" });
  }
  b.extrude(
    [
      [0.22, 0.0],
      [0.17, 0.05],
      [0.02, 0.09],
      [-0.1, 0.19, "sharp"],
      [-0.24, 0.21, "sharp"],
      [-0.25, 0.0],
    ],
    { at: [0, HY + 0.166, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.032, bevel: 0.006, color: crestPaint, bone: H, name: "crest" },
  );
  glow(put(new THREE.SphereGeometry(0.018, 6, 4), ORANGE, [0, HY + 0.18, 0.2], { name: "crestLens" }), 1.4);
  put(rbox(0.04, 0.014, 0.05, 0.004), NAVY_D, [0, HY + 0.173, 0.2], { name: "lensMount" });
  // underside skid plates
  put(rbox(0.2, 0.012, 0.36, 0.004), GUN_L, [0, HY - 0.176, 0.0], { name: "skid" });
  put(rbox(0.3, 0.014, 0.1, 0.005), ORANGE_D, [0, HY - 0.176, 0.2], { name: "skidFront" });

  // fuel filler cap + relief valve on the top deck
  lat(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.01],
      [0.04, 0.02],
      [0.04, 0.026],
      [0, 0.026],
    ],
    paint((p, n) => (n.y > 0.8 ? (near(Math.hypot(p.x - 0.1, p.z - 0.1), 0.0, 0.012) ? STEEL_L : ORANGE) : NAVY)),
    [0.1, HY + 0.17, 0.1],
    { segments: 10, name: "fillerCap" },
  );
  put(rbox(0.07, 0.01, 0.014, 0.003), STEEL_D, [0.1, HY + 0.2, 0.1], { name: "capHandle" });
  lat(
    [
      [0, 0],
      [0.034, 0],
      [0.034, 0.012],
      [0.022, 0.03],
      [0.0, 0.034],
    ],
    paint((p, n) => (n.y > 0.5 ? STEEL_L : near(p.y, HY + 0.178, 0.004) ? ORANGE : GUN)),
    [-0.1, HY + 0.17, 0.1],
    { segments: 8, name: "reliefValve" },
  );
  for (const s of [1, -1]) {
    // plate vents + warning decal
    const slits = [0, 1, 2, 3].map((i) => new THREE.BoxGeometry(0.004, 0.03, 0.012).translate(s * 0.1935, HY - 0.128, -0.19 + i * 0.022));
    b.part(mergeGeometries(slits)!, BLACK, { bone: H, at: [0, 0, 0], name: "plateVents" });
    b.part(new THREE.PlaneGeometry(0.036, 0.036), "#ffffff", {
      bone: H,
      at: [s * 0.1925, HY - 0.128, 0.162],
      dir: [s, 0, 0],
      axis: "z",
      up: [0, 1, 0],
      texture: WARN,
      name: "plateWarn",
    });
  }

  // spare fuel cells on the display deck
  for (const s of [1, -1]) {
    const cx = s * 0.27;
    const cz = -0.27;
    lat(
      [
        [0, 0],
        [0.05, 0],
        [0.06, 0.012],
        [0.06, 0.2],
        [0.052, 0.216],
        [0.032, 0.226],
        [0.032, 0.248],
        [0, 0.248],
      ],
      paint((p) => {
        const y = p.y - 0.128;
        if (y < 0.03 || y > 0.186) return ORANGE;
        if (near(y, 0.04, 0.006) || near(y, 0.176, 0.006)) return NAVY_D;
        return PALE;
      }),
      [cx, 0.128, cz],
      { bone: stand, segments: 10, name: "fuelCell" },
    );
    put(rbox(0.026, 0.09, 0.012, 0.003), NAVY_D, [cx, 0.128 + 0.108, cz + 0.06], { bone: stand, name: "cellWindow" });
    glow(put(rbox(0.018, 0.07, 0.006, 0.002), AMBER, [cx, 0.128 + 0.102, cz + 0.0645], { bone: stand, name: "cellGlow" }), 1.2);
    b.sweep(
      catmull([
        [cx - 0.03, 0.128 + 0.255, cz],
        [cx, 0.128 + 0.29, cz],
        [cx + 0.03, 0.128 + 0.255, cz],
      ]),
      0.0055,
      { bone: stand, color: STEEL, sides: 5, name: "cellHandle" },
    );
    put(new THREE.CylinderGeometry(0.066, 0.066, 0.016, 10), NAVY, [cx, 0.128 + 0.012, cz], { bone: stand, name: "cellBase" });
    // feed line across the deck toward the pedestal
    const feed = catmull([
      [cx * 0.86, 0.147, cz * 0.86],
      [cx * 0.7 + s * 0.02, 0.141, cz * 0.7],
      [cx * 0.5 - s * 0.02, 0.141, cz * 0.5],
      [cx * 0.4, 0.15, cz * 0.4],
    ]);
    b.sweep(feed, 0.0095, { bone: stand, sides: 6, caps: "flat", color: RUBBER_L, name: "feedLine" });
    for (const t of [0, 1]) {
      const at = feed.at(t);
      const dir = feed.tangentAt(t);
      put(new THREE.CylinderGeometry(0.0145, 0.0145, 0.02, 8), ORANGE, [at.x, at.y, at.z], { bone: stand, dir: [dir.x, dir.y, dir.z], name: "feedFitting" });
    }
  }

  // piston striker -----------------------------------------------------
  lat(
    [
      [0, 0.28],
      [0.16, 0.28],
      [0.165, 0.295],
      [0.15, 0.31],
      [0.0, 0.31],
    ],
    NAVY,
    [0, HY, 0],
    { axis: [0, 0, 1], segments: 12, name: "strikerCollar" },
  );
  // bellows
  const bellows: OutlinePoint[] = [[0, 0.31]];
  for (let i = 0; i < 6; i++) {
    bellows.push([0.1, 0.31 + i * 0.016 + 0.002]);
    bellows.push([0.118, 0.31 + i * 0.016 + 0.01]);
  }
  bellows.push([0.1, 0.406], [0, 0.406]);
  lat(bellows, RUBBER, [0, HY, 0], { axis: [0, 0, 1], segments: 10, name: "bellows" });
  lat(
    [
      [0, 0.4],
      [0.222, 0.4],
      [0.25, 0.418],
      [0.25, 0.462],
      [0.228, 0.488],
      [0, 0.488],
    ],
    strikerPaint,
    [0, HY, 0],
    { axis: [0, 0, 1], segments: 16, name: "striker" },
  );
  // face boss
  lat(
    [
      [0, 0.486],
      [0.05, 0.486],
      [0.045, 0.5],
      [0, 0.508],
    ],
    ORANGE,
    [0, HY, 0],
    { axis: [0, 0, 1], segments: 8, name: "faceBoss" },
  );
  // shock rods
  for (const sx of [1, -1])
    for (const sy of [1, -1]) {
      b.rod([sx * 0.12, HY + sy * 0.12, 0.29], [sx * 0.12, HY + sy * 0.12, 0.41], 0.012, { bone: H, color: STEEL_L, sides: 6, name: "shockRod" });
      put(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), ORANGE_D, [sx * 0.12, HY + sy * 0.12, 0.345], { dir: [0, 0, 1], name: "shockCollar" });
    }
  // striker rim bolts
  for (let k = 0; k < 12; k++) {
    const a = (k * 30 + 15) * (Math.PI / 180);
    bolt(STEEL_L, [Math.sin(a) * 0.24, HY + Math.cos(a) * 0.24, 0.442], [Math.sin(a), Math.cos(a), 0], 0.0075);
  }

  // rear thruster ------------------------------------------------------
  lat(
    [
      [0, 0.0],
      [0.14, 0.0],
      [0.155, 0.02],
      [0.155, 0.1],
      [0.14, 0.125],
      [0.1, 0.14],
      [0, 0.14],
    ],
    chamberPaint,
    [0, HY, -0.26],
    { axis: [0, 0, -1], segments: 12, name: "chamber" },
  );
  // bell nozzle on gimbal
  lat(
    [
      [0.085, 0.0],
      [0.1, 0.05],
      [0.135, 0.12],
      [0.17, 0.2],
      [0.19, 0.26],
      [0.19, 0.275],
      [0.175, 0.275],
      [0.156, 0.2],
      [0.12, 0.12],
      [0.092, 0.05],
      [0.075, 0.0],
    ],
    bellPaint,
    [0, HY, -0.4],
    { axis: [0, 0, -1], bone: nozzle, segments: 16, name: "bell" },
  );
  glow(
    lat(
      [
        [0, 0.06],
        [0.092, 0.06],
        [0.092, 0.068],
        [0, 0.068],
      ],
      AMBER,
      [0, HY, -0.4],
      { axis: [0, 0, -1], bone: nozzle, segments: 10, name: "throatGlow" },
    ),
    1.5,
  );
  for (let k = 0; k < 8; k++) {
    const a = (k * 45 + 22.5) * (Math.PI / 180);
    b.extrude(
      [
        [0.04, 0.09],
        [0.09, 0.145],
        [0.16, 0.19],
        [0.26, 0.212],
        [0.26, 0.185],
        [0.2, 0.17],
        [0.12, 0.125],
      ],
      { at: [0, HY, -0.4], x: [0, 0, -1], y: [Math.sin(a), Math.cos(a), 0], thickness: 0.011, color: k % 2 ? GUN_L : NAVY, bone: nozzle, name: "bellFin" },
    );
  }
  // gimbal ring between chamber and bell
  lat(
    [
      [0.09, -0.02],
      [0.13, -0.02],
      [0.13, 0.014],
      [0.09, 0.014],
    ],
    paint((p) => (near(-0.4 - p.z, -0.003, 0.008) ? ORANGE : STEEL_D)),
    [0, HY, -0.4],
    { axis: [0, 0, -1], bone: nozzle, segments: 12, name: "gimbalRing" },
  );
  for (const s of [1, -1]) {
    put(rbox(0.05, 0.04, 0.05, 0.008), NAVY, [s * 0.142, HY, -0.4], { bone: H, name: "gimbalLug" });
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), ORANGE, { bone: nozzle, at: [s * 0.142, HY, -0.4], dir: [1, 0, 0], name: "gimbalPin" });
  }
  // flame: layered teardrop sweeps
  const FZ = -0.4;
  const flame = (z0: number, z1: number, radii: number[], color: string, strength: number, name: string) =>
    glow(
      b.sweep(
        [
          [0, HY, z0],
          [0, HY, z1],
        ],
        radii,
        { bone: nozzle, color, sides: 8, caps: { start: "flat", end: "point" }, name },
      ),
      strength,
    );
  flame(FZ - 0.12, FZ - 0.84, [0.07, 0.15, 0.165, 0.13, 0.09, 0.05, 0.02, 0.0], "#f05a0a", 1, "flameOuter");
  flame(FZ - 0.1, FZ - 0.64, [0.05, 0.1, 0.105, 0.085, 0.055, 0.025, 0.0], AMBER, 1, "flameMid");
  flame(FZ - 0.1, FZ - 0.44, [0.03, 0.06, 0.055, 0.035, 0.0], HOT, 1.2, "flameCore");
  for (let k = 0; k < 7; k++) {
    const a = (k * 51.4 + 10) * (Math.PI / 180);
    const r0 = 0.15;
    const s0 = [Math.sin(a), Math.cos(a)];
    glow(
      b.sweep(
        catmull([
          [s0[0] * r0, HY + s0[1] * r0, FZ - 0.24],
          [s0[0] * (r0 + 0.07), HY + s0[1] * (r0 + 0.07), FZ - 0.5],
          [s0[0] * (r0 + 0.03), HY + s0[1] * (r0 + 0.03), FZ - 0.86],
        ]),
        [0.03, 0.0],
        { bone: nozzle, color: k % 2 ? YELLOW : "#ff6a10", sides: 5, caps: { start: "flat", end: "point" }, name: "flameLick" },
      ),
      1,
    );
  }

  // booster pods -------------------------------------------------------
  for (const s of [1, -1]) {
    const px = s * 0.262;
    const py = HY - 0.05;
    lat(
      [
        [0, 0],
        [0.03, 0.012],
        [0.05, 0.05],
        [0.06, 0.1],
        [0.06, 0.3],
        [0.052, 0.34],
        [0, 0.34],
      ],
      podPaint,
      [px, py, 0.17],
      { axis: [0, 0, -1], segments: 10, name: "pod" },
    );
    lat(
      [
        [0.032, 0.33],
        [0.048, 0.38],
        [0.066, 0.425],
        [0.058, 0.425],
        [0.042, 0.38],
        [0.026, 0.33],
      ],
      GUN,
      [px, py, 0.17],
      { axis: [0, 0, -1], segments: 10, name: "podBell" },
    );
    glow(
      lat(
        [
          [0, 0.37],
          [0.04, 0.37],
          [0.04, 0.376],
          [0, 0.376],
        ],
        AMBER,
        [px, py, 0.17],
        { axis: [0, 0, -1], segments: 8, name: "podThroat" },
      ),
      1.4,
    );
    for (const d of [0.09, 0.205]) {
      lat(
        [
          [0.058, d - 0.016],
          [0.07, d - 0.016],
          [0.07, d + 0.016],
          [0.058, d + 0.016],
        ],
        NAVY,
        [px, py, 0.17],
        { axis: [0, 0, -1], segments: 10, name: "podClamp" },
      );
      bolt(ORANGE, [px + s * 0.07, py, 0.17 - d], [s, 0, 0], 0.008);
    }
    for (const [len, radii, color, name] of [
      [0.3, [0.045, 0.058, 0.04, 0.015, 0], "#e8480a", "podFlameOuter"],
      [0.2, [0.026, 0.036, 0.024, 0.008, 0], AMBER, "podFlameCore"],
    ] as const)
      glow(
        b.sweep(
          [
            [px, py, 0.17 - 0.39],
            [px, py, 0.17 - 0.39 - len],
          ],
          [...radii],
          { bone: H, color, sides: 6, caps: { start: "flat", end: "point" }, name },
        ),
        1,
      );
    put(new THREE.SphereGeometry(0.012, 6, 4), HOT, [px, py, 0.17 + 0.004], { name: "podNoseTip" });
    // stabiliser fins on the pod tail
    for (let k = 0; k < 4; k++) {
      const a = (k * 90 + 45) * (Math.PI / 180);
      b.extrude(
        [
          [0.2, 0.055],
          [0.33, 0.055],
          [0.375, 0.108],
          [0.3, 0.1],
        ],
        { at: [px, py, 0.17], x: [0, 0, -1], y: [Math.sin(a), Math.cos(a), 0], thickness: 0.008, bevel: 0.002, color: k % 2 ? ORANGE_D : NAVY, bone: H, name: "podFin" },
      );
    }
  }

  // ---------------------------------------------------------------- wrist strap + tassel
  b.sweep(
    catmull([
      [0.05, 0.372, 0.0],
      [0.1, 0.36, 0.012],
      [0.135, 0.32, 0.02],
      [0.115, 0.28, 0.012],
      [0.072, 0.292, 0.0],
    ]),
    [0.011, 0.0035],
    { bone: strap, section: "box", color: ORANGE, caps: "flat", name: "strap" },
  );
  put(rbox(0.028, 0.022, 0.03, 0.005), NAVY, [0.052, 0.374, 0], { bone: strap, name: "strapEye" });
  for (let k = 0; k < 3; k++) {
    b.spike([0.11, 0.27, k * 0.014 - 0.014], [0.2 * (k - 1) * 0.1, -1, 0], 0.07, 0.01, { bone: strap, color: k === 1 ? PALE : ORANGE, sides: 5, name: "tassel" });
  }
  put(new THREE.SphereGeometry(0.014, 6, 4), PALE_SH, [0.11, 0.275, 0], { bone: strap, name: "tasselKnot" });

  // ---------------------------------------------------------------- bolts flush
  for (const [key, geos] of Object.entries(boltGeos)) {
    const [owner, color] = key.split("|");
    const merged = mergeGeometries(geos);
    if (!merged) throw new Error("bolt merge failed");
    b.part(merged, color, { bone: owner === "stand" ? stand : H, at: [0, 0, 0], flat: true, name: "bolts" });
  }

  return b.root;
}
