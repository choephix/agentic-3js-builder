// Whimsical barnstormer biplane "Dandy Dot": chubby egg fuselage, big round cowl, puffy tires, a goggled pilot with a
// streaming scarf and a dog passenger. Cel-shaded storybook toy palette; built level then pitched into a tail-dragger
// three-point stance (P / D map level airframe coordinates into the pitched model).
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";
import { cel, INK, zigzag } from "../../../../kits/toon";
import { createBuilder } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { grain, paint } from "../../../../src/paint";
import { catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";

export const meta = {
  name: "Dandy Dot Barnstormer Biplane",
  description:
    "Whimsical open-cockpit barnstormer biplane: chubby red fuselage, teal radial cowl, mustard wings with red tips, puffy tires, bunting, a goggled pilot with a streaming scarf and a dog passenger. Hinged ailerons, rudder, elevators, propeller and wheels.",
  style: "whimsical",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const RED = "#e8503a";
const CREAM = "#fff1cf";
const MUSTARD = "#f7b93a";
const TEAL = "#2db3ae";
const NAVY = "#2c4373";
const WOOD = "#d08d4c";
const WOOD_D = "#a96a34";
const BRASS = "#eab135";
const TIRE = "#3d3548";
const STEEL = "#a9b4c8";
const LEATHER = "#a1623a";
const LEATHER_D = "#5e3622";
const SKIN = "#f6b890";
const PINK = "#ff8fa3";
const SKY = "#bfeaf6";
const GOLDEN = "#eba253";
const WHITE = "#fffaf0";

const cRed = cel(RED);
const cCream = cel(CREAM);
const cMustard = cel(MUSTARD);
const cTeal = cel(TEAL);
const cNavy = cel(NAVY);
const cBrass = cel(BRASS);
const cSteel = cel(STEEL);
const cLeather = cel(LEATHER);
const cLeatherD = cel(LEATHER_D);
const cSkin = cel(SKIN);
const cPink = cel(PINK);
const cGolden = cel(GOLDEN);
const cTire = cel(TIRE);
const cWhite = cel(WHITE);
const cWood = cel(grain(WOOD, WOOD_D, { size: 0.05, axis: "y" }));

// ---------------------------------------------------------------- airframe pitch (tail-dragger stance)
const TH = (7 * Math.PI) / 180;
const YC = 1.45;
const PIV = new THREE.Vector3(0, YC, 0.4);
const QP = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -TH);
const QPI = QP.clone().invert();
const P = (p: readonly number[]) => new THREE.Vector3(p[0], p[1], p[2]).sub(PIV).applyQuaternion(QP).add(PIV);
const D = (d: readonly number[]) => new THREE.Vector3(d[0], d[1], d[2]).applyQuaternion(QP);
const sp = new THREE.Vector3();
const sn = new THREE.Vector3();
/** model point -> level airframe coordinates (shared scratch vector). */
const L = (p: THREE.Vector3) => sp.copy(p).sub(PIV).applyQuaternion(QPI).add(PIV);
const Ln = (n: THREE.Vector3) => sn.copy(n).applyQuaternion(QPI);

// ---------------------------------------------------------------- level-frame dimensions
const FUSE: [number, number, number, number][] = [
  // z, dy, w, h
  [-3.6, 0.1, 0.06, 0.12],
  [-3.1, 0.1, 0.2, 0.3],
  [-2.4, 0.06, 0.42, 0.56],
  [-1.6, 0.0, 0.7, 0.88],
  [-0.8, 0.0, 0.88, 1.04],
  [0.0, 0.02, 0.96, 1.12],
  [0.8, 0.03, 1.0, 1.16],
  [1.4, 0.03, 1.04, 1.2],
];
const lerpN = (a: number, b: number, t: number) => a + (b - a) * t;
function fuseAt(z: number) {
  for (let i = 0; i < FUSE.length - 1; i++) {
    const a = FUSE[i];
    const c = FUSE[i + 1];
    if (z <= c[0]) {
      const t = (z - a[0]) / (c[0] - a[0]);
      return { dy: lerpN(a[1], c[1], t), w: lerpN(a[2], c[2], t), h: lerpN(a[3], c[3], t) };
    }
  }
  const e = FUSE[FUSE.length - 1];
  return { dy: e[1], w: e[2], h: e[3] };
}
const deckY = (z: number) => YC + fuseAt(z).dy + fuseAt(z).h / 2;

const Y_U = 2.5;
const ZC_U = 0.8;
const HALF_U = 4.2;
const Y_L = 1.3;
const ZC_L = 0.45;
const HALF_L = 3.75;
const DIH = 0.14;
const rxU = (x: number) => lerpN(0.78, 0.6, Math.min(1, Math.abs(x) / HALF_U));
const ryU = (x: number) => lerpN(0.105, 0.075, Math.min(1, Math.abs(x) / HALF_U));
const rxL = (x: number) => lerpN(0.75, 0.58, Math.min(1, Math.abs(x) / HALF_L));
const ryL = (x: number) => lerpN(0.1, 0.07, Math.min(1, Math.abs(x) / HALF_L));
const yL = (x: number) => Y_L + DIH * Math.pow(Math.min(1, Math.abs(x) / HALF_L), 1.5);

// ---------------------------------------------------------------- textures
function rays(n: number, r0: number, r1: number, cx: number, cy: number, fill: string) {
  let out = "";
  for (let i = 0; i < n; i++) {
    const a0 = ((i + 0.0) / n) * Math.PI * 2;
    const a1 = ((i + 0.5) / n) * Math.PI * 2;
    const am = ((i + 0.25) / n) * Math.PI * 2;
    out += `<polygon fill="${fill}" points="${cx + Math.cos(a0) * r0},${cy + Math.sin(a0) * r0} ${cx + Math.cos(am) * r1},${cy + Math.sin(am) * r1} ${cx + Math.cos(a1) * r0},${cy + Math.sin(a1) * r0}"/>`;
  }
  return out;
}
const SUN = svg(
  `<svg viewBox="0 0 100 100"><g>${rays(14, 34, 49, 50, 50, RED)}</g><circle cx="50" cy="50" r="33" fill="${NAVY}"/><circle cx="50" cy="50" r="30" fill="${BRASS}"/>` +
    `<circle cx="50" cy="50" r="30" fill="none" stroke="${CREAM}" stroke-width="2"/>` +
    `<ellipse cx="40" cy="45" rx="3.6" ry="5" fill="${INK}"/><ellipse cx="60" cy="45" rx="3.6" ry="5" fill="${INK}"/>` +
    `<circle cx="41.2" cy="43" r="1.3" fill="#fff"/><circle cx="61.2" cy="43" r="1.3" fill="#fff"/>` +
    `<circle cx="33" cy="55" r="5" fill="${PINK}" opacity="0.8"/><circle cx="67" cy="55" r="5" fill="${PINK}" opacity="0.8"/>` +
    `<path d="M36 56 Q50 74 64 56 Q50 62 36 56Z" fill="${INK}"/><path d="M42 61 Q50 70 58 61 Q50 64 42 61Z" fill="${PINK}"/></svg>`,
  { size: 512 },
);
const NAME_PLATE = svg(
  `<svg viewBox="0 0 240 80"><path d="M10 14 Q120 -2 230 14 L222 66 Q120 82 18 66Z" fill="${CREAM}" stroke="${NAVY}" stroke-width="5" stroke-linejoin="round"/>` +
    `<path d="M10 14 L2 22 L10 30Z M230 14 L238 22 L230 30Z" fill="${RED}"/>` +
    `<text x="120" y="46" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="bold" font-size="30" fill="${RED}" stroke="${NAVY}" stroke-width="1.2">Dandy Dot</text>` +
    `<text x="120" y="63" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="13" fill="${NAVY}">~ Loop-de-Loop Air Circus ~</text></svg>`,
  { size: 1024 },
);
const NUMBER = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="${CREAM}" stroke="${NAVY}" stroke-width="6"/>` +
    `<text x="50" y="72" text-anchor="middle" font-family="Georgia, serif" font-weight="bold" font-size="66" fill="${RED}" stroke="${NAVY}" stroke-width="2">7</text></svg>`,
  { size: 256 },
);
const BOLT = svg(
  `<svg viewBox="0 0 60 100"><path d="M38 2 L6 56 L26 56 L16 98 L54 40 L32 40Z" fill="${MUSTARD}" stroke="${NAVY}" stroke-width="5" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);
