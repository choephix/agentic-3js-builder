import * as THREE from "three";
import { createBuilder, rng } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden Diorama",
  description:
    "Square-based garden with a red arched bridge over a koi pond, three koi, stone lantern, cloud-pruned pine, blossoming cherry with falling petals, raked gravel with mossy rocks and stepping stones.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "garden" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);
  const D = 180 / Math.PI;

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: at as any, rotation: rot as any });
  const sph = (r: number, color: string, at: number[], scale?: number[], flat = false) =>
    b.part(new THREE.SphereGeometry(r, 8, 6), color, { at: at as any, scale: scale as any, flat });
  const cyl = (rt: number, rb: number, h: number, seg: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(rt, rb, h, seg), color, { at: at as any, rotation: rot as any });

  // ---------- base ----------
  const wood = "#5a3a22";
  box(1.2, 0.06, 1.2, wood, [0, 0.03, 0]);
  box(1.14, 0.02, 1.14, "#6f9a4a", [0, 0.07, 0]);
  box(1.2, 0.095, 0.03, "#7a5232", [0, 0.0475, 0.585]);
  box(1.2, 0.095, 0.03, "#7a5232", [0, 0.0475, -0.585]);
  box(0.03, 0.095, 1.14, "#7a5232", [0.585, 0.0475, 0]);
  box(0.03, 0.095, 1.14, "#7a5232", [-0.585, 0.0475, 0]);
  // grass tufts and moss mounds
  for (let i = 0; i < 14; i++) {
    const x = (R() - 0.5) * 1.05;
    const z = (R() - 0.5) * 1.05;
    if (Math.abs(x) < 0.45 && z > -0.35 && z < 0.27) continue;
    if (x < -0.05 && z > 0.27) continue;
    if (x > 0.4 && z > 0.05) continue;
    sph(0.018 + R() * 0.02, i % 2 ? "#5d8c3c" : "#7fae52", [x, 0.08, z], [1, 0.5, 1], true);
  }

  // ---------- pond ----------
  const zc = -0.05;
  b.part(new THREE.CylinderGeometry(0.28, 0.28, 0.012, 20), "#3f8fa8", { at: [0, 0.08, zc], scale: [1.3, 1, 1] });
  b.part(new THREE.CylinderGeometry(0.2, 0.2, 0.002, 16), "#58a8bf", { at: [0.05, 0.0865, zc - 0.02], scale: [1.3, 1, 0.9] });
  const grays = ["#8d8d88", "#a0a09a", "#76766f", "#94948c"];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const x = Math.cos(a) * 0.385;
    const z = zc + Math.sin(a) * 0.3;
    if (Math.abs(z - zc) < 0.1 && Math.abs(x) > 0.2) continue;
    const s = 0.028 + R() * 0.014;
    b.part(new THREE.DodecahedronGeometry(s, 0), grays[i % 4], {
      at: [x, 0.085, z],
      scale: [1.2, 0.6, 1],
      rotation: [0, R() * 180, 0],
      flat: true,
    });
    if (i % 3 === 0) sph(s * 0.7, "#5e8f3a", [x, 0.085 + s * 0.45, z], [1.1, 0.35, 0.9], true);
  }
  // lily pads
  [[-0.17, 0.12, 0.03], [0.2, -0.17, 0.028], [-0.05, -0.22, 0.022]].forEach(([x, z, r], i) => {
    b.part(new THREE.CylinderGeometry(r, r, 0.003, 7), "#4f9a45", { at: [x, 0.0885, z + zc * 0 ] });
    if (i === 0) {
      sph(0.012, "#f7b6cc", [x + 0.005, 0.096, z], [1, 0.8, 1], true);
      sph(0.007, "#fde7ee", [x + 0.005, 0.1, z], [1, 1, 1], true);
    }
  });

  // ---------- koi ----------
  const koi = (cx: number, cz: number, ang: number, cols: string[]) => {
    const c = Math.cos(ang);
    const s = Math.sin(ang);
    const P = (x: number, z: number, y = 0.09) => new THREE.Vector3(cx + x * c + z * s, y, cz - x * s + z * c);
    const pts = [P(0, 0.07), P(0.012, 0.03), P(-0.012, -0.02), P(0, -0.065)];
    b.sweep(pts, (t: number) => {
      const r = t < 0.25 ? 0.009 + 0.02 * t : 0.014 * (1 - (t - 0.25) / 0.75) + 0.003;
      return [r, r * 0.9];
    }, {
      bands: [[0.22, cols[0]], [0.5, cols[1]], [0.78, cols[2]], [1, cols[3]]],
      sides: 6,
      caps: "round",
    });
    const dir = pts[1].clone().sub(pts[3]).normalize();
    b.part(new THREE.ConeGeometry(0.022, 0.04, 4), "#ffe9d6", {
      at: pts[3].clone().addScaledVector(dir, -0.012),
      dir,
      up: [0, 1, 0],
      scale: [0.12, 1, 1],
    });
    b.part(new THREE.BoxGeometry(0.003, 0.012, 0.025), "#ff8a2a", { at: P(0, 0.0, 0.102), rotation: [0, ang * D, 0] });
    for (const sd of [-1, 1]) {
      sph(0.003, "#111111", P(sd * 0.008, 0.06, 0.097).toArray());
      box(0.022, 0.002, 0.012, "#ffd2b0", P(sd * 0.016, 0.035, 0.087).toArray(), [0, ang * D + sd * 35, 0]);
    }
    b.part(new THREE.TorusGeometry(0.055, 0.0015, 3, 20), "#8fd0e0", {
      at: [cx, 0.0875, cz],
      rotation: [90, 0, 0],
    });
  };
  koi(-0.1, 0.1 + zc, 0.8, ["#ff7a1c", "#fff6ec", "#ff7a1c", "#fff6ec"]);
  koi(0.15, -0.1 + zc, 3.9, ["#fff6ec", "#ff7a1c", "#fff6ec", "#ff9a3c"]);
  koi(-0.2, -0.12 + zc, 2.2, ["#ff6a14", "#ff6a14", "#fff6ec", "#ff9a3c"]);

  // ---------- bridge ----------
  const by = (x: number) => 0.097 + 0.12 * (1 - (x / 0.42) ** 2);
  const bz = zc;
  const xs = [-0.42, -0.3, -0.15, 0, 0.15, 0.3, 0.42];
  const deck = xs.map((x) => new THREE.Vector3(x, by(x), bz));
  b.sweep(deck, { radius: [0.068, 0.013], section: "box", caps: "flat", color: "#b3201a" });
  for (let i = 0; i < 12; i++) {
    const x = -0.39 + i * 0.071;
    const slope = Math.atan((-2 * 0.12 * x) / 0.42 ** 2) * D;
    box(0.032, 0.006, 0.15, "#8f2a1c", [x, by(x) + 0.0145, bz], [0, 0, slope]);
  }
  for (const sd of [-1, 1]) {
    const z = bz + sd * 0.07;
    const rail = xs.map((x) => new THREE.Vector3(x, by(x) + 0.09, z));
    b.sweep(rail, { radius: 0.01, sides: 6, color: "#d02a20", caps: "round" });
    const low = xs.map((x) => new THREE.Vector3(x, by(x) + 0.045, z));
    b.sweep(low, { radius: 0.005, sides: 5, color: "#9a1c16", caps: "round" });
    [-0.4, -0.2, 0, 0.2, 0.4].forEach((x) => {
      box(0.02, 0.09, 0.02, "#c4251c", [x, by(x) + 0.045, z]);
      if (Math.abs(x) > 0.3) sph(0.016, "#e8b64a", [x, by(x) + 0.1, z]);
    });
    // underside arch beam
    b.sweep(xs.map((x) => new THREE.Vector3(x, by(x) - 0.03, z)), {
      radius: [0.01, 0.014], section: "box", color: "#7e1812", caps: "flat",
    });
  }
  for (const sx of [-1, 1]) box(0.05, 0.03, 0.17, "#6b6b66", [sx * 0.44, 0.09, bz]);

  // ---------- stepping stones ----------
  [[0.52, 0.5], [0.46, 0.4], [0.51, 0.3], [0.46, 0.2], [0.5, 0.1]].forEach(([x, z], i) => {
    b.part(new THREE.CylinderGeometry(0.04, 0.045, 0.02, 6), i % 2 ? "#9b9b94" : "#85857e", {
      at: [x, 0.09, z],
      rotation: [0, R() * 60, 0],
      scale: [1, 1, 0.85],
    });
    sph(0.015, "#5e8f3a", [x + 0.015, 0.1, z - 0.01], [1, 0.3, 1], true);
  });

  // ---------- gravel ----------
  box(0.5, 0.012, 0.28, "#f1efe6", [-0.32, 0.086, 0.43]);
  for (const z of [0.29, 0.57]) box(0.52, 0.016, 0.014, "#8c8a80", [-0.32, 0.088, z - (z > 0.4 ? 0.01 : -0.005)]);
  for (const x of [-0.575, -0.065]) box(0.014, 0.016, 0.3, "#8c8a80", [x + (x > -0.3 ? -0.0 : 0.0), 0.088, 0.43]);
  for (let i = 0; i < 4; i++) box(0.46, 0.003, 0.004, "#d1cec2", [-0.32, 0.0925, 0.34 + i * 0.045]);
  for (const r of [0.095, 0.13])
    b.part(new THREE.TorusGeometry(r, 0.0035, 3, 18), "#cfccc0", { at: [-0.42, 0.093, 0.45], rotation: [90, 0, 0] });
  [[-0.42, 0.45, 0.06], [-0.2, 0.4, 0.04], [-0.5, 0.35, 0.03]].forEach(([x, z, s]) => {
    b.part(new THREE.DodecahedronGeometry(s, 0), "#7d7d76", {
      at: [x, 0.092 + s * 0.5, z], scale: [1.2, 0.85, 1], rotation: [0, R() * 90, 0], flat: true,
    });
    b.part(new THREE.IcosahedronGeometry(s * 0.7, 0), "#5d8c3c", {
      at: [x, 0.092 + s * 1.0, z], scale: [1.1, 0.4, 1], flat: true,
    });
    sph(s * 0.3, "#7fae52", [x + s * 0.5, 0.092 + s * 0.85, z + s * 0.2], [1, 0.5, 1], true);
  });

  // ---------- stone lantern ----------
  const lx = -0.46;
  const lz = -0.4;
  const y0 = 0.08;
  const st = "#9a9a92";
  box(0.1, 0.03, 0.1, "#85857e", [lx, y0 + 0.015, lz]);
  cyl(0.018, 0.022, 0.09, 6, st, [lx, y0 + 0.075, lz]);
  cyl(0.06, 0.05, 0.02, 6, "#8b8b84", [lx, y0 + 0.13, lz]);
  box(0.07, 0.07, 0.07, st, [lx, y0 + 0.175, lz]);
  box(0.074, 0.04, 0.04, "#ffd870", [lx, y0 + 0.175, lz]);
  box(0.04, 0.04, 0.074, "#ffd870", [lx, y0 + 0.175, lz]);
  cyl(0.001, 0.085, 0.05, 4, "#6e6e68", [lx, y0 + 0.235, lz], [0, 45, 0]);
  sph(0.014, st, [lx, y0 + 0.27, lz]);
  b.part(new THREE.ConeGeometry(0.008, 0.02, 6), st, { at: [lx, y0 + 0.292, lz] });
  sph(0.025, "#5e8f3a", [lx + 0.03, y0 + 0.03, lz + 0.04], [1.3, 0.4, 1], true);
  sph(0.02, "#6fa045", [lx - 0.03, y0 + 0.058, lz + 0.03], [1.2, 0.4, 1], true);

  // ---------- pine ----------
  const px = 0.42;
  const pz = -0.38;
  const trunk = [[0, 0], [0.012, 0.1], [-0.02, 0.2], [0.005, 0.3], [0.0, 0.4]].map(
    ([dx, h]) => new THREE.Vector3(px + dx, y0 + h - 0.0, pz),
  );
  b.sweep(trunk, { radius: [0.024, 0.008], sides: 6, color: "#5b4030", caps: "round" });
  const greens = ["#2f6b3a", "#3a7a43", "#285c33"];
  [[-0.08, 0.17, 0.02, 0.07], [0.08, 0.22, -0.02, 0.065], [-0.01, 0.3, 0.0, 0.085], [-0.04, 0.37, 0.03, 0.055], [0.0, 0.43, 0, 0.042]].forEach(
    ([dx, h, dz, r], i) => {
      b.rod([px + dx * 0.1, y0 + h - 0.04, pz], [px + dx * 0.8, y0 + h - 0.01, pz + dz], 0.005, { color: "#5b4030" });
      sph(r, greens[i % 3], [px + dx, y0 + h + 0.01, pz + dz], [1.2, 0.55, 1.1], true);
      sph(r * 0.6, greens[(i + 1) % 3], [px + dx + r * 0.4, y0 + h + r * 0.35, pz + dz - r * 0.2], [1.1, 0.55, 1], true);
    },
  );
  sph(0.025, "#5e8f3a", [px + 0.03, y0 + 0.01, pz + 0.03], [1.3, 0.4, 1], true);

  // ---------- cherry tree ----------
  const cx = -0.47;
  const cz = -0.1;
  const tr = [[0, 0], [0.02, 0.1], [0, 0.2], [0.04, 0.3]].map(
    ([dx, h]) => new THREE.Vector3(cx + dx, y0 + h, cz),
  );
  b.sweep(tr, { radius: [0.04, 0.017], sides: 6, color: "#4a3028", caps: "round" });
  const base = new THREE.Vector3(cx + 0.02, y0 + 0.22, cz);
  [[-0.12, 0.34, 0.06], [0.16, 0.36, 0.0], [0.04, 0.4, -0.11], [0.07, 0.33, 0.1]].forEach(([dx, h, dz]) => {
    b.rod(base, [cx + dx + 0.02, y0 + h, cz + dz], [0.016, 0.008], { color: "#4a3028", sides: 5 });
  });
  const pinks = ["#f6a9c0", "#f9c4d4", "#ee8fb0", "#fbd6e2"];
  for (let i = 0; i < 18; i++) {
    const a = R() * Math.PI * 2;
    const rr = 0.04 + R() * 0.13;
    const x = cx + 0.04 + Math.cos(a) * rr * 1.2;
    const z = cz + Math.sin(a) * rr * 0.9;
    const y = y0 + 0.38 + R() * 0.14 - rr * 0.25;
    b.part(new THREE.IcosahedronGeometry(0.06 + R() * 0.04, 1), pinks[i % 4], {
      at: [x, y, z], scale: [1, 0.8, 1], rotation: [R() * 90, R() * 90, 0], flat: true,
    });
  }
  // petals
  for (let i = 0; i < 55; i++) {
    const x = cx + 0.2 + (R() - 0.5) * 0.8;
    const z = (R() - 0.5) * 0.9;
    const falling = R() < 0.4;
    const y = falling ? 0.11 + R() * 0.3 : 0.097;
    if (x > 0.55 || x < -0.55) continue;
    b.part(new THREE.CylinderGeometry(0.01, 0.01, 0.002, 5), i % 3 ? "#f9c0d2" : "#fde3ec", {
      at: [x, y, z],
      rotation: [falling ? R() * 80 : 0, R() * 180, falling ? R() * 80 : 0],
      scale: [1, 1, 0.7],
    });
  }

  return b.root;
}
