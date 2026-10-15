// Cyborg medic: a support-hero humanoid with a healing staff, in a polished Overwatch-style sci-fi look.
// White armour over a graphite suit, one strong teal accent (glow). Left arm and half the face are cybernetic.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { limb } from "../../../../src/ik";
import { countershade, paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, polyline } from "../../../../src/path";
import type { Chain, Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Cyborg Medic",
  description:
    "Support-hero cyborg medic with a healing staff: white plated armour over a graphite suit, a cybernetic left arm and half-face plate, teal glow accents, medic pack, tabard and a glowing caduceus-style staff.",
  style: "Overwatch",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: white armour, graphite suit, steel metal, one teal accent.
const TEAL = "#1cf0d2";
const TEAL_D = "#0e9d94";
const TEAL_DEEP = "#0a6a69";
const GRAPH = "#2d3541";
const GRAPH_D = "#171c24";
const GRAPH_L = "#465263";
const STEEL = "#97a4b6";
const STEEL_D = "#566376";
const STEEL_L = "#cbd5e2";
const WHITE_L = "#f8fafc";
const WHITE_S = "#aebdd1";
const SKIN_L = "#e3a583";
const SKIN_S = "#b8785a";
const BLUSH = "#e98a80";
const LIP = "#b3524f";
const BROW = "#4a2420";
const HAIR_L = "#bd5a36";
const HAIR_D = "#5a2320";
const BELT = "#232932";

// Painted surfaces: soft hand-painted top light and cool underside shade.
const WHITE = countershade(WHITE_L, WHITE_S, { level: -0.15, soft: 0.85 });
const SUIT = countershade("#3b4553", "#1b212a", { level: 0, soft: 0.8 });
const GLOVE = countershade("#38414e", "#161b22", { level: 0, soft: 0.8 });
const METAL = countershade(STEEL, STEEL_D, { level: -0.1, soft: 0.7 });
const SKIN_BASE = countershade(SKIN_L, SKIN_S, { level: -0.1, soft: 0.9 });
const FACE = paint((p, _n) => {
  const d = Math.hypot(Math.abs(p.x) - 0.056, (p.y - 1.632) * 1.5);
  return p.z > 0.1 && d < 0.02 ? BLUSH : SKIN_BASE;
});
const HAIR = countershade(HAIR_L, HAIR_D, { level: 0.1, soft: 0.7 });

// Station tables: [y, full width, full depth, centre z]
const TORSO: number[][] = [
  [0.9, 0.29, 0.205, 0],
  [1.0, 0.31, 0.21, 0],
  [1.11, 0.27, 0.19, 0.004],
  [1.24, 0.3, 0.215, 0.012],
  [1.33, 0.34, 0.23, 0.02],
  [1.4, 0.22, 0.16, 0.025],
];
const CHEST: number[][] = [
  [1.19, 0.325, 0.235, 0.016],
  [1.26, 0.345, 0.25, 0.02],
  [1.33, 0.375, 0.255, 0.026],
  [1.385, 0.29, 0.2, 0.03],
];

function profile(st: number[][], y: number) {
  let i = 0;
  while (i < st.length - 2 && st[i + 1][0] < y) i++;
  const [y0, w0, h0, z0] = st[i];
  const [y1, w1, h1, z1] = st[i + 1];
  const t = Math.min(1, Math.max(0, (y - y0) / (y1 - y0)));
  return { w: w0 + (w1 - w0) * t, h: h0 + (h1 - h0) * t, zc: z0 + (z1 - z0) * t };
}

/** z of the front (or back) surface of a station table at height y and sideways offset x. */
function surfaceZ(st: number[][], y: number, x: number, front = true) {
  const c = profile(st, y);
  const k = Math.sqrt(Math.max(0, 1 - ((2 * x) / c.w) ** 2));
  return c.zc + (front ? 1 : -1) * (c.h / 2) * k;
}

type Side = {
  s: number;
  S: string;
  clav: Joint;
  arm: Chain;
  armPts: THREE.Vector3[];
  wrist: Joint;
  leg: Chain;
  legPts: THREE.Vector3[];
  ankle: Joint;
  toe: Joint;
};

export default function build() {
  const b = createBuilder({ name: "cyborgMedic", paintSize: 2048 });
  const D = Math.PI / 180;
  const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerp3 = (a: THREE.Vector3, c: THREE.Vector3, t: number) => a.clone().lerp(c, t);

  // Beveled box (chamfered corners) for armour plates; plain box for small details.
  const box = (w: number, h: number, d: number, r = 0.008) => new RoundedBoxGeometry(w, h, d, 1, r);
  const bx = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const sph = (r: number, ws = 10, hs = 7) => new THREE.SphereGeometry(r, ws, hs);
  const cyl = (rt: number, rb: number, h: number, seg = 10) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const tor = (r: number, t: number, rs = 5, ts = 16) => new THREE.TorusGeometry(r, t, rs, ts);

  const P = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: readonly number[], o: PartOptions = {}) =>
    b.part(geo, color, { bone, at, ...o });

  // Small static pieces merged per bone, colour and glow strength.
  const bundles = new Map<
    string,
    { joint: Joint; color: Fill; strength: number; geos: THREE.BufferGeometry[] }
  >();
  const add = (
    joint: Joint,
    color: Fill,
    geo: THREE.BufferGeometry,
    at: readonly number[],
    o: { rot?: readonly number[]; scale?: readonly number[]; glow?: number } = {},
  ) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const rot = o.rot ?? [0, 0, 0];
    const sc = o.scale ?? [1, 1, 1];
    g.applyMatrix4(
      new THREE.Matrix4().compose(
        v(at[0], at[1], at[2]),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
        v(sc[0], sc[1], sc[2]),
      ),
    );
    const strength = o.glow ?? 0;
    const key = `${joint.name}|${String(color)}|${strength}`;
    let entry = bundles.get(key);
    if (!entry) {
      entry = { joint, color, strength, geos: [] };
      bundles.set(key, entry);
    }
    entry.geos.push(g);
  };
  const flush = () => {
    for (const e of bundles.values()) {
      const merged = mergeGeometries(e.geos);
      if (!merged) throw new Error("cyborgMedic: merge failed");
      const part = b.part(merged, e.color, { bone: e.joint, at: [0, 0, 0] });
      if (e.strength > 0) glow(part, e.strength);
    }
  };

  // Armour plate laid along a segment a->c: width w (x), depth d (front-back), pushed `off` toward the front.
  const plate = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    w: number,
    d: number,
    off: number,
    bone: Joint,
    color: Fill,
    o: { t0?: number; t1?: number; side?: number; r?: number } = {},
  ) => {
    const A = lerp3(a, c, o.t0 ?? 0);
    const C = lerp3(a, c, o.t1 ?? 1);
    const dir = C.clone().sub(A);
    const f = v(0, dir.z, -dir.y).normalize();
    const mid = A.clone().add(C).multiplyScalar(0.5).addScaledVector(f, off);
    mid.x += o.side ?? 0;
    return b.part(box(w, dir.length(), d, o.r ?? 0.01), color, { bone, at: mid, dir });
  };
  // Round band (rod) between fractions t0..t1 of a segment.
  const band = (
    a: THREE.Vector3,
    c: THREE.Vector3,
    t0: number,
    t1: number,
    r0: number,
    r1: number,
    color: Fill,
    bone: Joint,
    sides = 10,
  ) => b.rod(lerp3(a, c, t0), lerp3(a, c, t1), [r0, r1], { color, bone, sides });

  // ---------------------------------------------------------------------------------------------------------------
  // Textures
  const EYE = svg(
    `<svg viewBox="0 0 100 64">
    <defs><clipPath id="e"><path d="M4 38 Q30 8 56 8 Q86 10 96 34 Q70 58 40 56 Q14 54 4 38Z"/></clipPath></defs>
    <path d="M4 38 Q30 8 56 8 Q86 10 96 34 Q70 58 40 56 Q14 54 4 38Z" fill="#f4f1ee"/>
    <g clip-path="url(#e)">
      <circle cx="55" cy="33" r="22" fill="#12b8a8"/>
      <circle cx="55" cy="40" r="20" fill="#5df2dc" fill-opacity="0.55"/>
      <circle cx="55" cy="33" r="22" fill="none" stroke="#0a5d63" stroke-width="4"/>
      <circle cx="55" cy="33" r="9.5" fill="#0e1f27"/>
      <rect x="0" y="0" width="100" height="19" fill="#2a1512" fill-opacity="0.28"/>
    </g>
    <circle cx="45" cy="24" r="6.4" fill="#ffffff"/>
    <circle cx="67" cy="43" r="3.2" fill="#ffffff"/>
    <path d="M4 38 Q30 8 56 8 Q86 10 96 34" stroke="#2a1512" stroke-width="5.4" stroke-linecap="round" fill="none"/>
    <path d="M7 36 Q2 28 5 19" stroke="#2a1512" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M14 51 Q40 62 76 48" stroke="#b9795e" stroke-width="2.6" stroke-linecap="round" fill="none"/>
  </svg>`,
    { size: 256 },
  );
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100">
    <polygon points="50,3 92,26 92,74 50,97 8,74 8,26" fill="none" stroke="#2d3541" stroke-width="4.4" stroke-linejoin="round"/>
    <polygon points="50,12 84,31 84,69 50,88 16,69 16,31" fill="none" stroke="#1cf0d2" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M40 24 H60 V40 H76 V60 H60 V76 H40 V60 H24 V40 H40Z" fill="#1cf0d2" stroke="#2d3541" stroke-width="4" stroke-linejoin="round"/>
  </svg>`,
    { size: 384 },
  );
  const CIRCUIT = svg(
    `<svg viewBox="0 0 128 64">
    <g fill="none" stroke="#1cf0d2" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 32 H34 L44 18 H70 L80 32 H122"/><path d="M20 50 H52 L60 40 H96 L104 50 H122"/>
      <path d="M34 32 V50"/><path d="M80 32 V14 H110"/>
    </g>
    <g fill="#1cf0d2"><circle cx="6" cy="32" r="4"/><circle cx="122" cy="32" r="4"/><circle cx="110" cy="14" r="3.4"/><circle cx="20" cy="50" r="3.4"/></g>
  </svg>`,
    { size: 256 },
  );
  const PACK = svg(
    `<svg viewBox="0 0 64 96">
    <rect x="2" y="2" width="60" height="92" rx="7" fill="#2d3541" stroke="#1cf0d2" stroke-width="2"/>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="9" y="${10 + i * 8.5}" width="46" height="4.4" rx="2" fill="#0f141a"/>`).join("")}
    <path d="M28 70 H36 V76 H42 V84 H36 V90 H28 V84 H22 V76 H28Z" fill="#1cf0d2"/>
  </svg>`,
    { size: 256 },
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton
  const hips = b.joint("hips", { at: [0, 0.95, 0], dir: [0, 1, 0], role: "spine" });
  const spine = b.chain(
    "spine",
    polyline([
      [0, 1.0, 0],
      [0, 1.127, 0.006],
      [0, 1.253, 0.012],
      [0, 1.38, 0.02],
    ]),
    { parent: hips, role: "spine", names: ["spine1", "spine2", "spine3"] },
  );
  const waist = spine.joints[0];
  const abdomen = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.chain(
    "neck",
    polyline([
      [0, 1.38, 0.02],
      [0, 1.46, 0.04],
      [0, 1.53, 0.06],
    ]),
    { parent: chest, role: "neck", names: ["neck1", "neck2"] },
  );
  const head = b.joint("head", { parent: neck.joints[1], at: [0, 1.53, 0.06], dir: [0, 1, 0.08], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 1.628, 0.035], aim: [0, 1.585, 0.12], role: "jaw" });

  const sides: Side[] = [];
  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const clav = b.joint(`clavicle${S}`, { parent: chest, at: [s * 0.05, 1.345, 0.03], aim: [s * 0.19, 1.335, 0.012] });
    const armPts = limb([s * 0.2, 1.33, 0.012], [s * 0.37, 0.83, 0.06], [0.29, 0.27], [[0, 0, -1]]);
    const arm = b.chain(`arm${S}`, armPts, {
      parent: clav,
      role: "arm",
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
    });
    const legPts = limb([s * 0.095, 0.93, 0], [s * 0.1, 0.1, 0], [0.45, 0.43], [[0, 0, 1]]);
    const leg = b.chain(`leg${S}`, legPts, {
      parent: hips,
      role: "leg",
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      contact: [s * 0.1, 0, 0.06],
    });
    const ankle = leg.tip as Joint;
    const toe = b.joint(`toe${S}`, {
      parent: ankle,
      at: [s * 0.1, 0.05, 0.13],
      aim: [s * 0.1, 0.04, 0.25],
      role: "digit",
    });
    sides.push({ s, S, clav, arm, armPts, wrist: arm.tip as Joint, leg, legPts, ankle, toe });
  }
  const sideR = sides[1];

  // Staff, held in the right hand and planted on the floor.
  const X0 = -0.395;
  const Z0 = 0.07;
  const staffJ = b.joint("staff", { parent: sideR.wrist, at: [X0, 0.77, Z0], dir: [0, 1, 0] });

  // ---------------------------------------------------------------------------------------------------------------
  // Torso: graphite undersuit, white chest armour, collar, belt
  const torso = b.loft(
    TORSO.map(([y, w, h, z]) => ({ at: [0, y, z], w, h })),
    { bone: [hips, spine], color: SUIT, sides: 12, caps: "flat" },
  );
  const chestArmor = b.loft(
    CHEST.map(([y, w, h, z]) => ({ at: [0, y, z], w, h })),
    { bone: spine, color: WHITE, sides: 12, caps: "flat" },
  );
  glow(b.decal(chestArmor, EMBLEM, { at: [0, 1.3, 0.2], dir: [0, 0, 1], size: [0.12, 0.12], lift: 0.003 }));

  const torsoSkin = b.surface(torso);
  b.sweep(torsoSkin.loop([0, 1.02, 0], { lift: 0.004 }), 0.02, { color: BELT, sides: 8 });
  b.sweep(torsoSkin.loop([0, 1.075, 0.004], { lift: 0.002 }), 0.006, { color: GRAPH_L, sides: 6 });
  glow(b.sweep(b.surface(chestArmor).loop([0, 1.215, 0.016], { lift: 0.003 }), 0.0045, { color: TEAL, sides: 6 }));

  // Collar: high white ring with a glowing lip.
  b.lathe(
    [
      [0.056, 0],
      [0.098, 0],
      [0.104, 0.02],
      [0.082, 0.058],
      [0.064, 0.058],
      [0.058, 0.02],
    ],
    { at: [0, 1.385, 0.03], bone: chest, color: WHITE, segments: 12, smoothing: 1 },
  );
  add(chest, TEAL, tor(0.07, 0.0045, 5, 16), [0, 1.442, 0.03], { rot: [90, 0, 0], glow: 1 });
  // Yoke plates over the trapezius
  for (const s of [1, -1]) {
    add(chest, WHITE, box(0.12, 0.03, 0.16, 0.01), [s * 0.1, 1.395, 0.02], { rot: [0, 0, -s * 25] });
    add(chest, TEAL, bx(0.1, 0.004, 0.012), [s * 0.1, 1.406, 0.1], { rot: [0, 0, -s * 25], glow: 1 });
  }
  // Chest rivets and sternum light
  for (const x of [-0.12, -0.085, 0.085, 0.12]) {
    add(chest, STEEL_L, sph(0.0045, 6, 4), [x, 1.205, surfaceZ(CHEST, 1.205, x) + 0.001]);
    add(chest, STEEL_L, sph(0.0045, 6, 4), [x, 1.205, surfaceZ(CHEST, 1.205, x, false) - 0.001]);
  }
  add(chest, TEAL, bx(0.012, 0.05, 0.006), [0, 1.18, surfaceZ(TORSO, 1.18, 0) + 0.002], { glow: 1 });
  // Side glow strips on the armour
  for (const s of [1, -1]) {
    add(chest, TEAL, bx(0.007, 0.1, 0.012), [s * 0.17, 1.28, surfaceZ(CHEST, 1.28, s * 0.17) - 0.01], { glow: 1 });
    add(chest, GRAPH_D, bx(0.012, 0.11, 0.02), [s * 0.178, 1.28, 0.025]);
    // Abs plates
    for (const y of [1.06, 1.115, 1.162]) {
      add(abdomen, GRAPH_L, box(0.075, 0.03, 0.012, 0.005), [s * 0.045, y, surfaceZ(TORSO, y, s * 0.045) + 0.003]);
    }
  }

  // Belt buckle, medkit pouch, vial belt
  P(box(0.075, 0.055, 0.024, 0.01), WHITE, waist, [0, 1.02, 0.132]);
  add(waist, TEAL, bx(0.032, 0.008, 0.005), [0, 1.02, 0.146], { glow: 1.2 });
  add(waist, TEAL, bx(0.008, 0.032, 0.005), [0, 1.02, 0.146], { glow: 1.2 });
  P(box(0.075, 0.085, 0.05, 0.012), WHITE, hips, [0.125, 0.965, 0.09], { rotation: [0, 18, 0] });
  add(hips, TEAL, bx(0.03, 0.008, 0.004), [0.133, 0.965, 0.117], { rot: [0, 18, 0], glow: 1.2 });
  add(hips, TEAL, bx(0.008, 0.03, 0.004), [0.133, 0.965, 0.117], { rot: [0, 18, 0], glow: 1.2 });
  add(hips, GRAPH_D, bx(0.08, 0.012, 0.054), [0.125, 1.0, 0.09], { rot: [0, 18, 0] });
  for (let i = 0; i < 4; i++) {
    add(waist, TEAL, cyl(0.0085, 0.0085, 0.05, 6), [-0.09 + i * 0.027, 0.995, 0.112 + Math.abs(i - 1.5) * -0.004], {
      glow: 1,
    });
    add(waist, STEEL_L, cyl(0.0095, 0.0095, 0.008, 6), [-0.09 + i * 0.027, 1.022, 0.112 + Math.abs(i - 1.5) * -0.004]);
  }

  // Hip armour, tabard (front) and swallow tail (back)
  for (const s of [1, -1]) {
    P(box(0.05, 0.11, 0.155, 0.012), WHITE, hips, [s * 0.165, 0.975, 0], { rotation: [0, 0, -s * 6] });
    add(hips, TEAL, bx(0.006, 0.07, 0.01), [s * 0.192, 0.975, 0.045], { rot: [0, 0, -s * 6], glow: 1 });
    add(hips, STEEL_L, sph(0.006, 6, 4), [s * 0.19, 1.02, 0.07]);
    add(hips, STEEL_L, sph(0.006, 6, 4), [s * 0.19, 1.02, -0.07]);
  }
  const tabard: OutlinePoint[] = [
    [-0.075, 0],
    [0.075, 0],
    [0.062, -0.17],
    [0, -0.25, "sharp"],
    [-0.062, -0.17],
  ];
  const tabardEdge: OutlinePoint[] = [
    [-0.085, 0.006],
    [0.085, 0.006],
    [0.072, -0.178],
    [0, -0.27, "sharp"],
    [-0.072, -0.178],
  ];
  b.extrude(tabardEdge, { at: [0, 1.0, 0.116], x: [1, 0, 0], thickness: 0.008, bevel: 0.002, color: TEAL_DEEP, bone: hips });
  b.extrude(tabard, { at: [0, 0.998, 0.122], x: [1, 0, 0], thickness: 0.01, bevel: 0.003, color: WHITE, bone: hips });
  glow(
    b.extrude(
      [
        [-0.008, -0.04],
        [0.008, -0.04],
        [0.008, -0.17],
        [0, -0.2, "sharp"],
        [-0.008, -0.17],
      ],
      { at: [0, 0.998, 0.126], x: [1, 0, 0], thickness: 0.008, color: TEAL, bone: hips },
    ),
  );
  const tail: OutlinePoint[] = [
    [-0.1, 0],
    [0.1, 0],
    [0.11, -0.13],
    [0.07, -0.33, "sharp"],
    [0, -0.17, "sharp"],
    [-0.07, -0.33, "sharp"],
    [-0.11, -0.13],
  ];
  const tailEdge: OutlinePoint[] = [
    [-0.11, 0.006],
    [0.11, 0.006],
    [0.122, -0.135],
    [0.072, -0.35, "sharp"],
    [0, -0.18, "sharp"],
    [-0.072, -0.35, "sharp"],
    [-0.122, -0.135],
  ];
  b.extrude(tailEdge, { at: [0, 1.0, -0.118], x: [1, 0, 0], thickness: 0.008, bevel: 0.002, color: TEAL_DEEP, bone: hips });
  b.extrude(tail, { at: [0, 0.998, -0.124], x: [1, 0, 0], thickness: 0.01, bevel: 0.003, color: WHITE, bone: hips });

  // Medic pack on the back
  P(box(0.27, 0.3, 0.09, 0.02), WHITE, abdomen, [0, 1.2, -0.152]);
  P(box(0.2, 0.22, 0.02, 0.01), GRAPH, abdomen, [0, 1.2, -0.2]);
  b.part(new THREE.PlaneGeometry(0.17, 0.25), "#ffffff", {
    bone: abdomen,
    at: [0, 1.2, -0.2115],
    dir: [0, 0, -1],
    axis: "z",
    texture: PACK,
  });
  for (const s of [1, -1]) {
    P(cyl(0.024, 0.024, 0.24, 8), STEEL_L, abdomen, [s * 0.1, 1.2, -0.185]);
    glow(P(cyl(0.017, 0.017, 0.22, 8), TEAL, abdomen, [s * 0.1, 1.2, -0.185]));
    P(cyl(0.028, 0.028, 0.025, 8), GRAPH, abdomen, [s * 0.1, 1.33, -0.185]);
    P(cyl(0.028, 0.028, 0.025, 8), GRAPH, abdomen, [s * 0.1, 1.07, -0.185]);
    add(abdomen, TEAL_D, bx(0.012, 0.28, 0.02), [s * 0.14, 1.2, -0.152]);
  }
  P(cyl(0.012, 0.014, 0.1, 6), STEEL, abdomen, [0.0, 1.38, -0.17]);
  glow(P(sph(0.011, 6, 5), TEAL, abdomen, [0, 1.436, -0.17]), 1.3);
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.06, 1.05, -0.2],
        [s * 0.09, 0.99, -0.19],
        [s * 0.15, 0.97, -0.12],
        [s * 0.16, 0.97, -0.03],
      ]),
      0.008,
      { color: GRAPH_D, bone: waist, sides: 6 },
    );
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Neck and head
  b.sweep(neck, [0.05, 0.046, 0.043], { color: SKIN_BASE, sides: 10 });
  add(neck.joints[0], STEEL, box(0.03, 0.04, 0.012, 0.004), [0.04, 1.455, 0.06], { rot: [0, -25, 0] });
  add(neck.joints[0], TEAL, sph(0.006, 5, 4), [0.044, 1.455, 0.068], { glow: 1.2 });
  add(neck.joints[0], TEAL, sph(0.006, 5, 4), [0.047, 1.44, 0.058], { glow: 1.2 });

  const HC = [0, 1.665, 0.08];
  const skull = P(sph(1, 16, 12), FACE, head, HC, { scale: [0.092, 0.108, 0.098] });
  P(sph(1, 12, 8), FACE, jaw, [0, 1.6, 0.075], { scale: [0.07, 0.058, 0.082] });
  P(sph(1, 8, 6), SKIN_BASE, jaw, [0, 1.557, 0.125], { scale: [0.028, 0.022, 0.028] });
  P(cone(0.012, 0.04), SKIN_BASE, head, [0, 1.648, 0.178], { dir: [0, -0.32, 1] });
  for (const s of [1, -1]) P(sph(1, 6, 5), SKIN_BASE, head, [s * 0.017, 1.636, 0.165], { scale: [0.009, 0.008, 0.008] });

  // Right eye (human) as a decal; left eye is cybernetic.
  b.decal(skull, EYE, { at: [-0.043, 1.672, 0.17], dir: [0, 0, 1], size: [0.052, 0.033], lift: 0.0015 });
  b.sweep(
    catmull([
      [-0.02, 1.703, 0.174],
      [-0.045, 1.709, 0.164],
      [-0.066, 1.706, 0.145],
    ]),
    0.0042,
    { color: BROW, bone: head, sides: 6 },
  );
  // Lips
  b.sweep(
    catmull([
      [-0.024, 1.603, 0.157],
      [-0.012, 1.606, 0.16],
      [0, 1.607, 0.162],
      [0.012, 1.606, 0.16],
      [0.024, 1.603, 0.157],
    ]),
    0.0045,
    { color: LIP, bone: head, sides: 6 },
  );
  b.sweep(
    catmull([
      [-0.02, 1.592, 0.154],
      [0, 1.59, 0.159],
      [0.02, 1.592, 0.154],
    ]),
    0.0052,
    { color: LIP, bone: jaw, sides: 6 },
  );

  // Cybernetic half-face plate (front-left quadrant shell) with a lens eye
  P(new THREE.SphereGeometry(1, 12, 8, Math.PI * 0.53, Math.PI * 0.32, Math.PI * 0.327, Math.PI * 0.32), WHITE, head, HC, {
    scale: [0.0957, 0.1123, 0.1019],
  });
  P(cyl(0.023, 0.023, 0.008, 10), GRAPH_D, head, [0.043, 1.672, 0.166], { dir: [0.5, 0, 1] });
  glow(P(cyl(0.0155, 0.0155, 0.01, 10), TEAL, head, [0.0445, 1.6725, 0.1685], { dir: [0.5, 0, 1] }), 1.3);
  P(cyl(0.006, 0.006, 0.012, 8), GRAPH_D, head, [0.0455, 1.6725, 0.1705], { dir: [0.5, 0, 1] });
  P(sph(0.0032, 5, 4), "#ffffff", head, [0.039, 1.678, 0.173]);
  b.sweep(
    catmull([
      [0.022, 1.706, 0.176],
      [0.05, 1.71, 0.164],
      [0.08, 1.706, 0.13],
    ]),
    0.005,
    { color: STEEL_L, bone: head, sides: 6 },
  );
  glow(
    b.sweep(
      catmull([
        [0.052, 1.664, 0.17],
        [0.072, 1.664, 0.153],
        [0.089, 1.664, 0.125],
      ]),
      0.0035,
      { color: TEAL, bone: head, sides: 5 },
    ),
  );
  glow(
    b.sweep(
      catmull([
        [0.04, 1.642, 0.155],
        [0.06, 1.645, 0.14],
        [0.082, 1.65, 0.112],
      ]),
      0.003,
      { color: TEAL, bone: head, sides: 5 },
    ),
  );

  // Ears: right is human with a stud, left carries a headset with antenna and mic boom
  P(sph(1, 6, 5), SKIN_BASE, head, [-0.099, 1.662, 0.073], { scale: [0.012, 0.028, 0.02] });
  glow(P(sph(0.006, 5, 4), TEAL, head, [-0.106, 1.645, 0.076]), 1.2);
  P(cyl(0.031, 0.031, 0.022, 12), STEEL, head, [0.106, 1.664, 0.074], { dir: [1, 0, 0] });
  P(cyl(0.023, 0.023, 0.012, 12), GRAPH, head, [0.119, 1.664, 0.074], { dir: [1, 0, 0] });
  glow(P(cyl(0.015, 0.015, 0.012, 10), TEAL, head, [0.123, 1.664, 0.074], { dir: [1, 0, 0] }), 1.3);
  b.sweep(
    catmull([
      [0.108, 1.69, 0.07],
      [0.116, 1.73, 0.05],
      [0.108, 1.78, 0.025],
    ]),
    [0.0045, 0.0025],
    { color: STEEL_L, bone: head, sides: 6, caps: { start: "round", end: "round" } },
  );
  glow(P(sph(0.0065, 5, 4), TEAL, head, [0.108, 1.784, 0.024]), 1.4);
  b.sweep(
    catmull([
      [0.112, 1.65, 0.082],
      [0.098, 1.62, 0.128],
      [0.074, 1.601, 0.15],
      [0.04, 1.594, 0.162],
    ]),
    0.003,
    { color: GRAPH_D, bone: head, sides: 5 },
  );
  P(sph(0.0075, 6, 4), TEAL_D, head, [0.04, 1.594, 0.164]);

  // Hair: tilted cap leaves the forehead free, side-swept bangs, ponytail on a three-bone chain
  P(new THREE.SphereGeometry(1, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), HAIR, head, [0, 1.669, 0.074], {
    scale: [0.099, 0.114, 0.108],
    rotation: [-45, 0, 0],
  });
  const lock = (pts: number[][], r: [number, number]) =>
    b.sweep(catmull(pts), r, { color: HAIR, bone: head, sides: 6, caps: { start: "round", end: "point" } });
  lock(
    [
      [0.02, 1.788, 0.08],
      [-0.015, 1.778, 0.135],
      [-0.055, 1.752, 0.16],
      [-0.094, 1.712, 0.15],
    ],
    [0.022, 0.007],
  );
  lock(
    [
      [0.045, 1.78, 0.09],
      [0.01, 1.77, 0.14],
      [-0.03, 1.752, 0.166],
      [-0.07, 1.724, 0.17],
    ],
    [0.018, 0.006],
  );
  lock(
    [
      [-0.09, 1.7, 0.12],
      [-0.099, 1.645, 0.118],
      [-0.09, 1.585, 0.1],
    ],
    [0.013, 0.004],
  );
  lock(
    [
      [0.06, 1.77, 0.1],
      [0.095, 1.74, 0.12],
      [0.1, 1.72, 0.09],
    ],
    [0.014, 0.006],
  );
  const pony = b.chain(
    "ponytail",
    catmull([
      [0, 1.75, -0.075],
      [0, 1.72, -0.17],
      [0, 1.62, -0.215],
      [0, 1.51, -0.2],
      [0, 1.42, -0.17],
    ]),
    { parent: head, role: "tail", names: ["ponytail1", "ponytail2", "ponytail3", "ponytail4"] },
  );
  b.sweep(pony, (t: number): [number, number] => [0.042 - 0.032 * t, 0.034 - 0.026 * t], {
    color: HAIR,
    sides: 8,
    caps: { start: "round", end: "point" },
  });
  const tie = pony.at(0.1);
  P(cyl(0.046, 0.046, 0.022, 10), TEAL_D, tie.bone ?? head, tie.at.toArray(), { dir: tie.tangent });
  glow(P(tor(0.047, 0.004, 4, 12), TEAL, tie.bone ?? head, tie.at.toArray(), { dir: tie.tangent, axis: "z" }), 1.1);

  // ---------------------------------------------------------------------------------------------------------------
  // Arms
  const finger = (name: string, pts: THREE.Vector3[], parent: Joint, r: [number, number], color: Fill) => {
    const ch = b.chain(name, catmull(pts), { parent, role: "digit", names: [`${name}_1`, `${name}_2`, `${name}_3`] });
    b.sweep(ch, r, { color, sides: 6 });
    return ch;
  };
  const pauldron = (sd: Side, scale: number, color: Fill, trim: Fill, glowTrim: boolean) => {
    const sj = sd.arm.joints[0];
    const S = sd.armPts[0];
    const axis = v(sd.s * 0.45, 1, 0).normalize();
    const outline = (
      [
        [0, 0.07],
        [0.055, 0.064],
        [0.1, 0.04],
        [0.122, 0.0],
        [0.126, -0.03],
        [0.108, -0.036],
        [0.1, -0.012],
        [0.075, 0.018],
        [0, 0.034],
      ] as number[][]
    ).map(([x, y]): OutlinePoint => [x * scale, y * scale]);
    const c = S.clone().add(v(sd.s * 0.032, 0.03, 0));
    b.lathe(outline, { at: c, axis, bone: sj, color, segments: 12, smoothing: 1 });
    const rim = c.clone().addScaledVector(axis, -0.02 * scale);
    const ring = P(tor(0.125 * scale, 0.005, 5, 20), trim, sj, rim.toArray(), { dir: axis, axis: "z" });
    if (glowTrim) glow(ring, 1.1);
    // pauldron bolts
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.4;
      const ox = Math.cos(a) * 0.075 * scale;
      const oz = Math.sin(a) * 0.075 * scale;
      add(sj, STEEL_L, sph(0.0055, 5, 4), [c.x + ox + sd.s * 0.012, c.y + 0.052 * scale, c.z + oz]);
    }
  };

  for (const sd of sides) {
    const s = sd.s;
    const [S, E, W] = sd.armPts;
    const [sj, ej] = sd.arm.joints;
    const wj = sd.wrist;

    if (s < 0) {
      // Right arm: graphite sleeve, white armour, glove
      b.sweep(sd.arm, [0.046, 0.044, 0.04, 0.037, 0.034, 0.031], { color: SUIT, sides: 10 });
      pauldron(sd, 1, WHITE, TEAL_D, false);
      band(S, E, 0.2, 0.74, 0.054, 0.05, WHITE, sj);
      band(S, E, 0.18, 0.2, 0.056, 0.056, GRAPH_D, sj);
      glow(band(S, E, 0.74, 0.76, 0.055, 0.055, TEAL, sj));
      P(sph(1, 10, 7), WHITE, ej, [E.x, E.y, E.z - 0.03], { scale: [0.047, 0.052, 0.042] });
      band(E, W, 0.22, 0.88, 0.05, 0.042, WHITE, ej);
      glow(band(E, W, 0.9, 0.925, 0.044, 0.044, TEAL, ej));
      band(E, W, 0.925, 1.0, 0.04, 0.038, GLOVE, ej);
      plate(E, W, 0.014, 0.06, 0, ej, WHITE, { side: s * 0.053, t0: 0.28, t1: 0.78 });
      plate(E, W, 0.012, 0.012, 0.05, ej, TEAL_D, { t0: 0.3, t1: 0.8, r: 0.004 });

      // Hand wrapped round the staff
      P(box(0.092, 0.095, 0.032, 0.01), GLOVE, wj, [X0, 0.765, 0.036]);
      P(box(0.078, 0.07, 0.012, 0.006), WHITE, wj, [X0, 0.768, 0.014]);
      add(wj, TEAL, bx(0.04, 0.008, 0.006), [X0, 0.768, 0.007], { glow: 1 });
      const R = 0.03;
      [0.795, 0.773, 0.751, 0.729].forEach((y, i) => {
        const pts = [-150, -50, 50, 150].map((a) => v(X0 + R * Math.sin(a * D), y, Z0 + R * Math.cos(a * D)));
        const ch = finger(`fingerR${i + 1}`, pts, wj, [0.0108, 0.0095], GLOVE);
        add(ch.joints[2], TEAL_D, sph(0.0095, 5, 4), pts[3].toArray());
      });
      const thumbPts = [130, 80, 20, -30].map((a) => v(X0 + R * Math.sin(a * D), 0.82, Z0 + R * Math.cos(a * D)));
      finger("thumbR", thumbPts, wj, [0.0118, 0.0095], GLOVE);
    } else {
      // Left arm: cybernetic. Steel limb, exposed conduits, glow rings.
      pauldron(sd, 1.12, WHITE, TEAL, true);
      P(sph(1, 10, 8), METAL, sj, S.toArray(), { scale: [0.056, 0.056, 0.056] });
      glow(P(tor(0.05, 0.0045, 5, 18), TEAL, sj, S.toArray(), { dir: [0.4, -1, 0.1], axis: "z" }), 1);
      b.rod(S, E, [0.037, 0.033], { color: METAL, bone: sj, sides: 10 });
      band(S, E, 0.1, 0.2, 0.043, 0.043, STEEL_L, sj);
      glow(band(S, E, 0.2, 0.218, 0.044, 0.044, TEAL, sj));
      band(S, E, 0.5, 0.64, 0.042, 0.042, STEEL_L, sj);
      glow(band(S, E, 0.64, 0.658, 0.043, 0.043, TEAL, sj));
      band(S, E, 0.78, 0.9, 0.04, 0.04, STEEL_L, sj);
      glow(b.rod(S.clone().add(v(0.036, 0, 0)), E.clone().add(v(0.036, 0, 0)), 0.0055, { color: TEAL, bone: sj, sides: 5 }));
      b.rod(S.clone().add(v(0, 0, 0.037)), E.clone().add(v(0, 0, 0.037)), 0.007, { color: GRAPH_D, bone: sj, sides: 6 });
      b.rod(S.clone().add(v(0, 0, -0.037)), E.clone().add(v(0, 0, -0.037)), 0.007, { color: GRAPH_D, bone: sj, sides: 6 });
      plate(S, E, 0.04, 0.012, -0.04, sj, WHITE, { t0: 0.25, t1: 0.46, r: 0.005 });
      // Elbow
      P(sph(1, 10, 8), METAL, ej, E.toArray(), { scale: [0.047, 0.047, 0.047] });
      glow(P(cyl(0.02, 0.02, 0.012, 10), TEAL, ej, E.clone().add(v(0.044, 0, 0)).toArray(), { dir: [1, 0, 0] }), 1.2);
      P(cyl(0.026, 0.026, 0.01, 10), STEEL_L, ej, E.clone().add(v(0.04, 0, 0)).toArray(), { dir: [1, 0, 0] });
      // Forearm
      const fore = b.rod(E, W, [0.045, 0.037], { color: METAL, bone: ej, section: { ngon: 8 } });
      plate(E, W, 0.075, 0.03, 0.038, ej, WHITE, { t0: 0.12, t1: 0.64, r: 0.012 });
      plate(E, W, 0.03, 0.07, 0, ej, WHITE, { side: 0.046, t0: 0.16, t1: 0.6, r: 0.01 });
      glow(plate(E, W, 0.012, 0.006, 0.054, ej, TEAL, { t0: 0.22, t1: 0.56, r: 0.003 }));
      band(E, W, 0.84, 0.96, 0.041, 0.04, STEEL_L, ej);
      glow(band(E, W, 0.96, 0.985, 0.0405, 0.0405, TEAL, ej));
      glow(b.decal(fore, CIRCUIT, { at: lerp3(E, W, 0.44).add(v(0.046, 0, 0)), dir: [1, 0, 0], size: [0.1, 0.05], lift: 0.002 }));
      // Hand
      const dirv = W.clone().sub(E).normalize();
      P(box(0.034, 0.09, 0.086, 0.01), METAL, wj, W.clone().addScaledVector(dirv, 0.052).toArray(), { dir: dirv });
      glow(P(box(0.005, 0.04, 0.03, 0.002), TEAL, wj, W.clone().addScaledVector(dirv, 0.05).add(v(0.019, 0, 0)).toArray(), { dir: dirv }));
      const inw = v(-1, 0, 0);
      const zax = v(0, 0, 1);
      const turn = (d: THREE.Vector3, k: THREE.Vector3, deg: number) =>
        d.clone().multiplyScalar(Math.cos(deg * D)).addScaledVector(k, Math.sin(deg * D)).normalize();
      const lens = [0.075, 0.086, 0.08, 0.066];
      const zs = [0.03, 0.01, -0.01, -0.03];
      lens.forEach((len, i) => {
        const p0 = W.clone().addScaledVector(dirv, 0.098).add(v(0, 0, zs[i]));
        const p1 = p0.clone().addScaledVector(dirv, len * 0.4);
        const p2 = p1.clone().addScaledVector(turn(dirv, inw, 14), len * 0.33);
        const p3 = p2.clone().addScaledVector(turn(dirv, inw, 42), len * 0.27);
        const ch = finger(`fingerL${i + 1}`, [p0, p1, p2, p3], wj, [0.0095, 0.0065], METAL);
        add(ch.joints[1], STEEL_L, sph(0.0098, 6, 4), p1.toArray());
        add(ch.joints[2], STEEL_L, sph(0.0082, 6, 4), p2.toArray());
        add(ch.joints[2], TEAL, sph(0.0068, 6, 4), p3.toArray(), { glow: 1.2 });
      });
      const t0 = W.clone().addScaledVector(dirv, 0.04).add(v(0, 0, 0.042));
      const t1 = t0.clone().addScaledVector(turn(turn(dirv, zax, 55), inw, 8), 0.03);
      const t2 = t1.clone().addScaledVector(turn(turn(dirv, zax, 20), inw, 30), 0.028);
      const t3 = t2.clone().addScaledVector(turn(dirv, inw, 55), 0.024);
      const th = finger("thumbL", [t0, t1, t2, t3], wj, [0.011, 0.0075], METAL);
      add(th.joints[1], STEEL_L, sph(0.011, 6, 4), t1.toArray());
      add(th.joints[2], TEAL, sph(0.0075, 6, 4), t3.toArray(), { glow: 1.2 });
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs and boots
  for (const sd of sides) {
    const s = sd.s;
    const [H, K, A] = sd.legPts;
    const [hj, kj] = sd.leg.joints;
    b.sweep(sd.leg, [0.088, 0.08, 0.068, 0.06, 0.052, 0.046], { color: SUIT, sides: 10 });
    // Thigh armour
    plate(H, K, 0.112, 0.03, 0.083, hj, WHITE, { t0: 0.1, t1: 0.76, r: 0.012 });
    plate(H, K, 0.026, 0.1, 0, hj, WHITE, { side: s * 0.078, t0: 0.12, t1: 0.62, r: 0.01 });
    glow(plate(H, K, 0.01, 0.014, 0.1, hj, TEAL, { t0: 0.18, t1: 0.7, r: 0.004 }));
    plate(H, K, 0.1, 0.03, -0.075, hj, GRAPH_L, { t0: 0.15, t1: 0.7, r: 0.01 });
    band(H, K, 0.8, 0.86, 0.068, 0.066, GRAPH_D, hj);
    // Knee
    P(sph(1, 10, 8), WHITE, kj, [K.x, K.y, K.z + 0.06], { scale: [0.07, 0.062, 0.05] });
    glow(P(sph(0.013, 6, 5), TEAL, kj, [K.x, K.y + 0.003, K.z + 0.107]), 1.2);
    P(tor(0.036, 0.006, 5, 14), GRAPH_D, kj, [K.x, K.y + 0.003, K.z + 0.098], { dir: [0, 0, 1], axis: "z" });
    // Shin
    plate(K, A, 0.092, 0.03, 0.056, kj, WHITE, { t0: 0.1, t1: 0.82, r: 0.012 });
    plate(K, A, 0.086, 0.04, -0.045, kj, GRAPH_L, { t0: 0.12, t1: 0.62, r: 0.012 });
    glow(plate(K, A, 0.01, 0.03, 0, kj, TEAL, { side: s * 0.057, t0: 0.2, t1: 0.76, r: 0.004 }));
    band(K, A, 0.84, 0.92, 0.056, 0.052, GRAPH_D, kj);
    add(kj, STEEL_L, sph(0.0055, 5, 4), [K.x + s * 0.03, K.y - 0.07, K.z + 0.07]);
    add(kj, STEEL_L, sph(0.0055, 5, 4), [K.x - s * 0.03, K.y - 0.07, K.z + 0.07]);
    // Boots
    const x = s * 0.1;
    const aj = sd.ankle;
    P(box(0.112, 0.03, 0.295, 0.012), GRAPH_D, aj, [x, 0.015, 0.062]);
    P(box(0.108, 0.014, 0.29, 0.005), WHITE, aj, [x, 0.037, 0.062]);
    P(cyl(0.057, 0.062, 0.11, 8), GRAPH, aj, [x, 0.14, -0.006]);
    P(box(0.1, 0.075, 0.1, 0.014), GRAPH, aj, [x, 0.08, 0.05]);
    P(box(0.09, 0.016, 0.07, 0.006), WHITE, aj, [x, 0.12, 0.062], { rotation: [-18, 0, 0] });
    band(v(x, 0.19, -0.006), v(x, 0.17, -0.006), 0, 1, 0.062, 0.062, WHITE, aj, 8);
    glow(P(tor(0.061, 0.004, 4, 14), TEAL, aj, [x, 0.176, -0.006], { rotation: [90, 0, 0] }));
    add(aj, TEAL, bx(0.052, 0.012, 0.008), [x, 0.045, -0.083], { glow: 1.2 });
    add(aj, STEEL_L, sph(0.006, 5, 4), [x + 0.054, 0.1, 0.05]);
    add(aj, STEEL_L, sph(0.006, 5, 4), [x - 0.054, 0.1, 0.05]);
    P(sph(1, 10, 7), GRAPH, sd.toe, [x, 0.047, 0.145], { scale: [0.052, 0.036, 0.075] });
    P(sph(1, 10, 7), WHITE, sd.toe, [x, 0.058, 0.178], { scale: [0.05, 0.03, 0.05] });
    add(sd.toe, TEAL_D, bx(0.07, 0.006, 0.012), [x, 0.038, 0.222]);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // The healing staff, planted on the floor in the right hand
  const SX = X0;
  const SZ = Z0;
  const foot: OutlinePoint[] = [
    [0, 0],
    [0.02, 0],
    [0.026, 0.014],
    [0.022, 0.05],
    [0.0175, 0.075],
    [0, 0.075],
  ];
  b.lathe(foot, { at: [SX, 0, SZ], bone: staffJ, color: GRAPH_D, segments: 10, smoothing: 1 });
  add(staffJ, TEAL, tor(0.0235, 0.004, 4, 12), [SX, 0.055, SZ], { rot: [90, 0, 0], glow: 1 });
  b.rod([SX, 0.07, SZ], [SX, 0.62, SZ], 0.0165, { color: WHITE, bone: staffJ, sides: 10 });
  b.rod([SX, 0.62, SZ], [SX, 0.94, SZ], 0.0185, { color: GRAPH, bone: staffJ, sides: 10 });
  for (let y = 0.67; y < 0.9; y += 0.04) add(staffJ, GRAPH_L, cyl(0.0199, 0.0199, 0.011, 10), [SX, y, SZ]);
  for (const y of [0.62, 0.94]) {
    add(staffJ, WHITE, cyl(0.026, 0.021, 0.04, 10), [SX, y + (y < 0.7 ? 0.0 : 0.0), SZ]);
    add(staffJ, TEAL, cyl(0.0265, 0.0265, 0.007, 10), [SX, y + (y < 0.7 ? 0.024 : -0.024), SZ], { glow: 1.1 });
  }
  b.rod([SX, 0.94, SZ], [SX, 1.54, SZ], 0.0155, { color: WHITE, bone: staffJ, sides: 10 });
  for (const y of [1.1, 1.28, 1.45]) {
    add(staffJ, STEEL_L, cyl(0.02, 0.02, 0.016, 10), [SX, y, SZ]);
    add(staffJ, TEAL, cyl(0.0205, 0.0205, 0.006, 10), [SX, y, SZ], { glow: 1.1 });
  }
  add(staffJ, TEAL, bx(0.011, 0.14, 0.004), [SX, 1.2, SZ + 0.016], { glow: 1 });
  add(staffJ, TEAL, bx(0.011, 0.14, 0.004), [SX, 1.2, SZ - 0.016], { glow: 1 });
  add(staffJ, TEAL, bx(0.011, 0.2, 0.004), [SX, 0.35, SZ + 0.0165], { glow: 1 });
  add(staffJ, GRAPH_D, bx(0.015, 0.22, 0.003), [SX, 0.35, SZ + 0.0165]);
  // Crown
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.034, 0.015],
      [0.05, 0.04],
      [0.044, 0.058],
      [0.022, 0.05],
      [0, 0.05],
    ],
    { at: [SX, 1.52, SZ], bone: staffJ, color: WHITE, segments: 12, smoothing: 1 },
  );
  add(staffJ, TEAL, tor(0.046, 0.004, 4, 14), [SX, 1.56, SZ], { rot: [90, 0, 0], glow: 1.2 });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [SX + s * 0.03, 1.565, SZ],
        [SX + s * 0.072, 1.6, SZ],
        [SX + s * 0.086, 1.665, SZ],
        [SX + s * 0.058, 1.735, SZ],
        [SX + s * 0.022, 1.775, SZ],
      ]),
      [0.0125, 0.006],
      { color: WHITE, bone: staffJ, sides: 6, caps: { start: "round", end: "point" } },
    );
    // Wing fin: white blade with a glowing inlay
    const fin: OutlinePoint[] = [
      [0, 0],
      [0.07, -0.01],
      [0.15, 0.05],
      [0.19, 0.14, "sharp"],
      [0.12, 0.12],
      [0.08, 0.16, "sharp"],
      [0.03, 0.07],
    ];
    b.extrude(fin, {
      at: [SX + s * 0.04, 1.545, SZ],
      x: [s, 0, 0],
      thickness: 0.012,
      bevel: 0.003,
      color: WHITE,
      bone: staffJ,
    });
    glow(
      b.extrude(
        [
          [0.04, 0.012],
          [0.1, 0.014],
          [0.15, 0.065],
          [0.1, 0.074],
        ],
        { at: [SX + s * 0.04, 1.545, SZ], x: [s, 0, 0], thickness: 0.016, color: TEAL, bone: staffJ },
      ),
    );
  }
  // Healing core with halo and orbiting diamonds
  glow(P(sph(0.04, 12, 8), TEAL, staffJ, [SX, 1.665, SZ]), 1.5);
  add(staffJ, TEAL, tor(0.06, 0.005, 5, 18), [SX, 1.665, SZ], { rot: [90, 0, 0], glow: 1.3 });
  add(staffJ, STEEL_L, tor(0.074, 0.0045, 5, 20), [SX, 1.665, SZ]);
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    add(staffJ, TEAL, new THREE.OctahedronGeometry(0.009), [SX + 0.074 * Math.cos(a), 1.665 + (k % 2 ? 0.024 : -0.024), SZ + 0.074 * Math.sin(a)], {
      scale: [0.7, 1.3, 0.7],
      glow: 1.5,
    });
  }

  flush();
  return b.root;
}

function cone(r: number, h: number) {
  return new THREE.ConeGeometry(r, h, 5);
}
