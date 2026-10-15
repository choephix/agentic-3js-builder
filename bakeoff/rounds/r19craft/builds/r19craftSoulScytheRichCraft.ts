// Dragonbone soul scythe on a rune plinth. League of Legends style: exaggerated dynamic crescent, a dragon-skull head
// that swallows the blade root, ivory bone against deep violet and gold, and one strong teal soul-glow accent that
// reads from a high top-down camera. A plain-object weapon: joints only for the jaw, the hanging soul lantern and the
// two ribbons.
import * as THREE from "three";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import type { V3 } from "../../../../src/math";
import { catmull } from "../../../../src/path";
import { grain, mottle, paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { svg } from "../../../../src/texture";
import { cel } from "../../../../kits/toon";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Dragonbone Soul Scythe",
  description:
    "A towering dragonbone scythe on a rune plinth: a dragon skull clamps the crescent blade, the snath is a vertebra column, and trapped souls burn teal along the edge, in the eyes and in a hanging lantern.",
  style: "League of Legends",
  commit: "88fc1f0",
};

const DEGR = Math.PI / 180;

// Palette: ivory bone, deep violet metal, gold trim, one teal soul accent.
const BONE = cel(mottle("#f6ecd2", "#e8d7b0", { size: 0.06, seed: 3 }), "#a994a6");
const BONE_LINE = cel("#cdb48c", "#8e7a8c");
const BONE_DARK = cel("#cdb48c", "#8a7280");
const BONE_SHAFT = cel(grain("#f4e9cf", "#dcc9a2", { size: 0.02, seed: 2 }), "#a994a6");
const VOID = cel(mottle("#4d3c7c", "#3e2e69", { size: 0.08, seed: 5 }), "#241a44");
const VOID_LINE = cel("#8466d4", "#523c9c");
const VOID_DARK = cel("#2b2050", "#190f33");
const GOLD = cel("#ffd24d", "#d98a1f");
const RIBBON = cel("#8a4dff", "#5328b8");
const GRIP_LIGHT = cel("#6b4bb8", "#46308a");
const GRIP_DARK = cel("#30235a", "#1c1336");
const PLINTH = cel(mottle("#463570", "#392a5e", { size: 0.1, seed: 9 }), "#221840");
const TOOTH = "#fff6df";
const SOUL = "#3df5d2";
const SOUL_HOT = "#d2fff6";
const SOUL_DEEP = "#19c9b0";
const EDGE = "#6ffbe3";

// Crescent blade: a circle arc in the XY plane with a width that tapers to a hooked tip.
const CX = 0.24;
const CY = 1.62;
const RR = 0.44;
const TH0 = 138;
const TH1 = -32;
const thetaAt = (u: number) => (TH0 + (TH1 - TH0) * u) * DEGR;
const widthAt = (u: number) => 0.17 * Math.pow(Math.max(1 - u, 0), 0.85);
const arcPt = (u: number, off: number): [number, number] => {
  const th = thetaAt(u);
  return [CX + (RR + off) * Math.cos(th), CY + (RR + off) * Math.sin(th)];
};

const BLADE_BONE = paint((p, n) => {
  if (Math.abs(n.z) < 0.5) return BONE_DARK;
  const dx = p.x - CX;
  const dy = p.y - CY;
  const ang = Math.atan2(dy, dx);
  const u = (TH0 - ang / DEGR) / (TH0 - TH1);
  const w = widthAt(u);
  const rr = Math.hypot(dx, dy) - RR;
  const k = (ang * RR) / 0.075;
  const rib = k - Math.floor(k) < 0.07 && rr > -0.42 * w && rr < 0.06 * w;
  return rib ? BONE_LINE : BONE;
});

const SPINE_PLATE = paint((p, n) => {
  if (Math.abs(n.z) < 0.5) return VOID_DARK;
  const ang = Math.atan2(p.y - CY, p.x - CX);
  const k = (ang * RR) / 0.05;
  return k - Math.floor(k) < 0.12 ? VOID_LINE : VOID;
});

