import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Spitfire Cyanotype Blueprint",
  "description": "A Supermarine Spitfire Mk I fighter standing on its main wheels and tailwheel, rendered as a cyanotype blueprint: every surface in Prussian-blue tones with white drafting linework, rivets and panel lines as small parts."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  ink: "#04122e",
  navy: "#071f4a",
  prussian: "#0b2a5b",
  cobalt: "#1b4fa8",
  blue: "#2e6fd1",
  sky: "#5b9bf0",
  skyPale: "#9cc8ff",
  pale: "#cfe6ff",
  white: "#f4fbff",
  glass: "#7fb8ff",
  steel: "#4a78c0",
  gunmetal: "#13347a",
  cyanGlow: "#6fe3ff",
};
const M = {
  thrustOrigin: [0, 1.75, 0] as [number, number, number],
  propHub: [0, 1.75, 4] as [number, number, number],
  cowlFront: [0, 1.75, 3.95] as [number, number, number],
  deckTop: [0, 2.1, -0.3] as [number, number, number],
  windscreenBase: [0, 2.1, 1] as [number, number, number],
  canopyRear: [0, 2.1, -1.7] as [number, number, number],
  wingRootL: [0.5, 1.22, -0.1] as [number, number, number],
  wingRootR: [-0.5, 1.22, -0.1] as [number, number, number],
  wingTipL: [5.6, 1.62, 0] as [number, number, number],
  wingTipR: [-5.6, 1.62, 0] as [number, number, number],
  aileronHingeL: [3, 1.4, -0.72] as [number, number, number],
  aileronHingeR: [-3, 1.4, -0.72] as [number, number, number],
  gearHipL: [1, 1.12, 0.5] as [number, number, number],
  gearHipR: [-1, 1.12, 0.5] as [number, number, number],
  wheelAxleL: [1.4, 0.34, 0.6] as [number, number, number],
  wheelAxleR: [-1.4, 0.34, 0.6] as [number, number, number],
  tailBase: [0, 1.72, -3.7] as [number, number, number],
  rudderHinge: [0, 1.8, -4.28] as [number, number, number],
  tailplaneCenter: [0, 1.78, -4] as [number, number, number],
  finTop: [0, 3.3, -4.35] as [number, number, number],
  tailwheelAxle: [0, 0.12, -4.05] as [number, number, number],
  tailwheelHip: [0, 1.5, -3.9] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // fuselage
  (() => {
function buildFuselage({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(5);
  // Hull cross-section stations: z, half-width, top y, bottom y
  const st: [number, number, number, number][] = [
    [3.95, 0.5, 2.25, 1.25],
    [3.0, 0.52, 2.3, 1.22],
    [1.5, 0.55, 2.28, 1.12],
    [0.5, 0.55, 2.1, 1.1],
    [-1.0, 0.5, 2.1, 1.2],
    [-1.7, 0.42, 2.05, 1.28],
    [-3.0, 0.25, 1.95, 1.45],
    [-4.45, 0.06, 1.82, 1.6],
  ];
  const stations = st.map(([z, hw, t, bt]) => ({ at: [0, (t + bt) / 2, z] as [number, number, number], w: hw * 2, h: t - bt }));
  // lower skin, then upper skin slightly larger/higher for two-tone
  const hull = b.loft(stations, { bone: body, color: P.skyPale, section: { ngon: 12 }, detail: 1 } as any);
  const upper = st.map(([z, hw, t, bt]) => ({
    at: [0, (t + bt) / 2 + (t - bt) * 0.16, z] as [number, number, number],
    w: hw * 2 * 1.015,
    h: (t - bt) * 0.68,
  }));
  b.loft(upper, { bone: body, color: P.cobalt, section: { ngon: 12 } } as any);
  // navy chin
  b.rod([0, 1.3, 3.8], [0, 1.2, 2.0], [0.28, 0.4], { bone: body, color: P.navy });
  // camouflage patches
  for (let i = 0; i < 14; i++) {
    const z = 3.3 - i * 0.55;
    const s = i % 2 ? 1 : -1;
    const y = z > 0.6 ? 2.0 : 1.95;
    b.part(new THREE.SphereGeometry(1, 6, 4), P.prussian, { bone: body, at: [s * (0.44 - Math.max(0, -z) * 0.05), y - 0.05 + R() * 0.05, z], scale: [0.1, 0.12, 0.3 + R() * 0.2] });
  }
  // upper deck
  b.part(new THREE.BoxGeometry(0.7, 0.04, 2.7), P.cobalt, { bone: body, at: [0, 2.09, -0.35] });
  // turtleback
  b.loft(
    [
      { at: [0, 2.1, -1.7], w: 0.6, h: 0.2 },
      { at: [0, 2.08, -2.2], w: 0.5, h: 0.2 },
      { at: [0, 1.98, -2.8], w: 0.3, h: 0.14 },
    ],
    { bone: body, color: P.cobalt },
  );
  // demarcation line
  for (let i = 0; i < 16; i++) {
    const z = 3.4 - i * 0.45;
    const hw = z > 0 ? 0.55 : Math.max(0.1, 0.5 - (-z) * 0.07);
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.012, 0.018, 0.3), P.white, { bone: body, at: [s * (hw * 0.99), 1.6 + Math.sin(i * 1.3) * 0.04 + (z < -2 ? 0.05 : 0), z], rotation: [0, 0, 0] });
  }
  // cowl nose ring and seams
  b.part(new THREE.TorusGeometry(0.5, 0.03, 6, 16), P.white, { bone: body, at: [0, 1.75, 3.92] });
  for (const z of [3.55, 3.2, 2.0]) b.part(new THREE.TorusGeometry(0.52, 0.01, 4, 16), P.pale, { bone: body, at: [0, 1.76, z] });
  for (let r = 0; r < 2; r++)
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + r * 0.2;
      b.part(new THREE.SphereGeometry(0.02, 5, 4), P.white, { bone: body, at: [Math.sin(a) * 0.5, 1.75 + Math.cos(a) * 0.48, 3.78 - r * 0.45] });
    }
  // exhaust stacks
  for (const s of [1, -1])
    for (let i = 0; i < 6; i++) {
      const z = 2.45 + i * 0.16;
      b.spike([s * 0.5, 1.98 - 0.02, z], [s, 0.1, -0.1], 0.14, 0.035, { bone: body, color: P.ink });
      b.part(new THREE.BoxGeometry(0.01, 0.04, 0.35), P.navy, { bone: body, at: [s * 0.53, 1.97, z - 0.22] });
    }
  // cannon blisters
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(1, 6, 4), P.blue, { bone: body, at: [s * 0.3, 2.28, 2.0], scale: [0.09, 0.05, 0.3] });
  // carb scoop
  b.part(new THREE.BoxGeometry(0.34, 0.14, 0.8), P.navy, { bone: body, at: [0, 1.15, 2.4] });
  b.part(new THREE.BoxGeometry(0.24, 0.08, 0.03), P.ink, { bone: body, at: [0, 1.14, 2.8] });
  // aerial mast + wire
  b.rod([0, 2.1, 1.7], [0, 2.7, 1.72], 0.012, { bone: body, color: P.white });
  b.part(new THREE.SphereGeometry(0.025, 5, 4), P.pale, { bone: body, at: [0, 2.72, 1.72] });
  b.sweep([[0, 2.7, 1.72], [0, 2.35, -1.5], [0, 2.0, -3.6]], 0.005, { bone: body, color: P.white });
  // panel lines, stringers, rivets
  for (const s of [1, -1]) {
    b.rod([s * 0.5, 1.9, 3.0], [s * 0.45, 1.95, -3.0], 0.008, { bone: body, color: P.pale });
    b.rod([s * 0.565, 1.5, 1.4], [s * 0.45, 1.55, -2.8], 0.007, { bone: body, color: P.white });
    b.part(new THREE.BoxGeometry(0.01, 0.2, 0.3), P.pale, { bone: body, at: [s * 0.56, 1.8, 0.4] });
    b.part(new THREE.BoxGeometry(0.012, 0.16, 0.26), P.white, { bone: body, at: [s * 0.563, 1.8, 0.4] });
    for (let i = 0; i < 14; i++)
      b.part(new THREE.SphereGeometry(0.01, 4, 3), P.white, { bone: body, at: [s * (0.55 - i * 0.02), 1.7, 1.2 - i * 0.28] });
    // roundel on sides
    const rx = s * 0.33;
    const d = [[0.2, P.navy], [0.15, P.pale], [0.1, P.sky], [0.05, P.white]] as [number, string][];
    d.forEach(([r, c], k) =>
      b.part(new THREE.CylinderGeometry(r, r, 0.01, 14), c, { bone: body, at: [s * (0.37 + k * 0.004), 1.78, -2.3], dir: [s, 0, 0] }),
    );
    // letters
    const zs = s > 0 ? [-1.6, -1.45] : [-1.6, -1.45];
    const bar = (x: number, y: number, z: number, w: number, h: number) =>
      b.part(new THREE.BoxGeometry(0.012, h, w), P.white, { bone: body, at: [s * x, y, z] });
    // Q J
    bar(0.5, 1.82, -1.4, 0.1, 0.02); bar(0.5, 1.7, -1.4, 0.1, 0.02); bar(0.5, 1.76, -1.35, 0.02, 0.12); bar(0.5, 1.76, -1.45, 0.02, 0.12);
    bar(0.5, 1.76, -1.62, 0.02, 0.14); bar(0.5, 1.69, -1.66, 0.06, 0.02);
    bar(0.5, 1.76, -1.9, 0.02, 0.14); bar(0.5, 1.82, -1.9 - 0.04, 0.1, 0.02);
    void zs; void rx;
  }
  // wing root walkway
  for (const s of [1, -1]) b.part(new THREE.BoxGeometry(0.2, 0.02, 1.6), P.pale, { bone: body, at: [s * 0.56, 1.2, -0.1] });
  // spine light
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.cyanGlow, { bone: body, at: [0, 1.88, -3.3] }), 1.5);
  void hull; void frame; void M;
}
    return buildFuselage;
  })(),
  // cockpit
  (() => {
function buildCockpit({ b, J, P, M }: any) {
  const body = J.body, canopy = J.canopy;
  const Y = 2.1;
  const box = (w: number, h: number, d: number, c: string, at: number[], bone: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, rotation: rot });
  const cyl = (r: number, h: number, c: string, at: number[], bone: any, rot?: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { bone, at, rotation: rot });
  const rod = (a: number[], z: number[], r: number, c: string, bone: any) =>
    b.rod(a, z, r, c, { bone, sides: 6 });

  // sill rails
  for (const s of [1, -1]) {
    rod([s * 0.4, Y + 0.02, 0.95], [s * 0.4, Y + 0.02, -1.7], 0.02, P.white, canopy);
    rod([s * 0.3, Y + 0.45, 0.6], [s * 0.26, Y + 0.5, -1.2], 0.016, P.white, canopy);
  }
  rod([0, Y + 0.5, 0.6], [0, Y + 0.5, -1.2], 0.018, P.white, canopy);
  // hoops
  for (const z of [0.4, -0.2, -0.8, -1.4]) {
    const k = z < -1 ? 0.8 : 1;
    const pts = [
      [0.4, Y + 0.02, z], [0.38, Y + 0.25, z], [0.28, Y + 0.45 * k + 0.03, z], [0, Y + 0.52 * k, z],
      [-0.28, Y + 0.45 * k + 0.03, z], [-0.38, Y + 0.25, z], [-0.4, Y + 0.02, z],
    ];
    b.sweep(pts, 0.016, { color: P.white, bone: canopy, sides: 6 });
  }
  // rear frame
  rod([0.4, Y + 0.02, -1.7], [-0.4, Y + 0.02, -1.7], 0.02, P.white, canopy);
  rod([0.3, Y + 0.35, -1.65], [-0.3, Y + 0.35, -1.65], 0.015, P.white, canopy);
  box(0.5, 0.2, 0.01, P.glass, [0, Y + 0.2, -1.66], canopy);
  // handle and mirror
  rod([0.3, Y + 0.3, 0.5], [0.3, Y + 0.3, 0.3], 0.014, P.pale, canopy);
  box(0.1, 0.05, 0.03, P.steel, [0, Y + 0.57, 0.62], canopy);
  rod([0, Y + 0.52, 0.6], [0, Y + 0.56, 0.62], 0.01, P.white, canopy);

  // windscreen (body)
  const wx = 0.38;
  rod([wx, Y, 1.0], [0.14, Y + 0.42, 0.62], 0.02, P.white, body);
  rod([-wx, Y, 1.0], [-0.14, Y + 0.42, 0.62], 0.02, P.white, body);
  rod([0.14, Y, 1.0], [0.14, Y + 0.42, 0.66], 0.016, P.white, body);
  rod([-0.14, Y, 1.0], [-0.14, Y + 0.42, 0.66], 0.016, P.white, body);
  rod([0.14, Y + 0.42, 0.64], [-0.14, Y + 0.42, 0.64], 0.018, P.white, body);
  rod([wx, Y, 1.0], [-wx, Y, 1.0], 0.02, P.white, body);
  box(0.26, 0.4, 0.01, P.glass, [0, Y + 0.21, 0.82], body, [-38, 0, 0]);
  for (const s of [1, -1]) {
    const m = b.part(new THREE.BoxGeometry(0.25, 0.4, 0.01), P.glass, { bone: body, at: [s * 0.26, Y + 0.2, 0.82], rotation: [-38, 0, s * 22] });
  }

  // seat, armour, headrest
  box(0.4, 0.06, 0.4, P.prussian, [0, Y + 0.04, -0.55], body);
  box(0.36, 0.04, 0.34, P.pale, [0, Y + 0.09, -0.5], body);
  box(0.4, 0.5, 0.05, P.prussian, [0, Y + 0.3, -0.8], body, [-8, 0, 0]);
  box(0.34, 0.45, 0.02, P.steel, [0, Y + 0.32, -0.86], body, [-8, 0, 0]);
  box(0.2, 0.14, 0.06, P.pale, [0, Y + 0.6, -0.84], body);

  // pilot
  box(0.32, 0.34, 0.2, P.navy, [0, Y + 0.3, -0.62], body);
  b.part(new THREE.SphereGeometry(0.11, 8, 6), P.skyPale, { bone: body, at: [0, Y + 0.6, -0.6] });
  b.part(new THREE.SphereGeometry(0.125, 8, 6, 0, Math.PI * 2, 0, 1.6), P.ink, { bone: body, at: [0, Y + 0.62, -0.62] });
  box(0.2, 0.05, 0.03, P.ink, [0, Y + 0.62, -0.5], body);
  box(0.215, 0.015, 0.2, P.white, [0, Y + 0.65, -0.6], body);
  for (const s of [1, -1]) cyl(0.03, 0.02, P.glass, [s * 0.05, Y + 0.62, -0.5], body, [90, 0, 0]);
  rod([0.17, Y + 0.4, -0.6], [0.06, Y + 0.2, -0.2], 0.035, P.navy, body);
  b.part(new THREE.SphereGeometry(0.04, 6, 5), P.skyPale, { bone: body, at: [0.06, Y + 0.18, -0.2] });
  rod([-0.17, Y + 0.4, -0.6], [-0.16, Y + 0.2, -0.3], 0.035, P.navy, body);

  // stick
  rod([0.06, Y + 0.02, -0.1], [0.06, Y + 0.3, -0.18], 0.015, P.steel, body);
  b.part(new THREE.TorusGeometry(0.04, 0.01, 5, 8), P.ink, { bone: body, at: [0.06, Y + 0.33, -0.19], rotation: [60, 0, 0] });

  // pedals
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.02, P.steel, [s * 0.1, Y + 0.08, 0.3], body, [-30, 0, 0]);
    rod([s * 0.1, Y + 0.02, 0.2], [s * 0.1, Y + 0.08, 0.3], 0.012, P.pale, body);
  }

  // instrument panel
  box(0.66, 0.26, 0.04, P.navy, [0, Y + 0.2, 0.55], body, [-20, 0, 0]);
  box(0.68, 0.015, 0.05, P.white, [0, Y + 0.34, 0.56], body);
  const gauges = [[-0.2, 0.26], [0, 0.26], [0.2, 0.26], [-0.1, 0.14], [0.1, 0.14]];
  for (const [gx, gy] of gauges) {
    const at = [gx, Y + gy - 0.03, 0.535 - (gy - 0.14) * 0.0];
    b.part(new THREE.TorusGeometry(0.04, 0.006, 5, 12), P.white, { bone: body, at, rotation: [70, 0, 0] });
    b.part(new THREE.CircleGeometry(0.037, 10), P.ink, { bone: body, at: [at[0], at[1], at[2] - 0.003], dir: [0, 0.34, -0.94], axis: "z" });
    rod([at[0], at[1] + 0.005, at[2] + 0.015], [at[0] + 0.02, at[1] + 0.025, at[2] + 0.012], 0.004, P.pale, body);
  }

  // gunsight
  cyl(0.04, 0.08, P.gunmetal, [0, Y + 0.38, 0.62], body);
  glow(b.part(new THREE.PlaneGeometry(0.1, 0.1), P.cyanGlow, { bone: body, at: [0, Y + 0.46, 0.7], rotation: [-20, 0, 0] }), 1.2);
  box(0.12, 0.012, 0.012, P.white, [0, Y + 0.51, 0.64], body);
  rod([0.05, Y + 0.34, 0.7], [-0.05, Y + 0.34, 0.7], 0.008, P.pale, body);

  // canopy outline sweep
  b.sweep([[0.41, Y + 0.03, 0.95], [0.41, Y + 0.03, -1.7], [0, Y + 0.03, -1.74], [-0.41, Y + 0.03, -1.7], [-0.41, Y + 0.03, 0.95]], 0.008, { color: P.pale, bone: canopy, sides: 5 });
}
    return buildCockpit;
  })(),
  // wings
  (() => {
function buildWings({ b, J, P, M }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  const lerp = (a: number, c: number, t: number) => a + (c - a) * t;
  const X0 = 0.4, X1 = 5.6;
  const geo = (f: number) => ({
    zle: lerp(1.2, 0.3, f),
    zte: lerp(-1.4, -0.25, f) - 0.13 * Math.sin(Math.PI * Math.min(Math.max(f, 0), 1)),
    yc: 1.22 + 0.4 * f,
    t: 0.3 * (1 - f) + 0.08 * f,
  });
  // point on wing surface (mirrored by s)
  const pt = (s: number, x: number, u: number, side: number, lift = 0) => {
    const f = (x - 0.5) / 5.1;
    const g = geo(f);
    const h = Math.max(0, 2.6 * Math.sqrt(u) * (1 - u));
    const y = g.yc + (side > 0 ? 0.55 : -0.45) * g.t * h + side * lift;
    return V(s * x, y, g.zle + (g.zte - g.zle) * u);
  };
  const grid = (fn: (i: number, j: number) => THREE.Vector3, ni: number, nj: number, side: number) => {
    const pos: number[] = [];
    for (let i = 0; i <= ni; i++) for (let j = 0; j <= nj; j++) { const p = fn(i, j); pos.push(p.x, p.y, p.z); }
    const idx: number[] = [];
    for (let i = 0; i < ni; i++) for (let j = 0; j < nj; j++) {
      const a = i * (nj + 1) + j, c = a + 1, d = a + nj + 1, e = d + 1;
      idx.push(a, c, d, c, e, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    const n = g.getAttribute("normal");
    if (n.getY(0) * side < 0) { // flip
      for (let k = 0; k < idx.length; k += 3) { const t = idx[k + 1]; idx[k + 1] = idx[k + 2]; idx[k + 2] = t; }
      g.setIndex(idx); g.computeVertexNormals();
    }
    return g;
  };
  const patch = (s: number, x0: number, x1: number, u0: number, u1: number, side: number, lift: number, color: string, bone: any, nx = 4, nu = 3) =>
    b.part(grid((i, j) => pt(s, lerp(x0, x1, i / nx), lerp(u0, u1, j / nu), side, lift), nx, nu, side), color, { bone, at: [0, 0, 0] });
  const line = (s: number, x0: number, u0: number, x1: number, u1: number, side: number, lift: number, r: number, color: string, bone: any, n = 6) => {
    const pts: THREE.Vector3[] = [];
    for (let k = 0; k <= n; k++) pts.push(pt(s, lerp(x0, x1, k / n), lerp(u0, u1, k / n), side, lift));
    return b.sweep(pts, r, { color, bone, caps: "flat", sides: 4 });
  };

  for (const s of [1, -1]) {
    const W = s > 0 ? J.wingL : J.wingR;
    const A = s > 0 ? J.aileronL : J.aileronR;
    const tag = s > 0 ? "L" : "R";
    // skins
    const us = Array.from({ length: 15 }, (_, j) => Math.pow(j / 14, 1.7));
    const xs = Array.from({ length: 18 }, (_, i) => lerp(X0, X1, i / 17));
    b.part(grid((i, j) => pt(s, xs[i], us[j], 1), 17, 14, 1), P.cobalt, { bone: W, at: [0, 0, 0], name: "wingTop" + tag });
    b.part(grid((i, j) => pt(s, xs[i], us[j], -1), 17, 14, -1), P.skyPale, { bone: W, at: [0, 0, 0], name: "wingBot" + tag });
    // camo patches
    const camo: number[][] = [[0.9, 1.9, 0.1, 0.45], [2.2, 3.2, 0.5, 0.9], [3.6, 4.8, 0.15, 0.5], [4.4, 5.4, 0.55, 0.85], [1.2, 2.0, 0.6, 0.9]];
    for (const c of camo) patch(s, c[0], c[1], c[2], c[3], 1, 0.004, P.prussian, W);
    patch(s, 0.5, 1.4, 0.0, 0.12, -1, 0.004, P.sky, W, 3, 2);
    // walkway
    patch(s, 0.55, 1.25, 0.38, 0.72, 1, 0.006, P.pale, W, 3, 2);
    patch(s, 0.7, 1.1, 0.5, 0.55, 1, 0.009, P.sky, W, 2, 1);
    // flaps (inner TE) and ailerons (outer TE)
    patch(s, 0.9, 2.9, 0.72, 0.98, 1, 0.008, P.sky, W, 5, 2);
    patch(s, 0.9, 2.9, 0.72, 0.98, -1, 0.008, P.sky, W, 5, 2);
    patch(s, 3.0, 5.1, 0.74, 0.98, 1, 0.008, P.blue, A, 5, 2);
    patch(s, 3.0, 5.1, 0.74, 0.98, -1, 0.008, P.sky, A, 5, 2);
    // hinge lines
    line(s, 0.9, 0.72, 2.9, 0.72, 1, 0.012, 0.008, P.white, W, 5);
    line(s, 3.0, 0.74, 5.1, 0.74, 1, 0.012, 0.008, P.white, A, 5);
    line(s, 0.9, 0.72, 2.9, 0.72, -1, 0.012, 0.008, P.white, W, 5);
    for (const x of [0.9, 2.9]) line(s, x, 0.72, x, 0.98, 1, 0.012, 0.007, P.white, W, 2);
    for (const x of [3.0, 5.1]) line(s, x, 0.74, x, 0.98, 1, 0.012, 0.007, P.white, A, 2);
    // ribs & rivet rows
    for (let k = 0; k < 9; k++) {
      const x = 0.8 + k * 0.52;
      const bone = x > 3 && x < 5.1 ? W : W;
      line(s, x, 0.06, x, 0.72, 1, 0.008, 0.005, P.pale, bone, 6);
    }
    for (let k = 0; k < 6; k++) line(s, 0.7 + k * 0.8, 0.82, 0.7 + k * 0.8 + 0.6, 0.82, -1, 0.008, 0.004, P.white, W, 3);
    for (const u of [0.12, 0.3, 0.62]) line(s, 0.7, u, 5.3, u, 1, 0.008, 0.004, P.white, W, 12);
    line(s, 0.7, 0.4, 5.3, 0.4, -1, 0.008, 0.004, P.pale, W, 12);
    // LE trim
    line(s, 0.55, 0.012, 5.55, 0.012, 1, 0.006, 0.012, P.white, W, 14);
    // roundels
    const nrm = V(-s * 0.078, 1, 0).normalize();
    const disc = (cx: number, cz: number, side: number) => {
      const f = (cx - 0.5) / 5.1, g = geo(f);
      const u = (g.zle - cz) / (g.zle - g.zte);
      const p = pt(s, cx, u, side, 0.012);
      const d = nrm.clone().multiplyScalar(side);
      [[0.5, P.navy], [0.4, P.pale], [0.29, P.sky], [0.14, P.white]].forEach(([r, c], k) =>
        b.part(new THREE.CylinderGeometry(r as number, r as number, 0.01, 20), c as string, {
          bone: W, at: p.clone().addScaledVector(d, 0.004 * k), dir: d,
        }),
      );
    };
    disc(3.3, -0.1, 1);
    disc(3.3, -0.1, -1);
    // gun barrels
    for (const x of [1.7, 1.95, 2.2, 2.45]) {
      const f = (x - 0.5) / 5.1, g = geo(f);
      const y = g.yc;
      b.rod(V(s * x, y, g.zle - 0.25), V(s * x, y, g.zle + 0.12), 0.026, P.gunmetal, { bone: W, sides: 6 });
      b.part(new THREE.CylinderGeometry(0.016, 0.016, 0.01, 6), P.ink, { bone: W, at: V(s * x, y, g.zle + 0.122), dir: [0, 0, 1] });
      b.part(new THREE.BoxGeometry(0.05, 0.012, 0.07), P.pale, { bone: W, at: pt(s, x, 0.03, 1, 0.003) });
    }
    // cannon bulges
    for (const x of [2.6, 3.0]) b.part(new THREE.SphereGeometry(0.08, 8, 5), P.prussian, { bone: W, at: pt(s, x, 0.22, 1, 0.02), scale: [1, 0.45, 2.4] });
    // tip cap and light
    const tp = pt(s, 5.6, 0.45, 1, -0.04);
    b.part(new THREE.SphereGeometry(0.2, 8, 6), P.white, { bone: W, at: V(s * 5.58, tp.y, tp.z), scale: [0.3, 0.2, 1.25] });
    glow(b.part(new THREE.SphereGeometry(0.05, 6, 5), P.cyanGlow, { bone: W, at: V(s * 5.7, tp.y, tp.z + 0.15) }), 1.5);
  }
  // oil cooler (left, +X) under wing
  {
    const p = pt(1, 2.2, 0.3, -1, 0.1);
    b.part(new THREE.CylinderGeometry(0.17, 0.2, 0.5, 10), P.steel, { bone: J.wingL, at: p, dir: [0, 0, 1] });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 10), P.ink, { bone: J.wingL, at: V(p.x, p.y, p.z + 0.26), dir: [0, 0, 1] });
    b.part(new THREE.TorusGeometry(0.17, 0.014, 4, 12), P.pale, { bone: J.wingL, at: V(p.x, p.y, p.z + 0.25) });
  }
  // radiator (right, -X)
  {
    const p = pt(-1, 2.2, 0.3, -1, 0.12);
    b.part(new THREE.BoxGeometry(0.4, 0.22, 0.55), P.blue, { bone: J.wingR, at: p });
    b.part(new THREE.BoxGeometry(0.3, 0.14, 0.02), P.ink, { bone: J.wingR, at: V(p.x, p.y, p.z + 0.28) });
    for (const [dx, dy] of [[0.2, 0], [-0.2, 0]]) b.rod(V(p.x + dx, p.y - 0.11, p.z - 0.27), V(p.x + dx, p.y - 0.11, p.z + 0.27), 0.01, P.white, { bone: J.wingR, sides: 4 });
    b.rod(V(p.x - 0.2, p.y - 0.11, p.z + 0.27), V(p.x + 0.2, p.y - 0.11, p.z + 0.27), 0.01, P.white, { bone: J.wingR, sides: 4 });
    b.rod(V(p.x - 0.2, p.y - 0.11, p.z - 0.27), V(p.x + 0.2, p.y - 0.11, p.z - 0.27), 0.01, P.white, { bone: J.wingR, sides: 4 });
  }
  // pitot on left LE
  {
    const g = geo((3.6 - 0.5) / 5.1);
    b.rod(V(3.6, g.yc - 0.06, g.zle - 0.05), V(3.6, g.yc - 0.06, g.zle + 0.38), [0.02, 0.01], P.white, { bone: J.wingL, sides: 6 });
    b.part(new THREE.SphereGeometry(0.02, 5, 4), P.pale, { bone: J.wingL, at: V(3.6, g.yc - 0.06, g.zle + 0.39) });
  }
}
    return buildWings;
  })(),
  // tail
  (() => {
function buildTail({ b, J, P, M }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

  // Flat outline in (z, y) drawn in the side view, extruded across x
  const fin = (pts: number[][], color: string, bone: any, x = 0, th = 0.07) =>
    b.extrude(pts, { at: [x, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: th, color, bone, smoothing: 1 });

  // Fin (rounded, swept)
  fin([[-3.45, 1.7], [-3.55, 2.4], [-3.85, 3.1], [-4.1, 3.3], [-4.3, 3.15], [-4.3, 1.8]], P.cobalt, J.body, 0, 0.09);
  // Fin-root fillet
  b.part(new THREE.BoxGeometry(0.2, 0.18, 0.7), P.prussian, { bone: J.body, at: [0, 1.9, -3.85] });
  // Fin leading edge trim
  b.rod([0, 1.75, -3.47], [0, 3.1, -3.92], 0.02, P.pale, { bone: J.body });

  // Fin flash bands on both sides
  [P.sky, P.white, P.navy].forEach((c, i) => {
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.012, 0.8, 0.07), c, { bone: J.body, at: [s * 0.05, 2.45, -3.7 - i * 0.07 - 0.1] });
  });

  // Rudder on joint
  const rud = [[-4.3, 0.0], [-4.3, 1.35], [-4.2, 1.5], [-4.45, 1.35], [-4.55, 0.7], [-4.45, 0.0]];
  b.extrude(rud, { at: [0, 1.8, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.06, color: P.blue, bone: J.rudder, smoothing: 1 });
  for (let i = 0; i < 5; i++)
    b.part(new THREE.BoxGeometry(0.075, 0.015, 0.22), P.white, { bone: J.rudder, at: [0, 1.95 + i * 0.25, -4.38] });
  b.part(new THREE.BoxGeometry(0.075, 0.015, 0.2), P.white, { bone: J.rudder, at: [0, 1.82, -4.4] });
  b.part(new THREE.BoxGeometry(0.08, 0.14, 0.12), P.sky, { bone: J.rudder, at: [0, 2.3, -4.53] });
  // Rear nav light
  glow(b.part(new THREE.SphereGeometry(0.045, 6, 4), P.cyanGlow, { bone: J.rudder, at: [0, 3.1, -4.4] }), 1.5);

  // Tailplane and elevators
  for (const s of [1, -1]) {
    const J_E = s > 0 ? J.elevatorL : J.elevatorR;
    const plan = [[-3.8, 0], [-3.7, 0.9], [-3.9, 1.5], [-4.1, 1.6], [-4.2, 1.4], [-4.2, 0.9], [-4.15, 0]];
    // plan in (z, x); stabiliser
    const st = [[0, -3.75], [0.8, -3.7], [1.4, -3.85], [1.6, -4.0], [1.35, -4.05], [0.8, -4.05], [0, -4.05]];
    const shape = new THREE.Shape();
    st.forEach(([x, z], i) => (i ? shape.lineTo(x, z) : shape.moveTo(x, z)));
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false });
    g.rotateX(Math.PI / 2); // x stays, shape y -> -z, depth -> -y
    g.translate(0, 0.03, 0);
    b.part(g, P.cobalt, { bone: J.body, at: [0, 1.78, 0], scale: [s, 1, 1] });
    b.part(new THREE.BoxGeometry(1.35, 0.01, 0.9), P.skyPale, { bone: J.body, at: [s * 0.8, 1.745, -3.9] });
    // elevator
    b.part(new THREE.BoxGeometry(1.3, 0.05, 0.4), P.blue, { bone: J_E, at: [s * 0.9, 1.78, -4.2] });
    for (let i = 0; i < 5; i++)
      b.part(new THREE.BoxGeometry(0.012, 0.015, 0.4), P.white, { bone: J_E, at: [s * (0.35 + i * 0.25), 1.81, -4.2] });
    b.part(new THREE.BoxGeometry(0.3, 0.02, 0.1), P.sky, { bone: J_E, at: [s * 1.25, 1.8, -4.38] });
    // hinge line, edge trim, rivets
    b.part(new THREE.BoxGeometry(1.4, 0.012, 0.015), P.white, { bone: J.body, at: [s * 0.85, 1.815, -4.0] });
    b.part(new THREE.BoxGeometry(0.02, 0.07, 0.3), P.pale, { bone: J.body, at: [s * 1.6, 1.78, -3.95] });
    for (let i = 0; i < 6; i++)
      b.part(new THREE.SphereGeometry(0.012, 4, 3), P.white, { bone: J.body, at: [s * (0.3 + i * 0.22), 1.815, -3.85] });
  }

  // Tailwheel
  const T = J.tailwheel;
  b.rod([0, 1.5, -3.9], [0, 0.22, -4.04], 0.045, P.steel, { bone: T });
  b.rod([0, 0.9, -3.97], [0, 0.6, -4.0], 0.06, P.pale, { bone: T });
  b.part(new THREE.BoxGeometry(0.12, 0.14, 0.18), P.navy, { bone: T, at: [0, 1.45, -3.9] });
  for (const s of [1, -1]) b.rod([s * 0.06, 0.28, -4.04], [s * 0.06, 0.12, -4.05], 0.016, P.steel, { bone: T });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 10), P.ink, { bone: T, at: [0, 0.12, -4.05], dir: [1, 0, 0] });
  b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.09, 8), P.pale, { bone: T, at: [0, 0.12, -4.05], dir: [1, 0, 0] });
}
    return buildTail;
  })(),
  // propGear
  (() => {
function buildPropGear({ b, J, P, M }: any) {
  const hub: number[] = M.propHub;

  // ---------- propeller ----------
  const spin = b.lathe(
    [[0, 0], [0.5, 0], [0.52, 0.05], [0.42, 0.3], [0.25, 0.55], [0.1, 0.68], [0, 0.7]],
    { at: [hub[0], hub[1], hub[2] - 0.05], axis: [0, 0, 1], bone: J.prop, color: P.prussian, segments: 16 },
  );
  // white band
  b.lathe([[0, 0.17], [0.47, 0.17], [0.455, 0.25], [0, 0.25]], { at: [hub[0], hub[1], hub[2] - 0.05], axis: [0, 0, 1], bone: J.prop, color: P.white, segments: 16 });
  // pale tip
  b.part(new THREE.SphereGeometry(0.07, 8, 6), P.pale, { bone: J.prop, at: [hub[0], hub[1], hub[2] + 0.64] });
  // back plate
  b.part(new THREE.CylinderGeometry(0.55, 0.55, 0.05, 20), P.navy, { bone: J.prop, at: [hub[0], hub[1], hub[2] - 0.03], dir: [0, 0, 1] });
  // bolt dots
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.018, 5, 4), P.pale, {
      bone: J.prop,
      at: [hub[0] + Math.sin(a) * 0.46, hub[1] + Math.cos(a) * 0.46, hub[2] + 0.005],
    });
  }
  // blades
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * Math.PI * 2;
    const ux = -Math.sin(a), uy = Math.cos(a); // radial direction (x flipped for model)
    const rx = Math.cos(a), ry = Math.sin(a);
    const pt = (r: number, w: number, z: number) => [hub[0] + ux * r + rx * w, hub[1] + uy * r + ry * w, hub[2] + z];
    const outline: [number, number][] = [
      [0.3, -0.05], [0.6, -0.17], [1.1, -0.2], [1.45, -0.14], [1.6, -0.04], [1.6, 0.04], [1.45, 0.14], [1.1, 0.15], [0.6, 0.1], [0.3, 0.05],
    ];
    const xdir = [ux, uy, 0];
    const ydir = [rx, ry, 0];
    const blade = b.extrude(outline, {
      at: [hub[0], hub[1], hub[2] + 0.06], x: xdir, y: ydir, thickness: 0.035, bevel: 0.008,
      bone: J.prop, color: P.navy, smoothing: 1,
    });
    // pitch twist
    blade.mesh.rotateOnAxis(new THREE.Vector3(ux, uy, 0), 0.0);
    // leading edge trim
    b.rod(pt(0.45, 0.13, 0.07), pt(1.52, 0.13, 0.07), 0.012, P.white, { bone: J.prop });
    b.rod(pt(0.45, -0.01, 0.07), pt(1.55, 0.0, 0.07), 0.01, P.prussian, { bone: J.prop });
    // tip band
    b.rod(pt(1.4, 0.0, 0.085), pt(1.58, 0.0, 0.085), 0.045, P.pale, { bone: J.prop });
    // root stencil
    b.rod(pt(0.65, -0.12, 0.082), pt(0.65, 0.1, 0.082), 0.01, P.white, { bone: J.prop });
    // root cuff
    b.rod(pt(0.25, 0, 0.05), pt(0.5, 0, 0.05), 0.07, P.steel, { bone: J.prop });
  }

  // ---------- main gear ----------
  for (const s of [1, -1]) {
    const L = s > 0 ? J.legL : J.legR;
    const W = s > 0 ? J.wheelL : J.wheelR;
    const hip = [s * 1.0, 1.12, 0.5];
    const ax = [s * 1.4, 0.34, 0.6];
    b.rod(hip, ax, [0.07, 0.055], P.steel, { bone: L, sides: 8 });
    // upper chunky oleo
    b.rod(hip, [s * 1.12, 0.9, 0.53], 0.095, P.steel, { bone: L, sides: 8 });
    // chrome collar
    b.rod([s * 1.14, 0.87, 0.53], [s * 1.18, 0.8, 0.54], 0.1, P.pale, { bone: L, sides: 8 });
    // scissor links
    b.rod([s * 1.12, 0.85, 0.6], [s * 1.25, 0.6, 0.62], 0.02, P.navy, { bone: L });
    b.rod([s * 1.25, 0.6, 0.62], [s * 1.18, 0.5, 0.58], 0.02, P.navy, { bone: L });
    // fairing door
    const door = b.extrude(
      [[0, 0], [0.5, 0], [0.62, 0.3], [0.5, 0.75], [0, 0.85], [-0.02, 0.4]],
      { at: [s * 1.2 + s * 0.06, 0.3, 0.42], x: [0, 0, 1], y: [s * 0.2, 1, 0], thickness: 0.03, bevel: 0.006, bone: L, color: P.cobalt, smoothing: 1 },
    );
    void door;
    b.rod([s * 1.26, 0.32, 0.43], [s * 1.34, 1.1, 0.43], 0.012, P.white, { bone: L });
    for (let i = 0; i < 5; i++) {
      b.part(new THREE.SphereGeometry(0.014, 5, 4), P.white, { bone: L, at: [s * (1.29 + i * 0.012), 0.45 + i * 0.12, 0.43 + (i % 2) * 0.12] });
    }
    // wheel flap on wing underside
    b.part(new THREE.BoxGeometry(0.4, 0.03, 0.5), P.sky, { bone: L, at: [s * 1.05, 1.1, 0.5] });
    // axle stub
    b.rod([s * 1.3, 0.34, 0.6], [s * 1.55, 0.34, 0.6], 0.05, P.steel, { bone: W });
    // wheel
    const dir = [1, 0, 0];
    const c = [s * 1.4, 0.34, 0.6];
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.18, 18), P.ink, { bone: W, at: c, dir });
    b.part(new THREE.CylinderGeometry(0.345, 0.345, 0.12, 12), P.navy, { bone: W, at: c, dir });
    b.part(new THREE.CylinderGeometry(0.21, 0.21, 0.2, 14), P.pale, { bone: W, at: c, dir });
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.215, 10), P.steel, { bone: W, at: c, dir });
    b.part(new THREE.SphereGeometry(0.05, 6, 4), P.white, { bone: W, at: [s * 1.5, 0.34, 0.6] });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.part(new THREE.SphereGeometry(0.022, 5, 4), P.white, {
        bone: W,
        at: [s * 1.505, 0.34 + Math.cos(a) * 0.16, 0.6 + Math.sin(a) * 0.16],
      });
    }
  }
}
    return buildPropGear;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "spitfireBlueprint" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1.75,0], dir: [0,0,1], role: "spine" });
  J["prop"] = b.joint("prop", { parent: J["body"], at: [0,1.75,4], dir: [0,0,1], role: "fan", group: "prop" });
  J["canopy"] = b.joint("canopy", { parent: J["body"], at: [0,2.1,0.7], dir: [0,0,-1], role: "hinge", group: "cockpit" });
  J["wingL"] = b.joint("wingL", { parent: J["body"], at: [0.5,1.22,-0.1], dir: [1,0.07,0], role: "wing", group: "wings" });
  J["wingR"] = b.joint("wingR", { parent: J["body"], at: [-0.5,1.22,-0.1], dir: [-1,0.07,0], role: "wing", group: "wings" });
  J["aileronL"] = b.joint("aileronL", { parent: J["wingL"], at: [3,1.4,-0.72], dir: [1,0.07,0], role: "hinge", group: "wings" });
  J["aileronR"] = b.joint("aileronR", { parent: J["wingR"], at: [-3,1.4,-0.72], dir: [-1,0.07,0], role: "hinge", group: "wings" });
  J["legL"] = b.joint("legL", { parent: J["wingL"], at: [1,1.12,0.5], dir: [0.45,-0.88,0.11], role: "leg", group: "gear" });
  J["wheelL"] = b.joint("wheelL", { parent: J["legL"], at: [1.4,0.34,0.6], dir: [1,0,0], role: "hinge", group: "gear" });
  J["legR"] = b.joint("legR", { parent: J["wingR"], at: [-1,1.12,0.5], dir: [-0.45,-0.88,0.11], role: "leg", group: "gear" });
  J["wheelR"] = b.joint("wheelR", { parent: J["legR"], at: [-1.4,0.34,0.6], dir: [-1,0,0], role: "hinge", group: "gear" });
  J["rudder"] = b.joint("rudder", { parent: J["body"], at: [0,1.8,-4.28], dir: [0,1,0], role: "hinge", group: "tail" });
  J["elevatorL"] = b.joint("elevatorL", { parent: J["body"], at: [0.25,1.78,-4.2], dir: [1,0,0], role: "hinge", group: "tail" });
  J["elevatorR"] = b.joint("elevatorR", { parent: J["body"], at: [-0.25,1.78,-4.2], dir: [-1,0,0], role: "hinge", group: "tail" });
  J["tailwheel"] = b.joint("tailwheel", { parent: J["body"], at: [0,1.5,-3.9], dir: [0,-1,-0.1], role: "leg", group: "tail" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
