```ts
import * as THREE from "three";
import { createBuilder, catmull, gradient, rng } from "agentic-3js-builder";

export const meta = {
  name: "jellyfish",
  description:
    "A stylised moon jelly: a faceted two-tone dome bell with glowing nodes, eight beaded ribbon tentacles and four frilled oral arms.",
};

const BELL_TOP = "#7b5cff";
const BELL_RIM = "#3ee0ff";
const GLOW = "#fff27a";
const CAVITY = "#ff7ab8";
const TENT = "#b8f0ff";
const TENT_TIP = "#ff6fae";
const ARM = "#ff9ec4";
const FRILL = "#fff4f8";

const HIP_Y = 0.7;

export default function build() {
  const b = createBuilder({ name: "jellyfish" });
  const r = rng(11);

  // Skeleton root: the bell's centre, at the rim plane.
  const hips = b.joint("hips", { at: [0, HIP_Y, 0], role: "spine" });

  // Hollow dome bell: outer wall up to the crown, inner wall back down.
  // Its paint runs from violet at the crown to cyan at the rim.
  const bell = b.lathe(
    [
      [0.18, 0.005],
      [0.2, 0],
      [0.2, 0.02],
      [0.19, 0.08],
      [0.15, 0.15],
      [0.09, 0.19],
      [0, 0.215],
      [0, 0.195],
      [0.07, 0.175],
      [0.13, 0.13],
      [0.17, 0.07],
      [0.18, 0.02],
    ],
    {
      at: [0, HIP_Y, 0],
      bone: hips,
      color: gradient(BELL_TOP, BELL_RIM, [0, HIP_Y + 0.21, 0], [0, HIP_Y + 0.01, 0]),
    },
  );

  // Pink mouth dome seen through the open underside.
  b.lathe(
    [
      [0, 0],
      [0.11, 0],
      [0.11, 0.01],
      [0.06, 0.04],
      [0, 0.05],
    ],
    { at: [0, HIP_Y + 0.005, 0], bone: hips, smoothing: 1, color: CAVITY },
  );

  // Glowing nodes scattered over the crown and flanks of the bell.
  const nodes = b.surface(bell).scatter(18, {
    rng: rng(7),
    minDist: 0.04,
    filter: (h) => h.n.y > -0.4,
  });
  for (const h of nodes) {
    b.stick(new THREE.SphereGeometry(0.012, 6, 4), GLOW, h, { embed: 0.4 });
  }

  // Eight long tentacles hanging from the rim, each with bioluminescent beads.
  const N = 8;
  for (let k = 0; k < N; k++) {
    const a = (k / N) * Math.PI * 2 + (r() - 0.5) * 0.3;
    const sx = Math.sin(a);
    const cz = Math.cos(a);
    // A point at radius `rad` from the axis, shifted sideways by `w`.
    const at = (rad: number, y: number, w: number): [number, number, number] => [
      sx * rad + cz * w,
      y,
      cz * rad - sx * w,
    ];
    const sway = (r() - 0.5) * 0.04;

    const path = catmull([
      at(0.165, HIP_Y - 0.01, 0),
      at(0.19, 0.55, sway),
      at(0.2, 0.4, -sway * 1.5),
      at(0.17, 0.25, sway),
      at(0.19, 0.12, -sway),
      at(0.14, 0.0, sway * 0.5),
    ]);

    const tent = b.chain(`tent${k}`, path, {
      parent: hips,
      count: 6,
      names: (i: number) => `t${k}_${i}`,
      role: "tentacle",
    });

    const body = b.sweep(tent, [0.022, 0], {
      color: TENT,
      bands: [
        [0.8, TENT],
        [1, TENT_TIP],
      ],
      caps: { start: "round", end: "point" },
    });

    b.along(body, 4, (p) => {
      b.stick(new THREE.SphereGeometry(0.009, 6, 4), GLOW, p, { embed: 0.35 });
    });
  }

  // Four short, flattened, frilly oral arms under the bell.
  for (let k = 0; k < 4; k++) {
    const A = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const ox = Math.cos(A) * 0.04;
    const oz = Math.sin(A) * 0.04;

    const armPath = catmull([
      [ox, HIP_Y - 0.04, oz],
      [ox * 2, 0.46, oz * 2],
      [ox * 2.6, 0.26, oz * 2.6 + 0.02],
      [ox * 2.2, 0.1, oz * 2.2],
      [ox * 2.4, 0.03, oz * 2.4],
    ]);

    const arm = b.chain(`arm${k}`, armPath, {
      parent: hips,
      count: 4,
      names: (i: number) => `arm${k}_${i}`,
      role: "tentacle",
    });

    const armBody = b.sweep(arm, (t: number) => [0.03 - 0.012 * t, 0.008], {
      color: ARM,
      caps: { start: "round", end: "round" },
    });

    b.along(armBody, 5, (p) => {
      b.stick(new THREE.SphereGeometry(0.013, 6, 4), FRILL, p, { embed: 0.3 });
    });
  }

  return b.root;
}
```