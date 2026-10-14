```ts
import * as THREE from "three";
import { createBuilder, rng, paint, mottle } from "agentic-3js-builder";

export const meta = {
  name: "Lighthouse Island",
  description: "A red-and-white striped lighthouse with a keeper's cottage and a small dock on a tiny rocky island.",
};

export default function build(): THREE.Object3D {
  const b = createBuilder({ name: "lighthouse" });
  b.joint("root", { at: [0, 0, 0] });
  const random = rng(7);

  const cyl = (rt: number, rb: number, h: number, seg = 12) => new THREE.CylinderGeometry(rt, rb, h, seg);
  const put = (
    geo: THREE.BufferGeometry,
    color: any,
    at: [number, number, number],
    o: { rotation?: [number, number, number]; scale?: number | [number, number, number]; flat?: boolean } = {},
  ) => b.part(geo, color, { at, ...o });

  // Sea and foam
  put(cyl(9, 9, 0.2, 24), "#3f8fb0", [0, 0.1, 0]);
  for (const r of [6.9, 8.0]) put(new THREE.TorusGeometry(r, 0.07, 4, 28), "#e9f6f8", [0, 0.21, 0], { rotation: [90, 0, 0] });

  // Island
  put(cyl(5.0, 6.4, 1.2, 9), mottle("#85878c", "#5c5f66", { size: 0.9 }), [0, 0.7, 0], { flat: true });
  put(cyl(4.4, 4.8, 0.45, 9), mottle("#72b255", "#4f8c3e", { size: 1.1 }), [0, 1.5, 0], { flat: true });
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + random() * 0.4;
    const r = 5.3 + random() * 1.4;
    const s = 0.4 + random() * 0.5;
    put(new THREE.IcosahedronGeometry(s, 0), i % 2 ? "#6d7077" : "#8b8e94", [Math.sin(a) * r, 0.35 + s * 0.3, Math.cos(a) * r], {
      scale: [1, 0.7, 1],
      rotation: [random() * 60, random() * 180, 0],
      flat: true,
    });
  }
  // grass tufts / bushes
  for (let i = 0; i < 6; i++) {
    const a = 2.2 + i * 0.55;
    put(new THREE.IcosahedronGeometry(0.28 + random() * 0.12, 0), "#3f7d34", [Math.sin(a) * 3.6, 1.8, Math.cos(a) * 3.6 - 0.2], { flat: true });
  }

  // Tower
  const base = 1.72;
  const H = 10;
  const rAt = (y: number) => 2.0 - (0.65 * (y - base)) / H;
  const stripes = paint((p) => (Math.floor((p.y - base) / 1.7) % 2 === 0 ? "#f4f1ea" : "#c8372d"));
  put(cyl(1.35, 2.0, H, 14), stripes, [0, base + H / 2, 0]);
  put(cyl(2.15, 2.15, 0.25, 14), "#6b6e75", [0, base + 0.12, 0]);

  // Gallery
  const gy = base + H;
  put(cyl(1.95, 1.4, 0.45, 14), "#3b3f47", [0, gy - 0.2, 0]);
  put(cyl(2.0, 2.0, 0.15, 14), "#3b3f47", [0, gy + 0.08, 0]);
  put(new THREE.TorusGeometry(1.85, 0.05, 4, 20), "#2b2e35", [0, gy + 0.65, 0], { rotation: [90, 0, 0] });
  put(new THREE.TorusGeometry(1.85, 0.04, 4, 20), "#2b2e35", [0, gy + 0.3, 0], { rotation: [90, 0, 0] });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    put(cyl(0.035, 0.035, 0.6, 5), "#2b2e35", [Math.sin(a) * 1.85, gy + 0.4, Math.cos(a) * 1.85]);
  }

  // Lantern room
  const ly = gy + 0.15;
  put(cyl(1.0, 1.0, 1.3, 8), "#ffe9a0", [0, ly + 0.65, 0]);
  put(new THREE.SphereGeometry(0.4, 8, 6), "#fff6cf", [0, ly + 0.65, 0]);
  for (let i = 0; i < 8; i++) {
    const a = ((i + 0.5) / 8) * Math.PI * 2;
    put(new THREE.BoxGeometry(0.08, 1.35, 0.08), "#2b2e35", [Math.sin(a) * 1.02, ly + 0.67, Math.cos(a) * 1.02]);
  }
  put(cyl(1.1, 1.1, 0.12, 8), "#2b2e35", [0, ly + 0.02, 0]);
  put(cyl(1.15, 1.15, 0.12, 8), "#2b2e35", [0, ly + 1.35, 0]);
  put(new THREE.ConeGeometry(1.35, 0.9, 8), "#a82e27", [0, ly + 1.86, 0]);
  put(new THREE.SphereGeometry(0.14, 6, 5), "#2b2e35", [0, ly + 2.35, 0]);
  put(cyl(0.02, 0.02, 0.5, 4), "#2b2e35", [0, ly + 2.6, 0]);

  // Door and windows
  put(new THREE.BoxGeometry(0.85, 1.4, 0.35), "#6b4226", [0, base + 0.7, 1.95]);
  put(cyl(0.425, 0.425, 0.35, 8), "#6b4226", [0, base + 1.4, 1.95], { rotation: [90, 0, 0] });
  put(new THREE.SphereGeometry(0.05, 5, 4), "#e8c65a", [0.25, base + 0.7, 2.14]);
  for (let i = 0; i < 5; i++) {
    const y = base + 2.6 + i * 1.7;
    const a = 0.6 + i * 1.25;
    const r = rAt(y);
    put(new THREE.BoxGeometry(0.4, 0.6, 0.2), "#23303d", [Math.sin(a) * (r - 0.02), y, Math.cos(a) * (r - 0.02)], { rotation: [0, (a * 180) / Math.PI, 0] });
    put(new THREE.BoxGeometry(0.5, 0.08, 0.26), "#6b6e75", [Math.sin(a) * (r + 0.0), y - 0.34, Math.cos(a) * r], { rotation: [0, (a * 180) / Math.PI, 0] });
  }

  // Cottage
  const cx = -3.1, cz = 1.0, cb = 1.72;
  put(new THREE.BoxGeometry(1.7, 1.3, 1.7), "#efe3c8", [cx, cb + 0.65, cz]);
  put(new THREE.ConeGeometry(1.3, 0.9, 4), "#8f3b2e", [cx, cb + 1.75, cz], { rotation: [0, 45, 0] });
  put(new THREE.BoxGeometry(0.3, 0.7, 0.3), "#8b6b5a", [cx - 0.4, cb + 2.0, cz - 0.3]);
  put(new THREE.BoxGeometry(0.4, 0.8, 0.1), "#6b4226", [cx + 0.3, cb + 0.4, cz + 0.88]);
  put(new THREE.BoxGeometry(0.4, 0.4, 0.1), "#6fb7d6", [cx - 0.4, cb + 0.8, cz + 0.88]);
  put(new THREE.BoxGeometry(0.5, 0.06, 0.14), "#6b4226", [cx - 0.4, cb + 0.55, cz + 0.9]);
  put(new THREE.BoxGeometry(0.1, 0.4, 0.4), "#6fb7d6", [cx + 0.88, cb + 0.8, cz]);

  // Stepping stones from door to cottage
  for (let i = 0; i < 4; i++) put(cyl(0.28, 0.3, 0.06, 6), "#a5a8ad", [-0.9 - i * 0.55, 1.75, 1.9 - i * 0.2], { flat: true });

  // Dock
  put(new THREE.BoxGeometry(1.2, 0.12, 4.0), "#8a6238", [0, 0.58, 7.2]);
  for (let i = 0; i < 8; i++) put(new THREE.BoxGeometry(1.24, 0.03, 0.04), "#5a3f22", [0, 0.65, 5.4 + i * 0.5]);
  for (const x of [-0.55, 0.55])
    for (const z of [5.4, 7.2, 9.0]) {
      put(cyl(0.07, 0.07, 0.9, 6), "#5a3f22", [x, 0.4, z]);
    }
  // lantern post on dock
  put(cyl(0.04, 0.04, 0.9, 5), "#2b2e35", [0.55, 1.1, 9.0]);
  put(new THREE.SphereGeometry(0.1, 6, 5), "#ffe9a0", [0.55, 1.62, 9.0]);

  // Little rowboat tied at dock
  put(new THREE.SphereGeometry(0.5, 8, 6), "#c8372d", [1.6, 0.28, 7.6], { scale: [0.9, 0.4, 2.0] });
  put(new THREE.BoxGeometry(0.7, 0.05, 0.12), "#8a6238", [1.6, 0.42, 7.6]);

  return b.root;
}
```