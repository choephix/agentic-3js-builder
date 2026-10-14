A jellyfish: a translucent domed bell with a spotted crown, a fringe of fourteen tapering tentacles with nematocyst knobs, and four frilled oral arms. Tentacle tips sit just above the floor.

```ts
import * as THREE from "three";
import { createBuilder, catmull, gradient, rng, stripes } from "agentic-3js-builder";

export const meta = {
  name: "jellyfish",
  description: "A stylised jellyfish: domed bell with spots, fringe of knobbed tentacles, four striped oral arms.",
};

const BELL_TOP = "#8fe9f2";
const BELL_RIM = "#f48fbd";
const SPOT = "#fff6fb";
const RIM = "#ffb3d4";
const TENT = "#f7b8da";
const KNOB = "#ff5f9e";
const ARM_BASE = "#ffe3ef";
const ARM_STRIPE = "#e0557f";

export default function build() {
  const b = createBuilder({ name: "jellyfish" });

  // Root joint at the bottom rim of the bell.
  const bell = b.joint("bell", { at: [0, 0.7, 0] });

  // Bell: a thin shell lathed from a profile (outer wall up to the crown, inner wall back down).
  const bellOutline: [number, number][] = [
    [0.16, 0.0],
    [0.165, 0.03],
    [0.15, 0.12],
    [0.11, 0.19],
    [0.06, 0.235],
    [0.0, 0.25],
    [0.0, 0.23],
    [0.05, 0.215],
    [0.09, 0.175],
    [0.125, 0.1],
    [0.135, 0.03],
    [0.14, 0.0],
  ];
  const bellPaint = gradient(BELL_TOP, BELL_RIM, [0, 0.94, 0], [0, 0.72, 0]);
  const dome = b.lathe(bellOutline, { at: [0, 0.7, 0], bone: bell, smoothing: 0, color: bellPaint });

  // Spots scattered over the bell skin.
  const bellSkin = b.surface(dome);
  for (const hit of bellSkin.scatter(22, { rng: rng(5), minDist: 0.035, filter: (h) => h.n.y > -0.2 })) {
    b.stick(new THREE.SphereGeometry(0.011, 6, 4), SPOT, hit, { embed: 0.4 });
  }

  // Bell rim: a flat torus around the bottom edge.
  b.part(new THREE.TorusGeometry(0.158, 0.011, 6, 28), RIM, {
    bone: bell,
    at: [0, 0.702, 0],
    rotation: [90, 0, 0],
  });

  // Fringe of tentacles hanging from the rim.
  const jitter = rng(11);
  const w = () => (jitter() - 0.5) * 0.03;
  const N = 14;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const s = Math.sin(a);
    const c = Math.cos(a);
    const rr = 0.13;
    const pts = [
      [rr * s, 0.69, rr * c],
      [(rr + 0.03) * s + w(), 0.52, (rr + 0.03) * c + w()],
      [(rr + 0.05) * s + w(), 0.34, (rr + 0.05) * c + w()],
      [(rr + 0.03) * s + w(), 0.16, (rr + 0.03) * c + w()],
      [(rr + 0.05) * s + w(), 0.014, (rr + 0.05) * c + w()],
    ];
    const tent = b.chain(`tent${i}`, catmull(pts), {
      parent: bell,
      count: 4,
      names: [0, 1, 2, 3].map((j) => `tent${i}_${j}`),
      role: "tentacle",
    });
    b.sweep(tent, [0.013, 0.004], { color: TENT });
    // Nematocyst knobs along the tentacle.
    b.along(
      tent,
      3,
      (at) => {
        b.part(new THREE.SphereGeometry(0.009, 6, 4), KNOB, { frame: at });
      },
      { from: 0.25, to: 0.85 },
    );
  }

  // Four frilled oral arms under the bell centre.
  const armPaint = stripes(ARM_BASE, ARM_STRIPE, { size: 0.05 });
  for (let k = 0; k < 4; k++) {
    const a = ((45 + k * 90) * Math.PI) / 180;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    const pts = [
      [0.04 * sx, 0.66, 0.04 * cz],
      [0.07 * sx, 0.5, 0.07 * cz],
      [0.1 * sx, 0.34, 0.09 * cz + 0.02],
      [0.07 * sx, 0.18, 0.07 * cz + 0.04],
      [0.1 * sx, 0.02, 0.1 * cz],
    ];
    const arm = b.chain(`arm${k}`, catmull(pts), {
      parent: bell,
      count: 3,
      names: [0, 1, 2].map((j) => `arm${k}_${j}`),
      role: "tentacle",
    });
    b.sweep(arm, [0.017, 0.006], { color: armPaint });
  }

  return b.root;
}
```