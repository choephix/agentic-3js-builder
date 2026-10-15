import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { DEG, rng } from "../../../../src/math";
import { bezier, catmull } from "../../../../src/path";
import { countershade, mix, mottle, noise, paint, scales, smoothstep } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A 2.6 m dragonbone reaper scythe on a rune plinth: a vertebra-column haft with glowing marrow, an open-jawed dragon skull offering a soul orb, and a wing-finger blade whose inner edge burns with captured soul-fire.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// ---------------------------------------------------------------------------------------------------------------
// Palette: ivory dragonbone, midnight violet, gold trim, one strong accent: soul-teal.
const BONE = "#efe3c4";
const BONE_LT = "#fff7e0";
const BONE_MID = "#d6c298";
const BONE_DK = "#9c8660";
const BONE_SH = "#6b5a44";
const NIGHT = "#140d24";
const VIOLET_DK = "#1f1538";
const VIOLET = "#34205c";
const VIOLET_MD = "#4e3190";
const VIOLET_LT = "#7a58c8";
const GOLD = "#eab73c";
const GOLD_LT = "#ffe28a";
const GOLD_DK = "#a8741a";
const TEAL_DP = "#0fb7a6";
const TEAL = "#2effd0";
const TEAL_LT = "#8dffe6";
const WHITE_HOT = "#e4fff9";
const VOID = "#05030b";

// Painted surfaces (hand-painted highlight and shadow).
const BONEP = countershade(mottle(BONE_LT, BONE, { size: 0.07, contrast: 1.3, seed: 3 }), mottle(BONE_MID, BONE_DK, { size: 0.07, seed: 5 }), {
  level: -0.05,
  soft: 0.7,
});
const BONE_SCALES = countershade(
  scales([BONE, BONE_LT, BONE_MID], BONE_DK, { size: 0.045, width: 0.1, seed: 11 }),
  scales([BONE_MID, BONE_DK], BONE_SH, { size: 0.045, width: 0.1, seed: 12 }),
  { level: -0.1, soft: 0.8 },
);
const GOLDP = countershade(mottle(GOLD_LT, GOLD, { size: 0.05, seed: 7 }), mottle(GOLD_DK, "#7b4e10", { size: 0.05, seed: 8 }), {
  level: 0,
  soft: 0.6,
});
const STONEP = countershade(mottle(VIOLET, VIOLET_MD, { size: 0.16, seed: 21 }), mottle(NIGHT, VIOLET_DK, { size: 0.16, seed: 22 }), {
  level: 0.1,
  soft: 0.6,
});
const WRAPP = paint((p, _n) => {
  const a = Math.atan2(p.z, p.x) / (Math.PI * 2);
  const ph = (((a * 3 + p.y / 0.085) % 1) + 1) % 1;
  if (ph < 0.1) return GOLD;
  if (ph < 0.16) return VIOLET_DK;
  return mix(VIOLET, VIOLET_MD, noise(p, 0.05, 4));
});
const BLADE_DARK = paint((p, _n, s) => {
  const x = s[0];
  const y = s[1];
  const stripe = (((x * 17 + y * 4) % 1) + 1) % 1;
  const base = mix(VIOLET_DK, VIOLET, noise(p, 0.12, 2));
  return stripe < 0.08 ? mix(base, VIOLET_LT, 0.55) : base;
});

// ---------------------------------------------------------------------------------------------------------------
// Textures
const WISP = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100">
  <path d="M20 99 C6 80 4 62 14 46 C18 38 12 28 20 2 C24 22 36 36 34 58 C33 78 28 90 20 99 Z" fill="#2effd0"/>
  <path d="M20 96 C12 82 11 66 18 52 C20 46 18 40 20 24 C24 40 29 50 28 64 C27 80 24 90 20 96 Z" fill="#aaffec"/>
  <path d="M20 92 C16 82 16 70 20 58 C24 70 24 82 20 92 Z" fill="#f2fffb"/></svg>`,
  { size: 256 },
);
const runeSvg = (d: string, stroke: string) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="${d}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    { size: 128 },
  );
const RUNES = [
  runeSvg("M16 3 L16 29 M16 10 L7 18 M16 10 L25 18 M8 26 L24 26", GOLD_LT),
  runeSvg("M8 4 L8 28 M8 6 L22 14 L8 22 M20 18 L26 28", GOLD_LT),
  runeSvg("M16 4 L26 16 L16 28 L6 16 Z M16 10 L16 22 M11 16 L21 16", GOLD_LT),
  runeSvg("M6 6 L26 6 M16 6 L16 28 M8 16 L24 16 M10 28 L22 28", GOLD_LT),
];
const ringMarks = (() => {
  let s = "";
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const c = Math.cos(a);
    const d = Math.sin(a);
    const long = i % 3 === 0;
    const r0 = long ? 80 : 84;
    s += `<path d="M${100 + c * r0} ${100 + d * r0} L${100 + c * 90} ${100 + d * 90}" stroke-width="${long ? 3 : 2.2}"/>`;
  }
  return s;
})();
const SIGIL = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g fill="none" stroke="#2effd0" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.6">
  <circle cx="100" cy="100" r="97"/><circle cx="100" cy="100" r="92" stroke-width="1.6"/>${ringMarks}
  <circle cx="100" cy="100" r="72"/><circle cx="100" cy="100" r="30" stroke-width="2.2"/>
  <path d="M100 30 L170 100 L100 170 L30 100 Z"/><path d="M50.5 50.5 L149.5 50.5 L149.5 149.5 L50.5 149.5 Z"/>
  <path d="M100 70 L100 130 M70 100 L130 100"/></g><circle cx="100" cy="100" r="9" fill="#8dffe6"/></svg>`,
  { size: 1024 },
);

