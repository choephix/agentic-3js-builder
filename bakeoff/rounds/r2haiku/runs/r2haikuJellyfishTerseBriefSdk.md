```ts
import * as THREE from "three";
import { createBuilder } from "agentic-3js-builder";

export const meta = {
  name: "jellyfish",
  description:
    "A stylised moon jellyfish: a domed bell with a frilled rim and spots, four ruffled oral arms, and eight wavy tentacles with glowing tips.",
};

const BELL_Y = 0.8; // height of the bell's open underside (m)
const BELL_R = 0.26; // bell radius (m)
const BELL_SQ = 0.75; // vertical squash of the dome
const TENT_LEN = 0.78; // tentacles reach down to about y = 0.02

export default function build() {
  const b = createBuilder({ name: "jellyfish" });

  // Root joint: the bell. Everything else hangs from it.
  b.joint("bell", { at: [0, BELL_Y, 0] });

  // ---- Bell dome ----
  const dome = new THREE.SphereGeometry(BELL_R, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  b.part(dome, "#c77fe0", { at: [0, BELL_Y, 0], scale: [1, BELL_SQ, 1] });

  // Darker inner underside, a flat disc just under the open rim.
  const underside = new THREE.CircleGeometry(BELL_R * 0.9, 16);
  underside.rotateX(Math.PI / 2);
  b.part(underside, "#6b3488", { at: [0, BELL_Y - 0.005, 0] });

  // Bright rim band around the bell edge.
  const rim = new THREE.TorusGeometry(BELL_R, 0.018, 6, 24);
  rim.rotateX(Math.PI / 2);
  b.part(rim, "#f2b8ff", { at: [0, BELL_Y, 0] });

  // Scalloped rim lobes.
  const LOBES = 16;
  for (let i = 0; i < LOBES; i++) {
    const a = (i / LOBES) * Math.PI * 2;
    b.part(new THREE.SphereGeometry(0.022, 8, 6), "#f7d6ff", {
      at: [Math.cos(a) * BELL_R, BELL_Y - 0.004, Math.sin(a) * BELL_R],
    });
  }

  // Spots scattered over the dome in a golden-angle spiral.
  const SPOTS = 14;
  for (let k = 0; k < SPOTS; k++) {
    const phi = k * 2.39996;
    const theta = 0.25 + 1.0 * Math.sqrt((k + 0.5) / SPOTS);
    const rx = BELL_R * 1.02;
    const x = rx * Math.sin(theta) * Math.cos(phi);
    const z = rx * Math.sin(theta) * Math.sin(phi);
    const y = BELL_Y + BELL_R * BELL_SQ * 1.02 * Math.cos(theta);
    const size = 0.014 + 0.005 * (k % 3);
    b.part(new THREE.SphereGeometry(size, 8, 6), "#fff4c2", { at: [x, y, z] });
  }

  // ---- Tentacles: eight long, wavy, trailing strands ----
  const TENT_COUNT = 8;
  for (let i = 0; i < TENT_COUNT; i++) {
    const a0 = (i / TENT_COUNT) * Math.PI * 2 + 0.2;
    const pts: number[][] = [];
    for (let k = 0; k <= 8; k++) {
      const s = k / 8;
      const y = BELL_Y - 0.02 - s * TENT_LEN;
      const r =
        BELL_R * 0.88 * (1 - 0.25 * s) + 0.035 * s * Math.sin(s * Math.PI * 3 + i * 0.9);
      const aa = a0 + 0.06 * s * Math.sin(s * 5 + i);
      pts.push([Math.cos(aa) * r, y, Math.sin(aa) * r]);
    }
    b.chain(`tent${i}`, pts);
    b.sweep(pts, 0.011, { color: "#f0a8f2" });

    // Glowing tip.
    b.part(new THREE.SphereGeometry(0.018, 8, 6), "#fff27a", { at: pts[pts.length - 1] });
  }

  // ---- Oral arms: four thicker, ruffled arms near the centre ----
  const ARMS = 4;
  for (let j = 0; j < ARMS; j++) {
    const a0 = Math.PI / 4 + j * (Math.PI / 2);
    const pts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const s = k / 6;
      const y = BELL_Y - 0.03 - s * 0.62;
      const r = 0.07 + 0.05 * s + 0.02 * Math.sin(s * Math.PI * 2 + j);
      const aa = a0 + 0.12 * Math.sin(s * 4 + j * 1.7);
      pts.push([Math.cos(aa) * r, y, Math.sin(aa) * r]);
    }
    b.chain(`oral${j}`, pts);
    b.sweep(pts, 0.02, { color: "#f7c6ec" });
  }

  return b.root;
}
```