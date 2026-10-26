import * as THREE from "three";
import { createBuilder, paint, noise, mix, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Nostromo Galley",
  description: "Alien (1979) style spaceship galley: grimy beige bulkhead, steel counter with hob and sink, fridge, CRT, mess table with stools, pipes and hazard markings.",
};

export default function build() {
  const b = createBuilder({ name: "galley" });
  const R = rng(5);

  // ---- palette & paints
  const STEEL = "#9a9ea0", DARK = "#2a2c2e", BLACK = "#111214", RUBBER = "#1d1e20";
  const BEIGE = "#c9bf9f";
  const wall = paint((p, n) => {
    const base: [number, number, number] = [0.78, 0.74, 0.62];
    const u = p.x / 0.5, v = p.y / 0.6;
    const du = (u - Math.floor(u)) * 0.5, dv = (v - Math.floor(v)) * 0.6;
    let k = 1 - 0.15 * noise(p, 0.3, 2);
    k *= 1 - 0.25 * smoothstep(0.5, 0.0, p.y) ; // grime near floor
    if (du < 0.006 || dv < 0.006) k *= 0.45;
    else if (du < 0.012 || dv < 0.012) k *= 1.07;
    const rivet = Math.hypot(du - 0.03, (dv % 0.1) - 0.05) < 0.005 && du < 0.06;
    if (rivet) k *= 0.6;
    if (n.z < 0.5) k *= 0.9;
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  const floorPaint = paint((p) => {
    const gx = Math.abs(((p.x / 0.08) % 1)), gz = Math.abs(((p.z / 0.08) % 1));
    const hole = (gx > 0.2 && gx < 0.8 && gz > 0.2 && gz < 0.8) ? 0.55 : 1;
    const g = (0.2 + 0.1 * noise(p, 0.2, 4)) * hole;
    return [g, g * 1.02, g * 1.05];
  });
  const steelP = paint((p, n) => {
    const s = 0.55 + 0.12 * noise(p, 0.05, 7) + 0.12 * smoothstep(0.5, 1, n.y);
    return [s * 0.97, s, s * 1.02];
  });
  const cab = paint((p) => {
    const k = 0.82 + 0.1 * noise(p, 0.15, 9) - 0.12 * smoothstep(0.4, 0, p.y);
    return [0.62 * k, 0.66 * k, 0.6 * k];
  });
  const rust = mix("#6b5a40", "#3b3226", 0.5);
  const pipeP = paint((p) => {
    const k = 0.8 + 0.2 * noise(p, 0.1, 3);
    return [0.55 * k, 0.5 * k, 0.4 * k];
  });

  // ---- textures
  const hazard = svg(`<svg viewBox="0 0 64 8" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="8" fill="#d8b52a"/>${Array.from({ length: 12 }, (_, i) => `<polygon points="${i * 6},8 ${i * 6 + 3},8 ${i * 6 + 8},0 ${i * 6 + 5},0" fill="#161616"/>`).join("")}</svg>`, { size: 256 });
  const sign = svg(`<svg viewBox="0 0 128 40" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="40" fill="#1a1c1e"/><rect x="2" y="2" width="124" height="36" fill="none" stroke="#c9bf9f" stroke-width="2"/><text x="64" y="26" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="18" fill="#e6dfc4">GALLEY</text></svg>`, { size: 512 });
  const screen = svg(`<svg viewBox="0 0 64 48" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="48" fill="#06140a"/><g font-family="monospace" font-size="5" fill="#5dff8a"><text x="4" y="9">MU/TH/UR 6000</text><text x="4" y="17">GALLEY SUPPLY</text><text x="4" y="25">FOOD STORES 74%</text><text x="4" y="33">WATER REC OK</text><text x="4" y="41">&gt; _</text></g><path d="M0 12H64M0 24H64M0 36H64" stroke="#0a3014" stroke-width="0.6"/></svg>`, { size: 384 });
  const label = svg(`<svg viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="24" fill="#e6dfc4"/><rect x="2" y="2" width="36" height="5" fill="#b8321f"/><text x="20" y="16" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="5" fill="#222">COLD STORE</text><text x="20" y="22" text-anchor="middle" font-family="monospace" font-size="3.5" fill="#222">-18 C  SECTOR 4</text></svg>`, { size: 256 });
  const dial = svg(`<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="15" fill="#e6dfc4" stroke="#111" stroke-width="2"/><path d="M16 16L24 8" stroke="#b8321f" stroke-width="2"/><circle cx="16" cy="16" r="2" fill="#111"/></svg>`, { size: 128 });

  // ---- helpers
  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: any) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z] });
  const cyl = (rt: number, rb: number, h: number, x: number, y: number, z: number, c: any, axis: "x" | "y" | "z" = "y", seg = 10) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), c, {
      at: [x, y, z],
      rotation: axis === "x" ? [0, 0, 90] : axis === "z" ? [90, 0, 0] : [0, 0, 0],
    });
  const plane = (w: number, h: number, x: number, y: number, z: number, tex: any, g = 0) => {
    const part = b.part(new THREE.PlaneGeometry(w, h), "#ffffff", { at: [x, y, z], dir: [0, 0, 1], axis: "z", texture: tex });
    if (g) glow(part, g);
    return part;
  };
  const handle = (x: number, y: number, z: number, len: number, vertical: boolean) => {
    const w = vertical ? 0.02 : len, h = vertical ? len : 0.02;
    box(w, h, 0.02, x, y, z, DARK);
  };
  const bolts = (xs: number[], ys: number[], z: number) => {
    for (const x of xs) for (const y of ys) cyl(0.008, 0.008, 0.008, x, y, z, "#55585a", "z", 6);
  };

  // ---- floor deck
  box(3.2, 0.05, 2.4, 0, 0.025, 0, floorPaint);
  box(3.2, 0.012, 0.01, 0, 0.056, -0.05, STEEL);
  b.part(new THREE.PlaneGeometry(3.0, 0.2), "#ffffff", { at: [0, 0.052, 0.95], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: hazard });
  b.part(new THREE.PlaneGeometry(1.2, 0.1), "#ffffff", { at: [-0.4, 0.052, -0.45], dir: [0, 1, 0], axis: "z", up: [0, 0, -1], texture: hazard });

  // ---- back bulkhead + side wall stubs
  box(3.2, 2.5, 0.08, 0, 1.3, -1.0, wall);
  box(0.08, 2.5, 1.2, -1.6, 1.3, -0.4, wall);
  for (const x of [-1.2, -0.4, 0.4, 1.2]) box(0.06, 2.45, 0.05, x, 1.28, -0.94, "#8c866f"); // ribs
  box(3.2, 0.1, 0.12, 0, 0.1, -0.95, DARK); // kick rail
  // ceiling beam & light
  box(3.2, 0.12, 0.3, 0, 2.5, -0.85, "#58584f");
  glow(box(1.4, 0.03, 0.18, -0.2, 2.43, -0.55, "#fff2c8"), 1.3);
  glow(box(1.2, 0.03, 0.18, 0.1, 2.43, 0.35, "#fff2c8"), 1.2);
  box(1.4, 0.02, 0.24, -0.2, 2.455, -0.55, DARK);
  box(1.2, 0.02, 0.24, 0.1, 2.455, 0.35, DARK);

  // ---- sign
  plane(0.5, 0.16, -0.3, 2.15, -0.955, sign, 0.3);

  // ---- pipes (overhead & vertical)
  for (let i = 0; i < 4; i++) {
    const y = 2.28 - i * 0.07, r = i === 0 ? 0.05 : 0.03;
    cyl(r, r, 3.1, 0, y, -0.9 + (i % 2) * 0.04, i % 2 ? pipeP : STEEL, "x", 10);
  }
  for (const x of [-1.5, -0.7, 0.2, 1.0, 1.5]) box(0.03, 0.2, 0.06, x, 2.2, -0.9, DARK);
  cyl(0.045, 0.045, 2.3, 1.45, 1.15, -0.9, pipeP, "y", 10);
  cyl(0.03, 0.03, 2.3, 1.35, 1.15, -0.91, STEEL, "y", 8);
  for (const y of [0.4, 1.0, 1.6]) { cyl(0.058, 0.058, 0.05, 1.45, y, -0.9, DARK, "y", 10); }
  // valve wheel
  cyl(0.06, 0.06, 0.012, 1.45, 1.3, -0.82, "#a23222", "z", 10);
  box(0.12, 0.012, 0.012, 1.45, 1.3, -0.82, "#a23222");
  box(0.012, 0.12, 0.012, 1.45, 1.3, -0.82, "#a23222");

  // ---- counter unit (left)
  const cx = -0.65, cz = -0.65;
  box(1.9, 0.82, 0.62, cx, 0.46, cz, cab);
  box(1.96, 0.05, 0.68, cx, 0.9, cz + 0.02, steelP);
  box(1.96, 0.02, 0.02, cx, 0.88, cz + 0.36, DARK);
  for (let i = 0; i < 4; i++) {
    const x = cx - 0.72 + i * 0.48;
    box(0.44, 0.7, 0.02, x, 0.46, cz + 0.32, "#7e8680");
    handle(x + 0.15, 0.6, cz + 0.34, 0.14, true);
    bolts([x - 0.18, x + 0.18], [0.16, 0.76], cz + 0.33);
  }
  // sink
  box(0.46, 0.02, 0.38, cx - 0.55, 0.93, cz + 0.02, BLACK);
  box(0.4, 0.01, 0.32, cx - 0.55, 0.945, cz + 0.02, "#5b5f62");
  cyl(0.015, 0.015, 0.25, cx - 0.55, 1.05, cz - 0.22, STEEL, "y", 8);
  b.sweep([[cx - 0.55, 1.17, cz - 0.22], [cx - 0.55, 1.2, cz - 0.15], [cx - 0.55, 1.12, cz - 0.08]], 0.012, { color: STEEL });
  // hob
  box(0.7, 0.02, 0.5, cx + 0.35, 0.93, cz + 0.03, DARK);
  for (const [ox, oz] of [[-0.16, -0.1], [0.16, -0.1], [-0.16, 0.12], [0.16, 0.12]]) {
    cyl(0.1, 0.1, 0.012, cx + 0.35 + ox, 0.945, cz + oz, "#ff5a1a", "y", 12).mesh;
    glow(b.part(new THREE.TorusGeometry(0.075, 0.012, 5, 14), "#ff7a2a", { at: [cx + 0.35 + ox, 0.955, cz + oz], dir: [0, 1, 0], axis: "z" }), 1.6);
  }
  for (let i = 0; i < 4; i++) cyl(0.02, 0.02, 0.025, cx + 0.2 + i * 0.1, 0.8, cz + 0.33, DARK, "z", 8);
  // pot and pan on hob
  cyl(0.12, 0.1, 0.14, cx + 0.19, 1.02, cz - 0.1, STEEL, "y", 10);
  cyl(0.125, 0.125, 0.015, cx + 0.19, 1.098, cz - 0.1, "#777b7d", "y", 10);
  box(0.16, 0.015, 0.03, cx + 0.38, 1.1, cz - 0.1, DARK);
  cyl(0.11, 0.1, 0.04, cx + 0.51, 0.98, cz + 0.12, DARK, "y", 10);
  box(0.2, 0.015, 0.03, cx + 0.7, 0.99, cz + 0.12, DARK);
  // extractor hood
  b.part(new THREE.CylinderGeometry(0.2, 0.42, 0.28, 4, 1), STEEL, { at: [cx + 0.35, 1.7, cz - 0.08], rotation: [0, 45, 0], flat: true, scale: [1, 1, 0.7] });
  cyl(0.06, 0.06, 0.5, cx + 0.35, 2.05, cz - 0.2, STEEL, "y", 8);

  // ---- wall cabinets
  for (let i = 0; i < 3; i++) {
    const x = cx - 0.7 + i * 0.5 - 0.05;
    if (i === 2) continue;
    box(0.48, 0.55, 0.3, x, 1.75, -0.78, cab);
    box(0.42, 0.48, 0.02, x, 1.75, -0.62, "#80887f");
    handle(x + 0.15, 1.65, -0.6, 0.12, true);
    bolts([x - 0.18, x + 0.18], [1.52, 1.98], -0.61);
  }
  // hanging mugs on rail
  cyl(0.01, 0.01, 0.9, cx - 0.1, 1.38, -0.93, STEEL, "x", 6);
  for (let i = 0; i < 5; i++) {
    const x = cx - 0.45 + i * 0.17;
    cyl(0.04, 0.035, 0.08, x, 1.31, -0.9, i % 2 ? "#d8d2bc" : "#8a8f93", "y", 8);
    b.part(new THREE.TorusGeometry(0.025, 0.006, 4, 8), STEEL, { at: [x + 0.045, 1.31, -0.9], dir: [0, 0, 1], axis: "z" });
    box(0.008, 0.06, 0.008, x, 1.4, -0.9, DARK);
  }
  // utensils
  for (let i = 0; i < 4; i++) {
    box(0.015, 0.2, 0.006, cx + 0.2 + i * 0.1, 1.28 - 0.0, -0.93, STEEL);
    cyl(0.025, 0.025, 0.02, cx + 0.2 + i * 0.1, 1.15, -0.925, STEEL, "z", 8);
  }
  box(0.5, 0.02, 0.03, cx + 0.35, 1.4, -0.93, DARK);

  // ---- fridge
  const fx = 0.78;
  box(0.7, 1.9, 0.65, fx, 1.0, -0.62, cab);
  box(0.66, 1.85, 0.03, fx, 1.0, -0.3, "#868e86");
  box(0.64, 0.02, 0.035, fx, 1.35, -0.29, DARK);
  handle(fx + 0.26, 1.15, -0.27, 0.3, true);
  handle(fx + 0.26, 1.65, -0.27, 0.2, true);
  plane(0.28, 0.17, fx - 0.12, 1.75, -0.272, label);
  plane(0.1, 0.1, fx - 0.15, 1.5, -0.272, dial);
  bolts([fx - 0.3, fx + 0.3], [0.15, 1.9], -0.275);
  box(0.7, 0.05, 0.65, fx, 1.97, -0.62, DARK);

  // ---- CRT monitor on wall arm
  const mx = 1.35, my = 1.55;
  box(0.1, 0.1, 0.2, mx, my, -0.88, DARK);
  box(0.4, 0.34, 0.1, mx, my, -0.74, "#a29c84");
  b.part(new THREE.CylinderGeometry(0.1, 0.17, 0.2, 4), "#8f8a74", { at: [mx, my, -0.88], rotation: [90, 45, 0], flat: true, scale: [1, 1, 0.9] });
  box(0.34, 0.28, 0.02, mx, my, -0.68, BLACK);
  plane(0.3, 0.225, mx, my, -0.668, screen, 1.3);
  for (let i = 0; i < 3; i++) cyl(0.012, 0.012, 0.01, mx - 0.12 + i * 0.05, my - 0.145, -0.68, i === 0 ? "#b8321f" : "#444", "z", 6);

  // ---- table
  const tz = 0.25;
  box(1.5, 0.05, 0.78, 0, 0.78, tz, steelP);
  box(1.54, 0.03, 0.82, 0, 0.745, tz, DARK);
  cyl(0.07, 0.09, 0.72, -0.4, 0.38, tz, DARK, "y", 8);
  cyl(0.07, 0.09, 0.72, 0.4, 0.38, tz, DARK, "y", 8);
  box(1.0, 0.04, 0.5, 0, 0.05, tz, DARK);
  // trays & food
  for (const x of [-0.45, 0.45]) {
    box(0.4, 0.015, 0.28, x, 0.81, tz + 0.1, "#6a6e70");
    box(0.38, 0.03, 0.01, x, 0.83, tz + 0.235, "#6a6e70");
    box(0.38, 0.03, 0.01, x, 0.83, tz - 0.035, "#6a6e70");
    box(0.01, 0.03, 0.28, x - 0.195, 0.83, tz + 0.1, "#6a6e70");
    box(0.01, 0.03, 0.28, x + 0.195, 0.83, tz + 0.1, "#6a6e70");
    cyl(0.07, 0.05, 0.03, x - 0.08, 0.835, tz + 0.1, "#c28a3a", "y", 8);
    cyl(0.06, 0.04, 0.03, x + 0.1, 0.835, tz + 0.1, "#7a3a2a", "y", 8);
  }
  for (const x of [-0.12, 0.05, 0.2]) cyl(0.035, 0.03, 0.09, x, 0.85, tz - 0.2, x === 0.05 ? "#d8d2bc" : "#8a8f93", "y", 8);
  cyl(0.04, 0.04, 0.2, -0.2, 0.9, tz - 0.1, "#7a8a5a", "y", 8); // bottle
  cyl(0.015, 0.015, 0.05, -0.2, 1.04, tz - 0.1, "#7a8a5a", "y", 6);
  box(0.06, 0.12, 0.06, 0.55, 0.88, tz - 0.25, "#c9bf9f"); // condiments
  cyl(0.025, 0.025, 0.1, 0.65, 0.85, tz - 0.25, "#b8321f", "y", 6);

  // ---- stools & benches
  for (const [sx, sz] of [[-0.55, 0.85], [0.0, 0.9], [0.55, 0.85], [-0.55, -0.35], [0.55, -0.4]]) {
    cyl(0.17, 0.17, 0.06, sx, 0.45, sz, RUBBER, "y", 10);
    cyl(0.17, 0.17, 0.02, sx, 0.485, sz, "#a23222", "y", 10);
    cyl(0.03, 0.04, 0.42, sx, 0.21, sz, STEEL, "y", 6);
    cyl(0.14, 0.16, 0.025, sx, 0.037, sz, DARK, "y", 8);
  }

  // ---- floor-standing bins / crates
  box(0.4, 0.38, 0.4, 1.35, 0.24, 0.1, rust);
  box(0.42, 0.04, 0.42, 1.35, 0.45, 0.1, DARK);
  box(0.4, 0.08, 0.02, 1.35, 0.3, 0.31, "#d8b52a");
  box(0.34, 0.3, 0.34, 1.3, 0.64, 0.12, "#6d7360");
  // trash chute
  box(0.3, 0.4, 0.06, 1.4, 0.95, -0.95, DARK);
  box(0.24, 0.3, 0.02, 1.4, 0.95, -0.91, "#2a2c2e");
  // caution marks on wall
  b.part(new THREE.PlaneGeometry(0.5, 0.06), "#ffffff", { at: [0.2, 1.0, -0.955], dir: [0, 0, 1], axis: "z", texture: hazard });
  // switch panel
  box(0.2, 0.28, 0.03, -1.45, 1.4, -0.94, DARK);
  for (let i = 0; i < 4; i++) {
    box(0.025, 0.04, 0.03, -1.5 + (i % 2) * 0.07, 1.5 - Math.floor(i / 2) * 0.1, -0.92, i === 1 ? "#d8b52a" : "#c9bf9f");
  }
  glow(cyl(0.012, 0.012, 0.01, -1.42, 1.3, -0.92, "#ff4a2a", "z", 6), 1.5);

  // ---- grime splatters (small flat decals)
  for (let i = 0; i < 10; i++) {
    const x = -1.4 + R() * 2.6, y = 0.3 + R() * 1.2;
    box(0.03 + R() * 0.05, 0.06 + R() * 0.12, 0.004, x, y, -0.955, "#4d4634");
  }

  return b.root;
}
