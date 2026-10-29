import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Polar Outpost Seven",
  "description": "A Firewatch-style diorama of an arctic research outpost: a red-sided stilted hab with a glowing porch, a teal lab annex with a radome joined by a corridor, a radio mast and generator shed, and a yard of sleds, drums and a snowmobile. It stands on a cut-away snow slab in front of layered sunset ridges and a big low sun."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  snowLit: "#f9e2cf",
  snowMid: "#eeb9b0",
  snowShade: "#a98fb8",
  snowDeep: "#6d5f94",
  ridgeFar: "#f0a78d",
  ridgeMid: "#b86b86",
  ridgeNear: "#5b4b7d",
  rock: "#3f3a5e",
  wallRed: "#d4482b",
  trimCream: "#f6dfb4",
  roofDark: "#4a3350",
  windowGlow: "#ffc857",
  wood: "#9a5a33",
  darkWood: "#523038",
  metal: "#6c7494",
  tealPanel: "#2f7f86",
  deepTeal: "#1d4352",
  ink: "#2b2038",
  iceBlue: "#8ccbd6",
  sunOrange: "#ff9a3c",
  accentRed: "#b92d36",
  yellow: "#f2b632",
  pine: "#2b5a50",
  radomeWhite: "#f4ebe0",
};
const M = {
  groundTop: [0, 0.5, 0] as [number, number, number],
  habFloorCentre: [-0.95, 1.1, -0.5] as [number, number, number],
  habDoor: [0.4, 1.1, 1.3] as [number, number, number],
  porchTop: [0.4, 1.1, 1.7] as [number, number, number],
  stairFoot: [0.4, 0.5, 3.2] as [number, number, number],
  corridorStart: [1.2, 1.1, -0.6] as [number, number, number],
  corridorEnd: [2.2, 1.1, -0.6] as [number, number, number],
  labFloorCentre: [3.4, 1.1, -0.9] as [number, number, number],
  labRoofCentre: [3.4, 3, -0.9] as [number, number, number],
  radomeCentre: [3.4, 4.6, -0.9] as [number, number, number],
  mastBase: [-4.1, 0.5, -3] as [number, number, number],
  mastTop: [-4.1, 6.2, -3] as [number, number, number],
  generatorShed: [-4.15, 0.5, 0] as [number, number, number],
  sledCentre: [2.1, 0.5, 2] as [number, number, number],
  snowmobile: [3.6, 0.5, 3.2] as [number, number, number],
  drumCluster: [4.3, 0.5, 1.5] as [number, number, number],
  weatherScreen: [2, 0.5, 3.9] as [number, number, number],
  flagPole: [4.4, 0.5, 3.9] as [number, number, number],
  ridgeFarZ: [0, 0.5, -4.3] as [number, number, number],
  sunDisc: [2.5, 2.4, -4.45] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // terrainBackdrop
  (() => {
function buildTerrainBackdrop({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, ry = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], rotation: [0, ry, 0], flat: true });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], flat: true });

  // ---- SLAB strata
  box(10, 0.18, 9, P.rock, 0, 0.09, 0);
  box(10.02, 0.2, 9.02, P.iceBlue, 0, 0.28, 0);
  // wavy seams on front and sides
  for (let i = 0; i < 9; i++) {
    const x = -4.6 + i * 1.15;
    box(0.9, 0.025, 0.02, P.snowMid, x, 0.24 + R() * 0.08, 4.515, 0);
  }
  for (let i = 0; i < 8; i++) {
    const z = -4 + i * 1.15;
    box(0.02, 0.025, 0.9, P.snowMid, 5.01, 0.26 + R() * 0.08, z);
    box(0.02, 0.025, 0.9, P.snowShade, -5.01, 0.26 + R() * 0.08, z);
  }
  // rock steps on edge
  for (let i = 0; i < 8; i++) {
    box(1.1, 0.07, 0.04, P.ridgeNear, -4.4 + i * 1.25, 0.14 + (i % 2) * 0.05, 4.52);
  }
  // snow cap
  box(10, 0.12, 9, P.snowLit, 0, 0.44, 0);
  // scalloped lip lumps
  for (let i = 0; i < 17; i++) {
    const x = -4.8 + i * 0.6;
    const s = 0.22 + R() * 0.1;
    b.part(new THREE.SphereGeometry(s, 6, 4), P.snowLit, { at: [x, 0.4, 4.5], scale: [1, 0.45, 0.5], flat: true });
    b.part(new THREE.SphereGeometry(s * 0.8, 6, 4), P.snowShade, { at: [x + 0.1, 0.34, 4.5], scale: [1, 0.3, 0.4], flat: true });
  }
  for (let i = 0; i < 15; i++) {
    const z = -4.2 + i * 0.6;
    b.part(new THREE.SphereGeometry(0.25, 6, 4), P.snowLit, { at: [5, 0.4, z], scale: [0.5, 0.45, 1], flat: true });
    b.part(new THREE.SphereGeometry(0.22, 6, 4), P.snowShade, { at: [-5, 0.4, z], scale: [0.5, 0.45, 1], flat: true });
  }
  // shade slab on -X face of cap
  box(0.02, 0.12, 9, P.snowShade, -5.01, 0.44, 0);

  // ---- drifts (margins only)
  const drift = (x: number, z: number, sx: number, sy: number, sz: number) => {
    b.part(new THREE.SphereGeometry(1, 6, 4), P.snowLit, { at: [x, 0.5, z], scale: [sx, sy, sz], flat: true });
    b.part(new THREE.SphereGeometry(1, 6, 4), P.snowShade, { at: [x - sx * 0.12, 0.49, z - sz * 0.1], scale: [sx * 0.9, sy * 0.8, sz * 0.9], flat: true });
    b.part(new THREE.SphereGeometry(1, 6, 4), P.snowLit, { at: [x + sx * 0.1, 0.5, z + sz * 0.1], scale: [sx * 0.85, sy * 0.9, sz * 0.85], flat: true });
  };
  drift(-4.65, 1.8, 0.4, 0.22, 0.9);
  drift(-4.6, -1.8, 0.35, 0.18, 0.8);
  drift(4.65, 0.2, 0.35, 0.2, 0.9);
  drift(4.6, 2.6, 0.4, 0.22, 0.7);
  drift(-2.8, 4.35, 0.8, 0.2, 0.3);
  drift(1.8, 4.35, 0.7, 0.17, 0.3);
  drift(3.6, 4.3, 0.9, 0.2, 0.3);
  drift(-4.7, 3.6, 0.35, 0.3, 0.7);
  // ripples
  for (let i = 0; i < 12; i++) {
    const x = -4.5 + R() * 9, z = -2 + R() * 6;
    if (Math.abs(x) < 4.3 && z < 4.1 && !(x > -3.2 && x < 4.8 && z > -2.6 && z < 3.4)) continue;
    box(0.5 + R() * 0.4, 0.004, 0.025, P.snowMid, x, 0.502, z, R() * 0.3);
  }
  for (let i = 0; i < 6; i++) box(0.6, 0.004, 0.025, P.snowMid, -4.5 + R() * 9, 0.502, 4.2 + R() * 0.2);

  // ---- paths
  const path = (x: number, z: number, w: number, d: number, ry = 0) => box(w, 0.006, d, P.snowMid, x, 0.503, z, ry);
  path(0.4, 3.85, 0.9, 1.3);
  path(0.5, 2.9, 0.8, 0.5);
  path(1.9, 3.5, 0.3, 1.6, -1.1);
  path(2.0, 1.5, 0.6, 1.6, 0.3);
  path(2.4, 0.9, 3.0, 0.5);
  path(1.0, 1.1, 1.4, 0.35);
  for (let i = 0; i < 7; i++) {
    const side = i % 2 ? 0.15 : -0.15;
    b.part(new THREE.SphereGeometry(0.09, 6, 4), P.snowShade, { at: [0.4 + side, 0.506, 3.4 + i * 0.16], scale: [0.8, 0.12, 1.3], flat: true });
  }
  for (let i = 0; i < 5; i++)
    b.part(new THREE.SphereGeometry(0.08, 6, 4), P.snowShade, { at: [2.3 + i * 0.5, 0.506, 0.9 + (i % 2) * 0.1], scale: [1.3, 0.12, 0.8], flat: true });

  // ---- rocks
  const rocks: [number, number][] = [[-4.3, 3.0], [4.6, -2.8], [-1.8, 4.1]];
  rocks.forEach(([x, z], k) => {
    for (let i = 0; i < 3; i++) {
      const s = 0.25 - i * 0.05 + k * 0.01;
      const px = x + (i - 1) * 0.3, pz = z + (i % 2) * 0.15;
      b.part(new THREE.DodecahedronGeometry(s, 0), P.rock, { at: [px, 0.5 + s * 0.5, pz], scale: [1, 0.8, 1], flat: true });
      b.part(new THREE.DodecahedronGeometry(s * 0.9, 0), P.ridgeNear, { at: [px - s * 0.2, 0.5 + s * 0.4, pz - s * 0.15], scale: [0.8, 0.7, 0.9], flat: true });
      b.part(new THREE.DodecahedronGeometry(s * 0.6, 0), P.snowLit, { at: [px + 0.02, 0.5 + s * 0.95, pz], scale: [1, 0.4, 1], flat: true });
    }
  });

  // ---- pines
  const pine = (x: number, z: number, h: number) => {
    const t = h * 0.2;
    cyl(0.05, 0.07, t, 6, P.darkWood, x, 0.5 + t / 2, z);
    for (let i = 0; i < 3; i++) {
      const r = (0.5 - i * 0.12) * h * 0.45;
      const ch = h * 0.34;
      const y = 0.5 + t * 0.7 + i * ch * 0.6 + ch / 2;
      b.part(new THREE.ConeGeometry(r, ch, 7), P.pine, { at: [x, y, z], flat: true });
      b.part(new THREE.ConeGeometry(r * 0.96, ch * 0.96, 7, 1, false, Math.PI, Math.PI), P.ridgeNear, { at: [x - 0.02, y - 0.01, z - 0.02], rotation: [0, 90, 0], flat: true });
      b.part(new THREE.ConeGeometry(r * 0.55, ch * 0.4, 7), P.snowLit, { at: [x + 0.01, y + ch * 0.32, z], flat: true });
    }
  };
  [[-4.3, 3.7, 1.5], [-3.8, 4.0, 1.0], [-4.6, 4.1, 1.2], [-3.6, 3.3, 0.9], [-4.4, 3.2, 1.8], [-3.3, 4.2, 1.1], [4.5, -3.2, 1.6], [4.0, -3.4, 1.1]].forEach(
    ([x, z, h]) => pine(x, z, h),
  );

  // ---- ridges
  const ridge = (z: number, col: string, peaks: number[], maxH: number, shade: string, capT: number) => {
    const pts: [number, number, ("sharp")?][] = [[-5, 0.45]];
    const n = peaks.length;
    peaks.forEach((p, i) => {
      const x = -5 + (i + 0.5) * (10 / n);
      pts.push([x - 0.5 * (10 / n), 0.45 + (maxH - 0.45) * 0.3 * (i % 2 ? 1 : 0.6)]);
      pts.push([x, p, "sharp"] as any);
    });
    pts.push([5, 0.45 + (maxH - 0.45) * 0.25]);
    pts.push([5, 0.45]);
    const o = pts.map((p) => (p[2] ? [p[0], p[1], "sharp"] : [p[0], p[1]])) as any;
    b.extrude(o, { at: [0, 0, z], x: [1, 0, 0], thickness: 0.25, color: col });
    // snow caps & streaks
    peaks.forEach((p, i) => {
      const x = -5 + (i + 0.5) * (10 / n);
      if (p > capT) b.part(new THREE.ConeGeometry(0.28, (p - capT) * 0.55 + 0.1, 4), P.snowLit, { at: [x, p - ((p - capT) * 0.55 + 0.1) / 2 + 0.02, z + 0.03], rotation: [0, 45, 0], flat: true });
      b.part(new THREE.BoxGeometry(0.06, (p - 0.5) * 0.6, 0.01), shade, { at: [x - 0.12, 0.5 + (p - 0.5) * 0.35, z + 0.13], rotation: [0, 0, -12], flat: true });
    });
  };
  ridge(-4.3, P.ridgeFar, [2.6, 3.4, 2.2, 3.0, 2.5], 3.4, P.ridgeMid, 99);
  ridge(-3.95, P.ridgeMid, [1.9, 2.6, 2.1, 2.4, 1.7, 2.2], 2.6, P.snowShade, 1.9);
  ridge(-3.65, P.ridgeNear, [1.3, 1.8, 1.2, 1.6, 1.4, 1.1, 1.5], 1.8, P.snowDeep, 1.2);

  // ---- sun
  b.part(new THREE.CylinderGeometry(1.35, 1.35, 0.03, 12), P.yellow, { at: [2.5, 2.4, -4.47], rotation: [90, 0, 0], flat: true });
  b.part(new THREE.CylinderGeometry(1.0, 1.0, 0.03, 12), P.sunOrange, { at: [2.5, 2.4, -4.45], rotation: [90, 0, 0], flat: true });
  // haze bands
  b.part(new THREE.TorusGeometry(2.0, 0.04, 3, 16, Math.PI * 0.8), P.ridgeFar, { at: [-2.5, 3.0, -4.5], rotation: [0, 0, 20], flat: true });
  b.part(new THREE.TorusGeometry(1.6, 0.03, 3, 16, Math.PI * 0.7), P.ridgeFar, { at: [-3.0, 3.3, -4.5], rotation: [0, 0, 40], flat: true });
}
    return buildTerrainBackdrop;
  })(),
  // mainHab
  (() => {
function buildMainHab({ b, P }: Ctx) {
  const r = rng(11);
  type Face = "F" | "R" | "L" | "B";
  type V = [number, number, number];

  // ---------- helpers ----------
  const box = (
    x0: number, x1: number, y0: number, y1: number, z0: number, z1: number,
    color: string, rot?: V,
  ) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      ...(rot ? { rotation: rot } : {}),
    });

  // Box seated on a wall face: d0..d1 is the distance out from the wall plane, u runs along the face.
  const fbox = (f: Face, u0: number, u1: number, y0: number, y1: number, d0: number, d1: number, color: string) => {
    if (f === "F") return box(u0, u1, y0, y1, 1.3 + d0, 1.3 + d1, color);
    if (f === "B") return box(u0, u1, y0, y1, -2.3 - d1, -2.3 - d0, color);
    if (f === "R") return box(1.2 + d0, 1.2 + d1, y0, y1, u0, u1, color);
    return box(-2.9 - d1, -2.9 - d0, y0, y1, u0, u1, color);
  };

  const cyl = (rad: number, h: number, seg: number, at: V, color: string, dir?: V) =>
    b.part(new THREE.CylinderGeometry(rad, rad, h, seg), color, { at, ...(dir ? { dir } : {}) });

  const lump = (at: V, sx: number, sy: number, sz: number, color: string, rot?: V) =>
    b.part(new THREE.SphereGeometry(1, 6, 4), color, {
      at, scale: [sx, sy, sz], flat: true, ...(rot ? { rotation: rot } : {}),
    });

  const shadow = (outline: [number, number][]) =>
    b.extrude(outline, { at: [0, 0.511, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.01, color: P.snowShade });

  const rod = (a: V, c: V, rad: number, color: string) =>
    b.rod(a, c, rad, { color, section: "box" });

  // ---------- cast shadows (ground) ----------
  shadow([[-3.0, 2.0], [-4.3, 1.7], [-4.3, -2.6], [-3.0, -2.3]]);
  shadow([[-2.9, 1.3], [1.2, 1.3], [1.2, -2.3], [-2.9, -2.3]]);
  shadow([[-0.4, 2.1], [1.2, 2.1], [1.2, 1.3], [-0.4, 1.3]]);
  shadow([[0.8, 2.1], [0.8, 3.2], [0.0, 3.2], [-0.6, 3.0], [-0.6, 2.0]]);

  // ---------- stilts, bracing, skirts, floor ----------
  const px = [-2.75, -0.85, 1.05];
  const stilts: [number, number][] = [];
  for (const x of px) for (const z of [-2.2, 1.2]) stilts.push([x, z]);
  stilts.push([-2.75, -0.5], [1.05, -0.5]);
  for (const [x, z] of stilts) box(x - 0.09, x + 0.09, 0.45, 1.1, z - 0.09, z + 0.09, P.darkWood);
  // porch posts, running up to the porch roof
  box(1.05, 1.15, 0.45, 2.93, 1.98, 2.08, P.darkWood);
  box(-0.4, -0.3, 0.45, 2.93, 1.98, 2.08, P.darkWood);

  for (let i = 0; i < 2; i++) {
    const xa = px[i], xb = px[i + 1];
    rod([xa, 0.55, 1.2], [xb, 1.0, 1.2], 0.03, P.wood);
    rod([xa, 1.0, 1.2], [xb, 0.55, 1.2], 0.03, P.wood);
  }
  const rz = [-2.2, -0.5, 1.2];
  for (let i = 0; i < 2; i++) {
    rod([1.05, 0.55, rz[i]], [1.05, 1.0, rz[i + 1]], 0.03, P.wood);
    rod([1.05, 1.0, rz[i]], [1.05, 0.55, rz[i + 1]], 0.03, P.wood);
  }
  // skirt boards on the shaded back and left
  box(-2.75, -0.85, 0.55, 1.0, -2.34, -2.3, P.darkWood);
  box(-0.85, 1.05, 0.55, 1.0, -2.34, -2.3, P.darkWood);
  box(-2.94, -2.9, 0.55, 1.0, -2.2, -0.5, P.darkWood);
  box(-2.94, -2.9, 0.55, 1.0, -0.5, 1.2, P.darkWood);
  // floor deck
  box(-2.9, 1.2, 1.0, 1.1, -2.3, 1.3, P.darkWood);

  // ---------- walls ----------
  box(-2.9, 1.2, 1.1, 3.3, -2.3, 1.3, P.wallRed);
  fbox("L", -2.3, 1.3, 1.1, 3.3, 0, 0.02, P.accentRed);
  fbox("B", -2.9, 1.2, 1.1, 3.3, 0, 0.02, P.accentRed);
  const gableOutline: [number, number][] = [[-2.05, 0], [2.05, 0], [0, 0.78]];
  b.extrude(gableOutline, { at: [-0.85, 3.3, 1.25], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: P.wallRed });
  b.extrude(gableOutline, { at: [-0.85, 3.3, -2.25], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.1, color: P.accentRed });

  // base band (opening for the corridor on the right)
  fbox("F", -2.9, 1.2, 1.1, 1.35, 0, 0.04, P.darkWood);
  fbox("L", -2.3, 1.3, 1.1, 1.35, 0.02, 0.05, P.darkWood);
  fbox("B", -2.9, 1.2, 1.1, 1.35, 0.02, 0.05, P.darkWood);
  fbox("R", -2.3, -1.05, 1.1, 1.35, 0, 0.04, P.darkWood);
  fbox("R", -0.15, 1.3, 1.1, 1.35, 0, 0.04, P.darkWood);
  // fascia under the eave
  fbox("F", -2.9, 1.2, 3.12, 3.3, 0, 0.04, P.trimCream);
  fbox("R", -2.3, 1.3, 3.12, 3.3, 0, 0.04, P.trimCream);
  fbox("L", -2.3, 1.3, 3.12, 3.3, 0.02, 0.05, P.snowMid);
  fbox("B", -2.9, 1.2, 3.12, 3.3, 0.02, 0.05, P.snowMid);
  // corner posts
  const corners: [number, number, string][] = [
    [1.2, 1.3, P.trimCream], [-2.9, 1.3, P.trimCream], [1.2, -2.3, P.trimCream], [-2.9, -2.3, P.snowMid],
  ];
  for (const [x, z, c] of corners) box(x - 0.06, x + 0.06, 1.1, 3.3, z - 0.06, z + 0.06, c);
  // siding lines on the lit faces
  for (const y of [1.5, 1.85, 2.2, 2.55, 2.9]) {
    fbox("F", -2.9, 1.2, y, y + 0.025, 0, 0.025, P.trimCream);
    fbox("R", -2.3, 1.3, y, y + 0.025, 0, 0.025, P.trimCream);
  }

  // ---------- roof ----------
  const ang = Math.atan2(0.8, 2.225);
  const deg = (ang * 180) / Math.PI;
  const sn = Math.sin(ang), cs = Math.cos(ang);
  const rp = (side: number, s: number, z: number, off: number): V => [
    -0.825 + side * (s * cs + off * sn), 4.1 - s * sn + off * cs, z,
  ];
  for (const side of [1, -1]) {
    const rot: V = [0, 0, -side * deg];
    b.part(new THREE.BoxGeometry(2.42, 0.12, 4.0), P.roofDark, { at: rp(side, 1.2, -0.5, -0.06), rotation: rot });
    // snow layer
    b.part(new THREE.BoxGeometry(2.25, 0.1, 3.9), side > 0 ? P.snowLit : P.snowMid, {
      at: rp(side, 1.12, -0.5, 0.05), rotation: rot,
    });
    // scalloped lip
    for (let i = 0; i < 6; i++) {
      const z = -2.3 + i * 0.72 + r() * 0.1;
      lump(rp(side, 2.3, z, 0.03), 0.14, 0.08, 0.22, side > 0 ? P.snowLit : P.snowShade, rot);
    }
    // lumps on top
    for (let i = 0; i < 4; i++) {
      lump(rp(side, 0.4 + r() * 1.6, -2.1 + r() * 3.4, 0.1), 0.25, 0.07, 0.3, side > 0 ? P.snowLit : P.snowMid, rot);
    }
    // bargeboards along the gable edges
    b.part(new THREE.BoxGeometry(2.5, 0.14, 0.05), P.trimCream, { at: rp(side, 1.2, 1.525, -0.1), rotation: rot });
    b.part(new THREE.BoxGeometry(2.5, 0.14, 0.05), P.snowMid, { at: rp(side, 1.2, -2.525, -0.1), rotation: rot });
  }
  box(-1.025, -0.625, 4.08, 4.18, -2.5, 1.5, P.snowLit);

  // icicles along the eaves
  for (let i = 0; i < 7; i++) {
    const len = 0.14 + r() * 0.16;
    const p = rp(1, 2.36, -2.1 + i * 0.5, -0.1);
    b.part(new THREE.ConeGeometry(0.025, len, 5), P.iceBlue, { at: [p[0], p[1] - len / 2 - 0.02, p[2]], rotation: [180, 0, 0] });
  }
  for (let i = 0; i < 4; i++) {
    const len = 0.12 + r() * 0.14;
    const p = rp(-1, 2.36, -2.0 + i * 0.9, -0.1);
    b.part(new THREE.ConeGeometry(0.025, len, 5), P.iceBlue, { at: [p[0], p[1] - len / 2 - 0.02, p[2]], rotation: [180, 0, 0] });
  }
  // back roof-edge snow lumps
  lump(rp(-1, 2.2, -2.45, 0.08), 0.3, 0.1, 0.18, P.snowMid);
  lump(rp(1, 1.5, -2.45, 0.08), 0.25, 0.09, 0.15, P.snowLit);

  // ---------- chimney ----------
  cyl(0.15, 0.1, 8, [-1.9, 3.72, -1.2], P.ink);
  lump([-1.9, 3.68, -1.2], 0.3, 0.1, 0.3, P.snowMid);
  cyl(0.1, 1.3, 8, [-1.9, 4.15, -1.2], P.metal);
  box(-2.025, -1.995, 3.55, 4.75, -1.26, -1.14, P.ridgeNear);
  cyl(0.108, 0.05, 8, [-1.9, 4.62, -1.2], P.ink);
  b.part(new THREE.ConeGeometry(0.17, 0.12, 8), P.metal, { at: [-1.9, 4.86, -1.2] });
  lump([-1.9, 4.93, -1.2], 0.13, 0.05, 0.13, P.snowLit);

  // ---------- gable window ----------
  cyl(0.27, 0.06, 8, [-0.825, 3.75, 1.33], P.trimCream, [0, 0, 1]);
  glow(cyl(0.2, 0.06, 8, [-0.825, 3.75, 1.345], P.windowGlow, [0, 0, 1]), 1.2);
  box(-0.845, -0.805, 3.55, 3.95, 1.376, 1.39, P.darkWood);
  box(-1.025, -0.625, 3.73, 3.77, 1.376, 1.39, P.darkWood);

  // ---------- windows ----------
  const win = (f: Face, uc: number, y0: number, y1: number, w: number, sh: boolean) => {
    const u0 = uc - w / 2, u1 = uc + w / 2, t = 0.07, ym = (y0 + y1) / 2;
    const fr = sh ? P.snowMid : P.trimCream;
    fbox(f, u0, u1, y1 - t, y1, 0.03, 0.08, fr);
    fbox(f, u0, u1, y0, y0 + t, 0.03, 0.08, fr);
    fbox(f, u0, u0 + t, y0, y1, 0.03, 0.08, fr);
    fbox(f, u1 - t, u1, y0, y1, 0.03, 0.08, fr);
    glow(fbox(f, u0 + t, u1 - t, y0 + t, y1 - t, 0.03, 0.05, P.windowGlow), 1.2);
    fbox(f, uc - 0.02, uc + 0.02, y0 + t, y1 - t, 0.05, 0.07, P.darkWood);
    fbox(f, u0 + t, u1 - t, ym - 0.02, ym + 0.02, 0.05, 0.07, P.darkWood);
    fbox(f, u0 + t, u1 - t, y1 - t - 0.14, y1 - t, 0.05, 0.06, P.wood);
    fbox(f, u0 - 0.06, u1 + 0.06, y0 - 0.06, y0, 0.03, 0.2, fr);
    fbox(f, u0 - 0.04, u1 + 0.04, y0, y0 + 0.05, 0.05, 0.18, sh ? P.snowShade : P.snowLit);
  };
  win("F", -2.0, 1.8, 2.8, 0.9, false);
  win("F", -0.9, 1.8, 2.8, 0.9, false);
  win("L", -0.6, 1.8, 2.8, 0.9, true);

  // ---------- vents ----------
  const vent = (f: Face, uc: number) => {
    fbox(f, uc - 0.25, uc + 0.25, 2.3, 2.7, 0.03, 0.06, P.snowMid);
    for (const y of [2.38, 2.48, 2.58]) fbox(f, uc - 0.2, uc + 0.2, y, y + 0.045, 0.06, 0.08, P.ink);
  };
  vent("L", 0.7);
  vent("B", -0.85);

  // ---------- front door ----------
  const dt = 0.07;
  fbox("F", -0.05, -0.05 + dt, 1.1, 2.4, 0.03, 0.08, P.trimCream);
  fbox("F", 0.85 - dt, 0.85, 1.1, 2.4, 0.03, 0.08, P.trimCream);
  fbox("F", -0.05, 0.85, 2.4 - dt, 2.4, 0.03, 0.08, P.trimCream);
  fbox("F", 0.02, 0.78, 1.1, 2.33, 0.03, 0.07, P.wood);
  fbox("F", 0.1, 0.7, 1.2, 1.65, 0.07, 0.09, P.darkWood);
  fbox("F", 0.1, 0.7, 1.72, 1.78, 0.07, 0.09, P.darkWood);
  fbox("F", 0.15, 0.65, 1.85, 2.25, 0.07, 0.085, P.darkWood);
  glow(fbox("F", 0.2, 0.6, 1.9, 2.2, 0.085, 0.1, P.yellow), 1.1);
  b.part(new THREE.SphereGeometry(0.04, 6, 4), P.yellow, { at: [0.69, 1.7, 1.41] });
  // nameplate
  fbox("F", 0.0, 0.8, 2.5, 2.72, 0.03, 0.08, P.darkWood);
  for (const u of [0.2, 0.4, 0.6]) fbox("F", u - 0.05, u + 0.05, 2.55, 2.67, 0.08, 0.1, P.trimCream);

  // ---------- corridor opening on the +X wall ----------
  fbox("R", -1.05, -0.15, 2.32, 2.4, 0, 0.06, P.trimCream);
  fbox("R", -1.05, -0.97, 1.1, 2.4, 0, 0.06, P.trimCream);
  fbox("R", -0.23, -0.15, 1.1, 2.4, 0, 0.06, P.trimCream);
  fbox("R", -0.97, -0.23, 1.1, 2.32, 0, 0.03, P.darkWood);

  // ---------- porch ----------
  box(-0.4, 1.2, 1.0, 1.1, 1.3, 2.1, P.darkWood);
  for (let i = 0; i < 4; i++) box(-0.4, 1.2, 1.1, 1.115, 1.3 + i * 0.2 + 0.01, 1.3 + i * 0.2 + 0.19, P.wood);
  // porch roof
  b.part(new THREE.BoxGeometry(1.85, 0.08, 1.1), P.roofDark, { at: [0.4, 3.0, 1.8], rotation: [10, 0, 0] });
  b.part(new THREE.BoxGeometry(1.75, 0.08, 1.0), P.snowLit, { at: [0.4, 3.07, 1.8], rotation: [10, 0, 0] });
  // rails
  const rail = (x0: number, x1: number, z0: number, z1: number) => {
    box(x0, x1, 1.85, 1.9, z0, z1, P.darkWood);
    box(x0, x1, 1.45, 1.5, z0, z1, P.darkWood);
  };
  rail(-0.4, 0.0, 2.03, 2.07);
  rail(0.8, 1.15, 2.03, 2.07);
  rail(1.08, 1.12, 1.3, 2.05);
  box(-0.04, 0.04, 1.1, 1.9, 2.03, 2.11, P.darkWood);
  box(0.76, 0.84, 1.1, 1.9, 2.03, 2.11, P.darkWood);
  // firewood stack
  const logs: [number, number][] = [[-0.3, 1.15], [-0.2, 1.15], [-0.1, 1.15], [-0.25, 1.24], [-0.15, 1.24]];
  for (const [x, y] of logs) {
    cyl(0.05, 0.4, 6, [x, y, 1.6], P.wood, [0, 0, 1]);
    cyl(0.04, 0.02, 6, [x, y, 1.81], P.trimCream, [0, 0, 1]);
  }
  // boots
  for (const z of [1.5, 1.72]) {
    box(0.9, 1.0, 1.1, 1.2, z - 0.1, z + 0.1, P.wood);
    box(0.91, 1.0, 1.2, 1.34, z - 0.1, z - 0.02, P.wood);
    box(0.9, 1.0, 1.1, 1.13, z - 0.1, z + 0.1, P.darkWood);
  }
  // lantern
  box(0.995, 1.005, 2.65, 2.94, 1.595, 1.605, P.ink);
  box(0.92, 1.08, 2.6, 2.66, 1.52, 1.68, P.darkWood);
  glow(box(0.94, 1.06, 2.4, 2.6, 1.54, 1.66, P.yellow), 1.6);
  box(0.92, 1.08, 2.36, 2.4, 1.52, 1.68, P.darkWood);

  // ---------- stairs ----------
  const run = 1.1 / 6;
  for (let i = 0; i < 6; i++) {
    const top = 1.1 - 0.1 * (i + 1);
    box(0, 0.8, top - 0.05, top, 2.1 + i * run + 0.01, 2.1 + (i + 1) * run + 0.04, P.wood);
  }
  rod([0.04, 0.93, 2.1], [0.04, 0.38, 3.2], 0.045, P.darkWood);
  rod([0.76, 0.93, 2.1], [0.76, 0.38, 3.2], 0.045, P.darkWood);
  box(-0.04, 0.04, 0.5, 1.35, 3.11, 3.19, P.darkWood);
  box(0.76, 0.84, 0.5, 1.35, 3.11, 3.19, P.darkWood);
  rod([0.0, 1.9, 2.07], [0.0, 1.35, 3.15], 0.03, P.darkWood);
  rod([0.8, 1.9, 2.07], [0.8, 1.35, 3.15], 0.03, P.darkWood);
}
    return buildMainHab;
  })(),
  // labAnnex
  (() => {
function buildLabAnnex({ b, P }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, x: number, y: number, z: number, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z], ...(rot ? { rotation: rot } : {}) });
  const rod = (a: number[], c2: number[], r: number, c: string) => b.rod(a, c2, r, c, { sides: 6 });

  // ---- LAB BOX
  const X0 = 2.2, X1 = 4.6, Z0 = -2.2, Z1 = 0.4, FY = 1.1, TY = 3.0;
  const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, W = X1 - X0, D = Z1 - Z0;
  box(W, TY - FY, D, P.tealPanel, cx, (FY + TY) / 2, cz);
  box(0.02, TY - FY, D, P.deepTeal, X0 - 0.01, (FY + TY) / 2, cz);
  box(W, TY - FY, 0.02, P.deepTeal, cx, (FY + TY) / 2, Z0 - 0.01);
  box(W + 0.04, 0.12, D + 0.04, P.ink, cx, FY - 0.06, cz); // floor underside
  box(W + 0.02, 0.2, D + 0.02, P.ink, cx, FY + 0.1, cz); // base band
  box(W + 0.06, 0.15, D + 0.06, P.trimCream, cx, 2.875, cz); // top band
  for (const x of [X0, X1]) for (const z of [Z0, Z1]) box(0.12, TY - FY, 0.12, P.trimCream, x, (FY + TY) / 2, z);
  // stilts
  for (const x of [X0 + 0.15, cx, X1 - 0.15]) for (const z of [Z0 + 0.15, Z1 - 0.15]) {
    box(0.16, 0.7, 0.16, P.darkWood, x, 0.8, z);
  }
  box(W - 0.2, 0.05, 0.05, P.wood, cx, 0.7, Z1 - 0.15, [0, 0, 0.0]);
  // roof
  box(W + 0.2, 0.12, D + 0.2, P.metal, cx, 3.06, cz, [0.02, 0, 0.01]);
  box(W + 0.22, 0.02, D + 0.22, P.ridgeNear, cx, 3.0, cz);
  for (let i = 0; i < 9; i++) {
    const x = X0 - 0.05 + (i + 0.5) * ((W + 0.1) / 9);
    b.part(new THREE.SphereGeometry(0.17 + R() * 0.05, 6, 4), P.snowLit, { at: [x, 3.14, Z1 + 0.08], scale: [1, 0.55, 1] });
    box(0.2, 0.03, 0.16, P.snowShade, x, 3.04, Z1 + 0.15);
  }
  box(W + 0.1, 0.12, D, P.snowLit, cx, 3.17, cz);
  for (let i = 0; i < 5; i++) {
    b.part(new THREE.SphereGeometry(0.3 + R() * 0.15, 6, 4), P.snowLit, { at: [X0 + 0.4 + i * 0.4 + R() * 0.1, 3.22, Z0 + 0.5 + R() * 1.6], scale: [1, 0.35, 1] });
  }
  // front strip window
  box(2.0, 0.78, 0.04, P.trimCream, 3.2, 2.15, Z1 + 0.02);
  glow(box(1.9, 0.68, 0.05, P.windowGlow, 3.2, 2.15, Z1 + 0.03), 1.2);
  for (let i = 0; i < 4; i++) box(0.05, 0.68, 0.07, P.darkWood, 2.6 + i * 0.6, 2.15, Z1 + 0.05);
  box(1.9, 0.05, 0.07, P.darkWood, 3.2, 2.15, Z1 + 0.05);
  box(2.1, 0.06, 0.12, P.snowLit, 3.2, 1.77, Z1 + 0.08);
  // door
  box(0.8, 1.6, 0.06, P.metal, 3.9, 1.9, Z1 + 0.03);
  box(0.8, 0.1, 0.07, P.ink, 3.9, 1.35, Z1 + 0.04);
  for (let i = 0; i < 6; i++) box(0.1, 0.1, 0.075, i % 2 ? P.ink : P.yellow, 3.55 + i * 0.15, 1.35, Z1 + 0.045);
  box(0.06, 0.1, 0.08, P.ink, 4.2, 1.9, Z1 + 0.05);
  box(0.3, 0.3, 0.04, P.yellow, 3.9, 2.55, Z1 + 0.02);
  box(0.06, 0.2, 0.05, P.ink, 3.9, 2.55, Z1 + 0.04, [0, 0, 0.5]);
  box(0.9, 0.12, 0.35, P.wood, 3.9, 0.9, Z1 + 0.2);
  box(0.9, 0.12, 0.3, P.darkWood, 3.9, 0.7, Z1 + 0.3);
  // +X face
  box(0.05, 0.6, 0.7, P.metal, X1 + 0.02, 2.2, -1.5);
  for (let i = 0; i < 5; i++) box(0.07, 0.04, 0.6, P.ink, X1 + 0.04, 1.98 + i * 0.11, -1.5);
  b.rod([X1, 1.5, -0.6], [X1 + 0.2, 1.5, -0.6], 0.1, P.metal, { sides: 6 });
  b.rod([X1 + 0.2, 1.5, -0.6], [X1 + 0.2, 2.5, -0.6], 0.1, P.metal, { sides: 6 });
  box(0.12, 0.4, 0.2, P.accentRed, X1 + 0.06, 1.6, -0.1);
  box(0.13, 0.05, 0.12, P.ink, X1 + 0.07, 1.75, -0.1);
  // roof props
  for (const [x, z] of [[2.7, 0.0], [4.3, -1.8]] as number[][]) {
    cyl(0.14, 0.14, 0.3, 8, P.metal, x, 3.38, z);
    b.part(new THREE.SphereGeometry(0.17, 6, 4), P.snowLit, { at: [x, 3.55, z], scale: [1, 0.5, 1] });
  }
  box(0.5, 0.2, 0.5, P.metal, 2.6, 3.33, -1.7);
  box(0.56, 0.06, 0.56, P.yellow, 2.6, 3.46, -1.7);
  box(0.4, 0.3, 0.4, P.trimCream, 4.2, 3.4, -0.1);
  box(0.3, 0.1, 0.02, P.ink, 4.2, 3.45, 0.11);
  glow(box(0.08, 0.06, 0.03, P.windowGlow, 4.3, 3.45, 0.12));
  // ---- LADDER
  for (const dx of [-0.17, 0.17]) rod([4.4 + dx, 1.1, Z1 + 0.12], [4.4 + dx, 3.0, Z1 + 0.12], 0.025, P.metal);
  for (let y = 1.3; y < 3.0; y += 0.3) rod([4.23, y, Z1 + 0.12], [4.57, y, Z1 + 0.12], 0.02, P.metal);
  for (let i = 0; i < 4; i++) {
    const y = 2.2 + i * 0.25;
    box(0.4, 0.02, 0.02, P.metal, 4.4, y, Z1 + 0.12);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 5) * Math.PI;
    const x = 4.4 + Math.cos(a) * 0.3, z = Z1 + 0.12 + Math.sin(a) * 0.3;
    rod([x, 2.3, z], [x, 3.0, z], 0.015, P.metal);
  }
  box(0.6, 0.02, 0.02, P.metal, 4.4, 2.6, Z1 + 0.42);
  // ---- CORRIDOR
  const cg = new THREE.CylinderGeometry(0.6, 0.6, 1.0, 6);
  b.part(cg, P.tealPanel, { at: [1.7, 1.7, -0.6], rotation: [0, 0, 90], scale: [1, 1, 1.0] });
  box(1.0, 0.04, 0.5, P.deepTeal, 1.7, 1.2, -0.6);
  box(1.0, 0.7, 0.02, P.deepTeal, 1.7, 1.7, -0.9);
  for (let i = 0; i < 4; i++) b.part(new THREE.TorusGeometry(0.6, 0.025, 4, 6), P.trimCream, { at: [1.33 + i * 0.25, 1.7, -0.6], rotation: [0, 90, 0] });
  box(0.2, 1.4, 1.3, P.trimCream, 1.2, 1.7, -0.6).mesh.scale.set(0.2, 1, 1);
  box(0.12, 1.3, 1.2, P.trimCream, 2.2, 1.7, -0.6);
  cyl(0.11, 0.11, 0.05, 8, P.trimCream, 1.7, 1.75, -0.2, [90, 0, 0]);
  glow(cyl(0.08, 0.08, 0.06, 8, P.windowGlow, 1.7, 1.75, -0.17, [90, 0, 0]));
  box(0.9, 0.1, 0.7, P.snowLit, 1.7, 2.3, -0.6);
  for (const z of [-0.85, -0.35]) box(0.14, 0.65, 0.14, P.darkWood, 1.7, 0.78, z);
  box(0.9, 0.08, 0.6, P.darkWood, 1.7, 1.1, -0.6);
  // ---- TOWER
  const tx = 3.4, tz = -0.9;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    rod([tx + sx * 0.45, 3.1, tz + sz * 0.45], [tx + sx * 0.38, 4.0, tz + sz * 0.38], 0.04, P.metal);
  }
  for (const y of [3.1, 3.55]) {
    for (const s of [-1, 1]) {
      rod([tx - 0.4, y, tz + s * 0.4], [tx + 0.4, y + 0.45, tz + s * 0.4], 0.015, P.metal);
      rod([tx + s * 0.4, y, tz - 0.4], [tx + s * 0.4, y + 0.45, tz + 0.4], 0.015, P.metal);
    }
  }
  box(1.1, 0.08, 1.1, P.darkWood, tx, 4.04, tz);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    rod([tx + Math.cos(a) * 0.52, 4.08, tz + Math.sin(a) * 0.52], [tx + Math.cos(a) * 0.52, 4.45, tz + Math.sin(a) * 0.52], 0.012, P.metal);
  }
  b.part(new THREE.TorusGeometry(0.52, 0.015, 4, 8), P.metal, { at: [tx, 4.45, tz], rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.52, 0.015, 4, 8), P.metal, { at: [tx, 4.25, tz], rotation: [90, 0, 0] });
  // radome
  const cy = 4.6;
  cyl(0.6, 0.6, 0.08, 8, P.metal, tx, 4.12, tz);
  b.part(new THREE.SphereGeometry(0.65, 8, 6), P.radomeWhite, { at: [tx, cy, tz] });
  b.part(new THREE.SphereGeometry(0.665, 8, 6, Math.PI * 0.6, Math.PI * 0.8, Math.PI * 0.4, Math.PI * 0.6), P.snowShade, { at: [tx, cy, tz], rotation: [0, 90, 0] });
  for (const dy of [-0.3, 0.0, 0.3]) {
    const r = Math.sqrt(0.65 * 0.65 - dy * dy) + 0.005;
    b.part(new THREE.TorusGeometry(r, 0.01, 3, 8), P.ink, { at: [tx, cy + dy, tz], rotation: [90, 0, 0] });
  }
  for (const a of [0, 60, 120]) b.part(new THREE.TorusGeometry(0.655, 0.01, 3, 8), P.ink, { at: [tx, cy, tz], rotation: [0, a, 0] });
  glow(b.part(new THREE.ConeGeometry(0.07, 0.18, 6), P.yellow, { at: [tx, 5.3, tz] }), 1.5);
  cyl(0.04, 0.04, 0.06, 6, P.metal, tx, 5.23, tz);
  // ---- CABLES
  const cable = (a: number[], c2: number[], sag: number) => {
    const m = [(a[0] + c2[0]) / 2, Math.min(a[1], c2[1]) - sag, (a[2] + c2[2]) / 2];
    b.sweep([a, m, c2], 0.012, { color: P.ink, sides: 4 });
    box(0.06, 0.06, 0.06, P.trimCream, a[0], a[1], a[2]);
    box(0.06, 0.06, 0.06, P.trimCream, c2[0], c2[1], c2[2]);
  };
  cable([tx + 0.4, 4.0, tz + 0.4], [4.6, 3.1, 0.3], 0.25);
  cable([tx - 0.4, 4.0, tz + 0.4], [2.4, 3.1, 0.3], 0.2);
  cable([2.3, 2.9, -0.2], [1.8, 2.35, -0.3], 0.15);
  // ---- SHADOWS
  const sh = (pts: number[][], y: number, h = 0.01) => b.slab(pts.map((p) => [p[0], y, p[1]]), { color: P.snowShade, thickness: h });
  sh([[2.2, 0.4], [4.6, 0.4], [3.4, -2.2], [1.1, -2.6]], 0.508);
  sh([[2.8, -0.4], [4.0, -0.4], [3.4, -1.4], [2.4, -1.4]], 3.26);
}
    return buildLabAnnex;
  })(),
  // mastAndPower
  (() => {
function buildMastAndPower({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const G = 0.5;
  // box helper: centre + size
  const box = (c: number[], s: number[], col: string, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(s[0], s[1], s[2]), col, { at: c as any, rotation: rot as any });
  const cyl = (c: number[], r0: number, r1: number, h: number, col: string, seg = 8, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r1, r0, h, seg), col, { at: c as any, rotation: rot as any, flat: true });
  const ball = (c: number[], r: number, col: string, seg = 8) =>
    b.part(new THREE.SphereGeometry(r, seg, 6), col, { at: c as any, flat: true });
  const rod = (a: number[], c: number[], r: number, col: string) =>
    b.rod(a as any, c as any, r, col, { sides: 6 } as any);
  const cone = (c: number[], r: number, h: number, col: string, seg = 6) =>
    b.part(new THREE.ConeGeometry(r, h, seg), col, { at: c as any, flat: true });
  const shadow = (pts: number[][], y: number) => {
    const s = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], -p[1])));
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    b.part(g, P.snowShade, { at: [0, y, 0] });
  };

  // ---------- MAST ----------
  const [mx, , mz] = M.mastBase;
  const base = 0.5, top = 6.2;
  const rAt = (y: number) => 0.225 - ((y - base) / (top - base)) * 0.125; // circumradius-ish
  const legAng = [Math.PI / 2, Math.PI / 2 + (2 * Math.PI) / 3, Math.PI / 2 + (4 * Math.PI) / 3];
  const legPt = (i: number, y: number) => [mx + Math.cos(legAng[i]) * rAt(y), y, mz + Math.sin(legAng[i]) * rAt(y)];
  // footing
  box([mx, 0.6, mz], [0.9, 0.22, 0.9], P.rock);
  box([mx, 0.725, mz], [0.92, 0.04, 0.92], P.snowLit);
  box([mx - 0.46, 0.6, mz], [0.02, 0.22, 0.9], P.ridgeNear);
  for (let i = 0; i < 3; i++) {
    const a = legPt(i, 0.7), c = legPt(i, top - 0.1);
    const shaded = Math.cos(legAng[i]) < -0.1 || i === 2;
    rod(a, c, 0.035, shaded ? P.ridgeNear : P.metal);
  }
  // rings and X braces
  const levels: number[] = [];
  for (let y = 0.9; y < 5.7; y += 0.5) levels.push(y);
  levels.forEach((y, k) => {
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      rod(legPt(i, y), legPt(j, y), 0.018, P.metal);
      if (y > 3.4) {
        const p = legPt(i, y), q = legPt(j, y);
        box([(p[0] + q[0]) / 2, y + 0.03, (p[2] + q[2]) / 2], [0.1, 0.03, 0.1], P.snowLit);
      }
      if (k < levels.length - 1) {
        rod(legPt(i, y), legPt(j, levels[k + 1]), 0.012, P.metal);
        rod(legPt(j, y), legPt(i, levels[k + 1]), 0.012, P.metal);
      }
    }
  });
  // platform
  const py = 5.35;
  cyl([mx, py, mz], 0.34, 0.34, 0.05, P.metal, 6);
  cyl([mx, py + 0.01, mz], 0.31, 0.31, 0.03, P.darkWood, 6);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    rod([mx + Math.cos(a) * 0.33, py, mz + Math.sin(a) * 0.33], [mx + Math.cos(a) * 0.33, py + 0.22, mz + Math.sin(a) * 0.33], 0.012, P.metal);
  }
  const whips = [[0.15, 0.1, 0.9], [-0.12, 0.05, 0.6], [0.02, -0.14, 0.75]];
  whips.forEach(([dx, dz, h]) => {
    rod([mx + dx, py, mz + dz], [mx + dx, py + h * 0.6, mz + dz], 0.012, P.yellow);
    ball([mx + dx, py + h * 0.6, mz + dz], 0.025, P.yellow, 6);
  });
  // top
  rod([mx, 5.7, mz], [mx, 6.05, mz], 0.03, P.metal);
  glow(cyl([mx, 5.82, mz], 0.05, 0.05, 0.07, P.yellow, 6), 1.2);
  glow(ball([mx, 6.15, mz], 0.1, P.accentRed, 8), 1.6);
  // dish
  const dc = [mx + 0.05, 4.6, mz + 0.25];
  rod([mx, 4.6, mz], dc, 0.03, P.metal);
  const dishQ = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0.45, 0.5, 0.75).normalize(),
  );
  const dn = new THREE.Vector3(0.45, 0.5, 0.75).normalize();
  const dishGeo = new THREE.CylinderGeometry(0.55, 0.06, 0.18, 10, 1, true);
  b.part(dishGeo, P.radomeWhite, { at: [dc[0] + dn.x * 0.1, dc[1] + dn.y * 0.1, dc[2] + dn.z * 0.1], quat: dishQ, flat: true });
  b.part(new THREE.CylinderGeometry(0.5, 0.05, 0.16, 10, 1, true), P.snowShade, {
    at: [dc[0] - dn.x * 0.0, dc[1] - dn.y * 0.0, dc[2] - dn.z * 0.0], quat: dishQ, flat: true,
  });
  rod(dc, [dc[0] + dn.x * 0.42, dc[1] + dn.y * 0.42, dc[2] + dn.z * 0.42], 0.015, P.metal);
  ball([dc[0] + dn.x * 0.44, dc[1] + dn.y * 0.44, dc[2] + dn.z * 0.44], 0.03, P.ink, 6);
  // equipment box
  box([mx + 0.13, 3.0, mz + 0.2], [0.3, 0.36, 0.2], P.trimCream);
  box([mx - 0.03, 3.0, mz + 0.2], [0.02, 0.36, 0.2], P.snowMid);
  box([mx + 0.13, 3.1, mz + 0.305], [0.24, 0.015, 0.01], P.ink);
  box([mx + 0.13, 2.9, mz + 0.305], [0.24, 0.015, 0.01], P.ink);
  glow(box([mx + 0.22, 3.0, mz + 0.31], [0.05, 0.05, 0.02], P.windowGlow), 1.5);
  // guy wires + anchors
  const anchors = [[-3.4, -3.4], [-4.85, -3.4], [-4.85, -1.4]];
  anchors.forEach(([ax, az]) => {
    const from = [mx, 4.5, mz], to = [ax, 0.62, az];
    const mid = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - 0.03, (from[2] + to[2]) / 2];
    b.sweep(
      [from, mid, to] as any,
      0.01,
      { color: P.ink, sides: 4 } as any,
    );
    cyl([ax, 0.55, az], 0.07, 0.07, 0.2, P.darkWood, 6);
    b.part(new THREE.TorusGeometry(0.05, 0.012, 4, 8), P.metal, { at: [ax, 0.68, az] });
    b.part(new THREE.SphereGeometry(0.15, 6, 4), P.snowLit, { at: [ax, 0.5, az], scale: [1, 0.4, 1], flat: true });
    b.part(new THREE.SphereGeometry(0.15, 6, 4), P.snowShade, { at: [ax - 0.04, 0.49, az - 0.03], scale: [1, 0.3, 1], flat: true });
  });

  // ---------- GENERATOR SHED ----------
  const x0 = -4.8, x1 = -3.5, z0 = -0.9, z1 = 0.9;
  const cx = (x0 + x1) / 2, w = x1 - x0, d = z1 - z0;
  for (const sx of [x0 + 0.15, x1 - 0.15]) for (const sz of [z0 + 0.15, z1 - 0.15])
    box([sx, 0.52, sz], [0.12, 0.08, 0.12], P.darkWood);
  box([cx - 0.35, 0.52, 0], [0.1, 0.08, d], P.darkWood);
  box([cx + 0.35, 0.52, 0], [0.1, 0.08, d], P.darkWood);
  box([cx, 1.2, 0], [w, 1.4, d], P.wood);
  box([x0 - 0.01, 1.2, 0], [0.02, 1.4, d], P.darkWood);
  box([cx, 1.2, z0 - 0.01], [w, 1.4, 0.02], P.darkWood);
  box([cx, 0.62, z1 + 0.005], [w, 0.12, 0.02], P.darkWood);
  for (const sx of [x0, x1]) box([sx, 1.2, z1], [0.07, 1.4, 0.07], P.darkWood);
  // siding lines
  for (let y = 0.85; y < 1.9; y += 0.3) {
    box([cx, y, z1 + 0.008], [w, 0.02, 0.01], P.darkWood);
    box([x1 + 0.008, y, 0], [0.01, 0.02, d], P.darkWood);
  }
  // roof (gable along Z)
  const rs = new THREE.Shape([new THREE.Vector2(-0.78, 0), new THREE.Vector2(0.78, 0), new THREE.Vector2(0, 0.55)]);
  const roofG = new THREE.ExtrudeGeometry(rs, { depth: d + 0.3, bevelEnabled: false });
  roofG.translate(0, 0, -(d + 0.3) / 2);
  b.part(roofG, P.roofDark, { at: [cx, 1.9, 0], flat: true });
  b.part(roofG.clone(), P.ink, { at: [cx - 0.0, 1.88, 0], scale: [0.99, 0.5, 0.99], flat: true });
  // snow caps on slopes
  const slopeAng = Math.atan2(0.55, 0.78);
  const sl = Math.hypot(0.78, 0.55);
  for (const s of [1, -1]) {
    const mxr = cx + s * 0.39, my = 1.9 + 0.275 + 0.06;
    const col = s > 0 ? P.snowLit : P.snowShade;
    b.part(new THREE.BoxGeometry(sl + 0.04, 0.09, d + 0.34), col, {
      at: [mxr, my, 0], rotation: [0, 0, s * slopeAng * 57.3 * -1] as any,
    });
    for (let i = 0; i < 4; i++) {
      const t = (i + 0.5) / 4;
      b.part(new THREE.SphereGeometry(0.1, 6, 4), P.snowLit, {
        at: [cx + s * 0.39 + s * 0.02, my + 0.07, -d / 2 + 0.1 + t * (d - 0.2)], scale: [1.2, 0.5, 1.4], flat: true,
      });
    }
  }
  // icicles on front eave
  for (let i = 0; i < 7; i++) {
    const x = x0 - 0.1 + (i / 6) * (w + 0.2);
    const h = 0.1 + R() * 0.12;
    b.part(new THREE.ConeGeometry(0.025, h, 5), P.iceBlue, { at: [x, 1.9 - h / 2, z1 + 0.14], rotation: [180, 0, 0] as any, flat: true });
  }
  // door
  box([-4.0, 1.05, z1 + 0.015], [0.5, 0.95, 0.03], P.trimCream);
  box([-4.0, 1.03, z1 + 0.035], [0.4, 0.85, 0.02], P.wood);
  glow(box([-4.0, 1.32, z1 + 0.05], [0.26, 0.05, 0.01], P.windowGlow), 1.3);
  ball([-3.84, 1.0, z1 + 0.06], 0.02, P.yellow, 5);
  box([-4.0, 0.8, z1 + 0.05], [0.3, 0.14, 0.01], P.yellow);
  box([-4.0, 0.8, z1 + 0.058], [0.2, 0.025, 0.005], P.ink);
  // vent on +X
  box([x1 + 0.01, 1.25, -0.4], [0.02, 0.4, 0.5], P.trimCream);
  for (let i = 0; i < 5; i++) box([x1 + 0.025, 1.1 + i * 0.07, -0.4], [0.01, 0.03, 0.4], P.ink);
  // exhaust stack
  cyl([-4.5, 2.35, -0.45], 0.07, 0.07, 0.9, P.metal, 6);
  cyl([-4.5, 2.3, -0.45], 0.075, 0.075, 0.06, P.ridgeNear, 6);
  cyl([-4.5, 2.78, -0.37], 0.07, 0.07, 0.2, P.metal, 6, [60, 0, 0]);
  cyl([-4.5, 2.83, -0.3], 0.09, 0.09, 0.03, P.ink, 6, [60, 0, 0]);
  [[-4.52, 3.0, -0.25, 0.1], [-4.62, 3.18, -0.2, 0.13], [-4.75, 3.38, -0.18, 0.11]].forEach(([x, y, z, r]) =>
    b.part(new THREE.IcosahedronGeometry(r, 0), P.snowMid, { at: [x, y, z] }));
  // jerrycans
  [[-3.75, 0.72, 1.12], [-3.55, 0.72, 1.12]].forEach(([x, y, z], i) => {
    box([x, y - 0.0, z], [0.2, 0.44, 0.13], P.accentRed);
    box([x, y + 0.26, z], [0.1, 0.07, 0.07], P.accentRed);
    box([x + 0.0, y + 0.1, z + 0.067], [0.14, 0.04, 0.005], P.yellow);
    if (i === 0) box([x, y + 0.23, z], [0.2, 0.03, 0.13], P.snowLit);
  });
  // solar panels
  for (const zz of [-0.4, 0.4]) {
    const c = [cx + 0.42, 2.35, zz];
    b.part(new THREE.BoxGeometry(0.06, 0.04, 0.6), P.trimCream, { at: c as any, rotation: [0, 0, -35] as any });
    b.part(new THREE.BoxGeometry(0.04, 0.03, 0.54), P.deepTeal, { at: [c[0] + 0.012, c[1] + 0.018, c[2]] as any, rotation: [0, 0, -35] as any });
    const pw = 0.5;
    b.part(new THREE.BoxGeometry(pw, 0.03, 0.04), P.trimCream, { at: [c[0], c[1], c[2]] as any, rotation: [0, 0, -35] as any });
    for (let k = -1; k <= 1; k++)
      b.part(new THREE.BoxGeometry(0.01, 0.005, 0.5), P.ink, { at: [c[0] + 0.0, c[1] + 0.025 + 0.0, c[2] + k * 0.17] as any, rotation: [0, 0, -35] as any });
    rod([c[0] - 0.1, 2.05, zz], [c[0] + 0.0, 2.3, zz], 0.015, P.metal);
  }
  box([cx + 0.1, 2.15, 0], [0.04, 0.3, 0.04], P.metal);
  // cables to mast
  b.sweep([[-4.6, 0.65, -0.9], [-4.4, 0.55, -1.8], [mx, 0.78, mz + 0.4]] as any, 0.015, { color: P.ink, sides: 4 } as any);
  b.sweep([[-4.3, 0.65, -0.9], [-4.1, 0.55, -1.7], [mx + 0.2, 0.78, mz + 0.4]] as any, 0.015, { color: P.ink, sides: 4 } as any);

  // ---------- SHADOWS ----------
  shadow([[mx, mz], [mx + 0.12, mz], [-4.9, -3.5], [-4.9, -3.3], [mx - 0.3, mz + 0.3]].map(([x, z]) => [Math.max(x, -4.9), Math.max(z, -3.5)]), 0.51);
  shadow([[-3.5, 0.9], [-3.5, -0.9], [-4.95, -1.4], [-4.95, 0.4]], 0.51);
}
    return buildMastAndPower;
  })(),
  // frontYard
  (() => {
function buildFrontYard({ b, P, M }: Ctx) {
  const D = Math.PI / 180;
  const Y = new THREE.Vector3(0, 1, 0);
  const G = 0.5;
  type V = [number, number, number];

  // Local-frame placer: origin o, yaw in degrees about Y; p.y is height above o.
  const F = (o: V, yaw = 0) => {
    const qy = new THREE.Quaternion().setFromAxisAngle(Y, yaw * D);
    const add = (geo: THREE.BufferGeometry, color: string, p: V, rot: V = [0, 0, 0], scale?: V) => {
      const pos = new THREE.Vector3(...p).applyQuaternion(qy).add(new THREE.Vector3(...o));
      const ql = new THREE.Quaternion().setFromEuler(new THREE.Euler(rot[0] * D, rot[1] * D, rot[2] * D));
      const q = qy.clone().multiply(ql);
      const opts: any = { at: [pos.x, pos.y, pos.z], quat: q };
      if (scale) opts.scale = scale;
      return b.part(geo, color, opts);
    };
    return {
      add,
      box: (s: V, c: string, p: V, rot?: V) => add(new THREE.BoxGeometry(s[0], s[1], s[2]), c, p, rot),
      cyl: (r: number, h: number, seg: number, c: string, p: V, rot?: V, r2?: number) =>
        add(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), c, p, rot),
      ball: (r: number, c: string, p: V, seg = 6) => add(new THREE.SphereGeometry(r, seg, Math.max(3, seg - 2)), c, p),
      cone: (r: number, h: number, seg: number, c: string, p: V, rot?: V) =>
        add(new THREE.ConeGeometry(r, h, seg), c, p, rot),
    };
  };
  const W = F([0, 0, 0], 0); // world helper (y absolute)
  const shadow = (cx: number, cz: number, w: number, d: number, yaw = 8) =>
    W.box([w, 0.01, d], P.snowShade, [cx, 0.512, cz], [0, yaw, 0]);
  const patch = (cx: number, cz: number, rx: number, rz: number, y = 0.504, c = P.snowMid, rot = 0) =>
    W.add(new THREE.CylinderGeometry(1, 1, 0.008, 8), c, [cx, y, cz], [0, rot, 0], [rx, 1, rz]);

  // ---------- packed snow, tracks ----------
  patch(2.1, 2.05, 0.85, 1.25);
  patch(2.9, 3.3, 0.5, 0.45, 0.504, P.snowMid, 20);
  patch(1.9, 3.9, 0.55, 0.4);
  patch(3.5, 1.3, 0.6, 0.35, 0.504, P.snowMid, 15);
  W.box([0.12, 0.008, 1.0], P.snowMid, [3.25, 0.504, 4.0], [0, 6, 0]);
  W.box([0.12, 0.008, 1.0], P.snowMid, [3.85, 0.504, 4.0], [0, 6, 0]);
  // footprint dents
  for (let i = 0; i < 4; i++) patch(1.25 + i * 0.1, 1.8 + i * 0.5, 0.07, 0.11, 0.505, P.snowShade, 10);

  // ---------- SLED ----------
  {
    const f = F([2.1, G, 2.0]);
    shadow(1.65, 1.8, 0.9, 1.9);
    for (const s of [1, -1]) {
      f.box([0.07, 0.09, 1.5], P.darkWood, [s * 0.28, 0.06, -0.05]);
      f.box([0.07, 0.09, 0.4], P.darkWood, [s * 0.28, 0.14, 0.9], [-28, 0, 0]);
      f.box([0.07, 0.09, 0.3], P.darkWood, [s * 0.28, 0.06, -0.9], [24, 0, 0]);
      for (const z of [-0.55, 0.0, 0.55]) f.box([0.06, 0.1, 0.06], P.wood, [s * 0.28, 0.15, z]);
    }
    f.box([0.04, 0.09, 1.5], P.darkWood, [-0.305, 0.06, -0.05]); // shade strip
    for (const z of [-0.6, 0.6]) f.box([0.8, 0.04, 0.05], P.darkWood, [0, 0.19, z]);
    for (let i = 0; i < 8; i++) f.box([0.72, 0.03, 0.16], P.wood, [0, 0.215, -0.7 + i * 0.2]);
    // crates
    f.box([0.42, 0.3, 0.38], P.trimCream, [-0.05, 0.39, -0.4]);
    f.box([0.02, 0.3, 0.38], P.snowMid, [-0.27, 0.39, -0.4]);
    f.box([0.44, 0.04, 0.4], P.ink, [-0.05, 0.56, -0.4]);
    f.box([0.4, 0.04, 0.36], P.snowLit, [-0.04, 0.6, -0.4]);
    for (const x of [-0.24, 0.14]) f.box([0.03, 0.31, 0.03], P.metal, [x, 0.39, -0.58]);
    f.box([0.3, 0.04, 0.01], P.accentRed, [-0.05, 0.43, -0.2]);
    f.box([0.3, 0.04, 0.01], P.accentRed, [-0.05, 0.35, -0.2]);
    f.box([0.36, 0.24, 0.34], P.trimCream, [-0.05, 0.345, 0.12]);
    f.box([0.02, 0.24, 0.34], P.snowMid, [-0.24, 0.345, 0.12]);
    f.box([0.38, 0.04, 0.36], P.ink, [-0.05, 0.485, 0.12]);
    f.box([0.34, 0.04, 0.3], P.snowLit, [-0.03, 0.525, 0.12]);
    f.box([0.2, 0.04, 0.01], P.accentRed, [-0.05, 0.36, 0.3]);
    for (const x of [-0.21, 0.11]) f.box([0.03, 0.25, 0.03], P.metal, [x, 0.345, 0.3]);
    // tarp roll
    f.cyl(0.11, 0.62, 7, P.tealPanel, [-0.03, 0.335, 0.55], [0, 0, 90]);
    f.cyl(0.112, 0.62, 7, P.deepTeal, [-0.03, 0.31, 0.55], [0, 0, 90]).mesh.scale.set(1, 1, 0.01);
    for (const x of [-0.2, 0.14]) f.cyl(0.117, 0.03, 7, P.ink, [x, 0.335, 0.55], [0, 0, 90]);
    f.cyl(0.08, 0.04, 6, P.snowLit, [-0.03, 0.45, 0.55], [0, 0, 90]);
    // jerrycan
    f.box([0.2, 0.28, 0.11], P.yellow, [0.2, 0.37, 0.8]);
    f.box([0.06, 0.05, 0.05], P.ink, [0.2, 0.53, 0.8]);
    f.box([0.02, 0.28, 0.11], P.darkWood, [0.1, 0.37, 0.8]).mesh.visible = true;
    // lashing ropes
    f.box([0.025, 0.012, 1.1], P.ink, [0.14, 0.64, -0.05]).mesh.scale.set(1, 1, 0.5);
    f.box([0.025, 0.012, 0.9], P.ink, [0.31, 0.24, 0.0]);
    f.box([0.025, 0.012, 0.9], P.ink, [-0.34, 0.24, 0.0]);
    f.box([0.74, 0.012, 0.025], P.ink, [0, 0.235, 0.33]);
  }

  // ---------- SNOWMOBILE ----------
  {
    const f = F([3.6, G, 3.2], 25);
    shadow(3.1, 3.05, 1.2, 2.0, 25);
    for (const s of [1, -1]) {
      f.box([0.12, 0.05, 1.3], P.metal, [s * 0.42, 0.06, 0.35]);
      f.box([0.12, 0.05, 0.4], P.metal, [s * 0.42, 0.16, 1.1], [-30, 0, 0]);
      f.box([0.04, 0.2, 0.04], P.metal, [s * 0.42, 0.18, 0.7]);
      f.box([0.04, 0.2, 0.04], P.metal, [s * 0.42, 0.18, 0.1]);
    }
    f.box([0.04, 0.05, 1.3], P.ridgeNear, [-0.49, 0.06, 0.35]);
    // track
    f.box([0.42, 0.24, 1.05], P.ink, [0, 0.2, -0.45]);
    f.box([0.42, 0.1, 0.5], P.ink, [0, 0.12, -1.0], [20, 0, 0]);
    for (const z of [-0.8, -0.5, -0.2])
      for (const s of [1, -1]) f.cyl(0.09, 0.04, 8, P.metal, [s * 0.22, 0.14, z], [0, 0, 90]);
    // body
    f.box([0.62, 0.3, 1.2], P.accentRed, [0, 0.45, 0.0]);
    f.box([0.02, 0.3, 1.2], P.wallRed, [-0.32, 0.45, 0.0]);
    f.box([0.58, 0.22, 0.65], P.accentRed, [0, 0.5, 0.7], [-8, 0, 0]);
    f.box([0.02, 0.22, 0.65], P.wallRed, [-0.3, 0.5, 0.7], [-8, 0, 0]);
    f.box([0.58, 0.18, 0.3], P.accentRed, [0, 0.42, 1.05], [-18, 0, 0]);
    f.box([0.14, 0.012, 1.5], P.tealPanel, [0, 0.62, 0.45]);
    f.box([0.5, 0.025, 0.5], P.snowLit, [0.04, 0.62, 0.65]);
    // windscreen
    f.box([0.46, 0.3, 0.02], P.iceBlue, [0, 0.78, 0.3], [-30, 0, 0]);
    // handlebar
    f.cyl(0.025, 0.7, 6, P.ink, [0, 0.86, 0.12], [0, 0, 90]);
    for (const s of [1, -1]) {
      f.box([0.08, 0.1, 0.03], P.metal, [s * 0.32, 0.95, 0.14]);
      f.cyl(0.035, 0.12, 6, P.ink, [s * 0.35, 0.86, 0.12], [0, 0, 90]);
    }
    f.cyl(0.03, 0.3, 6, P.ink, [0, 0.75, 0.12]);
    // seat
    f.box([0.4, 0.1, 0.55], P.ink, [0, 0.66, -0.35]);
    f.box([0.42, 0.025, 0.57], P.trimCream, [0, 0.61, -0.35]);
    f.box([0.3, 0.02, 0.4], P.snowLit, [0.03, 0.72, -0.35]);
    // rack
    f.box([0.5, 0.03, 0.42], P.metal, [0, 0.6, -0.95]);
    for (const s of [1, -1]) f.box([0.03, 0.2, 0.03], P.metal, [s * 0.23, 0.5, -0.95]);
    f.box([0.32, 0.2, 0.3], P.yellow, [0, 0.72, -0.95]);
    f.box([0.34, 0.025, 0.32], P.snowLit, [0.01, 0.84, -0.95]);
    // headlight
    glow(f.box([0.2, 0.1, 0.05], P.windowGlow, [0, 0.53, 1.17], [-18, 0, 0]), 1.6);
    f.box([0.24, 0.14, 0.03], P.ink, [0, 0.53, 1.14], [-18, 0, 0]);
  }

  // ---------- FUEL DRUMS ----------
  {
    const drum = (x: number, z: number, c: string, lying = false) => {
      const f = F([x, G, z]);
      if (!lying) {
        f.cyl(0.28, 0.6, 8, c, [0, 0.3, 0]);
        f.cyl(0.285, 0.04, 8, P.ink, [0, 0.18, 0]);
        f.cyl(0.285, 0.04, 8, P.ink, [0, 0.42, 0]);
        f.cyl(0.26, 0.04, 8, P.metal, [0, 0.62, 0]);
        f.cyl(0.2, 0.04, 8, P.snowLit, [0.03, 0.66, 0.02]);
        f.box([0.02, 0.5, 0.2], P.ridgeNear, [-0.275, 0.3, 0.0]).mesh.visible = true;
      } else {
        f.box([0.12, 0.14, 0.7], P.darkWood, [-0.17, 0.07, 0]);
        f.box([0.12, 0.14, 0.7], P.darkWood, [0.17, 0.07, 0]);
        f.cyl(0.28, 0.6, 8, c, [0, 0.42, 0], [0, 0, 90]);
        f.cyl(0.285, 0.04, 8, P.ink, [-0.12, 0.42, 0], [0, 0, 90]);
        f.cyl(0.285, 0.04, 8, P.ink, [0.12, 0.42, 0], [0, 0, 90]);
        f.cyl(0.26, 0.04, 8, P.metal, [0.31, 0.42, 0], [0, 0, 90]);
        f.cyl(0.26, 0.04, 8, P.metal, [-0.31, 0.42, 0], [0, 0, 90]);
        f.box([0.4, 0.04, 0.24], P.snowLit, [0.04, 0.7, 0.03]);
      }
    };
    shadow(3.85, 1.45, 1.5, 1.2, 12);
    shadow(4.0, 1.95, 1.0, 0.6, 12);
    drum(3.6, 1.25, P.yellow);
    drum(4.2, 1.25, P.accentRed);
    drum(4.5, 1.85, P.yellow);
    drum(3.9, 1.95, P.accentRed, true);
    // hand pump on first drum
    const f = F([3.6, G, 1.25]);
    f.cyl(0.03, 0.4, 6, P.metal, [0.05, 0.84, 0]);
    f.box([0.3, 0.03, 0.04], P.metal, [0.0, 1.05, 0]);
    f.box([0.05, 0.1, 0.05], P.ink, [-0.14, 1.0, 0]);
    f.cyl(0.02, 0.3, 6, P.metal, [0.2, 0.7, 0.1], [0, 0, -60]);
  }

  // ---------- WEATHER SCREEN ----------
  {
    const f = F([2.0, G, 3.9]);
    shadow(1.55, 3.8, 0.9, 0.9, 10);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) f.box([0.06, 1.1, 0.06], P.darkWood, [sx * 0.25, 0.55, sz * 0.2]);
    f.box([0.64, 0.45, 0.52], P.trimCream, [0, 1.32, 0]);
    f.box([0.02, 0.45, 0.52], P.snowMid, [-0.33, 1.32, 0]);
    f.box([0.64, 0.45, 0.02], P.snowMid, [0, 1.32, -0.27]);
    f.box([0.72, 0.05, 0.6], P.trimCream, [0.0, 1.57, 0], [-6, 0, 0]);
    f.box([0.66, 0.03, 0.5], P.snowLit, [0.02, 1.61, 0], [-6, 0, 0]);
    f.box([0.64, 0.04, 0.54], P.darkWood, [0, 1.07, 0]);
    for (let i = 0; i < 4; i++) f.box([0.5, 0.025, 0.02], P.snowMid, [-0.04, 1.2 + i * 0.07, 0.27]);
    f.box([0.5, 0.025, 0.02], P.snowMid, [-0.04, 1.2 + 4 * 0.07, 0.27]);
    f.box([0.04, 0.3, 0.02], P.darkWood, [0.29, 1.32, 0.275]); // hinge
    f.ball(0.025, P.yellow, [0.22, 1.32, 0.29], 5);
    // anemometer
    f.cyl(0.03, 1.9, 6, P.metal, [0.75, 0.95, -0.1]);
    f.cyl(0.035, 0.05, 6, P.ink, [0.75, 1.9, -0.1]);
    for (let i = 0; i < 3; i++) {
      const a = (i * 120 + 20) * D;
      const x = 0.75 + Math.cos(a) * 0.17;
      const z = -0.1 + Math.sin(a) * 0.17;
      f.box([0.17, 0.02, 0.02], P.metal, [0.75 + Math.cos(a) * 0.085, 1.93, -0.1 + Math.sin(a) * 0.085], [0, -i * 120 - 20, 0]);
      f.ball(0.06, P.yellow, [x, 1.93, z], 6);
    }
    // wind vane
    f.box([0.3, 0.02, 0.02], P.metal, [0.75, 1.78, -0.1], [0, 20, 0]);
    f.box([0.12, 0.1, 0.015], P.accentRed, [0.88, 1.78, -0.15], [0, 20, 0]);
    // snow gauge
    f.cyl(0.07, 0.55, 8, P.metal, [-0.6, 0.275, 0.35]);
    for (let i = 0; i < 4; i++) f.box([0.05, 0.012, 0.01], P.ink, [-0.6, 0.15 + i * 0.1, 0.42]);
    f.cyl(0.075, 0.03, 8, P.snowLit, [-0.6, 0.57, 0.35]);
  }

  // ---------- FLAG & CAIRN ----------
  {
    const f = F([4.4, G, 3.9]);
    shadow(3.95, 3.75, 1.0, 0.6, 12);
    f.add(new THREE.DodecahedronGeometry(0.32, 0), P.rock, [0, 0.16, 0], [0, 15, 0], [1, 0.6, 1]);
    f.add(new THREE.DodecahedronGeometry(0.2, 0), P.rock, [0.2, 0.12, 0.17], [0, 40, 0], [1, 0.7, 1]);
    f.add(new THREE.DodecahedronGeometry(0.18, 0), P.ridgeNear, [-0.22, 0.1, -0.1], [0, 5, 0], [1, 0.6, 1]);
    f.add(new THREE.DodecahedronGeometry(0.2, 0), P.rock, [0, 0.35, 0], [0, 30, 0], [1, 0.6, 1]);
    f.add(new THREE.DodecahedronGeometry(0.16, 0), P.snowLit, [0.04, 0.46, 0.02], [0, 10, 0], [1, 0.4, 1]);
    f.add(new THREE.DodecahedronGeometry(0.12, 0), P.snowLit, [0.2, 0.2, 0.17], [0, 20, 0], [1, 0.3, 1]);
    f.cyl(0.03, 1.8, 6, P.metal, [0, 1.35, 0]);
    f.ball(0.05, P.yellow, [0, 2.3, 0], 6);
    const segs: [number, number][] = [
      [-0.14, 12],
      [-0.4, -10],
      [-0.66, 12],
    ];
    segs.forEach(([x, yaw], i) => {
      const z = i === 1 ? 0.05 : i === 2 ? 0.0 : 0.0;
      f.box([0.27, 0.34, 0.02], P.accentRed, [x, 2.0, z], [0, yaw, 0]);
    });
    // emblem cross on middle & first segment
    f.box([0.14, 0.04, 0.03], P.trimCream, [-0.4, 2.0, 0.05], [0, -10, 0]);
    f.box([0.04, 0.14, 0.03], P.trimCream, [-0.4, 2.0, 0.05], [0, -10, 0]);
    f.box([0.2, 0.025, 0.025], P.trimCream, [-0.14, 1.88, 0.0], [0, 12, 0]);
    f.box([0.2, 0.025, 0.025], P.trimCream, [-0.66, 2.13, 0.0], [0, 12, 0]);
    f.box([0.27, 0.34, 0.015], P.wallRed, [-0.4, 2.0, 0.035], [0, -10, 0]).mesh.visible = false;
  }

  // ---------- LANTERN POST ----------
  {
    const f = F([1.6, G, 1.0]);
    shadow(1.15, 0.9, 0.8, 0.5, 12);
    f.box([0.1, 1.4, 0.1], P.darkWood, [0, 0.7, 0]);
    f.box([0.02, 1.4, 0.1], P.darkWood, [-0.06, 0.7, 0]);
    f.box([0.3, 0.07, 0.07], P.darkWood, [0.12, 1.36, 0], [0, 0, 0]);
    f.box([0.04, 0.06, 0.04], P.ink, [0.24, 1.3, 0]);
    glow(f.box([0.16, 0.2, 0.16], P.yellow, [0.24, 1.18, 0]), 1.6);
    for (const [x, z] of [[0.15, 0.07], [0.15, -0.07], [0.33, 0.07], [0.33, -0.07]])
      f.box([0.02, 0.2, 0.02], P.ink, [x + 0.0, 1.18, z]);
    f.cone(0.15, 0.1, 4, P.roofDark, [0.24, 1.33, 0], [0, 45, 0]);
    f.cone(0.1, 0.05, 4, P.snowLit, [0.25, 1.38, 0], [0, 45, 0]);
    f.box([0.14, 0.04, 0.14], P.snowLit, [0, 1.42, 0]);
  }

  // ---------- SIGNPOST ----------
  {
    const f = F([1.5, G, 4.0]);
    shadow(1.1, 3.9, 0.8, 0.4, 12);
    f.box([0.1, 1.5, 0.1], P.darkWood, [0, 0.75, 0]);
    f.box([0.02, 1.5, 0.1], P.darkWood, [-0.06, 0.75, 0]);
    f.box([0.1, 0.03, 0.12], P.snowLit, [0, 1.52, 0]);
    const board = (y: number, dir: number, yaw: number) => {
      f.box([0.6, 0.16, 0.03], P.trimCream, [0.1 * dir, y, 0.07], [0, yaw, 0]);
      f.box([0.6, 0.16, 0.02], P.snowMid, [0.1 * dir - 0.01, y, 0.05], [0, yaw, 0]);
      f.box([0.3, 0.025, 0.02], P.ink, [0.08 * dir, y, 0.09], [0, yaw, 0]);
      f.cone(0.06, 0.1, 3, P.ink, [(0.08 + 0.2) * dir, y, 0.09], [0, 0, -90 * dir]);
      f.box([0.62, 0.025, 0.04], P.snowLit, [0.1 * dir, y + 0.095, 0.07], [0, yaw, 0]);
    };
    board(1.3, 1, 6);
    board(1.05, -1, -5);
  }

  // ---------- a few snow lumps / sprinkles for life ----------
  const r = rng(11);
  for (let i = 0; i < 5; i++) {
    const x = 1.4 + r() * 3.2;
    const z = 0.9 + r() * 3.3;
    W.add(new THREE.DodecahedronGeometry(0.07, 0), P.snowLit, [x, 0.5, z], [0, r() * 90, 0], [1.5, 0.5, 1.2]);
  }
}
    return buildFrontYard;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "polarOutpostSeven" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
