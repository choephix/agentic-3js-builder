import * as THREE from "three";
import { createBuilder, type Builder, type Joint, rng, aim } from "../../../../src/index";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { glow } from "../../../../kits/glow";

export const meta = {
  "name": "Brutalist Housing Block",
  "description": "A raw board-marked concrete slab housing block with deep balconies, a stair and lift tower, pilotis, and a roof terrace with plant."
};

// The shared spec: palette, mounts (model-space points where parts meet) and skeleton.
const P = {
  concreteLight: "#b4b0a6",
  concreteMid: "#8f8c84",
  concreteDark: "#6c6a65",
  stain: "#55534e",
  boardMark: "#7c7a73",
  glass: "#1f2a33",
  glassLit: "#e8c46a",
  panelOchre: "#c58a2b",
  panelRust: "#a2482a",
  panelTeal: "#2f7f80",
  rail: "#3a3d40",
  ground: "#5d5f5a",
  moss: "#5f6b45",
  tank: "#7a8a8f",
};
const M = {
  pilotisTop: [0, 4, 0] as [number, number, number],
  slabFront: [0, 8, 3.5] as [number, number, number],
  slabBack: [0, 8, -3.5] as [number, number, number],
  roofDeck: [0, 16, 0] as [number, number, number],
  towerBase: [10.5, 0, -1] as [number, number, number],
  bridgeLevel1: [8.5, 7.5, 0] as [number, number, number],
  frontFacadePlane: [0, 4, 3.5] as [number, number, number],
  backFacadePlane: [0, 4, -4.5] as [number, number, number],
};
type Ctx = { b: Builder; J: Record<string, Joint>; P: typeof P; M: typeof M };

