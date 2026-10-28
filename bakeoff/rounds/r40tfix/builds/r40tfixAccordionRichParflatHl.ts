import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";

export const meta = {
  "name": "Madreperla Piano Accordion",
  "description": "A 36-key piano accordion with a 60-button bass side, set on the floor and shown in the Italian mother-of-pearl style: celluloid pearl swirls, black piano-lacquer bands, gold trim and a ruby bellows with cream-edged folds."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  pearlWhite: "#f4efe6",
  pearlCream: "#fbf4e2",
  pearlPink: "#f0d0da",
  pearlAqua: "#cdeae5",
  pearlLilac: "#d8cff0",
  pearlShade: "#b9aec8",
  pearlHighlight: "#ffffff",
  inkBlack: "#17131a",
  roseInlay: "#e0a0b6",
  tealInlay: "#6fc4ba",
  keyIvory: "#f7f0dc",
  keyShade: "#d6cbb2",
  gold: "#d8a735",
  goldLight: "#f6d97c",
  chrome: "#cdd1da",
  chromeDark: "#757b8a",
  bellowsRed: "#901626",
  bellowsRedDark: "#5c0d18",
  bellowsEdge: "#f3ebdb",
  leather: "#2b1e19",
  stitch: "#dac9a6",
  grilleDark: "#0e0b10",
};
const M = {
  trebleBellowsJoin: [-0.14, 0.2, 0] as [number, number, number],
  bassBellowsJoin: [0.14, 0.2, 0] as [number, number, number],
  trebleTopCenter: [-0.235, 0.41, 0] as [number, number, number],
  trebleEndFaceCenter: [-0.33, 0.2, 0] as [number, number, number],
  trebleFrontFaceCenter: [-0.235, 0.2, 0.11] as [number, number, number],
  keyboardOrigin: [-0.315, 0.04, 0.11] as [number, number, number],
  keyboardTopEnd: [-0.315, 0.36, 0.11] as [number, number, number],
  bassTopCenter: [0.229, 0.41, 0] as [number, number, number],
  bassFrontPanelCenter: [0.229, 0.2, 0.11] as [number, number, number],
  bassButtonPanelCenter: [0.318, 0.2, 0] as [number, number, number],
  bassButtonGridOrigin: [0.318, 0.06, -0.075] as [number, number, number],
  backTreble: [-0.235, 0.2, -0.11] as [number, number, number],
  backBass: [0.229, 0.2, -0.11] as [number, number, number],
  shoulderStrapAnchorTreble: [-0.2, 0.41, -0.085] as [number, number, number],
  shoulderStrapAnchorBass: [0.2, 0.41, -0.085] as [number, number, number],
  handStrapPadBass: [0.27, 0.2, -0.11] as [number, number, number],
  bellowsStrapAnchor: [0.14, 0.2, 0.09] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // trebleCase
  (() => {
function buildTrebleCase({ b, J, P, M }: any) {
  const X0 = -0.33, X1 = -0.14, H = 0.41, Z = 0.11;
  const R = rng(11);
  const cx = (X0 + X1) / 2;
  const box = (w: number, h: number, d: number, col: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });
  const cyl = (r: number, h: number, col: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), col, { at, dir });
  const pearls = [P.pearlPink, P.pearlAqua, P.pearlLilac, P.pearlCream, P.pearlShade];

  // shell
  box(X1 - X0 - 0.012, H - 0.012, 2 * Z - 0.012, P.pearlWhite, cx, H / 2, 0);
  box(X1 - X0, H - 0.024, 2 * Z - 0.024, P.pearlWhite, cx, H / 2, 0);
  box(X1 - X0 - 0.024, H, 2 * Z - 0.024, P.pearlWhite, cx, H / 2, 0);

  // patches: faceted irregular
  const patch = (c: number[], n: number[], u: number[], v: number[], w: number, h: number, col: string) => {
    const pts: [number, number][] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + R() * 0.4;
      pts.push([Math.cos(a) * w * (0.6 + R() * 0.4), Math.sin(a) * h * (0.6 + R() * 0.4)]);
    }
    const sh = new THREE.Shape(pts.map((p) => new THREE.Vector2(p[0], p[1])));
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.0015, bevelEnabled: false });
    const m = new THREE.Matrix4().makeBasis(
      new THREE.Vector3(...u), new THREE.Vector3(...v), new THREE.Vector3(...n));
    g.applyMatrix4(m);
    b.part(g, col, { at: c });
  };

  // END FACE x=X0
  box(0.002, 0.39, 0.21, P.inkBlack, X0 - 0.0005, 0.205, 0);
  box(0.003, 0.37, 0.19, P.pearlWhite, X0 - 0.001, 0.205, 0);
  for (let i = 0; i < 8; i++) {
    patch([X0 - 0.0025, 0.07 + R() * 0.27, (R() - 0.5) * 0.12], [-1, 0, 0], [0, 0, 1], [0, 1, 0],
      0.03 + R() * 0.03, 0.04 + R() * 0.04, pearls[i % 5]);
  }
  // gold border
  const rail = (w: number, h: number, d: number, x: number, y: number, z: number) => box(w, h, d, P.gold, x, y, z);
  rail(0.003, 0.003, 0.2, X0 - 0.0035, 0.018, 0);
  rail(0.003, 0.003, 0.2, X0 - 0.0035, 0.392, 0);
  rail(0.003, 0.376, 0.003, X0 - 0.0035, 0.205, 0.1);
  rail(0.003, 0.376, 0.003, X0 - 0.0035, 0.205, -0.1);
  // rosette
  const rx = X0 - 0.004;
  cyl(0.05, 0.003, P.pearlCream, [rx, 0.2, 0], [1, 0, 0], 16);
  b.part(new THREE.TorusGeometry(0.052, 0.003, 5, 20), P.gold, { at: [rx - 0.001, 0.2, 0], dir: [1, 0, 0], axis: "z" });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const g = new THREE.BoxGeometry(0.014, 0.014, 0.002);
    b.part(g, i % 2 ? P.tealInlay : P.roseInlay, {
      at: [rx - 0.002, 0.2 + Math.cos(a) * 0.033, Math.sin(a) * 0.033],
      dir: [1, 0, 0], axis: "z", rotation: [0, 0, 45],
    });
  }
  cyl(0.008, 0.004, P.gold, [rx - 0.003, 0.2, 0], [1, 0, 0]);

  // FRONT FACE
  const zf = Z + 0.0005;
  box(0.19, 0.03, 0.002, P.inkBlack, cx, 0.385, zf);
  box(0.19, 0.03, 0.002, P.inkBlack, cx, 0.025, zf);
  box(0.012, 0.35, 0.002, P.pearlWhite, X0 + 0.005, 0.2, zf);
  for (let i = 0; i < 5; i++)
    patch([X0 + 0.005 + R() * 0.004, 0.06 + i * 0.07, zf + 0.001], [0, 0, 1], [1, 0, 0], [0, 1, 0], 0.006, 0.025, pearls[i]);
  rail(0.18, 0.002, 0.003, cx, 0.037, zf + 0.001);
  rail(0.18, 0.002, 0.003, cx, 0.363, zf + 0.001);
  rail(0.002, 0.326, 0.003, X1 - 0.001, 0.2, zf + 0.001);
  rail(0.002, 0.326, 0.003, X0 + 0.011, 0.2, zf + 0.001);

  // TOP
  const yt = H;
  box(0.19, 0.002, 0.2, P.pearlWhite, cx, yt + 0.0005, 0);
  box(0.15, 0.003, 0.13, P.grilleDark, -0.24, yt + 0.001, 0);
  for (let i = 0; i < 12; i++)
    box(0.0065, 0.003, 0.125, P.chrome, -0.31 + 0.14 * (i + 0.5) / 12, yt + 0.0025, 0);
  for (let i = 0; i < 4; i++)
    patch([-0.3 + i * 0.045, yt + 0.0015, -0.085], [0, 1, 0], [1, 0, 0], [0, 0, -1], 0.02, 0.012, pearls[i]);
  for (let i = 0; i < 7; i++) {
    const x = -0.31 + i * 0.024;
    cyl(0.004, 0.004, P.chromeDark, [x, yt + 0.002, 0.082], [0, 1, 0]);
    box(0.012, 0.005, 0.016, i === 6 ? P.gold : P.pearlWhite, x, yt + 0.005, 0.082);
  }
  rail(0.19, 0.003, 0.003, cx, yt, Z - 0.002);
  rail(0.19, 0.003, 0.003, cx, yt, -Z + 0.002);
  rail(0.003, 0.003, 0.2, X0 + 0.002, yt, 0);

  // BACK
  const zb = -Z - 0.0005;
  box(0.18, 0.37, 0.002, P.pearlWhite, cx, 0.205, zb);
  for (let i = 0; i < 3; i++)
    patch([-0.29 + i * 0.05, 0.1 + i * 0.1, zb - 0.001], [0, 0, -1], [-1, 0, 0], [0, 1, 0], 0.02, 0.03, pearls[i + 1]);
  box(0.18, 0.03, 0.003, P.inkBlack, cx, 0.2, zb - 0.0015);
  for (const x of [-0.2, -0.235]) {
    box(0.024, 0.03, 0.003, P.chrome, x, x < -0.22 ? 0.2 : 0.39, zb - 0.002);
    cyl(0.003, 0.004, P.chromeDark, [x, x < -0.22 ? 0.2 : 0.39, zb - 0.004], [0, 0, -1], 6);
  }

  // INNER plate
  box(0.006, 0.4, 0.2, P.chrome, X1 - 0.003, 0.205, 0);
  for (let i = 0; i < 8; i++) {
    const y = i < 4 ? 0.03 : 0.38;
    const z = -0.09 + (i % 4) * 0.06;
    cyl(0.004, 0.003, P.chromeDark, [X1 + 0.0005, y, z], [1, 0, 0], 6);
  }

  // corner caps
  for (const x of [X0 + 0.003, X1 - 0.003])
    for (const z of [-Z + 0.003, Z - 0.003])
      box(0.008, 0.4, 0.008, P.chrome, x, 0.205, z);
  // feet
  for (const x of [X0 + 0.02, X1 - 0.02])
    for (const z of [-0.085, 0.085]) cyl(0.011, 0.012, P.inkBlack, [x, 0.006, z], [0, 1, 0], 8);
}
    return buildTrebleCase;
  })(),
  // keyboard
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, number[]> };

