import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import type { Joint } from "../src/skeleton";
import { catmull, polyline } from "../src/path";
import { noise, paint } from "../src/paint";
import type { Paint } from "../src/paint";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Chunky Cartoon Tank",
  description:
    "A squat, grinning toy tank in low-poly whimsical style: googly headlamp eyes, a cartoon grin on the glacis, fat barrel with candy rings, a waving commander in the hatch, and a fender full of silly stowage.",
  style: "low-poly whimsical mix",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------- palette
const GREEN = "#7cb342";
const GREEN_L = "#9ccc54";
const GREEN_D = "#558b2f";
const GREEN_DD = "#3e6b25";
const ORANGE = "#ff8f2b";
const ORANGE_D = "#e5701a";
const CREAM = "#fff1c9";
const RED = "#e5483b";
const RED_D = "#b3342b";
const YELLOW = "#ffd23f";
const BLUE = "#3f86c8";
const BLUE_L = "#8fdcff";
const STEEL = "#9aa6b5";
const STEEL_D = "#5f6b7a";
const DARK = "#2b2a36";
const BELT = "#36292b";
const CLEAT = "#6b5649";
const TIRE = "#4d3f4a";
const WOOD = "#9a6a3f";
const WOOD_D = "#6e4a2b";
const KHAKI = "#d9b45f";
const KHAKI_D = "#b8913f";
const SKIN = "#f7c79b";
const PINK = "#ff9a9a";
const WHITE = "#ffffff";
const SMOKE = "#eef2f6";
const SMOKE_D = "#dde5ec";
const MUD = "#7b5a3b";
const GREEN_STEM = "#4f9a3c";

