import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import type { V3 } from "../../../../src/math";
import { mix, mottle, paint, smoothstep, gradient, stripes } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull, polyline } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A two-metre reaper's scythe: a dragon's spine for a haft, a snarling dragon skull for a head and a bone-white crescent blade with a glowing soul-fire edge, on a claw-gripped plinth, with soul wisps drifting in the curve of the blade.",
  style: "League of Legends",
  commit: "88fc1f0",
};

// Palette
const SOUL = "#3ff0d0";
const SOUL_PALE = "#c4fff3";
const PURPLE = "#5a2a96";
const INKDARK = "#2b1b3f";
const BONE = cel("#f1e5c6", "#bca682");
const BONE_D = cel("#cdb88e", "#97805e");
const DARK = cel(INKDARK, "#170d2a");
const GOLD = cel("#f4b730", "#b5681c");
const STONE = cel(mottle("#47405e", "#5a5275", { size: 0.09, seed: 3 }), "#2b2640");
const CLOTH = cel(stripes("#5a2a96", "#7b3fc2", { size: 0.05, axis: [0, 1, 0], width: 0.5 }), "#3b1c68");

// Blade silhouette, in metres in the blade's plane (u along the blade, v up), origin at the skull
const SPINE: Array<[number, number]> = [
  [0, 0.14],
  [0.25, 0.24],
  [0.55, 0.22],
  [0.85, 0.08],
  [1.08, -0.15],
  [1.2, -0.48],
];
const EDGE_ASC: Array<[number, number]> = [
  [0, -0.04],
  [0.25, 0.05],
  [0.55, 0.04],
  [0.8, -0.05],
  [1.0, -0.2],
  [1.2, -0.48],
];
const OUTLINE: OutlinePoint[] = [
  ...SPINE,
  [1.0, -0.2],
  [0.8, -0.05],
  [0.55, 0.04],
  [0.25, 0.05],
  [0, -0.04],
  [-0.08, 0.04],
];
const BO: V3 = [0.06, 1.98, 0];
const bw = (u: number, v: number, z = 0): V3 => [BO[0] + u, BO[1] + v, z];

function yOn(pts: Array<[number, number]>, u: number) {
  if (u <= pts[0][0]) return pts[0][1];
  for (let i = 0; i < pts.length - 1; i++) {
    const [u0, v0] = pts[i];
    const [u1, v1] = pts[i + 1];
    if (u <= u1) return v0 + ((v1 - v0) * (u - u0)) / (u1 - u0);
  }
  return pts[pts.length - 1][1];
}
// Half thickness of the blade at height v (matches the extrude taper below), plus a small lift
const halfAt = (v: number) => (0.004 + 0.03 * ((v + 0.48) / 0.72)) / 2;

const BLADE = cel(
  paint((_p, _n, s) => {
    const u = s[0];
    const v = s[1];
    const sp = yOn(SPINE, u);
    const ed = yOn(EDGE_ASC, u);
    const d = v - ed;
    const m = d / Math.max(sp - ed, 0.02);
    if (d < 0.028) return "#e2fff8";
    if (d < 0.058) return "#52dcc6";
    if (m > 0.5 && m < 0.56) return "#2fb3a2";
    const k = (u + 0.5 * v) / 0.1;
    if (u > 0.6 && m > 0.6 && m < 0.93 && Math.abs(k - Math.round(k)) < 0.07) return "#b29a72";
    if (m > 0.93) return "#fff7e2";
    return mix("#f1e5c6", "#9fe8dc", smoothstep(0.5, 1.15, u));
  }),
);