function buildKeyboard({ b, P }: Ctx) {
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // backboard
  box(0.18, 0.32, 0.004, P.inkBlack, -0.23, 0.2, 0.11);

  // white keys
  const pitch = 0.0147;
  const y0 = 0.046;
  for (let i = 0; i < 21; i++) {
    const y = y0 + 0.00675 + i * pitch;
    box(0.15, 0.0135, 0.015, P.keyIvory, -0.24, y, 0.1175);
    box(0.15, 0.0025, 0.0155, P.keyShade, -0.24, y - 0.0055, 0.1178);
    b.part(new THREE.CylinderGeometry(0.0055, 0.0055, 0.15, 6), P.keyIvory, {
      at: [-0.24, y, 0.1255],
      dir: [1, 0, 0],
    });
  }

  // black keys
  for (let i = 0; i < 20; i++) {
    if (![0, 1, 2, 4, 5].includes(i % 7)) continue;
    const y = y0 + 0.0135 + 0.0006 + i * pitch + 0.0006;
    box(0.07, 0.009, 0.025, P.inkBlack, -0.28, y, 0.1225);
    box(0.06, 0.0018, 0.0015, P.pearlHighlight, -0.2825, y + 0.0015, 0.1352);
  }

  // key slip rail
  box(0.025, 0.32, 0.012, P.gold, -0.1525, 0.2, 0.116);
  box(0.015, 0.31, 0.0125, P.pearlCream, -0.1525, 0.2, 0.1166);
  for (let k = 0; k < 3; k++) {
    const y = 0.11 + k * 0.09;
    b.part(new THREE.OctahedronGeometry(0.008), P.tealInlay, {
      at: [-0.1525, y, 0.1235],
      scale: [0.6, 1.3, 0.25],
    });
  }

  // cheek blocks
  const r = rng(5);
  for (const [y, sgn] of [[0.0345, -1], [0.3655, 1]] as [number, number][]) {
    box(0.18, 0.012, 0.03, P.pearlWhite, -0.23, y + (sgn > 0 ? 0.0005 : 0), 0.125);
    box(0.18, 0.002, 0.031, P.gold, -0.23, y + sgn * 0.0, 0.1252);
    for (let k = 0; k < 4; k++) {
      const col = k % 2 ? P.pearlPink : P.pearlAqua;
      box(0.025 + r() * 0.02, 0.0125, 0.008, col, -0.3 + k * 0.045 + r() * 0.01, y, 0.1352);
    }
  }

  // brand plate on top cheek block
  box(0.05, 0.007, 0.004, P.gold, -0.23, 0.3655, 0.1395);
  for (let k = 0; k < 3; k++) box(0.03 - k * 0.005, 0.0008, 0.0006, P.inkBlack, -0.23, 0.3635 + k * 0.0019, 0.1418);
}
    return buildKeyboard;
  })(),
  // bassCase
  (() => {
function buildBassCase({ b, P }: any) {
  const R = rng(11);
  const X0 = 0.14, X1 = 0.318, W = X1 - X0, CX = (X0 + X1) / 2;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: number[], dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, dir });

  // shell
  box(W, 0.41 - 0.012, 0.22, P.pearlWhite, CX, 0.206, 0);
  // chamfer-ish edge strips
  // chrome frame plate at bellows side
  box(0.006, 0.4, 0.21, P.chrome, X0 + 0.003, 0.205, 0);
  for (const y of [0.05, 0.36]) for (const z of [-0.08, 0.08])
    cyl(0.004, 0.004, 0.003, 6, P.chromeDark, [X0 + 0.0075, y, z], [1, 0, 0]);
  // feet
  for (const x of [0.16, 0.3]) for (const z of [-0.09, 0.09])
    cyl(0.013, 0.015, 0.012, 8, P.inkBlack, [x, 0.006, z], [0, 1, 0]);
  // corner caps
  for (const x of [X0 + 0.004, X1 - 0.004]) for (const z of [-0.108, 0.108])
    box(0.008, 0.4, 0.008, P.chrome, x, 0.205, z);

  // pearl patch helper on a face: face "x" (+X end), "z" (front/back), "y" (top)
  const pcols = [P.pearlPink, P.pearlAqua, P.pearlLilac, P.pearlCream, P.pearlShade];
  const patch = (axis: string, c: number[], w: number, h: number, col: string, rot: number, lift: number) => {
    const g = new THREE.CylinderGeometry(w / 2, w / 2, 0.0015, 5 + Math.floor(R() * 3));
    g.scale(1, 1, h / w);
    g.applyMatrix4(new THREE.Matrix4().makeRotationY(rot));
    const d = axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, c[2] > 0 ? 1 : -1] : [0, 1, 0];
    b.part(g, col, { at: c, dir: d });
    void lift;
  };
  // front and back face patches
  for (const zs of [1, -1]) for (let i = 0; i < 7; i++)
    patch("z", [X0 + 0.02 + R() * (W - 0.04), 0.03 + R() * 0.35, zs * 0.1115], 0.03 + R() * 0.03, 0.03 + R() * 0.04, pcols[i % 5], R() * 3, 0);
  // top patches
  for (let i = 0; i < 6; i++)
    patch("y", [X0 + 0.02 + R() * (W - 0.04), 0.4115, -0.08 + R() * 0.16], 0.03 + R() * 0.03, 0.03, pcols[i % 5], R() * 3, 0);

  // front face: black bands, gold rails, grille
  box(W - 0.01, 0.006, 0.002, P.inkBlack, CX, 0.395, 0.1115);
  box(W - 0.01, 0.006, 0.002, P.inkBlack, CX, 0.015, 0.1115);
  box(0.13, 0.27, 0.003, P.inkBlack, 0.23, 0.205, 0.1125);
  box(0.126, 0.002, 0.0035, P.gold, 0.23, 0.335, 0.113);
  box(0.126, 0.002, 0.0035, P.gold, 0.23, 0.075, 0.113);
  box(0.002, 0.26, 0.0035, P.gold, 0.166, 0.205, 0.113);
  box(0.002, 0.26, 0.0035, P.gold, 0.294, 0.205, 0.113);
  box(0.12, 0.25, 0.003, P.grilleDark, 0.23, 0.205, 0.1135);
  for (let i = 0; i < 9; i++) box(0.0075, 0.245, 0.003, P.chrome, 0.174 + i * 0.0145, 0.205, 0.116);
  // oval badge
  const bd = new THREE.CylinderGeometry(0.03, 0.03, 0.003, 14);
  bd.scale(1, 1, 0.45);
  b.part(bd, P.gold, { at: [0.23, 0.365, 0.113], dir: [0, 0, 1], axis: "y" });
  const bd2 = new THREE.CylinderGeometry(0.024, 0.024, 0.0015, 14);
  bd2.scale(1, 1, 0.4);
  b.part(bd2, P.goldLight, { at: [0.23, 0.365, 0.1145], dir: [0, 0, 1] });
  // bellows strap stud
  cyl(0.006, 0.006, 0.006, 8, P.gold, [X0 + 0.012, 0.2, 0.113], [0, 0, 1]);

  // top: gold rail, air release
  box(W - 0.006, 0.002, 0.003, P.gold, CX, 0.411, 0.105);
  box(W - 0.006, 0.002, 0.003, P.gold, CX, 0.411, -0.105);
  cyl(0.014, 0.014, 0.004, 12, P.gold, [0.229, 0.412, 0.0], [0, 1, 0]);
  cyl(0.009, 0.009, 0.008, 10, P.chrome, [0.229, 0.416, 0.0], [0, 1, 0]);

  // back
  box(W - 0.02, 0.03, 0.002, P.inkBlack, CX, 0.28, -0.1115);
  box(W - 0.02, 0.03, 0.002, P.inkBlack, CX, 0.12, -0.1115);
  for (const x of [0.2, 0.27]) box(0.03, 0.02, 0.003, P.chrome, x, 0.2, -0.112);

  // end panel
  box(0.003, 0.35, 0.2, P.pearlWhite, X1 + 0.0005, 0.205, 0);
  box(0.002, 0.35, 0.2, P.inkBlack, X1 + 0.002, 0.21, 0);
  box(0.0035, 0.34, 0.19, P.inkBlack, X1 + 0.0015, 0.21, 0);
  const rail = (y: number, z: number, h: number, d: number) => box(0.004, h, d, P.gold, X1 + 0.002, y, z);
  rail(0.039, 0, 0.002, 0.192); rail(0.381, 0, 0.002, 0.192);
  rail(0.21, -0.096, 0.342, 0.002); rail(0.21, 0.096, 0.342, 0.002);
  // diamond inlays at corners
  let k = 0;
  for (const y of [0.052, 0.368]) for (const z of [-0.084, 0.084]) {
    const g = new THREE.CylinderGeometry(0.008, 0.008, 0.002, 4);
    b.part(g, k++ % 2 ? P.tealInlay : P.roseInlay, { at: [X1 + 0.004, y, z], dir: [1, 0, 0] });
  }
  // buttons
  for (let r = 0; r < 10; r++) for (let c = 0; c < 6; c++) {
    const y = 0.06 + 0.03 * r + c * 0.006, z = -0.075 + 0.03 * c;
    const col = r % 3 === 2 ? P.inkBlack : r % 4 === 3 ? P.roseInlay : P.pearlCream;
    cyl(0.0125, 0.0125, 0.003, 10, P.gold, [X1 + 0.0035, y, z], [1, 0, 0]);
    cyl(0.0105, 0.0105, 0.008, 8, col, [X1 + 0.0055 + 0.002, y, z], [1, 0, 0]);
    b.part(new THREE.SphereGeometry(0.002, 5, 4), P.pearlHighlight, { at: [X1 + 0.0125, y + 0.003, z + 0.003] });
  }
}
    return buildBassCase;
  })(),
  // bellows
  (() => {
function buildBellows({ b, J, P, M }: Ctx) {
  const X0 = -0.14, X1 = 0.14, N = 15;
  const pitch = (X1 - X0) / N;
  const box = (w: number, h: number, d: number, col: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });
  // hollow rectangular ring at x with outer H x D, wall t, thickness w
  const ring = (x: number, H: number, D: number, w: number, t: number, col: string, yc = 0.205) => {
    box(w, t, D, col, x, yc + H / 2 - t / 2, 0);
    box(w, t, D, col, x, yc - H / 2 + t / 2, 0);
    box(w, H - 2 * t, t, col, x, yc, D / 2 - t / 2);
    box(w, H - 2 * t, t, col, x, yc, -D / 2 + t / 2);
  };
  const H = 0.37, D = 0.17, ins = 0.012;
  // inner dark core so no see-through
  box(X1 - X0 - 0.004, H - 0.05, D - 0.05, P.bellowsRedDark, 0, 0.205, 0);
  for (let i = 0; i < N; i++) {
    const x = X0 + pitch * (i + 0.5);
    ring(x, H, D, 0.006, 0.006, P.bellowsRed);
    ring(x + 0.0035, H + 0.001, D + 0.001, 0.0016, 0.0035, P.bellowsEdge);
    ring(x - 0.0035, H + 0.001, D + 0.001, 0.0016, 0.0035, P.bellowsEdge);
    // valley ring between ridges
    const xv = x + pitch / 2;
    if (i < N - 1) {
      ring(xv, H - 2 * ins, D - 2 * ins, 0.004, 0.006, P.bellowsRedDark);
      // flank panels (tilted slabs) top and bottom, front and back
      const tilt = Math.atan2(ins, pitch / 2);
      for (const s of [1, -1]) {
        for (const sgn of [1, -1]) {
          const m = b.part(new THREE.BoxGeometry(pitch * 0.55, 0.003, D - 0.02), P.bellowsRedDark, {
            at: [xv, 0.205 + s * (H / 2 - ins / 2), 0], rotation: [0, 0, 0],
          });
          m.mesh.rotation.z = sgn * s * tilt;
          if (sgn < 0) m.mesh.visible = false;
        }
        const f = b.part(new THREE.BoxGeometry(pitch * 0.55, H - 0.02, 0.003), P.bellowsRedDark, {
          at: [xv, 0.205, s * (D / 2 - ins / 2)],
        });
        f.mesh.rotation.y = s * Math.atan2(ins, pitch / 2);
      }
    }
  }
  // corner guards
  for (const sy of [1, -1])
    for (const sz of [1, -1]) {
      const cy = 0.205 + sy * (H / 2 - 0.004), cz = sz * (D / 2 - 0.004);
      box(0.28, 0.008, 0.016, P.inkBlack, 0, 0.205 + sy * (H / 2 - 0.004), sz * (D / 2 - 0.008));
      box(0.28, 0.016, 0.008, P.inkBlack, 0, 0.205 + sy * (H / 2 - 0.008), sz * (D / 2 - 0.004));
      box(0.28, 0.003, 0.003, P.gold, 0, 0.205 + sy * (H / 2 + 0.0005), sz * (D / 2 + 0.0005));
      for (let i = 0; i < N; i++)
        b.part(new THREE.SphereGeometry(0.0025, 6, 4), P.gold, {
          at: [X0 + pitch * (i + 0.5), 0.205 + sy * (H / 2 + 0.001), sz * (D / 2 - 0.006)],
        });
    }
  // end frame lips
  for (const e of [-1, 1]) {
    const x = e * 0.1385;
    ring(x, H + 0.012, D + 0.012, 0.003, 0.008, P.gold);
    ring(x - e * 0.003, H + 0.004, D + 0.004, 0.003, 0.006, P.pearlWhite);
  }
  // strap
  const sy = 0.2, sz = 0.095;
  const sx0 = 0.14, sx1 = -0.04, len = sx0 - sx1, cx = (sx0 + sx1) / 2;
  box(len, 0.022, 0.008, P.leather, cx, sy, sz);
  for (let i = 0; i < 9; i++) box(0.007, 0.0015, 0.0012, P.stitch, sx1 + 0.012 + i * 0.0125, sy + 0.0075, sz + 0.0045);
  for (let i = 0; i < 9; i++) box(0.007, 0.0015, 0.0012, P.stitch, sx1 + 0.012 + i * 0.0125, sy - 0.0075, sz + 0.0045);
  for (let i = 0; i < 5; i++) b.part(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0012, 8), P.inkBlack, {
    at: [sx1 + 0.012 + i * 0.009, sy, sz + 0.0045], dir: [0, 0, 1],
  });
  // pointed tip
  b.extrude([[0, -0.011], [0.014, -0.011], [0.026, 0], [0.014, 0.011], [0, 0.011]], {
    at: [sx1 - 0.026, sy, sz], x: [1, 0, 0], y: [0, 1, 0], thickness: 0.008, color: P.leather,
  });
  // buckle
  const bx = 0.0;
  box(0.004, 0.028, 0.004, P.gold, bx - 0.009, sy, sz + 0.006);
  box(0.004, 0.028, 0.004, P.gold, bx + 0.009, sy, sz + 0.006);
  box(0.022, 0.004, 0.004, P.gold, bx, sy + 0.012, sz + 0.006);
  box(0.022, 0.004, 0.004, P.gold, bx, sy - 0.012, sz + 0.006);
  box(0.016, 0.0025, 0.0025, P.gold, bx, sy, sz + 0.0075);
  for (const s of [1, -1]) b.part(new THREE.SphereGeometry(0.0025, 6, 4), P.goldLight, { at: [bx + s * 0.009, sy + 0.012, sz + 0.009] });
  // keeper loop
  box(0.007, 0.026, 0.011, P.pearlWhite, -0.02, sy, sz + 0.001);
  // stud at anchor
  b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.006, 10), P.gold, { at: [0.136, sy, sz + 0.006], dir: [0, 0, 1] });
  // valve plate on top
  box(0.03, 0.002, 0.04, P.gold, 0, 0.39 + 0.0015, 0);
  box(0.022, 0.002, 0.032, P.goldLight, 0, 0.39 + 0.0033, 0);
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 10), P.chrome, { at: [0, 0.39 + 0.005, 0] });
}
    return buildBellows;
  })(),
  // harness
  (() => {
function buildHarness({ b, P, M }: any) {
  const Z0 = -0.11;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (r: number, len: number, color: string, x: number, y: number, z: number, seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: [x, y, z], dir: [0, 0, 1] });
  const ring = (r: number, t: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.TorusGeometry(r, t, 5, 10), color, { at: [x, y, z] });

  // shoulder straps
  const strap = (x: number) => {
    const top = 0.4, bot = 0.03;
    const zAt = (y: number) => Z0 - 0.012 - 0.026 * Math.sin(Math.PI * (y - bot) / (top - bot));
    const n = 9;
    for (let i = 0; i < n; i++) {
      const y0 = bot + ((top - bot) * i) / n, y1 = bot + ((top - bot) * (i + 1)) / n;
      const ym = (y0 + y1) / 2, zm = zAt(ym);
      const len = Math.hypot(y1 - y0, zAt(y1) - zAt(y0)) + 0.001;
      b.part(new THREE.BoxGeometry(0.03, len, 0.006), P.leather, {
        at: [x, ym, zm],
        dir: [0, y1 - y0, zAt(y1) - zAt(y0)],
        axis: "y",
        up: [0, 0, 1],
      });
      for (const s of [-1, 1]) {
        b.part(new THREE.BoxGeometry(0.0012, len * 0.55, 0.0012), P.stitch, { at: [x + s * 0.012, ym, zm - 0.0032] });
      }
    }
    // anchor plate and loop
    box(0.044, 0.02, 0.004, P.chrome, x, 0.4, Z0 - 0.002);
    ring(0.012, 0.0025, P.chrome, x, 0.392, Z0 - 0.008);
    for (const s of [-1, 1]) cyl(0.0025, 0.006, P.chromeDark, x + s * 0.016, 0.4, Z0 - 0.005, 6);
    // cushion pad
    const pz = zAt(0.21) - 0.012;
    box(0.06, 0.1, 0.02, P.leather, x, 0.21, pz);
    for (const s of [-1, 1]) {
      box(0.0015, 0.09, 0.0015, P.pearlShade, x + s * 0.026, 0.21, pz - 0.0105);
      box(0.05, 0.0015, 0.0015, P.pearlShade, x, 0.21 + s * 0.045, pz - 0.0105);
    }
    box(0.05, 0.09, 0.0012, P.leather, x, 0.21, pz - 0.0104);
    // slider buckle
    const bz = zAt(0.1) - 0.006;
    box(0.04, 0.004, 0.003, P.chrome, x, 0.113, bz);
    box(0.04, 0.004, 0.003, P.chrome, x, 0.087, bz);
    for (const s of [-1, 1]) box(0.004, 0.03, 0.003, P.chrome, x + s * 0.018, 0.1, bz);
    box(0.002, 0.026, 0.003, P.chromeDark, x, 0.1, bz - 0.001);
    // tail gold tip
    box(0.03, 0.012, 0.007, P.gold, x, 0.036, zAt(0.036) - 0.002);
    box(0.02, 0.003, 0.007, P.goldLight, x, 0.028, zAt(0.036) - 0.002);
  };
  strap(M.shoulderStrapAnchorTreble[0]);
  strap(M.shoulderStrapAnchorBass[0]);

  // hand strap pad
  const hx = M.handStrapPadBass[0], hz = Z0 - 0.006;
  box(0.07, 0.18, 0.012, P.leather, hx, 0.2, hz);
  box(0.07, 0.03, 0.0016, P.inkBlack, hx, 0.2, hz - 0.0068);
  box(0.012, 0.1, 0.0016, P.grilleDark, hx, 0.2, hz - 0.0068);
  for (const s of [-1, 1]) {
    for (const y of [0.125, 0.275]) cyl(0.0035, 0.003, P.gold, hx + s * 0.027, y, hz - 0.0075);
    box(0.0012, 0.165, 0.0012, P.stitch, hx + s * 0.032, 0.2, hz - 0.0068);
  }
  box(0.062, 0.0012, 0.0012, P.stitch, hx, 0.282, hz - 0.0068);
  box(0.062, 0.0012, 0.0012, P.stitch, hx, 0.118, hz - 0.0068);

  // D-rings, plaques
  for (const x of [-0.27, -0.2, 0.19, 0.29]) {
    box(0.016, 0.01, 0.003, P.chrome, x, 0.04, Z0 - 0.0015);
    ring(0.008, 0.0021, P.chrome, x, 0.036, Z0 - 0.006);
  }
  for (const x of [M.backTreble[0], M.backBass[0]]) {
    const y = 0.35;
    box(0.05, 0.016, 0.002, P.gold, x, y, Z0 - 0.001);
    for (let i = 0; i < 3; i++) box(0.034 - i * 0.006, 0.0012, 0.0006, P.inkBlack, x, y + 0.004 - i * 0.004, Z0 - 0.0023);
  }
}
    return buildHarness;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "madreperlaAccordion" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
