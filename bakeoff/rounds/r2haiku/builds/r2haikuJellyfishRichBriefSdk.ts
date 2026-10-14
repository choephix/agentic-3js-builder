import * as THREE from "three";
import { createBuilder, catmull } from "../../../../src/index";

export const meta = {
  name: "Moon jellyfish",
  description:
    "A drifting moon jellyfish: translucent pale-blue bell, four pink gonad horseshoes, a frilled rim of fine tentacles, and four ruffled oral arms in pearly white and lilac, with a soft glow from within.",
};

const BELL = "#a9d9f2";
const RIM = "#e9f6ff";
const GONAD = "#f06fb4";
const ARM = "#f3eefa";
const FRILL = "#c7a8ea";
const GLOW = "#fff7fd";
const FRINGE = "#dcefff";

// Horseshoe outline in its own 2D plane: a U bulging toward +y.
function horseshoe(): number[][] {
  const R = 0.03;
  const r = 0.018;
  const pts: number[][] = [];
  const n = 10;
  for (let k = 0; k <= n; k++) {
    const t = (k / n) * Math.PI;
    pts.push([R * Math.cos(t), R * Math.sin(t)]);
  }
  for (let k = n; k >= 0; k--) {
    const t = (k / n) * Math.PI;
    pts.push([r * Math.cos(t), r * Math.sin(t)]);
  }
  return pts;
}

export default function build() {
  const b = createBuilder({ name: "moon-jellyfish" });

  // Bell joint: the drifting body, held in the water.
  const bell = b.joint("bell", { at: [0, 0.6, 0] });

  // Translucent-looking dome (opaque palette colour), open underneath.
  const dome = new THREE.SphereGeometry(0.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1, 0.8, 1);
  b.part(dome, BELL, { at: [0, 0, 0], bone: bell });

  // Pale rim ring at the bell's edge.
  const brim = new THREE.TorusGeometry(0.15, 0.008, 6, 32);
  brim.rotateX(Math.PI / 2);
  b.part(brim, RIM, { at: [0, 0, 0], bone: bell });

  // Lantern core: a soft glowing bulb inside the bell.
  const core = new THREE.SphereGeometry(0.06, 14, 10);
  core.scale(1, 0.55, 1);
  b.part(core, GLOW, { at: [0, 0.02, 0], bone: bell });

  // Four pink horseshoe gonads lying on the dome, arranged radially.
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const cx = 0.04 * Math.cos(a);
    const cz = 0.04 * Math.sin(a);
    const outward: [number, number, number] = [Math.cos(a), 0, Math.sin(a)];
    const tangent: [number, number, number] = [-Math.sin(a), 0, Math.cos(a)];
    b.extrude(horseshoe(), {
      at: [cx, 0.107, cz],
      x: outward,
      y: tangent,
    });
  }

  // Frilled rim: a ring of fine, drooping tentacles around the bell edge.
  const N = 64;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const wob = 0.006 * Math.sin(i * 2.3);
    const pts = [
      [0.15 * c, -0.004, 0.15 * s],
      [(0.162 + wob) * c, -0.03, (0.162 + wob) * s],
      [(0.178 + wob) * c, -0.065, (0.178 + wob) * s],
      [(0.19 + wob * 2) * c + 0.008 * Math.cos(i), -0.1, (0.19 + wob * 2) * s + 0.008 * Math.sin(i)],
    ];
    b.sweep(catmull(pts), 0.0045, { color: FRINGE });
  }

  // Four long oral arms trailing below, ruffled along their length.
  const frillGeo = new THREE.SphereGeometry(0.028, 8, 5);
  frillGeo.scale(1, 0.25, 1);

  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const pts: number[][] = [];
    for (let k = 0; k <= 6; k++) {
      const t = k / 6;
      const y = -0.03 - 0.5 * t;
      const rr = 0.035 + 0.05 * t;
      const ang = a + 0.25 * Math.sin(t * 4 + i);
      const sway = 0.035 * t * Math.sin(t * 6.2 + i * 1.7);
      const sway2 = 0.03 * t * Math.cos(t * 5.1 + i * 0.9);
      pts.push([
        rr * Math.cos(ang) + sway,
        y,
        rr * Math.sin(ang) + sway2,
      ]);
    }

    const chain = b.chain(`arm${i}`, pts, { role: "tentacle" });
    b.sweep(chain, 0.016, { color: ARM });

    b.along(chain, 12, (at) => {
      b.stick(frillGeo, i % 2 === 0 ? FRILL : ARM, at);
    });
  }

  return b.root;
}
