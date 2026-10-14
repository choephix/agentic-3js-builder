import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Typewriter",
  description: "Vintage manual typewriter with keys, type basket, platen, ribbon spools and a sheet of typed paper.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0, 0] });

  const BODY = "#24332f", CHROME = "#c7cbd0", CREAM = "#e9ddc0", GOLD = "#c9a24a";
  const RUBBER = "#151515", PAPER = "#f5f1e4", KEY = "#1b1b1b", INK = "#3a3a46", RED = "#8e2b25";

  const box = (w: number, h: number, d: number, color: string, at: [number, number, number], rot?: [number, number, number]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });
  const cylX = (r: number, len: number, color: string, at: [number, number, number], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, rotation: [0, 0, 90] });
  const cylY = (r: number, h: number, color: string, at: [number, number, number], seg = 8) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at });

  // feet
  for (const x of [-0.16, 0.16]) for (const z of [-0.15, 0.15]) cylY(0.016, 0.012, RUBBER, [x, 0.006, z]);

  // base and shells
  box(0.38, 0.07, 0.34, BODY, [0, 0.045, 0]);
  box(0.4, 0.012, 0.36, "#111a18", [0, 0.012, 0]);
  box(0.36, 0.12, 0.16, BODY, [0, 0.12, -0.09]);
  box(0.37, 0.012, 0.17, "#2f4540", [0, 0.186, -0.09]);
  // keyboard deck (slopes up toward the back)
  const slope = 0.4;
  const surf = (z: number) => 0.09 + (0.17 - z) * slope;
  box(0.36, 0.02, 0.19, BODY, [0, 0.108, 0.1], [Math.atan(slope) * 180 / Math.PI, 0, 0]);
  box(0.36, 0.06, 0.012, "#1b2623", [0, 0.065, 0.173]);
  // side frames
  for (const s of [-1, 1]) {
    box(0.02, 0.13, 0.2, BODY, [s * 0.18, 0.2, -0.07]);
    cylX(0.008, 0.024, CHROME, [s * 0.185, 0.16, 0.0]);
  }
  // brand badge
  box(0.07, 0.018, 0.003, GOLD, [0, 0.15, -0.0095]);
  box(0.05, 0.004, 0.0035, "#7a5c1c", [0, 0.15, -0.0085]);

  // keys
  const rows: Array<[number, number]> = [[0.145, 11], [0.115, 10], [0.085, 9], [0.055, 8]];
  rows.forEach(([z, n], r) => {
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.029 + (r % 2 ? 0.004 : -0.004);
      const y = surf(z);
      cylY(0.0125, 0.012, CHROME, [x, y + 0.004, z]);
      cylY(0.0105, 0.016, KEY, [x, y + 0.01, z]);
      cylY(0.0085, 0.003, CREAM, [x, y + 0.0185, z]);
    }
  });
  box(0.17, 0.014, 0.022, KEY, [0, surf(0.178) + 0.008, 0.178]);
  box(0.165, 0.003, 0.018, CREAM, [0, surf(0.178) + 0.0165, 0.178]);
  // shift keys
  for (const s of [-1, 1]) box(0.04, 0.014, 0.022, KEY, [s * 0.14, surf(0.178) + 0.008, 0.178]);

  // type basket
  const N = 13;
  for (let i = 0; i < N; i++) {
    const a = -0.9 + (1.8 * i) / (N - 1);
    const base: [number, number, number] = [Math.sin(a) * 0.11, 0.19, -0.01 + (1 - Math.cos(a)) * 0.05];
    const tip: [number, number, number] = [Math.sin(a) * 0.022, 0.222, -0.062];
    b.rod(base, tip, 0.0022, { color: CHROME, sides: 5 });
    box(0.008, 0.008, 0.005, KEY, [tip[0], tip[1] + 0.003, tip[2] + 0.004]);
  }
  b.rod([-0.12, 0.19, -0.01], [0.12, 0.19, -0.01], 0.004, { color: CHROME, sides: 6 });
  // ribbon spools
  for (const s of [-1, 1]) {
    cylY(0.04, 0.008, CHROME, [s * 0.125, 0.196, -0.05], 14);
    cylY(0.03, 0.012, RUBBER, [s * 0.125, 0.204, -0.05], 12);
    cylY(0.008, 0.02, CHROME, [s * 0.125, 0.21, -0.05], 6);
  }
  b.rod([-0.125, 0.2, -0.015], [0.125, 0.2, -0.015], 0.0015, { color: INK, sides: 4 });

  // carriage
  const pz = -0.085, py = 0.245;
  box(0.46, 0.018, 0.05, CHROME, [0, 0.265, -0.125]);
  for (const s of [-1, 1]) box(0.014, 0.055, 0.1, CHROME, [s * 0.2, py, pz - 0.01]);
  cylX(0.026, 0.38, RUBBER, [0, py, pz], 14);
  cylX(0.006, 0.48, CHROME, [0, py, pz], 6);
  for (const s of [-1, 1]) {
    cylX(0.03, 0.02, CHROME, [s * 0.235, py, pz], 10);
    cylX(0.012, 0.03, CREAM, [s * 0.255, py, pz], 8);
  }
  // paper bail
  b.rod([-0.18, 0.27, -0.04], [0.18, 0.27, -0.04], 0.0025, { color: CHROME, sides: 5 });
  for (const s of [-1, 1]) b.rod([s * 0.18, 0.27, -0.04], [s * 0.18, 0.255, -0.075], 0.0025, { color: CHROME, sides: 5 });
  // carriage return lever
  b.rod([0.2, 0.27, -0.1], [0.255, 0.315, -0.02], 0.004, { color: CHROME, sides: 6 });
  b.part(new THREE.SphereGeometry(0.011, 8, 6), RED, { at: [0.258, 0.318, -0.015] });

  // paper
  box(0.22, 0.17, 0.002, PAPER, [0, 0.33, -0.113], [-7, 0, 0]);
  [0.3, 0.315, 0.33, 0.345].forEach((y, i) => {
    box(0.15 - i * 0.025, 0.003, 0.0012, INK, [-0.02 - i * 0.0125, y, -0.1112 - (y - 0.3) * 0.12]);
  });

  return b.root;
}
