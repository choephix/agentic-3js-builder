import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { rng } from "../../../../src/math";
import { catmull, polyline } from "../../../../src/path";
import { cells, mottle, noise, paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel } from "../../../../kits/toon";

export const meta = {
  name: "Basalt Lava Golem",
  description:
    "A three-metre guardian of stacked hexagonal basalt columns and plates, its molten core showing through glowing seams, wearing ornate gold trim, a pyro sun emblem, tassels and a floating gold halo.",
  style: "Genshin Impact",
  commit: "88fc1f0",
};

type P = [number, number, number];
type Builder = ReturnType<typeof createBuilder>;
type Bone = ReturnType<Builder["joint"]>;
type Col = string | Paint;

// ---------------------------------------------------------------------------------------------------------------
// Palette

const LAVA_Y = "#ffd45c";
const LAVA_O = "#ff8a1f";
const LAVA_R = "#f04a16";
const HOT = "#fff3b8";
const TOOTH = "#f1d9a6";
const GOLD = cel("#ffcc4d", "#d78a22");
const CLOTH = cel("#d8372a", "#9c1f2e");

const CRACK_CORE = "#ffcf4a";
const CRACK_MID = "#ff6a1c";
const CRACK_EDGE = "#6f2a22";

/** Cel-shaded basalt: mottled violet-grey, ash on upward faces, ember glow under overhangs, optional molten cracks. */
function rockPaint(a: string, c: string, seed: number, cracked: boolean): Paint {
  const base = cel(mottle(a, c, { size: 0.2, seed, contrast: 1.4 }));
  const ash = cel("#7a6f90", "#5b5173");
  const under = cel("#9a3a26", "#6d2420");
  return paint((p, n) => {
    if (cracked) {
      const cell = cells(p, 0.34, seed + 40);
      const e = cell.d2 - cell.d1;
      if (e < 0.05) return CRACK_CORE;
      if (e < 0.1) return CRACK_MID;
      if (e < 0.15) return CRACK_EDGE;
    }
    if (n.y < -0.45) return under;
    if (n.y > 0.75 && noise(p, 0.3, seed) > 0.45) return ash;
    return base;
  });
}

const ROCKS: Paint[] = [
  rockPaint("#2e2838", "#3d3548", 1, false),
  rockPaint("#3f384f", "#52496a", 2, false),
  rockPaint("#554b69", "#6a5f82", 3, false),
  rockPaint("#2b2534", "#3a3245", 4, true),
  rockPaint("#3b3449", "#4c4361", 5, true),
];

// ---------------------------------------------------------------------------------------------------------------
// Outlines

const PEC: OutlinePoint[] = [
  [0.12, 0.04],
  [0.5, 0.0],
  [0.58, 0.22],
  [0.54, 0.46],
  [0.3, 0.52],
  [0.12, 0.44],
];
const BACKP: OutlinePoint[] = [
  [0.06, 0.04],
  [0.5, 0.0],
  [0.58, 0.26],
  [0.46, 0.5],
  [0.1, 0.46],
];
const ABS: OutlinePoint[] = [
  [-0.13, -0.05],
  [0.13, -0.05],
  [0.13, 0.05],
  [-0.13, 0.05],
];
const TASSET: OutlinePoint[] = [
  [-0.15, 0.0],
  [0.15, 0.0],
  [0.15, -0.34],
  [0.0, -0.46],
  [-0.15, -0.34],
];
const HEX: OutlinePoint[] = Array.from({ length: 6 }, (_, i): OutlinePoint => [
  0.2 * Math.cos((i * Math.PI) / 3),
  0.2 * Math.sin((i * Math.PI) / 3),
]);
const SKULL: OutlinePoint[] = [
  [-0.16, -0.17],
  [0.16, -0.17],
  [0.27, -0.06],
  [0.27, 0.14],
  [0.17, 0.2],
  [-0.17, 0.2],
  [-0.27, 0.14],
  [-0.27, -0.06],
];
const JAW: OutlinePoint[] = [
  [-0.15, -0.08],
  [0.15, -0.08],
  [0.24, 0.07],
  [-0.24, 0.07],
];
const EYE: OutlinePoint[] = [
  [0.035, -0.025],
  [0.175, 0.02],
  [0.15, 0.055],
  [0.035, 0.005],
];
const BROW: OutlinePoint[] = [
  [0.02, 0.0],
  [0.27, 0.03],
  [0.29, 0.1],
  [0.02, 0.075],
];
const DIAMOND: OutlinePoint[] = [
  [0, -0.07],
  [0.07, 0],
  [0, 0.07],
  [-0.07, 0],
];
const CHIN: OutlinePoint[] = [
  [-0.1, -0.07],
  [0.1, -0.07],
  [0.13, 0.0],
  [-0.13, 0.0],
];