// Textures
const GLYPH_STROKE = `fill="none" stroke="#43f5d4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
const GLYPHS = [
  svg(`<svg viewBox="0 0 32 32"><path ${GLYPH_STROKE} d="M16 4 L16 28 M8 10 L16 16 L24 10 M9 23 L16 16"/></svg>`, { size: 128 }),
  svg(`<svg viewBox="0 0 32 32"><circle ${GLYPH_STROKE} cx="16" cy="16" r="9"/><path ${GLYPH_STROKE} d="M16 3 L16 29"/></svg>`, { size: 128 }),
  svg(`<svg viewBox="0 0 32 32"><path ${GLYPH_STROKE} d="M8 6 L24 6 L8 26 L24 26 M16 10 L16 22"/></svg>`, { size: 128 }),
];

const FLAME = svg(
  `<svg viewBox="0 0 32 64"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#14b8a6"/><stop offset="0.55" stop-color="#3df5d2"/><stop offset="1" stop-color="#b9fff2"/></linearGradient></defs>
  <path fill="url(#g)" d="M16 2 C22 18 30 28 28 44 C27 56 20 62 16 62 C12 62 5 56 4 44 C2 28 10 18 16 2 Z"/>
  <path fill="#d2fff6" d="M16 24 C20 33 24 39 22 48 C21 54 18 57 16 57 C14 57 11 54 10 48 C8 39 12 33 16 24 Z"/></svg>`,
  { size: 128 },
);

const ringMarks = (() => {
  let s = "";
  for (let i = 0; i < 28; i++) {
    const a = (i * 2 * Math.PI) / 28;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const r1 = i % 2 === 0 ? 45.8 : 44.6;
    s += `<path d="M${50 + 43 * c} ${50 + 43 * sn} L${50 + r1 * c} ${50 + r1 * sn}"/>`;
    if (i % 4 === 0) {
      const a2 = a + 0.1;
      s += `<path d="M${50 + 43 * c} ${50 + 43 * sn} L${50 + 44.8 * Math.cos(a2)} ${50 + 44.8 * Math.sin(a2)}"/>`;
    }
  }
  return s;
})();
const RUNE_RING = svg(
  `<svg viewBox="0 0 100 100"><g fill="none" stroke="#43f5d4" stroke-width="1" stroke-linecap="round">
  <circle cx="50" cy="50" r="47"/><circle cx="50" cy="50" r="41.5"/>${ringMarks}</g></svg>`,
  { size: 512 },
);

export default function build() {
  const b = createBuilder({ name: "soulScythe" });
  const root = b.joint("root", { at: [0, 0.1, 0], dir: [0, 1, 0] });
  const jaw = b.joint("jaw", { parent: root, at: [0, 1.945, 0], dir: [0, 0, 1], role: "jaw" });
  const charm = b.joint("charm", { parent: root, at: [0.098, 1.53, 0], dir: [0, -1, 0], role: "hinge" });
  const ribA = b.joint("ribbonA", { parent: root, at: [-0.04, 1.25, 0.05], dir: [0, -1, 0], role: "hinge" });
  const ribB = b.joint("ribbonB", { parent: root, at: [0.035, 1.25, 0.05], dir: [0, -1, 0], role: "hinge" });

  const P = (geo: THREE.BufferGeometry, color: Fill, at: V3, o: PartOptions = {}) =>
    b.part(geo, color, { bone: root, at, ...o });
  const ball = (at: V3, scale: number | V3, color: Fill, o: PartOptions = {}) =>
    P(new THREE.SphereGeometry(1, 7, 5), color, at, { scale, ...o });
  const torus = (at: V3, r: number, tube: number, color: Fill, rotation: V3 = [90, 0, 0], o: PartOptions = {}) =>
    P(new THREE.TorusGeometry(r, tube, 4, 14), color, at, { rotation, ...o });

  // ---------------------------------------------------------------------------------------------------------
  // Plinth: three octagonal tiers, rune ring, gems, bone spikes
  b.lathe(
    [
      [0, 0],
      [0.46, 0],
      [0.46, 0.045],
      [0.42, 0.056],
      [0.4, 0.056],
      [0.4, 0.105],
      [0.32, 0.105],
      [0.3, 0.12],
      [0.3, 0.165],
      [0.26, 0.18],
      [0, 0.18],
    ],
    { at: [0, 0, 0], bone: root, segments: 8, spin: 22.5, color: PLINTH },
  );
  glow(
    P(new THREE.PlaneGeometry(0.8, 0.8), "#ffffff", [0, 0.1065, 0], { dir: [0, 1, 0], axis: "z", texture: RUNE_RING }),
    1.2,
  );
  torus([0, 0.113, 0], 0.31, 0.01, GOLD);
  torus([0, 0.062, 0], 0.405, 0.011, GOLD);
  // glowing disc ring on the top tier and a gold socket collar round the shaft foot
  glow(
    b.lathe(
      [
        [0.1, 0.18],
        [0.22, 0.18],
        [0.22, 0.185],
        [0.1, 0.185],
      ],
      { at: [0, 0, 0], bone: root, segments: 16, color: SOUL_DEEP },
    ),
    1.1,
  );
  b.lathe(
    [
      [0.04, 0.17],
      [0.078, 0.17],
      [0.078, 0.195],
      [0.05, 0.225],
      [0.04, 0.225],
    ],
    { at: [0, 0, 0], bone: root, segments: 8, color: GOLD },
  );
  for (let k = 0; k < 8; k++) {
    const a = k * 45 * DEGR;
    glow(
      P(new THREE.OctahedronGeometry(0.016), SOUL, [0.435 * Math.cos(a), 0.06, 0.435 * Math.sin(a)], { flat: true }),
      1.4,
    );
    const a2 = a + 22.5 * DEGR;
    b.spike(
      [0.44 * Math.cos(a2), 0.045, 0.44 * Math.sin(a2)],
      [Math.cos(a2) * 0.5, 1, Math.sin(a2) * 0.5],
      0.085,
      0.02,
      { color: BONE, sides: 5, bone: root },
    );
  }

  // ---------------------------------------------------------------------------------------------------------
  // Four dragon claws cradle the shaft from the plinth
  for (let k = 0; k < 4; k++) {
    const a = (45 + k * 90) * DEGR;
    const at = (r: number, y: number): number[] => [r * Math.cos(a), y, r * Math.sin(a)];
    b.sweep(catmull([at(0.27, 0.17), at(0.32, 0.3), at(0.27, 0.46), at(0.15, 0.6), at(0.045, 0.7)]), [0.05, 0], {
      bone: root,
      color: BONE,
      sides: 6,
      caps: { start: "flat", end: "point" },
    });
    ball(at(0.32, 0.3), 0.052, BONE_DARK);
    ball(at(0.27, 0.18), [0.065, 0.04, 0.065], GOLD);
    b.spike(at(0.335, 0.31), [Math.cos(a), 0.5, Math.sin(a)], 0.085, 0.022, { color: BONE, sides: 5, bone: root });
    // knuckle bands on the claw
    ball(at(0.23, 0.5), 0.022, GOLD);
  }
  torus([0, 0.69, 0], 0.043, 0.011, GOLD);

  // ---------------------------------------------------------------------------------------------------------
  // Snath: bone lower shaft, wrapped grip, vertebra column, collar
  b.rod([0, 0.17, 0], [0, 0.82, 0], [0.034, 0.033], { color: BONE_SHAFT, bone: root, sides: 8 });
  for (const y of [0.22, 0.5, 0.58, 0.76]) torus([0, y, 0], 0.036, 0.007, BONE_DARK, [90, 0, 0], { flat: true });
  for (const y of [0.25, 0.42]) glow(torus([0, y, 0], 0.036, 0.004, SOUL), 1.3);

  b.rod([0, 0.82, 0], [0, 1.22, 0], 0.037, { color: GRIP_DARK, bone: root, sides: 8 });
  b.rod([0, 0.82, 0], [0, 1.22, 0], 0.0385, {
    color: paint((_p, _n, s) => ((((s[1] - 5760 * s[0]) % 60) + 60) % 60 < 22 ? GRIP_LIGHT : GRIP_DARK)),
    bone: root,
    sides: 8,
  });
  for (const [y0, y1] of [
    [0.79, 0.83],
    [1.0, 1.02],
    [1.215, 1.255],
  ])
    b.rod([0, y0, 0], [0, y1, 0], 0.043, { color: GOLD, bone: root, sides: 8 });
  for (let k = 0; k < 4; k++) {
    const a = (k * 90 + 20) * DEGR;
    glow(ball([0.043 * Math.cos(a), 0.81, 0.043 * Math.sin(a)], 0.009, SOUL), 1.3);
  }

  // inner core of the upper snath
  b.rod([0, 1.2, 0], [0, 1.93, 0], 0.024, { color: VOID, bone: root, sides: 8 });
  const VERT: OutlinePoint[] = [
    [0, 0],
    [0.042, 0],
    [0.043, 0.012],
    [0.032, 0.032],
    [0.03, 0.05],
    [0.032, 0.068],
    [0.043, 0.088],
    [0.042, 0.1],
    [0, 0.1],
  ];
  for (let i = 0; i < 5; i++) {
    const y0 = 1.24 + i * 0.108;
    b.lathe(VERT, { at: [0, y0, 0], bone: root, segments: 8, color: BONE });
    b.spike([0, y0 + 0.05, -0.025], [0, 0.35, -1], 0.07 - i * 0.004, 0.014, { color: BONE_DARK, sides: 4, bone: root });
    for (const s of [1, -1]) {
      const len = i === 2 && s === 1 ? 0.075 : 0.06 + 0.01 * (i % 2);
      b.spike([s * 0.03, y0 + 0.05, 0], [s, 0.35, 0], len, 0.012, { color: BONE, sides: 5, bone: root });
    }
    glow(torus([0, y0 + 0.104, 0], 0.028, 0.006, SOUL), 1.3);
  }
  torus([0.098, 1.53, 0], 0.016, 0.004, GOLD, [0, 0, 0]);

  b.rod([0, 1.8, 0], [0, 1.83, 0], 0.05, { color: GOLD, bone: root, sides: 8 });
  b.rod([0, 1.83, 0], [0, 1.86, 0], 0.043, { color: VOID, bone: root, sides: 8 });
  b.rod([0, 1.86, 0], [0, 1.885, 0], 0.05, { color: GOLD, bone: root, sides: 8 });
  for (let k = 0; k < 6; k++) {
    const a = k * 60 * DEGR;
    glow(ball([0.045 * Math.cos(a), 1.845, 0.045 * Math.sin(a)], 0.007, SOUL), 1.3);
  }

  // ---------------------------------------------------------------------------------------------------------
  // Dragon skull head
  P(new THREE.SphereGeometry(1, 10, 8), BONE, [0, 2.02, -0.015], { scale: [0.075, 0.066, 0.095] });
  b.frustumBox([0, 2.0, 0.05], [0, 1.99, 0.25], [0.105, 0.085], [0.07, 0.05], { color: BONE, bone: root });
  P(new THREE.BoxGeometry(0.098, 0.077, 0.014), GOLD, [0, 1.9955, 0.14]);
  b.spike([0, 2.012, 0.2], [0, 0.8, 0.5], 0.06, 0.016, { color: BONE_DARK, sides: 5, bone: root });
  for (const s of [1, -1]) {
    b.capsule([s * 0.075, 2.062, 0.0], [s * 0.025, 2.058, 0.075], 0.013, { color: BONE_DARK, bone: root });
    ball([s * 0.045, 2.03, 0.05], [0.03, 0.028, 0.026], VOID_DARK);
    glow(ball([s * 0.046, 2.03, 0.062], 0.017, SOUL), 1.6);
    glow(ball([s * 0.047, 2.03, 0.074], 0.008, SOUL_HOT), 2);
    ball([s * 0.02, 2.002, 0.248], 0.008, VOID_DARK);
    b.spike([s * 0.07, 1.99, -0.04], [s, -0.2, -0.5], 0.06, 0.015, { color: BONE, sides: 5, bone: root });
    // horns, large pair swept up and back, small pair swept low
    b.sweep(
      catmull([
        [s * 0.045, 2.065, -0.03],
        [s * 0.11, 2.105, -0.09],
        [s * 0.19, 2.18, -0.15],
        [s * 0.25, 2.29, -0.12],
      ]),
      [0.03, 0],
      {
        bone: root,
        color: BONE,
        bands: [
          [0.1, GOLD],
          [0.25, BONE_DARK],
          [1, BONE],
        ],
        sides: 6,
        caps: { start: "flat", end: "point" },
      },
    );
    b.sweep(
      catmull([
        [s * 0.065, 2.0, -0.04],
        [s * 0.13, 1.99, -0.1],
        [s * 0.2, 1.93, -0.16],
      ]),
      [0.022, 0],
      { bone: root, color: BONE_DARK, sides: 6, caps: { start: "flat", end: "point" } },
    );
    // soul flames licking back from the eyes
    glow(
      b.cards([frame([s * 0.046, 2.052, 0.04], [s * 0.4, 1, -0.35])], FLAME, {
        size: [0.05, 0.11],
        cross: true,
        bend: 20,
        bone: root,
        rng: rng(5 + (s > 0 ? 1 : 0)),
        vary: 0.2,
      }),
      1.2,
    );
  }
  // upper teeth
  const snoutAt = (z: number) => {
    const t = (z - 0.05) / 0.2;
    const w = 0.105 + (0.07 - 0.105) * t;
    const h = 0.085 + (0.05 - 0.085) * t;
    const cy = 2.0 + (1.99 - 2.0) * t;
    return { halfW: w / 2, bottom: cy - h / 2 };
  };
  for (const z of [0.08, 0.105, 0.12, 0.165, 0.19, 0.215]) {
    const { halfW, bottom } = snoutAt(z);
    const fang = z === 0.12;
    for (const s of [1, -1])
      b.spike([s * (halfW - 0.009), bottom + 0.004, z], [0, -1, 0], fang ? 0.065 : 0.035, fang ? 0.011 : 0.008, {
        color: TOOTH,
        sides: 5,
        bone: root,
      });
  }
  // forehead soul gem and crest spikes
  glow(P(new THREE.OctahedronGeometry(0.02), SOUL, [0, 2.078, 0.035], { flat: true }), 1.8);
  torus([0, 2.074, 0.035], 0.024, 0.005, GOLD, [65, 0, 0]);
  for (const [z, y, len] of [
    [-0.03, 2.07, 0.1],
    [-0.075, 2.05, 0.09],
    [-0.115, 2.02, 0.08],
  ])
    b.spike([0, y, z], [0, 0.45, -1], len, 0.018, { color: BONE_DARK, sides: 5, bone: root });

  // lower jaw on its own joint
  b.frustumBox([0, 1.925, 0.02], [0, 1.925, 0.22], [0.085, 0.03], [0.06, 0.022], { color: BONE, bone: jaw });
  P(new THREE.BoxGeometry(0.07, 0.006, 0.14), GOLD, [0, 1.908, 0.12], { bone: jaw });
  b.rod([0, 1.95, 0.04], [0, 1.952, 0.2], 0.01, { color: SOUL, bone: jaw, sides: 5 });
  for (const z of [0.06, 0.1, 0.14, 0.18]) {
    const t = (z - 0.02) / 0.2;
    const halfW = (0.085 - 0.025 * t) / 2;
    const top = 1.925 + (0.03 - 0.008 * t) / 2;
    for (const s of [1, -1])
      b.spike([s * (halfW - 0.008), top - 0.003, z], [0, 1, 0], 0.028, 0.008, { color: TOOTH, sides: 5, bone: jaw });
  }

  // ---------------------------------------------------------------------------------------------------------
  // Crescent blade: glowing soul edge, ivory body, gold inlay, violet spine plate
  const layer = (f0: number, f1: number, u1: number, thickness: number, color: Fill, bevel: number) => {
    const n = 12;
    const pts: OutlinePoint[] = [];
    for (let i = 0; i <= n; i++) {
      const u = (u1 * i) / n;
      pts.push(arcPt(u, f1 * widthAt(u)));
    }
    for (let i = n; i >= 0; i--) {
      const u = (u1 * i) / n;
      pts.push(arcPt(u, f0 * widthAt(u)));
    }
    return b.extrude(pts, { at: [0, 0, 0], x: [1, 0, 0], y: [0, 1, 0], thickness, bevel, color, bone: root });
  };
  glow(layer(-0.62, -0.46, 1, 0.034, EDGE, 0.004), 1.4);
  layer(-0.46, 0.08, 1, 0.03, BLADE_BONE, 0.006);
  glow(layer(-0.27, -0.22, 0.92, 0.033, SOUL_DEEP, 0.003), 1.2);
  layer(0.08, 0.13, 0.97, 0.036, GOLD, 0.004);
  layer(0.13, 0.38, 0.97, 0.046, SPINE_PLATE, 0.008);

  // dragon-spine barbs along the back of the blade
  for (let j = 0; j < 9; j++) {
    const u = 0.05 + j * 0.1;
    const th = thetaAt(u);
    const w = widthAt(u);
    const rad = [Math.cos(th), Math.sin(th)];
    const tan = [Math.sin(th), -Math.cos(th)];
    b.spike(
      [CX + (RR + 0.3 * w) * rad[0], CY + (RR + 0.3 * w) * rad[1], 0],
      [rad[0] + 0.7 * tan[0], rad[1] + 0.7 * tan[1], 0],
      0.03 + 0.09 * Math.pow(1 - u, 0.8),
      0.012 + 0.012 * (1 - u),
      { color: BONE, sides: 4, bone: root },
    );
  }
  // gold rivets and soul diamonds on the spine plate, glyphs on the body
  for (const z of [0.0236, -0.0236]) {
    for (let j = 0; j < 8; j++) {
      const u = 0.08 + j * 0.1;
      const [x, y] = arcPt(u, 0.255 * widthAt(u));
      ball([x, y, z], Math.min(0.0085, 0.09 * widthAt(u)), GOLD);
    }
    for (const u of [0.23, 0.43, 0.63]) {
      const [x, y] = arcPt(u, 0.255 * widthAt(u));
      glow(
        P(new THREE.OctahedronGeometry(Math.min(0.016, 0.12 * widthAt(u))), SOUL, [x, y, z * 1.02], { flat: true }),
        1.4,
      );
    }
  }
  for (const sign of [1, -1]) {
    for (let k = 0; k < 6; k++) {
      const u = 0.14 + k * 0.095;
      const w = widthAt(u);
      const [x, y] = arcPt(u, -0.19 * w);
      const th = thetaAt(u);
      const size = Math.min(0.055, 0.42 * w);
      glow(
        P(new THREE.PlaneGeometry(size, size), "#ffffff", [x, y, sign * 0.0178], {
          dir: [0, 0, sign],
          axis: "z",
          up: [Math.sin(th), -Math.cos(th), 0],
          texture: GLYPHS[k % 3],
        }),
        1.2,
      );
    }
  }
  // heel claw hooking back from the skull
  b.sweep(
    catmull([
      [-0.05, 1.96, 0],
      [-0.14, 1.985, 0],
      [-0.22, 1.94, 0],
      [-0.25, 1.85, 0],
    ]),
    [0.026, 0],
    { bone: root, color: BONE, sides: 6, caps: { start: "flat", end: "point" } },
  );
  b.spike([-0.13, 1.96, 0], [-0.5, -1, 0], 0.07, 0.016, { color: BONE_DARK, sides: 5, bone: root });

  // ---------------------------------------------------------------------------------------------------------
  // Souls drifting in the crescent
  const wisps: Array<[number, number, number]> = [
    [0.27, 1.6, 0.17],
    [0.42, 1.5, 0.12],
    [0.13, 1.5, 0.1],
    [0.36, 1.76, 0.1],
    [0.52, 1.64, 0.08],
  ];
  glow(
    b.cards(
      wisps.map(([x, y]) => frame([x, y, 0], [0, 1, 0])),
      FLAME,
      {
        size: [0.06, 0.13],
        lean: 8,
        bend: 25,
        cross: true,
        vary: 0.3,
        rng: rng(11),
        bone: root,
      },
    ),
    1.3,
  );

  // ---------------------------------------------------------------------------------------------------------
  // Soul lantern on a gold chain, hanging from a vertebra
  for (let k = 0; k < 3; k++)
    torus([0.098, 1.51 - k * 0.022, 0], 0.011, 0.0028, GOLD, k % 2 === 0 ? [0, 0, 0] : [0, 90, 0], { bone: charm });
  P(new THREE.ConeGeometry(0.03, 0.04, 6), GOLD, [0.098, 1.445, 0], { bone: charm });
  glow(ball([0.098, 1.385, 0], 0.028, SOUL, { bone: charm }), 1.6);
  glow(ball([0.098, 1.385, 0], 0.016, SOUL_HOT, { bone: charm }), 2);
  for (let k = 0; k < 4; k++)
    torus([0.098, 1.385, 0], 0.04, 0.004, GOLD, [0, k * 45, 0], { bone: charm });
  torus([0.098, 1.385, 0], 0.042, 0.005, GOLD, [90, 0, 0], { bone: charm });
  P(new THREE.ConeGeometry(0.015, 0.04, 5), GOLD, [0.098, 1.33, 0], { bone: charm, rotation: [180, 0, 0] });
  glow(ball([0.098, 1.305, 0], 0.01, SOUL, { bone: charm }), 1.4);

  // ---------------------------------------------------------------------------------------------------------
  // Ribbons tied under the grip cuff
  const ribbon = (len: number, w: number, at: V3, bone: typeof ribA, accent: Fill) => {
    const outline: OutlinePoint[] = [
      [-w / 2, 0],
      [w / 2, 0],
      [w * 0.525, -len * 0.4],
      [w * 0.45, -len * 0.75],
      [w * 0.65, -len],
      [0, -len * 0.85],
      [-w * 0.65, -len * 1.05],
      [-w * 0.45, -len * 0.75],
      [-w * 0.525, -len * 0.4],
    ];
    b.extrude(outline, {
      at,
      x: [1, 0, 0],
      y: [0, 1, 0],
      thickness: 0.006,
      bone,
      color: paint((_p, _n, s) => (s[1] > -0.03 ? GOLD : Math.abs(s[0]) < w * 0.08 ? accent : RIBBON)),
    });
    ball([(at as number[])[0], (at as number[])[1], (at as number[])[2]], 0.017, GOLD, { bone });
  };
  ribbon(0.38, 0.044, [-0.04, 1.25, 0.05], ribA, GOLD);
  ribbon(0.28, 0.036, [0.035, 1.25, 0.05], ribB, VOID_LINE);

  // rest poses: jaw slightly open, ribbons splayed
  b.pose(jaw, { axis: [1, 0, 0], deg: 10 });
  b.pose(ribA, { axis: [0, 0, 1], deg: 8 });
  b.pose(ribB, { axis: [0, 0, 1], deg: -6 });
  b.pose(charm, { axis: [0, 0, 1], deg: -4 });

  return b.root;
}
