// Cyborg support-hero medic with a healing staff. Overwatch look: clean bold armor shapes, bevels and panel lines,
// white / navy / gunmetal colour blocking with one strong accent (healing teal). The model's LEFT arm and lower
// LEG are cybernetic; the right hand holds the staff, planted on the floor.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG } from "../../../../src/math";
import { bezier, catmull, polyline, spiral } from "../../../../src/path";
import { limb } from "../../../../src/ik";
import { countershade, paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import type { Joint } from "../../../../src/skeleton";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic with a healing staff: white armor over a navy hex-weave suit, a fully mechanical left arm and shin, a glowing teal staff orb and a med-pack on the back.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const WHITE = "#eef1f5";
const SHADE = "#c3cbd7";
const NAVY = "#2a3a58";
const NAVY_D = "#1b2640";
const NAVY_L = "#3e5580";
const GUN = "#3a404d";
const GUN_D = "#252933";
const GUN_L = "#5d6677";
const STEEL = "#a0aabb";
const TEAL = "#18dfb1";
const TEAL_L = "#b4ffee";
const TEAL_D = "#0b8f78";
const SKIN = "#c98c64";
const SKIN_D = "#a96c49";
const LIP = "#a85a50";
const HAIR = "#1c2234";
const HAIR_FADE = "#2f3648";
const BROW = "#171c2b";

// ---------------------------------------------------------------- small geometry helpers
const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);

// ---------------------------------------------------------------- drawings
const eyeHuman = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 70">
  <defs><clipPath id="c"><path d="M6 42 Q44 4 114 36 Q72 66 6 42Z"/></clipPath></defs>
  <path d="M6 42 Q44 4 114 36 Q72 66 6 42Z" fill="#f6f1ea"/>
  <g clip-path="url(#c)">
    <circle cx="66" cy="36" r="24" fill="#5a3a1c"/>
    <circle cx="66" cy="36" r="17" fill="#9b6a2c"/>
    <circle cx="66" cy="36" r="9" fill="#14121a"/>
    <circle cx="58" cy="28" r="5" fill="#ffffff"/>
    <circle cx="74" cy="43" r="2.4" fill="#ffffff"/>
    <path d="M0 0 H120 V22 Q70 14 6 42 Z" fill="#00000030"/>
  </g>
  <path d="M5 43 Q44 2 116 36" fill="none" stroke="#1b1420" stroke-width="7" stroke-linecap="round"/>
  <path d="M104 33 L118 26" fill="none" stroke="#1b1420" stroke-width="5" stroke-linecap="round"/>
  <path d="M18 50 Q60 66 100 42" fill="none" stroke="#8a5238" stroke-width="3" stroke-linecap="round"/>
</svg>`,
  { size: 256 },
);

const eyeCyber = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#070b14"/>
  <circle cx="50" cy="50" r="42" fill="#0f2b30"/>
  <circle cx="50" cy="50" r="40" fill="none" stroke="#18dfb1" stroke-width="3"/>
  <circle cx="50" cy="50" r="30" fill="#18dfb1"/>
  <circle cx="50" cy="50" r="23" fill="#0b8f78"/>
  <circle cx="50" cy="50" r="15" fill="#06130f"/>
  <path d="M50 8 V24 M50 76 V92 M8 50 H24 M76 50 H92" stroke="#b4ffee" stroke-width="4"/>
  <circle cx="41" cy="41" r="5" fill="#ffffff"/>
</svg>`,
  { size: 128 },
);

const facePlate = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 92">
  <path d="M8 10 L86 3 Q114 6 117 32 L113 64 Q100 88 68 87 L40 74 Q22 62 22 42 Q10 32 8 10Z" fill="#e6eaf0" stroke="#2c323f" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="60" cy="40" r="31" fill="#161c28"/>
  <circle cx="60" cy="40" r="31" fill="none" stroke="#7b8598" stroke-width="3"/>
  <path d="M26 14 L92 9" stroke="#9aa4b5" stroke-width="2.5"/>
  <path d="M96 50 Q104 70 80 80" fill="none" stroke="#18dfb1" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M100 30 L110 32 M99 40 L111 42" stroke="#9aa4b5" stroke-width="2.5"/>
  <circle cx="16" cy="14" r="2.6" fill="#8a94a6"/><circle cx="104" cy="14" r="2.6" fill="#8a94a6"/><circle cx="96" cy="70" r="2.6" fill="#8a94a6"/>
</svg>`,
  { size: 256 },
);

const chestArt = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 4 V96" stroke="#b6bfcc" stroke-width="2"/>
  <path d="M50 22 Q22 20 10 38 M50 22 Q78 20 90 38" fill="none" stroke="#b6bfcc" stroke-width="2.2"/>
  <path d="M10 38 Q30 52 50 50 Q70 52 90 38" fill="none" stroke="#b6bfcc" stroke-width="2.2"/>
  <path d="M30 78 H70 M33 85 H67 M36 92 H64" stroke="#b6bfcc" stroke-width="2.2"/>
  <path d="M8 60 L28 70 V62 L8 52Z M92 60 L72 70 V62 L92 52Z" fill="#18dfb1"/>
  <path d="M8 74 L28 84 V76 L8 66Z M92 74 L72 84 V76 L92 66Z" fill="#2a3a58"/>
  <path d="M50 22 L67 30 L67 48 L50 57 L33 48 L33 30Z" fill="#262b37" stroke="#18dfb1" stroke-width="2.4"/>
  <circle cx="14" cy="22" r="1.8" fill="#8a94a6"/><circle cx="86" cy="22" r="1.8" fill="#8a94a6"/>
  <circle cx="20" cy="90" r="1.8" fill="#8a94a6"/><circle cx="80" cy="90" r="1.8" fill="#8a94a6"/>
</svg>`,
  { size: 384 },
);

const plusGlow = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <path d="M15 4 H25 V15 H36 V25 H25 V36 H15 V25 H4 V15 H15Z" fill="#18dfb1"/>
  <path d="M17.5 9 H22.5 V17.5 H31 V22.5 H22.5 V31 H17.5 V22.5 H9 V17.5 H17.5Z" fill="#b4ffee"/>
</svg>`,
  { size: 160 },
);

const medkitArt = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60">
  <rect x="1" y="1" width="78" height="58" rx="8" fill="#eef1f5" stroke="#2c323f" stroke-width="3"/>
  <rect x="1" y="1" width="78" height="14" rx="6" fill="#2a3a58"/>
  <path d="M33 22 H47 V32 H57 V44 H47 V54 H33 V44 H23 V32 H33Z" fill="#18dfb1" stroke="#0b8f78" stroke-width="2"/>
  <circle cx="10" cy="8" r="2.4" fill="#a0aabb"/><circle cx="70" cy="8" r="2.4" fill="#a0aabb"/>
  <path d="M14 52 H20 M60 52 H66" stroke="#a0aabb" stroke-width="3"/>
</svg>`,
  { size: 240 },
);

const holoUi = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 80">
  <rect width="60" height="80" fill="#07161a"/>
  <rect x="2" y="2" width="56" height="76" fill="none" stroke="#18dfb1" stroke-width="2"/>
  <path d="M6 28 H18 L22 14 L28 40 L33 22 L37 28 H54" fill="none" stroke="#18dfb1" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M12 48 H24 V54 H30 V60 H24 V66 H18 V60 H12 V54 H18Z" fill="#b4ffee" transform="translate(0 -6)"/>
  <rect x="34" y="46" width="20" height="5" fill="#18dfb1"/><rect x="34" y="55" width="14" height="5" fill="#18dfb1"/><rect x="34" y="64" width="18" height="5" fill="#0b8f78"/>
  <path d="M6 8 H26 M44 8 H54" stroke="#b4ffee" stroke-width="3"/>
