import * as THREE from "three";
import { createBuilder, paint, mottle, noise, mix, smoothstep, svg, rng } from "../../../../src/index";
import { glow } from "../../../../kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description: "Raw board-formed concrete slab block with stacked balcony modules, a stair tower, pilotis and lit windows.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist_block" });
  const R = rng(5);

  // Paints: concrete with rain streaks, darker at base, grime under ledges
  const CONC = paint((p, n) => {
    const base = mix("#8b8a84", "#b3b1a8", noise(p, 0.9, 2));
    const board = Math.sin(p.y * 38) * 0.02;
    const streak = smoothstep(0.55, 0.8, noise(new THREE.Vector3(p.x * 6, p.y * 0.4, p.z * 6), 0.5, 7));
    let c = mix(base, "#4f4d48", streak * 0.45 * (n.y < 0.5 ? 1 : 0.5));
    c = mix(c, "#3e4a36", smoothstep(1.2, 0, p.y) * 0.35 * noise(p, 0.3, 4));
    return [c[0] + board, c[1] + board, c[2] + board] as [number, number, number];
  });
  const DARK = mottle("#5d5c58", "#77766f", { size: 0.5, seed: 3 });
  const CONC2 = mottle("#a19e94", "#c4c1b6", { size: 0.7, seed: 9 });
  const GLASS = "#1b262e";
  const WARM = "#ffbf5e";

  const W = 24, D = 8, FLOORS = 8, FH = 3, PIL = 3.2;
  const top = PIL + FLOORS * FH;
  const box = (w: number, h: number, d: number, col: any, x: number, y: number, z: number) =>
    b.part(new THREE.BoxGeometry(w, h, d), col, { at: [x, y, z] });

  // Pilotis
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + 1 + i * ((W - 2) / 6);
    for (const z of [-D / 2 + 0.8, D / 2 - 0.8]) box(1, PIL, 1, CONC2, x, PIL / 2, z);
  }
  // ground slab / podium
  box(W + 4, 0.3, D + 4, DARK, 0, 0.1, 0);

  // Main slab
  box(W, FLOORS * FH, D, CONC, 0, PIL + (FLOORS * FH) / 2, 0);
  // floor ledges
  for (let f = 0; f <= FLOORS; f++) box(W + 0.4, 0.25, D + 0.4, CONC2, 0, PIL + f * FH, 0);
  // roof parapet and plant
  box(W + 0.6, 0.8, D + 0.6, CONC2, 0, top + 0.5, 0);
  box(6, 2.2, 4, CONC, -5, top + 1.9, 0);
  box(3, 1, 3, DARK, 6, top + 1.2, 0);

  // Windows and balconies on front and back
  for (const side of [1, -1]) {
    const zf = side * (D / 2);
    for (let f = 0; f < FLOORS; f++) {
      const y0 = PIL + f * FH;
      for (let i = 0; i < 8; i++) {
        const x = -W / 2 + 1.5 + i * 3;
        const lit = R() < 0.4;
        glow(b.part(new THREE.BoxGeometry(1.6, 1.4, 0.1), lit ? WARM : GLASS, { at: [x, y0 + 1.7, zf + side * 0.02] }), lit ? 0.9 : 0);
        // deep reveal frame
        box(2, 0.15, 0.5, DARK, x, y0 + 2.5, zf + side * 0.2);
        // balcony slab with parapet on alternating bays
        if ((i + f) % 2 === 0) {
          box(2.6, 0.2, 1.4, CONC2, x, y0 + 0.9, zf + side * 0.7);
          box(2.6, 0.9, 0.2, CONC, x, y0 + 1.4, zf + side * 1.3);
        }
      }
    }
  }
  // end side windows
  for (const sx of [1, -1])
    for (let f = 0; f < FLOORS; f++)
      for (const z of [-2, 2])
        b.part(new THREE.BoxGeometry(0.1, 1.2, 1.2), R() < 0.4 ? WARM : GLASS, { at: [sx * (W / 2 + 0.02), PIL + f * FH + 1.7, z] });

  // Stair/lift tower attached at one end
  const TX = W / 2 + 2.2;
  box(4, top + 3.5, 5, CONC, TX, (top + 3.5) / 2, 0);
  for (let f = 0; f < 10; f++) {
    const y = 2 + f * 3.4;
    b.part(new THREE.BoxGeometry(0.15, 1.8, 0.8), f % 3 ? "#26343c" : WARM, { at: [TX + 0.02, y + 1, 2.6 + 0.0] });
    glow(b.part(new THREE.BoxGeometry(0.5, 1.8, 0.1), WARM, { at: [TX, y + 1, 2.52] }), 0.8);
  }
  box(4.6, 0.5, 5.6, CONC2, TX, top + 3.7, 0);
  // bridges linking tower
  for (let f = 1; f < FLOORS; f += 2) box(0.8, 0.3, 1.2, DARK, W / 2 + 0.2, PIL + f * FH + 0.9, 0);

  // Entrance canopy
  box(5, 0.3, 3, CONC2, 0, 3, D / 2 + 1.5);
  for (const x of [-2.2, 2.2]) box(0.3, 3, 0.3, CONC, x, 1.5, D / 2 + 2.8);
  // steps
  for (let i = 0; i < 3; i++) box(5, 0.15, 0.6, DARK, 0, 0.3 + i * 0.15, D / 2 + 3.2 - i * 0.5);

  // Sign
  const sign = svg(`<svg viewBox="0 0 128 32"><rect width="128" height="32" fill="#e8e4d8"/><text x="64" y="24" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="22" fill="#222">BLOCK 7</text></svg>`, { size: 256 });
  b.part(new THREE.PlaneGeometry(4, 1), "#ffffff", { at: [0, 3.7, D / 2 + 0.06], dir: [0, 0, 1], axis: "z", texture: sign });

  return b.root;
}
