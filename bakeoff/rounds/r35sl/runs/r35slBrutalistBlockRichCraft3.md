```ts
import * as THREE from "three";
import { createBuilder, paint, mottle, noise, smoothstep, mix, rng, svg } from "agentic-3js-builder";

export const meta = {
  name: "Brutalist Housing Block",
  description: "Raw board-formed concrete slab block with deep balconies, stair towers, rooftop plant and pilotis.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist_block" });
  b.joint("base", { at: [0, 0, 0] });

  const CONC = "#8d8b86";
  const concrete = paint((p, n) => {
    const big = noise(p, 1.4, 3);
    const fine = noise(p, 0.12, 8);
    const board = Math.abs(((p.y / 0.18) % 1) - 0.5) < 0.04 ? 0.9 : 1;
    const stain = smoothstep(0.55, 0.8, noise(new THREE.Vector3(p.x * 2, p.y * 0.3, p.z * 2), 0.5, 5)) * smoothstep(0.2, -0.8, n.y) * 0.5;
    const rain = noise(new THREE.Vector3(p.x * 4, p.y * 0.15, p.z * 4), 0.4, 11);
    let k = (0.82 + big * 0.2 + fine * 0.08) * board * (0.88 + 0.12 * smoothstep(-0.5, 1, n.y));
    k *= 1 - stain * 0.5 - (rain > 0.6 ? 0.08 : 0);
    return [0.56 * k, 0.55 * k, 0.52 * k];
  });
  const darkConc = mottle("#5f5e5b", "#767570", { size: 0.6, seed: 4 });
  const GLASS = "#2a3a44";
  const WOOD = "#8a5a32";

  const box = (w: number, h: number, d: number, x: number, y: number, z: number, c: any = concrete) =>
    b.part(new THREE.BoxGeometry(w, h, d), c, { at: [x, y, z], bone: "base" });

  // window texture
  const win = svg(
    `<svg viewBox="0 0 64 64"><rect width="64" height="64" fill="#1e2b33"/><rect x="3" y="3" width="26" height="58" fill="#3b5666"/><rect x="33" y="3" width="28" height="30" fill="#4a6a7a"/><rect x="33" y="36" width="28" height="25" fill="#2c3f4a"/><path d="M3 3L29 40" stroke="#9cc0d0" stroke-width="2" opacity=".35"/><rect x="0" y="0" width="64" height="64" fill="none" stroke="#111" stroke-width="3"/></svg>`,
    { size: 128 },
  );
  const sunshade = "#a3a19b";

  const W = 30, D = 9, FL = 8, FH = 3.2, PIL = 4.5;
  const top = PIL + FL * FH;

  // pilotis
  for (let i = 0; i <= 6; i++) {
    const x = -W / 2 + 1 + (i * (W - 2)) / 6;
    for (const z of [-D / 2 + 1, D / 2 - 1]) {
      b.part(new THREE.CylinderGeometry(0.55, 0.7, PIL, 8), concrete, { at: [x, PIL / 2, z], bone: "base" });
    }
  }
  // ground slab / podium
  box(W + 6, 0.3, D + 8, 0, 0.15, 0, darkConc);
  // main slab
  box(W, FL * FH, D, 0, PIL + (FL * FH) / 2, 0);
  // bottom soffit slab
  box(W + 0.4, 0.5, D + 0.4, 0, PIL + 0.1, 0, darkConc);

  // front and back facades: recessed windows, balconies, fins
  const bays = 10;
  const bw = (W - 2) / bays;
  for (const s of [1, -1]) {
    const zf = s * D / 2;
    for (let f = 0; f < FL; f++) {
      const y = PIL + 0.5 + f * FH + FH / 2;
      // balcony slab running along floor
      box(W + 0.2, 0.28, 1.5, 0, PIL + 0.6 + f * FH, zf + s * 0.75, concrete);
      // parapet
      box(W + 0.2, 0.9, 0.18, 0, PIL + 1.15 + f * FH, zf + s * 1.45, darkConc);
      for (let i = 0; i < bays; i++) {
        const x = -W / 2 + 1 + bw * (i + 0.5);
        b.part(new THREE.PlaneGeometry(bw * 0.7, FH * 0.62), "#ffffff", {
          at: [x, y + 0.2, zf + s * 0.02],
          dir: [0, 0, s],
          axis: "z",
          texture: win,
          bone: "base",
        });
        // door/wood panel accents
        if ((i + f) % 3 === 0) box(bw * 0.2, FH * 0.5, 0.06, x + bw * 0.38, y + 0.1, zf + s * 0.04, WOOD);
      }
    }
    // vertical fins
    for (let i = 0; i <= bays; i++) {
      const x = -W / 2 + 1 + bw * i;
      box(0.25, FL * FH, 1.5, x, PIL + (FL * FH) / 2, zf + s * 0.75);
    }
    // sunshade lintels
    for (let f = 0; f < FL; f++) box(W, 0.12, 1.1, 0, PIL + 0.5 + (f + 1) * FH - 0.1, zf + s * 0.55, sunshade);
  }

  // end walls: blind concrete with slits
  for (const s of [1, -1]) {
    box(0.6, FL * FH, D + 0.6, s * (W / 2 + 0.3), PIL + (FL * FH) / 2, 0, darkConc);
    for (let f = 0; f < FL; f++)
      box(0.1, 0.25, 3, s * (W / 2 + 0.62), PIL + 1.6 + f * FH, 0, "#1e2b33");
  }

  // stair/lift towers
  for (const x of [-8, 8]) {
    box(3.4, top + 3 - 0.3, 3, x, (top + 3) / 2 + 0.1, -D / 2 - 2.2, concrete);
    for (let f = 0; f < FL + 1; f++) box(0.5, 1.6, 0.1, x, 2 + f * FH * 0.95 + 1.6, -D / 2 - 3.72, GLASS);
    box(3.8, 0.4, 3.4, x, top + 3, -D / 2 - 2.2, darkConc);
  }
  // bridges linking towers to slab
  for (let f = 0; f < FL; f += 2) for (const x of [-8, 8]) box(2, 0.3, 1.2, x, PIL + 1.5 + f * FH, -D / 2 - 0.4, darkConc);

  // roof parapet + plant
  box(W + 0.4, 0.6, D + 0.4, 0, top + 0.3, 0, darkConc);
  box(8, 2, 4, -6, top + 1.6, 0.5);
  box(6, 1.4, 3, 8, top + 1.3, -0.5);
  for (const x of [-9, -7, -5, -3]) b.part(new THREE.CylinderGeometry(0.35, 0.35, 2.4, 8), "#6a6e72", { at: [x, top + 3, 2], bone: "base" });
  const r = rng(5);
  for (let i = 0; i < 6; i++) {
    const x = 1 + r() * 8;
    b.part(new THREE.CylinderGeometry(0.2, 0.2, 3 + r() * 2, 6), "#4a4d50", { at: [x, top + 2, -2 + r() * 2], bone: "base" });
  }
  // entrance core at ground
  box(6, 3, 4, 0, 1.8, 0, "#6a6965");
  box(5.2, 2.4, 0.12, 0, 1.5, 2.05, GLASS);
  // entrance canopy
  box(7, 0.35, 2.5, 0, 3.5, 3, concrete);
  // steps
  for (let i = 0; i < 4; i++) box(7, 0.15, 1 - i * 0.15, 0, 0.35 + i * 0.15, 4.4 - i * 0.4, darkConc);
  // planters
  for (let i = 0; i < 5; i++) {
    const x = -12 + i * 6;
    box(2.2, 0.7, 1, x, 0.65, D / 2 + 3, darkConc);
    b.part(new THREE.IcosahedronGeometry(0.7, 0), "#4a6b34", { at: [x, 1.4, D / 2 + 3], bone: "base" });
  }

  return b.root;
}
```