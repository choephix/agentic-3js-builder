import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, catmull } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Piano Accordion",
  "description": "An Italian mother-of-pearl piano accordion standing upright on its bass end, with a pearl-white piano keyboard, red bellows with gold corners, and a bass grille with buttons."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  pearlWhite: "#f4f1ea",
  pearlPink: "#f2d3dc",
  pearlAqua: "#c8ebe6",
  pearlLilac: "#d9cdf0",
  keyIvory: "#fffdf5",
  keyBlack: "#16141a",
  bellowsRed: "#b3202c",
  bellowsDark: "#6e1119",
  pleatCream: "#efe0c4",
  gold: "#d9a93a",
  chrome: "#c9ced6",
  grilleDark: "#2a2630",
  strap: "#4a2c1e",
  gem: "#7fe0ff",
};
const M = {
  trebleBellows: [0.1, 0.26, 0] as [number, number, number],
  bassBellows: [-0.1, 0.26, 0] as [number, number, number],
  keyboardFace: [0.175, 0.26, 0.12] as [number, number, number],
  bassFace: [-0.175, 0.26, 0.12] as [number, number, number],
  floorLine: [0, 0, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // trebleCabinet
  (() => {
function buildTrebleCabinet({ b, P }: Ctx) {
  type V = [number, number, number];
  type Face = { c: V; u: V; v: V; n: V };
  type Pt = [number, number];

  // ---- dimensions (box x 0.10..0.25, y 0..0.52, z -0.12..0.12) ----
  const X0 = 0.1, X1 = 0.25, Z1 = 0.12, H = 0.52;
  const SX1 = 0.2475; // shell outer x
  const SZ = 0.1175; // shell half depth
  const SH = 0.5135; // shell top
  const CX = (X0 + SX1) / 2;
  const PEARLS = [P.pearlPink, P.pearlAqua, P.pearlLilac];

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const ball = (r: number, color: string, at: V, seg = 6) =>
    b.part(new THREE.SphereGeometry(r, seg, 4), color, { at });

  // ---- face helpers: outlines drawn in a face's own (u, v) plane, layered outward ----
  const pt = (f: Face, u: number, v: number, l: number): V => [
    f.c[0] + f.u[0] * u + f.v[0] * v + f.n[0] * l,
    f.c[1] + f.u[1] * u + f.v[1] * v + f.n[1] * l,
    f.c[2] + f.u[2] * u + f.v[2] * v + f.n[2] * l,
  ];
  const lay = (k: number) => 0.0003 + 0.0004 * k;
  const inlay = (f: Face, pts: Pt[], color: string, k: number) =>
    b.extrude(pts, { at: pt(f, 0, 0, lay(k)), x: f.u, y: f.v, thickness: 0.0008, color });
  const gem = (f: Face, u: number, v: number, k: number, r: number, color: string) =>
    ball(r, color, pt(f, u, v, lay(k) + 0.0004 + r * 0.35));

  const diamond = (hw: number, hh: number, cu = 0, cv = 0): Pt[] => [
    [cu - hw, cv], [cu, cv + hh], [cu + hw, cv], [cu, cv - hh],
  ];
  const rect = (cu: number, cv: number, w: number, h: number): Pt[] => [
    [cu - w / 2, cv - h / 2], [cu + w / 2, cv - h / 2], [cu + w / 2, cv + h / 2], [cu - w / 2, cv + h / 2],
  ];
  const chevron = (w: number, h: number, t: number, cv: number): Pt[] => [
    [-w, cv], [0, cv + h], [w, cv], [w, cv - t], [0, cv + h - t], [-w, cv - t],
  ];
  const border = (f: Face, cu: number, cv: number, hu: number, hv: number, w: number, color: string, k: number) => {
    inlay(f, rect(cu, cv + hv - w / 2, 2 * hu, w), color, k);
    inlay(f, rect(cu, cv - hv + w / 2, 2 * hu, w), color, k);
    inlay(f, rect(cu - hu + w / 2, cv, w, 2 * hv - 2 * w), color, k);
    inlay(f, rect(cu + hu - w / 2, cv, w, 2 * hv - 2 * w), color, k);
  };

  const SIDE: Face = { c: [SX1, 0.26, 0], u: [0, 0, 1], v: [0, 1, 0], n: [1, 0, 0] };
  const BACK: Face = { c: [CX, 0.26, -SZ], u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, -1] };
  const TOP: Face = { c: [CX, SH, 0], u: [1, 0, 0], v: [0, 0, 1], n: [0, 1, 0] };
  const FRONT: Face = { c: [CX, 0.26, SZ], u: [1, 0, 0], v: [0, 1, 0], n: [0, 0, 1] };

  // ---- shell ----
  box(SX1 - X0, SH, 2 * SZ, P.pearlWhite, CX, SH / 2, 0);

  // ---- gold edge trim frame ----
  const pz = Z1 - 0.0035;
  for (const px of [X1 - 0.0035, X0 + 0.0035])
    for (const s of [1, -1]) box(0.007, H, 0.007, P.gold, px, H / 2, s * pz);
  for (const y of [0.00325, H - 0.00325]) {
    for (const px of [X1 - 0.0035, X0 + 0.0035]) box(0.007, 0.0065, 2 * Z1, P.gold, px, y, 0);
    for (const s of [1, -1]) box(X1 - X0, 0.0065, 0.007, P.gold, (X0 + X1) / 2, y, s * pz);
  }
  for (const px of [X1 - 0.0055, X0 + 0.0055])
    for (const s of [1, -1]) ball(0.005, P.gold, [px, H - 0.005, s * (Z1 - 0.0055)], 8);

  // ---- SIDE (+X outer face): nested pearl diamonds, chevron bands, gems ----
  border(SIDE, 0, 0, 0.1055, 0.248, 0.004, P.gold, 0);
  inlay(SIDE, diamond(0.1, 0.2), P.gold, 0);
  inlay(SIDE, diamond(0.094, 0.188), P.pearlPink, 1);
  inlay(SIDE, diamond(0.072, 0.144), P.pearlAqua, 2);
  inlay(SIDE, diamond(0.05, 0.1), P.pearlLilac, 3);
  inlay(SIDE, diamond(0.028, 0.056), P.pearlWhite, 4);
  gem(SIDE, 0, 0, 4, 0.0065, P.gem);
  for (const s of [1, -1]) {
    gem(SIDE, s * 0.082, 0, 1, 0.004, P.gem);
    gem(SIDE, 0, s * 0.166, 1, 0.004, P.gem);
    for (const t of [1, -1]) {
      ball(0.0035, P.gold, pt(SIDE, s * 0.075, t * 0.14, 0.0016));
      ball(0.003, P.gold, pt(SIDE, s * 0.085, t * 0.075, 0.0016));
    }
    // chevron bands above (s = 1) and below (s = -1) the diamond
    inlay(SIDE, chevron(0.095, s * 0.02, s * 0.008, s * 0.206), P.pearlAqua, 1);
    inlay(SIDE, chevron(0.095, s * 0.02, s * 0.008, s * 0.222), P.pearlLilac, 1);
    for (const t of [1, -1]) ball(0.003, P.gem, pt(SIDE, t * 0.088, s * 0.215, 0.0014));
  }

  // ---- BACK (-Z): harlequin lattice of pearl diamonds ----
  border(BACK, 0, 0, 0.0615, 0.248, 0.004, P.gold, 0);
  let idx = 0;
  for (let j = -3; j <= 3; j++)
    for (let i = -1; i <= 1; i++) {
      if ((i + j + 6) % 2 !== 0) continue;
      const cu = i * 0.038, cv = j * 0.065;
      inlay(BACK, diamond(0.0175, 0.029, cu, cv), PEARLS[idx % 3], 1);
      inlay(BACK, diamond(0.009, 0.0148, cu, cv), idx % 2 ? P.pearlWhite : P.gold, 2);
      gem(BACK, cu, cv, 2, 0.0028, P.gem);
      idx++;
    }
  for (const su of [1, -1])
    for (const sv of [1, -1]) ball(0.0032, P.gold, pt(BACK, su * 0.0615, sv * 0.248, 0.0014));

  // ---- TOP: gold-edged grille with slots, margin diamonds, register switch block ----
  const gcv = -0.0525;
  inlay(TOP, rect(0, gcv, 0.114, 0.105), P.grilleDark, 0);
  border(TOP, 0, gcv, 0.057, 0.0525, 0.004, P.gold, 1);
  for (let k = 0; k < 9; k++) inlay(TOP, rect(0, gcv + (k - 4) * 0.0105, 0.1, 0.0058), P.pearlWhite, 2);
  for (const s of [1, -1])
    for (let k = 0; k < 8; k++)
      inlay(TOP, diamond(0.004, 0.009, s * 0.063, -0.105 + k * 0.03), PEARLS[(k + (s > 0 ? 0 : 1)) % 3], 1);

  // chrome register switch block
  const rz = 0.06;
  box(0.114, 0.004, 0.076, P.chrome, CX, SH + 0.002, rz);
  box(0.114, 0.0045, 0.003, P.gold, CX, SH + 0.00225, rz - 0.0365);
  box(0.114, 0.0045, 0.003, P.gold, CX, SH + 0.00225, rz + 0.0365);
  for (let i = 0; i < 5; i++) {
    const x = CX + (i - 2) * 0.021;
    box(0.011, 0.0025, 0.012, i % 2 ? P.keyBlack : P.keyIvory, x, SH + 0.00525, rz - 0.016);
    box(0.011, 0.0025, 0.012, i % 2 ? P.keyIvory : P.keyBlack, x, SH + 0.00525, rz + 0.016);
    ball(0.003, P.gem, [x, SH + 0.004, rz]);
  }

  // ---- FRONT margins around the keyboard: pearl diamonds below, gems above ----
  for (let i = -3; i <= 3; i++) {
    inlay(FRONT, diamond(0.0085, 0.012, i * 0.0185, 0.0235 - 0.26), PEARLS[(i + 3) % 3], 1);
    ball(0.0025, P.gem, pt(FRONT, i * 0.0185, 0.507 - 0.26, 0.0002));
  }
}
    return buildTrebleCabinet;
  })(),
  // keyboard
  (() => {
function buildKeyboard({ b, P }: Ctx) {
  // Box helper: x0..x1, y0..y1, z0..z1 in model space.
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });

  const X0 = 0.11;
  const X1 = 0.24;
  const Z0 = 0.12; // cabinet front face
  const Y0 = 0.04;
  const Y1 = 0.5;

  // Base plate: dark, shows through the gaps between keys.
  box(X0, X1, 0.055, 0.485, Z0, Z0 + 0.006, P.grilleDark);

  // Gold frame rails above and below.
  for (const [ya, yb] of [
    [Y0, 0.055],
    [0.485, Y1],
  ]) {
    box(X0, X1, ya, yb, Z0, 0.156, P.gold);
    // thin dark groove along the rail top
    box(X0 + 0.003, X1 - 0.003, (ya + yb) / 2 - 0.0008, (ya + yb) / 2 + 0.0008, 0.156, 0.1566, P.grilleDark);
  }
  // Gem studs on the rails
  for (const y of [0.0475, 0.4925]) {
    for (const x of [0.135, 0.175, 0.215]) {
      b.part(new THREE.SphereGeometry(0.0034, 6, 4), P.gem, { at: [x, y, 0.1565] });
    }
  }

  // Outer gold lip along the key tips
  box(0.236, X1, 0.055, 0.485, Z0, 0.131, P.gold);

  // Pearl key cover strip on the bellows side, with gold nameplate.
  box(X0, 0.128, 0.055, 0.485, Z0, 0.152, P.pearlWhite);
  // gold edge lines on strip
  box(X0, 0.1115, 0.055, 0.485, 0.148, 0.1525, P.gold);
  box(0.1265, 0.128, 0.055, 0.485, 0.148, 0.1525, P.gold);

  // Nameplate
  const midY = 0.27;
  box(0.1135, 0.1245, midY - 0.034, midY + 0.034, 0.152, 0.1535, P.gold);
  for (const dy of [-0.016, 0, 0.016]) {
    box(0.1155, 0.1225, midY + dy - 0.0006, midY + dy + 0.0006, 0.1535, 0.154, P.keyBlack);
  }
  box(0.1135, 0.1245, midY - 0.034, midY - 0.0325, 0.1535, 0.1542, P.pleatCream);

  // Diamond inlay row either side of the nameplate
  const inlay = [P.pearlPink, P.pearlAqua, P.pearlLilac];
  let k = 0;
  const diamond = (y: number, color: string) => {
    const d = b.part(new THREE.BoxGeometry(0.0085, 0.0085, 0.0014), color, {
      at: [0.119, y, 0.1525],
      rotation: [0, 0, 45],
    });
    return d;
  };
  for (const side of [-1, 1]) {
    for (let i = 0; i < 7; i++) {
      const y = midY + side * (0.05 + i * 0.0305);
      if (y < 0.065 || y > 0.475) continue;
      diamond(y, inlay[k++ % 3]);
      b.part(new THREE.SphereGeometry(0.0013, 5, 3), P.gem, { at: [0.119, y, 0.1535] });
    }
  }

  // White keys: 24, key 0 (a C) at the bottom.
  const N = 24;
  const yStart = 0.062;
  const pitch = 0.42 / N;
  const keyW = pitch - 0.0012;
  const kx0 = 0.129;
  const kx1 = 0.2345;
  const kzTop = 0.142;
  for (let i = 0; i < N; i++) {
    const yc = yStart + (i + 0.5) * pitch;
    box(kx0, kx1, yc - keyW / 2, yc + keyW / 2, Z0 + 0.006, kzTop, P.keyIvory);
    // cream front lip (rounded-off tip look)
    box(kx1, 0.2365, yc - keyW / 2, yc + keyW / 2, Z0 + 0.006, kzTop - 0.003, P.pleatCream);
    // shaded back edge near the strip
    box(kx0, kx0 + 0.003, yc - keyW / 2, yc + keyW / 2, kzTop, kzTop + 0.0004, P.pleatCream);
    // marker gem on each C
    if (i % 7 === 0) {
      b.part(new THREE.SphereGeometry(0.0032, 6, 4), P.pearlPink, { at: [0.222, yc, kzTop] });
    }
  }

  // Black sharps in 2/3 grouping (after C D, F G A of each octave).
  const bw = 0.0098;
  for (let i = 0; i < N - 1; i++) {
    const n = i % 7;
    if (![0, 1, 3, 4, 5].includes(n)) continue;
    const yc = yStart + (i + 1) * pitch;
    const bx0 = 0.131;
    const bx1 = 0.19;
    box(bx0, bx1, yc - bw / 2, yc + bw / 2, kzTop, 0.1535, P.keyBlack);
    // sloped-looking front step
    box(bx1, bx1 + 0.004, yc - bw / 2 + 0.0004, yc + bw / 2 - 0.0004, kzTop, 0.1495, P.keyBlack);
    // chrome gloss strip on top
    box(bx0 + 0.005, bx1 - 0.004, yc - 0.0008, yc + 0.0008, 0.1535, 0.1539, P.chrome);
  }
}
    return buildKeyboard;
  })(),
  // bellows
  (() => {
function buildBellows({ b, J, P, M }: Ctx) {
  const YC = 0.26; // vertical centre of the bellows
  const X0 = -0.1;
  const X1 = 0.1;
  const FOLDS = 14;
  const STEP = (X1 - X0) / FOLDS;

  // ridge (wide) and valley (narrow) half sizes
  const RIDGE = { hz: 0.104, hy: 0.248 };
  const VALLEY = { hz: 0.088, hy: 0.23 };
  const prof = (k: number) => (k % 2 === 1 ? RIDGE : VALLEY);
  const xAt = (k: number) => X0 + k * STEP;

  // A frustum box along x with exact model-space vertices, flat shaded, outward winding fixed automatically.
  function frustumX(xa: number, xb: number, a: { hz: number; hy: number }, c: { hz: number; hy: number }) {
    const ring = (x: number, s: { hz: number; hy: number }) => [
      new THREE.Vector3(x, YC + s.hy, s.hz),
      new THREE.Vector3(x, YC + s.hy, -s.hz),
      new THREE.Vector3(x, YC - s.hy, -s.hz),
      new THREE.Vector3(x, YC - s.hy, s.hz),
    ];
    const A = ring(xa, a);
    const B = ring(xb, c);
    const centre = new THREE.Vector3((xa + xb) / 2, YC, 0);
    const tris: THREE.Vector3[][] = [];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      tris.push([A[i], A[j], B[j]], [A[i], B[j], B[i]]);
    }
    tris.push([A[0], A[1], A[2]], [A[0], A[2], A[3]], [B[0], B[1], B[2]], [B[0], B[2], B[3]]);
    const pos: number[] = [];
    for (const t of tris) {
      const n = new THREE.Vector3().subVectors(t[1], t[0]).cross(new THREE.Vector3().subVectors(t[2], t[0]));
      const cen = new THREE.Vector3().add(t[0]).add(t[1]).add(t[2]).multiplyScalar(1 / 3).sub(centre);
      const tri = n.dot(cen) < 0 ? [t[0], t[2], t[1]] : t;
      for (const v of tri) pos.push(v.x, v.y, v.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.computeVertexNormals();
    return g;
  }

  const box = (sx: number, sy: number, sz: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(sx, sy, sz), color, { at: [x, y, z] });

  // dark core so no gaps ever show between folds
  box(0.196, 0.43, 0.15, P.bellowsDark, 0, YC, 0);

  // the folds: alternate narrow -> wide and wide -> narrow, alternating red / dark
  for (let i = 0; i < FOLDS; i++) {
    const geo = frustumX(xAt(i), xAt(i + 1), prof(i), prof(i + 1));
    b.part(geo, i % 2 === 0 ? P.bellowsRed : P.bellowsDark, { at: [0, 0, 0] });
  }

  // end flanges (frame the bellows against the cabinets)
  for (const s of [1, -1]) {
    box(0.004, 0.462, 0.184, P.bellowsDark, s * 0.098, YC, 0);
    box(0.0015, 0.452, 0.004, P.gold, s * 0.0995, YC, 0.09);
    box(0.0015, 0.452, 0.004, P.gold, s * 0.0995, YC, -0.09);
  }

  // cream pleat lines on every ridge
  for (let k = 1; k < FOLDS; k += 2) {
    const x = xAt(k);
    const { hz, hy } = RIDGE;
    for (const sz of [1, -1]) box(0.003, 2 * hy - 0.05, 0.003, P.pleatCream, x, YC, sz * hz);
    for (const sy of [1, -1]) box(0.003, 0.003, 2 * hz - 0.052, P.pleatCream, x, YC + sy * hy, 0);
  }

  // gold corner guards stacked at the four corners, following the zig-zag profile
  const gemGeo = new THREE.SphereGeometry(0.0042, 6, 4);
  for (let k = 0; k <= FOLDS; k++) {
    const { hz, hy } = prof(k);
    const ridge = k % 2 === 1;
    const w = ridge ? 0.008 : 0.005;
    const x = Math.min(Math.max(xAt(k), X0 + w / 2 + 0.0005), X1 - w / 2 - 0.0005);
    for (const sy of [1, -1])
      for (const sz of [1, -1]) {
        const cy = YC + sy * (hy - 0.011);
        const cz = sz * (hz - 0.011);
        // L-shaped guard: corner block plus two short wings hugging the faces
        box(w, 0.026, 0.026, P.gold, x, cy, cz);
        if (ridge) {
          box(w - 0.002, 0.004, 0.034, P.gold, x, YC + sy * (hy + 0.0005), sz * (hz - 0.019));
          box(w - 0.002, 0.034, 0.004, P.gold, x, YC + sy * (hy - 0.019), sz * (hz + 0.0005));
          b.part(gemGeo, P.gem, { at: [x, cy, cz + sz * 0.0135] });
        }
      }
  }

  // strap-lock latch on the front, centred on the middle ridge (x = 0)
  const zf = RIDGE.hz; // front ridge surface
  const ly = YC + 0.06;
  // leather strap tabs
  for (const s of [1, -1]) {
    box(0.034, 0.02, 0.003, P.strap, s * 0.034, ly, zf + 0.0015);
    box(0.034, 0.0015, 0.0008, P.pleatCream, s * 0.034, ly + 0.0075, zf + 0.0034);
    box(0.034, 0.0015, 0.0008, P.pleatCream, s * 0.034, ly - 0.0075, zf + 0.0034);
  }
  // chrome base plate, lever and keeper
  box(0.034, 0.05, 0.003, P.chrome, 0, ly, zf + 0.0035);
  box(0.034, 0.003, 0.0045, P.gold, 0, ly + 0.0265, zf + 0.0035);
  box(0.034, 0.003, 0.0045, P.gold, 0, ly - 0.0265, zf + 0.0035);
  box(0.022, 0.034, 0.003, P.chrome, 0, ly + 0.002, zf + 0.0065);
  box(0.016, 0.026, 0.0012, P.pleatCream, 0, ly + 0.002, zf + 0.0079);
  // hinge pin
  b.part(new THREE.CylinderGeometry(0.0038, 0.0038, 0.03, 8), P.chrome, {
    at: [0, ly - 0.017, zf + 0.0075],
    dir: [1, 0, 0],
  });
  // gold keeper stud and rivets
  b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.003, 10), P.gold, {
    at: [0, ly + 0.014, zf + 0.0095],
    dir: [0, 0, 1],
  });
  b.part(gemGeo, P.gem, { at: [0, ly + 0.014, zf + 0.0115] });
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.SphereGeometry(0.0022, 5, 4), P.gold, {
        at: [sx * 0.0135, ly + sy * 0.0205, zf + 0.0052],
      });

  // small chrome rivet band on the back to echo the latch (a counter plate)
  box(0.03, 0.04, 0.003, P.chrome, 0, ly, -zf - 0.0035);
}
    return buildBellows;
  })(),
  // bassCabinet
  (() => {
type T3 = [number, number, number];
type Face = { o: THREE.Vector3; u: THREE.Vector3; v: THREE.Vector3; n: THREE.Vector3 };

function buildBassCabinet({ b, P }: { b: any; P: Record<string, string> }) {
  // ---------- colours ----------
  const WHITE = P.pearlWhite;
  const PINK = P.pearlPink;
  const AQUA = P.pearlAqua;
  const LILAC = P.pearlLilac;
  const GOLD = P.gold;
  const GEM = P.gem;
  const GRILLE = P.grilleDark;
  const INNER = P.bellowsDark;
  const HOLE = "#0b090e";
  const PEARLS = [PINK, AQUA, LILAC];

  // ---------- geometry bag: everything is merged per colour ----------
  const bag = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, geo: THREE.BufferGeometry, m: THREE.Matrix4) => {
    const g = geo.clone();
    g.applyMatrix4(m);
    let arr = bag.get(color);
    if (!arr) {
      arr = [];
      bag.set(color, arr);
    }
    arr.push(g);
  };

  // unit templates (axis of cylinders = local Z, so thickness runs along the face normal)
  const BOX = new THREE.BoxGeometry(1, 1, 1);
  const DIA = new THREE.CylinderGeometry(1, 1, 1, 4).rotateX(Math.PI / 2);
  const SPH = new THREE.SphereGeometry(1, 6, 4);
  const cylCache = new Map<number, THREE.BufferGeometry>();
  const cyl = (n: number) => {
    let g = cylCache.get(n);
    if (!g) {
      g = new THREE.CylinderGeometry(1, 1, 1, n, 1).rotateX(Math.PI / 2);
      cylCache.set(n, g);
    }
    return g;
  };
  const RING = new THREE.TorusGeometry(0.0128, 0.0017, 3, 12);

  const V = (a: T3) => new THREE.Vector3(a[0], a[1], a[2]);
  const mkFace = (o: T3, u: T3, v: T3): Face => ({ o: V(o), u: V(u), v: V(v), n: V(u).cross(V(v)) });

  // faces; q is absolute height on the side faces
  const front = mkFace([-0.175, 0, 0.117], [1, 0, 0], [0, 1, 0]);
  const end = mkFace([-0.247, 0, 0], [0, 0, 1], [0, 1, 0]);
  const back = mkFace([-0.175, 0, -0.117], [-1, 0, 0], [0, 1, 0]);
  const top = mkFace([-0.175, 0.517, 0], [1, 0, 0], [0, 0, -1]);
  const inner = mkFace([-0.103, 0, 0], [0, 0, -1], [0, 1, 0]);

  const place = (
    color: string,
    geo: THREE.BufferGeometry,
    f: Face,
    p: number,
    q: number,
    off: number,
    sx: number,
    sy: number,
    sz: number,
    rot = 0,
  ) => {
    const pos = f.o.clone().addScaledVector(f.u, p).addScaledVector(f.v, q).addScaledVector(f.n, off);
    const m = new THREE.Matrix4()
      .makeTranslation(pos.x, pos.y, pos.z)
      .multiply(new THREE.Matrix4().makeBasis(f.u, f.v, f.n))
      .multiply(new THREE.Matrix4().makeRotationZ((rot * Math.PI) / 180))
      .multiply(new THREE.Matrix4().makeScale(sx, sy, sz));
    put(color, geo, m);
  };
  const thin = (
    color: string,
    geo: THREE.BufferGeometry,
    f: Face,
    p: number,
    q: number,
    sx: number,
    sy: number,
    t: number,
    lift = 0,
    rot = 0,
  ) => place(color, geo, f, p, q, lift + t / 2 - 0.0003, sx, sy, t, rot);

  const diamond = (c: string, f: Face, p: number, q: number, hw: number, hh: number, t: number, lift = 0) =>
    thin(c, DIA, f, p, q, hw, hh, t, lift);
  const slab = (c: string, f: Face, p: number, q: number, w: number, h: number, t: number, lift = 0, rot = 0) =>
    thin(c, BOX, f, p, q, w, h, t, lift, rot);
  const disc = (c: string, f: Face, p: number, q: number, r: number, t: number, lift = 0, n = 8) =>
    thin(c, cyl(n), f, p, q, r, r, t, lift);
  const gemDot = (f: Face, p: number, q: number, r: number, lift = 0) =>
    place(GEM, SPH, f, p, q, lift, r, r, r * 0.7);
  const rect = (c: string, f: Face, p: number, q: number, w: number, h: number, bar: number, t: number, lift = 0) => {
    slab(c, f, p, q + h / 2 - bar / 2, w, bar, t, lift);
    slab(c, f, p, q - h / 2 + bar / 2, w, bar, t, lift);
    slab(c, f, p - w / 2 + bar / 2, q, bar, h - 2 * bar, t, lift);
    slab(c, f, p + w / 2 - bar / 2, q, bar, h - 2 * bar, t, lift);
  };
  const box = (c: string, cx: number, cy: number, cz: number, sx: number, sy: number, sz: number) =>
    put(c, BOX, new THREE.Matrix4().makeTranslation(cx, cy, cz).multiply(new THREE.Matrix4().makeScale(sx, sy, sz)));

  // ---------- carcass ----------
  b.part(new THREE.BoxGeometry(0.144, 0.514, 0.234), WHITE, { at: [-0.175, 0.26, 0], flat: true, name: "bassCabinetBody" });

  // gold plinth plate on the floor
  box(GOLD, -0.175, 0.0015, 0, 0.146, 0.003, 0.236);

  // gold edge frame: 12 bars flush with the box extents + corner knobs
  const X0 = -0.25, X1 = -0.1, Z0 = -0.12, Z1 = 0.12, H = 0.52, B = 0.008;
  for (const xe of [X0 + B / 2, X1 - B / 2])
    for (const ze of [Z0 + B / 2, Z1 - B / 2]) box(GOLD, xe, H / 2, ze, B, H, B);
  for (const ye of [B / 2, H - B / 2]) {
    for (const ze of [Z0 + B / 2, Z1 - B / 2]) box(GOLD, (X0 + X1) / 2, ye, ze, X1 - X0, B, B);
    for (const xe of [X0 + B / 2, X1 - B / 2]) box(GOLD, xe, ye, 0, B, B, Z1 - Z0);
  }
  for (const xe of [X0 + 0.0075, X1 - 0.0075])
    for (const ye of [0.0075, H - 0.0075])
      for (const ze of [Z0 + 0.0075, Z1 - 0.0075])
        put(GOLD, SPH, new THREE.Matrix4().makeTranslation(xe, ye, ze).multiply(new THREE.Matrix4().makeScale(0.0075, 0.0075, 0.0075)));

  // ---------- FRONT (+Z) ----------
  // perforated grille
  const gy = 0.43;
  slab(GRILLE, front, 0, gy, 0.124, 0.13, 0.002);
  rect(GOLD, front, 0, gy, 0.134, 0.14, 0.0035, 0.003);
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 5; c++) {
      const px = (c - 2) * 0.02 + (r % 2 ? 0.01 : -0.0) - 0.005;
      disc(HOLE, front, px, gy + (r - 2.5) * 0.019, 0.0042, 0.0012, 0.002, 6);
    }
  for (const sx of [-1, 1])
    for (const sy of [-1, 1]) gemDot(front, sx * 0.0675, gy + sy * 0.0705, 0.0028, 0.003);

  // pearl diamond strips above and below the button field
  slab(GOLD, front, 0, 0.352, 0.13, 0.0025, 0.0015);
  slab(GOLD, front, 0, 0.32, 0.13, 0.0025, 0.0015);
  for (let i = 0; i < 5; i++) {
    const px = (i - 2) * 0.024;
    diamond(PEARLS[i % 3], front, px, 0.336, 0.0125, 0.0105, 0.0022);
    diamond(WHITE, front, px, 0.336, 0.0055, 0.0045, 0.0014, 0.0022);
    if (i % 2 === 0) gemDot(front, px, 0.336, 0.0022, 0.0034);
  }
  for (let i = 0; i < 7; i++) {
    const px = (i - 3) * 0.018;
    diamond(PEARLS[(i + 1) % 3], front, px, 0.0225, 0.0085, 0.0085, 0.0022);
  }

  // button field
  slab(GRILLE, front, 0, 0.1725, 0.132, 0.272, 0.002);
  rect(GOLD, front, 0, 0.1725, 0.138, 0.278, 0.0035, 0.003);
  const gemButtons = new Set(["0,2", "2,2", "4,2", "5,0", "5,4"]);
  for (let i = 0; i < 6; i++)
    for (let k = 0; k < 5; k++) {
      const px = (k - 2) * 0.0215 + (i % 2 ? 0.005 : -0.005);
      const py = 0.062 + i * 0.0445;
      disc(WHITE, front, px, py, 0.0105, 0.005, 0.0015, 10);
      place(GOLD, RING, front, px, py, 0.0035, 1, 1, 1);
      if (gemButtons.has(`${i},${k}`)) gemDot(front, px, py, 0.0048, 0.0063);
      else place(k === 2 ? PINK : WHITE, SPH, front, px, py, 0.0063, 0.0085, 0.0085, 0.003);
    }

  // ---------- OUTER END (-X): harlequin pearl inlay ----------
  const ey = 0.26;
  rect(GOLD, end, 0, ey, 0.206, 0.484, 0.0045, 0.003);
  rect(GOLD, end, 0, ey, 0.19, 0.468, 0.0018, 0.0022);
  for (let k = 0; k < 17; k++) {
    const q = 0.06 + k * 0.025 + 0.0;
    const odd = k % 2 === 1;
    const ps = odd ? [-0.05, 0, 0.05] : [-0.075, -0.025, 0.025, 0.075];
    ps.forEach((p, c) => {
      diamond(PEARLS[(k + c) % 3], end, p, q, 0.0225, 0.0225, 0.0022);
      diamond(WHITE, end, p, q, 0.0105, 0.0105, 0.0014, 0.0022);
      if (odd && k % 4 === 1 && p === 0) gemDot(end, p, q, 0.0035, 0.0034);
    });
  }

  // ---------- BACK (-Z): chevron inlay ----------
  rect(GOLD, back, 0, ey, 0.13, 0.484, 0.0035, 0.003);
  for (let j = 0; j < 6; j++) {
    const y0 = 0.1 + j * 0.065;
    const col = PEARLS[j % 3];
    slab(col, back, -0.0215, y0 - 0.0117, 0.05, 0.014, 0.0025, 0, 28);
    slab(col, back, 0.0215, y0 - 0.0117, 0.05, 0.014, 0.0025, 0, -28);
    slab(WHITE, back, -0.0215, y0 - 0.0117, 0.036, 0.005, 0.0016, 0.0025, 28);
    slab(WHITE, back, 0.0215, y0 - 0.0117, 0.036, 0.005, 0.0016, 0.0025, -28);
    if (j % 2 === 0) gemDot(back, 0, y0 + 0.001, 0.0032, 0.0025);
  }

  // ---------- TOP (+Y) ----------
  rect(GOLD, top, 0, 0, 0.128, 0.218, 0.004, 0.003);
  for (let i = 0; i < 5; i++) {
    const q = (i - 2) * 0.04;
    diamond(PEARLS[i % 3], top, 0, q, 0.032, 0.02, 0.0022);
    diamond(WHITE, top, 0, q, 0.014, 0.009, 0.0014, 0.0022);
    if (i % 2 === 1) gemDot(top, 0, q, 0.003, 0.0034);
  }
  for (const sx of [-1, 1])
    for (let i = 0; i < 4; i++) {
      const q = (i - 1.5) * 0.04;
      diamond(PEARLS[(i + 1 + (sx > 0 ? 1 : 0)) % 3], top, sx * 0.048, q, 0.0155, 0.02, 0.0022);
    }

  // ---------- INNER FACE (+X): bellows seat ----------
  slab(INNER, inner, 0, ey, 0.2, 0.49, 0.003);
  rect(GOLD, inner, 0, ey, 0.21, 0.5, 0.004, 0.0032);

  // ---------- flush every colour as one flat-shaded part ----------
  for (const [color, geos] of bag) {
    const merged = mergeGeometries(geos);
    if (!merged) throw new Error("bassCabinet: could not merge " + color);
    b.part(merged, color, { at: [0, 0, 0], flat: true, name: "bassCabinet_" + color.replace("#", "") });
  }
}
    return buildBassCabinet;
  })(),
  // strapsAndFittings
  (() => {
function buildStrapsAndFittings({ b, P }: Ctx) {
  // ---- own colours (3) on top of the palette ----
  const PAD = "#7a4a2e"; // lighter padded leather
  const EDGE = "#2e1a12"; // burnished leather edge
  const STEEL = "#8f97a5"; // screw heads, embossed ridge

  // Everything of one colour is collected here and merged into one part per colour at the end.
  const bins: Record<string, THREE.BufferGeometry[]> = {
    gold: [],
    cream: [],
    dark: [],
    gem: [],
    leather: [],
    pad: [],
    chrome: [],
    steel: [],
    edge: [],
  };

  type Rot = [number, number, number];
  const place = (k: string, g: THREE.BufferGeometry, x: number, y: number, z: number, rot?: Rot) => {
    if (rot) {
      g.rotateX(rot[0]);
      g.rotateY(rot[1]);
      g.rotateZ(rot[2]);
    }
    g.translate(x, y, z);
    bins[k].push(g);
  };
  const box = (k: string, x: number, y: number, z: number, w: number, h: number, d: number, rot?: Rot) =>
    place(k, new THREE.BoxGeometry(w, h, d), x, y, z, rot);
  // cylinder with its axis along z (a rivet / screw head seen from the back)
  const cylZ = (k: string, x: number, y: number, z: number, r: number, len: number, seg = 8) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateX(Math.PI / 2);
    place(k, g, x, y, z);
  };
  // cylinder with its axis along x (a hinge pin)
  const cylX = (k: string, x: number, y: number, z: number, r: number, len: number, seg = 8) => {
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    g.rotateZ(Math.PI / 2);
    place(k, g, x, y, z);
  };
  const ball = (k: string, x: number, y: number, z: number, r: number) =>
    place(k, new THREE.SphereGeometry(r, 8, 6), x, y, z);
  const torus = (k: string, x: number, y: number, z: number, R: number, t: number, rot?: Rot) =>
    place(k, new THREE.TorusGeometry(R, t, 6, 14), x, y, z, rot);

  const BACK = -0.12; // back face of both cabinets
  const ZS = -0.1235; // leather strap centre (depth 0.007: -0.127 .. -0.120)

  // ---------- leather shoulder strap segment with edge piping, stitching and rivets ----------
  const strap = (x: number, y0: number, y1: number, w: number) => {
    const h = y1 - y0;
    const cy = (y0 + y1) / 2;
    box("leather", x, cy, ZS, w, h, 0.007);
    for (const s of [-1, 1]) {
      box("edge", x + s * (w / 2), cy, ZS, 0.0016, h, 0.0075);
      for (let y = y0 + 0.009; y <= y1 - 0.007; y += 0.014)
        box("cream", x + s * (w / 2 - 0.0048), y, -0.1277, 0.0016, 0.007, 0.0012);
    }
    cylZ("gold", x, y0 + 0.007, -0.1277, 0.0035, 0.003);
    cylZ("gold", x, y1 - 0.007, -0.1277, 0.0035, 0.003);
  };

  // ---------- gold buckle with gem, tongue and leather keeper ----------
  const buckle = (x: number, y: number, w: number) => {
    const W = w + 0.012;
    const H = 0.026;
    const z = -0.1295;
    box("gold", x, y + H / 2, z, W, 0.004, 0.004);
    box("gold", x, y - H / 2, z, W, 0.004, 0.004);
    for (const s of [-1, 1]) box("gold", x + s * (W / 2), y, z, 0.004, H + 0.004, 0.004);
    box("gold", x, y + 0.002, z - 0.0005, W, 0.0032, 0.0032); // middle bar
    box("gold", x, y - 0.004, -0.1327, 0.003, 0.02, 0.0025); // tongue
    ball("gem", x, y + H / 2, z - 0.0032, 0.0032);
    box("leather", x, y + H / 2 + 0.0085, -0.1238, w + 0.004, 0.008, 0.0105); // keeper loop
    box("edge", x, y + H / 2 + 0.0085, -0.1238, w + 0.0058, 0.0016, 0.0108);
  };

  // ---------- hanging tail of an adjustable strap, with holes and stitches ----------
  const tail = (x: number, yTop: number, yBottom: number) => {
    const z = -0.1297;
    const tipH = 0.014;
    box("leather", x, (yTop + yBottom + tipH) / 2, z, 0.03, yTop - yBottom - tipH, 0.005);
    box("leather", x, yBottom + 0.0095, z, 0.022, 0.0075, 0.005);
    box("leather", x, yBottom + 0.003, z, 0.012, 0.006, 0.005);
    for (const s of [-1, 1]) {
      box("edge", x + s * 0.015, (yTop + yBottom + tipH) / 2, z, 0.0014, yTop - yBottom - tipH, 0.0052);
      for (let y = yBottom + tipH + 0.003; y <= yTop - 0.012; y += 0.014)
        box("cream", x + s * 0.0105, y, -0.1324, 0.0014, 0.007, 0.0012);
    }
    for (let y = yBottom + tipH + 0.006; y <= yTop - 0.014; y += 0.013) cylZ("dark", x, y, -0.1324, 0.0022, 0.0014, 6);
  };

  // ---------- gold mounting plate with screws and gems at a strap end ----------
  const endPlate = (x: number, y: number) => {
    box("gold", x, y, -0.1225, 0.04, 0.015, 0.005);
    for (const s of [-1, 1]) cylZ("steel", x + s * 0.0165, y, -0.1259, 0.0021, 0.0014, 6);
    ball("gem", x, y, -0.1262, 0.0034);
    torus("gold", x, y, -0.1262, 0.0058, 0.0013, undefined);
  };

  // ---------- gold D-ring plate at the top of a shoulder strap ----------
  const topRing = (x: number) => {
    box("gold", x, 0.493, -0.1225, 0.04, 0.016, 0.005);
    for (const s of [-1, 1]) {
      ball("gem", x + s * 0.0165, 0.493, -0.1262, 0.003);
    }
    torus("gold", x, 0.504, -0.1325, 0.011, 0.0024, [-0.9, 0, 0]);
    box("leather", x, 0.481, -0.1278, 0.026, 0.026, 0.005, [-0.22, 0, 0]);
    box("edge", x - 0.013, 0.481, -0.1278, 0.0014, 0.026, 0.0052, [-0.22, 0, 0]);
    box("edge", x + 0.013, 0.481, -0.1278, 0.0014, 0.026, 0.0052, [-0.22, 0, 0]);
  };

  // ================= TREBLE SHOULDER STRAP (x = +0.18) =================
  {
    const x = 0.18;
    const w = 0.034;
    endPlate(x, 0.034);
    strap(x, 0.043, 0.468, w);
    topRing(x);
    buckle(x, 0.37, w);
    tail(x, 0.352, 0.245);
  }

  // ================= BASS SHOULDER STRAP (x = -0.18) =================
  {
    const x = -0.18;
    const w = 0.034;
    // lower tab with its plate and a gold clamp
    endPlate(x, 0.034);
    strap(x, 0.043, 0.118, w);
    box("gold", x, 0.121, -0.1278, w + 0.008, 0.007, 0.0075);
    box("edge", x, 0.1255, -0.1278, w + 0.008, 0.0014, 0.0078);
    ball("gem", x, 0.121, -0.1318, 0.0028);
    // upper strap with D-ring, buckle and a short free end
    strap(x, 0.335, 0.468, w);
    topRing(x);
    buckle(x, 0.352, w);
    tail(x, 0.34, 0.28);
  }

  // ================= BASS HAND STRAP (horizontal arch, gold slot plates) =================
  const hy = 0.215;
  const hand = catmull(
    [
      [-0.225, hy, -0.1245],
      [-0.225, hy, -0.132],
      [-0.215, hy, -0.1465],
      [-0.19, hy, -0.1535],
      [-0.16, hy, -0.1535],
      [-0.135, hy, -0.1465],
      [-0.125, hy, -0.132],
      [-0.125, hy, -0.1245],
    ],
  );
  for (const x of [-0.225, -0.125]) {
    box("gold", x, hy, -0.1225, 0.028, 0.048, 0.005);
    box("dark", x, hy, -0.1254, 0.013, 0.036, 0.0012);
    for (const s of [-1, 1]) cylZ("steel", x, hy + s * 0.0205, -0.1258, 0.0022, 0.0014, 6);
    for (const s of [-1, 1]) ball("gem", x + s * 0.0105, hy + s * 0.0, -0.1262, 0.0022);
  }
  b.sweep(hand, () => [0.004, 0.016], {
    color: P.strap,
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    name: "handStrap",
  });
  b.sweep(hand, () => [0.0056, 0.0185], {
    color: PAD,
    section: "box",
    up: [0, 1, 0],
    caps: "flat",
    from: 0.3,
    to: 0.7,
    name: "handPad",
  });
  {
    // stitching along both edges of the hand strap, riding the outward face
    const n = Math.floor(hand.length / 0.009);
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const p = hand.at(t);
      const T = hand.tangentAt(t);
      const a = Math.atan2(T.x, T.z);
      const out = new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
      const inPad = t > 0.3 && t < 0.7;
      const half = inPad ? 0.0056 : 0.004;
      for (const s of [-1, 1]) {
        const g = new THREE.BoxGeometry(0.0012, 0.0014, 0.005);
        g.rotateY(a);
        g.translate(
          p.x + out.x * (half + 0.0004),
          p.y + s * (inPad ? 0.0155 : 0.0125),
          p.z + out.z * (half + 0.0004),
        );
        bins.cream.push(g);
      }
    }
    // gold slider loops at the ends of the pad
    for (const t of [0.3, 0.7]) {
      const p = hand.at(t);
      const T = hand.tangentAt(t);
      const a = Math.atan2(T.x, T.z);
      const g = new THREE.BoxGeometry(0.0125, 0.039, 0.0035);
      g.rotateY(a);
      g.rotateY(Math.PI / 2);
      g.translate(p.x, p.y, p.z);
      bins.gold.push(g);
    }
  }

  // ================= CHROME BELLOWS STRAP (x = 0) with gold clasp =================
  {
    const CZ = -0.114;
    const CW = 0.03;
    const band = (y0: number, y1: number, ridge: boolean) => {
      const h = y1 - y0;
      const cy = (y0 + y1) / 2;
      box("chrome", 0, cy, CZ, CW, h, 0.008);
      for (const s of [-1, 1]) box("dark", s * (CW / 2), cy, CZ, 0.0014, h, 0.0082);
      if (ridge) box("steel", 0, cy, -0.1183, 0.006, h - 0.004, 0.0008);
    };
    band(0.325, 0.508, true);
    band(0.012, 0.285, false);
    // rivets on the upper band, pin holes on the lower tongue
    for (let y = 0.34; y < 0.5; y += 0.05) for (const s of [-1, 1]) cylZ("gold", s * 0.0095, y, -0.1186, 0.0027, 0.0016, 6);
    for (let y = 0.035; y < 0.2; y += 0.018) cylZ("dark", 0, y, -0.1182, 0.0023, 0.0012, 6);
    for (let y = 0.22; y < 0.28; y += 0.03) for (const s of [-1, 1]) cylZ("gold", s * 0.0095, y, -0.1186, 0.0027, 0.0016, 6);
    // lips folding over the top and bottom edges of the bellows
    box("chrome", 0, 0.5115, -0.1085, CW, 0.004, 0.026);
    box("chrome", 0, 0.0085, -0.1085, CW, 0.004, 0.026);
    // keeper loop on the tongue
    box("chrome", 0, 0.245, CZ, CW + 0.004, 0.007, 0.0105);
    box("dark", 0, 0.2415, CZ, CW + 0.0045, 0.0012, 0.0108);
    // gold clasp: base plate, hinge, lever, gem and hook
    box("gold", 0, 0.29, -0.1205, 0.038, 0.028, 0.005);
    box("gold", 0, 0.3205, -0.1232, 0.036, 0.03, 0.005);
    box("dark", 0, 0.3205, -0.1259, 0.026, 0.02, 0.0007);
    cylX("gold", 0, 0.3055, -0.1236, 0.0042, 0.04, 8);
    torus("gold", 0, 0.322, -0.1268, 0.0075, 0.0016);
    ball("gem", 0, 0.322, -0.1272, 0.0055);
    box("gold", 0, 0.274, -0.1245, 0.012, 0.01, 0.004); // latch hook
    for (const sx of [-1, 1])
      for (const y of [0.283, 0.335]) cylZ("steel", sx * 0.0145, y, -0.1264, 0.0019, 0.0012, 6);
  }

  // ================= MAKER'S PLAQUE on the treble back =================
  {
    const x = 0.225;
    const y = 0.26;
    box("gold", x, y, -0.121, 0.034, 0.02, 0.002);
    box("dark", x, y, -0.1221, 0.028, 0.014, 0.0008);
    box("cream", x, y + 0.004, -0.1227, 0.02, 0.0012, 0.0006);
    box("cream", x, y, -0.1227, 0.015, 0.0012, 0.0006);
    box("cream", x, y - 0.004, -0.1227, 0.02, 0.0012, 0.0006);
    for (const s of [-1, 1]) ball("gem", x + s * 0.0145, y + 0.0075, -0.1222, 0.0018);
  }

  // ================= GOLD FEET: corner caps wrapping the bottom edges =================
  for (const cx of [0.236, 0.114, -0.236, -0.114])
    for (const cz of [0.106, -0.106]) {
      box("gold", cx, 0.0056, cz, 0.034, 0.0116, 0.034);
      box("edge", cx, 0.0118, cz, 0.0345, 0.0008, 0.0345);
      cylZ("steel", cx, 0.0058, cz + (cz < 0 ? -0.0172 : 0.0172), 0.0022, 0.0012, 6);
    }
  // back-bottom gold rails
  for (const cx of [0.175, -0.175]) box("gold", cx, 0.014, -0.1213, 0.09, 0.005, 0.0026);

  // ---------- flush the merged parts ----------
  const colors: Record<string, string> = {
    gold: P.gold,
    cream: P.pleatCream,
    dark: P.grilleDark,
    gem: P.gem,
    leather: P.strap,
    pad: PAD,
    chrome: P.chrome,
    steel: STEEL,
    edge: EDGE,
  };
  for (const k of Object.keys(bins)) {
    if (!bins[k].length) continue;
    const merged = mergeGeometries(bins[k]);
    if (!merged) continue;
    b.part(merged, colors[k], { at: [0, 0, 0], name: `fittings.${k}`, flat: true });
  }
}
    return buildStrapsAndFittings;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "pianoAccordion" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
