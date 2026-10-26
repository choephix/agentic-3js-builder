import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, smoothstep, svg, catmull } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description: "Alien (1979) style spaceship galley: grimy beige panels, steel counter, stove, mess table, CRT, pipes and glowing indicators.",
};

export default function build() {
  const b = createBuilder({ name: "galley" });
  const R = rng(11);

  // ---------- colours ----------
  const DARK = "#1c1d1e", BLACK = "#0f0f10", STEEL = "#a7adaf", STEEL_D = "#6d7377";
  const ORANGE = "#d9791f", RED = "#a8342a", AMBER = "#ffb23a", GREEN = "#7dff9a", WHITE = "#e9e6d8";
  const RUBBER = "#2c2c2a", YELLOW = "#d9b72a", CUP = "#d8d2bd", CUSHION = "#b4532a";

  // ---------- paints ----------
  const panelPaint = (a: string, c: string, pw: number, ph: number, seed: number) =>
    paint((p, n) => {
      const ax = Math.abs(n.x), az = Math.abs(n.z);
      const [u, v] = ax > az ? [p.z, p.y] : [p.x, p.y];
      const fu = (u / pw) - Math.floor(u / pw), fv = (v / ph) - Math.floor(v / ph);
      const base = mix(a, c, smoothstep(0.3, 0.7, noise(p, 0.35, seed)));
      let col = base;
      if (fu * pw < 0.006 || fv * ph < 0.006) col = mix(base, "#1a1812", 0.8);
      else if (fu * pw < 0.012 || fv * ph < 0.012) col = mix(base, "#ffffff", 0.12);
      const grime = smoothstep(0.55, 0.85, noise(p, 0.12, seed + 4)) * 0.35 + smoothstep(0.7, 0, p.y) * 0.3;
      const dark = mix(col, "#2a2418", grime);
      const cool = 0.85 + 0.15 * smoothstep(-0.8, 0.6, n.y);
      return [dark[0] * cool, dark[1] * cool, dark[2] * cool] as const;
    });
  const WALL = panelPaint("#bdb59d", "#9a947f", 0.62, 0.5, 3);
  const CAB = panelPaint("#7f8572", "#656b5a", 0.55, 0.7, 7);
  const LOCKER = panelPaint("#8d9084", "#70746a", 0.8, 0.95, 9);
  const STEELP = paint((p, n) => {
    const s = noise(p, 0.05, 2);
    const c = mix(STEEL_D, "#d4d9db", smoothstep(0.2, 0.8, s) * 0.8);
    const sh = 0.8 + 0.2 * smoothstep(-0.5, 0.9, n.y);
    return [c[0] * sh, c[1] * sh, c[2] * sh] as const;
  });
  const FLOOR = paint((p) => {
    const gx = (p.x / 0.08) - Math.floor(p.x / 0.08), gz = (p.z / 0.08) - Math.floor(p.z / 0.08);
    const hole = gx > 0.15 && gx < 0.85 && gz > 0.15 && gz < 0.85;
    const g = noise(p, 0.3, 5);
    return hole ? mix("#1d1e1d", "#2c2c2a", g) : mix("#55564f", "#7a7a70", g);
  });
  const PIPE = paint((p, n) => {
    const c = mix("#8e9094", "#b8b9b0", noise(p, 0.15, 12));
    const g = smoothstep(0.5, 0.9, noise(p, 0.08, 14)) * 0.4;
    const d = mix(c, "#2a2a22", g);
    const sh = 0.8 + 0.2 * smoothstep(-0.5, 0.9, n.y);
    return [d[0] * sh, d[1] * sh, d[2] * sh] as const;
  });
  const PIPE_O = paint((p, n) => {
    const c = mix("#c26a1c", "#e08a30", noise(p, 0.2, 21));
    const sh = 0.8 + 0.2 * smoothstep(-0.5, 0.9, n.y);
    return [c[0] * sh, c[1] * sh, c[2] * sh] as const;
  });

  // ---------- textures ----------
  const hazard = svg(`<svg viewBox="0 0 160 8" xmlns="http://www.w3.org/2000/svg"><rect width="160" height="8" fill="#d9b72a"/>${Array.from({ length: 20 }, (_, i) => `<path d="M${i * 8} 8 L${i * 8 + 4} 0 L${i * 8 + 8} 0 L${i * 8 + 4} 8Z" fill="#161616"/>`).join("")}</svg>`, { size: 512 });
  const sign = svg(`<svg viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="40" rx="3" fill="#2b2b28"/><rect x="3" y="3" width="194" height="34" rx="2" fill="none" stroke="#d9791f" stroke-width="2"/><text x="100" y="28" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="24" fill="#e8dfc4">GALLEY</text><rect x="8" y="8" width="14" height="6" fill="#d9791f"/><rect x="178" y="8" width="14" height="6" fill="#d9791f"/></svg>`, { size: 512 });
  const crt = svg(`<svg viewBox="0 0 120 90" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="90" fill="#041208"/><g font-family="monospace" font-size="7" fill="#6dff8f"><text x="6" y="14">MU/TH/UR 6000</text><text x="6" y="26">INTERFACE 2037</text><text x="6" y="38">READY FOR INQUIRY</text><text x="6" y="56">GALLEY STORES: OK</text><text x="6" y="66">COFFEE: 62%</text><text x="6" y="80">&gt;_</text></g><path d="M0 0H120V90H0Z" fill="none" stroke="#1d5a2e" stroke-width="3"/><g stroke="#0c3a1a" stroke-width="0.6">${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${i * 5} H120"/>`).join("")}</g></svg>`, { size: 256 });
  const label = svg(`<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"><rect x="6" y="6" width="68" height="30" fill="#e8dfc4"/><text x="40" y="20" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="9" fill="#222">COLD STORE</text><text x="40" y="31" text-anchor="middle" font-family="monospace" font-size="7" fill="#a8342a">SECTOR 2B</text><rect x="6" y="46" width="68" height="6" fill="#d9791f"/><rect x="6" y="58" width="30" height="30" fill="none" stroke="#222" stroke-width="2"/><path d="M10 84 L21 62 L32 84Z" fill="#d9b72a" stroke="#222" stroke-width="1.5"/><text x="21" y="82" text-anchor="middle" font-size="12" font-weight="bold" fill="#222">!</text></svg>`, { size: 256 });
  const keypad = svg(`<svg viewBox="0 0 120 80" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="80" rx="4" fill="#3a3c38"/>${Array.from({ length: 16 }, (_, i) => { const x = 10 + (i % 4) * 16, y = 12 + Math.floor(i / 4) * 12; const c = ["#d9791f", "#e8dfc4", "#a8342a", "#d9b72a"][i % 4]; return `<rect x="${x}" y="${y}" width="12" height="8" rx="1" fill="${c}" stroke="#111" stroke-width="1"/>`; }).join("")}<rect x="78" y="12" width="34" height="20" fill="#06180c" stroke="#111" stroke-width="2"/><text x="82" y="26" font-family="monospace" font-size="9" fill="#6dff8f">0472</text><circle cx="92" cy="52" r="8" fill="#222" stroke="#aaa" stroke-width="2"/><path d="M92 52 L96 46" stroke="#d9791f" stroke-width="2"/><text x="10" y="74" font-family="monospace" font-size="7" fill="#e8dfc4">GALLEY ENV CTRL</text></svg>`, { size: 256 });
  const menu = svg(`<svg viewBox="0 0 60 80" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="80" fill="#e8dfc4"/><rect x="0" y="0" width="60" height="10" fill="#2b2b28"/><text x="30" y="8" text-anchor="middle" font-family="monospace" font-size="7" fill="#e8dfc4">RATIONS</text><g font-family="monospace" font-size="5" fill="#222"><text x="4" y="22">PROTEIN BAR</text><text x="4" y="32">SYNTH EGG</text><text x="4" y="42">NOODLES</text><text x="4" y="52">COFFEE</text><text x="4" y="62">COFFEE</text><text x="4" y="72">COFFEE</text></g></svg>`, { size: 256 });

  // ---------- helpers ----------
  const B = (w: number, h: number, d: number, x: number, y: number, z: number, c: any, o: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], ...o });
  const Cy = (r: number, h: number, x: number, y: number, z: number, c: any, seg = 12, o: any = {}) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), c, { at: [x, y, z], ...o });
  const CyX = (r: number, len: number, x: number, y: number, z: number, c: any, seg = 10) =>
    Cy(r, len, x, y, z, c, seg, { dir: [1, 0, 0] });
  const Pl = (w: number, h: number, x: number, y: number, z: number, tex: any, dir: number[] = [0, 0, 1]) =>
    b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir, axis: "z", texture: tex });
  const bolt = (x: number, y: number, z: number, dir: number[]) =>
    b.part(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 6), STEEL_D, { at: [x, y, z], dir });
  const bar = (x: number, y: number, z: number, vertical = false) =>
    vertical ? B(0.02, 0.18, 0.025, x, y, z, STEEL) : B(0.16, 0.02, 0.025, x, y, z, STEEL);

  const FT = 0.06; // floor top
  // ---------- shell ----------
  B(3.5, FT, 2.5, 0, FT / 2, 0.1, FLOOR);
  B(3.5, 2.55, 0.1, 0, FT + 1.275, -1.05, WALL);
  B(0.1, 2.55, 2.5, 1.75, FT + 1.275, 0.1, WALL);
  // skirting
  B(3.4, 0.1, 0.03, 0, FT + 0.05, -0.985, DARK);
  B(0.03, 0.1, 2.3, 1.685, FT + 0.05, 0.1, DARK);
  // ceiling beam + lights
  B(3.5, 0.1, 0.9, 0, 2.56, -0.55, WALL);
  Pl(3.2, 0.07, 0, 2.53, -0.099, hazard);
  for (const z of [-0.35, -0.8]) {
    B(2.6, 0.03, 0.12, 0, 2.485, z, DARK);
    glow(B(2.5, 0.02, 0.09, 0, 2.47, z, "#fff0cc"), 1.4);
  }
  Pl(0.6, 0.12, -0.85, 2.32, -0.995, sign);
  // ceiling pipes
  b.rod([-1.7, 2.44, -0.95], [1.7, 2.44, -0.95], 0.045, PIPE);
  b.rod([-1.7, 2.34, -0.92], [1.7, 2.34, -0.92], 0.03, PIPE_O);
  for (const x of [-1.3, -0.4, 0.5, 1.3]) {
    CyX(0.062, 0.05, x, 2.44, -0.95, STEEL_D);
    CyX(0.045, 0.04, x, 2.34, -0.92, DARK);
  }
  // vertical corner pipes
  b.rod([1.62, FT, -0.93], [1.62, 2.5, -0.93], 0.05, PIPE);
  b.rod([1.5, FT, -0.95], [1.5, 2.5, -0.95], 0.025, PIPE_O);
  for (const y of [0.4, 1.0, 1.6, 2.2]) {
    Cy(0.066, 0.05, 1.62, y, -0.93, STEEL_D);
    Cy(0.038, 0.04, 1.5, y, -0.95, DARK);
  }

  // ---------- counter ----------
  const CX = -0.55;
  B(2.2, 0.84, 0.6, CX, FT + 0.42, -0.7, CAB);
  B(2.3, 0.04, 0.66, CX, 0.92, -0.69, STEELP);
  B(2.3, 0.03, 0.03, CX, 0.915, -0.36, STEEL_D);
  B(2.2, 0.08, 0.02, CX, FT + 0.04, -0.39, DARK);
  [-1.38, -0.84, -0.3, 0.24].forEach((x, i) => {
    B(0.5, 0.7, 0.02, x, 0.5, -0.39, CAB);
    B(0.5, 0.01, 0.022, x, 0.5, -0.39, DARK);
    bar(x + 0.18, 0.68, -0.37, false);
    bolt(x - 0.2, 0.8, -0.38, [0, 0, 1]);
    bolt(x + 0.2, 0.8, -0.38, [0, 0, 1]);
    if (i % 2 === 0) B(0.1, 0.04, 0.005, x, 0.3, -0.378, YELLOW);
  });
  // sink
  const SX = -1.1;
  B(0.52, 0.025, 0.4, SX, 0.935, -0.68, STEEL);
  B(0.44, 0.03, 0.32, SX, 0.93, -0.68, "#44484a");
  Cy(0.02, 0.28, SX, 1.08, -0.92, STEEL, 8);
  b.rod([SX, 1.2, -0.92], [SX, 1.2, -0.76], 0.016, STEEL);
  Cy(0.03, 0.03, SX + 0.12, 0.96, -0.92, RED, 8);
  Cy(0.03, 0.03, SX - 0.12, 0.96, -0.92, "#2f5ea8", 8);
  // stove
  const GX = -0.4;
  B(0.64, 0.035, 0.5, GX, 0.955, -0.68, DARK);
  [[-0.15, -0.12], [0.15, -0.12], [-0.15, 0.1], [0.15, 0.1]].forEach(([dx, dz], i) => {
    const bx = GX + dx, bz = -0.68 + dz * 1.1;
    Cy(0.085, 0.02, bx, 0.98, bz, "#3d3d3a", 14);
    Cy(0.045, 0.012, bx, 0.992, bz, i === 1 ? "#ff7a1a" : "#252523", 10);
    if (i === 1) glow(Cy(0.045, 0.014, bx, 0.993, bz, "#ff6a10", 10), 1.8);
    Cy(0.014, 0.03, GX + dx, 0.99, -0.39 + 0.0, "#000", 6, { at: [GX + dx, 0.82, -0.375], dir: [0, 0, 1] });
  });
  // stove knobs on a strip
  B(0.64, 0.07, 0.03, GX, 0.98, -0.43, STEEL_D);
  [-0.24, -0.08, 0.08, 0.24].forEach((dx) => Cy(0.022, 0.03, GX + dx, 0.98, -0.41, ORANGE, 8, { dir: [0, 0, 1] }));
  // pot on stove
  b.lathe([[0, 0], [0.1, 0], [0.115, 0.15], [0.098, 0.15], [0.092, 0.03], [0, 0.03]], { at: [GX + 0.15, 1.0, -0.77], color: STEELP, segments: 12 });
  B(0.12, 0.015, 0.02, GX + 0.15 + 0.17, 1.12, -0.77, DARK);
  // coffee machine
  const MX = 0.27;
  B(0.3, 0.4, 0.3, MX, 0.94 + 0.2, -0.78, "#8e9185");
  B(0.3, 0.07, 0.32, MX, 0.94 + 0.43, -0.78, DARK);
  B(0.26, 0.04, 0.2, MX, 1.0, -0.62, STEEL_D);
  b.part(new THREE.CylinderGeometry(0.05, 0.045, 0.14, 10), "#b8a58a", { at: [MX, 1.09, -0.62] });
  glow(B(0.04, 0.02, 0.005, MX + 0.08, 1.2, -0.625, AMBER), 2);
  glow(B(0.025, 0.02, 0.005, MX - 0.08, 1.2, -0.625, GREEN), 2);
  Cy(0.02, 0.03, MX, 1.34, -0.62, STEEL_D, 8);

  // ---------- overhead cabinets ----------
  [-1.38, -0.83, -0.28].forEach((x, i) => {
    B(0.55, 0.62, 0.36, x, 1.86, -0.82, CAB);
    B(0.5, 0.56, 0.02, x, 1.86, -0.63, CAB);
    B(0.5, 0.012, 0.025, x, 1.86, -0.635, DARK);
    bar(x + 0.2, 1.68, -0.61, false);
    B(0.12, 0.05, 0.005, x - 0.15, 2.08, -0.62, i === 1 ? RED : YELLOW);
  });
  // utensil rail
  b.rod([-1.6, 1.38, -0.94], [0.0, 1.38, -0.94], 0.012, STEEL);
  [-1.55, -0.8, -0.02].forEach((x) => B(0.02, 0.05, 0.06, x, 1.38, -0.96, STEEL_D));
  [-1.4, -1.2, -1.0, -0.75, -0.55].forEach((x, i) => {
    b.rod([x, 1.38, -0.94], [x, 1.38 - 0.22 - (i % 2) * 0.06, -0.94], 0.007, STEEL);
    b.part(new THREE.SphereGeometry(0.035, 6, 4), i % 2 ? STEEL : "#5a3a22", { at: [x, 1.14 - (i % 2) * 0.06, -0.94], scale: [1, 1.2, 0.4] });
  });

  // ---------- monitor ----------
  const MON = [0.6, 1.72, -0.85];
  B(0.46, 0.4, 0.3, MON[0] - 0.02, MON[1], MON[2] - 0.0, "#8a8e82");
  B(0.5, 0.44, 0.04, MON[0] - 0.02, MON[1], -0.7, DARK);
  B(0.4, 0.34, 0.04, MON[0] - 0.02, MON[1], -0.69, "#232422");
  glow(Pl(0.34, 0.26, MON[0] - 0.02, MON[1] + 0.01, -0.66, crt), 1.1);
  B(0.03, 0.03, 0.005, MON[0] + 0.15, MON[1] - 0.17, -0.67, RED);
  glow(B(0.02, 0.02, 0.005, MON[0] + 0.1, MON[1] - 0.17, -0.67, GREEN), 2);
  Pl(0.14, 0.18, 0.46, 1.25, -0.99, menu);
  // vent
  B(0.22, 0.28, 0.03, 0.62, 1.2, -0.985, DARK);
  for (let i = 0; i < 7; i++) B(0.2, 0.012, 0.03, 0.62, 1.1 + i * 0.035, -0.965, STEEL_D, { rotation: [-25, 0, 0] });

  // ---------- cold locker ----------
  B(0.8, 1.9, 0.6, 1.2, FT + 0.95, -0.7, LOCKER);
  B(0.74, 1.8, 0.02, 1.2, FT + 0.95, -0.39, LOCKER);
  B(0.74, 0.01, 0.025, 1.2, 1.0, -0.38, DARK);
  B(0.03, 0.4, 0.04, 1.5 - 0.02, 1.0, -0.36, STEEL);
  Pl(0.22, 0.27, 1.05, 1.6, -0.378, label);
  glow(B(0.04, 0.04, 0.01, 1.5 - 0.1, 1.9, -0.38, GREEN), 2);
  for (const y of [0.3, 1.7]) {
    B(0.74, 0.04, 0.025, 1.2, y, -0.375, YELLOW);
  }
  // control panel on left wall
  B(0.04, 0.4, 0.55, 1.68, 1.42, 0.2, DARK);
  Pl(0.5, 0.34, 1.655, 1.42, 0.2, keypad, [-1, 0, 0]);
  // cables
  b.sweep(catmull([[1.4, 2.5, -0.95], [1.35, 2.2, -0.9], [1.45, 1.9, -0.6], [1.66, 1.6, -0.1], [1.68, 1.45, 0.1]]), 0.014, { color: BLACK });
  b.sweep(catmull([[0.2, 2.34, -0.9], [0.3, 2.15, -0.88], [0.6, 1.96, -0.88], [0.6, 1.95, -0.85]]), 0.012, { color: "#4a1e18" });

  // ---------- mess table ----------
  const TX = -0.3, TZ = 0.6;
  B(1.4, 0.05, 0.72, TX, 0.78, TZ, STEELP);
  B(1.46, 0.025, 0.78, TX, 0.75, TZ, DARK);
  Cy(0.07, 0.7, TX, 0.4, TZ, STEEL_D, 8);
  Cy(0.28, 0.04, TX, FT + 0.02, TZ, DARK, 12);
  Cy(0.13, 0.03, TX, FT + 0.055, TZ, STEEL_D, 8);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) bolt(TX + sx * 0.68, 0.81, TZ + sz * 0.33, [0, 1, 0]);
  [[-1.0, 0.6], [0.4, 0.6], [-0.3, 1.25]].forEach(([x, z]) => {
    Cy(0.18, 0.06, x, 0.5, z, CUSHION, 10);
    Cy(0.19, 0.02, x, 0.46, z, DARK, 10);
    Cy(0.03, 0.4, x, 0.27, z, STEEL_D, 8);
    Cy(0.2, 0.03, x, FT + 0.015, z, DARK, 10);
  });
  // table items
  B(0.5, 0.02, 0.3, TX - 0.2, 0.815, TZ + 0.05, "#58605a");
  B(0.5, 0.02, 0.01, TX - 0.2, 0.835, TZ + 0.2, "#6c746c");
  b.lathe([[0, 0], [0.07, 0], [0.09, 0.04], [0.075, 0.04], [0.06, 0.015], [0, 0.015]], { at: [TX - 0.2, 0.825, TZ + 0.05], color: CUP, segments: 10 });
  B(0.12, 0.015, 0.06, TX - 0.35, 0.833, TZ + 0.06, "#b89a5a");
  [[0.25, -0.1], [0.4, 0.12], [0.5, -0.15]].forEach(([dx, dz], i) => {
    b.part(new THREE.CylinderGeometry(0.036, 0.03, 0.08, 8), i === 1 ? ORANGE : CUP, { at: [TX + dx, 0.845, TZ + dz] });
    glow(Cy(0.028, 0.004, TX + dx, 0.885, TZ + dz, "#3a1d10", 8), 0.2);
  });
  for (const dx of [0.1, 0.15]) Cy(0.018, 0.06, TX + dx + 0.2, 0.835, TZ + 0.28, dx > 0.1 ? DARK : WHITE, 6);
  // floor hazard strip
  Pl(2.4, 0.05, -0.2, FT + 0.002, -0.33, hazard, [0, 1, 0]);

  // bolts on wall panels
  for (let i = 0; i < 10; i++) bolt(-1.6 + i * 0.35 + R() * 0.02, 1.45, -0.995, [0, 0, 1]);

  return b.root;
}
