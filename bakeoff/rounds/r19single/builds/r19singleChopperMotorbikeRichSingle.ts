// Custom chopper motorbike, Overwatch style: polished stylised sci-fi, clean bold bevelled shapes, crisp colour
// blocking (graphite + white) with ONE strong accent colour (hero orange), glowing hardlight details.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import { DEG } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { grain, mix, paint, smoothstep } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Hardlight Chopper",
  description:
    "Long-raked custom chopper in a polished Overwatch look: graphite and white panels, a single hero-orange accent, bevelled covers, ape-hanger bars, finned V-twin and glowing hardlight rims, lamps and exhaust.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type P = [number, number, number];
type Col = string | Paint;

// ---- Palette: neutral graphite/white blocks, one orange accent -------------------------------------------------
const INK = "#12161c";
const GRAPH = "#272e38";
const SLATE = "#3a4452";
const SLATE_L = "#586679";
const STEEL = "#c3ccd6";
const STEEL_D = "#808b99";
const WHITE = "#f3f6f9";
const ORANGE = "#ff8a1a";
const ORANGE_D = "#d4620a";
const ORANGE_L = "#ffb04a";
const RUBBER = "#17191e";
const RUBBER_L = "#2a2e36";
const TREAD = "#0e1013";
const SEAT = "#222831";
const SEAT_L = "#2d3440";
const GLOW_W = "#fff1d0";
const GLOW_O = "#ffa23a";

// ---- Key coordinates (metres; faces +Z, left = +X) -------------------------------------------------------------
const HEAD: P = [0, 1.12, 0.28]; // steering head
const FD: P = [0, -0.788, 0.616]; // fork axis, 38 degrees of rake
const AXF: P = [0, 0.338, 0.891]; // front axle (on the fork axis, 0.992 from the head)
const AXR: P = [0, 0.368, -0.8]; // rear axle
const PIV: P = [0, 0.45, -0.28]; // swingarm pivot
const fk = (s: number, x = 0): P => [x, 1.12 - 0.788 * s, 0.28 + 0.616 * s];
const unit = (v: P): P => {
  const l = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / l, v[1] / l, v[2] / l];
};
const add = (a: P, d: P, t: number): P => [a[0] + d[0] * t, a[1] + d[1] * t, a[2] + d[2] * t];

// ---- Textures --------------------------------------------------------------------------------------------------
const TANK_DECAL = svg(
  `<svg viewBox="0 0 200 100">
  <polygon points="0,8 70,8 104,50 70,92 0,92 34,50" fill="${WHITE}"/>
  <polygon points="44,8 56,8 90,50 56,92 44,92 78,50" fill="${INK}"/>
  <polygon points="96,8 106,8 140,50 106,92 96,92 130,50" fill="${WHITE}"/>
  <polygon points="146,8 152,8 186,50 152,92 146,92 180,50" fill="${ORANGE_D}"/>
  <rect x="110" y="44" width="90" height="4" fill="${INK}"/>
  </svg>`,
  { size: 256 },
);

const gaugeTicks = Array.from({ length: 11 }, (_, i) => {
  const a = (-215 + i * 25) * DEG;
  const x0 = 50 + Math.cos(a) * 36;
  const y0 = 50 + Math.sin(a) * 36;
  const x1 = 50 + Math.cos(a) * 44;
  const y1 = 50 + Math.sin(a) * 44;
  return `<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}" stroke="${i > 8 ? ORANGE : GLOW_W}" stroke-width="3.4" stroke-linecap="round"/>`;
}).join("");
const GAUGE = svg(
  `<svg viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="49" fill="#0b0e12"/>
  <circle cx="50" cy="50" r="46" fill="none" stroke="${ORANGE}" stroke-width="3.4"/>
  ${gaugeTicks}
  <path d="M50 50 L72 33" stroke="${ORANGE}" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="6" fill="${GLOW_W}"/>
  <rect x="38" y="68" width="24" height="9" rx="2" fill="${GLOW_O}"/>
  </svg>`,
  { size: 160 },
);

const PLATE = svg(
  `<svg viewBox="0 0 100 50">
  <rect x="1" y="1" width="98" height="48" rx="6" fill="${WHITE}" stroke="${ORANGE}" stroke-width="3"/>
  <rect x="7" y="7" width="86" height="36" rx="3" fill="none" stroke="${INK}" stroke-width="1.4"/>
  <text x="50" y="35" font-family="sans-serif" font-weight="bold" font-size="26" text-anchor="middle" fill="${INK}">CH-07</text>
  </svg>`,
  { size: 256 },
);