</svg>`,
  { size: 240 },
);

const packArt = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="2" y="2" width="96" height="96" rx="8" fill="#e9edf2" stroke="#2c323f" stroke-width="3"/>
  <rect x="2" y="2" width="96" height="22" rx="6" fill="#2a3a58"/>
  <path d="M10 14 H44 M56 14 H90" stroke="#18dfb1" stroke-width="3"/>
  <path d="M38 34 H62 V52 H80 V72 H62 V90 H38 V72 H20 V52 H38Z" fill="#18dfb1" stroke="#0b8f78" stroke-width="3" transform="translate(0 -4) scale(1 .94)"/>
  <path d="M8 88 L22 74 M22 88 L36 74 M64 88 L78 74 M78 88 L92 74" stroke="#2a3a58" stroke-width="5"/>
  <circle cx="12" cy="34" r="2.6" fill="#8a94a6"/><circle cx="88" cy="34" r="2.6" fill="#8a94a6"/>
</svg>`,
  { size: 256 },
);

const wisp = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
  <path d="M20 98 C2 78 6 56 18 40 C20 28 18 14 22 2 C26 18 34 30 32 46 C38 62 34 82 20 98Z" fill="#18dfb1"/>
  <path d="M20 90 C10 76 14 60 21 48 C22 40 22 32 23 24 C26 36 28 46 27 54 C30 66 28 80 20 90Z" fill="#b4ffee"/>
