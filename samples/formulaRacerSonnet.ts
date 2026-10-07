import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { Fill } from "../src/context";
import { frame } from "../src/frame";
import { catmull } from "../src/path";
import { mottle, paint } from "../src/paint";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Formula Racer",
  description:
    "Open-wheel formula racing car in faceted low-poly: chamfered monocoque, halo, sidepods, multi-element wings, steerable front wheels, spinning wheels and a hinged DRS flap.",
  style: "low-poly",
  commit: "88fc1f0",
};

type V3 = [number, number, number];
type Outline = [number, number][];

// ---- palette ----
const BLUE = "#1f55d9";
const NAVY = "#12286b";
const WHITE = "#f4f6fa";
const ORANGE = "#ff7a1a";
const YELLOW = "#ffd21f";
const CARBON = "#2a2e36";
const DARK = "#14161a";
const SILVER = "#b6bdc7";
const TITAN = "#8e97a3";
const TYRE = "#1d1e22";
const RED = "#e0262b";
const GOLD = "#e3a93a";
const CYAN = "#37e6ff";
const TAN = "#b98b56";
const GLASS = "#33465c";

const DEG = Math.PI / 180;
const K8 = 1 / Math.cos(Math.PI / 8); // octagon: flat face sits at r * cos(22.5deg)

