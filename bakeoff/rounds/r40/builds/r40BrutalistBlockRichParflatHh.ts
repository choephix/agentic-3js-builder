import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, aim } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Brutalist Housing Block",
  "description": "A monumental raw-concrete slab block on massive tapered pilotis, with a deep loggia facade of coloured panels, a rooftop terrace with vaulted crèche and chimney stacks, and two free-standing rear service towers linked by bridges."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  concrete: "#8d8982",
  concreteLight: "#aaa69d",
  concreteDark: "#66635d",
  concreteStain: "#585650",
  concreteWarm: "#9b9283",
  boardSeam: "#74716a",
  panelRed: "#b5402c",
  panelYellow: "#d6a12a",
  panelBlue: "#2f5c8f",
  panelGreen: "#4e7a5a",
  glass: "#6a8794",
  glassDark: "#26343c",
  windowGlow: "#ffc56a",
  steel: "#3c4046",
  railing: "#222428",
  roofTar: "#46443f",
  moss: "#5c6a43",
  paving: "#76746d",
  asphalt: "#38383a",
  wood: "#86663f",
  doorOrange: "#c9622a",
  tankGrey: "#7d8286",
  white: "#d8d5cc",
};
const M = {
  groundCentre: [0, 0, 0] as [number, number, number],
  soffitLevel: [0, 6, 0] as [number, number, number],
  roofSlabTop: [0, 30, 0] as [number, number, number],
  parapetTop: [0, 31.2, 0] as [number, number, number],
  slabFrontFace: [0, 6, 5] as [number, number, number],
  facadeOuterEdge: [0, 6, 9] as [number, number, number],
  slabBackFace: [0, 6, -9] as [number, number, number],
  slabEndLeft: [27, 6, 0] as [number, number, number],
  slabEndRight: [-27, 6, 0] as [number, number, number],
  facadeCell0Centre: [-24, 6, 5] as [number, number, number],
  facadeCell8Centre: [24, 6, 5] as [number, number, number],
  pierFrontRowZ: [0, 0, 5] as [number, number, number],
  pierBackRowZ: [0, 0, -5] as [number, number, number],
  lobbyCentre: [0, 0, 7] as [number, number, number],
  towerLeftBase: [-16, 0, -11.5] as [number, number, number],
  towerRightBase: [16, 0, -11.5] as [number, number, number],
  towerTop: [0, 34, -11.5] as [number, number, number],
  bridgeLeftLevel12: [-16, 12, -9.5] as [number, number, number],
  bridgeLeftLevel18: [-16, 18, -9.5] as [number, number, number],
  bridgeLeftLevel24: [-16, 24, -9.5] as [number, number, number],
  bridgeRightLevel12: [16, 12, -9.5] as [number, number, number],
  bridgeRightLevel18: [16, 18, -9.5] as [number, number, number],
  bridgeRightLevel24: [16, 24, -9.5] as [number, number, number],
  roofPavilionCentre: [0, 31.2, -1] as [number, number, number],
  roofStackLeft: [18, 31.2, -4] as [number, number, number],
  roofStackRight: [-18, 31.2, -4] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // base
  (() => {
function buildBase({ b, P }: Ctx) {
  const R = rng(7);
  const bins = new Map<string, THREE.BufferGeometry[]>();

  // ---------- geometry bins (merged per colour at the end) ----------
  const put = (col: string, g: THREE.BufferGeometry) => {
    const h = g.index ? g.toNonIndexed() : g;
    if (h.getAttribute("uv")) h.deleteAttribute("uv");
    h.clearGroups();
    if (!bins.has(col)) bins.set(col, []);
    bins.get(col)!.push(h);
  };
  const bb = (col: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    put(col, g);
  };
  const rb = (
    col: string, cx: number, cy: number, cz: number, w: number, h: number, d: number,
    rx = 0, ry = 0, rz = 0,
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz)));
    g.translate(cx, cy, cz);
    put(col, g);
  };
  const cyl = (col: string, cx: number, cy: number, cz: number, rt: number, rbm: number, h: number, seg: number) => {
    const g = new THREE.CylinderGeometry(rt, rbm, h, seg);
    g.translate(cx, cy, cz);
    put(col, g);
  };
  const lerp = (a: number, b2: number, t: number) => a + (b2 - a) * t;

  // chamfered-rectangle ring, ordered +x toward -z so side normals face outward
  const ring = (w: number, d: number, c: number): [number, number][] => {
    const hw = w / 2, hd = d / 2;
    const k = Math.max(0.001, Math.min(c, hw * 0.95, hd * 0.95));
    return [
      [hw, hd - k], [hw, -(hd - k)], [hw - k, -hd], [-(hw - k), -hd],
      [-hw, -(hd - k)], [-hw, hd - k], [-(hw - k), hd], [hw - k, hd],
    ];
  };
  // chamfered, tapered block (flat shaded)
  const frust = (
    col: string, cx: number, cz: number, y0: number, y1: number,
    w0: number, d0: number, w1: number, d1: number, c0: number, c1: number, caps = true,
  ) => {
    const A = ring(w0, d0, c0), B = ring(w1, d1, c1);
    const pos: number[] = [];
    const v = (p: [number, number], y: number): [number, number, number] => [p[0] + cx, y, p[1] + cz];
    const tri = (a: number[], b2: number[], c: number[]) => pos.push(...a, ...b2, ...c);
    for (let i = 0; i < 8; i++) {
      const j = (i + 1) % 8;
      const a0 = v(A[i], y0), a1 = v(A[j], y0), b0 = v(B[i], y1), b1 = v(B[j], y1);
      tri(a0, a1, b1);
      tri(a0, b1, b0);
      if (caps) {
        tri([cx, y1, cz], b0, b1);
        tri([cx, y0, cz], a1, a0);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    put(col, g);
  };
  // 2D profile in (x,y) extruded along z
  const prism = (col: string, pts: [number, number][], z0: number, z1: number) => {
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false });
    g.translate(0, 0, z0);
    put(col, g);
  };
  // 2D profile in (z,y) extruded along x
  const prismX = (col: string, pts: [number, number][], x0: number, x1: number) => {
    const shape = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    g.translate(x1, 0, 0);
    put(col, g);
  };

  const C = P.concrete, CL = P.concreteLight, CD = P.concreteDark, CS = P.concreteStain;
  const CW = P.concreteWarm, SEAM = P.boardSeam, STEEL = P.steel, MOSS = P.moss;

  // ---------- plinth, paving, front strip ----------
  bb(P.paving, -27, 0, -9, 27, 0.3, 9);
  for (let k = 0; k < 9; k++) {
    const x = -24 + 6 * k;
    bb(CD, x - 0.02, 0.3, -8.9, x + 0.02, 0.305, 8.9);
  }
  for (const z of [-6, -3, 0, 3, 6]) bb(CD, -24.9, 0.3, z - 0.02, 24.9, 0.305, z + 0.02);
  // asphalt strip and kerb (clear of the steps and ramp)
  for (const [x0, x1] of [[-24.9, -7], [14, 24.9]]) {
    bb(P.asphalt, x0, 0.3, 8.15, x1, 0.33, 9);
    bb(CL, x0, 0.3, 8.0, x1, 0.46, 8.15);
    for (let x = x0 + 1; x < x1 - 1.2; x += 2.4) bb(P.white, x, 0.33, 8.53, x + 1.2, 0.335, 8.59);
  }
  // drain grates
  for (const [x, z] of [[-10, 6.9], [-24, 3], [24, -3], [10, -7], [-6, -7]])
    bb(STEEL, x - 0.3, 0.3, z - 0.12, x + 0.3, 0.32, z + 0.12);

  // ---------- pilotis ----------
  const dims = (y: number): [number, number] => {
    if (y < 3.3) {
      const t = (y - 0.7) / 2.6;
      return [lerp(2.2, 1.85, t), lerp(2.8, 2.6, t)];
    }
    const t = (y - 3.3) / 2.7;
    return [lerp(1.85, 1.6, t), lerp(2.6, 2.4, t)];
  };
  const xs = [-21, -15, -9, -3, 3, 9, 15, 21];
  const warmPiers = new Set(["-15,5", "3,-5", "21,5"]);
  const patches: Record<string, string> = { "-9,5": CL, "15,-5": CL, "3,5": CW, "-15,-5": CW };
  for (const z of [5, -5]) {
    for (const x of xs) {
      const key = `${x},${z}`;
      frust(CD, x, z, 0.3, 0.7, 2.7, 3.1, 2.5, 2.9, 0.15, 0.15);
      frust(C, x, z, 0.7, 3.3, 2.2, 2.8, 1.85, 2.6, 0.2, 0.18);
      frust(warmPiers.has(key) ? CW : C, x, z, 3.3, 6, 1.85, 2.6, 1.6, 2.4, 0.18, 0.16);
      // wear at the foot and form joint
      const f0 = dims(0.7), f1 = dims(1.1);
      frust(CS, x, z, 0.7, 1.1, f0[0] + 0.05, f0[1] + 0.05, f1[0] + 0.05, f1[1] + 0.05, 0.2, 0.19);
      frust(CD, x, z, 3.26, 3.36, 1.95, 2.7, 1.95, 2.7, 0.19, 0.19);
      // board-form ribs
      for (const y of [1.6, 2.4, 4.0, 4.7, 5.4]) {
        const d = dims(y);
        frust(SEAM, x, z, y, y + 0.07, d[0] + 0.07, d[1] + 0.07, d[0] + 0.07, d[1] + 0.07, 0.19, 0.19, false);
      }
      // rain streaks on both broad faces
      for (const sg of [1, -1]) {
        for (let k = 0; k < 2; k++) {
          const L = 0.8 + R() * 1.5;
          const yc = 0.95 + L / 2;
          const fz = z + (sg * dims(yc)[1]) / 2;
          const px = x + (R() - 0.5) * 1.0;
          const zc = fz + sg * 0.005;
          bb(CS, px - 0.04, yc - L / 2, zc - 0.02, px + 0.04, yc + L / 2, zc + 0.02);
        }
      }
      // cast patches on the outward face
      if (patches[key]) {
        const sg = z > 0 ? 1 : -1;
        const fz = z + (sg * dims(4.55)[1]) / 2;
        const za = fz - sg * 0.02, zb = fz + sg * 0.04;
        bb(patches[key], x - 0.45, 3.9, Math.min(za, zb), x + 0.45, 5.2, Math.max(za, zb));
      }
    }
  }

  // ---------- heavy end piers (blind walls, 2 m thick) ----------
  for (const sx of [1, -1]) {
    const cx = sx * 26;
    frust(CD, cx, 0, 0.3, 0.7, 2.0, 17.96, 2.0, 17.96, 0.3, 0.3);
    frust(C, cx, 0, 0.7, 6, 1.9, 17.9, 1.9, 17.9, 0.25, 0.25);
    for (let y = 1.2; y < 5.9; y += 0.6) frust(SEAM, cx, 0, y, y + 0.06, 1.98, 17.98, 1.98, 17.98, 0.27, 0.27, false);
    for (const o of [1, -1]) {
      const fx = cx + o * 0.95;
      const inner = [CW, CL, CW];
      [-5.8, 0, 5.8].forEach((zc, i) => {
        bb(CD, Math.min(fx - o * 0.02, fx + o * 0.04), 0.95, zc - 1.7, Math.max(fx - o * 0.02, fx + o * 0.04), 5.5, zc + 1.7);
        bb(inner[i], Math.min(fx - o * 0.02, fx + o * 0.07), 1.1, zc - 1.5, Math.max(fx - o * 0.02, fx + o * 0.07), 5.35, zc + 1.5);
        // stepped relief notch
        bb(CD, Math.min(fx, fx + o * 0.09), 2.2, zc - 0.25, Math.max(fx, fx + o * 0.09), 4.3, zc + 0.25);
      });
      for (let k = 0; k < 5; k++) {
        const zc = -7.5 + k * 3.7 + R();
        const L = 1.0 + R() * 1.4;
        bb(CS, Math.min(fx, fx + o * 0.05), 6 - L, zc - 0.05, Math.max(fx, fx + o * 0.05), 6, zc + 0.05);
      }
    }
    // moss tuft at the foot
    bb(MOSS, cx - sx * 1.05 - 0.4, 0.3, 3, cx - sx * 1.05 + 0.4, 0.34, 4.6);
  }

  // ---------- entrance lobby ----------
  frust(CL, 0, 5.5, 0.3, 0.9, 10.8, 5, 10.8, 5, 0.15, 0.15);
  // steps
  bb(C, -3.4, 0.3, 8.5, 3.4, 0.5, 9);
  bb(C, -3.4, 0.3, 8.0, 3.4, 0.7, 8.5);
  bb(CL, -3.4, 0.5, 8.5, 3.4, 0.52, 8.62 + 0.0);
  bb(CL, -3.4, 0.7, 8.0, 3.4, 0.72, 8.12);
  // steps side rails
  const sAng = Math.atan(0.4);
  for (const x of [-3.5, 3.5]) {
    rb(STEEL, x, 1.55, 8.5, 0.06, 0.06, 1.08, sAng, 0, 0);
    rb(P.railing, x, 1.1, 8.5, 0.04, 0.04, 1.08, sAng, 0, 0);
    for (const [z, base] of [[8.9, 0.5], [8.55, 0.5], [8.1, 0.7]] as [number, number][])
      bb(STEEL, x - 0.03, base, z - 0.03, x + 0.03, 1.35 + (9 - z) * 0.4 + 0.2, z + 0.03);
  }
  // glazing
  bb(P.glassDark, -5, 1.0, 7.47, 5, 2.93, 7.53);
  bb(P.glass, -5, 3.05, 7.47, 5, 5.1, 7.53);
  for (let i = 0; i < 9; i++) {
    const x = -5 + 1.25 * i;
    bb(STEEL, x - 0.045, 0.9, 7.43, x + 0.045, 5.2, 7.57);
  }
  bb(STEEL, -5, 2.93, 7.43, 5, 3.05, 7.57);
  bb(STEEL, -5, 0.9, 7.43, 5, 1.0, 7.57);
  bb(STEEL, -5, 5.1, 7.43, 5, 5.2, 7.57);
  // doors
  for (const s of [1, -1]) {
    const a = s > 0 ? 0.02 : -1.22, c = s > 0 ? 1.22 : -0.02;
    bb(P.doorOrange, a, 1.0, 7.5, c, 2.93, 7.6);
    const va = s > 0 ? 0.25 : -1.0, vc = s > 0 ? 1.0 : -0.25;
    bb(P.glassDark, va, 1.7, 7.6, vc, 2.6, 7.63);
    const ha = s > 0 ? 0.1 : -0.15, hc = s > 0 ? 0.15 : -0.1;
    bb(STEEL, ha, 1.4, 7.63, hc, 2.2, 7.7);
  }
  // side glazing and back wall
  for (const s of [1, -1]) {
    const xa = s * 4.97, xb = s * 5.03;
    bb(P.glassDark, Math.min(xa, xb), 1.0, 3.1, Math.max(xa, xb), 2.93, 7.45);
    bb(P.glass, Math.min(xa, xb), 3.05, 3.1, Math.max(xa, xb), 5.1, 7.45);
    for (const z of [3.1, 4.6, 6.1, 7.45]) bb(STEEL, s * 5 - 0.07, 0.9, z - 0.045, s * 5 + 0.07, 5.2, z + 0.045);
    bb(STEEL, s * 5 - 0.07, 2.93, 3.1, s * 5 + 0.07, 3.05, 7.5);
    bb(STEEL, s * 5 - 0.07, 5.1, 3.1, s * 5 + 0.07, 5.2, 7.5);
  }
  bb(C, -5, 0.9, 2.9, 5, 5.2, 3.1);
  bb(P.panelYellow, -3.8, 1.6, 3.1, -1.4, 3.6, 3.15);
  bb(P.panelRed, -1.2, 1.6, 3.1, 1.2, 3.6, 3.15);
  bb(P.panelBlue, 1.4, 1.6, 3.1, 3.8, 3.6, 3.15);
  // reception desk
  bb(CD, -1.6, 0.9, 3.4, 1.6, 1.85, 4.2);
  bb(P.wood, -1.7, 1.85, 3.35, 1.7, 1.93, 4.3);
  // canopy with tapered edge
  prismX(C, [[3.0, 5.2], [8.1, 5.2], [8.6, 5.45], [8.6, 5.75], [3.0, 5.75]], -6, 6);
  bb(CD, -6, 5.2, 3.0, 6, 5.24, 8.1);
  bb(MOSS, -4.5, 5.75, 6.0, -2.6, 5.775, 7.6);
  bb(MOSS, 2.2, 5.75, 4.0, 4.8, 5.775, 5.3);
  for (const x of [-4, 4]) bb(CS, x - 0.05, 4.2, 8.56, x + 0.05, 5.2, 8.6);
  // hanging sign: steel bar with separate letter blocks
  for (const x of [-2.0, 2.0]) bb(STEEL, x - 0.02, 4.95, 7.98, x + 0.02, 5.2, 8.02);
  bb(STEEL, -2.4, 4.3, 7.95, 2.4, 4.95, 8.05);
  const FONT: Record<string, string[]> = {
    H: ["101", "101", "111", "101", "101"],
    A: ["010", "101", "111", "101", "101"],
    B: ["110", "101", "110", "101", "110"],
    I: ["111", "010", "010", "010", "111"],
    T: ["111", "010", "010", "010", "010"],
  };
  const px = 0.075;
  "HABITAT".split("").forEach((ch, li) => {
    const x0 = -1.1 + li * 0.33;
    FONT[ch].forEach((row, ry) => {
      row.split("").forEach((bit, rx) => {
        if (bit === "1") {
          const x = x0 + rx * px, y = 4.8 - (ry + 1) * px;
          bb(P.white, x, y, 8.05, x + px, y + px, 8.11);
        }
      });
    });
  });

  // ---------- ramp with cheeks and rails ----------
  const slope = 0.6 / 6.6;
  const ang = Math.atan(slope);
  const yAt = (x: number) => 0.3 + (12 - x) * slope;
  prism(C, [[12, 0.3], [5.4, 0.3], [5.4, 0.9]], 6.75, 7.95);
  for (const [za, zb] of [[6.6, 6.75], [7.95, 8.1]])
    prism(CL, [[12, 0.3], [5.4, 0.9], [5.4, 1.3], [12, 0.7]], za, zb);
  for (let x = 6.2; x < 11.8; x += 0.6) rb(CD, x, yAt(x) + 0.005, 7.35, 0.05, 0.03, 1.2, 0, 0, -ang);
  for (const zc of [6.675, 8.025]) {
    rb(STEEL, 8.7, yAt(8.7) + 0.95, zc, 6.63, 0.06, 0.06, 0, 0, -ang);
    rb(P.railing, 8.7, yAt(8.7) + 0.6, zc, 6.63, 0.04, 0.04, 0, 0, -ang);
    for (const x of [5.6, 7.3, 9.0, 10.7, 11.9]) bb(STEEL, x - 0.03, yAt(x) + 0.35, zc - 0.03, x + 0.03, yAt(x) + 0.95, zc + 0.03);
  }

  // ---------- planters ----------
  const planter = (x: number, z: number, h: number, shrub: boolean) => {
    frust(CL, x, z, 0.3, 0.3 + h, 1.9, 0.8, 2.1, 1.0, 0.1, 0.1);
    frust(MOSS, x, z, 0.3 + h, 0.34 + h, 1.85, 0.75, 1.85, 0.75, 0.08, 0.08);
    for (const s of [-1, 1]) bb(CS, x + s * 0.5 - 0.04, 0.35, z + 0.5, x + s * 0.5 + 0.04, 0.3 + h, z + 0.53);
    if (shrub) {
      const g = new THREE.IcosahedronGeometry(0.3, 0);
      g.scale(1 + R() * 0.4, 0.8 + R() * 0.5, 1);
      g.translate(x + (R() - 0.5) * 0.6, 0.3 + h + 0.2, z);
      put(MOSS, g);
    }
  };
  [-24, -21.9, -19.8].forEach((x, i) => planter(x, 7.2, 0.6 + 0.1 * i, i !== 1));
  [17, 19.1, 21.2].forEach((x, i) => planter(x, 7.2, 0.75 - 0.1 * i, i !== 0));

  // ---------- benches ----------
  const bench = (x: number, z: number) => {
    for (const s of [-1, 1]) frust(CL, x + s * 0.9, z, 0.3, 0.78, 0.35, 0.55, 0.25, 0.55, 0.05, 0.05);
    bb(C, x - 1.2, 0.78, z - 0.3, x + 1.2, 0.9, z + 0.3);
    for (let k = 0; k < 3; k++) bb(P.wood, x - 1.15, 0.9, z - 0.27 + k * 0.19, x + 1.15, 0.94, z - 0.27 + k * 0.19 + 0.16);
  };
  [[-12, 0], [12, 0], [-9, 7.0], [21, 0]].forEach(([x, z]) => bench(x, z));

  // ---------- bike racks ----------
  const hoops = (x0: number, n: number, z: number) => {
    for (let i = 0; i < n; i++) {
      const x = x0 + i * 0.8;
      bb(STEEL, x - 0.025, 0.3, z - 0.3, x + 0.025, 1.1, z - 0.25);
      bb(STEEL, x - 0.025, 0.3, z + 0.25, x + 0.025, 1.1, z + 0.3);
      bb(STEEL, x - 0.025, 1.05, z - 0.3, x + 0.025, 1.1, z + 0.3);
    }
    bb(CD, x0 - 0.3, 0.3, z - 0.05, x0 + (n - 1) * 0.8 + 0.3, 0.33, z + 0.05);
  };
  hoops(-24, 8, -7.6);
  hoops(17, 6, -7.6);

  // ---------- lamps (glowing) ----------
  const lamp = (x: number, y: number, z: number) => cyl(P.windowGlow, x, y, z, 0.3, 0.3, 0.06, 6);
  for (const x of [-24, -12, 0, 12, 24]) for (const z of [0, -7]) lamp(x, 5.94, z);
  for (const x of [-24, -12, 12, 24]) lamp(x, 5.94, 7.4);
  for (const x of [-4, 0, 4]) lamp(x, 5.17, 6.8);
  for (const x of [-4, 0, 4]) for (const z of [4.2]) lamp(x, 5.17, z);

  // ---------- commit merged parts ----------
  for (const [col, list] of bins) {
    const merged = mergeGeometries(list, false);
    if (!merged) throw new Error(`base: could not merge ${col}`);
    const part = b.part(merged, col, { at: [0, 0, 0], name: `base_${col.replace("#", "")}` });
    if (col === P.windowGlow) glow(part, 1.4);
  }
}
    return buildBase;
  })(),
  // slabCore
  (() => {
function buildSlabCore({ b, P }: Ctx) {
  const r = rng(1964);
  const buckets = new Map<string, THREE.BufferGeometry[]>();

  // ---------------------------------------------------------------- geometry helpers
  const add = (color: string, geo: THREE.BufferGeometry) => {
    let g = geo;
    if (g.index) g = g.toNonIndexed();
    if (g.getAttribute("uv")) g.deleteAttribute("uv");
    if (!buckets.has(color)) buckets.set(color, []);
    buckets.get(color)!.push(g);
  };

  // Faces: normal, u, v with u x v = n (corners CCW seen from outside).
  const FACES: Record<string, number[][]> = {
    px: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    nx: [[-1, 0, 0], [0, 0, 1], [0, 1, 0]],
    py: [[0, 1, 0], [0, 0, 1], [1, 0, 0]],
    ny: [[0, -1, 0], [1, 0, 0], [0, 0, 1]],
    pz: [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
    nz: [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
  };

  // Flat-shaded box between two corners; `skip` lists faces that are never seen (e.g. "pz ny").
  const bx = (color: string, xa: number, ya: number, za: number, xb: number, yb: number, zb: number, skip = "") => {
    const lo = [Math.min(xa, xb), Math.min(ya, yb), Math.min(za, zb)];
    const hi = [Math.max(xa, xb), Math.max(ya, yb), Math.max(za, zb)];
    const c = [0, 1, 2].map((i) => (lo[i] + hi[i]) / 2);
    const h = [0, 1, 2].map((i) => (hi[i] - lo[i]) / 2);
    if (h[0] < 1e-5 || h[1] < 1e-5 || h[2] < 1e-5) return;
    const toks = skip.split(" ");
    const pos: number[] = [];
    const nor: number[] = [];
    for (const key of Object.keys(FACES)) {
      if (toks.includes(key)) continue;
      const [n, u, v] = FACES[key];
      const corner = (su: number, sv: number) =>
        [0, 1, 2].map((i) => c[i] + n[i] * h[i] + su * u[i] * h[i] + sv * v[i] * h[i]);
      const q = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
      for (const k of [0, 1, 2, 0, 2, 3]) {
        pos.push(...q[k]);
        nor.push(...n);
      }
    }
    if (!pos.length) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
    add(color, g);
  };

  const cyl = (color: string, rad: number, len: number, seg: number, cx: number, cy: number, cz: number, axis: "x" | "y") => {
    const g = new THREE.CylinderGeometry(rad, rad, len, seg, 1);
    if (axis === "x") g.rotateZ(Math.PI / 2);
    g.translate(cx, cy, cz);
    add(color, g);
  };

  // Profile (z, y) extruded along x from x0 to x1.
  const prismX = (color: string, x0: number, x1: number, pts: number[][]) => {
    const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(-z, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false });
    g.rotateY(Math.PI / 2);
    g.translate(x0, 0, 0);
    add(color, g);
  };
  // Profile (x, y) extruded along z from z0 to z1.
  const prismZ = (color: string, z0: number, z1: number, pts: number[][]) => {
    const sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: z1 - z0, bevelEnabled: false });
    g.translate(0, 0, z0);
    add(color, g);
  };

  // ---------------------------------------------------------------- palette + constants
  const CON = P.concrete;
  const LIGHT = P.concreteLight;
  const DARK = P.concreteDark;
  const STAIN = P.concreteStain;
  const WARM = P.concreteWarm;
  const SEAM = P.boardSeam;
  const GLASS = P.glassDark;
  const GLOW = P.windowGlow;
  const STEEL = P.steel;
  const RAIL = P.railing;
  const MOSS = P.moss;
  const DOOR = P.doorOrange;

  const ZB = -8.75; // back wall face
  const GX = 26.5; // gable wall face
  const NOFACE = "pz ny py px nx";

  const bk = (color: string, x0: number, x1: number, y0: number, y1: number, p: number, skip = "pz") =>
    bx(color, x0, y0, ZB - p, x1, y1, ZB, skip);
  const gb = (s: number, color: string, z0: number, z1: number, y0: number, y1: number, p: number, skip = "") =>
    s > 0
      ? bx(color, GX, y0, z0, GX + p, y1, z1, `${skip} nx`)
      : bx(color, -GX - p, y0, z0, -GX, y1, z1, `${skip} px`);

  const baseOf = (n: number) => (n === 0 ? 6.8 : 6 + 3 * n + 0.35);
  const cellX = (i: number) => -24 + 6 * i;

  // ---------------------------------------------------------------- soffit: coffered ribs and ducts
  bx(DARK, -27, 6.3, -9, 27, 6.8, 5);
  for (const zc of [-8.75, -5, -1.5, 2, 4.75]) bx(CON, -27, 6.0, zc - 0.25, 27, 6.3, zc + 0.25, "py");
  for (let i = 0; i <= 18; i++) {
    const xc = -27 + 3 * i;
    bx(CON, Math.max(-27, xc - 0.2), 6.0, -9, Math.min(27, xc + 0.2), 6.3, 5, "py");
  }
  for (const zd of [-3.25, 3.4]) {
    cyl(SEAM, 0.3, 53, 8, 0, 6.3, zd, "x");
    for (let k = 0; k < 9; k++) bx(STEEL, -24 + 6 * k - 0.15, 6.0, zd - 0.38, -24 + 6 * k + 0.15, 6.68, zd + 0.38, "py");
  }

  // ---------------------------------------------------------------- storey blocks, spandrels, roof slab
  for (let n = 0; n < 8; n++) {
    const y0 = baseOf(n);
    const y1 = n === 7 ? 29.6 : 6 + 3 * (n + 1);
    bx(CON, -GX, y0, ZB, GX, y1, 5, "py ny");
  }
  // corner piers at the gable ends
  for (const s of [-1, 1]) {
    bx(LIGHT, s > 0 ? GX : -27, 6.8, -9, s > 0 ? 27 : -GX, 29.6, -8.25, "ny py");
    bx(LIGHT, s > 0 ? GX : -27, 6.8, 4.25, s > 0 ? 27 : -GX, 29.6, 5, "ny py pz");
  }

  // spandrel zones on the gable (windows and the circular motif interrupt some bands)
  const WZ = [-5.5, -1.9, 1.7];
  const zones = (m: number): [number, number][] => {
    let cut: [number, number][] = [];
    if (m >= 2 && m <= 4) cut = WZ.map((z) => [z - 0.95, z + 0.95] as [number, number]);
    if (m === 5 || m === 6) cut = [[-5.4, 1.4]];
    const out: [number, number][] = [];
    let cur = -9;
    for (const [a, c2] of cut) {
      if (a > cur) out.push([cur, a]);
      cur = c2;
    }
    if (cur < 5) out.push([cur, 5]);
    return out;
  };

  for (let m = 1; m <= 7; m++) {
    const y = 6 + 3 * m;
    prismX(LIGHT, -27, 27, [[-8.7, y], [-8.9, y], [-9, y + 0.1], [-9, y + 0.35], [-8.7, y + 0.35]]);
    for (const s of [-1, 1])
      for (const [a, c2] of zones(m))
        prismZ(LIGHT, a, c2, [
          [s * 26.45, y], [s * 26.65, y], [s * 27, y + 0.12], [s * 27, y + 0.35], [s * 26.45, y + 0.35],
        ]);
  }

  // roof slab with thickened edge
  bx(CON, -27, 29.6, -9, 27, 30, 5);
  prismX(LIGHT, -27, 27, [[-8.4, 29.2], [-8.85, 29.2], [-9, 29.35], [-9, 29.6], [-8.4, 29.6]]);
  for (const s of [-1, 1])
    prismZ(LIGHT, -9, 5, [[s * 26.6, 29.2], [s * 26.85, 29.2], [s * 27, 29.35], [s * 27, 29.6], [s * 26.6, 29.6]]);

  // ---------------------------------------------------------------- back face: board-form ribs
  for (let n = 0; n < 8; n++) {
    const y0 = baseOf(n);
    for (let j = 0; j < 4; j++) bk(SEAM, -GX, GX, y0 + 0.35 + 0.6 * j, y0 + 0.41 + 0.6 * j, 0.035, NOFACE);
  }
  // patches of lighter and warmer concrete
  for (let i = 0; i < 16; i++) {
    const w = 1.5 + 3 * r();
    const h = 0.9 + 1.9 * r();
    const x0 = -26.3 + (52.6 - w) * r();
    const y0 = 7 + (22 - h) * r();
    bk(i % 2 ? LIGHT : WARM, x0, x0 + w, y0, y0 + h, 0.02, NOFACE);
  }
  // deep vertical shadow joints every 6 m
  for (let k = 1; k <= 8; k++) bk(DARK, -27 + 6 * k - 0.08, -27 + 6 * k + 0.08, 6.8, 29.6, 0.03, NOFACE);
  // formwork tie holes
  for (let n = 0; n < 8; n++)
    for (let i = 0; i < 44; i++) {
      const x = -25.7 + 1.2 * i;
      bk(STAIN, x - 0.04, x + 0.04, baseOf(n) + 2.4, baseOf(n) + 2.48, 0.03, NOFACE);
    }

  // ---------------------------------------------------------------- back face: slit windows, hoods, vents
  for (let n = 0; n < 8; n++) {
    const base = baseOf(n);
    const floorY = 6 + 3 * n;
    const doorLevel = floorY === 12 || floorY === 18 || floorY === 24;
    for (let i = 0; i < 9; i++) {
      const c = cellX(i);
      for (const sg of [-1, 1]) {
        const x = c + sg * 1.35;
        if (doorLevel && Math.abs(Math.abs(x) - 16) < 2.1) continue;
        const lit = r() < 0.1;
        bk(DARK, x - 0.43, x - 0.27, base + 0.3, base + 1.95, 0.14, "pz ny");
        bk(DARK, x + 0.27, x + 0.43, base + 0.3, base + 1.95, 0.14, "pz ny");
        bk(lit ? GLOW : GLASS, x - 0.27, x + 0.27, base + 0.35, base + 1.95, 0.05, NOFACE.replace("pz", "").trim());
        bk(DARK, x - 0.43, x + 0.43, base + 0.25, base + 0.35, 0.12, "pz ny");
        bk(CON, x - 0.58, x + 0.58, base + 1.95, base + 2.27, 0.25, "pz");
        if (r() < 0.35) bk(STAIN, x + 0.62, x + 0.71, base + 0.5, base + 1.95, 0.03, NOFACE);
      }
      if (r() < 0.28) {
        bk(STEEL, c - 0.28, c + 0.28, base + 1.0, base + 1.45, 0.3, "pz");
        bk(DARK, c - 0.17, c + 0.17, base + 1.1, base + 1.36, 0.31, "pz px nx ny py");
        bk(RAIL, c - 0.33, c + 0.33, base + 1.45, base + 1.52, 0.36, "pz");
      }
    }
  }
  // stair-light slots
  for (const sx of [-21.5, -3.5, 2.5, 20.5])
    for (let n = 0; n < 8; n++) {
      const base = baseOf(n);
      const lit = r() < 0.15;
      bk(DARK, sx - 0.28, sx - 0.16, base + 0.3, base + 2.3, 0.12, "pz ny");
      bk(DARK, sx + 0.16, sx + 0.28, base + 0.3, base + 2.3, 0.12, "pz ny");
      bk(lit ? GLOW : GLASS, sx - 0.16, sx + 0.16, base + 0.4, base + 2.2, 0.04, "pz ny py px nx");
      bk(CON, sx - 0.36, sx + 0.36, base + 2.3, base + 2.52, 0.2, "pz");
    }

  // ---------------------------------------------------------------- bridge landing doors at x = +-16, y = 12, 18, 24
  for (const n of [2, 4, 6])
    for (const s of [-1, 1]) {
      const dx = 16 * s;
      const y0 = 6 + 3 * n + 0.35;
      bk(DARK, dx - 0.95, dx - 0.8, y0, y0 + 2.2, 0.14, "pz ny");
      bk(DARK, dx + 0.8, dx + 0.95, y0, y0 + 2.2, 0.14, "pz ny");
      bk(DARK, dx - 0.95, dx + 0.95, y0 + 2.05, y0 + 2.2, 0.14, "pz");
      bk(DOOR, dx - 0.8, dx - 0.02, y0, y0 + 2.05, 0.07, "pz ny");
      bk(DOOR, dx + 0.02, dx + 0.8, y0, y0 + 2.05, 0.07, "pz ny");
      bk(STEEL, dx - 0.2, dx - 0.12, y0 + 0.95, y0 + 1.3, 0.12, "pz");
      bk(STEEL, dx + 0.12, dx + 0.2, y0 + 0.95, y0 + 1.3, 0.12, "pz");
      bk(CON, dx - 1.6, dx + 1.6, y0 + 2.2, y0 + 2.55, 0.25, "pz");
      bk(LIGHT, dx - 1.6, dx + 1.6, y0 + 2.5, y0 + 2.55, 0.25, "pz ny");
      bk(GLOW, dx - 1.35, dx - 1.1, y0 + 1.5, y0 + 1.85, 0.08, "pz ny py px nx");
      bk(GLOW, dx + 1.1, dx + 1.35, y0 + 1.5, y0 + 1.85, 0.08, "pz ny py px nx");
      bk(STAIN, dx - 1.6, dx - 1.45, y0 + 0.1, y0 + 2.2, 0.03, NOFACE);
      bk(STAIN, dx + 1.45, dx + 1.6, y0 + 0.4, y0 + 2.2, 0.03, NOFACE);
    }

  // ---------------------------------------------------------------- drain pipes
  for (const xk of [-8.7, 9.3]) {
    cyl(RAIL, 0.09, 22.6, 6, xk, 18.1, ZB - 0.14, "y");
    for (let n = 0; n < 8; n++) {
      const y = baseOf(n) + 1.2;
      bx(STEEL, xk - 0.13, y, ZB - 0.22, xk + 0.13, y + 0.12, ZB - 0.04);
    }
  }

  // ---------------------------------------------------------------- rain stains and moss on the back face
  for (let m = 1; m <= 7; m++) {
    const yb = 6 + 3 * m;
    for (let i = 0; i < 9; i++) {
      const x = -26 + 52 * r();
      const len = 0.7 + 1.7 * r();
      const w = 0.1 + 0.2 * r();
      if ((m === 3 || m === 5 || m === 7) && Math.abs(Math.abs(x) - 16) < 1.9) continue;
      bk(STAIN, x - w / 2, x + w / 2, yb - len, yb, 0.03, NOFACE);
    }
    for (let i = 0; i < 3; i++) {
      const x0 = -25 + 50 * r();
      const w = 0.6 + 1.6 * r();
      const yt = yb + 0.35;
      bx(MOSS, x0, yt, -8.99, x0 + w, yt + 0.07, -8.78, "ny");
    }
  }
  for (let i = 0; i < 16; i++) {
    const x = -26 + 52 * r();
    const len = 0.6 + 1.2 * r();
    const w = 0.1 + 0.2 * r();
    bk(STAIN, x - w / 2, x + w / 2, 29.2 - len, 29.2, 0.03, NOFACE);
  }

  // ---------------------------------------------------------------- gables
  for (const s of [-1, 1]) {
    // board-form ribs
    for (let y = 7.15; y < 29.3; y += 0.6) gb(s, SEAM, -8.25, 4.25, y, y + 0.06, 0.035, "pz nz py ny");
    // patches
    for (let i = 0; i < 6; i++) {
      const w = 1.5 + 3 * r();
      const h = 1.0 + 2.5 * r();
      const z0 = -8 + (11.8 - w) * r();
      const y0 = 8 + (20 - h) * r();
      gb(s, i % 2 ? LIGHT : WARM, z0, z0 + w, y0, y0 + h, 0.02, "pz nz py ny");
    }
    // lower stepped relief
    for (let i = 0; i < 4; i++) {
      const w = 12 - 2 * i;
      const y0 = 6.95 + 0.5 * i;
      const p = 0.08 + 0.07 * i;
      gb(s, DARK, -2 - w / 2, -2 + w / 2, y0, y0 + 0.5, p);
      gb(s, MOSS, -2 - w / 2, -2 - w / 2 + 0.9, y0 + 0.5, y0 + 0.56, p, "ny");
    }
    // crown steps
    for (let i = 0; i < 3; i++) {
      const w = 9 - 2 * i;
      const y0 = 27.5 + 0.5 * i;
      const p = 0.1 + 0.08 * i;
      gb(s, DARK, -2 - w / 2, -2 + w / 2, y0, y0 + 0.5, p);
    }
    gb(s, MOSS, 2.0, 2.8, 28.5, 28.56, 0.26, "ny");
    // three tall slit windows with chamfered frames
    for (const zc of WZ) {
      gb(s, GLASS, zc - 0.35, zc + 0.35, 9.6, 19.8, 0.05, "pz nz py ny");
      gb(s, CON, zc - 0.7, zc - 0.35, 9.35, 20.2, 0.22);
      gb(s, CON, zc + 0.35, zc + 0.7, 9.35, 20.2, 0.22);
      gb(s, LIGHT, zc - 0.8, zc + 0.8, 9.35, 9.6, 0.3);
      gb(s, LIGHT, zc - 0.8, zc + 0.8, 19.8, 20.2, 0.3);
      gb(s, DARK, zc - 0.35, zc + 0.35, 9.6, 9.7, 0.1, "pz nz ny");
    }
    // recessed circular motif
    const cy = 23.7;
    const cz = -2;
    const ring = new THREE.Shape();
    ring.absarc(0, 0, 3.3, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 2.9, 0, Math.PI * 2, true);
    ring.holes.push(hole);
    const rg = new THREE.ExtrudeGeometry(ring, { depth: 0.24, bevelEnabled: false, curveSegments: 16 });
    rg.rotateY(s * Math.PI / 2);
    rg.translate(s * (GX - 0.02), cy, cz);
    add(LIGHT, rg);
    const discs: [string, number, number][] = [
      [DARK, 2.9, 0.04],
      [WARM, 2.3, 0.07],
      [DARK, 1.55, 0.12],
      [CON, 1.3, 0.14],
      [DARK, 0.75, 0.18],
      [LIGHT, 0.4, 0.22],
    ];
    for (const [c, rad, d] of discs) cyl(c, rad, d + 0.04, 16, s * (GX + d / 2 - 0.02), cy, cz, "x");
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4 + Math.PI / 8;
      const zz = cz + 1.85 * Math.cos(a);
      const yy = cy + 1.85 * Math.sin(a);
      gb(s, DARK, zz - 0.14, zz + 0.14, yy - 0.14, yy + 0.14, 0.12);
    }
    // stains below ledges
    for (let m = 1; m <= 7; m++) {
      const yb = 6 + 3 * m;
      for (let i = 0; i < 5; i++) {
        const z = -8 + 12 * r();
        const len = 0.7 + 1.6 * r();
        const w = 0.12 + 0.22 * r();
        gb(s, STAIN, z - w / 2, z + w / 2, yb - len, yb, 0.03, "pz nz py ny");
      }
      // moss on the ledge tops
      const zs = zones(m);
      const [a, c2] = zs[Math.floor(r() * zs.length)];
      if (c2 - a > 1.6 && r() < 0.8) {
        const w = 0.8 + 0.9 * r();
        const z0 = a + 0.3 + (c2 - a - w - 0.6) * r();
        if (s > 0) bx(MOSS, 26.55, yb + 0.35, z0, 26.95, yb + 0.42, z0 + w, "ny");
        else bx(MOSS, -26.95, yb + 0.35, z0, -26.55, yb + 0.42, z0 + w, "ny");
      }
    }
    for (let i = 0; i < 6; i++) {
      const z = -8 + 12 * r();
      const len = 0.6 + 1.2 * r();
      gb(s, STAIN, z - 0.08, z + 0.08, 29.2 - len, 29.2, 0.03, "pz nz py ny");
    }
  }

  // ---------------------------------------------------------------- bake: one merged part per colour
  for (const [color, list] of buckets) {
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0] });
    if (color === GLOW) glow(part, 1.4);
  }
}
    return buildSlabCore;
  })(),
  // frontFacade
  (() => {
type Ctx = { b: any; J: Record<string, any>; P: Record<string, string>; M: Record<string, number[]> };

function buildFrontFacade({ b, P }: Ctx) {
  const R = rng(1965);
  const bins = new Map<string, THREE.BufferGeometry[]>();
  let tris = 0;
  const LIMIT = 11300; // optional decoration stops once the triangle total passes this
  const room = () => tris < LIMIT;

  // ---------------------------------------------------------------- geometry collectors
  const put = (col: string, g: THREE.BufferGeometry) => {
    const n = g.index ? g.toNonIndexed() : g;
    if (n !== g) g.dispose();
    tris += n.getAttribute("position").count / 3;
    let a = bins.get(col);
    if (!a) bins.set(col, (a = []));
    a.push(n);
  };

  const PX = 0, NX = 1, PY = 2, NY = 3, PZ = 4, NZ = 5;
  const box = (col: string, cx: number, cy: number, cz: number, w: number, h: number, d: number, skip: number[] = []) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (skip.length) {
      const idx = g.getIndex()!;
      const keep: number[] = [];
      for (let f = 0; f < 6; f++) if (!skip.includes(f)) for (let i = 0; i < 6; i++) keep.push(idx.getX(f * 6 + i));
      g.setIndex(keep);
    }
    g.translate(cx, cy, cz);
    put(col, g);
  };
  // flat plane facing +Z
  const planeZ = (col: string, cx: number, cy: number, cz: number, w: number, h: number) =>
    put(col, new THREE.PlaneGeometry(w, h).translate(cx, cy, cz));
  // flat plane facing +X (dir 1) or -X (dir -1); w runs along z
  const planeX = (col: string, cx: number, cy: number, cz: number, w: number, h: number, dir: number) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY((dir * Math.PI) / 2);
    g.translate(cx, cy, cz);
    put(col, g);
  };
  // flat plane facing up; w along x, d along z
  const planeUp = (col: string, cx: number, cy: number, cz: number, w: number, d: number) => {
    const g = new THREE.PlaneGeometry(w, d);
    g.rotateX(-Math.PI / 2);
    g.translate(cx, cy, cz);
    put(col, g);
  };

  // chamfered balcony slab: profile in (z, y), run along x
  const slab = (y0: number, t: number, x0: number, x1: number) => {
    const c = t > 0.5 ? 0.22 : 0.14;
    const s = new THREE.Shape();
    s.moveTo(5, 0);
    s.lineTo(8.7, 0);
    s.lineTo(9, c);
    s.lineTo(9, t - 0.05);
    s.lineTo(8.95, t);
    s.lineTo(5, t);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: x1 - x0, bevelEnabled: false });
    g.rotateY(-Math.PI / 2);
    g.translate(x1, y0, 0);
    put(P.concrete, g);
  };
  // chamfered party wall: footprint in (x, -z), run along y
  const wall = (cx: number, hw: number) => {
    const c = 0.12;
    const s = new THREE.Shape();
    s.moveTo(-hw, -5);
    s.lineTo(hw, -5);
    s.lineTo(hw, -(9 - c));
    s.lineTo(hw - c, -9);
    s.lineTo(-hw + c, -9);
    s.lineTo(-hw, -(9 - c));
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 24, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.translate(cx, 6, 0);
    put(P.concrete, g);
  };

  // ---------------------------------------------------------------- structure
  // cell back wall (z 5..5.6), full width
  box(P.concrete, 0, 18, 5.3, 54, 24, 0.6, [NZ]);

  // floor / balcony slabs, hood slab on top
  for (let k = 0; k < 8; k++) slab(6 + 3 * k, 0.4, -27, 27);
  slab(29.4, 0.6, -27, 27);

  // party walls
  for (let k = 0; k <= 9; k++) {
    const end = k === 0 || k === 9;
    const hw = end ? 0.45 : 0.25;
    const cx = k === 0 ? -27 + 0.45 : k === 9 ? 27 - 0.45 : -27 + 6 * k;
    wall(cx, hw);
  }

  // ---------------------------------------------------------------- cell plan
  const glowSet = new Set<string>();
  for (let tries = 0; glowSet.size < 12 && tries < 600; tries++) {
    const n = Math.floor(R() * 9);
    const r = Math.floor(R() * 8);
    let ok = true;
    for (const s of glowSet) {
      const [a, c] = s.split(",").map(Number);
      if (Math.abs(a - n) <= 1 && Math.abs(c - r) <= 1) {
        ok = false;
        break;
      }
    }
    if (ok) glowSet.add(n + "," + r);
  }
  const panelCols = [P.panelRed, P.panelYellow, P.panelBlue, P.panelGreen];
  const covered = new Set<string>(); // wall faces taken by a side panel: `${k}|${r}|${face}`

  type CellInfo = {
    panel: number; // 0 none, 1 spandrel panel, 2 side-wall panel
    pcol: string;
    pside: number;
    fins: boolean;
    finSide: number;
    finCount: number;
    glowOn: boolean;
    door: boolean;
    doorCol: string;
    ds: number;
    detail: number;
    darkGlass: boolean;
    spCol: string;
  };
  const cells: CellInfo[][] = [];
  for (let n = 0; n < 9; n++) {
    cells[n] = [];
    for (let r = 0; r < 8; r++) {
      const glowOn = glowSet.has(n + "," + r);
      let panel = 0;
      let pside = 1;
      let pcol = panelCols[0];
      if (!glowOn && R() < 0.42) {
        panel = R() < 0.55 ? 2 : 1;
        pside = R() < 0.5 ? 1 : -1;
        pcol = panelCols[((n + 2 * r) % 4 + (R() < 0.3 ? 1 : 0)) % 4];
      }
      if (panel === 2) covered.add(`${pside > 0 ? n + 1 : n}|${r}|${pside > 0 ? -1 : 1}`);
      const fins = !glowOn && R() < 0.26;
      const finSide = panel === 2 ? -pside : R() < 0.5 ? 1 : -1;
      const door = R() < 0.55;
      const doorCol = R() < 0.4 ? P.doorOrange : P.wood;
      const ds = R() < 0.5 ? 1 : -1;
      const dr = R();
      const detail = glowOn || fins ? 0 : dr < 0.14 ? 1 : dr < 0.27 ? 2 : dr < 0.4 ? 3 : 0;
      const q = R();
      cells[n][r] = {
        panel,
        pcol,
        pside,
        fins,
        finSide,
        finCount: 3 + Math.floor(R() * 3),
        glowOn,
        door,
        doorCol,
        ds,
        detail,
        darkGlass: R() < 0.4,
        spCol: q < 0.25 ? P.concreteLight : q < 0.45 ? P.concreteWarm : P.concrete,
      };
    }
  }

  // ---------------------------------------------------------------- cells
  for (let n = 0; n < 9; n++) {
    const lx = -27 + 6 * n + (n === 0 ? 0.9 : 0.25);
    const rx = -27 + 6 * (n + 1) - (n === 8 ? 0.9 : 0.25);
    const cw = rx - lx;
    const cxc = (lx + rx) / 2;
    for (let r = 0; r < 8; r++) {
      const c = cells[n][r];
      const y0 = 6 + 3 * r + 0.4;
      const y1 = r === 7 ? 29.4 : 6 + 3 * (r + 1);
      const ch = y1 - y0;
      const tall = ch > 2.4;
      const sp = tall ? 0.9 : 0.7;
      const topM = tall ? 0.35 : 0.25;
      const gw = Math.min(4.6, cw - 0.5);
      const gb = y0 + sp;
      const gt = y1 - topM;
      const gh = gt - gb;
      const gcy = (gb + gt) / 2;
      const dcx = cxc + c.ds * (gw / 2 - 0.55);

      // dark reveal behind the glazing
      box(P.concreteDark, cxc, gcy, 5.66, gw + 0.2, gh + 0.2, 0.12, [NZ]);
      // glass pane
      planeZ(c.darkGlass ? P.glassDark : P.glass, cxc, gcy, 5.725, gw, gh);
      // lit pane
      if (c.glowOn) planeZ(P.windowGlow, cxc - c.ds * (gw / 4), gcy, 5.735, gw / 2 - 0.1, gh - 0.15);

      // steel mullion frame: two jambs, a centre mullion, a transom
      for (const sx of [-1, 1]) box(P.steel, cxc + sx * (gw / 2), gcy, 5.76, 0.08, gh + 0.1, 0.08, [NZ]);
      const midX = c.door ? dcx - c.ds * 0.55 : cxc;
      box(P.steel, midX, gcy, 5.76, 0.06, gh, 0.08, [NZ]);
      box(P.steel, cxc, gb + gh * 0.62, 5.76, gw, 0.06, 0.08, [NZ]);

      // inner door
      let sx0 = lx;
      let sx1 = rx;
      if (c.door) {
        const dh = Math.min(2.1, gt - y0);
        box(c.doorCol, dcx, y0 + dh / 2, 5.69, 1.0, dh, 0.18, [NZ]);
        if (c.ds > 0) sx1 = dcx - 0.5;
        else sx0 = dcx + 0.5;
      }

      // solid spandrel strip (with optional coloured panel)
      const spw = sx1 - sx0;
      const spx = (sx0 + sx1) / 2;
      if (spw > 0.3) {
        box(c.spCol, spx, y0 + sp / 2, 5.65, spw, sp, 0.1, [NZ]);
        if (c.panel === 1 && spw > 1.2) {
          box(P.concreteDark, spx, y0 + sp / 2, 5.71, spw - 0.12, sp - 0.1, 0.02, [NZ]);
          box(c.pcol, spx, y0 + sp / 2, 5.715, spw - 0.24, sp - 0.22, 0.03, [NZ]);
        }
      }

      // side-wall panel
      if (c.panel === 2 || (c.panel === 1 && spw <= 1.2)) {
        const sd = c.panel === 2 ? c.pside : c.ds === 1 ? -1 : 1;
        if (c.panel === 1) covered.add(`${sd > 0 ? n + 1 : n}|${r}|${sd > 0 ? -1 : 1}`);
        const wx = sd > 0 ? rx : lx;
        const skipF = sd > 0 ? [PX] : [NX];
        box(P.concreteDark, wx - sd * 0.01, (y0 + y1) / 2, 7.275, 0.02, ch - 0.14, 3.25, skipF);
        box(c.pcol, wx - sd * 0.0175, (y0 + y1) / 2, 7.275, 0.035, ch - 0.34, 3.05, skipF);
      }

      // brise-soleil fins
      if (c.fins) {
        for (let i = 0; i < c.finCount; i++) {
          const x = c.finSide > 0 ? rx - 0.2 - 0.38 * i : lx + 0.2 + 0.38 * i;
          box(P.concreteLight, x, (y0 + y1) / 2, 7.3, 0.07, ch, 2.6, [PY, NY]);
        }
      }

      // small details on the side away from the door
      const dsx = cxc - c.ds * (cw / 2 - 0.95);
      if (c.detail === 1) {
        box(P.wood, dsx, y0 + 0.175, 7.6, 0.5, 0.35, 0.5);
        box(P.moss, dsx, y0 + 0.5, 7.6, 0.46, 0.3, 0.46);
        box(P.moss, dsx + 0.12, y0 + 0.72, 7.58, 0.26, 0.2, 0.26);
      } else if (c.detail === 2) {
        box(P.steel, dsx, y1 - 0.55, 7.4, 2.2, 0.03, 0.03);
        for (const sx of [-1, 1]) box(P.steel, dsx + sx * 1.0, y1 - 0.275, 7.4, 0.02, 0.55, 0.02, [PY, NY]);
        planeZ(P.white, dsx - 0.5, y1 - 0.95, 7.4, 0.55, 0.75);
        planeZ(P.panelRed, dsx + 0.4, y1 - 0.9, 7.4, 0.45, 0.65);
      } else if (c.detail === 3) {
        box(P.tankGrey, dsx, y0 + 0.25, 5.9, 0.85, 0.5, 0.4, [NZ, NY]);
        planeZ(P.glassDark, dsx, y0 + 0.27, 6.102, 0.6, 0.3);
      }

      // railing: posts (top bar and mid bar run continuously below)
      const half = Math.min(1.8, cw / 2 - 0.4);
      for (const sx of [-1, 0, 1]) box(P.railing, cxc + sx * half, y0 + 0.485, 8.8, 0.04, 0.97, 0.04, [PY, NY]);
    }
  }

  // continuous railing bars
  for (let r = 0; r < 8; r++) {
    const y0 = 6 + 3 * r + 0.4;
    box(P.railing, 0, y0 + 0.97, 8.8, 52.2, 0.06, 0.08);
    box(P.railing, 0, y0 + 0.5, 8.8, 52.2, 0.03, 0.03);
  }

  // ---------------------------------------------------------------- board-form ribs and wear (optional layers)
  // ribs on party walls
  for (let k = 0; k <= 9; k++) {
    const end = k === 0 || k === 9;
    const hw = end ? 0.45 : 0.25;
    const cx = k === 0 ? -27 + 0.45 : k === 9 ? 27 - 0.45 : -27 + 6 * k;
    for (const face of [-1, 1]) {
      if ((k === 0 && face === -1) || (k === 9 && face === 1)) continue;
      for (let r = 0; r < 8; r++) {
        if (covered.has(`${k}|${r}|${face}`)) continue;
        if (!room()) break;
        const y0 = 6 + 3 * r + 0.4;
        const ch = (r === 7 ? 29.4 : 6 + 3 * (r + 1)) - y0;
        for (let i = 0; i < 3; i++)
          planeX(P.boardSeam, cx + face * (hw + 0.004), y0 + ch * (0.2 + 0.3 * i), 7.275, 3.15, 0.05, face);
      }
    }
  }

  // ribs along slab fronts
  for (let k = 0; k <= 8; k++) {
    const y0 = k === 8 ? 29.4 : 6 + 3 * k;
    if (k === 8) {
      planeZ(P.boardSeam, 0, y0 + 0.2, 9.004, 54, 0.035);
      planeZ(P.boardSeam, 0, y0 + 0.4, 9.004, 54, 0.035);
    } else {
      planeZ(P.boardSeam, 0, y0 + 0.27, 9.004, 54, 0.035);
    }
  }

  // lighter and warmer cast patches on slab fronts
  for (let i = 0; i < 24 && room(); i++) {
    const k = Math.floor(R() * 9);
    const y0 = k === 8 ? 29.4 : 6 + 3 * k;
    const w = 1.2 + R() * 2.2;
    const x = -25 + R() * 50;
    planeZ(R() < 0.5 ? P.concreteLight : P.concreteWarm, x, y0 + (k === 8 ? 0.3 : 0.27), 9.007, w, k === 8 ? 0.3 : 0.2);
  }
  // patches on party-wall sides
  for (let i = 0; i < 16 && room(); i++) {
    const k = 1 + Math.floor(R() * 8);
    const face = R() < 0.5 ? -1 : 1;
    const r = Math.floor(R() * 8);
    if (covered.has(`${k}|${r}|${face}`)) continue;
    const y0 = 6 + 3 * r + 0.4;
    planeX(R() < 0.5 ? P.concreteWarm : P.concreteLight, -27 + 6 * k + face * 0.256, y0 + 0.3 + R() * 1.2, 6.9, 0.9 + R() * 1.1, 0.7 + R() * 0.7, face);
  }

  // rain-stain streaks under every slab on the party-wall fronts
  for (let k = 0; k <= 9 && room(); k++) {
    const end = k === 0 || k === 9;
    const hw = end ? 0.45 : 0.25;
    const cx = k === 0 ? -27 + 0.45 : k === 9 ? 27 - 0.45 : -27 + 6 * k;
    for (let s = 1; s <= 8; s++) {
      if (R() > 0.65) continue;
      const yb = s === 8 ? 29.4 : 6 + 3 * s;
      const len = 0.7 + R() * 0.9;
      planeZ(P.concreteStain, cx + (R() - 0.5) * (2 * hw - 0.4), yb - len / 2, 9.005, 0.07, len);
    }
  }
  // streaks on the glazed wall hanging from every ceiling
  for (let n = 0; n < 9 && room(); n++) {
    const lx = -27 + 6 * n + (n === 0 ? 0.9 : 0.25);
    const rx = -27 + 6 * (n + 1) - (n === 8 ? 0.9 : 0.25);
    for (let r = 0; r < 8; r++) {
      if (R() > 0.55) continue;
      const y1 = r === 7 ? 29.4 : 6 + 3 * (r + 1);
      const len = 0.35 + R() * 0.5;
      planeZ(P.concreteStain, lx + 0.3 + R() * (rx - lx - 0.6), y1 - len / 2, 5.745, 0.07, len);
    }
  }
  // streaks hanging off the balcony slab faces
  for (let k = 0; k < 8 && room(); k++) {
    for (let i = 0; i < 5; i++) {
      if (R() > 0.5) continue;
      planeZ(P.concreteStain, -25 + R() * 50, 6 + 3 * k + 0.2, 9.008, 0.08, 0.4);
    }
  }
  // moss on upward ledges
  for (let k = 0; k < 8 && room(); k++) {
    for (let i = 0; i < 4; i++) {
      if (R() > 0.4) continue;
      planeUp(P.moss, -25 + R() * 50, 6 + 3 * k + 0.404, 8.55 + R() * 0.35, 0.6 + R() * 1.2, 0.25 + R() * 0.35);
    }
  }

  // ---------------------------------------------------------------- merge per colour and place
  let i = 0;
  for (const [col, arr] of bins) {
    const merged = mergeGeometries(arr, false);
    if (!merged) continue;
    const part = b.part(merged, col, { at: [0, 0, 0], name: `frontFacade.${i++}` });
    if (col === P.windowGlow) glow(part, 1.3);
  }
}
    return buildFrontFacade;
  })(),
  // roofTop
  (() => {
function buildRoofTop({ b, J, P, M }: Ctx) {
  void J;
  const r = rng(4021);
  const rr = (a: number, c: number) => a + (c - a) * r();

  const {
    concrete, concreteLight, concreteDark, concreteStain, concreteWarm, boardSeam,
    panelRed, panelYellow, panelBlue, panelGreen, glass, glassDark, windowGlow,
    steel, railing, roofTar, moss: mossCol, paving, wood, doorOrange, tankGrey, white,
  } = P;
  const names: Record<string, string> = {};
  for (const k of Object.keys(P)) names[P[k]] = k;

  // ---------------------------------------------------------------- collectors
  type Bk = { group: string; color: string; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bk>();
  let G = "deck";
  const add = (col: string, g: THREE.BufferGeometry) => {
    const key = G + "|" + col;
    let bk = buckets.get(key);
    if (!bk) {
      bk = { group: G, color: col, geos: [] };
      buckets.set(key, bk);
    }
    bk.geos.push(g);
  };
  const box = (col: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    const g = new THREE.BoxGeometry(Math.max(Math.abs(x1 - x0), 0.002), Math.max(Math.abs(y1 - y0), 0.002), Math.max(Math.abs(z1 - z0), 0.002));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    add(col, g);
  };
  const rbox = (col: string, cx: number, cy: number, cz: number, w: number, h: number, d: number, rx = 0, ry = 0, rz = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    g.rotateX(rx);
    g.rotateY(ry);
    g.rotateZ(rz);
    g.translate(cx, cy, cz);
    add(col, g);
  };
  // square / octagonal frustum, flat faces on the axes
  const frus = (col: string, cx: number, y0: number, cz: number, wb: number, wt: number, h: number, n = 4, zr = 1) => {
    const k = Math.cos(Math.PI / n);
    const g = new THREE.CylinderGeometry(wt / 2 / k, wb / 2 / k, h, n, 1);
    g.rotateY(Math.PI / n);
    if (zr !== 1) g.scale(1, 1, zr);
    g.translate(cx, y0 + h / 2, cz);
    add(col, g);
  };
  const cyl = (col: string, cx: number, y0: number, cz: number, rad: number, h: number, seg = 12) => {
    const g = new THREE.CylinderGeometry(rad, rad, h, seg, 1);
    g.translate(cx, y0 + h / 2, cz);
    add(col, g);
  };
  const cylx = (col: string, x0: number, x1: number, cy: number, cz: number, rad: number, seg = 10) => {
    const g = new THREE.CylinderGeometry(rad, rad, Math.abs(x1 - x0), seg, 1);
    g.rotateZ(Math.PI / 2);
    g.translate((x0 + x1) / 2, cy, cz);
    add(col, g);
  };
  const cylz = (col: string, z0: number, z1: number, cx: number, cy: number, rad: number, seg = 8) => {
    const g = new THREE.CylinderGeometry(rad, rad, Math.abs(z1 - z0), seg, 1);
    g.rotateX(Math.PI / 2);
    g.translate(cx, cy, (z0 + z1) / 2);
    add(col, g);
  };
  // box on a vertical face: d0..d1 measured outward from the face plane p
  const fb = (col: string, face: string, p: number, u: number, y0: number, y1: number, w: number, d0: number, d1: number) => {
    const hw = w / 2;
    if (face === "z+") box(col, u - hw, y0, p + d0, u + hw, y1, p + d1);
    else if (face === "z-") box(col, u - hw, y0, p - d1, u + hw, y1, p - d0);
    else if (face === "x+") box(col, p + d0, y0, u - hw, p + d1, y1, u + hw);
    else box(col, p - d1, y0, u - hw, p - d0, y1, u + hw);
  };
  const ribs = (face: string, p: number, uc: number, w: number, y0: number, y1: number, step = 0.6) => {
    for (let y = y0; y < y1; y += step) fb(boardSeam, face, p, uc, y, y + 0.05, w, -0.01, 0.02);
  };
  const streak = (face: string, p: number, u: number, yTop: number, h: number, w = 0.09) => {
    fb(concreteStain, face, p, u, yTop - h, yTop, w, -0.01, 0.03);
    fb(concreteStain, face, p, u + w * 0.2, yTop - h * 1.35, yTop - h * 0.6, w * 0.45, -0.01, 0.025);
  };
  const mossPatch = (cx: number, y: number, cz: number, w: number, d: number) => {
    box(mossCol, cx - w / 2, y, cz - d / 2, cx + w / 2, y + 0.035, cz + d / 2);
    box(mossCol, cx + w * 0.15, y, cz + d * 0.2, cx + w * 0.6, y + 0.05, cz + d * 0.7);
  };

  const RT = 30.12; // roof tar top

  // ================================================================ parapet
  G = "parapet";
  const gapW = 0.9;
  const run = (alongX: boolean, s: number, lo: number, hi: number, gp: number[]) => {
    const outer = alongX ? s * 9 : s * 27;
    const inner = outer - s * 0.5;
    const capIn = outer - s * 0.7;
    const ab = (col: string, a0: number, a1: number, p0: number, p1: number, y0: number, y1: number) =>
      alongX
        ? box(col, a0, y0, Math.min(p0, p1), a1, y1, Math.max(p0, p1))
        : box(col, Math.min(p0, p1), y0, a0, Math.max(p0, p1), y1, a1);
    const segs: [number, number][] = [];
    let a = lo;
    for (const g of gp) {
      segs.push([a, g - gapW / 2]);
      a = g + gapW / 2;
    }
    segs.push([a, hi]);
    for (const [a0, a1] of segs) {
      ab(concrete, a0, a1, inner, outer, 30, 31.0);
      for (const y of [30.38, 30.76]) {
        ab(boardSeam, a0, a1, inner, inner - s * 0.025, y, y + 0.06);
        ab(boardSeam, a0, a1, outer - s * 0.01, outer + s * 0.02, y, y + 0.06);
      }
    }
    for (const g of gp) {
      ab(concrete, g - 0.45, g + 0.45, inner, outer, 30.5, 31.0);
      ab(concreteDark, g - 0.45, g + 0.45, inner, outer, 30.0, 30.5);
      ab(concreteLight, g - 0.45, g + 0.45, inner - s * 0.05, inner, 30.0, 30.12);
    }
    // stepped chamfered cap
    ab(concreteLight, lo, hi, outer, capIn, 31.0, 31.1);
    ab(concreteLight, lo, hi, outer, outer - s * 0.6, 31.1, 31.16);
    ab(concreteLight, lo, hi, outer, outer - s * 0.5, 31.16, 31.2);
    // stain streaks on the outer face under the cap
    const face = alongX ? (s > 0 ? "z+" : "z-") : s > 0 ? "x+" : "x-";
    const plane = alongX ? s * 9 : s * 27;
    const n = alongX ? 11 : 4;
    for (let i = 0; i < n; i++) {
      let u = rr(lo + 0.6, hi - 0.6);
      if (gp.some((g) => Math.abs(u - g) < 0.8)) u += 1.3;
      streak(face, plane, u, 31.0, rr(0.25, 0.65));
    }
  };
  const gp5 = [-21, -7, 7, 21];
  run(true, 1, -27, 27, gp5);
  run(true, -1, -27, 27, gp5);
  run(false, 1, -8.5, 8.5, [-4, 4]);
  run(false, -1, -8.5, 8.5, [-4, 4]);

  // moss on the upward cap
  for (let i = 0; i < 14; i++) {
    const side = Math.floor(r() * 4);
    if (side < 2) mossPatch(rr(-25, 25), 31.2, (side ? -1 : 1) * rr(8.4, 8.8), rr(0.5, 1.4), 0.18);
    else mossPatch((side === 2 ? 1 : -1) * rr(26.4, 26.8), 31.2, rr(-7, 7), 0.18, rr(0.5, 1.4));
  }

  // railing on the inner side of the cap
  for (let i = 0; i <= 18; i++) {
    const x = -26.4 + i * (52.8 / 18);
    for (const z of [8.4, -8.4]) box(railing, x - 0.04, 31.2, z - 0.04, x + 0.04, 32.15, z + 0.04);
  }
  for (let i = 1; i <= 4; i++) {
    const z = -8.4 + i * 3.36;
    for (const x of [26.4, -26.4]) box(railing, x - 0.04, 31.2, z - 0.04, x + 0.04, 32.15, z + 0.04);
  }
  for (const z of [8.4, -8.4]) {
    box(railing, -26.44, 32.07, z - 0.03, 26.44, 32.15, z + 0.03);
    box(railing, -26.44, 31.62, z - 0.02, 26.44, 31.67, z + 0.02);
  }
  for (const x of [26.4, -26.4]) {
    box(railing, x - 0.03, 32.07, -8.4, x + 0.03, 32.15, 8.4);
    box(railing, x - 0.02, 31.62, -8.4, x + 0.02, 31.67, 8.4);
  }

  // ================================================================ roof surface
  G = "roof";
  box(roofTar, -26.5, 30.0, -8.5, 26.5, RT, 8.5);
  // gravel borders + kerbs
  box(concreteLight, -26.5, RT, 7.6, 26.5, 30.17, 8.5);
  box(concreteLight, -26.5, RT, -8.5, 26.5, 30.17, -7.6);
  box(concreteLight, 25.6, RT, -7.6, 26.5, 30.17, 7.6);
  box(concreteLight, -26.5, RT, -7.6, -25.6, 30.17, 7.6);
  box(concreteDark, -25.6, RT, 7.4, 25.6, 30.22, 7.6);
  box(concreteDark, -25.6, RT, -7.6, 25.6, 30.22, -7.4);
  box(concreteDark, 25.4, RT, -7.6, 25.6, 30.22, 7.6);
  box(concreteDark, -25.6, RT, -7.6, -25.4, 30.22, 7.6);
  const speck = [concreteStain, concreteWarm, boardSeam];
  for (let i = 0; i < 50; i++) {
    const side = Math.floor(r() * 4);
    const s = rr(0.12, 0.28);
    let x: number, z: number;
    if (side < 2) {
      x = rr(-26.2, 26.2);
      z = (side ? -1 : 1) * rr(7.75, 8.35);
    } else {
      x = (side === 2 ? 1 : -1) * rr(25.75, 26.35);
      z = rr(-7.3, 7.3);
    }
    box(speck[i % 3], x - s / 2, 30.17, z - s / 2, x + s / 2, 30.21, z + s / 2);
  }
  for (const x of [-22, 22]) box(boardSeam, x - 0.03, RT, -7.3, x + 0.03, 30.145, 7.3);
  // drains
  for (const [x, z] of [[5.2, 4.6], [-5.2, 4.6], [23.8, -5.5], [-23.8, -5.5]]) {
    cyl(steel, x, RT, z, 0.3, 0.05, 10);
    cyl(railing, x, 30.17, z, 0.2, 0.03, 8);
  }
  for (const [x, z] of [[-10, -7.0], [8, 7.0], [24.5, 5.5], [-20, 6.5]]) mossPatch(x, RT, z, rr(0.8, 1.6), rr(0.5, 0.9));

  // paving walkways
  G = "paving";
  const tiles = (x0: number, x1: number, z0: number, z1: number, len: number, alongX: boolean) => {
    const total = alongX ? x1 - x0 : z1 - z0;
    const n = Math.max(1, Math.round(total / len));
    const step = total / n;
    for (let i = 0; i < n; i++) {
      const a0 = i * step + 0.03;
      const a1 = (i + 1) * step - 0.03;
      if (alongX) box(paving, x0 + a0, RT, z0, x0 + a1, 30.19, z1);
      else box(paving, x0, RT, z0 + a0, x1, 30.19, z0 + a1);
    }
  };
  tiles(-25, 25, 6.0, 7.4, 2.5, true);
  tiles(-1.4, 1.4, 2.8, 6.0, 1.6, false);
  tiles(-3.6, 3.6, 2.8, 3.4, 3.6, true);
  tiles(12.0, 13.8, -7.2, 6.0, 2.2, false);
  tiles(-13.8, -12.0, -7.2, 6.0, 2.2, false);
  tiles(20.6, 22.2, -7.4, -6.0, 1.6, true);

  // ================================================================ pavilion
  G = "pavilion";
  const ZB = -4, ZF = 2, WT = 34.2, PL = 30.75, VC = M.roofPavilionCentre[2];
  box(concreteDark, -9.15, RT, ZB - 0.15, 9.15, PL - 0.07, ZF + 0.15);
  box(concreteLight, -9.15, PL - 0.07, ZB - 0.15, 9.15, PL, ZF + 0.15);
  box(concrete, -9, PL, ZB, 9, WT, ZB + 0.5);
  box(concrete, 8.5, PL, ZB + 0.5, 9, WT, 1.5);
  box(concrete, -9, PL, ZB + 0.5, -8.5, WT, 1.5);
  for (const cx of [-8.75, -6, -3, 3, 6, 8.75]) {
    const w = Math.abs(cx) > 8 ? 0.5 : 0.5;
    box(concrete, cx - w / 2, PL, 1.4, cx + w / 2, 33.8, 2.04);
  }
  for (const [x0, x1] of [[-8.5, -6.25], [-5.75, -3.25], [3.25, 5.75], [6.25, 8.5]]) box(concrete, x0, PL, 1.55, x1, 31.2, 1.95);
  box(concrete, -9, 33.8, 1.3, 9, WT, 2.1);
  box(concreteLight, -9.05, WT - 0.06, 1.25, 9.05, WT, 2.15);

  const glaze = (x0: number, x1: number, y0: number, y1: number, cells: number, lit = -1) => {
    box(glassDark, x0, y0, 1.72, x1, y1, 1.78);
    const cw = (x1 - x0) / cells;
    for (let i = 0; i <= cells; i++) box(steel, x0 + i * cw - 0.03, y0, 1.66, x0 + i * cw + 0.03, y1, 1.84);
    box(steel, x0, y0, 1.66, x1, y0 + 0.05, 1.84);
    box(steel, x0, y1 - 0.05, 1.66, x1, y1, 1.84);
    if (lit >= 0) box(windowGlow, x0 + lit * cw + 0.05, y0 + 0.07, 1.78, x0 + (lit + 1) * cw - 0.05, y1 - 0.1, 1.81);
  };
  glaze(-8.5, -6.25, 31.2, 32.5, 2);
  glaze(-8.5, -6.25, 32.5, 33.8, 2, 1);
  glaze(-5.75, -3.25, 31.2, 32.5, 2);
  glaze(-5.75, -3.25, 32.5, 33.8, 2, 0);
  glaze(3.25, 5.75, 31.2, 32.5, 2);
  glaze(3.25, 5.75, 32.5, 33.8, 2, 1);
  glaze(6.25, 8.5, 31.2, 32.5, 2);
  glaze(6.25, 8.5, 32.5, 33.8, 2, 0);
  glaze(-2.75, -1.33, 30.8, 33.0, 1);
  glaze(1.33, 2.75, 30.8, 33.0, 1);
  glaze(-2.75, 2.75, 33.0, 33.8, 5);
  // door pair
  box(doorOrange, -1.3, PL, 1.68, -0.03, 33.0, 1.78);
  box(doorOrange, 0.03, PL, 1.68, 1.3, 33.0, 1.78);
  box(steel, -1.36, PL, 1.64, -1.3, 33.06, 1.84);
  box(steel, 1.3, PL, 1.64, 1.36, 33.06, 1.84);
  box(steel, -1.36, 33.0, 1.64, 1.36, 33.06, 1.84);
  for (const sx of [-1, 1]) {
    box(glassDark, sx * 0.67 - 0.28, 31.9, 1.78, sx * 0.67 + 0.28, 32.9, 1.8);
    box(steel, sx * 0.2 - 0.025, 31.7, 1.78, sx * 0.2 + 0.025, 32.1, 1.86);
    box(doorOrange, sx * 0.67 - 0.5, 30.85, 1.78, sx * 0.67 + 0.5, 31.4, 1.8);
  }
  // steps
  box(concreteLight, -2.2, RT, 2.15, 2.2, 30.6, 2.4);
  box(concreteLight, -2.2, RT, 2.4, 2.2, 30.35, 2.8);
  // canopy
  box(concrete, -3.6, 33.72, 2.1, 3.6, 34.0, 3.4);
  box(concreteLight, -3.3, 33.55, 2.1, 3.3, 33.72, 3.1);
  box(concreteLight, -3.7, 34.0, 2.1, 3.7, 34.06, 3.5);
  for (const x of [-2.4, 0, 2.4]) cyl(windowGlow, x, 33.5, 2.8, 0.17, 0.05, 8);
  for (const x of [-3.0, 3.0]) streak("z+", 3.4, x, 33.72, 0.5, 0.1);
  // colour blocks on the header
  const cols = [panelRed, panelYellow, panelBlue, panelGreen];
  for (const sx of [-1, 1])
    for (let j = 0; j < 4; j++) box(cols[(j + (sx > 0 ? 2 : 0)) % 4], sx * (4.2 + 1.2 * j) - 0.35, 33.86, 2.1, sx * (4.2 + 1.2 * j) + 0.35, 34.14, 2.15);
  // back wall: ribs, patches, slits
  ribs("z-", ZB, 0, 18, 31.0, 34.1);
  fb(concreteLight, "z-", ZB, -5, 31.2, 32.5, 3.2, -0.01, 0.012);
  fb(concreteWarm, "z-", ZB, 4.5, 32.2, 33.8, 4.5, -0.01, 0.012);
  fb(concreteWarm, "z-", ZB, -7.5, 33.0, 34.0, 2.2, -0.01, 0.012);
  for (const x of [-6, 0, 6]) {
    fb(concreteDark, "z-", ZB, x, 31.5, 33.4, 0.6, 0, 0.05);
    fb(glassDark, "z-", ZB, x, 31.6, 33.3, 0.32, 0.04, 0.07);
    fb(concreteLight, "z-", ZB, x, 33.4, 33.55, 1.1, 0, 0.35);
  }
  for (let i = 0; i < 12; i++) streak("z-", ZB, rr(-8.6, 8.6), WT, rr(0.7, 1.9));
  for (const [face, p] of [["x+", 9], ["x-", -9]] as [string, number][]) {
    ribs(face, p, VC, 6, 31.0, 34.1);
    for (let i = 0; i < 3; i++) streak(face, p, VC + rr(-2.5, 2.5), WT, rr(0.7, 1.6));
  }
  // vault
  const vault = (col: string, cx: number, len: number, rad: number, rise: number) => {
    const g = new THREE.CylinderGeometry(rad, rad, len, 12, 1, true, 0, Math.PI);
    g.rotateZ(Math.PI / 2);
    g.scale(1, rise / rad, 1);
    g.translate(cx, WT, VC);
    add(col, g);
  };
  const riseOf = (i: number) => 2.3 * (1 - 0.1 * Math.pow(Math.abs(i - 4) / 4, 2));
  for (let i = 0; i < 9; i++) vault(i % 2 ? concreteLight : concrete, -8.2 + 2.05 * i, 2.5, 3.1 + 0.04 * (i % 2), riseOf(i));
  for (let i = 0; i < 8; i++) vault(boardSeam, -8.2 + 2.05 * i + 1.025, 0.08, 3.14, (riseOf(i) + riseOf(i + 1)) / 2 + 0.05);
  box(concreteDark, -9.3, WT - 0.05, ZF - 0.05, 9.3, WT + 0.14, ZF + 0.22);
  box(concreteDark, -9.3, WT - 0.05, ZB - 0.22, 9.3, WT + 0.14, ZB + 0.05);
  // tympana
  const R = 2.3 * 0.9;
  for (const sx of [-1, 1])
    for (let k = 0; k < 5; k++) {
      const yb = WT + (k * R) / 5;
      const hw = 3.1 * Math.sqrt(1 - Math.pow((k + 0.9) / 5, 2));
      box(concreteWarm, sx > 0 ? 8.6 : -9.4, yb, VC - hw, sx > 0 ? 9.4 : -8.6, yb + R / 5, VC + hw);
    }
  cylx(boardSeam, 9.38, 9.46, 34.9, VC, 0.5, 10);
  cylx(windowGlow, 9.4, 9.5, 34.9, VC, 0.36, 10);
  cylx(boardSeam, -9.46, -9.38, 34.9, VC, 0.5, 10);
  cylx(glassDark, -9.5, -9.4, 34.9, VC, 0.36, 10);
  mossPatch(3, 36.1, VC - 0.5, 1.4, 0.5);
  mossPatch(-4, PL, 2.1, 1.6, 0.14);
  mossPatch(6, PL, ZB - 0.1, 1.5, 0.14);

  // ================================================================ stacks
  G = "stacks";
  const stackTops = [33.4, 34.0, 34.5, 33.7];
  const scz = M.roofStackLeft[2] + 0.4;
  for (const sx of [M.roofStackLeft[0], M.roofStackRight[0]]) {
    for (let k = 0; k < 4; k++) {
      const cx = sx + (k - 1.5) * 2.0;
      const T = stackTops[(k + (sx > 0 ? 0 : 2)) % 4];
      const col = k % 2 ? concreteWarm : k === 2 ? concreteLight : concrete;
      box(concreteDark, cx - 0.85, RT, scz - 0.85, cx + 0.85, 30.75, scz + 0.85);
      box(concreteLight, cx - 0.9, 30.75, scz - 0.9, cx + 0.9, 30.9, scz + 0.9);
      const sy0 = 30.9, sy1 = T - 0.5;
      frus(col, cx, sy0, scz, 1.5, 1.15, sy1 - sy0, 8);
      const wAt = (y: number) => 1.5 + (1.15 - 1.5) * ((y - sy0) / (sy1 - sy0));
      for (const f of [0.3, 0.62]) {
        const y = sy0 + (sy1 - sy0) * f;
        frus(boardSeam, cx, y, scz, wAt(y) + 0.05, wAt(y + 0.05) + 0.05, 0.05, 8);
      }
      frus(concreteLight, cx, T - 0.5, scz, 1.6, 1.6, 0.22, 8);
      frus(concrete, cx, T - 0.28, scz, 1.25, 1.2, 0.18, 8);
      frus(concreteDark, cx, T - 0.1, scz, 0.85, 0.85, 0.08, 8);
      const ys = sy0 + (sy1 - sy0) * 0.72;
      box(glassDark, cx - 0.25, ys, scz + wAt(ys) / 2 - 0.02, cx + 0.25, ys + 0.38, scz + wAt(ys) / 2 + 0.05);
      for (let i = 0; i < 3; i++) {
        const sxx = cx + rr(-0.45, 0.45);
        const yl = sy1 - rr(0.4, 1.0);
        box(concreteStain, sxx - 0.04, yl - 0.2, scz + wAt(yl - 0.3) / 2 + 0.005, sxx + 0.04, sy1, scz + wAt(yl - 0.3) / 2 + 0.03);
      }
      if (k % 2 === 0) mossPatch(cx, T - 0.32, scz, 0.9, 0.8);
    }
  }

  // ================================================================ overruns
  G = "overruns";
  type Slit = { f: string; u: number; lit?: boolean };
  const overrun = (x0: number, x1: number, z0: number, z1: number, top: number, door: { f: string; u: number }, slits: Slit[], lift = false) => {
    box(concrete, x0, RT, z0, x1, top, z1);
    box(concreteDark, x0 - 0.05, RT, z0 - 0.05, x1 + 0.05, 30.5, z1 + 0.05);
    box(concreteLight, x0 - 0.12, top - 0.12, z0 - 0.12, x1 + 0.12, top, z1 + 0.12);
    box(concrete, x0 - 0.25, top, z0 - 0.25, x1 + 0.25, top + 0.22, z1 + 0.25);
    box(roofTar, x0 - 0.12, top + 0.22, z0 - 0.12, x1 + 0.12, top + 0.26, z1 + 0.12);
    box(concreteLight, x0 - 0.25, top + 0.22, z1 + 0.15, x1 + 0.25, top + 0.4, z1 + 0.25);
    box(concreteLight, x0 - 0.25, top + 0.22, z0 - 0.25, x1 + 0.25, top + 0.4, z0 - 0.15);
    box(concreteLight, x1 + 0.15, top + 0.22, z0 - 0.15, x1 + 0.25, top + 0.4, z1 + 0.15);
    box(concreteLight, x0 - 0.25, top + 0.22, z0 - 0.15, x0 - 0.15, top + 0.4, z1 + 0.15);
    const faces = [
      { f: "z+", p: z1, u0: x0, u1: x1 },
      { f: "z-", p: z0, u0: x0, u1: x1 },
      { f: "x+", p: x1, u0: z0, u1: z1 },
      { f: "x-", p: x0, u0: z0, u1: z1 },
    ];
    for (const fc of faces) {
      ribs(fc.f, fc.p, (fc.u0 + fc.u1) / 2, fc.u1 - fc.u0, 31.0, top - 0.2, 0.7);
      const n = Math.max(2, Math.round((fc.u1 - fc.u0) / 1.1));
      for (let i = 0; i < n; i++) streak(fc.f, fc.p, rr(fc.u0 + 0.3, fc.u1 - 0.3), top - 0.12, rr(0.7, 1.7));
    }
    const dp = faces.find((q) => q.f === door.f)!.p;
    fb(concreteDark, door.f, dp, door.u, RT, 32.3, 1.4, 0, 0.05);
    fb(doorOrange, door.f, dp, door.u, RT, 32.2, 1.1, 0.05, 0.1);
    fb(glassDark, door.f, dp, door.u, 31.3, 31.9, 0.5, 0.1, 0.12);
    fb(steel, door.f, dp, door.u + 0.38, 31.2, 31.6, 0.05, 0.1, 0.16);
    fb(concreteLight, door.f, dp, door.u, 32.38, 32.55, 2.1, 0, 0.75);
    for (const s of slits) {
      const p = faces.find((q) => q.f === s.f)!.p;
      fb(concreteDark, s.f, p, s.u, 31.7, top - 0.35, 0.55, 0, 0.05);
      fb(s.lit ? windowGlow : glassDark, s.f, p, s.u, 31.85, top - 0.5, 0.3, 0.05, 0.08);
    }
    cyl(steel, x0 + 0.6, top + 0.26, z0 + 0.6, 0.11, 0.7, 8);
    cyl(railing, x0 + 0.6, top + 0.96, z0 + 0.6, 0.17, 0.06, 8);
    mossPatch((x0 + x1) / 2, top + 0.4, z1 + 0.2, 0.9, 0.1);
    mossPatch(x0 + 0.7, 30.5, z1 + 0.0, 0.8, 0.12);
    if (lift) {
      for (let i = 0; i < 4; i++) fb(glassDark, "z+", z1, (x0 + x1) / 2, 32.3 + i * 0.35, 32.42 + i * 0.35, 1.4, 0.0, 0.05);
      cyl(steel, x1 - 0.4, top + 0.26, z0 + 0.5, 0.035, 2.2, 6);
    }
  };
  overrun(-18.2, -13.8, -8, -5, 33.3, { f: "x+", u: -6.5 }, [{ f: "z+", u: -17.2 }, { f: "z+", u: -14.8 }]);
  overrun(13.8, 18.2, -8, -5, 33.3, { f: "x-", u: -6.5 }, [{ f: "z+", u: 14.9 }, { f: "z+", u: 17.1, lit: true }]);
  overrun(18.2, 20.6, -8, -5.5, 33.6, { f: "x+", u: -6.8 }, [], true);

  // ================================================================ court + climbing wall
  G = "court";
  box(panelGreen, 14.5, RT, 0.5, 24.5, 30.16, 3.3);
  const line = (x0: number, z0: number, x1: number, z1: number) => box(white, x0, 30.16, z0, x1, 30.18, z1);
  line(14.65, 0.6, 24.35, 0.72);
  line(14.65, 3.08, 24.35, 3.2);
  line(14.65, 0.6, 14.77, 3.2);
  line(24.23, 0.6, 24.35, 3.2);
  line(18.0, 0.6, 18.1, 1.9);
  line(21.0, 0.6, 21.1, 1.9);
  line(18.0, 1.8, 21.1, 1.9);
  const cw: [number, number, number][] = [[14.5, 16.1, 2.4], [16.1, 17.7, 3.0], [17.7, 21.3, 3.6], [21.3, 22.9, 3.0], [22.9, 24.5, 2.4]];
  for (const [x0, x1, h] of cw) {
    const top = RT + h;
    box(concrete, x0, RT, -0.4, x1, top, 0.4);
    box(concreteLight, x0 - 0.05, top, -0.5, x1 + 0.05, top + 0.12, 0.5);
    ribs("z+", 0.4, (x0 + x1) / 2, x1 - x0, 30.7, top - 0.1, 0.6);
    ribs("z-", -0.4, (x0 + x1) / 2, x1 - x0, 30.7, top - 0.1, 0.6);
    streak("z+", 0.4, (x0 + x1) / 2 + rr(-0.4, 0.4), top, rr(0.5, 1.2));
    streak("z-", -0.4, (x0 + x1) / 2 + rr(-0.4, 0.4), top, rr(0.5, 1.2));
  }
  fb(panelBlue, "z+", 0.4, 19.5, 31.0, 31.35, 3.6, 0.0, 0.04);
  fb(panelYellow, "z+", 0.4, 19.5, 31.4, 31.55, 3.6, 0.0, 0.04);
  fb(white, "z+", 0.4, 19.5, 32.7, 33.4, 1.1, 0.0, 0.07);
  fb(panelRed, "z+", 0.4, 19.5, 32.95, 33.2, 0.5, 0.07, 0.09);
  fb(steel, "z+", 0.4, 19.5, 32.82, 32.86, 0.05, 0.07, 0.45);
  {
    const g = new THREE.TorusGeometry(0.23, 0.025, 6, 12);
    g.rotateX(Math.PI / 2);
    g.translate(19.5, 32.84, 0.4 + 0.07 + 0.3);
    add(doorOrange, g);
  }
  mossPatch(16, 33.5, 0.0, 0.9, 0.5);

  G = "climb";
  const CX0 = -21.8, CX1 = -14.5;
  box(concrete, CX0, RT, -0.4, CX1, 34.4, 0.4);
  box(concreteLight, CX0 - 0.2, 34.4, -0.6, CX1 + 0.2, 34.55, 0.6);
  box(concreteDark, CX0 - 0.2, 34.3, -0.6, CX1 + 0.2, 34.4, 0.6);
  box(panelBlue, CX0, RT, 0.4, CX1, 30.32, 1.6);
  ribs("z-", -0.4, (CX0 + CX1) / 2, CX1 - CX0, 30.8, 34.2, 0.6);
  ribs("x-", CX0, 0, 0.8, 30.8, 34.2, 0.6);
  for (const u of [-20.6, -18.2, -15.8]) fb(concreteLight, "z+", 0.4, u, 30.5, 34.2, 0.9, 0, 0.015);
  const holdCols = [panelRed, panelYellow, panelBlue];
  for (let i = 0; i < 30; i++) {
    const u = rr(CX0 + 0.5, CX1 - 0.5);
    const y = rr(30.9, 33.9);
    rbox(holdCols[i % 3], u, y, 0.4 + 0.07, rr(0.16, 0.3), rr(0.1, 0.18), 0.14, 0, 0, rr(-0.8, 0.8));
  }
  for (const u of [-20.6, -18.2, -15.8]) cyl(steel, u, 34.55, 0, 0.04, 0.5, 6);
  for (let i = 0; i < 6; i++) streak("z+", 0.4, rr(CX0 + 0.3, CX1 - 0.3), 34.3, rr(0.8, 2.0));
  mossPatch(-18, 34.55, 0, 3, 0.6);

  // ================================================================ pergola
  G = "pergola";
  for (const x of [10.6, 14.4, 18.2, 22.0])
    for (const z of [4.0, 7.4]) {
      box(concreteDark, x - 0.25, RT, z - 0.25, x + 0.25, 30.4, z + 0.25);
      box(concrete, x - 0.16, 30.4, z - 0.16, x + 0.16, 32.9, z + 0.16);
      ribs("z+", z + 0.16, x, 0.32, 30.8, 32.8, 0.7);
    }
  for (const z of [4.0, 7.4]) {
    box(concrete, 10.3, 32.9, z - 0.17, 22.3, 33.25, z + 0.17);
    box(concreteLight, 10.25, 33.25, z - 0.2, 22.35, 33.3, z + 0.2);
    streak("z+", z + 0.17, rr(11, 21), 32.9, 0.5);
  }
  for (let i = 0; i < 22; i++) {
    const x = 10.4 + i * 0.55;
    box(wood, x - 0.035, 33.3, 3.6, x + 0.035, 33.44, 7.8);
  }
  box(wood, 14.6, 30.5, 4.35, 17.6, 30.58, 4.8);
  box(wood, 14.6, 30.58, 4.75, 17.6, 31.0, 4.8);
  for (const x of [14.7, 17.5]) box(concreteDark, x - 0.06, RT, 4.38, x + 0.06, 30.5, 4.77);
  box(concreteLight, 19.3, RT, 4.3, 21.1, 30.6, 4.9);
  box(mossCol, 19.35, 30.6, 4.35, 21.05, 30.7, 4.85);
  box(panelRed, 19.7, 30.7, 4.5, 19.95, 30.95, 4.7);
  box(panelYellow, 20.4, 30.7, 4.5, 20.65, 31.0, 4.7);

  // ================================================================ tanks
  G = "tanks";
  const TX = -24.2;
  for (const tz of [-1, 4]) {
    cyl(concreteDark, TX, RT, tz, 1.45, 0.4, 14);
    cyl(tankGrey, TX, 30.52, tz, 1.3, 3.0, 14);
    {
      const g = new THREE.ConeGeometry(1.3, 0.45, 14);
      g.translate(TX, 33.52 + 0.225, tz);
      add(tankGrey, g);
    }
    for (const y of [31.2, 32.0, 32.8]) cyl(steel, TX, y, tz, 1.34, 0.12, 14);
    cyl(steel, TX, 33.85, tz, 0.17, 0.2, 8);
    for (let i = 0; i < 6; i++) {
      const th = rr(0, Math.PI * 2);
      const h = rr(0.5, 1.2);
      const y = rr(31.5, 33.4);
      rbox(concreteStain, TX + 1.31 * Math.sin(th), y, tz + 1.31 * Math.cos(th), 0.07, h, 0.03, 0, th, 0);
    }
    box(steel, TX + 1.33, 30.52, tz - 0.22, TX + 1.38, 33.4, tz - 0.18);
    box(steel, TX + 1.33, 30.52, tz + 0.18, TX + 1.38, 33.4, tz + 0.22);
    for (let i = 0; i < 9; i++) box(steel, TX + 1.33, 30.8 + i * 0.3, tz - 0.2, TX + 1.38, 30.84 + i * 0.3, tz + 0.2);
  }
  cylz(steel, 0.3, 2.7, TX, 31.0, 0.09, 8);
  mossPatch(TX + 0.4, RT + 0.4, 1.5, 0.8, 0.5);

  // ================================================================ skylights
  G = "skylights";
  for (let k = 0; k < 11; k++) {
    const cx = -10.5 + 2.1 * k;
    const cz = -6.5;
    box(concreteLight, cx - 0.65, RT, cz - 0.65, cx + 0.65, 30.42, cz + 0.65);
    box(concreteDark, cx - 0.68, 30.4, cz - 0.68, cx + 0.68, 30.46, cz + 0.68);
    const g = new THREE.ConeGeometry(0.78, 0.75, 4);
    g.rotateY(Math.PI / 4);
    g.translate(cx, 30.46 + 0.375, cz);
    add(k % 4 === 1 ? windowGlow : glass, g);
    if (k % 3 === 0) streak("z+", cz + 0.65, cx + 0.2, 30.4, 0.25, 0.07);
  }

  // ================================================================ build parts
  for (const bk of buckets.values()) {
    const merged = mergeGeometries(bk.geos, false);
    if (!merged) continue;
    const part = b.part(merged, bk.color, {
      at: [0, 0, 0],
      flat: true,
      name: `roofTop.${bk.group}.${names[bk.color] ?? "c"}`,
    });
    if (bk.color === windowGlow) glow(part, 1.5);
  }
}
    return buildRoofTop;
  })(),
  // serviceTowers
  (() => {
function buildServiceTowers({ b, P, M }: Ctx) {
  // ---------------------------------------------------------------- geometry buckets (one merged part per colour)
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, g: THREE.BufferGeometry, lit = false) => {
    const key = (lit ? "*" : "") + color;
    const list = buckets.get(key) ?? [];
    list.push(g);
    buckets.set(key, list);
  };

  const wbox = (
    color: string, x: number, y: number, z: number, w: number, h: number, d: number,
    rot?: [number, number, number], lit = false,
  ) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (rot) g.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rot[0], rot[1], rot[2])));
    g.translate(x, y, z);
    put(color, g, lit);
  };
  const wplane = (color: string, x: number, y: number, z: number, w: number, h: number, ry: number) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(ry);
    g.translate(x, y, z);
    put(color, g);
  };
  const rod = (color: string, a: THREE.Vector3, c: THREE.Vector3, r: number, sides = 5) => {
    const dir = c.clone().sub(a);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r, r, len, sides, 1, false);
    g.applyQuaternion(aim(dir.clone().normalize()));
    const m = a.clone().add(c).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    put(color, g);
  };

  // ---------------------------------------------------------------- wall-local helpers
  const FACE_ROT = { back: Math.PI, front: 0, left: Math.PI / 2, right: -Math.PI / 2 } as const;
  type Face = keyof typeof FACE_ROT;
  type Rect = { u0: number; u1: number; v0: number; v1: number };

  const tower = (cx: number, num: string, escape: boolean, seed: number) => {
    const R = rng(seed);
    const occ: Record<Face, Rect[]> = { back: [], front: [], left: [], right: [] };
    const origin = (f: Face): [number, number, number] =>
      f === "back" ? [cx, 0, -13] : f === "front" ? [cx, 0, -10] : f === "left" ? [cx + 3, 0, -11.5] : [cx - 3, 0, -11.5];
    const place = (g: THREE.BufferGeometry, f: Face) => {
      g.rotateY(FACE_ROT[f]);
      const o = origin(f);
      g.translate(o[0], o[1], o[2]);
      return g;
    };
    const LB = (
      f: Face, color: string, u: number, v: number, w: number, du: number, dv: number, dw: number,
      rz = 0, lit = false,
    ) => {
      const g = new THREE.BoxGeometry(du, dv, dw);
      if (rz) g.rotateZ(rz);
      g.translate(u, v, w);
      put(color, place(g, f), lit);
    };
    const LP = (f: Face, color: string, u: number, v: number, w: number, du: number, dv: number) => {
      const g = new THREE.PlaneGeometry(du, dv);
      g.translate(u, v, w);
      put(color, place(g, f));
    };
    const LD = (f: Face, color: string, u: number, v: number, w: number, r: number, t: number, lit = false) => {
      const g = new THREE.CylinderGeometry(r, r, t, 8, 1, false);
      g.rotateX(Math.PI / 2);
      g.translate(u, v, w);
      put(color, place(g, f), lit);
    };
    const SEG: Record<string, string> = { "1": "bc", "2": "abged" };
    const digit = (f: Face, color: string, u: number, v: number, w: number, h: number, ch: string) => {
      const wd = h * 0.55;
      const t = h * 0.17;
      const pos: Record<string, [number, number, number, number]> = {
        a: [0, h / 2 - t / 2, wd, t],
        g: [0, 0, wd, t],
        d: [0, -h / 2 + t / 2, wd, t],
        f: [-wd / 2 + t / 2, h / 4, t, h / 2],
        b: [wd / 2 - t / 2, h / 4, t, h / 2],
        e: [-wd / 2 + t / 2, -h / 4, t, h / 2],
        c: [wd / 2 - t / 2, -h / 4, t, h / 2],
      };
      for (const s of SEG[ch]) {
        const p = pos[s];
        LB(f, color, u + p[0], v + p[1], w, p[2], p[3], t * 0.8);
      }
    };

    // -------------------------------------------------------------- foundation plinth (stays inside z -13.5..-9.5)
    wbox(P.concreteDark, cx, 0.3, -11.48, 7.8, 0.6, 3.96);
    wbox(P.concreteDark, cx, 0.9, -11.5, 7.0, 0.6, 3.8);
    wbox(P.concrete, cx, 0.62, -11.5, 7.1, 0.06, 3.9); // chamfer lip between the two steps
    for (const f of ["back", "left", "right"] as Face[]) {
      const w = f === "back" ? 0.47 : 0.91;
      LP(f, P.boardSeam, 0, 0.3, w, f === "back" ? 7.5 : 3.8, 0.05);
      for (let i = 0; i < 3; i++) {
        const half = f === "back" ? 3.4 : 1.7;
        LP(f, P.concreteStain, (R() * 2 - 1) * half, 0.35, w + 0.005, 0.12 + R() * 0.12, 0.5);
      }
    }
    for (let i = 0; i < 4; i++) wbox(P.moss, cx + (R() - 0.5) * 6, 1.22, -13.25 + R() * 0.15, 0.4 + R() * 0.7, 0.05, 0.15);

    // -------------------------------------------------------------- core shaft
    wbox(P.concrete, cx, 17.2, -11.5, 6, 32, 3);
    for (const sx of [1, -1])
      for (const sz of [1, -1]) wbox(P.concreteLight, cx + sx * 3, 17.2, -11.5 + sz * 1.5, 0.2, 32, 0.2, [0, Math.PI / 4, 0]);

    // storey bands with shadow gap, moss and rain streaks
    for (let k = 1; k <= 10; k++) {
      const y = 3 * k;
      wbox(k % 2 ? P.concrete : P.concreteLight, cx, y, -11.5, 6.3, 0.3, 3.3);
      wbox(P.concreteDark, cx, y - 0.21, -11.5, 6.1, 0.12, 3.1);
      if (R() < 0.55) wbox(P.moss, cx + (R() - 0.5) * 4, y + 0.17, -13.07, 0.5 + R() * 0.9, 0.05, 0.12);
      if (R() < 0.4) wbox(P.moss, cx + (R() < 0.5 ? 3.08 : -3.08), y + 0.17, -11.5 + (R() - 0.5) * 2, 0.12, 0.05, 0.5 + R() * 0.8);
      for (const f of ["back", "left", "right"] as Face[]) {
        const half = f === "back" ? 2.8 : 1.3;
        for (let i = 0; i < 2; i++) {
          const len = 0.8 + R() * 1.4;
          LP(f, P.concreteStain, (R() * 2 - 1) * half, y - 0.3 - len / 2, 0.075, 0.1 + R() * 0.12, len);
        }
      }
    }

    // patches of lighter / warmer concrete
    const faces: Face[] = ["back", "left", "right", "front"];
    for (let i = 0; i < 16; i++) {
      const f = faces[Math.floor(R() * 4)];
      const half = f === "back" || f === "front" ? 3 : 1.5;
      const pw = 0.8 + R() * 1.4;
      const ph = 0.8 + R() * 1.6;
      LP(f, i % 2 ? P.concreteLight : P.concreteWarm, (R() * 2 - 1) * (half - pw / 2), 2 + R() * 29, 0.06, pw, ph);
    }

    // -------------------------------------------------------------- windows
    const win = (f: Face, u: number, v: number, du: number, dv: number, lit: boolean, stairs: boolean) => {
      LB(f, P.concreteLight, u, v, 0.08, du + 0.5, dv + 0.45, 0.16);
      LB(f, lit ? P.windowGlow : P.glassDark, u, v, 0.17, du, dv, 0.04, 0, lit);
      if (stairs) {
        const hy = dv / 2;
        const len = Math.hypot(du, hy) * 0.98;
        const ang = Math.atan2(hy, du);
        LB(f, P.concreteDark, u, v - hy / 2, 0.185, len, 0.07, 0.02, ang);
        LB(f, P.concreteDark, u, v + hy / 2, 0.185, len, 0.07, 0.02, -ang);
        LB(f, P.concreteDark, u, v, 0.185, du, 0.06, 0.02);
      }
      occ[f].push({ u0: u - du / 2 - 0.35, u1: u + du / 2 + 0.35, v0: v - dv / 2 - 0.3, v1: v + dv / 2 + 0.3 });
    };
    for (let k = 1; k <= 10; k++) {
      const v = 3 * k + 1.5;
      for (const u of [-1.5, 1.5]) win("back", u, v, 0.7, 2.0, R() < 0.2, true);
      win("left", 0, v, 0.8, 2.0, R() < 0.2, false);
      win("right", 0, v, 0.8, 2.0, R() < 0.2, false);
      LP("back", P.concreteStain, -1.5 + (k % 2 ? 0 : 3), v - 1.0 - 0.35 - 0.45, 0.075, 0.12, 0.9);
    }
    for (const u of [-2.6, 0, 2.6]) LP("back", P.concreteStain, u, 32.3, 0.075, 0.14, 1.5);

    // -------------------------------------------------------------- ground entrance (back face)
    for (const s of [1, -1]) {
      LB("back", P.doorOrange, s * 0.38, 2.4, 0.04, 0.72, 2.4, 0.08);
      LB("back", P.glassDark, s * 0.38, 2.9, 0.085, 0.4, 0.9, 0.02);
      LB("back", P.steel, s * 0.08, 2.3, 0.12, 0.05, 0.5, 0.05);
      LB("back", P.concreteLight, s * 0.86, 2.5, 0.1, 0.2, 2.6, 0.2);
      LD("back", P.concreteDark, s * 1.45, 3.2, 0.03, 0.2, 0.05);
      LD("back", P.windowGlow, s * 1.45, 3.2, 0.07, 0.15, 0.06, true);
    }
    LB("back", P.concreteLight, 0, 3.7, 0.1, 1.92, 0.22, 0.2);
    LB("back", P.concrete, 0, 3.95, 0.12, 2.6, 0.22, 0.72);
    LB("back", P.concreteLight, 0, 4.14, 0.1, 2.2, 0.12, 0.5);
    LB("back", P.concreteLight, 0, 1.25, 0.25, 2.2, 0.1, 0.5);
    LB("back", P.concreteDark, -2.2, 2.5, 0.04, 0.85, 1.05, 0.08);
    digit("back", P.white, -2.2, 2.5, 0.1, 0.6, num);
    LB("back", P.white, -2.2, 1.95, 0.1, 0.5, 0.04, 0.03);
    occ.back.push({ u0: -1.1, u1: 1.1, v0: 1.1, v1: 4.3 });
    occ.back.push({ u0: -2.7, u1: -1.7, v0: 1.8, v1: 3.2 });
    occ.back.push({ u0: 1.2, u1: 1.8, v0: 2.8, v1: 3.6 });
    occ.back.push({ u0: -1.8, u1: -1.2, v0: 2.8, v1: 3.6 });

    // -------------------------------------------------------------- bridges at 12, 18, 24
    for (const L of [12, 18, 24]) {
      wbox(P.concrete, cx, L + 0.05, -9.5, 3.1, 0.5, 1.0);
      wbox(P.concreteDark, cx, L - 0.3, -9.5, 2.9, 0.12, 0.9);
      wbox(P.concrete, cx, L + 2.45, -9.5, 3.2, 0.3, 1.0);
      for (const s of [1, -1]) {
        wbox(P.concrete, cx + s * 1.375, L + 1.3, -9.5, 0.25, 2.0, 1.0);
        wbox(P.concreteLight, cx + s * 1.5, L + 2.7, -9.5, 0.15, 0.2, 1.0);
        wbox(P.concreteDark, cx + s * 1.52, L + 1.4, -9.5, 0.06, 0.75, 0.75);
        const lit = R() < 0.4;
        wbox(lit ? P.windowGlow : P.glassDark, cx + s * 1.55, L + 1.4, -9.5, 0.05, 0.45, 0.55, undefined, lit);
        wplane(P.concreteStain, cx + s * 1.52, L - 0.95, -9.5, 0.8 + R() * 0.2, 1.2, s * Math.PI / 2);
        wbox(P.moss, cx + s * 1.3, L + 2.64, -9.5, 0.3, 0.05, 0.6 + R() * 0.2);
      }
      // orange-framed door on the slab side, door leaf on the tower side
      for (const s of [1, -1]) wbox(P.doorOrange, cx + s * 0.8, L + 1.3, -9.12, 0.12, 2.0, 0.14);
      wbox(P.doorOrange, cx, L + 2.24, -9.12, 1.72, 0.12, 0.14);
      wbox(P.steel, cx, L + 1.22, -9.08, 1.4, 1.84, 0.06);
      wbox(P.doorOrange, cx, L + 1.3, -10.04, 1.2, 2.0, 0.06);
      occ.front.push({ u0: -1.7, u1: 1.7, v0: L - 0.4, v1: L + 2.8 });
    }

    // -------------------------------------------------------------- cap, cornice, overrun
    wbox(P.concreteDark, cx, 33.1, -11.5, 6.2, 0.2, 3.2);
    wbox(P.concreteLight, cx, 33.3, -11.5, 6.5, 0.2, 3.5);
    wbox(P.concrete, cx, 33.7, -11.64, 7.4, 0.6, 3.68);
    wbox(P.roofTar, cx, 34.02, -11.64, 7.0, 0.04, 3.3);
    wbox(P.concreteLight, cx, 34.125, -13.38, 7.4, 0.25, 0.2);
    wbox(P.concreteLight, cx, 34.125, -9.9, 7.4, 0.25, 0.2);
    for (const s of [1, -1]) wbox(P.concreteLight, cx + s * 3.6, 34.125, -11.64, 0.2, 0.25, 3.68);
    LP("back", P.boardSeam, 0, 33.7, 0.49, 7.2, 0.05);
    LP("left", P.boardSeam, 0, 33.7, 0.71, 3.5, 0.05);
    LP("right", P.boardSeam, 0, 33.7, 0.71, 3.5, 0.05);
    for (const u of [-3, -1.2, 0.8, 2.6]) LP("back", P.concreteStain, u, 33.0 - 0.0, 0.5, 0.12, 0.25);
    wbox(P.moss, cx + 2.4, 34.07, -12.9, 0.9, 0.06, 0.5);
    wbox(P.moss, cx - 2.2, 34.07, -10.4, 0.7, 0.06, 0.4);

    wbox(P.concrete, cx, 34.87, -11.65, 3.8, 1.66, 1.9);
    wbox(P.concreteLight, cx, 35.85, -11.65, 4.4, 0.3, 2.6);
    wbox(P.concreteDark, cx, 35.67, -11.65, 4.0, 0.1, 2.2);
    // back face of overrun is 0.4 inside the tower back plane
    LB("back", P.concreteLight, 0.9, 34.9, -0.4 + 0.06, 1.0, 1.0, 0.12);
    LB("back", P.windowGlow, 0.9, 34.9, -0.4 + 0.13, 0.5, 0.7, 0.04, 0, num === "2");
    if (num !== "2") {
      // swap: unlit window drawn dark
      LB("back", P.glassDark, 0.9, 34.9, -0.4 + 0.135, 0.5, 0.7, 0.04);
    }
    LB("back", P.concreteDark, -0.9, 34.9, -0.4 + 0.03, 0.95, 1.25, 0.06);
    digit("back", P.white, -0.9, 34.9, -0.4 + 0.09, 0.8, num);
    // door and hood on the left face of the overrun, ladder on the right
    LB("left", P.concreteDark, 0.15, 34.7, -1.1 + 0.04, 1.0, 1.3, 0.1);
    LB("left", P.doorOrange, 0.15, 34.68, -1.1 + 0.1, 0.8, 1.15, 0.06);
    LB("left", P.concrete, 0.15, 35.4, -1.1 + 0.2, 1.3, 0.12, 0.45);
    LD("left", P.concreteDark, 0.95, 35.0, -1.1 + 0.03, 0.14, 0.04);
    LD("left", P.windowGlow, 0.95, 35.0, -1.1 + 0.06, 0.1, 0.04, true);
    for (const s of [1, -1]) LB("right", P.steel, 0.15 + s * 0.3, 34.97, -1.0, 0.04, 1.85, 0.06);
    for (let i = 0; i < 6; i++) LB("right", P.steel, 0.15, 34.25 + i * 0.28, -1.0, 0.6, 0.035, 0.05);
    // antenna mast with cross bars and base plate
    wbox(P.steel, cx + 2.9, 34.08, -12.7, 0.35, 0.08, 0.35);
    rod(P.steel, new THREE.Vector3(cx + 2.9, 34.1, -12.7), new THREE.Vector3(cx + 2.9, 35.95, -12.7), 0.04, 6);
    for (const y of [35.25, 35.6, 35.85]) wbox(P.steel, cx + 2.9, y, -12.7, y > 35.7 ? 0.35 : 0.6, 0.03, 0.03);
    // cable lugs
    for (const z of [-12.7, -10.9]) wbox(P.steel, cx + (cx < 0 ? 3.3 : -3.3), 34.17, z, 0.2, 0.25, 0.2);

    // -------------------------------------------------------------- fire escape on the +X side of one tower
    if (escape) {
      const uA = 1.05;
      const level = (k: number) => 3 + 3 * k;
      const uOf = (k: number) => (k % 2 === 0 ? -uA : uA);
      for (let k = 0; k < 8; k++) {
        const y = level(k);
        const u = uOf(k);
        LB("left", P.steel, u, y - 0.03, 0.45, 0.8, 0.06, 0.9);
        LB("left", P.railing, u, y + 0.5, 0.88, 0.8, 0.04, 0.04);
        LB("left", P.railing, u, y + 0.95, 0.88, 0.8, 0.04, 0.04);
        if (k < 7) {
          const dx = uOf(k + 1) - u;
          const dy = 3;
          const len = Math.hypot(dx, dy);
          const ang = Math.atan2(dy, dx);
          for (const w of [0.1, 0.8]) LB("left", P.steel, u + dx / 2, y + dy / 2, w, len, 0.08, 0.05, ang);
          LB("left", P.railing, u + dx / 2, y + dy / 2 + 0.95, 0.86, len, 0.04, 0.04, ang);
          for (const t of [0.25, 0.5, 0.75]) LB("left", P.steel, u + dx * t, y + dy * t, 0.45, 0.24, 0.04, 0.7);
        }
      }
    }

    // -------------------------------------------------------------- board-form ribs, broken around openings
    const half: Record<Face, number> = { back: 3, front: 3, left: 1.5, right: 1.5 };
    for (const f of faces) {
      for (let y = 1.5; y < 33.1; y += 0.6) {
        const d = ((y % 3) + 3) % 3;
        if (d < 0.22 || d > 2.78) continue;
        let iv: [number, number][] = [[-half[f] + 0.05, half[f] - 0.05]];
        for (const r of occ[f]) {
          if (y < r.v0 || y > r.v1) continue;
          const next: [number, number][] = [];
          for (const [a, c] of iv) {
            if (r.u1 <= a || r.u0 >= c) next.push([a, c]);
            else {
              if (r.u0 > a) next.push([a, r.u0]);
              if (r.u1 < c) next.push([r.u1, c]);
            }
          }
          iv = next;
        }
        for (const [a, c] of iv) if (c - a > 0.15) LP(f, P.boardSeam, (a + c) / 2, y, 0.09, c - a, 0.05);
      }
    }
  };

  const L = M.towerLeftBase;
  const Rr = M.towerRightBase;
  tower(L[0], "1", false, 11);
  tower(Rr[0], "2", true, 23);

  // -------------------------------------------------------------- steel cable runs between the two caps
  const x0 = L[0] + 3.3;
  const x1 = Rr[0] - 3.3;
  [[-12.7, 2.2], [-10.9, 2.9]].forEach(([z, sag]) => {
    const N = 14;
    let prev = new THREE.Vector3(x0, 34.3, z);
    for (let i = 1; i <= N; i++) {
      const t = i / N;
      const p = new THREE.Vector3(x0 + (x1 - x0) * t, 34.3 - sag * 4 * t * (1 - t), z);
      rod(P.railing, prev, p, 0.025, 4);
      prev = p;
    }
  });

  // -------------------------------------------------------------- emit one merged part per colour
  for (const [key, list] of buckets) {
    const lit = key.startsWith("*");
    const color = lit ? key.slice(1) : key;
    const merged = mergeGeometries(list, false);
    if (!merged) continue;
    const part = b.part(merged, color, { at: [0, 0, 0], flat: true });
    if (lit) glow(part, 1.2);
  }
}
    return buildServiceTowers;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "brutalistHousingBlock" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
