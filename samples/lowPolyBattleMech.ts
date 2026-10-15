import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../kits/glow";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { vec } from "../src/math";
import type { V3 } from "../src/math";
import { paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { catmull } from "../src/path";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";

export const meta = {
  name: "Bulwark Battle Mech",
  description:
    "A 9 m reverse-jointed battle mech in flat-colour low-poly: armoured cockpit with a lit visor, rotary cannon and missile-pod shield arm, back reactor with glowing vents and exhaust stacks, pistons, hydraulic lines, squad numbers, insignia, hazard stripes and bolted field patches, on a full game rig.",
};

type Vec = THREE.Vector3;
type Ring = readonly [number, number, number, number, number?, number?];
type Face = { q: Vec[]; n: Vec };

// Palette: five hue families with shadow / base / highlight, one hazard accent, and the glows.
const BLU_D = "#22405a";
const BLU = "#34628a";
const BLU_L = "#5689b0";
const IVO_D = "#b1a68a";
const IVO = "#ddd3b4";
const IVO_L = "#f2ecd8";
const GUN_D = "#1b1f25";
const GUN = "#2e343c";
const GUN_L = "#4a525b";
const STL_D = "#69727a";
const STL = "#98a1a7";
const STL_L = "#c9d0d3";
const ORG = "#ef9a27";
const HAZ = "#ffc93c";
const RED_D = "#8a2420";
const RED = "#c8392d";
const OLV_D = "#4b5030";
const OLV = "#6d7343";
const OLV_L = "#8f9660";
const RUB = "#15161a";
const GLASS = "#163640";
const GLASS_L = "#3f8794";
const BRASS = "#c99a3e";
const CYAN = "#79f2ff";
const AMBER = "#ffd571";
const HOT = "#ff7a2e";
const LAMP_RED = "#ff3d33";

const SIDES = [
  [1, "L"],
  [-1, "R"],
] as const;

const UP = new THREE.Vector3(0, 1, 0);
const XA = new THREE.Vector3(1, 0, 0);

/** A local frame for laying out geometry in model space: +y along `y`, +z toward `zHint`, +x toward world x sign `xToward`. */
class F {
  readonly o: Vec;
  readonly X: Vec;
  readonly Y: Vec;
  readonly Z: Vec;
  constructor(o: V3, y: V3, zHint: V3, xToward = 1) {
    this.o = vec(o);
    this.Y = vec(y).normalize();
    const zh = vec(zHint);
    this.Z = zh.sub(this.Y.clone().multiplyScalar(zh.dot(this.Y))).normalize();
    this.X = new THREE.Vector3().crossVectors(this.Y, this.Z);
    if (this.X.x * xToward < 0) this.X.negate();
  }
  p(x: number, y: number, z: number) {
    return this.o.clone().addScaledVector(this.X, x).addScaledVector(this.Y, y).addScaledVector(this.Z, z);
  }
  d(x: number, y: number, z: number) {
    return new THREE.Vector3()
      .addScaledVector(this.X, x)
      .addScaledVector(this.Y, y)
      .addScaledVector(this.Z, z)
      .normalize();
  }
}

function oct(f: F, y: number, hw: number, zp: number, zn: number, ch = 0, cx = 0): Vec[] {
  if (ch <= 0) return [f.p(cx - hw, y, zp), f.p(cx + hw, y, zp), f.p(cx + hw, y, zn), f.p(cx - hw, y, zn)];
  return [
    f.p(cx - hw + ch, y, zp),
    f.p(cx + hw - ch, y, zp),
    f.p(cx + hw, y, zp - ch),
    f.p(cx + hw, y, zn + ch),
    f.p(cx + hw - ch, y, zn),
    f.p(cx - hw + ch, y, zn),
    f.p(cx - hw, y, zn + ch),
    f.p(cx - hw, y, zp - ch),
  ];
}

function loftPts(f: F, rings: readonly Ring[]) {
  return rings.flatMap(([y, hw, zp, zn, ch = 0, cx = 0]) => oct(f, y, hw, zp, zn, ch, cx));
}

function boxPts(f: F, c: readonly number[], s: readonly number[], ch = 0): Vec[] {
  const [cx, cy, cz] = c;
  const hw = s[0] / 2;
  const hh = s[1] / 2;
  const hd = s[2] / 2;
  const pts: Vec[] = [];
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1]) {
        if (ch <= 0) {
          pts.push(f.p(cx + sx * hw, cy + sy * hh, cz + sz * hd));
          continue;
        }
        pts.push(f.p(cx + sx * hw, cy + sy * (hh - ch), cz + sz * (hd - ch)));
        pts.push(f.p(cx + sx * (hw - ch), cy + sy * hh, cz + sz * (hd - ch)));
        pts.push(f.p(cx + sx * (hw - ch), cy + sy * (hh - ch), cz + sz * hd));
      }
  return pts;
}

function prismPts(c: Vec, axis: Vec, r: number, len: number, n: number, r1 = r, spin = 0): Vec[] {
  const a = axis.clone().normalize();
  const ref = Math.abs(a.y) < 0.9 ? UP : XA;
  const u = ref.clone().addScaledVector(a, -ref.dot(a)).normalize();
  const w = new THREE.Vector3().crossVectors(a, u);
  const pts: Vec[] = [];
  for (const [end, rr] of [
    [-len / 2, r],
    [len / 2, r1],
  ]) {
    if (rr <= 1e-4) {
      pts.push(c.clone().addScaledVector(a, end));
      continue;
    }
    for (let i = 0; i < n; i++) {
      const ang = spin + Math.PI / n + (i * 2 * Math.PI) / n;
      pts.push(
        c
          .clone()
          .addScaledVector(a, end)
          .addScaledVector(u, Math.cos(ang) * rr)
          .addScaledVector(w, Math.sin(ang) * rr),
      );
    }
  }
  return pts;
}

function rodPts(a: Vec, b: Vec, r: number, n: number, r1 = r, spin = 0) {
  const d = b.clone().sub(a);
  return prismPts(a.clone().lerp(b, 0.5), d, r, d.length(), n, r1, spin);
}

function domePts(c: Vec, axis: Vec, r: number, n: number, h = r) {
  const a = axis.clone().normalize();
  const pts = prismPts(c, a, r, 0.0001, n);
  const mid = prismPts(c.clone().addScaledVector(a, h * 0.62), a, r * 0.78, 0.0001, n, r * 0.78, Math.PI / n);
  return [...pts, ...mid, c.clone().addScaledVector(a, h)];
}

function faceOf(q: Vec[], out: Vec): Face {
  const n = new THREE.Vector3()
    .subVectors(q[1], q[0])
    .cross(new THREE.Vector3().subVectors(q[q.length - 1], q[0]))
    .normalize();
  if (n.dot(out) < 0) n.negate();
  return { q, n };
}

/** Bilinear point on a quad face: u runs q0 → q1, v runs q0 → q3. */
function fpt(f: Face, u: number, v: number, lift = 0) {
  const top = f.q[0].clone().lerp(f.q[1], u);
  const bot = f.q[3].clone().lerp(f.q[2], u);
  return top.lerp(bot, v).addScaledVector(f.n, lift);
}

function subFace(f: Face, u0: number, v0: number, u1: number, v1: number, lift = 0): Face {
  return {
    q: [fpt(f, u0, v0, lift), fpt(f, u1, v0, lift), fpt(f, u1, v1, lift), fpt(f, u0, v1, lift)],
    n: f.n.clone(),
  };
}

/** A plate: the polygon `q` pushed out along `n` by `t`, its top inset by `bev` (a chamfered rim). */
function slabPts(q: Vec[], n: Vec, t: number, bev = 0): { pts: Vec[]; top: Vec[] } {
  const base = q.map((p) => p.clone().addScaledVector(n, -0.012));
  const top = q.map((p, i) => {
    const prev = q[(i + q.length - 1) % q.length];
    const next = q[(i + 1) % q.length];
    const o = p.clone().addScaledVector(n, t);
    if (bev > 0) {
      o.addScaledVector(next.clone().sub(p).normalize(), bev);
      o.addScaledVector(prev.clone().sub(p).normalize(), bev);
    }
    return o;
  });
  return { pts: [...base, ...top], top };
}

function hazardPaint(size: number) {
  return paint((p) => (((Math.floor((p.x + p.y + p.z) / size) % 2) + 2) % 2 === 0 ? HAZ : GUN_D));
}

function star(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(2)},${(cy + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(" ")}"/>`;
}

function textures() {
  const num = (fill: string, stroke: string) =>
    svg(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70"><g fill="${fill}" stroke="${stroke}" stroke-width="3.5" stroke-linejoin="miter">` +
        `<path d="M14 6H23V17H17V53H23V64H14L6 56V14Z"/><path d="M27 6H36L44 14V56L36 64H27V53H33V17H27Z"/>` +
        `<path d="M53 6H94V17L77 64H64L80 17H53Z"/></g></svg>`,
      { size: 256 },
    );
  const insignia = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">` +
      `<path d="M5 5H95V62L76 99L50 117L24 99L5 62Z" fill="${GUN_D}"/>` +
      `<path d="M12 12H88V60L70 93L50 108L30 93L12 60Z" fill="${ORG}"/>` +
      `<path d="M12 12H88V35H12Z" fill="${BLU}"/>` +
      `<g fill="${IVO_L}">${star(31, 23.5, 7)}${star(50, 23.5, 7)}${star(69, 23.5, 7)}</g>` +
      `<path d="M30 42H37V48H43V42H57V48H63V42H70V55H66V92H34V55H30Z" fill="${GUN_D}"/>` +
      `<path d="M45 92V78L50 73L55 78V92Z" fill="${ORG}"/><path d="M47 58H53V67H47Z" fill="${ORG}"/>` +
      `</svg>`,
    { size: 256 },
  );
  const warn = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 58"><path d="M32 2L62 56H2Z" fill="${GUN_D}"/>` +
      `<path d="M32 12L53 50H11Z" fill="${HAZ}"/><path d="M36 17L24 36H31L27 48L41 28H34L38 17Z" fill="${GUN_D}"/></svg>`,
    { size: 128 },
  );
  const kills = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 28"><g fill="${IVO_L}" stroke="${GUN_D}" stroke-width="2.5">` +
      [0, 1, 2, 3, 4].map((i) => star(14 + i * 26, 15, 11.5)).join("") +
      `</g></svg>`,
    { size: 256 },
  );
  const chevrons = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 40"><g fill="${HAZ}" stroke="${GUN_D}" stroke-width="2.5">` +
      [0, 1, 2]
        .map(
          (i) =>
            `<path d="M${4 + i * 28} 4H${16 + i * 28}L${30 + i * 28} 20L${16 + i * 28} 36H${4 + i * 28}L${18 + i * 28} 20Z"/>`,
        )
        .join("") +
      `</g></svg>`,
    { size: 192 },
  );
  return { numDark: num(BLU_D, IVO_L), numOrange: num(ORG, GUN_D), insignia, warn, kills, chevrons };
}

