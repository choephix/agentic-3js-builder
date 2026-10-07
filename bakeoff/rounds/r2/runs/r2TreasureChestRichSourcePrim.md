```ts
import * as THREE from "three";
import { createBuilder, rng, grain, catmull } from "agentic-3js-builder";
import type { Paint } from "agentic-3js-builder";

export const meta = {
  name: "Pirate Treasure Chest",
  description:
    "A weathered dark-wood pirate chest with its lid thrown open, rusty iron straps and studs, a loose padlock, a carved skull-and-crossbones, and spilling gold coins, a pearl necklace, a jewelled goblet and gems.",
};

export default function build() {
  const b = createBuilder({ name: "pirateChest", paintSize: 2048 });
  const rand = rng(11);

  // ---------- skeleton ----------
  b.joint("root", { at: [0, 0, 0] });
  b.joint("lid", { parent: "root", at: [0, 0.45, -0.275], dir: [0, 0, 1], role: "hinge" });
  b.joint("padlock", { parent: "root", at: [0, 0.13, 0.292] });

  // ---------- palette ----------
  const IRON = ["#4a3c38", "#57423a", "#40342f"];
  const GOLD = ["#e8b923", "#f2cb4a", "#c99a1c"];
  const woodX: Paint[] = [
    grain("#5a3a20", "#3a2414", { size: 0.015, axis: "x", seed: 1 }),
    grain("#46301c", "#2c1b0e", { size: 0.015, axis: "x", seed: 2 }),
    grain("#523620", "#33200f", { size: 0.015, axis: "x", seed: 3 }),
  ];
  const woodZ: Paint[] = [
    grain("#5a3a20", "#3a2414", { size: 0.015, axis: "z", seed: 4 }),
    grain("#46301c", "#2c1b0e", { size: 0.015, axis: "z", seed: 5 }),
    grain("#523620", "#33200f", { size: 0.015, axis: "z", seed: 6 }),
  ];

  const box = (
    w: number, h: number, d: number, color: string | Paint,
    at: [number, number, number], bone = "root", o: Record<string, unknown> = {},
  ) => b.part(new THREE.BoxGeometry(w, h, d), color, { at, bone, ...o });

  // ---------- body ----------
  box(0.9, 0.04, 0.55, woodX[0], [0, 0.02, 0]);
  for (let i = 0; i < 4; i++) {
    const y = 0.05625 + i * 0.1125;
    const j = i % 2 ? 0.002 : 0;
    box(0.9, 0.108, 0.035, woodX[i % 3], [0, y, 0.2575 + j]);
    box(0.9, 0.108, 0.035, woodX[(i + 1) % 3], [0, y, -0.2575 - j]);
    box(0.035, 0.108, 0.48, woodZ[i % 3], [0.4325 + j, y, 0]);
    box(0.035, 0.108, 0.48, woodZ[(i + 2) % 3], [-0.4325 - j, y, 0]);
  }
  // interior filled with gold
  box(0.82, 0.38, 0.47, "#b8861a", [0, 0.23, 0]);

  // iron straps, bands, corners
  [-0.3, 0.3].forEach((x, k) => {
    box(0.06, 0.45, 0.012, IRON[k], [x, 0.225, 0.281]);
    box(0.06, 0.45, 0.012, IRON[k + 1], [x, 0.225, -0.281]);
  });
  box(0.92, 0.045, 0.012, IRON[2], [0, 0.425, 0.281]);
  box(0.92, 0.045, 0.012, IRON[0], [0, 0.425, -0.281]);
  box(0.012, 0.045, 0.56, IRON[1], [0.456, 0.425, 0]);
  box(0.012, 0.045, 0.56, IRON[1], [-0.456, 0.425, 0]);
  box(0.012, 0.05, 0.56, IRON[2], [0.456, 0.06, 0]);
  box(0.012, 0.05, 0.56, IRON[2], [-0.456, 0.06, 0]);
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) box(0.045, 0.46, 0.045, IRON[0], [sx * 0.4325, 0.23, sz * 0.2525]);

  // studs
  const studGeo = new THREE.SphereGeometry(0.011, 6, 4);
  const stud = (x: number, y: number, z: number, bone = "root") =>
    b.part(studGeo, "#6a4a3a", { at: [x, y, z], bone });
  for (const x of [-0.3, 0.3])
    for (let i = 0; i < 5; i++) {
      const y = 0.06 + i * 0.08;
      stud(x, y, 0.29);
      stud(x, y, -0.29);
    }

  // hinges on the back
  for (const x of [-0.27, 0.27]) {
    box(0.1, 0.07, 0.02, IRON[1], [x, 0.42, -0.285]);
    b.part(new THREE.CylinderGeometry(0.02, 0.02, 0.09, 6), IRON[0], {
      at: [x, 0.45, -0.285], rotation: [0, 0, 90], bone: "root",
    });
  }

  // ---------- lid ----------
  const half = (r: number, len: number) => new THREE.CylinderGeometry(r, r, len, 14, 1, false, 0, Math.PI);
  const lidPaint = grain("#553721", "#31200f", { size: 0.016, axis: "x", seed: 8 });
  b.part(half(0.275, 0.9), lidPaint, { at: [0, 0.45, 0], rotation: [0, 0, 90], scale: [0.75, 1, 1], bone: "lid" });
  for (const x of [-0.3, 0.3])
    b.part(half(0.283, 0.06), IRON[1], { at: [x, 0.45, 0], rotation: [0, 0, 90], scale: [0.77, 1, 1], bone: "lid" });
  for (const x of [-0.46, 0.46])
    b.part(half(0.28, 0.02), IRON[2], { at: [x, 0.45, 0], rotation: [0, 0, 90], scale: [0.75, 1, 1], bone: "lid" });
  for (const x of [-0.3, 0.3])
    for (let a = 15; a <= 165; a += 30) {
      const r = (a * Math.PI) / 180;
      stud(x, 0.45 + 0.2155 * Math.sin(r), 0.286 * Math.cos(r), "lid");
    }
  box(0.86, 0.012, 0.5, "#7a1420", [0, 0.452, 0], "lid");
  box(0.07, 0.1, 0.012, IRON[0], [0, 0.4, 0.285], "lid");
  box(0.025, 0.04, 0.014, "#1c110a", [0, 0.39, 0.287], "lid");
  b.pose("lid", { axis: [1, 0, 0], deg: -110 });

  // ---------- lock & padlock ----------
  box(0.07, 0.1, 0.01, IRON[0], [0, 0.19, 0.28]);
  stud(-0.025, 0.225, 0.287);
  stud(0.025, 0.225, 0.287);
  b.part(new THREE.TorusGeometry(0.016, 0.005, 5, 8), IRON[2], { at: [0, 0.145, 0.288], bone: "root" });
  box(0.065, 0.07, 0.03, "#a07f2e", [0, 0.075, 0.3], "padlock");
  box(0.009, 0.018, 0.004, "#1c110a", [0, 0.075, 0.316], "padlock");
  b.part(new THREE.TorusGeometry(0.016, 0.005, 5, 8, Math.PI), "#8a8a90", { at: [0, 0.11, 0.3], bone: "padlock" });
  b.pose("padlock", { axis: [1, 0, 0], deg: -18 });
  b.pose("padlock", { axis: [0, 0, 1], deg: 8 });

  // ---------- carved skull & crossbones ----------
  const BONE = "#cdb98a";
  const sx = 0, sy = 0.325, sz = 0.279;
  box(0.13, 0.12, 0.004, "#2b1a0e", [sx, sy - 0.015, sz - 0.002]);
  for (const s of [-1, 1]) {
    b.part(new THREE.BoxGeometry(0.11, 0.012, 0.008), BONE, {
      at: [sx, sy - 0.035, sz], rotation: [0, 0, s * 35], bone: "root",
    });
    for (const e of [-1, 1])
      b.part(new THREE.SphereGeometry(0.009, 5, 4), BONE, {
        at: [sx + e * 0.045 * Math.cos((35 * Math.PI) / 180), sy - 0.035 + s * e * 0.045 * Math.sin((35 * Math.PI) / 180), sz],
        bone: "root",
      });
  }
  b.part(new THREE.SphereGeometry(0.03, 8, 6), BONE, { at: [sx, sy, sz + 0.002], scale: [1, 1, 0.35], bone: "root" });
  box(0.034, 0.018, 0.01, BONE, [sx, sy - 0.028, sz + 0.003]);
  for (const e of [-1, 1]) {
    b.part(new THREE.SphereGeometry(0.008, 5, 4), "#120a05", { at: [sx + e * 0.012, sy + 0.003, sz + 0.009], scale: [1, 1.1, 0.4], bone: "root" });
    box(0.003, 0.012, 0.004, "#120a05", [sx + e * 0.008, sy - 0.03, sz + 0.009]);
  }
  box(0.006, 0.01, 0.004, "#120a05", [sx, sy - 0.01, sz + 0.009]);

  // ---------- treasure ----------
  const top = (x: number, z: number) => {
    const r2 = (x / 0.4) ** 2 + (z / 0.225) ** 2;
    return 0.4 + 0.1 * Math.sqrt(Math.max(0, 1 - r2));
  };
  b.part(new THREE.SphereGeometry(1, 12, 8), GOLD[0], { at: [0, 0.4, 0], scale: [0.4, 0.1, 0.225], bone: "root", flat: true });
  b.part(new THREE.SphereGeometry(1, 10, 6), GOLD[2], { at: [-0.2, 0.455, 0.27], scale: [0.16, 0.06, 0.1], bone: "root", flat: true });
  b.part(new THREE.SphereGeometry(1, 12, 6), GOLD[0], { at: [-0.25, 0.018, 0.5], scale: [0.2, 0.2 * 0.17, 0.2], bone: "root", flat: true });

  const coinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.006, 9);
  const coin = (x: number, y: number, z: number, flat = false) =>
    b.part(coinGeo, GOLD[Math.floor(rand() * 3)], {
      at: [x, y, z],
      rotation: flat ? [0, rand() * 360, 0] : [rand() * 50 - 25, rand() * 360, rand() * 50 - 25],
      bone: "root",
    });
  for (let i = 0; i < 70; i++) {
    const rho = Math.sqrt(rand()) * 0.95, a = rand() * Math.PI * 2;
    const x = rho * Math.cos(a) * 0.4, z = rho * Math.sin(a) * 0.22;
    coin(x, top(x, z) + 0.004, z);
  }
  for (let i = 0; i < 18; i++) {
    const x = -0.2 + (rand() - 0.5) * 0.25, z = 0.27 + (rand() - 0.5) * 0.1;
    coin(x, 0.5 + rand() * 0.02, z);
  }
  for (let i = 0; i < 26; i++) {
    const rho = Math.sqrt(rand()) * 0.9, a = rand() * Math.PI * 2;
    const x = -0.25 + rho * 0.2 * Math.cos(a), z = 0.5 + rho * 0.2 * Math.sin(a);
    coin(x, 0.018 + 0.034 * Math.sqrt(1 - rho * rho) + 0.004, z);
  }
  for (let i = 0; i < 22; i++) {
    const x = -0.45 + rand() * 0.95, z = 0.36 + rand() * 0.45;
    if (Math.hypot(x + 0.25, z - 0.5) < 0.22) continue;
    coin(x, 0.004, z, true);
  }

  // gems
  const gemIco = new THREE.IcosahedronGeometry(0.028, 0);
  const gemOct = new THREE.OctahedronGeometry(0.03, 0);
  const gem = (kind: "r" | "g", x: number, y: number, z: number, oct = false) =>
    b.part(oct ? gemOct : gemIco, kind === "r" ? "#c1121f" : "#12a150", {
      at: [x, y, z], rotation: [rand() * 90, rand() * 360, rand() * 90], scale: [1, 0.85, 1], bone: "root", flat: true,
    });
  gem("r", 0.12, top(0.12, 0.08) + 0.012, 0.08);
  gem("g", -0.1, top(-0.1, 0.12) + 0.012, 0.12, true);
  gem("r", -0.3, top(-0.3, -0.05) + 0.01, -0.05, true);
  gem("g", 0.33, 0.025, 0.52, true);
  gem("r", 0.18, 0.025, 0.74);
  gem("r", -0.25, 0.06, 0.48, true);
  gem("g", -0.38, 0.025, 0.62);

  // goblet
  const gx = 0.25, gz = -0.05, gy = top(gx, gz) - 0.005;
  b.lathe(
    [[0, 0], [0.04, 0], [0.04, 0.01], [0.01, 0.025], [0.01, 0.065], [0.032, 0.085], [0.05, 0.14], [0.043, 0.14], [0, 0.1]],
    { color: "#d9a21b", at: [gx, gy, gz], bone: "root", segments: 10 },
  );
  b.part(new THREE.SphereGeometry(0.02, 8, 5), "#f2cb4a", { at: [gx, gy + 0.045, gz], scale: [1, 0.6, 1], bone: "root" });
  b.part(new THREE.TorusGeometry(0.047, 0.004, 4, 10), "#f2cb4a", {
    at: [gx, gy + 0.11, gz], rotation: [90, 0, 0], bone: "root",
  });
  gem("r", gx, gy + 0.105, gz + 0.049, true).mesh.scale.setScalar(0.7);
  gem("g", gx + 0.045, gy + 0.105, gz + 0.02).mesh.scale.setScalar(0.6);
  gem("g", gx - 0.045, gy + 0.105, gz + 0.02).mesh.scale.setScalar(0.6);

  // pearl necklace draped over the front rim to the floor
  const pts: [number, number, number][] = [
    [0.12, top(0.12, -0.05) + 0.014, -0.05],
    [0.18, top(0.18, 0.1) + 0.014, 0.1],
    [0.2, 0.475, 0.28],
    [0.215, 0.4, 0.31],
    [0.22, 0.2, 0.32],
    [0.24, 0.03, 0.36],
    [0.3, 0.014, 0.5],
    [0.38, 0.014, 0.62],
    [0.3, 0.014, 0.75],
    [0.17, 0.014, 0.68],
    [0.14, 0.014, 0.55],
  ];
  const path = catmull(pts);
  const pearlGeo = new THREE.SphereGeometry(0.013, 8, 6);
  const count = Math.floor(path.length / 0.026);
  for (let i = 0; i <= count; i++) {
    const p = path.at(i / count);
    b.part(pearlGeo, i % 2 ? "#f4efe6" : "#e6dccb", { at: [p.x, Math.max(p.y, 0.014), p.z], bone: "root" });
  }
  const end = path.at(1);
  b.part(new THREE.TorusGeometry(0.01, 0.003, 4, 8), "#d9a21b", { at: [end.x, 0.014, end.z - 0.01], rotation: [90, 0, 0], bone: "root" });
  gem("r", end.x, 0.02, end.z - 0.035, true).mesh.scale.setScalar(0.6);

  return b.root;
}
```