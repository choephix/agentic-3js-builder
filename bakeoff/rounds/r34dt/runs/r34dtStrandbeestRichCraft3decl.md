```ts
import * as THREE from "three";
import { createBuilder, rng, mottle, svg } from "agentic-3js-builder";

export const meta = {
  name: "Strandbeest",
  description: "Wind-walking beach creature of yellow tubes, in the style of a Theo Jansen kinetic sculpture: linkage legs, cranks, truss spine, bottle bladders and sail.",
};

const YEL = mottle("#f2c81c", "#e0b00e", { size: 0.2, seed: 3 });
const YEL2 = "#ffd83a";
const DARK = "#2a2a30";
const BOTTLE = "#bfe4ee";
const CAP = "#3b7fc4";
const SAILC = "#f4efe2";
const ROPE = "#8a6a3a";

export default function build() {
  const b = createBuilder({ name: "strandbeest" });
  const root = b.joint("root", { at: [0, 0.9, 0], role: "spine" });
  const R = rng(5);

  const rod = (a: number[], c: number[], r: number, col: any = YEL) =>
    b.rod(a, c, r, col, { bone: root, sides: 6, caps: "flat" });
  const ball = (p: number[], r: number, col: any = YEL2) =>
    b.part(new THREE.SphereGeometry(r, 6, 4), col, { bone: root, at: p });
  const P = (x: number, y: number, z: number) => [x, y, z];

  // spine and truss
  const AX_Y = 1.0;
  rod(P(0, AX_Y, -1.5), P(0, AX_Y, 1.5), 0.035);
  for (const s of [1, -1]) {
    rod(P(s * 0.5, 1.3, -1.5), P(s * 0.5, 1.3, 1.5), 0.03);
    rod(P(s * 0.5, AX_Y, -1.5), P(s * 0.5, AX_Y, 1.5), 0.028);
  }
  for (let i = 0; i < 12; i++) {
    const z0 = -1.5 + i * 0.25;
    const z1 = z0 + 0.25;
    for (const s of [1, -1]) {
      rod(P(0, AX_Y, z0), P(s * 0.5, 1.3, z1), 0.016);
      rod(P(s * 0.5, 1.3, z0), P(s * 0.5, AX_Y, z1), 0.016);
    }
    rod(P(-0.5, 1.3, z0), P(0.5, 1.3, z0), 0.016);
  }

  // legs
  const stations = 6;
  for (let k = 0; k < stations; k++) {
    const z0 = -1.2 + k * 0.48;
    rod(P(-0.78, AX_Y, z0), P(0.78, AX_Y, z0), 0.02, "#d9d9e0");
    for (const s of [1, -1]) {
      for (const lane of [0, 1]) {
        const x = s * (0.58 + lane * 0.14);
        const phi = ((k * 60 + lane * 90 + (s < 0 ? 180 : 0)) * Math.PI) / 180;
        const c = P(x, AX_Y + 0.1 * Math.sin(phi), z0 + 0.1 * Math.cos(phi));
        const pv = P(x, 1.3, z0 - 0.3);
        const kn = P(x, 0.7 + 0.08 * Math.sin(phi), z0 - 0.15 + 0.08 * Math.cos(phi));
        const fy = 0.04 + 0.14 * (0.5 + 0.5 * Math.sin(phi));
        const ft = P(x, fy, z0 + 0.12 + 0.12 * Math.cos(phi));
        const q = P(x, (kn[1] + ft[1]) / 2 + 0.06, (kn[2] + ft[2]) / 2 + 0.13);
        rod(c, [c[0], c[1], c[2]], 0.001);
        rod(P(x, AX_Y, z0), c, 0.018, YEL2);
        rod(pv, kn, 0.018);
        rod(c, kn, 0.018);
        rod(kn, ft, 0.02);
        rod(c, q, 0.016);
        rod(q, ft, 0.016);
        rod(pv, c, 0.014);
        for (const p of [c, pv, kn, q]) ball(p, 0.03);
        ball(ft, 0.04, DARK);
        // spacer from pivot to frame
        rod(P(s * 0.5, 1.3, z0 - 0.3), pv, 0.012);
      }
    }
  }

  // bottle bladders (wind catchers)
  for (let i = 0; i < 11; i++) {
    for (const [y, w] of [[1.52, 0.09], [1.72, 0.08]] as number[][]) {
      const z = -1.35 + i * 0.27 + R() * 0.01;
      b.part(new THREE.CylinderGeometry(w, w, 1.0, 8), BOTTLE, { bone: root, at: P(0, y, z), dir: [1, 0, 0] });
      for (const s of [1, -1]) {
        b.part(new THREE.CylinderGeometry(w * 0.4, w * 0.4, 0.06, 6), CAP, { bone: root, at: P(s * 0.52, y, z), dir: [s, 0, 0] });
      }
    }
    rod(P(-0.4, 1.3, -1.35 + i * 0.27), P(-0.4, 1.52, -1.35 + i * 0.27), 0.01, ROPE);
    rod(P(0.4, 1.3, -1.35 + i * 0.27), P(0.4, 1.52, -1.35 + i * 0.27), 0.01, ROPE);
  }

  // sail at the rear with stripe drawing
  const tex = svg(
    `<svg viewBox="0 0 64 48"><rect width="64" height="48" fill="#f4efe2"/>
    <path d="M0 40 L64 28 M0 28 L64 16 M0 16 L64 4" stroke="#2f6fb0" stroke-width="5" fill="none"/>
    <circle cx="32" cy="24" r="8" fill="#e0452a"/></svg>`,
    { size: 128 },
  );
  for (const d of [1, -1]) {
    b.part(new THREE.PlaneGeometry(1.1, 0.8), "#ffffff", {
      bone: root, at: P(0, 2.2, -1.45 + d * 0.004), dir: [0, 0, d], axis: "z", texture: tex,
    });
  }
  for (const s of [1, -1]) rod(P(s * 0.55, 1.75, -1.45), P(s * 0.55, 2.6, -1.45), 0.02);
  rod(P(-0.55, 2.6, -1.45), P(0.55, 2.6, -1.45), 0.02);
  rod(P(-0.55, 1.8, -1.45), P(0.55, 1.8, -1.45), 0.02);

  // front prow antenna
  rod(P(0, AX_Y, 1.5), P(0, 1.45, 1.95), 0.03);
  ball(P(0, 1.45, 1.95), 0.06, CAP);
  return b.root;
}
```