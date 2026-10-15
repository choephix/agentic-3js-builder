import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { OutlinePoint } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { DEG } from "../../../../src/math";
import { arc, catmull } from "../../../../src/path";
import { countershade, paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Vanguard Chopper",
  description:
    "A custom long-fork chopper in a polished hero-shooter look: bold white, navy and gunmetal colour blocking with one orange accent, bevelled engine plates, mag wheels, drilled rotors, and cyan light details. Steering, both wheels, levers, throttle, brake pedal and kickstand are separate hinge joints.",
  style: "Overwatch",
  commit: "88fc1f0",
};

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike", paintSize: 2048 });

  // ---------------------------------------------------------------- palette
  const CHROME = "#cdd5df";
  const STEEL = "#59636f";
  const BLACK = "#13161c";
  const RUBBER = "#1d2027";
  const ORANGE = "#ff8a1f";
  const WHITE = "#f2f5f9";
  const GLASS = "#e6fcff";
  const CYAN = "#6ff0ff";
  const TAIL = "#ff4a2a";
  const MIRROR = "#9fd4e6";
  const NAVY = "#1f2636";

  const shade = (top: string, bottom: string) => countershade(top, bottom, { level: 0, soft: 0.7 });
  const PW = shade("#f6f8fc", "#a8b4c7");
  const PN = shade("#3a4660", "#161c2b");
  const PO = shade("#ffa23c", "#cf540c");
  const PG = shade("#6c7787", "#2f3642");
  const PCH = paint((_p, n) =>
    n.y > 0.55 ? "#fbfdff" : n.y > 0.05 ? "#d3dce7" : n.y > -0.45 ? "#8d9aad" : "#4b5567",
  );
  const tankPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (ax < 0.022) return PO;
    if (ax < 0.03) return PN;
    if (n.y < -0.25) return PN;
    if (n.y < -0.12) return PO;
    return PW;
  });
  const fenderPaint = paint((p) => {
    const ax = Math.abs(p.x);
    return ax < 0.02 ? PO : ax < 0.027 ? PW : PN;
  });
  const seatPaint = paint((_p, n) => (n.y > 0.5 ? "#353b4e" : "#1c202b"));

  // ---------------------------------------------------------------- drawings
  const poly = (pts: number[][]) => pts.map((p) => p.map((v) => v.toFixed(1)).join(",")).join(" ");
  const circ = (cx: number, cy: number, r: number) =>
    `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`;

  let spokes = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 + 0.3;
    const rot = (r: number, w: number) => [50 + r * Math.cos(a) - w * Math.sin(a), 50 + r * Math.sin(a) + w * Math.cos(a)];
    spokes += `<polygon points="${poly([rot(10, -6), rot(43, -12), rot(43, 12), rot(10, 6)])}" fill="#eef2f7" stroke="#ff8a1f" stroke-width="1.6" stroke-linejoin="round"/>`;
    spokes += `<polygon points="${poly([rot(16, -1.6), rot(38, -4.5), rot(38, 4.5), rot(16, 1.6)])}" fill="#2b3342"/>`;
  }
  const MAG = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="none" stroke="#cdd5df" stroke-width="8"/>${spokes}<circle cx="50" cy="50" r="13" fill="#2b3342" stroke="#ff8a1f" stroke-width="2.5"/><circle cx="50" cy="50" r="5" fill="#ff8a1f"/></svg>`,
    { size: 256 },
  );

  let holes = "";
  for (let i = 0; i < 14; i++) {
    const a = (i * 2 * Math.PI) / 14;
    holes += circ(50 + 38.5 * Math.cos(a), 50 + 38.5 * Math.sin(a), 2.8);
  }
  const ROTOR = svg(
    `<svg viewBox="0 0 100 100"><path fill-rule="evenodd" fill="#9aa6b6" d="${circ(50, 50, 49)}${circ(50, 50, 28)}${holes}"/></svg>`,
    { size: 256 },
  );

  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = (135 + i * 27) * DEG;
    const c = Math.cos(a);
    const s = Math.sin(a);
    ticks += `<line x1="${50 + 34 * c}" y1="${50 + 34 * s}" x2="${50 + 42 * c}" y2="${50 + 42 * s}" stroke="${i >= 8 ? "#ff8a1f" : "#e6fcff"}" stroke-width="2.6" stroke-linecap="round"/>`;
  }
  const na = (135 + 6 * 27) * DEG;
  const DIAL = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49" fill="#0e131d"/><circle cx="50" cy="50" r="46" fill="none" stroke="#6ff0ff" stroke-width="3"/>${ticks}<line x1="50" y1="50" x2="${50 + 30 * Math.cos(na)}" y2="${50 + 30 * Math.sin(na)}" stroke="#ff8a1f" stroke-width="3.4" stroke-linecap="round"/><circle cx="50" cy="50" r="5" fill="#cdd5df"/><text x="50" y="76" font-size="10" text-anchor="middle" fill="#6ff0ff" font-family="sans-serif" font-weight="bold">KM/H</text></svg>`,
    { size: 256 },
  );

  const PLATE = svg(
    `<svg viewBox="0 0 160 90"><rect x="2" y="2" width="156" height="86" rx="10" fill="#eef2f6" stroke="#1f2636" stroke-width="4"/><rect x="2" y="2" width="156" height="20" rx="10" fill="#ff8a1f"/><rect x="2" y="12" width="156" height="10" fill="#ff8a1f"/><text x="80" y="68" font-size="34" text-anchor="middle" fill="#1f2636" font-family="sans-serif" font-weight="bold">VGD-76</text></svg>`,
    { size: 256 },
  );

  const TANKDECAL = svg(
    `<svg viewBox="0 0 200 90">
      <polygon points="0,70 50,10 62,10 12,70" fill="#ff8a1f"/>
      <polygon points="22,70 72,10 84,10 34,70" fill="#ff8a1f"/>
      <polygon points="44,70 94,10 106,10 56,70" fill="#1f2636"/>
      <polygon points="66,70 116,10 122,10 72,70" fill="#1f2636"/>
      <polygon points="192,45 176,72.7 144,72.7 128,45 144,17.3 176,17.3" fill="#1f2636" stroke="#ff8a1f" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="163,26 148,50 158,50 153,66 172,40 161,40" fill="#f2f5f9"/>
    </svg>`,
    { size: 512 },
  );

  // ---------------------------------------------------------------- geometry constants
  const RAKE = 34 * DEG;
  const SC = Math.cos(RAKE);
  const SS = Math.sin(RAKE);
  const H = [0, 0.98, 0.55];
  const D = [0, -SC, SS];
  // a point d metres down the steering axis, x across, f forward of it (perpendicular, forward-up)
  const steerPt = (d: number, x = 0, f = 0) => [x, H[1] - SC * d + SS * f, H[2] + SS * d + SC * f];
  const AXF = steerPt(0.808);
  const AXR = [0, 0.338, -0.95];

  // ---------------------------------------------------------------- skeleton
  const frame = b.joint("frame", { at: [0, 0.6, 0] });
  const steer = b.joint("steer", { parent: frame, at: H, dir: D, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frame, at: AXR, dir: [1, 0, 0], role: "hinge" });
  const kick = b.joint("kickstand", { parent: frame, at: [0.19, 0.27, -0.3], aim: [0.3, 0.09, -0.4], role: "hinge" });
  const throttle = b.joint("throttleR", {
    parent: steer,
    at: [-0.465, 1.272, 0.24],
    aim: [-0.47, 1.285, 0.12],
    role: "hinge",
  });
  const clutch = b.joint("clutchL", { parent: steer, at: [0.455, 1.245, 0.29], aim: [0.4, 1.24, 0.42], role: "hinge" });
  const brakeLever = b.joint("brakeLeverR", {
    parent: steer,
    at: [-0.455, 1.245, 0.29],
    aim: [-0.4, 1.24, 0.42],
    role: "hinge",
  });
  const pedal = b.joint("brakePedal", { parent: frame, at: [-0.15, 0.37, 0.36], aim: [-0.27, 0.33, 0.62], role: "hinge" });

  // ---------------------------------------------------------------- helpers
  const bolts = (pts: number[][], r: number, color: string, bone: Joint) => {
    if (!pts.length) return;
    const geos = pts.map((p) => new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2]));
    b.part(mergeGeometries(geos)!, color, { bone, at: [0, 0, 0] });
  };
  const ringX = (c: number[], x: number, r: number, n: number, ph = 0) =>
    Array.from({ length: n }, (_, i) => {
      const a = ph + (i * 2 * Math.PI) / n;
      return [x, c[1] + r * Math.cos(a), c[2] + r * Math.sin(a)];
    });
  const tube = (pts: number[][], r: number | ((t: number) => number), color: Fill, bone: Joint) =>
    b.sweep(catmull(pts), r, color, { bone, sides: 8 });
  const fender = (bone: Joint, c: number[], R: number, a0: number, deg: number, rx: number) => {
    const from = [c[0], c[1] + R * Math.cos(a0 * DEG), c[2] + R * Math.sin(a0 * DEG)];
    return b.sweep(
      arc(c, from, [1, 0, 0], deg),
      (t: number): [number, number] => [rx * (0.84 + 0.16 * Math.sin(Math.PI * t)), 0.012],
      fenderPaint,
      { bone, sides: 10 },
    );
  };

  const wheel = (bone: Joint, c: number[], R: number, W: number, hubHalf: number) => {
    const tread = paint((p, _n, s) => {
      const rr = Math.hypot(p.y - c[1], p.z - c[2]);
      if (Math.abs(s[0]) > W * 0.36) {
        if (Math.abs(rr - R * 0.8) < 0.004) return ORANGE;
        if (Math.abs(rr - R * 0.74) < 0.0025) return "#e9eef4";
        return "#262a34";
      }
      return ((s[1] % 18) + 18) % 18 < 9 && Math.abs(s[0]) < W * 0.32 ? "#0f1116" : "#222630";
    });
    b.lathe(
      [
        [R * 0.62, -W * 0.42],
        [R * 0.86, -W * 0.5],
        [R * 0.97, -W * 0.34],
        [R, -W * 0.12],
        [R, W * 0.12],
        [R * 0.97, W * 0.34],
        [R * 0.86, W * 0.5],
        [R * 0.62, W * 0.42],
      ],
      { at: c, axis: [1, 0, 0], segments: 24, color: tread, bone },
    );
    b.lathe(
      [
        [R * 0.58, -W * 0.47],
        [R * 0.66, -W * 0.48],
        [R * 0.7, -W * 0.42],
        [R * 0.7, W * 0.42],
        [R * 0.66, W * 0.48],
        [R * 0.58, W * 0.47],
      ],
      { at: c, axis: [1, 0, 0], segments: 24, color: PCH, bone },
    );
    b.lathe(
      [
        [0, -hubHalf],
        [0.04, -hubHalf],
        [0.055, -hubHalf * 0.7],
        [0.055, hubHalf * 0.7],
        [0.04, hubHalf],
        [0, hubHalf],
      ],
      { at: c, axis: [1, 0, 0], segments: 12, color: PCH, bone },
    );
    const lipBolts: number[][] = [];
    for (const s of [1, -1]) {
      b.part(new THREE.CircleGeometry(R * 0.58, 28), "#ffffff", {
        at: [s * W * 0.4, c[1], c[2]],
        dir: [s, 0, 0],
        axis: "z",
        texture: MAG,
        bone,
      });
      glow(
        b.part(new THREE.TorusGeometry(R * 0.585, 0.004, 5, 28), CYAN, {
          at: [s * W * 0.42, c[1], c[2]],
          dir: [s, 0, 0],
          axis: "z",
          bone,
        }),
        1.2,
      );
      lipBolts.push(...ringX(c, s * W * 0.485, R * 0.64, 12, s * 0.2));
    }
    bolts(lipBolts, 0.0065, CHROME, bone);
  };

  const rotor = (bone: Joint, c: number[], x: number, rad: number) => {
    const sg = Math.sign(x);
    b.lathe(
      [
        [rad * 0.5, 0],
        [rad, 0],
        [rad, 0.006],
        [rad * 0.5, 0.006],
      ],
      { at: [x, c[1], c[2]], axis: [sg, 0, 0], segments: 20, color: STEEL, bone },
    );
    b.part(new THREE.CircleGeometry(rad, 24), "#ffffff", {
      at: [x + sg * 0.0072, c[1], c[2]],
      dir: [sg, 0, 0],
      axis: "z",
      texture: ROTOR,
      bone,
    });
  };

  // ---------------------------------------------------------------- wheels
  wheel(wheelF, AXF, 0.31, 0.125, 0.105);
  wheel(wheelR, AXR, 0.34, 0.21, 0.14);
  rotor(wheelF, AXF, 0.09, 0.17);
  rotor(wheelR, AXR, -0.13, 0.19);
  // rear axle and caps
  b.rod([-0.2, AXR[1], AXR[2]], [0.2, AXR[1], AXR[2]], 0.02, STEEL, { bone: wheelR, sides: 8 });
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0, 0],
        [0.036, 0],
        [0.03, 0.012],
        [0.012, 0.018],
        [0, 0.018],
      ],
      { at: [s * 0.2, AXR[1], AXR[2]], axis: [s, 0, 0], segments: 10, color: ORANGE, bone: frame },
    );
    b.extrude(
      [
        [-0.99, 0.29],
        [-0.91, 0.29],
        [-0.88, 0.36],
        [-0.91, 0.52],
        [-0.99, 0.52],
        [-1.01, 0.36],
      ],
      { at: [s * 0.195, 0, 0], x: [0, 0, 1], thickness: 0.012, bevel: 0.003, color: PG, bone: frame },
    );
  }
  // rear belt pulley and belt (left side)
  b.lathe(
    [
      [0.03, 0],
      [0.115, 0],
      [0.12, 0.008],
      [0.12, 0.026],
      [0.115, 0.034],
      [0.03, 0.034],
    ],
    { at: [0.12, AXR[1], AXR[2]], axis: [1, 0, 0], segments: 20, color: STEEL, bone: wheelR },
  );
  bolts(ringX(AXR, 0.155, 0.085, 6), 0.007, CHROME, wheelR);

  // ---------------------------------------------------------------- frame tubes
  const BACKBONE = [
    [0, 0.98, 0.53],
    [0, 0.92, 0.2],
    [0, 0.82, -0.25],
    [0, 0.76, -0.7],
  ];
  tube(BACKBONE, 0.032, PN, frame);
  tube([steerPt(0.08), [0, 0.65, 0.42], [0, 0.4, 0.24]], 0.03, PN, frame);
  b.rod(steerPt(-0.05), steerPt(0.09), 0.052, PW, {
    bone: frame,
    sides: 10,
    bands: [
      [0.14, PO],
      [0.86, PW],
      [1, PO],
    ],
  });
  for (const s of [1, -1]) {
    tube(
      [
        [s * 0.09, 0.42, 0.25],
        [s * 0.12, 0.27, 0.12],
        [s * 0.19, 0.26, 0.0],
        [s * 0.19, 0.28, -0.5],
        [s * 0.19, 0.34, -0.95],
      ],
      0.022,
      PN,
      frame,
    );
    tube(
      [
        [0, 0.76, -0.7],
        [s * 0.12, 0.72, -0.72],
        [s * 0.2, 0.6, -0.82],
        [s * 0.19, 0.45, -0.92],
        [s * 0.19, 0.34, -0.95],
      ],
      0.02,
      PN,
      frame,
    );
    // fender struts
    b.rod([s * 0.12, 0.72, -0.72], [s * 0.1, 0.62, -0.672], 0.01, STEEL, { bone: frame, sides: 6 });
    // engine mount plates with bevels
    b.extrude(
      [
        [-0.2, 0.3],
        [-0.12, 0.25],
        [0.14, 0.25],
        [0.23, 0.31],
        [0.24, 0.42],
        [0.17, 0.54],
        [-0.1, 0.54],
        [-0.2, 0.44],
      ],
      { at: [s * 0.125, 0, 0], x: [0, 0, 1], thickness: 0.012, bevel: 0.003, color: PG, bone: frame },
    );
    // forward controls
    b.rod([s * 0.09, 0.42, 0.26], [s * 0.14, 0.36, 0.46], 0.014, PN, { bone: frame, sides: 6 });
    b.rod([s * 0.14, 0.36, 0.46], [s * 0.34, 0.36, 0.46], 0.02, STEEL, { bone: frame, sides: 8 });
    b.rod([s * 0.3, 0.36, 0.46], [s * 0.36, 0.36, 0.46], 0.026, RUBBER, { bone: frame, sides: 8 });
  }
  // underglow strips
  for (const s of [1, -1])
    glow(b.rod([s * 0.15, 0.228, 0.12], [s * 0.15, 0.228, -0.6], 0.008, CYAN, { bone: frame, sides: 5 }), 1.3);

  // ---------------------------------------------------------------- engine
  b.extrude(
    [
      [-0.16, 0.3],
      [-0.1, 0.27],
      [0.12, 0.27],
      [0.2, 0.32],
      [0.21, 0.42],
      [0.14, 0.5],
      [-0.08, 0.5],
      [-0.16, 0.42],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: 0.22, bevel: 0.02, color: PG, bone: frame },
  );
  const B1 = [0, 0.44, 0.02];
  for (const k of [1, -1]) {
    const d = [0, Math.cos(38 * DEG), k * Math.sin(38 * DEG)];
    const fins: OutlinePoint[] = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const a = 0.02 + i * 0.033;
      fins.push([0.072, a], [0.1, a + 0.006], [0.1, a + 0.016], [0.072, a + 0.022]);
    }
    fins.push([0.072, 0.225], [0, 0.225]);
    b.lathe(fins, { at: B1, axis: d, segments: 12, color: PG, bone: frame });
    const headAt = B1.map((v, i) => v + d[i] * 0.225);
    b.lathe(
      [
        [0, 0],
        [0.085, 0],
        [0.105, 0.02],
        [0.105, 0.06],
        [0.09, 0.08],
        [0, 0.085],
      ],
      { at: headAt, axis: d, segments: 12, color: PG, bone: frame },
    );
    const capAt = B1.map((v, i) => v + d[i] * 0.3);
    b.lathe(
      [
        [0, 0],
        [0.09, 0],
        [0.085, 0.02],
        [0.06, 0.035],
        [0, 0.04],
      ],
      { at: capAt, axis: d, segments: 12, color: PO, bone: frame },
    );
    // pushrod tubes
    for (const s of [1, -1]) {
      const p0 = [s * 0.075, B1[1] + d[1] * 0.04, B1[2] + d[2] * 0.04];
      const p1 = [s * 0.075, B1[1] + d[1] * 0.25, B1[2] + d[2] * 0.25];
      b.rod(p0, p1, 0.009, CHROME, { bone: frame, sides: 6 });
    }
  }
  // right primary cover
  b.lathe(
    [
      [0, 0],
      [0.125, 0],
      [0.13, 0.012],
      [0.13, 0.03],
      [0.11, 0.045],
      [0, 0.05],
    ],
    { at: [-0.13, 0.385, 0.0], axis: [-1, 0, 0], segments: 20, color: PCH, bone: frame },
  );
  b.lathe(
    [
      [0, 0],
      [0.05, 0],
      [0.05, 0.01],
      [0.04, 0.02],
      [0, 0.022],
    ],
    { at: [-0.18, 0.385, 0.0], axis: [-1, 0, 0], segments: 12, color: ORANGE, bone: frame },
  );
  bolts(ringX([0, 0.385, 0.0], -0.163, 0.105, 8), 0.007, STEEL, frame);
  // left gear cover and front pulley
  b.lathe(
    [
      [0, 0],
      [0.09, 0],
      [0.095, 0.01],
      [0.095, 0.022],
      [0, 0.03],
    ],
    { at: [0.13, 0.36, -0.1], axis: [1, 0, 0], segments: 16, color: PG, bone: frame },
  );
  b.lathe(
    [
      [0, 0],
      [0.058, 0],
      [0.062, 0.004],
      [0.062, 0.028],
      [0.058, 0.032],
      [0, 0.032],
    ],
    { at: [0.12, 0.36, -0.1], axis: [1, 0, 0], segments: 14, color: STEEL, bone: frame },
  );
  // drive belt
  for (const [y0, y1] of [
    [0.42, 0.453],
    [0.3, 0.223],
  ])
    b.sweep(
      [
        [0.137, y0, -0.1],
        [0.137, y1, -0.95],
      ],
      (): [number, number] => [0.016, 0.004],
      RUBBER,
      { bone: frame, section: "box", caps: "flat" },
    );
  // air cleaner and intake
  b.lathe(
    [
      [0, 0],
      [0.1, 0],
      [0.105, 0.01],
      [0.105, 0.05],
      [0.09, 0.065],
      [0, 0.07],
    ],
    { at: [0.1, 0.62, 0.02], axis: [1, 0, 0], segments: 18, color: PO, bone: frame },
  );
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.026, 0.014],
      [0, 0.018],
    ],
    { at: [0.17, 0.62, 0.02], axis: [1, 0, 0], segments: 10, color: PCH, bone: frame },
  );
  b.rod([0.11, 0.62, 0.02], [0.04, 0.64, 0.16], 0.028, PCH, { bone: frame, sides: 8 });
  b.rod([0.11, 0.62, 0.02], [0.04, 0.64, -0.12], 0.028, PCH, { bone: frame, sides: 8 });

  // exhaust pipes (right side)
  const pipeR = (t: number) => 0.032 + (t > 0.86 ? (0.02 * (t - 0.86)) / 0.14 : 0);
  const pipeEnd = (path: ReturnType<typeof catmull>) => {
    const e = path.at(1);
    const T = path.tangentAt(1, true);
    b.part(new THREE.CylinderGeometry(0.044, 0.044, 0.01, 10), BLACK, {
      at: e.clone().addScaledVector(T, 0.002),
      dir: T,
      bone: frame,
    });
  };
  const frontPipe = catmull([
    [-0.01, 0.625, 0.255],
    [-0.13, 0.585, 0.3],
    [-0.23, 0.48, 0.25],
    [-0.26, 0.38, 0.1],
    [-0.27, 0.36, -0.2],
    [-0.27, 0.36, -0.6],
    [-0.27, 0.37, -1.12],
  ]);
  b.sweep(frontPipe, pipeR, PCH, {
    bone: frame,
    sides: 10,
    bands: [
      [0.9, PCH],
      [1, "#5d6b86"],
    ],
  });
  pipeEnd(frontPipe);
  b.sweep(frontPipe, 0.046, PN, { bone: frame, sides: 10, from: 0.38, to: 0.8, caps: "flat" });
  for (const t of [0.38, 0.5, 0.62, 0.73, 0.8]) {
    const p = frontPipe.at(t);
    const T = frontPipe.tangentAt(t);
    b.rod(p.clone().addScaledVector(T, -0.006), p.clone().addScaledVector(T, 0.006), 0.05, ORANGE, {
      bone: frame,
      sides: 10,
    });
  }
  const rearPipe = catmull([
    [-0.01, 0.6, -0.22],
    [-0.13, 0.53, -0.26],
    [-0.2, 0.38, -0.26],
    [-0.23, 0.25, -0.38],
    [-0.24, 0.22, -0.7],
    [-0.24, 0.22, -1.06],
  ]);
  b.sweep(rearPipe, pipeR, PCH, {
    bone: frame,
    sides: 10,
    bands: [
      [0.9, PCH],
      [1, "#5d6b86"],
    ],
  });
  pipeEnd(rearPipe);
  for (const t of [0.35, 0.6]) {
    const p = rearPipe.at(t);
    const T = rearPipe.tangentAt(t);
    b.rod(p.clone().addScaledVector(T, -0.006), p.clone().addScaledVector(T, 0.006), 0.042, ORANGE, {
      bone: frame,
      sides: 10,
    });
  }

  // oil tank (right), battery cell (left), hoses
  b.capsule([-0.17, 0.6, -0.36], [-0.17, 0.6, -0.6], 0.06, PO, { bone: frame, sides: 10 });
  b.lathe(
    [
      [0, 0],
      [0.03, 0],
      [0.03, 0.016],
      [0.02, 0.026],
      [0, 0.028],
    ],
    { at: [-0.17, 0.655, -0.42], axis: [0, 1, 0], segments: 10, color: PCH, bone: frame },
  );
  b.part(new THREE.BoxGeometry(0.1, 0.12, 0.18), PN, { at: [0.17, 0.58, -0.45], bone: frame });
  b.rod([0.17, 0.5, -0.45], [0.17, 0.66, -0.45], 0.0, ORANGE, { bone: frame });
  glow(b.part(new THREE.BoxGeometry(0.104, 0.016, 0.1), CYAN, { at: [0.17, 0.6, -0.45], bone: frame }), 1.3);
  tube(
    [
      [-0.17, 0.57, -0.38],
      [-0.15, 0.5, -0.24],
      [-0.12, 0.42, -0.1],
    ],
    0.008,
    RUBBER,
    frame,
  );

  // ---------------------------------------------------------------- tank
  const tankPath = catmull([
    [0, 1.0, 0.4],
    [0, 1.025, 0.18],
    [0, 0.995, -0.1],
    [0, 0.95, -0.32],
  ]);
  const tankRx = (t: number) => 0.045 + 0.115 * Math.sin(Math.PI * Math.pow(t, 0.7));
  const tank = b.sweep(tankPath, (t: number): [number, number] => [tankRx(t), tankRx(t) * 0.78], tankPaint, {
    bone: frame,
    sides: 12,
  });
  for (const t of [0.42, 0.68]) {
    const c = tankPath.at(t);
    const rx = tankRx(t) + 0.006;
    const ry = tankRx(t) * 0.78 + 0.006;
    const ringPts = Array.from({ length: 12 }, (_, i) => {
      const a = (i * Math.PI) / 6;
      return [rx * Math.cos(a), c.y + ry * Math.sin(a), c.z];
    });
    b.sweep(catmull(ringPts, { closed: true }), 0.007, CHROME, { bone: frame, sides: 6 });
  }
  {
    const c = tankPath.at(0.4);
    const top = c.y + tankRx(0.4) * 0.78;
    b.lathe(
      [
        [0, 0],
        [0.05, 0],
        [0.05, 0.012],
        [0.04, 0.02],
        [0.04, 0.03],
        [0.02, 0.036],
        [0, 0.036],
      ],
      { at: [c.x, top - 0.005, c.z], axis: [0, 1, 0], segments: 14, color: PCH, bone: frame },
    );
    b.lathe(
      [
        [0.045, 0.005],
        [0.058, 0.005],
        [0.058, 0.014],
        [0.045, 0.014],
      ],
      { at: [c.x, top - 0.005, c.z], axis: [0, 1, 0], segments: 14, color: ORANGE, bone: frame },
    );
  }
  for (const s of [1, -1])
    b.decal(tank, TANKDECAL, {
      at: [s * 0.14, 1.015, 0.12],
      dir: [s, 0, 0],
      size: [0.5, 0.225],
      mirror: s > 0,
    });

  // ---------------------------------------------------------------- seat, sissy bar, rear
  b.extrude(
    [
      [0.05, 0.84],
      [0.02, 0.89],
      [-0.12, 0.92],
      [-0.35, 0.905],
      [-0.55, 0.93],
      [-0.66, 0.9],
      [-0.64, 0.83],
      [-0.3, 0.8],
    ],
    { at: [0, 0, 0], x: [0, 0, 1], thickness: [0.24, 0.32], bevel: 0.03, color: seatPaint, bone: frame },
  );
  for (const s of [1, -1]) b.rod([s * 0.145, 0.875, 0.0], [s * 0.145, 0.875, -0.62], 0.007, ORANGE, { bone: frame, sides: 6 });
  b.sweep(
    catmull([
      [0.04, 0.82, 0.07],
      [0.04, 0.8, 0.0],
    ]),
    0.0,
    CHROME,
    { bone: frame },
  );
  // seat nose spring
  b.sweep(
    (() => {
      const centre = [0, 0.77, 0.07];
      return catmull(
        Array.from({ length: 21 }, (_, i) => {
          const a = (i / 20) * 4 * 2 * Math.PI;
          return [centre[0] + 0.035 * Math.cos(a), centre[1] + 0.001 * (i / 20) * 0 + 0.012 * (i / 20) * 4 * 0.5, centre[2] + 0.035 * Math.sin(a)];
        }),
      );
    })(),
    0.005,
    CHROME,
    { bone: frame, sides: 5 },
  );
  // sissy bar
  b.sweep(
    catmull([
      [-0.13, 0.74, -0.75],
      [-0.14, 0.95, -0.82],
      [-0.12, 1.2, -0.9],
      [-0.06, 1.26, -0.92],
      [0.06, 1.26, -0.92],
      [0.12, 1.2, -0.9],
      [0.14, 0.95, -0.82],
      [0.13, 0.74, -0.75],
    ]),
    0.013,
    PCH,
    { bone: frame, sides: 8 },
  );
  b.part(new THREE.BoxGeometry(0.22, 0.12, 0.05), seatPaint, { at: [0, 1.1, -0.875], bone: frame });
  b.part(new THREE.BoxGeometry(0.226, 0.012, 0.054), ORANGE, { at: [0, 1.045, -0.875], bone: frame });
  // rear fender
  fender(frame, AXR, 0.395, -95, 140, 0.135);
  // tail light, plate
  glow(
    b.part(new THREE.BoxGeometry(0.16, 0.022, 0.025), TAIL, {
      at: [0, AXR[1] + 0.405 * Math.cos(75 * DEG), AXR[2] - 0.405 * Math.sin(75 * DEG)],
      dir: [0, Math.cos(75 * DEG), -Math.sin(75 * DEG)],
      axis: "z",
      bone: frame,
    }),
    1.6,
  );
  b.rod([0, 0.305, -1.34], [0, 0.27, -1.37], 0.008, STEEL, { bone: frame, sides: 6 });
  b.part(new THREE.PlaneGeometry(0.16, 0.09), "#ffffff", {
    at: [0, 0.225, -1.375],
    dir: [0, 0.05, -1],
    axis: "z",
    texture: PLATE,
    bone: frame,
  });
  b.part(new THREE.BoxGeometry(0.17, 0.1, 0.008), NAVY, { at: [0, 0.225, -1.368], bone: frame });

  // ---------------------------------------------------------------- front end
  // steering stem, trees
  b.rod(steerPt(-0.12), steerPt(0.1), 0.03, STEEL, { bone: steer, sides: 8 });
  b.rod(steerPt(0.1, -0.14), steerPt(0.1, 0.14), 0.03, PW, { bone: steer, sides: 8 });
  b.rod(steerPt(-0.12, -0.14), steerPt(-0.12, 0.14), 0.026, PW, { bone: steer, sides: 8 });
  bolts(
    [-0.14, 0.14].flatMap((x) => [steerPt(0.1, x, 0.03), steerPt(-0.12, x, 0.03)]),
    0.011,
    CHROME,
    steer,
  );
  for (const s of [1, -1]) {
    b.rod(steerPt(-0.1, s * 0.13), steerPt(0.42, s * 0.13), 0.022, PCH, { bone: steer, sides: 8 });
    b.rod(steerPt(0.1, s * 0.13), steerPt(0.24, s * 0.13), 0.03, RUBBER, { bone: steer, sides: 8 });
    b.capsule(steerPt(0.36, s * 0.13), steerPt(0.83, s * 0.13), [0.034, 0.026], PW, {
      bone: steer,
      sides: 8,
      bands: [
        [0.08, PO],
        [1, PW],
      ],
    });
    b.lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.028, 0.012],
        [0, 0.016],
      ],
      { at: [s * 0.153, AXF[1], AXF[2]], axis: [s, 0, 0], segments: 10, color: ORANGE, bone: steer },
    );
    // axle
    b.rod([s * 0.1, AXF[1], AXF[2]], [s * 0.14, AXF[1], AXF[2]], 0.018, STEEL, { bone: steer, sides: 8 });
  }
  // caliper (left)
  b.part(new THREE.BoxGeometry(0.05, 0.07, 0.1), PO, { at: [0.108, 0.4, 0.865], bone: steer });
  b.rod([0.108, 0.4, 0.865], [0.13, 0.4, 0.941], 0.012, STEEL, { bone: steer, sides: 6 });
  // front fender
  fender(steer, AXF, 0.355, -50, 120, 0.07);
  for (const s of [1, -1]) {
    b.rod([s * 0.05, 0.665, AXF[2]], [s * 0.1, 0.665, 0.79], 0.009, STEEL, { bone: steer, sides: 6 });
    b.rod([s * 0.07, 0.431, 1.334], [s * 0.1, AXF[1], AXF[2]], 0.008, STEEL, { bone: steer, sides: 6 });
  }

  // headlight
  const L = steerPt(0.12, 0, 0.13);
  b.lathe(
    [
      [0, -0.06],
      [0.07, -0.06],
      [0.08, -0.02],
      [0.08, 0.03],
      [0.075, 0.05],
      [0, 0.05],
    ],
    { at: L, axis: [0, 0, 1], segments: 16, color: PW, bone: steer },
  );
  b.lathe(
    [
      [0.07, 0.03],
      [0.09, 0.03],
      [0.09, 0.055],
      [0.07, 0.055],
    ],
    { at: L, axis: [0, 0, 1], segments: 16, color: PO, bone: steer },
  );
  glow(
    b.lathe(
      [
        [0, 0.04],
        [0.065, 0.04],
        [0.055, 0.07],
        [0, 0.085],
      ],
      { at: L, axis: [0, 0, 1], segments: 14, color: GLASS, bone: steer },
    ),
    1.6,
  );
  glow(
    b.part(new THREE.TorusGeometry(0.088, 0.007, 5, 20), CYAN, {
      at: [L[0], L[1], L[2] + 0.052],
      dir: [0, 0, 1],
      axis: "z",
      bone: steer,
    }),
    1.3,
  );
  for (const s of [1, -1]) b.rod([s * 0.078, L[1], L[2] - 0.02], steerPt(0.12, s * 0.13, 0.0), 0.011, STEEL, { bone: steer, sides: 6 });

  // ---------------------------------------------------------------- bars, controls
  const barPts = [
    [-0.47, 1.285, 0.14],
    [-0.465, 1.27, 0.26],
    [-0.35, 1.24, 0.39],
    [-0.16, 1.215, 0.435],
    [0, 1.21, 0.44],
    [0.16, 1.215, 0.435],
    [0.35, 1.24, 0.39],
    [0.465, 1.27, 0.26],
    [0.47, 1.285, 0.14],
  ];
  b.sweep(catmull(barPts), 0.013, PCH, { bone: steer, sides: 8 });
  for (const s of [1, -1]) {
    b.rod(steerPt(-0.12, s * 0.09), [s * 0.09, 1.21, 0.438], 0.016, PW, { bone: steer, sides: 8 });
    b.rod([s * 0.09, 1.19, 0.44], [s * 0.09, 1.225, 0.436], 0.026, PO, { bone: steer, sides: 8 });
    const gripBone = s < 0 ? throttle : steer;
    b.rod([s * 0.465, 1.272, 0.255], [s * 0.47, 1.285, 0.12], 0.02, RUBBER, { bone: gripBone, sides: 8 });
    b.rod([s * 0.47, 1.284, 0.125], [s * 0.47, 1.285, 0.115], 0.024, ORANGE, { bone: gripBone, sides: 8 });
    // mirror
    b.rod([s * 0.455, 1.275, 0.3], [s * 0.49, 1.4, 0.2], 0.008, CHROME, { bone: steer, sides: 6 });
    const face = new THREE.Vector3(-s * 0.15, 0.25, -1).normalize();
    const mAt = new THREE.Vector3(s * 0.5, 1.44, 0.17);
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.014, 12), PW, { at: mAt, dir: face, bone: steer });
    b.part(new THREE.CylinderGeometry(0.042, 0.042, 0.006, 12), MIRROR, {
      at: mAt.clone().addScaledVector(face, 0.007),
      dir: face,
      bone: steer,
    });
  }
  // levers
  b.rod([0.455, 1.245, 0.29], [0.4, 1.24, 0.42], 0.01, CHROME, { bone: clutch, sides: 6 });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), ORANGE, { at: [0.4, 1.24, 0.42], bone: clutch });
  b.rod([-0.455, 1.245, 0.29], [-0.4, 1.24, 0.42], 0.01, CHROME, { bone: brakeLever, sides: 6 });
  b.part(new THREE.SphereGeometry(0.016, 6, 4), ORANGE, { at: [-0.4, 1.24, 0.42], bone: brakeLever });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), PN, { at: [0.45, 1.262, 0.285], bone: steer });
  b.part(new THREE.BoxGeometry(0.05, 0.04, 0.05), PN, { at: [-0.45, 1.262, 0.285], bone: steer });
  // throttle cable
  tube(
    [
      [-0.45, 1.26, 0.23],
      [-0.3, 1.14, 0.38],
      [-0.16, 0.99, 0.47],
      [-0.06, 0.8, 0.4],
      [0.0, 0.7, 0.12],
    ],
    0.006,
    RUBBER,
    steer,
  );
  // speedo
  const gd = new THREE.Vector3(0, 0.55, -0.83).normalize();
  const gAt = new THREE.Vector3(0, 1.14, 0.5);
  b.part(new THREE.CylinderGeometry(0.058, 0.058, 0.05, 16), PCH, { at: gAt, dir: gd, bone: steer });
  glow(
    b.part(new THREE.CircleGeometry(0.05, 20), "#ffffff", {
      at: gAt.clone().addScaledVector(gd, 0.026),
      dir: gd,
      axis: "z",
      texture: DIAL,
      bone: steer,
    }),
    1,
  );
  b.rod(steerPt(-0.12, 0, 0.0), [0, 1.12, 0.5], 0.012, STEEL, { bone: steer, sides: 6 });
  bolts(
    [
      [-0.1, 1.12, 0.462],
      [0.1, 1.12, 0.462],
    ],
    0.012,
    CHROME,
    steer,
  );

  // ---------------------------------------------------------------- pedal, kickstand
  b.rod([-0.15, 0.37, 0.36], [-0.27, 0.33, 0.62], 0.014, STEEL, { bone: pedal, sides: 6 });
  b.part(new THREE.BoxGeometry(0.09, 0.016, 0.05), RUBBER, { at: [-0.27, 0.33, 0.62], bone: pedal });
  b.rod([0.15, 0.37, 0.36], [0.24, 0.33, 0.62], 0.014, STEEL, { bone: frame, sides: 6 });
  b.part(new THREE.SphereGeometry(0.022, 6, 4), RUBBER, { at: [0.24, 0.33, 0.62], bone: frame });
  b.rod([0.19, 0.27, -0.3], [0.3, 0.09, -0.4], 0.016, STEEL, { bone: kick, sides: 6 });
  b.part(new THREE.BoxGeometry(0.08, 0.02, 0.05), RUBBER, { at: [0.3, 0.09, -0.4], bone: kick });

  return b.root;
}
