import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { aim, DEG } from "../../../../src/math";
import { catmull, bezier } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Daisy Mae Barnstormer",
  description:
    "A chubby open-cockpit barnstormer biplane for a storybook sky circus: fat red fuselage with a scalloped cream belly, " +
    "sunny fabric wings with taped ribs and daisy roundels, bunting strung wing-tip to wing-tip, a moustached pilot and " +
    "his goggled dog. Propeller, wheels, tail wheel, rudder, elevators and four ailerons are hinge joints.",
  style: "whimsical",
  commit: "88fc1f0",
};

type P = [number, number, number];

// Palette: cherry red, sunshine yellow, teal and cream.
const RED = "#e5452f";
const RED_D = "#b52e21";
const CREAM = "#fff1cf";
const SUN = "#ffc93c";
const SUN_L = "#ffe27a";
const TEAL = "#22a999";
const SKY = "#bfe8f4";
const BROWN = "#8f5b35";
const TAN = "#dca566";
const WOOD = "#c58a50";
const DARK = "#2d2838";
const BRASS = "#eab24c";
const STEEL = "#8f9bab";
const PINK = "#ff8ea2";
const ORANGE = "#f28a30";
const WHITE = "#ffffff";
const TIRE = "#3a3346";
const SKIN = "#ffcf9e";
const DOG = "#c88a4a";
const DOG_L = "#f3d8b0";
const DOG_D = "#7a4a28";

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });

  // ------------------------------------------------------------------------------------------------ skeleton
  const body = b.joint("body", { at: [0, 1.38, 0], dir: [0, 0, 1] });
  const prop = b.joint("propeller", { parent: body, at: [0, 1.38, 2.66], dir: [0, 0, 1], role: "hinge" });
  const wheelL = b.joint("wheelL", { parent: body, at: [1.05, 0.5, 0.95], dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: body, at: [-1.05, 0.5, 0.95], dir: [-1, 0, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.15, -3.62], dir: [1, 0, 0], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.3, -3.4], dir: [0, 1, 0], role: "hinge" });
  const elevL = b.joint("elevatorL", { parent: body, at: [0.05, 1.22, -3.55], dir: [1, 0, 0], role: "hinge" });
  const elevR = b.joint("elevatorR", { parent: body, at: [-0.05, 1.22, -3.55], dir: [-1, 0, 0], role: "hinge" });

  // wing geometry constants
  const UY = 2.85; // upper wing height
  const UZ = 0.5; // upper wing centre z (staggered forward)
  const UH = 4.3; // upper half span
  const UC = 0.78; // upper half chord
  const LY = 1.12;
  const LZ = 0.2;
  const LH = 3.9;
  const LC = 0.72;
  const AIL_U = 1.9; // aileron root x
  const AIL_L = 1.75;
  const ailUL = b.joint("aileronUL", { parent: body, at: [AIL_U, UY, UZ - 0.45], dir: [1, 0, 0], role: "hinge" });
  const ailUR = b.joint("aileronUR", { parent: body, at: [-AIL_U, UY, UZ - 0.45], dir: [-1, 0, 0], role: "hinge" });
  const ailLL = b.joint("aileronLL", { parent: body, at: [AIL_L, LY + 0.1, LZ - 0.42], dir: [1, 0, 0], role: "hinge" });
  const ailLR = b.joint("aileronLR", { parent: body, at: [-AIL_L, LY + 0.1, LZ - 0.42], dir: [-1, 0, 0], role: "hinge" });

  // ------------------------------------------------------------------------------------------------ merged small bits
  const bits = new Map<string, { bone: typeof body; color: string; geos: THREE.BufferGeometry[] }>();
  const _v = new THREE.Vector3();
  const _s = new THREE.Vector3();
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  function bit(bone: typeof body, color: string, g: THREE.BufferGeometry, at: P, rot: P = [0, 0, 0], scale: P = [1, 1, 1]) {
    _q.setFromEuler(_e.set(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG));
    _m.compose(_v.set(at[0], at[1], at[2]), _q, _s.set(scale[0], scale[1], scale[2]));
    g.applyMatrix4(_m);
    const key = `${bone.name}|${color}`;
    let entry = bits.get(key);
    if (!entry) bits.set(key, (entry = { bone, color, geos: [] }));
    entry.geos.push(g);
  }
  /** A merged piece whose local +Y points along `dir`. */
  function bitDir(bone: typeof body, color: string, g: THREE.BufferGeometry, at: P, dir: P, scale: P = [1, 1, 1]) {
    _q.copy(aim(dir));
    _m.compose(_v.set(at[0], at[1], at[2]), _q, _s.set(scale[0], scale[1], scale[2]));
    g.applyMatrix4(_m);
    const key = `${bone.name}|${color}`;
    let entry = bits.get(key);
    if (!entry) bits.set(key, (entry = { bone, color, geos: [] }));
    entry.geos.push(g);
  }
  const ball = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cyl = (r0: number, r1: number, h: number, s = 8) => new THREE.CylinderGeometry(r0, r1, h, s);

  // ------------------------------------------------------------------------------------------------ paints
  const STN = [
    { z: 1.98, y: 1.38, w: 1.0, h: 1.05 },
    { z: 1.2, y: 1.38, w: 1.15, h: 1.2 },
    { z: 0.4, y: 1.4, w: 1.05, h: 1.2 },
    { z: -0.5, y: 1.45, w: 0.85, h: 1.1 },
    { z: -1.6, y: 1.48, w: 0.62, h: 0.85 },
    { z: -2.8, y: 1.4, w: 0.38, h: 0.5 },
    { z: -3.8, y: 1.22, w: 0.16, h: 0.22 },
  ];
  const interp = (z: number, key: "y" | "h") => {
    if (z >= STN[0].z) return STN[0][key];
    for (let i = 0; i < STN.length - 1; i++) {
      const a = STN[i];
      const c = STN[i + 1];
      if (z <= a.z && z >= c.z) return a[key] + ((c[key] - a[key]) * (a.z - z)) / (a.z - c.z);
    }
    return STN[STN.length - 1][key];
  };

  const fusePaint = paint((p, n) => {
    const hh = interp(p.z, "h") / 2;
    const rn = (p.y - interp(p.z, "y")) / hh; // -1 belly .. 1 back
    const side = Math.abs(n.x) > 0.3;
    if (p.z < -3.02 + 0.06 * Math.sin(rn * 9)) return TEAL;
    if (rn < -0.42 + 0.08 * Math.sin(p.z * 10)) {
      // cream belly with a row of little red dots
      if (Math.abs(rn + 0.62) < 0.05 && Math.abs(((p.z / 0.16) % 1) - 0.5) < 0.12 && p.z < 1.7) return RED;
      return CREAM;
    }
    if (side && rn > 0.2 && rn < 0.34) return TEAL;
    if (side && rn > 0.34 && rn < 0.4) return CREAM;
    if (side && rn > 0.14 && rn < 0.2) return CREAM;
    for (const zs of [1.2, 0.2, -0.9, -2.0]) if (Math.abs(p.z - zs) < 0.007 && Math.abs(n.y) < 0.92) return RED_D;
    if (side && Math.abs(rn - 0.62) < 0.022 && Math.abs(((p.z / 0.1) % 1) - 0.5) < 0.16) return RED_D;
    if (side && Math.abs(rn + 0.2) < 0.022 && Math.abs(((p.z / 0.1) % 1) - 0.5) < 0.16) return RED_D;
    return RED;
  });

  const CY = 1.38;
  const cowlPaint = paint((p, n) => {
    const r = Math.hypot(p.x, p.y - CY);
    if (p.z > 2.4 && r < 0.45 && n.z > 0.5) return DARK;
    if (p.z > 2.46) return CREAM; // polished lip
    if (p.z > 2.36 && p.z < 2.42) return TEAL;
    if (Math.abs(n.x) > 0.6) {
      // louvre slots
      const u = (p.y - CY + 0.2) / 0.075;
      if (Math.abs(p.y - CY) < 0.2 && Math.abs(u - Math.round(u)) < 0.16 && p.z > 2.05 && p.z < 2.32) return RED_D;
    }
    if (Math.abs(p.z - 1.99) < 0.008) return RED_D;
    return RED;
  });

  const wingPaint = (zc: number, half: number, trim: string, tape: string) =>
    paint((p, n) => {
      const ax = Math.abs(p.x);
      const dz = p.z - zc;
      const top = n.y > 0;
      if (ax > half - 0.5 + 0.06 * Math.sin(dz * 12)) return trim;
      if (dz > 0.5) return trim;
      const f = (ax / 0.4) % 1;
      if (f < 0.05 || f > 0.95) {
        if (Math.abs(((p.z / 0.06) % 1) - 0.5) < 0.2) return tape === CREAM ? RED_D : CREAM;
        return tape;
      }
      if (top && ax < 1.25 && ax > 0.55 && dz < 0.1 && dz > -0.55) return Math.abs(((dz / 0.08) % 1) - 0.5) < 0.38 ? BROWN : TAN;
      return top ? SUN : SUN_L;
    });

  const ailPaint = (a: string, c: string) => paint((_p, _n, s) => (Math.floor(s[0] / 0.17) % 2 === 0 ? a : c));

  const wheelHubPaint = (cy: number, cz: number) =>
    paint((p) => {
      const dy = p.y - cy;
      const dz = p.z - cz;
      const r = Math.hypot(dy, dz);
      if (r < 0.06) return BRASS;
      if (r > 0.3) return TEAL;
      const ang = Math.atan2(dy, dz);
      return Math.floor((ang / (Math.PI * 2) + 1) * 8) % 2 === 0 ? RED : CREAM;
    });

  // ------------------------------------------------------------------------------------------------ textures
  const badge = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="${CREAM}" stroke="${RED}" stroke-width="5"/>` +
      `<circle cx="50" cy="50" r="38" fill="none" stroke="${TEAL}" stroke-width="3"/>` +
      Array.from({ length: 12 }, (_, i) => `<ellipse cx="50" cy="26" rx="7" ry="13" fill="#fff" stroke="${RED}" stroke-width="2" transform="rotate(${i * 30} 50 50)"/>`).join("") +
      `<circle cx="50" cy="50" r="12" fill="${SUN}" stroke="${RED}" stroke-width="3"/><circle cx="46" cy="46" r="3" fill="#fff"/></svg>`,
    { size: 256 },
  );
  const nameTex = svg(
    `<svg viewBox="0 0 220 70"><path d="M6 14 Q110 2 214 14 L206 35 L214 58 Q110 70 6 58 L14 35 Z" fill="${CREAM}" stroke="${RED_D}" stroke-width="4" stroke-linejoin="round"/>` +
      `<text x="112" y="46" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-style="italic" font-size="34" fill="${RED}">Daisy Mae</text>` +
      `<circle cx="26" cy="36" r="7" fill="${SUN}" stroke="${RED}" stroke-width="2.5"/><circle cx="194" cy="36" r="7" fill="${SUN}" stroke="${RED}" stroke-width="2.5"/></svg>`,
    { size: 512 },
  );
  const sticker = svg(
    `<svg viewBox="0 0 100 70"><rect width="100" height="70" fill="none"/>` +
      `<circle cx="24" cy="24" r="17" fill="${RED}" stroke="#fff" stroke-width="3"/><path d="M24 12 l4 9 10 1 -8 6 3 10 -9 -6 -9 6 3 -10 -8 -6 10 -1z" fill="${SUN}"/>` +
      `<rect x="50" y="10" width="42" height="26" rx="4" fill="${TEAL}" stroke="#fff" stroke-width="3" transform="rotate(8 70 23)"/><path d="M58 28 l12 -12 12 12" stroke="#fff" stroke-width="4" fill="none" transform="rotate(8 70 23)"/>` +
      `<path d="M14 62 Q50 40 90 60" stroke="${PINK}" stroke-width="7" fill="none" stroke-linecap="round"/></svg>`,
    { size: 256 },
  );
  const pennant = svg(
    `<svg viewBox="0 0 40 50"><path d="M1 49 L39 49 L20 2 Z" fill="#fff" stroke="#d6d6d6" stroke-width="3" stroke-linejoin="round"/><path d="M20 12 L30 40 L10 40Z" fill="#e8e8e8"/></svg>`,
    { size: 128 },
  );

  // ================================================================================================ FUSELAGE
  const fus = b.loft(
    STN.map((s) => ({ at: [0, s.y, s.z] as P, w: s.w, h: s.h })),
    { bone: body, color: fusePaint, sides: 14, name: "fuselage" },
  );
  const fusSkin = b.surface(fus);

  // engine cowl, a lathe around the z axis
  b.lathe(
    [
      [0, -0.05],
      [0.5, -0.05],
      [0.6, 0.08],
      [0.65, 0.28],
      [0.62, 0.45],
      [0.57, 0.6, "sharp"],
      [0.47, 0.62, "sharp"],
      [0.44, 0.5, "sharp"],
      [0, 0.5],
    ],
    { at: [0, CY, 1.93], axis: [0, 0, 1], segments: 18, bone: body, color: cowlPaint, name: "cowl", smoothing: 1 },
  );

  // engine inside the cowl: nine cylinder heads and a crank dome
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const x = Math.cos(a) * 0.3;
    const y = CY + Math.sin(a) * 0.3;
    bitDir(body, STEEL, cyl(0.07, 0.065, 0.17, 7), [x, y, 2.5], [0, 0, 1]);
    bitDir(body, BRASS, cyl(0.03, 0.03, 0.05, 6), [x, y, 2.6], [0, 0, 1]);
    for (let k = 0; k < 2; k++) bitDir(body, DARK, cyl(0.082, 0.082, 0.012, 7), [x, y, 2.47 + k * 0.05], [0, 0, 1]);
  }
  b.lathe(
    [
      [0, 0],
      [0.16, 0],
      [0.18, 0.1],
      [0.12, 0.17],
      [0, 0.19],
    ],
    { at: [0, CY, 2.44], axis: [0, 0, 1], segments: 10, bone: body, color: BRASS, name: "crank" },
  );
  // lip rivets
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    bit(body, BRASS, ball(0.018, 5, 4), [Math.cos(a) * 0.52, CY + Math.sin(a) * 0.52, 2.54]);
  }
  // rear seam bolts
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    bit(body, RED_D, ball(0.016, 5, 4), [Math.cos(a) * 0.62, CY + Math.sin(a) * 0.62, 2.0]);
  }

  // spinner, hub and propeller
  b.lathe(
    [
      [0, 0],
      [0.19, 0],
      [0.2, 0.08],
      [0.13, 0.22],
      [0.04, 0.3],
      [0, 0.32],
    ],
    { at: [0, CY, 2.58], axis: [0, 0, 1], segments: 10, bone: prop, color: paint((p) => (p.z > 2.8 ? RED : BRASS)), name: "spinner", smoothing: 1 },
  );
  b.part(cyl(0.1, 0.1, 0.06, 8), BRASS, { bone: prop, at: [0, CY, 2.66], dir: [0, 0, 1] });
  const bladeOutline: OutlinePoint[] = [
    [0.15, -0.08],
    [0.55, -0.1],
    [0.95, -0.17],
    [1.12, -0.12],
    [1.14, 0.03],
    [1.0, 0.13],
    [0.55, 0.08],
    [0.15, 0.07],
  ];
  const bladePaint = paint((_p, _n, s) => (s[0] > 1.0 ? RED : s[0] > 0.93 ? CREAM : s[0] > 0.84 ? SUN : WOOD));
  for (const s of [1, -1])
    b.extrude(bladeOutline, {
      at: [0, CY, 2.7],
      x: [0, s, 0],
      y: [s, 0, 0],
      thickness: [0.05, 0.025],
      bevel: 0.01,
      smoothing: 1,
      color: bladePaint,
      bone: prop,
      name: "blade",
    });

  // exhaust stacks
  for (const s of [1, -1]) {
    b.sweep(bezier([s * 0.54, 1.12, 2.3], [s * 0.7, 1.05, 2.0], [s * 0.74, 0.85, 1.6], [s * 0.66, 0.78, 1.25]), [0.06, 0.045], DARK, {
      bone: body,
      sides: 8,
      caps: { start: "round", end: "flat" },
      name: "exhaust",
    });
    b.part(cyl(0.075, 0.075, 0.04, 8), BRASS, { bone: body, at: [s * 0.55, 1.12, 2.28], dir: [s * 0.4, -0.4, 0.5] });
    b.part(cyl(0.07, 0.07, 0.03, 8), BRASS, { bone: body, at: [s * 0.665, 0.785, 1.3], dir: [0, 0.2, -1] });
  }

  // ================================================================================================ COCKPITS
  const cockpit = (z: number, hw: number, hl: number) => {
    const pts: P[] = [];
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      pts.push([Math.cos(a) * hw, 2.3, z + Math.sin(a) * hl]);
    }
    const ring = fusSkin.drape(catmull(pts, { closed: true }), { lift: 0.0 });
    b.sweep(ring, 0.042, TAN, { bone: body, sides: 6, name: "coaming" });
    b.part(new THREE.CylinderGeometry(1, 1, 0.03, 12), DARK, { bone: body, at: [0, 1.945, z], scale: [hw * 0.98, 1, hl * 0.98], name: "cockpitFloor" });
    // brass studs round the coaming
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const hit = fusSkin.ray([Math.cos(a) * hw, 2.5, z + Math.sin(a) * hl], [0, -1, 0]);
      if (hit) b.stick(ball(0.017, 5, 4), BRASS, hit.moved([0, 0.035, 0]), { embed: 0.3, bone: body });
    }
  };
  cockpit(0.6, 0.28, 0.36);
  cockpit(-0.6, 0.29, 0.38);

  // windscreens
  const glass = (z: number, w: number, h: number) => {
    const o: OutlinePoint[] = [
      [-w, 0],
      [w, 0],
      [w * 0.92, h],
      [0, h * 1.1],
      [-w * 0.92, h],
    ];
    b.extrude(o, { at: [0, 1.93, z], x: [1, 0, 0], y: [0, 1, -0.5], thickness: 0.018, bevel: 0.006, smoothing: 1, color: SKY, bone: body, name: "windscreen" });
    b.rod([-w, 1.93, z], [-w * 0.92, 1.93 + h * 0.9, z - h * 0.45], 0.014, BRASS, { bone: body, sides: 5 });
    b.rod([w, 1.93, z], [w * 0.92, 1.93 + h * 0.9, z - h * 0.45], 0.014, BRASS, { bone: body, sides: 5 });
    b.sweep(catmull([[-w * 0.92, 1.93 + h * 0.9, z - h * 0.45], [0, 1.93 + h * 0.99, z - h * 0.5], [w * 0.92, 1.93 + h * 0.9, z - h * 0.45]]), 0.014, BRASS, { bone: body, sides: 5 });
  };
  glass(0.96, 0.3, 0.3);
  glass(0.0, 0.33, 0.26);

  // ================================================================================================ WINGS
  const wingSweep = (name: string, y0: number, zc: number, half: number, hc: number, thick: number, pnt: ReturnType<typeof paint>, dih: number) => {
    const pts: P[] = dih === 0 ? [[-half, y0, zc], [half, y0, zc]] : [[-half, y0 + dih, zc], [0, y0, zc], [half, y0 + dih, zc]];
    const edge = (u: number) => (u < 0.8 ? 1 : Math.sqrt(Math.max(0.03, 1 - ((u - 0.8) / 0.2) ** 2)));
    return b.sweep(pts, (t) => {
      const e = edge(Math.abs(2 * t - 1));
      return [hc * e, (thick / 2) * (0.45 + 0.55 * e)];
    }, { bone: body, color: pnt, sides: 12, up: [0, 1, 0], caps: "round", name });
  };
  const upper = wingSweep("upperWing", UY, UZ, UH, UC, 0.15, wingPaint(UZ, UH, TEAL, CREAM), 0);
  const lower = wingSweep("lowerWing", LY, LZ, LH, LC, 0.13, wingPaint(LZ, LH, RED, CREAM), 0.12);
  const upperSkin = b.surface(upper);
  const lowerSkin = b.surface(lower);

  // ailerons
  const aileron = (jt: typeof body, s: number, x0: number, len: number, y: number, z: number, a: string, c: string) => {
    b.extrude(
      [
        [0, -0.05],
        [len - 0.15, -0.05],
        [len, 0.08],
        [len + 0.03, 0.28],
        [len - 0.05, 0.5],
        [0, 0.5],
      ],
      { at: [s * x0, y, z], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.05, bevel: 0.014, smoothing: 1, color: ailPaint(a, c), bone: jt, name: "aileron" },
    );
    // hinge cover strip and control horn
    b.rod([s * x0, y, z + 0.005], [s * (x0 + len - 0.1), y, z + 0.005], 0.014, DARK, { bone: jt, sides: 5, name: "hinge" });
    b.rod([s * (x0 + 0.5), y + 0.02, z - 0.1], [s * (x0 + 0.5), y + 0.16, z - 0.05], 0.012, STEEL, { bone: jt, sides: 4 });
  };
  aileron(ailUL, 1, AIL_U, 2.2, UY, UZ - 0.45, RED, CREAM);
  aileron(ailUR, -1, AIL_U, 2.2, UY, UZ - 0.45, RED, CREAM);
  aileron(ailLL, 1, AIL_L, 2.0, LY + 0.1, LZ - 0.42, TEAL, CREAM);
  aileron(ailLR, -1, AIL_L, 2.0, LY + 0.1, LZ - 0.42, TEAL, CREAM);

  // roundels
  for (const s of [1, -1]) {
    b.decal(upperSkin, badge, { at: [s * 3.05, UY + 0.07, UZ + 0.05], dir: [0, 1, 0], up: [0, 0, 1], size: [1.0, 1.0], segments: 8, bone: body, name: "badgeTop" });
    b.decal(lowerSkin, badge, { at: [s * 2.6, LY - 0.02, LZ], dir: [0, -1, 0], up: [0, 0, -1], size: [0.95, 0.95], segments: 8, bone: body, name: "badgeUnder" });
  }

  // nav lights and wing-tip flag poles
  for (const s of [1, -1]) {
    const tipX = s * (UH - 0.05);
    bit(body, s > 0 ? RED : "#38c96a", ball(0.07, 8, 6), [tipX, UY - 0.03, UZ + 0.05]);
    bit(body, BRASS, cyl(0.045, 0.06, 0.04, 8), [tipX, UY - 0.03, UZ + 0.05], [0, 0, 90 * s]);
    // pole + swallow-tail pennant
    b.rod([tipX, UY + 0.05, UZ + 0.2], [tipX, UY + 0.68, UZ + 0.2], 0.014, WOOD, { bone: body, sides: 5, name: "pole" });
    bit(body, BRASS, ball(0.03, 6, 4), [tipX, UY + 0.7, UZ + 0.2]);
    b.extrude(
      [
        [0, 0],
        [0.6, -0.05, "sharp"],
        [0.5, 0.0],
        [0.62, 0.1, "sharp"],
        [0, 0.16],
      ],
      { at: [tipX, UY + 0.54, UZ + 0.2], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, color: s > 0 ? RED : TEAL, bone: body, smoothing: 0, name: "flag" },
    );
  }

  // fuel tank on the centre section
  const tank = b.capsule([0, UY + 0.2, UZ - 0.22], [0, UY + 0.2, UZ + 0.55], 0.17, paint((p) => (Math.abs(p.z - (UZ + 0.15)) < 0.07 ? RED : Math.abs(p.z - (UZ + 0.15)) < 0.1 ? CREAM : SUN_L)), { bone: body, sides: 10, name: "tank" });
  void tank;
  b.part(cyl(0.05, 0.06, 0.05, 8), BRASS, { bone: body, at: [0, UY + 0.38, UZ + 0.22] });
  b.part(cyl(0.02, 0.02, 0.05, 6), RED, { bone: body, at: [0, UY + 0.43, UZ + 0.22] });
  for (const s of [1, -1]) b.rod([s * 0.1, UY + 0.1, UZ - 0.1], [s * 0.18, UY + 0.28, UZ - 0.1], 0.016, BRASS, { bone: body, sides: 5 });

  // ================================================================================================ STRUTS AND WIRES
  const strut = (a: P, c: P, rx = 0.024, ry = 0.06, color = WOOD, name = "strut") =>
    b.sweep([a, c], () => [rx, ry], { bone: body, color, sides: 8, caps: "flat", name });
  const wire = (a: P, c: P) => b.rod(a, c, 0.0075, STEEL, { bone: body, sides: 4, name: "wire" });
  const fitting = (p: P) => {
    bit(body, BRASS, cyl(0.045, 0.045, 0.05, 6), p, [0, 0, 90]);
  };
  for (const s of [1, -1]) {
    // cabane struts
    const cf: [P, P] = [[s * 0.3, 1.78, 1.02], [s * 0.55, UY - 0.06, 0.95]];
    const cr: [P, P] = [[s * 0.3, 1.8, 0.05], [s * 0.5, UY - 0.06, 0.05]];
    strut(cf[0], cf[1], 0.028, 0.065, RED, "cabane");
    strut(cr[0], cr[1], 0.028, 0.065, RED, "cabane");
    for (const c of [cf, cr]) {
      fitting(c[1]);
      bit(body, BRASS, cyl(0.05, 0.05, 0.04, 6), c[0]);
    }
    // interplane struts
    const x = s * 2.5;
    const fL: P = [x, LY + 0.05, 0.62];
    const fU: P = [x, UY - 0.06, 0.95];
    const rL: P = [x, LY + 0.05, -0.2];
    const rU: P = [x, UY - 0.06, 0.1];
    strut(fL, fU, 0.026, 0.066, WOOD, "strutF");
    strut(rL, rU, 0.026, 0.066, WOOD, "strutR");
    for (const p of [fL, fU, rL, rU]) fitting(p);
    // tape wraps at mid height
    for (const [a, c] of [[fL, fU], [rL, rU]] as [P, P][]) {
      bitDir(body, RED, cyl(0.03, 0.03, 0.05, 8), [x, (a[1] + c[1]) / 2, (a[2] + c[2]) / 2], [0, c[1] - a[1], c[2] - a[2]], [1, 1, 2.4]);
    }
    // cross wires inside the bay, flying and landing wires, tip wires
    wire(fL, rU);
    wire(rL, fU);
    wire([x, UY - 0.06, 0.95], [s * 0.4, LY + 0.04, 0.7]);
    wire([x, UY - 0.06, 0.1], [s * 0.4, LY + 0.04, -0.15]);
    wire([s * 0.3, 1.82, 1.02], [x, LY + 0.05, 0.62]);
    wire([s * 0.3, 1.82, 0.05], [x, LY + 0.05, -0.2]);
    wire([s * 3.7, UY - 0.03, 0.9], [x, LY + 0.05, 0.62]);
    wire([s * 3.7, UY - 0.03, 0.08], [x, LY + 0.05, -0.2]);
    bit(body, BRASS, ball(0.03, 5, 4), [s * 3.7, UY - 0.03, 0.9]);
    bit(body, BRASS, ball(0.03, 5, 4), [s * 3.7, UY - 0.03, 0.08]);
    // pitot tube on the left front strut, compass on the right cabane
    if (s > 0) {
      b.rod([x, 2.3, 0.97], [x, 2.3, 1.45], 0.012, STEEL, { bone: body, sides: 5 });
      bit(body, BRASS, ball(0.022, 5, 4), [x, 2.3, 1.46]);
    } else {
      b.part(cyl(0.07, 0.07, 0.05, 10), BRASS, { bone: body, at: [-0.6, 2.4, 1.0], dir: [0, 0, 1], axis: "y" });
      b.part(cyl(0.055, 0.055, 0.052, 10), SKY, { bone: body, at: [-0.6, 2.4, 1.015], dir: [0, 0, 1] });
    }
  }
  // brace between the cabane pairs and the tank
  for (const s of [1, -1]) b.rod([s * 0.3, 1.9, 0.5], [s * 0.52, UY - 0.06, 0.5], 0.016, RED, { bone: body, sides: 6 });

  // bunting from wing-tip pole to pole across the centre
  const swag = (a: P, mid: P, c: P) => catmull([a, [(a[0] + mid[0]) / 2, mid[1] - 0.06, a[2]], mid, [(c[0] + mid[0]) / 2, mid[1] - 0.06, a[2]], c]);
  const bunting = (path: ReturnType<typeof swag>) => {
    b.sweep(path, 0.007, STEEL, { bone: body, sides: 4, name: "string" });
    const cols = [RED, SUN, TEAL, PINK, CREAM];
    const frames: Record<string, ReturnType<typeof frame>[]> = {};
    const n = 22;
    for (let i = 1; i < n; i++) {
      const p = path.at(i / n);
      (frames[cols[i % cols.length]] ??= []).push(frame([p.x, p.y, p.z], [0, 1, 0]));
    }
    for (const [col, fs] of Object.entries(frames)) b.cards(fs, pennant, { size: [0.2, 0.28], lean: 180, flow: [0, 0, 1], color: col, bone: body, sink: 0 });
  };
  bunting(swag([UH - 0.05, UY + 0.68, UZ + 0.2], [2.1, UY + 0.77, UZ + 0.2], [0.0, UY + 0.46, UZ + 0.2]));
  bunting(swag([-(UH - 0.05), UY + 0.68, UZ + 0.2], [-2.1, UY + 0.77, UZ + 0.2], [0.0, UY + 0.46, UZ + 0.2]));

  // ================================================================================================ LANDING GEAR
  for (const s of [1, -1]) {
    const wj = s > 0 ? wheelL : wheelR;
    const ax: P = [s * 1.05, 0.5, 0.95];
    const topF: P = [s * 0.24, 0.92, 1.05];
    const topR: P = [s * 0.24, 0.95, 0.5];
    strut(topF, [s * 0.98, 0.54, 1.0], 0.032, 0.07, RED, "gearF");
    strut(topR, [s * 0.98, 0.54, 0.9], 0.032, 0.07, RED, "gearR");
    bit(body, BRASS, cyl(0.06, 0.06, 0.07, 6), topF, [0, 0, 90]);
    bit(body, BRASS, cyl(0.06, 0.06, 0.07, 6), topR, [0, 0, 90]);
    // oleo collars
    bitDir(body, STEEL, cyl(0.05, 0.05, 0.14, 8), [s * 0.78, 0.69, 1.0], [s * 0.74, -0.4, -0.06]);
    bitDir(body, BRASS, cyl(0.055, 0.055, 0.03, 8), [s * 0.7, 0.72, 1.0], [s * 0.74, -0.4, -0.06]);
    // axle stub
    b.rod([s * 0.9, 0.5, 0.95], [s * 1.2, 0.5, 0.95], 0.04, STEEL, { bone: wj, sides: 8, name: "axle" });
    // wheel: tyre, painted pinwheel hub and bolts
    b.part(new THREE.TorusGeometry(0.37, 0.13, 7, 16), TIRE, { bone: wj, at: ax, dir: [s, 0, 0], axis: "z", name: "tyre" });
    b.lathe(
      [
        [0, -0.12],
        [0.2, -0.11],
        [0.31, -0.07],
        [0.33, 0],
        [0.31, 0.07],
        [0.2, 0.11],
        [0, 0.14],
      ],
      { at: ax, axis: [s, 0, 0], segments: 16, bone: wj, color: wheelHubPaint(ax[1], ax[2]), name: "hub", smoothing: 1 },
    );
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      bit(wj, BRASS, ball(0.02, 5, 4), [ax[0] + s * 0.13, ax[1] + Math.sin(a) * 0.12, ax[2] + Math.cos(a) * 0.12]);
    }
    // chock
    b.extrude(
      [
        [0, 0],
        [0.26, 0],
        [0, 0.14],
      ],
      { at: [s * 1.05 - 0.07 * s, 0, 1.32], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.14, bevel: 0.01, color: WOOD, bone: body, smoothing: 0, name: "chock" },
    );
  }
  // axle fairing across the belly
  b.sweep([[-0.95, 0.56, 0.95], [0.95, 0.56, 0.95]], () => [0.045, 0.075], { bone: body, color: TEAL, sides: 8, caps: "flat", name: "axleFairing" });
  // spreader bar
  b.rod([-0.3, 0.9, 0.5], [0.3, 0.9, 0.5], 0.018, STEEL, { bone: body, sides: 6 });
  // footholds
  for (const s of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.14), DARK, { bone: body, at: [s * 0.5, 1.05, -0.45] });
    b.part(new THREE.BoxGeometry(0.03, 0.025, 0.14), DARK, { bone: body, at: [s * 0.5, 1.05, 0.7] });
  }

  // ================================================================================================ TAIL
  const finOutline: OutlinePoint[] = [
    [0, 0],
    [0.6, 0],
    [0.6, 1.02],
    [0.36, 1.1],
    [0.14, 0.78],
    [0.02, 0.3],
  ];
  const finPaint = paint((_p, _n, s) => (s[1] > 0.92 && s[0] > 0.1 ? TEAL : s[0] < 0.07 ? TEAL : RED));
  const fin = b.extrude(finOutline, { at: [0, 1.28, -2.85], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.07, bevel: 0.016, smoothing: 1, color: finPaint, bone: body, name: "fin" });
  for (const s of [1, -1])
    b.decal(fin, badge, { at: [s * 0.04, 1.95, -3.05], dir: [s, 0, 0], up: [0, 1, 0], size: [0.42, 0.42], segments: 6, bone: body, name: "badgeFin" });
  const rudderPaint = paint((_p, _n, s) => [RED, CREAM, TEAL][Math.floor(Math.max(0, s[1]) / 0.2) % 3]);
  b.extrude(
    [
      [0, -0.02],
      [0.46, -0.02],
      [0.52, 0.18],
      [0.5, 0.7],
      [0.38, 1.0],
      [0.2, 1.1],
      [0, 1.08],
    ],
    { at: [0, 1.3, -3.4], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.05, bevel: 0.014, smoothing: 1, color: rudderPaint, bone: rudder, name: "rudder" },
  );
  b.rod([0, 1.31, -3.395], [0, 2.36, -3.395], 0.014, DARK, { bone: rudder, sides: 5, name: "rudderHinge" });
  b.rod([0, 1.7, -3.37], [0.32, 1.7, -3.3], 0.012, STEEL, { bone: rudder, sides: 4 });

  const stab = b.extrude(
    [
      [-1.2, 0.28],
      [-1.15, 0.08],
      [-0.6, -0.02],
      [0, -0.06],
      [0.6, -0.02],
      [1.15, 0.08],
      [1.2, 0.28],
      [1.0, 0.5],
      [0, 0.5],
      [-1.0, 0.5],
    ],
    { at: [0, 1.22, -3.0], x: [1, 0, 0], y: [0, 0, -1], thickness: 0.06, bevel: 0.016, smoothing: 1, color: paint((_p, _n, s) => (Math.abs(s[0]) > 1.0 ? TEAL : SUN)), bone: body, name: "stabiliser" },
  );
  void stab;
  for (const s of [1, -1]) {
    const j = s > 0 ? elevL : elevR;
    b.extrude(
      [
        [0, -0.04],
        [1.0, -0.04],
        [1.14, 0.12],
        [1.2, 0.3],
        [1.08, 0.46],
        [0, 0.46],
      ],
      { at: [s * 0.05, 1.22, -3.5], x: [s, 0, 0], y: [0, 0, -1], thickness: 0.05, bevel: 0.014, smoothing: 1, color: ailPaint(RED, CREAM), bone: j, name: "elevator" },
    );
  }
  // tail bracing wires + fin fillets
  for (const s of [1, -1]) {
    wire([0.0, 2.3, -3.2], [s * 0.95, 1.24, -3.3]);
    wire([s * 0.04, 1.8, -2.95], [s * 0.6, 1.2, -3.15]);
    bit(body, BRASS, ball(0.025, 5, 4), [s * 0.95, 1.24, -3.3]);
  }
  bit(body, BRASS, ball(0.025, 5, 4), [0, 2.3, -3.2]);

  // tail wheel on its spring
  b.sweep(bezier([0, 1.2, -3.25], [0, 0.8, -3.35], [0, 0.45, -3.4], [0, 0.18, -3.6]), [0.045, 0.03], STEEL, { bone: body, sides: 6, name: "tailSpring" });
  for (const k of [0, 1, 2]) bit(body, DARK, cyl(0.055, 0.055, 0.018, 8), [0, 1.08 - k * 0.1, -3.28 - k * 0.04], [-8, 0, 0]);
  b.part(new THREE.TorusGeometry(0.085, 0.055, 6, 12), TIRE, { bone: tailWheel, at: [0, 0.14, -3.62], dir: [1, 0, 0], axis: "z", name: "tailTyre" });
  b.part(cyl(0.07, 0.07, 0.1, 8), RED, { bone: tailWheel, at: [0, 0.14, -3.62], dir: [1, 0, 0] });
  b.rod([-0.08, 0.14, -3.62], [0.08, 0.14, -3.62], 0.02, STEEL, { bone: tailWheel, sides: 5 });

  // ================================================================================================ FUSELAGE DETAILS
  for (const s of [1, -1]) {
    b.decal(fusSkin, nameTex, { at: [s * 0.32, 1.46, -1.5], dir: [s, 0, 0], up: [0, 1, 0], size: [1.15, 0.37], segments: 14, bone: body, name: "nameplate" });
  }
  // headrest fairing
  b.capsule([0, 1.94, -1.0], [0, 1.9, -1.5], 0.15, RED, { bone: body, sides: 8, name: "headrest" });
  b.capsule([0, 2.08, -0.98], [0, 2.1, -0.98], 0.13, BROWN, { bone: body, sides: 8, name: "pillow" });
  // luggage case strapped to the lower wing
  const cx = 1.7;
  const cz = 0.2;
  const cy = LY + 0.07 + 0.12;
  b.part(new THREE.BoxGeometry(0.52, 0.22, 0.36), TAN, { bone: body, at: [cx, cy, cz], name: "case", flat: true });
  b.part(new THREE.BoxGeometry(0.54, 0.05, 0.38), BROWN, { bone: body, at: [cx, cy + 0.07, cz] });
  b.part(new THREE.BoxGeometry(0.54, 0.05, 0.38), BROWN, { bone: body, at: [cx, cy - 0.07, cz] });
  for (const dx of [-0.17, 0.17]) b.part(new THREE.BoxGeometry(0.045, 0.24, 0.39), RED, { bone: body, at: [cx + dx, cy, cz] });
  b.sweep(catmull([[cx - 0.08, cy + 0.115, cz], [cx - 0.06, cy + 0.19, cz], [cx + 0.06, cy + 0.19, cz], [cx + 0.08, cy + 0.115, cz]]), 0.011, DARK, { bone: body, sides: 5, name: "caseHandle" });
  for (const dx of [-0.24, 0.24]) for (const dz of [-0.16, 0.16]) bit(body, BRASS, ball(0.026, 5, 4), [cx + dx, cy + 0.11, cz + dz]);
  b.part(new THREE.PlaneGeometry(0.2, 0.14), WHITE, { bone: body, at: [cx, cy + 0.115, cz + 0.02], dir: [0, 1, 0], up: [0, 0, 1], axis: "z", texture: sticker, name: "caseSticker" });

  // ================================================================================================ PILOT AND DOG
  const PZ = -0.6;
  // pilot
  b.capsule([0, 1.62, PZ - 0.02], [0, 2.08, PZ], 0.23, BROWN, { bone: body, sides: 10, name: "pilotTorso" });
  b.sweep(catmull([[0.17, 2.28, PZ], [0, 2.28, PZ - 0.2], [-0.17, 2.28, PZ], [0, 2.26, PZ + 0.19]], { closed: true }), 0.06, CREAM, { bone: body, sides: 6, name: "collar" });
  for (const s of [1, -1]) {
    b.capsule([s * 0.24, 2.05, PZ + 0.0], [s * 0.15, 1.86, PZ + 0.32], 0.07, BROWN, { bone: body, sides: 7, name: "pilotArm" });
    b.part(ball(0.08, 8, 6), TAN, { bone: body, at: [s * 0.1, 1.85, PZ + 0.38], name: "glove" });
  }
  b.rod([0, 1.45, PZ + 0.32], [0, 1.82, PZ + 0.4], 0.02, STEEL, { bone: body, sides: 5, name: "stick" });
  b.part(ball(0.04, 6, 4), RED, { bone: body, at: [0, 1.85, PZ + 0.41] });
  const HC: P = [0, 2.5, PZ + 0.02];
  b.part(ball(0.19, 10, 8), SKIN, { bone: body, at: HC, name: "pilotHead" });
  b.part(new THREE.SphereGeometry(0.205, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), BROWN, { bone: body, at: [HC[0], HC[1] + 0.005, HC[2] - 0.01], rotation: [-14, 0, 0], name: "pilotCap" });
  b.sweep(catmull([[0.205, 2.5, PZ - 0.06], [0, 2.5, PZ - 0.24], [-0.205, 2.5, PZ - 0.06], [0, 2.54, PZ + 0.205]], { closed: true }), 0.016, DARK, { bone: body, sides: 4, name: "goggleStrap" });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.065, 8, 6), CREAM, { bone: body, at: [s * 0.18, 2.43, PZ - 0.0], scale: [0.5, 1.2, 1.0], name: "earFlap" });
    b.part(new THREE.TorusGeometry(0.07, 0.016, 5, 10), BRASS, { bone: body, at: [s * 0.088, 2.52, PZ + 0.19], dir: [0, 0.1, 1], axis: "z" });
    b.part(new THREE.SphereGeometry(0.066, 8, 6), WHITE, { bone: body, at: [s * 0.088, 2.52, PZ + 0.17], scale: [1, 1, 0.5] });
    b.part(ball(0.026, 6, 4), DARK, { bone: body, at: [s * 0.095, 2.51, PZ + 0.2] });
    b.part(ball(0.009, 4, 3), WHITE, { bone: body, at: [s * 0.09, 2.525, PZ + 0.222] });
    b.part(new THREE.SphereGeometry(0.035, 6, 4), PINK, { bone: body, at: [s * 0.13, 2.4, PZ + 0.15], scale: [1, 0.7, 0.4] });
    // handlebar moustache
    b.sweep(catmull([[0, 2.42, PZ + 0.2], [s * 0.07, 2.4, PZ + 0.195], [s * 0.15, 2.4, PZ + 0.15], [s * 0.19, 2.45, PZ + 0.1]]), [0.03, 0.012], ORANGE, { bone: body, sides: 6, name: "moustache" });
  }
  b.part(ball(0.045, 7, 5), PINK, { bone: body, at: [0, 2.46, PZ + 0.205], name: "pilotNose" });
  b.sweep(catmull([[-0.07, 2.35, PZ + 0.185], [0, 2.33, PZ + 0.195], [0.07, 2.35, PZ + 0.185]]), 0.01, RED_D, { bone: body, sides: 4, name: "smile" });
  // scarf streaming behind
  const scarfPts: P[] = [];
  for (let i = 0; i < 9; i++) {
    const t = i / 8;
    scarfPts.push([Math.sin(t * 9) * 0.12 * t, 2.22 + 0.12 * t + Math.sin(t * 7 + 1) * 0.05, PZ - 0.2 - t * 1.5]);
  }
  b.sweep(catmull(scarfPts), (t) => [0.055 + 0.04 * t, 0.007], paint((_p, _n, s) => (Math.floor(s[0] * 14) % 2 === 0 ? PINK : CREAM)), { bone: body, up: [1, 0, 0], sides: 6, caps: "flat", name: "scarf" });
  b.extrude([[0, 0], [0.1, 0], [0.14, -0.06, "sharp"], [0.05, -0.09], [0, -0.04]], { at: [0, 2.1, PZ + 0.1], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.01, color: PINK, bone: body, smoothing: 0, name: "scarfKnot" });

  // dog
  const DZ = 0.62;
  b.part(new THREE.SphereGeometry(0.27, 9, 7), DOG, { bone: body, at: [0, 1.95, DZ - 0.1], scale: [1, 1, 0.9], name: "dogBody" });
  b.part(new THREE.SphereGeometry(0.18, 9, 7), DOG, { bone: body, at: [0, 2.3, DZ], name: "dogHead" });
  b.capsule([0, 2.25, DZ + 0.12], [0, 2.22, DZ + 0.3], 0.085, DOG_L, { bone: body, sides: 8, name: "dogSnout" });
  b.part(ball(0.042, 6, 5), DARK, { bone: body, at: [0, 2.26, DZ + 0.4], name: "dogNose" });
  b.extrude([[-0.03, 0], [0.03, 0], [0.03, -0.07], [0, -0.1], [-0.03, -0.07]], { at: [0, 2.17, DZ + 0.38], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: PINK, bone: body, smoothing: 1, name: "tongue" });
  b.sweep(catmull([[-0.05, 2.185, DZ + 0.38], [0, 2.17, DZ + 0.4], [0.05, 2.185, DZ + 0.38]]), 0.007, DARK, { bone: body, sides: 4, name: "dogMouth" });
  for (const s of [1, -1]) {
    b.capsule([s * 0.14, 2.42, DZ - 0.02], [s * 0.27, 2.2, DZ - 0.06], [0.07, 0.05], DOG_D, { bone: body, sides: 7, name: "dogEar" });
    b.part(new THREE.TorusGeometry(0.065, 0.016, 5, 10), BRASS, { bone: body, at: [s * 0.075, 2.36, DZ + 0.155], dir: [0, 0.1, 1], axis: "z" });
    b.part(new THREE.SphereGeometry(0.06, 8, 6), WHITE, { bone: body, at: [s * 0.075, 2.36, DZ + 0.14], scale: [1, 1, 0.5] });
    b.part(ball(0.025, 6, 4), DARK, { bone: body, at: [s * 0.08, 2.355, DZ + 0.168] });
    b.part(ball(0.008, 4, 3), WHITE, { bone: body, at: [s * 0.075, 2.37, DZ + 0.19] });
    b.part(ball(0.1, 6, 4), DOG_D, { bone: body, at: [s * 0.1, 2.42, DZ - 0.1], scale: [0.6, 0.8, 0.8] });
    b.capsule([s * 0.2, 1.95, DZ + 0.05], [s * 0.2, 2.02, DZ + 0.3], 0.065, DOG, { bone: body, sides: 6, name: "dogArm" });
    b.part(ball(0.075, 7, 5), DOG_L, { bone: body, at: [s * 0.2, 2.03, DZ + 0.34], name: "paw" });
    for (const k of [-1, 0, 1]) b.part(ball(0.014, 4, 3), DOG_D, { bone: body, at: [s * 0.2 + k * 0.035, 2.05, DZ + 0.405] });
  }
  b.part(new THREE.SphereGeometry(0.065, 6, 4), DOG_D, { bone: body, at: [0, 2.47, DZ + 0.06], scale: [1.4, 0.7, 1.2], name: "dogSpot" });
  // dog scarf
  b.sweep(catmull([[0.17, 2.13, DZ - 0.02], [0, 2.1, DZ - 0.17], [-0.17, 2.13, DZ - 0.02], [0, 2.12, DZ + 0.17]], { closed: true }), 0.05, RED, { bone: body, sides: 6, name: "dogScarf" });
  b.sweep(catmull([[0.05, 2.1, DZ - 0.15], [0.2, 2.2, DZ - 0.4], [0.12, 2.22, DZ - 0.7], [0.28, 2.32, DZ - 0.95]]), (t) => [0.05 + 0.03 * t, 0.007], paint((_p, _n, s) => (Math.floor(s[0] * 8) % 2 === 0 ? RED : SUN)), { bone: body, up: [1, 0, 0], sides: 6, caps: "flat", name: "dogScarfTail" });

  // ================================================================================================ FLUSH MERGED BITS
  for (const { bone, color, geos } of bits.values()) {
    const merged = mergeGeometries(geos, false);
    if (!merged) throw new Error(`merge failed for ${color}`);
    b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name: `bits.${color}` });
  }

  return b.root;
}
