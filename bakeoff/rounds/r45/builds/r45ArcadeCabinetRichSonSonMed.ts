import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng, aim, polyline } from "../../../../src/index";
import { glow } from "../../../../kits/glow";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const meta = {
  "name": "Neon Drive '84 Arcade Cabinet",
  "description": "A 1980s upright arcade cabinet in synthwave style: a near-black purple body with magenta and cyan neon T-molding, a glowing retro-sunset screen, a backlit NEON DRIVE marquee, a two-player control deck, and perspective-grid, striped-sun and mountain side art."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  cabBlack: "#14081f",
  cabNavy: "#241046",
  panelPurple: "#3a1470",
  black: "#07040d",
  rubber: "#101018",
  darkSteel: "#2a2d3f",
  steel: "#6d7490",
  chrome: "#c9d3e6",
  neonMagenta: "#ff2bd6",
  neonCyan: "#2ff3ff",
  neonPink: "#ff6ec7",
  neonViolet: "#9d4dff",
  sunOrange: "#ff9a3c",
  sunYellow: "#ffe14d",
  coinGlow: "#ffb02e",
  screenGlass: "#0b1230",
  white: "#fff5ff",
  buttonRed: "#ff3355",
  buttonYellow: "#ffd23a",
  buttonBlue: "#3a7bff",
  buttonGreen: "#37f2a0",
  woodDark: "#3b2a4a",
};
const M = {
  plinthFront: [0, 0.1, 0.34] as [number, number, number],
  bodyFront: [0, 0.5, 0.44] as [number, number, number],
  coinDoor: [0, 0.54, 0.44] as [number, number, number],
  bodyTop: [0, 0.86, 0] as [number, number, number],
  deckBack: [0, 1.06, 0.3] as [number, number, number],
  deckFront: [0, 0.98, 0.52] as [number, number, number],
  deckSlopeCenter: [0, 1.02, 0.41] as [number, number, number],
  bezelBottom: [0, 1.06, 0.3] as [number, number, number],
  bezelTop: [0, 1.5, 0.2] as [number, number, number],
  screenCenter: [0, 1.28, 0.25] as [number, number, number],
  marqueeBottom: [0, 1.5, 0] as [number, number, number],
  marqueeFront: [0, 1.66, 0.26] as [number, number, number],
  marqueeTop: [0, 1.8, 0] as [number, number, number],
  backPlane: [0, 0.9, -0.44] as [number, number, number],
  sideOuterLeft: [0.35, 0.9, 0] as [number, number, number],
  sideOuterRight: [-0.35, 0.9, 0] as [number, number, number],
  moldingLeft: [0.356, 0.9, 0] as [number, number, number],
  moldingRight: [-0.356, 0.9, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // lowerBody
  (() => {
function buildLowerBody({ b, J, P, M }: any) {
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (r: number, len: number, color: string, at: number[], dir: number[], seg = 10, g = 0) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, dir });
    if (g) glow(p, g);
    return p;
  };

  // Plinth
  box(0.64, 0.1, 0.78, P.black, 0, 0.05, -0.05);
  box(0.5, 0.012, 0.004, P.neonMagenta, 0, 0.04, 0.337, 1.4);
  box(0.64, 0.004, 0.004, P.cabNavy, 0, 0.098, 0.341);

  // Carcass
  for (const s of [1, -1]) box(0.03, 0.76, 0.88, P.cabBlack, s * 0.335, 0.48, 0);
  box(0.64, 0.76, 0.03, P.cabBlack, 0, 0.48, 0.425); // front
  box(0.64, 0.76, 0.03, P.cabBlack, 0, 0.48, -0.425); // back
  box(0.64, 0.01, 0.86, P.cabNavy, 0, 0.855, 0); // top
  box(0.64, 0.02, 0.86, P.cabNavy, 0, 0.11, 0); // bottom shelf

  // Front panel details
  const fz = 0.442;
  box(0.6, 0.008, 0.004, P.panelPurple, 0, 0.74, fz); // trim strip
  box(0.6, 0.006, 0.004, P.neonViolet, 0, 0.3, fz, 0.8);
  // cash-box flap line
  box(0.5, 0.004, 0.003, P.black, 0, 0.2, fz);
  box(0.5, 0.18, 0.004, P.cabNavy, 0, 0.16, fz - 0.001);
  // lower vent grille
  box(0.2, 0.07, 0.004, P.black, 0, 0.2, fz + 0.001);
  for (let i = 0; i < 6; i++) box(0.18, 0.005, 0.004, P.neonViolet, 0, 0.175 + i * 0.01, fz + 0.003, 0.9);

  // Coin door
  const cz = M.coinDoor[2] + 0.004;
  box(0.34, 0.32, 0.01, P.darkSteel, 0, 0.54, cz);
  // glowing rim
  box(0.35, 0.006, 0.004, P.coinGlow, 0, 0.705, cz + 0.004, 1);
  box(0.35, 0.006, 0.004, P.coinGlow, 0, 0.375, cz + 0.004, 1);
  box(0.006, 0.33, 0.004, P.coinGlow, 0.173, 0.54, cz + 0.004, 1);
  box(0.006, 0.33, 0.004, P.coinGlow, -0.173, 0.54, cz + 0.004, 1);
  for (const s of [1, -1]) {
    const x = s * 0.075;
    box(0.1, 0.12, 0.02, P.chrome, x, 0.60, cz + 0.014);
    box(0.012, 0.05, 0.006, P.coinGlow, x, 0.615, cz + 0.026, 1.5);
    box(0.06, 0.012, 0.004, P.black, x, 0.57, cz + 0.025);
    // return flap
    box(0.09, 0.07, 0.012, P.steel, x, 0.48, cz + 0.01);
    box(0.07, 0.04, 0.004, P.black, x, 0.48, cz + 0.017);
    box(0.06, 0.014, 0.004, P.neonCyan, x, 0.655, cz + 0.026, 1);
    // coin button
    box(0.034, 0.034, 0.012, P.neonCyan, s * 0.225, 0.54, fz + 0.004, 1.3);
    box(0.044, 0.044, 0.006, P.rubber, s * 0.225, 0.54, fz + 0.001);
  }
  cyl(0.02, 0.02, P.chrome, [0, 0.43, cz + 0.014], [0, 0, 1], 10);
  box(0.004, 0.02, 0.004, P.black, 0, 0.43, cz + 0.026);
  for (const sx of [1, -1])
    for (const sy of [1, -1]) cyl(0.006, 0.008, P.chrome, [sx * 0.155, 0.54 + sy * 0.145, cz + 0.008], [0, 0, 1], 6);

  // INSERT COIN sign
  box(0.3, 0.07, 0.01, P.black, 0, 0.78, fz + 0.004);
  box(0.26, 0.028, 0.006, P.neonPink, 0, 0.78, fz + 0.011, 1.5);
  box(0.28, 0.004, 0.004, P.chrome, 0, 0.82, fz + 0.01);
  box(0.28, 0.004, 0.004, P.chrome, 0, 0.74, fz + 0.01);

  // Rear service door
  const bz = -0.442;
  box(0.46, 0.56, 0.012, P.black, 0, 0.48, bz + 0.002);
  box(0.42, 0.52, 0.01, P.darkSteel, 0, 0.48, bz - 0.004);
  cyl(0.018, 0.012, P.chrome, [0.12, 0.5, bz - 0.014], [0, 0, 1], 10);
  box(0.004, 0.022, 0.004, P.black, 0.12, 0.5, bz - 0.021);
  for (const y of [0.3, 0.66]) cyl(0.008, 0.03, P.chrome, [-0.2, y, bz - 0.012], [0, 1, 0], 6);
  for (let i = 0; i < 8; i++) box(0.22, 0.008, 0.006, P.black, -0.04, 0.56 + i * 0.016, bz - 0.011);
  cyl(0.05, 0.008, P.black, [0.08, 0.36, bz - 0.011], [0, 0, 1], 14);
  cyl(0.04, 0.006, P.darkSteel, [0.08, 0.36, bz - 0.015], [0, 0, 1], 8);
  for (let i = 0; i < 3; i++) box(0.07, 0.004, 0.003, P.black, 0.08, 0.35 + i * 0.012, bz - 0.019);
  box(0.09, 0.06, 0.004, P.sunYellow, -0.1, 0.36, bz - 0.011);
  box(0.06, 0.006, 0.003, P.black, -0.1, 0.375, bz - 0.014);
  box(0.06, 0.006, 0.003, P.black, -0.1, 0.355, bz - 0.014);
  // power cord entry
  box(0.05, 0.04, 0.012, P.black, -0.2, 0.2, bz - 0.001);
  const cord = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.2, bz - 0.01),
    new THREE.Vector3(-0.2, 0.16, bz - 0.05),
    new THREE.Vector3(-0.15, 0.1, bz - 0.07),
    new THREE.Vector3(-0.08, 0.14, bz - 0.06),
  ]);
  b.part(new THREE.TubeGeometry(cord, 12, 0.008, 6), P.rubber, { at: [0, 0, 0], bone: J && J.body ? J.body : undefined });
}
    return buildLowerBody;
  })(),
  // controlDeck
  (() => {
function buildControlDeck({ b, P }: any) {
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  // Deck slope: back (z .30, y 1.06) down to front lip (z .52, y .98)
  const Z0 = 0.3, Y0 = 1.06, DZ = 0.22, DY = -0.08;
  const N = V(0, 0.22, 0.08).normalize(); // plate normal (up/forward)
  const pl = (x: number, u: number, h = 0) =>
    V(x, Y0 + DY * u, Z0 + DZ * u).addScaledVector(N, h);
  const Q = aim(N);
  const flat = (geo: THREE.BufferGeometry, color: string, x: number, u: number, h: number, ang = 0, g = 0) => {
    const q = Q.clone().multiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), (ang * Math.PI) / 180));
    const p = b.part(geo, color, { at: pl(x, u, h), quat: q });
    if (g > 0) glow(p, g);
    return p;
  };
  const box = (w: number, t: number, d: number) => new THREE.BoxGeometry(w, t, d);

  // ---- Cheeks (cabBlack)
  const outline: any = [[0.3, 0.86], [0.52, 0.86], [0.52, 0.98], [0.3, 1.06]];
  for (const s of [1, -1]) {
    b.extrude(outline, { at: [s * 0.335, 0, 0], x: [0, 0, 1], thickness: 0.03, color: P.cabBlack });
    // small chrome screw on each cheek
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.004, 8), P.chrome, {
      at: [s * 0.3515, 0.92, 0.46], dir: [s, 0, 0],
    });
  }

  // ---- Control plate (panelPurple) sits just under the surface
  b.part(box(0.64, 0.02, 0.236), P.panelPurple, { at: pl(0, 0.5, -0.01), quat: Q });
  // under-fill so the wedge reads as solid
  b.part(box(0.64, 0.1, 0.02), P.cabNavy, { at: [0, 0.92, 0.5], });
  // woodDark underlip on the front face
  b.part(box(0.64, 0.05, 0.012), P.woodDark, { at: [0, 0.915, 0.526] });
  b.part(box(0.64, 0.004, 0.014), P.black, { at: [0, 0.888, 0.526] });
  // chrome front lip bar
  b.rod([-0.32, 0.984, 0.512], [0.32, 0.984, 0.512], 0.011, P.chrome);
  for (let i = 0; i < 6; i++) {
    const x = -0.27 + i * 0.108;
    b.part(new THREE.SphereGeometry(0.0045, 6, 4), P.steel, { at: [x, 0.973, 0.527] });
  }

  // ---- Inset overlay + neon grid
  flat(box(0.6, 0.003, 0.17), P.cabNavy, 0, 0.45, 0.001);
  for (let i = 0; i <= 12; i++) {
    const x = -0.28 + i * (0.56 / 12);
    glow(
      b.part(box(0.0016, 0.0014, 0.168), P.neonMagenta, {
        at: pl(x, 0.45, 0.0032), quat: Q,
      }),
      0.6,
    );
  }
  for (let i = 0; i < 5; i++) {
    const u = 0.08 + i * 0.2;
    glow(
      b.part(box(0.56, 0.0014, 0.0016), P.neonMagenta, { at: pl(0, u, 0.0032), quat: Q }),
      0.6,
    );
  }
  // inset border
  for (const s of [1, -1]) {
    flat(box(0.004, 0.003, 0.172), P.neonViolet, s * 0.302, 0.45, 0.002, 0, 0.8);
  }

  // sunset stripes along the front
  const stripes = [P.sunOrange, P.neonPink, P.neonViolet];
  stripes.forEach((c, i) => flat(box(0.6, 0.003, 0.012), c, 0, 0.84 + i * 0.058, 0.0025, 0, 1));

  // chevrons (cyan) in the centre, between the clusters
  for (let k = 0; k < 2; k++) {
    for (const s of [1, -1]) {
      flat(box(0.03, 0.003, 0.006), P.neonCyan, s * 0.0125, 0.6 + k * 0.1, 0.003, s * 35, 1);
    }
  }
  // star decals (crossed slabs)
  for (const [x, u] of [[-0.2, 0.17], [0.2, 0.17], [-0.2, 0.74], [0.2, 0.74], [0, 0.34]] as number[][]) {
    flat(box(0.02, 0.003, 0.0035), P.sunYellow, x, u, 0.003, 0, 1);
    flat(box(0.02, 0.003, 0.0035), P.sunYellow, x, u, 0.003, 90, 1);
    flat(box(0.012, 0.003, 0.0025), P.white, x, u, 0.0035, 45, 1);
    flat(box(0.012, 0.003, 0.0025), P.white, x, u, 0.0035, -45, 1);
  }

  // neon edge line where plate meets bezel
  glow(b.rod([-0.315, Y0 + 0.004, Z0 + 0.002], [0.315, Y0 + 0.004, Z0 + 0.002], 0.004, P.neonMagenta), 1.4);
  // violet side edge lines
  for (const s of [1, -1]) {
    glow(b.rod(pl(s * 0.318, 0.02, 0.003), pl(s * 0.318, 0.98, 0.003), 0.003, P.neonCyan), 1.1);
  }

  // ---- Joysticks
  const U_STICK = 0.4545;
  for (const s of [-1, 1]) {
    const ball = s < 0 ? P.neonMagenta : P.neonCyan;
    const x = s * 0.26;
    b.part(new THREE.CylinderGeometry(0.04, 0.042, 0.008, 14), P.darkSteel, { at: pl(x, U_STICK, 0.004), dir: N });
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2 + Math.PI / 4;
      b.part(new THREE.CylinderGeometry(0.004, 0.004, 0.003, 6), P.chrome, {
        at: pl(x + Math.cos(a) * 0.031, U_STICK + (Math.sin(a) * 0.031) / DZ * 0.94, 0.009), dir: N,
      });
    }
    b.part(new THREE.CylinderGeometry(0.026, 0.026, 0.004, 12), P.rubber, { at: pl(x, U_STICK, 0.011), dir: N });
    b.part(new THREE.CylinderGeometry(0.0075, 0.0075, 0.085, 8), P.chrome, { at: pl(x, U_STICK, 0.052), dir: N });
    b.part(new THREE.CylinderGeometry(0.019, 0.019, 0.005, 12), P.darkSteel, { at: pl(x, U_STICK, 0.03), dir: N });
    glow(b.part(new THREE.SphereGeometry(0.027, 10, 8), ball, { at: pl(x, U_STICK, 0.1) }), 0.9);
    b.part(new THREE.SphereGeometry(0.006, 6, 4), P.white, {
      at: pl(x, U_STICK, 0.1).add(V(-s * 0.007, 0.014, 0.012)),
    });
  }

  // ---- Fire buttons
  const sets: [number, string[]][] = [
    [-1, [P.buttonRed, P.buttonYellow, P.buttonBlue]],
    [1, [P.buttonGreen, P.buttonYellow, P.buttonRed]],
  ];
  const us = [0.6, 0.5, 0.58];
  for (const [s, cols] of sets) {
    cols.forEach((c, i) => {
      const x = s * (0.16 - i * 0.05);
      const u = us[i];
      b.part(new THREE.CylinderGeometry(0.019, 0.021, 0.008, 12), P.rubber, { at: pl(x, u, 0.004), dir: N });
      b.part(new THREE.TorusGeometry(0.0185, 0.0025, 5, 12), P.chrome, { at: pl(x, u, 0.0085), dir: N, axis: "z" });
      glow(
        b.part(new THREE.SphereGeometry(0.0155, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), c, {
          at: pl(x, u, 0.007), dir: N,
        }),
        0.7,
      );
      b.part(new THREE.SphereGeometry(0.0035, 5, 4), P.white, {
        at: pl(x, u, 0.016).add(V(0, 0.003, -0.004)),
      });
    });
    // numbered label strip
    flat(box(0.13, 0.0015, 0.011), P.white, s * 0.11, 0.73, 0.0025);
    for (let i = 0; i < 3; i++) {
      flat(box(0.006, 0.0016, 0.006), P.black, s * (0.16 - i * 0.05), 0.73, 0.003);
    }
    // joystick label
    flat(box(0.05, 0.0015, 0.008), P.white, s * 0.26, 0.2, 0.0025);
    flat(box(0.03, 0.0016, 0.003), P.cabBlack, s * 0.26, 0.2, 0.003);
  }

  // ---- Start buttons + labels
  [[-0.03, P.neonPink, 1], [0.03, P.neonCyan, 2]].forEach(([x, c, n]: any) => {
    b.part(new THREE.CylinderGeometry(0.012, 0.0135, 0.006, 10), P.rubber, { at: pl(x, 0.18, 0.003), dir: N });
    glow(
      b.part(new THREE.SphereGeometry(0.0095, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), c, {
        at: pl(x, 0.18, 0.005), dir: N,
      }),
      1.3,
    );
    flat(box(0.022, 0.0015, 0.008), P.white, x, 0.34, 0.0025);
    for (let i = 0; i < n; i++) {
      flat(box(0.004, 0.0016, 0.005), P.cabBlack, x + (n === 1 ? 0 : (i - 0.5) * 0.008), 0.34, 0.003);
    }
  });
}
    return buildControlDeck;
  })(),
  // screenAssembly
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: any };