// ---------------------------------------------------------------------------------------------------------------
type V3 = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const rand = rng(77);

  // ------------------------------------------------------------------ skeleton (static weapon: a few moving bits)
  const base = b.joint("base", { at: [0, 0.14, 0], dir: [0, 1, 0] });
  const PITCH = 10; // skull looks a little down at the viewer
  const HC = new THREE.Vector3(0, 1.98, 0.1);
  const AX = new THREE.Vector3(1, 0, 0);
  const rx = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyAxisAngle(AX, PITCH * DEG);
  const H3 = (x: number, y: number, z: number): V3 => rx(x, y, z).add(HC).toArray() as V3;
  const Hd = (x: number, y: number, z: number): V3 => rx(x, y, z).toArray() as V3;
  const skull = b.joint("skull", { parent: base, at: H3(0, 0, 0), dir: Hd(0, 0, 1), role: "head" });
  const jaw = b.joint("jaw", { parent: skull, at: H3(0, -0.045, 0.02), aim: H3(0, -0.07, 0.4), role: "jaw" });
  const orbJ = b.joint("soulOrb", { parent: skull, at: H3(0, -0.12, 0.52), dir: [0, 1, 0], role: "hinge" });
  const soulRing = b.joint("soulRing", { parent: base, at: [0, 1.5, 0], dir: [0, 1, 0], role: "hinge" });
  const soulDrift = b.joint("soulDrift", { parent: base, at: [0.8, 2.05, -0.05], dir: [0, 1, 0], role: "hinge" });
  const ribbonA = b.joint("ribbonA", { parent: base, at: [-0.03, 2.0, -0.07], dir: [0, -1, 0], role: "hinge" });
  const ribbonB = b.joint("ribbonB", { parent: base, at: [0.05, 1.95, -0.07], dir: [0, -1, 0], role: "hinge" });

  // Part helpers; `cur` is the bone every static piece rides.
  let cur = base;
  const O = (o: Record<string, unknown> = {}) => ({ bone: cur, ...o });
  const part = (geo: THREE.BufferGeometry, color: string | typeof BONEP, o: Record<string, unknown> = {}) =>
    b.part(geo, color, O(o));
  const rod = (a: V3, c: V3, r: number | [number, number], color: string | typeof BONEP, o: Record<string, unknown> = {}) =>
    b.sweep([a, c], r, { ...O(), color, ...o });
  const tube = (pts: V3[], r: number | [number, number] | number[], color: string | typeof BONEP, o: Record<string, unknown> = {}) =>
    b.sweep(catmull(pts), r, { ...O(), color, ...o });
  const sphere = (r: number, color: string | typeof BONEP, at: V3, o: Record<string, unknown> = {}, w = 8, h = 6) =>
    part(new THREE.SphereGeometry(r, w, h), color, { at, flat: true, ...o });

  // ------------------------------------------------------------------ plinth
  const cyl = (rTop: number, rBot: number, y0: number, y1: number, color: string | typeof BONEP, seg = 8) =>
    part(new THREE.CylinderGeometry(rTop, rBot, y1 - y0, seg), color, { at: [0, (y0 + y1) / 2, 0], rotation: [0, 22.5, 0], flat: true });
  cyl(0.64, 0.66, 0, 0.06, STONEP);
  cyl(0.56, 0.575, 0.06, 0.1, GOLDP);
  cyl(0.5, 0.52, 0.1, 0.14, STONEP);
  // bevel rim glints
  part(new THREE.CylinderGeometry(0.655, 0.655, 0.012, 8), GOLD_DK, { at: [0, 0.058, 0], rotation: [0, 22.5, 0], flat: true });
  part(new THREE.CylinderGeometry(0.505, 0.505, 0.012, 8), GOLD, { at: [0, 0.136, 0], rotation: [0, 22.5, 0], flat: true });
  // rune sigil on the top face
  glow(
    part(new THREE.PlaneGeometry(0.92, 0.92), "#ffffff", {
      at: [0, 0.1425, 0],
      dir: [0, 1, 0],
      axis: "z",
      up: [0, 0, 1],
      texture: SIGIL,
    }),
    1.2,
  );
  for (let k = 0; k < 8; k++) {
    const th = k * 45 * DEG; // face centres
    const rr = 0.612;
    const px = Math.sin(th) * rr;
    const pz = Math.cos(th) * rr;
    // glowing inlay slit and gold pegs on every face of the lower tier
    glow(part(new THREE.BoxGeometry(0.26, 0.018, 0.012), TEAL, { at: [px, 0.032, pz], rotation: [0, k * 45, 0] }), 1);
    for (const o of [-0.17, 0.17])
      part(new THREE.SphereGeometry(0.014, 6, 4), GOLD, {
        at: [px + Math.cos(th) * o, 0.032, pz - Math.sin(th) * o],
        flat: true,
      });
    // gold gem sockets on the gold band
    const r2 = 0.538;
    glow(
      part(new THREE.OctahedronGeometry(0.02), TEAL_LT, { at: [Math.sin(th) * r2, 0.08, Math.cos(th) * r2], scale: [1, 1.3, 1] }),
      1.1,
    );
  }
  // dragon-claw corner fangs
  for (let k = 0; k < 8; k++) {
    const th = (22.5 + k * 45) * DEG;
    const R = 0.6;
    const s = Math.sin(th);
    const c = Math.cos(th);
    b.spike([s * R, 0.05, c * R], [s * 0.55, 1, c * 0.55], 0.26 - (k % 2) * 0.06, 0.04, { ...O(), color: BONEP, sides: 6 });
    part(new THREE.CylinderGeometry(0.046, 0.05, 0.016, 6), GOLD, { at: [s * R, 0.062, c * R], flat: true });
  }
  // soul-crystal clusters
  const crystal = (x: number, z: number, h: number, tiltX: number, tiltZ: number) => {
    const g = new THREE.Group();
    void g;
    const bodyH = h * 0.7;
    const dirx = Math.sin(tiltZ);
    const dirz = Math.sin(tiltX);
    const dir: V3 = [dirx, 1, dirz];
    const len = Math.hypot(dirx, 1, dirz);
    const u: V3 = [dir[0] / len, dir[1] / len, dir[2] / len];
    const baseP: V3 = [x, 0.07, z];
    const tipBase: V3 = [x + u[0] * bodyH, 0.07 + u[1] * bodyH, z + u[2] * bodyH];
    glow(b.sweep([baseP, tipBase], 0.03, { ...O(), color: TEAL, sides: 6, caps: "flat" }), 1);
    glow(b.spike(tipBase, u, h * 0.3, 0.03, { ...O(), color: TEAL_LT, sides: 6 }), 1.2);
  };
  for (let k = 0; k < 4; k++) {
    const th = (k * 90 + 45) * DEG; // between faces? corners are 22.5+; use face midpoints of shelf
    const R = 0.595;
    const x = Math.sin(th) * R;
    const z = Math.cos(th) * R;
    const out = [Math.sin(th), Math.cos(th)];
    crystal(x, z, 0.2, out[1] * 0.35, out[0] * 0.35);
    crystal(x + Math.cos(th) * 0.06, z - Math.sin(th) * 0.06, 0.12, out[1] * -0.3, out[0] * -0.2);
    crystal(x - Math.cos(th) * 0.05, z + Math.sin(th) * 0.05, 0.09, out[1] * 0.5, out[0] * 0.5);
  }

  // ------------------------------------------------------------------ butt claws + ferrule
  const ferrule = b.lathe(
    [
      [0, 0.14],
      [0.075, 0.14],
      [0.08, 0.17],
      [0.055, 0.215],
      [0.05, 0.29],
      [0.068, 0.32],
      [0.058, 0.352],
      [0, 0.352],
    ],
    { at: [0, 0, 0], bone: base, color: VIOLET_DK, segments: 8, smoothing: 0 },
  );
  void ferrule;
  for (const y of [0.18, 0.335]) {
    b.lathe(
      [
        [0.0, y - 0.012],
        [0.086, y - 0.012],
        [0.092, y],
        [0.086, y + 0.012],
        [0, y + 0.012],
      ],
      { at: [0, 0, 0], bone: base, color: GOLDP, segments: 8, smoothing: 0 },
    );
  }
  glow(part(new THREE.CylinderGeometry(0.078, 0.078, 0.012, 8), TEAL, { at: [0, 0.147, 0] }), 1.1);
  for (let k = 0; k < 3; k++) {
    const th = (90 + k * 120) * DEG;
    const P = (r: number, y: number): V3 => [Math.sin(th) * r, y, Math.cos(th) * r];
    b.sweep(catmull([P(0.05, 0.32), P(0.14, 0.31), P(0.215, 0.23), P(0.225, 0.152)]), [0.04, 0.004], {
      ...O(),
      color: BONEP,
      sides: 6,
      caps: "point",
    });
    sphere(0.042, BONEP, P(0.1, 0.315), {}, 7, 5); // knuckle
    part(new THREE.TorusGeometry(0.04, 0.007, 4, 8), GOLD, { at: P(0.14, 0.311), rotation: [0, k * 120 + 90, 90], flat: true });
  }

  // ------------------------------------------------------------------ haft: marrow core, vertebrae, grip
  glow(b.sweep([[0, 0.3, 0], [0, 2.2, 0]], 0.04, { ...O(), color: TEAL, caps: "flat", sides: 8 }), 1);
  // vertebrae (merged into one bone part)
  const vGeo: THREE.BufferGeometry[] = [];
  const spoolPts = (sc: number) =>
    [
      [0, -0.027],
      [0.036, -0.027],
      [0.05, -0.019],
      [0.052, -0.009],
      [0.034, -0.002],
      [0.034, 0.002],
      [0.052, 0.009],
      [0.05, 0.019],
      [0.036, 0.027],
      [0, 0.027],
    ].map(([x, y]) => new THREE.Vector2(x * sc, y));
  const vertY: number[] = [];
  for (let y = 0.405; y < 0.7; y += 0.072) vertY.push(y);
  for (let y = 1.265; y < 1.98; y += 0.072) vertY.push(y);
  vertY.forEach((y, i) => {
    const sc = 1.02 - (y / 2) * 0.12;
    vGeo.push(new THREE.LatheGeometry(spoolPts(sc), 8).translate(0, y, 0));
    // transverse processes (sideways) and a dorsal spine (back), each vertebra a little different
    const long = 0.05 + ((i * 37) % 5) * 0.006;
    for (const s of [1, -1]) {
      const c = new THREE.ConeGeometry(0.014, long, 5);
      c.rotateZ(-s * Math.PI * 0.5);
      c.translate(s * (0.05 + long * 0.5 - 0.004), y + 0.003, 0);
      vGeo.push(c);
    }
    const sp = new THREE.ConeGeometry(0.016, 0.075, 5);
    sp.rotateX(-Math.PI * 0.5 - 0.5);
    sp.translate(0, y + 0.012, -0.075);
    vGeo.push(sp);
  });
  const vMerged = mergeGeometries(vGeo.map((g) => (g.index ? g : g)));
  if (vMerged) part(vMerged, BONEP, { at: [0, 0, 0], flat: true });
  // grip: leather wrap with gold wire, framed by gold collars
  b.sweep(
    [
      [0, 0.69, 0],
      [0, 1.24, 0],
    ],
    0.047,
    { ...O(), color: WRAPP, caps: "flat", sides: 10 },
  );
  for (const y of [0.69, 0.72, 1.215, 1.245]) {
    b.lathe(
      [
        [0, y - 0.012],
        [0.058, y - 0.012],
        [0.062, y],
        [0.058, y + 0.012],
        [0, y + 0.012],
      ],
      { at: [0, 0, 0], bone: base, color: GOLDP, segments: 8, smoothing: 0 },
    );
  }
  // grip studs: gold rivets merged
  const studs: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 12; i++) {
    const y = 0.78 + i * 0.04;
    const a = i * 2.1;
    studs.push(new THREE.SphereGeometry(0.011, 5, 4).translate(Math.sin(a) * 0.048, y, Math.cos(a) * 0.048));
  }
  const studMerged = mergeGeometries(studs);
  if (studMerged) part(studMerged, GOLD_LT, { at: [0, 0, 0], flat: true });
  // gold ring collars between bone and wrap / skull
  for (const y of [0.372, 0.755 - 0.01, 1.245 + 0.0]) {
    void y;
  }
  b.lathe(
    [
      [0, 0.365],
      [0.06, 0.365],
      [0.07, 0.38],
      [0.062, 0.395],
      [0, 0.395],
    ],
    { at: [0, 0, 0], bone: base, color: GOLDP, segments: 8, smoothing: 0 },
  );
  // soul-glass beads on the grip
  for (const y of [0.88, 1.04]) {
    glow(sphere(0.02, TEAL, [0.052, y, 0.02], { flat: true }), 1.1);
  }

  // ------------------------------------------------------------------ blade (wing-finger scythe blade)
  const TILT = 18 * DEG;
  const BX: V3 = [1, 0, 0];
  const BY: V3 = [0, Math.cos(TILT), Math.sin(TILT)];
  const BZ: V3 = [0, -Math.sin(TILT), Math.cos(TILT)];
  const BO: V3 = [0, 2.18, 0];
  const Bp = (u: number, v: number, w = 0): V3 => [
    BO[0] + BX[0] * u + BY[0] * v + BZ[0] * w,
    BO[1] + BX[1] * u + BY[1] * v + BZ[1] * w,
    BO[2] + BX[2] * u + BY[2] * v + BZ[2] * w,
  ];
  const OUT = [
    [-0.06, 0.16],
    [0.25, 0.4],
    [0.75, 0.48],
    [1.18, 0.26],
    [1.48, -0.12],
    [1.62, -0.58],
  ];
  const INN = [
    [-0.06, -0.02],
    [0.28, 0.12],
    [0.75, 0.14],
    [1.1, -0.04],
    [1.38, -0.34],
    [1.62, -0.58],
  ];
  const outer = catmull(OUT.map(([u, v]) => [u, v, 0]));
  const inner = catmull(INN.map(([u, v]) => [u, v, 0]));
  const pk = (t: number, k: number): [number, number] => {
    const a = outer.at(t);
    const c = inner.at(t);
    return [a.x + (c.x - a.x) * k, a.y + (c.y - a.y) * k];
  };
  const bandOutline = (k0: number, k1: number, n = 36): OutlinePoint[] => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) pts.push(pk(i / n, k0));
    for (let i = n; i >= 0; i--) pts.push(pk(i / n, k1));
    const out: OutlinePoint[] = [];
    pts.forEach((p, i) => {
      const prev = out[out.length - 1];
      if (prev && Math.hypot(prev[0] - p[0], prev[1] - p[1]) < 0.004) return;
      out.push(i === n ? [p[0], p[1], "sharp"] : [p[0], p[1]]);
    });
    return out;
  };
  const band = (k0: number, k1: number, thick: number, color: string | typeof BONEP, bevel = 0.004) =>
    b.extrude(bandOutline(k0, k1), { at: BO, x: BX, y: BY, thickness: thick, bevel, color, bone: base, name: `blade${Math.round(k0 * 100)}` });
  band(0.04, 0.34, 0.05, BONE_SCALES, 0.007);
  band(0.34, 0.56, 0.036, BLADE_DARK, 0.004);
  glow(band(0.56, 0.76, 0.028, TEAL_DP, 0.003), 1);
  glow(band(0.76, 0.92, 0.02, TEAL, 0.003), 1.15);
  glow(band(0.92, 1, 0.012, WHITE_HOT, 0.002), 1.4);
  // rim bone along the spine of the blade
  const rimPts = (k: number, w: number, lo = 0, hi = 1, n = 16): V3[] => {
    const out: V3[] = [];
    for (let i = 0; i <= n; i++) {
      const t = lo + ((hi - lo) * i) / n;
      const [u, v] = pk(t, k);
      out.push(Bp(u, v, w));
    }
    return out;
  };
  b.sweep(catmull(rimPts(0.02, 0, 0, 0.985)), [0.036, 0.034, 0.03, 0.02, 0.004], { ...O(), color: BONEP, sides: 6, caps: { start: "flat", end: "point" } });
  // knuckles along the rim
  for (const t of [0.22, 0.42, 0.62, 0.8]) {
    const [u, v] = pk(t, 0.02);
    sphere(0.046 - t * 0.02, BONEP, Bp(u, v), {}, 7, 5);
    part(new THREE.TorusGeometry(0.037 - t * 0.012, 0.007, 4, 8), GOLD, { at: Bp(u, v), dir: [0, 0, 1], axis: "z", flat: true });
  }
  // dorsal dragon spines
  const ts = [0.1, 0.18, 0.27, 0.36, 0.46, 0.56, 0.66, 0.76, 0.86];
  ts.forEach((t, i) => {
    const e = 0.01;
    const a = outer.at(Math.max(0, t - e));
    const c = outer.at(Math.min(1, t + e));
    const T = new THREE.Vector2(c.x - a.x, c.y - a.y).normalize();
    let N = new THREE.Vector2(-T.y, T.x);
    const [ou, ov] = pk(t, 0);
    const [iu, iv] = pk(t, 1);
    if (N.x * (ou - iu) + N.y * (ov - iv) < 0) N = N.negate();
    const d = new THREE.Vector2().addScaledVector(N, 0.75).addScaledVector(T, 0.55).normalize();
    const len = (0.17 - t * 0.1) * (i % 2 ? 0.85 : 1.05);
    const bp = Bp(ou - N.x * 0.012, ov - N.y * 0.012, 0);
    const dir: V3 = [BX[0] * d.x + BY[0] * d.y, BX[1] * d.x + BY[1] * d.y, BX[2] * d.x + BY[2] * d.y];
    b.spike(bp, dir, len, 0.03 - t * 0.015, { ...O(), color: BONEP, sides: 6 });
    // gold sleeve at the spine root
    part(new THREE.CylinderGeometry(0.034 - t * 0.014, 0.039 - t * 0.016, 0.014, 6), GOLD, { at: bp, dir, flat: true });
  });
  // finger-bone ribs across both faces
  for (const t of [0.3, 0.5, 0.68, 0.84]) {
    const [eu, ev] = pk(t, 0.9);
    for (const w of [0.03, -0.03]) {
      const a = Bp(0.02, 0.06, w);
      const e = Bp(eu, ev, w);
      const cmid = Bp((0.02 + eu) / 2 + 0.05, (0.06 + ev) / 2 + 0.16, w);
      b.sweep(bezier(a, cmid, e), [0.014, 0.003], { ...O(), color: BONEP, sides: 5, caps: "point" });
    }
  }
  // blade runes (glowing gold) on both faces of the dark band
  [0.14, 0.26, 0.38, 0.5, 0.62, 0.74].forEach((t, i) => {
    const [u, v] = pk(t, 0.45);
    for (const side of [1, -1])
      glow(
        part(new THREE.PlaneGeometry(0.06 - t * 0.03, 0.06 - t * 0.03), "#ffffff", {
          at: Bp(u, v, side * 0.0195),
          dir: side > 0 ? BZ : [-BZ[0], -BZ[1], -BZ[2]],
          axis: "z",
          up: BY,
          texture: RUNES[(i + (side > 0 ? 0 : 2)) % RUNES.length],
        }),
        1.1,
      );
  });
  // soul-fire licking off the cutting edge
  const flameFrames = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9].map((t, i) => {
    const e = 0.01;
    const a = inner.at(Math.max(0, t - e));
    const c = inner.at(Math.min(1, t + e));
    const T = new THREE.Vector2(c.x - a.x, c.y - a.y).normalize();
    let N = new THREE.Vector2(-T.y, T.x);
    const [ou, ov] = pk(t, 0);
    const [iu, iv] = pk(t, 1);
    if (N.x * (iu - ou) + N.y * (iv - ov) < 0) N = N.negate();
    const d = new THREE.Vector2().addScaledVector(N, 1).addScaledVector(T, -0.35 + (i % 2) * 0.5).normalize();
    return frame(Bp(iu, iv, 0), [BX[0] * d.x + BY[0] * d.y, BX[1] * d.x + BY[1] * d.y, BX[2] * d.x + BY[2] * d.y]);
  });
  glow(
    b.cards(flameFrames, WISP, {
      size: [0.1, 0.24],
      vary: 0.35,
      rng: rand,
      flow: BZ,
      cross: true,
      spin: 0,
      bone: base,
      sink: 0.2,
    }),
    1.2,
  );

  // blade root: gold clamp plates with teal gems
  const clamp: OutlinePoint[] = [
    [-0.12, -0.13],
    [0.1, -0.12],
    [0.3, -0.03],
    [0.38, 0.12],
    [0.3, 0.27],
    [0.1, 0.26],
    [-0.12, 0.24],
  ];
  for (const side of [1, -1]) {
    b.extrude(clamp, { at: Bp(0, 0, side * 0.034), x: BX, y: BY, thickness: 0.014, bevel: 0.004, smoothing: 1, color: GOLDP, bone: base });
    glow(b.part(new THREE.OctahedronGeometry(0.036), TEAL, { bone: base, at: Bp(0.17, 0.07, side * 0.052), scale: [1, 1.3, 0.8], flat: true }), 1.2);
    for (const [u, v] of [
      [0.03, -0.07],
      [0.03, 0.19],
      [0.27, 0.15],
      [0.27, 0.0],
    ])
      sphere(0.012, GOLD_LT, Bp(u, v, side * 0.043), {}, 5, 4);
  }
  // haft top socket collar
  b.lathe(
    [
      [0, 2.04],
      [0.062, 2.04],
      [0.09, 2.08],
      [0.078, 2.14],
      [0.092, 2.2],
      [0.075, 2.27],
      [0, 2.27],
    ],
    { at: [0, 0, 0], bone: base, color: GOLDP, segments: 8, smoothing: 0 },
  );
  b.spike([0, 2.27, 0], [0, 1, 0], 0.12, 0.05, { ...O(), color: GOLDP, sides: 8 });

  // ------------------------------------------------------------------ counter claws (the wing thumb)
  for (const [pts, r] of [
    [
      [Bp(-0.04, 0.1), Bp(-0.28, 0.16), Bp(-0.5, 0.38), Bp(-0.56, 0.74)],
      [0.06, 0.004],
    ],
    [
      [Bp(-0.04, 0.0), Bp(-0.25, -0.06), Bp(-0.43, -0.22), Bp(-0.44, -0.46)],
      [0.045, 0.004],
    ],
  ] as [V3[], [number, number]][]) {
    b.sweep(catmull(pts), r, { ...O(), color: BONEP, sides: 6, caps: "point" });
    // gold ring sleeves along the claw and a teal vein
    for (const t of [0.22, 0.46]) {
      const path = catmull(pts);
      const p = path.at(t);
      const tg = path.tangentAt(t);
      part(new THREE.CylinderGeometry(r[0] * (1 - t) + 0.014, r[0] * (1 - t) + 0.02, 0.02, 7), GOLD, {
        at: [p.x, p.y, p.z],
        dir: [tg.x, tg.y, tg.z],
        flat: true,
      });
    }
    glow(b.sweep(catmull(pts.map((p) => [p[0], p[1], p[2] + 0.02] as V3)).slice(0.45, 0.95), [0.009, 0.002], { ...O(), color: TEAL, sides: 4, caps: "point" }), 1);
  }

  // ------------------------------------------------------------------ dragon skull
  cur = skull;
  const R3: [number, number, number] = [PITCH, 0, 0];
  part(new THREE.SphereGeometry(0.115, 10, 8), BONEP, { at: H3(0, 0.02, 0), scale: [0.95, 0.88, 1.2], rotation: R3, flat: true });
  // snout loft
  const SN = [
    { z: 0.07, y: 0.0, w: 0.16, h: 0.12 },
    { z: 0.2, y: -0.015, w: 0.13, h: 0.1 },
    { z: 0.33, y: -0.025, w: 0.105, h: 0.085 },
    { z: 0.44, y: -0.03, w: 0.095, h: 0.075 },
  ];
  b.loft(
    SN.map((s) => ({ at: H3(0, s.y, s.z), w: s.w, h: s.h })),
    { ...O(), color: BONEP },
  );
  const lerpSN = (z: number) => {
    for (let i = 0; i < SN.length - 1; i++) {
      const a = SN[i];
      const c = SN[i + 1];
      if (z <= c.z) {
        const t = Math.min(1, Math.max(0, (z - a.z) / (c.z - a.z)));
        return { y: a.y + (c.y - a.y) * t, w: a.w + (c.w - a.w) * t, h: a.h + (c.h - a.h) * t };
      }
    }
    return SN[SN.length - 1];
  };
  // nose cap, nostrils, nose ridge
  part(new THREE.SphereGeometry(0.052, 8, 6), BONEP, { at: H3(0, -0.026, 0.44), scale: [1, 0.78, 0.9], rotation: R3, flat: true });
  for (const s of [1, -1]) sphere(0.012, VOID, H3(s * 0.026, -0.008, 0.475), { rotation: R3 }, 6, 4);
  for (let i = 0; i < 4; i++) {
    const z = 0.1 + i * 0.1;
    const st = lerpSN(z);
    part(new THREE.ConeGeometry(0.018 - i * 0.002, 0.05, 5), BONE_MID, { at: H3(0, st.y + st.h / 2 + 0.006, z), dir: Hd(0, 1, -0.5), flat: true });
  }
  // brow ridges, sockets, eyes, cheek spikes, horns, frills, crown
  for (const s of [1, -1]) {
    b.sweep([H3(s * 0.03, 0.082, 0.1), H3(s * 0.108, 0.07, 0.0)], 0.024, { ...O(), color: BONEP, sides: 5 });
    part(new THREE.SphereGeometry(0.034, 8, 6), VOID, { at: H3(s * 0.082, 0.04, 0.08), scale: [0.8, 1, 1.1], rotation: R3, flat: true });
    glow(part(new THREE.SphereGeometry(0.021, 8, 6), TEAL_LT, { at: H3(s * 0.088, 0.042, 0.092), rotation: R3 }), 1.6);
    part(new THREE.SphereGeometry(0.02, 6, 4), VOID, { at: H3(s * 0.088, 0.042, 0.109), scale: [0.22, 1, 0.3], rotation: R3, flat: true });
    // cheek spikes
    b.spike(H3(s * 0.09, -0.03, 0.02), Hd(s * 1, -0.3, -0.4), 0.1, 0.022, { ...O(), color: BONEP, sides: 6 });
    b.spike(H3(s * 0.08, -0.05, 0.08), Hd(s * 1, -0.5, 0.1), 0.06, 0.016, { ...O(), color: BONEP, sides: 5 });
    // swept-back horns
    const hp = [H3(s * 0.07, 0.08, -0.05), H3(s * 0.17, 0.13, -0.2), H3(s * 0.3, 0.14, -0.36), H3(s * 0.43, 0.2, -0.43)];
    b.sweep(catmull(hp), [0.04, 0.004], {
      ...O(),
      sides: 6,
      caps: "point",
      color: BONEP,
    });
    const hpath = catmull(hp);
    for (const t of [0.12, 0.3, 0.5]) {
      const p = hpath.at(t);
      const tg = hpath.tangentAt(t);
      part(new THREE.CylinderGeometry(0.036 * (1 - t) + 0.007, 0.036 * (1 - t) + 0.014, 0.02, 7), GOLD, {
        at: [p.x, p.y, p.z],
        dir: [tg.x, tg.y, tg.z],
        flat: true,
      });
    }
    glow(b.sweep(catmull(hp.map((p) => [p[0], p[1] + 0.02, p[2]] as V3)).slice(0.55, 0.96), [0.01, 0.002], { ...O(), color: TEAL, sides: 4, caps: "point" }), 1);
    // small secondary brow horn
    b.sweep(catmull([H3(s * 0.06, 0.09, 0.05), H3(s * 0.1, 0.17, 0.0), H3(s * 0.12, 0.23, -0.07)]), [0.026, 0.003], { ...O(), color: BONEP, sides: 5, caps: "point" });
    // side frill (fan) with glowing membrane
    const frillOut: OutlinePoint[] = [
      [0.0, 0.05],
      [0.07, 0.12],
      [0.12, 0.2],
      [0.18, 0.12],
      [0.25, 0.16],
      [0.26, 0.05],
      [0.2, 0.0],
      [0.26, -0.08],
      [0.15, -0.06],
      [0.08, -0.1],
      [0.0, -0.05],
    ];
    const fx = Hd(0, 0, -1);
    const fy = Hd(0, 1, 0);
    const fa = H3(s * 0.098, 0.0, -0.03);
    b.extrude(frillOut, { at: fa, x: fx, y: fy, thickness: 0.012, bevel: 0.003, smoothing: 1, color: VIOLET_MD, bone: skull });
    const inset: OutlinePoint[] = frillOut.map(([x, y]) => [0.02 + x * 0.78, y * 0.7] as OutlinePoint);
    glow(
      b.extrude(inset, {
        at: H3(s * 0.098, 0.0, -0.03),
        x: fx,
        y: fy,
        thickness: 0.02,
        bevel: 0.003,
        smoothing: 1,
        color: TEAL_DP,
        bone: skull,
      }),
      1,
    );
    for (const [fxm, fym] of [
      [0.12, 0.2],
      [0.25, 0.16],
      [0.26, 0.05],
      [0.26, -0.08],
    ])
      for (const side of [1, -1]) {
        const a = H3(s * 0.098 + 0 + 0, 0.01, -0.035);
        const tip = H3(s * (0.098 + side * 0.012), fym, -0.03 - fxm);
        b.spike(a, tip, null, 0.007, { ...O(), color: BONEP, sides: 4 });
      }
  }
  // gold brow crown + forehead gem
  b.sweep(catmull([H3(-0.108, 0.065, -0.005), H3(-0.07, 0.098, 0.088), H3(0, 0.108, 0.108), H3(0.07, 0.098, 0.088), H3(0.108, 0.065, -0.005)]), 0.011, { ...O(), color: GOLDP, sides: 5 });
  glow(part(new THREE.OctahedronGeometry(0.024), TEAL, { at: H3(0, 0.11, 0.114), scale: [0.9, 1.3, 0.7], rotation: R3, flat: true }), 1.4);
  // upper teeth
  for (const s of [1, -1]) {
    for (let i = 0; i < 6; i++) {
      const z = 0.12 + i * 0.058;
      const st = lerpSN(z);
      const yb = st.y - st.h / 2;
      const big = i === 4;
      part(new THREE.ConeGeometry(big ? 0.017 : 0.01, big ? 0.085 : 0.036 + (i % 2) * 0.01, 5), BONE_LT, {
        at: H3(s * (st.w / 2 - 0.006), yb - (big ? 0.036 : 0.014), z),
        dir: Hd(0, -1, 0),
        flat: true,
      });
    }
  }
  // gold nose ring
  glow(part(new THREE.TorusGeometry(0.042, 0.005, 4, 10), TEAL_DP, { at: H3(0, -0.058, 0.455), dir: Hd(0, 0, 1), axis: "z", flat: true }), 1);

  // lower jaw (own bone)
  cur = jaw;
  const JW = [
    { z: 0.02, y: -0.07, w: 0.115, h: 0.04 },
    { z: 0.2, y: -0.082, w: 0.095, h: 0.036 },
    { z: 0.36, y: -0.088, w: 0.07, h: 0.03 },
  ];
  b.loft(
    JW.map((s) => ({ at: H3(0, s.y, s.z), w: s.w, h: s.h })),
    { ...O(), color: BONEP },
  );
  sphere(0.036, BONEP, H3(0, -0.088, 0.37), { scale: [1.1, 0.8, 1], rotation: R3 }, 7, 5);
  for (const s of [1, -1]) {
    for (let i = 0; i < 5; i++) {
      const z = 0.08 + i * 0.07;
      const t = Math.min(1, z / 0.36);
      const w = 0.115 + (0.07 - 0.115) * t;
      const y = -0.07 + (-0.088 + 0.07) * t + 0.02;
      part(new THREE.ConeGeometry(0.009, 0.034 + (i % 2) * 0.012, 5), BONE_LT, { at: H3(s * (w / 2 - 0.005), y + 0.014, z), dir: Hd(0, 1, 0), flat: true });
    }
    // lower jaw spike
    b.spike(H3(s * 0.052, -0.09, 0.07), Hd(s * 0.6, -0.5, -0.5), 0.08, 0.018, { ...O(), color: BONEP, sides: 5 });
  }
  b.sweep([H3(0, -0.058, 0.06), H3(0, -0.058, 0.32)], [0.02, 0.012], { ...O(), color: TEAL_DP, caps: "round", sides: 5 }); // tongue (glow set below)
  glow(b.sweep([H3(0, -0.056, 0.07), H3(0, -0.056, 0.3)], [0.017, 0.008], { ...O(), color: TEAL, caps: "round", sides: 5 }), 1.2);
  // chin gold plate
  b.extrude(
    [
      [0, 0.02],
      [0.02, 0.0],
      [0.0, -0.045],
      [-0.02, 0.0],
    ],
    { at: H3(0, -0.1, 0.33), x: [1, 0, 0], y: Hd(0, 0, 1), thickness: 0.012, color: GOLDP, bone: jaw },
  );

  // ------------------------------------------------------------------ soul orb held before the open maw
  cur = orbJ;
  const OC = H3(0, -0.12, 0.52);
  glow(part(new THREE.SphereGeometry(0.075, 9, 7), TEAL, { at: OC, flat: true }), 1.4);
  glow(part(new THREE.SphereGeometry(0.042, 7, 5), WHITE_HOT, { at: OC, flat: true }), 1.8);
  glow(part(new THREE.TorusGeometry(0.115, 0.006, 4, 20), TEAL_LT, { at: OC, rotation: [60, 0, 20] }), 1.3);
  glow(part(new THREE.TorusGeometry(0.135, 0.005, 4, 22), GOLD_LT, { at: OC, rotation: [-40, 30, 0] }), 1.2);
  const orbFrames: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4;
    const el = [0.9, 0.2, -0.4, 0.55, 0.0, 0.75, -0.2][i];
    const d = new THREE.Vector3(Math.sin(a) * Math.cos(el), Math.sin(el), Math.cos(a) * Math.cos(el));
    orbFrames.push(frame([OC[0] + d.x * 0.065, OC[1] + d.y * 0.065, OC[2] + d.z * 0.065], [d.x, d.y, d.z]));
  }
  glow(b.cards(orbFrames, WISP, { size: [0.05, 0.11], vary: 0.3, rng: rand, flow: [0, 0, 1], cross: true, bone: orbJ, sink: 0.2 }), 1.2);
  b.pose(jaw, { axis: [1, 0, 0], deg: 27 });

  // ------------------------------------------------------------------ hanging charm on the lower claw
  const charm = b.joint("charm", { parent: base, at: Bp(-0.44, -0.46), dir: [0, -1, 0], role: "hinge" });
  cur = charm;
  const cp = Bp(-0.44, -0.46);
  for (let i = 0; i < 6; i++)
    part(new THREE.TorusGeometry(0.012, 0.0035, 4, 8), i % 2 ? GOLD_LT : GOLD, {
      at: [cp[0], cp[1] - 0.018 - i * 0.026, cp[2]],
      rotation: [0, i % 2 ? 90 : 0, 0],
      flat: true,
    });
  glow(part(new THREE.OctahedronGeometry(0.035), TEAL, { at: [cp[0], cp[1] - 0.245, cp[2]], scale: [0.8, 1.7, 0.8], flat: true }), 1.2);
  part(new THREE.CylinderGeometry(0.022, 0.02, 0.016, 6), GOLD, { at: [cp[0], cp[1] - 0.18, cp[2]], flat: true });

  // ------------------------------------------------------------------ ribbons (tattered violet banners)
  const ribbon = (joint: typeof ribbonA, top: V3, pts: V3[], width: number, long: number) => {
    cur = joint;
    const eA = [top, ...pts];
    const eB = eA.map((p, i) => [p[0] + width * (1 - (i / eA.length) * 0.85), p[1] - 0.005 * i, p[2] + 0.015 * i] as V3);
    eB[eB.length - 1] = eA[eA.length - 1];
    b.membrane(eA, eB, {
      thickness: 0.008,
      color: paint((_p, _n, s) => {
        const edge = Math.min(s[1], 1 - s[1]);
        if (edge < 0.07 && s[0] < 0.92) return GOLD;
        if (s[0] > 0.64) return mix(VIOLET_MD, TEAL_DP, smoothstep(0.64, 0.96, s[0]));
        return mix(VIOLET, VIOLET_MD, s[0] * 1.2 + noise(_p, 0.1, 9) * 0.3);
      }),
      bone: joint,
      rows: 3,
      cols: Math.round(long * 8),
    });
    part(new THREE.CylinderGeometry(0.02, 0.02, width + 0.03, 6), GOLD, { at: [top[0] + width / 2, top[1], top[2]], dir: [1, 0, 0], flat: true });
  };
  ribbon(ribbonA, [-0.075, 1.95, -0.075], [[-0.11, 1.72, -0.2], [-0.14, 1.42, -0.24], [-0.12, 1.1, -0.32], [-0.16, 0.8, -0.34]], 0.12, 1.2);
  ribbon(ribbonB, [0.0, 1.9, -0.075], [[0.06, 1.7, -0.19], [0.08, 1.44, -0.2], [0.05, 1.2, -0.28], [0.08, 1.0, -0.3]], 0.1, 0.95);

  // ------------------------------------------------------------------ orbiting souls on the haft
  cur = soulRing;
  const orbCards: ReturnType<typeof frame>[] = [];
  for (let i = 0; i < 5; i++) {
    const a = i * 72 * DEG + 0.4;
    const r = 0.22 + (i % 2) * 0.05;
    const y = 1.34 + i * 0.09;
    const p: V3 = [Math.sin(a) * r, y, Math.cos(a) * r];
    glow(part(new THREE.IcosahedronGeometry(0.03, 0), TEAL_LT, { at: p, flat: true }), 1.5);
    orbCards.push(frame([p[0], p[1] + 0.01, p[2]], [0, 1, 0]));
  }
  glow(b.cards(orbCards, WISP, { size: [0.06, 0.18], vary: 0.3, rng: rand, flow: [0, 0, 1], cross: true, bone: soulRing, sink: 0.1 }), 1.2);
  cur = soulDrift;
  const dr: ReturnType<typeof frame>[] = [];
  [
    [0.55, 1.98, -0.02],
    [0.82, 1.86, -0.05],
    [1.08, 1.76, -0.08],
    [1.3, 1.62, -0.09],
  ].forEach(([x, y, z]) => {
    glow(part(new THREE.IcosahedronGeometry(0.022, 0), TEAL_LT, { at: [x, y, z], flat: true }), 1.5);
    dr.push(frame([x, y + 0.01, z], [0, 1, 0]));
  });
  glow(b.cards(dr, WISP, { size: [0.05, 0.14], vary: 0.3, rng: rand, flow: [0, 0, 1], cross: true, bone: soulDrift, sink: 0.1 }), 1.2);

  return b.root;
}
