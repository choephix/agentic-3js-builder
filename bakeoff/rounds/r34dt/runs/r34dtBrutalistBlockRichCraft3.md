```ts
import * as THREE from "three";
import { createBuilder, paint, mottle, mix, noise, smoothstep, svg, rng } from "agentic-3js-builder";

export const meta = {
  name: "Brutalist Housing Block",
  description: "Raw board-formed concrete slab block with deep balconies, stair towers, rooftop plant and lit windows.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist_block", paintSize: 2048 });
  const CONCRETE = paint((p, n, s) => {
    const base = mottle("#8d8b84", "#a5a299", { size: 0.9, seed: 3 }).at(p, n);
    const board = Math.floor(p.y / 0.12) % 2 ? 0.96 : 1;
    const stain = smoothstep(0.55, 0.8, noise(p, 0.5, 9)) * smoothstep(0.2, -0.6, n.y) * 0.25;
    const top = smoothstep(0.6, 1, n.y) * 0.08;
    const c = mix([base[0] * board, base[1] * board, base[2] * board], [0.25, 0.25, 0.22], stain);
    return [Math.min(c[0] + top, 1), Math.min(c[1] + top, 1), Math.min(c[2] + top, 1)];
  });
  const DARK = mottle("#5d5b57", "#74716a", { size: 0.6, seed: 5 });
  const SHADOW = "#2b2a2a";
  const GLASS = "#1f2a33";
  const WARM = "#ffc15e";
  const root = b.joint("root", { at: [0, 0, 0] });

  const L = 30, D = 9, FLOORS = 9, FH = 3.0, BASE = 3.2;
  const top = BASE + FLOORS * FH;

  // pilotis
  const pil = [-13, -6.5, 0, 6.5, 13];
  for (const x of pil)
    for (const z of [-3, 3]) {
      b.part(new THREE.BoxGeometry(1.4, BASE + 0.1, 1.6), CONCRETE, { bone: root, at: [x, (BASE + 0.1) / 2 - 0.05, z] });
    }
  // ground plinth steps
  b.part(new THREE.BoxGeometry(L + 2, 0.3, D + 4), DARK, { bone: root, at: [0, 0.1, 0] });
  // entrance core
  b.part(new THREE.BoxGeometry(5, BASE - 0.4, 3), SHADOW, { bone: root, at: [3.2, (BASE - 0.4) / 2, -0.5] });
  // main slab
  b.part(new THREE.BoxGeometry(L, FLOORS * FH, D), CONCRETE, { bone: root, at: [0, BASE + (FLOORS * FH) / 2, 0] });
  // roof parapet and slab
  b.part(new THREE.BoxGeometry(L + 0.8, 0.6, D + 0.8), CONCRETE, { bone: root, at: [0, top + 0.3, 0] });

  // window textures
  const win = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#1b2630"/><rect x="2" y="2" width="36" height="36" fill="#2c3d4c"/><path d="M2 2 L18 2 L2 22Z" fill="#4b6275"/><rect x="19" y="2" width="2" height="36" fill="#14181d"/><rect x="2" y="19" width="36" height="2" fill="#14181d"/></svg>`,
    { size: 64 },
  );
  const lit = svg(
    `<svg viewBox="0 0 40 40"><rect width="40" height="40" fill="#1b2630"/><rect x="2" y="2" width="36" height="36" fill="#ffc15e"/><rect x="19" y="2" width="2" height="36" fill="#6a4a1c"/><rect x="2" y="19" width="36" height="2" fill="#6a4a1c"/></svg>`,
    { size: 64 },
  );
  const R = rng(11);
  const bays = 12;
  const bw = L / bays;
  for (const side of [1, -1]) {
    const zf = side * (D / 2);
    for (let f = 0; f < FLOORS; f++) {
      const y0 = BASE + f * FH;
      // floor slab ribs
      b.part(new THREE.BoxGeometry(L + 0.4, 0.35, 0.5), CONCRETE, { bone: root, at: [0, y0 + 0.17, zf + side * 0.1] });
      for (let i = 0; i < bays; i++) {
        const x = -L / 2 + bw * (i + 0.5);
        const isLit = R() < 0.25;
        const balc = side === 1;
        if (balc) {
          // deep balcony box
          b.part(new THREE.BoxGeometry(bw - 0.5, 0.25, 1.8), CONCRETE, { bone: root, at: [x, y0 + 0.2, zf + 0.9] });
          b.part(new THREE.BoxGeometry(0.4, FH - 0.45, 1.8), CONCRETE, { bone: root, at: [x - (bw - 0.4) / 2, y0 + FH / 2 - 0.05, zf + 0.9] });
          b.part(new THREE.BoxGeometry(bw - 0.5, 0.9, 0.2), DARK, { bone: root, at: [x, y0 + 0.75, zf + 1.7] });
          b.part(new THREE.BoxGeometry(bw - 0.5, FH - 0.5, 0.1), SHADOW, { bone: root, at: [x, y0 + FH / 2 + 0.1, zf - 0.02] });
        }
        const wdt = 1.7, hgt = 1.5;
        b.part(new THREE.PlaneGeometry(wdt, hgt), "#ffffff", {
          bone: root,
          at: [x, y0 + 1.8, zf + side * 0.06 - (balc ? 0 : 0)],
          dir: [0, 0, side],
          axis: "z",
          texture: isLit ? lit : win,
        });
        if (!balc) b.part(new THREE.BoxGeometry(wdt + 0.3, 0.12, 0.3), DARK, { bone: root, at: [x, y0 + 1.0, zf + 0.1 * side] });
      }
    }
  }
  // end gable walls with strip windows
  for (const sx of [1, -1]) {
    b.part(new THREE.BoxGeometry(0.5, FLOORS * FH + BASE, D + 0.4), CONCRETE, { bone: root, at: [sx * (L / 2 + 0.25), (FLOORS * FH + BASE) / 2, 0] });
    for (let f = 0; f < FLOORS; f += 2)
      b.part(new THREE.PlaneGeometry(0.8, 1.4), "#ffffff", { bone: root, at: [sx * (L / 2 + 0.52), BASE + f * FH + 1.8, 0], dir: [sx, 0, 0], axis: "z", texture: win });
  }
  // stair towers
  for (const x of [-9.5, 9.5]) {
    b.part(new THREE.BoxGeometry(3.4, top + 3.2, 3), CONCRETE, { bone: root, at: [x, (top + 3.2) / 2, -D / 2 - 1.3] });
    for (let k = 0; k < 8; k++)
      b.part(new THREE.BoxGeometry(0.5, 1.4, 0.15), SHADOW, { bone: root, at: [x, 3 + k * 3.4, -D / 2 - 2.85] });
    b.part(new THREE.BoxGeometry(3.8, 0.4, 3.4), DARK, { bone: root, at: [x, top + 3.4, -D / 2 - 1.3] });
  }
  // rooftop plant
  b.part(new THREE.BoxGeometry(9, 2.2, 4), CONCRETE, { bone: root, at: [-3, top + 1.7, -1] });
  b.part(new THREE.BoxGeometry(5, 1.4, 3), DARK, { bone: root, at: [8, top + 1.3, 1] });
  for (const x of [-6, -3, 0])
    b.part(new THREE.CylinderGeometry(0.5, 0.5, 1.6, 8), "#6b6e70", { bone: root, at: [x, top + 3.6, -1] });
  b.part(new THREE.CylinderGeometry(0.12, 0.12, 5, 6), "#55585a", { bone: root, at: [8, top + 4.4, 1] });
  // entrance canopy
  b.part(new THREE.BoxGeometry(6, 0.4, 3), CONCRETE, { bone: root, at: [3.2, BASE - 0.2, 1.8] });
  b.part(new THREE.BoxGeometry(2.4, 2.4, 0.1), "#ffffff", { bone: root, at: [3.2, 1.4, 1.02], texture: lit });

  return b.root;
}
```