import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";

export const meta = {
  "name": "Bloc Habitat 9000",
  "description": "A raw-concrete brutalist housing block: a pilotis podium and plaza, a repetitive window-grid slab tower, a cantilevered upper volume, an exposed service core and a cluttered concrete rooftop."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  rawConcrete: "#b3b0a6",
  concreteDark: "#8d8b82",
  concreteCream: "#c8c5ba",
  weatherStain: "#6f6d66",
  soffitShadow: "#4a4844",
  glassDark: "#2e3a42",
  glassPale: "#5b6e78",
  frameMetal: "#3a3d40",
  rustAccent: "#8a4a2e",
  signalRed: "#a8352c",
  pavingGrey: "#7a776f",
  planterGreen: "#5c7a45",
  ventSteel: "#565a5e",
  inkBlack: "#1e1e1e",
  waterTank: "#9aa0a4",
};
const M = {
  podiumTop: [0, 5, 0] as [number, number, number],
  towerTop: [0, 16, 0] as [number, number, number],
  coreBase: [6.1, 0, -1.5] as [number, number, number],
  coreTop: [6.1, 21, -1.5] as [number, number, number],
  roofDeck: [-0.5, 21, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // podium
  (() => {
function buildPodium({ b, J, P, M }: Ctx) {
  const R = rng(9);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });

  // Plaza slab with nosing (sunken entrance strip left clear at centre front)
  box(14, 0.45, 9.2, P.pavingGrey, 0, 0.225, -0.4);
  box(5, 0.45, 0.8, P.pavingGrey, 0, 0.225, 4.4);
  box(14.1, 0.1, 0.1, P.rawConcrete, 0, 0.4, -5);
  // Stepped tiers at the front
  for (let i = 0; i < 3; i++) {
    box(5, 0.15, 0.7, P.rawConcrete, 0, 0.075 + i * 0.15, 4.65 - i * 0.0);
    b.part(new THREE.BoxGeometry(5.6 - i * 0.4, 0.15, 0.7), P.rawConcrete, { at: [0, 0.075 + i * 0.15, 4.65 + (2 - i) * 0.3 - 0.0] });
  }
  // Deck
  box(14, 0.8, 10, P.rawConcrete, 0, 4.6, 0);
  box(13.9, 0.06, 9.9, P.soffitShadow, 0, 4.17, 0);
  for (let i = 0; i < 12; i++) {
    box(0.1 + R() * 0.15, 0.03, 3 + R() * 5, P.weatherStain, -6.5 + i * 1.2, 4.14, R() * 2 - 1);
  }
  box(14.05, 0.12, 10.05, P.concreteDark, 0, 4.95, 0);

  // Pilotis
  const xs = [-6.5, -3.25, 0, 3.25, 6.5];
  const zs = [-4.5, -1.5, 1.5, 4.5];
  for (const x of xs)
    for (const z of zs) {
      if (z === 1.5 && Math.abs(x) < 4) continue; // lobby zone
      box(0.6, 4.0, 0.6, P.rawConcrete, x, 2.45, z);
      box(0.72, 0.18, 0.72, P.concreteDark, x, 4.1, z);
      b.part(new THREE.CylinderGeometry(0.4, 0.5, 0.2, 4, 1).rotateY(Math.PI / 4), P.rawConcrete, { at: [x, 0.55, z] });
    }

  // Lobby wall recessed at z=1.5
  box(6.6, 3.9, 0.2, P.frameMetal, 0, 2.4, 1.2);
  for (let i = 0; i < 6; i++) {
    const x = -2.75 + i * 1.1;
    box(0.95, 3.5, 0.06, i % 2 ? P.glassPale : P.glassDark, x, 2.4, 1.33);
  }
  for (let i = 0; i <= 6; i++) box(0.1, 3.8, 0.12, P.frameMetal, -3.3 + i * 1.1, 2.4, 1.36);
  box(6.6, 0.1, 0.12, P.frameMetal, 0, 3.4, 1.37);
  // Door
  box(1.0, 2.2, 0.08, P.signalRed, 0, 1.55, 1.42);
  box(0.9, 1.3, 0.04, P.glassDark, 0, 1.9, 1.47);
  box(0.25, 0.15, 0.04, P.inkBlack, 0.9, 2.6, 1.42);
  box(0.08, 0.05, 0.02, P.concreteCream, 0.9, 2.6, 1.45);
  box(1.8, 0.1, 0.8, P.rustAccent, 0, 2.85, 1.8);
  box(0.06, 0.3, 0.06, P.frameMetal, -0.8, 2.7, 2.1);
  box(0.06, 0.3, 0.06, P.frameMetal, 0.8, 2.7, 2.1);
  box(0.9, 0.04, 0.5, P.weatherStain, 0, 0.47, 1.9);

  // Benches
  for (const [x, z] of [[-4, 3], [-2.2, 3], [4, 3], [-5, 0]]) {
    box(1.5, 0.12, 0.45, P.rawConcrete, x, 0.8, z);
    box(0.2, 0.35, 0.4, P.concreteDark, x - 0.6, 0.62, z);
    box(0.2, 0.35, 0.4, P.concreteDark, x + 0.6, 0.62, z);
  }
  // Planters
  for (const x of [-5.5, 5.5]) {
    box(1.8, 0.6, 1.2, P.concreteDark, x, 0.75, 3.5);
    box(1.6, 0.05, 1.0, P.inkBlack, x, 1.07, 3.5);
    for (let k = 0; k < 4; k++)
      b.part(new THREE.IcosahedronGeometry(0.3 + R() * 0.12, 0), P.planterGreen, {
        at: [x - 0.5 + k * 0.35, 1.3 + R() * 0.1, 3.5 + (R() - 0.5) * 0.4],
      });
  }
  // Bollards
  for (let i = 0; i < 9; i++) {
    const x = -6.5 + i * 1.6;
    if (Math.abs(x) < 2.8) continue;
    b.part(new THREE.CylinderGeometry(0.12, 0.12, 0.7, 8), P.rawConcrete, { at: [x, 0.8, 4.8] });
    b.part(new THREE.CylinderGeometry(0.125, 0.125, 0.06, 8), P.signalRed, { at: [x, 1.1, 4.8] });
  }
}
    return buildPodium;
  })(),
  // towerSlab
  (() => {
function buildTowerSlab({ b, J, P, M }: Ctx) {
  const R = rng(9);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], bone: undefined as any });
  const Y0 = M.podiumTop[1];
  const Y1 = M.towerTop[1];
  const H = Y1 - Y0;

  // main mass
  box(10, H, 8, P.rawConcrete, 0, Y0 + H / 2, 0);
  // darker plinth and top cap
  box(10.1, 0.25, 8.1, P.concreteDark, 0, Y0 + 0.125, 0);
  box(10.1, 0.3, 8.1, P.concreteDark, 0, Y1 - 0.15, 0);

  const floors = 6;
  const fh = (H - 0.6) / floors;
  const cols = 5;
  const colX = (i: number) => -4 + i * 2;
  const zf = 4;

  // window grid
  for (let f = 0; f < floors; f++) {
    const cy = Y0 + 0.4 + fh * (f + 0.5);
    for (let i = 0; i < cols; i++) {
      const x = colX(i);
      // recess shadow
      box(1.4, 1.1, 0.05, P.soffitShadow, x, cy, zf + 0.01);
      // reveal frame
      box(1.5, 0.08, 0.12, P.frameMetal, x, cy + 0.6, zf + 0.04);
      box(1.5, 0.08, 0.12, P.frameMetal, x, cy - 0.6, zf + 0.04);
      box(0.08, 1.2, 0.12, P.frameMetal, x - 0.72, cy, zf + 0.04);
      box(0.08, 1.2, 0.12, P.frameMetal, x + 0.72, cy, zf + 0.04);
      // glass set back
      box(1.3, 1.0, 0.04, f % 2 ? P.glassPale : P.glassDark, x, cy, zf - 0.2);
      box(0.05, 1.0, 0.05, P.frameMetal, x, cy, zf - 0.16);
      // sill with stain
      box(1.6, 0.08, 0.2, P.concreteDark, x, cy - 0.64, zf + 0.08);
      box(0.9, 0.5, 0.02, P.weatherStain, x, cy - 0.95, zf + 0.01);
    }
  }

  // balconies every second floor
  for (let f = 1; f < floors; f += 2) {
    const y = Y0 + 0.4 + fh * f;
    box(10.2, 0.2, 1.1, P.rawConcrete, 0, y, zf + 0.55);
    box(10.2, 0.28, 0.08, P.concreteDark, 0, y - 0.02, zf + 1.1);
    box(9.6, 0.35, 0.02, P.weatherStain, 0, y - 0.3, zf + 0.01);
    box(10, 0.05, 0.05, P.frameMetal, 0, y + 1.0, zf + 1.05);
    box(10, 0.04, 0.04, P.frameMetal, 0, y + 0.5, zf + 1.05);
    for (let k = 0; k <= 20; k++) box(0.04, 1.0, 0.04, P.frameMetal, -5 + k * 0.5, y + 0.5, zf + 1.05);
  }

  // string course
  box(10.15, 0.18, 0.12, P.concreteCream, 0, Y0 + H / 2, zf + 0.04);

  // stair windows on left pier
  for (let f = 0; f < floors; f++) {
    const cy = Y0 + 0.4 + fh * (f + 0.5) + 0.1;
    box(0.4, 0.4, 0.06, P.soffitShadow, -4.9 + 0.0, cy + 0.0, zf + 0.0);
    box(0.28, 0.28, 0.04, P.glassDark, -4.9, cy, zf + 0.04);
  }

  // sides and back
  for (const s of [1, -1]) {
    const x = s * 5;
    for (let f = 0; f < floors; f += 1) {
      const cy = Y0 + 0.4 + fh * (f + 0.5);
      for (const z of [-2, 1.5]) {
        if (R() < 0.45) continue;
        box(0.08, 0.9, 0.9, P.soffitShadow, x, cy, z);
        box(0.1, 0.7, 0.7, P.glassDark, x, cy, z);
        box(0.14, 0.06, 1.0, P.frameMetal, x, cy - 0.5, z);
      }
    }
    // drainpipe
    b.part(new THREE.CylinderGeometry(0.09, 0.09, H, 8), P.rustAccent, { at: [x + s * 0.1, Y0 + H / 2, 3.2] });
    for (let k = 0; k < 5; k++) box(0.08, 0.1, 0.3, P.frameMetal, x + s * 0.1, Y0 + 0.8 + k * 2.2, 3.2);
    // expansion joint
    box(0.1, H, 0.12, P.soffitShadow, x, Y0 + H / 2, -0.4 + 0);
  }
  // back
  for (let f = 0; f < floors; f++) {
    const cy = Y0 + 0.4 + fh * (f + 0.5);
    for (const x of [-3, 0.5, 3.2]) {
      if (R() < 0.5) continue;
      box(1.0, 0.8, 0.08, P.soffitShadow, x, cy, -4);
      box(0.85, 0.65, 0.1, P.glassDark, x, cy, -4.01);
    }
  }
  box(0.12, H, 0.1, P.soffitShadow, 0, Y0 + H / 2, -4.02);
}
    return buildTowerSlab;
  })(),
  // upperVolume
  (() => {
function buildUpperVolume({ b, J, P, M }: Ctx) {
  const X0 = -6, X1 = 3, Y0 = 16, Y1 = 21, Z0 = -4, Z1 = 4.5;
  const W = X1 - X0, D = Z1 - Z0, H = Y1 - Y0;
  const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2;
  const R = rng(9);

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // main mass: raw concrete core, slightly inset so fascia/fins read as layers
  box(W, H - 0.9, D, cx, Y0 + 0.9 + (H - 0.9) / 2, cz, P.rawConcrete);
  // deep soffit fascia
  box(W, 0.9, D, cx, Y0 + 0.45, cz, P.soffitShadow);
  box(W + 0.1, 0.25, D + 0.1, cx, Y0 + 0.95, cz, P.concreteDark);
  // roof slab and parapet lip
  box(W + 0.2, 0.25, D + 0.2, cx, Y1 - 0.125, cz, P.concreteDark);
  box(W + 0.2, 0.08, D + 0.2, cx, Y1 + 0.0, cz, P.weatherStain);

  // weathering stains under the soffit
  for (let i = 0; i < 9; i++) {
    const x = X0 + 0.5 + R() * (W - 1);
    box(0.12 + R() * 0.15, 0.4 + R() * 0.4, 0.05, x, Y0 + 0.9 - 0.1, Z1 + 0.03, P.weatherStain);
  }

  // ribbon windows: front (+Z) and left (-X)
  const wy = Y0 + 2.7, wh = 1.7;
  // front
  box(W - 0.4, wh, 0.12, cx, wy, Z1 + 0.01, P.frameMetal);
  box(W - 0.6, wh - 0.2, 0.14, cx, wy - 0.05, Z1 + 0.03, P.glassDark);
  box(W - 0.6, 0.45, 0.15, cx, wy + 0.6, Z1 + 0.04, P.glassPale);
  // left
  box(0.12, wh, D - 0.4, X0 - 0.01, wy, cz, P.frameMetal);
  box(0.14, wh - 0.2, D - 0.6, X0 - 0.03, wy - 0.05, cz, P.glassDark);
  box(0.15, 0.45, D - 0.6, X0 - 0.04, wy + 0.6, cz, P.glassPale);

  // sills
  box(W - 0.2, 0.12, 0.3, cx, wy - wh / 2 - 0.06, Z1 + 0.12, P.concreteCream);
  box(0.3, 0.12, D - 0.2, X0 - 0.12, wy - wh / 2 - 0.06, cz, P.concreteCream);

  // mullions
  for (let i = 1; i < 6; i++) {
    const x = X0 + i * 1.5;
    box(0.05, wh, 0.06, x, wy, Z1 + 0.08, P.frameMetal);
  }
  for (let z = Z0 + 1.5; z < Z1 - 0.5; z += 1.5)
    box(0.06, wh, 0.05, X0 - 0.08, wy, z, P.frameMetal);

  // chunky fins every 1.5m
  for (let x = X0; x <= X1 + 0.01; x += 1.5) {
    box(0.4, H - 0.9, 0.5, Math.min(x + 0.0, X1 - 0.1), Y0 + 0.9 + (H - 0.9) / 2, Z1 + 0.15, P.rawConcrete);
  }
  for (let z = Z0 + 0.0; z <= Z1 + 0.01; z += 1.5) {
    box(0.5, H - 0.9, 0.4, X0 - 0.15, Y0 + 0.9 + (H - 0.9) / 2, Math.min(z, Z1 - 0.1), P.rawConcrete);
  }

  // loggia notch on front: dark recess on right portion with railing
  const lx = X1 - 2.2;
  box(2.6, 2.4, 0.2, lx, Y0 + 3.2, Z1 + 0.22, P.soffitShadow);
  box(2.4, 2.2, 0.05, lx, Y0 + 3.2, Z1 + 0.34, P.inkBlack);
  box(2.4, 0.06, 0.06, lx, Y0 + 2.4, Z1 + 0.4, P.frameMetal);
  for (let i = 0; i < 9; i++) box(0.04, 0.8, 0.04, lx - 1.1 + i * 0.275, Y0 + 2.0, Z1 + 0.4, P.frameMetal);
  box(2.4, 0.06, 0.06, lx, Y0 + 1.6, Z1 + 0.4, P.frameMetal);

  // party wall on right side (+X): cream panel and number 9
  box(0.1, H - 1.1, D - 0.6, X1 + 0.02, Y0 + 0.9 + (H - 1.1) / 2 + 0.1, cz, P.concreteCream);
  const nx = X1 + 0.1, ny = Y0 + 3.0, nz = cz + 0.0;
  box(0.04, 0.12, 0.6, nx, ny + 0.7, nz, P.inkBlack);
  box(0.04, 0.12, 0.6, nx, ny, nz, P.inkBlack);
  box(0.04, 0.12, 0.6, nx, ny - 0.7, nz, P.inkBlack);
  box(0.04, 0.82, 0.12, nx, ny + 0.35, nz - 0.24, P.inkBlack);
  box(0.04, 0.82, 0.12, nx, ny - 0.35, nz + 0.24, P.inkBlack);
  box(0.04, 0.82, 0.12, nx, ny + 0.35, nz + 0.24, P.inkBlack);

  // downpipes at overhang edge
  for (const x of [X0 + 0.5, cx, X1 - 0.5]) {
    b.part(new THREE.CylinderGeometry(0.09, 0.09, 1.1, 8), P.rustAccent, { at: [x, Y0 + 0.4, Z1 + 0.12] });
    box(0.22, 0.08, 0.22, x, Y0 + 0.95, Z1 + 0.12, P.rustAccent);
    box(0.2, 0.06, 0.2, x, Y0 - 0.12, Z1 + 0.12, P.rustAccent);
  }

  // vent slits and board-form lines on back/rear
  for (let i = 0; i < 4; i++) box(W, 0.03, 0.03, cx, Y0 + 1.5 + i * 0.9, Z0 - 0.02, P.concreteDark);
  for (let i = 0; i < 3; i++) box(0.9, 0.9, 0.1, X0 + 1.5 + i * 3, Y0 + 3, Z0 - 0.04, P.glassDark);
}
    return buildUpperVolume;
  })(),
  // serviceCore
  (() => {
function buildServiceCore({ b, J, P, M }: Ctx) {
  const X0 = 5, X1 = 7.2, Z0 = -3, Z1 = 0, H = 21.5;
  const cx = (X0 + X1) / 2, cz = (Z0 + Z1) / 2, W = X1 - X0, D = Z1 - Z0;
  const box = (w: number, h: number, d: number, col: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });
  const r = rng(11);

  // main shaft
  box(W, H, D, P.rawConcrete, cx, H / 2, cz);
  // board-formed horizontal seams on all faces
  for (let i = 1; i < 11; i++) {
    const y = i * 1.95;
    box(W + 0.03, 0.04, D + 0.03, P.concreteDark, cx, y, cz);
  }
  // plinth
  box(W + 0.12, 0.4, D + 0.12, P.concreteDark, cx, 0.2, cz);
  // lid
  box(W + 0.2, 0.3, D + 0.2, P.concreteDark, cx, H - 0.15, cz);
  box(W + 0.3, 0.08, D + 0.3, P.weatherStain, cx, H - 0.34, cz);

  // front slot of dark windows (+Z face)
  const zf = Z1;
  box(1.1, 16.2, 0.12, P.soffitShadow, cx, 12.6, zf - 0.02);
  for (let i = 0; i < 9; i++) {
    const y = 5.0 + i * 1.75 + 0.85;
    box(0.9, 1.45, 0.06, P.glassDark, cx, y + 2.3, zf + 0.02);
    box(0.7, 0.4, 0.02, P.glassPale, cx, y + 2.65, zf + 0.06);
  }
  // mullions
  for (let i = 0; i <= 9; i++) box(1.1, 0.07, 0.1, P.frameMetal, cx, 5.0 + i * 1.75 + 2.3 - 0.0 - 0.0 + 0.0 - 0.0 - 0.0 - 0.0 + 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 - 0.0 + 0 - 0.85 + 0.0, zf + 0.05);
  box(0.06, 16.2, 0.1, P.frameMetal, cx, 12.6, zf + 0.05);

  // left face (-X) rain streaking and rust band
  for (let i = 0; i < 9; i++) {
    const z = Z0 + 0.25 + r() * (D - 0.5);
    const h = 3 + r() * 9;
    box(0.03, h, 0.1 + r() * 0.2, P.weatherStain, X0 - 0.005, H - 0.6 - h / 2, z);
  }
  box(0.05, 1.3, D - 0.3, P.rustAccent, X0 - 0.01, 11, cz);
  for (let i = 0; i < 4; i++) box(0.07, 1.1, 0.04, P.soffitShadow, X0 - 0.02, 11, Z0 + 0.6 + i * 0.6);
  // right face drip stains
  for (let i = 0; i < 6; i++) {
    const z = Z0 + 0.3 + r() * (D - 0.6);
    const h = 2 + r() * 7;
    box(0.03, h, 0.15, P.weatherStain, X1 + 0.005, H - 0.6 - h / 2, z);
  }

  // ground door (front, near right edge)
  box(0.9, 2.2, 0.08, P.soffitShadow, 6.5, 1.5, zf + 0.0);
  box(0.8, 2.1, 0.08, P.signalRed, 6.5, 1.45, zf + 0.05);
  box(0.06, 0.2, 0.06, P.inkBlack, 6.2, 1.4, zf + 0.11);
  box(1.2, 0.12, 0.5, P.rawConcrete, 6.5, 2.65, zf + 0.25);
  box(1.2, 0.06, 0.5, P.weatherStain, 6.5, 2.58, zf + 0.25);
  // floor number plates
  for (let i = 0; i < 6; i++) {
    box(0.22, 0.22, 0.03, P.inkBlack, 5.45, 3.2 + i * 0.35, zf + 0.03);
    box(0.12, 0.04, 0.01, P.concreteCream, 5.45, 3.2 + i * 0.35, zf + 0.055);
  }
  // louvre grille near the top
  box(1.0, 0.8, 0.04, P.frameMetal, 6.5, 20.1, zf + 0.03);
  for (let i = 0; i < 6; i++) box(0.92, 0.04, 0.07, P.ventSteel, 6.5, 19.8 + i * 0.13, zf + 0.06);

  // back ladder bracket
  const zb = Z0;
  box(0.06, 18, 0.06, P.frameMetal, cx - 0.25, 9.8, zb - 0.12);
  box(0.06, 18, 0.06, P.frameMetal, cx + 0.25, 9.8, zb - 0.12);
  for (let i = 0; i < 40; i++) box(0.5, 0.03, 0.03, P.frameMetal, cx, 1 + i * 0.45, zb - 0.12);
  for (let i = 0; i < 5; i++) box(0.08, 0.08, 0.14, P.ventSteel, cx - 0.25, 2 + i * 4, zb - 0.06);
  // rust streak under lid and at base
  box(W, 0.2, 0.03, P.rustAccent, cx, 21.0, zb - 0.01);
  box(W, 0.5, 0.03, P.weatherStain, cx, 0.65, zf + 0.01);
}
    return buildServiceCore;
  })(),
  // roofscape
  (() => {
function buildRoofscape({ b, J, P, M }: Ctx) {
  const R = rng(9);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const Y = M.roofDeck[1];

  // parapet around the upper volume (x -6..3, z -4..4.5)
  const x0 = -6, x1 = 3, z0 = -4, z1 = 4.5, ph = 0.5, pt = 0.25;
  const pw = (w: number, d: number, x: number, z: number) => {
    box(w, ph, d, P.rawConcrete, x, Y + ph / 2, z);
    box(w + 0.06, 0.07, d + 0.06, P.weatherStain, x, Y + ph + 0.035, z);
  };
  pw(x1 - x0, pt, (x0 + x1) / 2, z1 - pt / 2);
  pw(x1 - x0, pt, (x0 + x1) / 2, z0 + pt / 2);
  pw(pt, z1 - z0, x0 + pt / 2, (z0 + z1) / 2);
  pw(pt, z1 - z0, x1 - pt / 2, (z0 + z1) / 2);

  // plant room
  const px = -3.6, pz = -1.8;
  box(2.4, 1.5, 2.0, P.rawConcrete, px, Y + 0.75, pz);
  box(2.5, 0.12, 2.1, P.concreteDark, px, Y + 1.56, pz);
  box(0.7, 1.1, 0.06, P.concreteDark, px + 0.5, Y + 0.55, pz + 1.03);
  box(0.06, 0.05, 0.1, P.inkBlack, px + 0.78, Y + 0.55, pz + 1.08);
  for (let i = 0; i < 5; i++) {
    box(0.6, 0.07, 0.06, P.ventSteel, px - 0.6, Y + 0.7 + i * 0.14, pz + 1.03);
    box(0.06, 0.07, 0.6, P.ventSteel, px - 1.23, Y + 0.7 + i * 0.14, pz);
  }

  // water tank on legs
  const tx = -0.2, tz = -1.8, legH = 0.5;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      box(0.14, legH, 0.14, P.frameMetal, tx + sx * 0.6, Y + legH / 2, tz + sz * 0.6);
    }
  box(1.5, 0.08, 1.5, P.frameMetal, tx, Y + legH + 0.04, tz);
  cyl(0.85, 0.85, 1.2, P.waterTank, tx, Y + legH + 0.08 + 0.6, tz, 16);
  cyl(0.6, 0.85, 0.2, P.waterTank, tx, Y + legH + 0.08 + 1.3, tz, 16);
  for (const h of [0.35, 0.8, 1.15])
    cyl(0.865, 0.865, 0.06, P.frameMetal, tx, Y + legH + 0.08 + h, tz, 16);
  // ladder
  for (const s of [-0.12, 0.12]) box(0.04, 1.6, 0.04, P.frameMetal, tx + s, Y + 0.85, tz + 0.95);
  for (let i = 0; i < 6; i++) box(0.28, 0.03, 0.03, P.frameMetal, tx, Y + 0.2 + i * 0.26, tz + 0.95);
  // rust pipe
  cyl(0.06, 0.06, 0.5, P.rustAccent, tx + 0.7, Y + 0.25, tz + 0.6, 8);
  box(0.3, 0.1, 0.12, P.rustAccent, tx + 0.55, Y + 0.5, tz + 0.6);

  // vent stacks
  const stack = (x: number, z: number, h: number) => {
    cyl(0.18, 0.18, h, P.ventSteel, x, Y + h / 2, z, 8);
    cyl(0.28, 0.2, 0.12, P.inkBlack, x, Y + h + 0.06, z, 8);
    cyl(0.24, 0.24, 0.08, P.frameMetal, x, Y + 0.04, z, 8);
  };
  stack(1.6, 1.2, 1.5);
  stack(2.2, -2.6, 1.0);
  stack(0.6, 2.8, 0.7);

  // antenna on core lid (core top y 21.5)
  box(0.5, 0.1, 0.5, P.concreteDark, 6.1, 21.55, -1.5);
  cyl(0.025, 0.04, 1.4, P.inkBlack, 6.1, 22.3, -1.5, 6);
  box(0.5, 0.03, 0.03, P.inkBlack, 6.1, 22.7, -1.5);
  box(0.3, 0.03, 0.03, P.inkBlack, 6.1, 22.4, -1.5);

  // gravel and moss patches
  for (let i = 0; i < 4; i++) {
    const x = -2 + R() * 4.5, z = 0.2 + R() * 3.2;
    cyl(0.4 + R() * 0.3, 0.45 + R() * 0.3, 0.03, P.pavingGrey, x, Y + 0.015, z, 7);
  }
  cyl(0.55, 0.6, 0.03, P.planterGreen, -4.2, Y + 0.02, 2.6, 8);
  cyl(0.3, 0.35, 0.04, P.planterGreen, -3.6, Y + 0.025, 3.1, 7);
}
    return buildRoofscape;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "blocHabitat9000" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