const RUNES = svg(
  `<svg viewBox="0 0 120 36">
    <g stroke="#7ffff0" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M4 3 L116 3 M4 33 L116 33"/>
      <path d="M12 9 L12 27 M12 18 L22 10 M12 18 L22 26"/>
      <path d="M32 9 L44 9 L32 27 L44 27"/>
      <path d="M56 9 L56 27 M56 9 L68 18 L56 27"/>
      <path d="M78 9 L90 27 L78 27 M78 18 L92 18"/>
      <path d="M102 9 L112 9 L112 27 L102 27 L102 9 M102 9 L112 27"/>
    </g>
  </svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0, 0] });
  const jaw = b.joint("jaw", { parent: root, at: [0, 1.9, 0.05], aim: [0, 1.84, 0.27], role: "jaw" });
  const charm = b.joint("charm", { parent: root, at: [0.075, 1.45, 0], dir: [0, -1, 0], role: "hinge" });

  const put = (geo: THREE.BufferGeometry, color: Fill, at: V3, opts: PartOptions = {}) =>
    b.part(geo, color, { bone: root, ...opts, at });
  const sph = (r: number, w = 8, h = 6) => new THREE.SphereGeometry(r, w, h);
  const cone = (r: number, h: number, n = 5) => new THREE.ConeGeometry(r, h, n);
  const ring = (y: number, r: number, tube: number, color: Fill = GOLD, x = 0, z = 0) =>
    put(new THREE.TorusGeometry(r, tube, 5, 12), color, [x, y, z], { dir: [0, 1, 0], axis: "z" });

  // ---------------------------------------------------------------- plinth
  put(
    b.lathe(
      [
        [0, 0],
        [0.34, 0],
        [0.34, 0.05],
        [0.3, 0.07],
        [0.3, 0.11],
        [0.26, 0.14],
        [0, 0.14],
      ],
      { at: [0, 0, 0], segments: 12, color: STONE, bone: root },
    ).mesh.geometry,
    STONE,
    [0, 0, 0],
    {},
  ).mesh.visible = false;
  b.lathe(
    [
      [0.296, 0.05],
      [0.315, 0.056],
      [0.315, 0.1],
      [0.296, 0.106],
    ],
    { at: [0, 0, 0], segments: 12, color: GOLD, bone: root },
  );
  put(new THREE.TorusGeometry(0.21, 0.008, 4, 24), SOUL, [0, 0.142, 0], { dir: [0, 1, 0], axis: "z" });
  glow(
    put(new THREE.TorusGeometry(0.21, 0.008, 4, 24), SOUL, [0, 0.143, 0], { dir: [0, 1, 0], axis: "z" }),
    1.3,
  );
  for (let i = 0; i < 12; i++) {
    glow(
      put(new THREE.BoxGeometry(0.018, 0.004, i % 2 ? 0.03 : 0.05), SOUL, [
        0.245 * Math.sin((i * Math.PI) / 6),
        0.1425,
        0.245 * Math.cos((i * Math.PI) / 6),
      ], { rotation: [0, i * 30, 0] }),
    );
  }
  // claw cradle
  for (let i = 0; i < 3; i++) {
    const a = ((i * 120 + 30) * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    b.sweep(
      catmull([
        [0.2 * c, 0.12, 0.2 * s],
        [0.11 * c, 0.2, 0.11 * s],
        [0.07 * c, 0.36, 0.07 * s],
        [0.056 * c, 0.48, 0.056 * s],
      ]),
      [0.034, 0.005],
      { color: BONE, bone: root, caps: { start: "flat", end: "point" }, sides: 6 },
    );
  }

  // ---------------------------------------------------------------- staff
  b.rod([0, 0.1, 0], [0, 1.9, 0], 0.03, { color: INKDARK, bone: root, sides: 6 });
  const vert = (y: number, i: number) => {
    put(new THREE.CylinderGeometry(0.05, 0.056, 0.05, 6), BONE, [0, y, 0], { rotation: [0, i * 30, 0] });
    put(cone(0.016, 0.075), BONE_D, [0, y + 0.012, -0.06], { dir: [0, 0.55, -1] });
    for (const s of [1, -1]) put(cone(0.012, 0.06), BONE_D, [s * 0.055, y, 0], { dir: [s, 0.25, 0] });
  };
  let vi = 0;
  for (let y = 0.36; y < 0.76; y += 0.07) vert(y, vi++);
  for (let y = 1.3; y < 1.84; y += 0.065) vert(y, vi++);
  // wrapped grip
  put(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8), CLOTH, [0, 1.0, 0]);
  for (let y = 0.78; y < 1.23; y += 0.06) ring(y, 0.042, 0.005, y % 0.12 < 0.06 ? "#2fe0c4" : GOLD);
  ring(0.76, 0.052, 0.012);
  ring(1.26, 0.052, 0.012);
  ring(0.33, 0.058, 0.012);
  ring(1.84, 0.062, 0.014);
  put(sph(0.025, 6, 4), GOLD, [0, 0.76, 0.055]);
  put(sph(0.025, 6, 4), GOLD, [0, 1.26, 0.055]);

  // collar under the skull
  b.lathe(
    [
      [0, 0],
      [0.06, 0],
      [0.078, 0.03],
      [0.095, 0.08],
      [0.05, 0.11],
      [0, 0.11],
    ],
    { at: [0, 1.8, 0], segments: 8, color: GOLD, bone: root },
  );

  // wing guard
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.05, 1.83, 0],
        [s * 0.15, 1.82, -0.01],
        [s * 0.24, 1.73, 0],
        [s * 0.27, 1.6, 0.02],
      ]),
      [0.024, 0.004],
      { color: BONE, bone: root, caps: { start: "round", end: "point" }, sides: 6 },
    );
    for (let k = 0; k < 3; k++)
      b.spike([s * (0.14 + 0.045 * k), 1.83 - 0.035 * k, 0.0], [s * 0.3, -1, 0.1], 0.1 - 0.015 * k, 0.013, {
        color: BONE_D,
        bone: root,
        sides: 5,
      });
  }

  // ---------------------------------------------------------------- skull
  put(sph(1, 10, 7), BONE, [0, 1.99, -0.01], { scale: [0.1, 0.095, 0.13] });
  b.frustumBox([0, 1.965, 0.07], [0, 1.95, 0.3], [0.13, 0.1], [0.07, 0.055], { color: BONE, bone: root });
  // brow ridges over the eyes
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.05, 0.015, 0.09), BONE_D, [s * 0.062, 2.03, 0.1], { rotation: [0, s * -12, s * 14] });
    put(sph(0.032, 7, 5), INKDARK, [s * 0.072, 1.995, 0.098], { scale: [0.7, 1, 1] });
    glow(put(sph(0.02, 6, 4), SOUL_PALE, [s * 0.077, 1.995, 0.108]), 1.6);
    put(cone(0.014, 0.05), BONE_D, [s * 0.04, 1.965, 0.29], { dir: [0, 0.2, 1] }); // snout tip nubs
    put(sph(0.01, 5, 4), INKDARK, [s * 0.016, 1.972, 0.298]);
  }
  // upper teeth
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++) {
      const z = 0.13 + i * 0.034;
      const hw = 0.065 - ((z - 0.07) / 0.23) * 0.03;
      put(cone(0.009, 0.045 - i * 0.003), "#fff8e6", [s * (hw - 0.005), 1.92, z], { dir: [0, -1, 0] });
    }
  put(cone(0.011, 0.06), "#fff8e6", [0.0, 1.925, 0.3], { dir: [0, -1, 0.2] });
  // forehead soul gem
  glow(put(new THREE.OctahedronGeometry(0.025), SOUL, [0, 2.06, 0.09], { scale: [1, 1.5, 0.8] }), 1.5);
  ring(2.06, 0.001, 0.001, GOLD);
  // crest + horns + cheek fins
  for (let i = 0; i < 3; i++)
    put(cone(0.02 - i * 0.003, 0.09 - i * 0.012), BONE, [0, 2.075 - i * 0.02, -0.03 - i * 0.06], {
      dir: [0, 0.5, -1],
    });
  for (const s of [1, -1]) {
    b.sweep(
      catmull([
        [s * 0.06, 2.05, -0.04],
        [s * 0.11, 2.12, -0.12],
        [s * 0.13, 2.2, -0.2],
        [s * 0.1, 2.26, -0.23],
      ]),
      [0.034, 0.004],
      { color: BONE, bone: root, caps: { start: "flat", end: "point" }, sides: 6 },
    );
    b.sweep(
      catmull([
        [s * 0.09, 1.97, -0.05],
        [s * 0.16, 1.94, -0.11],
        [s * 0.21, 1.98, -0.2],
      ]),
      [0.024, 0.004],
      { color: BONE_D, bone: root, caps: { start: "flat", end: "point" }, sides: 5 },
    );
    b.spike([s * 0.09, 1.99, 0.03], [s * 0.9, 0.1, -0.2], 0.1, 0.022, { color: BONE_D, bone: root, sides: 5 });
    ring(2.1, 0.034, 0.007, GOLD, s * 0.112, -0.12);
  }
  // counter-spike on the far side
  b.sweep(
    catmull([
      [-0.06, 2.0, 0],
      [-0.2, 2.05, 0],
      [-0.34, 2.01, 0],
      [-0.43, 1.9, 0],
    ]),
    [0.034, 0.004],
    { color: BONE, bone: root, caps: { start: "round", end: "point" }, sides: 6 },
  );
  ring(2.015, 0.036, 0.008, GOLD, -0.17, 0).rotation.set(0, Math.PI / 2, 0);

  // lower jaw (moves)
  b.frustumBox([0, 1.88, 0.0], [0, 1.83, 0.07], [0.1, 0.05], [0.1, 0.03], { color: BONE_D, bone: jaw });
  b.frustumBox([0, 1.845, 0.07], [0, 1.815, 0.26], [0.1, 0.03], [0.055, 0.025], { color: BONE_D, bone: jaw });
  for (const s of [1, -1])
    for (let i = 0; i < 4; i++) {
      const z = 0.1 + i * 0.045;
      put(cone(0.008, 0.035), "#fff8e6", [s * (0.042 - i * 0.006), 1.865 - i * 0.003, z], { dir: [0, 1, 0], bone: jaw });
    }
  glow(put(sph(0.028, 6, 4), SOUL, [0, 1.9, 0.14], { scale: [1, 0.8, 1.6] }), 1.2);

  // ---------------------------------------------------------------- blade
  b.extrude(OUTLINE, {
    at: BO,
    x: [1, 0, 0],
    y: [0, 1, 0],
    thickness: [0.004, 0.034],
    bevel: 0.004,
    color: BLADE,
    bone: root,
    name: "blade",
  });
  // glowing soul-fire edge
  glow(
    b.sweep(
      polyline([
        bw(-0.02, -0.05),
        bw(0.25, 0.05),
        bw(0.55, 0.04),
        bw(0.8, -0.05),
        bw(1.0, -0.2),
        bw(1.2, -0.48),
      ]),
      0.011,
      { color: SOUL, bone: root, caps: { start: "flat", end: "point" }, sides: 5 },
    ),
    1.4,
  );
  // dragon-spine spikes along the back of the blade
  for (let i = 1; i <= 4; i++) {
    const [u, v] = SPINE[i];
    const [pu, pv] = SPINE[i - 1];
    const [nu, nv] = SPINE[i + 1];
    const tx = nu - pu;
    const ty = nv - pv;
    const l = Math.hypot(tx, ty);
    const nx = -ty / l;
    const ny = tx / l;
    b.spike(bw(u - nx * 0.012, v - ny * 0.012), [nx, ny, 0], 0.1 - 0.015 * i, 0.022 - 0.002 * i, {
      color: BONE,
      bone: root,
      sides: 5,
    });
    if (i < 4) {
      const mu = (u + nu) / 2;
      const mv = (v + nv) / 2;
      b.spike(bw(mu - nx * 0.01, mv - ny * 0.01), [nx, ny, 0], 0.055 - 0.008 * i, 0.014, {
        color: BONE_D,
        bone: root,
        sides: 5,
      });
    }
  }
  // gold inlay beads running along the blade, both faces
  const inlay: Array<[number, number]> = [
    [0.06, 0.115],
    [0.25, 0.205],
    [0.55, 0.185],
    [0.85, 0.045],
    [1.07, -0.18],
  ];
  for (const s of [1, -1])
    b.sweep(polyline(inlay.map(([u, v]) => bw(u, v, s * (halfAt(v) + 0.002))), { }), 0.005, {
      color: GOLD,
      bone: root,
      caps: { start: "round", end: "round" },
      sides: 5,
    });
  // gold clasp plates where the blade meets the skull
  for (const s of [1, -1]) {
    b.extrude(
      [
        [0.03, -0.01],
        [0.2, 0.055],
        [0.2, 0.19],
        [0.03, 0.15],
      ],
      {
        at: [BO[0], BO[1], s * 0.0185],
        x: [1, 0, 0],
        y: [0, 1, 0],
        thickness: 0.012,
        bevel: 0.002,
        color: GOLD,
        bone: root,
      },
    );
    for (const [u, v] of [
      [0.07, 0.07],
      [0.07, 0.12],
      [0.16, 0.1],
    ])
      put(sph(0.009, 5, 4), GOLD, bw(u, v, s * 0.026));
  }
  // glowing runes on both faces
  const runePlane = new THREE.PlaneGeometry(0.34, 0.102);
  glow(
    put(runePlane, "#ffffff", bw(0.4, 0.135, 0.021), { dir: [0, 0, 1], axis: "z", texture: RUNES }),
    1.3,
  );
  glow(
    put(runePlane.clone(), "#ffffff", bw(0.4, 0.135, -0.021), { dir: [0, 0, -1], axis: "z", texture: RUNES }),
    1.3,
  );

  // ---------------------------------------------------------------- soul wisps
  const wisp = (x: number, y: number, z: number, s: number) => {
    glow(put(sph(0.04 * s, 7, 5), SOUL_PALE, [x, y, z]), 1.4);
    glow(
      b.spike([x, y, z], [0.25, -1, 0], 0.16 * s, 0.036 * s, { color: SOUL, bone: root, sides: 5 }),
      1.2,
    );
    for (const e of [1, -1]) put(sph(0.008 * s, 4, 3), "#1a0f2e", [x + e * 0.014 * s, y + 0.006 * s, z + 0.036 * s]);
    put(sph(0.006 * s, 4, 3), "#1a0f2e", [x, y - 0.015 * s, z + 0.038 * s]);
  };
  wisp(0.45, 1.8, 0.07, 1.0);
  wisp(0.72, 1.62, -0.05, 0.85);
  wisp(0.95, 1.55, 0.08, 0.7);
  wisp(0.62, 1.42, 0.02, 0.6);
  for (const [x, y, z] of [
    [0.3, 1.62, -0.04],
    [0.85, 1.4, 0.0],
    [1.08, 1.34, 0.05],
    [0.55, 1.62, 0.14],
  ])
    glow(put(new THREE.OctahedronGeometry(0.014), SOUL, [x, y, z], { scale: [1, 1.5, 1] }), 1.3);

  // ---------------------------------------------------------------- hanging charm
  const CX = 0.075;
  put(new THREE.TorusGeometry(0.015, 0.004, 4, 10), GOLD, [0.06, 1.45, 0], { bone: charm });
  b.rod([CX, 1.445, 0], [CX, 1.33, 0], 0.004, { color: GOLD, bone: charm, sides: 4 });
  put(sph(0.035, 7, 5), BONE, [CX, 1.29, 0], { bone: charm, scale: [1, 1.05, 1.1] });
  put(new THREE.BoxGeometry(0.04, 0.018, 0.035), BONE_D, [CX, 1.25, 0.012], { bone: charm });
  for (const s of [1, -1]) glow(put(sph(0.009, 4, 3), SOUL, [CX + s * 0.014, 1.295, 0.032], { bone: charm }), 1.5);
  b.sweep(
    catmull([
      [CX, 1.235, 0],
      [CX + 0.012, 1.1, 0.012],
      [CX + 0.004, 0.98, 0.02],
      [CX + 0.016, 0.88, 0.02],
    ]),
    (t) => [0.024 * (1 - 0.45 * t), 0.004],
    {
      color: gradient("#5a2a96", "#2ee6c8", [0, 1.2, 0], [0, 0.88, 0]),
      section: "box",
      caps: "flat",
      bone: charm,
    },
  );
  glow(put(sph(0.016, 5, 4), SOUL, [CX + 0.016, 0.865, 0.02], { bone: charm }), 1.4);

  // ---------------------------------------------------------------- skull-collar ribbons
  for (const s of [1, -1])
    b.sweep(
      catmull([
        [s * 0.05, 1.82, -0.05],
        [s * 0.09, 1.66, -0.09],
        [s * 0.07, 1.5, -0.07],
      ]),
      (t) => [0.028 * (1 - 0.4 * t), 0.004],
      {
        color: gradient("#5a2a96", "#2ee6c8", [0, 1.72, 0], [0, 1.48, 0]),
        section: "box",
        caps: "flat",
        bone: root,
      },
    );

  return b.root;
}
