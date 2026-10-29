import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Neon Rush Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet in synthwave style: near-black purple carcass with neon T-molding, side art of a striped sunset sun, perspective grid and palms, a glowing marquee, a CRT showing a neon-horizon racer, and an angled two-player control deck."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cabBlack: "#14091f",
  cabPurple: "#2a0f4a",
  panelIndigo: "#1c1040",
  deepViolet: "#3d1a78",
  bezelBlack: "#0c0714",
  voidBlack: "#07040d",
  neonPink: "#ff2ea6",
  neonCyan: "#2ff3ff",
  neonYellow: "#ffd23f",
  sunOrange: "#ff7a2f",
  sunMagenta: "#ff3d7f",
  horizonViolet: "#7a2cff",
  gridMagenta: "#d62cff",
  screenDark: "#0a0420",
  screenGlow: "#2b1a6e",
  chrome: "#c9c6dd",
  steel: "#6d6a85",
  white: "#f4eaff",
  buttonRed: "#ff3b4f",
  buttonBlue: "#3b7bff",
  buttonGreen: "#46ff9a",
  brassCoin: "#d9a441",
};
const M = {
  floorCentre: [0, 0, 0] as [number, number, number],
  sideFaceL: [0.35, 1, -0.05] as [number, number, number],
  sideFaceR: [-0.35, 1, -0.05] as [number, number, number],
  backFace: [0, 0.95, -0.44] as [number, number, number],
  lowerFront: [0, 0.52, 0.4] as [number, number, number],
  coinDoorCentre: [0, 0.5, 0.4] as [number, number, number],
  deckFrontEdge: [0, 0.96, 0.46] as [number, number, number],
  deckBackEdge: [0, 1.08, 0.22] as [number, number, number],
  deckCentre: [0, 1.02, 0.34] as [number, number, number],
  deckNormal: [0, 0.894, 0.447] as [number, number, number],
  joystickP1: [-0.24, 1.015, 0.35] as [number, number, number],
  joystickP2: [0.24, 1.015, 0.35] as [number, number, number],
  startButtons: [0, 1.05, 0.28] as [number, number, number],
  bezelBottom: [0, 1.08, 0.22] as [number, number, number],
  bezelTop: [0, 1.52, 0.19] as [number, number, number],
  screenCentre: [0, 1.3, 0.205] as [number, number, number],
  marqueeBottom: [0, 1.52, 0.245] as [number, number, number],
  marqueeFace: [0, 1.69, 0.245] as [number, number, number],
  topFace: [0, 1.86, -0.1] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // carcass
  (() => {
function buildCarcass({ b, J, P, M }: Ctx) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const neon = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    glow(box(w, h, d, c, x, y, z), 1.4);

  // side silhouette (z,y)
  const sil: [number, number][] = [
    [-0.44, 0.04], [0.40, 0.04], [0.40, 0.84], [0.46, 0.84], [0.46, 0.96], [0.22, 1.08],
    [0.22, 1.52], [0.245, 1.52], [0.245, 1.86], [-0.30, 1.86], [-0.44, 1.72],
  ];
  // inset border outline (shrunk toward centroid)
  const cx = 0, cy = 0.95;
  const inset = sil.map(([z, y]) => {
    const dz = z - cx, dy = y - cy, l = Math.hypot(dz, dy);
    return [z - (dz / l) * 0.02, y - (dy / l) * 0.02] as [number, number];
  });
  for (const s of [1, -1]) {
    // outline x = thickness axis; drawing x -> +Z, y up. x*y = thickness along -X for (0,0,1)x(0,1,0)
    const th = new THREE.Vector3(0, 0, 1).cross(new THREE.Vector3(0, 1, 0)).x; // -1
    const xc = s * 0.3375;
    b.extrude(sil.map(([z, y]) => [z, y] as [number, number]), {
      at: [xc, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: 0.025, color: P.cabBlack,
    });
    void th;
    // inset border: thin strips on outer face
    for (let i = 0; i < sil.length; i++) {
      const a = inset[i], c = inset[(i + 1) % sil.length];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
      const m = b.part(new THREE.BoxGeometry(0.004, 0.006, len), P.cabPurple, {
        at: [s * 0.3505, (a[1] + c[1]) / 2, (a[0] + c[0]) / 2],
        rotation: [-(ang * 180) / Math.PI, 0, 0],
      });
      void m;
    }
    // T-molding along edges
    const xm = s * 0.35;
    for (let i = 0; i < sil.length; i++) {
      const a = sil[i], c = sil[(i + 1) % sil.length];
      const len = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const ang = Math.atan2(c[1] - a[1], c[0] - a[0]);
      let col = P.neonCyan;
      const mz = (a[0] + c[0]) / 2, my = (a[1] + c[1]) / 2;
      if (my < 0.1 || mz < -0.3) col = P.neonPink;
      if (a[1] === 0.84 && c[1] === 0.84) col = P.neonYellow;
      if (a[0] === 0.46 && c[0] === 0.46) col = P.neonYellow;
      if (i === 5) col = P.neonYellow;
      glow(
        b.part(new THREE.BoxGeometry(0.008, 0.008, len), col, {
          at: [xm, my, mz], rotation: [-(ang * 180) / Math.PI, 0, 0],
        }),
        1.4,
      );
    }
  }

  // back panel
  box(0.65, 1.82, 0.025, P.cabBlack, 0, 0.95, -0.4275);
  // vent grille
  box(0.4, 0.3, 0.006, P.voidBlack, 0, 0.4, -0.443);
  for (let i = 0; i < 9; i++) box(0.38, 0.012, 0.008, P.cabPurple, 0, 0.28 + i * 0.03, -0.445);
  // access door outline
  const dz = -0.442;
  for (const [w, h, x, y] of [[0.4, 0.006, 0, 1.3], [0.4, 0.006, 0, 0.7], [0.006, 0.6, 0.2, 1.0], [0.006, 0.6, -0.2, 1.0]] as number[][])
    box(w, h, 0.004, P.cabPurple, x, y, dz);
  for (const x of [-0.18, 0.18]) for (const y of [0.72, 1.28]) {
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.006, 8), P.chrome, { at: [x, y, -0.444], dir: [0, 0, 1] });
  }
  // switch + power cord
  box(0.04, 0.06, 0.012, P.steel, 0.2, 0.2, -0.446);
  glow(box(0.014, 0.014, 0.006, P.buttonRed, 0.2, 0.215, -0.453), 1.2);
  box(0.03, 0.03, 0.012, P.voidBlack, -0.2, 0.2, -0.446);
  b.sweep([[-0.2, 0.2, -0.45], [-0.2, 0.12, -0.52], [-0.1, 0.06, -0.58], [0.0, 0.05, -0.62]], 0.008, { color: P.voidBlack });
  box(0.04, 0.03, 0.05, P.cabBlack, 0.0, 0.05, -0.65);
  box(0.012, 0.012, 0.03, P.chrome, -0.01, 0.05, -0.68);
  box(0.012, 0.012, 0.03, P.chrome, 0.01, 0.05, -0.68);

  // base slab
  box(0.65, 0.06, 0.82, P.cabBlack, 0, 0.07, -0.02);
  // feet
  for (const x of [-0.28, 0.28]) for (const z of [-0.36, 0.32]) {
    b.part(new THREE.CylinderGeometry(0.03, 0.035, 0.04, 8), P.steel, { at: [x, 0.02, z] });
    b.part(new THREE.CylinderGeometry(0.036, 0.036, 0.008, 6), P.chrome, { at: [x, 0.044, z] });
  }
  // lower front wall
  box(0.65, 0.8, 0.025, P.cabPurple, 0, 0.44, 0.3875);
  // kickplate
  box(0.65, 0.16, 0.02, P.cabBlack, 0, 0.12, 0.39 - 0.01 + 0.0);
  neon(0.65, 0.008, 0.008, P.neonCyan, 0, 0.198, 0.4);
  // deck support shelf
  box(0.65, 0.03, 0.2, P.panelIndigo, 0, 0.81, 0.28);
  box(0.65, 0.12, 0.02, P.cabPurple, 0, 0.9, 0.44);
  const dr = rng(3);
  for (let i = 0; i < 6; i++) {
    const x = -0.28 + i * 0.112 + dr() * 0.01;
    b.part(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6), P.chrome, { at: [x, 0.03 + 0.0, 0.0], dir: [0, 1, 0] });
  }
  // inner floor and spine behind monitor
  box(0.65, 1.0, 0.02, P.cabBlack, 0, 1.0, -0.2);
  box(0.65, 0.02, 0.6, P.cabBlack, 0, 0.1, -0.13);
}
    return buildCarcass;
  })(),
  // sideArt
  (() => {
function buildSideArt({ b, P }: any) {
  const r = rng(11);
  const SIL: [number, number][] = [[-0.44,0.04],[0.40,0.04],[0.40,0.84],[0.46,0.84],[0.46,0.96],[0.22,1.08],[0.22,1.52],[0.245,1.52],[0.245,1.86],[-0.30,1.86],[-0.44,1.72]];
  const M = 0.03;
  // side-view helper: outline in (z,y) -> extrude on the side face of sign s
  const flat = (pts: [number, number][], color: string, s: number, x0: number, th: number, g = 0) => {
    // outline x = z (model forward), y = y; viewed from the side
    const o = pts.map(([z, y]) => [z, y] as [number, number]);
    const part = b.extrude(o, { at: [s * x0, 0, 0], x: [0, 0, 1], y: [0, 1, 0], thickness: th, color });
    if (g) glow(part, g);
    return part;
  };
  const rect = (z0: number, z1: number, y0: number, y1: number): [number, number][] => [[z0,y0],[z1,y0],[z1,y1],[z0,y1]];
  const line = (z0: number, y0: number, z1: number, y1: number, w: number): [number, number][] => {
    const dz = z1 - z0, dy = y1 - y0, l = Math.hypot(dz, dy), nz = (-dy / l) * w / 2, ny = (dz / l) * w / 2;
    return [[z0 + nz, y0 + ny],[z1 + nz, y1 + ny],[z1 - nz, y1 - ny],[z0 - nz, y0 - ny]];
  };
  // back-of-panel safe box
  const zMin = -0.40, zMax = 0.38, yMin = 0.12, yMax = 1.80;
  const bands: [number, number, string][] = [
    [0.12, 0.40, P.cabBlack], [0.40, 0.62, P.panelIndigo], [0.62, 0.82, P.deepViolet],
    [0.82, 0.98, P.horizonViolet], [0.98, 1.3, P.deepViolet], [1.3, 1.55, P.panelIndigo], [1.55, 1.8, P.cabBlack],
  ];
  const zRange = (y: number): [number, number] => {
    let hi = 0.38;
    if (y > 0.84) hi = 0.2;
    if (y > 1.52) hi = 0.22;
    let lo = -0.40;
    if (y > 1.72 - 0.0) lo = -0.28;
    return [lo, hi];
  };
  for (const s of [1, -1]) {
    bands.forEach(([y0, y1, c], i) => {
      const y0c = y0, y1c = Math.min(y1, yMax);
      const [a0, b0] = zRange(y0c + 0.001), [a1, b1] = zRange(y1c - 0.001);
      const lo = Math.max(a0, a1), hi = Math.min(b0, b1);
      flat(rect(lo, hi, y0c, y1c), c, s, 0.3515 + 0, 0.002 + i * 0.0001);
    });
    const X = 0.3535;
    // sun
    const sc = [-0.05, 1.05], R = 0.26;
    const slices: [number, number, string][] = [
      [1.33, 1.31, P.neonYellow], [1.31, 1.22, P.neonYellow], [1.19, 1.12, P.sunOrange],
      [1.10, 1.05, P.sunOrange], [1.03, 0.99, P.sunMagenta], [0.97, 0.94, P.sunMagenta],
    ];
    const cut = (yTop: number, yBot: number, c: string) => {
      const pts: [number, number][] = [];
      const n = 12;
      const arc = (y: number) => Math.sqrt(Math.max(R * R - (y - sc[1]) ** 2, 0));
      for (let k = 0; k <= n; k++) { const y = yTop + (yBot - yTop) * k / n; pts.push([sc[0] + arc(y), y]); }
      for (let k = n; k >= 0; k--) { const y = yTop + (yBot - yTop) * k / n; pts.push([sc[0] - arc(y), y]); }
      const clean = pts.filter((p, i) => i === 0 || Math.hypot(p[0] - pts[i-1][0], p[1] - pts[i-1][1]) > 1e-4);
      flat(clean, c, s, X, 0.003, 1.2);
    };
    const top = 1.31;
    cut(top, 1.22, P.neonYellow);
    cut(1.20, 1.12, P.sunOrange);
    cut(1.10, 1.04, P.sunOrange);
    cut(1.02, 0.98, P.sunMagenta);
    cut(0.96, 0.93, P.sunMagenta);
    // grid
    for (let i = 0; i < 9; i++) {
      const zb = -0.38 + i * 0.095;
      const col = i % 2 ? P.neonCyan : P.gridMagenta;
      flat(line(sc[0] + (zb - sc[0]) * 0.1, 0.93, zb, 0.2, 0.004), col, s, X + 0.002, 0.002, 1);
    }
    for (let k = 0; k < 7; k++) {
      const y = 0.92 - 0.72 * Math.pow(k / 6, 1.7) * 0.95 - 0.0;
      flat(rect(-0.38, 0.36, y - 0.003, y + 0.003), k % 2 ? P.neonCyan : P.gridMagenta, s, X + 0.002, 0.002, 1);
    }
    // mountains
    const ridge = (pts: [number, number][], c: string, x: number) => {
      flat(pts, P.voidBlack, s, x, 0.002);
      for (let i = 0; i < pts.length - 3; i++) if (pts[i][1] > 0.93)
        flat(line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 0.004), c, s, x + 0.001, 0.002, 1);
    };
    ridge([[-0.38,0.93],[-0.32,1.08],[-0.26,1.0],[-0.2,1.18],[-0.12,0.98],[-0.08,0.93]], P.neonCyan, X + 0.003);
    ridge([[0.1,0.93],[0.17,1.04],[0.22,0.98],[0.28,1.12],[0.35,0.93]], P.neonCyan, X + 0.003);
    // palms
    for (const pz of [0.28, 0.12]) {
      flat(line(pz, 0.2, pz + 0.02, 0.55 + (pz < 0.2 ? -0.1 : 0), 0.018), P.voidBlack, s, X + 0.004, 0.002);
      const ty = pz < 0.2 ? 0.46 : 0.55, tz = pz + 0.02;
      for (let f = 0; f < 6; f++) {
        const a = -0.2 + f * 0.9;
        const dz = Math.cos(a) * 0.1, dy = Math.sin(a) * 0.08 - 0.02;
        flat([[tz, ty + 0.006],[tz + dz, ty + dy],[tz, ty - 0.006]], P.voidBlack, s, X + 0.004, 0.002);
      }
    }
    // stars
    for (let i = 0; i < 25; i++) {
      const z = -0.36 + r() * 0.5, y = 1.38 + r() * 0.38, d = 0.007 + r() * 0.006;
      if (y > 1.52 && z > 0.2) continue;
      flat([[z, y + d],[z + d, y],[z, y - d],[z - d, y]], i % 3 ? P.white : P.neonPink, s, X + 0.002, 0.002, 1.5);
    }
    // racing stripes
    flat(rect(-0.40, 0.38, 0.14, 0.158), P.neonPink, s, X + 0.002, 0.003, 1.3);
    flat(rect(-0.40, 0.38, 0.17, 0.182), P.neonCyan, s, X + 0.002, 0.003, 1.3);
  }
}
    return buildSideArt;
  })(),
  // controlDeck
  (() => {
function buildControlDeck({ b, J, P, M }: Ctx) {
  const FE = new THREE.Vector3(0, 0.96, 0.46);
  const BE = new THREE.Vector3(0, 1.08, 0.22);
  const N = new THREE.Vector3(0, 0.894, 0.447).normalize();
  const U = BE.clone().sub(FE).normalize(); // up-slope direction
  const L = BE.clone().sub(FE).length();
  const R = U.clone().cross(N).normalize(); // sideways axis (x-ish)
  const basis = new THREE.Matrix4().makeBasis(R.clone().negate(), N, U.clone().negate().cross(N).negate());
  const deckQ = new THREE.Quaternion().setFromRotationMatrix(basis);
  // deck-space point: u across x, v along slope (0 front..1 back), h along normal
  const dp = (x: number, v: number, h: number) =>
    new THREE.Vector3(x, 0, 0).add(FE).addScaledVector(U, v * L).addScaledVector(N, h);
  const box = (w: number, h: number, d: number, c: string, at: THREE.Vector3, q?: THREE.Quaternion, g = false) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at, quat: q });
    return g ? glow(p) : p;
  };
  const cyl = (rt: number, rb: number, h: number, seg: number, c: string, at: THREE.Vector3, g = false) => {
    const p = b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at, quat: deckQ });
    return g ? glow(p) : p;
  };
  const W = 0.325;

  // main sloped plate (box local Y = normal, Z = slope)
  box(2 * W, 0.03, L + 0.02, P.panelIndigo, dp(0, 0.5, -0.015), deckQ);
  // control overlay
  box(2 * W - 0.04, 0.004, L - 0.03, P.voidBlack, dp(0, 0.5, 0.002), deckQ);
  // underside wedge
  box(2 * W, 0.1, 0.2, P.cabBlack, new THREE.Vector3(0, 0.95, 0.3), undefined);
  // apron
  box(2 * W, 0.12, 0.03, P.cabBlack, new THREE.Vector3(0, 0.9, 0.445));
  box(2 * W, 0.01, 0.034, P.neonPink, new THREE.Vector3(0, 0.955, 0.447), undefined, true);
  box(2 * W, 0.01, 0.034, P.neonCyan, new THREE.Vector3(0, 0.845, 0.447), undefined, true);
  // front/back lip neon on the plate
  box(2 * W, 0.008, 0.008, P.neonPink, dp(0, 0.0, 0.004), deckQ, true);
  box(2 * W, 0.008, 0.008, P.neonCyan, dp(0, 1.0, 0.004), deckQ, true);

  // angled stripe graphics
  for (const s of [1, -1]) {
    const rot = deckQ.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), s * 0.5));
    box(0.012, 0.004, 0.2, P.neonPink, dp(s * 0.275, 0.5, 0.005), rot, true);
    box(0.008, 0.004, 0.2, P.neonCyan, dp(s * 0.29, 0.5, 0.005), rot, true);
  }

  // text marks as tiny bars
  const mark = (x: number, v: number, n: number) => {
    for (let i = 0; i < n; i++) box(0.01, 0.003, 0.004, P.white, dp(x + (i - (n - 1) / 2) * 0.014, v, 0.005), deckQ);
  };
  mark(-0.24, 0.8, 2);
  mark(0.24, 0.8, 2);
  mark(0, 0.62, 5);

  // joysticks
  for (const s of [-1, 1]) {
    const x = s * 0.24;
    const base = dp(x, 0.45, 0.004);
    cyl(0.04, 0.04, 0.008, 10, P.chrome, base);
    cyl(0.028, 0.034, 0.016, 10, P.steel, dp(x, 0.45, 0.014));
    cyl(0.006, 0.006, 0.07, 6, P.steel, dp(x, 0.45, 0.05));
    const ball = b.part(new THREE.SphereGeometry(0.02, 10, 8), s < 0 ? P.buttonRed : P.buttonBlue, {
      at: dp(x, 0.45, 0.09),
    });
    b.part(new THREE.SphereGeometry(0.004, 6, 4), P.white, { at: dp(x - 0.007, 0.45 + 0.02, 0.105) });
    void ball;
  }

  // buttons
  const cols: Record<number, string[]> = {
    [-1]: [P.buttonRed, P.neonYellow, P.buttonGreen],
    [1]: [P.buttonBlue, P.neonYellow, P.buttonGreen],
  };
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const x = s * (0.05 + i * 0.05) + s * 0.0;
      const xx = s * (0.1 + 0.05 * i) + (s < 0 ? -0.0 : 0);
      const v = 0.3 + (i % 2) * 0.12;
      void x;
      const p = dp(s * (0.12 + 0.05 * i) + s * 0.07 * 0 + (s > 0 ? 0.0 : 0), v, 0.004);
      p.x = s * (0.1 + i * 0.07) * (s < 0 ? 1 : 1) - 0 * xx;
      cyl(0.019, 0.019, 0.008, 10, P.bezelBlack, p);
      const cap = new THREE.Vector3().copy(p).addScaledVector(N, 0.008);
      cyl(0.014, 0.015, 0.012, 10, cols[s][i], cap, true);
      b.part(new THREE.SphereGeometry(0.003, 5, 4), P.white, {
        at: new THREE.Vector3().copy(cap).addScaledVector(N, 0.007).addScaledVector(U, 0.004),
      });
    }
  }

  // start buttons
  [[-0.04, P.neonCyan], [0.04, P.neonPink]].forEach(([x, c]) => {
    const p = dp(x as number, 0.72, 0.004);
    cyl(0.016, 0.016, 0.008, 8, P.bezelBlack, p);
    cyl(0.011, 0.012, 0.012, 8, c as string, new THREE.Vector3().copy(p).addScaledVector(N, 0.008), true);
  });

  // coin return
  box(0.05, 0.006, 0.03, P.brassCoin, dp(-0.12, 0.92, 0.004), deckQ);
  box(0.03, 0.007, 0.012, P.bezelBlack, dp(-0.12, 0.92, 0.006), deckQ);
  // medallion
  cyl(0.03, 0.03, 0.006, 10, P.chrome, dp(0.1, 0.9, 0.005));
  cyl(0.018, 0.018, 0.008, 10, P.neonPink, dp(0.1, 0.9, 0.007), true);

  // bolts at plate corners
  for (const sx of [-1, 1])
    for (const v of [0.06, 0.94]) cyl(0.007, 0.007, 0.005, 6, P.chrome, dp(sx * 0.3, v, 0.006));
}
    return buildControlDeck;
  })(),
  // monitorHead
  (() => {
function buildMonitorHead({ b, J, P, M }: Ctx) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, at: number[], g = 0, rot: number[] = [0, 0, 0]) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at, rotation: rot });
    if (g) glow(p, g);
    return p;
  };
  const TILT = -5; // bezel leans back (top toward -z)
  const tr = (5 * Math.PI) / 180;
  // point on bezel plane: u = x, v = height along the slope, n = out of the face
  const bz = (x: number, v: number, n = 0) => [
    x,
    1.08 + v * Math.cos(tr) + n * Math.sin(tr),
    0.22 - v * Math.sin(tr) + n * Math.cos(tr),
  ];
  const bezRot = [TILT, 0, 0];

  // bezel frame
  box(0.65, 0.44, 0.03, P.bezelBlack, bz(0, 0.22, 0), 0, bezRot);
  // screen layers
  const sc = (w: number, h: number, c: string, x: number, v: number, n: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, 0.004), c, { at: bz(x, v, n), rotation: bezRot });
    if (g) glow(p, g);
    return p;
  };
  const SV = 0.22, SN = 0.017;
  sc(0.56, 0.4, P.voidBlack, 0, SV, SN);
  sc(0.52, 0.36, P.cabPurple, 0, SV, SN + 0.003);
  // outline
  sc(0.53, 0.008, P.neonCyan, 0, SV + 0.18, SN + 0.006, 1);
  sc(0.53, 0.008, P.neonCyan, 0, SV - 0.18, SN + 0.006, 1);
  sc(0.008, 0.36, P.neonCyan, 0.265, SV, SN + 0.006, 1);
  sc(0.008, 0.36, P.neonCyan, -0.265, SV, SN + 0.006, 1);
  // glass base
  sc(0.5, 0.34, P.screenDark, 0, SV, SN + 0.007, 1);
  // sky bands
  const sky = [P.screenDark, "#1a0f55", P.screenGlow, "#4a2194", "#7a2cff"];
  sky.forEach((c, i) => sc(0.5, 0.034, c, 0, SV + 0.17 - i * 0.034 - 0.017 + 0.0, SN + 0.01, 1));
  // sun
  const sunC = [P.sunMagenta, P.sunMagenta, P.sunOrange, P.sunOrange, P.neonYellow];
  sunC.forEach((c, i) => sc(0.2 - Math.abs(i - 2) * 0.01 + (i === 0 ? 0 : 0), 0.026, c, 0, SV - 0.0 + 0.0 + (i - 2) * -0.03 + 0.03, SN + 0.014, 1.2));
  // mountains
  for (const [x, w, h] of [[-0.17, 0.16, 0.07], [-0.05, 0.12, 0.05], [0.14, 0.18, 0.08], [0.24, 0.1, 0.04]]) {
    const m = b.part(new THREE.ConeGeometry(w / 2, h, 4), P.horizonViolet, { at: bz(x, SV - 0.06 + h / 2 - 0.02, SN + 0.018), rotation: [TILT, 45, 0] });
    m.mesh.scale.z = 0.05;
    glow(m, 1);
  }
  // ground
  sc(0.5, 0.1, P.voidBlack, 0, SV - 0.12, SN + 0.016, 1);
  // road
  const road = b.part(new THREE.BoxGeometry(0.2, 0.1, 0.004), "#15103a", { at: bz(0, SV - 0.12, SN + 0.019), rotation: bezRot });
  glow(road, 1);
  // grid lines
  for (let i = 0; i < 4; i++) sc(0.5, 0.004, P.gridMagenta, 0, SV - 0.075 - i * i * 0.0055 - i * 0.012, SN + 0.021, 1.3);
  for (let i = -4; i <= 4; i++) {
    const p = b.part(new THREE.BoxGeometry(0.004, 0.1, 0.004), P.neonCyan, { at: bz(i * 0.055, SV - 0.12, SN + 0.021), rotation: [TILT, 0, i * -6] });
    glow(p, 1.2);
  }
  // car
  sc(0.05, 0.022, P.neonPink, 0, SV - 0.135, SN + 0.025, 1);
  sc(0.032, 0.014, P.neonCyan, 0, SV - 0.122, SN + 0.025, 1);
  for (const s of [1, -1]) sc(0.01, 0.008, P.buttonRed, s * 0.02, SV - 0.14, SN + 0.028, 2);
  // HUD
  for (let i = 0; i < 5; i++) {
    sc(0.012, 0.016, P.neonYellow, -0.22 + i * 0.016, SV + 0.15, SN + 0.025, 1);
    sc(0.012, 0.016, P.neonCyan, 0.14 + i * 0.016, SV + 0.15, SN + 0.025, 1);
  }
  sc(0.06, 0.006, P.neonYellow, -0.2, SV + 0.168, SN + 0.025, 1);
  sc(0.04, 0.006, P.neonCyan, 0.17, SV + 0.168, SN + 0.025, 1);
  for (let i = 0; i < 3; i++) sc(0.014, 0.01, P.neonPink, 0.2 - i * 0.02, SV - 0.165, SN + 0.025, 1);
  // glare
  sc(0.012, 0.09, P.white, 0.2, SV + 0.09, SN + 0.03, 0.8).mesh.rotation.z = 0.5;
  // bezel slashes
  for (const s of [1, -1]) {
    for (const [c, dx] of [[P.neonCyan, 0], [P.neonPink, 0.02]] as const) {
      const p = b.part(new THREE.BoxGeometry(0.012, 0.08, 0.004), c, { at: bz(s * (0.3 - dx * 0.5), 0.4 - dx, 0.016), rotation: [TILT, 0, s * 35] });
      glow(p, 1);
    }
  }
  // speaker slits
  for (const s of [1, -1]) for (let i = 0; i < 3; i++) box(0.04, 0.006, 0.004, P.voidBlack, bz(s * 0.3, 0.05 + i * 0.012, 0.017), 0, bezRot);

  // marquee box
  box(0.65, 0.34, 0.66, P.cabBlack, [0, 1.69, -0.085]);
  box(0.64, 0.02, 0.66, P.cabPurple, [0, 1.85, -0.085]);
  box(0.62, 0.006, 0.02, P.neonYellow, [0, 1.855, 0.24], 1.3);
  // front panel
  box(0.6, 0.3, 0.006, P.panelIndigo, [0, 1.69, 0.247], 0.6);
  // border tubes
  for (const [w, h, c, o] of [[0.6, 0.3, P.neonPink, 0], [0.57, 0.27, P.neonCyan, 0]] as const) {
    box(w, 0.008, 0.008, c, [0, 1.69 + h / 2, 0.252], 1.4);
    box(w, 0.008, 0.008, c, [0, 1.69 - h / 2, 0.252], 1.4);
    box(0.008, h, 0.008, c, [w / 2, 1.69, 0.252], 1.4);
    box(0.008, h, 0.008, c, [-w / 2, 1.69, 0.252], 1.4);
  }
  // title NEON RUSH blocky letters
  const letters: Record<string, string[]> = {
    N: ["X.X", "XXX", "XXX", "X.X", "X.X"], E: ["XXX", "X..", "XXX", "X..", "XXX"],
    O: ["XXX", "X.X", "X.X", "X.X", "XXX"], R: ["XX.", "X.X", "XX.", "X.X", "X.X"],
    U: ["X.X", "X.X", "X.X", "X.X", "XXX"], S: ["XXX", "X..", "XXX", "..X", "XXX"],
    H: ["X.X", "X.X", "XXX", "X.X", "X.X"],
  };
  const cell = 0.0092, text = "NEON RUSH";
  const total = text.length * 4 * cell - cell;
  let x0 = -total / 2;
  for (const ch of text) {
    const g = letters[ch];
    if (g) g.forEach((row, ry) => [...row].forEach((v, rx) => {
      if (v !== "X") return;
      const x = x0 + rx * cell, y = 1.69 + 0.0 + (2 - ry) * cell * 1.3;
      box(cell * 1.5, cell * 1.8, 0.004, P.neonCyan, [x, y, 0.2515], 1);
      box(cell * 1.1, cell * 1.4, 0.004, P.neonPink, [x, y, 0.2545], 1.5);
    }));
    x0 += 4 * cell;
  }
  // emblems
  for (const s of [1, -1]) {
    const e = b.part(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 10), P.neonYellow, { at: [s * 0.255, 1.7, 0.251], rotation: [90, 0, 0] });
    glow(e, 1.2);
    box(0.08, 0.005, 0.004, P.sunOrange, [s * 0.255, 1.69, 0.2535], 1);
    for (let i = 0; i < 3; i++) box(0.09, 0.003, 0.004, P.neonCyan, [s * 0.255, 1.63 + i * 0.012, 0.2515], 1);
  }
  // chaser dots
  for (let i = 0; i < 16; i++) {
    const x = -0.285 + i * (0.57 / 15);
    box(0.008, 0.008, 0.006, i % 2 ? P.neonYellow : P.neonPink, [x, 1.835, 0.25], 1.5);
    box(0.008, 0.008, 0.006, i % 2 ? P.neonPink : P.neonYellow, [x, 1.545, 0.25], 1.5);
  }
  // marquee underside lip
  box(0.65, 0.01, 0.03, P.cabPurple, [0, 1.525, 0.23]);
}
    return buildMonitorHead;
  })(),
  // coinDoor
  (() => {
function buildCoinDoor({ b, J, P, M }: Ctx) {
  const Z0 = 0.4;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = 0) => {
    const part = b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, Z0 + z] });
    if (g) glow(part, g);
    return part;
  };
  const cyl = (r: number, h: number, color: string, x: number, y: number, z: number, seg = 8, g = 0, rt = r) => {
    const part = b.part(new THREE.CylinderGeometry(rt, r, h, seg), color, { at: [x, y, Z0 + z], dir: [0, 0, 1] });
    if (g) glow(part, g);
    return part;
  };
  const cx = 0, cy = 0.5;

  // Door plate, frame
  box(0.3, 0.38, 0.008, P.steel, cx, cy, 0.004);
  box(0.28, 0.36, 0.006, P.voidBlack, cx, cy, 0.011);
  // frame edges chrome
  box(0.3, 0.012, 0.012, P.chrome, cx, cy + 0.184, 0.008);
  box(0.3, 0.012, 0.012, P.chrome, cx, cy - 0.184, 0.008);
  box(0.012, 0.38, 0.012, P.chrome, cx - 0.144, cy, 0.008);
  box(0.012, 0.38, 0.012, P.chrome, cx + 0.144, cy, 0.008);
  // corner screws
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
    cyl(0.01, 0.006, P.chrome, sx * 0.125, cy + sy * 0.16, 0.017, 8);
    box(0.012, 0.002, 0.002, P.voidBlack, sx * 0.125, cy + sy * 0.16, 0.021);
  }
  // lock
  cyl(0.026, 0.01, P.steel, cx, cy - 0.12, 0.016, 10);
  cyl(0.02, 0.008, P.brassCoin, cx, cy - 0.12, 0.02, 10);
  box(0.004, 0.014, 0.004, P.voidBlack, cx, cy - 0.12, 0.025);
  cyl(0.004, 0.004, P.voidBlack, cx, cy - 0.108, 0.025, 6);

  // coin mechs
  for (const s of [-1, 1]) {
    const x = s * 0.065;
    box(0.09, 0.15, 0.014, P.steel, x, cy + 0.05, 0.02);
    box(0.07, 0.12, 0.006, P.chrome, x, cy + 0.055, 0.026);
    box(0.012, 0.05, 0.004, P.voidBlack, x, cy + 0.085, 0.03);
    box(0.03, 0.012, 0.006, P.bezelBlack, x, cy + 0.02, 0.03);
    // lit insert-coin bar
    box(0.05, 0.012, 0.006, P.buttonRed, x, cy - 0.015, 0.031, 1.4);
    // coin return
    box(0.05, 0.03, 0.008, P.steel, x, cy - 0.065, 0.027);
    box(0.036, 0.018, 0.004, P.voidBlack, x, cy - 0.065, 0.032);
    box(0.04, 0.005, 0.006, P.chrome, x, cy - 0.052, 0.034);
  }
  // credit counter
  box(0.07, 0.026, 0.005, P.bezelBlack, cx, cy + 0.145, 0.016);
  const digits = [1, 0, 1, 1, 0, 1, 1, 1, 0];
  for (let i = 0; i < 4; i++) {
    const x = -0.024 + i * 0.016;
    box(0.009, 0.002, 0.002, P.neonYellow, x, cy + 0.152, 0.02, 1.2);
    box(0.009, 0.002, 0.002, P.neonYellow, x, cy + 0.138, 0.02, 1.2);
    box(0.002, 0.016, 0.002, P.neonYellow, x + (digits[i] ? 0.0035 : -0.0035), cy + 0.145, 0.02, 1.2);
  }

  // top INSERT COIN strip
  const sy = 0.77;
  box(0.4, 0.06, 0.012, P.cabBlack, cx, sy, 0.006);
  box(0.3, 0.02, 0.006, P.neonCyan, cx, sy, 0.015, 1.5);
  for (let i = 0; i < 8; i++) box(0.012, 0.012, 0.004, P.cabBlack, -0.12 + i * 0.034, sy, 0.019);
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const t = b.part(new THREE.ConeGeometry(0.014, 0.014, 3), P.neonPink, {
      at: [s * (0.17 + k * 0.016), sy, Z0 + 0.015], dir: [s, 0, 0], axis: "y",
    });
    glow(t, 1.4);
  }
  box(0.4, 0.004, 0.014, P.neonCyan, cx, sy + 0.032, 0.006, 1.2);
  box(0.4, 0.004, 0.014, P.neonCyan, cx, sy - 0.032, 0.006, 1.2);

  // side vent grilles
  for (const s of [-1, 1]) {
    const x = s * 0.255;
    box(0.1, 0.34, 0.01, P.steel, x, 0.42, 0.005);
    box(0.088, 0.32, 0.006, P.voidBlack, x, 0.42, 0.011);
    for (let i = 0; i < 9; i++) box(0.082, 0.01, 0.006, P.cabPurple, x, 0.275 + i * 0.035, 0.016);
    // handle pulls
    box(0.012, 0.012, 0.02, P.chrome, x - 0.03, 0.62, 0.02);
    box(0.012, 0.012, 0.02, P.chrome, x + 0.03, 0.62, 0.02);
    box(0.08, 0.01, 0.01, P.chrome, x, 0.62, 0.032);
  }

  // sticker: pink sun and grid
  box(0.07, 0.07, 0.003, P.voidBlack, -0.2, 0.3, 0.0015);
  const sun = b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.003, 10), P.neonPink, { at: [-0.2, 0.315, Z0 + 0.004], dir: [0, 0, 1] });
  glow(sun, 1.2);
  for (let i = 0; i < 3; i++) box(0.06, 0.002, 0.002, P.neonCyan, -0.2, 0.28 + i * 0.01 - 0.005, 0.0045, 1);
  for (let i = -2; i <= 2; i++) box(0.002, 0.025, 0.002, P.neonCyan, -0.2 + i * 0.012, 0.283, 0.0045, 1);

  // underglow
  box(0.64, 0.01, 0.012, P.neonPink, 0, 0.215, 0.006, 1.6);
  box(0.64, 0.006, 0.01, P.neonCyan, 0, 0.2, 0.005, 1.4);
}
    return buildCoinDoor;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "neonRushArcadeCabinet" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
