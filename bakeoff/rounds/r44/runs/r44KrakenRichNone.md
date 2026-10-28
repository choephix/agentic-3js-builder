```ts
import * as THREE from "three";
import { createBuilder, rng, catmull, svg, paint, mix, noise, smoothstep } from "agentic-3js-builder";
import { glow } from "agentic-3js-builder/kits/glow";

export const meta = {
  name: "Kraken Rising",
  description: "Stylized heroic-shooter kraken with a finned mantle, glowing eyes and spots, a beak, and eight spread tentacles.",
};

const PURPLE = "#6a3fb5", DEEP = "#2d1f6b", BELLY = "#ffb07a", TEAL = "#37e6d2", ORANGE = "#ff8a2b", BEAK = "#2b1a3a";

const skin = paint((p, n) => {
  const up = smoothstep(-0.5, 0.6, n.y);
  const m = noise(p, 0.25, 4);
  const top = mix(DEEP, PURPLE, 0.4 + 0.6 * m);
  const c = mix(BELLY, top, up);
  return mix(c, "#9a6bff", 0.18 * smoothstep(0.7, 1, n.y) * m);
});
const tentSkin = paint((p, n) => {
  const up = smoothstep(-0.7, 0.3, n.y);
  return mix(mix("#ff9d6a", "#ffc79a", noise(p, 0.1, 2)), mix(DEEP, PURPLE, noise(p, 0.3, 3)), up);
});

const eyeTex = svg(
  `<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="#fff6d6"/><circle cx="32" cy="32" r="20" fill="#ff8a2b"/><circle cx="32" cy="32" r="20" fill="none" stroke="#7a2a00" stroke-width="3"/><ellipse cx="32" cy="32" rx="6" ry="15" fill="#1a0a24"/><circle cx="25" cy="23" r="5" fill="#fff"/></svg>`,
  { size: 128 },
);

export default function build() {
  const b = createBuilder({ name: "kraken" });
  const R = rng(5);
  const root = b.joint("body", { at: [0, 1.2, 0], role: "spine" });
  const head = b.joint("head", { parent: root, at: [0, 1.2, 0.3], dir: [0, 0, 1], role: "head" });
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.98, 0.55], dir: [0, -0.2, 1], role: "jaw" });

  // body
  b.part(new THREE.SphereGeometry(0.62, 12, 8), skin, { bone: root, at: [0, 1.2, 0] });
  const mantle = b.chain("mantle", catmull([[0, 1.2, 0], [0, 1.75, -0.15], [0, 2.35, -0.45], [0, 2.9, -0.85]]), {
    parent: root, count: 3, role: "spine",
  });
  const mt = b.sweep(mantle, [0.62, 0.78, 0.6, 0.12], { color: skin, caps: "round" });
  // fins
  for (const s of [1, -1])
    b.extrude([[0, 0], [0.55, 0.15], [0.7, 0.5, "sharp"], [0.5, 0.9], [0, 0.75]], {
      at: [s * 0.62, 1.95, -0.25], x: [s, 0, 0], y: [0, 1, -0.4], thickness: [0.05, 0.015], smoothing: 1,
      color: TEAL, bone: mantle.joints[1],
    });
  // dorsal spikes
  for (const t of [0.35, 0.5, 0.65, 0.8]) {
    const h = mt.at(t, 0);
    b.stick(new THREE.ConeGeometry(0.07, 0.3 - t * 0.12, 6), ORANGE, h);
  }
  // glowing spots
  const hits = b.surface(mt).scatter(16, { rng: R, minDist: 0.25, filter: (h) => h.n.y > 0 });
  for (const h of hits) glow(b.stick(new THREE.SphereGeometry(0.045, 6, 4), TEAL, h, { embed: 0.4 }), 1.3);

  // eyes
  for (const s of [1, -1]) {
    const e: [number, number, number] = [s * 0.33, 1.5, 0.48];
    b.part(new THREE.SphereGeometry(0.17, 10, 8), "#fff6d6", { bone: head, at: e });
    const d: [number, number, number] = [s * 0.35, 0.1, 1];
    const len = Math.hypot(...d);
    b.part(new THREE.CircleGeometry(0.15, 16), "#ffffff", {
      bone: head, at: [e[0] + (d[0] / len) * 0.16, e[1] + (d[1] / len) * 0.16, e[2] + (d[2] / len) * 0.16],
      dir: d, axis: "z", texture: eyeTex,
    });
    // brow
    b.rod([s * 0.5, 1.72, 0.45], [s * 0.15, 1.62, 0.6], 0.04, DEEP, { bone: head });
  }

  // beak
  b.spike([0, 1.05, 0.5], [0, 0.78, 0.85], null, 0.14, { color: BEAK, bone: head });
  b.spike([0, 0.97, 0.5], [0, 0.78, 0.88], null, 0.1, { color: "#4a2d5a", bone: jaw });
  b.spike([0, 0.97, 0.5], [0, 1.0, 0.88], null, 0.08, { color: "#4a2d5a", bone: jaw });
  b.part(new THREE.SphereGeometry(0.08, 6, 4), "#ff5a7a", { bone: jaw, at: [0, 0.94, 0.6] });

  // tentacles
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const long = i % 2 === 0 ? 1 : 0.8;
    const pt = (r: number, y: number) => [Math.sin(a) * r, y, Math.cos(a) * r];
    const path = catmull([
      pt(0.35, 1.1), pt(0.95, 0.8), pt(1.6 * long, 0.28), pt(2.3 * long, 0.11), pt(2.9 * long, 0.14),
      pt(3.3 * long, 0.4),
    ]);
    const ch = b.chain(`tent${i}_`, path, { parent: root, count: 6, role: "tentacle" });
    const sw = b.sweep(ch, (t) => 0.21 * (1 - t) + 0.035, { color: tentSkin });
    for (let k = 0; k < 7; k++) {
      const t = 0.15 + k * 0.11;
      const h = sw.at(t, 180);
      b.stick(new THREE.CylinderGeometry(0.045 * (1 - t * 0.6), 0.05 * (1 - t * 0.6), 0.03, 7), "#fff0d8", h, { embed: 0.3 });
    }
    if (i % 2 === 0) glow(b.stick(new THREE.SphereGeometry(0.05, 6, 4), ORANGE, sw.at(0.93, 0), { embed: 0.3 }), 1.2);
  }
  return b.root;
}
```