function buildScreenAssembly({ b, P }: Ctx) {
  const rand = rng(84);

  // ---- bezel plane frame: through (z .30, y 1.06) and (z .20, y 1.50) ----
  const dyP = 0.44;
  const dzP = -0.1;
  const LEN = Math.hypot(dyP, dzP);
  const uy = dyP / LEN;
  const uz = dzP / LEN;
  const ny = -uz;
  const nz = uy;
  const tilt = Math.atan2(0.1, 0.44);
  const qB = new THREE.Quaternion().setFromEuler(new THREE.Euler(-tilt, 0, 0));
  const AZ = new THREE.Vector3(0, 0, 1);
  const pt = (x: number, w: number, o: number): [number, number, number] => [
    x,
    1.06 + w * uy + o * ny,
    0.3 + w * uz + o * nz,
  ];
  const plate = (
    x: number, w: number, o: number,
    dx: number, dy: number, dz: number,
    color: string, roll = 0, g = 0,
  ) => {
    const q = qB.clone().multiply(new THREE.Quaternion().setFromAxisAngle(AZ, roll));
    const part = b.part(new THREE.BoxGeometry(dx, dy, dz), color, { at: pt(x, w, o), quat: q });
    if (g) glow(part, g);
    return part;
  };
  const line = (x1: number, w1: number, x2: number, w2: number, o: number, th: number, color: string, g = 0) => {
    const dx = x2 - x1;
    const dw = w2 - w1;
    return plate((x1 + x2) / 2, (w1 + w2) / 2, o, Math.hypot(dx, dw), th, 0.002, color, Math.atan2(dw, dx), g);
  };

  // ---- housing shell ----
  const outline: [number, number][] = [
    [-0.44, 0.86],
    [0.3, 0.86],
    [0.3, 1.06],
    [0.2, 1.5],
    [-0.44, 1.5],
  ];
  for (const s of [1, -1]) {
    b.extrude(outline, { at: [s * 0.335, 0, 0], x: [0, 0, 1], thickness: 0.03, color: P.cabBlack });
  }
  // back panel
  b.part(new THREE.BoxGeometry(0.64, 0.64, 0.02), P.cabBlack, { at: [0, 1.18, -0.43] });
  // top closure
  b.part(new THREE.BoxGeometry(0.64, 0.02, 0.64), P.cabNavy, { at: [0, 1.49, -0.12] });
  // vent grille on back
  b.part(new THREE.BoxGeometry(0.42, 0.24, 0.004), P.darkSteel, { at: [0, 1.25, -0.4395] });
  for (let i = 0; i < 8; i++) {
    b.part(new THREE.BoxGeometry(0.36, 0.012, 0.002), P.black, { at: [0, 1.14 + i * 0.026, -0.4425] });
  }
  for (const sx of [1, -1])
    for (const sy of [1, -1])
      b.part(new THREE.SphereGeometry(0.006, 6, 4), P.chrome, { at: [sx * 0.2, 1.25 + sy * 0.12, -0.4435] });

  // ---- front fascia ----
  b.part(new THREE.BoxGeometry(0.64, 0.2, 0.02), P.cabNavy, { at: [0, 0.96, 0.29] });
  b.part(new THREE.BoxGeometry(0.22, 0.14, 0.002), P.black, { at: [-0.14, 0.95, 0.2815] });
  for (let i = 0; i < 6; i++) {
    b.part(new THREE.BoxGeometry(0.19, 0.01, 0.003), P.chrome, { at: [-0.14, 0.895 + i * 0.022, 0.282] });
  }
  glow(b.part(new THREE.SphereGeometry(0.008, 8, 6), P.neonCyan, { at: [0.2, 0.9, 0.281] }), 1.5);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.003, 10), P.chrome, { at: [0.2, 0.9, 0.2805], dir: [0, 0, 1] });

  // ---- bezel frame ----
  const H = 0.39 - 0.06;
  const WC = (0.06 + 0.39) / 2;
  plate(0, WC, -0.0035, 0.56, 0.35, 0.006, P.screenGlass);
  plate(0, 0.03, -0.01, 0.64, 0.06, 0.02, P.cabBlack);
  plate(0, 0.4206, -0.01, 0.64, 0.0612, 0.02, P.cabBlack);
  for (const s of [1, -1]) plate(s * 0.295, 0.2256, -0.01, 0.05, LEN, 0.02, P.cabBlack);
  // inner black backing of glass
  plate(0, WC, -0.003, 0.52, H, 0.003, P.black);

  // corner screws
  for (const s of [1, -1])
    for (const w of [0.03, 0.42])
      b.part(new THREE.SphereGeometry(0.005, 6, 4), P.chrome, { at: pt(s * 0.298, w, 0.002) });

  // neon swooshes
  const sw = [P.neonMagenta, P.neonViolet, P.neonCyan];
  for (let i = 0; i < 3; i++) {
    glow(line(0.322, 0.33 + i * 0.012, 0.268, 0.43 + i * 0.012, 0.0015, 0.0035, sw[i]), 1.2);
    glow(line(-0.322, 0.13 - i * 0.012, -0.268, 0.02 - i * 0.012, 0.0015, 0.0035, sw[2 - i]), 1.2);
  }
  // top neon line
  glow(plate(0, LEN - 0.004, 0.003, 0.62, 0.006, 0.008, P.neonMagenta), 1.8);

  // ---- CRT scene ----
  const GX = 0.26;
  const hor = 0.225;
  // sky gradient
  const sky = [P.cabNavy, P.panelPurple, P.neonViolet, P.neonMagenta, P.neonPink, P.sunOrange];
  const sh = (0.39 - hor) / sky.length;
  sky.forEach((c, i) => {
    glow(plate(0, 0.39 - sh * (i + 0.5), 0.001, 0.52, sh + 0.0005, 0.002, c), 1);
  });
  // ground
  glow(plate(0, (0.06 + hor) / 2, 0.001, 0.52, hor - 0.06, 0.002, P.cabBlack), 0.8);
  // sun
  const R = 0.09;
  const bands: [number, number][] = [[0, 0.007], [0.015, 0.009], [0.03, 0.012], [0.048, 0.015], [0.067, 0.023]];
  const sunCols = [P.sunOrange, P.sunOrange, P.sunYellow, P.sunYellow, P.sunYellow];
  bands.forEach(([bot, h], i) => {
    const mid = bot + h / 2;
    const wd = 2 * Math.sqrt(Math.max(R * R - (bot + h) * (bot + h * 0.3) * 0.0 - mid * mid, 0.00002));
    glow(plate(0, hor + mid, 0.002, wd, h, 0.002, sunCols[i]), 1.4);
  });
  // mountains
  const mL: [number, number][] = [[-0.26, 0.225], [-0.21, 0.285], [-0.16, 0.25], [-0.12, 0.31], [-0.07, 0.225]];
  const mR: [number, number][] = [[0.26, 0.225], [0.2, 0.275], [0.15, 0.24], [0.1, 0.29], [0.06, 0.225]];
  for (const m of [mL, mR])
    for (let i = 0; i < m.length - 1; i++)
      glow(line(m[i][0], m[i][1], m[i + 1][0], m[i + 1][1], 0.0025, 0.003, P.neonCyan), 1.5);
  // road grid
  for (let k = -4; k <= 4; k++) {
    glow(line(0, hor, k * 0.065, 0.062, 0.0025, 0.0022, P.neonMagenta), 1.4);
  }
  [0.08, 0.18, 0.34, 0.58, 0.9].forEach((f) => {
    glow(plate(0, hor - 0.165 * f, 0.0025, 0.52 * f, 0.0022, 0.002, P.neonMagenta), 1.4);
  });
  // horizon glow line
  glow(plate(0, hor, 0.0028, 0.52, 0.003, 0.002, P.neonPink), 1.6);
  // tiny car
  glow(plate(0, 0.085, 0.0035, 0.04, 0.008, 0.002, P.neonCyan), 1.5);
  glow(plate(0, 0.0925, 0.0035, 0.022, 0.007, 0.002, P.neonCyan), 1.5);
  for (const s of [1, -1]) glow(plate(s * 0.015, 0.085, 0.0045, 0.007, 0.004, 0.002, P.buttonRed), 2);
  // HI-SCORE text cells
  const cell = (x: number, w: number, c: string) =>
    glow(plate(x, w, 0.0035, 0.007, rand() > 0.5 ? 0.009 : 0.006, 0.002, c), 1.3);
  for (let i = 0; i < 8; i++) cell(-0.1 + i * 0.011, 0.372, P.white);
  for (let i = 0; i < 6; i++) cell(0.012 + i * 0.011, 0.372, P.sunYellow);
  for (let i = 0; i < 3; i++) cell(-0.24 + i * 0.011, 0.372, P.neonPink);

  // scanlines
  for (let i = 0; i < 12; i++) {
    plate(0, 0.07 + i * 0.0275, 0.0045, 0.52, 0.0012, 0.001, P.screenGlass);
  }
  // glass reflection streaks
  plate(-0.12, 0.3, 0.005, 0.012, 0.16, 0.001, P.white, 0.55);
  plate(-0.085, 0.3, 0.005, 0.005, 0.12, 0.001, P.white, 0.55);

  // gasket + chrome trim
  plate(0, 0.0525, 0.003, 0.56, 0.0105, 0.01, P.rubber);
  plate(0, 0.3975, 0.003, 0.56, 0.0105, 0.01, P.rubber);
  for (const s of [1, -1]) plate(s * 0.2675, WC, 0.003, 0.0105, 0.36, 0.01, P.rubber);
  plate(0, 0.0585, 0.0085, 0.53, 0.003, 0.002, P.chrome);
  plate(0, 0.3915, 0.0085, 0.53, 0.003, 0.002, P.chrome);
  for (const s of [1, -1]) plate(s * 0.2615, WC, 0.0085, 0.003, 0.336, 0.002, P.chrome);
}
    return buildScreenAssembly;
  })(),
  // marquee
  (() => {
function buildMarquee({ b, P }: Ctx) {
  // ---------- helpers ----------
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, color: string) =>
    b.part(new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });

  // Sign-plane coordinates: u runs to the viewer's right (model -X), v is height.
  const YB = 1.665;
  const SHEAR = -0.2; // italic lean toward the viewer's right
  const shearM = (k: number) => new THREE.Matrix4().set(1, k, 0, -k * YB, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
  const rectGeo = (u0: number, u1: number, v0: number, v1: number, z: number, t: number, k = 0) => {
    const g = new THREE.BoxGeometry(Math.abs(u1 - u0), Math.abs(v1 - v0), t);
    g.translate(-(u0 + u1) / 2, (v0 + v1) / 2, z);
    if (k) g.applyMatrix4(shearM(k));
    return g;
  };
  const flush = (list: THREE.BufferGeometry[], color: string, strength = 1) => {
    if (!list.length) return;
    const merged = mergeGeometries(list);
    if (merged) glow(b.part(merged, color, { at: [0, 0, 0] }), strength);
  };

  // ---------- body shell ----------
  // side panels with a slight top bevel
  const sideOutline: [number, number][] = [
    [-0.44, 0],
    [0.26, 0],
    [0.26, 0.27],
    [0.23, 0.3],
    [-0.41, 0.3],
    [-0.44, 0.27],
  ];
  for (const s of [1, -1]) {
    b.extrude(sideOutline, {
      at: [s * 0.335, 1.5, 0],
      x: [0, 0, 1],
      thickness: 0.03,
      color: P.cabBlack,
    });
  }
  box(-0.32, 0.32, 1.5, 1.8, -0.44, -0.41, P.cabBlack); // back
  box(-0.32, 0.32, 1.5, 1.504, -0.41, 0.24, P.cabBlack); // floor
  box(-0.32, 0.32, 1.498, 1.502, 0.2, 0.26, P.black); // underside strip of the overhang
  box(-0.35, 0.35, 1.5, 1.504, 0.2, 0.26, P.black);
  box(-0.32, 0.32, 1.5, 1.8, 0.24, 0.254, P.cabBlack); // front board
  // chrome back-edge strips
  for (const s of [1, -1]) box(s * 0.335 - 0.002, s * 0.335 + 0.002, 1.5, 1.8, -0.446, -0.44, P.darkSteel);

  // ---------- top cap ----------
  box(-0.35, 0.35, 1.78, 1.794, -0.44, 0.26, P.cabNavy);
  const rim = 0.008;
  box(-0.35, 0.35, 1.794, 1.8, 0.26 - rim, 0.26, P.chrome);
  box(-0.35, 0.35, 1.794, 1.8, -0.44, -0.44 + rim, P.chrome);
  box(-0.35, -0.35 + rim, 1.794, 1.8, -0.44, 0.26, P.chrome);
  box(0.35 - rim, 0.35, 1.794, 1.8, -0.44, 0.26, P.chrome);
  // slotted vents
  for (let i = 0; i < 8; i++) {
    const x = -0.21 + i * 0.06;
    box(x - 0.012, x + 0.012, 1.7935, 1.7955, -0.34, -0.14, P.black);
    box(x - 0.008, x + 0.008, 1.7955, 1.7965, -0.33, -0.15, P.darkSteel);
  }
  // pink light bar on cap
  glow(box(-0.1, 0.1, 1.794, 1.798, 0.1, 0.116, P.neonPink), 1.2);

  // ---------- front frame ----------
  const fz0 = 0.252;
  const fz1 = 0.266;
  box(0.29, 0.315, 1.53, 1.79, fz0, fz1, P.chrome);
  box(-0.315, -0.29, 1.53, 1.79, fz0, fz1, P.chrome);
  box(-0.315, 0.315, 1.78, 1.79, fz0, fz1, P.chrome);
  box(-0.315, 0.315, 1.53, 1.54, fz0, fz1, P.chrome);
  // inner dark lip
  box(-0.29, 0.29, 1.54, 1.544, 0.254, 0.264, P.darkSteel);
  box(-0.29, 0.29, 1.776, 1.78, 0.254, 0.264, P.darkSteel);
  // screws
  for (const s of [1, -1])
    for (const y of [1.545, 1.775]) {
      b.part(new THREE.CylinderGeometry(0.005, 0.005, 0.004, 8), P.chrome, {
        at: [s * 0.3025, y, fz1 + 0.001],
        dir: [0, 0, 1],
      });
      box(s * 0.3025 - 0.004, s * 0.3025 + 0.004, y - 0.0007, y + 0.0007, fz1 + 0.002, fz1 + 0.0033, P.darkSteel);
    }
  // neon tubes
  glow(b.rod([-0.315, 1.522, 0.264], [0.315, 1.522, 0.264], 0.005, P.neonMagenta), 1.4);
  glow(b.rod([-0.315, 1.786, 0.268], [0.315, 1.786, 0.268], 0.004, P.neonCyan), 1.4);

  // ---------- sign: backlit plane ----------
  glow(box(-0.29, 0.29, 1.54, 1.78, 0.254, 0.26, P.cabNavy), 0.8);
  glow(box(-0.29, 0.29, 1.54, 1.6, 0.259, 0.2605, P.panelPurple), 0.8);
  glow(box(-0.29, 0.29, 1.6, 1.78, 0.259, 0.2602, P.panelPurple), 0.45);

  // striped sun disc
  const sunC = 1.67;
  const sunR = 0.1;
  const bands: [number, number, string][] = [
    [1.77, 1.745, P.sunYellow],
    [1.738, 1.712, P.sunYellow],
    [1.705, 1.682, P.sunOrange],
    [1.675, 1.655, P.sunOrange],
    [1.648, 1.632, P.neonPink],
    [1.625, 1.612, P.neonPink],
  ];
  for (const [t, bt, col] of bands) {
    const vm = (t + bt) / 2;
    const w = Math.sqrt(Math.max(0, sunR * sunR - (vm - sunC) ** 2));
    if (w < 0.01) continue;
    glow(box(-w, w, bt, t, 0.2602, 0.2612, col), 1);
  }

  // horizon grid
  glow(box(-0.285, 0.285, 1.598, 1.602, 0.2602, 0.2616, P.neonCyan), 1.5);
  const gridMag: THREE.BufferGeometry[] = [];
  for (const v of [1.591, 1.582, 1.57, 1.555]) gridMag.push(rectGeo(-0.285, 0.285, v - 0.001, v + 0.001, 0.2608, 0.002));
  for (let i = -5; i <= 5; i++) {
    const ub = i * 0.05;
    const L = Math.hypot(ub, 0.055);
    const g = new THREE.BoxGeometry(0.002, L, 0.002);
    g.rotateZ(Math.atan2(ub, -0.055)); // x = -u, so dx = -ub
    g.translate(-ub / 2, 1.5725, 0.2608);
    gridMag.push(g);
  }
  flush(gridMag, P.neonMagenta, 1.2);

  // ---------- title letters ----------
  type R = [number, number, number, number];
  const FONT: Record<string, R[]> = {
    N: [[0, 0, 1, 5], [2, 0, 1, 5], [1, 1, 1, 1], [1, 3, 1, 1]],
    E: [[0, 0, 1, 5], [1, 0, 2, 1], [1, 2, 2, 1], [1, 4, 2, 1]],
    O: [[0, 0, 1, 5], [2, 0, 1, 5], [1, 0, 1, 1], [1, 4, 1, 1]],
    D: [[0, 0, 1, 5], [1, 0, 1, 1], [1, 4, 1, 1], [2, 1, 1, 3]],
    R: [[0, 0, 1, 5], [1, 0, 2, 1], [2, 1, 1, 1], [1, 2, 2, 1], [2, 3, 1, 2]],
    I: [[1, 0, 1, 5], [0, 0, 3, 1], [0, 4, 3, 1]],
    V: [[0, 0, 1, 4], [2, 0, 1, 4], [1, 4, 1, 1]],
  };
  const text = "NEON DRIVE";
  const c = 0.0135;
  const vTop = 1.7025;
  const u0 = -0.25;
  const outline: THREE.BufferGeometry[] = [];
  const shadow: THREE.BufferGeometry[] = [];
  const face: THREE.BufferGeometry[] = [];
  const lower: THREE.BufferGeometry[] = [];
  let cursor = 0;
  for (const ch of text) {
    if (ch === " ") {
      cursor += 2;
      continue;
    }
    for (const [x, y, w, h] of FONT[ch]) {
      const a = u0 + (cursor + x) * c;
      const a1 = a + w * c;
      const vt = vTop - y * c;
      const vb = vt - h * c;
      const e = 0.0016;
      shadow.push(rectGeo(a + 0.004 - e, a1 + 0.004 + e, vb - 0.004 - e, vt - 0.004 + e, 0.2610, 0.0016, SHEAR));
      outline.push(rectGeo(a - e, a1 + e, vb - e, vt + e, 0.2615, 0.0016, SHEAR));
      face.push(rectGeo(a, a1, vb, vt, 0.2625, 0.002, SHEAR));
      const cut = vTop - 3 * c;
      if (vb < cut) lower.push(rectGeo(a, a1, vb, Math.min(vt, cut), 0.2637, 0.001, SHEAR));
    }
    cursor += 4;
  }
  flush(shadow, P.neonCyan, 1.3);
  flush(outline, P.neonMagenta, 1.3);
  flush(face, P.chrome, 1);
  flush(lower, P.steel, 0.9);
  // thin cyan underline beneath the title
  glow(box(-0.25, 0.25, 1.626, 1.629, 0.2602, 0.2616, P.neonViolet), 1.2);

  // ---------- badges ----------
  glow(box(-0.285, -0.2, 1.745, 1.773, 0.2602, 0.2612, P.neonViolet), 1);
  glow(box(-0.283, -0.202, 1.747, 1.751, 0.2612, 0.262, P.neonCyan), 1);
  const digits: Record<string, R[]> = {
    "1": [[1, 0, 1, 5], [0, 4, 3, 1], [0, 1, 1, 1]],
    "9": [[0, 0, 3, 1], [0, 0, 1, 3], [2, 0, 1, 5], [0, 2, 3, 1], [0, 4, 3, 1]],
    "8": [[0, 0, 1, 5], [2, 0, 1, 5], [1, 0, 1, 1], [1, 2, 1, 1], [1, 4, 1, 1]],
    "4": [[0, 0, 1, 3], [2, 0, 1, 5], [1, 2, 1, 1]],
  };
  const drawDigits = (str: string, ua: number, vt: number, cell: number, list: THREE.BufferGeometry[]) => {
    let cur = 0;
    for (const d of str) {
      for (const [x, y, w, h] of digits[d])
        list.push(rectGeo(ua + (cur + x) * cell, ua + (cur + x + w) * cell, vt - (y + h) * cell, vt - y * cell, 0.2625, 0.0016));
      cur += 4;
    }
  };
  const roundMark: THREE.BufferGeometry[] = [];
  drawDigits("1", -0.28, 1.769, 0.0035, roundMark);
  for (let i = 0; i < 4; i++) roundMark.push(rectGeo(-0.255 + i * 0.012, -0.249 + i * 0.012, 1.755, 1.765, 0.2625, 0.0016));
  flush(roundMark, P.white, 1);
  const stamp: THREE.BufferGeometry[] = [];
  drawDigits("1984", 0.2, 1.771, 0.0028, stamp);
  flush(stamp, P.neonPink, 1.3);
  glow(box(-0.275, -0.2, 1.7745, 1.7765, 0.2602, 0.2612, P.neonPink), 1);

  // ---------- star sparks ----------
  const stars: THREE.BufferGeometry[] = [];
  const starAt = (u: number, v: number, s: number) => {
    stars.push(rectGeo(u - s, u + s, v - 0.0015, v + 0.0015, 0.2618, 0.0016));
    stars.push(rectGeo(u - 0.0015, u + 0.0015, v - s, v + s, 0.2618, 0.0016));
    const d = new THREE.BoxGeometry(0.005, 0.005, 0.0016);
    d.rotateZ(Math.PI / 4);
    d.translate(-u, v, 0.2618);
    stars.push(d);
  };
  starAt(-0.272, 1.695, 0.011);
  starAt(0.272, 1.695, 0.011);
  starAt(-0.268, 1.645, 0.008);
  starAt(0.268, 1.645, 0.008);
  starAt(-0.14, 1.738, 0.008);
  starAt(0.15, 1.742, 0.009);
  flush(stars, P.sunYellow, 1.4);
}
    return buildMarquee;
  })(),
  // sideArtAndTrim
  (() => {
function buildSideArtAndTrim({ b, J, P, M }: Ctx) {
  const SIDES = [1, -1];
  const L_BG = 0.3515; // background panel layer
  const L_ART = 0.3535; // art layer
  const L_TOP = 0.3552; // detail layer

  // ---------- helpers ----------
  // Outline is drawn in (z, y), flat on the side face.
  const ext = (outline: any[], s: number, layer: number, color: string, th = 0.003) =>
    b.extrude(outline, {
      at: [s * layer, 0, 0],
      x: [0, 0, 1],
      y: [0, 1, 0],
      thickness: th,
      color,
    });
  const rect = (s: number, layer: number, z0: number, y0: number, z1: number, y1: number, color: string, th = 0.003) =>
    ext(
      [
        [z0, y0],
        [z1, y0],
        [z1, y1],
        [z0, y1],
      ],
      s,
      layer,
      color,
      th,
    );
  const tube = (pts: number[][], s: number, color: string, r = 0.006, x = 0.356, lit = true) => {
    const path = polyline(pts.map(([z, y]) => [s * x, y, z]));
    const sw = b.sweep(path, r, { color, sides: 6 });
    if (lit) glow(sw, 1.4);
    // corner joints
    for (const [z, y] of pts) {
      const p = b.part(new THREE.SphereGeometry(r * 1.25, 6, 4), color, { at: [s * x, y, z] });
      if (lit) glow(p, 1.4);
    }
  };
  const neonLine = (a: number[], c: number[], s: number, layer: number, color: string, r = 0.0022, lit = true) => {
    const rod = b.rod([s * layer, a[1], a[0]], [s * layer, c[1], c[0]], r, color, { sides: 4 });
    if (lit) glow(rod, 1.2);
    return rod;
  };
  const star = (s: number, z: number, y: number, size: number, color: string) => {
    const k = 0.3 * size;
    const st = ext(
      [
        [z, y + size],
        [z + k, y + k],
        [z + size, y],
        [z + k, y - k],
        [z, y - size],
        [z - k, y - k],
        [z - size, y],
        [z - k, y + k],
      ],
      s,
      L_TOP,
      color,
      0.002,
    );
    glow(st, 1.3);
  };

  // ---------- T-molding ----------
  const outline: number[][] = [
    [0.44, 0.1],
    [0.44, 0.86],
    [0.52, 0.86],
    [0.52, 0.98],
    [0.3, 1.06],
    [0.2, 1.5],
    [0.26, 1.5],
    [0.26, 1.8],
    [-0.44, 1.8],
    [-0.44, 0.1],
  ];
  for (const s of SIDES) {
    tube(outline, s, P.neonMagenta);
    // cyan plinth accent
    tube(
      [
        [-0.44, 0.1],
        [0.34, 0.1],
        [0.34, 0.03],
      ],
      s,
      P.neonCyan,
      0.0045,
      0.356,
    );
    // cyan marquee outline, inset
    tube(
      [
        [-0.41, 1.53],
        [0.23, 1.53],
        [0.23, 1.77],
        [-0.41, 1.77],
        [-0.41, 1.53],
      ],
      s,
      P.neonCyan,
      0.0035,
      0.3565,
    );
  }

  for (const s of SIDES) {
    // ---------- (1) lower body: grid floor ----------
    rect(s, L_BG, -0.43, 0.12, 0.43, 0.84, P.cabNavy);
    // horizontal lines closing toward the horizon
    const N = 8;
    for (let k = 1; k <= N; k++) {
      const y = 0.85 - 0.72 * Math.pow(k / (N + 0.5), 1.8);
      const bar = b.part(new THREE.BoxGeometry(0.003, 0.0035, 0.86), P.neonMagenta, {
        at: [s * L_ART, y, 0],
      });
      glow(bar, 1.1);
    }
    // converging diagonals
    for (const ze of [-0.42, -0.3, -0.18, -0.06, 0.06, 0.18, 0.3, 0.42]) {
      neonLine([-0.05, 0.85], [ze, 0.125], s, L_ART, P.neonMagenta, 0.002);
    }
    // horizon line
    glow(b.part(new THREE.BoxGeometry(0.004, 0.006, 0.86), P.neonCyan, { at: [s * L_TOP, 0.85, 0] }), 1.5);

    // badge
    {
      const z = -0.3,
        y = 0.7;
      rect(s, L_TOP, z - 0.085, y - 0.028, z + 0.085, y + 0.028, P.chrome, 0.003);
      rect(s, 0.3568, z - 0.075, y - 0.018, z + 0.075, y + 0.02, P.darkSteel, 0.0015);
      // letter blocks for NEON DRIVE
      for (let i = 0; i < 9; i++) {
        if (i === 4) continue;
        rect(s, 0.3578, z - 0.068 + i * 0.0165, y - 0.006, z - 0.068 + i * 0.0165 + 0.011, y + 0.012, P.chrome, 0.001);
      }
      glow(rect(s, 0.3568, z - 0.075, y - 0.0235, z + 0.075, y - 0.0205, P.neonCyan, 0.0015), 1.4);
    }

    // ---------- (2) monitor housing: sun ----------
    ext(
      [
        [-0.42, 0.88],
        [0.28, 0.88],
        [0.28, 1.05],
        [0.19, 1.48],
        [-0.42, 1.48],
      ],
      s,
      L_BG,
      P.cabBlack,
    );
    const cz = -0.1,
      cy = 1.0,
      R = 0.3;
    const half = (y: number) => Math.sqrt(Math.max(R * R - (y - cy) * (y - cy), 0.00001));
    for (let i = 0; i < 9; i++) {
      const top = 1.3 - 0.047 * i;
      const th = 0.043 * (1 - i * 0.085);
      let bot = top - th;
      if (top <= 0.89) break;
      if (bot < 0.88) bot = 0.88;
      const color = i < 3 ? P.sunYellow : i < 6 ? P.sunOrange : P.neonPink;
      const w1 = half(bot),
        w2 = half(top);
      const band = ext(
        [
          [cz - w1, bot],
          [cz + w1, bot],
          [cz + w2, top],
          [cz - w2, top],
        ],
        s,
        L_ART,
        color,
      );
      glow(band, 1.1);
    }
    // cyan outline arc
    {
      const r = 0.315;
      const pts: number[][] = [[0.88, 0.88]];
      pts.length = 0;
      pts.push([s * L_TOP, 0.88, cz + r]);
      for (let a = 0; a <= 180; a += 10) {
        const t = (a * Math.PI) / 180;
        pts.push([s * L_TOP, cy + r * Math.sin(t), cz + r * Math.cos(t)]);
      }
      pts.push([s * L_TOP, 0.88, cz - r]);
      glow(b.sweep(polyline(pts), 0.0025, { color: P.neonCyan, sides: 5 }), 1.4);
    }
    // violet mountains
    const mt: number[][] = [
      [-0.42, 0.95],
      [-0.33, 1.07],
      [-0.26, 0.99],
      [-0.17, 1.11],
      [-0.08, 0.98],
      [0.02, 1.05],
      [0.1, 0.96],
      [0.18, 1.0],
      [0.27, 0.95],
    ];
    ext([[-0.42, 0.88], ...mt, [0.27, 0.88]], s, 0.3555, P.neonViolet, 0.002);
    {
      const ridge = polyline(mt.map(([z, y]) => [s * 0.3568, y, z]));
      glow(b.sweep(ridge, 0.0018, { color: P.neonPink, sides: 4 }), 1.2);
    }

    // ---------- (3) marquee side ----------
    rect(s, L_BG, -0.42, 1.52, 0.24, 1.78, P.black);
    // cyan wireframe mountain zigzag
    {
      const zig: number[][] = [];
      const zs = [-0.4, -0.35, -0.3, -0.25, -0.2, -0.15, -0.1, -0.05, 0.0, 0.05, 0.1, 0.15, 0.2];
      zs.forEach((z, i) => zig.push([z, i % 2 === 0 ? 1.545 : 1.6 + (i % 4 === 1 ? 0.02 : 0)]));
      const sw = b.sweep(polyline(zig.map(([z, y]) => [s * L_TOP, y, z])), 0.0018, { color: P.neonCyan, sides: 4 });
      glow(sw, 1.3);
      for (let i = 1; i < zig.length - 1; i += 2) neonLine(zig[i], [zig[i][0], 1.54], s, L_TOP, P.neonCyan, 0.0014);
    }
    // magenta chevrons
    for (let k = 0; k < 3; k++) {
      const o = k * 0.055;
      const c = ext(
        [
          [-0.36 + o, 1.745],
          [-0.31 + o, 1.745],
          [-0.265 + o, 1.7],
          [-0.31 + o, 1.655],
          [-0.36 + o, 1.655],
          [-0.315 + o, 1.7],
        ],
        s,
        L_ART,
        k === 1 ? P.neonPink : P.neonMagenta,
        0.003,
      );
      glow(c, 1.2);
    }
    // stars
    const stars: [number, number, number, string][] = [
      [-0.12, 1.75, 0.01, P.white],
      [-0.03, 1.68, 0.007, P.neonPink],
      [0.05, 1.74, 0.012, P.neonCyan],
      [0.12, 1.69, 0.008, P.white],
      [0.19, 1.75, 0.009, P.neonPink],
      [-0.2, 1.66, 0.007, P.neonCyan],
      [0.0, 1.64, 0.006, P.white],
      [-0.4, 1.76, 0.008, P.neonCyan],
      [0.2, 1.65, 0.006, P.white],
    ];
    for (const [z, y, sz, c] of stars) star(s, z, y, sz, c);
  }
}
    return buildSideArtAndTrim;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "neonDriveCabinet" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
