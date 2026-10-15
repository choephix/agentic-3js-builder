import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import { aim, rng } from "../src/math";
import { paint } from "../src/paint";
import { svg } from "../src/texture";

export const meta = {
  name: "Vanguard-class Star Cruiser",
  description:
    "Low-poly capital-ship cruiser game asset, 120 m: a faceted wedge hull with a stepped spine and hammerhead bridge, layered armour plating, twin and triple turret batteries, point defence, missile cells, a flank hangar with force field, radiator banks, a glowing seven-nozzle engine block and landing struts.",
};

type P3 = [number, number, number];
type Vec = THREE.Vector3;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const vv = (p: Vec | P3) => (Array.isArray(p) ? v(p[0], p[1], p[2]) : p.clone());
const centroid = (pts: Vec[]) => pts.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(pts.length);
const lerpV = (a: Vec, b: Vec, t: number) => a.clone().lerp(b, t);

// ---------------------------------------------------------------- palette
const HULL_L = "#e6e9ee";
const HULL = "#bcc3cd";
const HULL_D = "#8a94a3";
const HULL_DD = "#5f6878";
const NAVY_L = "#5677b8";
const NAVY = "#36528c";
const NAVY_D = "#223661";
const RED_L = "#ef6a50";
const RED = "#d23c34";
const RED_D = "#922630";
const GUN_L = "#737b88";
const GUN = "#4a515c";
const GUN_D = "#2e333c";
const INK = "#181b21";
const GOLD = "#f0b93a";
const GOLD_D = "#b9852a";
// glows
const CYAN = "#5fe6ff";
const ICE = "#d6fbff";
const AMBER = "#ffb43c";
const NAV_R = "#ff3838";
const NAV_G = "#39f07a";
const STROBE = "#ffffff";
const HAZ = "hazard"; // stash key for the hazard-stripe paint

/** Flat-shaded polygon soup; every polygon is turned to face away from (or toward) a reference point. */
class Mesher {
  pos: number[] = [];
  tri(a: Vec, b: Vec, c: Vec) {
    this.pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }
  poly(pts: Vec[], ref: Vec, toward = false) {
    const n = new THREE.Vector3();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      n.x += (p.y - q.y) * (p.z + q.z);
      n.y += (p.z - q.z) * (p.x + q.x);
      n.z += (p.x - q.x) * (p.y + q.y);
    }
    let flip = n.dot(centroid(pts).sub(ref)) < 0;
    if (toward) flip = !flip;
    const l = flip ? [...pts].reverse() : pts;
    for (let i = 1; i < l.length - 1; i++) this.tri(l[0], l[i], l[i + 1]);
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(this.pos, 3));
    g.computeVertexNormals();
    return g;
  }
}

function finalize(g: THREE.BufferGeometry) {
  const n = g.index ? g.toNonIndexed() : g;
  for (const k of Object.keys(n.attributes)) if (k !== "position") n.deleteAttribute(k);
  n.computeVertexNormals();
  return n;
}

// ---------------------------------------------------------------- hull shape
// stations: z, half width W, height H, keel height yk
const KEY: [number, number, number, number][] = [
  [-54, 21, 12.5, 7],
  [-28, 19, 11.5, 7],
  [0, 14.5, 9.5, 7],
  [28, 8.5, 6.4, 7.6],
  [47, 4, 3.8, 8.6],
  [55, 1.0, 2.0, 9.6],
];
const hullAt = (z: number) => {
  const k = KEY;
  if (z <= k[0][0]) return { W: k[0][1], H: k[0][2], yk: k[0][3] };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i];
    const c = k[i + 1];
    if (z <= c[0]) {
      const t = (z - a[0]) / (c[0] - a[0]);
      return { W: a[1] + (c[1] - a[1]) * t, H: a[2] + (c[2] - a[2]) * t, yk: a[3] + (c[3] - a[3]) * t };
    }
  }
  const l = k[k.length - 1];
  return { W: l[1], H: l[2], yk: l[3] };
};
// half profile: x / W, (y - yk) / H from keel corner to deck edge
const PROF: [number, number][] = [
  [0.5, 0],
  [0.93, 0.12],
  [1, 0.52],
  [0.66, 0.86],
  [0.34, 1],
];
/** A point on hull face f (0 lower slope, 1 band, 2 upper slope, 3 shoulder, 4 deck top, -1 keel) at u across it. */
const hp = (z: number, f: number, u: number, s: number) => {
  const { W, H, yk } = hullAt(z);
  if (f === 4) return v(s * u * 0.34 * W, yk + H, z);
  if (f === -1) return v(s * u * 0.5 * W, yk, z);
  const a = PROF[f];
  const c = PROF[f + 1];
  return v(s * (a[0] + (c[0] - a[0]) * u) * W, yk + (a[1] + (c[1] - a[1]) * u) * H, z);
};
const hn = (z: number, f: number, u: number, s: number) => {
  const du = hp(z, f, Math.min(u + 0.05, 1), s).sub(hp(z, f, Math.max(u - 0.05, 0), s));
  const dz = hp(z + 0.3, f, u, s).sub(hp(z - 0.3, f, u, s));
  const n = du.cross(dz).normalize();
  const p = hp(z, f, u, s);
  const { H, yk } = hullAt(z);
  if (n.dot(v(p.x, p.y - (yk + H * 0.5), 0)) < 0) n.negate();
  return n;
};
const deckY = (z: number) => {
  const { H, yk } = hullAt(z);
  return yk + H;
};
const T1 = (z: number) => deckY(z) + 3.2; // top of the first spine tier
const T2 = (z: number) => T1(z) + 3.5; // top of the second spine tier