// ---------------------------------------------------------------- textures
const starPoints = (cx: number, cy: number, ro: number, ri: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? ro : ri;
    return `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
  }).join(" ");

const STAR = svg(
  `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="${RED}" stroke="${CREAM}" stroke-width="6"/>` +
    `<polygon points="${starPoints(50, 53, 34, 14)}" fill="${CREAM}" stroke="${DARK}" stroke-width="3" stroke-linejoin="round"/></svg>`,
  { size: 256 },
);

const GRIN = svg(
  `<svg viewBox="0 0 160 64"><defs><clipPath id="m"><path d="M8 12 Q80 8 152 12 Q142 58 80 58 Q18 58 8 12Z"/></clipPath></defs>` +
    `<path d="M8 12 Q80 8 152 12 Q142 58 80 58 Q18 58 8 12Z" fill="${DARK}"/>` +
    `<g clip-path="url(#m)"><ellipse cx="80" cy="56" rx="32" ry="16" fill="${PINK}"/>` +
    `<g fill="${CREAM}" stroke="${DARK}" stroke-width="2"><rect x="14" y="6" width="22" height="22" rx="5"/><rect x="40" y="6" width="22" height="26" rx="5"/>` +
    `<rect x="66" y="6" width="28" height="26" rx="5"/><rect x="98" y="6" width="22" height="26" rx="5"/><rect x="124" y="6" width="22" height="22" rx="5"/></g></g>` +
    `<path d="M8 12 Q80 8 152 12 Q142 58 80 58 Q18 58 8 12Z" fill="none" stroke="${DARK}" stroke-width="5" stroke-linejoin="round"/></svg>`,
  { size: 512 },
);

const PLATE = svg(
  `<svg viewBox="0 0 120 48"><rect x="2" y="2" width="116" height="44" rx="8" fill="${CREAM}" stroke="${DARK}" stroke-width="4"/>` +
    `<circle cx="14" cy="24" r="4" fill="${STEEL_D}"/><circle cx="106" cy="24" r="4" fill="${STEEL_D}"/>` +
    `<text x="60" y="35" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="30" text-anchor="middle" fill="${RED_D}">TNK-1</text></svg>`,
  { size: 384 },
);

const SPARK = svg(
  `<svg viewBox="0 0 64 64"><polygon points="${starPoints(32, 32, 28, 11)}" fill="${YELLOW}" stroke="${ORANGE_D}" stroke-width="4" stroke-linejoin="round"/></svg>`,
  { size: 128 },
);

// ---------------------------------------------------------------- paint helpers
const seam = (v: number, period: number, width: number) => {
  const f = ((v % period) + period) % period;
  return Math.min(f, period - f) < width / 2;
};

const hullPaint = paint((p, n) => {
  const deck = n.y > 0.6 && p.y > 1.1;
  const glacis = n.z > 0.3 && n.y > 0.3 && p.y > 0.7;
  if (deck && (seam(p.z + 0.12, 0.62, 0.02) || (p.z < -0.9 && seam(p.x, 0.6, 0.02)))) return GREEN_DD;
  if (glacis && seam(p.x, 0.46, 0.02)) return GREEN_DD;
  if (n.z < -0.6 && seam(p.x, 0.5, 0.02)) return GREEN_DD;
  if (p.y < 0.62 && noise(p, 0.22, 9) + (0.62 - p.y) > 0.75) return MUD;
  if (p.y < 0.42) return GREEN_D;
  const m = noise(p, 0.5, 3);
  return m > 0.68 ? GREEN_L : m < 0.28 ? GREEN_D : GREEN;
});

const turretPaint = paint((p, n, s) => {
  if (s[0] < 0.04) return DARK;
  if (s[0] < 0.1) return ORANGE;
  if (n.y > 0.92) return seam(p.x, 0.4, 0.02) || seam(p.z, 0.4, 0.02) ? GREEN_D : GREEN_L;
  const m = noise(p, 0.45, 8);
  return m > 0.66 ? GREEN_L : m < 0.3 ? GREEN_D : GREEN;
});

const fenderPaint = paint((p, n) => {
  if (n.y < 0.5) return ORANGE_D;
  const edge = Math.abs(p.x) > 1.27 || Math.abs(p.x) < 0.75;
  if (edge) return CREAM;
  if (p.z > 1.25 || p.z < -1.6) return seam(p.x + p.z * 0.9, 0.2, 0.1) ? CREAM : ORANGE;
  return noise(p, 0.4, 5) > 0.65 ? ORANGE_D : ORANGE;
});

const bumperPaint = paint((p) => (seam(p.x + p.y * 1.6, 0.2, 0.1) ? RED : CREAM));

const beltPaint = paint((_p, _n, s) => (seam(s[0] * 46, 1, 0.14) ? DARK : BELT));

const bustlePaint = paint((p, n) => {
  if (n.y > 0.7 && seam(p.x, 0.5, 0.025)) return GREEN_DD;
  if (n.z < -0.7 && (seam(p.x + 0.25, 0.5, 0.05) || seam(p.y, 0.16, 0.02))) return seam(p.x + 0.25, 0.5, 0.05) ? CREAM : GREEN_DD;
  return noise(p, 0.4, 1) > 0.6 ? GREEN_D : GREEN;
});

// ---------------------------------------------------------------- builder + helpers
const b = createBuilder({ name: "toyTank", paintSize: 2048 });
const D = Math.PI / 180;

type Vec = [number, number, number];

const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
const cyl = (rt: number, rb: number, h: number, seg = 8) => new THREE.CylinderGeometry(rt, rb, h, seg);
const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);

const put = (geo: THREE.BufferGeometry, pos: Vec, rot: Vec = [0, 0, 0]) => {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D)),
    new THREE.Vector3(1, 1, 1),
  );
  return geo.clone().applyMatrix4(m);
};

const bake = (geos: THREE.BufferGeometry[], color: string, bone: Joint, name?: string) => {
  const merged = mergeGeometries(geos);
  if (!merged) throw new Error("merge failed: " + name);
  return b.part(merged, color, { bone, at: [0, 0, 0], flat: true, name });
};

const solid = (geo: THREE.BufferGeometry, color: string | Paint, bone: Joint, at: Vec, extra: Record<string, unknown> = {}) =>
  b.part(geo, color, { bone, at, flat: true, ...extra });

// ---------------------------------------------------------------- skeleton
const hull = b.joint("hull", { at: [0, 0.7, 0] });

const TY = 1.2; // turret ring height
const TZ = 0.25; // turret centre z
const turret = b.joint("turret", { parent: hull, at: [0, TY, TZ], dir: [0, 1, 0], role: "hinge" });
const gun = b.joint("gun", { parent: turret, at: [0, 1.47, 0.85], dir: [0, 0, 1], role: "hinge" });

const hatchL = b.joint("hatchL", { parent: turret, at: [0.28, 1.79, -0.08], dir: [0, 0, 1], role: "hinge" });
const hatchR = b.joint("hatchR", { parent: turret, at: [-0.28, 1.79, -0.08], dir: [0, 0, 1], role: "hinge" });

const ANT = [
  [0.42, 1.74, 0.0],
  [0.44, 2.0, -0.04],
  [0.4, 2.3, -0.1],
  [0.42, 2.6, -0.18],
];
const antenna = b.chain("antenna", catmull(ANT), {
  parent: turret,
  names: ["antenna1", "antenna2", "antenna3", "antennaTip"],
  role: "tail",
});
const flagJoint = b.joint("flag", {
  parent: antenna.joints[3],
  at: [0.42, 2.34, -0.13],
  dir: [0, 0, -1],
  role: "hinge",
});

// wheels
const ROAD_Z = [-0.84, -0.28, 0.28, 0.84];
const WHEEL_X = 0.98;
const wheelJoints: { s: number; bone: Joint; kind: "road" | "sprocket" | "idler"; z: number; y: number; r: number }[] = [];
for (const s of [1, -1]) {
  const side = s > 0 ? "L" : "R";
  ROAD_Z.forEach((z, i) => {
    const bone = b.joint(`wheel${side}${i + 1}`, { parent: hull, at: [s * WHEEL_X, 0.41, z], dir: [s, 0, 0], role: "hinge" });
    wheelJoints.push({ s, bone, kind: "road", z, y: 0.41, r: 0.26 });
  });
  const sp = b.joint(`sprocket${side}`, { parent: hull, at: [s * WHEEL_X, 0.55, -1.4], dir: [s, 0, 0], role: "hinge" });
  wheelJoints.push({ s, bone: sp, kind: "sprocket", z: -1.4, y: 0.55, r: 0.38 });
  const id = b.joint(`idler${side}`, { parent: hull, at: [s * WHEEL_X, 0.55, 1.4], dir: [s, 0, 0], role: "hinge" });
  wheelJoints.push({ s, bone: id, kind: "idler", z: 1.4, y: 0.55, r: 0.38 });
}

// ---------------------------------------------------------------- hull
const hullOutline: OutlinePoint[] = [
  [-1.7, 0.3],
  [1.5, 0.3],
  [1.85, 0.5],
  [1.85, 0.68],
  [1.3, 1.15],
  [-1.45, 1.15],
  [-1.7, 0.98],
];
const hullBody = b.extrude(hullOutline, {
  x: [0, 0, 1],
  at: [0, 0, 0],
  thickness: 1.56,
  bevel: 0.05,
  detail: 0.34,
  color: hullPaint,
  bone: hull,
  name: "hullBody",
});

// turret race and hull trim
solid(cyl(0.86, 0.88, 0.08, 12), STEEL_D, hull, [0, 1.17, TZ], { name: "turretRace" });

// front bumper with hazard stripes, tow shackles, plate
solid(box(1.6, 0.2, 0.12), bumperPaint, hull, [0, 0.44, 1.9], { name: "bumper" });
for (const s of [1, -1]) {
  solid(new THREE.TorusGeometry(0.075, 0.02, 4, 8), STEEL, hull, [s * 0.62, 0.44, 1.98], { name: "shackleF" });
  solid(box(0.09, 0.07, 0.1), STEEL_D, hull, [s * 0.62, 0.44, 1.95], { name: "shackleBase" });
}
b.part(new THREE.PlaneGeometry(0.34, 0.136), WHITE, {
  bone: hull,
  at: [0, 0.44, 1.964],
  dir: [0, 0, 1],
  axis: "z",
  texture: PLATE,
  name: "plate",
});

// grin on the glacis
b.decal(hullBody, GRIN, {
  at: [0, 0.9, 1.58],
  dir: [0, 0.76, 0.65],
  up: [0, 0.65, -0.76],
  size: [0.92, 0.37],
  segments: 10,
  bone: hull,
  name: "grin",
});

// rivet rows (cream) along glacis edges, rear plate and front lower plate
{
  const riv: THREE.BufferGeometry[] = [];
  const dot = () => new THREE.OctahedronGeometry(0.028, 0);
  for (let i = 0; i < 10; i++) {
    const x = -0.68 + i * 0.151;
    riv.push(put(dot(), [x, 0.675, 1.86]));
    riv.push(put(dot(), [x, 0.93, -1.7]));
  }
  for (let i = 0; i < 6; i++) {
    const t = i / 5;
    for (const s of [1, -1]) riv.push(put(dot(), [s * 0.74, 0.7 + t * 0.44, 1.83 - t * 0.52]));
  }
  bake(riv, CREAM, hull, "rivets");
}

// engine deck grille + rear deck details
{
  solid(box(1.24, 0.04, 0.46), DARK, hull, [0, 1.165, -1.18], { name: "grilleFrame" });
  const bars: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) bars.push(put(box(1.1, 0.04, 0.035), [0, 1.2, -1.36 + i * 0.06], [-22, 0, 0]));
  bake(bars, STEEL_D, hull, "grilleBars");
  // hatch cover bolts
  const bolts: THREE.BufferGeometry[] = [];
  for (const s of [1, -1]) for (const z of [-1.4, -0.96]) bolts.push(put(new THREE.OctahedronGeometry(0.034, 0), [s * 0.66, 1.19, z]));
  bake(bolts, STEEL, hull, "deckBolts");
}

// rear plate: exhausts, lamps, tow hooks
for (const s of [1, -1]) {
  solid(cyl(0.075, 0.075, 0.4, 8), STEEL_D, hull, [s * 0.45, 0.82, -1.9], { dir: [0, 0, -1], name: "exhaust" });
  solid(cyl(0.11, 0.095, 0.07, 8), STEEL, hull, [s * 0.45, 0.82, -2.08], { dir: [0, 0, -1], name: "exhaustRim" });
  b.part(new THREE.CircleGeometry(0.07, 8), DARK, { bone: hull, at: [s * 0.45, 0.82, -2.116], dir: [0, 0, -1], axis: "z", name: "exhaustHole" });
  solid(box(0.16, 0.1, 0.05), RED, hull, [s * 0.68, 0.99, -1.72], { name: "tailLamp" });
  solid(box(0.06, 0.05, 0.06), RED_D, hull, [s * 0.68, 0.99, -1.745], { name: "tailLampCap" });
  solid(new THREE.TorusGeometry(0.07, 0.02, 4, 8), STEEL, hull, [s * 0.9, 0.52, -1.78], { name: "tailHook" });
  solid(box(0.1, 0.08, 0.1), STEEL_D, hull, [s * 0.9, 0.52, -1.73], { name: "tailHookBase" });
}
// smoke puffs
{
  const puffs: [number, number, number, number, string][] = [
    [0.45, 0.9, -2.2, 0.1, SMOKE],
    [0.47, 0.99, -2.38, 0.13, SMOKE],
    [0.46, 1.12, -2.6, 0.16, SMOKE_D],
    [-0.45, 0.9, -2.2, 0.1, SMOKE],
  ];
  puffs.forEach(([x, y, z, r, c], i) => solid(sph(r, 7, 5), c, hull, [x, y, z], { name: `puff${i}` }));
}

// ---------------------------------------------------------------- tracks, fenders
const BELT_Y0 = 0.55;
const beltPath = (x: number) => {
  const pts: Vec[] = [[x, 0.1, 0]];
  pts.push([x, 0.1, 0.7]);
  for (let a = -90; a <= 90; a += 22.5) pts.push([x, BELT_Y0 + 0.45 * Math.sin(a * D), 1.4 + 0.45 * Math.cos(a * D)]);
  pts.push([x, 1.0, 0.7], [x, 1.0, 0], [x, 1.0, -0.7]);
  for (let a = 90; a <= 270; a += 22.5) pts.push([x, BELT_Y0 + 0.45 * Math.sin(a * D), -1.4 + 0.45 * Math.cos(a * D)]);
  pts.push([x, 0.1, -0.7]);
  return polyline(pts, { closed: true });
};

const fenderOutline: OutlinePoint[] = [
  [-1.8, 1.0],
  [-1.8, 1.2],
  [1.15, 1.2],
  [1.55, 1.33],
  [1.98, 1.52],
  [2.0, 1.43],
  [1.62, 1.21],
  [1.2, 1.12],
  [-1.7, 1.12],
  [-1.7, 1.0],
];

for (const s of [1, -1]) {
  const side = s > 0 ? "L" : "R";
  const x = s * WHEEL_X;
  const path = beltPath(x);
  b.sweep(path, () => [0.25, 0.05], {
    section: "box",
    up: [0, 1, 0],
    bone: hull,
    color: beltPaint,
    name: `belt${side}`,
  });
  // grousers
  const N = 46;
  const gs: THREE.BufferGeometry[] = [];
  const c = new THREE.Vector3(x, BELT_Y0, 0);
  for (let i = 0; i < N; i++) {
    const t = (i + 0.5) / N;
    const p = path.at(t);
    const T = path.tangentAt(t);
    const n = new THREE.Vector3(0, T.z, -T.y).normalize();
    if (n.dot(p.clone().sub(c)) < 0) n.negate();
    const tn = new THREE.Vector3(0, -n.z, n.y);
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), n, tn);
    m.setPosition(p.clone().addScaledVector(n, 0.075));
    gs.push(box(0.46, 0.05, 0.12).applyMatrix4(m));
  }
  bake(gs, CLEAT, hull, `grousers${side}`);

  // fender
  b.extrude(fenderOutline, {
    x: [0, 0, 1],
    at: [s * 1.02, 0, 0],
    thickness: 0.62,
    bevel: 0.02,
    detail: 0.34,
    color: fenderPaint,
    bone: hull,
    name: `fender${side}`,
  });
  // fender stays + mud flap
  for (const z of [-1.4, -0.4, 0.6]) solid(box(0.05, 0.1, 0.05), STEEL_D, hull, [s * 1.3, 1.07, z], { name: "fenderStay" });
  solid(box(0.5, 0.26, 0.03), BELT, hull, [s * 1.02, 0.9, -1.83], { name: "mudFlap" });
  solid(box(0.4, 0.04, 0.035), RED, hull, [s * 1.02, 0.8, -1.83], { name: "mudFlapTrim" });
  // scalloped valance along the fender's outer edge
  const valance: OutlinePoint[] = [
    [-1.72, 1.2],
    [1.1, 1.2],
  ];
  for (let i = 0; i <= 16; i++) valance.push([1.1 - 0.1 - i * 0.175, i % 2 === 0 ? 1.03 : 0.93]);
  b.extrude(valance, {
    x: [0, 0, 1],
    at: [s * 1.31, 0, 0],
    thickness: 0.04,
    bevel: 0.01,
    detail: 0.34,
    color: paint((p, n) => (n.x * s < 0.5 ? ORANGE_D : p.y > 1.14 ? CREAM : ORANGE_D)),
    bone: hull,
    name: `valance${side}`,
  });

  // return rollers
  for (const z of [-0.55, 0.55]) {
    solid(cyl(0.09, 0.09, 0.34, 8), STEEL_D, hull, [x, 0.86, z], { dir: [1, 0, 0], name: "roller" });
    solid(cyl(0.05, 0.05, 0.44, 6), STEEL, hull, [x, 0.86, z], { dir: [1, 0, 0], name: "rollerAxle" });
  }
}

// ---------------------------------------------------------------- wheels
for (const w of wheelJoints) {
  const { s, bone, kind, y, z, r } = w;
  const X = s * WHEEL_X;
  const centre: Vec = [X, y, z];
  if (kind === "road") {
    solid(cyl(r, r, 0.36, 10), TIRE, bone, centre, { dir: [1, 0, 0], name: "tire" });
    solid(cyl(0.18, 0.18, 0.4, 8), ORANGE, bone, centre, { dir: [1, 0, 0], name: "hub" });
    solid(cyl(0.2, 0.2, 0.05, 8), CREAM, bone, [X + s * 0.18, y, z], { dir: [1, 0, 0], name: "hubRing" });
    solid(new THREE.ConeGeometry(0.09, 0.1, 8), YELLOW, bone, [X + s * 0.25, y, z], { dir: [s, 0, 0], name: "hubCap" });
  } else {
    solid(cyl(r, r, 0.32, 12), STEEL_D, bone, centre, { dir: [1, 0, 0], name: kind + "Disc" });
    solid(cyl(0.25, 0.25, 0.42, 10), ORANGE, bone, centre, { dir: [1, 0, 0], name: kind + "Hub" });
    solid(cyl(0.27, 0.27, 0.05, 10), CREAM, bone, [X + s * 0.19, y, z], { dir: [1, 0, 0], name: kind + "Ring" });
    solid(new THREE.ConeGeometry(0.12, 0.12, 10), YELLOW, bone, [X + s * 0.27, y, z], { dir: [s, 0, 0], name: kind + "Cap" });
    if (kind === "sprocket") {
      const teeth: THREE.BufferGeometry[] = [];
      for (let k = 0; k < 12; k++) {
        const a = k * 30;
        teeth.push(put(box(0.3, 0.08, 0.12), [X, y + 0.37 * Math.sin(a * D), z + 0.37 * Math.cos(a * D)], [90 - a, 0, 0]));
      }
      bake(teeth, STEEL, bone, "sprocketTeeth");
    }
  }
  // bolts around the outer face
  const bolts: THREE.BufferGeometry[] = [];
  const nb = kind === "road" ? 6 : 8;
  const br = kind === "road" ? 0.13 : 0.18;
  for (let k = 0; k < nb; k++) {
    const a = (k * 360) / nb + 15;
    bolts.push(put(new THREE.OctahedronGeometry(0.032, 0), [X + s * 0.21, y + br * Math.sin(a * D), z + br * Math.cos(a * D)]));
  }
  bake(bolts, STEEL, bone, "wheelBolts");
}

// ---------------------------------------------------------------- turret
const turretBody = b.lathe(
  [
    [0, 0],
    [0.88, 0],
    [0.9, 0.14],
    [0.76, 0.36],
    [0.54, 0.52],
    [0, 0.52],
  ],
  { at: [0, TY, TZ], segments: 10, color: turretPaint, bone: turret, name: "turretBody" },
);

// rivet ring
{
  const riv: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 16; k++) {
    const a = k * 22.5 + 11;
    riv.push(put(new THREE.OctahedronGeometry(0.03, 0), [0.9 * Math.sin(a * D), TY + 0.07, TZ + 0.9 * Math.cos(a * D)]));
  }
  bake(riv, CREAM, turret, "turretRivets");
}

// star on turret flanks
for (const s of [1, -1]) {
  b.decal(turretBody, STAR, {
    at: [s * 0.78, TY + 0.27, TZ + 0.05],
    dir: [s, 0.25, 0],
    size: [0.36, 0.36],
    bone: turret,
    name: "turretStar",
    mirror: s < 0,
  });
}
b.part(new THREE.PlaneGeometry(0.32, 0.32), WHITE, {
  bone: turret,
  at: [0, TY + 0.525, 0.5],
  dir: [0, 1, 0],
  axis: "z",
  up: [0, 0, 1],
  texture: STAR,
  name: "topStar",
});

// mantlet, gun
solid(sph(1, 8, 6), GREEN_D, gun, [0, 1.47, 1.0], { scale: [0.5, 0.38, 0.3], name: "mantlet" });
solid(box(0.7, 0.12, 0.05), STEEL_D, gun, [0, 1.47, 1.28], { name: "mantletPlate" });
b.sweep(
  [
    [0, 1.47, 0.95],
    [0, 1.47, 2.45],
  ],
  0.115,
  {
    bone: gun,
    sides: 8,
    smooth: false,
    caps: "flat",
    color: (t: number) => ((t > 0.38 && t < 0.45) || (t > 0.6 && t < 0.65) ? CREAM : STEEL),
    name: "barrel",
  },
);
solid(cyl(0.175, 0.175, 0.28, 8), ORANGE, gun, [0, 1.47, 2.55], { dir: [0, 0, 1], name: "muzzleBrake" });
solid(cyl(0.185, 0.185, 0.045, 8), ORANGE_D, gun, [0, 1.47, 2.47], { dir: [0, 0, 1], name: "muzzleRing" });
solid(cyl(0.185, 0.185, 0.045, 8), ORANGE_D, gun, [0, 1.47, 2.64], { dir: [0, 0, 1], name: "muzzleRing2" });
for (const s of [1, -1]) solid(box(0.03, 0.08, 0.1), DARK, gun, [s * 0.172, 1.47, 2.55], { name: "brakeSlot" });
b.part(new THREE.CircleGeometry(0.085, 8), DARK, { bone: gun, at: [0, 1.47, 2.6915], dir: [0, 0, 1], axis: "z", name: "bore" });
// coax machine gun
solid(cyl(0.03, 0.03, 0.34, 6), STEEL_D, gun, [0.34, 1.42, 1.3], { dir: [0, 0, 1], name: "coax" });
solid(cyl(0.05, 0.05, 0.1, 6), STEEL, gun, [0.34, 1.42, 1.18], { dir: [0, 0, 1], name: "coaxJacket" });

// smoke dischargers
for (const s of [1, -1]) {
  for (let k = 0; k < 3; k++) {
    const az = (50 + k * 14) * D;
    const pos: Vec = [s * 0.8 * Math.sin(az), TY + 0.3, TZ + 0.8 * Math.cos(az)];
    solid(cyl(0.04, 0.045, 0.2, 6), STEEL_D, turret, pos, { dir: [s * 0.6, 1, 0.1], name: "smokeTube" });
    solid(cyl(0.032, 0.032, 0.02, 6), DARK, turret, [pos[0] + s * 0.06, pos[1] + 0.1, pos[2] + 0.01], { dir: [s * 0.6, 1, 0.1], name: "smokeTubeHole" });
  }
}

// bustle + stowage
solid(box(1.06, 0.36, 0.38), bustlePaint, turret, [0, 1.42, -0.6], { name: "bustle" });
for (const x of [-0.3, 0.3]) solid(box(0.07, 0.38, 0.4), CREAM, turret, [x, 1.42, -0.6], { name: "bustleStrap" });
solid(cyl(0.11, 0.11, 0.98, 8), KHAKI, turret, [0, 1.7, -0.62], { dir: [1, 0, 0], name: "tarp" });
for (const x of [-0.3, 0.3]) solid(new THREE.TorusGeometry(0.115, 0.018, 4, 8), BELT, turret, [x, 1.7, -0.62], { rotation: [0, 90, 0], name: "tarpStrap" });
for (const x of [-0.5, 0.5]) solid(cyl(0.1, 0.1, 0.03, 8), KHAKI_D, turret, [x, 1.7, -0.62], { dir: [1, 0, 0], name: "tarpEnd" });

// hatches
for (const s of [1, -1]) {
  const bone = s > 0 ? hatchL : hatchR;
  solid(cyl(0.21, 0.23, 0.1, 8), STEEL_D, turret, [s * 0.28, 1.74, 0.12], { name: "hatchRing" });
  solid(cyl(0.2, 0.2, 0.05, 8), STEEL, bone, [s * 0.28, 1.815, 0.12], { name: "hatchLid" });
  solid(cyl(0.12, 0.12, 0.02, 8), GREEN_D, bone, [s * 0.28, 1.845, 0.12], { name: "hatchLidDome" });
  solid(box(0.12, 0.03, 0.04), DARK, bone, [s * 0.28, 1.865, 0.18], { name: "hatchHandle" });
  solid(box(0.05, 0.05, 0.05), STEEL_D, bone, [s * 0.28, 1.835, -0.04], { name: "hatchHinge" });
}
b.pose(hatchR, { axis: [1, 0, 0], deg: -100 });

// periscopes
for (const s of [1, -1]) {
  solid(box(0.1, 0.12, 0.08), STEEL_D, turret, [s * 0.3, 1.76, 0.62], { name: "periscope" });
  solid(box(0.08, 0.04, 0.02), BLUE_L, turret, [s * 0.3, 1.78, 0.665], { name: "periscopeLens" });
}

// searchlight on the turret's left shoulder
solid(cyl(0.1, 0.1, 0.1, 8), STEEL_D, turret, [0.58, 1.72, 0.3], { name: "lightBase" });
solid(cyl(0.12, 0.09, 0.14, 8), STEEL, turret, [0.58, 1.83, 0.32], { dir: [0, 0.6, 1], name: "lightBody" });
glow(solid(cyl(0.085, 0.085, 0.02, 8), YELLOW, turret, [0.58, 1.87, 0.4], { dir: [0, 0.6, 1], name: "lightLens" }), 1);

// ---------------------------------------------------------------- the commander
const CX = -0.28;
const CZ = 0.12;
solid(sph(0.2, 8, 6), BLUE, turret, [CX, 1.86, CZ], { scale: [1, 1.05, 0.9], name: "crewTorso" });
solid(cyl(0.05, 0.05, 0.03, 6), CREAM, turret, [CX, 1.88, CZ + 0.18], { dir: [0, 0, 1], name: "crewButton" });
const HY = 2.08;
solid(sph(0.165, 8, 6), SKIN, turret, [CX, HY, CZ], { name: "crewHead" });
solid(sph(0.185, 8, 4), ORANGE, turret, [CX, HY + 0.03, CZ], { scale: [1, 0.95, 1], name: "crewHelmet" });
solid(new THREE.TorusGeometry(0.17, 0.02, 4, 10), CREAM, turret, [CX, HY + 0.045, CZ], { rotation: [90, 0, 0], name: "crewHelmetBand" });
for (const s of [1, -1]) {
  const gx = CX + s * 0.065;
  solid(cyl(0.052, 0.052, 0.045, 8), DARK, turret, [gx, HY + 0.12, CZ + 0.15], { dir: [0, 0.5, 0.85], name: "goggleRim" });
  solid(cyl(0.038, 0.038, 0.03, 8), BLUE_L, turret, [gx, HY + 0.127, CZ + 0.17], { dir: [0, 0.5, 0.85], name: "goggleLens" });
  solid(sph(0.022, 5, 4), DARK, turret, [CX + s * 0.062, HY - 0.02, CZ + 0.152], { name: "crewEye" });
  solid(sph(0.008, 4, 3), WHITE, turret, [CX + s * 0.057, HY - 0.008, CZ + 0.168], { name: "crewEyeShine" });
  solid(sph(0.03, 5, 4), PINK, turret, [CX + s * 0.1, HY - 0.06, CZ + 0.115], { scale: [1, 0.7, 0.5], name: "crewCheek" });
  solid(sph(0.08, 6, 4), STEEL_D, turret, [CX + s * 0.17, HY + 0.03, CZ], { scale: [0.5, 1, 1], name: "crewEarmuff" });
}
solid(sph(0.036, 5, 4), PINK, turret, [CX, HY - 0.04, CZ + 0.17], { name: "crewNose" });
solid(box(0.15, 0.03, 0.04), WOOD_D, turret, [CX, HY - 0.09, CZ + 0.15], { rotation: [-15, 0, 0], name: "crewMustache" });
for (const s of [1, -1]) solid(sph(0.025, 4, 3), WOOD_D, turret, [CX + s * 0.08, HY - 0.09, CZ + 0.145], { name: "crewMustacheCurl" });
// waving arm (model right, -x) and the other hand on the rim
b.capsule([CX - 0.16, 1.92, CZ], [CX - 0.34, 2.04, CZ + 0.08], 0.055, { bone: turret, sides: 6, color: BLUE, name: "crewArmR1" });
b.capsule([CX - 0.34, 2.04, CZ + 0.08], [CX - 0.42, 2.3, CZ + 0.12], 0.05, { bone: turret, sides: 6, color: BLUE, name: "crewArmR2" });
solid(sph(0.07, 6, 4), WHITE, turret, [CX - 0.43, 2.36, CZ + 0.13], { name: "crewMittR" });
b.capsule([CX + 0.15, 1.9, CZ + 0.02], [CX + 0.2, 1.82, CZ + 0.2], 0.05, { bone: turret, sides: 6, color: BLUE, name: "crewArmL" });
solid(sph(0.06, 6, 4), WHITE, turret, [CX + 0.2, 1.8, CZ + 0.22], { name: "crewMittL" });

// ---------------------------------------------------------------- antenna + flag
b.sweep(antenna, [0.022, 0.011], { sides: 5, smooth: false, color: STEEL_D, name: "antennaWhip" });
solid(cyl(0.06, 0.07, 0.1, 8), STEEL_D, turret, [0.42, 1.74, 0.0], { name: "antennaBase" });
solid(sph(0.04, 6, 4), ORANGE, antenna.joints[3], [0.42, 2.62, -0.18], { name: "antennaBall" });
b.extrude(
  [
    [0, 0],
    [0.46, 0],
    [0.34, 0.11],
    [0.46, 0.22],
    [0, 0.22],
  ],
  {
    at: [0.42, 2.34, -0.17],
    x: [0, 0, -1],
    y: [0, 1, 0],
    thickness: 0.012,
    color: paint((_p, _n, s) => (s[1] > 0.08 && s[1] < 0.14 && s[0] > 0.05 ? CREAM : RED)),
    bone: flagJoint,
    name: "flag",
  },
);
b.part(new THREE.PlaneGeometry(0.12, 0.12), WHITE, {
  bone: flagJoint,
  at: [0.42 - 0.0075, 2.45, -0.3],
  dir: [-1, 0, 0],
  axis: "z",
  texture: SPARK,
  name: "flagSpark",
});
b.pose(flagJoint, { axis: [0, 1, 0], deg: 14 });

// ---------------------------------------------------------------- headlamp eyes
for (const s of [1, -1]) {
  const E: Vec = [s * 0.46, 1.3, 1.2];
  solid(cyl(0.15, 0.18, 0.2, 8), STEEL_D, hull, [E[0], 1.17, E[2]], { name: "lampMount" });
  solid(sph(0.2, 8, 6), WHITE, hull, E, { name: "eyeball" });
  const look = [-s * 0.12, 0.1, 1] as Vec;
  glow(b.part(new THREE.SphereGeometry(0.2, 8, 3, 0, Math.PI * 2, 0, 0.62), YELLOW, { bone: hull, at: E, dir: look, flat: true, name: "iris" }), 1.1);
  b.part(new THREE.SphereGeometry(0.206, 8, 2, 0, Math.PI * 2, 0, 0.3), DARK, { bone: hull, at: E, dir: look, flat: true, name: "pupil" });
  const ld = new THREE.Vector3(...look).normalize();
  const sh = new THREE.Vector3(...E).addScaledVector(ld, 0.207).add(new THREE.Vector3(s * 0.025, 0.045, 0));
  solid(sph(0.032, 5, 4), WHITE, hull, [sh.x, sh.y, sh.z], { name: "eyeShine" });
  // eyelid
  b.part(new THREE.SphereGeometry(0.212, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), GREEN, {
    bone: hull,
    at: E,
    dir: [-s * 0.4, 1, -0.32],
    flat: true,
    name: "eyelid",
  });
  b.part(new THREE.TorusGeometry(0.212, 0.016, 4, 10), GREEN_DD, {
    bone: hull,
    at: E,
    dir: [-s * 0.4, 1, -0.32],
    flat: true,
    name: "eyelidRim",
  });
}

// ---------------------------------------------------------------- fender stowage
const barrel = (x: number, z: number, name: string) => {
  solid(cyl(0.17, 0.17, 0.46, 8), RED, hull, [x, 1.43, z], { name });
  for (const dy of [-0.14, 0.14]) solid(cyl(0.18, 0.18, 0.04, 8), RED_D, hull, [x, 1.43 + dy, z], { name: name + "Hoop" });
  solid(cyl(0.14, 0.14, 0.02, 8), STEEL, hull, [x, 1.66, z], { name: name + "Lid" });
  solid(cyl(0.035, 0.035, 0.04, 6), STEEL_D, hull, [x + 0.06, 1.69, z + 0.03], { name: name + "Bung" });
};
barrel(1.05, -1.35, "barrelL");
barrel(-1.05, -1.35, "barrelR");

// log on the right fender with ropes
{
  const logZ0 = -0.85;
  const logZ1 = 1.05;
  const lz = (logZ0 + logZ1) / 2;
  solid(cyl(0.11, 0.11, logZ1 - logZ0, 7), paint((p, _n, _s) => (noise(p, 0.1, 2) > 0.6 ? WOOD_D : WOOD)), hull, [-1.05, 1.34, lz], { dir: [0, 0, 1], name: "log" });
  for (const z of [logZ0 - 0.001, logZ1 + 0.001]) {
    b.part(new THREE.CircleGeometry(0.1, 7), CREAM, { bone: hull, at: [-1.05, 1.34, z], dir: [0, 0, z > lz ? 1 : -1], axis: "z", name: "logEnd" });
  }
  b.part(new THREE.TorusGeometry(0.06, 0.012, 4, 7), WOOD_D, { bone: hull, at: [-1.05, 1.34, logZ1 + 0.003], dir: [0, 0, 1], axis: "z", flat: true, name: "logRing" });
  for (const z of [-0.5, 0.2, 0.8]) {
    solid(new THREE.TorusGeometry(0.125, 0.022, 4, 8), CREAM, hull, [-1.05, 1.34, z], { rotation: [0, 90, 0], name: "logRope" });
    solid(box(0.07, 0.1, 0.07), STEEL_D, hull, [-1.05, 1.24, z], { name: "logBracket" });
  }
  solid(cyl(0.025, 0.04, 0.12, 5), WOOD, hull, [-1.05, 1.47, 0.0], { dir: [0, 1, 0.2], name: "logBranch" });
  solid(cyl(0.02, 0.035, 0.1, 5), WOOD, hull, [-1.17, 1.4, 0.45], { dir: [-1, 0.8, 0], name: "logBranch2" });
}

// left fender: rope coil, toolbox, shovel
{
  for (let i = 0; i < 3; i++) {
    solid(new THREE.TorusGeometry(0.2, 0.036, 5, 12), i === 1 ? CREAM : KHAKI, hull, [1.02, 1.25 + i * 0.062, -0.82], { rotation: [90, 0, 0], name: "ropeCoil" });
  }
  solid(box(0.07, 0.24, 0.07), RED, hull, [1.02, 1.34, -0.82 - 0.2], { name: "coilTag" });
  solid(box(0.46, 0.26, 0.55), BLUE, hull, [1.02, 1.33, 0.12], { name: "toolbox" });
  solid(box(0.5, 0.04, 0.59), STEEL_D, hull, [1.02, 1.47, 0.12], { name: "toolboxLid" });
  solid(box(0.2, 0.04, 0.05), STEEL, hull, [1.02, 1.5, 0.12], { name: "toolboxHandle" });
  for (const dz of [-0.2, 0.2]) solid(box(0.06, 0.12, 0.04), STEEL, hull, [1.02 + 0.23, 1.38, 0.12 + dz], { name: "toolboxLatch" });
  // shovel lying along the outer edge
  b.rod([1.27, 1.25, -0.3], [1.27, 1.25, 0.8], 0.02, { bone: hull, sides: 5, color: WOOD, name: "shovelHandle" });
  b.extrude(
    [
      [0, 0],
      [0.1, 0.02],
      [0.2, 0],
      [0.14, 0.26],
      [0.06, 0.26],
    ],
    { at: [1.27, 1.25, 0.78], x: [-1, 0, 0], y: [0, 0, 1], thickness: 0.02, color: STEEL, bone: hull, name: "shovelBlade" },
  );
  solid(box(0.1, 0.03, 0.04), WOOD, hull, [1.27, 1.25, -0.32], { name: "shovelGrip" });
}

// front fender lamps and sparkle trim
for (const s of [1, -1]) {
  solid(sph(0.07, 6, 4), ORANGE_D, hull, [s * 1.02, 1.42, 1.74], { name: "indicator" });
  glow(solid(sph(0.045, 5, 4), YELLOW, hull, [s * 1.02, 1.45, 1.78], { name: "indicatorLens" }), 1);
}

// side star-emblem pennant boxes on hull rear plate: toolkit label
b.part(new THREE.PlaneGeometry(0.2, 0.2), WHITE, {
  bone: hull,
  at: [0, 0.88, -1.74],
  dir: [0, 0, -1],
  axis: "z",
  texture: STAR,
  name: "rearStar",
});

// ---------------------------------------------------------------- whimsy: a daisy in the muzzle, a chick on the toolbox
{
  const stem = [
    [0, 1.47, 2.5],
    [0, 1.5, 2.76],
    [0, 1.66, 2.9],
    [0, 1.82, 2.93],
  ];
  b.sweep(catmull(stem), 0.013, { bone: gun, sides: 5, smooth: false, color: GREEN_STEM, caps: "flat", name: "daisyStem" });
  const C: Vec = [0, 1.88, 2.94];
  const petals: THREE.BufferGeometry[] = [];
  for (let k = 0; k < 8; k++) petals.push(put(sph(0.045, 5, 4).scale(0.62, 1.1, 0.35).translate(0, 0.068, 0), C, [0, 0, k * 45]));
  bake(petals, CREAM, gun, "daisyPetals");
  solid(sph(0.04, 6, 4), YELLOW, gun, [C[0], C[1], C[2] + 0.012], { scale: [1, 1, 0.7], name: "daisyCentre" });
  solid(sph(0.04, 5, 3), GREEN_STEM, gun, [0.04, 1.62, 2.86], { scale: [1.6, 0.4, 0.8], rotation: [0, 0, 25], name: "daisyLeaf" });

  const T: Vec = [1.02, 1.5, 0.28];
  solid(sph(0.09, 7, 5), YELLOW, hull, [T[0], T[1] + 0.07, T[2]], { scale: [1, 0.95, 1.1], name: "chickBody" });
  solid(sph(0.06, 6, 5), YELLOW, hull, [T[0], T[1] + 0.17, T[2] + 0.07], { name: "chickHead" });
  solid(new THREE.ConeGeometry(0.022, 0.05, 4), ORANGE, hull, [T[0], T[1] + 0.165, T[2] + 0.14], { dir: [0, -0.1, 1], name: "chickBeak" });
  solid(new THREE.ConeGeometry(0.014, 0.05, 4), ORANGE_D, hull, [T[0], T[1] + 0.25, T[2] + 0.05], { dir: [0, 1, -0.3], name: "chickTuft" });
  for (const s of [1, -1]) {
    solid(sph(0.012, 4, 3), DARK, hull, [T[0] + s * 0.034, T[1] + 0.19, T[2] + 0.115], { name: "chickEye" });
    solid(sph(0.05, 5, 4), ORANGE, hull, [T[0] + s * 0.085, T[1] + 0.08, T[2] - 0.01], { scale: [0.35, 0.8, 1.1], name: "chickWing" });
    solid(box(0.025, 0.05, 0.05), ORANGE_D, hull, [T[0] + s * 0.035, T[1] + 0.0, T[2] + 0.02], { name: "chickFoot" });
  }
}

export default function build() {
  return b.root;
}
