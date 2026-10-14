```ts
import * as THREE from "three";
import { createBuilder, catmull, rng, mottle, countershade, svg } from "agentic-3js-builder";

export const meta = { name: "Octopus", description: "Stylized octopus with a bulbous mantle, eight tapered curling arms with suckers, and big expressive eyes." };

export default function build() {
  const b = createBuilder({ name: "octopus" });
  const SKIN = "#d9573b", DARK = "#a63522", BELLY = "#f3b79a", SUCK = "#f6d3bd", EYE = "#f2e6a8", PUPIL = "#15111a";
  const coat = countershade(mottle(SKIN, DARK, { size: 0.08, contrast: 0.7, seed: 3 }), BELLY, { level: -0.4 });
  const r = rng(11);

  const body = b.joint("body", { at: [0, 0.3, 0], role: "spine" });
  const mantleJ = b.joint("mantle", { parent: body, at: [0, 0.38, -0.02], dir: [0, 0.8, -0.6], role: "spine" });
  const head = b.joint("head", { parent: body, at: [0, 0.3, 0.1], dir: [0, 0, 1], role: "head" });

  // mantle
  b.part(new THREE.SphereGeometry(0.2, 12, 9), coat, { bone: mantleJ, at: [0, 0.55, -0.12], scale: [0.9, 1.25, 1.0], flat: false });
  b.part(new THREE.SphereGeometry(0.19, 12, 9), coat, { bone: head, at: [0, 0.32, 0.04], scale: [1, 0.9, 1] });
  // brow ridge bumps
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.07, 8, 6), DARK, { bone: head, at: [s * 0.13, 0.4, 0.14], scale: [1, 0.7, 1] });
    b.part(new THREE.SphereGeometry(0.07, 10, 8), EYE, { bone: head, at: [s * 0.15, 0.37, 0.17] });
    b.part(new THREE.BoxGeometry(0.09, 0.022, 0.02), PUPIL, { bone: head, at: [s * 0.17, 0.37, 0.235] , rotation: [0, s * 25, 0] });
  }
  // siphon
  b.part(new THREE.CylinderGeometry(0.03, 0.04, 0.1, 7), DARK, { bone: head, at: [0.1, 0.22, 0.17], dir: [0.4, -0.3, 1] });
  // spots on mantle
  const sk = b.surface(b.root);
  for (const h of sk.scatter(14, { rng: r, minDist: 0.1, filter: (h) => h.n.y > 0.3 && h.at.y > 0.5 }))
    b.stick(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 6), DARK, h, { embed: 0.4 });

  // arms
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const dx = Math.sin(a), dz = Math.cos(a);
    const curl = i % 2 ? 1 : -1;
    const sx = dx * 0.14, sz = dz * 0.14;
    const pts = [
      [sx, 0.24, sz],
      [dx * 0.3, 0.1, dz * 0.3],
      [dx * 0.52 - dz * 0.05 * curl, 0.05, dz * 0.52 + dx * 0.05 * curl],
      [dx * 0.75 - dz * 0.14 * curl, 0.035, dz * 0.75 + dx * 0.14 * curl],
      [dx * 0.92 - dz * 0.3 * curl, 0.03, dz * 0.92 + dx * 0.3 * curl],
      [dx * 0.98 - dz * 0.48 * curl, 0.05, dz * 0.98 + dx * 0.4 * curl],
    ];
    const path = catmull(pts);
    const name = "arm" + i;
    const ch = b.chain(name, path, { parent: body, count: 4, role: "tentacle" });
    const sw = b.sweep(ch, (t) => 0.075 * (1 - t) + 0.012, { color: coat, caps: { start: "round", end: "round" }, sides: 8 });
    b.along(sw, 7, (at) => {
      const t = at.t;
      const h = sw.at(t, 180);
      b.stick(new THREE.SphereGeometry(0.022 * (1 - t * 0.6) + 0.005, 6, 4), SUCK, h, { embed: 0.3 });
    }, { from: 0.15, to: 0.9 });
  }
  return b.root;
}
```