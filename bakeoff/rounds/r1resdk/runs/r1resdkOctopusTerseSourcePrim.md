```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mix, noise, spots, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Octopus",
  description: "A stylized octopus in rest pose: bulbous mantle, eyes, separate jaw beak, eight tentacles with suckers.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "octopus", detail: 0.8 });

  const SKIN = "#d9573f";
  const DARK = "#a63a2e";
  const BELLY = "#f2b59a";

  const skin = mottle(SKIN, DARK, { size: 0.12, seed: 3, contrast: 1.2 });
  const mantlePaint = spots(mottle(SKIN, DARK, { size: 0.15, seed: 5 }), "#7a2a24", { size: 0.07, amount: 0.4, seed: 2 });

  // Skeleton
  const root = b.joint("body", { at: [0, 0.2, 0] });
  const head = b.joint("head", { parent: root, at: [0, 0.22, 0], dir: [0, 1, 0.1] });
  const mantleJ = b.joint("mantle", { parent: head, at: [0, 0.3, -0.1], dir: [0, 0.8, -0.6] });

  // Body
  b.part(new THREE.SphereGeometry(0.2, 12, 9), skin, { bone: root, at: [0, 0.22, 0.02], scale: [1.15, 0.8, 1.1] });
  b.part(new THREE.SphereGeometry(0.19, 12, 9), skin, { bone: head, at: [0, 0.38, 0.0], scale: [1, 1, 1.05] });
  // mantle
  b.part(new THREE.SphereGeometry(0.22, 12, 10), mantlePaint, {
    bone: mantleJ, at: [0, 0.55, -0.12], scale: [0.95, 1.25, 1.0], rotation: [-35, 0, 0],
  });
  // brow ridges
  for (const s of [1, -1]) {
    b.part(new THREE.SphereGeometry(0.075, 8, 6), DARK, { bone: head, at: [s * 0.13, 0.43, 0.14], scale: [1.2, 0.8, 1] });
    // eyes
    b.part(new THREE.SphereGeometry(0.06, 10, 8), "#f3e6b0", { bone: head, at: [s * 0.15, 0.42, 0.17] });
    b.part(new THREE.SphereGeometry(0.035, 8, 6), "#111111", { bone: head, at: [s * 0.17, 0.42, 0.21], scale: [0.7, 1, 0.8] });
    b.part(new THREE.SphereGeometry(0.01, 6, 4), "#ffffff", { bone: head, at: [s * 0.178, 0.435, 0.235] });
    // eyelid
    b.part(new THREE.SphereGeometry(0.065, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), DARK, {
      bone: head, at: [s * 0.15, 0.425, 0.17], scale: [1, 0.9, 1],
    });
  }

  // Siphon
  b.capsule([0.12, 0.25, 0.16], [0.17, 0.3, 0.27], 0.03, { color: DARK, bone: head });

  // Beak: upper and lower jaw under the arm web
  const jaw = b.joint("jaw", { parent: head, at: [0, 0.2, 0.17], dir: [0, -0.3, 1], role: "jaw" });
  b.part(new THREE.ConeGeometry(0.04, 0.08, 6), "#3a2a22", { bone: head, at: [0, 0.22, 0.2], rotation: [100, 0, 0] });
  b.part(new THREE.ConeGeometry(0.035, 0.07, 6), "#2a1c16", { bone: jaw, at: [0, 0.18, 0.21], rotation: [-80, 0, 0] });

  // Tentacles
  const tex = new THREE.Object3D();
  void tex;
  const R = rng(11);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    const dx = Math.sin(a);
    const dz = Math.cos(a);
    const side = dx >= 0 ? "L" : "R";
    const name = `arm${i + 1}${side}`;
    const r0 = 0.17;
    const base = new THREE.Vector3(dx * r0, 0.14, dz * r0);
    const curlDir = i % 2 ? 1 : -1;
    const pts: THREE.Vector3[] = [];
    const N = 6;
    for (let k = 0; k <= N; k++) {
      const t = k / N;
      const out = r0 + 0.12 + t * 0.5;
      const tw = a + curlDir * t * t * 0.9 + (R() - 0.5) * 0.05;
      const y = 0.14 - t * 0.1 + (t > 0.5 ? (t - 0.5) * 0.1 : 0);
      pts.push(new THREE.Vector3(Math.sin(tw) * out * (k === 0 ? 0.9 : 1), Math.max(0.03, y), Math.cos(tw) * out));
    }
    pts[0] = base;
    const chain = b.chain(name, pts.map((p) => p.toArray() as [number, number, number]), {
      parent: root, role: "tentacle", count: 5,
      names: [0, 1, 2, 3, 4].map((n) => `${name}_${n + 1}`),
    });
    const sw = b.sweep(chain, (t) => 0.065 * (1 - t) + 0.008, {
      color: skin, sides: 7, caps: { start: "round", end: "round" },
      sectors: [[110, 250, BELLY]],
    });
    // suckers
    b.along(chain, 9, (p) => {
      const t = p.t;
      const rr = 0.065 * (1 - t) + 0.008;
      const pt = sw.at(t, 180, 0);
      b.stick(new THREE.CylinderGeometry(rr * 0.5, rr * 0.55, rr * 0.35, 6), "#f6d3c0", pt, { embed: 0.3 });
    });
  }
  // Web between arms base
  b.part(new THREE.CylinderGeometry(0.2, 0.26, 0.06, 8), skin, { bone: root, at: [0, 0.08, 0] });
  // Floor-touching adjustment: base disc sits on y 0.05..0.11; arms lie near y 0.03
  return b.root;
}
```