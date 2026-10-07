import * as THREE from "three";
import { createBuilder, rng, catmull, spots, stripes, mottle, countershade } from "../../../../src/index";

export const meta = {
  name: "Japanese Garden Diorama",
  description:
    "Square-based garden: red arched bridge over a koi pond with three koi, stone lantern, cloud-pruned pine, blossoming cherry with falling petals, raked gravel, mossy rocks and stepping stones.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "garden" });
  b.joint("root", { at: [0, 0, 0] });
  const R = rng(11);

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, color: any, rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at: [x, y, z], rotation: rot });
  const blob = (r: number, sx: number, sy: number, sz: number, x: number, y: number, z: number, color: any, detail = 1) =>
    b.part(new THREE.IcosahedronGeometry(r, detail), color, { at: [x, y, z], scale: [sx, sy, sz], flat: true });

  // ---------- base ----------
  box(1.0, 0.04, 1.0, 0, 0.02, 0, "#5a3a22");
  const wood = "#7a4e2c";
  box(1.0, 0.03, 0.04, 0, 0.055, 0.48, wood);
  box(1.0, 0.03, 0.04, 0, 0.055, -0.48, wood);
  box(0.04, 0.03, 0.92, 0.48, 0.055, 0, wood);
  box(0.04, 0.03, 0.92, -0.48, 0.055, 0, wood);
  // raked gravel
  b.part(
    new THREE.BoxGeometry(0.92, 0.022, 0.92),
    stripes("#f4f2ea", "#d5d2c6", { size: 0.032, axis: "x", width: 0.4, wobble: 0.25, seed: 3 }),
    { at: [0, 0.051, 0] },
  );

  // ---------- pond ----------
  const pond: [number, number][] = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2;
    pond.push([0.38 * Math.cos(a), 0.24 * Math.sin(a)]);
  }
  b.extrude(pond, { at: [0, 0.068, 0], x: [1, 0, 0], y: [0, 0, 1], thickness: 0.03, color: "#3a9bad" });
  // rim rocks
  const greys = ["#8a8a85", "#9c9b94", "#777873", "#a5a49c"];
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2 + 0.1;
    const x = 0.405 * Math.cos(a);
    const z = 0.265 * Math.sin(a);
    if (Math.abs(z) < 0.09 && Math.abs(x) > 0.3) continue;
    const s = 0.028 + R() * 0.02;
    blob(s, 1, 0.6, 0.9 + R() * 0.3, x, 0.07 + s * 0.2, z, greys[i % 4], 0);
  }
  const inPond = (x: number, z: number) => (x / 0.38) ** 2 + (z / 0.24) ** 2 < 1;

  // ---------- koi ----------
  const koi = (cx: number, cz: number, yaw: number, seed: number, ripple: boolean) => {
    const a = (yaw * Math.PI) / 180;
    const fx = Math.sin(a), fz = Math.cos(a);
    const rx = Math.cos(a), rz = -Math.sin(a);
    const y = 0.089;
    const at = (f: number, s: number, h = 0) => [cx + fx * f + rx * s, y + h, cz + fz * f + rz * s];
    const skin = spots("#f8f4ec", "#e8591a", { size: 0.03, amount: 0.55, seed });
    b.part(new THREE.SphereGeometry(1, 8, 6), skin, { at: at(0, 0), scale: [0.017, 0.012, 0.048], rotation: [0, yaw, 0] });
    b.part(new THREE.SphereGeometry(1, 7, 5), seed % 2 ? "#e8591a" : "#f8f4ec", {
      at: at(0.042, 0, 0.001), scale: [0.013, 0.01, 0.017], rotation: [0, yaw, 0],
    });
    for (const s of [-1, 1]) {
      b.part(new THREE.SphereGeometry(0.0025, 5, 4), "#111", { at: at(0.05, s * 0.008, 0.006) });
      box(0.016, 0.0015, 0.008, ...(at(0.012, s * 0.016, -0.004) as [number, number, number]), "#f1783a", [0, yaw + s * 35, 0]);
    }
    box(0.0015, 0.012, 0.022, ...(at(-0.008, 0, 0.012) as [number, number, number]), "#e8591a", [0, yaw, 0]);
    b.extrude(
      [[0.004, 0], [0.012, 0.02], [0.021, 0.045], [0, 0.036], [-0.021, 0.045], [-0.012, 0.02], [-0.004, 0]],
      {
        at: at(-0.044, 0, 0), x: [rx, 0, rz], y: [-fx, 0, -fz], thickness: 0.002, color: "#f6ede2",
      },
    );
    if (ripple) {
      b.part(new THREE.TorusGeometry(0.06, 0.0008, 3, 20), "#c3e8ec", { at: [cx, 0.0836, cz], rotation: [90, 0, 0] });
      b.part(new THREE.TorusGeometry(0.085, 0.0008, 3, 24), "#a6d9df", { at: [cx, 0.0834, cz], rotation: [90, 0, 0] });
    }
  };
  koi(-0.2, 0.08, 40, 1, true);
  koi(0.17, -0.1, 215, 2, false);
  koi(0.04, 0.14, 120, 5, true);
  // lily pads
  for (const [x, z, s] of [[-0.28, -0.12, 0.028], [0.26, 0.1, 0.022], [0.3, -0.02, 0.018]] as number[][]) {
    b.part(new THREE.CylinderGeometry(s, s, 0.002, 8), "#4d9a46", { at: [x, 0.084, z] });
  }

  // ---------- bridge ----------
  const h = (x: number) => 0.07 + 0.1 * (1 - (x / 0.46) ** 2);
  const deckPts: number[][] = [];
  for (let i = 0; i <= 8; i++) {
    const x = -0.46 + i * 0.115;
    deckPts.push([x, h(x), 0]);
  }
  b.sweep(catmull(deckPts), {
    radius: () => [0.06, 0.008],
    section: "box",
    caps: "flat",
    up: [0, 1, 0],
    color: stripes("#c2291c", "#7d1810", { size: 0.026, axis: "x", width: 0.1, wobble: 0.0, seed: 2 }),
  });
  for (const s of [-1, 1]) {
    const z = s * 0.055;
    b.sweep(catmull(deckPts.map(([x, y]) => [x, y + 0.058, z])), { radius: 0.006, color: "#b32217", caps: "round" });
    b.sweep(catmull(deckPts.map(([x, y]) => [x, y + 0.03, z])), { radius: 0.0035, color: "#a01d13", caps: "round" });
    for (const x of [-0.46, -0.3, -0.15, 0, 0.15, 0.3, 0.46]) {
      const base = h(x) + 0.005;
      b.part(new THREE.BoxGeometry(0.012, 0.055, 0.012), "#a8231a", { at: [x, base + 0.027, z] });
      if (Math.abs(x) > 0.4 || x === 0)
        b.part(new THREE.SphereGeometry(0.0085, 6, 5), "#e5b53a", { at: [x, base + 0.062, z] });
    }
  }
  // end footings
  for (const s of [-1, 1]) box(0.05, 0.016, 0.14, s * 0.47, 0.066, 0, "#8a8a85");

  // ---------- stepping stones ----------
  const steps = [[-0.12, 0.42], [-0.25, 0.4], [-0.37, 0.32], [-0.44, 0.22], [-0.47, 0.12]];
  steps.forEach(([x, z], i) => {
    b.part(new THREE.CylinderGeometry(0.036 + (i % 2) * 0.006, 0.043, 0.014, 7), greys[i % 4], {
      at: [x, 0.066, z], rotation: [0, R() * 60, 0],
    });
  });

  // ---------- stone lantern ----------
  {
    const lx = 0.34, lz = 0.33, y0 = 0.062;
    const stone = mottle("#9a9a94", "#74855a", { size: 0.03, seed: 4, contrast: 0.8 });
    const L = (pts: number[][], y: number, color: any) =>
      b.lathe(pts as any, { at: [lx, y0 + y, lz], segments: 6, color });
    L([[0, 0], [0.055, 0], [0.055, 0.015], [0.04, 0.02], [0, 0.02]], 0, stone);
    L([[0, 0], [0.016, 0], [0.02, 0.04], [0.016, 0.08], [0, 0.08]], 0.02, stone);
    L([[0, 0], [0.05, 0], [0.056, 0.008], [0.04, 0.016], [0, 0.016]], 0.1, stone);
    box(0.05, 0.045, 0.05, lx, y0 + 0.1385, lz, stone);
    for (const [dx, dz, ry] of [[0, 0.026, 0], [0, -0.026, 0], [0.026, 0, 90], [-0.026, 0, 90]]) {
      box(0.028, 0.026, 0.004, lx + dx, y0 + 0.14, lz + dz, "#ffd27a", [0, ry, 0]);
    }
    L([[0, 0], [0.088, 0], [0.082, 0.01], [0.032, 0.032], [0.01, 0.042], [0, 0.042]], 0.161, stone);
    b.part(new THREE.SphereGeometry(0.012, 6, 5), "#9a9a94", { at: [lx, y0 + 0.21, lz] });
  }

  // ---------- pine ----------
  {
    const px = -0.32, pz = -0.3;
    b.sweep(
      catmull([[px, 0.058, pz], [px + 0.02, 0.14, pz], [px - 0.03, 0.22, pz], [px + 0.01, 0.3, pz + 0.01], [px + 0.03, 0.36, pz + 0.01]]),
      { radius: [0.025, 0.017, 0.012, 0.006], color: "#5b3d27" },
    );
    const pads: number[][] = [[-0.21, 0.2, -0.27, 0.07], [-0.42, 0.27, -0.33, 0.08], [-0.28, 0.375, -0.29, 0.085], [-0.4, 0.17, -0.25, 0.055]];
    const greens = ["#2f6b3a", "#3b7c42", "#2a5f35"];
    const joinY = [0.15, 0.22, 0.3, 0.12];
    pads.forEach(([x, y, z, r], i) => {
      b.rod([px, joinY[i], pz], [x, y - 0.015, z], 0.005, { color: "#5b3d27" });
      blob(r, 1, 0.5, 1, x, y, z, greens[i % 3]);
      blob(r * 0.6, 1, 0.55, 1, x + r * 0.5, y + r * 0.2, z + r * 0.15, greens[(i + 1) % 3]);
      blob(r * 0.55, 1, 0.55, 1, x - r * 0.45, y + r * 0.22, z - r * 0.2, greens[(i + 2) % 3]);
      blob(r * 0.45, 1, 0.5, 1, x, y + r * 0.35, z, "#4a8d4b");
    });
    blob(0.035, 1, 0.6, 0.9, px - 0.07, 0.075, pz + 0.05, countershade("#6f8a3a", "#7d7d78", { level: 0.2 }), 0);
  }

  // ---------- cherry ----------
  const cx = 0.3, cz = -0.28;
  {
    b.sweep(
      catmull([[cx, 0.058, cz], [cx - 0.01, 0.14, cz], [cx + 0.03, 0.24, cz + 0.01], [cx, 0.34, cz], [cx - 0.02, 0.42, cz]]),
      { radius: [0.034, 0.025, 0.016, 0.01], color: "#4a3328" },
    );
    const pinks = ["#f7b6cb", "#f9c9d8", "#f08fb0", "#fbd7e2"];
    const centers: number[][] = [];
    for (let i = 0; i < 16; i++) {
      const a = R() * Math.PI * 2;
      const rr = Math.sqrt(R()) * 0.2;
      const x = cx + Math.cos(a) * rr;
      const z = cz + Math.sin(a) * rr;
      const y = 0.53 + (1 - rr / 0.2) * 0.1 + (R() - 0.5) * 0.08;
      centers.push([x, y, z]);
      blob(0.05 + R() * 0.035, 1, 0.8, 1, x, y, z, pinks[i % 4]);
    }
    [0, 3, 6, 9, 12].forEach((k) => {
      const c = centers[k];
      b.rod([cx + 0.005, 0.34, cz], [c[0], c[1] - 0.04, c[2]], 0.008, { color: "#4a3328" });
    });
    // petals
    const pet = ["#ffc4d6", "#ffdbe6", "#f9a7c2"];
    for (let i = 0; i < 40; i++) {
      const a = R() * Math.PI * 2;
      const rr = R() * 0.34;
      const x = cx + Math.cos(a) * rr;
      const z = cz + Math.sin(a) * rr;
      if (Math.abs(x) > 0.46 || Math.abs(z) > 0.46) continue;
      let y = R() < 0.45 ? 0.064 : 0.1 + R() * 0.4;
      if (y < 0.1 && inPond(x, z)) y = 0.085;
      b.part(new THREE.BoxGeometry(0.012, 0.0015, 0.008), pet[i % 3], {
        at: [x, y, z], rotation: y < 0.1 ? [0, R() * 180, 0] : [R() * 90, R() * 180, R() * 90],
      });
    }
  }

  // ---------- mossy rocks ----------
  const moss = countershade("#5f8a37", "#7d7d78", { level: 0.15, soft: 0.3 });
  const rocks: number[][] = [[0.16, 0.41, 0.05], [0.0, -0.4, 0.06], [0.43, 0.2, 0.04], [-0.43, -0.08, 0.045], [-0.1, 0.36, 0.035]];
  rocks.forEach(([x, z, s], i) => {
    blob(s, 1.2, 0.75, 1, x, 0.062 + s * 0.45, z, moss, 1);
    if (i % 2 === 0) blob(s * 0.5, 1, 0.6, 1, x + s * 1.2, 0.062 + s * 0.15, z + s * 0.4, "#8a8a85", 0);
  });
  for (let i = 0; i < 6; i++) {
    const x = -0.45 + R() * 0.9, z = 0.35 + R() * 0.08;
    blob(0.012, 1.3, 0.5, 1.3, x, 0.064, z, "#5f9a3d", 0);
  }

  return b.root;
}
