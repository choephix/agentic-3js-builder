import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Nostromo Galley",
  "description": "A cutaway diorama of the grimy, lived-in galley and mess of a 1979 commercial tow ship: stainless counter run, locker wall with coffee machine and CRT, a bolted central mess table, a hazard-striped hatch and overhead pipework, all lit amber and green."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  wallCream: "#b9b198",
  wallGrey: "#8b8e88",
  wallDark: "#4b4d4a",
  seam: "#262725",
  deckGrate: "#34352f",
  deckPlate: "#54554d",
  steel: "#a9adb0",
  steelDark: "#666a6e",
  steelBright: "#d6dadc",
  grime: "#38362d",
  rust: "#7a4a2a",
  hazardYellow: "#d9a921",
  hazardBlack: "#1b1b19",
  rubber: "#1e1e1d",
  enamel: "#d9d6ca",
  pipeOrange: "#c8602a",
  pipeGrey: "#7c8081",
  amber: "#ffb020",
  crtGreen: "#5cff8a",
  alarmRed: "#e0361f",
  lampWhite: "#fff2cf",
  rationOlive: "#6b7a3a",
  cupBlue: "#3f6a8a",
};
const M = {
  floorTop: [0, 0.1, 0] as [number, number, number],
  leftWallFace: [1.7, 1.3, 0] as [number, number, number],
  rightWallFace: [-1.7, 1.3, 0] as [number, number, number],
  backWallFace: [0, 1.3, -2] as [number, number, number],
  ceilingUnderside: [0, 2.5, 0] as [number, number, number],
  counterTop: [1.375, 0.95, -0.3] as [number, number, number],
  counterFront: [1.05, 0.95, -0.3] as [number, number, number],
  overheadCabinetBase: [1.52, 1.45, -0.3] as [number, number, number],
  lockerFront: [-1.1, 1.1, -0.85] as [number, number, number],
  coffeeBenchTop: [-1.42, 0.95, 0.8] as [number, number, number],
  tableTop: [0, 0.78, 0.6] as [number, number, number],
  benchLeftTop: [0.66, 0.45, 0.6] as [number, number, number],
  benchRightTop: [-0.66, 0.45, 0.6] as [number, number, number],
  hatchCentre: [0, 1.05, -2] as [number, number, number],
  lampMountA: [0, 2.5, 0.1] as [number, number, number],
  lampMountB: [0, 2.5, 1.1] as [number, number, number],
  ceilingPipeRun: [0, 2.38, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // shell
  (() => {
function buildShell({ b, J, P, M }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rad: number, h: number, c: string, x: number, y: number, z: number, dir: number[]) =>
    b.part(new THREE.CylinderGeometry(rad, rad, h, 6), c, { at: [x, y, z], dir });

  // floor deck
  box(3.6, 0.08, 4.2, P.deckGrate, 0, 0.04, 0);
  for (let i = -8; i <= 8; i++) box(3.4, 0.02, 0.03, P.deckPlate, 0, 0.09, i * 0.24);
  for (let i = -7; i <= 7; i++) box(0.03, 0.02, 4.0, P.deckPlate, i * 0.24, 0.09, 0);
  box(0.8, 0.02, 3.0, P.deckPlate, 1.3, 0.105, -0.3);
  box(1.0, 0.02, 1.8, P.deckPlate, 0, 0.105, 0.6);
  // hazard threshold
  for (let i = 0; i < 18; i++) box(0.2, 0.012, 0.1, i % 2 ? P.hazardBlack : P.hazardYellow, -1.7 + i * 0.2, 0.105, 2.0);
  // corner grime wedges
  for (const sx of [1, -1]) for (const sz of [1, -1])
    box(0.3, 0.015, 0.3, P.grime, sx * 1.55, 0.108, sz * 1.8).rotation.y = Math.PI / 4;

  // walls: [centre x, centre z, width x, width z, is back]
  const walls: [number, number, number, number, number][] = [
    [1.75, 0, 0.1, 4.2, 1], [-1.75, 0, 0.1, 4.2, 1], [0, -2.05, 3.6, 0.1, 0]];
  for (const [x, z, wx, wz, side] of walls) {
    box(wx, 2.4, wz, P.wallCream, x, 1.3, z);
    box(wx + 0.02, 0.8, wz + 0.02, P.wallGrey, x, 0.5, z);
    box(wx + 0.04, 0.12, wz + 0.04, P.wallDark, x, 0.16, z);
  }
  // seams, rivets, grime on inner faces
  for (const s of [1, -1]) {
    const x = s * 1.69;
    for (let i = -4; i <= 4; i++) {
      const z = i * 0.5 - 0.0;
      box(0.012, 2.3, 0.02, P.seam, x, 1.3, z);
      for (let k = 0; k < 6; k++) cyl(0.012, 0.01, P.steelDark, x, 0.3 + k * 0.38, z + 0.04, [1, 0, 0]);
      box(0.01, 0.2 + r() * 0.5, 0.03, P.grime, x, 0.5 + r() * 0.3, z + 0.03);
    }
    box(0.012, 0.02, 4.0, P.seam, x, 0.9, 0);
    box(0.012, 0.02, 4.0, P.seam, x, 1.7, 0);
    box(0.02, 0.2, 0.4, P.rust, x, 0.22, s * 0.9 + 0.2);
  }
  for (let i = -3; i <= 3; i++) {
    const x = i * 0.5;
    box(0.02, 2.3, 0.012, P.seam, x, 1.3, -1.99);
    for (let k = 0; k < 6; k++) cyl(0.012, 0.01, P.steelDark, x + 0.04, 0.3 + k * 0.38, -1.99, [0, 0, 1]);
    box(0.03, 0.2 + r() * 0.5, 0.01, P.grime, x, 0.5 + r() * 0.3, -1.99);
  }
  box(3.4, 0.02, 0.012, P.seam, 0, 0.9, -1.99);
  box(0.5, 0.2, 0.02, P.rust, -1.2, 0.22, -1.99);
  // corner posts
  for (const [x, z] of [[1.7, -2], [-1.7, -2], [1.7, 2], [-1.7, 2]])
    box(0.14, 2.4, 0.14, P.wallDark, x === 1.7 ? 1.7 : -1.7, 1.3, z === -2 ? -1.97 : 1.97);
  // ceiling beams
  for (const s of [1, -1]) {
    box(0.2, 0.02, 4.2, P.steelDark, s * 1.7, 2.51, 0);
    box(0.2, 0.02, 4.2, P.steelDark, s * 1.7, 2.59, 0);
    box(0.03, 0.08, 4.2, P.steelDark, s * 1.7, 2.55, 0);
  }
  for (let i = 0; i < 5; i++) {
    const z = -2 + i * 1.0 + (i === 4 ? -0.05 : 0.05);
    box(3.4, 0.02, 0.2, P.steelDark, 0, 2.51, z);
    box(3.4, 0.02, 0.2, P.steelDark, 0, 2.59, z);
    box(3.4, 0.08, 0.03, P.steelDark, 0, 2.55, z);
    for (const s of [1, -1]) {
      box(0.3, 0.015, 0.3, P.wallDark, s * 1.7, 2.6, z);
      for (const dx of [-0.1, 0.1]) for (const dz of [-0.1, 0.1])
        cyl(0.015, 0.01, P.steel, s * 1.7 + dx, 2.615, z + dz, [0, 1, 0]);
    }
  }
  // stencil blocks
  for (let i = 0; i < 6; i++) box(0.1, 0.022, 0.2, i % 2 ? P.hazardBlack : P.hazardYellow, 1.7, 2.502, -0.5 + i * 0.1);
  for (let i = 0; i < 6; i++) box(0.2, 0.022, 0.1, i % 2 ? P.hazardBlack : P.hazardYellow, -0.3 + i * 0.1, 2.502, 0.95);
}
    return buildShell;
  })(),
  // galleyCounter
  (() => {
function buildGalleyCounter({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, col: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, col: string, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), col, { at: [x, y, z] });
  const rivet = (x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 6), P.steelBright, { at: [x, y, z], dir: [1, 0, 0] });
  const X0 = 1.05;

  // plinth and carcass
  box(0.6, 0.1, 3.2, P.wallDark, 1.38, 0.15, -0.32);
  box(0.62, 0.7, 3.2, P.steelDark, 1.39, 0.55, -0.32);

  // doors and drawers along z
  const zs = [-1.7, -1.2, -0.7, -0.2, 0.3, 0.9, 1.1];
  const slots = [-1.7, -1.2, -0.7, -0.3, 0.2, 0.7, 1.15];
  slots.forEach((z, i) => {
    const w = i === 3 ? 0.4 : 0.44;
    const drawer = i % 2 === 1;
    const h = drawer ? 0.2 : 0.6;
    const y = drawer ? 0.8 : 0.5;
    box(0.02, h, w, P.steel, X0 - 0.005, y, z);
    box(0.012, 0.004, w, P.grime, X0 - 0.014, y - h / 2 + 0.01, z);
    box(0.03, 0.025, w * 0.5, P.steelBright, X0 - 0.03, drawer ? y : y + 0.2, z);
    for (const dy of [-1, 1]) for (const dz of [-1, 1]) rivet(X0 - 0.015, y + dy * (h / 2 - 0.02), z + dz * (w / 2 - 0.02));
    if (i % 3 === 0) box(0.004, 0.04, 0.12, P.enamel, X0 - 0.017, y + (drawer ? 0 : -0.22), z - 0.1);
  });

  // countertop
  box(0.65, 0.04, 3.25, P.steel, 1.375, 0.93, -0.32);
  box(0.03, 0.05, 3.25, P.steelBright, 1.045, 0.945, -0.32);
  box(0.03, 0.05, 3.25, P.steelDark, 1.69, 0.97, -0.32);
  for (let i = 0; i < 6; i++) box(0.12 + R() * 0.1, 0.003, 0.1 + R() * 0.1, P.grime, 1.2 + R() * 0.3, 0.953, -1.8 + R() * 3);

  // cooktop
  box(0.5, 0.02, 0.7, P.rubber, 1.4, 0.96, -0.3);
  for (const bx of [1.3, 1.5]) for (const bz of [-0.45, -0.15]) {
    cyl(0.07, 0.07, 0.02, P.rubber, bx, 0.98, bz, 12);
    const r = b.part(new THREE.TorusGeometry(0.05, 0.007, 4, 12), P.amber, { at: [bx, 0.995, bz], dir: [0, 1, 0], axis: "z" });
    glow(r, 1.4);
  }
  for (let i = 0; i < 4; i++) b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), P.rubber, { at: [X0 - 0.03, 0.88, -0.5 + i * 0.13], dir: [-1, 0, 0] });
  // oven window
  box(0.01, 0.2, 0.3, P.rubber, X0 - 0.02, 0.5, -0.3);
  glow(box(0.01, 0.15, 0.24, P.amber, X0 - 0.027, 0.5, -0.3), 1.2);
  box(0.03, 0.03, 0.34, P.steelBright, X0 - 0.045, 0.7, -0.3);
  // pot
  cyl(0.085, 0.075, 0.11, P.steelDark, 1.3, 1.035, -0.15);
  cyl(0.088, 0.088, 0.015, P.steel, 1.3, 1.098, -0.15);
  box(0.05, 0.015, 0.02, P.rubber, 1.3, 1.11, -0.15);
  box(0.03, 0.02, 0.05, P.rubber, 1.3, 1.06, -0.04);
  box(0.03, 0.02, 0.05, P.rubber, 1.3, 1.06, -0.26);
  // pan
  cyl(0.1, 0.09, 0.03, P.rubber, 1.5, 1.02, -0.45);
  box(0.2, 0.015, 0.03, P.rubber, 1.5, 1.03, -0.62);

  // sink
  box(0.4, 0.02, 0.5, P.steelBright, 1.4, 0.955, 0.7);
  box(0.34, 0.1, 0.4, P.rubber, 1.4, 0.92, 0.7);
  cyl(0.02, 0.02, 0.3, P.steelBright, 1.62, 1.1, 0.7);
  box(0.16, 0.025, 0.025, P.steelBright, 1.54, 1.25, 0.7);
  box(0.01, 0.01, 0.08, P.steelDark, 1.62, 1.12, 0.78);
  for (let i = 0; i < 6; i++) box(0.3, 0.008, 0.012, P.steelDark, 1.4, 0.96, 1.0 + i * 0.04);
  // dish rack
  box(0.3, 0.01, 0.2, P.steelDark, 1.45, 0.975, 1.12);
  for (let i = 0; i < 3; i++) cyl(0.07, 0.07, 0.01, P.enamel, 1.45, 1.05, 1.05 + i * 0.07, 12).rotation.z = 0;

  // extractor hood
  b.part(new THREE.CylinderGeometry(0.2, 0.34, 0.4, 4, 1, false, Math.PI / 4), P.steel, { at: [1.5, 1.75, -0.3], scale: [1, 1, 1.4] });
  box(0.3, 0.02, 0.4, P.steelDark, 1.4, 1.56, -0.3);
  cyl(0.1, 0.1, 0.1, P.steelDark, 1.55, 2.0, -0.3, 6);
  glow(box(0.06, 0.02, 0.06, P.amber, 1.4, 1.54, -0.3), 1.5);

  // overhead cabinets
  const oc: [number, number][] = [[-1.7, 1.2], [0.4, 0.9]];
  oc.forEach(([zc, l], i) => {
    const z = zc + (i === 0 ? 0.7 : 0.2);
    box(0.35, 0.6, l, P.steelDark, 1.525, 1.75, z);
    box(0.015, 0.54, l - 0.06, P.steel, 1.345, 1.75, z);
    box(0.03, 0.08, 0.03, P.steelBright, 1.33, 1.5, z);
    box(0.004, 0.06, 0.12, P.hazardYellow, 1.337, 1.95, z + 0.15);
    rivet(1.34, 2.0, z - l / 2 + 0.04);
    rivet(1.34, 1.5, z + l / 2 - 0.04);
  });
  box(0.35, 0.6, 0.5, P.steelDark, 1.525, 1.75, 1.0);

  // utensil rail
  box(0.02, 0.02, 1.0, P.steelBright, 1.68, 1.2, -1.2);
  for (let i = 0; i < 4; i++) {
    const z = -1.6 + i * 0.2;
    box(0.02, 0.1, 0.012, P.steelDark, 1.66, 1.15, z);
    if (i === 0) cyl(0.03, 0.03, 0.02, P.steel, 1.66, 1.02, z, 8);
    if (i === 1) box(0.012, 0.18, 0.05, P.steelBright, 1.66, 1.05, z);
    if (i === 2) cyl(0.02, 0.005, 0.2, P.steelBright, 1.66, 1.05, z, 6);
  }
  box(0.01, 0.2, 0.12, P.rationOlive, 1.67, 1.02, -0.6);
  // timer box
  box(0.06, 0.1, 0.14, P.steelDark, 1.67, 1.45, 0.9);
  glow(box(0.01, 0.025, 0.025, P.amber, 1.635, 1.48, 0.9), 1.4);
  glow(box(0.01, 0.02, 0.02, P.alarmRed, 1.635, 1.42, 0.9), 1.4);
  // shelf with cups
  box(0.12, 0.015, 0.4, P.steelDark, 1.64, 1.3, 0.35);
  for (let i = 0; i < 3; i++) cyl(0.025, 0.02, 0.05, P.enamel, 1.64, 1.33, 0.22 + i * 0.12, 8);
}
    return buildGalleyCounter;
  })(),
  // messTable
  (() => {
function buildMessTable({ b, J, P, M }: any) {
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, seg = 10, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), c, { at: [x, y, z] });
  const CZ = 0.6;

  // Table top
  box(0.9, 0.06, 1.6, P.steelDark, 0, 0.75, CZ);
  box(0.94, 0.03, 1.64, P.steelBright, 0, 0.745, CZ);
  box(0.96, 0.025, 1.66, P.rubber, 0, 0.73, CZ);
  // Recessed lanes
  for (const z of [0.2, 0.65, 1.1]) box(0.7, 0.004, 0.36, P.wallDark, 0, 0.782, z);
  // Pedestal
  cyl(0.14, 0.58, P.steelDark, 0, 0.4, CZ, 8);
  cyl(0.2, 0.04, P.steel, 0, 0.12, CZ, 8);
  cyl(0.38, 0.03, P.deckPlate, 0, 0.115, CZ, 8);
  cyl(0.4, 0.012, P.grime, 0, 0.108, CZ, 8);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.012, 0.012, P.steelBright, Math.cos(a) * 0.33, 0.135, CZ + Math.sin(a) * 0.33, 6);
  }
  // Cross braces
  for (const s of [1, -1]) {
    box(0.5, 0.05, 0.05, P.steel, s * 0.25, 0.65, CZ);
    box(0.05, 0.05, 0.5, P.steel, 0, 0.6, CZ + s * 0.25);
  }
  // Condiment clips
  for (const s of [1, -1]) box(0.05, 0.02, 0.1, P.steelBright, s * 0.4, 0.795, -0.05);

  // Benches
  for (const s of [1, -1]) {
    const x = s * 0.66;
    box(0.28, 0.06, 1.2, P.steelDark, x, 0.42, 0.6);
    box(0.26, 0.04, 1.16, P.rubber, x, 0.47, 0.6);
    for (const z of [0.15, 1.05]) {
      box(0.05, 0.32, 0.05, P.steel, x, 0.26, z);
      box(0.2, 0.025, 0.12, P.steelDark, x, 0.113, z);
    }
    box(0.04, 0.04, 0.9, P.steel, s * 0.57, 0.2, 0.6);
    box(0.28, 0.01, 0.02, P.grime, x, 0.45, 1.19);
    box(0.08, 0.01, 0.04, P.enamel, x, 0.395, 0.6 + 0.0);
  }

  // Trays
  const tray = (x: number, z: number, food: () => void) => {
    box(0.3, 0.015, 0.4, P.steel, x, 0.79, z);
    box(0.3, 0.02, 0.012, P.steelBright, x, 0.8, z - 0.2);
    box(0.3, 0.02, 0.012, P.steelBright, x, 0.8, z + 0.2);
    box(0.012, 0.02, 0.4, P.steelBright, x - 0.15, 0.8, z);
    box(0.012, 0.02, 0.4, P.steelBright, x + 0.15, 0.8, z);
    box(0.012, 0.015, 0.36, P.steelDark, x, 0.805, z);
    food();
  };
  tray(0.2, 0.25, () => {
    box(0.08, 0.04, 0.1, P.rationOlive, 0.15, 0.82, 0.18);
    box(0.08, 0.04, 0.1, P.rationOlive, 0.15, 0.82, 0.32);
  });
  tray(-0.2, 0.3, () => {
    for (let i = 0; i < 5; i++) cyl(0.012, 0.012, P.enamel, -0.25 + i * 0.02, 0.82, 0.2 + (i % 2) * 0.04, 6);
    b.part(new THREE.SphereGeometry(0.035, 7, 5), P.rust, { at: [-0.18, 0.83, 0.38], scale: [1.4, 0.8, 1] });
  });
  tray(0.2, 1.0, () => {
    box(0.1, 0.05, 0.1, P.rationOlive, 0.2, 0.825, 0.95);
    box(0.05, 0.03, 0.08, P.enamel, 0.15, 0.815, 1.1);
  });

  // Mugs and cups
  const mug = (x: number, z: number, c: string) => {
    cyl(0.035, 0.08, c, x, 0.825, z, 10);
    cyl(0.03, 0.005, P.grime, x, 0.867, z, 10);
    b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 8), c, { at: [x + 0.04, 0.825, z], rotation: [0, 0, 0] });
  };
  mug(-0.12, 0.8, P.enamel);
  mug(0.05, 0.75, P.cupBlue);
  mug(-0.28, 1.1, P.cupBlue);
  mug(0.0, 1.25, P.enamel);
  cyl(0.04, 0.003, P.grime, -0.12, 0.783, 0.9, 10); // stain

  // Flask
  cyl(0.045, 0.2, P.steelBright, -0.3, 0.885, 0.6, 10);
  cyl(0.047, 0.03, P.amber, -0.3, 0.87, 0.6, 10);
  cyl(0.03, 0.03, P.steelDark, -0.3, 1.0, 0.6, 8);

  // Shakers
  cyl(0.018, 0.07, P.enamel, 0.3, 0.82, 0.62, 8);
  cyl(0.018, 0.07, P.steelDark, 0.34, 0.82, 0.62, 8);
  cyl(0.012, 0.015, P.steelBright, 0.3, 0.862, 0.62, 8);
  cyl(0.012, 0.015, P.steelBright, 0.34, 0.862, 0.62, 8);

  // Cutlery
  for (let i = 0; i < 3; i++)
    b.part(new THREE.BoxGeometry(0.012, 0.005, 0.16), P.steelBright, { at: [-0.05 + i * 0.03, 0.787, 0.5], rotation: [0, i * 8 - 8, 0] });

  // Foil pack
  b.part(new THREE.BoxGeometry(0.1, 0.02, 0.07), P.steelBright, { at: [-0.3, 0.795, 0.15], rotation: [5, 25, 8] });
  b.part(new THREE.BoxGeometry(0.06, 0.02, 0.05), P.steel, { at: [-0.3, 0.81, 0.15], rotation: [-8, 50, 5] });

  // Ration can
  cyl(0.04, 0.06, P.steel, 0.3, 0.815, 1.3, 10);
  cyl(0.035, 0.004, P.rust, 0.3, 0.846, 1.3, 10);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    b.part(new THREE.ConeGeometry(0.008, 0.02, 3), P.steelBright, { at: [0.3 + Math.cos(a) * 0.04, 0.855, 1.3 + Math.sin(a) * 0.04] });
  }

  // Datapad
  box(0.12, 0.014, 0.17, P.rubber, -0.05, 0.79, 1.3);
  glow(box(0.1, 0.004, 0.14, P.crtGreen, -0.05, 0.798, 1.3), 1.2);
  box(0.08, 0.005, 0.01, P.wallDark, -0.05, 0.801, 1.27);
  box(0.08, 0.005, 0.01, P.wallDark, -0.05, 0.801, 1.31);
  glow(box(0.01, 0.006, 0.01, P.amber, -0.09, 0.8, 1.37), 1);
}
    return buildMessTable;
  })(),
  // lockerWall
  (() => {
function buildLockerWall({ b, J, P, M }: Ctx) {
  const R = rng(5);
  // box helper: center x,y,z, size w(x),h(y),d(z)
  const box = (x: number, y: number, z: number, w: number, h: number, d: number, c: string, g = false) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
    if (g) glow(p, 1.2);
    return p;
  };
  const cyl = (x: number, y: number, z: number, r: number, h: number, c: string, axis: "x" | "y" | "z" = "y", seg = 10, g = false) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), c, {
      at: [x, y, z],
      dir: axis === "x" ? [1, 0, 0] : axis === "z" ? [0, 0, 1] : [0, 1, 0],
    });
    if (g) glow(p, 1.2);
    return p;
  };
  const FX = -1.1; // front plane
  // rivets on a front face (x = face)
  const rivets = (xf: number, z0: number, z1: number, y0: number, y1: number, c: string) => {
    for (const z of [z0, z1]) for (const y of [y0, y1]) cyl(xf - 0.006, y, z, 0.012, 0.012, c, "x", 6);
  };

  // back panel slab + skirting
  box(-1.68, 1.1, -0.8, 0.04, 2.0, 2.3, P.wallDark);
  box(-1.3, 0.14, -0.8, 0.8, 0.08, 2.3, P.wallDark);

  // LOCKERS
  const lockers = [
    { z: -1.58, c: P.enamel, kind: "fridge" },
    { z: -0.83, c: "#c9d4d8", kind: "freezer" },
    { z: -0.08, c: P.wallGrey, kind: "dry" },
  ];
  for (const L of lockers) {
    box(-1.4, 1.125, L.z, 0.6, 1.95, 0.77, P.steelDark); // carcass
    box(-1.12 - 0.01, 1.125, L.z, 0.04, 1.85, 0.7, L.c); // door
    // kick plate
    box(-1.12, 0.2, L.z, 0.05, 0.08, 0.7, P.wallDark);
    rivets(-1.11, L.z - 0.32, L.z + 0.32, 0.3, 2.0, P.steelDark);
    // seam frame strips
    box(-1.105, 1.125, L.z + 0.355, 0.02, 1.9, 0.02, P.seam);
    // label plate
    box(-1.1, 1.85, L.z, 0.015, 0.08, 0.3, P.enamel);
    box(-1.095, 1.85, L.z, 0.01, 0.015, 0.2, P.seam);
    // fingerprints
    for (let i = 0; i < 3; i++)
      box(-1.098, 1.0 + R() * 0.3, L.z + 0.15 + R() * 0.1, 0.006, 0.05, 0.03, P.grime);
    // corner scuffs
    box(-1.1, 0.35, L.z - 0.33, 0.012, 0.1, 0.05, P.grime);
    box(-1.1, 0.35, L.z + 0.33, 0.012, 0.1, 0.05, P.grime);
    // handle
    box(-1.07, 1.2, L.z + 0.28, 0.04, 0.3, 0.03, P.steelBright);
  }
  // fridge gasket + readout
  for (const dz of [-0.36, 0.36]) box(-1.105, 1.125, -1.58 + dz, 0.02, 1.88, 0.03, P.rubber);
  box(-1.105, 2.0, -1.58, 0.02, 0.03, 0.7, P.rubber);
  box(-1.105, 0.2, -1.58, 0.02, 0.03, 0.7, P.rubber);
  box(-1.095, 1.55, -1.45, 0.012, 0.07, 0.16, P.rubber);
  box(-1.09, 1.55, -1.45, 0.01, 0.045, 0.12, P.amber, true);
  // freezer hazard stripe + latch + red light
  for (let i = 0; i < 6; i++)
    box(-1.098, 0.55, -1.1 + i * 0.1 + 0.05 - 0.0, 0.01, 0.08, 0.05, i % 2 ? P.hazardBlack : P.hazardYellow);
  box(-1.07, 1.3, -0.62, 0.05, 0.12, 0.1, P.steelDark);
  cyl(-1.04, 1.3, -0.62, 0.025, 0.02, P.steel, "x", 8);
  cyl(-1.09, 1.5, -0.62, 0.018, 0.02, P.alarmRed, "x", 8, true);
  // dry store louvre + padlock
  for (let i = 0; i < 6; i++) box(-1.09, 1.7 + i * 0.035, -0.08, 0.015, 0.015, 0.3, P.wallDark);
  box(-1.07, 1.1, 0.2, 0.03, 0.07, 0.06, P.steel);
  cyl(-1.06, 1.05, 0.2, 0.01, 0.06, P.steelDark, "x", 6);
  b.part(new THREE.TorusGeometry(0.02, 0.006, 5, 8), P.steel, { at: [-1.065, 1.14, 0.2], dir: [1, 0, 0], axis: "z" });

  // COFFEE BENCH
  box(-1.42, 0.52, 0.83, 0.56, 0.84, 1.0, P.steelDark);
  box(-1.4, 0.15, 0.83, 0.5, 0.1, 1.0, P.wallDark);
  box(-1.4, 0.96, 0.83, 0.62, 0.04, 1.06, P.steel);
  box(-1.1, 0.96, 0.83, 0.02, 0.05, 1.06, P.steelBright);
  for (const z of [0.55, 1.05]) {
    box(-1.135, 0.55, z, 0.02, 0.5, 0.42, P.wallGrey);
    box(-1.12, 0.7, z, 0.02, 0.025, 0.2, P.steelBright);
    rivets(-1.125, z - 0.18, z + 0.18, 0.35, 0.78, P.steelDark);
  }
  box(-1.135, 0.8, 0.83, 0.02, 0.1, 0.4, P.wallGrey);
  box(-1.12, 0.8, 0.83, 0.02, 0.02, 0.15, P.steelBright);
  box(-1.12, 0.3, 0.83, 0.02, 0.2, 0.9, P.grime);

  // coffee machine
  box(-1.5, 1.2, 0.55, 0.3, 0.5, 0.3, P.steel);
  box(-1.5, 1.48, 0.55, 0.32, 0.06, 0.32, P.steelDark);
  box(-1.33, 1.1, 0.55, 0.06, 0.28, 0.26, P.steelDark);
  box(-1.36, 1.0, 0.55, 0.16, 0.03, 0.2, P.rubber); // drip tray
  cyl(-1.38, 1.18, 0.55, 0.07, 0.12, "#2a1a10", "y", 10); // pot
  cyl(-1.38, 1.18, 0.55, 0.075, 0.13, "#9ab0b0", "y", 10).mesh.material = (b.part(new THREE.BoxGeometry(0.001, 0.001, 0.001), "#9ab0b0", { at: [0, 0, 0] }).mesh.material as THREE.Material);
  cyl(-1.32, 1.33, 0.55, 0.012, 0.05, P.steelDark, "y", 6); // nozzle
  for (const dz of [-0.06, 0.06]) cyl(-1.325, 1.38, 0.55 + dz, 0.025, 0.015, P.rubber, "x", 8);
  cyl(-1.325, 1.28, 0.55, 0.012, 0.01, P.amber, "x", 8, true);
  // cup stack
  for (let i = 0; i < 4; i++) cyl(-1.55, 1.02 + i * 0.03, 0.88, 0.04, 0.03, P.cupBlue ?? "#3f6a8a", "y", 8);
  // cup dispenser tube
  cyl(-1.62, 1.35, 0.85, 0.04, 0.7, P.enamel, "y", 8);
  cyl(-1.62, 1.72, 0.85, 0.045, 0.03, P.steelDark, "y", 8);
  // toaster heater
  box(-1.4, 1.05, 1.2, 0.26, 0.14, 0.3, P.steelDark);
  box(-1.4, 1.125, 1.2, 0.2, 0.01, 0.2, P.rubber);
  box(-1.4, 1.13, 1.2, 0.16, 0.008, 0.02, P.amber, true);
  box(-1.28, 1.05, 1.2, 0.01, 0.04, 0.2, P.steelBright);

  // CRT
  box(-1.52, 1.6, 0.8, 0.1, 0.1, 0.12, P.steelDark); // bracket
  box(-1.48, 1.58, 0.85, 0.36, 0.5, 0.6, P.wallGrey);
  box(-1.3, 1.58, 0.85, 0.05, 0.44, 0.52, P.steelDark);
  box(-1.275, 1.58, 0.85, 0.01, 0.38, 0.46, "#0f2a18");
  glow(box(-1.268, 1.58, 0.85, 0.004, 0.37, 0.45, "#143a22"), 0.4);
  box(-1.265, 1.74, 0.85, 0.004, 0.04, 0.34, P.crtGreen, true);
  for (let i = 0; i < 6; i++)
    box(-1.265, 1.66 - i * 0.045, 0.7 + 0.1 * (i % 2) + 0.1, 0.004, 0.015, 0.16 + R() * 0.2, P.crtGreen, true);
  box(-1.265, 1.4, 0.74, 0.005, 0.03, 0.04, P.crtGreen, true);
  for (let i = 0; i < 4; i++) box(-1.3, 1.36, 1.02 + i * 0.0, 0.02, 0.02, 0.02, P.amber, true).mesh.position.z += i * 0.04 - 0.07;
  box(-1.32, 1.32, 0.88, 0.04, 0.025, 0.2, P.rubber);

  // shelf and jars
  box(-1.52, 1.95, 0.8, 0.34, 0.03, 1.0, P.steel);
  box(-1.4, 1.99, 0.8, 0.02, 0.06, 1.0, P.steelBright);
  const cols = [P.rationOlive, P.rust, P.enamel, P.rationOlive, P.rust];
  for (let i = 0; i < 5; i++) {
    cyl(-1.5, 2.03, 0.4 + i * 0.2, 0.05, 0.1, cols[i], "y", 8);
    cyl(-1.5, 2.09, 0.4 + i * 0.2, 0.052, 0.015, P.steelDark, "y", 8);
  }
  // fold-down ration cabinet
  box(-1.62, 1.5, 1.2, 0.12, 0.3, 0.3, P.steelDark);
  box(-1.555, 1.5, 1.2, 0.02, 0.26, 0.26, P.wallGrey);
  box(-1.54, 1.5, 1.2, 0.01, 0.06, 0.2, P.alarmRed);
  box(-1.54, 1.5, 1.2, 0.01, 0.2, 0.06, P.alarmRed);
  box(-1.54, 1.38, 1.2, 0.012, 0.02, 0.1, P.hazardYellow);
}
    return buildLockerWall;
  })(),
  // backWall
  (() => {
function buildBackWall({ b, P }: any) {
  const Z0 = -2.0;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = 0) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
    if (g) glow(p, g);
    return p;
  };
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, seg = 10, g = 0, axisZ = true) => {
    const p = b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z], ...(axisZ ? { dir: [0, 0, 1] } : {}) });
    if (g) glow(p, g);
    return p;
  };
  const rivet = (x: number, y: number, z: number, r = 0.012) => cyl(r, 0.008, P.steelDark, x, y, z, 6);

  // hatch frame
  const fz = Z0 + 0.06;
  box(1.3, 0.14, 0.12, P.steelDark, 0, 2.07, fz);
  box(0.12, 1.97, 0.12, P.steelDark, 0.64, 1.085, fz);
  box(0.12, 1.97, 0.12, P.steelDark, -0.64, 1.085, fz);
  box(1.16, 0.04, 0.1, P.hazardBlack, 0, 0.12, fz + 0.01);
  // door leaf
  const dz = Z0 + 0.1;
  box(1.1, 1.9, 0.08, P.wallGrey, 0, 1.05, dz);
  for (const x of [-0.4, -0.2, 0.2, 0.4]) box(0.05, 1.7, 0.03, P.wallDark, x, 1.05, dz + 0.05);
  box(1.1, 0.02, 0.03, P.seam, 0, 1.05, dz + 0.045);
  // frame rivets
  for (let i = 0; i < 12; i++) {
    const y = 0.25 + i * 0.16;
    rivet(0.64, y, fz + 0.065);
    rivet(-0.64, y, fz + 0.065);
  }
  for (let i = 0; i < 9; i++) rivet(-0.5 + i * 0.125, 2.07, fz + 0.065);
  // hinges
  for (const y of [0.4, 1.05, 1.7]) cyl(0.04, 0.2, P.steelDark, -0.55, y, dz + 0.06, 8, 0, false);
  // wheel lock
  const wy = 1.05, wz = dz + 0.09;
  cyl(0.07, 0.06, P.steelBright, 0, wy, wz, 10);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI;
    const p = box(0.4, 0.035, 0.03, P.steel, 0, wy, wz);
    p.mesh.rotation.z = a;
  }
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const p = box(0.09, 0.04, 0.04, P.steel, Math.cos(a) * 0.2, wy + Math.sin(a) * 0.2, wz);
    p.mesh.rotation.z = a + Math.PI / 2;
  }
  // porthole
  cyl(0.11, 0.03, P.steelDark, 0, 1.6, dz + 0.05, 12);
  cyl(0.085, 0.035, "#0d0f0e", 0, 1.6, dz + 0.06, 12);
  glow(b.part(new THREE.TorusGeometry(0.1, 0.012, 5, 14), P.amber, { at: [0, 1.6, dz + 0.065] }), 1.3);
  // hazard chevrons both sides
  for (const s of [1, -1])
    for (let i = 0; i < 12; i++) {
      const y = 0.15 + i * 0.16;
      const p = box(0.14, 0.07, 0.02, i % 2 ? P.hazardBlack : P.hazardYellow, s * 0.78, y, Z0 + 0.02);
      p.mesh.rotation.z = s * 0.5;
    }
  for (let i = 0; i < 14; i++) box(0.08, 0.05, 0.02, i % 2 ? P.hazardBlack : P.hazardYellow, -0.52 + i * 0.08, 0.115, Z0 + 0.15);
  // plate GALLEY
  box(0.5, 0.1, 0.02, P.enamel, 0, 2.2, Z0 + 0.02);
  for (let i = 0; i < 6; i++) box(0.03, 0.06, 0.012, P.seam, -0.2 + i * 0.08, 2.2, Z0 + 0.035);
  box(0.05, 0.06, 0.012, P.seam, 0.32, 2.2, Z0 + 0.035);
  // alarm lamp
  cyl(0.06, 0.06, P.steelDark, 0, 2.27, Z0 + 0.04, 8);
  glow(b.part(new THREE.SphereGeometry(0.05, 8, 6), P.alarmRed, { at: [0, 2.27, Z0 + 0.09] }), 1.5);

  // control panel (x -1.0..-0.65)
  const cx = -0.83;
  const pan = box(0.35, 0.8, 0.1, "#2a2c2b", cx, 1.5, Z0 + 0.05);
  pan.mesh.rotation.x = -0.15;
  box(0.3, 0.05, 0.02, P.enamel, cx, 1.95, Z0 + 0.1);
  box(0.2, 0.012, 0.012, P.seam, cx, 1.95, Z0 + 0.115);
  glow(box(0.2, 0.14, 0.02, P.crtGreen, cx, 1.78, Z0 + 0.11), 1.2);
  box(0.16, 0.012, 0.012, "#0b3a1a", cx, 1.78, Z0 + 0.125);
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++) glow(box(0.04, 0.035, 0.02, (r + c) % 2 ? P.amber : P.crtGreen, cx - 0.105 + c * 0.07, 1.6 - r * 0.07, Z0 + 0.115), 1);
  for (let i = 0; i < 3; i++) {
    cyl(0.01, 0.06, P.steelBright, cx - 0.09 + i * 0.09, 1.34, Z0 + 0.13, 6, 0, true);
  }
  for (const x of [-0.07, 0.07]) {
    cyl(0.03, 0.02, P.steelDark, cx + x, 1.24, Z0 + 0.12, 10);
    box(0.01, 0.025, 0.01, P.amber, cx + x, 1.25, Z0 + 0.135);
  }
  glow(cyl(0.025, 0.02, P.alarmRed, cx + 0.12, 1.18, Z0 + 0.12, 8), 1.3);

  // left side gear
  box(0.18, 0.18, 0.02, P.wallDark, 0.82, 1.25, Z0 + 0.01);
  cyl(0.05, 0.5, P.alarmRed, 0.82, 1.1, Z0 + 0.1, 10, 0, false);
  cyl(0.035, 0.05, P.rubber, 0.82, 1.38, Z0 + 0.1, 8, 0, false);
  for (const y of [0.9, 1.25]) box(0.12, 0.03, 0.03, P.steelDark, 0.82, y, Z0 + 0.1);
  b.part(new THREE.TorusGeometry(0.07, 0.01, 4, 10), P.rubber, { at: [0.82, 1.0, Z0 + 0.15] });
  box(0.28, 0.2, 0.08, P.enamel, 0.85, 1.65, Z0+ 0.05);
  box(0.12, 0.03, 0.02, P.alarmRed, 0.85, 1.65, Z0 + 0.1);
  box(0.03, 0.12, 0.02, P.alarmRed, 0.85, 1.65, Z0 + 0.1);
  box(0.2, 0.26, 0.015, "#cfc7a8", 0.88, 1.95, Z0 + 0.03);
  for (let i = 0; i < 5; i++) box(0.14, 0.01, 0.01, P.seam, 0.88, 2.04 - i * 0.04, Z0 + 0.04);
  cyl(0.008, 0.04, P.steelDark, 0.88, 2.1, Z0 + 0.04, 5);

  // conduit pipes
  for (const [x, c] of [[0.72, P.pipeOrange], [-0.72, P.pipeGrey], [0.95, P.pipeGrey]] as [number, string][]) {
    cyl(0.04, 2.35, c, x, 1.275, Z0 + 0.2, 8, 0, false);
    for (const y of [0.3, 1.0, 1.7, 2.3]) {
      cyl(0.055, 0.04, P.steelDark, x, y, Z0 + 0.2, 8, 0, false);
      box(0.04, 0.03, 0.17, P.steelDark, x, y, Z0 + 0.11);
    }
  }
  // cable bundle in rail
  box(0.04, 2.2, 0.03, P.steelDark, -0.97, 1.2, Z0 + 0.12);
  for (const dx of [-0.01, 0.01]) cyl(0.012, 2.2, P.rubber, -0.97 + dx, 1.2, Z0 + 0.15, 5, 0, false);
  // vent grille
  box(0.8, 0.25, 0.04, P.steelDark, 0.4, 2.28, Z0 + 0.03);
  for (let i = 0; i < 6; i++) box(0.74, 0.02, 0.03, P.wallDark, 0.4, 2.2 + i * 0.037, Z0 + 0.06);
  // grime streaks
  for (const [x, w] of [[0.3, 0.05], [-0.3, 0.04], [0.55, 0.03], [-0.55, 0.06]])
    box(w, 0.6, 0.01, P.grime, x, 0.4, Z0 + 0.008);
  box(1.9, 0.1, 0.01, P.grime, 0, 0.16, Z0 + 0.008);
}
    return buildBackWall;
  })(),
  // overhead
  (() => {
function buildOverhead({ b, P }: any) {
  const R = rng(5);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number, g = false, s = 1) => {
    const p = b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
    if (g) glow(p, s);
    return p;
  };
  const cyl = (r: number, len: number, c: string, x: number, y: number, z: number, axis: "x" | "y" | "z" = "z", seg = 8, g = false) => {
    const rot: [number, number, number] = axis === "z" ? [90, 0, 0] : axis === "x" ? [0, 0, 90] : [0, 0, 0];
    const p = b.part(new THREE.CylinderGeometry(r, r, len, seg), c, { at: [x, y, z], rotation: rot });
    if (g) glow(p, 1.2);
    return p;
  };

  // pipe run
  const pipes: [number, number, string, number][] = [
    [-0.7, 0.07, P.pipeOrange, 2.38],
    [-0.5, 0.05, P.pipeGrey, 2.4],
    [0.75, 0.045, P.pipeGrey, 2.4],
  ];
  const z0 = -1.9, z1 = 2.0, L = z1 - z0, zc = (z0 + z1) / 2;
  for (const [x, r, c, y] of pipes) {
    cyl(r, L, c, x, y, zc, "z", 10);
    for (let z = -1.5; z <= 1.9; z += 0.5) {
      cyl(r * 1.35, 0.04, P.steelDark, x, y, z, "z", 10);
      box(0.03, 2.5 - y - r, 0.03, P.steelDark, x, (2.5 + y + r) / 2, z + 0.05);
      box(r * 2.6, 0.02, 0.07, P.steelDark, x, 2.5 - 0.01, z + 0.05);
    }
    // elbow down at back
    cyl(r, 0.3, c, x, y - 0.17, z0 + 0.05, "y", 10);
    b.part(new THREE.SphereGeometry(r * 1.05, 8, 6), c, { at: [x, y, z0 + 0.03] });
  }
  // cable tray
  box(0.14, 0.03, L, P.rubber, 0.5, 2.43, zc);
  box(0.14, 0.012, L, P.rubber, 0.5, 2.46, zc);
  for (let z = -1.7; z < 2; z += 0.6) box(0.16, 0.05, 0.03, P.steelDark, 0.5, 2.43, z);

  // valve wheel
  cyl(0.02, 0.1, P.steelDark, -0.7, 2.28, 0.4, "y", 6);
  cyl(0.07, 0.015, P.alarmRed, -0.7, 2.22, 0.4, "y", 8);
  for (let i = 0; i < 3; i++)
    b.part(new THREE.BoxGeometry(0.15, 0.012, 0.012), P.alarmRed, { at: [-0.7, 2.22, 0.4], rotation: [0, i * 60, 0] });
  // gauge
  cyl(0.055, 0.03, P.steelDark, -0.5, 2.32, -0.6, "x", 12);
  cyl(0.045, 0.012, P.enamel, -0.485, 2.32, -0.6, "x", 12);
  box(0.006, 0.004, 0.04, P.amber, -0.478, 2.325, -0.6, true);

  // duct
  box(0.6, 0.25, 3.6, P.steelDark, 0, 2.325, -0.1);
  for (let z = -1.6; z < 1.7; z += 0.4) box(0.62, 0.02, 0.025, P.wallDark, 0, 2.325, z);
  for (let z = -1.7; z < 1.7; z += 0.3) for (const x of [-0.27, 0.27]) cyl(0.01, 0.01, P.steel, x, 2.2, z, "y", 6);
  // louvre outlet
  box(0.6, 0.25, 0.04, P.seam, 0, 2.325, 1.72);
  for (let i = 0; i < 6; i++) box(0.54, 0.015, 0.03, P.steel, 0, 2.22 + i * 0.04, 1.745);

  // lamps
  for (const z of [0.1, 1.1]) {
    cyl(0.01, 0.35, P.steelDark, 0, 2.32, z, "y", 6);
    cyl(0.09, 0.02, P.steelDark, 0, 2.49, z, "y", 8);
    cyl(0.1, 0.02, P.steel, 0, 2.15, z, "y", 8);
    cyl(0.1, 0.02, P.steel, 0, 1.82, z, "y", 8);
    const bulb = b.part(new THREE.SphereGeometry(0.065, 8, 6), P.lampWhite, { at: [0, 1.98, z] });
    glow(bulb, 1.6);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(0.008, 0.34, P.steel, Math.cos(a) * 0.095, 1.985, z + Math.sin(a) * 0.095, "y", 5);
    }
  }
  // crooked cable loop
  b.sweep([[0.05, 2.5, 0.1], [0.2, 2.35, 0.15], [0.25, 2.22, 0.05], [0.1, 2.3, -0.05]], 0.008, { color: P.rubber });

  // light strip
  box(0.12, 0.03, 0.8, P.lampWhite, 0, 2.47, -1.0, true, 1.4);
  for (const z of [-1.4, -0.6]) box(0.2, 0.04, 0.04, P.steel, 0, 2.47, z);

  // speaker horn
  b.part(new THREE.ConeGeometry(0.1, 0.18, 10, 1, true), P.steelDark, { at: [0.85, 2.2, 1.2], rotation: [90, 0, 0] });
  cyl(0.03, 0.12, P.rubber, 0.85, 2.3, 1.1, "z", 6);
  box(0.04, 0.2, 0.04, P.steelDark, 0.85, 2.4, 1.1);

  // beacon
  cyl(0.06, 0.04, P.steelDark, -0.85, 2.46, 0.9, "y", 8);
  glow(b.part(new THREE.SphereGeometry(0.055, 8, 6), P.alarmRed, { at: [-0.85, 2.38, 0.9] }), 1.5);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    cyl(0.005, 0.12, P.steel, -0.85 + Math.cos(a) * 0.065, 2.39, 0.9 + Math.sin(a) * 0.065, "y", 4);
  }

  // dangling cables
  for (let i = 0; i < 6; i++) {
    const x = 0.85 + (R() - 0.5) * 0.1, z = -1.5 + i * 0.07;
    const l = 0.35 + R() * 0.3;
    cyl(0.01, l, P.rubber, x - 0.1, 2.5 - l / 2, z, "y", 5);
    cyl(0.013, 0.03, P.hazardYellow, x - 0.1, 2.5 - l + 0.06, z, "y", 5);
  }

  // NO SMOKING plate on chains
  box(0.4, 0.14, 0.015, P.enamel, -0.3, 1.98, -1.5);
  box(0.34, 0.025, 0.018, P.alarmRed, -0.3, 1.98, -1.5);
  box(0.12, 0.03, 0.018, P.hazardBlack, -0.3, 2.03, -1.5);
  box(0.12, 0.03, 0.018, P.hazardBlack, -0.3, 1.93, -1.5);
  for (const dx of [-0.18, 0.18]) cyl(0.005, 0.43, P.steelDark, -0.3 + dx, 2.27, -1.5, "y", 4);

  // stains
  box(0.35, 0.004, 0.5, P.rust, 0.3, 2.497, 0.6);
  box(0.2, 0.004, 0.3, P.grime, -0.6, 2.497, -1.0);
  box(0.03, 0.2, 0.02, P.grime, -0.7, 2.18, 1.0);
}
    return buildOverhead;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "nostromoGalley" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
