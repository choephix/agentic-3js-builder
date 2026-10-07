```ts
import * as THREE from "three";
import { createBuilder, frame, catmull, gradient } from "agentic-3js-builder";

export const meta = {
  name: "moon jellyfish",
  description:
    "A drifting moon jelly: a translucent pale-blue bell with a lantern core, four pink horseshoe gonads, a frilly fringe of fine tentacles and four ruffled pearly oral arms.",
};

const DEG = Math.PI / 180;

const DEEP = "#7fbfe6";
const GLOW = "#e4f7ff";
const CORE = "#eafcff";
const PINK = "#ff6fb5";
const PEARL = "#f4f1ea";
const LILAC = "#c9a7e8";
const FRILL = "#e4dcff";
const FRILL_PALE = "#d8efff";

export default function build() {
  const b = createBuilder({ name: "moon-jellyfish" });

  // Skeleton: the bell is the root joint, held at drifting height.
  const bell = b.joint("bell", { at: [0, 1.5, 0] });

  // Translucent-looking bell: a shell of revolution, paled toward the crown.
  const bellColor = gradient(DEEP, GLOW, [0, 1.5, 0], [0, 1.72, 0]);
  const shell: [number, number][] = [
    [0, 0.22],
    [0.12, 0.205],
    [0.2, 0.15],
    [0.25, 0.06],
    [0.265, 0],
    [0.24, 0],
    [0.225, 0.05],
    [0.19, 0.12],
    [0.1, 0.185],
    [0, 0.2],
  ];
  b.lathe(shell, { at: [0, 1.5, 0], bone: bell, smoothing: 1, color: bellColor });

  // Lantern core seen up through the bell.
  b.part(new THREE.SphereGeometry(0.1, 12, 8), CORE, { bone: bell, at: [0, 1.6, 0] });

  // Four pink horseshoe gonads on the inner dome, gaps facing outward.
  const horseshoe: [number, number][] = [];
  for (let a = 20; a <= 340; a += 40) horseshoe.push([0.09 * Math.cos(a * DEG), 0.09 * Math.sin(a * DEG)]);
  for (let a = 340; a >= 20; a -= 40) horseshoe.push([0.055 * Math.cos(a * DEG), 0.055 * Math.sin(a * DEG)]);
  for (const k of [45, 135, 225, 315]) {
    const th = k * DEG;
    const c = Math.cos(th);
    const s = Math.sin(th);
    b.extrude(horseshoe, {
      at: [0.12 * c, 1.58, 0.12 * s],
      x: [c, 0, s],
      y: [-s, 0, c],
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: PINK,
      bone: bell,
    });
  }

  // Frilly rim: two rows of fine tentacles hanging from the bell edge.
  const rimLine = frame(bell.at, [0, -1, 0]);
  b.ring(rimLine, { count: 56, radius: 0.25, tilt: 60 }, (f) =>
    b.spike(f, f, 0.15, 0.006, { color: FRILL }),
  );
  b.ring(rimLine, { count: 40, radius: 0.215, tilt: 72 }, (f) =>
    b.spike(f, f, 0.09, 0.004, { color: FRILL_PALE }),
  );

  // Four long ruffled oral arms trailing below, pearly white fading to lilac.
  for (let i = 0; i < 4; i++) {
    const th = (45 + i * 90) * DEG;
    const c = Math.cos(th);
    const s = Math.sin(th);
    const tx = -s;
    const tz = c;
    // Point at radius r, height y, sideways along the arm's tangent by `along`.
    const P = (r: number, y: number, along: number): [number, number, number] => [
      r * c + along * tx,
      y,
      r * s + along * tz,
    ];
    const path = catmull([
      P(0.1, 1.42, 0),
      P(0.17, 1.1, 0.05),
      P(0.2, 0.8, -0.04),
      P(0.17, 0.55, 0.06),
      P(0.22, 0.3, 0.1),
    ]);
    const arm = b.chain(`oralArm${i}`, path, { parent: bell, count: 6, role: "tentacle" });
    b.sweep(arm, (t: number) => (0.035 * (1 - t) + 0.012) * (1 + 0.3 * Math.sin(t * Math.PI * 12)), {
      color: PEARL,
      bands: [
        [0.6, PEARL],
        [1, LILAC],
      ],
    });
  }

  return b.root;
}
```