export default function build() {
  const b = createBuilder({ name: "lowPolyStarCruiser" });
  const hull = b.joint("hull", { at: [0, 14, 0] });
  type J = typeof hull;
  const R = rng(7);
  const pick = <T>(xs: T[]) => xs[Math.floor(R() * xs.length)];

  // ---------------------------------------------------------------- batching
  const hazard = paint((p) => (((Math.floor((p.x + p.y + p.z) / 0.7) % 2) + 2) % 2 ? GOLD : INK));
  const pending = new Map<string, { bone: J; color: string; geos: THREE.BufferGeometry[] }>();
  const stash = (bone: J, color: string, g: THREE.BufferGeometry) => {
    const key = `${bone.name}|${color}`;
    const slot = pending.get(key) ?? { bone, color, geos: [] };
    slot.geos.push(finalize(g));
    pending.set(key, slot);
  };
  const box = (bone: J, color: string, size: P3, at: Vec | P3, q?: THREE.Quaternion) => {
    const g = new THREE.BoxGeometry(size[0], size[1], size[2]);
    if (q) g.applyQuaternion(q);
    const p = vv(at);
    g.translate(p.x, p.y, p.z);
    stash(bone, color, g);
  };
  const cyl = (bone: J, color: string, a: Vec | P3, c: Vec | P3, r0: number, r1 = r0, sides = 6) => {
    const A = vv(a);
    const d = vv(c).sub(A);
    const len = d.length();
    const g = new THREE.CylinderGeometry(r1, r0, len, sides);
    g.translate(0, len / 2, 0);
    g.applyQuaternion(aim(d));
    g.translate(A.x, A.y, A.z);
    stash(bone, color, g);
  };
  const turn = (bone: J, color: string, pts: [number, number][], at: Vec | P3, dir: P3 | Vec, segs = 8) => {
    const g = new THREE.LatheGeometry(
      pts.map(([r, h]) => new THREE.Vector2(r, h)),
      segs,
    );
    g.applyQuaternion(aim(vv(dir)));
    const p = vv(at);
    g.translate(p.x, p.y, p.z);
    stash(bone, color, g);
  };
  const prism = (bone: J, color: string, bot: Vec[], top: Vec[]) => {
    const m = new Mesher();
    const ref = centroid([...bot, ...top]);
    m.poly(bot, ref);
    m.poly(top, ref);
    for (let i = 0; i < bot.length; i++)
      m.poly([bot[i], bot[(i + 1) % bot.length], top[(i + 1) % bot.length], top[i]], ref);
    stash(bone, color, m.geo());
  };
  /** Axis-aligned block with a bevelled (inset) top. */
  const blk = (bone: J, color: string, c: Vec | P3, size: P3, bevel = 0.1, down = false) => {
    const p = vv(c);
    const [w, h, d] = size;
    const sy = down ? -1 : 1;
    const rect = (y: number, i: number) => [
      v(p.x - w / 2 + i, y, p.z - d / 2 + i),
      v(p.x + w / 2 - i, y, p.z - d / 2 + i),
      v(p.x + w / 2 - i, y, p.z + d / 2 - i),
      v(p.x - w / 2 + i, y, p.z + d / 2 - i),
    ];
    prism(bone, color, rect(p.y - (sy * h) / 2, 0), rect(p.y + (sy * h) / 2, Math.min(bevel, w / 2.2, d / 2.2)));
  };
  /** A raised plate on four surface corners, lifted along n, top inset for a chamfer. */
  const plate = (bone: J, color: string, c: Vec[], n: Vec, raise = 0.18, inset = 0.14, sink = 0.1) => {
    const ctr = centroid(c);
    const bot = c.map((p) => p.clone().addScaledVector(n, -sink));
    const top = c.map((p) => p.clone().addScaledVector(n, raise).add(ctr.clone().sub(p).setLength(inset)));
    prism(bone, color, bot, top);
  };
  const loft = (
    bone: J,
    rings: Vec[][],
    side: (i: number, seg: number) => string | null,
    caps: [string | null, string | null],
  ) => {
    const ms = new Map<string, Mesher>();
    const m = (c: string) => {
      let x = ms.get(c);
      if (!x) ms.set(c, (x = new Mesher()));
      return x;
    };
    for (let s = 0; s < rings.length - 1; s++) {
      const A = rings[s];
      const B = rings[s + 1];
      const ref = centroid([...A, ...B]);
      const n = A.length;
      for (let i = 0; i < n; i++) {
        const c = side(i, s);
        if (c) m(c).poly([A[i], A[(i + 1) % n], B[(i + 1) % n], B[i]], ref);
      }
    }
    if (caps[0]) m(caps[0]).poly(rings[0], centroid(rings[1]));
    if (caps[1]) m(caps[1]).poly(rings[rings.length - 1], centroid(rings[rings.length - 2]));
    for (const [c, x] of ms) stash(bone, c, x.geo());
  };

  // textured quads, one part per texture and tint
  type Tex = THREE.Texture;
  const decals = new Map<string, { bone: J; tex: Tex; tint: string; glow: number; pos: number[]; uv: number[] }>();
  const decal = (
    name: string,
    bone: J,
    tex: Tex,
    tint: string,
    glowS: number,
    c: Vec,
    n: Vec,
    up: Vec,
    w: number,
    h: number,
    lift = 0.05,
  ) => {
    const N = n.clone().normalize();
    const U = up.clone().addScaledVector(N, -up.dot(N)).normalize();
    const Rt = U.clone().cross(N);
    const o = c.clone().addScaledVector(N, lift);
    const p = (a: number, e: number) =>
      o
        .clone()
        .addScaledVector(Rt, (a * w) / 2)
        .addScaledVector(U, (e * h) / 2);
    const q = [p(-1, -1), p(1, -1), p(1, 1), p(-1, 1)];
    const uvq = [0, 0, 1, 0, 1, 1, 0, 1];
    const key = `${name}.${tint.slice(1)}`;
    const slot = decals.get(key) ?? { bone, tex, tint, glow: glowS, pos: [], uv: [] };
    for (const i of [0, 1, 2, 0, 2, 3]) {
      slot.pos.push(q[i].x, q[i].y, q[i].z);
      slot.uv.push(uvq[i * 2], uvq[i * 2 + 1]);
    }
    decals.set(key, slot);
  };
  const glowBox = (bone: J, color: string, size: P3, at: Vec | P3, strength = 1.4, name?: string) =>
    glow(b.part(new THREE.BoxGeometry(...size), color, { bone, at: vv(at), name }), strength);

  // ---------------------------------------------------------------- textures
  const T = {
    win: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 16"><rect width="160" height="16" fill="#141b2e"/>${Array.from(
        { length: 16 },
        (_, i) =>
          `<rect x="${3 + i * 10}" y="4" width="6" height="8" fill="${i % 5 === 3 ? "#2c3756" : i % 7 === 1 ? "#ffe9b0" : "#ffc861"}"/>`,
      ).join("")}</svg>`,
      { size: 640 },
    ),
    bridge: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 20"><rect width="200" height="20" fill="#121a2c"/>${Array.from(
        { length: 18 },
        (_, i) =>
          `<path d="M${4 + i * 11} 4 L${13 + i * 11} 4 L${12 + i * 11} 16 L${5 + i * 11} 16 Z" fill="${i % 6 === 2 ? "#ffd27a" : "#9eeaff"}"/>`,
      ).join("")}<rect x="0" y="0" width="200" height="2" fill="#5fe6ff"/></svg>`,
      { size: 800 },
    ),
    num: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><text x="6" y="88" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="96" fill="${NAVY_D}">07</text><path d="M140 20 L196 20 L184 44 L128 44 Z M128 56 L184 56 L172 80 L116 80 Z" fill="${RED}"/></svg>`,
      { size: 400 },
    ),
    name: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 40"><text x="6" y="31" textLength="300" lengthAdjust="spacingAndGlyphs" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="30" fill="${HULL_L}">VANGUARD</text><rect x="318" y="8" width="76" height="26" fill="${RED}"/><text x="356" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="${HULL_L}">CV-07</text></svg>`,
      { size: 800 },
    ),
    emblem: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="97" fill="${NAVY_D}"/><circle cx="100" cy="100" r="86" fill="none" stroke="${GOLD}" stroke-width="8"/><path d="M92 104 L22 80 L36 98 L16 104 L42 116 L28 128 L74 124 Z" fill="${HULL_L}"/><path d="M108 104 L178 80 L164 98 L184 104 L158 116 L172 128 L126 124 Z" fill="${HULL_L}"/><path d="M100 26 L130 112 L100 96 L70 112 Z" fill="${RED}"/><path d="M100 120 L106 136 L123 136 L109 146 L114 162 L100 152 L86 162 L91 146 L77 136 L94 136 Z" fill="${GOLD}"/></svg>`,
      { size: 512 },
    ),
    core: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1f9bd6"/><circle cx="50" cy="50" r="42" fill="${CYAN}"/><circle cx="50" cy="50" r="31" fill="#a8f4ff"/><circle cx="50" cy="50" r="19" fill="${ICE}"/><circle cx="50" cy="50" r="9" fill="#ffffff"/><path d="M50 8 L50 30 M50 70 L50 92 M8 50 L30 50 M70 50 L92 50" stroke="#1f9bd6" stroke-width="4"/></svg>`,
      { size: 256 },
    ),
    field: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32">${Array.from(
        { length: 6 },
        (_, i) => `<rect x="0" y="${2 + i * 5}" width="64" height="2.4" fill="${i % 2 ? "#8fdcff" : "#4fb8ff"}"/>`,
      ).join("")}<rect x="1.5" y="1.5" width="61" height="29" fill="none" stroke="#4fb8ff" stroke-width="3"/></svg>`,
      { size: 256 },
    ),
    chev: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M6 30 L32 8 L58 30 L58 42 L32 20 L6 42 Z M6 52 L32 30 L58 52 L58 62 L32 40 L6 62 Z" fill="#ffffff"/></svg>`,
      { size: 128 },
    ),
    panel: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="none" stroke="#ffffff" stroke-width="3.5"><path d="M10 10 H118 V118 H10 Z M10 52 H74 V118 M74 84 H118 M94 10 V52"/></g><g fill="#ffffff"><circle cx="18" cy="18" r="3.5"/><circle cx="110" cy="18" r="3.5"/><circle cx="18" cy="110" r="3.5"/><circle cx="110" cy="110" r="3.5"/><rect x="22" y="64" width="40" height="7"/></g></svg>`,
      { size: 256 },
    ),
    panel2: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="none" stroke="#ffffff" stroke-width="3.5"><path d="M10 10 H118 V118 H10 Z M54 10 V118 M54 64 H118"/><rect x="20" y="22" width="24" height="34"/></g><g fill="#ffffff"><circle cx="86" cy="36" r="4"/><circle cx="86" cy="92" r="4"/><rect x="66" y="80" width="12" height="24"/><rect x="96" y="80" width="12" height="24"/></g></svg>`,
      { size: 256 },
    ),
    stencil: svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 40"><rect x="3" y="3" width="154" height="34" fill="none" stroke="#ffffff" stroke-width="4"/><text x="80" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="#ffffff">BAY 2 · CAT-A</text></svg>`,
      { size: 400 },
    ),
  };
  const UP = v(0, 1, 0);

  // ================================================================ HULL
  const ZS = [-54, -28, -23, -6, 0, 28, 47, 55];
  const HANGAR: [number, number] = [-23, -6];
  const ring = (z: number) => {
    const out: Vec[] = [];
    for (let i = 0; i < 5; i++) out.push(hp(z, Math.min(i, 3), i === 4 ? 1 : 0, 1));
    for (let i = 4; i >= 0; i--) out.push(hp(z, Math.min(i, 3), i === 4 ? 1 : 0, -1));
    return out;
  };
  const HULLC = [HULL_D, NAVY, HULL, HULL, HULL_L, HULL, HULL, NAVY, HULL_D, HULL_DD];
  loft(hull, ZS.map(ring), (i, seg) => (ZS[seg] === HANGAR[0] && (i === 1 || i === 7) ? null : HULLC[i]), [
    HULL_DD,
    RED,
  ]);

  // armour plating, per face, per station span
  const zones: { f: number; z0: number; z1: number; u0: number; u1: number }[] = [
    { f: 4, z0: 25, z1: 45.5, u0: -1, u1: 2 }, // turret A and missile cells
    { f: 2, z0: 32.5, z1: 41.5, u0: 0.1, u1: 0.95 }, // hull number
    { f: 3, z0: 9.5, z1: 16.5, u0: 0.2, u1: 0.84 }, // emblem
    { f: 3, z0: 17, z1: 26.5, u0: 0.08, u1: 0.78 }, // missile pods
  ];
  const free = (f: number, z0: number, z1: number, u0: number, u1: number) =>
    !zones.some((q) => q.f === f && z1 > q.z0 && z0 < q.z1 && u1 > q.u0 && u0 < q.u1);
  const faceCells: Record<number, [number, number, string, string][]> = {
    4: [
      [0.04, 0.5, HULL_L, HULL],
      [0.54, 0.97, HULL_L, HULL],
    ],
    3: [
      [0.03, 0.4, HULL, HULL_L],
      [0.44, 0.8, HULL, HULL_L],
      [0.84, 0.97, RED, RED_L],
    ],
    2: [
      [0.06, 0.48, HULL, HULL_D],
      [0.52, 0.94, HULL, HULL_L],
    ],
    0: [
      [0.08, 0.5, HULL_D, HULL_DD],
      [0.54, 0.92, HULL_D, HULL],
    ],
    [-1]: [
      [0.14, 0.55, HULL_DD, GUN_L],
      [0.6, 0.95, HULL_DD, HULL_D],
    ],
  };
  for (const f of [4, 3, 2, 0, -1]) {
    for (let k = 0; k < KEY.length - 1; k++) {
      const za = KEY[k][0] + 0.3;
      const zb = KEY[k + 1][0] - 0.3;
      if (zb - za < 1) continue;
      const nz = Math.max(1, Math.round((zb - za) / (f === -1 ? 7 : 4.6)));
      const step = (zb - za) / nz;
      for (let j = 0; j < nz; j++) {
        const z0 = za + j * step + 0.14;
        const z1 = za + (j + 1) * step - 0.14;
        if (f === 4 && z1 < 17.5) continue; // under the spine
        for (const [u0, u1, base0, alt0] of faceCells[f]) {
          if (!free(f, z0, z1, u0, u1)) continue;
          const nose = z0 > 43 && (f === 3 || f === 2 || f === 4);
          if (!nose && base0 !== RED && R() < 0.14) continue;
          // navy livery sweeping up the rear flanks
          const livery =
            (f === 2 && z1 < -18) || (f === 3 && z1 < -32 && u0 > 0.4 && u0 < 0.8) || (f === 3 && z1 < -45 && u0 < 0.4);
          const base = livery ? (f === 2 ? NAVY : NAVY_L) : base0;
          const alt = livery ? (f === 2 ? NAVY_L : NAVY) : alt0;
          const color = nose ? (u0 > 0.8 ? RED_D : RED) : R() < 0.3 ? alt : base;
          const lined = (f === 4 || f === 3 || f === 2) && !nose && base !== RED && R() < 0.35;
          const variant = R() < 0.5;
          for (const s of [1, -1]) {
            const c = [hp(z0, f, u0, s), hp(z0, f, u1, s), hp(z1, f, u1, s), hp(z1, f, u0, s)];
            const n = hn((z0 + z1) / 2, f, (u0 + u1) / 2, s);
            plate(hull, color, c, n, base === RED ? 0.24 : 0.18);
            if (lined) {
              const up = hp((z0 + z1) / 2, f, u1, s).sub(hp((z0 + z1) / 2, f, u0, s));
              decal(
                `${f === 2 ? "panelsSide" : "panelsTop"}${variant ? "A" : "B"}`,
                hull,
                variant ? T.panel : T.panel2,
                color === HULL_L ? HULL : color === NAVY || color === NAVY_L ? NAVY_D : HULL_D,
                0,
                centroid(c),
                n,
                up,
                (z1 - z0) * 0.8,
                up.length() * 0.8,
                0.22,
              );
            }
          }
        }
      }
    }
  }

  // dark navy underlay so the livery plates read as one block with dark seams
  for (const s of [1, -1]) {
    for (const [f, za, zb, u0, u1] of [
      [2, -53.8, -28.2, 0.02, 0.98],
      [2, -27.8, -18.4, 0.02, 0.98],
      [3, -53.8, -32.4, 0.42, 0.82],
      [3, -53.8, -45.1, 0.01, 0.42],
    ]) {
      plate(
        hull,
        NAVY_D,
        [hp(za, f, u0, s), hp(za, f, u1, s), hp(zb, f, u1, s), hp(zb, f, u0, s)],
        hn((za + zb) / 2, f, (u0 + u1) / 2, s),
        0.07,
        0,
        0.05,
      );
    }
  }

  // ---------------------------------------------------------------- spine tiers
  const tierRing = (z: number, bw: number, tw: number, y0: number, h: number) => {
    const { W } = hullAt(z);
    return [v(bw * W, y0, z), v(tw * W, y0 + h, z), v(-tw * W, y0 + h, z), v(-bw * W, y0, z)];
  };
  const T1Z = [-53.5, -28, 0, 12, 18];
  loft(
    hull,
    T1Z.map((z) => tierRing(z, 0.3, 0.22, deckY(z) - 0.4, z <= 12 ? 3.6 : 0.3)),
    (i) => [HULL_D, HULL_L, HULL_D, null][i],
    [HULL_DD, HULL_D],
  );
  const T2Z = [-51, -28, -14, -8];
  loft(
    hull,
    T2Z.map((z) => tierRing(z, 0.19, 0.13, T1(z) - 0.3, z <= -14 ? 3.8 : 0.3)),
    (i) => [HULL, HULL_L, HULL, null][i],
    [HULL_D, HULL],
  );
  // tier side frames: point, normal and up on tier n's side face at z and height u
  const tierFace = (tier: 1 | 2, z: number, u: number, s: number) => {
    const { W } = hullAt(z);
    const [bw, tw] = tier === 1 ? [0.3, 0.22] : [0.19, 0.13];
    const y0 = tier === 1 ? deckY(z) - 0.4 : T1(z) - 0.3;
    const h = tier === 1 ? 3.6 : 3.8;
    const lo = v(s * bw * W, y0, z);
    const hi = v(s * tw * W, y0 + h, z);
    const up = hi.clone().sub(lo);
    const n = v(s * up.y, -s * up.x * s, 0).normalize();
    if (n.x * s < 0) n.negate();
    return { p: lerpV(lo, hi, u), n, up };
  };
  for (const s of [1, -1]) {
    // window rows on tier 1 and tier 2 sides
    for (let z = -50; z < 8; z += 6.2) {
      for (const u of [0.34, 0.7]) {
        const zm = z + 2.5;
        if (u < 0.5 && zm > -14 && zm < -2) continue;
        const f = tierFace(1, zm, u, s);
        decal("windows", hull, T.win, "#ffffff", 1.25, f.p, f.n, f.up, 5, 0.42, 0.04);
      }
    }
    for (let z = -48; z < -16; z += 5.4) {
      const f = tierFace(2, z + 2.2, 0.55, s);
      decal("windows", hull, T.win, "#ffffff", 1.25, f.p, f.n, f.up, 4.4, 0.4, 0.04);
    }
    // conduit run along the foot of tier 1
    const run = [-50, -28, 0, 11].map((z) => {
      const { W } = hullAt(z);
      return v(s * (0.315 * W + 0.15), deckY(z) - 0.02, z);
    });
    for (let i = 0; i < run.length - 1; i++) cyl(hull, NAVY_D, run[i], run[i + 1], 0.28, 0.28, 6);
    for (let z = -48; z < 10; z += 4) {
      const { W } = hullAt(z);
      box(hull, GUN, [0.9, 0.75, 0.5], v(s * (0.315 * W + 0.15), deckY(z) + 0.05, z));
    }
  }

  // ---------------------------------------------------------------- bridge tower
  const ty = T2(-43) - 22.9; // tower foot, from the spine
  const by = ty + 2.6; // everything from the bridge up
  prism(
    hull,
    HULL_D,
    [v(-2.9, ty + 22, -50), v(2.9, ty + 22, -50), v(2.9, ty + 22, -36.2), v(-2.9, ty + 22, -36.2)],
    [v(-2.1, by + 27.7, -47.5), v(2.1, by + 27.7, -47.5), v(2.1, by + 27.7, -39.8), v(-2.1, by + 27.7, -39.8)],
  );
  // tower ribs and a lit stair of windows
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      const y = ty + 22 + (by + 27.7 - ty - 22) * t;
      const hx = 2.9 + (2.1 - 2.9) * t;
      decal(
        "windows",
        hull,
        T.win,
        "#ffffff",
        1.25,
        v(s * hx, y, -43.4),
        v(s, 0.14, 0),
        UP,
        5.2 + (1 - t) * 2.4,
        0.42,
        0.05,
      );
    }
    for (const z of [-48.6, -38.2])
      cyl(hull, NAVY, v(s * 2.75, ty + 21.8, z), v(s * 2.05, by + 27.6, z + (z < -43 ? 1.1 : -1.4)), 0.22, 0.22, 4);
  }
  for (let i = 0; i < 6; i++) box(hull, GUN, [3.6, 0.18, 0.3], v(0, ty + 23 + i * 1.05, -36.6 - i * 0.48));
  const BR: [number, number][] = [
    [-47.5, 27.4],
    [-39.5, 27.4],
    [-37.2, 28.8],
    [-37.9, 30.6],
    [-46.2, 31.0],
    [-48.2, 29.6],
  ];
  const brC = centroid(BR.map(([z, y]) => v(0, by + y, z)));
  const brRing = (x: number, sc: number) =>
    BR.map(([z, y]) => v(x, brC.y + (by + y - brC.y) * sc, brC.z + (z - brC.z) * sc));
  loft(
    hull,
    [brRing(-9.6, 0.8), brRing(-8.9, 1), brRing(8.9, 1), brRing(9.6, 0.8)],
    (i) => [HULL_D, HULL_D, NAVY_D, HULL_L, HULL, HULL_D][i],
    [HULL, HULL],
  );
  {
    const a = v(0, by + 28.8, -37.2);
    const c = v(0, by + 30.6, -37.9);
    const d = c.clone().sub(a);
    const n = v(0, -d.z, d.y).normalize();
    decal("bridgeWin", hull, T.bridge, "#ffffff", 1.4, lerpV(a, c, 0.5), n, d, 17, 1.45, 0.04);
    // rear windows and the red command stripe
    const ra = v(0, by + 29.6, -48.2);
    const rc = v(0, by + 31.0, -46.2);
    const rd = rc.clone().sub(ra);
    decal(
      "windows",
      hull,
      T.win,
      "#ffffff",
      1.25,
      lerpV(ra, rc, 0.5),
      v(0, -rd.z, rd.y).normalize().negate(),
      rd,
      12,
      0.5,
      0.05,
    );
    box(hull, RED, [16.2, 0.3, 0.5], v(0, by + 31.02, -44.2));
  }
  // bridge underside: lamps and greebles
  for (const s of [1, -1]) {
    for (let i = 0; i < 3; i++)
      glowBox(
        hull,
        ICE,
        [0.6, 0.12, 0.6],
        v(s * (3.6 + i * 2.1), by + 27.36, -41.6),
        1.3,
        `bridgeLamp${s > 0 ? "L" : "R"}${i}`,
      );
    blk(hull, GUN, [s * 6.4, by + 27.2, -45], [3.2, 0.5, 2.6], 0.12, true);
  }
  // command deck, dish and masts
  blk(hull, HULL, [0, by + 31.95, -43], [7, 2.2, 5.6], 0.35);
  decal("bridgeWin", hull, T.bridge, "#ffffff", 1.4, v(0, by + 31.75, -40.2), v(0, 0, 1), UP, 6, 0.62, 0.06);
  for (const s of [1, -1]) {
    decal("emblem", hull, T.emblem, "#ffffff", 0, v(s * 9.6, brC.y, brC.z), v(s, 0, 0), UP, 2.3, 2.3, 0.05);
    // masts
    const base = v(s * 3.0, by + 33, -45.3);
    cyl(hull, GUN_L, base, v(s * 3.0, by + 41.2, -45.3), 0.16, 0.1, 6);
    for (const y of [36.2, 38.6]) box(hull, GUN, [1.8, 0.14, 0.14], v(s * 3.0, by + y, -45.3));
    for (const y of [36.2, 38.6])
      for (const e of [-0.85, 0.85])
        cyl(hull, GUN_L, v(s * 3.0 + e, by + y, -45.3), v(s * 3.0 + e, by + y - 1.1, -45.3), 0.05, 0.05, 4);
    glowBox(hull, NAV_R, [0.36, 0.36, 0.36], v(s * 3.0, by + 41.35, -45.3), 1.6, `mastLight${s > 0 ? "L" : "R"}`);
    // hammerhead wing greebles and small static dishes
    blk(hull, GUN, [s * 7.4, by + 31.15, -44.6], [2.2, 0.5, 2.6], 0.12);
    cyl(hull, GUN_D, v(s * 7.4, by + 31.3, -44.6), v(s * 7.4, by + 32.1, -44.6), 0.55, 0.5, 6);
    b.part(new THREE.IcosahedronGeometry(1.45, 1), HULL_L, {
      bone: hull,
      at: v(s * 7.4, by + 33.1, -44.6),
      flat: true,
      name: `shieldDome${s > 0 ? "L" : "R"}`,
    });
    cyl(hull, RED, v(s * 7.4, by + 31.95, -44.6), v(s * 7.4, by + 32.25, -44.6), 1.25, 1.2, 8);
    blk(hull, HULL_D, [s * 5.2, by + 31.2, -46], [1.6, 0.7, 1.6], 0.15);
    cyl(hull, GUN, v(s * 5.2, by + 31.5, -46), v(s * 5.2, by + 32.4, -46), 0.15, 0.15, 4);
    turn(
      hull,
      HULL_L,
      [
        [0, 0],
        [0.5, 0.05],
        [0.95, 0.32],
        [0.85, 0.36],
        [0, 0.12],
      ],
      v(s * 5.2, by + 32.3, -46),
      v(s * 0.5, 0.6, -0.6),
      8,
    );
  }
  cyl(hull, GUN, [0, by + 32.9, -42.9], [0, by + 34.6, -42.9], 0.42, 0.32, 6);
  const dishAt = v(0, by + 35.9, -42.9);
  const dishYaw = b.joint("dishYaw", { parent: hull, at: [0, by + 34.6, -42.9], dir: [0, 1, 0] });
  box(dishYaw, GUN_D, [1.6, 0.35, 0.8], [0, by + 34.75, -42.9]);
  for (const s of [1, -1]) box(dishYaw, GUN, [0.25, 1.4, 0.6], [s * 0.7, by + 35.5, -42.9]);
  const dishDir = v(0, 0.6, 1).normalize();
  const dish = b.joint("dish", { parent: dishYaw, at: dishAt, dir: dishDir, role: "hinge" });
  turn(
    dish,
    HULL_L,
    [
      [0, 0],
      [1.1, 0.08],
      [2.1, 0.36],
      [2.8, 0.8],
      [2.62, 0.88],
      [2.0, 0.5],
      [1.05, 0.26],
      [0, 0.18],
    ],
    dishAt.clone().addScaledVector(dishDir, -0.1),
    dishDir,
    10,
  );
  cyl(
    dish,
    GUN_D,
    dishAt.clone().addScaledVector(dishDir, -0.4),
    dishAt.clone().addScaledVector(dishDir, 0.25),
    0.55,
    0.5,
    6,
  );
  {
    const tip = dishAt.clone().addScaledVector(dishDir, 2.1);
    cyl(dish, GUN_L, dishAt, tip, 0.1, 0.1, 5);
    const side = v(1, 0, 0);
    const upD = dishDir.clone().cross(side).normalize();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      const rim = dishAt
        .clone()
        .addScaledVector(dishDir, 0.75)
        .addScaledVector(side, Math.cos(a) * 2.6)
        .addScaledVector(upD, Math.sin(a) * 2.6);
      cyl(dish, GUN_L, rim, tip, 0.05, 0.05, 4);
    }
    glow(b.part(new THREE.OctahedronGeometry(0.28), RED_L, { bone: dish, at: tip, name: "dishFeed" }), 1.5);
  }

  // ---------------------------------------------------------------- engine block
  const engRing = (z: number, sc: number) => {
    const hw = 14.5 * sc;
    const hh = 7.4 * sc;
    const c = 2.4 * sc;
    const yc = 14.4;
    return [
      v(hw, yc - hh + c, z),
      v(hw, yc + hh - c, z),
      v(hw - c, yc + hh, z),
      v(-hw + c, yc + hh, z),
      v(-hw, yc + hh - c, z),
      v(-hw, yc - hh + c, z),
      v(-hw + c, yc - hh, z),
      v(hw - c, yc - hh, z),
    ];
  };
  const ENG_Z = -59.6;
  loft(
    hull,
    [engRing(-51.5, 1), engRing(-59, 1), engRing(ENG_Z, 0.95)],
    (i) => [HULL_D, HULL, HULL_L, HULL, HULL_D, HULL_DD, HULL_DD, HULL_DD][i],
    [null, GUN_D],
  );
  const NOZ: [number, number, number][] = [
    [0, 15.6, 3.3],
    [8.2, 15.2, 3.0],
    [-8.2, 15.2, 3.0],
    [4.1, 9.6, 1.75],
    [-4.1, 9.6, 1.75],
    [10.9, 10.4, 1.55],
    [-10.9, 10.4, 1.55],
    [11.8, 18.6, 1.2],
    [-11.8, 18.6, 1.2],
  ];
  for (const [x, y, r] of NOZ) {
    const at = v(x, y, ENG_Z + 0.05);
    turn(
      hull,
      GUN,
      [
        [0, 0],
        [0.95 * r, 0],
        [1.06 * r, 0.35 * r],
        [0.98 * r, 0.55 * r],
        [1.2 * r, 1.0 * r],
        [1.08 * r, 1.0 * r],
        [0.8 * r, 0.4 * r],
        [0, 0.4 * r],
      ],
      at,
      [0, 0, -1],
      10,
    );
    cyl(hull, HULL_L, v(x, y, ENG_Z + 0.1), v(x, y, ENG_Z - 0.28 * r), 1.12 * r, 1.12 * r, 10);
    cyl(hull, RED, v(x, y, ENG_Z - 0.28 * r), v(x, y, ENG_Z - 0.36 * r), 1.1 * r, 1.08 * r, 10);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      cyl(
        hull,
        GUN_L,
        v(x + Math.cos(a) * 1.08 * r, y + Math.sin(a) * 1.08 * r, ENG_Z - 0.35 * r),
        v(x + Math.cos(a) * 1.2 * r, y + Math.sin(a) * 1.2 * r, ENG_Z - 0.92 * r),
        0.06 * r,
        0.06 * r,
        4,
      );
    }
    decal("core", hull, T.core, "#ffffff", 1.7, v(x, y, ENG_Z - 0.4 * r - 0.02), v(0, 0, -1), UP, 1.6 * r, 1.6 * r, 0);
  }
  // rear face grilles and hazard rim
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) box(hull, GUN, [2.2, 0.22, 0.4], v(s * 4.1, 12.7 + i * 0.45, ENG_Z - 0.1));
    for (let i = 0; i < 5; i++) box(hull, INK, [0.25, 2.6, 0.3], v(s * (12.4 + i * 0.36), 14.4, ENG_Z - 0.1));
  }
  box(hull, HAZ, [18, 0.5, 0.3], v(0, 20.95, ENG_Z - 0.05));
  box(hull, HAZ, [18, 0.5, 0.3], v(0, 7.85, ENG_Z - 0.05));
  // housing sides: hull number, vents
  for (const s of [1, -1]) {
    decal("number", hull, T.num, "#ffffff", 0, v(s * 14.5, 15.8, -55.4), v(s, 0, 0), UP, 6.0, 3.0, 0.05);
    box(hull, GUN_D, [0.3, 3.0, 5.6], v(s * 14.55, 11.2, -55.4));
    for (let i = 0; i < 5; i++)
      glowBox(
        hull,
        CYAN,
        [0.2, 0.24, 4.8],
        v(s * 14.66, 10.0 + i * 0.6, -55.4),
        1.5,
        `heatVent${s > 0 ? "L" : "R"}${i}`,
      );
    // radiator fins on the housing top
    for (let i = 0; i < 6; i++) {
      const x = s * (6.9 + i * 1.02);
      box(hull, HULL_D, [0.24, 2.3, 5.4], v(x, 22.9, -56.2));
      box(hull, i % 2 ? RED : RED_D, [0.3, 0.32, 5.5], v(x, 24.1, -56.2));
    }
    box(hull, GUN, [6.6, 0.4, 0.6], v(s * 9.45, 21.95, -53.6));
    box(hull, GUN, [6.6, 0.4, 0.6], v(s * 9.45, 21.95, -58.8));
    // manoeuvring thrusters on the waist wings
    for (const [ty, tx] of [
      [11.2, 18.0],
      [10.4, 16.2],
    ]) {
      cyl(hull, GUN, v(s * tx, ty, -54.0), v(s * tx, ty, -55.1), 0.75, 0.9, 8);
      decal("core", hull, T.core, "#ffffff", 1.7, v(s * tx, ty, -55.12), v(0, 0, -1), UP, 1.3, 1.3, 0);
    }
  }
  decal("emblem", hull, T.emblem, "#ffffff", 0, v(0, 21.8, -56.6), UP, v(0, 0, 1), 4.6, 4.6, 0.05);

  // radiator banks on the rear shoulders
  for (const s of [1, -1]) {
    const x0 = s * 8.2;
    const x1 = s * 13.2;
    prism(
      hull,
      GUN,
      [v(x0, 16.6, -52), v(x1, 16.6, -52), v(x1, 16.6, -43.5), v(x0, 16.6, -43.5)],
      [v(x0, 20.0, -51.7), v(x1 - s * 0.3, 20.0, -51.7), v(x1 - s * 0.3, 20.0, -43.8), v(x0, 20.0, -43.8)],
    );
    for (let i = 0; i < 8; i++) {
      const z = -51.2 + i * 1.0;
      box(hull, i % 2 ? HULL_D : HULL, [4.6, 2.4, 0.22], v(s * 10.6, 21.2, z));
      box(hull, i % 2 ? RED : RED_D, [4.7, 0.3, 0.3], v(s * 10.6, 22.5, z));
    }
    box(hull, HULL_DD, [0.4, 1.2, 8.2], v(s * 13.0, 20.4, -47.7));
  }

  // ---------------------------------------------------------------- hangar bays (one each side)
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    const [z0, z1] = HANGAR;
    const A0 = hp(z0, 1, 0, s);
    const A1 = hp(z1, 1, 0, s);
    const B0 = hp(z0, 1, 1, s);
    const B1 = hp(z1, 1, 1, s);
    const xi = s * 9.6;
    const inn = (p: Vec) => v(xi, p.y, p.z);
    const mid = centroid([A0, A1, B0, B1, inn(A0), inn(B1)]);
    const m = new Mesher();
    m.poly([A0, A1, inn(A1), inn(A0)], mid, true);
    const floor = m.geo();
    const m2 = new Mesher();
    m2.poly([B0, B1, inn(B1), inn(B0)], mid, true);
    m2.poly([inn(A0), inn(A1), inn(B1), inn(B0)], mid, true);
    const ceil = m2.geo();
    const m3 = new Mesher();
    m3.poly([A0, B0, inn(B0), inn(A0)], mid, true);
    m3.poly([A1, B1, inn(B1), inn(A1)], mid, true);
    stash(hull, GUN_L, floor);
    stash(hull, NAVY_D, ceil);
    stash(hull, GUN, m3.geo());
    // ribs and lights inside
    for (let i = 0; i < 6; i++) {
      const z = z0 + 1.6 + i * 2.8;
      const yb = A0.y + (A1.y - A0.y) * ((z - z0) / (z1 - z0));
      const yt = B0.y + (B1.y - B0.y) * ((z - z0) / (z1 - z0));
      box(hull, GUN_D, [0.3, yt - yb, 0.4], v(xi + s * 0.15, (yb + yt) / 2, z));
      const yl = B0.y + (B1.y - B0.y) * ((z + 1.4 - z0) / (z1 - z0));
      glowBox(hull, ICE, [3.2, 0.12, 0.35], v(s * 12.5, yl - 0.07, z + 1.4), 1.3, `bayLight${side}${i}`);
    }
    decal("bayFloor", hull, T.chev, GOLD, 0, v(s * 13.3, A0.y + 0.02, -14.5), UP, v(-s, 0, 0), 2.6, 2.6, 0.02);
    decal("bayFloor", hull, T.chev, GOLD, 0, v(s * 13.3, A0.y + 0.02, -18.8), UP, v(-s, 0, 0), 2.6, 2.6, 0.02);
    decal("stencil", hull, T.stencil, GOLD, 0, v(xi + s * 0.32, A0.y + 2.2, -8.6), v(s, 0, 0), UP, 3.6, 0.9, 0.02);
    // a parked shuttle
    const sx = s * 12.4;
    const sy = A0.y;
    prism(
      hull,
      HULL_L,
      [
        v(sx - 1.3, sy + 0.5, -12.5),
        v(sx + 1.3, sy + 0.5, -12.5),
        v(sx + 0.5, sy + 0.5, -7.6),
        v(sx - 0.5, sy + 0.5, -7.6),
      ],
      [
        v(sx - 0.8, sy + 1.7, -12.0),
        v(sx + 0.8, sy + 1.7, -12.0),
        v(sx + 0.25, sy + 1.1, -8.4),
        v(sx - 0.25, sy + 1.1, -8.4),
      ],
    );
    box(hull, RED, [2.7, 0.2, 1.4], v(sx, sy + 0.95, -11.6));
    glowBox(hull, CYAN, [1.6, 0.6, 0.12], v(sx, sy + 1.05, -12.56), 1.5, `shuttleEngine${side}`);
    glowBox(hull, ICE, [0.7, 0.3, 0.9], v(sx, sy + 1.3, -8.9), 1.2, `shuttleCanopy${side}`);
    for (const e of [-1, 1]) box(hull, GUN_D, [0.2, 0.5, 0.2], v(sx + e * 0.8, sy + 0.25, -10));
    for (let i = 0; i < 3; i++)
      blk(
        hull,
        i % 2 ? GOLD_D : NAVY_L,
        [s * (10.6 + (i % 2) * 0.1), sy + 0.5 + (i === 2 ? 1 : 0), -20.8 + (i === 2 ? 0.2 : i * 1.2)],
        [1.1, 1.0, 1.1],
        0.08,
      );
    // force field across the mouth
    const nb = hn((z0 + z1) / 2, 1, 0.5, s);
    const upb = B0.clone().sub(A0);
    decal(
      "field",
      hull,
      T.field,
      "#ffffff",
      1.5,
      centroid([A0, A1, B0, B1]).addScaledVector(nb, -0.25),
      nb,
      upb,
      z1 - z0,
      upb.length(),
      0,
    );
    // hazard frame
    cyl(hull, HAZ, A0.clone().addScaledVector(nb, 0.1), A1.clone().addScaledVector(nb, 0.1), 0.32, 0.32, 6);
    cyl(hull, HAZ, B0.clone().addScaledVector(nb, 0.1), B1.clone().addScaledVector(nb, 0.1), 0.32, 0.32, 6);
    cyl(hull, GUN, A0.clone().addScaledVector(nb, 0.1), B0.clone().addScaledVector(nb, 0.1), 0.42, 0.42, 6);
    cyl(hull, GUN, A1.clone().addScaledVector(nb, 0.1), B1.clone().addScaledVector(nb, 0.1), 0.42, 0.42, 6);
    // the door, hinged on the waist and swung up into an awning
    const hingeA = B0.clone().addScaledVector(nb, 0.35);
    const hingeB = B1.clone().addScaledVector(nb, 0.35);
    const door = b.joint(`hangarDoor${side}`, {
      parent: hull,
      at: lerpV(hingeA, hingeB, 0.5),
      aim: hingeB,
      role: "hinge",
    });
    const out = v(s, 0.42, 0).normalize();
    const thick = v(-0.42 * s, 1, 0).normalize();
    const L = 3.9;
    const ia = hingeA.clone().add(v(0, 0, -0.5));
    const ib = hingeB.clone().add(v(0, 0, 0.5));
    const oa = ia.clone().addScaledVector(out, L);
    const ob = ib.clone().addScaledVector(out, L);
    prism(
      door,
      NAVY,
      [ia, ib, ob, oa],
      [ia, ib, ob, oa].map((p) => p.clone().addScaledVector(thick, 0.35)),
    );
    for (let i = 0; i < 5; i++) {
      const z = z0 + 0.6 + i * ((z1 - z0 - 1.2) / 4);
      const a = v(ia.x, ia.y, z);
      cyl(
        door,
        GUN,
        a.clone().addScaledVector(thick, -0.05),
        a.clone().addScaledVector(out, L).addScaledVector(thick, -0.05),
        0.18,
        0.18,
        4,
      );
    }
    const ea = oa.clone().addScaledVector(out, -0.5);
    const eb = ob.clone().addScaledVector(out, -0.5);
    prism(
      door,
      HAZ,
      [ea, eb, ob, oa].map((p) => p.clone().addScaledVector(thick, 0.3)),
      [ea, eb, ob, oa].map((p) => p.clone().addScaledVector(thick, 0.45)),
    );
    for (let i = 0; i < 4; i++)
      glowBox(
        door,
        AMBER,
        [0.3, 0.2, 0.5],
        oa
          .clone()
          .lerp(ob, 0.12 + i * 0.25)
          .addScaledVector(thick, 0.12)
          .addScaledVector(out, 0.06),
        1.4,
        `doorLamp${side}${i}`,
      );
    // hydraulic rams
    for (const z of [z0 + 2, z1 - 2]) {
      const a = hp(z, 2, 0.32, s);
      const c = v(ia.x, ia.y, z).addScaledVector(out, 2.2).addScaledVector(thick, 0.36);
      cyl(door, HULL_L, a, c, 0.16, 0.16, 6);
      cyl(hull, GUN, a, lerpV(a, c, 0.55), 0.26, 0.26, 6);
    }
  }

  // ---------------------------------------------------------------- band furniture: name, lit portholes, ribs, lights
  for (const s of [1, -1]) {
    const nameZ = 19;
    const bandN = hn(nameZ, 1, 0.5, s);
    decal(
      "name",
      hull,
      T.name,
      "#ffffff",
      0,
      hp(nameZ, 1, 0.5, s),
      bandN,
      hp(nameZ, 1, 1, s).sub(hp(nameZ, 1, 0, s)),
      13,
      1.3,
      0.06,
    );
    for (let z = -51; z < -28; z += 5.6) {
      const n = hn(z + 2.3, 1, 0.42, s);
      decal(
        "windows",
        hull,
        T.win,
        "#ffffff",
        1.25,
        hp(z + 2.3, 1, 0.42, s),
        n,
        hp(z + 2.3, 1, 1, s).sub(hp(z + 2.3, 1, 0, s)),
        4.8,
        0.45,
        0.04,
      );
    }
    for (let z = -4; z < 10; z += 5.6) {
      const n = hn(z + 2.3, 1, 0.42, s);
      decal(
        "windows",
        hull,
        T.win,
        "#ffffff",
        1.25,
        hp(z + 2.3, 1, 0.42, s),
        n,
        hp(z + 2.3, 1, 1, s).sub(hp(z + 2.3, 1, 0, s)),
        4.8,
        0.45,
        0.04,
      );
    }
    for (let z = -52; z < 46; z += 2.8) {
      if (z > HANGAR[0] - 1 && z < HANGAR[1] + 1) continue;
      if (z > 11.5 && z < 26.5) continue;
      const a = hp(z, 1, 0.08, s);
      const c = hp(z, 1, 0.92, s);
      const n = hn(z, 1, 0.5, s);
      cyl(hull, NAVY_D, a.addScaledVector(n, 0.05), c.addScaledVector(n, 0.05), 0.16, 0.16, 4);
    }
    // waist trim and docking lights
    const waist = [-54, -28, 0, 28, 47, 55].map((z) => hp(z, 2, 0, s));
    for (let i = 0; i < waist.length - 1; i++) cyl(hull, NAVY_L, waist[i], waist[i + 1], 0.32, 0.32, 4);
    for (let z = -48; z < 46; z += 8)
      glowBox(
        hull,
        AMBER,
        [0.6, 0.35, 0.9],
        hp(z, 2, 0, s).add(v(s * 0.3, 0, 0)),
        1.6,
        `dock${s > 0 ? "L" : "R"}${z + 48}`,
      );
    glowBox(
      hull,
      s > 0 ? NAV_R : NAV_G,
      [0.9, 0.7, 1.4],
      hp(-52.5, 2, 0, s).add(v(s * 0.45, 0, 0)),
      1.8,
      `nav${s > 0 ? "L" : "R"}`,
    );
    glowBox(
      hull,
      s > 0 ? NAV_R : NAV_G,
      [0.6, 0.5, 1.0],
      hp(44, 2, 0, s).add(v(s * 0.35, 0, 0)),
      1.8,
      `navFore${s > 0 ? "L" : "R"}`,
    );
  }

  // ---------------------------------------------------------------- shoulder missile pods and flank louvres
  for (const s of [1, -1]) {
    const at = (z: number, u: number) => hp(z, 3, u, s);
    const nPod = hn(21.7, 3, 0.43, s);
    plate(hull, GUN, [at(17.5, 0.1), at(17.5, 0.76), at(26, 0.76), at(26, 0.1)], nPod, 0.7, 0.22);
    for (let i = 0; i < 3; i++) {
      for (const [u0, u1] of [
        [0.16, 0.41],
        [0.45, 0.7],
      ]) {
        const za = 18.2 + i * 2.55;
        const q = [at(za, u0), at(za, u1), at(za + 2.15, u1), at(za + 2.15, u0)];
        if (i === 0 && u0 > 0.4) {
          plate(hull, INK, q, nPod, 0.76, 0.05);
          const mc = centroid(q).addScaledVector(nPod, 0.7);
          cyl(hull, RED_L, mc, mc.clone().addScaledVector(nPod, 0.8), 0.45, 0, 6);
        } else plate(hull, (i + (u0 > 0.4 ? 1 : 0)) % 2 ? HULL_L : HULL, q, nPod, 0.86, 0.1);
      }
    }
    plate(hull, HAZ, [at(25.5, 0.12), at(25.5, 0.74), at(25.95, 0.74), at(25.95, 0.12)], nPod, 0.8, 0.04);
    for (const zc of [2.5, 7.5, 23.5]) {
      for (let i = 0; i < 4; i++) {
        const z = zc + i * 0.6;
        plate(
          hull,
          GUN_D,
          [hp(z, 2, 0.56, s), hp(z, 2, 0.9, s), hp(z + 0.32, 2, 0.9, s), hp(z + 0.32, 2, 0.56, s)],
          hn(z, 2, 0.7, s),
          0.34,
          0.05,
        );
      }
    }
  }

  // ---------------------------------------------------------------- escape pod hatches along the upper flanks
  for (const s of [1, -1]) {
    for (let z = -50; z < 30; z += 3.3) {
      if (z > HANGAR[0] - 1.5 && z < HANGAR[1] + 1.5) continue;
      const p = hp(z, 2, 0.27, s);
      const n = hn(z, 2, 0.27, s);
      cyl(hull, GOLD_D, p.clone().addScaledVector(n, -0.1), p.clone().addScaledVector(n, 0.3), 0.62, 0.62, 6);
      cyl(hull, HULL_L, p.clone().addScaledVector(n, 0.2), p.clone().addScaledVector(n, 0.38), 0.42, 0.42, 6);
    }
  }

  // ---------------------------------------------------------------- service conduit along the lower flanks
  for (const s of [1, -1]) {
    const run = [-53, -28, 0, 28, 44].map((z) => {
      const p = hp(z, 0, 0.62, s);
      return p.addScaledVector(hn(z, 0, 0.62, s), 0.32);
    });
    for (let i = 0; i < run.length - 1; i++) cyl(hull, GUN, run[i], run[i + 1], 0.3, 0.3, 6);
    for (let z = -50; z < 42; z += 3.5) {
      const p = hp(z, 0, 0.62, s).addScaledVector(hn(z, 0, 0.62, s), 0.3);
      box(hull, GUN_D, [0.55, 0.9, 0.5], p, aim(hn(z, 0, 0.62, s)));
    }
  }

  // ---------------------------------------------------------------- hull markings on the faces
  for (const s of [1, -1]) {
    const nz = 37;
    decal(
      "number",
      hull,
      T.num,
      "#ffffff",
      0,
      hp(nz, 2, 0.5, s),
      hn(nz, 2, 0.5, s),
      hp(nz, 2, 1, s).sub(hp(nz, 2, 0, s)),
      4.6,
      2.3,
      0.05,
    );
    const ez = 13;
    decal("emblem", hull, T.emblem, "#ffffff", 0, hp(ez, 3, 0.52, s), hn(ez, 3, 0.52, s), v(0, 0, 1), 3.6, 3.6, 0.05);
  }
  // nose: sensor prong, chevrons, strobes
  {
    const tip = v(0, hullAt(55).yk + 1.0, 55);
    cyl(hull, GUN_L, tip.clone().add(v(0, 0, -1)), tip.clone().add(v(0, 0, 4.4)), 0.32, 0.18, 6);
    for (const dz of [0.6, 1.7, 2.8])
      cyl(hull, HULL_L, tip.clone().add(v(0, 0, dz)), tip.clone().add(v(0, 0, dz + 0.3)), 0.42, 0.42, 6);
    glow(
      b.part(new THREE.OctahedronGeometry(0.34), STROBE, {
        bone: hull,
        at: tip.clone().add(v(0, 0, 4.6)),
        name: "noseStrobe",
      }),
      1.8,
    );
    for (let i = 0; i < 3; i++) {
      const z = 41 - i * 3.2;
      decal("chevron", hull, T.chev, RED, 0, v(0, deckY(z), z), UP, v(0, 0, 1), 2.2, 2.2, 0.05);
    }
    cyl(hull, GUN_L, [0, 21.7, -59.2], [0, 22.6, -59.2], 0.15, 0.12, 4);
    glow(
      b.part(new THREE.OctahedronGeometry(0.4), STROBE, { bone: hull, at: [0, 22.8, -59.2], name: "tailStrobe" }),
      1.8,
    );
  }

  // ---------------------------------------------------------------- ventral keel module
  const vRing = (z: number, depth: number) => {
    const yk = hullAt(z).yk;
    return [v(5, yk + 0.3, z), v(3.4, yk - depth, z), v(-3.4, yk - depth, z), v(-5, yk + 0.3, z)];
  };
  loft(
    hull,
    [vRing(-46, 0.2), vRing(-40, 2.4), vRing(18, 2.4), vRing(24, 0.2)],
    (i) => [HULL_DD, GUN, HULL_DD, null][i],
    [HULL_DD, HULL_DD],
  );
  for (let z = -36; z < 16; z += 6) {
    blk(hull, GUN_L, [0, 4.6, z + 2.5], [5.0, 0.3, 4.6], 0.1, true);
    for (const s of [1, -1])
      glowBox(hull, AMBER, [0.25, 0.3, 0.6], [s * 4.3, 6.2, z + 1], 1.3, `keelLamp${s > 0 ? "L" : "R"}${z + 36}`);
  }
  turn(
    hull,
    HULL_D,
    [
      [0, 0],
      [1.4, 0],
      [1.25, 0.7],
      [0.6, 1.2],
      [0, 1.3],
    ],
    [0, 4.65, -42],
    [0, -1, 0],
    8,
  );
  glow(b.part(new THREE.OctahedronGeometry(0.3), NAV_R, { bone: hull, at: [0, 3.25, -42], name: "keelBeacon" }), 1.6);
  // ventral blade antenna
  b.extrude(
    [
      [0, 0],
      [4.2, 0],
      [3.0, 1.5],
      [0.6, 1.5],
    ],
    { at: [0, 4.7, -36], x: [0, 0, 1], y: [0, -1, 0], thickness: 0.25, color: HULL_D, bone: hull, name: "keelBlade" },
  );

  // ---------------------------------------------------------------- turrets
  let turretCount = 0;
  const turret = (base: Vec, up: 1 | -1, k: number, nb: 2 | 3) => {
    const id = ++turretCount;
    const L = (x: number, y: number, z: number) => v(base.x + x * k, base.y + up * y * k, base.z + z * k);
    cyl(hull, GUN, L(0, -2.2, 0), L(0, 0, 0), 2.15 * k, 2.15 * k, 8);
    cyl(hull, HULL_L, L(0, -0.3, 0), L(0, 0.02, 0), 2.35 * k, 2.35 * k, 8);
    const yaw = b.joint(`turret${id}`, { parent: hull, at: L(0, 0, 0), dir: [0, up, 0] });
    cyl(yaw, GUN_D, L(0, 0, 0), L(0, 0.4, 0), 1.95 * k, 1.85 * k, 8);
    const prof: [number, number][] = [
      [-2.5, 0.3],
      [1.9, 0.3],
      [2.5, 0.85],
      [1.5, 1.75],
      [-2.0, 1.85],
      [-2.7, 1.1],
    ];
    const pc = centroid(prof.map(([z, y]) => v(0, y, z)));
    const hr = (x: number, sc: number) => prof.map(([z, y]) => L(x, pc.y + (y - pc.y) * sc, pc.z + (z - pc.z) * sc));
    const hw = nb === 3 ? 1.95 : 1.65;
    loft(
      yaw,
      [hr(-hw - 0.3, 0.84), hr(-hw, 1), hr(hw, 1), hr(hw + 0.3, 0.84)],
      (i) => [GUN_D, HULL, HULL_L, HULL_L, HULL, HULL_D][i],
      [HULL, HULL],
    );
    for (const sx of [1, -1]) {
      box(yaw, RED, [0.12, 0.28 * k, 2.6 * k], L(sx * (hw + 0.02), 1.15, -0.5));
      cyl(yaw, GUN_D, L(sx * (hw + 0.1), 1.45, -0.9), L(sx * (hw + 0.75), 1.45, -0.9), 0.25 * k, 0.25 * k, 6);
      box(yaw, GUN, [0.35 * k, 0.6 * k, 0.6 * k], L(sx * (hw + 0.85), 1.45, -0.9));
    }
    cyl(yaw, HULL, L(0.7, 1.82, -1.0), L(0.7, 2.1, -1.0), 0.45 * k, 0.4 * k, 6);
    box(yaw, GUN_D, [0.7 * k, 0.35 * k, 0.5 * k], L(-0.8, 1.95, -0.2));
    for (let i = 0; i < 3; i++) box(yaw, GUN_D, [2.2 * k, 0.12 * k, 0.22 * k], L(0, 1.55 - i * 0.28, -2.55 + i * 0.1));
    box(yaw, GUN, [2.4 * k, 0.8 * k, 0.7 * k], L(0, 0.95, -2.95));
    const pitch = b.joint(`guns${id}`, { parent: yaw, at: L(0, 1.0, 1.9), dir: [0, 0, 1], role: "hinge" });
    blk(pitch, GUN, L(0, 1.0, 2.2), [(nb === 3 ? 2.6 : 2.0) * k, 1.0 * k, 1.0 * k], 0.12 * k);
    const xs = nb === 3 ? [-0.82, 0, 0.82] : [-0.55, 0.55];
    const len = 5.6;
    for (const x of xs) {
      cyl(pitch, GUN_D, L(x, 1.0, 2.5), L(x, 1.0, 3.7), 0.36 * k, 0.32 * k, 6);
      cyl(pitch, GUN_L, L(x, 1.0, 3.6), L(x, 1.0, 2.5 + len), 0.22 * k, 0.2 * k, 6);
      cyl(pitch, HULL_L, L(x, 1.0, 5.3), L(x, 1.0, 5.6), 0.27 * k, 0.27 * k, 6);
      cyl(pitch, GUN_D, L(x, 1.0, 2.5 + len - 0.7), L(x, 1.0, 2.5 + len), 0.33 * k, 0.33 * k, 6);
      cyl(pitch, INK, L(x, 1.0, 2.5 + len - 0.1), L(x, 1.0, 2.5 + len + 0.03), 0.16 * k, 0.16 * k, 6);
    }
  };
  // dorsal: centreline triples, superfiring, then broadside twins on the shoulders
  turret(v(0, deckY(28.5) + 0.6, 28.5), 1, 1.2, 3);
  turret(v(0, T1(5.5), 5.5), 1, 1.3, 3);
  for (const z of [-5, -22, -37]) {
    for (const s of [1, -1]) {
      const p = hp(z, 3, 0.48, s);
      turret(v(p.x, p.y + 0.35, z), 1, 1.0, 2);
    }
  }
  // ventral triples
  turret(v(0, 4.6, 10), -1, 1.1, 3);
  turret(v(0, 4.6, -22), -1, 1.1, 3);

  // ---------------------------------------------------------------- point defence
  let pdCount = 0;
  const pd = (base: Vec, up: 1 | -1) => {
    const id = ++pdCount;
    const L = (x: number, y: number, z: number) => v(base.x + x, base.y + up * y, base.z + z);
    cyl(hull, GUN, L(0, -0.9, 0), L(0, 0.1, 0), 0.75, 0.75, 6);
    const yaw = b.joint(`pointDefence${id}`, { parent: hull, at: L(0, 0.1, 0), dir: [0, up, 0] });
    turn(
      yaw,
      HULL_L,
      [
        [0, 0],
        [0.7, 0],
        [0.62, 0.38],
        [0.35, 0.66],
        [0, 0.72],
      ],
      L(0, 0.1, 0),
      [0, up, 0],
      6,
    );
    box(yaw, GUN_D, [0.7, 0.35, 0.5], L(0, 0.5, 0.35));
    for (const x of [-0.17, 0.17]) cyl(yaw, GUN_D, L(x, 0.5, 0.5), L(x, 0.5, 2.0), 0.08, 0.07, 5);
    glowBox(yaw, RED_L, [0.22, 0.14, 0.06], L(0.38, 0.62, 0.3), 1.4, `pdLens${id}`);
  };
  for (const s of [1, -1]) {
    for (const [z, u] of [
      [29.5, 0.75],
      [-13.5, 0.82],
      [-30, 0.82],
    ]) {
      const p = hp(z, 3, u, s);
      pd(v(p.x, p.y + 0.35, z), 1);
    }
    pd(v(s * 7.6, by + 31.1, -41.2), 1);
    pd(v(s * 3.4, 21.9, -58.2), 1);
    pd(v(s * 3.3, 4.6, -33), -1);
  }
  pd(v(0, deckY(46.3), 46.3), 1);

  // ---------------------------------------------------------------- missile cells (VLS) on the foredeck
  {
    const z0 = 32.6;
    const z1 = 44.6;
    const yb = (z: number) => deckY(z) - 0.6;
    const yt = (z: number) => deckY(z) + 0.85;
    prism(
      hull,
      GUN,
      [v(-2.7, yb(z0), z0), v(2.7, yb(z0), z0), v(2.7, yb(z1), z1), v(-2.7, yb(z1), z1)],
      [
        v(-2.4, yt(z0 + 0.3), z0 + 0.3),
        v(2.4, yt(z0 + 0.3), z0 + 0.3),
        v(2.4, yt(z1 - 0.3), z1 - 0.3),
        v(-2.4, yt(z1 - 0.3), z1 - 0.3),
      ],
    );
    for (let i = 0; i < 5; i++) {
      for (const s of [1, -1]) {
        const za = z0 + 0.7 + i * 2.25;
        const zb = za + 1.9;
        const xa = s * 0.12;
        const xb = s * 2.15;
        const n = v(0, 1, 0.074).normalize();
        const c = [v(xa, yt(za), za), v(xb, yt(za), za), v(xb, yt(zb), zb), v(xa, yt(zb), zb)];
        if (i === 4) {
          // open cell: dark well, missile tip, lid standing on its hinge
          plate(hull, INK, c, n, 0.06, 0.05, 0.02);
          const mc = centroid(c);
          cyl(hull, RED_L, mc, mc.clone().add(v(0, 0.9, 0)), 0.55, 0.0, 6);
          cyl(hull, HULL_L, mc.clone().add(v(0, -0.2, 0)), mc.clone().add(v(0, 0.12, 0)), 0.6, 0.6, 6);
          const hinge = v(xb, yt((za + zb) / 2) + 0.08, (za + zb) / 2);
          const lid = b.joint(`missileHatch${s > 0 ? "L" : "R"}`, {
            parent: hull,
            at: hinge,
            aim: hinge.clone().add(v(0, 0, 1)),
            role: "hinge",
          });
          const o = v(s * 0.35, 1.0, 0).normalize();
          const t = v(s, -0.35, 0).normalize();
          const q = [
            v(xb, hinge.y, za),
            v(xb, hinge.y, zb),
            v(xb, hinge.y, zb).addScaledVector(o, 1.95),
            v(xb, hinge.y, za).addScaledVector(o, 1.95),
          ];
          prism(
            lid,
            HULL_L,
            q,
            q.map((p) => p.clone().addScaledVector(t, 0.16)),
          );
          const band = [q[3].clone().addScaledVector(o, -0.5), q[2].clone().addScaledVector(o, -0.5), q[2], q[3]];
          prism(
            lid,
            HAZ,
            band.map((p) => p.clone().addScaledVector(t, -0.03)),
            band.map((p) => p.clone().addScaledVector(t, 0.19)),
          );
        } else {
          plate(hull, i % 2 ? HULL_L : HULL, c, n, 0.16, 0.1, 0.05);
        }
      }
    }
    box(hull, HAZ, [5.6, 0.3, 0.35], v(0, yt(z0 + 0.3) + 0.05, z0 + 0.2));
    box(hull, HAZ, [5.6, 0.3, 0.35], v(0, yt(z1 - 0.3) + 0.05, z1 - 0.2));
  }

  // ---------------------------------------------------------------- greebles on the spine
  const greebles = (x0: number, x1: number, z0: number, z1: number, yAt: (z: number) => number, count: number) => {
    for (let i = 0; i < count; i++) {
      const x = x0 + (x1 - x0) * R();
      const z = z0 + (z1 - z0) * R();
      const y = yAt(z);
      const kind = R();
      if (kind < 0.35) {
        const w = 0.8 + R() * 1.4;
        const d = 0.8 + R() * 1.6;
        blk(hull, pick([GUN, HULL_D, NAVY]), [x, y + 0.25, z], [w, 0.7, d], 0.12);
        for (let j = 0; j < 3; j++) box(hull, GUN_D, [w * 0.7, 0.1, 0.12], v(x, y + 0.62, z - d * 0.3 + j * d * 0.3));
      } else if (kind < 0.6) {
        blk(hull, pick([HULL, HULL_L, HULL_D]), [x, y + 0.35, z], [0.9 + R(), 0.9 + R() * 0.5, 0.9 + R()], 0.15);
      } else if (kind < 0.8) {
        cyl(hull, GUN, v(x, y - 0.2, z), v(x, y + 0.4, z), 0.55, 0.55, 6);
        turn(
          hull,
          HULL_L,
          [
            [0, 0],
            [0.5, 0],
            [0.3, 0.35],
            [0, 0.4],
          ],
          v(x, y + 0.4, z),
          [0, 1, 0],
          6,
        );
      } else {
        cyl(hull, GUN_L, v(x, y - 0.2, z), v(x, y + 1.6 + R() * 1.5, z), 0.09, 0.06, 4);
        box(hull, GUN, [0.5, 0.4, 0.5], v(x, y + 0.1, z));
      }
    }
  };
  greebles(-2.6, 2.6, -7.5, 1.5, T1, 9);
  greebles(-2.4, 2.4, 10, 12, (z) => T1(z), 2);
  greebles(-2.3, 2.3, -22.5, -15, T2, 7);
  greebles(-2.3, -0.9, -35, -23.5, T2, 3);
  greebles(0.9, 2.3, -35, -23.5, T2, 3);
  // dorsal comms fin on the second tier
  b.extrude(
    [
      [0, 0],
      [10.5, 0],
      [10.0, 4.2, "sharp"],
      [8.2, 4.2],
      [0, 0.7],
    ],
    { at: [0, T2(-23.5) - 0.3, -23.5], x: [0, 0, -1], thickness: 0.4, color: HULL_L, bone: hull, name: "commsFin" },
  );
  box(hull, RED, [0.5, 0.3, 2.2], v(0, T2(-23.5) - 0.3 + 4.2, -23.5 - 9.1));
  for (let i = 0; i < 3; i++)
    box(hull, NAVY, [0.5, 0.22, 1.6 + i * 0.9], v(0, T2(-23.5) + 0.6 + i * 1.0, -23.5 - 3.6 - i * 1.6));
  glowBox(hull, NAV_R, [0.3, 0.3, 0.3], v(0, T2(-23.5) - 0.3 + 4.45, -23.5 - 10.1), 1.6, "finLight");
  greebles(-2.8, 2.8, -53, -50.6, T1, 4);
  // a big central vent stack behind the tower
  blk(hull, GUN, [0, T2(-50) + 0.6, -50.2], [3.2, 1.6, 1.4], 0.2);
  for (let i = 0; i < 4; i++)
    glowBox(hull, AMBER, [2.4, 0.16, 0.08], [0, T2(-50) + 0.2 + i * 0.3, -49.48], 1.2, `ventGlow${i}`);

  // ---------------------------------------------------------------- landing struts
  const struts: [number, number][] = [
    [3.0, 31],
    [6.6, -10],
    [8.6, -46],
  ];
  struts.forEach(([sx, z], n) => {
    for (const s of [1, -1]) {
      const id = `${n + 1}${s > 0 ? "L" : "R"}`;
      const yk = hullAt(z).yk;
      const top = v(s * sx, yk - 0.3, z);
      const foot = v(s * (sx + 1.2), 1.2, z + 0.4);
      blk(hull, GUN_D, [s * sx, yk - 0.3, z], [3.0, 1.2, 3.4], 0.25, true);
      const leg = b.chain(`strut${id}`, [top, foot], {
        names: [`strut${id}`, `foot${id}`],
        role: "leg",
        contact: [foot.x, 0, foot.z],
      });
      const sj = leg.joints[0];
      const fj = leg.tip!;
      cyl(sj, GUN, top, lerpV(top, foot, 0.58), 0.85, 0.78, 6);
      cyl(sj, HULL_L, lerpV(top, foot, 0.5), foot, 0.52, 0.52, 6);
      cyl(sj, HAZ, lerpV(top, foot, 0.5), lerpV(top, foot, 0.6), 0.88, 0.88, 6);
      cyl(sj, GUN_D, lerpV(top, foot, 0.2), lerpV(top, foot, 0.26), 0.92, 0.92, 6);
      const brace = v(s * (sx - 1.3), yk - 0.2, z - 2.9);
      cyl(sj, GUN_L, brace, lerpV(top, foot, 0.45), 0.28, 0.28, 5);
      cyl(sj, GUN_D, lerpV(brace, lerpV(top, foot, 0.45), 0.5), lerpV(top, foot, 0.22), 0.16, 0.16, 4);
      turn(
        fj,
        GUN_D,
        [
          [0, 0],
          [2.15, 0],
          [2.3, 0.4],
          [1.6, 0.9],
          [0.7, 1.2],
          [0, 1.2],
        ],
        [foot.x, 0, foot.z],
        [0, 1, 0],
        6,
      );
      cyl(fj, HAZ, [foot.x, 0.36, foot.z], [foot.x, 0.56, foot.z], 2.2, 2.12, 6);
      cyl(fj, GUN, [foot.x, 1.1, foot.z], [foot.x, 1.7, foot.z], 0.7, 0.62, 6);
      // bay doors standing open beside the strut
      for (const e of [-1, 1]) {
        const dz = z + e * 1.8;
        const q = [
          v(s * (sx - 1.3), yk - 0.4, dz),
          v(s * (sx + 1.3), yk - 0.4, dz),
          v(s * (sx + 1.1), yk - 2.8, dz),
          v(s * (sx - 1.1), yk - 2.8, dz),
        ];
        prism(
          hull,
          HULL_D,
          q,
          q.map((p) => p.clone().add(v(0, 0, e * 0.18))),
        );
        box(hull, HAZ, [2.0, 0.3, 0.22], v(s * sx, yk - 2.65, dz + e * 0.09));
      }
      glowBox(fj, AMBER, [0.4, 0.4, 0.4], [foot.x, 1.85, foot.z], 1.4, `strutLamp${id}`);
    }
  });

  // ---------------------------------------------------------------- flush batches
  for (const slot of pending.values()) {
    const merged = mergeGeometries(slot.geos);
    if (!merged) throw new Error(`merge failed for ${slot.bone.name} ${slot.color}`);
    const name = `${slot.bone.name}.${slot.color === HAZ ? "hazard" : slot.color.slice(1)}`;
    b.part(merged, slot.color === HAZ ? hazard : slot.color, { bone: slot.bone, at: [0, 0, 0], flat: true, name });
  }
  for (const [name, d] of decals) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(d.pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(d.uv, 2));
    g.computeVertexNormals();
    const p = b.part(g, d.tint, { bone: d.bone, at: [0, 0, 0], texture: d.tex, name: `decal.${name}` });
    if (d.glow > 0) glow(p, d.glow);
  }
  return b.root;
}
