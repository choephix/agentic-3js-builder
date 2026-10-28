import * as THREE from "three";
import { createBuilder } from "../../../../src/index";

export const meta = {
  name: "Piano Accordion",
  description: "Italian mother-of-pearl piano accordion with pearl-white shell, red bellows, keyboard and bass buttons.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "accordion" });

  const PEARL = "#f2efe6", PEARL2 = "#dcd9f0", PEARL3 = "#f6e4ea";
  const RED = "#a3141f", DRED = "#6b0b14", BLACK = "#16141a";
  const GOLD = "#d4a93a", IVORY = "#fbf8ee", STEEL = "#aab0bb", STRAP = "#3a2418";

  const box = (w: number, h: number, d: number, c: string, at: number[], extra: any = {}) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at, ...extra });

  // Model: accordion standing on its bottom, keyboard on +X side (left? keep keyboard to the model's right-facing front).
  // Width (x) is the bellows axis; front face is +Z.
  const H = 0.46; // height of cases
  const D = 0.2;  // depth
  const y0 = 0.0;
  const cy = H / 2;

  // Treble case (right side of player = -X) and bass case (+X)
  const trebleX = -0.2, bassX = 0.2;
  const bellowsHalf = 0.11;

  // Treble case body
  box(0.2, H, D, PEARL, [trebleX - 0.1, cy, 0]);
  box(0.2, H, D, PEARL, [bassX + 0.1, cy, 0]);
  // End plates
  box(0.012, H + 0.02, D + 0.02, PEARL2, [trebleX - 0.206, cy, 0]);
  box(0.012, H + 0.02, D + 0.02, PEARL2, [bassX + 0.206, cy, 0]);
  // Pearl inlay swirls (small coloured plates)
  for (let i = 0; i < 9; i++) {
    const c = [PEARL2, PEARL3, "#d6ecee"][i % 3];
    const x = -0.37 + i * 0.0925;
    if (Math.abs(x) < 0.15) continue;
    box(0.05, 0.03, 0.004, c, [x, 0.06 + (i % 2) * 0.05, D / 2 + 0.002]);
    box(0.05, 0.03, 0.004, c, [x, H - 0.06 - (i % 2) * 0.05, D / 2 + 0.002]);
  }
  // Gold trim edges
  for (const x of [trebleX - 0.1, bassX + 0.1]) {
    box(0.2, 0.01, D + 0.008, GOLD, [x, 0.005, 0]);
    box(0.2, 0.01, D + 0.008, GOLD, [x, H - 0.005, 0]);
  }
  // Inner frame rings facing bellows
  box(0.014, H + 0.01, D + 0.01, GOLD, [trebleX + 0.006, cy, 0]);
  box(0.014, H + 0.01, D + 0.01, GOLD, [bassX - 0.006, cy, 0]);

  // Bellows: accordion folds
  const n = 14;
  const x0 = trebleX + 0.014, x1 = bassX - 0.014;
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + 0.5) / n) * (x1 - x0);
    const w = (x1 - x0) / n;
    box(w * 0.9, H - 0.02, D - 0.02, i % 2 ? RED : DRED, [x, cy, 0]);
    // outward ridge
    box(w * 0.5, H, D, RED, [x, cy, 0]);
    // pearl corner guards
  }
  // Fold ridges at front and back edges
  for (let i = 0; i <= n; i++) {
    const x = x0 + (i / n) * (x1 - x0);
    box(0.004, H + 0.012, D + 0.012, "#2a0508", [x, cy, 0]);
  }
  // Bellows corner pearl strips
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      box(x1 - x0, 0.01, 0.01, GOLD, [0, 0.005, 0], {}),
      void sx, void sz;

  // Keyboard on treble case front (-X end face is the side; piano keyboard on front +Z of treble case)
  // Keys: white keys along Y vertical on front? Real accordion: keyboard on right side facing player. Use -X end plate.
  const kx = trebleX - 0.213;
  box(0.012, H - 0.02, D - 0.02, BLACK, [kx + 0.004, cy, 0]);
  const whites = 14;
  const kh = (H - 0.05) / whites;
  for (let i = 0; i < whites; i++) {
    const y = 0.025 + kh * (i + 0.5);
    box(0.035, kh * 0.92, D - 0.05, IVORY, [kx - 0.012, y, 0]);
  }
  const pattern = [1, 1, 0, 1, 1, 1, 0];
  for (let i = 0; i < whites - 1; i++) {
    if (!pattern[i % 7]) continue;
    const y = 0.025 + kh * (i + 1);
    box(0.03, kh * 0.55, (D - 0.05) * 0.6, BLACK, [kx - 0.03, y, -0.025]);
  }
  // Treble register switches on top
  for (let i = 0; i < 4; i++) box(0.022, 0.018, 0.03, i % 2 ? GOLD : STEEL, [trebleX - 0.1 + (i - 1.5) * 0.04, H + 0.009, 0.04]);
  // Treble grille on top (speaker slots)
  for (let i = 0; i < 6; i++) box(0.012, 0.004, 0.12, BLACK, [trebleX - 0.17 + i * 0.03, H + 0.002, -0.03]);

  // Bass case: buttons on +X end plate
  const bx = bassX + 0.213;
  box(0.012, H - 0.04, D - 0.03, BLACK, [bx - 0.004, cy, 0]);
  const rows = 6, cols = 5;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const y = 0.06 + r * 0.065, z = -0.07 + c * 0.035;
      const col = (c === 0 && r % 2 === 0) || (c === 1 && r % 3 === 0) ? "#d23a3a" : PEARL;
      b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.016, 8), col, { at: [bx + 0.008, y, z], dir: [1, 0, 0] });
    }
  // Bass strap plate and air button
  box(0.02, 0.05, 0.1, STEEL, [bassX + 0.12, H - 0.05, 0.12 - 0.12]);
  b.part(new THREE.CylinderGeometry(0.014, 0.014, 0.02, 8), GOLD, { at: [bassX + 0.2, H - 0.025, -D / 2 - 0.01], dir: [0, 0, -1] });

  // Straps: shoulder strap loops on the back
  for (const x of [trebleX - 0.06, bassX + 0.06]) {
    box(0.04, H * 0.8, 0.012, STRAP, [x, cy, -D / 2 - 0.006]);
    box(0.05, 0.02, 0.016, GOLD, [x, H * 0.85, -D / 2 - 0.008]);
  }
  // Bass hand strap
  box(0.1, 0.05, 0.015, STRAP, [bassX + 0.1, cy, -D / 2 - 0.008]);

  // Front pearl nameplate + gold emblem
  box(0.14, 0.04, 0.006, GOLD, [trebleX - 0.1, 0.23, D / 2 + 0.003]);
  box(0.12, 0.028, 0.008, BLACK, [trebleX - 0.1, 0.23, D / 2 + 0.004]);
  for (let i = 0; i < 5; i++) box(0.012, 0.012, 0.01, GOLD, [trebleX - 0.14 + i * 0.02, 0.23, D / 2 + 0.006]);
  // Feet
  for (const x of [-0.3, 0.3]) box(0.06, 0.012, 0.06, STEEL, [x, 0.0, 0.0], {});

  // Lift entire thing so bottom sits at y=0 (already at y=0 base). Add small sink.
  b.root.position.y = 0.005;
  return b.root;
}
