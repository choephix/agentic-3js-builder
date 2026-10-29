import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Lionheart Gunblade",
  "description": "A Final Fantasy VIII-style gunblade standing upright on its pommel: a long single-edged silver blade with a revolver mechanism in the hilt, gold filigree, glowing crystals and a lion pendant on a chain."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  steelLight: "#e4ecf6",
  steelMid: "#aebcd0",
  steelDark: "#5f6e88",
  edgeBright: "#f8fcff",
  fullerBlue: "#3b5c93",
  gold: "#ebbd4c",
  goldDark: "#a97a2a",
  goldLight: "#ffe28a",
  gunmetal: "#3b404e",
  gunmetalLight: "#6c7488",
  ink: "#14121c",
  leather: "#2b2234",
  leatherRed: "#7d2031",
  crystalCyan: "#38e8ff",
  crystalDeep: "#1b8fd2",
  ruby: "#e0384b",
  lionSilver: "#d2d9e4",
  chainSteel: "#c3c9d6",
  brassShell: "#d8a340",
};
const M = {
  pommelBase: [0, 0, 0] as [number, number, number],
  gripBottom: [0, 0.14, 0] as [number, number, number],
  gripTop: [0, 0.4, 0] as [number, number, number],
  chainRing: [0.075, 0.09, -0.02] as [number, number, number],
  cylinderCenter: [0, 0.54, 0.02] as [number, number, number],
  triggerPivot: [0, 0.5, 0.1] as [number, number, number],
  hammerPivot: [0, 0.64, -0.07] as [number, number, number],
  guardCenter: [0, 0.73, -0.01] as [number, number, number],
  bladeBase: [0, 0.8, -0.015] as [number, number, number],
  bladeTip: [0, 1.5, 0.02] as [number, number, number],
  spineFront: [0, 1, 0.055] as [number, number, number],
  edgeBack: [0, 1, -0.085] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // blade
  (() => {
function buildBlade({ b, J, P, M }: Ctx) {
  const Y0 = 0.8;
  const X: [number, number, number] = [0, 0, 1]; // outline x runs along +Z
  const Y: [number, number, number] = [0, 1, 0];
  // Local outline coords: u = z, v = height above Y0. Origin at (0, Y0, 0).
  const at = (x: number): [number, number, number] => [x, Y0, 0];

  const ex = (outline: any[], x: number, th: number, color: string, extra: any = {}) =>
    b.extrude(outline, { at: at(x), x: X, y: Y, thickness: th, color, ...extra });

  // Main plate outline (z from edge -0.07 to spine 0.05, tip at z 0.02, v = 0.70)
  const plate: any[] = [
    [-0.07, 0],
    [0.05, 0],
    [0.052, 0.45],
    [0.045, 0.6],
    [0.02, 0.7, "sharp"],
    [-0.02, 0.62],
    [-0.05, 0.3],
  ];
  ex(plate, 0, 0.018, P.steelLight);

  // Tang hidden in guard
  b.part(new THREE.BoxGeometry(0.03, 0.04, 0.05), P.steelDark, { bone: J.body, at: [0, 0.78, -0.015] });

  // Spine strip (steelMid, thicker 0.05... use 0.03 for box limit)
  ex(
    [
      [0.032, 0],
      [0.055, 0],
      [0.056, 0.45],
      [0.05, 0.6],
      [0.03, 0.69, "sharp"],
      [0.028, 0.6],
      [0.03, 0.3],
    ],
    0,
    0.03,
    P.steelMid,
  );

  // Edge bevel strip edgeBright along sharp edge (-Z), on both sides
  const bevel: any[] = [
    [-0.07, 0],
    [-0.052, 0],
    [-0.038, 0.3],
    [-0.012, 0.62],
    [0.02, 0.7, "sharp"],
    [-0.02, 0.62],
    [-0.05, 0.3],
  ];
  ex(bevel, 0, 0.006, P.edgeBright);
  // ink line between bevel and plate
  for (const s of [1, -1]) {
    const line: any[] = [
      [-0.054, 0.002],
      [-0.051, 0.002],
      [-0.037, 0.3],
      [-0.011, 0.62],
      [-0.017, 0.62],
      [-0.041, 0.3],
    ];
    ex(line, s * 0.0092, 0.0016, P.ink);
  }

  // Spine notches
  for (let i = 0; i < 9; i++) {
    const v = 0.06 + i * 0.062;
    for (const s of [1, -1])
      b.part(new THREE.BoxGeometry(0.004, 0.012, 0.012), P.ink, { bone: J.body, at: [s * 0.0155, Y0 + v, 0.054] });
  }

  // Barrel ridge on upper third of spine
  b.part(new THREE.BoxGeometry(0.036, 0.22, 0.012), P.gunmetal, { bone: J.body, at: [0, Y0 + 0.5, 0.058] });
  b.part(new THREE.BoxGeometry(0.038, 0.01, 0.014), P.ink, { bone: J.body, at: [0, Y0 + 0.605, 0.058] });
  b.part(new THREE.BoxGeometry(0.01, 0.2, 0.004), P.gunmetalLight, { bone: J.body, at: [0, Y0 + 0.5, 0.0655] });

  // Fuller groove + highlight, tapering toward tip, both faces
  for (const s of [1, -1]) {
    const fx = s * 0.0092;
    ex(
      [
        [-0.03, 0.06],
        [0.02, 0.06],
        [0.016, 0.4],
        [0.0, 0.58, "sharp"],
        [-0.02, 0.4],
      ],
      fx,
      0.002,
      P.fullerBlue,
    );
    ex(
      [
        [-0.03, 0.065],
        [-0.024, 0.065],
        [-0.014, 0.4],
        [0.0, 0.56, "sharp"],
        [-0.004, 0.4],
      ],
      s * 0.0102,
      0.0014,
      P.edgeBright,
    );
    // ink lower outline on fuller
    ex(
      [
        [-0.034, 0.055],
        [0.024, 0.055],
        [0.024, 0.06],
        [-0.034, 0.06],
      ],
      s * 0.0092,
      0.0016,
      P.ink,
    );
    // runes
    const runes: [number, number][] = [
      [0.0, 0.16],
      [0.0, 0.24],
      [-0.002, 0.32],
      [-0.004, 0.4],
      [-0.006, 0.47],
    ];
    runes.forEach(([z, v], i) => {
      const w = 0.012 - i * 0.001;
      const rx = s * 0.0112;
      glow(b.part(new THREE.BoxGeometry(0.0016, 0.02, 0.003), P.crystalCyan, { bone: J.body, at: [rx, Y0 + v, z - w / 2 + 0.003] }), 1.4);
      glow(b.part(new THREE.BoxGeometry(0.0016, 0.003, w), P.crystalCyan, { bone: J.body, at: [rx, Y0 + v + 0.008, z] }), 1.4);
      if (i % 2 === 0)
        glow(b.part(new THREE.BoxGeometry(0.0016, 0.012, 0.003), P.crystalCyan, { bone: J.body, at: [rx, Y0 + v - 0.004, z + w / 2 - 0.002] }), 1.4);
    });
    // lion engraving near ricasso: face + mane spikes + eyes
    const lx = s * 0.0096;
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.0014, 8), P.steelDark, { bone: J.body, at: [lx, Y0 + 0.11, -0.012], dir: [1, 0, 0] });
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.004, 0.011, 4), P.steelDark, {
        bone: J.body,
        at: [lx, Y0 + 0.11 + Math.cos(a) * 0.017, -0.012 + Math.sin(a) * 0.017],
        dir: [0, Math.cos(a), Math.sin(a)],
      });
    }
    for (const e of [-1, 1])
      b.part(new THREE.BoxGeometry(0.0016, 0.003, 0.003), P.ink, { bone: J.body, at: [s * 0.0105, Y0 + 0.114, -0.012 + e * 0.005] });
    b.part(new THREE.BoxGeometry(0.0016, 0.004, 0.006), P.ink, { bone: J.body, at: [s * 0.0105, Y0 + 0.103, -0.012] });
    // rivets
    for (const [z, v] of [[0.03, 0.04], [-0.04, 0.04], [0.03, 0.2]] as [number, number][])
      b.part(new THREE.CylinderGeometry(0.0045, 0.0045, 0.003, 6), P.gold, { bone: J.body, at: [s * 0.0105, Y0 + v, z], dir: [1, 0, 0] });
  }

  // Jagged 3-notch cutout near tip on edge side (ink-outlined triangular teeth)
  const notches: [number, number][] = [
    [0.5, -0.026],
    [0.56, -0.012],
    [0.62, 0.0],
  ];
  // approximate edge z at v
  const edgeZ = (v: number) => -0.07 + (v < 0.3 ? 0.02 * (v / 0.3) : 0.02 + 0.05 * ((v - 0.3) / 0.32));
  void edgeZ;
  notches.forEach(([v, z]) => {
    for (const s of [1, -1]) {
      b.part(new THREE.ConeGeometry(0.011, 0.024, 4), P.ink, {
        bone: J.body,
        at: [s * 0.0092, Y0 + v, z - 0.012],
        dir: [0, 0.4, -1],
      });
      b.part(new THREE.ConeGeometry(0.007, 0.017, 4), P.steelDark, {
        bone: J.body,
        at: [s * 0.0098, Y0 + v, z - 0.012],
        dir: [0, 0.4, -1],
      });
    }
  });
}
    return buildBlade;
  })(),
  // guard
  (() => {
function buildGuard({ b, P, M }: any) {
  const cx = 0, cz = -0.01;
  const box = (w: number, h: number, d: number, c: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot, flat: true });

  // central block
  box(0.1, 0.12, 0.1, P.gold, [cx, 0.73, cz]);
  box(0.102, 0.02, 0.102, P.goldDark, [cx, 0.672, cz]);
  box(0.102, 0.012, 0.102, P.goldLight, [cx, 0.794, cz]);
  // collar plate under
  box(0.13, 0.008, 0.12, P.steelMid, [cx, 0.664, cz]);
  // ricasso collar on top
  box(0.075, 0.016, 0.05, P.steelDark, [cx, 0.806, -0.015]);
  box(0.06, 0.01, 0.035, P.ink, [cx, 0.816, -0.015]);

  const D = (r: number, h: number, c: string, at: number[], rot: number[], seg = 4) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, rotation: rot, flat: true });

  for (const s of [1, -1]) {
    // diamond window on x faces
    const fx = s * 0.052;
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 4), P.ink, { at: [fx, 0.73, cz], rotation: [0, 0, 90], flat: true });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.006, 4), P.goldLight, { at: [fx + s * 0.001, 0.73, cz], rotation: [0, 0, 90], scale: [0.8, 1, 0.8], flat: true });
    glow(b.part(new THREE.OctahedronGeometry(0.024), P.crystalCyan, { at: [fx + s * 0.008, 0.73, cz], scale: [0.5, 1, 0.8], flat: true }), 1.5);

    // wing arms: layered feather blades
    const layers = [
      { c: P.goldDark, len: 0.15, y: 0.715, z: -0.02, w: 0.03 },
      { c: P.gold, len: 0.15, y: 0.73, z: -0.01, w: 0.034 },
      { c: P.goldLight, len: 0.14, y: 0.745, z: 0.0, w: 0.022 },
    ];
    layers.forEach((L, li) => {
      const n = 4;
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n;
        const x = s * (0.05 + t * L.len * 0.95);
        const lift = Math.pow(t, 2) * 0.07;
        const w = 0.045 * (1 - t * 0.45);
        const h = 0.036 * (1 - t * 0.5);
        const rotZ = s * Math.pow(t, 1.5) * 35;
        box(L.len / n * 1.15, h * (li === 2 ? 0.7 : 1), w + (li === 2 ? -0.01 : 0), L.c,
          [x, L.y + lift - (li === 0 ? 0.005 : 0), L.z - t * 0.02], [0, 0, rotZ]);
      }
    });
    // upward curved wing tip
    b.part(new THREE.ConeGeometry(0.016, 0.075, 4), P.goldLight, { at: [s * 0.195, 0.79, -0.04], rotation: [-25, 0, -s * 12], flat: true });
    b.part(new THREE.ConeGeometry(0.012, 0.05, 4), P.gold, { at: [s * 0.172, 0.775, -0.03], rotation: [-18, 0, -s * 8], flat: true });
    // inner steel plate and slits
    box(0.07, 0.016, 0.05, P.steelMid, [s * 0.1, 0.724, 0.0], [0, 0, s * 8]);
    for (let i = 0; i < 3; i++)
      box(0.004, 0.02, 0.03, P.ink, [s * (0.085 + i * 0.022), 0.742 + i * 0.004, 0.0]);
    // rivets
    for (const x of [0.06, 0.12])
      b.part(new THREE.SphereGeometry(0.006, 5, 4), P.goldLight, { at: [s * x, 0.67, 0.03] });
    // spikes at bottom of arms
    b.part(new THREE.ConeGeometry(0.014, 0.05, 4), P.goldDark, { at: [s * 0.15, 0.70, 0.0], rotation: [0, 0, s * 100], flat: true });
  }

  // lion emblem on +Z front
  const fz = cz + 0.05;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.008, 0.026, 4), i % 2 ? P.gold : P.goldLight, {
      at: [Math.cos(a) * 0.034, 0.73 + Math.sin(a) * 0.034, fz + 0.006],
      rotation: [0, 0, Math.atan2(Math.sin(a), Math.cos(a)) * 180 / Math.PI - 90], flat: true,
    });
  }
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 8), P.goldDark, { at: [cx, 0.73, fz + 0.004], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(0.024, 0.024, 0.01, 8), P.lionSilver, { at: [cx, 0.73, fz + 0.009], rotation: [90, 0, 0], flat: true });
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.005, 5, 4), P.ink, { at: [s * 0.01, 0.738, fz + 0.015] });
    box(0.012, 0.003, 0.003, P.ink, [s * 0.012, 0.746, fz + 0.015], [0, 0, -s * 20]);
  }
  box(0.016, 0.01, 0.006, P.steelMid, [cx, 0.722, fz + 0.015]);
  box(0.008, 0.004, 0.004, P.ink, [cx, 0.726, fz + 0.018]);
  box(0.012, 0.002, 0.003, P.ink, [cx, 0.716, fz + 0.016]);
}
    return buildGuard;
  })(),
  // gunMechanism
  (() => {
function buildGunMechanism({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], axis: "x" | "y" | "z") => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
    return b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: at as [number, number, number], dir: dir as [number, number, number] });
  };
  const [cx, cy, cz] = M.cylinderCenter;

  // frame: side plates, top, back strap, bottom
  for (const s of [1, -1]) {
    box(0.014, 0.25, 0.3, P.gunmetal, s * 0.048, 0.525, 0.04);
    // bevel edges
    box(0.004, 0.25, 0.008, P.gunmetalLight, s * 0.056, 0.525, 0.188);
    box(0.004, 0.008, 0.3, P.gunmetalLight, s * 0.056, 0.649, 0.04);
    box(0.004, 0.008, 0.3, P.gunmetalLight, s * 0.056, 0.402, 0.04);
    // ink seams
    box(0.004, 0.2, 0.004, P.ink, s * 0.056, 0.525, -0.06);
    box(0.004, 0.004, 0.2, P.ink, s * 0.056, 0.45, 0.06);
    box(0.004, 0.004, 0.2, P.ink, s * 0.056, 0.6, 0.06);
    // goldDark trim lines
    box(0.004, 0.004, 0.14, P.goldDark, s * 0.057, 0.62, 0.0);
    box(0.004, 0.004, 0.14, P.goldDark, s * 0.057, 0.43, 0.0);
    // lion medallion on plate (rear of cylinder)
    cyl(0.026, 0.026, 0.006, 8, P.ink, [s * 0.057, 0.595, -0.06], "x");
    cyl(0.022, 0.022, 0.008, 8, P.gold, [s * 0.058, 0.595, -0.06], "x");
    box(0.01, 0.018, 0.016, P.goldDark, s * 0.062, 0.595, -0.06);
    box(0.01, 0.006, 0.006, P.ink, s * 0.064, 0.6, -0.066);
    box(0.01, 0.006, 0.006, P.ink, s * 0.064, 0.6, -0.054);
    // screws
    for (const [y, z] of [[0.42, -0.08], [0.64, -0.08], [0.42, 0.17], [0.64, 0.17]])
      cyl(0.006, 0.006, 0.006, 6, P.goldLight, [s * 0.057, y, z], "x");
  }
  box(0.11, 0.016, 0.3, P.gunmetal, 0, 0.652, 0.04);
  box(0.11, 0.012, 0.3, P.gunmetal, 0, 0.406, 0.04);
  box(0.11, 0.25, 0.02, P.gunmetal, 0, 0.525, -0.09);
  box(0.11, 0.004, 0.3, P.gunmetalLight, 0, 0.661, 0.04);
  box(0.04, 0.2, 0.012, P.gunmetalLight, 0, 0.525, -0.1);
  // grip tang
  box(0.03, 0.08, 0.03, P.steelDark, 0, 0.44, 0.0);

  // front face with crystal slit
  box(0.11, 0.2, 0.012, P.gunmetal, 0, 0.53, 0.196);
  glow(box(0.012, 0.12, 0.004, P.crystalDeep, 0, 0.53, 0.204), 1.4);
  box(0.02, 0.13, 0.003, P.ink, 0, 0.53, 0.2);

  // cylinder
  cyl(0.055, 0.055, 0.082, 12, P.steelMid, [cx, cy, cz], "x");
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const y = cy + Math.cos(a) * 0.05, z = cz + Math.sin(a) * 0.05;
    // flute grooves on outside
    b.part(new THREE.BoxGeometry(0.07, 0.014, 0.014), P.steelDark, { at: [0, y, z], rotation: [(a * 180) / Math.PI * -1 + 90, 0, 0] });
    for (const s of [1, -1]) {
      const ca = (i / 6) * Math.PI * 2;
      const hy = cy + Math.cos(ca) * 0.032, hz = cz + Math.sin(ca) * 0.032;
      cyl(0.011, 0.011, 0.008, 8, P.brassShell, [s * 0.042, hy, hz], "x");
      cyl(0.0075, 0.0075, 0.01, 8, P.ink, [s * 0.043, hy, hz], "x");
    }
  }
  for (const s of [1, -1]) {
    cyl(0.012, 0.012, 0.012, 8, P.gold, [s * 0.045, cy, cz], "x");
    cyl(0.005, 0.005, 0.016, 6, P.goldLight, [s * 0.047, cy, cz], "x");
  }
  cyl(0.008, 0.008, 0.11, 6, P.goldDark, [0, cy, cz], "x");

  // barrel stub
  cyl(0.02, 0.02, 0.1, 8, P.gunmetal, [0, 0.585, 0.17], "z");
  cyl(0.024, 0.024, 0.014, 8, P.gunmetalLight, [0, 0.585, 0.13], "z");
  cyl(0.013, 0.013, 0.006, 8, P.ink, [0, 0.585, 0.222], "z");

  // hammer
  const [hx, hy, hz] = M.hammerPivot;
  cyl(0.009, 0.009, 0.03, 8, P.goldLight, [hx, hy, hz], "x");
  b.part(new THREE.BoxGeometry(0.016, 0.05, 0.016), P.gunmetalLight, { at: [hx, hy + 0.018, hz - 0.012], rotation: [25, 0, 0] });
  b.part(new THREE.BoxGeometry(0.02, 0.014, 0.03), P.gunmetalLight, { at: [hx, hy + 0.045, hz - 0.03] });
  for (let i = 0; i < 3; i++) box(0.022, 0.003, 0.003, P.ink, hx, hy + 0.053, hz - 0.04 + i * 0.01);

  // trigger and guard
  const [tx, ty, tz] = M.triggerPivot;
  box(0.014, 0.05, 0.016, P.steelMid, tx, ty - 0.02, tz + 0.01);
  b.part(new THREE.BoxGeometry(0.014, 0.03, 0.014), P.steelMid, { at: [tx, ty - 0.055, tz + 0.025], rotation: [-30, 0, 0] });
  cyl(0.008, 0.008, 0.018, 8, P.goldLight, [tx, ty + 0.005, tz], "x");
  const guard = b.sweep(
    [[0, 0.5, 0.1], [0, 0.46, 0.14], [0, 0.425, 0.19], [0, 0.41, 0.22], [0, 0.405, 0.17], [0, 0.41, 0.1]].map(
      (p) => p as [number, number, number],
    ),
    0.007,
    { color: P.gold, sides: 6, caps: "round" },
  );
  box(0.012, 0.014, 0.012, P.goldLight, 0, 0.412, 0.215);

  // ruby indicator
  box(0.03, 0.006, 0.03, P.goldDark, 0, 0.664, 0.0);
  glow(b.part(new THREE.OctahedronGeometry(0.014), P.ruby, { at: [0, 0.675, 0.0], scale: [1, 1.2, 1] }), 1.6);
  for (const s of [1, -1]) box(0.004, 0.006, 0.004, P.goldLight, s * 0.02, 0.665, 0.03);
}
    return buildGunMechanism;
  })(),
  // gripPommel
  (() => {
function buildGripPommel({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, y: number, x = 0, z = 0) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], flat: true });

  // pommel base: disc with gold rim and bevel
  cyl(0.065, 0.065, 0.016, 16, P.steelDark, 0.008);
  cyl(0.068, 0.068, 0.006, 16, P.gold, 0.019);
  cyl(0.055, 0.066, 0.01, 16, P.goldLight, 0.027);
  // pommel cap 8 sides
  cyl(0.05, 0.058, 0.04, 8, P.steelMid, 0.052);
  cyl(0.052, 0.052, 0.004, 8, P.ink, 0.074);
  cyl(0.044, 0.05, 0.02, 8, P.steelDark, 0.086);
  cyl(0.046, 0.046, 0.005, 8, P.goldLight, 0.0985);
  // ink groove at cap
  cyl(0.0585, 0.0585, 0.003, 8, P.ink, 0.034);

  // lion emblems on each x side
  for (const s of [1, -1]) {
    const x = s * 0.055;
    const face = (g: THREE.BufferGeometry, c: string, y: number, z: number, dx = 0) =>
      b.part(g, c, { at: [x + s * dx, y, z], rotation: [0, 0, -s * 90], flat: true });
    // mane
    face(new THREE.CylinderGeometry(0.02, 0.02, 0.006, 10), P.goldDark, 0.055, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      b.part(new THREE.ConeGeometry(0.006, 0.014, 4), P.gold, {
        at: [x + s * 0.002, 0.055 + Math.sin(a) * 0.022, Math.cos(a) * 0.022],
        dir: [s * 0.2, Math.sin(a), Math.cos(a)],
        flat: true,
      });
    }
    face(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 8), P.gold, 0.055, 0, 0.002);
    for (const e of [1, -1])
      b.part(new THREE.BoxGeometry(0.004, 0.003, 0.003), P.ink, { at: [x + s * 0.007, 0.059, e * 0.006] });
    b.part(new THREE.BoxGeometry(0.004, 0.003, 0.006), P.ink, { at: [x + s * 0.007, 0.049, 0] });
  }
  // ruby gem front
  glow(b.part(new THREE.OctahedronGeometry(0.014), P.ruby, { at: [0, 0.056, 0.055], scale: [1, 1.3, 0.8], flat: true }), 1.4);
  b.part(new THREE.TorusGeometry(0.016, 0.003, 4, 8), P.gold, { at: [0, 0.056, 0.052] });

  // bottom collar
  cyl(0.032, 0.032, 0.02, 8, P.gold, 0.15);
  cyl(0.0335, 0.0335, 0.003, 8, P.ink, 0.15);
  cyl(0.0325, 0.0325, 0.003, 8, P.goldLight, 0.158);
  // grip column
  cyl(0.026, 0.026, 0.22, 8, P.leather, 0.26);
  cyl(0.022, 0.03, 0.05, 8, P.steelDark, 0.125);
  // diagonal wraps
  for (let i = 0; i < 11; i++) {
    const y = 0.17 + i * 0.019;
    for (let k = 0; k < 4; k++) {
      const a = (i * 0.5 + k) * (Math.PI / 2);
      b.part(new THREE.BoxGeometry(0.02, 0.005, 0.004), P.leatherRed, {
        at: [Math.sin(a) * 0.0265, y, Math.cos(a) * 0.0265],
        rotation: [0, (a * 180) / Math.PI, 28],
        flat: true,
      });
    }
  }
  // top collar
  cyl(0.032, 0.032, 0.02, 8, P.gold, 0.39);
  cyl(0.0335, 0.0335, 0.003, 8, P.ink, 0.39);
  cyl(0.0325, 0.0325, 0.003, 8, P.goldLight, 0.397);
  cyl(0.0325, 0.0325, 0.003, 8, P.ink, 0.382);
  // top cap plate
  cyl(0.04, 0.04, 0.006, 8, P.steelDark, 0.399);
  b.part(new THREE.TorusGeometry(0.022, 0.0025, 4, 12), P.gold, { at: [0, 0.4, 0], rotation: [90, 0, 0] });

  // chain ring at +X
  const [rx, ry, rz] = M.chainRing;
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.025, 6), P.goldDark, { at: [0.062, ry, rz], rotation: [0, 0, 90], flat: true });
  b.part(new THREE.TorusGeometry(0.016, 0.004, 6, 12), P.gold, { at: [rx + 0.008, ry, rz], rotation: [0, 90, 0] });
  b.part(new THREE.TorusGeometry(0.0095, 0.0016, 4, 10), P.ink, { at: [rx + 0.008, ry, rz], rotation: [0, 90, 0] });
  b.part(new THREE.SphereGeometry(0.005, 6, 4), P.goldLight, { at: [0.064, ry, rz + 0.012] });
  void R;
  void frame;
}
    return buildGripPommel;
  })(),
  // lionCharm
  (() => {
function buildLionCharm({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const ring = M.chainRing;
  // Pendant centre: x 0.16, tilted 10 deg toward +Z, lowest spike at y ~0
  const MR = 0.04; // medallion radius
  const SPK = 0.03; // spike length
  const cx = 0.165;
  const cz = -0.02;
  const cy = MR + SPK + 0.003;
  const tilt = (10 * Math.PI) / 180;

  // Pendant local -> world helper (rotation about X, face normal +Z leaning)
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tilt);
  const W = (x: number, y: number, z: number): [number, number, number] => {
    const v = new THREE.Vector3(x, y, z).applyQuaternion(q);
    return [cx + v.x, cy + v.y, cz + v.z];
  };
  // Part with local orientation: geometry's +Y -> local dir
  const put = (g: THREE.BufferGeometry, color: string, lp: [number, number, number], opts: any = {}) => {
    const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), tilt);
    if (opts.rot) rot.multiply(opts.rot);
    return b.part(g, color, { at: W(...lp), quat: rot, flat: true });
  };
  const qx = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), a);
  const qz = (a: number) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), a);

  // Medallion: disc with axis along local Z
  const disc = (r: number, h: number, color: string, z: number, seg = 14) =>
    put(new THREE.CylinderGeometry(r, r, h, seg), color, [0, 0, z], { rot: qx(Math.PI / 2) });
  disc(MR + 0.004, 0.006, P.ink, -0.004);
  disc(MR, 0.01, P.lionSilver, 0);
  // goldLight rim: ring of small boxes
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    put(new THREE.BoxGeometry(0.012, 0.005, 0.008), P.goldLight, [Math.cos(a) * (MR - 0.001), Math.sin(a) * (MR - 0.001), 0.005], {
      rot: qz(a + Math.PI / 2),
    });
  }
  // inner ink outline ring of face relief
  disc(0.03, 0.004, P.ink, 0.006, 12);
  disc(0.027, 0.005, P.steelMid, 0.008, 12);
  // ears
  for (const s of [1, -1]) {
    put(new THREE.ConeGeometry(0.008, 0.012, 4), P.steelMid, [s * 0.02, 0.026, 0.01], { rot: qx(Math.PI / 2) });
  }
  // muzzle
  put(new THREE.BoxGeometry(0.02, 0.014, 0.006), P.lionSilver, [0, -0.009, 0.012]);
  put(new THREE.BoxGeometry(0.02, 0.003, 0.002), P.goldLight, [0, -0.002, 0.0155]);
  // nose
  glow(put(new THREE.OctahedronGeometry(0.004), P.ruby, [0, -0.002, 0.016]), 1.2);
  // eyes
  for (const s of [1, -1]) {
    put(new THREE.BoxGeometry(0.008, 0.005, 0.004), P.ink, [s * 0.01, 0.01, 0.012]);
    put(new THREE.BoxGeometry(0.003, 0.002, 0.002), P.edgeBright, [s * 0.01 + 0.001, 0.0115, 0.0145]);
    // brow
    put(new THREE.BoxGeometry(0.011, 0.002, 0.003), P.steelDark, [s * 0.01, 0.0165, 0.012], { rot: qz(s * 0.25) });
  }
  // mouth lines
  put(new THREE.BoxGeometry(0.002, 0.007, 0.002), P.ink, [0, -0.0125, 0.0155]);
  for (const s of [1, -1])
    put(new THREE.BoxGeometry(0.009, 0.002, 0.002), P.ink, [s * 0.0045, -0.016, 0.0155], { rot: qz(-s * 0.4) });

  // mane spikes (cones pointing outward)
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + Math.PI / N;
    const r0 = MR + 0.002;
    const len = SPK + (i % 2 ? 0 : 0.002);
    const rot = qz(a - Math.PI / 2);
    put(new THREE.ConeGeometry(0.0085, len, 4), i % 2 ? P.goldDark : P.gold, [
      Math.cos(a) * (r0 + len / 2 - 0.003),
      Math.sin(a) * (r0 + len / 2 - 0.003),
      0,
    ], { rot });
  }

  // bail loop at the top
  put(new THREE.TorusGeometry(0.007, 0.0025, 4, 8), P.gold, [0, MR + SPK * 0.9 + 0.006, 0]);
  const bail = W(0, MR + SPK * 0.9 + 0.012, 0);

  // chain: curve from ring to bail
  const pts = [
    new THREE.Vector3(...ring),
    new THREE.Vector3(0.1, 0.12, -0.03),
    new THREE.Vector3(0.14, 0.13, -0.03),
    new THREE.Vector3(0.162, 0.1, -0.025),
    new THREE.Vector3(...bail),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const links = 11;
  for (let i = 0; i < links; i++) {
    const t = (i + 0.5) / links;
    const p = curve.getPoint(t);
    const tg = curve.getTangent(t);
    const rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tg);
    const roll = new THREE.Quaternion().setFromAxisAngle(tg, i % 2 ? Math.PI / 2 : 0);
    const g = new THREE.TorusGeometry(0.0065, 0.0016, 4, 6);
    g.scale(1, 1.5, 1);
    b.part(g, P.chainSteel, { at: [p.x, p.y, p.z], quat: roll.multiply(rot), flat: true });
  }

  // feather charms hanging off lower right
  const feather = (ox: number, oy: number, ang: number, light: boolean) => {
    const base = W(ox, oy, 0.004);
    b.part(new THREE.SphereGeometry(0.003, 5, 4), P.gold, { at: base });
    for (let k = 0; k < 3; k++) {
      const a = ang + (k - 1) * 0.28;
      const len = 0.022 - Math.abs(k - 1) * 0.004;
      const col = k === 1 ? (light ? P.lionSilver : P.steelDark) : light ? P.edgeBright : P.steelMid;
      const dir = new THREE.Vector3(Math.sin(a), -Math.cos(a), 0);
      const mid = new THREE.Vector3(...base).addScaledVector(dir, len / 2 + 0.003);
      const g = new THREE.BoxGeometry(0.006, len, 0.0018);
      const rot = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      b.part(g, col, { at: [mid.x, mid.y, mid.z], quat: rot, flat: true });
    }
  };
  feather(0.034, -0.034, 0.5, true);
  feather(0.046, -0.02, 0.8, false);

  // tiny gold pin at ring
  b.part(new THREE.SphereGeometry(0.0035, 5, 4), P.goldLight, { at: [ring[0] + 0.004, ring[1] + 0.003, ring[2]] });
}
    return buildLionCharm;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "lionheartGunblade" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
