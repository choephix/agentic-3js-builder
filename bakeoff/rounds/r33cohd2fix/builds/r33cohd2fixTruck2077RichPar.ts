import * as THREE from "three";
import { createBuilder, type Builder, type Joint, paint, svg, rng, mix, smoothstep, noise } from "../../../../src/index";
import { metal, panelled } from "../../../../kits/clockwork";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Warhound 77 Armored Truck",
  "description": "A low-poly cyberpunk militarized 6x6 truck from 2077 with angular armor, a roof turret, a cargo bay and neon-lit running gear."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  hull: "#2f3540",
  hullDark: "#1a1e26",
  hullLight: "#59627a",
  trim: "#e7b814",
  neonCyan: "#2ff3ff",
  neonMagenta: "#ff2fb0",
  glass: "#0c2a3a",
  rubber: "#16161a",
  rim: "#8a92a6",
  metalDark: "#3a3f4a",
  warnRed: "#d62a2a",
  ember: "#ff8a2a",
  olive: "#4a5238",
};
const M = {
  chassisTop: [0, 1.3, 0] as [number, number, number],
  cabFloor: [0, 1.3, 1.7] as [number, number, number],
  cargoDeck: [0, 1.3, -1.6] as [number, number, number],
  cabRoof: [0, 2.55, 1.6] as [number, number, number],
  turretRing: [0, 2.55, 1.4] as [number, number, number],
  railGunRing: [0, 2.95, -2.2] as [number, number, number],
  axleFront: [0, 0.62, 2.9] as [number, number, number],
  axleMid: [0, 0.62, -0.4] as [number, number, number],
  axleRear: [0, 0.62, -2.6] as [number, number, number],
  rearRamp: [0, 1.3, -4] as [number, number, number],
  noseBumper: [0, 0.9, 4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // chassis
  (() => {
function buildChassis({ b, J, P, M }: Ctx) {
  const body = J.body;
  const R = rng(5);
  const box = (w: number, h: number, d: number, col: any, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { bone: body, at, ...extra });

  const hullPaint = panelled(paint((p, n) => {
    const t = noise(p, 0.3, 3);
    return mix(P.hullDark, P.hull, 0.3 + 0.5 * t + 0.2 * smoothstep(0, 1, n.y));
  }), { size: 0.4, rivets: 0.1 });

  const hazard = paint((p) => ((Math.floor((p.z + p.y) / 0.18) % 2 + 2) % 2 ? P.trim : P.hullDark));

  // ladder frame rails
  for (const s of [1, -1]) {
    box(0.18, 0.28, 7.4, hullPaint, [s * 0.65, 0.78, -0.2]);
    box(0.5, 0.06, 7.4, P.metalDark, [s * 0.65, 0.62, -0.2]);
  }
  for (let i = 0; i < 9; i++) box(1.3, 0.14, 0.14, P.metalDark, [0, 0.8, -3.6 + i * 0.9]);

  // top deck plate
  box(2.9, 0.12, 7.4, hullPaint, [0, 1.24, 0]);

  // V belly plate
  const vShape = new THREE.Shape([new THREE.Vector2(-1.3, 0), new THREE.Vector2(1.3, 0), new THREE.Vector2(0, -0.28)]);
  const belly = new THREE.ExtrudeGeometry(vShape, { depth: 7, bevelEnabled: false });
  b.part(belly, P.hullDark, { bone: body, at: [0, 0.62, -3.5], flat: true });

  // side skirts with hazard stripes and neon
  for (const s of [1, -1]) {
    box(0.1, 0.4, 7.2, hazard, [s * 1.46, 0.72, 0]);
    glow(box(0.04, 0.05, 6.6, P.neonCyan, [s * 1.52, 0.5, 0]));
    box(0.14, 0.1, 7.2, P.hullLight, [s * 1.46, 0.95, 0]);
  }

  // axles, differentials, springs, arches, mud flaps
  const axles = [M.axleFront[2], M.axleMid[2], M.axleRear[2]];
  for (const z of axles) {
    b.part(new THREE.CylinderGeometry(0.07, 0.07, 2.9, 8), P.metalDark, { bone: body, at: [0, 0.62, z], dir: [1, 0, 0] });
    b.part(new THREE.SphereGeometry(0.28, 8, 6), P.metalDark, { bone: body, at: [0, 0.62, z], scale: [1, 0.9, 1.1], flat: true });
    box(0.3, 0.1, 0.3, P.trim, [0, 0.9, z]);
    for (const s of [1, -1]) {
      for (const dz of [-0.35, 0.35]) {
        b.part(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 6), P.metalDark, { bone: body, at: [s * 0.9, 0.92, z + dz] });
        for (let k = 0; k < 5; k++)
          b.part(new THREE.TorusGeometry(0.075, 0.015, 4, 8), P.rim, { bone: body, at: [s * 0.9, 0.78 + k * 0.08, z + dz], rotation: [90, 0, 0] });
      }
      // arch frame: top bar and posts
      box(0.2, 0.08, 1.45, P.hullLight, [s * 1.45, 1.22, z]);
      box(0.2, 0.3, 0.08, P.trim, [s * 1.45, 1.05, z + 0.74], { rotation: [0, 0, 0] });
      box(0.2, 0.3, 0.08, P.trim, [s * 1.45, 1.05, z - 0.74]);
      box(0.04, 0.4, 0.5, P.rubber, [s * 1.4, 0.38, z - 0.8]);
    }
  }

  // fuel tanks
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.22, 0.22, 1.4, 8), P.olive, { bone: body, at: [s * 1.0, 0.65, 1.55], dir: [0, 0, 1] });
    for (const dz of [-0.4, 0.4]) box(0.5, 0.05, 0.06, P.metalDark, [s * 1.0, 0.65, 1.55 + dz]);
    box(0.08, 0.08, 0.08, P.warnRed, [s * 1.0, 0.88, 1.55]);
  }

  // exhaust stacks behind cab
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.08, 0.1, 1.3, 8), P.metalDark, { bone: body, at: [s * 1.38, 1.9, 0.62] });
    b.part(new THREE.CylinderGeometry(0.11, 0.09, 0.1, 8), P.ember, { bone: body, at: [s * 1.38, 2.58, 0.62] });
    b.part(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 8), P.trim, { bone: body, at: [s * 1.38, 1.5, 0.62] });
    b.part(new THREE.TorusGeometry(0.1, 0.02, 4, 8), P.rim, { bone: body, at: [s * 1.38, 2.1, 0.62], rotation: [90, 0, 0] });
  }

  // tow hooks
  for (const [z, d] of [[3.65, 1], [-4.0, -1]] as number[][]) {
    for (const s of [1, -1]) {
      b.part(new THREE.TorusGeometry(0.09, 0.025, 5, 8, Math.PI * 1.5), P.warnRed, { bone: body, at: [s * 0.5, 0.7, z + d * 0.05] });
      box(0.1, 0.1, 0.2, P.metalDark, [s * 0.5, 0.7, z - d * 0.1]);
    }
  }

  // neon underbody strips
  for (const s of [1, -1]) glow(box(0.05, 0.04, 6.4, P.neonCyan, [s * 0.4, 0.58, 0]), 1.4);
  glow(box(0.8, 0.04, 0.05, P.neonMagenta, [0, 0.52, 3.2]), 1.2);

  // bumper fillers front/back
  box(2.9, 0.4, 0.2, hullPaint, [0, 0.8, 3.5]);
  box(2.9, 0.4, 0.2, hullPaint, [0, 0.8, -3.9]);
  box(2.9, 0.06, 0.22, hazard, [0, 1.02, -3.9]);
  box(2.9, 0.06, 0.22, hazard, [0, 1.02, 3.5]);
}
    return buildChassis;
  })(),
  // wheels
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildWheels({ b, J, P, M }: Ctx) {
  const R = 0.62;
  const W = 0.5;
  const rnd = rng(77);

  const rubber = paint((p, n) => {
    const d = noise(p, 0.12, 3);
    return mix("#101014", "#24242b", d * 0.8 + (n.y > 0.5 ? 0.1 : 0));
  });
  const steel = paint((p, n) => mix("#6d7588", "#aab2c6", noise(p, 0.05, 5) * 0.7 + (n.y > 0.4 ? 0.2 : 0)));

  const hubTex = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#0a3a44" stroke="#2ff3ff" stroke-width="4"/><circle cx="32" cy="32" r="18" fill="none" stroke="#2ff3ff" stroke-width="3"/><path d="M32 8V56M8 32H56" stroke="#9ffaff" stroke-width="3"/><circle cx="32" cy="32" r="6" fill="#e8ffff"/></svg>`,
    { size: 128 },
  );

  // tread block template (in wheel local space, axis along y before rotation)
  const treadBlocks = (): THREE.BufferGeometry => {
    const list: THREE.BufferGeometry[] = [];
    const n = 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const g = new THREE.BoxGeometry(W * 0.92, 0.09, 0.16);
      g.translate(0, R + 0.02, 0);
      g.rotateX(a);
      list.push(g);
    }
    return mergeGeometries(list)!;
  };
  const treads = treadBlocks();

  const boltGeo = (r: number, n: number, x: number) => {
    const list: THREE.BufferGeometry[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const g = new THREE.CylinderGeometry(0.025, 0.025, 0.05, 6);
      g.rotateZ(Math.PI / 2);
      g.translate(x, Math.sin(a) * r, Math.cos(a) * r);
      list.push(g);
    }
    return mergeGeometries(list)!;
  };

  // Builds one wheel around bone at centre c; s = outward sign (+1 left)
  const wheel = (bone: any, c: number[], s: number) => {
    const at = [c[0], c[1], c[2]];
    const ax = [s, 0, 0];
    // octagonal tyre (cylinder 8 sides, axis x)
    const tyre = new THREE.CylinderGeometry(R, R, W, 8, 1);
    b.part(tyre, rubber, { bone, at, dir: ax, flat: true });
    // sidewall inner rings darker
    b.part(new THREE.CylinderGeometry(R * 0.78, R * 0.78, W + 0.02, 8), P.rubber, { bone, at, dir: ax, flat: true });
    // tread blocks
    b.part(treads.clone(), P.hullDark, { bone, at, dir: [1, 0, 0] });
    // rim lathe
    const rimOutline: [number, number][] = [
      [0, -0.2], [0.18, -0.2], [0.34, -0.23], [0.4, -0.19], [0.4, 0.2], [0.34, 0.25], [0.18, 0.22], [0, 0.22],
    ];
    const outer = at.map((v, i) => v + (i === 0 ? s * 0.03 : 0));
    b.lathe(rimOutline, { at: outer, axis: ax, segments: 12, color: steel, bone });
    // hub cap glowing
    const capAt = [c[0] + s * 0.27, c[1], c[2]];
    const cap = b.part(new THREE.CircleGeometry(0.17, 12), "#ffffff", { bone, at: capAt, dir: ax, axis: "z", texture: hubTex });
    cap.mesh.material = cap.mesh.material.clone();
    cap.mesh.material.emissive = new THREE.Color("#2ff3ff");
    cap.mesh.material.emissiveMap = cap.mesh.material.map;
    cap.mesh.material.emissiveIntensity = 1.2;
    b.part(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 8), P.metalDark, { bone, at: [capAt[0] - s * 0.02, c[1], c[2]], dir: ax });
    // bolt ring
    b.part(boltGeo(0.27, 8, 0), P.trim, { bone, at: [c[0] + s * 0.24, c[1], c[2]] , dir: [1, 0, 0] });
    // inner rim lip
    b.part(new THREE.TorusGeometry(R * 0.78, 0.03, 4, 8), P.rim, { bone, at: [c[0] + s * 0.26, c[1], c[2]], dir: ax, axis: "z" });
    // brake disc (inboard)
    const ix = c[0] - s * 0.2;
    b.part(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 12), P.metalDark, { bone, at: [ix, c[1], c[2]], dir: ax });
    b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 8), P.hullLight, { bone, at: [ix, c[1], c[2]], dir: ax });
    // caliper on the disc top (rigid with body for realism)
    b.part(new THREE.BoxGeometry(0.1, 0.14, 0.2), P.warnRed, { bone: J.body, at: [ix, c[1] + 0.3, c[2]] });
    b.part(new THREE.BoxGeometry(0.14, 0.04, 0.12), P.hullDark, { bone: J.body, at: [ix, c[1] + 0.38, c[2]] });
  };

  const defs: [string, number, number][] = [
    ["wheelFL", 1, M.axleFront[2]], ["wheelFR", -1, M.axleFront[2]],
    ["wheelML", 1, M.axleMid[2]], ["wheelMR", -1, M.axleMid[2]],
    ["wheelRL", 1, M.axleRear[2]], ["wheelRR", -1, M.axleRear[2]],
  ];
  for (const [name, s, z] of defs) wheel(J[name], [s * 1.45, R, z], s);

  // spare wheel strapped on the cargo side (left)
  const sx = 1.62;
  const sz = -1.6;
  const sy = 1.9;
  b.part(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8), rubber, { bone: J.body, at: [sx, sy, sz], dir: [1, 0, 0], flat: true });
  b.part(treads.clone().scale(0.8, 0.8, 0.8).scale(0.6 / 0.8, 1, 1), P.hullDark, { bone: J.body, at: [sx, sy, sz] });
  b.part(new THREE.CylinderGeometry(0.3, 0.3, 0.34, 10), steel, { bone: J.body, at: [sx, sy, sz], dir: [1, 0, 0] });
  const sc = b.part(new THREE.CircleGeometry(0.14, 10), "#ffffff", { bone: J.body, at: [sx + 0.18, sy, sz], dir: [1, 0, 0], axis: "z", texture: hubTex });
  sc.mesh.material = sc.mesh.material.clone();
  sc.mesh.material.emissive = new THREE.Color("#2ff3ff");
  sc.mesh.material.emissiveMap = sc.mesh.material.map;
  b.part(boltGeo(0.2, 6, 0), P.trim, { bone: J.body, at: [sx + 0.16, sy, sz], dir: [1, 0, 0] });
  // straps
  for (const dz of [-0.2, 0.2]) {
    b.part(new THREE.BoxGeometry(0.36, 1.08, 0.06), P.olive, { bone: J.body, at: [sx, sy, sz + dz] });
    b.part(new THREE.BoxGeometry(0.4, 0.1, 0.09), P.trim, { bone: J.body, at: [sx, sy + 0.5, sz + dz] });
  }
  // mounting bracket
  b.part(new THREE.BoxGeometry(0.1, 0.9, 0.5), P.metalDark, { bone: J.body, at: [1.54, sy, sz] });
}
    return buildWheels;
  })(),
  // cab
  (() => {
function buildCab({ b, J, P, M }: any) {
  const body = J.body;
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: any, at: number[], opt: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone: body, at, flat: true, ...opt });
  const hazard = svg(
    `<svg viewBox="0 0 64 16"><rect width="64" height="16" fill="#e7b814"/>${[0, 1, 2, 3, 4, 5, 6, 7]
      .map((i) => `<path d="M${i * 10 - 4} 16 L${i * 10 + 4} 0 L${i * 10 + 9} 0 L${i * 10 + 1} 16Z" fill="#14141a"/>`)
      .join("")}</svg>`,
    { size: 128 },
  );
  const hud = svg(
    `<svg viewBox="0 0 100 40"><g fill="none" stroke="#2ff3ff" stroke-width="2.5"><path d="M4 8 H30 M70 8 H96 M4 34 H20 M80 34 H96"/><circle cx="50" cy="20" r="9"/><path d="M50 6 V12 M50 28 V34 M34 20 H41 M59 20 H66"/></g></svg>`,
    { size: 256 },
  );
  const emblem = svg(
    `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#14141a" stroke="#e7b814" stroke-width="4"/><path d="M32 12 L48 44 L32 36 L16 44Z" fill="#e7b814"/><circle cx="32" cy="30" r="4" fill="#ff2fb0"/></svg>`,
    { size: 128 },
  );
  const plate = panelled(
    paint((p: any, n: any) => mix(P.hull, P.hullLight, 0.55 * n.y * smoothstep(0.3, 0.8, noise(p, 0.3, 4)) + 0.05)),
    { size: 0.35, rivets: 0.07 },
  );
  const dark = metal("iron");

  // main cab block and sloped nose
  box(2.9, 1.1, 1.9, plate, [0, 1.85, 1.75]);
  b.frustumBox([0, 1.75, 2.7], [0, 1.55, 3.9], [2.9, 0.9], [2.7, 0.6], { bone: body, color: plate });
  // hood slope
  b.part(new THREE.BoxGeometry(2.6, 0.12, 1.3), P.hullLight, { bone: body, at: [0, 2.28, 3.25], rotation: [14, 0, 0], flat: true });
  // roof plate
  box(2.7, 0.1, 1.7, P.hullDark, [0, 2.6, 1.7]);
  b.part(new THREE.PlaneGeometry(1.6, 0.4), "#ffffff", { bone: body, at: [0, 2.662, 1.0], dir: [0, 1, 0], axis: "z", texture: hazard });
  // turret ring
  b.lathe([[0, 0], [0.55, 0], [0.5, 0.06], [0.42, 0.1], [0, 0.1]], { at: [0, 2.65, 1.4], bone: body, color: P.metalDark });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * 6.283;
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.04, 6), P.rim, { bone: body, at: [Math.sin(a) * 0.47, 2.76, 1.4 + Math.cos(a) * 0.47] });
  }
  // windshield
  box(2.3, 0.4, 0.06, P.glass, [0, 2.3, 2.69], { rotation: [-18, 0, 0] });
  b.part(new THREE.PlaneGeometry(1.4, 0.56), "#ffffff", { bone: body, at: [0, 2.3, 2.74], dir: [0, 0.3, 1], axis: "z", texture: hud });
  box(2.4, 0.12, 0.12, P.hullDark, [0, 2.52, 2.68]);
  // side windows, shutters, door seams, handles, emblem
  for (const s of [1, -1]) {
    box(0.05, 0.35, 0.9, P.glass, [s * 1.46, 2.2, 1.9]);
    box(0.08, 0.1, 0.95, P.hullDark, [s * 1.47, 2.42, 1.9]);
    for (let i = 0; i < 3; i++) box(0.09, 0.03, 0.9, P.metalDark, [s * 1.475, 2.28 - i * 0.1 + 0.1, 1.9]);
    box(0.04, 1.0, 0.03, P.hullDark, [s * 1.46, 1.85, 1.35]);
    box(0.04, 1.0, 0.03, P.hullDark, [s * 1.46, 1.85, 2.45]);
    b.rod([s * 1.5, 1.95, 1.45], [s * 1.5, 1.95, 1.7], 0.025, P.trim, { bone: body });
    b.part(new THREE.PlaneGeometry(0.5, 0.5), "#ffffff", { bone: body, at: [s * 1.465, 1.75, 2.05], dir: [s, 0, 0], axis: "z", texture: emblem });
    // mirror + camera
    box(0.08, 0.3, 0.05, P.hullDark, [s * 1.65, 2.2, 2.55]);
    b.rod([s * 1.5, 2.2, 2.6], [s * 1.65, 2.2, 2.6], 0.02, P.hullDark, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [s * 1.66, 2.38, 2.62] }), 1.5);
    // headlights
    glow(box(0.5, 0.18, 0.1, P.trim, [s * 1.0, 1.7, 3.92]), 1.8);
    box(0.56, 0.24, 0.05, P.hullDark, [s * 1.0, 1.7, 3.88]);
    // vents
    for (let i = 0; i < 4; i++) box(0.5, 0.03, 0.18, P.hullDark, [s * 0.7, 2.33 + i * 0.01, 3.0 + i * 0.22], { rotation: [14, 0, 0] });
    // bull-bar posts
    b.rod([s * 0.9, 1.4, 4.0], [s * 0.7, 1.0, 4.25], 0.05, P.metalDark, { bone: body });
  }
  // grille
  box(1.3, 0.3, 0.06, P.hullDark, [0, 1.65, 3.97]);
  glow(box(1.1, 0.05, 0.07, P.neonMagenta, [0, 1.65, 3.99]), 2);
  // bumper
  box(2.9, 0.3, 0.25, "#ffffff", [0, 1.0, 4.1], { texture: hazard });
  box(2.9, 0.1, 0.3, P.hullDark, [0, 0.85, 4.1]);
  b.rod([-0.9, 1.15, 4.3], [0.9, 1.15, 4.3], 0.04, P.metalDark, { bone: body });
  // light bar
  box(2.0, 0.14, 0.2, P.hullDark, [0, 2.72, 2.5]);
  for (let i = 0; i < 6; i++) glow(box(0.26, 0.09, 0.05, i % 2 ? P.warnRed : P.ember, [-0.75 + i * 0.3, 2.72, 2.62]), 2);
  // sensor dome and antennas
  b.lathe([[0, 0], [0.2, 0], [0.18, 0.1], [0.1, 0.17], [0, 0.19]], { at: [0, 2.65, 2.1], bone: body, color: P.hullLight, segments: 8 });
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.neonCyan, { bone: body, at: [0, 2.83, 2.18] }), 2);
  for (const s of [1, -1]) {
    b.rod([s * 1.3, 2.62, 0.95], [s * 1.35, 3.4, 0.9], 0.012, P.metalDark, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: body, at: [s * 1.35, 3.42, 0.9] }), 2);
  }
  // rear wall and cab-side neon
  box(2.9, 1.2, 0.08, P.hullDark, [0, 1.9, 0.84]);
  for (const s of [1, -1]) glow(box(0.03, 0.03, 1.8, P.neonCyan, [s * 1.47, 1.45, 1.75]), 1.5);
  // rivet row on hood
  for (let i = 0; i < 12; i++) b.part(new THREE.SphereGeometry(0.025, 5, 4), P.rim, { bone: body, at: [-1.1 + i * 0.2, 2.3 + (R() - 0.5) * 0.01, 3.7] });
}
    return buildCab;
  })(),
  // cargo
  (() => {
function buildCargo({ b, J, P, M }: any) {
  const body = J.body;
  const ramp = J.ramp;
  const R = rng(11);

  const stencil = (n: string) =>
    svg(
      `<svg viewBox="0 0 64 32"><rect x="1" y="1" width="62" height="30" fill="none" stroke="#e7b814" stroke-width="3"/><text x="32" y="24" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="22" fill="#e7b814">${n}</text></svg>`,
      { size: 128 },
    );
  const hazard = svg(
    `<svg viewBox="0 0 32 16"><rect width="32" height="16" fill="#e7b814"/><path d="M0 16L8 0H16L8 16ZM16 16L24 0H32L24 16Z" fill="#1a1e26"/></svg>`,
    { size: 128 },
  );
  const wall = panelled(P.hull, { size: 0.5, aspect: 0.8, rivets: 0.1 });
  const roofPaint = paint((p, n) =>
    mix(P.hullDark, P.hullLight, smoothstep(0.4, 0.8, noise(p, 0.3, 4)) * 0.6 + n.y * 0.1),
  );

  const box = (w: number, h: number, d: number, c: any, at: number[], o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone: body, at, ...o });

  // main container shell
  box(2.9, 1.5, 4.8, wall, [0, 2.05, -1.6]);
  // roof plate
  box(2.7, 0.08, 4.6, roofPaint, [0, 2.84, -1.6]);
  // ribs on sides
  for (const s of [1, -1])
    for (let i = 0; i < 7; i++) {
      const z = 0.5 - i * 0.7;
      box(0.08, 1.45, 0.12, P.hullLight, [s * 1.47, 2.05, z]);
    }
  // corner posts
  for (const sx of [1, -1])
    for (const [z, zz] of [[0.72, 0.1], [-3.92, 0.1]] as number[][]) {
      box(0.18, 1.65, 0.18, "#ffffff", [sx * 1.43, 2.12, z], { texture: hazard });
    }
  // magenta neon top edge
  for (const s of [1, -1]) {
    glow(box(0.06, 0.06, 4.7, P.neonMagenta, [s * 1.5, 2.8, -1.6]), 1.6);
  }
  glow(box(2.8, 0.06, 0.06, P.neonMagenta, [0, 2.8, -3.98]), 1.6);

  // stencil decals and vents on sides
  for (const s of [1, -1]) {
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      bone: body,
      at: [s * 1.505, 2.45, -0.2],
      dir: [s, 0, 0],
      axis: "z",
      texture: stencil("77-A"),
    });
    b.part(new THREE.PlaneGeometry(0.9, 0.45), "#ffffff", {
      bone: body,
      at: [s * 1.505, 2.45, -2.8],
      dir: [s, 0, 0],
      axis: "z",
      texture: stencil(s > 0 ? "L-03" : "R-04"),
    });
    // sliding vents with cyan slits
    for (let i = 0; i < 2; i++) {
      const z = -1.0 - i * 0.9;
      box(0.06, 0.5, 0.7, P.metalDark, [s * 1.52, 1.85, z]);
      for (let k = 0; k < 4; k++)
        glow(box(0.04, 0.04, 0.55, P.neonCyan, [s * 1.555, 1.7 + k * 0.1, z]), 1.5);
    }
  }
  // front face against cab
  box(2.9, 1.5, 0.1, P.hullDark, [0, 2.05, 0.78]);

  // roof rails
  for (const s of [1, -1]) {
    box(0.06, 0.06, 4.4, P.rim, [s * 1.2, 3.02, -1.6]);
    for (let i = 0; i < 6; i++) box(0.06, 0.16, 0.06, P.rim, [s * 1.2, 2.94, 0.3 - i * 0.8]);
  }
  // hatch
  box(0.9, 0.08, 0.9, P.metalDark, [0.5, 2.92, -0.3]);
  box(0.5, 0.05, 0.08, P.trim, [0.5, 2.97, -0.3]);
  // warning red lights
  for (const s of [1, -1]) {
    glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), P.warnRed, { bone: body, at: [s * 1.3, 2.95, 0.6] }), 1.8);
  }
  // ammo crates on roof
  for (let i = 0; i < 3; i++) {
    box(0.5, 0.3, 0.35, P.olive, [-0.7 + i * 0.1, 3.0, -0.9 - i * 0.45], { rotation: [0, R() * 20 - 10, 0] });
    box(0.52, 0.04, 0.05, P.trim, [-0.7 + i * 0.1, 3.0, -0.9 - i * 0.45]);
  }
  // rail gun ring base
  b.part(new THREE.CylinderGeometry(0.6, 0.7, 0.12, 12), metal("iron"), {
    bone: body,
    at: [M.railGunRing[0], 2.9, M.railGunRing[2]],
  });
  b.part(new THREE.TorusGeometry(0.58, 0.04, 5, 16), P.trim, {
    bone: body,
    at: [0, 2.97, M.railGunRing[2]],
    rotation: [90, 0, 0],
  });
  // antennas
  for (const [x, z, h] of [[-1.3, 0.5, 1.0], [1.35, -3.7, 0.7]] as number[][]) {
    b.rod([x, 2.9, z], [x, 2.9 + h, z], 0.012, P.rim, { bone: body });
    glow(b.part(new THREE.SphereGeometry(0.03, 5, 4), P.warnRed, { bone: body, at: [x, 2.9 + h, z] }), 1.5);
  }
  // cable bundles
  for (const s of [1, -1])
    b.sweep(
      [[s * 0.9, 2.9, 0.4], [s * 0.7, 3.0, -0.6], [s * 0.2, 3.05, -1.6], [0, 3.0, -2.1]],
      0.03,
      { bone: body, color: P.rubber },
    );
  // hydraulic rams
  for (const s of [1, -1]) {
    b.rod([s * 1.25, 1.45, -3.7], [s * 1.25, 2.2, -4.05], 0.05, P.rim, { bone: body });
    b.rod([s * 1.25, 1.8, -3.85], [s * 1.25, 2.2, -4.05], 0.03, P.hullLight, { bone: body });
  }
  // rear bumper & tail lights
  box(3.0, 0.22, 0.2, "#ffffff", [0, 1.42, -4.02], { texture: hazard });
  for (const s of [1, -1]) {
    glow(box(0.3, 0.1, 0.05, P.warnRed, [s * 1.2, 1.7, -4.0]), 1.6);
  }

  // ramp door on joint
  const rampDoor = b.part(new THREE.BoxGeometry(2.7, 1.3, 0.12), wall, {
    bone: ramp,
    at: [0, 2.0, -4.06],
  });
  b.part(new THREE.PlaneGeometry(2.4, 0.6), "#ffffff", {
    bone: ramp,
    at: [0, 2.0, -4.13],
    dir: [0, 0, -1],
    axis: "z",
    texture: hazard,
  });
  box(2.7, 0.1, 0.16, P.trim, [0, 2.7, -4.07], { bone: ramp });
  for (const s of [1, -1]) {
    b.part(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 8), P.rim, {
      bone: ramp,
      at: [s * 1.2, 1.35, -4.06],
      rotation: [0, 0, 90],
    });
    glow(b.part(new THREE.BoxGeometry(0.4, 0.05, 0.03), P.neonCyan, { bone: ramp, at: [s * 0.9, 2.55, -4.14] }), 1.4);
  }
  void rampDoor;
}
    return buildCargo;
  })(),
  // weapons
  (() => {
function buildWeapons({ b, J, P, M }: any) {
  const R = rng(5);
  const panel = paint((p: THREE.Vector3, n: THREE.Vector3) => {
    const base = mix(P.hull, P.hullLight, smoothstep(0.2, 0.9, noise(p, 0.15, 3)) * 0.5 + Math.max(n.y, 0) * 0.2);
    const gx = Math.abs(((p.x + p.z) / 0.14) % 1 - 0.5) < 0.02 || Math.abs((p.y / 0.1) % 1 - 0.5) < 0.02;
    return gx ? mix(base, P.hullDark, 0.8) : base;
  });
  const hazard = svg(`<svg viewBox="0 0 32 8"><rect width="32" height="8" fill="#e7b814"/><path d="M0 8L8 0H16L8 8ZM16 8L24 0H32L24 8Z" fill="#1a1e26"/></svg>`, { size: 128 });
  const box = (w: number, h: number, d: number, c: any, at: number[], bone: any, extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { bone, at, flat: true, ...extra });
  const cyl = (r0: number, r1: number, len: number, seg: number, c: any, at: number[], bone: any, dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.CylinderGeometry(r0, r1, len, seg), c, { bone, at, dir, flat: true });
  const stripe = (w: number, d: number, at: number[], bone: any) =>
    b.part(new THREE.PlaneGeometry(w, d), "#ffffff", { bone, at, dir: [0, 1, 0], axis: "z", texture: hazard });

  // ===== Remote turret =====
  const ty = J.turretYaw, tg = J.turretGun;
  cyl(0.5, 0.55, 0.08, 8, P.metalDark, [0, 2.59, 1.4], ty, [0, 1, 0]);
  cyl(0.42, 0.42, 0.06, 8, P.trim, [0, 2.65, 1.4], ty, [0, 1, 0]);
  box(0.7, 0.22, 0.6, panel, [0, 2.8, 1.4], ty);
  // angular shield
  b.part(new THREE.CylinderGeometry(0.28, 0.42, 0.4, 6), panel, { bone: tg, at: [0, 2.95, 1.45], flat: true });
  box(0.62, 0.3, 0.28, panel, [0, 2.88, 1.75], tg, { rotation: [-15, 0, 0] });
  box(0.7, 0.04, 0.3, P.trim, [0, 3.04, 1.7], tg);
  stripe(0.5, 0.08, [0, 3.1, 1.45], tg);
  for (const s of [1, -1]) {
    box(0.1, 0.1, 0.45, P.hullDark, [s * 0.2, 2.9, 1.95], tg);
    cyl(0.04, 0.04, 0.9, 8, P.metalDark, [s * 0.2, 2.9, 2.4], tg);
    cyl(0.07, 0.07, 0.14, 6, P.hullDark, [s * 0.2, 2.9, 2.85], tg);
    for (const z of [2.82, 2.88])
      box(0.12, 0.02, 0.02, P.ember, [s * 0.2, 2.9, z], tg, {});
    box(0.26, 0.2, 0.3, P.olive, [s * 0.5, 2.85, 1.35], tg);
    box(0.28, 0.03, 0.32, P.trim, [s * 0.5, 2.96, 1.35], tg);
  }
  glow(b.part(new THREE.SphereGeometry(0.07, 6, 4), P.neonCyan, { bone: tg, at: [0, 2.98, 1.92] }), 1.5);
  cyl(0.04, 0.05, 0.14, 6, P.rubber, [0.3, 3.1, 1.3], tg);
  glow(b.part(new THREE.SphereGeometry(0.03, 6, 4), P.neonCyan, { bone: tg, at: [0.3, 3.1, 1.38] }), 1.5);
  b.rod([-0.25, 3.05, 1.2], [-0.3, 3.45, 1.1], 0.01, P.metalDark, { bone: tg });

  // ===== Rail gun =====
  const ry = J.railYaw, rg = J.railGun;
  const cz = -2.2;
  cyl(0.55, 0.65, 0.1, 8, P.metalDark, [0, 2.99, cz], ry, [0, 1, 0]);
  cyl(0.3, 0.4, 0.2, 8, panel, [0, 3.14, cz], ry, [0, 1, 0]);
  cyl(0.5, 0.5, 0.03, 8, P.trim, [0, 3.03, cz], ry, [0, 1, 0]);
  for (const s of [1, -1]) {
    box(0.14, 0.45, 0.5, panel, [s * 0.38, 3.35, cz], ry);
    box(0.16, 0.04, 0.52, P.trim, [s * 0.38, 3.59, cz], ry);
  }
  box(0.7, 0.3, 1.0, panel, [0, 3.2, cz - 0.1], rg);
  box(0.4, 0.08, 0.8, P.hullDark, [0, 3.38, cz - 0.1], rg);
  // rails
  for (const s of [1, -1]) {
    box(0.1, 0.12, 3.0, P.metalDark, [s * 0.12, 3.25, cz + 1.9], rg);
    box(0.04, 0.04, 2.9, P.neonMagenta, [s * 0.12, 3.33, cz + 1.9], rg);
    glow(b.part(new THREE.BoxGeometry(0.03, 0.03, 2.8), P.neonMagenta, { bone: rg, at: [s * 0.12, 3.33, cz + 1.9] }), 1.5);
    // capacitors
    cyl(0.12, 0.12, 0.6, 8, P.hullLight, [s * 0.5, 3.2, cz - 0.1], rg);
    glow(b.part(new THREE.CylinderGeometry(0.095, 0.095, 0.5, 8), P.neonCyan, { bone: rg, at: [s * 0.5, 3.2, cz - 0.1], dir: [0, 0, 1] }), 1.3);
    for (const z of [-0.35, 0.15]) cyl(0.14, 0.14, 0.05, 8, P.trim, [s * 0.5, 3.2, cz - 0.1 + z], rg);
  }
  // coil rings
  for (let i = 0; i < 6; i++) {
    const z = cz + 0.9 + i * 0.5;
    glow(b.part(new THREE.TorusGeometry(0.2, 0.035, 5, 8), P.neonMagenta, { bone: rg, at: [0, 3.25, z] }), 1.6);
    box(0.5, 0.05, 0.08, P.hullDark, [0, 3.05, z], rg);
  }
  cyl(0.1, 0.12, 0.2, 6, P.hullDark, [0, 3.25, cz + 3.45], rg);
  glow(b.part(new THREE.SphereGeometry(0.08, 6, 4), P.ember, { bone: rg, at: [0, 3.25, cz + 3.58] }), 2);
  stripe(0.6, 0.15, [0, 3.355, cz + 0.55], rg);
  // radiator fins
  for (let i = 0; i < 7; i++) box(0.5, 0.2, 0.025, P.metalDark, [0, 3.45, cz - 0.4 - i * 0.07], rg);
  box(0.5, 0.04, 0.5, P.hullDark, [0, 3.34, cz - 0.4 - 0.2], rg);
  // sensor
  glow(b.part(new THREE.SphereGeometry(0.05, 6, 4), P.neonCyan, { bone: rg, at: [0, 3.4, cz + 0.4] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.04, 6, 4), P.warnRed, { bone: rg, at: [0.3, 3.4, cz - 0.55] }), 1.5);
  // hoses
  for (const s of [1, -1])
    b.sweep([[s * 0.5, 3.1, cz - 0.3], [s * 0.6, 3.05, cz - 0.1], [s * 0.45, 3.1, cz + 0.05], [s * 0.3, 3.0, cz]], 0.022, { color: P.rubber, bone: rg });
  for (const s of [1, -1])
    b.sweep([[s * 0.15, 3.15, cz - 0.55], [s * 0.3, 3.0, cz - 0.7], [s * 0.2, 2.97, cz - 0.4]], 0.02, { color: P.rubber, bone: ry });
}
    return buildWeapons;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "warhound2077" });
  const J: Record<string, Joint> = {};
  J["body"] = b.joint("body", { at: [0,1,0], dir: [0,0,1], role: "spine" });
  J["turretYaw"] = b.joint("turretYaw", { parent: J["body"], at: [0,2.55,1.4], dir: [0,1,0], role: "hinge", group: "turret" });
  J["turretGun"] = b.joint("turretGun", { parent: J["turretYaw"], at: [0,2.85,1.55], dir: [0,0,1], role: "hinge", group: "turret" });
  J["railYaw"] = b.joint("railYaw", { parent: J["body"], at: [0,2.95,-2.2], dir: [0,1,0], role: "hinge", group: "turret" });
  J["railGun"] = b.joint("railGun", { parent: J["railYaw"], at: [0,3.05,-2.2], dir: [0,0,1], role: "hinge", group: "turret" });
  J["ramp"] = b.joint("ramp", { parent: J["body"], at: [0,1.3,-4], dir: [0,0,-1], role: "hinge", group: "cargo" });
  J["wheelFL"] = b.joint("wheelFL", { parent: J["body"], at: [1.45,0.62,2.9], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelFR"] = b.joint("wheelFR", { parent: J["body"], at: [-1.45,0.62,2.9], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelML"] = b.joint("wheelML", { parent: J["body"], at: [1.45,0.62,-0.4], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelMR"] = b.joint("wheelMR", { parent: J["body"], at: [-1.45,0.62,-0.4], dir: [-1,0,0], role: "hinge", group: "wheels" });
  J["wheelRL"] = b.joint("wheelRL", { parent: J["body"], at: [1.45,0.62,-2.6], dir: [1,0,0], role: "hinge", group: "wheels" });
  J["wheelRR"] = b.joint("wheelRR", { parent: J["body"], at: [-1.45,0.62,-2.6], dir: [-1,0,0], role: "hinge", group: "wheels" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
