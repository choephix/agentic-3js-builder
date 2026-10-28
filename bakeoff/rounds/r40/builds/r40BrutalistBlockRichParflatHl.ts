import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";

export const meta = {
  "name": "Brutalist Housing Block",
  "description": "A raw board-marked concrete slab block on massive pilotis, with deep eggcrate loggias, rear access galleries, a freestanding lift and stair tower at one end and a roof terrace with plant and a vaulted pavilion."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  concreteLight: "#b4b0a6",
  concreteMid: "#97938a",
  concreteWarm: "#aa9f8e",
  concreteDark: "#74716b",
  concreteDeep: "#55534f",
  boardMark: "#85827a",
  stain: "#5f5d58",
  mossStain: "#687058",
  rust: "#8c5a3a",
  shadowRecess: "#2f2e2d",
  glass: "#4a5d68",
  glassLit: "#f0c878",
  frameDark: "#232425",
  metalRail: "#3d4144",
  panelRed: "#b8432f",
  panelOchre: "#d39a2c",
  panelBlue: "#4f7391",
  panelWhite: "#e6e0d2",
  panelGreen: "#5c7f4a",
  timber: "#8a6a45",
  planterSoil: "#4a3a2c",
  plantGreen: "#5a7d3e",
  signWhite: "#efece4",
};
const M = {
  slabLeftEnd: [-32, 6, 0] as [number, number, number],
  slabRightEnd: [18, 6, 0] as [number, number, number],
  pilotisTop: [0, 6, 0] as [number, number, number],
  slabRoofTop: [0, 27, 0] as [number, number, number],
  frontCoreWall: [0, 6, 7.5] as [number, number, number],
  frontLoggiaEdge: [0, 6, 11] as [number, number, number],
  backCoreWall: [0, 6, -7.5] as [number, number, number],
  backGalleryEdge: [0, 6, -9.5] as [number, number, number],
  backStairTowerEdge: [0, 6, -11] as [number, number, number],
  towerJoin: [18, 0, 0] as [number, number, number],
  towerCrownBase: [25, 27, 0] as [number, number, number],
  roofDeck: [-7, 27, 0] as [number, number, number],
  stairTowerA: [-22, 6, -9.25] as [number, number, number],
  stairTowerB: [-4, 6, -9.25] as [number, number, number],
  stairTowerC: [12, 6, -9.25] as [number, number, number],
  lobbyDoor: [-5, 0, 11] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // slabCore
  (() => {
function buildSlabCore({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm];
  const X0 = -32, X1 = 18, Z = 7.5;

  // pour lifts, 7 storeys, each split in two tonal halves along x
  for (let k = 0; k < 7; k++) {
    const y0 = 6 + 3 * k + 0.04, y1 = 9 + 3 * k - 0.04;
    const cuts = [X0, -7, 3, X1];
    for (let i = 0; i < 3; i++) {
      box(cuts[i] + 0.03, y0, -Z, cuts[i + 1] - 0.03, y1, Z, tones[(k * 2 + i + (R() < 0.3 ? 1 : 0)) % 3]);
    }
    // cast joint between lifts (front, back, gables)
    if (k > 0) {
      const y = 6 + 3 * k;
      box(X0, y - 0.04, Z - 0.02, X1, y + 0.04, Z + 0.03, P.shadowRecess);
      box(X0, y - 0.04, -Z - 0.03, X1, y + 0.04, -Z + 0.02, P.shadowRecess);
      box(X0 - 0.03, y - 0.04, -Z, X0 + 0.02, y + 0.04, Z, P.shadowRecess);
      box(X1 - 0.02, y - 0.04, -Z, X1 + 0.03, y + 0.04, Z, P.shadowRecess);
    }
    // board marks on front and back walls
    for (let j = 0; j < 5; j++) {
      const y = y0 + 0.3 + j * 0.55;
      box(X0, y, Z, X1, y + 0.03, Z + 0.03, P.boardMark);
      box(X0, y, -Z - 0.03, X1, y + 0.03, -Z, P.boardMark);
    }
  }
  // soffit and roof edge band
  box(X0, 6, -Z, X1, 6.35, Z, P.concreteDeep);
  box(X0 - 0.1, 26.7, -Z - 0.1, X1 + 0.1, 27, Z + 0.1, P.concreteLight);
  box(X0 - 0.1, 26.5, -Z - 0.1, X1 + 0.1, 26.7, Z + 0.1, P.concreteDark);
  // expansion joints
  for (const x of [-7, 3]) {
    box(x - 0.05, 6.35, Z, x + 0.05, 26.7, Z + 0.04, P.shadowRecess);
    box(x - 0.05, 6.35, -Z - 0.04, x + 0.05, 26.7, -Z, P.shadowRecess);
  }

  // tie-rod grids on gables
  const disc = new THREE.CylinderGeometry(0.05, 0.05, 0.03, 6);
  for (const gx of [X0, X1]) {
    const s = gx < 0 ? -1 : 1;
    for (let iy = 0; iy < 9; iy++)
      for (let iz = 0; iz < 8; iz++) {
        if (gx === X0 && Math.abs(iz - 3.5) < 0.6 && iy > 0) continue;
        b.part(disc, P.shadowRecess, {
          at: [gx + s * 0.01, 7.2 + iy * 2.1, -6.3 + iz * 1.8],
          dir: [s, 0, 0],
        });
      }
  }
  // gable details
  for (const gx of [X0, X1]) {
    const s = gx < 0 ? -1 : 1;
    const o = gx + s * 0.04;
    // stair-light slit
    box(Math.min(gx, o) - 0.03 * (s > 0 ? 0 : 1), 8, 5.3, Math.max(gx, o) + 0.03, 25, 5.8, P.shadowRecess);
    box(gx + s * 0.02 - 0.02, 8.1, 5.4, gx + s * 0.02 + 0.02, 24.9, 5.7, P.glass);
    box(gx + s * 0.03 - 0.02, 8.1, 5.5, gx + s * 0.03 + 0.02, 24.9, 5.6, P.glassLit);
    // stains
    for (let i = 0; i < 9; i++) {
      const z = -6.8 + R() * 13, h = 3 + R() * 7;
      box(gx + (s > 0 ? 0 : -0.04), 26.4 - h, z, gx + (s > 0 ? 0.04 : 0), 26.4, z + 0.2 + R() * 0.3, R() < 0.5 ? P.stain : P.mossStain);
    }
    box(gx + (s > 0 ? 0 : -0.05), 25.2, -6, gx + (s > 0 ? 0.05 : 0), 26.5, 6, P.rust);
  }
  // storey-number emblem "7" on left gable (white small boxes), z in -4..-1
  const ex = X0 - 0.05;
  const seg = (z0: number, y0: number, z1: number, y1: number) =>
    box(ex, y0, z0, X0 + 0.01, y1, z1, P.signWhite);
  seg(-4.5, 22, -1.5, 22.7);
  seg(-2.2, 16, -1.5, 22.7);
  seg(-3.2, 18.5, -2.6, 19.2);
  // right-gable emblem
  box(X1, 22, -4.5, X1 + 0.05, 22.7, -1.5, P.signWhite);
  box(X1, 16, -2.2, X1 + 0.05, 22.7, -1.5, P.signWhite);

  // staining under roof band on front/back
  for (let i = 0; i < 24; i++) {
    const x = X0 + 1 + R() * 48, h = 2 + R() * 5;
    const sgn = R() < 0.5 ? 1 : -1;
    const zz = sgn * Z;
    box(x, 26.5 - h, Math.min(zz, zz + sgn * 0.02) , x + 0.2, 26.5, Math.max(zz, zz + sgn * 0.02) + 0.02, R() < 0.6 ? P.stain : P.mossStain);
  }
}
    return buildSlabCore;
  })(),
  // frontFacade
  (() => {
function buildFrontFacade({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, color: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), color, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm];
  const panels = [P.panelRed, P.panelOchre, P.panelBlue, P.panelWhite, P.panelGreen];
  const X0 = -32, Y0 = 6, Z0 = 7.5, Z1 = 11;

  // party fins
  for (let i = 0; i <= 10; i++) {
    const x = X0 + 5 * i;
    box(x - 0.175, Y0, Z0, x + 0.175, 27, Z1, tones[(i + 1) % 3]);
    for (let k = 0; k < 14; k++) {
      const y = Y0 + 0.75 + k * 1.5;
      box(x - 0.2, y, Z0 + 0.1, x + 0.2, y + 0.04, Z1 - 0.1, P.boardMark);
    }
    box(x - 0.05, 6.4, Z1, x + 0.05, 26.6, Z1 + 0.03, P.stain);
  }

  // slabs
  for (let k = 0; k <= 7; k++) {
    const y = Y0 + 3 * k;
    const y0 = k === 0 ? y : y - 0.175;
    const y1 = k === 7 ? y : y + 0.175;
    box(X0, y0, Z0, 18, y1 === y0 ? y0 + 0.2 : y1, Z1, tones[k % 3]);
    box(X0, y0, Z1 - 0.02, 18, y1 === y0 ? y0 + 0.2 : y1, Z1 + 0.03, P.concreteDark);
    box(X0, y0 + 0.08, Z0 + 0.1, 18, y0 + 0.12, Z1 - 0.1, P.boardMark);
    if (k > 0) for (let i = 0; i < 6; i++) {
      const sx = X0 + R() * 50;
      box(sx, y - 1.6 - R() * 0.8, Z1 + 0.02, sx + 0.12, y - 0.18, Z1 + 0.04, R() < 0.5 ? P.stain : P.mossStain);
    }
  }
  // top-storey shadow strip
  box(X0, 26.55, Z0 + 0.05, 18, 26.8, Z1 - 0.1, P.concreteDeep);

  // loggias
  for (let i = 0; i < 10; i++) for (let k = 0; k < 7; k++) {
    const cx = X0 + 5 * i + 2.5;
    const yb = Y0 + 3 * k + 0.175;
    const raw = R() < 0.33;
    const zb = Z0 + 0.03;
    if (!raw) box(cx - 2.3, yb, Z0, cx + 2.3, yb + 2.6, zb + 0.05, panels[Math.floor(R() * 5)]);
    if (R() < 0.27) {
      const dx = cx + (R() < 0.5 ? -1 : 1) * 0.8;
      box(dx - 0.9, yb, zb + 0.05, dx + 0.9, yb + 2.2, zb + 0.12, P.frameDark);
      box(dx - 0.8, yb + 0.1, zb + 0.12, dx + 0.8, yb + 2.1, zb + 0.16, R() < 0.4 ? P.glassLit : P.glass);
      box(dx - 0.02, yb + 0.1, zb + 0.16, dx + 0.02, yb + 2.1, zb + 0.2, P.frameDark);
    } else if (R() < 0.35) {
      box(cx + 1.2, yb, zb + 0.05, cx + 2.0, yb + 2.05, zb + 0.12, P.timber);
    }
    if (R() < 0.5) {
      const zr = Z1 - 0.1;
      box(cx - 2.3, yb + 1.05, zr - 0.02, cx + 2.3, yb + 1.1, zr + 0.03, P.metalRail);
      for (let p = 0; p <= 6; p++) {
        const px = cx - 2.25 + p * 0.75;
        box(px - 0.02, yb, zr - 0.02, px + 0.02, yb + 1.05, zr + 0.02, P.metalRail);
      }
    }
    if (R() < 0.3) {
      const px = cx + (R() < 0.5 ? -1.3 : 1.3);
      box(px - 0.6, yb, 9.4, px + 0.6, yb + 0.4, 10.0, P.planterSoil);
      box(px - 0.5, yb + 0.4, 9.5, px + 0.5, yb + 0.75, 9.9, P.plantGreen);
    } else if (R() < 0.12) {
      box(cx - 1.5, yb + 1.8, 10.5, cx + 1.5, yb + 1.83, 10.52, P.signWhite);
      box(cx - 1.2, yb + 1.3, 10.5, cx - 0.8, yb + 1.8, 10.52, P.panelBlue);
    } else if (R() < 0.12) {
      box(cx, yb, 10, cx + 0.45, yb + 0.45, 10.45, P.timber);
    }
  }
  // house number plates
  box(-31.6, 7.2, Z1 + 0.04, -30.4, 7.5, Z1 + 0.06, P.signWhite);
  box(-30.2, 7.2, Z1 + 0.04, -29.0, 7.5, Z1 + 0.06, P.signWhite);
}
    return buildFrontFacade;
  })(),
  // backGalleries
  (() => {
function buildBackGalleries({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      bone: undefined,
    });
  const X0 = -32, X1 = 18;
  const towers = [-22, -4, 12];
  const inTower = (x: number) => towers.some((t) => Math.abs(x - t) < 2.6);

  // decks, parapets, rails
  for (let k = 0; k < 8; k++) {
    const y = 6 + 3 * k;
    const tone = [P.concreteMid, P.concreteLight, P.concreteWarm][k % 3];
    box(X0, X1, y, y + 0.4, -9.5, -7.5, P.concreteDark);
    if (k < 7) {
      box(X0, X1, y + 0.4, y + 1.5, -9.5, -9.2, tone);
      box(X0, X1, y + 1.5, y + 1.58, -9.6, -9.1, P.metalRail);
      for (let i = 0; i < 4; i++) box(X0, X1, y + 0.7 + i * 0.25, y + 0.73 + i * 0.25, -9.52, -9.48, P.boardMark);
      // fixings rust streaks
      for (let i = 0; i < 10; i++) {
        const x = X0 + 2.5 + i * 5;
        if (inTower(x)) continue;
        box(x - 0.04, x + 0.04, y + 0.45, y + 1.4, -9.53, -9.5, P.rust);
        box(x + 1.3, x + 1.4, y + 0.4, y + 1.2, -9.53, -9.5, R() > 0.5 ? P.stain : P.mossStain);
      }
    }
  }

  // doors and windows per bay
  for (let k = 0; k < 7; k++) {
    const y = 6 + 3 * k;
    for (let i = 0; i < 10; i++) {
      const cx = X0 + 2.5 + i * 5;
      if (inTower(cx)) continue;
      const dx = cx - 1;
      box(dx - 0.6, dx + 0.6, y + 0.4, y + 2.5, -7.55, -7.4, P.frameDark);
      box(dx - 0.5, dx + 0.5, y + 0.4, y + 2.4, -7.6, -7.45, P.timber);
      box(dx + 0.7, dx + 1.1, y + 1.3, y + 2.2, -7.58, -7.45, P.glassLit);
      box(dx - 0.35, dx + 0.35, y + 0.4, y + 0.45, -8.4, -7.7, P.signWhite);
      box(dx - 0.2, dx + 0.2, y + 1.7, y + 1.9, -7.62, -7.5, P.signWhite);
      // kitchen window
      box(cx + 0.9, cx + 2.3, y + 1.4, y + 2.3, -7.55, -7.45, P.frameDark);
      box(cx + 0.98, cx + 2.22, y + 1.48, y + 2.22, -7.6, -7.5, R() > 0.4 ? P.glass : P.glassLit);
      if (i % 2 === 0) box(dx - 0.9, dx + 0.9, y + 2.55, y + 2.8, -8.6, -7.5, P.concreteLight);
    }
  }

  // drainpipes
  for (let i = 0; i <= 10; i++) {
    const x = X0 + 5 * i + (i === 10 ? -0.3 : 0.3);
    if (inTower(x)) continue;
    box(x - 0.06, x + 0.06, 6.4, 27, -9.45, -9.3, P.metalRail);
  }

  // stair towers
  for (const tx of towers) {
    const a = tx - 2.25, c = tx + 2.25;
    for (let k = 0; k < 7; k++) {
      const y0 = 6 + 3 * k;
      const tone = k % 2 ? P.concreteDark : P.concreteMid;
      box(a, c, y0, y0 + 3, -11, -9.5, tone);
      box(a, c, y0 + 2.95, y0 + 3, -11.03, -9.5, P.shadowRecess);
      for (let i = 0; i < 3; i++) box(a, c, y0 + 0.5 + i * 0.9, y0 + 0.53 + i * 0.9, -11.03, -10.7, P.boardMark);
      for (const s of [-1, 1]) {
        const sx = tx + s * 1.2;
        box(sx - 0.2, sx + 0.2, y0 + 0.4, y0 + 2.6, -11.05, -11, P.frameDark);
        box(sx - 0.14, sx + 0.14, y0 + 0.5, y0 + 2.5, -11.08, -11.04, P.glass);
        box(sx - 0.04, sx + 0.04, y0 + 0.6, y0 + 2.4, -11.1, -11.08, P.glassLit);
      }
      box(tx - 0.05, tx + 0.05, y0 + 0.3, y0 + 2.9, -11.06, -11.03, P.stain);
      // bridge to the core wall
      box(a, c, y0, y0 + 0.4, -9.5, -7.5, P.concreteDeep);
    }
    box(a - 0.3, c + 0.3, 27, 27.4, -11.3, -7.5, P.concreteLight);
    box(a - 0.3, c + 0.3, 26.8, 27, -11.3, -9.5, P.shadowRecess);
    box(a + 0.5, a + 0.7, 20, 26.8, -11.07, -11.03, P.mossStain);
  }
}
    return buildBackGalleries;
  })(),
  // groundStorey
  (() => {
function buildGroundStorey({ b, P, M }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm];

  // piloti columns: stacked tapered pieces with board marks, splash base, moss
  const colX = [-31, -27, -17, -7, 3, 13, 17];
  const heavy = (x: number) => x === -31 || x === 17;
  for (const z of [-5.5, 5.5]) {
    colX.forEach((x, i) => {
      const w0 = heavy(x) ? 2.0 : 1.6, w1 = heavy(x) ? 2.8 : 2.4;
      const d0 = heavy(x) ? 3.6 : 3.2, d1 = heavy(x) ? 4.0 : 3.6;
      const tone = tones[(i + (z > 0 ? 1 : 0)) % 3];
      // lower splashed frustum
      const lo = new THREE.CylinderGeometry(1, 1, 1, 4, 1).toNonIndexed();
      b.part(new THREE.BoxGeometry(w0 + 0.1, 1.2, d0 + 0.1), P.concreteDark, { at: [x, 0.6, z] });
      // tapered shaft using frustum from box-like cylinder (4 sides rotated 45deg)
      const g = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, 1, 4, 1);
      g.rotateY(Math.PI / 4);
      const shaft1 = new THREE.CylinderGeometry(1, 1, 1, 4);
      shaft1.rotateY(Math.PI / 4);
      const tp = (h: number, a0: number, b0: number, a1: number, b1: number, y: number, c: string) => {
        const geo = new THREE.CylinderGeometry(Math.SQRT1_2, Math.SQRT1_2, h, 4);
        geo.rotateY(Math.PI / 4);
        const p = geo.getAttribute("position");
        for (let k = 0; k < p.count; k++) {
          const top = p.getY(k) > 0;
          p.setX(k, p.getX(k) * (top ? a1 : a0));
          p.setZ(k, p.getZ(k) * (top ? b1 : b0));
        }
        geo.computeVertexNormals();
        b.part(geo, c, { at: [x, y, z], flat: true });
      };
      tp(2.4, w0 + 0.1, d0 + 0.1, w0 + (w1 - w0) * 0.45, d0 + (d1 - d0) * 0.45, 2.4, tone);
      tp(2.4, w0 + (w1 - w0) * 0.45, d0 + (d1 - d0) * 0.45, w1, d1, 4.8, tones[(i + 1) % 3]);
      // board marks on front face
      for (let k = 0; k < 8; k++) {
        const y = 1.4 + k * 0.5, t = (y - 1.2) / 4.8;
        const w = w0 + (w1 - w0) * t;
        const d = d0 + (d1 - d0) * t;
        box(x - w / 2 * 0.9, y, z + d / 2 - 0.03, x + w / 2 * 0.9, y + 0.04, z + d / 2 + 0.02, P.boardMark);
      }
      // moss splash
      box(x - w0 / 2, 1.2, z + d0 / 2 + 0.01, x - w0 / 2 + 0.4, 1.9, z + d0 / 2 + 0.04, P.mossStain);
      // stain streak
      box(x + 0.2, 2.0, z + d0 / 2 + 0.05, x + 0.3, 4.6, z + d0 / 2 + 0.07, P.stain);
    });
  }

  // transfer beams
  for (const z of [-5.5, 5.5]) box(-32, 5, z - 0.8, 18, 6, z + 0.8, P.concreteMid);
  for (const x of colX) box(x - 0.6, 5, -5.5, x + 0.6, 6, 5.5, P.concreteMid);
  box(-32, 5.6, -11, 18, 6, 11, P.concreteDark);
  // plinth strip
  box(-32, 0, 10.6, 18, 0.3, 11, P.concreteDeep);

  // lobby
  box(-10, 0, -5, 0, 0.1, 5, P.concreteDeep);
  box(-10, 0.1, -5, 0, 4.6, -4.8, P.concreteWarm);
  box(-10, 0.1, -5, -9.8, 4.6, 5, P.concreteWarm);
  box(-0.2, 0.1, -5, 0, 4.6, 5, P.concreteWarm);
  box(-9.9, 0.1, 4.6, -0.1, 4.6, 4.8, P.glass);
  box(-9.9, 0.2, 4.6, -0.1, 4.5, 4.7, P.glass);
  box(-9.8, 0.2, 4.7, -0.2, 4.5, 4.75, P.glassLit);
  for (let i = 0; i <= 8; i++) box(-9.9 + i * 1.2, 0.1, 4.75, -9.8 + i * 1.2, 4.6, 4.9, P.frameDark);
  box(-9.9, 2.3, 4.75, -0.1, 2.4, 4.9, P.frameDark);
  box(-5.9, 0.1, 4.8, -5.1, 2.5, 4.95, P.timber);
  box(-4.9, 0.1, 4.8, -4.1, 2.5, 4.95, P.timber);
  box(-7.5, 3.3, 4.95, -2.5, 4.1, 5.0, P.signWhite);
  box(-7.2, 3.5, 5.0, -2.8, 3.9, 5.05, P.frameDark);
  // canopy
  box(-10, 4.6, 4.6, 0, 5, 11, P.concreteLight);
  box(-10, 4.6, 10.8, 0, 5, 11, P.concreteDark);
  // steps
  for (let i = 0; i < 4; i++) box(-8, i * 0.15, 5 + i * 0.8, -2, (i + 1) * 0.15 , 5.8 + i * 0.8 + 0.8 - 0.8, P.concreteLight);
  for (let i = 0; i < 4; i++) box(-8, 0, 5.8 + i * 0.8, -2, (4 - i) * 0.15, 6.6 + i * 0.8, P.concreteLight);
  // ramp
  b.part(new THREE.BoxGeometry(1.8, 0.2, 7), P.concreteMid, { at: [-0.9 + 1.9, 0.3, 8.6], rotation: [-5, 0, 0] });
  for (const x of [1, 2.9]) {
    box(x - 0.04, 0.4, 5.2, x + 0.04, 1.2, 5.3, P.metalRail);
    box(x - 0.04, 0.4, 11, x + 0.04, 0.8, 11.1, P.metalRail);
    box(x - 0.04, 1.1, 5.2, x + 0.04, 1.2, 11, P.metalRail);
  }
  for (const x of [-8.3, -1.7]) {
    box(x - 0.04, 0.2, 5.5, x + 0.04, 1.2, 5.6, P.metalRail);
    box(x - 0.04, 1.1, 5.5, x + 0.04, 1.2, 8.8, P.metalRail);
    box(x - 0.04, 0.2, 8.7, x + 0.04, 1.2, 8.8, P.metalRail);
  }

  // bike racks
  for (let i = 0; i < 6; i++) {
    const x = -26 + i * 1.2;
    box(x, 0, -9.5, x + 0.05, 0.9, -9.45, P.metalRail);
    box(x + 0.7, 0, -9.5, x + 0.75, 0.9, -9.45, P.metalRail);
    for (const dx of [0.1, 0.6]) {
      const w = new THREE.TorusGeometry(0.33, 0.03, 4, 12);
      b.part(w, P.frameDark, { at: [x + dx, 0.36, -9.6], rotation: [0, 90, 0] });
    }
    box(x - 0.02, 0.9, -9.6, x + 0.78, 0.95, -9.55, P.metalRail);
  }

  // planters
  [[-14, 10], [-12.5, 10], [6, 10], [7.5, 10], [-20, 9.8]].forEach(([x, z]) => {
    box(x - 0.7, 0, z - 0.4, x + 0.7, 0.7, z + 0.4, P.concreteDark);
    box(x - 0.6, 0.7, z - 0.3, x + 0.6, 0.78, z + 0.3, P.planterSoil);
    for (let k = 0; k < 4; k++)
      b.part(new THREE.IcosahedronGeometry(0.28 + R() * 0.1, 0), P.plantGreen, {
        at: [x - 0.45 + k * 0.3, 1.0 + R() * 0.1, z + (R() - 0.5) * 0.3],
      });
  });

  // post lamps
  for (const x of [-12, 2.5]) {
    box(x - 0.06, 0, 9.4, x + 0.06, 3.8, 9.52, P.metalRail);
    b.part(new THREE.BoxGeometry(0.4, 0.4, 0.4), P.glassLit, { at: [x, 4.0, 9.46] });
    box(x - 0.25, 4.2, 9.26, x + 0.25, 4.28, 9.66, P.frameDark);
  }

  // emblem on pier: "blok" in small boxes
  const px = -17, pz = 5.5 + 1.8 + 0.05;
  box(px - 1.1, 2.0, pz - 0.03, px + 1.1, 3.6, pz + 0.02, P.concreteDeep);
  const bar = (x: number, y: number, w: number, h: number) =>
    box(px + x, 2.1 + y, pz + 0.02, px + x + w, 2.1 + y + h, pz + 0.06, P.signWhite);
  // b
  bar(-0.95, 0, 0.1, 1.3); bar(-0.95, 0, 0.35, 0.1); bar(-0.95, 0.6, 0.35, 0.1); bar(-0.7, 0, 0.1, 0.7);
  // l
  bar(-0.4, 0, 0.1, 1.3); bar(-0.4, 0, 0.3, 0.1);
  // o
  bar(0.05, 0, 0.35, 0.1); bar(0.05, 0.6, 0.35, 0.1); bar(0.05, 0, 0.1, 0.7); bar(0.3, 0, 0.1, 0.7);
  // k
  bar(0.6, 0, 0.1, 0.7); bar(0.7, 0.3, 0.3, 0.1); bar(0.85, 0.4, 0.1, 0.3); bar(0.85, 0, 0.1, 0.3);

  // rain streaks under the slab edge and mid beams
  for (let i = 0; i < 12; i++) {
    const x = -30 + i * 4.2 + R();
    box(x, 3.5, 10.9, x + 0.12, 5, 10.95, P.stain);
  }
  void M;
}
    return buildGroundStorey;
  })(),
  // serviceTower
  (() => {
function buildServiceTower({ b, P }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm, P.concreteMid, P.concreteLight];
  // base
  box(18, 0, -7.5, 32, 2, 7.5, P.concreteDark);
  // shaft lifts
  for (let i = 0; i < 9; i++) {
    const y0 = 2 + i * 3 - (i === 0 ? 0 : 0);
    const y1 = i === 8 ? 27 : y0 + 3;
    const c = tones[i % 5];
    box(18.5, y0, -7, 31.5, y1, 7, c);
    if (i > 0) {
      box(18.4, y0 - 0.04, -7.1, 31.6, y0 + 0.04, 7.1, P.shadowRecess);
    }
    // board marks
    for (let k = 0; k < 3; k++) {
      const y = y0 + 0.5 + k;
      if (y > 27) continue;
      box(18.5, y, 7, 31.5, y + 0.08, 7.03, P.boardMark);
      box(31.5, y, -7, 31.53, y + 0.08, 7, P.boardMark);
    }
  }
  // expansion joints
  for (const x of [22, 28]) box(x, 2, 7, x + 0.08, 27, 7.04, P.shadowRecess);
  // tie rod grid on +X face
  for (let z = -5; z <= 5; z += 2.5)
    for (let y = 4; y < 26; y += 3) {
      b.part(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 6), P.shadowRecess, {
        at: [31.52, y, z], dir: [1, 0, 0],
      });
    }
  // glazed slits front and end
  const slit = (x: number, z: number, onFront: boolean) => {
    const sx = onFront ? 0.9 : 0.1, sz = onFront ? 0.1 : 0.9;
    box(x - sx - 0.2, 3, z - sz - 0.2, x + sx + 0.2, 26, z + sz + 0.2, P.concreteDeep);
    box(x - sx, 3, z - sz + (onFront ? 0.15 : 0), x + sx, 26, z + sz + (onFront ? 0.15 : 0), P.glass);
    box(x - 0.1, 3.5, z + (onFront ? 0.28 : 0), x + 0.1, 25.5, z + (onFront ? 0.28 : 0) + (onFront ? 0.05 : 0), P.glassLit);
    for (let y = 6; y < 26; y += 4)
      box(x - sx, y, z + (onFront ? 0.3 : 0.1), x + sx, y + 0.1, z + (onFront ? 0.4 : 0.3), P.frameDark);
  };
  slit(25, 7, true);
  slit(31.5, 0, false);
  // balconies
  for (const y of [6, 12, 18, 24]) {
    box(20, y - 0.2, 7, 24, y + 0.1, 8.5, P.concreteDark);
    box(20, y + 0.1, 8.3, 24, y + 1.1, 8.5, P.concreteMid);
    box(20, y + 0.1, 7, 20.2, y + 1.1, 8.5, P.concreteMid);
    box(23.8, y + 0.1, 7, 24, y + 1.1, 8.5, P.concreteMid);
    box(20.5, y - 0.6, 8.4, 20.7, y - 0.2, 8.45, P.stain);
  }
  // link bridges
  for (let k = 0; k < 8; k++) {
    const y = 6 + 3 * k;
    if (y > 27) break;
    box(17, y, -1.5, 19, y + 0.35, 1.5, P.concreteDark);
  }
  // crown
  box(17.2, 27, -8.3, 32.8, 27.5, 8.3, P.shadowRecess);
  box(17.2, 27.5, -8.3, 32.8, 31, 8.3, P.concreteWarm);
  box(17.2, 30.7, -8.3, 32.8, 31, 8.3, P.concreteLight);
  box(18, 28.6, 8.3, 32, 29.6, 8.36, P.frameDark);
  box(18, 28.7, 8.36, 32, 29.5, 8.4, P.glassLit);
  for (let x = 19; x < 32; x += 2) box(x, 28.6, 8.36, x + 0.12, 29.6, 8.44, P.frameDark);
  box(32.8, 29.2, -2, 32.86, 30.2, 2, P.signWhite);
  box(32.8, 28.2, -8, 32.86, 28.6, 8, P.panelRed);
  // rust under overhang
  for (let i = 0; i < 6; i++) {
    const x = 19 + R() * 12;
    box(x, 24 + R(), 8.31, x + 0.2, 27, 8.34, P.rust);
  }
  // rain stains
  for (let i = 0; i < 8; i++) {
    const x = 19 + R() * 12;
    box(x, 8 + R() * 8, 7.02, x + 0.3, 14 + R() * 8, 7.05, i % 2 ? P.mossStain : P.stain);
  }
  // motor box, stacks, rod
  box(26, 31, -3, 30, 31 + 0.001, 3, P.concreteDark);
  box(22, 31, -4, 24, 31.001, -2, P.concreteDark);
  box(19, 30.9, 3, 21, 31, 5, P.concreteDark);
  box(18.5, 31, 3, 18.7, 31, 3.2, P.metalRail);
  // aviation lights and rod (kept inside y<=31)
  for (const [x, z] of [[18.5, -7.8], [32.4, 7.8]])
    box(x - 0.2, 30.6, z - 0.2, x + 0.2, 31, z + 0.2, P.panelRed);
  box(25, 29.5, -0.05, 25.1, 31, 0.05, P.metalRail);
}
    return buildServiceTower;
  })(),
  // roofTerrace
  (() => {
function buildRoofTerrace({ b, P }: any) {
  const R = rng(11);
  const box = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, c: string) =>
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      bone: undefined,
    });
  const tones = [P.concreteLight, P.concreteMid, P.concreteWarm, P.concreteDark];

  // roof deck
  box(-32, 26.95, -7.5, 18, 27.05, 7.5, P.concreteMid);
  for (let i = 0; i < 9; i++) box(-27 + i * 5 - 0.02, 27.05, -7.4, -27 + i * 5 + 0.02, 27.07, 7.4, P.shadowRecess);
  // rust and moss patches
  for (let i = 0; i < 8; i++) {
    const x = -30 + R() * 46, z = -6 + R() * 12;
    box(x, 27.05, z, x + 1 + R() * 1.5, 27.065, z + 0.8 + R(), i % 2 ? P.mossStain : P.rust);
  }

  // parapet: long sides in segments with varied tones
  for (const z of [7.5, -7.5]) {
    const s = z > 0 ? 1 : -1;
    for (let i = 0; i < 10; i++) {
      const x0 = -32 + i * 5;
      box(x0, 27, z - 0.2, x0 + 5, 28.2, z + 0.2, tones[(i + (s > 0 ? 0 : 1)) % 3]);
      for (let k = 0; k < 4; k++) box(x0, 27.2 + k * 0.28, z + s * 0.2, x0 + 5, 27.23 + k * 0.28, z + s * 0.215, P.boardMark);
      box(x0 + 2.4, 27.0, z + s * 0.2, x0 + 2.7, 28.0, z + s * 0.23, P.shadowRecess); // scupper
      box(x0 + 2.45, 27.0, z + s * 0.2, x0 + 2.6, 28.0, z + s * 0.22, P.stain);
    }
    box(-32.1, 28.2, z - 0.3, 18.1, 28.35, z + 0.3, P.concreteLight);
  }
  for (const x of [-32, 18]) {
    const s = x < 0 ? 1 : -1;
    box(x - (s > 0 ? 0 : 0.4) , 27, -7.7, x + (s > 0 ? 0.4 : 0), 28.2, 7.7, P.concreteMid);
    box(x - 0.1, 28.2, -7.8, x + 0.1 + 0.3, 28.35, 7.8, P.concreteLight);
  }

  // vaulted pavilion x[-20,-8]
  for (const x of [-20, -8.6]) for (const z of [-2.5, 2.2]) box(x, 27, z, x + 0.6, 29.2, z + 0.3, P.concreteDark);
  const vault = new THREE.CylinderGeometry(2.5, 2.5, 12, 14, 1, false, 0, Math.PI);
  b.part(vault, P.concreteWarm, { at: [-14, 29.2, 0], rotation: [0, 0, 90], flat: true } as any);
  // rotation puts half-cylinder arching up: rotate about Z then fix orientation
  for (const x of [-19.9, -8.1]) {
    box(x - 0.05, 27, -2.2, x + 0.05, 29.2, 2.2, P.frameDark);
    box(x - 0.08 * Math.sign(x + 14), 27.4, -1.9, x + 0.02, 28.9, 1.9, P.glassLit);
    box(x - 0.02, 27.2, -2.0, x + 0.04, 29.1, 2.0, P.glass);
  }
  box(-20.3, 29.0, -2.7, -7.7, 29.2, 2.7, P.concreteLight);

  // plant room x[0,10]
  box(0, 27, -4, 10, 29.6, 4, P.concreteMid);
  box(-0.2, 29.6, -4.2, 10.2, 29.8, 4.2, P.concreteLight);
  for (let i = 0; i < 10; i++) box(1 + i * 0.8, 27.6, 4, 1.6 + i * 0.8, 29, 4.06, P.frameDark);
  box(4.2, 27, 3.98, 5.8, 28.7, 4.05, P.timber);

  // water tank
  const tank = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 10);
  b.part(tank, P.metalRail, { at: [14, 28.6, -3], flat: true } as any);
  for (const y of [27.9, 29.3]) b.part(new THREE.CylinderGeometry(1.43, 1.43, 0.12, 10), P.rust, { at: [14, y, -3], flat: true } as any);
  for (const x of [12.9, 15.1]) for (const z of [-4.1, -1.9]) box(x - 0.08, 27, z - 0.08, x + 0.08, 27.5, z + 0.08, P.metalRail);
  box(15.35, 27, -3.1, 15.45, 29.6, -2.9, P.metalRail);
  for (let i = 0; i < 9; i++) box(15.3, 27.3 + i * 0.28, -3.1, 15.5, 27.34 + i * 0.28, -2.9, P.metalRail);

  // ventilation stacks
  const st = [[-29, -5, 3.2], [-25, 4, 2.4], [-3, -6, 3.8], [13, 5, 2.8], [16, -6, 3.0]];
  st.forEach(([x, z, h]) => {
    box(x - 0.45, 27, z - 0.45, x + 0.45, 27 + h, z + 0.45, P.concreteDark);
    box(x - 0.65, 27 + h, z - 0.65, x + 0.65, 27 + h + 0.2, z + 0.65, P.concreteLight);
    box(x - 0.2, 27, z + 0.45, x + 0.2, 27 + h, z + 0.48, P.stain);
  });

  // skylights
  for (let i = 0; i < 6; i++) {
    const x = -5 + i * 0 + 0, z = 0;
    void x; void z;
    const px = -30 + i * 2.2;
    b.part(new THREE.ConeGeometry(0.9, 0.7, 4), P.glass, { at: [px, 27.45, 0], rotation: [0, 45, 0], flat: true } as any);
    box(px - 0.65, 27.05, -0.65, px + 0.65, 27.15, 0.65, P.frameDark);
  }

  // benches and planters
  for (const x of [-4, 12, 16]) {
    box(x, 27, 6, x + 2, 27.45, 6.8, P.concreteWarm);
  }
  for (let i = 0; i < 5; i++) {
    const x = -28 + i * 4.2 + 2;
    box(x, 27, 6.1, x + 1.6, 27.6, 7.2, P.concreteDark);
    box(x + 0.1, 27.6, 6.2, x + 1.5, 27.7, 7.1, P.planterSoil);
    box(x + 0.2, 27.7, 6.3, x + 1.4, 28.4, 7.0, P.plantGreen);
  }

  // flagpole
  box(16.9, 27, 6.4, 17.0, 31, 6.5, P.metalRail);
  box(17.0, 30.2, 6.43, 18, 30.9, 6.47, P.panelRed);
}
    return buildRoofTerrace;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "brutalistHousingBlock" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