const flipX = (pts: OutlinePoint[]): OutlinePoint[] => pts.map(([x, y]) => [-x, y] as OutlinePoint).reverse();
/** The outline for the side `s` (+1 = model left) of a plate facing `facing` (+1 front, -1 back). */
const sideOf = (pts: OutlinePoint[], s: number, facing = 1): OutlinePoint[] => (s * facing > 0 ? pts : flipX(pts));
const grow = (pts: OutlinePoint[], k: number): OutlinePoint[] => {
  let cx = 0;
  let cy = 0;
  for (const [x, y] of pts) {
    cx += x;
    cy += y;
  }
  cx /= pts.length;
  cy /= pts.length;
  return pts.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as OutlinePoint);
};

const lerpP = (p: P, q: P, t: number): P => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
const dirP = (p: P, q: P): P => [q[0] - p[0], q[1] - p[1], q[2] - p[2]];

export default function build() {
  const b = createBuilder({ name: "lavaGolem", paintSize: 2048 });
  const R = rng(2024);
  const pickRock = () => ROCKS[Math.floor(R() * ROCKS.length)];

  // -------------------------------------------------------------------------------------------------------------
  // Drawings

  const rays = Array.from(
    { length: 12 },
    (_, i) => `<path d="M50 3 L56 17 L44 17 Z" transform="rotate(${i * 30} 50 50)" fill="#ffc94a"/>`,
  ).join("");
  const EMBLEM = svg(
    `<svg viewBox="0 0 100 100">${rays}
<circle cx="50" cy="50" r="33" fill="#2d1216" stroke="#ffc94a" stroke-width="3.5"/>
<circle cx="50" cy="50" r="27" fill="none" stroke="#c98a2b" stroke-width="1.6"/>
<path d="M50 22 C62 36 72 48 63 62 C58 71 42 71 37 62 C28 48 43 40 50 22 Z" fill="#ff7a1c"/>
<path d="M50 38 C58 48 61 55 56 62 C53 67 47 67 44 62 C40 55 46 48 50 38 Z" fill="#ffd45c"/>
<path d="M50 52 C54 57 54 61 50 64 C46 61 46 57 50 52 Z" fill="#fff3b8"/>
</svg>`,
    { size: 256 },
  );
  const RUNE = svg(
    `<svg viewBox="0 0 40 80"><g fill="none" stroke="#ffb02e" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
<path d="M20 6 L20 74"/><path d="M8 18 L20 28 L32 18"/><path d="M10 40 L20 50 L30 40"/><path d="M8 62 L20 72 L32 62"/>
</g></svg>`,
    { size: 256 },
  );
  const FILIGREE = svg(
    `<svg viewBox="0 0 60 80"><g fill="none" stroke-linecap="round" stroke-linejoin="round">
<rect x="3" y="3" width="54" height="74" rx="4" stroke="#ffc94a" stroke-width="2.6"/>
<rect x="8" y="8" width="44" height="64" rx="2" stroke="#c98a2b" stroke-width="1.6"/>
<path d="M8 22 C8 13 13 8 22 8" stroke="#ffc94a" stroke-width="1.8"/>
<path d="M52 22 C52 13 47 8 38 8" stroke="#ffc94a" stroke-width="1.8"/>
<path d="M30 20 L43 40 L30 60 L17 40 Z" stroke="#ffc94a" stroke-width="2.2"/>
<path d="M30 28 L36 40 L30 52 L24 40 Z" stroke="#c98a2b" stroke-width="1.6"/>
<path d="M14 66 C21 58 28 70 35 62 C40 57 44 61 46 66" stroke="#ffc94a" stroke-width="1.8"/>
</g><circle cx="30" cy="40" r="4.5" fill="#ff8a1f"/></svg>`,
    { size: 256 },
  );

  // -------------------------------------------------------------------------------------------------------------
  // Helpers

  const hexCol = (bone: Bone, at: P | THREE.Vector3, dir: P | THREE.Vector3, r: number, len: number, color: Col) =>
    b.part(new THREE.CylinderGeometry(r * 0.92, r, len, 6), color, { bone, at, dir, flat: true });

  const ember = (bone: Bone, at: P | THREE.Vector3, dir: P | THREE.Vector3, r: number, len: number, col = LAVA_O) =>
    glow(b.part(new THREE.CylinderGeometry(r * 0.85, r, len, 6), col, { bone, at, dir, flat: true }), 1.25);

  const gem = (bone: Bone, at: P | THREE.Vector3, r: number, col = LAVA_Y, k = 1.3) =>
    glow(b.part(new THREE.OctahedronGeometry(r, 0), col, { bone, at, flat: true }), k);

  const seam = (bone: Bone, pts: P[], r: number, col = LAVA_O, k = 1.2) =>
    glow(b.sweep(polyline(pts), r, { bone, color: col, section: { ngon: 4 }, caps: "flat" }), k);

  const band = (bone: Bone, at: P, axis: P, rin: number, w: number, h: number, color: Col = GOLD, seg = 8) =>
    b.lathe(
      [
        [rin, -h],
        [rin + w, -h],
        [rin + w, h],
        [rin, h],
      ],
      { at, axis, segments: seg, color, bone },
    );

  const studs = (bone: Bone, pts: P[], r: number, color: Col = GOLD) => {
    const geos = pts.map(([x, y, z]) => new THREE.SphereGeometry(r, 5, 4).translate(x, y, z));
    const merged = mergeGeometries(geos);
    if (merged) b.part(merged, color, { bone, at: [0, 0, 0] });
  };

  const plate = (
    bone: Bone,
    at: P,
    pts: OutlinePoint[],
    thick: number,
    color: Col,
    opts: { facing?: 1 | -1; trim?: number; bevel?: number } = {},
  ) => {
    const facing = opts.facing ?? 1;
    if (opts.trim)
      b.extrude(grow(pts, opts.trim), {
        at,
        x: [facing, 0, 0],
        thickness: thick - 0.03,
        bevel: 0.008,
        color: GOLD,
        bone,
      });
    return b.extrude(pts, { at, x: [facing, 0, 0], thickness: thick, bevel: opts.bevel ?? 0.015, color, bone });
  };

  const spikeP = (bone: Bone, base: P, dir: P, len: number, r: number, color: Col, tip = true) => {
    const d = new THREE.Vector3(...dir).normalize();
    const bs = new THREE.Vector3(...base);
    const body = tip ? len * 0.7 : len;
    b.part(new THREE.CylinderGeometry(r * 0.4, r, body, 6), color, {
      bone,
      at: bs.clone().addScaledVector(d, body / 2),
      dir: d,
      flat: true,
    });
    if (tip)
      glow(
        b.part(new THREE.CylinderGeometry(0, r * 0.4, len * 0.3, 6), LAVA_O, {
          bone,
          at: bs.clone().addScaledVector(d, body + len * 0.15),
          dir: d,
          flat: true,
        }),
        1.3,
      );
  };

  const tassel = (bone: Bone, top: P, len: number, col: Col) => {
    const end: P = [top[0], top[1] - len, top[2]];
    b.rod(top, end, [0.035, 0.02], col, { bone });
    b.part(new THREE.SphereGeometry(0.055, 6, 4), GOLD, { bone, at: top });
    for (const k of [-1, 0, 1])
      b.rod(end, [end[0] + k * 0.035, end[1] - 0.13, end[2]], [0.018, 0.004], col, { bone, caps: "point" });
    b.part(new THREE.OctahedronGeometry(0.04, 0), GOLD, { bone, at: end, flat: true });
  };

  /** A cage of hexagonal basalt columns round the segment a..b, leaving thin gaps where the molten core shows. */
  const cage = (o: {
    bone: Bone;
    a: P;
    b: P;
    count: number;
    radius: number;
    col: number;
    from?: number;
    to?: number;
    ref?: P;
    len?: [number, number];
    glowTop?: boolean;
  }) => {
    const A = new THREE.Vector3(...o.a);
    const B = new THREE.Vector3(...o.b);
    const d = B.clone().sub(A);
    const L = d.length();
    const dn = d.clone().normalize();
    const refA: P = o.ref ?? [0, 0, 1];
    const ref = new THREE.Vector3(...refA);
    const u = ref.clone().addScaledVector(dn, -ref.dot(dn));
    if (u.lengthSq() < 1e-6) u.set(1, 0, 0).addScaledVector(dn, -dn.x);
    u.normalize();
    const v = dn.clone().cross(u);
    const from = o.from ?? 0;
    const to = o.to ?? (Math.PI * 2 * (o.count - 1)) / o.count;
    const [l0, l1] = o.len ?? [0.8, 1];
    for (let i = 0; i < o.count; i++) {
      const ang = o.count === 1 ? from : from + ((to - from) * i) / (o.count - 1);
      const r = o.col * (0.9 + 0.25 * R());
      const len = L * (l0 + (l1 - l0) * R());
      const pos = A.clone()
        .addScaledVector(dn, L / 2 + (R() - 0.5) * (L - len))
        .addScaledVector(u, Math.cos(ang) * o.radius)
        .addScaledVector(v, Math.sin(ang) * o.radius);
      hexCol(o.bone, pos, dn, r, len, pickRock());
      if (o.glowTop)
        glow(
          b.part(new THREE.CylinderGeometry(r * 0.78, r * 0.78, 0.02, 6), LAVA_O, {
            bone: o.bone,
            at: pos.clone().addScaledVector(dn, len / 2 + 0.003),
            dir: dn,
            flat: true,
          }),
          1.2,
        );
    }
  };

  // -------------------------------------------------------------------------------------------------------------
  // Skeleton

  const hips = b.joint("hips", { at: [0, 1.12, 0] });
  const spine = b.chain(
    "spine",
    catmull([
      [0, 1.12, 0],
      [0, 1.62, 0.03],
      [0, 2.14, 0.07],
    ]),
    { parent: hips, names: ["spine1", "spine2", "chest"], role: "spine" },
  );
  const spine1 = spine.joints[0];
  const spine2 = spine.joints[1];
  const chest = spine.joints[2];
  const neck = b.joint("neck", { parent: chest, at: [0, 2.2, 0.08], aim: [0, 2.44, 0.16], role: "neck" });
  const head = b.joint("head", { parent: neck, at: [0, 2.44, 0.16], dir: [0, 0.15, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 2.5, 0.12], aim: [0, 2.5, 0.4], role: "jaw" });

  // -------------------------------------------------------------------------------------------------------------
  // Torso

  // Molten core: hotter toward the chest.
  glow(
    b.sweep(spine, (t) => [0.3 + 0.2 * t, 0.25 + 0.1 * t], {
      color: LAVA_O,
      bands: [
        [0.35, LAVA_R],
        [0.7, LAVA_O],
        [1, LAVA_Y],
      ],
      caps: "flat",
    }),
    1.2,
  );

  // Pelvis, belt, buckle.
  b.part(new THREE.BoxGeometry(0.8, 0.3, 0.54), pickRock(), { bone: hips, at: [0, 1.2, 0], flat: true });
  b.part(new THREE.BoxGeometry(0.86, 0.07, 0.6), GOLD, { bone: hips, at: [0, 1.34, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.09, 0.09, 0.05, 6), GOLD, { bone: hips, at: [0, 1.34, 0.31], dir: [0, 0, 1], flat: true });
  gem(hips, [0, 1.34, 0.345], 0.05, LAVA_Y);
  studs(
    hips,
    [-0.36, -0.26, -0.16, 0.16, 0.26, 0.36].map((x): P => [x, 1.34, 0.305]),
    0.014,
  );
  // Front tasset with gold filigree, tassels at its sides.
  plate(hips, [0, 1.27, 0.36], TASSET, 0.06, pickRock(), { trim: 1.1, bevel: 0.01 });
  b.part(new THREE.PlaneGeometry(0.26, 0.38), "#ffffff", {
    bone: hips,
    at: [0, 1.06, 0.394],
    dir: [0, 0, 1],
    axis: "z",
    texture: FILIGREE,
  });
  for (const s of [1, -1]) {
    tassel(hips, [s * 0.27, 1.3, 0.4], 0.42, CLOTH);
    // side hip plates
    b.part(new THREE.BoxGeometry(0.1, 0.26, 0.4), pickRock(), {
      bone: hips,
      at: [s * 0.43, 1.2, 0.02],
      dir: [s, 0.1, 0],
      flat: true,
    });
  }

  // Abdomen plates: two rows, a molten line between each.
  for (const y of [1.45, 1.57])
    for (const s of [1, -1]) plate(spine1, [s * 0.15, y, 0.34], ABS, 0.09, pickRock(), { bevel: 0.012 });
  gem(spine1, [0, 1.51, 0.36], 0.035, LAVA_Y);

  // Flank columns.
  for (const s of [1, -1])
    cage({ bone: spine2, a: [0, 1.36, 0.02], b: [0, 1.98, 0.06], count: 3, radius: 0.43, col: 0.075, from: s * 1.15, to: s * 2.0 });

  // Chest cap and trapezius.
  b.part(new THREE.BoxGeometry(1.0, 0.14, 0.5), pickRock(), { bone: chest, at: [0, 2.13, 0.05], flat: true });
  for (const s of [1, -1])
    b.part(new THREE.BoxGeometry(0.46, 0.1, 0.44), pickRock(), {
      bone: chest,
      at: [s * 0.38, 2.27, -0.02],
      dir: [s * 0.35, 1, 0.05],
      up: [0, 0, 1],
      flat: true,
    });

  // Pectorals, gold-trimmed, studded and runed.
  for (const s of [1, -1]) {
    plate(chest, [0, 1.62, 0.41], sideOf(PEC, s), 0.14, pickRock(), { trim: 1.07 });
    studs(
      chest,
      (
        [
          [0.2, 0.1],
          [0.48, 0.08],
          [0.52, 0.28],
          [0.46, 0.42],
        ] as Array<[number, number]>
      ).map(([x, y]): P => [s * x, 1.62 + y, 0.486]),
      0.018,
    );
    glow(
      b.part(new THREE.PlaneGeometry(0.12, 0.22), "#ffffff", {
        bone: chest,
        at: [s * 0.36, 1.88, 0.484],
        dir: [0, 0, 1],
        axis: "z",
        texture: RUNE,
      }),
      1.2,
    );
  }

  // Sternum medallion with the pyro emblem.
  plate(chest, [0, 1.88, 0.42], HEX, 0.15, pickRock(), { trim: 1.14, bevel: 0.02 });
  glow(
    b.part(new THREE.PlaneGeometry(0.32, 0.32), "#ffffff", {
      bone: chest,
      at: [0, 1.88, 0.5],
      dir: [0, 0, 1],
      axis: "z",
      texture: EMBLEM,
    }),
    1.1,
  );

  // Back: shoulder-blade plates, keel, spiked ridge, crown of columns.
  for (const s of [1, -1]) plate(chest, [0, 1.62, -0.3], sideOf(BACKP, s, -1), 0.12, pickRock(), { facing: -1, trim: 1.06 });
  b.part(new THREE.BoxGeometry(0.12, 0.8, 0.1), pickRock(), { bone: chest, at: [0, 1.75, -0.31], flat: true });
  for (let i = 0; i < 6; i++) {
    const y = 1.4 + 0.13 * i;
    spikeP(i < 2 ? spine1 : chest, [0, y, -0.34], [0, 0.55, -0.8], 0.2 + 0.02 * i, 0.075, pickRock());
  }
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    const h = 0.32 + 0.14 * (3 - Math.abs(k));
    const r = 0.06 + 0.012 * (3 - Math.abs(k));
    const dir = new THREE.Vector3(k * 0.07, 1, -0.18).normalize();
    const base = new THREE.Vector3(k * 0.14, 2.1, -0.26 - 0.02 * Math.abs(k));
    hexCol(chest, base.clone().addScaledVector(dir, h / 2), dir, r, h, pickRock());
    glow(
      b.part(new THREE.CylinderGeometry(r * 0.75, r * 0.75, 0.02, 6), LAVA_O, {
        bone: chest,
        at: base.clone().addScaledVector(dir, h + 0.004),
        dir,
        flat: true,
      }),
      1.3,
    );
  }

  // Neck: molten column inside a cage, gold collar.
  glow(b.rod([0, 2.1, 0.05], [0, 2.46, 0.17], 0.14, { bone: neck, color: LAVA_R }), 1.1);
  cage({ bone: neck, a: [0, 2.17, 0.07], b: [0, 2.42, 0.15], count: 5, radius: 0.17, col: 0.06, glowTop: true });
  band(neck, [0, 2.23, 0.09], [0, 0.24, 0.08], 0.22, 0.035, 0.02, GOLD, 8);

  // Halo: a gold ring floating behind the shoulders, with flame spokes and gems.
  {
    const H0: P = [0, 2.3, -0.62];
    const HR = 0.5;
    band(chest, H0, [0, 0, 1], HR - 0.04, 0.08, 0.025, GOLD, 24);
    glow(
      b.lathe(
        [
          [HR - 0.075, -0.012],
          [HR - 0.04, -0.012],
          [HR - 0.04, 0.012],
          [HR - 0.075, 0.012],
        ],
        { at: H0, axis: [0, 0, 1], segments: 24, color: LAVA_O, bone: chest },
      ),
      1.2,
    );
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + Math.PI / 8;
      const out = new THREE.Vector3(Math.sin(a), Math.cos(a), 0);
      const c = new THREE.Vector3(...H0).addScaledVector(out, HR + 0.05);
      b.part(new THREE.CylinderGeometry(0, 0.04, 0.14, 5), GOLD, { bone: chest, at: c, dir: out, flat: true });
    }
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      gem(chest, [HR * Math.sin(a), H0[1] + HR * Math.cos(a), H0[2] + 0.02], 0.05, LAVA_Y, 1.4);
    }
    for (const s of [1, -1]) {
      b.rod([s * 0.45, 2.07, -0.6], [s * 0.3, 2.1, -0.36], 0.016, GOLD, { bone: chest });
      b.rod([s * 0.24, 1.82, -0.6], [s * 0.14, 1.86, -0.38], 0.016, GOLD, { bone: chest });
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Head

  b.extrude(SKULL, { at: [0, 2.64, 0.2], x: [1, 0, 0], thickness: 0.38, bevel: 0.03, color: pickRock(), bone: head });
  // Mouth: glowing interior between the jaws, fangs above and below.
  glow(b.part(new THREE.BoxGeometry(0.38, 0.05, 0.3), LAVA_O, { bone: head, at: [0, 2.455, 0.22] }), 1.3);
  for (let i = 0; i < 6; i++) {
    const x = -0.15 + 0.06 * i;
    b.part(new THREE.CylinderGeometry(0, 0.03, 0.09, 5), TOOTH, { bone: head, at: [x, 2.435, 0.365], dir: [0, -1, 0], flat: true });
    b.part(new THREE.CylinderGeometry(0, 0.03, 0.09, 5), TOOTH, { bone: jaw, at: [x + 0.03, 2.475, 0.36], flat: true });
  }
  b.extrude(JAW, { at: [0, 2.38, 0.22], x: [1, 0, 0], thickness: 0.34, bevel: 0.02, color: pickRock(), bone: jaw });
  plate(jaw, [0, 2.37, 0.405], CHIN, 0.03, GOLD, { bevel: 0.006 });
  gem(jaw, [0, 2.37, 0.425], 0.03, LAVA_Y);
  for (const x of [-0.1, 0, 0.1]) {
    b.sweep(
      polyline([
        [x, 2.31, 0.36],
        [x, 2.2 - Math.abs(x) * 0.4, 0.37],
      ]),
      [0.025, 0.006],
      { bone: jaw, color: LAVA_O, caps: { start: "flat", end: "point" } },
    );
    gem(jaw, [x, 2.19 - Math.abs(x) * 0.4, 0.37], 0.03, LAVA_Y);
  }

  for (const s of [1, -1]) {
    // Eyes: orange almond with a white-hot core, set under a gold-edged brow.
    glow(b.extrude(sideOf(EYE, s), { at: [0, 2.64, 0.385], x: [1, 0, 0], thickness: 0.03, bevel: 0.005, color: LAVA_O, bone: head }), 1.4);
    glow(
      b.extrude(sideOf(grow(EYE, 0.55), s), { at: [0, 2.64, 0.389], x: [1, 0, 0], thickness: 0.03, bevel: 0.004, color: HOT, bone: head }),
      1.6,
    );
    b.extrude(sideOf(BROW, s), { at: [0, 2.7, 0.39], x: [1, 0, 0], thickness: 0.07, bevel: 0.012, color: pickRock(), bone: head });
    b.rod([s * 0.02, 2.7, 0.43], [s * 0.27, 2.73, 0.43], 0.012, GOLD, { bone: head });
    // Cheek spurs and ear guards.
    hexCol(head, [s * 0.19, 2.53, 0.38], [0, -0.3, 1], 0.05, 0.14, pickRock());
    hexCol(head, [s * 0.3, 2.6, 0.15], [s, 0, 0], 0.08, 0.12, pickRock());
    band(head, [s * 0.34, 2.6, 0.15], [s, 0, 0], 0.075, 0.03, 0.03, GOLD, 6);
    ember(head, [s * 0.375, 2.6, 0.15], [s, 0, 0], 0.06, 0.025);
    // Horns: basalt, curving out and back, tipped with molten glow.
    const hp = catmull([
      [s * 0.2, 2.76, 0.14],
      [s * 0.36, 2.88, 0.06],
      [s * 0.5, 2.92, -0.1],
      [s * 0.56, 2.82, -0.3],
    ]);
    const rad = (t: number) => 0.06 * (1 - t) + 0.012;
    b.sweep(hp, rad, { bone: head, color: pickRock(), section: { ngon: 6 }, caps: { start: "flat", end: "none" }, from: 0, to: 0.72 });
    glow(
      b.sweep(hp, rad, { bone: head, color: LAVA_O, section: { ngon: 6 }, caps: { start: "none", end: "point" }, from: 0.72, to: 1 }),
      1.3,
    );
    band(head, [s * 0.215, 2.77, 0.13], [s * 0.16, 0.12, -0.08], 0.065, 0.025, 0.02, GOLD, 6);
  }
  // Forehead gem on a gold diamond, crown columns, molten crack across the crown.
  plate(head, [0, 2.77, 0.4], DIAMOND, 0.03, GOLD, { bevel: 0.006 });
  gem(head, [0, 2.77, 0.425], 0.032, LAVA_Y, 1.5);
  hexCol(head, [0, 2.97, 0.1], [0, 1, 0], 0.06, 0.24, pickRock());
  ember(head, [0, 3.093, 0.1], [0, 1, 0], 0.05, 0.02);
  for (const s of [1, -1]) {
    hexCol(head, [s * 0.14, 2.93, 0.04], [s * 0.2, 1, -0.1], 0.05, 0.18, pickRock());
    ember(head, [s * 0.14 + s * 0.017, 3.021, 0.025], [s * 0.2, 1, -0.1], 0.042, 0.02);
  }
  seam(
    head,
    [
      [-0.08, 2.845, 0.02],
      [-0.02, 2.845, 0.1],
      [0.05, 2.845, 0.16],
      [0.0, 2.845, 0.26],
    ],
    0.01,
  );

  // -------------------------------------------------------------------------------------------------------------
  // Legs

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const hipP: P = [s * 0.34, 1.12, 0];
    const kneeP: P = [s * 0.38, 0.66, 0.08];
    const ankleP: P = [s * 0.4, 0.27, 0];
    const leg = b.chain(`leg${S}`, polyline([hipP, kneeP, ankleP]), {
      parent: hips,
      names: [`hip${S}`, `knee${S}`, `ankle${S}`],
      role: "leg",
      contact: [s * 0.4, 0, 0.1],
    });
    const hipJ = leg.joints[0];
    const kneeJ = leg.joints[1];
    const ankleJ = leg.joints[2];

    glow(
      b.sweep(leg, [0.2, 0.17, 0.15], {
        color: LAVA_R,
        bands: [
          [0.5, LAVA_R],
          [1, LAVA_O],
        ],
      }),
      1.1,
    );
    cage({ bone: hipJ, a: lerpP(hipP, kneeP, 0.06), b: lerpP(hipP, kneeP, 0.98), count: 6, radius: 0.215, col: 0.09 });
    cage({ bone: kneeJ, a: lerpP(kneeP, ankleP, 0.08), b: lerpP(kneeP, ankleP, 1.0), count: 6, radius: 0.19, col: 0.08 });
    band(hipJ, lerpP(hipP, kneeP, 0.12), dirP(hipP, kneeP), 0.285, 0.04, 0.022);
    band(kneeJ, lerpP(kneeP, ankleP, 0.14), dirP(kneeP, ankleP), 0.255, 0.04, 0.022);
    band(kneeJ, lerpP(kneeP, ankleP, 0.9), dirP(kneeP, ankleP), 0.24, 0.04, 0.022);

    // Knee guard with a gem, ankle ball.
    b.part(new THREE.IcosahedronGeometry(0.17, 0), pickRock(), { bone: kneeJ, at: [s * 0.38, 0.66, 0.24], scale: [1, 1.05, 0.9], flat: true });
    gem(kneeJ, [s * 0.38, 0.66, 0.37], 0.045, LAVA_Y);
    b.part(new THREE.IcosahedronGeometry(0.16, 0), pickRock(), { bone: ankleJ, at: [s * 0.4, 0.27, 0], flat: true });

    // Foot: slab, three column toes with molten tips, heel spike, gold strap and a crack.
    b.part(new THREE.BoxGeometry(0.42, 0.2, 0.62), pickRock(), { bone: ankleJ, at: [s * 0.4, 0.1, 0.1], flat: true });
    for (const dx of [-0.13, 0, 0.13]) {
      hexCol(ankleJ, [s * 0.4 + dx, 0.09, 0.45], [0, -0.1, 1], 0.085, 0.2, pickRock());
      ember(ankleJ, [s * 0.4 + dx, 0.075, 0.555], [0, -0.1, 1], 0.065, 0.02);
    }
    spikeP(ankleJ, [s * 0.4, 0.15, -0.18], [0, 0.35, -1], 0.2, 0.07, pickRock());
    b.part(new THREE.BoxGeometry(0.44, 0.03, 0.09), GOLD, { bone: ankleJ, at: [s * 0.4, 0.2, 0.12], flat: true });
    seam(
      ankleJ,
      [
        [s * 0.4, 0.203, -0.15],
        [s * 0.36, 0.203, 0.0],
        [s * 0.43, 0.203, 0.2],
        [s * 0.39, 0.203, 0.32],
      ],
      0.012,
    );
  }

  // -------------------------------------------------------------------------------------------------------------
  // Arms and hands

  for (const s of [1, -1]) {
    const S = s > 0 ? "L" : "R";
    const shP: P = [s * 0.8, 2.05, 0];
    const elP: P = [s * 1.13, 1.5, 0.12];
    const wrP: P = [s * 1.32, 0.98, 0.26];
    const arm = b.chain(`arm${S}`, polyline([shP, elP, wrP]), {
      parent: chest,
      names: [`shoulder${S}`, `elbow${S}`, `wrist${S}`],
      role: "arm",
    });
    const shJ = arm.joints[0];
    const elJ = arm.joints[1];
    const wrJ = arm.joints[2];

    glow(
      b.sweep(arm, [0.17, 0.16, 0.15], {
        color: LAVA_O,
        bands: [
          [0.5, LAVA_O],
          [1, LAVA_R],
        ],
      }),
      1.1,
    );
    cage({ bone: shJ, a: lerpP(shP, elP, 0.12), b: lerpP(shP, elP, 0.96), count: 5, radius: 0.21, col: 0.08 });
    cage({ bone: elJ, a: lerpP(elP, wrP, 0.1), b: lerpP(elP, wrP, 0.97), count: 6, radius: 0.26, col: 0.1, len: [0.85, 1] });
    band(elJ, lerpP(elP, wrP, 0.12), dirP(elP, wrP), 0.33, 0.045, 0.025);
    band(elJ, lerpP(elP, wrP, 0.93), dirP(elP, wrP), 0.33, 0.045, 0.025);
    band(shJ, lerpP(shP, elP, 0.5), dirP(shP, elP), 0.27, 0.035, 0.02);

    // Elbow knuckle with a back spike.
    b.part(new THREE.IcosahedronGeometry(0.17, 0), pickRock(), { bone: elJ, at: elP, flat: true });
    spikeP(elJ, [elP[0] + s * 0.06, elP[1] + 0.02, elP[2] - 0.1], [s * 0.6, 0.25, -1], 0.3, 0.085, pickRock());

    // Pauldron: a basalt dome with a gold rim, crown columns, hanging spikes, gem and tassel.
    const px = s * 0.86;
    b.part(new THREE.IcosahedronGeometry(0.3, 1), pickRock(), { bone: chest, at: [px, 2.26, 0], scale: [1.1, 0.85, 1.05], flat: true });
    band(chest, [px, 2.2, 0], [0, 1, 0], 0.315, 0.04, 0.03, GOLD, 10);
    hexCol(chest, [px, 2.55, 0], [s * 0.1, 1, 0], 0.08, 0.3, pickRock());
    ember(chest, [px + s * 0.015, 2.705, 0], [s * 0.1, 1, 0], 0.065, 0.02);
    hexCol(chest, [px + s * 0.17, 2.5, 0.1], [s * 0.3, 1, 0.1], 0.065, 0.22, pickRock());
    hexCol(chest, [px - s * 0.15, 2.5, -0.1], [-s * 0.15, 1, -0.1], 0.06, 0.2, pickRock());
    for (const z of [-0.15, 0, 0.15]) spikeP(chest, [s * 1.06, 2.2, z], [s, -0.35, z * 1.5], 0.24, 0.07, pickRock());
    b.part(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 6), GOLD, { bone: chest, at: [s * 1.16, 2.3, 0], dir: [s, 0, 0], flat: true });
    gem(chest, [s * 1.185, 2.3, 0], 0.05, LAVA_Y, 1.4);
    tassel(chest, [px, 2.18, 0.31], 0.32, CLOTH);

    // Hand: a broad basalt palm, four column fingers and a thumb, gold knuckle rings, molten fingertips.
    b.part(new THREE.BoxGeometry(0.34, 0.34, 0.5), pickRock(), { bone: wrJ, at: [s * 1.38, 0.78, 0.28], flat: true });
    const fx = s * 1.4;
    const zs = [-0.17, -0.057, 0.057, 0.17];
    const drops = [0.27, 0.31, 0.31, 0.25];
    zs.forEach((dz, i) => {
      const z = 0.28 + dz;
      const p0: P = [fx, 0.66, z];
      const p1: P = [fx, 0.66 - drops[i] * 0.5, z + 0.02];
      const p2: P = [fx, 0.66 - drops[i], z + 0.06];
      const n = `finger${S}${i + 1}`;
      const f = b.chain(n, polyline([p0, p1, p2]), { parent: wrJ, names: [`${n}a`, `${n}b`, `${n}c`], role: "digit" });
      b.sweep(f, [0.05, 0.04], { color: pickRock(), section: { ngon: 6 }, caps: "flat" });
      band(f.joints[0], [fx, p0[1] - 0.04, z], [0, -1, 0], 0.042, 0.014, 0.014, GOLD, 6);
      ember(f.joints[2], [fx, p2[1] - 0.03, p2[2] + 0.01], [0, -1, 0.2], 0.042, 0.04);
    });
    {
      const t0: P = [s * 1.3, 0.82, 0.5];
      const t1: P = [s * 1.28, 0.72, 0.62];
      const t2: P = [s * 1.26, 0.62, 0.72];
      const n = `thumb${S}`;
      const f = b.chain(n, polyline([t0, t1, t2]), { parent: wrJ, names: [`${n}1`, `${n}2`, `${n}3`], role: "digit" });
      b.sweep(f, [0.058, 0.045], { color: pickRock(), section: { ngon: 6 }, caps: "flat" });
      ember(f.joints[2], [t2[0], t2[1] - 0.02, t2[2] + 0.03], [0, -0.5, 1], 0.046, 0.04);
    }
  }

  // -------------------------------------------------------------------------------------------------------------
  // Drifting embers

  for (let i = 0; i < 14; i++) {
    const x = (R() * 2 - 1) * 1.3;
    const y = 0.9 + R() * 2.1;
    const z = -(0.9 + R() * 0.6);
    gem(chest, [x, y, z], 0.02 + 0.015 * R(), R() > 0.5 ? LAVA_O : LAVA_Y, 1.4);
  }
  for (let i = 0; i < 6; i++) {
    const s = i % 2 === 0 ? 1 : -1;
    gem(chest, [s * (1.75 + R() * 0.2), 1.5 + R() * 1.3, 0.1 + R() * 0.5], 0.02 + 0.012 * R(), LAVA_O, 1.4);
  }

  // Jaw rests slightly open so the molten mouth shows.
  b.pose(jaw, { axis: [1, 0, 0], deg: 6 });

  return b.root;
}