export default function build() {
  const b = createBuilder({ name: "formulaRacer", paintSize: 2048 });
  type PartOpts = NonNullable<Parameters<typeof b.part>[2]>;

  // ---- paints ----
  const livery = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (n.y < -0.5) return CARBON;
    if (p.z > 2.3) return ORANGE;
    if (n.y > 0.45 && ax < 0.06) return WHITE;
    if (n.y > 0.45 && ax < 0.085) return ORANGE;
    if (Math.abs(n.x) > 0.35) {
      // panel gaps
      if (Math.abs(p.z - 0.12) < 0.004 || Math.abs(p.z + 0.62) < 0.004 || Math.abs(p.z - 1.05) < 0.004) return NAVY;
      const u = p.y + 0.3 * p.z;
      if (Math.abs(u - 0.44) < 0.05) return WHITE;
      if (u > 0.4939 && u < 0.5239) return ORANGE;
      if (u < 0.3861 && u > 0.3561) return ORANGE;
    }
    return BLUE;
  });
  const wingPaint = paint((p) => (p.y > 0.9 ? ORANGE : p.y < 0.5 ? CARBON : BLUE));
  const helmetPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (n.y > 0.1 && ax < 0.028) return WHITE;
    if (n.y > 0.1 && ax < 0.045) return ORANGE;
    if (p.y < 0.69 && n.y < 0.3) return NAVY;
    return BLUE;
  });
  const floorPaint = paint((p) => {
    if (Math.abs(p.x) > 0.72 && p.z > -0.9 && p.z < 0.7) return ORANGE;
    if (Math.abs(p.x) < 0.02) return WHITE;
    return CARBON;
  });
  const suit = paint((p) => (p.y > 0.66 ? WHITE : p.z > 0 ? WHITE : NAVY));

  // ---- textures ----
  const FONT = `font-family="Arial Black, Impact, Arial, sans-serif" font-weight="900"`;
  const podTex = svg(
    `<svg viewBox="0 0 240 64"><rect x="2" y="6" width="236" height="52" rx="6" fill="${WHITE}"/><polygon points="2,6 74,6 50,58 2,58" fill="${ORANGE}"/><text x="86" y="44" ${FONT} font-style="italic" font-size="30" textLength="140" lengthAdjust="spacingAndGlyphs" fill="${NAVY}">VOLTARA</text></svg>`,
    { size: 512 },
  );
  const coverTex = svg(
    `<svg viewBox="0 0 240 64"><rect x="2" y="6" width="236" height="52" rx="6" fill="${NAVY}"/><rect x="2" y="48" width="236" height="10" fill="${ORANGE}"/><text x="14" y="40" ${FONT} font-style="italic" font-size="32" textLength="210" lengthAdjust="spacingAndGlyphs" fill="${WHITE}">ZENIX OIL</text></svg>`,
    { size: 512 },
  );
  const roundelTex = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="${NAVY}"/><circle cx="50" cy="50" r="40" fill="${WHITE}"/><text x="50" y="68" ${FONT} font-size="50" text-anchor="middle" fill="${NAVY}">27</text></svg>`,
    { size: 256 },
  );
  const tyreTex = svg(
    `<svg viewBox="0 0 160 40"><text x="80" y="30" ${FONT} font-size="30" text-anchor="middle" textLength="150" lengthAdjust="spacingAndGlyphs" fill="#111111">ZENITH</text></svg>`,
    { size: 384 },
  );
  const wingTex = svg(
    `<svg viewBox="0 0 160 48"><rect x="2" y="2" width="156" height="44" rx="5" fill="${WHITE}"/><text x="80" y="35" ${FONT} font-style="italic" font-size="28" text-anchor="middle" textLength="140" lengthAdjust="spacingAndGlyphs" fill="${NAVY}">KAIRO</text></svg>`,
    { size: 384 },
  );

  // ---- skeleton ----
  const chassis = b.joint("chassis", { at: [0, 0.35, 0], dir: [0, 0, 1] });
  const FR = { R: 0.33, W: 0.3, x: 0.75, z: 1.75 };
  const RR = { R: 0.355, W: 0.4, x: 0.8, z: -1.65 };
  const FY = FR.R * Math.cos(Math.PI / 10);
  const RY = RR.R * Math.cos(Math.PI / 10);
  const steer: Record<string, Joint> = {};
  const wheelJ: Record<string, Joint> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    steer[side] = b.joint(`steer${side}`, { parent: chassis, at: [s * FR.x, FY, FR.z], dir: [0, 1, 0], role: "hinge" });
    wheelJ[`F${side}`] = b.joint(`wheelF${side}`, {
      parent: steer[side],
      at: [s * FR.x, FY, FR.z],
      dir: [0, 0, 1],
      role: "hinge",
    });
    wheelJ[`R${side}`] = b.joint(`wheelR${side}`, {
      parent: chassis,
      at: [s * RR.x, RY, RR.z],
      dir: [0, 0, 1],
      role: "hinge",
    });
  }
  const drs = b.joint("drsFlap", { parent: chassis, at: [0, 0.84, -2.36], dir: [0, 0, -1], role: "hinge" });
  const wheelCol: V3 = [0, 0.66, 0.3];
  const colDir: V3 = [0, 0.62, -0.78];
  const swJoint = b.joint("steeringWheel", { parent: chassis, at: wheelCol, dir: colDir, role: "hinge" });

  // ---- helpers ----
  const bx = (w: number, h: number, d: number, color: Fill, at: V3, o: PartOpts = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: chassis, at, flat: true, ...o });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: Fill, at: V3, o: PartOpts = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone: chassis, at, flat: true, ...o });
  const st = (x: number, y: number, z: number, w: number, h: number) => ({ at: [x, y, z] as V3, w: w * K8, h: h * K8 });
  const oct = { section: { ngon: 8 }, twist: () => 22.5 } as const;
  const rod = (a: V3, c: V3, r: number, color: Fill, o: Record<string, unknown> = {}) =>
    b.rod(a, c, r, { color, bone: chassis, sides: 6, ...o });

  // merge small static pieces of one colour & bone
  const bits = (bone: Joint, color: Fill) => {
    const list: THREE.BufferGeometry[] = [];
    return {
      add(g: THREE.BufferGeometry, pos: V3, rot: V3 = [0, 0, 0]) {
        g.applyMatrix4(
          new THREE.Matrix4().compose(
            new THREE.Vector3(...pos),
            new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * DEG, rot[1] * DEG, rot[2] * DEG)),
            new THREE.Vector3(1, 1, 1),
          ),
        );
        list.push(g);
      },
      flush(name?: string) {
        if (list.length) b.part(mergeGeometries(list), color, { bone, at: [0, 0, 0], flat: true, name });
      },
    };
  };

  const foil = (z0: number, chord: number, y0: number, upDeg: number, t: number): Outline => {
    const a = upDeg * DEG;
    const us = [0, 0.04, 0.15, 0.35, 0.6, 0.85, 1];
    const th = [0, 0.55, 0.9, 1, 0.75, 0.4, 0.14];
    const pt = (u: number, v: number): [number, number] => [
      z0 - u * chord * Math.cos(a) + v * Math.sin(a),
      y0 + u * chord * Math.sin(a) + v * Math.cos(a),
    ];
    const top = us.map((u, i) => pt(u, (th[i] * t) / 2));
    const bot = us
      .slice(1, -1)
      .map((u, i) => pt(u, (-th[i + 1] * t) / 2))
      .reverse();
    return [...top, ...bot];
  };
  const plate = (out: Outline, at: V3, tiltDeg: number, thick: number, color: Fill, o: Record<string, unknown> = {}) => {
    const a = tiltDeg * DEG;
    return b.extrude(out, {
      at,
      x: [1, 0, 0],
      y: [0, Math.sin(a), Math.cos(a)],
      thickness: thick,
      bevel: Math.min(0.004, thick * 0.35),
      color,
      bone: chassis,
      ...o,
    });
  };

  // ================= BODY =================
  const hull = b.loft(
    [
      st(0, 0.19, 2.66, 0.13, 0.1),
      st(0, 0.22, 2.3, 0.2, 0.15),
      st(0, 0.25, 1.85, 0.28, 0.22),
      st(0, 0.28, 1.4, 0.38, 0.34),
      st(0, 0.33, 0.95, 0.5, 0.46),
      st(0, 0.33, 0.4, 0.56, 0.46),
      st(0, 0.35, -0.15, 0.52, 0.5),
    ],
    { bone: chassis, color: livery, caps: "flat", ...oct, name: "hull" },
  );

  const cover = b.loft(
    [
      st(0, 0.5, -0.1, 0.42, 0.4),
      st(0, 0.5, -0.7, 0.46, 0.36),
      st(0, 0.42, -1.2, 0.38, 0.26),
      st(0, 0.36, -1.7, 0.3, 0.22),
      st(0, 0.33, -2.1, 0.22, 0.18),
    ],
    { bone: chassis, color: livery, caps: "flat", ...oct, name: "cover" },
  );

  b.loft([st(0, 0.82, -0.22, 0.32, 0.3), st(0, 0.8, -0.58, 0.26, 0.26), st(0, 0.74, -0.95, 0.1, 0.14)], {
    bone: chassis,
    color: livery,
    caps: "flat",
    ...oct,
    name: "airbox",
  });

  // shark fin
  b.extrude(
    [
      [-0.62, 0.8],
      [-1.0, 0.8],
      [-1.5, 0.7],
      [-2.05, 0.55],
      [-2.05, 0.4],
      [-1.5, 0.46],
      [-1.0, 0.58],
      [-0.62, 0.66],
    ],
    { at: [0, 0, 0], thickness: 0.025, bevel: 0.004, color: BLUE, bone: chassis, name: "fin" },
  );
  b.extrude(
    [
      [-0.62, 0.8],
      [-1.0, 0.8],
      [-1.5, 0.7],
      [-2.05, 0.55],
      [-2.05, 0.5],
      [-1.5, 0.65],
      [-1.0, 0.75],
      [-0.62, 0.75],
    ],
    { at: [0, 0, 0], thickness: 0.032, bevel: 0.002, color: ORANGE, bone: chassis, name: "finTrim" },
  );

  // sidepods
  const pods: Record<string, ReturnType<typeof b.loft>> = {};
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    pods[side] = b.loft(
      [
        st(s * 0.5, 0.3, 0.9, 0.42, 0.4),
        st(s * 0.52, 0.31, 0.4, 0.46, 0.44),
        st(s * 0.5, 0.3, -0.2, 0.44, 0.4),
        st(s * 0.44, 0.27, -0.8, 0.36, 0.32),
        st(s * 0.36, 0.24, -1.3, 0.24, 0.22),
      ],
      { bone: chassis, color: livery, caps: "flat", ...oct, name: `pod${side}` },
    );
    // intake mouth + lips
    bx(0.3, 0.24, 0.02, DARK, [s * 0.5, 0.29, 0.905], { name: `intake${side}` });
    bx(0.38, 0.03, 0.07, CARBON, [s * 0.5, 0.455, 0.88]);
    bx(0.38, 0.03, 0.07, CARBON, [s * 0.5, 0.115, 0.88]);
    bx(0.03, 0.3, 0.07, CARBON, [s * 0.69, 0.29, 0.88]);
    bx(0.03, 0.3, 0.07, CARBON, [s * 0.31, 0.29, 0.88]);
  }
  // cooling slits + hull deck
  {
    const slit = bits(chassis, DARK);
    for (const s of [1, -1])
      for (let i = 0; i < 7; i++) slit.add(new THREE.BoxGeometry(0.17, 0.006, 0.02), [s * 0.47, 0.436 - i * 0.012, -0.5 - i * 0.075], [0, 0, 0]);
    for (let i = 0; i < 6; i++) slit.add(new THREE.BoxGeometry(0.16, 0.008, 0.025), [0, 0.7 - i * 0.012, -0.72 - i * 0.07]);
    slit.flush("slits");
  }

  // underbelly, floor, plank
  bx(0.4, 0.1, 1.9, CARBON, [0, 0.11, 0.6], { name: "belly" });
  b.extrude(
    [
      [0.3, 1.55],
      [0.45, 1.4],
      [0.62, 1.0],
      [0.78, 0.7],
      [0.8, -0.6],
      [0.76, -1.05],
      [0.55, -1.28],
      [0.52, -2.0],
      [-0.52, -2.0],
      [-0.55, -1.28],
      [-0.76, -1.05],
      [-0.8, -0.6],
      [-0.78, 0.7],
      [-0.62, 1.0],
      [-0.45, 1.4],
      [-0.3, 1.55],
    ],
    { at: [0, 0.045, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, bevel: 0.006, color: floorPaint, bone: chassis, name: "floor" },
  );
  b.extrude(
    [
      [0.27, 1.45],
      [0.3, -1.3],
      [-0.3, -1.3],
      [-0.27, 1.45],
    ],
    { at: [0, 0.021, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.012, color: TAN, bone: chassis, name: "plank" },
  );
  // diffuser
  b.extrude(
    [
      [-0.52, 0],
      [0.52, 0],
      [0.5, 0.72],
      [-0.5, 0.72],
    ],
    { at: [0, 0.06, -1.3], x: [1, 0, 0], y: [0, 0.32, -1], thickness: 0.022, bevel: 0.004, color: CARBON, bone: chassis, name: "diffuser" },
  );
  for (const x of [-0.3, -0.15, 0, 0.15, 0.3])
    b.extrude(
      [
        [-1.35, 0.05],
        [-2.0, 0.255],
        [-2.0, 0.2],
        [-1.35, 0.016],
      ],
      { at: [x, 0, 0], thickness: 0.012, color: CARBON, bone: chassis, name: "diffFin" },
    );

  // bargeboards + floor fences
  for (const s of [1, -1]) {
    [
      { x: 0.46, top: 0.3, z0: 0.95 },
      { x: 0.54, top: 0.26, z0: 0.82 },
      { x: 0.62, top: 0.2, z0: 0.7 },
    ].forEach((p, i) => {
      b.extrude(
        [
          [p.z0, 0.06],
          [p.z0, p.top - 0.04],
          [p.z0 - 0.18, p.top],
          [p.z0 - 0.5, p.top - 0.02],
          [p.z0 - 0.62, 0.06],
        ],
        { at: [s * p.x, 0, 0], thickness: 0.014, bevel: 0.003, color: i === 0 ? ORANGE : CARBON, bone: chassis, name: `barge${s > 0 ? "L" : "R"}${i}` },
      );
    });
    for (let i = 0; i < 5; i++)
      b.extrude(
        [
          [0.7 - i * 0.28, 0.06],
          [0.7 - i * 0.28, 0.13],
          [0.52 - i * 0.28, 0.1],
          [0.5 - i * 0.28, 0.06],
        ],
        { at: [s * 0.775, 0, 0], thickness: 0.012, color: i % 2 ? CARBON : WHITE, bone: chassis, name: "fence" },
      );
  }

  // ================= COCKPIT & DRIVER =================
  bx(0.46, 0.03, 1.0, CARBON, [0, 0.565, 0.12], { name: "deck" });
  bx(0.32, 0.012, 0.86, DARK, [0, 0.586, 0.14], { name: "cockpit" });
  for (const s of [1, -1]) {
    rod([s * 0.19, 0.6, 0.6], [s * 0.19, 0.6, -0.25], 0.022, CARBON, { name: "rim" });
    bx(0.04, 0.04, 0.5, ORANGE, [s * 0.215, 0.6, 0.32], { name: "rimTrim" });
  }
  bx(0.4, 0.045, 0.06, CARBON, [0, 0.6, 0.62], { name: "rimFront" });
  bx(0.4, 0.05, 0.05, CARBON, [0, 0.6, -0.27], { name: "rimRear" });
  // headrest + padding
  bx(0.3, 0.22, 0.07, DARK, [0, 0.7, -0.12], { name: "headrest" });
  for (const s of [1, -1]) bx(0.05, 0.16, 0.2, ORANGE, [s * 0.145, 0.7, 0.04], { name: "headPad", rotation: [0, s * 8, 0] });
  // seat back
  bx(0.34, 0.2, 0.05, DARK, [0, 0.64, -0.16], { rotation: [-20, 0, 0], name: "seatBack" });

  // driver
  b.part(new THREE.SphereGeometry(0.19, 8, 6), suit, { bone: chassis, at: [0, 0.62, -0.02], scale: [1.15, 0.85, 0.85], flat: true, name: "torso" });
  b.part(new THREE.SphereGeometry(0.125, 9, 7), helmetPaint, { bone: chassis, at: [0, 0.76, 0.1], scale: [0.9, 1, 1.08], flat: true, name: "helmet" });
  b.part(new THREE.SphereGeometry(0.129, 7, 3, Math.PI / 2 - 0.85, 1.7, Math.PI * 0.3, Math.PI * 0.2), GOLD, {
    bone: chassis,
    at: [0, 0.76, 0.1],
    scale: [0.9, 1, 1.08],
    flat: true,
    name: "visor",
  });
  b.part(new THREE.SphereGeometry(0.129, 9, 3, Math.PI / 2 - 0.85, 1.7, Math.PI * 0.5, Math.PI * 0.11), DARK, {
    bone: chassis,
    at: [0, 0.76, 0.1],
    scale: [0.9, 1, 1.08],
    flat: true,
    name: "chinbar",
  });
  for (const s of [1, -1]) {
    b.capsule([s * 0.18, 0.65, -0.1], [s * 0.2, 0.6, 0.14], 0.04, { color: BLUE, bone: chassis, sides: 6, name: "upperArm" });
    b.capsule([s * 0.2, 0.6, 0.14], [s * 0.115, 0.69, 0.33], 0.035, { color: WHITE, bone: chassis, sides: 6, name: "foreArm" });
    b.part(new THREE.SphereGeometry(0.04, 6, 4), DARK, { bone: swJoint, at: [s * 0.11, 0.7, 0.33], flat: true, name: "glove" });
  }
  // belts
  for (const s of [1, -1]) rod([s * 0.1, 0.8, -0.14], [s * 0.07, 0.64, 0.06], 0.014, RED, { name: "belt", sides: 4 });

  // steering wheel
  {
    const q: PartOpts = { bone: swJoint, dir: colDir, axis: "z", flat: true };
    b.part(new THREE.BoxGeometry(0.28, 0.1, 0.035), CARBON, { ...q, at: wheelCol, name: "swBody" });
    for (const s of [1, -1]) {
      const gx = s * 0.15;
      b.part(new THREE.BoxGeometry(0.045, 0.14, 0.04), ORANGE, { ...q, at: [gx, wheelCol[1] + 0.0, wheelCol[2]], name: "swGrip" });
    }
    glow(
      b.part(new THREE.PlaneGeometry(0.11, 0.045), CYAN, {
        bone: swJoint,
        at: [0, wheelCol[1] + 0.021, wheelCol[2] + 0.033 * 0.0],
        dir: colDir,
        axis: "z",
        name: "swScreen",
      }),
      1.2,
    );
    const btnCols = [RED, YELLOW, "#4cd964", WHITE];
    btnCols.forEach((c, i) =>
      b.part(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 6), c, {
        bone: swJoint,
        at: [(i - 1.5) * 0.045, wheelCol[1] - 0.025, wheelCol[2] + 0.026],
        dir: colDir,
        axis: "y",
        flat: true,
        name: "swBtn",
      }),
    );
  }
  rod([0, 0.62, 0.42], [0, 0.56, 0.58], 0.018, DARK, { name: "column" });

  // halo
  const haloPath = catmull(
    [
      [0.27, 0.6, -0.2],
      [0.27, 0.72, -0.12],
      [0.25, 0.82, 0.1],
      [0.14, 0.84, 0.4],
      [0, 0.79, 0.56],
      [-0.14, 0.84, 0.4],
      [-0.25, 0.82, 0.1],
      [-0.27, 0.72, -0.12],
      [-0.27, 0.6, -0.2],
    ],
    { tension: 0.5 },
  );
  b.sweep(haloPath, 0.022, { color: TITAN, bone: chassis, section: { ngon: 6 }, caps: "flat", name: "halo" });
  rod([0, 0.79, 0.56], [0, 0.55, 0.88], 0.026, TITAN, { name: "haloPillar" });
  bx(0.09, 0.05, 0.06, CARBON, [0, 0.56, 0.84], { name: "haloMount" });
  for (const s of [1, -1]) bx(0.07, 0.05, 0.08, CARBON, [s * 0.27, 0.6, -0.2], { name: "haloFoot" });
  // camera pod + aerial
  bx(0.09, 0.07, 0.14, CARBON, [0, 0.995, -0.42], { name: "camPod" });
  bx(0.092, 0.012, 0.142, YELLOW, [0, 1.027, -0.42], { name: "camStripe" });
  cyl(0.02, 0.02, 0.02, 6, DARK, [0, 0.995, -0.34], { rotation: [90, 0, 0], name: "lens" });
  rod([0.12, 0.8, -0.62], [0.13, 0.98, -0.64], 0.006, DARK, { name: "aerial", sides: 4 });
  // airbox intake
  bx(0.24, 0.2, 0.02, DARK, [0, 0.82, -0.225], { name: "airIntake" });
  bx(0.27, 0.025, 0.05, CARBON, [0, 0.935, -0.235], { name: "airLipTop" });
  bx(0.27, 0.025, 0.05, CARBON, [0, 0.705, -0.235], { name: "airLipBot" });
  for (const s of [1, -1]) bx(0.025, 0.22, 0.05, CARBON, [s * 0.135, 0.82, -0.235], { name: "airLipSide" });

  // mirrors
  for (const s of [1, -1]) {
    rod([s * 0.4, 0.52, 0.56], [s * 0.54, 0.66, 0.52], 0.012, CARBON, { name: "mirrorStalk", sides: 4 });
    bx(0.13, 0.075, 0.05, ORANGE, [s * 0.57, 0.68, 0.52], { name: "mirror", rotation: [0, s * -12, 0] });
    b.part(new THREE.PlaneGeometry(0.11, 0.055), GLASS, {
      bone: chassis,
      at: [s * 0.57, 0.68, 0.494],
      dir: [0, 0.0, -1],
      axis: "z",
      name: "mirrorGlass",
    });
  }

  // ================= FRONT WING =================
  plate(
    [
      [-0.95, 0.02],
      [0.95, 0.02],
      [0.95, 0.26],
      [0.5, 0.3],
      [-0.5, 0.3],
      [-0.95, 0.26],
    ],
    [0, 0.07, 2.62],
    -3,
    0.018,
    CARBON,
    { name: "fwMain" },
  );
  plate(
    [
      [-0.2, 0.21],
      [0.2, 0.21],
      [0.2, 0.29],
      [-0.2, 0.29],
    ],
    [0, 0.082, 2.62],
    -3,
    0.02,
    ORANGE,
    { name: "fwNoseCap" },
  );
  for (const s of [1, -1]) {
    const m = (pts: Outline): Outline => pts.map(([x, u]) => [x * s, u]);
    plate(m([[0.14, 0], [0.93, 0.02], [0.93, 0.2], [0.14, 0.21]]), [0, 0.165, 2.58], -10, 0.014, BLUE, { name: "fwFlap1" });
    plate(m([[0.3, 0], [0.93, 0.02], [0.93, 0.17], [0.3, 0.17]]), [0, 0.235, 2.56], -17, 0.014, WHITE, { name: "fwFlap2" });
    plate(m([[0.55, 0], [0.93, 0.02], [0.93, 0.14], [0.55, 0.14]]), [0, 0.305, 2.54], -24, 0.014, ORANGE, { name: "fwFlap3" });
    // endplate
    b.extrude(
      [
        [2.5, 0.03],
        [2.5, 0.36],
        [2.72, 0.4],
        [2.95, 0.3],
        [2.95, 0.05],
        [2.75, 0.03],
      ],
      { at: [s * 0.94, 0, 0], thickness: 0.02, bevel: 0.005, color: wingPaint, bone: chassis, name: "fwEndplate" },
    );
    plate(m([[0.9, 0], [1.02, 0.03], [1.02, 0.38], [0.9, 0.4]]), [0, 0.035, 2.55], 0, 0.012, CARBON, { name: "fwFoot" });
    // pylon
    b.extrude(
      [
        [2.42, 0.2],
        [2.62, 0.17],
        [2.84, 0.1],
        [2.6, 0.078],
        [2.42, 0.1],
      ],
      { at: [s * 0.09, 0, 0], thickness: 0.026, bevel: 0.004, color: CARBON, bone: chassis, name: "fwPylon" },
    );
    // dive-plane strakes
    plate(m([[0.1, 0], [0.34, 0.01], [0.34, 0.1], [0.1, 0.11]]), [0, 0.125, 2.72], -12, 0.01, YELLOW, { name: "fwStrake" });
  }

  // ================= REAR WING =================
  for (const s of [1, -1]) {
    b.extrude(
      [
        [-2.16, 0.56],
        [-2.16, 0.84],
        [-2.3, 0.98],
        [-2.62, 0.98],
        [-2.64, 0.5],
        [-2.4, 0.46],
      ],
      { at: [s * 0.525, 0, 0], thickness: 0.022, bevel: 0.005, color: wingPaint, bone: chassis, name: "rwEndplate" },
    );
    b.part(new THREE.PlaneGeometry(0.2, 0.06), WHITE, {
      bone: chassis,
      at: [s * 0.538, 0.82, -2.43],
      dir: [s, 0, 0],
      axis: "z",
      texture: wingTex,
      name: "rwDecal",
    });
    // supports
    rod([s * 0.07, 0.36, -2.02], [s * 0.22, 0.65, -2.33], 0.016, CARBON, { name: "rwStrut" });
    rod([s * 0.45, 0.5, -2.2], [s * 0.45, 0.62, -2.3], 0.012, CARBON, { name: "rwBeamStrut", sides: 4 });
  }
  b.extrude(foil(-2.2, 0.28, 0.5, 8, 0.03), { at: [0, 0, 0], thickness: 1.0, bevel: 0.004, color: CARBON, bone: chassis, name: "beamWing" });
  b.extrude(foil(-2.22, 0.3, 0.6, 14, 0.036), { at: [0, 0, 0], thickness: 1.02, bevel: 0.005, color: BLUE, bone: chassis, name: "rwLower" });
  b.extrude(foil(-2.3, 0.28, 0.72, 20, 0.032), { at: [0, 0, 0], thickness: 1.02, bevel: 0.005, color: WHITE, bone: chassis, name: "rwMid" });
  b.extrude(foil(-2.36, 0.27, 0.84, 26, 0.028), {
    at: [0, 0, 0],
    thickness: 1.02,
    bevel: 0.005,
    color: ORANGE,
    bone: drs,
    name: "drsFlapMesh",
  });
  // centre pylon
  b.extrude(
    [
      [-2.0, 0.4],
      [-2.32, 0.5],
      [-2.4, 0.74],
      [-2.28, 0.74],
      [-2.14, 0.56],
      [-2.0, 0.5],
    ],
    { at: [0, 0, 0], thickness: 0.04, bevel: 0.005, color: CARBON, bone: chassis, name: "rwPylon" },
  );
  // T-wing and monkey seat
  plate([[-0.3, 0], [0.3, 0], [0.26, 0.13], [-0.26, 0.13]], [0, 0.57, -1.9], -10, 0.012, WHITE, { name: "tWing" });
  plate([[-0.22, 0], [0.22, 0], [0.2, 0.1], [-0.2, 0.1]], [0, 0.64, -1.92], -20, 0.01, YELLOW, { name: "tWing2" });
  for (const s of [1, -1]) {
    bx(0.012, 0.1, 0.16, CARBON, [s * 0.3, 0.6, -1.84], { name: "tWingEnd" });
    rod([s * 0.08, 0.45, -1.86], [s * 0.08, 0.57, -1.86], 0.008, CARBON, { name: "tWingPost", sides: 4 });
    cyl(0.016, 0.016, 0.04, 6, ORANGE, [s * 0.505, 0.855, -2.365], { rotation: [0, 0, 90], bone: drs, name: "drsPin" });
  }

  // crash structure, exhaust, rain light
  bx(0.2, 0.16, 0.14, CARBON, [0, 0.34, -2.12], { name: "crash" });
  cyl(0.05, 0.045, 0.2, 8, TITAN, [0, 0.39, -2.16], { rotation: [90, 0, 0], name: "exhaust" });
  cyl(0.032, 0.032, 0.03, 8, DARK, [0, 0.39, -2.26], { rotation: [90, 0, 0], name: "exhaustMouth" });
  glow(bx(0.12, 0.06, 0.02, RED, [0, 0.31, -2.2], { name: "rainLight" }), 1.6);
  for (const s of [1, -1]) glow(bx(0.02, 0.05, 0.02, RED, [s * 0.5, 0.78, -2.64], { name: "ledLight" }), 1.4);

  // ================= WHEELS & SUSPENSION =================
  const wheel = (joint: Joint, s: number, cx: number, cy: number, cz: number, R: number, W: number, name: string) => {
    const h = W / 2;
    const r1 = R - 0.05;
    const treadWear = mottle(TYRE, "#2b2d33", { size: 0.1, contrast: 0.4, seed: 4 });
    const tyrePaint = paint((p, _n, s) => {
      const d = Math.hypot(p.y - cy, p.z - cz);
      if (Math.abs(s[0]) < h - 0.05) {
        const a = Math.abs(Math.abs(s[0]) - h * 0.45);
        return a < 0.004 || Math.abs(s[0]) < 0.003 ? DARK : treadWear;
      }
      if (d > R * 0.8 && d < R * 0.84) return "#33353c";
      if (d > R * 0.52 && d < R * 0.55) return "#33353c";
      return TYRE;
    });
    b.lathe(
      [
        [0, -h],
        [r1, -h],
        [R, -h + 0.05],
        [R, h - 0.05],
        [r1, h],
        [0, h],
      ],
      { at: [cx, cy, cz], axis: [s, 0, 0], segments: 10, bone: joint, color: tyrePaint, name: `tyre${name}` },
    );
    // compound ring (outer sidewall)
    b.lathe(
      [
        [R * 0.69, h],
        [R * 0.78, h],
        [R * 0.78, h + 0.004],
        [R * 0.69, h + 0.004],
      ],
      { at: [cx, cy, cz], axis: [s, 0, 0], segments: 10, bone: joint, color: YELLOW, name: `ring${name}` },
    );
    // rim cover
    b.lathe(
      [
        [0, h + 0.03],
        [0.07, h + 0.03],
        [0.1, h + 0.012],
        [0.17, h + 0.012],
        [0.19, h - 0.006],
        [0, h - 0.006],
      ],
      { at: [cx, cy, cz], axis: [s, 0, 0], segments: 10, bone: joint, color: CARBON, name: `rim${name}` },
    );
    b.lathe(
      [
        [0.145, h + 0.012],
        [0.18, h + 0.012],
        [0.18, h + 0.018],
        [0.145, h + 0.018],
      ],
      { at: [cx, cy, cz], axis: [s, 0, 0], segments: 10, bone: joint, color: ORANGE, name: `rimRing${name}` },
    );
    b.part(new THREE.CylinderGeometry(0.04, 0.04, 0.025, 6), SILVER, {
      bone: joint,
      at: [cx + s * (h + 0.038), cy, cz],
      dir: [s, 0, 0],
      flat: true,
      name: `nut${name}`,
    });
    b.ring(frame([cx + s * (h + 0.016), cy, cz], [s, 0, 0]), { count: 5, radius: 0.115 }, (it) =>
      b.part(new THREE.BoxGeometry(0.04, 0.07, 0.012), DARK, { frame: it, bone: joint, flat: true, name: `vent${name}` }),
    );
    b.part(new THREE.PlaneGeometry(0.17, 0.045), "#111111", {
      bone: joint,
      at: [cx + s * (h + 0.007), cy + R * 0.735, cz],
      dir: [s, 0, 0],
      axis: "z",
      texture: tyreTex,
      name: `tyreText${name}`,
    });
  };
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    wheel(wheelJ[`F${side}`], s, s * FR.x, FY, FR.z, FR.R, FR.W, `F${side}`);
    wheel(wheelJ[`R${side}`], s, s * RR.x, RY, RR.z, RR.R, RR.W, `R${side}`);

    // front uprights & brake ducts ride the steering joint
    const sj = steer[side];
    b.part(new THREE.BoxGeometry(0.07, 0.28, 0.14), CARBON, { bone: sj, at: [s * 0.57, FY, FR.z], flat: true, name: `upright${side}` });
    b.part(new THREE.BoxGeometry(0.09, 0.12, 0.18), ORANGE, { bone: sj, at: [s * 0.52, FY - 0.02, FR.z], flat: true, name: `duct${side}` });
    b.part(new THREE.BoxGeometry(0.075, 0.13, 0.015), DARK, { bone: sj, at: [s * 0.52, FY - 0.02, FR.z + 0.092], flat: true, name: `ductMouth${side}` });
    // front arms
    const up = [s * 0.56, 0.4, FR.z] as V3;
    const lo = [s * 0.56, 0.22, FR.z] as V3;
    rod([s * 0.13, 0.35, 1.58], up, 0.013, CARBON, { name: "fUpperArm" });
    rod([s * 0.13, 0.35, 1.92], up, 0.013, CARBON, { name: "fUpperArm" });
    rod([s * 0.14, 0.2, 1.52], lo, 0.014, CARBON, { name: "fLowerArm" });
    rod([s * 0.14, 0.2, 1.98], lo, 0.014, CARBON, { name: "fLowerArm" });
    rod(up, [s * 0.13, 0.44, 1.66], 0.011, TITAN, { name: "pushrod", sides: 5 });
    rod([s * 0.14, 0.3, 1.62], [s * 0.56, 0.3, 1.8], 0.009, ORANGE, { name: "tieRod", sides: 4 });
    // rear
    const rup = [s * 0.58, 0.5, RR.z] as V3;
    const rlo = [s * 0.58, 0.2, RR.z] as V3;
    b.part(new THREE.BoxGeometry(0.08, 0.34, 0.16), CARBON, { bone: chassis, at: [s * 0.58, RY, RR.z], flat: true, name: `rUpright${side}` });
    b.part(new THREE.BoxGeometry(0.1, 0.14, 0.22), ORANGE, { bone: chassis, at: [s * 0.54, RY + 0.02, RR.z], flat: true, name: `rDuct${side}` });
    rod([s * 0.17, 0.45, -1.5], rup, 0.014, CARBON, { name: "rUpperArm" });
    rod([s * 0.17, 0.45, -1.82], rup, 0.014, CARBON, { name: "rUpperArm" });
    rod([s * 0.17, 0.2, -1.48], rlo, 0.015, CARBON, { name: "rLowerArm" });
    rod([s * 0.17, 0.2, -1.84], rlo, 0.015, CARBON, { name: "rLowerArm" });
    rod(rup, [s * 0.15, 0.5, -1.7], 0.012, TITAN, { name: "rPushrod", sides: 5 });
    rod([s * 0.16, RY, RR.z], [s * 0.62, RY, RR.z], 0.032, SILVER, { name: "driveshaft" });
  }

  // gearbox and engine bits visible at the rear
  bx(0.34, 0.24, 0.5, DARK, [0, 0.33, -1.72], { name: "gearbox" });
  for (const x of [-0.17, 0.17]) bx(0.015, 0.2, 0.52, ORANGE, [x, 0.33, -1.72], { name: "gearboxTrim" });

  // ================= EXTRA DETAIL =================
  // gurney flaps
  bx(1.0, 0.03, 0.006, WHITE, [0, 0.832, -2.566], { name: "gurneyMid", rotation: [20, 0, 0] });
  bx(0.98, 0.028, 0.006, YELLOW, [0, 0.54, -2.478], { name: "gurneyBeam", rotation: [8, 0, 0] });
  bx(0.96, 0.03, 0.006, CARBON, [0, 0.685, -2.52], { name: "gurneyLow", rotation: [14, 0, 0] });
  // bolts on rear endplates, hub details, vanes
  {
    const bolts = bits(chassis, SILVER);
    for (const s of [1, -1]) {
      for (let i = 0; i < 5; i++) bolts.add(new THREE.BoxGeometry(0.012, 0.02, 0.02), [s * 0.538, 0.92 - (i % 2) * 0.03, -2.26 - i * 0.075]);
      for (let i = 0; i < 4; i++) bolts.add(new THREE.BoxGeometry(0.012, 0.02, 0.02), [s * 0.953, 0.33 - (i % 2) * 0.03, 2.58 + i * 0.1]);
    }
    bolts.flush("bolts");
  }
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.2, 0.06), WHITE, {
      bone: chassis,
      at: [s * 0.953, 0.2, 2.75],
      dir: [s, 0, 0],
      axis: "z",
      texture: wingTex,
      name: "fwDecal",
    });
    [0.34, 0.42].forEach((x, i) =>
      b.extrude(
        [
          [0.86, 0.46],
          [0.84, 0.54 + i * 0.01],
          [0.62, 0.53],
          [0.5, 0.46],
        ],
        { at: [s * x, 0.0, 0], thickness: 0.012, bevel: 0.003, color: i ? ORANGE : CARBON, bone: chassis, name: "vane" },
      ),
    );
    // wheel tethers
    rod([s * 0.56, 0.45, 1.72], [s * 0.16, 0.5, 1.7], 0.005, WHITE, { name: "tether", sides: 4 });
    rod([s * 0.58, 0.49, -1.62], [s * 0.17, 0.52, -1.6], 0.005, WHITE, { name: "tether", sides: 4 });
  }

  // ================= DECALS =================
  for (const s of [1, -1]) {
    const side = s > 0 ? "L" : "R";
    b.decal(pods[side], podTex, { at: [s * 0.74, 0.32, 0.45], dir: [s, 0, 0], size: [0.52, 0.14], name: `podDecal${side}` });
  }
  b.decal(hull, roundelTex, { at: [0, 0.46, 1.5], dir: [0, 1, 0], up: [0, 0, 1], size: [0.22, 0.22], name: "noseNumber" });
  for (const s of [1, -1])
    b.decal(cover, coverTex, { at: [s * 0.22, 0.5, -0.95], dir: [s, 0, 0], size: [0.5, 0.13], name: `coverDecal${s > 0 ? "L" : "R"}` });
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.2, 0.2), WHITE, {
      bone: chassis,
      at: [s * 0.0185, 0.68, -1.0],
      dir: [s, 0, 0],
      axis: "z",
      texture: roundelTex,
      name: "finNumber",
    });
  return b.root;
}