// ---- Paints ----------------------------------------------------------------------------------------------------
const tankPaint = paint((_p, _n, s) => {
  const a = ((s[1] % 360) + 360) % 360;
  const d = Math.min(a, 360 - a); // 0 = top, 180 = belly
  if (s[0] < 0.06 || s[0] > 0.94) return GRAPH;
  if (d < 5) return WHITE;
  if (d < 8) return INK;
  if (d > 118) return GRAPH;
  if (d > 110) return ORANGE_D;
  return mix(ORANGE, ORANGE_L, smoothstep(75, 15, d));
});

const seatPaint = paint((p, n) => {
  if (n.y < 0.4) return INK;
  const u = (p.x + p.z) / 0.07;
  const v = (p.x - p.z) / 0.07;
  const fu = Math.abs(u - Math.round(u));
  const fv = Math.abs(v - Math.round(v));
  if (Math.min(fu, fv) < 0.05) return ORANGE;
  return (Math.round(u) + Math.round(v)) % 2 === 0 ? SEAT : SEAT_L;
});

const fenderPaint = paint((p) => {
  const ax = Math.abs(p.x);
  if (ax < 0.016) return WHITE;
  if (ax > 0.124 && ax < 0.134) return INK;
  return ORANGE;
});

const frontFenderPaint = paint((p) => {
  const ax = Math.abs(p.x);
  if (ax < 0.012) return WHITE;
  if (ax > 0.058 && ax < 0.066) return INK;
  return ORANGE;
});

const guardPaint = paint((p, n) => {
  if (Math.abs(n.x) < 0.5) return GRAPH;
  if (p.y > 0.447) return ORANGE;
  if (p.y > 0.437) return INK;
  const slot = (p.z * 1000) % 60;
  if (p.y < 0.30 && slot < 6) return INK;
  return SLATE;
});

const brushed = grain(STEEL, STEEL_D, { size: 0.012, axis: "z" });
const brushedY = grain(STEEL, STEEL_D, { size: 0.012, axis: "y" });

const tirePaint = (c: P, rimR: number) =>
  paint((p, n, s) => {
    const r = Math.hypot(p.y - c[1], p.z - c[2]);
    if (Math.abs(n.x) > 0.6) {
      if (r > rimR + 0.012 && r < rimR + 0.024) return ORANGE;
      if (r > rimR + 0.044 && r < rimR + 0.05) return RUBBER_L;
      return RUBBER;
    }
    const k = Math.floor(s[1] / 11.25);
    return ((k % 2) + 2) % 2 === 0 ? RUBBER : TREAD;
  });

const rimPaint = (c: P) =>
  paint((p, n) => {
    const r = Math.hypot(p.y - c[1], p.z - c[2]);
    if (Math.abs(n.x) > 0.6) {
      if (r > 0.226 && r < 0.244) return ORANGE;
      return r < 0.22 ? STEEL_D : STEEL;
    }
    return STEEL;
  });

const discPaint = (c: P) =>
  paint((p, n) => {
    if (Math.abs(n.x) < 0.5) return STEEL_D;
    const dy = p.y - c[1];
    const dz = p.z - c[2];
    const r = Math.hypot(dy, dz);
    const a = Math.atan2(dz, dy) / (20 * DEG);
    const lat = (a - Math.round(a)) * 20 * DEG * r;
    if (Math.hypot(lat, r - 0.118) < 0.011) return INK;
    return r > 0.14 ? STEEL : STEEL_D;
  });

// ---- Outline helpers -------------------------------------------------------------------------------------------
const ngon = (cz: number, cy: number, r: number, n: number, rot = 0): OutlinePoint[] =>
  Array.from({ length: n }, (_, k) => {
    const a = rot + (k / n) * Math.PI * 2;
    return [cz + Math.cos(a) * r, cy + Math.sin(a) * r] as OutlinePoint;
  });

const finned = (): OutlinePoint[] => {
  const pts: OutlinePoint[] = [
    [0, 0],
    [0.075, 0],
  ];
  let y = 0;
  for (let i = 0; i < 7; i++) {
    pts.push([0.075, y + 0.006], [0.097, y + 0.012], [0.097, y + 0.021], [0.075, y + 0.027]);
    y += 0.03;
  }
  pts.push([0.075, y], [0, y]);
  return pts;
};

