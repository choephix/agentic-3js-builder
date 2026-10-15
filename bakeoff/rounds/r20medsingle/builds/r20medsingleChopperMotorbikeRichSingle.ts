import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { arc, catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import type { Paint } from "../../../../src/paint";
import type { Joint } from "../../../../src/skeleton";
import type { PartOptions } from "../../../../src/parts";
import type { SweepOptions } from "../../../../src/sweep";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Chopper Motorbike",
  description:
    "A long-fork custom chopper in a polished hero-shooter look: gunmetal chassis, one hot orange accent, cyan energy glow, V-twin with finned cylinders, ape-hanger bars and hinged wheels, stand and levers.",
  style: "Overwatch",
  commit: "88fc1f0",
};

type V = [number, number, number];
type Fill = string | Paint;

const GUN = "#2c333d";
const GUN_D = "#1c2128";
const GUN_L = "#4a5563";
const ORANGE = "#ff7b12";
const ORANGE_D = "#c24f08";
const CHROME = "#d5dde5";
const STEEL = "#8b97a5";
const RUBBER = "#16181d";
const TREAD = "#2b2e36";
const CYAN = "#38e6ff";
const CYAN_L = "#d7fbff";
const RED = "#ff3a2a";
const WHITE = "#f3f6f8";
const BLACK = "#0e1013";

