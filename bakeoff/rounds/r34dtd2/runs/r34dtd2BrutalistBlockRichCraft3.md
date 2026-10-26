```ts
import * as THREE from "three";
import { createBuilder, paint, mottle, mix, noise, smoothstep, svg, rng } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Brutalist Housing Block",
  description: "Raw board-formed concrete slab block with stacked balconies, a stair tower, pilotis and lit windows.",
};

export default function build() {
  const b = createBuilder({ name: "brutalist_block" });
  b.joint("base", { at: [0, 0, 0] });
  const r = rng(11);

  const CONC = paint((p, n, s) => {
    const base = mix("#8d8b86", "#b3b0a8", noise(p, 0.9, 3));
    let c = mix(base, "#5f5d59", 0.55 * smoothstep(0.55, 0.8, noise(p, 0.25, 7)));
    // board-form seams
    const seam = Math.abs(((p.y / 0.12) % 1) - 0.5) > 0.47;
    if (seam) c = mix(c, "#4b4a47", 0.5);
    // rain streaks and grime near the ground
    c = mix(c, "#3f4a3a", 0.35 * smoothstep(0.8, 0, p.y) * noise(p, 0.3, 9));
    const top = smoothstep(0.3, 1, n.y);
    return mix(c, "#c9c6bd", 0.25 * top);
  });
  const DARK = paint((p) => mix("#4e4d4a", "#6b6a66", noise(p, 0.4, 5)));
  const GLASS = "#1c2a33";

  const W = 24, D = 7, FLOORS = 9, FH = 2.9, PIL = 3.2;
  const top = PIL + FLOORS * FH;

  // pilotis
  for (let i = 0; i < 7; i++) {
    const x = -W / 2 + 1 + (i * (W - 2)) / 6;
    for (const z of [-2.5, 2.5])
      b.part(new THREE.BoxGeometry(1, PIL, 1), CONC, { at: [x, PIL / 2, z] });
  }
  // main slab
  b.part(new THREE.BoxGeometry(W, FLOORS * FH, D), CONC, { at: [0, PIL + (FLOORS * FH) / 2, 0] });
  // roof parapet and plant
  b.part(new THREE.BoxGeometry(W + 0.4, 0.5, D + 0.4), DARK, { at: [0, top + 0.25, 0] });
  b.part(new THREE.BoxGeometry(7, 2, 3.5), CONC, { at: [-4, top + 1.5, 0] });
  for (let i = 0; i < 3; i++)
    b.part(new THREE.CylinderGeometry(0.35, 0.35, 2.6, 6), DARK, { at: [5 + i * 1.6, top + 1.8, 0.5] });

  // stair tower at right end
  b.part(new THREE.BoxGeometry(3.4, top + 3, 4.4), CONC, { at: [W / 2 + 1.2, (top + 3) / 2, 0.8] });
  const slit = svg(`<svg viewBox="0 0 10 40"><rect width="10" height="40" fill="#14202a"/><g stroke="#8aa" stroke-width="1"><path d="M0 8H10M0 16H10M0 24H10M0 32H10"/></g></svg>`, { size: 64 });
  b.part(new THREE.PlaneGeometry(0.7, top - 1), "#ffffff", { at: [W / 2 + 1.2, top / 2 + 1, 3.01], texture: slit });

  // facade windows + balconies on both sides
  const win = svg(`<svg viewBox="0 0 40 30"><rect width="40" height="30" fill="#1c2a33"/><rect x="2" y="2" width="17" height="26" fill="#2b4150"/><rect x="21" y="2" width="17" height="26" fill="#243846"/><path d="M4 4L10 4L4 14Z" fill="#6f8da0" opacity=".5"/></svg>`, { size: 128 });
  const lit = svg(`<svg viewBox="0 0 40 30"><rect width="40" height="30" fill="#ffc062"/><rect x="19" width="2" height="30" fill="#7a4a1a"/></svg>`, { size: 64 });
  const bays = 10;
  for (const side of [1, -1]) {
    const z = side * (D / 2);
    for (let f = 0; f < FLOORS; f++) {
      const y = PIL + f * FH;
      // slab balcony band
      b.part(new THREE.BoxGeometry(W, 0.22, 1.5), DARK, { at: [0, y + 0.11, z + side * 0.75] });
      // parapet
      b.part(new THREE.BoxGeometry(W, 0.9, 0.18), CONC, { at: [0, y + 0.67, z + side * 1.5] });
      for (let i = 0; i < bays; i++) {
        const x = -W / 2 + 1.2 + i * ((W - 2.4) / (bays - 1));
        const isLit = r() < 0.22;
        const m = b.part(new THREE.PlaneGeometry(1.6, 1.2), "#ffffff", {
          at: [x, y + 1.85, z + side * 0.02], dir: [0, 0, side], axis: "z", texture: isLit ? lit : win,
        });
        if (isLit) glow(m, 1.2);
        // door panel
        b.part(new THREE.BoxGeometry(0.6, 1.9, 0.08), r() < 0.5 ? "#a3402a" : "#c9a23a", { at: [x + 1.0, y + 1.15, z + side * 0.05] });
      }
    }
    // party-wall fins
    for (let i = 0; i <= bays; i++) {
      const x = -W / 2 + 0.2 + i * ((W - 0.4) / bays);
      b.part(new THREE.BoxGeometry(0.3, FLOORS * FH, 1.5), CONC, { at: [x, PIL + (FLOORS * FH) / 2, z + side * 0.75] });
    }
  }
  // end gable windows
  for (let f = 0; f < FLOORS; f += 2)
    b.part(new THREE.PlaneGeometry(1.2, 1.2), "#ffffff", { at: [-W / 2 - 0.02, PIL + f * FH + 1.8, 0], dir: [-1, 0, 0], axis: "z", texture: win });
  // entrance core under pilotis
  b.part(new THREE.BoxGeometry(4, PIL - 0.4, 3), DARK, { at: [0, (PIL - 0.4) / 2, 0] });
  glow(b.part(new THREE.BoxGeometry(2.4, 2.2, 0.1), "#ffd68a", { at: [0, 1.2, 1.55] }), 1.3);
  // ground plinth
  b.part(new THREE.BoxGeometry(W + 7, 0.2, D + 5), DARK, { at: [0, 0.1, 0] });

  return b.root;
}
```