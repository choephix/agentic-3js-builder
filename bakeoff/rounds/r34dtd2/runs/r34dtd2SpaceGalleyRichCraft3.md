```ts
import * as THREE from "three";
import { createBuilder, rng } from "agentic-3js-builder";
import { svg } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";
import { metal, panelled } from "agentic-3js-builder/kits/clockwork";

export const meta = {
  name: "Nostromo Galley",
  description: "Retro-industrial spaceship galley: steel counters, stove, CRT monitor, fixed bench table, pipes and hazard-striped deck.",
};

type V = [number, number, number];

export default function build() {
  const b = createBuilder({ name: "galley" });
  const R = rng(11);

  // ---------- palette ----------
  const WALL = panelled(metal("steel", { tarnish: 0.3, polish: 0.1 }), { size: 0.5, aspect: 0.8, rivets: 0.08 });
  const STEEL = metal("steel", { polish: 0.5, tarnish: 0.15 });
  const DARK = "#2b2d2e";
  const BEIGE = "#b9b29a";
  const GREY = "#7b8079";
  const OLIVE = "#6b7059";
  const ORANGE = "#c9722a";
  const RED = "#a3281f";
  const YELLOW = "#d8b02a";
  const WHITE = "#e6e3d6";
  const BLACK = "#141516";
  const COPPER = metal("copper", { tarnish: 0.4 });
  const IRON = metal("iron");
  const FLOOR = "#3a3d3c";

  // ---------- textures ----------
  const hazard = svg(
    `<svg viewBox="0 0 64 8"><rect width="64" height="8" fill="#d8b02a"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#1a1a1a"/>`).join("")}</svg>`,
    { size: 256 },
  );
  const grate = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#2e3130"/>${Array.from({ length: 16 }, (_, i) => `<path d="M${i * 4 + 2} 0V64M0 ${i * 4 + 2}H64" stroke="#14171a" stroke-width="1.6"/>`).join("")}<rect width="64" height="64" fill="none" stroke="#565a58" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const screen = svg(
    `<svg viewBox="0 0 80 56"><rect width="80" height="56" fill="#031a08"/>${Array.from({ length: 9 }, (_, i) => `<rect x="6" y="${6 + i * 5}" width="${20 + ((i * 23) % 48)}" height="2" fill="#5dff7a"/>`).join("")}<text x="6" y="52" font-family="monospace" font-size="5" fill="#9dffb0">MOTHER &gt; GALLEY 02 OK_</text><rect x="0" y="0" width="80" height="56" fill="none" stroke="#1f6a2c" stroke-width="2"/></svg>`,
    { size: 256 },
  );
  const sign = svg(
    `<svg viewBox="0 0 64 20"><rect width="64" height="20" fill="#d9d3bd"/><rect x="2" y="2" width="60" height="16" fill="none" stroke="#222" stroke-width="1"/><text x="32" y="13.5" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="8" fill="#222">GALLEY</text></svg>`,
    { size: 256 },
  );
  const label = svg(
    `<svg viewBox="0 0 40 24"><rect width="40" height="24" fill="#c9722a"/><text x="20" y="9" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="6" fill="#111">NUTRI-</text><text x="20" y="17" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="6" fill="#111">PASTE</text><rect x="2" y="19" width="36" height="2" fill="#111"/></svg>`,
    { size: 128 },
  );
  const vent = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#3a3d3c"/>${Array.from({ length: 9 }, (_, i) => `<rect x="4" y="${4 + i * 4}" width="32" height="2" fill="#0d0e0f"/>`).join("")}<rect x="1" y="1" width="38" height="38" fill="none" stroke="#777" stroke-width="2"/></svg>`,
    { size: 128 },
  );
  const panelBtn = svg(
    `<svg viewBox="0 0 48 24"><rect width="48" height="24" fill="#26292a"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${6 + i * 5.2}" cy="8" r="1.8" fill="${["#ff4a2a", "#ffcf3a", "#5dff7a", "#ff4a2a"][i % 4]}"/>`).join("")}${Array.from({ length: 4 }, (_, i) => `<rect x="${6 + i * 10}" y="14" width="6" height="6" fill="#8d9187" stroke="#000" stroke-width="0.6"/>`).join("")}</svg>`,
    { size: 256 },
  );

  // ---------- helpers ----------
  const box = (s: V, at: V, color: any, o: any = {}) => b.part(new THREE.BoxGeometry(...s), color, { at, ...o });
  const cyl = (r: number, h: number, at: V, color: any, dir: V = [0, 1, 0], seg = 10, r2?: number) =>
    b.part(new THREE.CylinderGeometry(r2 ?? r, r, h, seg), color, { at, dir });
  const pipe = (a: V, c: V, r: number, color: any) => b.rod(a, c, r, color, { sides: 8 });
  const flat = (w: number, h: number, at: V, tex: any, dir: V, up?: V) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at, dir, axis: "z", texture: tex, up });
  const handle = (at: V) => {
    cyl(0.01, 0.16, at, DARK, [1, 0, 0], 6);
    box([0.02, 0.02, 0.03], [at[0] - 0.07, at[1], at[2] - 0.012], DARK);
    box([0.02, 0.02, 0.03], [at[0] + 0.07, at[1], at[2] - 0.012], DARK);
  };
  const bolts = (x0: number, x1: number, y: number, z: number, n: number, color: any = DARK) => {
    for (let i = 0; i < n; i++) cyl(0.008, 0.01, [x0 + ((x1 - x0) * i) / (n - 1), y, z], color, [0, 0, 1], 6);
  };

  // ---------- deck ----------
  box([3.4, 0.05, 2.8], [0, 0.025, 0], FLOOR);
  flat(3.3, 2.7, [0, 0.052, 0], grate, [0, 1, 0], [0, 0, 1]);
  // hazard border strips
  for (const z of [1.3, -0.45]) flat(3.2, 0.1, [0, 0.054, z], hazard, [0, 1, 0], [0, 0, 1]);
  box([3.4, 0.08, 0.05], [0, 0.04, 1.4], YELLOW);

  // ---------- walls ----------
  box([3.4, 2.5, 0.08], [0, 1.25, -1.26], WALL);
  box([0.08, 2.5, 2.5], [-1.66, 1.25, 0], WALL);
  box([0.08, 2.5, 1.2], [1.66, 1.25, -0.65], WALL);
  // ceiling beams & lights
  for (const z of [-1.0, -0.1, 0.8]) box([3.4, 0.1, 0.14], [0, 2.45, z], GREY);
  for (const x of [-0.8, 0.8]) {
    glow(box([0.7, 0.03, 0.3], [x, 2.38, 0.35], "#fff3d0"), 1.4);
    box([0.76, 0.03, 0.36], [x, 2.405, 0.35], DARK);
  }
  // vertical wall ribs
  for (const x of [-1.6, -0.55, 0.55, 1.6]) box([0.06, 2.4, 0.05], [x, 1.2, -1.2], GREY);
  flat(0.5, 0.16, [-1.2, 2.15, -1.215], sign, [0, 0, 1]);
  flat(0.3, 0.3, [1.2, 1.2, -1.215], vent, [0, 0, 1]);

  // ---------- counter run ----------
  box([2.8, 0.86, 0.6], [0, 0.48, -0.9], STEEL);
  box([2.84, 0.045, 0.66], [0, 0.93, -0.9], "#c4c7c4");
  box([2.84, 0.012, 0.03], [0, 0.96, -0.58], DARK);
  box([2.8, 0.06, 0.62], [0, 0.07, -0.9], DARK);
  for (let i = 0; i < 4; i++) {
    const x = -1.05 + i * 0.7;
    box([0.66, 0.72, 0.02], [x, 0.5, -0.59], i % 2 ? OLIVE : GREY);
    box([0.6, 0.66, 0.005], [x, 0.5, -0.578], STEEL);
    handle([x, 0.78, -0.62]);
    bolts(x - 0.28, x + 0.28, 0.18, -0.6, 4);
  }
  // sink
  box([0.5, 0.02, 0.4], [-0.95, 0.945, -0.9], DARK);
  box([0.42, 0.015, 0.32], [-0.95, 0.955, -0.9], "#5b6063");
  pipe([-0.95, 0.96, -1.1], [-0.95, 1.12, -1.1], 0.016, STEEL);
  pipe([-0.95, 1.12, -1.1], [-0.95, 1.12, -0.97], 0.014, STEEL);
  for (const s of [-1, 1]) cyl(0.022, 0.03, [-0.95 + s * 0.09, 0.97, -1.1], RED, [0, 1, 0], 6);

  // stove with glowing burners
  box([0.7, 0.05, 0.5], [0.7, 0.975, -0.9], BLACK);
  for (const [x, z] of [[0.55, -0.98], [0.85, -0.98], [0.55, -0.78], [0.85, -0.78]] as [number, number][]) {
    glow(b.part(new THREE.TorusGeometry(0.06, 0.009, 5, 12), "#ff5a1f", { at: [x, 1.005, z], rotation: [90, 0, 0] }), 1.6);
    cyl(0.03, 0.006, [x, 1.0, z], DARK, [0, 1, 0], 8);
  }
  // pot
  cyl(0.1, 0.16, [0.55, 1.1, -0.98], COPPER, [0, 1, 0], 10);
  cyl(0.105, 0.015, [0.55, 1.19, -0.98], COPPER, [0, 1, 0], 10);
  box([0.1, 0.015, 0.02], [0.69, 1.14, -0.98], DARK);
  // kettle
  cyl(0.06, 0.1, [0.85, 1.06, -0.78], STEEL, [0, 1, 0], 8, 0.08);
  // knobs
  for (let i = 0; i < 4; i++) cyl(0.022, 0.025, [0.5 + i * 0.1, 0.8, -0.59 - 0.02], BEIGE, [0, 0, 1], 8);

  // coffee machine
  box([0.28, 0.4, 0.28], [1.2, 1.18, -0.95], BEIGE);
  box([0.3, 0.05, 0.3], [1.2, 1.4, -0.95], DARK);
  box([0.2, 0.02, 0.2], [1.2, 0.97, -0.88], DARK);
  cyl(0.045, 0.1, [1.2, 1.03, -0.86], WHITE, [0, 1, 0], 8);
  glow(box([0.04, 0.025, 0.01], [1.1, 1.3, -0.805], "#ff4a2a"), 2);
  glow(box([0.04, 0.025, 0.01], [1.2, 1.3, -0.805], "#5dff7a"), 2);

  // backsplash monitor
  box([0.62, 0.42, 0.14], [-0.15, 1.28, -1.17], DARK);
  box([0.52, 0.34, 0.12], [-0.15, 1.28, -1.1], BEIGE);
  glow(flat(0.44, 0.31, [-0.15, 1.28, -1.039], screen, [0, 0, 1]), 1.1);
  for (let i = 0; i < 3; i++) cyl(0.012, 0.01, [-0.35 + i * 0.05, 1.04, -1.12], [RED, YELLOW, "#5dff7a"][i], [0, 0, 1], 6);
  flat(0.46, 0.23, [0.55, 1.28, -1.215], panelBtn, [0, 0, 1]);
  glow(flat(0.46, 0.23, [0.55, 1.28, -1.213], panelBtn, [0, 0, 1]), 0.5);

  // upper cabinets
  for (const [x, w] of [[-1.05, 0.9], [1.0, 0.9]] as [number, number][]) {
    box([w, 0.7, 0.36], [x, 1.7, -1.05], OLIVE);
    for (let k = 0; k < 2; k++) {
      const dx = x - w / 4 + k * (w / 2);
      box([w / 2 - 0.03, 0.64, 0.015], [dx, 1.7, -0.865], GREY);
      handle([dx + (k ? -0.15 : 0.15), 1.5, -0.89]);
    }
    bolts(x - w / 2 + 0.05, x + w / 2 - 0.05, 2.0, -0.87, 6);
  }
  // hood
  b.part(new THREE.CylinderGeometry(0.2, 0.55, 0.4, 4, 1), STEEL, { at: [0.7, 1.95, -0.98], rotation: [0, 45, 0], scale: [1, 1, 0.55] });
  box([0.2, 0.3, 0.2], [0.7, 2.3, -1.1], STEEL);
  glow(box([0.4, 0.02, 0.15], [0.7, 1.74, -0.95], "#fff0c0"), 1.2);
  // hanging utensils on rail
  pipe([-0.5, 1.3, -1.1], [0.2, 1.3, -1.1], 0.008, STEEL);
  pipe([-0.45, 1.32, -1.1], [0.2, 1.32, -1.1], 0.0001, STEEL);

  // ---------- overhead pipework ----------
  pipe([-1.6, 2.28, -1.15], [1.6, 2.28, -1.15], 0.06, IRON);
  pipe([-1.6, 2.18, -1.0], [1.6, 2.18, -1.0], 0.035, COPPER);
  pipe([-1.6, 2.28, -0.95], [1.6, 2.28, -0.95], 0.025, YELLOW);
  for (const x of [-1.3, -0.5, 0.4, 1.2]) {
    box([0.05, 0.12, 0.2], [x, 2.25, -1.05], DARK);
  }
  pipe([-1.55, 2.28, -1.15], [-1.55, 0.05, -1.15], 0.045, IRON);
  pipe([1.55, 2.28, -1.15], [1.55, 1.1, -1.15], 0.04, COPPER);
  for (const y of [0.4, 1.0, 1.7]) cyl(0.06, 0.04, [-1.55, y, -1.15], DARK, [0, 1, 0], 8);
  // hanging cables
  for (let i = 0; i < 4; i++) {
    const x = 0.2 + i * 0.07;
    b.sweep([[x, 2.28, -0.9], [x + 0.02, 2.0, -0.85], [x - 0.02, 1.8, -0.8]], 0.007, { color: BLACK, sides: 5 });
  }

  // ---------- fixed table & benches ----------
  box([1.6, 0.05, 0.85], [0, 0.78, 0.55], BEIGE);
  box([1.64, 0.02, 0.89], [0, 0.745, 0.55], DARK);
  for (const x of [-0.5, 0.5]) {
    cyl(0.06, 0.72, [x, 0.4, 0.55], STEEL, [0, 1, 0], 8);
    cyl(0.16, 0.03, [x, 0.065, 0.55], DARK, [0, 1, 0], 10);
  }
  // table edge strips
  box([1.6, 0.03, 0.02], [0, 0.78, 0.985], YELLOW);
  box([1.6, 0.03, 0.02], [0, 0.78, 0.115], YELLOW);
  for (const s of [1, -1]) {
    const z = 0.55 + s * 0.75;
    box([1.5, 0.05, 0.32], [0, 0.46, z], DARK);
    box([1.48, 0.07, 0.3], [0, 0.505, z], ORANGE);
    box([1.5, 0.3, 0.05], [0, 0.65, z + s * 0.14], ORANGE);
    for (const x of [-0.65, 0.65]) {
      box([0.05, 0.43, 0.2], [x, 0.235, z], STEEL);
    }
    bolts(-0.7, 0.7, 0.67, z + s * 0.11, 8, BEIGE);
  }

  // ---------- table clutter ----------
  // tray with paste tubs
  box([0.5, 0.025, 0.32], [-0.35, 0.81, 0.5], GREY);
  box([0.5, 0.03, 0.01], [-0.35, 0.825, 0.66], DARK);
  for (let i = 0; i < 3; i++) {
    box([0.12, 0.05, 0.12], [-0.5 + i * 0.15, 0.845, 0.48], [WHITE, ORANGE, OLIVE][i]);
  }
  b.part(new THREE.PlaneGeometry(0.12, 0.07), "#ffffff", { at: [-0.35, 0.845, 0.545], dir: [0, 0, 1], axis: "z", texture: label });
  // mugs
  for (const [x, z] of [[0.15, 0.4], [0.3, 0.7], [0.55, 0.5], [-0.05, 0.8]] as [number, number][]) {
    cyl(0.04, 0.09, [x, 0.855, z], WHITE, [0, 1, 0], 8);
    cyl(0.034, 0.005, [x, 0.9, z], "#3a2316", [0, 1, 0], 8);
    b.part(new THREE.TorusGeometry(0.025, 0.006, 4, 8), WHITE, { at: [x + 0.045, 0.86, z], rotation: [0, 90, 0] });
  }
  // plates
  for (const [x, z] of [[0.4, 0.3], [0.65, 0.8], [-0.7, 0.8]] as [number, number][]) {
    cyl(0.1, 0.012, [x, 0.81, z], WHITE, [0, 1, 0], 12);
    cyl(0.07, 0.01, [x, 0.818, z], "#a7a68e", [0, 1, 0], 12);
  }
  // thermos / bottle
  cyl(0.04, 0.24, [0.0, 0.92, 0.55], STEEL, [0, 1, 0], 8);
  cyl(0.042, 0.03, [0.0, 1.06, 0.55], RED, [0, 1, 0], 8);
  // cutlery
  for (let i = 0; i < 3; i++) box([0.01, 0.005, 0.15], [0.25 + i * 0.03 + R() * 0.01, 0.808, 0.15 + R() * 0.02], STEEL);

  // ---------- right wall lockers ----------
  box([0.3, 1.0, 0.8], [1.45, 0.55, -0.55], GREY);
  for (let i = 0; i < 2; i++) {
    box([0.015, 0.9, 0.36], [1.3, 0.55, -0.75 + i * 0.4], OLIVE);
    cyl(0.01, 0.12, [1.29, 0.55, -0.65 + i * 0.4], DARK, [0, 1, 0], 6);
  }
  // fire extinguisher
  cyl(0.07, 0.36, [1.55, 1.35, -0.1], RED, [0, 1, 0], 10);
  cyl(0.03, 0.08, [1.55, 1.58, -0.1], DARK, [0, 1, 0], 8);
  box([0.04, 0.02, 0.06], [1.5, 1.62, -0.1], DARK);
  box([0.02, 0.4, 0.14], [1.62, 1.35, -0.1], DARK);
  // wall hatch & warning tape
  flat(0.8, 0.12, [1.617, 1.0, 0.5], hazard, [-1, 0, 0]);
  box([0.04, 0.5, 0.5], [1.62, 1.7, 0.55], DARK);
  glow(box([0.02, 0.4, 0.4], [1.605, 1.7, 0.55], "#ffb347"), 0.6);

  // left wall: porthole-ish shutter & panel
  box([0.06, 0.6, 0.6], [-1.6, 1.5, 0.2], DARK);
  cyl(0.25, 0.04, [-1.58, 1.5, 0.2], STEEL, [1, 0, 0], 12);
  glow(cyl(0.18, 0.02, [-1.56, 1.5, 0.2], "#2a6a8a", [1, 0, 0], 12), 0.7);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    cyl(0.012, 0.015, [-1.56, 1.5 + Math.sin(a) * 0.22, 0.2 + Math.cos(a) * 0.22], DARK, [1, 0, 0], 6);
  }
  box([0.04, 0.7, 0.5], [-1.62, 0.6, -0.5], BEIGE);

  // ---------- stools ----------
  for (const [x, z] of [[1.1, 0.2], [1.2, 0.9]] as [number, number][]) {
    cyl(0.16, 0.06, [x, 0.5, z], ORANGE, [0, 1, 0], 10);
    cyl(0.02, 0.45, [x, 0.25, z], STEEL, [0, 1, 0], 6);
    cyl(0.12, 0.02, [x, 0.06, z], DARK, [0, 1, 0], 10);
  }

  return b.root;
}
```