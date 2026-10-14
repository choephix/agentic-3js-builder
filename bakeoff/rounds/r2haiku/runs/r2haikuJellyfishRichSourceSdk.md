```ts
import * as THREE from "three";
import { catmull, createBuilder, extrude, gradient, mix, paint, smoothstep } from "agentic-3js-builder";
import type { Rgb } from "agentic-3js-builder";

export const meta = {
  name: "Glowing moon jellyfish",
  description:
    "A translucent pale-blue moon jellyfish drifting upward: pink horseshoe gonads, a frilly rim of fine tentacles and four ruffled pearly oral arms, lit from within.",
};

const DEG = Math.PI / 180;

export default function moonJelly() {
  const b = createBuilder({ name: "moon jellyfish", detail: 1, paintSize: 1024 });
  const HOVER = 0.55; // the bell's rim height: the model drifts above the floor
  const up = new THREE.Vector3(0, 1, 0);

  // The root bone: everything hangs from the bell.
  b.joint("bell", { at: [0, HOVER, 0] });

  // Bell paint: a bright core glowing near the axis, paling toward the crown, a darker rim.
  const bellPaint = paint((p, n) => {
    const r = Math.hypot(p.x, p.z);
    const core = smoothstep(0.13, 0.02, r) * 0.85;
    const pale = mix("#8fd3f4", "#e2f8ff", n.y * 0.5 + 0.5);
    const lit = mix(pale, "#fff1c8", core);
    const rim = smoothstep(0.1, 0.15, r);
    return mix(lit, "#4fa6d6", rim * 0.35);
  });

  // Bell: a thin double-walled dome, lathed from the rim up over the crown and back in.
  b.lathe(
    [
      [0.15, 0],
      [0.155, 0.03],
      [0.14, 0.1],
      [0.1, 0.145],
      [0, 0.165],
      [0, 0.15],
      [0.09, 0.13],
      [0.125, 0.09],
      [0.13, 0.03],
      [0.135, 0],
    ],
    { color: bellPaint, at: [0, HOVER, 0], name: "bell", segments: 20 },
  );

  // Four pink horseshoe gonads sitting in the bell, one on each quarter.
  const shoe: Array<[number, number]> = [];
  const K = 8;
  for (let k = 0; k <= K; k++) {
    const a = (225 + (270 * k) / K) * DEG;
    shoe.push([0.026 * Math.cos(a), 0.026 * Math.sin(a)]);
  }
  for (let k = K; k >= 0; k--) {
    const a = (225 + (270 * k) / K) * DEG;
    shoe.push([0.016 * Math.cos(a), 0.016 * Math.sin(a)]);
  }
  for (const phi of [0, 90, 180, 270]) {
    const c = Math.cos(phi * DEG);
    const s = Math.sin(phi * DEG);
    b.extrude(shoe, {
      color: "#ff7fb0",
      at: [0.128 * c, HOVER + 0.075, 0.128 * s],
      x: [-s, 0, c],
      y: up,
      thickness: 0.01,
      bevel: 0.002,
      name: "gonad",
    });
  }

  // Frilly rim: fine translucent tentacles hanging from the bell's edge.
  const frill = "#f2fbff";
  const TENTACLES = 56;
  for (let i = 0; i < TENTACLES; i++) {
    const th = (i / TENTACLES) * Math.PI * 2;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const rr = 0.138;
    const len = i % 2 ? 0.07 : 0.05;
    const reach = rr + 0.02 + (i % 3) * 0.004;
    const a = [rr * c, HOVER - 0.003, rr * s];
    const m = [(rr + 0.02) * c, HOVER - len * 0.5, (rr + 0.02) * s];
    const e = [reach * c, HOVER - len, reach * s];
    b.sweep([a, m, e], [0.0032, 0.0008], { color: frill, caps: "round", name: "frill" });
  }

  // Four long oral arms: pearly white fading to lilac, ruffled ribbons on smooth chains.
  const armFill = gradient("#fdfbff", "#b594de", [0, HOVER - 0.01, 0], [0, HOVER - 0.36, 0]);
  const letters = ["A", "B", "C", "D"];
  for (let i = 0; i < 4; i++) {
    const th = (i * 90 + 45) * DEG;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const pts = Array.from({ length: 6 }, (_, k) => {
      const y = HOVER - 0.01 - k * 0.07;
      const r = 0.03 + k * 0.011;
      const sway = Math.sin(k * 1.4 + i * 1.9) * 0.028;
      return [c * r - s * sway, y, s * r + c * sway];
    });
    const chain = b.chain(`oral${letters[i]}`, catmull(pts), { count: 4, role: "tentacle" });
    b.sweep(chain, (t: number) => [0.011 + 0.005 * Math.sin(t * 30 + i), 0.0025] as const, {
      color: armFill,
      name: `oral${letters[i]}`,
    });
  }

  return b.root;
}
```