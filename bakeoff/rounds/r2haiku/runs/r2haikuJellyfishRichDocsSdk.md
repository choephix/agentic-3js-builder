```ts
import * as THREE from "three";
import { createBuilder, frame, offset, catmull, bezier, gradient } from "agentic-3js-builder";

export const meta = {
  name: "Moon jellyfish",
  description: "A glowing moon jellyfish drifting upward: a pale translucent bell with four pink gonad horseshoes, a fine frilled rim, and four ruffled pearl-and-lilac oral arms.",
};

const BELL = "#8fd0f0";
const GLOW = "#eefcff";
const RIM = "#bfe9ff";
const PINK = "#ff7fb8";
const PEARL = "#f3efff";
const LILAC = "#c9a6ff";
const CORE = "#fff6ff";

// Horseshoe outline: an arc of radius R swept 300 degrees, closed by a return arc of radius r.
function horseshoe(): [number, number][] {
  const R = 0.07;
  const r = 0.042;
  const pts: [number, number][] = [];
  for (let i = 0; i <= 10; i++) {
    const a = ((-70 + 32 * i) * Math.PI) / 180;
    pts.push([R * Math.cos(a), R * Math.sin(a)]);
  }
  for (let i = 10; i >= 0; i--) {
    const a = ((-70 + 32 * i) * Math.PI) / 180;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "moon-jellyfish" });

  // Skeleton: one root joint for the bell, at the bell's base height.
  const BASE_Y = 1.3;
  const bell = b.joint("bell", { at: [0, BASE_Y, 0] });

  // Bell: a thin turned shell, so the inside wall shows from below.
  // Bell colour glows brighter toward the crown and fades to blue at the rim.
  const bellPaint = gradient(GLOW, BELL, [0, BASE_Y + 0.15, 0], [0, BASE_Y, 0]);
  b.lathe(
    [
      [0.25, 0],
      [0.245, 0.06],
      [0.21, 0.115],
      [0.13, 0.148],
      [0, 0.156, "sharp"],
      [0, 0.136, "sharp"],
      [0.12, 0.124],
      [0.19, 0.095],
      [0.228, 0.045],
      [0.238, 0],
    ],
    { at: [0, BASE_Y, 0], bone: bell, segments: 24, smoothing: 1, color: bellPaint },
  );

  // Soft light source inside the bell.
  b.part(new THREE.SphereGeometry(0.07, 8, 6), CORE, {
    bone: bell,
    at: [0, BASE_Y + 0.05, 0],
  });

  // Four pink horseshoe gonads, lying flat inside the bell, openings toward the centre.
  const shoe = horseshoe();
  for (const deg of [45, 135, 225, 315]) {
    const th = (deg * Math.PI) / 180;
    const x = [Math.cos(th), 0, -Math.sin(th)] as [number, number, number];
    const y = [Math.sin(th), 0, Math.cos(th)] as [number, number, number];
    b.extrude(shoe, {
      at: [0.1 * Math.sin(th), BASE_Y + 0.035, 0.1 * Math.cos(th)],
      bone: bell,
      x,
      y,
      thickness: 0.014,
      bevel: 0.004,
      smoothing: 1,
      color: PINK,
    });
  }

  // Frilled rim: fine hanging tentacles around the bell edge.
  const rim = frame([0, BASE_Y, 0], [0, 1, 0]);
  b.ring(
    rim,
    { count: 48, radius: 0.245 },
    (item) => {
      b.sweep(
        bezier(
          item,
          offset(item, [0, -1, 0], 0.05),
          offset(offset(item, [0, -1, 0], 0.12), item.outward, 0.02),
        ),
        [0.004, 0.0015],
        { color: RIM },
      );
    },
  );

  // Four ruffled oral arms trailing below the bell, pearl fading to lilac.
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const o: [number, number, number] = [Math.sin(a), 0, Math.cos(a)];
    const lat: [number, number, number] = [Math.cos(a), 0, -Math.sin(a)];
    const R = [0.14, 0.2, 0.22, 0.18, 0.24];
    const Y = [BASE_Y - 0.02, 1.12, 0.96, 0.8, 0.64];
    const pts: number[][] = [];
    for (let i = 0; i < 5; i++) {
      const lateral = 0.04 * Math.sin(i * 1.6 + k);
      pts.push([
        R[i] * o[0] + lateral * lat[0],
        Y[i],
        R[i] * o[2] + lateral * lat[2],
      ]);
    }
    const arm = b.chain(`oral${k}`, catmull(pts), {
      parent: bell,
      names: (i: number) => `oral${k}_${i + 1}`,
      role: "tentacle",
    });

    // Flat, rippling ribbon: wide sideways, ruffled along its normal.
    b.sweep(
      arm,
      (t: number) => {
        const taper = 1 - 0.6 * t;
        const ruffle = 1 + 0.25 * Math.sin(t * 22 + k);
        return [0.02 * taper + 0.004, (0.035 * taper + 0.004) * ruffle];
      },
      {
        color: PEARL,
        bands: [
          [0.5, PEARL],
          [1, LILAC],
        ],
      },
    );

    // Small lilac frills around the arm.
    b.along(arm, 5, (at) => {
      b.ring(at, { count: 6, radius: 0.03, tilt: 40 }, (f) => {
        b.spike(f, f, 0.03, 0.005, { color: LILAC });
      });
    });
  }

  return b.root;
}
```