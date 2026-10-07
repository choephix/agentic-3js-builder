```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "Typewriter",
  description: "A classic teal manual typewriter with chrome trim, round keys, a platen carriage, type bars and a typed sheet of paper.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "typewriter" });
  b.joint("root", { at: [0, 0.1, 0] });

  const TEAL = "#2f6b66";
  const TEAL_D = "#234f4b";
  const CHROME = "#c9ced1";
  const BLACK = "#1c1c1e";
  const CREAM = "#efe6cf";
  const GOLD = "#c9a04a";
  const RED = "#a8332e";

  const box = (w: number, h: number, d: number, color: string, at: number[], rot?: number[]) =>
    b.part(new THREE.BoxGeometry(w, h, d), color, { at, rotation: rot });
  const cylX = (r: number, len: number, color: string, at: number[], seg = 12) =>
    b.part(new THREE.CylinderGeometry(r, r, len, seg), color, { at, rotation: [0, 0, 90] });
  const cylY = (r: number, h: number, color: string, at: number[], seg = 12, rot?: number[]) =>
    b.part(new THREE.CylinderGeometry(r, r, h, seg), color, { at, rotation: rot });

  // Body: side profile (z, y) extruded across the width
  b.extrude(
    [
      [-0.17, 0.012],
      [0.18, 0.012],
      [0.18, 0.06],
      [0.06, 0.12],
      [0.0, 0.15],
      [-0.02, 0.19],
      [-0.17, 0.19],
    ],
    { color: TEAL, at: [0, 0, 0], thickness: 0.34, bevel: 0.01, name: "body" },
  );
  // Chrome base rail and front trim
  box(0.352, 0.006, 0.372, CHROME, [0, 0.015, 0.005]);
  box(0.346, 0.006, 0.006, CHROME, [0, 0.066, 0.181]);
  box(0.1, 0.02, 0.004, GOLD, [0, 0.038, 0.182]);
  box(0.07, 0.004, 0.004, TEAL_D, [0, 0.038, 0.1845]);

  // Feet
  for (const sx of [-1, 1])
    for (const sz of [-1, 1]) cylY(0.014, 0.012, BLACK, [sx * 0.15, 0.006, sz * 0.14], 10);

  // Keyboard on the sloped deck
  const rot = 26.57;
  const deckAt = (s: number, off: number) => [0, 0.06 + 0.447 * s + 0.894 * off, 0.18 - 0.894 * s + 0.447 * off];
  const counts = [11, 10, 10, 9];
  counts.forEach((n, i) => {
    const s = 0.03 + 0.027 * i;
    for (let j = 0; j < n; j++) {
      const x = (j - (n - 1) / 2) * 0.028 + 0.004 * i;
      const p = deckAt(s, 0.003);
      b.part(new THREE.CylinderGeometry(0.0105, 0.0105, 0.006, 10), CHROME, { at: [x, p[1], p[2]], rotation: [rot, 0, 0] });
      const q = deckAt(s, 0.0085);
      b.part(new THREE.CylinderGeometry(0.0085, 0.0085, 0.006, 10), (i + j) % 7 === 0 ? RED : CREAM, {
        at: [x, q[1], q[2]],
        rotation: [rot, 0, 0],
      });
    }
  });
  const sp = deckAt(0.009, 0.004);
  b.part(new THREE.BoxGeometry(0.15, 0.008, 0.013), CHROME, { at: [0, sp[1], sp[2]], rotation: [rot, 0, 0] });

  // Shift levers on the sides
  for (const sx of [-1, 1]) box(0.012, 0.012, 0.04, BLACK, [sx * 0.176, 0.045, 0.14]);

  // Ribbon spools and covers
  for (const sx of [-1, 1]) {
    cylY(0.04, 0.008, CHROME, [sx * 0.105, 0.194, -0.085], 16);
    cylY(0.03, 0.012, BLACK, [sx * 0.105, 0.2, -0.085], 14);
    cylY(0.012, 0.016, RED, [sx * 0.105, 0.204, -0.085], 8);
  }
  // Vent slots
  for (let k = 0; k < 5; k++) box(0.05, 0.002, 0.006, TEAL_D, [0, 0.191, -0.14 + k * 0.012]);
  box(0.346, 0.004, 0.004, CHROME, [0, 0.19, -0.17]);

  // Type bars fanning toward the platen
  for (let k = 0; k < 15; k++) {
    const x = (k - 7) * 0.0125;
    b.rod([x, 0.16, -0.012], [x * 0.1, 0.236, -0.077], 0.0012, { color: CHROME, caps: "flat", sides: 4 });
    box(0.004, 0.006, 0.003, BLACK, [x * 0.1, 0.238, -0.078]);
  }
  box(0.2, 0.008, 0.01, CHROME, [0, 0.165, -0.012], [-20, 0, 0]);

  // Carriage
  box(0.4, 0.016, 0.06, TEAL_D, [0, 0.2, -0.1]);
  box(0.4, 0.006, 0.01, CHROME, [0, 0.21, -0.07]);
  for (const sx of [-1, 1]) box(0.01, 0.07, 0.07, CHROME, [sx * 0.195, 0.235, -0.1]);
  cylX(0.025, 0.37, BLACK, [0, 0.25, -0.1], 16);
  cylX(0.006, 0.43, CHROME, [0, 0.25, -0.1], 8);
  for (const sx of [-1, 1]) {
    cylX(0.02, 0.014, CHROME, [sx * 0.215, 0.25, -0.1], 12);
    cylX(0.014, 0.02, BLACK, [sx * 0.232, 0.25, -0.1], 10);
    cylX(0.008, 0.008, CHROME, [sx * 0.244, 0.25, -0.1], 8);
  }

  // Paper bail
  b.rod([-0.18, 0.268, -0.067], [0.18, 0.268, -0.067], 0.0016, { color: CHROME, caps: "flat", sides: 6 });
  for (const sx of [-1, 1]) b.rod([sx * 0.18, 0.268, -0.067], [sx * 0.18, 0.262, -0.1], 0.0016, { color: CHROME, caps: "flat", sides: 6 });

  // Paper with typed lines
  const tilt = 8 * (Math.PI / 180);
  const pc = [0, 0.32, -0.135];
  box(0.22, 0.17, 0.002, CREAM, pc, [-8, 0, 0]);
  for (let k = 0; k < 5; k++) {
    const dy = 0.06 - k * 0.012;
    const len = 0.17 - ((k * 37) % 5) * 0.02;
    box(len, 0.003, 0.0008, BLACK, [
      -0.02 + (len - 0.17) / 2 * 0 - (0.17 - len) / 2 + 0.0,
      pc[1] + Math.cos(tilt) * dy + Math.sin(tilt) * 0.0014,
      pc[2] - Math.sin(tilt) * dy + Math.cos(tilt) * 0.0014,
    ], [-8, 0, 0]);
  }
  box(0.22, 0.002, 0.04, CREAM, [0, 0.276, -0.118], [-30, 0, 0]);

  // Carriage return lever
  b.rod([0.205, 0.262, -0.1], [0.215, 0.285, -0.01], 0.003, { color: CHROME, caps: "round", sides: 6 });
  b.part(new THREE.SphereGeometry(0.01, 8, 6), BLACK, { at: [0.215, 0.285, -0.005] });

  return b.root;
}
```