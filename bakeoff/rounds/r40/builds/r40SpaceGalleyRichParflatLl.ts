import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, frame } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Nostromo Galley",
  "description": "A cramped, grimy 1979 industrial-spaceship galley kitchen: a steel counter with hob and sink, wall cabinets, a cold storage locker, a dining table with stools, and a pipe-filled ceiling lit by sickly amber and cyan indicators."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  deck: "#2b2d2e",
  deckPlate: "#3a3c3d",
  wallBeige: "#b3a98f",
  wallDirty: "#8a816b",
  steel: "#8d9296",
  steelDark: "#555a5e",
  grime: "#1d1b17",
  hazard: "#d9a812",
  ink: "#15130f",
  amber: "#ffb23a",
  cyan: "#49e6e0",
  red: "#c2332a",
  green: "#5fbf6a",
  pipeGrey: "#6c6f6b",
  pipeOrange: "#b5622a",
  plastic: "#cfc6aa",
  screen: "#0d2a22",
  rubber: "#222222",
};
const M = {
  floorTop: [0, 0.1, 0] as [number, number, number],
  counterTop: [0, 0.95, -1.4] as [number, number, number],
  backWall: [0, 1.3, -1.8] as [number, number, number],
  leftWall: [1.95, 1.3, 0] as [number, number, number],
  ceiling: [0, 2.5, 0] as [number, number, number],
  tableTop: [-0.2, 0.78, 0.5] as [number, number, number],
  lockerFront: [1.5, 1, -0.6] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // shell
  (() => {
function buildShell({ b, P }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, at: number[], dir: number[], seg = 10) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at, dir });

  // Floor deck
  box(4, 0.1, 3.6, P.deck, 0, 0.05, 0);
  // plate seams
  for (let i = -3; i <= 3; i++) box(0.012, 0.004, 3.6, P.grime, i * 0.5, 0.1, 0);
  for (let j = -3; j <= 3; j++) box(4, 0.004, 0.012, P.grime, 0, 0.1, j * 0.5 + 0.25);
  // deck plates and bolts
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 7; j++) {
      if ((i + j) % 2 === 0) box(0.46, 0.003, 0.46, P.deckPlate, -1.75 + i * 0.5, 0.101, -1.5 + j * 0.5);
      for (const [dx, dz] of [[-0.2, -0.2], [0.2, 0.2]])
        if ((i * 3 + j) % 3 === 0)
          cyl(0.014, 0.008, P.steel, [-1.75 + i * 0.5 + dx, 0.103, -1.5 + j * 0.5 + dz], [0, 1, 0], 6);
    }
  // hazard edge stripes
  for (let k = 0; k < 20; k++) {
    box(0.1, 0.004, 0.06, k % 2 ? P.ink : P.hazard, -1.9 + k * 0.2, 0.102, 1.75);
    box(0.1, 0.004, 0.06, k % 2 ? P.ink : P.hazard, -1.9 + k * 0.2 + 0.1, 0.102, 1.75);
  }
  for (let k = 0; k < 16; k++) box(0.06, 0.004, 0.1, k % 2 ? P.ink : P.hazard, 1.75, 0.102, -1.7 + k * 0.22);
  // grime stains
  for (let i = 0; i < 9; i++)
    box(0.2 + R() * 0.4, 0.002, 0.15 + R() * 0.3, P.grime, -1.6 + R() * 3.2, 0.102, -1.4 + R() * 2.8);

  // Walls
  box(4, 2.5, 0.1, P.wallBeige, 0, 1.35, -1.75); // back
  box(0.1, 2.5, 3.6, P.wallBeige, 1.95, 1.35, 0); // left (+X)
  box(0.1, 2.5, 3.6, P.wallBeige, -1.95, 1.35, 0); // right
  // seam strips with rivets
  for (let i = 0; i < 7; i++) {
    const x = -1.5 + i * 0.5;
    box(0.05, 2.4, 0.01, P.wallDirty, x, 1.35, -1.695);
    for (let y = 0.3; y < 2.5; y += 0.25) cyl(0.013, 0.008, P.steelDark, [x, y, -1.692], [0, 0, 1], 6);
  }
  for (let i = 0; i < 6; i++) {
    const z = -1.3 + i * 0.55;
    box(0.01, 2.4, 0.05, P.wallDirty, 1.895, 1.35, z);
    box(0.01, 2.4, 0.05, P.wallDirty, -1.895, 1.35, z);
    for (let y = 0.3; y < 2.5; y += 0.3) {
      cyl(0.013, 0.008, P.steelDark, [1.892, y, z], [1, 0, 0], 6);
      cyl(0.013, 0.008, P.steelDark, [-1.892, y, z], [1, 0, 0], 6);
    }
  }
  // dirty streaks
  for (let i = 0; i < 12; i++) {
    const x = -1.8 + R() * 3.6, h = 0.3 + R() * 0.8;
    box(0.04 + R() * 0.06, h, 0.004, P.wallDirty, x, 2.3 - h / 2, -1.697);
  }
  for (let i = 0; i < 6; i++) {
    const z = -1.4 + R() * 2.8, h = 0.3 + R() * 0.7;
    box(0.004, h, 0.08, P.wallDirty, -1.896, 2.3 - h / 2, z);
    box(0.004, h, 0.08, P.wallDirty, 1.896, 2.3 - h / 2, -z);
  }
  // stencil labels
  box(0.5, 0.08, 0.006, P.ink, -1.2, 1.2, -1.695);
  for (let i = 0; i < 5; i++) box(0.05, 0.05, 0.007, P.hazard, -1.4 + i * 0.1, 1.2, -1.693);
  box(0.006, 0.08, 0.4, P.ink, -1.893, 1.9, 0);
  for (let i = 0; i < 4; i++) box(0.007, 0.05, 0.05, P.hazard, -1.891, 1.9, -0.15 + i * 0.1);

  // Skirting and corner trim
  box(4, 0.12, 0.04, P.steelDark, 0, 0.16, -1.68);
  box(0.04, 0.12, 3.6, P.steelDark, 1.88, 0.16, 0);
  box(0.04, 0.12, 3.6, P.steelDark, -1.88, 0.16, 0);
  for (const x of [-1.9, 1.9]) box(0.08, 2.5, 0.08, P.steelDark, x, 1.35, -1.7);
  box(0.08, 2.5, 0.08, P.steelDark, 1.9, 1.35, 1.75);
  box(0.08, 2.5, 0.08, P.steelDark, -1.9, 1.35, 1.75);

  // Bulkhead hatch on left wall (+X), near front
  const hz = 1.0, hy = 1.0, hx = 1.89;
  box(0.04, 1.5, 0.95, P.ink, hx, hy, hz);
  for (let k = 0; k < 14; k++) {
    box(0.03, 0.1, 0.1, k % 2 ? P.ink : P.hazard, hx - 0.005, 1.7, hz - 0.45 + k * 0.07);
  }
  box(0.04, 0.1, 0.95, P.hazard, hx - 0.005, 1.78, hz);
  box(0.04, 0.1, 0.95, P.hazard, hx - 0.005, 0.22, hz);
  box(0.04, 1.4, 0.08, P.hazard, hx - 0.005, hy, hz - 0.46);
  box(0.04, 1.4, 0.08, P.hazard, hx - 0.005, hy, hz + 0.46);
  box(0.05, 1.3, 0.8, P.steel, hx - 0.03, hy, hz);
  box(0.05, 1.1, 0.6, P.steelDark, hx - 0.06, hy, hz);
  // wheel
  b.part(new THREE.TorusGeometry(0.2, 0.025, 6, 14), P.steel, { at: [hx - 0.1, hy, hz], dir: [1, 0, 0], axis: "z" });
  cyl(0.05, 0.06, P.steel, [hx - 0.1, hy, hz], [1, 0, 0]);
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    b.part(new THREE.BoxGeometry(0.03, 0.03, 0.4), P.steel, {
      at: [hx - 0.1, hy, hz],
      rotation: [(a * 180) / Math.PI, 0, 0],
    });
  }
  // hinges and indicator
  for (const y of [0.5, 1.5]) cyl(0.03, 0.12, P.steelDark, [hx - 0.06, y, hz - 0.37], [0, 1, 0], 8);
  box(0.02, 0.06, 0.06, P.red, hx - 0.07, 1.55, hz + 0.3);
  box(0.02, 0.06, 0.06, P.green, hx - 0.07, 1.45, hz + 0.3);
}
    return buildShell;
  })(),
  // counterRun
  (() => {
function buildCounterRun({ b, P }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const glow = (m: any) => {
    const mat = m.mesh.material.clone();
    mat.emissive = mat.color.clone();
    mat.emissiveIntensity = 1.2;
    m.mesh.material = mat;
    return m;
  };
  const X0 = -1.9, X1 = 1.2, W = X1 - X0, CX = (X0 + X1) / 2;
  const zb = -1.8, D = 0.8, zc = zb + D / 2, zf = zb + D;

  // base, kick plate, worktop
  box(W, 0.12, D - 0.06, P.grime, CX, 0.16, zc);
  box(W, 0.74, D - 0.06, P.steelDark, CX, 0.59, zc - 0.01);
  box(W + 0.02, 0.05, D, P.steel, CX, 0.975, zc);
  box(W + 0.02, 0.012, 0.02, P.grime, CX, 1.005, zf - 0.01);
  box(W, 0.12, 0.03, P.wallDirty, CX, 1.04, zb + 0.02);

  // doors with handles, seams
  const doorXs = [-1.6, -1.05, 0.0, 0.6, 1.0];
  const dw = [0.5, 0.5, 0.5, 0.0, 0.0];
  [-1.62, -1.08, -0.54].forEach((x, i) => {
    box(0.5, 0.58, 0.02, P.plastic, x, 0.58, zf - 0.03);
    box(0.5, 0.02, 0.022, P.grime, x, 0.3, zf - 0.03);
    box(0.03, 0.2, 0.03, P.steel, x + 0.18, 0.62, zf - 0.005);
    box(0.1, 0.04, 0.01, P.hazard, x - 0.12, 0.8, zf - 0.015);
    if (i == 1) box(0.08, 0.025, 0.01, P.ink, x - 0.12, 0.8, zf - 0.008);
  });
  void doorXs; void dw;

  // oven
  const ox = 0.55;
  box(0.55, 0.6, 0.03, P.steel, ox, 0.58, zf - 0.03);
  box(0.4, 0.28, 0.01, P.ink, ox, 0.55, zf - 0.008);
  glow(box(0.3, 0.16, 0.008, P.amber, ox, 0.55, zf - 0.002));
  box(0.46, 0.03, 0.04, P.steelDark, ox, 0.82, zf - 0.01);
  cyl(0.025, 0.025, 0.02, P.ink, ox + 0.2, 0.84, zf).rotation.x = Math.PI / 2;
  cyl(0.035, 0.035, 0.03, P.rubber, ox + 0.2, 0.86, zf - 0.005).rotation.x = Math.PI / 2;
  box(0.012, 0.02, 0.012, P.hazard, ox + 0.2, 0.9, zf + 0.012);
  box(0.4, 0.03, 0.03, P.steel, ox, 0.37, zf - 0.005);

  // hob
  const hx = -0.15, hz = zc - 0.03;
  box(0.8, 0.02, 0.6, P.ink, hx, 1.01, hz);
  [[-0.2, -0.15], [0.2, -0.15], [-0.2, 0.15], [0.2, 0.15]].forEach(([dx, dz], i) => {
    cyl(0.1, 0.1, 0.012, P.grime, hx + dx, 1.026, hz + dz, 14);
    glow(cyl(0.075, 0.075, 0.008, P.amber, hx + dx, 1.034, hz + dz, 14));
    cyl(0.03, 0.03, 0.012, P.ink, hx + dx, 1.04, hz + dz, 8);
    const kx = hx - 0.3 + i * 0.2;
    cyl(0.028, 0.028, 0.04, P.rubber, kx, 0.9, zf - 0.005, 8).rotation.x = Math.PI / 2;
    box(0.006, 0.02, 0.006, P.amber, kx, 0.93, zf + 0.018);
  });
  box(0.76, 0.1, 0.03, P.steelDark, hx, 0.9, zf - 0.03);
  for (let i = 0; i < 4; i++) box(0.12, 0.004, 0.004, P.hazard, hx - 0.3 + i * 0.2, 0.96, zf + 0.0);

  // sink
  const sx = -1.35;
  box(0.6, 0.012, 0.5, P.ink, sx, 1.003, zc - 0.02);
  box(0.5, 0.014, 0.4, P.steelDark, sx, 1.006, zc - 0.02);
  box(0.5, 0.012, 0.4, P.grime, sx, 1.01, zc - 0.02);
  cyl(0.03, 0.03, 0.014, P.ink, sx + 0.1, 1.016, zc - 0.02, 8);
  cyl(0.02, 0.02, 0.3, P.steel, sx, 1.15, zb + 0.12);
  b.part(new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8), P.steel, { at: [sx, 1.3, zb + 0.22], rotation: [90, 0, 0] });
  cyl(0.025, 0.02, 0.05, P.steel, sx, 1.27, zb + 0.32, 8);
  cyl(0.02, 0.02, 0.04, P.red, sx - 0.07, 1.04, zb + 0.12, 6);
  cyl(0.02, 0.02, 0.04, P.cyan, sx + 0.07, 1.04, zb + 0.12, 6);

  // timer
  box(0.2, 0.1, 0.06, P.steelDark, 0.95, 1.05, zb + 0.12);
  glow(box(0.15, 0.06, 0.01, P.cyan, 0.95, 1.06, zb + 0.155));
  box(0.04, 0.02, 0.012, P.ink, 0.92, 1.06, zb + 0.162);
  box(0.04, 0.02, 0.012, P.ink, 0.98, 1.06, zb + 0.162);

  // utensil rack and pots
  const rx = -0.7;
  box(0.4, 0.02, 0.1, P.steelDark, rx, 1.07, zb + 0.1);
  for (let i = 0; i < 5; i++) {
    cyl(0.012, 0.012, 0.18, i % 2 ? P.steel : P.rubber, rx - 0.15 + i * 0.075, 1.18, zb + 0.1, 6);
    box(0.04, 0.05, 0.008, P.steel, rx - 0.15 + i * 0.075, 1.31, zb + 0.1);
  }
  cyl(0.1, 0.09, 0.14, P.steel, hx - 0.2, 1.1, hz - 0.15 + 0.0, 12);
  cyl(0.103, 0.103, 0.015, P.steelDark, hx - 0.2, 1.18, hz - 0.15, 12);
  cyl(0.02, 0.02, 0.02, P.rubber, hx - 0.2, 1.2, hz - 0.15, 6);
  cyl(0.085, 0.075, 0.1, P.pipeOrange, hx + 0.2, 1.08, hz + 0.15, 12);
  box(0.16, 0.02, 0.02, P.rubber, hx + 0.34, 1.1, hz + 0.15);
  box(0.02, 0.02, 0.2, P.steel, 0.1 + R() * 0.0, 1.03, zc + 0.2);
  cyl(0.04, 0.03, 0.05, P.plastic, 1.05, 1.03, zc + 0.15, 8);
  cyl(0.04, 0.03, 0.05, P.plastic, 0.95, 1.03, zc + 0.25, 8);
  // grime streaks
  box(0.3, 0.004, 0.2, P.grime, -0.9, 1.003, zc + 0.15);
  box(0.02, 0.4, 0.004, P.grime, -0.3, 0.6, zf + 0.001);
}
    return buildCounterRun;
  })(),
  // wallCabinets
  (() => {
function buildWallCabinets({ b, J, P, M }: any) {
  const R = rng(5);
  const WZ = -1.8; // back wall
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (r: number, h: number, c: string, x: number, y: number, z: number, axis: "x" | "y" | "z" = "z", seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, {
      at: [x, y, z],
      dir: axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1],
    });
  const front = WZ + 0.5; // cabinet front face z
  const cy0 = 1.45, cy1 = 2.3, ch = cy1 - cy0, cyc = (cy0 + cy1) / 2;

  // Back rail strip behind cabinets
  box(3.4, 0.05, 0.04, P.steelDark, -0.2, cy0 - 0.03, WZ + 0.03);

  // Cabinet boxes: x ranges
  const cabs = [
    { x0: -1.9, x1: -1.1, n: "01" },
    { x0: -1.08, x1: -0.38, n: "02" },
    { x0: 0.5, x1: 1.5, n: "04" },
  ];
  for (const c of cabs) {
    const w = c.x1 - c.x0, cx = (c.x0 + c.x1) / 2, d = 0.4;
    box(w, ch, d, P.plastic, cx, cyc, WZ + d / 2);
    // door panel inset
    box(w - 0.1, ch - 0.1, 0.02, P.wallBeige, cx, cyc, WZ + d + 0.008);
    box(w, 0.03, d + 0.02, P.wallDirty, cx, cy0 + 0.015, WZ + d / 2);
    box(w, 0.03, d + 0.02, P.wallDirty, cx, cy1 - 0.015, WZ + d / 2);
    // latch handle
    const hx = c.x1 - 0.1;
    box(0.04, 0.16, 0.04, P.steel, hx, cyc - 0.2, WZ + d + 0.04);
    box(0.06, 0.03, 0.05, P.steelDark, hx, cyc - 0.12, WZ + d + 0.04);
    // label plate
    box(0.2, 0.07, 0.01, P.ink, cx - 0.1, cyc + 0.28, WZ + d + 0.025);
    box(0.14, 0.012, 0.005, P.plastic, cx - 0.1, cyc + 0.28, WZ + d + 0.032);
    // hazard stencil number: bars
    box(0.14, 0.1, 0.006, P.hazard, cx + 0.05, cyc + 0.05, WZ + d + 0.022);
    box(0.03, 0.07, 0.008, P.ink, cx + 0.0, cyc + 0.05, WZ + d + 0.026);
    box(0.03, 0.07, 0.008, P.ink, cx + 0.09, cyc + 0.05, WZ + d + 0.026);
    box(0.09, 0.02, 0.008, P.ink, cx + 0.045, cyc + 0.05, WZ + d + 0.026);
    // rivets
    for (const sx of [-1, 1]) for (const sy of [-1, 1])
      cyl(0.008, 0.01, P.steelDark, cx + sx * (w / 2 - 0.04), cyc + sy * (ch / 2 - 0.05), WZ + d + 0.02);
    // grime at the bottom
    box(w - 0.04, 0.025, 0.01, P.grime, cx, cy0 + 0.05, WZ + d + 0.015);
  }

  // Recessed shelf bay between x -0.38 and 0.5 ... sits at left of hood
  const sx0 = -0.36, sx1 = 0.1, sw = sx1 - sx0, scx = (sx0 + sx1) / 2;
  box(sw, ch, 0.03, P.grime, scx, cyc, WZ + 0.04);
  box(0.03, ch, 0.34, P.plastic, sx0, cyc, WZ + 0.2);
  box(0.03, ch, 0.34, P.plastic, sx1, cyc, WZ + 0.2);
  box(sw, 0.03, 0.34, P.plastic, scx, cy1 - 0.015, WZ + 0.2);
  box(sw, 0.03, 0.34, P.plastic, scx, cy0 + 0.015, WZ + 0.2);
  box(sw, 0.025, 0.32, P.steel, scx, cyc, WZ + 0.2);
  // tins on shelves
  const tc = [P.hazard, P.red, P.steel];
  for (let i = 0; i < 3; i++) {
    cyl(0.04, 0.1, tc[i], sx0 + 0.08 + i * 0.09, cyc + 0.07, WZ + 0.2, "y");
    cyl(0.041, 0.012, P.ink, sx0 + 0.08 + i * 0.09, cyc + 0.07, WZ + 0.2, "y");
  }
  // mugs
  for (let i = 0; i < 2; i++) {
    const mx = sx0 + 0.1 + i * 0.12;
    cyl(0.035, 0.08, P.plastic, mx, cy0 + 0.07, WZ + 0.2, "y");
    box(0.015, 0.04, 0.012, P.plastic, mx + 0.045, cy0 + 0.07, WZ + 0.2);
  }
  cyl(0.035, 0.07, P.steelDark, sx1 - 0.06, cy0 + 0.065, WZ + 0.22, "y");

  // Monitor on shelf upper bay
  const mz = WZ + 0.3;
  box(0.34, 0.24, 0.1, P.steelDark, scx, cyc + 0.12, mz - 0.05);
  box(0.28, 0.18, 0.02, P.ink, scx, cyc + 0.12, mz + 0.0);
  const scr = box(0.26, 0.16, 0.01, P.screen, scx, cyc + 0.12, mz + 0.012);
  for (let i = 0; i < 5; i++) {
    const wd = 0.08 + R() * 0.12;
    glow(box(wd, 0.012, 0.004, P.green, scx - 0.12 + wd / 2, cyc + 0.17 - i * 0.03, mz + 0.02), 1.4);
  }

  // Extractor hood over hob (x ~ 0.5..1.5 region): hood at x 0.0.. use 0.5-1.5 cab replaced? place hood spanning 0.15..0.48 plus top
  const hx0 = 0.14, hx1 = 0.48;
  const hcx = (hx0 + hx1) / 2;
  b.part(new THREE.CylinderGeometry(0.1, 0.22, 0.3, 4, 1), P.steel, {
    at: [hcx, cy0 + 0.17, WZ + 0.25], rotation: [0, 45, 0], scale: [1, 1, 0.9],
  });
  box(0.12, 0.3, 0.12, P.steelDark, hcx, cy1 - 0.12, WZ + 0.1);
  box(0.3, 0.02, 0.28, P.steelDark, hcx, cy0 - 0.0, WZ + 0.25);
  for (let i = 0; i < 6; i++) box(0.28, 0.008, 0.01, P.ink, hcx, cy0 + 0.02 + 0, WZ + 0.13 + i * 0.045);
  cyl(0.015, 0.012, P.red, hcx, cy0 + 0.22, WZ + 0.44);
  glow(b.part(new THREE.SphereGeometry(0.018, 6, 4), P.red, { at: [hcx, cy0 + 0.22, WZ + 0.455] }), 2);
  box(0.12, 0.05, 0.01, P.ink, hcx, cy0 + 0.12, WZ + 0.455);

  // Switch panel cluster right of hood is cabinet 04; put a panel on its door
  const px = 1.0, py = cyc - 0.15;
  box(0.4, 0.3, 0.025, P.steelDark, px, py + 0.0, front + 0.03);
  box(0.36, 0.26, 0.012, P.grime, px, py, front + 0.045);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const col = [P.amber, P.cyan, P.red, P.green][(i + j * 2) % 4];
    const x = px - 0.12 + i * 0.08, y = py + 0.08 - j * 0.08;
    box(0.04, 0.04, 0.01, P.ink, x, y, front + 0.055);
    if ((i + j) % 2) glow(box(0.028, 0.028, 0.01, col, x, y, front + 0.062), 1.6);
    else { box(0.012, 0.03, 0.02, P.steel, x, y, front + 0.065); }
  }
  // door of cab 04 hazard strip
  box(0.8, 0.025, 0.008, P.hazard, 1.0, cy1 - 0.1, front + 0.03);
  for (let i = 0; i < 8; i++) box(0.03, 0.03, 0.009, P.ink, 0.65 + i * 0.1, cy1 - 0.1, front + 0.03).rotation.z = 0.6;

  // Gap-filling conduit & small cluster between cab02 and shelf
  box(0.02, ch, 0.02, P.pipeOrange, -0.37 + 0.0, cyc, WZ + 0.05);
  // Amber indicator row under cabs
  for (let i = 0; i < 4; i++) {
    glow(cyl(0.012, 0.01, i % 2 ? P.amber : P.cyan, -1.6 + i * 0.12, cy0 - 0.04, front - 0.1, "y"), 1.6);
  }
  // Small bottom light strip
  box(0.5, 0.02, 0.03, P.ink, 0.9, cy0 - 0.03, front - 0.05);
  glow(box(0.46, 0.012, 0.02, P.amber, 0.9, cy0 - 0.045, front - 0.05), 1.3);
}
    return buildWallCabinets;
  })(),
  // coldLocker
  (() => {
function buildColdLocker({ b, J, P, M }: any) {
  const r = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (rad: number, len: number, color: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(rad, rad, len, seg), color, { at, dir });

  const STEEL = P.steel, DARK = P.steelDark, GR = P.grime, HZ = P.hazard, INK = P.ink;
  const CHROME = "#c9ced1";
  const X0 = 1.0, X1 = 1.95, XC = 1.475, FZ = 0.3, ZC = -0.6;
  const frontX = X0 + 0.02; // door face toward the room (-X side)

  // plinth and body
  box(0.95, 0.12, 1.8, DARK, XC, 0.16, ZC);
  box(0.9, 1.9, 1.7, STEEL, XC + 0.02, 1.17, ZC);
  box(0.92, 0.06, 1.72, DARK, XC + 0.02, 2.14, ZC);
  box(0.92, 0.04, 1.72, GR, XC + 0.02, 0.24, ZC);

  // doors (face at x ~1.03)
  const doorX = 1.03;
  for (const s of [0, 1]) {
    const z = ZC + (s ? 0.42 : -0.42);
    box(0.04, 1.75, 0.8, STEEL, doorX, 1.2, z);
    // rubber seal frame
    box(0.015, 1.8, 0.03, P.rubber, doorX - 0.025, 1.2, z - 0.4);
    box(0.015, 1.8, 0.03, P.rubber, doorX - 0.025, 1.2, z + 0.4);
    box(0.015, 0.03, 0.8, P.rubber, doorX - 0.025, 0.32, z);
    box(0.015, 0.03, 0.8, P.rubber, doorX - 0.025, 2.09, z);
    // chrome latch bar
    const lz = z + (s ? -0.3 : 0.3);
    cyl(0.025, 0.7, CHROME, [doorX - 0.06, 1.15, lz], [0, 1, 0]);
    for (const y of [0.85, 1.45]) box(0.05, 0.05, 0.06, DARK, doorX - 0.04, y, lz);
    // frost hazard stripes
    for (let i = 0; i < 6; i++) {
      box(0.012, 0.06, 0.1, i % 2 ? INK : HZ, doorX - 0.026, 0.4 + i * 0.0, z - 0.3 + i * 0.12 + 0.0).rotation.x = 0;
    }
    // rivets
    for (const y of [0.4, 2.0]) for (const dz of [-0.33, 0.33])
      b.part(new THREE.SphereGeometry(0.015, 5, 4), DARK, { at: [doorX - 0.025, y, z + dz] });
  }
  // door gap
  box(0.02, 1.75, 0.02, GR, doorX - 0.02, 1.2, ZC);

  // hazard band across top
  for (let i = 0; i < 12; i++)
    box(0.012, 0.1, 0.14, i % 2 ? INK : HZ, doorX - 0.026, 1.98, ZC - 0.77 + i * 0.14);

  // temp display
  box(0.02, 0.12, 0.3, INK, doorX - 0.03, 1.78, ZC - 0.35);
  glow(box(0.012, 0.08, 0.26, P.cyan, doorX - 0.042, 1.78, ZC - 0.35), 1.5);
  for (let i = 0; i < 3; i++) box(0.006, 0.05, 0.03, INK, doorX - 0.05, 1.78, ZC - 0.43 + i * 0.07);
  // indicators
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 5), P.red, { at: [doorX - 0.035, 1.78, ZC - 0.1] }), 1.5);
  glow(b.part(new THREE.SphereGeometry(0.025, 6, 5), P.green, { at: [doorX - 0.035, 1.78, ZC - 0.02] }), 1.5);

  // drain vent grille
  box(0.03, 0.2, 0.7, DARK, doorX - 0.01, 0.4, ZC);
  for (let i = 0; i < 6; i++) box(0.02, 0.02, 0.62, INK, doorX - 0.03, 0.33 + i * 0.03, ZC);

  // label plate
  box(0.01, 0.1, 0.22, P.plastic, doorX - 0.026, 0.62, ZC + 0.4);
  box(0.006, 0.02, 0.15, INK, doorX - 0.033, 0.62, ZC + 0.4);

  // pipe conduits up the side into ceiling
  const pipeZ = [-1.42, -1.34];
  pipeZ.forEach((z, i) => {
    const c = i ? P.pipeOrange : P.pipeGrey;
    cyl(0.04, 2.45 - 0.0, c, [X1 - 0.12 - i * 0.0, 1.3 + 0.0, z], [0, 1, 0]);
    for (const y of [0.4, 1.0, 1.6, 2.2]) cyl(0.052, 0.04, DARK, [X1 - 0.12, y, z], [0, 1, 0], 8);
  });
  box(0.14, 0.04, 0.2, DARK, X1 - 0.12, 2.48, -1.38);

  // ration dispenser, near locker front edge, on left wall side (z ~ 0.0..0.3 region beyond locker)
  const dz = 0.0, dy = 1.2, dx = 1.8;
  box(0.2, 0.5, 0.2, P.plastic, dx + 0.05, dy, dz);
  box(0.02, 0.5, 0.2, DARK, dx - 0.06, dy, dz);
  // tray
  box(0.14, 0.03, 0.18, STEEL, dx - 0.04, dy - 0.2, dz);
  box(0.14, 0.04, 0.012, STEEL, dx - 0.04, dy - 0.17, dz - 0.09);
  box(0.14, 0.04, 0.012, STEEL, dx - 0.04, dy - 0.17, dz + 0.09);
  // slot
  box(0.02, 0.08, 0.14, INK, dx - 0.065, dy - 0.1, dz);
  // screen
  glow(box(0.01, 0.07, 0.12, P.green, dx - 0.07, dy + 0.12, dz), 1.2);
  // buttons
  const cols = [P.amber, P.red, P.cyan];
  cols.forEach((c, i) => {
    cyl(0.018, 0.02, c, [dx - 0.075, dy + 0.02, dz - 0.06 + i * 0.06], [1, 0, 0], 6);
  });
  glow(b.part(new THREE.SphereGeometry(0.012, 5, 4), P.amber, { at: [dx - 0.075, dy + 0.2, dz + 0.07] }), 1.5);
  // grime streaks
  for (let i = 0; i < 4; i++) box(0.005, 0.2 + r() * 0.3, 0.03, GR, doorX - 0.027, 1.0 + r() * 0.6, ZC - 0.7 + r() * 1.4);
}
    return buildColdLocker;
  })(),
  // diningSet
  (() => {
function buildDiningSet({ b, J, P, M }: any) {
  const R = rng(11);
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, c: string, x: number, y: number, z: number, seg = 12) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, { at: [x, y, z] });
  const AMBER = P.amber;
  const cx = -0.2, cz = 0.5;

  // base plate and bolts
  cyl(0.3, 0.32, 0.04, P.steelDark, cx, 0.12, cz, 16);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.018, 0.018, 0.02, P.steel, cx + Math.cos(a) * 0.25, 0.15, cz + Math.sin(a) * 0.25, 6);
  }
  // pedestal
  cyl(0.07, 0.09, 0.6, P.steel, cx, 0.44, cz, 10);
  cyl(0.1, 0.1, 0.03, P.steelDark, cx, 0.2, cz, 10);
  cyl(0.12, 0.08, 0.06, P.steelDark, cx, 0.72, cz, 10);
  // tabletop: steel rim + plastic top
  const TW = 1.3, TD = 0.84;
  box(TW, 0.04, TD, P.steel, cx, 0.75, cz);
  box(TW - 0.04, 0.03, TD - 0.04, P.plastic, cx, 0.775, cz);
  // rounded corners
  for (const sx of [1, -1]) for (const sz of [1, -1]) {
    cyl(0.03, 0.03, 0.04, P.steel, cx + sx * (TW / 2 - 0.01), 0.75, cz + sz * (TD / 2 - 0.01), 8);
  }
  // under-table grime
  box(TW - 0.1, 0.01, TD - 0.1, P.grime, cx, 0.725, cz);

  // stools
  const stools: [number, number][] = [[-0.75, 0.5], [0.35, 0.5], [-0.2, -0.2], [-0.2, 1.2]];
  stools.forEach(([x, z], i) => {
    cyl(0.14, 0.15, 0.025, P.steelDark, x, 0.1125, z, 10);
    cyl(0.03, 0.03, 0.34, P.steel, x, 0.29, z, 8);
    cyl(0.05, 0.05, 0.03, P.hazard, x, 0.2, z, 8);
    cyl(0.19, 0.19, 0.03, P.steel, x, 0.47, z, 12);
    cyl(0.18, 0.17, 0.07, P.rubber, x, 0.515, z, 12);
    cyl(0.12, 0.14, 0.02, "#333333", x, 0.56, z, 12);
    // footrest ring
    b.part(new THREE.TorusGeometry(0.11, 0.01, 5, 12), P.steel, { at: [x, 0.25, z], rotation: [90, 0, 0] });
    box(0.04, 0.01, 0.02, i % 2 ? P.red : P.amber, x, 0.485, z + 0.19);
  });

  // on the table
  const TY = 0.79;
  // trays
  for (const [x, z] of [[-0.55, 0.5], [0.15, 0.5]] as [number, number][]) {
    box(0.34, 0.015, 0.24, P.steelDark, x, TY + 0.008, z);
    box(0.3, 0.01, 0.2, P.pipeGrey, x, TY + 0.018, z);
    box(0.1, 0.012, 0.08, P.pipeOrange, x - 0.07, TY + 0.028, z - 0.03);
    box(0.09, 0.012, 0.08, P.green, x + 0.07, TY + 0.028, z - 0.03);
    // cutlery
    box(0.01, 0.006, 0.12, P.steel, x - 0.12, TY + 0.028, z + 0.06);
    box(0.012, 0.006, 0.03, P.steel, x - 0.12, TY + 0.028, z + 0.12);
    box(0.01, 0.006, 0.12, P.steel, x - 0.09, TY + 0.028, z + 0.06);
  }
  // cups
  for (const [x, z] of [[-0.4, 0.3], [0.3, 0.7], [-0.3, 0.72]] as [number, number][]) {
    cyl(0.03, 0.025, 0.07, P.plastic, x, TY + 0.035, z, 8);
    cyl(0.026, 0.026, 0.004, P.grime, x, TY + 0.07, z, 8);
    b.part(new THREE.TorusGeometry(0.02, 0.005, 4, 8), P.plastic, { at: [x + 0.035, TY + 0.04, z], rotation: [0, 0, 0] });
  }
  // bowl
  b.part(new THREE.SphereGeometry(0.08, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), P.steel, { at: [-0.2, TY + 0.07, 0.35] });
  cyl(0.04, 0.04, 0.01, P.steelDark, -0.2, TY + 0.008, 0.35, 8);
  cyl(0.065, 0.065, 0.006, P.pipeOrange, -0.2, TY + 0.045, 0.35, 8);
  // ration pack
  box(0.16, 0.025, 0.1, P.hazard, 0.0, TY + 0.015, 0.75);
  box(0.12, 0.005, 0.03, P.ink, 0.0, TY + 0.03, 0.75);
  box(0.14, 0.005, 0.01, P.red, 0.0, TY + 0.03, 0.79);
  // amber lamp
  cyl(0.05, 0.06, 0.02, P.steelDark, -0.2, TY + 0.01, 0.62, 10);
  cyl(0.012, 0.012, 0.1, P.steel, -0.2, TY + 0.07, 0.62, 6);
  const lamp = cyl(0.04, 0.04, 0.07, AMBER, -0.2, TY + 0.14, 0.62, 8);
  lamp.mesh.material = (lamp.mesh.material as THREE.MeshStandardMaterial).clone();
  const m = lamp.mesh.material as THREE.MeshStandardMaterial;
  m.emissive.set(AMBER); m.emissiveIntensity = 1.4;
  cyl(0.045, 0.03, 0.015, P.steelDark, -0.2, TY + 0.185, 0.62, 8);

  // stains and scuffs
  cyl(0.06, 0.06, 0.002, P.grime, 0.3, TY + 0.001, 0.35, 9);
  cyl(0.03, 0.03, 0.002, P.grime, 0.38, TY + 0.001, 0.3, 7);
  for (let i = 0; i < 6; i++) {
    const x = cx + (R() - 0.5) * 1.1, z = cz + (R() - 0.5) * 0.7;
    b.part(new THREE.BoxGeometry(0.1 * R() + 0.03, 0.002, 0.008), P.wallDirty, { at: [x, TY + 0.0005, z], rotation: [0, R() * 180, 0] });
  }
  // floor scuffs
  for (let i = 0; i < 5; i++) {
    const x = cx + (R() - 0.5) * 1.8, z = cz + (R() - 0.5) * 1.4;
    b.part(new THREE.BoxGeometry(0.2, 0.002, 0.03), P.grime, { at: [x, 0.101, z], rotation: [0, R() * 180, 0] });
  }
  // hazard ring on floor
  b.part(new THREE.TorusGeometry(0.34, 0.01, 4, 20), P.hazard, { at: [cx, 0.103, cz], rotation: [90, 0, 0] });
}
    return buildDiningSet;
  })(),
  // ceilingRig
  (() => {
function buildCeilingRig({ b, J, P, M }: any) {
  const r = rng(11);
  const G = P.pipeGrey, O = P.pipeOrange, ST = P.steel, SD = P.steelDark, GR = P.grime;
  const box = (w: number, h: number, d: number, c: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rad: number, len: number, c: string, x: number, y: number, z: number, axis: "x" | "y" | "z", seg = 8) => {
    const dir = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
    return b.part(new THREE.CylinderGeometry(rad, rad, len, seg), c, { at: [x, y, z], dir });
  };
  const glowMat = (p: any) => {
    const m = p.mesh.material.clone();
    m.emissive = new THREE.Color(m.color);
    m.emissiveIntensity = 1;
    p.mesh.material = m;
    return p;
  };

  // ceiling plate
  box(4, 0.06, 3.6, SD, 0, 2.57, 0);
  for (let i = -3; i <= 3; i++) box(0.02, 0.01, 3.6, GR, i * 0.55, 2.538, 0);
  for (let i = -3; i <= 3; i++) box(4, 0.01, 0.02, GR, 0, 2.538, i * 0.5);

  // pipes along z
  const zp = [[-1.5, 2.42, 0.1, G], [-1.25, 2.48, 0.07, O], [0.4, 2.44, 0.09, O], [1.3, 2.4, 0.11, G], [1.65, 2.46, 0.06, O]];
  for (const [x, y, rad, c] of zp as any[]) {
    cyl(rad, 3.5, c, x, y, 0, "z");
    for (let z = -1.4; z <= 1.5; z += 0.7) {
      cyl(rad + 0.015, 0.05, ST, x, y, z, "z", 10);
      box(rad * 2 + 0.04, 0.03, 0.05, SD, x, y + rad + 0.02, z);
      for (let k = 0; k < 4; k++) {
        const a = (k * Math.PI) / 2 + 0.4;
        b.part(new THREE.SphereGeometry(0.01, 5, 4), ST, { at: [x + Math.cos(a) * (rad + 0.02), y + Math.sin(a) * (rad + 0.02), z + 0.03] });
      }
    }
  }
  // pipes along x
  const xp = [[-1.1, 2.3, 0.08, G], [0.9, 2.28, 0.07, O]];
  for (const [z, y, rad, c] of [[-1.2, 2.3, 0.08, G], [0.9, 2.28, 0.07, O], [-0.3, 2.34, 0.05, O]] as any[]) {
    cyl(rad, 3.8, c, 0, y, z, "x");
    for (let x = -1.6; x <= 1.7; x += 0.8) cyl(rad + 0.015, 0.05, ST, x, y, z, "x", 10);
  }
  void xp;
  // valves
  for (const [x, z] of [[-1.5, 0.8], [1.3, -0.9], [0.4, -1.2]]) {
    cyl(0.03, 0.14, ST, x, 2.3, z, "y");
    cyl(0.07, 0.015, P.red, x, 2.22, z, "y", 10);
    box(0.14, 0.012, 0.012, P.red, x, 2.22, z);
  }
  // vertical drops to locker / cabinets
  cyl(0.06, 0.4, G, 1.7, 2.3, -0.6, "y");
  cyl(0.075, 0.04, ST, 1.7, 2.12, -0.6, "y", 10);
  cyl(0.05, 0.4, O, -1.2, 2.3, -1.2, "y");
  cyl(0.065, 0.04, ST, -1.2, 2.12, -1.2, "y", 10);

  // strip lights
  const strip = (x: number, z: number, on: string | null) => {
    box(0.3, 0.05, 1.0, SD, x, 2.49, z);
    const p = box(0.24, 0.02, 0.9, on ?? "#2a2c2b", x, 2.46, z);
    if (on) glowMat(p);
    box(0.02, 0.03, 1.0, ST, x - 0.14, 2.47, z);
    box(0.02, 0.03, 1.0, ST, x + 0.14, 2.47, z);
  };
  strip(-0.6, -0.8, "#e8f2d0");
  strip(0.1, -0.8, "#e8f2d0");
  strip(-0.6, 0.7, null);

  // vent grille
  box(0.7, 0.04, 0.5, SD, 0.7, 2.5, 1.1);
  for (let i = 0; i < 7; i++) box(0.62, 0.015, 0.025, GR, 0.7, 2.475, 0.92 + i * 0.06);
  // speaker grille
  cyl(0.12, 0.03, SD, -1.4, 2.5, 1.3, "y", 12);
  for (let i = -2; i <= 2; i++) box(0.2, 0.012, 0.012, GR, -1.4, 2.483, 1.3 + i * 0.04);
  // beacon
  cyl(0.07, 0.03, SD, 1.6, 2.5, 1.4, "y", 10);
  glowMat(b.part(new THREE.SphereGeometry(0.06, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), P.red, { at: [1.6, 2.48, 1.4], dir: [0, -1, 0] }));

  // hazard stencils
  for (let i = 0; i < 6; i++) box(0.08, 0.006, 0.02, i % 2 ? P.ink : P.hazard, -0.3 + i * 0.09, 2.535, 1.55);
  box(0.3, 0.004, 0.14, P.hazard, -1.1, 2.536, -1.6);
  for (let i = 0; i < 3; i++) box(0.04, 0.006, 0.09, P.ink, -1.2 + i * 0.1, 2.532, -1.6);

  // cable loops
  for (let k = 0; k < 3; k++) {
    const x0 = -0.9 + k * 0.5 + r() * 0.1, z0 = 0.3 + k * 0.2;
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x0, 2.53, z0), new THREE.Vector3(x0 + 0.1, 2.3, z0 + 0.05),
      new THREE.Vector3(x0 + 0.25, 2.25, z0 + 0.08), new THREE.Vector3(x0 + 0.4, 2.53, z0 + 0.1),
    ]);
    b.part(new THREE.TubeGeometry(path, 10, 0.018, 5, false), k % 2 ? P.ink : P.red, { at: [0, 0, 0] });
  }
  // indicator dots
  for (let i = 0; i < 4; i++) glowMat(box(0.025, 0.012, 0.025, i % 2 ? P.amber : P.cyan, -1.8 + i * 0.07, 2.53, -1.65));
}
    return buildCeilingRig;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "nostromoGalley" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