// One function per part, each written by its own call.
const PARTS: ((ctx: Ctx) => void)[] = [
  // pilotis
  (() => {
function buildPilotis({ b, P }: Ctx) {
  const r = rng(11);

  // ---------------------------------------------------------------- helpers
  // Many small static pieces are collected per (group, colour, glow) and added as one merged part each.
  type Bucket = { group: string; color: string; glowK: number; geos: THREE.BufferGeometry[] };
  const buckets = new Map<string, Bucket>();
  const push = (group: string, color: string, geo: THREE.BufferGeometry, glowK = 0) => {
    const key = `${group}|${color}|${glowK}`;
    let e = buckets.get(key);
    if (!e) buckets.set(key, (e = { group, color, glowK, geos: [] }));
    e.geos.push(geo);
  };

  /** Axis-aligned box from two corners. */
  const box = (
    group: string,
    color: string,
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    glowK = 0,
  ) => {
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    push(group, color, g, glowK);
  };

  /** Vertical tapered box: footprint w0 x d0 at y0 growing to w1 x d1 at y1. */
  const frust = (
    group: string,
    color: string,
    cx: number,
    cz: number,
    y0: number,
    y1: number,
    w0: number,
    d0: number,
    w1: number,
    d1: number,
  ) => {
    const g = new THREE.BoxGeometry(1, 1, 1);
    g.translate(0, 0.5, 0);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const t = pos.getY(i);
      const w = w0 + (w1 - w0) * t;
      const d = d0 + (d1 - d0) * t;
      pos.setXYZ(i, pos.getX(i) * w + cx, y0 + t * (y1 - y0), pos.getZ(i) * d + cz);
    }
    g.computeVertexNormals();
    push(group, color, g);
  };

  /** Vertical cylinder standing on y0. */
  const cyl = (
    group: string,
    color: string,
    cx: number,
    cz: number,
    y0: number,
    h: number,
    rTop: number,
    rBot: number,
    seg = 8,
    glowK = 0,
  ) => {
    const g = new THREE.CylinderGeometry(rTop, rBot, h, seg);
    g.translate(cx, y0 + h / 2, cz);
    push(group, color, g, glowK);
  };

  const CL = P.concreteLight;
  const CM = P.concreteMid;
  const CD = P.concreteDark;
  const STAIN = P.stain;
  const BOARD = P.boardMark;
  const GLASS = P.glass;
  const LIT = P.glassLit;
  const RAIL = P.rail;

  // ---------------------------------------------------------------- key dimensions
  const PLINTH_T = 0.15;
  const SOFFIT_Y0 = 3.55;
  const SOFFIT_Y1 = 4.0;
  const BEAM_Y0 = 3.2;
  const ZF = 3.2; // front column row
  const ZB = -3.6; // back column row
  const COLX = Array.from({ length: 9 }, (_, i) => -10.8 + 2.7 * i);

  // ---------------------------------------------------------------- plinth / podium
  box("plinth", P.ground, -12, 0, -4.75, 12, PLINTH_T, 4.75);
  // raised kerb round the edge
  box("kerb", CD, -12, PLINTH_T, 4.64, 12, PLINTH_T + 0.07, 4.75);
  box("kerb", CD, -12, PLINTH_T, -4.75, 12, PLINTH_T + 0.07, -4.64);
  box("kerb", CD, -12, PLINTH_T, -4.64, -11.89, PLINTH_T + 0.07, 4.64);
  box("kerb", CD, 11.89, PLINTH_T, -4.64, 12, PLINTH_T + 0.07, 4.64);
  // paving seams
  for (let k = 0; k < 8; k++) {
    const x = -9.45 + 2.7 * k;
    box("paving", BOARD, x - 0.015, PLINTH_T, -4.6, x + 0.015, PLINTH_T + 0.008, 4.6);
  }
  for (const z of [-1.7, 0.0, 1.7, 3.2 - 1.6 + 3.2 - 1.6 - 1.6]) {
    void z;
  }
  for (const z of [-2.2, 2.2]) box("paving", BOARD, -11.8, PLINTH_T, z - 0.015, 11.8, PLINTH_T + 0.008, z + 0.015);

  // ---------------------------------------------------------------- piloti columns
  const W0 = 0.55;
  const W1 = 0.88;
  const CY0 = PLINTH_T;
  const CY1 = SOFFIT_Y0;
  const colW = (y: number) => W0 + ((W1 - W0) * (y - CY0)) / (CY1 - CY0);

  const column = (cx: number, cz: number) => {
    frust("columns", CL, cx, cz, CY0, CY1, W0, W0, W1, W1);
    // board-mark bands wrapping all four faces
    for (let k = 0; k < 7; k++) {
      const yy = 0.75 + 0.4 * k;
      const w = colW(yy) + 0.035;
      frust("columnRibs", BOARD, cx, cz, yy - 0.013, yy + 0.013, w, w, w, w);
    }
    // dark stained foot and lip
    box("columnBase", STAIN, cx - 0.35, CY0, cz - 0.35, cx + 0.35, 0.55, cz + 0.35);
    box("columnBase", CD, cx - 0.32, 0.55, cz - 0.32, cx + 0.32, 0.62, cz + 0.32);
    // rain streaks down the front face
    for (const ox of [-0.16, 0.09]) {
      const len = 1.0 + r() * 0.9;
      const yTop = 3.3;
      const yBot = yTop - len;
      const ym = (yTop + yBot) / 2;
      const zf = cz + colW(ym) / 2;
      box("columnStains", STAIN, cx + ox - 0.025, yBot, zf - 0.02, cx + ox + 0.025, yTop, zf + 0.025);
    }
  };
  for (const x of COLX) {
    column(x, ZF);
    column(x, ZB);
  }

  // ---------------------------------------------------------------- soffit / transfer slab with beams
  box("soffit", CM, -11.97, SOFFIT_Y0, -4.72, 11.97, SOFFIT_Y1, 4.72);
  // transverse beams over each column line, longitudinal beams over each column row
  for (const x of COLX) box("beams", CD, x - 0.24, BEAM_Y0, -4.6, x + 0.24, SOFFIT_Y0, 4.6);
  for (const z of [ZF, ZB]) box("beams", CD, -11.9, BEAM_Y0, z - 0.27, 11.9, SOFFIT_Y0, z + 0.27);
  // secondary joists between transverse beams
  for (let k = 0; k < 8; k++) {
    const x = -9.45 + 2.7 * k;
    box("joists", CM, x - 0.11, 3.4, -4.55, x + 0.11, SOFFIT_Y0, 4.55);
  }
  // board-mark strips round the slab edge
  for (const y of [3.68, 3.8, 3.92]) {
    box("slabRibs", BOARD, -11.9, y, 4.7, 11.9, y + 0.03, 4.77);
    box("slabRibs", BOARD, -11.9, y, -4.77, 11.9, y + 0.03, -4.7);
    box("slabRibs", BOARD, 11.95, y, -4.6, 12.0, y + 0.03, 4.6);
    box("slabRibs", BOARD, -12.0, y, -4.6, -11.95, y + 0.03, 4.6);
  }
  // drip groove along the underside edge and weathering drips
  box("slabDrip", STAIN, -11.9, 3.58, 4.7, 11.9, 3.61, 4.77);
  box("slabDrip", STAIN, -11.9, 3.58, -4.77, 11.9, 3.61, -4.7);
  for (const x of COLX) {
    const len = 0.2 + r() * 0.2;
    box("slabDrip", STAIN, x - 0.03 + 0.4, 3.58 + 0.42 - len, 4.7, x + 0.03 + 0.4, 3.98, 4.77);
  }

  // ---------------------------------------------------------------- recessed glazed lobby
  const LZ = 1.5; // glazing plane
  // floor, back wall, side walls, head fascia
  box("lobby", CM, -4.5, PLINTH_T, -1.5, 4.5, 0.3, 1.5);
  box("lobbyWalls", CM, -4.5, 0.3, -1.5, 4.5, 3.2, -1.3);
  for (const s of [1, -1]) {
    const xa = s * 4.05;
    const xb = s * 4.5;
    box("lobbyWalls", CM, xa, 0.3, -1.5, xb, 3.2, 1.5);
    // board-mark ribs on the outer wall faces
    for (let k = 0; k < 9; k++) {
      const y = 0.5 + 0.3 * k;
      box("lobbyRibs", BOARD, xb - 0.02 + (s > 0 ? 0.02 : -0.02) - 0.0, y, -1.5, xb + (s > 0 ? 0.03 : -0.03), y + 0.03, 1.5);
    }
    // stains under the head
    for (const z of [-0.6, 0.5, 1.2]) {
      box("lobbyStains", STAIN, xb - 0.02, 1.4 + r() * 0.4, z - 0.03, xb + (s > 0 ? 0.03 : -0.03), 3.1, z + 0.03);
    }
  }
  box("lobbyHead", CL, -4.5, 3.0, 1.35, 4.5, 3.2, 1.68);
  box("lobbyHead", CD, -4.05, 0.3, 1.38, 4.05, 0.42, 1.62); // sill
  // glass and glazing bars
  box("glass", GLASS, -4.05, 0.42, LZ - 0.015, 4.05, 3.0, LZ + 0.015);
  const MULL = [-3.15, -2.25, -1.35, -0.45, 0.45, 1.35, 2.25, 3.15];
  for (const x of MULL) box("mullions", RAIL, x - 0.035, 0.42, 1.42, x + 0.035, 3.0, 1.58);
  box("mullions", RAIL, -4.05, 2.2, 1.45, 4.05, 2.25, 1.56);
  // entrance sign on the head
  box("sign", GLASS, -1.0, 3.03, 1.68, 1.0, 3.17, 1.7);
  const bars = [0.1, 0.18, 0.08, 0.22, 0.12, 0.16, 0.1, 0.2];
  let bx = -0.82;
  for (const w of bars) {
    box("signLit", LIT, bx, 3.08, 1.7, bx + w, 3.12, 1.71, 1.3);
    bx += w + 0.04;
  }
  // doors
  for (const dx of [-1.8, 1.8]) {
    box("doorFrames", RAIL, dx - 0.45, 0.42, 1.5, dx - 0.38, 2.5, 1.62);
    box("doorFrames", RAIL, dx + 0.38, 0.42, 1.5, dx + 0.45, 2.5, 1.62);
    box("doorFrames", RAIL, dx - 0.45, 2.45, 1.5, dx + 0.45, 2.55, 1.62);
    box("doorFrames", RAIL, dx - 0.01, 0.42, 1.52, dx + 0.01, 2.45, 1.6); // meeting stile
    box("doorSills", CD, dx - 0.5, 0.3, 1.4, dx + 0.5, 0.36, 1.78);
    for (const s of [-1, 1]) box("doorHandles", CL, dx + s * 0.08 - 0.012, 0.95, 1.6, dx + s * 0.08 + 0.012, 1.4, 1.65);
    box("doorLit", LIT, dx - 0.37, 2.6, 1.515, dx + 0.37, 2.95, 1.53, 1.3);
  }
  // glowing panes: clerestory in every window bay, lower panes in a few
  const BAYS = [-3.6, -2.7, -0.9, 0, 0.9, 2.7, 3.6];
  for (const c of BAYS) {
    box("lobbyLit", LIT, c - 0.4, 2.3, 1.515, c + 0.4, 2.95, 1.53, 1.3);
    if (r() > 0.4) box("lobbyLit", LIT, c - 0.38, 0.55, 1.515, c + 0.38, 2.1, 1.53, 1.0);
  }

  // ---------------------------------------------------------------- steps
  box("steps", CL, -2.95, PLINTH_T, 1.5, 2.95, 0.25, 2.15);
  box("steps", CM, -2.95, PLINTH_T, 2.15, 2.95, 0.2, 2.8);
  box("stepNosing", BOARD, -2.95, 0.25, 2.13, 2.95, 0.265, 2.17);
  box("stepNosing", BOARD, -2.95, 0.2, 2.78, 2.95, 0.215, 2.82);
  // cheek walls
  for (const s of [-1, 1]) box("steps", CD, s * 2.95 - 0.07 + (s > 0 ? 0.07 : -0.07), PLINTH_T, 1.5, s * 2.95 + (s > 0 ? 0.14 : -0.14), 0.4, 2.8);

  // ---------------------------------------------------------------- cantilever entrance canopy
  box("canopy", CL, -4.0, 2.97, 1.5, 4.0, 3.2, 4.3);
  box("canopy", CM, -4.0, 2.85, 4.25, 4.0, 3.35, 4.38); // deep fascia
  box("canopyRibs", BOARD, -4.0, 3.02, 4.36, 4.0, 3.05, 4.4);
  box("canopyRibs", BOARD, -4.0, 3.16, 4.36, 4.0, 3.19, 4.4);
  box("canopyRibs", BOARD, -4.0, 3.3, 4.36, 4.0, 3.33, 4.4);
  for (const x of [-3.2, -1.1, 0.9, 3.0]) box("canopyStains", STAIN, x - 0.03, 2.9, 4.36, x + 0.03, 3.3, 4.4);
  for (const x of [-3.8, -2.0, 2.0, 3.8]) box("hangers", RAIL, x - 0.02, 3.35, 4.29, x + 0.02, SOFFIT_Y0, 4.33);
  for (const x of [-1.8, 1.8]) for (const z of [2.6, 3.8]) box("canopyLights", LIT, x - 0.25, 2.955, z - 0.2, x + 0.25, 2.975, z + 0.2, 1.4);

  // ---------------------------------------------------------------- planters and bollards
  for (const x of [-7, 7]) {
    box("planters", CL, x - 0.85, PLINTH_T, 3.9, x + 0.85, 0.65, 4.5);
    box("planters", CD, x - 0.9, 0.6, 3.85, x + 0.9, 0.68, 4.55);
    box("moss", P.moss, x - 0.78, 0.66, 3.97, x + 0.78, 0.72, 4.43);
    for (let k = 0; k < 4; k++) {
      const sx = x - 0.55 + k * 0.37;
      const h = 0.18 + r() * 0.2;
      box("moss", P.moss, sx - 0.12, 0.72, 4.05 + (k % 2) * 0.12, sx + 0.12, 0.72 + h, 4.25 + (k % 2) * 0.12);
    }
  }
  for (const x of [-3.7, 3.7, -5.0, 5.0]) {
    cyl("bollards", CM, x, 4.1, PLINTH_T, 0.7, 0.1, 0.12);
    cyl("bollardCaps", CD, x, 4.1, PLINTH_T + 0.7, 0.04, 0.12, 0.12);
    cyl("bollardLit", LIT, x, 4.1, PLINTH_T + 0.55, 0.08, 0.105, 0.105, 8, 1.4);
  }

  // ---------------------------------------------------------------- flush merged buckets into parts
  for (const e of buckets.values()) {
    const merged = mergeGeometries(e.geos, false);
    if (!merged) continue;
    const part = b.part(merged, e.color, { at: [0, 0, 0], flat: true, name: `pilotis.${e.group}` });
    if (e.glowK) glow(part, e.glowK);
  }
}
    return buildPilotis;
  })(),
  // frontFacade
  (() => {
function buildFrontFacade({ b, J, P, M }: Ctx) {
  const R = rng(11);

  // ---------- helpers ----------
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: string) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z] });

  // Small pieces of one colour are merged into a single part.
  const merged = (color: string) => {
    const geos: THREE.BufferGeometry[] = [];
    return {
      add(w: number, h: number, d: number, x: number, y: number, z: number) {
        const g = new THREE.BoxGeometry(w, h, d);
        g.translate(x, y, z);
        geos.push(g);
      },
      flush() {
        if (geos.length) b.part(mergeGeometries(geos), color, { at: [0, 0, 0] });
      },
    };
  };

  const ribs = merged(P.boardMark);
  const stains = merged(P.stain);
  const grooves = merged(P.concreteDark);
  const handles = merged(P.rail);
  const moss = merged(P.moss);

  // ---------- layout constants ----------
  const X0 = -12;
  const BAY = 4;
  const BAYS = 6;
  const FLOORS = 4;
  const FH = 3;
  const BASE = 4;
  const WALL_Z = 3.0; // face of the core wall
  const FRONT_Z = 4.75; // projecting front of the egg-crate
  const DEPTH = FRONT_Z - WALL_Z;
  const SLAB_T = 0.3;
  const bayX = (k: number) => X0 + BAY / 2 + k * BAY;

  // ---------- main core box ----------
  box(24, 12, WALL_Z - -4.5, 0, 10, (WALL_Z + -4.5) / 2, P.concreteMid);

  // ---------- floor slabs of the egg-crate (continuous) ----------
  const slabYs: number[] = [];
  for (let f = 0; f < FLOORS; f++) slabYs.push(BASE + f * FH);
  for (const y of slabYs) {
    box(24, SLAB_T, DEPTH, 0, y + SLAB_T / 2, WALL_Z + DEPTH / 2, P.concreteLight);
    ribs.add(24, 0.02, 0.03, 0, y + 0.1, FRONT_Z - 0.015);
    ribs.add(24, 0.02, 0.03, 0, y + 0.2, FRONT_Z - 0.015);
    grooves.add(24, 0.02, 0.1, 0, y, FRONT_Z - 0.2);
  }
  // roof slab
  box(24, SLAB_T, DEPTH, 0, 16 - SLAB_T / 2, WALL_Z + DEPTH / 2, P.concreteLight);
  ribs.add(24, 0.02, 0.03, 0, 15.8, FRONT_Z - 0.015);
  ribs.add(24, 0.02, 0.03, 0, 15.9, FRONT_Z - 0.015);
  grooves.add(24, 0.02, 0.1, 0, 15.7, FRONT_Z - 0.2);

  // ---------- party walls between bays ----------
  for (let f = 0; f < FLOORS; f++) {
    const lo = BASE + f * FH + SLAB_T;
    const hi = f < FLOORS - 1 ? BASE + (f + 1) * FH : 15.7;
    for (let i = 0; i <= BAYS; i++) {
      let x = X0 + i * BAY;
      if (i === 0) x += 0.175;
      if (i === BAYS) x -= 0.175;
      box(0.35, hi - lo, DEPTH, x, (lo + hi) / 2, WALL_Z + DEPTH / 2, i % 2 ? P.concreteLight : P.concreteLight);
    }
  }

  // ---------- infill panel and lit-window selections ----------
  const panel: Record<string, string> = {
    "0,1": P.panelOchre,
    "0,4": P.panelTeal,
    "1,3": P.panelRust,
    "2,0": P.panelTeal,
    "2,5": P.panelOchre,
    "3,2": P.panelRust,
    "3,4": P.panelOchre,
  };
  const lit = new Set(["0,3", "1,0", "1,4", "2,2", "3,1", "3,5", "2,5", "0,5"]);

  // ---------- bays ----------
  for (let f = 0; f < FLOORS; f++) {
    const lo = BASE + f * FH + SLAB_T;
    for (let k = 0; k < BAYS; k++) {
      const cx = bayX(k);
      const key = `${f},${k}`;

      // parapet with coping and board marks
      const par = (f + k) % 2 ? P.concreteMid : P.concreteLight;
      box(3.65, 1.0, 0.19, cx, lo + 0.5, FRONT_Z - 0.1 - 0.025 - 0.02 + 0.025, par);
      box(3.78, 0.08, 0.34, cx, lo + 1.04, FRONT_Z - 0.17, P.concreteLight);
      ribs.add(3.65, 0.025, 0.03, cx, lo + 0.35, FRONT_Z - 0.035);
      ribs.add(3.65, 0.025, 0.03, cx, lo + 0.7, FRONT_Z - 0.035);

      // window on the wall, shifted side by side for rhythm
      const s = (k + f) % 2 ? 1 : -1;
      const wx = cx + s * 0.45;
      box(2.7, 0.07, 0.2, wx, lo + 0.465, WALL_Z + 0.1, P.concreteLight); // sill
      box(2.5, 1.6, 0.1, wx, lo + 1.3, WALL_Z + 0.05, P.rail); // frame
      const isLit = lit.has(key);
      for (const d of [-1, 1]) {
        const pane = box(1.1, 1.4, 0.04, wx + d * 0.6, lo + 1.3, WALL_Z + 0.115, isLit && d === 1 ? P.glassLit : P.glass);
        if (isLit && d === 1) glow(pane, 0.9);
      }
      // board marks above window
      ribs.add(3.65, 0.022, 0.012, cx, lo + 2.2, WALL_Z + 0.006);
      ribs.add(3.65, 0.022, 0.012, cx, lo + 2.3, WALL_Z + 0.006);

      // panel / door beside window
      const px = cx - s * 1.31;
      if (panel[key]) {
        box(0.95, 2.2, 0.07, px, lo + 1.25, WALL_Z + 0.035, panel[key]);
        grooves.add(1.0, 0.03, 0.08, px, lo + 0.12, WALL_Z + 0.04);
      } else {
        box(0.85, 2.1, 0.06, px, lo + 1.05, WALL_Z + 0.03, P.concreteDark);
        handles.add(0.04, 0.22, 0.05, px + s * 0.28, lo + 1.0, WALL_Z + 0.08);
      }

      // wall rain streak under the sill
      if (R() < 0.35) {
        const h = 0.2 + R() * 0.2;
        stains.add(0.1 + R() * 0.08, h, 0.04, wx + (R() < 0.5 ? -1 : 1) * 1.1, lo + 0.43 - h / 2, WALL_Z + 0.02);
      }
    }
  }

  // ---------- rain streaks dripping from copings over parapet faces ----------
  for (let n = 0; n < 16; n++) {
    const f = Math.floor(R() * FLOORS);
    const k = Math.floor(R() * BAYS);
    const lo = BASE + f * FH + SLAB_T;
    const h = 0.3 + R() * 0.55;
    const x = bayX(k) + (R() - 0.5) * 3.0;
    stains.add(0.08 + R() * 0.12, h, 0.03, x, lo + 1.0 - h / 2, FRONT_Z - 0.015 - 0.005);
  }

  // ---------- moss on a few copings ----------
  for (const [f, k] of [
    [3, 1],
    [3, 3],
    [3, 4],
    [1, 2],
    [2, 0],
  ]) {
    const lo = BASE + f * FH + SLAB_T;
    moss.add(0.7 + R() * 0.5, 0.05, 0.22, bayX(k) + (R() - 0.5) * 1.4, lo + 1.105, FRONT_Z - 0.17);
  }

  // ---------- downpipes on party walls ----------
  for (const x of [-4, 4]) {
    b.part(new THREE.CylinderGeometry(0.05, 0.05, 11.4, 8), P.rail, { at: [x, 10, FRONT_Z - 0.05] });
    for (let f = 0; f < FLOORS; f++)
      handles.add(0.14, 0.05, 0.14, x, BASE + f * FH + 1.5, FRONT_Z - 0.05);
  }

  ribs.flush();
  stains.flush();
  grooves.flush();
  handles.flush();
  moss.flush();
}
    return buildFrontFacade;
  })(),
  // backAndEnds
  (() => {
function buildBackAndEnds({ b, P }: Ctx) {
  const r = rng(11);
  const buckets = new Map<string, THREE.BufferGeometry[]>();
  let tris = 0;
  const TRI_CAP = 11600;

  // Box in model space from two corners, optionally rolled about Z, collected per colour and merged at the end.
  const box = (
    c: string,
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    rz = 0,
  ) => {
    const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0));
    if (rz) g.rotateZ((rz * Math.PI) / 180);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    let list = buckets.get(c);
    if (!list) buckets.set(c, (list = []));
    list.push(g);
    tris += 12;
  };
  // Optional fine detail: skipped when the triangle budget is nearly used.
  const rib = (c: string, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    if (tris + 12 <= TRI_CAP) box(c, x0, y0, z0, x1, y1, z1);
  };
  // A named single part for the big structural masses.
  const solid = (
    name: string, c: string,
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
  ) => {
    b.part(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), c, {
      at: [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2],
      name,
    });
    tris += 12;
  };
  const pipe = (c: string, x: number, z: number, y0: number, y1: number, rad: number) => {
    const g = new THREE.CylinderGeometry(rad, rad, y1 - y0, 8);
    g.translate(x, (y0 + y1) / 2, z);
    let list = buckets.get(c);
    if (!list) buckets.set(c, (list = []));
    list.push(g);
    tris += 28;
  };

  const FLOORS = [4, 7, 10, 13];
  const CX0 = -5.7;
  const CX1 = -3.3;
  const inCore = (a: number, c: number) => c > CX0 - 0.05 && a < CX1 + 0.05;
  const WALL = -4.5;
  const OUT = -5.5;
  const DOORS = [P.rail, P.panelOchre, P.rail, P.panelRust, P.rail, P.panelTeal, P.rail, P.rail];

  // ---------- Rear access decks, floor by floor ----------
  FLOORS.forEach((yF, f) => {
    const y0 = yF + 0.3; // deck top
    const wt = f === 3 ? 15.8 : yF + 3; // underside of the next deck or the canopy

    solid(`backAndEnds.deck${f}`, P.concreteLight, -12, yF, OUT, 12, y0, WALL);
    if (f > 0) box(P.concreteMid, -12, yF - 0.35, OUT, 12, yF, OUT + 0.2); // downstand fascia beam
    solid(`backAndEnds.wall${f}`, P.concreteMid, -12, y0, -4.56, 12, wt, WALL);

    // Parapet in two runs either side of the stair core, with coping and steel rails
    for (const [a, c] of [[-12, CX0], [CX1, 12]] as const) {
      solid(`backAndEnds.parapet${f}_${a}`, P.concreteMid, a, y0, -5.46, c, yF + 0.8, -5.3);
      box(P.concreteLight, a, yF + 0.8, OUT, c, yF + 0.86, -5.26);
      box(P.rail, a, yF + 1.36, -5.41, c, yF + 1.41, -5.35);
      box(P.rail, a, yF + 1.12, -5.41, c, yF + 1.16, -5.35);
    }
    for (let x = -11.9; x <= 11.95; x += 1.5) {
      if (x > CX0 - 0.1 && x < CX1 + 0.1) continue;
      box(P.rail, x - 0.025, yF + 0.86, -5.405, x + 0.025, yF + 1.4, -5.355);
    }
    // coping drips
    for (let x = -11 + r() * 0.8; x < 12; x += 3) {
      if (x > CX0 - 0.2 && x < CX1 + 0.2) continue;
      const len = 0.2 + r() * 0.3;
      box(P.stain, x - 0.04, yF + 0.8 - len, -5.475, x + 0.04, yF + 0.8, -5.46);
    }

    // Pilaster fins on the wall at every unit boundary
    for (let k = 0; k <= 8; k++) {
      const x = -12 + 3 * k;
      const xc = k === 0 ? -11.85 : k === 8 ? 11.85 : x;
      if (inCore(xc - 0.15, xc + 0.15)) continue;
      box(P.concreteLight, xc - 0.15, y0, -4.65, xc + 0.15, wt, -4.56);
    }

    // Dwellings
    for (let u = 0; u < 8; u++) {
      const cx = -10.5 + 3 * u;
      if (inCore(cx - 1.35, cx + 1.35)) continue;
      const dx = cx - 0.6;
      const wx = cx + 0.7;

      // door: surround, dark reveal, coloured leaf, glass slot, lamp
      box(P.concreteLight, dx - 0.575, y0 + 2.05, -4.66, dx + 0.575, y0 + 2.2, -4.56);
      box(P.concreteLight, dx - 0.575, y0, -4.66, dx - 0.475, y0 + 2.05, -4.56);
      box(P.concreteLight, dx + 0.475, y0, -4.66, dx + 0.575, y0 + 2.05, -4.56);
      box(P.glass, dx - 0.475, y0, -4.6, dx + 0.475, y0 + 2.05, -4.56);
      const dc = DOORS[(u + f * 3) % DOORS.length];
      box(dc, dx - 0.43, y0, -4.63, dx + 0.43, y0 + 2.0, -4.6);
      if (r() < 0.65) box(r() < 0.35 ? P.glassLit : P.glass, dx + 0.14, y0 + 1.25, -4.645, dx + 0.3, y0 + 1.8, -4.63);
      box(P.concreteLight, dx - 0.36, y0 + 1.0, -4.655, dx - 0.3, y0 + 1.1, -4.63); // handle plate
      box(r() < 0.7 ? P.glassLit : P.concreteDark, dx - 0.1, y0 + 2.3, -4.62, dx + 0.1, y0 + 2.4, -4.56);

      // kitchen window
      box(P.concreteLight, wx - 0.58, y0 + 0.92, -4.64, wx + 0.58, y0 + 1.88, -4.56);
      box(r() < 0.28 ? P.glassLit : P.glass, wx - 0.5, y0 + 1.0, -4.645, wx + 0.5, y0 + 1.8, -4.6);
      box(P.rail, wx - 0.015, y0 + 1.0, -4.652, wx + 0.015, y0 + 1.8, -4.645);
      box(P.concreteLight, wx - 0.65, y0 + 0.86, -4.7, wx + 0.65, y0 + 0.92, -4.56); // sill
      // rain stains under the sill
      box(P.stain, wx - 0.55, y0 + 0.86 - (0.4 + r() * 0.35), -4.585, wx - 0.47, y0 + 0.86, -4.56);
      box(P.stain, wx + 0.3 + r() * 0.15, y0 + 0.86 - (0.3 + r() * 0.3), -4.585, wx + 0.38 + r() * 0.15, y0 + 0.86, -4.56);

      // number plaque with two digit marks
      box(P.concreteLight, cx - 0.03, y0 + 1.5, -4.6, cx + 0.13, y0 + 1.64, -4.56);
      box(P.stain, cx + 0.0, y0 + 1.52, -4.61, cx + 0.02, y0 + 1.62, -4.6);
      box(P.stain, cx + 0.06, y0 + 1.52, -4.61, cx + 0.1, y0 + 1.62, -4.6);
    }
  });

  // Canopy slab over the top deck
  solid("backAndEnds.canopy", P.concreteLight, -12, 15.8, OUT, 12, 16, WALL);
  box(P.concreteDark, -12, 15.72, OUT, 12, 15.8, OUT + 0.06); // shadow line under the canopy edge

  // ---------- Stair core with slit windows ----------
  solid("backAndEnds.stairCore", P.concreteDark, CX0, 4, OUT, CX1, 15.8, WALL);
  FLOORS.forEach((yF, f) => {
    [-5.0, -4.0].forEach((x, i) => {
      box(P.concreteMid, x - 0.2, yF + 0.4, -5.51, x + 0.2, yF + 2.8, -5.5);
      box(r() < 0.5 ? P.glassLit : P.glass, x - 0.125, yF + 0.5, -5.52, x + 0.125, yF + 2.7, -5.5);
      // stair flights seen as dark slanted slabs in the slit
      const sgn = (i + f) % 2 ? 1 : -1;
      box(P.rail, x - 0.22, yF + 0.95, -5.53, x + 0.22, yF + 1.0, -5.52, 38 * sgn);
      box(P.rail, x - 0.22, yF + 1.95, -5.53, x + 0.22, yF + 2.0, -5.52, 38 * sgn);
      box(P.rail, x - 0.125, yF + 1.45, -5.53, x + 0.125, yF + 1.5, -5.52);
    });
    // access landing lamp on the core
    box(P.glassLit, -4.6, yF + 2.85, -5.56 > OUT ? -5.56 : OUT, -4.4, yF + 2.95, OUT + 0.0);
  });

  // ---------- Down pipes ----------
  for (const px of [3, -9]) {
    pipe(P.rail, px, -4.72, 4.3, 15.7, 0.055);
    for (let y = 4.9; y < 15.5; y += 2.2) box(P.rail, px - 0.07, y, -4.68, px + 0.07, y + 0.05, -4.56);
  }

  // ---------- Gable ends ----------
  for (const s of [1, -1]) {
    const x0 = s * 12;
    const lo = Math.min(x0, x0 + s * 0.06);
    const hi = Math.max(x0, x0 + s * 0.06);
    solid(`backAndEnds.gable${s > 0 ? "L" : "R"}`, P.concreteMid, lo, 4, -4.5, hi, 16, 4.75);
    // floor bands
    for (const y of [7, 10, 13]) {
      box(P.concreteLight, Math.min(x0, x0 + s * 0.15), y - 0.1, -4.5, Math.max(x0, x0 + s * 0.15), y + 0.1, 4.75);
      for (const zz of [-3.9 + r() * 2.2, 0.9 + r() * 3]) {
        const len = 0.5 + r() * 0.7;
        box(P.stain, Math.min(x0 + s * 0.06, x0 + s * 0.16), y - 0.1 - len, zz - 0.05,
          Math.max(x0 + s * 0.06, x0 + s * 0.16), y - 0.1, zz + 0.05);
      }
    }
    // narrow vertical window slots
    for (const z of [-3.8, -2, -0.2, 1.6, 3.4]) {
      if (s > 0 && z > -3.4 && z < 1.4) continue; // hidden by the stair tower
      FLOORS.forEach((yF, f) => {
        const ya = yF + 0.7;
        const yb = yF + 2.3;
        const a = x0 + s * 0.06;
        box(P.concreteLight, Math.min(a, a + s * 0.08), ya - 0.1, z - 0.27, Math.max(a, a + s * 0.08), yb + 0.1, z + 0.27);
        box((z * 7 + f * 3) % 5 < 1 ? P.glassLit : P.glass,
          Math.min(a + s * 0.08, a + s * 0.1), ya, z - 0.14, Math.max(a + s * 0.08, a + s * 0.1), yb, z + 0.14);
        if ((f + Math.round(z * 3)) % 2 === 0) {
          const len = 0.5 + r() * 0.6;
          box(P.stain, Math.min(a, a + s * 0.07), ya - 0.1 - len, z + 0.14,
            Math.max(a, a + s * 0.07), ya - 0.1, z + 0.22);
        }
      });
    }
  }

  // ---------- Board-marked ribs (added last, guarded by the triangle budget) ----------
  FLOORS.forEach((yF, f) => {
    const y0 = yF + 0.3;
    const wt = f === 3 ? 15.8 : yF + 3;
    for (let y = y0 + 0.2; y < wt - 0.1; y += 0.3) rib(P.boardMark, -12, y, -4.575, 12, y + 0.025, -4.56);
    // ribs on the deck fascia
    rib(P.boardMark, -12, yF + 0.12, -5.5 - 0.0, CX0, yF + 0.145, -5.49);
  });
  for (let y = 4.2; y < 15.7; y += 0.5) {
    for (const [a, c] of [[-5.68, -5.15], [-4.85, -4.15], [-3.85, -3.32]] as const)
      rib(P.boardMark, a, y, -5.512, c, y + 0.03, -5.5);
  }
  for (const s of [1, -1]) {
    for (let y = 4.25; y < 15.8; y += 0.4) {
      const a = s * 12 + s * 0.06;
      rib(P.boardMark, Math.min(a, a + s * 0.015), y, -4.45, Math.max(a, a + s * 0.015), y + 0.03, 4.7);
    }
  }

  // ---------- Flush merged detail parts ----------
  for (const [c, list] of buckets) {
    const merged = mergeGeometries(list);
    if (!merged) continue;
    const part = b.part(merged, c, { at: [0, 0, 0], name: `backAndEnds.detail${c.replace("#", "")}` });
    if (c === P.glassLit) glow(part, 0.9);
  }
}
    return buildBackAndEnds;
  })(),
  // stairTower
  (() => {
type Face = { axis: "x" | "z"; plane: number; sign: 1 | -1; lo: number; hi: number; rot: number };

function buildStairTower({ b, P, M }: Ctx) {
  const rand = rng(1709);

  // ---- tower constants (meters, model space) ----
  const CX = 10.75; // tower centre x
  const CZ = M.towerBase[2]; // tower centre z
  const SX0 = 9.2;
  const SX1 = 12.3;
  const SZ0 = -2.8;
  const SZ1 = 0.8;
  const SHAFT_BOT = 0.3;
  const SHAFT_TOP = 16.0;

  const C = {
    dark: P.concreteDark,
    mid: P.concreteMid,
    light: P.concreteLight,
    stain: P.stain,
    board: P.boardMark,
    glass: P.glass,
    lit: P.glassLit,
    ochre: P.panelOchre,
    rust: P.panelRust,
    teal: P.panelTeal,
    rail: P.rail,
    moss: P.moss,
  };

  // ---- geometry buckets: many small pieces merged into one part per name + colour ----
  const buckets = new Map<string, { color: string; geos: THREE.BufferGeometry[] }>();
  const add = (name: string, color: string, geo: THREE.BufferGeometry) => {
    let k = buckets.get(name);
    if (!k) {
      k = { color, geos: [] };
      buckets.set(name, k);
    }
    k.geos.push(geo);
  };
  const box = (name: string, color: string, sx: number, sy: number, sz: number, cx: number, cy: number, cz: number) =>
    add(name, color, new THREE.BoxGeometry(sx, sy, sz).translate(cx, cy, cz));

  // A box with a flared top: bottom w0 x d0, top w1 x d1 (chamfers, corbels).
  const frustum = (w0: number, d0: number, w1: number, d1: number, h: number) => {
    const g = new THREE.BoxGeometry(w0, h, d0);
    const p = g.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      if (p.getY(i) > 0) {
        p.setX(i, (p.getX(i) * w1) / w0);
        p.setZ(i, (p.getZ(i) * d1) / d0);
      }
    }
    g.computeVertexNormals();
    return g;
  };

  // ---- the four shaft faces ----
  const FACES: Record<string, Face> = {
    front: { axis: "z", plane: SZ1, sign: 1, lo: SX0, hi: SX1, rot: 0 },
    back: { axis: "z", plane: SZ0, sign: -1, lo: SX0, hi: SX1, rot: Math.PI },
    end: { axis: "x", plane: SX1, sign: 1, lo: SZ0, hi: SZ1, rot: Math.PI / 2 },
    inner: { axis: "x", plane: SX0, sign: -1, lo: SZ0, hi: SZ1, rot: -Math.PI / 2 },
  };
  const CAPFACES: Record<string, Face> = {
    front: { axis: "z", plane: 1.0, sign: 1, lo: 9.0, hi: 12.5, rot: 0 },
    back: { axis: "z", plane: -3.0, sign: -1, lo: 9.0, hi: 12.5, rot: Math.PI },
    end: { axis: "x", plane: 12.5, sign: 1, lo: -3.0, hi: 1.0, rot: Math.PI / 2 },
    inner: { axis: "x", plane: 9.0, sign: -1, lo: -3.0, hi: 1.0, rot: -Math.PI / 2 },
  };

  // Box seated on a face: u along the face, y up, d = centre offset out of the face.
  const faceBox = (
    name: string,
    color: string,
    f: Face,
    u: number,
    y: number,
    d: number,
    wu: number,
    h: number,
    depth: number,
    ang = 0,
  ) => {
    const c = f.plane + f.sign * d;
    const g = f.axis === "z" ? new THREE.BoxGeometry(wu, h, depth) : new THREE.BoxGeometry(depth, h, wu);
    if (ang) {
      if (f.axis === "z") g.rotateZ(ang);
      else g.rotateX(ang);
    }
    if (f.axis === "z") g.translate(u, y, c);
    else g.translate(c, y, u);
    add(name, color, g);
  };

  // Thin plane lying on a face (board marks, tie holes).
  const facePlane = (name: string, color: string, f: Face, u: number, y: number, d: number, w: number, h: number) => {
    const g = new THREE.PlaneGeometry(w, h);
    g.rotateY(f.rot);
    const c = f.plane + f.sign * d;
    if (f.axis === "z") g.translate(u, y, c);
    else g.translate(c, y, u);
    add(name, color, g);
  };

  // Board-marked shuttering: staggered horizontal rib segments.
  const ribs = (f: Face, ys: number[]) => {
    for (const y of ys) {
      let u = f.lo - rand() * 1.1;
      while (u < f.hi) {
        const len = 0.9 + rand() * 1.0;
        const a = Math.max(u, f.lo + 0.02);
        const e = Math.min(u + len - 0.05, f.hi - 0.02);
        if (e - a > 0.15) facePlane("boardMarks", C.board, f, (a + e) / 2, y, 0.012, e - a, 0.035);
        u += len;
      }
    }
  };

  // Formwork tie holes on a staggered grid.
  const tieHoles = (f: Face, y0: number, y1: number) => {
    let row = 0;
    for (let y = y0; y < y1; y += 1.0, row++) {
      for (let i = 0; i < 4; i++) {
        const u = f.lo + 0.4 + (i + (row % 2 ? 0.5 : 0)) * 0.75;
        if (u < f.hi - 0.15) facePlane("tieHoles", C.stain, f, u, y, 0.026, 0.045, 0.045);
      }
    }
  };

  // ---- levels ----
  const decks = [-1, 0, 1, 2].map((k) => M.bridgeLevel1[1] + 3 * k); // 4.5, 7.5, 10.5, 13.5
  const BX0 = M.bridgeLevel1[0];
  const BCZ = -0.2;

  // ---- plinth, flare, shaft ----
  box("plinth", C.mid, 3.5, 0.35, 4, CX, 0.175, CZ);
  box("shaft", C.dark, SX1 - SX0, SHAFT_TOP - SHAFT_BOT, SZ1 - SZ0, CX, (SHAFT_TOP + SHAFT_BOT) / 2, CZ);
  // stained grimy base
  box("baseGrime", C.stain, SX1 - SX0 + 0.04, 0.55, SZ1 - SZ0 + 0.04, CX, 0.575, CZ);

  // corner pilasters
  for (const x of [SX0, SX1])
    for (const z of [SZ0, SZ1]) box("pilasters", C.mid, 0.3, 15.35, 0.3, x, 8.025, z);

  // floor bands at every bridge deck
  for (const y of decks) box("bands", C.mid, SX1 - SX0 + 0.16, 0.35, SZ1 - SZ0 + 0.16, CX, y - 0.175, CZ);

  // board marks + tie holes
  for (const k of Object.keys(FACES)) {
    ribs(FACES[k], Array.from({ length: 29 }, (_, i) => 1.0 + i * 0.5));
    tieHoles(FACES[k], 1.45, 15.4);
  }

  // moss on the plinth ledge
  const mossSpots: [string, number][] = [
    ["front", 9.4],
    ["front", 9.85],
    ["front", 11.8],
    ["front", 12.1],
    ["back", 9.5],
    ["back", 10.7],
    ["back", 11.9],
    ["end", -2.5],
    ["end", -1.0],
    ["end", 0.3],
  ];
  for (const [fk, u] of mossSpots) {
    const f = FACES[fk];
    faceBox("moss", C.moss, f, u, 0.36, 0.1, 0.25 + rand() * 0.3, 0.025, 0.12 + rand() * 0.04);
  }

  // ---- buttress fins at the base ----
  const finOutline: [number, number][] = [
    [-0.05, 0],
    [0.2, 0],
    [-0.05, 1.8],
  ];
  for (const x of [9.55, 11.95]) {
    b.extrude(finOutline, { at: [x, 0.35, SZ1], x: [0, 0, 1], thickness: 0.4, color: C.mid, name: "finFront" });
    b.extrude(finOutline, { at: [x, 0.35, SZ0], x: [0, 0, -1], thickness: 0.4, color: C.mid, name: "finBack" });
  }
  b.extrude(
    [
      [-0.05, 0],
      [0.18, 0],
      [-0.05, 1.4],
    ],
    { at: [SX1, 0.35, -1.25], x: [1, 0, 0], thickness: 0.5, color: C.mid, name: "finEnd" },
  );

  // ---- slit windows ----
  const levels: [number, number][] = [[1.55, 3.95]];
  decks.forEach((y, i) => levels.push([y + 0.4, i === 3 ? 15.55 : y + 2.55]));

  const slit = (f: Face, u: number, y0: number, y1: number, w: number) => {
    const h = y1 - y0;
    const yc = (y0 + y1) / 2;
    const fr = 0.1;
    const lit = rand() < 0.35;
    // surround
    faceBox("slitFrames", C.mid, f, u - w / 2 - fr / 2, yc, 0.05, fr, h + 2 * fr, 0.1);
    faceBox("slitFrames", C.mid, f, u + w / 2 + fr / 2, yc, 0.05, fr, h + 2 * fr, 0.1);
    faceBox("slitFrames", C.mid, f, u, y1 + fr / 2, 0.05, w + 2 * fr, fr, 0.1);
    faceBox("slitSills", C.light, f, u, y0 - fr / 2 - 0.01, 0.09, w + 2 * fr + 0.06, fr + 0.02, 0.18);
    // glass
    faceBox(lit ? "lit" : "glass", lit ? C.lit : C.glass, f, u, yc, 0.015, w, h, 0.05);
    // stair flight silhouettes seen through the slit
    const n = Math.floor(h / 0.75);
    const ang = 0.8;
    const len = (0.95 * w) / Math.cos(ang);
    for (let i = 0; i < n; i++) {
      const py = y0 + ((i + 0.5) * h) / n;
      faceBox(
        lit ? "flightsLit" : "flights",
        lit ? C.rail : C.dark,
        f,
        u,
        py,
        0.047,
        len,
        0.07,
        0.02,
        (i % 2 ? 1 : -1) * ang,
      );
    }
    // rain stain below the sill
    const drip = y0 > 2.5 || y0 < 2 ? 0.26 : 0.9;
    const dl = y0 < 2 ? 0.9 : drip;
    faceBox("streaks", C.stain, f, u + (rand() - 0.5) * 0.1, y0 - fr - 0.02 - dl / 2, 0.01, 0.07 + rand() * 0.05, dl, 0.02);
  };

  levels.forEach(([y0, y1], li) => {
    const fy0 = li === 0 ? 3.4 : y0;
    for (const u of [10.2, 11.35]) slit(FACES.front, u, fy0, y1, 0.4);
    slit(FACES.back, 10.75, y0, y1, 0.5);
    for (const u of [-2.0, -0.45]) slit(FACES.end, u, y0, y1, 0.42);
  });

  // floor-number plaques beside the front slits
  const plaqueColors = [C.ochre, C.rust, C.teal, C.ochre];
  decks.forEach((y, i) => {
    faceBox(`plaque${i}`, plaqueColors[i], FACES.front, 9.55, y + 1.4, 0.015, 0.18, 0.18, 0.03);
    faceBox("plaqueMark", C.rail, FACES.front, 9.55, y + 1.4, 0.035, 0.09, 0.03, 0.03);
  });

  // rain streaks hanging below bands and the cap
  const streakUs: Record<string, number[]> = {
    front: [9.5, 10.78, 12.0],
    back: [9.5, 10.15, 11.45, 12.05],
    end: [-2.7, -1.25, 0.5],
    inner: [-2.2, -1.2],
  };
  const drips = [4.15, 7.15, 10.15, 13.15, 15.7];
  for (const k of Object.keys(FACES)) {
    for (const yb of drips) {
      for (const u of streakUs[k]) {
        if (rand() < 0.55) continue;
        let len = 0.8 + rand() * 1.6;
        if (yb === 4.15 && k === "front") len = 0.5;
        faceBox("streaks", C.stain, FACES[k], u + (rand() - 0.5) * 0.12, yb - len / 2, 0.01, 0.05 + rand() * 0.06, len, 0.02);
      }
    }
  }

  // ---- ground floor door (front) ----
  const F = FACES.front;
  faceBox("doorFrame", C.mid, F, CX - 0.62, 1.475, 0.06, 0.12, 2.25, 0.12);
  faceBox("doorFrame", C.mid, F, CX + 0.62, 1.475, 0.06, 0.12, 2.25, 0.12);
  faceBox("doorLintel", C.light, F, CX, 2.725, 0.07, 1.5, 0.25, 0.14);
  faceBox("doorLeaf", C.teal, F, CX, 1.45, 0.04, 1.1, 2.2, 0.08);
  faceBox("doorGlass", C.glass, F, CX, 1.85, 0.045, 0.7, 1.1, 0.09);
  faceBox("doorKick", C.rail, F, CX, 0.6, 0.045, 1.0, 0.3, 0.09);
  faceBox("doorHandle", C.rail, F, CX + 0.42, 1.3, 0.1, 0.04, 0.5, 0.04);
  faceBox("canopy", C.light, F, CX, 2.95, 0.1, 1.9, 0.14, 0.2);
  faceBox("lit", C.lit, F, CX - 0.95, 2.2, 0.03, 0.12, 0.3, 0.06);
  faceBox("lit", C.lit, F, CX + 0.95, 2.2, 0.03, 0.12, 0.3, 0.06);
  faceBox("plaqueDoor", C.ochre, F, CX, 3.2, 0.015, 0.3, 0.12, 0.03);

  // ---- bridges to the slab at each deck ----
  const bw = SX0 + 0.1 - BX0; // from slab end to inside the shaft
  const bcx = BX0 + bw / 2;
  decks.forEach((y) => {
    box("bridgeSlabs", C.light, bw, 0.3, 1.6, bcx, y - 0.15, BCZ);
    box("bridgeBeam", C.stain, bw - 0.1, 0.1, 1.2, bcx, y - 0.35, BCZ);
    box("bridgeRoofs", C.light, bw + 0.1, 0.2, 1.7, bcx, y + 2.4, BCZ);
    for (const s of [1, -1]) {
      box("bridgeWalls", C.mid, bw, 2.3, 0.2, bcx, y + 1.15, BCZ + s * 0.7);
      const lit = rand() < 0.4;
      box(lit ? "lit" : "glass", lit ? C.lit : C.glass, bw - 0.24, 0.8, 0.02, bcx, y + 1.4, BCZ + s * 0.805);
      box("bridgeSills", C.light, bw - 0.14, 0.06, 0.06, bcx, y + 0.97, BCZ + s * 0.82);
    }
  });

  // ---- cantilever cap with chamfered edges ----
  add("capCorbel", C.mid, frustum(3.1, 3.6, 3.5, 4.0, 0.3).translate(CX, 15.85, CZ));
  box("capSlab", C.light, 3.5, 0.55, 4.0, CX, 16.275, CZ);
  add("capChamfer", C.light, frustum(3.5, 4.0, 3.0, 3.5, 0.3).translate(CX, 16.7, CZ));
  box("capShadow", C.stain, 3.12, 0.06, 3.62, CX, 15.97, CZ);
  for (const k of Object.keys(CAPFACES)) ribs(CAPFACES[k], [16.12, 16.3, 16.46]);
  // cap drip streaks
  for (const k of Object.keys(CAPFACES)) {
    const f = CAPFACES[k];
    for (let i = 0; i < 3; i++) {
      const u = f.lo + 0.4 + rand() * (f.hi - f.lo - 0.8);
      faceBox("streaks", C.stain, f, u, 16.28, 0.01, 0.06, 0.5, 0.02);
    }
  }

  // ---- lift overrun on the roof ----
  box("overrun", C.mid, 1.6, 0.5, 1.8, CX, 17.1, CZ);
  box("overrunCoping", C.light, 1.8, 0.15, 2.0, CX, 17.425, CZ);
  box("overrunDoor", C.glass, 0.5, 0.38, 0.02, CX - 0.35, 17.05, CZ + 0.905);
  for (let i = 0; i < 4; i++) box("overrunLouvre", C.rail, 0.4, 0.04, 0.03, CX + 0.4, 16.95 + i * 0.1, CZ + 0.915);
  box("overrunLamp", C.lit, 0.1, 0.1, 0.04, CX + 0.65, 17.25, CZ + 0.92);
  for (const s of [1, -1]) box("overrunStain", C.stain, 0.06, 0.45, 0.02, CX + s * 0.4, 17.05, CZ - 0.905);

  // ---- flush buckets into parts ----
  for (const [name, k] of buckets) {
    const geos = k.geos.map((g) => (g.index ? g.toNonIndexed() : g));
    const merged = mergeGeometries(geos);
    if (!merged) continue;
    const part = b.part(merged, k.color, { at: [0, 0, 0], flat: true, name: `stairTower_${name}` });
    if (name === "lit") glow(part, 1.3);
  }
}
    return buildStairTower;
  })(),
  // roofTerrace
  (() => {
type RoofCtx = {
  b: any;
  J: Record<string, any>;
  P: Record<string, string>;
  M: Record<string, number[]>;
};

function buildRoofTerrace({ b, P }: RoofCtx) {
  const rand = rng(1617);
  const rr = (a: number, c: number) => a + (c - a) * rand();

  // palette: spec colours + 4 own
  const LIGHT = P.concreteLight;
  const MID = P.concreteMid;
  const DARK = P.concreteDark;
  const STAIN = P.stain;
  const BOARD = P.boardMark;
  const GLASS = P.glass;
  const LIT = P.glassLit;
  const RAIL = P.rail;
  const MOSS = P.moss;
  const TANK = P.tank;
  const PAVING = "#9d998f";
  const MOSS_D = "#4a5535";
  const BAND = "#5c6b70";
  const LID = "#9db0b5";

  // ---- merge helpers: one part per colour ----
  const bins = new Map<string, THREE.BufferGeometry[]>();
  const put = (color: string, g: THREE.BufferGeometry) => {
    if (!bins.has(color)) bins.set(color, []);
    bins.get(color)!.push(g);
  };
  const box = (color: string, cx: number, y0: number, cz: number, w: number, h: number, d: number, ry = 0) => {
    const g = new THREE.BoxGeometry(w, h, d);
    if (ry) g.rotateY(ry);
    g.translate(cx, y0 + h / 2, cz);
    put(color, g);
  };
  const cyl = (color: string, cx: number, y0: number, cz: number, rt: number, rb: number, h: number, sides = 8, ry = 0) => {
    const g = new THREE.CylinderGeometry(rt, rb, h, sides);
    if (ry) g.rotateY(ry);
    g.translate(cx, y0 + h / 2, cz);
    put(color, g);
  };
  const rod = (color: string, a: number[], c: number[], r: number, sides = 5) => {
    const A = new THREE.Vector3(a[0], a[1], a[2]);
    const B = new THREE.Vector3(c[0], c[1], c[2]);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const g = new THREE.CylinderGeometry(r, r, len, sides);
    g.applyQuaternion(aim(dir.normalize()));
    const m = A.clone().add(B).multiplyScalar(0.5);
    g.translate(m.x, m.y, m.z);
    put(color, g);
  };
  const dome = (cx: number, y0: number, cz: number, r: number) => {
    const g = new THREE.SphereGeometry(r, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
    g.translate(cx, y0, cz);
    return g;
  };

  // ---- parapet ----
  const Y0 = 16;
  const WALL_TOP = 17.0;
  box(MID, -1.5, Y0, 3.805, 19.92, 1.0, 0.31);
  box(MID, -1.5, Y0, -3.805, 19.92, 1.0, 0.31);
  box(MID, 8.305, Y0, 0, 0.31, 1.0, 7.3);
  box(MID, -11.305, Y0, 0, 0.31, 1.0, 7.3);
  // coping with drip overhang
  box(LIGHT, -1.5, WALL_TOP, 3.825, 20, 0.12, 0.35);
  box(LIGHT, -1.5, WALL_TOP, -3.825, 20, 0.12, 0.35);
  box(LIGHT, 8.325, WALL_TOP, 0, 0.35, 0.12, 7.3);
  box(LIGHT, -11.325, WALL_TOP, 0, 0.35, 0.12, 7.3);
  // coping joints and moss patches on top
  for (const x of [-9, -5, -1, 3, 7]) {
    box(DARK, x, WALL_TOP + 0.12, 3.825, 0.02, 0.006, 0.35);
    box(DARK, x, WALL_TOP + 0.12, -3.825, 0.02, 0.006, 0.35);
  }
  for (const [x, z, w] of [[-8.2, 3.85, 0.7], [-2.6, 3.8, 0.5], [5.4, 3.85, 0.8], [-6.4, -3.8, 0.6], [2.2, -3.85, 0.9], [7.4, -3.8, 0.5]]) {
    box(MOSS, x, WALL_TOP + 0.12, z, w, 0.02, 0.18);
  }
  // gutter skirting at inner base
  box(DARK, -1.5, Y0 + 0.06, 3.6, 19.3, 0.06, 0.1);
  box(DARK, -1.5, Y0 + 0.06, -3.6, 19.3, 0.06, 0.1);
  box(DARK, 8.1, Y0 + 0.06, 0, 0.1, 0.06, 7.1);
  box(DARK, -11.1, Y0 + 0.06, 0, 0.1, 0.06, 7.1);

  // ---- outer-face details per wall ----
  type Wall = { ax: "z" | "x"; face: number; sign: number; a0: number; a1: number; streaks: number };
  const walls: Wall[] = [
    { ax: "z", face: 3.96, sign: 1, a0: -11.3, a1: 8.3, streaks: 16 },
    { ax: "z", face: -3.96, sign: -1, a0: -11.3, a1: 8.3, streaks: 14 },
    { ax: "x", face: 8.46, sign: 1, a0: -3.7, a1: 3.7, streaks: 5 },
    { ax: "x", face: -11.46, sign: -1, a0: -3.7, a1: 3.7, streaks: 5 },
  ];
  const onFace = (w: Wall, along: number, y0: number, len: number, h: number, dep: number, color: string) => {
    if (w.ax === "z") box(color, along, y0, w.face + (w.sign * dep) / 2, len, h, dep);
    else box(color, w.face + (w.sign * dep) / 2, y0, along, dep, h, len);
  };
  for (const w of walls) {
    // board marks, broken into planks
    [16.18, 16.4, 16.62, 16.84].forEach((y, i) => {
      let pos = w.a0 + rr(0, 1.5);
      let k = i;
      while (pos < w.a1 - 0.3) {
        const end = Math.min(pos + rr(2.2, 4), w.a1);
        onFace(w, (pos + end) / 2, y, end - pos - 0.06, 0.03, 0.012, k % 2 ? DARK : BOARD);
        pos = end + 0.04;
        k++;
      }
    });
    // drip groove under coping
    onFace(w, (w.a0 + w.a1) / 2, 16.94, w.a1 - w.a0, 0.03, 0.02, DARK);
    // rain streaks
    for (let i = 0; i < w.streaks; i++) {
      const along = rr(w.a0 + 0.2, w.a1 - 0.2);
      const wid = rr(0.06, 0.16);
      const len = rr(0.25, 0.78);
      onFace(w, along, 16.94 - len, wid, len, 0.016, STAIN);
      onFace(w, along + rr(-0.05, 0.05), 16.94 - len * 0.5, wid * 0.4, len * 0.5, 0.02, DARK);
    }
  }
  // expansion joints + scuppers on long walls
  for (const w of [walls[0], walls[1]]) {
    for (const x of [-9, -5, -1, 3, 7]) onFace(w, x, Y0, 0.035, 0.96, 0.022, DARK);
    const sx = w.sign > 0 ? [-8, -2.5, 4] : [-6, 1, 6.5];
    for (const x of sx) {
      onFace(w, x, 16.02, 0.7, 0.4, 0.014, STAIN);
      onFace(w, x, 16.07, 0.4, 0.12, 0.022, GLASS);
    }
  }

  // ---- terrace paving + joints ----
  box(PAVING, -1.5, Y0, 0, 19.3, 0.06, 7.3);
  for (let x = -10; x <= 8; x += 2) box(DARK, x, Y0 + 0.06, 0, 0.025, 0.008, 7.3);
  for (const z of [-2, 0, 2]) box(DARK, -1.5, Y0 + 0.06, z, 19.3, 0.008, 0.025);
  // drains
  for (const [x, z] of [[-3, 1.0], [2, -2.9], [7.4, 1.2]]) {
    cyl(RAIL, x, Y0 + 0.06, z, 0.16, 0.16, 0.02, 10);
    box(DARK, x, Y0 + 0.08, z, 0.3, 0.012, 0.03);
    box(DARK, x, Y0 + 0.08, z, 0.03, 0.012, 0.3);
  }
  // moss patches
  const patches: number[][] = [
    [-10.5, -3.2, 0.5], [-8.8, -3.3, 0.4], [-6.0, 0.4, 0.5], [-3.8, -0.4, 0.4], [0.8, -3.3, 0.55],
    [1.6, -0.9, 0.4], [3.2, 1.8, 0.5], [7.2, -1.0, 0.6], [7.5, 2.3, 0.45], [-1.0, 3.1, 0.35],
    [5.5, -3.3, 0.45], [-7.8, 3.4, 0.4], [-10.8, 0.6, 0.38], [-4.6, 3.2, 0.5],
  ];
  for (const [x, z, r] of patches) {
    const sz = rr(0.6, 1);
    const ry = rr(0, Math.PI);
    const g1 = new THREE.CylinderGeometry(r, r, 0.03, 7);
    g1.scale(1, 1, sz);
    g1.rotateY(ry);
    g1.translate(x, Y0 + 0.075, z);
    put(MOSS, g1);
    const g2 = new THREE.CylinderGeometry(r * 0.5, r * 0.5, 0.035, 6);
    g2.scale(1, 1, sz);
    g2.rotateY(ry + 0.5);
    g2.translate(x + r * 0.15, Y0 + 0.08, z - r * 0.1);
    put(MOSS_D, g2);
  }
  // conduit along back parapet
  rod(RAIL, [-11, 16.17, -3.52], [8, 16.17, -3.52], 0.03, 6);
  for (let x = -10.5; x < 8; x += 3) box(DARK, x, Y0 + 0.06, -3.52, 0.06, 0.2, 0.08);

  // ---- lift overrun ----
  const LX = 4.6, LZ = -1.2;
  box(STAIN, LX, Y0 + 0.06, LZ, 2.88, 0.12, 2.48);
  box(MID, LX, Y0 + 0.06, LZ, 2.8, 1.3, 2.4);
  box(LIGHT, LX, 17.36, LZ, 2.92, 0.1, 2.52);
  [16.4, 16.65, 16.9, 17.15].forEach((y, i) => {
    box(i % 2 ? DARK : BOARD, LX, y, LZ + 1.2 + 0.006, 2.7, 0.03, 0.012);
    box(i % 2 ? DARK : BOARD, LX + 1.4 + 0.006, y, LZ, 0.012, 0.03, 2.3);
    box(i % 2 ? DARK : BOARD, LX - 1.4 - 0.006, y, LZ, 0.012, 0.03, 2.3);
  });
  // door
  box(DARK, 3.9, Y0 + 0.06, 0.008, 1.08, 1.1, 0.02);
  box(RAIL, 3.9, Y0 + 0.06, 0.02, 0.9, 1.0, 0.03);
  box(GLASS, 3.9, 16.7, 0.04, 0.3, 0.25, 0.02);
  box(LIGHT, 4.25, 16.5, 0.045, 0.04, 0.12, 0.03);
  box(DARK, 3.9, 17.14, 0.13, 1.25, 0.07, 0.28);
  // louvre panel
  box(DARK, 5.25, 16.3, 0.008, 0.82, 0.9, 0.02);
  for (let i = 0; i < 5; i++) box(RAIL, 5.25, 16.38 + i * 0.16, 0.025, 0.7, 0.05, 0.04);
  // side vent
  box(DARK, LX + 1.4 + 0.008, 16.35, LZ, 0.02, 0.7, 0.9);
  for (let i = 0; i < 4; i++) box(RAIL, LX + 1.4 + 0.025, 16.42 + i * 0.15, LZ, 0.04, 0.05, 0.78);
  // junction box
  box(RAIL, 3.2 + 0.2, 16.9, 0.02, 0.3, 0.4, 0.06);
  rod(RAIL, [3.4, 16.9, 0.03], [3.4, 17.34, 0.03], 0.02);
  // overrun lamp
  glow(
    b.part(new THREE.BoxGeometry(0.14, 0.2, 0.06).translate(4.75, 16.95, 0.04), LIT, { at: [0, 0, 0], flat: true, name: "roofTerrace.lamp" }),
    1.4,
  );

  // ---- roof access hatch ----
  const HX = -9.7, HZ = -0.5;
  box(STAIN, HX, Y0 + 0.06, HZ, 1.68, 0.1, 1.58);
  box(MID, HX, Y0 + 0.06, HZ, 1.6, 1.15, 1.5);
  box(LIGHT, HX, 17.21, HZ, 1.74, 0.08, 1.64);
  box(DARK, HX, Y0 + 0.06, HZ + 0.75 + 0.008, 0.9, 1.0, 0.02);
  box(RAIL, HX, Y0 + 0.06, HZ + 0.75 + 0.02, 0.76, 0.92, 0.03);
  box(GLASS, HX, 16.6, HZ + 0.75 + 0.04, 0.3, 0.3, 0.02);
  box(DARK, HX, 17.06, HZ + 0.75 + 0.008, 1.4, 0.04, 0.012);
  for (const y of [16.3, 16.6, 16.9]) {
    box(BOARD, HX - 0.8 - 0.006, y, HZ, 0.012, 0.03, 1.4);
    box(BOARD, HX + 0.8 + 0.006, y, HZ, 0.012, 0.03, 1.4);
  }
  glow(
    b.part(new THREE.BoxGeometry(0.34, 0.12, 0.03).translate(HX, 17.0, HZ + 0.77), LIT, { at: [0, 0, 0], flat: true, name: "roofTerrace.exitSign" }),
    1.4,
  );

  // ---- ventilation stacks ----
  const VZ = -3.0;
  for (const [x, h] of [[-7, 0.95], [-5.9, 1.0], [-4.8, 0.8]]) {
    box(DARK, x, Y0 + 0.06, VZ, 0.8, 0.2, 0.8);
    box(STAIN, x, Y0 + 0.06, VZ, 0.84, 0.05, 0.84);
    const base = 16.26;
    cyl(LIGHT, x, base, VZ, 0.26, 0.26, h, 8);
    for (let k = 0; k < 6; k++) {
      const y = base + 0.1 + k * 0.17;
      if (y < base + h - 0.08) cyl(DARK, x, y, VZ, 0.3, 0.3, 0.05, 8);
    }
    const top = base + h;
    for (const [dx, dz] of [[0.2, 0.2], [-0.2, 0.2], [0.2, -0.2], [-0.2, -0.2]]) {
      cyl(RAIL, x + dx, top, VZ + dz, 0.02, 0.02, 0.12, 5);
    }
    cyl(DARK, x, top + 0.12, VZ, 0.04, 0.42, 0.12, 8);
    cyl(DARK, x, top + 0.24, VZ, 0.02, 0.04, 0.02, 6);
    // rain stain under cap
    box(STAIN, x, base + 0.05, VZ + 0.265, 0.1, h * 0.5, 0.01);
  }

  // ---- water tank on stilts ----
  const TX = -1.2, TZ = -1.8;
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) {
      rod(RAIL, [TX + sx * 0.6, Y0 + 0.06, TZ + sz * 0.6], [TX + sx * 0.6, 16.5, TZ + sz * 0.6], 0.05, 6);
      box(DARK, TX + sx * 0.6, Y0 + 0.06, TZ + sz * 0.6, 0.18, 0.04, 0.18);
    }
  for (const s of [-1, 1]) {
    rod(RAIL, [TX - 0.6, 16.1, TZ + s * 0.6], [TX + 0.6, 16.46, TZ + s * 0.6], 0.02);
    rod(RAIL, [TX + 0.6, 16.1, TZ + s * 0.6], [TX - 0.6, 16.46, TZ + s * 0.6], 0.02);
    rod(RAIL, [TX + s * 0.6, 16.1, TZ - 0.6], [TX + s * 0.6, 16.46, TZ + 0.6], 0.02);
    rod(RAIL, [TX + s * 0.6, 16.1, TZ + 0.6], [TX + s * 0.6, 16.46, TZ - 0.6], 0.02);
  }
  box(MID, TX, 16.5, TZ, 1.5, 0.06, 1.5);
  cyl(TANK, TX, 16.56, TZ, 0.8, 0.8, 0.7, 10);
  for (const y of [16.66, 16.86, 17.06]) cyl(BAND, TX, y, TZ, 0.83, 0.83, 0.045, 10);
  cyl(LID, TX, 17.26, TZ, 0.12, 0.8, 0.2, 10);
  cyl(RAIL, TX, 17.46, TZ, 0.03, 0.03, 0.04, 6);
  // stain streaks on tank
  for (let i = 0; i < 4; i++) {
    const a = rr(0.2, 2.9);
    box(STAIN, TX + Math.cos(a) * 0.81, 16.8 + rr(0, 0.2), TZ + Math.sin(a) * 0.81, 0.07, rr(0.2, 0.42), 0.02, -a);
  }
  // ladder
  rod(RAIL, [TX - 0.15, Y0 + 0.06, -0.93], [TX - 0.15, 17.32, -0.93], 0.022);
  rod(RAIL, [TX + 0.15, Y0 + 0.06, -0.93], [TX + 0.15, 17.32, -0.93], 0.022);
  for (let i = 0; i < 6; i++) box(RAIL, TX, 16.25 + i * 0.2, -0.93, 0.3, 0.03, 0.03);
  // outlet pipe and valve
  rod(RAIL, [TX, 16.56, TZ], [TX, Y0 + 0.06, TZ], 0.04, 6);
  cyl(RAIL, TX, 16.28, TZ, 0.07, 0.07, 0.06, 6);
  box(PAVING, TX, Y0 + 0.06, TZ, 0.01, 0.0001, 0.01);

  // ---- skylight blisters ----
  for (const x of [-8, -5.2, -2.4]) {
    box(LIGHT, x, Y0 + 0.06, 1.8, 1.3, 0.22, 1.3);
    box(STAIN, x, Y0 + 0.06, 1.8, 1.36, 0.05, 1.36);
    cyl(RAIL, x, Y0 + 0.28, 1.8, 0.56, 0.56, 0.04, 10);
    if (x === -5.2) {
      glow(b.part(dome(x, Y0 + 0.32, 1.8, 0.52), LIT, { at: [0, 0, 0], flat: true, name: "roofTerrace.skylightLit" }), 1.1);
    } else {
      put(GLASS, dome(x, Y0 + 0.32, 1.8, 0.52));
    }
    for (const a of [0, Math.PI / 2]) {
      const g = new THREE.TorusGeometry(0.52, 0.012, 3, 8, Math.PI);
      g.rotateY(a);
      g.translate(x, Y0 + 0.32, 1.8);
      put(RAIL, g);
    }
  }

  // ---- planters with shrubs ----
  for (const x of [0.8, 2.6, 4.4, 6.2]) {
    box(LIGHT, x, Y0 + 0.06, 3.05, 1.3, 0.45, 0.6);
    box(BOARD, x, Y0 + 0.2, 3.355, 1.3, 0.03, 0.012);
    box(MOSS_D, x, Y0 + 0.51, 3.05, 1.18, 0.05, 0.48);
    for (let i = 0; i < 2; i++) {
      const r = rr(0.18, 0.27);
      const g = new THREE.SphereGeometry(r, 6, 4);
      g.scale(1, 0.8, 1);
      g.translate(x + (i ? 0.3 : -0.28) + rr(-0.05, 0.05), Y0 + 0.56 + r * 0.7, 3.05 + rr(-0.08, 0.08));
      put(MOSS, g);
    }
    const flower = [P.panelOchre, P.panelRust, P.panelTeal][Math.floor(rr(0, 3))];
    for (let i = 0; i < 3; i++) {
      const g = new THREE.SphereGeometry(0.04, 5, 3);
      g.translate(x + rr(-0.45, 0.45), Y0 + 0.82 + rr(0, 0.05), 3.05 + rr(-0.15, 0.15));
      put(flower, g);
    }
  }

  // ---- bench ----
  box(LIGHT, -9, Y0 + 0.44, 3.2, 1.8, 0.08, 0.45);
  box(DARK, -9.75, Y0 + 0.06, 3.2, 0.12, 0.38, 0.4);
  box(DARK, -8.25, Y0 + 0.06, 3.2, 0.12, 0.38, 0.4);

  // ---- aerial masts ----
  // mast A with yagi crossbars and guys
  const AX = 6.8, AZ = -3.0;
  box(DARK, AX, Y0 + 0.06, AZ, 0.5, 0.15, 0.5);
  rod(RAIL, [AX, Y0 + 0.2, AZ], [AX, 17.48, AZ], 0.03, 6);
  [[17.0, 0.55], [17.15, 0.45], [17.3, 0.35], [17.42, 0.25]].forEach(([y, w]) => {
    box(RAIL, AX, y, AZ, w, 0.02, 0.02);
    box(RAIL, AX, y, AZ, 0.02, 0.02, w * 0.5);
  });
  for (const [dx, dz] of [[0.9, 0.5], [-0.8, 0.6], [0.1, -0.5]]) {
    rod(RAIL, [AX, 17.2, AZ], [AX + dx, Y0 + 0.06, AZ + dz], 0.008, 3);
    box(DARK, AX + dx, Y0 + 0.06, AZ + dz, 0.1, 0.06, 0.1);
  }
  // mast B with dish
  const BX = -10.6, BZ = 2.6;
  box(DARK, BX, Y0 + 0.06, BZ, 0.5, 0.15, 0.5);
  rod(RAIL, [BX, Y0 + 0.2, BZ], [BX, 17.1, BZ], 0.035, 6);
  const dish = new THREE.SphereGeometry(0.3, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
  dish.rotateX(Math.PI / 2 - 0.35);
  dish.translate(BX, 17.05, BZ + 0.05);
  put(LIGHT, dish);
  rod(RAIL, [BX, 17.05, BZ + 0.05], [BX, 17.28, BZ + 0.4], 0.012, 4);
  cyl(RAIL, BX, 17.26, BZ + 0.4, 0.03, 0.03, 0.05, 5);
  rod(RAIL, [BX, 17.1, BZ], [BX, 17.48, BZ], 0.02, 5);
  box(RAIL, BX, 17.44, BZ, 0.3, 0.02, 0.02);

  // ---- flush merged geometry: one part per colour ----
  const order = [MID, LIGHT, DARK, STAIN, BOARD, PAVING, MOSS, MOSS_D, GLASS, RAIL, TANK, BAND, LID, P.panelOchre, P.panelRust, P.panelTeal];
  const seen = new Set<string>();
  const flush = (color: string) => {
    const geos = bins.get(color);
    if (!geos || !geos.length || seen.has(color)) return;
    seen.add(color);
    const merged = mergeGeometries(geos.map((g) => (g.index ? g.toNonIndexed() : g)));
    if (merged) b.part(merged, color, { at: [0, 0, 0], flat: true, name: `roofTerrace.${color.replace("#", "c")}` });
  };
  for (const c of order) flush(c);
  for (const c of bins.keys()) flush(c);
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