export default function build() {
  const b = createBuilder({ name: "lowPolyBattleMech" });
  const TX = textures();
  const HAZARD = hazardPaint(0.16);

  // ---------------------------------------------------------------------------------------------------------------
  // Geometry bins: every faceted solid is a convex hull in model space; static pieces on one bone and colour merge.
  type Bin = { bone: Joint; color: Fill; geos: THREE.BufferGeometry[]; glow: number; name: string };
  const bins = new Map<string, Bin>();
  const paintNames = new Map<Paint, string>();
  function solid(bone: Joint, color: Fill, pts: Vec[], glowStrength = 0) {
    let label: string;
    if (typeof color === "string") label = color.slice(1);
    else {
      if (!paintNames.has(color)) paintNames.set(color, `paint${paintNames.size}`);
      label = paintNames.get(color)!;
    }
    const key = `${bone.name}_${label}${glowStrength ? "_glow" : ""}`;
    let bin = bins.get(key);
    if (!bin) {
      bin = { bone, color, geos: [], glow: glowStrength, name: key };
      bins.set(key, bin);
    }
    bin.geos.push(new ConvexGeometry(pts));
  }
  const plate = (
    bone: Joint,
    color: Fill,
    f: Face,
    u0: number,
    v0: number,
    u1: number,
    v1: number,
    t: number,
    bev = t * 0.45,
    lift = 0,
    g = 0,
  ): Face => {
    const s = subFace(f, u0, v0, u1, v1, lift);
    const { pts, top } = slabPts(s.q, f.n, t, bev);
    solid(bone, color, pts, g);
    return { q: top, n: f.n.clone() };
  };
  const polyPlate = (bone: Joint, color: Fill, q: Vec[], n: Vec, t: number, bev = t * 0.45, g = 0): Face => {
    const { pts, top } = slabPts(q, n, t, bev);
    solid(bone, color, pts, g);
    return { q: top, n: n.clone() };
  };
  const bolt = (bone: Joint, color: Fill, at: Vec, n: Vec, r = 0.04, h = 0.035, sides = 6) =>
    solid(bone, color, prismPts(at.clone().addScaledVector(n, h / 2 - 0.012), n, r, h + 0.012, sides, r * 0.75));
  const boltRow = (
    bone: Joint,
    f: Face,
    u0: number,
    v0: number,
    u1: number,
    v1: number,
    count: number,
    r = 0.035,
    color: Fill = STL,
  ) => {
    for (let i = 0; i < count; i++) {
      const k = count === 1 ? 0.5 : i / (count - 1);
      bolt(bone, color, fpt(f, u0 + (u1 - u0) * k, v0 + (v1 - v0) * k), f.n, r);
    }
  };
  const boltCorners = (bone: Joint, f: Face, inset = 0.08, r = 0.035, color: Fill = STL) => {
    for (const [u, v] of [
      [inset, inset],
      [1 - inset, inset],
      [1 - inset, 1 - inset],
      [inset, 1 - inset],
    ])
      bolt(bone, color, fpt(f, u, v), f.n, r);
  };
  const decal = (
    tex: THREE.Texture,
    bone: Joint,
    f: Face,
    u: number,
    v: number,
    w: number,
    h: number,
    name: string,
    lift = 0.012,
  ) => {
    const at = fpt(f, u, v, lift);
    const up = fpt(f, u, 0).sub(fpt(f, u, 1));
    up.addScaledVector(f.n, -up.dot(f.n)).normalize();
    return b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { bone, at, dir: f.n, up, axis: "z", texture: tex, name });
  };
  const hose = (pts: Vec[], r: number, color: string, bones: Joint | Joint[], name: string) => {
    b.sweep(catmull(pts), r, { color, section: { ngon: 6 }, bone: bones, caps: "flat", name });
    const first = Array.isArray(bones) ? bones[0] : bones;
    const last = Array.isArray(bones) ? bones[bones.length - 1] : bones;
    const d0 = pts[1].clone().sub(pts[0]).normalize();
    const d1 = pts[pts.length - 1]
      .clone()
      .sub(pts[pts.length - 2])
      .normalize();
    solid(first, STL, prismPts(pts[0].clone().addScaledVector(d0, 0.03), d0, r * 1.55, 0.1, 6));
    solid(last, STL, prismPts(pts[pts.length - 1].clone().addScaledVector(d1, -0.03), d1, r * 1.55, 0.1, 6));
  };
  const piston = (boneA: Joint, a: Vec, boneB: Joint, bp: Vec, r: number, hinge: Vec) => {
    const d = bp.clone().sub(a);
    const L = d.length();
    const u = d.clone().normalize();
    const at = (k: number) => a.clone().addScaledVector(u, k * L);
    solid(boneA, GUN_L, rodPts(at(0.08), at(0.6), r, 6));
    solid(boneA, GUN_D, rodPts(at(0.54), at(0.63), r * 1.22, 6));
    solid(boneA, GUN_D, rodPts(at(0.12), at(0.18), r * 1.15, 6));
    solid(boneB, STL_L, rodPts(at(0.4), at(0.92), r * 0.55, 6));
    solid(boneB, GUN, rodPts(at(0.9), bp, r * 0.8, 6));
    solid(boneA, GUN, prismPts(a, hinge, r * 1.25, r * 1.8, 6));
    solid(boneB, GUN, prismPts(bp, hinge, r * 1.0, r * 1.8, 6));
    solid(boneA, STL, prismPts(a, hinge, r * 0.5, r * 2.3, 6));
    solid(boneB, STL, prismPts(bp, hinge, r * 0.45, r * 2.3, 6));
  };

  const W = new F([0, 0, 0], [0, 1, 0], [0, 0, 1], 1);

  // ---------------------------------------------------------------------------------------------------------------
  // Skeleton: pelvis root, waist twist, chest, cockpit head, then arms and reverse-jointed legs with toes.
  const hips = b.joint("hips", { at: [0, 5.35, -0.1], dir: [0, 1, 0], role: "spine", group: "pelvis" });
  const waist = b.joint("waist", { parent: hips, at: [0, 5.8, -0.1], dir: [0, 1, 0], role: "spine", group: "torso" });
  const chest = b.joint("chest", { parent: waist, at: [0, 6.5, -0.1], dir: [0, 1, 0], role: "spine", group: "torso" });
  const cockpit = b.joint("cockpit", {
    parent: chest,
    at: [0, 7.4, 0.55],
    dir: [0, 0, 1],
    role: "head",
    group: "head",
  });
  const CK = new F([0, 7.45, 0], [0, 0, 1], [0, 1, 0], 1); // y forward, z up
  const slope = (v: number) => 0.55 - 0.585 * (v - 1.0); // cockpit roof height along the canopy slope
  const canopy = b.joint("canopy", {
    parent: cockpit,
    at: CK.p(0, 1.02, slope(1.02) + 0.02),
    aim: CK.p(0, 1.9, slope(1.9) + 0.02),
    role: "hinge",
    group: "head",
  });
  const hatch = b.joint("hatch", {
    parent: chest,
    at: [0.62, 8.1, -0.62],
    aim: [0.62, 8.1, -0.1],
    role: "hinge",
    group: "torso",
  });

  const legs = SIDES.map(([s, side]) => {
    const H = new THREE.Vector3(s * 1.38, 5.3, -0.12);
    const K = new THREE.Vector3(s * 1.5, 3.92, 0.88);
    const C = new THREE.Vector3(s * 1.58, 2.05, -0.78);
    const A = new THREE.Vector3(s * 1.6, 0.98, -0.08);
    const chain = b.chain(`leg${side}`, [H, K, C, A], {
      parent: hips,
      names: [`hip${side}`, `knee${side}`, `hock${side}`, `ankle${side}`],
      role: "leg",
      group: `leg${side}`,
      contact: [s * 1.6, 0, 0.2],
    });
    const [hip, knee, hock, ankle] = chain.joints;
    const FT = new F(A, [0, 0, 1], [0, 1, 0], s);
    const toes = [-0.36, 0, 0.36].map((dx, i) => {
      const at = FT.p(dx, 0.5, -0.6);
      const dir = FT.d(dx * 0.4, 1, 0);
      return b.joint(`toe${side}${i + 1}`, { parent: ankle, at, dir, role: "digit", group: `leg${side}` });
    });
    const heel = b.joint(`heel${side}`, {
      parent: ankle,
      at: FT.p(0, -0.5, -0.6),
      dir: FT.d(0, -1, 0),
      role: "digit",
      group: `leg${side}`,
    });
    return { s, side, H, K, C, A, hip, knee, hock, ankle, toes, heel, FT };
  });

  const arms = SIDES.map(([s, side]) => {
    const S = new THREE.Vector3(s * 2.2, 7.4, -0.05);
    const E = new THREE.Vector3(s * 2.88, 6.12, 0.12);
    const Wr = new THREE.Vector3(s * 3.06, 5.95, 1.45);
    const chain = b.chain(`arm${side}`, [S, E, Wr], {
      parent: chest,
      names: [`shoulder${side}`, `elbow${side}`, `wrist${side}`],
      role: "arm",
      group: `arm${side}`,
    });
    const [shoulder, elbow, wrist] = chain.joints;
    return { s, side, S, E, Wr, shoulder, elbow, wrist };
  });

  const antennas = SIDES.map(([s, side]) =>
    b.joint(`antenna${side}`, { parent: chest, at: [s * 1.0, 8.1, -0.82], dir: [s * 0.08, 1, -0.12], group: "torso" }),
  );
  const lamps = SIDES.map(([s, side]) =>
    b.joint(`lamp${side}`, { parent: cockpit, at: CK.p(s * 0.56, 1.86, -0.62), dir: [0, 0, 1], group: "head" }),
  );

  // ---------------------------------------------------------------------------------------------------------------
  // Pelvis: gunmetal block, hip actuators, armoured codpiece and side tassets.
  solid(
    hips,
    GUN,
    loftPts(W, [
      [4.92, 0.8, 0.5, -0.75, 0.25],
      [5.3, 1.05, 0.62, -0.88, 0.32],
      [5.75, 0.92, 0.52, -0.78, 0.3],
    ]),
  );
  solid(
    hips,
    GUN_D,
    loftPts(W, [
      [4.84, 0.5, 0.25, -0.5, 0.15],
      [4.95, 0.62, 0.35, -0.6, 0.18],
    ]),
  );
  {
    const q = [
      new THREE.Vector3(-0.5, 5.72, 0.66),
      new THREE.Vector3(0.5, 5.72, 0.66),
      new THREE.Vector3(0.36, 5.0, 0.6),
      new THREE.Vector3(0, 4.82, 0.56),
      new THREE.Vector3(-0.36, 5.0, 0.6),
    ];
    const n = new THREE.Vector3(0, 0.08, 1).normalize();
    solid(hips, BLU, slabPts(q, n, 0.14, 0.04).pts);
    const quad = faceOf([q[0], q[1], q[2], q[4]], n);
    const top = plate(hips, IVO, quad, 0.08, 0.06, 0.92, 0.62, 0.06, 0.03, 0.14);
    plate(hips, HAZARD, quad, 0.14, 0.7, 0.86, 0.92, 0.04, 0.015, 0.14);
    boltCorners(hips, top, 0.1, 0.03);
  }
  // rear skirt
  solid(
    hips,
    BLU_D,
    slabPts(
      [
        new THREE.Vector3(-0.7, 5.7, -0.9),
        new THREE.Vector3(0.7, 5.7, -0.9),
        new THREE.Vector3(0.5, 5.0, -0.84),
        new THREE.Vector3(-0.5, 5.0, -0.84),
      ],
      new THREE.Vector3(0, 0.05, -1).normalize(),
      0.12,
      0.04,
    ).pts,
  );
  {
    const rf = faceOf(
      [
        new THREE.Vector3(0.6, 5.66, -1.02),
        new THREE.Vector3(-0.6, 5.66, -1.02),
        new THREE.Vector3(-0.42, 5.04, -0.96),
        new THREE.Vector3(0.42, 5.04, -0.96),
      ],
      new THREE.Vector3(0, 0, -1),
    );
    const rp = plate(hips, IVO, rf, 0.08, 0.1, 0.92, 0.7, 0.05, 0.02);
    boltCorners(hips, faceOf(rp.q, rf.n), 0.1, 0.028);
    for (const u of [0.12, 0.88])
      solid(hips, LAMP_RED, boxPts(W, [u > 0.5 ? -0.48 : 0.48, 5.18, -1.0], [0.12, 0.08, 0.06], 0.015), 2.5);
    // umbilical hoses from the torso into the pelvis
    for (const x of [-0.3, 0, 0.3])
      hose(
        [
          new THREE.Vector3(x, 6.32, -0.86),
          new THREE.Vector3(x * 1.1, 6.05, -1.02),
          new THREE.Vector3(x * 1.1, 5.78, -1.0),
          new THREE.Vector3(x, 5.6, -0.86),
        ],
        0.05,
        x === 0 ? RED_D : RUB,
        [hips, waist, chest],
        `umbilical${Math.round(x * 10) + 3}`,
      );
  }
  for (const { s } of legs) {
    // inner hip actuator housing on the pelvis
    solid(hips, GUN_L, prismPts(new THREE.Vector3(s * 1.0, 5.3, -0.12), XA, 0.56, 0.26, 8));
    solid(hips, STL, prismPts(new THREE.Vector3(s * 1.0, 5.3, -0.12), XA, 0.6, 0.08, 8));
    // tasset: an angled armour plate over the hip, ivory trim and bolts
    const P = new F([s * 1.0, 5.75, -0.12], [0, 1, 0], [0, 0, 1], s);
    const q = [P.p(0.15, 0.12, 0.62), P.p(0.15, 0.12, -0.7), P.p(0.72, -0.55, -0.62), P.p(0.72, -0.55, 0.55)];
    const out = P.d(1, 1.2, 0);
    const tf = polyPlate(hips, BLU, q, out, 0.12, 0.04);
    const tq = faceOf(tf.q, out);
    plate(hips, IVO, tq, 0.0, 0.72, 1, 0.98, 0.05, 0.02);
    boltRow(hips, tq, 0.08, 0.55, 0.92, 0.55, 5, 0.03);
  }
  // waist bearing
  solid(waist, GUN_L, prismPts(new THREE.Vector3(0, 5.78, -0.12), UP, 0.82, 0.22, 10));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.PI / 10;
    const p = new THREE.Vector3(Math.cos(a) * 0.86, 5.78, -0.12 + Math.sin(a) * 0.86);
    bolt(waist, STL, p, new THREE.Vector3(Math.cos(a), 0, Math.sin(a)), 0.035);
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Torso: a chamfered armoured hull, chest plates, belly grille, shoulder housings, top hatch and sensors.
  solid(
    chest,
    GUN,
    loftPts(W, [
      [5.86, 0.8, 0.48, -0.74, 0.25],
      [6.4, 1.12, 0.78, -0.98, 0.3],
    ]),
  );
  solid(
    chest,
    BLU,
    loftPts(W, [
      [6.3, 1.2, 0.8, -1.0, 0.35],
      [6.9, 1.52, 1.12, -1.25, 0.42],
      [7.6, 1.52, 1.0, -1.25, 0.42],
      [8.02, 1.3, 0.72, -1.05, 0.32],
    ]),
  );
  solid(
    chest,
    BLU_L,
    loftPts(W, [
      [7.99, 1.2, 0.66, -0.98, 0.28],
      [8.08, 1.1, 0.58, -0.9, 0.24],
    ]),
  );
  // lower hull band: darker underside step
  solid(
    chest,
    BLU_D,
    loftPts(W, [
      [6.22, 1.1, 0.74, -0.94, 0.3],
      [6.42, 1.26, 0.86, -1.06, 0.36],
    ]),
  );
  // chest plates beside the cockpit
  const chestFaces = SIDES.map(([s]) => {
    const fq = [
      new THREE.Vector3(s * 0.92, 7.78, 1.16),
      new THREE.Vector3(s * 1.4, 7.78, 1.0),
      new THREE.Vector3(s * 1.46, 6.8, 1.14),
      new THREE.Vector3(s * 0.92, 6.68, 1.3),
    ];
    const back = fq.map((p) => new THREE.Vector3(p.x * 1.06, p.y, 0.55));
    solid(chest, IVO, [...fq, ...back]);
    const f = faceOf(fq, new THREE.Vector3(0, 0.1, 1));
    // a light top trim and a dark inset at the bottom fake the light
    plate(chest, IVO_L, f, 0.0, 0.0, 1, 0.1, 0.04, 0.015);
    plate(chest, IVO_D, f, 0.06, 0.82, 0.94, 0.95, 0.03, 0.01);
    boltRow(chest, f, 0.08, 0.17, 0.92, 0.17, 4, 0.03);
    return f;
  });
  decal(TX.insignia, chest, chestFaces[0], 0.63, 0.47, 0.34, 0.41, "insigniaChest");
  decal(TX.numDark, chest, chestFaces[1], 0.68, 0.47, 0.38, 0.27, "number07Chest");
  // belly grille under the cockpit
  {
    const f = faceOf(
      [
        new THREE.Vector3(-0.72, 6.86, 1.1),
        new THREE.Vector3(0.72, 6.86, 1.1),
        new THREE.Vector3(0.62, 6.38, 0.84),
        new THREE.Vector3(-0.62, 6.38, 0.84),
      ],
      new THREE.Vector3(0, -0.4, 1),
    );
    const rec = plate(chest, GUN_D, f, 0.04, 0.08, 0.96, 0.92, 0.03, 0.0, 0.0);
    const rf = faceOf(rec.q, f.n);
    for (let i = 0; i < 5; i++) plate(chest, GUN_L, rf, 0.04, 0.08 + i * 0.18, 0.96, 0.16 + i * 0.18, 0.07, 0.02);
    for (const s of [-1, 1]) bolt(chest, STL, fpt(f, s > 0 ? 0.985 : 0.015, 0.5), f.n, 0.03);
  }
  // hazard lip along the lower front
  solid(
    chest,
    HAZARD,
    loftPts(W, [
      [6.24, 0.95, 0.88, 0.62, 0.0],
      [6.34, 1.0, 0.92, 0.62, 0.0],
    ]),
  );
  // shoulder housings
  for (const { s } of arms) {
    const c = new THREE.Vector3(s * 1.7, 7.4, -0.05);
    solid(chest, GUN, prismPts(c, XA, 0.58, 0.62, 8));
    solid(chest, GUN_L, prismPts(new THREE.Vector3(s * 1.92, 7.4, -0.05), XA, 0.64, 0.1, 8));
    solid(chest, BLU_D, prismPts(new THREE.Vector3(s * 1.6, 7.4, -0.05), XA, 0.62, 0.16, 8));
    // side armour panel below the housing
    const f = faceOf(
      [
        new THREE.Vector3(s * 1.52, 6.88, 0.62),
        new THREE.Vector3(s * 1.52, 6.88, -0.78),
        new THREE.Vector3(s * 1.2, 6.32, -0.6),
        new THREE.Vector3(s * 1.2, 6.32, 0.42),
      ],
      new THREE.Vector3(s, -0.6, 0),
    );
    if (s > 0) {
      for (let i = 0; i < 4; i++) plate(chest, GUN_D, f, 0.12 + i * 0.2, 0.2, 0.2 + i * 0.2, 0.8, 0.03, 0.01);
    } else {
      // bolted field patch
      const pf = plate(chest, OLV, f, 0.18, 0.12, 0.72, 0.88, 0.05, 0.015);
      const pq = faceOf(pf.q, f.n);
      boltCorners(chest, pq, 0.1, 0.03, OLV_L);
      boltRow(chest, pq, 0.5, 0.1, 0.5, 0.9, 3, 0.028, OLV_L);
      plate(chest, OLV_D, pq, 0.15, 0.4, 0.85, 0.6, 0.02, 0.006);
    }
  }
  // top hatch, sensor dome
  solid(chest, GUN_D, prismPts(new THREE.Vector3(0.62, 8.08, -0.38), UP, 0.36, 0.06, 6));
  solid(hatch, BLU_L, prismPts(new THREE.Vector3(0.62, 8.13, -0.38), UP, 0.33, 0.08, 6, 0.29));
  solid(hatch, STL, rodPts(new THREE.Vector3(0.52, 8.2, -0.25), new THREE.Vector3(0.72, 8.2, -0.25), 0.025, 4));
  solid(hatch, STL, rodPts(new THREE.Vector3(0.52, 8.16, -0.25), new THREE.Vector3(0.52, 8.2, -0.25), 0.02, 4));
  solid(hatch, STL, rodPts(new THREE.Vector3(0.72, 8.16, -0.25), new THREE.Vector3(0.72, 8.2, -0.25), 0.02, 4));
  solid(chest, GUN_L, rodPts(new THREE.Vector3(0.38, 8.11, -0.66), new THREE.Vector3(0.86, 8.11, -0.66), 0.05, 6));
  solid(chest, GUN_L, prismPts(new THREE.Vector3(-0.55, 8.12, -0.35), UP, 0.3, 0.1, 6));
  solid(chest, IVO, domePts(new THREE.Vector3(-0.55, 8.16, -0.35), UP, 0.26, 6, 0.22));
  solid(chest, GUN_D, prismPts(new THREE.Vector3(-0.55, 8.3, -0.12), new THREE.Vector3(0, 0.4, 1), 0.07, 0.08, 6));
  for (const s of [-1, 1]) {
    solid(chest, GUN_D, boxPts(W, [s * 0.78, 8.09, 0.12], [0.46, 0.04, 0.5], 0.0));
    for (let i = 0; i < 4; i++)
      solid(chest, GUN_L, boxPts(W, [s * 0.78, 8.11, -0.06 + i * 0.12], [0.42, 0.05, 0.05], 0.0));
    solid(chest, BLU_D, boxPts(W, [s * 0.22, 8.09, -0.3], [0.05, 0.03, 1.1], 0.0));
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Cockpit: faceted armoured nose, slanted canopy on its own hinge, lit visor, cheek plates and searchlights.
  solid(
    cockpit,
    BLU,
    loftPts(CK, [
      [0.3, 0.82, 0.5, -0.5, 0.22],
      [1.0, 0.86, 0.55, -0.56, 0.25],
      [1.95, 0.74, slope(1.95), -0.52, 0.2],
      [2.05, 0.66, slope(1.95) - 0.06, -0.46, 0.14],
    ]),
  );
  solid(
    cockpit,
    BLU_D,
    loftPts(CK, [
      [0.4, 0.7, -0.4, -0.66, 0.15],
      [1.85, 0.6, -0.4, -0.62, 0.15],
    ]),
  );
  // canopy glass and frame (rides the canopy hinge)
  {
    const n = CK.d(0, 0.585, 1);
    const q = [
      CK.p(-0.57, 1.06, slope(1.06)),
      CK.p(0.57, 1.06, slope(1.06)),
      CK.p(0.49, 1.9, slope(1.9)),
      CK.p(-0.49, 1.9, slope(1.9)),
    ];
    const f = faceOf(q, n);
    plate(canopy, GUN_D, f, 0, 0, 1, 1, 0.05, 0.0, 0.0);
    const g = faceOf(subFace(f, 0, 0, 1, 1, 0.05).q, n);
    plate(canopy, GLASS, g, 0.05, 0.08, 0.47, 0.92, 0.04, 0.01);
    plate(canopy, GLASS, g, 0.53, 0.08, 0.95, 0.92, 0.04, 0.01);
    // flat reflection shards
    const shard = (u: number) =>
      polyPlate(
        canopy,
        GLASS_L,
        [
          fpt(g, u, 0.14, 0.04),
          fpt(g, u + 0.08, 0.14, 0.04),
          fpt(g, u - 0.06, 0.86, 0.04),
          fpt(g, u - 0.14, 0.86, 0.04),
        ],
        n,
        0.012,
        0,
      );
    shard(0.32);
    shard(0.42);
    shard(0.82);
    plate(canopy, GUN, g, 0.47, 0.0, 0.53, 1, 0.07, 0.015);
    plate(canopy, GUN, g, 0.0, 0.0, 1, 0.08, 0.07, 0.015);
    plate(canopy, GUN, g, 0.0, 0.92, 1, 1, 0.07, 0.015);
    boltRow(canopy, faceOf(subFace(g, 0, 0, 1, 1, 0.07).q, n), 0.08, 0.04, 0.92, 0.04, 6, 0.022);
  }
  // visor: dark slot with a segmented cyan glow strip under a brow
  {
    const f = faceOf(
      [
        CK.p(-0.52, 2.05, slope(1.95) - 0.06),
        CK.p(0.52, 2.05, slope(1.95) - 0.06),
        CK.p(0.52, 2.05, -0.46),
        CK.p(-0.52, 2.05, -0.46),
      ],
      CK.d(0, 1, 0),
    );
    const slot = plate(cockpit, RUB, f, 0.04, 0.12, 0.96, 0.55, 0.03, 0.0);
    const sf = faceOf(slot.q, f.n);
    for (const [u0, u1] of [
      [0.03, 0.31],
      [0.36, 0.64],
      [0.69, 0.97],
    ])
      plate(cockpit, CYAN, sf, u0, 0.22, u1, 0.78, 0.025, 0.006, 0, 2.2);
    plate(cockpit, GUN_L, f, 0.0, 0.0, 1, 0.12, 0.09, 0.03);
    // chin plate with hazard
    plate(cockpit, HAZARD, f, 0.15, 0.68, 0.85, 0.9, 0.04, 0.015);
  }
  // chin guns
  {
    const m = CK.p(0, 1.72, -0.68);
    solid(cockpit, GUN, boxPts(CK, [0, 1.72, -0.7], [0.42, 0.4, 0.18], 0.04));
    for (const s of [-1, 1]) {
      solid(cockpit, GUN_D, rodPts(CK.p(s * 0.1, 1.8, -0.72), CK.p(s * 0.1, 2.45, -0.72), 0.04, 6));
      solid(cockpit, STL, rodPts(CK.p(s * 0.1, 2.25, -0.72), CK.p(s * 0.1, 2.33, -0.72), 0.055, 6));
    }
    solid(cockpit, GUN_L, prismPts(m, CK.d(0, 0, 1), 0.16, 0.1, 6));
  }
  // cheek plates, grab rails, searchlights
  for (const [s] of SIDES) {
    const f = faceOf(
      [CK.p(s * 0.87, 0.42, 0.36), CK.p(s * 0.87, 1.62, 0.36), CK.p(s * 0.8, 1.86, -0.46), CK.p(s * 0.87, 0.42, -0.5)],
      new THREE.Vector3(s, 0, 0),
    );
    const cf = polyPlate(cockpit, IVO, f.q, f.n, 0.07, 0.025);
    const cq = faceOf(cf.q, f.n);
    plate(cockpit, BLU_D, cq, 0.05, 0.62, 0.7, 0.86, 0.025, 0.008);
    boltRow(cockpit, cq, 0.06, 0.08, 0.06, 0.92, 4, 0.025);
    decal(TX.warn, cockpit, cq, 0.86, 0.3, 0.17, 0.15, `warnCockpit${s > 0 ? "L" : "R"}`);
    // grab rail
    const a = CK.p(s * 0.96, 0.5, 0.25);
    const c = CK.p(s * 0.96, 1.15, 0.25);
    solid(cockpit, STL, rodPts(a, c, 0.025, 5));
    solid(cockpit, STL, rodPts(a, CK.p(s * 0.88, 0.5, 0.25), 0.022, 5));
    solid(cockpit, STL, rodPts(c, CK.p(s * 0.88, 1.15, 0.25), 0.022, 5));
    // cheek camera pod
    solid(cockpit, GUN, boxPts(CK, [s * 0.93, 1.38, 0.47], [0.14, 0.2, 0.12], 0.025));
    solid(cockpit, CYAN, prismPts(CK.p(s * 0.93, 1.49, 0.47), CK.d(0, 1, 0), 0.04, 0.02, 6), 2.0);
  }
  for (const [i, [s]] of SIDES.entries()) {
    const lamp = lamps[i];
    const L = new F(lamp.at, [0, 0, 1], [0, 1, 0], s);
    solid(cockpit, GUN, boxPts(CK, [s * 0.56, 1.68, -0.56], [0.16, 0.16, 0.16], 0.02));
    solid(lamp, GUN, rodPts(L.p(0, -0.18, 0), L.p(0, 0.16, 0), 0.15, 8, 0.17));
    solid(lamp, STL, rodPts(L.p(0, 0.14, 0), L.p(0, 0.2, 0), 0.185, 8));
    solid(lamp, AMBER, rodPts(L.p(0, 0.18, 0), L.p(0, 0.22, 0), 0.14, 8), 2.5);
    solid(lamp, GUN_D, boxPts(L, [0, 0.12, 0.2], [0.34, 0.24, 0.035], 0.0));
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Back reactor: housing with two glowing vent banks, a glowing core drum, exhaust stacks, fins and coolant lines.
  const RB = new F([0, 0, 0], [0, 1, 0], [0, 0, -1], 1); // z points back
  solid(chest, GUN, boxPts(W, [0, 7.08, -1.6], [2.1, 1.32, 0.8], 0.12));
  solid(chest, GUN_D, boxPts(W, [0, 6.44, -1.5], [1.7, 0.1, 0.6], 0.03));
  {
    const back = faceOf(
      [RB.p(-0.98, 7.66, 2.0), RB.p(0.98, 7.66, 2.0), RB.p(0.98, 6.5, 2.0), RB.p(-0.98, 6.5, 2.0)],
      new THREE.Vector3(0, 0, -1),
    );
    for (const [u0, u1] of [
      [0.05, 0.45],
      [0.55, 0.95],
    ]) {
      plate(chest, BLU_D, back, u0 - 0.02, 0.06, u1 + 0.02, 0.86, 0.04, 0.012);
      const glowF = plate(chest, CYAN, back, u0 + 0.02, 0.11, u1 - 0.02, 0.81, 0.045, 0.0, 0, 2.0);
      const gq = faceOf(glowF.q, back.n);
      for (let i = 0; i < 6; i++) plate(chest, GUN_L, gq, -0.03, 0.02 + i * 0.165, 1.03, 0.09 + i * 0.165, 0.06, 0.012);
    }
    plate(chest, HAZARD, back, 0.47, 0.06, 0.53, 0.86, 0.04, 0.01);
    plate(chest, BLU_D, back, 0.02, 0.9, 0.98, 0.98, 0.04, 0.015);
    boltRow(chest, back, 0.04, 0.94, 0.96, 0.94, 9, 0.03);
    for (const u of [0.06, 0.94]) {
      const p = fpt(back, u, 1.02, 0.0);
      solid(chest, GUN, boxPts(W, [p.x, p.y, p.z - 0.03], [0.22, 0.14, 0.08], 0.02));
      solid(chest, LAMP_RED, boxPts(W, [p.x, p.y, p.z - 0.08], [0.16, 0.08, 0.04], 0.01), 2.5);
    }
  }
  for (const [s] of SIDES) {
    const side = faceOf(
      [
        new THREE.Vector3(s * 1.05, 7.7, -1.25),
        new THREE.Vector3(s * 1.05, 7.7, -1.98),
        new THREE.Vector3(s * 1.05, 6.5, -1.98),
        new THREE.Vector3(s * 1.05, 6.5, -1.25),
      ],
      new THREE.Vector3(s, 0, 0),
    );
    plate(chest, BLU_D, side, 0.05, 0.05, 0.95, 0.12, 0.03, 0.01);
    if (s < 0) {
      // cooling fins and a warning plate on the right
      for (let i = 0; i < 5; i++)
        solid(chest, GUN_L, boxPts(W, [s * 1.1, 7.05, -1.32 - i * 0.13], [0.14, 1.0, 0.04], 0));
      decal(TX.warn, chest, subFace(side, 0, 0, 1, 1, 0.16), 0.5, 0.2, 0.2, 0.18, "warnReactor");
      continue;
    }
    // two strapped coolant cans on the left: field kit
    for (const z of [-1.47, -1.76]) {
      solid(chest, OLV, boxPts(W, [1.25, 6.95, z], [0.36, 0.62, 0.25], 0.04));
      solid(chest, OLV_D, boxPts(W, [1.25, 7.28, z], [0.3, 0.04, 0.2], 0.01));
      for (const dz of [-0.07, 0, 0.07]) solid(chest, OLV_D, boxPts(W, [1.22, 7.33, z + dz], [0.04, 0.08, 0.03], 0));
      solid(chest, OLV_D, boxPts(W, [1.22, 7.37, z], [0.04, 0.03, 0.18], 0));
      solid(chest, STL, prismPts(new THREE.Vector3(1.36, 7.3, z), UP, 0.04, 0.06, 6));
      const cf = faceOf(
        [
          new THREE.Vector3(1.43, 7.2, z + 0.1),
          new THREE.Vector3(1.43, 7.2, z - 0.1),
          new THREE.Vector3(1.43, 6.7, z - 0.1),
          new THREE.Vector3(1.43, 6.7, z + 0.1),
        ],
        XA,
      );
      polyPlate(
        chest,
        OLV_L,
        [fpt(cf, 0.05, 0.08), fpt(cf, 0.25, 0.08), fpt(cf, 0.95, 0.92), fpt(cf, 0.75, 0.92)],
        XA,
        0.02,
        0.005,
      );
      polyPlate(
        chest,
        OLV_L,
        [fpt(cf, 0.75, 0.08), fpt(cf, 0.95, 0.08), fpt(cf, 0.25, 0.92), fpt(cf, 0.05, 0.92)],
        XA,
        0.02,
        0.005,
      );
    }
    for (const y of [6.78, 7.12]) solid(chest, GUN_D, boxPts(W, [1.25, y, -1.615], [0.4, 0.06, 0.6], 0.01));
    solid(chest, GUN, boxPts(W, [1.25, 6.6, -1.615], [0.42, 0.06, 0.62], 0.01));
  }
  // core drum
  {
    const c = new THREE.Vector3(0, 8.05, -1.5);
    solid(chest, CYAN, prismPts(c, XA, 0.42, 1.66, 8, 0.42, Math.PI / 8), 2.2);
    for (const x of [-0.66, -0.22, 0.22, 0.66])
      solid(chest, BLU_D, prismPts(new THREE.Vector3(x, 8.05, -1.5), XA, 0.5, 0.32, 8, 0.5, Math.PI / 8));
    for (const x of [-0.66, -0.22, 0.22, 0.66])
      solid(chest, BLU_L, prismPts(new THREE.Vector3(x, 8.05 + 0.44, -1.5), XA, 0.08, 0.3, 4, 0.08, Math.PI / 4));
    for (const s of [-1, 1]) {
      solid(chest, GUN_L, prismPts(new THREE.Vector3(s * 0.9, 8.05, -1.5), XA, 0.55, 0.14, 8, 0.55, Math.PI / 8));
      solid(chest, STL, prismPts(new THREE.Vector3(s * 0.99, 8.05, -1.5), XA, 0.24, 0.08, 6));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        bolt(
          chest,
          STL_D,
          new THREE.Vector3(s * 0.97, 8.05 + Math.cos(a) * 0.4, -1.5 + Math.sin(a) * 0.4),
          new THREE.Vector3(s, 0, 0),
          0.035,
        );
      }
      // drum cradle
      solid(chest, GUN, boxPts(W, [s * 0.9, 7.72, -1.5], [0.2, 0.3, 0.7], 0.04));
    }
  }
  // exhaust stacks
  for (const [s] of SIDES) {
    const a = new THREE.Vector3(s * 0.6, 7.45, -1.86);
    const top = new THREE.Vector3(s * 0.68, 9.08, -2.08);
    const d = top.clone().sub(a).normalize();
    const at = (k: number) => a.clone().lerp(top, k);
    solid(chest, STL_D, rodPts(a, top, 0.16, 6));
    solid(chest, GUN_L, rodPts(at(0.08), at(0.2), 0.23, 6));
    solid(chest, BLU_D, rodPts(at(0.4), at(0.78), 0.2, 6));
    for (const k of [0.45, 0.59, 0.73]) solid(chest, GUN_D, rodPts(at(k), at(k + 0.03), 0.215, 6));
    solid(chest, GUN_D, rodPts(at(0.94), top.clone().addScaledVector(d, 0.03), 0.21, 6));
    solid(chest, HOT, prismPts(top.clone().addScaledVector(d, 0.025), d, 0.13, 0.02, 6), 2.5);
    // bracket to the housing
    solid(chest, GUN, boxPts(W, [s * 0.62, 7.62, -1.95], [0.32, 0.12, 0.3], 0.03));
  }
  // coolant lines from the drum caps into the torso
  for (const [s] of SIDES) {
    hose(
      [
        new THREE.Vector3(s * 0.98, 7.8, -1.35),
        new THREE.Vector3(s * 1.2, 7.55, -1.25),
        new THREE.Vector3(s * 1.36, 7.15, -1.15),
        new THREE.Vector3(s * 1.4, 6.95, -1.0),
      ],
      0.055,
      RED_D,
      chest,
      `coolant${s > 0 ? "L" : "R"}`,
    );
  }
  // antennas
  for (const [i, [s]] of SIDES.entries()) {
    const j = antennas[i];
    const A = new F(j.at, j.axis, [0, 0, 1], s);
    solid(chest, GUN_L, boxPts(W, [s * 1.0, 8.08, -0.82], [0.24, 0.12, 0.24], 0.03));
    solid(j, GUN, rodPts(A.p(0, 0, 0), A.p(0, 0.18, 0), 0.07, 6, 0.05));
    if (s > 0) {
      solid(j, STL_L, rodPts(A.p(0, 0.15, 0), A.p(0, 1.45, 0), 0.03, 4, 0.014));
      solid(j, GUN_D, rodPts(A.p(0, 0.55, 0), A.p(0, 0.6, 0), 0.045, 6));
      solid(j, LAMP_RED, prismPts(A.p(0, 1.47, 0), j.axis, 0.04, 0.06, 6), 2.5);
    } else {
      solid(j, STL, [
        A.p(-0.03, 0.15, 0.06),
        A.p(0.03, 0.15, 0.06),
        A.p(-0.03, 0.15, -0.12),
        A.p(0.03, 0.15, -0.12),
        A.p(-0.015, 0.85, -0.3),
        A.p(0.015, 0.85, -0.3),
        A.p(-0.015, 0.85, -0.22),
        A.p(0.015, 0.85, -0.22),
      ]);
      solid(j, LAMP_RED, prismPts(A.p(0, 0.86, -0.26), j.axis, 0.035, 0.05, 6), 2.5);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Arms: shoulder hub, layered pauldrons with smoke launchers, armoured upper arms, elbow actuators and pistons.
  for (const arm of arms) {
    const { s, S, E, Wr, shoulder, elbow, wrist } = arm;
    const P = new F(S, [0, 1, 0], [0, 0, 1], s);
    const U = new F(S, E.clone().sub(S), [0, 0, 1], s);
    const G = new F(E, Wr.clone().sub(E), [0, 1, 0], s);
    const hingeAxis = new THREE.Vector3().crossVectors(E.clone().sub(S), Wr.clone().sub(E)).normalize();
    const lenU = E.distanceTo(S);
    const lenG = Wr.distanceTo(E);
    // shoulder hub
    solid(shoulder, GUN_L, prismPts(P.p(0.0, 0, 0), XA, 0.46, 0.4, 8));
    solid(shoulder, STL, prismPts(P.p(0.2, 0, 0), XA, 0.3, 0.1, 8));
    // pauldron
    solid(
      shoulder,
      BLU,
      loftPts(P, [
        [-0.3, 0.62, 1.0, -1.05, 0.22, 0.62],
        [0.55, 0.7, 1.05, -1.1, 0.28, 0.54],
        [1.0, 0.52, 0.8, -0.86, 0.24, 0.36],
      ]),
    );
    solid(
      shoulder,
      IVO,
      loftPts(P, [
        [0.98, 0.5, 0.76, -0.82, 0.22, 0.36],
        [1.1, 0.42, 0.66, -0.72, 0.18, 0.36],
      ]),
    );
    solid(
      shoulder,
      ORG,
      loftPts(P, [
        [0.52, 0.71, 1.06, -1.11, 0.28, 0.54],
        [0.62, 0.69, 1.04, -1.09, 0.27, 0.53],
      ]),
    );
    // rear armour with the squad number for the chase camera
    {
      const rf = faceOf(
        [P.p(0.98, 0.46, -1.1), P.p(0.2, 0.46, -1.1), P.p(0.24, -0.24, -1.05), P.p(1.0, -0.24, -1.05)],
        new THREE.Vector3(0, 0, -1),
      );
      const rp = plate(shoulder, IVO, rf, 0, 0, 1, 1, 0.06, 0.025);
      const rq = faceOf(rp.q, rf.n);
      decal(TX.numDark, shoulder, rq, 0.5, 0.45, 0.6, 0.42, `number07Back${arm.side}`);
      boltCorners(shoulder, rq, 0.07, 0.028);
      plate(shoulder, BLU_D, rq, 0.0, 0.86, 1, 1, 0.02, 0.006);
    }
    // lames under the pauldron
    solid(
      shoulder,
      BLU_D,
      loftPts(P, [
        [-0.55, 0.5, 0.74, -0.8, 0.14, 0.76],
        [-0.32, 0.52, 0.82, -0.88, 0.16, 0.74],
      ]),
    );
    solid(
      shoulder,
      BLU,
      loftPts(P, [
        [-0.78, 0.42, 0.6, -0.66, 0.12, 0.84],
        [-0.58, 0.44, 0.68, -0.74, 0.14, 0.82],
      ]),
    );
    // outer face armour
    const of = faceOf(
      [P.p(1.24, 0.48, 0.74), P.p(1.24, 0.48, -0.78), P.p(1.24, -0.24, -0.78), P.p(1.24, -0.24, 0.74)],
      new THREE.Vector3(s, 0, 0),
    );
    const op = plate(shoulder, IVO, of, 0, 0, 1, 1, 0.07, 0.03);
    const oq = faceOf(op.q, of.n);
    plate(shoulder, BLU_D, oq, 0.0, 0.85, 1, 1, 0.025, 0.008);
    boltRow(shoulder, oq, 0.04, 0.1, 0.96, 0.1, 7, 0.03);
    if (s > 0) decal(TX.numDark, shoulder, oq, 0.5, 0.47, 0.72, 0.5, "number07PauldronL");
    else decal(TX.insignia, shoulder, oq, 0.5, 0.47, 0.4, 0.48, "insigniaPauldronR");
    // hazard band on the pauldron front
    solid(shoulder, HAZARD, boxPts(P, [0.66, 0.1, 1.06], [1.08, 0.2, 0.06], 0.0));
    if (s > 0) {
      const kf = faceOf(
        [P.p(0.2, 0.5, 1.045), P.p(0.96, 0.5, 1.045), P.p(0.96, 0.26, 1.03), P.p(0.2, 0.26, 1.03)],
        new THREE.Vector3(0, 0, 1),
      );
      const kp = plate(shoulder, BLU_D, kf, 0.0, 0.0, 1, 1, 0.025, 0.008);
      decal(TX.kills, shoulder, faceOf(kp.q, kf.n), 0.5, 0.5, 0.66, 0.14, "killMarks");
    }
    // smoke launchers on top
    for (let i = 0; i < 3; i++) {
      const base = P.p(0.1 + i * 0.2, 1.14, -0.42);
      const dir = P.d(0.35, 0.75, 0.55);
      solid(shoulder, GUN_D, rodPts(base, base.clone().addScaledVector(dir, 0.42), 0.085, 6));
      solid(
        shoulder,
        OLV,
        rodPts(base.clone().addScaledVector(dir, 0.38), base.clone().addScaledVector(dir, 0.46), 0.075, 6),
      );
    }
    solid(shoulder, GUN, boxPts(P, [0.3, 1.12, -0.42], [0.7, 0.1, 0.34], 0.03));
    if (s < 0) {
      // twin work lamps on the right pauldron front
      for (const x of [0.4, 0.85]) {
        solid(shoulder, GUN, rodPts(P.p(x, 0.4, 1.0), P.p(x, 0.4, 1.2), 0.1, 6));
        solid(shoulder, AMBER, rodPts(P.p(x, 0.4, 1.19), P.p(x, 0.4, 1.22), 0.075, 6), 2.5);
      }
    }
    for (const x of [0.06, 0.66]) bolt(shoulder, STL, P.p(x, 1.1, 0.5), UP, 0.035);
    solid(shoulder, BLU_D, boxPts(P, [0.36, 1.105, 0.18], [0.7, 0.02, 0.05], 0));

    // upper arm
    solid(
      shoulder,
      GUN,
      loftPts(U, [
        [0.2, 0.3, 0.3, -0.3, 0.1],
        [lenU - 0.25, 0.25, 0.26, -0.26, 0.08],
      ]),
    );
    solid(
      shoulder,
      BLU,
      loftPts(U, [
        [0.3, 0.3, 0.42, -0.34, 0.12, 0.1],
        [lenU - 0.45, 0.27, 0.38, -0.3, 0.1, 0.1],
      ]),
    );
    {
      const uf = faceOf(
        [U.p(-0.08, 0.35, 0.42), U.p(0.28, 0.35, 0.42), U.p(0.25, lenU - 0.5, 0.38), U.p(-0.05, lenU - 0.5, 0.38)],
        U.d(0, 0, 1),
      );
      plate(shoulder, IVO, uf, 0.05, 0.05, 0.95, 0.95, 0.04, 0.015);
      boltRow(shoulder, uf, 0.5, 0.1, 0.5, 0.9, 4, 0.025, STL_D);
    }
    // elbow actuator
    solid(shoulder, GUN_L, prismPts(E, hingeAxis, 0.36, 0.72, 8));
    solid(elbow, STL, prismPts(E, hingeAxis, 0.2, 0.86, 8));
    solid(elbow, BLU_D, prismPts(E, hingeAxis, 0.32, 0.8, 8, 0.32, 0.2));
    {
      const u = new THREE.Vector3().crossVectors(hingeAxis, UP).normalize();
      const w = new THREE.Vector3().crossVectors(hingeAxis, u);
      for (const e of [1, -1])
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          const p = E.clone()
            .addScaledVector(hingeAxis, e * 0.4)
            .addScaledVector(u, Math.cos(a) * 0.26)
            .addScaledVector(w, Math.sin(a) * 0.26);
          bolt(elbow, STL_D, p, hingeAxis.clone().multiplyScalar(e), 0.03);
        }
    }
    // bicep piston on the inner bend
    piston(shoulder, U.p(-0.05, 0.55, 0.44), elbow, G.p(-0.05, 0.42, -0.42), 0.06, hingeAxis);
    // arm hose from the torso to the forearm
    hose(
      [new THREE.Vector3(s * 1.5, 7.0, 0.5), P.p(-0.1, -0.5, 0.55), U.p(0.0, lenU * 0.6, -0.35), G.p(0.2, 0.3, -0.36)],
      0.045,
      RUB,
      [chest, shoulder, elbow],
      `armHose${arm.side}`,
    );

    // forearm housing
    solid(
      elbow,
      BLU,
      loftPts(G, [
        [0.15, 0.4, 0.38, -0.36, 0.12],
        [lenG - 0.02, 0.37, 0.35, -0.33, 0.11],
      ]),
    );
    solid(
      elbow,
      GUN,
      loftPts(G, [
        [0.1, 0.3, 0.3, -0.4, 0.08],
        [lenG, 0.28, 0.28, -0.4, 0.08],
      ]),
    );
    {
      const tf = faceOf(
        [G.p(-0.26, 0.2, 0.38), G.p(0.26, 0.2, 0.38), G.p(0.25, lenG - 0.08, 0.35), G.p(-0.25, lenG - 0.08, 0.35)],
        G.d(0, 0, 1),
      );
      plate(elbow, IVO, tf, 0.05, 0.05, 0.95, 0.68, 0.05, 0.02);
      plate(elbow, HAZARD, tf, 0.05, 0.74, 0.95, 0.96, 0.05, 0.02);
      const sf = faceOf(
        [G.p(0.4, 0.25, 0.22), G.p(0.4, lenG - 0.1, 0.22), G.p(0.37, lenG - 0.1, -0.2), G.p(0.4, 0.25, -0.22)],
        G.d(1, 0, 0),
      );
      plate(elbow, BLU_D, sf, 0.06, 0.12, 0.94, 0.88, 0.03, 0.01);
      boltRow(elbow, sf, 0.04, 0.05, 0.96, 0.05, 5, 0.025);
    }

    if (s < 0) {
      // ---- rotary cannon (right) ----
      // ammo box on the outer side with a brass belt feeding the receiver
      solid(elbow, OLV, boxPts(G, [0.66, 0.65, 0.02], [0.4, 0.86, 0.62], 0.05));
      solid(elbow, OLV_D, boxPts(G, [0.66, 0.65, 0.34], [0.36, 0.82, 0.06], 0.02));
      for (const y of [0.38, 0.92]) solid(elbow, GUN_D, boxPts(G, [0.66, y, 0.02], [0.44, 0.06, 0.66], 0.0));
      solid(elbow, GUN, boxPts(G, [0.45, 0.65, 0.0], [0.12, 0.5, 0.3], 0.02));
      solid(elbow, OLV_L, boxPts(G, [0.88, 0.65, 0.12], [0.04, 0.2, 0.08], 0.01));
      const belt = catmull([G.p(0.62, 0.78, 0.36), G.p(0.58, 0.92, 0.66), G.p(0.32, 1.1, 0.72), G.p(0.06, 1.26, 0.56)]);
      for (let i = 0; i <= 15; i++) {
        const t = i / 15;
        const p = belt.at(t);
        const tan = belt.tangentAt(t);
        const ax = G.Y.clone().addScaledVector(tan, -G.Y.dot(tan)).normalize();
        solid(elbow, BRASS, prismPts(p, ax, 0.035, 0.2, 6));
        solid(elbow, STL_D, prismPts(p.clone().addScaledVector(ax, 0.13), ax, 0.03, 0.06, 6, 0.0));
        solid(elbow, GUN_D, prismPts(p.clone().addScaledVector(ax, -0.04), ax, 0.045, 0.05, 6));
      }
      // receiver and motor
      solid(
        wrist,
        GUN,
        loftPts(G, [
          [lenG - 0.1, 0.42, 0.42, -0.4, 0.14],
          [lenG + 0.55, 0.38, 0.38, -0.36, 0.12],
        ]),
      );
      solid(
        wrist,
        GUN_D,
        loftPts(G, [
          [lenG + 0.12, 0.43, 0.2, -0.2, 0.06],
          [lenG + 0.42, 0.43, 0.2, -0.2, 0.06],
        ]),
      );
      for (let i = 0; i < 4; i++)
        solid(wrist, GUN_L, boxPts(G, [0, lenG + 0.08 + i * 0.12, 0.43], [0.5, 0.05, 0.04], 0));
      solid(wrist, BLU, boxPts(G, [0, lenG + 0.3, 0.5], [0.24, 0.42, 0.14], 0.03));
      // outer armour plate with an ivory stripe, inner vent slots
      solid(wrist, BLU, boxPts(G, [0.45, lenG + 0.26, 0.0], [0.07, 0.5, 0.56], 0.025));
      solid(wrist, IVO, boxPts(G, [0.49, lenG + 0.26, 0.14], [0.03, 0.5, 0.1], 0.01));
      for (const y of [0.06, 0.46]) bolt(wrist, STL, G.p(0.485, lenG + y, -0.18), G.d(1, 0, 0), 0.028);
      for (let i = 0; i < 4; i++)
        solid(wrist, GUN_L, boxPts(G, [-0.44, lenG + 0.08 + i * 0.11, 0.0], [0.04, 0.05, 0.4], 0));
      solid(wrist, AMBER, boxPts(G, [0, lenG + 0.52, 0.5], [0.12, 0.02, 0.07], 0), 2.5);
      solid(wrist, GUN_L, prismPts(G.p(0, lenG + 0.62, 0), G.Y, 0.36, 0.16, 8));
      solid(wrist, HAZARD, prismPts(G.p(0, lenG + 0.47, 0), G.Y, 0.385, 0.12, 8, 0.385, Math.PI / 8));
      // barrel cluster on its spin joint
      const barrel = b.joint("barrelR", { parent: wrist, at: G.p(0, lenG + 0.7, 0), dir: G.Y, group: "armR" });
      const B0 = lenG + 0.7;
      const B1 = lenG + 2.75;
      solid(barrel, STL, rodPts(G.p(0, B0, 0), G.p(0, B1 + 0.05, 0), 0.09, 6));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const x = Math.cos(a) * 0.21;
        const z = Math.sin(a) * 0.21;
        solid(barrel, GUN_L, rodPts(G.p(x, B0, z), G.p(x, B1 - 0.18, z), 0.068, 6));
        solid(barrel, GUN_D, rodPts(G.p(x, B1 - 0.18, z), G.p(x, B1, z), 0.068, 6));
        solid(barrel, RUB, rodPts(G.p(x, B1 - 0.02, z), G.p(x, B1 + 0.01, z), 0.04, 6));
      }
      for (const [y, r, c] of [
        [B0 + 0.08, 0.33, GUN],
        [B0 + 0.85, 0.31, GUN],
        [B0 + 1.45, 0.31, GUN],
        [B1 - 0.28, 0.33, GUN_D],
      ] as const) {
        solid(barrel, c, prismPts(G.p(0, y, 0), G.Y, r, 0.1, 6, r, Math.PI / 6));
        solid(barrel, STL_D, prismPts(G.p(0, y + 0.065, 0), G.Y, r * 0.85, 0.03, 6, r * 0.85, Math.PI / 6));
      }
    } else {
      // ---- missile pod and shield (left) ----
      solid(wrist, GUN, boxPts(G, [0, lenG + 0.15, 0], [0.62, 0.36, 0.62], 0.08));
      solid(wrist, STL, prismPts(G.p(0, lenG + 0.02, 0), G.Y, 0.2, 0.1, 8));
      const pod = b.joint("podL", {
        parent: wrist,
        at: G.p(0, lenG - 0.6, 0.42),
        aim: G.p(0, lenG + 0.4, 0.42),
        role: "hinge",
        group: "armL",
      });
      const PY0 = lenG - 1.0;
      const PY1 = lenG + 0.55;
      solid(pod, GUN, boxPts(G, [0, lenG - 0.6, 0.47], [0.4, 0.3, 0.14], 0.03));
      solid(
        pod,
        BLU,
        loftPts(G, [
          [PY0, 0.52, 1.24, 0.52, 0.1],
          [PY1 - 0.05, 0.52, 1.24, 0.52, 0.1],
        ]),
      );
      solid(
        pod,
        BLU_L,
        loftPts(G, [
          [PY0 + 0.04, 0.46, 1.27, 1.2, 0.04],
          [PY1 - 0.12, 0.46, 1.27, 1.2, 0.04],
        ]),
      );
      solid(
        pod,
        GUN_D,
        loftPts(G, [
          [PY1 - 0.1, 0.55, 1.27, 0.49, 0.1],
          [PY1, 0.55, 1.27, 0.49, 0.1],
        ]),
      );
      const front = faceOf([G.p(-0.5, PY1, 1.22), G.p(0.5, PY1, 1.22), G.p(0.5, PY1, 0.54), G.p(-0.5, PY1, 0.54)], G.Y);
      for (let r = 0; r < 3; r++)
        for (let c = 0; c < 4; c++) {
          const p = fpt(front, 0.14 + c * 0.24, 0.2 + r * 0.3);
          solid(pod, STL_D, prismPts(p.clone().addScaledVector(G.Y, 0.01), G.Y, 0.095, 0.04, 6));
          solid(pod, RUB, prismPts(p.clone().addScaledVector(G.Y, 0.03), G.Y, 0.075, 0.03, 6));
          solid(
            pod,
            RED,
            rodPts(p.clone().addScaledVector(G.Y, -0.02), p.clone().addScaledVector(G.Y, 0.09), 0.06, 6, 0.0),
          );
        }
      // pod sides: ivory band, chevrons, warning
      const ps = faceOf(
        [
          G.p(0.52, PY0 + 0.1, 1.1),
          G.p(0.52, PY1 - 0.15, 1.1),
          G.p(0.52, PY1 - 0.15, 0.66),
          G.p(0.52, PY0 + 0.1, 0.66),
        ],
        G.d(1, 0, 0),
      );
      const pb = plate(pod, IVO, ps, 0, 0.25, 1, 0.75, 0.04, 0.015);
      decal(TX.chevrons, pod, faceOf(pb.q, ps.n), 0.62, 0.5, 0.44, 0.19, "podChevrons");
      boltRow(pod, ps, 0.03, 0.08, 0.97, 0.08, 6, 0.025);
      const pi = faceOf(
        [
          G.p(-0.52, PY1 - 0.15, 1.1),
          G.p(-0.52, PY0 + 0.1, 1.1),
          G.p(-0.52, PY0 + 0.1, 0.66),
          G.p(-0.52, PY1 - 0.15, 0.66),
        ],
        G.d(-1, 0, 0),
      );
      decal(TX.warn, pod, pi, 0.5, 0.5, 0.28, 0.25, "podWarn");
      solid(
        pod,
        HAZARD,
        loftPts(G, [
          [PY1 - 0.32, 0.47, 1.31, 1.25, 0.0],
          [PY1 - 0.14, 0.47, 1.31, 1.25, 0.0],
        ]),
      );
      solid(pod, LAMP_RED, boxPts(G, [0.3, PY0 + 0.12, 1.29], [0.08, 0.08, 0.06], 0.01), 2.5);
      solid(pod, GUN_D, boxPts(G, [0, PY0 - 0.03, 0.88], [0.8, 0.06, 0.5], 0.02));
      hose(
        [G.p(0.22, lenG - 0.8, 0.4), G.p(0.3, PY0 - 0.3, 0.52), G.p(0.22, PY0 - 0.06, 0.74)],
        0.045,
        RUB,
        pod,
        "podFeed",
      );
      // shield on its own hinge
      const shield = b.joint("shieldL", {
        parent: wrist,
        at: G.p(0.48, lenG - 0.55, -0.05),
        aim: G.p(0.48, lenG + 0.45, -0.05),
        role: "hinge",
        group: "armL",
      });
      const SH = new F(G.p(0.66, lenG - 0.45, -0.25), [-0.05, -0.04, 1], [0, 1, 0], s); // y forward, z up, x outward
      const outline: [number, number][] = [
        [-0.95, 0.95],
        [0.8, 0.95],
        [1.08, 0.62],
        [1.08, -1.05],
        [0.6, -1.58],
        [-0.6, -1.58],
        [-0.95, -1.2],
      ];
      const ring = (inset: number, x: number) =>
        outline.map(([u, v]) => SH.p(x, u * (1 - inset), v * (1 - inset) - inset * 0.25));
      solid(shield, GUN, [...ring(0, -0.05), ...ring(0, 0.06)]);
      // inner face: blue skin with gunmetal bracing
      solid(shield, BLU_D, [...ring(0.06, -0.09), ...ring(0.06, -0.04)]);
      solid(shield, GUN_L, boxPts(SH, [-0.12, 0.05, -0.3], [0.06, 0.16, 2.2], 0.015));
      solid(shield, GUN_L, boxPts(SH, [-0.12, 0.05, 0.1], [0.06, 1.8, 0.16], 0.015));
      solid(shield, GUN_L, rodPts(SH.p(-0.11, -0.75, 0.72), SH.p(-0.11, 0.85, -1.2), 0.05, 4));
      solid(shield, GUN_L, rodPts(SH.p(-0.11, 0.85, 0.72), SH.p(-0.11, -0.6, -1.3), 0.05, 4));
      for (const [u, v] of [
        [0.05, 0.1],
        [-0.75, 0.72],
        [0.85, 0.72],
        [0.85, -1.2],
        [-0.6, -1.3],
      ])
        bolt(shield, STL, SH.p(-0.15, u, v), SH.d(-1, 0, 0), 0.04);
      solid(shield, IVO, [...ring(0.07, 0.05), ...ring(0.1, 0.13)]);
      // blue chevron band (two convex halves)
      solid(shield, BLU, [
        SH.p(0.12, -0.84, -0.05),
        SH.p(0.12, -0.84, -0.4),
        SH.p(0.12, 0.02, -0.75),
        SH.p(0.12, 0.02, -0.4),
        SH.p(0.17, -0.8, -0.08),
        SH.p(0.17, -0.8, -0.37),
        SH.p(0.17, 0.0, -0.72),
        SH.p(0.17, 0.0, -0.43),
      ]);
      solid(shield, BLU, [
        SH.p(0.12, 0.02, -0.75),
        SH.p(0.12, 0.02, -0.4),
        SH.p(0.12, 0.96, -0.05),
        SH.p(0.12, 0.96, -0.4),
        SH.p(0.17, 0.04, -0.72),
        SH.p(0.17, 0.04, -0.43),
        SH.p(0.17, 0.92, -0.08),
        SH.p(0.17, 0.92, -0.37),
      ]);
      // hazard foot of the shield and rim bolts
      solid(shield, HAZARD, [
        SH.p(0.12, -0.5, -1.28),
        SH.p(0.12, 0.5, -1.28),
        SH.p(0.12, 0.42, -1.4),
        SH.p(0.12, -0.42, -1.4),
        SH.p(0.17, -0.48, -1.29),
        SH.p(0.17, 0.48, -1.29),
        SH.p(0.17, 0.41, -1.38),
        SH.p(0.17, -0.41, -1.38),
      ]);
      for (let i = 0; i < outline.length; i++) {
        const [u0, v0] = outline[i];
        const [u1, v1] = outline[(i + 1) % outline.length];
        for (const k of [0.25, 0.75]) {
          const u = (u0 + (u1 - u0) * k) * 0.9;
          const v = (v0 + (v1 - v0) * k) * 0.9 - 0.02;
          bolt(shield, STL, SH.p(0.13, u, v), SH.d(1, 0, 0), 0.032);
        }
      }
      const shf = faceOf(
        [SH.p(0.13, -0.5, 0.75), SH.p(0.13, 0.5, 0.75), SH.p(0.13, 0.5, 0.0), SH.p(0.13, -0.5, 0.0)],
        SH.d(1, 0, 0),
      );
      decal(TX.insignia, shield, shf, 0.5, 0.48, 0.58, 0.68, "insigniaShield");
      // field patch, lower rear corner
      const pf = faceOf(
        [SH.p(0.13, -0.82, -0.62), SH.p(0.13, -0.42, -0.62), SH.p(0.13, -0.42, -1.05), SH.p(0.13, -0.82, -1.05)],
        SH.d(1, 0, 0),
      );
      const pp = plate(shield, OLV, pf, 0, 0, 1, 1, 0.04, 0.012);
      boltCorners(shield, faceOf(pp.q, pf.n), 0.14, 0.025, OLV_L);
      // hinge brackets
      for (const y of [-0.55, 0.45]) solid(shield, GUN, boxPts(SH, [-0.2, y, 0.22], [0.42, 0.22, 0.3], 0.04));
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  // Legs: thigh armour, knee and hock actuators, shins, metatarsals, pistons, hydraulic lines and clawed feet.
  for (const L of legs) {
    const { s, H, K, C, A, hip, knee, hock, ankle, toes, heel, FT } = L;
    const T = new F(H, K.clone().sub(H), [0, 0, 1], s);
    const N = new F(K, C.clone().sub(K), [0, 0, 1], s);
    const M = new F(C, A.clone().sub(C), [0, 0, 1], s);
    const lenT = H.distanceTo(K);
    const lenN = K.distanceTo(C);
    const lenM = C.distanceTo(A);

    // hip actuator (thigh side)
    solid(hip, GUN, prismPts(H.clone().setX(s * 1.38), XA, 0.5, 0.34, 8));
    solid(hip, BLU, prismPts(H.clone().setX(s * 1.6), XA, 0.4, 0.1, 8, 0.36));
    solid(hip, STL, prismPts(H.clone().setX(s * 1.67), XA, 0.2, 0.08, 6));
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      bolt(
        hip,
        STL_D,
        H.clone()
          .setX(s * 1.65)
          .add(new THREE.Vector3(0, Math.cos(a) * 0.3, Math.sin(a) * 0.3)),
        new THREE.Vector3(s, 0, 0),
        0.03,
      );
    }

    // thigh
    solid(
      hip,
      GUN,
      loftPts(T, [
        [0.2, 0.32, 0.3, -0.32, 0.1],
        [lenT - 0.2, 0.3, 0.28, -0.3, 0.1],
      ]),
    );
    solid(
      hip,
      BLU,
      loftPts(T, [
        [0.12, 0.54, 0.58, -0.5, 0.2, 0.05],
        [lenT - 0.38, 0.46, 0.5, -0.42, 0.16, 0.04],
      ]),
    );
    const tFront = faceOf(
      [T.p(-0.29, 0.12, 0.58), T.p(0.39, 0.12, 0.58), T.p(0.34, lenT - 0.38, 0.5), T.p(-0.26, lenT - 0.38, 0.5)],
      T.d(0, 0, 1),
    );
    const tp = plate(hip, IVO, tFront, 0.06, 0.08, 0.94, 0.78, 0.06, 0.025);
    boltRow(hip, faceOf(tp.q, tFront.n), 0.1, 0.1, 0.9, 0.1, 4, 0.028);
    plate(hip, BLU_D, tFront, 0.4, 0.16, 0.6, 0.74, 0.08, 0.02);
    plate(hip, HAZARD, tFront, 0.06, 0.84, 0.94, 0.98, 0.05, 0.02);
    const tOut = faceOf(
      [T.p(0.59, 0.18, 0.36), T.p(0.59, 0.18, -0.28), T.p(0.5, lenT - 0.42, -0.24), T.p(0.5, lenT - 0.42, 0.32)],
      T.d(1, 0, 0),
    );
    if (s > 0) {
      const np = plate(hip, BLU_D, tOut, 0.08, 0.1, 0.92, 0.9, 0.03, 0.01);
      decal(TX.numOrange, hip, faceOf(np.q, tOut.n), 0.5, 0.5, 0.5, 0.35, "number07Thigh");
    } else {
      const pp = plate(hip, OLV, tOut, 0.1, 0.12, 0.85, 0.75, 0.05, 0.015);
      const pq = faceOf(pp.q, tOut.n);
      boltCorners(hip, pq, 0.12, 0.028, OLV_L);
      boltRow(hip, pq, 0.12, 0.5, 0.88, 0.5, 3, 0.025, OLV_L);
      plate(hip, OLV_D, pq, 0.2, 0.75, 0.8, 0.9, 0.02, 0.006);
    }
    // inner thigh panel lines
    const tIn = faceOf(
      [T.p(-0.49, 0.18, 0.36), T.p(-0.49, 0.18, -0.28), T.p(-0.42, lenT - 0.42, -0.24), T.p(-0.42, lenT - 0.42, 0.32)],
      T.d(-1, 0, 0),
    );
    plate(hip, BLU_D, tIn, 0.1, 0.15, 0.9, 0.3, 0.025, 0.008);
    plate(hip, BLU_D, tIn, 0.1, 0.55, 0.9, 0.7, 0.025, 0.008);

    // knee actuator and kneecap
    solid(hip, GUN_L, prismPts(K, XA, 0.46, 0.84, 8));
    solid(hip, GUN_D, prismPts(K, XA, 0.5, 0.12, 8));
    for (const e of [1, -1]) {
      solid(knee, STL, prismPts(K.clone().add(new THREE.Vector3(e * 0.46, 0, 0)), XA, 0.24, 0.1, 6));
      solid(knee, BLU_D, prismPts(K.clone().add(new THREE.Vector3(e * 0.43, 0, 0)), XA, 0.36, 0.06, 8));
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 + 0.5;
        bolt(
          knee,
          STL_D,
          K.clone().add(new THREE.Vector3(e * 0.46, Math.cos(a) * 0.3, Math.sin(a) * 0.3)),
          new THREE.Vector3(e, 0, 0),
          0.03,
        );
      }
    }
    solid(knee, IVO, [
      ...oct(N, -0.15, 0.36, 0.62, 0.3, 0.1),
      ...oct(N, 0.55, 0.3, 0.52, 0.3, 0.08),
      N.p(0, -0.3, 0.45),
    ]);
    solid(knee, BLU, [...oct(N, 0.1, 0.12, 0.66, 0.5, 0.03), ...oct(N, 0.5, 0.1, 0.56, 0.45, 0.03)]);

    // shin
    solid(
      knee,
      GUN,
      loftPts(N, [
        [0.25, 0.28, 0.2, -0.3, 0.08],
        [lenN - 0.2, 0.24, 0.18, -0.26, 0.08],
      ]),
    );
    solid(
      knee,
      BLU,
      loftPts(N, [
        [0.45, 0.46, 0.42, -0.05, 0.14],
        [1.6, 0.42, 0.4, -0.05, 0.13],
      ]),
    );
    solid(
      knee,
      BLU,
      loftPts(N, [
        [1.64, 0.42, 0.4, -0.05, 0.13],
        [lenN - 0.32, 0.32, 0.3, -0.05, 0.1],
      ]),
    );
    const nFront = faceOf(
      [N.p(-0.32, 0.45, 0.42), N.p(0.32, 0.45, 0.42), N.p(0.29, 1.6, 0.4), N.p(-0.29, 1.6, 0.4)],
      N.d(0, 0, 1),
    );
    plate(knee, IVO, nFront, 0.36, 0.04, 0.64, 0.96, 0.05, 0.015);
    plate(knee, BLU_L, nFront, 0.0, 0.0, 1, 0.07, 0.03, 0.01);
    boltRow(knee, nFront, 0.12, 0.15, 0.12, 0.85, 4, 0.026);
    boltRow(knee, nFront, 0.88, 0.15, 0.88, 0.85, 4, 0.026);
    const nLow = faceOf(
      [N.p(-0.29, 1.64, 0.4), N.p(0.29, 1.64, 0.4), N.p(0.22, lenN - 0.32, 0.3), N.p(-0.22, lenN - 0.32, 0.3)],
      N.d(0, 0, 1),
    );
    decal(TX.chevrons, knee, nLow, 0.5, 0.45, 0.42, 0.19, `shinChevrons${L.side}`);
    // shin side skirt and vents
    const nOut = faceOf(
      [N.p(0.46, 0.5, 0.3), N.p(0.46, 1.55, 0.3), N.p(0.42, 1.55, -0.02), N.p(0.46, 0.5, -0.02)],
      N.d(1, 0, 0),
    );
    for (let i = 0; i < 4; i++) plate(knee, GUN_D, nOut, 0.15 + i * 0.2, 0.2, 0.25 + i * 0.2, 0.8, 0.03, 0.008);
    // calf armour on the back of the shin
    solid(
      knee,
      BLU,
      loftPts(N, [
        [1.08, 0.3, -0.2, -0.46, 0.1],
        [lenN - 0.5, 0.26, -0.18, -0.42, 0.08],
      ]),
    );
    const nBack = faceOf(
      [N.p(0.2, 1.1, -0.46), N.p(-0.2, 1.1, -0.46), N.p(-0.18, lenN - 0.52, -0.42), N.p(0.18, lenN - 0.52, -0.42)],
      N.d(0, 0, -1),
    );
    plate(knee, IVO, nBack, 0.1, 0.06, 0.9, 0.2, 0.035, 0.012);
    for (let i = 0; i < 3; i++) plate(knee, BLU_D, nBack, 0.15, 0.35 + i * 0.2, 0.85, 0.44 + i * 0.2, 0.025, 0.008);
    // hock actuator
    solid(knee, GUN_L, prismPts(C, XA, 0.38, 0.7, 8));
    for (const e of [1, -1]) {
      solid(hock, STL, prismPts(C.clone().add(new THREE.Vector3(e * 0.38, 0, 0)), XA, 0.2, 0.08, 6));
      solid(hock, BLU_D, prismPts(C.clone().add(new THREE.Vector3(e * 0.35, 0, 0)), XA, 0.3, 0.05, 8));
    }

    // metatarsal
    solid(
      hock,
      GUN,
      loftPts(M, [
        [0.2, 0.26, 0.26, -0.26, 0.08],
        [lenM - 0.15, 0.24, 0.24, -0.24, 0.08],
      ]),
    );
    solid(
      hock,
      BLU,
      loftPts(M, [
        [0.25, 0.38, 0.4, 0.02, 0.12],
        [lenM - 0.35, 0.34, 0.34, 0.02, 0.1],
      ]),
    );
    const mFront = faceOf(
      [M.p(-0.26, 0.25, 0.4), M.p(0.26, 0.25, 0.4), M.p(0.24, lenM - 0.35, 0.34), M.p(-0.24, lenM - 0.35, 0.34)],
      M.d(0, 0, 1),
    );
    plate(hock, IVO, mFront, 0.08, 0.1, 0.92, 0.3, 0.04, 0.015);
    boltRow(hock, mFront, 0.15, 0.55, 0.85, 0.55, 3, 0.026);
    // ankle actuator
    solid(hock, GUN_L, prismPts(A, XA, 0.36, 0.72, 8));
    for (const e of [1, -1])
      solid(ankle, STL, prismPts(A.clone().add(new THREE.Vector3(e * 0.37, 0, 0)), XA, 0.2, 0.08, 6));
    // ankle spat: ivory wedge guarding the front of the ankle
    solid(ankle, IVO, [...oct(FT, 0.26, 0.3, 0.26, -0.3, 0.08), ...oct(FT, 0.52, 0.24, 0.02, -0.34, 0.06)]);
    solid(ankle, BLU_L, [...oct(FT, 0.28, 0.08, 0.3, 0.1, 0.02), ...oct(FT, 0.5, 0.06, 0.06, -0.1, 0.02)]);
    bolt(ankle, STL, FT.p(0.18, 0.39, 0.15), FT.d(0, 1, 1), 0.028);
    bolt(ankle, STL, FT.p(-0.18, 0.39, 0.15), FT.d(0, 1, 1), 0.028);

    // pistons: knee (behind), hock (in front), ankle (behind)
    const hx = new THREE.Vector3(1, 0, 0);
    for (const e of [-0.2, 0.2]) {
      piston(hip, T.p(e, 0.5, -0.62), knee, N.p(e, 0.85, -0.42), 0.075, hx);
    }
    piston(knee, N.p(0, lenN - 0.75, 0.48), hock, M.p(0, 0.55, 0.42), 0.07, hx);
    piston(hock, M.p(0, 0.35, -0.36), ankle, FT.p(0, -0.42, -0.2), 0.06, hx);

    // hydraulic lines
    hose(
      [
        T.p(0.36, 0.15, -0.45),
        T.p(0.42, 0.8, -0.5),
        T.p(0.42, lenT - 0.3, -0.42),
        N.p(0.4, 0.35, -0.3),
        N.p(0.32, 0.9, -0.3),
      ],
      0.045,
      RUB,
      [hip, knee],
      `thighHose${L.side}`,
    );
    hose(
      [T.p(-0.34, 0.2, -0.45), T.p(-0.38, lenT - 0.3, -0.4), N.p(-0.36, 0.35, -0.3), N.p(-0.3, 1.0, -0.3)],
      0.035,
      RED_D,
      [hip, knee],
      `thighLine${L.side}`,
    );
    hose(
      [N.p(0.4, 1.3, -0.3), N.p(0.42, lenN - 0.35, -0.3), M.p(0.36, 0.25, -0.3), M.p(0.3, 0.75, -0.28)],
      0.045,
      RUB,
      [knee, hock],
      `shinHose${L.side}`,
    );
    for (const k of [0.35, 0.7]) solid(hip, GUN_D, boxPts(T, [0.42, lenT * k, -0.5], [0.14, 0.08, 0.14], 0.02));

    // foot
    solid(ankle, GUN, boxPts(FT, [0, 0.0, -0.56], [1.0, 1.2, 0.58], 0.1));
    solid(ankle, RUB, boxPts(FT, [0, 0.0, -0.92], [0.96, 1.16, 0.12], 0.03));
    solid(
      ankle,
      BLU,
      loftPts(FT, [
        [-0.6, 0.55, -0.24, -0.6, 0.14],
        [0.45, 0.55, -0.32, -0.6, 0.14],
        [0.66, 0.46, -0.48, -0.66, 0.1],
      ]),
    );
    const ff = faceOf(
      [FT.p(-0.42, 0.45, -0.32), FT.p(0.42, 0.45, -0.32), FT.p(0.36, 0.66, -0.48), FT.p(-0.36, 0.66, -0.48)],
      FT.d(0, 0.6, 1),
    );
    plate(ankle, HAZARD, ff, 0.0, 0.1, 1, 0.9, 0.035, 0.012);
    const ftop = faceOf(
      [FT.p(-0.41, -0.55, -0.24), FT.p(0.41, -0.55, -0.24), FT.p(0.41, 0.4, -0.32), FT.p(-0.41, 0.4, -0.32)],
      FT.d(0, 0, 1),
    );
    plate(ankle, BLU_L, ftop, 0.05, 0.05, 0.95, 0.15, 0.03, 0.01);
    boltCorners(ankle, ftop, 0.1, 0.03);
    for (const e of [1, -1]) {
      const sf = faceOf(
        [
          FT.p(e * 0.55, -0.5, -0.3),
          FT.p(e * 0.55, 0.42, -0.36),
          FT.p(e * 0.55, 0.42, -0.58),
          FT.p(e * 0.55, -0.5, -0.58),
        ],
        FT.d(e, 0, 0),
      );
      plate(ankle, BLU_D, sf, 0.06, 0.15, 0.94, 0.85, 0.03, 0.01);
    }
    // toes
    for (const toe of [...toes, heel]) {
      const isHeel = toe === heel;
      const TF = new F(toe.at, toe.axis, [0, 1, 0], s);
      const len = isHeel ? 0.55 : 0.78;
      solid(ankle, GUN_L, prismPts(TF.p(0, 0, 0), XA, 0.15, 0.36, 6));
      solid(
        toe,
        BLU,
        loftPts(TF, [
          [0.0, 0.17, 0.18, -0.28, 0.06],
          [len, 0.15, 0.04, -0.28, 0.05],
        ]),
      );
      solid(toe, RUB, boxPts(TF, [0, len * 0.5, -0.33], [0.3, len + 0.05, 0.08], 0.02));
      solid(toe, STL, [
        ...oct(TF, len - 0.02, 0.14, 0.04, -0.3, 0.03),
        ...oct(TF, len + 0.26, 0.07, -0.24, -0.34, 0.02),
      ]);
      const tf = faceOf(
        [TF.p(-0.11, 0.05, 0.18), TF.p(0.11, 0.05, 0.18), TF.p(0.1, len - 0.05, 0.04), TF.p(-0.1, len - 0.05, 0.04)],
        TF.d(0, 0.2, 1),
      );
      plate(toe, isHeel ? BLU_L : IVO, tf, 0.0, 0.0, 1, 1, 0.035, 0.012);
      bolt(toe, STL, fpt(tf, 0.5, 0.35, 0.035), tf.n, 0.03);
    }
  }

  // ---------------------------------------------------------------------------------------------------------------
  for (const bin of bins.values()) {
    const geo = bin.geos.length === 1 ? bin.geos[0] : mergeGeometries(bin.geos);
    const part = b.part(geo, bin.color, { bone: bin.bone, at: [0, 0, 0], name: bin.name });
    if (bin.glow) glow(part, bin.glow);
  }
  return b.root;
}
