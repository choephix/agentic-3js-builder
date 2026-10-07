import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../src/builder";
import type { OutlinePoint } from "../src/builder";
import { DEG } from "../src/math";
import { catmull, spiral } from "../src/path";
import { mix, paint, smoothstep } from "../src/paint";
import type { Fill } from "../src/context";
import type { PartOptions } from "../src/parts";
import type { Joint } from "../src/skeleton";
import { svg } from "../src/texture";
import { glow } from "../kits/glow";

export const meta = {
  name: "Ember Chopper",
  description:
    "A long-raked custom chopper in a clean, polished sci-fi look: white and graphite colour blocking, one hot orange accent, glowing lamps, finned V-twin, belt drive and wheel hinges.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];

// ---------------------------------------------------------------- palette
const WHITE = "#e9edf1";
const GRAPH = "#6c788c";
const GRAPH_L = "#8995a9";
const DARK = "#363e4b";
const STEEL = "#b6bec8";
const STEEL_D = "#7d8794";
const ORANGE = "#ff7a14";
const ORANGE_D = "#c9560a";
const RUBBER = "#202226";
const TREAD = "#383b42";
const GLASS = "#a4c8d8";

// ---------------------------------------------------------------- textures
const EMBLEM = svg(
  `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="56" fill="#ff7a14"/><circle cx="60" cy="60" r="46" fill="#14171c"/>
  <path d="M60 20 L94 84 L75 84 L60 55 L45 84 L26 84 Z" fill="#f4f6f8"/>
  <path d="M30 94 L90 94 L83 102 L37 102 Z" fill="#ff7a14"/></svg>`,
  { size: 256 },
);
const DIAL = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="49" fill="#0f1217"/>
  <path d="M17 76 A38 38 0 1 1 83 76" fill="none" stroke="#ff7a14" stroke-width="6"/>
  <path d="M17 76 A38 38 0 0 1 14 62" fill="none" stroke="#ffd2a0" stroke-width="6"/>
  <g stroke="#f4f6f8" stroke-width="3">
  <line x1="50" y1="14" x2="50" y2="24"/><line x1="24" y1="26" x2="30" y2="33"/><line x1="76" y1="26" x2="70" y2="33"/>
  <line x1="14" y1="50" x2="24" y2="50"/><line x1="86" y1="50" x2="76" y2="50"/></g>
  <path d="M50 52 L69 31" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="52" r="7" fill="#ff7a14"/>
  <rect x="36" y="68" width="28" height="10" rx="2" fill="#26405a"/>
  <rect x="39" y="71" width="14" height="4" fill="#7fe4ff"/></svg>`,
  { size: 256 },
);
const PLATE = svg(
  `<svg viewBox="0 0 120 64" xmlns="http://www.w3.org/2000/svg">
  <rect x="1" y="1" width="118" height="62" rx="8" fill="#14171c"/>
  <rect x="5" y="5" width="110" height="54" rx="5" fill="#eef1f4"/>
  <rect x="5" y="5" width="110" height="12" rx="5" fill="#ff7a14"/>
  <text x="60" y="48" font-family="monospace" font-weight="bold" font-size="21" text-anchor="middle" fill="#14171c">CH0P-77</text>
  <circle cx="14" cy="32" r="3" fill="#7d8794"/><circle cx="106" cy="32" r="3" fill="#7d8794"/></svg>`,
  { size: 256 },
);
const LENS_TEX = svg(
  `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="50" fill="#ffd47a"/><circle cx="50" cy="50" r="44" fill="#fff4d6"/>
  <circle cx="50" cy="50" r="33" fill="none" stroke="#ffe39a" stroke-width="4"/>
  <circle cx="50" cy="50" r="21" fill="none" stroke="#ffe39a" stroke-width="4"/>
  <circle cx="50" cy="50" r="9" fill="#ffffff"/>
  <g stroke="#ffe9b0" stroke-width="3"><line x1="50" y1="6" x2="50" y2="94"/><line x1="6" y1="50" x2="94" y2="50"/>
  <line x1="19" y1="19" x2="81" y2="81"/><line x1="81" y1="19" x2="19" y2="81"/></g></svg>`,
  { size: 256 },
);
const WARN = svg(
  `<svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="120" height="40" rx="4" fill="#14171c"/>
  <path d="M0 40 L14 0 L28 0 L14 40Z M30 40 L44 0 L58 0 L44 40Z" fill="#ff7a14"/>
  <text x="88" y="27" font-family="monospace" font-weight="bold" font-size="20" text-anchor="middle" fill="#eef1f4">V2-1800</text></svg>`,
  { size: 256 },
);

export default function build() {
  const b = createBuilder({ name: "chopper", paintSize: 2048 });

  // ------------------------------------------------------------- key dimensions
  const rF = 0.31;
  const rR = 0.345;
  const AXF: V = [0, rF, 1.12];
  const AXR: V = [0, rR, -0.8];
  const RAKE = 36 * DEG;
  const U: V = [0, Math.cos(RAKE), -Math.sin(RAKE)]; // up the fork
  const P: V = [0, Math.sin(RAKE), Math.cos(RAKE)]; // forward-up, square to the fork
  const onFork = (L: number, x = 0, f = 0): V => [
    x,
    AXF[1] + U[1] * L + P[1] * f,
    AXF[2] + U[2] * L + P[2] * f,
  ];

  // ------------------------------------------------------------- skeleton
  const frameJ = b.joint("frame", { at: [0, 0.55, 0], dir: [0, 0, 1], role: "spine" });
  const steer = b.joint("steer", {
    parent: frameJ,
    at: onFork(0.78),
    dir: [0, -U[1], -U[2]],
    role: "hinge",
  });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [0, 0, 1], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: AXR, dir: [0, 0, 1], role: "hinge" });
  const kick = b.joint("kickstand", { parent: frameJ, at: [0.17, 0.27, -0.12], dir: [0, 0, -1], role: "hinge" });
  const gripY = 1.3;
  const leverL = b.joint("leverL", { parent: steer, at: [0.385, gripY - 0.005, 0.5], dir: [0, 0, -1], role: "hinge" });
  const leverR = b.joint("leverR", { parent: steer, at: [-0.385, gripY - 0.005, 0.5], dir: [0, 0, -1], role: "hinge" });
  const throttle = b.joint("throttle", { parent: steer, at: [-0.4, gripY + 0.005, 0.36], dir: [0, 0.02, -1], role: "hinge" });

  // ------------------------------------------------------------- helpers
  const part = (geo: THREE.BufferGeometry, color: Fill, bone: Joint, at: V, o: PartOptions = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...o });

  type Bucket = { bone: Joint; color: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const bucketFor = (bone: Joint, color: string) => {
    const key = `${bone.name}|${color}`;
    let k = buckets.get(key);
    if (!k) {
      k = { bone, color, geos: [] };
      buckets.set(key, k);
    }
    return k;
  };
  const orient = (g: THREE.BufferGeometry, face: string) => {
    if (face === "x") g.rotateZ(-Math.PI / 2);
    else if (face === "-x") g.rotateZ(Math.PI / 2);
    else if (face === "-y") g.rotateX(Math.PI);
    else if (face === "z") g.rotateX(Math.PI / 2);
    else if (face === "-z") g.rotateX(-Math.PI / 2);
    return g;
  };
  /** a hex bolt head or stud, merged per bone and colour */
  const bolt = (bone: Joint, color: string, p: V, face: string, r = 0.009, seg = 6) => {
    const g = orient(new THREE.CylinderGeometry(r, r, r * 0.8, seg), face).translate(p[0], p[1], p[2]);
    bucketFor(bone, color).geos.push(g);
  };
  const knob = (bone: Joint, color: string, p: V, r = 0.008) => {
    bucketFor(bone, color).geos.push(new THREE.SphereGeometry(r, 6, 4).translate(p[0], p[1], p[2]));
  };
  const flush = () => {
    for (const k of buckets.values()) {
      const merged = mergeGeometries(k.geos.map((g) => g.index ? g : g));
      if (merged) b.part(merged, k.color, { bone: k.bone, at: [0, 0, 0], flat: true, name: `studs.${k.bone.name}.${k.color.slice(1)}` });
    }
  };

  // ============================================================= WHEELS
  const tireOutline = (R: number, hw: number, rin: number): OutlinePoint[] => {
    const d = R - rin;
    return [
      [rin, -hw * 0.9],
      [rin + d * 0.45, -hw],
      [R - d * 0.12, -hw * 0.8],
      [R, -hw * 0.42],
      [R, hw * 0.42],
      [R - d * 0.12, hw * 0.8],
      [rin + d * 0.45, hw],
      [rin, hw * 0.9],
    ];
  };

  function wheel(bone: Joint, c: V, o: { R: number; hw: number; rin: number; lugs: number; spokes: number; hubHalf: number; thick: number; seg: number }) {
    const { R, hw, rin } = o;
    const tire = paint((p, n, s) => {
      const rr = Math.hypot(p.y - c[1], p.z - c[2]);
      if (Math.abs(n.x) > 0.75) {
        // sidewall: orange pin-stripe ring, fine radial ribs near the bead
        if (rr > R - 0.052 && rr < R - 0.045) return ORANGE;
        if (rr < rin + 0.02) return "#0e0f11";
        return ((s[1] / 360) * o.lugs * 2) % 1 < 0.5 && rr > R - 0.04 ? "#1d1f23" : "#202226";
      }
      const h = Math.abs(p.x);
      const ph = (((s[1] / 360) * o.lugs + h * (0.6 / hw) * 1.2) % 1 + 1) % 1;
      if (h < hw * 0.06) return TREAD;
      return ph < 0.55 && h < hw * 0.78 ? TREAD : RUBBER;
    });
    b.lathe(tireOutline(R, hw, rin), { at: c, axis: [1, 0, 0], segments: o.seg, bone, color: tire, name: "tire" });

    // rim barrel + coloured lip rings
    b.lathe(
      [
        [rin - 0.035, -hw * 0.98],
        [rin + 0.012, -hw * 1.02],
        [rin + 0.012, hw * 1.02],
        [rin - 0.035, hw * 0.98],
      ],
      { at: c, axis: [1, 0, 0], segments: o.seg, bone, color: GRAPH_L, name: "rim" },
    );
    for (const s of [1, -1]) {
      b.lathe(
        [
          [rin - 0.062, s * hw * 0.96],
          [rin - 0.03, s * hw * 0.96],
          [rin - 0.03, s * (hw * 0.96 + 0.007)],
          [rin - 0.062, s * (hw * 0.96 + 0.007)],
        ],
        { at: c, axis: [1, 0, 0], segments: o.seg, bone, color: ORANGE, name: "rimStripe" },
      );
    }
    // spokes
    const spokePaint = paint((_p, n, s) => (Math.abs(n.x) > 0.5 && Math.abs(s[0]) < 0.0055 && s[1] > 0.085 ? ORANGE : WHITE));
    b.lathe(
      [
        [0.05, -0.006],
        [rin - 0.03, -0.006],
        [rin - 0.03, 0.006],
        [0.05, 0.006],
      ],
      { at: c, axis: [1, 0, 0], segments: o.seg, bone, color: DARK, name: "wheelBacking" },
    );
    for (let i = 0; i < o.spokes; i++) {
      const th = (i / o.spokes) * Math.PI * 2 + 0.2;
      const xd: V = [0, Math.cos(th), Math.sin(th)];
      const yd: V = [0, -Math.sin(th), Math.cos(th)];
      const w0 = 0.075;
      const w1 = 0.04;
      b.extrude(
        [
          [-w0 / 2, 0.05],
          [w0 / 2, 0.05],
          [w1 / 2, rin - 0.03],
          [-w1 / 2, rin - 0.03],
        ],
        { at: c, x: xd, y: yd, thickness: o.thick, bevel: o.thick * 0.28, bone, color: spokePaint, name: "spoke" },
      );
    }
    // hub drum, caps and axle nuts
    b.lathe(
      [
        [0.0, -o.hubHalf],
        [0.058, -o.hubHalf],
        [0.058, o.hubHalf],
        [0.0, o.hubHalf],
      ],
      { at: c, axis: [1, 0, 0], segments: 14, bone, color: STEEL_D, name: "hub" },
    );
    for (const s of [1, -1]) {
      b.lathe(
        [
          [0, 0],
          [0.05, 0],
          [0.056, 0.008],
          [0.05, 0.02],
          [0.026, 0.026],
          [0, 0.028],
        ],
        { at: [s * (o.thick / 2 + 0.002), c[1], c[2]], axis: [s, 0, 0], segments: 12, bone, color: ORANGE, name: "hubCap" },
      );
    }
    // valve stem
    const vth = 2.2;
    b.rod(
      [-hw * 0.9, c[1] + Math.cos(vth) * (rin - 0.02), c[2] + Math.sin(vth) * (rin - 0.02)],
      [-hw * 0.9 - 0.025, c[1] + Math.cos(vth) * (rin - 0.045), c[2] + Math.sin(vth) * (rin - 0.045)],
      0.005,
      { bone, color: STEEL_D },
    );
  }

  wheel(wheelF, AXF, { R: rF, hw: 0.055, rin: 0.215, lugs: 44, spokes: 6, hubHalf: 0.075, thick: 0.03, seg: 28 });
  wheel(wheelR, AXR, { R: rR, hw: 0.13, rin: 0.24, lugs: 54, spokes: 6, hubHalf: 0.19, thick: 0.05, seg: 30 });

  // brake rotors
  const holes = (cy: number, cz: number) =>
    paint((p) => {
      const rr = Math.hypot(p.y - cy, p.z - cz);
      const ang = Math.atan2(p.z - cz, p.y - cy) / DEG;
      const cell = (((ang + 360) % 22.5) - 11.25) * (Math.PI / 180) * rr;
      const near = (r0: number) => Math.hypot(cell, rr - r0) < 0.0042;
      return near(0.103) || near(0.125) ? DARK : "#98a2af";
    });
  const rotor = (bone: Joint, x: number, c: V, rIn: number, rOut: number, th: number, pnt: Fill) =>
    b.lathe(
      [
        [rIn, x - th],
        [rOut, x - th],
        [rOut, x + th],
        [rIn, x + th],
      ],
      { at: [0, c[1], c[2]], axis: [1, 0, 0], segments: 28, bone, color: pnt, name: "rotor" },
    );
  for (const s of [1, -1]) rotor(wheelF, s * 0.078, AXF, 0.085, 0.14, 0.004, holes(AXF[1], AXF[2]));
  rotor(wheelR, -0.215, AXR, 0.1, 0.14, 0.005, holes(AXR[1], AXR[2]));
  // rotor carriers
  for (const s of [1, -1]) {
    b.lathe(
      [
        [0.058, s * 0.058],
        [0.095, s * 0.058],
        [0.095, s * 0.082],
        [0.058, s * 0.082],
      ],
      { at: [0, AXF[1], AXF[2]], axis: [1, 0, 0], segments: 10, bone: wheelF, color: GRAPH_L, name: "carrier" },
    );
  }

  // rear drive pulley (left) + hub spacers
  const pulleyPaint = paint((p, n, s) => {
    void s;
    const ang = Math.atan2(p.z - AXR[2], p.y - AXR[1]) / DEG;
    const rr = Math.hypot(p.y - AXR[1], p.z - AXR[2]);
    if (Math.abs(n.x) > 0.7 && rr > 0.075 && rr < 0.115) return (((ang + 360) / 15) % 1) < 0.5 ? GRAPH : STEEL_D;
    if (Math.abs(n.x) > 0.7 && rr < 0.075) return ORANGE_D;
    return (((ang + 360) / 6) % 1) < 0.5 ? STEEL : STEEL_D;
  });
  b.lathe(
    [
      [0.06, 0.196],
      [0.13, 0.196],
      [0.133, 0.205],
      [0.133, 0.232],
      [0.13, 0.24],
      [0.06, 0.24],
    ],
    { at: [0, AXR[1], AXR[2]], axis: [1, 0, 0], segments: 24, bone: wheelR, color: pulleyPaint, name: "pulley" },
  );
  b.rod([0.15, AXR[1], AXR[2]], [0.28, AXR[1], AXR[2]], 0.02, { bone: wheelR, color: STEEL_D });
  b.rod([-0.15, AXR[1], AXR[2]], [-0.28, AXR[1], AXR[2]], 0.02, { bone: wheelR, color: STEEL_D });
  for (const s of [1, -1])
    b.lathe(
      [
        [0, 0],
        [0.034, 0],
        [0.034, 0.012],
        [0.02, 0.016],
        [0, 0.016],
      ],
      { at: [s * 0.255, AXR[1], AXR[2]], axis: [s, 0, 0], segments: 6, bone: wheelR, color: STEEL, name: "axleNut" },
    );

  // ============================================================= FORK / FRONT END
  const legX = 0.105;
  for (const s of [1, -1]) {
    const x = s * legX;
    // chrome stanchions, graphite sleeves, orange collars
    b.rod(onFork(0.9, x), onFork(0.4, x), 0.016, { bone: steer, color: STEEL, name: "stanchion" });
    b.rod(onFork(0.52, x), onFork(0.0, x), 0.027, { bone: steer, color: GRAPH, name: "sleeve" });
    b.rod(onFork(0.545, x), onFork(0.5, x), 0.032, { bone: steer, color: ORANGE, name: "collar" });
    b.rod(onFork(0.12, x), onFork(0.07, x), 0.031, { bone: steer, color: ORANGE, name: "collarLow" });
    b.rod(onFork(0.33, x), onFork(0.3, x), 0.03, { bone: steer, color: STEEL_D, name: "bandMid" });
    // axle lug with cap bolt
    b.capsule(onFork(0.0, x, 0), onFork(0.0, s * (legX + 0.03)), 0.03, { bone: steer, color: GRAPH_L, name: "lug" });
    bolt(steer, STEEL, onFork(0.0, s * (legX + 0.062)), s > 0 ? "x" : "-x", 0.016);
    // glowing DRL strip down the front of each lower leg
    glow(
      b.rod(onFork(0.47, x, 0.027), onFork(0.1, x, 0.027), 0.006, { bone: steer, color: ORANGE, name: "drl" }),
      1.4,
    );
    // fork gaiter ribs on the stanchion
    for (let i = 0; i < 4; i++) b.rod(onFork(0.56 + i * 0.045, x), onFork(0.575 + i * 0.045, x), 0.021, { bone: steer, color: DARK, name: "rib" });
    // brake caliper & hose
    const cal: V = [s * 0.082, AXF[1] + 0.02, AXF[2] - 0.158];
    part(new THREE.BoxGeometry(0.036, 0.075, 0.05), ORANGE, steer, cal, { name: "caliper" });
    part(new THREE.BoxGeometry(0.044, 0.03, 0.03), ORANGE_D, steer, [cal[0], cal[1] + 0.045, cal[2] + 0.005], { name: "caliperTop" });
    b.rod(onFork(0.06, s * 0.1), cal, 0.012, { bone: steer, color: GRAPH_L, name: "caliperArm" });
    b.sweep(
      catmull([
        [s * 0.385, gripY - 0.03, 0.47],
        [s * 0.26, 1.12, 0.5],
        onFork(0.7, s * 0.12, 0.05),
        onFork(0.3, s * 0.1, 0.05),
        [s * 0.088, cal[1] + 0.045, cal[2] + 0.005],
      ]),
      0.006,
      { bone: steer, color: DARK, sides: 5, name: "brakeHose" },
    );
  }

  // trees (plates square to the fork axis)
  const treeOutline = (hw: number, hd: number): OutlinePoint[] => [
    [-hw, -hd * 0.6],
    [-hw * 0.7, -hd],
    [hw * 0.7, -hd],
    [hw, -hd * 0.6],
    [hw, hd * 0.6],
    [hw * 0.7, hd],
    [-hw * 0.7, hd],
    [-hw, hd * 0.6],
  ];
  const tree = (L: number, hw: number, hd: number, th: number, color: string) => {
    b.extrude(treeOutline(hw, hd), { at: onFork(L), x: [1, 0, 0], y: P, thickness: th, bevel: th * 0.3, bone: steer, color, name: "tree" });
  };
  tree(0.665, 0.145, 0.065, 0.034, GRAPH_L);
  tree(0.895, 0.14, 0.055, 0.03, GRAPH_L);
  b.rod(onFork(0.64), onFork(0.93), 0.021, { bone: steer, color: STEEL, name: "steerTube" });
  for (const s of [1, -1]) {
    for (const L of [0.665, 0.895]) {
      bolt(steer, STEEL, onFork(L + (L > 0.8 ? 0.02 : -0.02), s * 0.115, 0.0), L > 0.8 ? "y" : "-y", 0.012);
    }
    // pinch bolts on the tree sides
    bolt(steer, STEEL, onFork(0.665, s * 0.15, 0.0), s > 0 ? "x" : "-x", 0.011);
    bolt(steer, STEEL, onFork(0.895, s * 0.145, 0.0), s > 0 ? "x" : "-x", 0.011);
  }
  // orange caps on top tree
  glow(b.lathe([[0, 0],[0.034,0],[0.034,0.01],[0.026,0.018],[0,0.02]], { at: onFork(0.93), axis: U, segments: 8, bone: steer, color: ORANGE, name: "steerCap" }), 1.0);

  // head tube on the frame
  b.rod(onFork(0.70), onFork(0.86), 0.034, { bone: frameJ, color: GRAPH, name: "headTube" });
  b.rod(onFork(0.7), onFork(0.735), 0.04, { bone: frameJ, color: ORANGE, name: "headCupLow" });
  b.rod(onFork(0.825), onFork(0.86), 0.04, { bone: frameJ, color: ORANGE, name: "headCupHigh" });

  // headlamp
  {
    const lampDir: V = [0, -0.06, 1];
    const lampAt = onFork(0.6, 0, 0.145);
    const hy = lampAt[1];
    const hz = lampAt[2];
    b.lathe(
      [
        [0, 0],
        [0.058, 0],
        [0.082, 0.025],
        [0.09, 0.06],
        [0.086, 0.1],
        [0.062, 0.128],
        [0, 0.13],
      ],
      { at: [0, hy, hz - 0.1], axis: lampDir, segments: 16, bone: steer, color: WHITE, name: "lampBucket" },
    );
    // ring + lens
    b.lathe(
      [
        [0.074, 0.0],
        [0.092, 0.0],
        [0.092, 0.012],
        [0.074, 0.012],
      ],
      { at: [0, hy - 0.006, hz + 0.036], axis: lampDir, segments: 16, bone: steer, color: ORANGE, name: "lampRing" },
    );
    glow(
      part(new THREE.CircleGeometry(0.074, 16), "#ffffff", steer, [0, hy - 0.007, hz + 0.052], {
        dir: lampDir,
        axis: "z",
        texture: LENS_TEX,
        name: "lens",
      }),
      1.4,
    );
    // brow
    b.sweep(
      catmull([
        [-0.088, hy + 0.012, hz - 0.02],
        [-0.066, hy + 0.074, hz + 0.012],
        [0, hy + 0.098, hz + 0.028],
        [0.066, hy + 0.074, hz + 0.012],
        [0.088, hy + 0.012, hz - 0.02],
      ]),
      [0.012, 0.012],
      { bone: steer, color: GRAPH, name: "lampBrow", section: { ngon: 4 } },
    );
    for (const s of [1, -1]) {
      b.rod([s * 0.09, hy, hz - 0.01], onFork(0.6, s * 0.098), 0.012, { bone: steer, color: GRAPH_L, name: "lampArm" });
      bolt(steer, STEEL, [s * 0.1, hy, hz - 0.01], s > 0 ? "x" : "-x", 0.012);
    }
    b.rod([0, hy - 0.06, hz + 0.0], [0, hy - 0.1, hz - 0.01], 0.01, { bone: steer, color: GRAPH_L, name: "lampMount" });
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      bolt(steer, STEEL, [Math.cos(a) * 0.083, hy - 0.006 + Math.sin(a) * 0.083, hz + 0.048], "z", 0.005);
    }
  }

  // front fender (bobbed) on stays
  {
    const pts: V[] = [];
    for (let a = 52; a >= -56; a -= 12) pts.push([0, AXF[1] + 0.352 * Math.cos(a * DEG), AXF[2] + 0.352 * Math.sin(a * DEG)]);
    const ffPaint = paint((p, n, s) => {
      const ax = Math.abs(p.x);
      if (ax > 0.058) return GRAPH;
      if (Math.abs(s[0] - 0.5) < 0.006) return "#2a2f38";
      if (ax > 0.02 && ax < 0.034 && n.y > 0.3) return ORANGE;
      return mix("#f4f6f8", "#cfd6de", smoothstep(0.9, -0.2, n.y));
    });
    b.sweep(catmull(pts), () => [0.078, 0.026], { bone: steer, color: ffPaint, sides: 12, caps: "flat", name: "frontFender" });
    for (const s of [1, -1]) {
      const aT: V = [s * 0.07, AXF[1] + 0.372 * Math.cos(-45 * DEG), AXF[2] + 0.372 * Math.sin(-45 * DEG)];
      b.rod(aT, onFork(0.3, s * legX), 0.008, { bone: steer, color: STEEL_D, name: "fenderStay" });
      const fT: V = [s * 0.07, AXF[1] + 0.372 * Math.cos(48 * DEG), AXF[2] + 0.372 * Math.sin(48 * DEG)];
      b.rod(fT, onFork(0.14, s * legX), 0.008, { bone: steer, color: STEEL_D, name: "fenderStayF" });
      bolt(steer, STEEL, [s * 0.07, aT[1] + 0.02, aT[2]], "y", 0.008);
    }
  }

  // ============================================================= HANDLEBARS
  const barPath = (s: number): V[] => [
    [s * 0.06, 1.09, 0.565],
    [s * 0.16, 1.115, 0.555],
    [s * 0.27, 1.165, 0.535],
    [s * 0.355, 1.245, 0.49],
    [s * 0.385, gripY, 0.43],
  ];
  b.rod([-0.06, 1.09, 0.565], [0.06, 1.09, 0.565], 0.0125, { bone: steer, color: STEEL, name: "barCenter" });
  for (const s of [1, -1]) {
    const bar = catmull(barPath(s));
    b.sweep(bar, 0.0125, { bone: steer, color: STEEL, sides: 8, name: "bar" });
    const gripBone = s < 0 ? throttle : steer;
    // grips
    b.rod([s * 0.386, gripY + 0.002, 0.405], [s * 0.4, gripY + 0.008, 0.25], 0.0195, { bone: gripBone, color: RUBBER, name: "grip" });
    for (let i = 0; i < 4; i++) {
      const z = 0.38 - i * 0.04;
      b.rod([s * 0.388, gripY + 0.003, z], [s * 0.388, gripY + 0.003, z - 0.012], 0.0215, { bone: gripBone, color: GRAPH, name: "gripRing" });
    }
    b.lathe([[0, 0],[0.02,0],[0.021,0.006],[0.012,0.014],[0,0.014]], { at: [s * 0.4, gripY + 0.008, 0.25], axis: [0, 0, -1], segments: 8, bone: gripBone, color: ORANGE, name: "gripCap" });
    // clamps at the tree
    part(new THREE.BoxGeometry(0.036, 0.034, 0.05), GRAPH_L, steer, [s * 0.06, 1.075, 0.565], { name: "riser" });
    bolt(steer, STEEL, [s * 0.06, 1.095, 0.565], "y", 0.009);
    b.rod([s * 0.06, 1.045, 0.585], [s * 0.06, 1.09, 0.565], 0.019, { bone: steer, color: STEEL, name: "riserStem" });
    // perches + levers
    part(new THREE.BoxGeometry(0.04, 0.04, 0.07), GRAPH, steer, [s * 0.386, gripY - 0.012, 0.465], { name: "perch" });
    bolt(steer, STEEL, [s * 0.386, gripY + 0.01, 0.465], "y", 0.008);
    const lv = s > 0 ? leverL : leverR;
    b.sweep(
      catmull([
        [s * 0.386, gripY - 0.005, 0.5],
        [s * 0.392, gripY - 0.03, 0.43],
        [s * 0.396, gripY - 0.04, 0.34],
        [s * 0.4, gripY - 0.03, 0.25],
      ]),
      [0.01, 0.007],
      { bone: lv, color: STEEL, sides: 6, name: "lever", caps: { start: "round", end: "round" } },
    );
    knob(lv, ORANGE, [s * 0.4, gripY - 0.03, 0.245], 0.011);
    // bar-end mirror
    const stemTop: V = [s * 0.44, 1.385, 0.2];
    b.sweep(catmull([[s * 0.4, gripY + 0.008, 0.248], [s * 0.425, gripY + 0.05, 0.225], stemTop]), 0.007, { bone: steer, color: STEEL_D, sides: 6, name: "mirrorStem" });
    b.lathe([[0, 0],[0.039,0],[0.042,0.01],[0.038,0.02],[0,0.021]], { at: [stemTop[0], stemTop[1] + 0.005, stemTop[2] - 0.01], axis: [0, 0.12, -1], segments: 12, bone: steer, color: GRAPH, name: "mirrorShell" });
    part(new THREE.CircleGeometry(0.035, 12), GLASS, steer, [stemTop[0], stemTop[1] + 0.0026, stemTop[2] - 0.0315], { dir: [0, 0.12, -1], axis: "z", name: "mirrorGlass" });
    b.lathe([[0.035,0],[0.041,0],[0.041,0.004],[0.035,0.004]], { at: [stemTop[0], stemTop[1] + 0.0027, stemTop[2] - 0.033], axis: [0, 0.12, -1], segments: 12, bone: steer, color: ORANGE, name: "mirrorRim" });
    // clutch/brake master cylinder body + cable
    part(new THREE.CylinderGeometry(0.014, 0.014, 0.05, 8), GRAPH_L, steer, [s * 0.38, gripY + 0.018, 0.5], { rotation: [90, 0, 0], name: "reservoir" });
    part(new THREE.SphereGeometry(0.016, 8, 5), ORANGE, steer, [s * 0.38, gripY + 0.018, 0.53], { name: "reservoirCap" });
  }
  // throttle housing
  part(new THREE.BoxGeometry(0.046, 0.044, 0.06), GRAPH, steer, [-0.4, gripY + 0.006, 0.425], { name: "throttleHousing" });

  // dash gauge
  {
    const g: V = [0, 1.138, 0.53];
    const gd: V = [0, 0.5, -0.86];
    b.lathe([[0, 0],[0.052,0],[0.058,0.012],[0.056,0.05],[0.042,0.066],[0,0.068]], { at: [g[0], g[1] - 0.012, g[2] + 0.04], axis: gd, segments: 14, bone: steer, color: GRAPH, name: "gaugeShell" });
    b.lathe([[0.048,0],[0.06,0],[0.06,0.007],[0.048,0.007]], { at: [g[0] , g[1] + 0.034, g[2] - 0.0], axis: gd, segments: 14, bone: steer, color: ORANGE, name: "gaugeRing" });
    glow(part(new THREE.CircleGeometry(0.048, 16), "#ffffff", steer, [g[0], g[1] + 0.0365, g[2] - 0.0015], { dir: gd, axis: "z", texture: DIAL, name: "gaugeFace" }), 1);
    b.rod([0, 1.05, 0.56], [0, 1.1, 0.54], 0.016, { bone: steer, color: GRAPH_L, name: "gaugeStem" });
  }

  // ============================================================= FRAME
  const tubeR = 0.024;
  const bbPath = catmull([
    [0, 0.915, 0.7],
    [0, 0.85, 0.57],
    [0, 0.8, 0.42],
    [0, 0.74, 0.1],
    [0, 0.665, -0.18],
    [0, 0.61, -0.38],
  ]);
  b.sweep(bbPath, tubeR, { bone: frameJ, color: GRAPH, sides: 8, name: "backbone" });
  b.sweep(catmull([[0, 0.885, 0.69], [0, 0.62, 0.6], [0, 0.44, 0.5], [0, 0.31, 0.42]]), 0.026, { bone: frameJ, color: GRAPH, sides: 8, name: "downTube" });
  for (const s of [1, -1]) {
    // top rails to the axle plates
    b.sweep(catmull([[0, 0.61, -0.38], [s * 0.1, 0.585, -0.5], [s * 0.17, 0.5, -0.65], [s * 0.17, 0.4, -0.76], [s * 0.17, rR, AXR[2]]]), 0.02, { bone: frameJ, color: GRAPH, sides: 8, name: "topRail" });
    // lower cradle rails
    b.sweep(catmull([[s * 0.02, 0.31, 0.42], [s * 0.115, 0.275, 0.3], [s * 0.14, 0.27, 0.0], [s * 0.16, 0.285, -0.4], [s * 0.17, 0.32, -0.7], [s * 0.17, rR, AXR[2]]]), 0.02, { bone: frameJ, color: GRAPH, sides: 8, name: "cradleRail" });
    // dropout plates
    b.extrude(
      [[-0.07, -0.05], [0.0, -0.075], [0.07, -0.045], [0.085, 0.03], [0.05, 0.1], [-0.04, 0.12], [-0.08, 0.05]],
      { at: [s * 0.166, AXR[1], AXR[2]], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.016, bevel: 0.005, bone: frameJ, color: GRAPH_L, name: "dropout" },
    );
    bolt(frameJ, STEEL, [s * 0.178, AXR[1] + 0.07, AXR[2] - 0.035], s > 0 ? "x" : "-x", 0.008);
    bolt(frameJ, STEEL, [s * 0.178, AXR[1] - 0.04, AXR[2] + 0.05], s > 0 ? "x" : "-x", 0.008);
    // engine mounting plates (front)
    b.extrude(
      [[-0.07, -0.04], [0.06, -0.06], [0.1, 0.0], [0.05, 0.07], [-0.06, 0.06]],
      { at: [s * 0.118, 0.34, 0.33], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.014, bevel: 0.004, bone: frameJ, color: GRAPH_L, name: "motorPlate" },
    );
    bolt(frameJ, STEEL, [s * 0.127, 0.34, 0.29], s > 0 ? "x" : "-x", 0.008);
    bolt(frameJ, STEEL, [s * 0.127, 0.365, 0.38], s > 0 ? "x" : "-x", 0.008);
    // gusset where top rails meet the backbone
  }
  b.rod([0, 0.64, -0.3], [0, 0.575, -0.45], 0.034, { bone: frameJ, color: GRAPH_L, name: "railJoint" });
  b.rod([0, 0.905, 0.665], [0, 0.865, 0.6], 0.036, { bone: frameJ, color: GRAPH_L, name: "neckGusset" });
  for (const t of [0.28, 0.62]) {
    const q = bbPath.at(t);
    const tg = bbPath.tangentAt(t);
    b.rod([q.x, q.y - tg.y * 0.014, q.z - tg.z * 0.014], [q.x, q.y + tg.y * 0.014, q.z + tg.z * 0.014], 0.03, { bone: frameJ, color: ORANGE, name: "frameBand" });
  }

  // ============================================================= ENGINE (V-twin)
  const C: V = [0, 0.43, 0.12];
  const tilt = 38 * DEG;
  const cylDirs: V[] = [
    [0, Math.cos(tilt), Math.sin(tilt)],
    [0, Math.cos(tilt), -Math.sin(tilt)],
  ];
  const ENG = GRAPH_L;
  // crankcase
  b.extrude(
    [[-0.19, -0.03], [-0.15, -0.15], [0.1, -0.17], [0.2, -0.1], [0.18, 0.04], [0.06, 0.1], [-0.07, 0.1]],
    { at: C, x: [0, 0, 1], y: [0, 1, 0], thickness: 0.2, bevel: 0.014, bone: frameJ, color: ENG, name: "crankcase" },
  );
  // transmission case
  b.extrude(
    [[-0.1, -0.1], [0.1, -0.1], [0.12, 0.0], [0.08, 0.1], [-0.08, 0.1], [-0.12, 0.0]],
  { at: [0, 0.39, -0.17], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.18, bevel: 0.012, bone: frameJ, color: GRAPH, name: "gearbox" });
  for (const s of [1, -1]) {
    // side cover bumps
    b.lathe([[0, 0],[0.07,0],[0.075,0.01],[0.07,0.02],[0,0.022]], { at: [s * 0.098, 0.37, -0.17], axis: [s, 0, 0], segments: 10, bone: frameJ, color: STEEL_D, name: "gearCover" });
  }
  // primary cover (left): glowing orange ring
  b.lathe(
    [[0, 0], [0.14, 0], [0.152, 0.012], [0.152, 0.036], [0.128, 0.058], [0.06, 0.064], [0, 0.066]],
    { at: [0.1, 0.4, 0.02], axis: [1, 0, 0], segments: 20, bone: frameJ, color: GRAPH, name: "primaryCover" },
  );
  glow(b.lathe([[0.085, 0], [0.108, 0], [0.108, 0.006], [0.085, 0.006]], { at: [0.1 + 0.0615, 0.4, 0.02], axis: [1, 0, 0], segments: 20, bone: frameJ, color: ORANGE, name: "primaryGlow" }), 1);
  b.lathe([[0, 0], [0.05, 0], [0.05, 0.01], [0, 0.012]], { at: [0.1 + 0.0655, 0.4, 0.02], axis: [1, 0, 0], segments: 12, bone: frameJ, color: STEEL, name: "primaryHub" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    bolt(frameJ, STEEL, [0.1 + 0.036, 0.4 + Math.cos(a) * 0.126, 0.02 + Math.sin(a) * 0.126], "x", 0.008);
  }
  part(new THREE.PlaneGeometry(0.1, 0.034), "#ffffff", frameJ, [0.2, 0.3, 0.1], { dir: [1, 0, 0], axis: "z", texture: WARN, name: "engineLabel" });

  // cylinders: finned barrels, finned heads, orange rocker covers
  const finned = (h: number, rCore: number, rFin: number, n: number): OutlinePoint[] => {
    const o: OutlinePoint[] = [[0, 0], [rCore + 0.004, 0]];
    const pitch = h / n;
    for (let i = 0; i < n; i++) {
      const y0 = i * pitch + pitch * 0.1;
      o.push([rCore, y0], [rFin, y0 + 0.003], [rFin, y0 + pitch * 0.5], [rCore, y0 + pitch * 0.5 + 0.003]);
    }
    o.push([rCore + 0.004, h], [0, h]);
    return o;
  };
  for (const [i, d] of cylDirs.entries()) {
    const base: V = [C[0] + d[0] * 0.05, C[1] + d[1] * 0.05, C[2] + d[2] * 0.05];
    b.lathe(finned(0.2, 0.062, 0.08, 7), { at: base, axis: d, segments: 12, bone: frameJ, color: GRAPH, name: `barrel${i}` });
    const hb: V = [C[0] + d[0] * 0.25, C[1] + d[1] * 0.25, C[2] + d[2] * 0.25];
    b.lathe(finned(0.075, 0.07, 0.088, 3), { at: hb, axis: d, segments: 12, bone: frameJ, color: STEEL_D, name: `head${i}` });
    const top: V = [C[0] + d[0] * 0.33, C[1] + d[1] * 0.33, C[2] + d[2] * 0.33];
    const perp: V = [0, -d[2], d[1]];
    b.extrude(
      [[-0.09, -0.065], [0.09, -0.065], [0.1, -0.05], [0.1, 0.05], [0.09, 0.065], [-0.09, 0.065], [-0.1, 0.05], [-0.1, -0.05]],
      { at: top, x: [1, 0, 0], y: perp, thickness: 0.036, bevel: 0.011, bone: frameJ, color: ORANGE, name: `rocker${i}` },
    );
    const tp: V = [top[0], top[1] + d[1] * 0.02, top[2] + d[2] * 0.02];
    for (const sx of [-1, 1])
      for (const sy of [-1, 1])
        bolt(frameJ, STEEL, [tp[0] + sx * 0.07, tp[1] + perp[1] * sy * 0.045, tp[2] + perp[2] * sy * 0.045], "y", 0.008);
    // pushrod tubes
    for (const sx of [-1, 1]) {
      b.rod(
        [sx * 0.058, C[1] + d[1] * 0.06, C[2] + d[2] * 0.06 + (i === 0 ? 0.04 : -0.04)],
        [sx * 0.058, C[1] + d[1] * 0.28 + perp[1] * (i === 0 ? 0.05 : 0.0), C[2] + d[2] * 0.28 + perp[2] * (i === 0 ? 0.05 : 0.0)],
        0.008,
        { bone: frameJ, color: STEEL, name: "pushrod" },
      );
    }
    // spark plug + boot + wire
    const plug: V = [0.06, hb[1] + d[1] * 0.0 + 0.0, hb[2] + d[2] * 0.0];
    b.rod([plug[0], plug[1], plug[2]], [plug[0] + 0.06, plug[1] + 0.02, plug[2]], 0.008, { bone: frameJ, color: STEEL, name: "plug" });
    b.rod([plug[0] + 0.05, plug[1] + 0.017, plug[2]], [plug[0] + 0.085, plug[1] + 0.024, plug[2]], 0.013, { bone: frameJ, color: DARK, name: "plugBoot" });
    b.sweep(catmull([[plug[0] + 0.085, plug[1] + 0.024, plug[2]], [0.16, plug[1] + 0.06, plug[2] * 0.7 + 0.02], [0.12, 0.7, 0.14], [0.06, 0.66, 0.06]]), 0.005, { bone: frameJ, color: ORANGE_D, sides: 5, name: "plugWire" });
  }
  // coil box under the tank
  part(new THREE.BoxGeometry(0.1, 0.045, 0.06), DARK, frameJ, [0.06, 0.66, 0.06], { name: "coil" });

  // carburettor + air cleaner (right)
  b.rod([0, 0.62, 0.12], [-0.17, 0.62, 0.12], 0.032, { bone: frameJ, color: STEEL_D, name: "carb" });
  b.rod([0, 0.62, 0.12], [-0.05, 0.6, 0.275], 0.016, { bone: frameJ, color: STEEL_D, name: "intakeF" });
  b.rod([0, 0.62, 0.12], [-0.05, 0.6, -0.03], 0.016, { bone: frameJ, color: STEEL_D, name: "intakeR" });
  b.lathe(
    [[0, 0], [0.098, 0], [0.114, 0.014], [0.116, 0.05], [0.1, 0.072], [0.05, 0.078], [0, 0.08]],
    { at: [-0.17, 0.62, 0.12], axis: [-1, 0, 0], segments: 18, bone: frameJ, color: GRAPH, name: "airCleaner" },
  );
  glow(b.lathe([[0.06, 0], [0.095, 0], [0.095, 0.006], [0.06, 0.006]], { at: [-0.17 - 0.0685, 0.62, 0.12], axis: [-1, 0, 0], segments: 18, bone: frameJ, color: ORANGE, name: "airGlow" }), 1);
  b.lathe([[0, 0], [0.04, 0], [0.04, 0.012], [0, 0.014]], { at: [-0.17 - 0.0775, 0.62, 0.12], axis: [-1, 0, 0], segments: 10, bone: frameJ, color: STEEL, name: "airHub" });
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    bolt(frameJ, STEEL, [-0.17 - 0.058, 0.62 + Math.cos(a) * 0.105 * 0.88, 0.12 + Math.sin(a) * 0.105 * 0.88], "-x", 0.007);
  }

  // ============================================================= EXHAUST (right side, two pipes with perforated shields)
  const pipeFront = catmull([
    [-0.04, 0.585, 0.365],
    [-0.065, 0.54, 0.47],
    [-0.12, 0.42, 0.51],
    [-0.19, 0.335, 0.4],
    [-0.205, 0.31, 0.1],
    [-0.215, 0.305, -0.3],
    [-0.222, 0.31, -0.56],
  ]);
  const pipeRear = catmull([
    [-0.04, 0.61, -0.12],
    [-0.07, 0.565, -0.2],
    [-0.15, 0.47, -0.23],
    [-0.205, 0.405, -0.35],
    [-0.222, 0.4, -0.56],
  ]);
  const shieldPaint = (L: number, t0: number) =>
    paint((_p, n, s) => {
      void n;
      const along = (s[0] - t0) * L;
      const hole = ((along / 0.016) % 1 + 1) % 1 < 0.5 && (((s[1] / 22.5) % 1) + 1) % 1 < 0.5;
      return hole ? DARK : "#98a2af";
    });
  for (const [name, path, rr, t0] of [["F", pipeFront, 0.027, 0.45], ["R", pipeRear, 0.027, 0.5]] as const) {
    b.sweep(path, (t) => rr + 0.007 * smoothstep(0.55, 1, t), { bone: frameJ, color: (t) => (t < 0.3 ? STEEL_D : STEEL), sides: 10, name: `pipe${name}` });
    b.sweep(path, 0.04, { bone: frameJ, color: shieldPaint(path.length, t0), from: t0, to: 0.93, sides: 10, caps: "none", name: `shield${name}` });
    for (const t of [t0 + 0.02, 0.91]) {
      const q = path.at(t);
      const tg = path.tangentAt(t);
      b.rod([q.x - tg.x * 0.012, q.y - tg.y * 0.012, q.z - tg.z * 0.012], [q.x + tg.x * 0.012, q.y + tg.y * 0.012, q.z + tg.z * 0.012], 0.043, { bone: frameJ, color: ORANGE, name: `clamp${name}` });
    }
    const e = path.at(1);
    const tgE = path.tangentAt(1);
    b.lathe([[0.034, 0], [0.056, 0.1], [0.052, 0.1], [0.03, 0]], { at: [e.x, e.y, e.z], axis: [tgE.x, tgE.y, tgE.z], segments: 12, bone: frameJ, color: GRAPH, name: `tip${name}` });
    glow(b.lathe([[0, 0.02], [0.044, 0.1], [0.044, 0.102], [0, 0.102]], { at: [e.x, e.y, e.z], axis: [tgE.x, tgE.y, tgE.z], segments: 12, bone: frameJ, color: ORANGE_D, name: `tipGlow${name}` }), 1);
    // exhaust flange at head
    const s0 = path.at(0);
    knob(frameJ, STEEL_D, [s0.x, s0.y, s0.z], 0.038);
  }
  // pipe hangers
  for (const [x, y, z] of [[-0.16, 0.37, 0.28], [-0.2, 0.34, -0.1], [-0.2, 0.355, -0.35]] as V[]) {
    b.rod([x + 0.06, y - 0.01, z], [x, y, z], 0.007, { bone: frameJ, color: STEEL_D, name: "hanger" });
  }

  // ============================================================= BELT DRIVE (left)
  {
    const c1: V = [0.215, 0.36, -0.3];
    const r1 = 0.07;
    const c2: V = [0.215, AXR[1], AXR[2]];
    const r2 = 0.137;
    const D = Math.hypot(c2[2] - c1[2], c2[1] - c1[1]);
    const beta = Math.atan2(c2[1] - c1[1], c2[2] - c1[2]);
    const alpha = Math.acos((r1 - r2) / D);
    const pts: V[] = [];
    const circ = (c: V, r: number, a0: number, a1: number, steps: number) => {
      for (let i = 0; i <= steps; i++) {
        const a = a0 + ((a1 - a0) * i) / steps;
        pts.push([c[0], c[1] + Math.sin(a) * r, c[2] + Math.cos(a) * r]);
      }
    };
    circ(c2, r2, beta - alpha, beta + alpha, 8);
    circ(c1, r1, beta + alpha, beta - alpha + Math.PI * 2, 10);
    // drop duplicate end point at the seam
    pts.pop();
    const beltPath = catmull(pts, { closed: true });
    const beltPaint = paint((_p, n, s) => {
      if (Math.abs(n.x) < 0.7) return ((s[0] * beltPath.length) / 0.014) % 1 < 0.5 ? "#202227" : "#16171a";
      return "#2a2c32";
    });
    b.sweep(beltPath, () => [0.02, 0.007], { bone: frameJ, color: beltPaint, section: "box", name: "belt" });
    // belt guard over the upper run: white plate with an orange rail and bolts
    {
      const ta = beta - alpha; // upper tangent
      const a1: V = [c1[0], c1[1] + Math.sin(ta) * r1, c1[2] + Math.cos(ta) * r1];
      const a2: V = [c2[0], c2[1] + Math.sin(ta) * r2, c2[2] + Math.cos(ta) * r2];
      const len = Math.hypot(a2[2] - a1[2], a2[1] - a1[1]);
      const ux = (a2[2] - a1[2]) / len;
      const uy = (a2[1] - a1[1]) / len;
      // run points in (z, y), trimmed to leave the pulleys visible
      const q0: [number, number] = [a1[2] + ux * 0.06, a1[1] + uy * 0.06];
      const q1: [number, number] = [a2[2] - ux * 0.1, a2[1] - uy * 0.1];
      const guardOutline: OutlinePoint[] = [
        [q0[0], q0[1] - 0.024],
        [q1[0] + 0.04, q1[1] - 0.03],
        [q1[0], q1[1] + 0.03],
        [q0[0] - 0.03, q0[1] + 0.032],
      ];
      b.extrude(guardOutline, { at: [0.239, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.01, bevel: 0.003, bone: frameJ, color: WHITE, name: "beltGuard" });
      b.extrude(
        [
          [q0[0] - 0.01, q0[1] + 0.012],
          [q1[0] + 0.01, q1[1] + 0.008],
          [q1[0] + 0.01, q1[1] + 0.016],
          [q0[0] - 0.01, q0[1] + 0.02],
        ],
        { at: [0.2455, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.004, color: ORANGE, name: "beltGuardStripe" },
      );
    }
    // front drive pulley
    b.lathe([[0.0, -0.018], [0.065, -0.018], [0.07, -0.01], [0.07, 0.01], [0.065, 0.018], [0.0, 0.018]], { at: c1, axis: [1, 0, 0], segments: 14, bone: frameJ, color: STEEL, name: "drivePulley" });
    b.rod([0.1, c1[1], c1[2]], [0.2, c1[1], c1[2]], 0.02, { bone: frameJ, color: STEEL_D, name: "driveShaft" });
    glow(b.lathe([[0.0, 0.0], [0.04, 0.0], [0.04, 0.004], [0.0, 0.004]], { at: [c1[0] + 0.022, c1[1], c1[2]], axis: [1, 0, 0], segments: 10, bone: frameJ, color: ORANGE, name: "driveGlow" }), 1);
    // idler / tensioner
    b.lathe([[0, -0.012], [0.026, -0.012], [0.026, 0.012], [0, 0.012]], { at: [0.215, 0.405, -0.55], axis: [1, 0, 0], segments: 10, bone: frameJ, color: GRAPH_L, name: "idler" });
    b.rod([0.17, 0.31, -0.55], [0.215, 0.405, -0.55], 0.008, { bone: frameJ, color: STEEL_D });
  }

  // ============================================================= TANK (loft) + CAP
  const tankPaint = paint((p, n, s) => {
    const a = Math.min(s[1], 360 - s[1]);
    const u = p.z + (p.y - 0.88) * 1.1;
    const seam = Math.abs(p.z - 0.42) < 0.0022 && a > 8 || (Math.abs(p.x) < 0.0022 && a < 8) || (Math.abs(p.z + 0.04) < 0.0022);
    if (seam) return "#1d2026";
    if (a > 150) return DARK;
    // orange diagonal slash with thin white pin-stripe
    if (a > 22 && a < 150 && u > 0.1 && u < 0.17) return ORANGE;
    if (a > 22 && a < 150 && u > 0.182 && u < 0.19) return ORANGE;
    if (a >= 66 && a < 69) return ORANGE;
    if (a >= 69) return mix(GRAPH, "#515c6d", smoothstep(90, 150, a));
    return mix("#f6f8fa", "#cdd4dc", smoothstep(0.8, 0.15, n.y));
  });
  const tank = b.loft(
    [
      { at: [0, 0.95, 0.56], w: 0.15, h: 0.15 },
      { at: [0, 0.935, 0.45], w: 0.25, h: 0.22 },
      { at: [0, 0.915, 0.28], w: 0.32, h: 0.25 },
      { at: [0, 0.88, 0.08], w: 0.31, h: 0.23 },
      { at: [0, 0.835, -0.09], w: 0.2, h: 0.15 },
    ],
    { bone: frameJ, color: tankPaint, name: "tank", detail: 1.1 },
  );
  // filler cap with orange glow ring
  const capAt: V = [0, 1.03, 0.3];
  b.lathe([[0, 0], [0.046, 0], [0.05, 0.006], [0.05, 0.014], [0.04, 0.02], [0, 0.022]], { at: capAt, axis: [0, 1, 0], segments: 12, bone: frameJ, color: STEEL, name: "tankCap" });
  glow(b.lathe([[0.03, 0.021], [0.038, 0.021], [0.038, 0.0235], [0.03, 0.0235]], { at: capAt, axis: [0, 1, 0], segments: 12, bone: frameJ, color: ORANGE, name: "capGlow" }), 1);
  b.rod([capAt[0], capAt[1] + 0.012, capAt[2] - 0.03], [capAt[0], capAt[1] + 0.02, capAt[2] + 0.03], 0.007, { bone: frameJ, color: STEEL_D, name: "capBar" });
  for (const s of [1, -1]) {
    b.decal(tank, EMBLEM, { at: [s * 0.16, 0.92, 0.32], dir: [s, 0, 0], size: [0.13, 0.13], mirror: s < 0, name: "tankEmblem" });
    // tank mounting bolts
    bolt(frameJ, STEEL, [s * 0.04, 0.835, 0.5], "y", 0.008);
  }
  // fuel line + tap
  b.rod([-0.06, 0.8, 0.15], [-0.075, 0.74, 0.14], 0.007, { bone: frameJ, color: STEEL_D, name: "fuelTap" });
  b.sweep(catmull([[-0.075, 0.74, 0.14], [-0.1, 0.68, 0.16], [-0.12, 0.64, 0.13]]), 0.0045, { bone: frameJ, color: DARK, sides: 5, name: "fuelLine" });
  knob(frameJ, ORANGE, [-0.06, 0.8, 0.15], 0.012);

  // ============================================================= SEAT (loft) + springs
  const seatPaint = paint((p, n, s) => {
    const a = Math.min(s[1], 360 - s[1]);
    if (a > 40 && a < 43.5 && ((s[0] * 0.62) / 0.022) % 1 < 0.65) return ORANGE;
    if (a < 38 && n.y > 0.35) {
      const q = (((p.z * 1.0) / 0.075) % 1 + 1) % 1;
      if (q < 0.05) return "#1a1e24";
      return mix("#5e6878", "#4b5463", smoothstep(0.05, 0.9, q));
    }
    return "#2c3139";
  });
  b.loft(
    [
      { at: [0, 0.763, 0.01], w: 0.22, h: 0.06 },
      { at: [0, 0.752, -0.1], w: 0.3, h: 0.085 },
      { at: [0, 0.74, -0.32], w: 0.31, h: 0.085 },
      { at: [0, 0.72, -0.5], w: 0.2, h: 0.06 },
    ],
    { bone: frameJ, color: seatPaint, name: "seat", detail: 1.1 },
  );
  for (const s of [1, -1]) {
    b.sweep(
      spiral([s * 0.065, 0.72, 0.0], [s * 0.065 + 0.028, 0.72, 0.0], [0, -1, 0], { turns: 5, r1: 0.028, pitch: 0.02 }),
      0.0035,
      { bone: frameJ, color: STEEL, sides: 4, name: "seatSpring" },
    );
    b.rod([s * 0.065, 0.72, 0.0], [s * 0.065, 0.78, 0.0], 0.006, { bone: frameJ, color: STEEL_D, name: "springPost" });
    b.rod([s * 0.065, 0.62, 0.0], [s * 0.065, 0.72, 0.0], 0.005, { bone: frameJ, color: STEEL_D, name: "springPostLow" });
  }

  // ============================================================= REAR FENDER, TAIL, PLATE
  {
    const R = 0.37;
    const pts: V[] = [];
    for (let a = 58; a >= -72; a -= 10) pts.push([0, AXR[1] + R * Math.cos(a * DEG), AXR[2] + R * Math.sin(a * DEG)]);
    const rfPaint = paint((p, n, s) => {
      const ax = Math.abs(p.x);
      if (ax > 0.128) return GRAPH;
      if (Math.abs(s[0] - 0.5) < 0.004 || Math.abs(s[0] - 0.8) < 0.004) return "#2a2f38";
      if (n.y < -0.2) return GRAPH;
      if (ax > 0.034 && ax < 0.05) return ORANGE;
      if (ax < 0.016) return ORANGE;
      return mix("#f6f8fa", "#c9d0d8", smoothstep(0.9, -0.1, n.y));
    });
    const fpath = catmull(pts);
    b.sweep(fpath, () => [0.155, 0.034], { bone: frameJ, color: rfPaint, sides: 12, caps: "flat", name: "rearFender" });
    // fender struts to the rails
    for (const s of [1, -1]) {
      b.rod([s * 0.12, AXR[1] + R * Math.cos(30 * DEG) - 0.01, AXR[2] + R * Math.sin(30 * DEG)], [s * 0.17, 0.5, -0.62], 0.009, { bone: frameJ, color: STEEL_D, name: "fenderStrut" });
      b.rod([s * 0.12, AXR[1] + R * Math.cos(-45 * DEG) - 0.01, AXR[2] + R * Math.sin(-45 * DEG)], [s * 0.17, AXR[1] + 0.1, AXR[2] - 0.04], 0.009, { bone: frameJ, color: STEEL_D, name: "fenderStrutR" });
      bolt(frameJ, STEEL, [s * 0.1, AXR[1] + R * Math.cos(50 * DEG) + 0.012, AXR[2] + R * Math.sin(50 * DEG)], "y", 0.008);
      bolt(frameJ, STEEL, [s * 0.1, AXR[1] + R * Math.cos(-28 * DEG) + 0.012, AXR[2] + R * Math.sin(-28 * DEG)], "y", 0.008);
    }
    // tail light cluster (glowing), plate and reflectors sit on the fender's rear surface
    const surf = (aDeg: number, lift: number): { at: V; n: V } => {
      const ny = Math.cos(aDeg * DEG);
      const nz = Math.sin(aDeg * DEG);
      return { at: [0, AXR[1] + (R + 0.034 + lift) * ny, AXR[2] + (R + 0.034 + lift) * nz], n: [0, ny, nz] };
    };
    const lt = surf(-50, -0.006);
    glow(part(new THREE.BoxGeometry(0.15, 0.045, 0.014), "#e8620c", frameJ, lt.at, { dir: lt.n, axis: "z", name: "tailLight" }), 1);
    const pl = surf(-69, -0.004);
    part(new THREE.PlaneGeometry(0.15, 0.08), "#ffffff", frameJ, pl.at, { dir: pl.n, axis: "z", texture: PLATE, name: "plate" });
    for (const s of [1, -1]) {
      const rf = surf(-30, -0.006);
      part(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 8), ORANGE_D, frameJ, [s * 0.1, rf.at[1], rf.at[2]], { dir: rf.n, name: "reflector" });
    }
  }

  // sissy bar + pad
  {
    const sp = catmull([
      [0.17, 0.55, -0.58],
      [0.205, 0.74, -0.66],
      [0.18, 0.98, -0.74],
      [0.1, 1.09, -0.77],
      [0, 1.1, -0.78],
      [-0.1, 1.09, -0.77],
      [-0.18, 0.98, -0.74],
      [-0.205, 0.74, -0.66],
      [-0.17, 0.55, -0.58],
    ]);
    b.sweep(sp, 0.012, { bone: frameJ, color: STEEL, sides: 8, name: "sissyBar" });
    b.extrude(
      [[-0.15, -0.05], [0.15, -0.05], [0.17, 0], [0.15, 0.05], [-0.15, 0.05], [-0.17, 0]],
      { at: [0, 0.99, -0.735], x: [1, 0, 0], y: [0, 1, 0.14], thickness: 0.05, bevel: 0.016, bone: frameJ, color: GRAPH, name: "sissyPad" },
    );
    b.extrude(
      [[-0.14, -0.012], [0.14, -0.012], [0.14, 0.012], [-0.14, 0.012]],
      { at: [0, 0.998, -0.7105], x: [1, 0, 0], y: [0, 1, 0.14], thickness: 0.008, color: ORANGE, name: "sissyStripe" },
    );
    for (const s of [1, -1]) knob(frameJ, ORANGE, [s * 0.206, 0.74, -0.66], 0.016);
  }

  // ============================================================= OIL TANK, BATTERY, FOOT CONTROLS, KICKSTAND
  b.lathe([[0, 0], [0.07, 0], [0.075, 0.01], [0.075, 0.2], [0.07, 0.21], [0, 0.22]], { at: [0.13, 0.48, -0.5], axis: [0, 0, 1], segments: 14, bone: frameJ, color: GRAPH, name: "oilTank" });
  b.lathe([[0.072, 0.06], [0.0775, 0.06], [0.0775, 0.075], [0.072, 0.075]], { at: [0.13, 0.48, -0.5], axis: [0, 0, 1], segments: 14, bone: frameJ, color: ORANGE, name: "oilBand" });
  part(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 8), STEEL, frameJ, [0.13, 0.548, -0.4], { name: "oilCap" });
  part(new THREE.BoxGeometry(0.11, 0.12, 0.17), GRAPH, frameJ, [-0.13, 0.5, -0.38], { name: "battery" });
  part(new THREE.BoxGeometry(0.114, 0.018, 0.174), ORANGE, frameJ, [-0.13, 0.553, -0.38], { name: "batteryStrap" });
  b.sweep(catmull([[0.08, 0.48, -0.4], [0.02, 0.5, -0.35], [-0.05, 0.5, -0.38]]), 0.005, { bone: frameJ, color: ORANGE_D, sides: 5, name: "cable" });
  // pegs
  for (const s of [1, -1]) {
    const peg: V = [s * 0.27, 0.3, 0.64];
    b.rod([s * 0.12, 0.33, 0.5], [s * 0.23, 0.3, 0.63], 0.012, { bone: frameJ, color: STEEL_D, name: "pegArm" });
    b.rod([s * 0.03, 0.31, 0.42], [s * 0.12, 0.33, 0.5], 0.022, { bone: frameJ, color: GRAPH_L, name: "pegMount" });
    b.rod([s * 0.22, 0.3, 0.64], peg, 0.02, { bone: frameJ, color: STEEL, name: "peg" });
    for (let i = 0; i < 4; i++) b.rod([s * (0.225 + i * 0.012), 0.3, 0.64], [s * (0.229 + i * 0.012), 0.3, 0.64], 0.0235, { bone: frameJ, color: GRAPH, name: "pegRib" });
    knob(frameJ, ORANGE, [s * 0.275, 0.3, 0.64], 0.016);
  }
  // shifter + brake pedal
  b.sweep(catmull([[0.1, 0.34, 0.14], [0.17, 0.345, 0.3], [0.205, 0.325, 0.44]]), 0.007, { bone: frameJ, color: STEEL_D, sides: 6, name: "shiftRod" });
  part(new THREE.BoxGeometry(0.04, 0.012, 0.07), ORANGE_D, frameJ, [0.205, 0.312, 0.465], { name: "shiftPad" });
  b.rod([-0.12, 0.33, 0.5], [-0.3, 0.3, 0.56], 0.009, { bone: frameJ, color: STEEL_D, name: "brakePedalArm" });
  part(new THREE.BoxGeometry(0.04, 0.012, 0.08), GRAPH, frameJ, [-0.3, 0.292, 0.565], { name: "brakePad" });
  // kickstand (folded), hinges on its own joint
  b.sweep(catmull([[0.17, 0.27, -0.12], [0.26, 0.27, -0.14], [0.31, 0.27, -0.28], [0.32, 0.27, -0.42]]), 0.011, { bone: kick, color: STEEL_D, sides: 6, name: "kickLeg" });
  part(new THREE.BoxGeometry(0.06, 0.012, 0.09), ORANGE, kick, [0.32, 0.27, -0.45], { name: "kickFoot" });
  b.lathe([[0, 0], [0.026, 0], [0.026, 0.02], [0, 0.02]], { at: [0.17, 0.27, -0.12], axis: [1, 0, 0], segments: 8, bone: kick, color: GRAPH_L, name: "kickPivot" });
  // rear brake caliper + hose
  part(new THREE.BoxGeometry(0.036, 0.07, 0.05), ORANGE, frameJ, [-0.215, AXR[1] + 0.07, AXR[2] + 0.145], { name: "rearCaliper" });
  b.rod([-0.17, AXR[1] + 0.04, AXR[2] + 0.14], [-0.215, AXR[1] + 0.07, AXR[2] + 0.145], 0.01, { bone: frameJ, color: GRAPH_L, name: "rearCaliperArm" });
  b.sweep(catmull([[-0.215, AXR[1] + 0.1, AXR[2] + 0.15], [-0.18, 0.5, -0.4], [-0.13, 0.4, -0.2], [-0.16, 0.32, 0.3]]), 0.005, { bone: frameJ, color: DARK, sides: 5, name: "rearHose" });

  // ============================================================= COOLING, CABLES, WIRING
  const radPaint = paint((_p, n, s) => {
    if (Math.abs(n.z) < 0.5) return GRAPH;
    if (Math.abs(s[0]) > 0.064 || Math.abs(s[1]) > 0.074) return ORANGE;
    return ((s[1] / 0.011) % 1 + 1) % 1 < 0.55 ? "#566073" : "#98a3b5";
  });
  b.extrude(
    [[-0.075, -0.085], [0.075, -0.085], [0.075, 0.085], [-0.075, 0.085]],
    { at: [0, 0.5, 0.625], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.034, bevel: 0.007, bone: frameJ, color: radPaint, name: "radiator" },
  );
  for (const s of [1, -1]) {
    bolt(frameJ, STEEL, [s * 0.082, 0.585, 0.625], s > 0 ? "x" : "-x", 0.008);
    bolt(frameJ, STEEL, [s * 0.082, 0.415, 0.625], s > 0 ? "x" : "-x", 0.008);
    b.sweep(catmull([[s * 0.078, 0.57, 0.625], [s * 0.12, 0.62, 0.5], [s * 0.1, 0.65, 0.34], [s * 0.05, 0.66, 0.29]]), 0.011, { bone: frameJ, color: ORANGE_D, sides: 6, name: "coolantHose" });
  }
  b.sweep(catmull([[-0.4, gripY + 0.003, 0.42], [-0.3, 1.14, 0.51], [-0.22, 0.98, 0.5], [-0.17, 0.78, 0.4], [-0.1, 0.66, 0.2], [-0.1, 0.63, 0.12]]), 0.0045, { bone: steer, color: DARK, sides: 5, name: "throttleCable" });
  b.sweep(catmull([[0.385, gripY - 0.012, 0.5], [0.3, 1.12, 0.52], [0.22, 0.92, 0.5], [0.18, 0.7, 0.3], [0.14, 0.5, 0.12]]), 0.0045, { bone: steer, color: DARK, sides: 5, name: "clutchCable" });
  b.sweep(catmull([[0.01, 0.885, 0.62], [0.01, 0.8, 0.46], [0.01, 0.715, 0.12], [0.01, 0.63, -0.2], [0.01, 0.58, -0.45], [0.02, 0.55, -0.75], [0, 0.52, -1.0]]), 0.008, { bone: frameJ, color: DARK, sides: 6, name: "harness" });

  // ============================================================= BRAND TOUCHES
  // orange LED underglow strip along the frame cradle
  for (const s of [1, -1])
    glow(b.sweep(catmull([[s * 0.125, 0.235, 0.28], [s * 0.145, 0.235, 0.0], [s * 0.165, 0.25, -0.38]]), 0.006, { bone: frameJ, color: ORANGE, sides: 5, name: "underglow" }), 1);
  // tank-side knee badge lines and headlamp bolts get merged studs
  for (const s of [1, -1]) {
    for (const [x, y, z] of [[s * 0.152, 0.945, 0.42], [s * 0.152, 0.9, 0.18]] as V[]) knob(frameJ, STEEL, [x, y, z], 0.007);
  }
  // belly bash plate with an orange stripe
  b.extrude(
    [[-0.115, -0.2], [0.115, -0.2], [0.125, -0.15], [0.125, 0.22], [0.1, 0.26], [-0.1, 0.26], [-0.125, 0.22], [-0.125, -0.15]],
    { at: [0, 0.243, 0.1], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.014, bevel: 0.004, bone: frameJ, color: WHITE, name: "bashPlate" },
  );
  b.extrude(
    [[-0.02, -0.15], [0.02, -0.15], [0.02, 0.2], [-0.02, 0.2]],
    { at: [0, 0.2495, 0.1], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.004, color: ORANGE, name: "bashStripe" },
  );
  // oil filter canister + lines
  b.lathe([[0, 0], [0.04, 0], [0.042, 0.01], [0.042, 0.085], [0.036, 0.095], [0, 0.097]], { at: [0.1, 0.33, 0.3], axis: [1, 0, 0], segments: 10, bone: frameJ, color: ORANGE, name: "oilFilter" });
  b.lathe([[0, 0], [0.036, 0], [0.036, 0.008], [0, 0.008]], { at: [0.197, 0.33, 0.3], axis: [1, 0, 0], segments: 8, bone: frameJ, color: GRAPH, name: "filterCap" });
  b.sweep(catmull([[0.12, 0.36, 0.3], [0.12, 0.45, 0.22], [0.1, 0.5, 0.0], [0.08, 0.52, -0.2], [0.13, 0.5, -0.35]]), 0.006, { bone: frameJ, color: GRAPH_L, sides: 5, name: "oilLine" });
  // crankcase cooling ribs
  for (const s of [1, -1])
    for (let i = 0; i < 5; i++)
      bucketFor(frameJ, GRAPH).geos.push(new THREE.BoxGeometry(0.012, 0.11, 0.014).translate(s * 0.103, 0.36, -0.03 + i * 0.045));

  flush();
  return b.root;
}