export default function build() {
  const b = createBuilder({ name: "chopperMotorbike" });

  // ---------------------------------------------------------------- skeleton
  const FT: V = [0, 1.197, 0.415]; // top of the fork axis (top triple tree)
  const AXF: V = [0, 0.352, 1.2]; // front axle
  const AXR: V = [0, 0.372, -0.85]; // rear axle
  const fr = b.joint("frame", { at: [0, 0.55, 0] });
  const steer = b.joint("steer", { parent: fr, at: FT, aim: AXF, role: "hinge" });
  const wheelF = b.joint("wheelF", { parent: steer, at: AXF, dir: [1, 0, 0], role: "hinge" });
  const wheelR = b.joint("wheelR", { parent: fr, at: AXR, dir: [1, 0, 0], role: "hinge" });
  const kickstand = b.joint("kickstand", { parent: fr, at: [0.14, 0.27, 0.02], aim: [0.3, 0.01, -0.03], role: "hinge" });
  const clutchLever = b.joint("clutchLever", { parent: steer, at: [0.375, 1.27, 0.235], aim: [0.3, 1.215, 0.335], role: "hinge" });
  const brakeLever = b.joint("brakeLever", { parent: steer, at: [-0.375, 1.27, 0.235], aim: [-0.3, 1.215, 0.335], role: "hinge" });
  const brakePedal = b.joint("brakePedal", { parent: fr, at: [-0.2, 0.3, 0.52], aim: [-0.2, 0.3, 0.72], role: "hinge" });

  // ---------------------------------------------------------------- helpers
  const box = (w: number, h: number, d: number, at: V, color: Fill, bone: Joint, o: PartOptions = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, ...o });
  const cyl = (r0: number, r1: number, len: number, at: V, dir: V, color: Fill, bone: Joint, seg = 10, o: PartOptions = {}) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), color, { bone, at, dir, ...o });
  const ball = (r: number, at: V, color: Fill, bone: Joint, o: PartOptions = {}) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { bone, at, ...o });
  const torus = (R: number, t: number, at: V, dir: V, color: Fill, bone: Joint, radial = 6, tubular = 20) =>
    b.part(new THREE.TorusGeometry(R, t, radial, tubular), color, { bone, at, dir, axis: "z" });
  const tube = (pts: V[], r: number | [number, number], color: Fill, bone: Joint, o: SweepOptions = {}) =>
    b.sweep(catmull(pts), r, color, { bone, ...o });
  const rod = (a: V, c: V, r: number | [number, number], color: Fill, bone: Joint) => b.rod(a, c, r, color, { bone });
  const bolts = (pts: V[], r: number, color: Fill, bone: Joint) => {
    const gs = pts.map(([x, y, z]) => new THREE.SphereGeometry(r, 6, 4).translate(x, y, z));
    return b.part(mergeGeometries(gs)!, color, { bone, at: [0, 0, 0] });
  };
  const xring = (x: number, cy: number, cz: number, r: number, n: number, phase = 0): V[] =>
    Array.from({ length: n }, (_, k) => {
      const a = phase + (k / n) * Math.PI * 2;
      return [x, cy + Math.sin(a) * r, cz + Math.cos(a) * r] as V;
    });

  // fork axis
  const FD = new THREE.Vector3(0, AXF[1] - FT[1], AXF[2] - FT[2]);
  const FL = FD.length();
  FD.normalize();
  const FDa: V = [0, FD.y, FD.z];
  const F = (t: number, x = 0): V => [x, FT[1] + FD.y * t, FT[2] + FD.z * t];
  const Fn = (t: number, off: number, x = 0): V => [x, FT[1] + FD.y * t + FD.z * off, FT[2] + FD.z * t - FD.y * off];

  // ---------------------------------------------------------------- paints
  const TANK = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (n.y > 0.55 && ax < 0.018) return WHITE;
    if (n.y > 0.55 && ax < 0.03) return GUN_D;
    if (n.y < -0.25) return ORANGE_D;
    if (n.y > 0.22 && n.y < 0.3) return WHITE;
    if (p.z > 0.36) return GUN;
    return ORANGE;
  });
  const FENDER = paint((p, n) => {
    if (n.y > 0.4 && Math.abs(p.x) < 0.014) return WHITE;
    if (n.y > 0.4 && Math.abs(p.x) < 0.026) return GUN_D;
    return ORANGE;
  });
  const SEAT = paint((p, n) => {
    if (n.y < 0.25) return ORANGE_D;
    const a = Math.floor((p.x + p.z) / 0.07) + Math.floor((p.x - p.z) / 0.07);
    return a % 2 === 0 ? "#2a2d34" : "#363a44";
  });

  // ---------------------------------------------------------------- wheels
  type WheelSpec = {
    j: Joint; cy: number; cz: number; R: number; tube: number; lugs: number; lugW: number;
    spokes: number; hubR: number; hubLen: number; lipX: number;
  };
  const wheel = (w: WheelSpec) => {
    const { j, cy, cz, R } = w;
    const rin = R - w.tube;
    torus(R, w.tube, [0, cy, cz], [1, 0, 0], RUBBER, j, 8, 24);
    const lugs: THREE.BufferGeometry[] = [];
    for (let k = 0; k < w.lugs; k++) {
      const th = (k / w.lugs) * Math.PI * 2;
      const g = new THREE.BoxGeometry(w.lugW, 0.024, 0.05);
      g.rotateX(Math.PI / 2 - th);
      g.translate(0, cy + Math.sin(th) * (R + w.tube), cz + Math.cos(th) * (R + w.tube));
      lugs.push(g);
    }
    b.part(mergeGeometries(lugs)!, TREAD, { bone: j, at: [0, 0, 0] });
    cyl(rin + 0.01, rin + 0.01, 0.05, [0, cy, cz], [1, 0, 0], GUN_D, j, 20);
    for (const s of [1, -1]) {
      torus(rin + 0.005, 0.012, [s * w.lipX, cy, cz], [1, 0, 0], ORANGE, j, 6, 24);
      glow(torus(rin * 0.62, 0.007, [s * 0.036, cy, cz], [1, 0, 0], CYAN, j, 4, 24), 1.4);
      for (let i = 0; i < w.spokes; i++) {
        const a = (i / w.spokes) * Math.PI * 2;
        const tw = 0.35 * s;
        rod(
          [s * 0.032, cy + Math.sin(a) * w.hubR, cz + Math.cos(a) * w.hubR],
          [s * 0.032, cy + Math.sin(a + tw) * (rin - 0.005), cz + Math.cos(a + tw) * (rin - 0.005)],
          [0.016, 0.011],
          STEEL,
          j,
        );
      }
      cyl(w.hubR * 0.6, w.hubR * 0.6, 0.02, [s * (w.hubLen / 2 + 0.012), cy, cz], [1, 0, 0], CHROME, j, 8);
    }
    cyl(w.hubR, w.hubR, w.hubLen, [0, cy, cz], [1, 0, 0], ORANGE, j, 10);
  };

  wheel({ j: wheelR, cy: AXR[1], cz: AXR[2], R: 0.26, tube: 0.1, lugs: 24, lugW: 0.13, spokes: 8, hubR: 0.05, hubLen: 0.24, lipX: 0.06 });
  wheel({ j: wheelF, cy: AXF[1], cz: AXF[2], R: 0.29, tube: 0.05, lugs: 24, lugW: 0.06, spokes: 10, hubR: 0.045, hubLen: 0.2, lipX: 0.035 });

  // rotors, pulley
  const ringOutline = (r0: number, r1: number, h: number): [number, number][] => [
    [r0, 0],
    [r1, 0],
    [r1, h],
    [r0, h],
  ];
  b.lathe(ringOutline(0.07, 0.14, 0.006), { at: [0.052, AXF[1], AXF[2]], axis: [1, 0, 0], segments: 20, color: STEEL, bone: wheelF });
  b.lathe(ringOutline(0.07, 0.14, 0.006), { at: [-0.06, AXR[1], AXR[2]], axis: [1, 0, 0], segments: 20, color: STEEL, bone: wheelR });
  bolts(xring(0.058, AXF[1], AXF[2], 0.1, 6), 0.008, CHROME, wheelF);
  bolts(xring(-0.054, AXR[1], AXR[2], 0.1, 6), 0.008, CHROME, wheelR);
  b.lathe(ringOutline(0.06, 0.105, 0.025), { at: [0.125, AXR[1], AXR[2]], axis: [1, 0, 0], segments: 24, color: GUN_L, bone: wheelR });
  b.lathe(ringOutline(0.1, 0.112, 0.03), { at: [0.123, AXR[1], AXR[2]], axis: [1, 0, 0], segments: 24, color: ORANGE, bone: wheelR });
  bolts(xring(0.152, AXR[1], AXR[2], 0.08, 8), 0.007, CHROME, wheelR);

  // ---------------------------------------------------------------- frame
  const spine: V[] = [[0, 1.1, 0.47], [0, 1.0, 0.26], [0, 0.87, 0.04], [0, 0.76, -0.14], [0, 0.68, -0.34], [0, 0.62, -0.55]];
  tube(spine, 0.03, GUN, fr);
  tube([[0, 0.95, 0.62], [0, 0.72, 0.5], [0, 0.5, 0.3], [0, 0.38, 0.16], [0, 0.34, 0.0]], 0.032, GUN, fr);
  rod([0, 0.76, -0.12], [0, 0.4, -0.12], 0.028, GUN, fr);
  for (const s of [1, -1]) {
    rod([s * 0.07, 0.4, 0.0], [s * 0.125, AXR[1], AXR[2]], 0.022, GUN, fr); // chain stay
    rod([s * 0.04, 0.62, -0.55], [s * 0.125, AXR[1] + 0.01, AXR[2]], 0.018, GUN, fr); // seat stay
    rod([s * 0.125, AXR[1], AXR[2]], [s * 0.105, 0.753, -1.07], 0.01, GUN_L, fr); // fender strut
    ball(0.026, [s * 0.125, AXR[1], AXR[2]], ORANGE_D, fr);
    // peg mount + foot peg
    rod([s * 0.04, 0.38, 0.22], [s * 0.2, 0.3, 0.52], 0.02, GUN_L, fr);
    box(0.016, 0.09, 0.07, [s * 0.2, 0.3, 0.5], GUN_D, fr);
    if (s > 0) cyl(0.02, 0.02, 0.1, [0.255, 0.3, 0.52], [1, 0, 0], RUBBER, fr, 8);
  }
  // rear loop rails and tail mount
  rod([0, 0.62, -0.55], [0, 0.66, -0.8], 0.02, GUN, fr);
  // head tube
  rod(F(0.04), F(0.38), 0.05, GUN_L, fr);
  cyl(0.058, 0.058, 0.02, F(0.04), FDa, ORANGE, fr, 10);
  cyl(0.058, 0.058, 0.02, F(0.38), FDa, ORANGE, fr, 10);
  bolts([Fn(0.2, 0.052, 0.0), Fn(0.12, 0.052, 0.0), Fn(0.28, 0.052, 0.0)], 0.007, CHROME, fr);
  // gussets
  b.extrude(
    [[0, 0], [0.16, 0], [0.04, 0.12]],
    { at: [0.0, 0.98, 0.5], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.012, color: GUN_L, bone: fr },
  );

  // skid plate + glow bar
  box(0.24, 0.02, 0.42, [0, 0.265, 0.07], GUN_D, fr);
  glow(box(0.14, 0.008, 0.3, [0, 0.253, 0.07], CYAN, fr), 1.5);
  rod([0.12, 0.27, 0.02], [0.12, 0.3, 0.02], 0.02, GUN_L, fr);

  // ---------------------------------------------------------------- engine
  box(0.22, 0.22, 0.3, [0, 0.4, 0.06], GUN, fr);
  box(0.2, 0.2, 0.2, [0, 0.38, -0.19], GUN_L, fr);
  box(0.23, 0.04, 0.31, [0, 0.31, 0.06], GUN_D, fr);
  for (const s of [1, -1]) box(0.012, 0.14, 0.12, [s * 0.116, 0.4, -0.19], GUN_D, fr); // gearbox covers
  const unit = (base: V, d: V) => {
    const along = (s: number): V => [base[0] + d[0] * s, base[1] + d[1] * s, base[2] + d[2] * s];
    cyl(0.052, 0.058, 0.26, along(0.13), d, GUN, fr, 8);
    for (let i = 0; i < 6; i++) cyl(0.088, 0.088, 0.012, along(0.05 + 0.036 * i), d, i % 2 ? STEEL : GUN_L, fr, 12);
    cyl(0.078, 0.078, 0.06, along(0.29), d, GUN_D, fr, 10);
    box(0.15, 0.03, 0.12, along(0.335), ORANGE, fr, { dir: d });
    box(0.15, 0.008, 0.125, along(0.318), GUN_D, fr, { dir: d });
    for (const s of [1, -1]) rod(along(0.27), [s * 0.1 + base[0], along(0.3)[1], along(0.3)[2]], 0.008, CHROME, fr);
  };
  unit([0, 0.46, 0.14], [0, Math.cos(0.436), Math.sin(0.436)]);
  unit([0, 0.46, 0.0], [0, Math.cos(0.436), -Math.sin(0.436)]);
  // primary cover (left) with energy core
  cyl(0.12, 0.12, 0.05, [0.13, 0.42, 0.1], [1, 0, 0], GUN_L, fr, 14);
  torus(0.112, 0.01, [0.155, 0.42, 0.1], [1, 0, 0], ORANGE, fr, 6, 16);
  cyl(0.07, 0.07, 0.01, [0.158, 0.42, 0.1], [1, 0, 0], GUN_D, fr, 14);
  glow(cyl(0.05, 0.05, 0.012, [0.162, 0.42, 0.1], [1, 0, 0], CYAN, fr, 12), 1.6);
  bolts(xring(0.158, 0.42, 0.1, 0.092, 8, 0.2), 0.008, CHROME, fr);
  // right side: clutch cover
  cyl(0.1, 0.1, 0.04, [-0.12, 0.42, 0.1], [1, 0, 0], GUN_L, fr, 12);
  torus(0.095, 0.008, [-0.14, 0.42, 0.1], [1, 0, 0], ORANGE_D, fr, 6, 16);
  bolts(xring(-0.14, 0.42, 0.1, 0.075, 6), 0.007, CHROME, fr);
  // air cleaner
  rod([0.04, 0.62, 0.09], [0.14, 0.62, 0.09], 0.028, GUN_D, fr);
  cyl(0.1, 0.095, 0.07, [0.18, 0.62, 0.09], [1, 0, 0], ORANGE, fr, 14);
  cyl(0.085, 0.085, 0.012, [0.22, 0.62, 0.09], [1, 0, 0], GUN_D, fr, 14);
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    rod([0.226, 0.62 + Math.sin(a) * 0.02, 0.09 + Math.cos(a) * 0.02], [0.226, 0.62 + Math.sin(a + 0.5) * 0.075, 0.09 + Math.cos(a + 0.5) * 0.075], 0.006, CHROME, fr);
  }
  glow(cyl(0.02, 0.02, 0.01, [0.232, 0.62, 0.09], [1, 0, 0], CYAN, fr, 8), 1.4);

  // exhaust
  const P1: V[] = [[-0.05, 0.7, 0.33], [-0.12, 0.64, 0.4], [-0.17, 0.48, 0.38], [-0.19, 0.3, 0.25], [-0.19, 0.27, 0.0], [-0.19, 0.27, -0.55], [-0.19, 0.29, -1.1]];
  const P2: V[] = [[-0.05, 0.7, -0.19], [-0.13, 0.64, -0.25], [-0.2, 0.5, -0.27], [-0.22, 0.38, -0.4], [-0.23, 0.37, -0.7], [-0.23, 0.38, -1.1]];
  tube(P1, 0.032, CHROME, fr, { sides: 8 });
  tube(P2, 0.03, CHROME, fr, { sides: 8 });
  tube(P1, 0.044, GUN_D, fr, { from: 0.55, to: 0.88, sides: 8, caps: "flat" });
  tube(P2, 0.042, ORANGE_D, fr, { from: 0.5, to: 0.86, sides: 8, caps: "flat" });
  for (const [tp, x, y] of [[P1, -0.19, 0.29], [P2, -0.23, 0.38]] as Array<[V[], number, number]>) {
    void tp;
    cyl(0.048, 0.034, 0.07, [x, y, -1.115], [0, 0, -1], STEEL, fr, 10);
    glow(cyl(0.028, 0.028, 0.006, [x, y, -1.145], [0, 0, -1], ORANGE, fr, 8), 1.3);
  }
  for (const t of [0.6, 0.72, 0.84]) {
    // clamp bands along shield
    const p = catmull(P1).at(t);
    ball(0.012, [p.x - 0.04, p.y, p.z], CHROME, fr);
  }

  // ---------------------------------------------------------------- tank & seat
  const tank = b.loft(
    [
      { at: [0, 0.9, -0.1], w: 0.18, h: 0.14 },
      { at: [0, 1.0, 0.05], w: 0.3, h: 0.22 },
      { at: [0, 1.07, 0.25], w: 0.3, h: 0.24 },
      { at: [0, 1.08, 0.43], w: 0.16, h: 0.16 },
    ],
    { color: TANK, bone: fr, sides: 12 },
  );
  for (const a of [58, -58]) glow(b.sweep(tank.line(a, 0.004), 0.005, CYAN, { bone: fr, sides: 4 }), 1.3);
  const EMBLEM = svg(
    `<svg viewBox="0 0 200 100"><path d="M10 62 L88 20 L112 20 L34 62 Z" fill="#ffffff"/><path d="M44 80 L122 38 L138 38 L60 80 Z" fill="#38e6ff"/><path d="M132 28 L192 50 L132 72 L152 50 Z" fill="#1c2128"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(tank, EMBLEM, { at: [s * 0.15, 1.07, 0.17], dir: [s, 0, 0], size: [0.2, 0.1], mirror: s < 0 });
  cyl(0.04, 0.04, 0.02, [0, 1.19, 0.2], [0, 1, 0], CHROME, fr, 10);
  torus(0.04, 0.007, [0, 1.19, 0.2], [0, 1, 0], ORANGE, fr, 5, 14);
  glow(cyl(0.014, 0.014, 0.006, [0, 1.203, 0.2], [0, 1, 0], CYAN, fr, 8), 1.4);
  for (const s of [1, -1]) rod([s * 0.1, 0.89, 0.04], [s * 0.04, 0.88, 0.04], 0.012, GUN_L, fr); // tank straps

  b.loft(
    [
      { at: [0, 0.68, -0.62], w: 0.26, h: 0.08 },
      { at: [0, 0.72, -0.45], w: 0.32, h: 0.11 },
      { at: [0, 0.75, -0.28], w: 0.3, h: 0.12 },
      { at: [0, 0.8, -0.12], w: 0.2, h: 0.1 },
    ],
    { color: SEAT, bone: fr, sides: 10 },
  );
  box(0.34, 0.012, 0.04, [0, 0.65, -0.62], ORANGE, fr); // rear seat trim
  for (const s of [1, -1]) rod([s * 0.1, 0.66, -0.55], [s * 0.1, 0.6, -0.4], 0.01, STEEL, fr);

  // ---------------------------------------------------------------- fenders & tail
  b.sweep(
    arc([0, AXR[1], AXR[2]], [0, AXR[1] + 0.44 * Math.sin(1.396), AXR[2] + 0.44 * Math.cos(1.396)], [-1, 0, 0], 90),
    () => [0.105, 0.011],
    { color: FENDER, bone: fr, section: "box", caps: "flat" },
  );
  b.sweep(
    arc([0, AXF[1], AXF[2]], [0, AXF[1] + 0.4 * Math.sin(2.618), AXF[2] + 0.4 * Math.cos(2.618)], [1, 0, 0], 125),
    () => [0.075, 0.01],
    { color: FENDER, bone: steer, section: "box", caps: "flat" },
  );
  for (const s of [1, -1]) {
    rod([s * 0.095, 0.7145, 0.863], [s * 0.075, 0.7145, 1.031], 0.012, GUN_L, steer);
    box(0.014, 0.05, 0.06, [s * 0.085, 0.7145, 0.95], GUN_L, steer);
  }
  glow(box(0.08, 0.03, 0.03, [0, 0.462, -1.292], RED, fr), 1.5);
  rod([0, 0.45, -1.28], [0, 0.4, -1.29], 0.01, GUN, fr);
  const PLATE = svg(
    `<svg viewBox="0 0 170 85"><rect x="2" y="2" width="166" height="81" rx="10" fill="#f3f6f8" stroke="#ff7b12" stroke-width="6"/><rect x="14" y="10" width="142" height="10" fill="#1c2128"/><text x="85" y="66" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="44" fill="#1c2128">XR-76</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.17, 0.085), WHITE, { bone: fr, at: [0, 0.355, -1.3], dir: [0, 0, -1], axis: "z", texture: PLATE });
  box(0.18, 0.095, 0.01, [0, 0.355, -1.294], GUN_D, fr);
  for (const s of [1, -1]) glow(box(0.012, 0.012, 0.02, [s * 0.1, 0.42, -1.285], RED, fr), 1.2);

  // ---------------------------------------------------------------- fork
  box(0.27, 0.045, 0.08, F(0), GUN_L, steer, { dir: FDa });
  box(0.27, 0.04, 0.07, F(0.38), GUN_L, steer, { dir: FDa });
  rod(F(0), F(0.38), 0.03, STEEL, steer);
  for (const s of [1, -1]) {
    cyl(0.034, 0.034, 0.07, F(0.0, s * 0.095), FDa, GUN_L, steer, 8);
    cyl(0.034, 0.034, 0.07, F(0.38, s * 0.095), FDa, GUN_L, steer, 8);
    rod(F(0.03, s * 0.095), F(0.64, s * 0.095), 0.022, CHROME, steer);
    rod(F(0.58, s * 0.095), F(FL, s * 0.095), 0.03, GUN, steer);
    cyl(0.037, 0.037, 0.04, F(0.58, s * 0.095), FDa, ORANGE, steer, 8);
    cyl(0.036, 0.036, 0.015, F(0.7, s * 0.095), FDa, CYAN, steer, 8);
    glow(cyl(0.039, 0.039, 0.008, F(0.7, s * 0.095), FDa, CYAN, steer, 8), 1.3);
    ball(0.033, F(FL, s * 0.095), GUN_L, steer);
    bolts([Fn(0.0, 0.044, s * 0.11), Fn(0.38, 0.044, s * 0.11)], 0.008, CHROME, steer);
  }
  rod(F(FL, 0.115), F(FL, -0.115), 0.015, CHROME, steer);
  box(0.2, 0.03, 0.05, F(0.64), GUN_D, steer, { dir: FDa });
  // front caliper + hose
  box(0.05, 0.07, 0.09, [0.075, 0.459, 1.11], ORANGE, steer);
  rod([0.095, 0.44, 1.12], [0.095, 0.34, 1.16], 0.012, GUN_L, steer);
  b.sweep(
    catmull([[0.37, 1.27, 0.24], [0.28, 1.05, 0.28], [0.13, 0.78, 0.72], [0.11, 0.6, 0.95], [0.075, 0.47, 1.09]]),
    0.006,
    BLACK,
    { bone: steer, sides: 5 },
  );

  // ---------------------------------------------------------------- bars
  for (const s of [1, -1]) {
    rod([s * 0.085, 1.2, 0.41], [s * 0.125, 1.34, 0.38], 0.02, CHROME, steer);
    b.sweep(catmull([[s * 0.125, 1.34, 0.38], [s * 0.25, 1.38, 0.36], [s * 0.35, 1.34, 0.3], [s * 0.4, 1.285, 0.225]]), 0.016, CHROME, { bone: steer, sides: 8 });
    rod([s * 0.395, 1.285, 0.23], [s * 0.44, 1.24, 0.14], 0.023, RUBBER, steer);
    ball(0.022, [s * 0.445, 1.235, 0.13], ORANGE, steer);
    box(0.03, 0.03, 0.06, [s * 0.37, 1.3, 0.19], GUN_D, steer);
    // mirror
    rod([s * 0.36, 1.32, 0.26], [s * 0.4, 1.45, 0.22], 0.007, CHROME, steer);
    b.part(new THREE.SphereGeometry(1, 8, 6), GUN_D, { bone: steer, at: [s * 0.4, 1.47, 0.215], scale: [0.05, 0.036, 0.012] });
    b.part(new THREE.SphereGeometry(1, 8, 6), STEEL, { bone: steer, at: [s * 0.4, 1.47, 0.225], scale: [0.04, 0.026, 0.006] });
  }
  rod([0.125, 1.34, 0.38], [-0.125, 1.34, 0.38], 0.011, CHROME, steer);
  // levers
  rod([0.375, 1.27, 0.235], [0.3, 1.215, 0.335], 0.009, CHROME, clutchLever);
  ball(0.014, [0.3, 1.215, 0.335], ORANGE, clutchLever);
  rod([-0.375, 1.27, 0.235], [-0.3, 1.215, 0.335], 0.009, CHROME, brakeLever);
  ball(0.014, [-0.3, 1.215, 0.335], ORANGE, brakeLever);
  // gauge
  cyl(0.05, 0.05, 0.035, [0, 1.265, 0.37], [0, 0.5, -0.85], GUN_D, steer, 12);
  glow(cyl(0.038, 0.038, 0.008, [0, 1.274, 0.35], [0, 0.5, -0.85], CYAN, steer, 12), 1.3);
  torus(0.048, 0.006, [0, 1.274, 0.35], [0, 0.5, -0.85], ORANGE, steer, 5, 14);

  // headlight
  cyl(0.095, 0.095, 0.14, [0, 1.0, 0.76], [0, 0, 1], GUN, steer, 14);
  torus(0.095, 0.012, [0, 1.0, 0.83], [0, 0, 1], ORANGE, steer, 6, 16);
  glow(cyl(0.075, 0.075, 0.01, [0, 1.0, 0.832], [0, 0, 1], CYAN_L, steer, 14), 1.6);
  for (const s of [1, -1]) rod([s * 0.075, 1.0, 0.65], [s * 0.095, 1.0, 0.74], 0.012, GUN_L, steer);
  bolts(xring(0, 1.0, 0.76, 0.0, 1), 0.001, CHROME, steer);

  // ---------------------------------------------------------------- hinged parts
  rod([0.14, 0.27, 0.02], [0.3, 0.015, -0.03], 0.018, GUN_L, kickstand);
  box(0.07, 0.03, 0.1, [0.3, 0.015, -0.03], GUN_D, kickstand);
  rod([-0.2, 0.3, 0.52], [-0.2, 0.3, 0.7], 0.014, GUN_L, brakePedal);
  box(0.08, 0.014, 0.07, [-0.2, 0.3, 0.72], ORANGE, brakePedal);
  box(0.1, 0.01, 0.01, [-0.2, 0.3, 0.745], BLACK, brakePedal);

  return b.root;
}