</svg>`,
  { size: 160 },
);

// ---------------------------------------------------------------- paints
const armorPaint = countershade(WHITE, SHADE, { level: 0.05, soft: 0.8 });
const suitShade = countershade(NAVY, NAVY_D, { level: 0.1, soft: 0.8 });

function hexDist(x: number, y: number) {
  const R = 1.7320508;
  const ax = (((x % 1) + 1) % 1) - 0.5;
  const ay = (((y % R) + R) % R) - R / 2;
  const bx = ((((x - 0.5) % 1) + 1) % 1) - 0.5;
  const by = ((((y - R / 2) % R) + R) % R) - R / 2;
  const useA = ax * ax + ay * ay < bx * bx + by * by;
  const gx = Math.abs(useA ? ax : bx);
  const gy = Math.abs(useA ? ay : by);
  return Math.max(gx, gx * 0.5 + gy * 0.8660254);
}
/** Navy hex-weave suit, hexes wrapped about a vertical axis through x = cx. */
const hexSuit = (cx: number, cell = 0.036) =>
  paint((p) => {
    const u = Math.atan2(p.x - cx, p.z) * 0.1;
    return hexDist(u / cell, p.y / cell) > 0.43 ? NAVY_L : suitShade;
  });
/** The same weave on a limb leaning toward a point (arms): rings around the chain use the swept coordinates. */
const hexSweep = (cell = 0.034) =>
  paint((_p, _n, s) => {
    const u = (s[1] / 360) * 0.34;
    return hexDist(u / cell, (s[0] * 0.6) / cell) > 0.43 ? NAVY_L : suitShade;
  });

const gripTape = paint((_p, _n, s) => (((s[0] * 3 + s[1] * 2.2) % 1) + 1) % 1 < 0.14 ? TEAL : NAVY_D);

// ---------------------------------------------------------------- merged studs
type Bag = { bone: Joint; color: string; strength: number; geos: THREE.BufferGeometry[] };

export default function build() {
  const b = createBuilder({ name: "cyborgMedic", paintSize: 1024 });

  const bags = new Map<string, Bag>();
  /** Queues a small static piece for one merged part per bone and colour. */
  function stud(
    bone: Joint,
    color: string,
    geo: THREE.BufferGeometry,
    at: readonly number[],
    rot: readonly number[] = [0, 0, 0],
    strength = 0,
  ) {
    const key = `${bone.name}|${color}|${strength}`;
    let bag = bags.get(key);
    if (!bag) bags.set(key, (bag = { bone, color, strength, geos: [] }));
    const g = geo.clone();
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(at[0], at[1], at[2]),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
      new THREE.Vector3(1, 1, 1),
    );
    g.applyMatrix4(m);
    bag.geos.push(g);
  }
  const bolt = (bone: Joint, at: readonly number[], r = 0.0075, color = STEEL) => stud(bone, color, sph(r, 6, 4), at);

  // ================================================================ skeleton
  const hips = b.joint("hips", { at: [0, 0.97, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 0.97, 0],
      [0, 1.12, 0.005],
      [0, 1.3, 0.02],
      [0, 1.5, 0],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 1.5, 0], aim: [0, 1.62, 0.03], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 1.62, 0.03], aim: [0, 1.78, 0.04], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.68, 0.005], aim: [0, 1.645, 0.1], role: "jaw" });

  // ponytail (hair chain)
  const ponyPath = catmull([
    [0, 1.8, -0.1],
    [0, 1.755, -0.19],
    [0, 1.66, -0.225],
    [0, 1.56, -0.205],
    [0, 1.5, -0.19],
  ]);
  const pony = b.chain("ponytail", ponyPath, { parent: head, names: ["ponytail1", "ponytail2", "ponytail3", "ponytail4"], role: "tail" });

  // legs
  const legs: Record<string, ReturnType<typeof b.chain>> = {};
  const toes: Record<string, Joint> = {};
  for (const [n, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const pts = limb([sx * 0.1, 0.93, 0], [sx * 0.108, 0.105, -0.02], [0.43, 0.42], [0, 0, 1]);
    legs[n] = b.chain(`leg${n}`, pts, {
      parent: hips,
      names: [`hip${n}`, `knee${n}`, `ankle${n}`],
      role: "leg",
      contact: [sx * 0.11, 0, 0.1],
    });
    toes[n] = b.joint(`toe${n}`, {
      parent: legs[n].tip!,
      at: [sx * 0.11, 0.05, 0.115],
      aim: [sx * 0.11, 0.045, 0.25],
      role: "hinge",
    });
  }

  // arms
  const S = { L: [0.215, 1.47, 0], R: [-0.215, 1.47, 0] } as const;
  const E = { L: [0.335, 1.2, -0.015], R: [-0.33, 1.2, -0.03] } as const;
  const W = { L: [0.425, 0.945, 0.045], R: [-0.34, 1.115, 0.245] } as const;
  const clav: Record<string, Joint> = {};
  const arms: Record<string, ReturnType<typeof b.chain>> = {};
  for (const [n, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    clav[n] = b.joint(`clavicle${n}`, { parent: chest, at: [sx * 0.06, 1.47, 0.01], aim: S[n] });
    arms[n] = b.chain(`arm${n}`, polyline([S[n], E[n], W[n]]), {
      parent: clav[n],
      names: [`shoulder${n}`, `elbow${n}`, `wrist${n}`],
      role: "arm",
    });
  }
  const wristL = arms.L.tip!;
  const wristR = arms.R.tip!;

  // staff root, orb hinge
  const SX = -0.345;
  const SZ = 0.35;
  const staff = b.joint("staff", { parent: wristR, at: [SX, 1.1, SZ], aim: [SX, 1.8, SZ] });
  const staffRing = b.joint("staffRing", { parent: staff, at: [SX, 1.74, SZ], aim: [SX, 1.8, SZ], role: "hinge" });

  // ================================================================ torso
  const torso = b.loft(
    [
      { at: [0, 0.88, 0], w: 0.33, h: 0.21 },
      { at: [0, 0.98, 0], w: 0.34, h: 0.215 },
      { at: [0, 1.1, 0], w: 0.28, h: 0.185 },
      { at: [0, 1.22, 0.01], w: 0.31, h: 0.2 },
      { at: [0, 1.36, 0.015], w: 0.38, h: 0.235 },
      { at: [0, 1.46, 0.01], w: 0.4, h: 0.23 },
      { at: [0, 1.52, 0], w: 0.26, h: 0.17 },
    ],
    { bone: [hips, spine], color: hexSuit(0), name: "torso" },
  );

  // cuirass: chunky bevelled chest shell
  const cuirassOutline: OutlinePoint[] = [
    [-0.075, 1.54],
    [-0.205, 1.505],
    [-0.22, 1.43],
    [-0.195, 1.3],
    [-0.135, 1.185],
    [0.135, 1.185],
    [0.195, 1.3],
    [0.22, 1.43],
    [0.205, 1.505],
    [0.075, 1.54],
    [0, 1.5],
  ];
  const cuirass = b.extrude(cuirassOutline, {
    at: [0, 0, 0.005],
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: 0.255,
    bevel: 0.05,
    smoothing: 1,
    color: armorPaint,
    bone: chest,
    name: "cuirass",
  });
  b.decal(cuirass, chestArt, { at: [0, 1.36, 0.14], dir: [0, 0, 1], size: [0.34, 0.34], segments: 22, bone: chest, name: "chestArt" });
  glow(
    b.decal(cuirass, plusGlow, {
      at: [0, 1.435, 0.14],
      dir: [0, 0, 1],
      size: [0.062, 0.062],
      segments: 8,
      lift: 0.004,
      bone: chest,
      name: "chestPlus",
    }),
    1.2,
  );
  // collarbone yoke + trapezius
  for (const sx of [1, -1]) {
    b.capsule([sx * 0.05, 1.54, -0.005], [sx * 0.2, 1.485, 0.0], 0.052, { bone: chest, color: NAVY, name: "trapezius" });
    // clavicle armor strip
    b.rod([sx * 0.06, 1.532, 0.1], [sx * 0.19, 1.49, 0.085], [0.016, 0.014], { bone: chest, color: GUN, name: "clavTrim" });
    bolt(chest, [sx * 0.19, 1.49, 0.1]);
  }
  // neck, collar
  b.capsule([0, 1.49, 0], [0, 1.655, 0.03], 0.05, { bone: neck, color: SKIN_D, name: "neck" });
  b.lathe(
    [
      [0.056, 0],
      [0.098, 0],
      [0.1, 0.014],
      [0.082, 0.07],
      [0.07, 0.074],
      [0.062, 0.074],
      [0.06, 0.03],
    ],
    { at: [0, 1.505, 0.01], axis: [0, 1, 0.1], bone: neck, color: armorPaint, segments: 10, name: "collar" },
  );
  glow(
    b.lathe(
      [
        [0.07, 0.01],
        [0.092, 0.01],
        [0.092, 0.02],
        [0.07, 0.02],
      ],
      { at: [0, 1.505, 0.01], axis: [0, 1, 0.1], bone: neck, color: TEAL, segments: 10, name: "collarGlow" },
    ),
    1.2,
  );
  // back plate + spine ridge
  b.extrude(
    [
      [-0.19, 1.47],
      [-0.2, 1.4],
      [-0.15, 1.2],
      [0.15, 1.2],
      [0.2, 1.4],
      [0.19, 1.47],
    ],
    { at: [0, 0, -0.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.05, bevel: 0.015, color: SHADE, bone: chest, name: "backPlate" },
  );

  // belt and waist
  const ellipseRing = (cy: number, a: number, d: number, z0 = 0) => {
    const pts: [number, number, number][] = [];
    for (let k = 0; k < 20; k++) {
      const t = (k / 20) * Math.PI * 2;
      pts.push([a * Math.sin(t), cy, z0 + d * Math.cos(t)]);
    }
    return catmull(pts, { closed: true });
  };
  b.sweep(ellipseRing(1.065, 0.152, 0.108), (): [number, number] => [0.018, 0.034], {
    color: GUN,
    up: [0, 1, 0],
    bone: hips,
    name: "belt",
  });
  b.sweep(ellipseRing(1.0, 0.176, 0.12), (): [number, number] => [0.014, 0.022], {
    color: GUN_D,
    up: [0, 1, 0],
    bone: hips,
    name: "hipBand",
  });
  glow(
    b.sweep(ellipseRing(1.065, 0.171, 0.121), (): [number, number] => [0.003, 0.006], {
      color: TEAL,
      up: [0, 1, 0],
      bone: hips,
      name: "beltGlow",
    }),
    1.1,
  );
  // buckle
  b.extrude(
    [
      [-0.04, -0.03],
      [0.04, -0.03],
      [0.05, 0],
      [0.04, 0.03],
      [-0.04, 0.03],
      [-0.05, 0],
    ],
    { at: [0, 1.065, 0.123], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: WHITE, bone: hips, name: "buckle" },
  );
  glow(b.part(box(0.026, 0.026, 0.004), TEAL, { at: [0, 1.065, 0.133], bone: hips, name: "buckleGem" }), 1.2);
  // abdomen plates
  for (let k = 0; k < 3; k++) {
    b.extrude(
      [
        [-0.07 + k * 0.004, 0],
        [0.07 - k * 0.004, 0],
        [0.065 - k * 0.004, 0.025],
        [-0.065 + k * 0.004, 0.025],
      ],
      { at: [0, 1.1 + k * 0.026, 0.1 - k * 0.004], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.016, bevel: 0.004, color: k === 1 ? GUN_L : GUN, bone: spine.joints[1], name: "abPlate" },
    );
  }

  // hip tassets: front and back plates plus side plates, hinged on the hips
  for (const sx of [1, -1]) {
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0.06, -0.19],
        [0, -0.24],
        [-0.06, -0.19],
      ],
      { at: [sx * 0.085, 1.045, 0.118], x: [1, 0, 0], y: [0, 1, -0.2], thickness: 0.02, bevel: 0.006, color: armorPaint, bone: hips, name: "tassetFront" },
    );
    b.part(box(0.036, 0.1, 0.005), TEAL, { at: [sx * 0.085, 0.965, 0.151], rotation: [-12, 0, 0], bone: hips, name: "tassetStripe" });
    b.extrude(
      [
        [-0.09, 0],
        [0.09, 0],
        [0.08, -0.17],
        [0, -0.21],
        [-0.08, -0.17],
      ],
      { at: [sx * 0.18, 1.04, -0.0], x: [0, 0, 1], y: [sx * 0.18, 1, 0], thickness: 0.02, bevel: 0.006, color: armorPaint, bone: hips, name: "tassetSide" },
    );
    b.extrude(
      [
        [-0.07, 0],
        [0.07, 0],
        [0.06, -0.17],
        [0, -0.2],
        [-0.06, -0.17],
      ],
      { at: [sx * 0.085, 1.035, -0.125], x: [1, 0, 0], y: [0, 1, 0.2], thickness: 0.02, bevel: 0.006, color: SHADE, bone: hips, name: "tassetBack" },
    );
  }
  // pouches and med kit on the belt
  for (const [x, z, rot] of [
    [-0.12, 0.095, -35],
    [-0.15, 0.04, -75],
    [0.12, -0.1, 150],
    [-0.12, -0.1, 205],
  ] as const) {
    b.part(box(0.07, 0.07, 0.04), GUN, { at: [x, 1.0, z], rotation: [0, rot, 0], bone: hips, name: "pouch" });
    b.part(box(0.074, 0.02, 0.044), GUN_L, { at: [x, 1.03, z], rotation: [0, rot, 0], bone: hips, name: "pouchFlap" });
  }
  b.part(box(0.17, 0.12, 0.07), WHITE, { at: [0.21, 1.0, 0.0], rotation: [0, 0, 0], bone: hips, name: "medkit" });
  b.part(new THREE.PlaneGeometry(0.14, 0.098), "#ffffff", {
    at: [0.2465, 1.0, 0.0],
    dir: [1, 0, 0],
    axis: "z",
    up: [0, 1, 0],
    texture: medkitArt,
    bone: hips,
    name: "medkitArt",
  });
  b.rod([0.21, 1.075, -0.03], [0.21, 1.075, 0.03], 0.008, { bone: hips, color: GUN_D, name: "medkitHandle" });

  // ================================================================ backpack
  const pack = b.extrude(
    [
      [-0.15, 0],
      [0.15, 0],
      [0.16, 0.02],
      [0.16, 0.26],
      [0.14, 0.31],
      [-0.14, 0.31],
      [-0.16, 0.26],
      [-0.16, 0.02],
    ],
    { at: [0, 1.17, -0.19], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.12, bevel: 0.028, color: armorPaint, bone: chest, name: "pack" },
  );
  b.part(new THREE.PlaneGeometry(0.22, 0.22), "#ffffff", {
    at: [0, 1.32, -0.2515],
    dir: [0, 0, -1],
    axis: "z",
    up: [0, 1, 0],
    texture: packArt,
    bone: chest,
    name: "packArt",
  });
  b.part(box(0.2, 0.05, 0.1), GUN, { at: [0, 1.495, -0.185], bone: chest, name: "packTop" });
  glow(b.part(box(0.12, 0.012, 0.012), TEAL, { at: [0, 1.5, -0.14], bone: chest, name: "packLed" }), 1.2);
  // canisters
  for (const sx of [1, -1]) {
    const cx = sx * 0.145;
    b.part(cyl(0.04, 0.04, 0.026, 8), GUN, { at: [cx, 1.5, -0.195], bone: chest, name: "canCapTop" });
    b.part(cyl(0.042, 0.042, 0.026, 8), GUN, { at: [cx, 1.125, -0.195], bone: chest, name: "canCapBot" });
    glow(b.part(cyl(0.032, 0.032, 0.33, 8), TEAL, { at: [cx, 1.31, -0.195], bone: chest, name: "canLiquid" }), 1);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      b.rod([cx + Math.cos(a) * 0.04, 1.14, -0.195 + Math.sin(a) * 0.04], [cx + Math.cos(a) * 0.04, 1.49, -0.195 + Math.sin(a) * 0.04], 0.0045, { bone: chest, color: STEEL, name: "canStrut" });
    }
    for (const y of [1.2, 1.31, 1.42]) b.part(cyl(0.039, 0.039, 0.008, 8), STEEL, { at: [cx, y, -0.195], bone: chest, name: "canBand" });
  }
  // antenna + vents + hoses
  b.rod([-0.1, 1.5, -0.2], [-0.12, 1.66, -0.22], [0.007, 0.004], { bone: chest, color: GUN_D, name: "antenna" });
  glow(b.part(sph(0.012, 6, 4), TEAL, { at: [-0.12, 1.668, -0.22], bone: chest, name: "antennaTip" }), 1.4);
  for (let k = 0; k < 4; k++) b.part(box(0.1, 0.006, 0.01), GUN_D, { at: [0, 1.2 + k * 0.016, -0.255], bone: chest, name: "vent" });
  b.sweep(bezier([0.1, 1.46, -0.19], [0.17, 1.58, -0.12], [0.2, 1.62, 0.0], [0.205, 1.55, 0.045]), 0.011, { bone: chest, color: GUN_D, name: "hoseL" });
  b.sweep(bezier([-0.1, 1.2, -0.19], [-0.2, 1.1, -0.15], [-0.22, 1.05, -0.08], [-0.19, 1.0, -0.02]), 0.011, { bone: hips, color: GUN_D, name: "hoseR" });
  for (const t of [0.3, 0.55, 0.8])
    glow(
      b.sweep(bezier([0.1, 1.46, -0.19], [0.17, 1.58, -0.12], [0.2, 1.62, 0.0], [0.205, 1.55, 0.045]), 0.0135, { from: t - 0.02, to: t + 0.02, color: TEAL, bone: chest, name: "hoseGlow" }),
      1.1,
    );

  // ================================================================ head
  const cranium = b.part(sph(1, 14, 10), SKIN, { at: [0, 1.75, 0.005], scale: [0.097, 0.108, 0.108], bone: head, name: "cranium" });
  const face = b.part(sph(1, 14, 10), SKIN, { at: [0, 1.695, 0.042], scale: [0.088, 0.09, 0.082], bone: head, name: "face" });
  for (const sx of [1, -1]) {
    b.part(sph(1, 8, 6), SKIN, { at: [sx * 0.05, 1.676, 0.082], scale: [0.036, 0.03, 0.03], bone: head, name: "cheek" });
    b.part(sph(1, 6, 5), SKIN_D, { at: [sx * 0.097, 1.712, 0.0], scale: [0.012, 0.03, 0.02], bone: head, name: "ear" });
    // brow
    b.capsule([sx * 0.014, 1.756, 0.114], [sx * 0.07, 1.748, 0.088], 0.0085, { bone: head, color: BROW, name: "brow" });
  }
  // nose
  b.capsule([0, 1.728, 0.108], [0, 1.69, 0.134], 0.011, { bone: head, color: SKIN, name: "noseBridge" });
  b.part(sph(1, 6, 5), SKIN, { at: [0, 1.687, 0.138], scale: [0.016, 0.014, 0.014], bone: head, name: "noseTip" });
  for (const sx of [1, -1]) b.part(sph(1, 6, 4), SKIN_D, { at: [sx * 0.014, 1.683, 0.128], scale: [0.009, 0.009, 0.009], bone: head, name: "nostril" });
  // mouth: upper lip on the head, lower lip and chin on the jaw
  b.capsule([-0.022, 1.664, 0.113], [0.022, 1.664, 0.113], 0.0075, { bone: head, color: LIP, name: "upperLip" });
  b.capsule([-0.02, 1.65, 0.113], [0.02, 1.65, 0.113], 0.0085, { bone: jaw, color: LIP, name: "lowerLip" });
  b.capsule([-0.024, 1.658, 0.112], [0.024, 1.658, 0.112], 0.0025, { bone: jaw, color: SKIN_D, name: "mouthLine" });
  for (const sx of [1, -1]) b.capsule([sx * 0.082, 1.668, 0.0], [sx * 0.03, 1.626, 0.088], 0.034, { bone: jaw, color: SKIN, name: "jawSide" });
  b.part(sph(1, 8, 6), SKIN, { at: [0, 1.628, 0.082], scale: [0.045, 0.032, 0.04], bone: jaw, name: "chin" });
  // eyes
  const faceSkin = [cranium, face];
  b.decal(faceSkin, eyeHuman, { at: [-0.045, 1.722, 0.1], dir: [0, 0, 1], size: [0.058, 0.034], mirror: true, bone: head, name: "eyeR" });
  b.decal(faceSkin, facePlate, { at: [0.052, 1.721, 0.1], dir: [0, 0, 1], size: [0.104, 0.08], bone: head, name: "facePlate", lift: 0.0025 });
  glow(b.decal(faceSkin, eyeCyber, { at: [0.045, 1.722, 0.1], dir: [0, 0, 1], size: [0.04, 0.04], bone: head, name: "eyeCyber", lift: 0.006 }), 1.3);
  // ears: left side is a cybernetic ear-cup with headset boom
  b.part(cyl(0.036, 0.036, 0.024, 10), GUN, { at: [0.108, 1.71, 0.0], dir: [1, 0, 0], bone: head, name: "earCup" });
  glow(b.part(cyl(0.026, 0.026, 0.006, 10), TEAL, { at: [0.12, 1.71, 0.0], dir: [1, 0, 0], bone: head, name: "earGlow" }), 1.2);
  b.rod([0.12, 1.705, 0.01], [0.1, 1.66, 0.09], 0.004, { bone: head, color: GUN_D, name: "micBoom" });
  b.part(sph(0.011, 6, 4), GUN, { at: [0.1, 1.658, 0.094], bone: head, name: "micTip" });
  b.rod([0.114, 1.738, 0.0], [0.13, 1.8, -0.02], [0.007, 0.003], { bone: head, color: STEEL, name: "ear antenna" });
  b.part(cyl(0.022, 0.022, 0.014, 8), WHITE, { at: [-0.106, 1.71, 0.0], dir: [1, 0, 0], bone: head, name: "earPieceR" });
  // hair: swept cap with faded sides, quiff, teal streak, ponytail
  const capGeo = new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, 2.05);
  b.part(
    capGeo,
    paint((p) => (p.y < 1.745 ? HAIR_FADE : HAIR)),
    { at: [0, 1.755, 0.002], scale: [0.104, 0.115, 0.117], rotation: [-24, 0, 0], bone: head, name: "hairCap" },
  );
  b.extrude(
    [
      [0.11, 1.81],
      [0.125, 1.85],
      [0.09, 1.9],
      [0.02, 1.915],
      [-0.06, 1.89],
      [-0.115, 1.82],
      [-0.1, 1.79],
      [0, 1.835],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.12, bevel: 0.03, smoothing: 1, color: HAIR, bone: head, name: "quiff" },
  );
  b.extrude(
    [
      [0.1, 1.83],
      [0.115, 1.856],
      [0.085, 1.9],
      [0.025, 1.912],
      [-0.03, 1.895],
      [0.03, 1.875],
    ],
    { at: [0.0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.026, bevel: 0.008, smoothing: 1, color: TEAL, bone: head, name: "streak" },
  );
  b.sweep(pony, [0.045, 0.014], { color: HAIR, name: "ponytail" });
  b.sweep(pony, (t) => (t < 0.1 ? 0.052 : 0), { from: 0, to: 0.12, color: WHITE, caps: "flat", name: "hairTie" });
  glow(b.sweep(pony, 0.0, { from: 0.0, to: 0.0001, color: TEAL, name: "hairTieGlowDummy" }), 0);

  // ================================================================ arms
  const shoulderBasis = (n: "L" | "R") => {
    const a = new THREE.Vector3(...S[n]);
    const e = new THREE.Vector3(...E[n]);
    const w = new THREE.Vector3(...W[n]);
    return { a, e, w, up: e.clone().sub(a).normalize(), fo: w.clone().sub(e).normalize() };
  };
  const armR = (t: number) => {
    const k = [0.066, 0.066, 0.062, 0.056, 0.056, 0.054, 0.048, 0.043];
    const f = t * (k.length - 1);
    const i = Math.min(k.length - 2, Math.floor(f));
    return k[i] + (k[i + 1] - k[i]) * (f - i);
  };

  // --- right (human) arm: navy hex sleeve, white bracer, hologram
  b.sweep(arms.R, (t) => armR(t) * 1.0, { color: hexSweep(), name: "sleeveR" });
  b.sweep(arms.R, (t) => armR(t) + 0.014, { from: 0.57, to: 0.93, color: armorPaint, name: "bracerR" });
  b.sweep(arms.R, (t) => armR(t) + 0.018, { from: 0.54, to: 0.585, color: GUN, name: "bracerRingR" });
  b.sweep(arms.R, (t) => armR(t) + 0.018, { from: 0.925, to: 0.975, color: GUN, name: "cuffR" });
  glow(b.sweep(arms.R, (t) => armR(t) + 0.0195, { from: 0.945, to: 0.955, color: TEAL, name: "cuffGlowR" }), 1.1);
  // upper arm band
  b.sweep(arms.R, (t) => armR(t) + 0.012, { from: 0.14, to: 0.34, color: armorPaint, name: "bicepPlateR" });
  glow(b.sweep(arms.R, (t) => armR(t) + 0.0135, { from: 0.34, to: 0.36, color: TEAL, name: "bicepGlowR" }), 1.1);
  // elbow guard
  b.part(sph(1, 8, 6), WHITE, { at: [-0.34, 1.2, -0.075], scale: [0.058, 0.062, 0.05], bone: arms.R.joints[1], name: "elbowGuardR" });
  b.part(sph(1, 6, 4), GUN, { at: [-0.34, 1.2, -0.115], scale: [0.025, 0.025, 0.02], bone: arms.R.joints[1], name: "elbowCapR" });
  // hologram gauntlet on the forearm top
  const holoAt = [-0.34, 1.172, 0.17] as const;
  b.part(box(0.1, 0.02, 0.15), GUN, { at: [holoAt[0], holoAt[1] - 0.004, holoAt[2]], rotation: [-8, 0, 0], bone: arms.R.joints[1], name: "holoHousing" });
  glow(
    b.part(new THREE.PlaneGeometry(0.082, 0.126), "#ffffff", {
      at: [holoAt[0], holoAt[1] + 0.0075, holoAt[2]],
      dir: [0, 1, 0.14],
      axis: "z",
      up: [0, 0.14, -1],
      texture: holoUi,
      bone: arms.R.joints[1],
      name: "holoScreen",
    }),
    1,
  );
  // shoulder pauldron (right): large white dome with teal rim and lames
  const pauld = (n: "L" | "R", sx: number) => {
    const dir = [sx * 0.85, 0.5, 0] as const;
    const cen = [S[n][0] + sx * 0.005, S[n][1] + 0.045, 0] as const;
    return { dir, cen };
  };
  {
    const sx = -1;
    const { dir, cen } = pauld("R", sx);
    const dome = b.lathe(
      [
        [0, 0],
        [0.14, 0],
        [0.148, 0.018],
        [0.138, 0.058],
        [0.1, 0.098],
        [0.05, 0.117],
        [0, 0.122],
      ],
      {
        at: cen,
        axis: dir,
        segments: 14,
        color: paint((_p, _n, s) => (s[0] > 0.015 && s[0] < 0.032 ? TEAL : s[0] < 0.015 ? GUN : s[1] > 60 && s[1] < 120 && s[0] > 0.05 ? NAVY : armorPaint)),
        bone: clav.R,
        name: "pauldronR",
      },
    );
    b.lathe(
      [
        [0, -0.012],
        [0.162, -0.012],
        [0.168, 0.004],
        [0.158, 0.014],
        [0.0, 0.014],
      ],
      { at: cen, axis: dir, segments: 14, color: GUN, bone: clav.R, name: "pauldronSkirtR" },
    );
    // lower lames
    for (let k = 0; k < 2; k++)
      b.lathe(
        [
          [0, 0],
          [0.15 - k * 0.012, 0],
          [0.152 - k * 0.012, 0.012],
          [0, 0.014],
        ],
        { at: [cen[0] + sx * (0.04 + k * 0.035), cen[1] - 0.05 - k * 0.04, 0], axis: [sx * 0.55, 0.9, 0], segments: 14, color: k === 0 ? WHITE : SHADE, bone: arms.R.joints[0], name: "lameR" },
      );
    const pr = dome;
    for (const [u, v] of [
      [0.0, 0.08],
      [0.06, 0.0],
      [-0.06, 0.0],
    ])
      bolt(clav.R, [cen[0] + sx * 0.1 + u * 0.1, cen[1] + 0.07 + v * 0.2, u], 0.007);
    void pr;
    // pauldron emblem: glowing plus on the outer face
    glow(
      b.decal(dome, plusGlow, {
        at: [cen[0] + sx * 0.135, cen[1] + 0.085, 0],
        dir: [sx, 0.35, 0],
        up: [0, 1, 0],
        size: [0.06, 0.06],
        segments: 8,
        lift: 0.004,
        bone: clav.R,
        name: "pauldronPlus",
      }),
      1.2,
    );
  }

  // --- left (cybernetic) arm
  {
    const sx = 1;
    const { a, e, w, up, fo } = shoulderBasis("L");
    // dark core, segmented
    b.sweep(arms.L, (t) => armR(t) * 0.72, {
      bands: [
        [0.08, GUN_D],
        [0.14, GUN_L],
        [0.2, GUN_D],
        [0.26, GUN_L],
        [0.32, GUN_D],
        [0.4, GUN_L],
        [0.47, GUN_D],
        [0.6, GUN],
        [0.9, GUN_D],
        [1, GUN],
      ],
      sides: 10,
      name: "cyberArm",
    });
    // exposed shoulder ball and elbow joint
    b.part(sph(0.058, 10, 8), GUN_L, { at: a, bone: arms.L.joints[0], name: "cyberShoulderBall" });
    glow(b.part(sph(0.03, 8, 6), TEAL, { at: [a.x + 0.035, a.y - 0.005, a.z + 0.02], bone: arms.L.joints[0], name: "shoulderCore" }), 1.2);
    b.part(cyl(0.05, 0.05, 0.12, 10), GUN, { at: e, rotation: [0, 0, 90], bone: arms.L.joints[1], name: "cyberElbow" });
    glow(b.part(cyl(0.036, 0.036, 0.132, 10), TEAL, { at: e, rotation: [0, 0, 90], bone: arms.L.joints[1], name: "elbowGlow" }), 1.0);
    b.part(cyl(0.056, 0.056, 0.04, 10), STEEL, { at: [e.x + 0.07, e.y, e.z], rotation: [0, 0, 90], bone: arms.L.joints[1], name: "elbowCapL" });
    // armor shells on the upper arm and forearm (white, partial)
    b.sweep(arms.L, (t) => armR(t) * 0.72 + 0.016, {
      from: 0.1,
      to: 0.4,
      sectors: [[-80, 80, WHITE]],
      color: GUN_D,
      sides: 10,
      name: "cyberShellUp",
    });
    b.sweep(arms.L, (t) => armR(t) * 0.8 + 0.018, {
      from: 0.62,
      to: 0.93,
      sectors: [[-85, 85, WHITE]],
      color: GUN_D,
      sides: 10,
      name: "cyberShellFore",
    });
    // glow seams
    for (const t of [0.1, 0.4, 0.62, 0.94])
      glow(b.sweep(arms.L, (u) => armR(u) * 0.78 + 0.02, { from: t - 0.008, to: t + 0.008, color: TEAL, sides: 10, name: "cyberSeam" }), 1.1);
    // hydraulic pistons: upper arm and forearm, on the inner (body-facing) side
    const inner = new THREE.Vector3(-1, 0, 0);
    const pist = (from: THREE.Vector3, to: THREE.Vector3, bone: Joint, tag: string) => {
      const mid = from.clone().lerp(to, 0.5);
      b.capsule(from, mid, 0.011, { bone, color: GUN_D, name: `${tag}Barrel` });
      b.rod(mid, to, 0.0055, { bone, color: STEEL, name: `${tag}Rod` });
    };
    const f0 = (p: THREE.Vector3, o: THREE.Vector3, d: number) => p.clone().addScaledVector(o, d);
    const sideU = inner.clone().sub(up.clone().multiplyScalar(inner.dot(up))).normalize();
    pist(f0(a.clone().addScaledVector(up, 0.07), sideU, 0.054), f0(e.clone().addScaledVector(up, -0.06), sideU, 0.048), arms.L.joints[0], "pistonUp");
    const sideF = inner.clone().sub(fo.clone().multiplyScalar(inner.dot(fo))).normalize();
    pist(f0(e.clone().addScaledVector(fo, 0.05), sideF, 0.042), f0(w.clone().addScaledVector(fo, -0.045), sideF, 0.04), arms.L.joints[1], "pistonFore");
    // spring coil around forearm piston
    b.sweep(
      spiral(f0(e.clone().addScaledVector(fo, 0.07), sideF, 0.042).add(sideF.clone().multiplyScalar(0.013)), f0(e.clone().addScaledVector(fo, 0.07), sideF, 0.042).add(sideF.clone().multiplyScalar(0.013)), fo, { turns: 4, pitch: 0.016, r1: 0.013 }),
      0.0028,
      { bone: arms.L.joints[1], color: STEEL, sides: 4, name: "coil" },
    );
    // pauldron (left): compact gunmetal / white
    const { dir, cen } = pauld("L", sx);
    b.lathe(
      [
        [0, 0],
        [0.1, 0],
        [0.108, 0.016],
        [0.096, 0.05],
        [0.06, 0.082],
        [0, 0.092],
      ],
      { at: cen, axis: dir, segments: 12, color: paint((_p, _n, s) => (s[0] < 0.016 ? GUN_D : s[0] < 0.03 ? TEAL_D : armorPaint)), bone: clav.L, name: "pauldronL" },
    );
    b.lathe(
      [
        [0, -0.01],
        [0.122, -0.01],
        [0.128, 0.0],
        [0.0, 0.012],
      ],
      { at: cen, axis: dir, segments: 12, color: GUN, bone: clav.L, name: "pauldronSkirtL" },
    );
    for (const k of [-1, 1]) bolt(clav.L, [cen[0] + 0.08, cen[1] + 0.06, k * 0.05], 0.007);
    // forearm vent plates and wrist
    for (let k = 0; k < 4; k++) {
      const p = e.clone().lerp(w, 0.3 + k * 0.09);
      b.part(box(0.022, 0.006, 0.05), STEEL, { at: [p.x + 0.0, p.y, p.z - 0.04], dir: fo.toArray(), bone: arms.L.joints[1], name: "foreVent" });
    }
    b.part(cyl(0.05, 0.05, 0.03, 10), GUN_L, { at: w, dir: fo.toArray(), bone: wristL, name: "wristRing" });
    glow(b.part(cyl(0.052, 0.052, 0.008, 10), TEAL, { at: w.clone().addScaledVector(fo, 0.018), dir: fo.toArray(), bone: wristL, name: "wristGlow" }), 1.2);
  }

  // ================================================================ hands
  // --- left cybernetic open hand (palm forward, fingers spread)
  {
    const hd = new THREE.Vector3(0.18, -1, 0.12).normalize();
    const nrm = new THREE.Vector3(-0.25, 0, 0.97);
    nrm.sub(hd.clone().multiplyScalar(nrm.dot(hd))).normalize();
    const lat = new THREE.Vector3().crossVectors(nrm, hd).normalize(); // toward the thumb side (outward)
    const wv = new THREE.Vector3(...W.L);
    const pc = wv.clone().addScaledVector(hd, 0.06);
    b.part(box(0.1, 0.11, 0.036), GUN, { at: pc, dir: hd.toArray(), up: nrm.toArray(), bone: wristL, name: "palmL" });
    b.part(box(0.088, 0.1, 0.012), GUN_L, { at: pc.clone().addScaledVector(nrm, -0.022), dir: hd.toArray(), up: nrm.toArray(), bone: wristL, name: "backHandL" });
    glow(b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.006, 12), TEAL, { at: pc.clone().addScaledVector(nrm, 0.02), dir: nrm.toArray(), axis: "y", bone: wristL, name: "palmEmitter" }), 1.3);
    b.part(new THREE.TorusGeometry(0.036, 0.0045, 5, 14), STEEL, { at: pc.clone().addScaledVector(nrm, 0.019), dir: nrm.toArray(), axis: "z", bone: wristL, name: "palmRing" });
    const offs = [0.036, 0.012, -0.012, -0.034];
    const spread = [0.14, 0.04, -0.06, -0.16];
    const lens = [0.085, 0.097, 0.09, 0.07];
    const radii = [0.0115, 0.0115, 0.011, 0.0098];
    const fname = ["index", "middle", "ring", "pinky"];
    for (let i = 0; i < 4; i++) {
      const base = pc.clone().addScaledVector(hd, 0.052).addScaledVector(lat, offs[i]);
      const dir = hd.clone().addScaledVector(lat, spread[i]).normalize();
      const p1 = base.clone().addScaledVector(dir, lens[i] * 0.48).addScaledVector(nrm, 0.003);
      const p2 = base.clone().addScaledVector(dir, lens[i] * 0.84).addScaledVector(nrm, 0.014);
      const ch = b.chain(`${fname[i]}L`, polyline([base, p1, p2]), { parent: wristL, names: [`${fname[i]}L1`, `${fname[i]}L2`, `${fname[i]}L3`], role: "digit" });
      b.sweep(ch, [radii[i], radii[i] * 0.78], { color: GUN, sides: 6, name: `finger${fname[i]}L` });
      glow(b.part(sph(0.0082, 6, 4), TEAL, { at: p2.clone().addScaledVector(dir, 0.012), bone: ch.joints[2], name: "fingerLed" }), 1.3);
      b.part(sph(0.0105, 6, 4), STEEL, { at: base, bone: wristL, name: "knuckleL" });
    }
    const tb = pc.clone().addScaledVector(hd, -0.02).addScaledVector(lat, 0.05);
    const td = lat.clone().multiplyScalar(0.65).addScaledVector(hd, 0.7).addScaledVector(nrm, 0.25).normalize();
    const t1 = tb.clone().addScaledVector(td, 0.04);
    const t2 = tb.clone().addScaledVector(td, 0.078).addScaledVector(nrm, 0.012);
    const thumb = b.chain("thumbL", polyline([tb, t1, t2]), { parent: wristL, names: ["thumbL1", "thumbL2", "thumbL3"], role: "digit" });
    b.sweep(thumb, [0.0135, 0.01], { color: GUN, sides: 6, name: "thumbL" });
    glow(b.part(sph(0.0085, 6, 4), TEAL, { at: t2.clone().addScaledVector(td, 0.012), bone: thumb.joints[2], name: "thumbLed" }), 1.3);
  }

  // --- right gloved fist around the staff
  {
    const palmC = [SX, 1.115, 0.31] as const;
    b.part(box(0.078, 0.108, 0.032), GUN_D, { at: palmC, bone: wristR, name: "palmR" });
    b.part(box(0.084, 0.114, 0.022), WHITE, { at: [SX, 1.115, 0.282], bone: wristR, name: "backHandR" });
    b.part(box(0.07, 0.016, 0.024), TEAL, { at: [SX, 1.115, 0.272], bone: wristR, name: "backHandStripe" });
    const yi = [1.151, 1.127, 1.103, 1.079];
    const r = [0.0112, 0.0112, 0.0108, 0.0098];
    const fname = ["index", "middle", "ring", "pinky"];
    for (let i = 0; i < 4; i++) {
      const start: [number, number, number] = [SX + 0.04, yi[i], 0.315];
      const coil = spiral([SX, yi[i], SZ], start, [0, -1, 0], { turns: 0.6, r1: 0.0345 });
      const ch = b.chain(`${fname[i]}R`, coil, { parent: wristR, count: 3, names: [`${fname[i]}R1`, `${fname[i]}R2`, `${fname[i]}R3`], role: "digit" });
      b.sweep(ch, [r[i], r[i] * 0.85], { color: GUN_D, sides: 6, name: `finger${fname[i]}R` });
      b.part(sph(0.0118, 6, 4), WHITE, { at: [SX + 0.043, yi[i], 0.32], bone: wristR, name: "knuckleR" });
    }
    const th = b.chain("thumbR", catmull([[SX + 0.035, 1.158, 0.3], [SX + 0.03, 1.178, 0.358], [SX - 0.012, 1.186, 0.388]]), {
      parent: wristR,
      names: ["thumbR1", "thumbR2", "thumbR3"],
      role: "digit",
    });
    b.sweep(th, [0.014, 0.0105], { color: GUN_D, sides: 6, name: "thumbR" });
  }

  // ================================================================ legs
  const legR = (t: number) => {
    const k = [0.094, 0.09, 0.08, 0.066, 0.063, 0.062, 0.052, 0.044];
    const f = t * (k.length - 1);
    const i = Math.min(k.length - 2, Math.floor(f));
    return k[i] + (k[i + 1] - k[i]) * (f - i);
  };
  for (const [n, sx] of [
    ["L", 1],
    ["R", -1],
  ] as const) {
    const lg = legs[n];
    const [hipJ, kneeJ, ankleJ] = lg.joints;
    const cyber = n === "L";
    // upper leg suit + lower leg
    b.sweep(lg, (t) => legR(t), {
      bands: cyber ? [[0.52, hexSuit(sx * 0.1)], [1, GUN_D]] : [[1, hexSuit(sx * 0.1)]],
      name: `suit${n}`,
    });
    // thigh armor
    b.sweep(lg, (t) => legR(t) + 0.014, { from: 0.06, to: 0.4, color: armorPaint, name: `thighArmor${n}` });
    b.sweep(lg, (t) => legR(t) + 0.018, { from: 0.04, to: 0.075, color: GUN, name: `thighBandTop${n}` });
    b.sweep(lg, (t) => legR(t) + 0.018, { from: 0.38, to: 0.42, color: GUN, name: `thighBandBot${n}` });
    glow(b.sweep(lg, (t) => legR(t) + 0.0195, { from: 0.395, to: 0.405, color: TEAL, name: `thighGlow${n}` }), 1.1);
    // knee guard
    b.lathe(
      [
        [0, 0],
        [0.07, 0],
        [0.074, 0.012],
        [0.06, 0.035],
        [0.03, 0.05],
        [0, 0.054],
      ],
      { at: [sx * 0.112, 0.525, 0.08], axis: [0, 0.1, 1], segments: 10, color: armorPaint, bone: kneeJ, name: `kneeGuard${n}` },
    );
    glow(
      b.lathe(
        [
          [0.015, 0.05],
          [0.03, 0.05],
          [0.03, 0.056],
          [0.015, 0.058],
        ],
        { at: [sx * 0.112, 0.525, 0.08], axis: [0, 0.1, 1], segments: 8, color: TEAL, bone: kneeJ, name: `kneeGlow${n}` },
      ),
      1.2,
    );
    b.part(cyl(0.046, 0.046, 0.12, 10), GUN, { at: [sx * 0.11, 0.52, 0.0], rotation: [0, 0, 90], bone: kneeJ, name: `kneeJoint${n}` });
    // shin
    if (cyber) {
      // exposed mechanical shin: white front plate, piston and coil at the calf
      b.sweep(lg, (t) => legR(t) * 0.78 + 0.012, { from: 0.58, to: 0.94, sectors: [[-75, 75, WHITE]], color: GUN_D, sides: 10, name: "shinPlateL" });
      for (const t of [0.6, 0.76, 0.93])
        glow(b.sweep(lg, (u) => legR(u) * 0.8 + 0.014, { from: t - 0.008, to: t + 0.008, color: TEAL, sides: 10, name: "shinSeamL" }), 1.1);
      for (const px of [0.062, -0.002]) {
        b.capsule([sx * (0.11 + px - 0.0), 0.5, -0.05], [sx * (0.11 + px), 0.34, -0.06], 0.014, { bone: kneeJ, color: GUN_L, name: "calfBarrel" });
        b.rod([sx * (0.11 + px), 0.34, -0.06], [sx * (0.11 + px), 0.2, -0.045], 0.0065, { bone: kneeJ, color: STEEL, name: "calfRod" });
      }
      b.sweep(
        spiral([sx * 0.11, 0.48, -0.052], [sx * 0.11 + sx * 0.024, 0.48, -0.052], [0, -1, 0], { turns: 5, pitch: 0.03, r1: 0.024 }),
        0.0035,
        { bone: kneeJ, color: STEEL, sides: 4, name: "calfCoil" },
      );
    } else {
      b.sweep(lg, (t) => legR(t) + 0.013, { from: 0.58, to: 0.94, color: armorPaint, name: `shinGuard${n}` });
      b.sweep(lg, (t) => legR(t) + 0.017, { from: 0.57, to: 0.6, color: GUN, name: `shinTop${n}` });
      glow(b.sweep(lg, (t) => legR(t) + 0.0185, { from: 0.78, to: 0.8, color: TEAL, name: `shinGlow${n}` }), 1.1);
    }
    // injector holster on the right thigh
    if (!cyber) {
      b.part(box(0.04, 0.17, 0.07), GUN, { at: [sx * 0.185, 0.78, 0.015], bone: hipJ, name: "holster" });
      for (let k = 0; k < 3; k++) {
        glow(b.part(cyl(0.011, 0.011, 0.12, 8), TEAL, { at: [sx * 0.2, 0.795, -0.0 + k * 0.026 - 0.01], bone: hipJ, name: "vial" }), 1.1);
        b.part(cyl(0.013, 0.013, 0.02, 8), STEEL, { at: [sx * 0.2, 0.865, -0.0 + k * 0.026 - 0.01], bone: hipJ, name: "vialCap" });
      }
      b.part(box(0.012, 0.012, 0.09), GUN_L, { at: [sx * 0.2, 0.74, 0.015], bone: hipJ, name: "holsterStrap" });
    }
    // boot
    const bx = sx * 0.11;
    b.extrude(
      [
        [-0.105, 0],
        [0.115, 0],
        [0.115, 0.032],
        [-0.105, 0.05],
      ],
      { at: [bx, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.118, bevel: 0.012, color: GUN_D, bone: ankleJ, name: `soleHeel${n}` },
    );
    b.extrude(
      [
        [0.115, 0],
        [0.26, 0],
        [0.29, 0.02],
        [0.29, 0.032],
        [0.115, 0.032],
      ],
      { at: [bx, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.114, bevel: 0.01, color: GUN_D, bone: toes[n], name: `soleToe${n}` },
    );
    b.extrude(
      [
        [-0.1, 0.035],
        [-0.108, 0.14],
        [-0.078, 0.245],
        [0.075, 0.25],
        [0.088, 0.16],
        [0.125, 0.085],
        [0.122, 0.035],
      ],
      { at: [bx, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: [0.11, 0.098], bevel: 0.02, smoothing: 1, color: cyber ? GUN : NAVY, bone: ankleJ, name: `bootUpper${n}` },
    );
    b.extrude(
      [
        [0.11, 0.03],
        [0.118, 0.088],
        [0.2, 0.078],
        [0.275, 0.05],
        [0.288, 0.032],
      ],
      { at: [bx, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.106, bevel: 0.016, smoothing: 1, color: WHITE, bone: toes[n], name: `toeCap${n}` },
    );
    // boot straps, buckles, sole glow, heel guard
    for (const [z0, y0] of [
      [0.0, 0.2],
      [0.05, 0.15],
    ] as const) {
      b.part(box(0.122, 0.022, 0.034), GUN, { at: [bx, y0, z0], rotation: [18, 0, 0], bone: ankleJ, name: `bootStrap${n}` });
      b.part(box(0.02, 0.026, 0.038), WHITE, { at: [bx + sx * 0.056, y0, z0], rotation: [18, 0, 0], bone: ankleJ, name: `bootBuckle${n}` });
    }
    glow(b.part(box(0.004, 0.012, 0.26), TEAL, { at: [bx + sx * 0.058, 0.02, 0.08], bone: ankleJ, name: `soleGlow${n}` }), 1.2);
    b.part(box(0.1, 0.07, 0.024), GUN, { at: [bx, 0.1, -0.1], bone: ankleJ, name: `heelGuard${n}` });
    bolt(ankleJ, [bx + sx * 0.056, 0.115, 0.05]);
    bolt(ankleJ, [bx + sx * 0.056, 0.075, 0.1]);
  }

  // ================================================================ staff
  {
    const y = (v: number): [number, number, number] => [SX, v, SZ];
    b.rod(y(0.04), y(1.62), 0.015, { bone: staff, color: GUN, sides: 8, name: "staffShaft" });
    // lower part: spike, butt cap
    b.part(new THREE.ConeGeometry(0.02, 0.05, 8), STEEL, { at: y(0.025), dir: [0, -1, 0], bone: staff, name: "staffSpike" });
    b.part(cyl(0.024, 0.021, 0.07, 8), WHITE, { at: y(0.085), bone: staff, name: "staffButt" });
    glow(b.part(cyl(0.0255, 0.0255, 0.01, 8), TEAL, { at: y(0.12), bone: staff, name: "staffButtGlow" }), 1.2);
    // grip
    b.part(new THREE.CylinderGeometry(0.0235, 0.0235, 0.19, 10), "#ffffff", { at: y(1.115), bone: staff, color: undefined, name: "staffGrip" } as never);
    // collars and rings along the shaft
    for (const [v, c] of [
      [0.3, WHITE],
      [0.62, WHITE],
      [0.95, WHITE],
      [1.32, WHITE],
      [1.5, WHITE],
    ] as const) {
      b.part(cyl(0.024, 0.024, 0.026, 8), c, { at: y(v), bone: staff, name: "staffCollar" });
      glow(b.part(cyl(0.0255, 0.0255, 0.008, 8), TEAL, { at: y(v + 0.02), bone: staff, name: "staffRingGlow" }), 1.2);
      b.part(cyl(0.0255, 0.0255, 0.008, 8), GUN_D, { at: y(v - 0.02), bone: staff, name: "staffRingDark" });
    }
    // mid ornament: hex housing with a teal core
    b.part(cyl(0.032, 0.032, 0.15, 6), GUN_D, { at: y(0.72), bone: staff, name: "staffHousing" });
    glow(b.part(cyl(0.034, 0.034, 0.05, 6), TEAL, { at: y(0.72), bone: staff, name: "staffCore" }), 1.1);
    b.part(cyl(0.036, 0.032, 0.012, 6), WHITE, { at: y(0.8), bone: staff, name: "staffHousingCapTop" });
    b.part(cyl(0.032, 0.036, 0.012, 6), WHITE, { at: y(0.64), bone: staff, name: "staffHousingCapBot" });
    // upper shaft: white glove segment
    b.part(cyl(0.019, 0.019, 0.17, 8), WHITE, { at: y(1.41), bone: staff, name: "staffUpper" });
    // chalice cup under the orb
    b.lathe(
      [
        [0, 0],
        [0.028, 0],
        [0.034, 0.02],
        [0.065, 0.1],
        [0.06, 0.112],
        [0.032, 0.054],
        [0.0, 0.05],
      ],
      { at: y(1.59), segments: 10, color: armorPaint, bone: staff, name: "staffCup" },
    );
    glow(
      b.lathe(
        [
          [0.049, 0.07],
          [0.0645, 0.098],
          [0.0615, 0.102],
          [0.046, 0.074],
        ],
        { at: y(1.59), segments: 10, color: TEAL, bone: staff, name: "staffCupGlow" },
      ),
      1.2,
    );
    // orb
    glow(b.part(sph(0.062, 12, 9), TEAL, { at: y(1.74), bone: staffRing, name: "staffOrb" }), 1.5);
    glow(b.part(sph(0.036, 8, 6), TEAL_L, { at: y(1.74), bone: staffRing, name: "staffOrbCore" }), 1.8);
    // cage prongs
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const p0: [number, number, number] = [SX + c * 0.05, 1.67, SZ + s * 0.05];
      const p1: [number, number, number] = [SX + c * 0.105, 1.74, SZ + s * 0.105];
      const p2: [number, number, number] = [SX + c * 0.075, 1.835, SZ + s * 0.075];
      const p3: [number, number, number] = [SX + c * 0.012, 1.885, SZ + s * 0.012];
      b.sweep(bezier(p0, p1, p2, p3), [0.012, 0.006], { bone: staff, color: WHITE, sides: 6, name: "staffProng" });
      glow(b.part(sph(0.009, 6, 4), TEAL, { at: p1, bone: staff, name: "prongGem" }), 1.3);
    }
    glow(b.part(new THREE.OctahedronGeometry(0.02), TEAL_L, { at: y(1.9), scale: [1, 1.5, 1], bone: staff, name: "staffTipGem" }), 1.5);
    // orbiting ring with satellites
    const ringPts: [number, number, number][] = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      ringPts.push([SX + Math.cos(a) * 0.1, 1.74 + Math.sin(a) * 0.1 * Math.sin(0.5), SZ + Math.sin(a) * 0.1 * Math.cos(0.5)]);
    }
    glow(b.sweep(catmull(ringPts, { closed: true }), 0.0055, { bone: staffRing, color: TEAL, sides: 5, name: "staffRingOrbit" }), 1.3);
    for (const k of [0, 6, 11]) {
      const q = ringPts[k];
      glow(b.part(new THREE.OctahedronGeometry(0.0135), TEAL_L, { at: q, bone: staffRing, name: "satellite" }), 1.5);
    }
    // wing fins at the cup
    for (const sx of [1, -1]) {
      const wing: OutlinePoint[] = [
        [0.02, -0.02],
        [0.1, -0.012],
        [0.19, 0.03],
        [0.15, 0.048],
        [0.215, 0.085],
        [0.155, 0.096],
        [0.2, 0.14],
        [0.1, 0.108],
        [0.03, 0.06],
      ];
      b.extrude(wing, { at: [SX, 1.61, SZ], x: [sx, 0, 0], y: [0, 1, 0], thickness: 0.014, bevel: 0.0035, color: armorPaint, bone: staff, name: "staffWing" });
      const inlay: OutlinePoint[] = [
        [0.045, 0.0],
        [0.1, 0.0],
        [0.165, 0.032],
        [0.12, 0.05],
        [0.07, 0.04],
      ];
      glow(b.extrude(inlay, { at: [SX, 1.61, SZ], x: [sx, 0, 0], y: [0, 1, 0], thickness: 0.018, bevel: 0.002, color: TEAL, bone: staff, name: "staffWingInlay" }), 1.2);
    }
    // healing flame wisps above the tip
    glow(
      b.cards([frame([SX, 1.915, SZ], [0, 1, 0])], wisp, {
        size: [0.05, 0.12],
        cross: true,
        bone: staffRing,
      }),
      1.4,
    );
    // hanging charm vial from the cup
    b.rod([SX + 0.04, 1.62, SZ + 0.03], [SX + 0.045, 1.5, SZ + 0.04], 0.002, { bone: staff, color: GUN_D, name: "charmString" });
    glow(b.part(cyl(0.01, 0.01, 0.04, 8), TEAL, { at: [SX + 0.045, 1.478, SZ + 0.04], bone: staff, name: "charmVial" }), 1.1);
    b.part(cyl(0.012, 0.012, 0.008, 8), STEEL, { at: [SX + 0.045, 1.5, SZ + 0.04], bone: staff, name: "charmCap" });
  }

  // flush merged studs
  for (const bag of bags.values()) {
    const merged = mergeGeometries(bag.geos);
    if (!merged) throw new Error(`stud merge failed for ${bag.bone.name}`);
    const p = b.part(merged, bag.color, { bone: bag.bone, at: [0, 0, 0], name: `studs.${bag.bone.name}` });
    if (bag.strength > 0) glow(p, bag.strength);
  }

  return b.root;
}