const HEART = svg(
  `<svg viewBox="0 0 100 90"><path d="M50 84 C6 52 4 18 28 12 C40 9 48 18 50 26 C52 18 60 9 72 12 C96 18 94 52 50 84Z" fill="${RED}" stroke="${NAVY}" stroke-width="6" stroke-linejoin="round"/>` +
    `<ellipse cx="33" cy="28" rx="7" ry="4" fill="#fff" opacity="0.7" transform="rotate(-30 33 28)"/></svg>`,
  { size: 256 },
);
function hubSvg() {
  return svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${CREAM}"/>${rays(10, 12, 47, 50, 50, RED)}` +
      `<circle cx="50" cy="50" r="48" fill="none" stroke="${NAVY}" stroke-width="4"/><circle cx="50" cy="50" r="14" fill="${BRASS}" stroke="${NAVY}" stroke-width="3"/></svg>`,
    { size: 256 },
  );
}
const HUB = hubSvg();
function flagSvg(c: string, d: string) {
  return svg(
    `<svg viewBox="0 0 40 50"><path d="M3 2 L37 2 L20 48Z" fill="${c}" stroke="${NAVY}" stroke-width="3" stroke-linejoin="round"/><circle cx="20" cy="14" r="4" fill="${d}"/><path d="M8 5 L32 5" stroke="${d}" stroke-width="3"/></svg>`,
    { size: 128 },
  );
}
const FLAGS = [flagSvg(RED, CREAM), flagSvg(TEAL, CREAM), flagSvg(MUSTARD, RED), flagSvg(CREAM, RED), flagSvg(PINK, NAVY)];
const EYE_GLINT = svg(`<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#fff"/></svg>`, { size: 16 });

