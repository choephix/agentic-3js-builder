import * as THREE from "three";
import { createBuilder, type Builder, type Joint, frame, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Nostromo Galley",
  "description": "The cramped commercial-towing-crew galley of a 1979 retro-futurist starfreighter: gridded deck, cream panel walls with dark seams, a counter run with coffee maker and CRT, a central mess table and overhead ductwork."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  deckPlate: "#2e3238",
  deckChecker: "#4a5058",
  hull: "#3b4250",
  panelCream: "#cfc4ac",
  panelCreamLit: "#e2d8c0",
  trimDark: "#26231e",
  hazard: "#e7b814",
  greebleGrey: "#8a8f94",
  machineGreen: "#4f6450",
  steel: "#7d838c",
  rubber: "#1c1a18",
  amberLamp: "#ffb020",
  crtGlow: "#57ff7a",
  warningRed: "#ff3b2f",
  copper: "#a4703c",
  tableTop: "#6e6a5e",
  utensil: "#d9d2c2",
  shadowInk: "#14120f",
};
const M = {
  deckTop: [0, 0.12, 0] as [number, number, number],
  aftWallFace: [0, 1.2, -2.2] as [number, number, number],
  sideWallFaceL: [-1, 1.2, 0] as [number, number, number],
  sideWallFaceR: [1, 1.2, 0] as [number, number, number],
  ceilingSoffit: [0, 2.05, 0] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // deck
  (() => {
function buildDeck({ b, J, P, M }: Ctx) {
  const TOP = M.deckTop[1]; // 0.12
  const R = rng(11);
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rotY = 0) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: [0, rotY, 0] });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z] });

  // Base slab: y 0..0.12
  box(2.4, TOP, 4.8, P.deckPlate, 0, TOP / 2, 0);
  // Edge trim lip along the slab sides (flush)
  for (const s of [1, -1]) box(0.03, 0.02, 4.8, P.trimDark, s * 1.185, TOP + 0.005, 0);
  box(2.4, 0.02, 0.03, P.trimDark, 0, TOP + 0.005, -2.385);

  // Checker panels with bolts
  const PH = 0.025;
  const bolt = (x: number, y: number, z: number) =>
    b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 6), P.steel, { at: [x, y, z] });
  const panel = (cx: number, cz: number, w: number, d: number) => {
    box(w, PH, d, P.deckChecker, cx, TOP + PH / 2, cz);
    const y = TOP + PH + 0.003;
    // checker ribs: thin diagonal-ish cross lines
    const n = Math.max(2, Math.floor(d / 0.16));
    for (let i = 0; i < n; i++) {
      const z = cz - d / 2 + ((i + 0.5) * d) / n;
      box(w * 0.86, 0.006, 0.012, P.deckPlate, cx, y, z);
    }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) bolt(cx + sx * (w / 2 - 0.03), y, cz + sz * (d / 2 - 0.03));
    const mx = w > 0.7 ? 1 : 0;
    if (mx) for (const sz of [-1, 1]) bolt(cx, y, cz + sz * (d / 2 - 0.03));
    const mz = Math.floor(d / 0.8);
    for (let k = 1; k <= mz; k++) {
      const z = cz - d / 2 + (k * d) / (mz + 1);
      for (const sx of [-1, 1]) bolt(cx + sx * (w / 2 - 0.03), y, z);
    }
  };
  // central panel and outer wall-side panels
  panel(0, -0.2, 0.95, 3.8);
  for (const s of [1, -1]) {
    panel(s * 1.0 + 0, 0, 0.0001, 0.0001); // placeholder removed below
  }
  // Remove placeholders by not using them: real panels
  // wall-side panels (x ±1.0..1.2 narrow strips, aft/fore sections)
  for (const s of [1, -1]) {
    panel(s * 1.0, -1.35, 0.3, 1.9);
    panel(s * 1.0, 1.0, 0.3, 2.3);
    // between center and grating
    panel(s * 0.32 + s * 0.0, -0.2, 0.0001, 0.0001);
  }

  // Grating strips at x = ±0.65, z -2.2..2.1
  for (const s of [1, -1]) {
    const gx = s * 0.65;
    box(0.3, 0.03, 4.3, P.trimDark, gx, TOP + 0.015, -0.05);
    box(0.24, 0.032, 4.2, P.shadowInk, gx, TOP + 0.016, -0.05);
    // cross ribs
    for (let z = -2.1; z <= 2.0; z += 0.1) box(0.26, 0.04, 0.02, P.steel, gx, TOP + 0.02, z);
    // longitudinal bars
    for (const dx of [-0.06, 0, 0.06]) box(0.012, 0.042, 4.2, P.greebleGrey, gx + dx, TOP + 0.021, -0.05);
  }

  // Hazard strip at entry
  const hz = 2.3;
  box(2.4, 0.02, 0.2, P.trimDark, 0, TOP + 0.01, hz);
  const n = 24;
  for (let i = 0; i < n; i++) {
    const x = -1.15 + (i + 0.5) * (2.3 / n);
    if (i % 2 === 0) box(0.09, 0.024, 0.18, P.hazard, x, TOP + 0.011, hz, 0.5);
  }
  box(2.4, 0.026, 0.015, P.hazard, 0, TOP + 0.012, 2.195);

  // Cable conduit along left wall base (x=+1.2 is left, use +)
  const cx = 1.12;
  box(0.1, 0.05, 3.2, P.trimDark, cx, TOP + 0.025, -0.4);
  box(0.11, 0.012, 3.2, P.shadowInk, cx, TOP + 0.052, -0.4);
  for (let z = -1.8; z <= 1.0; z += 0.4) box(0.12, 0.054, 0.03, P.steel, cx, TOP + 0.027, z);
  // rubber cable beside it
  const cable = [
    [0.98, TOP + 0.015, 1.1],
    [1.0, TOP + 0.015, 0.4],
    [0.96, TOP + 0.015, -0.4],
    [1.0, TOP + 0.015, -1.2],
    [0.97, TOP + 0.015, -1.9],
  ];
  b.sweep(cable, 0.014, { color: P.rubber, bone: undefined as any, sides: 6 } as any);

  // Deck drain
  const dx = -0.1, dz = 0.9;
  cyl(0.12, 0.12, 0.012, 16, P.steel, dx, TOP + 0.006, dz);
  cyl(0.09, 0.09, 0.016, 16, P.shadowInk, dx, TOP + 0.008, dz);
  for (let i = -2; i <= 2; i++) box(0.17, 0.02, 0.012, P.steel, dx, TOP + 0.01, dz + i * 0.03);
  cyl(0.02, 0.02, 0.02, 8, P.greebleGrey, dx, TOP + 0.01, dz);

  // Hatch plate with folding handle
  const hx = -0.35, hzp = -1.1;
  box(0.5, 0.02, 0.5, P.greebleGrey, hx, TOP + 0.03, hzp);
  box(0.42, 0.012, 0.42, P.steel, hx, TOP + 0.042, hzp);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bolt(hx + sx * 0.2, TOP + 0.05, hzp + sz * 0.2);
  box(0.2, 0.012, 0.05, P.trimDark, hx, TOP + 0.05, hzp);
  box(0.16, 0.01, 0.02, P.steel, hx, TOP + 0.058, hzp);
  // hinge
  box(0.04, 0.02, 0.06, P.trimDark, hx - 0.1, TOP + 0.052, hzp);

  // Scuff patch near table
  const sc = b.part(new THREE.CylinderGeometry(0.4, 0.4, 0.004, 14), P.shadowInk, { at: [0.15, TOP + 0.027, 0.95] });
  sc.mesh.scale.set(1.2, 1, 0.8);
  for (let i = 0; i < 6; i++) {
    box(0.08 + R() * 0.1, 0.004, 0.02, P.shadowInk, 0.15 + (R() - 0.5) * 0.9, TOP + 0.027, 0.95 + (R() - 0.5) * 0.7, R() * 3);
  }
}
    return buildDeck;
  })(),
  // aftCounterWall
  (() => {
function buildAftCounterWall({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const X0 = -2.4; // wall plane z
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], ...o });
  const cyl = (rt: number, rb: number, h: number, color: string, at: number[], seg = 10, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at, ...o });
  const rivet = (x: number, y: number, z: number, color = P.greebleGrey, r = 0.014) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), color, { at: [x, y, z] });
  const lamp = (x: number, y: number, z: number, color: string, r = 0.02, s = 1.5) =>
    glow(b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z] }), s);

  // ---------- back wall: panels in seam grid ----------
  const wallZ = X0 + 0.04;
  box(2.4, 2.18, 0.08, P.trimDark, 0, 1.21, X0 + 0.04);
  const cols = 6, rows = 4;
  const pw = 2.4 / cols, y0 = 0.12, ph = 2.18 / rows;
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const cx = -1.2 + pw * (i + 0.5), cy = y0 + ph * (j + 0.5);
      const lit = j >= 2;
      box(pw - 0.06, ph - 0.06, 0.03, lit ? P.panelCreamLit : P.panelCream, cx, cy, wallZ + 0.03);
      // inset bevel
      box(pw - 0.16, ph - 0.16, 0.01, P.panelCream, cx, cy, wallZ + 0.05);
      for (const sx of [-1, 1]) for (const sy of [-1, 1])
        rivet(cx + sx * (pw / 2 - 0.05), cy + sy * (ph / 2 - 0.05), wallZ + 0.05, P.greebleGrey, 0.011);
    }

  // ---------- lower cabinets ----------
  const cz = -2.05, cd = 0.7;
  box(2.4, 0.1, cd - 0.04, P.trimDark, 0, 0.17, cz); // kick plate
  box(2.4, 0.03, 0.02, P.hazard, 0, 0.14, -1.71);
  for (let i = 0; i < 12; i++) box(0.1, 0.035, 0.022, P.trimDark, -1.1 + i * 0.2, 0.14, -1.708);
  box(2.4, 0.73, cd, P.machineGreen, 0, 0.58, cz);
  const doors = 6, dw = 2.4 / doors;
  for (let i = 0; i < doors; i++) {
    const x = -1.2 + dw * (i + 0.5);
    box(dw - 0.04, 0.6, 0.03, P.machineGreen, x, 0.58, -1.69);
    box(dw - 0.02, 0.02, 0.035, P.trimDark, x, 0.88, -1.69);
    box(0.02, 0.1, 0.04, P.steel, x + (i % 2 ? -0.1 : 0.1), 0.62, -1.665);
    for (const sx of [-1, 1]) rivet(x + sx * (dw / 2 - 0.06), 0.3, -1.67, P.greebleGrey, 0.01);
  }
  for (let i = 0; i <= doors; i++) box(0.025, 0.66, 0.035, P.trimDark, -1.2 + dw * i, 0.58, -1.69);
  // worktop
  box(2.44, 0.05, 0.76, P.steel, 0, 0.945, cz + 0.02);
  box(2.44, 0.02, 0.03, P.trimDark, 0, 0.97, -1.675);

  const top = 0.97;
  // ---------- coffee maker (left, x ~ +? left side is +X; spec: left to right viewed) ----------
  const cx0 = 0.75;
  box(0.34, 0.34, 0.3, P.machineGreen, cx0, top + 0.17, -2.2);
  box(0.36, 0.03, 0.32, P.trimDark, cx0, top + 0.355, -2.2);
  box(0.3, 0.1, 0.1, P.machineGreen, cx0, top + 0.36, -2.28);
  box(0.06, 0.05, 0.12, P.steel, cx0, top + 0.28, -2.0); // spout
  box(0.3, 0.03, 0.16, P.trimDark, cx0, top + 0.015, -1.95); // drip tray
  box(0.28, 0.01, 0.14, P.steel, cx0, top + 0.035, -1.95);
  cyl(0.06, 0.06, 0.16, P.utensil, [cx0 + 0.07, top + 0.13, -1.96], 10, {});
  cyl(0.05, 0.06, 0.12, P.utensil, [cx0 - 0.08, top + 0.1, -1.95], 10);
  box(0.1, 0.22, 0.02, P.utensil, cx0 + 0.07, top + 0.12, -1.88);
  cyl(0.06, 0.05, 0.14, P.utensil, [cx0 + 0.07, top + 0.13, -1.96], 10);
  b.part(new THREE.TorusGeometry(0.04, 0.008, 5, 8), P.trimDark, { at: [cx0 + 0.12, top + 0.13, -1.96], rotation: [0, 90, 0] });
  cyl(0.052, 0.062, 0.02, P.trimDark, [cx0 + 0.07, top + 0.2, -1.96], 10);
  lamp(cx0 - 0.1, top + 0.3, -2.045, P.amberLamp);
  box(0.06, 0.03, 0.01, P.trimDark, cx0 + 0.05, top + 0.3, -2.047);
  for (let i = 0; i < 3; i++) rivet(cx0 - 0.14 + i * 0.1, top + 0.05, -2.047);

  // ---------- food heater ----------
  const hx = 0.1;
  box(0.5, 0.36, 0.38, P.steel, hx, top + 0.18, -2.15);
  box(0.52, 0.03, 0.4, P.greebleGrey, hx, top + 0.375, -2.15);
  box(0.3, 0.2, 0.02, P.trimDark, hx - 0.05, top + 0.18, -1.955);
  box(0.26, 0.16, 0.012, P.shadowInk, hx - 0.05, top + 0.18, -1.945);
  box(0.03, 0.2, 0.04, P.hazard, hx + 0.14, top + 0.18, -1.94);
  for (let i = 0; i < 4; i++) box(0.03, 0.03, 0.042, P.trimDark, hx + 0.14, top + 0.1 + i * 0.05 + 0.025, -1.94);
  lamp(hx + 0.19, top + 0.3, -1.955, P.warningRed, 0.022, 1.8);
  for (const sx of [-1, 1]) for (const sy of [0.04, 0.33]) rivet(hx + sx * 0.22, top + sy, -1.955, P.trimDark, 0.012);
  box(0.4, 0.05, 0.3, P.trimDark, hx, top + 0.405, -2.15);

  // ---------- sink ----------
  const sx0 = -0.6;
  box(0.62, 0.02, 0.5, P.steel, sx0, top + 0.01, -2.1);
  box(0.5, 0.012, 0.38, P.shadowInk, sx0, top + 0.022, -2.1);
  box(0.64, 0.03, 0.04, P.greebleGrey, sx0, top + 0.03, -1.85);
  box(0.64, 0.03, 0.04, P.greebleGrey, sx0, top + 0.03, -2.35);
  cyl(0.02, 0.02, 0.3, P.steel, [sx0 + 0.15, top + 0.17, -2.33], 8);
  b.part(new THREE.TorusGeometry(0.07, 0.016, 6, 8, Math.PI), P.steel, { at: [sx0 + 0.08, top + 0.32, -2.33], rotation: [0, 0, 0] });
  cyl(0.015, 0.015, 0.1, P.steel, [sx0 + 0.01, top + 0.27, -2.33], 8);
  cyl(0.03, 0.03, 0.02, P.warningRed, [sx0 + 0.15, top + 0.34, -2.33], 8);
  for (let i = 0; i < 2; i++) box(0.3, 0.015, 0.22, P.greebleGrey, sx0 - 0.05 + (i ? 0.02 : 0), top + 0.04 + i * 0.02, -2.0 + 0.0).rotation.y = i * 0.15;
  // trays stacked on counter beside sink
  for (let i = 0; i < 2; i++) box(0.3, 0.02, 0.2, P.steel, -1.0, top + 0.02 + i * 0.025, -2.0);
  box(0.26, 0.012, 0.16, P.greebleGrey, -1.0, top + 0.06, -2.0);

  // ---------- conduit backboard ----------
  box(2.3, 0.4, 0.04, P.trimDark, 0, 1.65, wallZ + 0.07);
  const pipeY = [1.5, 1.6, 1.7];
  for (const [i, py] of pipeY.entries()) {
    b.part(new THREE.CylinderGeometry(0.022, 0.022, 2.25, 8), i === 1 ? P.trimDark : P.copper, { at: [0, py + 0.06, -2.3], rotation: [0, 0, 90] });
    for (let k = 0; k < 6; k++) box(0.04, 0.07, 0.04, P.steel, -1.0 + k * 0.4 + i * 0.1, py + 0.06, -2.3);
  }
  // red valve wheel
  cyl(0.02, 0.02, 0.06, P.steel, [-0.3, 1.48, -2.27], 8, { rotation: [90, 0, 0] });
  b.part(new THREE.TorusGeometry(0.07, 0.012, 6, 10), P.warningRed, { at: [-0.3, 1.48, -2.22] });
  for (const a of [0, 60, 120]) b.part(new THREE.BoxGeometry(0.14, 0.012, 0.012), P.warningRed, { at: [-0.3, 1.48, -2.22], rotation: [0, 0, a] });
  // vertical riser
  b.part(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), P.copper, { at: [-0.3, 1.32, -2.3] });

  // ---------- upper lockers (right side, x -1.2..-0.15 ) ----------
  const ly = 1.43;
  const lockers = 3, lw = 0.38;
  for (let i = 0; i < lockers; i++) {
    const x = -1.0 + i * (lw + 0.02) - 0.0;
    box(lw, 0.52, 0.32, P.panelCream, x - 0.0, ly + 0.35, -2.22);
    box(lw - 0.06, 0.44, 0.02, P.panelCreamLit, x, ly + 0.35, -2.055);
    box(0.05, 0.08, 0.03, P.trimDark, x + 0.12, ly + 0.25, -2.04);
    box(0.02, 0.03, 0.035, P.amberLamp, x + 0.12, ly + 0.25, -2.035);
    box(lw, 0.025, 0.34, P.trimDark, x, ly + 0.1, -2.22);
    rivet(x - 0.14, ly + 0.55, -2.05);
    rivet(x + 0.14, ly + 0.55, -2.05);
    box(0.02, 0.1, 0.03, P.steel, x - 0.12, ly + 0.35, -2.04);
  }
  // ---------- CRT on arm ----------
  const mx = 0.55, my = 1.78;
  box(0.07, 0.07, 0.07, P.steel, mx, my + 0.15, -2.33); // wall mount
  box(0.06, 0.4, 0.06, P.steel, mx, my + 0.0, -2.3).rotation.z = 0.0;
  b.part(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), P.steel, { at: [mx, my + 0.12, -2.2], rotation: [90, 0, 0] });
  cyl(0.04, 0.04, 0.05, P.trimDark, [mx, my + 0.12, -2.05], 8);
  box(0.46, 0.38, 0.1, P.greebleGrey, mx, my + 0.12, -1.95);
  box(0.38, 0.3, 0.16, P.greebleGrey, mx, my + 0.12, -2.05);
  box(0.4, 0.32, 0.03, P.trimDark, mx, my + 0.12, -1.89);
  glow(box(0.32, 0.24, 0.012, P.crtGlow, mx, my + 0.12, -1.872), 1.3);
  for (let i = 0; i < 5; i++) box(0.22 - (i % 2) * 0.08, 0.012, 0.014, P.trimDark, mx - 0.03 - (i % 2) * 0.04, my + 0.2 - i * 0.04, -1.864);
  lamp(mx + 0.17, my - 0.03, -1.89, P.amberLamp, 0.012);
  for (let i = 0; i < 3; i++) box(0.012, 0.04, 0.02, P.trimDark, mx - 0.15 + i * 0.03, my - 0.03, -1.885);
  for (let i = 0; i < 4; i++) box(0.3, 0.008, 0.06, P.trimDark, mx, my + 0.28, -2.04 - i * 0.0 + 0.0);

  // ---------- printout ----------
  const px = -0.12, py = 1.45;
  box(0.2, 0.28, 0.004, P.utensil, px, py, -2.285 + 0.02);
  for (let i = 0; i < 6; i++) box(0.12 + R() * 0.04, 0.008, 0.002, P.trimDark, px - 0.01, py + 0.1 - i * 0.04, -2.261 );
  for (const sx of [-1, 1]) b.part(new THREE.SphereGeometry(0.008, 6, 4), P.warningRed, { at: [px + sx * 0.08, py + 0.13, -2.262] });

  // top trim over everything
  box(2.4, 0.04, 0.08, P.trimDark, 0, 2.28, -2.36);
  box(2.4, 0.04, 0.08, P.trimDark, 0, 0.14, -2.36);
  for (const sx of [-1, 1]) box(0.06, 2.18, 0.1, P.trimDark, sx * 1.17, 1.21, -2.34);
}
    return buildAftCounterWall;
  })(),
  // sideWalls
  (() => {
function buildSideWalls({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const Y0 = 0.12, Y1 = 2.3, ZA = -2.4, ZF = 2.4;
  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });
  const cyl = (r: number, len: number, color: string, at: number[], dir: number[], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at: at as any, dir: dir as any });
  const sph = (r: number, color: string, x: number, y: number, z: number) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: [x, y, z] });

  for (const s of [1, -1]) {
    // s = +1 left wall (+X side as per model), interior faces toward -s*x
    const wx = s * 1.2;        // wall back plane
    const f = -s;              // direction toward room interior
    const face = wx + f * 0.06; // panel face plane
    // base wall slab
    box(0.12, Y1 - Y0, ZF - ZA, P.hull, wx - f * 0.0 + s * 0.0, (Y0 + Y1) / 2, 0);
    // top and bottom rails
    box(0.16, 0.1, ZF - ZA, P.trimDark, wx + f * 0.07, Y1 - 0.2, 0);
    box(0.16, 0.12, ZF - ZA, P.trimDark, wx + f * 0.07, Y0 + 0.06, 0);
    // ribbed cream panels along z with dark seams
    const nP = 12, pw = (ZF - ZA) / nP;
    for (let i = 0; i < nP; i++) {
      const z = ZA + pw * (i + 0.5);
      box(0.04, 1.62, pw - 0.04, i % 3 === 1 ? P.panelCreamLit : P.panelCream, wx + f * 0.08, 1.2, z);
      // ribs
      for (let k = 0; k < 3; k++) box(0.015, 1.58, 0.02, P.panelCream, wx + f * 0.105, 1.2, z - pw / 2 + 0.1 + k * (pw - 0.2) / 2);
      // seam
      box(0.05, 1.66, 0.025, P.trimDark, wx + f * 0.08, 1.2, z + pw / 2);
      // rivets
      for (const yy of [0.5, 1.9]) sph(0.014, P.greebleGrey, face + f * 0.03, yy, z - pw / 2 + 0.05);
    }
    // horizontal seams
    for (const yy of [0.45, 1.2, 1.95]) box(0.05, 0.025, ZF - ZA, P.trimDark, wx + f * 0.08, yy, 0);

    // big recessed access panel (mid-room, z ~ 0.9)
    const az = 0.95;
    box(0.03, 0.9, 0.9, P.trimDark, face + f * 0.0, 1.15, az);
    box(0.03, 0.78, 0.78, P.hull, face + f * 0.03, 1.15, az);
    box(0.03, 0.72, 0.72, P.greebleGrey, face + f * 0.05, 1.15, az);
    for (const dy of [-0.34, 0.34]) for (const dz of [-0.34, 0.34]) sph(0.02, P.steel, face + f * 0.075, 1.15 + dy, az + dz);
    box(0.04, 0.16, 0.04, P.rubber, face + f * 0.08, 1.15, az + 0.25);
    box(0.02, 0.1, 0.1, P.hazard, face + f * 0.065, 1.55, az);

    // wall lamp (fore)
    const lz = 2.0;
    box(0.14, 0.14, 0.26, P.steel, face + f * 0.09, 1.75, lz);
    box(0.04, 0.16, 0.28, P.trimDark, face + f * 0.03, 1.75, lz);
    box(0.1, 0.02, 0.2, P.amberLamp, face + f * 0.09, 1.675, lz);

    // vent grille
    const vz = 1.45;
    box(0.04, 0.4, 0.5, P.trimDark, face + f * 0.04, 1.6, vz);
    for (let k = 0; k < 7; k++) box(0.03, 0.025, 0.42, P.greebleGrey, face + f * 0.07, 1.45 + k * 0.05, vz);

    // switch panel
    const sz = 0.15;
    box(0.04, 0.4, 0.7, P.panelCream, face + f * 0.04, 1.55, sz);
    box(0.02, 0.42, 0.72, P.trimDark, face + f * 0.025, 1.55, sz);
    for (let k = 0; k < 6; k++) {
      const z = sz - 0.27 + k * 0.1, yy = 1.6 + (k % 2) * -0.0;
      box(0.03, 0.06, 0.06, P.trimDark, face + f * 0.07, yy, z);
      cyl(0.01, 0.09, P.steel, [face + f * 0.1, yy, z], [f * 0.5, 0.8, 0], 6);
      sph(0.016, P.steel, face + f * 0.125, yy + 0.045, z);
    }
    sph(0.025, P.amberLamp, face + f * 0.07, 1.45, sz - 0.2);
    sph(0.025, P.warningRed, face + f * 0.07, 1.45, sz - 0.1);
    box(0.02, 0.03, 0.2, P.hazard, face + f * 0.065, 1.45, sz + 0.15);

    // cable clamp plate low
    const cz = 0.6;
    box(0.03, 0.22, 0.4, P.trimDark, face + f * 0.03, 0.3, cz - 1.4);
    for (const dz of [-0.1, 0.1]) {
      b.part(new THREE.TorusGeometry(0.06, 0.018, 6, 10), P.rubber, { at: [face + f * 0.06, 0.28, cz - 1.4 + dz], dir: [1, 0, 0], axis: "z" });
      sph(0.012, P.steel, face + f * 0.055, 0.38, cz - 1.4 + dz);
    }

    if (s === 1) {
      // shelf with mugs
      const shz = -1.55;
      box(0.2, 0.04, 0.6, P.steel, face + f * 0.12, 1.2, shz);
      box(0.18, 0.12, 0.02, P.steel, face + f * 0.1, 1.15, shz - 0.3);
      const mugs = [P.greebleGrey, P.machineGreen, P.copper];
      mugs.forEach((c, i) => {
        const z = shz - 0.2 + i * 0.16;
        cyl(0.034, 0.08, c, [face + f * 0.13, 1.26, z], [0, 1, 0], 10);
        box(0.015, 0.05, 0.02, c, face + f * 0.13, 1.26, z + 0.045);
        cyl(0.026, 0.005, P.shadowInk, [face + f * 0.13, 1.302, z], [0, 1, 0], 8);
      });
      box(0.07, 0.07, 0.07, P.trimDark, face + f * 0.13, 1.255, shz + 0.27);
      for (let k = 0; k < 3; k++) cyl(0.006, 0.08, P.utensil, [face + f * 0.13 + (k - 1) * 0.015, 1.34, shz + 0.27], [0, 1, 0.1 * (k - 1)], 5);
    } else {
      // fire extinguisher
      const ez = -1.55;
      box(0.03, 0.5, 0.16, P.trimDark, face + f * 0.03, 1.1, ez);
      cyl(0.065, 0.42, P.warningRed, [face + f * 0.11, 1.1, ez], [0, 1, 0], 12);
      cyl(0.068, 0.07, P.hazard, [face + f * 0.11, 1.1, ez], [0, 1, 0], 12);
      cyl(0.03, 0.06, P.steel, [face + f * 0.11, 1.34, ez], [0, 1, 0], 8);
      cyl(0.012, 0.14, P.steel, [face + f * 0.11, 1.37, ez + 0.06], [0, 0.3, 1], 6);
      box(0.03, 0.02, 0.1, P.steel, face + f * 0.11, 1.4, ez - 0.03);
      for (const yy of [0.98, 1.22]) box(0.14, 0.025, 0.04, P.rubber, face + f * 0.11, yy, ez + 0.0 - 0.0).scale.set(1, 1, 3.6);
      sph(0.02, P.amberLamp, face + f * 0.05, 1.45, ez + 0.2);
    }
  }
}
    return buildSideWalls;
  })(),
  // messTable
  (() => {
function buildMessTable({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const DECK = M.deckTop[1];
  const CX = 0, CZ = 0.05;
  const TOP = 0.78;

  const cyl = (rt: number, rb: number, h: number, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const box = (w: number, h: number, d: number) => new THREE.BoxGeometry(w, h, d);
  const put = (g: THREE.BufferGeometry, color: string, x: number, y: number, z: number, opts: any = {}) =>
    b.part(g, color, { at: [x, y, z], ...opts });

  // ---------- pedestal ----------
  put(cyl(0.3, 0.34, 0.06, 20), P.trimDark, CX, DECK + 0.03, CZ);
  put(cyl(0.26, 0.3, 0.05, 20), P.hull, CX, DECK + 0.085, CZ);
  // bolts on base
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    put(cyl(0.014, 0.014, 0.012, 6), P.steel, CX + Math.cos(a) * 0.31, DECK + 0.066, CZ + Math.sin(a) * 0.31);
  }
  // column
  put(cyl(0.12, 0.15, 0.5, 12), P.hull, CX, DECK + 0.36, CZ);
  // flutes
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r = 0.14;
    put(box(0.02, 0.44, 0.02), P.trimDark, CX + Math.cos(a) * r, DECK + 0.36, CZ + Math.sin(a) * r, {
      rotation: [0, -(a * 180) / Math.PI, 0],
    });
  }
  put(cyl(0.17, 0.12, 0.05, 12), P.trimDark, CX, DECK + 0.63, CZ);
  put(cyl(0.2, 0.2, 0.03, 16), P.steel, CX, TOP - 0.065, CZ);

  // ---------- table top ----------
  const tt = 0.04;
  put(cyl(0.62, 0.62, tt, 28), P.tableTop, CX, TOP - tt / 2 - 0.0, CZ);
  const tb = TOP; // surface
  // rim ring
  put(new THREE.TorusGeometry(0.62, 0.016, 6, 40), P.steel, CX, TOP - 0.02, CZ, { rotation: [90, 0, 0] });
  // underside lip
  put(cyl(0.58, 0.58, 0.02, 24), P.trimDark, CX, TOP - tt - 0.01, CZ);
  // bolts
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    put(cyl(0.013, 0.013, 0.01, 6), P.steel, CX + Math.cos(a) * 0.57, tb + 0.004, CZ + Math.sin(a) * 0.57);
  }
  // inset ring line
  put(new THREE.TorusGeometry(0.5, 0.004, 4, 36), P.trimDark, CX, tb + 0.002, CZ, { rotation: [90, 0, 0] });

  // ---------- trays ----------
  const tray = (x: number, z: number, rot: number, food: boolean) => {
    const o = { rotation: [0, rot, 0] };
    const tp = new THREE.Object3D();
    const rotY = (dx: number, dz: number) => {
      const a = (rot * Math.PI) / 180;
      return [x + dx * Math.cos(a) + dz * Math.sin(a), z - dx * Math.sin(a) + dz * Math.cos(a)];
    };
    void tp;
    put(box(0.34, 0.016, 0.24), P.greebleGrey, x, tb + 0.008, z, o);
    // rim walls
    for (const [dx, dz, w, d] of [
      [0, 0.12, 0.34, 0.012],
      [0, -0.12, 0.34, 0.012],
      [0.17, 0, 0.012, 0.24],
      [-0.17, 0, 0.012, 0.24],
    ] as number[][]) {
      const [px, pz] = rotY(dx, dz);
      put(box(w, 0.026, d), P.steel, px, tb + 0.026, pz, o);
    }
    // compartments (dark insets)
    for (const dx of [-0.085, 0.085]) {
      const [px, pz] = rotY(dx, 0);
      put(box(0.14, 0.006, 0.19), P.shadowInk, px, tb + 0.018, pz, o);
    }
    // divider
    put(box(0.01, 0.026, 0.22), P.steel, ...(() => { const [px, pz] = rotY(0, 0); return [px, tb + 0.026, pz] as [number, number, number]; })(), o);
    if (food) {
      const [px, pz] = rotY(-0.085, 0);
      put(new THREE.ConeGeometry(0.06, 0.04, 4), "#3a2a1e", px, tb + 0.04, pz, { rotation: [0, rot + 45, 0] });
      const [qx, qz] = rotY(0.085, 0.01);
      put(new THREE.SphereGeometry(0.045, 8, 6), "#e8e0cc", qx, tb + 0.03, qz, { scale: [1, 0.6, 1] });
    }
  };
  tray(-0.2, 0.2, 10, true);
  tray(0.12, -0.28, -25, false);

  // ---------- mugs ----------
  const mug = (x: number, z: number, color: string, steam: boolean) => {
    put(cyl(0.04, 0.034, 0.09, 12), color, x, tb + 0.045, z);
    put(cyl(0.034, 0.034, 0.004, 12), P.shadowInk, x, tb + 0.089, z);
    put(new THREE.TorusGeometry(0.025, 0.007, 5, 8, Math.PI), color, x + 0.045, tb + 0.045, z, { rotation: [0, 0, -90] });
    if (steam) {
      for (let i = 0; i < 3; i++) {
        const dx = (i - 1) * 0.015;
        glow(b.part(new THREE.ConeGeometry(0.005, 0.07 + i * 0.015, 4), P.amberLamp, { at: [x + dx, tb + 0.13 + i * 0.008, z + (i % 2) * 0.01] }), 0.8);
      }
    }
  };
  mug(0.3, 0.12, P.machineGreen, true);
  mug(-0.28, -0.12, P.utensil, true);

  // ---------- cutlery caddy ----------
  const cx = 0.28, cz = -0.12;
  put(box(0.12, 0.06, 0.07), P.trimDark, cx, tb + 0.03, cz);
  put(box(0.1, 0.004, 0.05), P.shadowInk, cx, tb + 0.061, cz);
  for (let i = 0; i < 4; i++) {
    const dx = -0.04 + i * 0.027;
    put(box(0.008, 0.07, 0.006), P.steel, cx + dx, tb + 0.09, cz + (i % 2 ? 0.012 : -0.012), {
      rotation: [(R() - 0.5) * 20, 0, (R() - 0.5) * 20],
    });
    put(box(0.016, 0.02, 0.006), P.steel, cx + dx, tb + 0.13, cz + (i % 2 ? 0.012 : -0.012));
  }

  // ---------- printouts ----------
  const px = -0.02, pz = 0.38;
  for (let i = 0; i < 4; i++) {
    put(box(0.2, 0.002, 0.28), "#f1eee4", px + (R() - 0.5) * 0.012, tb + 0.0015 + i * 0.0025, pz + (R() - 0.5) * 0.012, {
      rotation: [0, 8 + (R() - 0.5) * 8, 0],
    });
  }
  for (let i = 0; i < 6; i++) {
    put(box(0.14 - (i % 3) * 0.02, 0.001, 0.007), P.trimDark, px, tb + 0.0125, pz - 0.09 + i * 0.03, { rotation: [0, 8, 0] });
  }

  // ---------- dented cup on its side ----------
  put(cyl(0.035, 0.03, 0.08, 10), P.steel, -0.2, tb + 0.035, -0.38, { rotation: [0, 0, 90], aim: undefined, quat: undefined } as any);
  put(cyl(0.028, 0.028, 0.004, 10), P.shadowInk, -0.16, tb + 0.035, -0.38, { rotation: [0, 0, 90] });
  put(new THREE.SphereGeometry(0.014, 5, 4), P.greebleGrey, -0.215, tb + 0.045, -0.38);

  // ---------- stools ----------
  const stool = (x: number, z: number, h: number, tilt: number, rot: number) => {
    const top = DECK + h;
    const o = { rotation: [tilt, rot, 0] };
    put(cyl(0.17, 0.2, 0.04, 12), P.trimDark, x, DECK + 0.02, z);
    put(cyl(0.05, 0.07, h - 0.1, 8), P.trimDark, x, DECK + 0.04 + (h - 0.1) / 2, z);
    put(cyl(0.15, 0.15, 0.07, 14), P.hull, x, top - 0.035, z, o);
    put(cyl(0.135, 0.135, 0.03, 14), P.panelCream, x, top + 0.012, z, o);
    put(new THREE.TorusGeometry(0.15, 0.008, 4, 20), P.steel, x, top - 0.07, z, { rotation: [90, 0, 0] });
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      put(cyl(0.01, 0.01, 0.01, 6), P.steel, x + Math.cos(a) * 0.1, top + 0.03, z + Math.sin(a) * 0.1);
    }
  };
  stool(-0.62, 0.25, 0.46, 0, 0);
  stool(0.55, 0.52, 0.5, 0, 0);
  stool(0.12, 0.84 - 0.0, 0.44, 6, 25);
  // feet pads on the pushed stool
  put(cyl(0.2, 0.2, 0.004, 12), P.shadowInk, 0.12, DECK + 0.002, 0.84);
}
    return buildMessTable;
  })(),
  // ceiling
  (() => {
type Ctx = { b: any; J: any; P: Record<string, string>; M: Record<string, [number, number, number]> };

function buildCeiling({ b, J, P, M }: Ctx) {
  const R = rng(11);
  const STEEL = P.steel, DARK = P.trimDark, GREY = P.greebleGrey, HULL = P.hull;
  const SOFFIT = M.ceilingSoffit[1]; // 2.05 underside

  const box = (w: number, h: number, d: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, x: number, y: number, z: number, rot?: [number, number, number]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: [x, y, z], rotation: rot });

  // Soffit slab: underside 2.05, top 2.3
  box(2.4, 0.25, 4.8, HULL, 0, 2.175, 0);
  // Perimeter frame (trimDark) under the slab
  const fh = 0.06, fy = SOFFIT - fh / 2;
  box(2.4, fh, 0.12, DARK, 0, fy, -2.34);
  box(2.4, fh, 0.12, DARK, 0, fy, 2.34);
  box(0.12, fh, 4.8, DARK, -1.14, fy, 0);
  box(0.12, fh, 4.8, DARK, 1.14, fy, 0);
  // Edge beams on top, landing on walls
  box(0.14, 0.1, 4.8, DARK, -1.13, 2.27, 0);
  box(0.14, 0.1, 4.8, DARK, 1.13, 2.27, 0);
  box(2.4, 0.1, 0.14, DARK, 0, 2.27, -2.33);
  // Rivets along frame
  for (let i = 0; i < 20; i++) {
    const z = -2.2 + i * 0.23;
    for (const s of [-1, 1]) cyl(0.014, 0.014, 0.012, 6, STEEL, s * 1.14, SOFFIT - 0.066, z);
  }
  for (let i = 0; i < 9; i++) {
    const x = -1.0 + i * 0.25;
    cyl(0.014, 0.014, 0.012, 6, STEEL, x, SOFFIT - 0.066, 2.34);
    cyl(0.014, 0.014, 0.012, 6, STEEL, x, SOFFIT - 0.066, -2.34);
  }

  // Light tray, centred, recessed
  const LW = 0.56, LL = 2.6;
  box(LW + 0.1, 0.05, LL + 0.1, DARK, 0, SOFFIT - 0.025, 0);
  glow(box(LW, 0.02, LL, P.panelCreamLit, 0, SOFFIT - 0.045, 0), 1.2);
  // grille slats
  for (let i = 0; i < 14; i++) {
    const z = -1.2 + i * (2.4 / 13);
    box(LW, 0.014, 0.02, STEEL, 0, SOFFIT - 0.06, z);
  }
  for (const s of [-1, 1]) box(0.02, 0.014, LL, STEEL, s * 0.18, SOFFIT - 0.062, 0);
  // tray bolts
  for (const s of [-1, 1]) for (const z of [-1.4, -0.7, 0, 0.7, 1.4])
    cyl(0.016, 0.016, 0.014, 6, STEEL, s * 0.31, SOFFIT - 0.056, z);

  // Ducts
  const ductR = 0.17, ductY = 1.95 + ductR - 0.0; // hang to y=1.95 bottom at middle
  const ducts: number[] = [-0.78, 0.78];
  for (const dx of ducts) {
    const pts = [
      [dx, 2.02 + 0.14, -2.0],
      [dx, 2.0 + 0.1, -0.8],
      [dx, 1.95 + ductR - 0.02, 0.2],
      [dx, 2.0 + 0.1, 1.2],
      [dx, 2.02 + 0.14, 2.1],
    ];
    const path = (b as any).__p;
    void path;
    // sagging ducts built from segments
    const n = 9;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const z = -2.0 + 4.1 * t;
      const sag = Math.sin(Math.PI * t) * 0.05;
      const cy = 2.1 - sag * 0.5 - 0.0;
      const cyy = Math.min(cy, 1.95 + ductR);
      cyl(ductR, ductR, 4.1 / n + 0.005, 10, GREY, dx, cyy, z, [90, 0, 0]);
    }
    for (let i = 0; i < 17; i++) {
      const t = i / 16;
      const z = -2.0 + 4.1 * t;
      const sag = Math.sin(Math.PI * t) * 0.05;
      const cyy = Math.min(2.1 - sag * 0.5, 1.95 + ductR);
      cyl(ductR + 0.02, ductR + 0.02, 0.03, 10, STEEL, dx, cyy, z, [90, 0, 0]);
    }
    // hanger straps
    for (const z of [-1.4, 0, 1.4]) {
      box(0.04, 0.12, 0.05, DARK, dx, 2.1 + 0.14, z);
      box(0.4, 0.03, 0.05, DARK, dx, 2.2, z);
    }
  }

  // Plenum box at aft wall
  box(2.0, 0.34, 0.4, P.machineGreen, 0, 2.07 + 0.02, -2.17);
  box(2.04, 0.04, 0.44, DARK, 0, 2.25, -2.17);
  box(2.04, 0.04, 0.44, DARK, 0, 1.92 + 0.0 + 0.2, -2.17);
  for (const x of [-0.9, -0.45, 0.45, 0.9]) for (const y of [2.12, 2.04]) {
    cyl(0.012, 0.012, 0.012, 6, STEEL, x, y + 0.04, -1.965, [90, 0, 0]);
  }
  // copper pipe stubs
  for (const x of [-0.3, -0.1, 0.1, 0.3]) {
    cyl(0.03, 0.03, 0.3, 8, P.copper, x, 2.0 + 0.1, -1.9, [90, 0, 0]);
    cyl(0.04, 0.04, 0.04, 8, P.copper, x, 2.1, -1.74, [90, 0, 0]);
  }
  // red valve wheel
  cyl(0.012, 0.012, 0.1, 6, STEEL, 0.55, 2.0 + 0.06, -1.95, [90, 0, 0]);
  b.part(new THREE.TorusGeometry(0.065, 0.011, 6, 12), P.warningRed, { at: [0.55, 2.1, -1.9], rotation: [0, 0, 0] });
  for (let i = 0; i < 3; i++) box(0.12, 0.012, 0.012, P.warningRed, 0.55, 2.1, -1.9).rotation.z = (i * Math.PI) / 3;

  // Cable bundle on left side dropping
  const cx = -1.06;
  for (let i = 0; i < 5; i++) {
    const z = -0.3 + (i - 2) * 0.0;
    const off = (i - 2) * 0.032;
    b.rod([cx + 0.0, 2.05, 0.7 + off], [cx, 1.92, 0.7 + off], 0.017, P.rubber);
    b.rod([cx, 1.92, 0.7 + off], [-1.17, 1.7, 0.7 + off * 0.8], 0.017, P.rubber);
    void z;
  }
  for (let i = 0; i < 4; i++) {
    const z = 0.7 + (i - 1.5) * 0.0;
    void z;
  }
  for (const y of [1.995, 1.9]) {
    box(0.08, 0.025, 0.2, STEEL, cx - 0.01, y, 0.7);
  }
  box(0.12, 0.05, 0.22, STEEL, cx, 2.02, 0.7);

  // Chain hook above table
  let hy = SOFFIT - 0.07;
  cyl(0.06, 0.06, 0.02, 8, STEEL, 0, SOFFIT - 0.07, 0.05);
  for (let i = 0; i < 4; i++) {
    const g = new THREE.TorusGeometry(0.035, 0.009, 5, 8);
    b.part(g, STEEL, { at: [0, hy - 0.04 - i * 0.055, 0.05], rotation: [0, i % 2 ? 90 : 0, 0] });
  }
  const hookY = hy - 0.04 - 4 * 0.055;
  b.part(new THREE.TorusGeometry(0.05, 0.012, 5, 10, Math.PI * 1.4), STEEL, { at: [0, hookY - 0.04, 0.05], rotation: [0, 0, 200] });
  b.part(new THREE.ConeGeometry(0.014, 0.04, 5), STEEL, { at: [0.0, hookY - 0.0, 0.05] });

  // Beacon near entry
  cyl(0.09, 0.1, 0.03, 10, DARK, 0.0, SOFFIT - 0.015 - 0.06, 1.95);
  const dome = b.part(new THREE.SphereGeometry(0.075, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), P.amberLamp, {
    at: [0, SOFFIT - 0.09, 1.95], rotation: [180, 0, 0],
  });
  glow(dome, 1.6);
  box(0.02, 0.05, 0.05, P.hazard, 0, SOFFIT - 0.11, 1.95);
  for (let i = 0; i < 4; i++) cyl(0.012, 0.012, 0.012, 6, STEEL, Math.cos(i * 1.57) * 0.085, SOFFIT - 0.08, 1.95 + Math.sin(i * 1.57) * 0.085);

  // Speaker grille
  box(0.28, 0.03, 0.2, DARK, 0.85, SOFFIT - 0.015, 1.5);
  for (let i = 0; i < 6; i++) box(0.24, 0.012, 0.014, P.shadowInk, 0.85, SOFFIT - 0.034, 1.44 + i * 0.024);

  // Hazard marks and top-side seams
  for (let i = 0; i < 8; i++) box(0.12, 0.012, 0.05, i % 2 ? DARK : P.hazard, -0.7 + i * 0.2, SOFFIT - 0.066, 2.2);
  for (const z of [-1.2, 0, 1.2]) box(2.3, 0.012, 0.03, DARK, 0, 2.306, z);
  void R; void J; void frame;
}
    return buildCeiling;
  })(),
];

export default function build() {
  const b = createBuilder({ name: "nostromoGalley" });
  const J: Record<string, Joint> = {};
  for (const part of PARTS) part({ b, J, P, M });
  return b.root;
}
