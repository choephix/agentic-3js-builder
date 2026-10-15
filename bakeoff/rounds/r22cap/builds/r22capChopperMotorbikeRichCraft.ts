import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { catmull } from "../../../../src/path";
import { paint } from "../../../../src/paint";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Custom Chopper Motorbike",
  description:
    "Long-fork V-twin chopper with orange and navy colour blocking, ape-hanger bars, drag pipes, belt drive and glowing accent lights, in a polished stylized sci-fi look.",
  style: "Overwatch",
  commit: "88fc1f0",
};

const ORANGE = "#ff8a1e";
const CREAM = "#f4efe3";
const GUN = "#2c3440";
const NAVY = "#1a2238";
const STEEL = "#b9c3d1";
const STEEL_D = "#6f7a8a";
const TIRE = "#1c1e25";
const TIRE_L = "#262a33";
const TIRE_SIDE = "#20232b";
const LEATHER = "#2a2530";
const BLACK = "#101216";
const GLOW_W = "#fff3cf";
const RED = "#ff3b3b";

type P3 = [number, number, number];
const P = (x: number, y: number, z: number): P3 => [x, y, z];

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "chopperMotorbike" });

  const box = (w: number, h: number, d: number, color: string, at: P3, rotation?: P3) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation });
  const cylX = (r: number, len: number, color: string, at: P3, seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, rotation: [0, 0, 90] });
  const cylD = (r: number, len: number, color: string, at: THREE.Vector3 | P3, dir: THREE.Vector3 | P3, seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir });
  const ballAt = (r: number, color: string, at: P3, scale: P3 = [1, 1, 1]) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at, scale });
  const bolts = (pts: P3[], r: number, color: string) => {
    const gs = pts.map((p) => new THREE.SphereGeometry(r, 5, 3).translate(p[0], p[1], p[2]));
    return b.part(mergeGeometries(gs), color, { at: [0, 0, 0] });
  };

  // ---------------------------------------------------------------- wheels
  const wheel = (z: number, outer: number, tubeR: number, ring: number, spokes: number, solid: boolean) => {
    const cy = outer;
    const Rm = outer - tubeR;
    const tire = paint((p, n) => {
      const dy = p.y - cy;
      const dz = p.z - z;
      const r = Math.hypot(dy, dz);
      if (Math.abs(n.x) > 0.45) {
        if (Math.abs(r - ring) < 0.006) return CREAM;
        if (Math.abs(r - ring - 0.03) < 0.003) return ORANGE;
        return TIRE_SIDE;
      }
      const a = Math.atan2(dy, dz);
      return zigzag((a * 18) / (2 * Math.PI) + p.x * 8) > 0.5 ? TIRE_L : TIRE;
    });
    b.part(new THREE.TorusGeometry(Rm, tubeR, 8, 32), tire, { at: [0, cy, z], rotation: [0, 90, 0] });
    const inner = Rm - tubeR;
    if (solid) {
      cylX(inner + 0.02, 0.11, GUN, [0, cy, z], 20);
      for (const s of [1, -1]) {
        b.part(new THREE.TorusGeometry(inner - 0.03, 0.008, 6, 24), ORANGE, {
          at: [s * 0.057, cy, z],
          rotation: [0, 90, 0],
        });
        b.part(new THREE.TorusGeometry(inner * 0.45, 0.007, 6, 16), CREAM, {
          at: [s * 0.057, cy, z],
          rotation: [0, 90, 0],
        });
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI * 2) / 6;
          const c = Math.cos(a);
          const sn = Math.sin(a);
          b.rod(
            P(s * 0.058, cy + c * 0.05, z + sn * 0.05),
            P(s * 0.058, cy + c * (inner - 0.04), z + sn * (inner - 0.04)),
            0.01,
            ORANGE,
            { sides: 4 },
          );
        }
        cylX(0.05, 0.012, STEEL, [s * 0.062, cy, z], 10);
      }
    } else {
      b.part(new THREE.TorusGeometry(inner - 0.002, 0.016, 6, 32), STEEL, { at: [0, cy, z], rotation: [0, 90, 0] });
      for (const s of [1, -1])
        b.part(new THREE.TorusGeometry(inner - 0.002, 0.005, 6, 32), ORANGE, {
          at: [s * 0.018, cy, z],
          rotation: [0, 90, 0],
        });
      for (let i = 0; i < spokes; i++) {
        const a = (i * Math.PI * 2) / spokes;
        const s = i % 2 ? 1 : -1;
        b.rod(
          P(s * 0.024, cy + Math.cos(a) * 0.04, z + Math.sin(a) * 0.04),
          P(0, cy + Math.cos(a) * (inner - 0.004), z + Math.sin(a) * (inner - 0.004)),
          0.0045,
          STEEL,
          { sides: 4 },
        );
      }
      cylX(0.04, 0.09, STEEL, [0, cy, z], 12);
    }
    for (const s of [1, -1]) {
      cylX(0.022, 0.03, ORANGE, [s * 0.085, cy, z], 8);
      cylX(0.012, 0.04, STEEL, [s * 0.105, cy, z], 6);
    }
  };

  // rear: fat solid wheel; front: wire wheel
  const RZ = -0.65;
  const FZ = 1.1;
  wheel(RZ, 0.37, 0.1, 0.225, 0, true);
  wheel(FZ, 0.35, 0.06, 0.262, 16, false);

  // ---------------------------------------------------------------- front fork
  const fp = (u: number, x = 0): P3 => [x, 0.35 + 0.6 * u, FZ - 0.48 * u];
  for (const s of [1, -1]) {
    b.rod(fp(0, s * 0.075), fp(0.45, s * 0.075), 0.025, STEEL, { sides: 8 });
    b.rod(fp(0.44, s * 0.075), fp(0.5, s * 0.075), 0.03, ORANGE, { sides: 8 });
    b.rod(fp(0.5, s * 0.075), fp(1.14, s * 0.075), 0.017, STEEL, { sides: 8 });
    box(0.03, 0.09, 0.06, GUN, [s * 0.098, 0.35, FZ]);
    // lower leg slider lugs & spring cover bands
    b.rod(fp(0.15, s * 0.075), fp(0.2, s * 0.075), 0.028, GUN, { sides: 8 });
    b.rod(fp(0.28, s * 0.075), fp(0.32, s * 0.075), 0.028, GUN, { sides: 8 });
    // brake line
  }
  b.rod(P(-0.12, 0.35, FZ), P(0.12, 0.35, FZ), 0.013, STEEL, { sides: 6 });
  // triple clamps and head tube
  b.rod(fp(1.12, -0.1), fp(1.12, 0.1), 0.024, GUN, { sides: 8 });
  b.rod(fp(0.9, -0.09), fp(0.9, 0.09), 0.022, GUN, { sides: 8 });
  b.rod(fp(0.86), fp(1.1), 0.036, GUN, { sides: 10 });
  b.rod(fp(0.86), fp(0.9), 0.042, ORANGE, { sides: 10 });
  b.rod(fp(1.06), fp(1.1), 0.042, ORANGE, { sides: 10 });
  b.rod(fp(1.1), fp(1.18), 0.02, STEEL, { sides: 8 });

  // front brake rotor & caliper
  cylX(0.15, 0.006, STEEL, [0.048, 0.35, FZ], 20);
  cylX(0.115, 0.009, STEEL_D, [0.048, 0.35, FZ], 20);
  cylX(0.04, 0.012, ORANGE, [0.05, 0.35, FZ], 10);
  box(0.03, 0.07, 0.05, ORANGE, [0.05, 0.35 + 0.13, FZ - 0.02]);
  box(0.034, 0.04, 0.04, GUN, [0.05, 0.35 + 0.15, FZ - 0.02]);

  // headlight
  b.rod(P(-0.075, 0.93, 0.7), P(0.075, 0.93, 0.7), 0.012, STEEL, { sides: 6 });
  ballAt(0.078, STEEL, [0, 0.93, 0.76], [1, 1, 0.8]);
  b.part(new THREE.TorusGeometry(0.056, 0.01, 6, 16), ORANGE, { at: [0, 0.93, 0.792] });
  glow(ballAt(0.05, GLOW_W, [0, 0.93, 0.792], [1, 1, 0.7]), 1.4);
  b.rod(P(0, 0.975, 0.76), P(0, 1.0, 0.72), 0.008, ORANGE, { sides: 6 });

  // ---------------------------------------------------------------- handlebars (ape hangers)
  for (const s of [1, -1]) {
    const bar = catmull([
      [s * 0.07, 1.07, 0.524],
      [s * 0.1, 1.25, 0.5],
      [s * 0.2, 1.37, 0.46],
      [s * 0.34, 1.39, 0.4],
      [s * 0.46, 1.33, 0.45],
    ]);
    b.sweep(bar.slice(0, 0.86), 0.012, STEEL, { sides: 8 });
    b.sweep(bar.slice(0.86, 1), 0.02, ORANGE, { sides: 8, caps: "flat" });
    b.rod(bar.at(1), P(bar.at(1).x + s * 0.01, bar.at(1).y - 0.005, bar.at(1).z + 0.005), 0.022, BLACK, { sides: 8 });
    b.rod(fp(1.12, s * 0.07), P(s * 0.07, 1.07, 0.524), 0.016, GUN, { sides: 8 });
    // clutch / brake lever
    const g = bar.at(0.82);
    b.rod(g, P(g.x - s * 0.01, g.y - 0.03, g.z + 0.13), 0.006, STEEL, { sides: 4 });
    box(0.03, 0.035, 0.04, GUN, [g.x - s * 0.01, g.y - 0.005, g.z + 0.02]);
    // mirror
    b.rod(P(s * 0.43, 1.35, 0.42), P(s * 0.47, 1.47, 0.36), 0.006, STEEL, { sides: 4 });
    ballAt(0.05, s > 0 ? NAVY : NAVY, [s * 0.47, 1.49, 0.34], [1, 0.75, 0.3]);
    ballAt(0.04, STEEL, [s * 0.47, 1.49, 0.328], [1, 0.75, 0.15]);
    // cable
    b.sweep(
      catmull([
        [s * 0.34, 1.37, 0.43],
        [s * 0.22, 1.2, 0.56],
        [s * 0.09, 0.98, 0.54],
        [s * 0.03, 0.78, 0.2],
      ]),
      0.005,
      BLACK,
      { sides: 4 },
    );
  }
  // gauge
  const gaugeDir: P3 = [0, 0.6, -0.8];
  cylD(0.04, 0.03, GUN, [0, 1.085, 0.53], gaugeDir, 12);
  glow(b.part(new THREE.CircleGeometry(0.03, 10), ORANGE, { at: [0, 1.097, 0.514], dir: gaugeDir, axis: "z" }), 1.2);

  // ---------------------------------------------------------------- frame
  b.sweep(
    catmull([
      [0, 0.92, 0.6],
      [0, 0.86, 0.3],
      [0, 0.75, -0.05],
      [0, 0.63, -0.42],
    ]),
    0.03,
    GUN,
    { sides: 8 },
  );
  b.sweep(
    catmull([
      [0, 0.88, 0.6],
      [0, 0.62, 0.4],
      [0, 0.4, 0.28],
      [0, 0.28, 0.12],
      [0, 0.26, -0.2],
      [0, 0.3, -0.5],
      [0, 0.37, -0.65],
    ]),
    0.032,
    GUN,
    { sides: 8 },
  );
  for (const s of [1, -1]) {
    b.rod(P(s * 0.2, 0.37, RZ), P(s * 0.03, 0.62, -0.43), 0.02, GUN, { sides: 8 });
    b.rod(P(s * 0.2, 0.37, RZ), P(s * 0.1, 0.3, -0.3), 0.02, GUN, { sides: 8 });
    b.rod(P(s * 0.1, 0.3, -0.3), P(s * 0.1, 0.42, 0.0), 0.016, GUN, { sides: 6 });
    box(0.03, 0.1, 0.14, ORANGE, [s * 0.205, 0.37, RZ]);
    bolts([P(s * 0.222, 0.4, RZ - 0.04), P(s * 0.222, 0.4, RZ + 0.04), P(s * 0.222, 0.34, RZ - 0.04), P(s * 0.222, 0.34, RZ + 0.04)], 0.008, STEEL);
  }
  b.rod(P(-0.23, 0.37, RZ), P(0.23, 0.37, RZ), 0.015, STEEL, { sides: 6 });

  // ---------------------------------------------------------------- engine
  box(0.26, 0.22, 0.38, GUN, [0, 0.4, 0.02]);
  box(0.24, 0.2, 0.22, GUN, [0, 0.38, -0.2]);
  box(0.34, 0.03, 0.5, NAVY, [0, 0.265, -0.03]);
  box(0.2, 0.04, 0.4, ORANGE, [0, 0.5, 0.02]);
  // left primary cover and pulley, right cam cover
  cylX(0.115, 0.03, STEEL, [0.145, 0.4, 0.02], 16);
  b.part(new THREE.TorusGeometry(0.1, 0.01, 6, 20), ORANGE, { at: [0.162, 0.4, 0.02], rotation: [0, 90, 0] });
  cylX(0.05, 0.02, GUN, [0.168, 0.4, 0.02], 10);
  cylX(0.11, 0.03, STEEL, [-0.145, 0.4, 0.02], 16);
  b.part(new THREE.TorusGeometry(0.095, 0.01, 6, 20), NAVY, { at: [-0.162, 0.4, 0.02], rotation: [0, 90, 0] });
  cylX(0.04, 0.02, ORANGE, [-0.168, 0.4, 0.02], 10);
  const ringPts = (cx: number, cy: number, cz: number, r: number, n: number): P3[] =>
    Array.from({ length: n }, (_, i) => {
      const a = (i * Math.PI * 2) / n;
      return P(cx, cy + Math.cos(a) * r, cz + Math.sin(a) * r);
    });
  bolts(ringPts(0.164, 0.4, 0.02, 0.078, 8), 0.009, STEEL_D);
  bolts(ringPts(-0.164, 0.4, 0.02, 0.075, 8), 0.009, STEEL_D);
  // output pulley & belt
  cylX(0.06, 0.03, STEEL, [0.165, 0.4, -0.2], 14);
  cylX(0.1, 0.03, STEEL, [0.165, 0.37, RZ], 16);
  b.rod(P(0.13, 0.4, -0.2), P(0.165, 0.4, -0.2), 0.02, STEEL, { sides: 8 });
  b.rod(P(0.1, 0.37, RZ), P(0.165, 0.37, RZ), 0.04, STEEL, { sides: 10 });
  b.rod(P(0.165, 0.46, -0.2), P(0.165, 0.47, RZ), { radius: 0.0, section: "box" } as never, BLACK as never);
  // belt as two flat runs
  b.rod(P(0.165, 0.461, -0.2), P(0.165, 0.471, RZ), 0.012, BLACK, { section: "box" });
  b.rod(P(0.165, 0.341, -0.2), P(0.165, 0.271, RZ), 0.012, BLACK, { section: "box" });

  const dirs: Array<[THREE.Vector3, THREE.Vector3]> = [
    [new THREE.Vector3(0, 0.88, 0.47).normalize(), new THREE.Vector3(0, 0.5, 0.1)],
    [new THREE.Vector3(0, 0.88, -0.47).normalize(), new THREE.Vector3(0, 0.5, -0.06)],
  ];
  for (const [d, base] of dirs) {
    const at = (k: number, sx = 0) => base.clone().addScaledVector(d, k).add(new THREE.Vector3(sx, 0, 0));
    b.rod(at(0), at(0.28), 0.05, GUN, { sides: 10 });
    for (let i = 0; i < 6; i++) cylD(0.085, 0.012, STEEL, at(0.05 + i * 0.04), d, 12);
    // valve cover & head
    b.part(new THREE.BoxGeometry(0.17, 0.06, 0.13), ORANGE, { at: at(0.3), dir: d });
    b.part(new THREE.BoxGeometry(0.19, 0.012, 0.15), CREAM, { at: at(0.335), dir: d });
    b.part(new THREE.BoxGeometry(0.15, 0.03, 0.11), GUN, { at: at(0.27), dir: d });
    for (const s of [1, -1]) {
      b.rod(at(0.04, s * 0.1), at(0.29, s * 0.1), 0.01, STEEL, { sides: 6 });
      b.part(new THREE.SphereGeometry(0.014, 6, 4), STEEL, { at: at(0.345, s * 0.06) });
    }
  }
  // air cleaner
  cylX(0.095, 0.06, STEEL, [-0.14, 0.69, 0.02], 16);
  b.part(new THREE.TorusGeometry(0.085, 0.012, 6, 18), ORANGE, { at: [-0.175, 0.69, 0.02], rotation: [0, 90, 0] });
  cylX(0.05, 0.02, NAVY, [-0.178, 0.69, 0.02], 10);
  b.rod(P(0, 0.69, 0.02), P(-0.11, 0.69, 0.02), 0.03, GUN, { sides: 8 });
  bolts(ringPts(-0.182, 0.69, 0.02, 0.07, 6), 0.007, STEEL_D);

  // exhaust drag pipes
  for (const s of [1, -1]) {
    const pipe = catmull([
      [s * 0.1, 0.6, 0.28],
      [s * 0.15, 0.5, 0.34],
      [s * 0.21, 0.34, 0.28],
      [s * 0.21, 0.26, 0.1],
      [s * 0.21, 0.26, -0.3],
      [s * 0.21, 0.29, -0.75],
      [s * 0.2, 0.31, -1.0],
    ]);
    b.sweep(pipe, [0.026, 0.03, 0.03, 0.034, 0.05], STEEL, { sides: 10, caps: "flat" });
    b.sweep(pipe.slice(0.28, 0.72), 0.042, (t) => (Math.floor(t * 12) % 2 ? STEEL_D : NAVY), { sides: 10, caps: "flat" });
    b.part(new THREE.CircleGeometry(0.044, 8), BLACK, { at: [s * 0.2, 0.31, -1.002], dir: [0, 0, -1], axis: "z" });
    b.rod(P(s * 0.21, 0.28, -0.4), P(s * 0.1, 0.3, -0.4), 0.01, GUN, { sides: 6 });
  }
  // underglow strips
  for (const s of [1, -1]) glow(b.rod(P(s * 0.172, 0.262, -0.25), P(s * 0.172, 0.262, 0.2), 0.008, ORANGE, { sides: 6 }), 1.4);

  // footpegs
  for (const s of [1, -1]) {
    b.rod(P(0, 0.55, 0.36), P(s * 0.15, 0.38, 0.5), 0.014, GUN, { sides: 6 });
    b.rod(P(s * 0.15, 0.38, 0.5), P(s * 0.27, 0.38, 0.5), 0.014, STEEL, { sides: 6 });
    cylX(0.02, 0.06, BLACK, [s * 0.285, 0.38, 0.5], 8);
  }
  // kickstand (left)
  b.rod(P(0.18, 0.3, -0.3), P(0.26, 0.012, -0.34), 0.01, STEEL, { sides: 6 });
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 8), BLACK, { at: [0.265, 0.006, -0.34] });

  // ---------------------------------------------------------------- fuel tank
  const tankPaint = paint((p, n) => {
    const line = 0.93 + 0.04 * zigzag(p.z / 0.09);
    if (Math.abs(p.x) < 0.02 && n.y > 0.3) return CREAM;
    if (Math.abs(p.y - line) < 0.006) return CREAM;
    if (p.y < line) return NAVY;
    return ORANGE;
  });
  const tank = b.loft(
    [
      { at: [0, 0.96, 0.5], w: 0.08, h: 0.1 },
      { at: [0, 0.98, 0.4], w: 0.24, h: 0.22 },
      { at: [0, 0.99, 0.22], w: 0.33, h: 0.26 },
      { at: [0, 0.97, 0.06], w: 0.31, h: 0.24 },
      { at: [0, 0.93, -0.08], w: 0.14, h: 0.1 },
    ],
    { color: tankPaint },
  );
  cylD(0.035, 0.016, STEEL, [0.075, 1.085, 0.2], [0, 1, 0], 10);
  cylD(0.016, 0.026, ORANGE, [0.075, 1.098, 0.2], [0, 1, 0], 8);
  const chev = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 70"><polygon points="10,35 50,5 80,5 40,35 80,65 50,65" fill="#f4efe3"/><polygon points="70,35 110,5 125,5 85,35 125,65 110,65" fill="#1a2238"/><rect x="132" y="22" width="24" height="26" fill="#f4efe3"/></svg>`,
    { size: 256 },
  );
  for (const s of [1, -1])
    b.decal(tank, chev, { at: [s * 0.15, 0.985, 0.2], dir: [s, 0, 0], size: [0.17, 0.075], mirror: s < 0 });

  // ---------------------------------------------------------------- seat
  const seatPaint = paint((_p, n) => (Math.abs(n.x) > 0.5 ? ORANGE : LEATHER));
  b.extrude(
    [
      [-0.3, 0.0],
      [0.15, 0.0],
      [0.2, 0.06],
      [0.1, 0.07],
      [-0.1, 0.04],
      [-0.3, 0.09],
      [-0.34, 0.04],
    ],
    { at: [0, 0.62, -0.12], x: [0, 0, 1], thickness: 0.26, bevel: 0.01, smoothing: 1, color: seatPaint },
  );
  for (const s of [1, -1]) b.rod(P(s * 0.05, 0.6, 0.02), P(s * 0.05, 0.66, 0.06), 0.008, STEEL, { sides: 6 });

  // ---------------------------------------------------------------- rear fender
  const arc: P3[] = [];
  for (let a = -70; a <= 28; a += 14) {
    const r = (a * Math.PI) / 180;
    arc.push(P(0, 0.37 + 0.44 * Math.cos(r), RZ + 0.44 * Math.sin(r)));
  }
  const fenderPaint = paint((p, n) => {
    const ax = Math.abs(p.x);
    if (ax > 0.112 && ax < 0.124) return NAVY;
    if (ax < 0.014 && n.y > 0.4) return CREAM;
    return ORANGE;
  });
  b.sweep(catmull(arc), () => [0.13, 0.012], { color: fenderPaint, sides: 8, caps: "flat" });
  const rivets: P3[] = [];
  for (let a = -66; a <= 24; a += 6) {
    const r = (a * Math.PI) / 180;
    for (const s of [1, -1]) rivets.push(P(s * 0.108, 0.37 + 0.45 * Math.cos(r), RZ + 0.45 * Math.sin(r)));
  }
  bolts(rivets, 0.0065, STEEL);
  for (const s of [1, -1]) {
    b.rod(P(s * 0.2, 0.37, RZ), P(s * 0.115, 0.73, RZ - 0.25), 0.01, STEEL, { sides: 6 });
    b.rod(P(s * 0.2, 0.37, RZ), P(s * 0.12, 0.8, RZ + 0.08), 0.01, STEEL, { sides: 6 });
  }
  // tail light & plate
  glow(box(0.12, 0.04, 0.03, RED, [0, 0.575, -1.07]), 1.5);
  box(0.03, 0.08, 0.02, GUN, [0, 0.53, -1.06]);
  box(0.22, 0.11, 0.008, NAVY, [0, 0.47, -1.075]);
  const plate = svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60"><rect x="2" y="2" width="116" height="56" rx="6" fill="#f4efe3" stroke="#1a2238" stroke-width="4"/><rect x="8" y="8" width="104" height="8" fill="#ff8a1e"/><text x="60" y="48" font-size="30" font-weight="bold" font-family="Arial" text-anchor="middle" fill="#1a2238">CH-07</text></svg>`,
    { size: 256 },
  );
  b.part(new THREE.PlaneGeometry(0.2, 0.1), "#ffffff", { at: [0, 0.47, -1.081], dir: [0, 0, -1], axis: "z", texture: plate });
  // rear fender side chevrons
  for (const s of [1, -1])
    b.part(new THREE.PlaneGeometry(0.0001, 0.0001), ORANGE, { at: [s * 0.14, 0.9, RZ] });

  // ---------------------------------------------------------------- sissy bar
  const sissy = catmull([
    [0.13, 0.4, -0.66],
    [0.14, 0.75, -0.74],
    [0.13, 0.98, -0.86],
    [0.0, 1.03, -0.88],
    [-0.13, 0.98, -0.86],
    [-0.14, 0.75, -0.74],
    [-0.13, 0.4, -0.66],
  ]);
  b.sweep(sissy, 0.011, STEEL, { sides: 8 });
  box(0.2, 0.12, 0.04, LEATHER, [0, 0.9, -0.86], [-12, 0, 0]);
  box(0.21, 0.01, 0.045, ORANGE, [0, 0.965, -0.862], [-12, 0, 0]);

  return b.root;
}