// ---------------------------------------------------------------- build
export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane", paintSize: 2048 });
  const body = b.joint("body", { at: P([0, YC, 0.4]) });
  type J = typeof body;

  // ---- helpers ------------------------------------------------------------
  type PutOpts = {
    rot?: number[];
    dir?: number[];
    axis?: "x" | "y" | "z";
    up?: number[];
    bone?: J;
    name?: string;
    scale?: number | [number, number, number];
    texture?: THREE.Texture;
    flat?: boolean;
  };
  function put(geo: THREE.BufferGeometry, color: Parameters<typeof b.part>[1], at: number[], o: PutOpts = {}) {
    const opt: Parameters<typeof b.part>[2] = { at: P(at), bone: o.bone ?? body };
    if (o.name) opt.name = o.name;
    if (o.scale !== undefined) opt.scale = o.scale;
    if (o.texture) opt.texture = o.texture;
    if (o.flat) opt.flat = true;
    if (o.dir) {
      opt.dir = D(o.dir);
      if (o.axis) opt.axis = o.axis;
      if (o.up) opt.up = D(o.up);
    } else {
      const q = new THREE.Quaternion();
      if (o.rot) q.setFromEuler(new THREE.Euler((o.rot[0] * Math.PI) / 180, (o.rot[1] * Math.PI) / 180, (o.rot[2] * Math.PI) / 180));
      opt.quat = q.premultiply(QP);
    }
    return b.part(geo, color, opt);
  }
  const ball = (r: number, color: Parameters<typeof b.part>[1], at: number[], scale?: number | [number, number, number], o: PutOpts = {}) =>
    put(new THREE.SphereGeometry(r, 8, 6), color, at, { ...o, scale });
  const sw = (pts: number[][], r: Parameters<typeof b.sweep>[1], o: Parameters<typeof b.sweep>[2] = {}) =>
    b.sweep(pts.map((p) => P(p)), r, { bone: body, ...o });
  const wp = (a: number[], c: number[], r: number | readonly [number, number], color: Parameters<typeof b.part>[1], o: Parameters<typeof b.sweep>[2] = {}) =>
    b.sweep([P(a), P(c)], r, { bone: body, color, caps: "round", sides: 6, ...o });
  /** a streamlined strut: wide in z, thin in x. */
  const strut = (a: number[], c: number[], rx: number, rz: number, color: Parameters<typeof b.part>[1] = cWood) =>
    b.sweep([P(a), P(c)], () => [rx, rz], { bone: body, color, caps: "flat", sides: 8, name: "strut" });
  function circle(center: number[], rx: number, rz: number, n = 14, y = 0) {
    const pts: number[][] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push([center[0] + Math.cos(a) * rx, center[1] + y, center[2] + Math.sin(a) * rz]);
    }
    return pts;
  }
  /** brass bolts/rivets merged into one part per call. */
  function studs(points: number[][], r: number, color: Parameters<typeof b.part>[1], bone: J = body) {
    const gs = points.map((p) => {
      const w = P(p);
      return new THREE.SphereGeometry(r, 5, 3).translate(w.x, w.y, w.z);
    });
    return b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0], name: "studs" });
  }

  // ======================================================== FUSELAGE
  const fusePaint = cel(
    paint((p, n) => {
      const l = L(p);
      const x = l.x;
      const y = l.y - YC;
      const z = l.z;
      const ny = Ln(n).y;
      // belly
      if (ny < -0.5 + 0.13 * zigzag(z / 0.24)) return CREAM;
      // lacing along the spine of the tail
      if (ny > 0.8 && z < -1.9 && Math.abs(x) < 0.06) {
        if (Math.abs(x) < 0.008) return INK;
        if ((((z / 0.075) % 1) + 1) % 1 < 0.28) return INK;
      }
      // racing stripe with navy edging
      const sy = y - 0.04 * Math.min(1, Math.max(0, (z + 1) / 2));
      if (Math.abs(ny) < 0.7 && z > -3.2 && z < 1.5) {
        const d = Math.abs(sy - 0.06);
        if (d < 0.05) return CREAM;
        if (d < 0.068) return NAVY;
      }
      // panel seams
      const f = (z + 0.05) / 0.85;
      if (Math.abs(f - Math.round(f)) < 0.011 && z < 1.2 && z > -3.0) return "#b73a2a";
      return RED;
    }),
  );
  const fuse = b.loft(
    FUSE.map(([z, dy, w, h]) => ({ at: P([0, YC + dy, z]), w, h })),
    { bone: body, color: fusePaint, sides: 14, name: "fuselage" },
  );
  const skin = b.surface(fuse);

  // ======================================================== COWL, ENGINE, PROPELLER
  const COWL_Z = 1.3;
  const cowlPaint = cel(
    paint((p, n) => {
      const l = L(p);
      if (l.z > 1.42 && l.z < 1.5) return CREAM;
      if (l.z > 1.5 && l.z < 1.53) return NAVY;
      const ang = Math.atan2(l.x, l.y - YC);
      const k = (ang / (Math.PI * 2)) * 18;
      if (Ln(n).z < 0.4 && Math.abs(k - Math.round(k)) < 0.05 && l.z > 1.55 && l.z < 2.2) return "#1f8a86";
      return TEAL;
    }),
  );
  b.lathe(
    [
      [0, -0.05],
      [0.6, -0.05],
      [0.66, 0.12],
      [0.68, 0.4],
      [0.65, 0.7],
      [0.6, 0.9],
      [0.55, 1.0],
      [0.44, 1.03],
      [0.4, 0.94],
      [0.39, 0.6],
      [0, 0.6],
    ],
    { at: P([0, YC + 0.03, COWL_Z]), axis: D([0, 0, 1]), bone: body, color: cowlPaint, segments: 16, name: "cowl" },
  );
  // brass lip ring
  b.sweep(circle([0, YC + 0.03, COWL_Z + 1.02], 0.5, 0.5, 16).map((q) => P([q[0], q[1], q[2]])), 0.032, {
    bone: body,
    color: cBrass,
    sides: 6,
    name: "cowlLip",
  });
  // engine: dark bay, crankcase, nine cylinders
  const EZ = COWL_Z + 0.58;
  put(new THREE.CylinderGeometry(0.42, 0.42, 0.04, 16), "#2a2433", [0, YC + 0.03, EZ], { dir: [0, 0, 1], name: "engineBay" });
  put(new THREE.SphereGeometry(0.17, 8, 6), cSteel, [0, YC + 0.03, EZ + 0.12], { name: "crankcase" });
  const cyl: THREE.BufferGeometry[] = [];
  const capGeo: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const dx = Math.sin(a);
    const dy = Math.cos(a);
    const base = P([dx * 0.2, YC + 0.03 + dy * 0.2, EZ + 0.12]);
    const tip = P([dx * 0.37, YC + 0.03 + dy * 0.37, EZ + 0.1]);
    const axis = tip.clone().sub(base);
    const g = new THREE.CylinderGeometry(0.07, 0.06, axis.length(), 6, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
    const m = new THREE.Matrix4().compose(base.clone().add(tip).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1));
    cyl.push(g.applyMatrix4(m));
    const cap = new THREE.SphereGeometry(0.075, 6, 4);
    cap.translate(tip.x, tip.y, tip.z);
    capGeo.push(cap);
  }
  b.part(mergeGeometries(cyl)!, cSteel, { bone: body, at: [0, 0, 0], name: "cylinders" });
  b.part(mergeGeometries(capGeo)!, cBrass, { bone: body, at: [0, 0, 0], name: "cylinderCaps" });

  // cylinder-head bumps on the cowl (9 teal bulges)
  {
    const bumps: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const a = ((i + 0.5) / 9) * Math.PI * 2;
      const c = P([Math.sin(a) * 0.66, YC + 0.03 + Math.cos(a) * 0.66, COWL_Z + 0.55]);
      const g = new THREE.SphereGeometry(0.1, 6, 4);
      const q = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        D([Math.sin(a), Math.cos(a), 0]).normalize(),
      );
      g.scale(1, 1.25, 1.6);
      g.applyMatrix4(new THREE.Matrix4().compose(c, q, new THREE.Vector3(1, 1, 1)));
      bumps.push(g);
    }
    b.part(mergeGeometries(bumps)!, cel("#26a09b"), { bone: body, at: [0, 0, 0], name: "cowlBumps" });
  }

  // propeller + spinner
  const hub = P([0, YC + 0.03, COWL_Z + 1.28]);
  const prop = b.joint("propeller", { parent: body, at: hub, dir: D([0, 1, 0]), up: [-1, 0, 0], role: "hinge" });
  const fwd = D([0, 0, 1]);
  const upV = D([0, 1, 0]);
  put(new THREE.SphereGeometry(0.2, 10, 8), cBrass, [0, YC + 0.03, COWL_Z + 1.2], { bone: prop, scale: [1, 1, 1.05], name: "spinner" });
  put(new THREE.ConeGeometry(0.1, 0.22, 8), cBrass, [0, YC + 0.03, COWL_Z + 1.48], { bone: prop, dir: [0, 0, 1], name: "spinnerTip" });
  put(new THREE.CylinderGeometry(0.05, 0.07, 0.3, 8), cSteel, [0, YC + 0.03, COWL_Z + 1.0], { bone: prop, dir: [0, 0, 1], name: "shaft" });
  const bladePaint = cel(
    paint((_p, _n, s) => {
      const u = s[0];
      if (u > 0.82) return u > 0.9 ? MUSTARD : RED;
      if (u > 0.76) return CREAM;
      if (u < 0.3) return "#f3d07a";
      return WOOD;
    }),
  );
  for (const k of [1, -1]) {
    // blade outline: x runs along the blade (up/down the disc), y across it
    b.extrude(
      [
        [0.12, -0.07],
        [0.45, -0.17],
        [0.8, -0.2],
        [1.0, -0.14],
        [1.02, 0.02],
        [0.9, 0.13],
        [0.5, 0.12],
        [0.12, 0.06],
      ],
      {
        at: hub.clone().addScaledVector(fwd, -0.02),
        x: upV.clone().multiplyScalar(k).toArray(),
        y: [-k, 0, 0],
        thickness: [0.06, 0.035],
        bevel: 0.012,
        smoothing: 1,
        color: bladePaint,
        bone: prop,
        name: "blade",
      },
    );
  }
  put(new THREE.CylinderGeometry(0.17, 0.17, 0.06, 10), cBrass, [0, YC + 0.03, COWL_Z + 1.12], { bone: prop, dir: [0, 0, 1], name: "propFlange" });

  // exhaust pipes curling out of the cowl sides
  for (const s of [1, -1]) {
    const pts = [
      [s * 0.6, YC - 0.2, COWL_Z + 0.2],
      [s * 0.78, YC - 0.34, COWL_Z + 0.05],
      [s * 0.8, YC - 0.62, COWL_Z - 0.28],
      [s * 0.68, YC - 0.72, COWL_Z - 0.62],
    ];
    sw(pts, [0.06, 0.045], { color: cSteel, sides: 6, caps: "flat", name: "exhaust" });
    put(new THREE.CylinderGeometry(0.075, 0.06, 0.1, 6), cBrass, [s * 0.6, YC - 0.2, COWL_Z + 0.2], { dir: [s, -0.3, 0.6], name: "exhaustCollar" });
    put(new THREE.CylinderGeometry(0.058, 0.058, 0.04, 6), "#2a2433", [s * 0.68, YC - 0.72, COWL_Z - 0.64], { dir: [-0.1 * s, -0.1, -1], name: "exhaustMouth" });
    // lightning bolt on cowl side
    b.decal(b.surface(b.root), BOLT, { at: P([s * 0.67, YC + 0.05, COWL_Z + 0.5]), dir: D([s, 0, 0]), up: D([0, 1, 0]), size: [0.3, 0.5], mirror: s < 0, name: "bolt", bone: body });
  }

  // ======================================================== COCKPITS
  const COCK_F = -0.4;
  const COCK_R = -1.45;
  const leatherRim = cel(grain(LEATHER, "#8a4f2f", { size: 0.02, axis: "z" }));
  for (const [cz, rx, rz, name] of [
    [COCK_F, 0.31, 0.38, "cockpitF"],
    [COCK_R, 0.27, 0.36, "cockpitR"],
  ] as [number, number, number, string][]) {
    const top = deckY(cz);
    const loop = catmull(circle([0, top, cz], rx, rz, 14, 0.06).map((q) => P(q)), { closed: true });
    b.sweep(skin.drape(loop, { lift: 0.025 }), 0.055, { bone: body, color: leatherRim, sides: 6, name: `${name}Rim` });
    put(new THREE.SphereGeometry(1, 10, 6), "#3a2432", [0, top - 0.005, cz], { scale: [rx - 0.01, 0.07, rz - 0.01], name: `${name}Well` });
    // seat cushion
    put(new THREE.SphereGeometry(1, 8, 6), cRed, [0, top + 0.04, cz - 0.03], { scale: [rx * 0.8, 0.07, rz * 0.7], name: `${name}Seat` });
  }
  // headrest / turtledeck hump behind the pilot
  sw([[0, deckY(-1.75) - 0.02, -1.75], [0, deckY(-2.35) + 0.12, -2.35], [0, deckY(-3.0) + 0.05, -3.0]], [0.22, 0.02], {
    color: fusePaint,
    sides: 10,
    caps: "round",
    name: "turtledeck",
  });
  // cowl deck / front hump
  sw([[0, deckY(0.2) - 0.03, 0.2], [0, deckY(0.9) + 0.06, 0.9], [0, deckY(1.35) + 0.08, 1.35]], [0.3, 0.46], {
    color: fusePaint,
    sides: 12,
    caps: "round",
    name: "frontDeck",
  });
  // windscreens
  for (const [wz, ww, wname] of [
    [-0.06, 0.3, "windscreenF"],
    [-1.08, 0.26, "windscreenR"],
  ] as [number, number, string][]) {
    const top = deckY(wz) + 0.08;
    b.extrude(
      [
        [-ww, 0],
        [ww, 0],
        [ww * 0.78, 0.34],
        [-ww * 0.78, 0.34],
      ],
      {
        at: P([0, top, wz]),
        x: [1, 0, 0],
        y: D([0, 0.93, -0.36]).toArray(),
        thickness: 0.018,
        bevel: 0.006,
        color: SKY,
        bone: body,
        name: wname,
      },
    );
    b.extrude(
      [
        [-ww - 0.03, -0.03],
        [ww + 0.03, -0.03],
        [ww + 0.03, 0.02],
        [-ww - 0.03, 0.02],
      ],
      { at: P([0, top, wz]), x: [1, 0, 0], y: D([0, 0.93, -0.36]).toArray(), thickness: 0.05, color: cBrass, bone: body, name: `${wname}Frame` },
    );
  }

  // ======================================================== WINGS
  const wingPaint = (upper: boolean) =>
    cel(
      paint((p, n) => {
        const l = L(p);
        const x = l.x;
        const ax = Math.abs(x);
        const half = upper ? HALF_U : HALF_L;
        const zc = upper ? ZC_U : ZC_L;
        const rx = upper ? rxU(x) : rxL(x);
        const top = Ln(n).y > 0;
        // red tips with a toothed edge
        if (ax > half - 0.85 + 0.1 * zigzag(l.z / 0.2)) return RED;
        // leading-edge binding
        if (l.z - zc > rx * 0.8) return RED;
        // walkways on the lower wing root
        if (!upper && top && ax < 1.3 && ax > 0.55 && l.z > zc - 0.45 && l.z < zc + 0.45) {
          if (ax < 0.6 || ax > 1.25 || l.z < zc - 0.4 || l.z > zc + 0.4) return CREAM;
          return (((ax / 0.07) % 1) + 1) % 1 < 0.5 ? NAVY : "#3d5a94";
        }
        // rib tapes with stitches
        const f = ax / 0.52;
        const d = Math.abs(f - Math.round(f)) * 0.52;
        if (ax > 0.5 && d < 0.027) {
          if (d < 0.006 && (((l.z / 0.07) % 1) + 1) % 1 < 0.5) return NAVY;
          return CREAM;
        }
        return MUSTARD;
      }),
    );
  const wingUpper = b.sweep(
    [-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map((k) => P([k * HALF_U, Y_U, ZC_U])),
    (t) => {
      const x = (t * 2 - 1) * HALF_U;
      return [rxU(x), ryU(x)];
    },
    { bone: body, color: wingPaint(true), sides: 12, up: D([0, 1, 0]), name: "wingUpper" },
  );
  const wingLower = b.sweep(
    [-1, -0.66, -0.33, 0, 0.33, 0.66, 1].map((k) => P([k * HALF_L, yL(k * HALF_L), ZC_L])),
    (t) => {
      const x = (t * 2 - 1) * HALF_L;
      return [rxL(x), ryL(x)];
    },
    { bone: body, color: wingPaint(false), sides: 12, up: D([0, 1, 0]), name: "wingLower" },
  );
  // sunburst smiley on top of the upper wing, hearts under the tips
  b.decal(wingUpper, SUN, { at: P([1.9, Y_U + 0.12, ZC_U]), dir: D([0, 1, 0]), up: D([0, 0, 1]), size: [1.1, 1.1], mirror: true, name: "sunDecalL", bone: body });
  b.decal(wingUpper, SUN, { at: P([-1.9, Y_U + 0.12, ZC_U]), dir: D([0, 1, 0]), up: D([0, 0, 1]), size: [1.1, 1.1], mirror: true, name: "sunDecalR", bone: body });
  // ailerons (hinged, red with cream stripes)
  const ailPaint = cel(
    paint((_p, _n, s) => {
      const u = s[0];
      const v = s[1];
      if (v < 0.03) return NAVY;
      const f = ((u / 0.22) % 1 + 1) % 1;
      return f < 0.5 ? RED : CREAM;
    }),
  );
  const ailerons: Record<string, J> = {};
  for (const [tag, y0, zc, rxf, ryf, x0, x1] of [
    ["U", Y_U, ZC_U, rxU, ryU, 2.55, 4.12],
    ["L", Y_L, ZC_L, rxL, ryL, 2.2, 3.65],
  ] as [string, number, number, (x: number) => number, (x: number) => number, number, number][]) {
    for (const s of [1, -1]) {
      const hx = x0 * s;
      const rxm = rxf((x0 + x1) / 2);
      const hz = zc - rxm * 0.55;
      const hy = tag === "U" ? y0 : yL(hx) + 0.01;
      const j = b.joint(`aileron${tag}${s > 0 ? "L" : "R"}`, { parent: body, at: P([hx, hy, hz]), dir: D([0, 0, -1]), role: "hinge" });
      ailerons[`${tag}${s}`] = j;
      const len = (x1 - x0) * 1.0;
      const depth = rxm * 0.45 + 0.2;
      b.extrude(
        [
          [0, -0.1],
          [len, -0.1],
          [len, 0.04 + depth * 0.55],
          [len - 0.15, depth * 0.95],
          [len * 0.5, depth],
          [0.08, depth * 0.95],
          [0, depth * 0.6],
        ],
        {
          at: P([hx, hy + (tag === "U" ? 0 : 0), hz]),
          x: D([s, 0, 0]).toArray(),
          y: D([0, 0, -1]).toArray(),
          thickness: 0.05,
          bevel: 0.015,
          smoothing: 1,
          color: ailPaint,
          bone: j,
          name: `aileron${tag}`,
        },
      );
      // hinge pin
      b.rod(P([hx, hy, hz]), P([hx + s * len, hy, hz]), 0.018, { color: cBrass, bone: j, sides: 5, name: "aileronPin" });
    }
  }
  // wing-tip lamps (red / teal navigation glows) and small wing tip pennants
  for (const s of [1, -1]) {
    const lamp = s > 0 ? "#ff5a4a" : "#3cf0c8";
    glow(put(new THREE.SphereGeometry(0.075, 6, 4), lamp, [s * (HALF_U + 0.07), Y_U, ZC_U], { name: "navLamp" }), 1.4);
    put(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 5), STEEL, [s * (HALF_U - 0.02), Y_U + 0.35, ZC_U - 0.3], { name: "pennantPole" });
    b.extrude(
      [
        [0, 0],
        [0.42, 0.07],
        [0.0, 0.15],
        [0.0, 0.07],
      ],
      {
        at: P([s * (HALF_U - 0.02), Y_U + 0.5, ZC_U - 0.3]),
        x: D([0, 0, -1]).toArray(),
        y: D([0, 1, 0]).toArray(),
        thickness: 0.008,
        color: s > 0 ? cRed : cTeal,
        bone: body,
        name: "pennant",
      },
    );
    // landing lamp in the lower wing leading edge
    const lx = s * 1.5;
    put(new THREE.CylinderGeometry(0.1, 0.12, 0.1, 10), cBrass, [lx, yL(lx) + 0.0, ZC_L + rxL(lx) + 0.02], { dir: [0, 0.05, 1], name: "lampHousing" });
    glow(put(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 10), "#fff2a8", [lx, yL(lx), ZC_L + rxL(lx) + 0.08], { dir: [0, 0.05, 1], name: "lampLens" }), 1.5);
  }

  // ======================================================== STRUTS & WIRES
  const wireC = "#4a4252";
  for (const s of [1, -1]) {
    const xs = s * 2.5;
    const lowY = yL(xs) + ryL(xs) * 0.8;
    const upY = Y_U - ryU(xs) * 0.8;
    const zlF = ZC_L + rxL(xs) * 0.35;
    const zuF = ZC_U + rxU(xs) * 0.35;
    const zlR = ZC_L - rxL(xs) * 0.45;
    const zuR = ZC_U - rxU(xs) * 0.45;
    strut([xs, lowY, zlF], [xs, upY, zuF], 0.026, 0.065);
    strut([xs, lowY, zlR], [xs, upY, zuR], 0.026, 0.065);
    // brass sleeves + eyelets
    for (const [yy, zz] of [
      [lowY, zlF],
      [upY, zuF],
      [lowY, zlR],
      [upY, zuR],
    ]) {
      put(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 8), cBrass, [xs, yy + (yy === lowY ? 0.06 : -0.06), zz], { name: "strutFitting" });
    }
    // cabane struts
    for (const [zf, zu, name] of [
      [1.25, 1.25, "cabaneF"],
      [0.55, 0.55, "cabaneR"],
    ] as [number, number, string][]) {
      const xb = s * 0.34;
      const xt = s * 0.72;
      b.sweep([P([xb, deckY(zf) - 0.1, zf]), P([xt, Y_U - 0.1, zu])], () => [0.03, 0.055], { bone: body, color: cWood, caps: "flat", sides: 8, name });
      put(new THREE.CylinderGeometry(0.055, 0.055, 0.06, 8), cBrass, [xt, Y_U - 0.12, zu], { name: "cabaneFitting" });
    }
    // flying wires (X braces in front view)
    for (const [zl, zu, nm] of [
      [zlF, 1.25, "wireF"],
      [zlR, 0.55, "wireR"],
    ] as [number, number, string][]) {
      wp([xs, lowY + 0.02, zl], [s * 0.72, Y_U - 0.14, zu], 0.011, wireC, { name: nm });
      wp([xs, upY - 0.02, zl + 0.3], [s * 0.4, deckY(zu) - 0.1, zu], 0.011, wireC, { name: `${nm}2` });
    }
    // pitot tube on left upper strut
    if (s > 0) {
      wp([xs, upY - 0.25, zuF + 0.04], [xs, upY - 0.25, zuF + 0.46], 0.016, cBrass, { name: "pitot", caps: "round" });
    }
    // wing-to-wing outer struts: small tip struts
    const xt2 = s * 3.75;
    const lowY2 = yL(xt2) + ryL(xt2) * 0.6;
    const upY2 = Y_U - ryU(xt2) * 0.8;
    strut([xt2, lowY2, ZC_L + rxL(xt2) * 0.1], [xt2, upY2, ZC_U + rxU(xt2) * 0.1], 0.02, 0.05);
  }

  // ======================================================== BUNTING along the upper leading edge
  {
    const rn = rng(11);
    const hits: ReturnType<typeof b.sweep>[] = [];
    void hits;
    const frames: number[][] = [];
    for (const s of [1, -1]) {
      const anchors = [0.55, 1.5, 2.5, 3.4, 4.05].map((a) => a * s);
      const pts: number[][] = anchors.map((x) => [x, Y_U - 0.03, ZC_U + rxU(x) + 0.03]);
      // sag between anchors
      const dense: number[][] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        for (let k = 0; k < 6; k++) {
          const t = k / 6;
          const sag = Math.sin(Math.PI * t) * 0.17;
          dense.push([lerpN(pts[i][0], pts[i + 1][0], t), lerpN(pts[i][1], pts[i + 1][1], t) - sag, lerpN(pts[i][2], pts[i + 1][2], t) + 0.05 + sag * 0.25]);
        }
      }
      dense.push(pts[pts.length - 1]);
      sw(dense, 0.007, { color: "#4a4252", sides: 4, name: "buntingLine", caps: "none" });
      for (let i = 0; i < pts.length - 1; i++) {
        for (let k = 1; k < 6; k += 2) {
          const q = dense[i * 6 + k];
          frames.push([q[0], q[1], q[2]]);
        }
      }
    }
    for (let i = 0; i < FLAGS.length; i++) {
      const mine = frames.filter((_f, idx) => idx % FLAGS.length === i);
      void rn;
      b.cards(
        mine.map((q) => ({ at: P(q), quat: undefined })).map((_o, idx) => ({ ...(b.along as unknown as object) }) && (() => {
          const w = P(mine[idx]);
          return w;
        })()).map((w, idx) => {
          void idx;
          return makeFrame(w);
        }),
        FLAGS[i],
        { size: [0.2, 0.26], lean: 180, flow: [0, 0, 1], bone: body, cross: false },
      );
    }
  }
  function makeFrame(w: THREE.Vector3) {
    return frameUp(w);
  }

  // ======================================================== TAIL
  const finPaint = cel(
    paint((_p, _n, s) => {
      if (s[0] < 0.0) return NAVY;
      return TEAL;
    }),
  );
  b.extrude(
    [
      [0, 0],
      [0.64, 0],
      [0.64, 0.95],
      [0.34, 1.02],
      [0.1, 0.62],
    ],
    {
      at: P([0, YC + 0.08, -2.6]),
      x: D([0, 0, -1]).toArray(),
      y: D([0, 1, 0]).toArray(),
      thickness: 0.07,
      bevel: 0.022,
      smoothing: 1,
      color: finPaint,
      bone: body,
      name: "fin",
    },
  );
  const rudderPaint = cel(
    paint((_p, _n, s) => {
      const f = (((s[1] + 0.2) / 0.3) % 1 + 1) % 1;
      if (s[0] < 0.04) return NAVY;
      return f < 0.34 ? RED : f < 0.67 ? CREAM : NAVY;
    }),
  );
  const RZ = -3.24;
  const rudder = b.joint("rudder", { parent: body, at: P([0, YC + 0.1, RZ]), dir: D([0, 0, -1]), up: [-1, 0, 0], role: "hinge" });
  b.extrude(
    [
      [0, -0.2],
      [0.38, -0.16],
      [0.52, 0.12],
      [0.54, 0.5],
      [0.48, 0.82],
      [0.28, 1.0],
      [0, 0.96],
    ],
    {
      at: P([0, YC + 0.1, RZ]),
      x: D([0, 0, -1]).toArray(),
      y: D([0, 1, 0]).toArray(),
      thickness: 0.06,
      bevel: 0.02,
      smoothing: 1,
      color: rudderPaint,
      bone: rudder,
      name: "rudder",
    },
  );
  for (const s of [1, -1]) {
    put(new THREE.CircleGeometry(0.17, 10), "#ffffff", [s * 0.035, YC + 0.56, RZ - 0.26], { bone: rudder, dir: [s, 0, 0], axis: "z", texture: HEART, name: "rudderHeart" });
  }
  b.rod(P([0, YC + 0.1, RZ + 0.06]), P([0, YC + 1.06, RZ + 0.06]), 0.016, { color: cBrass, bone: rudder, sides: 5, name: "rudderPin" });
  // stabilisers + elevators
  const stabPaint = cel(
    paint((_p, _n, s) => {
      if (s[0] > 1.15 + 0.07 * zigzag(s[1] / 0.15)) return RED;
      return MUSTARD;
    }),
  );
  const elevPaint = cel(
    paint((_p, _n, s) => {
      if (s[1] < 0.03) return NAVY;
      return (((s[0] / 0.2) % 1 + 1) % 1) < 0.5 ? RED : CREAM;
    }),
  );
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0, 0],
        [1.1, 0.04],
        [1.55, 0.2],
        [1.6, 0.42],
        [1.38, 0.6],
        [0, 0.6],
      ],
      {
        at: P([0, YC + 0.08, -2.72]),
        x: D([s, 0, 0]).toArray(),
        y: D([0, 0, -1]).toArray(),
        thickness: 0.07,
        bevel: 0.02,
        smoothing: 1,
        color: stabPaint,
        bone: body,
        name: "stabilizer",
      },
    );
    const el = b.joint(`elevator${s > 0 ? "L" : "R"}`, { parent: body, at: P([s * 0.08, YC + 0.08, -3.32]), dir: D([0, 0, -1]), role: "hinge" });
    b.extrude(
      [
        [0, -0.04],
        [1.45, -0.04],
        [1.55, 0.12],
        [1.48, 0.34],
        [1.15, 0.52],
        [0.0, 0.46],
      ],
      {
        at: P([s * 0.08, YC + 0.08, -3.32]),
        x: D([s, 0, 0]).toArray(),
        y: D([0, 0, -1]).toArray(),
        thickness: 0.055,
        bevel: 0.018,
        smoothing: 1,
        color: elevPaint,
        bone: el,
        name: "elevator",
      },
    );
    // tail braces
    wp([s * 0.12, YC - 0.1, -3.0], [s * 0.85, YC + 0.07, -2.82], 0.022, cWood, { name: "tailBrace", sides: 6 });
    wp([s * 0.06, YC + 0.9, -2.95], [s * 1.0, YC + 0.1, -2.9], 0.01, wireC, { name: "tailWire" });
  }

  // ======================================================== LANDING GEAR
  const AX = 0.98;
  const AY = 0.55;
  const AZ = 1.25;
  const tireProfile: [number, number][] = [
    [0.0, -0.13],
    [0.36, -0.13],
    [0.48, -0.11],
    [0.55, -0.06],
    [0.56, 0],
    [0.55, 0.06],
    [0.48, 0.11],
    [0.36, 0.13],
    [0.0, 0.13],
  ];
  const treadPaint = cel(
    paint((p, _n, s) => {
      const ang = Math.atan2(p.y - AY, p.z - AZ);
      const blk = ((ang / (Math.PI * 2)) * 24) % 1;
      const rim = Math.abs(s[0]) < 0.04;
      void rim;
      return (blk + 1) % 1 < 0.5 ? TIRE : "#4b4259";
    }),
  );
  const tireJoints: Record<number, J> = {};
  for (const s of [1, -1]) {
    const w = b.joint(`wheel${s > 0 ? "L" : "R"}`, { parent: body, at: [s * AX, AY, AZ], dir: [0, 1, 0], role: "hinge" });
    tireJoints[s] = w;
    b.lathe(tireProfile, { at: [s * AX, AY, AZ], axis: [s, 0, 0], bone: w, color: treadPaint, segments: 16, smoothing: 1, name: "tire" });
    b.part(new THREE.CircleGeometry(0.34, 14), "#ffffff", {
      at: [s * (AX + 0.138), AY, AZ],
      dir: [s, 0, 0],
      axis: "z",
      bone: w,
      texture: HUB,
      name: "hubFace",
    });
    b.part(new THREE.SphereGeometry(0.09, 6, 4), cBrass, { at: [s * (AX + 0.17), AY, AZ], bone: w, scale: [0.6, 1, 1], name: "hubCap" });
  }
  // axle fairing
  b.rod([-AX, AY, AZ], [AX, AY, AZ], 0.05, { bone: body, color: cSteel, sides: 6, name: "axle" });
  for (const s of [1, -1]) {
    const axle: number[] = [s * AX, AY, AZ];
    const hip1 = P([s * 0.42, YC - 0.5, 0.85]);
    const hip2 = P([s * 0.46, YC - 0.5, 0.05]);
    b.sweep([hip1, new THREE.Vector3(...axle)], 0.05, { bone: body, color: cSteel, sides: 6, caps: "round", name: "gearFront" });
    b.sweep([hip2, new THREE.Vector3(...axle)], 0.045, { bone: body, color: cSteel, sides: 6, caps: "round", name: "gearRear" });
    // oleo sleeve + brass collar
    const sleeve = new THREE.Vector3().lerpVectors(hip1, new THREE.Vector3(...axle), 0.35);
    const dirv = new THREE.Vector3(...axle).sub(hip1).normalize();
    b.part(new THREE.CylinderGeometry(0.085, 0.085, 0.3, 8), cCream, { at: sleeve, dir: dirv, bone: body, name: "oleoSleeve" });
    const col = new THREE.Vector3().lerpVectors(hip1, new THREE.Vector3(...axle), 0.52);
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8), cBrass, { at: col, dir: dirv, bone: body, name: "gearCollar" });
    // cross wire from wheel to opposite fuselage belly
    b.part(new THREE.SphereGeometry(0.08, 6, 4), cBrass, { at: hip1, bone: body, name: "gearKnuckle" });
  }
  // tail wheel on a leaf spring
  const tw = new THREE.Vector3(0, 0.15, -3.3);
  const tailJ = b.joint("tailWheel", { parent: body, at: tw, dir: [0, 1, 0], role: "hinge" });
  b.sweep([P([0, YC - 0.14, -3.0]), P([0, YC - 0.32, -3.15]), new THREE.Vector3(0, 0.46, -3.28)], [0.04, 0.03], { bone: body, color: cSteel, sides: 6, caps: "round", name: "tailSpring" });
  b.lathe(
    [
      [0, -0.05],
      [0.1, -0.05],
      [0.15, -0.03],
      [0.16, 0],
      [0.15, 0.03],
      [0.1, 0.05],
      [0, 0.05],
    ],
    { at: tw, axis: [1, 0, 0], bone: tailJ, color: cTire, segments: 10, name: "tailTire" },
  );
  b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 6), cBrass, { at: tw, dir: [1, 0, 0], bone: tailJ, name: "tailHub" });
  b.part(new THREE.BoxGeometry(0.16, 0.2, 0.05), cSteel, { at: new THREE.Vector3(0, 0.3, -3.26), bone: body, name: "tailFork" });

  // ======================================================== DECALS
  for (const s of [1, -1]) {
    b.decal(fuse, NAME_PLATE, { at: P([s * 0.4, YC + 0.0, -2.0]), dir: D([s, 0, 0]), up: D([0, 1, 0]), size: [1.2, 0.4], mirror: false, name: "namePlate", bone: body });
    b.decal(fuse, NUMBER, { at: P([s * 0.2, YC + 0.02, -2.78]), dir: D([s, 0, 0]), up: D([0, 1, 0]), size: [0.24, 0.24], name: "numberRoundel", bone: body });
  }

  // ======================================================== BRASS RIVET ROWS
  {
    const pts: number[][] = [];
    for (let z = -2.9; z < 1.35; z += 0.17) {
      for (const s of [1, -1]) {
        const f = fuseAt(z);
        const x = (s * f.w) / 2;
        pts.push([x * 0.999, YC + f.dy - f.h * 0.12, z]);
      }
    }
    const surf = skin;
    const hs: THREE.BufferGeometry[] = [];
    for (const q of pts) {
      const w = P(q);
      const h = surf.nearest(w);
      hs.push(new THREE.SphereGeometry(0.014, 5, 3).translate(h.at.x + h.n.x * 0.004, h.at.y + h.n.y * 0.004, h.at.z + h.n.z * 0.004));
    }
    b.part(mergeGeometries(hs)!, cBrass, { bone: body, at: [0, 0, 0], name: "fuseRivets" });
  }

  // ======================================================== PILOT
  const PZ = COCK_R;
  const pilotHead = b.joint("pilotHead", { parent: body, at: P([0, YC + 0.98, PZ]), dir: D([0, 1, 0]), role: "head" });
  const hc = [0, YC + 1.18, PZ + 0.02];
  const jacket = cel("#3f6bb3");
  // torso
  sw([[0, deckY(PZ) - 0.05, PZ - 0.02], [0, YC + 0.78, PZ + 0.0]], 0.25, { color: jacket, sides: 8, caps: "round", name: "pilotTorso" });
  // fur collar
  put(new THREE.TorusGeometry(0.24, 0.08, 6, 10), cCream, [0, YC + 0.92, PZ], { rot: [90, 0, 0], name: "furCollar" });
  // head
  ball(0.26, cSkin, hc, [1, 1.04, 1], { bone: pilotHead, name: "pilotSkull" });
  ball(0.075, cPink, [0, hc[1] - 0.04, hc[2] + 0.255], [1, 0.9, 0.9], { bone: pilotHead, name: "pilotNose" });
  for (const s of [1, -1]) {
    ball(0.058, cWhite, [s * 0.1, hc[1] + 0.05, hc[2] + 0.225], [1, 1.15, 0.5], { bone: pilotHead, name: "pilotEye" });
    ball(0.032, INK, [s * 0.1, hc[1] + 0.045, hc[2] + 0.245], [1, 1.2, 0.5], { bone: pilotHead, name: "pilotPupil" });
    ball(0.1, cPink, [s * 0.17, hc[1] - 0.08, hc[2] + 0.18], [0.9, 0.7, 0.35], { bone: pilotHead, name: "pilotCheek" });
    ball(0.075, cSkin, [s * 0.25, hc[1] - 0.01, hc[2] - 0.01], [0.35, 1.0, 0.8], { bone: pilotHead, name: "pilotEar" });
    // mustache: swirly capsules
    b.sweep(
      [P([0, hc[1] - 0.115, hc[2] + 0.245]), P([s * 0.1, hc[1] - 0.135, hc[2] + 0.225]), P([s * 0.2, hc[1] - 0.12, hc[2] + 0.17]), P([s * 0.27, hc[1] - 0.07, hc[2] + 0.12])],
      [0.04, 0.012],
      { bone: pilotHead, color: cLeatherD, sides: 5, caps: "round", name: "mustache" },
    );
    // brows
    b.sweep([P([s * 0.04, hc[1] + 0.14, hc[2] + 0.22]), P([s * 0.15, hc[1] + 0.17, hc[2] + 0.19])], 0.016, { bone: pilotHead, color: cLeatherD, sides: 4, name: "pilotBrow" });
    // earflaps
    ball(0.1, cLeather, [s * 0.27, hc[1] - 0.02, hc[2] - 0.0], [0.4, 1.3, 0.9], { bone: pilotHead, name: "earFlap" });
  }
  // smile
  b.sweep([P([-0.07, hc[1] - 0.18, hc[2] + 0.2]), P([0, hc[1] - 0.205, hc[2] + 0.225]), P([0.07, hc[1] - 0.18, hc[2] + 0.2])], 0.012, { bone: pilotHead, color: INK, sides: 4, name: "smile" });
  // leather cap dome
  put(new THREE.SphereGeometry(0.29, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), cLeather, [0, hc[1] + 0.04, hc[2] - 0.02], { bone: pilotHead, name: "cap" });
  put(new THREE.TorusGeometry(0.3, 0.025, 5, 14), cLeatherD, [0, hc[1] + 0.13, hc[2] - 0.02], { bone: pilotHead, rot: [90, 0, 0], name: "capBand" });
  // goggles pushed up on the cap
  for (const s of [1, -1]) {
    put(new THREE.CylinderGeometry(0.095, 0.095, 0.07, 10), cBrass, [s * 0.115, hc[1] + 0.2, hc[2] + 0.2], { bone: pilotHead, dir: [0, 0.35, 1], name: "gogRim" });
    put(new THREE.CylinderGeometry(0.072, 0.072, 0.08, 10), SKY, [s * 0.115, hc[1] + 0.205, hc[2] + 0.205], { bone: pilotHead, dir: [0, 0.35, 1], name: "gogLens" });
  }
  put(new THREE.BoxGeometry(0.06, 0.04, 0.03), cBrass, [0, hc[1] + 0.2, hc[2] + 0.24], { bone: pilotHead, name: "gogBridge" });
  b.sweep(catmull(circle([0, hc[1] + 0.17, hc[2]], 0.285, 0.275, 12).map((q) => P(q)), { closed: true }), 0.022, { bone: pilotHead, color: cLeatherD, sides: 5, name: "gogStrap" });

  // waving left arm (chain) + right arm resting on the rim
  const shoulderL = [0.26, YC + 0.72, PZ];
  const armL = b.chain(
    "pilotArm",
    catmull([shoulderL, [0.46, YC + 0.88, PZ + 0.1], [0.58, YC + 1.2, PZ + 0.08], [0.6, YC + 1.45, PZ + 0.1]].map((q) => P(q))),
    { parent: body, names: ["upperArmL", "forearmL", "handL"], role: "arm" },
  );
  b.sweep(armL, 0.085, { color: jacket, sides: 7, name: "pilotArmTube" });
  put(new THREE.SphereGeometry(0.12, 8, 6), cCream, [0.6, YC + 1.5, PZ + 0.1], { bone: armL.tip ?? armL.joints[armL.joints.length - 1], scale: [1, 1.15, 0.8], name: "pilotGlove" });
  put(new THREE.SphereGeometry(0.045, 6, 4), cCream, [0.5, YC + 1.5, PZ + 0.1], { bone: armL.tip ?? armL.joints[armL.joints.length - 1], name: "gloveThumb" });
  sw([[-0.26, YC + 0.72, PZ], [-0.45, YC + 0.58, PZ + 0.2], [-0.34, deckY(PZ) + 0.12, PZ + 0.5]], 0.085, { color: jacket, sides: 7, name: "pilotArmR" });
  ball(0.11, cCream, [-0.32, deckY(PZ) + 0.12, PZ + 0.52], [1, 0.8, 1], { name: "pilotGloveR" });

  // scarf: ribbon chain streaming back
  const scarfPts = [
    [0, YC + 0.9, PZ - 0.15],
    [0, YC + 1.0, PZ - 0.6],
    [0.1, YC + 0.92, PZ - 1.1],
    [-0.05, YC + 1.04, PZ - 1.65],
    [0.05, YC + 0.98, PZ - 2.2],
  ];
  const scarf = b.chain("scarf", catmull(scarfPts.map((q) => P(q))), { parent: body, count: 4, role: "tail" });
  const scarfPaint = cel(
    paint((_p, _n, s) => {
      const f = (((s[0] * 11) % 1) + 1) % 1;
      return f < 0.5 ? RED : CREAM;
    }),
  );
  b.sweep(scarf, (t) => [0.1 + 0.03 * t, 0.012], { color: scarfPaint, sides: 6, caps: "point", name: "scarfRibbon" });
  put(new THREE.TorusGeometry(0.2, 0.055, 6, 10), cRed, [0, YC + 0.88, PZ - 0.03], { rot: [90, 0, 0], name: "scarfKnot" });

  // ======================================================== DOG PASSENGER
  const DZ = COCK_F;
  const dogHead = b.joint("dogHead", { parent: body, at: P([0, YC + 0.9, DZ]), dir: D([0, 1, 0]), role: "head" });
  const dc = [0, YC + 1.02, DZ + 0.02];
  sw([[0, deckY(DZ) - 0.05, DZ - 0.04], [0, YC + 0.72, DZ]], 0.22, { color: cGolden, sides: 8, caps: "round", name: "dogBody" });
  ball(0.17, cCream, [0, YC + 0.66, DZ + 0.16], [1, 1.1, 0.6], { name: "dogBib" });
  put(new THREE.TorusGeometry(0.2, 0.06, 6, 10), cTeal, [0, YC + 0.82, DZ + 0.02], { rot: [90, 0, 0], name: "dogCollar" });
  ball(0.23, cGolden, dc, [1.05, 1, 1], { bone: dogHead, name: "dogSkull" });
  ball(0.13, cCream, [0, dc[1] - 0.08, dc[2] + 0.2], [1, 0.8, 1.15], { bone: dogHead, name: "dogMuzzle" });
  ball(0.055, INK, [0, dc[1] - 0.03, dc[2] + 0.36], [1.2, 0.85, 0.9], { bone: dogHead, name: "dogNose" });
  ball(0.05, cPink, [0.02, dc[1] - 0.2, dc[2] + 0.28], [0.8, 0.35, 1.3], { bone: dogHead, name: "dogTongue" });
  for (const s of [1, -1]) {
    ball(0.055, INK, [s * 0.1, dc[1] + 0.07, dc[2] + 0.2], [1, 1.2, 0.6], { bone: dogHead, name: "dogEye" });
    ball(0.018, WHITE, [s * 0.09, dc[1] + 0.1, dc[2] + 0.235], undefined, { bone: dogHead, name: "dogGlint" });
    ball(0.04, cLeather, [s * 0.09, dc[1] + 0.17, dc[2] + 0.2], [1.3, 0.5, 0.6], { bone: dogHead, name: "dogBrow" });
    // floppy ears blowing back
    b.sweep([P([s * 0.19, dc[1] + 0.12, dc[2] - 0.03]), P([s * 0.32, dc[1] + 0.06, dc[2] - 0.16]), P([s * 0.34, dc[1] + 0.08, dc[2] - 0.42])], (t) => [0.075 - 0.035 * t, 0.018], {
      bone: dogHead,
      color: cLeather,
      sides: 6,
      caps: "round",
      name: "dogEar",
    });
    // paws on the coaming
    ball(0.09, cCream, [s * 0.2, deckY(DZ) + 0.1, DZ + 0.33], [1, 0.75, 1.2], { name: "dogPaw" });
    sw([[s * 0.17, YC + 0.6, DZ + 0.08], [s * 0.22, deckY(DZ) + 0.13, DZ + 0.3]], 0.065, { color: cGolden, sides: 6, name: "dogArm" });
    // goggles on forehead
    put(new THREE.CylinderGeometry(0.075, 0.075, 0.06, 8), cBrass, [s * 0.09, dc[1] + 0.2, dc[2] + 0.12], { bone: dogHead, dir: [0, 0.5, 1], name: "dogGogRim" });
    put(new THREE.CylinderGeometry(0.056, 0.056, 0.07, 8), SKY, [s * 0.09, dc[1] + 0.205, dc[2] + 0.125], { bone: dogHead, dir: [0, 0.5, 1], name: "dogGogLens" });
  }
  b.sweep(catmull(circle([0, dc[1] + 0.13, dc[2]], 0.235, 0.225, 12).map((q) => P(q)), { closed: true }), 0.02, { bone: dogHead, color: cLeatherD, sides: 5, name: "dogGogStrap" });
  // control stick in front cockpit and rear
  for (const cz of [COCK_F + 0.18, COCK_R + 0.2]) {
    wp([0, deckY(cz) - 0.02, cz], [0, deckY(cz) + 0.36, cz - 0.04], 0.016, cSteel, { name: "stick" });
    ball(0.04, cRed, [0, deckY(cz) + 0.4, cz - 0.04], undefined, { name: "stickKnob" });
  }

  // ---- hood ornament: a little brass bird on the cowl
  ball(0.045, cBrass, [0, YC + 0.78, COWL_Z + 0.3], [1, 1, 1.4], { name: "hoodOrnament" });
  put(new THREE.ConeGeometry(0.03, 0.12, 5), cBrass, [0, YC + 0.79, COWL_Z + 0.4], { dir: [0, 0, 1], name: "hoodBeak" });

  return b.root;
}

// ---------------------------------------------------------------- tiny frame helper for bunting cards
import { frame } from "../../../../src/frame";
function frameUp(w: THREE.Vector3) {
  return frame(w, [0, 1, 0]);
}
