import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import type { Fill } from "../../../../src/context";
import { DEG } from "../../../../src/math";
import { paint } from "../../../../src/paint";
import type { PartOptions } from "../../../../src/parts";
import { catmull } from "../../../../src/path";
import type { Joint } from "../../../../src/skeleton";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "Long-fork hardtail chopper with ape hangers, V-twin engine, belt drive and a fat rear tyre, in clean Overwatch-style colour blocking: graphite and white with one strong orange accent and glowing rim lines.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const ORANGE = "#ff7a1a";
const WHITE = "#f2f4f7";
const GRAPH = "#2b303b";
const GRAPH_L = "#444b59";
const BLACK = "#15171c";
const STEEL = "#aeb6c2";
const CHROME = "#dfe6ee";
const LEATHER = "#4a2e22";
const TIRE = "#1c1e24";
const TIRE2 = "#2a2d34";
const GLOWO = "#ff9a2e";
const HEADL = "#eaf8ff";
const RED = "#ff3a3a";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export default function build() {
  const b = createBuilder({ name: "chopper" });

  // ---------- skeleton ----------
  const frameJ = b.joint("frame", { at: [0, 0.6, 0] });
  const T1 = v(0, 0.93, 0.82);
  const AXF = v(0, 0.325, 1.25);
  const FD = AXF.clone().sub(T1).normalize();
  const AXR = v(0, 0.38, -0.85);
  const steer = b.joint("steer", { parent: frameJ, at: T1, dir: FD, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: frameJ, at: AXR, dir: [1, 0, 0], role: "hinge" });
  const kick = b.joint("kickstand", { parent: frameJ, at: [0.19, 0.34, -0.3], dir: [0, -0.05, -1], role: "hinge" });

  // ---------- helpers ----------
  type P3 = number[] | THREE.Vector3;
  const box = (bone: Joint, color: Fill, at: P3, size: number[], o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(size[0], size[1], size[2]), color, { bone, at, ...o });
  const cyl = (bone: Joint, color: Fill, at: P3, r: number | number[], len: number, dir: P3, seg = 8, o: PartOptions = {}) => {
    const [rt, rb] = typeof r === "number" ? [r, r] : [r[0], r[1]];
    return b.part(new THREE.CylinderGeometry(rt, rb, len, seg, 1), color, { bone, at, dir, ...o });
  };
  const ball = (bone: Joint, color: Fill, at: P3, r: number, scale: number | number[] = 1, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, Math.max(4, Math.round(seg / 2))), color, { bone, at, scale });
  const rod = (bone: Joint, a: P3, c: P3, r: number | [number, number], color: Fill, sides = 6) =>
    b.rod(a, c, r, color, { bone, sides });
  const tube = (bone: Joint, pts: P3[], r: number | [number, number], color: Fill, sides = 8) =>
    b.sweep(catmull(pts), r, color, { bone, sides });
  const X: number[] = [1, 0, 0];
  const Z: number[] = [0, 0, 1];

  // ---------- wheels ----------
  const tireAt = (bone: Joint, c: THREE.Vector3, R: number, tr: number, wScale: number) => {
    const tread = paint((_p, _n, s) => (Math.floor(s[0] * 28) % 2 ? TIRE : TIRE2));
    b.part(new THREE.TorusGeometry(R, tr, 8, 28), tread, { bone, at: c, rotation: [0, 90, 0], scale: [1, 1, wScale] });
  };
  const wheel = (
    bone: Joint,
    c: THREE.Vector3,
    R: number,
    tr: number,
    wScale: number,
    rimR: number,
    hubR: number,
    n: number,
    spokeX: number,
    spokeR: [number, number],
    spokeColor: Fill,
  ) => {
    tireAt(bone, c, R, tr, wScale);
    const half = tr * wScale;
    for (const s of [1, -1]) {
      b.part(new THREE.TorusGeometry(rimR, 0.02, 6, 24), STEEL, {
        bone,
        at: c.clone().add(v(s * half * 0.55, 0, 0)),
        rotation: [0, 90, 0],
      });
      glow(
        b.part(new THREE.TorusGeometry(rimR - 0.035, 0.009, 4, 28), GLOWO, {
          bone,
          at: c.clone().add(v(s * half * 0.78, 0, 0)),
          rotation: [0, 90, 0],
        }),
        1.4,
      );
      cyl(bone, STEEL, c.clone().add(v(s * (half * 0.9 + 0.012), 0, 0)), hubR * 0.55, 0.024, X, 8);
      for (let i = 0; i < n; i++) {
        const th = (i * 2 * Math.PI) / n + (s > 0 ? 0 : Math.PI / n);
        const a = c.clone().add(v(s * spokeX, hubR * Math.cos(th), hubR * Math.sin(th)));
        const e = c.clone().add(v(s * spokeX, rimR * Math.cos(th), rimR * Math.sin(th)));
        rod(bone, a, e, spokeR, spokeColor, 4);
      }
    }
    cyl(bone, GRAPH, c, hubR, half * 1.8, X, 10);
    cyl(bone, ORANGE, c, hubR * 0.7, half * 1.8 + 0.03, X, 8);
  };

  wheel(wheelF, AXF, 0.27, 0.055, 1.1, 0.222, 0.05, 10, 0.02, [0.007, 0.005], GRAPH_L);
  wheel(wheelR, AXR, 0.27, 0.11, 1.25, 0.17, 0.06, 6, 0.06, [0.024, 0.016], GRAPH_L);
  // front rotor
  cyl(wheelF, STEEL, AXF.clone().add(v(0.05, 0, 0)), 0.13, 0.008, X, 16);
  cyl(wheelF, ORANGE, AXF.clone().add(v(0.055, 0, 0)), 0.06, 0.006, X, 10);
  // rear pulley
  cyl(wheelR, STEEL, AXR.clone().add(v(0.185, 0, 0)), 0.13, 0.04, X, 16);
  cyl(wheelR, ORANGE, AXR.clone().add(v(0.208, 0, 0)), 0.09, 0.008, X, 12);
  cyl(wheelR, STEEL, AXR.clone().add(v(0.15, 0, 0)), 0.04, 0.05, X, 8);

  // ---------- frame ----------
  tube(frameJ, [v(0, 0.97, 0.74), v(0, 0.91, 0.25), v(0, 0.81, -0.3), v(0, 0.74, -0.52)], 0.026, GRAPH);
  tube(frameJ, [v(0, 0.94, 0.74), v(0, 0.7, 0.52), v(0, 0.48, 0.3), v(0, 0.36, 0.1)], 0.026, GRAPH);
  for (const s of [1, -1]) {
    tube(
      frameJ,
      [v(s * 0.07, 0.9, 0.72), v(s * 0.12, 0.62, 0.5), v(s * 0.15, 0.4, 0.28), v(s * 0.15, 0.33, -0.1), v(s * 0.15, 0.38, -0.4), v(s * 0.15, 0.45, -0.6)],
      0.022,
      GRAPH,
    );
    tube(frameJ, [v(s * 0.15, 0.45, -0.6), v(s * 0.15, 0.4, -0.85)], 0.022, GRAPH);
    tube(frameJ, [v(0, 0.74, -0.52), v(s * 0.12, 0.6, -0.7), v(s * 0.15, 0.42, -0.85)], 0.022, GRAPH);
    box(frameJ, STEEL, v(s * 0.15, 0.38, -0.85), [0.022, 0.12, 0.14]);
    ball(frameJ, STEEL, v(s * 0.15, 0.38, -0.85), 0.03, 1, 8);
    // foot pegs
    rod(frameJ, v(s * 0.15, 0.36, 0.38), v(s * 0.26, 0.3, 0.56), 0.016, CHROME);
    cyl(frameJ, STEEL, v(s * 0.3, 0.3, 0.56), 0.02, 0.12, X, 8);
    cyl(frameJ, ORANGE, v(s * 0.36, 0.3, 0.56), 0.022, 0.03, X, 8);
  }
  // steering head and fork
  cyl(frameJ, GRAPH, T1.clone().addScaledVector(FD, -0.06), 0.045, 0.22, FD, 10);
  cyl(frameJ, ORANGE, T1.clone().addScaledVector(FD, -0.17), 0.048, 0.02, FD, 10);
  box(steer, GRAPH_L, T1.clone().addScaledVector(FD, 0.03), [0.24, 0.04, 0.09], { dir: FD });
  box(steer, GRAPH_L, T1.clone().addScaledVector(FD, -0.17), [0.24, 0.04, 0.09], { dir: FD });
  for (const s of [1, -1]) {
    const off = v(s * 0.09, 0, 0);
    const top = T1.clone().addScaledVector(FD, -0.17).add(off);
    const bot = AXF.clone().add(off);
    const mid = top.clone().lerp(bot, 0.55);
    rod(steer, top, mid, 0.021, CHROME, 8);
    cyl(steer, RED === "" ? RED : "#15171c", mid, 0.03, 0.05, FD, 8);
    rod(steer, mid, bot, 0.028, GRAPH, 8);
    cyl(steer, CHROME, bot.clone().addScaledVector(FD, -0.04), 0.03, 0.06, FD, 8);
    cyl(wheelF, STEEL, AXF.clone().add(v(s * 0.115, 0, 0)), 0.03, 0.03, X, 8);
    // headlight bracket
    rod(steer, v(s * 0.09, 0.98, 0.785), v(s * 0.075, 0.98, 0.97), 0.012, STEEL);
  }
  box(steer, ORANGE, v(0.075, 0.43, 1.16), [0.03, 0.09, 0.06]);
  box(steer, GRAPH, v(0.075, 0.5, 1.16), [0.02, 0.04, 0.04]);

  // front fender
  const frontFender = paint((p) => (Math.abs(p.x) < 0.012 ? WHITE : ORANGE));
  const ffPts: THREE.Vector3[] = [];
  for (const a of [-60, -35, -10, 15, 38, 56]) ffPts.push(v(0, AXF.y + 0.385 * Math.cos(a * DEG), AXF.z + 0.385 * Math.sin(a * DEG)));
  b.sweep(catmull(ffPts), () => [0.06, 0.01], { bone: steer, section: "box", caps: "flat", color: frontFender });

  // headlight
  cyl(steer, GRAPH, v(0, 0.98, 0.99), 0.078, 0.14, Z, 12);
  b.part(new THREE.TorusGeometry(0.08, 0.012, 6, 16), CHROME, { bone: steer, at: v(0, 0.98, 1.06) });
  glow(cyl(steer, HEADL, v(0, 0.98, 1.062), 0.07, 0.01, Z, 14), 1.4);

  // handlebars
  const gaugeAt = v(0, 1.11, 0.7);
  const toRider = v(0, 0.5, -1).normalize();
  cyl(steer, GRAPH, gaugeAt, 0.048, 0.03, toRider, 12);
  glow(cyl(steer, GLOWO, gaugeAt.clone().addScaledVector(toRider, 0.016), 0.036, 0.006, toRider, 12), 1.2);
  box(steer, GRAPH_L, v(0, 1.07, 0.73), [0.2, 0.03, 0.06]);
  for (const s of [1, -1]) {
    const pts = [v(s * 0.07, 1.06, 0.73), v(s * 0.2, 1.1, 0.71), v(s * 0.34, 1.28, 0.66), v(s * 0.4, 1.42, 0.6), v(s * 0.43, 1.47, 0.5)];
    tube(steer, pts, 0.0125, CHROME);
    rod(steer, pts[3].clone().lerp(pts[4], 0.25), pts[4], 0.021, BLACK, 8);
    cyl(steer, ORANGE, pts[4].clone().add(v(s * 0.004, 0.004, -0.012)), 0.024, 0.014, pts[4].clone().sub(pts[3]), 8);
    // levers
    rod(steer, v(s * 0.4, 1.43, 0.6), v(s * 0.36, 1.41, 0.76), 0.007, CHROME, 5);
    ball(steer, ORANGE, v(s * 0.36, 1.41, 0.77), 0.012, 1, 6);
    // mirrors
    rod(steer, v(s * 0.4, 1.42, 0.6), v(s * 0.47, 1.56, 0.54), 0.007, CHROME, 5);
    cyl(steer, GRAPH, v(s * 0.47, 1.6, 0.52), 0.045, 0.016, v(0, 0.3, -1), 12);
    cyl(steer, "#bfd9ee", v(s * 0.47, 1.6, 0.512), 0.036, 0.006, v(0, 0.3, -1), 12);
  }
  // brake line
  tube(steer, [v(0.34, 1.3, 0.66), v(0.18, 1.05, 0.8), v(0.13, 0.75, 0.98), v(0.085, 0.43, 1.16)], 0.006, BLACK, 5);

  // ---------- tank ----------
  const tankPaint = paint((p, n) => {
    const edge = 0.965 - 0.05 * (p.z - 0.2);
    if (p.y < edge - 0.012) return GRAPH;
    if (p.y < edge) return WHITE;
    if (n.y > 0.3 && Math.abs(p.x) < 0.022) return WHITE;
    if (n.y > 0.3 && Math.abs(Math.abs(p.x) - 0.04) < 0.007) return GRAPH;
    return ORANGE;
  });
  const tank = b.loft(
    [
      { at: [0, 1.02, 0.58], w: 0.16, h: 0.17 },
      { at: [0, 1.04, 0.42], w: 0.3, h: 0.24 },
      { at: [0, 1.03, 0.22], w: 0.3, h: 0.25 },
      { at: [0, 1.0, 0.02], w: 0.22, h: 0.2 },
      { at: [0, 0.96, -0.1], w: 0.1, h: 0.12 },
    ],
    { bone: frameJ, color: tankPaint, sides: 12 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 120 60"><path d="M6 8 L40 8 L58 30 L40 52 L6 52 L24 30 Z" fill="#f2f4f7"/><path d="M48 8 L66 8 L84 30 L66 52 L48 52 L66 30 Z" fill="#2b303b"/><path d="M76 8 L88 8 L106 30 L88 52 L76 52 L94 30 Z" fill="#f2f4f7"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(tank, emblem, { at: [s * 0.15, 1.04, 0.3], dir: [s, 0, 0], size: [0.2, 0.1], mirror: s > 0 });
  cyl(frameJ, CHROME, v(0, 1.165, 0.3), 0.035, 0.02, [0, 1, 0], 10);
  cyl(frameJ, ORANGE, v(0, 1.176, 0.3), 0.02, 0.006, [0, 1, 0], 8);

  // ---------- seat ----------
  const seatPaint = paint((p, n) => {
    if (n.y > 0.4 && (Math.abs(((((p.z * 16) % 1) + 1) % 1) - 0.5) < 0.04 || Math.abs(p.x) < 0.006)) return ORANGE;
    return LEATHER;
  });
  b.loft(
    [
      { at: [0, 0.86, -0.12], w: 0.16, h: 0.07 },
      { at: [0, 0.86, -0.3], w: 0.3, h: 0.09 },
      { at: [0, 0.84, -0.5], w: 0.28, h: 0.09 },
      { at: [0, 0.84, -0.64], w: 0.2, h: 0.07 },
    ],
    { bone: frameJ, color: seatPaint, sides: 10 },
  );

  // ---------- rear fender ----------
  const rearFender = paint((p) => (Math.abs(p.x) > 0.145 ? GRAPH : Math.abs(p.x) < 0.02 ? WHITE : ORANGE));
  const rfPts: THREE.Vector3[] = [];
  for (const a of [72, 48, 24, 0, -22, -42, -52]) rfPts.push(v(0, AXR.y + 0.47 * Math.cos(a * DEG), AXR.z + 0.47 * Math.sin(a * DEG)));
  b.sweep(catmull(rfPts), () => [0.165, 0.012], { bone: frameJ, section: "box", caps: "flat", color: rearFender });
  const rivets: THREE.BufferGeometry[] = [];
  for (const s of [1, -1])
    for (const a of [60, 40, 20, 0, -20, -40])
      rivets.push(
        new THREE.SphereGeometry(0.01, 6, 4).translate(s * 0.15, AXR.y + 0.484 * Math.cos(a * DEG), AXR.z + 0.484 * Math.sin(a * DEG)),
      );
  const rivetGeo = mergeGeometries(rivets);
  if (rivetGeo) b.part(rivetGeo, STEEL, { bone: frameJ, at: [0, 0, 0] });
  for (const s of [1, -1]) rod(frameJ, v(s * 0.15, 0.71, -0.52), v(s * 0.12, 0.62, -0.66), 0.012, STEEL);
  box(frameJ, WHITE, v(0, 0.56, -1.215), [0.16, 0.1, 0.01], { dir: [0, 0.15, -1], axis: "z" });
  box(frameJ, GRAPH, v(0, 0.56, -1.222), [0.18, 0.12, 0.006], { dir: [0, 0.15, -1], axis: "z" });
  glow(box(frameJ, RED, v(0, 0.69, -1.228), [0.07, 0.03, 0.03]), 1.4);

  // ---------- engine ----------
  box(frameJ, GRAPH_L, v(0, 0.44, 0.18), [0.3, 0.24, 0.34]);
  box(frameJ, STEEL, v(0, 0.31, 0.18), [0.2, 0.07, 0.28]);
  box(frameJ, GRAPH, v(0, 0.42, -0.05), [0.28, 0.22, 0.22]);
  cyl(frameJ, STEEL, v(0.19, 0.42, -0.02), 0.13, 0.05, X, 14);
  cyl(frameJ, ORANGE, v(0.22, 0.42, -0.02), 0.075, 0.012, X, 12);
  const C = v(0, 0.5, 0.2);
  for (const k of [1, -1]) {
    const dir = v(0, 0.93, 0.37 * k).normalize();
    const at = (d: number) => C.clone().addScaledVector(dir, d);
    cyl(frameJ, GRAPH, at(0.13), 0.062, 0.14, dir, 10);
    for (let i = 0; i < 6; i++) cyl(frameJ, GRAPH_L, at(0.08 + i * 0.026), 0.088, 0.012, dir, 10);
    box(frameJ, GRAPH, at(0.25), [0.15, 0.05, 0.12], { dir });
    box(frameJ, ORANGE, at(0.3), [0.2, 0.07, 0.16], { dir });
    for (const sx of [1, -1]) {
      ball(frameJ, CHROME, at(0.338).add(v(sx * 0.075, 0, 0)), 0.014, 1, 6);
      rod(frameJ, at(0.1).add(v(sx * 0.075, 0, 0)), at(0.28).add(v(sx * 0.07, 0, 0)), 0.008, CHROME, 5);
    }
  }
  // air cleaner and intake
  cyl(frameJ, CHROME, v(-0.19, 0.62, 0.2), 0.09, 0.05, X, 14);
  cyl(frameJ, ORANGE, v(-0.222, 0.62, 0.2), 0.05, 0.016, X, 10);
  rod(frameJ, v(-0.17, 0.62, 0.2), v(0, 0.62, 0.2), 0.03, STEEL, 8);
  // exhaust
  const mainPipe = catmull([
    v(-0.04, 0.72, 0.37),
    v(-0.14, 0.58, 0.46),
    v(-0.22, 0.4, 0.42),
    v(-0.24, 0.3, 0.25),
    v(-0.24, 0.3, -0.12),
    v(-0.24, 0.29, -0.55),
    v(-0.23, 0.33, -1.0),
    v(-0.22, 0.4, -1.18),
  ]);
  b.sweep(mainPipe, 0.026, CHROME, { bone: frameJ, sides: 8 });
  tube(frameJ, [v(-0.03, 0.72, 0.02), v(-0.12, 0.6, -0.08), v(-0.2, 0.42, -0.1), v(-0.24, 0.3, -0.12)], 0.026, CHROME);
  rod(frameJ, v(-0.24, 0.3, -0.12), v(-0.24, 0.29, -0.55), 0.038, GRAPH, 8);
  for (const z of [-0.14, -0.33, -0.52]) cyl(frameJ, STEEL, v(-0.24, 0.3, z), 0.042, 0.02, Z, 8);
  cyl(frameJ, BLACK, v(-0.22, 0.4, -1.19), 0.036, 0.02, [0, 0.4, -1], 8);
  // oil tank, battery
  cyl(frameJ, ORANGE, v(-0.19, 0.58, -0.38), 0.07, 0.28, Z, 10);
  cyl(frameJ, GRAPH, v(-0.19, 0.58, -0.3), 0.073, 0.03, Z, 10);
  cyl(frameJ, GRAPH, v(-0.19, 0.58, -0.46), 0.073, 0.03, Z, 10);
  box(frameJ, GRAPH_L, v(0.19, 0.6, -0.38), [0.12, 0.16, 0.26]);
  box(frameJ, ORANGE, v(0.255, 0.6, -0.38), [0.01, 0.04, 0.2]);
  // belt drive
  cyl(frameJ, STEEL, v(0.185, 0.36, -0.1), 0.06, 0.04, X, 12);
  rod(frameJ, v(0.185, 0.42, -0.1), v(0.185, 0.51, -0.85), 0.012, BLACK, 4);
  rod(frameJ, v(0.185, 0.3, -0.1), v(0.185, 0.25, -0.85), 0.012, BLACK, 4);
  // underglow
  for (const s of [1, -1]) glow(rod(frameJ, v(s * 0.11, 0.255, 0.36), v(s * 0.11, 0.255, -0.02), 0.01, GLOWO, 5), 1.5);

  // ---------- kickstand ----------
  rod(kick, v(0.19, 0.34, -0.3), v(0.19, 0.29, -0.62), 0.012, STEEL);
  box(kick, GRAPH, v(0.19, 0.285, -0.64), [0.06, 0.012, 0.04]);

  return b.root;
}
