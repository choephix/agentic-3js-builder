import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Gunblade — Lionheart Revolver",
  "description": "A Final Fantasy-style gunblade standing upright on its pommel: a revolver mechanism fused to a greatsword, barrel running along the blade's spine to a muzzle at the tip, brass filigree and a glowing cyan magic stone."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  steelDark: "#4a5260",
  steelMid: "#7b8494",
  steelLight: "#c9d2de",
  edgePolished: "#eef2f6",
  gunmetal: "#2e333c",
  ink: "#14161c",
  brass: "#d8a848",
  brassDark: "#8a6a24",
  leather: "#6b3f24",
  leatherDark: "#3f2415",
  gripWood: "#2c1c12",
  glowCyan: "#57e6ff",
  glowCore: "#d8faff",
  ruby: "#c2273a",
};
const M = {
  gripTop: [0, 0.62, 0] as [number, number, number],
  drumTop: [0, 1.02, 0] as [number, number, number],
  barrelRoot: [0, 1.06, -0.1] as [number, number, number],
  guardPlane: [0, 1.06, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // grip
  (() => {
function buildGrip({ b, J, P, M }: Ctx) {
  const W = J.weapon;
  const T = J.trigger;
  const R = rng(11);
  const part = (g: THREE.BufferGeometry, c: string, at: number[], o: any = {}) =>
    b.part(g, c, { bone: W, at, flat: true, ...o });

  // ---- Pommel ----
  part(new THREE.CylinderGeometry(0.05, 0.04, 0.03, 8), P.gunmetal, [0, 0.07, 0.0]); // collar
  b.lathe(
    [[0, 0.0], [0.03, 0.0], [0.05, 0.02], [0.058, 0.045], [0.05, 0.07], [0.03, 0.09], [0, 0.095]],
    { at: [0, 0.0, 0], segments: 8, color: P.brass, bone: W },
  );
  part(new THREE.CylinderGeometry(0.062, 0.062, 0.008, 8), P.brassDark, [0, 0.045, 0]);
  part(new THREE.OctahedronGeometry(0.026, 0), P.ruby, [0, 0.01, 0.0], { scale: [1, 0.6, 1] });
  part(new THREE.CylinderGeometry(0.052, 0.058, 0.014, 8), P.brass, [0, 0.092, 0]);

  // ---- Grip body: tapered octagon, leaning back slightly ----
  const gy0 = 0.1, gy1 = 0.62;
  const lean = (y: number) => -0.025 * ((y - gy0) / (gy1 - gy0));
  b.frustumBox([0, gy0, lean(gy0)], [0, gy1, lean(gy1)], [0.1, 0.1], [0.13, 0.13], { color: P.gripWood, bone: W });
  b.sweep([[0, gy0, lean(gy0)], [0, gy1, lean(gy1)]], [0.058, 0.074], {
    color: P.gripWood, bone: W, section: { ngon: 8 }, caps: "flat",
  });

  // ---- Leather wrap: diagonal straps ----
  const rAt = (y: number) => 0.058 + 0.016 * ((y - gy0) / (gy1 - gy0));
  const wrapPt = (t: number, ang: number) => {
    const y = gy0 + 0.03 + t * (gy1 - gy0 - 0.06);
    return [Math.sin(ang) * (rAt(y) + 0.008), y, lean(y) + Math.cos(ang) * (rAt(y) + 0.008)];
  };
  for (let s = 0; s < 4; s++) {
    const pts: number[][] = [];
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      pts.push(wrapPt(t, s * Math.PI / 2 + t * Math.PI * 1.2));
    }
    b.sweep(pts, 0.012, { color: P.leather, bone: W, section: { ngon: 6 }, caps: "flat" });
    const edge = pts.map((p) => [p[0] * 1.0, p[1] + 0.012, p[2]]);
    b.sweep(edge, 0.003, { color: P.leatherDark, bone: W, section: { ngon: 4 }, caps: "flat" });
  }
  // brass band stitches
  for (const y of [0.2, 0.36, 0.52]) {
    part(new THREE.CylinderGeometry(rAt(y) + 0.014, rAt(y) + 0.014, 0.012, 8), P.brass, [0, y, lean(y)]);
  }
  // top and bottom caps
  part(new THREE.CylinderGeometry(0.082, 0.078, 0.02, 8), P.brassDark, [0, 0.605, lean(0.605)]);
  part(new THREE.CylinderGeometry(0.066, 0.07, 0.02, 8), P.brassDark, [0, 0.11, lean(0.11)]);

  // ---- Trigger guard: flat brass loop bulging +Z ----
  const gz = lean(0.5) + 0.075;
  const loop = [
    [0, 0.585, gz - 0.01], [0, 0.6, gz + 0.06], [0, 0.55, gz + 0.12],
    [0, 0.46, gz + 0.13], [0, 0.4, gz + 0.09], [0, 0.39, gz + 0.0],
  ];
  b.sweep(loop, 0.009, { color: P.brass, bone: W, section: { ngon: 6 }, caps: "round" });
  b.sweep(loop.map((p) => [p[0], p[1], p[2] + 0.004]), 0.003, { color: P.brassDark, bone: W, section: { ngon: 4 }, caps: "flat" });
  for (const p of [loop[0], loop[5]]) {
    part(new THREE.SphereGeometry(0.012, 6, 4), P.brassDark, [p[0], p[1], p[2] + 0.002]);
    part(new THREE.SphereGeometry(0.007, 6, 4), P.brass, [p[0], p[1], p[2] + 0.012]);
  }

  // ---- Trigger on its joint ----
  const tp = [[0, 0.545, 0.06], [0, 0.51, 0.095], [0, 0.47, 0.1], [0, 0.44, 0.085]];
  b.sweep(tp.map((p) => [p[0], p[1], p[2] - 0.004]), [0.011, 0.005], { color: P.ink, bone: T, caps: "point" });
  b.sweep(tp, [0.008, 0.003], { color: P.steelMid, bone: T, section: { ngon: 4 }, caps: "point" });
  part(new THREE.CylinderGeometry(0.01, 0.01, 0.04, 6), P.brassDark, [0, 0.545, 0.055], { bone: T, rotation: [0, 0, 90] });

  // ---- Lanyard on the +X side of the pommel ----
  const rc = [0.085, 0.055, 0.0];
  part(new THREE.TorusGeometry(0.02, 0.005, 5, 10), P.brass, rc, { rotation: [0, 90, 0] });
  part(new THREE.BoxGeometry(0.03, 0.012, 0.012), P.brassDark, [0.065, 0.065, 0]);
  let ly = 0.032;
  for (let i = 0; i < 4; i++) {
    const rot = i % 2 ? [0, 90, 0] : [0, 0, 0];
    part(new THREE.TorusGeometry(0.0085, 0.0028, 4, 6), P.steelDark, [0.1, ly, 0], { rotation: rot });
    ly -= 0.0 + 0.0;
    // links curve outward and downward without touching the floor
  }
  // chain: 4 links stepped outward, kept above y=0.03
  for (let i = 0; i < 4; i++) {
    // overwrite placement visually by adding links along a gentle arc
  }
  const links = [[0.095, 0.06], [0.108, 0.052], [0.117, 0.043], [0.122, 0.034]];
  links.forEach(([x, y], i) => {
    part(new THREE.TorusGeometry(0.008, 0.0027, 4, 6), P.steelDark, [x, y, 0], { rotation: [0, i % 2 ? 90 : 0, 0] });
  });
  // tassel
  part(new THREE.CylinderGeometry(0.007, 0.007, 0.01, 6), P.brass, [0.122, 0.027, 0]);
  part(new THREE.ConeGeometry(0.014, 0.03, 6), P.leather, [0.122, 0.011 + 0.02, 0], { rotation: [180, 0, 0] });
  part(new THREE.ConeGeometry(0.009, 0.014, 6), P.leatherDark, [0.122, 0.028, 0.006], { rotation: [180, 0, 0] });
  void R; void frame; void M;
}
    return buildGrip;
  })(),
  // mechanism
  (() => {
function buildMechanism({ b, J, P, M }: Ctx) {
  const W = J.weapon;
  const D = J.drum;
  const R = rng(11);
  const cx = 0, cz = 0;
  const yBot = 0.62, yTop = 1.02;
  const yMid = 0.82;

  // helper: box part
  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], bone: any = W, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { bone, at, rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: [number, number, number], bone: any = W, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { bone, at, rotation: rot, flat: true });

  // ---------- Drum (rides drum joint) ----------
  const drumR = 0.13;
  // six-flute body: hexagonal cylinder
  b.part(new THREE.CylinderGeometry(drumR, drumR, 0.34, 6), P.gunmetal, { bone: D, at: [0, yMid, 0], flat: true });
  // ink seams at hex corners (vertical slivers)
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r = drumR * 1.0;
    b.part(new THREE.BoxGeometry(0.008, 0.34, 0.008), P.ink, { bone: D, at: [Math.sin(a) * r, yMid, Math.cos(a) * r] });
  }
  // flute grooves: dark slots on each face centre
  for (let i = 0; i < 6; i++) {
    const a = ((i + 0.5) / 6) * Math.PI * 2;
    const r = drumR * 0.87 + 0.004;
    b.part(new THREE.BoxGeometry(0.03, 0.2, 0.012), P.steelDark, {
      bone: D, at: [Math.sin(a) * r, yMid, Math.cos(a) * r], rotation: [0, (a * 180) / Math.PI, 0],
    });
  }
  // top & bottom rims
  for (const y of [yMid + 0.175, yMid - 0.175]) {
    b.part(new THREE.CylinderGeometry(drumR * 1.04, drumR * 1.04, 0.016, 6), P.steelDark, { bone: D, at: [0, y, 0], flat: true });
  }
  // brass bolt ring on top
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    b.part(new THREE.SphereGeometry(0.0125, 6, 4), P.brass, { bone: D, at: [Math.sin(a) * 0.092, yMid + 0.186, Math.cos(a) * 0.092] });
  }
  // ejector star cap
  cyl(0.032, 0.032, 0.012, 8, P.steelLight, [0, yMid + 0.188, 0], D);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * 360;
    b.part(new THREE.BoxGeometry(0.01, 0.01, 0.05), P.steelLight, { bone: D, at: [0, yMid + 0.196, 0], rotation: [0, a, 0] });
  }
  b.part(new THREE.SphereGeometry(0.012, 6, 4), P.brassDark, { bone: D, at: [0, yMid + 0.2, 0] });

  // ---------- Frame ----------
  // lower housing (sockets over grip top)
  b.part(new THREE.BoxGeometry(0.2, 0.1, 0.26), P.gunmetal, { bone: W, at: [0, 0.665, -0.01], flat: true });
  // front and back walls enclosing the drum
  box(0.22, 0.36, 0.05, P.gunmetal, [0, yMid, 0.15]);
  box(0.22, 0.36, 0.06, P.gunmetal, [0, yMid, -0.155]);
  // chamfer caps
  box(0.2, 0.03, 0.3, P.steelDark, [0, 0.725, -0.01]);
  // top frame block (hands off to blade)
  box(0.2, 0.05, 0.36, P.gunmetal, [0, 1.0, 0]);
  // front ink seam at wall base
  box(0.222, 0.006, 0.052, P.ink, [0, 0.68, 0.15]);
  box(0.222, 0.006, 0.062, P.ink, [0, 0.68, -0.155]);

  // side plates ±X with inlay and rivets
  for (const s of [1, -1]) {
    const x = s * 0.115;
    box(0.022, 0.34, 0.3, P.steelDark, [x, yMid, 0]);
    box(0.006, 0.34, 0.006, P.ink, [s * 0.127, yMid, 0.15]);
    box(0.006, 0.34, 0.006, P.ink, [s * 0.127, yMid, -0.15]);
    // brass inlay lines (panel)
    const xi = s * 0.1275;
    box(0.004, 0.006, 0.22, P.brass, [xi, yMid + 0.11, 0]);
    box(0.004, 0.006, 0.22, P.brass, [xi, yMid - 0.11, 0]);
    box(0.004, 0.22, 0.006, P.brass, [xi, yMid, 0.11]);
    box(0.004, 0.22, 0.006, P.brass, [xi, yMid, -0.11]);
    box(0.004, 0.006, 0.12, P.brassDark, [xi, yMid, 0]);
    // 4 rivets
    for (const dz of [-0.125, 0.125])
      for (const dy of [-0.14, 0.14])
        b.part(new THREE.SphereGeometry(0.011, 6, 4), P.brass, { bone: W, at: [xi + s * 0.002, yMid + dy, dz] });
  }

  // ---------- Top strap (arched bridge front to back) ----------
  const strapPts: [number, number][] = [];
  for (let i = 0; i <= 6; i++) {
    const t = i / 6;
    const z = 0.17 - t * 0.34;
    const y = 1.0 + Math.sin(t * Math.PI) * 0.055;
    strapPts.push([z, y]);
  }
  for (let i = 0; i < 6; i++) {
    const [z0, y0] = strapPts[i];
    const [z1, y1] = strapPts[i + 1];
    const len = Math.hypot(z1 - z0, y1 - y0) + 0.004;
    const ang = Math.atan2(y1 - y0, z1 - z0);
    b.part(new THREE.BoxGeometry(0.1, 0.03, len), P.steelMid, {
      bone: W, at: [0, (y0 + y1) / 2 + 0.015, (z0 + z1) / 2],
      rotation: [(-ang * 180) / Math.PI, 0, 0], flat: true,
    });
  }
  // ink slot on crown
  box(0.03, 0.006, 0.1, P.ink, [0, 1.088, 0]);
  // brass screws at each end
  for (const z of [0.17, -0.17]) {
    cyl(0.017, 0.017, 0.012, 8, P.brass, [0, 1.03, z]);
    box(0.02, 0.005, 0.004, P.ink, [0, 1.038, z]);
  }
  // strap side ribs
  for (const s of [1, -1]) box(0.012, 0.03, 0.2, P.steelDark, [s * 0.056, 1.05, 0]);

  // ---------- Hammer (cocked back at -Z) ----------
  const hz = -0.2;
  cyl(0.02, 0.02, 0.07, 8, P.brass, [0, 0.975, hz + 0.01], W, [0, 0, 90]);
  // spur body: stack of tilted slabs
  box(0.036, 0.1, 0.03, P.steelDark, [0, 1.02, hz - 0.012], W, [-25, 0, 0]);
  box(0.036, 0.05, 0.06, P.steelDark, [0, 1.07, hz - 0.045], W, [-50, 0, 0]);
  // spur grip ridges
  for (let i = 0; i < 3; i++) box(0.04, 0.006, 0.014, P.ink, [0, 1.065 + i * 0.0, hz - 0.045 - i * 0.0 + (i - 1) * 0.015], W, [-50, 0, 0]);
  // face notch
  box(0.012, 0.03, 0.006, P.steelLight, [0, 1.025, hz - 0.03], W, [-25, 0, 0]);
  // brass pin heads
  for (const s of [1, -1]) cyl(0.014, 0.014, 0.008, 8, P.brassDark, [s * 0.04, 0.975, hz + 0.01], W, [0, 0, 90]);
  // hammer base block
  box(0.07, 0.07, 0.04, P.gunmetal, [0, 0.96, -0.2]);

  // ---------- Loading gate (right flat = -X) ----------
  const gx = -0.135;
  box(0.012, 0.12, 0.09, P.brass, [gx, 0.8, 0.05]);
  box(0.004, 0.12, 0.004, P.ink, [gx - 0.006, 0.8, 0.005]);
  // hinge knuckles
  for (const dy of [-0.045, 0, 0.045]) cyl(0.009, 0.009, 0.03, 6, P.brassDark, [gx, 0.8 + dy, 0.095]);
  // thumb piece knurled
  box(0.016, 0.03, 0.02, P.brassDark, [gx - 0.012, 0.8, 0.02]);
  for (let i = 0; i < 4; i++) box(0.018, 0.026, 0.003, P.ink, [gx - 0.012, 0.8, 0.012 + i * 0.005]);
  b.part(new THREE.SphereGeometry(0.01, 6, 4), P.brass, { bone: W, at: [gx - 0.008, 0.84, 0.075] });
  b.part(new THREE.SphereGeometry(0.01, 6, 4), P.brass, { bone: W, at: [gx - 0.008, 0.76, 0.075] });

  // ---------- Barrel breech collar ----------
  const bx = M.barrelRoot;
  cyl(0.058, 0.066, 0.06, 8, P.steelDark, [bx[0], 1.03 + 0.0, bx[2]]);
  cyl(0.06, 0.06, 0.012, 8, P.brass, [bx[0], 1.062, bx[2]]);
  cyl(0.036, 0.036, 0.014, 8, P.ink, [bx[0], 1.068, bx[2]]);
  // collar bolts
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    b.part(new THREE.SphereGeometry(0.008, 5, 4), P.brass, { bone: W, at: [bx[0] + Math.sin(a) * 0.05, 1.06, bx[2] + Math.cos(a) * 0.05] });
  }

  // ---------- Grip socket details ----------
  box(0.215, 0.012, 0.28, P.brassDark, [0, 0.616, -0.01]);
  for (const s of [1, -1]) for (const z of [-0.1, 0.1])
    b.part(new THREE.SphereGeometry(0.009, 5, 4), P.brass, { bone: W, at: [s * 0.1, 0.622, z] });
  // front wall brass emblem pip + faint magic seam
  box(0.1, 0.008, 0.004, P.brass, [0, 0.9, 0.178]);
  box(0.1, 0.008, 0.004, P.brass, [0, 0.74, 0.178]);
  glow(box(0.012, 0.1, 0.004, P.glowCyan, [0, 0.82, 0.178]), 1);
}
    return buildMechanism;
  })(),
  // bladeCore
  (() => {
function buildBladeCore({ b, J, P }: any) {
  const bone = J.weapon;
  const Y0 = 1.02;
  const Y1 = 2.18;
  const Z_FRONT = 0.17;
  const Z_BACK = -0.12;

  // Blade silhouette in the (z, y) plane, drawn front to back: x runs along +Z, y up
  const outline: any[] = [
    [Z_BACK, Y0],
    [Z_FRONT - 0.02, Y0],
    [Z_FRONT, 1.2],
    [0.15, 1.55],
    [0.12, 1.85],
    [0.06, 2.06],
    [0.02, Y1, "sharp"],
    [-0.04, 2.02],
    [Z_BACK, 1.9],
  ];

  // Main steel slab, thickness along X (z x y = x direction)
  b.extrude(outline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: [0.05, 0.02],
    bevel: 0.006,
    color: P.steelMid,
    bone,
    name: "bladeSlab",
  });

  // Polished cutting edge strip along the front
  const edgeOutline: any[] = [
    [Z_FRONT - 0.045, Y0 + 0.02],
    [Z_FRONT + 0.004, Y0 + 0.02],
    [0.154, 1.55],
    [0.124, 1.85],
    [0.064, 2.06],
    [0.025, Y1 - 0.02, "sharp"],
    [0.0, 2.05],
    [0.07, 1.85],
    [0.1, 1.55],
    [Z_FRONT - 0.045, 1.2],
  ];
  b.extrude(edgeOutline, {
    at: [0, 0, 0],
    x: [0, 0, 1],
    y: [0, 1, 0],
    thickness: 0.012,
    bevel: 0.004,
    color: P.edgePolished,
    bone,
    name: "bladeEdge",
  });

  // Tip chamfer faces
  for (const s of [1, -1]) {
    b.slab(
      [
        [s * 0.012, 2.03, 0.0],
        [s * 0.012, 2.03, 0.075],
        [s * 0.002, Y1 - 0.01, 0.025],
        [s * 0.004, 2.06, -0.01],
      ],
      { color: P.steelLight, thickness: 0.006, bone, name: "tipFacet" },
    );
  }

  // Spine cap strip along the back with an ink seam beneath
  b.part(new THREE.BoxGeometry(0.036, 0.84, 0.02), P.steelLight, {
    bone,
    at: [0, 1.5, Z_BACK - 0.004],
    name: "spineCap",
  });
  b.part(new THREE.BoxGeometry(0.044, 0.84, 0.006), P.ink, {
    bone,
    at: [0, 1.5, Z_BACK + 0.01],
    name: "spineSeam",
  });

  // Fuller grooves on both flats
  for (const s of [1, -1]) {
    const x = s * 0.0215;
    b.part(new THREE.BoxGeometry(0.006, 0.6, 0.05), P.steelDark, {
      bone,
      at: [x, 1.4, 0.0],
      name: "fuller",
    });
    b.part(new THREE.BoxGeometry(0.004, 0.6, 0.008), P.ink, {
      bone,
      at: [x + s * 0.002, 1.4, 0.027],
      name: "fullerInk",
    });
    // fuller end caps
    for (const y of [1.1, 1.7]) {
      b.part(new THREE.BoxGeometry(0.005, 0.01, 0.058), P.ink, {
        bone,
        at: [x + s * 0.001, y, 0.0],
        name: "fullerEnd",
      });
    }
  }

  // Brass heraldic wing emblem on both flats at ricasso
  for (const s of [1, -1]) {
    const x = s * 0.0245;
    const boss = b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.008, 10), P.brass, {
      bone,
      at: [x, 1.2, 0.0],
      dir: [s, 0, 0],
      name: "emblemBoss",
    });
    b.part(new THREE.CylinderGeometry(0.009, 0.009, 0.01, 8), P.brassDark, {
      bone,
      at: [x + s * 0.002, 1.2, 0.0],
      dir: [s, 0, 0],
      name: "emblemCore",
    });
    void boss;
    for (const w of [1, -1]) {
      for (let i = 0; i < 4; i++) {
        const len = 0.07 - i * 0.012;
        const zc = w * (0.03 + i * 0.012 + len * 0.3);
        const yc = 1.2 + 0.012 + i * 0.011;
        b.part(new THREE.BoxGeometry(0.005, 0.012, len), i % 2 ? P.brassDark : P.brass, {
          bone,
          at: [x, yc, zc],
          rotation: [w * (12 + i * 4), 0, 0],
          name: "emblemWing",
        });
      }
    }
  }

  // Rune studs up the +X flat
  const runeY = (i: number) => 1.3 + (i * 0.6) / 6;
  for (let i = 0; i < 7; i++) {
    const y = runeY(i);
    const base = b.part(new THREE.BoxGeometry(0.007, 0.034, 0.034), P.ink, {
      bone,
      at: [0.0235, y, 0.0],
      name: "runeBase",
    });
    void base;
    const sh = i % 3;
    const r1 = b.part(new THREE.BoxGeometry(0.01, 0.024, 0.006), P.glowCyan, {
      bone,
      at: [0.027, y, sh === 1 ? 0.008 : -0.006],
      name: "runeStem",
    });
    glow(r1, 1);
    const r2 = b.part(new THREE.BoxGeometry(0.01, 0.006, 0.022), P.glowCyan, {
      bone,
      at: [0.027, y + (sh === 2 ? -0.009 : 0.009), 0.0],
      rotation: [sh === 0 ? 0 : 20, 0, 0],
      name: "runeBar",
    });
    glow(r2, 1);
  }

  // Ricasso rivets
  for (const s of [1, -1]) {
    for (const z of [-0.08, 0.1]) {
      b.part(new THREE.SphereGeometry(0.008, 6, 4), P.brass, {
        bone,
        at: [s * 0.026, 1.07, z],
        name: "ricassoRivet",
      });
    }
  }
}
    return buildBladeCore;
  })(),
  // barrel
  (() => {
function buildBarrel({ b, J, P, M }: Ctx) {
  const bone = J.weapon;
  const BZ = -0.13; // barrel axis z
  const R = 0.045;
  const y0 = 1.06;
  const y1 = 2.02;
  const r = rng(11);

  const put = (geo: THREE.BufferGeometry, color: string, at: [number, number, number], opts: any = {}) =>
    b.part(geo, color, { bone, at, ...opts });

  // Barrel body: octagonal tube, vertical
  b.rod([0, y0 - 0.02, BZ], [0, y1, BZ], R, P.gunmetal, { bone, section: { ngon: 8 }, caps: "flat" });

  // Breech root collar sleeve at the bottom
  put(new THREE.CylinderGeometry(R * 1.2, R * 1.35, 0.05, 8), P.steelDark, [0, y0 + 0.02, BZ]);

  // Cooling ring seams (ink) along the length
  for (const y of [1.2, 1.52, 1.86]) {
    put(new THREE.CylinderGeometry(R * 1.04, R * 1.04, 0.008, 8), P.ink, [0, y, BZ]);
    put(new THREE.CylinderGeometry(R * 1.02, R * 1.02, 0.006, 8), P.steelLight, [0, y + 0.012, BZ]);
  }
  // Long highlight strip on the front-left face of the barrel
  put(new THREE.BoxGeometry(0.008, 0.6, 0.006), P.steelMid, [0.03, 1.5, BZ + 0.034]);
  put(new THREE.BoxGeometry(0.008, 0.6, 0.006), P.steelMid, [-0.03, 1.5, BZ + 0.034]);

  // Bands (brass clamps around barrel + spine strip)
  for (const y of [1.35, 1.7]) {
    const bandH = 0.07;
    // ring around barrel
    put(new THREE.CylinderGeometry(R * 1.28, R * 1.28, bandH, 8), P.brass, [0, y, BZ]);
    put(new THREE.CylinderGeometry(R * 1.32, R * 1.32, 0.012, 8), P.brassDark, [0, y + bandH / 2, BZ]);
    put(new THREE.CylinderGeometry(R * 1.32, R * 1.32, 0.012, 8), P.brassDark, [0, y - bandH / 2, BZ]);
    // ink shadow line below
    put(new THREE.CylinderGeometry(R * 1.2, R * 1.2, 0.008, 8), P.ink, [0, y - bandH / 2 - 0.01, BZ]);
    // clamp bridge toward blade spine
    put(new THREE.BoxGeometry(0.1, bandH, 0.07), P.brass, [0, y, BZ + 0.07]);
    put(new THREE.BoxGeometry(0.104, 0.012, 0.072), P.brassDark, [0, y + bandH / 2, BZ + 0.07]);
    put(new THREE.BoxGeometry(0.104, 0.008, 0.072), P.ink, [0, y - bandH / 2 - 0.006, BZ + 0.07]);
    // 3 rivets
    for (const dx of [-0.035, 0, 0.035]) {
      put(new THREE.SphereGeometry(0.01, 6, 4), P.brassDark, [dx, y, BZ + 0.108]);
    }
  }

  // Rear sight leaf on the first band
  put(new THREE.BoxGeometry(0.05, 0.035, 0.012), P.steelLight, [0, 1.35 + 0.05, BZ - 0.02]);
  put(new THREE.BoxGeometry(0.014, 0.02, 0.014), P.ink, [0, 1.35 + 0.058, BZ - 0.02]);
  put(new THREE.BoxGeometry(0.01, 0.018, 0.014), P.steelLight, [0, 1.35 + 0.075, BZ - 0.02]);

  // Muzzle: brass ring, crown, bore
  put(new THREE.CylinderGeometry(R * 1.35, R * 1.35, 0.04, 8), P.brass, [0, 1.96, BZ]);
  put(new THREE.CylinderGeometry(R * 1.4, R * 1.4, 0.01, 8), P.brassDark, [0, 1.98, BZ]);
  put(new THREE.CylinderGeometry(R * 1.4, R * 1.4, 0.01, 8), P.brassDark, [0, 1.94, BZ]);
  put(new THREE.CylinderGeometry(R * 1.2, R * 1.1, 0.07, 8), P.steelDark, [0, 2.0, BZ]);
  put(new THREE.CylinderGeometry(R * 1.28, R * 1.28, 0.012, 8), P.ink, [0, 2.0, BZ]);
  put(new THREE.CylinderGeometry(R * 1.25, R * 1.25, 0.012, 8), P.brass, [0, 2.045, BZ]);
  // Recessed bore: dark ring + glowing disc just beneath top face
  put(new THREE.CylinderGeometry(R * 0.7, R * 0.7, 0.01, 12), P.ink, [0, 2.041, BZ]);
  glow(
    put(new THREE.CylinderGeometry(R * 0.55, R * 0.55, 0.008, 12), P.glowCyan, [0, 2.0455, BZ]),
    1,
  );
  glow(put(new THREE.CylinderGeometry(R * 0.25, R * 0.25, 0.006, 8), P.glowCore, [0, 2.048, BZ]), 1);

  // Front sight blade rising from the ring toward the tip
  put(new THREE.BoxGeometry(0.012, 0.11, 0.03), P.steelLight, [0, 2.1, BZ + 0.015]);
  put(new THREE.BoxGeometry(0.014, 0.02, 0.034), P.ink, [0, 2.058, BZ + 0.015]);
  put(new THREE.ConeGeometry(0.014, 0.03, 4), P.steelLight, [0, 2.17, BZ + 0.015]);

  // Faint glow seams down the bore side (small cyan slits on the sides near muzzle)
  for (const s of [1, -1]) {
    glow(put(new THREE.BoxGeometry(0.004, 0.05, 0.012), P.glowCyan, [s * (R * 1.05), 1.8, BZ]), 0.8);
  }

  // Breech base flare and small ink seam above
  put(new THREE.CylinderGeometry(R * 1.1, R * 1.2, 0.03, 8), P.steelMid, [0, y0 + 0.06, BZ]);
  put(new THREE.CylinderGeometry(R * 1.12, R * 1.12, 0.006, 8), P.ink, [0, y0 + 0.078, BZ]);
  // tiny rivets around breech
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    put(new THREE.SphereGeometry(0.007, 5, 4), P.brass, [Math.sin(a) * R * 1.32, y0 + 0.02, BZ + Math.cos(a) * R * 1.32]);
  }
  void r;
  void frame;
  void M;
}
    return buildBarrel;
  })(),
  // fittings
  (() => {
function buildFittings({ b, J, P, M }: any) {
  const bone = J.weapon;
  const R = rng(11);
  const BRASS = P.brass, BD = P.brassDark, INK = P.ink;
  const gy = M.guardPlane[1];

  const put = (geo: THREE.BufferGeometry, color: string, at: number[], opts: any = {}) =>
    b.part(geo, color, { bone, at, flat: true, ...opts });
  const rivet = (at: number[], dir: number[], r = 0.011) =>
    put(new THREE.SphereGeometry(r, 6, 4), BRASS, at, { dir, axis: "y" });

  // Central guard block wrapping the blade base
  put(new THREE.BoxGeometry(0.2, 0.1, 0.26), BRASS, [0, gy, 0]);
  put(new THREE.BoxGeometry(0.21, 0.012, 0.27), INK, [0, gy - 0.052, 0]);
  put(new THREE.BoxGeometry(0.205, 0.014, 0.265), BD, [0, gy + 0.05, 0]);

  // Wing quillons
  for (const s of [1, -1]) {
    const wing = [
      [0, 0.0], [0.09, -0.03], [0.2, -0.005], [0.25, 0.07], [0.235, 0.115],
      [0.17, 0.06], [0.1, 0.05], [0, 0.05],
    ];
    const outline = wing.map(([x, y]) => [x, y] as [number, number]);
    // wing drawn in the XY plane, thickness along Z
    const w = b.extrude(outline, {
      at: [s * 0.08, gy - 0.03, 0.0], x: [s, 0, 0], y: [0, 1, 0],
      thickness: 0.07, bevel: 0.006, color: BRASS, bone,
    });
    // curl toward +Z: forward tip
    put(new THREE.BoxGeometry(0.05, 0.05, 0.1), BRASS, [s * 0.285, gy + 0.07, 0.05], { rotation: [0, 0, s * -10] });
    put(new THREE.ConeGeometry(0.03, 0.12, 5), BRASS, [s * 0.285, gy + 0.085, 0.14], { dir: [0, 0.2, 1] });
    // dark trim along top edge
    b.rod([s * 0.1, gy + 0.025, 0.037], [s * 0.245, gy + 0.115, 0.037], 0.006, BD, { bone });
    b.rod([s * 0.1, gy + 0.025, -0.037], [s * 0.245, gy + 0.115, -0.037], 0.006, BD, { bone });
    // 3 rivets on the front face
    for (let i = 0; i < 3; i++) rivet([s * (0.13 + i * 0.045), gy + 0.0 + i * 0.012, 0.04], [0, 0, 1]);
    // shadow line where wing meets drum top
    put(new THREE.BoxGeometry(0.17, 0.008, 0.2), INK, [s * 0.17, gy - 0.036, 0]);
    // filigree strips on top
    for (const z of [-0.07, 0.06]) {
      b.rod([s * 0.1, gy + 0.062, z], [s * 0.2, gy + 0.075, z * 1.4], 0.006, BD, { bone });
    }
    // small wing fin
    b.extrude([[0, 0], [0.07, 0.01], [0.04, 0.06], [0, 0.03]] as [number, number][], {
      at: [s * 0.03, gy + 0.057, -0.1], x: [s, 0, 0], y: [0, 1, 0], thickness: 0.012, color: BD, bone,
    });
    // shoulder plates against drum top
    put(new THREE.BoxGeometry(0.09, 0.03, 0.14), P.steelLight, [s * 0.15, gy - 0.075, 0.0]);
    for (const z of [-0.05, 0.05]) rivet([s * 0.15, gy - 0.058, z], [0, 1, 0], 0.009);
    // chains drooping from quillon root to frame plate
    for (let i = 0; i < 3; i++) {
      const y = gy - 0.1 - i * 0.025;
      const x = s * (0.19 - i * 0.012);
      put(new THREE.TorusGeometry(0.014, 0.004, 5, 8), P.steelDark, [x, y, 0.06], {
        rotation: [i % 2 ? 90 : 0, 0, 0],
      });
    }
    rivet([s * 0.19, gy - 0.085, 0.06], [s, 0, 0], 0.01);
  }

  // Gem rosette at front-centre
  const gz = 0.15;
  put(new THREE.CylinderGeometry(0.06, 0.065, 0.022, 8), BRASS, [0, gy + 0.005, gz - 0.005], { dir: [0, 0.3, 1] });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(new THREE.ConeGeometry(0.014, 0.03, 4), BD, [Math.sin(a) * 0.065, gy + 0.005 + Math.cos(a) * 0.065, gz + 0.01], { dir: [Math.sin(a), Math.cos(a), 0.1] });
  }
  glow(put(new THREE.OctahedronGeometry(0.055, 0), P.glowCyan, [0, gy + 0.005, gz + 0.04], { scale: [1, 1.35, 0.9] }), 1.4);
  glow(put(new THREE.OctahedronGeometry(0.025, 0), P.glowCore, [0, gy + 0.005, gz + 0.045], { scale: [1, 1.35, 0.9] }), 1.6);

  // Front/back centre filigree
  b.rod([-0.08, gy + 0.058, 0.1], [0.08, gy + 0.058, 0.1], 0.005, BD, { bone });
  b.rod([-0.08, gy + 0.058, -0.1], [0.08, gy + 0.058, -0.1], 0.005, BD, { bone });
  for (const x of [-0.07, 0, 0.07]) rivet([x, gy + 0.06, -0.12], [0, 1, 0], 0.008);
}
    return buildFittings;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "gunblade" });
  const J: Record<string, Joint> = {};
  J["weapon"] = b.joint("weapon", { at: [0,0.05,0], dir: [0,1,0], role: "spine" });
  J["drum"] = b.joint("drum", { parent: J["weapon"], at: [0,0.82,0], dir: [0,1,0], role: "hinge", group: "mechanism" });
  J["trigger"] = b.joint("trigger", { parent: J["weapon"], at: [0,0.5,0.05], dir: [1,0,0], role: "hinge", group: "mechanism" });
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
