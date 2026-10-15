// Barnstormer biplane, whimsical: a pudgy red-and-cream stunt plane with a goggled, mustachioed pilot, a teddy
// passenger, bunting strung from the wing tips to the tail, patched fabric wings and a big cheerful propeller.
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createBuilder } from "../../../../src/builder";
import { frame } from "../../../../src/frame";
import { rng } from "../../../../src/math";
import { paint } from "../../../../src/paint";
import { catmull } from "../../../../src/path";
import { svg } from "../../../../src/texture";
import { glow } from "../../../../kits/glow";
import { cel, INK, zigzag } from "../../../../kits/toon";

export const meta = {
  name: "Barnstormer Biplane",
  description:
    "A chubby storybook stunt biplane: cel-shaded red and cream fabric wings with rib tapes, a goggled pilot with a curly mustache, a teddy-bear passenger, bunting from the wing tips to the tail, a spinning propeller, hinged ailerons, rudder, elevators and wheels.",
  style: "whimsical",
  commit: "88fc1f0",
};

type Col = string | ReturnType<typeof paint>;
type Axis = "x" | "y" | "z";
type Opts = { dir?: number[]; axis?: Axis; scale?: number | number[]; rotation?: number[]; up?: number[] };

export default function build() {
  const b = createBuilder({ name: "barnstormerBiplane" });
  type J = ReturnType<typeof b.joint>;

  // ---------- palette ----------
  const RED = cel("#e5473b");
  const CREAM = cel("#fff1d0");
  const TEAL = cel("#2fb5b0");
  const YEL = cel("#ffc93c");
  const TAPE = cel("#e8cc98");
  const SEAM = cel("#b03328");
  const WALK = cel("#6b4a3a");
  const WOODP = cel("#c98a4b");
  const LEATHER = cel("#8a4f2b");
  const FUR = cel("#b9772f");
  const FURL = cel("#f2cf98");

  const DARK = "#2b2230";
  const TIRE = "#2e2a33";
  const METAL = "#9aa3ad";
  const BRASS = "#e0a93a";
  const GLASS = "#b8ecf5";
  const CORD = "#6b4a2f";
  const SKIN = "#f6b894";
  const PINK = "#ff8fa3";
  const HAIR = "#6a3b1e";
  const WOODF = "#c88a4a";
  const CREAMF = "#fbeed0";
  const REDF = "#e5473b";
  const YELF = "#ffc93c";
  const TEALF = "#2fb5b0";

  // ---------- skeleton ----------
  const body = b.joint("body", { at: [0, 1.35, 0] });
  const prop = b.joint("prop", { parent: body, at: [0, 1.35, 1.66], dir: [0, 0, 1], role: "hinge" });
  const rudder = b.joint("rudder", { parent: body, at: [0, 1.38, -2.92], dir: [0, 1, 0], role: "hinge" });
  const tailWheel = b.joint("tailWheel", { parent: body, at: [0, 0.1, -3.15], dir: [1, 0, 0], role: "hinge" });
  const aileron: Record<string, J> = {};
  const elevator: Record<string, J> = {};
  const wheel: Record<string, J> = {};
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    aileron[k] = b.joint(`aileron${k}`, { parent: body, at: [s * 1.9, 2.6, -0.38], dir: [s, 0, 0], role: "hinge" });
    elevator[k] = b.joint(`elevator${k}`, { parent: body, at: [s * 0.05, 1.38, -3.03], dir: [s, 0, 0], role: "hinge" });
    wheel[k] = b.joint(`wheel${k}`, { parent: body, at: [s * 0.95, 0.42, 0.45], dir: [s, 0, 0], role: "hinge" });
  }

  const put = (geo: THREE.BufferGeometry, color: Col, bone: J, at: number[], o: Opts = {}) =>
    b.part(geo, color, { bone, at, ...o });
  const merged = (geos: THREE.BufferGeometry[]) => mergeGeometries(geos)!;

  const UW = 2.6; // upper wing height
  const LW = 1.05; // lower wing height

  // ---------- fuselage ----------
  const BODY = paint((p) => {
    if (p.y < 1.2 + 0.05 * zigzag(p.z / 0.16)) return CREAM;
    if (p.z < -2.45 && p.z > -2.62) return YEL;
    const f = (((p.z + 0.35) / 0.95) % 1 + 1) % 1;
    if (Math.min(f, 1 - f) < 0.012 && p.y > 1.3) return SEAM;
    return RED;
  });
  const fuselage = b.loft(
    [
      { at: [0, 1.38, -3.15], w: 0.1, h: 0.16 },
      { at: [0, 1.38, -2.5], w: 0.22, h: 0.3 },
      { at: [0, 1.37, -1.7], w: 0.5, h: 0.62 },
      { at: [0, 1.36, -0.8], w: 0.78, h: 0.9 },
      { at: [0, 1.35, 0.3], w: 0.88, h: 0.96 },
      { at: [0, 1.35, 1.0], w: 0.84, h: 0.9 },
    ],
    { bone: body, color: BODY, sides: 10 },
  );

  // engine cowl
  const COWL = paint((p) => {
    if (p.z > 1.0 && p.z < 1.08) return TEAL;
    if (p.z > 1.54 && p.z < 1.6) return YEL;
    return RED;
  });
  b.lathe(
    [
      [0, 0],
      [0.44, 0],
      [0.47, 0.06],
      [0.47, 0.5],
      [0.42, 0.62],
      [0.2, 0.68],
      [0, 0.68],
    ],
    { at: [0, 1.35, 0.95], axis: [0, 0, 1], bone: body, color: COWL, segments: 14 },
  );
  // radial engine cylinders and intake ring on the cowl face
  const cyl: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const g = new THREE.CylinderGeometry(0.055, 0.07, 0.1, 6);
    g.rotateX(Math.PI / 2);
    g.translate(0.33 * Math.sin(a), 1.35 + 0.33 * Math.cos(a), 1.67);
    cyl.push(g);
  }
  b.part(merged(cyl), METAL, { bone: body, at: [0, 0, 0] });
  put(new THREE.TorusGeometry(0.24, 0.03, 5, 16), BRASS, body, [0, 1.35, 1.64], { dir: [0, 0, 1], axis: "z" });
  // rivets round the cowl seam
  const riv: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    riv.push(new THREE.SphereGeometry(0.014, 4, 3).translate(0.474 * Math.sin(a), 1.35 + 0.474 * Math.cos(a), 1.12));
  }
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    riv.push(new THREE.SphereGeometry(0.014, 4, 3).translate(0.424 * Math.sin(a), 1.35 + 0.424 * Math.cos(a), 1.55));
  }
  b.part(merged(riv), BRASS, { bone: body, at: [0, 0, 0] });
  // louvres + exhaust
  for (const s of [1, -1]) {
    for (const dy of [-0.18, -0.06, 0.06, 0.18]) {
      const sx = Math.sqrt(0.47 * 0.47 - dy * dy);
      put(new THREE.BoxGeometry(0.03, 0.035, 0.24), DARK, body, [s * sx, 1.35 + dy, 1.28]);
    }
    b.sweep(
      catmull([
        [s * 0.4, 1.1, 1.18],
        [s * 0.5, 1.02, 0.95],
        [s * 0.57, 0.96, 0.62],
      ]),
      [0.04, 0.055],
      { color: METAL, bone: body, sides: 6, caps: { start: "none", end: "flat" } },
    );
  }
  // fuel cap
  put(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), BRASS, body, [0, 1.82, 0.88]);

  // ---------- cockpits ----------
  const interior = new THREE.CylinderGeometry(0.27, 0.27, 0.05, 12);
  for (const z of [0.28, -0.6]) {
    put(interior, DARK, body, [0, 1.79, z], { scale: [1, 1, 1.45] });
    put(new THREE.TorusGeometry(0.27, 0.04, 5, 14), "#8a4f2b", body, [0, 1.8, z], {
      dir: [0, 1, 0],
      axis: "z",
      scale: [1, 1.45, 1],
    });
  }
  // headrest hump
  b.part(new THREE.SphereGeometry(1, 10, 6), RED, { bone: body, at: [0, 1.82, -1.3], scale: [0.28, 0.2, 0.55] });
  // windscreens
  for (const z of [0.62, -0.28]) {
    put(new THREE.BoxGeometry(0.46, 0.2, 0.02), GLASS, body, [0, 1.93, z], { rotation: [-20, 0, 0] });
    put(new THREE.BoxGeometry(0.5, 0.03, 0.04), METAL, body, [0, 2.03, z - 0.035], { rotation: [-20, 0, 0] });
    for (const s of [1, -1])
      b.rod([s * 0.23, 1.82, z + 0.02], [s * 0.23, 2.03, z - 0.035], 0.012, METAL, { bone: body, sides: 4 });
  }

  // ---------- pilot ----------
  const PZ = -0.6;
  put(new THREE.SphereGeometry(0.22, 8, 6), LEATHER, body, [0, 1.88, PZ - 0.02], { scale: [1, 1.1, 0.9] });
  put(new THREE.SphereGeometry(0.17, 10, 8), SKIN, body, [0, 2.15, PZ]);
  put(new THREE.SphereGeometry(0.19, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), LEATHER, body, [0, 2.17, PZ], {
    rotation: [-12, 0, 0],
  });
  put(new THREE.TorusGeometry(0.175, 0.016, 4, 14), DARK, body, [0, 2.17, PZ], { dir: [0, 1, 0], axis: "z" });
  put(new THREE.SphereGeometry(0.04, 6, 4), PINK, body, [0, 2.1, PZ + 0.18]);
  put(new THREE.SphereGeometry(0.1, 6, 4), YEL, body, [0, 2.36, PZ - 0.02], { scale: [0.3, 0.3, 0.3] }); // helmet bobble
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.055, 6, 5), LEATHER, body, [s * 0.17, 2.1, PZ + 0.02], { scale: [0.6, 1.1, 1] });
    put(new THREE.CylinderGeometry(0.065, 0.065, 0.05, 8), BRASS, body, [s * 0.075, 2.17, PZ + 0.15], { dir: [0, 0, 1] });
    put(new THREE.CylinderGeometry(0.05, 0.05, 0.055, 8), GLASS, body, [s * 0.075, 2.17, PZ + 0.16], { dir: [0, 0, 1] });
    put(new THREE.SphereGeometry(0.02, 5, 4), DARK, body, [s * 0.075, 2.17, PZ + 0.19]);
    put(new THREE.SphereGeometry(0.035, 5, 4), PINK, body, [s * 0.13, 2.07, PZ + 0.145]);
    // curly mustache
    b.sweep(
      catmull([
        [s * 0.01, 2.06, PZ + 0.18],
        [s * 0.1, 2.03, PZ + 0.19],
        [s * 0.18, 2.05, PZ + 0.19],
        [s * 0.23, 2.11, PZ + 0.18],
        [s * 0.2, 2.15, PZ + 0.17],
      ]),
      [0.035, 0.012],
      { color: HAIR, bone: body, sides: 6 },
    );
    // arms and gloved hands on the coaming
    b.capsule([s * 0.2, 1.95, PZ - 0.03], [s * 0.24, 1.86, PZ + 0.28], 0.06, LEATHER, { bone: body, sides: 6 });
    put(new THREE.SphereGeometry(0.055, 6, 5), CREAMF, body, [s * 0.24, 1.84, PZ + 0.32]);
  }
  // scarf: neck loop and streaming ribbon
  put(new THREE.TorusGeometry(0.13, 0.045, 5, 12), YELF, body, [0, 1.99, PZ], { dir: [0, 1, 0], axis: "z" });
  const SCARF = paint((p) => ((Math.floor(p.z / 0.12) & 1) === 0 ? RED : YEL));
  b.sweep(
    catmull([
      [0.1, 1.98, PZ - 0.1],
      [0.2, 2.02, -1.1],
      [0.15, 2.12, -1.6],
      [0.25, 2.05, -2.1],
    ]),
    (t) => [0.1 - 0.03 * t, 0.012],
    { color: SCARF, bone: body, section: "box", caps: "flat" },
  );

  // ---------- teddy-bear passenger ----------
  const BZ = 0.28;
  put(new THREE.SphereGeometry(0.17, 8, 6), FUR, body, [0, 1.86, BZ], { scale: [1, 1, 0.9] });
  put(new THREE.SphereGeometry(0.15, 10, 8), FUR, body, [0, 2.03, BZ + 0.02]);
  put(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), RED, body, [0, 2.06, BZ + 0.02], {
    rotation: [-18, 0, 0],
  });
  put(new THREE.SphereGeometry(0.06, 8, 6), FURL, body, [0, 1.99, BZ + 0.15], { scale: [1.1, 0.85, 1] });
  put(new THREE.SphereGeometry(0.022, 5, 4), DARK, body, [0, 2.01, BZ + 0.2]);
  for (const s of [1, -1]) {
    put(new THREE.SphereGeometry(0.05, 6, 5), FUR, body, [s * 0.11, 2.17, BZ - 0.01]);
    put(new THREE.SphereGeometry(0.03, 5, 4), PINK, body, [s * 0.11, 2.17, BZ + 0.025]);
    put(new THREE.SphereGeometry(0.02, 5, 4), DARK, body, [s * 0.06, 2.06, BZ + 0.135]);
    put(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 8), BRASS, body, [s * 0.06, 2.15, BZ + 0.1], {
      dir: [0, 0.2, 1],
    });
    b.capsule([s * 0.13, 1.92, BZ + 0.02], [s * 0.2, 1.85, BZ + 0.25], 0.045, FUR, { bone: body, sides: 6 });
    put(new THREE.SphereGeometry(0.045, 6, 5), FURL, body, [s * 0.2, 1.84, BZ + 0.28]);
  }
  put(new THREE.TorusGeometry(0.115, 0.03, 4, 10), TEALF, body, [0, 1.95, BZ], { dir: [0, 1, 0], axis: "z" });

  // ---------- wings ----------
  const wingPaint = (tipX: number, leadZ: number, walk: boolean) =>
    paint((p, n) => {
      const ax = Math.abs(p.x);
      if (ax > tipX || p.z > leadZ) return RED;
      if (walk && n.y > 0.5 && ax > 0.5 && ax < 1.1 && p.z < 0.7 && p.z > -0.1) return WALK;
      const d = Math.abs(((ax / 0.42 + 0.5) % 1) - 0.5);
      if (d < 0.04) return TAPE;
      return CREAM;
    });
  b.extrude(
    [
      [-3.2, 1.0],
      [3.2, 1.0],
      [4.0, 0.65],
      [4.05, -0.1],
      [3.5, -0.4],
      [-3.5, -0.4],
      [-4.05, -0.1],
      [-4.0, 0.65],
    ],
    { at: [0, UW, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.13, bevel: 0.035, smoothing: 1, bone: body, color: wingPaint(3.6, 0.88, false), name: "wingUpper" },
  );
  b.extrude(
    [
      [-2.6, 0.95],
      [2.6, 0.95],
      [3.3, 0.65],
      [3.4, -0.05],
      [2.9, -0.3],
      [-2.9, -0.3],
      [-3.4, -0.05],
      [-3.3, 0.65],
    ],
    { at: [0, LW, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.12, bevel: 0.03, smoothing: 1, bone: body, color: wingPaint(3.0, 0.82, true), name: "wingLower" },
  );
  // leading-edge rolls
  b.capsule([-3.2, UW, 1.0], [3.2, UW, 1.0], 0.055, REDF, { bone: body, sides: 6 });
  b.capsule([-2.6, LW, 0.95], [2.6, LW, 0.95], 0.05, REDF, { bone: body, sides: 6 });

  const AIL = paint((p) => (Math.abs(p.x) > 3.55 ? YEL : RED));
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0, -0.38],
        [2.0, -0.38],
        [2.1, -0.55],
        [1.95, -0.78],
        [0, -0.78],
      ],
      { at: [s * 1.9, UW, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.08, bevel: 0.02, bone: aileron[k], color: AIL, name: `aileron${k}` },
    );
    // hinge line
    b.rod([s * 1.9, UW, -0.385], [s * 3.95, UW, -0.385], 0.014, DARK, { bone: body, sides: 4 });
    // nav lights: port red, starboard green
    glow(b.part(new THREE.SphereGeometry(0.06, 6, 5), s > 0 ? "#ff3030" : "#30ff60", { bone: body, at: [s * 4.05, UW, 0.28] }), 1.4);
  }

  // ---------- struts, cabane, wires ----------
  const balls: THREE.BufferGeometry[] = [];
  const ball = (p: number[]) => balls.push(new THREE.SphereGeometry(0.058, 6, 4).translate(p[0], p[1], p[2]));
  for (const s of [1, -1]) {
    for (const x of [1.6, 3.0]) {
      for (const z of [0.6, -0.1]) {
        const lo = [s * x, LW + 0.06, z];
        const hi = [s * x, UW - 0.065, z];
        b.rod(lo, hi, 0.045, WOODF, { bone: body, sides: 6 });
        ball(lo);
        ball(hi);
      }
    }
    for (const z of [0.6, -0.1]) {
      b.rod([s * 1.6, LW + 0.06, z], [s * 3.0, UW - 0.065, z], 0.012, DARK, { bone: body, sides: 4 });
      b.rod([s * 3.0, LW + 0.06, z], [s * 1.6, UW - 0.065, z], 0.012, DARK, { bone: body, sides: 4 });
    }
    for (const z of [0.62, -0.05]) {
      const lo = [s * 0.28, 1.78, z];
      const hi = [s * 0.75, UW - 0.065, z];
      b.rod(lo, hi, 0.045, WOODF, { bone: body, sides: 6 });
      ball(hi);
    }
    // flying wires from the fuselage to the lower wing
    b.rod([s * 0.4, 1.05, 0.55], [s * 1.6, LW + 0.07, 0.6], 0.012, DARK, { bone: body, sides: 4 });
  }
  b.part(merged(balls), BRASS, { bone: body, at: [0, 0, 0] });

  // ---------- tail ----------
  const stab = [
    [-1.35, -2.55],
    [1.35, -2.55],
    [1.45, -2.78],
    [1.3, -3.0],
    [-1.3, -3.0],
    [-1.45, -2.78],
  ] as Array<[number, number]>;
  b.extrude(stab, { at: [0, 1.38, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.07, bevel: 0.02, smoothing: 1, bone: body, color: wingPaint(1.1, 99, false), name: "stabilizer" });
  b.extrude(
    [
      [-0.1, -0.02],
      [0.95, -0.02],
      [0.65, 0.55],
      [0.45, 0.95],
      [0.15, 0.95],
      [-0.1, 0.6],
    ],
    { at: [0, 1.38, -3.0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, bevel: 0.015, smoothing: 1, bone: body, color: TEAL, name: "fin" },
  );
  const RUD = paint((p) => ((Math.floor((p.y - 1.3) / 0.22) & 1) === 0 ? RED : CREAM));
  b.extrude(
    [
      [0, 0.06],
      [0.5, 0.06],
      [0.62, 0.3],
      [0.55, 0.75],
      [0.38, 0.97],
      [0, 0.97],
    ],
    { at: [0, 1.38, -2.92], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.055, bevel: 0.015, smoothing: 1, bone: rudder, color: RUD, name: "rudderPanel" },
  );
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    b.extrude(
      [
        [0, -3.03],
        [1.3, -3.03],
        [1.42, -3.2],
        [1.28, -3.42],
        [0, -3.42],
      ],
      { at: [s * 0.05, 1.38, 0], x: [s, 0, 0], y: [0, 0, 1], thickness: 0.06, bevel: 0.015, smoothing: 1, bone: elevator[k], color: RED, name: `elevator${k}` },
    );
    // stabilizer bracing
    b.rod([s * 0.1, 1.36, -2.8], [s * 0.9, 1.34, -2.8], 0.01, DARK, { bone: body, sides: 4 });
    b.rod([s * 0.05, 1.7, -2.65], [s * 0.9, 1.4, -2.75], 0.01, DARK, { bone: body, sides: 4 });
  }
  // pennant on the fin
  b.rod([0, 2.28, -2.72], [0, 2.7, -2.72], 0.012, METAL, { bone: body, sides: 4 });
  b.extrude(
    [
      [0, 0.08],
      [0.5, 0.1],
      [0.38, 0],
      [0.5, -0.1],
      [0, -0.08],
    ],
    { at: [0, 2.64, -2.72], x: [0, 0, -1], y: [0, 1, 0], thickness: 0.012, bone: body, color: YELF, name: "pennant" },
  );
  // tail wheel
  b.rod([0, 1.32, -2.8], [0, 0.2, -3.12], 0.035, METAL, { bone: body, sides: 6 });
  b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.07, 10), TIRE, { bone: tailWheel, at: [0, 0.1, -3.15], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.05, 0.05, 0.09, 8), BRASS, { bone: tailWheel, at: [0, 0.1, -3.15], dir: [1, 0, 0] });

  // ---------- landing gear ----------
  b.rod([-0.85, 0.42, 0.45], [0.85, 0.42, 0.45], 0.035, METAL, { bone: body, sides: 6 });
  for (const s of [1, -1]) {
    const k = s > 0 ? "L" : "R";
    b.rod([s * 0.3, 1.0, 0.75], [s * 0.95, 0.42, 0.45], 0.05, WOODF, { bone: body, sides: 6 });
    b.rod([s * 0.3, 1.0, 0.0], [s * 0.95, 0.42, 0.45], 0.05, WOODF, { bone: body, sides: 6 });
    b.rod([s * 0.62, 0.78, 0.6], [s * 0.78, 0.6, 0.55], 0.07, REDF, { bone: body, sides: 6 });
    const w = wheel[k];
    const c = [s * 0.95, 0.42, 0.45];
    put(new THREE.TorusGeometry(0.31, 0.11, 6, 14), TIRE, w, c, { dir: [s, 0, 0], axis: "z" });
    put(new THREE.CylinderGeometry(0.3, 0.3, 0.1, 12), CREAMF, w, c, { dir: [s, 0, 0] });
    put(new THREE.CylinderGeometry(0.2, 0.2, 0.125, 10), REDF, w, c, { dir: [s, 0, 0] });
    put(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8), YELF, w, c, { dir: [s, 0, 0] });
    const spokes: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const g = new THREE.BoxGeometry(0.03, 0.03, 0.2);
      g.translate(0, 0, 0.15);
      g.rotateX(a);
      g.translate(s * 0.07, 0, 0);
      spokes.push(g);
    }
    put(merged(spokes), CREAMF, w, c);
  }

  // ---------- propeller ----------
  put(new THREE.SphereGeometry(0.15, 10, 8), REDF, prop, [0, 1.35, 1.72], { scale: [1, 1, 1.35] });
  put(new THREE.CylinderGeometry(0.07, 0.07, 0.12, 8), BRASS, prop, [0, 1.35, 1.9], { dir: [0, 0, 1] });
  const BLADE = paint((_p, _n, s) => (s[1] > 0.85 ? YEL : WOODP));
  for (const deg of [15, 195]) {
    const a = (deg * Math.PI) / 180;
    b.extrude(
      [
        [-0.07, 0.06],
        [0.07, 0.06],
        [0.11, 0.7],
        [0.08, 1.1],
        [0, 1.18],
        [-0.08, 1.1],
        [-0.11, 0.7],
      ],
      {
        at: [0, 1.35, 1.74],
        x: [Math.cos(a), -Math.sin(a), 0],
        y: [Math.sin(a), Math.cos(a), 0],
        thickness: [0.06, 0.03],
        bevel: 0.01,
        smoothing: 1,
        bone: prop,
        color: BLADE,
        name: `blade${deg}`,
      },
    );
  }

  // ---------- decals ----------
  const roundel = svg(
    `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="${DARK}"/><circle cx="50" cy="50" r="44" fill="${CREAMF}"/>
    <circle cx="50" cy="50" r="33" fill="${TEALF}"/><circle cx="50" cy="50" r="24" fill="${CREAMF}"/>
    <path d="M50 28 L56 43 L72 44 L60 54 L64 70 L50 61 L36 70 L40 54 L28 44 L44 43Z" fill="${REDF}" stroke="${DARK}" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 100 100">
    <ellipse cx="13" cy="46" rx="13" ry="6" transform="rotate(-25 13 46)" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <ellipse cx="87" cy="46" rx="13" ry="6" transform="rotate(25 87 46)" fill="#fff" stroke="${INK}" stroke-width="3"/>
    <circle cx="50" cy="52" r="38" fill="${INK}"/><circle cx="50" cy="52" r="34" fill="${YELF}"/>
    <circle cx="38" cy="46" r="5" fill="${INK}"/><circle cx="62" cy="46" r="5" fill="${INK}"/>
    <circle cx="36.5" cy="44" r="1.8" fill="#fff"/><circle cx="60.5" cy="44" r="1.8" fill="#fff"/>
    <circle cx="29" cy="60" r="5" fill="${PINK}"/><circle cx="71" cy="60" r="5" fill="${PINK}"/>
    <path d="M34 62 Q50 78 66 62" stroke="${INK}" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`,
    { size: 256 },
  );
  const patch = svg(
    `<svg viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="4" fill="${TEALF}" stroke="${DARK}" stroke-width="3"/>
    <rect x="9" y="9" width="46" height="46" rx="2" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="5 4"/>
    <path d="M18 18 L46 46 M46 18 L18 46" stroke="${DARK}" stroke-width="2" stroke-dasharray="3 3"/></svg>`,
    { size: 192 },
  );
  const skin = b.surface(fuselage);
  const stamp = (tex: typeof roundel, y: number, z: number, size: number, roll: number) => {
    for (const s of [1, -1]) {
      const hit = skin.ray([s * 1.5, y, z], [-s, 0, 0]);
      if (!hit) continue;
      b.decal(fuselage, tex, { at: hit, dir: [s, 0, 0], size: [size, size], roll });
    }
  };
  stamp(emblem, 1.5, -1.25, 0.6, 0);
  stamp(patch, 1.28, -2.05, 0.2, 12);
  stamp(patch, 1.6, 0.0, 0.18, -8);
  const flatDecal = (tex: typeof roundel, at: number[], dir: number[], size: number) =>
    b.part(new THREE.PlaneGeometry(size, size), "#ffffff", { bone: body, at, dir, axis: "z", up: [0, 0, 1], texture: tex });
  for (const s of [1, -1]) {
    flatDecal(roundel, [s * 2.6, UW + 0.072, 0.3], [0, 1, 0], 0.9);
    flatDecal(roundel, [s * 2.6, UW - 0.072, 0.3], [0, -1, 0], 0.9);
    flatDecal(roundel, [s * 2.0, LW + 0.07, 0.3], [0, 1, 0], 0.7);
    flatDecal(patch, [s * 1.0, UW - 0.072, 0.1], [0, -1, 0], 0.35);
    flatDecal(patch, [s * 3.3, LW + 0.07, 0.4], [0, 1, 0], 0.3);
  }

  // ---------- bunting ----------
  const flag = (c1: string, c2: string) =>
    svg(
      `<svg viewBox="0 0 40 52"><path d="M2 50 L38 50 L20 3 Z" fill="${c1}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="20" cy="36" r="5" fill="${c2}"/></svg>`,
      { size: 128 },
    );
  const flags = [flag(REDF, CREAMF), flag(YELF, REDF), flag(TEALF, CREAMF), flag(CREAMF, TEALF)];
  for (const s of [1, -1]) {
    const rope = catmull([
      [s * 3.95, 2.45, 0.25],
      [s * 2.4, 2.12, -0.7],
      [s * 1.2, 1.98, -1.6],
      [s * 0.4, 2.1, -2.1],
      [0, 2.1, -2.55],
    ]);
    b.sweep(rope, 0.012, { color: CORD, bone: body, sides: 4 });
    const hooks = Array.from({ length: 16 }, (_, i) => frame(rope.at((i + 1) / 17), [0, 1, 0]));
    b.cards(hooks, flags, {
      size: [0.17, 0.22],
      lean: 180,
      flow: [0, 0, 1],
      cross: true,
      rng: rng(5 + (s > 0 ? 0 : 1)),
      vary: 0.12,
      bone: body,
    });
  }

  return b.root;
}