const boot = (len: number, r: number): OutlinePoint[] => {
  const pts: OutlinePoint[] = [[0, 0]];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const y0 = (len * i) / n;
    pts.push([r * 0.8, y0 + 0.002], [r * 1.25, y0 + len / n / 2]);
  }
  pts.push([r * 0.8, len], [0, len]);
  return pts;
};

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // ---- Skeleton ------------------------------------------------------------------------------------------------
  const frame = b.joint("frame", { at: [0, 0.6, 0], dir: [0, 0, 1] });
  const steer = b.joint("steer", { parent: frame, at: HEAD, dir: FD, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const throttleR = b.joint("throttleR", { parent: steer, at: [-0.42, 1.243, 0.078], dir: [-0.5, -0.1, -1], role: "hinge" });
  const clutchL = b.joint("clutchL", { parent: steer, at: [0.36, 1.222, 0.14], dir: [0.5, -0.1, -1], role: "hinge" });
  const brakeR = b.joint("brakeR", { parent: steer, at: [-0.36, 1.222, 0.14], dir: [-0.5, -0.1, -1], role: "hinge" });
  const swingarm = b.joint("swingarm", { parent: frame, at: PIV, aim: AXR, role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: swingarm, at: AXR, dir: [1, 0, 0], role: "hinge" });
  const kickstand = b.joint("kickstand", { parent: frame, at: [0.24, 0.34, -0.3], aim: [0.26, 0.2, -0.62], role: "hinge" });

  // ---- Helpers -------------------------------------------------------------------------------------------------
  const rod = (a: P, c: P, r: number | [number, number], color: Col, bone: Joint, o: SweepOptions = {}) =>
    b.rod(a, c, r, color, { bone, sides: 6, ...o });
  const tube = (pts: number[][], r: SweepOptions["color"] extends never ? never : number | [number, number], color: Col, bone: Joint, o: SweepOptions = {}) =>
    b.sweep(catmull(pts), r, { color, bone, sides: 6, ...o });
  const cyl = (r0: number, r1: number, h: number, at: P, dir: P, color: Col, bone: Joint, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r0, r1, h, seg, 1), color, { at, dir, bone });
  const box = (w: number, h: number, d: number, at: P, color: Col, bone: Joint, dir?: P) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, ...(dir ? { dir } : {}) });
  const band = (at: P, dir: P, r: number, t: number, color: Col, bone: Joint) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 14), color, { at, dir, axis: "z", bone });
  const lathe = (
    prof: OutlinePoint[],
    at: P,
    axis: P,
    color: Col,
    bone: Joint,
    o: { segments?: number; smoothing?: number } = {},
  ) => b.lathe(prof, { at, axis, color, bone, segments: 12, ...o });
  const plate = (outline: OutlinePoint[], x: number, thick: number, color: Col, bone: Joint, bevel = 0.008) =>
    b.extrude(outline, { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: thick, bevel, color, bone });
  const bolts = (pts: P[], r: number, axis: "x" | "y" | "z", color: Col, bone: Joint) => {
    const gs = pts.map(([x, y, z]) => {
      const g = new THREE.CylinderGeometry(r, r, r * 0.9, 6, 1);
      if (axis === "x") g.rotateZ(Math.PI / 2);
      else if (axis === "z") g.rotateX(Math.PI / 2);
      return g.translate(x, y, z);
    });
    return b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0] });
  };

  // ---- Wheels --------------------------------------------------------------------------------------------------
  const wheel = (bone: Joint, c: P, R: number, hw: number, rimHw: number, hubHw: number) => {
    const ri = 0.235;
    const h = R - ri;
    // Tyre: faceted profile turned about the axle.
    lathe(
      [
        [ri, -hw * 0.8],
        [ri + h * 0.35, -hw],
        [R - h * 0.12, -hw * 0.75],
        [R, -hw * 0.35],
        [R, hw * 0.35],
        [R - h * 0.12, hw * 0.75],
        [ri + h * 0.35, hw],
        [ri, hw * 0.8],
      ],
      c,
      [1, 0, 0],
      tirePaint(c, ri),
      bone,
      { segments: 28 },
    );
    // Rim barrel and lip.
    lathe(
      [
        [0.2, -rimHw * 0.8],
        [0.25, -rimHw],
        [0.25, rimHw],
        [0.2, rimHw * 0.8],
      ],
      c,
      [1, 0, 0],
      rimPaint(c),
      bone,
      { segments: 24 },
    );
    // Hub, caps and bolts.
    cyl(0.05, 0.05, hubHw * 2, c, [1, 0, 0], STEEL_D, bone, 10);
    for (const sx of [1, -1]) {
      cyl(0.058, 0.058, 0.014, [sx * hubHw, c[1], c[2]], [1, 0, 0], ORANGE, bone, 10);
      cyl(0.03, 0.03, 0.03, [sx * (hubHw + 0.012), c[1], c[2]], [1, 0, 0], STEEL, bone, 8);
      glow(
        lathe(
          [
            [0.198, 0],
            [0.234, 0],
            [0.234, 0.006],
            [0.198, 0.006],
          ],
          [c[0] + sx * rimHw, c[1], c[2]],
          [sx, 0, 0],
          GLOW_O,
          bone,
          { segments: 28 },
        ),
        1.5,
      );
    }
    bolts(
      Array.from({ length: 5 }, (_, k): P => {
        const a = (k * 72 + 54) * DEG;
        return [hubHw + 0.007, c[1] + Math.cos(a) * 0.036, c[2] + Math.sin(a) * 0.036];
      }).concat(
        Array.from({ length: 5 }, (_, k): P => {
          const a = (k * 72 + 54) * DEG;
          return [-hubHw - 0.007, c[1] + Math.cos(a) * 0.036, c[2] + Math.sin(a) * 0.036];
        }),
      ),
      0.007,
      "x",
      STEEL,
      bone,
    );
    // Five cast spokes on each face, with an orange ridge.
    for (let k = 0; k < 5; k++) {
      const th = (k * 72 + 18) * DEG;
      const cy = Math.cos(th);
      const cz = Math.sin(th);
      for (const sx of [1, -1]) {
        rod(
          [sx * hubHw, c[1] + 0.045 * cy, c[2] + 0.045 * cz],
          [sx * rimHw * 0.6, c[1] + 0.225 * cy, c[2] + 0.225 * cz],
          [0.03, 0.02],
          SLATE_L,
          bone,
          { sides: 5 },
        );
        rod(
          [sx * (hubHw + 0.012), c[1] + 0.06 * cy, c[2] + 0.06 * cz],
          [sx * (rimHw * 0.6 + 0.01), c[1] + 0.2 * cy, c[2] + 0.2 * cz],
          [0.011, 0.007],
          ORANGE,
          bone,
          { sides: 4 },
        );
      }
    }
  };
  wheel(wheelF, AXF, 0.34, 0.12, 0.056, 0.05);
  wheel(wheelR, AXR, 0.37, 0.24, 0.09, 0.075);

  // Brake discs, rear pulley.
  lathe(
    [
      [0.06, -0.004],
      [0.15, -0.004],
      [0.15, 0.004],
      [0.06, 0.004],
    ],
    [-0.078, AXF[1], AXF[2]],
    [1, 0, 0],
    discPaint(AXF),
    wheelF,
    { segments: 28 },
  );
  lathe(
    [
      [0.06, -0.004],
      [0.15, -0.004],
      [0.15, 0.004],
      [0.06, 0.004],
    ],
    [-0.15, AXR[1], AXR[2]],
    [1, 0, 0],
    discPaint(AXR),
    wheelR,
    { segments: 28 },
  );
  lathe(
    [
      [0.03, -0.014],
      [0.1, -0.014],
      [0.1, 0.014],
      [0.03, 0.014],
    ],
    [0.15, AXR[1], AXR[2]],
    [1, 0, 0],
    STEEL_D,
    wheelR,
    { segments: 20 },
  );
  rod([-0.205, AXR[1], AXR[2]], [0.205, AXR[1], AXR[2]], 0.02, STEEL, wheelR, { sides: 8 });

  // ---- Frame ---------------------------------------------------------------------------------------------------
  tube([[0, 1.05, 0.22], [0, 0.94, 0.02], [0, 0.76, -0.12], [0, 0.6, -0.3], [0, 0.57, -0.5]], 0.027, GRAPH, frame, { sides: 8 });
  for (const s of [1, -1]) {
    tube(
      [
        [s * 0.03, 1.05, 0.23],
        [s * 0.12, 0.85, 0.2],
        [s * 0.15, 0.6, 0.16],
        [s * 0.14, 0.36, 0.06],
        [s * 0.13, 0.32, -0.22],
        [s * 0.12, 0.42, -0.3],
        [s * 0.07, 0.58, -0.31],
      ],
      0.02,
      GRAPH,
      frame,
    );
    // Gusset plates at the head, pivot plates, crash bars.
    plate([[0.27, 1.1], [0.1, 1.0], [0.13, 0.82], [0.25, 0.97]], s * 0.032, 0.014, SLATE, frame, 0.004);
    plate(ngon(PIV[2], PIV[1], 0.075, 8, 0.4), s * 0.145, 0.022, SLATE, frame, 0.007);
    cyl(0.045, 0.045, 0.026, [s * 0.19, PIV[1], PIV[2]], [1, 0, 0], ORANGE, frame, 8);
    cyl(0.022, 0.022, 0.04, [s * 0.2, PIV[1], PIV[2]], [1, 0, 0], STEEL, frame, 8);
    tube([[s * 0.15, 0.62, 0.2], [s * 0.24, 0.56, 0.28], [s * 0.27, 0.36, 0.28], [s * 0.2, 0.3, 0.2]], 0.014, STEEL, frame, { caps: "round" });
    // Foot pegs with rubber grips.
    rod([s * 0.2, 0.3, 0.2], [s * 0.3, 0.3, 0.21], 0.017, STEEL, frame);
    rod([s * 0.26, 0.3, 0.205], [s * 0.31, 0.3, 0.21], 0.024, RUBBER, frame, { sides: 8 });
    // Swingarm arms, pivot caps, axle plates.
    b.sweep([[s * 0.16, 0.45, -0.28], [s * 0.175, 0.368, -0.8]], [0.026, 0.04], { color: SLATE, bone: swingarm, section: "box", caps: "flat" });
    box(0.03, 0.09, 0.1, [s * 0.185, 0.368, -0.79], GRAPH, swingarm);
    cyl(0.03, 0.03, 0.012, [s * 0.205, AXR[1], AXR[2]], [1, 0, 0], ORANGE, swingarm, 8);
    // Fender struts.
    rod([0, 0.58, -0.48], [s * 0.12, 0.78, -0.64], 0.012, GRAPH, frame);
  }
  rod([-0.16, 0.4, -0.52], [0.16, 0.4, -0.52], 0.02, SLATE, swingarm, { sides: 8 });
  // Head tube and ring collars.
  rod(fk(-0.07), fk(0.15), 0.042, GRAPH, frame, { sides: 8 });
  band(fk(-0.06), FD, 0.043, 0.008, ORANGE, frame);
  band(fk(0.14), FD, 0.043, 0.008, ORANGE, frame);

  // ---- Engine: crankcase, finned V-twin, covers ---------------------------------------------------------------
  b.extrude(
    [[-0.14, -0.13], [0.14, -0.13], [0.18, -0.07], [0.18, 0.09], [0.14, 0.13], [-0.14, 0.13], [-0.18, 0.09], [-0.18, -0.07]],
    { at: [0, 0.45, 0.03], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.23, bevel: 0.02, color: SLATE, bone: frame },
  );
  box(0.2, 0.05, 0.3, [0, 0.31, 0.03], GRAPH, frame);
  const fb: P = [0, 0.55, 0.1];
  const fd = unit([0, 0.92, 0.39]);
  const rb: P = [0, 0.55, -0.05];
  const rd = unit([0, 0.92, -0.39]);
  for (const [base, dir, sgn] of [[fb, fd, 1], [rb, rd, -1]] as Array<[P, P, number]>) {
    lathe(finned(), base, dir, brushedY, frame, { segments: 10 });
    box(0.17, 0.07, 0.14, add(base, dir, 0.24), SLATE, frame, dir);
    box(0.15, 0.04, 0.115, add(base, dir, 0.285), ORANGE, frame, dir);
    box(0.17, 0.012, 0.13, add(base, dir, 0.268), INK, frame, dir);
    bolts(
      [-0.06, -0.02, 0.02, 0.06].map((x): P => add([x, add(base, dir, 0.3)[1], add(base, dir, 0.3)[2]], dir, 0.002)),
      0.008,
      "y",
      STEEL,
      frame,
    );
    // Spark plug lead and coil.
    rod(add([0.07, base[1], base[2]], dir, 0.27), add([0.12, 0.8, base[2] + sgn * 0.02], dir, 0.0), 0.006, INK, frame, { sides: 5 });
  }
  box(0.07, 0.06, 0.05, [0.12, 0.8, 0.03], GRAPH, frame);
  // Primary (left) and ignition (right) covers with hardlight cells.
  for (const sx of [1, -1]) {
    const ax: P = [sx, 0, 0];
    lathe(
      [[0, 0], [0.105, 0], [0.105, 0.012], [0, 0.02]],
      [sx * 0.115, 0.45, 0.08],
      ax,
      ORANGE,
      frame,
      { segments: 16 },
    );
    lathe(
      [[0, 0.014], [0.075, 0.016], [0.07, 0.032], [0.03, 0.04], [0, 0.04]],
      [sx * 0.115, 0.45, 0.08],
      ax,
      SLATE,
      frame,
      { segments: 16 },
    );
    glow(
      lathe([[0, 0.038], [0.028, 0.038], [0.028, 0.046], [0, 0.046]], [sx * 0.115, 0.45, 0.08], ax, GLOW_O, frame, { segments: 12 }),
      1.5,
    );
    bolts(
      Array.from({ length: 6 }, (_, k): P => {
        const a = k * 60 * DEG;
        return [sx * 0.129, 0.45 + Math.cos(a) * 0.088, 0.08 + Math.sin(a) * 0.088];
      }),
      0.01,
      "x",
      STEEL,
      frame,
    );
  }
  // Intake manifold and air cleaner (right side).
  rod([-0.04, 0.64, 0.03], [-0.15, 0.66, 0.04], 0.03, STEEL, frame, { sides: 8 });
  lathe(
    [[0, 0], [0.1, 0], [0.105, 0.012], [0.105, 0.05], [0.09, 0.06], [0, 0.06]],
    [-0.15, 0.66, 0.04],
    [-1, 0, 0],
    paint((_p, _n, s) => (s[0] > 0.045 ? ORANGE : s[0] > 0.012 ? STEEL : STEEL_D)),
    frame,
    { segments: 16 },
  );
  band([-0.2, 0.66, 0.04], [-1, 0, 0], 0.075, 0.006, INK, frame);

  // ---- Exhaust (right): two drag pipes into one muffler with a hardlight mouth ---------------------------------
  tube([[-0.03, 0.74, 0.25], [-0.13, 0.71, 0.31], [-0.22, 0.56, 0.26], [-0.255, 0.4, 0.12], [-0.27, 0.335, -0.05], [-0.27, 0.335, -0.28]], 0.032, brushed, frame, { sides: 8 });
  tube([[-0.03, 0.74, -0.2], [-0.14, 0.71, -0.24], [-0.215, 0.58, -0.2], [-0.25, 0.42, -0.16], [-0.27, 0.335, -0.28]], 0.032, brushed, frame, { sides: 8 });
  b.sweep(
    [[-0.27, 0.335, -0.28], [-0.27, 0.34, -1.0]],
    (t) => 0.045 + 0.017 * t,
    {
      color: brushed,
      bone: frame,
      sides: 10,
      caps: "flat",
      bands: [[0.82, brushed], [0.88, ORANGE], [1, brushed]],
    },
  );
  for (const z of [-0.42, -0.62, -0.85]) {
    const t = (-0.28 - z) / 0.72;
    band([-0.27, 0.337, z], [0, 0, 1], 0.045 + 0.017 * t + 0.002, 0.006, INK, frame);
  }
  cyl(0.058, 0.058, 0.01, [-0.27, 0.34, -1.004], [0, 0, 1], INK, frame, 12);
  glow(cyl(0.03, 0.03, 0.01, [-0.27, 0.34, -1.01], [0, 0, 1], GLOW_O, frame, 10), 1.6);
  bolts([[-0.31, 0.337, -0.3], [-0.31, 0.337, -0.36]], 0.01, "x", STEEL, frame);
  for (const z of [-0.36, -0.52, -0.7]) cyl(0.017, 0.017, 0.012, [-0.27, 0.403 - 0.0 + (z + 0.36) * 0.01, z], [0, 1, 0], STEEL, frame, 6);

  // ---- Belt drive guard (left): slot outline with orange upper rail -------------------------------------------
  b.extrude(
    [[-0.15, 0.478], [-0.8, 0.47], [-0.875, 0.44], [-0.9, 0.368], [-0.875, 0.296], [-0.8, 0.266], [-0.18, 0.335], [-0.11, 0.37], [-0.105, 0.405], [-0.12, 0.445]],
    { at: [0.205, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.026, bevel: 0.007, color: guardPaint, bone: swingarm },
  );
  bolts([[0.222, 0.4, -0.16], [0.222, 0.368, -0.8], [0.222, 0.45, -0.5], [0.222, 0.3, -0.5]], 0.011, "x", STEEL, swingarm);
  cyl(0.04, 0.04, 0.012, [0.22, 0.368, -0.8], [1, 0, 0], ORANGE, swingarm, 10);

  // ---- Fuel tank, seat, tail ---------------------------------------------------------------------------------
  const tank = b.loft(
    [
      { at: [0, 1.02, 0.15], w: 0.17, h: 0.17 },
      { at: [0, 0.99, -0.02], w: 0.3, h: 0.25 },
      { at: [0, 0.91, -0.19], w: 0.27, h: 0.21 },
      { at: [0, 0.84, -0.28], w: 0.16, h: 0.12 },
    ],
    { color: tankPaint, bone: frame, sides: 12 },
  );
  cyl(0.036, 0.04, 0.02, [0, 1.118, -0.02], [0, 1, 0], STEEL, frame, 10);
  cyl(0.02, 0.02, 0.012, [0, 1.13, -0.02], [0, 1, 0], ORANGE, frame, 8);
  const skin = b.surface(tank);
  for (const s of [1, -1]) {
    const hit = skin.around([0, 0.94, -0.08]).at(s * 90, -5);
    if (hit) b.decal(skin, TANK_DECAL, { at: hit, size: [0.26, 0.13], mirror: s > 0 });
  }

  b.loft(
    [
      { at: [0, 0.68, -0.1], w: 0.17, h: 0.07 },
      { at: [0, 0.69, -0.24], w: 0.3, h: 0.1 },
      { at: [0, 0.68, -0.4], w: 0.31, h: 0.1 },
      { at: [0, 0.68, -0.5], w: 0.22, h: 0.07 },
    ],
    { color: seatPaint, bone: frame, sides: 10 },
  );
  rod([0, 0.64, -0.12], [0, 0.64, -0.5], [0.018, 0.018], GRAPH, frame);

  // Rear fender over the fat tyre, sissy bar and pad.
  const fenderFrom: P = [0, AXR[1] + 0.43 * Math.cos(25 * DEG), AXR[2] + 0.43 * Math.sin(25 * DEG)];
  b.sweep(arc(AXR, fenderFrom, [1, 0, 0], -105), [0.15, 0.011], { color: fenderPaint, bone: frame, section: "box", caps: "flat" });
  tube(
    [[0.13, 0.74, -0.66], [0.15, 0.98, -0.78], [0.1, 1.08, -0.82], [-0.1, 1.08, -0.82], [-0.15, 0.98, -0.78], [-0.13, 0.74, -0.66]],
    0.011,
    brushedY,
    frame,
    { sides: 8 },
  );
  b.extrude(
    [[-0.1, -0.05], [0.1, -0.05], [0.12, 0], [0.1, 0.05], [-0.1, 0.05], [-0.12, 0]],
    { at: [0, 0.93, -0.76], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.045, bevel: 0.016, color: seatPaint, bone: frame },
  );
  b.extrude(
    [[-0.1, -0.012], [0.1, -0.012], [0.1, 0.012], [-0.1, 0.012]],
    { at: [0, 0.955, -0.735], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.012, color: ORANGE, bone: frame },
  );
  // Plate, bracket, tail light pod, turn signals.
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { at: [0, 0.54, -1.235], dir: [0, 0.15, -1], axis: "z", texture: PLATE, bone: frame });
  rod([0, 0.62, -1.15], [0, 0.56, -1.23], 0.008, GRAPH, frame, { sides: 5 });
  rod([0, 0.52, -1.22], [0, 0.46, -1.17], 0.008, GRAPH, frame, { sides: 5 });
  const podDir = unit([0, 0.82, -0.57]);
  glow(
    lathe([[0, 0], [0.04, 0], [0.04, 0.012], [0.028, 0.022], [0, 0.026]], [0, 0.69, -1.07], podDir, GLOW_O, frame, { segments: 10 }),
    1.6,
  );
  for (const s of [1, -1]) {
    rod([s * 0.12, 0.66, -1.0], [s * 0.19, 0.6, -1.05], 0.007, INK, frame, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.024, 7, 5), GLOW_O, { at: [s * 0.2, 0.6, -1.06], bone: frame }), 1.5);
  }

  // ---- Front end: forks, trees, fender, headlamp --------------------------------------------------------------
  box(0.3, 0.032, 0.11, fk(-0.02), SLATE, steer, FD);
  box(0.12, 0.012, 0.08, fk(-0.045), ORANGE, steer, FD);
  box(0.26, 0.03, 0.1, fk(0.17), SLATE, steer, FD);
  for (const s of [1, -1]) {
    const x = s * 0.115;
    rod(fk(0.0, x), fk(0.52, x), 0.022, brushed, steer, { sides: 8 });
    lathe(boot(0.22, 0.03), fk(0.19, x), FD, RUBBER, steer, { segments: 8 });
    rod(fk(0.52, x), fk(0.992, x), 0.032, GRAPH, steer, { sides: 8 });
    cyl(0.037, 0.037, 0.02, fk(0.52, x), FD, ORANGE, steer, 10);
    cyl(0.036, 0.036, 0.012, fk(0.62, x), FD, STEEL, steer, 10);
    box(0.03, 0.06, 0.05, fk(0.99, x), SLATE, steer, FD);
    bolts([fk(-0.02, s * 0.12), fk(0.17, s * 0.1)], 0.012, "y", STEEL, steer);
    // Headlamp ears, front signals, fender stays.
    rod(fk(0.2, x), [s * 0.095, 1.0, 0.52], 0.01, GRAPH, steer, { sides: 5 });
    rod(fk(0.24, x), [s * 0.17, 0.9, 0.46], 0.007, INK, steer, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.024, 7, 5), GLOW_O, { at: [s * 0.18, 0.9, 0.47], bone: steer }), 1.5);
    rod(fk(0.9, x), [s * 0.07, 0.71, 0.99], 0.007, ORANGE_D, steer, { sides: 5 });
  }
  b.sweep(
    arc(AXF, [0, AXF[1] + 0.385 * Math.cos(65 * DEG), AXF[2] + 0.385 * Math.sin(65 * DEG)], [1, 0, 0], -100),
    [0.075, 0.009],
    { color: frontFenderPaint, bone: steer, section: "box", caps: "flat" },
  );
  // Headlamp bucket, bezel, lens, hardlight ring.
  lathe(
    [[0, 0], [0.075, 0], [0.1, 0.03], [0.105, 0.1], [0.1, 0.14], [0, 0.15]],
    [0, 1.0, 0.45],
    [0, 0, 1],
    SLATE,
    steer,
    { segments: 14 },
  );
  band([0, 1.0, 0.6], [0, 0, 1], 0.098, 0.009, STEEL, steer);
  band([0, 1.0, 0.5], [0, 0, 1], 0.104, 0.005, ORANGE, steer);
  glow(b.part(new THREE.CircleGeometry(0.09, 14), GLOW_W, { at: [0, 1.0, 0.604], dir: [0, 0, 1], axis: "z", bone: steer }), 1.4);
  glow(b.part(new THREE.TorusGeometry(0.066, 0.004, 4, 20), GLOW_O, { at: [0, 1.0, 0.608], dir: [0, 0, 1], axis: "z", bone: steer }), 1.6);

  // Front disc caliper and brake line.
  box(0.04, 0.07, 0.085, [-0.082, 0.372, 1.02], GRAPH, steer);
  box(0.036, 0.03, 0.06, [-0.1, 0.372, 1.02], ORANGE, steer);
  rod([-0.1, 0.36, 0.95], [-0.1, 0.372, 1.02], 0.012, GRAPH, steer, { sides: 5 });
  tube([[-0.36, 1.22, 0.17], [-0.23, 1.1, 0.34], [-0.16, 0.82, 0.62], [-0.15, 0.55, 0.86], [-0.095, 0.4, 1.02]], 0.007, INK, steer, { sides: 5 });
  // Rear caliper.
  box(0.04, 0.07, 0.085, [-0.15, 0.4, -0.66], GRAPH, swingarm);
  box(0.036, 0.03, 0.06, [-0.17, 0.4, -0.66], ORANGE, swingarm);

  // ---- Ape-hanger bars, grips, levers, mirrors, gauge ----------------------------------------------------------
  const gripBone = (s: number) => (s > 0 ? steer : throttleR);
  for (const s of [1, -1]) {
    tube([[s * 0.05, 1.13, 0.26], [s * 0.12, 1.22, 0.25], [s * 0.27, 1.28, 0.2], [s * 0.38, 1.25, 0.12]], 0.0125, STEEL, steer, { sides: 8 });
    rod([s * 0.06, 1.1, 0.26], [s * 0.06, 1.17, 0.26], 0.03, ORANGE, steer, { sides: 8 });
    rod([s * 0.385, 1.25, 0.115], [s * 0.465, 1.236, 0.04], 0.019, RUBBER, gripBone(s), { sides: 8 });
    cyl(0.017, 0.017, 0.012, [s * 0.47, 1.2355, 0.036], [s * 0.5, -0.1, -1], ORANGE, gripBone(s), 8);
    band([s * 0.435, 1.241, 0.073], [s * 0.5, -0.1, -1], 0.02, 0.003, INK, gripBone(s));
    const lever = s > 0 ? clutchL : brakeR;
    box(0.04, 0.034, 0.05, [s * 0.36, 1.236, 0.15], GRAPH, steer);
    rod([s * 0.36, 1.222, 0.14], [s * 0.455, 1.2, 0.02], [0.01, 0.006], STEEL, lever, { sides: 5 });
    glow(b.part(new THREE.SphereGeometry(0.012, 6, 4), GLOW_O, { at: [s * 0.4, 1.232, 0.16], bone: steer }), 1.3);
    // Mirror: stalk, housing, glass.
    rod([s * 0.34, 1.265, 0.17], [s * 0.4, 1.4, 0.19], 0.007, STEEL, steer, { sides: 5 });
    lathe([[0, 0], [0.045, 0], [0.048, 0.008], [0.044, 0.018], [0, 0.024]], [s * 0.4, 1.42, 0.19], unit([s * 0.1, 0.1, -1]), GRAPH, steer, { segments: 10 });
    b.part(new THREE.CircleGeometry(0.038, 10), STEEL, { at: [s * 0.4, 1.42, 0.168], dir: unit([s * 0.1, 0.1, -1]), axis: "z", bone: steer });
  }
  cyl(0.052, 0.052, 0.04, [0, 1.172, 0.215], [0, 0.45, -1], SLATE, steer, 12);
  glow(b.part(new THREE.PlaneGeometry(0.078, 0.078), "#ffffff", { at: [0, 1.181, 0.195], dir: [0, 0.41, -0.912], axis: "z", texture: GAUGE, bone: steer }), 1.2);
  band([0, 1.181, 0.196], [0, 0.41, -0.912], 0.042, 0.005, ORANGE, steer);

  // ---- Controls: shifter, brake pedal, kickstand ---------------------------------------------------------------
  rod([0.13, 0.36, 0.05], [0.22, 0.32, 0.17], 0.01, STEEL, frame, { sides: 5 });
  box(0.04, 0.02, 0.05, [0.23, 0.315, 0.18], RUBBER, frame);
  rod([-0.13, 0.3, -0.02], [-0.2, 0.31, 0.12], 0.01, STEEL, frame, { sides: 5 });
  box(0.07, 0.015, 0.045, [-0.2, 0.31, 0.13], RUBBER, frame);
  rod([0.24, 0.34, -0.3], [0.26, 0.2, -0.62], 0.012, STEEL, kickstand, { sides: 6 });
  box(0.05, 0.012, 0.05, [0.26, 0.196, -0.63], GRAPH, kickstand);

  return b.root;
}
